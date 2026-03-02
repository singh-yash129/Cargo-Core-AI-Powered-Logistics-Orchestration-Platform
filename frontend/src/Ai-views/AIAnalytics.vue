<template>
    <div class="space-y-6">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                <h2 class="text-2xl font-bold text-gray-900 dark:text-white">AI Performance Analytics</h2>
                <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Real-time insights into AI support efficiency
                    and customer sentiment</p>
            </div>
            <div class="flex gap-2 bg-gray-100 dark:bg-white/5 p-1 rounded-lg">
                <button v-for="range in timeRanges" :key="range" @click="activeRange = range"
                    class="px-4 py-1.5 text-xs font-bold rounded-md transition-all" :class="activeRange === range
                        ? 'bg-white dark:bg-gray-800 text-purple-600 dark:text-purple-400 shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'">
                    {{ range }}
                </button>
            </div>
        </div>

        <!-- Top Metrics -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            <div v-for="metric in metrics" :key="metric.label"
                class="bg-white dark:bg-black/20 border border-gray-100 dark:border-white/5 p-4 md:p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div class="flex items-center gap-2 mb-3">
                    <span class="p-2 rounded-lg bg-gray-50 dark:bg-white/5 flex items-center justify-center">
                        <span class="material-symbols-outlined text-gray-600 dark:text-gray-300 text-[18px]">{{
                            metric.icon }}</span>
                    </span>
                    <div class="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider">{{
                        metric.label }}</div>
                </div>
                <div class="text-3xl font-bold text-gray-900 dark:text-white">{{ metric.value }}</div>
                <div class="text-xs mt-2 flex items-center gap-1 font-bold"
                    :class="metric.trend.startsWith('+') ? 'text-green-600 dark:text-green-400' : (metric.trend.startsWith('-') ? 'text-red-500 dark:text-red-400' : 'text-blue-500 dark:text-blue-400')">
                    <span class="material-symbols-outlined text-[14px]">
                        {{ metric.trend.startsWith('+') ? 'trending_up' : (metric.trend.startsWith('-') ?
                            'trending_down' : 'info') }}
                    </span>
                    {{ metric.trend }}
                </div>
            </div>
        </div>

        <!-- Charts Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

            <!-- Main Chart: Resolution Rate (Line) -->
            <div
                class="lg:col-span-2 bg-white dark:bg-black/20 border border-gray-100 dark:border-white/5 p-6 rounded-xl shadow-sm">
                <div class="flex justify-between items-center mb-6">
                    <div>
                        <h3 class="font-bold text-gray-900 dark:text-white">AI Resolution vs Human Escalation</h3>
                        <p class="text-xs text-gray-500 mt-1">Daily trend of automated resolutions</p>
                    </div>
                    <button
                        class="p-2 bg-gray-50 dark:bg-white/5 rounded-lg text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors tooltip-trigger relative">
                        <span class="material-symbols-outlined text-[18px]">download</span>
                        <span class="tooltip">Export CSV</span>
                    </button>
                </div>
                <!-- Chart.js Canvas -->
                <div class="h-[500px] w-full relative">
                    <canvas id="resolutionChart"></canvas>
                </div>
            </div>

            <!-- Side Chart: Escalation Reasons (Doughnut) -->
            <div
                class="bg-white dark:bg-black/20 border border-gray-100 dark:border-white/5 p-6 rounded-xl shadow-sm flex flex-col">
                <div class="mb-6">
                    <h3 class="font-bold text-gray-900 dark:text-white">Top Escalation Drivers</h3>
                    <p class="text-xs text-gray-500 mt-1">Why customers bypass AI</p>
                </div>
                <!-- Chart.js Canvas -->
                <div class="h-[220px] w-full relative flex-1">
                    <canvas id="escalationChart"></canvas>
                </div>

                <!-- Custom Legend -->
                <div class="mt-4 space-y-2">
                    <div v-for="(reason, index) in escalationReasons" :key="reason.label"
                        class="flex items-center justify-between text-xs">
                        <div class="flex items-center gap-2">
                            <span class="w-3 h-3 rounded-full shadow-sm"
                                :style="{ backgroundColor: cssVarColors[index] }"></span>
                            <span class="text-gray-700 dark:text-gray-300 font-medium">{{ reason.label }}</span>
                        </div>
                        <span class="font-bold text-gray-900 dark:text-white">{{ reason.pct }}%</span>
                    </div>
                </div>
            </div>

            <!-- Bottom Chart: Sentiment Trend (Bar) -->
            <div
                class="lg:col-span-3 bg-white dark:bg-black/20 border border-gray-100 dark:border-white/5 p-6 rounded-xl shadow-sm">
                <div class="mb-6">
                    <h3 class="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <span class="material-symbols-outlined text-purple-500">sentiment_satisfied</span>
                        Customer Sentiment Score
                    </h3>
                    <p class="text-xs text-gray-500 mt-1">Average CSAT after conversation (Bot vs Human)</p>
                </div>
                <!-- Chart.js Canvas -->
                <div class="h-[250px] w-full relative">
                    <canvas id="sentimentChart"></canvas>
                </div>
            </div>

        </div>

        <!-- AI Insights Board -->
        <h3
            class="font-bold text-gray-900 dark:text-white uppercase tracking-wider text-xs pt-4 mb-2 flex items-center gap-2">
            <span class="material-symbols-outlined text-[16px] text-purple-500">auto_awesome</span> Direct AI Insights
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div v-for="insight in insights" :key="insight.title"
                class="p-5 rounded-xl border flex gap-4 transition-all hover:shadow-md" :class="insight.classes">
                <span class="material-symbols-outlined text-3xl shrink-0 mt-0.5" :class="insight.iconColor">{{
                    insight.icon }}</span>
                <div>
                    <h4 class="font-bold mb-1" :class="insight.titleColor">{{ insight.title }}</h4>
                    <p class="text-sm leading-relaxed" :class="insight.textColor">{{ insight.text }}</p>
                    <button v-if="!insight.executed" @click="openActionModal(insight)"
                        class="mt-3 text-xs font-bold flex items-center gap-1 transition-colors"
                        :class="insight.titleColor + ' hover:opacity-80'">
                        Take Action <span class="material-symbols-outlined text-[12px]">arrow_forward</span>
                    </button>
                    <div v-else
                        class="mt-3 text-xs font-bold flex items-center gap-1 text-green-600 dark:text-green-400">
                        <span class="material-symbols-outlined text-[14px]">check_circle</span> Action Executed
                    </div>
                </div>
            </div>
        </div>

        <!-- AI Action Modal -->
        <Teleport to="body">
            <div v-if="showActionModal"
                class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                @click.self="showActionModal = false">
                <div
                    class="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md shadow-2xl border border-gray-100 dark:border-white/10 overflow-hidden">
                    <div
                        class="p-6 border-b border-gray-100 dark:border-white/5 flex items-center gap-3 bg-gray-50 dark:bg-white/5">
                        <span class="material-symbols-outlined text-2xl" :class="selectedInsight?.iconColor">{{
                            selectedInsight?.icon }}</span>
                        <h3 class="text-xl font-bold text-gray-900 dark:text-white">{{ selectedInsight?.title }}</h3>
                    </div>
                    <div class="p-6 space-y-4">
                        <p class="text-sm text-gray-600 dark:text-gray-300">{{ selectedInsight?.text }}</p>

                        <div
                            class="bg-purple-50 dark:bg-purple-900/10 p-4 rounded-xl border border-purple-100 dark:border-purple-500/20">
                            <div
                                class="flex items-center gap-2 mb-2 font-bold text-purple-900 dark:text-purple-300 text-sm">
                                <span class="material-symbols-outlined text-[18px]">auto_awesome</span> Recommended
                                Execution
                            </div>
                            <p class="text-xs text-purple-800 dark:text-purple-400">By approving this action, the AI
                                Admin will automatically implement the necessary configuration changes across all
                                affected sub-systems. No further manual input is required.</p>
                        </div>
                    </div>
                    <div class="p-6 border-t border-gray-100 dark:border-white/5 flex gap-3 bg-gray-50 dark:bg-white/5">
                        <button @click="showActionModal = false"
                            class="flex-1 py-2.5 bg-white dark:bg-black/20 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-700 dark:text-white font-bold rounded-xl transition-colors border border-gray-200 dark:border-white/10 shadow-sm">
                            Close
                        </button>
                        <button @click="executeAction"
                            class="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2">
                            <span class="material-symbols-outlined text-[18px]">bolt</span> Execute Now
                        </button>
                    </div>
                </div>
            </div>
        </Teleport>
    </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import Chart from 'chart.js/auto'

const showActionModal = ref(false)
const selectedInsight = ref(null)

const activeRange = ref('7D')
const timeRanges = ['24H', '7D', '30D', '90D']

const metrics = [
    { label: 'Conversations', value: '1,248', trend: '+15.2% vs last week', icon: 'forum' },
    { label: 'AI Resolution', value: '82.4%', trend: '+2.1% improvement', icon: 'smart_toy' },
    { label: 'Avg Handle Time', value: '45s', trend: '-12s faster', icon: 'timer' },
    { label: 'Est. Savings', value: '$12.5k', trend: 'Based on $15/hr agent', icon: 'savings' },
]

const escalationReasons = [
    { label: 'Refund Dispute', pct: 42 },
    { label: 'Late Delivery', pct: 28 },
    { label: 'Damaged Item', pct: 15 },
    { label: 'Driver Conduct', pct: 10 },
    { label: 'Other', pct: 5 },
]

// Theme-aware colors derived from Tailwind (Purple/Blue/Gray palette)
const cssVarColors = ['#9333ea', '#3b82f6', '#10b981', '#f59e0b', '#6b7280']; // Purple, Blue, Green, Amber, Gray

const insights = ref([
    {
        icon: 'rule_settings', title: 'Optimize Refund Policy', iconColor: 'text-purple-600 dark:text-purple-400',
        text: 'High volume of small refund requests (< $10). Enabling the auto-approve rule for this tier in Refund Center could save ~5 hours of manual review weekly.',
        classes: 'bg-white dark:bg-black/20 border-purple-200 dark:border-purple-500/20 shadow-sm border-l-4 border-l-purple-500',
        titleColor: 'text-purple-900 dark:text-purple-300', textColor: 'text-gray-600 dark:text-gray-400',
        executed: false
    },
    {
        icon: 'notifications_active', title: 'Logistics Alert Impact', iconColor: 'text-blue-600 dark:text-blue-400',
        text: 'New traffic prediction model successfully reduced inbound "Where is my order" chats by 40% after proactive push notifications to users in Zone A.',
        classes: 'bg-white dark:bg-black/20 border-blue-200 dark:border-blue-500/20 shadow-sm border-l-4 border-l-blue-500',
        titleColor: 'text-blue-900 dark:text-blue-300', textColor: 'text-gray-600 dark:text-gray-400',
        executed: false
    },
])

function openActionModal(insight) {
    selectedInsight.value = insight
    showActionModal.value = true
}

function executeAction() {
    if (selectedInsight.value) {
        selectedInsight.value.executed = true;
    }
    showActionModal.value = false
    selectedInsight.value = null
}

// Chart Instances
let resChart = null;
let escChart = null;
let sentChart = null;

const initCharts = () => {
    // Detect Dark Mode for axes/text
    const isDark = document.documentElement.classList.contains('dark')
    const textColor = isDark ? '#9ca3af' : '#6b7280' // text-gray-400 : text-gray-500
    const gridColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'

    // 1. Resolution Chart (Line)
    const resCtx = document.getElementById('resolutionChart').getContext('2d')
    if (resChart) resChart.destroy();

    // Gradient for AI line
    const gradientAI = resCtx.createLinearGradient(0, 0, 0, 300);
    gradientAI.addColorStop(0, 'rgba(147, 51, 234, 0.4)'); // Purple
    gradientAI.addColorStop(1, 'rgba(147, 51, 234, 0.0)');

    resChart = new Chart(resCtx, {
        type: 'line',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [
                {
                    label: 'Automated by AI',
                    data: [150, 180, 210, 190, 240, 260, 280],
                    borderColor: '#9333ea', // purple-600
                    backgroundColor: gradientAI,
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#9333ea',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6
                },
                {
                    label: 'Escalated to Human',
                    data: [45, 40, 50, 30, 35, 25, 20],
                    borderColor: '#f43f5e', // rose-500
                    backgroundColor: 'transparent',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    tension: 0.4,
                    pointBackgroundColor: '#f43f5e',
                    pointRadius: 3
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            plugins: {
                legend: { position: 'top', align: 'end', labels: { color: textColor, usePointStyle: true, boxWidth: 8 } },
                tooltip: { backgroundColor: isDark ? '#1f2937' : '#fff', titleColor: isDark ? '#f3f4f6' : '#111827', bodyColor: isDark ? '#d1d5db' : '#4b5563', borderColor: isDark ? '#374151' : '#e5e7eb', borderWidth: 1, padding: 12, cornerRadius: 8, displayColors: true }
            },
            scales: {
                y: { grid: { color: gridColor, drawBorder: false }, ticks: { color: textColor, font: { size: 11 } }, beginAtZero: true },
                x: { grid: { display: false, drawBorder: false }, ticks: { color: textColor, font: { size: 11 } } }
            }
        }
    })

    // 2. Escalation Doughnut
    const escCtx = document.getElementById('escalationChart').getContext('2d')
    if (escChart) escChart.destroy();

    escChart = new Chart(escCtx, {
        type: 'doughnut',
        data: {
            labels: escalationReasons.map(r => r.label),
            datasets: [{
                data: escalationReasons.map(r => r.pct),
                backgroundColor: cssVarColors,
                borderWidth: isDark ? 2 : 0,
                borderColor: isDark ? '#111827' : '#fff', // match background to create gap effect
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '75%',
            plugins: {
                legend: { display: false }, // Use custom HTML legend
                tooltip: {
                    callbacks: { label: function (context) { return ` ${context.label}: ${context.raw}%`; } },
                    backgroundColor: isDark ? '#1f2937' : '#fff', titleColor: isDark ? '#f3f4f6' : '#111827', bodyColor: isDark ? '#d1d5db' : '#4b5563', borderColor: isDark ? '#374151' : '#e5e7eb', borderWidth: 1, padding: 10
                }
            }
        }
    });

    // 3. Sentiment Bar
    const sentCtx = document.getElementById('sentimentChart').getContext('2d')
    if (sentChart) sentChart.destroy();

    sentChart = new Chart(sentCtx, {
        type: 'bar',
        data: {
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
            datasets: [
                {
                    label: 'Human Handled (CSAT)',
                    data: [88, 86, 89, 90],
                    backgroundColor: '#3b82f6', // blue-500
                    borderRadius: 4,
                    barPercentage: 0.6,
                    categoryPercentage: 0.8
                },
                {
                    label: 'AI Handled (CSAT)',
                    data: [72, 78, 85, 89], // Showing AI improving over time
                    backgroundColor: '#a855f7', // purple-500
                    borderRadius: 4,
                    barPercentage: 0.6,
                    categoryPercentage: 0.8
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'top', align: 'end', labels: { color: textColor, usePointStyle: true, boxWidth: 8 } },
                tooltip: { backgroundColor: isDark ? '#1f2937' : '#fff', titleColor: isDark ? '#f3f4f6' : '#111827', bodyColor: isDark ? '#d1d5db' : '#4b5563', borderColor: isDark ? '#374151' : '#e5e7eb', borderWidth: 1 }
            },
            scales: {
                y: { grid: { color: gridColor, drawBorder: false }, ticks: { color: textColor }, max: 100, beginAtZero: true },
                x: { grid: { display: false, drawBorder: false }, ticks: { color: textColor } }
            }
        }
    })
}

onMounted(() => {
    // Slight delay to ensure DOM is fully rendered before mounting charts
    setTimeout(() => {
        initCharts()
    }, 100)

    // Observer to re-render charts on dark mode toggle to update text/grid colors
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.attributeName === 'class') {
                initCharts()
            }
        })
    })
    observer.observe(document.documentElement, { attributes: true })
})

// Mock functionality to "update" data when range changes
watch(activeRange, () => {
    if (resChart) {
        // Randomize data slightly to simulate fetch
        resChart.data.datasets[0].data = resChart.data.datasets[0].data.map(val => val + Math.floor(Math.random() * 40 - 20));
        resChart.update();
    }
})

</script>

<style scoped>
/* Tooltip styling */
.tooltip-trigger .tooltip {
    @apply absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-[10px] rounded opacity-0 whitespace-nowrap pointer-events-none transition-opacity;
    z-index: 50;
}

.tooltip-trigger:hover .tooltip {
    @apply opacity-100;
}
</style>
