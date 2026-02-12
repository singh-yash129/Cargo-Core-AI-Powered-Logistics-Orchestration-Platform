<template>
    <div class="h-[calc(100vh-8rem)] flex flex-col md:flex-row gap-6">
        <!-- Chat List Sidebar -->
        <div class="w-full md:w-96 glass-panel rounded-xl flex flex-col h-1/3 md:h-full">
            <div class="p-4 border-b border-white/5 space-y-4">
                <div class="flex items-center justify-between">
                    <h3 class="font-bold text-white">Active Chats</h3>
                    <div class="bg-red-500/20 text-red-400 px-2 py-1 rounded text-xs font-bold">5 Escalated</div>
                </div>
                <div class="relative">
                    <input type="text" placeholder="Search conversations..."
                        class="w-full bg-black/20 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500/50">
                    <span class="material-symbols-outlined absolute left-3 top-2.5 text-gray-500 text-lg">search</span>
                </div>
                <div class="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                    <button
                        class="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs font-bold whitespace-nowrap">All</button>
                    <button
                        class="px-3 py-1 bg-white/5 text-gray-400 hover:bg-white/10 rounded-full text-xs font-bold whitespace-nowrap">Angry
                        😡</button>
                    <button
                        class="px-3 py-1 bg-white/5 text-gray-400 hover:bg-white/10 rounded-full text-xs font-bold whitespace-nowrap">Bot
                        Active</button>
                </div>
            </div>

            <div class="flex-1 overflow-y-auto custom-scrollbar">
                <div v-for="chat in chats" :key="chat.id"
                    class="p-4 border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors"
                    :class="selectedChat?.id === chat.id ? 'bg-white/5 border-l-4 border-l-purple-500' : ''"
                    @click="selectedChat = chat">
                    <div class="flex justify-between items-start mb-1">
                        <div class="flex items-center gap-2">
                            <span v-if="chat.status === 'urgent'"
                                class="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                            <span class="font-bold text-white text-sm">{{ chat.name }}</span>
                        </div>
                        <span class="text-[10px] text-gray-500">{{ chat.time }}</span>
                    </div>
                    <p class="text-xs text-gray-400 truncate mb-2">{{ chat.lastMessage }}</p>
                    <div class="flex gap-2">
                        <span v-if="chat.sentiment === 'Negative'"
                            class="px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 text-[10px]">Negative</span>
                        <span v-if="chat.botActive"
                            class="px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 text-[10px]">Bot Active</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Main Chat Area -->
        <div class="flex-1 glass-panel rounded-xl flex flex-col h-2/3 md:h-full relative overflow-hidden">
            <div v-if="selectedChat" class="flex flex-col h-full">
                <!-- Header -->
                <div class="p-4 border-b border-white/5 flex justify-between items-center bg-black/20">
                    <div class="flex items-center gap-3">
                        <div
                            class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                            {{ selectedChat.initials }}
                        </div>
                        <div>
                            <div class="font-bold text-white">{{ selectedChat.name }}</div>
                            <div class="text-xs text-gray-400">Order #{{ selectedChat.orderId }}</div>
                        </div>
                    </div>
                    <div class="flex gap-2">
                        <button
                            class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg text-sm flex items-center gap-2 transition-colors">
                            <span class="material-symbols-outlined text-sm">front_hand</span> Take Over
                        </button>
                        <button
                            class="p-2 border border-white/10 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white"
                            title="View Profile">
                            <span class="material-symbols-outlined">person</span>
                        </button>
                        <button
                            class="p-2 border border-white/10 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white"
                            title="More Options">
                            <span class="material-symbols-outlined">more_vert</span>
                        </button>
                    </div>
                </div>

                <!-- Messages -->
                <div class="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-black/10">
                    <!-- Sentiment Alert Overlay -->
                    <div v-if="selectedChat.sentiment === 'Negative'"
                        class="bg-red-500/10 border border-red-500/20 p-3 rounded-lg flex items-start gap-3 mb-4 mx-auto max-w-lg">
                        <span class="material-symbols-outlined text-red-500">warning</span>
                        <div>
                            <div class="text-sm font-bold text-red-400">Negative Sentiment Detected</div>
                            <div class="text-xs text-red-300/70">User is expressing frustration about delivery delay.
                                Recommended action: Offer discount or expedite.</div>
                        </div>
                    </div>

                    <div v-for="msg in selectedChat.messages" :key="msg.id" class="flex gap-3"
                        :class="msg.isSupport ? 'flex-row-reverse' : ''">
                        <div class="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                            :class="msg.isSupport ? (msg.isBot ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400') : 'bg-gray-700 text-gray-300'">
                            <span class="material-symbols-outlined text-xs">{{ msg.isSupport ? (msg.isBot ? 'smart_toy'
                                : 'support_agent') : 'person' }}</span>
                        </div>
                        <div class="max-w-[70%]">
                            <div class="p-3 rounded-2xl text-sm"
                                :class="msg.isSupport ? 'bg-blue-600/20 text-white rounded-tr-none border border-blue-500/20' : 'bg-gray-800 text-gray-200 rounded-tl-none'">
                                {{ msg.text }}
                            </div>
                            <div class="text-[10px] text-gray-500 mt-1" :class="msg.isSupport ? 'text-right' : ''">{{
                                msg.time }}</div>
                        </div>
                    </div>
                </div>

                <!-- Input Area -->
                <div class="p-4 border-t border-white/5 bg-black/20">
                    <div class="flex gap-2 mb-2 overflow-x-auto no-scrollbar">
                        <button
                            class="text-xs bg-white/5 hover:bg-white/10 px-3 py-1 rounded-full text-gray-300 border border-white/5 whitespace-nowrap">Suggest:
                            "I apologize for the delay..."</button>
                        <button
                            class="text-xs bg-white/5 hover:bg-white/10 px-3 py-1 rounded-full text-gray-300 border border-white/5 whitespace-nowrap">Suggest:
                            "Let me check the status..."</button>
                    </div>
                    <div class="relative">
                        <input type="text" placeholder="Type a message..."
                            class="w-full bg-black/40 border border-white/10 rounded-xl pl-4 pr-12 py-3 text-white focus:outline-none focus:border-purple-500/50">
                        <button
                            class="absolute right-2 top-2 p-1.5 bg-purple-600 hover:bg-purple-700 rounded-lg text-white transition-colors">
                            <span class="material-symbols-outlined text-sm">send</span>
                        </button>
                    </div>
                </div>
            </div>

            <div v-else class="flex flex-col items-center justify-center h-full text-center text-gray-500 p-8">
                <div class="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                    <span class="material-symbols-outlined text-4xl">chat_bubble_outline</span>
                </div>
                <h3 class="text-xl font-bold text-white mb-2">Select a Conversation</h3>
                <p class="max-w-xs">Choose a chat from the sidebar to view details, take over from AI, or manage
                    escalation.</p>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'

const selectedChat = ref(null)

const chats = ref([
    {
        id: 1,
        name: 'Alice Smith',
        initials: 'AS',
        orderId: 'MV-9021',
        time: '2m ago',
        lastMessage: 'Where is my refund? It has been 5 days!',
        sentiment: 'Negative',
        status: 'urgent',
        botActive: false,
        messages: [
            { id: 1, text: 'Hello, I have not received my refund yet.', time: '10:30 AM', isSupport: false },
            { id: 2, text: 'I understand your frustration. Let me check the status for you.', time: '10:30 AM', isSupport: true, isBot: true },
            { id: 3, text: 'Where is my refund? It has been 5 days!', time: '10:31 AM', isSupport: false },
        ]
    },
    {
        id: 2,
        name: 'John Doe',
        initials: 'JD',
        orderId: 'MV-8821',
        time: '5m ago',
        lastMessage: 'Driver is asking for extra tip, is this allowed?',
        sentiment: 'Neutral',
        status: 'active',
        botActive: true,
        messages: [
            { id: 1, text: 'Hi, quick question about the driver.', time: '10:15 AM', isSupport: false },
            { id: 2, text: 'Hello John! How can I assist you today?', time: '10:15 AM', isSupport: true, isBot: true },
        ]
    },
    // Add more dummy chats...
])

// Select first chat by default for demo
selectedChat.value = chats.value[0]
</script>
