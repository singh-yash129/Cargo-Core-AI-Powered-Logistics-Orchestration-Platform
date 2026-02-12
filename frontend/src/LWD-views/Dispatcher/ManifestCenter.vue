<template>
    <div class="space-y-6">
        <h2 class="text-2xl font-bold text-white">Manifest Center</h2>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- New Manifest Form -->
            <div class="glass-panel p-6 rounded-xl">
                <h3 class="font-bold text-white mb-4">Create Manifest</h3>
                <div class="space-y-4">
                    <div>
                        <label class="block text-xs text-gray-400 mb-1">Select Hub</label>
                        <select class="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white text-sm">
                            <option>North-East Hub</option>
                            <option>South Hub</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-xs text-gray-400 mb-1">Select Driver</label>
                        <select class="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white text-sm">
                            <option>Choose Driver...</option>
                            <option>Mike Ross</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-xs text-gray-400 mb-1">Route ID (Auto-generated)</label>
                        <input type="text" value="RT-2023-10-31-001" readonly
                            class="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-gray-500 text-sm">
                    </div>
                    <div class="pt-2">
                        <button
                            class="w-full bg-primary hover:bg-primary-dark text-background-dark font-bold py-2 rounded-lg transition-colors">Generate
                            Manifest</button>
                    </div>
                </div>
            </div>

            <!-- Recent Manifests -->
            <div class="lg:col-span-2 glass-panel rounded-xl overflow-hidden">
                <div class="p-6 border-b border-white/5 flex justify-between">
                    <h3 class="font-bold text-white">Today's Manifests</h3>
                    <div class="flex gap-2 text-xs">
                        <span class="px-2 py-1 bg-green-500/10 text-green-500 rounded">12 Dispatched</span>
                        <span class="px-2 py-1 bg-yellow-500/10 text-yellow-500 rounded">4 Pending</span>
                    </div>
                </div>

                <table class="w-full text-left text-sm">
                    <thead class="bg-white/5 text-gray-400 uppercase">
                        <tr>
                            <th class="p-4">Manifest ID</th>
                            <th class="p-4">Driver</th>
                            <th class="p-4">Orders</th>
                            <th class="p-4">Weight</th>
                            <th class="p-4">Status</th>
                            <th class="p-4">Action</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-white/5">
                        <tr v-for="manifest in manifests" :key="manifest.id" class="hover:bg-white/5 transition-colors">
                            <td class="p-4 font-mono text-white">{{ manifest.id }}</td>
                            <td class="p-4 text-gray-300">{{ manifest.driver }}</td>
                            <td class="p-4 text-gray-300">{{ manifest.orders }}</td>
                            <td class="p-4 text-gray-300">{{ manifest.weight }} kg</td>
                            <td class="p-4">
                                <span class="px-2 py-1 rounded text-[10px] font-bold border"
                                    :class="manifest.statusClass">
                                    {{ manifest.status }}
                                </span>
                            </td>
                            <td class="p-4 flex gap-2">
                                <button class="text-primary hover:underline text-xs">View</button>
                                <button class="text-gray-400 hover:text-white text-xs">Print</button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'

const manifests = ref([
    { id: 'MAN-9921', driver: 'Mike Ross', orders: 42, weight: 1250, status: 'Dispatched', statusClass: 'bg-green-500/10 text-green-500 border-green-500/20' },
    { id: 'MAN-9922', driver: 'Harvey Specter', orders: 15, weight: 450, status: 'Loading', statusClass: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' },
    { id: 'MAN-9923', driver: 'Rachel Zane', orders: 88, weight: 2100, status: 'Dispatched', statusClass: 'bg-green-500/10 text-green-500 border-green-500/20' },
    { id: 'MAN-9924', driver: '-- Unassigned --', orders: 12, weight: 320, status: 'Draft', statusClass: 'bg-gray-500/10 text-gray-500 border-gray-500/20' },
])
</script>
