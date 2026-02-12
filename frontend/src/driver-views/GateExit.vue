<template>
    <div class="bg-background-dark text-white min-h-screen flex flex-col font-display antialiased p-6 pb-24">
        <header class="mb-6">
            <h1 class="text-3xl font-bold">Gate Exit</h1>
            <p class="text-gray-400 mt-1">Scan gate pass to leave warehouse</p>
        </header>

        <div class="flex-1 flex flex-col items-center justify-center relative">
            <!-- QR Code Placeholder -->
            <div class="w-64 h-64 bg-white p-4 rounded-xl mb-8 relative overflow-hidden group">
                <div class="w-full h-full bg-black flex items-center justify-center">
                    <!-- Mock QR -->
                    <div class="grid grid-cols-4 gap-1 w-48 h-48 opacity-80">
                        <div v-for="i in 16" :key="i" class="bg-white rounded-sm"
                            :class="Math.random() > 0.5 ? 'opacity-100' : 'opacity-0'"></div>
                    </div>
                </div>
                <!-- Scan Line Animation -->
                <div
                    class="absolute top-0 left-0 w-full h-1 bg-primary shadow-[0_0_15px_rgba(68,233,150,0.8)] animate-scan">
                </div>
            </div>

            <p class="text-center text-gray-400 text-sm mb-8">Present this code to the gate security officer<br>or align
                with the gate scanner.</p>

            <!-- Status -->
            <div class="flex items-center gap-3 bg-surface-dark border border-white/10 px-5 py-3 rounded-full">
                <div class="w-3 h-3 rounded-full bg-amber-500 animate-pulse"></div>
                <span class="font-bold text-sm text-gray-300">Waiting for gate signal...</span>
            </div>
        </div>

        <!-- Simulation Button -->
        <button @click="simulateExit"
            class="w-full bg-surface-dark border border-white/10 text-gray-500 py-4 rounded-xl font-bold hover:bg-white/5 hover:text-white transition-all flex items-center justify-center gap-2">
            <span class="material-icons">sensors</span>
            Simulate Gate Open
        </button>
    </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const simulateExit = () => {
    // In real app, listen for websocket or BLE beacon
    router.push('/route-progress') // Or directly to navigation
}
</script>

<style scoped>
@keyframes scan {
    0% {
        top: 0;
    }

    50% {
        top: 100%;
    }

    100% {
        top: 0;
    }
}

.animate-scan {
    animation: scan 3s linear infinite;
}
</style>
