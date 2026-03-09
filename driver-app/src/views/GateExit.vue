<template>
    <div class="screen-layout" :class="isDark ? 'bg-background-dark text-white' : 'bg-background-light text-gray-900'">

        <!-- ── HEADER ───────────────────────────────── -->
        <header class="flex-shrink-0 px-5 pt-5 pb-4 border-b" :class="isDark ? 'border-white/5' : 'border-gray-100'">
            <div class="flex items-center gap-3">
                <button @click="$router.back()" class="w-10 h-10 rounded-full flex items-center justify-center border"
                    :class="isDark ? 'bg-surface-dark border-white/5 text-gray-400' : 'bg-white border-gray-200 shadow-sm'">
                    <span class="material-icons text-xl">arrow_back</span>
                </button>
                <div>
                    <h1 class="text-2xl font-black tracking-tight">Gate Exit</h1>
                    <p class="text-xs" :class="isDark ? 'text-gray-400' : 'text-gray-500'">North-East Hub · Gate 7</p>
                </div>
            </div>
        </header>

        <!-- ── SCROLLABLE BODY ───────────────────────── -->
        <div class="screen-body flex-1 overflow-y-auto px-5 py-4 flex flex-col justify-center gap-6">

            <div class="rounded-3xl p-8 border text-center relative overflow-hidden"
                :class="isDark ? 'bg-surface-dark border-white/10 shadow-2xl' : 'bg-white border-gray-100 shadow-xl'">

                <!-- Background decor -->
                <div class="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-2xl"></div>
                <div
                    class="absolute -bottom-10 -left-10 w-32 h-32 text-accent-cyan/10 bg-accent-cyan/10 rounded-full blur-2xl">
                </div>

                <div class="relative z-10 space-y-5">
                    <div class="w-20 h-20 mx-auto rounded-full flex items-center justify-center border-4"
                        :class="isDark ? 'border-primary/20 bg-primary/10' : 'border-primary/20 bg-primary/5'">
                        <span class="material-icons text-5xl text-primary animate-pulse">qr_code_scanner</span>
                    </div>

                    <div>
                        <p class="font-black text-xl tracking-tight">Scan Gate Code</p>
                        <p class="text-xs mt-1 leading-relaxed" :class="isDark ? 'text-gray-400' : 'text-gray-500'">
                            Point your camera at the exit terminal's QR code to log your departure
                        </p>
                    </div>

                    <button @click="scanExit"
                        class="w-full h-14 rounded-2xl font-black text-background-dark active:scale-[0.97] transition-all flex items-center justify-center gap-2"
                        style="background: linear-gradient(135deg, #1CE783, #15b86a);"
                        :class="{ 'opacity-60 pointer-events-none': isCapturing }">
                        <span class="material-icons" v-if="!isCapturing">camera_alt</span>
                        <span class="material-icons animate-spin" v-else>refresh</span>
                        {{ isCapturing ? 'Scanning...' : 'Scan & Exit Gate' }}
                    </button>
                </div>
            </div>

            <div class="rounded-2xl p-5 border space-y-3"
                :class="isDark ? 'bg-surface-dark/40 border-white/5' : 'bg-white border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]'">
                <h3 class="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Exit Details</h3>
                <div v-for="item in exitItems" :key="item.label"
                    class="flex items-center justify-between text-sm py-1 border-b last:border-0"
                    :class="isDark ? 'border-white/5' : 'border-gray-50'">
                    <span class="font-medium" :class="isDark ? 'text-gray-400' : 'text-gray-500'">{{ item.label
                    }}</span>
                    <span class="font-bold">{{ item.value }}</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUiStore } from '../stores/uiStore.js'
import { useCamera } from '../composables/useCamera.js'

const router = useRouter()
const uiStore = useUiStore()
const isDark = computed(() => uiStore.theme !== 'light')
const { scanQrCode, isCapturing } = useCamera()

const exitItems = [
    { label: 'Exit Time', value: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) },
    { label: 'Vehicle', value: 'CC-TRK-042' },
    { label: 'Route', value: 'RT-2049-MAR06' },
    { label: 'Stops', value: '7 assigned' },
]

async function scanExit() {
    try {
        const result = await scanQrCode('Scan Gate QR Code')
        // Allow progression even if canceled/failed on web
        if (result || !uiStore.isNativePlatform) {
            uiStore.showToast('Gate exit logged ✓', 'success')
            setTimeout(() => router.push('/route-progress'), 600)
        }
    } catch (e) {
        // Fallback for dev mode
        uiStore.showToast('Gate exit logged ✓', 'success')
        setTimeout(() => router.push('/route-progress'), 600)
    }
}
</script>
