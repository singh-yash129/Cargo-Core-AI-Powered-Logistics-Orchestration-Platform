<template>
    <div class="space-y-6">
        <div class="flex justify-between items-center">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Reports & Analytics</h2>
            <div class="flex gap-2">
                <select
                    class="bg-gray-100 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white px-3 py-2 focus:outline-none focus:border-primary/50 transition-colors shadow-sm cursor-pointer">
                    <option class="text-gray-900 dark:text-white bg-white dark:bg-card-dark">Last 7 Days</option>
                    <option class="text-gray-900 dark:text-white bg-white dark:bg-card-dark">Last 30 Days</option>
                    <option class="text-gray-900 dark:text-white bg-white dark:bg-card-dark">This Quarter</option>
                </select>
                <button
                    class="bg-primary hover:bg-primary/90 text-white font-bold px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm">
                    <span class="material-symbols-outlined">download</span> Export PDF
                </button>
            </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Delivery Performance Chart -->
            <div class="glass-panel p-6 rounded-xl flex flex-col">
                <h3 class="font-bold text-gray-900 dark:text-white mb-6">Delivery Success Rate Trend</h3>
                <div class="h-64 flex items-end justify-between px-2 gap-2 mt-auto">
                    <!-- Bars -->
                    <div class="w-full bg-gray-200 dark:bg-gray-700/30 rounded-t relative hover:bg-gray-300 dark:hover:bg-gray-700/50 transition-colors group cursor-pointer"
                        style="height: 60%">
                        <div
                            class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 text-xs text-white opacity-0 group-hover:opacity-100 bg-gray-900 dark:bg-black/80 px-2 py-1 rounded shadow-lg pointer-events-none">
                            60%</div>
                    </div>
                    <div class="w-full bg-gray-200 dark:bg-gray-700/30 rounded-t relative hover:bg-gray-300 dark:hover:bg-gray-700/50 transition-colors group cursor-pointer"
                        style="height: 80%"></div>
                    <div class="w-full bg-gray-200 dark:bg-gray-700/30 rounded-t relative hover:bg-gray-300 dark:hover:bg-gray-700/50 transition-colors group cursor-pointer"
                        style="height: 75%"></div>
                    <div class="w-full bg-gray-200 dark:bg-gray-700/30 rounded-t relative hover:bg-gray-300 dark:hover:bg-gray-700/50 transition-colors group cursor-pointer"
                        style="height: 90%"></div>
                    <div class="w-full bg-gray-200 dark:bg-gray-700/30 rounded-t relative hover:bg-gray-300 dark:hover:bg-gray-700/50 transition-colors group cursor-pointer"
                        style="height: 85%"></div>
                    <div class="w-full bg-gray-200 dark:bg-gray-700/30 rounded-t relative hover:bg-gray-300 dark:hover:bg-gray-700/50 transition-colors group cursor-pointer"
                        style="height: 95%"></div>
                    <div class="w-full bg-primary/80 rounded-t relative hover:bg-primary transition-colors group cursor-pointer"
                        style="height: 98%">
                        <div
                            class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 text-xs text-primary font-bold opacity-0 group-hover:opacity-100 bg-white dark:bg-black/80 px-2 py-1 rounded border border-primary/20 shadow-lg pointer-events-none whitespace-nowrap">
                            98% Today</div>
                    </div>
                </div>
                <div class="flex justify-between mt-4 text-xs text-gray-500 dark:text-gray-400 px-2 font-medium">
                    <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                </div>
            </div>

            <!-- Cost Analysis -->
            <div class="glass-panel p-6 rounded-xl flex flex-col">
                <h3 class="font-bold text-gray-900 dark:text-white mb-6">Cost Breakdown</h3>
                <div class="space-y-4">
                    <div>
                        <div class="flex justify-between text-sm mb-1 text-gray-700 dark:text-gray-300 font-medium">
                            <span>Fuel Costs</span>
                            <span>$12,450 (45%)</span>
                        </div>
                        <div class="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                            <div class="bg-red-500 hover:bg-red-400 transition-colors h-full w-[45%]"></div>
                        </div>
                    </div>
                    <div>
                        <div class="flex justify-between text-sm mb-1 text-gray-700 dark:text-gray-300 font-medium">
                            <span>Driver Payroll</span>
                            <span>$8,200 (30%)</span>
                        </div>
                        <div class="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                            <div class="bg-blue-500 hover:bg-blue-400 transition-colors h-full w-[30%]"></div>
                        </div>
                    </div>
                    <div>
                        <div class="flex justify-between text-sm mb-1 text-gray-700 dark:text-gray-300 font-medium">
                            <span>Maintenance</span>
                            <span>$4,100 (15%)</span>
                        </div>
                        <div class="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                            <div class="bg-yellow-500 hover:bg-yellow-400 transition-colors h-full w-[15%]"></div>
                        </div>
                    </div>
                    <div>
                        <div class="flex justify-between text-sm mb-1 text-gray-700 dark:text-gray-300 font-medium">
                            <span>Other</span>
                            <span>$2,700 (10%)</span>
                        </div>
                        <div class="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                            <div class="bg-gray-500 hover:bg-gray-400 transition-colors h-full w-[10%]"></div>
                        </div>
                    </div>
                </div>

                <div class="mt-auto pt-8">
                    <div
                        class="p-4 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/5 shadow-sm">
                        <div
                            class="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wide mb-2 flex items-center gap-1">
                            <span class="material-symbols-outlined text-[14px]">lightbulb</span> Insight
                        </div>
                        <div class="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">Fuel costs have risen by
                            <span class="text-red-500 dark:text-red-400 font-bold">8%</span> compared to last week.
                            Consider optimizing routes
                            in Sector 4.</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Available Reports List -->
        <div class="glass-panel p-6 rounded-xl">
            <h3 class="font-bold text-gray-900 dark:text-white mb-4">Generated Reports</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div
                    class="p-4 bg-gray-50 hover:bg-gray-100 dark:bg-white/5 dark:hover:bg-white/10 rounded-xl border border-gray-200 dark:border-white/5 hover:border-primary/50 dark:hover:border-primary/30 cursor-pointer transition-all group flex items-start gap-4 shadow-sm">
                    <div class="p-2.5 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-500 rounded-lg shadow-sm">
                        <span class="material-symbols-outlined">picture_as_pdf</span></div>
                    <div>
                        <div
                            class="font-bold text-gray-900 dark:text-white text-sm group-hover:text-primary transition-colors leading-tight mb-1">
                            Monthly
                            Financial Summary</div>
                        <div class="text-xs text-gray-500 dark:text-gray-400">Generated: Oct 31, 2023</div>
                    </div>
                </div>
                <div
                    class="p-4 bg-gray-50 hover:bg-gray-100 dark:bg-white/5 dark:hover:bg-white/10 rounded-xl border border-gray-200 dark:border-white/5 hover:border-primary/50 dark:hover:border-primary/30 cursor-pointer transition-all group flex items-start gap-4 shadow-sm">
                    <div
                        class="p-2.5 bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-500 rounded-lg shadow-sm">
                        <span class="material-symbols-outlined">table_view</span></div>
                    <div>
                        <div
                            class="font-bold text-gray-900 dark:text-white text-sm group-hover:text-primary transition-colors leading-tight mb-1">
                            Driver
                            Performance Log</div>
                        <div class="text-xs text-gray-500 dark:text-gray-400">Generated: Yesterday</div>
                    </div>
                </div>
                <div
                    class="p-4 bg-gray-50 hover:bg-gray-100 dark:bg-white/5 dark:hover:bg-white/10 rounded-xl border border-gray-200 dark:border-white/5 hover:border-primary/50 dark:hover:border-primary/30 cursor-pointer transition-all group flex items-start gap-4 shadow-sm">
                    <div
                        class="p-2.5 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-500 rounded-lg shadow-sm">
                        <span class="material-symbols-outlined">analytics</span></div>
                    <div>
                        <div
                            class="font-bold text-gray-900 dark:text-white text-sm group-hover:text-primary transition-colors leading-tight mb-1">
                            SLA Breach
                            Analysis</div>
                        <div class="text-xs text-gray-500 dark:text-gray-400">Generated: 2 hours ago</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
</script>
