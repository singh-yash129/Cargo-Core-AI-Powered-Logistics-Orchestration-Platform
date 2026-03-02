import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

let orderCounter = 9930

function generateOrderId() {
    orderCounter++
    return `ORD-${orderCounter}`
}

export const useVendorStore = defineStore('vendor', () => {
    // ─── Shipments ───────────────────────────────────────────────
    const shipments = ref([
        { id: 'ORD-9922', destination: 'Warehouse A – Chicago', status: 'In Transit', statusKey: 'transit', eta: 'Mar 02, 2026', amount: 1840, pallets: 12, weight: 4500, category: 'Commercial', paymentMode: 'Invoice', driver: 'Raj Patel', driverPhone: '+91 0000000000', vehicle: 'MH-12-AB-1234', progress: 65, pod: null, route: 'Mumbai Hub → Chicago WH', origin: 'Mumbai Hub', driverLat: 19.076, driverLng: 72.877, description: 'Electronic components', packingRequired: true, laborRequired: true, laborCount: 2, createdAt: '2026-02-27 09:00', statusHistory: [{ status: 'Pending', time: '2026-02-27 09:00' }, { status: 'Packed', time: '2026-02-27 14:00' }, { status: 'Dispatched', time: '2026-02-28 08:00' }, { status: 'In Transit', time: '2026-02-28 10:00' }] },
        { id: 'ORD-9918', destination: 'Store #402 – New York', status: 'Out for Delivery', statusKey: 'delivery', eta: 'Today 3pm', amount: 960, pallets: 5, weight: 1800, category: 'Commercial', paymentMode: 'COD', driver: 'Amit Shah', driverPhone: '+91 0000000000', vehicle: 'MH-12-CD-5678', progress: 88, pod: { photo: 'https://via.placeholder.com/400x250?text=Delivery+Confirmation', timestamp: '2026-03-01 14:30', location: '40.7128° N, 74.0060° W', confirmed: true }, route: 'Mumbai Hub → NY Store #402', origin: 'Mumbai Hub', driverLat: 40.712, driverLng: -74.006, description: 'FMCG Products', packingRequired: false, laborRequired: false, laborCount: 0, createdAt: '2026-02-25 11:00', statusHistory: [{ status: 'Pending', time: '2026-02-25 11:00' }, { status: 'Packed', time: '2026-02-25 16:00' }, { status: 'Dispatched', time: '2026-02-26 07:00' }, { status: 'In Transit', time: '2026-02-26 09:00' }, { status: 'Out for Delivery', time: '2026-03-01 12:00' }] },
        { id: 'ORD-9905', destination: 'Distribution Centre B', status: 'Delivered', statusKey: 'delivered', eta: 'Feb 28, 2026', amount: 3200, pallets: 20, weight: 9000, category: 'Commercial', paymentMode: 'Invoice', driver: 'Suresh Kumar', driverPhone: '+91 0000000000', vehicle: 'MH-12-EF-9012', progress: 100, pod: { photo: 'https://via.placeholder.com/400x250?text=Proof+of+Delivery', timestamp: '2026-02-28 11:45', location: '34.0522° N, 118.2437° W', confirmed: true }, route: 'Delhi Hub → DC-B', origin: 'Delhi Hub', driverLat: 34.052, driverLng: -118.243, description: 'Bulk warehouse inventory', packingRequired: true, laborRequired: true, laborCount: 4, createdAt: '2026-02-20 08:00', statusHistory: [{ status: 'Pending', time: '2026-02-20 08:00' }, { status: 'Packed', time: '2026-02-20 14:00' }, { status: 'Dispatched', time: '2026-02-21 06:00' }, { status: 'In Transit', time: '2026-02-21 08:00' }, { status: 'Out for Delivery', time: '2026-02-28 09:00' }, { status: 'Delivered', time: '2026-02-28 11:45' }] },
        { id: 'ORD-9901', destination: 'HQ – Bangalore', status: 'Pending', statusKey: 'pending', eta: 'Mar 05, 2026', amount: 540, pallets: 3, weight: 900, category: 'Commercial', paymentMode: 'Invoice', driver: null, driverPhone: null, vehicle: null, progress: 0, pod: null, route: 'Mumbai Hub → Bangalore HQ', origin: 'Mumbai Hub', driverLat: null, driverLng: null, description: 'Office supplies', packingRequired: false, laborRequired: false, laborCount: 0, createdAt: '2026-03-01 07:00', statusHistory: [{ status: 'Pending', time: '2026-03-01 07:00' }] },
        { id: 'ORD-9888', destination: 'Retail Cluster – Pune', status: 'Cancelled', statusKey: 'cancelled', eta: '—', amount: 720, pallets: 4, weight: 1200, category: 'Commercial', paymentMode: 'Invoice', driver: null, driverPhone: null, vehicle: null, progress: 0, pod: null, route: 'Mumbai Hub → Pune Retail', origin: 'Mumbai Hub', driverLat: null, driverLng: null, description: 'Retail merchandise', packingRequired: true, laborRequired: false, laborCount: 0, createdAt: '2026-02-15 10:00', statusHistory: [{ status: 'Pending', time: '2026-02-15 10:00' }, { status: 'Cancelled', time: '2026-02-16 09:00' }] },
    ])

    // ─── Packing Materials Catalog ───────────────────────────────
    const packingMaterials = ref([
        { id: 1, name: 'Standard Boxes', unitPrice: 45, available: 500, icon: 'inventory_2' },
        { id: 2, name: 'Wooden Crates', unitPrice: 350, available: 120, icon: 'deployed_code' },
        { id: 3, name: 'Bubble Wrap (roll)', unitPrice: 80, available: 200, icon: 'bubble_chart' },
        { id: 4, name: 'Packing Tape (roll)', unitPrice: 25, available: 800, icon: 'straighten' },
        { id: 5, name: 'Specialized Containers', unitPrice: 1200, available: 30, icon: 'package_2' },
        { id: 6, name: 'Protective Foam', unitPrice: 150, available: 100, icon: 'shield' },
    ])

    // ─── Company Settings ────────────────────────────────────────
    const companySettings = ref({
        companyName: 'Acme Logistics Inc.',
        taxId: 'GSTIN-27AABCU9603R1ZM',
        contactPerson: 'Jane Doe',
        phone: '+91 0000000000',
        email: 'contact@acmelogistics.com',
        address: '45, Trade Park, Mumbai - 400001',
        logo: null,
        teamMembers: [
            { id: 1, name: 'Jane Doe', role: 'Admin', email: 'jane@acmelogistics.com', status: 'Active' },
            { id: 2, name: 'Rohan Mehta', role: 'Operations', email: 'rohan@acmelogistics.com', status: 'Active' },
            { id: 3, name: 'Priya Sharma', role: 'Finance', email: 'priya@acmelogistics.com', status: 'Invited' },
        ],
        notifications: { email: true, sms: true, push: true, orderUpdates: true, invoiceAlerts: true, promotions: false },
        apiKeys: [
            { id: 1, name: 'Production Key', key: 'vnd_live_xxxx...xxxx', created: 'Jan 15, 2026', lastUsed: 'Today', status: 'Active' },
            { id: 2, name: 'Staging Key', key: 'vnd_test_yyyy...yyyy', created: 'Feb 01, 2026', lastUsed: 'Yesterday', status: 'Active' },
        ],
    })

    // ─── Damage Reports ──────────────────────────────────────────
    const damageReports = ref([
        { id: 'DMG-001', orderId: 'ORD-9905', description: 'Minor dent on package #3', severity: 'Low', photos: ['https://via.placeholder.com/200x150?text=Damage+1'], status: 'Under Review', createdAt: 'Feb 28, 2026', resolution: null },
    ])

    // ─── Invoices ────────────────────────────────────────────────
    const invoices = ref([
        { id: 'INV-2026-001', orderId: 'ORD-9905', date: 'Feb 28, 2026', dueDate: 'Mar 28, 2026', amount: 3200, paid: 0, status: 'Unpaid' },
        { id: 'INV-2026-002', orderId: 'ORD-9888', date: 'Feb 20, 2026', dueDate: 'Feb 20, 2026', amount: 720, paid: 0, status: 'Overdue' },
        { id: 'INV-2026-003', orderId: 'ORD-9801', date: 'Feb 15, 2026', dueDate: 'Mar 15, 2026', amount: 4500, paid: 4500, status: 'Paid' },
        { id: 'INV-2026-004', orderId: 'ORD-9750', date: 'Feb 10, 2026', dueDate: 'Mar 10, 2026', amount: 1800, paid: 900, status: 'Partial' },
    ])

    // ─── Recurring Rules ─────────────────────────────────────────
    const recurringRules = ref([
        { id: 1, name: 'Weekly Restock – NY Store', description: 'Standard inventory replenishment for downtown branch.', frequency: 'Every Monday', route: 'Hub A → Store #402', details: '12 Pallets • General Goods', nextRun: 'Mar 07, 2026', active: true, pallets: 12, weight: 4500, destination: 'Store #402 – New York', pickupHub: 'Mumbai Hub' },
        { id: 2, name: 'Monthly Supplies – HQ', description: 'Office supplies and pantry restock.', frequency: '1st of Month', route: 'Hub B → Corporate HQ', details: '5 Boxes', nextRun: 'Apr 01, 2026', active: true, pallets: 5, weight: 800, destination: 'Corporate HQ – Bangalore', pickupHub: 'Delhi Hub' },
        { id: 3, name: 'Daily Grocery – Fresh', description: 'Perishable goods, refrigerated transport.', frequency: 'Daily @ 5 AM', route: 'Hub C → Distribution C', details: 'Refrigerated Truck', nextRun: 'Mar 02, 2026', active: false, pallets: 8, weight: 2000, destination: 'Distribution Centre C', pickupHub: 'Pune Hub' },
    ])

    // ─── Bulk Upload Log ─────────────────────────────────────────
    const bulkUploads = ref([
        { id: 1, filename: 'mar_orders_batch_01.csv', date: 'Today, 10:00 AM', orders: 45, status: 'Processed', errors: 0 },
        { id: 2, filename: 'feb_restock.xlsx', date: 'Feb 28, 2026', orders: 120, status: 'Failed', errors: 2 },
        { id: 3, filename: 'jan_commercial_batch.csv', date: 'Jan 30, 2026', orders: 200, status: 'Processed', errors: 0 },
    ])

    // ─── Support Tickets ─────────────────────────────────────────
    const tickets = ref([
        { id: 'TK-1029', subject: 'Shipment ORD-9901 delayed', description: 'The shipment has not moved for 48 hours. Need urgent update.', orderId: 'ORD-9901', created: '2 hours ago', priority: 'High', status: 'In Progress', replies: [{ from: 'Support Agent', message: 'We are investigating. You will hear back within 1 hour.', time: '1 hour ago' }] },
        { id: 'TK-0992', subject: 'Invoice INV-2026-002 dispute', description: 'The overdue invoice amount seems incorrect. Request review.', orderId: null, created: 'Yesterday', priority: 'Medium', status: 'Resolved', replies: [{ from: 'Support Agent', message: 'Reviewed and corrected. Please check your invoices section.', time: '6 hours ago' }] },
    ])

    // ─── Analytics Data ──────────────────────────────────────────
    const analyticsData = ref({
        monthly: [
            { month: 'Oct', spend: 20000, orders: 48 },
            { month: 'Nov', spend: 32000, orders: 72 },
            { month: 'Dec', spend: 25000, orders: 58 },
            { month: 'Jan', spend: 45000, orders: 104 },
            { month: 'Feb', spend: 38000, orders: 88 },
            { month: 'Mar', spend: 45200, orders: 124 },
        ],
        onTime: 95.4,
        avgTransit: 3.2,
        costPerMile: 2.45,
        successRate: 99.2,
    })

    // ─── Computed ────────────────────────────────────────────────
    const activeShipments = computed(() => shipments.value.filter(s => ['transit', 'delivery'].includes(s.statusKey)))
    const pendingShipments = computed(() => shipments.value.filter(s => s.statusKey === 'pending'))
    const deliveredShipments = computed(() => shipments.value.filter(s => s.statusKey === 'delivered'))
    const overdueInvoices = computed(() => invoices.value.filter(i => i.status === 'Overdue'))
    const totalOverdue = computed(() => overdueInvoices.value.reduce((a, i) => a + (i.amount - i.paid), 0))
    const totalUnpaid = computed(() => invoices.value.filter(i => i.status !== 'Paid').length)
    const totalPaidThisMonth = computed(() => invoices.value.filter(i => i.status === 'Paid').reduce((a, i) => a + i.paid, 0))
    const creditBalance = computed(() => 12450)
    const shipmentsWithPod = computed(() => shipments.value.filter(s => s.pod && s.pod.confirmed))

    // ─── Actions ─────────────────────────────────────────────────
    function createShipment(data) {
        const id = generateOrderId()
        const now = new Date()
        const newShipment = {
            id,
            destination: data.destination,
            status: 'Pending',
            statusKey: 'pending',
            eta: data.pickupDate ? new Date(new Date(data.pickupDate).getTime() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : 'TBD',
            amount: data.quotedPrice || 0,
            pallets: data.palletCount || 0,
            weight: data.weight || 0,
            category: data.category || 'Commercial',
            paymentMode: data.paymentMode || 'Invoice',
            driver: null, driverPhone: null, vehicle: null, progress: 0, pod: null,
            route: `${data.pickupHub || 'Mumbai Hub'} → ${data.destination}`,
            origin: data.pickupHub || 'Mumbai Hub',
            driverLat: null, driverLng: null,
            description: data.description || '',
            packingRequired: data.packingRequired || false,
            laborRequired: data.laborRequired || false,
            laborCount: data.laborCount || 0,
            createdAt: now.toISOString().replace('T', ' ').substring(0, 16),
            statusHistory: [{ status: 'Pending', time: now.toISOString().replace('T', ' ').substring(0, 16) }],
        }
        shipments.value.unshift(newShipment)
        invoices.value.unshift({
            id: `INV-${id.replace('ORD-', '2026-')}`,
            orderId: id,
            date: now.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
            amount: data.quotedPrice || 0,
            paid: 0,
            status: 'Unpaid',
        })
        return newShipment
    }

    function updateShipmentAddress(id, newAddress) {
        const s = shipments.value.find(s => s.id === id)
        if (s && s.statusKey !== 'delivered' && s.statusKey !== 'cancelled') {
            s.destination = newAddress
            s.route = `${s.origin} → ${newAddress}`
            s.statusHistory.push({ status: 'Address Updated', time: new Date().toISOString().replace('T', ' ').substring(0, 16) })
            return true
        }
        return false
    }

    function rescheduleShipment(id, newDate) {
        const s = shipments.value.find(s => s.id === id)
        if (s && s.statusKey !== 'delivered' && s.statusKey !== 'cancelled') {
            s.eta = newDate
            s.statusHistory.push({ status: 'Rescheduled', time: new Date().toISOString().replace('T', ' ').substring(0, 16) })
            return true
        }
        return false
    }

    function cancelShipment(id) {
        const s = shipments.value.find(s => s.id === id)
        if (s && s.statusKey !== 'delivered' && s.statusKey !== 'cancelled') {
            s.status = 'Cancelled'
            s.statusKey = 'cancelled'
            s.progress = 0
            s.statusHistory.push({ status: 'Cancelled', time: new Date().toISOString().replace('T', ' ').substring(0, 16) })
            return true
        }
        return false
    }

    function payInvoice(id, amount) {
        const inv = invoices.value.find(i => i.id === id)
        if (!inv) return false
        inv.paid = Math.min(inv.paid + amount, inv.amount)
        inv.status = inv.paid >= inv.amount ? 'Paid' : inv.paid > 0 ? 'Partial' : inv.status
        return true
    }

    function addTicket(ticket) {
        const tid = `TK-${1030 + tickets.value.length}`
        tickets.value.unshift({ id: tid, ...ticket, created: 'Just now', status: 'Open', replies: [] })
        return tid
    }

    function replyTicket(ticketId, message) {
        const t = tickets.value.find(t => t.id === ticketId)
        if (t) {
            t.replies.push({ from: 'You', message, time: 'Just now' })
            if (t.status === 'Resolved') t.status = 'Re-opened'
        }
    }

    function resolveTicket(id) {
        const t = tickets.value.find(t => t.id === id)
        if (t) t.status = 'Resolved'
    }

    function addRecurringRule(rule) {
        const id = Math.max(0, ...recurringRules.value.map(r => r.id)) + 1
        recurringRules.value.push({ id, ...rule, active: true })
        return id
    }

    function updateRecurringRule(id, updates) {
        const idx = recurringRules.value.findIndex(r => r.id === id)
        if (idx >= 0) recurringRules.value[idx] = { ...recurringRules.value[idx], ...updates }
    }

    function toggleRecurringRule(id) {
        const r = recurringRules.value.find(r => r.id === id)
        if (r) r.active = !r.active
    }

    function deleteRecurringRule(id) {
        recurringRules.value = recurringRules.value.filter(r => r.id !== id)
    }

    function addBulkUpload(upload) {
        bulkUploads.value.unshift({ id: Date.now(), date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }), status: 'Processed', errors: 0, ...upload })
    }

    // COD Payment recording
    function recordCODPayment(orderId, amount) {
        const s = shipments.value.find(s => s.id === orderId)
        if (!s) return
        s.codPaid = amount
        const inv = invoices.value.find(i => i.orderId === orderId)
        if (inv) payInvoice(inv.id, amount)
    }

    // Damage Report
    function reportDamage(orderId, report) {
        const s = shipments.value.find(s => s.id === orderId)
        if (s) s.damageReport = report
        const dmgId = `DMG-${String(damageReports.value.length + 1).padStart(3, '0')}`
        damageReports.value.unshift({
            id: dmgId,
            orderId,
            description: report.description || '',
            severity: report.severity || 'Medium',
            photos: report.photos || [],
            status: 'Under Review',
            createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
            resolution: null,
        })
        // Auto-create support ticket for damage
        addTicket({ subject: `Damage Report for ${orderId}`, description: report.description, orderId, priority: 'High' })
        return dmgId
    }

    // Pricing engine
    function calculateQuote(pallets, weight, laborCount, packingRequired, materials) {
        const base = pallets * 120 + weight * 0.08
        const labor = laborCount * 250
        const packing = packingRequired ? 200 : 0
        const materialsTotal = materials ? materials.reduce((a, m) => a + m.qty * m.unitPrice, 0) : 0
        const total = base + labor + packing + materialsTotal
        return {
            baseTransport: Math.round(base),
            laborCharges: labor,
            packingFee: packing,
            materialsCost: Math.round(materialsTotal),
            total: Math.round(total),
        }
    }

    // Settings
    function updateCompanySettings(updates) {
        Object.assign(companySettings.value, updates)
    }

    function addTeamMember(member) {
        const id = Math.max(0, ...companySettings.value.teamMembers.map(m => m.id)) + 1
        companySettings.value.teamMembers.push({ id, ...member, status: 'Invited' })
    }

    function removeTeamMember(id) {
        companySettings.value.teamMembers = companySettings.value.teamMembers.filter(m => m.id !== id)
    }

    function generateApiKey(name) {
        const id = Math.max(0, ...companySettings.value.apiKeys.map(k => k.id)) + 1
        const key = `vnd_${name.toLowerCase().replace(/\s/g, '_')}_${Math.random().toString(36).substring(2, 10)}`
        companySettings.value.apiKeys.push({ id, name, key, created: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }), lastUsed: 'Never', status: 'Active' })
    }

    function revokeApiKey(id) {
        const k = companySettings.value.apiKeys.find(k => k.id === id)
        if (k) k.status = 'Revoked'
    }

    return {
        shipments, invoices, recurringRules, bulkUploads, tickets, analyticsData,
        packingMaterials, companySettings, damageReports,
        activeShipments, pendingShipments, deliveredShipments, shipmentsWithPod,
        overdueInvoices, totalOverdue, totalUnpaid, totalPaidThisMonth, creditBalance,
        createShipment, updateShipmentAddress, rescheduleShipment, cancelShipment,
        payInvoice, recordCODPayment, reportDamage, addTicket, replyTicket, resolveTicket,
        addRecurringRule, updateRecurringRule, toggleRecurringRule, deleteRecurringRule, addBulkUpload, calculateQuote,
        updateCompanySettings, addTeamMember, removeTeamMember, generateApiKey, revokeApiKey,
    }
})
