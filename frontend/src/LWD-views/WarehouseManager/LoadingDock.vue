<template>
    <div class="space-y-6">
        <h2 class="text-2xl font-bold text-white">Loading Dock Management</h2>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <!-- Dock Status Cards -->
            <div v-for="dock in docks" :key="dock.id" class="glass-panel p-6 rounded-xl relative overflow-hidden group">
                <div class="absolute inset-x-0 bottom-0 h-1" :class="dock.statusClass"></div>
                <div class="flex justify-between items-start mb-4">
                    <div class="text-xl font-bold text-white">Dock {{ dock.id }}</div>
                    <span class="px-2 py-1 rounded text-[10px] uppercase font-bold text-black"
                        :class="dock.badgeClass">{{ dock.status }}</span>
                </div>

                <div class="space-y-2 mb-4">
                    <div class="flex justify-between text-sm">
                        <span class="text-gray-400">Truck:</span>
                        <span class="text-white font-mono">{{ dock.truck || '--' }}</span>
                    </div>
                    <div class="flex justify-between text-sm">
                        <span class="text-gray-400">Carrier:</span>
                        <span class="text-white">{{ dock.carrier || '--' }}</span>
                    </div>
                    <div class="flex justify-between text-sm">
                        <span class="text-gray-400">Progress:</span>
                        <span class="text-white font-bold">{{ dock.progress }}%</span>
                    </div>
                </div>

                <div v-if="dock.status === 'Occupied'"
                    class="w-full bg-gray-700 h-1.5 rounded-full overflow-hidden mb-4">
                    <div class="bg-blue-500 h-full animate-pulse" :style="`width: ${dock.progress}%`"></div>
                </div>

                <div class="flex gap-2">
                    <button v-if="dock.status === 'Occupied'"
                        class="flex-1 bg-green-500/20 hover:bg-green-500/30 text-green-400 py-2 rounded text-xs font-bold transition-colors">Complete</button>
                    <button v-if="dock.status === 'Free'"
                        class="flex-1 bg-white/10 hover:bg-white/20 text-white py-2 rounded text-xs font-bold transition-colors">Assign
                        Truck</button>
                    <button
                        class="px-3 py-2 bg-white/5 hover:bg-white/10 rounded text-gray-400 hover:text-white transition-colors"><span
                            class="material-symbols-outlined text-sm">settings</span></button>
                </div>
            </div>
        </div>

        <!-- Upcoming Schedule -->
        <div class="glass-panel rounded-xl overflow-hidden p-6">
            <h3 class="font-bold text-white mb-4">Incoming Trucks Queue</h3>
            <div class="space-y-3">
                <div class="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                    <div class="flex items-center gap-4">
                        <div
                            class="w-12 h-12 bg-gray-700 rounded flex items-center justify-center text-white font-bold text-xs flex-col">
                            <span>14:00</span>
                            <span class="text-[8px] text-gray-400">ETA</span>
                        </div>
                        <div>
                            <div class="text-white font-bold">FedEx Ground</div>
                            <div class="text-xs text-gray-400">TRK-9821 • 14 Pallets</div>
                        </div>
                    </div>
                    <button class="text-primary hover:underline text-xs">Details</button>
                </div>
                <div class="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                    <div class="flex items-center gap-4">
                        <div
                            class="w-12 h-12 bg-gray-700 rounded flex items-center justify-center text-white font-bold text-xs flex-col">
                            <span>14:30</span>
                            <span class="text-[8px] text-gray-400">ETA</span>
                        </div>
                        <div>
                            <div class="text-white font-bold">DHL Express</div>
                            <div class="text-xs text-gray-400">TRK-1122 • 5 Pallets</div>
                        </div>
                    </div>
                    <button class="text-primary hover:underline text-xs">Details</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'

const docks = ref([
    { id: '1', status: 'Occupied', truck: 'TRK-5541', carrier: 'UPS Freight', progress: 78, statusClass: 'bg-yellow-500', badgeClass: 'bg-yellow-500' },
    { id: '2', status: 'Free', truck: null, carrier: null, progress: 0, statusClass: 'bg-green-500', badgeClass: 'bg-green-500' },
    { id: '3', status: 'Maintenance', truck: null, carrier: null, progress: 0, statusClass: 'bg-red-500', badgeClass: 'bg-red-500 text-white' },
    { id: '4', status: 'Occupied', truck: 'TRK-9912', carrier: 'Internal Fleet', progress: 30, statusClass: 'bg-blue-500', badgeClass: 'bg-blue-500 text-white' },
])
</script>
