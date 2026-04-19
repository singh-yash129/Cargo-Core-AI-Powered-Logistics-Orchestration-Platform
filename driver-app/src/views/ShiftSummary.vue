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
                    {{ shiftScore }}</div>
                <div class="flex items-center justify-center gap-1 mb-2">
                    <span v-for="i in 5" :key="i" class="material-icons text-accent-gold text-lg">
                        {{ i <= starRating ? 'star' : (i - 0.5 <= starRating ? 'star_half' : 'star_border') }}
                    </span>
                </div>
                <p class="text-sm font-bold text-primary">{{ performanceLabel }}</p>
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

            <!-- Completed Orders -->
            <div class="rounded-2xl border p-5"
                :class="isDark ? 'bg-surface-dark/30 border-white/5' : 'bg-white border-gray-100 shadow-sm'">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="font-bold">Completed Orders</h3>
                    <span class="text-xs px-2 py-1 rounded-full bg-primary/15 text-primary font-semibold">
                        {{ completedOrders.length }} orders
                    </span>
                </div>
                <div v-if="completedOrders.length === 0" class="text-center py-4">
                    <span class="material-icons text-3xl" :class="isDark ? 'text-gray-600' : 'text-gray-300'">receipt_long</span>
                    <p class="text-sm mt-2" :class="isDark ? 'text-gray-500' : 'text-gray-400'">No completed orders found</p>
                </div>
                <div v-else class="space-y-3">
                    <div v-for="order in completedOrders" :key="order.id"
                        class="flex items-start gap-3 pb-3 border-b last:border-b-0 last:pb-0"
                        :class="isDark ? 'border-white/5' : 'border-gray-100'">
                        <div class="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span class="material-icons text-primary text-sm">check_circle</span>
                        </div>
                        <div class="flex-1 min-w-0">
                            <p class="text-sm font-semibold truncate">{{ order.tracking_code || order.id }}</p>
                            <p class="text-xs truncate" :class="isDark ? 'text-gray-400' : 'text-gray-500'">
                                {{ order.customer_name || 'Customer' }}
                            </p>
                            <p class="text-xs truncate" :class="isDark ? 'text-gray-500' : 'text-gray-400'">
                                {{ order.delivery_addr || order.destination_addr || '—' }}
                            </p>
                        </div>
                        <span class="text-xs font-semibold text-primary flex-shrink-0">Done</span>
                    </div>
                </div>
            </div>

            <!-- Today's Earnings -->
            <div class="rounded-2xl border p-5"
                :class="isDark ? 'bg-surface-dark/30 border-white/5' : 'bg-white border-gray-100 shadow-sm'">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="font-bold">Today's Earnings</h3>
                    <span class="text-2xl font-black text-primary">₹{{ todayTotal.toLocaleString('en-IN') }}</span>
                </div>
                <div class="space-y-2">
                    <div v-for="row in earningRows" :key="row.label" class="flex justify-between text-sm">
                        <span :class="isDark ? 'text-gray-400' : 'text-gray-500'">{{ row.label }}</span>
                        <span class="font-semibold">₹{{ row.value.toLocaleString('en-IN') }}</span>
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
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUiStore } from '../stores/uiStore.js'
import { useDriverStore } from '../stores/driverStore.js'
import { useJobStore } from '../stores/jobStore.js'
import * as api from '../services/api.js'

const router = useRouter()
const uiStore = useUiStore()
const driverStore = useDriverStore()
const jobStore = useJobStore()
const isDark = computed(() => uiStore.theme !== 'light')
const dashboard = computed(() => driverStore.dashboard)
// jobStore is reset before ShiftSummary opens; use the type saved before reset as fallback
const jobType = computed(() =>
    jobStore.jobType
    || driverStore.lastJobType
    || driverStore.dashboard?.current_job?.jobType
    || 'PARCEL_DELIVERY'
)
const isHouseShift = computed(() => jobType.value === 'HOUSE_SHIFT')
const isDelivery = computed(() => jobType.value === 'PARCEL_DELIVERY')

const completedOrders = ref([])

onMounted(async () => {
    driverStore.refreshDashboard()
    try {
        const orders = await api.getCompletedOrders()
        completedOrders.value = Array.isArray(orders) ? orders : []
    } catch {
        completedOrders.value = []
    }
})

async function endShift() {
    try {
        await api.endShift()
        driverStore.logout()
        uiStore.showToast('Shift ended. See you tomorrow!', 'success')
        router.replace('/login')
    } catch (err) {
        console.error('Failed to end shift on backend:', err)
        uiStore.showToast('Could not end shift — check your connection and try again.', 'error')
    }
}

const routeLabel = computed(() => {
    const manifest = dashboard.value?.manifest
    if (!manifest) return 'No active manifest'
    return `${manifest.route_id || 'Route'} · ${manifest.date || ''}`
})

const earnings = computed(() => driverStore.dashboard?.earnings || {})

const shiftScore = computed(() => {
    if (earnings.value.shift_score) return earnings.value.shift_score
    const rating = driverStore.driver?.rating || 0
    return rating ? Math.round(rating * 20) : 0
})

// Derive star rating (0–5) from shift score (0–100)
const starRating = computed(() => Math.round((shiftScore.value / 100) * 5 * 2) / 2)

const performanceLabel = computed(() => {
    const s = shiftScore.value
    if (s >= 90) return 'Excellent Performance 🏆'
    if (s >= 75) return 'Great Work 👍'
    if (s >= 60) return 'Good Job'
    return 'Keep Improving'
})

const summaryStats = computed(() => {
    const manifest = dashboard.value?.manifest || {}
    const telemetry = dashboard.value?.telemetry || {}
    const profile = driverStore.driver || {}

    if (isHouseShift.value) {
        // For house shifts: use manifest distance only if it's not the 8.5 parcel default
        const houseDistKm = (manifest.total_distance_km && manifest.total_distance_km !== 8.5)
            ? manifest.total_distance_km
            : 24
        return [
            {
                label: 'Crew',
                icon: 'groups',
                value: String(manifest.crew_count ?? 0),
                sub: 'Members on shift',
                color: 'text-purple-400'
            },
            {
                label: 'Items Moved',
                icon: 'inventory',
                value: String(manifest.completed_stops ?? 0),
                sub: 'Inventory handled',
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
                label: 'Distance',
                icon: 'timeline',
                value: `${houseDistKm} km`,
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
                label: 'Safety Score',
                icon: 'verified_user',
                value: `${earnings.value.safety_score ?? profile.safetyScore ?? 0}`,
                sub: 'Driver safety rating',
                color: 'text-accent-blue'
            },
        ]
    }

    // Parcel delivery / pickup
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
        ...(isDelivery.value ? [{
            label: 'COD Collected',
            icon: 'payments',
            value: `₹${(manifest.cod_collected ?? 0).toLocaleString('en-IN')}`,
            sub: 'Captured in route ledger',
            color: 'text-accent-gold'
        }] : [{
            label: 'Pickups Done',
            icon: 'assignment_return',
            value: String(manifest.completed_stops ?? 0),
            sub: 'Items scanned & loaded',
            color: 'text-accent-blue'
        }]),
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

const todayTotal = computed(() => {
    const e = earnings.value
    return (e.today_base || 0) + (e.today_deliveries || 0) + (e.today_move || 0) + (e.today_tips || 0)
})

const earningRows = computed(() => {
    const e = earnings.value
    const rows = [
        { label: 'Base Shift Pay', value: e.today_base || 0 },
        { label: 'Delivery Bonus', value: e.today_deliveries || 0 },
    ]
    if (isHouseShift.value) {
        rows.push({ label: 'House Move Premium', value: e.today_move || 0 })
    }
    rows.push({ label: 'Tips', value: e.today_tips || 0 })
    return rows
})
</script>
