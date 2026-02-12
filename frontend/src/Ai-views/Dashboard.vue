<template>
    <div class="space-y-6">
        <!-- AI Performance Metrics -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <div class="glass-panel p-4 md:p-6 rounded-xl flex items-center justify-between">
                <div>
                    <div class="text-gray-400 text-sm font-medium mb-1">Resolved by AI</div>
                    <div class="text-3xl font-bold text-white">85%</div>
                    <div class="text-xs text-green-400 mt-1">↑ 12% vs last week</div>
                </div>
                <div class="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400">
                    <span class="material-symbols-outlined">smart_toy</span>
                </div>
            </div>
            <div class="glass-panel p-4 md:p-6 rounded-xl flex items-center justify-between">
                <div>
                    <div class="text-gray-400 text-sm font-medium mb-1">Avg. Response Time</div>
                    <div class="text-3xl font-bold text-white">1.2s</div>
                    <div class="text-xs text-green-400 mt-1">⚡ Instant</div>
                </div>
                <div class="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">
                    <span class="material-symbols-outlined">timer</span>
                </div>
            </div>
            <div class="glass-panel p-4 md:p-6 rounded-xl flex items-center justify-between">
                <div>
                    <div class="text-gray-400 text-sm font-medium mb-1">Bot Accuracy</div>
                    <div class="text-3xl font-bold text-white">94.8%</div>
                    <div class="text-xs text-green-400 mt-1">High Confidence</div>
                </div>
                <div class="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center text-green-400">
                    <span class="material-symbols-outlined">check_circle</span>
                </div>
            </div>
            <div class="glass-panel p-4 md:p-6 rounded-xl flex items-center justify-between border border-red-500/30">
                <div>
                    <div class="text-gray-400 text-sm font-medium mb-1">Escalation Rate</div>
                    <div class="text-3xl font-bold text-white">2.4%</div>
                    <div class="text-xs text-red-400 mt-1">Requires Attention</div>
                </div>
                <div
                    class="w-12 h-12 rounded-lg bg-red-500/20 flex items-center justify-center text-red-400 animate-pulse">
                    <span class="material-symbols-outlined">warning</span>
                </div>
            </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Left Column (Live Chats & Feed) -->
            <div class="lg:col-span-2 space-y-6">
                <!-- Live Conversations Panel -->
                <div class="glass-panel p-6 rounded-xl">
                    <div class="flex items-center justify-between mb-6">
                        <h3 class="font-bold text-white text-lg flex items-center gap-2">
                            <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            Live Conversations
                        </h3>
                        <button class="text-sm text-purple-400 hover:text-purple-300 font-bold">View All Chats</button>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <!-- Active Chats Card -->
                        <div class="bg-white/5 p-4 rounded-lg flex items-center justify-between">
                            <div>
                                <div class="text-2xl font-bold text-white">42</div>
                                <div class="text-xs text-gray-400">Active Chats</div>
                            </div>
                            <span class="material-symbols-outlined text-gray-500">chat</span>
                        </div>
                        <!-- Escalated Chats Card -->
                        <div
                            class="bg-red-500/10 border border-red-500/20 p-4 rounded-lg flex items-center justify-between">
                            <div>
                                <div class="text-2xl font-bold text-red-400">5</div>
                                <div class="text-xs text-red-300/70">Escalated Priority</div>
                            </div>
                            <span class="material-symbols-outlined text-red-400">notification_important</span>
                        </div>
                    </div>

                    <!-- Priority List -->
                    <div class="space-y-3">
                        <div v-for="chat in priorityChats" :key="chat.id"
                            class="p-3 bg-white/5 rounded-lg border border-white/5 hover:border-white/10 flex items-center justify-between cursor-pointer group transition-all">
                            <div class="flex items-center gap-3">
                                <div class="relative">
                                    <div
                                        class="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center text-xs font-bold text-white">
                                        {{ chat.initials }}
                                    </div>
                                    <span v-if="chat.status === 'angry'"
                                        class="absolute -top-1 -right-1 text-lg">😡</span>
                                </div>
                                <div>
                                    <div class="text-sm font-bold text-white flex items-center gap-2">
                                        {{ chat.name }}
                                        <span v-if="chat.tag" :class="chat.tagClass"
                                            class="text-[10px] px-1.5 rounded uppercase">{{ chat.tag }}</span>
                                    </div>
                                    <div class="text-xs text-gray-400 truncate max-w-[200px]">{{ chat.lastMessage }}
                                    </div>
                                </div>
                            </div>
                            <div class="flex items-center gap-4">
                                <div class="text-right">
                                    <div class="text-[10px] text-gray-500">{{ chat.time }}</div>
                                    <div class="text-xs font-bold" :class="chat.sentimentColor">{{ chat.sentiment }}
                                    </div>
                                </div>
                                <button
                                    class="p-2 rounded-full bg-purple-500/20 text-purple-400 hover:bg-purple-500 hover:text-white transition-colors">
                                    <span class="material-symbols-outlined text-sm">forum</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Live Operations Feed -->
                <div class="glass-panel p-6 rounded-xl">
                    <h3 class="font-bold text-white mb-4">Live Operations Feed</h3>
                    <div class="space-y-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                        <div v-for="event in feedEvents" :key="event.id"
                            class="flex gap-4 p-3 hover:bg-white/5 rounded-lg transition-colors">
                            <div class="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                                :class="event.bgClass">
                                <span class="material-symbols-outlined text-sm" :class="event.textClass">{{ event.icon
                                    }}</span>
                            </div>
                            <div>
                                <div class="text-sm font-bold text-white">{{ event.title }}</div>
                                <div class="text-xs text-gray-400 mb-1">{{ event.desc }}</div>
                                <div class="text-[10px] text-gray-500">{{ event.time }}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Right Column (Sentiment & Quick Scores) -->
            <div class="space-y-6">
                <!-- Sentiment Widget -->
                <div class="glass-panel p-6 rounded-xl text-center relative overflow-hidden">
                    <div class="absolute top-0 right-0 p-3 opacity-10">
                        <span class="material-symbols-outlined text-8xl">mood</span>
                    </div>
                    <h3 class="font-bold text-white mb-6 relative z-10">Global Customer Sentiment</h3>

                    <div class="relative w-48 h-48 mx-auto mb-6 flex items-center justify-center">
                        <!-- Simplified Circular Progress Placeholder -->
                        <div
                            class="w-full h-full rounded-full border-8 border-white/5 flex items-center justify-center relative">
                            <div
                                class="w-full h-full rounded-full border-8 border-t-green-500 border-r-green-500 border-b-transparent border-l-transparent absolute rotate-45">
                            </div>
                            <div class="text-center">
                                <span class="text-4xl font-bold text-white block">87%</span>
                                <span class="text-xs text-green-400 uppercase font-bold tracking-widest">Positive</span>
                            </div>
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-4 text-left">
                        <div class="bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                            <div class="text-xs text-red-300">Angry Users</div>
                            <div class="text-xl font-bold text-white">12</div>
                        </div>
                        <div class="bg-yellow-500/10 p-3 rounded-lg border border-yellow-500/20">
                            <div class="text-xs text-yellow-300">Neutral</div>
                            <div class="text-xl font-bold text-white">45</div>
                        </div>
                    </div>
                </div>

                <!-- System Alerts -->
                <div class="glass-panel p-6 rounded-xl">
                    <h3 class="font-bold text-white mb-4">System Alerts</h3>
                    <div class="space-y-3">
                        <div class="flex items-start gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                            <span class="material-symbols-outlined text-red-400 shrink-0">report_problem</span>
                            <div>
                                <div class="text-sm font-bold text-white">High Refund Volume</div>
                                <div class="text-xs text-red-200/70">Unusual spike in refund requests detected in Region
                                    East-1.</div>
                            </div>
                        </div>
                        <div class="flex items-start gap-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                            <span class="material-symbols-outlined text-yellow-400 shrink-0">speed</span>
                            <div>
                                <div class="text-sm font-bold text-white">Latency Warning</div>
                                <div class="text-xs text-yellow-200/70">AI response time increased by 200ms.</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'

const priorityChats = ref([
    { id: 1, name: 'Alice Smith', initials: 'AS', lastMessage: 'Where is my refund? It has been 5 days!', time: '2m ago', sentiment: 'Angry', sentimentColor: 'text-red-500', status: 'angry', tag: 'Escalated', tagClass: 'bg-red-500/20 text-red-400' },
    { id: 2, name: 'John Doe', initials: 'JD', lastMessage: 'Driver is asking for extra tip, is this allowed?', time: '5m ago', sentiment: 'Concerned', sentimentColor: 'text-yellow-500', status: 'active', tag: 'Policy', tagClass: 'bg-blue-500/20 text-blue-400' },
    { id: 3, name: 'Transport Co.', initials: 'TC', lastMessage: 'Bulk shipment #4421 delayed at customs.', time: '12m ago', sentiment: 'Neutral', sentimentColor: 'text-gray-400', status: 'active', tag: 'Delay', tagClass: 'bg-yellow-500/20 text-yellow-400' },
])

const feedEvents = ref([
    { id: 1, title: 'Delivery Delayed', desc: 'Driver stuck in traffic on I-95. ETA updated +45m.', time: 'Just now', icon: 'schedule', bgClass: 'bg-yellow-500/20', textClass: 'text-yellow-400' },
    { id: 2, title: 'Legal Threat Detected', desc: 'Chat #8821 detected keyword "lawyer". Escalated.', time: '2m ago', icon: 'gavel', bgClass: 'bg-red-500/20', textClass: 'text-red-400' },
    { id: 3, title: 'Refund Approved', desc: 'Auto-refund of $50 approved for damaged item.', time: '15m ago', icon: 'currency_exchange', bgClass: 'bg-green-500/20', textClass: 'text-green-400' },
    { id: 4, title: 'Bot Handover', desc: 'Bot successfully resolved inquiry #9921.', time: '22m ago', icon: 'smart_toy', bgClass: 'bg-purple-500/20', textClass: 'text-purple-400' },
])
</script>
