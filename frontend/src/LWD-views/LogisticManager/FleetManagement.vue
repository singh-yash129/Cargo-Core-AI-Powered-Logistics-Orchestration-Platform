<template>
    <div class="space-y-6">
        <div class="flex justify-between items-center">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Fleet & Drivers Overview</h2>
            <div class="flex gap-3">
                <button @click="generateMaintenanceReport"
                    class="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium dark:bg-white/5 dark:hover:bg-white/10 dark:text-white border border-gray-200 dark:border-white/10 py-2 px-4 rounded-lg transition-colors shadow-sm flex items-center gap-2">
                    <span class="material-symbols-outlined text-sm">download</span> Maintenance Report
                </button>
                <button @click="openVehicleModal('add')"
                    class="bg-primary hover:bg-primary/90 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors shadow-sm">
                    <span class="material-symbols-outlined">local_shipping</span> Add Vehicle
                </button>
            </div>
        </div>

        <!-- Live Map Placeholder -->
        <div
            class="glass-panel w-full h-[300px] rounded-xl relative overflow-hidden group border border-gray-200 dark:border-white/5">
            <div
                class="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 opacity-60 dark:opacity-40 group-hover:opacity-80 dark:group-hover:opacity-50 transition-opacity">
            </div>
            <div class="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                <div
                    class="bg-white/80 dark:bg-black/50 backdrop-blur-md px-6 py-3 rounded-full text-gray-900 dark:text-white font-medium flex items-center gap-3 border border-gray-200 dark:border-white/10 shadow-lg">
                    <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    Live Fleet Tracking Active ({{filteredVehicles.filter(v => v.status === 'Active').length}}
                    Vehicles)
                </div>
            </div>
        </div>

        <!-- Role Filter Tabs & Search -->
        <div class="flex flex-col sm:flex-row justify-between items-center border-b border-gray-200 dark:border-white/10 gap-4 pb-1">
            <!-- Tabs -->
            <div class="flex gap-4 overflow-x-auto w-full sm:w-auto no-scrollbar">
                <button v-for="tab in tabs" :key="tab" class="px-4 py-2 text-sm font-medium transition-colors relative whitespace-nowrap"
                    :class="activeTab === tab ? 'text-primary' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'"
                    @click="activeTab = tab">
                    {{ tab }}
                    <div v-if="activeTab === tab"
                        class="absolute bottom-[-5px] left-0 w-full h-1 bg-primary rounded-t-full"></div>
                </button>
            </div>

            <!-- Global Search -->
            <div class="relative w-full sm:w-64 mb-1 sm:mb-0">
                <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">search</span>
                <input 
                    v-model="searchQuery" 
                    type="text" 
                    :placeholder="`Search ${activeTab}...`"
                    class="w-full bg-gray-100 dark:bg-white/5 border-none rounded-full py-1.5 pl-9 pr-4 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/50 outline-none transition-shadow"
                />
            </div>
        </div>

        <!-- Tab Content: Active Drivers -->
        <div v-if="activeTab === 'Active Drivers'" class="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            <!-- Driver Scorecard -->
            <div class="glass-panel rounded-xl p-6 h-[500px] flex flex-col">
                <h3 class="font-bold text-gray-900 dark:text-white mb-4 flex-shrink-0">Driver Roster & Performance</h3>
                <div class="space-y-4 overflow-y-auto pr-2 flex-grow custom-scrollbar">
                    <div v-for="driver in searchedDrivers" :key="driver.id" @click="openDriverProfile(driver)"
                        class="flex items-center gap-4 p-3 rounded-lg bg-gray-50 border border-transparent hover:border-primary/30 cursor-pointer dark:bg-white/5 dark:hover:bg-primary/20 transition-colors shadow-sm group">
                        <!-- Real drivers mock data avatar fallback -->
                        <div class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-sm"
                            :class="driver.avatarColor">
                            {{ driver.name.charAt(0) }}
                        </div>
                        <div class="flex-1">
                            <div class="flex justify-between items-center">
                                <span class="text-gray-900 dark:text-white font-bold text-sm">{{ driver.name }}</span>
                                <span class="text-xs px-2 py-0.5 rounded-full font-bold uppercase tracking-wider"
                                    :class="driver.status === 'active' ? 'bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400' : 'bg-yellow-50 text-yellow-600 dark:bg-yellow-500/10 dark:text-yellow-400'">
                                    {{ driver.status }}
                                </span>
                            </div>
                            <div class="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2">
                                <span>{{ driver.vehicle }}</span>
                                <span class="text-gray-300 dark:text-gray-600">•</span>
                                <span class="font-medium text-primary">{{ store.hubs.find(h => h.id === driver.hubId)?.name || 'Main Hub' }}</span>
                                <span class="text-gray-300 dark:text-gray-600">•</span>
                                <span>{{ driver.currentJob || 'Standby' }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Top Driver Stats -->
            <div class="glass-panel rounded-xl p-6 h-[500px] flex flex-col">
                <h3 class="font-bold text-gray-900 dark:text-white mb-4 flex-shrink-0">Top Leaderboard</h3>
                <div class="space-y-4 overflow-y-auto pr-2 flex-grow custom-scrollbar">
                    <div v-for="driver in searchedTopDrivers" :key="driver.id" @click="openDriverProfile(driver)"
                        class="flex items-center gap-4 p-3 rounded-lg bg-gray-50 border border-transparent hover:border-gray-200 dark:bg-white/5 dark:hover:bg-white/10 transition-colors shadow-sm cursor-pointer group">
                        <img :src="driver.avatar"
                            class="w-10 h-10 rounded-full border border-gray-200 dark:border-white/10">
                        <div class="flex-1">
                            <div class="flex justify-between items-center">
                                <span class="text-gray-900 dark:text-white font-bold text-sm">{{ driver.name }}</span>
                                <span
                                    class="text-yellow-500 dark:text-yellow-400 font-bold text-sm bg-yellow-50 dark:bg-yellow-500/10 px-2 py-0.5 rounded-full border border-yellow-200 dark:border-yellow-500/20">★
                                    {{ driver.rating }}</span>
                            </div>
                            <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">{{ driver.trips }} trips •
                                <span class="font-medium"
                                    :class="driver.ontime > 95 ? 'text-green-500 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'">{{
                                        driver.ontime }}% On-time</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Tab Content: Fleet Vehicles -->
        <div v-if="activeTab === 'Fleet Vehicles'" class="flex flex-col gap-6">
            <div class="glass-panel rounded-xl p-6 h-[500px] flex flex-col relative overflow-hidden">
                <h3 class="font-bold text-gray-900 dark:text-white mb-4 flex-shrink-0">Vehicle Roster</h3>
                <div class="overflow-x-auto overflow-y-auto flex-grow custom-scrollbar">
                    <table class="w-full text-left text-sm">
                        <thead class="bg-gray-50 dark:bg-transparent sticky top-0 z-10 backdrop-blur-md">
                            <tr
                                class="text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-white/10 uppercase tracking-wider text-[10px]">
                                <th class="py-2 px-2 font-medium">Vehicle ID</th>
                                <th class="py-2 font-medium">Warehouse</th>
                                <th class="py-2 font-medium">Type / Model</th>
                                <th class="py-2 font-medium">Driver</th>
                                <th class="py-2 font-medium text-right">Status</th>
                                <th class="py-2 px-2 text-right"></th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-100 dark:divide-white/5">
                            <tr v-for="vehicle in searchedVehicles" :key="vehicle.id"
                                @click.stop="openVehicleProfile(vehicle)"
                                class="group hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer relative">
                                <td class="py-3 px-2 text-gray-700 dark:text-white font-mono font-medium">{{ vehicle.id
                                }}<br /><span class="text-[10px] text-gray-500">{{ vehicle.licensePlate }}</span>
                                </td>
                                <td class="py-3 text-gray-600 dark:text-gray-300 font-medium whitespace-nowrap">
                                    {{ store.hubs.find(h => h.id === vehicle.hubId)?.name || 'Main Hub' }}
                                </td>
                                <td class="py-3 text-gray-600 dark:text-gray-300">{{ vehicle.type }}<br /><span
                                        class="text-xs text-gray-400">{{ vehicle.model }} ({{ vehicle.year }})</span>
                                </td>
                                <td class="py-3 text-gray-600 dark:text-gray-300 font-medium">{{ vehicle.driver }}</td>
                                <td class="py-3 text-right">
                                    <span
                                        class="px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border shadow-sm"
                                        :class="vehicle.status === 'Active' ? 'bg-green-50 border-green-200 text-green-600 dark:bg-green-500/10 dark:border-green-500/20 dark:text-green-500' :
                                            (vehicle.status === 'In Shop' ? 'bg-red-50 border-red-200 text-red-600 dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-500' : 'bg-yellow-50 border-yellow-200 text-yellow-600 dark:bg-yellow-500/10 dark:border-yellow-500/20 dark:text-yellow-500')">
                                        {{ vehicle.status }}
                                    </span>
                                </td>
                                <td class="py-3 px-2 text-right relative">
                                    <button @click.stop="toggleVehicleDropdown(vehicle.id)"
                                        class="text-gray-400 hover:text-gray-900 dark:text-gray-500 dark:hover:text-white cursor-pointer transition-colors p-1 rounded-full hover:bg-gray-100 dark:hover:bg-white/10">
                                        <span class="material-symbols-outlined">more_vert</span>
                                    </button>

                                    <!-- Action Dropdown for Vehicles -->
                                    <div v-if="activeDropdown === vehicle.id" @click.stop
                                        class="absolute right-6 top-10 w-40 bg-white dark:bg-card-dark border border-gray-200 dark:border-white/10 rounded-xl shadow-lg z-50 py-1 overflow-hidden">
                                        <button @click="openVehicleModal('edit', vehicle); activeDropdown = null"
                                            class="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 flex items-center gap-2 transition-colors">
                                            <span class="material-symbols-outlined text-[18px]">edit</span> Edit Details
                                        </button>
                                        <button
                                            @click="store.updateVehicleStatus(vehicle.id, vehicle.status === 'Active' ? 'In Shop' : 'Active'); activeDropdown = null"
                                            class="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 flex items-center gap-2 transition-colors">
                                            <span class="material-symbols-outlined text-[18px]">engineering</span>
                                            Toggle Status
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Maintenance Alerts -->
            <div class="glass-panel rounded-xl p-6 h-[500px] flex flex-col relative overflow-hidden">
                <div class="absolute top-0 right-0 p-6 opacity-5 dark:opacity-10 pointer-events-none">
                </div>
                <h3 class="font-bold text-gray-900 dark:text-white mb-4 flex-shrink-0 z-10">Pending Maintenance</h3>
                <div class="overflow-x-auto overflow-y-auto flex-grow custom-scrollbar z-10">
                    <table class="w-full text-left text-sm">
                        <thead class="bg-gray-50 dark:bg-transparent sticky top-0 z-10 backdrop-blur-md">
                            <tr
                                class="text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-white/10 uppercase tracking-wider text-[10px]">
                                <th class="py-2 px-2 font-medium">Vehicle ID</th>
                                <th class="py-2 font-medium">Issue / Description</th>
                                <th class="py-2 font-medium">Warehouse</th>
                                <th class="py-2 font-medium">Type / Model</th>
                                <th class="py-2 font-medium text-right">Approx Cost</th>
                                <th class="py-2 font-medium text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-100 dark:divide-white/5">
                            <tr v-for="issue in searchedMaintenance" :key="issue.id"
                                class="group hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer relative"
                                @click="openVehicleProfile(store.filteredVehicles.find(v => v.id === issue.id), 'history')">
                                <td class="py-3 px-2 text-gray-700 dark:text-white font-mono font-medium">
                                    {{ issue.id }}<br />
                                    <span class="text-[10px] text-gray-500">
                                        {{ store.filteredVehicles.find(v => v.id === issue.id)?.licensePlate || 'N/A' }}
                                    </span>
                                </td>
                                <td class="py-3 text-gray-600 dark:text-gray-300 font-medium">
                                    {{ issue.issue }}<br/>
                                    <span class="text-[10px] text-gray-400 font-normal">Reported: 2 days ago</span>
                                </td>
                                <td class="py-3 text-gray-600 dark:text-gray-300 font-medium whitespace-nowrap">
                                    {{ store.hubs.find(h => h.id === issue.hubId)?.name || 'Main Hub' }}
                                </td>
                                <td class="py-3 text-gray-600 dark:text-gray-300">
                                    <div class="font-medium text-gray-900 dark:text-white">
                                        {{ store.filteredVehicles.find(v => v.id === issue.id)?.type || 'Heavy Truck' }}
                                    </div>
                                    <div class="text-[10px] text-gray-500">
                                        {{ store.filteredVehicles.find(v => v.id === issue.id)?.model || 'Volvo FH16' }} 
                                        ({{ store.filteredVehicles.find(v => v.id === issue.id)?.year || '2021' }})
                                    </div>
                                </td>
                                <td class="py-3 text-right text-gray-600 dark:text-gray-300 font-mono">
                                    ${{ Math.floor(Math.random() * 500) + 150 }}.00
                                </td>
                                <td class="py-3 text-right">
                                    <span
                                        class="px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border shadow-sm"
                                        :class="issue.statusClass">{{ issue.status }}</span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- Tab Content: Fuel Logs (New) -->
        <div v-if="activeTab === 'Fuel Logs'" class="grid grid-cols-1 lg:grid-cols-3 gap-6 text-sm">
            <!-- Fuel Stats Summary -->
            <div class="glass-panel rounded-xl p-6 lg:col-span-1 border border-gray-200 dark:border-white/5 h-[500px] flex flex-col">
                <h3 class="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2 flex-shrink-0">
                    <span class="material-symbols-outlined text-orange-500">local_gas_station</span>
                    Fuel Consumption
                </h3>
                <div class="space-y-4 overflow-y-auto custom-scrollbar pr-2">
                    <div class="bg-orange-50 dark:bg-orange-500/10 p-4 rounded-xl border border-orange-100 dark:border-orange-500/20">
                        <p class="text-xs text-orange-600 dark:text-orange-400 uppercase font-bold tracking-wider mb-1">Total Cost (This Month)</p>
                        <p class="text-2xl font-bold text-gray-900 dark:text-white">${{ fuelStats.totalCost.toFixed(2) }}</p>
                        <p class="text-xs text-orange-600/80 mt-1">↑ 2.4% vs last month</p>
                    </div>
                     <div class="grid grid-cols-2 gap-4">
                        <div class="bg-gray-50 dark:bg-white/5 p-4 rounded-xl">
                            <p class="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1">Avg Price/Gal</p>
                            <p class="text-lg font-bold text-gray-900 dark:text-white">${{ fuelStats.avgPrice }}</p>
                        </div>
                        <div class="bg-gray-50 dark:bg-white/5 p-4 rounded-xl">
                            <p class="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1">Total Volume</p>
                            <p class="text-lg font-bold text-gray-900 dark:text-white">{{ fuelStats.totalVolume }} gal</p>
                        </div>
                    </div>
                    <!-- Additional mock stats for professional look -->
                    <div class="p-4 border-t border-gray-100 dark:border-white/5 mt-4">
                        <p class="text-xs text-gray-500 uppercase font-bold tracking-wider mb-2">Efficiency Trend</p>
                        <div class="w-full bg-gray-200 dark:bg-white/10 rounded-full h-2 mb-1">
                            <div class="bg-green-500 h-2 rounded-full" :style="{ width: fuelStats.efficiency + '%' }"></div>
                        </div>
                        <div class="flex justify-between text-xs text-gray-500">
                            <span>{{ (fuelStats.efficiency / 10).toFixed(1) }} MPG (Avg)</span>
                            <span>Target: 8.0</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Recent Transactions Table -->
            <div class="glass-panel rounded-xl p-6 lg:col-span-2 border border-gray-200 dark:border-white/5 h-[500px] flex flex-col relative overflow-hidden">
                <h3 class="font-bold text-gray-900 dark:text-white mb-4 flex-shrink-0">Recent Refueling Logs</h3>
                <div class="overflow-x-auto overflow-y-auto flex-grow custom-scrollbar">
                    <table class="w-full text-left text-sm">
                        <thead class="bg-gray-50 dark:bg-transparent sticky top-0 z-10 backdrop-blur-md">
                            <tr class="text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-white/10 uppercase tracking-wider text-[10px]">
                                <th class="py-2 px-2 font-medium">Date</th>
                                <th class="py-2 font-medium">Vehicle</th>
                                <th class="py-2 font-medium">Warehouse</th>
                                <th class="py-2 font-medium">Station</th>
                                <th class="py-2 font-medium text-right">Gallons</th>
                                <th class="py-2 font-medium text-right">Cost</th>
                                <th class="py-2 font-medium text-right">Status</th>
                            </tr>
                        </thead>
                       <tbody class="divide-y divide-gray-100 dark:divide-white/5">
                            <tr v-for="log in searchedFuelLogs" :key="log.id" class="group hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                <td class="py-3 px-2 text-gray-600 dark:text-gray-300 font-mono">{{ log.date }}</td>
                                <td class="py-3 text-gray-900 dark:text-white font-medium">{{ log.vehicleId }}</td>
                                <td class="py-3 text-gray-600 dark:text-gray-300 font-medium whitespace-nowrap">{{ store.hubs.find(h => h.id === log.hubId)?.name || 'Main Hub' }}</td>
                                <td class="py-3 text-gray-600 dark:text-gray-300">{{ log.station }}</td>
                                <td class="py-3 text-gray-600 dark:text-gray-300 text-right">{{ log.gallons }}</td>
                                <td class="py-3 text-gray-900 dark:text-white font-bold text-right">${{ log.cost }}</td>
                                <td class="py-3 text-right">
                                    <span class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase" 
                                        :class="log.alert ? 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 border border-red-200' : 'bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400 border border-green-200'">
                                        {{ log.alert ? 'Anomaly' : 'Verified' }}
                                    </span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- Tab Content: Vehicle Documents -->
        <div v-if="activeTab === 'Vehicle Documents'" class="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            <div class="glass-panel rounded-xl p-6 h-[500px] flex flex-col relative overflow-hidden col-span-2">
                <h3 class="font-bold text-gray-900 dark:text-white mb-4 flex-shrink-0">Vehicle Documentation & Compliance</h3>
                <div class="overflow-x-auto overflow-y-auto flex-grow custom-scrollbar">
                    <table class="w-full text-left text-sm">
                         <thead class="bg-gray-50 dark:bg-transparent sticky top-0 z-10 backdrop-blur-md">
                            <tr class="text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-white/10 uppercase tracking-wider text-[10px]">
                                <th class="py-2 px-2 font-medium">Vehicle ID</th>
                                <th class="py-2 font-medium">Warehouse</th>
                                <th class="py-2 font-medium">Doc Types</th>
                                <th class="py-2 font-medium">Next Expiry</th>
                                <th class="py-2 font-medium">Status Overview</th>
                                <th class="py-2 px-2 text-right">View</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-100 dark:divide-white/5">
                            <template v-for="(docs, vehicleId) in groupedVehicleDocs" :key="vehicleId">
                                <!-- Parent Row -->
                                <tr class="group hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer" @click="toggleDocExpand(vehicleId)">
                                    <td class="py-3 px-2 text-gray-900 dark:text-white font-mono font-medium flex items-center gap-2">
                                        <span class="material-symbols-outlined text-gray-400 text-sm transition-transform duration-200" :class="expandedDocs.includes(vehicleId) ? 'rotate-90' : ''">chevron_right</span>
                                        {{ vehicleId }}
                                    </td>
                                    <td class="py-3 text-gray-600 dark:text-gray-300 font-medium whitespace-nowrap">
                                        {{ store.hubs.find(h => h.id === docs[0]?.hubId)?.name || 'Main Hub' }}
                                    </td>
                                    <td class="py-3 text-gray-600 dark:text-gray-300">
                                        <div class="flex flex-wrap gap-1">
                                            <span v-for="type in [...new Set(docs.map(d => d.type))].slice(0, 2)" :key="type" class="text-[10px] bg-gray-100 dark:bg-white/10 px-1.5 py-0.5 rounded text-gray-600 dark:text-gray-300">
                                                {{ type }}
                                            </span>
                                            <span v-if="[...new Set(docs.map(d => d.type))].length > 2" class="text-[10px] text-gray-400">+{{ [...new Set(docs.map(d => d.type))].length - 2 }}</span>
                                        </div>
                                    </td>
                                    <td class="py-3 text-gray-600 dark:text-gray-300 font-mono text-xs">
                                        {{ docs.map(d => d.expiry).sort((a,b) => new Date(a) - new Date(b))[0] }}
                                    </td>
                                    <td class="py-3">
                                        <div class="flex gap-2 items-center">
                                            <span v-if="docs.some(d => new Date(d.expiry) < new Date())" class="w-2 h-2 rounded-full bg-red-500" title="Expired Doc"></span>
                                            <span v-else-if="docs.some(d => d.status === 'Expiring Soon')" class="w-2 h-2 rounded-full bg-yellow-500" title="Expiring Soon"></span>
                                            <span v-else class="w-2 h-2 rounded-full bg-green-500" title="All Good"></span>
                                            <span class="text-xs text-gray-500 dark:text-gray-400">
                                                {{ docs.some(d => new Date(d.expiry) < new Date()) ? 'Action Required' : (docs.some(d => d.status === 'Expiring Soon') ? 'Renew Soon' : 'Compliant') }}
                                            </span>
                                        </div>
                                    </td>
                                    <td class="py-3 px-2 text-right">
                                        <button @click.stop="toggleDocExpand(vehicleId)" class="text-gray-400 hover:text-gray-900 dark:text-gray-500 dark:hover:text-white p-1 rounded-full transition-colors hover:bg-gray-100 dark:hover:bg-white/10">
                                            <span class="material-symbols-outlined">expand_circle_down</span>
                                        </button>
                                    </td>
                                </tr>
                                <!-- Child Rows (Dropdown) -->
                                <tr v-if="expandedDocs.includes(vehicleId)" class="bg-gray-50/50 dark:bg-white/5">
                                    <td colspan="5" class="p-0">
                                        <div class="px-4 py-2 border-l-2 border-primary ml-6 my-2 space-y-2">
                                            <div v-for="doc in docs" :key="doc.id" class="flex justify-between items-center p-2 rounded-lg hover:bg-white dark:hover:bg-white/5 border border-transparent hover:border-gray-200 dark:hover:border-white/10 transition-colors">
                                                <div class="flex items-center gap-3">
                                                    <span class="material-symbols-outlined text-gray-400">description</span>
                                                    <div>
                                                        <p class="text-sm font-medium text-gray-900 dark:text-white">{{ doc.type }}</p>
                                                        <p class="text-[10px] text-gray-500">Exp: {{ doc.expiry }}</p>
                                                    </div>
                                                </div>
                                                <div class="flex items-center gap-4">
                                                     <span class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border"
                                                        :class="doc.status === 'Active' ? 'bg-green-50 text-green-600 border-green-200 dark:bg-green-500/10 dark:text-green-400' : (doc.status === 'Expiring Soon' ? 'bg-yellow-50 text-yellow-600 border-yellow-200 dark:bg-yellow-500/10 dark:text-yellow-400' : 'bg-red-50 text-red-600 border-red-200 dark:bg-red-500/10 dark:text-red-400')">
                                                        {{ doc.status }}
                                                    </span>
                                                    <button @click.stop="openDocModal(doc)" class="text-primary hover:text-primary/80 font-medium text-xs flex items-center gap-1 bg-primary/10 px-3 py-1.5 rounded-lg hover:bg-primary/20 transition-colors">
                                                        <span class="material-symbols-outlined text-[14px]">visibility</span> View
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            </template>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- Tab Content: Driver Documents -->
        <div v-if="activeTab === 'Driver Documents'" class="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            <div class="glass-panel rounded-xl p-6 h-[500px] flex flex-col relative overflow-hidden col-span-2">
                <h3 class="font-bold text-gray-900 dark:text-white mb-4 flex-shrink-0">Driver Personnel Files</h3>
                 <div class="overflow-x-auto overflow-y-auto flex-grow custom-scrollbar">
                    <table class="w-full text-left text-sm">
                         <thead class="bg-gray-50 dark:bg-transparent sticky top-0 z-10 backdrop-blur-md">
                            <tr class="text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-white/10 uppercase tracking-wider text-[10px]">
                                <th class="py-2 px-2 font-medium">Driver Name</th>
                                <th class="py-2 font-medium">Warehouse</th>
                                <th class="py-2 font-medium">Files on Record</th>
                                <th class="py-2 font-medium">Next Expiry</th>
                                <th class="py-2 font-medium">Compliance Status</th>
                                <th class="py-2 px-2 text-right">View</th>
                            </tr>
                        </thead>
                       <tbody class="divide-y divide-gray-100 dark:divide-white/5">
                            <template v-for="driverGroup in groupedDriverDocs" :key="driverGroup.id">
                                <!-- Parent Row -->
                                <tr class="group hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer" @click="toggleDocExpand(driverGroup.id)">
                                    <td class="py-3 px-2 flex items-center gap-3">
                                        <span class="material-symbols-outlined text-gray-400 text-sm transition-transform duration-200" :class="expandedDocs.includes(driverGroup.id) ? 'rotate-90' : ''">chevron_right</span>
                                        <div class="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300">
                                            {{ driverGroup.name.charAt(0) }}
                                        </div>
                                        <span class="text-gray-900 dark:text-white font-medium">{{ driverGroup.name }}</span>
                                    </td>
                                    <td class="py-3 text-gray-600 dark:text-gray-300 font-medium whitespace-nowrap">
                                        {{ store.hubs.find(h => h.id === driverGroup.docs[0]?.hubId)?.name || 'Main Hub' }}
                                    </td>
                                    <td class="py-3 text-gray-600 dark:text-gray-300">
                                        <div class="flex flex-wrap gap-1">
                                            <span v-for="doc in driverGroup.docs.slice(0, 2)" :key="doc.id" class="text-[10px] bg-gray-100 dark:bg-white/10 px-1.5 py-0.5 rounded text-gray-600 dark:text-gray-300 truncate max-w-[100px]">
                                                {{ doc.type }}
                                            </span>
                                            <span v-if="driverGroup.docs.length > 2" class="text-[10px] text-gray-400">+{{ driverGroup.docs.length - 2 }}</span>
                                        </div>
                                    </td>
                                    <td class="py-3 text-gray-600 dark:text-gray-300 text-xs">
                                        {{ driverGroup.docs.map(d => d.expiry).sort((a,b) => new Date(a) - new Date(b))[0] }}
                                    </td>
                                    <td class="py-3">
                                          <div class="flex gap-2 items-center">
                                            <span v-if="driverGroup.docs.some(d => new Date(d.expiry) < new Date())" class="w-2 h-2 rounded-full bg-red-500" title="Expired Doc"></span>
                                            <span v-else-if="driverGroup.docs.some(d => d.status === 'Expiring Soon')" class="w-2 h-2 rounded-full bg-yellow-500" title="Expiring Soon"></span>
                                            <span v-else class="w-2 h-2 rounded-full bg-green-500" title="All Good"></span>
                                            <span class="text-xs text-gray-500 dark:text-gray-400">
                                                {{ driverGroup.docs.some(d => new Date(d.expiry) < new Date()) ? 'Action Required' : (driverGroup.docs.some(d => d.status === 'Expiring Soon') ? 'Renew Soon' : 'Compliant') }}
                                            </span>
                                        </div>
                                    </td>
                                    <td class="py-3 px-2 text-right">
                                         <button @click.stop="toggleDocExpand(driverGroup.id)" class="text-gray-400 hover:text-gray-900 dark:text-gray-500 dark:hover:text-white p-1 rounded-full transition-colors hover:bg-gray-100 dark:hover:bg-white/10">
                                            <span class="material-symbols-outlined">expand_circle_down</span>
                                        </button>
                                    </td>
                                </tr>
                                <!-- Child Rows -->
                                <tr v-if="expandedDocs.includes(driverGroup.id)" class="bg-gray-50/50 dark:bg-white/5">
                                    <td colspan="5" class="p-0">
                                        <div class="px-4 py-2 border-l-2 border-primary ml-10 my-2 space-y-2">
                                            <div v-for="doc in driverGroup.docs" :key="doc.id" class="flex justify-between items-center p-2 rounded-lg hover:bg-white dark:hover:bg-white/5 border border-transparent hover:border-gray-200 dark:hover:border-white/10 transition-colors">
                                                <div class="flex items-center gap-3">
                                                    <span class="material-symbols-outlined text-gray-400">badge</span>
                                                    <div>
                                                        <p class="text-sm font-medium text-gray-900 dark:text-white">{{ doc.type }}</p>
                                                        <p class="text-[10px] text-gray-500">ID: {{ doc.licenseNo }}</p>
                                                    </div>
                                                </div>
                                                <div class="flex items-center gap-4">
                                                    <div class="text-right">
                                                        <p class="text-[10px] text-gray-400">Expiry</p>
                                                        <p class="text-xs font-medium" :class="new Date(doc.expiry) < new Date() ? 'text-red-500' : 'text-gray-900 dark:text-white'">{{ doc.expiry }}</p>
                                                    </div>
                                                    <span class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border"
                                                        :class="doc.status === 'Active' ? 'bg-green-50 text-green-600 border-green-200 dark:bg-green-500/10 dark:text-green-400' : 'bg-red-50 text-red-600 border-red-200 dark:bg-red-500/10 dark:text-red-400'">
                                                        {{ doc.status }}
                                                    </span>
                                                    <button @click.stop="openDocModal(doc)" class="text-primary hover:text-primary/80 font-medium text-xs flex items-center gap-1 bg-primary/10 px-3 py-1.5 rounded-lg hover:bg-primary/20 transition-colors">
                                                        <span class="material-symbols-outlined text-[14px]">visibility</span> View
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            </template>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- Tab Content: Live Locations -->
        <div v-if="activeTab === 'Live Locations'" class="glass-panel rounded-xl p-6 h-[500px] flex flex-col relative overflow-hidden">
            <h3 class="font-bold text-gray-900 dark:text-white mb-4 flex-shrink-0">Real-Time Fleet Positioning</h3>
            <div class="overflow-x-auto overflow-y-auto flex-grow custom-scrollbar">
                <table class="w-full text-left text-sm">
                    <thead class="bg-gray-50 dark:bg-transparent sticky top-0 z-10 backdrop-blur-md">
                        <tr class="text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-white/10 uppercase tracking-wider text-[10px]">
                            <th class="py-2 px-2 font-medium">Vehicle Details</th>
                            <th class="py-2 font-medium">Warehouse</th>
                            <th class="py-2 font-medium">Assigned Driver</th>
                            <th class="py-2 font-medium">Current Coordinate</th>
                            <th class="py-2 font-medium text-right">Status</th>
                            <th class="py-2 px-2 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100 dark:divide-white/5">
                        <template v-for="vehicle in vehicleLocationData" :key="vehicle.id">
                            <!-- Parent Row -->
                            <tr class="group hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer" @click="toggleDocExpand(vehicle.id)">
                                <td class="py-3 px-2">
                                    <div class="flex items-center gap-3">
                                        <span class="material-symbols-outlined text-gray-400 text-sm transition-transform duration-200" :class="expandedDocs.includes(vehicle.id) ? 'rotate-90' : ''">chevron_right</span>
                                        <div>
                                            <p class="font-mono font-medium text-gray-900 dark:text-white">{{ vehicle.id }}</p>
                                            <p class="text-[10px] text-gray-500">{{ vehicle.type }} • {{ vehicle.licensePlate }}</p>
                                        </div>
                                    </div>
                                </td>
                                <td class="py-3 text-gray-600 dark:text-gray-300 font-medium whitespace-nowrap">
                                    {{ store.hubs.find(h => h.id === vehicle.hubId)?.name || 'Main Hub' }}
                                </td>
                                <td class="py-3 text-gray-600 dark:text-gray-300">
                                    <div v-if="vehicle.driver !== 'Unassigned'">
                                        <p class="font-medium text-gray-900 dark:text-white">{{ vehicle.driver }}</p>
                                        <p class="text-[10px] text-gray-500">Lic: {{ vehicle.licenseNo }}</p>
                                    </div>
                                    <div v-else class="text-gray-400 italic text-xs">Unassigned</div>
                                </td>
                                <td class="py-3 text-gray-600 dark:text-gray-300 font-mono text-xs">
                                    <span class="flex items-center gap-1">
                                        <span class="material-symbols-outlined text-[14px] text-primary">location_on</span>
                                        {{ vehicle.currentLocation }}
                                    </span>
                                </td>
                                <td class="py-3 text-right">
                                    <span class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border"
                                        :class="vehicle.status === 'Active' ? 'bg-green-50 text-green-600 border-green-200 dark:bg-green-500/10 dark:text-green-400' : 'bg-gray-100 text-gray-500 border-gray-200 dark:bg-white/10 dark:text-gray-400'">
                                        {{ vehicle.status }}
                                    </span>
                                </td>
                                <td class="py-3 px-2 text-right">
                                    <button @click.stop="toggleDocExpand(vehicle.id)" class="text-gray-400 hover:text-gray-900 dark:text-gray-500 dark:hover:text-white p-1 rounded-full transition-colors hover:bg-gray-100 dark:hover:bg-white/10">
                                        <span class="material-symbols-outlined">expand_circle_down</span>
                                    </button>
                                </td>
                            </tr>
                            <!-- Child Row (Dropdown) -->
                            <tr v-if="expandedDocs.includes(vehicle.id)" class="bg-gray-50/50 dark:bg-white/5">
                                <td colspan="5" class="p-0">
                                    <div class="px-4 py-3 border-l-2 border-primary ml-8 my-2 bg-white dark:bg-black/20 rounded-r-lg shadow-inner">
                                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <!-- Map Placeholder -->
                                            <div class="h-32 bg-gray-200 dark:bg-white/10 rounded-lg flex items-center justify-center relative overflow-hidden group">
                                                <div class="absolute inset-0 bg-[url('https://maps.googleapis.com/maps/api/staticmap?center=40.7128,-74.0060&zoom=13&size=400x200&sensor=false')] bg-cover bg-center grayscale opacity-50 group-hover:grayscale-0 transition-all duration-500"></div>
                                                <div class="z-10 bg-white/80 dark:bg-black/80 px-3 py-1 rounded-full text-xs font-mono font-bold flex items-center gap-2 backdrop-blur-sm">
                                                    <span class="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                                                    {{ vehicle.gps }}
                                                </div>
                                            </div>
                                            
                                            <!-- Stats -->
                                            <div class="col-span-2 space-y-3">
                                                <div class="flex justify-between items-start">
                                                    <div>
                                                        <h4 class="text-sm font-bold text-gray-900 dark:text-white mb-1">Current Assignment</h4>
                                                        <p class="text-xs text-gray-600 dark:text-gray-300">{{ vehicle.currentJob }}</p>
                                                    </div>
                                                    <div class="text-right">
                                                        <p class="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Last Ping</p>
                                                        <p class="text-xs font-mono font-bold text-green-600 dark:text-green-400">{{ vehicle.lastUpdate }}</p>
                                                    </div>
                                                </div>
                                                <div class="grid grid-cols-3 gap-2 pt-2 border-t border-gray-100 dark:border-white/5">
                                                    <div class="bg-gray-50 dark:bg-white/5 p-2 rounded">
                                                        <p class="text-[10px] text-gray-400">Speed</p>
                                                        <p class="text-sm font-bold">{{ vehicle.speed }}</p>
                                                    </div>
                                                    <div class="bg-gray-50 dark:bg-white/5 p-2 rounded">
                                                        <p class="text-[10px] text-gray-400">Heading</p>
                                                        <p class="text-sm font-bold">NW 315°</p>
                                                    </div>
                                                    <div class="bg-gray-50 dark:bg-white/5 p-2 rounded">
                                                        <p class="text-[10px] text-gray-400">Altitude</p>
                                                        <p class="text-sm font-bold">245 ft</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        </template>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- ======================= MODALS AND SLIDEOVERS ======================= -->

        <!-- Add/Edit Vehicle Modal -->
        <Teleport to="body">
            <div v-if="isVehicleModalOpen"
                class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                @click.self="closeVehicleModal">
                <div
                    class="bg-white dark:bg-card-dark w-full max-w-md rounded-2xl shadow-2xl border border-gray-200 dark:border-white/10 overflow-hidden flex flex-col">
                    <div
                        class="px-6 py-4 border-b border-gray-200 dark:border-white/5 flex justify-between items-center bg-gray-50 dark:bg-white/5">
                        <h3 class="text-lg font-bold text-gray-900 dark:text-white">{{ vehicleModalMode === 'add' ? `Add
                            New Vehicle` : `Edit Vehicle` }}</h3>
                        <button @click="closeVehicleModal"
                            class="text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors">
                            <span class="material-symbols-outlined">close</span>
                        </button>
                    </div>

                    <div class="p-6 space-y-4">
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Vehicle
                                    ID</label>
                                <input v-model="vehicleFormData.id" :disabled="vehicleModalMode === 'edit'"
                                    class="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:border-primary/50 disabled:opacity-50">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">License
                                    Plate</label>
                                <input v-model="vehicleFormData.licensePlate"
                                    class="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:border-primary/50">
                            </div>
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type /
                                Model</label>
                            <input v-model="vehicleFormData.model" placeholder="e.g. Ford Transit (2022)"
                                class="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:border-primary/50">
                        </div>

                        <div v-if="vehicleModalMode === 'add'">
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Hub
                                Assignment</label>
                            <div class="relative">
                                <select v-model="vehicleFormData.hubId"
                                    class="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:border-primary/50">
                                    <option value="all">Global (All Warehouses)</option>
                                    <option v-for="h in store.hubs" :key="h.id" :value="h.id">{{ h.name }}</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div
                        class="px-6 py-4 border-t border-gray-200 dark:border-white/5 flex justify-end gap-3 bg-gray-50 dark:bg-white/5">
                        <button @click="closeVehicleModal"
                            class="px-4 py-2 rounded-lg font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-colors shadow-sm">Cancel</button>
                        <button @click="submitVehicle"
                            class="px-4 py-2 rounded-lg font-medium text-white bg-primary hover:bg-primary/90 transition-colors shadow-sm">{{
                                vehicleModalMode === 'add' ? 'Add Vehicle' : 'Save Changes' }}</button>
                    </div>
                </div>
            </div>
        </Teleport>

        <!-- Driver Profile Modal with Chat -->
        <Teleport to="body">
            <div v-if="activeDriverProfile"
                class="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                @click.self="closeDriverProfile">
                <div
                    class="bg-white dark:bg-card-dark w-full max-w-4xl rounded-2xl shadow-2xl border border-gray-200 dark:border-white/10 overflow-hidden flex flex-col md:flex-row h-[600px]">
                    <!-- Left: Profile Details -->
                    <div class="w-full md:w-1/2 p-6 overflow-y-auto border-r border-gray-200 dark:border-white/10">
                        <div class="flex items-center gap-4 mb-6">
                            <!-- Image Avatar if available (Top Drivers) -->
                            <img v-if="activeDriverProfile.avatar" 
                                :src="activeDriverProfile.avatar" 
                                class="w-16 h-16 rounded-full object-cover border-2 border-primary/20 shadow-sm">
                            
                            <!-- Initials Avatar fallback (Standard Drivers) -->
                            <div v-else 
                                class="w-16 h-16 rounded-full flex items-center justify-center font-bold text-white text-2xl shadow-sm"
                                :class="activeDriverProfile.avatarColor || 'bg-blue-500'">
                                {{ activeDriverProfile.name.charAt(0) }}
                            </div>
                            
                            <div>
                                <h3 class="text-2xl font-bold text-gray-900 dark:text-white">{{ activeDriverProfile.name
                                }}</h3>
                                <div class="text-sm text-gray-500">{{ activeDriverProfile.id }} • {{
                                    activeDriverProfile.phone }}</div>
                            </div>
                            <!-- Status Toggle -->
                            <div class="ml-auto">
                                <span class="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
                                    :class="activeDriverProfile.status === 'active' ? 'bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400' : 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400'">
                                    {{ activeDriverProfile.status }}
                                </span>
                            </div>
                        </div>

                        <div class="grid grid-cols-2 gap-4 mb-6">
                            <div class="bg-gray-50 dark:bg-black/20 rounded-xl p-4">
                                <p class="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Efficiency</p>
                                <p class="text-xl font-bold text-gray-900 dark:text-white">{{
                                    activeDriverProfile.efficiency }}%</p>
                            </div>
                            <div class="bg-gray-50 dark:bg-black/20 rounded-xl p-4">
                                <p class="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Vehicle</p>
                                <p class="text-sm font-bold text-gray-900 dark:text-white mt-1">{{
                                    activeDriverProfile.vehicle }}</p>
                            </div>
                            <div class="col-span-2 bg-gray-50 dark:bg-black/20 rounded-xl p-4">
                                <p class="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Current Job /
                                    Location</p>
                                <p class="text-sm font-bold text-gray-900 dark:text-white mt-1">{{
                                    activeDriverProfile.currentJob }} • {{ activeDriverProfile.location }}</p>
                            </div>
                        </div>

                        <!-- Mock historical metrics -->
                        <h4 class="font-bold text-gray-900 dark:text-white mb-3">Performance History</h4>
                        <div class="space-y-3">
                            <div class="flex justify-between text-sm py-2 border-b border-gray-100 dark:border-white/5">
                                <span class="text-gray-500">Lifetime Deliveries</span>
                                <span class="font-bold text-gray-900 dark:text-white">4,291</span>
                            </div>
                            <div class="flex justify-between text-sm py-2 border-b border-gray-100 dark:border-white/5">
                                <span class="text-gray-500">Customer Rating</span>
                                <span class="font-bold text-yellow-500">★ 4.88</span>
                            </div>
                            <div class="flex justify-between text-sm py-2 border-b border-gray-100 dark:border-white/5">
                                <span class="text-gray-500">Total Earnings (YTD)</span>
                                <span class="font-bold text-gray-900 dark:text-white">$42,500</span>
                            </div>
                            <div class="flex justify-between text-sm py-2 border-b border-gray-100 dark:border-white/5">
                                <span class="text-gray-500">Safety Incidents</span>
                                <span class="font-bold text-green-500">0</span>
                            </div>
                        </div>
                    </div>

                    <!-- Right: Chat Interface -->
                    <div class="w-full md:w-1/2 flex flex-col bg-gray-50 dark:bg-white/5">
                        <div class="p-4 border-b border-gray-200 dark:border-white/5 bg-white dark:bg-transparent">
                            <h4 class="font-bold text-gray-900 dark:text-white">Direct Comms (Dispatch)</h4>
                        </div>

                        <!-- Chat Bubbles -->
                        <div class="flex-1 p-4 overflow-y-auto space-y-4">
                            <div v-for="msg in activeDriverProfile.chatHistory" :key="msg.id" class="flex flex-col"
                                :class="msg.sender === 'dispatch' ? 'items-end' : 'items-start'">
                                <div class="max-w-[80%] rounded-2xl px-4 py-2 text-sm"
                                    :class="msg.sender === 'dispatch' ? 'bg-primary text-white rounded-tr-sm' : 'bg-gray-200 dark:bg-white/10 text-gray-900 dark:text-white rounded-tl-sm'">
                                    {{ msg.text }}
                                </div>
                                <span class="text-[10px] text-gray-500 mt-1">{{ msg.time }}</span>
                            </div>
                        </div>

                        <!-- Chat Input -->
                        <div
                            class="p-4 bg-white dark:bg-transparent border-t border-gray-200 dark:border-white/5 flex gap-2">
                            <input v-model="chatInput" @keyup.enter="sendChat" type="text"
                                placeholder="Type a message to driver..."
                                class="flex-1 bg-gray-100 dark:bg-black/20 border border-transparent focus:border-primary/50 rounded-full px-4 text-sm text-gray-900 dark:text-white outline-none">
                            <button @click="sendChat"
                                class="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary/90 transition-colors">
                                <span class="material-symbols-outlined text-[18px]">send</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Teleport>

        <!-- Vehicle Profile Modal -->
        <Teleport to="body">
            <div v-if="activeVehicleProfile"
                class="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                @click.self="closeVehicleProfile">
                <div
                    class="bg-white dark:bg-card-dark w-full max-w-2xl rounded-2xl shadow-2xl border border-gray-200 dark:border-white/10 overflow-hidden flex flex-col">
                    <div
                        class="px-6 py-4 border-b border-gray-200 dark:border-white/5 flex justify-between items-center bg-gray-50 dark:bg-white/5">
                        <div class="flex items-center gap-3">
                            <span class="material-symbols-outlined text-gray-400">local_shipping</span>
                            <h3 class="text-lg font-bold text-gray-900 dark:text-white">{{ activeVehicleProfile.id }}
                                Overview</h3>
                        </div>
                        <button @click="closeVehicleProfile"
                            class="text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors">
                            <span class="material-symbols-outlined">close</span>
                        </button>
                    </div>

                    <div class="p-6">
                        <div v-if="activeVehicleProfile.viewMode === 'full'">
                            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                                <div class="bg-gray-50 dark:bg-black/20 rounded-xl p-4">
                                    <p class="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1">Status</p>
                                    <span class="px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider"
                                        :class="activeVehicleProfile.status === 'Active' ? 'bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-500' : 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-500'">
                                        {{ activeVehicleProfile.status }}
                                    </span>
                                </div>
                                <div class="bg-gray-50 dark:bg-black/20 rounded-xl p-4">
                                    <p class="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1">Model /
                                        Year</p>
                                    <p class="text-sm font-bold text-gray-900 dark:text-white">{{ activeVehicleProfile.model
                                    }} ({{ activeVehicleProfile.year }})</p>
                                </div>
                                <div class="bg-gray-50 dark:bg-black/20 rounded-xl p-4">
                                    <p class="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1">Current
                                        Odometer</p>
                                    <p class="text-sm font-bold text-gray-900 dark:text-white">{{
                                        activeVehicleProfile.mileage.toLocaleString() }} mi</p>
                                </div>
                                <div class="bg-gray-50 dark:bg-black/20 rounded-xl p-4">
                                    <p class="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1">Assigned
                                        Driver</p>
                                    <p class="text-sm font-bold text-gray-900 dark:text-white">{{
                                        activeVehicleProfile.driver }}</p>
                                </div>
                            </div>


                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <!-- Left: Spec & Metrics -->
                                <div>
                                    <h4 class="font-bold text-gray-900 dark:text-white mb-3">Vehicle Metrics</h4>
                                    <div class="space-y-3">
                                        <div
                                            class="flex justify-between text-sm py-2 border-b border-gray-100 dark:border-white/5">
                                            <span class="text-gray-500">License Plate</span>
                                            <span class="font-medium text-gray-900 dark:text-white">{{
                                                activeVehicleProfile.licensePlate }}</span>
                                        </div>
                                        <div
                                            class="flex justify-between text-sm py-2 border-b border-gray-100 dark:border-white/5">
                                            <span class="text-gray-500">Vehicle Type</span>
                                            <span class="font-medium text-gray-900 dark:text-white">{{
                                                activeVehicleProfile.type }}</span>
                                        </div>
                                        <div
                                            class="flex justify-between text-sm py-2 border-b border-gray-100 dark:border-white/5">
                                            <span class="text-gray-500">Avg Fuel Efficiency</span>
                                            <span class="font-medium text-gray-900 dark:text-white">{{
                                                activeVehicleProfile.fuelEfficiency }}</span>
                                        </div>
                                        <div
                                            class="flex justify-between text-sm py-2 border-b border-gray-100 dark:border-white/5">
                                            <span class="text-gray-500">Total Repair Expense</span>
                                            <span class="font-medium text-gray-900 dark:text-white">
                                                ${{ activeVehicleProfile.totalMaintenanceCost.toLocaleString() }} (YTD)
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <!-- Right: Service Logs -->
                                <div>
                                    <div class="flex justify-between items-center mb-3">
                                        <h4 class="font-bold text-gray-900 dark:text-white">Recent Service</h4>
                                        <span class="text-xs text-primary font-bold">Next: {{
                                            activeVehicleProfile.nextService }}</span>
                                    </div>
                                    <div class="space-y-3">
                                        <div v-for="log in activeVehicleProfile.serviceHistory.slice(0, 2)" :key="log.id" class="p-3 border border-gray-200 dark:border-white/10 rounded-lg">
                                            <div class="flex justify-between items-center mb-1">
                                                <span class="text-sm font-bold text-gray-900 dark:text-white">{{ log.service }}</span>
                                                <span class="text-xs text-gray-500">{{ log.date }}</span>
                                            </div>
                                            <div class="flex justify-between items-center">
                                                <span
                                                    class="text-xs bg-gray-100 dark:bg-white/10 px-2 py-0.5 rounded text-gray-600 dark:text-gray-300">{{ log.type }}</span>
                                                <span class="text-xs font-mono font-bold text-gray-900 dark:text-white">${{ log.cost }}</span>
                                            </div>
                                        </div>
                                        <button @click="activeVehicleProfile.viewMode = 'history'" class="w-full text-center text-xs text-primary hover:underline mt-2">View Full History</button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- History Mode View -->
                        <div v-else-if="activeVehicleProfile.viewMode === 'history'" class="flex flex-col h-full">
                            <div class="flex items-center justify-between mb-4">
                                <h4 class="font-bold text-gray-900 dark:text-white">Full Service Ledger</h4>
                                <div class="bg-gray-100 dark:bg-white/5 px-3 py-1 rounded-lg">
                                    <span class="text-xs text-gray-500 uppercase font-bold mr-2">Total Cost</span>
                                    <span class="font-mono font-bold text-gray-900 dark:text-white">${{ activeVehicleProfile.totalMaintenanceCost.toLocaleString() }}</span>
                                </div>
                            </div>
                            
                            <div class="overflow-y-auto max-h-[400px] border rounded-lg border-gray-200 dark:border-white/10">
                                <table class="w-full text-left text-sm">
                                    <thead class="bg-gray-50 dark:bg-white/5 sticky top-0 backdrop-blur-md">
                                        <tr class="text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-white/10 uppercase tracking-wider text-[10px]">
                                            <th class="py-2 px-3 font-medium">Date</th>
                                            <th class="py-2 px-3 font-medium">Service Performed</th>
                                            <th class="py-2 px-3 font-medium">Description</th>
                                            <th class="py-2 px-3 font-medium text-right">Cost</th>
                                        </tr>
                                    </thead>
                                    <tbody class="divide-y divide-gray-100 dark:divide-white/5">
                                        <tr v-for="item in activeVehicleProfile.serviceHistory" :key="item.id" class="hover:bg-gray-50 dark:hover:bg-white/5">
                                            <td class="py-3 px-3 text-gray-600 dark:text-gray-300 font-mono text-xs">{{ item.date }}</td>
                                            <td class="py-3 px-3 text-gray-900 dark:text-white font-medium">{{ item.service }}</td>
                                            <td class="py-3 px-3">
                                                <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider" 
                                                    :class="item.type === 'Routine' ? 'bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-500' : 'bg-yellow-50 text-yellow-600 dark:bg-yellow-500/10 dark:text-yellow-500'">
                                                    {{ item.type }}
                                                </span>
                                            </td>
                                            <td class="py-3 px-3 text-right text-gray-900 dark:text-white font-mono font-bold">${{ item.cost.toFixed(2) }}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            
                            <button @click="activeVehicleProfile.viewMode = 'full'" class="mt-4 flex items-center gap-2 text-primary hover:underline text-sm font-medium">
                                <span class="material-symbols-outlined text-sm">arrow_back</span> Back to Overview
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Teleport>

        <!-- Document Viewer Modal -->
        <Teleport to="body">
            <div v-if="activeDoc"
                class="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                @click.self="closeDocModal">
                <div class="bg-white dark:bg-card-dark w-full max-w-3xl rounded-2xl shadow-2xl border border-gray-200 dark:border-white/10 overflow-hidden flex flex-col h-[80vh]">
                    <div class="px-6 py-4 border-b border-gray-200 dark:border-white/5 flex justify-between items-center bg-gray-50 dark:bg-white/5">
                        <div class="flex items-center gap-3">
                            <span class="material-symbols-outlined text-primary">description</span>
                            <div>
                                <h3 class="text-lg font-bold text-gray-900 dark:text-white">{{ activeDoc.type }}</h3>
                                <p class="text-xs text-gray-500">
                                    {{ activeDoc.vehicleId ? `Vehicle: ${activeDoc.vehicleId}` : `Driver: ${activeDoc.driver}` }}
                                </p>
                            </div>
                        </div>
                        <button @click="closeDocModal"
                            class="text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors">
                            <span class="material-symbols-outlined">close</span>
                        </button>
                    </div>
                    
                    <div class="flex-1 bg-gray-100 dark:bg-black/50 overflow-hidden relative flex items-center justify-center p-4">
                        <!-- Mock Doc Viewer -->
                        <div class="bg-white shadow-lg p-2 max-h-full overflow-y-auto">
                            <img :src="activeDoc.url" class="max-w-full object-contain" alt="Document Preview"/>
                        </div>
                        <div class="absolute bottom-6 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full text-white text-sm flex gap-4">
                            <button @click="downloadDoc(activeDoc)" class="hover:text-primary transition-colors flex items-center gap-1"><span class="material-symbols-outlined text-[16px]">download</span> Download</button>
                            <span class="w-px h-4 bg-white/20 my-auto"></span>
                            <button @click="printDoc(activeDoc)" class="hover:text-primary transition-colors flex items-center gap-1"><span class="material-symbols-outlined text-[16px]">print</span> Print</button>
                            <span class="w-px h-4 bg-white/20 my-auto"></span>
                            <button @click="openShareModal" class="hover:text-primary transition-colors flex items-center gap-1" ref="shareButton"><span class="material-symbols-outlined text-[16px]">share</span> Share</button>
                        
                            <!-- Share Popover -->
                            <div v-if="isShareModalOpen" class="absolute bottom-12 right-0 bg-white dark:bg-card-dark border border-gray-200 dark:border-white/10 rounded-xl shadow-xl w-72 overflow-hidden animate-fade-in-up z-[130]">
                                <div class="p-3 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-gray-50 dark:bg-white/5">
                                    <h4 class="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">Share Document</h4>
                                    <button @click.stop="isShareModalOpen = false" class="text-gray-400 hover:text-gray-900 dark:hover:text-white"><span class="material-symbols-outlined text-sm">close</span></button>
                                </div>
                                <div v-if="shareStep === 'select'" class="p-2 grid grid-cols-1 gap-1">
                                    <button @click="shareVia('whatsapp')" class="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg transition-colors text-left group">
                                        <div class="w-8 h-8 rounded-full bg-[#25D366]/10 flex items-center justify-center text-[#25D366]"><span class="material-symbols-outlined text-lg">chat</span></div>
                                        <div>
                                            <p class="text-sm font-medium text-gray-900 dark:text-white group-hover:text-[#25D366]">WhatsApp</p>
                                            <p class="text-[10px] text-gray-500">Share via link</p>
                                        </div>
                                    </button>
                                    <button @click="shareVia('telegram')" class="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg transition-colors text-left group">
                                        <div class="w-8 h-8 rounded-full bg-[#0088cc]/10 flex items-center justify-center text-[#0088cc]"><span class="material-symbols-outlined text-lg">send</span></div>
                                        <div>
                                            <p class="text-sm font-medium text-gray-900 dark:text-white group-hover:text-[#0088cc]">Telegram</p>
                                            <p class="text-[10px] text-gray-500">Share via message</p>
                                        </div>
                                    </button>
                                    <button @click="shareVia('cargocore')" class="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg transition-colors text-left group">
                                        <div class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary"><span class="material-symbols-outlined text-lg">local_shipping</span></div>
                                        <div>
                                            <p class="text-sm font-medium text-gray-900 dark:text-white group-hover:text-primary">CargoCore Messenger</p>
                                            <p class="text-[10px] text-gray-500">Internal secure share</p>
                                        </div>
                                    </button>
                                </div>

                                <!-- CargoCore Share Form -->
                                <div v-if="shareStep === 'form'" class="p-4 space-y-3">
                                    <div class="bg-primary/5 rounded-lg p-2 flex items-center gap-2 border border-primary/10">
                                        <span class="material-symbols-outlined text-primary text-sm">picture_as_pdf</span>
                                        <span class="text-xs font-medium text-gray-700 dark:text-gray-300 truncate max-w-[150px]">{{ activeDoc.type }}.pdf</span>
                                    </div>
                                    
                                    <div>
                                        <label class="block text-[10px] font-bold text-gray-500 uppercase mb-1">Assigned Warehouse</label>
                                        <div class="w-full text-xs bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded px-2 py-2 text-gray-500 dark:text-gray-400 font-mono">
                                            {{ store.hubs.find(h => h.id === shareFormData.hubId)?.name || 'Unknown Hub' }}
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label class="block text-[10px] font-bold text-gray-500 uppercase mb-1">Recipient Role</label>
                                        <div class="flex gap-2">
                                            <button @click="shareFormData.role = 'dispatcher'" 
                                                class="flex-1 py-1.5 text-xs rounded border transition-colors font-medium"
                                                :class="shareFormData.role === 'dispatcher' ? 'bg-primary text-white border-primary' : 'bg-white dark:bg-transparent border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:bg-gray-50'">
                                                Dispatcher
                                            </button>
                                            <button @click="shareFormData.role = 'manager'" 
                                                class="flex-1 py-1.5 text-xs rounded border transition-colors font-medium"
                                                :class="shareFormData.role === 'manager' ? 'bg-primary text-white border-primary' : 'bg-white dark:bg-transparent border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:bg-gray-50'">
                                                Manager
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label class="block text-[10px] font-bold text-gray-500 uppercase mb-1">Message (Optional)</label>
                                        <textarea v-model="shareFormData.message" rows="2" placeholder="Add a note..." class="w-full text-xs bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded px-2 py-1.5 focus:border-primary focus:outline-none text-gray-900 dark:text-white resize-none"></textarea>
                                    </div>

                                    <button @click="submitShare" class="w-full bg-primary hover:bg-primary/90 text-white text-xs font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-2">
                                        <span class="material-symbols-outlined text-sm">send</span> Send Document
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="px-6 py-4 border-t border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-white/5 grid grid-cols-3 gap-4">
                        <div>
                            <p class="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Expiry Date</p>
                            <p class="text-sm font-medium text-gray-900 dark:text-white">{{ activeDoc.expiry }}</p>
                        </div>
                        <div>
                            <p class="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Status</p>
                            <p class="text-sm font-bold" :class="activeDoc.status === 'Active' ? 'text-green-600' : 'text-red-500'">{{ activeDoc.status }}</p>
                        </div>
                         <div>
                            <p class="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Verified By</p>
                            <p class="text-sm font-medium text-gray-900 dark:text-white">Admin System (Auto)</p>
                        </div>
                    </div>
                </div>
            </div>
        </Teleport>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useLogisticStore } from '@/stores/logisticStore'
import { storeToRefs } from 'pinia'

const store = useLogisticStore()
const { filteredTopDrivers, filteredMaintenance, filteredVehicles } = storeToRefs(store)

const fuelLogs = ref([
    { id: 101, date: 'Oct 24, 2023', vehicleId: 'TRK-992', station: 'Shell #492', gallons: 45.2, cost: 174.02, alert: false },
    { id: 102, date: 'Oct 24, 2023', vehicleId: 'VAN-104', station: 'BP Station', gallons: 18.5, cost: 68.45, alert: false },
    { id: 103, date: 'Oct 23, 2023', vehicleId: 'TRK-221', station: 'Exxon Mobile', gallons: 52.0, cost: 210.50, alert: true }, // High cost alert
    { id: 104, date: 'Oct 22, 2023', vehicleId: 'VAN-882', station: 'Shell #492', gallons: 14.2, cost: 54.67, alert: false },
    { id: 105, date: 'Oct 21, 2023', vehicleId: 'TRK-992', station: 'Chevron', gallons: 44.8, cost: 172.48, alert: false },
])

const vehicleDocs = ref([
    { id: 'DOC-V1', vehicleId: 'TRK-992', hubId: 1, type: 'Insurance Policy', status: 'Active', expiry: 'Dec 31, 2024', lastRenewed: 'Jan 01, 2024', url: 'https://via.placeholder.com/400x500?text=Insurance+Policy' },
    { id: 'DOC-V2', vehicleId: 'TRK-992', hubId: 1, type: 'Vehicle Registration', status: 'Active', expiry: 'Nov 15, 2024', lastRenewed: 'Nov 15, 2023', url: 'https://via.placeholder.com/400x500?text=Registration' },
    { id: 'DOC-V3', vehicleId: 'VAN-104', hubId: 1, type: 'Insurance Policy', status: 'Expiring Soon', expiry: 'Oct 30, 2023', lastRenewed: 'Oct 30, 2022', url: 'https://via.placeholder.com/400x500?text=Insurance+Van' },
    { id: 'DOC-V4', vehicleId: 'VAN-104', hubId: 1, type: 'Emission Cart', status: 'Active', expiry: 'Jun 10, 2025', lastRenewed: 'Jun 10, 2023', url: 'https://via.placeholder.com/400x500?text=Emission+Cert' },
    { id: 'DOC-V5', vehicleId: 'TRK-221', hubId: 2, type: 'Insurance Policy', status: 'Active', expiry: 'Jan 15, 2025', lastRenewed: 'Jan 15, 2024', url: 'https://via.placeholder.com/400x500?text=Insurance+TRK221' },
])

const driverDocs = ref([
    { id: 'DOC-D1', driver: 'David Miller', driverId: 'D001', hubId: 1, type: 'Commercial License (CDL)', licenseNo: 'DL-992812', status: 'Active', expiry: 'Aug 12, 2025', joined: 'Mar 10, 2021', url: 'https://via.placeholder.com/400x500?text=CDL+David' },
    { id: 'DOC-D1-2', driver: 'David Miller', driverId: 'D001', hubId: 1, type: 'Medical Certificate', licenseNo: 'MED-552', status: 'Active', expiry: 'Sep 10, 2024', joined: 'Mar 10, 2021', url: 'https://via.placeholder.com/400x500?text=Medical+Results' },
    { id: 'DOC-D2', driver: 'Sarah Jenkins', driverId: 'D002', hubId: 2, type: 'Commercial License (CDL)', licenseNo: 'DL-441299', status: 'Active', expiry: 'Dec 05, 2024', joined: 'Jul 22, 2020', url: 'https://via.placeholder.com/400x500?text=CDL+Sarah' },
    { id: 'DOC-D3', driver: 'Mike Ross', driverId: 'D003', hubId: 2, type: 'Hazardous Material Cert', licenseNo: 'HM-112', status: 'Expired', expiry: 'Sep 20, 2023', joined: 'Jan 15, 2022', url: 'https://via.placeholder.com/400x500?text=HazMat+Cert' },
])

const tabs = ['Active Drivers', 'Fleet Vehicles', 'Fuel Logs', 'Vehicle Documents', 'Driver Documents', 'Live Locations']
const activeTab = ref('Active Drivers')
const activeDropdown = ref(null)
const searchQuery = ref('') // Search State

// Vehicle Management state
const isVehicleModalOpen = ref(false)
const vehicleModalMode = ref('add') // 'add' or 'edit'
const vehicleFormData = ref({})

// Document Viewing State
const activeDoc = ref(null)
const expandedDocs = ref([]) // IDs of expanded rows

// Share Modal State
const isShareModalOpen = ref(false)
const shareStep = ref('select') // 'select' or 'form'
const shareFormData = ref({
    activeDocId: null,
    hubId: store.activeWarehouse === 'all' ? 1 : store.activeWarehouse,
    role: 'dispatcher', // dispatcher or manager
    message: ''
})

// Profile Viewers state
const activeDriverProfile = ref(null)
const activeVehicleProfile = ref(null)
const chatInput = ref('')

// Computed properties for Search & Grouping
const searchedDrivers = computed(() => {
    const q = searchQuery.value.toLowerCase()
    return store.filteredDrivers.filter(d => 
        !q || 
        d.name.toLowerCase().includes(q) || 
        d.vehicle.toLowerCase().includes(q) || 
        d.currentJob.toLowerCase().includes(q) ||
        d.status.toLowerCase().includes(q)
    )
})

const searchedTopDrivers = computed(() => {
    const q = searchQuery.value.toLowerCase()
    return filteredTopDrivers.value.filter(d => !q || d.name.toLowerCase().includes(q))
})

const searchedVehicles = computed(() => {
    const q = searchQuery.value.toLowerCase()
    return store.filteredVehicles.filter(v => 
        !q || 
        v.id.toLowerCase().includes(q) || 
        v.type.toLowerCase().includes(q) || 
        v.model.toLowerCase().includes(q) ||
        v.driver.toLowerCase().includes(q) ||
        v.status.toLowerCase().includes(q)
    )
})

const searchedMaintenance = computed(() => {
    const q = searchQuery.value.toLowerCase()
    return filteredMaintenance.value.filter(m => 
        !q || 
        m.id.toLowerCase().includes(q) || 
        m.issue.toLowerCase().includes(q) || 
        m.status.toLowerCase().includes(q)
    )
})

const searchedFuelLogs = computed(() => {
    const q = searchQuery.value.toLowerCase()
    return fuelLogs.value.filter(l => 
        (store.activeWarehouse === 'all' || l.hubId === store.activeWarehouse) &&
        (!q || 
        l.vehicleId.toLowerCase().includes(q) || 
        l.station.toLowerCase().includes(q) || 
        l.date.toLowerCase().includes(q))
    )
})

const fuelStats = computed(() => {
    // These stats react to searchedFuelLogs (so they update with search and warehouse filter)
    const logs = searchedFuelLogs.value
    if (logs.length === 0) return { totalCost: 0, totalVolume: 0, avgPrice: 0, efficiency: 0 }

    const totalCost = logs.reduce((sum, log) => sum + log.cost, 0)
    const totalVolume = logs.reduce((sum, log) => sum + log.gallons, 0)
    const avgPrice = totalVolume > 0 ? (totalCost / totalVolume).toFixed(2) : 0
    
    return {
        totalCost: totalCost,
        totalVolume: totalVolume,
        avgPrice: avgPrice,
        efficiency: 78 // Mock efficiency, in real app calculate mpg
    }
})

const groupedVehicleDocs = computed(() => {
    // 1. Filter by active warehouse
    let docs = vehicleDocs.value
    if (store.activeWarehouse !== 'all') {
        docs = docs.filter(d => d.hubId === store.activeWarehouse)
    }
    
    // 2. Filter by Search
    if (searchQuery.value) {
        const q = searchQuery.value.toLowerCase()
        docs = docs.filter(d => 
            d.vehicleId.toLowerCase().includes(q) || 
            d.type.toLowerCase().includes(q) || 
            d.status.toLowerCase().includes(q)
        )
    }
    
    // 3. Group by Vehicle ID
    const groups = {}
    docs.forEach(doc => {
        if (!groups[doc.vehicleId]) {
            groups[doc.vehicleId] = []
        }
        groups[doc.vehicleId].push(doc)
    })
    return groups
})

const groupedDriverDocs = computed(() => {
    // 1. Filter by active warehouse
    let docs = driverDocs.value
    if (store.activeWarehouse !== 'all') {
        docs = docs.filter(d => d.hubId === store.activeWarehouse)
    }

    // 2. Filter by Search
    if (searchQuery.value) {
        const q = searchQuery.value.toLowerCase()
        docs = docs.filter(d => 
            d.driver.toLowerCase().includes(q) || 
            d.type.toLowerCase().includes(q) || 
            d.licenseNo.toLowerCase().includes(q) ||
            d.status.toLowerCase().includes(q)
        )
    }

    // 3. Group by Driver Name/ID
    const groups = {}
    docs.forEach(doc => {
        if (!groups[doc.driverId]) {
            groups[doc.driverId] = {
                id: doc.driverId,
                name: doc.driver,
                docs: []
            }
        }
        groups[doc.driverId].docs.push(doc)
    })
    return Object.values(groups)
})

const vehicleLocationData = computed(() => {
    const data = filteredVehicles.value.map(vehicle => {
        // Find assigned driver from store.drivers (we use store.filteredDrivers but need to ensure we catch all if needed, 
        // though filteredDrivers fits the current view context)
        const driver = store.drivers.find(d => d.name === vehicle.driver)
        
        // Find driver license from local driverDocs
        let licenseNo = 'N/A'
        if (driver) {
            const doc = driverDocs.value.find(d => d.driverId === driver.id && d.type.includes('License'))
            if (doc) licenseNo = doc.licenseNo
        }

        return {
            ...vehicle,
            driverId: driver ? driver.id : null,
            licenseNo: licenseNo,
            currentLocation: driver ? driver.location : 'Depot (Parked)',
            currentJob: driver ? driver.currentJob : 'Idle',
            speed: driver && driver.status === 'active' ? `${Math.floor(Math.random() * 30 + 35)} mph` : '0 mph',
            gps: driver ? `${34.0522 + (Math.random() * 0.1)}, -118.2437` : '34.0522, -118.2437', // Mock LA coords
            lastUpdate: 'Just now'
        }
    })

    // Search Filter for Locations
    const q = searchQuery.value.toLowerCase()
    if (!q) return data

    return data.filter(v => 
        v.id.toLowerCase().includes(q) || 
        v.type.toLowerCase().includes(q) || 
        v.licensePlate.toLowerCase().includes(q) || 
        v.driver.toLowerCase().includes(q) || 
        (v.driverId && v.driverId.toLowerCase().includes(q)) || 
        v.currentLocation.toLowerCase().includes(q) ||
        v.currentJob.toLowerCase().includes(q)
    )
})

// Report & Doc Actions
const generateMaintenanceReport = () => {
    // Generate PDF/CSV
    window.alert('Generating fleet maintenance report... Check downloads shortly.')
}

const downloadDoc = (doc) => {
    window.alert(`Starting download for ${doc.type}.pdf...`)
}

const printDoc = (doc) => {
    window.print()
}

const openShareModal = () => {
    isShareModalOpen.value = !isShareModalOpen.value
    // Reset form if opening fresh
    if (isShareModalOpen.value) {
        shareStep.value = 'select'
        shareFormData.value = {
            activeDocId: activeDoc.value.id,
            hubId: activeDoc.value.hubId || (store.activeWarehouse === 'all' ? 1 : store.activeWarehouse),
            role: 'dispatcher',
            message: `Please review attached ${activeDoc.value.type} for ${activeDoc.value.vehicleId || activeDoc.value.driver}.`
        }
    }
}

const shareVia = (platform) => {
    if (platform === 'whatsapp') {
        window.open(`https://wa.me/?text=Check this document: ${activeDoc.value.url}`, '_blank')
        isShareModalOpen.value = false
    } else if (platform === 'telegram') {
        window.open(`https://t.me/share/url?url=${activeDoc.value.url}&text=Check this document`, '_blank')
        isShareModalOpen.value = false
    } else if (platform === 'cargocore') {
        shareStep.value = 'form'
    }
}

const submitShare = () => {
    // Mock API call to internal messaging system
    console.log('Sending CargoCore Message:', {
        docId: shareFormData.value.activeDocId,
        hubId: shareFormData.value.hubId,
        role: shareFormData.value.role,
        message: shareFormData.value.message
    })
    
    // Simulate success
    window.alert(`Document sent to ${shareFormData.value.role === 'dispatcher' ? 'Dispatch Team' : 'Warehouse Manager'} successfully!`)
    isShareModalOpen.value = false
}

// Dropdowns logic
const toggleVehicleDropdown = (id) => {
    activeDropdown.value = activeDropdown.value === id ? null : id
}

const toggleDocExpand = (id) => {
    if (expandedDocs.value.includes(id)) {
        expandedDocs.value = expandedDocs.value.filter(e => e !== id)
    } else {
        expandedDocs.value.push(id)
    }
}

const openDocModal = (doc) => {
    activeDoc.value = doc
}

const closeDocModal = () => {
    activeDoc.value = null
}

const closeDropdowns = () => {
    activeDropdown.value = null
}

onMounted(() => {
    document.addEventListener('click', closeDropdowns)
})

onUnmounted(() => {
    document.removeEventListener('click', closeDropdowns)
})

// Vehicle form helpers
const openVehicleModal = (mode, vehicle = null) => {
    vehicleModalMode.value = mode
    if (mode === 'edit' && vehicle) {
        vehicleFormData.value = { ...vehicle }
    } else {
        vehicleFormData.value = {
            id: `VH-${Math.floor(Math.random() * 9000) + 1000}`,
            licensePlate: '',
            model: '',
            type: 'Delivery Van',
            hubId: store.activeWarehouse === 'all' ? 1 : store.activeWarehouse,
            year: new Date().getFullYear()
        }
    }
    isVehicleModalOpen.value = true
}

const closeVehicleModal = () => {
    isVehicleModalOpen.value = false
    vehicleFormData.value = {}
}

const submitVehicle = () => {
    if (vehicleModalMode.value === 'add') {
        store.addVehicle({ ...vehicleFormData.value })
    } else {
        // Mock update handler
        // store.updateVehicle({...})
    }
    closeVehicleModal()
}

// Profiles logic
const openDriverProfile = (driver) => {
    // Hydrate missing fields if opening from Top Leaderboard (which has partial data)
    if (!driver.chatHistory) {
        activeDriverProfile.value = {
            ...driver,
            id: driver.id || `D-${Math.floor(Math.random() * 1000)}`,
            phone: '+1 (555) 000-0000',
            status: 'active',
            efficiency: 98,
            vehicle: 'Company Fleet',
            currentJob: 'Top Performer Route',
            location: 'On Route',
            avatarColor: 'bg-blue-600', // Fallback for modal
            chatHistory: [
                { id: 1, text: 'Great job on the metrics this week!', sender: 'dispatch', time: '08:00 AM' },
                { id: 2, text: 'Thanks! aiming for 100% on-time.', sender: 'driver', time: '08:05 AM' }
            ]
        }
    } else {
        activeDriverProfile.value = driver
    }
}
const closeDriverProfile = () => {
    activeDriverProfile.value = null
    chatInput.value = ''
}
const sendChat = () => {
    if (!chatInput.value.trim() || !activeDriverProfile.value) return
    store.sendMessageToDriver(activeDriverProfile.value.id, chatInput.value)
    chatInput.value = ''
}

const openVehicleProfile = (vehicle, viewMode = 'full') => {
    // Generate mock history if not present on vehicle object
    const history = [
        { id: 1, service: 'Full Synthetic Oil Change', date: 'Oct 02, 2023', type: 'Routine', cost: 120 },
        { id: 2, service: 'Tire Rotation & Alignment', date: 'Aug 15, 2023', type: 'Routine', cost: 85 },
        { id: 3, service: 'Brake Pad Replacement', date: 'May 10, 2023', type: 'Repair', cost: 320 },
        { id: 4, service: 'Annual Inspection', date: 'Jan 12, 2023', type: 'Compliance', cost: 150 }
    ]

    activeVehicleProfile.value = { 
        ...vehicle, 
        viewMode: viewMode,
        serviceHistory: history,
        totalMaintenanceCost: history.reduce((sum, item) => sum + item.cost, 0)
    }
}
const closeVehicleProfile = () => {
    activeVehicleProfile.value = null
}
</script>
