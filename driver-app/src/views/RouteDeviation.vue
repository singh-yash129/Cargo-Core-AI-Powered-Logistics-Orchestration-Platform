<template>
    <div class="min-h-screen pb-safe overflow-y-auto no-scrollbar"
        :class="isDark ? 'bg-background-dark text-white' : 'bg-background-light text-gray-900'">
        <div class="px-5 pt-5 pb-10 flex flex-col gap-5">
            <div class="flex items-center gap-3">
                <button @click="$router.back()" class="w-10 h-10 rounded-full flex items-center justify-center border"
                    :class="isDark ? 'bg-surface-dark border-white/5 text-gray-400' : 'bg-white border-gray-200 shadow-sm'">
                    <span class="material-icons text-xl">arrow_back</span>
                </button>
                <h1 class="text-2xl font-black tracking-tight">Route Deviation</h1>
            </div>

            <div class="rounded-2xl p-5 border"
                :class="isDark ? 'bg-signal-amber/10 border-signal-amber/20' : 'bg-amber-50 border-amber-200'">
                <div class="flex items-start gap-3">
                    <span class="material-icons text-signal-amber text-3xl">warning</span>
                    <div>
                        <p class="font-black text-signal-amber">Route Deviation Detected</p>
                        <p class="text-sm mt-1" :class="isDark ? 'text-gray-400' : 'text-gray-600'">You are 0.8 km off
                            the planned route. Please provide a reason.</p>
                    </div>
                </div>
            </div>

            <div class="space-y-2">
                <button v-for="reason in reasons" :key="reason" @click="selectedReason = reason"
                    class="w-full text-left p-4 rounded-2xl border font-semibold text-sm transition-all active:scale-[0.98]"
                    :class="selectedReason === reason
                        ? 'border-signal-amber bg-signal-amber/10 text-signal-amber'
                        : isDark ? 'border-white/5 bg-surface-dark/30 text-white hover:border-white/10' : 'border-gray-100 bg-white text-gray-700 shadow-sm hover:border-gray-200'">
                    {{ reason }}
                </button>
            </div>

            <button @click="submit" :disabled="!selectedReason"
                class="w-full rounded-2xl h-14 flex items-center justify-center gap-2 font-bold active:scale-[0.98] transition-all"
                :class="selectedReason
                    ? 'shadow-[0_0_20px_rgba(255,176,32,0.3)]'
                    : isDark ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-gray-100 text-gray-400 cursor-not-allowed'"
                :style="selectedReason ? 'background: linear-gradient(135deg, #FFB020, #e09010); color: #0F1115;' : ''">
                <span class="material-icons">send</span>
                Submit to Dispatcher
            </button>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUiStore } from '../stores/uiStore.js'
import { useRouteStore } from '../stores/routeStore.js'

const router = useRouter()
const uiStore = useUiStore()
const routeStore = useRouteStore()
const isDark = computed(() => uiStore.theme !== 'light')

const selectedReason = ref('')
const reasons = [
    '🚧 Road closed / construction',
    '🚦 Traffic jam / accident ahead',
    '⛽ Fuel stop required',
    '🅿️ No parking at destination',
    '👤 Customer requested alternate entrance',
    '📦 Extra pickup en route',
    '⚠️ Emergency / Safety concern',
]

function submit() {
    routeStore.logDeviation(selectedReason.value)
    uiStore.showToast('Deviation reported to dispatcher ✓', 'warning')
    router.back()
}
</script>
