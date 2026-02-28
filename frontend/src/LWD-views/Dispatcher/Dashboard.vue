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
            <!-- Map Placeholder -->
            <div class="absolute inset-0 bg-gradient-to-br from-gray-200 dark:from-gray-800 to-gray-100 dark:to-gray-900 opacity-60"></div>
            <div class="absolute inset-0 bg-gray-100/20 dark:bg-background-dark/20 backdrop-blur-[2px]"></div>

            <!-- Left Panel Toggle -->
            <button @click="showLeftPanel = !showLeftPanel"
                class="absolute top-4 left-4 z-20 bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 shadow-md backdrop-blur-xl p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors group" :title="showLeftPanel ? 'Hide Drivers' : 'Show Drivers'">
                <span class="material-symbols-outlined text-[18px]" :class="showLeftPanel ? 'text-primary' : 'text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white'">{{ showLeftPanel ? 'left_panel_close' : 'left_panel_open' }}</span>
            </button>

            <!-- Right Panel Toggle -->
            <button @click="showRightPanel = !showRightPanel"
                class="absolute top-4 right-4 z-20 bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 shadow-md backdrop-blur-xl p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors group" :title="showRightPanel ? 'Hide Loads' : 'Show Loads'">
                <span class="material-symbols-outlined text-[18px]" :class="showRightPanel ? 'text-primary' : 'text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white'">{{ showRightPanel ? 'right_panel_close' : 'right_panel_open' }}</span>
            </button>

            <!-- Overlay Controls -->
            <div class="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex gap-2">
                <div class="glass-panel px-4 py-2 rounded-lg flex items-center gap-4">
                    <div class="flex items-center gap-2">
                        <span
                            class="w-3 h-3 rounded-full bg-primary border-2 border-gray-300 dark:border-white/20 shadow-[0_0_10px_rgba(28,231,131,0.5)]"></span>
                        <span class="text-xs font-medium text-gray-900 dark:text-white">Available</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="w-3 h-3 rounded-full bg-yellow-500 border-2 border-gray-300 dark:border-white/20"></span>
                        <span class="text-xs font-medium text-gray-900 dark:text-white">Busy</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="w-3 h-3 rounded-full bg-gray-500 border-2 border-gray-300 dark:border-white/20"></span>
                        <span class="text-xs font-medium text-gray-900 dark:text-white">Offline</span>
                    </div>
                </div>
            </div>

            <!-- Simulated Map Markers -->
            <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <!-- Truck Marker -->
                <div class="relative group cursor-pointer" style="left: -100px; top: -50px;">
                    <div class="w-16 h-16 bg-primary/10 rounded-full animate-ping absolute inset-0"></div>
                    <div
                        class="w-8 h-8 bg-white dark:bg-background-dark rounded-full border-2 border-primary flex items-center justify-center relative z-10 shadow-lg">
                        <span class="material-symbols-outlined text-primary text-[14px]">local_shipping</span>
                    </div>
                    <div
                        class="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-white/90 dark:bg-background-dark/90 rounded text-[10px] text-gray-900 dark:text-white whitespace-nowrap border border-gray-200 dark:border-white/10 hidden group-hover:block z-20">
                        Driver: J. Doe
                    </div>
                </div>

                <!-- Unassigned Order Dot -->
                <div class="w-4 h-4 rounded-full bg-gray-400 border-2 border-white hover:scale-125 transition-transform cursor-pointer absolute"
                    style="left: 120px; top: 80px;"></div>
                <div class="w-4 h-4 rounded-full bg-gray-400 border-2 border-white hover:scale-125 transition-transform cursor-pointer absolute"
                    style="left: 140px; top: 90px;"></div>

                <!-- Active Route Line (CSS Simulation) -->
                <svg class="absolute top-0 left-0 w-[400px] h-[300px] pointer-events-none"
                    style="transform: translate(-100px, -50px);">
                    <path d="M 34 34 Q 150 10 240 140" stroke="#1CE783" stroke-width="3" fill="none"
                        stroke-dasharray="5,5" class="animate-pulse" />
                </svg>
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
                <h3 class="font-bold text-gray-900 dark:text-white text-sm">Pending Loads (8)</h3>
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
                                <span class="text-gray-900 dark:text-white font-medium">14:00 – 18:00</span>
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
                    <div class="h-full bg-gradient-to-r from-yellow-500 to-green-500 w-[94%]"></div>
                </div>
                <div class="flex justify-between text-[10px]">
                    <span class="text-gray-900 dark:text-white">94% Predicted</span>
                    <span class="text-green-400">+2% vs Target</span>
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
                    <option value="">Choose order...</option>
                    <option v-for="load in pendingLoads" :key="load.id" :value="load.id">{{ load.id }} — {{ load.type }} ({{ load.weight }}kg)</option>
                </select>
            </div>
            <div class="mb-4">
                <label class="text-xs text-gray-400 mb-1 block">Select Driver</label>
                <select v-model="assignDriverId" class="w-full bg-gray-100 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none">
                    <option value="">Choose driver...</option>
                    <option v-for="d in drivers" :key="d.id" :value="d.id">{{ d.name }} ({{ d.vehicle }}, {{ d.load }}% load)</option>
                </select>
            </div>
            <div class="flex gap-2">
                <button @click="confirmAssign" :disabled="!assignOrderId || !assignDriverId"
                    class="flex-1 bg-primary text-black font-bold py-2 rounded-lg text-sm disabled:opacity-50 hover:bg-primary-dark transition-colors">Assign</button>
                <button @click="showAssignModal = false" class="flex-1 bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white py-2 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-white/20 transition-colors">Cancel</button>
            </div>
            <div v-if="assignSuccess" class="mt-3 text-center text-xs text-green-400 font-bold">✓ Order assigned successfully!</div>
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
import { ref, computed } from 'vue'

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
const showChatModal = ref(false)
const chatDriver = ref(null)
const chatMsg = ref('')
const mapLayers = ref({ layers: false, traffic: false, heatmap: false, history: false })
const showDriverDetailModal = ref(false)
const detailDriver = ref(null)
const draggingLoad = ref(null)
const dragOverDriver = ref(null)
const dragAssignToast = ref('')

const drivers = ref([
    { id: 'DRV-001', name: 'Mike Ross', vehicle: 'Van T-20', location: 'Sector 4', statusColor: 'bg-green-500', load: 85, hours: 4.5, avatar: 'https://i.pravatar.cc/150?u=1' },
    { id: 'DRV-042', name: 'Harvey Specter', vehicle: 'Truck XL', location: 'Downtown', statusColor: 'bg-yellow-500', load: 45, hours: 2.1, avatar: 'https://i.pravatar.cc/150?u=2' },
    { id: 'DRV-091', name: 'Rachel Zane', vehicle: 'Van T-15', location: 'West End', statusColor: 'bg-green-500', load: 12, hours: 6.8, avatar: 'https://i.pravatar.cc/150?u=3' },
    { id: 'DRV-103', name: 'Louis Litt', vehicle: 'Van T-20', location: 'Depot', statusColor: 'bg-gray-500', load: 0, hours: 8.0, avatar: 'https://i.pravatar.cc/150?u=4' },
])

const pendingLoads = ref([
    { id: 'ORD-9921', type: 'Electronics', weight: 450, volume: 2.1, priority: 'HIGH', hub: 'North-East' },
    { id: 'ORD-3321', type: 'Perishables', weight: 120, volume: 0.8, priority: 'URGENT', hub: 'South' },
    { id: 'ORD-1102', type: 'Furniture', weight: 850, volume: 5.4, priority: 'NORMAL', hub: 'North-East' },
    { id: 'ORD-5541', type: 'Retail Goods', weight: 200, volume: 1.2, priority: 'NORMAL', hub: 'West DC' },
])

const filteredDrivers = computed(() => {
    let list = drivers.value
    if (!showAllDrivers.value) list = list.filter(d => d.statusColor !== 'bg-gray-500')
    if (driverSearch.value) {
        const q = driverSearch.value.toLowerCase()
        list = list.filter(d => d.name.toLowerCase().includes(q) || d.id.toLowerCase().includes(q) || d.vehicle.toLowerCase().includes(q))
    }
    return list
})

function selectDriver(driver) { selectedDriver.value = selectedDriver.value?.id === driver.id ? null : driver }
function toggleLoadDetail(load) { expandedLoad.value = expandedLoad.value?.id === load.id ? null : load }
function toggleMapLayer(layer) { mapLayers.value[layer] = !mapLayers.value[layer] }

function assignLoad(load) {
    assignOrderId.value = load.id
    showAssignModal.value = true
}

function confirmAssign() {
    if (!assignOrderId.value || !assignDriverId.value) return
    const loadIdx = pendingLoads.value.findIndex(l => l.id === assignOrderId.value)
    if (loadIdx > -1) pendingLoads.value.splice(loadIdx, 1)
    const driver = drivers.value.find(d => d.id === assignDriverId.value)
    if (driver) driver.load = Math.min(100, driver.load + 15)
    assignSuccess.value = true
    setTimeout(() => { showAssignModal.value = false; assignSuccess.value = false; assignOrderId.value = ''; assignDriverId.value = '' }, 1200)
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
    driverChatMessages.value.push({ id: chatMsgId++, from: 'dispatch', text: chatMsg.value })
    const msg = chatMsg.value
    chatMsg.value = ''
    setTimeout(() => {
        driverChatMessages.value.push({ id: chatMsgId++, from: 'driver', text: msg.includes('?') ? 'Yes, copy that. I\'ll check and confirm.' : 'Roger, acknowledged.' })
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

function onDropOnDriver(event, driver) {
    event.preventDefault()
    dragOverDriver.value = null
    if (!draggingLoad.value) return

    // Assign the load to the driver
    const loadIdx = pendingLoads.value.findIndex(l => l.id === draggingLoad.value.id)
    if (loadIdx > -1) {
        pendingLoads.value.splice(loadIdx, 1)
        driver.load = Math.min(100, driver.load + 15)
        dragAssignToast.value = `${draggingLoad.value.id} assigned to ${driver.name}`
        setTimeout(() => { dragAssignToast.value = '' }, 2500)
    }
    draggingLoad.value = null
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
