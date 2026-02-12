<template>
    <div class="bg-background-dark text-white min-h-screen flex flex-col p-6 pb-24 font-display antialiased">
        <header class="mb-6 flex items-center gap-3">
            <button @click="$router.back()"
                class="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors">
                <span class="material-icons text-gray-400">arrow_back</span>
            </button>
            <h1 class="text-2xl font-bold">Safety Score</h1>
        </header>

        <!-- Score Circle -->
        <div class="flex items-center justify-center mb-8 relative">
            <svg class="transform -rotate-90 w-48 h-48">
                <circle cx="96" cy="96" r="88" stroke="currentColor" stroke-width="12" fill="transparent"
                    class="text-gray-800" />
                <circle cx="96" cy="96" r="88" stroke="currentColor" stroke-width="12" fill="transparent"
                    :stroke-dasharray="circumference" :stroke-dashoffset="circumference - (score / 100) * circumference"
                    class="text-primary transition-all duration-1000 ease-out" />
            </svg>
            <div class="absolute inset-0 flex flex-col items-center justify-center">
                <span class="text-5xl font-bold tracking-tighter">{{ score }}</span>
                <span class="text-xs text-gray-400 uppercase tracking-widest mt-1">Excellent</span>
            </div>
        </div>

        <!-- Metrics Grid -->
        <div class="grid grid-cols-2 gap-4 mb-6">
            <div v-for="metric in metrics" :key="metric.label" class="glass-panel p-4 rounded-xl border border-white/5">
                <div class="flex justify-between items-start mb-2">
                    <span class="material-icons text-gray-400 text-xl">{{ metric.icon }}</span>
                    <span class="text-xs font-bold px-2 py-0.5 rounded-full" :class="metric.statusClass">{{ metric.grade
                        }}</span>
                </div>
                <p class="text-2xl font-bold">{{ metric.value }}</p>
                <p class="text-xs text-gray-400">{{ metric.label }}</p>
            </div>
        </div>

        <!-- Incident History -->
        <div class="flex-1">
            <h3 class="font-bold text-lg mb-4">Recent Events</h3>
            <div class="space-y-4 relative pl-4 border-l border-gray-700">
                <div v-for="event in events" :key="event.id" class="relative">
                    <div class="absolute -left-[21px] top-1 w-3 h-3 rounded-full border-2 border-background-dark"
                        :class="event.color"></div>
                    <div class="glass-panel p-4 rounded-xl ml-2">
                        <div class="flex justify-between items-start">
                            <h4 class="font-bold text-sm">{{ event.title }}</h4>
                            <span class="text-xs text-gray-500">{{ event.time }}</span>
                        </div>
                        <p class="text-xs text-gray-400 mt-1">{{ event.location }}</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const score = ref(98)
const circumference = computed(() => 2 * Math.PI * 88)

const metrics = ref([
    { label: 'Hard Braking', value: '0', icon: 'priority_high', grade: 'A+', statusClass: 'bg-green-500/20 text-green-500' },
    { label: 'Speeding', value: '1', icon: 'speed', grade: 'A', statusClass: 'bg-green-500/20 text-green-500' },
    { label: 'Distraction', value: '0%', icon: 'do_not_disturb', grade: 'A+', statusClass: 'bg-green-500/20 text-green-500' },
    { label: 'Smooth Turning', value: '99%', icon: 'turn_right', grade: 'A', statusClass: 'bg-green-500/20 text-green-500' }
])

const events = ref([
    { id: 1, title: 'Speeding (>5mph)', time: 'Today, 10:42 AM', location: 'I-405 Southbound', color: 'bg-amber-500' },
    { id: 2, title: 'Perfect Shift', time: 'Yesterday', location: 'Summary', color: 'bg-green-500' },
    { id: 3, title: 'Shift Started', time: 'Yesterday, 08:00 AM', location: 'Distribution Center', color: 'bg-blue-500' }
])
</script>
