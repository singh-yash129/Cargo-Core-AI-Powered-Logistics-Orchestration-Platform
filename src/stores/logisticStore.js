import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

const API_BASE = 'http://localhost:8000/api/v1'
const CREDENTIAL_CACHE_KEY = 'logistic_manager_created_credentials'

const asArray = (value) => Array.isArray(value) ? value : []
const asStringId = (value, fallback = 'all') => value == null ? fallback : String(value)

function loadCredentialCache() {
    try {
        return JSON.parse(localStorage.getItem(CREDENTIAL_CACHE_KEY) || '{}')
    } catch {
        return {}
    }
}

function persistCredentialCache(cache) {
    localStorage.setItem(CREDENTIAL_CACHE_KEY, JSON.stringify(cache))
}

function authHeaders(extra = {}) {
    const token = localStorage.getItem('auth_token')
    return {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...extra,
    }
}

function roleLabel(role) {
    if (role === 'LOGISTIC_MANAGER') return 'Logistic Manager'
    if (role === 'WAREHOUSE_MANAGER') return 'Warehouse Manager'
    if (role === 'DISPATCHER') return 'Dispatcher'
    if (role === 'DRIVER') return 'Driver'
    if (role === 'VENDOR') return 'Vendor'
    return role || 'User'
}

async function apiRequest(path, options = {}) {
    const response = await fetch(`${API_BASE}${path}`, options)
    if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.detail || 'Request failed')
    }
    if (response.status === 204) return null
    return response.json()
}

export const useLogisticStore = defineStore('logistic', () => {
    const initialized = ref(false)
    const isLoading = ref(false)
    const error = ref('')

    const activeWarehouse = ref('all')
    const activeModal = ref(null)
    const selectedItem = ref(null)
    const comparedWarehouses = ref([])
    const searchQuery = ref('')
    const isSearchOpen = ref(false)

    const dashboardStats = ref({
        ordersToday: 0,
        activeDeliveries: 0,
        processing: 0,
        deliverySuccess: 0,
        revenueToday: 0,
        ordersTrend: 0,
        revenueTrend: 0,
        slaCompliance: { week: [] },
        revenue: { week: [] },
        orders: { week: [] },
    })

    const hubs = ref([])
    const alerts = ref([])
    const drivers = ref([])
    const topDrivers = ref([])
    const vehicles = ref([])
    const maintenance = ref([])
    const transactions = ref([])
    const reports = ref([])
    const users = ref([])
    const returns = ref([])
    const zones = ref([])
    const chats = ref([])
    const escalations = ref([])
    const inventory = ref([])
    const notifications = ref([])
    const tasks = ref([])
    const creditBalance = ref(0)
    const pinnedHubs = ref([])
    const aiSuggestionChips = ref([])
    const aiMessages = ref([])
    const financeSummary = ref({})
    const financeCodRecords = ref([])
    const financeStaffRecords = ref([])
    const financeDriverRecords = ref([])
    const fleetLogs = ref({})
    const vehicleDocuments = ref([])
    const driverDocuments = ref([])
    const reportAiInsights = ref([])
    const reportDamageClaims = ref([])
    const reportSecurityLogs = ref([])
    const reportMetrics = ref({})
    const credentialCache = ref(loadCredentialCache())

    function hydrate(payload) {
        const stats = payload.dashboard_stats || {}

        dashboardStats.value = {
            ordersToday: stats.orders_today || 0,
            activeDeliveries: stats.active_deliveries || 0,
            processing: stats.processing || 0,
            deliverySuccess: stats.delivery_success || 0,
            revenueToday: stats.revenue_today || 0,
            ordersTrend: stats.orders_trend || 0,
            revenueTrend: stats.revenue_trend || 0,
            slaCompliance: { week: asArray(stats.sla_week), month: asArray(stats.sla_week) },
            revenue: { week: asArray(stats.revenue_week), month: asArray(stats.revenue_week) },
            orders: { week: asArray(stats.orders_week), month: asArray(stats.orders_week) },
        }

        hubs.value = asArray(payload.hubs).map((hub) => ({
            id: asStringId(hub.id),
            hubCode: hub.hub_code,
            name: hub.name,
            location: hub.location,
            manager: hub.manager,
            managerInitials: hub.manager_initials,
            capacity: hub.capacity,
            efficiency: hub.efficiency,
            staffActive: hub.staff_active,
            staffTotal: hub.staff_total,
            vehiclesActive: hub.vehicles_active,
            vehiclesTotal: hub.vehicles_total,
            processRate: hub.process_rate,
            status: hub.status,
            statusColor: hub.status_color,
            bg: hub.bg,
        }))

        alerts.value = asArray(payload.alerts).map((alert) => ({
            id: asStringId(alert.id),
            type: alert.type,
            title: alert.title,
            description: alert.description,
            severity: alert.severity,
            icon: alert.icon || 'warning',
            timestamp: alert.timestamp,
            location: alert.location,
            recommendation: alert.recommendation,
            ...(alert.impact || {}),
        }))

        drivers.value = asArray(payload.drivers).map((driver) => ({
            id: asStringId(driver.id),
            hubId: asStringId(driver.hub_id),
            name: driver.name,
            status: driver.status,
            location: driver.location,
            vehicle: driver.vehicle,
            efficiency: driver.efficiency,
            phone: driver.phone,
            currentJob: driver.current_job,
            avatarColor: driver.avatar_color || 'bg-gray-700',
            chatHistory: driver.chat_history || [],
        }))

        topDrivers.value = asArray(payload.top_drivers).map((driver) => ({
            ...driver,
            id: asStringId(driver.id),
            hubId: asStringId(driver.hubId),
        }))

        vehicles.value = asArray(payload.vehicles).map((vehicle) => ({
            id: asStringId(vehicle.id),
            hubId: asStringId(vehicle.hub_id),
            type: vehicle.type,
            code: vehicle.code,
            model: vehicle.model,
            year: vehicle.year,
            licensePlate: vehicle.license_plate,
            status: vehicle.status,
            driver: vehicle.driver,
            fuelEfficiency: vehicle.fuel_efficiency,
            mileage: vehicle.mileage,
            nextService: vehicle.next_service,
            issue: vehicle.maintenance_issue,
        }))

        maintenance.value = asArray(payload.maintenance).map((item) => ({
            id: asStringId(item.id),
            hubId: asStringId(item.hub_id),
            issue: item.issue,
            status: item.status,
            statusClass: item.status_class,
        }))

        transactions.value = asArray(payload.transactions).map((tx) => ({
            id: asStringId(tx.id),
            hubId: asStringId(tx.hub_id),
            date: tx.date,
            desc: tx.desc,
            type: tx.type,
            amount: tx.amount,
            status: tx.status,
        }))

        reports.value = asArray(payload.reports).map((report) => ({
            id: asStringId(report.id),
            hubId: asStringId(report.hub_id),
            title: report.title,
            date: report.date,
            icon: report.icon,
            color: report.color,
        }))

        users.value = asArray(payload.users).map((user) => {
            const cachedCredentials = credentialCache.value[String(user.email || '').toLowerCase()] || null
            return {
                id: asStringId(user.id),
                hubId: asStringId(user.hub_id),
                name: user.name,
                email: user.email,
                role: roleLabel(user.role),
                status: user.status,
                lastLogin: user.last_login,
                username: user.username,
                password: cachedCredentials?.password || '',
                pending_payout: user.pending_payout,
                mobile: user.mobile,
                mobileVerified: user.mobile_verified,
                emailVerified: user.email_verified,
                avatar: user.avatar,
            }
        })

        returns.value = asArray(payload.returns).map((item) => ({
            id: asStringId(item.id),
            hubId: asStringId(item.hub_id),
            orderId: item.order_id ? String(item.order_id) : '',
            customer: item.customer,
            reason: item.reason,
            condition: item.condition,
            status: item.status,
            originalPrice: item.original_price,
            refundAmount: item.refund_amount,
            images: item.images || [],
            referenceCode: item.reference_code,
        }))

        zones.value = asArray(payload.zones).map((zone) => ({
            id: asStringId(zone.id),
            hubId: asStringId(zone.hub_id),
            name: zone.name,
            type: zone.type,
            radius: zone.radius,
            status: zone.status,
            color: zone.color,
        }))

        chats.value = asArray(payload.chats).map((chat) => ({
            id: asStringId(chat.id),
            hubId: asStringId(chat.hub_id),
            name: chat.name,
            time: chat.time,
            lastMessage: chat.last_message,
            status: chat.status,
            phone: chat.phone,
            muted: chat.muted,
            messages: asArray(chat.messages),
        }))

        escalations.value = asArray(payload.escalations).map((item) => ({
            id: asStringId(item.id),
            hubId: asStringId(item.hub_id),
            title: item.title,
            priority: item.priority,
            from: item.from_name,
            role: item.role,
            time: item.time,
            description: item.description,
            actionDetails: item.action_details,
            status: item.status,
        }))

        inventory.value = asArray(payload.inventory).map((item) => ({
            ...item,
            id: asStringId(item.id),
            hubId: asStringId(item.hubId),
        }))

        notifications.value = asArray(payload.notifications).map((item) => ({
            id: asStringId(item.id),
            title: item.title,
            message: item.message,
            time: item.time,
            read: item.read,
            type: item.type,
        }))

        tasks.value = asArray(payload.tasks).map((task) => ({
            id: asStringId(task.id),
            text: task.text,
            status: task.status,
            targetTime: task.target_time,
            repeat: task.repeat,
            createdAt: task.created_at,
            lastAlertTime: task.last_alert_time,
            silenced: task.silenced,
            remaining: '',
        }))

        aiSuggestionChips.value = asArray(payload.ai_suggestion_chips)
        aiMessages.value = asArray(payload.ai_messages).map((message, index) => ({
            id: message.id || `ai-${index}`,
            role: message.role,
            text: message.text,
            data: message.data || null,
            time: message.time,
        }))
        financeSummary.value = payload.finance_summary || {}
        financeCodRecords.value = asArray(payload.finance_cod_records).map((item) => ({ ...item, id: asStringId(item.id), hubId: asStringId(item.hubId) }))
        financeStaffRecords.value = asArray(payload.finance_staff_records).map((item) => ({ ...item, id: asStringId(item.id), userId: asStringId(item.userId), hubId: asStringId(item.hubId) }))
        financeDriverRecords.value = asArray(payload.finance_driver_records).map((item) => ({ ...item, id: asStringId(item.id), userId: asStringId(item.userId), hubId: asStringId(item.hubId) }))
        fleetLogs.value = payload.fleet_logs || {}
        vehicleDocuments.value = asArray(payload.vehicle_documents).map((item) => ({ ...item, id: asStringId(item.id), hubId: asStringId(item.hubId) }))
        driverDocuments.value = asArray(payload.driver_documents).map((item) => ({ ...item, id: asStringId(item.id), driverId: asStringId(item.driverId), hubId: asStringId(item.hubId) }))
        reportAiInsights.value = asArray(payload.report_ai_insights)
        reportDamageClaims.value = asArray(payload.report_damage_claims)
        reportSecurityLogs.value = asArray(payload.report_security_logs)
        reportMetrics.value = payload.report_metrics || {}

        creditBalance.value = transactions.value
            .filter((item) => item.amount > 0)
            .reduce((sum, item) => sum + item.amount, 0)
    }

    async function refresh() {
        const payload = await apiRequest('/logistics/bootstrap', { headers: authHeaders() })
        hydrate(payload)
        initialized.value = true
    }

    async function initialize(force = false) {
        if (initialized.value && !force) return
        isLoading.value = true
        error.value = ''
        try {
            await refresh()
        } catch (err) {
            error.value = err.message || 'Failed to load logistics data'
            throw err
        } finally {
            isLoading.value = false
        }
    }

    const activeWarehouseName = computed(() => {
        if (activeWarehouse.value === 'all') return 'All Warehouses'
        const hub = hubs.value.find((item) => item.id === activeWarehouse.value)
        return hub ? hub.name : 'Unknown Hub'
    })

    const unreadNotificationsCount = computed(() => notifications.value.filter((item) => !item.read).length)
    const filterByWarehouse = (items) => (activeWarehouse.value === 'all' ? items : items.filter((item) => item.hubId === activeWarehouse.value))

    const filteredDrivers = computed(() => {
        let result = filterByWarehouse(drivers.value)
        if (searchQuery.value) {
            const q = searchQuery.value.toLowerCase()
            result = result.filter((item) => item.name.toLowerCase().includes(q) || item.id.toLowerCase().includes(q))
        }
        return result
    })

    const filteredTopDrivers = computed(() => filterByWarehouse(topDrivers.value))
    const filteredVehicles = computed(() => filterByWarehouse(vehicles.value))
    const filteredMaintenance = computed(() => filterByWarehouse(maintenance.value))
    const filteredTransactions = computed(() => filterByWarehouse(transactions.value))
    const filteredReports = computed(() => filterByWarehouse(reports.value))
    const filteredUsers = computed(() => users.value.filter((item) => activeWarehouse.value === 'all' || item.hubId === activeWarehouse.value || item.hubId === 'all'))
    const filteredReturns = computed(() => filterByWarehouse(returns.value))
    const filteredZones = computed(() => filterByWarehouse(zones.value))
    const filteredChats = computed(() => filterByWarehouse(chats.value))
    const filteredEscalations = computed(() => filterByWarehouse(escalations.value))
    const filteredInventory = computed(() => filterByWarehouse(inventory.value))
    const filteredFinanceCodRecords = computed(() => filterByWarehouse(financeCodRecords.value))
    const filteredFinanceStaffRecords = computed(() => filterByWarehouse(financeStaffRecords.value))
    const filteredFinanceDriverRecords = computed(() => filterByWarehouse(financeDriverRecords.value))
    const filteredVehicleDocuments = computed(() => filterByWarehouse(vehicleDocuments.value))
    const filteredDriverDocuments = computed(() => filterByWarehouse(driverDocuments.value))
    const filteredDamageClaims = computed(() => reportDamageClaims.value)
    const filteredSecurityLogs = computed(() => reportSecurityLogs.value)

    function openModal(name, data = null) {
        activeModal.value = name
        selectedItem.value = data
        isSearchOpen.value = false
    }

    function closeModal() {
        activeModal.value = null
        selectedItem.value = null
    }

    function setWarehouse(id) {
        activeWarehouse.value = String(id)
        if (activeModal.value === 'warehouse-select') closeModal()
    }

    function togglePin(hub) {
        const exists = pinnedHubs.value.find((item) => item.id === hub.id)
        pinnedHubs.value = exists ? pinnedHubs.value.filter((item) => item.id !== hub.id) : [...pinnedHubs.value, { id: hub.id, name: hub.name }]
    }

    async function markNotificationRead(id) {
        await apiRequest(`/logistics/notifications/${id}`, {
            method: 'PUT',
            headers: authHeaders(),
            body: JSON.stringify({ read: true }),
        })
        const item = notifications.value.find((entry) => entry.id === id)
        if (item) item.read = true
    }

    async function markAllNotificationsRead() {
        await apiRequest('/logistics/notifications/mark-all-read', { method: 'POST', headers: authHeaders() })
        notifications.value.forEach((item) => { item.read = true })
    }

    async function clearNotifications() {
        await apiRequest('/logistics/notifications', { method: 'DELETE', headers: authHeaders() })
        notifications.value = []
    }

    function toggleSearch() {
        isSearchOpen.value = !isSearchOpen.value
        if (!isSearchOpen.value) searchQuery.value = ''
    }

    async function addTransaction(tx) {
        const created = await apiRequest('/logistics/transactions', {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify({
                warehouse_id: tx.hubId && tx.hubId !== 'all' ? tx.hubId : null,
                description: tx.desc,
                transaction_type: tx.type,
                amount: tx.amount,
                status: tx.status || 'Completed',
            }),
        })

        transactions.value = [{
            id: asStringId(created.id),
            hubId: asStringId(created.hub_id),
            date: created.date,
            desc: created.desc,
            type: created.type,
            amount: created.amount,
            status: created.status,
        }, ...transactions.value]

        if (created.amount > 0) {
            financeSummary.value.total_revenue = (financeSummary.value.total_revenue || 0) + created.amount
            creditBalance.value += created.amount
        } else {
            financeSummary.value.total_expenses = (financeSummary.value.total_expenses || 0) + Math.abs(created.amount)
        }
    }

    async function askAi(query) {
        const userMessage = {
            id: `user-${Date.now()}`,
            role: 'user',
            text: query,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
        aiMessages.value.push(userMessage)
        const response = await apiRequest('/logistics/ai/query', {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify({ query }),
        })
        const aiMessage = {
            id: `ai-${Date.now()}`,
            role: 'ai',
            text: response.text,
            data: response.data || null,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
        aiMessages.value.push(aiMessage)
        return aiMessage
    }

    async function updateReturnStatus(rmaId, newStatus, details = {}) {
        await apiRequest(`/logistics/returns/${rmaId}`, {
            method: 'PUT',
            headers: authHeaders(),
            body: JSON.stringify({
                status: newStatus,
                refund_amount: details.refundAmount ?? null,
                condition: details.condition ?? null,
            }),
        })
        await refresh()
    }

    async function addAlert(alert) {
        await apiRequest('/logistics/alerts', {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify(alert),
        })
        await refresh()
    }

    async function resolveAlert(id) {
        await apiRequest(`/logistics/alerts/${id}/resolve`, {
            method: 'POST',
            headers: authHeaders(),
        })
        alerts.value = alerts.value.filter((item) => item.id !== id)
        closeModal()
    }

    async function sendMessageToDriver(driverId, text) {
        const driver = drivers.value.find((item) => item.id === String(driverId))
        if (!driver) return
        driver.chatHistory.push({
            id: Date.now(),
            text,
            sender: 'dispatch',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        })
    }

    function updateDriverStatus(driverId, newStatus) {
        const driver = drivers.value.find((item) => item.id === String(driverId))
        if (driver) driver.status = newStatus
    }

    async function addVehicle(vehicleData) {
        const assignedDriver = users.value.find((item) => item.name === vehicleData.driver && item.role === 'Driver')
        await apiRequest('/logistics/vehicles', {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify({
                code: vehicleData.id,
                vehicle_type: vehicleData.type,
                warehouse_id: vehicleData.hubId && vehicleData.hubId !== 'all' ? vehicleData.hubId : null,
                assigned_driver_id: assignedDriver?.id || null,
                model: vehicleData.model,
                year: vehicleData.year,
                license_plate: vehicleData.licensePlate,
                status: vehicleData.status || 'Active',
                fuel_efficiency: vehicleData.fuelEfficiency || 'Pending Calibration',
                mileage: vehicleData.mileage || 0,
                maintenance_issue: vehicleData.issue || null,
            }),
        })
        await refresh()
    }

    async function updateVehicleStatus(vehicleId, newStatus) {
        await apiRequest(`/logistics/vehicles/${vehicleId}`, {
            method: 'PUT',
            headers: authHeaders(),
            body: JSON.stringify({ status: newStatus }),
        })
        await refresh()
    }

    async function addHub(hubData) {
        await apiRequest('/warehouses', {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify({
                name: hubData.name,
                address: hubData.location,
                capacity_limit: hubData.capacity || 1000,
            }),
        })
        await refresh()
    }

    async function updateHub(hubData) {
        await apiRequest(`/warehouses/${hubData.id}`, {
            method: 'PUT',
            headers: authHeaders(),
            body: JSON.stringify({
                name: hubData.name,
                address: hubData.location,
                capacity_limit: hubData.capacity || 1000,
                is_active: hubData.status !== 'Inactive',
            }),
        })
        await refresh()
    }

    async function deleteHub(hubId) {
        await apiRequest(`/warehouses/${hubId}`, {
            method: 'DELETE',
            headers: authHeaders(),
        })
        if (activeWarehouse.value === String(hubId)) activeWarehouse.value = 'all'
        await refresh()
    }

    async function addUser(userData) {
        const created = await apiRequest('/users', {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify({
                name: userData.name,
                username: userData.username || null,
                email: userData.email,
                phone: userData.mobile || userData.phone || null,
                password: userData.password || '12345678',
                role: String(userData.role || 'DRIVER').replace(' ', '_').toUpperCase(),
                warehouse_id: userData.hubId && userData.hubId !== 'all' ? userData.hubId : null,
            }),
        })

        if (userData.email && userData.password) {
            credentialCache.value[String(userData.email).toLowerCase()] = {
                username: created?.username || userData.username || '',
                password: userData.password,
            }
            persistCredentialCache(credentialCache.value)
        }

        await refresh()
        return created
    }

    async function updateUser(email, updates) {
        const user = users.value.find((item) => item.email === email)
        if (!user) return
        await apiRequest(`/users/${user.id}`, {
            method: 'PUT',
            headers: authHeaders(),
            body: JSON.stringify({
                name: updates.name,
                phone: updates.mobile || updates.phone || null,
                is_active: updates.status ? updates.status === 'Active' : undefined,
            }),
        })
        await refresh()
    }

    async function deleteUser(email) {
        const user = users.value.find((item) => item.email === email)
        if (!user) return
        await apiRequest(`/users/${user.id}`, {
            method: 'DELETE',
            headers: authHeaders(),
        })
        delete credentialCache.value[String(email).toLowerCase()]
        persistCredentialCache(credentialCache.value)
        await refresh()
    }

    async function toggleUserStatus(email) {
        const user = users.value.find((item) => item.email === email)
        if (!user) return
        await apiRequest(`/users/${user.id}`, {
            method: 'PUT',
            headers: authHeaders(),
            body: JSON.stringify({ is_active: user.status !== 'Active' }),
        })
        await refresh()
    }

    function addFunds(amount) {
        if (amount > 0) creditBalance.value += amount
    }

    function markFinanceRecordPaid(collection, id) {
        const targetCollections = {
            cod: financeCodRecords.value,
            staff: financeStaffRecords.value,
            drivers: financeDriverRecords.value,
        }
        const items = targetCollections[collection]
        if (!items) return
        const item = items.find((entry) => entry.id === id)
        if (item) item.status = collection === 'cod' ? 'Completed' : 'Paid'
    }

    return {
        initialized,
        isLoading,
        error,
        activeWarehouse,
        activeModal,
        selectedItem,
        comparedWarehouses,
        dashboardStats,
        alerts,
        drivers,
        topDrivers,
        vehicles,
        maintenance,
        transactions,
        users,
        returns,
        zones,
        chats,
        inventory,
        reports,
        hubs,
        pinnedHubs,
        searchQuery,
        isSearchOpen,
        notifications,
        tasks,
        creditBalance,
        escalations,
        aiSuggestionChips,
        aiMessages,
        financeSummary,
        financeCodRecords,
        financeStaffRecords,
        financeDriverRecords,
        fleetLogs,
        vehicleDocuments,
        driverDocuments,
        reportAiInsights,
        reportDamageClaims,
        reportSecurityLogs,
        reportMetrics,
        initialize,
        refresh,
        addFunds,
        activeWarehouseName,
        unreadNotificationsCount,
        filteredDrivers,
        filteredTopDrivers,
        filteredVehicles,
        filteredMaintenance,
        filteredTransactions,
        filteredReports,
        filteredUsers,
        filteredReturns,
        filteredZones,
        filteredChats,
        filteredEscalations,
        filteredInventory,
        filteredFinanceCodRecords,
        filteredFinanceStaffRecords,
        filteredFinanceDriverRecords,
        filteredVehicleDocuments,
        filteredDriverDocuments,
        filteredDamageClaims,
        filteredSecurityLogs,
        openModal,
        closeModal,
        addTransaction,
        askAi,
        updateReturnStatus,
        addAlert,
        resolveAlert,
        setWarehouse,
        togglePin,
        markNotificationRead,
        markAllNotificationsRead,
        clearNotifications,
        toggleSearch,
        sendMessageToDriver,
        updateDriverStatus,
        addVehicle,
        updateVehicleStatus,
        addHub,
        updateHub,
        deleteHub,
        addUser,
        updateUser,
        deleteUser,
        toggleUserStatus,
        markFinanceRecordPaid,
    }
})
