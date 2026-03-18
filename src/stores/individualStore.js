import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

let orderCounter = 3050

function generateOrderId() {
    orderCounter++
    return `MOV-${orderCounter}`
}

export const useIndividualStore = defineStore('individual', () => {
    const authUser = typeof window !== 'undefined'
        ? JSON.parse(localStorage.getItem('auth_user') || 'null')
        : null

    // ─── User Profile ────────────────────────────────────────────
    const user = ref({
        name: authUser?.name || 'Alex Johnson',
        avatar: null,
        email: authUser?.email || 'alex.johnson@email.com',
        phone: authUser?.phone || '+91 0000000000',
        altPhone: '+91 0000000000',
        joiningDate: authUser?.created_at || new Date().toISOString(),
        tier: 'Gold Member',
        address: '42, Green Park, New Delhi - 110016',
        language: 'English',
        paymentDefault: 'Full Payment',
        notificationsEnabled: true,
        smsAlerts: true,
    })
    const dashboardSummary = ref(null)
    const dashboardLoading = ref(false)
    const dashboardError = ref('')
    const quotesLoading = ref(false)
    const quotesError = ref('')
    const trackingLoading = ref(false)
    const trackingError = ref('')
    const profileLoading = ref(false)
    const profileError = ref('')
    const paymentsLoading = ref(false)
    const paymentsError = ref('')
    const damageReportsLoading = ref(false)
    const damageReportsError = ref('')
    const settingsLoading = ref(false)
    const settingsError = ref('')
    const ordersLoading = ref(false)
    const ordersError = ref('')
    const paymentsSummary = ref(null)

    const savedAddresses = ref([
        { id: 1, label: 'Home', icon: 'home', address: '42, Green Park', city: 'New Delhi', state: 'Delhi', pincode: '110016', phone: '+91 0000000000' },
        { id: 2, label: 'Office', icon: 'business', address: '15, Sector 62', city: 'Noida', state: 'UP', pincode: '201301', phone: '+91 0000000000' },
        { id: 3, label: 'Parent\'s House', icon: 'family_restroom', address: '8, DLF Phase 3', city: 'Gurgaon', state: 'Haryana', pincode: '122002', phone: '+91 0000000000' },
    ])

    const userInitials = computed(() =>
        user.value.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
    )

    // ─── Vehicle Fleet Catalog ──────────────────────────────────
    const vehicleTypes = ref([
        { key: 'mini-truck', name: 'Mini Truck', icon: 'local_shipping', capacity: '500 kg / 1 BHK', seats: 2, priceMultiplier: 1.0, desc: 'Ideal for small moves & packages' },
        { key: 'tempo', name: 'Tempo', icon: 'airport_shuttle', capacity: '1.5 Ton / 2 BHK', seats: 3, priceMultiplier: 1.4, desc: 'Best for 1-2 BHK apartments' },
        { key: 'lcv', name: 'LCV (Eicher)', icon: 'fire_truck', capacity: '3 Ton / 3 BHK', seats: 4, priceMultiplier: 2.0, desc: 'Large apartments & offices' },
        { key: 'hcv', name: 'HCV (Container)', icon: 'rv_hookup', capacity: '7+ Ton / Villa', seats: 6, priceMultiplier: 3.2, desc: 'Full villa / warehouse shift' },
    ])

    // ─── Orders ──────────────────────────────────────────────────
    const orders = ref([
        {
            id: 'MOV-3048', status: 'in-transit', moveType: 'house-shift', cargoType: 'Household Goods',
            pickup: '42, Green Park, New Delhi', destination: '15, Sector 62, Noida',
            date: '2026-03-02', timeWindow: '14:00 PM - 16:30 PM',
            laborCount: 2, packingRequired: true, vehicleType: 'tempo',
            materials: { boxes: 3, bubbleWrap: 1 },
            cost: { base: 4500, labor: 1600, materials: 850, packing: 1200, vehicle: 1800, platformFee: 249, taxes: 1791, total: 11990 },
            driver: { name: 'Mike Ross', phone: '+91 0000000000', rating: 4.9 },
            eta: '14:30 PM', progress: 60,
            paymentMode: 'Full Payment', paymentStatus: 'paid', isDummyPayment: false,
            rating: null, feedback: '',
            createdAt: '2026-03-01T08:30:00',
            serviceTimeBlock: '2.5 hours',
            dwellTime: { loading: 42, unloading: 0, total: 42 },
            beforeAfterPhotos: { beforePacking: '📸 3 photos', afterPacking: '📸 2 photos', afterUnloading: null },
            crewCheckin: { driver: true, laborers: [{ name: 'Ravi', checkedIn: true }, { name: 'Sunil', checkedIn: true }] },
            transportLog: [
                { event: 'Order Placed', time: '2026-03-01 08:30 AM', icon: 'receipt', color: 'green' },
                { event: 'Crew Assigned', time: '2026-03-01 09:00 AM', icon: 'group', color: 'blue' },
                { event: 'Vehicle Reserved (Tempo)', time: '2026-03-01 09:05 AM', icon: 'local_shipping', color: 'purple' },
                { event: 'Dispatched from Hub', time: '2026-03-02 09:30 AM', icon: 'departure_board', color: 'blue' },
                { event: 'Near Pickup (2km)', time: '2026-03-02 10:05 AM', icon: 'near_me', color: 'amber' },
                { event: 'Arrived at Pickup', time: '2026-03-02 10:15 AM', icon: 'location_on', color: 'green' },
                { event: 'Loading Started', time: '2026-03-02 10:20 AM', icon: 'unarchive', color: 'blue' },
                { event: 'Loading Complete', time: '2026-03-02 11:02 AM', icon: 'check_circle', color: 'green' },
                { event: 'In Transit to Destination', time: '2026-03-02 11:10 AM', icon: 'route', color: 'blue' },
            ],
        },
        {
            id: 'MOV-3045', status: 'delivered', moveType: 'house-shift', cargoType: 'Furniture',
            pickup: '22, Vasant Kunj, Delhi', destination: '8, DLF Phase 3, Gurgaon',
            date: '2026-02-28', timeWindow: '09:00 AM - 11:00 AM',
            laborCount: 3, packingRequired: true, vehicleType: 'lcv',
            materials: { boxes: 5, blankets: 8, wardrobeBoxes: 2, tape: 2 },
            cost: { base: 5200, labor: 2400, materials: 1100, packing: 1500, vehicle: 3200, platformFee: 249, taxes: 2412, total: 16061 },
            driver: { name: 'Raj Kumar', phone: '+91 0000000000', rating: 4.7 },
            eta: null, progress: 100,
            paymentMode: 'COD', paymentStatus: 'paid', isDummyPayment: false,
            rating: 5, feedback: 'Excellent service, handled furniture carefully!',
            pod: { photos: true, signature: true, qrScan: true },
            createdAt: '2026-02-27T10:00:00',
            serviceTimeBlock: '3 hours',
            dwellTime: { loading: 55, unloading: 40, total: 95 },
            beforeAfterPhotos: { beforePacking: '📸 5 photos', afterPacking: '📸 4 photos', afterUnloading: '📸 3 photos' },
            crewCheckin: { driver: true, laborers: [{ name: 'Amit', checkedIn: true }, { name: 'Deepak', checkedIn: true }, { name: 'Karan', checkedIn: true }] },
            transportLog: [
                { event: 'Order Placed', time: '2026-02-27 10:00 AM', icon: 'receipt', color: 'green' },
                { event: 'Crew Assigned', time: '2026-02-27 10:30 AM', icon: 'group', color: 'blue' },
                { event: 'Vehicle Reserved (LCV)', time: '2026-02-27 10:35 AM', icon: 'local_shipping', color: 'purple' },
                { event: 'Dispatched from Hub', time: '2026-02-28 08:30 AM', icon: 'departure_board', color: 'blue' },
                { event: 'Arrived at Pickup', time: '2026-02-28 09:00 AM', icon: 'location_on', color: 'green' },
                { event: 'Loading Started', time: '2026-02-28 09:10 AM', icon: 'unarchive', color: 'blue' },
                { event: 'Loading Complete', time: '2026-02-28 10:05 AM', icon: 'check_circle', color: 'green' },
                { event: 'In Transit', time: '2026-02-28 10:15 AM', icon: 'route', color: 'blue' },
                { event: 'Arrived at Destination', time: '2026-02-28 11:20 AM', icon: 'flag', color: 'amber' },
                { event: 'Unloading Complete', time: '2026-02-28 12:00 PM', icon: 'check_circle', color: 'green' },
                { event: 'PoD Captured', time: '2026-02-28 12:05 PM', icon: 'verified', color: 'green' },
                { event: 'Delivered ✓', time: '2026-02-28 12:10 PM', icon: 'task_alt', color: 'green' },
            ],
        },
        {
            id: 'MOV-3040', status: 'pending', moveType: 'small-package', cargoType: 'Luggage / Boxes',
            pickup: '12, Lajpat Nagar, Delhi', destination: '45, Indiranagar, Bangalore',
            date: '2026-03-05', timeWindow: '08:00 AM - 10:00 AM',
            laborCount: 1, packingRequired: false, vehicleType: 'mini-truck',
            materials: {},
            cost: { base: 8500, labor: 800, materials: 0, packing: 0, vehicle: 0, platformFee: 249, taxes: 1674, total: 11223 },
            driver: null,
            eta: null, progress: 0,
            paymentMode: 'Partial', paymentStatus: 'pending', isDummyPayment: false,
            rating: null, feedback: '',
            createdAt: '2026-03-01T15:00:00',
            serviceTimeBlock: '1 hour',
            dwellTime: { loading: 0, unloading: 0, total: 0 },
            beforeAfterPhotos: {},
            crewCheckin: null,
            preferredPickupDate: '2026-03-05',
            estimatedDelivery: '2026-03-07',
            transportLog: [
                { event: 'Order Placed', time: '2026-03-01 03:00 PM', icon: 'receipt', color: 'green' },
                { event: 'Awaiting Pickup Schedule', time: '2026-03-01 03:05 PM', icon: 'schedule', color: 'amber' },
            ],
        },
    ])

    const activeOrders = computed(() => orders.value.filter(o => o.status === 'in-transit'))
    const pendingOrders = computed(() => orders.value.filter(o => o.status === 'pending'))
    const deliveredOrders = computed(() => orders.value.filter(o => o.status === 'delivered'))
    const cancelledOrders = computed(() => orders.value.filter(o => o.status === 'cancelled'))
    const totalSpent = computed(() => orders.value.filter(o => o.paymentStatus === 'paid').reduce((s, o) => s + o.cost.total, 0))

    const walletBalance = ref(2500)
    function addFunds(amount) {
        if (amount > 0) walletBalance.value += amount
    }

    // ─── Monthly Spending (for chart) ────────────────────────────
    const monthlySpending = ref([
        { month: 'Oct', amount: 4200 },
        { month: 'Nov', amount: 7800 },
        { month: 'Dec', amount: 3500 },
        { month: 'Jan', amount: 12400 },
        { month: 'Feb', amount: 13400 },
        { month: 'Mar', amount: 9950 },
    ])

    // ─── Quotes ──────────────────────────────────────────────────
    const quotes = ref([
        { id: 'QT-501', cargoType: 'Household Goods', from: 'Delhi', to: 'Noida', laborCount: 2, packing: true, total: 8150, date: '2026-03-01', status: 'active' },
        { id: 'QT-502', cargoType: 'Office Shift', from: 'Mumbai', to: 'Pune', laborCount: 4, packing: true, total: 18500, date: '2026-02-28', status: 'expired' },
    ])

    // ─── Payments ────────────────────────────────────────────────
    const payments = ref([
        { id: 'PAY-801', orderId: 'MOV-3048', amount: 11990, mode: 'UPI', status: 'completed', date: '2026-03-01T09:00:00', isDummy: false },
        { id: 'PAY-800', orderId: 'MOV-3045', amount: 16061, mode: 'COD', status: 'completed', date: '2026-02-28T16:30:00', isDummy: false },
    ])

    // ─── Damage Reports ──────────────────────────────────────────
    const damageReports = ref([])

    // ─── Notifications ───────────────────────────────────────────
    const notifications = ref([
        { id: 1, title: 'Move Update', message: 'Your crew is on the way!', time: '10 min ago', read: false, icon: 'local_shipping' },
        { id: 2, title: 'Payment Received', message: '₹9,950 payment confirmed.', time: '1 hour ago', read: false, icon: 'payments' },
        { id: 3, title: 'Delivery Complete', message: 'MOV-3045 delivered successfully.', time: '2 days ago', read: true, icon: 'task_alt' },
    ])

    const unreadNotificationsCount = computed(() => notifications.value.filter(n => !n.read).length)

    function normalizeBackendStatus(status) {
        const value = String(status || '').toUpperCase()
        if (value === 'DRAFT' || value === 'CONFIRMED') return 'pending'
        if (value === 'ASSIGNED' || value === 'IN_TRANSIT') return 'in-transit'
        if (value === 'DELIVERED' || value === 'CLOSED') return 'delivered'
        if (value === 'CANCELLED') return 'cancelled'
        return value.toLowerCase()
    }

    function normalizeBackendOrder(order) {
        const status = normalizeBackendStatus(order.status)
        return {
            id: order.tracking_code || String(order.id),
            backendId: order.id,
            trackingCode: order.tracking_code,
            status,
            rawStatus: order.status,
            moveType: String(order.order_type || '').toUpperCase() === 'INDIVIDUAL' ? 'house-shift' : 'small-package',
            cargoType: order.cargo_type || (String(order.order_type || '').toUpperCase() === 'INDIVIDUAL' ? 'Household Goods' : (order.order_type || 'Order')),
            pickup: order.pickup_addr,
            destination: order.delivery_addr,
            date: order.scheduled_at ? new Date(order.scheduled_at).toLocaleDateString('en-CA') : new Date(order.created_at).toLocaleDateString('en-CA'),
            timeWindow: order.scheduled_at ? new Date(order.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'TBD',
            laborCount: order.labor_count || 0,
            packingRequired: Number(order.packing_amount || 0) > 0,
            vehicleType: order.vehicle_type || String(order.order_type || 'move').toLowerCase(),
            materials: {},
            cost: {
                base: Number(order.base_amount || 0),
                labor: Number(order.labor_amount || 0),
                materials: Number(order.materials_amount || 0),
                packing: Number(order.packing_amount || 0),
                vehicle: Number(order.vehicle_amount || 0),
                platformFee: Number(order.platform_fee || 0),
                taxes: Number(order.tax_amount || 0),
                total: Number(order.total_amount || 0),
            },
            driver: null,
            eta: order.scheduled_at ? new Date(order.scheduled_at).toLocaleString() : 'TBD',
            progress: status === 'delivered' ? 100 : status === 'in-transit' ? 60 : 0,
            paymentMode: order.payment_mode || 'Pending',
            paymentStatus: order.payment_status || (status === 'delivered' ? 'paid' : 'pending'),
            isDummyPayment: false,
            rating: null,
            feedback: '',
            createdAt: order.created_at,
            serviceTimeBlock: order.service_time_block || 'TBD',
            dwellTime: { loading: 0, unloading: 0, total: 0 },
            beforeAfterPhotos: {},
            crewCheckin: null,
            transportLog: [
                { event: `Order ${order.status}`, time: new Date(order.created_at).toLocaleString(), icon: 'receipt', color: 'green' },
            ],
            pod: null,
            cancellation: order.cancel_reason ? { reason: order.cancel_reason, fee: 0, date: new Date().toISOString() } : null,
        }
    }

    function normalizeTrackingOrder(order) {
        return {
            id: order.tracking_code || String(order.id),
            backendId: order.id,
            trackingCode: order.tracking_code,
            status: order.ui_status || normalizeBackendStatus(order.status),
            rawStatus: order.status,
            moveType: 'house-shift',
            cargoType: 'Household Goods',
            pickup: order.pickup_addr,
            destination: order.delivery_addr,
            date: order.scheduled_at ? new Date(order.scheduled_at).toLocaleDateString('en-CA') : new Date(order.created_at).toLocaleDateString('en-CA'),
            timeWindow: order.scheduled_at ? new Date(order.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'TBD',
            laborCount: 0,
            packingRequired: false,
            vehicleType: 'assigned',
            materials: {},
            cost: { base: 0, labor: 0, materials: 0, packing: 0, vehicle: 0, platformFee: 0, taxes: 0, total: 0 },
            driver: null,
            eta: order.eta_label || 'TBD',
            progress: order.progress ?? 0,
            paymentMode: 'Pending',
            paymentStatus: order.ui_status === 'delivered' ? 'paid' : 'pending',
            isDummyPayment: false,
            rating: null,
            feedback: '',
            createdAt: order.created_at,
            serviceTimeBlock: order.scheduled_at ? new Date(order.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'TBD',
            dwellTime: { loading: 0, unloading: 0, total: 0 },
            beforeAfterPhotos: {},
            crewCheckin: null,
            transportLog: order.transport_log || [],
            pod: null,
            cancellation: null,
        }
    }

    function mapQuote(quote) {
        return {
            id: quote.id,
            cargoType: quote.cargo_type,
            from: quote.from_location,
            to: quote.to_location,
            laborCount: quote.labor_count,
            packing: quote.packing,
            total: quote.total,
            date: quote.date,
            status: quote.status,
        }
    }

    async function fetchDashboardSummary() {
        dashboardLoading.value = true
        dashboardError.value = ''

        try {
            const token = localStorage.getItem('auth_token')
            const response = await fetch('http://localhost:8000/api/v1/customer/dashboard', {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            })

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}))
                dashboardError.value = errData.detail || 'Failed to load dashboard data.'
                return { success: false, message: dashboardError.value }
            }

            const data = await response.json()
            dashboardSummary.value = data
            user.value = {
                ...user.value,
                name: data.profile?.name || user.value.name,
                email: data.profile?.email || user.value.email,
                phone: data.profile?.phone || user.value.phone,
                joiningDate: data.profile?.created_at || user.value.joiningDate,
            }

            return { success: true, data }
        } catch (error) {
            dashboardError.value = 'Error connecting to the server.'
            return { success: false, message: dashboardError.value }
        } finally {
            dashboardLoading.value = false
        }
    }

    async function fetchOrders(status = null) {
        ordersLoading.value = true
        ordersError.value = ''

        try {
            const token = localStorage.getItem('auth_token')
            const params = new URLSearchParams({ page: '1', page_size: '50' })
            if (status && status !== 'all') {
                const backendStatusMap = {
                    pending: 'CONFIRMED',
                    'in-transit': 'IN_TRANSIT',
                    delivered: 'DELIVERED',
                    cancelled: 'CANCELLED',
                }
                const backendStatus = backendStatusMap[status]
                if (backendStatus) params.set('status_filter', backendStatus)
            }

            const response = await fetch(`http://localhost:8000/api/v1/orders?${params.toString()}`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            })

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}))
                ordersError.value = errData.detail || 'Failed to load orders.'
                return { success: false, message: ordersError.value }
            }

            const data = await response.json()
            orders.value = (data.items || []).map(normalizeBackendOrder)
            return { success: true, data: orders.value }
        } catch (error) {
            ordersError.value = 'Error connecting to the server.'
            return { success: false, message: ordersError.value }
        } finally {
            ordersLoading.value = false
        }
    }

    async function fetchTrackingOrders() {
        trackingLoading.value = true
        trackingError.value = ''

        try {
            const token = localStorage.getItem('auth_token')
            const response = await fetch('http://localhost:8000/api/v1/customer/tracking', {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            })

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}))
                trackingError.value = errData.detail || 'Failed to load tracking data.'
                return { success: false, message: trackingError.value }
            }

            const data = await response.json()
            orders.value = (data.orders || []).map(normalizeTrackingOrder)
            return { success: true, data: orders.value }
        } catch (error) {
            trackingError.value = 'Error connecting to the server.'
            return { success: false, message: trackingError.value }
        } finally {
            trackingLoading.value = false
        }
    }

    async function fetchProfile() {
        profileLoading.value = true
        profileError.value = ''

        try {
            const token = localStorage.getItem('auth_token')
            const response = await fetch('http://localhost:8000/api/v1/customer/profile', {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            })

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}))
                profileError.value = errData.detail || 'Failed to load profile.'
                return { success: false, message: profileError.value }
            }

            const data = await response.json()
            user.value = {
                ...user.value,
                name: data.profile?.name || user.value.name,
                email: data.profile?.email || user.value.email,
                phone: data.profile?.phone || user.value.phone,
                joiningDate: data.profile?.created_at || user.value.joiningDate,
                altPhone: data.alt_phone || '',
                address: data.address || '',
                language: data.language || user.value.language,
                paymentDefault: data.default_payment || user.value.paymentDefault,
                notificationsEnabled: !!data.notification_prefs?.push,
                smsAlerts: !!data.notification_prefs?.sms,
            }
            return { success: true, data: user.value }
        } catch (error) {
            profileError.value = 'Error connecting to the server.'
            return { success: false, message: profileError.value }
        } finally {
            profileLoading.value = false
        }
    }

    async function saveProfileRemote(updates) {
        profileLoading.value = true
        profileError.value = ''

        try {
            const token = localStorage.getItem('auth_token')
            const response = await fetch('http://localhost:8000/api/v1/auth/me', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({
                    name: updates.name,
                    phone: updates.phone,
                    alt_phone: updates.altPhone,
                    date_of_birth: updates.dob,
                    address: updates.address,
                }),
            })

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}))
                profileError.value = errData.detail || 'Failed to update profile.'
                return { success: false, message: profileError.value }
            }

            const data = await response.json()
            user.value = {
                ...user.value,
                name: data.name || user.value.name,
                email: data.email || user.value.email,
                phone: data.phone || user.value.phone,
                altPhone: updates.altPhone ?? user.value.altPhone,
                dob: updates.dob ?? user.value.dob,
                address: updates.address ?? user.value.address,
            }

            if (typeof window !== 'undefined') {
                const authData = JSON.parse(localStorage.getItem('auth_user') || 'null') || {}
                localStorage.setItem('auth_user', JSON.stringify({
                    ...authData,
                    name: user.value.name,
                    email: user.value.email,
                    phone: user.value.phone,
                    role: authData.role || 'INDIVIDUAL',
                }))
            }

            return { success: true, data: user.value }
        } catch (error) {
            profileError.value = 'Error connecting to the server.'
            return { success: false, message: profileError.value }
        } finally {
            profileLoading.value = false
        }
    }

    async function fetchPaymentsSummary() {
        paymentsLoading.value = true
        paymentsError.value = ''

        try {
            const token = localStorage.getItem('auth_token')
            const response = await fetch('http://localhost:8000/api/v1/customer/payments', {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            })

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}))
                paymentsError.value = errData.detail || 'Failed to load payments.'
                return { success: false, message: paymentsError.value }
            }

            const data = await response.json()
            paymentsSummary.value = data
            payments.value = (data.records || []).map((record) => ({
                id: record.id,
                orderId: record.tracking_code,
                amount: record.amount,
                mode: record.mode,
                status: record.status,
                date: record.created_at,
                isDummy: false,
            }))
            return { success: true, data }
        } catch (error) {
            paymentsError.value = 'Error connecting to the server.'
            return { success: false, message: paymentsError.value }
        } finally {
            paymentsLoading.value = false
        }
    }

    async function fetchQuotes() {
        quotesLoading.value = true
        quotesError.value = ''

        try {
            const token = localStorage.getItem('auth_token')
            const response = await fetch('http://localhost:8000/api/v1/customer/quotes', {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            })

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}))
                quotesError.value = errData.detail || 'Failed to load quotes.'
                return { success: false, message: quotesError.value }
            }

            const data = await response.json()
            quotes.value = (data.quotes || []).map(mapQuote)
            return { success: true, data: quotes.value }
        } catch (error) {
            quotesError.value = 'Error connecting to the server.'
            return { success: false, message: quotesError.value }
        } finally {
            quotesLoading.value = false
        }
    }

    async function convertQuoteToOrderRemote(quoteId) {
        try {
            const token = localStorage.getItem('auth_token')
            const response = await fetch(`http://localhost:8000/api/v1/customer/quotes/${quoteId}/convert`, {
                method: 'POST',
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            })

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}))
                return { success: false, message: errData.detail || 'Failed to convert quote.' }
            }

            await fetchQuotes()
            await fetchOrders()
            const data = await response.json()
            return { success: true, data }
        } catch (error) {
            return { success: false, message: 'Error connecting to the server.' }
        }
    }

    async function fetchDamageReports() {
        damageReportsLoading.value = true
        damageReportsError.value = ''

        try {
            const token = localStorage.getItem('auth_token')
            const response = await fetch('http://localhost:8000/api/v1/customer/damage-reports', {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            })

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}))
                damageReportsError.value = errData.detail || 'Failed to load damage reports.'
                return { success: false, message: damageReportsError.value }
            }

            const data = await response.json()
            damageReports.value = (data.reports || []).map((report) => ({
                id: report.id,
                orderId: report.order_id,
                description: report.description,
                photos: report.photos || [],
                status: report.status,
                qrCode: report.qr_code,
                createdAt: report.created_at,
            }))
            return { success: true, data: damageReports.value }
        } catch (error) {
            damageReportsError.value = 'Error connecting to the server.'
            return { success: false, message: damageReportsError.value }
        } finally {
            damageReportsLoading.value = false
        }
    }

    async function reportDamageRemote(orderId, description, photos) {
        try {
            const token = localStorage.getItem('auth_token')
            const response = await fetch('http://localhost:8000/api/v1/customer/damage-reports', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({
                    order_id: orderId,
                    description,
                    photos,
                }),
            })

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}))
                return { success: false, message: errData.detail || 'Failed to submit damage report.' }
            }

            await fetchDamageReports()
            return { success: true }
        } catch (error) {
            return { success: false, message: 'Error connecting to the server.' }
        }
    }

    async function fetchSettings() {
        settingsLoading.value = true
        settingsError.value = ''

        try {
            const token = localStorage.getItem('auth_token')
            const response = await fetch('http://localhost:8000/api/v1/customer/settings', {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            })

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}))
                settingsError.value = errData.detail || 'Failed to load settings.'
                return { success: false, message: settingsError.value }
            }

            const data = await response.json()
            user.value = {
                ...user.value,
                language: data.settings?.language || user.value.language,
                paymentDefault: data.settings?.default_payment || user.value.paymentDefault,
                notificationsEnabled: !!data.settings?.notification_prefs?.push,
                smsAlerts: !!data.settings?.notification_prefs?.sms,
            }
            return { success: true, data: data.settings }
        } catch (error) {
            settingsError.value = 'Error connecting to the server.'
            return { success: false, message: settingsError.value }
        } finally {
            settingsLoading.value = false
        }
    }

    async function saveSettingsRemote(settings) {
        try {
            const token = localStorage.getItem('auth_token')
            const response = await fetch('http://localhost:8000/api/v1/customer/settings', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify(settings),
            })

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}))
                return { success: false, message: errData.detail || 'Failed to save settings.' }
            }

            const data = await response.json()
            user.value = {
                ...user.value,
                language: data.settings?.language || user.value.language,
                paymentDefault: data.settings?.default_payment || user.value.paymentDefault,
                notificationsEnabled: !!data.settings?.notification_prefs?.push,
                smsAlerts: !!data.settings?.notification_prefs?.sms,
            }
            return { success: true, data: data.settings }
        } catch (error) {
            return { success: false, message: 'Error connecting to the server.' }
        }
    }

    // ─── Materials Catalog ───────────────────────────────────────
    const materialsCatalog = ref([
        { key: 'boxes', name: 'Carton Boxes (Large)', price: 60, icon: 'inventory_2', unit: 'pcs' },
        { key: 'bubbleWrap', name: 'Bubble Wrap Rolls', price: 120, icon: 'bubble_chart', unit: 'rolls' },
        { key: 'plasticCrates', name: 'Plastic Crates', price: 200, icon: 'deployed_code', unit: 'pcs' },
        { key: 'blankets', name: 'Padded Blankets', price: 80, icon: 'bed', unit: 'pcs' },
        { key: 'wardrobeBoxes', name: 'Wardrobe Boxes', price: 350, icon: 'checkroom', unit: 'pcs' },
        { key: 'tape', name: 'Packing Tape', price: 40, icon: 'straighten', unit: 'rolls' },
    ])

    // ─── Actions ─────────────────────────────────────────────────

    function createOrder(data) {
        const id = generateOrderId()
        const vehicle = vehicleTypes.value.find(v => v.key === data.vehicleType) || vehicleTypes.value[0]
        const order = {
            id,
            status: 'pending',
            moveType: data.moveType || 'house-shift',
            ...data,
            vehicleType: data.vehicleType || 'mini-truck',
            driver: null,
            eta: null,
            progress: 0,
            paymentStatus: data.paymentMode === 'Full Payment' ? 'paid' : 'pending',
            isDummyPayment: data.isDummyPayment || false,
            rating: null,
            feedback: '',
            createdAt: new Date().toISOString(),
            serviceTimeBlock: data.moveType === 'small-package' ? '30 min' : '2-3 hours',
            dwellTime: { loading: 0, unloading: 0, total: 0 },
            beforeAfterPhotos: {},
            crewCheckin: null,
            preferredPickupDate: data.preferredPickupDate || null,
            estimatedDelivery: data.estimatedDelivery || null,
            transportLog: [
                { event: 'Order Placed', time: new Date().toLocaleString(), icon: 'receipt', color: 'green' },
                { event: `Vehicle Reserved (${vehicle.name})`, time: new Date().toLocaleString(), icon: 'local_shipping', color: 'purple' },
            ],
        }
        orders.value.unshift(order)
        notifications.value.unshift({
            id: Date.now(), title: 'Order Created', message: `${id} booked — ${vehicle.name} assigned.`, time: 'Just now', read: false, icon: 'check_circle',
        })
        if (data.isDummyPayment) {
            payments.value.unshift({
                id: `PAY-${800 + payments.value.length + 1}`, orderId: id, amount: data.cost?.total || 0,
                mode: 'DUMMY (Test)', status: 'simulated', date: new Date().toISOString(), isDummy: true,
            })
        }
        return order
    }

    function updateOrder(id, updates) {
        const idx = orders.value.findIndex(o => o.id === id)
        if (idx !== -1) Object.assign(orders.value[idx], updates)
    }

    function cancelOrder(id) {
        const order = orders.value.find(o => o.id === id || o.backendId === id)
        if (!order) return null
        let fee = 0
        let reason = ''
        if (order.status === 'pending') {
            fee = 0; reason = 'Cancelled before dispatch — No fee'
        } else if (order.status === 'in-transit' && order.progress < 30) {
            fee = Math.round(order.cost.total * 0.10); reason = 'Cancelled after dispatch — 10% fee'
        } else if (order.status === 'in-transit') {
            fee = Math.round(order.cost.total * 0.25); reason = 'Cancelled mid-transit — 25% fee'
        }
        order.status = 'cancelled'
        order.cancellation = { reason, fee, date: new Date().toISOString() }
        order.transportLog.push({ event: `Cancelled — ${reason}`, time: new Date().toLocaleString(), icon: 'cancel', color: 'red' })
        notifications.value.unshift({
            id: Date.now(), title: 'Order Cancelled', message: `${id} has been cancelled.`, time: 'Just now', read: false, icon: 'cancel'
        })
        return order
    }

    async function cancelOrderRemote(id, reason = 'Cancelled by customer') {
        const order = orders.value.find(o => o.id === id || o.backendId === id)
        if (!order?.backendId) {
            const local = cancelOrder(id)
            return { success: !!local, order: local }
        }

        try {
            const token = localStorage.getItem('auth_token')
            const response = await fetch(`http://localhost:8000/api/v1/orders/${order.backendId}/cancel`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({ reason }),
            })

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}))
                return { success: false, message: errData.detail || 'Failed to cancel order.' }
            }

            const updated = await response.json()
            const normalized = normalizeBackendOrder(updated)
            const index = orders.value.findIndex(o => o.backendId === updated.id)
            if (index >= 0) orders.value[index] = normalized
            return { success: true, order: normalized }
        } catch (error) {
            return { success: false, message: 'Error connecting to the server.' }
        }
    }

    function rescheduleOrder(id, newDate, newTime) {
        updateOrder(id, { date: newDate, timeWindow: newTime })
        const order = orders.value.find(o => o.id === id)
        if (order) order.transportLog.push({ event: `Rescheduled to ${newDate}`, time: new Date().toLocaleString(), icon: 'schedule', color: 'amber' })
        notifications.value.unshift({
            id: Date.now(), title: 'Rescheduled', message: `${id} moved to ${newDate}.`, time: 'Just now', read: false, icon: 'schedule',
        })
    }

    function submitRating(id, rating, feedback) {
        updateOrder(id, { rating, feedback })
    }

    function addQuote(data) {
        const q = { id: `QT-${500 + quotes.value.length + 1}`, ...data, date: new Date().toISOString().split('T')[0], status: 'active' }
        quotes.value.unshift(q)
        return q
    }

    function convertQuoteToOrder(quoteId) {
        const q = quotes.value.find(q => q.id === quoteId)
        if (!q) return null
        q.status = 'converted'
        return createOrder({
            cargoType: q.cargoType, pickup: q.from, destination: q.to,
            laborCount: q.laborCount, packingRequired: q.packing,
            materials: {}, cost: { base: Math.round(q.total * 0.45), labor: Math.round(q.total * 0.2), materials: Math.round(q.total * 0.1), packing: Math.round(q.total * 0.1), vehicle: Math.round(q.total * 0.15), total: q.total },
            date: new Date().toISOString().split('T')[0], timeWindow: '10:00 AM - 12:00 PM',
            paymentMode: 'Full Payment', vehicleType: 'tempo',
        })
    }

    function makePayment(orderId, amount, mode, isDummy = false) {
        const p = {
            id: `PAY-${800 + payments.value.length + 1}`, orderId, amount, mode,
            status: isDummy ? 'simulated' : 'completed',
            date: new Date().toISOString(), isDummy,
        }
        payments.value.unshift(p)
        updateOrder(orderId, { paymentStatus: isDummy ? 'simulated' : 'paid', paymentMode: mode, isDummyPayment: isDummy })
        return p
    }

    function reportDamage(orderId, description, photos) {
        const report = {
            id: `DMG-${100 + damageReports.value.length + 1}`,
            orderId, description, photos: photos || [],
            status: 'reported', qrCode: `QR-${Date.now()}`,
            createdAt: new Date().toISOString(),
        }
        damageReports.value.unshift(report)
        notifications.value.unshift({
            id: Date.now(), title: 'Damage Reported', message: `Report ${report.id} submitted for ${orderId}.`, time: 'Just now', read: false, icon: 'report',
        })
        return report
    }

    function calculateQuote(distance, laborCount, packingRequired, materialsCost, vehicleKey) {
        const vehicle = vehicleTypes.value.find(v => v.key === vehicleKey) || vehicleTypes.value[0]
        const base = Math.round(distance * 35 * vehicle.priceMultiplier)
        const labor = laborCount * 800
        const packing = packingRequired ? Math.round(base * 0.25) : 0
        const matCost = materialsCost || 0
        const vehicleCost = Math.round(base * (vehicle.priceMultiplier - 1) * 0.5)
        const subtotal = base + labor + packing + matCost + vehicleCost
        const platformFee = 249
        const taxes = Math.round(subtotal * 0.18)
        return { base, labor, packing, materials: matCost, vehicle: vehicleCost, platformFee, taxes, total: subtotal + platformFee + taxes }
    }

    function markNotificationRead(id) {
        const n = notifications.value.find(n => n.id === id)
        if (n) n.read = true
    }

    function markAllNotificationsRead() {
        notifications.value.forEach(n => { n.read = true })
    }

    function clearNotifications() {
        notifications.value = []
    }

    function updateProfile(updates) {
        Object.assign(user.value, updates)
    }

    function saveAddress(addressData) {
        if (addressData.id) {
            const idx = savedAddresses.value.findIndex(a => a.id === addressData.id)
            if (idx !== -1) savedAddresses.value[idx] = { ...savedAddresses.value[idx], ...addressData }
        } else {
            savedAddresses.value.push({ ...addressData, id: Date.now() })
        }
    }

    function deleteAddress(id) {
        savedAddresses.value = savedAddresses.value.filter(a => a.id !== id)
    }

    return {
        dashboardSummary, dashboardLoading, dashboardError, fetchDashboardSummary,
        quotesLoading, quotesError, fetchQuotes, convertQuoteToOrderRemote,
        trackingLoading, trackingError, fetchTrackingOrders,
        profileLoading, profileError, fetchProfile, saveProfileRemote,
        paymentsLoading, paymentsError, paymentsSummary, fetchPaymentsSummary,
        damageReportsLoading, damageReportsError, fetchDamageReports, reportDamageRemote,
        settingsLoading, settingsError, fetchSettings, saveSettingsRemote,
        ordersLoading, ordersError, fetchOrders, cancelOrderRemote,
        user, userInitials,
        orders, activeOrders, pendingOrders, deliveredOrders, cancelledOrders, totalSpent,
        walletBalance, addFunds,
        monthlySpending, vehicleTypes,
        quotes, payments, damageReports,
        notifications, unreadNotificationsCount,
        materialsCatalog,
        createOrder, updateOrder, cancelOrder, rescheduleOrder, submitRating,
        addQuote, convertQuoteToOrder, makePayment, reportDamage, calculateQuote,
        markNotificationRead, markAllNotificationsRead, clearNotifications,
        updateProfile, savedAddresses, saveAddress, deleteAddress
    }
})
