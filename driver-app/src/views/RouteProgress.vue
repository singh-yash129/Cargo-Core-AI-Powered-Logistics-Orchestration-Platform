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
                    <h1 class="text-2xl font-black tracking-tight">Route Progress</h1>
                    <p class="text-xs" :class="isDark ? 'text-gray-400' : 'text-gray-500'">RT-2049-MAR06 · Live tracking
                    </p>
                </div>
            </div>
        </header>

        <!-- ── SCROLLABLE BODY ───────────────────────── -->
        <div class="screen-body px-5 py-4 flex flex-col gap-4">

            <!-- Overall Progress -->
            <div class="rounded-2xl p-5 border"
                :class="isDark ? 'bg-surface-dark/40 border-white/8' : 'bg-white border-gray-100 shadow-sm'">
                <div class="flex justify-between items-center mb-3">
                    <span class="text-xs font-bold uppercase tracking-widest"
                        :class="isDark ? 'text-gray-400' : 'text-gray-500'">Overall Progress</span>
                    <span class="text-2xl font-black text-primary">{{ progress }}%</span>
                </div>
                <div class="w-full rounded-full h-3 mb-3" :class="isDark ? 'bg-gray-800' : 'bg-gray-100'">
                    <div class="h-3 rounded-full bg-gradient-to-r from-primary to-accent-blue transition-all duration-700"
                        :style="`width: ${progress}%`"></div>
                </div>
                <div class="grid grid-cols-3 gap-3 text-center text-sm">
                    <div>
                        <p class="font-black text-primary">{{ completedStops }}</p>
                        <p class="text-xs" :class="isDark ? 'text-gray-500' : 'text-gray-400'">Stops done</p>
                    </div>
                    <div>
                        <p class="font-black">{{ totalStops - completedStops }}</p>
                        <p class="text-xs" :class="isDark ? 'text-gray-500' : 'text-gray-400'">Remaining</p>
                    </div>
                    <div>
                        <p class="font-black text-accent-gold">{{ estimatedDone }}</p>
                        <p class="text-xs" :class="isDark ? 'text-gray-500' : 'text-gray-400'">Est. done</p>
                    </div>
                </div>
            </div>

            <!-- Live Stats -->
            <div class="grid grid-cols-2 gap-4">
                <div v-for="stat in liveStats" :key="stat.label" class="rounded-2xl p-4 border"
                    :class="isDark ? 'bg-surface-dark/30 border-white/5' : 'bg-white border-gray-100 shadow-sm'">
                    <span class="material-icons mb-2" :class="stat.color">{{ stat.icon }}</span>
                    <p class="text-2xl font-black" :class="stat.color">{{ stat.value }}</p>
                    <p class="text-xs" :class="isDark ? 'text-gray-500' : 'text-gray-400'">{{ stat.label }}</p>
                </div>
            </div>

            <!-- Map Miniature -->
            <div class="h-48 rounded-2xl overflow-hidden border relative"
                :class="isDark ? 'border-white/5' : 'border-gray-100'">
                <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&q=80" alt="Route Map"
                    class="w-full h-full object-cover opacity-40 grayscale" />
                <div class="absolute inset-0 flex items-center justify-center flex-col gap-2">
                    <div class="w-3 h-3 rounded-full bg-primary shadow-[0_0_12px_rgba(28,231,131,0.8)] animate-pulse">
                    </div>
                </div>
                <div class="absolute bottom-3 left-3 right-3">
                    <button @click="$router.push('/navigation')"
                        class="w-full py-2.5 rounded-xl font-bold text-sm text-background-dark flex items-center justify-center gap-2"
                        style="background: rgba(28,231,131,0.9); backdrop-filter: blur(8px);">
                        <span class="material-icons text-sm">near_me</span>
                        Open Navigation
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useUiStore } from '../stores/uiStore.js'
import { useRouteStore } from '../stores/routeStore.js'

const uiStore = useUiStore()
const routeStore = useRouteStore()
const isDark = computed(() => uiStore.theme !== 'light')

const totalStops = 7
const completedStops = computed(() => routeStore.completedCount)
const progress = computed(() => Math.round((completedStops.value / totalStops) * 100))
const estimatedDone = '13:20'

const liveStats = [
    { label: 'Speed', icon: 'speed', value: '38 km/h', color: 'text-accent-blue' },
    { label: 'Distance Covered', icon: 'timeline', value: '18.4 km', color: 'text-primary' },
    { label: 'Time Elapsed', icon: 'schedule', value: '2h 14m', color: 'text-accent-gold' },
    { label: 'COD Collected', icon: 'payments', value: '₹450', color: 'text-primary' },
]
</script>
