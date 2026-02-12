<template>
    <div class="space-y-6">
        <h2 class="text-2xl font-bold text-white">Payments & Wallet</h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Wallet Card -->
            <div
                class="glass-panel p-6 rounded-xl bg-gradient-to-br from-blue-900/40 to-black relative overflow-hidden">
                <div class="absolute right-0 top-0 p-6 opacity-10"><span
                        class="material-symbols-outlined text-8xl">account_balance_wallet</span></div>
                <div class="relative z-10">
                    <div class="text-gray-400 mb-1">Total Credits</div>
                    <div class="text-4xl font-bold text-white mb-6">$150.00</div>

                    <div class="flex gap-4">
                        <button
                            class="flex-1 bg-white/10 hover:bg-white/20 py-2 rounded-lg text-white font-bold transition-colors">+
                            Add Funds</button>
                        <button
                            class="flex-1 bg-white/10 hover:bg-white/20 py-2 rounded-lg text-white font-bold transition-colors">Gift
                            Card</button>
                    </div>
                </div>
            </div>

            <!-- Payment Methods -->
            <div class="glass-panel p-6 rounded-xl">
                <h3 class="font-bold text-white mb-4">Saved Cards</h3>
                <div class="space-y-3">
                    <div class="flex items-center justify-between p-3 border border-white/10 rounded-lg bg-white/5">
                        <div class="flex items-center gap-3">
                            <span class="material-symbols-outlined text-white">credit_card</span>
                            <div>
                                <div class="text-white text-sm font-bold">ViSA •••• 4242</div>
                                <div class="text-xs text-gray-400">Expires 12/26</div>
                            </div>
                        </div>
                        <button class="text-gray-400 hover:text-white"><span
                                class="material-symbols-outlined">delete</span></button>
                    </div>
                    <div class="flex items-center justify-between p-3 border border-white/10 rounded-lg bg-white/5">
                        <div class="flex items-center gap-3">
                            <span class="material-symbols-outlined text-white">credit_card</span>
                            <div>
                                <div class="text-white text-sm font-bold">MasterCard •••• 8821</div>
                                <div class="text-xs text-gray-400">Expires 09/25</div>
                            </div>
                        </div>
                        <button class="text-gray-400 hover:text-white"><span
                                class="material-symbols-outlined">delete</span></button>
                    </div>
                    <button
                        class="w-full py-2 border border-dashed border-white/20 text-gray-400 rounded-lg hover:text-white hover:border-white/40 transition-colors text-sm">+
                        Add New Card</button>
                </div>
            </div>
        </div>

        <!-- Transaction History -->
        <div class="glass-panel rounded-xl overflow-hidden overflow-x-auto">
            <div class="p-6 border-b border-white/5 min-w-[600px]">
                <h3 class="font-bold text-white">Recent Transactions</h3>
            </div>
            <table class="w-full text-left text-sm min-w-[600px]">
                <thead class="bg-white/5 text-gray-400 uppercase">
                    <tr>
                        <th class="p-4">Date</th>
                        <th class="p-4">Description</th>
                        <th class="p-4">Amount</th>
                        <th class="p-4">Status</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-white/5">
                    <tr class="hover:bg-white/5 transition-colors">
                        <td class="p-4 text-gray-400">Oct 24, 2024</td>
                        <td class="p-4 text-white">Order #MV-8821 Payment</td>
                        <td class="p-4 text-white font-bold">-$150.00</td>
                        <td class="p-4 text-green-400">Success</td>
                    </tr>
                    <tr class="hover:bg-white/5 transition-colors">
                        <td class="p-4 text-gray-400">Oct 01, 2024</td>
                        <td class="p-4 text-white">Wallet Top-up</td>
                        <td class="p-4 text-green-400 font-bold">+$50.00</td>
                        <td class="p-4 text-green-400">Success</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script setup>
</script>
