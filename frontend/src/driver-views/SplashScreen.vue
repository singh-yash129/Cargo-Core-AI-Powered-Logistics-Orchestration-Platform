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
        <div class="relative w-32 h-32 md:w-40 md:h-40 flex items-center justify-center">
          <img src="@/assets/cargo-core-logo.png" alt="Cargo-Core Logo"
            class="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(34,211,238,0.6)]" />
        </div>
      </div>
      <h1 class="text-3xl font-bold tracking-wide text-white mt-6 animate-pulse">Cargo-Core</h1>
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
          Moving What Matters
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
