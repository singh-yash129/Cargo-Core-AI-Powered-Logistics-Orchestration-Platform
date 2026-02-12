<template>
  <div
    class="bg-background-dark text-white min-h-screen flex flex-col items-center justify-start p-6 overflow-y-auto no-scrollbar">
    <!-- Success Animation -->
    <div class="mb-8">
      <div class="w-32 h-32 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4 animate-pulse">
        <span class="material-icons text-primary text-7xl">check_circle</span>
      </div>
      <div class="text-center">
        <h1 class="text-3xl font-bold text-primary mb-2">Delivery Confirmed</h1>
        <p class="text-gray-400 text-lg">Synced to Control Tower</p>
      </div>
    </div>

    <!-- Delivery Details Card -->
    <div class="w-full max-w-md glass-panel p-6 rounded-2xl mb-6">
      <div class="space-y-4">
        <!-- Customer Info -->
        <div class="flex justify-between items-center pb-4 border-b border-white/10">
          <span class="text-gray-400">Customer</span>
          <span class="font-semibold text-white">{{ customerName }}</span>
        </div>

        <!-- Timestamp -->
        <div class="flex justify-between items-center">
          <span class="text-gray-400">Completed At</span>
          <span class="font-mono text-white">{{ timestamp }}</span>
        </div>

        <!-- GPS Verification -->
        <div class="flex justify-between items-center">
          <span class="text-gray-400">GPS Verified</span>
          <span class="flex items-center gap-1 text-primary">
            <span class="material-icons text-sm">check_circle</span>
            <span class="font-semibold">{{ gpsCoordinates }}</span>
          </span>
        </div>

        <!-- Payment (if COD) -->
        <div v-if="paymentAmount" class="flex justify-between items-center">
          <span class="text-gray-400">Payment Collected</span>
          <span class="font-semibold text-primary">${{ paymentAmount }}</span>
        </div>

        <!-- Confirmation ID -->
        <div class="flex justify-between items-center pt-4 border-t border-white/10">
          <span class="text-gray-400">Confirmation ID</span>
          <span class="font-mono text-xs text-white bg-white/5 px-2 py-1 rounded">{{ confirmationId }}</span>
        </div>
      </div>
    </div>

    <!-- Proof Media Grid -->
    <div v-if="deliveryPhoto || signature" class="w-full max-w-md mb-6">
      <h3 class="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Proof of Delivery</h3>
      <div class="grid grid-cols-2 gap-4">
        <!-- Photo -->
        <div v-if="deliveryPhoto" class="glass-panel p-2 rounded-xl">
          <img :src="deliveryPhoto" alt="Delivery Photo" class="w-full h-32 object-cover rounded-lg mb-2" />
          <p class="text-xs text-gray-400 text-center">Photo</p>
        </div>

        <!-- Signature -->
        <div v-if="signature" class="glass-panel p-2 rounded-xl">
          <img :src="signature" alt="Signature" class="w-full h-32 object-cover rounded-lg mb-2 bg-white/5" />
          <p class="text-xs text-gray-400 text-center">Signature</p>
        </div>
      </div>
    </div>

    <!-- Sync Status -->
    <div class="w-full max-w-md bg-primary/10 border border-primary/20 rounded-xl p-4 mb-8">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
          <span class="material-icons text-primary animate-spin text-xl">sync</span>
        </div>
        <div>
          <p class="text-white font-semibold">Syncing to Financial Ledger</p>
          <p class="text-xs text-gray-400">Transaction recorded securely</p>
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="w-full max-w-md space-y-3">
      <button @click="nextDelivery"
        class="w-full bg-primary text-black py-4 rounded-xl font-bold text-lg hover:bg-primary-dark transition-colors">
        Next Delivery →
      </button>

      <button @click="viewSummary"
        class="w-full bg-white/5 border border-white/10 text-white py-3 rounded-xl font-medium hover:bg-white/10 transition-colors">
        View Route Summary
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useRouteStore } from '../stores/routeStore'

const router = useRouter()
const route = useRoute()
const routeStore = useRouteStore()

const customerName = ref('Elon Musk')
const timestamp = ref('')
const gpsCoordinates = ref('30.2672° N, 97.7431° W')
const paymentAmount = ref(null) // null if not COD
const confirmationId = ref('DLV-8942-CONF-' + Math.random().toString(36).substr(2, 9).toUpperCase())
const deliveryPhoto = ref('https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=400&q=80')
const signature = ref(null) // Would be signature data URL

onMounted(() => {
  const now = new Date()
  timestamp.value = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })

  // Simulate sync animation
  setTimeout(() => {
    console.log('Synced to ledger')
  }, 2000)
})

const nextDelivery = () => {
  routeStore.completeDelivery(route.params.stopId)
  router.push('/navigation')
}

const viewSummary = () => {
  router.push('/manifest')
}
</script>
