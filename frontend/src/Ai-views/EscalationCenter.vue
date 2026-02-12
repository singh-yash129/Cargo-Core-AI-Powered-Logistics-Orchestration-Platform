<template>
    <div class="space-y-6">
        <h2 class="text-2xl font-bold text-white">Escalation Center</h2>

        <!-- Stats -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div class="glass-panel p-4 rounded-xl border-l-4 border-red-500">
                <div class="text-xs text-gray-400">Total Escalations</div>
                <div class="text-2xl font-bold text-white">12</div>
            </div>
            <div class="glass-panel p-4 rounded-xl border-l-4 border-yellow-500">
                <div class="text-xs text-gray-400">Pending Review</div>
                <div class="text-2xl font-bold text-white">5</div>
            </div>
            <div class="glass-panel p-4 rounded-xl border-l-4 border-blue-500">
                <div class="text-xs text-gray-400">Legal Threats</div>
                <div class="text-2xl font-bold text-white">1</div>
            </div>
            <div class="glass-panel p-4 rounded-xl border-l-4 border-green-500">
                <div class="text-xs text-gray-400">Resolved Today</div>
                <div class="text-2xl font-bold text-white">8</div>
            </div>
        </div>

        <!-- Filters -->
        <div class="flex gap-4 overflow-x-auto no-scrollbar">
            <button
                class="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm font-bold border border-white/5">All</button>
            <button
                class="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg text-sm font-bold border border-red-500/20">Anger
                Detected</button>
            <button
                class="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg text-sm font-bold border border-blue-500/20">Legal
                Risks</button>
            <button
                class="px-4 py-2 bg-yellow-500/20 text-yellow-400 rounded-lg text-sm font-bold border border-yellow-500/20">Damage
                Claims</button>
        </div>

        <!-- Escalation List -->
        <div class="glass-panel rounded-xl overflow-hidden overflow-x-auto">
            <table class="w-full text-left text-sm min-w-[800px]">
                <thead class="bg-white/5 text-gray-400 uppercase">
                    <tr>
                        <th class="p-4">Customer</th>
                        <th class="p-4">Order ID</th>
                        <th class="p-4">Reason</th>
                        <th class="p-4">Sentiment</th>
                        <th class="p-4">Time</th>
                        <th class="p-4 text-right">Action</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-white/5">
                    <tr v-for="ticket in tickets" :key="ticket.id" class="hover:bg-white/5 transition-colors">
                        <td class="p-4 font-bold text-white">{{ ticket.customer }}</td>
                        <td class="p-4 text-blue-400">{{ ticket.orderId }}</td>
                        <td class="p-4">
                            <span class="px-2 py-1 rounded text-xs font-bold" :class="ticket.badgeClass">
                                {{ ticket.reason }}
                            </span>
                        </td>
                        <td class="p-4">
                            <div class="w-24 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                                <div class="h-full bg-red-500" :style="{ width: ticket.sentimentScore + '%' }"></div>
                            </div>
                            <div class="text-[10px] text-red-400 mt-1">{{ ticket.sentimentScore }}% Negative</div>
                        </td>
                        <td class="p-4 text-gray-400">{{ ticket.time }}</td>
                        <td class="p-4 text-right">
                            <button
                                class="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg transition-colors">Resolve</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'

const tickets = ref([
    { id: 1, customer: 'Michael Scott', orderId: 'MV-1029', reason: 'Legal Threat', badgeClass: 'bg-red-500/20 text-red-400', sentimentScore: 92, time: '10m ago' },
    { id: 2, customer: 'Dwight Schrute', orderId: 'MV-9921', reason: 'Damage Claim', badgeClass: 'bg-yellow-500/20 text-yellow-400', sentimentScore: 78, time: '1h ago' },
    { id: 3, customer: 'Jim Halpert', orderId: 'MV-3321', reason: 'Bot Failure', badgeClass: 'bg-blue-500/20 text-blue-400', sentimentScore: 65, time: '2h ago' },
    { id: 4, customer: 'Pam Beesly', orderId: 'MV-4411', reason: 'Payment Dispute', badgeClass: 'bg-purple-500/20 text-purple-400', sentimentScore: 50, time: '3h ago' },
])
</script>
