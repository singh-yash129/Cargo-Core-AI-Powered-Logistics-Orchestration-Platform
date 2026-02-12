<template>
    <div class="space-y-6">
        <h2 class="text-2xl font-bold text-white">Refund Center</h2>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Stats Column -->
            <div class="space-y-6">
                <div class="glass-panel p-6 rounded-xl bg-gradient-to-br from-green-900/40 to-black">
                    <div class="flex justify-between items-start mb-2">
                        <div class="text-gray-400 text-sm">Total Refunded (This Month)</div>
                        <span class="material-symbols-outlined text-green-400">attach_money</span>
                    </div>
                    <div class="text-3xl font-bold text-white">$4,250.00</div>
                    <div class="text-xs text-green-400 mt-1">12% decrease vs last month</div>
                </div>

                <div class="glass-panel p-6 rounded-xl">
                    <h3 class="font-bold text-white mb-4">Auto-Refund Rules</h3>
                    <div class="space-y-3">
                        <div class="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                            <div>
                                <div class="text-sm font-bold text-white">Damaged Items &lt; $50</div>
                                <div class="text-xs text-gray-400">Auto-Approve</div>
                            </div>
                            <div class="w-10 h-6 bg-green-500/20 rounded-full relative cursor-pointer">
                                <div class="absolute right-1 top-1 w-4 h-4 bg-green-500 rounded-full"></div>
                            </div>
                        </div>
                        <div class="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                            <div>
                                <div class="text-sm font-bold text-white">Late Delivery &gt; 24h</div>
                                <div class="text-xs text-gray-400">10% Refund</div>
                            </div>
                            <div class="w-10 h-6 bg-green-500/20 rounded-full relative cursor-pointer">
                                <div class="absolute right-1 top-1 w-4 h-4 bg-green-500 rounded-full"></div>
                            </div>
                        </div>
                        <div class="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                            <div>
                                <div class="text-sm font-bold text-white">Missing Item</div>
                                <div class="text-xs text-gray-400">Requires Manual Review</div>
                            </div>
                            <div class="w-10 h-6 bg-gray-700 rounded-full relative cursor-pointer">
                                <div class="absolute left-1 top-1 w-4 h-4 bg-gray-400 rounded-full"></div>
                            </div>
                        </div>
                    </div>
                    <button
                        class="w-full mt-4 py-2 border border-dashed border-white/20 text-gray-400 rounded-lg hover:border-white/50 hover:text-white transition-colors text-sm">
                        + Add New Rule
                    </button>
                </div>
            </div>

            <!-- Refund Requests List -->
            <div class="lg:col-span-2 glass-panel p-6 rounded-xl">
                <div class="flex items-center justify-between mb-6">
                    <h3 class="font-bold text-white">Refund Requests</h3>
                    <div class="flex gap-2">
                        <button class="text-xs px-2 py-1 bg-white/10 rounded text-white">Pending</button>
                        <button class="text-xs px-2 py-1 hover:bg-white/10 rounded text-gray-400">History</button>
                    </div>
                </div>

                <div class="space-y-4">
                    <div v-for="refund in refunds" :key="refund.id"
                        class="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 hover:border-white/20 transition-colors">
                        <div class="flex items-center gap-4">
                            <div
                                class="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-white font-bold">
                                {{ refund.initials }}</div>
                            <div>
                                <div class="font-bold text-white">{{ refund.customer }} <span
                                        class="text-gray-500 font-normal ml-2">Order #{{ refund.orderId }}</span></div>
                                <div class="text-sm text-gray-400">{{ refund.reason }}</div>
                                <div class="flex gap-2 mt-1">
                                    <span class="text-[10px] bg-red-500/10 text-red-400 px-1.5 rounded">{{ refund.type
                                        }}</span>
                                    <span class="text-[10px] text-gray-500">{{ refund.time }}</span>
                                </div>
                            </div>
                        </div>
                        <div class="text-right flex items-center gap-4">
                            <div>
                                <div class="text-xl font-bold text-white">${{ refund.amount }}</div>
                                <div class="text-xs text-yellow-400" v-if="refund.autoRefund === false">Manual Review
                                </div>
                                <div class="text-xs text-purple-400" v-else>AI Suggested</div>
                            </div>
                            <div class="flex gap-2">
                                <button
                                    class="p-2 bg-green-500/20 text-green-500 rounded-lg hover:bg-green-500 hover:text-white transition-colors"
                                    title="Approve">
                                    <span class="material-symbols-outlined">check</span>
                                </button>
                                <button
                                    class="p-2 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-colors"
                                    title="Reject">
                                    <span class="material-symbols-outlined">close</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'

const refunds = ref([
    { id: 1, customer: 'David Rose', initials: 'DR', orderId: 'MV-1122', reason: 'Item arrived damaged (Photo verified)', type: 'Damage', time: '10m ago', amount: '45.00', autoRefund: true },
    { id: 2, customer: 'Alexis Rose', initials: 'AR', orderId: 'MV-3344', reason: 'Service was "Ew, David"', type: 'Service Complaint', time: '1h ago', amount: '120.00', autoRefund: false },
    { id: 3, customer: 'Johnny Rose', initials: 'JR', orderId: 'MV-5566', reason: 'Missing box #4', type: 'Lost Item', time: '2h ago', amount: '200.00', autoRefund: false },
])
</script>
