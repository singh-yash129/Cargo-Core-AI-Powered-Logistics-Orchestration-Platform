<template>
    <div class="space-y-6">
        <!-- Top KPI Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div
                class="glass-panel p-5 rounded-2xl relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
                <div
                    class="absolute -right-6 -top-6 w-24 h-24 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-colors">
                </div>
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <div class="text-sm text-gray-500 dark:text-gray-400 font-medium">Total Orders Today</div>
                        <div class="text-3xl font-bold text-gray-900 dark:text-white mt-1">{{
                            store.dashboardStats.ordersToday.toLocaleString()
                        }}
                        </div>
                    </div>
                    <div class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                        <span class="material-symbols-outlined">shopping_cart</span>
                    </div>
                </div>
                <div class="flex items-center text-sm">
                    <span class="text-primary font-medium flex items-center">
                        <span class="material-symbols-outlined text-[16px] mr-1">trending_up</span>
                        +{{ store.dashboardStats.ordersTrend }}%
                    </span>
                    <span class="text-gray-500 dark:text-gray-400 ml-2">vs yesterday</span>
                </div>
            </div>

            <div
                class="glass-panel p-5 rounded-2xl relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
                <div
                    class="absolute -right-6 -top-6 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-colors">
                </div>
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <div class="text-sm text-gray-500 dark:text-gray-400 font-medium">Active Deliveries</div>
                        <div class="text-3xl font-bold text-gray-900 dark:text-white mt-1">{{
                            store.dashboardStats.activeDeliveries }}
                        </div>
                    </div>
                    <div class="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                        <span class="material-symbols-outlined">local_shipping</span>
                    </div>
                </div>
                <div class="flex items-center text-sm">
                    <span class="text-gray-500 dark:text-gray-400 font-medium">
                        85% On-Time
                    </span>
                    <div class="ml-auto w-24 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div class="h-full bg-blue-500 w-[85%]"></div>
                    </div>
                </div>
            </div>

            <div
                class="glass-panel p-5 rounded-2xl relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
                <div
                    class="absolute -right-6 -top-6 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-colors">
                </div>
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <div class="text-sm text-gray-500 dark:text-gray-400 font-medium">Delivery Success Rate</div>
                        <div class="text-3xl font-bold text-gray-900 dark:text-white mt-1">{{
                            store.dashboardStats.deliverySuccess }}%
                        </div>
                    </div>
                    <div class="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500">
                        <span class="material-symbols-outlined">verified</span>
                    </div>
                </div>
                <div class="flex items-center text-sm">
                    <span class="text-purple-400 font-medium flex items-center">
                        High Perf.
                    </span>
                    <span class="text-gray-500 dark:text-gray-400 ml-2">Consistent</span>
                </div>
            </div>

            <div
                class="glass-panel p-5 rounded-2xl relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
                <div
                    class="absolute -right-6 -top-6 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-colors">
                </div>
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <div class="text-sm text-gray-500 dark:text-gray-400 font-medium">Revenue Today</div>
                        <div class="text-3xl font-bold text-gray-900 dark:text-white mt-1">${{
                            (store.dashboardStats.revenueToday /
                                1000).toFixed(1) }}k</div>
                    </div>
                    <div
                        class="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                        <span class="material-symbols-outlined">payments</span>
                    </div>
                </div>
                <div class="flex items-center text-sm">
                    <span class="text-emerald-400 font-medium flex items-center">
                        <span class="material-symbols-outlined text-[16px] mr-1">trending_up</span>
                        +{{ store.dashboardStats.revenueTrend }}%
                    </span>
                    <span class="text-gray-500 dark:text-gray-400 ml-2">vs target</span>
                </div>
            </div>
        </div>

        <!-- Main Content Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">

            <!-- Live Fleet Map (Takes up 2 columns) -->
            <div class="lg:col-span-2 glass-panel rounded-2xl p-0 overflow-hidden flex flex-col relative group">
                <div class="absolute top-4 left-4 z-10 glass-panel px-3 py-1 rounded-full flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    <span class="text-xs font-semibold text-gray-900 dark:text-white">LIVE FLEET VIEW</span>
                </div>

                <!-- Placeholder for Map -->
                <div
                    class="flex-1 bg-gray-100 dark:bg-gray-800/50 flex items-center justify-center relative bg-[url('/src/assets/map-placeholder.png')] bg-cover bg-center">
                    <div class="absolute inset-0 bg-white/30 dark:bg-background-dark/30 backdrop-blur-[1px]"></div>

                    <!-- Simulated Map Elements -->
                    <div class="absolute top-1/2 left-1/3 transform -translate-x-1/2 -translate-y-1/2">
                        <div class="relative group cursor-pointer"
                            @click="store.openModal('driver-profile', store.drivers[0])">
                            <div class="w-12 h-12 bg-primary/20 rounded-full animate-ping absolute inset-0"></div>
                            <div
                                class="w-12 h-12 bg-white dark:bg-background-dark/80 rounded-full border-2 border-primary flex items-center justify-center relative z-10 shadow-lg">
                                <span class="material-symbols-outlined text-primary">local_shipping</span>
                            </div>
                            <!-- Tooltip -->
                            <div
                                class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-32 bg-white dark:bg-background-dark border border-gray-200 dark:border-white/10 rounded-lg p-2 hidden group-hover:block z-20 shadow-xl">
                                <div class="text-xs font-bold text-gray-900 dark:text-white">{{ store.drivers[0].vehicle
                                    }}</div>
                                <div class="text-[10px] text-gray-500 dark:text-gray-400">Moving • 45 km/h</div>
                            </div>
                        </div>
                    </div>

                    <div class="absolute top-1/3 right-1/4">
                        <div class="relative group cursor-pointer"
                            @click="store.openModal('driver-profile', store.drivers[1])">
                            <div class="w-8 h-8 bg-yellow-500/20 rounded-full absolute inset-0"></div>
                            <div
                                class="w-8 h-8 bg-white dark:bg-background-dark/80 rounded-full border-2 border-yellow-500 flex items-center justify-center relative z-10 shadow-lg">
                                <span
                                    class="material-symbols-outlined text-yellow-500 text-[16px]">local_shipping</span>
                            </div>
                        </div>
                    </div>

                    <div class="text-gray-500 dark:text-gray-500 font-mono text-sm z-0">Iterative Map Component
                        Loading...</div>
                </div>

                <!-- Map Controls Overlay -->
                <div class="absolute bottom-4 right-4 flex flex-col gap-2">
                    <button @click="mapZoomIn"
                        class="w-8 h-8 glass-panel rounded-lg flex items-center justify-center hover:bg-white/10 text-gray-700 dark:text-white transition-colors"><span
                            class="material-symbols-outlined text-[18px]">add</span></button>
                    <button @click="mapZoomOut"
                        class="w-8 h-8 glass-panel rounded-lg flex items-center justify-center hover:bg-white/10 text-gray-700 dark:text-white transition-colors"><span
                            class="material-symbols-outlined text-[18px]">remove</span></button>
                </div>
            </div>

            <!-- Right Panel: Alerts & Bottlenecks -->
            <div class="glass-panel rounded-2xl p-5 flex flex-col h-full">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-bold text-gray-900 dark:text-white flex items-center">
                        <span class="material-symbols-outlined mr-2 text-yellow-500">warning</span>
                        Attention Needed
                    </h3>

                    <!-- Search -->
                    <div class="relative flex items-center">
                        <input v-if="store.isSearchOpen" v-model="store.searchQuery" type="text"
                            placeholder="Search drivers, alerts..."
                            class="w-48 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-1.5 text-xs text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-primary/50 transition-all absolute right-10 shadow-sm"
                            autofocus />
                        <button @click="store.toggleSearch"
                            class="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-white/5 transition-colors text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                            :class="{ 'bg-gray-200 dark:bg-white/10 text-gray-900 dark:text-white': store.isSearchOpen }">
                            <span class="material-symbols-outlined text-[18px]">search</span>
                        </button>
                    </div>
                </div>

                <div class="flex-1 relative">
                    <div class="absolute inset-0 overflow-y-auto pr-1 space-y-3 no-scrollbar">
                        <div v-if="store.alerts.length === 0" class="text-center py-8 text-gray-500 text-sm">
                            No active alerts. Good job!
                        </div>
                        <!-- Alert Item -->
                        <div v-for="alert in store.alerts" :key="alert.id"
                            class="p-3 rounded-lg border flex gap-3 transition-colors" :class="[
                                alert.severity === 'high' ? 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20' : 'bg-yellow-50 dark:bg-yellow-500/10 border-yellow-200 dark:border-yellow-500/20'
                            ]">
                            <div class="mt-1 min-w-[24px]">
                                <span class="material-symbols-outlined text-[20px]" :class="[
                                    alert.severity === 'high' ? 'text-red-500' : 'text-yellow-500'
                                ]">{{ alert.icon }}</span>
                            </div>
                            <div>
                                <h4 class="text-sm font-semibold text-gray-900 dark:text-white">{{ alert.title }}</h4>
                                <p class="text-xs text-gray-600 dark:text-gray-400 mt-0.5">{{ alert.description }}</p>
                                <button @click="store.openModal('alert-details', alert)"
                                    class="mt-2 text-xs font-medium hover:underline" :class="[
                                        alert.severity === 'high' ? 'text-red-600 dark:text-red-400 hover:text-red-500 dark:hover:text-red-300' : 'text-yellow-600 dark:text-yellow-400 hover:text-yellow-500 dark:hover:text-yellow-300'
                                    ]">
                                    {{ alert.severity === 'high' ? 'View Details' : 'Investigate' }}
                                </button>
                            </div>
                        </div>

                        <!-- List of Drivers Needing Attention -->
                        <div class="mt-4 pt-4 border-t border-gray-100 dark:border-white/5">
                            <h4
                                class="text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase tracking-wider mb-2">
                                Drivers Needing
                                Support</h4>
                            <div class="space-y-2">
                                <div v-for="driver in store.filteredDrivers" :key="driver.id"
                                    @click="store.openModal('driver-profile', driver)"
                                    class="flex items-center justify-between p-2 rounded hover:bg-gray-100 dark:hover:bg-white/5 cursor-pointer group transition-colors">
                                    <div class="flex items-center gap-3">
                                        <div class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white shadow-sm"
                                            :class="driver.avatarColor">
                                            {{ driver.name.charAt(0) }}
                                        </div>
                                        <div>
                                            <div
                                                class="text-sm font-medium text-gray-900 dark:text-white group-hover:text-primary transition-colors">
                                                {{ driver.name }}</div>
                                            <div class="text-[10px]" :class="[
                                                driver.status === 'breakdown' ? 'text-red-500 dark:text-red-400' : 'text-yellow-500 dark:text-yellow-400'
                                            ]">{{ driver.status }}</div>
                                        </div>
                                    </div>
                                    <span
                                        class="material-symbols-outlined text-gray-400 dark:text-gray-500 text-[18px]">chevron_right</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Bottom Section: KPI Charts & Hub Performance -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Active Delivery Pipeline -->
            <div class="glass-panel p-5 rounded-2xl flex flex-col justify-between">
                <div class="flex justify-between items-center mb-6">
                    <h3 class="text-lg font-bold text-gray-900 dark:text-white">Active Delivery Pipeline</h3>
                    <div
                        class="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-bold uppercase tracking-wider">
                        Live Pulse
                    </div>
                </div>

                <div class="space-y-6 my-auto">
                    <!-- Stage: Processing -->
                    <div>
                        <div class="flex justify-between text-sm mb-2">
                            <span class="text-gray-500 dark:text-gray-400 font-medium flex items-center gap-2">
                                <span class="w-2 h-2 rounded-full bg-blue-500"></span>
                                Processing at Hubs
                            </span>
                            <span class="text-gray-900 dark:text-white font-bold">{{
                                store.dashboardStats.processing.toLocaleString() }}</span>
                        </div>
                        <div class="w-full h-2 bg-gray-200 dark:bg-gray-700/50 rounded-full overflow-hidden">
                            <div class="h-full bg-blue-500 rounded-full transition-all duration-1000"
                                :style="{ width: pipelinePercentages.processing + '%' }"></div>
                        </div>
                    </div>

                    <!-- Stage: In Transit -->
                    <div>
                        <div class="flex justify-between text-sm mb-2">
                            <span class="text-gray-500 dark:text-gray-400 font-medium flex items-center gap-2">
                                <span class="w-2 h-2 rounded-full bg-yellow-500"></span>
                                In Transit
                            </span>
                            <span class="text-gray-900 dark:text-white font-bold">{{
                                store.dashboardStats.activeDeliveries.toLocaleString() }}</span>
                        </div>
                        <div class="w-full h-2 bg-gray-200 dark:bg-gray-700/50 rounded-full overflow-hidden">
                            <div class="h-full bg-yellow-500 rounded-full transition-all duration-1000"
                                :style="{ width: pipelinePercentages.inTransit + '%' }"></div>
                        </div>
                    </div>

                    <!-- Stage: Delivered -->
                    <div>
                        <div class="flex justify-between text-sm mb-2">
                            <span class="text-gray-500 dark:text-gray-400 font-medium flex items-center gap-2">
                                <span class="w-2 h-2 rounded-full bg-green-500"></span>
                                Delivered Today
                            </span>
                            <span class="text-gray-900 dark:text-white font-bold">{{
                                store.dashboardStats.ordersToday.toLocaleString() }}</span>
                        </div>
                        <div class="w-full h-2 bg-gray-200 dark:bg-gray-700/50 rounded-full overflow-hidden">
                            <div class="h-full bg-green-500 rounded-full transition-all duration-1000"
                                :style="{ width: pipelinePercentages.delivered + '%' }"></div>
                        </div>
                    </div>
                </div>

                <div
                    class="mt-6 pt-4 border-t border-gray-100 dark:border-white/5 flex gap-4 text-xs font-medium text-gray-500 dark:text-gray-400">
                    <div>
                        <span class="text-gray-900 dark:text-white font-bold">{{
                            store.dashboardStats.deliverySuccess
                        }}%</span> Success Rate
                    </div>
                    <div>
                        <span class="text-gray-900 dark:text-white font-bold">~42m</span> Avg. Time
                    </div>
                </div>
            </div>

            <!-- Hub Performance Table / Interactive View -->
            <div class="glass-panel p-4 lg:p-5 rounded-2xl flex flex-col justify-between h-full">
                <!-- Header -->
                <div class="flex justify-between items-center mb-2">
                    <h3 class="text-lg font-bold text-gray-900 dark:text-white">
                        <span v-if="store.activeWarehouse === 'all'">Hub Performance</span>
                        <span v-else>{{ store.activeWarehouseName }} Overview</span>
                    </h3>
                    <button v-if="store.activeWarehouse !== 'all'" @click="store.setWarehouse('all')"
                        class="text-xs text-primary hover:underline font-medium flex items-center">
                        <span class="material-symbols-outlined text-[14px] mr-0.5">arrow_back</span>
                        View All
                    </button>
                </div>

                <!-- ALL HUBS VIEW -->
                <div v-if="store.activeWarehouse === 'all'" class="overflow-x-auto my-auto py-2">
                    <table class="w-full text-left border-collapse">
                        <thead>
                            <tr
                                class="text-xs text-gray-500 dark:text-gray-500 border-b border-gray-200 dark:border-white/10">
                                <th class="py-2 font-medium">Hub Name</th>
                                <th class="py-2 font-medium">Capacity</th>
                                <th class="py-2 font-medium">Efficiency</th>
                                <th class="py-2 font-medium">Process Rate</th>
                                <th class="py-2 font-medium">Status</th>
                            </tr>
                        </thead>
                        <tbody class="text-sm">
                            <tr v-for="hub in store.hubs" :key="hub.id"
                                class="border-b border-b-gray-100 dark:border-b-white/5 last:border-0 transition-all cursor-pointer relative"
                                :class="[
                                    store.activeWarehouse === hub.id
                                        ? 'bg-primary/5 dark:bg-primary/10 border-l-4 border-l-primary'
                                        : 'hover:bg-gray-50 dark:hover:bg-white/5 border-l-4 border-l-transparent'
                                ]" @click="store.setWarehouse(hub.id)">
                                <td class="py-3 text-gray-900 dark:text-white font-medium">{{ hub.name }}</td>
                                <td class="py-3 text-gray-500 dark:text-gray-300">
                                    <div class="flex items-center gap-2">
                                        <div
                                            class="w-16 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                            <div class="h-full" :class="hub.bg" :style="{ width: hub.capacity + '%' }">
                                            </div>
                                        </div>
                                        <span class="text-xs">{{ hub.capacity }}%</span>
                                    </div>
                                </td>
                                <!-- Added Efficiency Column -->
                                <td class="py-3 text-gray-500 dark:text-gray-300">
                                    <div class="flex items-center gap-2">
                                        <span class="text-xs font-semibold"
                                            :class="hub.efficiency > 85 ? 'text-green-500' : (hub.efficiency > 60 ? 'text-yellow-500' : 'text-red-500')">
                                            {{ hub.efficiency }}%
                                        </span>
                                    </div>
                                </td>
                                <td class="py-3 text-gray-500 dark:text-gray-300">{{
                                    hub.processRate.toLocaleString() }}
                                    pkgs/hr</td>
                                <td class="py-3">
                                    <span class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase"
                                        :class="hub.status.toLowerCase() === 'optimal' ? 'bg-green-500/20 text-green-600 dark:text-green-500' : (hub.status.toLowerCase() === 'congested' ? 'bg-red-500/20 text-red-600 dark:text-red-500' : 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-500')">
                                        {{ hub.status }}
                                    </span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- SINGLE HUB INTERACTIVE VIEW -->
                <div v-else-if="currentHub" class="flex flex-col h-full animate-fade-in py-2">
                    <div class="flex flex-wrap lg:flex-nowrap items-center justify-between gap-4 lg:gap-6 my-auto">

                        <!-- Main Stats Group -->
                        <div class="flex items-center gap-4">
                            <!-- Capacity Circular Progress -->
                            <div class="relative w-20 h-20 lg:w-24 lg:h-24 flex-shrink-0 group">
                                <svg class="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                    <circle cx="18" cy="18" r="15.9155" fill="none"
                                        class="stroke-gray-100 dark:stroke-white/5" stroke-width="3"></circle>
                                    <circle cx="18" cy="18" r="15.9155" fill="none"
                                        class="transition-all duration-1000 ease-out"
                                        :class="currentHub.capacity > 85 ? 'stroke-red-500' : (currentHub.capacity > 60 ? 'stroke-yellow-500' : 'stroke-green-500')"
                                        stroke-width="3" :stroke-dasharray="`${currentHub.capacity}, 100`"
                                        stroke-linecap="round"></circle>
                                </svg>
                                <div class="absolute inset-0 flex flex-col items-center justify-center">
                                    <span
                                        class="text-lg lg:text-2xl font-bold text-gray-900 dark:text-white leading-none">
                                        {{ currentHub.capacity }}%
                                    </span>
                                    <span
                                        class="text-[9px] lg:text-[10px] text-gray-500 uppercase tracking-widest mt-0.5 lg:mt-1">Load</span>
                                </div>
                            </div>

                            <!-- Pkgs/Hr Stats & Status -->
                            <div>
                                <div class="flex items-center gap-2 mb-1">
                                    <span class="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border"
                                        :class="currentHub.status.toLowerCase() === 'optimal' ? 'bg-green-50 border-green-200 text-green-600 dark:bg-green-500/10 dark:border-green-500/20 dark:text-green-500' : (currentHub.status.toLowerCase() === 'congested' ? 'bg-red-50 border-red-200 text-red-600 dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-500' : 'bg-yellow-50 border-yellow-200 text-yellow-600 dark:bg-yellow-500/10 dark:border-yellow-500/20 dark:text-yellow-500')">
                                        <span class="inline-block w-1.5 h-1.5 rounded-full mr-0.5"
                                            :class="currentHub.status.toLowerCase() === 'optimal' ? 'bg-green-500' : (currentHub.status.toLowerCase() === 'congested' ? 'bg-red-500' : 'bg-yellow-500')"></span>
                                        {{ currentHub.status }}
                                    </span>
                                </div>
                                <div class="flex items-baseline gap-1">
                                    <span class="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">{{
                                        currentHub.processRate.toLocaleString() }}</span>
                                    <span
                                        class="text-xs lg:text-sm font-medium text-gray-500 dark:text-gray-400">pkgs/hr</span>
                                </div>
                            </div>
                        </div>

                        <!-- Secondary Metrics Group (Circular) -->
                        <div class="flex items-center gap-4 lg:gap-6 justify-around w-full lg:w-auto mt-4 lg:mt-0">
                            <!-- Efficiency Circular -->
                            <div class="relative w-16 h-16 lg:w-20 lg:h-20 flex-shrink-0 group">
                                <svg class="w-full h-full transform -rotate-90 drop-shadow-sm" viewBox="0 0 36 36">
                                    <circle cx="18" cy="18" r="15.9155" fill="none"
                                        class="stroke-gray-100 dark:stroke-white/5" stroke-width="3"></circle>
                                    <circle cx="18" cy="18" r="15.9155" fill="none"
                                        class="transition-all duration-1000 ease-out"
                                        :class="currentHub.efficiency > 85 ? 'stroke-green-500' : (currentHub.efficiency > 60 ? 'stroke-yellow-500' : 'stroke-red-500')"
                                        stroke-width="3" :stroke-dasharray="`${currentHub.efficiency}, 100`"
                                        stroke-linecap="round"></circle>
                                </svg>
                                <div class="absolute inset-0 flex flex-col items-center justify-center">
                                    <span
                                        class="text-base lg:text-xl font-bold text-gray-900 dark:text-white leading-none">
                                        {{ currentHub.efficiency }}%
                                    </span>
                                    <span
                                        class="text-[8px] lg:text-[10px] text-gray-500 uppercase tracking-widest mt-0.5">Effic.</span>
                                </div>
                            </div>

                            <!-- Staff Circular -->
                            <div class="relative w-16 h-16 lg:w-20 lg:h-20 flex-shrink-0 group">
                                <svg class="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                    <circle cx="18" cy="18" r="15.9155" fill="none"
                                        class="stroke-gray-100 dark:stroke-white/5" stroke-width="3"></circle>
                                    <circle cx="18" cy="18" r="15.9155" fill="none"
                                        class="transition-all duration-1000 ease-out stroke-blue-500" stroke-width="3"
                                        :stroke-dasharray="(currentHub.staffActive / currentHub.staffTotal * 100) + ', 100'"
                                        stroke-linecap="round"></circle>
                                </svg>
                                <div class="absolute inset-0 flex flex-col items-center justify-center">
                                    <span
                                        class="text-base lg:text-xl font-bold text-gray-900 dark:text-white leading-none">
                                        {{ currentHub.staffActive }}<span
                                            class="text-[10px] lg:text-xs text-gray-400 font-normal">/{{
                                                currentHub.staffTotal }}</span>
                                    </span>
                                    <span
                                        class="text-[8px] lg:text-[10px] text-gray-500 uppercase tracking-widest mt-0.5">Staff</span>
                                </div>
                            </div>

                            <!-- Vehicles Circular -->
                            <div class="relative w-16 h-16 lg:w-20 lg:h-20 flex-shrink-0 group">
                                <svg class="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                    <circle cx="18" cy="18" r="15.9155" fill="none"
                                        class="stroke-gray-100 dark:stroke-white/5" stroke-width="3"></circle>
                                    <circle cx="18" cy="18" r="15.9155" fill="none"
                                        class="transition-all duration-1000 ease-out stroke-purple-500" stroke-width="3"
                                        :stroke-dasharray="(currentHub.vehiclesActive / currentHub.vehiclesTotal * 100) + ', 100'"
                                        stroke-linecap="round"></circle>
                                </svg>
                                <div class="absolute inset-0 flex flex-col items-center justify-center">
                                    <span
                                        class="text-base lg:text-xl font-bold text-gray-900 dark:text-white leading-none">
                                        {{ currentHub.vehiclesActive }}<span
                                            class="text-[10px] lg:text-xs text-gray-400 font-normal">/{{
                                                currentHub.vehiclesTotal
                                            }}</span>
                                    </span>
                                    <span
                                        class="text-[8px] lg:text-[10px] text-gray-500 uppercase tracking-widest mt-0.5">Vehs</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Interactive Actions -->
                    <div class="grid grid-cols-2 gap-3 mt-6">
                        <button @click="optimizeHub" :disabled="isOptimizing"
                            class="border rounded-xl p-3 text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-300"
                            :class="isOptimizing ? 'bg-primary/20 text-primary border-primary/20 cursor-wait' : 'bg-primary/10 hover:bg-primary/20 text-primary border-primary/20'">
                            <span v-if="!isOptimizing" class="material-symbols-outlined text-[18px]">tune</span>
                            <span v-else class="material-symbols-outlined text-[18px] animate-spin">sync</span>
                            {{ isOptimizing ? 'Optimizing...' : 'Optimize Load' }}
                        </button>
                        <button @click="contactHub"
                            class="bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 border border-transparent rounded-xl p-3 text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-300">
                            <span class="material-symbols-outlined text-[18px]">support_agent</span>
                            Contact Hub
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Full Width SLA Compliance Chart -->
        <div class="glass-panel p-5 rounded-2xl w-full mt-6 flex flex-col">
            <!-- Tabs Header -->
            <div
                class="flex items-center gap-4 mb-6 border-b border-gray-200 dark:border-white/10 pb-2 overflow-x-auto hide-scrollbar">
                <button @click="activeTab = 'sla'"
                    class="px-4 py-2 text-sm font-bold transition-colors whitespace-nowrap"
                    :class="activeTab === 'sla' ? 'text-primary border-b-2 border-primary -mb-[3px]' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white border-b-2 border-transparent -mb-[3px]'">
                    SLA Compliance Trend
                </button>
                <button @click="activeTab = 'revenue'"
                    class="px-4 py-2 text-sm font-bold transition-colors whitespace-nowrap"
                    :class="activeTab === 'revenue' ? 'text-emerald-500 border-b-2 border-emerald-500 -mb-[3px]' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white border-b-2 border-transparent -mb-[3px]'">
                    Revenue Analysis
                </button>
                <button @click="activeTab = 'orders'"
                    class="px-4 py-2 text-sm font-bold transition-colors whitespace-nowrap"
                    :class="activeTab === 'orders' ? 'text-purple-500 border-b-2 border-purple-500 -mb-[3px]' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white border-b-2 border-transparent -mb-[3px]'">
                    Order Volume
                </button>
                <div class="ml-auto flex-shrink-0 pl-4">
                    <!-- Time Period Selection -->
                    <select v-model="selectedTimePeriod"
                        class="bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-white/10 rounded-lg text-xs text-gray-700 dark:text-gray-300 px-3 py-1.5 outline-none transition-colors cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700">
                        <option value="week" class="bg-white dark:bg-gray-800">Last 7 Days</option>
                        <option value="month" class="bg-white dark:bg-gray-800">This Month</option>
                    </select>
                </div>
            </div>

            <!-- Chart Container -->
            <div class="h-64 lg:h-80 w-full relative">
                <Line :key="activeTab" :data="chartData" :options="chartOptions" />
            </div>
        </div>

        <!-- Modals -->
        <AlertDetailsModal :is-open="store.activeModal === 'alert-details'" :alert="store.selectedItem"
            @close="store.closeModal()" @action="handleAlertAction" />

        <DriverProfileModal :is-open="store.activeModal === 'driver-profile'" :driver="store.selectedItem"
            @close="store.closeModal()" />

        <ContactHubModal :is-open="store.activeModal === 'contact-hub'" :hub="currentHub" @close="store.closeModal()" />

    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useLogisticStore } from '@/stores/logisticStore'
import AlertDetailsModal from '@/LWD-components/AlertDetailsModal.vue'
import DriverProfileModal from '@/LWD-components/DriverProfileModal.vue'
import ContactHubModal from '@/LWD-components/ContactHubModal.vue'

const store = useLogisticStore()
const hoveredDataPoint = ref(null)

// --- Active Hub Logic ---
const currentHub = computed(() => {
    if (store.activeWarehouse === 'all') return null
    return store.hubs.find(h => h.id === store.activeWarehouse)
})

// --- Chart Controls ---
const selectedTimePeriod = ref('week')
const activeTab = ref('sla')

// --- Interactive Actions ---
const isOptimizing = ref(false)
const optimizeHub = () => {
    isOptimizing.value = true
    setTimeout(() => {
        isOptimizing.value = false
        store.addAlert({
            id: Date.now(),
            title: `Appx 12% boost achieved`,
            description: `AI successfully recalibrated loads for ${currentHub.value.name}.`,
            severity: 'low',
            type: 'system',
            icon: 'check_circle',
            location: currentHub.value ? currentHub.value.location : 'Global Sector',
            timestamp: 'Just now',
            recommendation: 'Monitor load throughput for the next 15 minutes to verify stabilization.'
        })
    }, 2000)
}

const contactHub = () => {
    store.openModal('contact-hub', currentHub.value)
}

const mapZoomIn = () => {

}

const mapZoomOut = () => {

}

// --- Chart.js Setup ---
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Filler,
    Legend
} from 'chart.js'
import { Line } from 'vue-chartjs'

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Filler,
    Legend
)

// --- Pipeline Logic ---
const pipelinePercentages = computed(() => {
    const stats = store.dashboardStats
    const total = stats.processing + stats.activeDeliveries + stats.ordersToday

    // Guard against division by zero
    if (total === 0) return { processing: 0, inTransit: 0, delivered: 0 }

    return {
        processing: Math.round((stats.processing / total) * 100),
        inTransit: Math.round((stats.activeDeliveries / total) * 100),
        delivered: Math.round((stats.ordersToday / total) * 100)
    }
})

const chartData = computed(() => {
    const isWeek = selectedTimePeriod.value === 'week'
    let data = []
    let labelString = ''
    let config = {}

    // 1. Resolve Data Array and Config based on Tab
    if (activeTab.value === 'sla') {
        data = store.dashboardStats.slaCompliance[selectedTimePeriod.value] || []
        labelString = 'SLA Compliance (%)'
        config = {
            bg: 'rgba(56, 189, 248, 0.1)', // Tailwind Primary (Sky-400)
            border: 'rgb(56, 189, 248)'
        }
    } else if (activeTab.value === 'revenue') {
        data = store.dashboardStats.revenue[selectedTimePeriod.value] || []
        labelString = 'Revenue ($)'
        config = {
            bg: 'rgba(16, 185, 129, 0.1)', // Tailwind Emerald-500
            border: 'rgb(16, 185, 129)'
        }
    } else if (activeTab.value === 'orders') {
        data = store.dashboardStats.orders[selectedTimePeriod.value] || []
        labelString = 'Order Volume'
        config = {
            bg: 'rgba(168, 85, 247, 0.1)', // Tailwind Purple-500
            border: 'rgb(168, 85, 247)'
        }
    }

    // 2. Create X-Axis Labels
    let labels = []
    if (isWeek) {
        labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    } else {
        // Generate nice month labels, e.g., '1', '5', '10' etc. or just numbers
        labels = Array.from({ length: data.length }, (_, i) => i + 1)
    }

    return {
        labels,
        datasets: [
            {
                label: labelString,
                backgroundColor: config.bg,
                borderColor: config.border,
                borderWidth: 2,
                pointBackgroundColor: config.border,
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: config.border,
                fill: true,
                tension: 0.4, // Smooth curve
                data: data
            }
        ]
    }
})

// Progressive Animation Logic for Chart.js
const totalDuration = 1000;
const delayBetweenPoints = totalDuration / 30; // Max points is ~30 for month
const previousY = (ctx) => ctx.index === 0 ? ctx.chart.scales.y.getPixelForValue(100) : ctx.chart.getDatasetMeta(ctx.datasetIndex).data[ctx.index - 1].getProps(['y'], true).y;

const animationConfig = {
    x: {
        type: 'number',
        easing: 'linear',
        duration: delayBetweenPoints,
        from: NaN, // the point is initially skipped
        delay(ctx) {
            if (ctx.type !== 'data' || ctx.xStarted) {
                return 0;
            }
            ctx.xStarted = true;
            return ctx.index * delayBetweenPoints;
        }
    },
    y: {
        type: 'number',
        easing: 'linear',
        duration: delayBetweenPoints,
        from: previousY,
        delay(ctx) {
            if (ctx.type !== 'data' || ctx.yStarted) {
                return 0;
            }
            ctx.yStarted = true;
            return ctx.index * delayBetweenPoints;
        }
    }
}

const chartOptions = computed(() => {
    // Dynamic Y-axis scaling based on tab
    let minBuild = undefined;
    let maxBuild = undefined;

    if (activeTab.value === 'sla') {
        minBuild = 70;
        maxBuild = 100;
    }

    return {
        responsive: true,
        maintainAspectRatio: false,
        animation: animationConfig, // Inject progressive animation
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                mode: 'index',
                intersect: false,
                callbacks: {
                    label: function (context) {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (activeTab.value === 'sla') {
                            label += context.parsed.y + '%';
                        } else if (activeTab.value === 'revenue') {
                            label += '$' + context.parsed.y.toLocaleString();
                        } else {
                            label += context.parsed.y.toLocaleString();
                        }
                        return label;
                    }
                }
            }
        },
        scales: {
            y: {
                min: minBuild,
                max: maxBuild,
                grid: {
                    color: 'rgba(156, 163, 175, 0.1)',
                    drawBorder: false,
                }
            },
            x: {
                grid: {
                    display: false,
                    drawBorder: false,
                }
            }
        },
        interaction: {
            mode: 'nearest',
            axis: 'x',
            intersect: false
        }
    }
})

function handleAlertAction({ type, alertId }) {
    if (type === 'acknowledge' || type === 'ignore') {
        store.resolveAlert(alertId)
    }
}
</script>
