import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useLogisticStore = defineStore('logistic', () => {
    // --- State ---

    // Active Context
    const activeWarehouse = ref('all') // 'all' or specific hub ID
    const activeModal = ref(null) // 'alert-details', 'driver-profile', 'warehouse-select', etc.
    const selectedItem = ref(null) // Data payload for the active modal

    // Todo Tasks
    const tasks = ref([
        {
            id: 1,
            text: 'Review daily hub performance',
            status: 'Priority',
            targetTime: Date.now() + 3600000, // 1 hour from now
            repeat: 'none',
            createdAt: Date.now(),
            lastAlertTime: null,
            silenced: false,
            remaining: ''
        },
        {
            id: 2,
            text: 'Approve Fleet Maintenance',
            status: 'Done',
            targetTime: Date.now() - 7200000, // 2 hours ago
            repeat: 'none',
            createdAt: Date.now() - 86400000,
            lastAlertTime: null,
            silenced: false,
            remaining: ''
        }
    ])

    // Mock Data: KPIs
    // Mock Data: KPIs
    const globalStats = {
        ordersToday: 1248, // Scalar for top bar
        activeDeliveries: 342, // In Transit
        processing: 154, // New property for pipeline
        deliverySuccess: 98.2,
        revenueToday: 42500, // Scalar for top bar
        ordersTrend: 12.5,
        revenueTrend: 8.2,
        slaCompliance: {
            week: [92, 94, 88, 95, 90, 96, 98],
            month: [85, 88, 87, 89, 90, 92, 91, 93, 89, 88, 90, 92, 94, 95, 96, 95, 94, 93, 92, 91, 90, 89, 88, 90, 92, 94, 96, 98, 99, 98]
        },
        revenue: {
            week: [38000, 41000, 39500, 42500, 45000, 48000, 46500],
            month: Array(30).fill(40000).map(() => 35000 + Math.floor(Math.random() * 15000))
        },
        orders: {
            week: [1100, 1150, 1080, 1248, 1300, 1450, 1380],
            month: Array(30).fill(1100).map(() => 1000 + Math.floor(Math.random() * 500))
        }
    }

    const dashboardStats = ref({ ...globalStats })

    // Specific Data for Hubs to simulate interactivity
    // Specific Data for Hubs to simulate interactivity
    const warehouseMockData = {
        1: { // North-East Hub
            ordersToday: 412,
            activeDeliveries: 156,
            processing: 89,
            deliverySuccess: 89.5,
            revenueToday: 12500,
            ordersTrend: -5.4,
            revenueTrend: -2.1,
            efficiency: 88,
            efficiencyTrend: 2.1,
            staffActive: 42,
            staffTotal: 50,
            vehiclesActive: 28,
            vehiclesTotal: 34,
            slaCompliance: {
                week: [82, 80, 75, 78, 80, 82, 85],
                month: Array(30).fill(80).map(() => 75 + Math.floor(Math.random() * 15))
            },
            revenue: {
                week: [11000, 11500, 10800, 12500, 13000, 12800, 13500],
                month: Array(30).fill(11000).map(() => 10000 + Math.floor(Math.random() * 4000))
            },
            orders: {
                week: [380, 390, 350, 412, 450, 480, 460],
                month: Array(30).fill(380).map(() => 350 + Math.floor(Math.random() * 150))
            }
        },
        2: { // South Hub
            ordersToday: 580,
            activeDeliveries: 89,
            processing: 42,
            deliverySuccess: 99.4,
            revenueToday: 24800,
            ordersTrend: 15.2,
            revenueTrend: 18.5,
            efficiency: 96,
            efficiencyTrend: 5.4,
            staffActive: 65,
            staffTotal: 68,
            vehiclesActive: 40,
            vehiclesTotal: 42,
            slaCompliance: {
                week: [96, 97, 98, 98, 99, 99, 100],
                month: Array(30).fill(98).map(() => 95 + Math.floor(Math.random() * 5))
            },
            revenue: {
                week: [22000, 23500, 24000, 24800, 26000, 27500, 28000],
                month: Array(30).fill(22000).map(() => 20000 + Math.floor(Math.random() * 8000))
            },
            orders: {
                week: [510, 530, 550, 580, 620, 650, 680],
                month: Array(30).fill(510).map(() => 480 + Math.floor(Math.random() * 250))
            }
        },
        3: { // West DC-04
            ordersToday: 256,
            activeDeliveries: 97,
            processing: 23,
            deliverySuccess: 94.1,
            revenueToday: 8200,
            ordersTrend: 2.1,
            revenueTrend: 4.5,
            efficiency: 74,
            efficiencyTrend: -1.2,
            staffActive: 28,
            staffTotal: 35,
            vehiclesActive: 19,
            vehiclesTotal: 25,
            slaCompliance: {
                week: [90, 92, 91, 93, 90, 92, 94],
                month: Array(30).fill(92).map(() => 88 + Math.floor(Math.random() * 8))
            },
            revenue: {
                week: [7500, 7800, 8000, 8200, 8500, 8100, 8300],
                month: Array(30).fill(7500).map(() => 7000 + Math.floor(Math.random() * 2000))
            },
            orders: {
                week: [220, 230, 240, 256, 265, 250, 260],
                month: Array(30).fill(220).map(() => 200 + Math.floor(Math.random() * 80))
            }
        }
    }

    // Mock Data: Alerts
    const alerts = ref([
        {
            id: 1,
            type: 'congestion',
            title: 'Hub Congestion Alert',
            description: 'North-East Hub is experiencing high dwell times (>45 mins).',
            severity: 'high', // high (red), medium (yellow), low (blue)
            icon: 'error',
            timestamp: '10:30 AM',
            location: 'North-East Hub',
            affectedDrivers: 12,
            recommendation: 'Reroute incoming traffic to South Hub temporarily.'
        },
        {
            id: 2,
            type: 'delayed',
            title: 'Delayed Shipments',
            description: '14 shipments at risk of missing SLA window in Sector 4.',
            severity: 'medium',
            icon: 'schedule',
            timestamp: '11:15 AM',
            location: 'Sector 4',
            impact: 'Potential SLA breach for 14 clients',
            recommendation: 'Assign priority status to these deliveries.'
        }
    ])

    // Mock Data: Drivers
    const drivers = ref([
        {
            id: 'D001',
            name: 'David Miller',
            status: 'breakdown', // active, breakdown, delayed, idle
            location: 'Route 4B',
            vehicle: 'Truck-402',
            efficiency: 85,
            phone: '+1 (555) 123-4567',
            currentJob: 'Delivery #9982',
            avatarColor: 'bg-gray-700',
            chatHistory: [
                { id: 1, text: 'Dispatch, engine light just came on.', sender: 'driver', time: '09:15 AM' },
                { id: 2, text: 'Copy that David. Pull over when safe. Sending mobile mechanic.', sender: 'dispatch', time: '09:16 AM' }
            ]
        },
        {
            id: 'D002',
            name: 'Sarah Jenkins',
            status: 'deviation',
            location: 'Sector 7',
            vehicle: 'Van-203',
            efficiency: 92,
            phone: '+1 (555) 987-6543',
            currentJob: 'Delivery #9991',
            avatarColor: 'bg-gray-700',
            chatHistory: [
                { id: 1, text: 'Hey Dispatch, traffic on Route 9 is heavily congested due to an accident.', sender: 'driver', time: '10:42 AM' },
                { id: 2, text: 'Copy that. Initiating AI load optimization now to reroute.', sender: 'dispatch', time: '10:43 AM' },
                { id: 3, text: 'Got the new route. Heading to the secondary interchange now. ETA updated by +15 mins.', sender: 'driver', time: '10:45 AM' }
            ]
        }
    ])

    // Mock Data: Hubs
    const hubs = ref([
        {
            id: 1,
            name: 'North-East Hub',
            capacity: 92,
            efficiency: 88,
            staffActive: 42,
            staffTotal: 50,
            vehiclesActive: 28,
            vehiclesTotal: 34,
            processRate: 1240,
            status: 'Congested',
            statusColor: 'text-red-500',
            bg: 'bg-red-500'
        },
        {
            id: 2,
            name: 'South Hub',
            capacity: 45,
            efficiency: 96,
            staffActive: 65,
            staffTotal: 68,
            vehiclesActive: 40,
            vehiclesTotal: 42,
            processRate: 850,
            status: 'Optimal',
            statusColor: 'text-green-500',
            bg: 'bg-green-500'
        },
        {
            id: 3,
            name: 'West DC-04',
            capacity: 78,
            efficiency: 74,
            staffActive: 28,
            staffTotal: 35,
            vehiclesActive: 19,
            vehiclesTotal: 25,
            processRate: 920,
            status: 'High Load',
            statusColor: 'text-yellow-500',
            bg: 'bg-yellow-500'
        }
    ])

    const pinnedHubs = ref([
        { id: 1, name: 'North-East Hub' },
        { id: 2, name: 'South Hub' }
    ])

    // --- Search & Notifications ---
    const searchQuery = ref('')
    const isSearchOpen = ref(false)
    const notifications = ref([
        {
            id: 1,
            title: 'New Hub Alert',
            message: 'North-East hub congestion > 90%',
            time: '2m ago',
            read: false,
            type: 'alert'
        },
        {
            id: 2,
            title: 'Driver Update',
            message: 'David Miller reported breakdown',
            time: '15m ago',
            read: false,
            type: 'warning'
        },
        {
            id: 3,
            title: 'Shipment Delivered',
            message: 'Order #45922 delivered to Zone B',
            time: '25m ago',
            read: false,
            type: 'success'
        },
        {
            id: 4,
            title: 'Maintenance Schedule',
            message: 'Fleet maintenance scheduled for tomorrow',
            time: '45m ago',
            read: false,
            type: 'info'
        },
        {
            id: 5,
            title: 'System Update',
            message: 'Platform update completed successfully',
            time: '1h ago',
            read: true,
            type: 'success'
        },
        {
            id: 6,
            title: 'Route Optimization',
            message: 'New routes available for South Hub',
            time: '2h ago',
            read: true,
            type: 'info'
        },
        {
            id: 7,
            title: 'System',
            message: 'Weekly report is ready for download',
            time: '3h ago',
            read: true,
            type: 'info'
        },
        {
            id: 8,
            title: 'Compliance Alert',
            message: 'Driver license expiring in 3 days (ID: 55)',
            time: '5h ago',
            read: true,
            type: 'warning'
        },
        {
            id: 9,
            title: 'Fuel Efficiency',
            message: 'Monthly fuel report generated',
            time: '1d ago',
            read: true,
            type: 'info'
        }
    ])

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
        if (!searchQuery.value) return drivers.value
        return drivers.value.filter(d =>
            d.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
            d.id.toLowerCase().includes(searchQuery.value.toLowerCase())
        )
    })

    // --- Actions ---

    function openModal(name, data = null) {
        activeModal.value = name
        selectedItem.value = data
        // Just in case, close search if modal opens
        isSearchOpen.value = false
    }

    function closeModal() {
        activeModal.value = null
        selectedItem.value = null
    }

    // Adds a dynamic alert
    function addAlert(alert) {
        alerts.value.unshift(alert)

        // Auto-remove after 5 seconds to act like an extended toast
        setTimeout(() => {
            resolveAlert(alert.id)
        }, 5000)
    }

    function resolveAlert(id) {
        alerts.value = alerts.value.filter(a => a.id !== id)
        closeModal()
    }

    function setWarehouse(id) {
        activeWarehouse.value = id

        if (id === 'all') {
            dashboardStats.value = { ...globalStats }
        } else if (warehouseMockData[id]) {
            dashboardStats.value = { ...warehouseMockData[id] }
        }

        // distinct from closeModal, as this might be called from dashboard directly
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

    function markNotificationRead(id) {
        const notif = notifications.value.find(n => n.id === id)
        if (notif) notif.read = true
    }

    function markAllNotificationsRead() {
        notifications.value.forEach(n => n.read = true)
    }

    function clearNotifications() {
        notifications.value = []
    }

    function toggleSearch() {
        isSearchOpen.value = !isSearchOpen.value
        if (!isSearchOpen.value) searchQuery.value = ''
    }

    // --- Action Logic: Chat ---
    function sendMessageToDriver(driverId, text) {
        const driver = drivers.value.find(d => d.id === driverId)
        if (!driver) return

        const now = new Date()
        const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

        // 1. Push user (dispatch) message instantly
        driver.chatHistory.push({
            id: Date.now(),
            text: text,
            sender: 'dispatch',
            time: timeString
        })

        // 2. Simulate driver typing / delayed reply
        setTimeout(() => {
            driver.chatHistory.push({
                id: Date.now() + 1,
                text: 'Copy that. I will keep you posted.',
                sender: 'driver',
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            })
        }, 2500)
    }

    return {
        // State
        activeWarehouse,
        activeModal,
        selectedItem,
        dashboardStats,
        alerts,
        drivers,
        hubs,
        pinnedHubs,
        searchQuery,
        isSearchOpen,
        notifications,
        tasks,
        // Getters
        activeWarehouseName,
        unreadNotificationsCount,
        filteredDrivers,
        // Actions
        openModal,
        closeModal,
        addAlert,
        resolveAlert,
        setWarehouse,
        togglePin,
        markNotificationRead,
        markAllNotificationsRead,
        clearNotifications,
        toggleSearch,
        sendMessageToDriver
    }
})
