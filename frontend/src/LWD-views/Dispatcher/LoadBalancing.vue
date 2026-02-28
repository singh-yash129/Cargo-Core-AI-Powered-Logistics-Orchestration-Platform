<template>
    <div class="space-y-6">
        <!-- Header -->
        <div class="flex justify-between items-center">
            <div>
                <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Load Balancing Engine</h2>
                <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Monitor and balance workload across drivers — prevent overload, eliminate idle capacity</p>
            </div>
            <div class="flex gap-2">
                <button @click="autoBalance"
                    class="bg-purple-100 dark:bg-purple-500/10 hover:bg-purple-200 dark:hover:bg-purple-500/20 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20 py-2 px-4 rounded-lg transition-colors flex items-center gap-2 text-sm font-bold">
                    <span class="material-symbols-outlined text-[18px]">balance</span> Auto-Balance
                </button>
                <button @click="applyChanges" :disabled="!hasUnsavedChanges || changesSaved"
                    class="bg-primary hover:bg-primary-dark text-black font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                    :class="{ 'animate-pulse ring-2 ring-primary/40': hasUnsavedChanges && !changesSaved }">
                    <span v-if="changesSaved" class="material-symbols-outlined text-[18px]">check_circle</span>
                    <span v-else class="material-symbols-outlined text-[18px]">save</span>
                    {{ changesSaved ? '✓ Saved' : hasUnsavedChanges ? `Apply Changes (${pendingChanges.length})` : 'No Changes' }}
                </button>
            </div>
        </div>

        <!-- Balance Overview -->
        <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div class="glass-panel p-4 rounded-xl text-center">
                <div class="text-2xl font-bold text-gray-900 dark:text-white">{{ activeDrivers.length }}</div>
                <div class="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-1">Active Drivers</div>
            </div>
            <div class="glass-panel p-4 rounded-xl text-center">
                <div class="text-2xl font-bold" :class="balanceScore >= 80 ? 'text-green-600 dark:text-green-400' : balanceScore >= 60 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'">{{ balanceScore }}%</div>
                <div class="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-1">Balance Score</div>
            </div>
            <div class="glass-panel p-4 rounded-xl text-center">
                <div class="text-2xl font-bold text-red-600 dark:text-red-400">{{ overloadedCount }}</div>
                <div class="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-1">Overloaded</div>
            </div>
            <div class="glass-panel p-4 rounded-xl text-center">
                <div class="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{{ idleCount }}</div>
                <div class="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-1">Underutilized</div>
            </div>
            <div class="glass-panel p-4 rounded-xl text-center">
                <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">{{ emptyMilesPercent }}%</div>
                <div class="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-1">Empty Miles</div>
            </div>
        </div>

        <!-- Imbalance Alert -->
        <div v-if="overloadedCount > 0" class="p-4 bg-red-100 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl flex items-center gap-3">
            <span class="material-symbols-outlined text-red-600 dark:text-red-400 animate-pulse">warning</span>
            <div>
                <div class="text-sm font-bold text-red-700 dark:text-red-400">Workload Imbalance Detected</div>
                <div class="text-xs text-red-600 dark:text-red-300">{{ overloadedCount }} driver(s) are over capacity while {{ idleCount }} driver(s) have remaining capacity. Auto-balance recommended.</div>
            </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Driver Workload Cards -->
            <div class="lg:col-span-2 space-y-4">
                <div class="glass-panel rounded-xl p-4">
                    <h3 class="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <span class="material-symbols-outlined text-gray-400 text-[20px]">groups</span>
                        Driver Workload Distribution
                    </h3>

                    <!-- Visual Balance Bar - Chart.js -->
                    <div class="mb-6 p-4 bg-gray-100 dark:bg-black/20 rounded-xl">
                        <div class="h-40">
                            <Bar :data="balanceChartData" :options="balanceChartOptions" />
                        </div>
                        <div class="mt-2 flex justify-between items-center">
                            <div class="flex gap-4 text-[10px]">
                                <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-green-500"></span> Optimal (40-75%)</span>
                                <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-yellow-500"></span> Underloaded (&lt;40%)</span>
                                <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-red-500"></span> Overloaded (&gt;85%)</span>
                            </div>
                        </div>
                    </div>

                    <!-- Driver Detail Table -->
                    <div class="overflow-x-auto">
                        <table class="w-full text-left text-sm">
                            <thead class="bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-gray-400 uppercase text-[10px] tracking-wider">
                                <tr>
                                    <th class="p-3">Driver</th>
                                    <th class="p-3">Vehicle</th>
                                    <th class="p-3">Load (kg)</th>
                                    <th class="p-3">Utilization</th>
                                    <th class="p-3">Hours Left</th>
                                    <th class="p-3">Route Dist.</th>
                                    <th class="p-3">Stops</th>
                                    <th class="p-3">Status</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-200 dark:divide-white/5">
                                <tr v-for="driver in activeDrivers" :key="driver.id" class="hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
                                    <td class="p-3">
                                        <div class="flex items-center gap-2">
                                            <img :src="driver.avatar" class="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700">
                                            <div>
                                                <div class="font-bold text-gray-900 dark:text-white text-xs">{{ driver.name }}</div>
                                                <div class="text-[10px] text-gray-500">{{ driver.id }}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td class="p-3 text-gray-600 dark:text-gray-300 text-xs">{{ driver.vehicle }}</td>
                                    <td class="p-3 text-xs">
                                        <span class="text-gray-900 dark:text-white font-mono">{{ driver.currentLoad }}</span>
                                        <span class="text-gray-500"> / {{ driver.maxCapacity }}</span>
                                    </td>
                                    <td class="p-3">
                                        <div class="flex items-center gap-2">
                                            <div class="w-16 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                <div class="h-full rounded-full" :class="getLoadBarClass(driver.loadPercent)"
                                                    :style="{ width: driver.loadPercent + '%' }"></div>
                                            </div>
                                            <span class="text-xs font-mono" :class="getLoadTextClass(driver.loadPercent)">{{ driver.loadPercent }}%</span>
                                        </div>
                                    </td>
                                    <td class="p-3">
                                        <span class="text-xs font-mono" :class="driver.hoursLeft <= 2 ? 'text-red-400' : 'text-gray-900 dark:text-white'">
                                            {{ driver.hoursLeft }}h
                                        </span>
                                    </td>
                                    <td class="p-3 text-xs text-gray-600 dark:text-gray-300">{{ driver.routeDistance }} km</td>
                                    <td class="p-3 text-xs text-gray-600 dark:text-gray-300">{{ driver.stops }}</td>
                                    <td class="p-3">
                                        <span class="px-2 py-0.5 rounded text-[9px] font-bold" :class="getBalanceStatusClass(driver.loadPercent)">
                                            {{ getBalanceStatus(driver.loadPercent) }}
                                        </span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- Right Panel: Empty Miles & Suggestions -->
            <div class="space-y-4">
                <!-- Empty Miles Tracker -->
                <div class="glass-panel p-5 rounded-xl">
                    <h3 class="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <span class="material-symbols-outlined text-red-400 text-[20px]">route</span>
                        Empty Miles Tracker
                    </h3>
                    <div class="space-y-4">
                        <div class="text-center">
                            <div class="relative inline-flex items-center justify-center w-28 h-28">
                                <Doughnut :data="emptyMilesDonutData" :options="emptyMilesDonutOptions" />
                            </div>
                        </div>
                        <div class="space-y-2">
                            <div class="flex justify-between text-xs">
                                <span class="text-gray-500 dark:text-gray-400">Total Miles Today</span>
                                <span class="text-gray-900 dark:text-white font-mono">2,840 km</span>
                            </div>
                            <div class="flex justify-between text-xs">
                                <span class="text-gray-500 dark:text-gray-400">Loaded Miles</span>
                                <span class="text-green-600 dark:text-green-400 font-mono">2,414 km</span>
                            </div>
                            <div class="flex justify-between text-xs">
                                <span class="text-gray-500 dark:text-gray-400">Empty Miles</span>
                                <span class="text-red-600 dark:text-red-400 font-mono">426 km</span>
                            </div>
                            <div class="flex justify-between text-xs pt-2 border-t border-gray-200 dark:border-white/5">
                                <span class="text-gray-500 dark:text-gray-400">Predicted Empty %</span>
                                <span class="text-yellow-600 dark:text-yellow-400 font-mono">{{ emptyMilesPercent }}%</span>
                            </div>
                            <div class="flex justify-between text-xs">
                                <span class="text-gray-500 dark:text-gray-400">After Optimization</span>
                                <span class="text-green-600 dark:text-green-400 font-mono">{{ Math.max(5, emptyMilesPercent - 7) }}%</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- AI Suggestions -->
                <div class="glass-panel p-5 rounded-xl">
                    <h3 class="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <span class="material-symbols-outlined text-purple-400 text-[20px]">auto_fix_high</span>
                        Balance Suggestions
                    </h3>
                    <div class="space-y-3">
                        <div v-for="(sug, idx) in balanceSuggestions" :key="idx"
                            class="p-3 bg-gray-50 dark:bg-white/5 rounded-lg border border-gray-200 dark:border-white/5 hover:border-purple-400/40 dark:hover:border-purple-500/30 transition-all cursor-pointer">
                            <div class="text-xs font-bold mb-1" :class="sug.colorLight + ' ' + sug.colorDark">{{ sug.title }}</div>
                            <div class="text-[10px] text-gray-500 dark:text-gray-400">{{ sug.desc }}</div>
                            <button @click="applySuggestion(idx)" :disabled="sug.applied"
                                class="mt-2 text-[10px] font-bold transition-colors disabled:cursor-not-allowed"
                                :class="sug.applied ? 'text-green-600 dark:text-green-400' : sug.colorLight + ' ' + sug.colorDark + ' hover:underline'">
                                {{ sug.applied ? '✓ Applied' : 'Apply' }}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
  
        <!-- Save Toast -->
        <Transition enter-active-class="transition ease-out duration-300" enter-from-class="translate-y-4 opacity-0" enter-to-class="translate-y-0 opacity-100" leave-active-class="transition ease-in duration-200" leave-from-class="translate-y-0 opacity-100" leave-to-class="translate-y-4 opacity-0">
            <div v-if="saveToast" class="fixed bottom-6 right-6 z-50 bg-primary text-black font-bold px-5 py-3 rounded-lg shadow-lg text-sm flex items-center gap-2">
                <span class="material-symbols-outlined text-[18px]">check_circle</span>
                {{ saveToast }}
            </div>
        </Transition>

    <!-- Apply Changes Confirm Modal -->
    <Teleport to="body">
        <Transition enter-active-class="transition ease-out duration-200" enter-from-class="opacity-0" enter-to-class="opacity-100" leave-active-class="transition ease-in duration-150" leave-from-class="opacity-100" leave-to-class="opacity-0">
            <div v-if="showApplyConfirm" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center" @click.self="showApplyConfirm = false">
                <div class="bg-white dark:bg-card-dark shadow-2xl rounded-2xl p-6 w-full max-w-md m-4 border border-gray-200 dark:border-white/10">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <span class="material-symbols-outlined text-primary text-[20px]">save</span>
                            Confirm Changes
                        </h3>
                        <button @click="showApplyConfirm = false" class="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors">
                            <span class="material-symbols-outlined">close</span>
                        </button>
                    </div>
                    <p class="text-sm text-gray-600 dark:text-gray-300 mb-4">The following changes will be committed to driver assignments:</p>
                    <div class="space-y-2 mb-4 max-h-48 overflow-y-auto no-scrollbar">
                        <div v-for="(change, i) in pendingChanges" :key="i"
                            class="p-2.5 bg-gray-50 dark:bg-white/5 rounded-lg border border-gray-200 dark:border-white/10 text-xs">
                            <div class="flex items-start gap-2">
                                <span class="material-symbols-outlined text-primary text-[14px] mt-0.5">{{ change.icon }}</span>
                                <div>
                                    <div class="font-bold text-gray-900 dark:text-white">{{ change.action }}</div>
                                    <div class="text-gray-500 dark:text-gray-400">{{ change.detail }}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="p-3 bg-green-100 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 rounded-lg mb-4 text-xs text-green-700 dark:text-green-400">
                        <div class="font-bold mb-1">After applying:</div>
                        <div>• Balance Score: {{ balanceScore }}%</div>
                        <div>• Empty Miles: {{ emptyMilesPercent }}%</div>
                        <div>• Overloaded: {{ overloadedCount }} • Underutilized: {{ idleCount }}</div>
                    </div>
                    <div class="flex gap-2">
                        <button @click="confirmApplyChanges" class="flex-1 bg-primary hover:bg-primary-dark text-black font-bold py-2.5 rounded-lg text-sm transition-colors">Confirm & Save</button>
                        <button @click="showApplyConfirm = false" class="flex-1 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-900 dark:text-white py-2.5 rounded-lg text-sm transition-colors">Cancel</button>
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>

    <!-- Auto-Balance Confirm Modal -->
    <Teleport to="body">
    <div v-if="showAutoBalanceConfirm" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center" @click.self="showAutoBalanceConfirm = false">
        <div class="bg-white dark:bg-card-dark shadow-2xl rounded-2xl p-6 w-full max-w-md m-4 border border-gray-200 dark:border-white/10">
            <h3 class="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <span class="material-symbols-outlined text-purple-600 dark:text-purple-400">balance</span> Confirm Auto-Balance
            </h3>
            <p class="text-sm text-gray-600 dark:text-gray-300 mb-4">
                This will redistribute loads across <strong>{{ activeDrivers.length }}</strong> drivers to achieve optimal balance.
                Overloaded drivers will have orders transferred to underutilized ones.
            </p>
            <div class="p-3 bg-purple-100 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 rounded-lg mb-4 text-xs text-purple-700 dark:text-purple-400">
                <div class="font-bold mb-1">Estimated Impact:</div>
                <div>• Balance Score: {{ balanceScore }}% → 88%</div>
                <div>• Empty Miles: {{ emptyMilesPercent }}% → 9%</div>
                <div>• {{ overloadedCount }} overloaded driver(s) will be rebalanced</div>
            </div>
            <div class="flex gap-2">
                <button @click="confirmAutoBalance" class="flex-1 bg-purple-500 hover:bg-purple-600 text-white font-bold py-2.5 rounded-lg text-sm transition-colors">Confirm Balance</button>
                <button @click="showAutoBalanceConfirm = false" class="flex-1 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-900 dark:text-white py-2.5 rounded-lg text-sm transition-colors">Cancel</button>
            </div>
        </div>
    </div>
    </Teleport>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Bar, Doughnut } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip)

const balanceScore = ref(68)
const emptyMilesPercent = ref(15)
const changesSaved = ref(false)
const saveToast = ref('')
const showAutoBalanceConfirm = ref(false)
const showApplyConfirm = ref(false)
const pendingChanges = ref([])
const hasUnsavedChanges = computed(() => pendingChanges.value.length > 0)

const activeDrivers = ref([
    { id: 'DRV-001', name: 'Mike Ross', vehicle: 'Van T-20', currentLoad: 1900, maxCapacity: 2000, loadPercent: 95, hoursLeft: 2.1, routeDistance: 145, stops: 18, avatar: 'https://i.pravatar.cc/150?u=1' },
    { id: 'DRV-042', name: 'Harvey Specter', vehicle: 'Truck XL', currentLoad: 2800, maxCapacity: 5000, loadPercent: 56, hoursLeft: 5.5, routeDistance: 88, stops: 8, avatar: 'https://i.pravatar.cc/150?u=2' },
    { id: 'DRV-091', name: 'Rachel Zane', vehicle: 'Van T-15', currentLoad: 375, maxCapacity: 1500, loadPercent: 25, hoursLeft: 6.8, routeDistance: 32, stops: 4, avatar: 'https://i.pravatar.cc/150?u=3' },
    { id: 'DRV-103', name: 'Louis Litt', vehicle: 'Van T-20', currentLoad: 0, maxCapacity: 2000, loadPercent: 0, hoursLeft: 8.0, routeDistance: 0, stops: 0, avatar: 'https://i.pravatar.cc/150?u=4' },
    { id: 'DRV-055', name: 'Jessica Pearson', vehicle: 'Truck M', currentLoad: 2600, maxCapacity: 3000, loadPercent: 87, hoursLeft: 1.5, routeDistance: 180, stops: 22, avatar: 'https://i.pravatar.cc/150?u=5' },
    { id: 'DRV-077', name: 'Donna Paulsen', vehicle: 'Van T-15', currentLoad: 900, maxCapacity: 1500, loadPercent: 60, hoursLeft: 4.0, routeDistance: 65, stops: 10, avatar: 'https://i.pravatar.cc/150?u=6' },
])

const overloadedCount = computed(() => activeDrivers.value.filter(d => d.loadPercent > 85).length)
const idleCount = computed(() => activeDrivers.value.filter(d => d.loadPercent < 40).length)

// Chart.js Balance Bar
const balanceChartData = computed(() => ({
    labels: activeDrivers.value.map(d => d.name.split(' ')[0]),
    datasets: [{
        label: 'Load %',
        data: activeDrivers.value.map(d => d.loadPercent),
        backgroundColor: activeDrivers.value.map(d =>
            d.loadPercent > 85 ? 'rgba(239,68,68,0.8)' : d.loadPercent >= 40 ? 'rgba(34,197,94,0.8)' : d.loadPercent > 0 ? 'rgba(234,179,8,0.8)' : 'rgba(107,114,128,0.4)'
        ),
        borderColor: activeDrivers.value.map(d =>
            d.loadPercent > 85 ? 'rgb(239,68,68)' : d.loadPercent >= 40 ? 'rgb(34,197,94)' : d.loadPercent > 0 ? 'rgb(234,179,8)' : 'rgba(107,114,128,0.6)'
        ),
        borderWidth: 1.5, borderRadius: 4,
    }]
}))
const balanceChartOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { backgroundColor: '#111', titleColor: '#fff', bodyColor: '#ccc', callbacks: { label: (ctx) => `${activeDrivers.value[ctx.dataIndex].name}: ${ctx.parsed.y}% (${activeDrivers.value[ctx.dataIndex].currentLoad}/${activeDrivers.value[ctx.dataIndex].maxCapacity} kg)` } } },
    scales: {
        x: { grid: { display: false }, ticks: { color: '#6b7280', font: { size: 10, weight: '500' } } },
        y: { grid: { color: 'rgba(156,163,175,0.2)' }, ticks: { color: '#6b7280', font: { size: 9 } }, beginAtZero: true, max: 100 }
    }
}

// Chart.js Donut
const emptyMilesDonutData = computed(() => ({
    labels: ['Loaded', 'Empty'],
    datasets: [{
        data: [100 - emptyMilesPercent.value, emptyMilesPercent.value],
        backgroundColor: ['rgba(34,197,94,0.75)', 'rgba(239,68,68,0.75)'],
        borderColor: ['rgb(34,197,94)', 'rgb(239,68,68)'],
        borderWidth: 1.5, cutout: '68%',
    }]
}))
const emptyMilesDonutOptions = {
    responsive: true, maintainAspectRatio: true,
    plugins: { legend: { display: false }, tooltip: { backgroundColor: '#111', bodyColor: '#ccc' } }
}

const balanceSuggestions = ref([
    { title: 'Transfer 2 orders from Mike → Rachel', desc: 'Mike at 95% load, Rachel at 25%. Transfer ORD-9921 and ORD-8843 to balance.', colorLight: 'text-purple-700', colorDark: 'dark:text-purple-400', applied: false },
    { title: 'Combine return loads for DRV-042', desc: 'Harvey returning empty from Downtown. Route passes 3 pending pickups.', colorLight: 'text-blue-700', colorDark: 'dark:text-blue-400', applied: false },
    { title: 'Reassign Zone C to idle driver', desc: 'Louis is idle near Central Depot. 4 Zone C orders can be assigned (saves 18km empty miles).', colorLight: 'text-green-700', colorDark: 'dark:text-green-400', applied: false },
])

function applySuggestion(idx) {
    if (balanceSuggestions.value[idx].applied) return
    balanceSuggestions.value[idx].applied = true
    const sug = balanceSuggestions.value[idx]
    if (idx === 0) {
        activeDrivers.value[0].loadPercent = 72; activeDrivers.value[0].currentLoad = 1440
        activeDrivers.value[2].loadPercent = 55; activeDrivers.value[2].currentLoad = 825
        pendingChanges.value.push({ icon: 'swap_horiz', action: 'Transfer orders: Mike → Rachel', detail: 'ORD-9921 & ORD-8843 moved. Mike 95%→72%, Rachel 25%→55%' })
    } else if (idx === 1) {
        activeDrivers.value[1].loadPercent = 64; activeDrivers.value[1].currentLoad = 3200
        pendingChanges.value.push({ icon: 'local_shipping', action: 'Combine return loads for Harvey', detail: '3 pending pickups added to return route. Load 56%→64%' })
    } else if (idx === 2) {
        activeDrivers.value[3].loadPercent = 45; activeDrivers.value[3].currentLoad = 900; activeDrivers.value[3].stops = 4
        pendingChanges.value.push({ icon: 'person_add', action: 'Assign Zone C to Louis (idle)', detail: '4 Zone C orders assigned. Saves 18km empty miles. Load 0%→45%' })
    }
    balanceScore.value = Math.min(95, balanceScore.value + 8)
    emptyMilesPercent.value = Math.max(5, emptyMilesPercent.value - 3)
}

function applyChanges() {
    showApplyConfirm.value = true
}

function confirmApplyChanges() {
    showApplyConfirm.value = false
    changesSaved.value = true
    const count = pendingChanges.value.length
    saveToast.value = `${count} change(s) saved — balance now ${balanceScore.value}%, empty miles ${emptyMilesPercent.value}%`
    pendingChanges.value = []
    setTimeout(() => { changesSaved.value = false; saveToast.value = '' }, 3000)
}

function getLoadBarClass(percent) {
    if (percent > 85) return 'bg-red-500'
    if (percent >= 40) return 'bg-green-500'
    if (percent > 0) return 'bg-yellow-500'
    return 'bg-gray-600'
}

function getLoadTextClass(percent) {
    if (percent > 85) return 'text-red-600 dark:text-red-400'
    if (percent >= 40) return 'text-green-600 dark:text-green-400'
    if (percent > 0) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-gray-500'
}

function getBalanceStatus(percent) {
    if (percent > 85) return 'OVERLOADED'
    if (percent >= 40) return 'OPTIMAL'
    if (percent > 0) return 'UNDERUSED'
    return 'IDLE'
}

function getBalanceStatusClass(percent) {
    if (percent > 85) return 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-500/20'
    if (percent >= 40) return 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-500/20'
    if (percent > 0) return 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-500/20'
    return 'bg-gray-100 dark:bg-gray-500/20 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-500/20'
}

function autoBalance() {
    showAutoBalanceConfirm.value = true
}

function confirmAutoBalance() {
    balanceScore.value = 88
    activeDrivers.value[0].loadPercent = 72; activeDrivers.value[0].currentLoad = 1440
    activeDrivers.value[2].loadPercent = 55; activeDrivers.value[2].currentLoad = 825
    activeDrivers.value[3].loadPercent = 40; activeDrivers.value[3].currentLoad = 800
    activeDrivers.value[4].loadPercent = 68; activeDrivers.value[4].currentLoad = 2040
    emptyMilesPercent.value = 9
    showAutoBalanceConfirm.value = false
    pendingChanges.value.push({ icon: 'balance', action: 'Auto-Balance executed', detail: `All ${activeDrivers.value.length} drivers rebalanced. Score →88%, empty miles →9%` })
}
</script>
