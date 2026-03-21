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

            <!-- Active Job Card (New - Shows Job Type & State) -->
            <div v-if="jobStore.jobType" class="rounded-3xl p-6 relative border"
                :class="isDark ? 'bg-surface-dark/60 border-white/10' : 'bg-white border-gray-100 shadow-xl'">
                <!-- Multiple Background Glows (contained in their own overflow-hidden layer) -->
                <div class="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
                    <div class="absolute top-0 right-0 w-40 h-40 blur-3xl opacity-30"
                        :class="jobStore.jobType === 'PARCEL_DELIVERY' ? 'bg-green-500' : jobStore.jobType === 'PARCEL_PICKUP' ? 'bg-blue-500' : 'bg-purple-500'">
                    </div>
                    <div class="absolute bottom-0 left-0 w-32 h-32 blur-3xl opacity-20 bg-primary"></div>
                </div>

                <div class="relative">
                    <!-- Header Section -->
                    <div class="flex items-start justify-between gap-3 mb-4">

                        <!-- Icon Badge -->
                        <div class="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ring-2 ring-offset-2"
                            :class="[
                                jobStore.jobType === 'PARCEL_DELIVERY'
                                    ? 'bg-green-500/15 ring-green-500/30 ring-offset-transparent'
                                    : jobStore.jobType === 'PARCEL_PICKUP'
                                    ? 'bg-blue-500/15 ring-blue-500/30 ring-offset-transparent'
                                    : 'bg-purple-500/15 ring-purple-500/30 ring-offset-transparent'
                            ]">
                            <span class="material-icons text-2xl leading-none"
                                :class="jobStore.jobType === 'PARCEL_DELIVERY' ? 'text-green-400' : jobStore.jobType === 'PARCEL_PICKUP' ? 'text-blue-400' : 'text-purple-400'">
                                {{ jobStore.jobType === 'HOUSE_SHIFT' ? 'moving' : jobStore.jobType === 'PARCEL_PICKUP' ? 'assignment_return' : 'local_shipping' }}
                            </span>
                        </div>

                        <!-- Text Block -->
                        <div class="flex-1 min-w-0">
                            <!-- Job ID as Hero -->
                            <p class="text-xl font-black tracking-tight leading-tight truncate">
                                {{ jobStore.jobData.manifestId || jobStore.jobData.jobId }}
                            </p>
                            <!-- Subtitle: job type label -->
                            <p class="text-xs font-semibold mt-0.5 truncate"
                                :class="jobStore.jobType === 'PARCEL_DELIVERY' ? 'text-green-400' : jobStore.jobType === 'PARCEL_PICKUP' ? 'text-blue-400' : 'text-purple-400'">
                                {{ jobStore.jobTypeLabel }}
                            </p>
                        </div>

                        <!-- State Badge (top-right) -->
                        <div class="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border shrink-0 self-start mt-0.5"
                            :class="isDark ? 'bg-primary/10 text-primary border-primary/20' : 'bg-primary/15 text-primary border-primary/30'">
                            {{ jobStore.stateLabel }}
                        </div>
                    </div>

                    <!-- Divider -->
                    <div class="h-px mb-4" :class="isDark ? 'bg-white/5' : 'bg-gray-100'"></div>

                    <!-- Metadata Row -->
                    <div class="flex items-center gap-2 flex-wrap">
                        <div class="flex items-center gap-1 text-xs font-medium"
                            :class="isDark ? 'text-gray-400' : 'text-gray-500'">
                            <span class="material-icons leading-none" style="font-size:13px;">directions_car</span>
                            {{ jobStore.jobData.vehicleId }}
                        </div>
                        <span class="w-1 h-1 rounded-full" :class="isDark ? 'bg-gray-600' : 'bg-gray-300'"></span>
                        <div class="flex items-center gap-1 text-xs font-medium"
                            :class="isDark ? 'text-gray-400' : 'text-gray-500'">
                            <span class="material-icons leading-none" style="font-size:13px;">schedule</span>
                            Started {{ new Date(jobStore.jobData.assignedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) }}
                        </div>
                    </div>

                    <!-- Progress Bar (for Delivery/Pickup only) -->
                    <div v-if="jobStore.jobType !== 'HOUSE_SHIFT' && jobStore.totalStops > 0"
                        class="mt-5 p-4 rounded-2xl"
                        :class="isDark ? 'bg-black/30 border border-white/5' : 'bg-gray-50 border border-gray-100'">
                        <div class="flex items-center justify-between mb-3">
                            <span class="text-xs font-black uppercase tracking-widest"
                                :class="isDark ? 'text-gray-400' : 'text-gray-500'">Route Progress</span>
                            <span class="text-lg font-black text-primary">{{ jobStore.completedStopsCount }} / {{
                                jobStore.totalStops }}</span>
                        </div>
                        <div class="w-full h-2.5 rounded-full overflow-hidden"
                            :class="isDark ? 'bg-gray-800' : 'bg-gray-200'">
                            <div class="h-full rounded-full bg-gradient-to-r from-primary to-primary-dark transition-all duration-500"
                                :style="`width: ${jobStore.progressPercent}%`"></div>
                        </div>
                        <div class="flex items-center justify-between mt-2">
                            <span class="text-[10px] font-semibold" :class="isDark ? 'text-gray-500' : 'text-gray-400'">
                                {{ Math.round(jobStore.progressPercent) }}% Complete
                            </span>
                            <span class="text-[10px] font-semibold" :class="isDark ? 'text-gray-500' : 'text-gray-400'">
                                {{ jobStore.totalStops - jobStore.completedStopsCount }} Remaining
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- No Job Assigned State -->
            <div v-else
                class="rounded-3xl p-8 border text-center relative flex flex-col items-center justify-center"
                :class="isDark ? 'bg-surface-dark/40 border-white/8' : 'bg-white border-gray-100 shadow-lg'">
                <!-- Decorative background (contained in own overflow-hidden layer) -->
                <div class="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
                    <div class="absolute inset-0 opacity-5">
                        <div class="absolute top-0 left-0 w-full h-full"
                            style="background-image: radial-gradient(circle, currentColor 1px, transparent 1px); background-size: 20px 20px;">
                        </div>
                    </div>
                    <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full blur-3xl opacity-20 bg-primary animate-pulse"></div>
                </div>

                <div class="relative">
                    <!-- Icon -->
                    <div class="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4 relative"
                        :class="isDark ? 'bg-gradient-to-br from-gray-800 to-gray-900 border border-white/5' : 'bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-200'">
                        <span class="material-icons text-3xl leading-none"
                            :class="isDark ? 'text-gray-500' : 'text-gray-400'">assignment</span>
                        <div class="absolute -top-1.5 -right-1.5 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center border-2"
                            :class="isDark ? 'border-background-dark' : 'border-background-light'">
                            <span class="material-icons text-white leading-none" style="font-size:10px;">schedule</span>
                        </div>
                    </div>

                    <!-- Text -->
                    <h3 class="font-black text-xl mb-1.5">No Active Job</h3>
                    <p class="text-xs mb-4 max-w-[220px] mx-auto leading-relaxed"
                        :class="isDark ? 'text-gray-400' : 'text-gray-500'">
                        Waiting for job assignment from dispatch
                    </p>

                    <!-- Demo Mode Hint -->
                    <div class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold"
                        :class="isDark ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-primary/10 border-primary/30 text-primary'">
                        <span class="material-icons leading-none" style="font-size:14px;">science</span>
                        Use demo mode to test flows
                    </div>
                </div>
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

            <!-- Today's Manifest Card (Delivery/Pickup only) -->
            <div v-if="jobStore.jobType !== 'HOUSE_SHIFT'" class="rounded-2xl p-5 border"
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

            <!-- House Shift Summary Card (House Shift only) -->
            <div v-else-if="jobStore.jobType === 'HOUSE_SHIFT'" class="rounded-2xl p-5 border"
                :class="isDark ? 'bg-surface-dark/30 border-white/8' : 'bg-white border-gray-100 shadow-sm'">
                <div class="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
                    <div class="absolute top-0 right-0 w-36 h-36 rounded-full blur-3xl opacity-20 bg-purple-500"></div>
                </div>
                <div class="relative">
                    <div class="flex items-start justify-between mb-4">
                        <div>
                            <p class="text-xs uppercase tracking-widest font-semibold mb-0.5 text-purple-400">House Shift</p>
                            <p class="text-xl font-bold">{{ jobStore.jobData?.jobId }}</p>
                            <p class="text-xs mt-0.5" :class="isDark ? 'text-gray-500' : 'text-gray-400'">
                                {{ jobStore.jobData?.sourceLocation?.address?.split(',').slice(0, 2).join(',') }}
                            </p>
                        </div>
                        <div class="p-2 rounded-xl bg-purple-500/15">
                            <span class="material-icons text-purple-400">moving</span>
                        </div>
                    </div>
                    <div class="grid grid-cols-3 gap-3 mb-4">
                        <div class="rounded-xl p-3 border text-center"
                            :class="isDark ? 'bg-black/20 border-white/5' : 'bg-gray-50 border-gray-100'">
                            <span class="material-icons text-purple-400 text-base">groups</span>
                            <p class="text-lg font-black mt-1">{{ jobStore.jobData?.crewAssigned?.length || 0 }}</p>
                            <p class="text-[9px] uppercase font-bold" :class="isDark ? 'text-gray-500' : 'text-gray-400'">Crew</p>
                        </div>
                        <div class="rounded-xl p-3 border text-center"
                            :class="isDark ? 'bg-black/20 border-white/5' : 'bg-gray-50 border-gray-100'">
                            <span class="material-icons text-purple-400 text-base">inventory</span>
                            <p class="text-lg font-black mt-1">{{ jobStore.jobData?.inventory?.length || 0 }}</p>
                            <p class="text-[9px] uppercase font-bold" :class="isDark ? 'text-gray-500' : 'text-gray-400'">Items</p>
                        </div>
                        <div class="rounded-xl p-3 border text-center"
                            :class="isDark ? 'bg-black/20 border-white/5' : 'bg-gray-50 border-gray-100'">
                            <span class="material-icons text-purple-400 text-base">timer</span>
                            <p class="text-lg font-black mt-1">{{ jobStore.stateLabel }}</p>
                            <p class="text-[9px] uppercase font-bold" :class="isDark ? 'text-gray-500' : 'text-gray-400'">Phase</p>
                        </div>
                    </div>
                    <button @click="$router.push('/house-shift-dashboard')"
                        class="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border transition-all active:scale-[0.97]"
                        :class="isDark ? 'border-purple-500/30 bg-purple-500/10 text-purple-400 hover:bg-purple-500/20' : 'border-purple-300 bg-purple-50 text-purple-700 hover:bg-purple-100'">
                        <span class="material-icons text-base">dashboard</span>
                        Open Shift Dashboard →
                    </button>
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
                    <span class="relative material-icons text-2xl text-background-dark">{{ jobStore.jobType ?
                        'arrow_forward' : 'play_arrow' }}</span>
                    <span class="relative text-xl font-black uppercase tracking-wide text-background-dark">{{
                        nextActionLabel }}</span>
                </button>
            </div>
        </div>

        <!-- Job Type Selector (Demo Mode) -->
        <JobTypeSelector />
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useDriverStore } from '../stores/driverStore.js'
import { useUiStore } from '../stores/uiStore.js'
import { useRouteStore } from '../stores/routeStore.js'
import { useJobStore } from '../stores/jobStore.js'
import { useFlowRouter } from '../composables/useFlowRouter.js'
import { dummyManifest } from '../utils/dummyData.js'
import JobTypeSelector from '../components/JobTypeSelector.vue'

const router = useRouter()
const driverStore = useDriverStore()
const uiStore = useUiStore()
const routeStore = useRouteStore()
const jobStore = useJobStore()
const { navigateToCurrentState, getNextActionLabel } = useFlowRouter()
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

onUnmounted(() => {
    // Cleanup if tracking
    if (jobStore.isTracking) {
        jobStore.stopSimulatedTracking()
    }
})

function updateTime() {
    const now = new Date()
    const h = now.getHours()
    period.value = h >= 12 ? 'PM' : 'AM'
    currentTime.value = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false })
    currentDate.value = now.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })
}

const quickStats = computed(() => [
    { label: 'Stops', value: String(jobStore.totalStops || 7), color: '' },
    { label: 'Rating', value: '4.9★', color: 'text-accent-gold' },
    { label: 'On-Time', value: '96%', color: 'text-primary' },
    { label: '₹ Today', value: '1.8K', color: 'text-primary' },
])

const manifestMetrics = computed(() => [
    {
        label: 'Stops',
        icon: 'place',
        value: String(jobStore.totalStops || 7),
        sub: `${jobStore.completedStopsCount} completed`
    },
    { label: 'Est. Time', icon: 'schedule', value: '5h 20m', sub: 'Ends 1:20 PM' },
    { label: 'Distance', icon: 'timeline', value: '47 km', sub: 'Total Route' },
    {
        label: jobStore.jobType === 'HOUSE_SHIFT' ? 'Crew' : 'Parcels',
        icon: jobStore.jobType === 'HOUSE_SHIFT' ? 'group' : 'inventory_2',
        value: jobStore.jobType === 'HOUSE_SHIFT' ? '5' : '12',
        sub: jobStore.jobType === 'HOUSE_SHIFT' ? 'Assigned' : 'To Deliver'
    },
])

const quickActions = computed(() => {
    const actions = []
    const isHouseShift = jobStore.jobType === 'HOUSE_SHIFT'
    const isParcel = jobStore.jobType === 'PARCEL_DELIVERY' || jobStore.jobType === 'PARCEL_PICKUP'

    // Crew — House Shift only
    if (isHouseShift) {
        actions.push({ label: 'Crew', icon: 'group', route: '/crew', bg: 'bg-accent-blue/15', color: 'text-accent-blue' })
    }

    // Always visible
    actions.push(
        { label: 'Wallet', icon: 'payments', route: '/wallet', bg: 'bg-primary/15', color: 'text-primary' },
        { label: 'Fuel', icon: 'local_gas_station', route: '/fuel-receipt', bg: 'bg-signal-amber/15', color: 'text-signal-amber' },
        { label: 'AI', icon: 'smart_toy', route: '/voice', bg: 'bg-accent-purple/15', color: 'text-accent-purple' },
    )

    // Returns — Delivery/Pickup only
    if (isParcel) {
        actions.push({ label: 'Returns', icon: 'assignment_return', route: '/returns', bg: 'bg-orange-500/15', color: 'text-orange-400' })
    }

    // Always visible
    actions.push(
        { label: 'Offline', icon: 'cloud_off', route: '/offline', bg: 'bg-gray-500/15', color: 'text-gray-400' },
        { label: 'Crisis', icon: 'emergency', route: '/crisis', bg: 'bg-red-500/15', color: 'text-red-400' },
        { label: 'Summary', icon: 'summarize', route: '/shift-summary', bg: 'bg-accent-blue/15', color: 'text-accent-blue' },
    )

    return actions
})

function beginRoute() {
    if (jobStore.jobType) {
        navigateToCurrentState()
    } else {
        router.push('/manifest')
    }
}

const nextActionLabel = computed(() => {
    if (!jobStore.jobType) return 'Begin Route'
    return getNextActionLabel()
})
</script>
