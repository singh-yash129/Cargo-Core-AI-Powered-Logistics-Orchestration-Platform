<template>
  <div class="fixed inset-0 bg-black z-50 flex flex-col">
    <!-- Header -->
    <div class="p-4 flex justify-between items-center bg-black/50 backdrop-blur-md">
      <button @click="$emit('close')" class="text-white">
        <span class="material-icons">close</span>
      </button>
      <span class="text-white font-medium">{{ title }}</span>
      <div class="w-10"></div>
    </div>

    <!-- Camera Preview Area -->
    <div class="flex-1 relative bg-gray-900 flex items-center justify-center">
      <div v-if="!capturedImage" class="text-center">
        <div class="w-64 h-64 border-4 border-primary/30 rounded-2xl flex items-center justify-center mb-4">
          <span class="material-icons text-primary text-8xl">photo_camera</span>
        </div>
        <p class="text-gray-400 text-sm">{{ hint }}</p>
      </div>
      
      <div v-else class="w-full h-full relative flex items-center justify-center">
        <img :src="capturedImage" alt="Captured" class="max-w-full max-h-full object-contain" />
        <button 
          @click="retake"
          class="absolute bottom-4 left-4 bg-white/10 backdrop-blur-md px-4 py-2 rounded-lg text-white border border-white/20"
        >
          <span class="material-icons mr-2">refresh</span>
          Retake
        </button>
      </div>
    </div>

    <!-- Actions -->
    <div class="p-6 bg-black/50 backdrop-blur-md">
      <button 
        v-if="!capturedImage"
        @click="simulateCapture"
        class="w-20 h-20 mx-auto flex items-center justify-center rounded-full bg-primary border-4 border-white/20 shadow-glow active:scale-95 transition-transform"
      >
        <span class="material-icons text-black text-3xl">camera</span>
      </button>
      
      <button 
        v-else
        @click="confirmPhoto"
        class="w-full bg-primary text-black py-4 rounded-xl font-bold text-lg"
      >
        Use Photo
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  title: {
    type: String,
    default: 'Take Photo'
  },
  hint: {
    type: String,
    default: 'Position subject in frame'
  }
})

const emit = defineEmits(['close', 'capture'])

const capturedImage = ref(null)

// Simulate camera capture with a placeholder image
const simulateCapture = () => {
  // In real app, this would access device camera
  // For now, generate a placeholder
  capturedImage.value = 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=400&q=80'
}

const retake = () => {
  capturedImage.value = null
}

const confirmPhoto = () => {
  emit('capture', capturedImage.value)
  emit('close')
}
</script>
