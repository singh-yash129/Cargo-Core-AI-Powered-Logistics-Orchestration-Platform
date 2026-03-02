<template>
    <div class="h-[calc(100vh-8rem)] flex flex-col md:flex-row gap-6">
        <!-- Chat List Sidebar -->
        <div
            class="w-full md:w-96 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-xl flex flex-col h-1/3 md:h-full shadow-sm">
            <div class="p-4 border-b border-gray-100 dark:border-white/5 space-y-3">
                <div class="flex items-center justify-between">
                    <h3 class="font-bold text-gray-900 dark:text-white">Active Chats</h3>
                    <div
                        class="bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400 px-2 py-1 rounded text-xs font-bold">
                        5 Escalated</div>
                </div>
                <div class="relative">
                    <input v-model="searchQuery" type="text" placeholder="Search conversations..."
                        class="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-purple-500 transition-colors">
                    <span class="material-symbols-outlined absolute left-3 top-2.5 text-gray-400 text-lg">search</span>
                </div>
                <div class="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                    <button v-for="f in chatFilters" :key="f" @click="activeFilter = f"
                        class="px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-colors"
                        :class="activeFilter === f
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10'">
                        {{ f }}
                    </button>
                </div>
            </div>

            <div class="flex-1 overflow-y-auto custom-scrollbar">
                <div v-for="chat in filteredChats" :key="chat.id"
                    class="p-4 border-b border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer transition-colors"
                    :class="selectedChat?.id === chat.id ? 'bg-purple-50 dark:bg-purple-500/10 border-l-4 border-l-purple-500' : ''"
                    @click="selectedChat = chat">
                    <div class="flex justify-between items-start mb-1">
                        <div class="flex items-center gap-2">
                            <span v-if="chat.status === 'urgent'"
                                class="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0"></span>
                            <span class="font-bold text-gray-900 dark:text-white text-sm">{{ chat.name }}</span>
                        </div>
                        <span class="text-[10px] text-gray-400">{{ chat.time }}</span>
                    </div>
                    <p class="text-xs text-gray-500 dark:text-gray-400 truncate mb-2">{{ chat.lastMessage }}</p>
                    <div class="flex gap-2">
                        <span v-if="chat.sentiment === 'Negative'"
                            class="px-1.5 py-0.5 rounded bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400 text-[10px]">Negative</span>
                        <span v-if="chat.botActive"
                            class="px-1.5 py-0.5 rounded bg-purple-100 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400 text-[10px]">Bot
                            Active</span>
                    </div>
                </div>
                <div v-if="filteredChats.length === 0" class="p-6 text-center text-gray-400 text-sm">
                    No conversations match your filter.
                </div>
            </div>
        </div>

        <!-- Main Chat Area -->
        <div
            class="flex-1 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-xl flex flex-col h-2/3 md:h-full relative overflow-hidden shadow-sm">
            <div v-if="selectedChat" class="flex flex-col h-full">
                <!-- Header -->
                <div
                    class="p-4 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-gray-50 dark:bg-black/20">
                    <div class="flex items-center gap-3">
                        <div
                            class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                            {{ selectedChat.initials }}
                        </div>
                        <div>
                            <div class="font-bold text-gray-900 dark:text-white">{{ selectedChat.name }}</div>
                            <div class="text-xs text-gray-500 dark:text-gray-400">Order #{{ selectedChat.orderId }}
                            </div>
                        </div>
                    </div>
                    <div class="flex gap-2">
                        <button v-if="selectedChat.botActive" @click="takeOver"
                            class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg text-sm flex items-center gap-2 transition-colors">
                            <span class="material-symbols-outlined text-sm">front_hand</span>
                            <span class="hidden sm:inline">Take Over</span>
                        </button>
                        <button @click="showCustomerProfile = true"
                            class="p-2 border border-gray-200 dark:border-white/10 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                            title="View Profile">
                            <span class="material-symbols-outlined">person</span>
                        </button>
                        <button @click="escalateChat"
                            class="p-2 border border-gray-200 dark:border-white/10 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                            title="Escalate">
                            <span class="material-symbols-outlined">warning</span>
                        </button>
                    </div>
                </div>

                <!-- Messages -->
                <div class="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-gray-50/50 dark:bg-black/10">
                    <!-- Sentiment Alert Overlay -->
                    <div v-if="selectedChat.sentiment === 'Negative'"
                        class="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 p-3 rounded-lg flex items-start gap-3 mb-4 max-w-lg mx-auto">
                        <span class="material-symbols-outlined text-red-500 shrink-0">warning</span>
                        <div>
                            <div class="text-sm font-bold text-red-600 dark:text-red-400">Negative Sentiment Detected
                            </div>
                            <div class="text-xs text-red-500/70 dark:text-red-300/70">User is expressing frustration.
                                Recommended: Offer discount or expedite.</div>
                        </div>
                    </div>

                    <div v-for="msg in selectedChat.messages" :key="msg.id" class="flex gap-3"
                        :class="msg.isSupport ? 'flex-row-reverse' : ''">
                        <div class="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                            :class="msg.isSupport ? (msg.isBot ? 'bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400' : 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400') : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'">
                            <span class="material-symbols-outlined text-xs">{{ msg.isSupport ? (msg.isBot ?
                                'smart_toy' : 'support_agent') : 'person' }}</span>
                        </div>
                        <div class="max-w-[70%]">
                            <div class="p-3 rounded-2xl text-sm shadow-sm"
                                :class="msg.isSupport ? 'bg-purple-600 text-white rounded-tr-none' : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 rounded-tl-none border border-gray-100 dark:border-white/5'">
                                {{ msg.text }}
                            </div>
                            <div class="text-[10px] text-gray-400 mt-1" :class="msg.isSupport ? 'text-right' : ''">{{
                                msg.time }}</div>
                        </div>
                    </div>
                </div>

                <!-- Input Area -->
                <div class="p-4 border-t border-gray-100 dark:border-white/5 bg-white dark:bg-black/20">
                    <div class="flex gap-2 mb-2 overflow-x-auto custom-scrollbar pb-1" ref="suggestionsContainer"
                        @wheel.prevent="scrollSuggestions"
                        style="scrollbar-width: none; max-width: calc(100vw - 48vw)   ;">
                        <button v-for="suggestion in suggestions" :key="suggestion" @click="inputText = suggestion"
                            class="text-xs bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 px-3 py-1.5 rounded-full text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-white/5 whitespace-nowrap transition-colors flex-shrink-0">
                            {{ suggestion }}
                        </button>
                    </div>
                    <div class="relative">
                        <input v-model="inputText" type="text" placeholder="Type a message..."
                            @keyup.enter="sendMessage"
                            class="w-full bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl pl-4 pr-12 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-purple-500 transition-colors">
                        <button @click="sendMessage"
                            class="absolute right-2 top-2 p-1.5 bg-purple-600 hover:bg-purple-700 rounded-lg text-white transition-colors">
                            <span class="material-symbols-outlined text-sm">send</span>
                        </button>
                    </div>
                </div>
            </div>

            <div v-else class="flex flex-col items-center justify-center h-full text-center p-8">
                <div class="w-16 h-16 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-4">
                    <span class="material-symbols-outlined text-4xl text-gray-400">chat_bubble_outline</span>
                </div>
                <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">Select a Conversation</h3>
                <p class="max-w-xs text-gray-500 dark:text-gray-400">Choose a chat from the sidebar to view details,
                    take over from AI, or
                    manage escalation.</p>
            </div>
        </div>

        <!-- Customer Profile Modal -->
        <Teleport to="body">
            <div v-if="showCustomerProfile"
                class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                @click.self="showCustomerProfile = false">
                <div
                    class="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md shadow-2xl border border-gray-100 dark:border-white/10 overflow-hidden">
                    <div class="p-6 border-b border-gray-100 dark:border-white/5 flex justify-between">
                        <h3 class="text-xl font-bold text-gray-900 dark:text-white">Customer Profile</h3>
                        <button @click="showCustomerProfile = false" class="text-gray-400 hover:text-gray-600"><span
                                class="material-symbols-outlined">close</span></button>
                    </div>
                    <div class="p-6 space-y-4" v-if="selectedChat">
                        <div class="flex items-center gap-4">
                            <div
                                class="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                                {{ selectedChat.initials }}
                            </div>
                            <div>
                                <h4 class="text-xl font-bold text-gray-900 dark:text-white">{{ selectedChat.name }}
                                </h4>
                                <p class="text-gray-500">Order: #{{ selectedChat.orderId }}</p>
                            </div>
                        </div>
                        <div class="grid grid-cols-2 gap-3">
                            <div class="p-3 bg-gray-50 dark:bg-white/5 rounded-lg">
                                <div class="text-xs text-gray-500 mb-1">Sentiment</div>
                                <div class="font-bold text-sm"
                                    :class="selectedChat.sentiment === 'Negative' ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'">
                                    {{ selectedChat.sentiment }}</div>
                            </div>
                            <div class="p-3 bg-gray-50 dark:bg-white/5 rounded-lg">
                                <div class="text-xs text-gray-500 mb-1">Status</div>
                                <div class="font-bold text-sm text-gray-900 dark:text-white">{{ selectedChat.status ===
                                    'urgent' ? 'Urgent' : 'Active' }}</div>
                            </div>
                        </div>
                    </div>
                    <div class="p-6 border-t border-gray-100 dark:border-white/5">
                        <button @click="showCustomerProfile = false"
                            class="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-colors">
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </Teleport>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const selectedChat = ref(null)
const searchQuery = ref('')
const activeFilter = ref('All')
const inputText = ref('')
const showCustomerProfile = ref(false)

const chatFilters = ['All', 'Angry 😡', 'Bot Active', 'Escalated']

const suggestionsContainer = ref(null)

const suggestions = [
    'I apologize for the delay.',
    'Let me check the status for you.',
    'I will escalate this to my supervisor.',
    'Your refund has been processed.',
    'Could you please provide your tracking number?',
    'Our driver encountered unexpected traffic.',
    'Can I help you with anything else today?',
    'Thank you for your patience.',
]

function scrollSuggestions(e) {
    if (suggestionsContainer.value) {
        // Support normal scroll wheel (deltaY) and trackpad horizontal swipe (deltaX)
        const scrollAmount = e.deltaX !== 0 ? e.deltaX : e.deltaY;
        suggestionsContainer.value.scrollLeft += scrollAmount;
    }
}

const chats = ref([
    {
        id: 1, name: 'Alice Smith', initials: 'AS', orderId: 'MV-9021', time: '2m ago',
        lastMessage: 'Where is my refund? It has been 5 days!',
        sentiment: 'Negative', status: 'urgent', botActive: false,
        messages: [
            { id: 1, text: 'Hello, I have not received my refund yet.', time: '10:30 AM', isSupport: false },
            { id: 2, text: 'I understand your frustration. Let me check the status for you.', time: '10:30 AM', isSupport: true, isBot: true },
            { id: 3, text: 'Where is my refund? It has been 5 days!', time: '10:31 AM', isSupport: false },
        ]
    },
    {
        id: 2, name: 'John Doe', initials: 'JD', orderId: 'MV-8821', time: '5m ago',
        lastMessage: 'Driver is asking for extra tip, is this allowed?',
        sentiment: 'Neutral', status: 'active', botActive: true,
        messages: [
            { id: 1, text: 'Hi, quick question about the driver.', time: '10:15 AM', isSupport: false },
            { id: 2, text: 'Hello John! How can I assist you today?', time: '10:15 AM', isSupport: true, isBot: true },
            { id: 3, text: 'Driver is asking for extra tip, is this allowed?', time: '10:16 AM', isSupport: false },
        ]
    },
    {
        id: 3, name: 'Transport Co.', initials: 'TC', orderId: 'BK-4421', time: '12m ago',
        lastMessage: 'Bulk shipment #4421 delayed at customs.',
        sentiment: 'Neutral', status: 'active', botActive: true,
        messages: [
            { id: 1, text: 'Bulk shipment #4421 delayed at customs.', time: '09:55 AM', isSupport: false },
            { id: 2, text: 'I\'m looking into this now. Customs clearance can take 24-48 hours.', time: '09:56 AM', isSupport: true, isBot: true },
        ]
    },
])

const filteredChats = computed(() => {
    let result = chats.value
    if (activeFilter.value === 'Angry 😡') result = result.filter(c => c.sentiment === 'Negative')
    else if (activeFilter.value === 'Bot Active') result = result.filter(c => c.botActive)
    else if (activeFilter.value === 'Escalated') result = result.filter(c => c.status === 'urgent')
    if (searchQuery.value) {
        const q = searchQuery.value.toLowerCase()
        result = result.filter(c => c.name.toLowerCase().includes(q) || c.lastMessage.toLowerCase().includes(q))
    }
    return result
})

const selectChatById = () => {
    if (route.query.chatId) {
        const chat = chats.value.find(c => c.id === parseInt(route.query.chatId))
        if (chat) {
            selectedChat.value = chat
            return
        }
    }
    selectedChat.value = chats.value[0]
}

onMounted(() => {
    selectChatById()
})

watch(() => route.query.chatId, () => {
    selectChatById()
})

function sendMessage() {
    if (!inputText.value.trim() || !selectedChat.value) return
    const now = new Date()
    selectedChat.value.messages.push({
        id: Date.now(),
        text: inputText.value,
        time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isSupport: true,
        isBot: false
    })
    inputText.value = ''
}

function takeOver() {
    if (selectedChat.value) {
        selectedChat.value.botActive = false
    }
}

function escalateChat() {
    if (selectedChat.value) {
        selectedChat.value.status = 'urgent'
        selectedChat.value.sentiment = 'Negative'
    }
}
</script>
