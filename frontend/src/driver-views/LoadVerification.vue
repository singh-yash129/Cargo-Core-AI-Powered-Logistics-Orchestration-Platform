<template>
  <div class="bg-background-dark text-white min-h-screen flex flex-col p-6">
    <!-- Header -->
    <div class="mb-6">
      <button @click="goBack" class="text-gray-400 hover:text-white mb-4">
        <span class="material-icons">arrow_back</span>
      </button>
      <h1 class="text-3xl font-bold">Load Verification</h1>
      <p class="text-gray-400 mt-1">Scan all packages before departure</p>
    </div>

    <!-- Progress Counter -->
    <div class="bg-card-dark rounded-2xl p-6 mb-6 text-center">
      <div class="text-5xl font-bold text-white mb-2">
        {{ scannedCount }} / {{ totalPackages }}
      </div>
      <div class="text-sm text-gray-400">Packages Scanned</div>
      
      <!-- Progress Bar -->
      <div class="w-full bg-gray-700 rounded-full h-2 mt-4">
        <div 
          class="bg-primary h-2 rounded-full transition-all duration-300"
          :style="`width: ${(scannedCount / totalPackages) * 100}%`"
        ></div>
      </div>
    </div>

    <!-- Simulation Scanner -->
    <div class="flex-1 flex flex-col items-center justify-center space-y-6">
      <div class="w-52 h-52 border-4 border-primary/30 rounded-2xl flex items-center justify-center relative overflow-hidden">
        <!-- Scanning Animation -->
        <div class="absolute inset-0 flex items-center justify-center">
          <div class="w-full h-1 bg-primary/50 animate-pulse"></div>
        </div>
        <span class="material-icons text-primary text-8xl opacity-50">qr_code_scanner</span>
      </div>
      
      <p class="text-gray-400 text-center">Position package QR code in frame</p>

      <!-- Simulate Scan Button -->
      <button 
        @click="simulateScan"
        :disabled="allScanned"
        :class="[
          'px-8 py-4 rounded-xl font-bold',
          allScanned 
            ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
            : 'bg-primary/20 text-primary border-2 border-primary hover:bg-primary hover:text-black transition-all'
        ]"
      >
        {{ allScanned ? 'All Packages Scanned' : 'Simulate Scan' }}
      </button>
    </div>

    <!-- Package List -->
    <div class="space-y-2 mb-6">
      <div 
        v-for="pkg in packages" 
        :key="pkg.id"
        :class="[
          'flex items-center justify-between p-4 rounded-lg',
          pkg.scanned ? 'bg-primary/10 border border-primary/30' : 'bg-card-dark border border-gray-700'
        ]"
      >
        <div class="flex items-center gap-3">
          <span 
            :class="[
              'material-icons text-2xl',
              pkg.scanned ? 'text-primary' : 'text-gray-500'
            ]"
          >
            {{ pkg.scanned ? 'check_circle' : 'radio_button_unchecked' }}
          </span>
          <span class="font-mono text-sm">{{ pkg.id }}</span>
        </div>
        <span v-if="pkg.scanned" class="text-xs text-primary font-semibold">✓ SCANNED</span>
      </div>
    </div>

    <!-- Continue Button -->
    <button 
      @click="proceedToRoute"
      :disabled="!allScanned"
      :class="[
        'w-full py-4 rounded-xl font-bold text-lg',
        allScanned 
          ? 'bg-primary text-black' 
          : 'bg-gray-700 text-gray-500 cursor-not-allowed'
      ]"
    >
      {{ allScanned ? 'Start Navigation →' : `Scan ${totalPackages - scannedCount} More` }}
    </button>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useRouteStore } from '../stores/routeStore'

const router = useRouter()
const routeStore = useRouteStore()

const packages = ref([
  { id: 'PKG-001', scanned: false },
  { id: 'PKG-002', scanned: false },
  { id: 'PKG-003', scanned: false },
  { id: 'PKG-004', scanned: false },
  { id: 'PKG-005', scanned: false },
  { id: 'PKG-006', scanned: false },
  { id: 'PKG-007', scanned: false },
])

const scannedCount = computed(() => packages.value.filter(p => p.scanned).length)
const totalPackages = computed(() => packages.value.length)
const allScanned = computed(() => scannedCount.value === totalPackages.value)

const simulateScan = () => {
  const unscanned = packages.value.find(p => !p.scanned)
  if (unscanned) {
    unscanned.scanned = true
    routeStore.scanPackage(unscanned.id)
  }
}

const proceedToRoute = () => {
  router.push('/navigation')
}

const goBack = () => {
  router.back()
}
</script>
