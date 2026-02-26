<template>
    <div class="space-y-6">
        <div class="flex justify-between items-center">
            <h2 class="text-2xl font-bold text-white">Picking & Packing</h2>
            <div class="flex gap-2">
                <div class="px-4 py-2 bg-black/40 border border-white/10 rounded-lg text-white text-sm">
                    Active Pickers: <span class="text-green-400 font-bold">14</span>
                </div>
                <button
                    class="bg-primary hover:bg-primary-dark text-background-dark font-bold py-2 px-4 rounded-lg transition-colors">Assign
                    Batches</button>
            </div>
        </div>

        <!-- Order Status Flow -->
        <div class="glass-panel p-4 rounded-xl">
            <div class="text-xs text-gray-400 uppercase font-semibold mb-3">Order Fulfillment Pipeline</div>
            <div class="flex items-center justify-between gap-2">
                <div v-for="(step, idx) in pipelineSteps" :key="step.label"
                    class="flex-1 flex flex-col items-center relative group">
                    <div class="w-full flex items-center">
                        <div class="flex-1 h-1 rounded-full"
                            :class="idx === 0 ? 'bg-transparent' : step.active ? 'bg-primary' : 'bg-gray-700'"></div>
                        <div class="w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all"
                            :class="step.active ? 'bg-primary text-background-dark shadow-lg shadow-primary/30' : 'bg-white/5 text-gray-500 border border-white/10'">
                            <span class="material-symbols-outlined text-[18px]">{{ step.icon }}</span>
                        </div>
                        <div class="flex-1 h-1 rounded-full"
                            :class="idx === pipelineSteps.length - 1 ? 'bg-transparent' : pipelineSteps[idx + 1]?.active ? 'bg-primary' : 'bg-gray-700'">
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
                <div class="p-6 border-b border-white/5 flex justify-between">
                    <h3 class="font-bold text-white">Active Pick Waves</h3>
                    <span class="text-xs text-gray-400">Auto-refreshing in 30s</span>
                </div>

                <table class="w-full text-left text-sm">
                    <thead class="bg-white/5 text-gray-400 uppercase">
                        <tr>
                            <th class="p-4">Wave ID</th>
                            <th class="p-4">Staff</th>
                            <th class="p-4">Progress</th>
                            <th class="p-4">Zone</th>
                            <th class="p-4">Deadline</th>
                            <th class="p-4">Status</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-white/5">
                        <tr v-for="wave in waves" :key="wave.id" class="hover:bg-white/5 transition-colors">
                            <td class="p-4 font-mono text-primary">{{ wave.id }}</td>
                            <td class="p-4 text-white">{{ wave.staff }}</td>
                            <td class="p-4 text-gray-300 w-32">
                                <div class="w-full bg-gray-700 h-1.5 rounded-full overflow-hidden mt-1">
                                    <div class="bg-primary h-full" :style="`width: ${wave.progress}%`"></div>
                                </div>
                            </td>
                            <td class="p-4 text-gray-400">{{ wave.zone }}</td>
                            <td class="p-4 text-white font-mono">{{ wave.deadline }}</td>
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
                    <h3 class="font-bold text-white mb-4">Packing Stations</h3>
                    <div class="space-y-4">
                        <div v-for="station in stations" :key="station.id"
                            class="p-4 bg-white/5 border border-white/5 rounded-lg">
                            <div class="flex justify-between items-center mb-2">
                                <span class="font-bold text-white">{{ station.name }}</span>
                                <span class="w-2 h-2 rounded-full"
                                    :class="station.active ? 'bg-green-500 animate-pulse' : 'bg-gray-500'"></span>
                            </div>
                            <div class="text-xs text-gray-400 mb-2">{{ station.packer }}</div>
                            <div class="flex justify-between items-end text-sm">
                                <div>
                                    <div class="text-gray-500 text-[10px] uppercase">Throughput</div>
                                    <div class="text-white font-bold">{{ station.rate }} / hr</div>
                                </div>
                                <button
                                    class="bg-white/10 hover:bg-white/20 text-white px-2 py-1 rounded text-xs transition-colors">Monitor</button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Quality Check Panel -->
                <div class="glass-panel p-6 rounded-xl">
                    <h3 class="font-bold text-white mb-4 flex items-center gap-2">
                        <span class="material-symbols-outlined text-green-400">verified</span>
                        Quality Verification
                    </h3>
                    <div class="space-y-3">
                        <div v-for="check in qualityChecks" :key="check.orderId"
                            class="p-3 bg-white/5 rounded-lg border border-white/5">
                            <div class="flex justify-between items-center mb-2">
                                <span class="font-mono text-primary text-xs font-bold">{{ check.orderId }}</span>
                                <span class="px-2 py-0.5 rounded text-[10px] font-bold"
                                    :class="check.verified ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'">{{
                                        check.verified ? 'Verified' : 'Pending' }}</span>
                            </div>
                            <div class="space-y-1 text-xs">
                                <div class="flex items-center gap-2">
                                    <span class="material-symbols-outlined text-[14px]"
                                        :class="check.goodsCorrect ? 'text-green-400' : 'text-gray-600'">{{
                                            check.goodsCorrect ? 'check_circle' : 'radio_button_unchecked' }}</span>
                                    <span class="text-gray-300">Correct goods</span>
                                </div>
                                <div class="flex items-center gap-2">
                                    <span class="material-symbols-outlined text-[14px]"
                                        :class="check.countCorrect ? 'text-green-400' : 'text-gray-600'">{{
                                            check.countCorrect ? 'check_circle' : 'radio_button_unchecked' }}</span>
                                    <span class="text-gray-300">Correct count</span>
                                </div>
                                <div class="flex items-center gap-2">
                                    <span class="material-symbols-outlined text-[14px]"
                                        :class="check.packagingOk ? 'text-green-400' : 'text-gray-600'">{{
                                            check.packagingOk ? 'check_circle' : 'radio_button_unchecked' }}</span>
                                    <span class="text-gray-300">Packaging verified</span>
                                </div>
                                <div class="flex items-center gap-2">
                                    <span class="material-symbols-outlined text-[14px]"
                                        :class="check.laborConfirmed ? 'text-green-400' : 'text-gray-600'">{{
                                            check.laborConfirmed ? 'check_circle' : 'radio_button_unchecked' }}</span>
                                    <span class="text-gray-300">Labor assigned</span>
                                </div>
                                <div class="flex items-center gap-2">
                                    <span class="material-symbols-outlined text-[14px]"
                                        :class="check.weightOk ? 'text-green-400' : 'text-gray-600'">{{ check.weightOk ?
                                        'check_circle' : 'radio_button_unchecked' }}</span>
                                    <span class="text-gray-300">Weight verified</span>
                                </div>
                                <div class="flex items-center gap-2">
                                    <span class="material-symbols-outlined text-[14px]"
                                        :class="check.labelAttached ? 'text-green-400' : 'text-gray-600'">{{
                                            check.labelAttached ? 'check_circle' : 'radio_button_unchecked' }}</span>
                                    <span class="text-gray-300">Shipping label attached</span>
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

        <!-- Dispatch Confirmation Toast -->
        <div v-if="dispatchToast"
            class="fixed bottom-6 right-6 bg-green-500/90 text-white px-6 py-4 rounded-xl shadow-2xl shadow-green-500/30 flex items-center gap-3 z-50 animate-bounce">
            <span class="material-symbols-outlined">check_circle</span>
            <div>
                <div class="font-bold">{{ dispatchToast }} — Ready for Dispatch!</div>
                <div class="text-xs opacity-80">Notification sent to Dispatcher</div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'

const dispatchToast = ref('')

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
    { id: 1, name: 'Pack Station 1', packer: 'Sarah J.', rate: 45, active: true },
    { id: 2, name: 'Pack Station 2', packer: 'Mike T.', rate: 42, active: true },
    { id: 3, name: 'Pack Station 3', packer: '-- Closed --', rate: 0, active: false },
])

const qualityChecks = ref([
    { orderId: 'ORD-20258', goodsCorrect: true, countCorrect: true, packagingOk: true, laborConfirmed: true, weightOk: true, labelAttached: true, verified: true },
    { orderId: 'ORD-20255', goodsCorrect: true, countCorrect: true, packagingOk: false, laborConfirmed: true, weightOk: false, labelAttached: false, verified: false },
])

function triggerDispatch(check) {
    dispatchToast.value = check.orderId
    setTimeout(() => { dispatchToast.value = '' }, 3000)
}
</script>
