import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { useLogisticStore } from '@/stores/logisticStore'
import { getStoredAccessToken } from '@/config/api'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

function authHeaders() {
    const token = getStoredAccessToken()
    return token ? { Authorization: `Bearer ${token}` } : {}
}

function driverStatusColor(status) {
    if (!status) return 'bg-gray-500'
    const s = status.toLowerCase()
    if (s === 'active' || s === 'on route' || s === 'on_route') return 'bg-green-500'
    if (s === 'idle' || s === 'on break' || s === 'on_break') return 'bg-yellow-500'
    return 'bg-gray-500'
}

function generateAvatar(name, id) {
    const seed = encodeURIComponent(name || id || 'driver')
    return `https://api.dicebear.com/7.x/initials/svg?seed=${seed}&backgroundColor=374151&textColor=ffffff`
}

export const useDispatcherStore = defineStore('dispatcher', () => {
    const ls = useLogisticStore()

    // Pending orders fetched from backend
    const pendingOrders = ref([])
    const ordersLoading = ref(false)

    // Active orders (ASSIGNED / IN_TRANSIT) for Order Status Control
    const activeOrders = ref([])
    const activeOrdersLoading = ref(false)

    // Drivers fetched directly — dispatcher has access to /logistics/drivers
    const _drivers = ref([])
    const driversLoading = ref(false)

    let _pollInterval = null

    function normalizeDriver(d) {
        return {
            id: String(d.id || ''),
            hubId: String(d.hub_id || ''),
            name: d.name || '',
            status: d.status || 'Active',
            location: d.location || d.current_location || '',
            vehicle: d.vehicle || '',
            efficiency: d.efficiency ?? d.efficiency_score ?? 0,
            rating: d.rating ?? 0,
            safetyIncidents: d.safety_incidents ?? d.safetyIncidents ?? 0,
            fuelEfficiencyScore: d.fuel_efficiency_score ?? d.fuelEfficiencyScore ?? 0,
            avgSpeed: Number(d.avg_speed ?? d.avgSpeed ?? 0) || 0,
            phone: d.phone || '',
            currentJob: d.current_job ?? d.currentJob ?? '',
            avatarColor: d.avatar_color ?? d.avatarColor ?? 'bg-gray-700',
            chatHistory: d.chat_history ?? d.chatHistory ?? [],
        }
    }

    async function fetchDrivers() {
        driversLoading.value = true
        try {
            const res = await fetch(`${API_BASE}/api/v1/logistics/drivers`, {
                headers: { 'Content-Type': 'application/json', ...authHeaders() },
            })
            if (res.ok) {
                const data = await res.json()
                _drivers.value = (Array.isArray(data) ? data : []).map(normalizeDriver)
            }
        } catch (_) {
        } finally {
            driversLoading.value = false
        }
    }

    async function initialize() {
        try {
            await ls.initialize()
        } catch (_) {
            // /logistics/bootstrap requires LOGISTIC_MANAGER role — skip gracefully for DISPATCHER
        }
        await Promise.all([fetchOrders(), fetchDrivers(), fetchActiveOrders()])
        // React to warehouse marking orders ready (same-tab event)
        if (typeof window !== 'undefined') {
            window.removeEventListener('warehouse-orders-updated', fetchOrders)
            window.addEventListener('warehouse-orders-updated', fetchOrders)
        }
        // Poll every 30 seconds to pick up cross-tab/cross-user updates
        if (!_pollInterval) {
            _pollInterval = setInterval(() => fetchOrders().catch(() => {}), 30_000)
        }
    }

    const READY_STATUSES = ['QC_PASSED', 'READY_FOR_DISPATCH', 'DISPATCHED', 'qc_passed', 'ready_for_dispatch', 'dispatched']
    const LOADING_STATUSES = ['ON_DOCK', 'on_dock']

    function resolveDriverName(driverId) {
        if (!driverId) return null
        const id = String(driverId)
        // Check filtered drivers first, then all drivers from logistic store
        const driver = ls.filteredDrivers.find(d => d.id === id)
        return driver ? driver.name : null
    }

    function resolveVehicleCode(vehicleId) {
        if (!vehicleId) return null
        const id = String(vehicleId)
        const vehicle = ls.filteredVehicles.find(v => v.id === id)
        if (vehicle) return vehicle.code || vehicle.licensePlate || vehicle.model || null
        return null
    }

    function mapOrder(o) {
        const substatus = o.warehouse_substatus || ''
        // Prefer server-resolved names, fall back to local store lookup
        const driverName = o.assigned_driver_name || resolveDriverName(o.assigned_driver_id)
        const vehicleCode = o.assigned_vehicle_code || resolveVehicleCode(o.assigned_vehicle_id)
        return {
            id: String(o.id || ''),
            trackingCode: o.tracking_code || '',
            warehouse: o.pickup_addr || o.warehouse_id || 'Hub',
            weight: o.weight || o.total_weight || 0,
            volume: o.volume || o.total_volume || 0,
            laborCount: o.labor_count || 0,
            priority: o.priority || 'NORMAL',
            deadline: o.scheduled_at || o.delivery_deadline || '',
            specialInstructions: o.notes || o.special_instructions || '',
            feasibility: o.feasibility || 'unchecked',
            failReason: o.fail_reason || '',
            selected: false,
            // warehouse readiness
            warehouseSubstatus: substatus,
            readyForDispatch: READY_STATUSES.includes(substatus),
            loadingInProgress: LOADING_STATUSES.includes(substatus),
            // for OrderStatusControl
            status: o.status || 'CONFIRMED',
            statusLabel: o.status || 'Confirmed',
            driver: driverName || (o.assigned_driver_id ? 'Driver ' + String(o.assigned_driver_id).slice(0, 6) : 'Unassigned'),
            driverId: o.assigned_driver_id ? String(o.assigned_driver_id) : null,
            vehicle: vehicleCode || (o.assigned_vehicle_id ? 'Vehicle ' + String(o.assigned_vehicle_id).slice(0, 6) : '—'),
            vehicleId: o.assigned_vehicle_id ? String(o.assigned_vehicle_id) : null,
            eta: o.scheduled_at || '—',
            etaOverdue: false,
            slaStatus: 'On Track',
            slaClass: 'text-green-400',
            lastUpdated: o.created_at || '—',
            type: o.order_type || o.cargo_type || 'Standard',
            hub: o.pickup_addr || '',
            cargoType: o.cargo_type || '',
            vehicleType: o.vehicle_type || '',
            totalAmount: o.total_amount || 0,
            warehouseId: o.warehouse_id || null,
        }
    }

    async function fetchOrders() {
        ordersLoading.value = true
        try {
            const res = await fetch(`${API_BASE}/api/v1/orders?status_filter=CONFIRMED&page_size=100`, {
                headers: { 'Content-Type': 'application/json', ...authHeaders() },
            })
            if (res.ok) {
                const data = await res.json()
                const items = Array.isArray(data) ? data : (data.items || data.orders || [])
                pendingOrders.value = items.map(mapOrder)
            }
        } catch (_) {
        } finally {
            ordersLoading.value = false
        }
    }

    async function fetchActiveOrders() {
        activeOrdersLoading.value = true
        try {
            const [cRes, aRes, tRes, dRes] = await Promise.all([
                fetch(`${API_BASE}/api/v1/orders?status_filter=CONFIRMED&page_size=100`, { headers: { 'Content-Type': 'application/json', ...authHeaders() } }),
                fetch(`${API_BASE}/api/v1/orders?status_filter=ASSIGNED&page_size=100`, { headers: { 'Content-Type': 'application/json', ...authHeaders() } }),
                fetch(`${API_BASE}/api/v1/orders?status_filter=IN_TRANSIT&page_size=100`, { headers: { 'Content-Type': 'application/json', ...authHeaders() } }),
                fetch(`${API_BASE}/api/v1/orders?status_filter=DELIVERED&page_size=100`, { headers: { 'Content-Type': 'application/json', ...authHeaders() } }),
            ])
            const confirmed = cRes.ok ? (await cRes.json()) : []
            const assigned = aRes.ok ? (await aRes.json()) : []
            const inTransit = tRes.ok ? (await tRes.json()) : []
            const delivered = dRes.ok ? (await dRes.json()) : []
            const confirmedItems = Array.isArray(confirmed) ? confirmed : (confirmed.items || [])
            const assignedItems = Array.isArray(assigned) ? assigned : (assigned.items || [])
            const inTransitItems = Array.isArray(inTransit) ? inTransit : (inTransit.items || [])
            const deliveredItems = Array.isArray(delivered) ? delivered : (delivered.items || [])
            activeOrders.value = [...confirmedItems, ...assignedItems, ...inTransitItems, ...deliveredItems].map(o => mapOrder(o))
        } catch (_) {
        } finally {
            activeOrdersLoading.value = false
        }
    }

    // ── Dispatcher-shaped drivers ──────────────────────────────────────────
    // Use directly fetched drivers (_drivers) so DISPATCHER role works without bootstrap access
    const dispatcherDrivers = computed(() => {
        const source = _drivers.value.length > 0 ? _drivers.value : ls.filteredDrivers
        return source.map((d) => {
            const assignedCount = activeOrders.value.filter(o => o.driverId === String(d.id)).length
            return {
            ...d,
            avatar: generateAvatar(d.name, d.id),
            statusColor: driverStatusColor(d.status),
            load: d.efficiency ?? 0,
            hours: d.avgSpeed ? parseFloat((d.avgSpeed / 10).toFixed(1)) : 8,
            maxHours: 10,
            stops: assignedCount,
            authorized: d.status !== 'Suspended',
            licenseValid: true,
            suspended: d.status === 'Suspended',
            maintenance: d.status === 'Maintenance',
            breakDue: d.safetyIncidents > 0,
            breakDueIn: '1.5h',
            statusClass: driverStatusColor(d.status) === 'bg-green-500'
                ? 'bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 border-green-300 dark:border-green-500/20'
                : driverStatusColor(d.status) === 'bg-yellow-500'
                ? 'bg-yellow-100 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-300 dark:border-yellow-500/20'
                : 'bg-gray-100 dark:bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-500/20',
        }}
        )
    })

    const slaProjection = computed(() => {
        const moving = activeOrders.value.filter(o =>
            o.status === 'IN_TRANSIT' || o.status === 'ASSIGNED' || o.status === 'DELIVERED'
        ).length
        const pending = pendingOrders.value.length
        const total = moving + pending
        if (!total) return { pct: 100, delta: 8 }
        const pct = Math.min(100, Math.round((moving / total) * 100))
        return { pct, delta: pct - 92 }
    })

    // ── Communication contacts from chats + drivers ───────────────────────
    const dispatcherContacts = computed(() => {
        const chatContacts = ls.filteredChats.map(c => ({
            id: c.id,
            name: c.name,
            type: 'driver',
            online: c.status === 'online',
            lastMessage: c.lastMessage || '',
            avatar: generateAvatar(c.name, c.id),
            status: c.status || 'offline',
            phone: c.phone || '',
            unread: c.muted ? 0 : 1,
            messages: (c.messages || []).map(m => ({
                id: m.id || Date.now(),
                from: m.sender || m.from || 'driver',
                text: m.text || m.content || '',
                time: m.time || '',
                type: 'text',
            })),
        }))
        if (chatContacts.length > 0) return chatContacts
        // fallback to driver list if no chats loaded
        return ls.filteredDrivers.slice(0, 5).map(d => ({
            id: d.id,
            name: d.name,
            type: 'driver',
            online: d.status === 'Active' || d.status === 'On Route',
            lastMessage: d.currentJob || 'No recent messages',
            avatar: generateAvatar(d.name, d.id),
            status: d.status || 'offline',
            phone: d.phone || '',
            unread: 0,
            messages: (d.chatHistory || []).map((m, mi) => ({
                id: m.id || mi,
                from: m.sender || 'driver',
                text: m.text || '',
                time: m.time || '',
                type: 'text',
            })),
        }))
    })

    // ── Crisis/disruptions from alerts ────────────────────────────────────
    const activeCrises = computed(() =>
        ls.alerts
            .filter(a => a.severity === 'high' || a.severity === 'critical')
            .map(a => ({
                id: a.id,
                level: a.severity === 'critical' ? 'CRITICAL' : 'HIGH',
                title: a.title,
                timeAgo: a.timestamp || 'Recent',
                description: a.description || '',
                affectedOrders: a.impact || 0,
                actions: ['Reroute', 'Notify Drivers', 'Escalate'],
                driver: a.location || '',
            }))
    )

    const disruptions = computed(() =>
        ls.alerts
            .filter(a => a.severity !== 'high' && a.severity !== 'critical')
            .map(a => ({
                id: a.id,
                severity: a.severity || 'medium',
                icon: a.icon || 'warning',
                title: a.title,
                detail: a.description || a.recommendation || '',
                affected: 0,
                rerouted: false,
                etaUpdated: false,
            }))
    )

    // ── Pass-throughs from logisticStore ──────────────────────────────────
    const isLoading = computed(() => ls.isLoading || ordersLoading.value)
    const dashboardStats = computed(() => ls.dashboardStats)
    const hubs = computed(() => ls.hubs)
    const filteredVehicles = computed(() => ls.filteredVehicles)
    const filteredChats = computed(() => ls.filteredChats)
    const filteredEscalations = computed(() => ls.filteredEscalations)
    const filteredZones = computed(() => ls.filteredZones)
    const notifications = computed(() => ls.notifications)
    const unreadNotificationsCount = computed(() => ls.unreadNotificationsCount)

    async function fetchClusters(radiusKm = 5.0) {
        try {
            const res = await fetch(`${API_BASE}/api/v1/orders/cluster?radius_km=${radiusKm}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...authHeaders() },
            })
            if (res.ok) return await res.json()
            return { clusters: [], unbatched: [], total_orders: 0, estimated_miles_saved_pct: 0, avg_efficiency_pct: 0 }
        } catch (_) {
            return { clusters: [], unbatched: [], total_orders: 0, estimated_miles_saved_pct: 0, avg_efficiency_pct: 0 }
        }
    }

    async function assignOrder(orderId, driverId, vehicleId = null) {
        const body = { driver_id: driverId }
        if (vehicleId) body.vehicle_id = vehicleId
        try {
            const res = await fetch(`${API_BASE}/api/v1/orders/${orderId}/assign`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...authHeaders() },
                body: JSON.stringify(body),
            })
            if (res.ok) {
                await fetchOrders()
                await fetchActiveOrders()
            }
            return res.ok
        } catch (_) {
            return false
        }
    }

    async function batchAssignOrders(assignments) {
        const res = await fetch(`${API_BASE}/api/v1/orders/batch-assign`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...authHeaders() },
            body: JSON.stringify({ assignments }),
        })
        if (!res.ok) throw new Error('Batch assign failed')
        await fetchOrders()
        return await res.json()
    }

    async function askAi(query) {
        return ls.askAi(query)
    }

    async function sendMessageToDriver(driverId, text) {
        return ls.sendMessageToDriver(driverId, text)
    }

    async function resolveAlert(id) {
        return ls.resolveAlert(id)
    }

    function markNotificationRead(id) { return ls.markNotificationRead(id) }
    function markAllNotificationsRead() { return ls.markAllNotificationsRead() }
    function clearNotifications() { return ls.clearNotifications() }

    return {
        // State
        pendingOrders,
        activeOrders,
        ordersLoading,
        activeOrdersLoading,
        isLoading,
        // Computed
        dispatcherDrivers,
        slaProjection,
        dispatcherContacts,
        activeCrises,
        disruptions,
        dashboardStats,
        hubs,
        filteredVehicles,
        filteredChats,
        filteredEscalations,
        filteredZones,
        notifications,
        unreadNotificationsCount,
        // Actions
        initialize,
        fetchOrders,
        fetchDrivers,
        fetchActiveOrders,
        fetchClusters,
        assignOrder,
        batchAssignOrders,
        askAi,
        sendMessageToDriver,
        resolveAlert,
        markNotificationRead,
        markAllNotificationsRead,
        clearNotifications,
    }
})
