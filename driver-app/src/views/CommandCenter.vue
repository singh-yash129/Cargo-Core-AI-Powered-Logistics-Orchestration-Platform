<template>
    <div class="screen-layout" :class="isDark ? 'bg-background-dark text-white' : 'bg-background-light text-gray-900'">

        <!-- ── HEADER ───────────────────────────────── -->
        <header class="flex-shrink-0 px-5 pt-5 pb-4 border-b" :class="isDark ? 'border-white/5' : 'border-gray-100'">
            <div class="flex items-center justify-between">
                <div>
                    <h1 class="text-4xl font-light tracking-tight">
                        {{ currentTime }}<span class="text-lg font-normal ml-1"
                            :class="isDark ? 'text-gray-400' : 'text-gray-500'">{{ period }}</span>
                    </h1>
                    <p class="text-xs font-medium uppercase tracking-wider"
                        :class="isDark ? 'text-gray-500' : 'text-gray-400'">{{ currentDate }}</p>
                </div>
                <div class="flex items-center gap-2">
                    <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold"
                        :class="isDark ? 'bg-surface-dark/50 border-white/5 text-primary' : 'bg-primary/10 border-primary/20 text-primary'">
                        <span class="relative w-2 h-2 flex">
                            <span
                                class="absolute inline-flex h-full w-full rounded-full bg-primary opacity-75 animate-ping"></span>
                            <span class="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                        </span>
                        GPS LIVE
                    </div>
                    <button @click="$router.push('/settings')"
                        class="w-10 h-10 rounded-full flex items-center justify-center border"
                        :class="isDark ? 'bg-surface-dark/50 border-white/5 text-gray-400' : 'bg-white border-gray-200 text-gray-500 shadow-sm'">
                        <span class="material-icons text-xl">person</span>
                    </button>
                </div>
            </div>
        </header>

        <!-- ── SCROLLABLE BODY ───────────────────────── -->
        <div class="screen-body flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">

            <!-- Ambient glow -->
            <div class="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
                <div class="w-80 h-80 rounded-full blur-[140px] opacity-20"
                    :class="isDark ? 'bg-primary/30' : 'bg-primary/10'"></div>
            </div>

            <!-- Driver Greeting Card -->
            <div class="rounded-3xl p-5 relative border"
                :class="isDark ? 'bg-surface-dark/40 border-white/8' : 'bg-white border-gray-100 shadow-sm'">
                <div class="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
                    <div class="absolute -top-12 -right-12 w-36 h-36 bg-primary/10 rounded-full blur-2xl">
                    </div>
                </div>
                <div class="flex items-center gap-3 mb-4">
                    <div class="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                        <span class="material-icons text-primary text-2xl">person</span>
                    </div>
                    <div>
                        <p class="text-xs uppercase tracking-wider font-semibold text-primary">Good {{ greeting }}</p>
                        <h2 class="text-xl font-bold">{{ driverStore.driverName }}</h2>
                    </div>
                    <div class="ml-auto text-right">
                        <p class="text-xs font-mono" :class="isDark ? 'text-gray-500' : 'text-gray-400'">{{
                            driverStore.driverId }}</p>
                        <div class="flex items-center gap-1 justify-end mt-0.5">
                            <span class="material-icons text-accent-gold text-xs">star</span>
                            <span class="text-sm font-bold">4.9</span>
                        </div>
                    </div>
                </div>
                <div class="grid grid-cols-4 gap-3">
                    <div v-for="stat in quickStats" :key="stat.label" class="flex flex-col items-center">
                        <span class="text-xl font-black" :class="stat.color">{{ stat.value }}</span>
                        <span class="text-[9px] uppercase font-medium mt-0.5"
                            :class="isDark ? 'text-gray-500' : 'text-gray-400'">{{ stat.label }}</span>
                    </div>
                </div>
            </div>

            <!-- Today's Manifest Card -->
            <div class="rounded-2xl p-5 border"
                :class="isDark ? 'bg-surface-dark/30 border-white/8' : 'bg-white border-gray-100 shadow-sm'">
                <div class="flex items-start justify-between mb-4">
                    <div>
                        <p class="text-xs uppercase tracking-widest font-semibold mb-0.5"
                            :class="isDark ? 'text-gray-400' : 'text-gray-500'">Today's Manifest</p>
                        <p class="text-xl font-bold">RT-2049-MAR06</p>
                        <p class="text-xs mt-0.5" :class="isDark ? 'text-gray-500' : 'text-gray-400'">Mumbai North-East
                            Hub · Shift A</p>
                    </div>
                    <div class="p-2 rounded-xl" :class="isDark ? 'bg-primary/10' : 'bg-primary/10'">
                        <span class="material-icons text-primary">local_shipping</span>
                    </div>
                </div>
                <div class="grid grid-cols-2 gap-3 mb-4">
                    <div v-for="m in manifestMetrics" :key="m.label" class="rounded-xl p-3.5 border"
                        :class="isDark ? 'bg-black/20 border-white/5' : 'bg-gray-50 border-gray-100'">
                        <div class="flex justify-between items-center mb-1">
                            <span class="text-[10px] uppercase font-semibold"
                                :class="isDark ? 'text-gray-400' : 'text-gray-500'">{{ m.label }}</span>
                            <span class="material-icons text-sm" :class="isDark ? 'text-gray-600' : 'text-gray-400'">{{
                                m.icon }}</span>
                        </div>
                        <div class="text-2xl font-black">{{ m.value }}</div>
                        <div class="text-[10px] mt-0.5"
                            :class="m.sub?.startsWith('On') ? 'text-primary' : isDark ? 'text-gray-500' : 'text-gray-400'">
                            {{ m.sub }}</div>
                    </div>
                </div>
                <!-- Map Preview -->
                <div class="h-24 rounded-xl overflow-hidden border relative"
                    :class="isDark ? 'border-white/5' : 'border-gray-100'">
                    <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&q=80" alt="Route Map"
                        class="w-full h-full object-cover opacity-50 grayscale" />
                    <div class="absolute inset-0 flex items-center px-4"
                        :class="isDark ? 'bg-gradient-to-r from-background-dark/90 to-transparent' : 'bg-gradient-to-r from-background-light/90 to-transparent'">
                        <div class="flex items-center gap-2">
                            <span class="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                            <span class="text-xs font-bold">Live Route · 47 km · 5h 20m</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Quick Actions -->
            <div class="grid grid-cols-4 gap-3">
                <button v-for="action in quickActions" :key="action.label" @click="$router.push(action.route)"
                    class="flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all active:scale-[0.97] group"
                    :class="isDark ? 'bg-surface-dark/30 border-white/5 hover:border-white/10' : 'bg-white border-gray-100 shadow-sm'">
                    <div class="w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform"
                        :class="action.bg">
                        <span class="material-icons text-lg" :class="action.color">{{ action.icon }}</span>
                    </div>
                    <span class="text-[9px] font-semibold uppercase tracking-wide"
                        :class="isDark ? 'text-gray-400' : 'text-gray-500'">{{ action.label }}</span>
                </button>
            </div>
        </div>

        <!-- ── STICKY FOOTER ────────────────────────── -->
        <div class="screen-footer border-t"
            :class="isDark ? 'border-white/5 bg-background-dark' : 'border-gray-100 bg-background-light'">
            <div class="px-5 pt-4 pb-4">
                <button @click="beginRoute"
                    class="w-full rounded-2xl overflow-hidden relative group active:scale-[0.98] transition-transform shadow-glow h-14 flex items-center justify-center gap-3">
                    <div class="absolute inset-0 bg-gradient-to-r from-primary to-primary-dark"></div>
                    <span class="relative material-icons text-2xl text-background-dark">play_arrow</span>
                    <span class="relative text-xl font-black uppercase tracking-wide text-background-dark">Begin
                        Route</span>
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useDriverStore } from '../stores/driverStore.js'
import { useUiStore } from '../stores/uiStore.js'
import { useRouteStore } from '../stores/routeStore.js'
import { dummyManifest } from '../utils/dummyData.js'

const router = useRouter()
const driverStore = useDriverStore()
const uiStore = useUiStore()
const routeStore = useRouteStore()
const isDark = computed(() => uiStore.theme !== 'light')

const currentTime = ref('')
const period = ref('')
const currentDate = ref('')
const greeting = computed(() => {
    const h = new Date().getHours()
    return h < 12 ? 'Morning' : h < 17 ? 'Afternoon' : 'Evening'
})

onMounted(() => {
    updateTime()
    setInterval(updateTime, 30000)
    routeStore.loadManifest(dummyManifest)
})

function updateTime() {
    const now = new Date()
    const h = now.getHours()
    period.value = h >= 12 ? 'PM' : 'AM'
    currentTime.value = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false })
    currentDate.value = now.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })
}

const quickStats = [
    { label: 'Stops', value: '7', color: '' },
    { label: 'Rating', value: '4.9★', color: 'text-accent-gold' },
    { label: 'On-Time', value: '96%', color: 'text-primary' },
    { label: '₹ Today', value: '1.8K', color: 'text-primary' },
]
const manifestMetrics = [
    { label: 'Stops', icon: 'place', value: '7', sub: 'On Schedule' },
    { label: 'Est. Time', icon: 'schedule', value: '5h 20m', sub: 'Ends 1:20 PM' },
    { label: 'Distance', icon: 'timeline', value: '47 km', sub: 'Total Route' },
    { label: 'Crew', icon: 'group', value: '3', sub: 'Assigned' },
]
const quickActions = [
    { label: 'Crew', icon: 'group', route: '/crew', bg: 'bg-accent-blue/15', color: 'text-accent-blue' },
    { label: 'Wallet', icon: 'payments', route: '/wallet', bg: 'bg-primary/15', color: 'text-primary' },
    { label: 'AI', icon: 'smart_toy', route: '/voice', bg: 'bg-accent-purple/15', color: 'text-accent-purple' },
    { label: 'Crisis', icon: 'emergency', route: '/crisis', bg: 'bg-red-500/15', color: 'text-red-400' },
]
function beginRoute() { router.push('/manifest') }
</script>
