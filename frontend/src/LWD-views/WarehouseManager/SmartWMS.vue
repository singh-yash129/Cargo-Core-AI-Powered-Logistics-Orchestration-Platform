<template>
    <div class="space-y-6">
        <div class="flex items-center gap-3">
            <div
                class="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-400 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
                <span class="material-symbols-outlined text-white">psychology</span>
            </div>
            <h2 class="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
                Smart WMS Intelligence</h2>
        </div>

        <!-- AI Insights Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div class="glass-panel p-6 rounded-xl hover:border-purple-500/50 transition-colors cursor-pointer group">
                <div class="flex items-start justify-between mb-4">
                    <div class="p-3 bg-purple-500/20 text-purple-400 rounded-lg"><span
                            class="material-symbols-outlined">inventory_2</span></div>
                    <div class="text-xs text-gray-500">Confidence: 99%</div>
                </div>
                <h3 class="font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">Slotting
                    Optimization</h3>
                <p class="text-sm text-gray-400">Move "Winter Jackets" to Zone A (Near Dock) to reduce travel time by
                    15% for upcoming seasonal demand.</p>
                <button
                    class="mt-4 w-full py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded text-sm font-bold transition-colors">Optimize
                    Layout</button>
            </div>

            <div class="glass-panel p-6 rounded-xl hover:border-blue-500/50 transition-colors cursor-pointer group">
                <div class="flex items-start justify-between mb-4">
                    <div class="p-3 bg-blue-500/20 text-blue-400 rounded-lg"><span
                            class="material-symbols-outlined">schedule</span></div>
                    <div class="text-xs text-gray-500">Confidence: 92%</div>
                </div>
                <h3 class="font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">Predictive Staffing
                </h3>
                <p class="text-sm text-gray-400">Inbound volume spike expected tomorrow at 10 AM. Schedule 2 extra
                    forklift operators for Morning Shift.</p>
                <button
                    class="mt-4 w-full py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded text-sm font-bold transition-colors">Adjust
                    Roster</button>
            </div>

            <div class="glass-panel p-6 rounded-xl hover:border-red-500/50 transition-colors cursor-pointer group">
                <div class="flex items-start justify-between mb-4">
                    <div class="p-3 bg-red-500/20 text-red-400 rounded-lg"><span
                            class="material-symbols-outlined">warning</span></div>
                    <div class="text-xs text-gray-500">Risk: High</div>
                </div>
                <h3 class="font-bold text-white mb-2 group-hover:text-red-400 transition-colors">Maintenance Alert</h3>
                <p class="text-sm text-gray-400">Conveyor Belt 3 showing irregular vibration patterns. Failure predicted
                    within 48 hours.</p>
                <button
                    class="mt-4 w-full py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded text-sm font-bold transition-colors">Schedule
                    Service</button>
            </div>
        </div>
    </div>
</template>

<script setup>
</script>
