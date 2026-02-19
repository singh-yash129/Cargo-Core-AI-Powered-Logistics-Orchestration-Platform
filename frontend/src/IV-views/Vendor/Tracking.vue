<template>
    <div class="h-[calc(100vh-8rem)] flex flex-col md:flex-row gap-6">
        <!-- Shipment List -->
        <div class="w-full md:w-80 glass-panel rounded-xl overflow-hidden flex flex-col h-1/3 md:h-auto">
            <div class="p-4 border-b border-white/5">
                <h3 class="font-bold text-white mb-2">Active Shipments</h3>
                <div class="relative">
                    <span class="material-symbols-outlined absolute left-3 top-2.5 text-gray-400 text-sm">search</span>
                    <input type="text" placeholder="Search tracking ID..."
                        class="w-full bg-black/40 border border-white/10 rounded-lg py-2 pl-9 pr-4 text-white text-sm focus:outline-none focus:border-blue-500/50">
                </div>
            </div>
            <div class="flex-1 overflow-y-auto p-2 space-y-2">
                <div v-for="shipment in shipments" :key="shipment.id"
                    class="p-3 rounded-lg cursor-pointer transition-colors border"
                    :class="selectedShipment === shipment.id ? 'bg-blue-500/20 border-blue-500' : 'bg-white/5 border-transparent hover:bg-white/10'"
                    @click="selectedShipment = shipment.id">
                    <div class="flex justify-between items-start mb-1">
                        <span class="font-bold text-white text-sm">{{ shipment.id }}</span>
                        <span class="text-[10px] font-bold px-1.5 rounded" :class="shipment.statusClass">{{
                            shipment.status }}</span>
                    </div>
                    <div class="text-xs text-gray-400 truncate mb-1">{{ shipment.route }}</div>
                    <div class="text-[10px] text-gray-500 flex items-center gap-1">
                        <span class="material-symbols-outlined text-[10px]">schedule</span> ETA: {{ shipment.eta }}
                    </div>
                </div>
            </div>
        </div>

        <!-- Map View -->
        <div class="flex-1 glass-panel rounded-xl overflow-hidden relative flex flex-col">
            <!-- Stats Overlay -->
            <div class="absolute top-4 left-4 right-4 z-10 flex gap-4 pointer-events-none">
                <div
                    class="bg-black/80 backdrop-blur p-3 rounded-lg border border-white/10 shadow-lg pointer-events-auto flex items-center gap-3">
                    <div class="w-10 h-10 rounded bg-blue-500/20 flex items-center justify-center text-blue-400">
                        <span class="material-symbols-outlined">local_shipping</span>
                    </div>
                    <div>
                        <div class="text-xs text-gray-400">Total in Transit</div>
                        <div class="text-lg font-bold text-white">12 Trucks</div>
                    </div>
                </div>
                <div
                    class="bg-black/80 backdrop-blur p-3 rounded-lg border border-white/10 shadow-lg pointer-events-auto flex items-center gap-3">
                    <div class="w-10 h-10 rounded bg-green-500/20 flex items-center justify-center text-green-400">
                        <span class="material-symbols-outlined">check_circle</span>
                    </div>
                    <div>
                        <div class="text-xs text-gray-400">Delivered Today</div>
                        <div class="text-lg font-bold text-white">45 Orders</div>
                    </div>
                </div>
            </div>

            <!-- Map Container -->
            <div class="flex-1 bg-gray-900 relative">
                <div class="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 opacity-60"></div>

                <!-- Fake Markers -->
                <div class="absolute top-1/3 left-1/4 group cursor-pointer">
                    <div class="w-3 h-3 bg-blue-500 rounded-full animate-ping absolute"></div>
                    <div class="w-3 h-3 bg-blue-500 rounded-full border-2 border-white relative z-10"></div>
                    <div
                        class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-black/90 text-white text-xs p-2 rounded hidden group-hover:block whitespace-nowrap z-20">
                        TRK-9921 • In Transit</div>
                </div>
                <div class="absolute bottom-1/3 right-1/3 group cursor-pointer">
                    <div class="w-3 h-3 bg-green-500 rounded-full animate-ping absolute"></div>
                    <div class="w-3 h-3 bg-green-500 rounded-full border-2 border-white relative z-10"></div>
                    <div
                        class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-black/90 text-white text-xs p-2 rounded hidden group-hover:block whitespace-nowrap z-20">
                        TRK-8821 • Arriving Soon</div>
                </div>
            </div>

            <!-- Bottom Panel (Driver Info) -->
            <div class="h-48 bg-card-darker border-t border-white/5 p-6 flex gap-6" v-if="selectedShipment">
                <div class="w-1/4">
                    <div class="text-xs text-gray-400 uppercase font-bold mb-2">Driver Information</div>
                    <div class="flex items-center gap-3">
                        <img src="https://i.pravatar.cc/150?u=40" class="w-12 h-12 rounded-full border border-white/10">
                        <div>
                            <div class="font-bold text-white">David Miller</div>
                            <div class="text-xs text-gray-400">Volvo FH16 • 40ft Container</div>
                            <div class="flex items-center gap-1 text-xs text-yellow-400 mt-1">
                                <span class="material-symbols-outlined text-[10px]">star</span> 4.8
                            </div>
                        </div>
                    </div>
                    <div class="flex gap-2 mt-4">
                        <button
                            class="flex-1 py-1.5 bg-white/5 hover:bg-white/10 rounded text-xs font-bold text-white flex items-center justify-center gap-2 transition-colors"><span
                                class="material-symbols-outlined text-xs">call</span> Call</button>
                        <button
                            class="flex-1 py-1.5 bg-blue-600 hover:bg-blue-700 rounded text-xs font-bold text-white flex items-center justify-center gap-2 transition-colors"><span
                                class="material-symbols-outlined text-xs">chat</span> Message</button>
                    </div>
                </div>

                <div class="flex-1 border-l border-white/5 pl-6 grid grid-cols-4 gap-6">
                    <div>
                        <div class="text-xs text-gray-400 mb-1">Origin</div>
                        <div class="text-white font-bold text-sm">Central Warehouse, NY</div>
                        <div class="text-xs text-gray-500">Oct 24, 08:00 AM</div>
                    </div>
                    <div class="flex items-center justify-center">
                        <div class="w-full h-1 bg-gray-700 rounded relative">
                            <div class="absolute left-0 top-0 h-full bg-blue-500 w-2/3"></div>
                            <div
                                class="absolute left-2/3 top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 bg-blue-500 rounded-full border-2 border-black">
                            </div>
                        </div>
                    </div>
                    <div>
                        <div class="text-xs text-gray-400 mb-1">Destination</div>
                        <div class="text-white font-bold text-sm">Retail Store #402, PA</div>
                        <div class="text-xs text-gray-500">CTA: 16:30 PM</div>
                    </div>
                    <div>
                        <div class="text-xs text-gray-400 mb-1">Cargo Status</div>
                        <div class="text-green-400 font-bold text-sm">Temperature: 4°C</div>
                        <div class="text-xs text-gray-500">Humidity: 45%</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'

const selectedShipment = ref('TRK-9921')
const shipments = ref([
    { id: 'TRK-9921', status: 'In Transit', statusClass: 'text-blue-400 bg-blue-500/10', route: 'NY -> PA', eta: '16:30' },
    { id: 'TRK-8821', status: 'Arriving', statusClass: 'text-green-400 bg-green-500/10', route: 'NJ -> NY', eta: '14:15' },
    { id: 'TRK-7741', status: 'Delayed', statusClass: 'text-yellow-400 bg-yellow-500/10', route: 'CA -> NV', eta: 'Tomorrow' },
])
</script>
