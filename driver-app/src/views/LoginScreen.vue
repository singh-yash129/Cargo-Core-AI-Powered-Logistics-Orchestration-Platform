<template>
    <div class="screen-layout px-6 items-center"
        :class="isDark ? 'bg-background-dark text-white' : 'bg-background-light text-gray-900'">

        <!-- Ambient glows -->
        <div class="ambient-glow top-[-80px] left-[-60px]"></div>
        <div class="absolute bottom-[-60px] right-[-80px] w-96 h-96 rounded-full pointer-events-none"
            style="background: radial-gradient(circle, rgba(68,168,233,0.06) 0%, transparent 70%);"></div>

        <!-- Header -->
        <header class="w-full max-w-sm flex flex-col items-center pt-safe animate-fadeIn z-10 shrink-0">
            <div class="pt-4 flex flex-col items-center w-full">
                <!-- Logo -->
                <div class="relative mb-6">
                    <div class="absolute inset-0 bg-primary/20 rounded-full blur-2xl"></div>
                    <div class="relative w-20 h-20 flex items-center justify-center">
                        <img src="../assets/cargo-core-logo.png" alt="Cargo-Core"
                            class="w-full h-full object-contain drop-shadow-[0_0_14px_rgba(28,231,131,0.5)]" />
                    </div>
                </div>

                <h1 class="text-3xl font-light tracking-wide mb-1">
                    Cargo-<span class="font-black text-primary">Core</span>
                </h1>
                <p class="text-[10px] tracking-[0.35em] uppercase mb-1"
                    :class="isDark ? 'text-white/40' : 'text-gray-400'">
                    Moving What Matters</p>
                <div class="flex items-center gap-2 mt-3 px-3 py-1 rounded-full border"
                    :class="isDark ? 'bg-primary/10 border-primary/20' : 'bg-primary/10 border-primary/30'">
                    <div class="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
                    <span class="text-[10px] font-bold uppercase tracking-wider text-primary">Driver Access</span>
                </div>
            </div>
        </header>

        <!-- Form -->
        <main class="w-full max-w-sm flex-1 flex flex-col justify-center gap-5 z-10">
            <!-- Driver ID -->
            <div>
                <label class="block text-xs font-semibold uppercase tracking-wider mb-2 ml-1"
                    :class="isDark ? 'text-primary/80' : 'text-primary'" for="driverIdInput">Driver ID</label>
                <div @click="focusDriverInput" class="glass-input rounded-2xl flex items-center px-4 py-4 gap-3 transition-colors cursor-text"
                    :class="driverId ? (isDark ? 'border-primary/40' : 'border-primary/50 shadow-sm') : ''">
                    <span class="material-icons text-lg"
                        :class="driverId ? 'text-primary' : (isDark ? 'text-white/40' : 'text-gray-400')">badge</span>
                    <input ref="driverIdRef" id="driverIdInput" v-model="driverId" @keyup.enter="handleLogin" type="text" placeholder="e.g. DRV-2049"
                        :disabled="isAnyLoading" inputmode="text" enterkeyhint="done"
                        class="flex-1 min-w-0 bg-transparent border-none outline-none font-medium text-lg placeholder-opacity-30 disabled:opacity-50"
                        style="text-transform: uppercase; pointer-events: auto; touch-action: manipulation;"
                        :class="isDark ? 'text-white placeholder-white/30' : 'text-gray-900 placeholder-gray-400'"
                        autocomplete="username" />
                </div>
            </div>

            <!-- Mode toggle -->
            <div class="flex rounded-xl overflow-hidden border"
                :class="isDark ? 'border-white/10' : 'border-gray-200'">
                <button type="button" @click="loginMode = 'password'"
                    class="flex-1 py-2 text-xs font-bold uppercase tracking-wider transition-colors"
                    :class="loginMode === 'password'
                        ? 'bg-primary text-background-dark'
                        : (isDark ? 'text-white/40 hover:text-white' : 'text-gray-400 hover:text-gray-700')">
                    Password
                </button>
                <button type="button" @click="loginMode = 'pin'"
                    class="flex-1 py-2 text-xs font-bold uppercase tracking-wider transition-colors"
                    :class="loginMode === 'pin'
                        ? 'bg-primary text-background-dark'
                        : (isDark ? 'text-white/40 hover:text-white' : 'text-gray-400 hover:text-gray-700')">
                    PIN
                </button>
            </div>

            <!-- Password field -->
            <div v-if="loginMode === 'password'">
                <label class="block text-xs font-semibold uppercase tracking-wider mb-2 ml-1"
                    :class="isDark ? 'text-primary/80' : 'text-primary'" for="passwordInput">Password</label>
                <div @click="focusPasswordInput" class="glass-input rounded-2xl flex items-center px-4 py-4 gap-3 transition-colors cursor-text"
                    :class="password ? (isDark ? 'border-primary/40' : 'primary/50 shadow-sm') : ''">
                    <span class="material-icons text-lg"
                        :class="password ? 'text-primary' : (isDark ? 'text-white/40' : 'text-gray-400')">lock</span>
                    <input ref="passwordRef" id="passwordInput" v-model="password" @keyup.enter="handleLogin" :type="showPwd ? 'text' : 'password'"
                        placeholder="••••••••" :disabled="isAnyLoading"
                        class="flex-1 min-w-0 bg-transparent border-none outline-none font-medium text-lg placeholder-opacity-30 disabled:opacity-50"
                        style="pointer-events: auto; touch-action: manipulation;"
                        :class="isDark ? 'text-white placeholder-white/30' : 'text-gray-900 placeholder-gray-400'"
                        autocomplete="current-password" />
                    <button type="button" @click.stop.prevent="showPwd = !showPwd"
                        class="shrink-0 p-0 leading-none transition-colors active:scale-90 rounded-full relative z-10"
                        :disabled="isAnyLoading"
                        :class="isDark ? 'text-white/40 hover:text-primary' : 'text-gray-400 hover:text-primary'">
                        <span class="material-icons text-lg leading-none">{{ showPwd ? 'visibility' : 'visibility_off' }}</span>
                    </button>
                </div>
            </div>

            <!-- PIN field -->
            <div v-else>
                <label class="block text-xs font-semibold uppercase tracking-wider mb-3 ml-1"
                    :class="isDark ? 'text-primary/80' : 'text-primary'">4-Digit PIN</label>
                <div class="flex justify-center gap-4 mb-1" @click="focusPinInput">
                    <div v-for="i in 4" :key="i"
                        class="w-14 h-14 rounded-2xl border-2 flex items-center justify-center transition-all"
                        :class="[
                            pin.length >= i ? 'border-primary bg-primary/10' : (isDark ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-gray-50'),
                            pin.length === i - 1 ? 'scale-105' : ''
                        ]">
                        <div v-if="pin.length >= i" class="w-3 h-3 rounded-full bg-primary"></div>
                    </div>
                </div>
                <input ref="pinRef" v-model="pin" type="password" inputmode="numeric" pattern="[0-9]*"
                    maxlength="4" :disabled="isAnyLoading"
                    class="sr-only" @input="onPinInput" autocomplete="one-time-code" />
            </div>

            <!-- Error -->
            <p v-if="error"
                class="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/20 rounded-xl py-2 px-4 animate-shake">
                {{ error }}
            </p>

            <!-- Actions -->
            <div class="space-y-3 pt-2">
                <!-- Sign In Button -->
                <button @click="handleLogin" :disabled="!canSubmit || isAnyLoading"
                    class="w-full h-14 flex items-center justify-center gap-2 font-bold rounded-2xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    :class="canSubmit && !isAnyLoading ? 'bg-primary text-background-dark shadow-glow hover:bg-primary-dark' : 'bg-primary/50 text-background-dark/50'">
                    <span v-if="loading"
                        class="w-5 h-5 border-2 border-background-dark/30 border-t-background-dark rounded-full animate-spin"></span>
                    <span v-else class="material-icons text-lg">login</span>
                    <span>{{ loading ? 'Authenticating...' : 'Sign In' }}</span>
                </button>

            </div>

            <!-- Divider -->
            <div class="flex items-center gap-3 mt-2">
                <div class="flex-1 h-px" :class="isDark ? 'bg-white/10' : 'bg-gray-200'"></div>
                <span class="text-[10px] tracking-widest uppercase font-semibold"
                    :class="isDark ? 'text-white/30' : 'text-gray-400'">Level 3 · Field
                    Execution</span>
                <div class="flex-1 h-px" :class="isDark ? 'bg-white/10' : 'bg-gray-200'"></div>
            </div>
        </main>

        <!-- Footer -->
        <footer class="w-full max-w-sm flex flex-col items-center gap-4 pb-safe z-10 shrink-0">
            <div class="pb-4 flex flex-col items-center gap-4 w-full">
                <button @click="handleHelp" :disabled="isAnyLoading"
                    class="text-sm flex items-center gap-1.5 transition-colors active:scale-95 disabled:opacity-50"
                    :class="isDark ? 'text-white/40 hover:text-white' : 'text-gray-400 hover:text-gray-700'">
                    <span v-if="loadingHelp"
                        class="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></span>
                    <span v-else class="material-icons text-base">help_outline</span>
                    <span>Need help logging in?</span>
                </button>
                <p class="text-[10px] tracking-wider opacity-30" :class="isDark ? 'text-white' : 'text-gray-500'">
                    © 2026 Cargo-Core Technologies Pvt. Ltd.
                </p>
            </div>
        </footer>
    </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useDriverStore } from '../stores/driverStore.js'
import { useUiStore } from '../stores/uiStore.js'

const router = useRouter()
const driverStore = useDriverStore()
const uiStore = useUiStore()

const loginMode = ref('password') // 'password' | 'pin'
const driverId = ref('')
const password = ref('')
const pin = ref('')
const showPwd = ref(false)
const loading = ref(false)
const loadingHelp = ref(false)
const error = ref('')

const driverIdRef = ref(null)
const passwordRef = ref(null)
const pinRef = ref(null)

const isDark = computed(() => uiStore.theme !== 'light')
const isAnyLoading = computed(() => loading.value || loadingHelp.value)
const canSubmit = computed(() =>
    loginMode.value === 'pin'
        ? driverId.value && pin.value.length === 4
        : driverId.value && password.value
)

// Clear the other credential when switching modes
watch(loginMode, () => {
    error.value = ''
    if (loginMode.value === 'pin') {
        password.value = ''
        nextTick(() => pinRef.value?.focus())
    } else {
        pin.value = ''
        nextTick(() => passwordRef.value?.focus())
    }
})

const onPinInput = () => {
    pin.value = pin.value.replace(/\D/g, '').slice(0, 4)
    if (pin.value.length === 4) handleLogin()
}

const focusDriverInput = async () => {
    if (driverIdRef.value && !isAnyLoading.value) {
        driverIdRef.value.focus()
        try {
            const { Capacitor } = await import('@capacitor/core')
            if (Capacitor.isNativePlatform()) {
                const { Keyboard } = await import('@capacitor/keyboard')
                await Keyboard.show()
            }
        } catch { /* web fallback — ignore */ }
    }
}

const focusPasswordInput = async () => {
    if (passwordRef.value && !isAnyLoading.value) {
        passwordRef.value.focus()
        try {
            const { Capacitor } = await import('@capacitor/core')
            if (Capacitor.isNativePlatform()) {
                const { Keyboard } = await import('@capacitor/keyboard')
                await Keyboard.show()
            }
        } catch { /* web fallback — ignore */ }
    }
}

const focusPinInput = async () => {
    if (pinRef.value && !isAnyLoading.value) {
        pinRef.value.focus()
        try {
            const { Capacitor } = await import('@capacitor/core')
            if (Capacitor.isNativePlatform()) {
                const { Keyboard } = await import('@capacitor/keyboard')
                await Keyboard.show()
            }
        } catch { /* web fallback — ignore */ }
    }
}

const handleLogin = async () => {
    if (!canSubmit.value || isAnyLoading.value) return
    error.value = ''
    loading.value = true
    const credential = loginMode.value === 'pin' ? pin.value : password.value

    try {
        await driverStore.login(driverId.value.trim(), credential)
        router.push('/pre-shift')
    } catch (err) {
        error.value = loginMode.value === 'pin'
            ? 'Invalid Driver ID or PIN'
            : 'Invalid Driver ID or Password'
        pin.value = ''
    } finally {
        loading.value = false
    }
}

const handleHelp = async () => {
    if (isAnyLoading.value) return
    loadingHelp.value = true
    await new Promise(r => setTimeout(r, 400))
    router.push('/login-help')
}
</script>
