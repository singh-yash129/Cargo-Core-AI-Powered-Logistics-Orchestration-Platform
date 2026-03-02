<template>
    <div class="space-y-6">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span class="material-symbols-outlined text-green-500">gps_fixed</span> Real-Time Tracking
        </h2>

        <!-- Active Orders Selector -->
        <div v-if="displayOrders.length > 1" class="flex overflow-x-auto gap-4 pb-2 scrollbar-hide"
            @wheel="handleHorizontalScroll" ref="scrollContainer"
            style="scrollbar-width: none;max-width: calc(100vw - 2rem);">
            <button v-for="order in displayOrders" :key="order.id" @click="selectOrder(order.id)"
                class="flex-none px-4 py-3 rounded-xl border transition-all text-left min-w-[240px]"
                :class="selectedOrderId === order.id ? 'bg-green-50 dark:bg-green-900/20 border-green-500' : 'bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 hover:border-green-500/50'">
                <div class="flex justify-between items-center mb-1.5">
                    <span class="font-bold text-sm font-mono"
                        :class="selectedOrderId === order.id ? 'text-green-700 dark:text-green-400' : 'text-gray-900 dark:text-white'">{{
                            order.id }}</span>
                    <span
                        class="text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400 font-bold uppercase">{{
                            order.status.replace('-', ' ') }}</span>
                </div>
                <div class="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[200px]"><span
                        class="font-medium">{{ order.cargoType }}</span></div>
                <div class="text-xs text-gray-400 dark:text-gray-500 truncate max-w-[200px] mt-0.5">{{
                    order.pickup.split(',')[0] }} → {{ order.destination.split(',')[0] }}</div>
            </button>
        </div>

        <div v-if="activeMove" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Map Area -->
            <div class="lg:col-span-2 space-y-4">
                <div class="glass-panel rounded-xl overflow-hidden">
                    <div
                        class="h-72 sm:h-96 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-900 relative">
                        <div class="absolute inset-0 flex items-center justify-center">
                            <div class="text-center"><span
                                    class="material-symbols-outlined text-6xl text-gray-400 dark:text-gray-600">map</span>
                                <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">Live GPS Map</p>
                            </div>
                        </div>
                        <div
                            class="absolute top-3 left-3 bg-white/90 dark:bg-black/80 backdrop-blur-sm px-4 py-2 rounded-lg shadow-sm">
                            <div class="text-[10px] text-gray-500 uppercase font-bold">ETA</div>
                            <div class="text-lg font-bold text-green-600 dark:text-green-400">{{ activeMove.eta ||
                                'Calculating...' }}</div>
                        </div>
                        <div
                            class="absolute top-3 right-3 bg-white/90 dark:bg-black/80 backdrop-blur-sm px-4 py-2 rounded-lg shadow-sm">
                            <div class="text-[10px] text-gray-500 uppercase font-bold">Progress</div>
                            <div class="text-lg font-bold text-blue-600 dark:text-blue-400">{{ activeMove.progress }}%
                            </div>
                        </div>
                        <div v-if="geofenceAlert"
                            class="absolute bottom-3 left-3 right-3 bg-green-600 text-white px-4 py-3 rounded-lg flex items-center gap-3 animate-pulse shadow-lg">
                            <span class="material-symbols-outlined">location_on</span>
                            <div>
                                <div class="text-sm font-bold">Crew Arriving!</div>
                                <div class="text-xs">Your driver is within 50 meters of the pickup location.</div>
                            </div>
                        </div>
                    </div>
                    <div class="p-4 border-t border-gray-200 dark:border-white/5">
                        <div class="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
                            <span>Pickup</span><span>In Transit</span><span>Delivered</span>
                        </div>
                        <div class="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                            <div class="bg-green-500 h-full rounded-full transition-all duration-500"
                                :style="{ width: activeMove.progress + '%' }"></div>
                        </div>
                    </div>
                </div>

                <!-- Dwell Time Card -->
                <div v-if="activeMove.dwellTime && activeMove.dwellTime.total > 0"
                    class="glass-panel p-4 sm:p-5 rounded-xl">
                    <h3 class="font-bold text-gray-900 dark:text-white mb-3 text-sm flex items-center gap-2">
                        <span class="material-symbols-outlined text-purple-500 text-lg">timer</span> Dwell Time Log
                    </h3>
                    <div class="grid grid-cols-3 gap-3">
                        <div
                            class="p-3 bg-blue-50 dark:bg-blue-500/5 rounded-lg text-center border border-blue-200 dark:border-blue-500/20">
                            <div class="text-xs text-gray-500 dark:text-gray-400">Loading</div>
                            <div class="text-xl font-bold text-blue-600 dark:text-blue-400">{{
                                activeMove.dwellTime.loading }}<span class="text-xs font-normal"> min</span></div>
                        </div>
                        <div
                            class="p-3 bg-amber-50 dark:bg-amber-500/5 rounded-lg text-center border border-amber-200 dark:border-amber-500/20">
                            <div class="text-xs text-gray-500 dark:text-gray-400">Unloading</div>
                            <div class="text-xl font-bold text-amber-600 dark:text-amber-400">{{
                                activeMove.dwellTime.unloading }}<span class="text-xs font-normal"> min</span></div>
                        </div>
                        <div
                            class="p-3 bg-purple-50 dark:bg-purple-500/5 rounded-lg text-center border border-purple-200 dark:border-purple-500/20">
                            <div class="text-xs text-gray-500 dark:text-gray-400">Total Dwell</div>
                            <div class="text-xl font-bold text-purple-600 dark:text-purple-400">{{
                                activeMove.dwellTime.total }}<span class="text-xs font-normal"> min</span></div>
                        </div>
                    </div>
                </div>

                <!-- Transport Log Timeline -->
                <div class="glass-panel p-4 sm:p-5 rounded-xl">
                    <h3 class="font-bold text-gray-900 dark:text-white mb-4 text-sm flex items-center gap-2">
                        <span class="material-symbols-outlined text-blue-500 text-lg">timeline</span> Transport Log
                    </h3>
                    <div class="relative pl-8">
                        <div class="absolute left-[11px] top-2 bottom-0 w-[2px] bg-gray-200 dark:bg-white/10"></div>
                        <div v-for="(log, i) in activeMove.transportLog" :key="i" class="relative pb-5 last:pb-0">
                            <div class="absolute -left-8 top-0 w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px]"
                                :style="{ backgroundColor: logColor(log.color) }">
                                <span class="material-symbols-outlined text-[12px]">{{ log.icon }}</span>
                            </div>
                            <div class="ml-0">
                                <div class="text-sm font-medium text-gray-900 dark:text-white">{{ log.event }}</div>
                                <div class="text-xs text-gray-500 dark:text-gray-400 font-mono">{{ log.time }}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Details Sidebar -->
            <div class="space-y-4">
                <!-- Driver Card -->
                <div class="glass-panel p-4 sm:p-5 rounded-xl" v-if="activeMove.driver">
                    <h3 class="font-bold text-gray-900 dark:text-white mb-3 text-sm">Driver & Crew</h3>
                    <div class="flex items-center gap-3 mb-3">
                        <div
                            class="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white font-bold text-sm">
                            {{activeMove.driver.name.split(' ').map(n => n[0]).join('')}}
                        </div>
                        <div>
                            <div class="font-bold text-gray-900 dark:text-white">{{ activeMove.driver.name }}</div>
                            <div class="text-xs text-gray-500 dark:text-gray-400">{{ activeMove.driver.rating }} ★ ·
                                Team Lead</div>
                        </div>
                    </div>
                    <div class="flex gap-2 mb-3">
                        <button
                            class="flex-1 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-1"><span
                                class="material-symbols-outlined text-sm">call</span> Call</button>
                        <button
                            class="flex-1 py-2 bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-white text-sm font-bold rounded-lg hover:bg-gray-200 dark:hover:bg-white/20 transition-colors flex items-center justify-center gap-1"><span
                                class="material-symbols-outlined text-sm">chat</span> Chat</button>
                    </div>
                    <!-- Crew Check-in -->
                    <div v-if="activeMove.crewCheckin" class="space-y-2">
                        <div class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Crew Check-In</div>
                        <div v-for="laborer in activeMove.crewCheckin.laborers" :key="laborer.name"
                            class="flex items-center justify-between text-xs p-2 bg-gray-50 dark:bg-white/5 rounded-lg">
                            <span class="text-gray-900 dark:text-white font-medium">{{ laborer.name }}</span>
                            <span v-if="laborer.checkedIn"
                                class="text-green-500 font-bold flex items-center gap-1"><span
                                    class="material-symbols-outlined text-xs">check_circle</span>Checked In</span>
                            <span v-else class="text-red-500 font-bold">Absent</span>
                        </div>
                    </div>
                </div>

                <!-- Vehicle Info -->
                <div class="glass-panel p-4 sm:p-5 rounded-xl">
                    <h3 class="font-bold text-gray-900 dark:text-white mb-3 text-sm">Vehicle & Order</h3>
                    <div class="space-y-2 text-sm">
                        <div class="flex justify-between"><span class="text-gray-500 dark:text-gray-400">Order
                                ID</span><span class="font-mono font-bold text-green-600 dark:text-green-400">{{
                                    activeMove.id }}</span></div>
                        <div class="flex justify-between"><span
                                class="text-gray-500 dark:text-gray-400">Vehicle</span><span
                                class="text-gray-900 dark:text-white font-medium uppercase">{{ activeMove.vehicleType
                                }}</span></div>
                        <div class="flex justify-between"><span
                                class="text-gray-500 dark:text-gray-400">Cargo</span><span
                                class="text-gray-900 dark:text-white font-medium">{{ activeMove.cargoType }}</span>
                        </div>
                        <div class="flex justify-between"><span class="text-gray-500 dark:text-gray-400">Service
                                Block</span><span class="text-purple-600 dark:text-purple-400 font-medium">{{
                                    activeMove.serviceTimeBlock }}</span></div>
                        <div class="flex justify-between"><span
                                class="text-gray-500 dark:text-gray-400">Helpers</span><span
                                class="text-gray-900 dark:text-white font-medium">{{ activeMove.laborCount }}
                                assigned</span></div>
                    </div>
                </div>

                <!-- Before/After Photos -->
                <div v-if="activeMove.beforeAfterPhotos && Object.keys(activeMove.beforeAfterPhotos).length > 0"
                    class="glass-panel p-4 sm:p-5 rounded-xl">
                    <h3 class="font-bold text-gray-900 dark:text-white mb-3 text-sm flex items-center gap-2">
                        <span class="material-symbols-outlined text-amber-500 text-lg">photo_camera</span> Move Photos
                    </h3>
                    <div class="space-y-2">
                        <div v-for="(val, key) in activeMove.beforeAfterPhotos" :key="key"
                            class="flex items-center justify-between p-2 bg-gray-50 dark:bg-white/5 rounded-lg text-xs">
                            <span class="text-gray-700 dark:text-gray-300 font-medium capitalize">{{
                                key.replace(/([A-Z])/g, ' $1') }}</span>
                            <span :class="val ? 'text-green-500' : 'text-gray-400'">{{ val || 'Pending' }}</span>
                        </div>
                    </div>
                </div>

                <!-- Service Checklist -->
                <div class="glass-panel p-4 sm:p-5 rounded-xl">
                    <h3 class="font-bold text-gray-900 dark:text-white mb-3 text-sm flex items-center gap-2">
                        <span class="material-symbols-outlined text-purple-500 text-lg">checklist</span> Service
                        Checklist
                    </h3>
                    <div class="space-y-2">
                        <div v-for="task in serviceChecklist" :key="task.text" class="flex items-center gap-3 text-sm">
                            <span class="material-symbols-outlined text-lg"
                                :class="task.done ? 'text-green-500' : 'text-gray-300 dark:text-gray-600'">{{ task.done
                                    ? 'check_circle' : 'radio_button_unchecked' }}</span>
                            <span :class="task.done ? 'text-gray-400 line-through' : 'text-gray-900 dark:text-white'">{{
                                task.text }}</span>
                        </div>
                    </div>
                </div>

                <button @click="toggleGeofence"
                    class="w-full py-2.5 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-white text-sm font-bold rounded-lg transition-colors flex items-center justify-center gap-2 border border-gray-200 dark:border-white/5">
                    <span class="material-symbols-outlined text-sm">{{ geofenceAlert ? 'notifications_active' :
                        'notifications' }}</span>
                    {{ geofenceAlert ? 'Geofence Alert Active' : 'Simulate Arrival Alert' }}
                </button>
            </div>
        </div>

        <div v-else class="glass-panel p-12 rounded-xl text-center text-gray-500 dark:text-gray-400">
            <span class="material-symbols-outlined text-5xl block mb-3">location_off</span>
            <p class="font-medium text-lg">No active move to track.</p>
            <router-link to="/individual/book-move"
                class="text-green-600 dark:text-green-400 text-sm font-bold hover:underline mt-2 inline-block">Book a
                Move →</router-link>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useIndividualStore } from '@/stores/individualStore'

const route = useRoute()
const router = useRouter()
const store = useIndividualStore()

const allOrders = computed(() => store.orders)

const displayOrders = computed(() => {
    if (route.query.orderId) {
        return allOrders.value.filter(o => o.id === route.query.orderId)
    }
    return allOrders.value
})

const selectedOrderId = ref(route.query.orderId || (allOrders.value.length > 0 ? allOrders.value[0].id : null))

watch(() => route.query.orderId, (newId) => {
    if (newId) {
        selectedOrderId.value = newId
    } else if (!selectedOrderId.value && allOrders.value.length > 0) {
        selectedOrderId.value = allOrders.value[0].id
    }
}, { immediate: true })

const activeMove = computed(() => {
    return allOrders.value.find(o => o.id === selectedOrderId.value) || allOrders.value[0] || null
})

function selectOrder(id) {
    selectedOrderId.value = id
    // We don't push the route query here if they are in 'all orders' mode
    // because doing so would filter the list down to 1 item inside displayOrders.
    // So we just update the local state.
}
const geofenceAlert = ref(false)

function toggleGeofence() { geofenceAlert.value = !geofenceAlert.value }
function logColor(c) { return { green: '#22c55e', blue: '#3b82f6', amber: '#f59e0b', purple: '#a855f7', red: '#ef4444' }[c] || '#6b7280' }

const scrollContainer = ref(null)
function handleHorizontalScroll(e) {
    if (scrollContainer.value) {
        // If vertical scroll (mouse wheel), map to horizontal
        if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
            e.preventDefault()
            scrollContainer.value.scrollLeft += e.deltaY > 0 ? 100 : -100
        }
        // If horizontal scroll (trackpad), let browser handle it natively
    }
}

const serviceChecklist = ref([
    { text: 'Arrive at pickup location', done: true },
    { text: 'Check-in laborers', done: true },
    { text: 'Before-packing photos captured', done: true },
    { text: 'Pack kitchen utensils', done: false },
    { text: 'Move sofa to 2nd floor', done: false },
    { text: 'Handle fragile items carefully', done: false },
    { text: 'After-packing photos captured', done: false },
    { text: 'Complete PoD and signatures', done: false },
])
</script>
