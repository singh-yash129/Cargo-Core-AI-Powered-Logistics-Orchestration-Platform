<template>
  <div class="relative h-16 w-full rounded-2xl bg-white/5 border border-white/10 overflow-hidden shadow-lg backdrop-blur-sm">
    <!-- Background Text -->
    <div class="absolute inset-0 flex items-center justify-center z-0">
      <span class="text-white/40 font-medium text-sm tracking-widest uppercase">
        {{ label }}
      </span>
    </div>

    <!-- Draggable Handle -->
    <div
      ref="handle"
      @mousedown="startDrag"
      @touchstart="startDrag"
      :style="{ transform: `translateX(${position}px)` }"
      :class="[
        'absolute top-1 left-1 bottom-1 rounded-xl shadow-glow flex items-center justify-center cursor-grab active:cursor-grabbing transition-all',
        isComplete ? 'w-[calc(100%-8px)] bg-primary' : 'w-20 bg-primary'
      ]"
    >
      <span v-if="!isComplete" class="material-icons text-black text-2xl">
        double_arrow
      </span>
      <span v-else class="text-black font-bold text-lg tracking-wide">
        {{ completeLabel }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  label: {
    type: String,
    default: 'Swipe to Confirm'
  },
  completeLabel: {
    type: String,
    default: '✓ CONFIRMED'
  }
})

const emit = defineEmits(['complete'])

const handle = ref(null)
const position = ref(0)
const isDragging = ref(false)
const isComplete = ref(false)
const maxPosition = ref(0)

onMounted(() => {
  maxPosition.value = handle.value.parentElement.offsetWidth - 88 // width of handle + padding
})

const startDrag = (e) => {
  if (isComplete.value) return
  isDragging.value = true
  e.preventDefault()
}

const onDrag = (e) => {
  if (!isDragging.value || isComplete.value) return
  
  const clientX = e.touches ? e.touches[0].clientX : e.clientX
  const parentLeft = handle.value.parentElement.getBoundingClientRect().left
  let newPos = clientX - parentLeft - 40
  
  newPos = Math.max(0, Math.min(newPos, maxPosition.value))
  position.value = newPos

  // Check if swiped to completion threshold (80%)
  if (newPos > maxPosition.value * 0.8) {
    complete()
  }
}

const stopDrag = () => {
  if (!isComplete.value) {
    // Snap back if not completed
    position.value = 0
  }
  isDragging.value = false
}

const complete = () => {
  isComplete.value = true
  position.value = maxPosition.value
  emit('complete')
  
  // Visual feedback
  setTimeout(() => {
    position.value = 0
  }, 1000)
}

onMounted(() => {
 document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', stopDrag)
  document.addEventListener('touchmove', onDrag)
  document.addEventListener('touchend', stopDrag)
})

onUnmounted(() => {
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
  document.removeEventListener('touchmove', onDrag)
  document.removeEventListener('touchend', stopDrag)
})
</script>
