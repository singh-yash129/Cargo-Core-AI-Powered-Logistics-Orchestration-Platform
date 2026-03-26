<template>
    <!-- Split layout: dark sidebar LEFT, full map RIGHT -->
    <div class="flex rounded-2xl overflow-hidden border border-white/8" style="height:calc(100vh - 8rem);background:#090d1c;isolation:isolate">

        <!-- ══════════════════════════════════ -->
        <!--  LEFT SIDEBAR                      -->
        <!-- ══════════════════════════════════ -->
        <div class="w-72 flex-shrink-0 flex flex-col border-r border-white/8" style="background:#090d1c">

            <!-- Header -->
            <div class="p-4 border-b border-white/8 flex-shrink-0">
                <div class="flex items-center gap-3 mb-4">
                    <div class="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center flex-shrink-0">
                        <span class="material-symbols-outlined text-indigo-400" style="font-size:20px">location_on</span>
                    </div>
                    <div>
                        <h2 class="text-white font-bold text-sm leading-tight">Geofencing & Routes</h2>
                        <p class="text-white/35 text-xs">Zone & route management</p>
                    </div>
                </div>

                <!-- Stats 2×2 grid -->
                <div class="grid grid-cols-2 gap-2">
                    <div class="bg-white/5 rounded-xl p-3 border border-white/8">
                        <div class="text-white/35 text-[9px] font-bold uppercase tracking-widest mb-1">Total Zones</div>
                        <div class="text-white font-bold text-2xl leading-none">{{ filteredZones.length }}</div>
                    </div>
                    <div class="bg-white/5 rounded-xl p-3 border border-white/8">
                        <div class="text-white/35 text-[9px] font-bold uppercase tracking-widest mb-1">Vehicles</div>
                        <div class="text-white font-bold text-2xl leading-none">{{ vehiclesInZones }}</div>
                    </div>
                    <div class="bg-white/5 rounded-xl p-3 border border-white/8">
                        <div class="text-white/35 text-[9px] font-bold uppercase tracking-widest mb-1">Coverage</div>
                        <div class="text-white font-bold text-lg leading-none">{{ totalArea }}<span class="text-[10px] text-white/35 ml-0.5">km²</span></div>
                    </div>
                    <div class="bg-white/5 rounded-xl p-3 border border-white/8">
                        <div class="text-white/35 text-[9px] font-bold uppercase tracking-widest mb-1">Alerts</div>
                        <div class="flex items-center gap-1.5 mt-1">
                            <div v-if="breachAlerts > 0" class="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse"></div>
                            <div class="text-white font-bold text-2xl leading-none">{{ breachAlerts }}</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Search + add -->
            <div class="p-3 border-b border-white/6 flex gap-2 flex-shrink-0">
                <div class="flex-1 flex items-center gap-2 bg-white/5 rounded-xl px-3 py-2 border border-white/8">
                    <span class="material-symbols-outlined text-white/25 flex-shrink-0" style="font-size:15px">search</span>
                    <input v-model="searchQuery" type="text" placeholder="Search zones..."
                        class="bg-transparent text-white text-sm outline-none flex-1 min-w-0 placeholder-white/20">
                    <button v-if="searchQuery" @click="searchQuery = ''" class="text-white/25 hover:text-white/55 transition-colors">
                        <span class="material-symbols-outlined" style="font-size:13px">close</span>
                    </button>
                </div>
                <button @click="openZoneModal('create')"
                    class="w-9 h-9 flex-shrink-0 bg-indigo-600 hover:bg-indigo-500 active:scale-95 rounded-xl flex items-center justify-center text-white transition-all shadow-lg shadow-indigo-900/40">
                    <span class="material-symbols-outlined" style="font-size:18px">add</span>
                </button>
            </div>

            <!-- Zones label -->
            <div class="px-4 py-2.5 flex items-center justify-between flex-shrink-0">
                <span class="text-white/25 text-[10px] font-bold uppercase tracking-widest">Zones</span>
                <span class="text-xs text-white/20 bg-white/6 px-1.5 py-0.5 rounded-full">{{ searchedZones.length }}</span>
            </div>

            <!-- Zone list (scrollable) -->
            <div class="flex-1 overflow-y-auto px-2 pb-2 custom-scrollbar min-h-0">

                <!-- Empty state -->
                <div v-if="searchedZones.length === 0" class="flex flex-col items-center justify-center gap-4 py-14 text-center">
                    <div class="w-14 h-14 rounded-2xl bg-white/4 border border-white/8 flex items-center justify-center">
                        <span class="material-symbols-outlined text-white/20" style="font-size:28px">add_location_alt</span>
                    </div>
                    <div>
                        <p class="text-white/40 text-sm font-medium">No zones yet</p>
                        <p class="text-white/20 text-xs mt-1">Press <span class="text-indigo-400">+</span> to create<br>your first geofence</p>
                    </div>
                </div>

                <!-- Zone cards -->
                <div v-for="zone in searchedZones" :key="zone.id"
                    @click="selectZone(zone)"
                    class="group relative rounded-xl p-3 mb-1 cursor-pointer transition-all duration-150 border"
                    :class="selectedZone?.id === zone.id
                        ? 'border-white/18 shadow-lg'
                        : 'border-transparent hover:border-white/8'"
                    :style="selectedZone?.id === zone.id ? `background:${getColor(zone.color)}18` : ''">

                    <!-- Color accent stripe -->
                    <div class="absolute left-0 top-3 bottom-3 w-0.5 rounded-r-full transition-all"
                        :style="`background:${getColor(zone.color)};opacity:${selectedZone?.id === zone.id ? 1 : 0.5}`"></div>

                    <div class="flex items-start gap-2 pl-2">
                        <div class="flex-1 min-w-0">
                            <div class="text-white text-sm font-semibold truncate">{{ zone.name }}</div>
                            <div class="flex items-center gap-1.5 mt-1.5">
                                <span class="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wide leading-none"
                                    :style="`background:${getColor(zone.color)}22;color:${getColor(zone.color)};border:1px solid ${getColor(zone.color)}44`">
                                    {{ zone.type }}
                                </span>
                                <span class="text-white/30 text-[10px]">{{ zone.radius || 1 }} km</span>
                            </div>
                            <div class="text-white/22 text-[10px] mt-1.5 truncate flex items-center gap-1">
                                <span class="material-symbols-outlined" style="font-size:10px;vertical-align:middle">warehouse</span>
                                {{ getHubName(zone.hubId) }}
                            </div>
                        </div>
                        <!-- Hover actions -->
                        <div class="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                            <button @click.stop="openZoneModal('edit', zone)"
                                class="w-6 h-6 rounded-lg hover:bg-white/10 flex items-center justify-center text-white/35 hover:text-white transition-colors">
                                <span class="material-symbols-outlined" style="font-size:12px">edit</span>
                            </button>
                            <button @click.stop="deleteZone(zone.id)"
                                class="w-6 h-6 rounded-lg hover:bg-red-500/20 flex items-center justify-center text-white/35 hover:text-red-400 transition-colors">
                                <span class="material-symbols-outlined" style="font-size:12px">delete</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Footer: New Zone full button -->
            <div class="p-3 border-t border-white/6 flex-shrink-0">
                <button @click="openZoneModal('create')"
                    class="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-900/30 border border-indigo-500/30">
                    <span class="material-symbols-outlined" style="font-size:16px">add_location_alt</span>
                    New Zone
                </button>
            </div>
        </div>

        <!-- ══════════════════════════════════ -->
        <!--  RIGHT: MAP AREA                   -->
        <!-- ══════════════════════════════════ -->
        <div class="flex-1 relative overflow-hidden">

            <!-- Leaflet full-fills this div -->
            <div ref="mapContainer" class="absolute inset-0 z-0" />

            <!-- View toggle — top right corner of map -->
            <div class="absolute top-4 right-4 z-[500] flex items-center gap-2">
                <div class="geo-glass rounded-xl p-1 flex">
                    <button @click="viewMode = 'map'"
                        class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5"
                        :class="viewMode === 'map' ? 'bg-white/15 text-white' : 'text-white/40 hover:text-white'">
                        <span class="material-symbols-outlined" style="font-size:14px">map</span> Map
                    </button>
                    <button @click="viewMode = 'list'"
                        class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5"
                        :class="viewMode === 'list' ? 'bg-white/15 text-white' : 'text-white/40 hover:text-white'">
                        <span class="material-symbols-outlined" style="font-size:14px">table_rows</span> List
                    </button>
                </div>
            </div>

            <!-- Selected zone detail card — bottom right -->
            <Transition
                enter-active-class="transition-all duration-200 ease-out"
                enter-from-class="opacity-0 translate-y-3 scale-95"
                enter-to-class="opacity-100 translate-y-0 scale-100"
                leave-active-class="transition-all duration-150 ease-in"
                leave-from-class="opacity-100 translate-y-0 scale-100"
                leave-to-class="opacity-0 translate-y-3 scale-95">
                <div v-if="selectedZone && viewMode === 'map'"
                    class="absolute z-[500] geo-glass rounded-2xl p-4 w-62"
                    style="bottom:2.75rem;right:1rem;width:15rem">

                    <!-- Zone color banner -->
                    <div class="h-1 rounded-full mb-3 -mx-1" :style="`background:linear-gradient(90deg,${getColor(selectedZone.color)},${getColor(selectedZone.color)}44)`"></div>

                    <div class="flex items-start justify-between gap-2 mb-3">
                        <div class="min-w-0">
                            <div class="text-white font-bold text-sm truncate">{{ selectedZone.name }}</div>
                            <div class="text-white/40 text-xs mt-0.5 truncate">{{ getHubName(selectedZone.hubId) }}</div>
                        </div>
                        <button @click="selectedZone = null" class="text-white/20 hover:text-white/55 transition-colors flex-shrink-0">
                            <span class="material-symbols-outlined" style="font-size:16px">close</span>
                        </button>
                    </div>

                    <div class="grid grid-cols-2 gap-2 mb-3">
                        <div class="bg-white/5 rounded-xl p-2.5 text-center border border-white/6">
                            <div class="text-white/30 text-[9px] uppercase tracking-widest mb-1">Type</div>
                            <div class="text-white text-xs font-bold">{{ selectedZone.type }}</div>
                        </div>
                        <div class="bg-white/5 rounded-xl p-2.5 text-center border border-white/6">
                            <div class="text-white/30 text-[9px] uppercase tracking-widest mb-1">Radius</div>
                            <div class="text-white text-xs font-bold">{{ selectedZone.radius || 1 }} km</div>
                        </div>
                    </div>

                    <div class="flex items-center gap-2 mb-3 px-0.5">
                        <div class="w-2.5 h-2.5 rounded-full flex-shrink-0" :style="`background:${getColor(selectedZone.color)};box-shadow:0 0 8px ${getColor(selectedZone.color)}88`"></div>
                        <span class="text-white/35 text-[10px] capitalize flex-1">{{ selectedZone.color }} zone</span>
                        <span class="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide"
                            :class="selectedZone.status === 'Active'
                                ? 'bg-green-500/15 text-green-400 border border-green-500/25'
                                : 'bg-white/5 text-white/30 border border-white/10'">
                            {{ selectedZone.status || 'Active' }}
                        </span>
                    </div>

                    <div class="flex gap-2">
                        <button @click="openZoneModal('edit', selectedZone)"
                            class="flex-1 py-2 bg-white/7 hover:bg-white/14 text-white text-xs font-semibold rounded-xl transition-colors border border-white/10 flex items-center justify-center gap-1">
                            <span class="material-symbols-outlined" style="font-size:13px">edit</span> Edit
                        </button>
                        <button @click="deleteZone(selectedZone.id)"
                            class="flex-1 py-2 bg-red-500/12 hover:bg-red-500/22 text-red-400 text-xs font-semibold rounded-xl transition-colors border border-red-500/20 flex items-center justify-center gap-1">
                            <span class="material-symbols-outlined" style="font-size:13px">delete</span> Delete
                        </button>
                    </div>
                </div>
            </Transition>

            <!-- Status bar — bottom of map -->
            <div class="absolute bottom-0 left-0 right-0 z-[500] h-9 geo-bar flex items-center px-4 justify-between">
                <div class="flex items-center gap-4 font-mono text-xs text-white/30">
                    <span>{{ mapCenter[0].toFixed(5) }}°N</span>
                    <span>{{ mapCenter[1].toFixed(5) }}°E</span>
                    <span class="text-white/12">|</span>
                    <span>{{ searchedZones.length }} zone{{ searchedZones.length !== 1 ? 's' : '' }}</span>
                </div>
                <div class="flex items-center gap-2 text-xs text-white/30">
                    <span class="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                    <span>OpenStreetMap</span>
                </div>
            </div>

            <!-- LIST VIEW overlay — slides over the map -->
            <Transition
                enter-active-class="transition-all duration-200 ease-out"
                enter-from-class="opacity-0 scale-[0.99]"
                enter-to-class="opacity-100 scale-100"
                leave-active-class="transition-all duration-150 ease-in"
                leave-from-class="opacity-100 scale-100"
                leave-to-class="opacity-0 scale-[0.99]">
                <div v-if="viewMode === 'list'" class="absolute inset-0 z-[400] geo-overlay flex flex-col">
                    <div class="px-6 py-4 border-b border-white/8 flex items-center justify-between flex-shrink-0">
                        <div>
                            <h3 class="text-white font-bold">All Geofence Zones</h3>
                            <p class="text-white/30 text-xs mt-0.5">{{ filteredZones.length }} zones across all warehouses</p>
                        </div>
                        <div class="flex gap-3">
                            <button class="text-white/30 hover:text-white/60 text-xs flex items-center gap-1.5 transition-colors">
                                <span class="material-symbols-outlined" style="font-size:14px">filter_list</span> Filter
                            </button>
                            <button class="text-white/30 hover:text-white/60 text-xs flex items-center gap-1.5 transition-colors">
                                <span class="material-symbols-outlined" style="font-size:14px">download</span> Export
                            </button>
                        </div>
                    </div>
                    <div class="flex-1 overflow-auto custom-scrollbar">
                        <table class="w-full text-left text-sm">
                            <thead class="sticky top-0 z-10" style="background:rgba(9,13,28,0.97)">
                                <tr class="text-white/25 border-b border-white/8 text-[10px] uppercase tracking-widest font-semibold">
                                    <th class="py-3 px-6">Zone Name</th>
                                    <th class="py-3 px-4">Type</th>
                                    <th class="py-3 px-4">Warehouse</th>
                                    <th class="py-3 px-4 text-right">Radius</th>
                                    <th class="py-3 px-4 text-right">Status</th>
                                    <th class="py-3 px-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-white/5">
                                <tr v-if="searchedZones.length === 0">
                                    <td colspan="6" class="py-24 text-center">
                                        <span class="material-symbols-outlined text-white/12 block mb-3" style="font-size:52px">add_location_alt</span>
                                        <p class="text-white/35 font-medium">No zones yet</p>
                                        <p class="text-white/18 text-xs mt-1">Click <span class="text-indigo-400">New Zone</span> to get started</p>
                                    </td>
                                </tr>
                                <tr v-for="zone in searchedZones" :key="zone.id"
                                    class="hover:bg-white/4 transition-colors group cursor-pointer"
                                    @click="selectZone(zone)">
                                    <td class="py-3.5 px-6">
                                        <div class="flex items-center gap-3">
                                            <div class="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                                :style="`background:${getColor(zone.color)};box-shadow:0 0 6px ${getColor(zone.color)}66`"></div>
                                            <span class="text-white font-semibold">{{ zone.name }}</span>
                                        </div>
                                    </td>
                                    <td class="py-3.5 px-4 text-white/50 text-xs">{{ zone.type }}</td>
                                    <td class="py-3.5 px-4 text-white/35 text-xs">{{ getHubName(zone.hubId) }}</td>
                                    <td class="py-3.5 px-4 text-right font-mono text-white/55 text-xs">{{ zone.radius || 1 }} km</td>
                                    <td class="py-3.5 px-4 text-right">
                                        <span class="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide"
                                            :class="zone.status === 'Active'
                                                ? 'bg-green-500/15 text-green-400 border border-green-500/25'
                                                : 'bg-white/5 text-white/30 border border-white/8'">
                                            {{ zone.status || 'Active' }}
                                        </span>
                                    </td>
                                    <td class="py-3.5 px-6 text-right">
                                        <div class="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button @click.stop="openZoneModal('edit', zone)"
                                                class="px-3 py-1.5 bg-white/6 hover:bg-white/12 text-white/55 hover:text-white text-xs rounded-lg transition-colors border border-white/10">
                                                Edit
                                            </button>
                                            <button @click.stop="deleteZone(zone.id)"
                                                class="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs rounded-lg transition-colors border border-red-500/18">
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </Transition>
        </div>

        <!-- ══════════════════════════════════ -->
        <!--  MODAL                             -->
        <!-- ══════════════════════════════════ -->
        <Teleport to="body">
            <div v-if="isZoneModalOpen"
                class="fixed inset-0 bg-black/65 backdrop-blur-md z-[9999] flex items-center justify-center p-4">
                <div class="geo-modal w-full max-w-lg rounded-2xl overflow-hidden" style="animation:scaleIn 0.18s ease-out">

                    <div class="px-6 py-5 border-b border-white/8 flex justify-between items-start">
                        <div>
                            <h3 class="text-white font-bold text-base">
                                {{ zoneModalMode === 'create' ? 'Create New Zone' : 'Edit Zone' }}
                            </h3>
                            <p class="text-white/30 text-xs mt-0.5">Configure geofence boundary and alerts</p>
                        </div>
                        <button @click="closeZoneModal" class="text-white/22 hover:text-white/65 transition-colors mt-0.5">
                            <span class="material-symbols-outlined" style="font-size:20px">close</span>
                        </button>
                    </div>

                    <div class="p-6 space-y-5">
                        <div>
                            <label class="block text-white/40 text-[10px] font-bold uppercase tracking-widest mb-2">Zone Name</label>
                            <input v-model="zoneForm.name" type="text" placeholder="e.g. Bangalore Central Delivery"
                                class="geo-input w-full rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none">
                        </div>

                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-white/40 text-[10px] font-bold uppercase tracking-widest mb-2">Zone Type</label>
                                <select v-model="zoneForm.type" class="geo-input w-full rounded-xl px-4 py-3 text-sm text-white outline-none appearance-none">
                                    <option value="Polygon" class="bg-slate-900">Polygon</option>
                                    <option value="Circle" class="bg-slate-900">Circle</option>
                                    <option value="Exclusion" class="bg-slate-900">Exclusion Zone</option>
                                    <option value="Corridor" class="bg-slate-900">Corridor</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-white/40 text-[10px] font-bold uppercase tracking-widest mb-2">Radius (km)</label>
                                <input v-model="zoneForm.radius" type="number" step="0.1" min="0.1"
                                    class="geo-input w-full rounded-xl px-4 py-3 text-sm text-white outline-none">
                            </div>
                        </div>

                        <div>
                            <label class="block text-white/40 text-[10px] font-bold uppercase tracking-widest mb-2">Assigned Warehouse</label>
                            <select v-model="zoneForm.hubId" class="geo-input w-full rounded-xl px-4 py-3 text-sm text-white outline-none appearance-none">
                                <option v-for="hub in store.hubs" :key="hub.id" :value="hub.id" class="bg-slate-900">{{ hub.name }}</option>
                            </select>
                        </div>

                        <!-- Color picker -->
                        <div>
                            <label class="block text-white/40 text-[10px] font-bold uppercase tracking-widest mb-2.5">Zone Color</label>
                            <div class="flex gap-3 flex-wrap">
                                <button v-for="(hex, name) in zoneColorMap" :key="name"
                                    @click="zoneForm.color = name"
                                    class="w-9 h-9 rounded-full transition-all hover:scale-110 flex items-center justify-center relative"
                                    :style="`background:${hex};box-shadow:${zoneForm.color === name ? '0 0 0 3px rgba(255,255,255,0.25),0 0 12px ' + hex + '88' : 'none'}`">
                                    <span v-if="zoneForm.color === name" class="material-symbols-outlined text-white drop-shadow-md" style="font-size:15px">check</span>
                                </button>
                            </div>
                            <!-- Preview -->
                            <div class="mt-3 h-8 rounded-xl border border-white/10 flex items-center px-3 gap-2"
                                :style="`background:${zoneColorMap[zoneForm.color] || '#6366f1'}22;border-color:${zoneColorMap[zoneForm.color] || '#6366f1'}44`">
                                <div class="w-2 h-2 rounded-full" :style="`background:${zoneColorMap[zoneForm.color] || '#6366f1'}`"></div>
                                <span class="text-xs capitalize" :style="`color:${zoneColorMap[zoneForm.color] || '#6366f1'}`">{{ zoneForm.color }} · {{ zoneForm.radius || 5 }} km radius zone</span>
                            </div>
                        </div>

                        <label class="flex items-center gap-3 p-3.5 bg-white/4 rounded-xl border border-white/8 cursor-pointer hover:bg-white/6 transition-colors">
                            <input type="checkbox" class="w-4 h-4 rounded bg-white/10 border-white/20 text-indigo-500">
                            <div>
                                <div class="text-white text-sm font-medium">Trigger alert on vehicle entry</div>
                                <div class="text-white/28 text-xs mt-0.5">Notify dispatcher when boundary is crossed</div>
                            </div>
                        </label>
                    </div>

                    <div class="px-6 py-4 border-t border-white/8 flex justify-end gap-3">
                        <button @click="closeZoneModal"
                            class="px-5 py-2.5 text-sm font-semibold text-white/55 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-colors">
                            Cancel
                        </button>
                        <button @click="saveZone" :disabled="isSaving"
                            class="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-wait text-white text-sm font-bold rounded-xl flex items-center gap-2 transition-colors shadow-lg shadow-indigo-900/40 border border-indigo-500/30">
                            <div v-if="isSaving" class="w-4 h-4 border-2 border-white/25 border-t-white rounded-full animate-spin"></div>
                            <span v-else class="material-symbols-outlined" style="font-size:15px">save</span>
                            {{ isSaving ? 'Saving...' : zoneModalMode === 'create' ? 'Create Zone' : 'Update Zone' }}
                        </button>
                    </div>
                </div>
            </div>
        </Teleport>
    </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useLogisticStore } from '@/stores/logisticStore'
import { storeToRefs } from 'pinia'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const store = useLogisticStore()
const { filteredZones, hubs } = storeToRefs(store)

// Map refs
const mapContainer = ref(null)
const mapCenter = ref([12.9716, 77.5946])
let leafletMap = null
let zoneLayerMap = {}   // zone.id -> L.circle  (so we can restyle on select)
let hubMarkers = []

// UI state
const viewMode = ref('map')
const searchQuery = ref('')
const selectedZone = ref(null)
const isSaving = ref(false)

// Modal
const isZoneModalOpen = ref(false)
const zoneModalMode = ref('create')
const zoneForm = ref({ name: '', type: 'Polygon', radius: 5.0, hubId: '', status: 'Active', color: 'blue' })

// ── Computed ─────────────────────────────────────────────────
const searchedZones = computed(() => {
    const q = searchQuery.value.toLowerCase()
    return filteredZones.value.filter(z =>
        !q || z.name.toLowerCase().includes(q) || z.type.toLowerCase().includes(q)
    )
})

const vehiclesInZones = computed(() => Math.floor(searchedZones.value.length * 3.5))
const breachAlerts = computed(() => 0)
const totalArea = computed(() =>
    searchedZones.value.reduce((acc, z) => acc + ((z.radius || 1) ** 2 * Math.PI), 0).toFixed(1)
)
const getHubName = (hubId) => hubs.value.find(h => h.id === hubId)?.name || '—'

// ── Leaflet color map ─────────────────────────────────────────
const zoneColorMap = {
    blue:   '#3b82f6',
    green:  '#22c55e',
    red:    '#ef4444',
    purple: '#a855f7',
    orange: '#f97316',
    indigo: '#6366f1',
}
const getColor = (c) => zoneColorMap[c] || '#6366f1'

// ── Draw / update zone circles ────────────────────────────────
function getZoneStyle(zone, isSelected) {
    const color = getColor(zone.color)
    return {
        color,
        fillColor: color,
        fillOpacity: isSelected ? 0.38 : 0.18,
        weight: isSelected ? 3 : 2,
        opacity: isSelected ? 1 : 0.75,
        // dashed border for exclusion zones
        dashArray: zone.type === 'Exclusion' ? '8 6' : null,
    }
}

function drawZoneCircles() {
    if (!leafletMap) return

    // Remove old layers
    Object.values(zoneLayerMap).forEach(c => leafletMap.removeLayer(c))
    zoneLayerMap = {}

    searchedZones.value.forEach((zone, i) => {
        const hub = hubs.value.find(h => h.id === zone.hubId)
        if (!hub?.lat || !hub?.lng) return

        const lat = hub.lat + i * 0.007
        const lng = hub.lng + i * 0.009
        const isSelected = selectedZone.value?.id === zone.id
        const color = getColor(zone.color)

        const circle = L.circle([lat, lng], {
            radius: (zone.radius || 1) * 1000,
            ...getZoneStyle(zone, isSelected),
        }).addTo(leafletMap)

        // Popup
        circle.bindPopup(
            `<div class="geo-popup-inner">
                <div class="geo-popup-title">${zone.name}</div>
                <div class="geo-popup-sub">${zone.type} &nbsp;·&nbsp; ${zone.radius || 1} km radius</div>
                <div class="geo-popup-hub">
                    <span class="material-symbols-outlined" style="font-size:10px;vertical-align:middle;margin-right:3px">warehouse</span>
                    ${getHubName(zone.hubId)}
                </div>
            </div>`,
            { className: 'geo-popup', closeButton: false }
        )

        circle.on('click', () => selectZone(zone))
        zoneLayerMap[zone.id] = circle
    })

    // Fit bounds if zones exist
    const layers = Object.values(zoneLayerMap)
    if (layers.length) {
        try {
            leafletMap.fitBounds(L.featureGroup(layers).getBounds().pad(0.35))
        } catch (_) {}
    }
}

// Restyle circle when selection changes — without full redraw
watch(selectedZone, (newZone, oldZone) => {
    if (oldZone && zoneLayerMap[oldZone.id]) {
        zoneLayerMap[oldZone.id].setStyle(getZoneStyle(oldZone, false))
    }
    if (newZone && zoneLayerMap[newZone.id]) {
        zoneLayerMap[newZone.id].setStyle(getZoneStyle(newZone, true))
        zoneLayerMap[newZone.id].bringToFront()
    }
})

// ── Hub markers ───────────────────────────────────────────────
function updateHubMarkers() {
    if (!leafletMap) return
    hubMarkers.forEach(m => leafletMap.removeLayer(m))
    hubMarkers = []
    hubs.value.forEach(hub => {
        if (!hub.lat || !hub.lng) return
        const m = L.marker([hub.lat, hub.lng], {
            icon: L.divIcon({
                className: '',
                html: `<div style="width:36px;height:36px;background:linear-gradient(135deg,#6366f1,#4338ca);border-radius:50%;display:flex;align-items:center;justify-content:center;border:2.5px solid rgba(255,255,255,0.85);box-shadow:0 4px 16px rgba(99,102,241,0.6),0 0 0 6px rgba(99,102,241,0.15)">
                    <span class="material-symbols-outlined" style="font-size:16px;color:white">warehouse</span>
                </div>`,
                iconSize: [36, 36], iconAnchor: [18, 18],
            }),
        }).addTo(leafletMap)
        m.bindPopup(
            `<div class="geo-popup-inner">
                <div class="geo-popup-title">${hub.name}</div>
                <div class="geo-popup-sub">${hub.location || hub.address || ''}</div>
            </div>`,
            { className: 'geo-popup', closeButton: false }
        )
        hubMarkers.push(m)
    })
}

// ── Init map ──────────────────────────────────────────────────
async function initMap() {
    if (!mapContainer.value || leafletMap) return

    const firstHub = hubs.value.find(h => h.lat && h.lng)
    const center = firstHub ? [firstHub.lat, firstHub.lng] : [12.9716, 77.5946]
    mapCenter.value = center

    leafletMap = L.map(mapContainer.value, {
        center, zoom: 11,
        zoomControl: false,
        attributionControl: false,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(leafletMap)
    L.control.zoom({ position: 'bottomright' }).addTo(leafletMap)

    leafletMap.on('moveend', () => {
        const c = leafletMap.getCenter()
        mapCenter.value = [parseFloat(c.lat.toFixed(5)), parseFloat(c.lng.toFixed(5))]
    })

    await new Promise(r => setTimeout(r, 150))
    leafletMap.invalidateSize()
    updateHubMarkers()
    drawZoneCircles()
}

// ── Watchers ──────────────────────────────────────────────────
watch(viewMode, async (mode) => {
    if (mode === 'map') {
        await nextTick()
        if (!leafletMap) await initMap()
        else setTimeout(() => { leafletMap.invalidateSize(); drawZoneCircles() }, 50)
    }
})

watch(searchedZones, () => {
    if (leafletMap && viewMode.value === 'map') drawZoneCircles()
}, { deep: true })

watch(hubs, () => { if (leafletMap) updateHubMarkers() }, { deep: true })

onMounted(async () => { await nextTick(); await initMap() })
onUnmounted(() => { if (leafletMap) { leafletMap.remove(); leafletMap = null } })

// ── Zone helpers ──────────────────────────────────────────────
const getZoneIcon = (type) => ({ Polygon: 'pentagon', Circle: 'radio_button_unchecked', Exclusion: 'do_not_disturb_on', Corridor: 'alt_route' }[type] || 'location_on')

const selectZone = (zone) => {
    selectedZone.value = zone
    // Fly to zone on map
    if (leafletMap && viewMode.value === 'map') {
        const hub = hubs.value.find(h => h.id === zone.hubId)
        const idx = searchedZones.value.findIndex(z => z.id === zone.id)
        if (hub?.lat && hub?.lng) {
            leafletMap.flyTo(
                [hub.lat + idx * 0.007, hub.lng + idx * 0.009],
                Math.max(10, 13 - Math.floor((zone.radius || 1) / 5)),
                { duration: 0.7 }
            )
        }
    }
    if (viewMode.value === 'list') viewMode.value = 'map'
}

const openZoneModal = (mode, zone = null) => {
    zoneModalMode.value = mode
    zoneForm.value = mode === 'edit' && zone
        ? { ...zone }
        : { id: null, name: '', type: 'Polygon', radius: 5.0, hubId: hubs.value[0]?.id || '', status: 'Active', color: 'blue' }
    isZoneModalOpen.value = true
}

const closeZoneModal = () => { isZoneModalOpen.value = false }

const saveZone = async () => {
    if (!zoneForm.value.name?.trim()) return window.alert('Please enter a zone name')
    if (!zoneForm.value.hubId) return window.alert('Please select a warehouse')
    isSaving.value = true
    try {
        if (zoneModalMode.value === 'create') await store.createZone(zoneForm.value)
        else await store.updateZone(zoneForm.value.id, zoneForm.value)
        closeZoneModal()
    } catch (err) {
        window.alert(`Error: ${err.message || 'Could not save zone'}`)
    } finally {
        isSaving.value = false
    }
}

const deleteZone = async (id) => {
    if (!confirm('Delete this zone? This cannot be undone.')) return
    try {
        await store.deleteZone(id)
        if (selectedZone.value?.id === id) selectedZone.value = null
    } catch (err) {
        window.alert(`Error: ${err.message || 'Could not delete zone'}`)
    }
}
</script>

<style>
/* ── Glassmorphism panels ─────────── */
.geo-glass {
    background: rgba(9, 13, 28, 0.82);
    backdrop-filter: blur(20px) saturate(1.6);
    -webkit-backdrop-filter: blur(20px) saturate(1.6);
    border: 1px solid rgba(255, 255, 255, 0.09);
    box-shadow: 0 8px 32px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.04);
}

.geo-bar {
    background: rgba(6, 9, 20, 0.88);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-top: 1px solid rgba(255,255,255,0.06);
}

.geo-overlay {
    background: rgba(9, 13, 28, 0.94);
    backdrop-filter: blur(24px) saturate(1.4);
    -webkit-backdrop-filter: blur(24px) saturate(1.4);
}

.geo-modal {
    background: rgb(9, 13, 28);
    border: 1px solid rgba(255,255,255,0.1);
    box-shadow: 0 30px 80px rgba(0,0,0,0.9), 0 0 0 1px rgba(99,102,241,0.12);
}

.geo-input {
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1);
    transition: border-color 0.2s, box-shadow 0.2s;
}
.geo-input:focus {
    border-color: rgba(99,102,241,0.55);
    box-shadow: 0 0 0 3px rgba(99,102,241,0.12);
}

/* ── Leaflet base ─────────────────── */
.leaflet-container {
    background: #0c1020;
    font-family: inherit;
}

/* ── Zoom controls ────────────────── */
.leaflet-control-zoom {
    border: 1px solid rgba(255,255,255,0.1) !important;
    box-shadow: 0 4px 20px rgba(0,0,0,0.55) !important;
    border-radius: 12px !important;
    overflow: hidden;
    margin-bottom: 2.5rem !important;
    margin-right: 0.75rem !important;
}
.leaflet-control-zoom a {
    background: rgba(9,13,28,0.88) !important;
    backdrop-filter: blur(12px);
    color: rgba(255,255,255,0.65) !important;
    border: none !important;
    border-bottom: 1px solid rgba(255,255,255,0.08) !important;
    width: 34px !important;
    height: 34px !important;
    line-height: 34px !important;
    font-size: 18px !important;
    transition: all 0.15s !important;
}
.leaflet-control-zoom a:hover {
    background: rgba(99,102,241,0.35) !important;
    color: white !important;
}
.leaflet-control-zoom-out { border-bottom: none !important; }

/* ── Zone popup ───────────────────── */
.geo-popup .leaflet-popup-content-wrapper {
    background: rgba(9,13,28,0.95) !important;
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255,255,255,0.1) !important;
    border-radius: 12px !important;
    box-shadow: 0 8px 32px rgba(0,0,0,0.65) !important;
    padding: 0 !important;
}
.geo-popup .leaflet-popup-content {
    margin: 0 !important;
}
.geo-popup .leaflet-popup-tip {
    background: rgba(9,13,28,0.95) !important;
}
.geo-popup-inner {
    padding: 10px 14px;
}
.geo-popup-title {
    color: white;
    font-weight: 700;
    font-size: 13px;
    margin-bottom: 3px;
}
.geo-popup-sub {
    color: rgba(255,255,255,0.45);
    font-size: 11px;
    margin-bottom: 4px;
}
.geo-popup-hub {
    color: rgba(255,255,255,0.3);
    font-size: 10px;
}

/* ── Modal animation ──────────────── */
@keyframes scaleIn {
    from { opacity: 0; transform: scale(0.96) translateY(8px); }
    to   { opacity: 1; transform: scale(1)    translateY(0); }
}

/* ── Thin scrollbar ───────────────── */
.custom-scrollbar::-webkit-scrollbar { width: 3px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
</style>
