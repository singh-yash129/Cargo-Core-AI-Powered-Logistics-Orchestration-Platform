<template>
    <div class="space-y-6">
        <div class="flex items-center gap-3">
            <div
                class="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-400 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
                <span class="material-symbols-outlined text-gray-900 dark:text-white">psychology</span>
            </div>
            <h2 class="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
                Smart WMS Intelligence</h2>
        </div>

        <!-- AI Chat Interface -->
        <div class="glass-panel rounded-xl overflow-hidden border border-purple-500/20">
            <div
                class="p-4 border-b border-gray-100 dark:border-white/5 bg-gradient-to-r from-purple-500/10 to-pink-500/10">
                <h3 class="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <span class="material-symbols-outlined text-purple-400">smart_toy</span>
                    AI Assistant — Ask me anything about your warehouse
                </h3>
            </div>
            <div class="p-4 h-64 overflow-y-auto space-y-3" ref="chatContainer">
                <div v-for="(msg, idx) in chatMessages" :key="idx" class="flex"
                    :class="msg.type === 'user' ? 'justify-end' : 'justify-start'">
                    <div class="max-w-[80%] p-3 rounded-lg text-sm"
                        :class="msg.type === 'user' ? 'bg-primary/20 text-primary border border-primary/20' : 'bg-gray-50 dark:bg-white/5 text-gray-700 dark:text-gray-200 border border-gray-100 dark:border-white/5'">
                        {{ msg.text }}
                    </div>
                </div>
            </div>
            <div class="p-4 border-t border-gray-100 dark:border-white/5 flex gap-3">
                <input v-model="chatInput" @keyup.enter="sendChat" type="text"
                    placeholder="Ask: 'Which aisle has free space?' or 'How many laborers are free at 3 PM?'"
                    class="flex-1 bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-lg p-3 text-gray-900 dark:text-white focus:outline-none focus:border-purple-500/50 text-sm" />
                <button @click="sendChat"
                    class="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-gray-900 dark:text-white px-5 py-3 rounded-lg font-bold transition-colors flex items-center gap-2">
                    <span class="material-symbols-outlined text-[18px]">send</span>
                </button>
            </div>
            <!-- Quick Queries -->
            <div class="px-4 pb-4 flex flex-wrap gap-2">
                <button v-for="q in quickQueries" :key="q" @click="chatInput = q; sendChat()"
                    class="bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 px-3 py-1.5 rounded-lg text-xs border border-purple-500/20 transition-colors">
                    {{ q }}
                </button>
            </div>
        </div>

        <!-- AI Insights Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div v-for="insight in aiInsights" :key="insight.title"
                class="glass-panel p-6 rounded-xl transition-colors cursor-pointer group"
                :class="`hover:border-${insight.color}-500/50`">
                <div class="flex items-start justify-between mb-4">
                    <div class="p-3 rounded-lg" :class="`bg-${insight.color}-500/20 text-${insight.color}-400`">
                        <span class="material-symbols-outlined">{{ insight.icon }}</span>
                    </div>
                    <div class="text-xs text-gray-500">{{ insight.confidence }}</div>
                </div>
                <h3 class="font-bold text-gray-900 dark:text-white mb-2 transition-colors"
                    :class="`group-hover:text-${insight.color}-400`">
                    {{ insight.title }}</h3>
                <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">{{ insight.description }}</p>
                <button @click="handleInsightAction(insight)"
                    class="w-full py-2 rounded text-sm font-bold transition-colors"
                    :class="`bg-${insight.color}-500/20 hover:bg-${insight.color}-500/30 text-${insight.color}-400`">
                    {{ insight.action }}
                </button>
            </div>
        </div>

        <!-- Tomorrow's Workload Prediction -->
        <div class="glass-panel p-6 rounded-xl border border-purple-500/10">
            <h3 class="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <span class="material-symbols-outlined text-purple-400">auto_graph</span>
                Tomorrow's Workload Prediction
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div
                    class="p-4 bg-gray-50 dark:bg-white/5 rounded-lg border border-gray-100 dark:border-white/5 text-center">
                    <div class="text-xs text-gray-600 dark:text-gray-400 uppercase mb-1">Expected Orders</div>
                    <div class="text-3xl font-bold text-gray-900 dark:text-white">48</div>
                    <div class="text-xs text-red-600 dark:text-red-400 mt-1">↑ 26% vs today</div>
                </div>
                <div
                    class="p-4 bg-gray-50 dark:bg-white/5 rounded-lg border border-gray-100 dark:border-white/5 text-center">
                    <div class="text-xs text-gray-600 dark:text-gray-400 uppercase mb-1">Staff Needed</div>
                    <div class="text-3xl font-bold text-blue-600 dark:text-blue-400">52</div>
                    <div class="text-xs text-yellow-600 dark:text-yellow-400 mt-1">+10 extra suggested</div>
                </div>
                <div
                    class="p-4 bg-gray-50 dark:bg-white/5 rounded-lg border border-gray-100 dark:border-white/5 text-center">
                    <div class="text-xs text-gray-600 dark:text-gray-400 uppercase mb-1">Peak Hours</div>
                    <div class="text-3xl font-bold text-orange-600 dark:text-orange-400">10-2</div>
                    <div class="text-xs text-gray-500 mt-1">High volume window</div>
                </div>
                <div
                    class="p-4 bg-gray-50 dark:bg-white/5 rounded-lg border border-gray-100 dark:border-white/5 text-center">
                    <div class="text-xs text-gray-600 dark:text-gray-400 uppercase mb-1">Dock Need</div>
                    <div class="text-3xl font-bold text-green-600 dark:text-green-400">5/6</div>
                    <div class="text-xs text-yellow-600 dark:text-yellow-400 mt-1">Near capacity</div>
                </div>
            </div>
            <div class="mt-4 flex gap-3">
                <button @click="autoScheduleStaff"
                    class="bg-purple-500/20 hover:bg-purple-500/30 text-purple-600 dark:text-purple-400 px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-2">
                    <span class="material-symbols-outlined text-[18px]">schedule</span> Auto-Schedule Extra Staff
                </button>
                <button @click="alertLogistics"
                    class="bg-gray-50 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:text-white px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-2">
                    <span class="material-symbols-outlined text-[18px]">notifications</span> Alert Logistics Manager
                </button>
            </div>
        </div>

        <!-- Toast -->
        <div v-if="toastMsg"
            class="fixed bottom-6 right-6 text-gray-900 dark:text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 z-50 animate-bounce"
            :class="toastClass">
            <span class="material-symbols-outlined">{{ toastIcon }}</span>
            <div class="font-bold">{{ toastMsg }}</div>
        </div>
    </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'

const chatInput = ref('')
const chatContainer = ref(null)

const quickQueries = [
    'Which aisle has free space?',
    'Which laborers are on-field?',
    'Do we have capacity for 5 more orders?',
    'Predict tomorrow\'s workload',
    'Suggest staff reallocation',
]

const chatMessages = ref([
    { type: 'ai', text: 'Hello! I\'m your Smart WMS assistant. Ask me about warehouse capacity, staff availability, aisle space, or workload predictions.' },
])

const aiResponses = {
    'which aisle has free space': 'Zone C, Aisle 18 has 55% free space. Zone A, Aisle 14 has 30% availability. Zone D, Aisle 01 has most capacity at 60% free.',
    'which laborers are on-field': 'Currently 2 laborers are on-field: Amit Singh and Ravi Kumar are both assigned to ORD-20251 (House Shift). Expected return by 2:00 PM.',
    'do we have capacity for 5 more orders': 'Current daily capacity is at 76% (38/50 orders). Adding 5 more orders would put us at 86%. Dock availability: 3/6 free. Labor: 12 available. Recommendation: Yes, but schedule carefully around peak hours.',
    'predict tomorrow\'s workload': 'Based on historical patterns and current pipeline: Expected 48 orders tomorrow (+26%). Peak period: 10 AM - 2 PM. Suggestion: Schedule 10 extra staff for morning shift and reserve all 6 dock bays.',
    'suggest staff reallocation': 'Current utilization: Picking 92%, Packing 85%, Receiving 78%, Returns 65%. Recommendation: Move 2 workers from Returns team to Receiving to balance workload and reduce ASN processing delays.',
}

async function sendChat() {
    if (!chatInput.value.trim()) return
    const userMsg = chatInput.value.trim()
    chatMessages.value.push({ type: 'user', text: userMsg })
    chatInput.value = ''

    await nextTick()

    const key = Object.keys(aiResponses).find(k => userMsg.toLowerCase().includes(k))
    const response = key ? aiResponses[key] : `I analyzed your query "${userMsg}". Based on current warehouse data: Operations are running at 87% efficiency. 42 staff active, 3 docks available. Would you like me to provide specific details?`

    setTimeout(() => {
        chatMessages.value.push({ type: 'ai', text: response })
        nextTick(() => {
            if (chatContainer.value) chatContainer.value.scrollTop = chatContainer.value.scrollHeight
        })
    }, 800)
}

const toastMsg = ref('')
const toastClass = ref('bg-green-500/90')
const toastIcon = ref('check_circle')

function showToast(msg, type = 'success') {
    toastMsg.value = msg
    toastClass.value = type === 'alert' ? 'bg-purple-500/90' : type === 'warning' ? 'bg-yellow-500/90' : 'bg-green-500/90'
    toastIcon.value = type === 'alert' ? 'notifications_active' : type === 'warning' ? 'warning' : 'check_circle'
    setTimeout(() => { toastMsg.value = '' }, 3000)
}

function handleInsightAction(insight) {
    chatMessages.value.push({ type: 'user', text: `Execute: ${insight.action}` })
    setTimeout(() => {
        chatMessages.value.push({ type: 'ai', text: `\u2705 ${insight.title} action initiated. ${insight.description} I've started processing this recommendation.` })
        nextTick(() => {
            if (chatContainer.value) chatContainer.value.scrollTop = chatContainer.value.scrollHeight
        })
    }, 600)
    showToast(`${insight.action} — initiated`, 'alert')
}

function autoScheduleStaff() {
    showToast('10 extra staff auto-scheduled for tomorrow morning shift', 'alert')
}

function alertLogistics() {
    showToast('Alert sent to Logistics Manager about tomorrow\'s workload spike', 'warning')
}

const aiInsights = ref([
    { title: 'Slotting Optimization', icon: 'inventory_2', color: 'purple', confidence: 'Confidence: 99%', description: 'Move "Winter Jackets" to Zone A (Near Dock) to reduce travel time by 15% for upcoming seasonal demand.', action: 'Optimize Layout' },
    { title: 'Predictive Staffing', icon: 'schedule', color: 'blue', confidence: 'Confidence: 92%', description: 'Inbound volume spike expected tomorrow at 10 AM. Schedule 2 extra forklift operators for Morning Shift.', action: 'Adjust Roster' },
    { title: 'Maintenance Alert', icon: 'warning', color: 'red', confidence: 'Risk: High', description: 'Conveyor Belt 3 showing irregular vibration patterns. Failure predicted within 48 hours.', action: 'Schedule Service' },
    { title: 'Capacity Check', icon: 'warehouse', color: 'green', confidence: 'Confidence: 95%', description: 'Zone B is at 98% capacity. 3 House Shift orders pending pickup. Suggest temporary overflow to Zone D.', action: 'Reallocate Stock' },
    { title: 'Visual Damage Assessment', icon: 'image_search', color: 'orange', confidence: 'AI Vision: Active', description: 'Automated damage detection flagged 2 items from returns batch #47 as potentially mislabeled. Review recommended.', action: 'Review Items' },
    { title: 'Staff Shift Suggestion', icon: 'swap_horiz', color: 'teal', confidence: 'Confidence: 88%', description: 'Returns team utilization at 65%. Consider moving 2 workers to Receiving to reduce ASN processing backlog.', action: 'Reassign Staff' },
])
</script>
