<template>
    <div class="space-y-6 sm:space-y-8">
        <!-- Quick Actions -->
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            <router-link to="/individual/book-move"
                class="glass-panel p-4 md:p-6 rounded-xl hover:border-green-500/50 transition-all cursor-pointer group relative overflow-hidden">
                <div class="absolute right-0 top-0 p-4 opacity-10"><span
                        class="material-symbols-outlined text-6xl">local_shipping</span></div>
                <div
                    class="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center text-green-500 mb-4 group-hover:scale-110 transition-transform">
                    <span class="material-symbols-outlined text-2xl">add_circle</span>
                </div>
                <h3 class="font-bold text-gray-900 dark:text-white text-lg">Book a Move</h3>
                <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">House shift or small package delivery.</p>
            </router-link>
            <router-link to="/individual/estimator"
                class="glass-panel p-4 md:p-6 rounded-xl hover:border-purple-500/50 transition-all cursor-pointer group relative overflow-hidden">
                <div class="absolute right-0 top-0 p-4 opacity-10"><span
                        class="material-symbols-outlined text-6xl">photo_camera</span></div>
                <div
                    class="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-500 mb-4 group-hover:scale-110 transition-transform">
                    <span class="material-symbols-outlined text-2xl">auto_awesome</span>
                </div>
                <h3 class="font-bold text-gray-900 dark:text-white text-lg">AI Estimator</h3>
                <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Upload a photo to get volume estimates.</p>
            </router-link>
            <router-link to="/individual/quotes"
                class="glass-panel p-4 md:p-6 rounded-xl hover:border-blue-500/50 transition-all cursor-pointer group relative overflow-hidden">
                <div class="absolute right-0 top-0 p-4 opacity-10"><span
                        class="material-symbols-outlined text-6xl">request_quote</span></div>
                <div
                    class="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-500 mb-4 group-hover:scale-110 transition-transform">
                    <span class="material-symbols-outlined text-2xl">receipt_long</span>
                </div>
                <h3 class="font-bold text-gray-900 dark:text-white text-lg">Get Instant Quote</h3>
                <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Check prices for different vehicle types.</p>
            </router-link>
        </div>

        <!-- Active Move Status -->
        <div v-if="activeMove" class="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div class="xl:col-span-2 glass-panel p-5 md:p-6 rounded-xl">
                <h3 class="font-bold text-gray-900 dark:text-white text-lg mb-4 flex items-center gap-2">
                    <span class="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span> Active Move Status
                </h3>
                <div class="flex flex-col md:flex-row gap-6">
                    <div
                        class="flex-none w-full md:w-64 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-900 rounded-xl h-40 md:h-auto flex items-center justify-center relative">
                        <span class="material-symbols-outlined text-5xl text-gray-400 dark:text-gray-600">map</span>
                        <div
                            class="absolute bottom-2 left-2 px-3 py-1 bg-white/90 dark:bg-black/80 backdrop-blur-sm text-xs font-bold rounded-lg text-green-600 dark:text-green-400">
                            ETA: {{ activeMove.eta }}</div>
                        <router-link :to="'/individual/tracking?orderId=' + activeMove.id"
                            class="absolute bottom-2 right-2 px-3 py-1 bg-green-600 text-white text-xs font-bold rounded-lg hover:bg-green-700 transition-colors">Track
                            Live</router-link>
                    </div>
                    <div class="flex-1 space-y-4">
                        <div>
                            <div class="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold mb-1">Current
                                Status</div>
                            <div class="text-xl font-bold text-green-600 dark:text-green-400">On Route</div>
                            <div class="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden mt-2">
                                <div class="bg-green-500 h-full rounded-full transition-all"
                                    :style="{ width: activeMove.progress + '%' }"></div>
                            </div>
                        </div>
                        <div class="flex items-center gap-4">
                            <div
                                class="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white font-bold text-xs">
                                {{activeMove.driver.name.split(' ').map(n => n[0]).join('')}}</div>
                            <div>
                                <div class="font-bold text-gray-900 dark:text-white text-sm">{{ activeMove.driver.name
                                }}</div>
                                <div class="text-xs text-gray-500">Driver ({{ activeMove.driver.rating }} ★) · {{
                                    activeMove.vehicleType?.toUpperCase() }}</div>
                            </div>
                            <button
                                class="ml-auto w-10 h-10 rounded-full bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 flex items-center justify-center transition-colors"><span
                                    class="material-symbols-outlined text-gray-600 dark:text-white">call</span></button>
                        </div>
                        <div class="grid grid-cols-3 gap-3 text-xs">
                            <div><span class="text-gray-500">Labor:</span> <span
                                    class="text-gray-900 dark:text-white font-bold">{{ activeMove.laborCount }}
                                    Helpers</span></div>
                            <div><span class="text-gray-500">Order ID:</span> <span
                                    class="font-mono font-bold text-green-600 dark:text-green-400">{{ activeMove.id
                                    }}</span></div>
                            <div><span class="text-gray-500">Service Block:</span> <span
                                    class="text-purple-600 dark:text-purple-400 font-bold">{{
                                        activeMove.serviceTimeBlock }}</span></div>
                        </div>
                    </div>
                </div>
            </div>
            <!-- Cost Summary -->
            <div class="glass-panel p-5 md:p-6 rounded-xl">
                <h3 class="font-bold text-gray-900 dark:text-white text-lg mb-4">Cost Summary</h3>
                <div class="space-y-3 text-sm">
                    <div class="flex justify-between"><span class="text-gray-500 dark:text-gray-400">Base
                            Transport</span><span class="font-bold text-gray-900 dark:text-white font-mono">₹{{
                                activeMove.cost.base.toLocaleString() }}</span></div>
                    <div class="flex justify-between"><span class="text-gray-500 dark:text-gray-400">Vehicle</span><span
                            class="font-bold text-gray-900 dark:text-white font-mono">₹{{ (activeMove.cost.vehicle ||
                                0).toLocaleString() }}</span></div>
                    <div class="flex justify-between"><span class="text-gray-500 dark:text-gray-400">Labor (×{{
                        activeMove.laborCount }})</span><span
                            class="font-bold text-gray-900 dark:text-white font-mono">₹{{
                                activeMove.cost.labor.toLocaleString() }}</span></div>
                    <div class="flex justify-between"><span
                            class="text-gray-500 dark:text-gray-400">Materials</span><span
                            class="font-bold text-gray-900 dark:text-white font-mono">₹{{
                                activeMove.cost.materials.toLocaleString() }}</span></div>
                    <div class="flex justify-between"><span class="text-gray-500 dark:text-gray-400">Packing</span><span
                            class="font-bold text-gray-900 dark:text-white font-mono">₹{{
                                activeMove.cost.packing.toLocaleString() }}</span></div>
                    <div class="border-t border-gray-200 dark:border-white/10 pt-3 mt-3 flex justify-between"><span
                            class="font-bold text-gray-900 dark:text-white">Total</span><span
                            class="text-2xl font-bold text-green-600 dark:text-green-400 font-mono">₹{{
                                activeMove.cost.total.toLocaleString() }}</span></div>
                </div>
                <!-- Dummy badge removed -->
                <router-link to="/individual/payments"
                    class="block w-full py-2 mt-3 text-center border border-gray-200 dark:border-white/10 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors">View
                    Payments</router-link>
            </div>
        </div>

        <!-- Charts -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="glass-panel p-5 md:p-6 rounded-xl">
                <h3 class="font-bold text-gray-900 dark:text-white mb-4">Monthly Spending</h3>
                <div class="h-56">
                    <Bar :data="barChartData" :options="chartOptions" />
                </div>
            </div>
            <div class="glass-panel p-5 md:p-6 rounded-xl">
                <h3 class="font-bold text-gray-900 dark:text-white mb-4">Move Status Distribution</h3>
                <div class="h-56 flex items-center justify-center">
                    <Doughnut :data="doughnutData" :options="doughnutOptions" />
                </div>
            </div>
        </div>

        <!-- Recent Orders -->
        <div class="glass-panel p-5 md:p-6 rounded-xl">
            <div class="flex items-center justify-between mb-4">
                <h3 class="font-bold text-gray-900 dark:text-white text-lg">Recent Orders</h3>
                <router-link to="/individual/orders"
                    class="text-sm text-green-600 dark:text-green-400 font-bold hover:underline">View All
                    →</router-link>
            </div>
            <div class="overflow-x-auto">
                <table class="w-full text-sm">
                    <thead>
                        <tr
                            class="text-xs text-gray-500 dark:text-gray-400 uppercase border-b border-gray-200 dark:border-white/5">
                            <th class="text-left py-3 pr-4">Order ID</th>
                            <th class="text-left py-3 pr-4">Type</th>
                            <th class="text-left py-3 pr-4 hidden sm:table-cell">Vehicle</th>
                            <th class="text-left py-3 pr-4 hidden sm:table-cell">Route</th>
                            <th class="text-left py-3 pr-4">Status</th>
                            <th class="text-right py-3">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="order in store.orders.slice(0, 5)" :key="order.id"
                            class="border-b border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                            <td class="py-3 pr-4"><span
                                    class="font-mono font-bold text-green-600 dark:text-green-400">{{ order.id }}</span>
                            </td>
                            <td class="py-3 pr-4 text-gray-700 dark:text-gray-300">{{ order.cargoType }}</td>
                            <td
                                class="py-3 pr-4 text-gray-700 dark:text-gray-300 hidden sm:table-cell uppercase text-xs">
                                {{ order.vehicleType }}</td>
                            <td
                                class="py-3 pr-4 text-gray-500 dark:text-gray-400 hidden sm:table-cell truncate max-w-[150px]">
                                {{ order.pickup?.split(',')[0] }} → {{ order.destination?.split(',')[0] }}</td>
                            <td class="py-3 pr-4"><span class="px-2 py-1 rounded-full text-[10px] font-bold uppercase"
                                    :class="statusBadge(order.status)">{{ order.status.replace('-', ' ') }}</span></td>
                            <td class="py-3 text-right font-bold text-gray-900 dark:text-white font-mono">₹{{
                                order.cost.total.toLocaleString() }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="glass-panel p-4 rounded-xl text-center">
                <div class="text-2xl font-bold text-green-600 dark:text-green-400">{{ store.orders.length }}</div>
                <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">Total Moves</div>
            </div>
            <div class="glass-panel p-4 rounded-xl text-center">
                <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">{{ store.activeOrders.length }}</div>
                <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">Active</div>
            </div>
            <div class="glass-panel p-4 rounded-xl text-center">
                <div class="text-2xl font-bold text-amber-600 dark:text-amber-400">{{ store.pendingOrders.length }}
                </div>
                <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">Pending</div>
            </div>
            <div class="glass-panel p-4 rounded-xl text-center">
                <div class="text-2xl font-bold text-purple-600 dark:text-purple-400">₹{{
                    store.totalSpent.toLocaleString() }}</div>
                <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">Total Spent</div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue'
import { useIndividualStore } from '@/stores/individualStore'
import { Bar, Doughnut } from 'vue-chartjs'
import { Chart as ChartJS, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js'

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend)

const store = useIndividualStore()
const activeMove = computed(() => store.activeOrders[0])

function statusBadge(st) {
    return { 'delivered': 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400', 'in-transit': 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400', 'pending': 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400', 'cancelled': 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400' }[st] || ''
}

// Bar Chart — Monthly Spending
const barChartData = computed(() => ({
    labels: store.monthlySpending.map(m => m.month),
    datasets: [{
        label: 'Spending (₹)',
        data: store.monthlySpending.map(m => m.amount),
        backgroundColor: ['#22c55e33', '#22c55e33', '#22c55e33', '#22c55e66', '#22c55e99', '#22c55e'],
        borderColor: '#22c55e',
        borderWidth: 1,
        borderRadius: 6,
    }],
}))

const chartOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
        y: { ticks: { callback: v => '₹' + (v / 1000).toFixed(0) + 'k', color: '#9ca3af', font: { size: 10 } }, grid: { color: '#e5e7eb22' } },
        x: { ticks: { color: '#9ca3af', font: { size: 10 } }, grid: { display: false } },
    },
}

// Doughnut — Status Distribution
const doughnutData = computed(() => ({
    labels: ['Delivered', 'In Transit', 'Pending', 'Cancelled'],
    datasets: [{
        data: [store.deliveredOrders.length, store.activeOrders.length, store.pendingOrders.length, store.cancelledOrders.length],
        backgroundColor: ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444'],
        borderWidth: 0,
    }],
}))

const doughnutOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { position: 'right', labels: { color: '#9ca3af', font: { size: 11 }, boxWidth: 12, padding: 16 } } },
    cutout: '65%',
}
</script>
