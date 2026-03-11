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
                    <h1 class="text-2xl font-black tracking-tight">Delivery Execution</h1>
                    <p class="text-xs" :class="isDark ? 'text-gray-400' : 'text-gray-500'">Stop #1 · Active</p>
                </div>
            </div>
        </header>

        <!-- ── SCROLLABLE BODY ───────────────────────── -->
        <div class="screen-body px-5 py-4 flex flex-col gap-4">

            <!-- Status card -->
            <div class="rounded-2xl p-5 border"
                :class="isDark ? 'bg-primary/5 border-primary/20' : 'bg-primary/5 border-primary/20'">
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <p class="text-xs text-primary font-bold uppercase tracking-wide">In Progress</p>
                        <h2 class="text-xl font-black mt-1">Priya & Rohit Mehta</h2>
                        <p class="text-sm" :class="isDark ? 'text-gray-400' : 'text-gray-500'">14B, Andheri West, Near
                            JVLR</p>
                    </div>
                    <div class="text-xl font-black text-primary font-mono">{{ time }}</div>
                </div>
                <div class="grid grid-cols-3 gap-3 text-center text-sm">
                    <div class="rounded-xl p-2" :class="isDark ? 'bg-black/20' : 'bg-primary/5'">
                        <p class="font-black text-primary">5</p>
                        <p class="text-xs" :class="isDark ? 'text-gray-500' : 'text-gray-400'">Move Items</p>
                    </div>
                    <div class="rounded-xl p-2" :class="isDark ? 'bg-black/20' : 'bg-primary/5'">
                        <p class="font-black">3</p>
                        <p class="text-xs" :class="isDark ? 'text-gray-500' : 'text-gray-400'">Crew</p>
                    </div>
                    <div class="rounded-xl p-2" :class="isDark ? 'bg-black/20' : 'bg-primary/5'">
                        <p class="font-black text-accent-gold">3rd</p>
                        <p class="text-xs" :class="isDark ? 'text-gray-500' : 'text-gray-400'">Floor</p>
                    </div>
                </div>
            </div>

            <!-- Action buttons -->
            <div class="space-y-3">
                <button @click="$router.push('/service-checklist/' + stopId)"
                    class="w-full rounded-2xl h-14 flex items-center justify-center gap-2 font-bold border active:scale-[0.98] transition-all"
                    :class="isDark ? 'bg-surface-dark/30 border-white/5 text-white' : 'bg-white border-gray-200 text-gray-700 shadow-sm'">
                    <span class="material-icons">checklist</span>
                    Service Checklist
                </button>
                <button @click="$router.push('/pod/' + stopId)"
                    class="w-full rounded-2xl h-14 flex items-center justify-center gap-2 font-bold text-background-dark shadow-glow active:scale-[0.98] transition-all"
                    style="background: linear-gradient(135deg, #1CE783, #15b86a);">
                    <span class="material-icons">verified</span>
                    Complete Delivery (POD)
                </button>
                <button @click="$router.push('/damage-report')"
                    class="w-full rounded-2xl h-12 flex items-center justify-center gap-2 font-semibold border transition-all active:scale-[0.98] text-red-400"
                    :class="isDark ? 'border-red-500/20 bg-red-500/8' : 'border-red-100 bg-red-50'">
                    <span class="material-icons text-sm">report_problem</span>
                    Report Damage
                </button>
                <div class="pt-2 border-t mt-2" :class="isDark ? 'border-white/5' : 'border-gray-100'">
                    <button @click="$router.push('/exception/' + stopId)"
                        class="w-full rounded-2xl h-14 flex items-center justify-center gap-2 font-bold transition-all active:scale-[0.98] text-red-500 border"
                        :class="isDark ? 'border-red-500/30 bg-red-500/10 hover:bg-red-500/20' : 'border-red-200 bg-red-50 hover:bg-red-100'">
                        <span class="material-icons">cancel</span>
                        Report Delivery Exception
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useUiStore } from '../stores/uiStore.js'

const route = useRoute()
const uiStore = useUiStore()
const isDark = computed(() => uiStore.theme !== 'light')
const stopId = computed(() => route.params.id || 'STOP-001')

const time = ref('00:00')
let start = Date.now()
let timer = null

onMounted(() => {
    timer = setInterval(() => {
        const s = Math.floor((Date.now() - start) / 1000)
        const mm = Math.floor(s / 60)
        const ss = s % 60
        time.value = `${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`
    }, 1000)
})
onUnmounted(() => clearInterval(timer))
</script>
