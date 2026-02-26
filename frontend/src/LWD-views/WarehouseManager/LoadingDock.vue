<template>
    <div class="space-y-6">
        <h2 class="text-2xl font-bold text-white">Loading Dock Management</h2>

        <!-- Dwell Time Overview -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="glass-panel p-4 rounded-xl border-l-4 border-blue-500">
                <div class="text-xs text-gray-400 uppercase font-semibold">Avg. Dwell Time</div>
                <div class="text-3xl font-bold text-blue-400 mt-1">34 min</div>
                <div class="text-xs text-yellow-400 mt-1">↑ 5 min from yesterday</div>
            </div>
            <div class="glass-panel p-4 rounded-xl border-l-4 border-green-500">
                <div class="text-xs text-gray-400 uppercase font-semibold">Trucks Loaded Today</div>
                <div class="text-3xl font-bold text-green-400 mt-1">8</div>
                <div class="text-xs text-gray-500 mt-1">Target: 12</div>
            </div>
            <div class="glass-panel p-4 rounded-xl border-l-4 border-yellow-500">
                <div class="text-xs text-gray-400 uppercase font-semibold">Loading Delays</div>
                <div class="text-3xl font-bold text-yellow-400 mt-1">2</div>
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
                    <button v-if="dock.status === 'Free'"
                        class="flex-1 bg-white/10 hover:bg-white/20 text-white py-2 rounded text-xs font-bold transition-colors">Assign
                        Truck</button>
                    <button
                        class="px-3 py-2 bg-white/5 hover:bg-white/10 rounded text-gray-400 hover:text-white transition-colors"><span
                            class="material-symbols-outlined text-sm">settings</span></button>
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

        <!-- Incoming Trucks Queue -->
        <div class="glass-panel rounded-xl overflow-hidden p-6">
            <h3 class="font-bold text-white mb-4">Incoming Trucks Queue</h3>
            <div class="space-y-3">
                <div class="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                    <div class="flex items-center gap-4">
                        <div
                            class="w-12 h-12 bg-gray-700 rounded flex items-center justify-center text-white font-bold text-xs flex-col">
                            <span>14:00</span>
                            <span class="text-[8px] text-gray-400">ETA</span>
                        </div>
                        <div>
                            <div class="text-white font-bold">FedEx Ground</div>
                            <div class="text-xs text-gray-400">TRK-9821 • 14 Pallets</div>
                        </div>
                    </div>
                    <button class="text-primary hover:underline text-xs">Details</button>
                </div>
                <div class="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                    <div class="flex items-center gap-4">
                        <div
                            class="w-12 h-12 bg-gray-700 rounded flex items-center justify-center text-white font-bold text-xs flex-col">
                            <span>14:30</span>
                            <span class="text-[8px] text-gray-400">ETA</span>
                        </div>
                        <div>
                            <div class="text-white font-bold">DHL Express</div>
                            <div class="text-xs text-gray-400">TRK-1122 • 5 Pallets</div>
                        </div>
                    </div>
                    <button class="text-primary hover:underline text-xs">Details</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const showVerifyModal = ref(false)
const verifyDock = ref(null)

const docks = ref([
    { id: '1', status: 'Occupied', truck: 'TRK-5541', carrier: 'UPS Freight', progress: 78, statusClass: 'bg-yellow-500', badgeClass: 'bg-yellow-500', arrivedAt: '10:15 AM', loadingSince: '10:32 AM', dwellMinutes: 42, efficiency: 'Normal' },
    { id: '2', status: 'Free', truck: null, carrier: null, progress: 0, statusClass: 'bg-green-500', badgeClass: 'bg-green-500', arrivedAt: null, loadingSince: null, dwellMinutes: 0, efficiency: '--' },
    { id: '3', status: 'Maintenance', truck: null, carrier: null, progress: 0, statusClass: 'bg-red-500', badgeClass: 'bg-red-500 text-white', arrivedAt: null, loadingSince: null, dwellMinutes: 0, efficiency: '--' },
    { id: '4', status: 'Occupied', truck: 'TRK-9912', carrier: 'Internal Fleet', progress: 30, statusClass: 'bg-blue-500', badgeClass: 'bg-blue-500 text-white', arrivedAt: '11:00 AM', loadingSince: '11:15 AM', dwellMinutes: 18, efficiency: 'Good' },
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
    }
    showVerifyModal.value = false
}
</script>
