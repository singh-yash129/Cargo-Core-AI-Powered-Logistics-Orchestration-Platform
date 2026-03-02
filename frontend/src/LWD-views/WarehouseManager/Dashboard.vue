<template>
    <div class="space-y-6">
        <!-- Top KPI Cards -->
        <div class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div class="glass-panel p-4 rounded-xl flex flex-col justify-between h-32 relative overflow-hidden group">
                <div class="absolute right-0 top-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                    <span class="material-symbols-outlined text-4xl text-teal-500">inventory_2</span>
                </div>
                <div class="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Total
                    Inventory Value</div>
                <div class="flex items-baseline gap-1">
                    <span class="text-2xl font-bold text-gray-900 dark:text-white">$4.2M</span>
                    <span class="text-xs text-green-600 dark:text-green-400">+12%</span>
                </div>
                <div class="w-full bg-gray-100 dark:bg-gray-800 h-1 mt-2 rounded-full overflow-hidden">
                    <div class="bg-teal-500 h-full w-[85%]"></div>
                </div>
            </div>

            <div
                class="glass-panel p-4 rounded-xl flex flex-col justify-between h-32 group border-l-4 border-yellow-500">
                <div class="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Orders
                    Pending Pick</div>
                <div class="flex items-baseline gap-1">
                    <span class="text-3xl font-bold text-gray-900 dark:text-white">{{ pendingOrdersCount }}</span>
                    <span class="text-xs text-yellow-500">Critical</span>
                </div>
                <div class="text-xs text-gray-500">Avg Pick Time: 12m</div>
            </div>

            <div class="glass-panel p-4 rounded-xl flex flex-col justify-between h-32 group">
                <div class="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Ready for
                    Dispatch</div>
                <div class="flex items-baseline gap-1">
                    <span class="text-3xl font-bold text-gray-900 dark:text-white">{{ readyForDispatch }}</span>
                </div>
                <div class="text-xs text-blue-400 flex items-center gap-1">
                    <span class="material-symbols-outlined text-[14px]">local_shipping</span> Next Truck: 15m
                </div>
            </div>

            <div class="glass-panel p-4 rounded-xl flex flex-col justify-between h-32 group">
                <div class="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Labor Active
                </div>
                <div class="flex items-baseline gap-1">
                    <span class="text-3xl font-bold text-gray-900 dark:text-white">{{ activeLabor }}</span>
                    <span class="text-xs text-gray-500">/ {{ totalLabor }}</span>
                </div>
                <div class="flex -space-x-2 mt-2">
                    <div class="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 border border-black"></div>
                    <div class="w-6 h-6 rounded-full bg-gray-600 border border-black"></div>
                    <div
                        class="w-6 h-6 rounded-full bg-gray-500 border border-black flex items-center justify-center text-[8px] text-gray-900 dark:text-white">
                        +{{ activeLabor - 2 }}</div>
                </div>
            </div>

            <!-- Dynamic Restock KPI Card -->
            <div class="glass-panel p-4 rounded-xl flex flex-col justify-between h-32 group transition-colors"
                :class="criticalSkus.length > 0 ? 'bg-red-50 dark:bg-red-900/10 border-red-500/20' : 'bg-green-50 dark:bg-green-900/10 border-green-500/20'">
                <div class="text-xs font-semibold uppercase tracking-wide"
                    :class="criticalSkus.length > 0 ? 'text-red-600 dark:text-red-300' : 'text-green-600 dark:text-green-300'">
                    Safety Stock Alerts
                </div>
                <div class="flex items-baseline gap-1">
                    <span class="text-3xl font-bold text-gray-900 dark:text-white">{{ criticalSkus.length }}</span>
                    <span v-if="criticalSkus.length > 0" class="text-xs text-red-600 dark:text-red-400">SKUs Warning</span>
                    <span v-else class="text-xs text-green-600 dark:text-green-400">All Good</span>
                </div>
                <button v-if="criticalSkus.length > 0" @click="showRestockModal = true"
                    class="text-xs bg-red-500/20 hover:bg-red-500/30 text-red-600 dark:text-red-300 py-1 px-2 rounded transition-colors w-fit shadow-sm">
                    Restock Now
                </button>
                <div v-else class="text-xs text-green-600 dark:text-green-500/70 py-1 font-medium">Fully Stocked</div>
            </div>
        </div>

        <!-- Charts Row -->
        <div class="glass-panel p-5 rounded-xl h-[300px] md:h-[400px] flex flex-col">
            <div class="flex justify-between items-center mb-2">
                <h3 class="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <span class="material-symbols-outlined text-teal-500">trending_up</span>
                    Daily Throughput (Picks per Hour)
                </h3>
            </div>
            <div class="flex-1 relative w-full h-full">
                <Line :data="throughputChartData" :options="lineChartOptions" />
            </div>
        </div>

        <!-- Secondary Charts Row -->
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">

            <!-- 1. Orders VS Returns (Bar) -->
            <div class="glass-panel p-5 rounded-xl flex flex-col transition-transform hover:scale-[1.01] h-64 md:h-80">
                <h3 class="font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-2 shrink-0">
                    <span class="material-symbols-outlined text-blue-400">compare_arrows</span>
                    Orders vs Returns
                </h3>
                <div class="relative flex-1 w-full min-h-0">
                    <Bar :data="ordersReturnsData" :options="barOptions" class="absolute inset-0 pb-2" />
                </div>
            </div>

            <!-- 2. Stock vs Packaging (Pie) -->
            <div class="glass-panel p-5 rounded-xl flex flex-col transition-transform hover:scale-[1.01] h-64 md:h-80">
                <h3 class="font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-2 shrink-0">
                    <span class="material-symbols-outlined text-purple-400">inventory</span>
                    Inventory Composition
                </h3>
                <div class="relative flex-1 w-full min-h-0">
                    <Pie :data="stockPackagingData" :options="pieOptions" class="absolute inset-0 pb-2" />
                </div>
            </div>

            <!-- 3. Active Workers vs Drivers (Doughnut) -->
            <div
                class="glass-panel p-5 rounded-xl flex flex-col transition-transform hover:scale-[1.01] h-64 md:h-80 sm:col-span-2 md:col-span-1">
                <h3 class="font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-2 shrink-0">
                    <span class="material-symbols-outlined text-yellow-400">group</span>
                    On-Site Labor
                </h3>
                <div class="relative flex-1 w-full min-h-0">
                    <Doughnut :data="activeStaffData" :options="doughnutOptions" class="absolute inset-0 pb-2" />
                </div>
            </div>
        </div>

        <!-- Main Content Split -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

            <!-- Center: Interactive Picking Queue Table -->
            <div class="lg:col-span-2 glass-panel rounded-xl flex flex-col overflow-hidden">
                <div
                    class="p-4 border-b border-gray-100 dark:border-white/5 flex flex-wrap gap-4 justify-between items-center bg-gray-100 dark:bg-black/20">
                    <h3 class="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <span class="material-symbols-outlined text-teal-500">list_alt</span>
                        Live Picking Queue
                    </h3>

                    <!-- Dynamic Search & Filters -->
                    <div class="flex gap-2 sm:gap-3 flex-1 justify-end flex-wrap">
                        <div class="relative w-36 sm:w-48">
                            <span
                                class="material-symbols-outlined absolute left-2 top-1.5 text-gray-500 text-[18px]">search</span>
                            <input v-model="searchQuery" type="text" placeholder="Search ID or Staff..."
                                class="w-full bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-lg pl-8 pr-3 py-1 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-teal-500/50 transition-colors">
                        </div>
                        <select v-model="statusFilter"
                            class="bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-lg px-2 py-1 text-sm text-gray-600 dark:text-gray-300 focus:outline-none focus:border-teal-500/50 transition-colors">
                            <option value="" class="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">All Statuses</option>
                            <option value="Pending" class="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">Pending</option>
                            <option value="In Progress" class="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">In Progress</option>
                            <option value="Unassigned" class="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">Unassigned</option>
                            <option value="Review" class="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">Review</option>
                        </select>
                    </div>
                </div>

                <div class="flex-1 overflow-auto">
                    <table class="w-full text-left border-collapse min-w-[600px]">
                        <thead class="bg-gray-50 dark:bg-white/5 sticky top-0 z-10 backdrop-blur-md">
                            <tr class="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                <th class="p-3 font-medium">Order ID</th>
                                <th class="p-3 font-medium">Items</th>
                                <th class="p-3 font-medium">Zone</th>
                                <th class="p-3 font-medium">Priority</th>
                                <th class="p-3 font-medium">Assigned To</th>
                                <th class="p-3 font-medium">Status / Progress</th>
                                <th class="p-3 font-medium text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody class="text-sm divide-y divide-gray-100 dark:divide-white/5">
                            <tr v-for="order in filteredQueue" :key="order.id"
                                class="hover:bg-gray-50 dark:bg-white/5 transition-colors group">
                                <td class="p-3 font-mono text-teal-400">{{ order.id }}</td>
                                <td class="p-3 text-gray-600 dark:text-gray-300">{{ order.items }} items</td>
                                <td class="p-3 text-gray-600 dark:text-gray-300">
                                    <span class="px-2 py-0.5 bg-gray-200 dark:bg-gray-700/50 rounded text-xs">{{ order.zone }}</span>
                                </td>
                                <td class="p-3">
                                    <span v-if="order.priority === 'High'"
                                        class="text-red-600 dark:text-red-400 text-xs font-bold bg-red-500/10 px-2 py-0.5 rounded flex items-center gap-1 w-fit">
                                        <span class="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse"></span> HIGH
                                    </span>
                                    <span v-else class="text-gray-600 dark:text-gray-400 text-xs">Normal</span>
                                </td>
                                <td class="p-3">
                                    <div class="flex items-center gap-2" v-if="order.assigned">
                                        <div
                                            class="w-6 h-6 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-[10px] shadow-sm">
                                            {{ order.assignedInitials }}</div>
                                        <span class="text-gray-600 dark:text-gray-300">{{ order.assigned }}</span>
                                    </div>
                                    <span v-else class="text-gray-500 italic">-- Unassigned --</span>
                                </td>
                                <td class="p-3">
                                    <div class="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                                        <div class="bg-teal-500 h-full transition-all duration-500"
                                            :class="{ 'bg-blue-400': order.status === 'Review' }"
                                            :style="`width: ${order.progress}%`"></div>
                                    </div>
                                    <div class="text-[10px] text-gray-600 dark:text-gray-400 mt-1 font-medium">
                                        <span v-if="order.status === 'Review'" class="text-blue-400">Reviewing</span>
                                        <span v-else-if="order.status === 'Unassigned'"
                                            class="text-gray-500">Waiting</span>
                                        <span v-else>{{ order.progress }}% Picked</span>
                                    </div>
                                </td>
                                <!-- Dynamic Context Menu -->
                                <td class="p-3 relative text-center">
                                    <button @click.stop="toggleActionMenu(order.id)"
                                        class="text-gray-500 hover:text-gray-900 dark:text-white p-1 rounded hover:bg-gray-200 dark:hover:bg-white/10 transition-colors">
                                        <span class="material-symbols-outlined">more_horiz</span>
                                    </button>
                                    <div v-if="activeActionMenu === order.id"
                                        class="absolute right-8 mt-1 w-36 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-white/10 rounded-lg shadow-xl py-1 z-20 text-left">
                                        <button @click="markComplete(order)"
                                            class="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 dark:bg-white/5 text-green-600 dark:text-green-400 flex items-center gap-2">
                                            <span class="material-symbols-outlined text-[14px]">check_circle</span> Mark
                                            Complete
                                        </button>
                                        <button @click="reassign(order)"
                                            class="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 dark:bg-white/5 text-blue-600 dark:text-blue-400 flex items-center gap-2">
                                            <span class="material-symbols-outlined text-[14px]">person_add</span>
                                            Reassign
                                        </button>
                                        <button @click="toggleActionMenu(order.id)"
                                            class="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-400 flex items-center gap-2">
                                            <span class="material-symbols-outlined text-[14px]">close</span> Close
                                        </button>
                                    </div>
                                </td>
                            </tr>
                            <tr v-if="filteredQueue.length === 0">
                                <td colspan="7" class="p-8 text-center text-gray-500">
                                    <span class="material-symbols-outlined text-4xl mb-2 opacity-50">search_off</span>
                                    <p>No matching orders found.</p>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Right: Labor Status & Floor Map -->
            <div class="flex flex-col gap-6">
                <!-- Labor Distribution Chart -->
                <div class="glass-panel p-5 rounded-xl flex-1 flex flex-col">
                    <h3 class="font-bold text-gray-900 dark:text-white mb-2">Real-time Labor Status</h3>

                    <div class="flex-1 relative w-full flex justify-center items-center min-h-[160px]">
                        <Doughnut :data="laborChartData" :options="doughnutOptions" />
                    </div>

                    <div
                        class="mt-4 p-3 bg-gray-50 dark:bg-white/5 rounded-lg border border-gray-100 dark:border-white/5">
                        <div class="text-xs text-gray-600 dark:text-gray-400 mb-1">Efficiency Insight</div>
                        <div class="text-sm text-gray-900 dark:text-white">Picking rate dropped by <span
                                class="text-red-600 dark:text-red-400 font-bold">4%</span> in Zone B due to spill hazard.</div>
                    </div>
                </div>

                <!-- Return Processing Queue (Small) -->
                <div class="glass-panel p-4 rounded-xl space-y-2 bg-gray-100 dark:bg-gray-800/20">
                    <div class="flex justify-between items-center mb-1">
                        <h3 class="font-bold text-gray-900 dark:text-white text-sm">Recent Returns</h3>
                        <span class="text-xs text-gray-500">Today</span>
                    </div>
                    <div
                        class="flex items-center justify-between p-2 rounded bg-gray-100 dark:bg-black/20 text-xs text-gray-600 dark:text-gray-300">
                        <span>Damaged Item #992</span>
                        <span class="text-red-600 dark:text-red-400 font-medium">Scrap</span>
                    </div>
                    <div
                        class="flex items-center justify-between p-2 rounded bg-gray-100 dark:bg-black/20 text-xs text-gray-600 dark:text-gray-300">
                        <span>Wrong Color #221</span>
                        <span class="text-green-600 dark:text-green-400 font-medium">Restock</span>
                    </div>
                    <div
                        class="flex items-center justify-between p-2 rounded bg-gray-100 dark:bg-black/20 text-xs text-gray-600 dark:text-gray-300">
                        <span>Size Mismatch #110</span>
                        <span class="text-green-600 dark:text-green-400 font-medium">Restock</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- DYNAMIC RESTOCK MODAL -->
        <Teleport to="body">
            <div v-if="showRestockModal"
                class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
                <div
                    class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl transform transition-all">
                    <!-- Header -->
                    <div
                        class="p-5 border-b border-gray-200 dark:border-white/10 flex justify-between items-center bg-gradient-to-r from-red-500/20 to-transparent">
                        <h3 class="font-bold text-gray-900 dark:text-white flex items-center gap-2 text-lg">
                            <span class="material-symbols-outlined text-red-600 dark:text-red-400">warning</span>
                            Critical Restock Required
                        </h3>
                        <button @click="showRestockModal = false"
                            class="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:text-white transition-colors">
                            <span class="material-symbols-outlined">close</span>
                        </button>
                    </div>

                    <!-- Body -->
                    <div class="p-5 max-h-[60vh] overflow-y-auto no-scrollbar">
                        <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">The following SKUs have fallen below
                            their safety stock
                            thresholds and require immediate attention.</p>
                        <div class="space-y-3">
                            <div v-for="sku in criticalSkus" :key="sku.id"
                                class="flex justify-between items-center p-3 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/5 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors">
                                <div>
                                    <div class="text-sm font-bold text-gray-900 dark:text-white">{{ sku.name }}</div>
                                    <div class="text-[10px] text-gray-600 dark:text-gray-400 font-mono mt-0.5">{{ sku.id
                                        }}</div>
                                </div>
                                <div class="text-right">
                                    <div class="text-sm text-red-600 dark:text-red-400 font-bold flex items-center gap-1 justify-end">
                                        {{ sku.current }} left
                                        <span class="material-symbols-outlined text-[14px]">arrow_downward</span>
                                    </div>
                                    <div class="text-[10px] text-gray-500">Min Threshold: {{ sku.min }}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Footer -->
                    <div
                        class="p-4 border-t border-gray-200 dark:border-white/10 flex gap-3 bg-gray-100 dark:bg-black/20">
                        <button @click="showRestockModal = false"
                            class="flex-1 py-2.5 text-sm font-bold text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 rounded-lg transition-colors">
                            Review Later
                        </button>
                        <button @click="processRestock"
                            class="flex flex-1 py-2.5 items-center justify-center gap-2 text-sm font-bold text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors shadow-lg shadow-red-500/20">
                            <span class="material-symbols-outlined text-[18px]"
                                v-if="!isProcessingRestock">shopping_cart_checkout</span>
                            <span class="material-symbols-outlined text-[18px] animate-spin" v-else>sync</span>
                            {{ isProcessingRestock ? 'Processing...' : 'Authorize Restock All' }}
                        </button>
                    </div>
                </div>
            </div>
        </Teleport>

        <!-- Toast -->
        <div v-if="toastMsg"
            class="fixed bottom-6 right-6 bg-green-500/90 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 z-50 animate-bounce">
            <span class="material-symbols-outlined">check_circle</span>
            <div class="font-bold">{{ toastMsg }}</div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Line, Doughnut, Bar, Pie } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement, Filler } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement, Filler)

const toastMsg = ref('')
const readyForDispatch = ref(385)
const activeLabor = ref(42)
const totalLabor = ref(50)

function showToast(msg) {
    toastMsg.value = msg
    setTimeout(() => { toastMsg.value = '' }, 2500)
}

// ----------------------------------------------------
// CHART CONFIGURATIONS
// ----------------------------------------------------

// 1. Throughput Line Chart
const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { display: false },
        tooltip: {
            mode: 'index',
            intersect: false,
            backgroundColor: 'rgba(0,0,0,0.8)',
            titleColor: '#fff',
            bodyColor: '#4fd1c5', // teal-400
            borderColor: 'rgba(255,255,255,0.1)',
            borderWidth: 1,
            padding: 10,
            cornerRadius: 8
        }
    },
    scales: {
        y: {
            beginAtZero: true,
            grid: { color: 'rgba(255,255,255,0.05)', drawBorder: false },
            ticks: { color: '#9ca3af', font: { size: 10, family: 'Inter' } }
        },
        x: {
            grid: { display: false, drawBorder: false },
            ticks: { color: '#9ca3af', font: { size: 10, family: 'Inter' } }
        }
    },
    interaction: { mode: 'nearest', axis: 'x', intersect: false }
}

const throughputChartData = {
    labels: ['06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00'],
    datasets: [{
        label: 'Items Picked',
        data: [120, 240, 310, 280, 450, 420, 390, 510],
        borderColor: '#14b8a6', // teal-500
        backgroundColor: 'rgba(20, 184, 166, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#14b8a6',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6
    }]
}

// 2. Labor Doughnut Chart (Bottom Right Widget)
const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '75%',
    plugins: {
        legend: {
            position: 'bottom',
            labels: {
                color: '#d1d5db',
                usePointStyle: true,
                boxWidth: 8,
                font: { size: 11, family: 'Inter' },
                padding: 15
            }
        },
        tooltip: {
            backgroundColor: 'rgba(0,0,0,0.8)',
            bodyColor: '#fff',
            borderColor: 'rgba(255,255,255,0.1)',
            borderWidth: 1,
            callbacks: {
                label: function (context) {
                    return ` ${context.label}: ${context.raw} Staff`;
                }
            }
        }
    }
}

const laborChartData = {
    labels: ['Picking (Zone A)', 'Packing', 'Receiving', 'Idle'],
    datasets: [{
        data: [12, 8, 6, 4],
        backgroundColor: [
            '#14b8a6', // teal-500
            '#3b82f6', // blue-500
            '#a855f7', // purple-500
            '#eab308'  // yellow-500
        ],
        borderWidth: 0,
        hoverOffset: 6
    }]
}

// ----------------------------------------------------
// NEW ROW CHARTS (Bar, Pie, Doughnut)
// ----------------------------------------------------

// 3. Orders vs Returns (Bar Chart)
const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: 'bottom',
            labels: { color: '#d1d5db', usePointStyle: true, font: { size: 10, family: 'Inter' } }
        },
        tooltip: {
            backgroundColor: 'rgba(0,0,0,0.8)', titleColor: '#fff',
            borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1, cornerRadius: 8
        }
    },
    scales: {
        y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#9ca3af', font: { size: 10 } } },
        x: { grid: { display: false }, ticks: { color: '#9ca3af', font: { size: 10 } } }
    }
};

const ordersReturnsData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
        {
            label: 'Outbound Orders',
            backgroundColor: '#3b82f6', // blue-500
            borderRadius: 4,
            data: [420, 390, 510, 480, 560, 310, 200]
        },
        {
            label: 'Inbound Returns',
            backgroundColor: '#fb7185', // rose-400
            borderRadius: 4,
            data: [12, 18, 14, 25, 30, 8, 4]
        }
    ]
};

// 4. Stock vs Packaging (Pie Chart)
const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: 'right',
            labels: { color: '#d1d5db', usePointStyle: true, font: { size: 11, family: 'Inter' }, padding: 12 }
        },
        tooltip: {
            backgroundColor: 'rgba(0,0,0,0.8)',
            bodyColor: '#fff',
            borderColor: 'rgba(255,255,255,0.1)',
            borderWidth: 1,
            callbacks: { label: (c) => ` ${c.label}: ${c.raw}%` }
        }
    }
};

const stockPackagingData = {
    labels: ['Salable Merchandise', 'Packaging (Boxes/Tape)', 'Pallets/Crates', 'Damaged/Quarantine'],
    datasets: [{
        data: [75, 15, 6, 4], // Percentages
        backgroundColor: ['#10b981', '#f59e0b', '#8b5cf6', '#ef4444'], // emerald, amber, violet, red
        borderWidth: 1,
        borderColor: '#1f2937', // matching dark bg
        hoverOffset: 4
    }]
};

// 5. Active Workers vs Active Drivers (Doughnut)
const activeStaffData = {
    labels: ['Warehouse Floor Staff', 'Active Delivery Drivers'],
    datasets: [{
        data: [42, 68], // Counts
        backgroundColor: ['#eab308', '#0ea5e9'], // yellow, sky blue
        borderWidth: 0,
        hoverOffset: 6
    }]
};


// ----------------------------------------------------
// RESTOCK MODAL LOGIC
// ----------------------------------------------------
const showRestockModal = ref(false)
const isProcessingRestock = ref(false)

const criticalSkus = ref([
    { id: 'SKU-992-BLU', name: 'Industrial Poly Wrap', current: 12, min: 50 },
    { id: 'SKU-114-XLG', name: 'Heavy Duty Corrugated Box', current: 5, min: 100 },
    { id: 'SKU-441-TPE', name: 'Reinforced Pack Tape', current: 2, min: 20 },
    { id: 'SKU-882-PLT', name: 'Standard Wood Pallets', current: 0, min: 15 },
    { id: 'SKU-311-LBL', name: 'Thermal Print Labels 4x6', current: 1, min: 10 },
    { id: 'SKU-990-STR', name: 'Steel Strapping Coils', current: 0, min: 5 },
    { id: 'SKU-202-GLV', name: 'Safety Work Gloves (L)', current: 8, min: 30 },
    { id: 'SKU-551-CUT', name: 'Safety Box Cutters', current: 3, min: 15 },
])

const processRestock = () => {
    isProcessingRestock.value = true
    // Simulate API call delay for realism
    setTimeout(() => {
        criticalSkus.value = []
        isProcessingRestock.value = false
        showRestockModal.value = false
        showToast('All critical SKUs restocked successfully!')
    }, 1200)
}

// ----------------------------------------------------
// INTERACTIVE PICKING QUEUE LOGIC
// ----------------------------------------------------
const searchQuery = ref('')
const statusFilter = ref('')
const activeActionMenu = ref(null)

const pickingQueue = ref([
    { id: 'ORD-8821', items: 4, zone: 'A-22', priority: 'High', assigned: 'John S.', assignedInitials: 'JS', progress: 75, status: 'In Progress' },
    { id: 'ORD-9912', items: 12, zone: 'B-04', priority: 'Normal', assigned: 'Sarah K.', assignedInitials: 'SK', progress: 30, status: 'In Progress' },
    { id: 'ORD-1102', items: 1, zone: 'A-10', priority: 'High', assigned: 'Mike L.', assignedInitials: 'ML', progress: 0, status: 'Pending' },
    { id: 'ORD-2291', items: 8, zone: 'C-01', priority: 'Normal', assigned: null, assignedInitials: '', progress: 0, status: 'Unassigned' },
    { id: 'ORD-7773', items: 2, zone: 'B-15', priority: 'Normal', assigned: null, assignedInitials: '', progress: 0, status: 'Unassigned' },
    { id: 'ORD-9991', items: 6, zone: 'A-05', priority: 'Normal', assigned: 'Davie B.', assignedInitials: 'DB', progress: 90, status: 'Review' },
    { id: 'ORD-8823', items: 14, zone: 'A-21', priority: 'Normal', assigned: 'John S.', assignedInitials: 'JS', progress: 0, status: 'Pending' },
])

const filteredQueue = computed(() => {
    return pickingQueue.value.filter(order => {
        // Search by Order ID or Assigned Worker Name
        const matchesSearch = !searchQuery.value ||
            order.id.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
            (order.assigned && order.assigned.toLowerCase().includes(searchQuery.value.toLowerCase()))

        // Filter by Dropdown Status
        const matchesStatus = !statusFilter.value || order.status === statusFilter.value

        // Remove globally completed ones from the active queue
        return matchesSearch && matchesStatus && order.status !== 'Completed'
    })
})

const pendingOrdersCount = computed(() => {
    return pickingQueue.value.filter(o => o.status !== 'Completed').length
})

// --- Menu Actions ---
const toggleActionMenu = (id) => {
    activeActionMenu.value = activeActionMenu.value === id ? null : id
}

const markComplete = (order) => {
    order.progress = 100
    order.status = 'Completed'
    activeActionMenu.value = null
    readyForDispatch.value++
    showToast(`${order.id} marked complete — ready for dispatch`)
}

const reassign = (order) => {
    order.assigned = 'Alex M.'
    order.assignedInitials = 'AM'
    order.status = 'In Progress'
    if (order.progress === 0) order.progress = 10
    activeActionMenu.value = null
    showToast(`${order.id} reassigned to Alex M.`)
}

// Click-outside directive logic to close menus gracefully
const closeMenu = (e) => {
    if (!e.target.closest('.relative')) {
        activeActionMenu.value = null
    }
}

onMounted(() => {
    document.addEventListener('click', closeMenu)
})

onUnmounted(() => {
    document.removeEventListener('click', closeMenu)
})
</script>
