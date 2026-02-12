<template>
    <div class="space-y-6">
        <h2 class="text-2xl font-bold text-white">Finance & Payroll Overview</h2>

        <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <!-- Overview Cards -->
            <div class="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="glass-panel p-6 rounded-xl">
                    <div class="text-gray-400 text-xs uppercase tracking-widest font-bold">Total Revenue (MTD)</div>
                    <div class="text-3xl font-bold text-white mt-2">$402,120</div>
                    <div class="text-green-400 text-xs mt-1">↑ 12% vs last month</div>
                </div>
                <div class="glass-panel p-6 rounded-xl">
                    <div class="text-gray-400 text-xs uppercase tracking-widest font-bold">Driver Payroll Pending</div>
                    <div class="text-3xl font-bold text-white mt-2">$34,500</div>
                    <div class="text-yellow-400 text-xs mt-1">Due in 3 days</div>
                </div>
                <div class="glass-panel p-6 rounded-xl">
                    <div class="text-gray-400 text-xs uppercase tracking-widest font-bold">COD Collected</div>
                    <div class="text-3xl font-bold text-white mt-2">$12,850</div>
                    <div class="text-blue-400 text-xs mt-1">Reconciliation needed</div>
                </div>
            </div>

            <!-- Right Action Panel -->
            <div class="glass-panel p-6 rounded-xl flex flex-col gap-3">
                <button
                    class="w-full py-2 bg-primary hover:bg-primary-dark text-background-dark font-bold rounded-lg transition-colors">Process
                    Payroll</button>
                <button
                    class="w-full py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors">Reconcile
                    COD</button>
                <button
                    class="w-full py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors">Download
                    Reports</button>
            </div>
        </div>

        <!-- Transaction Table -->
        <div class="glass-panel rounded-xl overflow-hidden">
            <div class="p-6 border-b border-white/5 font-bold text-white">Recent Transactions</div>
            <table class="w-full text-left text-sm">
                <thead>
                    <tr class="text-gray-500">
                        <th class="p-4">Transaction ID</th>
                        <th class="p-4">Date</th>
                        <th class="p-4">Description</th>
                        <th class="p-4">Type</th>
                        <th class="p-4">Amount</th>
                        <th class="p-4">Status</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-white/5">
                    <tr v-for="tx in transactions" :key="tx.id" class="hover:bg-white/5 transition-colors">
                        <td class="p-4 font-mono text-gray-300">{{ tx.id }}</td>
                        <td class="p-4 text-gray-400">{{ tx.date }}</td>
                        <td class="p-4 text-white">{{ tx.desc }}</td>
                        <td class="p-4 text-gray-400">{{ tx.type }}</td>
                        <td class="p-4 font-bold" :class="tx.amount > 0 ? 'text-green-400' : 'text-red-400'">{{
                            tx.amount > 0 ? '+' : '' }}{{ tx.amount }}</td>
                        <td class="p-4"><span
                                class="px-2 py-1 rounded bg-green-500/10 text-green-500 text-xs">Completed</span></td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'

const transactions = ref([
    { id: 'TX-99212', date: 'Oct 24, 2023', desc: 'Client Payment - Amazon', type: 'Incoming', amount: 15400 },
    { id: 'TX-99213', date: 'Oct 24, 2023', desc: 'Fuel Expense - Shell', type: 'Expense', amount: -2400 },
    { id: 'TX-99214', date: 'Oct 23, 2023', desc: 'Driver Payout - Weekly', type: 'Payroll', amount: -6500 },
    { id: 'TX-99215', date: 'Oct 23, 2023', desc: 'COD Deposit - Zone A', type: 'Incoming', amount: 1250 },
])
</script>
