<template>
  <div class="bg-background-dark text-white min-h-screen flex flex-col p-6">
    <!-- Header -->
    <div class="mb-8">
      <div class="flex items-center gap-3 mb-6">
        <div class="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center animate-pulse">
          <span class="material-icons text-primary text-2xl">place</span>
        </div>
        <div>
          <h3 class="text-primary text-sm font-semibold tracking-wider uppercase">Geofence Triggered</h3>
          <h1 class="text-3xl font-bold">Arrived at Stop</h1>
        </div>
      </div>

      <div class="glass-panel p-4 rounded-xl">
        <p class="text-gray-400 text-sm mb-1">Distance</p>
        <p class="text-white text-lg font-semibold">Within 50m of delivery location</p>
      </div>

      <!-- Smart Parking Insight (Module 3) -->
      <div
        class="mt-4 bg-gradient-to-r from-blue-900/40 to-blue-800/20 border border-blue-500/30 rounded-xl p-4 flex items-start gap-3 relative overflow-hidden">
        <div class="absolute right-0 top-0 p-2 opacity-10">
          <span class="material-icons text-6xl">local_parking</span>
        </div>
        <div class="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
          <span class="material-icons text-blue-400">insights</span>
        </div>
        <div>
          <p class="text-[10px] text-blue-400 font-bold uppercase tracking-wider mb-1">AI Parking Insight</p>
          <p class="text-white font-medium text-sm">Use <strong>Side Entrance B</strong> for large items.</p>
          <p class="text-xs text-blue-300/70 mt-1">Historically less congested at 2pm.</p>
        </div>
      </div>
    </div>

    <!-- Customer Card -->
    <div class="glass-panel rounded-2xl p-6 mb-6 relative overflow-hidden">
      <!-- Decorative glow -->
      <div class="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl"></div>

      <div class="relative z-10">
        <!-- Customer Info -->
        <div class="flex items-start gap-4 mb-6">
          <div class="bg-white/5 p-3 rounded-xl">
            <span class="material-icons text-primary text-3xl">person</span>
          </div>
          <div class="flex-1">
            <h2 class="text-2xl font-bold text-white mb-1">{{ customer.name }}</h2>
            <p class="text-gray-400 font-medium flex items-center gap-2">
              <span class="material-icons text-sm">location_on</span>
              {{ customer.address }}
            </p>
          </div>
        </div>

        <!-- Package Details -->
        <div class="grid grid-cols-2 gap-4 mb-6">
          <div class="bg-white/5 rounded-lg p-3">
            <p class="text-gray-400 text-xs mb-1">Packages</p>
            <p class="text-white text-2xl font-bold">{{ customer.packageCount }}</p>
          </div>
          <div class="bg-white/5 rounded-lg p-3">
            <p class="text-gray-400 text-xs mb-1">Service Type</p>
            <p class="text-primary text-sm font-semibold uppercase">{{ customer.serviceType }}</p>
          </div>
        </div>

        <!-- Special Instructions -->
        <div v-if="customer.instructions" class="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-6">
          <div class="flex items-start gap-2">
            <span class="material-icons text-amber-500 text-lg">info</span>
            <div>
              <p class="text-amber-500 font-semibold text-sm mb-1">Special Instructions</p>
              <p class="text-white text-sm">{{ customer.instructions }}</p>
            </div>
          </div>
        </div>

        <!-- Contact Actions -->
        <div class="flex gap-3">
          <button @click="callCustomer"
            class="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 py-3 rounded-xl flex items-center justify-center gap-2 transition-colors">
            <span class="material-icons text-primary">call</span>
            <span class="font-medium">Call</span>
          </button>

          <button @click="sendMessage"
            class="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 py-3 rounded-xl flex items-center justify-center gap-2 transition-colors">
            <span class="material-icons text-primary">message</span>
            <span class="font-medium">Message</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Automated Notifications -->
    <div class="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-6">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
          <span class="material-icons text-blue-500">notifications</span>
        </div>
        <div>
          <p class="text-white font-semibold text-sm">Customer Notified</p>
          <p class="text-xs text-gray-400">"Driver is outside" message sent automatically</p>
        </div>
      </div>
    </div>

    <!-- Issue Reporting (Optional) -->
    <button @click="reportIssue"
      class="w-full bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 py-3 rounded-xl font-medium mb-6 transition-colors flex items-center justify-center gap-2">
      <span class="material-icons">report_problem</span>
      <span>Report Issue</span>
    </button>

    <!-- Main Action -->
    <button @click="openDelivery"
      class="w-full bg-primary text-black py-5 rounded-xl font-bold text-xl shadow-glow hover:bg-primary-dark transition-all active:scale-[0.98]">
      Open Delivery →
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { dummyStops } from '../utils/dummyData'

const router = useRouter()
const route = useRoute()

const customer = ref({})
const currentStop = ref(null)

onMounted(() => {
  const stopId = route.params.stopId
  const stop = dummyStops.find(s => s.id == stopId) || dummyStops[0]
  currentStop.value = stop

  customer.value = {
    name: stop.customerName,
    address: stop.address,
    packageCount: stop.packages?.length || stop.pickupItems?.length || 0,
    serviceType: stop.serviceType || stop.type,
    instructions: stop.specialInstructions
  }
})

const callCustomer = () => {
  console.log('Calling customer...')
}

const sendMessage = () => {
  console.log('Opening messages...')
}

const reportIssue = () => {
  console.log('Opening issue report...')
}

const openDelivery = () => {
  const type = currentStop.value.type
  if (type === 'pickup' || type === 'exchange') {
    router.push(`/pickup/${route.params.stopId}`)
  } else {
    router.push(`/delivery/${route.params.stopId}`)
  }
}
</script>
