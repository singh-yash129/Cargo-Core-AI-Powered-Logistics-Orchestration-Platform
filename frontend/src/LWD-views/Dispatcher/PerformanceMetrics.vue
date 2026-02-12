<template>
    <div class="space-y-6">
        <h2 class="text-2xl font-bold text-white">Dispatcher Performance Metrics</h2>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div class="glass-panel p-6 rounded-xl text-center">
                <div class="text-4xl font-bold text-primary">94%</div>
                <div class="text-sm text-gray-400 mt-2">On-Time Delivery Rate</div>
            </div>
            <div class="glass-panel p-6 rounded-xl text-center">
                <div class="text-4xl font-bold text-white">12.5m</div>
                <div class="text-sm text-gray-400 mt-2">Avg. Turnaround Time</div>
            </div>
            <div class="glass-panel p-6 rounded-xl text-center">
                <div class="text-4xl font-bold text-white">4.8</div>
                <div class="text-sm text-gray-400 mt-2">Driver Satisfaction</div>
            </div>
            <div class="glass-panel p-6 rounded-xl text-center">
                <div class="text-4xl font-bold text-red-400">2%</div>
                <div class="text-sm text-gray-400 mt-2">Failed Deliveries</div>
            </div>
        </div>

        <!-- Charts Section -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div class="glass-panel p-6 rounded-xl relative">
                <h3 class="font-bold text-white mb-6">Delivery Volume (Hourly)</h3>
                <div class="h-64 flex items-end justify-between px-2 gap-1">
                    <div v-for="h in 24" :key="h"
                        class="w-full bg-blue-500/20 rounded-t hover:bg-blue-500/50 transition-colors"
                        :style="`height: ${Math.random() * 80 + 10}%`"></div>
                </div>
                <div class="flex justify-between mt-2 text-[10px] text-gray-500">
                    <span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>23:59</span>
                </div>
            </div>

            <div class="glass-panel p-6 rounded-xl">
                <h3 class="font-bold text-white mb-6">Top Performing Zones</h3>
                <div class="space-y-4">
                    <div v-for="zone in zones" :key="zone.name">
                        <div class="flex justify-between text-sm mb-1 text-gray-300">
                            <span>{{ zone.name }}</span>
                            <span>{{ zone.perf }}%</span>
                        </div>
                        <div class="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
                            <div class="bg-primary h-full" :style="`width: ${zone.perf}%`"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'

const zones = ref([
    { name: 'Downtown Sector', perf: 98 },
    { name: 'North Industrial Park', perf: 92 },
    { name: 'Suburban West', perf: 88 },
    { name: 'Airport Logistics', perf: 95 },
])
</script>
