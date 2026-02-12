<template>
    <div class="space-y-8">
        <!-- Quick Actions -->
        <div class="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            <div
                class="glass-panel p-4 md:p-6 rounded-xl hover:border-primary/50 transition-colors cursor-pointer group relative overflow-hidden">
                <div class="absolute right-0 top-0 p-4 opacity-10"><span
                        class="material-symbols-outlined text-6xl">local_shipping</span></div>
                <div
                    class="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
                    <span class="material-symbols-outlined">add_box</span>
                </div>
                <h3 class="font-bold text-lg text-white mb-1">Book a Move</h3>
                <p class="text-sm text-gray-400">Schedule a new house shift or cargo delivery.</p>
            </div>

            <div
                class="glass-panel p-4 md:p-6 rounded-xl hover:border-purple-500/50 transition-colors cursor-pointer group relative overflow-hidden">
                <div class="absolute right-0 top-0 p-4 opacity-10"><span
                        class="material-symbols-outlined text-6xl">camera_enhance</span></div>
                <div
                    class="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400 mb-4 group-hover:scale-110 transition-transform">
                    <span class="material-symbols-outlined">center_focus_strong</span>
                </div>
                <h3 class="font-bold text-lg text-white mb-1">AI Estimator</h3>
                <p class="text-sm text-gray-400">Upload a room photo to get volume estimates.</p>
            </div>

            <div
                class="glass-panel p-4 md:p-6 rounded-xl hover:border-green-500/50 transition-colors cursor-pointer group relative overflow-hidden">
                <div class="absolute right-0 top-0 p-4 opacity-10"><span
                        class="material-symbols-outlined text-6xl">calculate</span></div>
                <div
                    class="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center text-green-400 mb-4 group-hover:scale-110 transition-transform">
                    <span class="material-symbols-outlined">request_quote</span>
                </div>
                <h3 class="font-bold text-lg text-white mb-1">Get Instant Quote</h3>
                <p class="text-sm text-gray-400">Check prices for different vehicle types.</p>
            </div>
        </div>

        <!-- Active Move & Cost Summary -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Active Move Card -->
            <div class="lg:col-span-2 glass-panel p-4 md:p-6 rounded-xl relative overflow-hidden">
                <h3 class="font-bold text-white mb-4 flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    Active Move Status
                </h3>

                <div class="flex flex-col md:flex-row gap-6">
                    <!-- Map / Tracking -->
                    <div class="flex-1 bg-gray-800 rounded-lg h-48 relative overflow-hidden">
                        <div
                            class="absolute inset-0 bg-[url('/src/assets/map-dark.png')] bg-cover bg-center opacity-70">
                        </div>
                        <div class="absolute bottom-2 left-2 bg-black/80 px-3 py-1 rounded text-xs text-white">
                            ETA: <span class="text-green-400 font-bold">14:30 PM</span>
                        </div>
                    </div>

                    <!-- Details -->
                    <div class="flex-1 space-y-4">
                        <div>
                            <div class="text-xs text-gray-400 uppercase font-bold tracking-wide">Current Status</div>
                            <div class="text-xl font-bold text-primary mt-1">On Route</div>
                            <div class="w-full bg-gray-700 h-1.5 rounded-full overflow-hidden mt-2">
                                <div class="bg-primary h-full w-[60%] animate-pulse"></div>
                            </div>
                        </div>

                        <div class="flex justify-between items-center py-2 border-b border-white/5">
                            <div class="flex items-center gap-3">
                                <img src="https://i.pravatar.cc/150?u=12"
                                    class="w-10 h-10 rounded-full border border-white/10">
                                <div>
                                    <div class="text-sm font-bold text-white">Mike Ross</div>
                                    <div class="text-xs text-gray-400">Driver (4.9 ★)</div>
                                </div>
                            </div>
                            <button class="p-2 bg-white/5 rounded-full hover:bg-white/10 text-white"><span
                                    class="material-symbols-outlined">call</span></button>
                        </div>

                        <div class="flex justify-between text-sm">
                            <span class="text-gray-400">Labor:</span>
                            <span class="text-white">2 Helpers Assigned</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Cost Summary Widget -->
            <div class="glass-panel p-4 md:p-6 rounded-xl">
                <h3 class="font-bold text-white mb-4">Cost Summary</h3>
                <div class="space-y-3">
                    <div class="flex justify-between text-sm">
                        <span class="text-gray-400">Base Transport</span>
                        <span class="text-white font-mono">$120.00</span>
                    </div>
                    <div class="flex justify-between text-sm">
                        <span class="text-gray-400">Labor Charges (x2)</span>
                        <span class="text-white font-mono">$80.00</span>
                    </div>
                    <div class="flex justify-between text-sm">
                        <span class="text-gray-400">Packing Materials</span>
                        <span class="text-white font-mono">$45.00</span>
                    </div>
                    <div class="border-t border-white/10 pt-3 flex justify-between items-end">
                        <span class="text-gray-300 font-bold">Total</span>
                        <span class="text-2xl font-bold text-primary">$245.00</span>
                    </div>
                </div>

                <div class="mt-6">
                    <div class="flex items-center gap-2 mb-2">
                        <span class="material-symbols-outlined text-green-500">check_circle</span>
                        <span class="text-sm text-green-400 font-bold">Payment Verified</span>
                    </div>
                    <button
                        class="w-full py-2 bg-white/5 hover:bg-white/10 text-white text-sm font-bold rounded-lg transition-colors">Download
                        Invoice</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
</script>
