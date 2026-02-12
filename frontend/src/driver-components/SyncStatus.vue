<template>
    <div v-if="status !== 'connected'"
        class="fixed top-0 left-0 right-0 z-[100] px-4 py-2 flex justify-center pointer-events-none transition-transform duration-300"
        :class="visible ? 'translate-y-0' : '-translate-y-full'">
        <div class="bg-surface-dark/95 backdrop-blur-md border rounded-full px-4 py-1.5 flex items-center gap-2 shadow-xl"
            :class="status === 'offline' ? 'border-red-500/50 text-red-500' : 'border-amber-500/50 text-amber-500'">
            <div class="relative w-2 h-2">
                <span class="absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping"
                    :class="status === 'offline' ? 'bg-red-500' : 'bg-amber-500'"></span>
                <span class="relative inline-flex rounded-full h-2 w-2"
                    :class="status === 'offline' ? 'bg-red-500' : 'bg-amber-500'"></span>
            </div>
            <span class="text-xs font-bold uppercase tracking-wide">
                {{ status === 'offline' ? 'Offline' : 'Syncing...' }}
            </span>
            <span class="text-[10px] opacity-70 border-l border-white/10 pl-2 ml-1">
                {{ status === 'offline' ? 'Retrying in 5s' : 'Queue: 3' }}
            </span>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const status = ref('connected') // connected, syncing, offline
const visible = ref(true)

// Simulation
onMounted(() => {
    // Simulate offline/sync events
    setInterval(() => {
        // Randomly go 'syncing' every 30s
        if (Math.random() > 0.7 && status.value === 'connected') {
            status.value = 'syncing'
            setTimeout(() => {
                status.value = 'connected'
            }, 3000)
        }
    }, 10000)
})
</script>
