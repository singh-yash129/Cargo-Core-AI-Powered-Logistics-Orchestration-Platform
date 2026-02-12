<template>
    <div class="space-y-6">
        <div class="flex justify-between items-center">
            <h2 class="text-2xl font-bold text-white">Returns Processing (Warehouse)</h2>
            <div class="bg-black/40 border border-white/10 rounded-lg p-1 flex">
                <button
                    class="px-4 py-1.5 bg-primary rounded text-background-dark text-sm font-bold shadow-lg">Processing</button>
                <button class="px-4 py-1.5 text-gray-400 hover:text-white text-sm transition-colors">Completed</button>
            </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Grading Station -->
            <div class="lg:col-span-2 glass-panel p-6 rounded-xl">
                <div class="flex justify-between items-center mb-6">
                    <h3 class="font-bold text-white">Item Grading Station 1</h3>
                    <span
                        class="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded border border-green-500/30 animate-pulse">Active</span>
                </div>

                <div class="flex gap-6">
                    <div
                        class="w-1/3 aspect-square bg-gray-800 rounded-lg flex items-center justify-center border border-white/5 relative overflow-hidden group">
                        <span
                            class="material-symbols-outlined text-6xl text-gray-600 group-hover:scale-110 transition-transform">image</span>
                        <div class="absolute bottom-2 left-0 w-full text-center text-xs text-gray-500">Scan Item Image
                        </div>
                    </div>
                    <div class="flex-1 space-y-4">
                        <div>
                            <label class="text-xs text-gray-400 mb-1 block">RMA ID / Tracking #</label>
                            <input type="text" placeholder="Scan barcode..."
                                class="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-primary/50 font-mono">
                        </div>

                        <div class="grid grid-cols-2 gap-4">
                            <button
                                class="p-4 rounded-lg bg-green-500/10 border border-green-500/20 hover:bg-green-500/20 text-green-400 font-bold transition-all flex flex-col items-center gap-2">
                                <span class="material-symbols-outlined">check_circle</span> Resellable
                            </button>
                            <button
                                class="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20 hover:bg-yellow-500/20 text-yellow-400 font-bold transition-all flex flex-col items-center gap-2">
                                <span class="material-symbols-outlined">build</span> Repair
                            </button>
                            <button
                                class="p-4 rounded-lg bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 font-bold transition-all flex flex-col items-center gap-2">
                                <span class="material-symbols-outlined">delete</span> Dispose
                            </button>
                            <button
                                class="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 text-blue-400 font-bold transition-all flex flex-col items-center gap-2">
                                <span class="material-symbols-outlined">recycling</span> Recycle
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Recent Scans -->
            <div class="glass-panel rounded-xl overflow-hidden p-6">
                <h3 class="font-bold text-white mb-4">Recent Graded Items</h3>
                <div class="space-y-4">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 bg-green-500/20 rounded flex items-center justify-center text-green-500">
                            <span class="material-symbols-outlined">check</span></div>
                        <div>
                            <div class="text-white text-sm font-bold">iPhone 13 Case</div>
                            <div class="text-xs text-gray-500">Grade A • Restocked to A-12</div>
                        </div>
                    </div>
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 bg-red-500/20 rounded flex items-center justify-center text-red-500"><span
                                class="material-symbols-outlined">close</span></div>
                        <div>
                            <div class="text-white text-sm font-bold">Blender (Broken)</div>
                            <div class="text-xs text-gray-500">Grade F • Disposal Bin</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
</script>
