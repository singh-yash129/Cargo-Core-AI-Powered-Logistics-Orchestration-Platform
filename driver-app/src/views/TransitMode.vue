<template>
    <div class="screen-layout" :class="isDark ? 'bg-background-dark text-white' : 'bg-background-light text-gray-900'">

        <!-- Fullscreen gradient hero -->
        <div class="absolute inset-0 z-0" :class="isDark ? 'bg-background-dark' : 'bg-background-light'">
            <div class="absolute inset-0 opacity-10"
                style="background: radial-gradient(ellipse at top, #7c3aed 0%, transparent 70%)"></div>
        </div>

        <!-- Content -->
        <div class="relative z-10 flex flex-col items-center justify-between h-full px-6 py-12">

            <!-- Top Section: From → To -->
            <div class="w-full">
                <div class="text-center mb-6">
                    <div class="w-16 h-16 mx-auto rounded-full bg-purple-500/20 flex items-center justify-center mb-3">
                        <span class="material-icons text-purple-400 text-3xl animate-pulse-slow">moving</span>
                    </div>
                    <p class="text-xs uppercase font-bold tracking-widest text-purple-400 mb-1">In Transit</p>
                    <h1 class="text-2xl font-black">En Route to Destination</h1>
                </div>

                <!-- Route Card -->
                <div class="rounded-3xl border p-5 mb-4"
                    :class="isDark ? 'bg-surface-dark/60 border-white/10' : 'bg-white border-gray-100 shadow-xl'">

                    <div class="flex items-start gap-3 mb-4">
                        <div class="flex flex-col items-center">
                            <div class="w-3 h-3 rounded-full bg-primary mt-1"></div>
                            <div class="w-0.5 h-8 bg-gradient-to-b from-primary to-purple-500 my-1"></div>
                            <div class="w-3 h-3 rounded-full bg-purple-500"></div>
                        </div>
                        <div class="flex-1 space-y-4">
                            <div>
                                <p class="text-xs uppercase font-bold text-primary tracking-wider mb-0.5">FROM</p>
                                <p class="font-semibold text-sm">{{ fromAddress }}</p>
                            </div>
                            <div>
                                <p class="text-xs uppercase font-bold text-purple-400 tracking-wider mb-0.5">TO</p>
                                <p class="font-semibold text-sm">{{ toAddress }}</p>
                            </div>
                        </div>
                    </div>

                    <!-- Stats Row -->
                    <div class="grid grid-cols-3 gap-3 pt-4 border-t"
                        :class="isDark ? 'border-white/5' : 'border-gray-100'">
                        <div class="text-center">
                            <p class="text-xl font-black text-purple-400">{{ elapsedTime }}</p>
                            <p class="text-[10px] uppercase font-semibold mt-0.5"
                                :class="isDark ? 'text-gray-500' : 'text-gray-400'">Elapsed</p>
                        </div>
                        <div class="text-center">
                            <p class="text-xl font-black text-primary">~25 km</p>
                            <p class="text-[10px] uppercase font-semibold mt-0.5"
                                :class="isDark ? 'text-gray-500' : 'text-gray-400'">Distance</p>
                        </div>
                        <div class="text-center">
                            <p class="text-xl font-black text-green-400">{{ eta }}</p>
                            <p class="text-[10px] uppercase font-semibold mt-0.5"
                                :class="isDark ? 'text-gray-500' : 'text-gray-400'">ETA</p>
                        </div>
                    </div>
                </div>

                <!-- GPS Live Badge -->
                <div class="flex items-center justify-center gap-2 mb-4">
                    <span class="relative flex w-3 h-3">
                        <span class="absolute inline-flex h-full w-full rounded-full bg-primary opacity-75 animate-ping"></span>
                        <span class="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                    </span>
                    <span class="text-xs font-bold text-primary uppercase tracking-wider">GPS Tracking Active</span>
                </div>
            </div>

            <!-- Crew Reminder -->
            <div class="w-full rounded-2xl border p-4 mb-4"
                :class="isDark ? 'bg-surface-dark/40 border-white/8' : 'bg-white border-gray-100 shadow-sm'">
                <div class="flex items-center justify-between mb-2">
                    <p class="text-xs uppercase font-bold tracking-wider"
                        :class="isDark ? 'text-gray-400' : 'text-gray-500'">Crew on Board</p>
                    <span class="text-xs font-bold text-primary">{{ crewCount }} members</span>
                </div>
                <div class="flex gap-2">
                    <img v-for="member in crewPreview" :key="member.id" :src="member.photo"
                        class="w-8 h-8 rounded-full border-2 border-primary/30 object-cover" />
                    <div v-if="extraCrew > 0"
                        class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                        :class="isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-600'">
                        +{{ extraCrew }}
                    </div>
                </div>
            </div>

            <!-- Arrive Button -->
            <div class="w-full">
                <button @click="simulateArrival"
                    class="w-full rounded-2xl h-14 flex items-center justify-center gap-3 relative overflow-hidden shadow-glow active:scale-[0.98] transition-transform">
                    <div class="absolute inset-0 bg-gradient-to-r from-purple-600 to-purple-500"></div>
                    <span class="relative material-icons text-2xl text-white">place</span>
                    <span class="relative text-lg font-black uppercase tracking-wide text-white">I've Arrived</span>
                </button>
                <p class="text-center text-xs mt-2" :class="isDark ? 'text-gray-500' : 'text-gray-400'">
                    Only tap when you're at the destination
                </p>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useJobStore } from '../stores/jobStore.js'
import { useUiStore } from '../stores/uiStore.js'
import { useFlowRouter } from '../composables/useFlowRouter.js'

const jobStore = useJobStore()
const uiStore = useUiStore()
const { advanceAndNavigate } = useFlowRouter()
const isDark = computed(() => uiStore.theme !== 'light')

// ── Timer ─────────────────────────────────────────────────────────
const startTime = ref(Date.now())
const elapsed = ref(0)
let timer = null

onMounted(() => {
    timer = setInterval(() => {
        elapsed.value = Math.floor((Date.now() - startTime.value) / 1000)
    }, 1000)
})

onUnmounted(() => {
    if (timer) clearInterval(timer)
})

const elapsedTime = computed(() => {
    const m = Math.floor(elapsed.value / 60)
    const s = elapsed.value % 60
    return `${m}:${s.toString().padStart(2, '0')}`
})

const eta = computed(() => {
    const now = new Date()
    now.setMinutes(now.getMinutes() + 45)
    return now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
})

// ── Addresses ─────────────────────────────────────────────────────
const fromAddress = computed(() => jobStore.jobData?.sourceLocation?.address || 'Source Address')
const toAddress = computed(() => jobStore.jobData?.destinationLocation?.address || 'Destination Address')

// ── Crew ──────────────────────────────────────────────────────────
const crew = computed(() => jobStore.jobData?.crewAssigned || [])
const crewCount = computed(() => crew.value.length)
const crewPreview = computed(() => crew.value.slice(0, 4))
const extraCrew = computed(() => Math.max(0, crew.value.length - 4))

// ── Actions ───────────────────────────────────────────────────────
function simulateArrival() {
    uiStore.showToast('Arrival confirmed! 📍 Starting unloading...', 'success', 2000)
    setTimeout(() => {
        advanceAndNavigate('ARRIVE_DEST', { arrivedAt: new Date().toISOString() })
    }, 500)
}
</script>
