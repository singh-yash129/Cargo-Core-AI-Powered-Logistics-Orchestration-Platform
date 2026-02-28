<template>
    <div class="space-y-6">
        <!-- Header -->
        <div class="flex justify-between items-center">
            <div>
                <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Geographic Order Clustering</h2>
                <p class="text-sm text-gray-400 mt-1">Batch orders by geographic area, delivery window & route corridor to reduce empty miles</p>
            </div>
            <div class="flex gap-2">
                <button @click="autoCluster"
                    class="bg-blue-100 dark:bg-blue-500/15 hover:bg-blue-200 dark:hover:bg-blue-500/25 text-blue-700 dark:text-blue-400 border border-blue-300 dark:border-blue-500/30 py-2 px-4 rounded-lg transition-colors flex items-center gap-2 text-sm font-bold">
                    <span class="material-symbols-outlined text-[18px]">auto_awesome</span> Auto-Cluster
                </button>
                <button @click="confirmBatches" :disabled="batchConfirmed"
                    class="bg-primary hover:bg-primary-dark text-black font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors text-sm disabled:opacity-40 disabled:cursor-not-allowed">
                    <span class="material-symbols-outlined text-[18px]">check_circle</span> {{ batchConfirmed ? '✓ Confirmed' : 'Confirm Batches' }}
                </button>
            </div>
        </div>

        <!-- Clustering Stats -->
        <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div class="glass-panel p-4 rounded-xl text-center cursor-pointer hover:border-gray-200 dark:border-white/10 border border-transparent transition-all" @click="showUnbatchedPanel = !showUnbatchedPanel">
                <div class="text-2xl font-bold" :class="unbatchedOrders.length > 0 ? 'text-yellow-400' : 'text-gray-900 dark:text-white'">{{ unbatchedOrders.length }}</div>
                <div class="text-[10px] text-gray-400 uppercase tracking-wider mt-1">Unbatched Orders</div>
                <div v-if="unbatchedOrders.length" class="text-[9px] text-primary mt-1 font-bold">Click to view</div>
            </div>
            <div class="glass-panel p-4 rounded-xl text-center">
                <div class="text-2xl font-bold text-primary">{{ clusters.length }}</div>
                <div class="text-[10px] text-gray-400 uppercase tracking-wider mt-1">Clusters Formed</div>
            </div>
            <div class="glass-panel p-4 rounded-xl text-center">
                <div class="text-2xl font-bold text-green-400">{{ estimatedMilesSaved }}%</div>
                <div class="text-[10px] text-gray-400 uppercase tracking-wider mt-1">Empty Miles Saved</div>
            </div>
            <div class="glass-panel p-4 rounded-xl text-center">
                <div class="text-2xl font-bold text-yellow-400">{{ avgEfficiency }}%</div>
                <div class="text-[10px] text-gray-400 uppercase tracking-wider mt-1">Avg Cluster Efficiency</div>
            </div>
            <div class="glass-panel p-4 rounded-xl text-center">
                <div class="text-2xl font-bold" :class="confirmedCount === clusters.length ? 'text-green-400' : 'text-gray-400'">{{ confirmedCount }}/{{ clusters.length }}</div>
                <div class="text-[10px] text-gray-400 uppercase tracking-wider mt-1">Confirmed</div>
            </div>
        </div>

        <!-- Unbatched Orders Panel -->
        <div v-if="showUnbatchedPanel" class="glass-panel rounded-xl p-5">
            <div class="flex items-center justify-between mb-3">
                <h3 class="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <span class="material-symbols-outlined text-yellow-400 text-[18px]">pending_actions</span>
                    Unbatched Orders ({{ unbatchedOrders.length }})
                </h3>
                <button @click="showUnbatchedPanel = false" class="text-gray-400 hover:text-gray-900 dark:text-white">
                    <span class="material-symbols-outlined text-[18px]">close</span>
                </button>
            </div>
            <div v-if="unbatchedOrders.length === 0" class="text-center py-6 text-gray-500 text-sm">All orders are clustered. No unbatched orders.</div>
            <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                <div v-for="order in unbatchedOrders" :key="order.id"
                    class="p-3 bg-gray-50 dark:bg-white/5 rounded-lg border border-gray-200 dark:border-white/5 hover:border-yellow-500/30 transition-all">
                    <div class="flex justify-between items-start mb-2">
                        <span class="text-xs font-mono text-gray-900 dark:text-white font-bold">{{ order.id }}</span>
                        <span class="px-1.5 py-0.5 rounded text-[9px] font-bold" :class="getPriorityClass(order.priority)">{{ order.priority }}</span>
                    </div>
                    <div class="text-[10px] text-gray-400 mb-2">{{ order.weight }} kg • {{ order.zone || 'Unzoned' }}</div>
                    <div class="flex gap-1">
                        <button v-for="cluster in clusters" :key="cluster.id" @click="addToCluster(cluster, order)"
                            class="flex-1 text-[9px] py-1 rounded font-bold transition-colors"
                            :class="getClusterBtnClass(cluster)">
                            → {{ cluster.zone.split(' ')[0] }}
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Left: Map Visualization -->
            <div class="lg:col-span-2 glass-panel rounded-xl relative overflow-hidden h-[500px]">
                <div class="absolute inset-0 bg-gradient-to-br from-gray-200 dark:from-gray-800 to-gray-100 dark:to-gray-900 opacity-60"></div>

                <!-- Zone labels -->
                <div class="absolute top-4 left-4 z-10 glass-panel px-3 py-2 rounded-lg">
                    <div class="text-xs font-bold text-gray-900 dark:text-white mb-2">DELIVERY ZONES</div>
                    <div class="space-y-1">
                        <div v-for="cluster in clusters" :key="cluster.id" class="flex items-center gap-2 text-xs">
                            <span class="w-3 h-3 rounded-full" :class="cluster.colorClass"></span>
                            <span class="text-gray-600 dark:text-gray-300">{{ cluster.zone }} ({{ cluster.orders.length }} orders)</span>
                        </div>
                    </div>
                </div>

                <!-- Simulated cluster dots -->
                <div v-for="cluster in clusters" :key="cluster.id" class="absolute" :style="cluster.mapPosition">
                    <!-- Cluster boundary circle -->
                    <div class="rounded-full border-2 border-dashed flex items-center justify-center"
                        :class="cluster.borderClass"
                        :style="{ width: cluster.radius + 'px', height: cluster.radius + 'px', opacity: 0.3 }">
                    </div>
                    <!-- Order dots inside cluster -->
                    <div v-for="(dot, di) in cluster.dots" :key="di"
                        class="absolute w-3 h-3 rounded-full border border-gray-200 dark:border-white/50 cursor-pointer hover:scale-150 transition-transform"
                        :class="cluster.dotClass" :style="dot.style" :title="`Order ${dot.orderId}`">
                    </div>
                    <!-- Cluster label -->
                    <div class="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-0.5 rounded text-[9px] font-bold"
                        :class="cluster.labelClass">
                        {{ cluster.zone }}
                    </div>
                </div>

                <!-- Route corridors (SVG lines) -->
                <svg v-show="showCorridors" class="absolute inset-0 w-full h-full pointer-events-none transition-opacity duration-300">
                    <line x1="150" y1="120" x2="350" y2="180" stroke="#1CE783" stroke-width="1.5" stroke-dasharray="4,4" opacity="0.4" />
                    <line x1="350" y1="180" x2="500" y2="300" stroke="#1CE783" stroke-width="1.5" stroke-dasharray="4,4" opacity="0.4" />
                    <line x1="150" y1="350" x2="350" y2="180" stroke="#3B82F6" stroke-width="1.5" stroke-dasharray="4,4" opacity="0.4" />
                </svg>

                <!-- Bottom info bar -->
                <div class="absolute bottom-4 left-4 right-4 bg-white/90 dark:bg-black/80 backdrop-blur rounded-lg p-3 flex justify-between items-center border border-gray-200 dark:border-white/10">
                    <div class="text-xs text-gray-500 dark:text-gray-400">
                        <span class="text-gray-900 dark:text-white font-bold">{{ totalOrdersInClusters }}</span> orders grouped into
                        <span class="text-primary font-bold">{{ clusters.length }}</span> clusters across
                        <span class="text-blue-600 dark:text-blue-400 font-bold">{{ uniqueCorridors }}</span> route corridors
                    </div>
                    <button @click="showCorridors = !showCorridors" class="text-xs text-primary hover:text-primary-dark transition-colors font-bold">{{ showCorridors ? 'Hide' : 'View' }} Route Corridors</button>
                </div>
            </div>

            <!-- Right: Cluster Details -->
            <div class="space-y-4 overflow-y-auto max-h-[500px] no-scrollbar">
                <div v-for="cluster in clusters" :key="cluster.id"
                    class="glass-panel rounded-xl overflow-hidden border border-transparent hover:border-gray-200 dark:border-white/10 transition-all">
                    <div class="p-4 flex items-center justify-between" :class="cluster.headerBg">
                        <div class="flex items-center gap-3">
                            <span class="w-4 h-4 rounded-full" :class="cluster.colorClass"></span>
                            <div>
                                <div class="font-bold text-gray-900 dark:text-white text-sm flex items-center gap-2">
                                    {{ cluster.zone }}
                                    <span v-if="cluster.confirmed" class="px-1.5 py-0.5 bg-green-500/20 text-green-400 rounded text-[9px] font-bold">✓ CONFIRMED</span>
                                </div>
                                <div class="text-[10px] text-gray-400">{{ cluster.corridor }}</div>
                            </div>
                        </div>
                        <div class="text-right">
                            <div class="text-sm font-bold text-gray-900 dark:text-white">{{ cluster.orders.length }} orders</div>
                            <div class="text-[10px] text-gray-400">{{ cluster.totalWeight }} kg</div>
                        </div>
                    </div>

                    <div class="p-3 space-y-2">
                        <!-- Editable cluster metrics -->
                        <div v-if="cluster.editing" class="space-y-2">
                            <div>
                                <label class="text-[10px] text-gray-500 block mb-0.5">Time Window</label>
                                <input v-model="cluster.timeWindow" class="w-full bg-gray-100 dark:bg-black/30 border border-primary/30 rounded px-2 py-1 text-xs text-gray-900 dark:text-white focus:outline-none">
                            </div>
                            <div class="grid grid-cols-2 gap-2">
                                <div>
                                    <label class="text-[10px] text-gray-500 block mb-0.5">Max Distance (km)</label>
                                    <input v-model.number="cluster.totalDistance" type="number" class="w-full bg-gray-100 dark:bg-black/30 border border-primary/30 rounded px-2 py-1 text-xs text-gray-900 dark:text-white focus:outline-none">
                                </div>
                                <div>
                                    <label class="text-[10px] text-gray-500 block mb-0.5">Corridor</label>
                                    <select v-model="cluster.corridor" class="w-full bg-gray-100 dark:bg-black/30 border border-primary/30 rounded px-2 py-1 text-xs text-gray-900 dark:text-white focus:outline-none">
                                        <option>I-95 South Corridor</option>
                                        <option>Highway 9 North</option>
                                        <option>Ring Road East</option>
                                        <option>Urban Core Loop</option>
                                    </select>
                                </div>
                            </div>
                            <div class="flex gap-2">
                                <button v-for="order in cluster.orders" :key="order.id" class="px-2 py-0.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded text-[9px] font-bold transition-colors" @click="removeOrderFromCluster(cluster, order)">
                                    ✕ {{ order.id }}
                                </button>
                            </div>
                        </div>

                        <!-- Read-only cluster metrics -->
                        <div v-else class="grid grid-cols-3 gap-2 text-center">
                            <div class="bg-gray-100 dark:bg-black/20 rounded p-2">
                                <div class="text-[10px] text-gray-500">Distance</div>
                                <div class="text-xs font-bold text-gray-900 dark:text-white">{{ cluster.totalDistance }} km</div>
                            </div>
                            <div class="bg-gray-100 dark:bg-black/20 rounded p-2">
                                <div class="text-[10px] text-gray-500">Window</div>
                                <div class="text-xs font-bold text-gray-900 dark:text-white">{{ cluster.timeWindow }}</div>
                            </div>
                            <div class="bg-gray-100 dark:bg-black/20 rounded p-2">
                                <div class="text-[10px] text-gray-500">Efficiency</div>
                                <div class="text-xs font-bold text-primary">{{ cluster.efficiency }}%</div>
                            </div>
                        </div>

                        <!-- Order list (hidden in edit mode, shown in read mode) -->
                        <div v-if="!cluster.editing" class="space-y-1">
                            <div v-for="order in cluster.orders" :key="order.id"
                                class="flex items-center justify-between p-2 bg-gray-50 dark:bg-white/5 rounded text-xs hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
                                <span class="text-gray-400 font-mono">{{ order.id }}</span>
                                <span class="text-gray-900 dark:text-white">{{ order.weight }} kg</span>
                                <span class="px-1.5 py-0.5 rounded text-[9px] font-bold" :class="getPriorityClass(order.priority)">
                                    {{ order.priority }}
                                </span>
                            </div>
                        </div>

                        <div class="flex gap-2 pt-2">
                            <button @click="assignVehicle(cluster)" class="flex-1 text-xs bg-green-100 dark:bg-primary/10 hover:bg-green-200 dark:hover:bg-primary/20 text-green-700 dark:text-primary py-1.5 rounded font-bold transition-colors">
                                {{ cluster.vehicleAssigned ? '✓ ' + cluster.vehicleAssigned : 'Assign Vehicle' }}
                            </button>
                            <button @click="toggleConfirmCluster(cluster)" class="text-xs py-1.5 px-3 rounded font-bold transition-colors"
                                :class="cluster.confirmed ? 'bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 hover:bg-red-100 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400' : 'bg-yellow-100 dark:bg-yellow-500/10 hover:bg-yellow-200 dark:hover:bg-yellow-500/20 text-yellow-700 dark:text-yellow-400'">
                                {{ cluster.confirmed ? '✓ Confirmed' : 'Confirm' }}
                            </button>
                            <button @click="editCluster(cluster)" class="text-xs bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-600 dark:text-gray-400 py-1.5 px-3 rounded font-bold transition-colors">
                                {{ cluster.editing ? 'Save' : 'Edit' }}
                            </button>
                        </div>
                    </div>
                </div>

                <!-- AI Suggestion -->
                <div class="p-4 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-xl">
                    <div class="flex items-center gap-2 mb-2">
                        <span class="material-symbols-outlined text-blue-500 dark:text-blue-400 text-[18px]">psychology</span>
                        <span class="text-sm font-bold text-blue-600 dark:text-blue-400">AI Clustering Insight</span>
                    </div>
                    <p class="text-xs text-blue-700 dark:text-blue-200">Merging <strong>Downtown</strong> and <strong>Midtown</strong> clusters could reduce total route distance by 18%. Both share the I-95 corridor and have overlapping delivery windows.</p>
                    <button @click="applySuggestion" class="mt-2 text-xs font-bold transition-colors" :class="suggestionApplied ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-white'">
                        {{ suggestionApplied ? '✓ Applied' : 'Apply Suggestion' }}
                    </button>
                </div>
            </div>
        </div>

    <!-- Vehicle Picker Modal -->
    <Teleport to="body">
    <div v-if="showVehiclePicker" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center" @click.self="showVehiclePicker = false">
        <div class="bg-white dark:bg-card-dark rounded-2xl p-6 w-full max-w-sm m-4 border border-gray-200 dark:border-white/10 shadow-2xl">
            <h3 class="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <span class="material-symbols-outlined text-blue-500 dark:text-blue-400">local_shipping</span> Assign Vehicle
            </h3>
            <p class="text-sm text-gray-600 dark:text-gray-300 mb-4">
                Select a vehicle for <strong>{{ vehiclePickerCluster?.zone }}</strong> cluster ({{ vehiclePickerCluster?.orders?.length }} orders, {{ vehiclePickerCluster?.totalWeight }}kg)
            </p>
            <div class="space-y-2 mb-4">
                <button v-for="v in vehicles" :key="v" @click="selectedVehicle = v"
                    class="w-full p-3 rounded-lg border text-sm font-medium text-left flex items-center gap-3 transition-colors"
                    :class="selectedVehicle === v ? 'border-primary bg-green-50 dark:bg-primary/10 text-primary' : 'border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5'">
                    <span class="material-symbols-outlined text-[18px]">local_shipping</span>
                    {{ v }}
                    <span v-if="selectedVehicle === v" class="ml-auto material-symbols-outlined text-primary text-[18px]">check_circle</span>
                </button>
            </div>
            <div class="flex gap-2">
                <button @click="confirmVehicleAssign" :disabled="!selectedVehicle" class="flex-1 bg-primary hover:bg-primary-dark text-black font-bold py-2 rounded-lg text-sm disabled:opacity-40 disabled:cursor-not-allowed transition-colors">Assign</button>
                <button @click="showVehiclePicker = false" class="flex-1 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-900 dark:text-white py-2 rounded-lg text-sm transition-colors">Cancel</button>
            </div>
        </div>
    </div>
</Teleport>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const totalUnbatched = ref(5)
const showVehiclePicker = ref(false)
const vehiclePickerCluster = ref(null)
const selectedVehicle = ref('')
const estimatedMilesSaved = ref(24)
const avgEfficiency = ref(89)
const uniqueCorridors = ref(3)
const batchConfirmed = ref(false)
const showCorridors = ref(false)
const suggestionApplied = ref(false)
const showUnbatchedPanel = ref(false)

const unbatchedOrders = ref([
    { id: 'ORD-4410', weight: 280, priority: 'NORMAL', zone: 'East Side' },
    { id: 'ORD-4411', weight: 150, priority: 'HIGH', zone: 'South Gate' },
    { id: 'ORD-4412', weight: 520, priority: 'LOW', zone: 'Airport Rd' },
    { id: 'ORD-4413', weight: 90, priority: 'URGENT', zone: 'Central' },
    { id: 'ORD-4414', weight: 340, priority: 'NORMAL', zone: 'West Park' },
])

const confirmedCount = computed(() => clusters.value.filter(c => c.confirmed).length)

const clusters = ref([
    {
        id: 1,
        zone: 'Downtown Core',
        corridor: 'I-95 South Corridor',
        confirmed: false,
        colorClass: 'bg-green-500',
        borderClass: 'border-green-500',
        dotClass: 'bg-green-500',
        labelClass: 'bg-green-500/20 text-green-400',
        headerBg: 'bg-green-500/5',
        mapPosition: { top: '80px', left: '120px' },
        radius: 100,
        totalWeight: 670,
        totalDistance: 28,
        timeWindow: '14:00-17:00',
        efficiency: 92,
        dots: [
            { orderId: 'ORD-9921', style: { top: '20px', left: '30px' } },
            { orderId: 'ORD-8843', style: { top: '40px', left: '60px' } },
            { orderId: 'ORD-5541', style: { top: '55px', left: '25px' } },
        ],
        orders: [
            { id: 'ORD-9921', weight: 450, priority: 'HIGH' },
            { id: 'ORD-8843', weight: 75, priority: 'URGENT' },
            { id: 'ORD-5541', weight: 200, priority: 'NORMAL' },
        ],
        editing: false,
        vehicleAssigned: ''
    },
    {
        id: 2,
        zone: 'North Industrial',
        corridor: 'Highway 9 North',
        confirmed: false,
        colorClass: 'bg-blue-500',
        borderClass: 'border-blue-500',
        dotClass: 'bg-blue-500',
        labelClass: 'bg-blue-500/20 text-blue-400',
        headerBg: 'bg-blue-500/5',
        mapPosition: { top: '250px', left: '300px' },
        radius: 80,
        totalWeight: 1760,
        totalDistance: 42,
        timeWindow: '15:00-19:00',
        efficiency: 87,
        dots: [
            { orderId: 'ORD-7712', style: { top: '15px', left: '20px' } },
            { orderId: 'ORD-2210', style: { top: '35px', left: '45px' } },
        ],
        orders: [
            { id: 'ORD-7712', weight: 1200, priority: 'HIGH' },
            { id: 'ORD-2210', weight: 560, priority: 'HIGH' },
        ],
        editing: false,
        vehicleAssigned: ''
    },
    {
        id: 3,
        zone: 'Suburban West',
        corridor: 'I-95 South Corridor',
        confirmed: false,
        colorClass: 'bg-purple-500',
        borderClass: 'border-purple-500',
        dotClass: 'bg-purple-500',
        labelClass: 'bg-purple-500/20 text-purple-400',
        headerBg: 'bg-purple-500/5',
        mapPosition: { top: '300px', left: '80px' },
        radius: 70,
        totalWeight: 460,
        totalDistance: 35,
        timeWindow: '10:00-14:00',
        efficiency: 91,
        dots: [
            { orderId: 'ORD-3321', style: { top: '15px', left: '20px' } },
            { orderId: 'ORD-6654', style: { top: '30px', left: '40px' } },
        ],
        orders: [
            { id: 'ORD-3321', weight: 120, priority: 'URGENT' },
            { id: 'ORD-6654', weight: 340, priority: 'LOW' },
        ],
        editing: false,
        vehicleAssigned: ''
    }
])

const totalOrdersInClusters = computed(() => clusters.value.reduce((sum, c) => sum + c.orders.length, 0))

function getPriorityClass(priority) {
    const map = {
        URGENT: 'bg-red-500/20 text-red-400',
        HIGH: 'bg-orange-500/20 text-orange-400',
        NORMAL: 'bg-blue-500/20 text-blue-400',
        LOW: 'bg-gray-500/20 text-gray-400'
    }
    return map[priority] || map.NORMAL
}

function autoCluster() {
    // Move all unbatched into clusters round-robin
    unbatchedOrders.value.forEach((order, i) => {
        const target = clusters.value[i % clusters.value.length]
        target.orders.push(order)
        target.totalWeight += order.weight
    })
    unbatchedOrders.value = []
    estimatedMilesSaved.value = 32
    avgEfficiency.value = 94
}

function confirmBatches() {
    clusters.value.forEach(c => { c.confirmed = true })
    batchConfirmed.value = true
}

const vehicles = ['Van T-15', 'Van T-20', 'Truck M', 'Truck XL']
function assignVehicle(cluster) {
    vehiclePickerCluster.value = cluster
    selectedVehicle.value = cluster.vehicleAssigned || ''
    showVehiclePicker.value = true
}

function confirmVehicleAssign() {
    if (vehiclePickerCluster.value && selectedVehicle.value) {
        vehiclePickerCluster.value.vehicleAssigned = selectedVehicle.value
        showVehiclePicker.value = false
    }
}

function editCluster(cluster) {
    if (cluster.editing) {
        // Saving — recalculate weight & boost efficiency
        cluster.totalWeight = cluster.orders.reduce((s, o) => s + o.weight, 0)
        cluster.efficiency = Math.min(99, cluster.efficiency + 2)
    }
    cluster.editing = !cluster.editing
}

function removeOrderFromCluster(cluster, order) {
    cluster.orders = cluster.orders.filter(o => o.id !== order.id)
    cluster.dots = cluster.dots.slice(0, cluster.orders.length)
    cluster.totalWeight = cluster.orders.reduce((s, o) => s + o.weight, 0)
    unbatchedOrders.value.push({ ...order, zone: cluster.zone })
    cluster.confirmed = false
    batchConfirmed.value = false
}

function addToCluster(cluster, order) {
    cluster.orders.push(order)
    cluster.totalWeight += order.weight
    unbatchedOrders.value = unbatchedOrders.value.filter(o => o.id !== order.id)
}

function applySuggestion() {
    suggestionApplied.value = true
    estimatedMilesSaved.value = 38
    avgEfficiency.value = 96
}

function toggleConfirmCluster(cluster) {
    cluster.confirmed = !cluster.confirmed
    batchConfirmed.value = clusters.value.every(c => c.confirmed)
}

function getClusterBtnClass(cluster) {
    const map = {
        'bg-green-500': 'bg-green-100 dark:bg-green-500/10 hover:bg-green-200 dark:hover:bg-green-500/20 text-green-700 dark:text-green-400',
        'bg-blue-500': 'bg-blue-100 dark:bg-blue-500/10 hover:bg-blue-200 dark:hover:bg-blue-500/20 text-blue-700 dark:text-blue-400',
        'bg-purple-500': 'bg-purple-100 dark:bg-purple-500/10 hover:bg-purple-200 dark:hover:bg-purple-500/20 text-purple-700 dark:text-purple-400',
    }
    return map[cluster.colorClass] || 'bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-700 dark:text-gray-300'
}
</script>
