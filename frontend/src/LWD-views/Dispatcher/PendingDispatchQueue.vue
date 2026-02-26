<template>
    <div class="space-y-6">
        <!-- Header -->
        <div class="flex justify-between items-center">
            <div>
                <h2 class="text-2xl font-bold text-white">Pending Dispatch Queue</h2>
                <p class="text-sm text-gray-400 mt-1">Orders marked "Ready for Dispatch" by Warehouse Manager</p>
            </div>
            <div class="flex gap-2">
                <button @click="runGlobalFeasibilityCheck"
                    class="bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 border border-yellow-500/20 py-2 px-4 rounded-lg transition-colors flex items-center gap-2 text-sm font-bold">
                    <span class="material-symbols-outlined text-[18px]">verified</span> Feasibility Check
                </button>
                <button @click="batchAssign" :disabled="selectedOrders.length === 0"
                    class="bg-primary hover:bg-primary-dark text-background-dark font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors text-sm disabled:opacity-50">
                    <span class="material-symbols-outlined text-[18px]">assignment_turned_in</span> Batch Assign ({{ selectedOrders.length }})
                </button>
            </div>
        </div>

        <!-- Summary Cards -->
        <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div class="glass-panel p-4 rounded-xl text-center">
                <div class="text-2xl font-bold text-yellow-400">{{ pendingOrders.length }}</div>
                <div class="text-[10px] text-gray-400 uppercase tracking-wider mt-1">Pending</div>
            </div>
            <div class="glass-panel p-4 rounded-xl text-center">
                <div class="text-2xl font-bold text-red-400">{{ urgentCount }}</div>
                <div class="text-[10px] text-gray-400 uppercase tracking-wider mt-1">Urgent</div>
            </div>
            <div class="glass-panel p-4 rounded-xl text-center">
                <div class="text-2xl font-bold text-blue-400">{{ highCount }}</div>
                <div class="text-[10px] text-gray-400 uppercase tracking-wider mt-1">High Priority</div>
            </div>
            <div class="glass-panel p-4 rounded-xl text-center">
                <div class="text-2xl font-bold text-white">{{ totalWeight.toLocaleString() }} kg</div>
                <div class="text-[10px] text-gray-400 uppercase tracking-wider mt-1">Total Weight</div>
            </div>
            <div class="glass-panel p-4 rounded-xl text-center">
                <div class="text-2xl font-bold text-primary">{{ feasibleCount }}/{{ pendingOrders.length }}</div>
                <div class="text-[10px] text-gray-400 uppercase tracking-wider mt-1">Feasible</div>
            </div>
        </div>

        <!-- Filters -->
        <div class="glass-panel p-4 rounded-xl flex flex-wrap gap-3 items-center">
            <div class="relative flex-1 min-w-[200px]">
                <span class="material-symbols-outlined absolute left-3 top-2.5 text-gray-500 text-[18px]">search</span>
                <input v-model="searchQuery" type="text" placeholder="Search by Order ID, warehouse, type..."
                    class="w-full bg-black/20 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-white text-sm focus:outline-none focus:border-primary/50">
            </div>
            <select v-model="filterPriority"
                class="bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white text-sm">
                <option value="">All Priorities</option>
                <option value="URGENT">Urgent</option>
                <option value="HIGH">High</option>
                <option value="NORMAL">Normal</option>
                <option value="LOW">Low</option>
            </select>
            <select v-model="filterWarehouse"
                class="bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white text-sm">
                <option value="">All Warehouses</option>
                <option v-for="wh in warehouses" :key="wh" :value="wh">{{ wh }}</option>
            </select>
            <select v-model="filterFeasibility"
                class="bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white text-sm">
                <option value="">All Status</option>
                <option value="feasible">Feasible</option>
                <option value="infeasible">Not Feasible</option>
                <option value="unchecked">Unchecked</option>
            </select>
        </div>

        <!-- Orders Table -->
        <div class="glass-panel rounded-xl overflow-hidden">
            <div class="overflow-x-auto">
                <table class="w-full text-left text-sm">
                    <thead class="bg-white/5 text-gray-400 uppercase text-[10px] tracking-wider">
                        <tr>
                            <th class="p-4">
                                <input type="checkbox" v-model="selectAll"
                                    class="rounded border-gray-600 bg-black/20 text-primary focus:ring-primary">
                            </th>
                            <th class="p-4">Order ID</th>
                            <th class="p-4">Pickup Warehouse</th>
                            <th class="p-4">Weight / Volume</th>
                            <th class="p-4">Labor</th>
                            <th class="p-4">Priority</th>
                            <th class="p-4">Delivery Deadline</th>
                            <th class="p-4">Special Instructions</th>
                            <th class="p-4">Feasibility</th>
                            <th class="p-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-white/5">
                        <tr v-for="order in filteredOrders" :key="order.id"
                            class="hover:bg-white/5 transition-colors group">
                            <td class="p-4">
                                <input type="checkbox" v-model="order.selected"
                                    class="rounded border-gray-600 bg-black/20 text-primary focus:ring-primary">
                            </td>
                            <td class="p-4 font-mono text-white font-bold">{{ order.id }}</td>
                            <td class="p-4">
                                <div class="flex items-center gap-2">
                                    <span
                                        class="material-symbols-outlined text-gray-500 text-[16px]">warehouse</span>
                                    <span class="text-gray-300">{{ order.warehouse }}</span>
                                </div>
                            </td>
                            <td class="p-4">
                                <div class="text-white">{{ order.weight }} kg</div>
                                <div class="text-[10px] text-gray-500">{{ order.volume }} m³</div>
                            </td>
                            <td class="p-4">
                                <div class="flex items-center gap-1" v-if="order.laborCount > 0">
                                    <span class="material-symbols-outlined text-blue-400 text-[16px]">groups</span>
                                    <span class="text-blue-400 font-bold">{{ order.laborCount }}</span>
                                </div>
                                <span v-else class="text-gray-600">—</span>
                            </td>
                            <td class="p-4">
                                <span class="px-2 py-1 rounded text-[10px] font-bold border"
                                    :class="getPriorityClass(order.priority)">
                                    {{ order.priority }}
                                </span>
                            </td>
                            <td class="p-4">
                                <div class="text-white text-xs">{{ order.deadline }}</div>
                                <div class="text-[10px]" :class="isDeadlineCritical(order.deadline) ? 'text-red-400' : 'text-gray-500'">
                                    {{ getTimeRemaining(order.deadline) }}
                                </div>
                            </td>
                            <td class="p-4">
                                <div v-if="order.specialInstructions" class="max-w-[150px]">
                                    <span class="text-xs text-yellow-300 truncate block" :title="order.specialInstructions">
                                        {{ order.specialInstructions }}
                                    </span>
                                </div>
                                <span v-else class="text-gray-600">—</span>
                            </td>
                            <td class="p-4">
                                <div v-if="order.feasibility === 'feasible'"
                                    class="flex items-center gap-1 text-green-400 text-xs font-bold">
                                    <span class="material-symbols-outlined text-[14px]">check_circle</span> Feasible
                                </div>
                                <div v-else-if="order.feasibility === 'infeasible'"
                                    class="flex items-center gap-1 text-red-400 text-xs font-bold">
                                    <span class="material-symbols-outlined text-[14px]">cancel</span> {{ order.failReason }}
                                </div>
                                <div v-else class="flex items-center gap-1 text-gray-500 text-xs">
                                    <span class="material-symbols-outlined text-[14px]">pending</span> Unchecked
                                </div>
                            </td>
                            <td class="p-4">
                                <div class="flex gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                                    <button @click="runFeasibilityCheck(order)"
                                        class="p-1.5 hover:bg-yellow-500/20 rounded text-yellow-400" title="Run Feasibility Check">
                                        <span class="material-symbols-outlined text-[16px]">verified</span>
                                    </button>
                                    <button @click="assignDriver(order)" class="p-1.5 hover:bg-primary/20 rounded text-primary" title="Assign Driver">
                                        <span class="material-symbols-outlined text-[16px]">person_add</span>
                                    </button>
                                    <button @click="escalateOrder(order)" class="p-1.5 hover:bg-blue-500/20 rounded text-blue-400" title="Escalate to Manager">
                                        <span class="material-symbols-outlined text-[16px]">arrow_upward</span>
                                    </button>
                                    <button @click="holdOrder(order)" class="p-1.5 hover:bg-white/10 rounded text-gray-400" title="Hold Order">
                                        <span class="material-symbols-outlined text-[16px]">pause_circle</span>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Feasibility Check Modal -->
        <div v-if="showFeasibilityModal"
            class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div class="bg-card-dark border border-white/10 rounded-2xl p-6 w-full max-w-2xl shadow-2xl">
                <div class="flex justify-between items-center mb-6">
                    <h3 class="text-lg font-bold text-white flex items-center gap-2">
                        <span class="material-symbols-outlined text-yellow-400">verified</span>
                        Dispatch Feasibility Validator
                    </h3>
                    <button @click="showFeasibilityModal = false" class="text-gray-400 hover:text-white">
                        <span class="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div class="space-y-4">
                    <!-- Vehicle Capacity Check -->
                    <div class="p-4 bg-white/5 rounded-xl border border-white/5">
                        <div class="flex items-center justify-between mb-2">
                            <span class="font-bold text-white text-sm flex items-center gap-2">
                                <span class="material-symbols-outlined text-blue-400 text-[18px]">local_shipping</span>
                                Vehicle Capacity Check
                            </span>
                            <span class="px-2 py-0.5 rounded text-[10px] font-bold" :class="feasCheckOrder?.weight <= 1000 ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'">
                                {{ feasCheckOrder?.weight <= 1000 ? 'PASS' : 'HEAVY' }}
                            </span>
                        </div>
                        <div class="grid grid-cols-3 gap-3 text-xs">
                            <div>
                                <span class="text-gray-500 block">Weight</span>
                                <span class="text-white">{{ feasCheckOrder?.weight }} / 2000 kg</span>
                                <div class="w-full h-1 bg-gray-700 rounded mt-1">
                                    <div class="h-full rounded" :class="(feasCheckOrder?.weight / 2000 * 100) > 70 ? 'bg-yellow-500' : 'bg-green-500'" :style="{ width: Math.min(100, (feasCheckOrder?.weight / 2000) * 100) + '%' }"></div>
                                </div>
                            </div>
                            <div>
                                <span class="text-gray-500 block">Volume</span>
                                <span class="text-white">{{ feasCheckOrder?.volume }} / 12 m³</span>
                                <div class="w-full h-1 bg-gray-700 rounded mt-1">
                                    <div class="h-full bg-green-500 rounded" :style="{ width: Math.min(100, (feasCheckOrder?.volume / 12) * 100) + '%' }"></div>
                                </div>
                            </div>
                            <div>
                                <span class="text-gray-500 block">Labor</span>
                                <span class="text-white">{{ feasCheckOrder?.laborCount || 0 }} crew needed</span>
                                <div class="w-full h-1 bg-gray-700 rounded mt-1">
                                    <div class="h-full rounded" :class="feasCheckOrder?.laborCount > 2 ? 'bg-yellow-500' : 'bg-green-500'" :style="{ width: Math.min(100, ((feasCheckOrder?.laborCount || 0) / 5) * 100) + '%' }"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Driver Availability -->
                    <div class="p-4 bg-white/5 rounded-xl border border-white/5">
                        <div class="flex items-center justify-between mb-2">
                            <span class="font-bold text-white text-sm flex items-center gap-2">
                                <span class="material-symbols-outlined text-purple-400 text-[18px]">badge</span>
                                Driver Availability
                            </span>
                            <span class="px-2 py-0.5 rounded bg-green-500/20 text-green-400 text-[10px] font-bold">AVAILABLE</span>
                        </div>
                        <div class="grid grid-cols-3 gap-3 text-xs">
                            <div>
                                <span class="text-gray-500 block">Driver Status</span>
                                <span class="text-green-400 font-bold">Free</span>
                            </div>
                            <div>
                                <span class="text-gray-500 block">Working Hours</span>
                                <span class="text-white">4.2h / 10h max</span>
                            </div>
                            <div>
                                <span class="text-gray-500 block">HOS Compliance</span>
                                <span class="text-green-400 flex items-center gap-1">
                                    <span class="material-symbols-outlined text-[12px]">check</span> Within limits
                                </span>
                            </div>
                        </div>
                    </div>

                    <!-- Delivery Window -->
                    <div class="p-4 bg-white/5 rounded-xl border border-white/5">
                        <div class="flex items-center justify-between mb-2">
                            <span class="font-bold text-white text-sm flex items-center gap-2">
                                <span class="material-symbols-outlined text-orange-400 text-[18px]">schedule</span>
                                Delivery Window Check
                            </span>
                            <span class="px-2 py-0.5 rounded text-[10px] font-bold"
                                :class="isDeadlineCritical(feasCheckOrder?.deadline) ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'">
                                {{ isDeadlineCritical(feasCheckOrder?.deadline) ? 'TIGHT' : 'ON TRACK' }}
                            </span>
                        </div>
                        <div class="grid grid-cols-3 gap-3 text-xs">
                            <div>
                                <span class="text-gray-500 block">Deadline</span>
                                <span class="text-white">{{ feasCheckOrder?.deadline }}</span>
                            </div>
                            <div>
                                <span class="text-gray-500 block">Remaining</span>
                                <span :class="isDeadlineCritical(feasCheckOrder?.deadline) ? 'text-red-400' : 'text-white'">{{ getTimeRemaining(feasCheckOrder?.deadline) }}</span>
                            </div>
                            <div>
                                <span class="text-gray-500 block">Priority</span>
                                <span class="text-white">{{ feasCheckOrder?.priority }}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="flex gap-3 mt-6">
                    <button @click="approveAndAssign"
                        class="flex-1 bg-primary hover:bg-primary-dark text-background-dark font-bold py-2.5 rounded-lg transition-colors">
                        Approve & Assign
                    </button>
                    <button @click="holdFeasOrder"
                        class="flex-1 bg-white/10 hover:bg-white/20 text-white font-bold py-2.5 rounded-lg transition-colors">
                        Hold Order
                    </button>
                    <button @click="escalateFeasOrder"
                        class="bg-red-500/20 hover:bg-red-500/30 text-red-400 font-bold py-2.5 px-4 rounded-lg transition-colors">
                        Escalate
                    </button>
                </div>
                <div v-if="feasibilityToast" class="mt-3 text-center text-xs font-bold" :class="feasibilityToast.includes('Assigned') ? 'text-green-400' : feasibilityToast.includes('Hold') ? 'text-yellow-400' : 'text-red-400'">
                    {{ feasibilityToast }}
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const searchQuery = ref('')
const filterPriority = ref('')
const filterWarehouse = ref('')
const filterFeasibility = ref('')
const selectAll = ref(false)
const showFeasibilityModal = ref(false)
const feasCheckOrder = ref(null)
const feasibilityToast = ref('')

const warehouses = ['North-East Hub', 'South Hub', 'West DC', 'Central Depot', 'Airport Hub']

const pendingOrders = ref([
    { id: 'ORD-9921', warehouse: 'North-East Hub', weight: 450, volume: 2.1, laborCount: 0, priority: 'HIGH', deadline: '2026-02-26 17:00', specialInstructions: 'Handle with care - fragile electronics', feasibility: 'feasible', failReason: '', selected: false },
    { id: 'ORD-3321', warehouse: 'South Hub', weight: 120, volume: 0.8, laborCount: 0, priority: 'URGENT', deadline: '2026-02-26 14:00', specialInstructions: 'Temperature controlled - perishables', feasibility: 'infeasible', failReason: 'No reefer', selected: false },
    { id: 'ORD-1102', warehouse: 'North-East Hub', weight: 850, volume: 5.4, laborCount: 4, priority: 'NORMAL', deadline: '2026-02-26 20:00', specialInstructions: 'House shift - needs crew and lift gate', feasibility: 'feasible', failReason: '', selected: false },
    { id: 'ORD-5541', warehouse: 'West DC', weight: 200, volume: 1.2, laborCount: 0, priority: 'NORMAL', deadline: '2026-02-27 10:00', specialInstructions: '', feasibility: 'unchecked', failReason: '', selected: false },
    { id: 'ORD-7712', warehouse: 'Central Depot', weight: 1200, volume: 8.0, laborCount: 2, priority: 'HIGH', deadline: '2026-02-26 16:30', specialInstructions: 'Restricted zone access required', feasibility: 'unchecked', failReason: '', selected: false },
    { id: 'ORD-8843', warehouse: 'Airport Hub', weight: 75, volume: 0.3, laborCount: 0, priority: 'URGENT', deadline: '2026-02-26 13:00', specialInstructions: 'Time-sensitive documents', feasibility: 'feasible', failReason: '', selected: false },
    { id: 'ORD-6654', warehouse: 'South Hub', weight: 340, volume: 2.8, laborCount: 0, priority: 'LOW', deadline: '2026-02-27 18:00', specialInstructions: '', feasibility: 'unchecked', failReason: '', selected: false },
    { id: 'ORD-2210', warehouse: 'West DC', weight: 560, volume: 3.5, laborCount: 3, priority: 'HIGH', deadline: '2026-02-26 19:00', specialInstructions: 'Office relocation - need dolly and blankets', feasibility: 'infeasible', failReason: 'HOS limit', selected: false },
])

const urgentCount = computed(() => pendingOrders.value.filter(o => o.priority === 'URGENT').length)
const highCount = computed(() => pendingOrders.value.filter(o => o.priority === 'HIGH').length)
const totalWeight = computed(() => pendingOrders.value.reduce((sum, o) => sum + o.weight, 0))
const feasibleCount = computed(() => pendingOrders.value.filter(o => o.feasibility === 'feasible').length)
const selectedOrders = computed(() => pendingOrders.value.filter(o => o.selected))

watch(selectAll, (val) => { pendingOrders.value.forEach(o => { o.selected = val }) })

const filteredOrders = computed(() => {
    return pendingOrders.value.filter(o => {
        if (searchQuery.value && !o.id.toLowerCase().includes(searchQuery.value.toLowerCase()) && !o.warehouse.toLowerCase().includes(searchQuery.value.toLowerCase())) return false
        if (filterPriority.value && o.priority !== filterPriority.value) return false
        if (filterWarehouse.value && o.warehouse !== filterWarehouse.value) return false
        if (filterFeasibility.value && o.feasibility !== filterFeasibility.value) return false
        return true
    })
})

function getPriorityClass(priority) {
    const map = {
        URGENT: 'bg-red-500/20 text-red-400 border-red-500/30',
        HIGH: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
        NORMAL: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        LOW: 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
    return map[priority] || map.NORMAL
}

function isDeadlineCritical(deadline) {
    if (!deadline) return false
    const diff = new Date(deadline) - new Date()
    return diff < 3 * 60 * 60 * 1000
}

function getTimeRemaining(deadline) {
    if (!deadline) return '--'
    const diff = new Date(deadline) - new Date()
    if (diff < 0) return 'OVERDUE'
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    return `${hours}h ${mins}m remaining`
}

function runFeasibilityCheck(order) {
    feasCheckOrder.value = order
    feasibilityToast.value = ''
    showFeasibilityModal.value = true
}

function runGlobalFeasibilityCheck() {
    pendingOrders.value.forEach(o => {
        if (o.feasibility === 'unchecked') {
            o.feasibility = o.weight > 1000 ? 'infeasible' : 'feasible'
            o.failReason = o.weight > 1000 ? 'Overweight' : ''
        }
    })
}

function approveAndAssign() {
    if (feasCheckOrder.value) {
        feasCheckOrder.value.feasibility = 'feasible'
        feasCheckOrder.value.failReason = ''
        feasibilityToast.value = `✓ ${feasCheckOrder.value.id} — Assigned to next available driver`
        setTimeout(() => {
            const idx = pendingOrders.value.findIndex(o => o.id === feasCheckOrder.value.id)
            if (idx > -1) pendingOrders.value.splice(idx, 1)
            showFeasibilityModal.value = false
        }, 1200)
    }
}

function holdFeasOrder() {
    if (feasCheckOrder.value) {
        feasibilityToast.value = `⏸ ${feasCheckOrder.value.id} — Hold placed`
        setTimeout(() => { showFeasibilityModal.value = false }, 1000)
    }
}

function escalateFeasOrder() {
    if (feasCheckOrder.value) {
        feasibilityToast.value = `⬆ ${feasCheckOrder.value.id} — Escalated to Manager`
        setTimeout(() => { showFeasibilityModal.value = false }, 1000)
    }
}

function assignDriver(order) {
    order.feasibility = 'feasible'
    order.failReason = ''
    const idx = pendingOrders.value.findIndex(o => o.id === order.id)
    if (idx > -1) pendingOrders.value.splice(idx, 1)
}

function escalateOrder(order) {
    order.priority = 'URGENT'
}

function holdOrder(order) {
    order.feasibility = 'infeasible'
    order.failReason = 'On Hold'
}

function batchAssign() {
    const ids = selectedOrders.value.map(o => o.id)
    pendingOrders.value = pendingOrders.value.filter(o => !ids.includes(o.id))
    selectAll.value = false
}
</script>
