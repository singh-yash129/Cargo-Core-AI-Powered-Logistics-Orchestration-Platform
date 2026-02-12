<template>
    <div class="space-y-6">
        <div class="flex items-center gap-3">
            <div
                class="w-10 h-10 rounded-full bg-gradient-to-tr from-green-400 to-blue-500 flex items-center justify-center shadow-lg shadow-green-500/30">
                <span class="material-symbols-outlined text-black">health_and_safety</span>
            </div>
            <h2 class="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500">
                Smart Dispatch Assistant</h2>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- AI Recommendations -->
            <div class="glass-panel p-6 rounded-xl">
                <h3 class="font-bold text-white mb-4 flex items-center gap-2">
                    <span class="material-symbols-outlined text-primary">lightbulb</span>
                    Live Optimization Suggestions
                </h3>
                <div class="space-y-4">
                    <div
                        class="p-4 bg-white/5 border border-white/5 rounded-xl hover:border-primary/30 transition-all cursor-pointer group">
                        <div class="flex justify-between items-start mb-2">
                            <div class="text-primary font-bold text-sm">Fuel Saving Opportunity</div>
                            <div class="text-xs text-gray-500">Confidence: 94%</div>
                        </div>
                        <div class="text-sm text-gray-300 mb-2">Driver <strong>Mike Ross</strong> is near Hub 2.
                            Assigning <strong>Order #9921</strong> for pickup will save 12km detours later.</div>
                        <button
                            class="bg-primary/20 hover:bg-primary/30 text-primary px-3 py-1 rounded text-xs font-bold transition-colors">Apply
                            Change</button>
                    </div>

                    <div
                        class="p-4 bg-white/5 border border-white/5 rounded-xl hover:border-primary/30 transition-all cursor-pointer group">
                        <div class="flex justify-between items-start mb-2">
                            <div class="text-yellow-400 font-bold text-sm">Delay Prediction</div>
                            <div class="text-xs text-gray-500">Confidence: 88%</div>
                        </div>
                        <div class="text-sm text-gray-300 mb-2">Traffic building up on Route 4. <strong>3
                                Drivers</strong> likely to miss 5pm window. Suggest rerouting to Route 7 (adds 5km but
                            saves 20 mins).</div>
                        <div class="flex gap-2">
                            <button
                                class="bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 px-3 py-1 rounded text-xs font-bold transition-colors">Reroute</button>
                            <button
                                class="bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded text-xs font-bold transition-colors">Ignore</button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Predictive Load -->
            <div class="glass-panel p-6 rounded-xl">
                <h3 class="font-bold text-white mb-4">Demand Prediction (Next 4 Hours)</h3>
                <div
                    class="h-64 bg-black/20 rounded-lg flex items-end justify-around px-4 pb-2 relative overflow-hidden">
                    <!-- Simulated Wave -->
                    <div class="absolute inset-0 flex items-center justify-center text-gray-500 text-xs">Chart
                        Placeholder</div>
                    <div class="w-8 bg-blue-500/30 rounded-t h-[40%]"></div>
                    <div class="w-8 bg-blue-500/40 rounded-t h-[55%]"></div>
                    <div class="w-8 bg-blue-500/60 rounded-t h-[80%]"></div>
                    <div class="w-8 bg-blue-500/80 rounded-t h-[65%]"></div>
                    <div class="w-8 bg-blue-500/50 rounded-t h-[50%]"></div>
                    <div class="w-8 bg-blue-500/30 rounded-t h-[30%]"></div>
                </div>
                <div class="mt-4 text-center text-sm text-gray-400">
                    Peak expected at <span class="text-white font-bold">14:00</span>. Prepare 3 extra drivers.
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
</script>
