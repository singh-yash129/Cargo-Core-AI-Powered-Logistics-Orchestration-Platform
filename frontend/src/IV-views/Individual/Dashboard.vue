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
                    <span class="material-symbols-outlined">add_box</span>
                </div>
                <h3 class="font-bold text-lg text-gray-900 dark:text-white mb-1">Book a Move</h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">Schedule a new house shift or cargo delivery.</p>
            </router-link>

            <router-link to="/individual/estimator"
                class="glass-panel p-4 md:p-6 rounded-xl hover:border-purple-500/50 transition-all cursor-pointer group relative overflow-hidden">
                <div class="absolute right-0 top-0 p-4 opacity-10"><span
                        class="material-symbols-outlined text-6xl">camera_enhance</span></div>
                <div
                    class="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400 mb-4 group-hover:scale-110 transition-transform">
                    <span class="material-symbols-outlined">center_focus_strong</span>
                </div>
                <h3 class="font-bold text-lg text-gray-900 dark:text-white mb-1">AI Estimator</h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">Upload a room photo to get volume estimates.</p>
            </router-link>

            <router-link to="/individual/quotes"
                class="glass-panel p-4 md:p-6 rounded-xl hover:border-blue-500/50 transition-all cursor-pointer group relative overflow-hidden">
                <div class="absolute right-0 top-0 p-4 opacity-10"><span
                        class="material-symbols-outlined text-6xl">calculate</span></div>
                <div
                    class="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 mb-4 group-hover:scale-110 transition-transform">
                    <span class="material-symbols-outlined">request_quote</span>
                </div>
                <h3 class="font-bold text-lg text-gray-900 dark:text-white mb-1">Get Instant Quote</h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">Check prices for different vehicle types.</p>
            </router-link>
        </div>

        <!-- Active Move & Cost Summary -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Active Move Card -->
            <div class="lg:col-span-2 glass-panel p-4 md:p-6 rounded-xl relative overflow-hidden">
                <h3 class="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    Active Move Status
                </h3>

                <div v-if="store.activeOrders.length > 0" class="flex flex-col md:flex-row gap-6">
                    <!-- Map / Tracking Placeholder -->
                    <div class="flex-1 bg-gray-200 dark:bg-gray-800 rounded-lg h-48 relative overflow-hidden">
                        <div
                            class="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-900 opacity-70">
                        </div>
                        <div class="absolute inset-0 flex items-center justify-center">
                            <span class="material-symbols-outlined text-5xl text-gray-400 dark:text-gray-600">map</span>
                        </div>
                        <div
                            class="absolute bottom-2 left-2 bg-white/90 dark:bg-black/80 px-3 py-1 rounded text-xs text-gray-900 dark:text-white shadow-sm">
                            ETA: <span class="text-green-600 dark:text-green-400 font-bold">{{ activeMove.eta }}</span>
                        </div>
                        <router-link to="/individual/tracking"
                            class="absolute bottom-2 right-2 bg-green-600 text-white text-xs px-3 py-1 rounded font-bold hover:bg-green-700 transition-colors">
                            Track Live
                        </router-link>
                    </div>

                    <!-- Details -->
                    <div class="flex-1 space-y-4">
                        <div>
                            <div class="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wide">
                                Current Status</div>
                            <div class="text-xl font-bold text-green-600 dark:text-primary mt-1">On Route</div>
                            <div class="w-full bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden mt-2">
                                <div class="bg-green-500 h-full animate-pulse"
                                    :style="{ width: activeMove.progress + '%' }"></div>
                            </div>
                        </div>

                        <div
                            class="flex justify-between items-center py-2 border-b border-gray-200 dark:border-white/5">
                            <div class="flex items-center gap-3">
                                <div
                                    class="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white font-bold text-xs">
                                    {{activeMove.driver?.name?.split(' ').map(n => n[0]).join('')}}
                                </div>
                                <div>
                                    <div class="text-sm font-bold text-gray-900 dark:text-white">{{
                                        activeMove.driver?.name }}</div>
                                    <div class="text-xs text-gray-500 dark:text-gray-400">Driver ({{
                                        activeMove.driver?.rating }} ★)</div>
                                </div>
                            </div>
                            <button
                                class="p-2 bg-gray-100 dark:bg-white/5 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-white">
                                <span class="material-symbols-outlined">call</span>
                            </button>
                        </div>

                        <div class="flex justify-between text-sm">
                            <span class="text-gray-500 dark:text-gray-400">Labor:</span>
                            <span class="text-gray-900 dark:text-white font-medium">{{ activeMove.laborCount }} Helpers
                                Assigned</span>
                        </div>
                        <div class="flex justify-between text-sm">
                            <span class="text-gray-500 dark:text-gray-400">Order ID:</span>
                            <span class="text-green-600 dark:text-green-400 font-mono font-bold">{{ activeMove.id
                                }}</span>
                        </div>
                    </div>
                </div>
                <div v-else class="text-center py-12 text-gray-500 dark:text-gray-400">
                    <span class="material-symbols-outlined text-4xl mb-2 block">local_shipping</span>
                    <p class="font-medium">No active moves right now.</p>
                    <router-link to="/individual/book-move"
                        class="text-green-600 dark:text-green-400 text-sm font-bold hover:underline mt-2 inline-block">Book
                        a Move →</router-link>
                </div>
            </div>

            <!-- Cost Summary Widget -->
            <div class="glass-panel p-4 md:p-6 rounded-xl">
                <h3 class="font-bold text-gray-900 dark:text-white mb-4">Cost Summary</h3>
                <div v-if="activeMove" class="space-y-3">
                    <div class="flex justify-between text-sm">
                        <span class="text-gray-500 dark:text-gray-400">Base Transport</span>
                        <span class="text-gray-900 dark:text-white font-mono">₹{{
                            activeMove.cost?.base?.toLocaleString() }}</span>
                    </div>
                    <div class="flex justify-between text-sm">
                        <span class="text-gray-500 dark:text-gray-400">Labor Charges (x{{ activeMove.laborCount
                            }})</span>
                        <span class="text-gray-900 dark:text-white font-mono">₹{{
                            activeMove.cost?.labor?.toLocaleString() }}</span>
                    </div>
                    <div class="flex justify-between text-sm">
                        <span class="text-gray-500 dark:text-gray-400">Packing Materials</span>
                        <span class="text-gray-900 dark:text-white font-mono">₹{{
                            activeMove.cost?.materials?.toLocaleString() }}</span>
                    </div>
                    <div class="flex justify-between text-sm">
                        <span class="text-gray-500 dark:text-gray-400">Packing Service</span>
                        <span class="text-gray-900 dark:text-white font-mono">₹{{
                            activeMove.cost?.packing?.toLocaleString() }}</span>
                    </div>
                    <div class="border-t border-gray-200 dark:border-white/10 pt-3 flex justify-between items-end">
                        <span class="text-gray-700 dark:text-gray-300 font-bold">Total</span>
                        <span class="text-2xl font-bold text-green-600 dark:text-primary">₹{{
                            activeMove.cost?.total?.toLocaleString() }}</span>
                    </div>
                </div>

                <div class="mt-6">
                    <div class="flex items-center gap-2 mb-2" v-if="activeMove?.paymentStatus === 'paid'">
                        <span class="material-symbols-outlined text-green-500">check_circle</span>
                        <span class="text-sm text-green-600 dark:text-green-400 font-bold">Payment Verified</span>
                    </div>
                    <div v-else class="flex items-center gap-2 mb-2">
                        <span class="material-symbols-outlined text-amber-500">pending</span>
                        <span class="text-sm text-amber-600 dark:text-amber-400 font-bold">Payment Pending</span>
                    </div>
                    <router-link to="/individual/payments"
                        class="w-full py-2 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-white text-sm font-bold rounded-lg transition-colors block text-center">
                        View Payments
                    </router-link>
                </div>
            </div>
        </div>

        <!-- Recent Orders -->
        <div class="glass-panel p-4 md:p-6 rounded-xl">
            <div class="flex items-center justify-between mb-4">
                <h3 class="font-bold text-gray-900 dark:text-white">Recent Orders</h3>
                <router-link to="/individual/orders"
                    class="text-green-600 dark:text-green-400 text-sm font-bold hover:underline">View All
                    →</router-link>
            </div>
            <div class="overflow-x-auto">
                <table class="w-full text-sm">
                    <thead>
                        <tr
                            class="text-left text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-white/5">
                            <th class="pb-3 font-medium">Order ID</th>
                            <th class="pb-3 font-medium">Type</th>
                            <th class="pb-3 font-medium hidden sm:table-cell">Route</th>
                            <th class="pb-3 font-medium">Status</th>
                            <th class="pb-3 font-medium text-right">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="order in store.orders.slice(0, 5)" :key="order.id"
                            class="border-b border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                            <td class="py-3 font-mono font-bold text-green-600 dark:text-green-400">{{ order.id }}</td>
                            <td class="py-3 text-gray-700 dark:text-gray-300">{{ order.cargoType }}</td>
                            <td class="py-3 text-gray-500 dark:text-gray-400 hidden sm:table-cell text-xs">
                                {{ order.pickup?.split(',')[0] }} → {{ order.destination?.split(',')[0] }}
                            </td>
                            <td class="py-3">
                                <span class="px-2 py-0.5 rounded-full text-xs font-bold" :class="{
                                    'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400': order.status === 'delivered',
                                    'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400': order.status === 'in-transit',
                                    'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400': order.status === 'pending',
                                    'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400': order.status === 'cancelled',
                                }">
                                    {{ order.status.replace('-', ' ') }}
                                </span>
                            </td>
                            <td class="py-3 text-right font-mono font-bold text-gray-900 dark:text-white">₹{{
                                order.cost.total.toLocaleString() }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Bottom Stats Row -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="glass-panel p-4 rounded-xl text-center">
                <div class="text-3xl font-bold text-green-600 dark:text-green-400">{{ store.orders.length }}</div>
                <div class="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">Total Moves</div>
            </div>
            <div class="glass-panel p-4 rounded-xl text-center">
                <div class="text-3xl font-bold text-blue-600 dark:text-blue-400">{{ store.activeOrders.length }}</div>
                <div class="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">Active</div>
            </div>
            <div class="glass-panel p-4 rounded-xl text-center">
                <div class="text-3xl font-bold text-amber-600 dark:text-amber-400">{{ store.pendingOrders.length }}
                </div>
                <div class="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">Pending</div>
            </div>
            <div class="glass-panel p-4 rounded-xl text-center">
                <div class="text-3xl font-bold text-green-600 dark:text-green-400">₹{{ store.totalSpent.toLocaleString()
                    }}</div>
                <div class="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">Total Spent</div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue'
import { useIndividualStore } from '@/stores/individualStore'

const store = useIndividualStore()

const activeMove = computed(() => store.activeOrders[0] || store.orders[0])
</script>
