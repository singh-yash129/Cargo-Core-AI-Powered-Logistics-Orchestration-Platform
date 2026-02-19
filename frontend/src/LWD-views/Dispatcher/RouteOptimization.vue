<template>
    <div class="space-y-6">
        <div class="flex justify-between items-center">
            <h2 class="text-2xl font-bold text-white">Route Optimization</h2>
            <button
                class="bg-primary hover:bg-primary-dark text-background-dark font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors">
                <span class="material-symbols-outlined">auto_fix_high</span>
                Run Optimizer
            </button>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-12rem)]">
            <!-- Configuration Panel -->
            <div class="glass-panel p-6 rounded-xl overflow-y-auto">
                <h3 class="font-bold text-white mb-4">Optimization Settings</h3>

                <div class="space-y-4">
                    <div>
                        <label class="block text-xs text-gray-400 mb-1">Optimization Goal</label>
                        <select class="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white text-sm">
                            <option>Minimize Distance</option>
                            <option>Minimize Time</option>
                            <option>Balance Workload</option>
                        </select>
                    </div>

                    <div>
                        <label class="block text-xs text-gray-400 mb-1">Constraints</label>
                        <div class="space-y-2">
                            <label class="flex items-center gap-2 text-sm text-gray-300">
                                <input type="checkbox" checked
                                    class="rounded border-gray-600 bg-black/20 text-primary focus:ring-primary">
                                <span>Avoid Toll Roads</span>
                            </label>
                            <label class="flex items-center gap-2 text-sm text-gray-300">
                                <input type="checkbox" checked
                                    class="rounded border-gray-600 bg-black/20 text-primary focus:ring-primary">
                                <span>Prioritize VIP Orders</span>
                            </label>
                            <label class="flex items-center gap-2 text-sm text-gray-300">
                                <input type="checkbox"
                                    class="rounded border-gray-600 bg-black/20 text-primary focus:ring-primary">
                                <span>Electric Vehicle Routing</span>
                            </label>
                        </div>
                    </div>

                    <div class="pt-4 border-t border-white/5">
                        <h4 class="text-sm font-bold text-white mb-2">Unassigned Orders (42)</h4>
                        <div class="bg-black/20 rounded p-2 text-xs text-gray-400 h-32 overflow-y-auto">
                            <div class="flex justify-between py-1 border-b border-white/5"><span>ORD-9912 (Zone
                                    A)</span><span class="text-yellow-400">High</span></div>
                            <div class="flex justify-between py-1 border-b border-white/5"><span>ORD-8821 (Zone
                                    B)</span><span class="text-gray-500">Normal</span></div>
                            <div class="flex justify-between py-1 border-b border-white/5"><span>ORD-7712 (Zone
                                    A)</span><span class="text-gray-500">Normal</span></div>
                            <div class="flex justify-between py-1 border-b border-white/5"><span>ORD-1120 (Zone
                                    C)</span><span class="text-red-400">Critical</span></div>
                        </div>
                    </div>
                </div>

                <div class="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-xs text-blue-300">
                    <span class="font-bold">AI Tip:</span> Grouping Zone A orders could save 15% fuel today.
                </div>
            </div>

            <!-- Map Result Visualization -->
            <div class="lg:col-span-2 glass-panel rounded-xl relative overflow-hidden flex flex-col">
                <div class="absolute inset-0 bg-gray-800 bg-gradient-to-br from-gray-800 to-gray-900 opacity-70">
                </div>

                <!-- Simulated Route Lines -->
                <svg class="absolute inset-0 w-full h-full pointer-events-none">
                    <path d="M 100 100 L 200 200 L 300 150" stroke="#1CE783" stroke-width="3" fill="none"
                        stroke-dasharray="5,5" class="animate-pulse" />
                    <circle cx="100" cy="100" r="4" fill="white" />
                    <circle cx="200" cy="200" r="4" fill="white" />
                    <circle cx="300" cy="150" r="4" fill="white" />
                </svg>

                <!-- Results Summary Overlay -->
                <div
                    class="absolute bottom-6 left-6 right-6 bg-black/80 backdrop-blur-md rounded-lg p-4 border border-white/10 flex justify-between items-center">
                    <div>
                        <div class="text-xs text-gray-400">Proposed Solution</div>
                        <div class="text-white font-bold">14 Routes • 842 km Total • 96% Efficiency</div>
                    </div>
                    <div class="flex gap-2">
                        <button
                            class="px-4 py-2 rounded bg-white/10 hover:bg-white/20 text-white text-sm transition-colors">Adjust</button>
                        <button
                            class="px-4 py-2 rounded bg-primary text-black font-bold text-sm hover:bg-primary-dark transition-colors">Apply
                            Routes</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
</script>
