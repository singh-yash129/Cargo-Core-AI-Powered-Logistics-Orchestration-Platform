<template>
    <div class="space-y-6">
        <h2 class="text-2xl font-bold text-white">Reverse Logistics & Returns</h2>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div class="glass-panel p-6 rounded-xl relative overflow-hidden group">
                <div class="absolute right-0 top-0 p-4 opacity-10"><span
                        class="material-symbols-outlined text-4xl">undo</span></div>
                <div class="text-sm text-gray-400 font-medium">Pending Returns</div>
                <div class="text-3xl font-bold text-white mt-2">142</div>
            </div>
            <div class="glass-panel p-6 rounded-xl relative overflow-hidden group">
                <div class="absolute right-0 top-0 p-4 opacity-10"><span
                        class="material-symbols-outlined text-4xl">recycling</span></div>
                <div class="text-sm text-gray-400 font-medium">Restock Rate</div>
                <div class="text-3xl font-bold text-white mt-2">68%</div>
            </div>
            <div class="glass-panel p-6 rounded-xl relative overflow-hidden group">
                <div class="absolute right-0 top-0 p-4 opacity-10"><span
                        class="material-symbols-outlined text-4xl">delete</span></div>
                <div class="text-sm text-gray-400 font-medium">Scrap / Dispose</div>
                <div class="text-3xl font-bold text-white mt-2">12%</div>
            </div>
            <div class="glass-panel p-6 rounded-xl relative overflow-hidden group">
                <div class="absolute right-0 top-0 p-4 opacity-10"><span
                        class="material-symbols-outlined text-4xl">currency_exchange</span></div>
                <div class="text-sm text-gray-400 font-medium">Total Refund Value</div>
                <div class="text-3xl font-bold text-white mt-2">$8,450</div>
            </div>
        </div>

        <!-- Returns List -->
        <div class="glass-panel rounded-xl overflow-hidden">
            <div class="p-6 border-b border-white/5 flex justify-between items-center">
                <h3 class="font-bold text-white">Active Return Requests (RMA)</h3>
                <button class="text-primary text-sm font-medium hover:underline">View All History</button>
            </div>
            <table class="w-full text-left text-sm">
                <thead class="bg-white/5 text-gray-400 uppercase">
                    <tr>
                        <th class="p-4">RMA ID</th>
                        <th class="p-4">Order ID</th>
                        <th class="p-4">Customer</th>
                        <th class="p-4">Reason</th>
                        <th class="p-4">Condition</th>
                        <th class="p-4">Action</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-white/5">
                    <tr v-for="rma in returns" :key="rma.id" class="hover:bg-white/5 transition-colors">
                        <td class="p-4 text-primary font-mono cursor-pointer hover:underline">{{ rma.id }}</td>
                        <td class="p-4 text-gray-300">{{ rma.orderId }}</td>
                        <td class="p-4 text-white">{{ rma.customer }}</td>
                        <td class="p-4 text-gray-400">{{ rma.reason }}</td>
                        <td class="p-4">
                            <span class="px-2 py-1 rounded text-[10px] font-bold border" :class="rma.conditionClass">
                                {{ rma.condition }}
                            </span>
                        </td>
                        <td class="p-4 flex gap-2">
                            <button
                                class="bg-green-500/20 text-green-400 hover:bg-green-500/30 px-2 py-1 rounded transition-colors">Approve</button>
                            <button
                                class="bg-red-500/20 text-red-400 hover:bg-red-500/30 px-2 py-1 rounded transition-colors">Reject</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'

const returns = ref([
    { id: 'RMA-9921', orderId: 'ORD-1102', customer: 'Alice Cooper', reason: 'Damaged in transit', condition: 'Damaged', conditionClass: 'bg-red-500/10 text-red-400 border-red-500/20' },
    { id: 'RMA-9922', orderId: 'ORD-3321', customer: 'Bob Dylan', reason: 'Wrong Item Sent', condition: 'New/Open Box', conditionClass: 'bg-green-500/10 text-green-400 border-green-500/20' },
    { id: 'RMA-9923', orderId: 'ORD-5541', customer: 'Charlie Watts', reason: 'Changed Mind', condition: 'Unopened', conditionClass: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
    { id: 'RMA-9924', orderId: 'ORD-1105', customer: 'David Gilmour', reason: 'Defective', condition: 'Defective', conditionClass: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
])
</script>
