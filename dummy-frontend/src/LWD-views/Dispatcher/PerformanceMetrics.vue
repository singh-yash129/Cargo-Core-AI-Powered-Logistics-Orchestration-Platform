<template>
    <div class="space-y-6">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Dispatcher Performance Metrics</h2>

        <!-- KPI Cards - Row 1 -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div class="glass-panel p-6 rounded-xl text-center">
                <div class="text-4xl font-bold text-primary">94%</div>
                <div class="text-sm text-gray-500 dark:text-gray-400 mt-2">On-Time Delivery Rate</div>
            </div>
            <div class="glass-panel p-6 rounded-xl text-center">
                <div class="text-4xl font-bold text-gray-900 dark:text-white">12.5m</div>
                <div class="text-sm text-gray-500 dark:text-gray-400 mt-2">Avg. Turnaround Time</div>
            </div>
            <div class="glass-panel p-6 rounded-xl text-center">
                <div class="text-4xl font-bold text-gray-900 dark:text-white">4.8</div>
                <div class="text-sm text-gray-500 dark:text-gray-400 mt-2">Driver Satisfaction</div>
            </div>
            <div class="glass-panel p-6 rounded-xl text-center">
                <div class="text-4xl font-bold text-red-400">2%</div>
                <div class="text-sm text-gray-500 dark:text-gray-400 mt-2">Failed Deliveries</div>
            </div>
        </div>

        <!-- KPI Cards - Row 2 (NEW - from spec) -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div class="glass-panel p-4 rounded-xl text-center">
                <div class="text-2xl font-bold text-red-400">15%</div>
                <div class="text-[10px] text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-wider">Empty Miles %</div>
                <div class="text-[9px] text-green-400 mt-1">-3% vs last week</div>
            </div>
            <div class="glass-panel p-4 rounded-xl text-center">
                <div class="text-2xl font-bold text-green-400">96.2%</div>
                <div class="text-[10px] text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-wider">On-Time Dispatch</div>
                <div class="text-[9px] text-green-400 mt-1">+1.2% above SLA</div>
            </div>
            <div class="glass-panel p-4 rounded-xl text-center">
                <div class="text-2xl font-bold text-blue-400">94.8%</div>
                <div class="text-[10px] text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-wider">SLA Compliance</div>
                <div class="text-[9px] text-yellow-400 mt-1">-0.2% below target</div>
            </div>
            <div class="glass-panel p-4 rounded-xl text-center">
                <div class="text-2xl font-bold text-yellow-400">4.2%</div>
                <div class="text-[10px] text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-wider">Route Deviation</div>
                <div class="text-[9px] text-green-400 mt-1">-1.1% improved</div>
            </div>
            <div class="glass-panel p-4 rounded-xl text-center">
                <div class="text-2xl font-bold text-purple-400">7.8</div>
                <div class="text-[10px] text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-wider">km/L Fuel Eff.</div>
                <div class="text-[9px] text-green-400 mt-1">+0.3 vs target</div>
            </div>
            <div class="glass-panel p-4 rounded-xl text-center">
                <div class="text-2xl font-bold text-cyan-400">72%</div>
                <div class="text-[10px] text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-wider">Load Balance</div>
                <div class="text-[9px] text-yellow-400 mt-1">Needs improvement</div>
            </div>
        </div>

        <!-- Charts Section -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div class="glass-panel p-6 rounded-xl relative">
                <h3 class="font-bold text-gray-900 dark:text-white mb-6">Delivery Volume (Hourly)</h3>
                <div class="h-64">
                    <Bar :data="hourlyChartData" :options="hourlyChartOptions" />
                </div>
            </div>

            <div class="glass-panel p-6 rounded-xl">
                <h3 class="font-bold text-gray-900 dark:text-white mb-6">Top Performing Zones</h3>
                <div class="h-64">
                    <Bar :data="zoneChartData" :options="zoneChartOptions" />
                </div>
            </div>
        </div>

        <!-- Route Quality & Planning Accountability -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div class="glass-panel p-6 rounded-xl">
                <h3 class="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <span class="material-symbols-outlined text-yellow-400 text-[20px]">route</span>
                    Route Quality Metrics
                </h3>
                <div class="space-y-4">
                    <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-white/5 rounded-lg">
                        <div>
                            <div class="text-sm text-gray-900 dark:text-white font-bold">Route Deviation Rate</div>
                            <div class="text-[10px] text-gray-500">Drivers ignoring planned route</div>
                        </div>
                        <div class="text-right">
                            <div class="text-lg font-bold text-yellow-400">4.2%</div>
                            <div class="text-[10px] text-green-400">Target: &lt;5%</div>
                        </div>
                    </div>
                    <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-white/5 rounded-lg">
                        <div>
                            <div class="text-sm text-gray-900 dark:text-white font-bold">Avg. Delivery Delay</div>
                            <div class="text-[10px] text-gray-500">Minutes past scheduled ETA</div>
                        </div>
                        <div class="text-right">
                            <div class="text-lg font-bold text-gray-900 dark:text-white">8.5 min</div>
                            <div class="text-[10px] text-yellow-400">Target: &lt;5 min</div>
                        </div>
                    </div>
                    <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-white/5 rounded-lg">
                        <div>
                            <div class="text-sm text-gray-900 dark:text-white font-bold">Reassignment Frequency</div>
                            <div class="text-[10px] text-gray-500">Mid-route reassignments today</div>
                        </div>
                        <div class="text-right">
                            <div class="text-lg font-bold text-gray-900 dark:text-white">6</div>
                            <div class="text-[10px] text-green-400">Normal range</div>
                        </div>
                    </div>
                    <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-white/5 rounded-lg">
                        <div>
                            <div class="text-sm text-gray-900 dark:text-white font-bold">Fuel Cost Impact</div>
                            <div class="text-[10px] text-gray-500">Routing efficiency on fuel spend</div>
                        </div>
                        <div class="text-right">
                            <div class="text-lg font-bold text-green-400">-$142</div>
                            <div class="text-[10px] text-green-400">Saved today vs baseline</div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="glass-panel p-6 rounded-xl">
                <h3 class="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <span class="material-symbols-outlined text-red-400 text-[20px]">speed</span>
                    Empty Miles Analysis
                </h3>
                <div class="flex items-center justify-center mb-4">
                    <div class="relative w-36 h-36">
                        <Doughnut :data="emptyMilesChartData" :options="emptyMilesChartOptions" />
                    </div>
                </div>
                <div class="space-y-2">
                    <div class="flex justify-between text-xs p-2 bg-gray-50 dark:bg-white/5 rounded">
                        <span class="text-gray-400 flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-green-500"></span> Loaded Miles</span>
                        <span class="text-gray-900 dark:text-white font-mono">2,414 km</span>
                    </div>
                    <div class="flex justify-between text-xs p-2 bg-gray-50 dark:bg-white/5 rounded">
                        <span class="text-gray-400 flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-red-500"></span> Empty Miles</span>
                        <span class="text-gray-900 dark:text-white font-mono">426 km</span>
                    </div>
                    <div class="flex justify-between text-xs p-2 bg-gray-50 dark:bg-white/5 rounded">
                        <span class="text-gray-400">Weekly Trend</span>
                        <span class="text-green-400 font-mono">-3.1% improved</span>
                    </div>
                    <div class="flex justify-between text-xs p-2 bg-gray-50 dark:bg-white/5 rounded">
                        <span class="text-gray-400">Potential Savings</span>
                        <span class="text-primary font-mono">$218/day</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Note: Visible to Logistics Manager -->
        <div class="p-3 bg-blue-100 dark:bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center gap-3">
            <span class="material-symbols-outlined text-blue-500 dark:text-blue-400">visibility</span>
            <span class="text-xs text-blue-700 dark:text-blue-300">These performance metrics are visible to the Logistics Manager for dispatcher accountability review.</span>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Bar, Doughnut } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend)

const zones = ref([
    { name: 'Downtown Sector', perf: 98 },
    { name: 'North Industrial Park', perf: 92 },
    { name: 'Suburban West', perf: 88 },
    { name: 'Airport Logistics', perf: 95 },
])

// Hourly delivery chart
const hourlyVolumes = [2, 1, 1, 0, 1, 3, 8, 14, 18, 22, 28, 32, 30, 26, 24, 28, 34, 30, 22, 16, 10, 6, 4, 3]
const hourlyChartData = computed(() => ({
    labels: Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`),
    datasets: [{
        label: 'Deliveries',
        data: hourlyVolumes,
        backgroundColor: hourlyVolumes.map(v => v >= 30 ? 'rgba(239,68,68,0.8)' : v >= 20 ? 'rgba(59,130,246,0.65)' : 'rgba(59,130,246,0.5)'),
        borderColor: 'rgba(59,130,246,0.8)',
        borderWidth: 1,
        borderRadius: 3,
    }]
}))
const hourlyChartOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { backgroundColor: '#111', titleColor: '#fff', bodyColor: '#ccc' } },
    scales: {
        x: { grid: { display: false }, ticks: { color: '#6b7280', font: { size: 8 }, maxRotation: 0, autoSkip: true, maxTicksLimit: 8 } },
        y: { grid: { color: 'rgba(156,163,175,0.2)' }, ticks: { color: '#6b7280', font: { size: 9 } }, beginAtZero: true }
    }
}

// Zone chart
const zoneChartData = computed(() => ({
    labels: zones.value.map(z => z.name),
    datasets: [{
        label: 'Performance %',
        data: zones.value.map(z => z.perf),
        backgroundColor: ['rgba(28,231,131,0.75)', 'rgba(59,130,246,0.75)', 'rgba(168,85,247,0.75)', 'rgba(234,179,8,0.75)'],
        borderColor: ['rgba(28,231,131,0.8)', 'rgba(59,130,246,0.8)', 'rgba(168,85,247,0.8)', 'rgba(234,179,8,0.8)'],
        borderWidth: 1,
        borderRadius: 6,
    }]
}))
const zoneChartOptions = {
    indexAxis: 'y', responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { backgroundColor: '#111', titleColor: '#fff', bodyColor: '#ccc' } },
    scales: {
        x: { grid: { color: 'rgba(156,163,175,0.2)' }, ticks: { color: '#6b7280', font: { size: 9 } }, min: 80, max: 100 },
        y: { grid: { display: false }, ticks: { color: '#6b7280', font: { size: 10 } } }
    }
}

// Empty miles donut
const emptyMilesChartData = computed(() => ({
    labels: ['Loaded Miles', 'Empty Miles'],
    datasets: [{
        data: [2414, 426],
        backgroundColor: ['rgba(28,231,131,0.7)', 'rgba(239,68,68,0.7)'],
        borderColor: ['rgba(28,231,131,1)', 'rgba(239,68,68,1)'],
        borderWidth: 2,
        cutout: '70%',
    }]
}))
const emptyMilesChartOptions = {
    responsive: true, maintainAspectRatio: true,
    plugins: {
        legend: { display: false },
        tooltip: { backgroundColor: '#111', titleColor: '#fff', bodyColor: '#ccc', callbacks: { label: (ctx) => `${ctx.label}: ${ctx.parsed.toLocaleString()} km` } }
    }
}
</script>
