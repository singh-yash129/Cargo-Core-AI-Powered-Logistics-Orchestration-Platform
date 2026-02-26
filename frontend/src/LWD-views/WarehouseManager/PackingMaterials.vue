<template>
    <div class="space-y-6">
        <!-- Header -->
        <div class="flex justify-between items-center">
            <h2 class="text-2xl font-bold text-white">Packing Materials & Returnable Assets</h2>
            <div class="flex gap-2">
                <button @click="showIssueModal = true"
                    class="bg-white/5 hover:bg-white/10 text-white border border-white/10 py-2 px-4 rounded-lg transition-colors flex items-center gap-2">
                    <span class="material-symbols-outlined">output</span> Issue to Order
                </button>
                <button @click="showRestockModal = true"
                    class="bg-primary hover:bg-primary-dark text-background-dark font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors">
                    <span class="material-symbols-outlined">add</span> Request Restock
                </button>
            </div>
        </div>

        <!-- Utensil Inventory Cards -->
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div v-for="item in packingItems" :key="item.name"
                class="glass-panel p-4 rounded-xl text-center group hover:border-primary/30 transition-colors cursor-pointer"
                :class="item.stock <= item.threshold ? 'border-red-500/30 bg-red-900/5' : ''">
                <div class="text-3xl mb-2">{{ item.emoji }}</div>
                <div class="text-sm font-bold text-white">{{ item.name }}</div>
                <div class="text-2xl font-bold mt-1"
                    :class="item.stock <= item.threshold ? 'text-red-400' : 'text-primary'">{{ item.stock }}</div>
                <div class="text-[10px] text-gray-500 uppercase">{{ item.unit }}</div>
                <div class="w-full bg-gray-700 h-1 mt-2 rounded-full overflow-hidden">
                    <div class="h-full rounded-full transition-all"
                        :class="item.stock <= item.threshold ? 'bg-red-500' : 'bg-primary'"
                        :style="`width: ${Math.min((item.stock / item.max) * 100, 100)}%`"></div>
                </div>
                <div v-if="item.stock <= item.threshold" class="text-[10px] text-red-400 mt-1 font-bold animate-pulse">⚠
                    LOW STOCK</div>
                <div class="text-[10px] text-gray-600 mt-1">Reserved: {{ item.reserved }}</div>
            </div>
        </div>

        <!-- Main Content: Material Log + Returnable Assets -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Recent Issuance Log -->
            <div class="lg:col-span-2 glass-panel rounded-xl overflow-hidden">
                <div class="p-4 border-b border-white/5 flex justify-between items-center bg-black/20">
                    <h3 class="font-bold text-white flex items-center gap-2">
                        <span class="material-symbols-outlined text-primary">inventory_2</span>
                        Material Issuance Log
                    </h3>
                    <div class="bg-black/40 border border-white/10 rounded-lg p-0.5 flex">
                        <button
                            :class="logTab === 'issued' ? 'bg-primary rounded text-background-dark text-xs font-bold px-3 py-1' : 'px-3 py-1 text-gray-400 text-xs'"
                            @click="logTab = 'issued'">Issued</button>
                        <button
                            :class="logTab === 'reserved' ? 'bg-primary rounded text-background-dark text-xs font-bold px-3 py-1' : 'px-3 py-1 text-gray-400 text-xs'"
                            @click="logTab = 'reserved'">Reserved</button>
                    </div>
                </div>
                <div class="overflow-auto max-h-[400px]">
                    <table class="w-full text-left text-sm">
                        <thead class="bg-white/5 text-gray-400 uppercase sticky top-0">
                            <tr>
                                <th class="p-4">Order ID</th>
                                <th class="p-4">Material</th>
                                <th class="p-4">Qty</th>
                                <th class="p-4">Issued To</th>
                                <th class="p-4">Time</th>
                                <th class="p-4">Status</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-white/5">
                            <tr v-for="log in filteredLog" :key="log.id" class="hover:bg-white/5 transition-colors">
                                <td class="p-4 font-mono text-primary font-bold">{{ log.orderId }}</td>
                                <td class="p-4 text-white">{{ log.material }}</td>
                                <td class="p-4 text-gray-300">{{ log.qty }}</td>
                                <td class="p-4 text-gray-400">{{ log.issuedTo }}</td>
                                <td class="p-4 text-gray-500 text-xs font-mono">{{ log.time }}</td>
                                <td class="p-4">
                                    <span class="px-2 py-1 rounded text-[10px] font-bold border"
                                        :class="log.statusClass">{{ log.status }}</span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Returnable Assets Tracker -->
            <div class="glass-panel rounded-xl overflow-hidden">
                <div class="p-4 border-b border-white/5 bg-black/20">
                    <h3 class="font-bold text-white flex items-center gap-2">
                        <span class="material-symbols-outlined text-yellow-400">assignment_return</span>
                        Returnable Assets
                    </h3>
                </div>
                <div class="p-4 space-y-3 max-h-[400px] overflow-y-auto">
                    <div v-for="asset in returnableAssets" :key="asset.id"
                        class="p-3 bg-white/5 border border-white/5 rounded-lg hover:border-white/20 transition-colors">
                        <div class="flex justify-between items-start mb-2">
                            <div>
                                <div class="text-sm font-bold text-white">{{ asset.name }}</div>
                                <div class="text-xs text-gray-500">{{ asset.orderId }} • {{ asset.driver }}</div>
                            </div>
                            <span class="px-2 py-0.5 rounded text-[10px] font-bold border" :class="asset.statusClass">{{
                                asset.status }}</span>
                        </div>
                        <div class="flex justify-between text-xs text-gray-400">
                            <span>Issued: {{ asset.qty }} pcs</span>
                            <span>Returned: {{ asset.returned }} pcs</span>
                        </div>
                        <div class="w-full bg-gray-700 h-1 mt-2 rounded-full overflow-hidden">
                            <div class="bg-blue-500 h-full" :style="`width: ${(asset.returned / asset.qty) * 100}%`">
                            </div>
                        </div>
                        <div v-if="asset.missing > 0" class="text-xs text-red-400 mt-1 font-bold">
                            ⚠ {{ asset.missing }} items missing
                        </div>
                        <div v-if="asset.damaged > 0" class="text-xs text-yellow-400 mt-1">
                            🔧 {{ asset.damaged }} items damaged
                        </div>
                        <div class="flex gap-2 mt-2">
                            <button @click="verifyReturn(asset)"
                                class="flex-1 bg-green-500/20 hover:bg-green-500/30 text-green-400 py-1 rounded text-xs font-bold transition-colors"
                                :class="asset.status === 'Returned' ? 'opacity-50 cursor-not-allowed' : ''">
                                {{ asset.status === 'Returned' ? '✓ Verified' : 'Verify Return' }}
                            </button>
                            <button @click="flagAsset(asset)"
                                class="bg-red-500/20 hover:bg-red-500/30 text-red-400 py-1 px-3 rounded text-xs font-bold transition-colors"
                                :class="asset.flagged ? 'bg-red-500/40 border border-red-500/50' : ''">
                                {{ asset.flagged ? '🚩 Flagged' : 'Flag' }}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Issue to Order Modal -->
        <div v-if="showIssueModal"
            class="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            @click.self="showIssueModal = false">
            <div class="glass-panel rounded-2xl w-full max-w-lg border border-white/10">
                <div class="p-6 border-b border-white/5 flex justify-between items-center">
                    <h3 class="font-bold text-white text-lg">Issue Materials to Order</h3>
                    <button @click="showIssueModal = false" class="text-gray-500 hover:text-white"><span
                            class="material-symbols-outlined">close</span></button>
                </div>
                <div class="p-6 space-y-4">
                    <div>
                        <label class="text-xs text-gray-400 mb-1 block">Order ID</label>
                        <input type="text" v-model="issueForm.orderId" placeholder="ORD-XXXXX"
                            class="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-primary/50 font-mono" />
                    </div>
                    <div class="grid grid-cols-2 gap-3">
                        <div v-for="item in packingItems" :key="item.name">
                            <label class="text-xs text-gray-400 mb-1 block">{{ item.emoji }} {{ item.name }}</label>
                            <input type="number" min="0" :placeholder="`Avail: ${item.stock}`"
                                v-model.number="issueForm.items[item.name]"
                                class="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-white text-sm focus:outline-none focus:border-primary/50" />
                        </div>
                    </div>
                    <div>
                        <label class="text-xs text-gray-400 mb-1 block">Issue To (Driver / Laborer)</label>
                        <input type="text" v-model="issueForm.issuedTo" placeholder="Name or ID"
                            class="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-primary/50" />
                    </div>
                    <button @click="submitIssue"
                        class="w-full bg-primary hover:bg-primary-dark text-background-dark font-bold py-3 rounded-lg transition-colors"
                        :disabled="!issueForm.orderId || !issueForm.issuedTo">
                        Issue Materials
                    </button>
                </div>
            </div>
        </div>

        <!-- Restock Modal -->
        <div v-if="showRestockModal"
            class="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            @click.self="showRestockModal = false">
            <div class="glass-panel rounded-2xl w-full max-w-lg border border-white/10">
                <div class="p-6 border-b border-white/5 flex justify-between items-center">
                    <h3 class="font-bold text-white text-lg">Request Material Restock</h3>
                    <button @click="showRestockModal = false" class="text-gray-500 hover:text-white"><span
                            class="material-symbols-outlined">close</span></button>
                </div>
                <div class="p-6 space-y-4">
                    <div v-for="item in lowStockItems" :key="item.name"
                        class="flex items-center justify-between p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                        <div class="flex items-center gap-3">
                            <span class="text-2xl">{{ item.emoji }}</span>
                            <div>
                                <div class="text-sm font-bold text-white">{{ item.name }}</div>
                                <div class="text-xs text-red-400">Current: {{ item.stock }} / Threshold: {{
                                    item.threshold }}</div>
                            </div>
                        </div>
                        <input type="number" v-model.number="restockForm[item.name]"
                            class="w-20 bg-black/40 border border-white/10 rounded-lg p-2 text-white text-sm text-center focus:outline-none focus:border-primary/50" />
                    </div>
                    <div v-if="lowStockItems.length === 0" class="text-center text-gray-500 py-4">
                        All materials are above threshold ✓
                    </div>
                    <div class="flex gap-3">
                        <button @click="submitRestock"
                            class="flex-1 bg-primary hover:bg-primary-dark text-background-dark font-bold py-3 rounded-lg transition-colors">Submit
                            Restock Request</button>
                        <button @click="escalateRestock"
                            class="bg-red-500/20 hover:bg-red-500/30 text-red-400 py-3 px-5 rounded-lg font-bold transition-colors">Escalate
                            to Manager</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Toast -->
        <div v-if="toastMsg"
            class="fixed bottom-6 right-6 bg-green-500/90 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 z-50 animate-bounce">
            <span class="material-symbols-outlined">check_circle</span>
            <div class="font-bold">{{ toastMsg }}</div>
        </div>
        <div v-if="escalateMsg"
            class="fixed bottom-6 right-6 bg-red-500/90 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 z-50 animate-bounce">
            <span class="material-symbols-outlined">arrow_upward</span>
            <div>
                <div class="font-bold">Escalated to Logistics Manager!</div>
                <div class="text-xs opacity-80">{{ escalateMsg }}</div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'

const logTab = ref('issued')
const showIssueModal = ref(false)
const showRestockModal = ref(false)
const toastMsg = ref('')
const escalateMsg = ref('')

const issueForm = reactive({
    orderId: '',
    issuedTo: '',
    items: {}
})

const restockForm = reactive({})

const packingItems = ref([
    { name: 'Boxes', emoji: '📦', stock: 340, max: 500, threshold: 100, unit: 'pcs', reserved: 45 },
    { name: 'Bubble Wrap', emoji: '🫧', stock: 85, max: 200, threshold: 50, unit: 'rolls', reserved: 12 },
    { name: 'Tapes', emoji: '🔖', stock: 120, max: 300, threshold: 40, unit: 'rolls', reserved: 20 },
    { name: 'Blankets', emoji: '🛡️', stock: 25, max: 60, threshold: 15, unit: 'pcs', reserved: 8 },
    { name: 'Plastic Crates', emoji: '📥', stock: 42, max: 80, threshold: 20, unit: 'pcs', reserved: 10 },
    { name: 'Stretch Film', emoji: '🔄', stock: 18, max: 50, threshold: 15, unit: 'rolls', reserved: 5 },
])

const lowStockItems = computed(() => {
    const items = packingItems.value.filter(i => i.stock <= i.threshold)
    items.forEach(i => { if (!restockForm[i.name]) restockForm[i.name] = i.threshold * 2 })
    return items
})

const issuanceLogs = ref([
    { id: 1, orderId: 'ORD-20258', material: 'Boxes (Large)', qty: 12, issuedTo: 'Driver Ravi K.', time: '11:45 AM', status: 'Issued', statusClass: 'bg-green-500/10 text-green-500 border-green-500/20', type: 'issued' },
    { id: 2, orderId: 'ORD-20258', material: 'Bubble Wrap', qty: 3, issuedTo: 'Driver Ravi K.', time: '11:45 AM', status: 'Issued', statusClass: 'bg-green-500/10 text-green-500 border-green-500/20', type: 'issued' },
    { id: 3, orderId: 'ORD-20261', material: 'Blankets', qty: 8, issuedTo: 'Laborer Suresh', time: '10:30 AM', status: 'Issued', statusClass: 'bg-green-500/10 text-green-500 border-green-500/20', type: 'issued' },
    { id: 4, orderId: 'ORD-20262', material: 'Boxes (Small)', qty: 15, issuedTo: '--', time: '09:00 AM', status: 'Reserved', statusClass: 'bg-blue-500/10 text-blue-500 border-blue-500/20', type: 'reserved' },
    { id: 5, orderId: 'ORD-20263', material: 'Plastic Crates', qty: 20, issuedTo: '--', time: '08:30 AM', status: 'Reserved', statusClass: 'bg-blue-500/10 text-blue-500 border-blue-500/20', type: 'reserved' },
])

const filteredLog = computed(() => issuanceLogs.value.filter(l => l.type === logTab.value))

const returnableAssets = ref([
    { id: 1, name: 'Padded Blankets', orderId: 'ORD-20251', driver: 'Driver Amit S.', qty: 10, returned: 8, missing: 2, damaged: 0, status: 'Partial', statusClass: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20', flagged: false },
    { id: 2, name: 'Plastic Crates', orderId: 'ORD-20249', driver: 'Driver Ravi K.', qty: 15, returned: 15, missing: 0, damaged: 1, status: 'Returned', statusClass: 'bg-green-500/10 text-green-500 border-green-500/20', flagged: false },
    { id: 3, name: 'Furniture Dolly', orderId: 'ORD-20253', driver: 'Driver Vikram P.', qty: 2, returned: 0, missing: 2, damaged: 0, status: 'Outstanding', statusClass: 'bg-red-500/10 text-red-400 border-red-500/20', flagged: false },
])

function showSuccess(msg) {
    toastMsg.value = msg
    setTimeout(() => { toastMsg.value = '' }, 2500)
}

function verifyReturn(asset) {
    if (asset.status === 'Returned') return
    asset.returned = asset.qty
    asset.missing = 0
    asset.status = 'Returned'
    asset.statusClass = 'bg-green-500/10 text-green-500 border-green-500/20'
    showSuccess(`${asset.name} return verified for ${asset.orderId}`)
}

function flagAsset(asset) {
    asset.flagged = !asset.flagged
    if (asset.flagged) {
        showSuccess(`${asset.name} flagged — notified Logistics Manager`)
    }
}

function submitIssue() {
    const now = new Date()
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })

    for (const item of packingItems.value) {
        const qty = issueForm.items[item.name]
        if (qty && qty > 0) {
            issuanceLogs.value.unshift({
                id: Date.now() + Math.random(),
                orderId: issueForm.orderId,
                material: item.name,
                qty: qty,
                issuedTo: issueForm.issuedTo,
                time: timeStr,
                status: 'Issued',
                statusClass: 'bg-green-500/10 text-green-500 border-green-500/20',
                type: 'issued'
            })
            item.stock -= qty
        }
    }

    showIssueModal.value = false
    issueForm.orderId = ''
    issueForm.issuedTo = ''
    issueForm.items = {}
    showSuccess('Materials issued successfully')
}

function submitRestock() {
    showRestockModal.value = false
    showSuccess('Restock request submitted')
}

function escalateRestock() {
    showRestockModal.value = false
    escalateMsg.value = 'Low stock items escalated for urgent procurement'
    setTimeout(() => { escalateMsg.value = '' }, 3000)
}
</script>
