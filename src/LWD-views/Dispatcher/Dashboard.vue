<template>
  <div>
    <div class="flex h-[calc(94vh-3.5rem)] overflow-hidden">

        <!-- Left Panel: Active Driver Roster -->
        <transition name="slide-left">
        <div v-show="showLeftPanel" class="w-80 bg-white dark:bg-card-dark border-r border-gray-200 dark:border-white/5 flex flex-col z-10 glass-panel flex-shrink-0">
            <div class="p-4 border-b border-gray-200 dark:border-white/5 flex justify-between items-center">
                <h3 class="font-bold text-gray-900 dark:text-white text-sm">Active Drivers ({{ filteredDrivers.length }})</h3>
                <button @click="showAllDrivers = !showAllDrivers" class="text-xs text-primary hover:underline">{{ showAllDrivers ? 'Show Active' : 'View All' }}</button>
            </div>

            <div class="p-3 bg-gray-50 dark:bg-white/5">
                <div class="relative">
                    <span
                        class="material-symbols-outlined absolute left-2 top-1.5 text-gray-500 text-[18px]">search</span>
                    <input v-model="driverSearch" type="text" placeholder="Search driver..."
                        class="w-full bg-gray-100 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-md py-1.5 pl-8 pr-3 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-primary/50 transition-colors">
                </div>
            </div>

            <div class="flex-1 overflow-y-auto no-scrollbar p-2 space-y-2"
                @dragover.prevent="onDriverPanelDragOver" @drop="onDropOnDriverPanel">
                <!-- Driver Card -->
                <div v-for="driver in filteredDrivers" :key="driver.id"
                    @click="selectDriver(driver)"
                    :class="[selectedDriver?.id === driver.id ? 'border-primary/50 bg-primary/5' : 'border-gray-200/60 dark:border-transparent', dragOverDriver === driver.id ? 'ring-2 ring-primary/50 scale-[1.02]' : '']"
                    class="p-3 rounded-lg bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 border hover:border-gray-300 dark:hover:border-white/10 cursor-pointer transition-all group"
                    @dragover.prevent="dragOverDriver = driver.id" @dragleave="dragOverDriver = null"
                    @drop.stop="onDropOnDriver($event, driver)">
                    <div class="flex items-center gap-3 mb-2">
                        <div class="relative">
                            <img :src="driver.avatar" class="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 object-cover">
                            <span class="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-card-dark"
                                :class="driver.statusColor"></span>
                        </div>
                        <div>
                            <button @click.stop="viewDriverDetail(driver)" class="text-sm font-semibold text-gray-900 dark:text-white hover:text-primary transition-colors text-left">{{ driver.name }}</button>
                            <div class="text-[10px] text-gray-400">{{ driver.vehicle }} • {{ driver.id }}</div>
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-2 text-[10px]">
                        <div class="bg-gray-100 dark:bg-black/20 rounded px-2 py-1">
                            <span class="text-gray-500 block">Load</span>
                            <span class="text-gray-900 dark:text-white font-mono">{{ driver.load }}%</span>
                        </div>
                        <div class="bg-gray-100 dark:bg-black/20 rounded px-2 py-1">
                            <span class="text-gray-500 block">Hours Left</span>
                            <span class="text-gray-900 dark:text-white font-mono">{{ driver.hours }}h</span>
                        </div>
                    </div>

                    <div
                        class="mt-2 pt-2 border-t border-gray-200 dark:border-white/5 flex justify-between items-center opacity-70 group-hover:opacity-100 transition-opacity">
                        <span class="text-[10px] text-gray-400 flex items-center gap-1">
                            <span class="material-symbols-outlined text-[12px]">location_on</span> {{ driver.location }}
                        </span>
                        <button @click.stop="chatWithDriver(driver)" class="text-primary hover:text-gray-900 dark:text-white transition-colors">
                            <span class="material-symbols-outlined text-[16px]">chat</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
        </transition>

        <!-- Center Panel: Interactive Map -->
        <div class="flex-1 bg-gray-200 dark:bg-gray-900 relative">
            <!-- Live Leaflet Map -->
            <div class="absolute inset-0 z-0">
                <l-map ref="map" :zoom="12" :center="[19.0760, 72.8777]" :use-global-leaflet="false">
                    <l-tile-layer
                        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                        layer-type="base"
                        name="CartoDB Voyager"
                    ></l-tile-layer>

                    <l-marker v-for="driver in activeDrivers" :key="driver.driver_id" :lat-lng="[driver.latitude, driver.longitude]">
                        <l-popup>
                            <div class="text-xs p-1">
                                <div class="font-bold flex items-center gap-1 mb-1">
                                    <span class="material-symbols-outlined text-[14px] text-green-500">local_shipping</span>
                                    {{ driver.driver_name }}
                                </div>
                                <div class="text-gray-500 mb-0.5">Vehicle: <span class="text-gray-900 font-medium">{{ driver.vehicle_code }}</span></div>
                                <div class="text-gray-500 mt-1 uppercase text-[9px] font-bold px-1.5 py-0.5 inline-block rounded"
                                    :class="driver.status === 'In-Transit' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'">
                                    {{ driver.status }}
                                </div>
                            </div>
                        </l-popup>
                    </l-marker>
                </l-map>
            </div>

            <!-- Bottom Map Toolbar -->
            <div class="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 shadow-lg backdrop-blur-xl p-2 rounded-xl flex gap-1">
                <button @click="toggleMapLayer('layers')" :class="mapLayers.layers ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'" class="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors" title="Layers"><span
                        class="material-symbols-outlined">layers</span></button>
                <button @click="toggleMapLayer('traffic')" :class="mapLayers.traffic ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'" class="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors" title="Traffic"><span
                        class="material-symbols-outlined">traffic</span></button>
                <button @click="toggleMapLayer('heatmap')" :class="mapLayers.heatmap ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'" class="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors" title="Heatmap"><span
                        class="material-symbols-outlined">blur_on</span></button>
                <div class="w-[1px] h-8 bg-gray-300 dark:bg-white/10 mx-1"></div>
                <button @click="toggleMapLayer('history')" :class="mapLayers.history ? 'bg-violet-500/15 text-violet-600 dark:text-violet-400' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'" class="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors" title="Route Replay"><span
                        class="material-symbols-outlined">history</span></button>
            </div>
        </div>

        <!-- Right Panel: Pending Load Queue -->
        <transition name="slide-right">
        <div v-show="showRightPanel" class="w-80 bg-white dark:bg-card-dark border-l border-gray-200 dark:border-white/5 flex flex-col z-10 glass-panel flex-shrink-0">
            <div class="p-4 border-b border-gray-200 dark:border-white/5 flex justify-between items-center">
                <h3 class="font-bold text-gray-900 dark:text-white text-sm">Pending Loads ({{ pendingLoads.length }})</h3>
                <button @click="showAssignModal = true"
                    class="flex items-center gap-1 text-xs bg-primary text-black font-semibold px-2.5 py-1 rounded-md hover:bg-primary-dark transition-colors shadow-sm">
                    <span class="material-symbols-outlined text-[14px]">add</span> Assign
                </button>
            </div>

            <div class="flex-1 overflow-y-auto no-scrollbar p-2 space-y-3">
                <!-- Drag hint -->
                <div v-if="pendingLoads.length" class="flex items-center gap-1.5 px-2 py-1 text-[10px] text-gray-400">
                    <span class="material-symbols-outlined text-[12px]">drag_indicator</span>
                    Drag load to a driver on the left to assign
                </div>
                <div v-for="load in pendingLoads" :key="load.id"
                    draggable="true" @dragstart="onDragStart($event, load)" @dragend="onDragEnd"
                    :class="[draggingLoad?.id === load.id ? 'opacity-50 scale-95 border-primary/40' : 'border-gray-200/60 dark:border-transparent hover:border-primary/30']"
                    class="p-3 rounded-lg bg-gray-50 dark:bg-white/5 border transition-all select-none cursor-grab active:cursor-grabbing">
                    <div class="flex justify-between items-start mb-2">
                        <div class="flex items-center gap-1.5">
                            <span class="material-symbols-outlined text-gray-400 text-[14px] cursor-grab">drag_indicator</span>
                            <span class="text-xs font-mono text-gray-500 dark:text-gray-400">#{{ load.id }}</span>
                        </div>
                        <span class="px-1.5 py-0.5 rounded text-[10px] font-bold"
                            :class="load.priority === 'URGENT' ? 'bg-red-500/20 text-red-400' : load.priority === 'HIGH' ? 'bg-orange-500/20 text-orange-400' : 'bg-blue-500/20 text-blue-400'">{{ load.priority }}</span>
                    </div>

                    <div class="space-y-2 mb-3">
                        <div class="flex items-center gap-2">
                            <span class="material-symbols-outlined text-gray-500 text-[14px]">inventory_2</span>
                            <span class="text-sm font-medium text-gray-900 dark:text-white">{{ load.type }}</span>
                        </div>
                        <div class="flex justify-between text-[11px] text-gray-500 dark:text-gray-400">
                            <span>{{ load.weight }} kg</span>
                            <span>{{ load.volume }} m³</span>
                        </div>
                    </div>

                    <div class="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-white/5">
                        <div class="text-[10px] text-gray-500 dark:text-gray-400">Hub: <span class="text-gray-700 dark:text-gray-300 font-medium">{{ load.hub }}</span>
                        </div>
                        <button @click.stop="toggleLoadDetail(load)" class="text-xs font-bold px-2 py-0.5 rounded transition-colors"
                            :class="expandedLoad?.id === load.id ? 'bg-primary/10 text-primary' : 'text-primary hover:bg-primary/10'">{{ expandedLoad?.id === load.id ? 'Close' : 'Details' }}</button>
                    </div>
                    <div v-if="expandedLoad?.id === load.id" class="mt-2 pt-2 border-t border-gray-200 dark:border-white/5 space-y-2">
                        <div class="grid grid-cols-2 gap-2">
                            <div class="p-1.5 bg-gray-100 dark:bg-black/20 rounded text-[10px]">
                                <span class="text-gray-500 block">Origin</span>
                                <span class="text-gray-900 dark:text-white font-medium">{{ load.hub }} Warehouse</span>
                            </div>
                            <div class="p-1.5 bg-gray-100 dark:bg-black/20 rounded text-[10px]">
                                <span class="text-gray-500 block">Window (Today)</span>
                                <span class="text-gray-900 dark:text-white font-medium">{{ load.deadline ? new Date(load.deadline).toLocaleTimeString('en-IN', {hour:'2-digit', minute:'2-digit', hour12:false}) : 'TBD' }}</span>
                            </div>
                        </div>
                        <div class="p-1.5 bg-yellow-500/10 border border-yellow-500/20 rounded text-[10px] flex items-center gap-1.5">
                            <span class="material-symbols-outlined text-yellow-400 text-[12px]">schedule</span>
                            <span class="text-yellow-600 dark:text-yellow-300 font-medium">Unassigned — Awaiting dispatch</span>
                        </div>
                        <button @click.stop="assignLoad(load)" class="w-full text-center bg-primary hover:bg-primary-dark text-black font-bold py-1.5 rounded-lg text-xs transition-colors flex items-center justify-center gap-1">
                            <span class="material-symbols-outlined text-[14px]">assignment_turned_in</span>
                            Quick Assign
                        </button>
                    </div>
                </div>
            </div>

            <!-- Bottom Summary -->
            <div class="p-4 border-t border-gray-200 dark:border-white/5 bg-gray-100 dark:bg-black/20">
                <div class="text-xs text-gray-500 mb-2">Overall SLA Projection</div>
                <div class="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-1">
                    <div class="h-full bg-gradient-to-r from-yellow-500 to-green-500 transition-all" :style="{ width: slaProjection.pct + '%' }"></div>
                </div>
                <div class="flex justify-between text-[10px]">
                    <span class="text-gray-900 dark:text-white">{{ slaProjection.pct }}% Predicted</span>
                    <span :class="slaProjection.delta >= 0 ? 'text-green-400' : 'text-red-400'">{{ slaProjection.delta >= 0 ? '+' : '' }}{{ slaProjection.delta }}% vs Target</span>
                </div>
            </div>
        </div>
        </transition>

    </div>

    <!-- Assign Modal -->
    <Teleport to="body">
    <div v-if="showAssignModal" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center" @click.self="showAssignModal = false">
        <div class="bg-white dark:bg-card-dark rounded-2xl p-6 w-full max-w-md m-4 border border-gray-200 dark:border-white/10 shadow-2xl">
            <h3 class="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <span class="material-symbols-outlined text-primary">assignment_turned_in</span> Quick Assign Load
            </h3>
            <div class="mb-3">
                <label class="text-xs text-gray-400 mb-1 block">Select Order</label>
                <select v-model="assignOrderId" class="w-full bg-gray-100 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none">
                    <option value="" class="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">Choose order...</option>
                    <option v-for="load in pendingLoads" :key="load.id" :value="load.id" class="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">{{ load.id }} — {{ load.type }} ({{ load.weight }}kg)</option>
                </select>
            </div>
            <div class="mb-4">
                <label class="text-xs text-gray-400 mb-1 block">Select Driver</label>
                <select v-model="assignDriverId" class="w-full bg-gray-100 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none">
                    <option value="" class="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">Choose driver...</option>
                    <option v-for="d in drivers" :key="d.id" :value="d.id" class="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">{{ d.name }} ({{ d.vehicle }}, {{ d.load }}% load)</option>
                </select>
            </div>
            <div class="flex gap-2">
                <button @click="confirmAssign" :disabled="!assignOrderId || !assignDriverId || assigning"
                    class="flex-1 bg-primary text-black font-bold py-2 rounded-lg text-sm disabled:opacity-50 hover:bg-primary-dark transition-colors flex items-center justify-center gap-1">
                    <span v-if="assigning" class="material-symbols-outlined animate-spin text-[16px]">progress_activity</span>
                    {{ assigning ? 'Assigning...' : 'Assign' }}
                </button>
                <button @click="showAssignModal = false" :disabled="assigning" class="flex-1 bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white py-2 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-white/20 transition-colors disabled:opacity-50">Cancel</button>
            </div>
            <div v-if="assignSuccess" class="mt-3 text-center text-xs text-green-400 font-bold">✓ Order assigned successfully!</div>
            <div v-if="assignError" class="mt-3 text-center text-xs text-red-400 font-bold">{{ assignError }}</div>
        </div>
    </div>
    </Teleport>

    <!-- Driver Detail Modal -->
    <Teleport to="body">
    <div v-if="showDriverDetailModal" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center" @click.self="showDriverDetailModal = false">
        <div class="bg-white dark:bg-card-dark rounded-2xl p-6 w-full max-w-md m-4 border border-gray-200 dark:border-white/10 shadow-2xl">
            <div class="flex items-center gap-4 mb-5">
                <img :src="detailDriver?.avatar" class="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 ring-2 ring-primary/30 object-cover">
                <div>
                    <h3 class="text-lg font-bold text-gray-900 dark:text-white">{{ detailDriver?.name }}</h3>
                    <p class="text-sm text-gray-500">{{ detailDriver?.vehicle }} • {{ detailDriver?.id }}</p>
                    <div class="flex items-center gap-1.5 mt-1">
                        <span class="w-2 h-2 rounded-full" :class="detailDriver?.statusColor"></span>
                        <span class="text-xs" :class="detailDriver?.statusColor === 'bg-green-500' ? 'text-green-500' : detailDriver?.statusColor === 'bg-yellow-500' ? 'text-yellow-500' : 'text-gray-500'">{{ detailDriver?.statusColor === 'bg-green-500' ? 'Active' : detailDriver?.statusColor === 'bg-yellow-500' ? 'Busy' : 'Offline' }}</span>
                    </div>
                </div>
            </div>
            <div class="grid grid-cols-3 gap-3 mb-5">
                <div class="p-3 bg-gray-50 dark:bg-white/5 rounded-lg text-center">
                    <div class="text-xs text-gray-500 mb-1">Load</div>
                    <div class="text-lg font-bold text-gray-900 dark:text-white">{{ detailDriver?.load }}%</div>
                    <div class="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-full mt-1 overflow-hidden">
                        <div class="h-full rounded-full" :class="detailDriver?.load > 80 ? 'bg-red-500' : 'bg-primary'" :style="{ width: detailDriver?.load + '%' }"></div>
                    </div>
                </div>
                <div class="p-3 bg-gray-50 dark:bg-white/5 rounded-lg text-center">
                    <div class="text-xs text-gray-500 mb-1">Hours Left</div>
                    <div class="text-lg font-bold text-gray-900 dark:text-white">{{ detailDriver?.hours }}h</div>
                </div>
                <div class="p-3 bg-gray-50 dark:bg-white/5 rounded-lg text-center">
                    <div class="text-xs text-gray-500 mb-1">Location</div>
                    <div class="text-sm font-medium text-gray-900 dark:text-white">{{ detailDriver?.location }}</div>
                </div>
            </div>
            <div class="flex gap-2">
                <button @click="chatWithDriver(detailDriver); showDriverDetailModal = false" class="flex-1 bg-primary hover:bg-primary-dark text-black font-bold py-2 rounded-lg text-sm transition-colors flex items-center justify-center gap-1">
                    <span class="material-symbols-outlined text-[16px]">chat</span> Chat
                </button>
                <button @click="assignToDriverFromDetail" class="flex-1 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-900 dark:text-white font-bold py-2 rounded-lg text-sm transition-colors flex items-center justify-center gap-1">
                    <span class="material-symbols-outlined text-[16px]">add_circle</span> Assign Load
                </button>
                <button @click="showDriverDetailModal = false" class="px-4 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-400 py-2 rounded-lg text-sm transition-colors">
                    <span class="material-symbols-outlined text-[16px]">close</span>
                </button>
            </div>
        </div>
    </div>
    </Teleport>

    <!-- Drag Assign Toast -->
    <Teleport to="body">
    <transition name="fade">
    <div v-if="dragAssignToast" class="fixed bottom-8 left-1/2 -translate-x-1/2 z-[9999] bg-green-500 text-black font-bold px-6 py-3 rounded-xl shadow-xl flex items-center gap-2 text-sm">
        <span class="material-symbols-outlined text-[18px]">check_circle</span>
        {{ dragAssignToast }}
    </div>
    </transition>
    </Teleport>

    <!-- Chat Modal -->
    <Teleport to="body">
    <div v-if="showChatModal" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center" @click.self="showChatModal = false">
        <div class="bg-white dark:bg-card-dark rounded-2xl w-full max-w-sm m-4 border border-gray-200 dark:border-white/10 shadow-2xl flex flex-col h-[400px]">
            <div class="p-4 border-b border-gray-200 dark:border-white/5 flex items-center justify-between">
                <div class="flex items-center gap-2">
                    <img :src="chatDriver?.avatar" class="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700">
                    <div><div class="text-sm font-bold text-gray-900 dark:text-white">{{ chatDriver?.name }}</div><div class="text-[10px] text-gray-400">{{ chatDriver?.id }}</div></div>
                </div>
                <button @click="showChatModal = false" class="text-gray-400 hover:text-gray-900 dark:text-white"><span class="material-symbols-outlined">close</span></button>
            </div>
            <div class="flex-1 overflow-y-auto no-scrollbar p-4 space-y-2">
                <div v-for="msg in driverChatMessages" :key="msg.id" :class="msg.from === 'dispatch' ? 'flex justify-end' : 'flex justify-start'">
                    <div class="max-w-[80%] p-2 rounded-xl text-xs" :class="msg.from === 'dispatch' ? 'bg-primary/20 text-gray-900 dark:text-white' : 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300'">{{ msg.text }}</div>
                </div>
            </div>
            <div class="p-3 border-t border-gray-200 dark:border-white/5 flex gap-2">
                <input v-model="chatMsg" @keyup.enter="sendDriverMsg" type="text" placeholder="Type message..."
                    class="flex-1 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-full px-3 py-1.5 text-sm text-gray-900 dark:text-white focus:outline-none">
                <button @click="sendDriverMsg" class="p-1.5 bg-primary rounded-full text-black"><span class="material-symbols-outlined text-[16px]">send</span></button>
            </div>
        </div>
    </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useDispatcherStore } from '@/stores/dispatcherStore'
import { useRealTimeTracking } from '@/composables/useRealTimeTracking'
import { LMap, LTileLayer, LMarker, LPopup } from '@vue-leaflet/vue-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix Leaflet icons issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: new URL('leaflet/dist/images/marker-icon-2x.png', import.meta.url).href,
  iconUrl: new URL('leaflet/dist/images/marker-icon.png', import.meta.url).href,
  shadowUrl: new URL('leaflet/dist/images/marker-shadow.png', import.meta.url).href,
});

const { activeDrivers } = useRealTimeTracking()

const store = useDispatcherStore()

const showLeftPanel = ref(true)
const showRightPanel = ref(true)
const driverSearch = ref('')
const showAllDrivers = ref(false)
const selectedDriver = ref(null)
const expandedLoad = ref(null)
const showAssignModal = ref(false)
const assignOrderId = ref('')
const assignDriverId = ref('')
const assignSuccess = ref(false)
const assigning = ref(false)
const assignError = ref('')
const showChatModal = ref(false)
const chatDriver = ref(null)
const chatMsg = ref('')
const mapLayers = ref({ layers: false, traffic: false, heatmap: false, history: false })
const showDriverDetailModal = ref(false)
const detailDriver = ref(null)
const draggingLoad = ref(null)
const dragOverDriver = ref(null)
const dragAssignToast = ref('')

const drivers = computed(() => store.dispatcherDrivers)
const pendingLoads = computed(() => store.pendingOrders)
const slaProjection = computed(() => store.slaProjection)

const filteredDrivers = computed(() => {
    let list = drivers.value
    if (!showAllDrivers.value) list = list.filter(d => d.statusColor !== 'bg-gray-500')
    if (driverSearch.value) {
        const q = driverSearch.value.toLowerCase()
        list = list.filter(d => d.name.toLowerCase().includes(q) || d.id.toLowerCase().includes(q) || d.vehicle.toLowerCase().includes(q))
    }
    return list
})

onMounted(() => store.initialize().catch(() => {}))

function selectDriver(driver) { selectedDriver.value = selectedDriver.value?.id === driver.id ? null : driver }
function toggleLoadDetail(load) { expandedLoad.value = expandedLoad.value?.id === load.id ? null : load }
function toggleMapLayer(layer) { mapLayers.value[layer] = !mapLayers.value[layer] }

function assignLoad(load) {
    assignOrderId.value = load.id
    showAssignModal.value = true
}

async function confirmAssign() {
    if (!assignOrderId.value || !assignDriverId.value) return
    assigning.value = true
    assignError.value = ''
    const ok = await store.assignOrder(assignOrderId.value, assignDriverId.value)
    assigning.value = false
    if (ok) {
        assignSuccess.value = true
        setTimeout(() => { showAssignModal.value = false; assignSuccess.value = false; assignOrderId.value = ''; assignDriverId.value = '' }, 1200)
    } else {
        assignError.value = 'Failed to assign. Please try again.'
    }
}

const driverChatMessages = ref([])
let chatMsgId = 1
function chatWithDriver(driver) {
    chatDriver.value = driver
    driverChatMessages.value = [
        { id: chatMsgId++, from: 'driver', text: `Hi dispatch, I\'m at ${driver.location}. Ready for next instructions.` },
        { id: chatMsgId++, from: 'dispatch', text: `Copy ${driver.name.split(' ')[0]}. Stand by for assignment update.` }
    ]
    showChatModal.value = true
}

function sendDriverMsg() {
    if (!chatMsg.value.trim()) return
    const text = chatMsg.value
    driverChatMessages.value.push({ id: chatMsgId++, from: 'dispatch', text })
    chatMsg.value = ''
    store.sendMessageToDriver(chatDriver.value?.id, text)
    setTimeout(() => {
        driverChatMessages.value.push({ id: chatMsgId++, from: 'driver', text: text.includes('?') ? 'Yes, copy that. I\'ll check and confirm.' : 'Roger, acknowledged.' })
    }, 1000)
}

// Driver Detail Modal
function viewDriverDetail(driver) {
    detailDriver.value = driver
    showDriverDetailModal.value = true
}

function assignToDriverFromDetail() {
    showDriverDetailModal.value = false
    assignDriverId.value = detailDriver.value?.id || ''
    showAssignModal.value = true
}

// Drag and Drop
function onDragStart(event, load) {
    draggingLoad.value = load
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', load.id)
}

function onDragEnd() {
    draggingLoad.value = null
    dragOverDriver.value = null
}

function onDriverPanelDragOver(event) {
    event.dataTransfer.dropEffect = 'move'
}

function onDropOnDriverPanel(event) {
    dragOverDriver.value = null
}

async function onDropOnDriver(event, driver) {
    event.preventDefault()
    dragOverDriver.value = null
    if (!draggingLoad.value) return
    const load = draggingLoad.value
    draggingLoad.value = null
    const ok = await store.assignOrder(load.id, driver.id)
    if (ok) {
        dragAssignToast.value = `${load.id} → ${driver.name}`
        setTimeout(() => { dragAssignToast.value = '' }, 2500)
    } else {
        dragAssignToast.value = `Failed to assign ${load.id}`
        setTimeout(() => { dragAssignToast.value = '' }, 2500)
    }
}
</script>

<style scoped>
.slide-left-enter-active, .slide-left-leave-active {
    transition: width 0.3s ease, opacity 0.3s ease;
    overflow: hidden;
}
.slide-left-enter-from, .slide-left-leave-to {
    width: 0 !important;
    opacity: 0;
}
.slide-right-enter-active, .slide-right-leave-active {
    transition: width 0.3s ease, opacity 0.3s ease;
    overflow: hidden;
}
.slide-right-enter-from, .slide-right-leave-to {
    width: 0 !important;
    opacity: 0;
}
.fade-enter-active, .fade-leave-active {
    transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
    opacity: 0;
}
</style>
