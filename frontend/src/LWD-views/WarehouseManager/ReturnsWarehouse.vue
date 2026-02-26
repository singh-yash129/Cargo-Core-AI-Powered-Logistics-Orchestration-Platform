<template>
    <div class="space-y-6">
        <div class="flex justify-between items-center">
            <h2 class="text-2xl font-bold text-white">Returns Processing (Warehouse)</h2>
            <div class="bg-black/40 border border-white/10 rounded-lg p-1 flex">
                <button
                    :class="activeTab === 'processing' ? 'px-4 py-1.5 bg-primary rounded text-background-dark text-sm font-bold shadow-lg' : 'px-4 py-1.5 text-gray-400 hover:text-white text-sm transition-colors'"
                    @click="activeTab = 'processing'">Processing</button>
                <button
                    :class="activeTab === 'completed' ? 'px-4 py-1.5 bg-primary rounded text-background-dark text-sm font-bold shadow-lg' : 'px-4 py-1.5 text-gray-400 hover:text-white text-sm transition-colors'"
                    @click="activeTab = 'completed'">Completed</button>
            </div>
        </div>

        <!-- Stats Row -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="glass-panel p-4 rounded-xl text-center">
                <div class="text-2xl font-bold text-yellow-400">5</div>
                <div class="text-xs text-gray-400">Awaiting Inspection</div>
            </div>
            <div class="glass-panel p-4 rounded-xl text-center">
                <div class="text-2xl font-bold text-green-400">12</div>
                <div class="text-xs text-gray-400">Restocked Today</div>
            </div>
            <div class="glass-panel p-4 rounded-xl text-center">
                <div class="text-2xl font-bold text-red-400">3</div>
                <div class="text-xs text-gray-400">Sent to Claims</div>
            </div>
            <div class="glass-panel p-4 rounded-xl text-center">
                <div class="text-2xl font-bold text-gray-400">1</div>
                <div class="text-xs text-gray-400">Discarded</div>
            </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Grading Station -->
            <div class="lg:col-span-2 glass-panel p-6 rounded-xl">
                <div class="flex justify-between items-center mb-6">
                    <h3 class="font-bold text-white">Item Grading Station 1</h3>
                    <span
                        class="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded border border-green-500/30 animate-pulse">Active</span>
                </div>

                <div class="flex gap-6">
                    <!-- Damage Photo Capture Area -->
                    <div class="w-1/3 space-y-3">
                        <div
                            class="aspect-square bg-gray-800 rounded-lg flex items-center justify-center border border-white/5 relative overflow-hidden group cursor-pointer hover:border-primary/50 transition-colors">
                            <div v-if="!capturedPhoto" class="flex flex-col items-center gap-2">
                                <span
                                    class="material-symbols-outlined text-5xl text-gray-600 group-hover:scale-110 transition-transform">photo_camera</span>
                                <div class="text-xs text-gray-500">Click to capture<br>damage photo</div>
                            </div>
                            <div v-else
                                class="w-full h-full bg-gradient-to-br from-red-900/30 to-transparent flex items-center justify-center">
                                <span class="material-symbols-outlined text-4xl text-green-400">check_circle</span>
                            </div>
                        </div>
                        <button @click="capturedPhoto = !capturedPhoto"
                            class="w-full py-2 text-xs font-bold rounded transition-colors"
                            :class="capturedPhoto ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400' : 'bg-primary/20 hover:bg-primary/30 text-primary'">
                            {{ capturedPhoto ? 'Retake Photo' : 'Capture Damage Photo' }}
                        </button>
                    </div>

                    <div class="flex-1 space-y-4">
                        <div>
                            <label class="text-xs text-gray-400 mb-1 block">RMA ID / Tracking #</label>
                            <input type="text" v-model="rmaId" placeholder="Scan barcode..."
                                class="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-primary/50 font-mono">
                        </div>

                        <!-- Condition Recording -->
                        <div>
                            <label class="text-xs text-gray-400 mb-1 block">Item Condition</label>
                            <select v-model="itemCondition"
                                class="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-primary/50">
                                <option value="">Select condition...</option>
                                <option value="like-new">Like New — No visible damage</option>
                                <option value="minor">Minor Wear — Cosmetic only</option>
                                <option value="damaged">Damaged — Functional issue</option>
                                <option value="broken">Broken — Non-functional</option>
                            </select>
                        </div>

                        <div>
                            <label class="text-xs text-gray-400 mb-1 block">Condition Notes</label>
                            <textarea v-model="conditionNotes" placeholder="Describe the condition in detail..."
                                class="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-primary/50 text-sm h-16 resize-none"></textarea>
                        </div>

                        <!-- Disposition Workflow -->
                        <div>
                            <label class="text-xs text-gray-400 mb-2 block">Disposition Decision</label>
                            <div class="grid grid-cols-2 gap-3">
                                <button @click="disposition = 'restock'"
                                    class="p-3 rounded-lg font-bold transition-all flex flex-col items-center gap-1 text-sm"
                                    :class="disposition === 'restock' ? 'bg-green-500/30 border-2 border-green-500 text-green-400' : 'bg-green-500/10 border border-green-500/20 hover:bg-green-500/20 text-green-400'">
                                    <span class="material-symbols-outlined">check_circle</span> Restock
                                </button>
                                <button @click="disposition = 'claims'"
                                    class="p-3 rounded-lg font-bold transition-all flex flex-col items-center gap-1 text-sm"
                                    :class="disposition === 'claims' ? 'bg-blue-500/30 border-2 border-blue-500 text-blue-400' : 'bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 text-blue-400'">
                                    <span class="material-symbols-outlined">gavel</span> Send to Claims
                                </button>
                                <button @click="disposition = 'discard'"
                                    class="p-3 rounded-lg font-bold transition-all flex flex-col items-center gap-1 text-sm"
                                    :class="disposition === 'discard' ? 'bg-red-500/30 border-2 border-red-500 text-red-400' : 'bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400'">
                                    <span class="material-symbols-outlined">delete</span> Discard
                                </button>
                                <button @click="disposition = 'recycle'"
                                    class="p-3 rounded-lg font-bold transition-all flex flex-col items-center gap-1 text-sm"
                                    :class="disposition === 'recycle' ? 'bg-purple-500/30 border-2 border-purple-500 text-purple-400' : 'bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20 text-purple-400'">
                                    <span class="material-symbols-outlined">recycling</span> Recycle
                                </button>
                            </div>
                        </div>

                        <div v-if="disposition === 'claims' || disposition === 'discard'"
                            class="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-xs text-yellow-400 flex items-center gap-2">
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

            <!-- Recent Scans -->
            <div class="glass-panel rounded-xl overflow-hidden p-6">
                <h3 class="font-bold text-white mb-4">Recent Graded Items</h3>
                <div class="space-y-4 max-h-[500px] overflow-y-auto">
                    <div v-for="item in recentItems" :key="item.id"
                        class="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/5">
                        <div class="w-10 h-10 rounded flex items-center justify-center"
                            :class="getDispositionBg(item.disposition)">
                            <span class="material-symbols-outlined" :class="getDispositionColor(item.disposition)">{{
                                getDispositionIcon(item.disposition) }}</span>
                        </div>
                        <div class="flex-1">
                            <div class="text-white text-sm font-bold">{{ item.name }}</div>
                            <div class="text-xs text-gray-500">{{ item.condition }} • {{ item.dispositionLabel }}</div>
                            <div v-if="item.hasPhoto" class="text-[10px] text-blue-400 mt-0.5">📷 Photo attached</div>
                        </div>
                        <div class="text-[10px] text-gray-600 font-mono">{{ item.time }}</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'

const activeTab = ref('processing')
const rmaId = ref('')
const itemCondition = ref('')
const conditionNotes = ref('')
const disposition = ref('')
const capturedPhoto = ref(false)

const recentItems = ref([
    { id: 1, name: 'iPhone 13 Case', condition: 'Like New', disposition: 'restock', dispositionLabel: 'Restocked to A-12', hasPhoto: false, time: '11:42' },
    { id: 2, name: 'Blender (Broken)', condition: 'Broken', disposition: 'discard', dispositionLabel: 'Disposal Bin', hasPhoto: true, time: '11:28' },
    { id: 3, name: 'Kitchen Scale', condition: 'Minor Wear', disposition: 'restock', dispositionLabel: 'Restocked to B-04', hasPhoto: false, time: '11:15' },
    { id: 4, name: 'Monitor Stand', condition: 'Damaged', disposition: 'claims', dispositionLabel: 'Sent to Claims', hasPhoto: true, time: '10:52' },
    { id: 5, name: 'USB Hub', condition: 'Like New', disposition: 'restock', dispositionLabel: 'Restocked to A-14', hasPhoto: false, time: '10:30' },
])

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
    recentItems.value.unshift({
        id: Date.now(),
        name: `Return ${rmaId.value}`,
        condition: itemCondition.value,
        disposition: disposition.value,
        dispositionLabel: disposition.value === 'restock' ? 'Restocked' : disposition.value === 'claims' ? 'Sent to Claims' : disposition.value === 'discard' ? 'Discarded' : 'Recycled',
        hasPhoto: capturedPhoto.value,
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
    })
    rmaId.value = ''
    itemCondition.value = ''
    conditionNotes.value = ''
    disposition.value = ''
    capturedPhoto.value = false
}
</script>
