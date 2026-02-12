<template>
    <div class="space-y-6">
        <div class="flex items-center gap-3">
            <div
                class="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
                <span class="material-symbols-outlined text-white">camera_enhance</span>
            </div>
            <h2 class="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">AI
                Volume Estimator</h2>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <!-- Upload Section -->
            <div
                class="glass-panel p-8 rounded-xl border border-dashed border-white/20 flex flex-col items-center justify-center text-center min-h-[400px] relative hover:bg-white/5 transition-colors cursor-pointer group">
                <input type="file" class="absolute inset-0 opacity-0 cursor-pointer">
                <div
                    class="w-24 h-24 rounded-full bg-purple-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <span class="material-symbols-outlined text-5xl text-purple-400">cloud_upload</span>
                </div>
                <h3 class="text-xl font-bold text-white mb-2">Upload Room Photo</h3>
                <p class="text-gray-400 max-w-sm mb-6">Or take a picture directly. Our AI will analyze furniture and
                    boxes to estimate volume.</p>
                <button
                    class="px-6 py-2 rounded-full bg-purple-500 hover:bg-purple-600 text-white font-bold transition-colors">Select
                    Image</button>
                <p class="text-xs text-gray-500 mt-4">Supported: JPG, PNG, HEIC</p>
            </div>

            <!-- Results / Demo -->
            <div class="space-y-6">
                <div class="glass-panel p-6 rounded-xl border-l-4 border-purple-500">
                    <h3 class="font-bold text-white mb-4">How it works</h3>
                    <div class="space-y-4">
                        <div class="flex items-start gap-4">
                            <span
                                class="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white">1</span>
                            <p class="text-sm text-gray-400">Take photos of each room you want to move.</p>
                        </div>
                        <div class="flex items-start gap-4">
                            <span
                                class="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white">2</span>
                            <p class="text-sm text-gray-400">AI identifies items (Bed, Sofa, TV) and calculates cubic
                                feet.</p>
                        </div>
                        <div class="flex items-start gap-4">
                            <span
                                class="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white">3</span>
                            <p class="text-sm text-gray-400">Get a recommended truck size and labor count instantly.</p>
                        </div>
                    </div>
                </div>

                <div class="glass-panel p-6 rounded-xl opacity-50 pointer-events-none">
                    <h3 class="font-bold text-gray-400 mb-2">Analysis Results</h3>
                    <p class="text-sm text-gray-500">Upload a photo to see results here...</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
</script>
