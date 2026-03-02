<template>
    <div class="h-[calc(100vh-8rem)] flex flex-col gap-6">
        <!-- Header & Controls -->
        <div class="flex justify-between items-center">
            <div>
                <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Geofencing & Routes</h2>
                <p class="text-sm text-gray-500">Manage operational zones, restricted areas, and dynamic routing rules.</p>
            </div>
            <div class="flex gap-3">
                <div class="flex items-center gap-1 bg-gray-100 dark:bg-black/40 rounded-lg p-1 border border-gray-200 dark:border-white/10 shadow-sm">
                    <button @click="viewMode = 'map'" 
                        class="px-3 py-1.5 rounded text-sm font-medium transition-all flex items-center gap-2"
                        :class="viewMode === 'map' ? 'bg-white dark:bg-gray-700 text-primary shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'">
                        <span class="material-symbols-outlined text-[18px]">map</span> Map
                    </button>
                    <button @click="viewMode = 'list'"
                        class="px-3 py-1.5 rounded text-sm font-medium transition-all flex items-center gap-2"
                        :class="viewMode === 'list' ? 'bg-white dark:bg-gray-700 text-primary shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'">
                        <span class="material-symbols-outlined text-[18px]">table_rows</span> List
                    </button>
                </div>
                <button @click="openZoneModal('create')"
                    class="bg-primary hover:bg-primary/90 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors shadow-sm">
                    <span class="material-symbols-outlined">add_location_alt</span> New Zone
                </button>
            </div>
        </div>

        <!-- Dynamic Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div class="glass-panel p-4 rounded-xl border border-gray-200 dark:border-white/5 flex items-center justify-between">
                <div>
                    <p class="text-xs text-gray-500 uppercase font-bold tracking-wider">Total Zones</p>
                    <p class="text-2xl font-bold text-gray-900 dark:text-white mt-1">{{ filteredZones.length }}</p>
                </div>
                <div class="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
                    <span class="material-symbols-outlined">share_location</span>
                </div>
            </div>
            <div class="glass-panel p-4 rounded-xl border border-gray-200 dark:border-white/5 flex items-center justify-between">
                <div>
                    <p class="text-xs text-gray-500 uppercase font-bold tracking-wider">Active Vehicles</p>
                    <p class="text-2xl font-bold text-gray-900 dark:text-white mt-1">{{ vehiclesInZones }}</p>
                </div>
                <div class="w-10 h-10 rounded-full bg-green-50 dark:bg-green-500/10 flex items-center justify-center text-green-600 dark:text-green-400">
                    <span class="material-symbols-outlined">local_shipping</span>
                </div>
            </div>
            <div class="glass-panel p-4 rounded-xl border border-gray-200 dark:border-white/5 flex items-center justify-between">
                <div>
                    <p class="text-xs text-gray-500 uppercase font-bold tracking-wider">Breach Alerts</p>
                    <p class="text-2xl font-bold text-gray-900 dark:text-white mt-1">{{ breachAlerts }}</p>
                </div>
                <div class="w-10 h-10 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center text-red-600 dark:text-red-400">
                    <span class="material-symbols-outlined">warning</span>
                </div>
            </div>
            <div class="glass-panel p-4 rounded-xl border border-gray-200 dark:border-white/5 flex items-center justify-between">
                <div>
                    <p class="text-xs text-gray-500 uppercase font-bold tracking-wider">Coverage Area</p>
                    <p class="text-2xl font-bold text-gray-900 dark:text-white mt-1">{{ totalArea }} km²</p>
                </div>
                <div class="w-10 h-10 rounded-full bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400">
                    <span class="material-symbols-outlined">layers</span>
                </div>
            </div>
        </div>

        <!-- Main Content -->
        <div class="flex-1 flex gap-6 overflow-hidden min-h-0">
            <!-- Sidebar: Zone List & Search -->
            <div class="w-80 glass-panel rounded-xl flex flex-col border border-gray-200 dark:border-white/5 flex-shrink-0">
                <div class="p-4 border-b border-gray-200 dark:border-white/5 space-y-3">
                    <div class="relative">
                        <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">search</span>
                        <input v-model="searchQuery" type="text" placeholder="Search zones..." 
                            class="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow text-gray-900 dark:text-white">
                    </div>
                </div>
                <div class="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
                    <div v-for="zone in searchedZones" :key="zone.id"
                        @click="selectZone(zone)"
                        class="p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer border transition-all group shadow-sm flex flex-col gap-2 relative"
                        :class="selectedZone?.id === zone.id ? 'bg-primary/5 border-primary/30' : 'border-transparent bg-white dark:bg-transparent'">
                        
                        <div class="flex justify-between items-start">
                            <div class="font-bold text-gray-900 dark:text-white text-sm">{{ zone.name }}</div>
                            <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button @click.stop="openZoneModal('edit', zone)" class="p-1 hover:bg-gray-200 dark:hover:bg-white/10 rounded text-gray-500"><span class="material-symbols-outlined text-[16px]">edit</span></button>
                                <button @click.stop="deleteZone(zone.id)" class="p-1 hover:bg-red-100 dark:hover:bg-red-500/20 rounded text-red-500"><span class="material-symbols-outlined text-[16px]">delete</span></button>
                            </div>
                        </div>
                        
                        <div class="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                            <span class="material-symbols-outlined text-[14px]">{{ getZoneIcon(zone.type) }}</span>
                            <span>{{ zone.type }}</span>
                            <span>•</span>
                            <span>{{ zone.radius }}km Radius</span>
                        </div>

                        <div class="flex justify-between items-center mt-1">
                            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border"
                                :class="zone.status === 'Active' ? 'bg-green-50 text-green-600 border-green-200 dark:bg-green-500/10 dark:text-green-400' : 'bg-gray-100 text-gray-500 border-gray-200'">
                                {{ zone.status || 'Active' }}
                            </span>
                            <span class="text-[10px] text-gray-400 font-mono">{{ store.hubs.find(h => h.id === zone.hubId)?.name }}</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- View Area -->
            <div class="flex-1 glass-panel rounded-xl relative overflow-hidden border border-gray-200 dark:border-white/5 flex flex-col">
                
                <!-- MAP VIEW -->
                <div v-if="viewMode === 'map'" class="absolute inset-0 bg-gray-100 dark:bg-gray-900 flex flex-col">
                    <!-- Tools Overlay -->
                    <div class="absolute top-4 left-4 z-10 flex flex-col gap-2 bg-white/90 dark:bg-black/80 p-2 rounded-lg backdrop-blur shadow-lg border border-gray-200 dark:border-white/10">
                        <button v-for="tool in mapTools" :key="tool.id"
                            @click="activeTool = tool.id"
                            class="w-8 h-8 rounded flex items-center justify-center transition-colors relative group"
                            :class="activeTool === tool.id ? 'bg-primary text-white shadow-md' : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/10'">
                            <span class="material-symbols-outlined text-[20px]">{{ tool.icon }}</span>
                            <!-- Tooltip -->
                            <span class="absolute left-full ml-3 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-20">
                                {{ tool.label }}
                            </span>
                        </button>
                    </div>

                    <!-- Placeholder Map -->
                    <div class="flex-1 bg-[url('https://maps.googleapis.com/maps/api/staticmap?center=40.7128,-74.0060&zoom=12&size=800x600&sensor=false')] bg-cover bg-center grayscale opacity-80 dark:opacity-40 relative group overflow-hidden">
                        <!-- Dynamic overlay effects -->
                        <div class="absolute inset-0 bg-blue-500/5 pointer-events-none"></div>
                        
                        <!-- Simulated Zones on Map -->
                        <div v-for="zone in searchedZones" :key="zone.id" 
                            class="absolute w-32 h-32 rounded-full border-2 border-primary/50 bg-primary/10 flex items-center justify-center transform hover:scale-105 transition-transform cursor-pointer"
                            :style="{ top: `${Math.random() * 80 + 10}%`, left: `${Math.random() * 80 + 10}%` }"
                            @click="selectZone(zone)">
                            <div class="bg-white/90 dark:bg-black/80 px-2 py-1 rounded text-[10px] font-bold shadow-sm backdrop-blur-sm whitespace-nowrap">
                                {{ zone.name }}
                            </div>
                        </div>
                    </div>
                    
                    <!-- Bottom Info Bar -->
                    <div class="h-10 bg-white dark:bg-card-dark border-t border-gray-200 dark:border-white/10 flex items-center px-4 justify-between text-xs text-gray-500">
                        <div class="flex gap-4">
                            <span>Lat: 34.0522 N</span>
                            <span>Lng: 118.2437 W</span>
                            <span>Zoom: 12x</span>
                        </div>
                        <div class="flex gap-2 items-center">
                            <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            <span>Live Updates Active</span>
                        </div>
                    </div>
                </div>

                <!-- LIST VIEW -->
                <div v-else class="flex flex-col h-full">
                    <div class="p-4 border-b border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-white/5 flex justify-between items-center">
                        <h3 class="font-bold text-gray-900 dark:text-white">All Active Zones</h3>
                        <div class="flex gap-2 text-sm text-gray-500">
                            <button class="hover:text-primary flex items-center gap-1"><span class="material-symbols-outlined text-[16px]">filter_list</span> Filter</button>
                            <button class="hover:text-primary flex items-center gap-1"><span class="material-symbols-outlined text-[16px]">download</span> Export</button>
                        </div>
                    </div>
                    <div class="flex-1 overflow-auto custom-scrollbar">
                        <table class="w-full text-left text-sm">
                            <thead class="bg-gray-50 dark:bg-card-dark sticky top-0 z-10">
                                <tr class="text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-white/10 uppercase tracking-wider text-[10px]">
                                    <th class="py-3 px-4 font-medium">Zone Name</th>
                                    <th class="py-3 px-4 font-medium">Type</th>
                                    <th class="py-3 px-4 font-medium">Hub Assignment</th>
                                    <th class="py-3 px-4 font-medium">Coordinates</th>
                                    <th class="py-3 px-4 font-medium text-right">Radius (km)</th>
                                    <th class="py-3 px-4 font-medium text-right">Status</th>
                                    <th class="py-3 px-4 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-100 dark:divide-white/5">
                                <tr v-for="zone in searchedZones" :key="zone.id" class="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group">
                                    <td class="py-3 px-4 font-medium text-gray-900 dark:text-white">{{ zone.name }}</td>
                                    <td class="py-3 px-4 text-gray-600 dark:text-gray-300">
                                        <div class="flex items-center gap-2">
                                            <span class="material-symbols-outlined text-sm">{{ getZoneIcon(zone.type) }}</span>
                                            {{ zone.type }}
                                        </div>
                                    </td>
                                    <td class="py-3 px-4 text-gray-600 dark:text-gray-300">{{ store.hubs.find(h => h.id === zone.hubId)?.name }}</td>
                                    <td class="py-3 px-4 text-gray-500 font-mono text-xs">34.05, -118.24</td>
                                    <td class="py-3 px-4 text-right font-mono">{{ zone.radius }}</td>
                                    <td class="py-3 px-4 text-right">
                                        <span class="px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
                                            :class="zone.status === 'Active' ? 'bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400' : 'bg-gray-100 text-gray-500'">
                                            {{ zone.status || 'Active' }}
                                        </span>
                                    </td>
                                    <td class="py-3 px-4 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button @click="openZoneModal('edit', zone)" class="text-primary hover:text-primary-dark font-medium text-xs mr-3">Edit</button>
                                        <button @click="deleteZone(zone.id)" class="text-red-500 hover:text-red-700 font-medium text-xs">Delete</button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>

        <!-- Create/Edit Zone Modal -->
        <Teleport to="body">
            <div v-if="isZoneModalOpen" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div class="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-scale-in">
                    <div class="p-6 border-b border-gray-100 dark:border-white/10 flex justify-between items-center bg-gray-50 dark:bg-white/5">
                        <div>
                            <h3 class="text-lg font-bold text-gray-900 dark:text-white">{{ zoneModalMode === 'create' ? 'Create New Zone' : 'Edit Zone' }}</h3>
                            <p class="text-xs text-gray-500">Define geofence parameters and restrictions</p>
                        </div>
                        <button @click="closeZoneModal" class="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                            <span class="material-symbols-outlined">close</span>
                        </button>
                    </div>
                    
                    <div class="p-6 space-y-4">
                        <div>
                            <label class="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">Zone Name</label>
                            <input v-model="zoneForm.name" type="text" placeholder="e.g. Downtown Exclusion Zone" class="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary/50 outline-none">
                        </div>
                        
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">Zone Type</label>
                                <select v-model="zoneForm.type" class="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary/50 outline-none">
                                    <option value="Polygon" class="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">Polygon</option>
                                    <option value="Circle" class="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">Circle</option>
                                    <option value="Exclusion" class="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">Exclusion Zone</option>
                                    <option value="Corridor" class="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">Corridor</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">Radius (km)</label>
                                <input v-model="zoneForm.radius" type="number" step="0.1" class="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary/50 outline-none">
                            </div>
                        </div>

                        <div>
                            <label class="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">Assigned Warehouse</label>
                            <select v-model="zoneForm.hubId" class="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary/50 outline-none">
                                <option v-for="hub in store.hubs" :key="hub.id" :value="hub.id" class="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">{{ hub.name }}</option>
                            </select>
                        </div>
                        
                        <div>
                            <label class="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">Alert Settings</label>
                            <div class="flex items-center gap-2 p-3 bg-gray-50 dark:bg-white/5 rounded-lg border border-gray-200 dark:border-white/10">
                                <input type="checkbox" id="entryAlert" class="rounded text-primary focus:ring-offset-0 bg-transparent border-gray-300">
                                <label for="entryAlert" class="text-sm text-gray-700 dark:text-white select-none cursor-pointer">Trigger alert on vehicle entry</label>
                            </div>
                        </div>
                    </div>

                    <div class="p-6 pt-0 flex justify-end gap-3">
                        <button @click="closeZoneModal" class="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">Cancel</button>
                        <button @click="saveZone" class="px-6 py-2 bg-primary hover:bg-primary/90 text-white text-sm font-bold rounded-lg shadow-lg shadow-primary/20 transition-all flex items-center gap-2">
                            <span class="material-symbols-outlined text-sm">save</span>
                            {{ zoneModalMode === 'create' ? 'Create Zone' : 'Update Zone' }}
                        </button>
                    </div>
                </div>
            </div>
        </Teleport>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useLogisticStore } from '@/stores/logisticStore'
import { storeToRefs } from 'pinia'

const store = useLogisticStore()
const { filteredZones } = storeToRefs(store)

// View State
const viewMode = ref('map') // 'map' or 'list'
const searchQuery = ref('')
const selectedZone = ref(null)
const activeTool = ref('pointer')

// Tool Definitions
const mapTools = [
    { id: 'pointer', icon: 'near_me', label: 'Select' },
    { id: 'polygon', icon: 'pentagon', label: 'Draw Polygon' },
    { id: 'circle', icon: 'radio_button_unchecked', label: 'Draw Circle' },
    { id: 'line', icon: 'timeline', label: 'Draw Route' },
    { id: 'manage', icon: 'settings', label: 'Zone Settings' }
]

// Modal State
const isZoneModalOpen = ref(false)
const zoneModalMode = ref('create')
const zoneForm = ref({
    name: '',
    type: 'Polygon',
    radius: 1.0,
    hubId: store.hubs[0]?.id || 1,
    status: 'Active'
})

// Search Logic
const searchedZones = computed(() => {
    const q = searchQuery.value.toLowerCase()
    return filteredZones.value.filter(z => 
        !q || 
        z.name.toLowerCase().includes(q) || 
        z.type.toLowerCase().includes(q)
    )
})

// Dynamic Stats (Mocked but reactive to zones)
const vehiclesInZones = computed(() => {
    // Mock calculation: 40% of zones have activity
    return Math.floor(searchedZones.value.length * 3.5)
})

const breachAlerts = computed(() => {
    // Mock alerts
    return Math.floor(Math.random() * 5)
})

const totalArea = computed(() => {
    return searchedZones.value.reduce((acc, z) => acc + (z.radius * z.radius * 3.14), 0).toFixed(1)
})

// Actions
const selectZone = (zone) => {
    selectedZone.value = zone
    // In a real app, this would pan the map to the zone
}

const getZoneIcon = (type) => {
    const icons = {
        'Polygon': 'pentagon',
        'Circle': 'radio_button_unchecked',
        'Exclusion': 'do_not_disturb_on',
        'Corridor': 'alt_route'
    }
    return icons[type] || 'location_on'
}

const openZoneModal = (mode, zone = null) => {
    zoneModalMode.value = mode
    if (mode === 'edit' && zone) {
        zoneForm.value = { ...zone }
    } else {
        zoneForm.value = {
            id: null,
            name: '',
            type: 'Polygon',
            radius: 5.0,
            hubId: store.activeWarehouse === 'all' ? 1 : store.activeWarehouse,
            status: 'Active'
        }
    }
    isZoneModalOpen.value = true
}

const closeZoneModal = () => {
    isZoneModalOpen.value = false
}

const saveZone = () => {
    // In a real app, dispatch to store
    // if (zoneModalMode.value === 'create') store.addZone({...})
    
    // Simulating save
    window.alert(`Successfully ${zoneModalMode.value === 'create' ? 'created' : 'updated'} zone: ${zoneForm.value.name}`)
    closeZoneModal()
}

const deleteZone = (id) => {
    if (confirm('Are you sure you want to delete this zone? This action cannot be undone.')) {
        // store.deleteZone(id)
        window.alert('Zone deleted successfully')
    }
}
</script>
