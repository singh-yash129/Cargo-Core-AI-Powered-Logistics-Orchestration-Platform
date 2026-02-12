<template>
    <div class="h-[calc(100vh-8rem)] flex flex-col gap-4">
        <div class="flex justify-between items-center">
            <h2 class="text-2xl font-bold text-white">Geofencing & Zones</h2>
            <div class="flex items-center gap-2 bg-black/40 rounded-lg p-1 border border-white/10">
                <button class="px-3 py-1.5 rounded bg-primary text-background-dark font-medium text-sm">Map
                    View</button>
                <button class="px-3 py-1.5 rounded hover:bg-white/10 text-gray-400 text-sm transition-colors">List
                    View</button>
            </div>
        </div>

        <div class="flex-1 flex gap-6 overflow-hidden">
            <!-- Zone List Sidebar -->
            <div class="w-80 glass-panel rounded-xl flex flex-col">
                <div class="p-4 border-b border-white/5">
                    <button
                        class="w-full py-2 bg-white/5 hover:bg-white/10 border border-white/10 border-dashed rounded-lg text-primary flex items-center justify-center gap-2 transition-colors">
                        <span class="material-symbols-outlined">add_location_alt</span>
                        Create New Zone
                    </button>
                </div>
                <div class="flex-1 overflow-y-auto p-2 space-y-2">
                    <div v-for="zone in zones" :key="zone.id"
                        class="p-3 rounded-lg hover:bg-white/5 cursor-pointer border border-transparent hover:border-white/10 transition-all group">
                        <div class="flex justify-between items-start">
                            <div class="font-bold text-white">{{ zone.name }}</div>
                            <span
                                class="material-symbols-outlined text-gray-500 group-hover:text-white text-[16px]">edit</span>
                        </div>
                        <div class="text-xs text-gray-400 mt-1">{{ zone.type }} • {{ zone.radius }}km</div>
                        <div class="mt-2 flex gap-2">
                            <span
                                class="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 text-[10px] border border-blue-500/20">Active</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Interactive Map Editor Area -->
            <div class="flex-1 glass-panel rounded-xl relative overflow-hidden">
                <!-- Tools Overlay -->
                <div class="absolute top-4 left-4 z-10 flex flex-col gap-2">
                    <button
                        class="w-10 h-10 rounded bg-card-dark text-white shadow-lg flex items-center justify-center hover:bg-gray-700 transition-colors tooltip"
                        title="Draw Polygon"><span class="material-symbols-outlined">pentagon</span></button>
                    <button
                        class="w-10 h-10 rounded bg-card-dark text-white shadow-lg flex items-center justify-center hover:bg-gray-700 transition-colors tooltip"
                        title="Draw Circle"><span
                            class="material-symbols-outlined">radio_button_unchecked</span></button>
                    <button
                        class="w-10 h-10 rounded bg-card-dark text-white shadow-lg flex items-center justify-center hover:bg-gray-700 transition-colors tooltip"
                        title="Draw Line"><span class="material-symbols-outlined">timeline</span></button>
                </div>

                <!-- Map Placeholder -->
                <div
                    class="absolute inset-0 bg-gray-800 flex items-center justify-center bg-[url('/src/assets/map-dark.png')] bg-cover">
                    <div class="text-gray-500 font-mono text-sm bg-black/50 px-4 py-2 rounded-lg backdrop-blur-sm">
                        Interactive Map Editor Loading...</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'

const zones = ref([
    { id: 1, name: 'Downtown Delivery Zone', type: 'Polygon', radius: 12 },
    { id: 2, name: 'North-East Hub Perimeter', type: 'Circle', radius: 0.5 },
    { id: 3, name: 'Red Zone - Construction', type: 'Exclusion', radius: 2.5 },
    { id: 4, name: 'Airport Logistics Corridor', type: 'Polygon', radius: 45 },
])
</script>
