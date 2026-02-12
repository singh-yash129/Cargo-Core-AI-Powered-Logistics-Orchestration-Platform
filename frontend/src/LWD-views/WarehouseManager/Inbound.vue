<template>
    <div class="space-y-6">
        <div class="flex justify-between items-center">
            <h2 class="text-2xl font-bold text-white">Inbound Shipments</h2>
            <button
                class="bg-primary hover:bg-primary-dark text-background-dark font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors">
                <span class="material-symbols-outlined">calendar_today</span> Schedule Delivery
            </button>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Dock Schedule -->
            <div class="glass-panel p-6 rounded-xl">
                <h3 class="font-bold text-white mb-4">Dock Schedule (Today)</h3>
                <div class="space-y-3">
                    <div
                        class="p-3 bg-white/5 border border-white/5 hover:border-white/20 rounded-lg cursor-pointer transition-all">
                        <div class="flex justify-between mb-1">
                            <span class="text-primary font-bold">08:00 - 09:30</span>
                            <span class="text-xs bg-green-500/20 text-green-400 px-1 rounded">On Time</span>
                        </div>
                        <div class="text-white text-sm">Supplier: Samsung Electronics</div>
                        <div class="text-xs text-gray-400">Dock 4 • 24 Pallets</div>
                    </div>
                    <div
                        class="p-3 bg-white/5 border border-white/5 hover:border-white/20 rounded-lg cursor-pointer transition-all">
                        <div class="flex justify-between mb-1">
                            <span class="text-white font-bold">10:00 - 11:30</span>
                            <span class="text-xs bg-yellow-500/20 text-yellow-500 px-1 rounded">Delayed</span>
                        </div>
                        <div class="text-white text-sm">Supplier: Nike Global</div>
                        <div class="text-xs text-gray-400">Dock 2 • 12 Pallets</div>
                    </div>
                    <div
                        class="p-3 bg-white/5 border border-white/5 hover:border-white/20 rounded-lg cursor-pointer transition-all opacity-50">
                        <div class="flex justify-between mb-1">
                            <span class="text-gray-400 font-bold">13:00 - 14:00</span>
                            <span class="text-xs bg-gray-500/20 text-gray-400 px-1 rounded">Scheduled</span>
                        </div>
                        <div class="text-white text-sm">Supplier: IKEA</div>
                        <div class="text-xs text-gray-400">Dock 1 • 40 Pallets</div>
                    </div>
                </div>
            </div>

            <!-- Pending Receipt -->
            <div class="lg:col-span-2 glass-panel rounded-xl overflow-hidden">
                <div class="p-6 border-b border-white/5 font-bold text-white">Pending Receipt</div>
                <table class="w-full text-left text-sm">
                    <thead class="bg-white/5 text-gray-400 uppercase">
                        <tr>
                            <th class="p-4">ASN ID</th>
                            <th class="p-4">Supplier</th>
                            <th class="p-4">Items</th>
                            <th class="p-4">ETA</th>
                            <th class="p-4">Status</th>
                            <th class="p-4">Action</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-white/5">
                        <tr v-for="asn in asns" :key="asn.id" class="hover:bg-white/5 transition-colors">
                            <td class="p-4 font-mono text-gray-300">{{ asn.id }}</td>
                            <td class="p-4 text-white">{{ asn.supplier }}</td>
                            <td class="p-4 text-gray-400">{{ asn.items }}</td>
                            <td class="p-4 text-gray-300">{{ asn.eta }}</td>
                            <td class="p-4">
                                <span class="px-2 py-1 rounded text-[10px] font-bold border" :class="asn.statusClass">
                                    {{ asn.status }}
                                </span>
                            </td>
                            <td class="p-4">
                                <button
                                    class="bg-primary/20 hover:bg-primary/30 text-primary px-3 py-1 rounded text-xs font-bold transition-colors">Start
                                    Receiving</button>
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

const asns = ref([
    { id: 'ASN-0092', supplier: 'Samsung Electronics', items: 1200, eta: '08:15 AM', status: 'Arrived', statusClass: 'bg-green-500/10 text-green-500 border-green-500/20' },
    { id: 'ASN-0093', supplier: 'Nike Global', items: 450, eta: '10:45 AM', status: 'In Transit', statusClass: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
    { id: 'ASN-0094', supplier: 'Sony Corp', items: 800, eta: 'Tomorrow', status: 'Scheduled', statusClass: 'bg-gray-500/10 text-gray-500 border-gray-500/20' },
])
</script>
