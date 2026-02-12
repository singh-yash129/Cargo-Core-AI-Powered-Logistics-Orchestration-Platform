<template>
    <div class="h-[calc(100vh-8rem)] flex flex-col md:flex-row gap-6">
        <!-- Quick Links -->
        <div class="w-full md:w-72 space-y-6">
            <div class="glass-panel p-6 rounded-xl flex flex-col items-center text-center">
                <div class="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 mb-4">
                    <span class="material-symbols-outlined text-3xl">phone_in_talk</span>
                </div>
                <h3 class="font-bold text-white">Priority Support</h3>
                <p class="text-xs text-gray-400 mb-4">Dedicated line for enterprise partners.</p>
                <div class="text-lg font-bold text-white">+1 (888) 999-0000</div>
            </div>

            <div class="glass-panel p-6 rounded-xl">
                <h3 class="font-bold text-white mb-4">FAQ</h3>
                <ul class="space-y-3 text-sm text-gray-400">
                    <li class="hover:text-blue-400 cursor-pointer flex gap-2"><span
                            class="material-symbols-outlined text-xs">chevron_right</span> How to bulk upload?</li>
                    <li class="hover:text-blue-400 cursor-pointer flex gap-2"><span
                            class="material-symbols-outlined text-xs">chevron_right</span> Invoice cycles</li>
                    <li class="hover:text-blue-400 cursor-pointer flex gap-2"><span
                            class="material-symbols-outlined text-xs">chevron_right</span> API Integration</li>
                </ul>
            </div>
        </div>

        <!-- Ticket System -->
        <div class="flex-1 glass-panel rounded-xl overflow-hidden flex flex-col">
            <div class="p-6 border-b border-white/5 flex justify-between items-center">
                <h3 class="font-bold text-white">Support Tickets</h3>
                <button
                    class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors">Create
                    Ticket</button>
            </div>

            <table class="w-full text-left text-sm">
                <thead class="bg-white/5 text-gray-400 uppercase">
                    <tr>
                        <th class="p-4">Ticket ID</th>
                        <th class="p-4">Subject</th>
                        <th class="p-4">Created</th>
                        <th class="p-4">Priority</th>
                        <th class="p-4">Status</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-white/5">
                    <tr class="hover:bg-white/5 transition-colors cursor-pointer">
                        <td class="p-4 font-mono text-blue-400">#TK-1029</td>
                        <td class="p-4 text-white">Integration Error with SAP</td>
                        <td class="p-4 text-gray-400">2 hours ago</td>
                        <td class="p-4"><span class="text-red-400 font-bold text-xs uppercase">High</span></td>
                        <td class="p-4">
                            <span
                                class="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded border border-yellow-500/20">In
                                Progress</span>
                        </td>
                    </tr>
                    <tr class="hover:bg-white/5 transition-colors cursor-pointer">
                        <td class="p-4 font-mono text-blue-400">#TK-0992</td>
                        <td class="p-4 text-white">Shipment Delay Inquiry</td>
                        <td class="p-4 text-gray-400">Yesterday</td>
                        <td class="p-4"><span class="text-yellow-400 font-bold text-xs uppercase">Medium</span></td>
                        <td class="p-4">
                            <span
                                class="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded border border-green-500/20">Resolved</span>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script setup>
</script>
