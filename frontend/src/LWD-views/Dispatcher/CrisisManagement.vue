<template>
    <div class="space-y-6">
        <div class="flex items-center gap-3">
            <div
                class="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center animate-pulse shadow-lg shadow-red-500/30">
                <span class="material-symbols-outlined text-white">warning</span>
            </div>
            <h2 class="text-2xl font-bold text-red-400">Crisis Management Center</h2>
        </div>

        <!-- Active Crisis Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="bg-red-500/10 border border-red-500/30 rounded-xl p-6 relative overflow-hidden">
                <div class="fle justify-between items-start mb-4">
                    <div class="flex items-center gap-2">
                        <span
                            class="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded animate-pulse">CRITICAL</span>
                        <span class="text-white font-bold">Vehicle Breakdown</span>
                    </div>
                    <div class="text-xs text-gray-400">12 mins ago</div>
                </div>
                <div class="text-gray-200 mb-4">
                    Vehicle <span class="text-white font-bold">TRK-402</span> reported engine failure on Highway 9.
                    Cargo includes perishable items.
                </div>
                <div class="flex gap-3">
                    <button
                        class="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2 rounded-lg transition-colors">Dispatch
                        Recovery</button>
                    <button
                        class="flex-1 bg-white/10 hover:bg-white/20 text-white font-bold py-2 rounded-lg transition-colors">Contact
                        Driver</button>
                </div>
            </div>

            <div class="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6 relative overflow-hidden">
                <div class="fle justify-between items-start mb-4">
                    <div class="flex items-center gap-2">
                        <span class="px-2 py-1 bg-yellow-500 text-black text-xs font-bold rounded">HIGH</span>
                        <span class="text-white font-bold">Route Blockage</span>
                    </div>
                    <div class="text-xs text-gray-400">35 mins ago</div>
                </div>
                <div class="text-gray-200 mb-4">
                    Major accident reported on I-95 North. 4 trucks will be delayed by ~45 mins.
                </div>
                <div class="flex gap-3">
                    <button
                        class="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 rounded-lg transition-colors">Reroute
                        All</button>
                    <button
                        class="flex-1 bg-white/10 hover:bg-white/20 text-white font-bold py-2 rounded-lg transition-colors">Ignore</button>
                </div>
            </div>
        </div>

        <!-- Map View of Alerts -->
        <div class="glass-panel rounded-xl h-[400px] relative overflow-hidden">
            <div
                class="absolute inset-0 bg-gray-800 bg-[url('/src/assets/map-dark.png')] bg-cover bg-center opacity-50">
            </div>
            <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div class="bg-black/80 backdrop-blur border border-red-500/30 px-6 py-4 rounded-xl text-center">
                    <div class="text-red-400 font-bold text-lg mb-1">Live Crisis Map</div>
                    <div class="text-gray-400 text-xs">Showing 2 active incidents in your region</div>
                </div>
            </div>
            <!-- Simulated Pins -->
            <div class="absolute top-1/3 left-1/4 w-4 h-4 rounded-full bg-red-500 animate-ping"></div>
            <div class="absolute top-1/3 left-1/4 w-4 h-4 rounded-full bg-red-500 border-2 border-white"></div>

            <div class="absolute bottom-1/3 right-1/3 w-4 h-4 rounded-full bg-yellow-500 animate-ping"></div>
            <div class="absolute bottom-1/3 right-1/3 w-4 h-4 rounded-full bg-yellow-500 border-2 border-white"></div>
        </div>

        <!-- Crisis History Log -->
        <div class="glass-panel rounded-xl p-6">
            <h3 class="font-bold text-white mb-4">Resolved Incidents (Today)</h3>
            <div class="space-y-4">
                <div class="flex items-start gap-3 pb-3 border-b border-white/5">
                    <span class="material-symbols-outlined text-green-500">check_circle</span>
                    <div>
                        <div class="text-gray-300 text-sm">Driver No-Show (Mike t.) - Replacement Found</div>
                        <div class="text-xs text-gray-500">Resolved at 08:15 AM by Scheduler AI</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
</script>
