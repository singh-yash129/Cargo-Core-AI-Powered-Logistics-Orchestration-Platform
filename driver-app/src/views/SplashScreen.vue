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
                    <!-- CC Logo SVG -->
                    <svg viewBox="0 0 120 120" class="w-full h-full drop-shadow-[0_0_20px_rgba(28,231,131,0.6)]">
                        <defs>
                            <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" style="stop-color:#1CE783;stop-opacity:1" />
                                <stop offset="100%" style="stop-color:#44a8e9;stop-opacity:1" />
                            </linearGradient>
                        </defs>
                        <rect width="120" height="120" rx="28" fill="url(#logoGrad)" />
                        <text x="60" y="76" text-anchor="middle" font-family="Inter, sans-serif" font-weight="900"
                            font-size="42" fill="#0F1115">CC</text>
                    </svg>
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
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUiStore } from '../stores/uiStore.js'
import { useDriverStore } from '../stores/driverStore.js'

const router = useRouter()
const uiStore = useUiStore()
const driverStore = useDriverStore()
const isDark = computed(() => uiStore.theme !== 'light')

onMounted(() => {
    setTimeout(() => {
        router.push(driverStore.isAuthenticated ? '/dashboard' : '/login')
    }, 2800)
})
</script>
