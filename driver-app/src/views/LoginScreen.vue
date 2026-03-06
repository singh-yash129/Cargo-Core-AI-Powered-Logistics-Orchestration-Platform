<template>
    <div class="min-h-screen flex flex-col items-center justify-between p-6 relative overflow-hidden"
        :class="isDark ? 'bg-background-dark text-white' : 'bg-background-light text-gray-900'">

        <!-- Ambient glows -->
        <div class="ambient-glow top-[-80px] left-[-60px]"></div>
        <div class="absolute bottom-[-60px] right-[-80px] w-96 h-96 rounded-full pointer-events-none"
            style="background: radial-gradient(circle, rgba(68,168,233,0.06) 0%, transparent 70%);"></div>

        <!-- Header -->
        <header class="w-full max-w-sm flex flex-col items-center pt-10 animate-fadeIn z-10">
            <!-- Logo -->
            <div class="relative mb-6">
                <div class="absolute inset-0 bg-primary/20 rounded-full blur-2xl"></div>
                <div class="relative w-20 h-20 flex items-center justify-center">
                    <svg viewBox="0 0 120 120" class="w-full h-full drop-shadow-[0_0_14px_rgba(28,231,131,0.5)]">
                        <defs>
                            <linearGradient id="loginLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" style="stop-color:#1CE783;stop-opacity:1" />
                                <stop offset="100%" style="stop-color:#44a8e9;stop-opacity:1" />
                            </linearGradient>
                        </defs>
                        <rect width="120" height="120" rx="26" fill="url(#loginLogoGrad)" />
                        <text x="60" y="77" text-anchor="middle" font-family="Inter" font-weight="900" font-size="42"
                            fill="#0F1115">CC</text>
                    </svg>
                </div>
            </div>

            <h1 class="text-3xl font-light tracking-wide mb-1">
                Cargo-<span class="font-black text-primary">Core</span>
            </h1>
            <p class="text-[10px] tracking-[0.35em] uppercase mb-1" :class="isDark ? 'text-white/40' : 'text-gray-400'">
                Moving What Matters</p>
            <div class="flex items-center gap-2 mt-3 px-3 py-1 rounded-full border"
                :class="isDark ? 'bg-primary/10 border-primary/20' : 'bg-primary/10 border-primary/30'">
                <div class="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
                <span class="text-[10px] font-bold uppercase tracking-wider text-primary">Driver Access</span>
            </div>
        </header>

        <!-- Form -->
        <main class="w-full max-w-sm flex-1 flex flex-col justify-center gap-5 z-10">
            <!-- Driver ID -->
            <div>
                <label class="block text-xs font-semibold uppercase tracking-wider mb-2 ml-1"
                    :class="isDark ? 'text-primary/80' : 'text-primary'">Driver ID</label>
                <div class="glass-input rounded-2xl flex items-center px-4 py-4 gap-3">
                    <span class="material-icons text-lg"
                        :class="isDark ? 'text-white/40' : 'text-gray-400'">badge</span>
                    <input v-model="driverId" @keyup.enter="handleLogin" type="text" placeholder="e.g. DRV-2049"
                        class="flex-1 bg-transparent border-none outline-none font-light text-lg placeholder-opacity-30"
                        :class="isDark ? 'text-white placeholder-white/30' : 'text-gray-900 placeholder-gray-400'"
                        autocomplete="username" />
                </div>
            </div>

            <!-- Password -->
            <div>
                <label class="block text-xs font-semibold uppercase tracking-wider mb-2 ml-1"
                    :class="isDark ? 'text-primary/80' : 'text-primary'">Password</label>
                <div class="glass-input rounded-2xl flex items-center px-4 py-4 gap-3">
                    <span class="material-icons text-lg" :class="isDark ? 'text-white/40' : 'text-gray-400'">lock</span>
                    <input v-model="password" @keyup.enter="handleLogin" :type="showPwd ? 'text' : 'password'"
                        placeholder="••••••••"
                        class="flex-1 bg-transparent border-none outline-none font-light text-lg placeholder-opacity-30"
                        :class="isDark ? 'text-white placeholder-white/30' : 'text-gray-900 placeholder-gray-400'"
                        autocomplete="current-password" />
                    <button @click="showPwd = !showPwd" class="transition-colors"
                        :class="isDark ? 'text-white/40 hover:text-primary' : 'text-gray-400 hover:text-primary'">
                        <span class="material-icons text-xl">{{ showPwd ? 'visibility' : 'visibility_off' }}</span>
                    </button>
                </div>
            </div>

            <!-- Error -->
            <p v-if="error"
                class="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/20 rounded-xl py-2 px-4">
                {{ error }}
            </p>

            <!-- Actions -->
            <div class="space-y-3 pt-2">
                <!-- Sign In Button -->
                <button @click="handleLogin" :disabled="!driverId || !password || loading"
                    class="w-full flex items-center justify-center gap-2 font-bold rounded-2xl py-4 text-background-dark transition-all active:scale-[0.98] shadow-glow disabled:opacity-50 disabled:cursor-not-allowed"
                    :class="driverId && password && !loading ? 'bg-primary hover:bg-primary-dark' : 'bg-primary/50'">
                    <span v-if="loading"
                        class="w-5 h-5 border-2 border-background-dark/30 border-t-background-dark rounded-full animate-spin"></span>
                    <span v-else class="material-icons text-lg">{{ loading ? '' : 'login' }}</span>
                    <span>{{ loading ? 'Signing In...' : 'Sign In' }}</span>
                </button>

                <!-- Biometric Button -->
                <button @click="handleBiometric"
                    class="w-full flex items-center justify-center gap-3 rounded-2xl py-4 transition-all active:scale-[0.98] border group"
                    :class="isDark ? 'glass-panel hover:bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-700 shadow-sm'">
                    <div class="relative w-5 h-5 flex items-center justify-center">
                        <span class="material-icons text-xl transition-colors group-hover:text-primary"
                            :class="isDark ? 'text-primary/70' : 'text-gray-500'">face</span>
                    </div>
                    <span class="text-sm font-semibold tracking-wide">Login with Face ID</span>
                </button>
            </div>

            <!-- Divider -->
            <div class="flex items-center gap-3">
                <div class="flex-1 h-px" :class="isDark ? 'bg-white/10' : 'bg-gray-200'"></div>
                <span class="text-xs" :class="isDark ? 'text-white/30' : 'text-gray-400'">Level 3 · Field
                    Execution</span>
                <div class="flex-1 h-px" :class="isDark ? 'bg-white/10' : 'bg-gray-200'"></div>
            </div>
        </main>

        <!-- Footer -->
        <footer class="w-full max-w-sm flex flex-col items-center gap-4 pb-8 z-10">
            <button @click="$router.push('/crisis')" class="text-sm flex items-center gap-1.5 transition-colors"
                :class="isDark ? 'text-white/40 hover:text-white' : 'text-gray-400 hover:text-gray-700'">
                <span class="material-icons text-base">help_outline</span>
                <span>Need help logging in?</span>
            </button>
            <p class="text-[10px] tracking-wider opacity-30" :class="isDark ? 'text-white' : 'text-gray-500'">
                © 2026 Cargo-Core Technologies Pvt. Ltd.
            </p>
            <div class="w-10 h-1 rounded-full" :class="isDark ? 'bg-white/10' : 'bg-gray-200'"></div>
        </footer>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useDriverStore } from '../stores/driverStore.js'
import { useUiStore } from '../stores/uiStore.js'

const router = useRouter()
const driverStore = useDriverStore()
const uiStore = useUiStore()

const driverId = ref('')
const password = ref('')
const showPwd = ref(false)
const loading = ref(false)
const error = ref('')
const isDark = computed(() => uiStore.theme !== 'light')

const handleLogin = async () => {
    if (!driverId.value || !password.value) return
    error.value = ''
    loading.value = true
    await new Promise(r => setTimeout(r, 1200))
    loading.value = false
    driverStore.login(driverId.value)
    router.push('/pre-shift')
}

const handleBiometric = async () => {
    loading.value = true
    await new Promise(r => setTimeout(r, 800))
    loading.value = false
    driverStore.login('DRV-2049', 'biometric')
    router.push('/vehicle-binding')
}
</script>
