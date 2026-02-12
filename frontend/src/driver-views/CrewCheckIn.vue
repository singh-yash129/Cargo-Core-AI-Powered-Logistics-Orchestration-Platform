<template>
  <div class="bg-background-dark text-white min-h-screen flex flex-col p-6">
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-3xl font-bold">Crew Check-In</h1>
      <p class="text-gray-400 mt-1">Confirm crew attendance for this shift</p>
    </div>

    <!-- Crew List -->
    <div class="flex-1 space-y-4">
      <div v-for="member in crew" :key="member.id" class="glass-panel p-5 rounded-xl flex items-center justify-between">
        <div class="flex items-center gap-4">
          <img :src="member.photo" :alt="member.name"
            class="w-14 h-14 rounded-full object-cover ring-2 ring-white/10" />
          <div>
            <h3 class="font-semibold text-lg">{{ member.name }}</h3>
            <p class="text-sm text-gray-400">{{ member.role }}</p>
            <div v-if="member.boarded" class="flex items-center gap-2 mt-1 animate-fade-in">
              <span
                class="text-[10px] text-primary bg-primary/10 px-1.5 py-0.5 rounded border border-primary/20 flex items-center gap-1">
                <span class="material-icons text-[10px]">gps_fixed</span> Verified
              </span>
              <span class="text-[10px] text-gray-400">@ {{ member.boardedTime }}</span>
            </div>
          </div>
        </div>
        <button @click="toggleBoarded(member.id)" :class="[
          'px-6 py-2 rounded-lg font-semibold transition-all',
          member.boarded
            ? 'bg-primary text-black'
            : 'bg-surface-dark border border-white/10 text-gray-400'
        ]">
          {{ member.boarded ? '✓ Boarded' : 'Board' }}
        </button>
      </div>
    </div>

    <!-- Confirm Button -->
    <button @click="confirmCrew" :disabled="!allBoarded" :class="[
      'w-full py-4 rounded-xl font-bold text-lg mt-6',
      allBoarded
        ? 'bg-primary text-black'
        : 'bg-gray-700 text-gray-500 cursor-not-allowed'
    ]">
      {{ allBoarded ? 'Confirm Crew' : `${boardedCount}/${crew.length} Boarded` }}
    </button>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useDriverStore } from '../stores/driverStore'
import { dummyManifest } from '../utils/dummyData'

const router = useRouter()
const driverStore = useDriverStore()

// Enhance crew data with local state for deep logging
const crew = ref(dummyManifest.assignedCrew.map(m => ({
  ...m,
  boardedTime: null,
  gpsVerified: false
})))

const boardedCount = computed(() => crew.value.filter(m => m.boarded).length)
const allBoarded = computed(() => crew.value.every(m => m.boarded))

const toggleBoarded = (id) => {
  const member = crew.value.find(m => m.id === id)
  if (member) {
    member.boarded = !member.boarded
    if (member.boarded) {
      member.boardedTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      member.gpsVerified = true // Simulate GPS check
    } else {
      member.boardedTime = null
      member.gpsVerified = false
    }
  }
}

const confirmCrew = () => {
  // In real app, send logs to backend
  driverStore.startShift()
  router.push('/dashboard')
}
</script>
