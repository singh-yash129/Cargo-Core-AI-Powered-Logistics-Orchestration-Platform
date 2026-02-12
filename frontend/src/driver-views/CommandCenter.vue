<template>
  <div class="bg-background-dark font-display text-white min-h-screen flex flex-col antialiased selection-custom pb-24">
    <!-- Status Bar & Header -->
    <header class="pt-6 px-6 pb-4 flex justify-between items-center z-10">
      <div class="flex flex-col">
        <h1 class="text-4xl font-light tracking-tight text-white">
          {{ currentTime }}<span class="text-lg text-gray-400 ml-1 font-normal">{{ period }}</span>
        </h1>
        <p class="text-sm text-gray-400 mt-1 uppercase tracking-wider font-medium">{{ currentDate }}</p>
      </div>
      <div
        class="flex items-center gap-2 bg-surface-dark/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/5">
        <div class="relative flex items-center justify-center w-3 h-3">
          <span class="gps-ring absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
          <span class="gps-dot relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
        </div>
        <span class="text-xs font-semibold text-primary tracking-wide">GPS ACTIVE</span>
      </div>
    </header>

    <!-- Main Content Area -->
    <main class="flex-1 px-6 flex flex-col justify-center relative z-0">
      <!-- Background Map Graphic (Subtle) -->
      <div class="absolute inset-0 z-[-1] opacity-20 pointer-events-none overflow-hidden">
        <div class="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/80 to-transparent"></div>
        <div class="w-full h-full"
          style="background-image: radial-gradient(circle at 50% 50%, #44e996 1px, transparent 1px); background-size: 40px 40px; opacity: 0.1;">
        </div>
      </div>

      <!-- Today's Route Summary Card -->
      <div
        class="bg-surface-dark/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden group">
        <!-- Decorative Glow -->
        <div
          class="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-colors duration-500">
        </div>

        <div class="flex justify-between items-start mb-8 relative">
          <div>
            <h2 class="text-gray-400 text-sm font-medium uppercase tracking-widest mb-1">Today's Manifest</h2>
            <div class="text-2xl font-semibold text-white">{{ manifest.routeId }}</div>
          </div>
          <div class="bg-primary/10 p-2 rounded-lg">
            <span class="material-icons text-primary">local_shipping</span>
          </div>
        </div>

        <!-- Metrics Grid -->
        <div class="grid grid-cols-2 gap-4 mb-2">
          <!-- Stops -->
          <div class="bg-black/20 rounded-2xl p-4 border border-white/5 hover:border-primary/30 transition-colors">
            <div class="flex items-center justify-between mb-2">
              <span class="text-gray-400 text-xs uppercase font-medium">Stops</span>
              <span class="material-icons text-gray-500 text-sm">place</span>
            </div>
            <div class="text-3xl font-bold text-white">{{ manifest.totalStops }}</div>
            <div class="text-xs text-primary mt-1">On Schedule</div>
          </div>

          <!-- Est Time -->
          <div class="bg-black/20 rounded-2xl p-4 border border-white/5 hover:border-primary/30 transition-colors">
            <div class="flex items-center justify-between mb-2">
              <span class="text-gray-400 text-xs uppercase font-medium">Est. Duration</span>
              <span class="material-icons text-gray-500 text-sm">schedule</span>
            </div>
            <div class="text-3xl font-bold text-white">{{ manifest.estimatedDuration }}</div>
            <div class="text-xs text-gray-400 mt-1">Ends at 1:05 PM</div>
          </div>

          <!-- Distance -->
          <div class="bg-black/20 rounded-2xl p-4 border border-white/5 hover:border-primary/30 transition-colors">
            <div class="flex items-center justify-between mb-2">
              <span class="text-gray-400 text-xs uppercase font-medium">Distance</span>
              <span class="material-icons text-gray-500 text-sm">timeline</span>
            </div>
            <div class="text-3xl font-bold text-white">{{ manifest.totalDistance }}</div>
            <div class="text-xs text-gray-400 mt-1">Miles Total</div>
          </div>

          <!-- Crew -->
          <div class="bg-black/20 rounded-2xl p-4 border border-white/5 hover:border-primary/30 transition-colors">
            <div class="flex items-center justify-between mb-2">
              <span class="text-gray-400 text-xs uppercase font-medium">Crew</span>
              <span class="material-icons text-gray-500 text-sm">group</span>
            </div>
            <div class="flex items-center gap-2 mt-1">
              <div class="flex -space-x-3 overflow-hidden">
                <img v-for="member in manifest.assignedCrew.slice(0, 2)" :key="member.id" :src="member.photo"
                  :alt="member.name" class="inline-block h-8 w-8 rounded-full ring-2 ring-surface-dark object-cover" />
              </div>
              <span class="text-white font-bold text-lg" v-if="manifest.assignedCrew.length > 2">+{{
                manifest.assignedCrew.length - 2 }}</span>
            </div>
            <div class="text-xs text-gray-400 mt-2">Loaders Assigned</div>
          </div>
        </div>

        <!-- Mini map preview -->
        <div class="mt-4 h-24 w-full rounded-xl overflow-hidden relative border border-white/5">
          <img alt="Map view of route"
            class="w-full h-full object-cover opacity-60 grayscale hover:grayscale-0 transition-all duration-500"
            src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&q=80" />
          <div class="absolute inset-0 bg-gradient-to-r from-background-dark/80 to-transparent flex items-center pl-4">
            <span class="text-xs font-medium text-white bg-black/50 px-2 py-1 rounded backdrop-blur-sm">Map
              Preview</span>
          </div>
        </div>
      </div>

      <!-- Spacer -->
      <div class="h-8"></div>

      <!-- Primary Action -->
      <div class="mb-8">
        <button @click="beginRoute"
          class="group relative w-full overflow-hidden rounded-2xl bg-surface-dark p-1 shadow-lg active:scale-[0.98] transition-transform duration-200">
          <div class="absolute inset-0 bg-gradient-to-r from-primary/80 to-primary opacity-100 transition-opacity">
          </div>
          <div
            class="absolute top-0 -left-[100%] h-full w-full skew-x-[-20deg] bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-[shine_2s_infinite]">
          </div>
          <div class="relative flex h-16 items-center justify-center rounded-xl bg-transparent">
            <span class="mr-3 material-icons text-background-dark text-3xl animate-pulse">play_arrow</span>
            <span class="text-xl font-bold uppercase tracking-wider text-background-dark">Begin Route</span>
          </div>
        </button>
        <p class="text-center text-xs text-gray-500 mt-3 font-medium">Press and hold to start navigation</p>
      </div>
    </main>

    <!-- Bottom Dock / Quick Actions -->
    <nav class="fixed bottom-6 left-6 right-6 z-50">
      <div
        class="flex justify-between items-center bg-surface-dark/90 backdrop-blur-lg rounded-2xl p-2 border border-white/5 shadow-2xl">
        <!-- Wallet -->
        <button @click="$router.push('/wallet')"
          class="flex-1 flex flex-col items-center justify-center py-2 gap-1 group">
          <div class="bg-transparent p-2 rounded-xl group-hover:bg-white/5 transition-colors">
            <span
              class="material-icons text-gray-400 group-hover:text-primary transition-colors text-2xl">account_balance_wallet</span>
          </div>
          <span class="text-[10px] font-medium text-gray-500 group-hover:text-gray-300">Wallet</span>
        </button>

        <!-- Support -->
        <button @click="$router.push('/chat')"
          class="flex-1 flex flex-col items-center justify-center py-2 gap-1 group">
          <div class="bg-transparent p-2 rounded-xl group-hover:bg-white/5 transition-colors">
            <span
              class="material-icons text-gray-400 group-hover:text-primary transition-colors text-2xl">headset_mic</span>
          </div>
          <span class="text-[10px] font-medium text-gray-500 group-hover:text-gray-300">Support</span>
        </button>

        <!-- Reports -->
        <button @click="$router.push('/shift-summary')"
          class="flex-1 flex flex-col items-center justify-center py-2 gap-1 group">
          <div class="bg-transparent p-2 rounded-xl group-hover:bg-white/5 transition-colors">
            <span
              class="material-icons text-gray-400 group-hover:text-primary transition-colors text-2xl">bar_chart</span>
          </div>
          <span class="text-[10px] font-medium text-gray-500 group-hover:text-gray-300">Reports</span>
        </button>

        <!-- Vehicle -->
        <button @click="$router.push('/vehicle-inspection')"
          class="flex-1 flex flex-col items-center justify-center py-2 gap-1 group relative">
          <div class="bg-transparent p-2 rounded-xl group-hover:bg-white/5 transition-colors">
            <span
              class="material-icons text-gray-400 group-hover:text-primary transition-colors text-2xl">directions_car</span>
          </div>
          <span class="text-[10px] font-medium text-gray-500 group-hover:text-gray-300">Vehicle</span>
        </button>
      </div>
    </nav>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { dummyManifest } from '../utils/dummyData'

const router = useRouter()

const currentTime = ref('')
const period = ref('')
const currentDate = ref('')
const manifest = ref(dummyManifest)

onMounted(() => {
  updateTime()
  setInterval(updateTime, 60000) // Update every minute
})

const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
  period.value = now.getHours() >= 12 ? 'PM' : 'AM'
  currentDate.value = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

const beginRoute = () => {
  router.push('/manifest')
}
</script>
