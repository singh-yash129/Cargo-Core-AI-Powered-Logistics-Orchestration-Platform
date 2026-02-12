<template>
  <div class="bg-background-dark text-white min-h-screen p-6 flex flex-col">
    <h1 class="text-3xl font-bold mb-6">End of Shift Summary</h1>
    
    <div class="flex-1 space-y-4">
      <div class="glass-panel p-6 rounded-xl">
        <h3 class="text-sm text-gray-400 mb-2">Total Deliveries</h3>
        <p class="text-4xl font-bold">22</p>
      </div>
      
      <div class="grid grid-cols-2 gap-4">
        <div class="glass-panel p-4 rounded-xl">
          <p class="text-xs text-gray-400">Distance</p>
          <p class="text-2xl font-bold">45 mi</p>
        </div>
        <div class="glass-panel p-4 rounded-xl">
          <p class="text-xs text-gray-400">Duration</p>
          <p class="text-2xl font-bold">8h 15m</p>
        </div>
      </div>

      <div class="bg-primary/10 border border-primary/30 p-6 rounded-xl">
        <p class="text-sm text-gray-400 mb-2">Total Earnings</p>
        <p class="text-4xl font-bold text-primary">$185</p>
      </div>

      <div class="glass-panel p-4 rounded-xl">
        <p class="text-sm text-gray-400 mb-2">AI Summary</p>
        <p class="text-sm">Today you completed 22 deliveries, saved 8% fuel compared to average, and earned a 4.9 rating. Great work!</p>
      </div>
    </div>

    <button 
      @click="closeShift"
      class="w-full bg-primary text-black py-4 rounded-xl font-bold mt-6"
    >
      Close Shift
    </button>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useDriverStore } from '../stores/driverStore'

const router = useRouter()
const driverStore = useDriverStore()

const closeShift = () => {
  driverStore.endShift()
  driverStore.logout()
  router.push('/login')
}
</script>
