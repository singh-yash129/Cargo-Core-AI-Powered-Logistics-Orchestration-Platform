import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

let orderCounter = 3050

function generateOrderId() {
    orderCounter++
    return `MOV-${orderCounter}`
}

export const useIndividualStore = defineStore('individual', () => {

    // ─── User Profile ────────────────────────────────────────────
    const user = ref({
        name: 'Alex Johnson',
        email: 'alex.johnson@email.com',
        phone: '+91 98765 12345',
        address: '42, Green Park, New Delhi - 110016',
        language: 'English',
        paymentDefault: 'Full Payment',
        notificationsEnabled: true,
        smsAlerts: true,
    })

    const userInitials = computed(() =>
        user.value.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
    )

    // ─── Orders ──────────────────────────────────────────────────
    const orders = ref([
        {
            id: 'MOV-3048', status: 'in-transit', cargoType: 'Household Goods',
            pickup: '42, Green Park, New Delhi', destination: '15, Sector 62, Noida',
            date: '2026-03-02', timeWindow: '10:00 AM - 12:00 PM',
            laborCount: 2, packingRequired: true,
            materials: { boxes: 10, bubbleWrap: 2, blankets: 4, tape: 3 },
            cost: { base: 4500, labor: 1600, materials: 850, packing: 1200, total: 8150 },
            driver: { name: 'Mike Ross', phone: '+91 98765 43210', rating: 4.9 },
            eta: '14:30 PM', progress: 60,
            paymentMode: 'Full Payment', paymentStatus: 'paid',
            rating: null, feedback: '',
            createdAt: '2026-03-01T08:30:00',
        },
        {
            id: 'MOV-3045', status: 'delivered', cargoType: 'Furniture',
            pickup: '22, Vasant Kunj, Delhi', destination: '8, DLF Phase 3, Gurgaon',
            date: '2026-02-28', timeWindow: '09:00 AM - 11:00 AM',
            laborCount: 3, packingRequired: true,
            materials: { boxes: 5, blankets: 8, wardrobeBoxes: 2, tape: 2 },
            cost: { base: 5200, labor: 2400, materials: 1100, packing: 1500, total: 10200 },
            driver: { name: 'Raj Kumar', phone: '+91 98765 43211', rating: 4.7 },
            eta: null, progress: 100,
            paymentMode: 'COD', paymentStatus: 'paid',
            rating: 5, feedback: 'Excellent service, handled furniture carefully!',
            pod: { photos: true, signature: true, qrScan: true },
            createdAt: '2026-02-27T10:00:00',
        },
        {
            id: 'MOV-3040', status: 'pending', cargoType: 'Luggage / Boxes',
            pickup: '12, Lajpat Nagar, Delhi', destination: '45, Indiranagar, Bangalore',
            date: '2026-03-05', timeWindow: '08:00 AM - 10:00 AM',
            laborCount: 1, packingRequired: false,
            materials: {},
            cost: { base: 8500, labor: 800, materials: 0, packing: 0, total: 9300 },
            driver: null,
            eta: null, progress: 0,
            paymentMode: 'Partial', paymentStatus: 'pending',
            rating: null, feedback: '',
            createdAt: '2026-03-01T15:00:00',
        },
    ])

    const activeOrders = computed(() => orders.value.filter(o => o.status === 'in-transit'))
    const pendingOrders = computed(() => orders.value.filter(o => o.status === 'pending'))
    const deliveredOrders = computed(() => orders.value.filter(o => o.status === 'delivered'))
    const totalSpent = computed(() => orders.value.filter(o => o.paymentStatus === 'paid').reduce((s, o) => s + o.cost.total, 0))

    // ─── Quotes ──────────────────────────────────────────────────
    const quotes = ref([
        { id: 'QT-501', cargoType: 'Household Goods', from: 'Delhi', to: 'Noida', laborCount: 2, packing: true, total: 8150, date: '2026-03-01', status: 'active' },
        { id: 'QT-502', cargoType: 'Office Shift', from: 'Mumbai', to: 'Pune', laborCount: 4, packing: true, total: 18500, date: '2026-02-28', status: 'expired' },
    ])

    // ─── Payments ────────────────────────────────────────────────
    const payments = ref([
        { id: 'PAY-801', orderId: 'MOV-3048', amount: 8150, mode: 'UPI', status: 'completed', date: '2026-03-01T09:00:00' },
        { id: 'PAY-800', orderId: 'MOV-3045', amount: 10200, mode: 'COD', status: 'completed', date: '2026-02-28T16:30:00' },
    ])

    // ─── Damage Reports ──────────────────────────────────────────
    const damageReports = ref([])

    // ─── Notifications ───────────────────────────────────────────
    const notifications = ref([
        { id: 1, title: 'Move Update', message: 'Your crew is on the way!', time: '10 min ago', read: false, icon: 'local_shipping' },
        { id: 2, title: 'Payment Received', message: '₹8,150 payment confirmed.', time: '1 hour ago', read: false, icon: 'payments' },
        { id: 3, title: 'Delivery Complete', message: 'MOV-3045 delivered successfully.', time: '2 days ago', read: true, icon: 'task_alt' },
    ])

    const unreadNotificationsCount = computed(() => notifications.value.filter(n => !n.read).length)

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
        const order = {
            id,
            status: 'pending',
            ...data,
            driver: null,
            eta: null,
            progress: 0,
            paymentStatus: data.paymentMode === 'Full Payment' ? 'paid' : 'pending',
            rating: null,
            feedback: '',
            createdAt: new Date().toISOString(),
        }
        orders.value.unshift(order)
        notifications.value.unshift({
            id: Date.now(), title: 'Order Created', message: `${id} booked successfully.`, time: 'Just now', read: false, icon: 'check_circle',
        })
        return order
    }

    function updateOrder(id, updates) {
        const idx = orders.value.findIndex(o => o.id === id)
        if (idx !== -1) Object.assign(orders.value[idx], updates)
    }

    function cancelOrder(id) {
        updateOrder(id, { status: 'cancelled' })
    }

    function rescheduleOrder(id, newDate, newTime) {
        updateOrder(id, { date: newDate, timeWindow: newTime })
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
            materials: {}, cost: { base: Math.round(q.total * 0.55), labor: Math.round(q.total * 0.2), materials: Math.round(q.total * 0.1), packing: Math.round(q.total * 0.15), total: q.total },
            date: new Date().toISOString().split('T')[0], timeWindow: '10:00 AM - 12:00 PM',
            paymentMode: 'Full Payment',
        })
    }

    function makePayment(orderId, amount, mode) {
        const p = { id: `PAY-${800 + payments.value.length + 1}`, orderId, amount, mode, status: 'completed', date: new Date().toISOString() }
        payments.value.unshift(p)
        updateOrder(orderId, { paymentStatus: 'paid', paymentMode: mode })
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

    function calculateQuote(distance, laborCount, packingRequired, materialsCost) {
        const base = Math.round(distance * 35)
        const labor = laborCount * 800
        const packing = packingRequired ? Math.round(base * 0.25) : 0
        const matCost = materialsCost || 0
        return { base, labor, packing, materials: matCost, total: base + labor + packing + matCost }
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

    return {
        user, userInitials,
        orders, activeOrders, pendingOrders, deliveredOrders, totalSpent,
        quotes, payments, damageReports,
        notifications, unreadNotificationsCount,
        materialsCatalog,
        createOrder, updateOrder, cancelOrder, rescheduleOrder, submitRating,
        addQuote, convertQuoteToOrder, makePayment, reportDamage, calculateQuote,
        markNotificationRead, markAllNotificationsRead, clearNotifications,
        updateProfile,
    }
})
