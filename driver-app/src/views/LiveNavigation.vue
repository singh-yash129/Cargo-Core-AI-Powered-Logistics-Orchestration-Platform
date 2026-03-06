<template>
    <div class="h-screen w-screen overflow-hidden flex flex-col"
        :class="isDark ? 'bg-background-dark text-white' : 'bg-gray-900 text-white'">

        <!-- Map Full BG -->
        <div class="absolute inset-0 z-0">
            <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=1200&q=80" alt="Navigation Map"
                class="w-full h-full object-cover opacity-40 grayscale" />
            <div class="absolute inset-0"
                style="background: linear-gradient(to bottom, rgba(15,17,21,0.6) 0%, rgba(15,17,21,0.2) 40%, rgba(15,17,21,0.8) 100%);">
            </div>
        </div>

        <!-- Back Button -->
        <div class="absolute top-6 left-5 z-30">
            <button @click="$router.back()"
                class="w-11 h-11 rounded-full flex items-center justify-center backdrop-blur-xl border border-white/10 bg-black/40 text-white">
                <span class="material-icons">arrow_back</span>
            </button>
        </div>

        <!-- GPS Status Top Right -->
        <div
            class="absolute top-6 right-5 z-30 flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-xl border border-white/10 bg-black/40 text-xs font-bold">
            <span class="relative w-2 h-2 flex">
                <span class="absolute inline-flex h-full w-full rounded-full bg-primary opacity-75 animate-ping"></span>
                <span class="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span class="text-primary">LIVE</span>
        </div>

        <!-- Navigation Info Card (bottom) -->
        <div class="absolute bottom-0 left-0 right-0 z-30">
            <div class="mx-4 mb-4 rounded-3xl p-5 backdrop-blur-2xl border border-white/10 bg-black/60">

                <!-- Turn instruction -->
                <div class="flex items-center gap-4 mb-5">
                    <div
                        class="w-14 h-14 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center flex-shrink-0">
                        <span class="material-icons text-primary text-3xl">turn_left</span>
                    </div>
                    <div>
                        <p class="text-3xl font-black tracking-tight text-white">In 250 m</p>
                        <p class="text-base font-medium text-white/70">Turn left onto S.V. Road</p>
                    </div>
                </div>

                <!-- Route stats -->
                <div class="grid grid-cols-3 gap-3 mb-5">
                    <div v-for="stat in routeStats" :key="stat.label" class="text-center">
                        <p class="text-2xl font-black">{{ stat.value }}</p>
                        <p class="text-[10px] uppercase font-semibold text-white/50 mt-0.5">{{ stat.label }}</p>
                    </div>
                </div>

                <!-- Address pill -->
                <div class="flex items-center gap-3 bg-white/8 rounded-2xl p-3 mb-4">
                    <span class="material-icons text-primary text-lg flex-shrink-0">place</span>
                    <div class="min-w-0 flex-1">
                        <p class="text-sm font-bold truncate text-white">Priya & Rohit Mehta</p>
                        <p class="text-xs text-white/50 truncate">14B, Andheri West, Near JVLR</p>
                    </div>
                    <span
                        class="text-xs font-bold text-primary bg-primary/15 px-2 py-1 rounded-lg whitespace-nowrap">Stop
                        01</span>
                </div>

                <!-- Action buttons -->
                <div class="flex gap-3">
                    <button @click="$router.push('/route-deviation')"
                        class="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-white/10 bg-white/5 text-white text-sm font-semibold active:scale-[0.97] transition-all">
                        <span class="material-icons text-sm">warning</span>
                        Deviation
                    </button>
                    <button @click="$router.push('/geofence-arrival/STOP-001')"
                        class="flex-[2] flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-background-dark shadow-glow active:scale-[0.97] transition-all text-sm"
                        style="background: linear-gradient(135deg, #1CE783, #15b86a);">
                        <span class="material-icons text-lg">where_to_vote</span>
                        I've Arrived
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue'
import { useUiStore } from '../stores/uiStore.js'

const uiStore = useUiStore()
const isDark = computed(() => uiStore.theme !== 'light')

const routeStats = [
    { label: 'Distance', value: '2.4 km' },
    { label: 'ETA', value: '12 min' },
    { label: 'Speed', value: '32 km/h' },
]
</script>
