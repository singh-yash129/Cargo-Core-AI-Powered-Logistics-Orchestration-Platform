<template>
    <div class="space-y-6">
        <div class="flex justify-between items-center">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Warehouse Management</h2>
            <button
                class="bg-primary hover:bg-primary/90 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors shadow-sm">
                <span class="material-symbols-outlined">add</span>
                Add New Hub
            </button>
        </div>

        <!-- Stats Overview -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="glass-panel p-6 rounded-xl relative overflow-hidden">
                <div class="text-gray-500 dark:text-gray-400 text-sm font-medium">Total Warehouses</div>
                <div class="text-4xl font-bold text-gray-900 dark:text-white mt-2">12</div>
                <div class="text-green-500 dark:text-green-400 text-xs mt-1 flex items-center gap-1"><span
                        class="material-symbols-outlined text-[14px]">trending_up</span> +2 this month</div>
            </div>
            <div class="glass-panel p-6 rounded-xl relative overflow-hidden">
                <div class="text-gray-500 dark:text-gray-400 text-sm font-medium">Total Capacity Utilized</div>
                <div class="text-4xl font-bold text-gray-900 dark:text-white mt-2">78%</div>
                <div class="w-full bg-gray-200 dark:bg-gray-700 h-1.5 mt-2 rounded-full overflow-hidden">
                    <div class="bg-blue-500 h-full w-[78%]"></div>
                </div>
            </div>
            <div class="glass-panel p-6 rounded-xl relative overflow-hidden">
                <div class="text-gray-500 dark:text-gray-400 text-sm font-medium">Critical Alerts</div>
                <div class="text-4xl font-bold text-gray-900 dark:text-white mt-2">3</div>
                <div class="text-red-500 dark:text-red-400 text-xs mt-1">Requires immediate attention</div>
            </div>
        </div>

        <!-- Warehouse List -->
        <div class="glass-panel rounded-xl overflow-hidden flex flex-col">
            <div class="p-6 border-b border-gray-200 dark:border-white/5 flex flex-col sm:flex-row gap-4">
                <div class="relative flex-1">
                    <span
                        class="material-symbols-outlined absolute left-3 top-2.5 text-gray-500 dark:text-gray-400">search</span>
                    <input type="text" placeholder="Search warehouses..."
                        class="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg py-2 pl-10 pr-4 text-gray-900 dark:text-white focus:outline-none focus:border-primary/50 dark:focus:border-primary/50 transition-colors">
                </div>
                <button
                    class="px-4 py-2 border border-gray-200 dark:border-white/10 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 flex items-center gap-2 transition-colors font-medium">
                    <span class="material-symbols-outlined">filter_list</span> Filter
                </button>
            </div>

            <div class="overflow-x-auto">
                <table class="w-full text-left">
                    <thead
                        class="bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">
                        <tr>
                            <th class="p-4 font-medium">Hub Name</th>
                            <th class="p-4 font-medium">Location</th>
                            <th class="p-4 font-medium">Manager</th>
                            <th class="p-4 font-medium">Capacity</th>
                            <th class="p-4 font-medium">Status</th>
                            <th class="p-4 font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100 dark:divide-white/5 text-sm">
                        <tr v-for="hub in warehouses" :key="hub.id"
                            class="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group">
                            <td class="p-4">
                                <div class="font-bold text-gray-900 dark:text-white">{{ hub.name }}</div>
                                <div class="text-xs text-gray-500 dark:text-gray-400">{{ hub.id }}</div>
                            </td>
                            <td class="p-4 text-gray-600 dark:text-gray-300">{{ hub.location }}</td>
                            <td class="p-4">
                                <div class="flex items-center gap-2">
                                    <div
                                        class="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-[10px] text-gray-700 dark:text-white font-bold tracking-wider">
                                        {{ hub.managerInitials }}</div>
                                    <span class="text-gray-700 dark:text-gray-300 font-medium">{{ hub.manager }}</span>
                                </div>
                            </td>
                            <td class="p-4 text-gray-600 dark:text-gray-300">
                                <div class="flex items-center gap-3">
                                    <div class="w-24 bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
                                        <div class="h-full rounded-full" :style="`width: ${hub.capacity}%`"
                                            :class="hub.capacity > 90 ? 'bg-red-500' : (hub.capacity > 70 ? 'bg-yellow-500' : 'bg-primary')">
                                        </div>
                                    </div>
                                    <span class="font-medium text-xs">{{ hub.capacity }}%</span>
                                </div>
                            </td>
                            <td class="p-4">
                                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border" :class="[
                                    hub.status.toLowerCase() === 'optimal' ? 'bg-green-50 border-green-200 text-green-600 dark:bg-green-500/10 dark:border-green-500/20 dark:text-green-500' :
                                        (hub.status.toLowerCase() === 'congested' ? 'bg-red-50 border-red-200 text-red-600 dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-500' :
                                            'bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-500')
                                ]">
                                    {{ hub.status }}
                                </span>
                            </td>
                            <td class="p-4">
                                <button
                                    class="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors p-1 rounded-md hover:bg-gray-100 dark:hover:bg-white/10">
                                    <span class="material-symbols-outlined text-[20px]">more_horiz</span>
                                </button>
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

const warehouses = ref([
    { id: 'HUB-NY-01', name: 'North-East Distribution Center', location: 'New York, NY', manager: 'Alex Chen', managerInitials: 'AC', capacity: 92, status: 'Congested', statusClass: 'bg-red-500/10 text-red-500' },
    { id: 'HUB-TX-04', name: 'South Hub', location: 'Austin, TX', manager: 'Sarah Connor', managerInitials: 'SC', capacity: 45, status: 'Optimal', statusClass: 'bg-green-500/10 text-green-500' },
    { id: 'HUB-CA-02', name: 'West Coast Gateway', location: 'Los Angeles, CA', manager: 'Mike Ross', managerInitials: 'MR', capacity: 78, status: 'Active', statusClass: 'bg-blue-500/10 text-blue-500' },
    { id: 'HUB-FL-09', name: 'Miami Forwarding', location: 'Miami, FL', manager: 'Elena Fisher', managerInitials: 'EF', capacity: 30, status: 'Optimal', statusClass: 'bg-green-500/10 text-green-500' },
])
</script>
