// API Service for Driver App - connects to Cargo-Core backend
import { Capacitor } from '@capacitor/core'

function trimTrailingSlash(url) {
    return url.replace(/\/+$/, '')
}

function resolveApiBase() {
    const configured = trimTrailingSlash(
        import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
    )

    if (!Capacitor.isNativePlatform()) {
        return configured
    }

    const androidOverride = import.meta.env.VITE_API_BASE_URL_ANDROID
    if (androidOverride) {
        return trimTrailingSlash(androidOverride)
    }

    try {
        const parsed = new URL(configured)
        if (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1') {
            parsed.hostname = '10.0.2.2'
            return trimTrailingSlash(parsed.toString())
        }
    } catch {
        // Keep the configured value if parsing fails.
    }

    return configured
}

const API_BASE = resolveApiBase()
const ACCESS_TOKEN_STORAGE_KEY = 'cargo-core:driver-access-token'

function isProbablyNetworkError(error) {
    const message = String(error?.message || error || '')
    return /failed to fetch|networkerror|load failed/i.test(message)
}

function buildNetworkErrorMessage() {
    const baseMessage = `Unable to reach backend at ${API_BASE}.`

    if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android') {
        return `${baseMessage} On a real Android phone, run "adb reverse tcp:8000 tcp:8000" or set VITE_API_BASE_URL_ANDROID to "http://<your-computer-ip>:8000" and start the backend with "--host 0.0.0.0".`
    }

    return `${baseMessage} Check that the backend is running and the API URL is correct.`
}

async function fetchWithNetworkHelp(path, options) {
    try {
        return await fetch(`${API_BASE}${path}`, options)
    } catch (error) {
        if (isProbablyNetworkError(error)) {
            throw new Error(buildNetworkErrorMessage())
        }
        throw error
    }
}

function readStoredToken() {
    try {
        return window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY)
    } catch {
        return null
    }
}

function writeStoredToken(token) {
    try {
        window.localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, token)
    } catch {
        // Ignore storage failures on constrained devices.
    }
}

function removeStoredToken() {
    try {
        window.localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY)
    } catch {
        // Ignore storage failures on constrained devices.
    }
}

// Store token in memory, but hydrate from local storage so native activity restarts
// do not force a relogin.
let accessToken = readStoredToken()

export function setAccessToken(token) {
    accessToken = token
    if (token) {
        writeStoredToken(token)
    } else {
        removeStoredToken()
    }
}

export function getAccessToken() {
    return accessToken
}

export function clearAccessToken() {
    accessToken = null
    removeStoredToken()
}

function authHeaders() {
    return accessToken ? { Authorization: `Bearer ${accessToken}` } : {}
}

function normalizeVehiclePayload(v) {
    if (!v) return null
    return {
        id: v.id,
        vehicleId: v.code,
        vehicleCode: v.code,
        plateNumber: v.license_plate || v.code,
        status: v.status,
        model: v.model,
        type: v.type || v.vehicle_type,
        fuelLevel: v.fuel_level_pct ?? 0,
        capacity: v.cargo_capacity_tons ?? 0,
        range: v.range_km ?? 0,
        seats: v.seat_capacity ?? 0,
        odometer: v.mileage || 0,
        telemetryStatus: v.telemetry_status || 'READY',
        telemetryLastSeen: v.telemetry_last_seen || null,
        nextService: v.next_service || null,
        maintenanceIssue: v.maintenance_issue || null,
        fuelEfficiency: v.fuel_efficiency || null,
    }
}

// ── Authentication ─────────────────────────────────────────────────────────

export async function loginDriver(username, password) {
    const res = await fetchWithNetworkHelp('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: username,
            password
        })
    })

    if (!res.ok) {
        const error = await res.json().catch(() => ({ detail: 'Login failed' }))
        throw new Error(error.detail || error.message || 'Authentication failed')
    }

    const data = await res.json()

    const role = data.user?.role

    // Verify the user is a driver
    if (role !== 'DRIVER' && role !== 'driver') {
        throw new Error('Access denied. This is a driver-only application.')
    }

    setAccessToken(data.access_token)
    return data
}

export async function getDriverProfile() {
    const res = await fetchWithNetworkHelp('/api/v1/auth/me', {
        headers: { 'Content-Type': 'application/json', ...authHeaders() }
    })

    if (!res.ok) throw new Error('Failed to fetch driver profile')
    return await res.json()
}

// ── Driver Operations ──────────────────────────────────────────────────────

export async function getDriverVehicles() {
    const res = await fetchWithNetworkHelp('/api/v1/logistics/vehicles', {
        headers: { 'Content-Type': 'application/json', ...authHeaders() }
    })
    
    if (!res.ok) {
        console.error('Failed to fetch vehicles')
        return []
    }
    
    const vehicles = await res.json()
    return vehicles.map(normalizeVehiclePayload)
}

export async function getDriverDashboard() {
    const res = await fetchWithNetworkHelp('/api/v1/logistics/drivers/me/dashboard', {
        headers: { 'Content-Type': 'application/json', ...authHeaders() }
    })

    if (!res.ok) throw new Error('Failed to fetch driver dashboard')
    const payload = await res.json()

    return {
        ...payload,
        current_vehicle: normalizeVehiclePayload(payload.current_vehicle),
    }
}

export async function bindDriverVehicle({ vehicleId = null, vehicleCode = null } = {}) {
    const res = await fetchWithNetworkHelp('/api/v1/logistics/drivers/me/bind-vehicle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({
            vehicle_id: vehicleId,
            vehicle_code: vehicleCode,
        })
    })

    if (!res.ok) {
        const error = await res.json().catch(() => ({ detail: 'Failed to bind vehicle' }))
        throw new Error(error.detail || 'Failed to bind vehicle')
    }
    return normalizeVehiclePayload(await res.json())
}

export async function checkInCrewMember(labourerId) {
    const res = await fetchWithNetworkHelp(`/api/v1/logistics/drivers/me/crew/${labourerId}/check-in`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() }
    })

    if (!res.ok) {
        const error = await res.json().catch(() => ({ detail: 'Failed to check in crew member' }))
        throw new Error(error.detail || 'Failed to check in crew member')
    }
    return await res.json()
}

export async function getAssignedOrders() {
    const query = new URLSearchParams({
        page: '1',
        page_size: '100'
    })

    const res = await fetchWithNetworkHelp(`/api/v1/orders?${query.toString()}`, {
        headers: { 'Content-Type': 'application/json', ...authHeaders() }
    })

    if (!res.ok) {
        console.error('Failed to fetch assigned orders')
        return []
    }
    const payload = await res.json()
    const orders = Array.isArray(payload) ? payload : (payload.items || [])
    return orders.filter(order => {
        const status = String(order.status || '').toUpperCase()
        return !['DRAFT', 'DELIVERED', 'COMPLETED', 'CANCELLED', 'CLOSED'].includes(status)
    })
}

export async function updateOrderStatus(orderId, status, notes = null) {
    const body = { next_status: status }
    if (notes) body.notes = notes

    const res = await fetchWithNetworkHelp(`/api/v1/orders/${orderId}/transition`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(body)
    })

    if (!res.ok) throw new Error('Failed to update order status')
    return await res.json()
}

export async function sendDeliveryOtp(orderId, forceResend = false) {
    const res = await fetchWithNetworkHelp(`/api/v1/orders/${orderId}/delivery-otp/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ force_resend: forceResend }),
    })

    if (!res.ok) {
        const error = await res.json().catch(() => ({ detail: 'Failed to send delivery OTP' }))
        throw new Error(error.detail || 'Failed to send delivery OTP')
    }
    return await res.json()
}

export async function uploadProofOfDelivery(orderId, imagesBase64 = [], signature = null, otpCode = null, customerName = null, notes = null) {
    const body = {
        otp_code: otpCode,
        images_data: imagesBase64,
        signature_data: signature,
        customer_name: customerName,
        notes,
    }

    const res = await fetchWithNetworkHelp(`/api/v1/orders/${orderId}/proof-of-delivery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(body)
    })

    if (!res.ok) {
        const error = await res.json().catch(() => ({ detail: 'Failed to upload proof of delivery' }))
        throw new Error(error.detail || error.message || 'Failed to upload proof of delivery')
    }
    return await res.json()
}

// ── Location Tracking ──────────────────────────────────────────────────────

export async function updateDriverLocation(latitude, longitude) {
    const body = {
        latitude,
        longitude,
        timestamp: new Date().toISOString()
    }

    const res = await fetchWithNetworkHelp('/api/v1/logistics/drivers/me/location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(body)
    })

    // Location updates are fire-and-forget, don't throw errors
    return res.ok
}

// ── Shift Management ───────────────────────────────────────────────────────

export async function startShift() {
    const res = await fetchWithNetworkHelp('/api/v1/logistics/drivers/me/shift/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() }
    })

    if (!res.ok) throw new Error('Failed to start shift')
    return await res.json()
}

export async function endShift() {
    const res = await fetchWithNetworkHelp('/api/v1/logistics/drivers/me/shift/end', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() }
    })

    if (!res.ok) throw new Error('Failed to end shift')
    return await res.json()
}
