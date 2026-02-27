<template>
    <div class="space-y-6">
        <!-- Header -->
        <div class="flex justify-between items-center">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Operational Performance</h2>
            <div class="flex gap-3 items-center">
                <select v-model="timeRange"
                    class="bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-primary/50">
                    <option value="today" class="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">Today</option>
                    <option value="week" class="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">This Week</option>
                    <option value="month" class="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">This Month</option>
                    <option value="quarter" class="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">This Quarter</option>
                </select>
                <button @click="exportReport"
                    class="bg-gray-50 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 py-2 px-4 rounded-lg transition-colors flex items-center gap-2 text-sm">
                    <span class="material-symbols-outlined text-[18px]">download</span> Export Report
                </button>
            </div>
        </div>

        <!-- Primary KPI Row -->
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div v-for="kpi in primaryKPIs" :key="kpi.label"
                class="glass-panel p-4 rounded-xl relative overflow-hidden group hover:border-primary/20 transition-colors">
                <div class="text-xs text-gray-600 dark:text-gray-400 uppercase font-semibold tracking-wide">{{ kpi.label
                    }}</div>
                <div class="text-2xl font-bold mt-1" :class="kpi.color">{{ kpi.value }}</div>
                <div class="flex items-center gap-1 mt-1">
                    <span class="material-symbols-outlined text-[14px]"
                        :class="kpi.trend > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'">{{ kpi.trend > 0 ? 'trending_up' :
                            'trending_down' }}</span>
                    <span class="text-xs" :class="kpi.trend > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'">{{ kpi.trendLabel
                        }}</span>
                </div>
                <div class="absolute bottom-0 left-0 right-0 h-0.5" :class="kpi.barColor"></div>
            </div>
        </div>

        <!-- Charts Row -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Order Processing Time Trend -->
            <div class="glass-panel p-5 rounded-xl">
                <h3 class="font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                    <span class="material-symbols-outlined text-blue-400">timeline</span>
                    Order Processing Time (Hours)
                </h3>
                <div class="h-60 relative">
                    <Bar :data="processingChartData" :options="processingChartOptions" />
                </div>
            </div>

            <!-- Pick Accuracy Gauge -->
            <div class="glass-panel p-5 rounded-xl">
                <h3 class="font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                    <span class="material-symbols-outlined text-green-600 dark:text-green-400">check_circle</span>
                    Pick Accuracy Rate
                </h3>
                <div class="flex items-center justify-center gap-12 h-60">
                    <!-- Circular Gauge -->
                    <div class="relative w-40 h-40">
                        <svg class="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="42" fill="none" stroke="#1f2937" stroke-width="8" />
                            <circle cx="50" cy="50" r="42" fill="none"
                                :stroke="pickAccuracy >= 98 ? '#10b981' : pickAccuracy >= 95 ? '#f59e0b' : '#ef4444'"
                                stroke-width="8" stroke-linecap="round"
                                :stroke-dasharray="`${pickAccuracy * 2.64} 264`" />
                        </svg>
                        <div class="absolute inset-0 flex flex-col items-center justify-center">
                            <div class="text-3xl font-bold text-gray-900 dark:text-white">{{ pickAccuracy }}%</div>
                            <div class="text-[10px] text-gray-500 uppercase">Accuracy</div>
                        </div>
                    </div>
                    <!-- Breakdown -->
                    <div class="space-y-4">
                        <div>
                            <div class="text-sm text-gray-600 dark:text-gray-400">Total Picks Today</div>
                            <div class="text-xl font-bold text-gray-900 dark:text-white">1,248</div>
                        </div>
                        <div>
                            <div class="text-sm text-gray-600 dark:text-gray-400">Correct Picks</div>
                            <div class="text-xl font-bold text-green-600 dark:text-green-400">1,223</div>
                        </div>
                        <div>
                            <div class="text-sm text-gray-600 dark:text-gray-400">Errors</div>
                            <div class="text-xl font-bold text-red-600 dark:text-red-400">25</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Secondary Metrics -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Labor Utilization -->
            <div class="glass-panel p-5 rounded-xl">
                <h3 class="font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                    <span class="material-symbols-outlined text-purple-400">groups</span>
                    Labor Utilization
                </h3>
                <div class="space-y-4">
                    <div v-for="dept in laborUtil" :key="dept.name">
                        <div class="flex justify-between text-sm mb-1">
                            <span class="text-gray-600 dark:text-gray-300">{{ dept.name }}</span>
                            <span class="font-bold"
                                :class="dept.percent >= 90 ? 'text-green-600 dark:text-green-400' : dept.percent >= 70 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'">{{
                                    dept.percent }}%</span>
                        </div>
                        <div class="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                            <div class="h-full rounded-full transition-all"
                                :class="dept.percent >= 90 ? 'bg-green-500' : dept.percent >= 70 ? 'bg-yellow-500' : 'bg-red-500'"
                                :style="`width: ${dept.percent}%`"></div>
                        </div>
                        <div class="text-xs text-gray-500 mt-0.5">{{ dept.workers }} workers • {{ dept.hours }}h logged
                        </div>
                    </div>
                </div>
            </div>

            <!-- Dock Dwell Time -->
            <div class="glass-panel p-5 rounded-xl">
                <h3 class="font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                    <span class="material-symbols-outlined text-yellow-600 dark:text-yellow-400">local_shipping</span>
                    Dock Dwell Time
                </h3>
                <div class="space-y-3">
                    <div v-for="dock in dwellTimes" :key="dock.dock"
                        class="p-3 bg-gray-50 dark:bg-white/5 rounded-lg border border-gray-100 dark:border-white/5">
                        <div class="flex justify-between items-center mb-1">
                            <span class="text-sm font-bold text-gray-900 dark:text-white">{{ dock.dock }}</span>
                            <span class="text-sm font-mono"
                                :class="dock.minutes > 45 ? 'text-red-600 dark:text-red-400' : dock.minutes > 30 ? 'text-yellow-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400'">
                                {{ dock.minutes }} min
                            </span>
                        </div>
                        <div class="w-full bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
                            <div class="h-full rounded-full"
                                :class="dock.minutes > 45 ? 'bg-red-500' : dock.minutes > 30 ? 'bg-yellow-500' : 'bg-green-500'"
                                :style="`width: ${Math.min((dock.minutes / 60) * 100, 100)}%`"></div>
                        </div>
                        <div class="text-xs text-gray-500 mt-1">{{ dock.truck }} — {{ dock.carrier }}</div>
                    </div>
                </div>
                <div class="mt-4 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                    <div class="flex justify-between">
                        <span class="text-xs text-blue-600 dark:text-blue-400 font-bold">Avg. Dwell Today</span>
                        <span class="text-xs text-gray-900 dark:text-white font-bold">{{ avgDwell }} min</span>
                    </div>
                </div>
            </div>

            <!-- Stock & Packing Metrics -->
            <div class="glass-panel p-5 rounded-xl">
                <h3 class="font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                    <span class="material-symbols-outlined text-teal-400">inventory</span>
                    Stock & Packing Health
                </h3>
                <div class="space-y-4">
                    <div class="p-3 bg-gray-50 dark:bg-white/5 rounded-lg">
                        <div class="flex justify-between text-sm mb-1">
                            <span class="text-gray-600 dark:text-gray-400">Stock Discrepancy</span>
                            <span class="font-bold"
                                :class="stockDiscrepancy <= 1 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'">{{ stockDiscrepancy
                                }}%</span>
                        </div>
                        <div class="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                            <div class="h-full rounded-full"
                                :class="stockDiscrepancy <= 1 ? 'bg-green-500' : 'bg-red-500'"
                                :style="`width: ${stockDiscrepancy * 10}%`"></div>
                        </div>
                    </div>
                    <div class="p-3 bg-gray-50 dark:bg-white/5 rounded-lg">
                        <div class="flex justify-between text-sm mb-1">
                            <span class="text-gray-600 dark:text-gray-400">Packing Error Rate</span>
                            <span class="font-bold" :class="packingError <= 2 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'">{{
                                packingError }}%</span>
                        </div>
                        <div class="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                            <div class="h-full rounded-full" :class="packingError <= 2 ? 'bg-green-500' : 'bg-red-500'"
                                :style="`width: ${packingError * 10}%`"></div>
                        </div>
                    </div>
                    <div class="p-3 bg-gray-50 dark:bg-white/5 rounded-lg">
                        <div class="flex justify-between text-sm mb-1">
                            <span class="text-gray-600 dark:text-gray-400">Daily Demand Load</span>
                            <span class="font-bold text-gray-900 dark:text-white">{{ demandLoad }} orders</span>
                        </div>
                        <div class="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                            <div class="bg-blue-500 h-full rounded-full" :style="`width: ${(demandLoad / 60) * 100}%`">
                            </div>
                        </div>
                    </div>
                    <div class="p-3 bg-gray-50 dark:bg-white/5 rounded-lg">
                        <div class="flex justify-between text-sm mb-1">
                            <span class="text-gray-600 dark:text-gray-400">Returns Processing Rate</span>
                            <span class="font-bold text-green-600 dark:text-green-400">94%</span>
                        </div>
                        <div class="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                            <div class="bg-green-500 h-full rounded-full" style="width: 94%"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Daily Demand Load Chart -->
        <div class="glass-panel p-5 rounded-xl">
            <h3 class="font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                <span class="material-symbols-outlined text-primary">bar_chart</span>
                Daily Demand Load (Orders per Day)
            </h3>
            <div class="h-48 relative">
                <Bar :data="demandChartData" :options="demandChartOptions" />
            </div>
        </div>

        <!-- Toast -->
        <div v-if="toastMsg"
            class="fixed bottom-6 right-6 bg-green-500/90 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 z-50 animate-bounce">
            <span class="material-symbols-outlined">check_circle</span>
            <div class="font-bold">{{ toastMsg }}</div>
        </div>
    </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const timeRange = ref('today')
const pickAccuracy = ref(98)
const stockDiscrepancy = ref(0.8)
const packingError = ref(1.5)
const demandLoad = ref(38)
const avgDwell = ref(34)
const toastMsg = ref('')

function showToast(msg) {
    toastMsg.value = msg
    setTimeout(() => { toastMsg.value = '' }, 2500)
}

function exportReport() {
    showToast(`Performance report (${timeRange.value}) exported`)
}

// Simulate data changes when time range changes
watch(timeRange, (val) => {
    const data = {
        today: { accuracy: 98, discrepancy: 0.8, packing: 1.5, demand: 38, dwell: 34 },
        week: { accuracy: 97.2, discrepancy: 1.1, packing: 1.8, demand: 42, dwell: 36 },
        month: { accuracy: 96.8, discrepancy: 1.4, packing: 2.1, demand: 45, dwell: 38 },
        quarter: { accuracy: 96.5, discrepancy: 1.6, packing: 2.3, demand: 40, dwell: 35 },
    }
    const d = data[val] || data.today
    pickAccuracy.value = d.accuracy
    stockDiscrepancy.value = d.discrepancy
    packingError.value = d.packing
    demandLoad.value = d.demand
    avgDwell.value = d.dwell
    showToast(`Showing ${val} data`)
})

const primaryKPIs = ref([
    { label: 'Order Processing', value: '2.8h', color: 'text-green-600 dark:text-green-400', trend: 1, trendLabel: '12% faster', barColor: 'bg-green-500' },
    { label: 'Pick Accuracy', value: '98%', color: 'text-primary', trend: 1, trendLabel: '+0.5%', barColor: 'bg-primary' },
    { label: 'Stock Discrepancy', value: '0.8%', color: 'text-green-600 dark:text-green-400', trend: 1, trendLabel: '-0.3%', barColor: 'bg-green-500' },
    { label: 'Labor Utilization', value: '87%', color: 'text-blue-600 dark:text-blue-400', trend: 1, trendLabel: '+4%', barColor: 'bg-blue-500' },
    { label: 'Dock Dwell', value: '34m', color: 'text-yellow-600 dark:text-yellow-400', trend: -1, trendLabel: '+5 min', barColor: 'bg-yellow-500' },
    { label: 'Packing Errors', value: '1.5%', color: 'text-green-600 dark:text-green-400', trend: 1, trendLabel: '-0.4%', barColor: 'bg-green-500' },
])

const processingTimeBars = ref([
    { day: 'Mon', value: 3.2 },
    { day: 'Tue', value: 2.8 },
    { day: 'Wed', value: 4.1 },
    { day: 'Thu', value: 3.5 },
    { day: 'Fri', value: 2.6 },
    { day: 'Sat', value: 2.1 },
    { day: 'Sun', value: 1.8 },
])

const laborUtil = ref([
    { name: 'Picking Team', percent: 92, workers: 14, hours: 98 },
    { name: 'Packing Team', percent: 85, workers: 8, hours: 56 },
    { name: 'Receiving Team', percent: 78, workers: 6, hours: 38 },
    { name: 'Loading Team', percent: 95, workers: 10, hours: 72 },
    { name: 'Returns Team', percent: 65, workers: 4, hours: 20 },
])

const dwellTimes = ref([
    { dock: 'Dock 1', minutes: 28, truck: 'TRK-5541', carrier: 'UPS Freight' },
    { dock: 'Dock 2', minutes: 45, truck: 'TRK-3312', carrier: 'DHL Express' },
    { dock: 'Dock 3', minutes: 52, truck: 'TRK-9912', carrier: 'Internal Fleet' },
    { dock: 'Dock 4', minutes: 15, truck: 'TRK-1124', carrier: 'FedEx Ground' },
])

const demandChart = ref([
    { day: '20', count: 32 }, { day: '21', count: 41 }, { day: '22', count: 38 },
    { day: '23', count: 55 }, { day: '24', count: 42 }, { day: '25', count: 36 },
    { day: '26', count: 38 }, { day: '27', count: 0 }, { day: '28', count: 0 },
])

// ======== Chart.js Configs ========

// Order Processing Time Bar Chart
const processingChartData = computed(() => ({
    labels: processingTimeBars.value.map(b => b.day),
    datasets: [{
        label: 'Processing Time (hrs)',
        data: processingTimeBars.value.map(b => b.value),
        backgroundColor: processingTimeBars.value.map(b =>
            b.value > 4 ? 'rgba(239, 68, 68, 0.8)' :
                b.value > 3 ? 'rgba(245, 158, 11, 0.8)' :
                    'rgba(68, 233, 150, 0.8)'
        ),
        borderColor: processingTimeBars.value.map(b =>
            b.value > 4 ? 'rgb(239, 68, 68)' :
                b.value > 3 ? 'rgb(245, 158, 11)' :
                    'rgb(68, 233, 150)'
        ),
        borderWidth: 1,
        borderRadius: 6,
        borderSkipped: false,
    }]
}))

const processingChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { display: false },
        tooltip: {
            backgroundColor: 'rgba(0,0,0,0.8)',
            titleFont: { size: 13, weight: 'bold' },
            bodyFont: { size: 12 },
            padding: 12,
            cornerRadius: 8,
            callbacks: {
                label: (ctx) => `${ctx.parsed.y} hours`
            }
        }
    },
    scales: {
        x: {
            grid: { display: false },
            ticks: { color: '#9ca3af', font: { size: 11 } }
        },
        y: {
            min: 0,
            max: 6,
            grid: { color: 'rgba(156,163,175,0.1)' },
            ticks: {
                color: '#9ca3af',
                font: { size: 11 },
                callback: (v) => v + 'h'
            }
        }
    }
}

// Daily Demand Load Bar Chart
const demandChartData = computed(() => ({
    labels: demandChart.value.map(d => 'Day ' + d.day),
    datasets: [{
        label: 'Orders',
        data: demandChart.value.map(d => d.count),
        backgroundColor: (ctx) => {
            const chart = ctx.chart
            const { ctx: canvasCtx, chartArea } = chart
            if (!chartArea) return 'rgba(68, 233, 150, 0.6)'
            const gradient = canvasCtx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top)
            gradient.addColorStop(0, 'rgba(68, 233, 150, 0.3)')
            gradient.addColorStop(1, 'rgba(68, 233, 150, 0.9)')
            return gradient
        },
        borderColor: 'rgb(68, 233, 150)',
        borderWidth: 1,
        borderRadius: 4,
        borderSkipped: false,
    }]
}))

const demandChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { display: false },
        tooltip: {
            backgroundColor: 'rgba(0,0,0,0.8)',
            titleFont: { size: 13, weight: 'bold' },
            bodyFont: { size: 12 },
            padding: 12,
            cornerRadius: 8,
            callbacks: {
                label: (ctx) => `${ctx.parsed.y} orders`
            }
        }
    },
    scales: {
        x: {
            grid: { display: false },
            ticks: { color: '#9ca3af', font: { size: 10 } }
        },
        y: {
            min: 0,
            max: 60,
            grid: { color: 'rgba(156,163,175,0.1)' },
            ticks: {
                color: '#9ca3af',
                font: { size: 11 },
                stepSize: 15
            }
        }
    }
}
</script>
