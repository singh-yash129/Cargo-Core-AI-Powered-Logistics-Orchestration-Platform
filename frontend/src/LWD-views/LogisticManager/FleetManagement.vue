<template>
    <div class="space-y-6">
        <div class="flex justify-between items-center">
            <h2 class="text-2xl font-bold text-white">Fleet & Drivers Overview</h2>
            <div class="flex gap-3">
                <button
                    class="bg-white/5 hover:bg-white/10 text-white border border-white/10 py-2 px-4 rounded-lg transition-colors">Maintenance
                    Report</button>
                <button
                    class="bg-primary hover:bg-primary-dark text-background-dark font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors">
                    <span class="material-symbols-outlined">local_shipping</span> Add Vehicle
                </button>
            </div>
        </div>

        <!-- Live Map Placeholder -->
        <div class="glass-panel w-full h-[300px] rounded-xl relative overflow-hidden group">
            <div
                class="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 opacity-40 group-hover:opacity-50 transition-opacity">
            </div>
            <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div
                    class="bg-black/50 backdrop-blur-md px-6 py-3 rounded-full text-white font-medium flex items-center gap-3 border border-white/10">
                    <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    Live Fleet Tracking Active (45 Vehicles)
                </div>
            </div>
        </div>

        <!-- Fleet Tables -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Driver Scorecard -->
            <div class="glass-panel rounded-xl p-6">
                <h3 class="font-bold text-white mb-4">Top Driver Performance</h3>
                <div class="space-y-4">
                    <div v-for="driver in topDrivers" :key="driver.id"
                        class="flex items-center gap-4 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                        <img :src="driver.avatar" class="w-10 h-10 rounded-full">
                        <div class="flex-1">
                            <div class="flex justify-between">
                                <span class="text-white font-medium text-sm">{{ driver.name }}</span>
                                <span class="text-yellow-400 font-bold text-sm">★ {{ driver.rating }}</span>
                            </div>
                            <div class="text-xs text-gray-500">{{ driver.trips }} trips • {{ driver.ontime }}% On-time
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Maintenance Alerts -->
            <div class="glass-panel rounded-xl p-6 relative overflow-hidden">
                <div class="absolute top-0 right-0 p-6 opacity-10"><span
                        class="material-symbols-outlined text-6xl">build</span></div>
                <h3 class="font-bold text-white mb-4">Vehicle Maintenance</h3>
                <table class="w-full text-left text-sm">
                    <thead>
                        <tr class="text-gray-500 border-b border-white/10">
                            <th class="py-2">Vehicle ID</th>
                            <th class="py-2">Issue</th>
                            <th class="py-2">Status</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-white/5">
                        <tr v-for="issue in maintenance" :key="issue.id">
                            <td class="py-3 text-white font-mono">{{ issue.id }}</td>
                            <td class="py-3 text-gray-300">{{ issue.issue }}</td>
                            <td class="py-3"><span class="px-2 py-0.5 rounded text-[10px] font-bold"
                                    :class="issue.statusClass">{{ issue.status }}</span></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'

const topDrivers = ref([
    { id: 1, name: 'Lewis Hamilton', rating: 4.9, trips: 142, ontime: 99, avatar: 'https://i.pravatar.cc/150?u=20' },
    { id: 2, name: 'Max Verstappen', rating: 4.8, trips: 138, ontime: 97, avatar: 'https://i.pravatar.cc/150?u=21' },
    { id: 3, name: 'Charles Leclerc', rating: 4.7, trips: 120, ontime: 95, avatar: 'https://i.pravatar.cc/150?u=22' },
])

const maintenance = ref([
    { id: 'TRK-992', issue: 'Engine Check Light', status: 'In Shop', statusClass: 'bg-red-500/10 text-red-500' },
    { id: 'VAN-104', issue: 'Tire Replacement', status: 'Scheduled', statusClass: 'bg-yellow-500/10 text-yellow-500' },
    { id: 'TRK-221', issue: 'Oil Change', status: 'Overdue', statusClass: 'bg-orange-500/10 text-orange-500' },
])
</script>
