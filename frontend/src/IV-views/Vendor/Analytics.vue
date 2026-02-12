<template>
    <div class="space-y-6">
        <h2 class="text-2xl font-bold text-white">Shipment Analytics</h2>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Spend Chart Placeholder -->
            <div class="glass-panel p-6 rounded-xl">
                <div class="flex justify-between items-center mb-6">
                    <h3 class="font-bold text-white">Monthly Spend</h3>
                    <select class="bg-black/20 text-xs text-white border border-white/10 rounded px-2 py-1">
                        <option>Last 6 Months</option>
                        <option>Last Year</option>
                    </select>
                </div>
                <div class="h-64 flex items-end justify-between px-4 gap-2 border-b border-l border-white/10 relative">
                    <div
                        class="w-full bg-blue-500/20 hover:bg-blue-500/30 rounded-t transition-colors relative group h-[40%]">
                        <div
                            class="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 text-xs text-white hidden group-hover:block">
                            $20k</div>
                    </div>
                    <div
                        class="w-full bg-blue-500/20 hover:bg-blue-500/30 rounded-t transition-colors relative group h-[60%]">
                        <div
                            class="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 text-xs text-white hidden group-hover:block">
                            $32k</div>
                    </div>
                    <div
                        class="w-full bg-blue-500/20 hover:bg-blue-500/30 rounded-t transition-colors relative group h-[50%]">
                        <div
                            class="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 text-xs text-white hidden group-hover:block">
                            $25k</div>
                    </div>
                    <div
                        class="w-full bg-blue-500/20 hover:bg-blue-500/30 rounded-t transition-colors relative group h-[80%]">
                        <div
                            class="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 text-xs text-white hidden group-hover:block">
                            $45k</div>
                    </div>
                    <div
                        class="w-full bg-blue-500/20 hover:bg-blue-500/30 rounded-t transition-colors relative group h-[70%]">
                        <div
                            class="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 text-xs text-white hidden group-hover:block">
                            $38k</div>
                    </div>
                    <div
                        class="w-full bg-blue-500 text-white flex items-start justify-center pt-2 rounded-t h-[90%] shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                        <span class="text-xs font-bold mt-2">Oct</span>
                    </div>
                </div>
                <div class="flex justify-between text-xs text-gray-500 mt-2 px-4">
                    <span>May</span><span>Jun</span><span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span>
                </div>
            </div>

            <!-- Metric Cards -->
            <div class="space-y-6">
                <div class="glass-panel p-6 rounded-xl flex items-center justify-between">
                    <div>
                        <h3 class="font-bold text-white mb-1">On-Time Performance</h3>
                        <p class="text-xs text-gray-400">Percentage of deliveries arrived within window.</p>
                    </div>
                    <div class="text-right">
                        <div class="text-3xl font-bold text-green-400">95.4%</div>
                        <div class="text-xs text-green-500">↑ 2.1%</div>
                    </div>
                </div>
                <div class="glass-panel p-6 rounded-xl flex items-center justify-between">
                    <div>
                        <h3 class="font-bold text-white mb-1">Average Transit Time</h3>
                        <p class="text-xs text-gray-400">NY - LA Route</p>
                    </div>
                    <div class="text-right">
                        <div class="text-3xl font-bold text-blue-400">3.2 Days</div>
                        <div class="text-xs text-green-500">↓ 0.5 Days</div>
                    </div>
                </div>
                <div class="glass-panel p-6 rounded-xl flex items-center justify-between">
                    <div>
                        <h3 class="font-bold text-white mb-1">Cost Per Mile</h3>
                        <p class="text-xs text-gray-400">Average across all routes</p>
                    </div>
                    <div class="text-right">
                        <div class="text-3xl font-bold text-white">$2.45</div>
                        <div class="text-xs text-gray-500">Stable</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
</script>
