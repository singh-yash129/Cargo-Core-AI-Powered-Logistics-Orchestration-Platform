<template>
    <div class="space-y-6">
        <!-- AI Performance Metrics -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <div v-for="stat in stats" :key="stat.label"
                class="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 p-4 md:p-6 rounded-xl flex items-center justify-between shadow-sm"
                :class="stat.highlight ? 'border-red-300 dark:border-red-500/30' : ''">
                <div>
                    <div class="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">{{ stat.label }}</div>
                    <div class="text-3xl font-bold text-gray-900 dark:text-white">{{ stat.value }}</div>
                    <div class="text-xs mt-1" :class="stat.trendColor">{{ stat.trend }}</div>
                </div>
                <div class="w-12 h-12 rounded-lg flex items-center justify-center" :class="stat.iconBg">
                    <span class="material-symbols-outlined" :class="stat.iconColor">{{ stat.icon }}</span>
                </div>
            </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Left Column (Live Chats & Feed) -->
            <div class="lg:col-span-2 space-y-6">
                <!-- Live Conversations Panel -->
                <div
                    class="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 p-6 rounded-xl shadow-sm">
                    <div class="flex items-center justify-between mb-6">
                        <h3 class="font-bold text-gray-900 dark:text-white text-lg flex items-center gap-2">
                            <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            Live Conversations
                        </h3>
                        <router-link to="/ai/live-conversations"
                            class="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-bold transition-colors">
                            View All Chats →
                        </router-link>
                    </div>

                    <div class="grid grid-cols-2 gap-4 mb-4">
                        <div
                            class="bg-gray-50 dark:bg-white/5 p-4 rounded-lg flex items-center justify-between border border-gray-100 dark:border-white/5">
                            <div>
                                <div class="text-2xl font-bold text-gray-900 dark:text-white">42</div>
                                <div class="text-xs text-gray-500 dark:text-gray-400">Active Chats</div>
                            </div>
                            <span class="material-symbols-outlined text-gray-400">chat</span>
                        </div>
                        <div
                            class="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 p-4 rounded-lg flex items-center justify-between">
                            <div>
                                <div class="text-2xl font-bold text-red-600 dark:text-red-400">5</div>
                                <div class="text-xs text-red-500/70 dark:text-red-300/70">Escalated Priority</div>
                            </div>
                            <span
                                class="material-symbols-outlined text-red-500 dark:text-red-400">notification_important</span>
                        </div>
                    </div>

                    <!-- Priority List -->
                    <div class="space-y-3">
                        <div v-for="chat in priorityChats" :key="chat.id"
                            class="p-3 bg-gray-50 dark:bg-white/5 rounded-lg border border-gray-100 dark:border-white/5 hover:border-purple-300 dark:hover:border-white/10 flex items-center justify-between cursor-pointer group transition-all">
                            <div class="flex items-center gap-3">
                                <div class="relative">
                                    <div
                                        class="w-10 h-10 rounded-full bg-gradient-to-br from-gray-200 dark:from-gray-700 to-gray-300 dark:to-gray-600 flex items-center justify-center text-xs font-bold text-gray-700 dark:text-white">
                                        {{ chat.initials }}
                                    </div>
                                    <span v-if="chat.status === 'angry'"
                                        class="absolute -top-1 -right-1 text-base">😡</span>
                                </div>
                                <div>
                                    <div
                                        class="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                        {{ chat.name }}
                                        <span v-if="chat.tag" :class="chat.tagClass"
                                            class="text-[10px] px-1.5 rounded uppercase">{{ chat.tag }}</span>
                                    </div>
                                    <div class="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[200px]">{{
                                        chat.lastMessage }}</div>
                                </div>
                            </div>
                            <div class="flex items-center gap-3">
                                <div class="text-right">
                                    <div class="text-[10px] text-gray-400">{{ chat.time }}</div>
                                    <div class="text-xs font-bold" :class="chat.sentimentColor">{{ chat.sentiment }}
                                    </div>
                                </div>
                                <router-link :to="`/ai/live-conversations?chatId=${chat.id}`"
                                    class="p-2 rounded-full bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 hover:bg-purple-600 hover:text-white dark:hover:bg-purple-500 dark:hover:text-white transition-colors">
                                    <span class="material-symbols-outlined text-sm">forum</span>
                                </router-link>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Live Operations Feed -->
                <div
                    class="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 p-6 rounded-xl shadow-sm">
                    <h3 class="font-bold text-gray-900 dark:text-white mb-4">Live Operations Feed</h3>
                    <div class="space-y-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                        <div v-for="event in feedEvents" :key="event.id"
                            class="flex gap-4 p-3 hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg transition-colors">
                            <div class="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                                :class="event.bgClass">
                                <span class="material-symbols-outlined text-sm" :class="event.textClass">{{ event.icon
                                }}</span>
                            </div>
                            <div>
                                <div class="text-sm font-bold text-gray-900 dark:text-white">{{ event.title }}</div>
                                <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">{{ event.desc }}</div>
                                <div class="text-[10px] text-gray-400">{{ event.time }}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Right Column (Sentiment & System Alerts) -->
            <div class="space-y-6">
                <!-- Sentiment Widget -->
                <div
                    class="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 p-6 rounded-xl text-center relative overflow-hidden shadow-sm">
                    <div class="absolute top-0 right-0 p-3 opacity-5">
                        <span class="material-symbols-outlined text-8xl text-gray-900 dark:text-white">mood</span>
                    </div>
                    <h3 class="font-bold text-gray-900 dark:text-white mb-6 relative z-10">Global Customer Sentiment
                    </h3>
                    <div class="space-y-6 text-left">
                        <div class="flex justify-between items-end">
                            <div>
                                <span
                                    class="text-5xl font-bold text-gray-900 dark:text-white block leading-none">87%</span>
                                <span
                                    class="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold tracking-widest mt-2 block">Overall
                                    Positive</span>
                            </div>
                            <div class="text-right">
                                <span
                                    class="text-xl font-bold text-gray-900 dark:text-white block leading-none">1.2k</span>
                                <span class="text-xs text-gray-500 dark:text-gray-400 block mt-1">Total Ratings</span>
                            </div>
                        </div>

                        <!-- Multi-segment bar -->
                        <div
                            class="w-full h-4 rounded-full overflow-hidden flex bg-gray-100 dark:bg-white/5 shadow-inner">
                            <div class="bg-green-500 h-full hover:bg-green-400 transition-colors cursor-pointer"
                                style="width: 87%" title="Positive: 87%"></div>
                            <div class="bg-yellow-500 h-full hover:bg-yellow-400 transition-colors cursor-pointer"
                                style="width: 10%" title="Neutral: 10%"></div>
                            <div class="bg-red-500 h-full hover:bg-red-400 transition-colors cursor-pointer"
                                style="width: 3%" title="Angry: 3%"></div>
                        </div>

                        <!-- Legend & Breakdown -->
                        <div class="grid grid-cols-3 gap-2 pt-2 border-t border-gray-100 dark:border-white/5">
                            <div
                                class="bg-green-50 dark:bg-green-500/10 p-2 rounded-lg border border-green-100 dark:border-green-500/20">
                                <div class="flex items-center gap-1.5 mb-1">
                                    <span class="w-2 h-2 rounded-full bg-green-500 shrink-0"></span>
                                    <span
                                        class="text-[10px] text-green-700 dark:text-green-400 font-bold uppercase truncate">Positive</span>
                                </div>
                                <div class="text-lg font-bold text-gray-900 dark:text-white">1,044</div>
                            </div>
                            <div
                                class="bg-yellow-50 dark:bg-yellow-500/10 p-2 rounded-lg border border-yellow-100 dark:border-yellow-500/20">
                                <div class="flex items-center gap-1.5 mb-1">
                                    <span class="w-2 h-2 rounded-full bg-yellow-500 shrink-0"></span>
                                    <span
                                        class="text-[10px] text-yellow-700 dark:text-yellow-400 font-bold uppercase truncate">Neutral</span>
                                </div>
                                <div class="text-lg font-bold text-gray-900 dark:text-white">120</div>
                            </div>
                            <div
                                class="bg-red-50 dark:bg-red-500/10 p-2 rounded-lg border border-red-100 dark:border-red-500/20">
                                <div class="flex items-center gap-1.5 mb-1">
                                    <span class="w-2 h-2 rounded-full bg-red-500 shrink-0"></span>
                                    <span
                                        class="text-[10px] text-red-700 dark:text-red-400 font-bold uppercase truncate">Angry</span>
                                </div>
                                <div class="text-lg font-bold text-gray-900 dark:text-white">36</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- System Alerts -->
                <div
                    class="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 p-6 rounded-xl shadow-sm">
                    <h3 class="font-bold text-gray-900 dark:text-white mb-4">System Alerts</h3>
                    <div class="space-y-3">
                        <div
                            class="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg">
                            <span class="material-symbols-outlined text-red-500 shrink-0">report_problem</span>
                            <div>
                                <div class="text-sm font-bold text-gray-900 dark:text-white">High Refund Volume</div>
                                <div class="text-xs text-red-500/80 dark:text-red-200/70">Unusual spike in refund
                                    requests in Region East-1.</div>
                            </div>
                        </div>
                        <div
                            class="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-500/10 border border-yellow-200 dark:border-yellow-500/20 rounded-lg">
                            <span class="material-symbols-outlined text-yellow-500 shrink-0">speed</span>
                            <div>
                                <div class="text-sm font-bold text-gray-900 dark:text-white">Latency Warning</div>
                                <div class="text-xs text-yellow-600/80 dark:text-yellow-200/70">AI response time
                                    increased by 200ms.</div>
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

const stats = ref([
    { label: 'Resolved by AI', value: '85%', trend: '↑ 12% vs last week', trendColor: 'text-green-600 dark:text-green-400', icon: 'smart_toy', iconBg: 'bg-purple-100 dark:bg-purple-500/20', iconColor: 'text-purple-600 dark:text-purple-400', highlight: false },
    { label: 'Avg. Response Time', value: '1.2s', trend: '⚡ Instant', trendColor: 'text-green-600 dark:text-green-400', icon: 'timer', iconBg: 'bg-blue-100 dark:bg-blue-500/20', iconColor: 'text-blue-600 dark:text-blue-400', highlight: false },
    { label: 'Bot Accuracy', value: '94.8%', trend: 'High Confidence', trendColor: 'text-green-600 dark:text-green-400', icon: 'check_circle', iconBg: 'bg-green-100 dark:bg-green-500/20', iconColor: 'text-green-600 dark:text-green-400', highlight: false },
    { label: 'Escalation Rate', value: '2.4%', trend: 'Requires Attention', trendColor: 'text-red-600 dark:text-red-400', icon: 'warning', iconBg: 'bg-red-100 dark:bg-red-500/20', iconColor: 'text-red-600 dark:text-red-400 animate-pulse', highlight: true },
])

const priorityChats = ref([
    { id: 1, name: 'Alice Smith', initials: 'AS', lastMessage: 'Where is my refund? It has been 5 days!', time: '2m ago', sentiment: 'Angry', sentimentColor: 'text-red-500', status: 'angry', tag: 'Escalated', tagClass: 'bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400' },
    { id: 2, name: 'John Doe', initials: 'JD', lastMessage: 'Driver is asking for extra tip, is this allowed?', time: '5m ago', sentiment: 'Concerned', sentimentColor: 'text-yellow-500', status: 'active', tag: 'Policy', tagClass: 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400' },
    { id: 3, name: 'Transport Co.', initials: 'TC', lastMessage: 'Bulk shipment #4421 delayed at customs.', time: '12m ago', sentiment: 'Neutral', sentimentColor: 'text-gray-400', status: 'active', tag: 'Delay', tagClass: 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-600 dark:text-yellow-400' },
])

const feedEvents = ref([
    { id: 1, title: 'Delivery Delayed', desc: 'Driver stuck in traffic on I-95. ETA updated +45m.', time: 'Just now', icon: 'schedule', bgClass: 'bg-yellow-100 dark:bg-yellow-500/20', textClass: 'text-yellow-600 dark:text-yellow-400' },
    { id: 2, title: 'Legal Threat Detected', desc: 'Chat #8821 detected keyword "lawyer". Escalated.', time: '2m ago', icon: 'gavel', bgClass: 'bg-red-100 dark:bg-red-500/20', textClass: 'text-red-600 dark:text-red-400' },
    { id: 3, title: 'Refund Approved', desc: 'Auto-refund of $50 approved for damaged item.', time: '15m ago', icon: 'currency_exchange', bgClass: 'bg-green-100 dark:bg-green-500/20', textClass: 'text-green-600 dark:text-green-400' },
    { id: 4, title: 'Bot Handover', desc: 'Bot successfully resolved inquiry #9921.', time: '22m ago', icon: 'smart_toy', bgClass: 'bg-purple-100 dark:bg-purple-500/20', textClass: 'text-purple-600 dark:text-purple-400' },
])
</script>
