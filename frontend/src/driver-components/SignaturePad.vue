<template>
  <div class="fixed inset-0 bg-black/90 z-50 flex flex-col p-6">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <button @click="$emit('close')" class="text-white">
        <span class="material-icons">close</span>
      </button>
      <h2 class="text-white font-bold text-xl">Customer Signature</h2>
      <button @click="clear" class="text-primary font-medium">Clear</button>
    </div>

    <!-- Signature Canvas Area -->
    <div class="flex-1 bg-white/5 backdrop-blur-md rounded-2xl border-2 border-dashed border-white/20 flex items-center justify-center relative overflow-hidden">
      <canvas
        ref="canvas"
        @mousedown="startDrawing"
        @mousemove="draw"
        @mouseup="stopDrawing"
        @mouseleave="stopDrawing"
        @touchstart.prevent="startDrawing"
        @touchmove.prevent="draw"
        @touchend="stopDrawing"
        class="absolute inset-0 w-full h-full cursor-crosshair"
      ></canvas>
      
      <div v-if="!hasSignature" class="pointer-events-none text-white/30 text-center">
        <span class="material-icons text-6xl mb-2">draw</span>
        <p class="text-sm">Sign above</p>
      </div>
    </div>

    <!-- Actions -->
    <div class="mt-6 space-y-3">
      <button 
        @click="confirm"
        :disabled="!hasSignature"
        :class="[
          'w-full py-4 rounded-xl font-bold text-lg',
          hasSignature 
            ? 'bg-primary text-black' 
            : 'bg-gray-700 text-gray-500 cursor-not-allowed'
        ]"
      >
        Confirm Signature
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const emit = defineEmits(['close', 'confirm'])

const canvas = ref(null)
const ctx = ref(null)
const isDrawing = ref(false)
const hasSignature = ref(false)

onMounted(() => {
  const canvasEl = canvas.value
  canvasEl.width = canvasEl.offsetWidth
  canvasEl.height = canvasEl.offsetHeight
  ctx.value = canvasEl.getContext('2d')
  ctx.value.strokeStyle = '#1CE783'
  ctx.value.lineWidth = 3
  ctx.value.lineCap = 'round'
  ctx.value.lineJoin = 'round'
})

const getCoordinates = (e) => {
  const rect = canvas.value.getBoundingClientRect()
  if (e.touches && e.touches[0]) {
    return {
      x: e.touches[0].clientX - rect.left,
      y: e.touches[0].clientY - rect.top
    }
  }
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  }
}

const startDrawing = (e) => {
  isDrawing.value = true
  hasSignature.value = true
  const { x, y } = getCoordinates(e)
  ctx.value.beginPath()
  ctx.value.moveTo(x, y)
}

const draw = (e) => {
  if (!isDrawing.value) return
  const { x, y } = getCoordinates(e)
  ctx.value.lineTo(x, y)
  ctx.value.stroke()
}

const stopDrawing = () => {
  isDrawing.value = false
}

const clear = () => {
  ctx.value.clearRect(0, 0, canvas.value.width, canvas.value.height)
  hasSignature.value = false
}

const confirm = () => {
  if (!hasSignature.value) return
  const signatureData = canvas.value.toDataURL()
  emit('confirm', signatureData)
  emit('close')
}
</script>
