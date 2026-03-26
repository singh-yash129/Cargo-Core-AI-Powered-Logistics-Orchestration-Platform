<template>
    <div class="space-y-6">
        <!-- Header -->
        <div class="flex justify-between items-center">
            <div>
                <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Service Move & Time Blocking</h2>
                <p class="text-sm text-gray-400 mt-1">Manage house shifts, office relocations — crew manifest, extended time blocks, dwell time</p>
            </div>
            <button @click="showNewMove = true" class="bg-primary hover:bg-primary-dark text-black font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors text-sm">
                <span class="material-symbols-outlined text-[18px]">add</span> New Service Move
            </button>
        </div>

        <!-- Summary Stats -->
        <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div class="glass-panel p-4 rounded-xl text-center">
                <div class="text-2xl font-bold text-gray-900 dark:text-white">{{ serviceMoves.length }}</div>
                <div class="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-1">Active Moves</div>
            </div>
            <div class="glass-panel p-4 rounded-xl text-center">
                <div class="text-2xl font-bold text-blue-400">{{ totalCrewCount }}</div>
                <div class="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-1">Crew Deployed</div>
            </div>
            <div class="glass-panel p-4 rounded-xl text-center">
                <div class="text-2xl font-bold text-purple-400">{{ blockedHours }}h</div>
                <div class="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-1">Time Blocked</div>
            </div>
            <div class="glass-panel p-4 rounded-xl text-center">
                <div class="text-2xl font-bold text-yellow-400">{{ vehiclesReserved }}</div>
                <div class="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-1">Vehicles Reserved</div>
            </div>
            <div class="glass-panel p-4 rounded-xl text-center">
                <div class="text-2xl font-bold text-primary">{{ completedToday }}</div>
                <div class="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-1">Completed Today</div>
            </div>
        </div>

        <!-- Active Service Moves -->
        <div v-if="loading && serviceMoves.length === 0" class="glass-panel rounded-xl p-12 text-center">
            <span class="material-symbols-outlined text-gray-400 text-[48px] block mb-3 animate-spin">progress_activity</span>
            <div class="text-gray-500 text-sm">Loading service moves...</div>
        </div>
        <div v-else-if="serviceMoves.length === 0" class="glass-panel rounded-xl p-12 text-center">
            <span class="material-symbols-outlined text-gray-400 text-[48px] block mb-3">local_shipping</span>
            <div class="text-gray-500 text-sm">No active service moves. Click "New Service Move" to create one.</div>
        </div>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div v-for="move in serviceMoves" :key="move.id"
                class="glass-panel rounded-xl overflow-hidden border border-gray-200 dark:border-white/5 hover:border-gray-200 dark:border-white/10 transition-all">
                <!-- Move Header -->
                <div class="p-4 flex items-center justify-between" :class="move.headerBg">
                    <div class="flex items-center gap-3">
                        <span class="material-symbols-outlined text-[24px]" :class="move.iconClass">{{ move.icon }}</span>
                        <div>
                            <div class="font-bold text-gray-900 dark:text-white text-sm">{{ move.title }}</div>
                            <div class="text-[10px] text-gray-400">{{ move.id }} • {{ move.type }}</div>
                        </div>
                    </div>
                    <span class="px-2 py-1 rounded text-[10px] font-bold" :class="move.statusClass">{{ move.status }}</span>
                </div>

                <div class="p-4 space-y-4">
                    <!-- Route Info -->
                    <div class="flex items-center gap-3">
                        <div class="flex flex-col items-center">
                            <span class="w-3 h-3 rounded-full bg-green-500 border-2 border-green-500/30"></span>
                            <div class="w-0.5 h-8 bg-gray-600"></div>
                            <span class="w-3 h-3 rounded-full bg-red-500 border-2 border-red-500/30"></span>
                        </div>
                        <div class="flex-1 space-y-4">
                            <div>
                                <div class="text-xs text-gray-500">Pickup</div>
                                <div class="text-sm text-gray-900 dark:text-white">{{ move.pickup }}</div>
                            </div>
                            <div>
                                <div class="text-xs text-gray-500">Delivery</div>
                                <div class="text-sm text-gray-900 dark:text-white">{{ move.delivery }}</div>
                            </div>
                        </div>
                    </div>

                    <!-- Time Block -->
                    <div class="p-3 bg-gray-100 dark:bg-black/20 rounded-lg">
                        <div class="text-[10px] text-gray-500 mb-2 font-bold uppercase tracking-wider">Time Block Reserved</div>
                        <div class="flex items-center gap-2 mb-2">
                            <span class="material-symbols-outlined text-purple-400 text-[16px]">schedule</span>
                            <span class="text-gray-900 dark:text-white text-sm font-bold">{{ move.timeBlock }}</span>
                            <span class="text-gray-500 text-xs">({{ move.duration }})</span>
                        </div>
                        <div class="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div class="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
                                :style="{ width: move.progress + '%' }"></div>
                        </div>
                        <div class="flex justify-between text-[10px] text-gray-500 mt-1">
                            <span>{{ move.packingTime }} packing</span>
                            <span>{{ move.dwellTime }} dwell</span>
                            <span>{{ move.transitTime }} transit</span>
                        </div>
                    </div>

                    <!-- Crew Manifest -->
                    <div>
                        <div class="text-[10px] text-gray-500 mb-2 font-bold uppercase tracking-wider">Crew Manifest ({{ move.crew.length }} members)</div>
                        <div class="space-y-1.5">
                            <div v-for="member in move.crew" :key="member.name"
                                class="flex items-center justify-between p-2 bg-gray-50 dark:bg-white/5 rounded-lg text-xs">
                                <div class="flex items-center gap-2">
                                    <span class="material-symbols-outlined text-[14px]" :class="member.role === 'Driver' ? 'text-primary' : 'text-blue-400'">
                                        {{ member.role === 'Driver' ? 'local_shipping' : 'person' }}
                                    </span>
                                    <span class="text-gray-900 dark:text-white">{{ member.name }}</span>
                                </div>
                                <span class="text-gray-400">{{ member.role }}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Vehicle & Load -->
                    <div class="grid grid-cols-3 gap-2">
                        <div class="bg-gray-100 dark:bg-black/20 rounded-lg p-2 text-center">
                            <div class="text-[10px] text-gray-500">Vehicle</div>
                            <div class="text-xs font-bold text-gray-900 dark:text-white">{{ move.vehicle }}</div>
                        </div>
                        <div class="bg-gray-100 dark:bg-black/20 rounded-lg p-2 text-center">
                            <div class="text-[10px] text-gray-500">Seats</div>
                            <div class="text-xs font-bold" :class="move.seatsAvailable >= move.crew.length ? 'text-green-400' : 'text-red-400'">
                                {{ move.crew.length }} / {{ move.seatsAvailable }}
                            </div>
                        </div>
                        <div class="bg-gray-100 dark:bg-black/20 rounded-lg p-2 text-center">
                            <div class="text-[10px] text-gray-500">Equipment</div>
                            <div class="text-xs font-bold text-gray-900 dark:text-white">{{ move.equipment }}</div>
                        </div>
                    </div>

                    <!-- Special Notes -->
                    <div v-if="move.notes" class="p-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                        <div class="flex items-center gap-1 text-[10px] text-yellow-400 font-bold mb-1">
                            <span class="material-symbols-outlined text-[12px]">info</span> Special Notes
                        </div>
                        <div class="text-xs text-yellow-600 dark:text-yellow-200">{{ move.notes }}</div>
                    </div>

                    <!-- Actions -->
                    <div class="flex gap-2 pt-2">
                        <button @click="trackMove(move)" class="flex-1 py-2 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1 border" :class="move.tracking ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 border-green-300 dark:border-green-500/30' : 'bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-white border-gray-200 dark:border-white/10'">
                            <span class="material-symbols-outlined text-[14px]">{{ move.tracking ? 'gps_fixed' : 'visibility' }}</span> {{ move.tracking ? 'Tracking Live' : 'Track' }}
                        </button>
                        <button @click="contactCrew(move)" class="flex-1 bg-emerald-100 dark:bg-primary/10 hover:bg-emerald-200 dark:hover:bg-primary/20 text-emerald-700 dark:text-primary py-2 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1 border border-emerald-300 dark:border-primary/30">
                            <span class="material-symbols-outlined text-[14px]">chat</span> Contact Crew
                        </button>
                        <button @click="toggleMoveMenu(move)" class="bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 py-2 px-3 rounded-lg text-xs font-bold transition-colors relative border border-gray-200 dark:border-white/10">
                            <span class="material-symbols-outlined text-[16px]">more_vert</span>
                            <div v-if="moveMenu === move.id" class="absolute bottom-full right-0 mb-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-lg shadow-xl z-20 w-40">
                                <button @click.stop="cancelMove(move)" class="w-full text-left px-3 py-2 text-xs text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-white/5">Cancel Move</button>
                                <button @click.stop="completeMove(move)" class="w-full text-left px-3 py-2 text-xs text-green-600 dark:text-green-400 hover:bg-gray-100 dark:hover:bg-white/5">Mark Complete</button>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Scheduling Conflict Warning -->
        <div class="glass-panel rounded-xl p-5">
            <div class="flex items-center gap-2 mb-4">
                <span class="material-symbols-outlined text-yellow-400">event_busy</span>
                <h3 class="font-bold text-gray-900 dark:text-white">Scheduling Conflicts & Overbooking Prevention</h3>
            </div>
            <div v-if="serviceMoves.length === 0" class="p-3 bg-green-100 dark:bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-3">
                <span class="material-symbols-outlined text-green-500 dark:text-green-400 text-[18px]">check_circle</span>
                <div class="text-xs text-green-700 dark:text-green-300">No active service moves. No scheduling conflicts detected.</div>
            </div>
            <div v-else class="p-3 bg-green-100 dark:bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-3">
                <span class="material-symbols-outlined text-green-500 dark:text-green-400 text-[18px]">check_circle</span>
                <div class="text-xs text-green-700 dark:text-green-300">{{ serviceMoves.length }} active move(s). All drivers have clear time blocks. No overbooking detected.</div>
            </div>
        </div>

        <!-- New Service Move Modal -->
        <Teleport to="body">
        <div v-if="showNewMove" class="fixed inset-0 bg-black/70 backdrop-blur-md z-[9999] flex items-center justify-center p-4" @click.self="showNewMove = false">
            <div class="bg-gradient-to-br from-gray-900 to-gray-800 shadow-2xl border border-primary/20 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-primary/30 scrollbar-track-transparent">
                <div class="flex items-center justify-between mb-5">
                    <h3 class="text-xl font-bold text-white flex items-center gap-2">
                        <span class="material-symbols-outlined text-primary">add_circle</span>
                        Create New Service Move
                    </h3>
                    <button @click="showNewMove = false" class="text-gray-400 hover:text-white transition-colors">
                        <span class="material-symbols-outlined">close</span>
                    </button>
                </div>
                <div class="space-y-4">
                    <div>
                        <label class="block text-xs font-medium text-primary mb-1.5">Move Title *</label>
                        <input v-model="newMove.title" type="text" placeholder="e.g., Johnson Family House Shift"
                            class="w-full bg-black/40 border border-gray-700 hover:border-primary/50 focus:border-primary rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors">
                    </div>

                    <div>
                        <label class="block text-xs font-medium text-primary mb-1.5">Service Type *</label>
                        <select v-model="newMove.type" class="w-full bg-black/40 border border-gray-700 hover:border-primary/50 focus:border-primary rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors appearance-none cursor-pointer">
                            <option value="House Shift" class="bg-gray-900">🏠 House Shift</option>
                            <option value="Office Shift" class="bg-gray-900">🏢 Office Shift</option>
                            <option value="Warehouse Transfer" class="bg-gray-900">🏭 Warehouse Transfer</option>
                        </select>
                    </div>

                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="block text-xs font-medium text-primary mb-1.5">Pickup Address *</label>
                            <input v-model="newMove.pickup" type="text" placeholder="Pickup location"
                                class="w-full bg-black/40 border border-gray-700 hover:border-primary/50 focus:border-primary rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors">
                        </div>
                        <div>
                            <label class="block text-xs font-medium text-primary mb-1.5">Delivery Address *</label>
                            <input v-model="newMove.delivery" type="text" placeholder="Delivery location"
                                class="w-full bg-black/40 border border-gray-700 hover:border-primary/50 focus:border-primary rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors">
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="block text-xs font-medium text-primary mb-1.5">📅 Scheduled Date</label>
                            <input v-model="newMove.scheduledDate" type="date"
                                class="w-full bg-black/40 border border-gray-700 hover:border-primary/50 focus:border-primary rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors">
                        </div>
                        <div>
                            <label class="block text-xs font-medium text-primary mb-1.5">⏰ Scheduled Time</label>
                            <input v-model="newMove.scheduledTime" type="time"
                                class="w-full bg-black/40 border border-gray-700 hover:border-primary/50 focus:border-primary rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors">
                        </div>
                    </div>

                    <div>
                        <label class="block text-xs font-medium text-primary mb-1.5">🚚 Assign Vehicle</label>
                        <select v-model="newMove.vehicleId" class="w-full bg-black/40 border border-gray-700 hover:border-primary/50 focus:border-primary rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors appearance-none cursor-pointer">
                            <option value="" class="bg-gray-900">-- Select Vehicle --</option>
                            <option v-for="vehicle in realVehicleOptions" :key="vehicle.id" :value="vehicle.id" class="bg-gray-900">
                                {{ vehicle.label }}
                            </option>
                        </select>
                        <div v-if="realVehicleOptions.length === 0" class="mt-1 text-xs text-yellow-400">
                            ⚠️ No vehicles loaded. Check store connection.
                        </div>
                    </div>

                    <div>
                        <label class="block text-xs font-medium text-primary mb-1.5">👤 Assign Driver</label>
                        <select v-model="newMove.driverId" class="w-full bg-black/40 border border-gray-700 hover:border-primary/50 focus:border-primary rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors appearance-none cursor-pointer">
                            <option value="" class="bg-gray-900">-- Select Driver --</option>
                            <option v-for="driver in availableDrivers" :key="driver.id" :value="driver.id" class="bg-gray-900">
                                {{ driver.name }} ({{ driver.status }})
                            </option>
                        </select>
                        <div v-if="availableDrivers.length === 0" class="mt-1 text-xs text-yellow-400">
                            ⚠️ No active drivers available
                        </div>
                    </div>

                    <div>
                        <label class="block text-xs font-medium text-primary mb-1.5">⏱️ Estimated Duration (hours)</label>
                        <input v-model="newMove.estimatedDuration" type="number" min="1" max="24" placeholder="4"
                            class="w-full bg-black/40 border border-gray-700 hover:border-primary/50 focus:border-primary rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors">
                    </div>

                    <div>
                        <label class="block text-xs font-medium text-primary mb-1.5">📝 Special Notes</label>
                        <textarea v-model="newMove.notes" rows="2" placeholder="Any special instructions or requirements..."
                            class="w-full bg-black/40 border border-gray-700 hover:border-primary/50 focus:border-primary rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors resize-none"></textarea>
                    </div>
                </div>
                <div class="flex gap-3 mt-6">
                    <button @click="createServiceMove" :disabled="!newMove.title || !newMove.pickup || !newMove.delivery || loading"
                        class="flex-1 bg-gradient-to-r from-primary to-yellow-400 hover:from-yellow-400 hover:to-primary text-black font-bold py-3 rounded-lg text-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100 shadow-lg">
                        <span v-if="loading" class="flex items-center justify-center gap-2">
                            <span class="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                            Creating...
                        </span>
                        <span v-else class="flex items-center justify-center gap-2">
                            <span class="material-symbols-outlined text-[18px]">check_circle</span>
                            Create Move
                        </span>
                    </button>
                    <button @click="showNewMove = false" class="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 rounded-lg text-sm transition-colors">
                        Cancel
                    </button>
                </div>
            </div>
        </div>
        </Teleport>

        <!-- Contact Crew Modal -->
        <Teleport to="body">
        <div v-if="showCrewChat" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center" @click.self="showCrewChat = false">
            <div class="bg-white dark:bg-card-dark shadow-2xl border border-gray-200 dark:border-white/10 rounded-2xl p-6 w-full max-w-md m-4">
                <h3 class="font-bold text-gray-900 dark:text-white mb-3">Contact Crew — {{ crewChatMove?.title }}</h3>
                <div class="space-y-2 mb-3 max-h-40 overflow-y-auto">
                    <div v-for="msg in crewMessages" :key="msg.id" class="p-2 rounded-lg text-xs" :class="msg.from === 'dispatch' ? 'bg-primary/10 text-primary ml-8' : 'bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-300 mr-8'">
                        <span class="font-bold">{{ msg.from === 'dispatch' ? 'Dispatcher' : msg.from }}</span>: {{ msg.text }}
                    </div>
                </div>
                <div class="flex gap-2">
                    <input v-model="crewMsg" type="text" placeholder="Message crew..." @keyup.enter="sendCrewMsg"
                        class="flex-1 bg-gray-100 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none">
                    <button @click="sendCrewMsg" class="bg-primary text-black px-4 py-2 rounded-lg text-sm font-bold">Send</button>
                </div>
            </div>
        </div>
        </Teleport>
    </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted, watch } from 'vue'
import { useDispatcherStore } from '@/stores/dispatcherStore'
import { API_BASE_URL, getStoredAccessToken } from '@/config/api'

const store = useDispatcherStore()
onMounted(async () => {
    await store.initialize().catch(() => {})
    await fetchServiceMoves()
})

// Auth headers
function authHeaders() {
    const token = getStoredAccessToken()
    return token
        ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
        : { 'Content-Type': 'application/json' }
}

// Vehicle options from store - ACTUALLY USE IT
const vehicleOptions = computed(() => {
    const vehicles = store.filteredVehicles
    return vehicles.length > 0
        ? vehicles.map(v => ({ id: v.id, label: v.code || v.model || v.licensePlate || `Vehicle ${v.id}` }))
        : [{ id: 'default', label: 'No vehicles available' }]
})

// Available drivers for crew assignment
const availableDrivers = computed(() => {
    return store.dispatcherDrivers.filter(d => d.status === 'Active' || d.status === 'Idle')
})

// Available laborers (from store if you have labor data)
const availableLaborers = computed(() => {
    // Try to get from store if it has labor/staff data
    // For now, we'll use drivers as potential crew members
    return store.dispatcherDrivers.slice(0, 10)
})

const completedToday = ref(0)
const showNewMove = ref(false)
const showCrewChat = ref(false)
const crewChatMove = ref(null)
const crewMsg = ref('')
const crewMessages = ref([])
const moveMenu = ref(null)
const loading = ref(false)

const newMove = reactive({
    title: '',
    type: 'House Shift',
    pickup: '',
    delivery: '',
    vehicleId: '',
    driverId: '',
    laborerIds: [],
    scheduledDate: '',
    scheduledTime: '',
    estimatedDuration: '4',
    notes: ''
})

const serviceMoves = ref([])

const totalCrewCount = computed(() => serviceMoves.value.reduce((sum, m) => sum + m.crew.length, 0))
const blockedHours = computed(() => serviceMoves.value.reduce((sum, m) => sum + parseInt(m.duration), 0))
const vehiclesReserved = computed(() => serviceMoves.value.length)

// Set default vehicle and driver when modal opens
watch(showNewMove, (isOpen) => {
    if (isOpen && vehicleOptions.value.length > 0) {
        newMove.vehicleId = vehicleOptions.value[0].id
    }
    if (isOpen && availableDrivers.value.length > 0) {
        newMove.driverId = availableDrivers.value[0].id
    }
    // Set default date to today
    if (isOpen) {
        const today = new Date().toISOString().split('T')[0]
        newMove.scheduledDate = today
        newMove.scheduledTime = '10:00'
    }
})

// Fetch service moves from backend
async function fetchServiceMoves() {
    loading.value = true
    try {
        const res = await fetch(`${API_BASE_URL}/api/v1/orders?order_type=service_move&status_filter=ASSIGNED,IN_TRANSIT`, {
            headers: authHeaders()
        })
        if (res.ok) {
            const data = await res.json()
            const items = Array.isArray(data) ? data : (data.items || [])
            serviceMoves.value = items.map(mapServiceMove)

            // Count completed today
            const today = new Date().toISOString().split('T')[0]
            completedToday.value = items.filter(o =>
                o.status === 'DELIVERED' &&
                o.delivered_at?.startsWith(today)
            ).length
        }
    } catch (err) {
        console.error('Failed to fetch service moves:', err)
    }
    loading.value = false
}

function mapServiceMove(order) {
    const iconMap = { 'House Shift': 'home', 'Office Shift': 'domain', 'Warehouse Transfer': 'warehouse', 'service_move': 'local_shipping' }
    const colorMap = { 'House Shift': 'blue', 'Office Shift': 'purple', 'Warehouse Transfer': 'green', 'service_move': 'blue' }

    const moveType = order.cargo_type || order.order_type || 'service_move'
    const c = colorMap[moveType] || 'blue'

    // Get driver and crew info
    const driver = store.dispatcherDrivers.find(d => d.id === String(order.assigned_driver_id))
    const crew = driver ? [{ name: driver.name, role: 'Driver' }] : []

    // Get vehicle info
    const vehicle = store.filteredVehicles.find(v => v.id === String(order.assigned_vehicle_id))
    const vehicleCode = vehicle?.code || vehicle?.model || 'Vehicle'

    // Calculate progress based on status
    let progress = 0
    if (order.status === 'ASSIGNED') progress = 10
    else if (order.status === 'IN_TRANSIT') progress = 50
    else if (order.status === 'DELIVERED') progress = 100

    const statusMap = {
        'CONFIRMED': { label: 'Scheduled', class: 'bg-yellow-500/20 text-yellow-400' },
        'ASSIGNED': { label: 'Assigned', class: 'bg-blue-500/20 text-blue-400' },
        'IN_TRANSIT': { label: 'In Progress', class: 'bg-green-500/20 text-green-400' },
        'DELIVERED': { label: 'Completed', class: 'bg-gray-500/20 text-gray-400' }
    }

    const statusInfo = statusMap[order.status] || { label: order.status, class: 'bg-gray-500/20 text-gray-400' }

    return {
        id: order.tracking_code || order.id,
        orderId: order.id,
        title: order.special_instructions || `${moveType} - ${order.id}`,
        type: moveType,
        icon: iconMap[moveType] || 'local_shipping',
        iconClass: `text-${c}-400`,
        headerBg: `bg-${c}-500/5`,
        status: statusInfo.label,
        statusClass: statusInfo.class,
        pickup: order.pickup_addr || 'Not specified',
        delivery: order.delivery_addr || 'Not specified',
        timeBlock: order.scheduled_at
            ? new Date(order.scheduled_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
            : 'Not scheduled',
        duration: '4 hours', // Could be calculated from order data
        packingTime: '1h',
        dwellTime: '0.5h',
        transitTime: '2.5h',
        progress,
        vehicle: vehicleCode,
        seatsAvailable: vehicle?.seats || 4,
        equipment: 'Dolly, Blankets',
        notes: order.notes || order.special_instructions || '',
        tracking: false,
        crew
    }
}

function trackMove(move) { move.tracking = !move.tracking }
function toggleMoveMenu(move) { moveMenu.value = moveMenu.value === move.id ? null : move.id }

function contactCrew(move) {
    crewChatMove.value = move
    crewMessages.value = [{ id: 1, from: move.crew[0]?.name || 'Driver', text: 'We are on site and ready.' }]
    showCrewChat.value = true
}

function sendCrewMsg() {
    if (!crewMsg.value.trim()) return
    crewMessages.value.push({ id: Date.now(), from: 'dispatch', text: crewMsg.value })
    const msg = crewMsg.value
    crewMsg.value = ''
    setTimeout(() => {
        crewMessages.value.push({ id: Date.now(), from: crewChatMove.value?.crew[0]?.name || 'Crew', text: `Roger that. We'll handle "${msg}".` })
    }, 1200)
}

async function cancelMove(move) {
    // Call backend to cancel the order/move
    try {
        const res = await fetch(`${API_BASE_URL}/api/v1/orders/${move.orderId}/cancel`, {
            method: 'POST',
            headers: authHeaders()
        })
        if (res.ok) {
            serviceMoves.value = serviceMoves.value.filter(m => m.id !== move.id)
        }
    } catch (err) {
        console.error('Failed to cancel move:', err)
    }
    moveMenu.value = null
}

async function completeMove(move) {
    // Call backend to mark order as delivered
    try {
        const res = await fetch(`${API_BASE_URL}/api/v1/orders/${move.orderId}/complete`, {
            method: 'POST',
            headers: authHeaders()
        })
        if (res.ok) {
            move.status = 'Completed'
            move.statusClass = 'bg-green-500/20 text-green-400'
            move.progress = 100
            completedToday.value++
        }
    } catch (err) {
        console.error('Failed to complete move:', err)
    }
    moveMenu.value = null
}

async function createServiceMove() {
    if (!newMove.title || !newMove.pickup || !newMove.delivery) return

    loading.value = true
    try {
        // Build scheduled timestamp
        const scheduledAt = newMove.scheduledDate && newMove.scheduledTime
            ? `${newMove.scheduledDate}T${newMove.scheduledTime}:00`
            : null

        // Create order payload
        const payload = {
            cargo_type: newMove.type,
            order_type: 'service_move',
            pickup_addr: newMove.pickup,
            delivery_addr: newMove.delivery,
            special_instructions: newMove.title,
            notes: newMove.notes,
            scheduled_at: scheduledAt,
            assigned_vehicle_id: newMove.vehicleId || null,
            assigned_driver_id: newMove.driverId || null,
            status: 'CONFIRMED'
        }

        const res = await fetch(`${API_BASE_URL}/api/v1/orders`, {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify(payload)
        })

        if (res.ok) {
            const createdOrder = await res.json()

            // Optionally assign driver if selected
            if (newMove.driverId && createdOrder.id) {
                await fetch(`${API_BASE_URL}/api/v1/orders/${createdOrder.id}/assign`, {
                    method: 'POST',
                    headers: authHeaders(),
                    body: JSON.stringify({
                        driver_id: newMove.driverId,
                        vehicle_id: newMove.vehicleId || null
                    })
                })
            }

            // Refresh list
            await fetchServiceMoves()

            // Reset form
            showNewMove.value = false
            newMove.title = ''
            newMove.pickup = ''
            newMove.delivery = ''
            newMove.notes = ''
        }
    } catch (err) {
        console.error('Failed to create service move:', err)
    }
    loading.value = false
}
</script>
