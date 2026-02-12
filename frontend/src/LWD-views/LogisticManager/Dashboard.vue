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
                        <div class="text-sm text-gray-400 font-medium">Total Orders Today</div>
                        <div class="text-3xl font-bold text-white mt-1">1,248</div>
                    </div>
                    <div class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                        <span class="material-symbols-outlined">shopping_cart</span>
                    </div>
                </div>
                <div class="flex items-center text-sm">
                    <span class="text-primary font-medium flex items-center">
                        <span class="material-symbols-outlined text-[16px] mr-1">trending_up</span>
                        +12.5%
                    </span>
                    <span class="text-gray-500 ml-2">vs yesterday</span>
                </div>
            </div>

            <div
                class="glass-panel p-5 rounded-2xl relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
                <div
                    class="absolute -right-6 -top-6 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-colors">
                </div>
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <div class="text-sm text-gray-400 font-medium">Active Deliveries</div>
                        <div class="text-3xl font-bold text-white mt-1">342</div>
                    </div>
                    <div class="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                        <span class="material-symbols-outlined">local_shipping</span>
                    </div>
                </div>
                <div class="flex items-center text-sm">
                    <span class="text-gray-500 font-medium">
                        85% On-Time
                    </span>
                    <div class="ml-auto w-24 h-1.5 bg-gray-700 rounded-full overflow-hidden">
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
                        <div class="text-sm text-gray-400 font-medium">Delivery Success Rate</div>
                        <div class="text-3xl font-bold text-white mt-1">98.2%</div>
                    </div>
                    <div class="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500">
                        <span class="material-symbols-outlined">verified</span>
                    </div>
                </div>
                <div class="flex items-center text-sm">
                    <span class="text-purple-400 font-medium flex items-center">
                        High Perf.
                    </span>
                    <span class="text-gray-500 ml-2">Consistent</span>
                </div>
            </div>

            <div
                class="glass-panel p-5 rounded-2xl relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
                <div
                    class="absolute -right-6 -top-6 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-colors">
                </div>
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <div class="text-sm text-gray-400 font-medium">Revenue Today</div>
                        <div class="text-3xl font-bold text-white mt-1">$42.5k</div>
                    </div>
                    <div
                        class="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                        <span class="material-symbols-outlined">payments</span>
                    </div>
                </div>
                <div class="flex items-center text-sm">
                    <span class="text-emerald-400 font-medium flex items-center">
                        <span class="material-symbols-outlined text-[16px] mr-1">trending_up</span>
                        +8.2%
                    </span>
                    <span class="text-gray-500 ml-2">vs target</span>
                </div>
            </div>
        </div>

        <!-- Main Content Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">

            <!-- Live Fleet Map (Takes up 2 columns) -->
            <div class="lg:col-span-2 glass-panel rounded-2xl p-0 overflow-hidden flex flex-col relative group">
                <div class="absolute top-4 left-4 z-10 glass-panel px-3 py-1 rounded-full flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    <span class="text-xs font-semibold text-white">LIVE FLEET VIEW</span>
                </div>

                <!-- Placeholder for Map -->
                <div
                    class="flex-1 bg-gray-800/50 flex items-center justify-center relative bg-[url('/src/assets/map-placeholder.png')] bg-cover bg-center">
                    <div class="absolute inset-0 bg-background-dark/30 backdrop-blur-[1px]"></div>

                    <!-- Simulated Map Elements -->
                    <div class="absolute top-1/2 left-1/3 transform -translate-x-1/2 -translate-y-1/2">
                        <div class="relative group cursor-pointer">
                            <div class="w-12 h-12 bg-primary/20 rounded-full animate-ping absolute inset-0"></div>
                            <div
                                class="w-12 h-12 bg-background-dark/80 rounded-full border-2 border-primary flex items-center justify-center relative z-10">
                                <span class="material-symbols-outlined text-primary">local_shipping</span>
                            </div>
                            <!-- Tooltip -->
                            <div
                                class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-32 bg-background-dark border border-white/10 rounded-lg p-2 hidden group-hover:block z-20 shadow-xl">
                                <div class="text-xs font-bold text-white">Truck #402</div>
                                <div class="text-[10px] text-gray-400">Moving • 45 km/h</div>
                            </div>
                        </div>
                    </div>

                    <div class="absolute top-1/3 right-1/4">
                        <div class="relative group cursor-pointer">
                            <div class="w-8 h-8 bg-yellow-500/20 rounded-full absolute inset-0"></div>
                            <div
                                class="w-8 h-8 bg-background-dark/80 rounded-full border-2 border-yellow-500 flex items-center justify-center relative z-10">
                                <span
                                    class="material-symbols-outlined text-yellow-500 text-[16px]">local_shipping</span>
                            </div>
                        </div>
                    </div>

                    <div class="text-gray-500 font-mono text-sm z-0">Iterative Map Component Loading...</div>
                </div>

                <!-- Map Controls Overlay -->
                <div class="absolute bottom-4 right-4 flex flex-col gap-2">
                    <button
                        class="w-8 h-8 glass-panel rounded-lg flex items-center justify-center hover:bg-white/10 text-white"><span
                            class="material-symbols-outlined text-[18px]">add</span></button>
                    <button
                        class="w-8 h-8 glass-panel rounded-lg flex items-center justify-center hover:bg-white/10 text-white"><span
                            class="material-symbols-outlined text-[18px]">remove</span></button>
                </div>
            </div>

            <!-- Right Panel: Alerts & Bottlenecks -->
            <div class="glass-panel rounded-2xl p-5 flex flex-col h-full">
                <h3 class="text-lg font-bold text-white mb-4 flex items-center">
                    <span class="material-symbols-outlined mr-2 text-yellow-500">warning</span>
                    Attention Needed
                </h3>

                <div class="flex-1 overflow-y-auto pr-1 space-y-3 no-scrollbar">
                    <!-- Alert Item -->
                    <div class="p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex gap-3">
                        <div class="mt-1 min-w-[24px]">
                            <span class="material-symbols-outlined text-red-500 text-[20px]">error</span>
                        </div>
                        <div>
                            <h4 class="text-sm font-semibold text-white">Hub Congestion Alert</h4>
                            <p class="text-xs text-gray-400 mt-0.5">North-East Hub is experiencing high dwell times (>45
                                mins).</p>
                            <button class="mt-2 text-xs text-red-400 font-medium hover:text-red-300">View
                                Details</button>
                        </div>
                    </div>

                    <!-- Alert Item -->
                    <div class="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex gap-3">
                        <div class="mt-1 min-w-[24px]">
                            <span class="material-symbols-outlined text-yellow-500 text-[20px]">schedule</span>
                        </div>
                        <div>
                            <h4 class="text-sm font-semibold text-white">Delayed Shipments</h4>
                            <p class="text-xs text-gray-400 mt-0.5">14 shipments at risk of missing SLA window in Sector
                                4.</p>
                            <button
                                class="mt-2 text-xs text-yellow-400 font-medium hover:text-yellow-300">Investigate</button>
                        </div>
                    </div>

                    <!-- List of Drivers Needing Attention -->
                    <div class="mt-4">
                        <h4 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Drivers Needing
                            Support</h4>
                        <div class="space-y-2">
                            <div class="flex items-center justify-between p-2 rounded hover:bg-white/5 cursor-pointer">
                                <div class="flex items-center gap-3">
                                    <div class="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">D
                                    </div>
                                    <div>
                                        <div class="text-sm font-medium text-white">David Miller</div>
                                        <div class="text-[10px] text-red-400">Breakdown Reported</div>
                                    </div>
                                </div>
                                <span class="material-symbols-outlined text-gray-500 text-[18px]">chevron_right</span>
                            </div>

                            <div class="flex items-center justify-between p-2 rounded hover:bg-white/5 cursor-pointer">
                                <div class="flex items-center gap-3">
                                    <div class="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">S
                                    </div>
                                    <div>
                                        <div class="text-sm font-medium text-white">Sarah Jenkins</div>
                                        <div class="text-[10px] text-yellow-400">Route Deviation</div>
                                    </div>
                                </div>
                                <span class="material-symbols-outlined text-gray-500 text-[18px]">chevron_right</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Bottom Section: KPI Charts & Hub Performance -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- SLA Performance Chart Style -->
            <div class="glass-panel p-5 rounded-2xl">
                <div class="flex justify-between items-center mb-6">
                    <h3 class="text-lg font-bold text-white">SLA Compliance Trend</h3>
                    <select
                        class="bg-background-dark border border-white/10 rounded-lg text-xs text-gray-300 px-2 py-1 outline-none">
                        <option>Last 7 Days</option>
                        <option>This Month</option>
                    </select>
                </div>

                <!-- Simple CSS Chart Placeholder -->
                <div class="h-48 flex items-end justify-between gap-2 px-2">
                    <div class="w-full bg-gray-700/30 rounded-t-sm h-[60%] relative group">
                        <div
                            class="absolute bottom-full left-1/2 -translate-x-1/2 text-xs text-white opacity-0 group-hover:opacity-100 mb-1">
                            92%</div>
                    </div>
                    <div class="w-full bg-gray-700/30 rounded-t-sm h-[75%] relative group">
                        <div
                            class="absolute bottom-full left-1/2 -translate-x-1/2 text-xs text-white opacity-0 group-hover:opacity-100 mb-1">
                            94%</div>
                    </div>
                    <div class="w-full bg-gray-700/30 rounded-t-sm h-[65%] relative group"></div>
                    <div class="w-full bg-gray-700/30 rounded-t-sm h-[85%] relative group"></div>
                    <div class="w-full bg-gray-700/30 rounded-t-sm h-[70%] relative group"></div>
                    <div class="w-full bg-gray-700/30 rounded-t-sm h-[90%] relative group"></div>
                    <div class="w-full bg-primary/20 rounded-t-sm h-[95%] relative group border-t-2 border-primary">
                        <div
                            class="absolute bottom-full left-1/2 -translate-x-1/2 text-xs text-primary font-bold opacity-100 mb-1">
                            98%</div>
                    </div>
                </div>
                <div class="flex justify-between mt-2 text-xs text-gray-500 px-2">
                    <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                </div>
            </div>

            <!-- Hub Performance Table -->
            <div class="glass-panel p-5 rounded-2xl">
                <h3 class="text-lg font-bold text-white mb-4">Hub Performance</h3>
                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse">
                        <thead>
                            <tr class="text-xs text-gray-500 border-b border-white/10">
                                <th class="py-2 font-medium">Hub Name</th>
                                <th class="py-2 font-medium">Capacity</th>
                                <th class="py-2 font-medium">Process Rate</th>
                                <th class="py-2 font-medium">Status</th>
                            </tr>
                        </thead>
                        <tbody class="text-sm">
                            <tr class="border-b border-white/5 hover:bg-white/5 transition-colors">
                                <td class="py-3 text-white font-medium">North-East Hub</td>
                                <td class="py-3 text-gray-300">
                                    <div class="flex items-center gap-2">
                                        <div class="w-16 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                                            <div class="h-full bg-red-500 w-[92%]"></div>
                                        </div>
                                        <span class="text-xs">92%</span>
                                    </div>
                                </td>
                                <td class="py-3 text-gray-300">1,240 pkgs/hr</td>
                                <td class="py-3"><span
                                        class="px-2 py-0.5 rounded-full bg-red-500/20 text-red-500 text-[10px] font-bold">CONGESTED</span>
                                </td>
                            </tr>
                            <tr class="border-b border-white/5 hover:bg-white/5 transition-colors">
                                <td class="py-3 text-white font-medium">South Hub</td>
                                <td class="py-3 text-gray-300">
                                    <div class="flex items-center gap-2">
                                        <div class="w-16 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                                            <div class="h-full bg-green-500 w-[45%]"></div>
                                        </div>
                                        <span class="text-xs">45%</span>
                                    </div>
                                </td>
                                <td class="py-3 text-gray-300">850 pkgs/hr</td>
                                <td class="py-3"><span
                                        class="px-2 py-0.5 rounded-full bg-green-500/20 text-green-500 text-[10px] font-bold">OPTIMAL</span>
                                </td>
                            </tr>
                            <tr class="hover:bg-white/5 transition-colors">
                                <td class="py-3 text-white font-medium">West DC-04</td>
                                <td class="py-3 text-gray-300">
                                    <div class="flex items-center gap-2">
                                        <div class="w-16 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                                            <div class="h-full bg-yellow-500 w-[78%]"></div>
                                        </div>
                                        <span class="text-xs">78%</span>
                                    </div>
                                </td>
                                <td class="py-3 text-gray-300">920 pkgs/hr</td>
                                <td class="py-3"><span
                                        class="px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-500 text-[10px] font-bold">HIGH
                                        LOAD</span></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
</script>
