<template>
  <div
    class="bg-background-light dark:bg-background-dark text-slate-800 dark:text-white font-display min-h-screen flex items-center justify-center p-4 selection-custom overflow-hidden relative">
    <!-- Ambient Background Effects -->
    <div class="ambient-glow top-[-100px] left-[-50px]"></div>
    <div class="ambient-glow bottom-[-50px] right-[-100px]"
      style="background: radial-gradient(circle, rgba(68, 233, 150, 0.08) 0%, rgba(17, 33, 25, 0) 70%);"></div>

    <!-- Main Container - Mobile Dimensions -->
    <main class="w-full max-w-sm relative z-10 flex flex-col h-[800px] max-h-[90vh] justify-between">
      <!-- Header Section -->
      <div class="flex flex-col items-center pt-12 animate-fade-in-down">
        <!-- Logo Icon -->
        <div class="mb-6 flex flex-col items-center">
          <img src="@/assets/cargo-core-logo.png" alt="Cargo-Core Logo"
            class="h-24 w-auto drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]" />
        </div>
        <h1 class="text-3xl font-light tracking-wide text-white/90 mb-1">
          Cargo-<span class="font-bold text-primary">Core</span>
        </h1>
        <p class="text-xs tracking-[0.3em] text-white/40 mt-1 uppercase">Moving What Matters</p>
      </div>

      <!-- Login Form Section -->
      <div class="flex-1 flex flex-col justify-center space-y-6 px-2">
        <!-- Driver ID Input -->
        <div class="group">
          <label class="block text-xs font-medium text-primary/80 uppercase tracking-wider mb-2 ml-1">Driver ID</label>
          <div class="glass-input rounded-2xl flex items-center px-4 py-4">
            <span class="material-icons text-white/40 mr-3 text-xl">badge</span>
            <input v-model="driverId" @keyup.enter="handleLogin"
              class="bg-transparent border-none outline-none text-white placeholder-white/30 flex-1 font-light focus:ring-0 p-0 text-lg"
              placeholder="Enter your ID" type="text" />
          </div>
        </div>

        <!-- Password Input -->
        <div class="group">
          <label class="block text-xs font-medium text-primary/80 uppercase tracking-wider mb-2 ml-1">Password</label>
          <div class="glass-input rounded-2xl flex items-center px-4 py-4">
            <span class="material-icons text-white/40 mr-3 text-xl">lock</span>
            <input v-model="password" @keyup.enter="handleLogin"
              class="bg-transparent border-none outline-none text-white placeholder-white/30 flex-1 font-light focus:ring-0 p-0 text-lg"
              placeholder="••••••••" :type="showPassword ? 'text' : 'password'" />
            <button @click="showPassword = !showPassword"
              class="text-white/40 hover:text-primary transition-colors focus:outline-none">
              <span class="material-icons text-xl">{{ showPassword ? 'visibility' : 'visibility_off' }}</span>
            </button>
          </div>
        </div>

        <!-- Actions Stack -->
        <div class="pt-4 space-y-4">
          <!-- Primary Sign In Button -->
          <button @click="handleLogin" :disabled="!driverId || !password" :class="[
            'w-full bg-primary hover:bg-primary/90 text-background-dark font-semibold rounded-2xl py-4',
            'transition-all transform active:scale-[0.98] shadow-[0_0_20px_rgba(68,233,150,0.3)]',
            'flex items-center justify-center gap-2',
            (!driverId || !password) && 'opacity-50 cursor-not-allowed'
          ]">
            <span>Sign In</span>
            <span class="material-icons text-lg">arrow_forward</span>
          </button>

          <!-- Biometric Button (Face ID) -->
          <button @click="handleBiometricLogin"
            class="w-full glass-panel hover:bg-white/5 text-white rounded-2xl py-4 transition-all active:scale-[0.98] flex items-center justify-center gap-3 border border-white/10 group">
            <div class="relative w-6 h-6 flex items-center justify-center">
              <span
                class="material-icons text-2xl text-primary/80 group-hover:text-primary transition-colors absolute">face</span>
              <div class="absolute inset-0 border-t border-primary/60 animate-pulse w-full top-1/2"></div>
            </div>
            <span class="text-sm font-medium tracking-wide">Login with Face ID</span>
          </button>
        </div>
      </div>

      <!-- Footer -->
      <div class="pb-8 flex flex-col items-center space-y-4">
        <button @click="$router.push('/crisis')"
          class="text-sm text-white/40 hover:text-white transition-colors flex items-center gap-1 group">
          <span class="material-icons text-base group-hover:text-primary transition-colors">help_outline</span>
          <span>Need help logging in?</span>
        </button>
        <div class="w-12 h-1 rounded-full bg-white/10"></div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useDriverStore } from '../stores/driverStore'

const router = useRouter()
const driverStore = useDriverStore()

const driverId = ref('')
const password = ref('')
const showPassword = ref(false)

const isLoading = ref(false)

const handleLogin = async () => {
  if (!driverId.value || !password.value) return

  isLoading.value = true
  // Simulate API call
  setTimeout(() => {
    isLoading.value = false
    driverStore.login(driverId.value, 'password') // Set authenticated state
    // Navigate to Pre-Shift Safety (Enterprise Flow)
    router.push('/pre-shift-safety')
  }, 1500)
}

const handleBiometricLogin = () => {
  // Simulate biometric success
  setTimeout(() => {
    driverStore.login('DRV-2049', 'biometric')
    router.push('/vehicle-binding')
  }, 1000)
}
</script>

<style scoped>
@keyframes fade-in-down {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-down {
  animation: fade-in-down 0.5s ease-out;
}
</style>
