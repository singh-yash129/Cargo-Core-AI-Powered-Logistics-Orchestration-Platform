<template>
    <div class="space-y-6">
        <div class="flex justify-between items-center">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Picking & Packing</h2>
            <div class="flex gap-2">
                <div
                    class="px-4 py-2 bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white text-sm">
                    Active Pickers: <span class="text-green-400 font-bold">{{stations.filter(s => s.active).length * 5
                    }}</span>
                </div>
                <button @click="showBatchModal = true"
                    class="bg-primary hover:bg-primary-dark text-background-dark font-bold py-2 px-4 rounded-lg transition-colors">Assign
                    Batches</button>
            </div>
        </div>

        <!-- Order Status Flow -->
        <div class="glass-panel p-4 rounded-xl">
            <div class="text-xs text-gray-600 dark:text-gray-400 uppercase font-semibold mb-3">Order Fulfillment
                Pipeline</div>
            <div class="flex items-center justify-between gap-2">
                <div v-for="(step, idx) in pipelineSteps" :key="step.label"
                    class="flex-1 flex flex-col items-center relative group">
                    <div class="w-full flex items-center">
                        <div class="flex-1 h-1 rounded-full"
                            :class="idx === 0 ? 'bg-transparent' : step.active ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'">
                        </div>
                        <div class="w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all"
                            :class="step.active ? 'bg-primary text-background-dark shadow-lg shadow-primary/30' : 'bg-gray-50 dark:bg-white/5 text-gray-500 border border-gray-200 dark:border-white/10'">
                            <span class="material-symbols-outlined text-[18px]">{{ step.icon }}</span>
                        </div>
                        <div class="flex-1 h-1 rounded-full"
                            :class="idx === pipelineSteps.length - 1 ? 'bg-transparent' : pipelineSteps[idx + 1]?.active ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'">
                        </div>
                    </div>
                    <div class="text-[10px] mt-2 font-bold text-center"
                        :class="step.active ? 'text-primary' : 'text-gray-500'">{{ step.label }}</div>
                    <div class="text-[10px] text-gray-600 text-center">{{ step.count }} orders</div>
                </div>
            </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Pick Wave Status -->
            <div class="lg:col-span-2 glass-panel rounded-xl overflow-hidden">
                <div class="p-6 border-b border-gray-100 dark:border-white/5 flex justify-between">
                    <h3 class="font-bold text-gray-900 dark:text-white">Active Pick Waves</h3>
                    <span class="text-xs text-gray-600 dark:text-gray-400">Auto-refreshing in 30s</span>
                </div>
                <table class="w-full text-left text-sm">
                    <thead class="bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-400 uppercase">
                        <tr>
                            <th class="p-4">Wave ID</th>
                            <th class="p-4">Staff</th>
                            <th class="p-4">Progress</th>
                            <th class="p-4">Zone</th>
                            <th class="p-4">Deadline</th>
                            <th class="p-4">Status</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100 dark:divide-white/5">
                        <tr v-for="wave in waves" :key="wave.id"
                            class="hover:bg-gray-50 dark:bg-white/5 transition-colors">
                            <td class="p-4 font-mono text-primary">{{ wave.id }}</td>
                            <td class="p-4 text-gray-900 dark:text-white">{{ wave.staff }}</td>
                            <td class="p-4 text-gray-300 w-32">
                                <div class="flex items-center gap-2">
                                    <div class="w-full bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
                                        <div class="bg-primary h-full" :style="`width: ${wave.progress}%`"></div>
                                    </div>
                                    <span class="text-xs text-gray-600 dark:text-gray-400">{{ wave.progress }}%</span>
                                </div>
                            </td>
                            <td class="p-4 text-gray-600 dark:text-gray-400">{{ wave.zone }}</td>
                            <td class="p-4 text-gray-900 dark:text-white font-mono">{{ wave.deadline }}</td>
                            <td class="p-4">
                                <span class="px-2 py-1 rounded text-[10px] font-bold border" :class="wave.statusClass">
                                    {{ wave.status }}
                                </span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- Packing Station View + Quality Check -->
            <div class="space-y-6">
                <div class="glass-panel p-6 rounded-xl">
                    <h3 class="font-bold text-gray-900 dark:text-white mb-4">Packing Stations</h3>
                    <div class="space-y-4">
                        <div v-for="station in stations" :key="station.id"
                            class="p-4 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-lg">
                            <div class="flex justify-between items-center mb-2">
                                <span class="font-bold text-gray-900 dark:text-white">{{ station.name }}</span>
                                <span class="w-2 h-2 rounded-full"
                                    :class="station.active ? 'bg-green-500 animate-pulse' : 'bg-gray-500'"></span>
                            </div>
                            <div class="text-xs text-gray-600 dark:text-gray-400 mb-2">{{ station.packer }}</div>
                            <div class="flex justify-between items-end text-sm">
                                <div>
                                    <div class="text-gray-500 text-[10px] uppercase">Throughput</div>
                                    <div class="text-gray-900 dark:text-white font-bold">{{ station.rate }} / hr</div>
                                </div>
                                <button @click="monitorStation(station)"
                                    class="bg-gray-100 dark:bg-white/10 hover:bg-gray-300 dark:hover:bg-white/20 text-gray-900 dark:text-white px-2 py-1 rounded text-xs transition-colors"
                                    :class="station.monitoring ? 'ring-1 ring-primary bg-primary/20 text-primary' : ''">
                                    {{ station.monitoring ? '● Live' : 'Monitor' }}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Quality Check Panel -->
                <div class="glass-panel p-6 rounded-xl">
                    <h3 class="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <span class="material-symbols-outlined text-green-400">verified</span>
                        Quality Verification
                    </h3>
                    <div class="space-y-3">
                        <div v-for="check in qualityChecks" :key="check.orderId"
                            class="p-3 bg-gray-50 dark:bg-white/5 rounded-lg border border-gray-100 dark:border-white/5">
                            <div class="flex justify-between items-center mb-2">
                                <span class="font-mono text-primary text-xs font-bold">{{ check.orderId }}</span>
                                <span class="px-2 py-0.5 rounded text-[10px] font-bold"
                                    :class="check.verified ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'">
                                    {{ check.verified ? 'Verified' : 'Pending' }}
                                </span>
                            </div>
                            <div class="space-y-1 text-xs">
                                <div v-for="(field, fIdx) in checkFields" :key="fIdx"
                                    @click="toggleCheck(check, field.key)"
                                    class="flex items-center gap-2 cursor-pointer hover:bg-gray-50 dark:bg-white/5 rounded p-0.5 transition-colors">
                                    <span class="material-symbols-outlined text-[14px]"
                                        :class="check[field.key] ? 'text-green-400' : 'text-gray-600'">{{
                                            check[field.key] ? 'check_circle' : 'radio_button_unchecked' }}</span>
                                    <span class="text-gray-300">{{ field.label }}</span>
                                </div>
                            </div>
                            <button v-if="check.verified" @click="triggerDispatch(check)"
                                class="mt-3 w-full py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded text-xs font-bold transition-colors flex items-center justify-center gap-1">
                                <span class="material-symbols-outlined text-[14px]">send</span> Ready for Dispatch
                            </button>
                            <button v-else
                                class="mt-3 w-full py-2 bg-yellow-500/20 text-yellow-400 rounded text-xs font-bold cursor-not-allowed opacity-50">
                                Complete all checks first
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Assign Batch Modal -->
        <Teleport to="body">
            <div v-if="showBatchModal"
                class="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                @click.self="showBatchModal = false">
                <div class="glass-panel rounded-2xl w-full max-w-md border border-gray-200 dark:border-white/10">
                    <div class="p-6 border-b border-gray-100 dark:border-white/5 flex justify-between items-center">
                        <h3 class="font-bold text-gray-900 dark:text-white text-lg">Assign New Pick Batch</h3>
                        <button @click="showBatchModal = false"
                            class="text-gray-500 hover:text-gray-900 dark:text-white"><span
                                class="material-symbols-outlined">close</span></button>
                    </div>
                    <div class="p-6 space-y-4">
                        <div>
                            <label class="text-xs text-gray-600 dark:text-gray-400 mb-1 block">Assign To Team</label>
                            <select v-model="batchForm.staff"
                                class="w-full bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-lg p-3 text-gray-900 dark:text-white">
                                <option>Team A</option>
                                <option>Team B</option>
                                <option>Team C</option>
                                <option>Team D</option>
                            </select>
                        </div>
                        <div>
                            <label class="text-xs text-gray-600 dark:text-gray-400 mb-1 block">Zone</label>
                            <select v-model="batchForm.zone"
                                class="w-full bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-lg p-3 text-gray-900 dark:text-white">
                                <option>Zone A (High Vel)</option>
                                <option>Zone B (Bulk)</option>
                                <option>Zone C</option>
                                <option>Zone D</option>
                            </select>
                        </div>
                        <div>
                            <label class="text-xs text-gray-600 dark:text-gray-400 mb-1 block">Deadline</label>
                            <input type="time" v-model="batchForm.deadline"
                                class="w-full bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-lg p-3 text-gray-900 dark:text-white focus:outline-none focus:border-primary/50" />
                        </div>
                        <button @click="assignBatch"
                            class="w-full bg-primary hover:bg-primary-dark text-background-dark font-bold py-3 rounded-lg transition-colors">Create
                            Pick Wave</button>
                    </div>
                </div>
            </div>
        </Teleport>

        <!-- Dispatch Toast -->
        <div v-if="dispatchToast"
            class="fixed bottom-6 right-6 bg-green-500/90 text-white px-6 py-4 rounded-xl shadow-2xl shadow-green-500/30 flex items-center gap-3 z-50 animate-bounce">
            <span class="material-symbols-outlined">check_circle</span>
            <div>
                <div class="font-bold">{{ dispatchToast }}</div>
                <div class="text-xs opacity-80">Notification sent to Dispatcher</div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'

const dispatchToast = ref('')
const showBatchModal = ref(false)
const batchForm = reactive({ staff: 'Team C', zone: 'Zone A (High Vel)', deadline: '14:00' })

const checkFields = [
    { key: 'goodsCorrect', label: 'Correct goods' },
    { key: 'countCorrect', label: 'Correct count' },
    { key: 'packagingOk', label: 'Packaging verified' },
    { key: 'laborConfirmed', label: 'Labor assigned' },
    { key: 'weightOk', label: 'Weight verified' },
    { key: 'labelAttached', label: 'Shipping label attached' },
]

const pipelineSteps = ref([
    { label: 'Accepted', icon: 'task_alt', active: true, count: 12 },
    { label: 'Picking', icon: 'shopping_basket', active: true, count: 5 },
    { label: 'Packing', icon: 'package_2', active: true, count: 3 },
    { label: 'Quality Check', icon: 'verified', active: false, count: 2 },
    { label: 'Ready for Dispatch', icon: 'local_shipping', active: false, count: 0 },
])

const waves = ref([
    { id: 'WAVE-101', staff: 'Team A', progress: 75, zone: 'Zone A (High Vel)', deadline: '11:00 AM', status: 'In Progress', statusClass: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
    { id: 'WAVE-102', staff: 'Team B', progress: 20, zone: 'Zone B (Bulk)', deadline: '12:00 PM', status: 'Started', statusClass: 'bg-green-500/10 text-green-500 border-green-500/20' },
    { id: 'WAVE-103', staff: '--', progress: 0, zone: 'Zone C', deadline: '02:00 PM', status: 'Pending', statusClass: 'bg-gray-500/10 text-gray-500 border-gray-500/20' },
])

const stations = ref([
    { id: 1, name: 'Pack Station 1', packer: 'Sarah J.', rate: 45, active: true, monitoring: false },
    { id: 2, name: 'Pack Station 2', packer: 'Mike T.', rate: 42, active: true, monitoring: false },
    { id: 3, name: 'Pack Station 3', packer: '-- Closed --', rate: 0, active: false, monitoring: false },
])

const qualityChecks = ref([
    { orderId: 'ORD-20258', goodsCorrect: true, countCorrect: true, packagingOk: true, laborConfirmed: true, weightOk: true, labelAttached: true, verified: true },
    { orderId: 'ORD-20255', goodsCorrect: true, countCorrect: true, packagingOk: false, laborConfirmed: true, weightOk: false, labelAttached: false, verified: false },
])

function toggleCheck(check, key) {
    check[key] = !check[key]
    check.verified = check.goodsCorrect && check.countCorrect && check.packagingOk && check.laborConfirmed && check.weightOk && check.labelAttached
}

function monitorStation(station) {
    station.monitoring = !station.monitoring
}

function triggerDispatch(check) {
    pipelineSteps.value[4].count++
    pipelineSteps.value[4].active = true
    pipelineSteps.value[3].count = Math.max(0, pipelineSteps.value[3].count - 1)
    dispatchToast.value = `${check.orderId} — Ready for Dispatch!`
    setTimeout(() => { dispatchToast.value = '' }, 3000)
}

function assignBatch() {
    const waveId = `WAVE-${104 + waves.value.length}`
    waves.value.push({
        id: waveId,
        staff: batchForm.staff,
        progress: 0,
        zone: batchForm.zone,
        deadline: batchForm.deadline,
        status: 'Pending',
        statusClass: 'bg-gray-500/10 text-gray-500 border-gray-500/20'
    })
    showBatchModal.value = false
    dispatchToast.value = `${waveId} assigned to ${batchForm.staff}`
    setTimeout(() => { dispatchToast.value = '' }, 2500)
}
</script>
