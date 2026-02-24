<template>
    <div class="space-y-6">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Reverse Logistics & Returns</h2>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div class="glass-panel p-6 rounded-xl relative overflow-hidden group">
                <div
                    class="absolute right-0 top-0 p-4 opacity-5 dark:opacity-10 text-gray-900 dark:text-white transition-opacity group-hover:opacity-10 dark:group-hover:opacity-20">
                    <span class="material-symbols-outlined text-5xl">undo</span>
                </div>
                <div class="text-sm text-gray-500 dark:text-gray-400 font-medium">Pending Returns</div>
                <div class="text-3xl font-bold text-gray-900 dark:text-white mt-2">{{ pendingReturns }}</div>
            </div>
            <div class="glass-panel p-6 rounded-xl relative overflow-hidden group">
                <div
                    class="absolute right-0 top-0 p-4 opacity-5 dark:opacity-10 text-gray-900 dark:text-white transition-opacity group-hover:opacity-10 dark:group-hover:opacity-20">
                    <span class="material-symbols-outlined text-5xl">recycling</span>
                </div>
                <div class="text-sm text-gray-500 dark:text-gray-400 font-medium">Restock Rate</div>
                <div class="text-3xl font-bold text-gray-900 dark:text-white mt-2">68%</div>
            </div>
            <div class="glass-panel p-6 rounded-xl relative overflow-hidden group">
                <div
                    class="absolute right-0 top-0 p-4 opacity-5 dark:opacity-10 text-gray-900 dark:text-white transition-opacity group-hover:opacity-10 dark:group-hover:opacity-20">
                    <span class="material-symbols-outlined text-5xl">delete</span>
                </div>
                <div class="text-sm text-gray-500 dark:text-gray-400 font-medium">Scrap / Dispose</div>
                <div class="text-3xl font-bold text-gray-900 dark:text-white mt-2">12%</div>
            </div>
            <div class="glass-panel p-6 rounded-xl relative overflow-hidden group">
                <div
                    class="absolute right-0 top-0 p-4 opacity-5 dark:opacity-10 text-gray-900 dark:text-white transition-opacity group-hover:opacity-10 dark:group-hover:opacity-20">
                    <span class="material-symbols-outlined text-5xl">currency_exchange</span>
                </div>
                <div class="text-sm text-gray-500 dark:text-gray-400 font-medium">Total Refund Value</div>
                <div class="text-3xl font-bold text-gray-900 dark:text-white mt-2">${{ refundValue.toLocaleString() }}
                </div>
            </div>
        </div>

        <!-- Returns List -->
        <div class="glass-panel rounded-xl overflow-hidden flex flex-col">
            <div class="p-6 border-b border-gray-200 dark:border-white/5 flex justify-between items-center">
                <h3 class="font-bold text-gray-900 dark:text-white">Active Return Requests (RMA)</h3>
                <button class="text-primary text-sm font-medium hover:text-primary/80 transition-colors">View All
                    History</button>
            </div>
            <div class="overflow-x-auto">
                <table class="w-full text-left text-sm">
                    <thead class="bg-gray-50 dark:bg-white/5">
                        <tr class="text-gray-500 dark:text-gray-400 uppercase tracking-wider text-xs">
                            <th class="p-4 font-medium">RMA ID</th>
                            <th class="p-4 font-medium">Order ID</th>
                            <th class="p-4 font-medium">Customer</th>
                            <th class="p-4 font-medium">Reason</th>
                            <th class="p-4 font-medium">Condition</th>
                            <th class="p-4 font-medium">Action</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100 dark:divide-white/5">
                        <tr v-for="rma in filteredReturns" :key="rma.id"
                            class="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group">
                            <td class="p-4 text-primary font-mono cursor-pointer hover:underline font-medium">{{ rma.id
                                }}</td>
                            <td class="p-4 text-gray-600 dark:text-gray-300">{{ rma.orderId }}</td>
                            <td class="p-4 text-gray-900 dark:text-white font-medium">{{ rma.customer }}</td>
                            <td class="p-4 text-gray-500 dark:text-gray-400">{{ rma.reason }}</td>
                            <td class="p-4">
                                <span
                                    class="px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider border shadow-sm"
                                    :class="[
                                        rma.condition === 'Damaged' ? 'bg-red-50 border-red-200 text-red-600 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20' :
                                            (rma.condition === 'New/Open Box' ? 'bg-green-50 border-green-200 text-green-600 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20' :
                                                (rma.condition === 'Unopened' ? 'bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20' :
                                                    'bg-yellow-50 border-yellow-200 text-yellow-600 dark:bg-yellow-500/10 dark:text-yellow-400 dark:border-yellow-500/20'))
                                    ]">
                                    {{ rma.condition }}
                                </span>
                            </td>
                            <td class="p-4 flex gap-2">
                                <button
                                    class="bg-green-50 hover:bg-green-100 text-green-700 font-medium border border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:hover:bg-green-500/20 dark:border-transparent px-3 py-1.5 rounded-lg transition-colors shadow-sm text-xs">Approve</button>
                                <button
                                    class="bg-red-50 hover:bg-red-100 text-red-700 font-medium border border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20 dark:border-transparent px-3 py-1.5 rounded-lg transition-colors shadow-sm text-xs">Reject</button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue'
import { useLogisticStore } from '@/stores/logisticStore'
import { storeToRefs } from 'pinia'

const store = useLogisticStore()
const { filteredReturns } = storeToRefs(store)

const pendingReturns = computed(() => filteredReturns.value.length)
const refundValue = computed(() => filteredReturns.value.length * 1250 + 500) // Dummy formula for reactivity
</script>
