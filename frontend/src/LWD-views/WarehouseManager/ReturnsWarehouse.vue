<template>
    <div class="space-y-6">
        <div class="flex justify-between items-center">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Returns Processing (Warehouse)</h2>
            <div class="bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-lg p-1 flex">
                <button
                    :class="activeTab === 'processing' ? 'px-4 py-1.5 bg-primary rounded text-background-dark text-sm font-bold shadow-lg' : 'px-4 py-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm transition-colors'"
                    @click="activeTab = 'processing'">Processing</button>
                <button
                    :class="activeTab === 'completed' ? 'px-4 py-1.5 bg-primary rounded text-background-dark text-sm font-bold shadow-lg' : 'px-4 py-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm transition-colors'"
                    @click="activeTab = 'completed'">Completed</button>
            </div>
        </div>

        <!-- Stats Row -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="glass-panel p-4 rounded-xl text-center">
                <div class="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{{ processingItems.length }}</div>
                <div class="text-xs text-gray-600 dark:text-gray-400">Awaiting Inspection</div>
            </div>
            <div class="glass-panel p-4 rounded-xl text-center">
                <div class="text-2xl font-bold text-green-600 dark:text-green-400">{{completedItems.filter(i => i.disposition ===
                    'restock').length}}</div>
                <div class="text-xs text-gray-600 dark:text-gray-400">Restocked Today</div>
            </div>
            <div class="glass-panel p-4 rounded-xl text-center">
                <div class="text-2xl font-bold text-red-600 dark:text-red-400">{{completedItems.filter(i => i.disposition ===
                    'claims').length}}</div>
                <div class="text-xs text-gray-600 dark:text-gray-400">Sent to Claims</div>
            </div>
            <div class="glass-panel p-4 rounded-xl text-center">
                <div class="text-2xl font-bold text-gray-600 dark:text-gray-400">{{completedItems.filter(i =>
                    i.disposition === 'discard'
                    || i.disposition === 'recycle').length}}</div>
                <div class="text-xs text-gray-600 dark:text-gray-400">Discarded / Recycled</div>
            </div>
        </div>

        <!-- ===== PROCESSING TAB ===== -->
        <div v-if="activeTab === 'processing'" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Grading Station -->
            <div class="lg:col-span-2 glass-panel p-6 rounded-xl">
                <div class="flex justify-between items-center mb-6">
                    <h3 class="font-bold text-gray-900 dark:text-white">Item Grading Station 1</h3>
                    <span
                        class="px-2 py-1 bg-green-500/20 text-green-600 dark:text-green-400 text-xs rounded border border-green-500/30 animate-pulse">Active</span>
                </div>

                <div class="flex gap-6">
                    <!-- Damage Photo Capture Area -->
                    <div class="w-1/3 space-y-3">
                        <div @click="openScanner('camera')"
                            class="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center border border-gray-100 dark:border-white/5 relative overflow-hidden group cursor-pointer hover:border-primary/50 transition-colors">
                            <div v-if="!capturedPhoto" class="flex flex-col items-center gap-2">
                                <span
                                    class="material-symbols-outlined text-5xl text-gray-600 group-hover:scale-110 transition-transform">photo_camera</span>
                                <div class="text-xs text-gray-500">Click to capture<br>damage photo</div>
                            </div>
                            <div v-else
                                class="w-full h-full bg-gradient-to-br from-red-900/30 to-transparent flex items-center justify-center">
                                <span class="material-symbols-outlined text-4xl text-green-600 dark:text-green-400">check_circle</span>
                            </div>
                        </div>
                        <button @click="openScanner('camera')"
                            class="w-full py-2 text-xs font-bold rounded transition-colors"
                            :class="capturedPhoto ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400' : 'bg-primary/20 hover:bg-primary/30 text-primary'">
                            {{ capturedPhoto ? 'Retake Photo' : 'Capture Damage Photo' }}
                        </button>
                    </div>

                    <div class="flex-1 space-y-4">
                        <div class="relative">
                            <label class="text-xs text-gray-600 dark:text-gray-400 mb-1 block">RMA ID / Tracking
                                #</label>
                            <input type="text" v-model="rmaId" placeholder="Scan barcode..."
                                class="w-full bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-lg p-3 pr-10 text-gray-900 dark:text-white focus:outline-none focus:border-primary/50 font-mono">
                            <button @click="openScanner('scan')"
                                class="absolute right-2 top-8 text-gray-500 dark:text-gray-400 hover:text-primary">
                                <span class="material-symbols-outlined">qr_code_scanner</span>
                            </button>
                        </div>

                        <div>
                            <label class="text-xs text-gray-600 dark:text-gray-400 mb-1 block">Item Condition</label>
                            <select v-model="itemCondition"
                                class="w-full bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-lg p-3 text-gray-900 dark:text-white focus:outline-none focus:border-primary/50">
                                <option value="">Select condition...</option>
                                <option value="Like New">Like New — No visible damage</option>
                                <option value="Minor Wear">Minor Wear — Cosmetic only</option>
                                <option value="Damaged">Damaged — Functional issue</option>
                                <option value="Broken">Broken — Non-functional</option>
                            </select>
                        </div>

                        <div>
                            <label class="text-xs text-gray-600 dark:text-gray-400 mb-1 block">Condition Notes</label>
                            <textarea v-model="conditionNotes" placeholder="Describe the condition in detail..."
                                class="w-full bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-lg p-3 text-gray-900 dark:text-white focus:outline-none focus:border-primary/50 text-sm h-16 resize-none"></textarea>
                        </div>

                        <!-- Disposition Workflow -->
                        <div>
                            <label class="text-xs text-gray-600 dark:text-gray-400 mb-2 block">Disposition
                                Decision</label>
                            <div class="grid grid-cols-2 gap-3">
                                <button @click="disposition = 'restock'"
                                    class="p-3 rounded-lg font-bold transition-all flex flex-col items-center gap-1 text-sm"
                                    :class="disposition === 'restock' ? 'bg-green-500/30 border-2 border-green-500 text-green-600 dark:text-green-400' : 'bg-green-500/10 border border-green-500/20 hover:bg-green-500/20 text-green-600 dark:text-green-400'">
                                    <span class="material-symbols-outlined">check_circle</span> Restock
                                </button>
                                <button @click="disposition = 'claims'"
                                    class="p-3 rounded-lg font-bold transition-all flex flex-col items-center gap-1 text-sm"
                                    :class="disposition === 'claims' ? 'bg-blue-500/30 border-2 border-blue-500 text-blue-600 dark:text-blue-400' : 'bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400'">
                                    <span class="material-symbols-outlined">gavel</span> Send to Claims
                                </button>
                                <button @click="disposition = 'discard'"
                                    class="p-3 rounded-lg font-bold transition-all flex flex-col items-center gap-1 text-sm"
                                    :class="disposition === 'discard' ? 'bg-red-500/30 border-2 border-red-500 text-red-600 dark:text-red-400' : 'bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-600 dark:text-red-400'">
                                    <span class="material-symbols-outlined">delete</span> Discard
                                </button>
                                <button @click="disposition = 'recycle'"
                                    class="p-3 rounded-lg font-bold transition-all flex flex-col items-center gap-1 text-sm"
                                    :class="disposition === 'recycle' ? 'bg-purple-500/30 border-2 border-purple-500 text-purple-600 dark:text-purple-400' : 'bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400'">
                                    <span class="material-symbols-outlined">recycling</span> Recycle
                                </button>
                            </div>
                        </div>

                        <div v-if="disposition === 'claims' || disposition === 'discard'"
                            class="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-xs text-yellow-600 dark:text-yellow-400 flex items-center gap-2">
                            <span class="material-symbols-outlined text-[16px]">info</span>
                            Requires Logistics Manager approval
                        </div>

                        <button @click="submitReturn"
                            class="w-full py-3 bg-primary hover:bg-primary-dark text-background-dark font-bold rounded-lg transition-colors"
                            :disabled="!rmaId || !itemCondition || !disposition">
                            Submit Return Decision
                        </button>
                    </div>
                </div>
            </div>

            <!-- Processing Queue -->
            <div class="glass-panel rounded-xl overflow-hidden p-6">
                <h3 class="font-bold text-gray-900 dark:text-white mb-4">Items Awaiting Grading</h3>
                <div class="space-y-3 max-h-[500px] overflow-y-auto">
                    <div v-for="item in processingItems" :key="item.id"
                        class="p-3 bg-gray-50 dark:bg-white/5 rounded-lg border border-gray-100 dark:border-white/5 hover:border-yellow-500/30 transition-colors cursor-pointer"
                        @click="rmaId = item.rma">
                        <div class="flex justify-between items-start">
                            <div>
                                <div class="text-gray-900 dark:text-white text-sm font-bold">{{ item.name }}</div>
                                <div class="text-xs text-gray-500 font-mono">{{ item.rma }}</div>
                            </div>
                            <span
                                class="px-1.5 py-0.5 rounded text-[9px] font-bold bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20">PENDING</span>
                        </div>
                        <div class="text-[10px] text-gray-500 mt-1">{{ item.reason }} • Received {{ item.time }}</div>
                    </div>
                    <div v-if="processingItems.length === 0" class="text-center text-gray-500 py-8">
                        <span class="material-symbols-outlined text-3xl opacity-50">check_circle</span>
                        <div class="text-sm mt-2">All items graded!</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- ===== COMPLETED TAB ===== -->
        <div v-if="activeTab === 'completed'">
            <div class="glass-panel rounded-xl overflow-hidden">
                <div
                    class="p-4 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-gray-100 dark:bg-black/20">
                    <h3 class="font-bold text-gray-900 dark:text-white">Completed Returns Log</h3>
                    <div class="flex gap-2">
                        <button v-for="f in ['All', 'restock', 'claims', 'discard', 'recycle']" :key="f"
                            @click="completedFilter = f === 'All' ? '' : f"
                            class="px-3 py-1 rounded text-xs font-bold transition-colors"
                            :class="(f === 'All' && !completedFilter) || completedFilter === f ? 'bg-primary/20 text-primary' : 'bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'">
                            {{ f === 'All' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1) }}
                        </button>
                    </div>
                </div>
                <table class="w-full text-left text-sm">
                    <thead class="bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-400 uppercase">
                        <tr>
                            <th class="p-4">Item</th>
                            <th class="p-4">RMA</th>
                            <th class="p-4">Condition</th>
                            <th class="p-4">Disposition</th>
                            <th class="p-4">Photo</th>
                            <th class="p-4">Time</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100 dark:divide-white/5">
                        <tr v-for="item in filteredCompleted" :key="item.id"
                            class="hover:bg-gray-50 dark:bg-white/5 transition-colors">
                            <td class="p-4 text-gray-900 dark:text-white font-bold">{{ item.name }}</td>
                            <td class="p-4 font-mono text-gray-600 dark:text-gray-400 text-xs">{{ item.rma || '--' }}
                            </td>
                            <td class="p-4">
                                <span class="px-2 py-0.5 rounded text-[10px] font-bold"
                                    :class="getConditionClass(item.condition)">{{ item.condition }}</span>
                            </td>
                            <td class="p-4">
                                <div class="flex items-center gap-2">
                                    <div class="w-6 h-6 rounded flex items-center justify-center"
                                        :class="getDispositionBg(item.disposition)">
                                        <span class="material-symbols-outlined text-[14px]"
                                            :class="getDispositionColor(item.disposition)">{{
                                                getDispositionIcon(item.disposition) }}</span>
                                    </div>
                                    <span class="text-xs" :class="getDispositionColor(item.disposition)">{{
                                        item.dispositionLabel }}</span>
                                </div>
                            </td>
                            <td class="p-4">
                                <span v-if="item.hasPhoto" class="text-blue-400 text-xs">📷 Attached</span>
                                <span v-else class="text-gray-600 text-xs">—</span>
                            </td>
                            <td class="p-4 text-gray-500 font-mono text-xs">{{ item.time }}</td>
                        </tr>
                        <tr v-if="filteredCompleted.length === 0">
                            <td colspan="6" class="p-8 text-center text-gray-500">No completed returns found.</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Toast -->
        <div v-if="toastMsg"
            class="fixed bottom-6 right-6 bg-green-500/90 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 z-50 animate-bounce">
            <span class="material-symbols-outlined">check_circle</span>
            <div class="font-bold">{{ toastMsg }}</div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, inject, watch } from 'vue'

const openScanner = inject('openScanner')
const lastGlobalScan = inject('lastGlobalScan')

const activeTab = ref('processing')
const rmaId = ref('')
const itemCondition = ref('')
const conditionNotes = ref('')
const disposition = ref('')
const capturedPhoto = ref(false)
const toastMsg = ref('')
const completedFilter = ref('')

// Listen for global scans when on this page
watch(lastGlobalScan, (newVal) => {
    if (newVal) {
        if (newVal === 'captured_image_data_mock') {
            // It was a camera capture
            capturedPhoto.value = true
        } else {
            // It was a barcode scan, auto-fill RMA
            rmaId.value = newVal
            // Optionally auto-lookup the RMA if we had an API
            const found = processingItems.value.find(p => p.rma === newVal)
            if (found) {
                toastMsg.value = `Loaded RMA ${newVal} details.`
                setTimeout(() => { toastMsg.value = '' }, 2500)
            }
        }
        lastGlobalScan.value = null
    }
})

const processingItems = ref([
    { id: 10, name: 'Bluetooth Speaker', rma: 'RMA-3321', reason: 'Not as described', time: '12:10' },
    { id: 11, name: 'Wireless Mouse', rma: 'RMA-3322', reason: 'Defective', time: '11:55' },
    { id: 12, name: 'Phone Charger', rma: 'RMA-3323', reason: 'Wrong item sent', time: '11:40' },
    { id: 13, name: 'Desk Lamp', rma: 'RMA-3324', reason: 'Damaged in transit', time: '11:25' },
    { id: 14, name: 'Keyboard Cover', rma: 'RMA-3325', reason: 'Changed mind', time: '11:10' },
])

const completedItems = ref([
    { id: 1, name: 'iPhone 13 Case', rma: 'RMA-3301', condition: 'Like New', disposition: 'restock', dispositionLabel: 'Restocked to A-12', hasPhoto: false, time: '11:42' },
    { id: 2, name: 'Blender (Broken)', rma: 'RMA-3302', condition: 'Broken', disposition: 'discard', dispositionLabel: 'Disposal Bin', hasPhoto: true, time: '11:28' },
    { id: 3, name: 'Kitchen Scale', rma: 'RMA-3303', condition: 'Minor Wear', disposition: 'restock', dispositionLabel: 'Restocked to B-04', hasPhoto: false, time: '11:15' },
    { id: 4, name: 'Monitor Stand', rma: 'RMA-3304', condition: 'Damaged', disposition: 'claims', dispositionLabel: 'Sent to Claims', hasPhoto: true, time: '10:52' },
    { id: 5, name: 'USB Hub', rma: 'RMA-3305', condition: 'Like New', disposition: 'restock', dispositionLabel: 'Restocked to A-14', hasPhoto: false, time: '10:30' },
    { id: 6, name: 'Headphones', rma: 'RMA-3306', condition: 'Damaged', disposition: 'recycle', dispositionLabel: 'Recycled', hasPhoto: true, time: '10:15' },
    { id: 7, name: 'Screen Protector', rma: 'RMA-3307', condition: 'Like New', disposition: 'restock', dispositionLabel: 'Restocked to A-03', hasPhoto: false, time: '09:50' },
])

const filteredCompleted = computed(() => {
    if (!completedFilter.value) return completedItems.value
    return completedItems.value.filter(i => i.disposition === completedFilter.value)
})

function getConditionClass(c) {
    if (c === 'Like New') return 'bg-green-500/20 text-green-600 dark:text-green-400'
    if (c === 'Minor Wear') return 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400'
    if (c === 'Damaged') return 'bg-orange-500/20 text-orange-600 dark:text-orange-400'
    return 'bg-red-500/20 text-red-600 dark:text-red-400'
}

function getDispositionBg(d) {
    if (d === 'restock') return 'bg-green-500/20'
    if (d === 'claims') return 'bg-blue-500/20'
    if (d === 'discard') return 'bg-red-500/20'
    return 'bg-purple-500/20'
}

function getDispositionColor(d) {
    if (d === 'restock') return 'text-green-500'
    if (d === 'claims') return 'text-blue-500'
    if (d === 'discard') return 'text-red-500'
    return 'text-purple-500'
}

function getDispositionIcon(d) {
    if (d === 'restock') return 'check'
    if (d === 'claims') return 'gavel'
    if (d === 'discard') return 'close'
    return 'recycling'
}

function submitReturn() {
    const labels = { restock: 'Restocked', claims: 'Sent to Claims', discard: 'Discarded', recycle: 'Recycled' }
    completedItems.value.unshift({
        id: Date.now(),
        name: `Return ${rmaId.value}`,
        rma: rmaId.value,
        condition: itemCondition.value,
        disposition: disposition.value,
        dispositionLabel: labels[disposition.value] || disposition.value,
        hasPhoto: capturedPhoto.value,
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
    })
    // Remove from processing queue if matched by RMA
    const idx = processingItems.value.findIndex(p => p.rma === rmaId.value)
    if (idx !== -1) processingItems.value.splice(idx, 1)

    toastMsg.value = `Return ${rmaId.value} — ${labels[disposition.value]}`
    capturedPhoto.value = false
    rmaId.value = ''
    itemCondition.value = ''
    conditionNotes.value = ''
    disposition.value = ''
    setTimeout(() => { toastMsg.value = '' }, 2500)
}
</script>
