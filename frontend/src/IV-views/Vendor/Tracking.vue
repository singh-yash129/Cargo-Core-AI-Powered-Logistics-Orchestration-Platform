<template>
    <div class="space-y-6">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
                <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Shipment Tracking</h2>
                <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Live visibility into all your shipments</p>
            </div>
            <div class="flex gap-2">
                <select v-model="statusFilter"
                    class="text-sm bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500">
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="transit">In Transit</option>
                    <option value="delivery">Out for Delivery</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                </select>
            </div>
        </div>

        <!-- Stats Bar -->
        <div class="grid grid-cols-2 lg:grid-cols-5 gap-3">
            <div class="glass-panel p-4 rounded-xl flex items-center gap-3">
                <div class="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center"><span
                        class="material-symbols-outlined text-blue-500">local_shipping</span></div>
                <div>
                    <div class="text-xs text-gray-500 dark:text-gray-400">In Transit</div>
                    <div class="text-xl font-bold text-gray-900 dark:text-white">{{ store.activeShipments.length }}
                    </div>
                </div>
            </div>
            <div class="glass-panel p-4 rounded-xl flex items-center gap-3">
                <div class="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center"><span
                        class="material-symbols-outlined text-yellow-500">pending</span></div>
                <div>
                    <div class="text-xs text-gray-500 dark:text-gray-400">Pending</div>
                    <div class="text-xl font-bold text-gray-900 dark:text-white">{{ store.pendingShipments.length }}
                    </div>
                </div>
            </div>
            <div class="glass-panel p-4 rounded-xl flex items-center gap-3">
                <div class="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center"><span
                        class="material-symbols-outlined text-green-500">check_circle</span></div>
                <div>
                    <div class="text-xs text-gray-500 dark:text-gray-400">Delivered</div>
                    <div class="text-xl font-bold text-gray-900 dark:text-white">{{ store.deliveredShipments.length }}
                    </div>
                </div>
            </div>
            <div class="glass-panel p-4 rounded-xl flex items-center gap-3">
                <div class="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center"><span
                        class="material-symbols-outlined text-purple-500">schedule</span></div>
                <div>
                    <div class="text-xs text-gray-500 dark:text-gray-400">On-Time</div>
                    <div class="text-xl font-bold text-green-500">{{ store.analyticsData.onTime }}%</div>
                </div>
            </div>
            <div class="glass-panel p-4 rounded-xl flex items-center gap-3">
                <div class="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center"><span
                        class="material-symbols-outlined text-orange-500">route</span></div>
                <div>
                    <div class="text-xs text-gray-500 dark:text-gray-400">Avg Transit</div>
                    <div class="text-xl font-bold text-gray-900 dark:text-white">{{ store.analyticsData.avgTransit }}d
                    </div>
                </div>
            </div>
        </div>

        <div class="flex flex-col xl:flex-row gap-6">
            <!-- Shipment List -->
            <div class="w-full xl:w-96 glass-panel rounded-xl overflow-hidden flex flex-col max-h-[70vh]">
                <div class="p-4 border-b border-gray-200 dark:border-white/5">
                    <div class="relative">
                        <span
                            class="material-symbols-outlined absolute left-3 top-2.5 text-gray-400 text-sm">search</span>
                        <input v-model="searchQuery" type="text" placeholder="Search order ID, destination..."
                            class="w-full bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-lg py-2 pl-9 pr-4 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-blue-500/50">
                    </div>
                </div>
                <div class="flex-1 overflow-y-auto p-2 space-y-2">
                    <div v-if="filteredShipments.length === 0"
                        class="p-8 text-center text-gray-500 dark:text-gray-400 text-sm">No shipments found</div>
                    <div v-for="s in filteredShipments" :key="s.id"
                        class="p-3 rounded-lg cursor-pointer transition-all border"
                        :class="selected?.id === s.id ? 'bg-blue-500/10 border-blue-500 dark:bg-blue-500/20' : 'bg-gray-50 dark:bg-white/5 border-transparent hover:bg-gray-100 dark:hover:bg-white/10'"
                        @click="selected = s">
                        <div class="flex justify-between items-start mb-1">
                            <span class="font-bold text-gray-900 dark:text-white text-sm">{{ s.id }}</span>
                            <span class="text-[10px] font-bold px-1.5 py-0.5 rounded"
                                :class="statusClass(s.statusKey)">{{ s.status }}</span>
                        </div>
                        <div class="text-xs text-gray-500 dark:text-gray-400 truncate mb-1">{{ s.route }}</div>
                        <div class="flex items-center justify-between text-[10px] text-gray-500 dark:text-gray-400">
                            <div class="flex items-center gap-1"><span
                                    class="material-symbols-outlined text-[10px]">schedule</span> ETA: {{ s.eta }}</div>
                            <div class="font-bold text-gray-700 dark:text-gray-300">₹{{ s.amount.toLocaleString() }}
                            </div>
                        </div>
                        <div v-if="s.progress > 0 && s.statusKey !== 'delivered' && s.statusKey !== 'cancelled'"
                            class="mt-2 w-full h-1.5 bg-gray-200 dark:bg-white/10 rounded-full">
                            <div class="h-1.5 bg-blue-500 rounded-full transition-all"
                                :style="{ width: s.progress + '%' }"></div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Detail Panel -->
            <div class="flex-1 space-y-6">
                <!-- Global Dashboard when no shipment is selected -->
                <div v-if="!selected" class="space-y-6">
                    <!-- Global Dashboard Tabs -->
                    <div class="flex items-center gap-2 border-b border-gray-200 dark:border-white/10 pb-2">
                        <button @click="globalTab = 'map'"
                            class="px-4 py-2 text-sm font-bold rounded-t-lg transition-colors"
                            :class="globalTab === 'map' ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'">Live
                            Map</button>
                        <button @click="globalTab = 'table'"
                            class="px-4 py-2 text-sm font-bold rounded-t-lg transition-colors"
                            :class="globalTab === 'table' ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'">All
                            Orders</button>
                        <button @click="globalTab = 'graphs'"
                            class="px-4 py-2 text-sm font-bold rounded-t-lg transition-colors"
                            :class="globalTab === 'graphs' ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'">Analytics</button>
                    </div>

                    <!-- Global Map Tab -->
                    <div v-if="globalTab === 'map'" class="glass-panel rounded-xl overflow-hidden relative h-[60vh]">
                        <div
                            class="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-gray-900/50 dark:from-blue-900/30 dark:to-gray-900/70">
                            <div class="absolute inset-0 opacity-10 dark:opacity-20"
                                style="background-image: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0iIzk5OSIvPjwvc3ZnPg=='); background-size: 40px 40px;">
                            </div>
                        </div>

                        <!-- Map all active shipments -->
                        <div v-for="(s, idx) in store.activeShipments" :key="'gmap-' + s.id"
                            class="absolute z-10 cursor-pointer group"
                            :style="{ top: (20 + (idx * 15) % 60) + '%', left: (10 + s.progress * 0.6) + '%', transform: 'translate(-50%, -50%)' }"
                            @click="selected = s">
                            <div class="w-4 h-4 bg-blue-500 rounded-full animate-ping absolute opacity-70"></div>
                            <div
                                class="w-4 h-4 bg-blue-500 rounded-full border-2 border-white relative z-10 shadow-lg group-hover:scale-125 transition-transform">
                            </div>
                            <div
                                class="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-black/80 text-white text-[9px] px-1.5 py-0.5 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                                {{ s.id }} - {{ s.destination }}
                            </div>
                        </div>

                        <!-- Fleet Sidebar Overlay -->
                        <div class="absolute top-4 right-4 bottom-4 w-48 bg-white/80 dark:bg-black/40 backdrop-blur-md rounded-xl border border-gray-200 dark:border-white/10 hidden md:flex flex-col overflow-hidden z-20">
                            <div class="p-3 border-b border-gray-200 dark:border-white/10 flex items-center justify-between">
                                <span class="text-[10px] font-bold text-gray-900 dark:text-white uppercase tracking-wider">Active Fleet</span>
                                <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            </div>
                            <div class="flex-1 overflow-y-auto p-2 no-scrollbar">
                                <div v-for="s in store.activeShipments.slice(0, 5)" :key="'fleet-'+s.id" @click="selected = s" class="p-2 rounded-lg hover:bg-white/50 dark:hover:bg-white/5 cursor-pointer transition-colors mb-1 border border-transparent hover:border-blue-500/20">
                                    <div class="flex justify-between items-start mb-1">
                                        <span class="text-[9px] font-mono font-bold text-blue-500">{{ s.id }}</span>
                                        <span class="text-[8px] px-1 bg-blue-500/10 text-blue-500 rounded">{{ s.progress }}%</span>
                                    </div>
                                    <div class="text-[9px] text-gray-500 truncate">{{ s.destination }}</div>
                                </div>
                            </div>
                            <div class="p-3 bg-blue-500/5 text-center text-[9px] text-gray-500 border-t border-gray-200 dark:border-white/10">
                                {{ store.activeShipments.length }} Total Vehicles
                            </div>
                        </div>
                        
                        <!-- Map Legend / Bottom Bar -->
                        <div
                            class="absolute bottom-4 left-4 right-4 md:right-56 bg-white/90 dark:bg-black/50 backdrop-blur-md p-3 rounded-lg border border-gray-200 dark:border-white/10 flex items-center justify-between pointer-events-auto">
                            <div class="flex items-center gap-4">
                                <div>
                                    <div class="text-[10px] font-bold text-gray-900 dark:text-white">Global Live Tracking</div>
                                    <div class="flex items-center gap-2 text-[9px] text-gray-600 dark:text-gray-300">
                                        <span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-blue-500"></span> In-Transit</span>
                                        <span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-green-500"></span> Origin</span>
                                        <span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-red-500"></span> Destination</span>
                                    </div>
                                </div>
                            </div>
                            <div class="hidden sm:flex items-center gap-3">
                                <div class="px-2 py-1 bg-yellow-500/10 rounded flex items-center gap-1.5">
                                    <span class="material-symbols-outlined text-yellow-500 text-[14px]">warning</span>
                                    <span class="text-[9px] font-bold text-yellow-600 dark:text-yellow-400">2 Alerts</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Global Table Tab -->
                    <div v-if="globalTab === 'table'"
                        class="glass-panel p-4 rounded-xl overflow-x-auto h-[60vh] flex flex-col gap-4">
                        
                        <!-- Quick Stats Bar -->
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-1">
                            <div class="p-3 bg-gray-50 dark:bg-white/5 rounded-lg border border-gray-200 dark:border-white/5">
                                <div class="text-[9px] text-gray-500 uppercase font-bold mb-1">Total Valuation</div>
                                <div class="text-sm font-bold text-gray-900 dark:text-white">₹{{ (store.shipments.reduce((acc, s) => acc + s.amount, 0)).toLocaleString() }}</div>
                            </div>
                            <div class="p-3 bg-blue-500/5 rounded-lg border border-blue-500/10">
                                <div class="text-[9px] text-blue-500 uppercase font-bold mb-1">Active Movement</div>
                                <div class="text-sm font-bold text-blue-600 dark:text-blue-400">{{ store.activeShipments.length }} Shipments</div>
                            </div>
                            <div class="p-3 bg-green-500/5 rounded-lg border border-green-500/10">
                                <div class="text-[9px] text-green-500 uppercase font-bold mb-1">Efficiency</div>
                                <div class="text-sm font-bold text-green-600 dark:text-green-400">94.2% On-Time</div>
                            </div>
                            <div class="p-3 bg-purple-500/5 rounded-lg border border-purple-500/10">
                                <div class="text-[9px] text-purple-500 uppercase font-bold mb-1">Total Weight</div>
                                <div class="text-sm font-bold text-purple-600 dark:text-purple-400">12,450 kg</div>
                            </div>
                        </div>

                        <table class="w-full text-left text-sm min-w-[800px] flex-1">
                            <thead
                                class="text-gray-500 dark:text-gray-400 uppercase text-[10px] border-b border-gray-200 dark:border-white/10 sticky top-0 bg-white dark:bg-card-dark z-10">
                                <tr>
                                    <th class="px-4 py-3">Order ID</th>
                                    <th class="px-4 py-3">Route</th>
                                    <th class="px-4 py-3">Amount</th>
                                    <th class="px-4 py-3">ETA</th>
                                    <th class="px-4 py-3">Status</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-100 dark:divide-white/5">
                                <tr v-for="s in filteredShipments" :key="'tbl-' + s.id"
                                    class="hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer transition-colors"
                                    @click="selected = s">
                                    <td class="px-4 py-3 font-mono text-blue-500 text-xs font-bold">{{ s.id }}</td>
                                    <td class="px-4 py-3">
                                        <div class="text-xs text-gray-900 dark:text-white font-medium">{{ s.origin }}
                                        </div>
                                        <div class="text-[10px] text-gray-500">→ {{ s.destination }}</div>
                                    </td>
                                    <td class="px-4 py-3 text-green-600 dark:text-green-400 font-bold text-xs">₹{{
                                        s.amount.toLocaleString() }}</td>
                                    <td class="px-4 py-3 text-gray-600 dark:text-gray-300 text-xs">{{ s.eta }}</td>
                                    <td class="px-4 py-3"><span class="px-2 py-0.5 rounded text-[10px] font-bold"
                                            :class="statusClass(s.statusKey)">{{ s.status }}</span></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <!-- Global Analytics/Graphs Tab -->
                    <div v-if="globalTab === 'graphs'" class="grid grid-cols-1 md:grid-cols-2 gap-4 h-[60vh]">
                        <div class="glass-panel p-5 rounded-xl h-full flex flex-col bg-blue-50/30 dark:bg-white/5 border border-blue-100/50 dark:border-white/10">
                            <div class="flex items-center justify-between mb-4">
                                <h4 class="text-sm font-bold text-gray-900 dark:text-white">Spend Overview</h4>
                                <span class="text-[10px] font-bold text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded">Last 6 Months</span>
                            </div>
                            
                            <!-- Chart.js Bar Chart for Spend -->
                            <div class="flex-1 w-full h-full mt-2 relative min-h-[200px]">
                                <Bar :data="spendChartData" :options="spendChartOptions" />
                            </div>

                            <!-- Additional Performance KPIs -->
                            <div class="mt-4 pt-4 border-t border-gray-100 dark:border-white/5 grid grid-cols-2 gap-4">
                                <div>
                                    <div class="text-[10px] text-gray-500 uppercase font-bold mb-1">Transit Efficiency</div>
                                    <div class="flex items-center gap-2">
                                        <div class="text-xl font-bold text-gray-900 dark:text-white">{{ store.analyticsData.onTime }}%</div>
                                        <span class="text-[10px] text-green-500 font-bold flex items-center"><span class="material-symbols-outlined text-[12px]">trending_up</span>+1.2%</span>
                                    </div>
                                    <div class="text-[8px] text-gray-400">vs Last Month</div>
                                </div>
                                <div class="flex flex-col justify-end">
                                    <div class="text-[10px] text-gray-500 uppercase font-bold mb-1">Success Rate</div>
                                    <div class="flex items-center gap-2">
                                        <div class="text-xl font-bold text-gray-900 dark:text-white">{{ store.analyticsData.successRate }}%</div>
                                    </div>
                                    <div class="flex items-center mt-1 gap-0.5">
                                        <div v-for="i in 5" :key="'spark-'+i" class="w-2 rounded-full bg-blue-500/30" :style="{ height: (8 + i * 3) + 'px' }"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="glass-panel p-5 rounded-xl flex flex-col justify-between h-full bg-gradient-to-br from-transparent to-blue-500/5">
                            <div class="flex items-center justify-between mb-2">
                                <h4 class="text-sm font-bold text-gray-900 dark:text-white">Volume Overview</h4>
                                <div class="flex items-center gap-2">
                                    <div class="w-2 h-2 rounded-full bg-blue-500"></div>
                                    <span class="text-[10px] text-gray-500 font-bold">Daily Orders</span>
                                </div>
                            </div>
                            <div class="flex-1 w-full h-full mt-2 relative min-h-[150px] mb-4">
                                <Line :data="volumeChartData" :options="volumeChartOptions" />
                            </div>
                            
                            <!-- Top Routes List -->
                            <div class="space-y-2 mt-2">
                                <div class="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">High Volume Routes</div>
                                <div class="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                                    <div class="flex items-center gap-2 leading-tight">
                                        <div class="w-6 h-6 rounded bg-blue-500/10 flex items-center justify-center text-blue-500 font-bold text-[10px]">01</div>
                                        <div>
                                            <div class="text-[10px] font-bold text-gray-900 dark:text-white">Mumbai → Chicago</div>
                                            <div class="text-[8px] text-gray-500">12 Weekly Trips</div>
                                        </div>
                                    </div>
                                    <div class="text-right">
                                        <div class="text-[10px] font-bold text-green-500">98% Ontime</div>
                                    </div>
                                </div>
                                 <div class="flex items-center justify-between p-2 rounded-lg bg-gray-100/50 dark:bg-white/5 border border-gray-200 dark:border-white/5">
                                    <div class="flex items-center gap-2 leading-tight">
                                        <div class="w-6 h-6 rounded bg-blue-500/10 flex items-center justify-center text-blue-500 font-bold text-[10px]">02</div>
                                        <div>
                                            <div class="text-[10px] font-bold text-gray-900 dark:text-white">Delhi → London</div>
                                            <div class="text-[8px] text-gray-500">8 Weekly Trips</div>
                                        </div>
                                    </div>
                                    <div class="text-right">
                                        <div class="text-[10px] font-bold text-green-500">96.5% Ontime</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            <template v-else>
                    <!-- Back Button to Global View -->
                    <button @click="selected = null"
                        class="mb-4 flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors bg-blue-50 dark:bg-blue-500/10 px-3 py-1.5 rounded-lg w-fit mt-2">
                        <span class="material-symbols-outlined text-[16px]">arrow_back</span> Back to Global View
                    </button>
                    <!-- Map Placeholder -->
                    <div class="glass-panel rounded-xl overflow-hidden relative h-64">
                        <div
                            class="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-gray-900/50 dark:from-blue-900/30 dark:to-gray-900/70">
                            <div class="absolute inset-0 opacity-10 dark:opacity-20"
                                style="background-image: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0iIzk5OSIvPjwvc3ZnPg=='); background-size: 40px 40px;">
                            </div>
                        </div>
                        <!-- Origin marker -->
                        <div class="absolute top-1/2 left-[15%] transform -translate-x-1/2 -translate-y-1/2 z-10">
                            <div class="w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-lg"></div>
                            <div class="mt-1 bg-black/80 text-white text-[9px] px-1.5 py-0.5 rounded whitespace-nowrap">
                                {{ selected.origin }}</div>
                        </div>
                        <!-- Route line -->
                        <div
                            class="absolute top-1/2 left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-green-500 via-blue-500 to-red-500 transform -translate-y-1/2 z-0">
                        </div>
                        <!-- Driver marker (if in transit) -->
                        <div v-if="selected.driver && selected.statusKey !== 'delivered' && selected.statusKey !== 'cancelled'"
                            class="absolute z-10"
                            :style="{ top: '50%', left: (15 + selected.progress * 0.7) + '%', transform: 'translate(-50%, -50%)' }">
                            <div class="w-4 h-4 bg-blue-500 rounded-full animate-ping absolute"></div>
                            <div class="w-4 h-4 bg-blue-500 rounded-full border-2 border-white relative z-10 shadow-lg">
                            </div>
                            <div class="mt-1 bg-black/80 text-white text-[9px] px-1.5 py-0.5 rounded whitespace-nowrap">
                                {{ selected.vehicle || 'Driver' }}</div>
                        </div>
                        <!-- Destination marker -->
                        <div class="absolute top-1/2 right-[15%] transform translate-x-1/2 -translate-y-1/2 z-10">
                            <div class="w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-lg"></div>
                            <div class="mt-1 bg-black/80 text-white text-[9px] px-1.5 py-0.5 rounded whitespace-nowrap">
                                {{ selected.destination }}</div>
                        </div>
                        <!-- Geofence badge -->
                        <div v-if="selected.progress >= 80 && selected.statusKey !== 'delivered'"
                            class="absolute top-3 right-3 z-20 bg-green-500/90 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 animate-pulse">
                            <span class="material-symbols-outlined text-sm">my_location</span>
                            Arriving Soon — {{ Math.max(5, Math.round((100 - selected.progress) * 1.5)) }} min away
                        </div>
                    </div>

                    <!-- Shipment Detail -->
                    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 ">
                        <!-- Info Cards -->
                        <div class="lg:col-span-2 space-y-4">
                            <div class="glass-panel p-5 rounded-xl">
                                <div class="flex items-center justify-between mb-4">
                                    <h3 class="font-bold text-gray-900 dark:text-white text-lg">{{ selected.id }}</h3>
                                    <span class="px-3 py-1.5 rounded-md text-xs font-bold shadow-sm"
                                        :class="statusClass(selected.statusKey)">{{ selected.status }}</span>
                                </div>
                                <div class="grid grid-cols-2 lg:grid-cols-5 gap-4">
                                    <div class="p-3 bg-gray-50 dark:bg-white/5 rounded-lg col-span-2 lg:col-span-3 border border-gray-100 dark:border-white/5 relative overflow-hidden">
                                        <div class="absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-blue-500/10 to-transparent pointer-events-none"></div>
                                        <div class="text-[10px] text-gray-500 uppercase mb-1 font-bold">Route</div>
                                        <div class="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                            <span class="truncate">{{ selected.route }}</span>
                                        </div>
                                    </div>
                                    <div class="p-3 bg-gray-50 dark:bg-white/5 rounded-lg col-span-2 lg:col-span-2 border border-gray-100 dark:border-white/5">
                                        <div class="text-[10px] text-gray-500 uppercase mb-1 font-bold">ETA</div>
                                        <div class="text-sm font-bold text-blue-600 dark:text-blue-400">{{ selected.eta }}</div>
                                    </div>
                                    
                                    <div class="p-3 bg-gray-50 dark:bg-white/5 rounded-lg border border-gray-100 dark:border-white/5">
                                        <div class="text-[10px] text-gray-500 uppercase mb-1">Category</div>
                                        <div class="text-xs font-bold text-gray-900 dark:text-white">{{ selected.category }}</div>
                                    </div>
                                    <div class="p-3 bg-gray-50 dark:bg-white/5 rounded-lg border border-gray-100 dark:border-white/5 hover:border-green-500/30 transition-colors">
                                        <div class="text-[10px] text-gray-500 uppercase mb-1">Amount</div>
                                        <div class="text-sm font-bold text-green-500">₹{{ selected.amount.toLocaleString() }}</div>
                                    </div>
                                    <div class="p-3 bg-gray-50 dark:bg-white/5 rounded-lg border border-gray-100 dark:border-white/5">
                                        <div class="text-[10px] text-gray-500 uppercase mb-1">Weight</div>
                                        <div class="text-xs font-bold text-gray-900 dark:text-white">{{ selected.weight.toLocaleString() }} kg</div>
                                    </div>
                                    <div class="p-3 bg-gray-50 dark:bg-white/5 rounded-lg border border-gray-100 dark:border-white/5">
                                        <div class="text-[10px] text-gray-500 uppercase mb-1">Pallets</div>
                                        <div class="text-xs font-bold text-gray-900 dark:text-white">{{ selected.pallets }}</div>
                                    </div>
                                    <div class="p-3 bg-gray-50 dark:bg-white/5 rounded-lg border border-gray-100 dark:border-white/5">
                                        <div class="text-[10px] text-gray-500 uppercase mb-1">Payment</div>
                                        <div class="text-xs font-bold text-gray-900 dark:text-white">{{ selected.paymentMode }}</div>
                                    </div>
                                    <div class="p-3 bg-blue-50/50 dark:bg-blue-500/10 rounded-lg col-span-2 lg:col-span-5 border border-blue-100 dark:border-blue-500/20 mt-2 block w-full">
                                        <div class="flex items-center justify-between mb-2">
                                            <div class="text-[10px] text-blue-600 dark:text-blue-400 uppercase font-bold">Trip Progress</div>
                                            <div class="text-xs font-bold text-blue-700 dark:text-blue-400">{{ selected.progress }}%</div>
                                        </div>
                                        <div class="w-full h-2 bg-blue-200/50 dark:bg-blue-900/40 rounded-full overflow-hidden">
                                            <div class="h-full bg-blue-500 rounded-full transition-all duration-500 ease-out"
                                                :style="{ width: selected.progress + '%' }"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Driver Info -->
                            <div v-if="selected.driver" class="glass-panel p-5 rounded-xl">
                                <h4 class="font-bold text-gray-900 dark:text-white text-sm mb-3">Driver Information</h4>
                                <div class="flex items-center gap-4">
                                    <div class="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                                        <span class="material-symbols-outlined text-blue-500">person</span>
                                    </div>
                                    <div class="flex-1">
                                        <div class="font-medium text-gray-900 dark:text-white text-sm">{{
                                            selected.driver }}</div>
                                        <div class="text-xs text-gray-500 dark:text-gray-400">{{ selected.vehicle }} ·
                                            {{ selected.driverPhone }}</div>
                                    </div>
                                    <div class="flex gap-2">
                                        <button @click="showCallModal = true"
                                            class="p-2 bg-gray-100 dark:bg-white/5 hover:bg-blue-500/10 rounded-lg text-gray-600 dark:text-gray-400 hover:text-blue-500 transition-colors tooltip-trigger relative group">
                                            <span class="material-symbols-outlined text-[18px]">call</span>
                                            <div class="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-30 font-bold pointer-events-none">Call Driver</div>
                                        </button>
                                        <button @click="showChatModal = true"
                                            class="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-colors tooltip-trigger relative group">
                                            <span class="material-symbols-outlined text-[18px]">chat</span>
                                            <div class="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-30 font-bold pointer-events-none">Message Driver</div>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <!-- Actions -->
                            <div v-if="selected.statusKey !== 'delivered' && selected.statusKey !== 'cancelled'"
                                class="glass-panel p-5 rounded-xl">
                                <h4 class="font-bold text-gray-900 dark:text-white text-sm mb-3">Quick Actions</h4>
                                <div class="flex flex-wrap gap-3">
                                    <button @click="showAddressModal = true"
                                        class="px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                                        <span class="material-symbols-outlined text-[16px]">edit_location</span> Update
                                        Address
                                    </button>
                                    <button @click="showRescheduleModal = true"
                                        class="px-4 py-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                                        <span class="material-symbols-outlined text-[16px]">event</span> Reschedule
                                    </button>
                                    <button @click="showDamageModal = true"
                                        class="px-4 py-2 bg-orange-500/10 hover:bg-orange-500/20 text-orange-600 dark:text-orange-400 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                                        <span class="material-symbols-outlined text-[16px]">report_problem</span> Report
                                        Issue
                                    </button>
                                    <button @click="handleCancel"
                                        class="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                                        <span class="material-symbols-outlined text-[16px]">cancel</span> Cancel
                                    </button>
                                </div>
                            </div>

                            <!-- PoD (if delivered) -->
                            <div v-if="selected.pod && selected.pod.confirmed" class="glass-panel p-5 rounded-xl">
                                <h4
                                    class="font-bold text-gray-900 dark:text-white text-sm mb-3 flex items-center gap-2">
                                    <span class="material-symbols-outlined text-green-500 text-[18px]">verified</span>
                                    Proof of Delivery
                                </h4>
                                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div class="rounded-lg overflow-hidden border border-gray-200 dark:border-white/10">
                                        <img :src="selected.pod.photo" alt="Delivery proof"
                                            class="w-full h-40 object-cover">
                                    </div>
                                    <div class="space-y-3">
                                        <div class="p-3 bg-gray-50 dark:bg-white/5 rounded-lg">
                                            <div class="text-[10px] text-gray-500 uppercase mb-1">Timestamp</div>
                                            <div class="text-xs font-medium text-gray-900 dark:text-white">{{
                                                selected.pod.timestamp }}</div>
                                        </div>
                                        <div class="p-3 bg-gray-50 dark:bg-white/5 rounded-lg">
                                            <div class="text-[10px] text-gray-500 uppercase mb-1">Location</div>
                                            <div class="text-xs font-medium text-gray-900 dark:text-white">{{
                                                selected.pod.location }}</div>
                                        </div>
                                        <div
                                            class="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg flex items-center gap-2">
                                            <span
                                                class="material-symbols-outlined text-green-500 text-sm">check_circle</span>
                                            <span class="text-xs font-bold text-green-600 dark:text-green-400">Delivery
                                                Confirmed</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Right Column: Tabs & Content -->
                        <div class="space-y-4">
                            <!-- Internal Detail Tabs -->
                            <div class="flex items-center gap-1 border-b border-gray-200 dark:border-white/10 pb-2">
                                <button @click="detailTab = 'overview'"
                                    :class="detailTab === 'overview' ? 'bg-blue-50 text-blue-600 dark:bg-white/10 dark:text-white font-bold' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5'"
                                    class="px-4 py-2 rounded-lg text-sm transition-colors tracking-wide">
                                    Overview
                                </button>
                                <button @click="detailTab = 'tracking-log'"
                                    :class="detailTab === 'tracking-log' ? 'bg-blue-50 text-blue-600 dark:bg-white/10 dark:text-white font-bold' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5'"
                                    class="px-4 py-2 rounded-lg text-sm transition-colors tracking-wide relative">
                                    Tracking Log
                                    <span class="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                                </button>
                            </div>

                            <!-- Overview Tab Content -->
                            <div v-if="detailTab === 'overview'" class="space-y-4 animate-fade-in">
                                <!-- Status Timeline -->
                                <div class="glass-panel p-5 rounded-xl">
                                <h4 class="font-bold text-gray-900 dark:text-white text-sm mb-4">Status Timeline</h4>
                                <div class="space-y-4">
                                    <div v-for="(step, idx) in (selected.statusHistory || [])" :key="idx"
                                        class="flex gap-3">
                                        <div class="flex flex-col items-center">
                                            <div class="w-3 h-3 rounded-full flex-shrink-0"
                                                :class="idx === selected.statusHistory.length - 1 ? 'bg-blue-500 ring-4 ring-blue-500/20' : 'bg-green-500'">
                                            </div>
                                            <div v-if="idx < selected.statusHistory.length - 1"
                                                class="w-0.5 flex-1 bg-gray-200 dark:bg-white/10 mt-1"></div>
                                        </div>
                                        <div class="pb-4">
                                            <div class="text-sm font-medium text-gray-900 dark:text-white">{{ step.status }}
                                            </div>
                                            <div class="text-[10px] text-gray-500 dark:text-gray-400">{{ step.time }}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Document Center -->
                            <div class="glass-panel p-5 rounded-xl">
                                <h4 class="font-bold text-gray-900 dark:text-white text-sm mb-3">Document Center</h4>
                                <div class="space-y-2">
                                    <div class="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 hover:border-blue-500/30 cursor-pointer transition-all">
                                        <div class="flex items-center gap-2">
                                            <span class="material-symbols-outlined text-red-500 text-lg">picture_as_pdf</span>
                                            <span class="text-xs text-gray-700 dark:text-gray-300">Commercial Invoice</span>
                                        </div>
                                        <span class="material-symbols-outlined text-gray-400 text-sm">download</span>
                                    </div>
                                    <div class="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 hover:border-blue-500/30 cursor-pointer transition-all">
                                        <div class="flex items-center gap-2">
                                            <span class="material-symbols-outlined text-blue-500 text-lg">description</span>
                                            <span class="text-xs text-gray-700 dark:text-gray-300">Bill of Lading</span>
                                        </div>
                                        <span class="material-symbols-outlined text-gray-400 text-sm">download</span>
                                    </div>
                                </div>
                            </div>

                            <!-- Live Support Proxy -->
                            <div @click="showSupportModal = true" @mouseenter="showToast('Need Help? Click to chat with support')" class="p-4 rounded-xl bg-blue-600 text-white relative overflow-hidden group cursor-pointer">
                                <div class="absolute -right-4 -top-4 w-20 h-20 bg-white/10 rounded-full group-hover:scale-150 transition-transform"></div>
                                <div class="relative z-10 flex items-center gap-3">
                                    <div class="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                                        <span class="material-symbols-outlined">support_agent</span>
                                    </div>
                                    <div>
                                        <div class="text-xs font-bold">Need Help?</div>
                                        <div class="text-[10px] opacity-80">Chat with Support</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Tracking Log Tab Content -->
                        <div v-else-if="detailTab === 'tracking-log'" class="space-y-4 animate-fade-in h-[500px] flex flex-col">
                            <div class="glass-panel p-5 rounded-xl flex-1 flex flex-col overflow-hidden relative">
                                <div class="flex items-center justify-between mb-4 pb-4 border-b border-gray-100 dark:border-white/5 shrink-0">
                                    <h4 class="font-bold text-gray-900 dark:text-white text-base">Transit Log</h4>
                                    <button class="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors">
                                        <span class="material-symbols-outlined text-[14px]">download</span> Export
                                    </button>
                                </div>
                                
                                <div class="flex-1 overflow-y-auto pr-2 space-y-6 custom-scrollbar relative pl-4">
                                    <div class="absolute left-6 top-2 bottom-4 w-px bg-gray-200 dark:bg-white/10 -z-10"></div>
                                    <div v-for="(log, idx) in trackingLogs" :key="'log-'+idx"
                                        class="relative flex gap-4 w-full group">
                                        
                                        <!-- Node Icon -->
                                        <div class="flex flex-col items-center shrink-0 w-5 relative pt-1">
                                            <div class="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 z-10 transition-colors"
                                                :class="idx === 0 ? 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)] ring-4 ring-blue-500/20' : 'bg-gray-300 dark:bg-gray-600 group-hover:bg-blue-400'">
                                                <div v-if="idx === 0" class="w-1.5 h-1.5 rounded-full bg-white"></div>
                                            </div>
                                        </div>
                                        
                                        <!-- Content -->
                                        <div class="flex-1 pb-2">
                                            <div class="flex items-start justify-between">
                                                <div>
                                                    <div class="text-sm font-bold" :class="idx === 0 ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'">
                                                        {{ log.action }}
                                                    </div>
                                                    <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">{{ log.location }}</div>
                                                    <div v-if="log.note" class="mt-2 text-[11px] text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-white/5 p-2 rounded border border-gray-100 dark:border-white/5">
                                                        {{ log.note }}
                                                    </div>
                                                </div>
                                                <div class="text-right shrink-0 ml-4">
                                                    <div class="text-[10px] font-bold text-gray-900 dark:text-white">{{ log.date }}</div>
                                                    <div class="text-[10px] text-gray-500">{{ log.time }}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        </div>
                    </div>
                </template>
            </div>
    
        <!-- Address Update Modal -->
        <Teleport to="body">
            <BaseModal :isOpen="showAddressModal" @close="showAddressModal = false">
                <template #title>Update Delivery Address</template>
                <div class="space-y-4">
                    <div>
                        <label class="block text-xs text-gray-500 dark:text-gray-400 mb-1.5">Current Address</label>
                        <div class="p-3 bg-gray-50 dark:bg-white/5 rounded-lg text-sm text-gray-600 dark:text-gray-300">
                            {{
                                selected?.destination }}</div>
                    </div>
                    <div>
                        <label class="block text-xs text-gray-500 dark:text-gray-400 mb-1.5">New Address *</label>
                        <input v-model="newAddress" type="text" placeholder="Enter new delivery address"
                            class="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg p-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-blue-500">
                    </div>
                </div>
                <template #footer>
                    <button @click="showAddressModal = false" class="px-4 py-2 text-gray-500 text-sm">Cancel</button>
                    <button @click="updateAddress" :disabled="!newAddress.trim()"
                        class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">Update
                        Address</button>
                </template>
            </BaseModal>
        </Teleport>

        <!-- Reschedule Modal -->
        <Teleport to="body">
            <BaseModal :isOpen="showRescheduleModal" @close="showRescheduleModal = false">
                <template #title>Reschedule Delivery</template>
                <div class="space-y-4">
                    <div>
                        <label class="block text-xs text-gray-500 dark:text-gray-400 mb-1.5">Current ETA</label>
                        <div class="p-3 bg-gray-50 dark:bg-white/5 rounded-lg text-sm text-gray-600 dark:text-gray-300">
                            {{
                                selected?.eta }}</div>
                    </div>
                    <div>
                        <label class="block text-xs text-gray-500 dark:text-gray-400 mb-1.5">New Delivery Date *</label>
                        <input v-model="newDate" type="date"
                            class="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg p-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-blue-500">
                    </div>
                    <div>
                        <label class="block text-xs text-gray-500 dark:text-gray-400 mb-1.5">Reason</label>
                        <textarea v-model="rescheduleReason" rows="2" placeholder="Optional reason"
                            class="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg p-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 resize-none"></textarea>
                    </div>
                </div>
                <template #footer>
                    <button @click="showRescheduleModal = false" class="px-4 py-2 text-gray-500 text-sm">Cancel</button>
                    <button @click="reschedule" :disabled="!newDate"
                        class="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-bold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">Reschedule</button>
                </template>
            </BaseModal>
        </Teleport>

        <!-- Damage Report Modal -->
        <Teleport to="body">
            <BaseModal :isOpen="showDamageModal" @close="showDamageModal = false">
                <template #title>Report Damage / Issue</template>
                <div class="space-y-4">
                    <div>
                        <label class="block text-xs text-gray-500 dark:text-gray-400 mb-1.5">Severity *</label>
                        <div class="flex gap-3">
                            <label v-for="sev in ['Low', 'Medium', 'High']" :key="sev"
                                class="flex-1 text-center px-3 py-2 rounded-lg border cursor-pointer text-sm font-medium transition-colors"
                                :class="damageForm.severity === sev ? severityClass(sev) : 'border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400'">
                                <input type="radio" :value="sev" v-model="damageForm.severity" class="sr-only">{{ sev }}
                            </label>
                        </div>
                    </div>
                    <div>
                        <label class="block text-xs text-gray-500 dark:text-gray-400 mb-1.5">Description *</label>
                        <textarea v-model="damageForm.description" rows="3"
                            placeholder="Describe the damage or issue..."
                            class="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg p-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 resize-none"></textarea>
                    </div>
                    <div>
                        <label class="block text-xs text-gray-500 dark:text-gray-400 mb-1.5">Upload Evidence</label>
                        <div
                            class="border-2 border-dashed border-gray-300 dark:border-white/20 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 transition-colors">
                            <span class="material-symbols-outlined text-3xl text-gray-400 mb-2">cloud_upload</span>
                            <div class="text-xs text-gray-500">Click to upload photos</div>
                        </div>
                    </div>
                </div>
                <template #footer>
                    <button @click="showDamageModal = false" class="px-4 py-2 text-gray-500 text-sm">Cancel</button>
                    <button @click="submitDamage" :disabled="!damageForm.description.trim()"
                        class="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-bold hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">Submit
                        Report</button>
                </template>
            </BaseModal>
        </Teleport>
        <!-- Support Modal -->
        <Teleport to="body">
            <BaseModal :isOpen="showSupportModal" @close="showSupportModal = false">
                <template #title>Contact Support</template>
                <div class="space-y-4">
                    <p class="text-sm text-gray-600 dark:text-gray-300">Our team is available 24/7 to help you with shipment <span class="font-bold">{{ selected?.id }}</span>.</p>
                    <div>
                        <label class="block text-xs text-gray-500 dark:text-gray-400 mb-1.5">How can we help?</label>
                        <textarea v-model="supportMessage" rows="4" placeholder="Describe the issue you're facing..."
                            class="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg p-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 resize-none"></textarea>
                    </div>
                </div>
                <template #footer>
                    <button @click="showSupportModal = false" class="px-4 py-2 text-gray-500 text-sm">Cancel</button>
                    <button @click="submitSupport" :disabled="!supportMessage.trim()"
                        class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                        Send Message</button>
                </template>
            </BaseModal>
        </Teleport>

        <!-- Driver Call Modal -->
        <Teleport to="body">
            <BaseModal :isOpen="showCallModal" @close="showCallModal = false">
                <template #title>Contact Driver</template>
                <div class="flex flex-col items-center justify-center p-6 space-y-4">
                    <div class="w-20 h-20 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500 shadow-inner">
                        <span class="material-symbols-outlined text-4xl">person</span>
                    </div>
                    <div class="text-center">
                        <h3 class="text-lg font-bold text-gray-900 dark:text-white">{{ selected?.driver || 'Driver Name' }}</h3>
                        <p class="text-sm text-gray-500">{{ selected?.vehicle || 'Vehicle Number' }}</p>
                    </div>
                    <div class="w-full bg-gray-50 dark:bg-black/20 rounded-lg border border-gray-200 dark:border-white/10 p-4 text-center mt-4">
                        <div class="text-xs text-gray-500 uppercase font-bold mb-1">Direct Line</div>
                        <div class="text-2xl font-bold text-gray-900 dark:text-white tracking-wider flex items-center justify-center gap-2">
                            <span class="material-symbols-outlined text-green-500">phone_iphone</span>
                            {{ selected?.driverPhone || '+1 (555) 000-0000' }}
                        </div>
                    </div>
                </div>
                <template #footer>
                    <button @click="showCallModal = false" class="px-4 py-2 text-gray-500 text-sm">Close</button>
                    <a :href="`tel:${selected?.driverPhone?.replace(/\s+/g, '')}`"
                        class="px-8 py-2 bg-green-500 text-white rounded-lg text-sm font-bold hover:bg-green-600 transition-colors flex items-center gap-2">
                        <span class="material-symbols-outlined text-[18px]">call</span> Call Now
                    </a>
                </template>
            </BaseModal>
        </Teleport>

        <!-- Driver Chat Modal -->
        <Teleport to="body">
            <BaseModal :isOpen="showChatModal" @close="showChatModal = false">
                <template #title>
                    <div class="flex items-center gap-2">
                        <div class="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500">
                           <span class="material-symbols-outlined text-xs">person</span>
                        </div>
                        Chat with {{ selected?.driver?.split(' ')[0] || 'Driver' }}
                    </div>
                </template>
                
                <div class="flex flex-col h-[400px] -mx-6 -mt-4 -mb-6 bg-gray-50 dark:bg-black/20">
                    <!-- Chat Messages Area -->
                    <div class="flex-1 overflow-y-auto p-4 space-y-4">
                        <!-- System Message -->
                        <div class="flex justify-center">
                            <span class="text-[10px] font-bold text-gray-400 bg-gray-200 dark:bg-white/5 px-3 py-1 rounded-full">
                                Shipment {{ selected?.id }} Dispatch Chat Start
                            </span>
                        </div>
                        
                        <!-- Mock Driver Message -->
                        <div class="flex items-end gap-2">
                            <div class="w-8 h-8 rounded-full bg-blue-500/20 flex-shrink-0 flex items-center justify-center text-blue-500">
                                <span class="material-symbols-outlined text-sm">person</span>
                            </div>
                            <div class="bg-white dark:bg-card-dark border border-gray-100 dark:border-white/5 rounded-2xl rounded-bl-sm p-3 max-w-[80%] shadow-sm">
                                <p class="text-sm text-gray-800 dark:text-gray-200">Hi, I have picked up the shipment and am en route. Traffic is light so I should arrive close to the ETA.</p>
                                <div class="text-[9px] text-gray-400 mt-1 text-right">10:45 AM</div>
                            </div>
                        </div>

                        <!-- User Messages -->
                        <div v-for="(msg, idx) in chatMessages" :key="idx" class="flex justify-end items-end gap-2">
                            <div class="bg-blue-600 rounded-2xl rounded-br-sm p-3 max-w-[80%] shadow-sm text-white">
                                <p class="text-sm">{{ msg.text }}</p>
                                <div class="text-[9px] text-blue-200 mt-1 flex justify-end items-center gap-1">
                                    {{ msg.time }}
                                    <span class="material-symbols-outlined text-[10px]">done_all</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Input Area -->
                    <div class="p-3 bg-white dark:bg-card-dark border-t border-gray-200 dark:border-white/10">
                        <form @submit.prevent="sendChatMessage" class="flex items-center gap-2 relative">
                            <input type="file" ref="fileInput" class="hidden" @change="handleFileUpload" accept="image/*,.pdf,.doc,.docx" />
                            <button type="button" @click="$refs.fileInput.click()" class="p-2 text-gray-400 hover:text-blue-500 transition-colors tooltip-trigger relative group">
                                <span class="material-symbols-outlined text-[20px]">attach_file</span>
                                <div class="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-30 font-bold pointer-events-none">Attach File</div>
                            </button>
                            <input v-model="newChatMessage" type="text" placeholder="Type your message..." 
                                class="flex-1 bg-gray-100 dark:bg-black/20 border border-transparent rounded-full px-4 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:bg-white dark:focus:bg-card-dark focus:border-blue-500 transition-all">
                            <button type="submit" :disabled="!newChatMessage.trim()"
                                class="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                <span class="material-symbols-outlined text-[18px]">send</span>
                            </button>
                        </form>
                    </div>
                </div>
                
                <template #footer>
                    <!-- Replacing default footer to ensure clean edge with the chat input box -->
                    <span class="hidden"></span>
                </template>
            </BaseModal>
        </Teleport>

    </div>
</div>
</template>

<script setup>
import { ref, computed, reactive, watch } from 'vue'
import { useVendorStore } from '@/stores/vendorStore'
import BaseModal from '@/components/BaseModal.vue'

// Chart.js Imports
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { Bar, Line } from 'vue-chartjs'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

const store = useVendorStore()
const selected = ref(null)
const searchQuery = ref('')
const statusFilter = ref('all')

// Modals
const showAddressModal = ref(false)
const showRescheduleModal = ref(false)
const showDamageModal = ref(false)
const showSupportModal = ref(false)
const showCallModal = ref(false)
const showChatModal = ref(false)
const newAddress = ref('')
const newDate = ref('')
const rescheduleReason = ref('')
const supportMessage = ref('')
const newChatMessage = ref('')
const chatMessages = ref([])
const fileInput = ref(null)
const damageForm = reactive({ severity: 'Medium', description: '' })
const globalTab = ref('map')
const detailTab = ref('overview')

// Mock Tracking Logs
const trackingLogs = computed(() => {
    if (!selected.value) return []
    // Generate dynamic logs based on the selected order's status history
    const logs = []
    const dates = ['Today', 'Yesterday', '2 Days Ago', '3 Days Ago']
    
    // Add a current active location log
    logs.push({
        action: 'In Transit - En Route',
        location: `Moving towards ${selected.value.destination}`,
        date: dates[0],
        time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
        note: `Current speed: 55 mph. ETA remains ${selected.value.eta}.`
    })

    if (selected.value.statusHistory) {
        selected.value.statusHistory.slice().reverse().forEach((step, idx) => {
            logs.push({
                action: step.status,
                location: idx === selected.value.statusHistory.length - 1 ? selected.value.origin : `Hub Facility #${100 + idx}`,
                date: dates[Math.min(idx, dates.length - 1)],
                time: step.time,
                note: idx === 1 ? 'Driver stopped for mandatory rest period. Journey to resume shortly.' : null
            })
        })
    }
    return logs
})

// Driver actions
function sendChatMessage() {
    if (!newChatMessage.value.trim()) return
    chatMessages.value.push({
        text: newChatMessage.value,
        time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    })
    newChatMessage.value = ''
    
    // Auto reply mock
    setTimeout(() => {
        showToast('Driver received your message')
    }, 1500)
}

function handleFileUpload(event) {
    const file = event.target.files[0]
    if (!file) return
    
    // Create a mock chat message with the file
    chatMessages.value.push({
        text: `📎 Attached: ${file.name}`,
        time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    })
    
    // Reset file input
    event.target.value = ''
    showToast('File attached successfully')
}

function submitSupport() {
    if (!selected.value || !supportMessage.value.trim()) return
    store.addTicket({
        subject: `Support needed for ${selected.value.id}`,
        description: supportMessage.value,
        orderId: selected.value.id,
        priority: 'Medium'
    })
    showSupportModal.value = false
    supportMessage.value = ''
    showToast('Support ticket created successfully')
}

// Analytics Charts (Chart.js)
const primaryColor = '#3b82f6' // blue-500

const spendChartData = computed(() => {
  const months = store.analyticsData.monthly.map(m => m.month)
  const spends = store.analyticsData.monthly.map(m => m.spend)
  return {
    labels: months,
    datasets: [{
      label: 'Monthly Spend (₹)',
      data: spends,
      backgroundColor: primaryColor + '40', // 25% opacity
      borderColor: primaryColor,
      borderWidth: 2,
      borderRadius: 4,
      hoverBackgroundColor: primaryColor + '80'
    }]
  }
})

const spendChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#1f2937',
      padding: 10,
      cornerRadius: 4,
      displayColors: false,
      callbacks: {
        label: (context) => `₹${context.raw.toLocaleString()}`
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: { color: 'rgba(156, 163, 175, 0.1)' },
      ticks: {
        callback: (value) => '₹' + (value / 1000) + 'k',
        font: { size: 10 }
      }
    },
    x: {
      grid: { display: false },
      ticks: { font: { size: 10 } }
    }
  }
}

const volumeChartData = computed(() => {
  return {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
        label: 'Daily Orders',
        data: [12, 18, 9, 24, 27, 6, 3],
        borderColor: primaryColor,
        backgroundColor: primaryColor + '20',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#ffffff',
        pointBorderColor: primaryColor,
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6
    }]
  }
})

const volumeChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { display: false },
        tooltip: {
            backgroundColor: '#1f2937',
            padding: 10,
            displayColors: false
        }
    },
    scales: {
        y: {
            beginAtZero: true,
            grid: { color: 'rgba(156, 163, 175, 0.1)' },
            ticks: { font: { size: 10 } }
        },
        x: {
            grid: { display: false },
            ticks: { font: { size: 10 } }
        }
    }
}

const filteredShipments = computed(() => {
    let list = store.shipments
    if (statusFilter.value !== 'all') list = list.filter(s => s.statusKey === statusFilter.value)
    if (searchQuery.value.trim()) {
        const q = searchQuery.value.toLowerCase()
        list = list.filter(s => s.id.toLowerCase().includes(q) || s.destination.toLowerCase().includes(q) || s.route.toLowerCase().includes(q))
    }
    return list
})

const statusClass = k => ({
    pending: 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400',
    transit: 'bg-blue-500/20 text-blue-600 dark:text-blue-400',
    delivery: 'bg-purple-500/20 text-purple-600 dark:text-purple-400',
    delivered: 'bg-green-500/20 text-green-600 dark:text-green-400',
    cancelled: 'bg-red-500/20 text-red-600 dark:text-red-400',
}[k] || 'bg-gray-500/20 text-gray-500')

const severityClass = sev => ({
    Low: 'border-yellow-500 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
    Medium: 'border-orange-500 bg-orange-500/10 text-orange-600 dark:text-orange-400',
    High: 'border-red-500 bg-red-500/10 text-red-600 dark:text-red-400',
}[sev])

function updateAddress() {
    if (!selected.value || !newAddress.value.trim()) return
    store.updateShipmentAddress(selected.value.id, newAddress.value.trim())
    showAddressModal.value = false
    newAddress.value = ''
    showToast('Address updated successfully')
}

function reschedule() {
    if (!selected.value || !newDate.value) return
    const formatted = new Date(newDate.value).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
    store.rescheduleShipment(selected.value.id, formatted)
    showRescheduleModal.value = false
    newDate.value = ''
    rescheduleReason.value = ''
    showToast('Delivery rescheduled')
}

function handleCancel() {
    if (!selected.value) return
    if (confirm(`Cancel shipment ${selected.value.id}? This action cannot be undone.`)) {
        store.cancelShipment(selected.value.id)
        showToast('Shipment cancelled')
    }
}

function submitDamage() {
    if (!selected.value || !damageForm.description.trim()) return
    store.reportDamage(selected.value.id, { ...damageForm, photos: [] })
    showDamageModal.value = false
    damageForm.severity = 'Medium'
    damageForm.description = ''
    showToast('Damage report submitted — reverse logistics ticket created')
}

function showToast(msg) {
    const t = document.createElement('div')
    t.className = 'fixed right-4 bottom-4 z-[9999] bg-green-500 text-white text-sm font-bold px-4 py-2 rounded-lg shadow-xl'
    t.textContent = msg
    document.body.appendChild(t)
    setTimeout(() => t.remove(), 3000)
}


</script>