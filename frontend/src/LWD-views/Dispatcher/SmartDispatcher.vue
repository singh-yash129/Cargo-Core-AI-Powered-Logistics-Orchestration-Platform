<template>
    <div class="space-y-6">
        <div class="flex justify-between items-center">
            <div class="flex items-center gap-3">
                <div
                    class="w-10 h-10 rounded-full bg-gradient-to-tr from-green-400 to-blue-500 flex items-center justify-center shadow-lg shadow-green-500/30">
                    <span class="material-symbols-outlined text-black">health_and_safety</span>
                </div>
                <h2 class="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500">
                    Smart Dispatch Assistant</h2>
            </div>
            <div class="flex items-center gap-3">
                <button @click="showChat = !showChat"
                    class="bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 py-2 px-4 rounded-lg transition-colors flex items-center gap-2 text-sm font-bold">
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
                <button @click="executeNLCommand"
                    :disabled="nlProcessing"
                    class="bg-primary hover:bg-primary-dark text-black font-bold px-4 py-3 rounded-lg text-sm transition-colors flex items-center gap-1 disabled:opacity-50">
                    <span v-if="nlProcessing" class="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                    <span v-else class="material-symbols-outlined text-[18px]">send</span> {{ nlProcessing ? 'Processing...' : 'Execute' }}
                </button>
            </div>
            <div v-if="nlResponse" class="mt-3 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                <div class="text-[10px] text-primary uppercase font-bold tracking-wider mb-1">AI Response</div>
                <div class="text-sm text-gray-600 dark:text-gray-300">{{ nlResponse }}</div>
            </div>
            <div class="mt-2 flex gap-2 flex-wrap">
                <button v-for="q in quickCommands" :key="q" @click="nlCommand = q; executeNLCommand()"
                    class="text-[10px] bg-gray-50 dark:bg-white/5 hover:bg-white/10 text-gray-400 hover:text-gray-900 dark:text-white px-2 py-1 rounded transition-colors">{{ q }}</button>
            </div>
        </div>

        <div class="grid gap-6" :class="showChat ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1 lg:grid-cols-2'">
            <!-- AI Recommendations -->
            <div class="glass-panel p-6 rounded-xl">
                <h3 class="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <span class="material-symbols-outlined text-primary">lightbulb</span>
                    Live Optimization Suggestions
                </h3>
                <div class="space-y-4">
                    <div v-for="suggestion in suggestions" :key="suggestion.id"
                        :class="suggestion.applied ? 'opacity-50' : ''"
                        class="p-4 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/5 rounded-xl hover:border-primary/30 transition-all cursor-pointer group">
                        <div class="flex justify-between items-start mb-2">
                            <div :class="suggestion.color" class="font-bold text-sm">
                                {{ suggestion.applied ? '✓ ' : '' }}{{ suggestion.title }}
                            </div>
                            <div class="text-xs text-gray-500">
                                Confidence: <span :class="suggestion.confidence >= 90 ? 'text-green-400' : 'text-yellow-400'" class="font-bold">{{ suggestion.confidence }}%</span>
                            </div>
                        </div>
                        <div class="text-sm text-gray-600 dark:text-gray-300 mb-2" v-html="suggestion.message"></div>
                        <div v-if="suggestion.explanation" class="mb-2 p-2 bg-blue-500/5 border border-blue-500/10 rounded text-[11px] text-blue-300">
                            <span class="font-bold">Why:</span> {{ suggestion.explanation }}
                        </div>
                        <div v-if="!suggestion.applied" class="flex gap-2">
                            <button v-for="action in suggestion.actions" :key="action.label"
                                @click="applySuggestion(suggestion, action.label)"
                                :class="action.class"
                                class="px-3 py-1 rounded text-xs font-bold transition-colors">{{ action.label }}</button>
                        </div>
                        <div v-else class="text-[10px] text-green-400 font-bold">Applied successfully</div>
                    </div>
                </div>
            </div>

            <!-- Predictive Load + Peak Demand -->
            <div class="space-y-6">
                <div class="glass-panel p-6 rounded-xl">
                    <h3 class="font-bold text-gray-900 dark:text-white mb-4">Demand Prediction (Next 4 Hours)</h3>
                    <div class="h-48">
                        <Bar :data="demandChartData" :options="demandChartOptions" />
                    </div>
                    <div class="mt-4 text-center text-sm text-gray-400">
                        Peak expected at <span class="text-gray-900 dark:text-white font-bold">14:00</span>. Prepare 3 extra drivers.
                    </div>
                </div>

                <!-- Peak Demand Prioritization Controls -->
                <div class="glass-panel p-6 rounded-xl">
                    <h3 class="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <span class="material-symbols-outlined text-red-400">priority_high</span>
                        Peak Demand Prioritization
                    </h3>
                    <div class="space-y-3">
                        <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-white/5 rounded-lg">
                            <div>
                                <div class="text-sm text-gray-900 dark:text-white font-medium">Dynamic Queue Reallocation</div>
                                <div class="text-[10px] text-gray-500">Auto-reprioritize orders during peak demand surges</div>
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
                                <div class="text-sm text-gray-900 dark:text-white font-medium">Shift Extension Mode</div>
                                <div class="text-[10px] text-gray-500">Allow voluntary driver shift extensions during peaks</div>
                            </div>
                            <button @click="togglePeak('shift')"
                                :class="shiftExtension ? 'bg-primary' : 'bg-gray-600'"
                                class="w-10 h-5 rounded-full relative transition-colors">
                                <span class="absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all"
                                    :class="shiftExtension ? 'left-5' : 'left-0.5'"></span>
                            </button>
                        </div>
                        <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-white/5 rounded-lg">
                            <div>
                                <div class="text-sm text-gray-900 dark:text-white font-medium">VIP Orders Priority Lock</div>
                                <div class="text-[10px] text-gray-500">Guarantee on-time delivery for VIP during peak</div>
                            </div>
                            <button @click="togglePeak('vip')"
                                :class="vipLock ? 'bg-primary' : 'bg-gray-600'"
                                class="w-10 h-5 rounded-full relative transition-colors">
                                <span class="absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all"
                                    :class="vipLock ? 'left-5' : 'left-0.5'"></span>
                            </button>
                        </div>
                        <div v-if="peakToast" class="p-2 bg-primary/10 border border-primary/20 rounded text-xs text-primary text-center transition-all">
                            {{ peakToast }}
                        </div>
                    </div>
                </div>
            </div>

            <!-- AI Chat Interface -->
            <div v-if="showChat" class="glass-panel rounded-xl flex flex-col h-[540px]">
                <div class="p-4 border-b border-gray-200 dark:border-white/5 bg-gray-100 dark:bg-black/20 flex items-center gap-2">
                    <div class="w-8 h-8 rounded-full bg-gradient-to-tr from-green-400 to-blue-500 flex items-center justify-center">
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
                            class="w-7 h-7 flex-shrink-0 rounded-full bg-gradient-to-tr from-green-400 to-blue-500 flex items-center justify-center">
                            <span class="material-symbols-outlined text-black text-[14px]">smart_toy</span>
                        </div>
                        <div v-else
                            class="w-7 h-7 flex-shrink-0 rounded-full bg-primary flex items-center justify-center text-[9px] text-black font-bold">
                            YOU
                        </div>
                        <div class="max-w-[85%] p-3 rounded-xl text-sm"
                            :class="msg.sender === 'ai' ? 'bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 rounded-tl-none' : 'bg-primary/20 border border-primary/30 text-gray-900 dark:text-white rounded-tr-none'">
                            {{ msg.text }}
                        </div>
                    </div>
                    <div v-if="chatTyping" class="flex gap-2">
                        <div class="w-7 h-7 flex-shrink-0 rounded-full bg-gradient-to-tr from-green-400 to-blue-500 flex items-center justify-center">
                            <span class="material-symbols-outlined text-black text-[14px]">smart_toy</span>
                        </div>
                        <div class="bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 p-3 rounded-xl rounded-tl-none text-gray-400 text-sm">
                            <span class="inline-flex gap-1"><span class="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span><span class="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style="animation-delay:0.15s"></span><span class="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style="animation-delay:0.3s"></span></span>
                        </div>
                    </div>
                </div>

                <div class="p-3 border-t border-gray-200 dark:border-white/5 bg-gray-100 dark:bg-black/20">
                    <div class="flex gap-2">
                        <input v-model="chatInput" type="text" placeholder="Ask the AI agent..."
                            class="flex-1 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-full py-2 pl-4 pr-4 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-primary/50"
                            @keyup.enter="sendChat" />
                        <button @click="sendChat"
                            class="p-2 bg-primary rounded-full text-black hover:scale-105 transition-transform">
                            <span class="material-symbols-outlined text-[18px]">send</span>
                        </button>
                    </div>
                    <div class="flex gap-1 mt-2 flex-wrap">
                        <button v-for="chip in chatChips" :key="chip" @click="chatInput = chip; sendChat()"
                            class="text-[9px] bg-gray-50 dark:bg-white/5 hover:bg-white/10 text-gray-500 hover:text-gray-900 dark:text-white px-2 py-0.5 rounded-full transition-colors">{{ chip }}</button>
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
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div v-for="pred in delayPredictions" :key="pred.route"
                    class="p-4 rounded-xl border"
                    :class="pred.risk === 'High' ? 'bg-red-500/5 border-red-500/20' : pred.risk === 'Medium' ? 'bg-yellow-500/5 border-yellow-500/20' : 'bg-green-500/5 border-green-500/20'">
                    <div class="flex justify-between items-center mb-2">
                        <span class="text-gray-900 dark:text-white font-bold text-sm">{{ pred.route }}</span>
                        <span class="text-[10px] px-2 py-0.5 rounded-full font-bold"
                            :class="pred.risk === 'High' ? 'bg-red-500/20 text-red-400' : pred.risk === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'">
                            {{ pred.risk }} Risk
                        </span>
                    </div>
                    <div class="text-xs text-gray-400 mb-1">{{ pred.reason }}</div>
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
import { ref, computed, nextTick } from 'vue'
import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip)

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
    'Prioritize VIP orders for next 2 hours'
]

const chatChips = ['Driver status?', 'Overloaded routes?', 'Idle drivers?', 'SLA risk?']

const nlResponses = {
    'assign all downtown parcels to smallest van': 'Found 4 downtown parcels (ORD-9921, ORD-8843, ORD-5541, ORD-6654). Best vehicle: Van T-15 (Rachel Zane, 25% loaded, 6.8h remaining). Assigning now — estimated 32km round trip, 2.5h completion.',
    're-route zone b around highway closure': 'Highway closure detected on NH48 km 42-48. Rerouting 3 drivers (DRV-001, DRV-055, DRV-077) via Service Road → Ring Road alternative. Added 8km avg but saves 35min delay.',
    'show idle drivers near warehouse 3': '2 idle drivers found: DRV-103 (Louis Litt, Van T-20, 0% load, at Depot – 4.2km) and DRV-042 (Harvey Specter, Truck XL, 0% load, Downtown – 6.8km). Ready for immediate assignment.',
    'balance load across all active drivers': 'Current imbalance: Mike 95%, Jessica 87%, Rachel 25%, Louis 0%. Rebalancing: transferring 3 orders from Mike → Rachel, 2 from Jessica → Louis. New balance: 68% avg ±12%.',
    'prioritize vip orders for next 2 hours': '6 VIP orders identified for 14:00-16:00 window. Locking priority slots: ORD-9921 (Electronics), ORD-1102 (Furniture). Reassigning 2 standard orders to make capacity. VIP on-time probability: 98%.'
}

function executeNLCommand() {
    if (!nlCommand.value.trim() || nlProcessing.value) return
    nlProcessing.value = true
    nlResponse.value = ''
    const cmd = nlCommand.value.toLowerCase().trim()
    setTimeout(() => {
        nlResponse.value = nlResponses[cmd] || `Processing: "${nlCommand.value}". AI identified 3 matching drivers and 12 eligible orders. Recommended: Reassign 4 orders to DRV-042 (Tata Ace, 1.2T, 85% route overlap). Savings: 18km, 35 min.`
        nlProcessing.value = false
    }, 1200)
}

function togglePeak(type) {
    if (type === 'reallocation') { peakReallocation.value = !peakReallocation.value; peakToast.value = peakReallocation.value ? 'Dynamic reallocation enabled — queue will auto-sort during surges' : 'Dynamic reallocation disabled' }
    else if (type === 'shift') { shiftExtension.value = !shiftExtension.value; peakToast.value = shiftExtension.value ? 'Shift extension activated — drivers notified' : 'Shift extension disabled' }
    else if (type === 'vip') { vipLock.value = !vipLock.value; peakToast.value = vipLock.value ? 'VIP priority lock ON — 6 orders protected' : 'VIP priority lock removed' }
    setTimeout(() => { peakToast.value = '' }, 3000)
}

function applySuggestion(suggestion, actionLabel) {
    if (actionLabel === 'Ignore' || actionLabel === 'Review') return
    suggestion.applied = true
}

// Chart.js Demand Prediction
const demandChartData = computed(() => ({
    labels: ['Now', '+1h', '+2h', '+3h', '+4h', '+5h'],
    datasets: [{
        label: 'Predicted Orders',
        data: [12, 18, 28, 22, 16, 10],
        backgroundColor: [
            'rgba(59,130,246,0.3)', 'rgba(59,130,246,0.4)', 'rgba(239,68,68,0.5)',
            'rgba(59,130,246,0.5)', 'rgba(59,130,246,0.35)', 'rgba(59,130,246,0.2)'
        ],
        borderColor: 'rgba(59,130,246,0.6)',
        borderWidth: 1,
        borderRadius: 6,
    }]
}))

const demandChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { backgroundColor: '#111', titleColor: '#fff', bodyColor: '#ccc', padding: 10 } },
    scales: {
        x: { grid: { display: false }, ticks: { color: '#6b7280', font: { size: 10 } } },
        y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#6b7280', font: { size: 10 } }, beginAtZero: true }
    }
}

// Chat
const chatMessages = ref([
    { id: 1, sender: 'ai', text: 'Hello! I\'m your AI Dispatch Agent. Ask me anything about routes, drivers, load balancing, or delay predictions. I can also execute dispatch commands for you.' }
])

const aiChatResponses = {
    'driver status?': 'Currently 4 active drivers: Mike Ross (On Route, 95% load), Harvey Specter (Idle, 0% load), Rachel Zane (On Route, 25% load), Louis Litt (Offline). 1 driver needs break in 1.2h.',
    'overloaded routes?': 'Route 4 (South Zone) is overloaded — 18 stops, 145km, driver at 95% HOS. Recommend splitting 6 stops to DRV-091 (Rachel, 25% load, same zone). This would reduce Mike\'s ETA by 1.5h.',
    'idle drivers?': 'Louis Litt (DRV-103) has been idle for 2h at Depot. Harvey Specter (DRV-042) just completed. Both available for immediate dispatch. Suggested: assign Zone C pending orders to Louis.',
    'sla risk?': '3 orders at SLA risk: ORD-3321 (dispatch window missed, URGENT), ORD-7712 (ETA slipping, 45min overdue risk), ORD-2210 (HOS limit blocks driver). Immediate action required on ORD-3321.'
}

let chatId = 2
function sendChat() {
    if (!chatInput.value.trim()) return
    const userMsg = chatInput.value.trim()
    chatMessages.value.push({ id: chatId++, sender: 'user', text: userMsg })
    chatInput.value = ''
    chatTyping.value = true
    scrollChat()
    setTimeout(() => {
        const key = userMsg.toLowerCase()
        const response = aiChatResponses[key] || `Analyzing "${userMsg}"... Based on current fleet data: I found 3 relevant insights. The most impactful action would be to rebalance the ${userMsg.includes('route') ? 'affected routes' : 'driver workload'}. Would you like me to execute this optimization?`
        chatMessages.value.push({ id: chatId++, sender: 'ai', text: response })
        chatTyping.value = false
        scrollChat()
    }, 1500)
}

function scrollChat() {
    nextTick(() => {
        if (chatContainer.value) chatContainer.value.scrollTop = chatContainer.value.scrollHeight
    })
}

const suggestions = ref([
    {
        id: 1, title: 'Fuel Saving Opportunity', color: 'text-primary', applied: false,
        message: 'Driver <strong>Mike Ross</strong> is near Hub 2. Assigning <strong>Order #9921</strong> for pickup will save 12km detours later.',
        explanation: 'Mike\'s current route passes within 0.8km of Hub 2. Adding this pickup creates a 94% efficient loop vs. 67% if assigned to another driver.',
        confidence: 94,
        actions: [{ label: 'Apply Change', class: 'bg-primary/20 hover:bg-primary/30 text-primary' }]
    },
    {
        id: 2, title: 'Delay Prediction', color: 'text-yellow-400', applied: false,
        message: 'Traffic building up on Route 4. <strong>3 Drivers</strong> likely to miss 5pm window. Suggest rerouting to Route 7 (adds 5km but saves 20 mins).',
        explanation: 'Historical data shows Route 4 congestion peaks at 4:15 PM on weekdays. Route 7 alternative has 92% on-time rate for this time slot.',
        confidence: 88,
        actions: [
            { label: 'Reroute All', class: 'bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400' },
            { label: 'Ignore', class: 'bg-white/10 hover:bg-white/20 text-gray-900 dark:text-white' }
        ]
    },
    {
        id: 3, title: 'Load Imbalance Detected', color: 'text-orange-400', applied: false,
        message: 'Driver <strong>Rahul K.</strong> is at 95% capacity while <strong>Priya S.</strong> (same zone) is at 40%. Transfer 2 orders to balance.',
        explanation: 'Transferring ORD-4412 and ORD-4418 reduces Rahul\'s load to 72% and increases Priya\'s to 63%, equalizing ETAs.',
        confidence: 91,
        actions: [
            { label: 'Auto-Balance', class: 'bg-orange-500/20 hover:bg-orange-500/30 text-orange-400' },
            { label: 'Review', class: 'bg-white/10 hover:bg-white/20 text-gray-900 dark:text-white' }
        ]
    }
])

const delayPredictions = ref([
    { route: 'Route 4 – South Zone', risk: 'High', probability: 82, reason: 'Heavy traffic + road work on NH48', delay: '35–45 min', mitigated: false },
    { route: 'Route 7 – Downtown', risk: 'Medium', probability: 45, reason: 'Rain forecast after 3 PM', delay: '10–20 min', mitigated: false },
    { route: 'Route 1 – North Hub', risk: 'Low', probability: 12, reason: 'Clear roads, light traffic', delay: '0–5 min', mitigated: false }
])

function mitigateDelay(pred) {
    pred.mitigated = true
    pred.probability = Math.max(5, pred.probability - 30)
    if (pred.risk === 'High') pred.risk = 'Medium'
    else if (pred.risk === 'Medium') pred.risk = 'Low'
}
</script>
