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
            <div class="space-y-3">
                <div class="p-3 bg-yellow-100 dark:bg-yellow-500/10 border border-yellow-500/20 rounded-lg flex items-center justify-between">
                    <div class="flex items-center gap-3">
                        <span class="material-symbols-outlined text-yellow-500 dark:text-yellow-400 text-[18px]">warning</span>
                        <div>
                            <div class="text-sm text-yellow-700 dark:text-yellow-300 font-bold">DRV-001 Mike Ross — Time Overlap</div>
                            <div class="text-xs text-gray-500 dark:text-gray-400">Current service move (SM-003) blocks until 16:00. Pending dispatch ORD-7712 requires 15:30 start.</div>
                        </div>
                    </div>
                    <button @click="resolveConflict" class="text-xs px-3 py-1.5 rounded font-bold transition-colors" :class="conflictResolved ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400'">{{ conflictResolved ? '✓ Resolved' : 'Resolve' }}</button>
                </div>
                <div class="p-3 bg-green-100 dark:bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-3">
                    <span class="material-symbols-outlined text-green-500 dark:text-green-400 text-[18px]">check_circle</span>
                    <div class="text-xs text-green-700 dark:text-green-300">All other drivers have clear time blocks. No overbooking detected.</div>
                </div>
            </div>
        </div>

        <!-- New Service Move Modal -->
        <Teleport to="body">
        <div v-if="showNewMove" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center" @click.self="showNewMove = false">
            <div class="bg-white dark:bg-card-dark shadow-2xl border border-gray-200 dark:border-white/10 rounded-2xl p-6 w-full max-w-lg m-4">
                <h3 class="font-bold text-gray-900 dark:text-white mb-4">Create New Service Move</h3>
                <div class="space-y-3">
                    <input v-model="newMove.title" type="text" placeholder="Move Title (e.g., Johnson Family House Shift)"
                        class="w-full bg-gray-100 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none">
                    <select v-model="newMove.type" class="w-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none">
                        <option class="bg-white dark:bg-gray-800">House Shift</option><option class="bg-white dark:bg-gray-800">Office Shift</option><option class="bg-white dark:bg-gray-800">Warehouse Transfer</option>
                    </select>
                    <div class="grid grid-cols-2 gap-3">
                        <input v-model="newMove.pickup" type="text" placeholder="Pickup Address" class="w-full bg-gray-100 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none">
                        <input v-model="newMove.delivery" type="text" placeholder="Delivery Address" class="w-full bg-gray-100 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none">
                    </div>
                    <select v-model="newMove.vehicle" class="w-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none">
                        <option class="bg-white dark:bg-gray-800">Van T-15</option><option class="bg-white dark:bg-gray-800">Van T-20</option><option class="bg-white dark:bg-gray-800">Truck XL</option>
                    </select>
                    <textarea v-model="newMove.notes" rows="2" placeholder="Special notes..."
                        class="w-full bg-gray-100 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none"></textarea>
                </div>
                <div class="flex gap-2 mt-4">
                    <button @click="createServiceMove" :disabled="!newMove.title || !newMove.pickup"
                        class="flex-1 bg-primary text-black font-bold py-2 rounded-lg text-sm disabled:opacity-40 disabled:cursor-not-allowed">Create Move</button>
                    <button @click="showNewMove = false" class="flex-1 bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white py-2 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-white/20 transition-colors">Cancel</button>
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
import { ref, computed, reactive } from 'vue'

const completedToday = ref(2)
const showNewMove = ref(false)
const showCrewChat = ref(false)
const crewChatMove = ref(null)
const crewMsg = ref('')
const crewMessages = ref([])
const moveMenu = ref(null)
const conflictResolved = ref(false)
const newMove = reactive({ title: '', type: 'House Shift', pickup: '', delivery: '', vehicle: 'Van T-20', notes: '' })

const serviceMoves = ref([
    {
        id: 'SM-001',
        title: 'Residential House Shift — Johnson Family',
        type: 'House Shift',
        icon: 'home',
        iconClass: 'text-blue-400',
        headerBg: 'bg-blue-500/5',
        status: 'In Progress',
        statusClass: 'bg-blue-500/20 text-blue-400',
        pickup: '742 Evergreen Terrace, Sector 5',
        delivery: '1234 Maple Drive, Suburban West',
        timeBlock: '09:00 AM – 02:00 PM',
        duration: '5 hours',
        packingTime: '1.5h',
        dwellTime: '1h',
        transitTime: '2.5h',
        progress: 65,
        vehicle: 'Truck XL',
        seatsAvailable: 6,
        equipment: 'Dolly, Blankets',
        notes: 'Narrow stairway at pickup — no large furniture through front door. Use back entrance.',
        crew: [
            { name: 'Harvey Specter', role: 'Driver' },
            { name: 'John T.', role: 'Loader' },
            { name: 'Amit K.', role: 'Loader' },
            { name: 'Sam W.', role: 'Helper' },
        ]
    },
    {
        id: 'SM-002',
        title: 'Office Relocation — TechCorp',
        type: 'Office Shift',
        icon: 'domain',
        iconClass: 'text-purple-400',
        headerBg: 'bg-purple-500/5',
        status: 'Scheduled',
        statusClass: 'bg-yellow-500/20 text-yellow-400',
        pickup: 'TechCorp Building, Floor 4-6, Downtown',
        delivery: 'New TechCorp HQ, Industrial Park N',
        timeBlock: '06:00 AM – 03:00 PM',
        duration: '9 hours',
        packingTime: '3h',
        dwellTime: '2h',
        transitTime: '4h',
        progress: 0,
        vehicle: 'Truck XL x2',
        seatsAvailable: 12,
        equipment: 'Dolly, Blankets, Lift Gate, Crates',
        notes: 'Multi-floor operation. Elevator reserved 6-9 AM only. Fragile server equipment on Floor 6.',
        crew: [
            { name: 'Mike Ross', role: 'Driver' },
            { name: 'Rachel Z.', role: 'Driver' },
            { name: 'Team A (4)', role: 'Loaders' },
            { name: 'IT Staff (2)', role: 'Supervisor' },
        ]
    },
    {
        id: 'SM-003',
        title: 'Apartment Move — S. Williams',
        type: 'House Shift',
        icon: 'apartment',
        iconClass: 'text-green-400',
        headerBg: 'bg-green-500/5',
        status: 'Loading',
        statusClass: 'bg-green-500/20 text-green-400',
        pickup: '55 Park Avenue, Apt 12B, Midtown',
        delivery: '90 River Road, Unit 3A, West End',
        timeBlock: '10:00 AM – 01:00 PM',
        duration: '3 hours',
        packingTime: '0.5h',
        dwellTime: '0.5h',
        transitTime: '2h',
        progress: 35,
        vehicle: 'Van T-20',
        seatsAvailable: 3,
        equipment: 'Dolly, Blankets',
        notes: '',
        crew: [
            { name: 'Louis Litt', role: 'Driver' },
            { name: 'Mark D.', role: 'Loader' },
            { name: 'Chris P.', role: 'Helper' },
        ]
    }
])

const totalCrewCount = computed(() => serviceMoves.value.reduce((sum, m) => sum + m.crew.length, 0))
const blockedHours = computed(() => serviceMoves.value.reduce((sum, m) => sum + parseInt(m.duration), 0))
const vehiclesReserved = computed(() => serviceMoves.value.length + 1)

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

function cancelMove(move) {
    serviceMoves.value = serviceMoves.value.filter(m => m.id !== move.id)
    moveMenu.value = null
}

function completeMove(move) {
    move.status = 'Completed'
    move.statusClass = 'bg-green-500/20 text-green-400'
    move.progress = 100
    completedToday.value++
    moveMenu.value = null
}

function resolveConflict() { conflictResolved.value = true }

function createServiceMove() {
    const iconMap = { 'House Shift': 'home', 'Office Shift': 'domain', 'Warehouse Transfer': 'warehouse' }
    const colorMap = { 'House Shift': 'blue', 'Office Shift': 'purple', 'Warehouse Transfer': 'green' }
    const c = colorMap[newMove.type] || 'blue'
    serviceMoves.value.push({
        id: `SM-${String(serviceMoves.value.length + 1).padStart(3, '0')}`,
        title: newMove.title, type: newMove.type, icon: iconMap[newMove.type] || 'home',
        iconClass: `text-${c}-400`, headerBg: `bg-${c}-500/5`,
        status: 'Scheduled', statusClass: 'bg-yellow-500/20 text-yellow-400',
        pickup: newMove.pickup, delivery: newMove.delivery,
        timeBlock: '10:00 AM – 02:00 PM', duration: '4 hours',
        packingTime: '1h', dwellTime: '0.5h', transitTime: '2.5h', progress: 0,
        vehicle: newMove.vehicle, seatsAvailable: 4, equipment: 'Dolly, Blankets',
        notes: newMove.notes, tracking: false,
        crew: [{ name: 'Assigned Driver', role: 'Driver' }, { name: 'Loader A', role: 'Loader' }]
    })
    showNewMove.value = false
    newMove.title = ''; newMove.pickup = ''; newMove.delivery = ''; newMove.notes = ''
}
</script>
