<template>
    <div class="space-y-6">
        <div class="flex justify-between items-center">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Fleet & Drivers Overview</h2>
            <div class="flex gap-3">
                <button
                    class="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium dark:bg-white/5 dark:hover:bg-white/10 dark:text-white border border-gray-200 dark:border-white/10 py-2 px-4 rounded-lg transition-colors shadow-sm">Maintenance
                    Report</button>
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

        <!-- Role Filter Tabs -->
        <div class="flex gap-4 border-b border-gray-200 dark:border-white/10 pb-1">
            <button v-for="tab in tabs" :key="tab" class="px-4 py-2 text-sm font-medium transition-colors relative"
                :class="activeTab === tab ? 'text-primary' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'"
                @click="activeTab = tab">
                {{ tab }}
                <div v-if="activeTab === tab"
                    class="absolute bottom-[-5px] left-0 w-full h-1 bg-primary rounded-t-full"></div>
            </button>
        </div>

        <!-- Tab Content: Active Drivers -->
        <div v-if="activeTab === 'Active Drivers'" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Driver Scorecard -->
            <div class="glass-panel rounded-xl p-6">
                <h3 class="font-bold text-gray-900 dark:text-white mb-4">Driver Roster & Performance</h3>
                <div class="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                    <div v-for="driver in store.filteredDrivers" :key="driver.id" @click="openDriverProfile(driver)"
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
                            <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {{ driver.vehicle }} • {{ driver.currentJob || 'Standby' }}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Top Driver Stats -->
            <div class="glass-panel rounded-xl p-6">
                <h3 class="font-bold text-gray-900 dark:text-white mb-4">Top Leaderboard</h3>
                <div class="space-y-4">
                    <div v-for="driver in filteredTopDrivers" :key="driver.id"
                        class="flex items-center gap-4 p-3 rounded-lg bg-gray-50 border border-transparent hover:border-gray-200 dark:bg-white/5 dark:hover:bg-white/10 transition-colors shadow-sm group">
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
        <div v-if="activeTab === 'Fleet Vehicles'" class="grid grid-cols-1 gap-6">
            <div class="glass-panel rounded-xl p-6 relative overflow-hidden flex flex-col">
                <h3 class="font-bold text-gray-900 dark:text-white mb-4">Vehicle Roster</h3>
                <div class="overflow-x-auto">
                    <table class="w-full text-left text-sm">
                        <thead class="bg-gray-50 dark:bg-transparent">
                            <tr
                                class="text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-white/10 uppercase tracking-wider text-[10px]">
                                <th class="py-2 px-2 font-medium">Vehicle ID</th>
                                <th class="py-2 font-medium">Type / Model</th>
                                <th class="py-2 font-medium">Driver</th>
                                <th class="py-2 font-medium">Mileage</th>
                                <th class="py-2 font-medium text-right">Status</th>
                                <th class="py-2 px-2 text-right"></th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-100 dark:divide-white/5">
                            <tr v-for="vehicle in store.filteredVehicles" :key="vehicle.id"
                                @click.stop="openVehicleProfile(vehicle)"
                                class="group hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer relative">
                                <td class="py-3 px-2 text-gray-700 dark:text-white font-mono font-medium">{{ vehicle.id
                                }}<br /><span class="text-[10px] text-gray-500">{{ vehicle.licensePlate }}</span>
                                </td>
                                <td class="py-3 text-gray-600 dark:text-gray-300">{{ vehicle.type }}<br /><span
                                        class="text-xs text-gray-400">{{ vehicle.model }} ({{ vehicle.year }})</span>
                                </td>
                                <td class="py-3 text-gray-600 dark:text-gray-300 font-medium">{{ vehicle.driver }}</td>
                                <td class="py-3 text-gray-600 dark:text-gray-300">{{ vehicle.mileage.toLocaleString() }}
                                    mi</td>
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
            <div class="glass-panel rounded-xl p-6 relative overflow-hidden flex flex-col">
                <div class="absolute top-0 right-0 p-6 opacity-5 dark:opacity-10 pointer-events-none"><span
                        class="material-symbols-outlined text-6xl text-gray-900 dark:text-white">build</span></div>
                <h3 class="font-bold text-gray-900 dark:text-white mb-4">Pending Maintenance</h3>
                <div class="overflow-x-auto">
                    <table class="w-full text-left text-sm">
                        <thead class="bg-gray-50 dark:bg-transparent">
                            <tr
                                class="text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-white/10 uppercase tracking-wider text-[10px]">
                                <th class="py-2 px-2 font-medium">Vehicle ID</th>
                                <th class="py-2 font-medium">Issue</th>
                                <th class="py-2 text-right font-medium">Status</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-100 dark:divide-white/5">
                            <tr v-for="issue in filteredMaintenance" :key="issue.id"
                                class="group hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                <td class="py-3 px-2 text-gray-700 dark:text-white font-mono font-medium">{{ issue.id }}
                                </td>
                                <td class="py-3 text-gray-600 dark:text-gray-300">{{ issue.issue }}</td>
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
        <div v-if="activeTab === 'Fuel Logs'" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Fuel Stats Summary -->
            <div class="glass-panel rounded-xl p-6 lg:col-span-1 border border-gray-200 dark:border-white/5">
                <h3 class="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <span class="material-symbols-outlined text-orange-500">local_gas_station</span>
                    Fuel Consumption
                </h3>
                <div class="space-y-4">
                    <div class="bg-orange-50 dark:bg-orange-500/10 p-4 rounded-xl border border-orange-100 dark:border-orange-500/20">
                        <p class="text-xs text-orange-600 dark:text-orange-400 uppercase font-bold tracking-wider mb-1">Total Cost (This Month)</p>
                        <p class="text-2xl font-bold text-gray-900 dark:text-white">$12,450.00</p>
                        <p class="text-xs text-orange-600/80 mt-1">↑ 2.4% vs last month</p>
                    </div>
                     <div class="grid grid-cols-2 gap-4">
                        <div class="bg-gray-50 dark:bg-white/5 p-4 rounded-xl">
                            <p class="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1">Avg Price/Gal</p>
                            <p class="text-lg font-bold text-gray-900 dark:text-white">$3.85</p>
                        </div>
                        <div class="bg-gray-50 dark:bg-white/5 p-4 rounded-xl">
                            <p class="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1">Total Volume</p>
                            <p class="text-lg font-bold text-gray-900 dark:text-white">3,233 gal</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Recent Transactions Table -->
            <div class="glass-panel rounded-xl p-6 lg:col-span-2 border border-gray-200 dark:border-white/5">
                <h3 class="font-bold text-gray-900 dark:text-white mb-4">Recent Refueling Logs</h3>
                <div class="overflow-x-auto">
                    <table class="w-full text-left text-sm">
                        <thead class="bg-gray-50 dark:bg-transparent">
                            <tr class="text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-white/10 uppercase tracking-wider text-[10px]">
                                <th class="py-2 px-2 font-medium">Date</th>
                                <th class="py-2 font-medium">Vehicle</th>
                                <th class="py-2 font-medium">Station</th>
                                <th class="py-2 font-medium text-right">Gallons</th>
                                <th class="py-2 font-medium text-right">Cost</th>
                                <th class="py-2 font-medium text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-100 dark:divide-white/5">
                            <tr v-for="log in fuelLogs" :key="log.id" class="group hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                <td class="py-3 px-2 text-gray-600 dark:text-gray-300 font-mono">{{ log.date }}</td>
                                <td class="py-3 text-gray-900 dark:text-white font-medium">{{ log.vehicleId }}</td>
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
                            <div class="w-16 h-16 rounded-full flex items-center justify-center font-bold text-whit text-2xl shadow-sm"
                                :class="activeDriverProfile.avatarColor">
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
                                        <span class="font-medium text-gray-900 dark:text-white">$4,250 (YTD)</span>
                                    </div>
                                </div>
                            </div>

                            <!-- Right: Service Logs -->
                            <div>
                                <div class="flex justify-between items-center mb-3">
                                    <h4 class="font-bold text-gray-900 dark:text-white">Service History</h4>
                                    <span class="text-xs text-primary font-bold">Next: {{
                                        activeVehicleProfile.nextService }}</span>
                                </div>
                                <div class="space-y-3">
                                    <div class="p-3 border border-gray-200 dark:border-white/10 rounded-lg">
                                        <div class="flex justify-between items-center mb-1">
                                            <span class="text-sm font-bold text-gray-900 dark:text-white">Full Synthetic
                                                Oil Change</span>
                                            <span class="text-xs text-gray-500">Oct 02, 2023</span>
                                        </div>
                                        <span
                                            class="text-xs bg-gray-100 dark:bg-white/10 px-2 py-0.5 rounded text-gray-600 dark:text-gray-300">Routine</span>
                                    </div>
                                    <div class="p-3 border border-gray-200 dark:border-white/10 rounded-lg">
                                        <div class="flex justify-between items-center mb-1">
                                            <span class="text-sm font-bold text-gray-900 dark:text-white">Tire Rotation
                                                & Alignment</span>
                                            <span class="text-xs text-gray-500">Aug 15, 2023</span>
                                        </div>
                                        <span
                                            class="text-xs bg-gray-100 dark:bg-white/10 px-2 py-0.5 rounded text-gray-600 dark:text-gray-300">Routine</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Teleport>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
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

const tabs = ['Active Drivers', 'Fleet Vehicles', 'Fuel Logs']
const activeTab = ref('Active Drivers')
const activeDropdown = ref(null)

// Vehicle Management state
const isVehicleModalOpen = ref(false)
const vehicleModalMode = ref('add') // 'add' or 'edit'
const vehicleFormData = ref({})

// Profile Viewers state
const activeDriverProfile = ref(null)
const activeVehicleProfile = ref(null)
const chatInput = ref('')

// Dropdowns logic
const toggleVehicleDropdown = (id) => {
    activeDropdown.value = activeDropdown.value === id ? null : id
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
    activeDriverProfile.value = driver
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

const openVehicleProfile = (vehicle) => {
    activeVehicleProfile.value = vehicle
}
const closeVehicleProfile = () => {
    activeVehicleProfile.value = null
}
</script>
