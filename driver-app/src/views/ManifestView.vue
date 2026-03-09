<template>
    <div class="screen-layout" :class="isDark ? 'bg-background-dark text-white' : 'bg-background-light text-gray-900'">

        <!-- ── HEADER (fixed) ───────────────────────── -->
        <header class="flex-shrink-0 px-5 pt-5 pb-2 border-b" :class="isDark ? 'border-white/5' : 'border-gray-100'">
            <div class="flex items-center justify-between mb-3">
                <div>
                    <p class="text-xs font-bold uppercase tracking-wider text-primary mb-0.5">{{ manifest.date }}</p>
                    <h1 class="text-2xl font-black tracking-tight">Route Manifest</h1>
                </div>
                <div class="text-right">
                    <div class="text-3xl font-black">{{ completedCount }}<span class="text-base font-normal ml-1"
                            :class="isDark ? 'text-gray-500' : 'text-gray-400'">/{{ stops.length }}</span></div>
                    <p class="text-[10px] uppercase" :class="isDark ? 'text-gray-400' : 'text-gray-500'">Stops Done</p>
                </div>
            </div>

            <!-- Summary pills -->
            <div class="grid grid-cols-3 gap-2 pb-3">
                <div v-for="s in summaryStats" :key="s.label" class="rounded-xl p-2.5 flex flex-col items-center border"
                    :class="isDark ? 'bg-surface-dark/40 border-white/5' : 'bg-white border-gray-100 shadow-sm'">
                    <span class="text-lg font-black">{{ s.value }}</span>
                    <span class="text-[9px] uppercase tracking-wider"
                        :class="isDark ? 'text-gray-400' : 'text-gray-500'">{{ s.label }}</span>
                </div>
            </div>
        </header>

        <!-- ── SCROLLABLE BODY ───────────────────────── -->
        <div class="screen-body px-5 py-6">
            <!-- Timeline Track Container -->
            <div class="relative pl-8 border-l-[3px] ml-[1.125rem] pb-8"
                :class="isDark ? 'border-primary/20' : 'border-primary/30'">

                <!-- Current location -->
                <div class="relative mb-8">
                    <!-- Absolute Indicator centered on border -->
                    <div class="absolute top-1/2 -mt-1.5 -left-[2.1rem] -translate-x-1/2 w-3 h-3 rounded-full bg-primary shadow-[0_0_10px_rgba(28,231,131,0.6)] animate-pulse ring-4"
                        :class="isDark ? 'ring-background-dark' : 'ring-background-light'">
                    </div>

                    <div class="p-3 rounded-xl border flex items-center justify-between"
                        :class="isDark ? 'bg-primary/10 border-primary/20' : 'bg-primary/10 border-primary/30'">
                        <div>
                            <p class="text-xs font-bold text-primary uppercase tracking-wide">You are here</p>
                            <p class="text-sm font-medium">North-East Hub · Gate 7</p>
                        </div>
                        <span class="material-icons text-primary">navigation</span>
                    </div>
                </div>

                <!-- Stop cards -->
                <div v-for="(stop, idx) in stops" :key="stop.id" class="relative mb-5">
                    <!-- Absolute Stop Indicator centered on border -->
                    <div class="absolute top-6 -mt-4 -left-[2.1rem] -translate-x-1/2 flex items-center justify-center font-bold z-10 w-9 h-9 rounded-full border-[1.5px] text-sm ring-[6px]"
                        :class="[
                            isDark ? 'ring-background-dark' : 'ring-background-light',
                            stop.type === 'express' ? isDark ? 'bg-card-dark border-accent-gold text-accent-gold' : 'bg-amber-50 border-accent-gold text-accent-gold'
                                : stop.type === 'move' ? isDark ? 'bg-card-dark border-accent-purple text-accent-purple' : 'bg-purple-50 border-accent-purple text-accent-purple'
                                    : stop.type === 'pickup' ? isDark ? 'bg-card-dark border-orange-500 text-orange-400' : 'bg-orange-50 border-orange-400 text-orange-500'
                                        : isDark ? 'bg-card-dark border-gray-700 text-gray-400' : 'bg-gray-50 border-gray-300 text-gray-500'
                        ]">
                        {{ String(stop.stopNumber).padStart(2, '0') }}
                    </div>

                    <!-- Card -->
                    <div @click="$router.push(`/stop/${stop.id}`)"
                        class="rounded-2xl p-4 cursor-pointer transition-all active:scale-[0.98] border"
                        :class="stop.type === 'express'
                            ? isDark ? 'bg-card-dark border-l-4 border-accent-gold' : 'bg-white border-l-4 border-accent-gold shadow-sm'
                            : isDark ? 'bg-card-dark border-gray-800 hover:border-gray-700' : 'bg-white border-gray-100 shadow-sm hover:border-gray-200'">

                        <div class="flex justify-between items-start mb-2">
                            <span
                                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border"
                                :class="typeBadgeClass(stop.type)">{{ stop.type }}</span>
                            <div class="flex items-center gap-1.5">
                                <span v-if="stop.cod"
                                    class="text-[10px] font-bold text-signal-amber bg-signal-amber/10 border border-signal-amber/20 px-2 py-0.5 rounded-full">COD
                                    ₹{{ stop.codAmount }}</span>
                            </div>
                        </div>

                        <h3 class="text-base font-bold mb-0.5">{{ stop.customerName }}</h3>
                        <p class="text-xs mb-3" :class="isDark ? 'text-gray-400' : 'text-gray-500'">{{ stop.address }}
                        </p>

                        <div class="flex items-center justify-between pt-3 border-t"
                            :class="isDark ? 'border-gray-700/50' : 'border-gray-100'">
                            <div class="flex items-center gap-3 text-xs"
                                :class="isDark ? 'text-gray-400' : 'text-gray-500'">
                                <span class="flex items-center gap-1"><span
                                        class="material-icons text-xs">schedule</span>{{
                                            stop.timeWindow }}</span>
                                <span class="flex items-center gap-1"><span
                                        class="material-icons text-xs">straighten</span>{{ stop.distance }}</span>
                            </div>
                            <button v-if="idx === 0" @click.stop="$router.push('/navigation')"
                                class="bg-primary text-background-dark text-xs font-black py-1.5 px-4 rounded-lg flex items-center gap-1 active:scale-95 z-20 relative">
                                Go <span class="material-icons text-sm">arrow_forward</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- ── STICKY FOOTER ────────────────────────── -->
        <div class="screen-footer border-t"
            :class="isDark ? 'border-white/5 bg-background-dark' : 'border-gray-100 bg-background-light'">
            <div class="flex gap-3 px-5 py-4">
                <button @click="$router.push('/route-progress')"
                    class="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl border font-semibold text-sm active:scale-[0.97]"
                    :class="isDark ? 'bg-surface-dark/50 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-700 shadow-sm'">
                    <span class="material-icons">map</span>
                    Map
                </button>
                <button @click="startRoute"
                    class="flex-[2] flex items-center justify-center gap-2 py-3.5 rounded-xl font-black text-background-dark shadow-glow active:scale-[0.97]"
                    style="background: linear-gradient(135deg, #1CE783, #15b86a);">
                    <span class="material-icons">near_me</span>
                    Start Route
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUiStore } from '../stores/uiStore.js'
import { useRouteStore } from '../stores/routeStore.js'
import { dummyManifest, dummyStops } from '../utils/dummyData.js'

const router = useRouter()
const uiStore = useUiStore()
const routeStore = useRouteStore()
const isDark = computed(() => uiStore.theme !== 'light')

const manifest = ref(dummyManifest)
const stops = ref(dummyStops)
const completedCount = computed(() => routeStore.completedCount)

const summaryStats = computed(() => [
    { label: 'Stops', value: stops.value.length },
    { label: 'Distance', value: '47 km' },
    { label: 'Est. Done', value: '13:20' },
])

function typeBadgeClass(type) {
    const map = {
        express: 'bg-accent-gold/10 text-accent-gold border-accent-gold/20',
        move: 'bg-accent-purple/10 text-accent-purple border-accent-purple/20',
        pickup: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
        parcel: 'bg-accent-blue/10 text-accent-blue border-accent-blue/20',
    }
    return map[type] || 'bg-gray-500/10 text-gray-400 border-gray-500/20'
}

function startRoute() {
    routeStore.startRoute()
    router.push('/gate-exit')
}
</script>
