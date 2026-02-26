<template>
    <div class="space-y-6">
        <h2 class="text-2xl font-bold text-white">Loading Dock Management</h2>

        <!-- Dwell Time Overview -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="glass-panel p-4 rounded-xl border-l-4 border-blue-500">
                <div class="text-xs text-gray-400 uppercase font-semibold">Avg. Dwell Time</div>
                <div class="text-3xl font-bold text-blue-400 mt-1">{{ avgDwell }} min</div>
                <div class="text-xs text-yellow-400 mt-1">↑ 5 min from yesterday</div>
            </div>
            <div class="glass-panel p-4 rounded-xl border-l-4 border-green-500">
                <div class="text-xs text-gray-400 uppercase font-semibold">Trucks Loaded Today</div>
                <div class="text-3xl font-bold text-green-400 mt-1">{{ trucksLoaded }}</div>
                <div class="text-xs text-gray-500 mt-1">Target: 12</div>
            </div>
            <div class="glass-panel p-4 rounded-xl border-l-4 border-yellow-500">
                <div class="text-xs text-gray-400 uppercase font-semibold">Loading Delays</div>
                <div class="text-3xl font-bold text-yellow-400 mt-1">{{docks.filter(d => d.dwellMinutes > 45).length}}
                </div>
                <div class="text-xs text-gray-500 mt-1">Internal cause</div>
            </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <!-- Dock Status Cards -->
            <div v-for="dock in docks" :key="dock.id" class="glass-panel p-6 rounded-xl relative overflow-hidden group">
                <div class="absolute inset-x-0 bottom-0 h-1" :class="dock.statusClass"></div>
                <div class="flex justify-between items-start mb-4">
                    <div class="text-xl font-bold text-white">Dock {{ dock.id }}</div>
                    <span class="px-2 py-1 rounded text-[10px] uppercase font-bold text-black"
                        :class="dock.badgeClass">{{ dock.status }}</span>
                </div>

                <div class="space-y-2 mb-4">
                    <div class="flex justify-between text-sm">
                        <span class="text-gray-400">Truck:</span>
                        <span class="text-white font-mono">{{ dock.truck || '--' }}</span>
                    </div>
                    <div class="flex justify-between text-sm">
                        <span class="text-gray-400">Carrier:</span>
                        <span class="text-white">{{ dock.carrier || '--' }}</span>
                    </div>
                    <div class="flex justify-between text-sm">
                        <span class="text-gray-400">Progress:</span>
                        <span class="text-white font-bold">{{ dock.progress }}%</span>
                    </div>
                </div>

                <!-- Dwell Time Tracking -->
                <div v-if="dock.status === 'Occupied'" class="mb-4 p-3 bg-white/5 rounded-lg border border-white/5">
                    <div class="text-[10px] text-gray-400 uppercase font-bold mb-2">Dwell Time</div>
                    <div class="grid grid-cols-2 gap-2 text-xs">
                        <div>
                            <div class="text-gray-500">Arrived</div>
                            <div class="text-white font-mono">{{ dock.arrivedAt }}</div>
                        </div>
                        <div>
                            <div class="text-gray-500">Loading Since</div>
                            <div class="text-white font-mono">{{ dock.loadingSince }}</div>
                        </div>
                        <div>
                            <div class="text-gray-500">Elapsed</div>
                            <div class="font-mono font-bold"
                                :class="dock.dwellMinutes > 45 ? 'text-red-400' : dock.dwellMinutes > 30 ? 'text-yellow-400' : 'text-green-400'">
                                {{ dock.dwellMinutes }} min</div>
                        </div>
                        <div>
                            <div class="text-gray-500">Efficiency</div>
                            <div class="text-primary font-bold">{{ dock.efficiency }}</div>
                        </div>
                    </div>
                </div>

                <div v-if="dock.status === 'Occupied'"
                    class="w-full bg-gray-700 h-1.5 rounded-full overflow-hidden mb-4">
                    <div class="bg-blue-500 h-full animate-pulse" :style="`width: ${dock.progress}%`"></div>
                </div>

                <div class="flex gap-2">
                    <button v-if="dock.status === 'Occupied'" @click="openVerifyModal(dock)"
                        class="flex-1 bg-green-500/20 hover:bg-green-500/30 text-green-400 py-2 rounded text-xs font-bold transition-colors">
                        Verify & Release
                    </button>
                    <button v-if="dock.status === 'Free'" @click="openAssignModal(dock)"
                        class="flex-1 bg-white/10 hover:bg-white/20 text-white py-2 rounded text-xs font-bold transition-colors">Assign
                        Truck</button>
                    <button v-if="dock.status === 'Maintenance'" @click="clearMaintenance(dock)"
                        class="flex-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 py-2 rounded text-xs font-bold transition-colors">Clear
                        Maintenance</button>
                    <button @click="openSettingsModal(dock)"
                        class="px-3 py-2 bg-white/5 hover:bg-white/10 rounded text-gray-400 hover:text-white transition-colors"><span
                            class="material-symbols-outlined text-sm">settings</span></button>
                </div>
            </div>
        </div>

        <!-- Assign Truck Modal -->
        <div v-if="showAssignModal && assignDock"
            class="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            @click.self="showAssignModal = false">
            <div class="glass-panel rounded-2xl w-full max-w-md border border-white/10">
                <div class="p-6 border-b border-white/5 flex justify-between items-center">
                    <h3 class="font-bold text-white text-lg">Assign Truck to Dock {{ assignDock.id }}</h3>
                    <button @click="showAssignModal = false" class="text-gray-500 hover:text-white"><span
                            class="material-symbols-outlined">close</span></button>
                </div>
                <div class="p-6 space-y-4">
                    <div>
                        <label class="text-xs text-gray-400 mb-1 block">Truck ID</label>
                        <input type="text" v-model="assignForm.truck" placeholder="TRK-XXXX"
                            class="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-primary/50 font-mono" />
                    </div>
                    <div>
                        <label class="text-xs text-gray-400 mb-1 block">Carrier</label>
                        <select v-model="assignForm.carrier"
                            class="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-primary/50">
                            <option>UPS Freight</option>
                            <option>FedEx Ground</option>
                            <option>DHL Express</option>
                            <option>Internal Fleet</option>
                        </select>
                    </div>
                    <button @click="confirmAssign" :disabled="!assignForm.truck"
                        class="w-full bg-primary hover:bg-primary-dark text-background-dark font-bold py-3 rounded-lg transition-colors">Assign
                        to Dock</button>
                </div>
            </div>
        </div>

        <!-- Settings Modal -->
        <div v-if="showSettingsModal && settingsDock"
            class="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            @click.self="showSettingsModal = false">
            <div class="glass-panel rounded-2xl w-full max-w-md border border-white/10">
                <div class="p-6 border-b border-white/5 flex justify-between items-center">
                    <h3 class="font-bold text-white text-lg">Dock {{ settingsDock.id }} Settings</h3>
                    <button @click="showSettingsModal = false" class="text-gray-500 hover:text-white"><span
                            class="material-symbols-outlined">close</span></button>
                </div>
                <div class="p-6 space-y-4">
                    <div>
                        <label class="text-xs text-gray-400 mb-1 block">Dock Status</label>
                        <select v-model="settingsForm.status"
                            class="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-primary/50">
                            <option>Free</option>
                            <option>Maintenance</option>
                        </select>
                    </div>
                    <div class="p-3 bg-white/5 rounded-lg border border-white/5 text-xs text-gray-400">
                        <div>Current Status: <span class="text-white font-bold">{{ settingsDock.status }}</span></div>
                        <div>Truck: <span class="text-white">{{ settingsDock.truck || 'None' }}</span></div>
                    </div>
                    <button @click="saveSettings"
                        class="w-full bg-primary hover:bg-primary-dark text-background-dark font-bold py-3 rounded-lg transition-colors">Save
                        Settings</button>
                </div>
            </div>
        </div>

        <!-- Crew & Manifest Verification Modal -->
        <div v-if="showVerifyModal && verifyDock"
            class="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            @click.self="showVerifyModal = false">
            <div class="glass-panel rounded-2xl w-full max-w-lg border border-white/10">
                <div class="p-6 border-b border-white/5 flex justify-between items-center">
                    <h3 class="font-bold text-white text-lg">Dock {{ verifyDock.id }} — Pre-Departure Verification</h3>
                    <button @click="showVerifyModal = false" class="text-gray-500 hover:text-white"><span
                            class="material-symbols-outlined">close</span></button>
                </div>
                <div class="p-6 space-y-4">
                    <div class="text-xs text-gray-400 uppercase font-bold mb-2">Manifest Check</div>
                    <div class="space-y-2">
                        <div v-for="item in verifyChecklist" :key="item.label"
                            class="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors"
                            :class="item.checked ? 'bg-green-500/10 border border-green-500/20' : 'bg-white/5 border border-white/5 hover:border-white/20'"
                            @click="item.checked = !item.checked">
                            <span class="material-symbols-outlined text-[18px]"
                                :class="item.checked ? 'text-green-400' : 'text-gray-600'">
                                {{ item.checked ? 'check_circle' : 'radio_button_unchecked' }}
                            </span>
                            <span class="text-sm" :class="item.checked ? 'text-white' : 'text-gray-400'">{{ item.label
                                }}</span>
                        </div>
                    </div>
                    <div
                        class="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-xs text-yellow-400 flex items-center gap-2">
                        <span class="material-symbols-outlined text-[16px]">warning</span>
                        Driver must confirm receipt before departure
                    </div>
                    <div class="flex gap-3">
                        <button @click="completeDock" :disabled="!allChecked"
                            class="flex-1 py-3 rounded-lg font-bold transition-colors"
                            :class="allChecked ? 'bg-green-500/20 hover:bg-green-500/30 text-green-400' : 'bg-gray-700 text-gray-500 cursor-not-allowed'">
                            <span class="material-symbols-outlined text-[18px] align-middle mr-1">check_circle</span>
                            Confirm & Release Truck
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Truck Detail Modal -->
        <div v-if="showTruckDetail && selectedTruck"
            class="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            @click.self="showTruckDetail = false">
            <div class="glass-panel rounded-2xl w-full max-w-md border border-white/10">
                <div class="p-6 border-b border-white/5 flex justify-between items-center">
                    <h3 class="font-bold text-white text-lg">Incoming Truck Details</h3>
                    <button @click="showTruckDetail = false" class="text-gray-500 hover:text-white"><span
                            class="material-symbols-outlined">close</span></button>
                </div>
                <div class="p-6 space-y-3">
                    <div class="grid grid-cols-2 gap-3">
                        <div class="bg-white/5 p-3 rounded-lg">
                            <div class="text-xs text-gray-400">Carrier</div>
                            <div class="text-white font-bold">{{ selectedTruck.carrier }}</div>
                        </div>
                        <div class="bg-white/5 p-3 rounded-lg">
                            <div class="text-xs text-gray-400">Truck ID</div>
                            <div class="text-white font-bold font-mono">{{ selectedTruck.truckId }}</div>
                        </div>
                        <div class="bg-white/5 p-3 rounded-lg">
                            <div class="text-xs text-gray-400">ETA</div>
                            <div class="text-white font-bold">{{ selectedTruck.eta }}</div>
                        </div>
                        <div class="bg-white/5 p-3 rounded-lg">
                            <div class="text-xs text-gray-400">Pallets</div>
                            <div class="text-white font-bold">{{ selectedTruck.pallets }}</div>
                        </div>
                        <div v-if="selectedTruck.type" class="bg-white/5 p-3 rounded-lg">
                            <div class="text-xs text-gray-400">Type</div>
                            <div class="text-white font-bold">{{ selectedTruck.type }}</div>
                        </div>
                        <div v-if="selectedTruck.destination" class="bg-white/5 p-3 rounded-lg">
                            <div class="text-xs text-gray-400">Destination</div>
                            <div class="text-white font-bold">{{ selectedTruck.destination }}</div>
                        </div>
                    </div>
                    <button @click="showTruckDetail = false"
                        class="w-full bg-white/5 hover:bg-white/10 text-white py-2 rounded-lg text-sm transition-colors">Close</button>
                </div>
            </div>
        </div>

        <!-- Incoming Trucks Queue -->
        <div class="glass-panel rounded-xl overflow-hidden p-6">
            <h3 class="font-bold text-white mb-4">Incoming Trucks Queue</h3>
            <div class="space-y-3">
                <div v-for="truck in incomingTrucks" :key="truck.truckId"
                    class="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                    <div class="flex items-center gap-4">
                        <div
                            class="w-12 h-12 bg-gray-700 rounded flex items-center justify-center text-white font-bold text-xs flex-col">
                            <span>{{ truck.eta }}</span>
                            <span class="text-[8px] text-gray-400">ETA</span>
                        </div>
                        <div>
                            <div class="text-white font-bold">{{ truck.carrier }}</div>
                            <div class="text-xs text-gray-400">{{ truck.truckId }} • {{ truck.pallets }} Pallets</div>
                            <div v-if="truck.type" class="text-[10px] mt-0.5"><span class="px-1.5 py-0.5 rounded"
                                    :class="truck.type === 'Inbound' ? 'bg-green-500/20 text-green-400' : truck.type === 'House Shift' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'">{{
                                    truck.type }}</span> <span class="text-gray-500">→ {{ truck.destination }}</span>
                            </div>
                        </div>
                    </div>
                    <button @click="selectedTruck = truck; showTruckDetail = true"
                        class="text-primary hover:underline text-xs">Details</button>
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

const showVerifyModal = ref(false)
const showAssignModal = ref(false)
const showSettingsModal = ref(false)
const showTruckDetail = ref(false)
const verifyDock = ref(null)
const assignDock = ref(null)
const settingsDock = ref(null)
const selectedTruck = ref(null)
const toastMsg = ref('')
const trucksLoaded = ref(8)

const assignForm = reactive({ truck: '', carrier: 'UPS Freight' })
const settingsForm = reactive({ status: 'Free' })

const docks = ref([
    { id: '1', status: 'Occupied', truck: 'TRK-5541', carrier: 'UPS Freight', progress: 78, statusClass: 'bg-yellow-500', badgeClass: 'bg-yellow-500', arrivedAt: '10:15 AM', loadingSince: '10:32 AM', dwellMinutes: 42, efficiency: 'Normal' },
    { id: '2', status: 'Free', truck: null, carrier: null, progress: 0, statusClass: 'bg-green-500', badgeClass: 'bg-green-500', arrivedAt: null, loadingSince: null, dwellMinutes: 0, efficiency: '--' },
    { id: '3', status: 'Maintenance', truck: null, carrier: null, progress: 0, statusClass: 'bg-red-500', badgeClass: 'bg-red-500 text-white', arrivedAt: null, loadingSince: null, dwellMinutes: 0, efficiency: '--' },
    { id: '4', status: 'Occupied', truck: 'TRK-9912', carrier: 'Internal Fleet', progress: 30, statusClass: 'bg-blue-500', badgeClass: 'bg-blue-500 text-white', arrivedAt: '11:00 AM', loadingSince: '11:15 AM', dwellMinutes: 18, efficiency: 'Good' },
    { id: '5', status: 'Occupied', truck: 'TRK-7721', carrier: 'FedEx Ground', progress: 95, statusClass: 'bg-yellow-500', badgeClass: 'bg-yellow-500', arrivedAt: '09:00 AM', loadingSince: '09:20 AM', dwellMinutes: 55, efficiency: 'Delayed' },
    { id: '6', status: 'Free', truck: null, carrier: null, progress: 0, statusClass: 'bg-green-500', badgeClass: 'bg-green-500', arrivedAt: null, loadingSince: null, dwellMinutes: 0, efficiency: '--' },
])

const incomingTrucks = ref([
    { carrier: 'FedEx Ground', truckId: 'TRK-9821', eta: '14:00', pallets: 14, type: 'Outbound', destination: 'Hub North' },
    { carrier: 'DHL Express', truckId: 'TRK-1122', eta: '14:30', pallets: 5, type: 'Inbound', destination: 'Receiving Bay' },
    { carrier: 'UPS Freight', truckId: 'TRK-4455', eta: '15:15', pallets: 22, type: 'Outbound', destination: 'Hub South' },
    { carrier: 'Internal Fleet', truckId: 'TRK-0088', eta: '16:00', pallets: 8, type: 'House Shift', destination: 'Warehouse B' },
])

const verifyChecklist = ref([
    { label: 'All items scanned and loaded', checked: false },
    { label: 'Labor physically present on truck', checked: false },
    { label: 'Packing utensils loaded', checked: false },
    { label: 'Manifest document attached', checked: false },
    { label: 'Driver has confirmed receipt', checked: false },
    { label: 'Weight verification passed', checked: false },
])

const allChecked = computed(() => verifyChecklist.value.every(item => item.checked))
const avgDwell = computed(() => {
    const occupied = docks.value.filter(d => d.status === 'Occupied')
    if (!occupied.length) return 0
    return Math.round(occupied.reduce((s, d) => s + d.dwellMinutes, 0) / occupied.length)
})

function showToast(msg) {
    toastMsg.value = msg
    setTimeout(() => { toastMsg.value = '' }, 2500)
}

function openVerifyModal(dock) {
    verifyDock.value = dock
    verifyChecklist.value.forEach(item => item.checked = false)
    showVerifyModal.value = true
}

function completeDock() {
    if (verifyDock.value) {
        verifyDock.value.status = 'Free'
        verifyDock.value.truck = null
        verifyDock.value.carrier = null
        verifyDock.value.progress = 0
        verifyDock.value.statusClass = 'bg-green-500'
        verifyDock.value.badgeClass = 'bg-green-500'
        verifyDock.value.dwellMinutes = 0
        trucksLoaded.value++
    }
    showVerifyModal.value = false
    showToast(`Dock ${verifyDock.value?.id} — Truck released!`)
}

function openAssignModal(dock) {
    assignDock.value = dock
    assignForm.truck = ''
    assignForm.carrier = 'UPS Freight'
    showAssignModal.value = true
}

function confirmAssign() {
    if (assignDock.value) {
        const now = new Date()
        const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
        assignDock.value.status = 'Occupied'
        assignDock.value.truck = assignForm.truck
        assignDock.value.carrier = assignForm.carrier
        assignDock.value.progress = 0
        assignDock.value.statusClass = 'bg-yellow-500'
        assignDock.value.badgeClass = 'bg-yellow-500'
        assignDock.value.arrivedAt = timeStr
        assignDock.value.loadingSince = timeStr
        assignDock.value.dwellMinutes = 0
        assignDock.value.efficiency = 'Just Started'
    }
    showAssignModal.value = false
    showToast(`${assignForm.truck} assigned to Dock ${assignDock.value?.id}`)
}

function openSettingsModal(dock) {
    settingsDock.value = dock
    settingsForm.status = dock.status === 'Occupied' ? 'Free' : dock.status
    showSettingsModal.value = true
}

function saveSettings() {
    if (settingsDock.value && settingsDock.value.status !== 'Occupied') {
        settingsDock.value.status = settingsForm.status
        settingsDock.value.statusClass = settingsForm.status === 'Maintenance' ? 'bg-red-500' : 'bg-green-500'
        settingsDock.value.badgeClass = settingsForm.status === 'Maintenance' ? 'bg-red-500 text-white' : 'bg-green-500'
    }
    showSettingsModal.value = false
    showToast(`Dock ${settingsDock.value?.id} settings updated`)
}

function clearMaintenance(dock) {
    dock.status = 'Free'
    dock.statusClass = 'bg-green-500'
    dock.badgeClass = 'bg-green-500'
    showToast(`Dock ${dock.id} — maintenance cleared`)
}
</script>
