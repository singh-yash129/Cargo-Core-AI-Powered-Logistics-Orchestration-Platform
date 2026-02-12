<template>
  <div class="bg-background-dark text-white min-h-screen flex flex-col pb-32">
    <!-- Main Content Container -->
    <main class="flex-1 flex flex-col relative px-4 pb-6 pt-4 overflow-y-auto no-scrollbar space-y-6">
      <!-- Header / Location Card -->
      <div class="glass-panel rounded-2xl p-6 relative overflow-hidden shadow-glass group">
        <!-- Decorative gradient bg -->
        <div
          class="absolute -top-10 -right-10 w-32 h-32 bg-primary/20 rounded-full blur-3xl group-hover:bg-primary/30 transition-all duration-500">
        </div>

        <div class="flex justify-between items-start relative z-10 mb-4">
          <div>
            <h3 class="text-primary text-sm font-semibold tracking-wider uppercase mb-1">
              Stop {{ currentStop.stopNumber }} of {{ totalStops }}
            </h3>
            <h1 class="text-3xl font-bold text-white mb-1">{{ currentStop.customerName }}</h1>
            <div class="flex items-center text-gray-400 space-x-1">
              <span class="material-icons text-sm">location_on</span>
              <p class="text-sm font-medium">{{ currentStop.address }}</p>
            </div>
          </div>
          <button
            class="bg-white/10 hover:bg-white/20 active:scale-95 transition-all p-3 rounded-full backdrop-blur-md border border-white/5">
            <span class="material-icons text-primary text-xl">navigation</span>
          </button>
        </div>

        <!-- Mini Map Preview -->
        <div class="w-full h-24 rounded-lg overflow-hidden relative border border-white/5 mt-4">
          <img alt="Map view"
            class="w-full h-full object-cover opacity-60 grayscale hover:grayscale-0 transition-all duration-700"
            src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&q=80" />
          <div class="absolute inset-0 bg-gradient-to-t from-surface-dark/90 to-transparent"></div>
          <div class="absolute bottom-2 left-3 flex items-center space-x-2">
            <span class="text-xs text-white/80 font-medium bg-black/50 px-2 py-0.5 rounded backdrop-blur-sm">0.2 mi
              away</span>
            <span
              class="text-xs text-primary font-medium bg-primary/10 px-2 py-0.5 rounded backdrop-blur-sm border border-primary/20">On
              Time</span>
          </div>
        </div>
      </div>

      <!-- Progress Section -->
      <div class="px-2">
        <div class="flex justify-between items-end mb-2">
          <span class="text-sm font-medium text-white/70">Task Completion</span>
          <span class="text-2xl font-bold text-primary">{{ completionPercentage }}%</span>
        </div>
        <div class="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
          <div class="h-full bg-primary shadow-glow transition-all duration-300"
            :style="`width: ${completionPercentage}%`"></div>
        </div>
      </div>

      <!-- Task List -->
      <div class="space-y-3 flex-1">
        <!-- Task Items -->
        <div v-for="task in tasks" :key="task.id" :class="[
          'glass-panel rounded-xl p-4 flex items-center justify-between border-l-4 transition-all duration-300',
          task.completed ? 'border-l-primary/50' : 'border-l-primary shadow-glow cursor-pointer'
        ]" @click="!task.completed && toggleTask(task)">
          <div class="flex items-center space-x-4">
            <div :class="[
              'h-10 w-10 rounded-full flex items-center justify-center border',
              task.completed ? 'bg-primary/20 border-primary/30' : 'border-2 border-primary bg-transparent'
            ]">
              <span :class="['material-icons text-xl', task.completed ? 'text-primary' : 'text-primary animate-pulse']">
                {{ task.completed ? 'check' : 'priority_high' }}
              </span>
            </div>
            <div>
              <h4 :class="['text-white font-medium text-lg', task.completed && 'line-through opacity-50']">
                {{ task.label }}
              </h4>
              <p class="text-xs text-white/40">{{ task.subtitle }}</p>
            </div>
          </div>

          <div v-if="task.completed && task.preview"
            class="h-10 w-10 rounded-lg overflow-hidden border border-white/10">
            <img :src="task.preview" alt="Preview" class="w-full h-full object-cover" />
          </div>

          <span v-else-if="!task.completed" class="material-icons text-white/30 text-2xl">chevron_right</span>
        </div>

        <!-- Move Order Sub-Tasks (if applicable) -->
        <div v-if="currentStop.type === 'move'" class="pt-2">
          <div class="flex items-center justify-between mb-3 px-1">
            <h5 class="text-xs font-bold text-white/50 uppercase tracking-widest">Move Specifics</h5>
            <span class="text-xs bg-white/10 px-2 py-0.5 rounded text-white/70">{{ completedSubTasks }}/{{
              subTasks.length }} Done</span>
          </div>
          <div class="glass-panel rounded-xl overflow-hidden divide-y divide-white/5">
            <label v-for="subTask in subTasks" :key="subTask.id"
              class="flex items-center p-4 cursor-pointer hover:bg-white/5 transition-colors group">
              <input type="checkbox" v-model="subTask.completed"
                class="form-checkbox h-6 w-6 text-primary rounded border-gray-600 bg-white/5 focus:ring-primary focus:ring-offset-0 transition-all duration-200 custom-checkbox" />
              <div class="ml-4 flex-1">
                <span
                  :class="['transition-colors', subTask.completed ? 'text-white/50 line-through' : 'text-white group-hover:text-primary font-medium']">
                  {{ subTask.label }}
                </span>
                <div v-if="subTask.note" class="text-xs text-white/40 mt-0.5">{{ subTask.note }}</div>
              </div>
              <span v-if="subTask.count" class="text-xs font-mono text-white/30 bg-white/5 px-2 py-1 rounded">{{
                subTask.count }}</span>
            </label>
          </div>
        </div>
      </div>
    </main>

    <!-- Footer Action -->
    <div class="p-6 bg-gradient-to-t from-background-dark via-background-dark to-transparent relative z-20">
      <SwipeButton label="Swipe to Finalize" complete-label="✓ COMPLETED" @complete="finalizeDelivery" />
    </div>

    <!-- Camera Modal -->
    <CameraCapture v-if="showCamera" title="Proof of Delivery" hint="Capture package at doorstep"
      @close="showCamera = false" @capture="handlePhotoCapture" />

    <!-- Signature Modal -->
    <SignaturePad v-if="showSignature" @close="showSignature = false" @confirm="handleSignatureCapture" />

    <!-- Voice Assistant -->
    <VoiceAssistant />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useRouteStore } from '../stores/routeStore'
import CameraCapture from '../driver-components/CameraCapture.vue'
import SignaturePad from '../driver-components/SignaturePad.vue'
import SwipeButton from '../driver-components/SwipeButton.vue'
import VoiceAssistant from '../driver-components/VoiceAssistant.vue'

const router = useRouter()
const route = useRoute()
const routeStore = useRouteStore()

const showCamera = ref(false)
const showSignature = ref(false)

const currentStop = ref({
  stopNumber: 4,
  customerName: 'Elon Musk',
  address: '333 Innovation Drive, Austin, TX',
  type: 'move'
})

const totalStops = ref(12)

const tasks = ref([
  { id: 1, label: 'Scan Package', subtitle: 'Completed 10:42 AM', completed: true, preview: null },
  { id: 2, label: 'Proof of Delivery Photo', subtitle: '1 image uploaded', completed: true, preview: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=100&q=80' },
  { id: 3, label: 'Customer Signature', subtitle: 'Required for high value item', completed: false, preview: null }
])

const subTasks = ref([
  { id: 1, label: 'Wrap Furniture', note: null, count: null, completed: true },
  { id: 2, label: 'Pack Kitchen', note: 'Fragile items alert', count: '0/5', completed: false }
])

const completionPercentage = computed(() => {
  const completedTasks = tasks.value.filter(t => t.completed).length
  return Math.round((completedTasks / tasks.value.length) * 100)
})

const completedSubTasks = computed(() => subTasks.value.filter(st => st.completed).length)

const toggleTask = (task) => {
  if (task.id === 2 && !task.completed) {
    showCamera.value = true
  } else if (task.id === 3 && !task.completed) {
    showSignature.value = true
  } else {
    task.completed = true
  }
}

const handlePhotoCapture = (photo) => {
  const task = tasks.value.find(t => t.id === 2)
  if (task) {
    task.completed = true
    task.preview = photo
  }
}

const handleSignatureCapture = (signature) => {
  const task = tasks.value.find(t => t.id === 3)
  if (task) {
    task.completed = true
    task.preview = signature
  }
}

const finalizeDelivery = () => {
  router.push(`/proof-of-delivery/${route.params.stopId}`)
}
</script>

<style scoped>
.custom-checkbox:checked {
  background-color: #1CE783;
  border-color: #1CE783;
  background-image: url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='black' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z'/%3e%3c/svg%3e");
}
</style>
