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
const SESSION_EXPIRY_KEY = 'cargo-core:driver-session-expiry'
const SESSION_DURATION_MS = 12 * 60 * 60 * 1000 // 12 hours — full shift

// FastAPI validation errors return detail as an array of {loc, msg, type} objects.
// This helper always returns a plain string regardless of the shape of the error body.
function extractErrorMessage(error, fallback = 'Request failed') {
    if (!error) return fallback
    const detail = error.detail ?? error.message ?? null
    if (!detail) return fallback
    if (Array.isArray(detail)) {
        return detail.map((e) => e.msg || JSON.stringify(e)).join('; ') || fallback
    }
    return String(detail) || fallback
}

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

async function fetchWithNetworkHelp(path, options, timeoutMs = 10000) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)
    try {
        return await fetch(`${API_BASE}${path}`, { ...options, signal: controller.signal })
    } catch (error) {
        if (error?.name === 'AbortError') {
            throw new Error(`Request timed out after ${timeoutMs / 1000}s. Check your connection.`)
        }
        if (isProbablyNetworkError(error)) {
            throw new Error(buildNetworkErrorMessage())
        }
        throw error
    } finally {
        clearTimeout(timer)
    }
}

function readStoredToken() {
    try {
        const expiry = parseInt(window.localStorage.getItem(SESSION_EXPIRY_KEY) || '0', 10)
        if (expiry && Date.now() > expiry) {
            window.localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY)
            window.localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY)
            window.localStorage.removeItem(SESSION_EXPIRY_KEY)
            return null
        }
        return window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY)
    } catch {
        return null
    }
}

function writeStoredToken(token) {
    try {
        window.localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, token)
        window.localStorage.setItem(SESSION_EXPIRY_KEY, String(Date.now() + SESSION_DURATION_MS))
    } catch {
        // Ignore storage failures on constrained devices.
    }
}

function removeStoredToken() {
    try {
        window.localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY)
        window.localStorage.removeItem(SESSION_EXPIRY_KEY)
    } catch {
        // Ignore storage failures on constrained devices.
    }
}

const REFRESH_TOKEN_STORAGE_KEY = 'cargo-core:driver-refresh-token'

function readStoredRefreshToken() {
    try { return window.localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY) } catch { return null }
}
function writeStoredRefreshToken(token) {
    try { window.localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, token) } catch {}
}
function removeStoredRefreshToken() {
    try { window.localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY) } catch {}
}

// Store token in memory, but hydrate from local storage so native activity restarts
// do not force a relogin.
let accessToken = readStoredToken()
let refreshToken = readStoredRefreshToken()

export function setAccessToken(token) {
    accessToken = token
    if (token) { writeStoredToken(token) } else { removeStoredToken() }
}

export function setRefreshToken(token) {
    refreshToken = token
    if (token) { writeStoredRefreshToken(token) } else { removeStoredRefreshToken() }
}

export function getAccessToken() { return accessToken }

export function clearAccessToken() {
    accessToken = null
    refreshToken = null
    removeStoredToken()
    removeStoredRefreshToken()
}

function authHeaders() {
    return accessToken ? { Authorization: `Bearer ${accessToken}` } : {}
}

// Auto-refresh access token when a 401 is received
let _isRefreshing = false
async function tryRefreshToken() {
    if (!refreshToken || _isRefreshing) return false
    _isRefreshing = true
    try {
        const res = await fetch(`${API_BASE}/api/v1/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh_token: refreshToken }),
        })
        if (!res.ok) return false
        const data = await res.json()
        setAccessToken(data.access_token)
        if (data.refresh_token) setRefreshToken(data.refresh_token)
        return true
    } catch {
        return false
    } finally {
        _isRefreshing = false
    }
}

async function fetchWithAuth(path, options, timeoutMs = 10000) {
    let res = await fetchWithNetworkHelp(path, { ...options, ...{ headers: { ...options?.headers, ...authHeaders() } } }, timeoutMs)
    if (res.status === 401) {
        const refreshed = await tryRefreshToken()
        if (refreshed) {
            res = await fetchWithNetworkHelp(path, { ...options, ...{ headers: { ...options?.headers, ...authHeaders() } } }, timeoutMs)
        }
    }
    return res
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
        throw new Error(extractErrorMessage(error, 'Authentication failed'))
    }

    const data = await res.json()

    const role = data.user?.role

    // Verify the user is a driver
    if (role !== 'DRIVER' && role !== 'driver') {
        throw new Error('Access denied. This is a driver-only application.')
    }

    setAccessToken(data.access_token)
    if (data.refresh_token) setRefreshToken(data.refresh_token)
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
        throw new Error(extractErrorMessage(error, 'Failed to bind vehicle'))
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
        throw new Error(extractErrorMessage(error, 'Failed to check in crew member'))
    }
    return await res.json()
}

export async function getAssignedOrders() {
    const fetchByStatus = async (statusFilter) => {
        const res = await fetchWithNetworkHelp(
            `/api/v1/orders?status_filter=${statusFilter}&page_size=100`,
            { headers: { 'Content-Type': 'application/json', ...authHeaders() } }
        )
        if (!res.ok) return []
        const payload = await res.json()
        return Array.isArray(payload) ? payload : (payload.items || [])
    }

    try {
        const [assigned, inTransit] = await Promise.all([
            fetchByStatus('ASSIGNED'),
            fetchByStatus('IN_TRANSIT'),
        ])
        return [...assigned, ...inTransit]
    } catch (err) {
        console.error('Failed to fetch assigned orders', err)
        return []
    }
}

export async function getCompletedOrders() {
    try {
        const res = await fetchWithNetworkHelp(
            `/api/v1/orders?status_filter=DELIVERED&page_size=50`,
            { headers: { 'Content-Type': 'application/json', ...authHeaders() } }
        )
        if (!res.ok) return []
        const payload = await res.json()
        return Array.isArray(payload) ? payload : (payload.items || [])
    } catch {
        return []
    }
}

export async function getTripIntelligence(orderId) {
    const res = await fetchWithAuth(`/api/v1/orders/${orderId}/trip-intelligence`, {
        headers: { 'Content-Type': 'application/json' },
    })

    if (!res.ok) {
        const error = await res.json().catch(() => ({ detail: 'Failed to load trip intelligence' }))
        throw new Error(extractErrorMessage(error, 'Failed to load trip intelligence'))
    }
    return await res.json()
}

export async function reportTripDeviation(orderId, payload) {
    const res = await fetchWithAuth(`/api/v1/orders/${orderId}/trip-intelligence/deviation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    })

    if (!res.ok) {
        const error = await res.json().catch(() => ({ detail: 'Failed to report deviation' }))
        throw new Error(extractErrorMessage(error, 'Failed to report deviation'))
    }
    return await res.json()
}

export async function completeReturn(orderId) {
    const res = await fetchWithNetworkHelp(`/api/v1/orders/${orderId}/complete-return`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
    })
    if (!res.ok) throw new Error('Failed to complete return order')
    return await res.json()
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
        throw new Error(extractErrorMessage(error, 'Failed to send delivery OTP'))
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
        throw new Error(extractErrorMessage(error, 'Failed to upload proof of delivery'))
    }
    return await res.json()
}

export async function getOrderItems(orderId) {
    try {
        const res = await fetchWithAuth(`/api/v1/orders/${orderId}/items`)
        if (!res.ok) return []
        return await res.json()
    } catch {
        return []
    }
}

export async function submitPackingReturn(orderId, payload) {
    try {
        const res = await fetchWithAuth(`/api/v1/orders/${orderId}/packing-return`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        })
        return res.ok
    } catch {
        return false
    }
}

export async function submitHouseShiftSignoff(orderId, signatureData, customerName = null, notes = null) {
    const res = await fetchWithNetworkHelp(`/api/v1/orders/${orderId}/house-shift-signoff`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({
            signature_data: signatureData,
            customer_name: customerName,
            notes,
        })
    })

    if (!res.ok) {
        const error = await res.json().catch(() => ({ detail: 'Failed to submit house-shift sign-off' }))
        throw new Error(extractErrorMessage(error, 'Failed to submit house-shift sign-off'))
    }
    return await res.json()
}

export async function submitJobRating(orderId, rating, feedback = null) {
    const res = await fetchWithNetworkHelp(`/api/v1/orders/${orderId}/job-rating`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ rating, feedback })
    })

    if (!res.ok) {
        const error = await res.json().catch(() => ({ detail: 'Failed to submit job rating' }))
        throw new Error(extractErrorMessage(error, 'Failed to submit job rating'))
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

export async function returnVehicle({ odometerKm = null, fuelLevelPct = null, notes = null, conditionPhoto = null } = {}) {
    const res = await fetchWithNetworkHelp('/api/v1/logistics/drivers/me/return-vehicle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({
            odometer_km: odometerKm,
            fuel_level_pct: fuelLevelPct,
            notes: notes || null,
            condition_photo: conditionPhoto || null,
        }),
    })
    if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.detail || 'Failed to return vehicle')
    }
    return await res.json()
}

// ── Fuel Receipt ───────────────────────────────────────────────────────────────

export async function submitFuelReceipt({ amount, liters, station, photoBase64 = null }) {
    const res = await fetchWithNetworkHelp('/api/v1/logistics/drivers/me/fuel-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({
            amount: parseFloat(amount),
            liters: parseFloat(liters),
            station: station || '',
            photo_base64: photoBase64,
        })
    })
    if (!res.ok) {
        const error = await res.json().catch(() => ({ detail: 'Failed to submit fuel receipt' }))
        throw new Error(extractErrorMessage(error, 'Failed to submit fuel receipt'))
    }
    return await res.json()
}

// ── Dispatch Chat ──────────────────────────────────────────────────────────────

export async function getDispatchThread() {
    const res = await fetchWithAuth('/api/v1/logistics/drivers/me/dispatch-thread', {
        headers: { 'Content-Type': 'application/json' }
    })
    if (!res.ok) throw new Error(`Failed to load dispatch thread (${res.status})`)
    return await res.json()
}

export async function sendDispatchMessage(text) {
    const res = await fetchWithAuth('/api/v1/logistics/drivers/me/dispatch-thread/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
    })
    if (!res.ok) {
        const error = await res.json().catch(() => ({ detail: `Server error ${res.status}` }))
        throw new Error(extractErrorMessage(error, `Failed to send (${res.status})`))
    }
    return await res.json()
}

export async function getManagerThread() {
    const res = await fetchWithAuth('/api/v1/logistics/drivers/me/manager-thread', {
        headers: { 'Content-Type': 'application/json' }
    })
    if (!res.ok) throw new Error(`Failed to load manager thread (${res.status})`)
    return await res.json()
}

export async function sendManagerMessage(text) {
    const res = await fetchWithAuth('/api/v1/logistics/drivers/me/manager-thread/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
    })
    if (!res.ok) {
        const error = await res.json().catch(() => ({ detail: `Server error ${res.status}` }))
        throw new Error(extractErrorMessage(error, `Failed to send (${res.status})`))
    }
    return await res.json()
}

// ── Audit Log ──────────────────────────────────────────────────────────────────

export async function getDriverAuditLog() {
    const res = await fetchWithNetworkHelp('/api/v1/logistics/drivers/me/audit', {
        headers: { 'Content-Type': 'application/json', ...authHeaders() }
    })
    if (!res.ok) throw new Error('Failed to fetch audit log')
    return await res.json()
}

// ── Cashout ────────────────────────────────────────────────────────────────────

export async function requestCashout(amount) {
    const res = await fetchWithNetworkHelp('/api/v1/logistics/drivers/me/cashout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ amount: parseFloat(amount) })
    })
    if (!res.ok) {
        const error = await res.json().catch(() => ({ detail: 'Failed to request cashout' }))
        throw new Error(extractErrorMessage(error, 'Failed to request cashout'))
    }
    return await res.json()
}

// ── Driver Notifications ───────────────────────────────────────────────────────

export async function getDriverNotifications() {
    const res = await fetchWithAuth('/api/v1/logistics/drivers/me/notifications', {
        headers: { 'Content-Type': 'application/json' }
    })
    if (!res.ok) return []
    return await res.json()
}

// ── Crisis Alert ───────────────────────────────────────────────────────────────

export async function sendCrisisAlert({ type, latitude, longitude, description }) {
    const res = await fetchWithAuth('/api/v1/logistics/drivers/me/crisis-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            type,
            latitude,
            longitude,
            description
        })
    })
    if (!res.ok) {
        const error = await res.json().catch(() => ({ detail: 'Failed to send crisis alert' }))
        throw new Error(extractErrorMessage(error, 'Failed to send crisis alert'))
    }
    return await res.json()
}
