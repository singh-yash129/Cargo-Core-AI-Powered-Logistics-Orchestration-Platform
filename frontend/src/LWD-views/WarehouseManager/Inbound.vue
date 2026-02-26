<template>
    <div class="space-y-6">
        <div class="flex justify-between items-center">
            <h2 class="text-2xl font-bold text-white">Inbound Shipments</h2>
            <button
                class="bg-primary hover:bg-primary-dark text-background-dark font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors">
                <span class="material-symbols-outlined">calendar_today</span> Schedule Delivery
            </button>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="glass-panel p-4 rounded-xl text-center">
                <div class="text-2xl font-bold text-green-400">3</div>
                <div class="text-xs text-gray-400">Arrived Today</div>
            </div>
            <div class="glass-panel p-4 rounded-xl text-center">
                <div class="text-2xl font-bold text-blue-400">2</div>
                <div class="text-xs text-gray-400">In Transit</div>
            </div>
            <div class="glass-panel p-4 rounded-xl text-center">
                <div class="text-2xl font-bold text-red-400">{{ mismatchCount }}</div>
                <div class="text-xs text-gray-400">Mismatches Found</div>
            </div>
            <div class="glass-panel p-4 rounded-xl text-center">
                <div class="text-2xl font-bold text-yellow-400">{{ damageCount }}</div>
                <div class="text-xs text-gray-400">Damage Reports</div>
            </div>
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

            <!-- Pending Receipt with Mismatch & Damage -->
            <div class="lg:col-span-2 glass-panel rounded-xl overflow-hidden">
                <div class="p-6 border-b border-white/5 font-bold text-white flex justify-between items-center">
                    <span>ASN Verification & Receiving</span>
                    <div class="flex gap-2">
                        <button @click="showMismatchModal = true"
                            class="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-3 py-1 rounded text-xs font-bold transition-colors flex items-center gap-1">
                            <span class="material-symbols-outlined text-[14px]">flag</span> Flag Mismatch
                        </button>
                        <button @click="showDamageModal = true"
                            class="bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 px-3 py-1 rounded text-xs font-bold transition-colors flex items-center gap-1">
                            <span class="material-symbols-outlined text-[14px]">broken_image</span> Report Damage
                        </button>
                    </div>
                </div>
                <table class="w-full text-left text-sm">
                    <thead class="bg-white/5 text-gray-400 uppercase">
                        <tr>
                            <th class="p-4">ASN ID</th>
                            <th class="p-4">Supplier</th>
                            <th class="p-4">Expected</th>
                            <th class="p-4">Received</th>
                            <th class="p-4">ETA</th>
                            <th class="p-4">Status</th>
                            <th class="p-4">Issues</th>
                            <th class="p-4">Action</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-white/5">
                        <tr v-for="asn in asns" :key="asn.id" class="hover:bg-white/5 transition-colors">
                            <td class="p-4 font-mono text-gray-300">{{ asn.id }}</td>
                            <td class="p-4 text-white">{{ asn.supplier }}</td>
                            <td class="p-4 text-gray-400">{{ asn.expected }}</td>
                            <td class="p-4">
                                <span
                                    :class="asn.received !== asn.expected && asn.received > 0 ? 'text-red-400 font-bold' : 'text-gray-300'">{{
                                    asn.received || '--' }}</span>
                            </td>
                            <td class="p-4 text-gray-300">{{ asn.eta }}</td>
                            <td class="p-4">
                                <span class="px-2 py-1 rounded text-[10px] font-bold border" :class="asn.statusClass">
                                    {{ asn.status }}
                                </span>
                            </td>
                            <td class="p-4">
                                <div class="flex gap-1">
                                    <span v-if="asn.mismatch"
                                        class="px-1.5 py-0.5 bg-red-500/20 text-red-400 text-[9px] font-bold rounded border border-red-500/20">MISMATCH</span>
                                    <span v-if="asn.damaged"
                                        class="px-1.5 py-0.5 bg-yellow-500/20 text-yellow-400 text-[9px] font-bold rounded border border-yellow-500/20">DAMAGED</span>
                                    <span v-if="!asn.mismatch && !asn.damaged" class="text-gray-600 text-xs">—</span>
                                </div>
                            </td>
                            <td class="p-4">
                                <div class="flex gap-1">
                                    <button v-if="asn.status === 'Arrived'"
                                        class="bg-primary/20 hover:bg-primary/30 text-primary px-3 py-1 rounded text-xs font-bold transition-colors">
                                        Start Receiving
                                    </button>
                                    <button v-if="asn.status === 'Receiving'" @click="completeReceiving(asn)"
                                        class="bg-green-500/20 hover:bg-green-500/30 text-green-400 px-3 py-1 rounded text-xs font-bold transition-colors">
                                        Complete & Update Stock
                                    </button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Mismatch Modal -->
        <div v-if="showMismatchModal"
            class="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            @click.self="showMismatchModal = false">
            <div class="glass-panel rounded-2xl w-full max-w-md border border-white/10">
                <div class="p-6 border-b border-white/5 flex justify-between items-center">
                    <h3 class="font-bold text-white text-lg">Flag ASN Mismatch</h3>
                    <button @click="showMismatchModal = false" class="text-gray-500 hover:text-white"><span
                            class="material-symbols-outlined">close</span></button>
                </div>
                <div class="p-6 space-y-4">
                    <div>
                        <label class="text-xs text-gray-400 mb-1 block">ASN ID</label>
                        <select
                            class="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-primary/50">
                            <option v-for="asn in asns" :key="asn.id" :value="asn.id">{{ asn.id }} — {{ asn.supplier }}
                            </option>
                        </select>
                    </div>
                    <div>
                        <label class="text-xs text-gray-400 mb-1 block">Mismatch Type</label>
                        <select
                            class="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-primary/50">
                            <option>Quantity difference</option>
                            <option>Wrong SKU received</option>
                            <option>Missing items</option>
                            <option>Extra items</option>
                        </select>
                    </div>
                    <div>
                        <label class="text-xs text-gray-400 mb-1 block">Details</label>
                        <textarea placeholder="Describe the mismatch..."
                            class="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-primary/50 text-sm h-20 resize-none"></textarea>
                    </div>
                    <div class="text-xs text-gray-500 flex items-center gap-1">
                        <span class="material-symbols-outlined text-[14px]">info</span>
                        Mismatch will be logged and visible to Logistics Manager
                    </div>
                    <button @click="showMismatchModal = false"
                        class="w-full bg-red-500/20 hover:bg-red-500/30 text-red-400 font-bold py-3 rounded-lg transition-colors">
                        Submit Mismatch Report
                    </button>
                </div>
            </div>
        </div>

        <!-- Damage Modal -->
        <div v-if="showDamageModal"
            class="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            @click.self="showDamageModal = false">
            <div class="glass-panel rounded-2xl w-full max-w-md border border-white/10">
                <div class="p-6 border-b border-white/5 flex justify-between items-center">
                    <h3 class="font-bold text-white text-lg">Report Shipment Damage</h3>
                    <button @click="showDamageModal = false" class="text-gray-500 hover:text-white"><span
                            class="material-symbols-outlined">close</span></button>
                </div>
                <div class="p-6 space-y-4">
                    <div>
                        <label class="text-xs text-gray-400 mb-1 block">ASN ID</label>
                        <select
                            class="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-primary/50">
                            <option v-for="asn in asns" :key="asn.id" :value="asn.id">{{ asn.id }} — {{ asn.supplier }}
                            </option>
                        </select>
                    </div>
                    <div>
                        <label class="text-xs text-gray-400 mb-1 block">Damaged Items Count</label>
                        <input type="number" placeholder="0"
                            class="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-primary/50" />
                    </div>
                    <div>
                        <label class="text-xs text-gray-400 mb-1 block">Damage Description</label>
                        <textarea placeholder="Describe the damage..."
                            class="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-primary/50 text-sm h-20 resize-none"></textarea>
                    </div>
                    <div
                        class="p-3 bg-white/5 rounded-lg border border-white/5 text-center cursor-pointer hover:border-primary/50 transition-colors">
                        <span class="material-symbols-outlined text-gray-500 text-3xl">photo_camera</span>
                        <div class="text-xs text-gray-500 mt-1">Capture damage photo</div>
                    </div>
                    <button @click="showDamageModal = false"
                        class="w-full bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 font-bold py-3 rounded-lg transition-colors">
                        Submit Damage Report
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const showMismatchModal = ref(false)
const showDamageModal = ref(false)

const asns = ref([
    { id: 'ASN-0092', supplier: 'Samsung Electronics', expected: 1200, received: 1180, eta: '08:15 AM', status: 'Receiving', statusClass: 'bg-blue-500/10 text-blue-500 border-blue-500/20', mismatch: true, damaged: false },
    { id: 'ASN-0093', supplier: 'Nike Global', expected: 450, received: 0, eta: '10:45 AM', status: 'Arrived', statusClass: 'bg-green-500/10 text-green-500 border-green-500/20', mismatch: false, damaged: false },
    { id: 'ASN-0094', supplier: 'Sony Corp', expected: 800, received: 0, eta: 'Tomorrow', status: 'Scheduled', statusClass: 'bg-gray-500/10 text-gray-500 border-gray-500/20', mismatch: false, damaged: false },
    { id: 'ASN-0095', supplier: 'Apple Inc', expected: 500, received: 498, eta: '07:30 AM', status: 'Completed', statusClass: 'bg-green-500/10 text-green-500 border-green-500/20', mismatch: false, damaged: true },
])

const mismatchCount = computed(() => asns.value.filter(a => a.mismatch).length)
const damageCount = computed(() => asns.value.filter(a => a.damaged).length)

function completeReceiving(asn) {
    asn.status = 'Completed'
    asn.statusClass = 'bg-green-500/10 text-green-500 border-green-500/20'
}
</script>
