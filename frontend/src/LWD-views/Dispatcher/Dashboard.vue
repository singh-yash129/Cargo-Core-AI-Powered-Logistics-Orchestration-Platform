<template>
    <div class="flex h-[calc(100vh-3.5rem)] overflow-hidden">

        <!-- Left Panel: Active Driver Roster -->
        <div class="w-80 bg-card-dark border-r border-white/5 flex flex-col z-10 glass-panel">
            <div class="p-4 border-b border-white/5 flex justify-between items-center">
                <h3 class="font-bold text-white text-sm">Active Drivers (14)</h3>
                <button class="text-xs text-primary hover:underline">View All</button>
            </div>

            <div class="p-3 bg-white/5">
                <div class="relative">
                    <span
                        class="material-symbols-outlined absolute left-2 top-1.5 text-gray-500 text-[18px]">search</span>
                    <input type="text" placeholder="Search driver..."
                        class="w-full bg-black/20 border border-white/10 rounded-md py-1.5 pl-8 pr-3 text-xs text-white focus:outline-none focus:border-primary/50 transition-colors">
                </div>
            </div>

            <div class="flex-1 overflow-y-auto no-scrollbar p-2 space-y-2">
                <!-- Driver Card -->
                <div v-for="driver in drivers" :key="driver.id"
                    class="p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/10 cursor-pointer transition-all group">
                    <div class="flex items-center gap-3 mb-2">
                        <div class="relative">
                            <img :src="driver.avatar" class="w-10 h-10 rounded-full bg-gray-700 object-cover">
                            <span class="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-card-dark"
                                :class="driver.statusColor"></span>
                        </div>
                        <div>
                            <div class="text-sm font-semibold text-white">{{ driver.name }}</div>
                            <div class="text-[10px] text-gray-400">{{ driver.vehicle }} • {{ driver.id }}</div>
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-2 text-[10px]">
                        <div class="bg-black/20 rounded px-2 py-1">
                            <span class="text-gray-500 block">Load</span>
                            <span class="text-white font-mono">{{ driver.load }}%</span>
                        </div>
                        <div class="bg-black/20 rounded px-2 py-1">
                            <span class="text-gray-500 block">Hours Left</span>
                            <span class="text-white font-mono">{{ driver.hours }}h</span>
                        </div>
                    </div>

                    <div
                        class="mt-2 pt-2 border-t border-white/5 flex justify-between items-center opacity-70 group-hover:opacity-100 transition-opacity">
                        <span class="text-[10px] text-gray-400 flex items-center gap-1">
                            <span class="material-symbols-outlined text-[12px]">location_on</span> {{ driver.location }}
                        </span>
                        <button class="text-primary hover:text-white transition-colors">
                            <span class="material-symbols-outlined text-[16px]">chat</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Center Panel: Interactive Map -->
        <div class="flex-1 bg-gray-900 relative">
            <!-- Map Placeholder -->
            <div class="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 opacity-60"></div>
            <div class="absolute inset-0 bg-background-dark/20 backdrop-blur-[2px]"></div>

            <!-- Overlay Controls -->
            <div class="absolute top-4 left-4 z-10 flex gap-2">
                <div class="glass-panel px-4 py-2 rounded-lg flex items-center gap-4">
                    <div class="flex items-center gap-2">
                        <span
                            class="w-3 h-3 rounded-full bg-primary border-2 border-white/20 shadow-[0_0_10px_rgba(28,231,131,0.5)]"></span>
                        <span class="text-xs font-medium text-white">Available</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="w-3 h-3 rounded-full bg-yellow-500 border-2 border-white/20"></span>
                        <span class="text-xs font-medium text-white">Busy</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="w-3 h-3 rounded-full bg-gray-500 border-2 border-white/20"></span>
                        <span class="text-xs font-medium text-white">Offline</span>
                    </div>
                </div>
            </div>

            <!-- Simulated Map Markers -->
            <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <!-- Truck Marker -->
                <div class="relative group cursor-pointer" style="left: -100px; top: -50px;">
                    <div class="w-16 h-16 bg-primary/10 rounded-full animate-ping absolute inset-0"></div>
                    <div
                        class="w-8 h-8 bg-background-dark rounded-full border-2 border-primary flex items-center justify-center relative z-10 shadow-lg">
                        <span class="material-symbols-outlined text-primary text-[14px]">local_shipping</span>
                    </div>
                    <div
                        class="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-background-dark/90 rounded text-[10px] text-white whitespace-nowrap border border-white/10 hidden group-hover:block z-20">
                        Driver: J. Doe
                    </div>
                </div>

                <!-- Unassigned Order Dot -->
                <div class="w-4 h-4 rounded-full bg-gray-400 border-2 border-white hover:scale-125 transition-transform cursor-pointer absolute"
                    style="left: 120px; top: 80px;"></div>
                <div class="w-4 h-4 rounded-full bg-gray-400 border-2 border-white hover:scale-125 transition-transform cursor-pointer absolute"
                    style="left: 140px; top: 90px;"></div>

                <!-- Active Route Line (CSS Simulation) -->
                <svg class="absolute top-0 left-0 w-[400px] h-[300px] pointer-events-none"
                    style="transform: translate(-100px, -50px);">
                    <path d="M 34 34 Q 150 10 240 140" stroke="#1CE783" stroke-width="3" fill="none"
                        stroke-dasharray="5,5" class="animate-pulse" />
                </svg>
            </div>

            <!-- Bottom Map Toolbar -->
            <div class="absolute bottom-6 left-1/2 transform -translate-x-1/2 glass-panel p-2 rounded-xl flex gap-1">
                <button class="p-2 hover:bg-white/10 rounded-lg text-white tooltip-trigger" title="Layers"><span
                        class="material-symbols-outlined">layers</span></button>
                <button class="p-2 hover:bg-white/10 rounded-lg text-white" title="Traffic"><span
                        class="material-symbols-outlined">traffic</span></button>
                <button class="p-2 hover:bg-white/10 rounded-lg text-white" title="Heatmap"><span
                        class="material-symbols-outlined">blur_on</span></button>
                <div class="w-[1px] h-8 bg-white/10 mx-1"></div>
                <button class="p-2 hover:bg-white/10 rounded-lg text-white" title="Route Replay"><span
                        class="material-symbols-outlined">history</span></button>
            </div>
        </div>

        <!-- Right Panel: Pending Load Queue -->
        <div class="w-80 bg-card-dark border-l border-white/5 flex flex-col z-10 glass-panel">
            <div class="p-4 border-b border-white/5 flex justify-between items-center">
                <h3 class="font-bold text-white text-sm">Pending Loads (8)</h3>
                <button
                    class="flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-1 rounded hover:bg-primary/20 transition-colors">
                    <span class="material-symbols-outlined text-[14px]">add</span> Assign
                </button>
            </div>

            <div class="flex-1 overflow-y-auto no-scrollbar p-2 space-y-3">
                <div v-for="load in pendingLoads" :key="load.id"
                    class="p-3 rounded-lg bg-white/5 border border-transparent hover:border-primary/30 transition-all select-none cursor-grab active:cursor-grabbing">
                    <div class="flex justify-between items-start mb-2">
                        <span class="text-xs font-mono text-gray-400">#{{ load.id }}</span>
                        <span class="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 text-[10px] font-bold">{{
                            load.priority }}</span>
                    </div>

                    <div class="space-y-2 mb-3">
                        <div class="flex items-center gap-2">
                            <span class="material-symbols-outlined text-gray-500 text-[14px]">inventory_2</span>
                            <span class="text-sm font-medium text-white">{{ load.type }}</span>
                        </div>
                        <div class="flex justify-between text-[11px] text-gray-400">
                            <span>{{ load.weight }} kg</span>
                            <span>{{ load.volume }} m³</span>
                        </div>
                    </div>

                    <div class="flex items-center justify-between pt-2 border-t border-white/5">
                        <div class="text-[10px] text-gray-400">Hub: <span class="text-gray-300">{{ load.hub }}</span>
                        </div>
                        <button class="text-xs text-primary hover:text-white transition-colors">Details</button>
                    </div>
                </div>
            </div>

            <!-- Bottom Summary -->
            <div class="p-4 border-t border-white/5 bg-black/20">
                <div class="text-xs text-gray-500 mb-2">Overall SLA Projection</div>
                <div class="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden mb-1">
                    <div class="h-full bg-gradient-to-r from-yellow-500 to-green-500 w-[94%]"></div>
                </div>
                <div class="flex justify-between text-[10px]">
                    <span class="text-white">94% Predicted</span>
                    <span class="text-green-400">+2% vs Target</span>
                </div>
            </div>
        </div>

    </div>
</template>

<script setup>
import { ref } from 'vue'

const drivers = ref([
    { id: 'DRV-001', name: 'Mike Ross', vehicle: 'Van T-20', location: 'Sector 4', statusColor: 'bg-green-500', load: 85, hours: 4.5, avatar: 'https://i.pravatar.cc/150?u=1' },
    { id: 'DRV-042', name: 'Harvey Specter', vehicle: 'Truck XL', location: 'Downtown', statusColor: 'bg-yellow-500', load: 45, hours: 2.1, avatar: 'https://i.pravatar.cc/150?u=2' },
    { id: 'DRV-091', name: 'Rachel Zane', vehicle: 'Van T-15', location: 'West End', statusColor: 'bg-green-500', load: 12, hours: 6.8, avatar: 'https://i.pravatar.cc/150?u=3' },
    { id: 'DRV-103', name: 'Louis Litt', vehicle: 'Van T-20', location: 'Depot', statusColor: 'bg-gray-500', load: 0, hours: 8.0, avatar: 'https://i.pravatar.cc/150?u=4' },
])

const pendingLoads = ref([
    { id: 'ORD-9921', type: 'Electronics', weight: 450, volume: 2.1, priority: 'HIGH', hub: 'North-East' },
    { id: 'ORD-3321', type: 'Perishables', weight: 120, volume: 0.8, priority: 'URGENT', hub: 'South' },
    { id: 'ORD-1102', type: 'Furniture', weight: 850, volume: 5.4, priority: 'NORMAL', hub: 'North-East' },
    { id: 'ORD-5541', type: 'Retail Goods', weight: 200, volume: 1.2, priority: 'NORMAL', hub: 'West DC' },
])
</script>
