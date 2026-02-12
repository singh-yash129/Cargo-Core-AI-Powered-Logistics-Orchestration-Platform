<template>
    <div class="space-y-8">
        <!-- Stats Overview -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div class="glass-panel p-6 rounded-xl">
                <div class="text-gray-400 text-sm font-medium mb-1">Active Shipments</div>
                <div class="text-3xl font-bold text-white">124</div>
                <div class="text-green-400 text-xs mt-1">↑ 12% vs last week</div>
            </div>
            <div class="glass-panel p-6 rounded-xl">
                <div class="text-gray-400 text-sm font-medium mb-1">Monthly Spend</div>
                <div class="text-3xl font-bold text-white">$45.2k</div>
                <div class="text-gray-500 text-xs mt-1">Budget: $50k</div>
            </div>
            <div class="glass-panel p-6 rounded-xl">
                <div class="text-gray-400 text-sm font-medium mb-1">Avg. Delivery Cost</div>
                <div class="text-3xl font-bold text-blue-400">$365</div>
                <div class="text-green-400 text-xs mt-1">↓ 5% optimization</div>
            </div>
            <div class="glass-panel p-6 rounded-xl">
                <div class="text-gray-400 text-sm font-medium mb-1">Success Rate</div>
                <div class="text-3xl font-bold text-green-400">99.2%</div>
                <div class="text-gray-500 text-xs mt-1">Target: 99.0%</div>
            </div>
        </div>

        <!-- Quick Actions -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div
                class="glass-panel p-6 rounded-xl hover:bg-white/5 cursor-pointer transition-colors border border-dashed border-white/20 hover:border-blue-500/50 flex flex-col items-center text-center justify-center h-48 group">
                <div
                    class="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <span class="material-symbols-outlined text-3xl text-blue-500">add_box</span>
                </div>
                <h3 class="font-bold text-white">Create Shipment</h3>
                <p class="text-xs text-gray-400 mt-2">Single active delivery</p>
            </div>

            <div
                class="glass-panel p-6 rounded-xl hover:bg-white/5 cursor-pointer transition-colors border border-dashed border-white/20 hover:border-purple-500/50 flex flex-col items-center text-center justify-center h-48 group">
                <div
                    class="w-16 h-16 rounded-full bg-purple-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <span class="material-symbols-outlined text-3xl text-purple-500">update</span>
                </div>
                <h3 class="font-bold text-white">Schedule Recurring</h3>
                <p class="text-xs text-gray-400 mt-2">Set up weekly/monthly pickups</p>
            </div>

            <div
                class="glass-panel p-6 rounded-xl hover:bg-white/5 cursor-pointer transition-colors border border-dashed border-white/20 hover:border-green-500/50 flex flex-col items-center text-center justify-center h-48 group">
                <div
                    class="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <span class="material-symbols-outlined text-3xl text-green-500">upload_file</span>
                </div>
                <h3 class="font-bold text-white">Bulk Upload</h3>
                <p class="text-xs text-gray-400 mt-2">Import CSV / Excel orders</p>
            </div>
        </div>

        <!-- Recent Shipments Table -->
        <div class="glass-panel rounded-xl overflow-hidden overflow-x-auto">
            <div class="p-6 border-b border-white/5 flex justify-between items-center min-w-[600px]">
                <h3 class="font-bold text-white">Recent Consignments</h3>
                <button class="text-blue-400 text-sm hover:underline">View All</button>
            </div>
            <table class="w-full text-left text-sm min-w-[600px]">
                <thead class="bg-white/5 text-gray-400 uppercase">
                    <tr>
                        <th class="p-4">Tracking ID</th>
                        <th class="p-4">Destination</th>
                        <th class="p-4">Status</th>
                        <th class="p-4">ETA</th>
                        <th class="p-4">Amount</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-white/5">
                    <tr v-for="i in 5" :key="i" class="hover:bg-white/5 transition-colors">
                        <td class="p-4 font-mono text-blue-400">TRK-992{{ i }}</td>
                        <td class="p-4 text-white">Warehouse {{ String.fromCharCode(65 + i) }}</td>
                        <td class="p-4">
                            <span
                                class="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs font-bold border border-green-500/20">In
                                Transit</span>
                        </td>
                        <td class="p-4 text-gray-300">Today, 14:00</td>
                        <td class="p-4 text-white font-mono">$450.00</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script setup>
</script>
