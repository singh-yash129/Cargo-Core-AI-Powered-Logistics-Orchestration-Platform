<template>
  <div
    class="bg-background-light dark:bg-background-dark text-gray-900 dark:text-white min-h-screen flex flex-col font-display antialiased selection-custom">
    <!-- Main Content Wrapper -->
    <main class="flex-1 flex flex-col px-6 pb-8 pt-4 relative z-0 overflow-y-auto">
      <!-- Ambient Background Glow -->
      <div
        class="absolute top-10 left-1/2 -translate-x-1/2 w-64 h-64 bg-primary/10 rounded-full blur-[100px] pointer-events-none">
      </div>

      <!-- Header Section -->
      <header class="mb-8 mt-4 relative z-10">
        <div class="flex items-center justify-between mb-2">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
            <div class="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
            <span class="text-xs font-semibold uppercase tracking-wider text-primary">Pre-Shift</span>
          </div>
          <button @click="$router.push('/settings')" class="text-gray-400 hover:text-white transition-colors">
            <span class="material-icons">help_outline</span>
          </button>
        </div>
        <h1
          class="text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-400">
          Ready to Go?
        </h1>
        <p class="text-gray-400 mt-2 text-sm">Assigning vehicle for Shift #402</p>
      </header>

      <!-- Vehicle Hero Card -->
      <div class="flex-1 flex flex-col justify-center relative z-10">
        <div
          class="glass-panel rounded-2xl p-6 relative overflow-hidden group transition-all duration-500 hover:border-primary/30">
          <!-- Card Header: Vehicle Type & Status -->
          <div class="flex justify-between items-start mb-6">
            <div>
              <span class="block text-xs text-gray-400 uppercase tracking-widest mb-1">Assigned Unit</span>
              <div class="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                <span>{{ vehicle.vehicleId }}</span>
                <span class="material-icons text-primary text-lg">verified</span>
              </div>
            </div>
            <div class="h-10 w-10 rounded-full bg-surface-dark flex items-center justify-center border border-white/5">
              <span class="material-icons text-gray-400 text-xl">local_shipping</span>
            </div>
          </div>

          <!-- Vehicle Image / Visual Representation -->
          <div
            class="h-48 w-full bg-gradient-to-b from-transparent to-black/20 rounded-xl mb-8 flex items-center justify-center relative overflow-hidden">
            <div class="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent"></div>
            <img alt="Sleek modern delivery vehicle"
              class="h-full w-full object-cover opacity-80 mix-blend-overlay grayscale hover:grayscale-0 transition-all duration-700"
              src="https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=800&q=80" />
            <div class="absolute bottom-4 left-4 right-4 flex justify-between items-end">
              <div
                class="bg-black/40 backdrop-blur-md px-3 py-1 rounded text-xs font-mono text-white border border-white/10">
                {{ vehicle.plateNumber }}
              </div>
            </div>
          </div>

          <!-- Specs Grid -->
          <div class="grid grid-cols-2 gap-4">
            <!-- Fuel / Battery -->
            <div class="bg-surface-dark/50 p-4 rounded-xl border border-white/5 flex flex-col gap-2">
              <div class="flex justify-between items-center">
                <span class="text-xs text-gray-400">Charge Level</span>
                <span class="material-icons text-primary text-sm">bolt</span>
              </div>
              <div class="flex items-end gap-2">
                <span class="text-2xl font-bold text-white">{{ vehicle.fuelLevel }}</span>
                <span class="text-sm font-medium text-gray-400 mb-1">%</span>
              </div>
              <div class="w-full bg-gray-700 rounded-full h-1 mt-1">
                <div class="bg-primary h-1 rounded-full" :style="`width: ${vehicle.fuelLevel}%`"></div>
              </div>
              <p class="text-[10px] text-gray-500 mt-1">~{{ vehicle.range }}mi range</p>
            </div>

            <!-- Capacity -->
            <div class="bg-surface-dark/50 p-4 rounded-xl border border-white/5 flex flex-col gap-2">
              <div class="flex justify-between items-center">
                <span class="text-xs text-gray-400">Capacity</span>
                <span class="material-icons text-gray-500 text-sm">view_in_ar</span>
              </div>
              <div class="flex items-end gap-2">
                <span class="text-2xl font-bold text-white">{{ vehicle.capacity }}</span>
                <span class="text-sm font-medium text-gray-400 mb-1">T</span>
              </div>
              <div class="flex items-center gap-1 mt-auto pt-2">
                <span class="material-icons text-gray-500 text-[10px]">people</span>
                <span class="text-xs text-gray-400">{{ vehicle.seats }} Seats</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Area -->
      <div class="mt-8 relative z-20 pb-6">
        <!-- Swipe/Hold Instruction Text -->
        <div class="flex justify-center mb-4">
          <p class="text-xs text-gray-500 flex items-center gap-2">
            <span class="material-icons text-xs">info</span>
            Check mirrors and tires before binding
          </p>
        </div>

        <!-- Primary Action Button -->
        <button @click="handleBindInspect"
          class="group w-full relative overflow-hidden rounded-xl bg-primary hover:bg-primary-dark active:scale-[0.98] transition-all duration-200 h-16 shadow-glow">
          <div class="absolute inset-0 flex items-center justify-center gap-3">
            <span
              class="text-background-dark font-bold text-lg tracking-wide group-hover:tracking-wider transition-all">
              BIND & INSPECT
            </span>
            <span
              class="material-icons text-background-dark transition-transform group-hover:translate-x-1">arrow_forward</span>
          </div>
        </button>

        <div class="mt-6 flex justify-center">
          <button @click="$router.push('/damage-report')"
            class="text-sm text-gray-500 hover:text-white transition-colors underline decoration-gray-700 underline-offset-4">
            Report Issue with Vehicle
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useDriverStore } from '../stores/driverStore'
import { dummyVehicle } from '../utils/dummyData'

const router = useRouter()
const driverStore = useDriverStore()

const currentTime = ref('')
const vehicle = ref(dummyVehicle)

onMounted(() => {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
})

const handleBindInspect = () => {
  driverStore.bindVehicle(vehicle.value)
  router.push('/vehicle-inspection')
}
</script>
