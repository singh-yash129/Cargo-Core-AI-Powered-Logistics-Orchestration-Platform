<template>
    <div class="space-y-6">
        <div class="flex justify-between items-center">
            <h2 class="text-2xl font-bold text-white">Inbound Shipments</h2>
            <button @click="showScheduleModal = true"
                class="bg-primary hover:bg-primary-dark text-background-dark font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors">
                <span class="material-symbols-outlined">calendar_today</span> Schedule Delivery
            </button>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="glass-panel p-4 rounded-xl text-center">
                <div class="text-2xl font-bold text-green-400">{{ arrivedCount }}</div>
                <div class="text-xs text-gray-400">Arrived Today</div>
            </div>
            <div class="glass-panel p-4 rounded-xl text-center">
                <div class="text-2xl font-bold text-blue-400">{{ inTransitCount }}</div>
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
                    <div v-for="slot in dockSchedule" :key="slot.id" @click="selectedSlot = slot; showSlotDetail = true"
                        class="p-3 bg-white/5 border border-white/5 hover:border-white/20 rounded-lg cursor-pointer transition-all"
                        :class="slot.status === 'Completed' ? 'opacity-50' : ''">
                        <div class="flex justify-between mb-1">
                            <span :class="slot.status === 'Completed' ? 'text-gray-400' : 'text-primary'"
                                class="font-bold">{{ slot.time }}</span>
                            <span class="text-xs px-1 rounded" :class="slot.statusClass">{{ slot.status }}</span>
                        </div>
                        <div class="text-white text-sm">Supplier: {{ slot.supplier }}</div>
                        <div class="text-xs text-gray-400">{{ slot.dock }} • {{ slot.pallets }} Pallets</div>
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
                                    <button v-if="asn.status === 'Arrived'" @click="startReceiving(asn)"
                                        class="bg-primary/20 hover:bg-primary/30 text-primary px-3 py-1 rounded text-xs font-bold transition-colors">
                                        Start Receiving
                                    </button>
                                    <button v-if="asn.status === 'Receiving'" @click="completeReceiving(asn)"
                                        class="bg-green-500/20 hover:bg-green-500/30 text-green-400 px-3 py-1 rounded text-xs font-bold transition-colors">
                                        Complete & Update Stock
                                    </button>
                                    <span v-if="asn.status === 'Completed'" class="text-green-400 text-xs font-bold">✓
                                        Done</span>
                                    <span v-if="asn.status === 'Scheduled'" class="text-gray-500 text-xs">Awaiting
                                        arrival</span>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Slot Detail Modal -->
        <div v-if="showSlotDetail && selectedSlot"
            class="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            @click.self="showSlotDetail = false">
            <div class="glass-panel rounded-2xl w-full max-w-md border border-white/10">
                <div class="p-6 border-b border-white/5 flex justify-between items-center">
                    <h3 class="font-bold text-white text-lg">Dock Slot Details</h3>
                    <button @click="showSlotDetail = false" class="text-gray-500 hover:text-white"><span
                            class="material-symbols-outlined">close</span></button>
                </div>
                <div class="p-6 space-y-3">
                    <div class="grid grid-cols-2 gap-3">
                        <div class="bg-white/5 p-3 rounded-lg">
                            <div class="text-xs text-gray-400">Supplier</div>
                            <div class="text-white font-bold">{{ selectedSlot.supplier }}</div>
                        </div>
                        <div class="bg-white/5 p-3 rounded-lg">
                            <div class="text-xs text-gray-400">Time</div>
                            <div class="text-white font-bold">{{ selectedSlot.time }}</div>
                        </div>
                        <div class="bg-white/5 p-3 rounded-lg">
                            <div class="text-xs text-gray-400">Dock</div>
                            <div class="text-white font-bold">{{ selectedSlot.dock }}</div>
                        </div>
                        <div class="bg-white/5 p-3 rounded-lg">
                            <div class="text-xs text-gray-400">Pallets</div>
                            <div class="text-white font-bold">{{ selectedSlot.pallets }}</div>
                        </div>
                    </div>
                    <div class="bg-white/5 p-3 rounded-lg">
                        <div class="text-xs text-gray-400">Status</div>
                        <span class="px-2 py-0.5 rounded text-[10px] font-bold" :class="selectedSlot.statusClass">{{
                            selectedSlot.status }}</span>
                    </div>
                </div>
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
                        <select v-model="mismatchForm.asnId"
                            class="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-primary/50">
                            <option v-for="asn in asns" :key="asn.id" :value="asn.id">{{ asn.id }} — {{ asn.supplier }}
                            </option>
                        </select>
                    </div>
                    <div>
                        <label class="text-xs text-gray-400 mb-1 block">Mismatch Type</label>
                        <select v-model="mismatchForm.type"
                            class="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-primary/50">
                            <option>Quantity difference</option>
                            <option>Wrong SKU received</option>
                            <option>Missing items</option>
                            <option>Extra items</option>
                        </select>
                    </div>
                    <div>
                        <label class="text-xs text-gray-400 mb-1 block">Details</label>
                        <textarea v-model="mismatchForm.details" placeholder="Describe the mismatch..."
                            class="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-primary/50 text-sm h-20 resize-none"></textarea>
                    </div>
                    <button @click="submitMismatch" :disabled="!mismatchForm.asnId"
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
                        <select v-model="damageForm.asnId"
                            class="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-primary/50">
                            <option v-for="asn in asns" :key="asn.id" :value="asn.id">{{ asn.id }} — {{ asn.supplier }}
                            </option>
                        </select>
                    </div>
                    <div>
                        <label class="text-xs text-gray-400 mb-1 block">Damaged Items Count</label>
                        <input type="number" v-model.number="damageForm.count" placeholder="0"
                            class="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-primary/50" />
                    </div>
                    <div>
                        <label class="text-xs text-gray-400 mb-1 block">Damage Description</label>
                        <textarea v-model="damageForm.description" placeholder="Describe the damage..."
                            class="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-primary/50 text-sm h-20 resize-none"></textarea>
                    </div>
                    <div @click="damageForm.hasPhoto = !damageForm.hasPhoto"
                        class="p-3 rounded-lg border text-center cursor-pointer transition-colors"
                        :class="damageForm.hasPhoto ? 'bg-green-500/10 border-green-500/20' : 'bg-white/5 border-white/5 hover:border-primary/50'">
                        <span class="material-symbols-outlined text-3xl"
                            :class="damageForm.hasPhoto ? 'text-green-400' : 'text-gray-500'">{{ damageForm.hasPhoto ?
                            'check_circle' : 'photo_camera' }}</span>
                        <div class="text-xs mt-1" :class="damageForm.hasPhoto ? 'text-green-400' : 'text-gray-500'">{{
                            damageForm.hasPhoto ? '📷 Photo captured' : 'Capture damage photo' }}</div>
                    </div>
                    <button @click="submitDamage" :disabled="!damageForm.asnId"
                        class="w-full bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 font-bold py-3 rounded-lg transition-colors">
                        Submit Damage Report
                    </button>
                </div>
            </div>
        </div>

        <!-- Schedule Modal -->
        <div v-if="showScheduleModal"
            class="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            @click.self="showScheduleModal = false">
            <div class="glass-panel rounded-2xl w-full max-w-md border border-white/10">
                <div class="p-6 border-b border-white/5 flex justify-between items-center">
                    <h3 class="font-bold text-white text-lg">Schedule Inbound Delivery</h3>
                    <button @click="showScheduleModal = false" class="text-gray-500 hover:text-white"><span
                            class="material-symbols-outlined">close</span></button>
                </div>
                <div class="p-6 space-y-4">
                    <div>
                        <label class="text-xs text-gray-400 mb-1 block">Supplier Name</label>
                        <input type="text" v-model="scheduleForm.supplier" placeholder="Supplier name"
                            class="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-primary/50" />
                    </div>
                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="text-xs text-gray-400 mb-1 block">Expected Qty</label>
                            <input type="number" v-model.number="scheduleForm.qty"
                                class="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-primary/50" />
                        </div>
                        <div>
                            <label class="text-xs text-gray-400 mb-1 block">ETA</label>
                            <input type="text" v-model="scheduleForm.eta" placeholder="e.g. Tomorrow 10:00"
                                class="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-primary/50" />
                        </div>
                    </div>
                    <button @click="scheduleDelivery" :disabled="!scheduleForm.supplier"
                        class="w-full bg-primary hover:bg-primary-dark text-background-dark font-bold py-3 rounded-lg transition-colors">Schedule
                        Delivery</button>
                </div>
            </div>
        </div>

        <!-- Toast -->
        <div v-if="toastMsg"
            class="fixed bottom-6 right-6 bg-green-500/90 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 z-50 animate-bounce">
            <span class="material-symbols-outlined">check_circle</span>
            <div class="font-bold">{{ toastMsg }}</div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'

const showMismatchModal = ref(false)
const showDamageModal = ref(false)
const showScheduleModal = ref(false)
const showSlotDetail = ref(false)
const selectedSlot = ref(null)
const toastMsg = ref('')

const mismatchForm = reactive({ asnId: '', type: 'Quantity difference', details: '' })
const damageForm = reactive({ asnId: '', count: 0, description: '', hasPhoto: false })
const scheduleForm = reactive({ supplier: '', qty: 0, eta: '' })

const dockSchedule = ref([
    { id: 1, time: '08:00 - 09:30', supplier: 'Samsung Electronics', dock: 'Dock 4', pallets: 24, status: 'On Time', statusClass: 'bg-green-500/20 text-green-400' },
    { id: 2, time: '10:00 - 11:30', supplier: 'Nike Global', dock: 'Dock 2', pallets: 12, status: 'Delayed', statusClass: 'bg-yellow-500/20 text-yellow-500' },
    { id: 3, time: '13:00 - 14:00', supplier: 'IKEA', dock: 'Dock 1', pallets: 40, status: 'Scheduled', statusClass: 'bg-gray-500/20 text-gray-400' },
])

const asns = ref([
    { id: 'ASN-0092', supplier: 'Samsung Electronics', expected: 1200, received: 1180, eta: '08:15 AM', status: 'Receiving', statusClass: 'bg-blue-500/10 text-blue-500 border-blue-500/20', mismatch: true, damaged: false },
    { id: 'ASN-0093', supplier: 'Nike Global', expected: 450, received: 0, eta: '10:45 AM', status: 'Arrived', statusClass: 'bg-green-500/10 text-green-500 border-green-500/20', mismatch: false, damaged: false },
    { id: 'ASN-0094', supplier: 'Sony Corp', expected: 800, received: 0, eta: 'Tomorrow', status: 'Scheduled', statusClass: 'bg-gray-500/10 text-gray-500 border-gray-500/20', mismatch: false, damaged: false },
    { id: 'ASN-0095', supplier: 'Apple Inc', expected: 500, received: 498, eta: '07:30 AM', status: 'Completed', statusClass: 'bg-green-500/10 text-green-500 border-green-500/20', mismatch: false, damaged: true },
])

const arrivedCount = computed(() => asns.value.filter(a => a.status === 'Arrived' || a.status === 'Receiving').length)
const inTransitCount = computed(() => asns.value.filter(a => a.status === 'Scheduled').length)
const mismatchCount = computed(() => asns.value.filter(a => a.mismatch).length)
const damageCount = computed(() => asns.value.filter(a => a.damaged).length)

function showToast(msg) {
    toastMsg.value = msg
    setTimeout(() => { toastMsg.value = '' }, 2500)
}

function startReceiving(asn) {
    asn.status = 'Receiving'
    asn.statusClass = 'bg-blue-500/10 text-blue-500 border-blue-500/20'
    showToast(`Started receiving ${asn.id}`)
}

function completeReceiving(asn) {
    asn.status = 'Completed'
    asn.statusClass = 'bg-green-500/10 text-green-500 border-green-500/20'
    if (!asn.received) asn.received = asn.expected
    showToast(`${asn.id} completed — stock updated`)
}

function submitMismatch() {
    const asn = asns.value.find(a => a.id === mismatchForm.asnId)
    if (asn) asn.mismatch = true
    showMismatchModal.value = false
    mismatchForm.details = ''
    showToast(`Mismatch flagged for ${mismatchForm.asnId}`)
}

function submitDamage() {
    const asn = asns.value.find(a => a.id === damageForm.asnId)
    if (asn) asn.damaged = true
    showDamageModal.value = false
    damageForm.description = ''
    damageForm.count = 0
    damageForm.hasPhoto = false
    showToast(`Damage report submitted for ${damageForm.asnId}`)
}

function scheduleDelivery() {
    asns.value.push({
        id: `ASN-${String(Date.now()).slice(-4)}`,
        supplier: scheduleForm.supplier,
        expected: scheduleForm.qty,
        received: 0,
        eta: scheduleForm.eta,
        status: 'Scheduled',
        statusClass: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
        mismatch: false,
        damaged: false
    })
    showScheduleModal.value = false
    scheduleForm.supplier = ''
    scheduleForm.qty = 0
    scheduleForm.eta = ''
    showToast('Delivery scheduled successfully')
}
</script>
