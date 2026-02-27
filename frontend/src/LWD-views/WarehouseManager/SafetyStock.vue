<template>
    <div class="space-y-6">
        <!-- Header -->
        <div class="flex justify-between items-center">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Safety Stock Alerts</h2>
            <div class="flex gap-2">
                <button @click="showThresholdModal = true"
                    class="bg-gray-50 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 py-2 px-4 rounded-lg transition-colors flex items-center gap-2">
                    <span class="material-symbols-outlined">tune</span> Set Thresholds
                </button>
                <button @click="submitAllRestocks"
                    class="bg-primary hover:bg-primary-dark text-background-dark font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors">
                    <span class="material-symbols-outlined">shopping_cart</span> Restock All Critical
                </button>
            </div>
        </div>

        <!-- Overview Stats -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div class="glass-panel p-4 rounded-xl border-l-4 border-red-500">
                <div class="text-xs text-gray-600 dark:text-gray-400 uppercase font-semibold">Critical Alerts</div>
                <div class="text-3xl font-bold text-red-400 mt-1">{{ criticalCount }}</div>
                <div class="text-xs text-red-400/60 mt-1">Needs immediate restock</div>
            </div>
            <div class="glass-panel p-4 rounded-xl border-l-4 border-yellow-500">
                <div class="text-xs text-gray-600 dark:text-gray-400 uppercase font-semibold">Warnings</div>
                <div class="text-3xl font-bold text-yellow-400 mt-1">{{ warningCount }}</div>
                <div class="text-xs text-yellow-400/60 mt-1">Approaching threshold</div>
            </div>
            <div class="glass-panel p-4 rounded-xl border-l-4 border-green-500">
                <div class="text-xs text-gray-600 dark:text-gray-400 uppercase font-semibold">Normal Stock</div>
                <div class="text-3xl font-bold text-green-400 mt-1">{{ normalCount }}</div>
                <div class="text-xs text-green-400/60 mt-1">Above safety level</div>
            </div>
            <div class="glass-panel p-4 rounded-xl border-l-4 border-blue-500">
                <div class="text-xs text-gray-600 dark:text-gray-400 uppercase font-semibold">Pending Restocks</div>
                <div class="text-3xl font-bold text-blue-400 mt-1">{{ pendingRestockCount }}</div>
                <div class="text-xs text-blue-400/60 mt-1">Awaiting delivery</div>
            </div>
        </div>

        <!-- Alert Cards Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div v-for="item in stockItems" :key="item.name"
                class="glass-panel p-5 rounded-xl relative overflow-hidden transition-all hover:scale-[1.01]"
                :class="item.level === 'critical' ? 'border border-red-500/30' : item.level === 'warning' ? 'border border-yellow-500/30' : 'border border-gray-100 dark:border-white/5'">
                <div v-if="item.level === 'critical'"
                    class="absolute top-0 right-0 w-24 h-24 bg-red-500/10 rounded-full -mr-8 -mt-8 blur-xl"></div>
                <div v-if="item.level === 'warning'"
                    class="absolute top-0 right-0 w-24 h-24 bg-yellow-500/10 rounded-full -mr-8 -mt-8 blur-xl"></div>

                <div class="flex items-start justify-between mb-3 relative">
                    <div class="flex items-center gap-3">
                        <div class="text-3xl">{{ item.emoji }}</div>
                        <div>
                            <div class="font-bold text-gray-900 dark:text-white">{{ item.name }}</div>
                            <div class="text-xs text-gray-500">{{ item.category }}</div>
                        </div>
                    </div>
                    <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase"
                        :class="getLevelClass(item.level)">{{ item.level }}</span>
                </div>

                <div class="space-y-2 mb-4">
                    <div class="flex justify-between text-sm">
                        <span class="text-gray-600 dark:text-gray-400">Current Stock</span>
                        <span class="font-bold"
                            :class="item.level === 'critical' ? 'text-red-400' : item.level === 'warning' ? 'text-yellow-400' : 'text-gray-900 dark:text-white'">{{
                                item.current }} {{ item.unit }}</span>
                    </div>
                    <div class="flex justify-between text-sm">
                        <span class="text-gray-600 dark:text-gray-400">Safety Threshold</span>
                        <span class="text-gray-300">{{ item.threshold }} {{ item.unit }}</span>
                    </div>
                    <div class="flex justify-between text-sm">
                        <span class="text-gray-600 dark:text-gray-400">Avg. Daily Usage</span>
                        <span class="text-gray-300">{{ item.dailyUsage }} {{ item.unit }}/day</span>
                    </div>
                    <div class="flex justify-between text-sm">
                        <span class="text-gray-600 dark:text-gray-400">Days Until Empty</span>
                        <span class="font-bold"
                            :class="item.daysLeft <= 2 ? 'text-red-400' : item.daysLeft <= 5 ? 'text-yellow-400' : 'text-green-400'">{{
                                item.daysLeft }} days</span>
                    </div>
                </div>

                <div class="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden mb-4">
                    <div class="h-full rounded-full transition-all"
                        :class="item.level === 'critical' ? 'bg-red-500' : item.level === 'warning' ? 'bg-yellow-500' : 'bg-green-500'"
                        :style="`width: ${Math.min((item.current / (item.threshold * 3)) * 100, 100)}%`"></div>
                </div>

                <div class="flex gap-2">
                    <button v-if="item.restockStatus === 'none'" @click="requestRestock(item)"
                        class="flex-1 py-2 rounded text-xs font-bold transition-colors"
                        :class="item.level === 'critical' ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400' : 'bg-primary/20 hover:bg-primary/30 text-primary'">
                        Request Restock
                    </button>
                    <div v-else-if="item.restockStatus === 'requested'"
                        class="flex-1 py-2 rounded text-xs font-bold text-center bg-blue-500/20 text-blue-400 border border-blue-500/20">
                        ✓ Restock Requested
                    </div>
                    <div v-else
                        class="flex-1 py-2 rounded text-xs font-bold text-center bg-green-500/20 text-green-400 border border-green-500/20">
                        📦 Arriving in {{ item.eta }}
                    </div>
                    <button @click="escalateItem(item)"
                        class="bg-gray-50 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:text-white py-2 px-3 rounded text-xs transition-colors"
                        title="Escalate to Logistics Manager">
                        <span class="material-symbols-outlined text-[16px]">arrow_upward</span>
                    </button>
                </div>
            </div>
        </div>

        <!-- Restock History -->
        <div class="glass-panel rounded-xl overflow-hidden">
            <div class="p-4 border-b border-gray-100 dark:border-white/5 bg-gray-100 dark:bg-black/20">
                <h3 class="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <span class="material-symbols-outlined text-primary">history</span>
                    Restock Request History
                </h3>
            </div>
            <table class="w-full text-left text-sm">
                <thead class="bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-400 uppercase">
                    <tr>
                        <th class="p-4">Request ID</th>
                        <th class="p-4">Item</th>
                        <th class="p-4">Qty Requested</th>
                        <th class="p-4">Requested On</th>
                        <th class="p-4">ETA</th>
                        <th class="p-4">Status</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-100 dark:divide-white/5">
                    <tr v-for="req in restockHistory" :key="req.id"
                        class="hover:bg-gray-50 dark:bg-white/5 transition-colors">
                        <td class="p-4 font-mono text-gray-300">{{ req.id }}</td>
                        <td class="p-4 text-gray-900 dark:text-white">{{ req.item }}</td>
                        <td class="p-4 text-gray-300">{{ req.qty }}</td>
                        <td class="p-4 text-gray-500 text-xs font-mono">{{ req.requestedOn }}</td>
                        <td class="p-4 text-gray-300">{{ req.eta }}</td>
                        <td class="p-4">
                            <span class="px-2 py-1 rounded text-[10px] font-bold border" :class="req.statusClass">{{
                                req.status }}</span>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Threshold Config Modal -->
        <Teleport to="body">
            <div v-if="showThresholdModal"
                class="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                @click.self="showThresholdModal = false">
                <div class="glass-panel rounded-2xl w-full max-w-lg border border-gray-200 dark:border-white/10">
                    <div class="p-6 border-b border-gray-100 dark:border-white/5 flex justify-between items-center">
                        <h3 class="font-bold text-gray-900 dark:text-white text-lg">Configure Safety Thresholds</h3>
                        <button @click="showThresholdModal = false"
                            class="text-gray-500 hover:text-gray-900 dark:text-white"><span
                                class="material-symbols-outlined">close</span></button>
                    </div>
                    <div class="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                        <div v-for="item in stockItems" :key="item.name"
                            class="flex items-center justify-between p-3 bg-gray-50 dark:bg-white/5 rounded-lg border border-gray-100 dark:border-white/5">
                            <div class="flex items-center gap-3">
                                <span class="text-xl">{{ item.emoji }}</span>
                                <div>
                                    <div class="text-sm font-bold text-gray-900 dark:text-white">{{ item.name }}</div>
                                    <div class="text-xs text-gray-500">Current: {{ item.current }} {{ item.unit }}</div>
                                </div>
                            </div>
                            <div class="flex items-center gap-2">
                                <label class="text-xs text-gray-600 dark:text-gray-400">Threshold:</label>
                                <input type="number" v-model.number="thresholdEdits[item.name]"
                                    class="w-20 bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-lg p-2 text-gray-900 dark:text-white text-sm text-center focus:outline-none focus:border-primary/50" />
                            </div>
                        </div>
                    </div>
                    <div class="p-6 border-t border-gray-100 dark:border-white/5">
                        <button @click="saveThresholds"
                            class="w-full bg-primary hover:bg-primary-dark text-background-dark font-bold py-3 rounded-lg transition-colors">Save
                            Thresholds</button>
                    </div>
                </div>
            </div>
        </Teleport>

        <!-- Toasts -->
        <div v-if="toastMsg"
            class="fixed bottom-6 right-6 bg-green-500/90 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 z-50 animate-bounce">
            <span class="material-symbols-outlined">check_circle</span>
            <div class="font-bold">{{ toastMsg }}</div>
        </div>
        <div v-if="escalateToast"
            class="fixed bottom-6 right-6 bg-red-500/90 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 z-50 animate-bounce">
            <span class="material-symbols-outlined">arrow_upward</span>
            <div>
                <div class="font-bold">{{ escalateToast }} — Escalated!</div>
                <div class="text-xs opacity-80">Sent to Logistics Manager</div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'

const showThresholdModal = ref(false)
const toastMsg = ref('')
const escalateToast = ref('')

const stockItems = ref([
    { name: 'Cardboard Boxes (Large)', emoji: '📦', category: 'Packing Materials', current: 18, threshold: 50, dailyUsage: 12, daysLeft: 1, unit: 'pcs', level: 'critical', restockStatus: 'none', eta: '' },
    { name: 'Bubble Wrap', emoji: '🫧', category: 'Packing Materials', current: 35, threshold: 50, dailyUsage: 8, daysLeft: 4, unit: 'rolls', level: 'warning', restockStatus: 'requested', eta: '' },
    { name: 'Plastic Crates', emoji: '📥', category: 'Returnable Assets', current: 8, threshold: 20, dailyUsage: 5, daysLeft: 1, unit: 'pcs', level: 'critical', restockStatus: 'none', eta: '' },
    { name: 'Padded Blankets', emoji: '🛡️', category: 'Returnable Assets', current: 12, threshold: 15, dailyUsage: 4, daysLeft: 3, unit: 'pcs', level: 'warning', restockStatus: 'arriving', eta: '2 days' },
    { name: 'Packing Tape', emoji: '🔖', category: 'Consumables', current: 85, threshold: 40, dailyUsage: 10, daysLeft: 8, unit: 'rolls', level: 'normal', restockStatus: 'none', eta: '' },
    { name: 'Stretch Film', emoji: '🔄', category: 'Consumables', current: 60, threshold: 30, dailyUsage: 6, daysLeft: 10, unit: 'rolls', level: 'normal', restockStatus: 'none', eta: '' },
    { name: 'Shipping Labels', emoji: '🏷️', category: 'Consumables', current: 200, threshold: 100, dailyUsage: 45, daysLeft: 4, unit: 'sheets', level: 'warning', restockStatus: 'none', eta: '' },
    { name: 'Furniture Dollies', emoji: '🛒', category: 'Returnable Assets', current: 10, threshold: 5, dailyUsage: 2, daysLeft: 5, unit: 'pcs', level: 'normal', restockStatus: 'none', eta: '' },
    { name: 'Corner Protectors', emoji: '📐', category: 'Packing Materials', current: 5, threshold: 30, dailyUsage: 15, daysLeft: 0, unit: 'sets', level: 'critical', restockStatus: 'none', eta: '' },
])

const thresholdEdits = reactive({})
stockItems.value.forEach(item => { thresholdEdits[item.name] = item.threshold })

const criticalCount = computed(() => stockItems.value.filter(i => i.level === 'critical').length)
const warningCount = computed(() => stockItems.value.filter(i => i.level === 'warning').length)
const normalCount = computed(() => stockItems.value.filter(i => i.level === 'normal').length)
const pendingRestockCount = computed(() => stockItems.value.filter(i => i.restockStatus === 'requested' || i.restockStatus === 'arriving').length)

const restockHistory = ref([
    { id: 'RST-0041', item: 'Cardboard Boxes (Medium)', qty: 200, requestedOn: '2026-02-25 09:12', eta: '2026-02-27', status: 'In Transit', statusClass: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
    { id: 'RST-0040', item: 'Bubble Wrap', qty: 50, requestedOn: '2026-02-24 14:30', eta: '2026-02-26', status: 'Arriving Today', statusClass: 'bg-green-500/10 text-green-500 border-green-500/20' },
    { id: 'RST-0039', item: 'Plastic Crates', qty: 30, requestedOn: '2026-02-23 10:00', eta: '2026-02-25', status: 'Delivered', statusClass: 'bg-gray-500/10 text-gray-500 border-gray-500/20' },
])

function getLevelClass(level) {
    if (level === 'critical') return 'bg-red-500/20 text-red-400 border border-red-500/30'
    if (level === 'warning') return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
    return 'bg-green-500/20 text-green-400 border border-green-500/30'
}

function showSuccess(msg) {
    toastMsg.value = msg
    setTimeout(() => { toastMsg.value = '' }, 2500)
}

function requestRestock(item) {
    item.restockStatus = 'requested'
    restockHistory.value.unshift({
        id: `RST-${String(Date.now()).slice(-4)}`,
        item: item.name,
        qty: item.threshold * 2,
        requestedOn: new Date().toLocaleString('en-CA', { hour12: false }).replace(',', ''),
        eta: 'TBD',
        status: 'Pending',
        statusClass: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
    })
    showSuccess(`Restock requested for ${item.name}`)
}

function submitAllRestocks() {
    let count = 0
    stockItems.value.forEach(item => {
        if (item.level === 'critical' && item.restockStatus === 'none') {
            requestRestock(item)
            count++
        }
    })
    if (count === 0) showSuccess('All critical items already have restock requests')
}

function escalateItem(item) {
    escalateToast.value = item.name
    setTimeout(() => { escalateToast.value = '' }, 3000)
}

function saveThresholds() {
    stockItems.value.forEach(item => {
        if (thresholdEdits[item.name] !== undefined) {
            item.threshold = thresholdEdits[item.name]
            item.daysLeft = item.dailyUsage > 0 ? Math.floor(item.current / item.dailyUsage) : 999
            if (item.current <= item.threshold * 0.5) item.level = 'critical'
            else if (item.current <= item.threshold) item.level = 'warning'
            else item.level = 'normal'
        }
    })
    showThresholdModal.value = false
    showSuccess('Thresholds updated — stock levels recalculated')
}
</script>
