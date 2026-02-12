<template>
    <div class="space-y-6">
        <div class="flex justify-between items-center">
            <h2 class="text-2xl font-bold text-white">Reports & Analytics</h2>
            <div class="flex gap-2">
                <select class="bg-black/40 border border-white/10 rounded-lg text-white px-3 py-2 focus:outline-none">
                    <option>Last 7 Days</option>
                    <option>Last 30 Days</option>
                    <option>This Quarter</option>
                </select>
                <button
                    class="bg-primary hover:bg-primary-dark text-background-dark font-bold px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
                    <span class="material-symbols-outlined">download</span> Export PDF
                </button>
            </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Delivery Performance Chart -->
            <div class="glass-panel p-6 rounded-xl">
                <h3 class="font-bold text-white mb-6">Delivery Success Rate Trend</h3>
                <div class="h-64 flex items-end justify-between px-2 gap-2">
                    <div class="w-full bg-gray-700/30 rounded-t relative hover:bg-gray-700/50 transition-colors group cursor-pointer"
                        style="height: 60%">
                        <div
                            class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 text-xs text-white opacity-0 group-hover:opacity-100 bg-black/80 px-2 py-1 rounded">
                            60%</div>
                    </div>
                    <div class="w-full bg-gray-700/30 rounded-t relative hover:bg-gray-700/50 transition-colors group cursor-pointer"
                        style="height: 80%"></div>
                    <div class="w-full bg-gray-700/30 rounded-t relative hover:bg-gray-700/50 transition-colors group cursor-pointer"
                        style="height: 75%"></div>
                    <div class="w-full bg-gray-700/30 rounded-t relative hover:bg-gray-700/50 transition-colors group cursor-pointer"
                        style="height: 90%"></div>
                    <div class="w-full bg-gray-700/30 rounded-t relative hover:bg-gray-700/50 transition-colors group cursor-pointer"
                        style="height: 85%"></div>
                    <div class="w-full bg-gray-700/30 rounded-t relative hover:bg-gray-700/50 transition-colors group cursor-pointer"
                        style="height: 95%"></div>
                    <div class="w-full bg-primary/80 rounded-t relative hover:bg-primary transition-colors group cursor-pointer"
                        style="height: 98%">
                        <div
                            class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 text-xs text-primary font-bold opacity-0 group-hover:opacity-100 bg-black/80 px-2 py-1 rounded border border-primary/20">
                            98% Today</div>
                    </div>
                </div>
                <div class="flex justify-between mt-4 text-xs text-gray-500 px-2">
                    <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                </div>
            </div>

            <!-- Cost Analysis -->
            <div class="glass-panel p-6 rounded-xl">
                <h3 class="font-bold text-white mb-6">Cost Breakdown</h3>
                <div class="space-y-4">
                    <div>
                        <div class="flex justify-between text-sm mb-1 text-gray-300">
                            <span>Fuel Costs</span>
                            <span>$12,450 (45%)</span>
                        </div>
                        <div class="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
                            <div class="bg-red-500 h-full w-[45%]"></div>
                        </div>
                    </div>
                    <div>
                        <div class="flex justify-between text-sm mb-1 text-gray-300">
                            <span>Driver Payroll</span>
                            <span>$8,200 (30%)</span>
                        </div>
                        <div class="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
                            <div class="bg-blue-500 h-full w-[30%]"></div>
                        </div>
                    </div>
                    <div>
                        <div class="flex justify-between text-sm mb-1 text-gray-300">
                            <span>Maintenance</span>
                            <span>$4,100 (15%)</span>
                        </div>
                        <div class="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
                            <div class="bg-yellow-500 h-full w-[15%]"></div>
                        </div>
                    </div>
                    <div>
                        <div class="flex justify-between text-sm mb-1 text-gray-300">
                            <span>Other</span>
                            <span>$2,700 (10%)</span>
                        </div>
                        <div class="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
                            <div class="bg-gray-500 h-full w-[10%]"></div>
                        </div>
                    </div>
                </div>

                <div class="mt-8 p-4 bg-white/5 rounded-lg border border-white/5">
                    <div class="text-xs text-gray-400 uppercase font-bold tracking-wide mb-2">Insight</div>
                    <div class="text-sm text-gray-300">Fuel costs have risen by <span
                            class="text-red-400 font-bold">8%</span> compared to last week. Consider optimizing routes
                        in Sector 4.</div>
                </div>
            </div>
        </div>

        <!-- Available Reports List -->
        <div class="glass-panel p-6 rounded-xl">
            <h3 class="font-bold text-white mb-4">Generated Reports</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div
                    class="p-4 bg-white/5 hover:bg-white/10 rounded-lg border border-white/5 hover:border-primary/30 cursor-pointer transition-all group flex items-start gap-3">
                    <div class="p-2 bg-red-500/20 text-red-500 rounded"><span
                            class="material-symbols-outlined">picture_as_pdf</span></div>
                    <div>
                        <div class="font-bold text-white text-sm group-hover:text-primary transition-colors">Monthly
                            Financial Summary</div>
                        <div class="text-xs text-gray-500 mt-1">Generated: Oct 31, 2023</div>
                    </div>
                </div>
                <div
                    class="p-4 bg-white/5 hover:bg-white/10 rounded-lg border border-white/5 hover:border-primary/30 cursor-pointer transition-all group flex items-start gap-3">
                    <div class="p-2 bg-green-500/20 text-green-500 rounded"><span
                            class="material-symbols-outlined">table_view</span></div>
                    <div>
                        <div class="font-bold text-white text-sm group-hover:text-primary transition-colors">Driver
                            Performance Log</div>
                        <div class="text-xs text-gray-500 mt-1">Generated: Yesterday</div>
                    </div>
                </div>
                <div
                    class="p-4 bg-white/5 hover:bg-white/10 rounded-lg border border-white/5 hover:border-primary/30 cursor-pointer transition-all group flex items-start gap-3">
                    <div class="p-2 bg-blue-500/20 text-blue-500 rounded"><span
                            class="material-symbols-outlined">analytics</span></div>
                    <div>
                        <div class="font-bold text-white text-sm group-hover:text-primary transition-colors">SLA Breach
                            Analysis</div>
                        <div class="text-xs text-gray-500 mt-1">Generated: 2 hours ago</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
</script>
