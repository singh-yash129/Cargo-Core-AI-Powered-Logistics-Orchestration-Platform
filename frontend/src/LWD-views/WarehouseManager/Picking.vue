<template>
    <div class="space-y-6">
        <div class="flex justify-between items-center">
            <h2 class="text-2xl font-bold text-white">Picking & Packing</h2>
            <div class="flex gap-2">
                <div class="px-4 py-2 bg-black/40 border border-white/10 rounded-lg text-white text-sm">
                    Active Pickers: <span class="text-green-400 font-bold">14</span>
                </div>
                <button
                    class="bg-primary hover:bg-primary-dark text-background-dark font-bold py-2 px-4 rounded-lg transition-colors">Assign
                    Batches</button>
            </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Pick Wave Status -->
            <div class="lg:col-span-2 glass-panel rounded-xl overflow-hidden">
                <div class="p-6 border-b border-white/5 flex justify-between">
                    <h3 class="font-bold text-white">Active Pick Waves</h3>
                    <span class="text-xs text-gray-400">Auto-refreshing in 30s</span>
                </div>

                <table class="w-full text-left text-sm">
                    <thead class="bg-white/5 text-gray-400 uppercase">
                        <tr>
                            <th class="p-4">Wave ID</th>
                            <th class="p-4">Staff</th>
                            <th class="p-4">Progress</th>
                            <th class="p-4">Zone</th>
                            <th class="p-4">Deadline</th>
                            <th class="p-4">Status</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-white/5">
                        <tr v-for="wave in waves" :key="wave.id" class="hover:bg-white/5 transition-colors">
                            <td class="p-4 font-mono text-primary">{{ wave.id }}</td>
                            <td class="p-4 text-white">{{ wave.staff }}</td>
                            <td class="p-4 text-gray-300 w-32">
                                <div class="w-full bg-gray-700 h-1.5 rounded-full overflow-hidden mt-1">
                                    <div class="bg-primary h-full" :style="`width: ${wave.progress}%`"></div>
                                </div>
                            </td>
                            <td class="p-4 text-gray-400">{{ wave.zone }}</td>
                            <td class="p-4 text-white font-mono">{{ wave.deadline }}</td>
                            <td class="p-4">
                                <span class="px-2 py-1 rounded text-[10px] font-bold border" :class="wave.statusClass">
                                    {{ wave.status }}
                                </span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- Packing Station View -->
            <div class="glass-panel p-6 rounded-xl">
                <h3 class="font-bold text-white mb-4">Packing Stations</h3>
                <div class="space-y-4">
                    <div v-for="station in stations" :key="station.id"
                        class="p-4 bg-white/5 border border-white/5 rounded-lg">
                        <div class="flex justify-between items-center mb-2">
                            <span class="font-bold text-white">{{ station.name }}</span>
                            <span class="w-2 h-2 rounded-full"
                                :class="station.active ? 'bg-green-500 animate-pulse' : 'bg-gray-500'"></span>
                        </div>
                        <div class="text-xs text-gray-400 mb-2">{{ station.packer }}</div>
                        <div class="flex justify-between items-end text-sm">
                            <div>
                                <div class="text-gray-500 text-[10px] uppercase">Throughput</div>
                                <div class="text-white font-bold">{{ station.rate }} / hr</div>
                            </div>
                            <button
                                class="bg-white/10 hover:bg-white/20 text-white px-2 py-1 rounded text-xs transition-colors">Monitor</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'

const waves = ref([
    { id: 'WAVE-101', staff: 'Team A', progress: 75, zone: 'Zone A (High Vel)', deadline: '11:00 AM', status: 'In Progress', statusClass: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
    { id: 'WAVE-102', staff: 'Team B', progress: 20, zone: 'Zone B (Bulk)', deadline: '12:00 PM', status: 'Started', statusClass: 'bg-green-500/10 text-green-500 border-green-500/20' },
    { id: 'WAVE-103', staff: '--', progress: 0, zone: 'Zone C', deadline: '02:00 PM', status: 'Pending', statusClass: 'bg-gray-500/10 text-gray-500 border-gray-500/20' },
])

const stations = ref([
    { id: 1, name: 'Pack Station 1', packer: 'Sarah J.', rate: 45, active: true },
    { id: 2, name: 'Pack Station 2', packer: 'Mike T.', rate: 42, active: true },
    { id: 3, name: 'Pack Station 3', packer: '-- Closed --', rate: 0, active: false },
])
</script>
