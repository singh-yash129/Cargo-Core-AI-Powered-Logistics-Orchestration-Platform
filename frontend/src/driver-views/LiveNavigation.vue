<template>
  <div class="bg-background-dark text-white h-screen w-full overflow-hidden flex flex-col relative">
    <!-- Top Overlay: Status & Next Turn -->
    <div
      class="absolute top-0 left-0 right-0 z-20 pt-12 pb-24 px-6 bg-gradient-to-b from-background-dark/90 via-background-dark/50 to-transparent pointer-events-none">
      <!-- Status Bar -->
      <div class="flex justify-between items-center mb-6 text-gray-400 text-xs font-medium tracking-wide">
        <div class="flex items-center gap-2">
          <span class="material-icons text-primary text-sm">near_me</span>
          <span>GPS STRONG</span>
        </div>
        <div class="flex items-center gap-2">
          <span>5G</span>
          <span class="material-icons text-sm">battery_full</span>
        </div>
      </div>

      <!-- Next Turn Instruction Card -->
      <div
        class="bg-surface-dark/95 backdrop-blur-md border border-white/5 rounded-xl p-4 shadow-lg flex items-center gap-4 max-w-sm mx-auto pointer-events-auto">
        <div
          class="bg-surface-dark p-3 rounded-lg border border-white/10 flex items-center justify-center h-16 w-16 shrink-0">
          <span class="material-icons text-primary text-4xl">turn_right</span>
        </div>
        <div>
          <div class="text-3xl font-bold text-white tracking-tight leading-none mb-1">
            200 <span class="text-lg font-medium text-gray-400">ft</span>
          </div>
          <div class="text-gray-300 font-medium text-lg leading-tight">
            Turn right on <span class="text-white">Elm St</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Map Area (Full Screen Background) -->
    <div class="absolute inset-0 z-0 map-bg w-full h-full">
      <!-- Abstract Map Grid -->
      <div class="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-full bg-[#1e332a]"></div>
      <div class="absolute top-1/3 left-0 w-full h-3 bg-[#1e332a]"></div>
      <div class="absolute bottom-1/4 right-0 w-2/3 h-3 bg-[#1e332a]"></div>

      <!-- Route Path SVG -->
      <svg class="absolute inset-0 w-full h-full pointer-events-none" style="z-index: 1;">
        <path class="drop-shadow-[0_0_10px_rgba(28,231,131,0.6)]" d="M 50% 100% L 50% 45% Q 50% 35% 65% 35% L 100% 35%"
          fill="none" stroke="#1CE783" stroke-linecap="round" stroke-linejoin="round" stroke-width="6" />
      </svg>

      <!-- Current Location Puck -->
      <div class="absolute top-[65%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
        <div class="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center animate-pulse">
          <div class="w-6 h-6 bg-primary rounded-full border-4 border-white shadow-[0_0_20px_rgba(28,231,131,0.8)]">
          </div>
        </div>
      </div>

      <!-- Destination Marker -->
      <div
        class="absolute top-[35%] right-0 -translate-y-1/2 bg-surface-dark px-3 py-1 rounded-l-lg border border-r-0 border-white/10 flex items-center gap-2">
        <span class="material-icons text-primary text-sm">place</span>
        <span class="text-xs font-bold">DEST</span>
      </div>
    </div>

    <!-- Right Side Floating Actions -->
    <div class="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-20">
      <button
        class="w-12 h-12 rounded-full bg-surface-dark/80 backdrop-blur-md border border-white/10 text-white flex items-center justify-center shadow-lg active:scale-95 transition-transform">
        <span class="material-icons">add</span>
      </button>
      <button
        class="w-12 h-12 rounded-full bg-surface-dark/80 backdrop-blur-md border border-white/10 text-white flex items-center justify-center shadow-lg active:scale-95 transition-transform">
        <span class="material-icons">remove</span>
      </button>
      <button
        class="w-12 h-12 rounded-full bg-surface-dark/80 backdrop-blur-md border border-white/10 text-white flex items-center justify-center shadow-lg active:scale-95 transition-transform mt-4">
        <span class="material-icons text-primary">navigation</span>
      </button>
    </div>

    <!-- AI Voice Assistant FAB -->
    <VoiceAssistant />

    <!-- Bottom Sheet Card -->
    <div
      class="absolute bottom-0 left-0 right-0 z-30 bg-surface-dark border-t border-white/5 rounded-t-[2rem] p-6 pb-8 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
      <!-- Drag Handle -->
      <div class="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-6"></div>

      <!-- Metrics Row -->
      <div class="flex justify-between items-end mb-6">
        <div>
          <div class="flex items-baseline gap-2">
            <h1 class="text-5xl font-bold text-white tracking-tighter">{{ eta }}</h1>
            <span class="text-lg font-medium text-gray-400">ETA</span>
          </div>
          <div class="flex items-center gap-2 mt-1">
            <span class="text-primary font-bold text-lg">{{ duration }}</span>
            <span class="w-1 h-1 rounded-full bg-gray-500"></span>
            <span class="text-gray-300 text-lg">{{ distance }}</span>
          </div>
        </div>

        <!-- Stop Number / Context -->
        <div class="text-right">
          <div class="inline-flex items-center px-2.5 py-1 rounded-md bg-white/5 border border-white/5 mb-1">
            <span class="text-xs font-bold text-primary tracking-wide uppercase">
              Stop {{ currentStopIndex }} of {{ totalStops }}
            </span>
          </div>
        </div>
      </div>

      <!-- Destination Info -->
      <div class="mb-8">
        <div class="flex items-start gap-4">
          <div class="bg-white/5 p-3 rounded-xl border border-white/5 shrink-0">
            <span class="material-icons text-gray-300 text-2xl">warehouse</span>
          </div>
          <div>
            <h2 class="text-xl font-bold text-white leading-tight mb-1">{{ nextStop.customerName }}</h2>
            <p class="text-gray-400 text-base font-medium">{{ nextStop.address }}</p>
            <div class="flex gap-4 mt-3">
              <button
                class="text-sm font-medium text-primary hover:text-white transition-colors flex items-center gap-1">
                <span class="material-icons text-base">call</span> Call
              </button>
              <button
                class="text-sm font-medium text-primary hover:text-white transition-colors flex items-center gap-1">
                <span class="material-icons text-base">sticky_note_2</span> Notes
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Primary Action: Arrive Button -->
      <div @click="simulateArrival"
        class="relative h-16 w-full bg-primary rounded-xl overflow-hidden group cursor-pointer shadow-glow">
        <div class="absolute inset-0 flex items-center justify-center">
          <span class="text-background-dark font-bold text-lg tracking-wide group-hover:tracking-wider transition-all">
            SLIDE TO ARRIVE
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useRouteStore } from '../stores/routeStore'
import VoiceAssistant from '../driver-components/VoiceAssistant.vue'

const router = useRouter()
const routeStore = useRouteStore()

const currentStopIndex = computed(() => routeStore.currentStopIndex + 1)
const totalStops = computed(() => routeStore.stops.length)

// Derive display data from the current stop in store
const nextStop = computed(() => {
  if (!routeStore.currentStop) return { customerName: 'Route Complete', address: 'Return to Base' }
  return routeStore.currentStop
})

const eta = computed(() => nextStop.value.eta || '14:05')
const distance = computed(() => nextStop.value.distance ? `${nextStop.value.distance} mi` : '0 mi')
const duration = computed(() => {
  // Simple mock calculation: 3 mins per mile
  const miles = nextStop.value.distance || 0
  return `${Math.ceil(miles * 3)} min`
})

const simulateArrival = () => {
  if (routeStore.currentStop) {
    router.push(`/arrival/${routeStore.currentStop.id}`)
  } else {
    router.push('/dashboard')
  }
}
</script>

<style scoped>
.map-bg {
  background-color: #0f1a15;
  background-image:
    linear-gradient(#1a2c24 1px, transparent 1px),
    linear-gradient(90deg, #1a2c24 1px, transparent 1px);
  background-size: 40px 40px;
}
</style>
