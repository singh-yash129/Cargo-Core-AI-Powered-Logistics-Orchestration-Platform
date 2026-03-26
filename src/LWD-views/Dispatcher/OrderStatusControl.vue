<template>
    <div class="space-y-6">
        <!-- Header -->
        <div class="flex justify-between items-center">
            <div>
                <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Order Status Control</h2>
                <p class="text-sm text-gray-400 mt-1">Track and control order lifecycle — Ready → Dispatched → In Transit (Completion by Driver PoD)</p>
            </div>
            <div class="flex gap-2">
                <select v-model="statusFilter" class="bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2 text-gray-900 dark:text-white text-sm">
                    <option class="bg-white dark:bg-gray-800" value="">All Statuses</option>
                    <option class="bg-white dark:bg-gray-800" value="ready">Ready for Dispatch</option>
                    <option class="bg-white dark:bg-gray-800" value="dispatched">Dispatched</option>
                    <option class="bg-white dark:bg-gray-800" value="in-transit">In Transit</option>
                    <option class="bg-white dark:bg-gray-800" value="delivered">Delivered (PoD)</option>
                </select>
                <button @click="syncStatus" class="bg-primary hover:bg-primary-dark text-black font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors text-sm">
                    <span class="material-symbols-outlined text-[18px]" :class="{ 'animate-spin': syncing }">refresh</span> {{ syncing ? 'Syncing...' : syncDone ? '✓ Synced' : 'Sync Status' }}
                </button>
            </div>
        </div>

        <!-- Status Pipeline -->
        <div class="glass-panel rounded-xl p-6">
            <div class="flex items-center justify-between mb-4">
                <h3 class="font-bold text-gray-900 dark:text-white text-sm">Dispatch Pipeline Overview</h3>
                <span class="text-xs text-gray-400">Today: {{ new Date().toLocaleDateString() }}</span>
            </div>

            <div class="flex items-center gap-0">
                <!-- Ready -->
                <div class="flex-1 relative">
                    <div class="bg-yellow-100 dark:bg-yellow-500/10 border border-yellow-500/20 rounded-l-xl p-4 text-center">
                        <div class="text-3xl font-bold text-yellow-500 dark:text-yellow-400 mb-1">{{ readyCount }}</div>
                        <div class="text-xs text-yellow-600 dark:text-yellow-300 font-bold">READY</div>
                        <div class="text-[10px] text-gray-500 mt-1">Awaiting dispatch</div>
                    </div>
                </div>
                <span class="material-symbols-outlined text-gray-600 mx-1">chevron_right</span>

                <!-- Dispatched -->
                <div class="flex-1 relative">
                    <div class="bg-blue-100 dark:bg-blue-500/10 border border-blue-500/20 p-4 text-center">
                        <div class="text-3xl font-bold text-blue-500 dark:text-blue-400 mb-1">{{ dispatchedCount }}</div>
                        <div class="text-xs text-blue-600 dark:text-blue-300 font-bold">DISPATCHED</div>
                        <div class="text-[10px] text-gray-500 mt-1">Assigned to driver</div>
                    </div>
                </div>
                <span class="material-symbols-outlined text-gray-600 mx-1">chevron_right</span>

                <!-- In Transit -->
                <div class="flex-1 relative">
                    <div class="bg-purple-100 dark:bg-purple-500/10 border border-purple-500/20 p-4 text-center">
                        <div class="text-3xl font-bold text-purple-500 dark:text-purple-400 mb-1">{{ inTransitCount }}</div>
                        <div class="text-xs text-purple-600 dark:text-purple-300 font-bold">IN TRANSIT</div>
                        <div class="text-[10px] text-gray-500 mt-1">On the road</div>
                    </div>
                </div>
                <span class="material-symbols-outlined text-gray-600 mx-1">chevron_right</span>

                <!-- Delivered -->
                <div class="flex-1 relative">
                    <div class="bg-green-100 dark:bg-green-500/10 border border-green-500/20 rounded-r-xl p-4 text-center">
                        <div class="text-3xl font-bold text-green-500 dark:text-green-400 mb-1">{{ deliveredCount }}</div>
                        <div class="text-xs text-green-600 dark:text-green-300 font-bold">DELIVERED</div>
                        <div class="text-[10px] text-gray-500 mt-1">PoD confirmed</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- SLA Compliance Tracking -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div class="glass-panel p-4 rounded-xl">
                <div class="flex items-center justify-between mb-2">
                    <span class="text-xs text-gray-500 dark:text-gray-400">Ready → Assigned Time</span>
                    <span class="material-symbols-outlined text-[16px] text-yellow-400">timer</span>
                </div>
                <div class="text-xl font-bold text-gray-900 dark:text-white">—</div>
                <div class="text-[10px] text-gray-500">Target: &lt;10 min</div>
            </div>
            <div class="glass-panel p-4 rounded-xl">
                <div class="flex items-center justify-between mb-2">
                    <span class="text-xs text-gray-500 dark:text-gray-400">On-Time Pickup %</span>
                    <span class="material-symbols-outlined text-[16px] text-blue-400">local_shipping</span>
                </div>
                <div class="text-xl font-bold text-gray-900 dark:text-white">{{ dispatchedCount + inTransitCount + deliveredCount > 0 ? Math.round(((dispatchedCount + deliveredCount) / (orders.length || 1)) * 100) + '%' : '—' }}</div>
                <div class="text-[10px] text-gray-500">SLA target: 95%</div>
            </div>
            <div class="glass-panel p-4 rounded-xl">
                <div class="flex items-center justify-between mb-2">
                    <span class="text-xs text-gray-500 dark:text-gray-400">On-Time Dispatch %</span>
                    <span class="material-symbols-outlined text-[16px] text-purple-400">send</span>
                </div>
                <div class="text-xl font-bold text-gray-900 dark:text-white">{{ orders.length > 0 ? Math.round(((orders.length - readyCount) / orders.length) * 100) + '%' : '—' }}</div>
                <div class="text-[10px] text-gray-500">SLA target: 95%</div>
            </div>
            <div class="glass-panel p-4 rounded-xl">
                <div class="flex items-center justify-between mb-2">
                    <span class="text-xs text-gray-500 dark:text-gray-400">Missed Window</span>
                    <span class="material-symbols-outlined text-[16px] text-red-400">report</span>
                </div>
                <div class="text-xl font-bold" :class="overdueCount > 0 ? 'text-red-400' : 'text-gray-900 dark:text-white'">{{ overdueCount }}</div>
                <div class="text-[10px] text-gray-500">Orders delayed today</div>
            </div>
        </div>

        <!-- Order List Table -->
        <div class="glass-panel rounded-xl overflow-hidden">
            <div class="p-4 border-b border-gray-200 dark:border-white/5 flex items-center justify-between">
                <div class="flex gap-2">
                    <button v-for="tab in statusTabs" :key="tab.value"
                        @click="statusFilter = tab.value"
                        class="px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                        :class="statusFilter === tab.value ? tab.activeClass : 'bg-gray-50 dark:bg-white/5 text-gray-400 hover:bg-white/10'">
                        {{ tab.label }} ({{ tab.count }})
                    </button>
                </div>
                <div class="relative">
                    <span class="material-symbols-outlined absolute left-2 top-2 text-gray-500 text-[16px]">search</span>
                    <input v-model="searchQuery" type="text" placeholder="Search orders..."
                        class="bg-gray-100 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg py-1.5 pl-8 pr-4 text-gray-900 dark:text-white text-xs focus:outline-none focus:border-primary/50 w-48">
                </div>
            </div>

            <div class="overflow-x-auto">
                <table class="w-full text-left text-sm">
                    <thead class="bg-gray-50 dark:bg-white/5 text-gray-400 uppercase text-[10px] tracking-wider">
                        <tr>
                            <th class="p-4">Order ID</th>
                            <th class="p-4">Status</th>
                            <th class="p-4">Driver</th>
                            <th class="p-4">Vehicle</th>
                            <th class="p-4">ETA</th>
                            <th class="p-4">SLA Status</th>
                            <th class="p-4">Last Updated</th>
                            <th class="p-4">Action</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-200 dark:divide-white/5">
                        <tr v-for="order in filteredOrders" :key="order.backendId || order.id"
                            class="hover:bg-gray-100 dark:hover:bg-white/5 transition-colors group">
                            <td class="p-4 font-mono text-gray-900 dark:text-white font-bold">{{ order.id }}</td>
                            <td class="p-4">
                                <div class="flex items-center gap-2">
                                    <span class="w-2 h-2 rounded-full" :class="getStatusDotClass(order.status)"></span>
                                    <span class="text-xs font-bold" :class="getStatusTextClass(order.status)">{{ order.statusLabel }}</span>
                                </div>
                            </td>
                            <td class="p-4 text-gray-600 dark:text-gray-300 text-xs">{{ order.driver || '—' }}</td>
                            <td class="p-4 text-gray-600 dark:text-gray-300 text-xs">{{ order.vehicle || '—' }}</td>
                            <td class="p-4">
                                <span class="text-xs" :class="order.etaOverdue ? 'text-red-400' : 'text-gray-900 dark:text-white'">
                                    {{ order.eta || '—' }}
                                </span>
                            </td>
                            <td class="p-4">
                                <span class="px-2 py-0.5 rounded text-[9px] font-bold" :class="order.slaClass">
                                    {{ order.slaStatus }}
                                </span>
                            </td>
                            <td class="p-4 text-gray-500 text-xs">{{ order.lastUpdated }}</td>
                            <td class="p-4">
                                <div class="flex gap-1.5">
                                    <button v-if="order.status === 'ready'"
                                        @click="updateStatus(order, 'dispatched')"
                                        class="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg text-xs font-bold transition-all hover:scale-105 shadow-md border border-blue-700 dark:border-blue-400">
                                        Dispatch
                                    </button>
                                    <button v-if="order.status === 'dispatched'"
                                        @click="updateStatus(order, 'in-transit')"
                                        class="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 text-white rounded-lg text-xs font-bold transition-all hover:scale-105 shadow-md border border-purple-700 dark:border-purple-400">
                                        Mark In Transit
                                    </button>
                                    <button v-if="order.status === 'in-transit'"
                                        @click="updateStatus(order, 'delivered')"
                                        class="px-3 py-1.5 bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white rounded-lg text-xs font-bold transition-all hover:scale-105 shadow-md border border-green-700 dark:border-green-400">
                                        Mark Delivered
                                    </button>
                                    <button v-if="order.status === 'delivered'"
                                        @click="viewPoD(order)"
                                        class="px-3 py-1.5 bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white rounded-lg text-xs font-bold transition-all hover:scale-105 shadow-md border border-green-700 dark:border-green-400">
                                        View PoD
                                    </button>
                                    <button @click="toggleOrderMenu(order)" class="p-1.5 hover:bg-gray-200 dark:hover:bg-white/10 rounded-lg text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white relative transition-colors">
                                        <span class="material-symbols-outlined text-[16px]">more_vert</span>
                                        <div v-if="orderMenu === (order.backendId || order.id)" class="absolute top-full right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-white/10 rounded-lg shadow-xl z-20 w-40">
                                        <button @click.stop="cancelOrder(order)" class="w-full text-left px-3 py-2 text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors rounded-t-lg">Cancel Order</button>
                                        <button @click.stop="escalateOrder(order)" class="w-full text-left px-3 py-2 text-sm font-semibold text-yellow-600 dark:text-yellow-400 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors rounded-b-lg">Escalate</button>
                                        </div>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- SLA Alerts -->
        <div class="glass-panel rounded-xl p-5">
            <h3 class="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <span class="material-symbols-outlined text-red-400">notification_important</span>
                SLA Violation Alerts
            </h3>
            <div v-if="overdueOrders.length" class="space-y-3">
                <div v-for="order in overdueOrders" :key="order.id" class="p-3 bg-red-100 dark:bg-red-500/10 border border-red-500/20 rounded-lg flex items-center justify-between">
                    <div class="flex items-center gap-3">
                        <span class="material-symbols-outlined text-red-500 dark:text-red-400">error</span>
                        <div>
                            <div class="text-sm text-red-700 dark:text-red-300 font-bold">{{ order.id }} — ETA Overdue</div>
                            <div class="text-xs text-gray-500 dark:text-gray-400">Driver: {{ order.driver || 'Unassigned' }} • Status: {{ order.statusLabel }}</div>
                        </div>
                    </div>
                    <button @click="resolveAlert(order.id)" class="text-xs px-3 py-1.5 rounded-lg font-bold transition-colors border"
                        :class="alertResolved[order.id] ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 border-green-300 dark:border-green-500/30' : 'bg-red-100 dark:bg-red-500/20 hover:bg-red-200 dark:hover:bg-red-500/30 text-red-700 dark:text-red-400 border-red-300 dark:border-red-500/30'">
                        {{ alertResolved[order.id] ? '✓ Resolved' : 'Resolve Now' }}
                    </button>
                </div>
            </div>
            <div v-else class="text-center py-6 text-gray-500 text-sm">
                <span class="material-symbols-outlined text-green-400 text-[32px] block mb-2">check_circle</span>
                No active SLA violations
            </div>
        </div>

        <!-- PoD Modal -->
        <Teleport to="body">
        <div v-if="showPoD" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center" @click.self="showPoD = false">
            <div class="bg-white dark:bg-card-dark shadow-2xl border border-gray-200 dark:border-white/10 rounded-2xl p-6 w-full max-w-md m-4">
                <h3 class="font-bold text-gray-900 dark:text-white mb-4">Proof of Delivery — {{ podOrder?.id }}</h3>
                <div class="space-y-3">
                    <div class="p-3 bg-gray-50 dark:bg-white/5 rounded-lg flex justify-between text-xs">
                        <span class="text-gray-400">Recipient</span><span class="text-gray-900 dark:text-white font-bold">{{ podOrder?.driver || 'Customer' }}</span>
                    </div>
                    <div class="p-3 bg-gray-50 dark:bg-white/5 rounded-lg flex justify-between text-xs">
                        <span class="text-gray-400">Delivered At</span><span class="text-gray-900 dark:text-white">{{ podOrder?.lastUpdated }}</span>
                    </div>
                    <div class="p-3 bg-gray-50 dark:bg-white/5 rounded-lg flex justify-between text-xs">
                        <span class="text-gray-400">Signature</span><span class="text-green-400 font-bold">✓ Captured</span>
                    </div>
                    <div class="p-3 bg-gray-50 dark:bg-white/5 rounded-lg flex justify-between text-xs">
                        <span class="text-gray-400">Photo Proof</span><span class="text-green-400 font-bold">✓ 2 photos attached</span>
                    </div>
                    <div class="p-3 bg-gray-50 dark:bg-white/5 rounded-lg flex justify-between text-xs">
                        <span class="text-gray-400">Condition</span><span class="text-gray-900 dark:text-white">Good — No damage reported</span>
                    </div>
                </div>
                <button @click="showPoD = false" class="mt-4 w-full bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white py-2 rounded-lg text-sm font-bold hover:bg-gray-200 dark:hover:bg-white/20 transition-colors">Close</button>
            </div>
        </div>
        </Teleport>
    </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useDispatcherStore } from '@/stores/dispatcherStore'
import { getStoredAccessToken } from '@/config/api'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

const store = useDispatcherStore()
onMounted(async () => {
    await store.initialize().catch(() => {})
    await store.fetchActiveOrders().catch(() => {})
})

const searchQuery = ref('')
const statusFilter = ref('')
const syncing = ref(false)
const syncDone = ref(false)
const showPoD = ref(false)
const podOrder = ref(null)
const orderMenu = ref(null)
const alertResolved = ref({})
const alertRerouted = ref({})

const orders = ref([])

function mapStatusToUI(backendStatus) {
    const statusMap = {
        'CONFIRMED': 'ready',
        'ASSIGNED': 'dispatched',
        'IN_TRANSIT': 'in-transit',
        'DELIVERED': 'delivered',
    }
    return statusMap[backendStatus] || backendStatus?.toLowerCase().replace('_', '-') || 'ready'
}

function mapStatusLabel(backendStatus) {
    const labelMap = {
        'CONFIRMED': 'Ready',
        'ASSIGNED': 'Dispatched',
        'IN_TRANSIT': 'In Transit',
        'DELIVERED': 'Delivered',
    }
    return labelMap[backendStatus] || backendStatus || 'Ready'
}

watch(() => store.activeOrders, (list) => {
    orders.value = list.map(o => ({
        id: o.trackingCode || o.id,
        backendId: o.id,
        status: mapStatusToUI(o.status),
        statusLabel: mapStatusLabel(o.status),
        driver: o.driver || null,
        vehicle: o.vehicle || null,
        eta: o.eta || null,
        etaOverdue: o.etaOverdue || false,
        slaStatus: o.slaStatus || 'Pending',
        slaClass: o.slaClass || 'bg-gray-500/20 text-gray-400',
        lastUpdated: o.lastUpdated ? new Date(o.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }))
}, { immediate: true })

const readyCount = computed(() => orders.value.filter(o => o.status === 'ready').length)
const dispatchedCount = computed(() => orders.value.filter(o => o.status === 'dispatched').length)
const inTransitCount = computed(() => orders.value.filter(o => o.status === 'in-transit').length)
const deliveredCount = computed(() => orders.value.filter(o => o.status === 'delivered').length)
const overdueOrders = computed(() => orders.value.filter(o => o.etaOverdue || o.slaStatus === 'ESCALATED'))
const overdueCount = computed(() => overdueOrders.value.length)

const statusTabs = computed(() => [
    { label: 'All', value: '', count: orders.value.length, activeClass: 'bg-white/10 text-gray-900 dark:text-white' },
    { label: 'Ready', value: 'ready', count: readyCount.value, activeClass: 'bg-yellow-500/20 text-yellow-400' },
    { label: 'Dispatched', value: 'dispatched', count: dispatchedCount.value, activeClass: 'bg-blue-500/20 text-blue-400' },
    { label: 'In Transit', value: 'in-transit', count: inTransitCount.value, activeClass: 'bg-purple-500/20 text-purple-400' },
    { label: 'Delivered', value: 'delivered', count: deliveredCount.value, activeClass: 'bg-green-500/20 text-green-400' },
])

const filteredOrders = computed(() => {
    return orders.value.filter(o => {
        if (statusFilter.value && o.status !== statusFilter.value) return false
        if (searchQuery.value) {
            const q = searchQuery.value.toLowerCase()
            const matchesId = o.id?.toLowerCase().includes(q)
            const matchesBackendId = o.backendId?.toLowerCase().includes(q)
            const matchesDriver = o.driver?.toLowerCase().includes(q)
            if (!matchesId && !matchesBackendId && !matchesDriver) return false
        }
        return true
    })
})

function getStatusDotClass(status) {
    const map = { 'ready': 'bg-yellow-500', 'dispatched': 'bg-blue-500', 'in-transit': 'bg-purple-500 animate-pulse', 'delivered': 'bg-green-500' }
    return map[status] || 'bg-gray-500'
}

function getStatusTextClass(status) {
    const map = { 'ready': 'text-yellow-400', 'dispatched': 'text-blue-400', 'in-transit': 'text-purple-400', 'delivered': 'text-green-400' }
    return map[status] || 'text-gray-400'
}

async function updateStatus(order, newStatus) {
    // Map UI status to backend status
    const backendStatus = { 'dispatched': 'ASSIGNED', 'in-transit': 'IN_TRANSIT', 'delivered': 'DELIVERED' }
    const labels = { 'dispatched': 'Dispatched', 'in-transit': 'In Transit', 'delivered': 'Delivered' }
    const nextBackendStatus = backendStatus[newStatus]
    if (!nextBackendStatus) return

    // Use the backend UUID for the API call, not the display ID (tracking code)
    const orderId = order.backendId || order.id
    if (!orderId) {
        console.error('No backend order ID available for transition')
        return
    }

    try {
        const token = getStoredAccessToken()
        const res = await fetch(`${API_BASE}/api/v1/orders/${orderId}/transition`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
            body: JSON.stringify({ next_status: nextBackendStatus }),
        })
        if (res.ok) {
            // Optimistically update the local order
            order.status = newStatus
            order.statusLabel = labels[newStatus] || newStatus
            order.lastUpdated = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            if (newStatus === 'dispatched') {
                order.slaStatus = 'On Track'
                order.slaClass = 'bg-green-500/20 text-green-400'
            }
            // Refresh the active orders list from the backend
            await store.fetchActiveOrders().catch(() => {})
        } else {
            const err = await res.json().catch(() => ({}))
            console.error('Transition failed:', err.detail || res.statusText)
            alert(`Status update failed: ${err.detail || res.statusText}`)
        }
    } catch (e) {
        console.error('Transition error:', e)
        alert('Network error while updating order status. Please try again.')
    }
}

async function syncStatus() {
    syncing.value = true
    try {
        await store.fetchActiveOrders()
    } catch (_) {}
    syncing.value = false
    syncDone.value = true
    setTimeout(() => { syncDone.value = false }, 2000)
}

function viewPoD(order) {
    podOrder.value = order
    showPoD.value = true
}

function toggleOrderMenu(order) {
    const key = order.backendId || order.id
    orderMenu.value = orderMenu.value === key ? null : key
}

function cancelOrder(order) {
    orders.value = orders.value.filter(o => o.backendId !== order.backendId)
    orderMenu.value = null
}

function escalateOrder(order) {
    order.slaStatus = 'ESCALATED'
    order.slaClass = 'bg-red-500/20 text-red-400'
    orderMenu.value = null
}

function resolveAlert(orderId) {
    alertResolved.value[orderId] = true
    const order = orders.value.find(o => o.id === orderId || o.backendId === orderId)
    if (order && order.status === 'ready') {
        updateStatus(order, 'dispatched')
        order.driver = 'Auto-assigned'
        order.vehicle = 'Van T-20'
    }
}

function rerouteAlert(orderId) {
    alertRerouted.value[orderId] = true
    const order = orders.value.find(o => o.id === orderId || o.backendId === orderId)
    if (order) {
        order.etaOverdue = false
        order.slaStatus = 'Rerouted'
        order.slaClass = 'bg-blue-500/20 text-blue-400'
    }
}
</script>
