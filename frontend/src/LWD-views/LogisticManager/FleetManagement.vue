<template>
    <div class="space-y-6">
        <div class="flex justify-between items-center">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Fleet & Drivers Overview</h2>
            <div class="flex gap-3">
                <button
                    class="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium dark:bg-white/5 dark:hover:bg-white/10 dark:text-white border border-gray-200 dark:border-white/10 py-2 px-4 rounded-lg transition-colors shadow-sm">Maintenance
                    Report</button>
                <button
                    class="bg-primary hover:bg-primary/90 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors shadow-sm">
                    <span class="material-symbols-outlined">local_shipping</span> Add Vehicle
                </button>
            </div>
        </div>

        <!-- Live Map Placeholder -->
        <div
            class="glass-panel w-full h-[300px] rounded-xl relative overflow-hidden group border border-gray-200 dark:border-white/5">
            <div
                class="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 opacity-60 dark:opacity-40 group-hover:opacity-80 dark:group-hover:opacity-50 transition-opacity">
            </div>
            <div class="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                <div
                    class="bg-white/80 dark:bg-black/50 backdrop-blur-md px-6 py-3 rounded-full text-gray-900 dark:text-white font-medium flex items-center gap-3 border border-gray-200 dark:border-white/10 shadow-lg">
                    <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    Live Fleet Tracking Active (45 Vehicles)
                </div>
            </div>
        </div>

        <!-- Fleet Tables -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Driver Scorecard -->
            <div class="glass-panel rounded-xl p-6">
                <h3 class="font-bold text-gray-900 dark:text-white mb-4">Top Driver Performance</h3>
                <div class="space-y-4">
                    <div v-for="driver in filteredTopDrivers" :key="driver.id"
                        class="flex items-center gap-4 p-3 rounded-lg bg-gray-50 border border-transparent hover:border-gray-200 dark:bg-white/5 dark:hover:bg-white/10 transition-colors shadow-sm group">
                        <img :src="driver.avatar"
                            class="w-10 h-10 rounded-full border border-gray-200 dark:border-white/10">
                        <div class="flex-1">
                            <div class="flex justify-between items-center">
                                <span class="text-gray-900 dark:text-white font-bold text-sm">{{ driver.name }}</span>
                                <span
                                    class="text-yellow-500 dark:text-yellow-400 font-bold text-sm bg-yellow-50 dark:bg-yellow-500/10 px-2 py-0.5 rounded-full border border-yellow-200 dark:border-yellow-500/20">★
                                    {{ driver.rating }}</span>
                            </div>
                            <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">{{ driver.trips }} trips •
                                <span class="font-medium"
                                    :class="driver.ontime > 95 ? 'text-green-500 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'">{{
                                        driver.ontime }}% On-time</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Maintenance Alerts -->
            <div class="glass-panel rounded-xl p-6 relative overflow-hidden flex flex-col">
                <div class="absolute top-0 right-0 p-6 opacity-5 dark:opacity-10 pointer-events-none"><span
                        class="material-symbols-outlined text-6xl text-gray-900 dark:text-white">build</span></div>
                <h3 class="font-bold text-gray-900 dark:text-white mb-4">Vehicle Maintenance</h3>
                <div class="overflow-x-auto">
                    <table class="w-full text-left text-sm">
                        <thead class="bg-gray-50 dark:bg-transparent">
                            <tr
                                class="text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-white/10 uppercase tracking-wider text-[10px]">
                                <th class="py-2 px-2 font-medium">Vehicle ID</th>
                                <th class="py-2 font-medium">Issue</th>
                                <th class="py-2 text-right font-medium">Status</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-100 dark:divide-white/5">
                            <tr v-for="issue in filteredMaintenance" :key="issue.id"
                                class="group hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                <td class="py-3 px-2 text-gray-700 dark:text-white font-mono font-medium">{{ issue.id }}
                                </td>
                                <td class="py-3 text-gray-600 dark:text-gray-300">{{ issue.issue }}</td>
                                <td class="py-3 text-right"><span
                                        class="px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border shadow-sm"
                                        :class="[
                                            issue.statusClass,
                                            issue.status === 'In Shop' ? 'bg-red-50 border-red-200 text-red-600 dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-500' :
                                                (issue.status === 'Scheduled' ? 'bg-yellow-50 border-yellow-200 text-yellow-600 dark:bg-yellow-500/10 dark:border-yellow-500/20 dark:text-yellow-500' :
                                                    'bg-orange-50 border-orange-200 text-orange-600 dark:bg-orange-500/10 dark:border-orange-500/20 dark:text-orange-500')
                                        ]">{{ issue.status }}</span></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { useLogisticStore } from '@/stores/logisticStore'
import { storeToRefs } from 'pinia'

const store = useLogisticStore()
const { filteredTopDrivers, filteredMaintenance } = storeToRefs(store)
</script>
