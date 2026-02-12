<template>
    <div class="space-y-6">
        <!-- Top KPI Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div class="glass-panel p-4 rounded-xl flex flex-col justify-between h-32 relative overflow-hidden group">
                <div class="absolute right-0 top-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                    <span class="material-symbols-outlined text-4xl text-teal-500">inventory_2</span>
                </div>
                <div class="text-xs font-semibold text-gray-400 uppercase tracking-wide">Total Inventory Value</div>
                <div class="flex items-baseline gap-1">
                    <span class="text-2xl font-bold text-white">$4.2M</span>
                    <span class="text-xs text-green-400">+12%</span>
                </div>
                <div class="w-full bg-gray-800 h-1 mt-2 rounded-full overflow-hidden">
                    <div class="bg-teal-500 h-full w-[85%]"></div>
                </div>
            </div>

            <div
                class="glass-panel p-4 rounded-xl flex flex-col justify-between h-32 group border-l-4 border-yellow-500">
                <div class="text-xs font-semibold text-gray-400 uppercase tracking-wide">Orders Pending Pick</div>
                <div class="flex items-baseline gap-1">
                    <span class="text-3xl font-bold text-white">142</span>
                    <span class="text-xs text-yellow-500">Critical</span>
                </div>
                <div class="text-xs text-gray-500">Avg Pick Time: 12m</div>
            </div>

            <div class="glass-panel p-4 rounded-xl flex flex-col justify-between h-32 group">
                <div class="text-xs font-semibold text-gray-400 uppercase tracking-wide">Ready for Dispatch</div>
                <div class="flex items-baseline gap-1">
                    <span class="text-3xl font-bold text-white">385</span>
                </div>
                <div class="text-xs text-blue-400 flex items-center gap-1">
                    <span class="material-symbols-outlined text-[14px]">local_shipping</span> Next Truck: 15m
                </div>
            </div>

            <div class="glass-panel p-4 rounded-xl flex flex-col justify-between h-32 group">
                <div class="text-xs font-semibold text-gray-400 uppercase tracking-wide">Labor Active</div>
                <div class="flex items-baseline gap-1">
                    <span class="text-3xl font-bold text-white">42</span>
                    <span class="text-xs text-gray-500">/ 50</span>
                </div>
                <div class="flex -space-x-2 mt-2">
                    <div class="w-6 h-6 rounded-full bg-gray-700 border border-black"></div>
                    <div class="w-6 h-6 rounded-full bg-gray-600 border border-black"></div>
                    <div
                        class="w-6 h-6 rounded-full bg-gray-500 border border-black flex items-center justify-center text-[8px] text-white">
                        +39</div>
                </div>
            </div>

            <div
                class="glass-panel p-4 rounded-xl flex flex-col justify-between h-32 group bg-red-900/10 border-red-500/20">
                <div class="text-xs font-semibold text-red-300 uppercase tracking-wide">Safety Stock Alerts</div>
                <div class="flex items-baseline gap-1">
                    <span class="text-3xl font-bold text-white">8</span>
                    <span class="text-xs text-red-400">SKUs</span>
                </div>
                <button
                    class="text-xs bg-red-500/20 hover:bg-red-500/30 text-red-300 py-1 px-2 rounded transition-colors w-fit">
                    Restock Now</button>
            </div>
        </div>

        <!-- Main Content Split -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[550px]">

            <!-- Center: Picking Queue Table -->
            <div class="lg:col-span-2 glass-panel rounded-xl flex flex-col overflow-hidden">
                <div class="p-4 border-b border-white/5 flex justify-between items-center bg-black/20">
                    <h3 class="font-bold text-white flex items-center gap-2">
                        <span class="material-symbols-outlined text-teal-500">list_alt</span>
                        Live Picking Queue
                    </h3>
                    <div class="flex gap-2">
                        <button class="p-1.5 hover:bg-white/10 rounded text-gray-400 hover:text-white"><span
                                class="material-symbols-outlined text-[20px]">filter_list</span></button>
                        <button class="p-1.5 hover:bg-white/10 rounded text-gray-400 hover:text-white"><span
                                class="material-symbols-outlined text-[20px]">download</span></button>
                    </div>
                </div>

                <div class="flex-1 overflow-auto">
                    <table class="w-full text-left border-collapse">
                        <thead class="bg-white/5 sticky top-0 z-10 backdrop-blur-md">
                            <tr class="text-xs text-gray-400 uppercase tracking-wider">
                                <th class="p-3 font-medium">Order ID</th>
                                <th class="p-3 font-medium">Items</th>
                                <th class="p-3 font-medium">Zone</th>
                                <th class="p-3 font-medium">Priority</th>
                                <th class="p-3 font-medium">Assigned To</th>
                                <th class="p-3 font-medium">Status</th>
                                <th class="p-3 font-medium">Action</th>
                            </tr>
                        </thead>
                        <tbody class="text-sm divide-y divide-white/5">
                            <tr v-for="order in pickingQueue" :key="order.id"
                                class="hover:bg-white/5 transition-colors group">
                                <td class="p-3 font-mono text-teal-400">{{ order.id }}</td>
                                <td class="p-3 text-gray-300">{{ order.items }} items</td>
                                <td class="p-3 text-gray-300"><span
                                        class="px-2 py-0.5 bg-gray-700/50 rounded text-xs">{{ order.zone }}</span></td>
                                <td class="p-3">
                                    <span v-if="order.priority === 'High'"
                                        class="text-red-400 text-xs font-bold bg-red-500/10 px-2 py-0.5 rounded flex items-center gap-1 w-fit">
                                        <span class="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse"></span> HIGH
                                    </span>
                                    <span v-else class="text-gray-400 text-xs">Normal</span>
                                </td>
                                <td class="p-3">
                                    <div class="flex items-center gap-2" v-if="order.assigned">
                                        <div
                                            class="w-6 h-6 rounded-full bg-gray-600 flex items-center justify-center text-[10px]">
                                            {{ order.assignedInitials }}</div>
                                        <span class="text-gray-300">{{ order.assigned }}</span>
                                    </div>
                                    <span v-else class="text-gray-500 italic">-- Unassigned --</span>
                                </td>
                                <td class="p-3">
                                    <div class="w-24 bg-gray-700 rounded-full h-1.5 overflow-hidden">
                                        <div class="bg-teal-500 h-full transition-all duration-500"
                                            :style="`width: ${order.progress}%`"></div>
                                    </div>
                                    <div class="text-[10px] text-gray-500 mt-1">{{ order.progress }}% Picked</div>
                                </td>
                                <td class="p-3">
                                    <button class="text-gray-500 hover:text-white"><span
                                            class="material-symbols-outlined">more_horiz</span></button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Right: Labor Status & Floor Map -->
            <div class="flex flex-col gap-6">
                <!-- Labor Distribution Chart -->
                <div class="glass-panel p-5 rounded-xl flex-1">
                    <h3 class="font-bold text-white mb-4">Real-time Labor Status</h3>

                    <div class="space-y-4">
                        <div>
                            <div class="flex justify-between text-xs mb-1">
                                <span class="text-gray-400">Picking (Zone A)</span>
                                <span class="text-white">12 Staff</span>
                            </div>
                            <div class="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                                <div class="bg-teal-500 h-full w-[65%]"></div>
                            </div>
                        </div>

                        <div>
                            <div class="flex justify-between text-xs mb-1">
                                <span class="text-gray-400">Packing Stations</span>
                                <span class="text-white">8 Staff</span>
                            </div>
                            <div class="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                                <div class="bg-blue-500 h-full w-[45%]"></div>
                            </div>
                        </div>

                        <div>
                            <div class="flex justify-between text-xs mb-1">
                                <span class="text-gray-400">Receiving Dock</span>
                                <span class="text-white">6 Staff</span>
                            </div>
                            <div class="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                                <div class="bg-purple-500 h-full w-[30%]"></div>
                            </div>
                        </div>
                        <div>
                            <div class="flex justify-between text-xs mb-1">
                                <span class="text-gray-400">Break / Idle</span>
                                <span class="text-yellow-500">4 Staff</span>
                            </div>
                            <div class="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                                <div class="bg-yellow-500 h-full w-[10%]"></div>
                            </div>
                        </div>
                    </div>

                    <div class="mt-6 p-3 bg-white/5 rounded-lg border border-white/5">
                        <div class="text-xs text-gray-400 mb-1">Efficiency Insight</div>
                        <div class="text-sm text-white">Picking rate dropped by <span
                                class="text-red-400 font-bold">4%</span> in Zone B due to spill hazard.</div>
                    </div>
                </div>

                <!-- Return Processing Queue (Small) -->
                <div class="glass-panel p-4 rounded-xl h-48 bg-gray-800/20">
                    <div class="flex justify-between items-center mb-2">
                        <h3 class="font-bold text-white text-sm">Recent Returns</h3>
                        <span class="text-xs text-gray-500">Today</span>
                    </div>
                    <div class="space-y-2">
                        <div class="flex items-center justify-between p-2 rounded bg-black/20 text-xs text-gray-300">
                            <span>Damaged Item #992</span>
                            <span class="text-red-400">Scrap</span>
                        </div>
                        <div class="flex items-center justify-between p-2 rounded bg-black/20 text-xs text-gray-300">
                            <span>Wrong Color #221</span>
                            <span class="text-green-400">Restock</span>
                        </div>
                        <div class="flex items-center justify-between p-2 rounded bg-black/20 text-xs text-gray-300">
                            <span>Size Mismatch #110</span>
                            <span class="text-green-400">Restock</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'

const pickingQueue = ref([
    { id: 'ORD-8821', items: 4, zone: 'A-22', priority: 'High', assigned: 'John S.', assignedInitials: 'JS', progress: 75, status: 'In Progress' },
    { id: 'ORD-9912', items: 12, zone: 'B-04', priority: 'Normal', assigned: 'Sarah K.', assignedInitials: 'SK', progress: 30, status: 'In Progress' },
    { id: 'ORD-1102', items: 1, zone: 'A-10', priority: 'High', assigned: 'Mike L.', assignedInitials: 'ML', progress: 0, status: 'Pending' },
    { id: 'ORD-2291', items: 8, zone: 'C-01', priority: 'Normal', assigned: null, assignedInitials: '', progress: 0, status: 'Unassigned' },
    { id: 'ORD-7773', items: 2, zone: 'B-15', priority: 'Normal', assigned: null, assignedInitials: '', progress: 0, status: 'Unassigned' },
    { id: 'ORD-9991', items: 6, zone: 'A-05', priority: 'Normal', assigned: 'Davie B.', assignedInitials: 'DB', progress: 90, status: 'Review' },
    { id: 'ORD-8823', items: 14, zone: 'A-21', priority: 'Normal', assigned: 'John S.', assignedInitials: 'JS', progress: 0, status: 'Pending' },
])
</script>
