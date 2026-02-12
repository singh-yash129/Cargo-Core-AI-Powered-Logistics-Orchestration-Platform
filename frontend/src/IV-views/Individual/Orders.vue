<template>
    <div class="space-y-6">
        <h2 class="text-2xl font-bold text-white">My Orders</h2>

        <!-- Active Order with Map -->
        <div v-if="activeOrder" class="glass-panel rounded-xl overflow-hidden border border-primary/30">
            <div class="p-4 bg-primary/10 border-b border-primary/20 flex justify-between items-center">
                <div class="flex items-center gap-3">
                    <div class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <h3 class="font-bold text-white">Live Tracking: Order #{{ activeOrder.id }}</h3>
                </div>
                <span class="text-xs font-mono text-primary bg-primary/10 px-2 py-1 rounded">ETA: 14:30 PM</span>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-3">
                <!-- Map Section -->
                <div class="lg:col-span-2 h-96 relative bg-gray-900 group">
                    <!-- Map Placeholder -->
                    <div class="absolute inset-0 bg-[url('/src/assets/map-dark.png')] bg-cover bg-center opacity-60">
                    </div>

                    <!-- Vehicle Marker -->
                    <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                        <div class="w-16 h-16 rounded-full bg-primary/20 animate-ping absolute"></div>
                        <div
                            class="w-10 h-10 rounded-full bg-primary border-4 border-black flex items-center justify-center shadow-lg z-10">
                            <span class="material-symbols-outlined text-black font-bold">local_shipping</span>
                        </div>
                        <div class="bg-black/80 text-white text-xs px-2 py-1 rounded mt-2 font-bold z-10">
                            Mike Ross
                        </div>
                    </div>

                    <!-- Route Line -->
                    <svg class="absolute inset-0 w-full h-full pointer-events-none">
                        <path d="M 200 300 Q 400 100 600 300" stroke="#3b82f6" stroke-width="4" fill="none"
                            class="drop-shadow-lg" />
                    </svg>

                    <div
                        class="absolute bottom-4 left-4 bg-black/80 backdrop-blur p-4 rounded-lg border border-white/10 max-w-xs">
                        <div class="text-xs text-gray-400 mb-1">Current Location</div>
                        <div class="text-sm font-bold text-white mb-2">Highway 101, Near Exit 42</div>
                        <div class="flex gap-2">
                            <span class="text-xs bg-white/10 px-2 py-1 rounded text-gray-300">45 km/h</span>
                            <span class="text-xs bg-white/10 px-2 py-1 rounded text-gray-300">12 km left</span>
                        </div>
                    </div>
                </div>

                <!-- Order Details Sidebar -->
                <div class="p-6 border-l border-white/5 bg-black/20 flex flex-col h-96 overflow-y-auto">
                    <div class="mb-6">
                        <div class="text-xs text-gray-400 uppercase font-bold mb-2">Driver Details</div>
                        <div class="flex items-center gap-4">
                            <img :src="activeOrder.driver.avatar" class="w-12 h-12 rounded-full border border-white/10">
                            <div>
                                <div class="text-white font-bold">{{ activeOrder.driver.name }}</div>
                                <div class="text-xs text-gray-400">Rating: {{ activeOrder.driver.rating }} ★</div>
                                <div class="text-xs text-primary">{{ activeOrder.driver.phone }}</div>
                            </div>
                            <button
                                class="ml-auto w-10 h-10 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center hover:bg-green-500/30 transition-colors">
                                <span class="material-symbols-outlined">call</span>
                            </button>
                        </div>
                    </div>

                    <div class="flex-1 space-y-4">
                        <div class="relative pl-6 border-l-2 border-white/10 space-y-6">
                            <div class="relative">
                                <span
                                    class="absolute -left-[31px] w-4 h-4 rounded-full bg-green-500 border-2 border-black"></span>
                                <div class="text-xs text-gray-400">Pickup • 10:00 AM</div>
                                <div class="text-sm text-white font-bold">{{ activeOrder.pickup }}</div>
                            </div>
                            <div class="relative">
                                <span
                                    class="absolute -left-[31px] w-4 h-4 rounded-full bg-primary border-2 border-black animate-pulse"></span>
                                <div class="text-xs text-gray-400">In Transit</div>
                                <div class="text-sm text-primary font-bold">On the way</div>
                            </div>
                            <div class="relative">
                                <span
                                    class="absolute -left-[31px] w-4 h-4 rounded-full bg-gray-700 border-2 border-black"></span>
                                <div class="text-xs text-gray-400">Dropoff • Est. 14:30 PM</div>
                                <div class="text-sm text-white font-bold">{{ activeOrder.dropoff }}</div>
                            </div>
                        </div>
                    </div>

                    <div class="mt-6 pt-4 border-t border-white/10">
                        <button
                            class="w-full py-2 bg-white/5 hover:bg-white/10 text-white font-bold rounded-lg transition-colors text-sm">View
                            Full Details</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Order History -->
        <div class="border-t border-white/10 pt-6">
            <h3 class="font-bold text-white mb-4">Order History</h3>
            <div class="space-y-4">
                <div v-for="order in pastOrders" :key="order.id"
                    class="glass-panel p-4 rounded-xl flex flex-col md:flex-row items-center gap-4 hover:bg-white/5 transition-colors">
                    <div class="p-3 bg-white/5 rounded-lg">
                        <span class="material-symbols-outlined text-gray-400">inventory_2</span>
                    </div>
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2 mb-1">
                            <span class="font-bold text-white">Order #{{ order.id }}</span>
                            <span class="px-2 py-0.5 rounded text-[10px] bg-white/10 text-gray-400">{{ order.date
                                }}</span>
                        </div>
                        <div class="text-sm text-gray-400 flex items-center gap-2 truncate">
                            <span>{{ order.pickup }}</span>
                            <span class="material-symbols-outlined text-xs">arrow_forward</span>
                            <span>{{ order.dropoff }}</span>
                        </div>
                    </div>
                    <div class="text-right">
                        <div class="text-lg font-bold text-white">{{ order.price }}</div>
                        <div class="text-xs text-green-400 font-bold">Completed</div>
                    </div>
                    <button class="p-2 hover:bg-white/10 rounded-full text-gray-400"><span
                            class="material-symbols-outlined">chevron_right</span></button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'

const activeOrder = ref({
    id: 'MV-9021',
    pickup: '123 Main St, New York, NY',
    dropoff: '456 Elm St, Newark, NJ',
    driver: {
        name: 'Mike Ross',
        avatar: 'https://i.pravatar.cc/150?u=12',
        rating: 4.9,
        phone: '+1 (555) 012-3456'
    }
})

const pastOrders = ref([
    { id: 'MV-8821', date: 'Oct 24, 2024', pickup: 'Brooklyn, NY', dropoff: 'Queens, NY', price: '$150.00' },
    { id: 'MV-7742', date: 'Sep 12, 2024', pickup: 'Manhattan, NY', dropoff: 'Bronx, NY', price: '$95.00' },
])
</script>
