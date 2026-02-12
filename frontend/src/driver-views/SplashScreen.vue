<template>
  <div
    class="bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-display h-screen w-screen overflow-hidden flex flex-col justify-between items-center relative selection-custom">
    <!-- Background Ambient Glow -->
    <div class="absolute inset-0 z-0 pointer-events-none flex items-center justify-center overflow-hidden">
      <div class="w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] opacity-40"></div>
    </div>

    <!-- Main Content: Centered Logo -->
    <div class="flex-1 flex flex-col items-center justify-center z-10 w-full relative">
      <!-- Logo Container -->
      <div class="relative group">
        <!-- Animated Glow Behind -->
        <div class="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse-slow"></div>

        <!-- Logo Mark -->
        <div class="relative w-24 h-24 md:w-32 md:h-32 flex items-center justify-center">
          <!-- Abstract Geometric Logo -->
          <svg class="w-full h-full text-primary neon-glow" fill="none" viewBox="0 0 100 100"
            xmlns="http://www.w3.org/2000/svg">
            <!-- Outer Ring Segment -->
            <path d="M50 10 A40 40 0 0 1 90 50" stroke="currentColor" stroke-linecap="round" stroke-width="3"></path>
            <path class="opacity-30" d="M90 50 A40 40 0 0 1 50 90" stroke="currentColor" stroke-linecap="round"
              stroke-width="3"></path>
            <path d="M50 90 A40 40 0 0 1 10 50" stroke="currentColor" stroke-linecap="round" stroke-width="3"></path>
            <path class="opacity-30" d="M10 50 A40 40 0 0 1 50 10" stroke="currentColor" stroke-linecap="round"
              stroke-width="3"></path>
            <!-- Inner Geometric Core -->
            <path class="drop-shadow-lg" d="M50 30 L67 60 H33 L50 30 Z" fill="rgba(68, 233, 150, 0.1)"
              stroke="currentColor" stroke-linejoin="round" stroke-width="3"></path>
            <circle cx="50" cy="45" fill="currentColor" r="2"></circle>
          </svg>
        </div>
      </div>
    </div>

    <!-- Footer: System Text & Loading -->
    <div class="z-10 pb-12 flex flex-col items-center gap-6 w-full px-8">
      <!-- Minimal Loading Bar -->
      <div class="w-16 h-0.5 bg-white/10 rounded-full overflow-hidden relative">
        <div class="absolute inset-y-0 left-0 bg-primary w-1/2 animate-slideRight"></div>
      </div>

      <!-- Footer Text -->
      <div class="text-center">
        <h1 class="text-xs tracking-[0.3em] font-medium text-white/50 uppercase font-display">
          Field Execution System
        </h1>
        <p class="text-[10px] tracking-widest text-primary/40 mt-1 uppercase opacity-60">
          v4.2.0 • Pro Driver
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const currentTime = ref('9:41')

onMounted(() => {
  // Update time
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })

  // Auto-redirect after 3 seconds
  setTimeout(() => {
    router.push('/login')
  }, 3000)
})
</script>

<style scoped>
@keyframes slideRight {
  0% {
    transform: translateX(-100%);
  }

  100% {
    transform: translateX(200%);
  }
}

.animate-slideRight {
  animation: slideRight 1.5s ease-in-out infinite;
}
</style>
