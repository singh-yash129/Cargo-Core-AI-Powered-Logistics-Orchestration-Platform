<template>
    <div class="space-y-6">
        <h2 class="text-2xl font-bold text-white">Reverse Logistics & Returns</h2>

        <!-- Action Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="glass-panel p-6 rounded-xl border-l-4 border-purple-500">
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <div class="text-gray-400 text-sm">Return Requests</div>
                        <div class="text-3xl font-bold text-white">24</div>
                    </div>
                    <span class="material-symbols-outlined text-purple-400 text-3xl">assignment_return</span>
                </div>
                <button
                    class="w-full py-2 bg-purple-500/20 text-purple-400 rounded-lg text-sm font-bold hover:bg-purple-500 hover:text-white transition-colors">Process
                    Requests</button>
            </div>
            <div class="glass-panel p-6 rounded-xl border-l-4 border-blue-500">
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <div class="text-gray-400 text-sm">Pickup Scheduling</div>
                        <div class="text-3xl font-bold text-white">8</div>
                    </div>
                    <span class="material-symbols-outlined text-blue-400 text-3xl">local_shipping</span>
                </div>
                <button
                    class="w-full py-2 bg-blue-500/20 text-blue-400 rounded-lg text-sm font-bold hover:bg-blue-500 hover:text-white transition-colors">Assign
                    Drivers</button>
            </div>
            <div class="glass-panel p-6 rounded-xl border-l-4 border-green-500">
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <div class="text-gray-400 text-sm">Completed Returns</div>
                        <div class="text-3xl font-bold text-white">156</div>
                    </div>
                    <span class="material-symbols-outlined text-green-400 text-3xl">check_circle</span>
                </div>
                <button
                    class="w-full py-2 bg-green-500/20 text-green-400 rounded-lg text-sm font-bold hover:bg-green-500 hover:text-white transition-colors">View
                    Report</button>
            </div>
        </div>

        <!-- Returns List -->
        <div class="glass-panel rounded-xl overflow-hidden p-6">
            <h3 class="font-bold text-white mb-4">Active Return Requests</h3>
            <div class="overflow-x-auto">
                <table class="w-full text-left text-sm min-w-[900px]">
                    <thead class="bg-white/5 text-gray-400 uppercase">
                        <tr>
                            <th class="p-4">Return ID</th>
                            <th class="p-4">Customer</th>
                            <th class="p-4">Item</th>
                            <th class="p-4">Reason</th>
                            <th class="p-4">Status</th>
                            <th class="p-4">Warehouse Status</th>
                            <th class="p-4 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-white/5">
                        <tr v-for="item in returns" :key="item.id" class="hover:bg-white/5 transition-colors">
                            <td class="p-4 font-mono text-purple-400">{{ item.id }}</td>
                            <td class="p-4 font-bold text-white">{{ item.customer }}</td>
                            <td class="p-4">{{ item.item }}</td>
                            <td class="p-4 text-gray-400">{{ item.reason }}</td>
                            <td class="p-4">
                                <span class="px-2 py-1 rounded text-xs font-bold" :class="item.statusClass">{{
                                    item.status }}</span>
                            </td>
                            <td class="p-4">
                                <div class="flex items-center gap-2">
                                    <span class="w-2 h-2 rounded-full"
                                        :class="item.warehouseStatus === 'Notified' ? 'bg-green-500' : 'bg-gray-500'"></span>
                                    {{ item.warehouseStatus }}
                                </div>
                            </td>
                            <td class="p-4 text-right flex gap-2 justify-end">
                                <button class="p-2 bg-white/5 rounded-lg hover:bg-white/10 text-gray-300"
                                    title="Download QR">
                                    <span class="material-symbols-outlined text-sm">qr_code</span>
                                </button>
                                <button
                                    class="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors">Schedule
                                    Pickup</button>
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

const returns = ref([
    { id: 'RET-8821', customer: 'Alice Smith', item: 'Office Chair (Black)', reason: 'Defective Wheels', status: 'Approved', statusClass: 'bg-green-500/20 text-green-400', warehouseStatus: 'Notified' },
    { id: 'RET-8824', customer: 'Bob Jones', item: 'Monitor Stand', reason: 'Wrong Size', status: 'Pending Review', statusClass: 'bg-yellow-500/20 text-yellow-400', warehouseStatus: 'Pending' },
    { id: 'RET-8899', customer: 'Charlie Day', item: 'Keyboard', reason: 'Changed Mind', status: 'Pickup Scheduled', statusClass: 'bg-blue-500/20 text-blue-400', warehouseStatus: 'Notified' },
])
</script>
