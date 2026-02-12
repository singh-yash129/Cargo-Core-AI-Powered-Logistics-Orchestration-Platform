<template>
    <div
        class="bg-background-dark text-white min-h-screen flex flex-col font-display antialiased selection-custom pb-safe">
        <!-- Header -->
        <header
            class="px-6 pt-6 pb-4 flex justify-between items-end z-10 bg-background-dark/95 backdrop-blur-sm sticky top-0">
            <div>
                <h2 class="text-sm font-medium text-primary uppercase tracking-wider mb-1">Route Progress</h2>
                <h1 class="text-3xl font-bold tracking-tight text-white">45% Complete</h1>
            </div>
            <div class="flex flex-col items-end">
                <div class="text-2xl font-bold text-white">12<span class="text-sm font-normal text-gray-500 ml-1">/
                        28</span></div>
                <div class="text-[10px] text-gray-400 uppercase tracking-widest">Stops Done</div>
            </div>
        </header>

        <!-- Main Content -->
        <main class="flex-1 px-6 flex flex-col relative z-0 overflow-y-auto pb-24">

            <!-- Progress Bar -->
            <div class="mb-8">
                <div class="w-full bg-gray-800 rounded-full h-2 mb-2">
                    <div class="bg-gradient-to-r from-primary to-primary-dark h-2 rounded-full shadow-[0_0_10px_rgba(28,231,131,0.5)]"
                        style="width: 45%"></div>
                </div>
                <div class="flex justify-between text-xs font-medium text-gray-400">
                    <span>Start: 8:00 AM</span>
                    <span class="text-primary">On Time</span>
                    <span>Est. End: 2:30 PM</span>
                </div>
            </div>

            <!-- Map Overview Card -->
            <div class="relative w-full h-48 rounded-2xl overflow-hidden mb-8 shadow-2xl border border-white/5 group">
                <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&q=80" alt="Route Map"
                    class="w-full h-full object-cover opacity-60 grayscale group-hover:grayscale-0 transition-all duration-700 transform group-hover:scale-105" />
                <div class="absolute inset-0 bg-gradient-to-t from-background-dark/90 to-transparent"></div>

                <!-- Map Overlay Info -->
                <div class="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                    <div>
                        <div class="flex items-center gap-2 mb-1">
                            <span class="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                            <span class="text-xs font-bold text-white uppercase tracking-wider">Live Tracking</span>
                        </div>
                        <p class="text-gray-300 text-sm">Zone: Downtown & North</p>
                    </div>
                    <button
                        class="bg-white/10 backdrop-blur-md hover:bg-white/20 p-2 rounded-lg border border-white/10 transition-colors">
                        <span class="material-icons text-white">fullscreen</span>
                    </button>
                </div>
            </div>

            <!-- Upcoming Stops Preview -->
            <div class="flex-1">
                <h3 class="text-gray-400 text-xs font-bold uppercase tracking-widest mb-4">Next Up</h3>

                <div class="space-y-4">
                    <!-- Next Stop (Highlighted) -->
                    <div @click="$router.push('/navigation')"
                        class="bg-card-dark border border-primary/30 rounded-xl p-5 relative overflow-hidden group active:scale-[0.98] transition-transform cursor-pointer">
                        <div class="absolute right-0 top-0 p-3">
                            <span
                                class="bg-primary/10 text-primary text-[10px] font-bold px-2 py-1 rounded border border-primary/20">NEXT</span>
                        </div>
                        <div class="flex items-start gap-4">
                            <div class="flex flex-col items-center">
                                <div
                                    class="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-background-dark font-bold text-sm shadow-lg">
                                    13</div>
                                <div class="w-0.5 h-full bg-primary/20 my-1"></div>
                            </div>
                            <div class="flex-1">
                                <h4 class="text-lg font-bold text-white mb-1">TechSoft Inc.</h4>
                                <p class="text-gray-400 text-sm mb-3">500 Terry Francois St</p>
                                <div class="flex items-center gap-3">
                                    <span
                                        class="text-xs bg-surface-dark border border-white/10 px-2 py-1 rounded text-gray-300 flex items-center gap-1">
                                        <span class="material-icons text-[10px] text-primary">inventory_2</span> 3 Pkgs
                                    </span>
                                    <span class="text-xs text-primary font-medium">1.2 mi away</span>
                                </div>
                            </div>
                            <div class="self-center">
                                <span
                                    class="material-icons text-primary text-2xl group-hover:translate-x-1 transition-transform">chevron_right</span>
                            </div>
                        </div>
                    </div>

                    <!-- Subsequent Stops -->
                    <div v-for="i in 3" :key="i"
                        class="bg-card-dark/50 border border-white/5 rounded-xl p-4 flex items-center gap-4 opacity-60">
                        <div
                            class="w-8 h-8 rounded-full bg-surface-dark border border-white/10 flex items-center justify-center text-gray-500 font-bold text-sm">
                            {{ 13 + i }}</div>
                        <div class="flex-1">
                            <h4 class="text-base font-medium text-gray-300">Stop Name {{ 13 + i }}</h4>
                            <p class="text-gray-500 text-xs">Address Line Here</p>
                        </div>
                    </div>
                </div>
            </div>
        </main>

        <!-- Floating Action Button -->
        <div class="fixed bottom-6 left-6 right-6 z-20">
            <button @click="$router.push('/navigation')"
                class="w-full bg-primary hover:bg-primary-dark text-background-dark font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(28,231,131,0.4)] flex items-center justify-center gap-2 active:scale-[0.98] transition-all">
                <span class="material-icons">navigation</span>
                Resume Navigation
            </button>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<style scoped>
.pb-safe {
    padding-bottom: env(safe-area-inset-bottom);
}
</style>
