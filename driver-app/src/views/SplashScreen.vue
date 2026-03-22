<template>
    <div class="h-screen w-screen overflow-hidden flex flex-col items-center justify-between relative"
        :class="isDark ? 'bg-background-dark' : 'bg-background-light'">

        <!-- Ambient Glow -->
        <div class="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
            <div class="w-[500px] h-[500px] rounded-full blur-[140px] opacity-30"
                :class="isDark ? 'bg-primary/20' : 'bg-primary/15'"></div>
        </div>

        <!-- Top area (flex-1) -->
        <div class="flex-1 flex flex-col items-center justify-center z-10 w-full px-8">
            <!-- Logo Mark -->
            <div class="relative mb-6">
                <div class="absolute inset-0 bg-primary/25 rounded-full blur-2xl animate-pulse-slow"></div>
                <div class="relative w-28 h-28 flex items-center justify-center">
                    <!-- CC Logo Image -->
                    <img src="../assets/cargo-core-logo.png" alt="Cargo-Core"
                        class="w-full h-full object-contain drop-shadow-[0_0_20px_rgba(28,231,131,0.6)]" />
                </div>
            </div>

            <!-- Brand Name -->
            <h1 class="text-4xl font-black tracking-tight mb-1.5" :class="isDark ? 'text-white' : 'text-gray-900'">
                Cargo-<span class="text-primary">Core</span>
            </h1>
            <p class="text-xs tracking-[0.35em] uppercase font-medium mb-1"
                :class="isDark ? 'text-white/40' : 'text-gray-400'">Moving What Matters</p>
            <p class="text-[10px] tracking-widest uppercase font-medium" style="color: rgba(28,231,131,0.5);">Driver ·
                Pro Edition</p>
        </div>

        <!-- Bottom section -->
        <div class="z-10 pb-12 flex flex-col items-center gap-5 w-full px-8">

            <!-- Animated van -->
            <div class="truckWrapper transform scale-75 origin-bottom">
                <div class="truckBody">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 198 93" class="w-[130px]">
                        <path stroke-width="3" stroke="#282828" fill="#1CE783"
                            d="M135 22.5H177.264C178.295 22.5 179.22 23.133 179.594 24.0939L192.33 56.8443C192.442 57.1332 192.5 57.4404 192.5 57.7504V89C192.5 90.3807 191.381 91.5 190 91.5H135C133.619 91.5 132.5 90.3807 132.5 89V25C132.5 23.6193 133.619 22.5 135 22.5Z">
                        </path>
                        <path stroke-width="3" stroke="#282828" fill="#7D7C7C"
                            d="M146 33.5H181.741C182.779 33.5 183.709 34.1415 184.078 35.112L190.538 52.112C191.16 53.748 189.951 55.5 188.201 55.5H146C144.619 55.5 143.5 54.3807 143.5 53V36C143.5 34.6193 144.619 33.5 146 33.5Z">
                        </path>
                        <path stroke-width="2" stroke="#282828" fill="#282828"
                            d="M150 65C150 65.39 149.763 65.8656 149.127 66.2893C148.499 66.7083 147.573 67 146.5 67C145.427 67 144.501 66.7083 143.873 66.2893C143.237 65.8656 143 65.39 143 65C143 64.61 143.237 64.1344 143.873 63.7107C144.501 63.2917 145.427 63 146.5 63C147.573 63 148.499 63.2917 149.127 63.7107C149.763 64.1344 150 64.61 150 65Z">
                        </path>
                        <rect stroke-width="2" stroke="#282828" fill="#FFFCAB" rx="1" height="7" width="5" y="63"
                            x="187"></rect>
                        <rect stroke-width="2" stroke="#282828" fill="#282828" rx="1" height="11" width="4" y="81"
                            x="193"></rect>
                        <rect stroke-width="3" stroke="#282828" :fill="isDark ? '#DFDFDF' : '#FFFFFF'" rx="2.5"
                            height="90" width="121" y="1.5" x="6.5"></rect>
                        <rect stroke-width="2" stroke="#282828" :fill="isDark ? '#DFDFDF' : '#FFFFFF'" rx="2" height="4"
                            width="6" y="84" x="1"></rect>
                    </svg>
                </div>
                <div class="truckTires">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 30 30" class="w-6">
                        <circle stroke-width="3" stroke="#282828" fill="#282828" r="13.5" cy="15" cx="15"></circle>
                        <circle :fill="isDark ? '#DFDFDF' : '#FFFFFF'" r="7" cy="15" cx="15"></circle>
                    </svg>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 30 30" class="w-6">
                        <circle stroke-width="3" stroke="#282828" fill="#282828" r="13.5" cy="15" cx="15"></circle>
                        <circle :fill="isDark ? '#DFDFDF' : '#FFFFFF'" r="7" cy="15" cx="15"></circle>
                    </svg>
                </div>
                <!-- Road -->
                <div class="road"></div>
            </div>

            <!-- Typewriter Text -->
            <div class="text-center h-4 mt-2 mb-2 flex items-center justify-center">
                <p class="text-xs font-semibold tracking-wide" :class="isDark ? 'text-primary' : 'text-primary'">
                    {{ loadingText }}<span class="animate-pulse">_</span>
                </p>
            </div>

            <!-- Loading bar -->
            <div class="w-16 h-0.5 rounded-full overflow-hidden" :class="isDark ? 'bg-white/10' : 'bg-gray-200'">
                <div class="h-full rounded-full bg-primary animate-slideRight w-1/2"></div>
            </div>

            <!-- Footer -->
            <div class="text-center space-y-1">
                <p class="text-[10px] tracking-[0.3em] uppercase font-medium"
                    :class="isDark ? 'text-white/50' : 'text-gray-500'">
                    v4.2.0 · Filed Execution Platform
                </p>
                <p class="text-[9px] tracking-widest uppercase opacity-40"
                    :class="isDark ? 'text-white' : 'text-gray-400'">
                    © 2026 Cargo-Core Technologies Pvt. Ltd.
                </p>
            </div>

            <!-- Notch spacer -->
            <div class="w-12 h-1 rounded-full" :class="isDark ? 'bg-white/10' : 'bg-gray-200'"></div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUiStore } from '../stores/uiStore.js'
import { useDriverStore } from '../stores/driverStore.js'

const router = useRouter()
const uiStore = useUiStore()
const driverStore = useDriverStore()
const isDark = computed(() => uiStore.theme !== 'light')

const loadingText = ref('')
const phrases = [
    "Firing up engines...",
    "Syncing manifest...",
    "Checking authorizations...",
    "Loading map data...",
    "Ready to roll."
]

let phraseIndex = 0
let charIndex = 0
let isDeleting = false
let typistTimeout = null

function typeWriter() {
    const currentPhrase = phrases[phraseIndex]

    if (isDeleting) {
        loadingText.value = currentPhrase.substring(0, charIndex - 1)
        charIndex--
    } else {
        loadingText.value = currentPhrase.substring(0, charIndex + 1)
        charIndex++
    }

    let typingSpeed = isDeleting ? 30 : 50

    if (!isDeleting && charIndex === currentPhrase.length) {
        typingSpeed = 900 // Pause before deleting
        isDeleting = true
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false
        phraseIndex = (phraseIndex + 1) % phrases.length
        typingSpeed = 200 // Pause before next phrase
    }

    typistTimeout = setTimeout(typeWriter, typingSpeed)
}

onMounted(() => {
    typeWriter()
    setTimeout(() => {
        router.push(driverStore.isAuthenticated ? '/dashboard' : '/login')
    }, 4000) // Extended splash screen time a bit to allow text to play out
})

onUnmounted(() => {
    clearTimeout(typistTimeout)
})
</script>
