<template>
    <div class="space-y-6">
        <!-- Header -->
        <div class="flex justify-between items-center">
            <div>
                <h2 class="text-2xl font-bold text-white">Order Status Control</h2>
                <p class="text-sm text-gray-400 mt-1">Track and control order lifecycle — Ready → Dispatched → In Transit (Completion by Driver PoD)</p>
            </div>
            <div class="flex gap-2">
                <select v-model="statusFilter" class="bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white text-sm">
                    <option value="">All Statuses</option>
                    <option value="ready">Ready for Dispatch</option>
                    <option value="dispatched">Dispatched</option>
                    <option value="in-transit">In Transit</option>
                    <option value="delivered">Delivered (PoD)</option>
                </select>
                <button @click="syncStatus" class="bg-primary hover:bg-primary-dark text-background-dark font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors text-sm">
                    <span class="material-symbols-outlined text-[18px]" :class="{ 'animate-spin': syncing }">refresh</span> {{ syncing ? 'Syncing...' : syncDone ? '✓ Synced' : 'Sync Status' }}
                </button>
            </div>
        </div>

        <!-- Status Pipeline -->
        <div class="glass-panel rounded-xl p-6">
            <div class="flex items-center justify-between mb-4">
                <h3 class="font-bold text-white text-sm">Dispatch Pipeline Overview</h3>
                <span class="text-xs text-gray-400">Today: {{ new Date().toLocaleDateString() }}</span>
            </div>

            <div class="flex items-center gap-0">
                <!-- Ready -->
                <div class="flex-1 relative">
                    <div class="bg-yellow-500/10 border border-yellow-500/20 rounded-l-xl p-4 text-center">
                        <div class="text-3xl font-bold text-yellow-400 mb-1">{{ readyCount }}</div>
                        <div class="text-xs text-yellow-300 font-bold">READY</div>
                        <div class="text-[10px] text-gray-500 mt-1">Awaiting dispatch</div>
                    </div>
                </div>
                <span class="material-symbols-outlined text-gray-600 mx-1">chevron_right</span>

                <!-- Dispatched -->
                <div class="flex-1 relative">
                    <div class="bg-blue-500/10 border border-blue-500/20 p-4 text-center">
                        <div class="text-3xl font-bold text-blue-400 mb-1">{{ dispatchedCount }}</div>
                        <div class="text-xs text-blue-300 font-bold">DISPATCHED</div>
                        <div class="text-[10px] text-gray-500 mt-1">Assigned to driver</div>
                    </div>
                </div>
                <span class="material-symbols-outlined text-gray-600 mx-1">chevron_right</span>

                <!-- In Transit -->
                <div class="flex-1 relative">
                    <div class="bg-purple-500/10 border border-purple-500/20 p-4 text-center">
                        <div class="text-3xl font-bold text-purple-400 mb-1">{{ inTransitCount }}</div>
                        <div class="text-xs text-purple-300 font-bold">IN TRANSIT</div>
                        <div class="text-[10px] text-gray-500 mt-1">On the road</div>
                    </div>
                </div>
                <span class="material-symbols-outlined text-gray-600 mx-1">chevron_right</span>

                <!-- Delivered -->
                <div class="flex-1 relative">
                    <div class="bg-green-500/10 border border-green-500/20 rounded-r-xl p-4 text-center">
                        <div class="text-3xl font-bold text-green-400 mb-1">{{ deliveredCount }}</div>
                        <div class="text-xs text-green-300 font-bold">DELIVERED</div>
                        <div class="text-[10px] text-gray-500 mt-1">PoD confirmed</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- SLA Compliance Tracking -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div class="glass-panel p-4 rounded-xl">
                <div class="flex items-center justify-between mb-2">
                    <span class="text-xs text-gray-400">Ready → Assigned Time</span>
                    <span class="material-symbols-outlined text-[16px] text-yellow-400">timer</span>
                </div>
                <div class="text-xl font-bold text-white">8.2 min</div>
                <div class="text-[10px] text-green-400">-12% vs target (10 min)</div>
            </div>
            <div class="glass-panel p-4 rounded-xl">
                <div class="flex items-center justify-between mb-2">
                    <span class="text-xs text-gray-400">On-Time Pickup %</span>
                    <span class="material-symbols-outlined text-[16px] text-blue-400">local_shipping</span>
                </div>
                <div class="text-xl font-bold text-white">96.2%</div>
                <div class="text-[10px] text-green-400">+1.2% above SLA</div>
            </div>
            <div class="glass-panel p-4 rounded-xl">
                <div class="flex items-center justify-between mb-2">
                    <span class="text-xs text-gray-400">On-Time Dispatch %</span>
                    <span class="material-symbols-outlined text-[16px] text-purple-400">send</span>
                </div>
                <div class="text-xl font-bold text-white">94.8%</div>
                <div class="text-[10px] text-yellow-400">-0.2% below target</div>
            </div>
            <div class="glass-panel p-4 rounded-xl">
                <div class="flex items-center justify-between mb-2">
                    <span class="text-xs text-gray-400">Missed Window</span>
                    <span class="material-symbols-outlined text-[16px] text-red-400">report</span>
                </div>
                <div class="text-xl font-bold text-red-400">3</div>
                <div class="text-[10px] text-red-300">Orders delayed today</div>
            </div>
        </div>

        <!-- Order List Table -->
        <div class="glass-panel rounded-xl overflow-hidden">
            <div class="p-4 border-b border-white/5 flex items-center justify-between">
                <div class="flex gap-2">
                    <button v-for="tab in statusTabs" :key="tab.value"
                        @click="statusFilter = tab.value"
                        class="px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                        :class="statusFilter === tab.value ? tab.activeClass : 'bg-white/5 text-gray-400 hover:bg-white/10'">
                        {{ tab.label }} ({{ tab.count }})
                    </button>
                </div>
                <div class="relative">
                    <span class="material-symbols-outlined absolute left-2 top-2 text-gray-500 text-[16px]">search</span>
                    <input v-model="searchQuery" type="text" placeholder="Search orders..."
                        class="bg-black/20 border border-white/10 rounded-lg py-1.5 pl-8 pr-4 text-white text-xs focus:outline-none focus:border-primary/50 w-48">
                </div>
            </div>

            <div class="overflow-x-auto">
                <table class="w-full text-left text-sm">
                    <thead class="bg-white/5 text-gray-400 uppercase text-[10px] tracking-wider">
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
                    <tbody class="divide-y divide-white/5">
                        <tr v-for="order in filteredOrders" :key="order.id"
                            class="hover:bg-white/5 transition-colors group">
                            <td class="p-4 font-mono text-white font-bold">{{ order.id }}</td>
                            <td class="p-4">
                                <div class="flex items-center gap-2">
                                    <span class="w-2 h-2 rounded-full" :class="getStatusDotClass(order.status)"></span>
                                    <span class="text-xs font-bold" :class="getStatusTextClass(order.status)">{{ order.statusLabel }}</span>
                                </div>
                            </td>
                            <td class="p-4 text-gray-300 text-xs">{{ order.driver || '—' }}</td>
                            <td class="p-4 text-gray-300 text-xs">{{ order.vehicle || '—' }}</td>
                            <td class="p-4">
                                <span class="text-xs" :class="order.etaOverdue ? 'text-red-400' : 'text-white'">
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
                                <div class="flex gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                                    <button v-if="order.status === 'ready'"
                                        @click="updateStatus(order, 'dispatched')"
                                        class="px-2 py-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded text-[10px] font-bold transition-colors">
                                        Dispatch
                                    </button>
                                    <button v-if="order.status === 'dispatched'"
                                        @click="updateStatus(order, 'in-transit')"
                                        class="px-2 py-1 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded text-[10px] font-bold transition-colors">
                                        Mark In Transit
                                    </button>
                                    <button v-if="order.status === 'in-transit'"
                                        class="px-2 py-1 bg-gray-500/20 text-gray-500 rounded text-[10px] font-bold cursor-not-allowed" disabled>
                                        Awaiting PoD
                                    </button>
                                    <button v-if="order.status === 'delivered'"
                                        @click="viewPoD(order)"
                                        class="px-2 py-1 bg-green-500/20 text-green-400 rounded text-[10px] font-bold">
                                        View PoD
                                    </button>
                                    <button @click="toggleOrderMenu(order)" class="p-1 hover:bg-white/10 rounded text-gray-400 relative">
                                        <span class="material-symbols-outlined text-[14px]">more_vert</span>
                                        <div v-if="orderMenu === order.id" class="absolute bottom-full right-0 mb-1 bg-gray-900 border border-white/10 rounded-lg shadow-xl z-20 w-36">
                                            <button @click.stop="cancelOrder(order)" class="w-full text-left px-3 py-2 text-xs text-red-400 hover:bg-white/5">Cancel Order</button>
                                            <button @click.stop="escalateOrder(order)" class="w-full text-left px-3 py-2 text-xs text-yellow-400 hover:bg-white/5">Escalate</button>
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
            <h3 class="font-bold text-white mb-4 flex items-center gap-2">
                <span class="material-symbols-outlined text-red-400">notification_important</span>
                SLA Violation Alerts
            </h3>
            <div class="space-y-3">
                <div class="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center justify-between">
                    <div class="flex items-center gap-3">
                        <span class="material-symbols-outlined text-red-400">error</span>
                        <div>
                            <div class="text-sm text-red-300 font-bold">ORD-3321 — Dispatch Window Missed</div>
                            <div class="text-xs text-gray-400">Was ready at 10:15 AM, still not dispatched. SLA requires dispatch within 15 min.</div>
                        </div>
                    </div>
                    <button @click="resolveAlert('ORD-3321')" class="text-xs px-3 py-1.5 rounded font-bold transition-colors"
                        :class="alertResolved['ORD-3321'] ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 hover:bg-red-500/30 text-red-400'">
                        {{ alertResolved['ORD-3321'] ? '✓ Resolved' : 'Resolve Now' }}
                    </button>
                </div>
                <div class="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg flex items-center justify-between">
                    <div class="flex items-center gap-3">
                        <span class="material-symbols-outlined text-yellow-400">schedule</span>
                        <div>
                            <div class="text-sm text-yellow-300 font-bold">ORD-7712 — ETA Slipping</div>
                            <div class="text-xs text-gray-400">Current ETA 17:15, delivery deadline 16:30. 45 min overdue risk.</div>
                        </div>
                    </div>
                    <button @click="rerouteAlert('ORD-7712')" class="text-xs px-3 py-1.5 rounded font-bold transition-colors"
                        :class="alertRerouted['ORD-7712'] ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400'">
                        {{ alertRerouted['ORD-7712'] ? '✓ Rerouted' : 'Reroute' }}
                    </button>
                </div>
            </div>
        </div>

        <!-- PoD Modal -->
        <div v-if="showPoD" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center" @click.self="showPoD = false">
            <div class="glass-panel rounded-2xl p-6 w-full max-w-md m-4 border border-white/10">
                <h3 class="font-bold text-white mb-4">Proof of Delivery — {{ podOrder?.id }}</h3>
                <div class="space-y-3">
                    <div class="p-3 bg-white/5 rounded-lg flex justify-between text-xs">
                        <span class="text-gray-400">Recipient</span><span class="text-white font-bold">{{ podOrder?.driver || 'Customer' }}</span>
                    </div>
                    <div class="p-3 bg-white/5 rounded-lg flex justify-between text-xs">
                        <span class="text-gray-400">Delivered At</span><span class="text-white">{{ podOrder?.lastUpdated }}</span>
                    </div>
                    <div class="p-3 bg-white/5 rounded-lg flex justify-between text-xs">
                        <span class="text-gray-400">Signature</span><span class="text-green-400 font-bold">✓ Captured</span>
                    </div>
                    <div class="p-3 bg-white/5 rounded-lg flex justify-between text-xs">
                        <span class="text-gray-400">Photo Proof</span><span class="text-green-400 font-bold">✓ 2 photos attached</span>
                    </div>
                    <div class="p-3 bg-white/5 rounded-lg flex justify-between text-xs">
                        <span class="text-gray-400">Condition</span><span class="text-white">Good — No damage reported</span>
                    </div>
                </div>
                <button @click="showPoD = false" class="mt-4 w-full bg-white/10 text-white py-2 rounded-lg text-sm font-bold">Close</button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const searchQuery = ref('')
const statusFilter = ref('')
const syncing = ref(false)
const syncDone = ref(false)
const showPoD = ref(false)
const podOrder = ref(null)
const orderMenu = ref(null)
const alertResolved = ref({})
const alertRerouted = ref({})

const orders = ref([
    { id: 'ORD-9921', status: 'in-transit', statusLabel: 'In Transit', driver: 'Mike Ross', vehicle: 'Van T-20', eta: '2:45 PM', etaOverdue: false, slaStatus: 'On Track', slaClass: 'bg-green-500/20 text-green-400', lastUpdated: '12:30 PM' },
    { id: 'ORD-3321', status: 'ready', statusLabel: 'Ready', driver: null, vehicle: null, eta: null, etaOverdue: false, slaStatus: 'OVERDUE', slaClass: 'bg-red-500/20 text-red-400', lastUpdated: '10:15 AM' },
    { id: 'ORD-1102', status: 'dispatched', statusLabel: 'Dispatched', driver: 'Harvey Specter', vehicle: 'Truck XL', eta: '4:15 PM', etaOverdue: false, slaStatus: 'On Track', slaClass: 'bg-green-500/20 text-green-400', lastUpdated: '11:45 AM' },
    { id: 'ORD-5541', status: 'dispatched', statusLabel: 'Dispatched', driver: 'Rachel Zane', vehicle: 'Van T-15', eta: '3:30 PM', etaOverdue: false, slaStatus: 'On Track', slaClass: 'bg-green-500/20 text-green-400', lastUpdated: '11:50 AM' },
    { id: 'ORD-7712', status: 'in-transit', statusLabel: 'In Transit', driver: 'Mike Ross', vehicle: 'Van T-20', eta: '5:15 PM', etaOverdue: true, slaStatus: 'AT RISK', slaClass: 'bg-yellow-500/20 text-yellow-400', lastUpdated: '1:15 PM' },
    { id: 'ORD-8843', status: 'delivered', statusLabel: 'Delivered', driver: 'Donna Paulsen', vehicle: 'Van T-15', eta: null, etaOverdue: false, slaStatus: 'Completed', slaClass: 'bg-green-500/20 text-green-400', lastUpdated: '11:02 AM' },
    { id: 'ORD-6654', status: 'ready', statusLabel: 'Ready', driver: null, vehicle: null, eta: null, etaOverdue: false, slaStatus: 'Pending', slaClass: 'bg-gray-500/20 text-gray-400', lastUpdated: '12:00 PM' },
    { id: 'ORD-2210', status: 'in-transit', statusLabel: 'In Transit', driver: 'Jessica Pearson', vehicle: 'Truck M', eta: '4:00 PM', etaOverdue: false, slaStatus: 'On Track', slaClass: 'bg-green-500/20 text-green-400', lastUpdated: '12:45 PM' },
])

const readyCount = computed(() => orders.value.filter(o => o.status === 'ready').length)
const dispatchedCount = computed(() => orders.value.filter(o => o.status === 'dispatched').length)
const inTransitCount = computed(() => orders.value.filter(o => o.status === 'in-transit').length)
const deliveredCount = computed(() => orders.value.filter(o => o.status === 'delivered').length)

const statusTabs = computed(() => [
    { label: 'All', value: '', count: orders.value.length, activeClass: 'bg-white/10 text-white' },
    { label: 'Ready', value: 'ready', count: readyCount.value, activeClass: 'bg-yellow-500/20 text-yellow-400' },
    { label: 'Dispatched', value: 'dispatched', count: dispatchedCount.value, activeClass: 'bg-blue-500/20 text-blue-400' },
    { label: 'In Transit', value: 'in-transit', count: inTransitCount.value, activeClass: 'bg-purple-500/20 text-purple-400' },
    { label: 'Delivered', value: 'delivered', count: deliveredCount.value, activeClass: 'bg-green-500/20 text-green-400' },
])

const filteredOrders = computed(() => {
    return orders.value.filter(o => {
        if (statusFilter.value && o.status !== statusFilter.value) return false
        if (searchQuery.value && !o.id.toLowerCase().includes(searchQuery.value.toLowerCase())) return false
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

function updateStatus(order, newStatus) {
    const labels = { 'dispatched': 'Dispatched', 'in-transit': 'In Transit' }
    order.status = newStatus
    order.statusLabel = labels[newStatus] || newStatus
    order.lastUpdated = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    if (newStatus === 'dispatched') {
        order.slaStatus = 'On Track'
        order.slaClass = 'bg-green-500/20 text-green-400'
    }
}

function syncStatus() {
    syncing.value = true
    setTimeout(() => {
        orders.value.forEach(o => {
            o.lastUpdated = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        })
        syncing.value = false
        syncDone.value = true
        setTimeout(() => { syncDone.value = false }, 2000)
    }, 1500)
}

function viewPoD(order) {
    podOrder.value = order
    showPoD.value = true
}

function toggleOrderMenu(order) { orderMenu.value = orderMenu.value === order.id ? null : order.id }

function cancelOrder(order) {
    orders.value = orders.value.filter(o => o.id !== order.id)
    orderMenu.value = null
}

function escalateOrder(order) {
    order.slaStatus = 'ESCALATED'
    order.slaClass = 'bg-red-500/20 text-red-400'
    orderMenu.value = null
}

function resolveAlert(orderId) {
    alertResolved.value[orderId] = true
    const order = orders.value.find(o => o.id === orderId)
    if (order && order.status === 'ready') {
        updateStatus(order, 'dispatched')
        order.driver = 'Auto-assigned'
        order.vehicle = 'Van T-20'
    }
}

function rerouteAlert(orderId) {
    alertRerouted.value[orderId] = true
    const order = orders.value.find(o => o.id === orderId)
    if (order) {
        order.etaOverdue = false
        order.slaStatus = 'Rerouted'
        order.slaClass = 'bg-blue-500/20 text-blue-400'
    }
}
</script>
