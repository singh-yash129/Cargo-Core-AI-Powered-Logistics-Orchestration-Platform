<template>
    <div class="h-full flex flex-col space-y-6">
        <!-- Header -->
        <div class="flex flex-col gap-4 shrink-0">
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 class="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <span class="material-symbols-outlined text-primary">compare_arrows</span> Zone Comparative
                        Viewers
                    </h2>
                    <p class="text-xs text-gray-500 dark:text-gray-400 font-mono mt-1">
                        Drag and drop zones from the sidebar to compare performance metrics.
                    </p>
                </div>

                <div class="flex gap-2 items-center">
                    <select v-model="timeRange"
                        class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm px-3 py-2 outline-none focus:ring-2 focus:ring-primary/50 text-gray-700 dark:text-gray-200 cursor-pointer">
                        <option value="today" class="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">Today (Live)</option>
                        <option value="7d" class="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">Last 7 Days</option>
                        <option value="30d" class="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">Last 30 Days</option>
                        <option value="ytd" class="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">Year to Date</option>
                    </select>

                    <button @click="store.comparedZones = []"
                        v-if="store.comparedZones && store.comparedZones.length > 0"
                        class="text-xs text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-bold px-3 py-2 border border-red-200 dark:border-red-500/30 rounded-lg bg-red-50 dark:bg-red-900/10 transition-colors">
                        Clear All
                    </button>
                </div>
            </div>

            <!-- Global Tabs (Control which section is shown in cards) -->
            <div class="flex gap-1 overflow-x-auto pb-2 border-b border-gray-200 dark:border-white/10 no-scrollbar">
                <button v-for="tab in tabs" :key="tab.id" @click="activeTab = tab.id"
                    class="px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 shrink-0"
                    :class="activeTab === tab.id ? 'bg-primary text-white shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5'">
                    <span class="material-symbols-outlined text-[16px]">{{ tab.icon }}</span>
                    {{ tab.label }}
                </button>
            </div>
        </div>

        <!-- Drop Zone / Comparison Area -->
        <div class="flex-1 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl flex flex-wrap content-start items-start justify-start p-4 gap-4 overflow-x-auto min-h-[500px]"
            @dragover.prevent @drop="onDrop">
            <div v-if="!store.comparedZones || store.comparedZones.length === 0"
                class="m-auto w-full text-center text-gray-500 dark:text-gray-400 mt-20">
                <span class="material-symbols-outlined text-6xl mb-2 opacity-50">move_item</span>
                <p class="text-lg font-medium">Drag zones here to compare</p>
                <p class="text-sm">Select zones from the sidebar list</p>
            </div>

            <div v-for="zone in store.comparedZones" :key="zone.id"
                class="w-[calc(33.333%-11px)] min-w-[300px] shrink-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg flex flex-col h-[500px] animate-fade-in ring-1 ring-black/5">
                <!-- Zone Header -->
                <div
                    class="p-4 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-gray-50 dark:bg-white/5 rounded-t-xl sticky top-0 z-10 backdrop-blur-sm">
                    <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border bg-opacity-10 dark:bg-opacity-20 text-white"
                            :style="{ backgroundColor: zone.color || store.presetColors[0], borderColor: zone.color || store.presetColors[0] }">
                            {{ zone.name.substring(0, 2).toUpperCase() }}
                        </div>
                        <div>
                            <h3 class="font-bold text-gray-900 dark:text-white leading-tight flex items-center gap-2">
                                {{ zone.name }}
                                <span v-if="zone.status === 'Alert'"
                                    class="material-symbols-outlined text-[14px] text-red-500">warning</span>
                            </h3>
                            <p class="text-[10px] text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                <span class="material-symbols-outlined text-[10px]">location_on</span>
                                {{ zone.status || 'Normal' }} • Capacity: {{ zone.value || 'N/A' }}
                            </p>
                        </div>
                    </div>
                    <button @click="removeZone(zone.id)"
                        class="text-gray-500 dark:text-gray-400 hover:text-red-500 p-1 hover:bg-gray-200 dark:hover:bg-white/10 rounded transition-colors"
                        title="Remove">
                        <span class="material-symbols-outlined">close</span>
                    </button>
                </div>

                <!-- Content Area based on Active Tab -->
                <div class="flex-1 overflow-y-auto p-4 custom-scrollbar">

                    <!-- 1. Performance -->
                    <div v-if="activeTab === 'performance'" class="space-y-4 animate-fade-in">
                        <!-- KPI Grid -->
                        <div class="grid grid-cols-2 gap-3">
                            <div
                                class="bg-gray-50 dark:bg-white/5 p-3 rounded-lg text-center border border-gray-100 dark:border-white/5">
                                <div class="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-bold">Orders
                                    Processed</div>
                                <div class="text-xl font-black text-gray-900 dark:text-white">{{
                                    getDynamicValue(zone.id, 100, 500) }}</div>
                                <div class="text-[10px] text-green-500 font-bold">↑ 12%</div>
                            </div>
                            <div
                                class="bg-gray-50 dark:bg-white/5 p-3 rounded-lg text-center border border-gray-100 dark:border-white/5">
                                <div class="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-bold">Picking
                                    Accuracy</div>
                                <div class="text-xl font-black text-green-500">{{ Math.min(100, getDynamicValue(zone.id,
                                    90, 100)) }}%</div>
                                <div class="text-[10px] text-gray-500 dark:text-gray-400 font-bold">Target: 98%</div>
                            </div>
                        </div>

                        <!-- Active Alerts -->
                        <div class="space-y-2">
                            <div class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Active Alerts
                            </div>
                            <div v-if="zone.status === 'Alert' || getDynamicValue(zone.id, 0, 5) > 3"
                                class="bg-red-50 dark:bg-red-900/10 p-3 rounded-lg border border-red-100 dark:border-red-500/20 flex gap-3">
                                <span class="material-symbols-outlined text-red-500 text-[20px]">warning</span>
                                <div>
                                    <div class="text-xs font-bold text-red-700 dark:text-red-400">Bottleneck Detected
                                    </div>
                                    <div class="text-[10px] text-red-600/80 dark:text-red-400/70 mt-1">High traffic in
                                        aisles 3 and 4. Needs immediate attention.</div>
                                </div>
                            </div>
                            <div v-else
                                class="bg-green-50 dark:bg-green-900/10 p-3 rounded-lg border border-green-100 dark:border-green-500/20 text-center text-xs text-green-600 dark:text-green-400">
                                No active alerts. Operations normal.
                            </div>
                        </div>

                        <!-- System Health Chart (New) -->
                        <div class="h-32 mt-2">
                            <h4 class="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Throughput Load</h4>
                            <Line :data="getLineChartData(zone.id, 'Throughput')" :options="miniChartOptions" />
                        </div>
                    </div>

                    <!-- 2. Inventory -->
                    <div v-if="activeTab === 'inventory'" class="space-y-4 animate-fade-in">
                        <div
                            class="p-4 bg-gray-50 dark:bg-white/10 border border-gray-100 dark:border-white/10 rounded-xl relative overflow-hidden">
                            <h4 class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-3">Capacity
                                Utilization</h4>
                            <div
                                class="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-white dark:from-white/5 to-transparent">
                            </div>
                            <div class="flex items-center gap-4 relative z-10">
                                <!-- Simple Circle -->
                                <div class="w-16 h-16 rounded-full border-4 flex items-center justify-center font-bold text-sm text-gray-900 dark:text-white"
                                    :class="[
                                        zone.status === 'Alert' || zone.status === 'Full' ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'
                                    ]">
                                    {{ zone.value === 'Full' ? '100%' : (zone.value || getDynamicValue(zone.id, 65, 95)
                                    + '%') }}
                                </div>
                                <div class="flex-1 space-y-1">
                                    <div class="flex justify-between text-xs">
                                        <span class="text-gray-500 dark:text-gray-400">Total Space</span>
                                        <span class="font-bold text-gray-900 dark:text-white">100 Racks</span>
                                    </div>
                                    <div class="flex justify-between text-xs">
                                        <span class="text-gray-500 dark:text-gray-400">Used</span>
                                        <span class="font-bold text-indigo-500">{{ (getDynamicValue(zone.id, 65,
                                            95)).toLocaleString() }} Racks</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <!-- Stock Trend Chart (New) -->
                        <div class="h-32">
                            <h4 class="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Stock Trend (30 Days)</h4>
                            <Line :data="getLineChartData(zone.id, 'Stock', 'purple')" :options="miniChartOptions" />
                        </div>
                    </div>

                    <!-- 3. Labor -->
                    <div v-if="activeTab === 'labor'" class="space-y-4 animate-fade-in">
                        <div
                            class="flex items-center justify-between p-3 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl shadow-sm">
                            <div class="flex items-center gap-3">
                                <div
                                    class="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                    <span class="material-symbols-outlined">how_to_reg</span>
                                </div>
                                <div>
                                    <div class="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold">Active
                                        Pickers</div>
                                    <div class="text-lg font-bold text-gray-900 dark:text-white">{{
                                        getDynamicValue(zone.id, 5, 15) }}/15</div>
                                </div>
                            </div>
                            <div class="text-right">
                                <div class="text-xs text-green-500 font-bold">Optimal</div>
                                <div class="text-[10px] text-gray-500 dark:text-gray-400">Staffing</div>
                            </div>
                        </div>

                        <div class="space-y-2">
                            <h4 class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Top Performers</h4>
                            <div class="p-2 flex items-center gap-2 bg-gray-50 dark:bg-white/5 rounded-lg">
                                <span class="material-symbols-outlined text-green-500 text-[16px]">verified</span>
                                <div class="flex-1 text-xs font-medium text-gray-700 dark:text-gray-300">Michael T.
                                </div>
                                <div class="text-[10px] text-green-600 font-bold">120 picks/hr</div>
                            </div>
                            <div class="p-2 flex items-center gap-2 bg-gray-50 dark:bg-white/5 rounded-lg">
                                <span class="material-symbols-outlined text-green-500 text-[16px]">verified</span>
                                <div class="flex-1 text-xs font-medium text-gray-700 dark:text-gray-300">Sarah M.</div>
                                <div class="text-[10px] text-green-600 font-bold">115 picks/hr</div>
                            </div>
                        </div>

                        <!-- Labor Distribution -->
                        <div class="h-40 flex justify-center mt-2 relative">
                            <Doughnut :data="getLaborData(zone.id)"
                                :options="{ maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { boxWidth: 10, font: { size: 10 } } } } }" />
                            <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <span class="text-[10px] font-bold text-gray-400 mt-8">Roles</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Notification Toast -->
        <div v-if="notification" class="fixed bottom-6 right-6 z-50 animate-fade-in-up transition-all cursor-pointer"
            @click="notification = null">
            <div
                class="px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 border backdrop-blur-md bg-blue-50/90 dark:bg-blue-900/90 border-blue-200 dark:border-blue-700 text-blue-800 dark:text-blue-100">
                <span class="material-symbols-outlined text-2xl">info</span>
                <span class="font-bold text-sm">{{ notification }}</span>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onBeforeUnmount } from 'vue'
import { useWarehouseFloorStore } from '@/stores/warehouseFloorStore'
import {
    Chart as ChartJS,
    Title,
    Tooltip,
    Legend,
    BarElement,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    ArcElement
} from 'chart.js'
import { Bar, Doughnut, Line } from 'vue-chartjs'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, PointElement, LineElement, ArcElement)

const store = useWarehouseFloorStore()
const timeRange = ref('today')
const activeTab = ref('performance')
const notification = ref(null)

// Tabs Structure tailored for Warehouse Zones
const tabs = [
    { id: 'performance', label: 'Performance', icon: 'monitoring' },
    { id: 'inventory', label: 'Inventory', icon: 'inventory_2' },
    { id: 'labor', label: 'Labor', icon: 'groups' }
]

const onDrop = (event) => {
    try {
        const zoneIdStr = event.dataTransfer.getData('zoneId')
        if (zoneIdStr) {
            const dataStr = event.dataTransfer.getData('text/plain')
            const zoneData = JSON.parse(dataStr)

            // Check if already in comparison store
            if (!store.comparedZones) {
                store.comparedZones = []
            }

            if (zoneData && !store.comparedZones.find(z => z.id === zoneData.id)) {
                store.comparedZones.push(zoneData)
            }
        }
    } catch (e) {
        console.error("Drop failed", e)
    }
}

const removeZone = (id) => {
    if (store.comparedZones) {
        store.comparedZones = store.comparedZones.filter(z => z.id !== id)
    }
}

onBeforeUnmount(() => {
    if (store.comparedZones) {
        store.comparedZones = []
    }
})

// Pseudo-random value generator based on ID to be consistent but varied
const getDynamicValue = (seed, min, max) => {
    let numericSeed = 0;
    if (typeof seed === 'string') {
        for (let i = 0; i < seed.length; i++) numericSeed += seed.charCodeAt(i);
    } else {
        numericSeed = seed;
    }

    const x = Math.sin(numericSeed * 9999 + (timeRange.value.length * 10)) * 10000;
    const random = x - Math.floor(x);

    return Math.floor(random * (max - min + 1)) + min;
}

// Chart Data Generators
const getLineChartData = (seed, label, color = 'blue') => {
    const data = [
        getDynamicValue(seed, 10, 50),
        getDynamicValue(seed + '1', 10, 50),
        getDynamicValue(seed + '2', 10, 50),
        getDynamicValue(seed + '3', 10, 50),
        getDynamicValue(seed + '4', 10, 50),
    ]
    return {
        labels: ['M', 'T', 'W', 'T', 'F'],
        datasets: [{
            label: label,
            data: data,
            borderColor: color === 'purple' ? '#8b5cf6' : color === 'green' ? '#10b981' : '#3b82f6',
            backgroundColor: color === 'purple' ? 'rgba(139, 92, 246, 0.1)' : color === 'green' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(59, 130, 246, 0.1)',
            fill: true,
            tension: 0.4,
            pointRadius: 2
        }]
    }
}

const getLaborData = (seed) => {
    return {
        labels: ['Pickers', 'Stowers', 'QA'],
        datasets: [{
            data: [
                getDynamicValue(seed, 10, 20),
                getDynamicValue(seed + '1', 5, 15),
                getDynamicValue(seed + '2', 2, 5)
            ],
            backgroundColor: ['#8b5cf6', '#3b82f6', '#10b981'],
            borderWidth: 0
        }]
    }
}

const miniChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { display: false },
        tooltip: { enabled: true }
    },
    scales: {
        x: {
            display: true,
            grid: { display: false },
            ticks: { font: { size: 10 } }
        },
        y: {
            display: true,
            ticks: { font: { size: 10 } }
        }
    }
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
    width: 4px;
}

.custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: rgba(156, 163, 175, 0.3);
    border-radius: 20px;
}
</style>
