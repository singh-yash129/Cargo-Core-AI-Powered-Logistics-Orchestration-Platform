import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { logisticsApi } from '@/utils/api'

export const useLogisticStore = defineStore('logistic', () => {
    // --- State ---
    const isLoading = ref(false)
    const error = ref(null)

    // Active Context
    const activeWarehouse = ref('all')
    const activeModal = ref(null)
    const selectedItem = ref(null)
    const comparedWarehouses = ref([])

    // Core Data - will be populated from backend
    const dashboardStats = ref({
        ordersToday: 0,
        activeDeliveries: 0,
        processing: 0,
        deliverySuccess: 0,
        revenueToday: 0,
        ordersTrend: 0,
        revenueTrend: 0,
        slaCompliance: {
            week: [],
            month: [],
        },
        revenue: {
            week: [],
            month: [],
        },
        orders: {
            week: [],
            month: [],
        },
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

    const pinnedHubs = ref([])
    const searchQuery = ref('')
    const isSearchOpen = ref(false)
    const creditBalance = ref(12450)

    // Warehouse-specific data cache for switching contexts
    const warehouseDataCache = ref({})

    // --- API Integration ---
    async function loadBootstrapData() {
        isLoading.value = true
        error.value = null
        try {
            const data = await logisticsApi.getBootstrap()
            
            // Map backend response to store state
            dashboardStats.value = {
                ordersToday: data.dashboard_stats.orders_today,
                activeDeliveries: data.dashboard_stats.active_deliveries,
                processing: data.dashboard_stats.processing,
                deliverySuccess: data.dashboard_stats.delivery_success,
                revenueToday: data.dashboard_stats.revenue_today,
                ordersTrend: data.dashboard_stats.orders_trend,
                revenueTrend: data.dashboard_stats.revenue_trend,
                slaCompliance: {
                    week: data.dashboard_stats.sla_week,
                    month: data.dashboard_stats.sla_week, // Using week data for now
                },
                revenue: {
                    week: data.dashboard_stats.revenue_week,
                    month: data.dashboard_stats.revenue_week, // Using week data for now
                },
                orders: {
                    week: data.dashboard_stats.orders_week,
                    month: data.dashboard_stats.orders_week, // Using week data for now
                },
            }

            hubs.value = data.hubs.map(hub => ({
                id: hub.id,
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

            alerts.value = data.alerts.map(alert => ({
                id: alert.id,
                type: alert.type,
                title: alert.title,
                description: alert.description,
                severity: alert.severity,
                icon: alert.icon,
                timestamp: alert.timestamp,
                location: alert.location,
                recommendation: alert.recommendation,
                impact: alert.impact,
            }))

            drivers.value = data.drivers.map(driver => ({
                id: driver.id,
                hubId: driver.hub_id,
                name: driver.name,
                status: driver.status,
                location: driver.location,
                vehicle: driver.vehicle,
                efficiency: driver.efficiency,
                phone: driver.phone,
                currentJob: driver.current_job,
                avatarColor: driver.avatar_color,
                chatHistory: driver.chat_history || [],
            }))

            topDrivers.value = data.top_drivers.map(driver => ({
                id: driver.id,
                hubId: driver.hubId,
                name: driver.name,
                rating: driver.rating,
                trips: driver.trips,
                ontime: driver.ontime,
                avatar: driver.avatar,
            }))

            vehicles.value = data.vehicles.map(vehicle => ({
                id: vehicle.id,
                hubId: vehicle.hub_id,
                code: vehicle.code,
                type: vehicle.type,
                model: vehicle.model,
                year: vehicle.year,
                licensePlate: vehicle.license_plate,
                status: vehicle.status,
                driver: vehicle.driver,
                fuelEfficiency: vehicle.fuel_efficiency,
                mileage: vehicle.mileage,
                nextService: vehicle.next_service,
                maintenanceIssue: vehicle.maintenance_issue,
            }))

            maintenance.value = data.maintenance.map(m => ({
                id: m.id,
                hubId: m.hub_id,
                issue: m.issue,
                status: m.status,
                statusClass: m.status_class,
            }))

            transactions.value = data.transactions.map(tx => ({
                id: tx.id,
                hubId: tx.hub_id,
                date: tx.date,
                desc: tx.desc,
                type: tx.type,
                amount: tx.amount,
                status: tx.status,
            }))

            reports.value = data.reports.map(report => ({
                id: report.id,
                hubId: report.hub_id,
                title: report.title,
                date: report.date,
                icon: report.icon,
                color: report.color,
            }))

            users.value = data.users.map(user => ({
                id: user.id,
                hubId: user.hub_id,
                name: user.name,
                email: user.email,
                role: user.role,
                status: user.status,
                lastLogin: user.last_login,
                username: user.username,
                pendingPayout: user.pending_payout,
                mobile: user.mobile,
                mobileVerified: user.mobile_verified,
                emailVerified: user.email_verified,
                avatar: user.avatar,
            }))

            returns.value = data.returns.map(ret => ({
                id: ret.reference_code,
                hubId: ret.hub_id,
                orderId: ret.order_id,
                customer: ret.customer,
                reason: ret.reason,
                condition: ret.condition,
                status: ret.status,
                originalPrice: ret.original_price,
                refundAmount: ret.refund_amount,
                images: ret.images,
            }))

            zones.value = data.zones.map(zone => ({
                id: zone.id,
                hubId: zone.hub_id,
                name: zone.name,
                type: zone.type,
                radius: zone.radius,
                status: zone.status,
                color: zone.color,
            }))

            chats.value = data.chats.map(chat => ({
                id: chat.id,
                hubId: chat.hub_id,
                name: chat.name,
                time: chat.time,
                lastMessage: chat.last_message,
                status: chat.status,
                phone: chat.phone,
                muted: chat.muted,
                messages: chat.messages.map(msg => ({
                    id: msg.id,
                    text: msg.text,
                    sender: msg.sender,
                    time: msg.time,
                })),
            }))

            escalations.value = data.escalations.map(esc => ({
                id: esc.id,
                hubId: esc.hub_id,
                title: esc.title,
                priority: esc.priority,
                from: esc.from_name,
                role: esc.role,
                time: esc.time,
                description: esc.description,
                actionDetails: esc.action_details,
                status: esc.status,
            }))

            inventory.value = data.inventory
            notifications.value = data.notifications.map(notif => ({
                id: notif.id,
                title: notif.title,
                message: notif.message,
                time: notif.time,
                read: notif.read,
                type: notif.type,
            }))

            tasks.value = data.tasks.map(task => ({
                id: task.id,
                text: task.text,
                status: task.status,
                targetTime: task.target_time ? new Date(task.target_time).getTime() : null,
                repeat: task.repeat,
                createdAt: new Date(task.created_at).getTime(),
                lastAlertTime: task.last_alert_time ? new Date(task.last_alert_time).getTime() : null,
                silenced: task.silenced,
                remaining: '',
            }))

            aiSuggestionChips.value = data.ai_suggestion_chips
            aiMessages.value = data.ai_messages
            financeSummary.value = data.finance_summary
            financeCodRecords.value = data.finance_cod_records
            financeStaffRecords.value = data.finance_staff_records
            financeDriverRecords.value = data.finance_driver_records
            fleetLogs.value = data.fleet_logs
            vehicleDocuments.value = data.vehicle_documents
            driverDocuments.value = data.driver_documents
            reportAiInsights.value = data.report_ai_insights
            reportDamageClaims.value = data.report_damage_claims
            reportSecurityLogs.value = data.report_security_logs
            reportMetrics.value = data.report_metrics

        } catch (err) {
            error.value = err.message
            console.error('Failed to load logistics data:', err)
        } finally {
            isLoading.value = false
        }
    }

    function addFunds(amount) {
        if (amount > 0) creditBalance.value += amount
    }

    // --- Getters ---
    const activeWarehouseName = computed(() => {
        if (activeWarehouse.value === 'all') return 'All Warehouses'
        const hub = hubs.value.find(h => h.id === activeWarehouse.value)
        return hub ? hub.name : 'Unknown Hub'
    })

    const unreadNotificationsCount = computed(() => {
        return notifications.value.filter(n => !n.read).length
    })

    const filteredDrivers = computed(() => {
        let result = drivers.value

        if (activeWarehouse.value !== 'all') {
            result = result.filter(d => d.hubId === activeWarehouse.value)
        }

        if (searchQuery.value) {
            const q = searchQuery.value.toLowerCase()
            result = result.filter(d => d.name.toLowerCase().includes(q) || String(d.id).toLowerCase().includes(q))
        }

        return result
    })

    const filteredTopDrivers = computed(() => {
        if (activeWarehouse.value === 'all') return topDrivers.value
        return topDrivers.value.filter(d => d.hubId === activeWarehouse.value)
    })

    const filteredVehicles = computed(() => {
        if (activeWarehouse.value === 'all') return vehicles.value
        return vehicles.value.filter(v => v.hubId === activeWarehouse.value)
    })

    const filteredMaintenance = computed(() => {
        if (activeWarehouse.value === 'all') return maintenance.value
        return maintenance.value.filter(m => m.hubId === activeWarehouse.value)
    })

    const filteredTransactions = computed(() => {
        if (activeWarehouse.value === 'all') return transactions.value
        return transactions.value.filter(t => t.hubId === activeWarehouse.value)
    })

    const filteredReports = computed(() => {
        if (activeWarehouse.value === 'all') return reports.value
        return reports.value.filter(r => r.hubId === activeWarehouse.value)
    })

    const filteredUsers = computed(() => {
        if (activeWarehouse.value === 'all') return users.value
        return users.value.filter(u => u.hubId === activeWarehouse.value || u.hubId === 'all')
    })

    const filteredReturns = computed(() => {
        if (activeWarehouse.value === 'all') return returns.value
        return returns.value.filter(r => r.hubId === activeWarehouse.value)
    })

    const filteredZones = computed(() => {
        if (activeWarehouse.value === 'all') return zones.value
        return zones.value.filter(z => z.hubId === activeWarehouse.value)
    })

    const filteredChats = computed(() => {
        if (activeWarehouse.value === 'all') return chats.value
        return chats.value.filter(c => c.hubId === activeWarehouse.value)
    })

    const filteredEscalations = computed(() => {
        if (activeWarehouse.value === 'all') return escalations.value
        return escalations.value.filter(e => e.hubId === activeWarehouse.value)
    })

    // --- Actions ---
    function openModal(name, data = null) {
        activeModal.value = name
        selectedItem.value = data
        isSearchOpen.value = false
    }

    function closeModal() {
        activeModal.value = null
        selectedItem.value = null
    }

    async function addTransaction(tx) {
        try {
            const newTx = await logisticsApi.createTransaction(tx)
            transactions.value.unshift({
                id: newTx.id,
                hubId: newTx.hub_id,
                date: newTx.date,
                desc: newTx.desc,
                type: newTx.type,
                amount: newTx.amount,
                status: newTx.status,
            })
        } catch (err) {
            console.error('Failed to create transaction:', err)
            throw err
        }
    }

    async function updateReturnStatus(rmaId, newStatus, details = {}) {
        try {
            const updated = await logisticsApi.updateReturnCase(rmaId, {
                status: newStatus,
                refund_amount: details.refundAmount,
                condition: details.condition,
            })
            
            const rma = returns.value.find(r => r.id === rmaId)
            if (rma) {
                rma.status = updated.status
                rma.refundAmount = updated.refund_amount
                rma.condition = updated.condition
            }
        } catch (err) {
            console.error('Failed to update return case:', err)
            throw err
        }
    }

    function updateUserBalance(userId, amount) {
        const user = users.value.find(u => u.username === userId || u.id === userId)
        if (user) {
            if (!user.balance) user.balance = 0
            user.balance += amount

            if (amount < 0 && user.pendingPayout) {
                user.pendingPayout += amount
                if (user.pendingPayout < 0) user.pendingPayout = 0
            }
        }
    }

    async function addAlert(alert) {
        try {
            const newAlert = await logisticsApi.createAlert(alert)
            alerts.value.unshift({
                id: newAlert.id,
                type: newAlert.type,
                title: newAlert.title,
                description: newAlert.description,
                severity: newAlert.severity,
                icon: newAlert.icon,
                timestamp: newAlert.timestamp,
                location: newAlert.location,
                recommendation: newAlert.recommendation,
                impact: newAlert.impact,
            })

            setTimeout(() => {
                resolveAlert(newAlert.id)
            }, 5000)
        } catch (err) {
            console.error('Failed to create alert:', err)
        }
    }

    async function resolveAlert(id) {
        try {
            await logisticsApi.resolveAlert(id)
            alerts.value = alerts.value.filter(a => a.id !== id)
            closeModal()
        } catch (err) {
            console.error('Failed to resolve alert:', err)
        }
    }

    function setWarehouse(id) {
        activeWarehouse.value = id

        if (activeModal.value === 'warehouse-select') {
            closeModal()
        }
    }

    function togglePin(hub) {
        const index = pinnedHubs.value.findIndex(h => h.id === hub.id)
        if (index === -1) {
            pinnedHubs.value.push({ id: hub.id, name: hub.name })
        } else {
            pinnedHubs.value.splice(index, 1)
        }
    }

    async function markNotificationRead(id) {
        try {
            await logisticsApi.updateNotification(id, { is_read: true })
            const notif = notifications.value.find(n => n.id === id)
            if (notif) notif.read = true
        } catch (err) {
            console.error('Failed to mark notification as read:', err)
        }
    }

    async function markAllNotificationsRead() {
        try {
            await logisticsApi.markAllNotificationsRead()
            notifications.value.forEach(n => n.read = true)
        } catch (err) {
            console.error('Failed to mark all notifications as read:', err)
        }
    }

    async function clearNotifications() {
        try {
            await logisticsApi.clearNotifications()
            notifications.value = []
        } catch (err) {
            console.error('Failed to clear notifications:', err)
        }
    }

    function toggleSearch() {
        isSearchOpen.value = !isSearchOpen.value
        if (!isSearchOpen.value) searchQuery.value = ''
    }

    async function sendMessageToDriver(driverId, text) {
        const driver = drivers.value.find(d => d.id === driverId)
        if (!driver) return

        const now = new Date()
        const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

        driver.chatHistory.push({
            id: Date.now(),
            text: text,
            sender: 'dispatch',
            time: timeString
        })

        setTimeout(() => {
            driver.chatHistory.push({
                id: Date.now() + 1,
                text: 'Copy that. I will keep you posted.',
                sender: 'driver',
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            })
        }, 2500)
    }

    function updateDriverStatus(driverId, newStatus) {
        const driver = drivers.value.find(d => d.id === driverId)
        if (driver) driver.status = newStatus
    }

    async function addVehicle(vehicleData) {
        try {
            const newVehicle = await logisticsApi.createVehicle({
                code: vehicleData.code,
                vehicle_type: vehicleData.type,
                warehouse_id: vehicleData.hubId,
                model: vehicleData.model,
                year: vehicleData.year,
                license_plate: vehicleData.licensePlate,
                status: vehicleData.status || 'Active',
                fuel_efficiency: vehicleData.fuelEfficiency,
                mileage: vehicleData.mileage || 0,
            })
            
            vehicles.value.unshift({
                id: newVehicle.id,
                hubId: newVehicle.hub_id,
                code: newVehicle.code,
                type: newVehicle.type,
                model: newVehicle.model,
                year: newVehicle.year,
                licensePlate: newVehicle.license_plate,
                status: newVehicle.status,
                driver: newVehicle.driver,
                fuelEfficiency: newVehicle.fuel_efficiency,
                mileage: newVehicle.mileage,
                nextService: newVehicle.next_service,
            })
        } catch (err) {
            console.error('Failed to create vehicle:', err)
            throw err
        }
    }

    async function updateVehicleStatus(vehicleId, newStatus) {
        try {
            const updated = await logisticsApi.updateVehicle(vehicleId, { status: newStatus })
            const vehicle = vehicles.value.find(v => v.id === vehicleId)
            if (vehicle) {
                vehicle.status = updated.status

                if (newStatus === 'In Shop' || newStatus === 'Scheduled') {
                    const existingAlert = maintenance.value.find(m => m.id === vehicleId)
                    if (existingAlert) {
                        existingAlert.status = newStatus
                        existingAlert.statusClass = newStatus === 'In Shop' ? 'bg-red-500/10 text-red-500' : 'bg-yellow-500/10 text-yellow-500'
                    } else {
                        maintenance.value.unshift({
                            id: vehicleId,
                            hubId: vehicle.hubId,
                            issue: 'Scheduled Routine Maintenance',
                            status: newStatus,
                            statusClass: newStatus === 'In Shop' ? 'bg-red-500/10 text-red-500' : 'bg-yellow-500/10 text-yellow-500'
                        })
                    }
                } else if (newStatus === 'Active') {
                    maintenance.value = maintenance.value.filter(m => m.id !== vehicleId)
                }
            }
        } catch (err) {
            console.error('Failed to update vehicle status:', err)
            throw err
        }
    }

    function addHub(hubData) {
        const maxId = hubs.value.reduce((max, h) => Math.max(max, Number(h.id)), 0)
        hubs.value.push({
            ...hubData,
            id: maxId + 1,
            efficiency: Math.floor(Math.random() * (100 - 80 + 1)) + 80,
            staffActive: 0,
            staffTotal: Math.floor(Math.random() * (50 - 20 + 1)) + 20,
            vehiclesActive: 0,
            vehiclesTotal: Math.floor(Math.random() * (30 - 10 + 1)) + 10,
            processRate: 0,
            statusColor: hubData.status === 'Optimal' ? 'text-green-500' : (hubData.status === 'Congested' ? 'text-red-500' : 'text-blue-500'),
            bg: hubData.status === 'Optimal' ? 'bg-green-500' : (hubData.status === 'Congested' ? 'bg-red-500' : 'bg-blue-500')
        })
    }

    function updateHub(hubData) {
        const index = hubs.value.findIndex(h => h.id === hubData.id)
        if (index !== -1) {
            const statusColor = hubData.status === 'Optimal' ? 'text-green-500' : (hubData.status === 'Congested' ? 'text-red-500' : 'text-blue-500')
            const bg = hubData.status === 'Optimal' ? 'bg-green-500' : (hubData.status === 'Congested' ? 'bg-red-500' : 'bg-blue-500')

            hubs.value[index] = {
                ...hubs.value[index],
                ...hubData,
                statusColor,
                bg
            }
        }
    }

    function deleteHub(hubId) {
        hubs.value = hubs.value.filter(h => h.id !== hubId)
        pinnedHubs.value = pinnedHubs.value.filter(id => id !== hubId)

        if (activeWarehouse.value === hubId) {
            activeWarehouse.value = 'all'
        }
    }

    function addUser(userData) {
        users.value.unshift({
            ...userData,
            lastLogin: 'Never',
            avatar: userData.avatar || `https://i.pravatar.cc/150?u=${Math.random()}`
        })
    }

    function updateUser(email, updates) {
        const index = users.value.findIndex(u => u.email === email)
        if (index !== -1) {
            users.value[index] = { ...users.value[index], ...updates }
        }
    }

    function deleteUser(email) {
        users.value = users.value.filter(u => u.email !== email)
    }

    function toggleUserStatus(email) {
        const user = users.value.find(u => u.email === email)
        if (user) {
            user.status = user.status === 'Active' ? 'Inactive' : 'Active'
        }
    }

    async function addZone(zoneData) {
        try {
            const newZone = await logisticsApi.createZone({
                warehouse_id: zoneData.hubId,
                name: zoneData.name,
                zone_type: zoneData.type,
                radius_km: zoneData.radius,
                status: zoneData.status || 'Active',
                color_token: zoneData.color,
            })
            
            zones.value.unshift({
                id: newZone.id,
                hubId: newZone.hub_id,
                name: newZone.name,
                type: newZone.type,
                radius: newZone.radius,
                status: newZone.status,
                color: newZone.color,
            })
        } catch (err) {
            console.error('Failed to create zone:', err)
            throw err
        }
    }

    async function updateZone(zoneId, updates) {
        try {
            const updated = await logisticsApi.updateZone(zoneId, {
                name: updates.name,
                zone_type: updates.type,
                radius_km: updates.radius,
                status: updates.status,
                color_token: updates.color,
            })
            
            const index = zones.value.findIndex(z => z.id === zoneId)
            if (index !== -1) {
                zones.value[index] = {
                    id: updated.id,
                    hubId: updated.hub_id,
                    name: updated.name,
                    type: updated.type,
                    radius: updated.radius,
                    status: updated.status,
                    color: updated.color,
                }
            }
        } catch (err) {
            console.error('Failed to update zone:', err)
            throw err
        }
    }

    async function deleteZone(zoneId) {
        try {
            await logisticsApi.deleteZone(zoneId)
            zones.value = zones.value.filter(z => z.id !== zoneId)
        } catch (err) {
            console.error('Failed to delete zone:', err)
            throw err
        }
    }

    async function sendChatMessage(threadId, text, sender = 'me') {
        try {
            const updated = await logisticsApi.addChatMessage(threadId, { sender, text })
            
            const chat = chats.value.find(c => c.id === threadId)
            if (chat) {
                chat.messages = updated.messages.map(msg => ({
                    id: msg.id,
                    text: msg.text,
                    sender: msg.sender,
                    time: msg.time,
                }))
                chat.lastMessage = text
                chat.time = 'Just now'
            }
        } catch (err) {
            console.error('Failed to send chat message:', err)
            throw err
        }
    }

    async function updateTaskStatus(taskId, status) {
        try {
            const updated = await logisticsApi.updateTask(taskId, { status })
            const task = tasks.value.find(t => t.id === taskId)
            if (task) {
                task.status = updated.status
            }
        } catch (err) {
            console.error('Failed to update task:', err)
            throw err
        }
    }

    async function queryAI(query) {
        try {
            const response = await logisticsApi.queryAI(query)
            
            const newMessage = {
                role: 'ai',
                text: response.text,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                data: response.data,
            }
            
            aiMessages.value.push(newMessage)
            return response
        } catch (err) {
            console.error('Failed to query AI:', err)
            throw err
        }
    }

    return {
        // State
        isLoading,
        error,
        activeWarehouse,
        activeModal,
        selectedItem,
        comparedWarehouses,
        dashboardStats,
        hubs,
        alerts,
        drivers,
        topDrivers,
        vehicles,
        maintenance,
        transactions,
        reports,
        users,
        returns,
        zones,
        chats,
        escalations,
        inventory,
        notifications,
        tasks,
        pinnedHubs,
        searchQuery,
        isSearchOpen,
        creditBalance,
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

        // Getters
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

        // Actions
        loadBootstrapData,
        addFunds,
        openModal,
        closeModal,
        addTransaction,
        updateReturnStatus,
        updateUserBalance,
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
        addZone,
        updateZone,
        deleteZone,
        sendChatMessage,
        updateTaskStatus,
        queryAI,
    }
})
