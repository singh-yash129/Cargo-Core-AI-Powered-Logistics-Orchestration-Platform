<template>
    <div class="space-y-6">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                <h2 class="text-2xl font-bold text-gray-900 dark:text-white">AI Performance Analytics</h2>
                <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Real-time insights into AI support performance
                </p>
            </div>
            <div class="flex gap-2">
                <button v-for="range in timeRanges" :key="range" @click="activeRange = range"
                    class="px-3 py-1.5 text-xs font-bold rounded-lg transition-colors"
                    :class="activeRange === range
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10'">
                    {{ range }}
                </button>
            </div>
        </div>

        <!-- Top Metrics -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            <div v-for="metric in metrics" :key="metric.label"
                class="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 p-4 md:p-6 rounded-xl shadow-sm">
                <div class="text-gray-500 dark:text-gray-400 text-sm mb-1">{{ metric.label }}</div>
                <div class="text-3xl font-bold text-gray-900 dark:text-white">{{ metric.value }}</div>
                <div class="text-xs mt-1"
                    :class="metric.trend.startsWith('↑') ? 'text-green-600 dark:text-green-400' : metric.trend.startsWith('↓') ? 'text-green-600 dark:text-green-400' : 'text-gray-500'">
                    {{ metric.trend }}
                </div>
            </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Sentiment Trend Chart -->
            <div
                class="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 p-6 rounded-xl min-h-[300px] flex flex-col shadow-sm">
                <h3 class="font-bold text-gray-900 dark:text-white mb-6">Sentiment Trends (Last 7 Days)</h3>
                <div class="flex-1 flex items-end gap-2 pb-4 relative">
                    <div class="absolute inset-0 flex flex-col justify-between pointer-events-none">
                        <div class="border-t border-gray-100 dark:border-white/5 w-full"></div>
                        <div class="border-t border-gray-100 dark:border-white/5 w-full"></div>
                        <div class="border-t border-gray-100 dark:border-white/5 w-full"></div>
                        <div class="border-t border-gray-100 dark:border-white/5 w-full"></div>
                    </div>
                    <div v-for="(bar, i) in sentimentBars" :key="i"
                        class="flex-1 bg-green-400/60 dark:bg-green-500/50 hover:bg-green-500 dark:hover:bg-green-500/80 transition-colors rounded-t-sm cursor-pointer relative"
                        :style="{ height: bar.pct + '%' }" :title="bar.day + ': ' + bar.pct + '%'">
                        <div
                            class="absolute -top-7 left-1/2 -translate-x-1/2 text-[10px] text-gray-500 dark:text-gray-400 font-bold opacity-0 hover:opacity-100 whitespace-nowrap">
                            {{ bar.pct }}%</div>
                    </div>
                </div>
                <div class="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2 px-1">
                    <span v-for="bar in sentimentBars" :key="bar.day">{{ bar.day }}</span>
                </div>
            </div>

            <!-- Escalation Reasons -->
            <div
                class="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 p-6 rounded-xl min-h-[300px] shadow-sm">
                <h3 class="font-bold text-gray-900 dark:text-white mb-6">Top Escalation Reasons</h3>
                <div class="space-y-4">
                    <div v-for="reason in escalationReasons" :key="reason.label">
                        <div class="flex justify-between text-sm mb-1">
                            <span class="text-gray-900 dark:text-white font-medium">{{ reason.label }}</span>
                            <span class="text-gray-500 dark:text-gray-400 font-bold">{{ reason.pct }}%</span>
                        </div>
                        <div class="w-full bg-gray-100 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                            <div class="h-full rounded-full transition-all duration-500" :class="reason.color"
                                :style="{ width: reason.pct + '%' }"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- AI Insights -->
        <div class="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 p-6 rounded-xl shadow-sm">
            <h3 class="font-bold text-gray-900 dark:text-white mb-4">AI Recommendations</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div v-for="insight in insights" :key="insight.title" class="p-4 rounded-xl border flex gap-3"
                    :class="insight.classes">
                    <span class="material-symbols-outlined mt-1" :class="insight.iconColor">{{ insight.icon }}</span>
                    <div>
                        <h4 class="font-bold" :class="insight.titleColor">{{ insight.title }}</h4>
                        <p class="text-sm mt-1" :class="insight.textColor">{{ insight.text }}</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'

const activeRange = ref('7D')
const timeRanges = ['7D', '30D', '90D']

const metrics = [
    { label: 'Total Conversations', value: '1,248', trend: '↑ 15% vs last week' },
    { label: 'Bot Resolution Rate', value: '82.4%', trend: '↑ 2.1% improvement' },
    { label: 'Avg. Handle Time', value: '45s', trend: '↓ 12s faster' },
    { label: 'Estimated Savings', value: '$12.5k', trend: 'Based on agent rate' },
]

const sentimentBars = ref([
    { day: 'Mon', pct: 60 }, { day: 'Tue', pct: 75 }, { day: 'Wed', pct: 65 },
    { day: 'Thu', pct: 40 }, { day: 'Fri', pct: 80 }, { day: 'Sat', pct: 85 }, { day: 'Sun', pct: 90 }
])

const escalationReasons = [
    { label: 'Refund Dispute', pct: 42, color: 'bg-red-500' },
    { label: 'Late Delivery', pct: 28, color: 'bg-yellow-500' },
    { label: 'Damaged Item', pct: 15, color: 'bg-orange-500' },
    { label: 'Driver Conduct', pct: 10, color: 'bg-blue-500' },
    { label: 'Other', pct: 5, color: 'bg-gray-400' },
]

const insights = [
    {
        icon: 'lightbulb', title: 'Optimize Refund Policy', iconColor: 'text-purple-600 dark:text-purple-400',
        text: 'High volume of small refund requests (< $10). Enabling auto-approve for this tier could save 5 hours of manual review weekly.',
        classes: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-500/20',
        titleColor: 'text-purple-700 dark:text-purple-300', textColor: 'text-purple-600/80 dark:text-purple-300/70'
    },
    {
        icon: 'trending_up', title: 'Traffic Alert Impact', iconColor: 'text-blue-600 dark:text-blue-400',
        text: 'New traffic prediction model reduced inbound "Where is my order" calls by 40% after proactive notifications.',
        classes: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-500/20',
        titleColor: 'text-blue-700 dark:text-blue-300', textColor: 'text-blue-600/80 dark:text-blue-300/70'
    },
]
</script>
