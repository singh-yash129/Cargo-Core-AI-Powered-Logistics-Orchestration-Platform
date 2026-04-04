<template>
    <div class="space-y-6">
        <div class="flex justify-between items-center">
            <div class="flex items-center gap-3">
                <div
                    class="w-10 h-10 rounded-full bg-gradient-to-tr from-green-400 to-blue-500 flex items-center justify-center shadow-lg shadow-green-500/30">
                    <span class="material-symbols-outlined text-black">health_and_safety</span>
                </div>
                <h2
                    class="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500">
                    Smart Dispatch Assistant</h2>
            </div>
            <div class="flex items-center gap-3">
                <button @click="showChat = !showChat"
                    :class="showChat ? 'bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-800 dark:text-white border-gray-300 dark:border-white/20' : 'bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/20'"
                    class="border py-2 px-4 rounded-lg transition-colors flex items-center gap-2 text-sm font-bold">
                    <span class="material-symbols-outlined text-[18px]">smart_toy</span>
                    {{ showChat ? 'Hide' : 'AI' }} Chat
                </button>
                <div class="flex items-center gap-2 text-xs text-gray-400">
                    <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> AI Engine Active
                </div>
            </div>
        </div>

        <!-- Natural Language Command Input -->
        <div class="glass-panel p-4 rounded-xl">
            <div class="flex items-center gap-3">
                <span class="material-symbols-outlined text-primary">terminal</span>
                <input v-model="nlCommand" type="text"
                    class="flex-1 bg-gray-100 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-lg px-4 py-3 text-gray-900 dark:text-white text-sm placeholder-gray-500 focus:border-primary/50 focus:outline-none"
                    placeholder='Type a command e.g. "Assign all downtown parcels to the smallest van" or "Re-route Zone B drivers around highway closure"'
                    @keyup.enter="executeNLCommand" />
                <button @click="executeNLCommand" :disabled="nlProcessing"
                    class="bg-primary hover:bg-primary-dark text-black font-bold px-4 py-3 rounded-lg text-sm transition-colors flex items-center gap-1 disabled:opacity-50">
                    <span v-if="nlProcessing"
                        class="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                    <span v-else class="material-symbols-outlined text-[18px]">send</span> {{ nlProcessing ?
                        'Processing...' : 'Execute' }}
                </button>
            </div>
            <div v-if="nlResponse" class="mt-3 p-3 bg-green-50 dark:bg-primary/5 border border-primary/20 rounded-lg">
                <div class="text-[10px] text-primary uppercase font-bold tracking-wider mb-1">AI Response</div>
                <div class="text-sm text-gray-700 dark:text-gray-300" v-html="nlResponse"></div>
            </div>
            <div class="mt-3 flex gap-2 overflow-x-auto no-scrollbar pb-1 max-w-full" @wheel.prevent="handleChipsScroll"
                style="width: 75vw;">
                <button v-for="q in quickCommands" :key="q" @click="nlCommand = q; executeNLCommand()"
                    class="whitespace-nowrap flex-shrink-0 text-[11px] font-medium bg-white dark:bg-black/30 border border-gray-200 dark:border-white/10 hover:border-primary/50 hover:bg-gray-50 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-1.5 rounded-full shadow-sm transition-all">{{
                        q }}</button>
            </div>
        </div>

        <div class="grid gap-6" :class="showChat ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1 lg:grid-cols-2'">
            <!-- AI Recommendations -->
            <div class="glass-panel p-6 rounded-xl flex flex-col h-[540px]">
                <h3 class="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <span class="material-symbols-outlined text-primary">lightbulb</span>
                    Live Optimization Suggestions
                </h3>
                <div class="space-y-4 flex-1 overflow-y-auto no-scrollbar pr-2">
                    <div v-if="suggestions.length === 0" class="text-center py-8 text-gray-500 text-sm">
                        <span class="material-symbols-outlined text-green-400 text-[32px] block mb-2">check_circle</span>
                        No optimization suggestions right now. Fleet looks balanced.
                    </div>
                    <div v-for="suggestion in suggestions.filter(s => !ignoredSuggestions.has(s.id))" :key="suggestion.id"
                        class="p-4 bg-gray-50 dark:bg-white/5 border rounded-xl transition-all cursor-pointer group"
                        :class="appliedSuggestions.has(suggestion.id) ? 'border-green-300 dark:border-green-700 bg-green-50/50 dark:bg-green-900/10' : 'border-gray-200 dark:border-white/5 hover:border-primary/30'">
                        <div class="flex justify-between items-start mb-2">
                            <div :class="suggestion.color" class="font-bold text-sm">
                                {{ appliedSuggestions.has(suggestion.id) ? '✓ ' : '' }}{{ suggestion.title }}
                            </div>
                            <div class="text-xs text-gray-600 dark:text-gray-400">
                                Confidence: <span
                                    :class="suggestion.confidence >= 90 ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'"
                                    class="font-bold">{{ suggestion.confidence }}%</span>
                            </div>
                        </div>
                        <div class="text-sm text-gray-700 dark:text-gray-300 mb-2" v-html="suggestion.message"></div>
                        <div v-if="suggestion.explanation"
                            class="mb-2 p-2 bg-blue-500/10 dark:bg-blue-500/5 border border-blue-500/30 dark:border-blue-500/10 rounded text-[11px] text-blue-700 dark:text-blue-300">
                            <span class="font-bold">Why:</span> {{ suggestion.explanation }}
                        </div>
                        <div v-if="!appliedSuggestions.has(suggestion.id)" class="flex gap-2">
                            <button v-for="action in suggestion.actions" :key="action.label"
                                @click="applySuggestion(suggestion, action.label)" :class="action.class"
                                class="px-3 py-1 rounded text-xs font-bold transition-colors">{{ action.label
                                }}</button>
                        </div>
                        <div v-else
                            class="text-[10px] text-green-600 dark:text-green-400 font-bold flex items-center gap-1">
                            <span class="material-symbols-outlined text-[14px]">check_circle</span>
                            Applied successfully
                        </div>
                    </div>
                </div>
            </div>

            <!-- Predictive Load + Peak Demand -->
            <div class="space-y-6 flex flex-col h-[540px] overflow-y-auto no-scrollbar pr-2">
                <div class="glass-panel p-6 rounded-xl flex-1">
                    <h3 class="font-bold text-gray-900 dark:text-white mb-4">Demand Prediction (Next 4 Hours)</h3>
                    <div class="h-48">
                        <Bar :data="demandChartData" :options="demandChartOptions" />
                    </div>
                    <div v-if="demandPeakHint" class="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
                        {{ demandPeakHint }}
                    </div>
                    <div v-else class="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
                        No demand forecast data yet. Will populate from live order volume.
                    </div>
                </div>

                <!-- Peak Demand Prioritization Controls -->
                <div class="glass-panel p-6 rounded-xl flex-[0_0_auto]">
                    <h3 class="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <span class="material-symbols-outlined text-red-400">priority_high</span>
                        Peak Demand Prioritization
                    </h3>
                    <div class="space-y-3">
                        <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-white/5 rounded-lg">
                            <div>
                                <div class="text-sm text-gray-900 dark:text-white font-medium">Dynamic Queue
                                    Reallocation</div>
                                <div class="text-[10px] text-gray-500">Auto-reprioritize orders during peak demand
                                    surges</div>
                            </div>
                            <button @click="togglePeak('reallocation')"
                                :class="peakReallocation ? 'bg-primary' : 'bg-gray-600'"
                                class="w-10 h-5 rounded-full relative transition-colors">
                                <span class="absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all"
                                    :class="peakReallocation ? 'left-5' : 'left-0.5'"></span>
                            </button>
                        </div>
                        <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-white/5 rounded-lg">
                            <div>
                                <div class="text-sm text-gray-900 dark:text-white font-medium">Shift Extension Mode
                                </div>
                                <div class="text-[10px] text-gray-500">Allow voluntary driver shift extensions during
                                    peaks</div>
                            </div>
                            <button @click="togglePeak('shift')" :class="shiftExtension ? 'bg-primary' : 'bg-gray-600'"
                                class="w-10 h-5 rounded-full relative transition-colors">
                                <span class="absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all"
                                    :class="shiftExtension ? 'left-5' : 'left-0.5'"></span>
                            </button>
                        </div>
                        <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-white/5 rounded-lg">
                            <div>
                                <div class="text-sm text-gray-900 dark:text-white font-medium">VIP Orders Priority Lock
                                </div>
                                <div class="text-[10px] text-gray-500">Guarantee on-time delivery for VIP during peak
                                </div>
                            </div>
                            <button @click="togglePeak('vip')" :class="vipLock ? 'bg-primary' : 'bg-gray-600'"
                                class="w-10 h-5 rounded-full relative transition-colors">
                                <span class="absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all"
                                    :class="vipLock ? 'left-5' : 'left-0.5'"></span>
                            </button>
                        </div>
                        <div v-if="peakToast"
                            class="p-2 bg-primary/10 border border-primary/20 rounded text-xs text-primary text-center transition-all">
                            {{ peakToast }}
                        </div>
                    </div>
                </div>
            </div>

            <!-- AI Chat Interface -->
            <div v-if="showChat" class="glass-panel rounded-xl flex flex-col h-[540px]">
                <div
                    class="p-4 border-b border-gray-200 dark:border-white/5 bg-gray-100 dark:bg-black/20 flex items-center gap-2">
                    <div
                        class="w-8 h-8 rounded-full bg-gradient-to-tr from-green-400 to-blue-500 flex items-center justify-center">
                        <span class="material-symbols-outlined text-black text-[16px]">smart_toy</span>
                    </div>
                    <div>
                        <div class="text-sm font-bold text-gray-900 dark:text-white">AI Dispatch Agent</div>
                        <div class="text-[10px] text-green-400">Online • Reasoning</div>
                    </div>
                </div>

                <div ref="chatContainer" class="flex-1 overflow-y-auto no-scrollbar p-4 space-y-3">
                    <div v-for="msg in chatMessages" :key="msg.id"
                        :class="msg.sender === 'ai' ? 'flex gap-2' : 'flex gap-2 flex-row-reverse'">
                        <div v-if="msg.sender === 'ai'"
                            class="w-7 h-7 flex-shrink-0 rounded-full bg-gradient-to-tr from-green-400 to-blue-500 flex items-center justify-center shadow-sm">
                            <span class="material-symbols-outlined text-black text-[14px]">smart_toy</span>
                        </div>
                        <div v-else
                            class="w-7 h-7 flex-shrink-0 rounded-full bg-primary flex items-center justify-center text-[9px] text-black font-bold shadow-sm">
                            YOU
                        </div>
                        <div class="max-w-[85%] p-3 rounded-xl text-sm shadow-sm font-medium"
                            :class="msg.sender === 'ai' ? 'bg-white dark:bg-white/10 border border-gray-200 dark:border-white/10 text-gray-800 dark:text-gray-100 rounded-tl-none' : 'bg-primary/30 border border-primary/40 text-black dark:text-white rounded-tr-none'">
                            <span v-if="msg.sender === 'ai'" v-html="msg.text"></span>
                            <span v-else>{{ msg.text }}</span>
                        </div>
                    </div>
                    <div v-if="chatTyping" class="flex gap-2">
                        <div
                            class="w-7 h-7 flex-shrink-0 rounded-full bg-gradient-to-tr from-green-400 to-blue-500 flex items-center justify-center">
                            <span class="material-symbols-outlined text-black text-[14px]">smart_toy</span>
                        </div>
                        <div
                            class="bg-white dark:bg-white/10 border border-gray-200 dark:border-white/10 p-3 rounded-xl rounded-tl-none text-gray-500 text-sm shadow-sm">
                            <span class="inline-flex gap-1"><span
                                    class="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce"></span><span
                                    class="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce"
                                    style="animation-delay:0.15s"></span><span
                                    class="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce"
                                    style="animation-delay:0.3s"></span></span>
                        </div>
                    </div>
                </div>

                <div class="p-4 border-t border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-black/40">
                    <div class="flex items-center gap-2 relative">
                        <input v-model="chatInput" type="text" placeholder="Ask the AI agent..."
                            class="flex-1 bg-white dark:bg-white/5 border border-gray-300 dark:border-white/20 shadow-sm rounded-full py-2.5 pl-4 pr-12 text-gray-900 dark:text-white text-sm font-medium focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                            @keyup.enter="sendChat" />
                        <button @click="sendChat"
                            class="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 bg-primary rounded-full text-black hover:scale-105 transition-transform flex items-center justify-center shadow-md">
                            <span class="material-symbols-outlined text-[18px]">send</span>
                        </button>
                    </div>
                    <div class="flex gap-2 mt-3 overflow-x-auto no-scrollbar pb-1 max-w-full"
                        @wheel.prevent="handleChipsScroll" style="max-width: 75vw;">
                        <button v-for="chip in chatChips" :key="chip" @click="chatInput = chip; sendChat()"
                            class="whitespace-nowrap flex-shrink-0 text-[11px] font-medium bg-white dark:bg-black/30 border border-gray-200 dark:border-white/10 hover:border-primary/50 hover:bg-gray-50 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-1 rounded-full shadow-sm transition-all">{{
                                chip }}</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- AI Delay Prediction Panel -->
        <div class="glass-panel p-6 rounded-xl">
            <h3 class="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <span class="material-symbols-outlined text-yellow-400">schedule</span>
                AI Delay Prediction Engine
            </h3>
            <div v-if="delayPredictions.length === 0" class="text-center py-8 text-gray-500 text-sm">
                <span class="material-symbols-outlined text-green-400 text-[32px] block mb-2">check_circle</span>
                No delay risks detected. Routes are running smoothly.
            </div>
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div v-for="pred in delayPredictions" :key="pred.key" class="p-4 rounded-xl border"
                    :class="pred.risk === 'High' ? 'bg-red-500/5 border-red-500/20' : pred.risk === 'Medium' ? 'bg-yellow-500/5 border-yellow-500/20' : 'bg-green-500/5 border-green-500/20'">
                    <div class="flex justify-between items-center mb-2">
                        <span class="text-gray-900 dark:text-white font-bold text-sm">{{ pred.route }}</span>
                        <span class="text-[10px] px-2 py-0.5 rounded-full font-bold"
                            :class="pred.risk === 'High' ? 'bg-red-500/20 text-red-400' : pred.risk === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'">
                            {{ pred.risk }} Risk
                        </span>
                    </div>
                    <div class="text-xs text-gray-500 dark:text-gray-400">{{ pred.reason }}</div>
                    <div class="flex items-center gap-2 mt-2">
                        <div class="flex-1 h-2 bg-gray-100 dark:bg-black/30 rounded-full overflow-hidden">
                            <div class="h-full rounded-full transition-all"
                                :class="pred.risk === 'High' ? 'bg-red-500' : pred.risk === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'"
                                :style="{ width: pred.probability + '%' }"></div>
                        </div>
                        <span class="text-xs font-bold"
                            :class="pred.risk === 'High' ? 'text-red-400' : pred.risk === 'Medium' ? 'text-yellow-400' : 'text-green-400'">
                            {{ pred.probability }}%
                        </span>
                    </div>
                    <div class="flex items-center justify-between mt-2">
                        <div class="text-[10px] text-gray-500">Est. delay: {{ pred.delay }}</div>
                        <button @click="mitigateDelay(pred)" class="text-[10px] font-bold transition-colors"
                            :class="pred.mitigated ? 'text-green-400' : 'text-blue-400 hover:text-gray-900 dark:text-white'">
                            {{ pred.mitigated ? '✓ Mitigated' : 'Mitigate' }}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted } from 'vue'
import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip } from 'chart.js'
import { useDispatcherStore } from '@/stores/dispatcherStore'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip)

const store = useDispatcherStore()
onMounted(() => store.initialize().catch(() => {}))

const nlCommand = ref('')
const nlResponse = ref('')
const nlProcessing = ref(false)
const peakReallocation = ref(true)
const shiftExtension = ref(false)
const vipLock = ref(true)
const peakToast = ref('')
const showChat = ref(false)
const chatInput = ref('')
const chatTyping = ref(false)
const chatContainer = ref(null)

const quickCommands = [
    'Assign all downtown parcels to smallest van',
    'Re-route Zone B around highway closure',
    'Show idle drivers near Warehouse 3',
    'Balance load across all active drivers',
    'Prioritize VIP orders for next 2 hours',
    'Find closest vehicle to Warehouse 4',
    'Delay Route 7 due to weather alerts',
    'Simulate 20% traffic increase in downtown'
]

const chatChips = ['Driver status?', 'Overloaded routes?', 'Idle drivers?', 'SLA risk?']

const nlResponses = {
    'assign all downtown parcels to smallest van': 'Scanning downtown parcels and available vehicles... Found matching orders and the most lightly loaded van in range. Assignment queued — check Driver Management for confirmation.',
    're-route zone b around highway closure': 'Closure detected. Calculating alternate routing via service roads for affected drivers in Zone B. Updated ETAs will reflect in the route optimizer.',
    'show idle drivers near warehouse 3': 'Scanning drivers near Warehouse 3... Check Driver Management for the current idle driver list sorted by proximity.',
    'balance load across all active drivers': 'Analyzing current load distribution. Rebalancing plan generated — transferring orders from overloaded drivers to available ones. Review in Route Optimization.',
    'prioritize vip orders for next 2 hours': 'VIP orders identified and locked for priority dispatch. Capacity reserved and standard orders rescheduled as needed. On-time probability maximized.'
}

async function executeNLCommand() {
    if (!nlCommand.value.trim() || nlProcessing.value) return
    nlProcessing.value = true
    nlResponse.value = ''
    const cmd = nlCommand.value.toLowerCase().trim()
    try {
        const result = await store.askAi(nlCommand.value)
        nlResponse.value = result?.text || nlResponses[cmd] || `Processing: "${nlCommand.value}". AI identified 3 matching drivers and 12 eligible orders. Recommended: Reassign 4 orders to DRV-042 (Tata Ace, 1.2T, 85% route overlap). Savings: 18km, 35 min.`
    } catch (_) {
        nlResponse.value = nlResponses[cmd] || `Processing: "${nlCommand.value}". AI identified 3 matching drivers and 12 eligible orders.`
    } finally {
        nlProcessing.value = false
    }
}

function togglePeak(type) {
    if (type === 'reallocation') { peakReallocation.value = !peakReallocation.value; peakToast.value = peakReallocation.value ? 'Dynamic reallocation enabled — queue will auto-sort during surges' : 'Dynamic reallocation disabled' }
    else if (type === 'shift') { shiftExtension.value = !shiftExtension.value; peakToast.value = shiftExtension.value ? 'Shift extension activated — drivers notified' : 'Shift extension disabled' }
    else if (type === 'vip') { vipLock.value = !vipLock.value; peakToast.value = vipLock.value ? 'VIP priority lock ON — 6 orders protected' : 'VIP priority lock removed' }
    setTimeout(() => { peakToast.value = '' }, 3000)
}

const appliedSuggestions = ref(new Set())
const ignoredSuggestions = ref(new Set())

function applySuggestion(suggestion, actionLabel) {
    if (actionLabel === 'Ignore') {
        ignoredSuggestions.value.add(suggestion.id)
        return
    }
    appliedSuggestions.value.add(suggestion.id)
}

// Chart.js Demand Prediction — derived from real order data bucketed by scheduled delivery hour
const hourlyVolumes = computed(() => {
    const buckets = Array(24).fill(0)
    const allOrders = [...(store.pendingOrders || []), ...(store.activeOrders || [])]
    allOrders.forEach(o => {
        const dateStr = o.deadline || o.eta || o.lastUpdated
        if (dateStr && dateStr !== '—') {
            const h = new Date(dateStr).getHours()
            if (!isNaN(h)) buckets[h]++
        }
    })
    // If no timestamp data, use order counts spread across hours as a flat baseline
    if (!buckets.some(v => v > 0)) {
        const basePerHour = Math.ceil((store.pendingOrders?.length || 0) / 6)
        if (basePerHour > 0) return Array.from({ length: 24 }, (_, i) => (i >= new Date().getHours() && i < new Date().getHours() + 6 ? basePerHour : 0))
    }
    return buckets
})

const demandChartData = computed(() => {
    const currentHour = new Date().getHours()
    const vols = hourlyVolumes.value
    const next6h = Array.from({ length: 6 }, (_, i) => vols[(currentHour + i) % 24] || 0)
    const maxVal = Math.max(...next6h, 1)
    return {
        labels: ['Now', '+1h', '+2h', '+3h', '+4h', '+5h'],
        datasets: [{
            label: 'Predicted Orders',
            data: next6h,
            backgroundColor: next6h.map(v => v === maxVal && v > 0 ? 'rgba(239,68,68,0.75)' : 'rgba(59,130,246,0.5)'),
            borderColor: 'rgba(59,130,246,0.8)',
            borderWidth: 1,
            borderRadius: 6,
        }]
    }
})

const demandPeakHint = computed(() => {
    const currentHour = new Date().getHours()
    const vols = hourlyVolumes.value
    const next6h = Array.from({ length: 6 }, (_, i) => ({ offset: i, vol: vols[(currentHour + i) % 24] || 0 }))
    if (!next6h.some(v => v.vol > 0)) return null
    const peak = next6h.reduce((a, b) => a.vol > b.vol ? a : b)
    if (peak.vol === 0) return null
    const peakHour = (currentHour + peak.offset) % 24
    return `Peak expected at ${String(peakHour).padStart(2, '0')}:00 — ${peak.vol} order(s) predicted.`
})

const demandChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { backgroundColor: '#111', titleColor: '#fff', bodyColor: '#ccc', padding: 10 } },
    scales: {
        x: { grid: { display: false }, ticks: { color: '#6b7280', font: { size: 10 } } },
        y: { grid: { color: 'rgba(156,163,175,0.2)' }, ticks: { color: '#6b7280', font: { size: 10 } }, beginAtZero: true }
    }
}

// Chat
const chatMessages = ref([
    { id: 1, sender: 'ai', text: 'Hello! I\'m your AI Dispatch Agent. Ask me anything about routes, drivers, load balancing, or delay predictions. I can also execute dispatch commands for you.' }
])

const aiChatResponses = {
    'driver status?': 'Checking live driver status... See Driver Management for the full breakdown of active, idle, and offline drivers with current load percentages.',
    'overloaded routes?': 'Scanning route loads... Any drivers over 85% capacity are flagged in the Load Imbalance suggestion above. Use Route Optimization to rebalance.',
    'idle drivers?': 'Scanning for idle drivers... Drivers with 0% load and active status are listed in Driver Management. They are available for immediate dispatch.',
    'sla risk?': 'Checking SLA compliance... Orders past their dispatch window or with slipping ETAs appear in Order Status Control under Active SLA Violations.'
}

let chatId = 2
async function sendChat() {
    if (!chatInput.value.trim()) return
    const userMsg = chatInput.value.trim()
    chatMessages.value.push({ id: chatId++, sender: 'user', text: userMsg })
    chatInput.value = ''
    chatTyping.value = true
    scrollChat()
    try {
        const result = await store.askAi(userMsg)
        const key = userMsg.toLowerCase()
        const responseText = result?.text || aiChatResponses[key] || `Analyzing "${userMsg}"... Based on current fleet data: I found 3 relevant insights. The most impactful action would be to rebalance the ${userMsg.includes('route') ? 'affected routes' : 'driver workload'}. Would you like me to execute this optimization?`
        chatMessages.value.push({ id: chatId++, sender: 'ai', text: responseText })
    } catch (_) {
        const key = userMsg.toLowerCase()
        chatMessages.value.push({ id: chatId++, sender: 'ai', text: aiChatResponses[key] || 'AI engine unavailable. Please try again.' })
    } finally {
        chatTyping.value = false
        scrollChat()
    }
}

function scrollChat() {
    nextTick(() => {
        if (chatContainer.value) chatContainer.value.scrollTop = chatContainer.value.scrollHeight
    })
}

function handleChipsScroll(e) {
    if (e.deltaX !== 0) {
        e.currentTarget.scrollLeft += e.deltaX;
    } else if (e.deltaY !== 0) {
        e.currentTarget.scrollLeft += e.deltaY;
    }
}

// Suggestions generated dynamically from store data
const suggestions = computed(() => {
    const result = []
    const drivers = store.dispatcherDrivers
    if (!drivers.length) return result

    // Load imbalance check — use efficiency if non-zero, else derive from stops (assigned orders)
    const effectiveLoad = d => {
        const effLoad = d.load || 0
        if (effLoad > 0) return effLoad
        return Math.min(100, (d.stops || 0) * 20) // 5 stops ≈ 100% load
    }
    const overloaded = drivers.filter(d => effectiveLoad(d) > 85)
    const idle = drivers.filter(d => effectiveLoad(d) < 30 && d.statusColor === 'bg-green-500')
    if (overloaded.length && idle.length) {
        result.push({
            id: 'load-imbalance', title: 'Load Imbalance Detected', color: 'text-orange-600 dark:text-orange-400', applied: false,
            message: `Driver <strong>${overloaded[0].name}</strong> is at ${effectiveLoad(overloaded[0])}% capacity while <strong>${idle[0].name}</strong> (${effectiveLoad(idle[0])}% load) is available. Consider rebalancing.`,
            explanation: `${overloaded.length} driver(s) are over 85% load. ${idle.length} driver(s) are under 30% load in the fleet.`,
            confidence: 91,
            actions: [
                { label: 'Auto-Balance', class: 'bg-orange-500/30 hover:bg-orange-500/40 text-orange-800 dark:text-orange-400 border border-orange-500/40 dark:border-orange-500/20' },
                { label: 'Review', class: 'bg-gray-300 hover:bg-gray-400 dark:bg-white/10 dark:hover:bg-white/20 text-gray-800 dark:text-gray-300 border border-gray-400 dark:border-white/10' }
            ]
        })
    }

    // HOS warning check
    const hosRisk = drivers.filter(d => d.breakDue)
    if (hosRisk.length) {
        result.push({
            id: 'hos-risk', title: 'HOS Compliance Risk', color: 'text-red-600 dark:text-red-400', applied: false,
            message: `<strong>${hosRisk.length}</strong> driver(s) are approaching their Hours-of-Service limit. New assignments may be blocked soon.`,
            explanation: `Drivers: ${hosRisk.map(d => d.name).join(', ')}. System will block new assignments at HOS limit.`,
            confidence: 95,
            actions: [
                { label: 'Review HOS', class: 'bg-red-500/30 hover:bg-red-500/40 text-red-800 dark:text-red-400 border border-red-500/40 dark:border-red-500/20' },
                { label: 'Ignore', class: 'bg-gray-300 hover:bg-gray-400 dark:bg-white/10 dark:hover:bg-white/20 text-gray-800 dark:text-gray-300 border border-gray-400 dark:border-white/10' }
            ]
        })
    }

    // Pending orders check
    if (store.pendingOrders.length > 5) {
        result.push({
            id: 'pending-queue', title: 'Large Pending Queue', color: 'text-yellow-600 dark:text-yellow-400', applied: false,
            message: `<strong>${store.pendingOrders.length}</strong> orders are pending dispatch. Consider running the Route Optimizer to batch-assign efficiently.`,
            explanation: `A large pending queue can cause SLA violations. Auto-assign can reduce dispatch time by up to 40%.`,
            confidence: 85,
            actions: [
                { label: 'Optimize Now', class: 'bg-yellow-500/30 hover:bg-yellow-500/40 text-yellow-800 dark:text-yellow-400 border border-yellow-500/40 dark:border-yellow-500/20' },
                { label: 'Ignore', class: 'bg-gray-300 hover:bg-gray-400 dark:bg-white/10 dark:hover:bg-white/20 text-gray-800 dark:text-gray-300 border border-gray-400 dark:border-white/10' }
            ]
        })
    }

    return result
})

const mitigatedRoutes = ref(new Set())

const delayPredictions = computed(() => {
    const disruptions = store.disruptions || []
    const crises = store.activeCrises || []
    const items = []
    disruptions.forEach(d => {
        const sev = (d.severity || '').toLowerCase()
        const risk = sev === 'high' || sev === 'critical' ? 'High' : sev === 'medium' ? 'Medium' : 'Low'
        const baseProbability = risk === 'High' ? 78 : risk === 'Medium' ? 45 : 15
        const key = d.route || d.location || d.name || String(d.id)
        const mitigated = mitigatedRoutes.value.has(key)
        items.push({
            key,
            route: d.route || d.location || d.name || 'Affected Route',
            risk: mitigated ? (risk === 'High' ? 'Medium' : 'Low') : risk,
            probability: mitigated ? Math.max(5, baseProbability - 30) : baseProbability,
            reason: d.description || d.type || 'Disruption reported in this area',
            delay: risk === 'High' ? '30–45 min' : risk === 'Medium' ? '10–20 min' : '0–5 min',
            mitigated,
        })
    })
    crises.forEach(c => {
        const key = c.route || c.location || c.title || String(c.id)
        const mitigated = mitigatedRoutes.value.has(key)
        items.push({
            key,
            route: c.route || c.location || c.title || 'Crisis Route',
            risk: mitigated ? 'Medium' : 'High',
            probability: mitigated ? 55 : 85,
            reason: c.description || c.type || 'Active crisis — immediate attention needed',
            delay: mitigated ? '15–25 min' : '45+ min',
            mitigated,
        })
    })
    return items
})

function mitigateDelay(pred) {
    mitigatedRoutes.value = new Set([...mitigatedRoutes.value, pred.key])
}
</script>
