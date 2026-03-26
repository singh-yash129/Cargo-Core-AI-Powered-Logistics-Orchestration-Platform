<template>
    <div class="space-y-6">
        <div class="flex justify-between items-center">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Manifest Center</h2>
            <div class="flex gap-2">
                <button @click="openTripManifestSlip"
                    :disabled="manifests.length === 0"
                    class="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 text-sm transition-colors">
                    <span class="material-symbols-outlined text-[18px]">assignment</span>
                    Trip Manifest
                </button>
                <button @click="openSafetyChecklist"
                    :disabled="manifests.length === 0"
                    class="bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 text-sm transition-colors">
                    <span class="material-symbols-outlined text-[18px]">health_and_safety</span>
                    Safety Check
                </button>
                <button @click="showManifestDetail = !showManifestDetail"
                    class="bg-gray-50 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 py-2 px-4 rounded-lg transition-colors flex items-center gap-2 text-sm">
                    <span class="material-symbols-outlined text-[18px]">{{ showManifestDetail ? 'table_view' : 'view_agenda' }}</span>
                    {{ showManifestDetail ? 'Table View' : 'Detail View' }}
                </button>
            </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- New Manifest Form -->
            <div class="glass-panel p-6 rounded-xl">
                <h3 class="font-bold text-gray-900 dark:text-white mb-4">Create Manifest</h3>
                <div class="space-y-4">
                    <div>
                        <label class="block text-xs text-gray-500 dark:text-gray-400 mb-1">Select Hub</label>
                        <select v-model="newManifest.hub"
                            class="w-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-white/10 rounded-lg p-2 text-gray-900 dark:text-white text-sm">
                            <option v-for="h in hubOptions" :key="h" class="bg-white dark:bg-gray-800">{{ h }}</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-xs text-gray-500 dark:text-gray-400 mb-1">Select Driver</label>
                        <select v-model="newManifest.driver"
                            class="w-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-white/10 rounded-lg p-2 text-gray-900 dark:text-white text-sm">
                            <option class="bg-white dark:bg-gray-800" value="">Choose Driver...</option>
                            <option v-for="d in driverOptions" :key="d" class="bg-white dark:bg-gray-800">{{ d }}</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-xs text-gray-500 dark:text-gray-400 mb-1">Select Vehicle</label>
                        <select v-model="newManifest.vehicle"
                            class="w-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-white/10 rounded-lg p-2 text-gray-900 dark:text-white text-sm">
                            <option v-for="v in vehicleOptions" :key="v" class="bg-white dark:bg-gray-800">{{ v }}</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-xs text-gray-500 dark:text-gray-400 mb-1">Route ID
                            (Auto-generated)</label>
                        <input type="text" :value="generatedRouteId" readonly
                            class="w-full bg-gray-200 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-lg p-2 text-gray-500 text-sm">
                    </div>
                    <div>
                        <label class="block text-xs text-gray-500 dark:text-gray-400 mb-1">Labor Crew (if
                            applicable)</label>
                        <select v-model="newManifest.crew"
                            class="w-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-white/10 rounded-lg p-2 text-gray-900 dark:text-white text-sm">
                            <option class="bg-white dark:bg-gray-800">No crew needed</option>
                            <option class="bg-white dark:bg-gray-800">2 loaders</option>
                            <option class="bg-white dark:bg-gray-800">3 loaders + 1 helper</option>
                            <option class="bg-white dark:bg-gray-800">Custom crew assign...</option>
                        </select>
                    </div>
                    <div class="pt-2">
                        <button @click="generateManifest" :disabled="!newManifest.driver"
                            class="w-full bg-primary hover:bg-primary-dark text-black font-bold py-2 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed">Generate
                            Manifest</button>
                        <div v-if="manifestGenerated" class="text-center text-xs text-green-400 mt-2 font-bold">✓
                            Manifest created successfully</div>
                    </div>
                </div>
            </div>

            <!-- Recent Manifests -->
            <div class="lg:col-span-2 glass-panel rounded-xl overflow-hidden">
                <div class="p-6 border-b border-gray-200 dark:border-white/5 flex justify-between">
                    <h3 class="font-bold text-gray-900 dark:text-white">Today's Manifests</h3>
                    <div class="flex gap-2 text-xs">
                        <span v-if="dispatchedManifests > 0"
                            class="px-2 py-1 bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-500 rounded text-xs font-bold">{{ dispatchedManifests }} Dispatched</span>
                        <span v-if="pendingManifests > 0"
                            class="px-2 py-1 bg-yellow-100 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-500 rounded text-xs font-bold">{{ pendingManifests }} Pending</span>
                        <span v-if="manifests.length === 0" class="px-2 py-1 bg-gray-100 dark:bg-white/5 text-gray-500 rounded text-xs">No manifests yet</span>
                    </div>
                </div>

                <table class="w-full text-left text-sm">
                    <thead class="bg-gray-50 dark:bg-white/5 text-gray-400 uppercase text-[10px] tracking-wider">
                        <tr>
                            <th class="p-4">Manifest ID</th>
                            <th class="p-4">Driver</th>
                            <th class="p-4">Orders</th>
                            <th class="p-4">Weight</th>
                            <th class="p-4">Distance</th>
                            <th class="p-4">Stops</th>
                            <th class="p-4">Status</th>
                            <th class="p-4">Action</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-200 dark:divide-white/5">
                        <tr v-for="manifest in manifests" :key="manifest.id"
                            class="hover:bg-gray-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
                            @click="selectedManifest = manifest; showManifestDetail = true">
                            <td class="p-4 font-mono text-gray-900 dark:text-white">{{ manifest.id }}</td>
                            <td class="p-4 text-gray-600 dark:text-gray-300">{{ manifest.driver }}</td>
                            <td class="p-4 text-gray-600 dark:text-gray-300">{{ manifest.orders }}</td>
                            <td class="p-4 text-gray-600 dark:text-gray-300">{{ manifest.weight }} kg</td>
                            <td class="p-4 text-gray-600 dark:text-gray-300">{{ manifest.totalDistance }} km</td>
                            <td class="p-4 text-gray-600 dark:text-gray-300">{{ manifest.stopCount }}</td>
                            <td class="p-4">
                                <span class="px-2 py-1 rounded text-[10px] font-bold border"
                                    :class="manifest.statusClass">
                                    {{ manifest.status }}
                                </span>
                            </td>
                            <td class="p-4 flex gap-2">
                                <!-- View Button -->
                                <button @click.stop="selectedManifest = manifest; showManifestDetail = true"
                                    class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-xs font-bold transition-colors"
                                    title="View Details">
                                    <span class="material-symbols-outlined text-[14px]">visibility</span>
                                </button>

                                <!-- Print Button -->
                                <button @click.stop="printManifest(manifest)"
                                    class="text-gray-700 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 text-xs font-bold flex items-center gap-0.5 transition-colors"
                                    title="Print Manifest">
                                    <span class="material-symbols-outlined text-[14px]">print</span>
                                </button>

                                <!-- Push to Driver Button -->
                                <button @click.stop="pushToDriver(manifest)"
                                    class="text-xs font-bold transition-colors flex items-center gap-0.5"
                                    :class="manifest.pushed ? 'text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300' : 'text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300'"
                                    :title="manifest.pushed ? 'Already Pushed' : 'Push to Driver App'">
                                    <span class="material-symbols-outlined text-[14px]">{{ manifest.pushed ?
                                        'check_circle' : 'send' }}</span>
                                    {{ manifest.pushed ? '✓ Pushed' : 'Push to Driver' }}
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Manifest Detail View (Digital Manifest) -->
        <div v-if="showManifestDetail && selectedManifest" class="glass-panel rounded-xl p-6">
            <div class="flex justify-between items-center mb-6">
                <h3 class="font-bold text-gray-900 dark:text-white text-lg flex items-center gap-2">
                    <span class="material-symbols-outlined text-primary">description</span>
                    Digital Manifest: {{ selectedManifest.id }}
                </h3>
                <div class="flex gap-2">
                    <button @click="printManifest(selectedManifest)"
                        class="bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-900 dark:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 border border-gray-200 dark:border-white/10">
                        <span class="material-symbols-outlined text-[14px]">print</span> {{ selectedManifest.printed ?
                        '✓ Printed' : 'Print' }}
                    </button>
                    <button @click="pushToDriver(selectedManifest)"
                        class="px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 border"
                        :class="selectedManifest.pushed ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 border-green-300 dark:border-green-500/30' : 'bg-primary/10 hover:bg-primary/20 text-primary border-primary/30'">
                        <span class="material-symbols-outlined text-[14px]">send</span>
                         {{ selectedManifest.pushed ? '✓ Pushed' : 'Push to Driver App' }}
                    </button>
                </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <!-- Manifest Summary -->
                <div class="p-4 bg-gray-50 dark:bg-white/5 rounded-xl space-y-3">
                    <div class="text-[10px] text-gray-500 dark:text-gray-500 uppercase font-bold tracking-wider">
                        Manifest Summary</div>
                    <div class="space-y-2 text-xs">
                        <div class="flex justify-between"><span class="text-gray-400">Driver</span><span
                                class="text-gray-900 dark:text-white font-bold">{{ selectedManifest.driver }}</span>
                        </div>
                        <div class="flex justify-between"><span class="text-gray-400">Vehicle</span><span
                                class="text-gray-900 dark:text-white">{{ selectedManifest.vehicle }}</span></div>
                        <div class="flex justify-between"><span class="text-gray-400">Total Weight</span><span
                                class="text-gray-900 dark:text-white">{{ selectedManifest.weight }} kg</span></div>
                        <div class="flex justify-between"><span class="text-gray-400">Total Distance</span><span
                                class="text-gray-900 dark:text-white">{{ selectedManifest.totalDistance }} km</span>
                        </div>
                        <div class="flex justify-between"><span class="text-gray-400">Total Stops</span><span
                                class="text-gray-900 dark:text-white">{{ selectedManifest.stopCount }}</span></div>
                        <div class="flex justify-between"><span class="text-gray-400">Est. Trip Duration</span><span
                                class="text-gray-900 dark:text-white">{{ selectedManifest.estDuration }}</span></div>
                    </div>
                </div>

                <!-- Labor Crew List -->
                <div class="p-4 bg-gray-50 dark:bg-white/5 rounded-xl">
                    <div class="text-[10px] text-gray-500 dark:text-gray-500 uppercase font-bold tracking-wider mb-3">
                        Labor / Crew List</div>
                    <div v-if="selectedManifest.crew && selectedManifest.crew.length > 0" class="space-y-2">
                        <div v-for="member in selectedManifest.crew" :key="member.name"
                            class="flex items-center justify-between p-2 bg-gray-100 dark:bg-black/20 rounded text-xs">
                            <div class="flex items-center gap-2">
                                <span class="material-symbols-outlined text-[14px]"
                                    :class="member.role === 'Driver' ? 'text-primary' : 'text-blue-400'">
                                    {{ member.role === 'Driver' ? 'local_shipping' : 'person' }}
                                </span>
                                <span class="text-gray-900 dark:text-white">{{ member.name }}</span>
                            </div>
                            <span class="text-gray-400">{{ member.role }}</span>
                        </div>
                    </div>
                    <div v-else class="text-xs text-gray-500 text-center py-4">No crew assigned — parcel delivery only
                    </div>
                </div>

                <!-- Load Summary -->
                <div class="p-4 bg-gray-50 dark:bg-white/5 rounded-xl">
                    <div class="text-[10px] text-gray-500 dark:text-gray-500 uppercase font-bold tracking-wider mb-3">
                        Load Details</div>
                    <div class="space-y-2 text-xs">
                        <div class="flex justify-between"><span class="text-gray-400">Total Parcels</span><span
                                class="text-gray-900 dark:text-white">{{ selectedManifest.orders }}</span></div>
                        <div class="flex justify-between"><span class="text-gray-400">Total Volume</span><span
                                class="text-gray-900 dark:text-white">{{ selectedManifest.totalVolume }} m³</span></div>
                        <div class="flex justify-between"><span class="text-gray-400">Fragile Items</span><span
                                class="text-yellow-400">{{ selectedManifest.fragileCount }}</span></div>
                        <div class="flex justify-between"><span class="text-gray-400">Perishable</span><span
                                class="text-blue-400">{{ selectedManifest.perishableCount }}</span></div>
                        <div class="flex justify-between"><span class="text-gray-400">COD Orders</span><span
                                class="text-green-400">{{ selectedManifest.codCount }}</span></div>
                    </div>
                </div>
            </div>

            <!-- Stop Sequence with ETA -->
            <div class="text-[10px] text-gray-500 dark:text-gray-500 uppercase font-bold tracking-wider mb-3">Stop
                Sequence & Estimated Arrival</div>
            <div class="space-y-2">
                <div v-for="(stop, index) in selectedManifest.stops" :key="stop.id"
                    class="flex items-center gap-4 p-3 bg-gray-50 dark:bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                    <!-- Stop Number -->
                    <div class="flex flex-col items-center">
                        <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                            :class="stop.completed ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-primary/20 text-primary border border-primary/30'">
                            {{ index + 1 }}
                        </div>
                        <div v-if="index < selectedManifest.stops.length - 1" class="w-0.5 h-4 bg-gray-600 mt-1"></div>
                    </div>

                    <!-- Stop Details -->
                    <div class="flex-1">
                        <div class="flex items-center gap-2">
                            <span class="text-gray-900 dark:text-white text-sm font-bold">{{ stop.location }}</span>
                            <span v-if="stop.type === 'pickup'"
                                class="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 text-[9px] font-bold">PICKUP</span>
                            <span v-else
                                class="px-1.5 py-0.5 rounded bg-green-500/20 text-green-400 text-[9px] font-bold">DELIVERY</span>
                        </div>
                        <div class="text-xs text-gray-400 mt-0.5">{{ stop.orderIds.join(', ') }}</div>
                    </div>

                    <!-- ETA -->
                    <div class="text-right">
                        <div class="text-sm font-mono font-bold"
                            :class="stop.completed ? 'text-green-400' : 'text-gray-900 dark:text-white'">
                            {{ stop.completed ? stop.actualTime : stop.eta }}
                        </div>
                        <div class="text-[10px]"
                            :class="stop.completed ? 'text-green-400' : stop.delayRisk ? 'text-yellow-400' : 'text-gray-500'">
                            {{ stop.completed ? 'Completed' : stop.delayRisk ? 'Delay risk' : 'On schedule' }}
                        </div>
                    </div>

                    <!-- Distance from prev -->
                    <div class="text-right w-16">
                        <div class="text-xs text-gray-500">{{ stop.distFromPrev }} km</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Push Toast -->
        <Teleport to="body">
            <Transition name="fade">
                <div v-if="pushToast"
                    class="fixed bottom-6 right-6 z-[9999] bg-green-600 text-white px-5 py-3 rounded-xl shadow-2xl text-sm font-bold flex items-center gap-2">
                    <span class="material-symbols-outlined text-[18px]">check_circle</span> {{ pushToast }}
                </div>
            </Transition>
        </Teleport>
    </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useDispatcherStore } from '@/stores/dispatcherStore'
import { useSlipPrinter } from '@/composables/useSlipPrinter'

const { openSlipWithData } = useSlipPrinter()

const store = useDispatcherStore()
onMounted(() => store.initialize().catch(() => {}))

const showManifestDetail = ref(false)
const selectedManifest = ref(null)
const manifestGenerated = ref(false)
const pushToast = ref('')
const newManifest = reactive({ hub: '', driver: '', vehicle: 'Auto-assign best fit', crew: 'No crew needed' })

// Real hub/driver/vehicle options from store
const hubOptions = computed(() => store.hubs.map(h => h.name))
const driverOptions = computed(() => store.dispatcherDrivers.map(d => `${d.name} (${d.vehicle || 'No vehicle'})`))
const vehicleOptions = computed(() => {
    const veh = store.filteredVehicles.map(v => `${v.code || v.model} (${v.type || ''})`)
    return ['Auto-assign best fit', ...veh]
})

const generatedRouteId = computed(() => {
    const d = new Date()
    const count = manifests.value.length + 1
    return `RT-${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}-${String(count).padStart(3, '0')}`
})

const manifests = ref([])

selectedManifest.value = null

const dispatchedManifests = computed(() => manifests.value.filter(m => m.status === 'Dispatched').length)
const pendingManifests = computed(() => manifests.value.filter(m => m.status === 'Draft' || m.status === 'Pending').length)

function generateManifest() {
    const id = `MAN-${9924 + manifests.value.length}`
    const veh = newManifest.vehicle === 'Auto-assign best fit' ? 'Van T-20' : newManifest.vehicle.split(' (')[0]
    const crewList = newManifest.driver ? [{ name: newManifest.driver, role: 'Driver' }] : []
    if (newManifest.crew.includes('loader')) {
        crewList.push({ name: 'Crew A', role: 'Loader' })
    }
    manifests.value.unshift({
        id, driver: newManifest.driver || '-- Unassigned --', vehicle: veh, orders: Math.floor(Math.random() * 30) + 5,
        weight: Math.floor(Math.random() * 1500) + 200, totalDistance: Math.floor(Math.random() * 120) + 30,
        stopCount: Math.floor(Math.random() * 15) + 3, estDuration: `${Math.floor(Math.random() * 5) + 2}h`,
        status: 'Draft', statusClass: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
        totalVolume: (Math.random() * 8 + 1).toFixed(1), fragileCount: Math.floor(Math.random() * 5),
        perishableCount: 0, codCount: Math.floor(Math.random() * 4), crew: crewList, stops: [],
        pushed: false, printed: false
    })
    manifestGenerated.value = true
    newManifest.driver = ''
    setTimeout(() => { manifestGenerated.value = false }, 2000)
}

function pushToDriver(manifest) {
    manifest.pushed = true
    if (manifest.status === 'Draft') {
        manifest.status = 'Dispatched'
        manifest.statusClass = 'bg-green-500/10 text-green-500 border-green-500/20'
    }
    pushToast.value = `Manifest ${manifest.id} pushed to ${manifest.driver}`
    setTimeout(() => { pushToast.value = '' }, 2500)
}

async function printManifest(manifest) {
    manifest.printed = true
    await openSlipWithData('tripManifest', manifest, {})
}

async function openTripManifestSlip() {
    if (manifests.value.length === 0) return
    const manifest = selectedManifest.value || manifests.value[0]
    await openSlipWithData('tripManifest', manifest, {})
}

async function openSafetyChecklist() {
    if (manifests.value.length === 0) return
    const manifest = selectedManifest.value || manifests.value[0]

    // Find the actual driver from store by matching name
    const driver = store.dispatcherDrivers.find(d => d.name === manifest.driver) || {
        name: manifest.driver,
        id: manifest.id,
        location: store.hubs[0]?.name || '—',
        stops: manifest.stopCount || 0,
        vehicle: manifest.vehicle,
        phone: '—'
    }

    // Find the actual vehicle from store by matching code
    const vehicle = store.filteredVehicles.find(v =>
        v.code === manifest.vehicle || v.licensePlate === manifest.vehicle || v.model === manifest.vehicle
    ) || {
        code: manifest.vehicle,
        type: manifest.vehicle,
        model: manifest.vehicle
    }

    await openSlipWithData('vehicleSafetyChecklist', driver, vehicle)
}
</script>
