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
                        <h4 class="text-sm font-bold text-gray-900 dark:text-white mb-2">Unassigned Orders ({{ overrideOrders.length }})</h4>
                        <div class="bg-gray-100 dark:bg-black/20 rounded p-2 text-xs text-gray-600 dark:text-gray-400 h-32 overflow-y-auto no-scrollbar">
                            <div v-if="overrideOrders.length === 0" class="text-center py-4 text-gray-500">No pending orders</div>
                            <div v-for="order in overrideOrders" :key="order.id" class="flex justify-between py-1 border-b border-gray-200 dark:border-white/5">
                                <span>{{ order.id }}</span>
                                <span :class="order.priority === 'URGENT' ? 'text-red-400' : order.priority === 'HIGH' ? 'text-yellow-400' : 'text-gray-500'">{{ order.priority || 'Normal' }}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Route legend (shown after optimization) -->
                    <div v-if="optimizedRoutes.length > 0" class="pt-4 border-t border-gray-200 dark:border-white/5">
                        <div class="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-2">Driver Routes</div>
                        <div class="space-y-1.5">
                            <div v-for="route in optimizedRoutes" :key="route.driver_id" class="space-y-0.5">
                                <div class="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300">
                                    <span class="w-3 h-3 rounded-full flex-shrink-0" :style="{ backgroundColor: route.color }"></span>
                                    <span class="font-medium truncate">{{ route.driver_name }}</span>
                                    <span class="ml-auto text-gray-500 flex-shrink-0">{{ route.stops.length }} stops</span>
                                </div>
                                <div v-for="(stop, si) in route.stops" :key="stop.order_id" class="flex items-center gap-1.5 pl-5 text-[10px] text-gray-500">
                                    <span class="font-mono">{{ si + 1 }}.</span>
                                    <span class="truncate flex-1">{{ stop.tracking_code }}</span>
                                    <span v-if="stop.priority === 'URGENT'" class="text-red-400 font-bold">URGENT</span>
                                    <span v-else-if="stop.priority === 'HIGH'" class="text-yellow-500 font-bold">EXPRESS</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Map Result Visualization -->
            <div class="lg:col-span-2 glass-panel rounded-xl relative overflow-hidden flex flex-col">

                <!-- Loading overlay -->
                <div v-if="optimizing" class="absolute inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div class="flex flex-col items-center gap-3">
                        <span class="material-symbols-outlined animate-spin text-primary text-4xl">progress_activity</span>
                        <span class="text-white font-bold text-sm">Calculating optimal routes…</span>
                    </div>
                </div>

                <!-- Leaflet Map Container -->
                <div ref="mapContainer" style="width:100%;height:100%;min-height:400px;z-index:0;"></div>

                <!-- ETA Generation Panel -->
                <div class="absolute top-4 left-4 z-10 bg-white/90 dark:bg-black/80 backdrop-blur border border-gray-200 dark:border-white/10 rounded-xl p-4 w-64">
                    <div class="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-2">ETA Generation</div>
                    <div v-if="routesApplied" class="space-y-2 text-xs">
                        <div class="flex justify-between"><span class="text-gray-500 dark:text-gray-400">Routes</span><span class="text-gray-900 dark:text-white font-mono">{{ routeStats.routes }} active</span></div>
                        <div class="flex justify-between"><span class="text-gray-500 dark:text-gray-400">Total Distance</span><span class="text-gray-900 dark:text-white font-mono">{{ routeStats.distance }} km</span></div>
                        <div class="pt-1 border-t border-gray-200 dark:border-white/10 flex justify-between">
                            <span class="text-gray-500 dark:text-gray-400">Efficiency</span>
                            <span class="text-primary font-bold font-mono">{{ routeStats.efficiency }}%</span>
                        </div>
                    </div>
                    <div v-else class="text-xs text-gray-500 text-center py-2">Run optimizer to generate ETAs</div>
                    <div class="mt-2 text-[9px] text-gray-500">Shared with: Driver, AI Customer Support</div>
                </div>

                <!-- Results Summary Overlay -->
                <div
                    class="absolute bottom-6 left-6 right-6 bg-white/90 dark:bg-black/80 backdrop-blur-md rounded-lg p-4 border border-gray-200 dark:border-white/10 flex justify-between items-center z-10">
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
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { ref, reactive, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useDispatcherStore } from '@/stores/dispatcherStore'
import { useLogisticStore } from '@/stores/logisticStore'
import { API_BASE_URL, getStoredAccessToken } from '@/config/api'

// Fix Leaflet default marker icon paths broken by Vite
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
    iconRetinaUrl: new URL('leaflet/dist/images/marker-icon-2x.png', import.meta.url).href,
    iconUrl: new URL('leaflet/dist/images/marker-icon.png', import.meta.url).href,
    shadowUrl: new URL('leaflet/dist/images/marker-shadow.png', import.meta.url).href,
})

const store = useDispatcherStore()
const logisticStore = useLogisticStore()

// ── Map ────────────────────────────────────────────────────────────────────
const mapContainer = ref(null)
let mapInstance = null
let routePolylines = []
let stopMarkers = []
let hubMarker = null

// Get hub location dynamically from active warehouse
const hubLocation = computed(() => {
    const activeWarehouse = logisticStore.activeWarehouse
    const activeHub = store.hubs.find(h => h.id === activeWarehouse) || store.hubs[0]
    if (activeHub?.coordinates) {
        // Parse coordinates if stored as string "lat,lng"
        if (typeof activeHub.coordinates === 'string') {
            const [lat, lng] = activeHub.coordinates.split(',').map(Number)
            return [lat, lng]
        }
        // If stored as array [lat, lng]
        if (Array.isArray(activeHub.coordinates)) {
            return activeHub.coordinates
        }
        // If stored as object {lat, lng}
        if (activeHub.coordinates.lat && activeHub.coordinates.lng) {
            return [activeHub.coordinates.lat, activeHub.coordinates.lng]
        }
    }
    // Fallback to Bangalore if no hub coordinates found
    return [12.9716, 77.5946]
})

const hubName = computed(() => {
    const activeWarehouse = logisticStore.activeWarehouse
    const activeHub = store.hubs.find(h => h.id === activeWarehouse) || store.hubs[0]
    return activeHub?.name || 'Warehouse Hub'
})

onMounted(async () => {
    await store.initialize().catch(() => {})
    await nextTick()
    if (mapContainer.value) {
        mapInstance = L.map(mapContainer.value, { zoomControl: true }).setView(hubLocation.value, 11)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            maxZoom: 18,
        }).addTo(mapInstance)
        // Hub marker
        hubMarker = L.marker(hubLocation.value)
            .bindPopup(`<b>${hubName.value}</b><br><span style="color:#6b7280">Distribution Center</span>`)
            .addTo(mapInstance)
    }
})

// Update hub marker when warehouse changes
watch(hubLocation, (newLoc) => {
    if (mapInstance && hubMarker) {
        hubMarker.setLatLng(newLoc)
        hubMarker.setPopupContent(`<b>${hubName.value}</b><br><span style="color:#6b7280">Distribution Center</span>`)
        mapInstance.setView(newLoc, 11)
    }
})

onBeforeUnmount(() => {
    if (mapInstance) {
        mapInstance.remove()
        mapInstance = null
    }
})

function clearMapLayers() {
    routePolylines.forEach(l => l.remove())
    stopMarkers.forEach(m => m.remove())
    routePolylines = []
    stopMarkers = []
}

function drawRoutes(routes) {
    if (!mapInstance) return
    clearMapLayers()
    const hub = hubLocation.value
    const allCoords = [hub]
    routes.forEach(route => {
        const stopCoords = route.stops.map(s => [s.lat, s.lng])
        const coords = [hub, ...stopCoords, hub]
        const line = L.polyline(coords, { color: route.color, weight: 3, opacity: 0.85 }).addTo(mapInstance)
        routePolylines.push(line)
        route.stops.forEach((stop, si) => {
            const marker = L.marker([stop.lat, stop.lng])
                .bindPopup(
                    `<div style="min-width:160px">` +
                    `<b style="color:${route.color}">Stop ${si + 1} — ${route.driver_name}</b><br>` +
                    `<code>${stop.tracking_code}</code><br>` +
                    `<span style="color:#6b7280">${stop.address}</span>` +
                    `</div>`
                )
                .addTo(mapInstance)
            stopMarkers.push(marker)
            allCoords.push([stop.lat, stop.lng])
        })
    })
    if (allCoords.length > 1) {
        mapInstance.fitBounds(L.latLngBounds(allCoords).pad(0.15))
    }
}

// ── UI state ───────────────────────────────────────────────────────────────
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
    vehicleSize: true,
})

const routeStats = reactive({ routes: 0, distance: 0, efficiency: 0 })

const adjustForm = reactive({
    routes: 0,
    distance: 0,
    efficiency: 0,
    priority: 'Balanced',
})

// ── Optimized routes from backend ─────────────────────────────────────────
const optimizedRoutes = ref([])

watch(optimizedRoutes, (routes) => {
    nextTick(() => drawRoutes(routes))
})

// ── Orders list for override panel ────────────────────────────────────────
const overrideOrders = ref([])

watch(() => store.pendingOrders, (list) => {
    overrideOrders.value = list.map(o => ({ id: o.id, priority: o.priority, reassigned: false, assignedTo: '' }))
}, { immediate: true })

const availableDrivers = computed(() =>
    store.dispatcherDrivers.map(d => ({ id: d.id, name: d.name, load: d.load || 0 }))
)

// ── Auth headers ──────────────────────────────────────────────────────────
function authHeaders() {
    const token = getStoredAccessToken()
    return token
        ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
        : { 'Content-Type': 'application/json' }
}

// ── Run optimizer ─────────────────────────────────────────────────────────
async function runOptimizer() {
    if (store.pendingOrders.length === 0) {
        showToast('⚠️ No pending orders to optimize')
        return
    }

    optimizing.value = true
    routesApplied.value = false
    try {
        // Build query parameters from optimization settings
        const params = new URLSearchParams()

        // Map optimization goal to backend parameter
        if (optimizationGoal.value === 'Minimize Time') {
            params.append('optimize_for', 'time')
        } else if (optimizationGoal.value === 'Balance Workload') {
            params.append('optimize_for', 'balance')
        } else if (optimizationGoal.value === 'Minimize Empty Miles') {
            params.append('optimize_for', 'empty_miles')
        } else {
            params.append('optimize_for', 'distance')
        }

        // Add constraints
        if (constraints.avoidTolls) params.append('avoid_tolls', 'true')
        if (constraints.prioritizeVIP) params.append('prioritize_vip', 'true')
        if (constraints.evRouting) params.append('ev_routing', 'true')
        if (constraints.respectNoGo) params.append('respect_no_go', 'true')
        if (constraints.hosCompliance) params.append('hos_compliance', 'true')
        if (constraints.vehicleSize) params.append('vehicle_size_check', 'true')

        const res = await fetch(`${API_BASE_URL}/api/v1/orders/optimize-routes?${params.toString()}`, {
            method: 'POST',
            headers: authHeaders(),
        })
        if (res.ok) {
            const data = await res.json()
            if (!data || data.length === 0) {
                showToast('⚠️ No optimal routes found')
                optimizing.value = false
                return
            }
            optimizedRoutes.value = data
            routeStats.routes = data.length
            routeStats.distance = parseFloat(
                data.reduce((s, r) => s + (r.total_distance_km || 0), 0).toFixed(1)
            )
            routeStats.efficiency = data.length > 0
                ? Math.round(data.reduce((s, r) => s + (r.efficiency || 0), 0) / data.length)
                : 0
            adjustForm.routes = routeStats.routes
            adjustForm.distance = routeStats.distance
            adjustForm.efficiency = routeStats.efficiency
            showToast(`✓ ${data.length} optimal route(s) generated`)
        } else {
            const err = await res.json().catch(() => ({}))
            showToast('✗ ' + (err.detail || 'Optimization failed. Please try again.'))
        }
    } catch (err) {
        console.error('Optimization error:', err)
        showToast('✗ Cannot reach server. Is the backend running?')
    }
    optimizing.value = false
}

function applyRoutes() {
    if (optimizedRoutes.value.length === 0) {
        showToast('⚠️ No routes to apply')
        return
    }
    routesApplied.value = true
    showToast('✓ Routes applied and ETAs generated')
}

async function confirmAdjust() {
    showAdjustModal.value = false
    // Re-run optimizer with adjusted parameters
    routeStats.routes = adjustForm.routes
    routeStats.distance = adjustForm.distance
    routeStats.efficiency = adjustForm.efficiency
    routesApplied.value = false

    // Re-run optimization with new constraints
    await runOptimizer()
}

function setEmergencyPriority() {
    emergencySet.value = true
    // Set all unassigned orders to high priority
    overrideOrders.value.forEach(order => {
        if (!order.reassigned) {
            order.priority = 'URGENT'
        }
    })
    showToast('Emergency priority set for all unassigned orders')
}

function reorderStops() {
    stopsReordered.value = true
    // Re-optimize current routes to reorder stops efficiently
    if (optimizedRoutes.value.length > 0) {
        runOptimizer().then(() => {
            showToast('Stops reordered for optimal sequence')
        })
    } else {
        showToast('No active routes to reorder')
    }
}

// ── Drag & Drop ───────────────────────────────────────────────────────────
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
    const order = overrideOrders.value.find(o => o.id === draggedOrder.value.id)
    if (order && !order.reassigned) {
        // Call backend API to assign order to driver
        assignOrderToDriver(order.id, driver.id, driver.name)
            .then(success => {
                if (success) {
                    order.reassigned = true
                    order.assignedTo = driver.name
                    driver.load = Math.min(100, driver.load + 10)
                    showToast(`✓ ${order.id} reassigned to ${driver.name}`)
                } else {
                    showToast(`✗ Failed to assign ${order.id}`)
                }
            })
    }
    draggedOrder.value = null
}

async function assignOrderToDriver(orderId, driverId, driverName) {
    try {
        const res = await fetch(`${API_BASE_URL}/api/v1/orders/${orderId}/assign`, {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify({ driver_id: driverId })
        })
        if (res.ok) {
            // Refresh orders after assignment
            await store.fetchOrders()
            await store.fetchActiveOrders()
            return true
        }
        return false
    } catch (err) {
        console.error('Failed to assign order:', err)
        return false
    }
}

function showToast(msg) {
    reassignToast.value = msg
    setTimeout(() => { reassignToast.value = '' }, 3000)
}
</script>
