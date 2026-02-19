import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useLogisticStore = defineStore('logistic', () => {
    // --- State ---

    // Active Context
    const activeWarehouse = ref('all') // 'all' or specific hub ID
    const activeModal = ref(null) // 'alert-details', 'driver-profile', 'warehouse-select', etc.
    const selectedItem = ref(null) // Data payload for the active modal

    // Mock Data: KPIs
    // Mock Data: KPIs
    const globalStats = {
        orders: 1248,
        activeDeliveries: 342,
        deliverySuccess: 98.2,
        revenue: 42500,
        ordersTrend: 12.5,
        revenueTrend: 8.2,
        slaCompliance: {
            week: [92, 94, 88, 95, 90, 96, 98],
            month: [85, 88, 87, 89, 90, 92, 91, 93, 89, 88, 90, 92, 94, 95, 96, 95, 94, 93, 92, 91, 90, 89, 88, 90, 92, 94, 96, 98, 99, 98]
        }
    }

    const dashboardStats = ref({ ...globalStats })

    // Specific Data for Hubs to simulate interactivity
    const warehouseMockData = {
        1: { // North-East Hub
            orders: 412,
            activeDeliveries: 156,
            deliverySuccess: 89.5,
            revenue: 12500,
            ordersTrend: -5.4,
            revenueTrend: -2.1,
            slaCompliance: {
                week: [82, 80, 75, 78, 80, 82, 85],
                month: Array(30).fill(80).map(() => 75 + Math.floor(Math.random() * 15))
            }
        },
        2: { // South Hub
            orders: 580,
            activeDeliveries: 89,
            deliverySuccess: 99.4,
            revenue: 24800,
            ordersTrend: 15.2,
            revenueTrend: 18.5,
            slaCompliance: {
                week: [96, 97, 98, 98, 99, 99, 100],
                month: Array(30).fill(98).map(() => 95 + Math.floor(Math.random() * 5))
            }
        },
        3: { // West DC-04
            orders: 256,
            activeDeliveries: 97,
            deliverySuccess: 94.1,
            revenue: 8200,
            ordersTrend: 2.1,
            revenueTrend: 4.5,
            slaCompliance: {
                week: [90, 92, 91, 93, 90, 92, 94],
                month: Array(30).fill(92).map(() => 88 + Math.floor(Math.random() * 8))
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
            avatarColor: 'bg-gray-700'
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
            avatarColor: 'bg-gray-700'
        }
    ])

    // Mock Data: Hubs
    const hubs = ref([
        {
            id: 1,
            name: 'North-East Hub',
            capacity: 92,
            processRate: 1240,
            status: 'Congested',
            statusColor: 'text-red-500',
            bg: 'bg-red-500'
        },
        {
            id: 2,
            name: 'South Hub',
            capacity: 45,
            processRate: 850,
            status: 'Optimal',
            statusColor: 'text-green-500',
            bg: 'bg-green-500'
        },
        {
            id: 3,
            name: 'West DC-04',
            capacity: 78,
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
        // Getters
        activeWarehouseName,
        unreadNotificationsCount,
        filteredDrivers,
        // Actions
        openModal,
        closeModal,
        resolveAlert,
        setWarehouse,
        togglePin,
        markNotificationRead,
        markAllNotificationsRead,
        clearNotifications,
        toggleSearch
    }
})
