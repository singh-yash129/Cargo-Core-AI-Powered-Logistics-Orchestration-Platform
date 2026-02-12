<template>
    <div class="space-y-6">
        <div class="flex justify-between items-center">
            <h2 class="text-2xl font-bold text-white">Warehouse Management</h2>
            <button
                class="bg-primary hover:bg-primary-dark text-background-dark font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors">
                <span class="material-symbols-outlined">add</span>
                Add New Hub
            </button>
        </div>

        <!-- Stats Overview -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="glass-panel p-6 rounded-xl relative overflow-hidden">
                <div class="text-gray-400 text-sm font-medium">Total Warehouses</div>
                <div class="text-4xl font-bold text-white mt-2">12</div>
                <div class="text-green-400 text-xs mt-1 flex items-center gap-1"><span
                        class="material-symbols-outlined text-[14px]">trending_up</span> +2 this month</div>
            </div>
            <div class="glass-panel p-6 rounded-xl relative overflow-hidden">
                <div class="text-gray-400 text-sm font-medium">Total Capacity Utilized</div>
                <div class="text-4xl font-bold text-white mt-2">78%</div>
                <div class="w-full bg-gray-700 h-1.5 mt-2 rounded-full overflow-hidden">
                    <div class="bg-blue-500 h-full w-[78%]"></div>
                </div>
            </div>
            <div class="glass-panel p-6 rounded-xl relative overflow-hidden">
                <div class="text-gray-400 text-sm font-medium">Critical Alerts</div>
                <div class="text-4xl font-bold text-white mt-2">3</div>
                <div class="text-red-400 text-xs mt-1">Requires immediate attention</div>
            </div>
        </div>

        <!-- Warehouse List -->
        <div class="glass-panel rounded-xl overflow-hidden">
            <div class="p-6 border-b border-white/5 flex gap-4">
                <div class="relative flex-1">
                    <span class="material-symbols-outlined absolute left-3 top-2.5 text-gray-500">search</span>
                    <input type="text" placeholder="Search warehouses..."
                        class="w-full bg-black/20 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-white focus:outline-none focus:border-primary/50">
                </div>
                <button
                    class="px-4 py-2 border border-white/10 rounded-lg text-gray-300 hover:bg-white/5 flex items-center gap-2">
                    <span class="material-symbols-outlined">filter_list</span> Filter
                </button>
            </div>

            <table class="w-full text-left">
                <thead class="bg-white/5 text-gray-400 text-sm uppercase">
                    <tr>
                        <th class="p-4 font-medium">Hub Name</th>
                        <th class="p-4 font-medium">Location</th>
                        <th class="p-4 font-medium">Manager</th>
                        <th class="p-4 font-medium">Capacity</th>
                        <th class="p-4 font-medium">Status</th>
                        <th class="p-4 font-medium">Actions</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-white/5 text-sm">
                    <tr v-for="hub in warehouses" :key="hub.id" class="hover:bg-white/5 transition-colors group">
                        <td class="p-4">
                            <div class="font-bold text-white">{{ hub.name }}</div>
                            <div class="text-xs text-gray-500">{{ hub.id }}</div>
                        </td>
                        <td class="p-4 text-gray-300">{{ hub.location }}</td>
                        <td class="p-4">
                            <div class="flex items-center gap-2">
                                <div
                                    class="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-[10px] text-white">
                                    {{ hub.managerInitials }}</div>
                                <span class="text-gray-300">{{ hub.manager }}</span>
                            </div>
                        </td>
                        <td class="p-4 text-gray-300">
                            <div class="flex items-center gap-2">
                                <div class="w-24 bg-gray-700 h-1.5 rounded-full overflow-hidden">
                                    <div class="bg-primary h-full" :style="`width: ${hub.capacity}%`"
                                        :class="hub.capacity > 90 ? 'bg-red-500' : 'bg-primary'"></div>
                                </div>
                                <span>{{ hub.capacity }}%</span>
                            </div>
                        </td>
                        <td class="p-4">
                            <span class="px-2 py-1 rounded text-xs font-bold" :class="hub.statusClass">
                                {{ hub.status }}
                            </span>
                        </td>
                        <td class="p-4">
                            <button class="text-gray-500 hover:text-white"><span
                                    class="material-symbols-outlined">more_horiz</span></button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'

const warehouses = ref([
    { id: 'HUB-NY-01', name: 'North-East Distribution Center', location: 'New York, NY', manager: 'Alex Chen', managerInitials: 'AC', capacity: 92, status: 'Congested', statusClass: 'bg-red-500/10 text-red-500' },
    { id: 'HUB-TX-04', name: 'South Hub', location: 'Austin, TX', manager: 'Sarah Connor', managerInitials: 'SC', capacity: 45, status: 'Optimal', statusClass: 'bg-green-500/10 text-green-500' },
    { id: 'HUB-CA-02', name: 'West Coast Gateway', location: 'Los Angeles, CA', manager: 'Mike Ross', managerInitials: 'MR', capacity: 78, status: 'Active', statusClass: 'bg-blue-500/10 text-blue-500' },
    { id: 'HUB-FL-09', name: 'Miami Forwarding', location: 'Miami, FL', manager: 'Elena Fisher', managerInitials: 'EF', capacity: 30, status: 'Optimal', statusClass: 'bg-green-500/10 text-green-500' },
])
</script>
