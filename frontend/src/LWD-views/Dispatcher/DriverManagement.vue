<template>
    <div class="space-y-6">
        <div class="flex justify-between items-center">
            <h2 class="text-2xl font-bold text-white">Driver Management</h2>
            <div class="flex gap-2">
                <button
                    class="bg-white/5 hover:bg-white/10 text-white border border-white/10 py-2 px-4 rounded-lg transition-colors flex items-center gap-2">
                    <span class="material-symbols-outlined">message</span> Broadcast
                </button>
                <button
                    class="bg-primary hover:bg-primary-dark text-background-dark font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors">
                    <span class="material-symbols-outlined">add</span> Onboard Driver
                </button>
            </div>
        </div>

        <!-- Overview Stats -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="glass-panel p-4 rounded-xl text-center">
                <div class="text-2xl font-bold text-white">42</div>
                <div class="text-xs text-gray-400">Total Drivers</div>
            </div>
            <div class="glass-panel p-4 rounded-xl text-center">
                <div class="text-2xl font-bold text-green-400">38</div>
                <div class="text-xs text-gray-400">Active Now</div>
            </div>
            <div class="glass-panel p-4 rounded-xl text-center">
                <div class="text-2xl font-bold text-yellow-500">2</div>
                <div class="text-xs text-gray-400">On Break</div>
            </div>
            <div class="glass-panel p-4 rounded-xl text-center">
                <div class="text-2xl font-bold text-red-500">2</div>
                <div class="text-xs text-gray-400">Maintenance/Off</div>
            </div>
        </div>

        <!-- Drivers List -->
        <div class="glass-panel rounded-xl overflow-hidden">
            <div class="p-4 border-b border-white/5 flex gap-4">
                <input type="text" placeholder="Search driver by name, ID, or vehicle..."
                    class="flex-1 bg-black/20 border border-white/10 rounded-lg py-2 px-4 text-white focus:outline-none focus:border-primary/50">
                <select class="bg-black/20 border border-white/10 rounded-lg px-4 text-white">
                    <option>All Statuses</option>
                    <option>Active</option>
                    <option>Inactive</option>
                </select>
            </div>

            <table class="w-full text-left text-sm">
                <thead class="bg-white/5 text-gray-400 uppercase">
                    <tr>
                        <th class="p-4">Driver</th>
                        <th class="p-4">Status</th>
                        <th class="p-4">Vehicle</th>
                        <th class="p-4">Current Load</th>
                        <th class="p-4">Shift Stats</th>
                        <th class="p-4">Action</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-white/5">
                    <tr v-for="driver in drivers" :key="driver.id" class="hover:bg-white/5 transition-colors group">
                        <td class="p-4">
                            <div class="flex items-center gap-3">
                                <img :src="driver.avatar" class="w-10 h-10 rounded-full bg-gray-700">
                                <div>
                                    <div class="font-bold text-white">{{ driver.name }}</div>
                                    <div class="text-xs text-gray-500">{{ driver.phone }}</div>
                                </div>
                            </div>
                        </td>
                        <td class="p-4">
                            <span class="px-2 py-1 rounded text-[10px] font-bold border" :class="driver.statusClass">
                                {{ driver.status }}
                            </span>
                        </td>
                        <td class="p-4 text-gray-300">{{ driver.vehicle }}</td>
                        <td class="p-4">
                            <div class="flex items-center gap-2">
                                <div class="w-16 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                                    <div class="bg-primary h-full" :style="`width: ${driver.load}%`"></div>
                                </div>
                                <span class="text-xs text-gray-400">{{ driver.load }}%</span>
                            </div>
                        </td>
                        <td class="p-4 text-xs text-gray-400">
                            <div>{{ driver.hours }}h logged</div>
                            <div>{{ driver.stops }} stops done</div>
                        </td>
                        <td class="p-4">
                            <button class="text-gray-500 hover:text-white mr-2"><span
                                    class="material-symbols-outlined">chat</span></button>
                            <button class="text-gray-500 hover:text-white"><span
                                    class="material-symbols-outlined">more_vert</span></button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'

const drivers = ref([
    { id: 1, name: 'Mike Ross', phone: '+1 555-0123', status: 'On Route', statusClass: 'bg-green-500/10 text-green-500 border-green-500/20', vehicle: 'Van T-20', load: 45, hours: 4.2, stops: 12, avatar: 'https://i.pravatar.cc/150?u=1' },
    { id: 2, name: 'Harvey Specter', phone: '+1 555-0124', status: 'Idle', statusClass: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20', vehicle: 'Truck XL', load: 0, hours: 1.5, stops: 0, avatar: 'https://i.pravatar.cc/150?u=2' },
    { id: 3, name: 'Rachel Zane', phone: '+1 555-0125', status: 'Return Trip', statusClass: 'bg-blue-500/10 text-blue-500 border-blue-500/20', vehicle: 'Van T-15', load: 10, hours: 6.8, stops: 24, avatar: 'https://i.pravatar.cc/150?u=3' },
    { id: 4, name: 'Louis Litt', phone: '+1 555-0126', status: 'Offline', statusClass: 'bg-gray-500/10 text-gray-500 border-gray-500/20', vehicle: 'n/a', load: 0, hours: 0, stops: 0, avatar: 'https://i.pravatar.cc/150?u=4' },
])
</script>
