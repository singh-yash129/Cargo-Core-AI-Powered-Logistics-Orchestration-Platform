<template>
    <div class="space-y-6">
        <div class="flex justify-between items-center">
            <div class="flex items-center gap-3">
                <div
                    class="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center animate-pulse shadow-lg shadow-red-500/30">
                    <span class="material-symbols-outlined text-gray-900 dark:text-white">warning</span>
                </div>
                <h2 class="text-2xl font-bold text-red-400">Crisis Management Center</h2>
            </div>
            <div class="flex items-center gap-3">
                <span class="text-xs text-gray-400">{{ activeCrises.length }} Active</span>
                <button @click="showBroadcast = true" class="bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700 text-white border border-red-700 dark:border-red-500 font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors text-sm shadow-md">
                    <span class="material-symbols-outlined text-[18px]">notification_important</span>
                    Broadcast Alert
                </button>
            </div>
        </div>

        <!-- Disruption Detection Alerts -->
        <div v-if="disruptions.length" class="space-y-2">
            <div v-for="d in disruptions" :key="d.id"
                class="flex items-center justify-between p-3 rounded-lg border"
                :class="d.severity === 'critical' ? 'bg-red-500/10 border-red-500/20' : 'bg-yellow-500/10 border-yellow-500/20'">
                <div class="flex items-center gap-3">
                    <span class="material-symbols-outlined"
                        :class="d.severity === 'critical' ? 'text-red-400' : 'text-yellow-400'">{{ d.icon }}</span>
                    <div>
                        <div class="text-sm text-gray-900 dark:text-white font-medium">{{ d.title }}</div>
                        <div class="text-[10px] text-gray-500 dark:text-gray-400">{{ d.detail }} • Affects {{ d.affected }} drivers</div>
                    </div>
                </div>
                <div class="flex gap-2">
                    <button @click="autoReroute(d)" class="text-xs px-3 py-1.5 rounded-lg font-bold transition-all border shadow-sm"
                        :class="d.rerouted ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 border-green-300 dark:border-green-500/30' : 'bg-gray-200 dark:bg-white/10 hover:bg-gray-300 dark:hover:bg-white/20 text-gray-900 dark:text-white border-gray-300 dark:border-white/20'">
                        {{ d.rerouted ? '✓ Rerouted' : 'Auto-Reroute' }}
                    </button>
                    <button @click="updateETAs(d)" class="text-xs px-3 py-1.5 rounded-lg font-bold transition-all border shadow-sm"
                        :class="d.etaUpdated ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 border-green-300 dark:border-green-500/30' : 'bg-blue-600 dark:bg-blue-500/20 hover:bg-blue-700 dark:hover:bg-blue-500/30 text-white dark:text-blue-400 border-blue-700 dark:border-blue-500/30'">
                        {{ d.etaUpdated ? '✓ ETAs Updated' : 'Update ETAs' }}
                    </button>
                </div>
            </div>
        </div>

        <!-- Active Crisis Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div v-for="crisis in activeCrises" :key="crisis.id"
                class="border rounded-xl p-6 relative overflow-hidden"
                :class="crisis.level === 'CRITICAL' ? 'bg-red-500/10 border-red-500/30' : 'bg-yellow-500/10 border-yellow-500/30'">
                <div class="flex justify-between items-start mb-4">
                    <div class="flex items-center gap-2">
                        <span class="px-2 py-1 text-xs font-bold rounded"
                            :class="crisis.level === 'CRITICAL' ? 'bg-red-500 text-white animate-pulse' : 'bg-yellow-500 text-black'">
                            {{ crisis.level }}
                        </span>
                        <span class="text-gray-900 dark:text-white font-bold">{{ crisis.title }}</span>
                    </div>
                    <div class="text-xs text-gray-500 dark:text-gray-400">{{ crisis.timeAgo }}</div>
                </div>
                <div class="text-gray-600 dark:text-gray-200 text-sm mb-3">{{ crisis.description }}</div>

                <!-- Affected Orders / Reassignment -->
                <div v-if="crisis.affectedOrders?.length" class="mb-3 p-3 bg-gray-100 dark:bg-black/30 rounded-lg">
                    <div class="text-[10px] text-gray-500 dark:text-gray-500 uppercase font-bold mb-2">Affected Orders – Reassignment Required</div>
                    <div class="space-y-1">
                        <div v-for="order in crisis.affectedOrders" :key="order.id"
                            class="flex items-center justify-between text-xs">
                            <span class="text-gray-600 dark:text-gray-300">{{ order.id }} – {{ order.dest }}</span>
                            <div class="flex items-center gap-2">
                                <span v-if="order.reassigned" class="text-green-400 font-bold">→ {{ order.newDriver }}</span>
                                <button v-else @click="reassignOrder(crisis.id, order.id)"
                                    class="bg-emerald-600 hover:bg-emerald-700 dark:bg-primary/20 dark:hover:bg-primary/30 text-white dark:text-primary px-2.5 py-1 rounded-lg font-bold transition-colors text-xs shadow-sm">
                                    Reassign
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- ETA Update + AI Bot Notification -->
                <div class="mb-3 flex items-center gap-2 text-[10px]">
                    <span class="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded font-bold">ETA Updated</span>
                    <span class="text-gray-500">Customers notified via AI Bot</span>
                </div>

                <div class="flex gap-3">
                    <button v-for="action in crisis.actions" :key="action.label"
                        @click="handleCrisisAction(crisis, action)"
                        :class="[action.baseClass, action.done ? 'opacity-60 cursor-default' : '']" 
                        class="flex-1 font-bold py-2.5 rounded-lg transition-all text-sm border shadow-md">{{ action.done ? '✓ ' + action.label : action.label }}</button>
                </div>
            </div>
        </div>

        <!-- Live Crisis Map + Re-optimization -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div class="lg:col-span-2 glass-panel rounded-xl h-[400px] relative overflow-hidden">
                <div class="absolute inset-0 bg-gray-200 dark:bg-gray-800 bg-gradient-to-br from-gray-200 dark:from-gray-800 to-gray-100 dark:to-gray-900 opacity-50"></div>
                <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div class="bg-white/90 dark:bg-black/80 backdrop-blur border border-red-500/30 px-6 py-4 rounded-xl text-center">
                        <div class="text-red-400 font-bold text-lg mb-1">Live Crisis Map</div>
                        <div class="text-gray-400 text-xs">Showing {{ activeCrises.length }} active incidents</div>
                    </div>
                </div>
                <!-- Simulated Pins -->
                <div class="absolute top-1/3 left-1/4 w-4 h-4 rounded-full bg-red-500 animate-ping"></div>
                <div class="absolute top-1/3 left-1/4 w-4 h-4 rounded-full bg-red-500 border-2 border-white"></div>
                <div class="absolute bottom-1/3 right-1/3 w-4 h-4 rounded-full bg-yellow-500 animate-ping"></div>
                <div class="absolute bottom-1/3 right-1/3 w-4 h-4 rounded-full bg-yellow-500 border-2 border-white"></div>
                <!-- Weather overlay indicator -->
                <div v-if="weatherDisruptions.length" class="absolute top-4 right-4 bg-white/90 dark:bg-black/80 backdrop-blur border border-gray-200 dark:border-white/10 rounded-lg p-3">
                    <div class="text-[10px] text-gray-500 uppercase font-bold mb-1">Weather Disruptions</div>
                    <div v-for="wd in weatherDisruptions" :key="wd.id" class="flex items-center gap-2 text-xs text-yellow-400 mt-1">
                        <span class="material-symbols-outlined text-[16px]">thunderstorm</span> {{ wd.title }}
                    </div>
                </div>
            </div>

            <!-- Re-Optimization Panel -->
            <div class="glass-panel rounded-xl p-6 flex flex-col">
                <h3 class="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <span class="material-symbols-outlined text-primary">autorenew</span>
                    Re-Optimization Engine
                </h3>
                <div class="space-y-3 flex-1">
                    <div class="p-3 bg-gray-50 dark:bg-white/5 rounded-lg">
                        <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">Impacted Routes</div>
                        <div class="text-gray-900 dark:text-white font-bold text-xl">{{ activeCrises.length }}</div>
                    </div>
                    <div class="p-3 bg-gray-50 dark:bg-white/5 rounded-lg">
                        <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">Orders to Reassign</div>
                        <div class="text-gray-900 dark:text-white font-bold text-xl">{{ activeCrises.reduce((sum, c) => sum + (c.affectedOrders?.length || 0), 0) || 0 }}</div>
                    </div>
                    <div class="p-3 bg-gray-50 dark:bg-white/5 rounded-lg">
                        <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">Available Backup Drivers</div>
                        <div class="text-primary font-bold text-xl">{{ backupDriverCount }}</div>
                    </div>
                    <div class="p-3 bg-gray-50 dark:bg-white/5 rounded-lg">
                        <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">Disruptions Detected</div>
                        <div class="text-yellow-400 font-bold text-xl">{{ disruptions.length }}</div>
                    </div>
                </div>
                <button @click="runReoptimization"
                    class="mt-4 w-full bg-primary hover:bg-primary-dark text-black font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2">
                    <span class="material-symbols-outlined">bolt</span>
                    Run Re-Optimization
                </button>
                <div v-if="reoptRunning" class="mt-2 text-center text-xs text-primary animate-pulse">
                    Re-optimizing {{ activeCrises.length }} routes...
                </div>
            </div>
        </div>

        <!-- Crisis History Log -->
        <div class="glass-panel rounded-xl p-6">
            <h3 class="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <span class="material-symbols-outlined text-green-600 dark:text-green-500">task_alt</span>
                Resolved Incidents (Today)
            </h3>
            <div class="space-y-3">
                <div v-for="resolved in resolvedIncidents" :key="resolved.id"
                    class="flex items-start gap-3 p-3 rounded-lg border border-transparent hover:border-gray-200 dark:hover:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 transition-all">
                    <span class="material-symbols-outlined text-green-600 dark:text-green-500 text-[20px]">check_circle</span>
                    <div class="flex-1">
                        <div class="text-gray-800 dark:text-gray-200 text-sm font-semibold mb-1">{{ resolved.title }}</div>
                        <div class="text-xs text-gray-600 dark:text-gray-400">{{ resolved.detail }}</div>
                    </div>
                    <span class="text-xs text-gray-700 dark:text-gray-300 font-mono font-semibold bg-gray-100 dark:bg-white/5 px-2 py-1 rounded">{{ resolved.time }}</span>
                </div>
            </div>
        </div>

        <!-- Broadcast Alert Modal -->
        <Teleport to="body">
        <div v-if="showBroadcast" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center" @click.self="showBroadcast = false">
            <div class="bg-white dark:bg-card-dark shadow-2xl border border-red-300 dark:border-red-500/20 rounded-2xl p-6 w-full max-w-md m-4">
                <h3 class="font-bold text-red-600 dark:text-red-400 mb-4 flex items-center gap-2">
                    <span class="material-symbols-outlined">campaign</span> Broadcast Crisis Alert
                </h3>
                <select v-model="broadcastSeverity" class="w-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none mb-3">
                    <option class="bg-white dark:bg-gray-800" value="critical">CRITICAL — Immediate action required</option>
                    <option class="bg-white dark:bg-gray-800" value="high">HIGH — Urgent attention</option>
                    <option class="bg-white dark:bg-gray-800" value="warning">WARNING — Advisory</option>
                </select>
                <textarea v-model="broadcastMsg" rows="3" placeholder="Alert message for all drivers..."
                    class="w-full bg-gray-100 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none mb-3"></textarea>
                <div class="flex gap-2">
                    <button @click="sendBroadcast" :disabled="!broadcastMsg" class="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2 rounded-lg text-sm disabled:opacity-40 disabled:cursor-not-allowed">Broadcast Now</button>
                    <button @click="showBroadcast = false" class="flex-1 bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white py-2 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-white/20 transition-colors">Cancel</button>
                </div>
                <div v-if="broadcastSent" class="mt-2 text-center text-xs text-green-400 font-bold">✓ Alert broadcast to all active drivers</div>
            </div>
        </div>
        </Teleport>

        <!-- Contact Driver Modal -->
        <Teleport to="body">
        <div v-if="showDriverContact" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center" @click.self="showDriverContact = false">
            <div class="bg-white dark:bg-card-dark shadow-2xl border border-gray-200 dark:border-white/10 rounded-2xl p-6 w-full max-w-md m-4">
                <h3 class="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <span class="material-symbols-outlined text-primary">support_agent</span> Contact Driver
                </h3>
                <div class="space-y-4">
                    <div class="flex items-center gap-4">
                        <img :src="contactDriver?.avatar" class="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700">
                        <div>
                            <div class="font-bold text-gray-900 dark:text-white text-lg">{{ contactDriver?.name }}</div>
                            <div class="text-sm text-gray-500 dark:text-gray-400">{{ contactDriver?.vehicle }}</div>
                        </div>
                    </div>
                    <div class="p-4 bg-gray-100 dark:bg-white/5 rounded-lg">
                        <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">Phone Number</div>
                        <div class="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <span class="material-symbols-outlined text-primary">phone</span>
                            {{ contactDriver?.phone }}
                        </div>
                    </div>
                    <div class="p-4 bg-gray-100 dark:bg-white/5 rounded-lg">
                        <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">Current Status</div>
                        <div class="text-sm font-semibold text-gray-900 dark:text-white">{{ contactDriver?.status }}</div>
                    </div>
                    <div class="p-4 bg-gray-100 dark:bg-white/5 rounded-lg">
                        <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">Last Known Location</div>
                        <div class="text-sm font-semibold text-gray-900 dark:text-white">{{ contactDriver?.location }}</div>
                    </div>
                </div>
                <div class="flex gap-2 mt-6">
                    <button @click="callDriver" class="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors shadow-md">
                        <span class="material-symbols-outlined text-[18px]">call</span> Call Now
                    </button>
                    <button @click="showDriverContact = false" class="flex-1 bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white py-2.5 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-white/20 transition-colors font-bold">Close</button>
                </div>
            </div>
        </div>
        </Teleport>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useDispatcherStore } from '@/stores/dispatcherStore'

const store = useDispatcherStore()
onMounted(() => store.initialize().catch(() => {}))

const reoptRunning = ref(false)
const showBroadcast = ref(false)
const showDriverContact = ref(false)
const contactDriver = ref(null)
const broadcastMsg = ref('')
const broadcastSeverity = ref('critical')
const broadcastSent = ref(false)

const disruptions = computed(() =>
    store.disruptions.map(d => ({ ...d, rerouted: false, etaUpdated: false }))
)

const weatherDisruptions = computed(() =>
    store.disruptions.filter(d => d.type === 'weather' || d.icon === 'thunderstorm' || d.icon === 'foggy')
)

const backupDriverCount = computed(() =>
    store.dispatcherDrivers.filter(d => !d.breakDue && d.statusColor === 'bg-green-500' && (d.load || 0) < 30).length
)

const activeCrises = computed(() =>
    store.activeCrises.map(c => ({
        ...c,
        affectedOrders: [],
        actions: [
            { label: 'Dispatch Recovery', baseClass: 'bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white border-red-700 dark:border-red-400' },
            { label: 'Ignore', baseClass: 'bg-gray-300 hover:bg-gray-400 dark:bg-white/10 dark:hover:bg-white/20 text-gray-900 dark:text-white border-gray-400 dark:border-white/20' }
        ],
        driver: { name: c.driver || 'Unknown', phone: '', vehicle: '', status: c.title, location: c.description || '', avatar: '' }
    }))
)

const resolvedIncidents = ref([])

function reassignOrder(crisisId, orderId) {
    const crisis = activeCrises.value.find(c => c.id === crisisId)
    if (crisis) {
        const order = crisis.affectedOrders.find(o => o.id === orderId)
        if (order) {
            order.reassigned = true
            order.newDriver = 'DRV-099 (Auto-assigned)'
        }
    }
}

function runReoptimization() {
    reoptRunning.value = true
    setTimeout(() => { reoptRunning.value = false }, 3000)
}

function autoReroute(disruption) {
    disruption.rerouted = true
    disruption.affected = Math.max(0, disruption.affected - 2)
}

function updateETAs(disruption) {
    disruption.etaUpdated = true
}

function handleCrisisAction(crisis, action) {
    if (action.done) return // Prevent double-click
    
    action.done = true
    
    if (action.label === 'Contact Driver') {
        contactDriver.value = crisis.driver
        showDriverContact.value = true
        action.done = false // Reset so button can be clicked again
        return
    }
    
    if (action.label === 'Ignore') {
        // Resolve the alert in the store
        store.resolveAlert(crisis.id).catch(() => {})
        return
    }
    
    if (action.label === 'Dispatch Recovery' || action.label === 'Reroute All') {
        crisis.affectedOrders?.forEach(o => {
            if (!o.reassigned) { o.reassigned = true; o.newDriver = 'DRV-Auto (Recovery)' }
        })
    }
}

function callDriver() {
    // Simulate call action
    window.open(`tel:${contactDriver.value?.phone}`)
    showDriverContact.value = false
}

function sendBroadcast() {
    broadcastSent.value = true
    setTimeout(() => { showBroadcast.value = false; broadcastSent.value = false; broadcastMsg.value = '' }, 1500)
}
</script>
