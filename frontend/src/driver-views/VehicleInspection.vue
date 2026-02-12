<template>
  <div class="bg-background-dark text-white min-h-screen flex flex-col p-6">
    <!-- Header -->
    <div class="mb-6">
      <button @click="goBack" class="text-gray-400 hover:text-white mb-4">
        <span class="material-icons">arrow_back</span>
      </button>
      <h1 class="text-3xl font-bold">Vehicle Inspection</h1>
      <p class="text-gray-400 mt-1">Complete all checks to start your shift</p>
    </div>

    <!-- Progress -->
    <div class="mb-8">
      <div class="flex justify-between text-sm mb-2">
        <span class="text-gray-400">Step {{ currentStep }} of {{ totalSteps }}</span>
        <span class="text-primary">{{ Math.round((currentStep / totalSteps) * 100) }}%</span>
      </div>
      <div class="w-full bg-gray-700 rounded-full h-2">
        <div class="bg-primary h-2 rounded-full transition-all" :style="`width: ${(currentStep / totalSteps) * 100}%`"></div>
      </div>
    </div>

    <!-- Inspection Steps -->
    <div class="flex-1 overflow-auto no-scrollbar">
      <!-- Step 1: Fuel Level -->
      <div v-if="currentStep === 1" class="space-y-6">
        <h2 class="text-xl font-semibold">Fuel/Charge Level</h2>
        <div class="glass-panel p-6 rounded-xl">
          <input 
            v-model="inspectionData.fuelLevel" 
            type="range" 
            min="0" 
            max="100" 
            class="w-full"
          />
          <div class="text-center mt-4">
            <span class="text-4xl font-bold text-primary">{{ inspectionData.fuelLevel }}%</span>
          </div>
          <button class="w-full mt-4 bg-surface-dark py-3 rounded-lg border border-white/10">
            📷 Upload Fuel Gauge Photo
          </button>
        </div>
      </div>

      <!-- Step 2: Tire Condition -->
      <div v-if="currentStep === 2" class="space-y-6">
        <h2 class="text-xl font-semibold">Tire Condition</h2>
        <div class="space-y-3">
          <button 
            v-for="option in ['Good', 'Needs Attention', 'Damaged']" 
            :key="option"
            @click="inspectionData.tireCondition = option"
            :class="[
              'w-full py-4 rounded-xl border-2 transition-all',
              inspectionData.tireCondition === option 
                ? 'bg-primary/20 border-primary text-white' 
                : 'bg-surface-dark border-white/10 text-gray-400'
            ]"
          >
            {{ option }}
          </button>
        </div>
      </div>

      <!-- Step 3: Odometer -->
      <div v-if="currentStep === 3" class="space-y-6">
        <h2 class="text-xl font-semibold">Odometer Reading</h2>
        <div class="glass-panel p-6 rounded-xl">
          <input 
            v-model="inspectionData.odometer"
            type="number"
            placeholder="Enter odometer reading"
            class="w-full bg-surface-dark text-white text-2xl p-4 rounded-lg text-center"
          />
          <button class="w-full mt-4 bg-surface-dark py-3 rounded-lg border border-white/10">
            📷 OCR Scan Odometer
          </button>
        </div>
      </div>

      <!-- Step 4: Damage Check -->
      <div v-if="currentStep === 4" class="space-y-6">
        <h2 class="text-xl font-semibold">Vehicle Damage Check</h2>
        <div class="glass-panel p-6 rounded-xl">
          <p class="text-gray-400 mb-4">Any visible damage to the vehicle?</p>
          <textarea 
            v-model="inspectionData.damageNotes"
            placeholder="Describe any damage (optional)"
            class="w-full bg-surface-dark text-white p-4 rounded-lg h-32"
          ></textarea>
          <button class="w-full mt-4 bg-surface-dark py-3 rounded-lg border border-white/10">
            📷 Upload Damage Photos
          </button>
        </div>
      </div>
    </div>

    <!-- Navigation Buttons -->
    <div class="flex gap-4 mt-6">
      <button 
        v-if="currentStep > 1"
        @click="currentStep--"
        class="flex-1 bg-surface-dark py-4 rounded-xl"
      >
        Previous
      </button>
      <button 
        v-if="currentStep < totalSteps"
        @click="currentStep++"
        :disabled="!isStepComplete"
        :class="[
          'flex-1 py-4 rounded-xl font-semibold',
          isStepComplete 
            ? 'bg-primary text-black' 
            : 'bg-gray-700 text-gray-500 cursor-not-allowed'
        ]"
      >
        Next
      </button>
      <button 
        v-if="currentStep === totalSteps"
        @click="confirmInspection"
        :disabled="!isStepComplete"
        :class="[
          'flex-1 py-4 rounded-xl font-semibold',
          isStepComplete 
            ? 'bg-primary text-black' 
            : 'bg-gray-700 text-gray-500 cursor-not-allowed'
        ]"
      >
        Confirm Vehicle Status
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useDriverStore } from '../stores/driverStore'
import { dummyManifest } from '../utils/dummyData'

const router = useRouter()
const driverStore = useDriverStore()

const currentStep = ref(1)
const totalSteps = 4

const inspectionData = ref({
  fuelLevel: 85,
  tireCondition: '',
  odometer: '',
  damageNotes: ''
})

const isStepComplete = computed(() => {
  switch (currentStep.value) {
    case 1: return inspectionData.value.fuelLevel > 0
    case 2: return inspectionData.value.tireCondition !== ''
    case 3: return inspectionData.value.odometer !== ''
    case 4: return true // Damage notes are optional
    default: return false
  }
})

const confirmInspection = () => {
  // Check if crew is assigned
  if (dummyManifest.assignedCrew.length > 0) {
    router.push('/crew-checkin')
  } else {
    driverStore.startShift()
    router.push('/dashboard')
  }
}

const goBack = () => {
  router.back()
}
</script>
