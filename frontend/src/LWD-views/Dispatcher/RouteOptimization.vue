<template>
    <div class="space-y-6">
        <div class="flex justify-between items-center">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Route Optimization</h2>
            <div class="flex gap-2">
                <button @click="showManualOverride = !showManualOverride"
                    class="bg-yellow-100 dark:bg-yellow-500/10 hover:bg-yellow-200 dark:hover:bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-500/20 py-2 px-4 rounded-lg flex items-center gap-2 transition-colors text-sm font-bold">
                    <span class="material-symbols-outlined text-[18px]">pan_tool</span>
                    Manual Override
                </button>
                <button @click="runOptimizer" :disabled="optimizing"
                    class="bg-primary hover:bg-primary-dark text-black font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                    <span v-if="optimizing" class="material-symbols-outlined animate-spin">progress_activity</span>
                    <span v-else class="material-symbols-outlined">auto_fix_high</span>
                    {{ optimizing ? 'Optimizing...' : 'Run Optimizer' }}
                </button>
            </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-12rem)]">
            <!-- Configuration Panel -->
            <div class="glass-panel p-6 rounded-xl overflow-y-auto no-scrollbar">
                <h3 class="font-bold text-gray-900 dark:text-white mb-4">Optimization Settings</h3>

                <div class="space-y-4">
                    <div>
                        <label class="block text-xs text-gray-500 dark:text-gray-400 mb-1">Optimization Goal</label>
                        <select v-model="optimizationGoal" class="w-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-white/10 rounded-lg p-2 text-gray-900 dark:text-white text-sm">
                            <option class="bg-white dark:bg-gray-800">Minimize Distance</option>
                            <option class="bg-white dark:bg-gray-800">Minimize Time</option>
                            <option class="bg-white dark:bg-gray-800">Balance Workload</option>
                            <option class="bg-white dark:bg-gray-800">Minimize Empty Miles</option>
                        </select>
                    </div>

                    <div>
                        <label class="block text-xs text-gray-500 dark:text-gray-400 mb-1">Constraints</label>
                        <div class="space-y-2">
                            <label class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                <input type="checkbox" v-model="constraints.avoidTolls"
                                    class="rounded border-gray-600 bg-gray-100 dark:bg-black/20 text-primary focus:ring-primary">
                                <span>Avoid Toll Roads</span>
                            </label>
                            <label class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                <input type="checkbox" v-model="constraints.prioritizeVIP"
                                    class="rounded border-gray-600 bg-gray-100 dark:bg-black/20 text-primary focus:ring-primary">
                                <span>Prioritize VIP Orders</span>
                            </label>
                            <label class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                <input type="checkbox" v-model="constraints.evRouting"
                                    class="rounded border-gray-600 bg-gray-100 dark:bg-black/20 text-primary focus:ring-primary">
                                <span>Electric Vehicle Routing</span>
                            </label>
                            <label class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                <input type="checkbox" v-model="constraints.respectNoGo"
                                    class="rounded border-gray-600 bg-gray-100 dark:bg-black/20 text-primary focus:ring-primary">
                                <span>Respect No-Go Zones</span>
                            </label>
                            <label class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                <input type="checkbox" v-model="constraints.hosCompliance"
                                    class="rounded border-gray-600 bg-gray-100 dark:bg-black/20 text-primary focus:ring-primary">
                                <span>HOS Compliance Check</span>
                            </label>
                            <label class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                <input type="checkbox" v-model="constraints.vehicleSize"
                                    class="rounded border-gray-600 bg-gray-100 dark:bg-black/20 text-primary focus:ring-primary">
                                <span>Vehicle Size Restrictions</span>
                            </label>
                        </div>
                    </div>

                    <!-- Data Sources -->
                    <div class="pt-2 border-t border-gray-200 dark:border-white/5">
                        <div class="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-2">Routing Intelligence Sources</div>
                        <div class="space-y-1 text-xs">
                            <div class="flex items-center gap-2 text-green-700 dark:text-green-400"><span class="w-1.5 h-1.5 rounded-full bg-green-500"></span> Traffic data (live)</div>
                            <div class="flex items-center gap-2 text-green-700 dark:text-green-400"><span class="w-1.5 h-1.5 rounded-full bg-green-500"></span> Road restrictions</div>
                            <div class="flex items-center gap-2 text-green-700 dark:text-green-400"><span class="w-1.5 h-1.5 rounded-full bg-green-500"></span> No-go zones (from Manager)</div>
                            <div class="flex items-center gap-2 text-yellow-700 dark:text-yellow-400"><span class="w-1.5 h-1.5 rounded-full bg-yellow-500"></span> Weather warnings (partial)</div>
                            <div class="flex items-center gap-2 text-green-700 dark:text-green-400"><span class="w-1.5 h-1.5 rounded-full bg-green-500"></span> Delivery time windows</div>
                        </div>
                    </div>

                    <div class="pt-4 border-t border-gray-200 dark:border-white/5">
                        <h4 class="text-sm font-bold text-gray-900 dark:text-white mb-2">Unassigned Orders (42)</h4>
                        <div class="bg-gray-100 dark:bg-black/20 rounded p-2 text-xs text-gray-600 dark:text-gray-400 h-32 overflow-y-auto no-scrollbar">
                            <div class="flex justify-between py-1 border-b border-gray-200 dark:border-white/5"><span>ORD-9912 (Zone A)</span><span class="text-yellow-400">High</span></div>
                            <div class="flex justify-between py-1 border-b border-gray-200 dark:border-white/5"><span>ORD-8821 (Zone B)</span><span class="text-gray-500">Normal</span></div>
                            <div class="flex justify-between py-1 border-b border-gray-200 dark:border-white/5"><span>ORD-7712 (Zone A)</span><span class="text-gray-500">Normal</span></div>
                            <div class="flex justify-between py-1 border-b border-gray-200 dark:border-white/5"><span>ORD-1120 (Zone C)</span><span class="text-red-400">Critical</span></div>
                        </div>
                    </div>
                </div>

                <div class="mt-4 p-3 bg-blue-100 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-lg text-xs text-blue-700 dark:text-blue-300">
                    <span class="font-bold">AI Tip:</span> Grouping Zone A orders could save 15% fuel today.
                </div>
            </div>

            <!-- Map Result Visualization -->
            <div class="lg:col-span-2 glass-panel rounded-xl relative overflow-hidden flex flex-col">
                <div class="absolute inset-0 bg-gray-200 dark:bg-gray-800 bg-gradient-to-br from-gray-200 dark:from-gray-800 to-gray-100 dark:to-gray-900 opacity-70"></div>

                <!-- Simulated Route Lines -->
                <svg class="absolute inset-0 w-full h-full pointer-events-none">
                    <path d="M 100 100 L 200 200 L 300 150" stroke="#1CE783" stroke-width="3" fill="none"
                        stroke-dasharray="5,5" class="animate-pulse" />
                    <circle cx="100" cy="100" r="4" fill="white" />
                    <circle cx="200" cy="200" r="4" fill="white" />
                    <circle cx="300" cy="150" r="4" fill="white" />
                </svg>

                <!-- Manual Override Panel (rendered as centered modal via Teleport below) -->

                <!-- ETA Generation Panel -->
                <div class="absolute top-4 left-4 z-10 bg-white/90 dark:bg-black/80 backdrop-blur border border-gray-200 dark:border-white/10 rounded-xl p-4 w-64">
                    <div class="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-2">ETA Generation</div>
                    <div class="space-y-2 text-xs">
                        <div class="flex justify-between"><span class="text-gray-500 dark:text-gray-400">Stop 1 ETA</span><span class="text-gray-900 dark:text-white font-mono">9:45 AM</span></div>
                        <div class="flex justify-between"><span class="text-gray-500 dark:text-gray-400">Stop 2 ETA</span><span class="text-gray-900 dark:text-white font-mono">10:15 AM</span></div>
                        <div class="flex justify-between"><span class="text-gray-500 dark:text-gray-400">Stop 3 ETA</span><span class="text-yellow-600 dark:text-yellow-400 font-mono">11:00 AM ⚠</span></div>
                        <div class="flex justify-between"><span class="text-gray-500 dark:text-gray-400">Stop 4 ETA</span><span class="text-gray-900 dark:text-white font-mono">12:30 PM</span></div>
                        <div class="pt-1 border-t border-gray-200 dark:border-white/10 flex justify-between">
                            <span class="text-gray-500 dark:text-gray-400">Total Duration</span>
                            <span class="text-primary font-bold font-mono">6h 30m</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-500 dark:text-gray-400">Delay Probability</span>
                            <span class="text-yellow-600 dark:text-yellow-400 font-bold">18%</span>
                        </div>
                    </div>
                    <div class="mt-2 text-[9px] text-gray-500">Shared with: Driver, AI Customer Support</div>
                </div>

                <!-- Results Summary Overlay -->
                <div
                    class="absolute bottom-6 left-6 right-6 bg-white/90 dark:bg-black/80 backdrop-blur-md rounded-lg p-4 border border-gray-200 dark:border-white/10 flex justify-between items-center">
                    <div>
                        <div class="text-xs text-gray-500 dark:text-gray-400">Proposed Solution</div>
                        <div class="text-gray-900 dark:text-white font-bold">{{ routeStats.routes }} Routes • {{ routeStats.distance }} km Total • {{ routeStats.efficiency }}% Efficiency</div>
                    </div>
                    <div class="flex gap-2">
                        <button @click="showAdjustModal = true"
                            class="px-4 py-2 rounded bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-900 dark:text-white text-sm transition-colors">Adjust</button>
                        <button @click="applyRoutes" :disabled="routesApplied"
                            class="px-4 py-2 rounded bg-primary text-black font-bold text-sm hover:bg-primary-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                            {{ routesApplied ? '✓ Applied' : 'Apply Routes' }}
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Reassignment Toast -->
        <Transition enter-active-class="transition ease-out duration-300" enter-from-class="translate-y-4 opacity-0" enter-to-class="translate-y-0 opacity-100" leave-active-class="transition ease-in duration-200" leave-from-class="translate-y-0 opacity-100" leave-to-class="translate-y-4 opacity-0">
            <div v-if="reassignToast" class="fixed bottom-6 right-6 z-50 bg-primary text-black font-bold px-5 py-3 rounded-lg shadow-lg text-sm flex items-center gap-2">
                <span class="material-symbols-outlined text-[18px]">check_circle</span>
                {{ reassignToast }}
            </div>
        </Transition>

        <!-- Adjust Routes Modal -->
        <Teleport to="body">
            <Transition enter-active-class="transition ease-out duration-200" enter-from-class="opacity-0" enter-to-class="opacity-100" leave-active-class="transition ease-in duration-150" leave-from-class="opacity-100" leave-to-class="opacity-0">
                <div v-if="showAdjustModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" @click.self="showAdjustModal = false">
                    <div class="bg-white dark:bg-card-dark border border-gray-200 dark:border-white/10 shadow-2xl rounded-2xl p-6 w-full max-w-md mx-4">
                        <div class="flex items-center justify-between mb-5">
                            <h3 class="text-lg font-bold text-gray-900 dark:text-white">Adjust Routes</h3>
                            <button @click="showAdjustModal = false" class="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors">
                                <span class="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div class="space-y-4">
                            <div>
                                <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Number of Routes</label>
                                <input type="number" v-model.number="adjustForm.routes" min="1" max="50"
                                    class="w-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-white/10 rounded-lg p-2.5 text-gray-900 dark:text-white text-sm focus:ring-primary focus:border-primary" />
                            </div>
                            <div>
                                <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Max Distance (km)</label>
                                <input type="number" v-model.number="adjustForm.distance" min="100" max="5000" step="10"
                                    class="w-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-white/10 rounded-lg p-2.5 text-gray-900 dark:text-white text-sm focus:ring-primary focus:border-primary" />
                            </div>
                            <div>
                                <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Target Efficiency (%)</label>
                                <input type="range" v-model.number="adjustForm.efficiency" min="50" max="100"
                                    class="w-full accent-primary" />
                                <div class="flex justify-between text-[10px] text-gray-400"><span>50%</span><span class="text-primary font-bold">{{ adjustForm.efficiency }}%</span><span>100%</span></div>
                            </div>
                            <div>
                                <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Priority</label>
                                <select v-model="adjustForm.priority" class="w-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-white/10 rounded-lg p-2.5 text-gray-900 dark:text-white text-sm">
                                    <option class="bg-white dark:bg-gray-800">Distance First</option>
                                    <option class="bg-white dark:bg-gray-800">Time First</option>
                                    <option class="bg-white dark:bg-gray-800">Balanced</option>
                                </select>
                            </div>
                        </div>

                        <div class="flex gap-3 mt-6">
                            <button @click="showAdjustModal = false"
                                class="flex-1 py-2.5 rounded-lg bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-900 dark:text-white text-sm font-medium transition-colors">Cancel</button>
                            <button @click="confirmAdjust"
                                class="flex-1 py-2.5 rounded-lg bg-primary hover:bg-primary-dark text-black font-bold text-sm transition-colors">Apply Adjustments</button>
                        </div>
                    </div>
                </div>
            </Transition>
        </Teleport>

        <!-- Manual Override Modal -->
        <Teleport to="body">
            <Transition enter-active-class="transition ease-out duration-200" enter-from-class="opacity-0" enter-to-class="opacity-100" leave-active-class="transition ease-in duration-150" leave-from-class="opacity-100" leave-to-class="opacity-0">
                <div v-if="showManualOverride" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" @click.self="showManualOverride = false">
                    <div class="bg-white dark:bg-card-dark border border-yellow-500/30 shadow-2xl rounded-2xl p-6 w-full max-w-xl mx-4 max-h-[85vh] overflow-y-auto no-scrollbar">
                        <div class="flex items-center justify-between mb-4">
                            <div class="flex items-center gap-2">
                                <span class="material-symbols-outlined text-yellow-400 text-[18px]">pan_tool</span>
                                <h3 class="font-bold text-yellow-600 dark:text-yellow-400 text-base">Manual Override Mode</h3>
                            </div>
                            <button @click="showManualOverride = false" class="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors">
                                <span class="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div class="text-[11px] text-gray-500 dark:text-gray-400 mb-4">Drag orders from the right and drop them on a driver on the left. All overrides are logged in audit trail.</div>

                        <div class="grid grid-cols-2 gap-4">
                            <!-- Drivers (Left) -->
                            <div>
                                <div class="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider mb-2">Drop on Driver</div>
                                <div class="space-y-1.5 max-h-52 overflow-y-auto no-scrollbar pr-1">
                                    <div v-for="driver in availableDrivers" :key="driver.id"
                                        @dragover.prevent
                                        @dragenter.prevent="dragOverDriver = driver.id"
                                        @dragleave="dragOverDriver = null"
                                        @drop="onDropOnDriver($event, driver)"
                                        class="p-2.5 rounded-lg text-xs border transition-all"
                                        :class="dragOverDriver === driver.id
                                            ? 'bg-primary/20 border-primary text-primary scale-[1.02]'
                                            : 'bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:border-primary/40'">
                                        <div class="flex justify-between items-center">
                                            <span class="font-medium">{{ driver.name }}</span>
                                            <span class="text-[10px] font-bold" :class="driver.load < 70 ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'">{{ driver.load }}%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <!-- Orders (Right) -->
                            <div>
                                <div class="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider mb-2">Orders</div>
                                <div class="space-y-1.5 max-h-52 overflow-y-auto no-scrollbar pr-1">
                                    <div v-for="order in overrideOrders" :key="order.id"
                                        draggable="true"
                                        @dragstart="onDragStart($event, order)"
                                        @dragend="onDragEnd"
                                        class="p-2.5 bg-white dark:bg-white/10 rounded-lg text-xs text-gray-900 dark:text-gray-200 cursor-grab active:cursor-grabbing border shadow-sm transition-all"
                                        :class="draggedOrder?.id === order.id
                                            ? 'opacity-60 border-yellow-400 bg-yellow-50 dark:bg-yellow-500/10'
                                            : order.reassigned
                                                ? 'border-l-[3px] border-primary bg-primary/5 dark:bg-primary/10'
                                                : 'border-gray-200 dark:border-white/10 hover:border-yellow-500/40'">
                                        <div class="flex justify-between items-center">
                                            <span class="font-semibold">{{ order.id }}</span>
                                            <span v-if="order.reassigned" class="text-primary font-bold text-[10px]">✓ {{ order.assignedTo }}</span>
                                            <span v-else class="text-yellow-600 dark:text-yellow-400 text-[10px] font-medium">Drag →</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="pt-3 mt-4 border-t border-gray-200 dark:border-white/10 grid grid-cols-2 gap-3">
                            <button @click="setEmergencyPriority" class="w-full text-xs py-2 rounded-lg font-bold transition-colors"
                                :class="emergencySet ? 'bg-red-200 dark:bg-red-500/30 text-red-700 dark:text-red-300' : 'bg-red-100 dark:bg-red-500/20 hover:bg-red-200 dark:hover:bg-red-500/30 text-red-700 dark:text-red-400'">
                                {{ emergencySet ? '✓ Emergency Priority Set' : 'Set Emergency Priority' }}
                            </button>
                            <button @click="reorderStops" class="w-full text-xs py-2 rounded-lg font-bold transition-colors"
                                :class="stopsReordered ? 'bg-blue-200 dark:bg-blue-500/30 text-blue-700 dark:text-blue-300' : 'bg-blue-100 dark:bg-blue-500/20 hover:bg-blue-200 dark:hover:bg-blue-500/30 text-blue-700 dark:text-blue-400'">
                                {{ stopsReordered ? '✓ Stops Reordered' : 'Reorder Stops' }}
                            </button>
                        </div>
                        <div class="text-[9px] text-gray-500 dark:text-gray-600 italic mt-2 text-center">All overrides logged in audit trail</div>
                    </div>
                </div>
            </Transition>
        </Teleport>
    </div>
</template>

<script setup>
import { ref, reactive } from 'vue'

const showManualOverride = ref(false)
const optimizing = ref(false)
const routesApplied = ref(false)
const emergencySet = ref(false)
const stopsReordered = ref(false)
const showAdjustModal = ref(false)
const reassignToast = ref('')
const draggedOrder = ref(null)
const dragOverDriver = ref(null)
const optimizationGoal = ref('Minimize Distance')

const constraints = reactive({
    avoidTolls: true,
    prioritizeVIP: true,
    evRouting: false,
    respectNoGo: true,
    hosCompliance: true,
    vehicleSize: true
})

const routeStats = reactive({ routes: 14, distance: 842, efficiency: 96 })

const adjustForm = reactive({
    routes: routeStats.routes,
    distance: routeStats.distance,
    efficiency: routeStats.efficiency,
    priority: 'Balanced'
})

const overrideOrders = reactive([
    { id: 'ORD-9912', reassigned: false, assignedTo: '' },
    { id: 'ORD-8821', reassigned: false, assignedTo: '' },
    { id: 'ORD-7712', reassigned: false, assignedTo: '' }
])

const availableDrivers = reactive([
    { id: 'DRV-01', name: 'Mike Johnson', load: 55 },
    { id: 'DRV-02', name: 'Sara Patel', load: 72 },
    { id: 'DRV-03', name: 'Lee Chen', load: 40 }
])

function runOptimizer() {
    optimizing.value = true
    routesApplied.value = false
    setTimeout(() => {
        routeStats.routes = 12
        routeStats.distance = 768
        routeStats.efficiency = 98
        optimizing.value = false
    }, 2000)
}

function applyRoutes() { routesApplied.value = true }

function confirmAdjust() {
    routeStats.routes = adjustForm.routes
    routeStats.distance = adjustForm.distance
    routeStats.efficiency = adjustForm.efficiency
    routesApplied.value = false
    showAdjustModal.value = false
}

function setEmergencyPriority() { emergencySet.value = true }
function reorderStops() { stopsReordered.value = true }

// Drag & Drop
function onDragStart(event, order) {
    draggedOrder.value = order
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', order.id)
}

function onDragEnd() {
    draggedOrder.value = null
    dragOverDriver.value = null
}

function onDropOnDriver(event, driver) {
    event.preventDefault()
    dragOverDriver.value = null
    if (!draggedOrder.value) return

    const order = overrideOrders.find(o => o.id === draggedOrder.value.id)
    if (order) {
        order.reassigned = true
        order.assignedTo = driver.name
        driver.load = Math.min(100, driver.load + 10)
        showToast(`${order.id} reassigned to ${driver.name}`)
    }
    draggedOrder.value = null
}

function showToast(msg) {
    reassignToast.value = msg
    setTimeout(() => { reassignToast.value = '' }, 3000)
}
</script>
