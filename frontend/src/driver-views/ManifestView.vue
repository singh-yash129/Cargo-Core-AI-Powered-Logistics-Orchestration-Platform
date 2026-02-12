<template>
  <div class="bg-background-dark text-gray-100 font-display min-h-screen flex justify-center overflow-hidden">
    <!-- Mobile Container -->
    <div class="w-full max-w-md h-screen bg-background-dark relative flex flex-col shadow-2xl overflow-hidden">
      <!-- Removed Status Bar -->

      <!-- Header Section -->
      <div class="px-6 pt-6 pb-6 z-10 bg-background-dark border-b border-gray-800/50">
        <div class="flex justify-between items-end mb-4">
          <div>
            <h2 class="text-sm font-medium text-primary uppercase tracking-wider mb-1">{{ manifest.date }}</h2>
            <h1 class="text-3xl font-bold tracking-tight text-white">Manifest</h1>
          </div>
          <div class="flex flex-col items-end">
            <div class="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mb-1">
              <span class="material-icons text-primary text-xl">person</span>
            </div>
          </div>
        </div>

        <!-- Summary Widget -->
        <div class="grid grid-cols-3 gap-2">
          <div
            class="bg-card-dark rounded-lg p-3 flex flex-col items-center justify-center border border-gray-800 shadow-sm">
            <span class="text-2xl font-bold text-white">{{ totalStops }}</span>
            <span class="text-[10px] uppercase tracking-wider text-gray-400 font-medium">Stops</span>
          </div>
          <div
            class="bg-card-dark rounded-lg p-3 flex flex-col items-center justify-center border border-gray-800 shadow-sm">
            <span class="text-2xl font-bold text-white">{{ manifest.totalDistance }}<span
                class="text-sm font-normal text-gray-500">mi</span></span>
            <span class="text-[10px] uppercase tracking-wider text-gray-400 font-medium">Remaining</span>
          </div>
          <div
            class="bg-card-dark rounded-lg p-3 flex flex-col items-center justify-center border border-gray-800 shadow-sm">
            <span class="text-2xl font-bold text-white">1:05</span>
            <span class="text-[10px] uppercase tracking-wider text-gray-400 font-medium">Est Finish</span>
          </div>
        </div>
      </div>

      <!-- Scrollable Manifest List -->
      <div class="flex-1 overflow-y-auto px-6 py-4 relative scroll-smooth no-scrollbar">
        <!-- Timeline Line -->
        <div class="absolute left-[3.25rem] top-0 bottom-0 w-0.5 timeline-line opacity-20"></div>

        <!-- Current Location -->
        <div class="relative z-10 mb-8 flex items-center">
          <div class="flex flex-col items-center mr-6 min-w-[3rem]">
            <div class="w-3 h-3 rounded-full bg-primary shadow-[0_0_10px_rgba(68,233,150,0.6)]"></div>
          </div>
          <div class="flex-1 p-3 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-between">
            <div>
              <p class="text-xs font-bold text-primary uppercase tracking-wide">Current Location</p>
              <p class="text-sm font-medium text-gray-300">Distribution Center North</p>
            </div>
            <span class="material-icons text-primary text-lg">navigation</span>
          </div>
        </div>

        <!-- Stop Cards -->
        <div v-for="(stop, index) in stops" :key="stop.id" class="relative z-10 mb-6 group"
          :class="index > 1 ? 'opacity-80' : ''">
          <div class="flex items-start">
            <!-- Stop Number Column -->
            <div class="flex flex-col items-center mr-4 min-w-[3rem] pt-1">
              <div :class="[
                'flex items-center justify-center font-bold z-10',
                index === 0
                  ? 'w-10 h-10 rounded-full border-2 text-lg shadow-lg'
                  : 'w-8 h-8 rounded-full border text-sm mt-1',
                stop.type === 'express'
                  ? 'bg-card-dark border-accent-gold text-accent-gold'
                  : 'bg-card-darker border-gray-700 text-gray-400'
              ]">
                {{ String(stop.stopNumber).padStart(2, '0') }}
              </div>
            </div>

            <!-- Card -->
            <div @click="viewStopDetails(stop)" :class="[
              'flex-1 bg-card-dark rounded-xl p-5 shadow-md relative overflow-hidden transition-transform active:scale-[0.98] cursor-pointer',
              stop.type === 'express' ? 'border-l-4 border-accent-gold' : 'border border-gray-800'
            ]">
              <!-- Background glow for priority -->
              <div v-if="stop.type === 'express'"
                class="absolute top-0 right-0 w-24 h-24 bg-accent-gold/5 blur-[50px] rounded-full -translate-y-10 translate-x-10 pointer-events-none">
              </div>

              <div class="flex justify-between items-start mb-2">
                <span :class="[
                  'inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border',
                  stop.type === 'express' ? 'bg-accent-gold/10 text-accent-gold border-accent-gold/20' :
                    stop.type === 'move' ? 'bg-accent-purple/10 text-accent-purple border-accent-purple/20' :
                      stop.type === 'pickup' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' :
                        stop.type === 'exchange' ? 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20' :
                          'bg-accent-blue/10 text-accent-blue border-accent-blue/20'
                ]">
                  {{ stop.type }}
                </span>
                <span class="material-icons text-gray-400 text-lg">
                  {{ stop.type === 'move' ? 'inventory_2' :
                    stop.type === 'pickup' ? 'outbox' :
                      stop.type === 'exchange' ? 'sync_alt' : 'bolt' }}
                </span>
              </div>

              <h3 class="text-lg font-bold text-white leading-tight mb-1">{{ stop.customerName }}</h3>
              <p class="text-sm text-gray-400 font-medium mb-3">{{ stop.address }}</p>

              <div class="flex items-center justify-between pt-3 border-t border-gray-700/50">
                <div class="flex items-center gap-2">
                  <span class="material-icons text-gray-400 text-sm">local_shipping</span>
                  <span class="text-xs text-gray-400">
                    {{ stop.packages?.length || stop.moveItems?.length || 0 }}
                    {{ stop.type === 'move' ? 'Items' : 'Packages' }}
                  </span>
                </div>
                <button v-if="index === 0"
                  class="bg-primary hover:bg-green-400 text-black text-xs font-bold py-2 px-4 rounded-lg flex items-center gap-1 transition-colors">
                  Start
                  <span class="material-icons text-sm font-bold">arrow_forward</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- End Spacer -->
        <div class="h-20"></div>
      </div>

      <!-- Floating Action Buttons -->
      <div class="absolute bottom-6 left-6 right-6 z-30">
        <div class="flex gap-4">
          <button @click="$router.push('/route-progress')"
            class="flex-1 bg-card-darker backdrop-blur-xl bg-opacity-90 text-white border border-gray-700 p-4 rounded-xl shadow-2xl flex items-center justify-center gap-2 active:scale-95 transition-transform">
            <span class="material-icons text-gray-300">map</span>
            <span class="font-medium text-sm">Map View</span>
          </button>
          <button @click="startRoute"
            class="flex-[2] bg-primary text-black p-4 rounded-xl shadow-[0_0_20px_rgba(68,233,150,0.3)] flex items-center justify-center gap-2 font-bold active:scale-95 transition-transform hover:bg-green-400">
            <span class="material-icons">near_me</span>
            <span>Start Route</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useRouteStore } from '../stores/routeStore'
import { dummyManifest, dummyStops } from '../utils/dummyData'

const router = useRouter()
const routeStore = useRouteStore()

const currentTime = ref('')
const manifest = ref(dummyManifest)
const stops = ref(dummyStops)

const totalStops = computed(() => stops.value.length)

onMounted(() => {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
})

const viewStopDetails = (stop) => {
  console.log('Viewing stop details:', stop)
}

const startRoute = () => {
  routeStore.startRoute()
  router.push('/gate-exit')
}
</script>
