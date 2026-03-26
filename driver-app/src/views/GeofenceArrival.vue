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
                    <h1 class="text-2xl font-black tracking-tight">Arrived!</h1>
                    <p class="text-xs text-primary font-semibold">Arrival logged · Stop #{{ stop?.stopNumber || 1 }}</p>
                </div>
            </div>
        </header>

        <!-- ── SCROLLABLE BODY ───────────────────────── -->
        <div class="screen-body px-5 py-4 flex flex-col gap-4">

            <div class="rounded-3xl p-8 text-center border-2 border-primary/30 relative overflow-hidden" :style="isDark
                ? 'background: linear-gradient(135deg, rgba(28,231,131,0.15), rgba(28,231,131,0.03))'
                : 'background: linear-gradient(135deg, rgba(28,231,131,0.10), rgba(28,231,131,0.02))'">
                <div
                    class="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl pointer-events-none">
                </div>
                <div class="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                    <span class="material-icons text-primary text-4xl">where_to_vote</span>
                </div>
                <h2 class="text-2xl font-black mb-2">You've Arrived</h2>
                <p class="text-sm" :class="isDark ? 'text-gray-400' : 'text-gray-500'">Arrival auto-logged · Dwell timer
                    started</p>
                <div class="text-4xl font-black text-primary mt-4 font-mono">{{ dwellTime }}</div>
                <p class="text-xs mt-1" :class="isDark ? 'text-gray-400' : 'text-gray-500'">Dwell time</p>
            </div>
        </div>

        <!-- ── STICKY FOOTER ────────────────────────── -->
        <div class="screen-footer px-5 py-4 border-t flex flex-col gap-2"
            :class="isDark ? 'border-white/5 bg-background-dark' : 'border-gray-100 bg-background-light'">
            <!-- Primary: go to delivery detail page -->
            <button @click="$router.push('/delivery/' + stopId)"
                class="w-full rounded-2xl h-14 flex items-center justify-center gap-2 font-bold text-background-dark shadow-glow active:scale-[0.98] transition-all"
                style="background: linear-gradient(135deg, #1CE783, #15b86a);">
                <span class="material-icons">list_alt</span>
                View Delivery Details
            </button>
            <!-- Secondary: skip detail, go straight to checklist -->
            <button @click="proceed"
                class="w-full rounded-2xl h-11 border font-semibold flex items-center justify-center gap-2 text-sm transition-all active:scale-[0.98]"
                :class="isDark ? 'bg-surface-dark/30 border-white/5 text-gray-400' : 'bg-white border-gray-200 text-gray-500 shadow-sm'">
                <span class="material-icons text-sm">skip_next</span>
                Skip to Checklist
            </button>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useUiStore } from '../stores/uiStore.js'
import { useRouteStore } from '../stores/routeStore.js'
import { useJobStore } from '../stores/jobStore.js'
import { useFlowRouter } from '../composables/useFlowRouter.js'

const route = useRoute()
const { advanceAndNavigate } = useFlowRouter()
const uiStore = useUiStore()
const routeStore = useRouteStore()
const jobStore = useJobStore()
const isDark = computed(() => uiStore.theme !== 'light')
const stopId = computed(() => route.params.id || 'STOP-001')
const stop = computed(() => jobStore.getStopById(stopId.value) || jobStore.currentStop || {})

const seconds = ref(0)
let timer = null

const dwellTime = computed(() => {
    const m = Math.floor(seconds.value / 60)
    const s = seconds.value % 60
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
})

onMounted(() => {
    jobStore.setCurrentStopById(stopId.value)
    routeStore.setCurrentStopById(stopId.value)

    try {
        jobStore.ensureArrivalState(stopId.value, {
            arrivedAt: new Date().toISOString(),
        })
    } catch (error) {
        console.warn('Unable to mark delivery arrival state:', error)
    }

    routeStore.startDwell(stopId.value)
    timer = setInterval(() => seconds.value++, 1000)
})
onUnmounted(() => {
    if (timer) clearInterval(timer)
})

function proceed() {
    advanceAndNavigate('DELIVERY_IN_PROGRESS')
}
</script>
