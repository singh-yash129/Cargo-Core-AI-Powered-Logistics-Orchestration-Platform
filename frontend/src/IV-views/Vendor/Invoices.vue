<template>
    <div class="space-y-6">
        <div class="flex justify-between items-center">
            <h2 class="text-2xl font-bold text-white">Invoices & Billing</h2>
            <div class="flex gap-3">
                <button
                    class="bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-lg font-bold transition-colors">Export
                    Report</button>
                <button
                    class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold transition-colors">Pay
                    All Due</button>
            </div>
        </div>

        <!-- Summary Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="glass-panel p-6 rounded-xl border-l-4 border-red-500">
                <div class="text-gray-400 text-sm mb-1">Overdue Amount</div>
                <div class="text-3xl font-bold text-white">$450.00</div>
                <div class="text-red-400 text-xs mt-1">Due since Oct 20</div>
            </div>
            <div class="glass-panel p-6 rounded-xl border-l-4 border-blue-500">
                <div class="text-gray-400 text-sm mb-1">Unpaid Invoices</div>
                <div class="text-3xl font-bold text-white">3</div>
                <div class="text-blue-400 text-xs mt-1">Total: $1,250.00</div>
            </div>
            <div class="glass-panel p-6 rounded-xl border-l-4 border-green-500">
                <div class="text-gray-400 text-sm mb-1">Paid this Month</div>
                <div class="text-3xl font-bold text-white">$45,200</div>
                <div class="text-green-400 text-xs mt-1">Succesful transactions</div>
            </div>
        </div>

        <!-- Invoices Table -->
        <div class="glass-panel rounded-xl overflow-hidden overflow-x-auto">
            <table class="w-full text-left text-sm min-w-[600px]">
                <thead class="bg-white/5 text-gray-400 uppercase">
                    <tr>
                        <th class="p-4">Invoice #</th>
                        <th class="p-4">Date</th>
                        <th class="p-4">Due Date</th>
                        <th class="p-4">Amount</th>
                        <th class="p-4">Status</th>
                        <th class="p-4">Action</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-white/5">
                    <tr class="hover:bg-white/5 transition-colors">
                        <td class="p-4 font-mono text-white">INV-2024-001</td>
                        <td class="p-4 text-gray-400">Oct 24, 2024</td>
                        <td class="p-4 text-white">Nov 24, 2024</td>
                        <td class="p-4 text-white font-bold">$1,200.00</td>
                        <td class="p-4"><span
                                class="px-2 py-1 rounded bg-blue-500/20 text-blue-400 text-xs font-bold">Unpaid</span>
                        </td>
                        <td class="p-4 text-gray-400 hover:text-white cursor-pointer"><span
                                class="material-symbols-outlined">download</span></td>
                    </tr>
                    <tr class="hover:bg-white/5 transition-colors">
                        <td class="p-4 font-mono text-white">INV-2024-002</td>
                        <td class="p-4 text-gray-400">Oct 20, 2024</td>
                        <td class="p-4 text-white">Oct 20, 2024</td>
                        <td class="p-4 text-white font-bold">$450.00</td>
                        <td class="p-4"><span
                                class="px-2 py-1 rounded bg-red-500/20 text-red-400 text-xs font-bold">Overdue</span>
                        </td>
                        <td class="p-4 text-gray-400 hover:text-white cursor-pointer"><span
                                class="material-symbols-outlined">download</span></td>
                    </tr>
                    <tr class="hover:bg-white/5 transition-colors opacity-75">
                        <td class="p-4 font-mono text-white">INV-2024-003</td>
                        <td class="p-4 text-gray-400">Oct 15, 2024</td>
                        <td class="p-4 text-white">Nov 15, 2024</td>
                        <td class="p-4 text-white font-bold">$3,200.00</td>
                        <td class="p-4"><span
                                class="px-2 py-1 rounded bg-green-500/20 text-green-400 text-xs font-bold">Paid</span>
                        </td>
                        <td class="p-4 text-gray-400 hover:text-white cursor-pointer"><span
                                class="material-symbols-outlined">download</span></td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script setup>
</script>
