<template>
    <div class="h-[calc(100vh-8rem)] flex flex-col gap-4">
        <div class="flex justify-between items-center">
            <h2 class="text-2xl font-bold text-white">Warehouse Floor Plan (Live)</h2>
            <div class="flex items-center gap-3">
                <div class="flex items-center gap-2 text-xs">
                    <span class="w-3 h-3 bg-green-500 rounded-sm"></span> Free Space
                    <span class="w-3 h-3 bg-yellow-500 rounded-sm"></span> Occupied
                    <span class="w-3 h-3 bg-red-500 rounded-sm"></span> Blocked
                </div>
                <button
                    class="bg-white/5 hover:bg-white/10 text-white border border-white/10 py-1.5 px-3 rounded text-sm transition-colors">Edit
                    Layout</button>
            </div>
        </div>

        <div class="flex-1 glass-panel rounded-xl relative overflow-hidden flex">
            <!-- Map visualization -->
            <div class="flex-1 bg-gray-900 relative p-8 overflow-auto flex items-center justify-center">
                <!-- Simulated Warehouse Grid -->
                <div class="grid grid-cols-10 gap-2 w-full max-w-4xl opacity-80">
                    <!-- Shelf Rows -->
                    <div v-for="i in 50" :key="i"
                        class="h-12 rounded border border-white/5 flex items-center justify-center text-[10px] text-gray-500 font-mono hover:border-primary cursor-pointer transition-colors relative group"
                        :class="getSlotClass(i)">
                        {{ getSlotLabel(i) }}
                        <!-- Hover Detail -->
                        <div
                            class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-32 bg-black/90 text-white p-2 rounded text-xs hidden group-hover:block z-10 pointer-events-none">
                            <div class="font-bold mb-1">Slot {{ getSlotLabel(i) }}</div>
                            <div class="text-gray-400">Occupancy: 85%</div>
                            <div class="text-primary">Zone A</div>
                        </div>
                    </div>

                    <!-- Aisle / Walkway placeholder (every 10th slot maybe?) - simplified for grid -->
                </div>

                <!-- Forklift simulation -->
                <div
                    class="absolute top-1/4 left-1/4 w-6 h-6 bg-yellow-400 text-black flex items-center justify-center rounded text-[10px] font-bold animate-bounce shadow-lg shadow-yellow-500/50">
                    F1</div>
                <div
                    class="absolute bottom-1/3 right-1/4 w-6 h-6 bg-yellow-400 text-black flex items-center justify-center rounded text-[10px] font-bold animate-pulse shadow-lg shadow-yellow-500/50">
                    F2</div>
            </div>

            <!-- Detail Sidebar -->
            <div class="w-72 border-l border-white/5 bg-black/20 p-6 flex flex-col">
                <h3 class="font-bold text-white mb-4">Zone A Statistics</h3>

                <div class="space-y-6">
                    <div>
                        <div class="flex justify-between text-sm mb-1 text-gray-300">
                            <span>Occupancy</span>
                            <span>82%</span>
                        </div>
                        <div class="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
                            <div class="bg-primary h-full w-[82%]"></div>
                        </div>
                    </div>
                    <div>
                        <div class="flex justify-between text-sm mb-1 text-gray-300">
                            <span>Temperature</span>
                            <span>22°C (OK)</span>
                        </div>
                        <div class="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
                            <div class="bg-green-500 h-full w-[60%]"></div>
                        </div>
                    </div>
                    <div>
                        <div class="flex justify-between text-sm mb-1 text-gray-300">
                            <span>Pick Rate (Today)</span>
                            <span>140/hr</span>
                        </div>
                        <div class="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
                            <div class="bg-blue-500 h-full w-[70%]"></div>
                        </div>
                    </div>
                </div>

                <div class="mt-auto">
                    <div class="p-3 bg-white/5 rounded-lg border border-white/5">
                        <div class="text-xs text-gray-400 uppercase font-bold mb-2">Active Picker in Zone</div>
                        <div class="flex items-center gap-3">
                            <img src="https://i.pravatar.cc/150?u=15" class="w-8 h-8 rounded-full">
                            <div class="text-sm text-white">John Doe</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
const getSlotClass = (i) => {
    if (i % 7 === 0) return 'bg-red-500/20 border-red-500/30' // Blocked/Full
    if (i % 3 === 0) return 'bg-yellow-500/20 border-yellow-500/30' // Occupied
    return 'bg-green-500/10 border-green-500/20' // Free
}

const getSlotLabel = (i) => {
    const row = String.fromCharCode(65 + Math.floor((i - 1) / 10))
    const col = (i - 1) % 10 + 1
    return `${row}-${col}`
}
</script>
