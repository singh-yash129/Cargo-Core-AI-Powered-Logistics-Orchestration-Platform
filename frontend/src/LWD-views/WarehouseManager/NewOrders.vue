<template>
    <div class="space-y-6">
        <!-- Header -->
        <div class="flex justify-between items-center">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white">New Orders / Demand Management</h2>
            <div class="flex gap-3">
                <div
                    class="bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-lg p-1 flex">
                    <button
                        :class="activeTab === 'incoming' ? 'bg-primary rounded text-background-dark text-sm font-bold shadow-lg px-4 py-1.5' : 'px-4 py-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm transition-colors'"
                        @click="activeTab = 'incoming'">Incoming</button>
                    <button
                        :class="activeTab === 'accepted' ? 'bg-primary rounded text-background-dark text-sm font-bold shadow-lg px-4 py-1.5' : 'px-4 py-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm transition-colors'"
                        @click="activeTab = 'accepted'">Accepted</button>
                    <button
                        :class="activeTab === 'onhold' ? 'bg-yellow-500 rounded text-background-dark text-sm font-bold shadow-lg px-4 py-1.5' : 'px-4 py-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm transition-colors'"
                        @click="activeTab = 'onhold'">On Hold</button>
                </div>
            </div>
        </div>

        <!-- Capacity Overview KPIs -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div class="glass-panel p-4 rounded-xl">
                <div class="text-xs text-gray-600 dark:text-gray-400 uppercase font-semibold tracking-wide">Today's
                    Orders</div>
                <div class="text-3xl font-bold text-gray-900 dark:text-white mt-1">{{ orders.length }}</div>
                <div class="text-xs mt-1" :class="capacityPercent > 90 ? 'text-red-400' : 'text-green-400'">
                    {{ capacityPercent }}% of daily capacity
                </div>
                <div class="w-full bg-gray-200 dark:bg-gray-700 h-1.5 mt-2 rounded-full overflow-hidden">
                    <div class="h-full rounded-full transition-all"
                        :class="capacityPercent > 90 ? 'bg-red-500' : capacityPercent > 70 ? 'bg-yellow-500' : 'bg-green-500'"
                        :style="`width: ${capacityPercent}%`"></div>
                </div>
            </div>
            <div class="glass-panel p-4 rounded-xl">
                <div class="text-xs text-gray-600 dark:text-gray-400 uppercase font-semibold tracking-wide">Pending
                    Validation</div>
                <div class="text-3xl font-bold text-yellow-400 mt-1">{{ pendingCount }}</div>
                <div class="text-xs text-gray-500 mt-1">Awaiting stock/labor check</div>
            </div>
            <div class="glass-panel p-4 rounded-xl">
                <div class="text-xs text-gray-600 dark:text-gray-400 uppercase font-semibold tracking-wide">Dock Slots
                    Free</div>
                <div class="text-3xl font-bold text-primary mt-1">{{ freeDocks }}/6</div>
                <div class="text-xs text-gray-500 mt-1">Available for dispatch</div>
            </div>
            <div class="glass-panel p-4 rounded-xl">
                <div class="text-xs text-gray-600 dark:text-gray-400 uppercase font-semibold tracking-wide">Labor
                    Available</div>
                <div class="text-3xl font-bold text-blue-400 mt-1">{{ freeLabor }}</div>
                <div class="text-xs text-gray-500 mt-1">Ready to assign</div>
            </div>
        </div>

        <!-- Orders Table -->
        <div class="glass-panel rounded-xl overflow-hidden">
            <div
                class="p-4 border-b border-gray-100 dark:border-white/5 flex gap-4 items-center bg-gray-100 dark:bg-black/20">
                <h3 class="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <span class="material-symbols-outlined text-primary">orders</span>
                    {{ activeTab === 'incoming' ? 'Incoming Orders' : activeTab === 'accepted' ? 'Accepted Orders' : 'On Hold Orders' }}
                </h3>
                <div class="flex-1"></div>
                <div class="relative w-48">
                    <span
                        class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-[18px]">search</span>
                    <input v-model="searchQuery" type="text" placeholder="Search orders..."
                        class="w-full bg-black/30 border border-gray-200 dark:border-white/10 rounded-lg py-2 pl-9 pr-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-primary/50" />
                </div>
            </div>

            <div class="overflow-auto max-h-[600px]">
                <table class="w-full text-left text-sm">
                    <thead class="bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-400 uppercase sticky top-0">
                        <tr>
                            <th class="p-4">Order ID</th>
                            <th class="p-4">Cargo Type</th>
                            <th class="p-4">Qty / Weight</th>
                            <th class="p-4">Labor Req.</th>
                            <th class="p-4">Packing Material</th>
                            <th class="p-4">Deadline</th>
                            <th class="p-4">Status</th>
                            <th class="p-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100 dark:divide-white/5">
                        <tr v-for="order in filteredOrders" :key="order.id"
                            class="hover:bg-gray-50 dark:bg-white/5 transition-colors">
                            <td class="p-4 font-mono text-primary font-bold">{{ order.id }}</td>
                            <td class="p-4 text-gray-900 dark:text-white">{{ order.cargoType }}</td>
                            <td class="p-4">
                                <div class="text-gray-900 dark:text-white">{{ order.quantity }} items</div>
                                <div class="text-xs text-gray-500">{{ order.weight }} kg</div>
                            </td>
                            <td class="p-4">
                                <span class="flex items-center gap-1"
                                    :class="order.laborAvailable ? 'text-green-400' : 'text-red-400'">
                                    <span class="material-symbols-outlined text-[16px]">{{ order.laborAvailable ?
                                        'check_circle' : 'cancel' }}</span>
                                    {{ order.laborNeeded }} workers
                                </span>
                            </td>
                            <td class="p-4">
                                <span class="flex items-center gap-1"
                                    :class="order.packingReady ? 'text-green-400' : 'text-red-400'">
                                    <span class="material-symbols-outlined text-[16px]">{{ order.packingReady ?
                                        'check_circle' : 'cancel' }}</span>
                                    {{ order.packingReady ? 'Ready' : 'Short' }}
                                </span>
                            </td>
                            <td class="p-4 text-gray-900 dark:text-white font-mono text-xs">{{ order.deadline }}</td>
                            <td class="p-4">
                                <span class="px-2 py-1 rounded text-[10px] font-bold border" :class="order.statusClass">
                                    {{ order.status }}
                                </span>
                            </td>
                            <td class="p-4">
                                <div class="flex gap-2">
                                    <button v-if="order.status === 'Pending'" @click="validateOrder(order)"
                                        class="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-3 py-1 rounded text-xs font-bold transition-colors">
                                        Validate
                                    </button>
                                    <button v-if="order.status === 'Validated'" @click="acceptOrder(order)"
                                        class="bg-green-500/20 hover:bg-green-500/30 text-green-400 px-3 py-1 rounded text-xs font-bold transition-colors">
                                        Accept
                                    </button>
                                    <button v-if="order.status !== 'Accepted' && order.status !== 'On Hold'"
                                        @click="holdOrder(order)"
                                        class="bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 px-3 py-1 rounded text-xs font-bold transition-colors">
                                        Hold
                                    </button>
                                    <button @click="selectedOrder = order; showDetailModal = true"
                                        class="bg-gray-50 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:text-white px-2 py-1 rounded text-xs transition-colors">
                                        <span class="material-symbols-outlined text-[16px]">visibility</span>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Order Detail Modal -->
        <Teleport to="body">
            <div v-if="showDetailModal && selectedOrder"
                class="fixed inset-0 w-screen h-screen z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
                @click.self="showDetailModal = false">
                <div
                    class="glass-panel rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto border border-gray-200 dark:border-white/10">
                    <div class="p-6 border-b border-gray-100 dark:border-white/5 flex justify-between items-center">
                        <h3 class="text-xl font-bold text-gray-900 dark:text-white">Order {{ selectedOrder.id }}</h3>
                        <button @click="showDetailModal = false"
                            class="text-gray-500 hover:text-gray-900 dark:text-white transition-colors">
                            <span class="material-symbols-outlined">close</span>
                        </button>
                    </div>
                    <div class="p-6 space-y-6">
                        <div class="grid grid-cols-2 gap-4">
                            <div class="bg-gray-50 dark:bg-white/5 p-4 rounded-lg">
                                <div class="text-xs text-gray-600 dark:text-gray-400 uppercase mb-1">Cargo Type</div>
                                <div class="text-gray-900 dark:text-white font-bold">{{ selectedOrder.cargoType }}</div>
                            </div>
                            <div class="bg-gray-50 dark:bg-white/5 p-4 rounded-lg">
                                <div class="text-xs text-gray-600 dark:text-gray-400 uppercase mb-1">Quantity / Weight
                                </div>
                                <div class="text-gray-900 dark:text-white font-bold">{{ selectedOrder.quantity }} items
                                    / {{
                                        selectedOrder.weight }} kg</div>
                            </div>
                            <div class="bg-gray-50 dark:bg-white/5 p-4 rounded-lg">
                                <div class="text-xs text-gray-600 dark:text-gray-400 uppercase mb-1">Delivery Deadline
                                </div>
                                <div class="text-gray-900 dark:text-white font-bold">{{ selectedOrder.deadline }}</div>
                            </div>
                            <div class="bg-gray-50 dark:bg-white/5 p-4 rounded-lg">
                                <div class="text-xs text-gray-600 dark:text-gray-400 uppercase mb-1">Special
                                    Instructions
                                </div>
                                <div class="text-gray-900 dark:text-white font-bold">{{
                                    selectedOrder.specialInstructions ||
                                    'None' }}</div>
                            </div>
                        </div>

                        <div>
                            <h4 class="text-sm font-bold text-gray-900 dark:text-white mb-3">Demand Validation Checklist
                            </h4>
                            <div class="space-y-3">
                                <div class="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors"
                                    :class="selectedOrder.inventoryCheck ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'"
                                    @click="selectedOrder.inventoryCheck = !selectedOrder.inventoryCheck">
                                    <span class="material-symbols-outlined"
                                        :class="selectedOrder.inventoryCheck ? 'text-green-400' : 'text-red-400'">{{
                                            selectedOrder.inventoryCheck ? 'check_circle' : 'cancel' }}</span>
                                    <span class="text-sm text-gray-900 dark:text-white">Inventory Availability — Stock
                                        sufficient</span>
                                </div>
                                <div class="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors"
                                    :class="selectedOrder.packingReady ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'"
                                    @click="selectedOrder.packingReady = !selectedOrder.packingReady">
                                    <span class="material-symbols-outlined"
                                        :class="selectedOrder.packingReady ? 'text-green-400' : 'text-red-400'">{{
                                            selectedOrder.packingReady ? 'check_circle' : 'cancel' }}</span>
                                    <span class="text-sm text-gray-900 dark:text-white">Packing Materials — Boxes, wrap,
                                        crates</span>
                                </div>
                                <div class="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors"
                                    :class="selectedOrder.laborAvailable ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'"
                                    @click="selectedOrder.laborAvailable = !selectedOrder.laborAvailable">
                                    <span class="material-symbols-outlined"
                                        :class="selectedOrder.laborAvailable ? 'text-green-400' : 'text-red-400'">{{
                                            selectedOrder.laborAvailable ? 'check_circle' : 'cancel' }}</span>
                                    <span class="text-sm text-gray-900 dark:text-white">Labor Availability — {{
                                        selectedOrder.laborNeeded }}
                                        workers required</span>
                                </div>
                                <div
                                    class="flex items-center gap-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                                    <span class="material-symbols-outlined text-blue-400">dock</span>
                                    <span class="text-sm text-gray-900 dark:text-white">Dock Capacity — {{ freeDocks }}
                                        slots available</span>
                                </div>
                            </div>
                        </div>

                        <div class="flex gap-3">
                            <button v-if="selectedOrder.status !== 'Accepted'"
                                @click="acceptOrder(selectedOrder); showDetailModal = false"
                                class="flex-1 bg-green-500/20 hover:bg-green-500/30 text-green-400 py-3 rounded-lg font-bold transition-colors"
                                :disabled="!selectedOrder.inventoryCheck || !selectedOrder.packingReady || !selectedOrder.laborAvailable">
                                <span
                                    class="material-symbols-outlined text-[18px] align-middle mr-1">check_circle</span>
                                Accept for Processing
                            </button>
                            <button @click="holdOrder(selectedOrder); showDetailModal = false"
                                class="flex-1 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 py-3 rounded-lg font-bold transition-colors">
                                <span
                                    class="material-symbols-outlined text-[18px] align-middle mr-1">pause_circle</span>
                                Put On Hold
                            </button>
                            <button @click="escalateOrder(selectedOrder)"
                                class="bg-red-500/20 hover:bg-red-500/30 text-red-400 py-3 px-6 rounded-lg font-bold transition-colors">
                                <span
                                    class="material-symbols-outlined text-[18px] align-middle mr-1">arrow_upward</span>
                                Escalate
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Teleport>

        <!-- Escalation Toast -->
        <div v-if="escalateToast"
            class="fixed bottom-6 right-6 bg-red-500/90 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 z-50 animate-bounce">
            <span class="material-symbols-outlined">arrow_upward</span>
            <div>
                <div class="font-bold">{{ escalateToast }} — Escalated!</div>
                <div class="text-xs opacity-80">Notification sent to Logistics Manager</div>
            </div>
        </div>

        <!-- Success Toast -->
        <div v-if="successToast"
            class="fixed bottom-6 right-6 bg-green-500/90 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 z-50 animate-bounce">
            <span class="material-symbols-outlined">check_circle</span>
            <div>
                <div class="font-bold">{{ successToast }}</div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const activeTab = ref('incoming')
const searchQuery = ref('')
const showDetailModal = ref(false)
const selectedOrder = ref(null)
const freeDocks = ref(3)
const freeLabor = ref(12)
const escalateToast = ref('')
const successToast = ref('')

const orders = ref([
    { id: 'ORD-20261', cargoType: 'House Shift (3BHK)', quantity: 45, weight: 820, laborNeeded: 4, laborAvailable: true, packingReady: true, inventoryCheck: true, deadline: '2026-02-27 10:00', status: 'Pending', statusClass: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20', specialInstructions: 'Fragile items — extra bubble wrap', tab: 'incoming' },
    { id: 'ORD-20262', cargoType: 'Parcel Delivery', quantity: 12, weight: 95, laborNeeded: 1, laborAvailable: true, packingReady: true, inventoryCheck: true, deadline: '2026-02-26 16:00', status: 'Validated', statusClass: 'bg-blue-500/10 text-blue-500 border-blue-500/20', specialInstructions: '', tab: 'incoming' },
    { id: 'ORD-20263', cargoType: 'Bulk Cargo', quantity: 200, weight: 3400, laborNeeded: 8, laborAvailable: false, packingReady: true, inventoryCheck: true, deadline: '2026-02-28 09:00', status: 'Pending', statusClass: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20', specialInstructions: 'Requires forklift', tab: 'incoming' },
    { id: 'ORD-20258', cargoType: 'House Shift (2BHK)', quantity: 30, weight: 520, laborNeeded: 3, laborAvailable: true, packingReady: true, inventoryCheck: true, deadline: '2026-02-26 14:00', status: 'Accepted', statusClass: 'bg-green-500/10 text-green-500 border-green-500/20', specialInstructions: 'Piano included', tab: 'accepted' },
    { id: 'ORD-20255', cargoType: 'Office Relocation', quantity: 80, weight: 1600, laborNeeded: 6, laborAvailable: true, packingReady: true, inventoryCheck: true, deadline: '2026-02-27 08:00', status: 'Accepted', statusClass: 'bg-green-500/10 text-green-500 border-green-500/20', specialInstructions: '', tab: 'accepted' },
    { id: 'ORD-20264', cargoType: 'Fragile Electronics', quantity: 15, weight: 180, laborNeeded: 2, laborAvailable: true, packingReady: false, inventoryCheck: true, deadline: '2026-02-27 15:00', status: 'On Hold', statusClass: 'bg-orange-500/10 text-orange-500 border-orange-500/20', specialInstructions: 'Anti-static packaging needed', tab: 'onhold' },
    { id: 'ORD-20265', cargoType: 'Warehouse Transfer', quantity: 500, weight: 8200, laborNeeded: 10, laborAvailable: false, packingReady: false, inventoryCheck: false, deadline: '2026-03-01 06:00', status: 'On Hold', statusClass: 'bg-orange-500/10 text-orange-500 border-orange-500/20', specialInstructions: 'Cross-dock needed', tab: 'onhold' },
])

const capacityPercent = computed(() => Math.round((orders.value.length / 50) * 100))
const pendingCount = computed(() => orders.value.filter(o => o.status === 'Pending').length)

const filteredOrders = computed(() => {
    return orders.value.filter(o => {
        const matchesTab = o.tab === activeTab.value
        const matchesSearch = !searchQuery.value || o.id.toLowerCase().includes(searchQuery.value.toLowerCase()) || o.cargoType.toLowerCase().includes(searchQuery.value.toLowerCase())
        return matchesTab && matchesSearch
    })
})

function showToast(msg) {
    successToast.value = msg
    setTimeout(() => { successToast.value = '' }, 2500)
}

function validateOrder(order) {
    order.status = 'Validated'
    order.statusClass = 'bg-blue-500/10 text-blue-500 border-blue-500/20'
    showToast(`${order.id} validated successfully`)
}

function acceptOrder(order) {
    order.status = 'Accepted'
    order.statusClass = 'bg-green-500/10 text-green-500 border-green-500/20'
    order.tab = 'accepted'
    showToast(`${order.id} accepted for processing`)
}

function holdOrder(order) {
    order.status = 'On Hold'
    order.statusClass = 'bg-orange-500/10 text-orange-500 border-orange-500/20'
    order.tab = 'onhold'
    showToast(`${order.id} placed on hold`)
}

function escalateOrder(order) {
    escalateToast.value = order.id
    showDetailModal.value = false
    setTimeout(() => { escalateToast.value = '' }, 3000)
}
</script>
