<template>
    <div class="screen-layout" :class="isDark ? 'bg-background-dark text-white' : 'bg-background-light text-gray-900'">

        <!-- ── HEADER ───────────────────────────────── -->
        <header class="flex-shrink-0 px-5 pt-5 pb-4 border-b" :class="isDark ? 'border-white/5' : 'border-gray-100'">
            <p class="text-xs font-bold uppercase tracking-wider text-primary mb-0.5">Shift Complete</p>
            <h1 class="text-3xl font-black tracking-tight">Summary</h1>
            <p class="text-sm" :class="isDark ? 'text-gray-400' : 'text-gray-500'">{{ routeLabel }}</p>
        </header>

        <!-- ── SCROLLABLE BODY ───────────────────────── -->
        <div class="screen-body px-6 py-6 flex flex-col gap-5">

            <!-- Score Hero -->
            <div class="rounded-3xl py-12 px-8 text-center"
                :style="isDark
                    ? 'background: linear-gradient(135deg, rgba(28,231,131,0.2), rgba(28,231,131,0.05)); border: 1px solid rgba(28,231,131,0.2);'
                    : 'background: linear-gradient(135deg, rgba(28,231,131,0.12), rgba(28,231,131,0.03)); border: 1px solid rgba(28,231,131,0.2);'">
                <div
                    class="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl pointer-events-none">
                </div>
              <p class="text-sm font-bold uppercase tracking-widest text-primary mb-2">Shift Score</p>
                <div class="text-7xl font-black mb-1"
                    style="background: linear-gradient(135deg, #1CE783, #44a8e9); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">
                    98</div>
                <div class="flex items-center justify-center gap-1 mb-2">
                    <span v-for="i in 5" :key="i" class="material-icons text-accent-gold text-lg">{{ i <= 4 ? 'star'
                        : 'star_half' }}</span>
                </div>
                <p class="text-sm font-bold text-primary">Excellent Performance 🏆</p>
            </div>

            <!-- Stats Grid -->
            <div class="grid grid-cols-2 gap-3">
                <div v-for="stat in summaryStats" :key="stat.label" class="rounded-2xl p-5 border"
                    :class="isDark ? 'bg-surface-dark/30 border-white/5' : 'bg-white border-gray-100 shadow-sm'">
                    <div class="flex items-center justify-between mb-1">
                        <span class="text-xs uppercase font-semibold"
                            :class="isDark ? 'text-gray-400' : 'text-gray-500'">{{ stat.label }}</span>
                        <span class="material-icons text-sm" :class="stat.color">{{ stat.icon }}</span>
                    </div>
                    <p class="text-2xl font-black" :class="stat.color">{{ stat.value }}</p>
                    <p class="text-[10px] mt-0.5" :class="isDark ? 'text-gray-500' : 'text-gray-400'">{{ stat.sub }}</p>
                </div>
            </div>

            <!-- Today's Earnings -->
            <div class="rounded-2xl border p-5"
                :class="isDark ? 'bg-surface-dark/30 border-white/5' : 'bg-white border-gray-100 shadow-sm'">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="font-bold">Today's Earnings</h3>
                    <span class="text-2xl font-black text-primary">₹1,840</span>
                </div>
                <div class="space-y-2">
                    <div v-for="row in earningRows" :key="row.label" class="flex justify-between text-sm">
                        <span :class="isDark ? 'text-gray-400' : 'text-gray-500'">{{ row.label }}</span>
                        <span class="font-semibold">₹{{ row.value }}</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- ── STICKY FOOTER ────────────────────────── -->
        <div class="screen-footer px-5 py-4 border-t flex flex-col gap-2"
            :class="isDark ? 'border-white/5 bg-background-dark' : 'border-gray-100 bg-background-light'">
            <button v-if="driverStore.vehicleId" @click="$router.push('/vehicle-return')"
                class="w-full rounded-2xl h-14 flex items-center justify-center gap-2 font-bold text-background-dark shadow-glow transition-all active:scale-[0.98]"
                style="background: linear-gradient(135deg, #1CE783, #15b86a);">
                <span class="material-icons">local_shipping</span>
                Return Vehicle
            </button>
            <button v-else @click="endShift"
                class="w-full rounded-2xl h-14 flex items-center justify-center gap-2 font-bold text-background-dark shadow-glow transition-all active:scale-[0.98]"
                style="background: linear-gradient(135deg, #1CE783, #15b86a);">
                <span class="material-icons">logout</span>
                End Shift & Sign Out
            </button>
            <button @click="$router.push('/audit')"
                class="w-full rounded-2xl h-12 flex items-center justify-center gap-2 font-semibold border transition-all active:scale-[0.98]"
                :class="isDark ? 'bg-surface-dark/30 border-white/5 text-white hover:bg-surface-dark' : 'bg-white border-gray-200 text-gray-700 shadow-sm hover:bg-gray-50'">
                <span class="material-icons">history</span>
                View Audit Log
            </button>
        </div>
    </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUiStore } from '../stores/uiStore.js'
import { useDriverStore } from '../stores/driverStore.js'
import * as api from '../services/api.js'

const router = useRouter()
const uiStore = useUiStore()
const driverStore = useDriverStore()
const isDark = computed(() => uiStore.theme !== 'light')
const dashboard = computed(() => driverStore.dashboard)

onMounted(() => {
    driverStore.refreshDashboard()
})

async function endShift() {
    try {
        await api.endShift()
    } catch (err) {
        console.error('Failed to end shift on backend:', err)
        // Allow logout to proceed anyway
    }
    driverStore.logout()
    uiStore.showToast('Shift ended. See you tomorrow!', 'success')
    router.replace('/login')
}

const routeLabel = computed(() => {
    const manifest = dashboard.value?.manifest
    if (!manifest) return 'No active manifest'
    return `${manifest.route_id || 'Route'} · ${manifest.date || ''}`
})

const summaryStats = computed(() => {
    const manifest = dashboard.value?.manifest || {}
    const telemetry = dashboard.value?.telemetry || {}
    const profile = driverStore.driver || {}
    return [
        {
            label: 'Stops Done',
            icon: 'place',
            value: `${manifest.completed_stops ?? 0}/${manifest.total_stops ?? 0}`,
            sub: `${manifest.total_stops ? Math.round(((manifest.completed_stops || 0) / manifest.total_stops) * 100) : 0}% complete`,
            color: 'text-primary'
        },
        {
            label: 'On-Time',
            icon: 'schedule',
            value: `${profile.onTimePercent ?? 0}%`,
            sub: 'Driver completion rate',
            color: 'text-primary'
        },
        {
            label: 'COD Collected',
            icon: 'payments',
            value: '₹0',
            sub: 'Captured in route ledger',
            color: 'text-accent-gold'
        },
        {
            label: 'Distance',
            icon: 'timeline',
            value: `${manifest.total_distance_km ?? 0} km`,
            sub: 'Shift total',
            color: 'text-accent-blue'
        },
        {
            label: 'Fuel Level',
            icon: 'local_gas_station',
            value: telemetry.fuel_level_pct != null ? `${telemetry.fuel_level_pct}%` : '—',
            sub: 'Vehicle telemetry',
            color: 'text-signal-amber'
        },
        {
            label: 'HOS Left',
            icon: 'local_fire_department',
            value: dashboard.value?.hos?.remaining_label || '0h 00m',
            sub: 'Remaining drive window',
            color: 'text-red-400'
        },
    ]
})

const earningRows = [
    { label: 'Base Shift Pay', value: 1200 },
    { label: 'Delivery Bonus (7 stops)', value: 350 },
    { label: 'House Move Premium', value: 200 },
    { label: 'Tips', value: 90 },
]
</script>
