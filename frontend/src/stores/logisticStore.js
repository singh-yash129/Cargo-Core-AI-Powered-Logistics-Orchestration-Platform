import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useLogisticStore = defineStore('logistic', () => {
    // --- State ---

    // Active Context
    const activeWarehouse = ref('all') // 'all' or specific hub ID
    const activeModal = ref(null) // 'alert-details', 'driver-profile', 'warehouse-select', etc.
    const selectedItem = ref(null) // Data payload for the active modal
    const comparedWarehouses = ref([]) // Warehouses currently in the comparison view

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
            hubId: 1,
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
            hubId: 2,
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

    const topDrivers = ref([
        { id: 1, hubId: 1, name: 'Lewis Hamilton', rating: 4.9, trips: 142, ontime: 99, avatar: 'https://i.pravatar.cc/150?u=20' },
        { id: 2, hubId: 1, name: 'Max Verstappen', rating: 4.8, trips: 138, ontime: 97, avatar: 'https://i.pravatar.cc/150?u=21' },
        { id: 3, hubId: 2, name: 'Charles Leclerc', rating: 4.7, trips: 120, ontime: 95, avatar: 'https://i.pravatar.cc/150?u=22' },
    ])

    const vehicles = ref([
        { id: 'TRK-992', type: 'Heavy Truck', hubId: 1, model: 'Volvo FH16', year: 2021, licensePlate: 'NY-442-XM', status: 'In Shop', driver: 'Unassigned', fuelEfficiency: '8.2 MPG', mileage: 124500, nextService: 'Overdue' },
        { id: 'VAN-104', type: 'Delivery Van', hubId: 1, model: 'Ford Transit', year: 2022, licensePlate: 'NY-991-AB', status: 'Scheduled', driver: 'David Miller', fuelEfficiency: '18.5 MPG', mileage: 45200, nextService: 'Oct 28, 2023' },
        { id: 'TRK-221', type: 'Heavy Truck', hubId: 2, model: 'Peterbilt 579', year: 2020, licensePlate: 'TX-118-PQ', status: 'Active', driver: 'Sarah Jenkins', fuelEfficiency: '7.9 MPG', mileage: 210000, nextService: 'Nov 15, 2023' },
        { id: 'VAN-882', type: 'Delivery Van', hubId: 2, model: 'Mercedes Sprinter', year: 2023, licensePlate: 'TX-442-ZZ', status: 'Active', driver: 'Unassigned', fuelEfficiency: '20.1 MPG', mileage: 12000, nextService: 'Jan 10, 2024' },
    ])

    const maintenance = ref([
        { id: 'TRK-992', hubId: 1, issue: 'Engine Check Light', status: 'In Shop', statusClass: 'bg-red-500/10 text-red-500' },
        { id: 'VAN-104', hubId: 1, issue: 'Tire Replacement', status: 'Scheduled', statusClass: 'bg-yellow-500/10 text-yellow-500' },
        { id: 'TRK-221', hubId: 2, issue: 'Oil Change', status: 'Overdue', statusClass: 'bg-orange-500/10 text-orange-500' },
    ])

    const transactions = ref([
        { id: 'TX-99212', hubId: 1, date: 'Oct 24, 2023', desc: 'Client Payment - Amazon', type: 'Incoming', amount: 15400, status: 'Completed' },
        { id: 'TX-99213', hubId: 1, date: 'Oct 24, 2023', desc: 'Fuel Expense - Shell', type: 'Expense', amount: -2400, status: 'Completed' },
        { id: 'TX-99214', hubId: 2, date: 'Oct 23, 2023', desc: 'Driver Payout - Weekly', type: 'Payroll', amount: -6500, status: 'Paid' },
        { id: 'TX-99215', hubId: 2, date: 'Oct 23, 2023', desc: 'COD Deposit - Zone A', type: 'Incoming', amount: 1250, status: 'Pending' },
    ])

    const reports = ref([
        { id: 'RPT-1', hubId: 1, title: 'Monthly Financial Summary', date: 'Oct 31, 2023', icon: 'picture_as_pdf', color: 'red' },
        { id: 'RPT-2', hubId: 1, title: 'Driver Performance Log', date: 'Yesterday', icon: 'table_view', color: 'green' },
        { id: 'RPT-3', hubId: 2, title: 'SLA Breach Analysis', date: '2 hours ago', icon: 'analytics', color: 'blue' },
        { id: 'RPT-4', hubId: 2, title: 'Fleet Efficiency Report', date: 'Oct 28, 2023', icon: 'local_shipping', color: 'orange' },
    ])

    const users = ref([
        { name: 'Sarah Connor', hubId: 1, email: 'sarah.c@cargocore.com', role: 'Logistic Manager', status: 'Active', lastLogin: '2 mins ago', avatar: 'https://i.pravatar.cc/150?u=5', username: 'WM-001', password: 'password123', pending_payout: 4200 },
        { name: 'John Wick', hubId: 1, email: 'john.w@cargocore.com', role: 'Dispatcher', status: 'Active', lastLogin: '1 hour ago', avatar: 'https://i.pravatar.cc/150?u=8', username: 'DSP-001', password: 'password123', pending_payout: 0 },
        { name: 'Ellen Ripley', hubId: 2, email: 'ellen.r@cargocore.com', role: 'Warehouse Manager', status: 'Inactive', lastLogin: '2 days ago', avatar: 'https://i.pravatar.cc/150?u=9', username: 'WM-002', password: 'password123', pending_payout: 3100 },
        { name: 'Marty McFly', hubId: 2, email: 'marty.m@cargocore.com', role: 'Driver', status: 'Active', lastLogin: 'Just now', avatar: 'https://i.pravatar.cc/150?u=12', username: 'DRV-001', password: 'password123', pending_payout: 1250 },
        { name: 'Diana Prince', hubId: 'all', email: 'diana.p@cargocore.com', role: 'Customer Support', status: 'Active', lastLogin: '10 mins ago', avatar: 'https://i.pravatar.cc/150?u=31', username: 'CS-001', password: 'password123', pending_payout: 0 },
    ])

    const returns = ref([
        { 
            id: 'RMA-9921', 
            hubId: 1, 
            orderId: 'ORD-1102', 
            customer: 'Alice Cooper', 
            reason: 'Damaged in transit', 
            condition: 'Damaged', 
            status: 'Pending', 
            originalPrice: 150.00,
            refundAmount: 0,
            images: [
                'https://placehold.co/600x400/png?text=Damaged+Box+Corner',
                'https://placehold.co/600x400/png?text=Dented+Product'
            ]
        },
        { 
            id: 'RMA-9922', 
            hubId: 1, 
            orderId: 'ORD-3321', 
            customer: 'Bob Dylan', 
            reason: 'Wrong Item Sent', 
            condition: 'New/Open Box', 
            status: 'Pending', 
            originalPrice: 200.00,
            refundAmount: 0,
            images: [
                'https://placehold.co/600x400/png?text=Wrong+Item+Label'
            ]
        },
        { 
            id: 'RMA-9923', 
            hubId: 2, 
            orderId: 'ORD-5541', 
            customer: 'Charlie Watts', 
            reason: 'Changed Mind', 
            condition: 'Unopened', 
            status: 'Approved', 
            refundAmount: 1250,
            images: []
        },
        { 
            id: 'RMA-9924', 
            hubId: 2, 
            orderId: 'ORD-1105', 
            customer: 'David Gilmour', 
            reason: 'Defective', 
            condition: 'Defective', 
            status: 'Rejected', 
            refundAmount: 0,
            images: [
                 'https://placehold.co/600x400/png?text=Defective+Screen',
                 'https://placehold.co/600x400/png?text=Serial+Number'
            ]
        },
    ])

    const zones = ref([
        { id: 1, hubId: 1, name: 'Downtown Delivery Zone', type: 'Polygon', radius: 12 },
        { id: 2, hubId: 1, name: 'North-East Hub Perimeter', type: 'Circle', radius: 0.5 },
        { id: 3, hubId: 2, name: 'Red Zone - Construction', type: 'Exclusion', radius: 2.5 },
        { id: 4, hubId: 2, name: 'Airport Logistics Corridor', type: 'Polygon', radius: 45 },
    ])

    const chats = ref([
        { 
            id: 1, 
            hubId: 1, 
            name: 'Dispatcher Mike', 
            time: '2m', 
            lastMessage: 'Two trucks are down.', 
            status: 'Online',
            phone: '+1 (555) 012-3456',
            messages: [
                { id: 1, text: 'Hi Boss, we have a situation at Hub 4.', sender: 'other', time: '10:30 AM' },
                { id: 2, text: 'Two trucks are down. We need approval for expedited maintenance.', sender: 'other', time: '10:32 AM' },
                { id: 3, text: 'Approved. Get them fixed ASAP. Use the contingency budget.', sender: 'me', time: '10:35 AM' }
            ]
        },
        { 
            id: 2, 
            hubId: 1, 
            name: 'Warehouse Team A', 
            time: '1h', 
            lastMessage: 'Inventory count complete.', 
            status: 'Offline',
            phone: '+1 (555) 012-7890',
            messages: [
                { id: 1, text: 'Starting inventory count for Zone A.', sender: 'other', time: '08:00 AM' },
                { id: 2, text: 'Checking crates and pallets now.', sender: 'other', time: '09:15 AM' },
                { id: 3, text: 'Inventory count complete. Report filed.', sender: 'other', time: '09:45 AM' }
            ]
        },
        { 
            id: 3, 
            hubId: 2, 
            name: 'Sarah (Admin)', 
            time: '3h', 
            lastMessage: 'Payroll report is ready.', 
            status: 'Away',
            phone: '+1 (555) 012-4567',
            messages: [
                 { id: 1, text: 'Hey, did you review the payroll yet?', sender: 'other', time: '07:30 AM' },
                 { id: 2, text: 'Not yet, sending it over in an hour.', sender: 'me', time: '07:35 AM' }
            ]
        },
        { 
            id: 4, 
            hubId: 2, 
            name: 'Global Broadcast', 
            time: '1d', 
            lastMessage: 'System maintenance scheduled.', 
            status: 'Online',
            phone: '',
            messages: [
                { id: 1, text: 'System maintenance scheduled for this Sunday at 2 AM EST.', sender: 'other', time: 'Yesterday' }
            ]
        },
    ])

    const inventory = ref([
        { id: 'INV-001', name: 'Packing Tape', category: 'Consumables', quantity: 1540, unit: 'Rolls', threshold: 200, location: 'Zone A', status: 'Good', hubId: 1 },
        { id: 'INV-002', name: 'Cardboard Box (L)', category: 'Packaging', quantity: 4200, unit: 'Pcs', threshold: 1000, location: 'Zone A', status: 'Good', hubId: 1 },
        { id: 'INV-003', name: 'Cardboard Box (M)', category: 'Packaging', quantity: 850, unit: 'Pcs', threshold: 1000, location: 'Zone B', status: 'Low Stock', hubId: 2 },
        { id: 'INV-004', name: 'Plastic Crates', category: 'Equipment', quantity: 320, unit: 'Units', threshold: 50, location: 'Zone C', status: 'Good', hubId: 1 },
        { id: 'INV-005', name: 'Forklift Batteries', category: 'Equipment', quantity: 12, unit: 'Units', threshold: 5, location: 'Zone C', status: 'Good', hubId: 2 },
        { id: 'INV-006', name: 'Barcode Scanners', category: 'Devices', quantity: 45, unit: 'Units', threshold: 10, location: 'Office', status: 'Good', hubId: 1 },
        { id: 'INV-007', name: 'Stretch Wrap', category: 'Consumables', quantity: 85, unit: 'Rolls', threshold: 20, location: 'Zone A', status: 'Good', hubId: 2 },
        { id: 'INV-008', name: 'Safety Vests', category: 'Uniform', quantity: 150, unit: 'Pcs', threshold: 50, location: 'HR', status: 'Good', hubId: 1 },
        { id: 'INV-009', name: 'Cargo Straps', category: 'Cargo', quantity: 500, unit: 'Set', threshold: 100, location: 'Loading Dock', status: 'Good', hubId: 1 },
        { id: 'INV-010', name: 'Utensils (Breakroom)', category: 'Utensils', quantity: 200, unit: 'Set', threshold: 50, location: 'Breakroom', status: 'Low Stock', hubId: 2 },
    ])

    // Mock Data: Hubs
    const hubs = ref([
        {
            id: 1,
            hubCode: 'HUB-NY-01',
            name: 'North-East Hub',
            location: 'New York, NY',
            manager: 'Alex Chen',
            managerInitials: 'AC',
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
            hubCode: 'HUB-TX-04',
            name: 'South Hub',
            location: 'Austin, TX',
            manager: 'Sarah Connor',
            managerInitials: 'SC',
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
            hubCode: 'HUB-CA-02',
            name: 'West DC-04',
            location: 'Los Angeles, CA',
            manager: 'Mike Ross',
            managerInitials: 'MR',
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
        let result = drivers.value

        // Context Filter
        if (activeWarehouse.value !== 'all') {
            result = result.filter(d => d.hubId === activeWarehouse.value)
        }

        // Search Filter
        if (searchQuery.value) {
            const q = searchQuery.value.toLowerCase()
            result = result.filter(d => d.name.toLowerCase().includes(q) || d.id.toLowerCase().includes(q))
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
        // Update getters to handle string 'all' for hubId so global users appear everywhere
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

    function addTransaction(tx) {
        transactions.value.unshift(tx)
    }

    function updateReturnStatus(rmaId, newStatus, details = {}) {
        const rma = returns.value.find(r => r.id === rmaId)
        if (rma) {
            rma.status = newStatus
            if (details.refundAmount) rma.refundAmount = details.refundAmount
            if (details.notes) rma.notes = details.notes
            if (details.condition) rma.condition = details.condition
        }
    }

    function updateUserBalance(userId, amount) {
        const user = users.value.find(u => u.username === userId || u.id === userId)
        if (user) {
             if (!user.balance) user.balance = 0
             user.balance += amount
             
             // Mock clearing pending payout
             if (amount < 0 && user.pending_payout) {
                 user.pending_payout += amount 
                 if (user.pending_payout < 0) user.pending_payout = 0
             }
        }
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

    function updateDriverStatus(driverId, newStatus) {
        const driver = drivers.value.find(d => d.id === driverId)
        if (driver) driver.status = newStatus
    }

    // --- Action Logic: Fleet Management ---
    function addVehicle(vehicleData) {
        vehicles.value.unshift({
            ...vehicleData,
            status: vehicleData.status || 'Active',
            mileage: 0,
            driver: 'Unassigned',
            fuelEfficiency: 'Pending Calibration',
            nextService: 'In 6 Months'
        })
    }

    function updateVehicleStatus(vehicleId, newStatus) {
        const vehicle = vehicles.value.find(v => v.id === vehicleId)
        if (vehicle) vehicle.status = newStatus

        // Sync with maintenance alerts
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
            // Remove from maintenance if it's back to active
            maintenance.value = maintenance.value.filter(m => m.id !== vehicleId)
        }
    }

    // --- Action Logic: Warehouse Management ---
    function addHub(hubData) {
        // Find highest ID
        const maxId = hubs.value.reduce((max, h) => Math.max(max, h.id), 0)

        hubs.value.push({
            ...hubData,
            id: maxId + 1,
            // Assign arbitrary baseline stats for new hubs
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
            // Recalculate colors based on status
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

        // Remove from pinned if it was
        pinnedHubs.value = pinnedHubs.value.filter(id => id !== hubId)

        // Reset global context if deleted
        if (activeWarehouse.value === hubId) {
            activeWarehouse.value = 'all'
        }
    }

    // --- Action Logic: User Management ---
    function addUser(userData) {
        users.value.unshift({
            ...userData,
            lastLogin: 'Never',
            avatar: userData.avatar || `https://i.pravatar.cc/150?u=${Math.random()}` // generic placeholder
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

    return {
        // State
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
        filteredInventory: computed(() => {
            if (activeWarehouse.value === 'all') return inventory.value
            return inventory.value.filter(i => i.hubId === activeWarehouse.value)
        }),
        // Actions
        openModal,
        closeModal,
        addTransaction,
        updateUserBalance,
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
        toggleUserStatus
    }
})
