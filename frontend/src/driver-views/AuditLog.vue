<template>
    <div class="bg-background-dark text-white min-h-screen flex flex-col font-display antialiased p-6 pb-24">
        <header class="mb-6 flex items-center gap-3">
            <button @click="$router.back()"
                class="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/10">
                <span class="material-icons text-gray-400">arrow_back</span>
            </button>
            <div>
                <h1 class="text-2xl font-bold">Audit Log</h1>
                <p class="text-xs text-gray-400 uppercase tracking-widest">Immutable Record</p>
            </div>
        </header>

        <div class="space-y-4">
            <div v-for="log in auditLogs" :key="log.id"
                class="glass-panel p-4 rounded-xl flex items-start gap-3 border-l-2" :class="log.color">
                <div class="mt-1">
                    <span class="text-[10px] font-mono opacity-50 block">{{ log.hash }}</span>
                    <p class="font-bold text-sm">{{ log.action }}</p>
                    <p class="text-xs text-gray-400">{{ log.details }}</p>
                </div>
                <div class="ml-auto text-right">
                    <p class="text-xs font-mono text-gray-500">{{ log.time }}</p>
                    <span class="material-icons text-[10px] text-primary" v-if="log.verified">verified</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'

const auditLogs = ref([
    { id: 1, hash: '0x8f...2a1', action: 'Shift Started', details: 'Driver verified via biometric login', time: '08:00 AM', color: 'border-green-500', verified: true },
    { id: 2, hash: '0x3b...9c4', action: 'Vehicle Inspection', details: 'Passed with 4 minor notes', time: '08:15 AM', color: 'border-blue-500', verified: true },
    { id: 3, hash: '0x7e...1d2', action: 'Route Optimized', details: 'Dispatcher update triggered', time: '10:24 AM', color: 'border-amber-500', verified: true },
    { id: 4, hash: '0x1a...5f9', action: 'Payment Received', details: 'COD $45.00 collected', time: '11:30 AM', color: 'border-green-500', verified: true },
    { id: 5, hash: '0x9c...3b2', action: 'Package Delivered', details: 'Stop #5 - Photo proof uploaded', time: '12:45 PM', color: 'border-blue-500', verified: true }
])
</script>
