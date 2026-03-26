<template>
    <div class="space-y-6">
        <div class="flex justify-between items-center">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Driver Management</h2>
            <div class="flex gap-2">
                <button @click="openSlipPicker('vehicleSafetyChecklist')"
                    class="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors">
                    <span class="material-symbols-outlined">health_and_safety</span> Safety Checklist
                </button>
                <button @click="openSlipPicker('assetCheckout')"
                    class="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors">
                    <span class="material-symbols-outlined">inventory_2</span> Asset Checkout
                </button>
                <button @click="showBroadcast = true"
                    class="bg-gray-50 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 py-2 px-4 rounded-lg transition-colors flex items-center gap-2">
                    <span class="material-symbols-outlined">message</span> Broadcast
                </button>
            </div>
        </div>

        <!-- Overview Stats -->
        <div class="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div class="glass-panel p-4 rounded-xl text-center">
                <div class="text-2xl font-bold text-gray-900 dark:text-white">{{ totalDrivers }}</div>
                <div class="text-xs text-gray-500 dark:text-gray-400">Total Drivers</div>
            </div>
            <div class="glass-panel p-4 rounded-xl text-center">
                <div class="text-2xl font-bold text-green-400">{{ activeDrivers }}</div>
                <div class="text-xs text-gray-500 dark:text-gray-400">Active Now</div>
            </div>
            <div class="glass-panel p-4 rounded-xl text-center">
                <div class="text-2xl font-bold text-yellow-500">{{ onBreakDrivers }}</div>
                <div class="text-xs text-gray-500 dark:text-gray-400">On Break</div>
            </div>
            <div class="glass-panel p-4 rounded-xl text-center">
                <div class="text-2xl font-bold text-red-500">{{ offlineDrivers }}</div>
                <div class="text-xs text-gray-500 dark:text-gray-400">Maintenance/Off</div>
            </div>
            <div class="glass-panel p-4 rounded-xl text-center">
                <div class="text-2xl font-bold text-orange-400">{{ hosWarnings }}</div>
                <div class="text-xs text-gray-500 dark:text-gray-400">HOS Warning</div>
            </div>
            <div class="glass-panel p-4 rounded-xl text-center">
                <div class="text-2xl font-bold text-cyan-400">{{ authorizedDrivers }}</div>
                <div class="text-xs text-gray-500 dark:text-gray-400">Authorized</div>
            </div>
        </div>

        <!-- HOS Compliance Alert -->
        <div v-if="hosWarningDriver" class="p-4 bg-orange-100 dark:bg-orange-500/10 border border-orange-500/20 rounded-xl flex items-center gap-3">
            <span class="material-symbols-outlined text-orange-500 dark:text-orange-400 animate-pulse">warning</span>
            <div class="flex-1">
                <div class="text-sm font-bold text-orange-600 dark:text-orange-400">Hours-of-Service Compliance Alert</div>
                <div class="text-xs text-orange-700 dark:text-orange-300">{{ hosWarningDriver.name }} has logged {{ hosWarningDriver.hours }}h of {{ hosWarningDriver.maxHours }}h max continuous driving. Break required soon. System will block new assignments at limit.</div>
            </div>
            <button @click="showHOS = !showHOS" class="text-xs bg-orange-100 dark:bg-orange-500/20 hover:bg-orange-200 dark:hover:bg-orange-500/30 text-orange-700 dark:text-orange-400 px-3 py-1.5 rounded-lg font-bold transition-colors whitespace-nowrap border border-orange-300 dark:border-orange-500/30 flex items-center gap-1">
                <span class="material-symbols-outlined text-[14px]">{{ showHOS ? 'visibility_off' : 'visibility' }}</span>
                {{ showHOS ? 'Hide HOS' : 'View HOS' }}
            </button>
        </div>
        <div v-if="showHOS" class="glass-panel p-6 rounded-xl">
            <h3 class="font-bold text-gray-900 dark:text-white mb-4 text-lg">HOS Compliance Overview</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto pr-2">
                <div v-for="d in drivers" :key="d.id" class="p-4 bg-gray-50 dark:bg-white/5 rounded-lg border border-gray-200 dark:border-white/10">
                    <div class="text-sm font-bold text-gray-900 dark:text-white mb-2">{{ d.name }}</div>
                    <div class="space-y-2">
                        <div class="flex items-center gap-2">
                            <div class="flex-1 h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div class="h-full rounded-full" :class="getHOSBarClass(d.hours, d.maxHours)" :style="{ width: (d.hours / d.maxHours) * 100 + '%' }"></div>
                            </div>
                            <span class="text-xs font-mono font-bold" :class="getHOSTextClass(d.hours, d.maxHours)">{{ d.hours }}h</span>
                        </div>
                        <div class="text-xs font-semibold" :class="getHOSStatusClass(d.hours, d.maxHours)">{{ getHOSStatus(d.hours, d.maxHours) }}</div>
                        <div class="text-[10px] text-gray-500 dark:text-gray-400 pt-1">Max: {{ d.maxHours }}h | Stops: {{ d.stops }}</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Drivers List -->
        <div class="glass-panel rounded-xl overflow-hidden">
            <div class="p-4 border-b border-gray-200 dark:border-white/5 flex gap-4">
                <input v-model="driverSearch" type="text" placeholder="Search driver by name, ID, or vehicle..."
                    class="flex-1 bg-gray-100 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg py-2 px-4 text-gray-900 dark:text-white focus:outline-none focus:border-primary/50">
                <select v-model="statusFilter" class="bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-white/10 rounded-lg px-4 text-gray-900 dark:text-white">
                    <option class="bg-white dark:bg-gray-800" value="">All Statuses</option>
                    <option class="bg-white dark:bg-gray-800" value="On Route">Active</option>
                    <option class="bg-white dark:bg-gray-800" value="Offline">Inactive</option>
                    <option class="bg-white dark:bg-gray-800" value="HOS">HOS Warning</option>
                </select>
                <select v-model="authFilter" class="bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-white/10 rounded-lg px-4 text-gray-900 dark:text-white">
                    <option class="bg-white dark:bg-gray-800" value="">All Auth Status</option>
                    <option class="bg-white dark:bg-gray-800" value="authorized">Authorized</option>
                    <option class="bg-white dark:bg-gray-800" value="suspended">Suspended</option>
                    <option class="bg-white dark:bg-gray-800" value="expired">License Expired</option>
                </select>
            </div>

            <table class="w-full text-left text-sm">
                <thead class="bg-gray-50 dark:bg-white/5 text-gray-400 uppercase text-[10px] tracking-wider">
                    <tr>
                        <th class="p-4">Driver</th>
                        <th class="p-4">Status</th>
                        <th class="p-4">Authorization</th>
                        <th class="p-4">Vehicle</th>
                        <th class="p-4">Current Load</th>
                        <th class="p-4">HOS Compliance</th>
                        <th class="p-4">Shift Stats</th>
                        <th class="p-4">Action</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-200 dark:divide-white/5">
                    <tr v-for="driver in filteredDrivers" :key="driver.id" class="hover:bg-gray-100 dark:hover:bg-white/5 transition-colors group">
                        <td class="p-4">
                            <div class="flex items-center gap-3">
                                <img :src="driver.avatar" class="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700">
                                <div>
                                    <div class="font-bold text-gray-900 dark:text-white">{{ driver.name }}</div>
                                    <div class="text-xs text-gray-500">{{ driver.phone }}</div>
                                </div>
                            </div>
                        </td>
                        <td class="p-4">
                            <span class="px-2 py-1 rounded text-[10px] font-bold border" :class="driver.statusClass">
                                {{ driver.status }}
                            </span>
                        </td>
                        <td class="p-4">
                            <div class="space-y-1">
                                <div class="flex items-center gap-1">
                                    <span class="material-symbols-outlined text-[12px]" :class="driver.authorized ? 'text-green-400' : 'text-red-400'">
                                        {{ driver.authorized ? 'check_circle' : 'cancel' }}
                                    </span>
                                    <span class="text-[10px]" :class="driver.authorized ? 'text-green-400' : 'text-red-400'">
                                        {{ driver.authorized ? 'Authorized' : 'Not Auth.' }}
                                    </span>
                                </div>
                                <div class="flex items-center gap-1">
                                    <span class="material-symbols-outlined text-[12px]" :class="driver.licenseValid ? 'text-green-400' : 'text-red-400'">
                                        {{ driver.licenseValid ? 'verified' : 'gpp_bad' }}
                                    </span>
                                    <span class="text-[10px]" :class="driver.licenseValid ? 'text-gray-400' : 'text-red-400'">
                                        License {{ driver.licenseValid ? 'Valid' : 'Expired' }}
                                    </span>
                                </div>
                                <div v-if="driver.suspended" class="flex items-center gap-1">
                                    <span class="material-symbols-outlined text-[12px] text-red-400">block</span>
                                    <span class="text-[10px] text-red-400">Suspended</span>
                                </div>
                                <div v-if="driver.maintenance" class="flex items-center gap-1">
                                    <span class="material-symbols-outlined text-[12px] text-yellow-400">build</span>
                                    <span class="text-[10px] text-yellow-400">Vehicle in Maint.</span>
                                </div>
                            </div>
                        </td>
                        <td class="p-4 text-gray-600 dark:text-gray-300">{{ driver.vehicle || '—' }}</td>
                        <td class="p-4">
                            <div class="flex items-center gap-2">
                                <div class="w-16 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                    <div class="h-full rounded-full" :class="driver.load > 85 ? 'bg-red-500' : 'bg-primary'" :style="`width: ${driver.load}%`"></div>
                                </div>
                                <span class="text-xs text-gray-400">{{ driver.load }}%</span>
                            </div>
                        </td>
                        <td class="p-4">
                            <div class="space-y-1">
                                <div class="flex items-center gap-1.5">
                                    <div class="w-14 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                        <div class="h-full rounded-full" :class="getHOSBarClass(driver.hours, driver.maxHours)"
                                            :style="`width: ${(driver.hours / driver.maxHours) * 100}%`"></div>
                                    </div>
                                    <span class="text-[10px] font-mono" :class="getHOSTextClass(driver.hours, driver.maxHours)">
                                        {{ driver.hours }}h / {{ driver.maxHours }}h
                                    </span>
                                </div>
                                <div class="text-[10px]" :class="getHOSStatusClass(driver.hours, driver.maxHours)">
                                    {{ getHOSStatus(driver.hours, driver.maxHours) }}
                                </div>
                                <div v-if="driver.breakDue" class="text-[10px] text-orange-400 flex items-center gap-1">
                                    <span class="material-symbols-outlined text-[10px]">coffee</span>
                                    Break due in {{ driver.breakDueIn }}
                                </div>
                            </div>
                        </td>
                        <td class="p-4 text-xs text-gray-400">
                            <div>{{ driver.hours }}h logged</div>
                            <div>{{ driver.stops }} stops done</div>
                        </td>
                        <td class="p-4">
                            <div class="flex gap-1">
                                <button @click="chatDriver(driver)" class="text-gray-600 dark:text-gray-400 hover:text-primary hover:bg-primary/10 p-1.5 rounded-lg transition-colors" title="Chat"><span
                                        class="material-symbols-outlined text-[18px]">chat</span></button>
                                <button @click="assignToDriver(driver)" class="text-gray-600 dark:text-gray-400 hover:text-primary hover:bg-primary/10 p-1.5 rounded-lg transition-colors" title="Assign"><span
                                        class="material-symbols-outlined text-[18px]">person_add</span></button>
                                <button @click="toggleMoreMenu(driver)" class="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-white/10 p-1.5 rounded-lg transition-colors relative" title="More">
                                    <span class="material-symbols-outlined text-[18px]">more_vert</span>
                                    <div v-if="moreMenuDriver === driver.id" class="absolute right-0 top-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-white/10 rounded-lg shadow-xl z-20 w-40 py-1">
                                        <button @click.stop="suspendDriver(driver)" class="block w-full text-left px-3 py-2 text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">{{ driver.suspended ? 'Unsuspend' : 'Suspend' }}</button>
                                        <button @click.stop="viewDriverProfile(driver)" class="block w-full text-left px-3 py-2 text-sm font-semibold text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">View Profile</button>
                                    </div>
                                </button>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- HOS Detail -->

        <!-- Broadcast Modal -->
        <Teleport to="body">
        <div v-if="showBroadcast" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center" @click.self="showBroadcast = false">
            <div class="bg-white dark:bg-card-dark shadow-2xl border border-gray-200 dark:border-white/10 rounded-2xl p-6 w-full max-w-md m-4">
                <h3 class="font-bold text-gray-900 dark:text-white mb-4">Broadcast Message</h3>
                <textarea v-model="broadcastMsg" rows="3" placeholder="Type message for all drivers..."
                    class="w-full bg-gray-100 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none mb-3"></textarea>
                <div class="flex gap-2">
                    <button @click="sendBroadcast" class="flex-1 bg-primary text-black font-bold py-2 rounded-lg text-sm">Send to All</button>
                    <button @click="showBroadcast = false" class="flex-1 bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white py-2 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-white/20 transition-colors">Cancel</button>
                </div>
                <div v-if="broadcastSent" class="mt-2 text-center text-xs text-green-400 font-bold">✓ Broadcast sent to {{ totalDrivers }} drivers</div>
            </div>
        </div>
        </Teleport>

        <!-- Driver Chat Modal -->
        <Teleport to="body">
        <div v-if="showDriverChat" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center" @click.self="showDriverChat = false">
            <div class="bg-white dark:bg-card-dark shadow-2xl border border-gray-200 dark:border-white/10 rounded-2xl w-full max-w-sm m-4 flex flex-col h-[400px]">
                <div class="p-4 border-b border-gray-200 dark:border-white/5 flex items-center justify-between">
                    <div class="flex items-center gap-2">
                        <img :src="chatTargetDriver?.avatar" class="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700">
                        <div>
                            <div class="text-sm font-bold text-gray-900 dark:text-white">{{ chatTargetDriver?.name }}</div>
                            <div class="text-[10px] text-gray-400">{{ chatTargetDriver?.status }}</div>
                        </div>
                    </div>
                    <button @click="showDriverChat = false" class="text-gray-400 hover:text-gray-900 dark:hover:text-white">
                        <span class="material-symbols-outlined">close</span>
                    </button>
                </div>
                <div class="flex-1 overflow-y-auto no-scrollbar p-4 space-y-2">
                    <div v-for="msg in driverChatMessages" :key="msg.id" :class="msg.from === 'dispatch' ? 'flex justify-end' : 'flex justify-start'">
                        <div class="max-w-[80%] p-2 rounded-xl text-xs"
                            :class="msg.from === 'dispatch' ? 'bg-primary/20 text-gray-900 dark:text-white' : 'bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-300'">
                            {{ msg.text }}
                        </div>
                    </div>
                </div>
                <div class="p-3 border-t border-gray-200 dark:border-white/5 flex gap-2">
                    <input v-model="driverChatMsg" @keyup.enter="sendDriverChatMsg" type="text" placeholder="Type message..."
                        class="flex-1 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-full px-3 py-1.5 text-sm text-gray-900 dark:text-white focus:outline-none">
                    <button @click="sendDriverChatMsg" class="p-1.5 bg-primary rounded-full text-black">
                        <span class="material-symbols-outlined text-[16px]">send</span>
                    </button>
                </div>
            </div>
        </div>
        </Teleport>

        <!-- Driver Profile Modal -->
        <Teleport to="body">
        <div v-if="showDriverProfile" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center" @click.self="showDriverProfile = false">
            <div class="bg-white dark:bg-card-dark shadow-2xl border border-gray-200 dark:border-white/10 rounded-2xl p-6 w-full max-w-md m-4">
                <div class="flex items-center gap-4 mb-6">
                    <img :src="profileTargetDriver?.avatar" class="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 ring-2 ring-primary/20">
                    <div>
                        <h3 class="text-lg font-bold text-gray-900 dark:text-white">{{ profileTargetDriver?.name }}</h3>
                        <p class="text-sm text-gray-500">{{ profileTargetDriver?.vehicle }}</p>
                        <span class="text-xs px-2 py-0.5 rounded-full mt-1 inline-block" :class="profileTargetDriver?.statusClass">{{ profileTargetDriver?.status }}</span>
                    </div>
                </div>
                <div class="grid grid-cols-2 gap-3">
                    <div class="p-3 bg-gray-50 dark:bg-white/5 rounded-lg">
                        <div class="text-xs text-gray-500 mb-1">Phone</div>
                        <div class="text-sm font-medium text-gray-900 dark:text-white">{{ profileTargetDriver?.phone }}</div>
                    </div>
                    <div class="p-3 bg-gray-50 dark:bg-white/5 rounded-lg">
                        <div class="text-xs text-gray-500 mb-1">Load Capacity</div>
                        <div class="text-sm font-medium text-gray-900 dark:text-white">{{ profileTargetDriver?.load }}%</div>
                    </div>
                    <div class="p-3 bg-gray-50 dark:bg-white/5 rounded-lg">
                        <div class="text-xs text-gray-500 mb-1">Hours Logged</div>
                        <div class="text-sm font-medium text-gray-900 dark:text-white">{{ profileTargetDriver?.hours }}h / {{ profileTargetDriver?.maxHours }}h</div>
                    </div>
                    <div class="p-3 bg-gray-50 dark:bg-white/5 rounded-lg">
                        <div class="text-xs text-gray-500 mb-1">Stops Done</div>
                        <div class="text-sm font-medium text-gray-900 dark:text-white">{{ profileTargetDriver?.stops }}</div>
                    </div>
                </div>
                <button @click="showDriverProfile = false" class="mt-4 w-full bg-gray-50 dark:bg-white/10 text-gray-900 dark:text-white py-2 rounded-lg text-sm font-bold hover:bg-gray-100 dark:hover:bg-white/20 transition-colors">Close</button>
            </div>
        </div>
        </Teleport>

    <!-- Slip Picker Modal -->
    <Teleport to="body">
    <div v-if="showSlipPickerModal" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center" @click.self="showSlipPickerModal = false">
        <div class="bg-white dark:bg-card-dark rounded-2xl p-6 w-full max-w-sm m-4 border border-gray-200 dark:border-white/10 shadow-2xl">
            <h3 class="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <span class="material-symbols-outlined text-primary">{{ slipPickerType === 'vehicleSafetyChecklist' ? 'health_and_safety' : 'inventory_2' }}</span>
                {{ slipPickerType === 'vehicleSafetyChecklist' ? 'Safety Checklist' : 'Asset Checkout' }} — Select Driver
            </h3>
            <div class="mb-4">
                <label class="text-xs text-gray-400 mb-1 block">Driver</label>
                <select v-model="slipPickerDriver" class="w-full bg-gray-100 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none">
                    <option v-for="d in drivers" :key="d.id" :value="d" class="bg-white dark:bg-gray-800">{{ d.name }} — {{ d.vehicle || 'No vehicle' }}</option>
                </select>
            </div>
            <div class="flex gap-2">
                <button @click="confirmSlipOpen" :disabled="!slipPickerDriver"
                    class="flex-1 bg-primary text-black font-bold py-2 rounded-lg text-sm disabled:opacity-50 hover:bg-primary-dark transition-colors">
                    Generate Slip
                </button>
                <button @click="showSlipPickerModal = false" class="flex-1 bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white py-2 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-white/20 transition-colors">Cancel</button>
            </div>
        </div>
    </div>
    </Teleport>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useDispatcherStore } from '@/stores/dispatcherStore'
import { useSlipPrinter } from '@/composables/useSlipPrinter'

const { openSlipWithData } = useSlipPrinter()

const store = useDispatcherStore()
onMounted(() => store.initialize().catch(() => {}))

const driverSearch = ref('')
const statusFilter = ref('')
const authFilter = ref('')
const showHOS = ref(false)
const showBroadcast = ref(false)
const showDriverChat = ref(false)
const showDriverProfile = ref(false)
const chatTargetDriver = ref(null)
const profileTargetDriver = ref(null)
const driverChatMsg = ref('')
const driverChatMessages = ref([])
const broadcastMsg = ref('')
const broadcastSent = ref(false)
const moreMenuDriver = ref(null)
const showSlipPickerModal = ref(false)
const slipPickerType = ref('')
const slipPickerDriver = ref(null)


const drivers = computed(() => store.dispatcherDrivers)

const ACTIVE_STATUSES = ['active', 'on route', 'on_route']
const BREAK_STATUSES  = ['idle', 'on break', 'on_break']

// Computed stats from real backend data
const totalDrivers    = computed(() => drivers.value.length)
const activeDrivers   = computed(() => drivers.value.filter(d => ACTIVE_STATUSES.includes((d.status || '').toLowerCase())).length)
const onBreakDrivers  = computed(() => drivers.value.filter(d => BREAK_STATUSES.includes((d.status || '').toLowerCase())).length)
const offlineDrivers  = computed(() => drivers.value.filter(d => {
    const s = (d.status || '').toLowerCase()
    return !ACTIVE_STATUSES.includes(s) && !BREAK_STATUSES.includes(s)
}).length)
const hosWarnings     = computed(() => drivers.value.filter(d => d.breakDue).length)
const authorizedDrivers = computed(() => drivers.value.filter(d => d.authorized && !d.suspended).length)
const hosWarningDriver  = computed(() => drivers.value.find(d => d.breakDue) || null)

const filteredDrivers = computed(() => {
    return drivers.value.filter(d => {
        if (driverSearch.value) {
            const q = driverSearch.value.toLowerCase()
            if (!d.name.toLowerCase().includes(q) && !(d.phone || '').includes(q) && !(d.vehicle || '').toLowerCase().includes(q)) return false
        }
        if (statusFilter.value === 'HOS') return d.breakDue
        if (statusFilter.value === 'On Route' && d.statusColor !== 'bg-green-500') return false
        if (statusFilter.value === 'Offline' && d.statusColor !== 'bg-gray-500') return false
        if (authFilter.value === 'authorized' && !d.authorized) return false
        if (authFilter.value === 'suspended' && !d.suspended) return false
        if (authFilter.value === 'expired' && d.licenseValid) return false
        return true
    })
})

function chatDriver(driver) {
    chatTargetDriver.value = driver
    driverChatMsg.value = ''
    driverChatMessages.value = (driver.chatHistory || []).length > 0
        ? driver.chatHistory.map((m, i) => ({ id: i, from: m.sender === 'dispatch' ? 'dispatch' : 'driver', text: m.text, time: m.time || '' }))
        : [
            { id: 1, from: 'driver', text: `Hey dispatch, ${driver.name.split(' ')[0]} here. What's up?`, time: '' },
            { id: 2, from: 'dispatch', text: 'Checking in on your status. All good?', time: '' },
            { id: 3, from: 'driver', text: 'All good, on schedule.', time: '' },
        ]
    showDriverChat.value = true
}

function sendDriverChatMsg() {
    if (!driverChatMsg.value.trim()) return
    const text = driverChatMsg.value
    driverChatMessages.value.push({ id: Date.now(), from: 'dispatch', text, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) })
    driverChatMsg.value = ''
    store.sendMessageToDriver(chatTargetDriver.value?.id, text)
    setTimeout(() => {
        const replies = ['Roger that.', 'Copy, will do.', 'Acknowledged.', 'Got it, thanks!']
        driverChatMessages.value.push({ id: Date.now(), from: 'driver', text: replies[Math.floor(Math.random() * replies.length)], time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) })
    }, 1200)
}

function viewDriverProfile(driver) {
    profileTargetDriver.value = driver
    showDriverProfile.value = true
    moreMenuDriver.value = null
}
function assignToDriver(driver) { if (driver.load !== undefined) driver.load = Math.min(100, driver.load + 20) }
function toggleMoreMenu(driver) { moreMenuDriver.value = moreMenuDriver.value === driver.id ? null : driver.id }
function suspendDriver(driver) {
    driver.suspended = !driver.suspended
    driver.authorized = !driver.suspended
    moreMenuDriver.value = null
}

function sendBroadcast() {
    broadcastSent.value = true
    setTimeout(() => { showBroadcast.value = false; broadcastSent.value = false; broadcastMsg.value = '' }, 1500)
}


function getHOSBarClass(hours, maxHours) {
    const pct = (hours / maxHours) * 100
    if (pct >= 90) return 'bg-red-500'
    if (pct >= 75) return 'bg-orange-500'
    return 'bg-green-500'
}

function getHOSTextClass(hours, maxHours) {
    const pct = (hours / maxHours) * 100
    if (pct >= 90) return 'text-red-400'
    if (pct >= 75) return 'text-orange-400'
    return 'text-gray-400'
}

function getHOSStatus(hours, maxHours) {
    const pct = (hours / maxHours) * 100
    if (pct >= 100) return 'LIMIT REACHED — BLOCKED'
    if (pct >= 90) return 'CRITICAL — Near limit'
    if (pct >= 75) return 'Warning — Monitor'
    return 'Compliant'
}

function getHOSStatusClass(hours, maxHours) {
    const pct = (hours / maxHours) * 100
    if (pct >= 90) return 'text-red-400 font-bold'
    if (pct >= 75) return 'text-orange-400'
    return 'text-green-400'
}

function openSlipPicker(type) {
    slipPickerType.value = type
    slipPickerDriver.value = drivers.value[0] || null
    showSlipPickerModal.value = true
}

async function confirmSlipOpen() {
    const driver = slipPickerDriver.value
    if (!driver) return

    // Find the actual vehicle from store by matching the driver's vehicle string
    const vehicle = store.filteredVehicles.find(v =>
        v.id === driver.vehicleId ||
        v.code === driver.vehicle ||
        v.licensePlate === driver.vehicle ||
        v.model === driver.vehicle
    ) || {
        code: driver.vehicle || '—',
        type: driver.vehicle || 'Truck',
        model: driver.vehicle || 'Standard Vehicle'
    }

    await openSlipWithData(slipPickerType.value, driver, vehicle)
    showSlipPickerModal.value = false
}
</script>
