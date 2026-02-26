<template>
    <div class="space-y-6">
        <div class="flex justify-between items-center">
            <h2 class="text-2xl font-bold text-white">Driver Management</h2>
            <div class="flex gap-2">
                <button @click="showBroadcast = true"
                    class="bg-white/5 hover:bg-white/10 text-white border border-white/10 py-2 px-4 rounded-lg transition-colors flex items-center gap-2">
                    <span class="material-symbols-outlined">message</span> Broadcast
                </button>
                <button @click="showOnboard = true"
                    class="bg-primary hover:bg-primary-dark text-background-dark font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors">
                    <span class="material-symbols-outlined">add</span> Onboard Driver
                </button>
            </div>
        </div>

        <!-- Overview Stats -->
        <div class="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div class="glass-panel p-4 rounded-xl text-center">
                <div class="text-2xl font-bold text-white">42</div>
                <div class="text-xs text-gray-400">Total Drivers</div>
            </div>
            <div class="glass-panel p-4 rounded-xl text-center">
                <div class="text-2xl font-bold text-green-400">38</div>
                <div class="text-xs text-gray-400">Active Now</div>
            </div>
            <div class="glass-panel p-4 rounded-xl text-center">
                <div class="text-2xl font-bold text-yellow-500">2</div>
                <div class="text-xs text-gray-400">On Break</div>
            </div>
            <div class="glass-panel p-4 rounded-xl text-center">
                <div class="text-2xl font-bold text-red-500">2</div>
                <div class="text-xs text-gray-400">Maintenance/Off</div>
            </div>
            <div class="glass-panel p-4 rounded-xl text-center">
                <div class="text-2xl font-bold text-orange-400">1</div>
                <div class="text-xs text-gray-400">HOS Warning</div>
            </div>
            <div class="glass-panel p-4 rounded-xl text-center">
                <div class="text-2xl font-bold text-cyan-400">40</div>
                <div class="text-xs text-gray-400">Authorized</div>
            </div>
        </div>

        <!-- HOS Compliance Alert -->
        <div class="p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl flex items-center gap-3">
            <span class="material-symbols-outlined text-orange-400 animate-pulse">warning</span>
            <div class="flex-1">
                <div class="text-sm font-bold text-orange-400">Hours-of-Service Compliance Alert</div>
                <div class="text-xs text-orange-300">Rachel Zane has logged 6.8h of 8h max continuous driving. Break required within 1.2 hours. System will block new assignments at limit.</div>
            </div>
            <button @click="showHOS = !showHOS" class="text-xs bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 px-3 py-1.5 rounded font-bold transition-colors whitespace-nowrap">{{ showHOS ? 'Hide HOS' : 'View HOS' }}</button>
        </div>

        <!-- Drivers List -->
        <div class="glass-panel rounded-xl overflow-hidden">
            <div class="p-4 border-b border-white/5 flex gap-4">
                <input v-model="driverSearch" type="text" placeholder="Search driver by name, ID, or vehicle..."
                    class="flex-1 bg-black/20 border border-white/10 rounded-lg py-2 px-4 text-white focus:outline-none focus:border-primary/50">
                <select v-model="statusFilter" class="bg-black/20 border border-white/10 rounded-lg px-4 text-white">
                    <option value="">All Statuses</option>
                    <option value="On Route">Active</option>
                    <option value="Offline">Inactive</option>
                    <option value="HOS">HOS Warning</option>
                </select>
                <select v-model="authFilter" class="bg-black/20 border border-white/10 rounded-lg px-4 text-white">
                    <option value="">All Auth Status</option>
                    <option value="authorized">Authorized</option>
                    <option value="suspended">Suspended</option>
                    <option value="expired">License Expired</option>
                </select>
            </div>

            <table class="w-full text-left text-sm">
                <thead class="bg-white/5 text-gray-400 uppercase text-[10px] tracking-wider">
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
                <tbody class="divide-y divide-white/5">
                    <tr v-for="driver in filteredDrivers" :key="driver.id" class="hover:bg-white/5 transition-colors group">
                        <td class="p-4">
                            <div class="flex items-center gap-3">
                                <img :src="driver.avatar" class="w-10 h-10 rounded-full bg-gray-700">
                                <div>
                                    <div class="font-bold text-white">{{ driver.name }}</div>
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
                        <td class="p-4 text-gray-300">{{ driver.vehicle }}</td>
                        <td class="p-4">
                            <div class="flex items-center gap-2">
                                <div class="w-16 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                                    <div class="h-full rounded-full" :class="driver.load > 85 ? 'bg-red-500' : 'bg-primary'" :style="`width: ${driver.load}%`"></div>
                                </div>
                                <span class="text-xs text-gray-400">{{ driver.load }}%</span>
                            </div>
                        </td>
                        <td class="p-4">
                            <div class="space-y-1">
                                <div class="flex items-center gap-1.5">
                                    <div class="w-14 h-1.5 bg-gray-700 rounded-full overflow-hidden">
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
                                <button @click="chatDriver(driver)" class="text-gray-500 hover:text-primary p-1" title="Chat"><span
                                        class="material-symbols-outlined text-[18px]">chat</span></button>
                                <button @click="assignToDriver(driver)" class="text-gray-500 hover:text-primary p-1" title="Assign"><span
                                        class="material-symbols-outlined text-[18px]">person_add</span></button>
                                <button @click="toggleMoreMenu(driver)" class="text-gray-500 hover:text-white p-1 relative" title="More">
                                    <span class="material-symbols-outlined text-[18px]">more_vert</span>
                                    <div v-if="moreMenuDriver === driver.id" class="absolute right-0 top-8 bg-card-dark border border-white/10 rounded-lg shadow-xl z-20 w-36 py-1">
                                        <button @click.stop="suspendDriver(driver)" class="block w-full text-left px-3 py-1.5 text-xs text-red-400 hover:bg-white/5">{{ driver.suspended ? 'Unsuspend' : 'Suspend' }}</button>
                                        <button @click.stop="moreMenuDriver = null" class="block w-full text-left px-3 py-1.5 text-xs text-gray-400 hover:bg-white/5">View Profile</button>
                                    </div>
                                </button>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- HOS Detail -->
        <div v-if="showHOS" class="glass-panel p-4 rounded-xl">
            <h3 class="font-bold text-white mb-3">HOS Compliance Overview</h3>
            <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div v-for="d in drivers" :key="d.id" class="p-3 bg-white/5 rounded-lg">
                    <div class="text-sm font-bold text-white mb-1">{{ d.name }}</div>
                    <div class="flex items-center gap-2 mb-1">
                        <div class="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                            <div class="h-full rounded-full" :class="getHOSBarClass(d.hours, d.maxHours)" :style="{ width: (d.hours / d.maxHours) * 100 + '%' }"></div>
                        </div>
                        <span class="text-xs font-mono" :class="getHOSTextClass(d.hours, d.maxHours)">{{ d.hours }}h</span>
                    </div>
                    <div class="text-[10px]" :class="getHOSStatusClass(d.hours, d.maxHours)">{{ getHOSStatus(d.hours, d.maxHours) }}</div>
                </div>
            </div>
        </div>

        <!-- Broadcast Modal -->
        <div v-if="showBroadcast" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center" @click.self="showBroadcast = false">
            <div class="glass-panel rounded-2xl p-6 w-full max-w-md m-4 border border-white/10">
                <h3 class="font-bold text-white mb-4">Broadcast Message</h3>
                <textarea v-model="broadcastMsg" rows="3" placeholder="Type message for all drivers..."
                    class="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none mb-3"></textarea>
                <div class="flex gap-2">
                    <button @click="sendBroadcast" class="flex-1 bg-primary text-black font-bold py-2 rounded-lg text-sm">Send to All</button>
                    <button @click="showBroadcast = false" class="flex-1 bg-white/10 text-white py-2 rounded-lg text-sm">Cancel</button>
                </div>
                <div v-if="broadcastSent" class="mt-2 text-center text-xs text-green-400 font-bold">✓ Broadcast sent to {{ filteredDrivers.length }} drivers</div>
            </div>
        </div>

        <!-- Onboard Modal -->
        <div v-if="showOnboard" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center" @click.self="showOnboard = false">
            <div class="glass-panel rounded-2xl p-6 w-full max-w-md m-4 border border-white/10">
                <h3 class="font-bold text-white mb-4">Onboard New Driver</h3>
                <div class="space-y-3">
                    <input v-model="newDriver.name" type="text" placeholder="Full Name" class="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none">
                    <input v-model="newDriver.phone" type="text" placeholder="Phone Number" class="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none">
                    <select v-model="newDriver.vehicle" class="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none">
                        <option value="">Assign Vehicle</option>
                        <option>Van T-15</option><option>Van T-20</option><option>Truck M</option><option>Truck XL</option>
                    </select>
                </div>
                <div class="flex gap-2 mt-4">
                    <button @click="onboardDriver" :disabled="!newDriver.name" class="flex-1 bg-primary text-black font-bold py-2 rounded-lg text-sm disabled:opacity-50">Onboard</button>
                    <button @click="showOnboard = false" class="flex-1 bg-white/10 text-white py-2 rounded-lg text-sm">Cancel</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'

const driverSearch = ref('')
const statusFilter = ref('')
const authFilter = ref('')
const showHOS = ref(false)
const showBroadcast = ref(false)
const showOnboard = ref(false)
const broadcastMsg = ref('')
const broadcastSent = ref(false)
const moreMenuDriver = ref(null)
const newDriver = reactive({ name: '', phone: '', vehicle: '' })

const drivers = ref([
    { id: 1, name: 'Mike Ross', phone: '+1 555-0123', status: 'On Route', statusClass: 'bg-green-500/10 text-green-500 border-green-500/20', vehicle: 'Van T-20', load: 45, hours: 4.2, maxHours: 10, stops: 12, avatar: 'https://i.pravatar.cc/150?u=1', authorized: true, licenseValid: true, suspended: false, maintenance: false, breakDue: false, breakDueIn: '' },
    { id: 2, name: 'Harvey Specter', phone: '+1 555-0124', status: 'Idle', statusClass: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20', vehicle: 'Truck XL', load: 0, hours: 1.5, maxHours: 10, stops: 0, avatar: 'https://i.pravatar.cc/150?u=2', authorized: true, licenseValid: true, suspended: false, maintenance: false, breakDue: false, breakDueIn: '' },
    { id: 3, name: 'Rachel Zane', phone: '+1 555-0125', status: 'On Route', statusClass: 'bg-green-500/10 text-green-500 border-green-500/20', vehicle: 'Van T-15', load: 10, hours: 6.8, maxHours: 8, stops: 24, avatar: 'https://i.pravatar.cc/150?u=3', authorized: true, licenseValid: true, suspended: false, maintenance: false, breakDue: true, breakDueIn: '1.2h' },
    { id: 4, name: 'Louis Litt', phone: '+1 555-0126', status: 'Offline', statusClass: 'bg-gray-500/10 text-gray-500 border-gray-500/20', vehicle: 'n/a', load: 0, hours: 0, maxHours: 10, stops: 0, avatar: 'https://i.pravatar.cc/150?u=4', authorized: false, licenseValid: false, suspended: true, maintenance: true, breakDue: false, breakDueIn: '' },
])

const filteredDrivers = computed(() => {
    return drivers.value.filter(d => {
        if (driverSearch.value) {
            const q = driverSearch.value.toLowerCase()
            if (!d.name.toLowerCase().includes(q) && !d.phone.includes(q) && !d.vehicle.toLowerCase().includes(q)) return false
        }
        if (statusFilter.value === 'HOS') return d.breakDue
        if (statusFilter.value && d.status !== statusFilter.value) return false
        if (authFilter.value === 'authorized' && !d.authorized) return false
        if (authFilter.value === 'suspended' && !d.suspended) return false
        if (authFilter.value === 'expired' && d.licenseValid) return false
        return true
    })
})

function chatDriver(driver) { alert(`Opening chat with ${driver.name}...`) }
function assignToDriver(driver) { driver.load = Math.min(100, driver.load + 20); driver.stops += 3 }
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

function onboardDriver() {
    drivers.value.push({
        id: Date.now(), name: newDriver.name, phone: newDriver.phone || '+1 555-0000',
        status: 'Idle', statusClass: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
        vehicle: newDriver.vehicle || 'Unassigned', load: 0, hours: 0, maxHours: 10, stops: 0,
        avatar: `https://i.pravatar.cc/150?u=${Date.now()}`,
        authorized: true, licenseValid: true, suspended: false, maintenance: false, breakDue: false, breakDueIn: ''
    })
    showOnboard.value = false
    newDriver.name = ''; newDriver.phone = ''; newDriver.vehicle = ''
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
</script>
