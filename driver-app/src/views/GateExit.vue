<template>
    <div class="min-h-screen pb-safe overflow-y-auto no-scrollbar"
        :class="isDark ? 'bg-background-dark text-white' : 'bg-background-light text-gray-900'">
        <div class="px-5 pt-5 pb-10 flex flex-col gap-5">
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

            <div class="rounded-2xl p-5 border text-center space-y-4"
                :class="isDark ? 'bg-surface-dark/40 border-white/8' : 'bg-white border-gray-100 shadow-sm'">
                <span class="material-icons text-6xl text-primary">qr_code_scanner</span>
                <p class="font-bold text-lg">Scan Gate QR Code</p>
                <p class="text-sm" :class="isDark ? 'text-gray-400' : 'text-gray-500'">Point camera at gate terminal to
                    log exit</p>
                <div class="inline-block px-6 py-3 rounded-2xl font-black text-background-dark cursor-pointer active:scale-[0.97] transition-all"
                    style="background: linear-gradient(135deg, #1CE783, #15b86a);" @click="scanExit">
                    Scan &amp; Exit Gate
                </div>
            </div>

            <div class="rounded-2xl p-4 border space-y-3"
                :class="isDark ? 'bg-surface-dark/30 border-white/5' : 'bg-white border-gray-100 shadow-sm'">
                <h3 class="text-xs font-bold uppercase tracking-widest"
                    :class="isDark ? 'text-gray-400' : 'text-gray-500'">Exit Confirmation</h3>
                <div v-for="item in exitItems" :key="item.label" class="flex justify-between text-sm">
                    <span :class="isDark ? 'text-gray-400' : 'text-gray-500'">{{ item.label }}</span>
                    <span class="font-semibold">{{ item.value }}</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUiStore } from '../stores/uiStore.js'

const router = useRouter()
const uiStore = useUiStore()
const isDark = computed(() => uiStore.theme !== 'light')

const exitItems = [
    { label: 'Exit Time', value: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) },
    { label: 'Vehicle', value: 'CC-TRK-042' },
    { label: 'Route', value: 'RT-2049-MAR06' },
    { label: 'Stops', value: '7 assigned' },
]

function scanExit() {
    uiStore.showToast('Gate exit logged successfully ✓', 'success')
    setTimeout(() => router.push('/navigation'), 800)
}
</script>
