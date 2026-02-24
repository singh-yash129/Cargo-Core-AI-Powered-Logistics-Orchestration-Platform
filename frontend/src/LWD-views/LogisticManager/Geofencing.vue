<template>
    <div class="h-[calc(100vh-8rem)] flex flex-col gap-4">
        <div class="flex justify-between items-center">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Geofencing & Zones</h2>
            <div
                class="flex items-center gap-2 bg-gray-100 dark:bg-black/40 rounded-lg p-1 border border-gray-200 dark:border-white/10 shadow-sm">
                <button class="px-3 py-1.5 rounded bg-primary text-white font-medium text-sm shadow-sm">Map
                    View</button>
                <button
                    class="px-3 py-1.5 rounded hover:bg-gray-200 dark:hover:bg-white/10 text-gray-600 dark:text-gray-400 text-sm transition-colors">List
                    View</button>
            </div>
        </div>

        <div class="flex-1 flex gap-6 overflow-hidden">
            <!-- Zone List Sidebar -->
            <div class="w-80 glass-panel rounded-xl flex flex-col border border-gray-200 dark:border-white/5">
                <div class="p-4 border-b border-gray-200 dark:border-white/5">
                    <button
                        class="w-full py-2 bg-primary/5 hover:bg-primary/10 border border-primary/20 dark:bg-white/5 dark:hover:bg-white/10 dark:border-white/10 border-dashed rounded-lg text-primary flex items-center justify-center gap-2 transition-colors font-medium">
                        <span class="material-symbols-outlined">add_location_alt</span>
                        Create New Zone
                    </button>
                </div>
                <div class="flex-1 overflow-y-auto p-2 space-y-2">
                    <div v-for="zone in filteredZones" :key="zone.id"
                        class="p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer border border-transparent hover:border-gray-200 dark:hover:border-white/10 transition-all group shadow-sm">
                        <div class="flex justify-between items-start">
                            <div class="font-bold text-gray-900 dark:text-white">{{ zone.name }}</div>
                            <span
                                class="material-symbols-outlined text-gray-400 group-hover:text-gray-900 dark:text-gray-500 dark:group-hover:text-white text-[16px] transition-colors">edit</span>
                        </div>
                        <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">{{ zone.type }} • {{ zone.radius }}km
                        </div>
                        <div class="mt-2 flex gap-2">
                            <span
                                class="px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20 text-[10px] font-bold uppercase tracking-wider">Active</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Interactive Map Editor Area -->
            <div
                class="flex-1 glass-panel rounded-xl relative overflow-hidden border border-gray-200 dark:border-white/5">
                <!-- Tools Overlay -->
                <div class="absolute top-4 left-4 z-10 flex flex-col gap-2">
                    <button
                        class="w-10 h-10 rounded bg-white text-gray-700 hover:bg-gray-50 dark:bg-card-dark dark:text-white shadow-lg flex items-center justify-center dark:hover:bg-gray-700 transition-colors tooltip border border-gray-200 dark:border-transparent"
                        title="Draw Polygon"><span class="material-symbols-outlined">pentagon</span></button>
                    <button
                        class="w-10 h-10 rounded bg-white text-gray-700 hover:bg-gray-50 dark:bg-card-dark dark:text-white shadow-lg flex items-center justify-center dark:hover:bg-gray-700 transition-colors tooltip border border-gray-200 dark:border-transparent"
                        title="Draw Circle"><span
                            class="material-symbols-outlined">radio_button_unchecked</span></button>
                    <button
                        class="w-10 h-10 rounded bg-white text-gray-700 hover:bg-gray-50 dark:bg-card-dark dark:text-white shadow-lg flex items-center justify-center dark:hover:bg-gray-700 transition-colors tooltip border border-gray-200 dark:border-transparent"
                        title="Draw Line"><span class="material-symbols-outlined">timeline</span></button>
                </div>

                <!-- Map Placeholder -->
                <div
                    class="absolute inset-0 bg-gray-100 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
                    <div
                        class="text-gray-600 dark:text-gray-400 font-mono text-sm bg-white/80 dark:bg-black/50 px-4 py-2 rounded-lg backdrop-blur-sm shadow-sm border border-gray-200 dark:border-white/10">
                        Interactive Map Editor Loading...</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { useLogisticStore } from '@/stores/logisticStore'
import { storeToRefs } from 'pinia'

const store = useLogisticStore()
const { filteredZones } = storeToRefs(store)
</script>
