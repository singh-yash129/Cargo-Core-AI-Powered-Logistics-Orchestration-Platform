<template>
    <div class="screen-layout" :class="isDark ? 'bg-background-dark text-white' : 'bg-background-light text-gray-900'">

        <!-- Header -->
        <header class="flex-shrink-0 px-5 pt-5 pb-4 border-b" :class="isDark ? 'border-white/5' : 'border-gray-100'">
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full flex items-center justify-center" :class="jobBgColor">
                    <span class="material-icons text-white text-lg">{{ jobIcon }}</span>
                </div>
                <div>
                    <p class="text-xs uppercase tracking-wider font-bold" :class="jobTextColor">New Job Assignment</p>
                    <h1 class="text-xl font-black">{{ jobStore.jobTypeLabel }}</h1>
                </div>
                <div class="ml-auto">
                    <div class="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider"
                        :class="isDark ? 'bg-signal-amber/15 text-signal-amber' : 'bg-amber-50 text-amber-600 border border-amber-200'">
                        Action Required
                    </div>
                </div>
            </div>
        </header>

        <!-- Scrollable Body -->
        <div class="screen-body flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">

            <!-- Job ID Card -->
            <div class="rounded-3xl p-5 border"
                :class="isDark ? 'bg-surface-dark/60 border-white/10' : 'bg-white border-gray-100 shadow-xl'">
                <div class="absolute top-0 right-0 w-40 h-40 blur-3xl opacity-20 rounded-full" :class="jobBgColor">
                </div>
                <div class="relative">
                    <div class="flex items-start justify-between mb-3">
                        <div>
                            <p class="text-xs uppercase tracking-wider font-semibold mb-1"
                                :class="isDark ? 'text-gray-400' : 'text-gray-500'">Job ID</p>
                            <p class="text-3xl font-black">{{ jobStore.jobData?.jobId }}</p>
                            <p class="text-xs mt-1" :class="isDark ? 'text-gray-400' : 'text-gray-500'">
                                Assigned at {{ assignedTime }} · {{ jobStore.jobData?.vehicleId }}
                            </p>
                        </div>
                        <span class="material-icons text-5xl opacity-20" :class="jobTextColor">{{ jobIcon }}</span>
                    </div>

                    <!-- Job Stats Grid -->
                    <div class="grid grid-cols-3 gap-3 mt-4">
                        <div v-for="stat in jobStats" :key="stat.label" class="rounded-2xl p-3 text-center border"
                            :class="isDark ? 'bg-black/20 border-white/5' : 'bg-gray-50 border-gray-100'">
                            <span class="material-icons text-lg mb-1 block" :class="stat.color">{{ stat.icon }}</span>
                            <p class="text-lg font-black">{{ stat.value }}</p>
                            <p class="text-[10px] uppercase font-semibold mt-0.5"
                                :class="isDark ? 'text-gray-500' : 'text-gray-400'">{{ stat.label }}</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Addresses Card -->
            <div class="rounded-2xl border overflow-hidden"
                :class="isDark ? 'bg-surface-dark/40 border-white/8' : 'bg-white border-gray-100 shadow-sm'">

                <!-- Source -->
                <div class="p-4 flex items-start gap-3 border-b" :class="isDark ? 'border-white/5' : 'border-gray-100'">
                    <div
                        class="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span class="material-icons text-primary text-sm">warehouse</span>
                    </div>
                    <div>
                        <p class="text-xs uppercase font-bold tracking-wider text-primary mb-0.5">
                            {{ isPickup ? 'Pickup Location' : isHouseShift ? 'Source Address' : 'Warehouse' }}
                        </p>
                        <p class="font-semibold text-sm">{{ fromAddress.name }}</p>
                        <p class="text-xs mt-0.5" :class="isDark ? 'text-gray-400' : 'text-gray-500'">
                            {{ fromAddress.address }}
                        </p>
                    </div>
                </div>

                <!-- Destination (if applicable) -->
                <div v-if="toAddress" class="p-4 flex items-start gap-3">
                    <div
                        class="w-8 h-8 rounded-full bg-green-500/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span class="material-icons text-green-400 text-sm">place</span>
                    </div>
                    <div>
                        <p class="text-xs uppercase font-bold tracking-wider text-green-400 mb-0.5">
                            {{ isHouseShift ? 'Destination Address' : 'Delivery Area' }}
                        </p>
                        <p class="font-semibold text-sm">{{ toAddress.name }}</p>
                        <p class="text-xs mt-0.5" :class="isDark ? 'text-gray-400' : 'text-gray-500'">
                            {{ toAddress.address }}
                        </p>
                    </div>
                </div>
            </div>

            <div v-if="tripBrief" class="rounded-2xl border p-4"
                :class="isDark ? 'bg-surface-dark/40 border-white/8' : 'bg-white border-gray-100 shadow-sm'">
                <div class="flex items-start justify-between gap-3 mb-3">
                    <div>
                        <p class="text-xs uppercase tracking-wider font-bold text-primary">AI Trip Command</p>
                        <p class="text-sm font-semibold mt-1">{{ tripBrief.dispatcher_recommendation }}</p>
                    </div>
                    <span class="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border"
                        :class="tripStatusClass">
                        {{ tripBrief.route_status }}
                    </span>
                </div>

                <div class="grid grid-cols-3 gap-3">
                    <div class="rounded-2xl p-3 border text-center"
                        :class="isDark ? 'bg-black/20 border-white/5' : 'bg-gray-50 border-gray-100'">
                        <p class="text-[10px] uppercase font-bold tracking-wider"
                            :class="isDark ? 'text-gray-500' : 'text-gray-400'">ETA</p>
                        <p class="text-lg font-black mt-1">{{ tripBrief.eta_label }}</p>
                    </div>
                    <div class="rounded-2xl p-3 border text-center"
                        :class="isDark ? 'bg-black/20 border-white/5' : 'bg-gray-50 border-gray-100'">
                        <p class="text-[10px] uppercase font-bold tracking-wider"
                            :class="isDark ? 'text-gray-500' : 'text-gray-400'">Risk</p>
                        <p class="text-lg font-black mt-1" :class="riskTextClass">{{ tripBrief.risk_level }}</p>
                    </div>
                    <div class="rounded-2xl p-3 border text-center"
                        :class="isDark ? 'bg-black/20 border-white/5' : 'bg-gray-50 border-gray-100'">
                        <p class="text-[10px] uppercase font-bold tracking-wider"
                            :class="isDark ? 'text-gray-500' : 'text-gray-400'">Confidence</p>
                        <p class="text-lg font-black mt-1">{{ tripBrief.eta_confidence }}</p>
                    </div>
                </div>

                <div v-if="alternateMinutesSaved > 0"
                    class="mt-3 rounded-2xl px-3 py-2 text-sm font-semibold border"
                    :class="isDark ? 'bg-signal-amber/10 border-signal-amber/20 text-amber-300' : 'bg-amber-50 border-amber-200 text-amber-800'">
                    Alternate route available. Estimated recovery: {{ alternateMinutesSaved }} min.
                </div>
            </div>

            <!-- Stops / Items preview -->
            <div class="rounded-2xl border p-4"
                :class="isDark ? 'bg-surface-dark/40 border-white/8' : 'bg-white border-gray-100 shadow-sm'">
                <p class="text-xs uppercase tracking-wider font-bold mb-3"
                    :class="isDark ? 'text-gray-400' : 'text-gray-500'">
                    {{ isHouseShift ? 'Items to Move' : isPickup ? 'Expected Pickups' : 'Delivery Stops' }}
                </p>
                <div v-if="isHouseShift" class="space-y-2">
                    <div v-for="cat in inventoryCategories" :key="cat.name" class="flex items-center justify-between">
                        <span class="text-sm font-semibold">{{ cat.name }}</span>
                        <span class="text-sm font-black" :class="jobTextColor">{{ cat.count }} items</span>
                    </div>
                </div>
                <div v-else class="space-y-2">
                    <div v-for="(stop, i) in previewStops" :key="stop.id" class="flex items-center gap-3">
                        <div class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black"
                            :class="isDark ? 'bg-primary/20 text-primary' : 'bg-primary/15 text-primary'">
                            {{ i + 1 }}
                        </div>
                        <div class="flex-1">
                            <p class="text-sm font-semibold">{{ stop.customerName }}</p>
                            <p class="text-xs" :class="isDark ? 'text-gray-400' : 'text-gray-500'">
                                {{ stop.address?.slice(0, 45) }}...
                            </p>
                        </div>
                        <span v-if="stop.cod" class="text-xs font-bold text-signal-amber">COD</span>
                    </div>
                </div>
            </div>

            <!-- Important Notes -->
            <div v-if="hasSpecialNotes" class="rounded-2xl border-l-4 border-signal-amber p-4"
                :class="isDark ? 'bg-signal-amber/5' : 'bg-amber-50'">
                <div class="flex items-center gap-2 mb-2">
                    <span class="material-icons text-signal-amber text-base">warning</span>
                    <p class="text-xs uppercase font-bold tracking-wider text-signal-amber">Special Notes</p>
                </div>
                <ul class="space-y-1">
                    <li v-for="note in specialNotes" :key="note" class="text-xs font-medium flex items-start gap-1.5"
                        :class="isDark ? 'text-amber-300' : 'text-amber-800'">
                        <span class="text-signal-amber mt-0.5">•</span>
                        {{ note }}
                    </li>
                </ul>
            </div>

        </div>

        <!-- Footer Buttons -->
        <div class="screen-footer border-t px-5 pt-4 pb-4 flex flex-col gap-3"
            :class="isDark ? 'border-white/5 bg-background-dark' : 'border-gray-100 bg-background-light'">

            <!-- Accept -->
            <button @click="acceptJob"
                class="w-full rounded-2xl h-14 flex items-center justify-center gap-3 relative overflow-hidden group active:scale-[0.98] transition-transform shadow-glow">
                <div class="absolute inset-0 bg-gradient-to-r from-primary to-primary-dark"></div>
                <span class="relative material-icons text-2xl text-background-dark">check_circle</span>
                <span class="relative text-lg font-black uppercase tracking-wide text-background-dark">Accept Job</span>
            </button>

            <!-- Reject -->
            <button @click="rejectJob"
                class="w-full rounded-2xl h-12 flex items-center justify-center gap-2 border-2 transition-all active:scale-[0.98]"
                :class="isDark ? 'border-red-500/30 text-red-400 bg-red-500/5' : 'border-red-200 text-red-500 bg-red-50'">
                <span class="material-icons text-lg">cancel</span>
                <span class="text-sm font-bold uppercase tracking-wider">Reject / Reassign</span>
            </button>
        </div>
    </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useDriverStore } from '../stores/driverStore.js'
import { useJobStore } from '../stores/jobStore.js'
import { useRouteStore } from '../stores/routeStore.js'
import { useUiStore } from '../stores/uiStore.js'
import { useFlowRouter } from '../composables/useFlowRouter.js'
import { getTripIntelligence } from '../services/api.js'

const router = useRouter()
const driverStore = useDriverStore()
const jobStore = useJobStore()
const routeStore = useRouteStore()
const uiStore = useUiStore()
const { advanceAndNavigate, navigateToCurrentState } = useFlowRouter()
const isDark = computed(() => uiStore.theme !== 'light')
const activeOrderId = computed(() => jobStore.currentStop?.orderId || jobStore.jobData?.id || jobStore.jobData?.stops?.[0]?.orderId || null)
const tripBrief = computed(() => {
    if (!routeStore.tripBrief || !activeOrderId.value) return routeStore.tripBrief
    return String(routeStore.tripBrief.order_id) === String(activeOrderId.value) ? routeStore.tripBrief : null
})
const alternateMinutesSaved = computed(() => Math.max(0, -(tripBrief.value?.alternate_route?.delta_minutes || 0)))
const riskTextClass = computed(() => {
    const level = tripBrief.value?.risk_level
    if (level === 'CRITICAL' || level === 'HIGH') return 'text-red-400'
    if (level === 'MEDIUM') return 'text-signal-amber'
    return 'text-primary'
})
const tripStatusClass = computed(() => {
    const status = tripBrief.value?.route_status
    if (status === 'Blocked' || status === 'Delayed') return 'bg-red-500/10 text-red-400 border-red-500/20'
    if (status === 'Delay Risk') return 'bg-amber-500/10 text-amber-400 border-amber-500/20'
    return 'bg-green-500/10 text-green-400 border-green-500/20'
})

// ── Job Type Helpers ──────────────────────────────────────────────
const isPickup = computed(() => jobStore.jobType === 'PARCEL_PICKUP')
const isHouseShift = computed(() => jobStore.jobType === 'HOUSE_SHIFT')

const jobBgColor = computed(() => ({
    'PARCEL_DELIVERY': 'bg-green-500',
    'PARCEL_PICKUP': 'bg-blue-500',
    'HOUSE_SHIFT': 'bg-purple-500',
})[jobStore.jobType] || 'bg-gray-500')

const jobTextColor = computed(() => ({
    'PARCEL_DELIVERY': 'text-green-400',
    'PARCEL_PICKUP': 'text-blue-400',
    'HOUSE_SHIFT': 'text-purple-400',
})[jobStore.jobType] || 'text-gray-400')

const jobIcon = computed(() => ({
    'PARCEL_DELIVERY': 'local_shipping',
    'PARCEL_PICKUP': 'assignment_return',
    'HOUSE_SHIFT': 'moving',
})[jobStore.jobType] || 'assignment')

// ── Time ──────────────────────────────────────────────────────────
const assignedTime = computed(() => {
    if (!jobStore.jobData?.assignedAt) return '--'
    return new Date(jobStore.jobData.assignedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
})

// ── Stats ─────────────────────────────────────────────────────────
const jobStats = computed(() => {
    const job = jobStore.jobData
    if (!job) return []

    if (isHouseShift.value) {
        return [
            { label: 'Duration', icon: 'schedule', color: 'text-primary', value: `${Math.round(job.estimatedDuration / 60)}h` },
            { label: 'Crew', icon: 'group', color: 'text-accent-blue', value: job.crewRequired },
            { label: 'Items', icon: 'inventory', color: 'text-accent-purple', value: job.inventory?.length || 0 },
        ]
    } else if (isPickup.value) {
        return [
            { label: 'Stops', icon: 'place', color: 'text-blue-400', value: job.stops?.length || 0 },
            { label: 'Distance', icon: 'timeline', color: 'text-primary', value: `${job.routeDistance} km` },
            { label: 'Duration', icon: 'schedule', color: 'text-accent-blue', value: `${Math.round(job.estimatedDuration / 60)}h` },
        ]
    } else {
        return [
            { label: 'Stops', icon: 'place', color: 'text-green-400', value: job.stops?.length || 0 },
            { label: 'Distance', icon: 'timeline', color: 'text-primary', value: `${job.routeDistance} km` },
            { label: 'Duration', icon: 'schedule', color: 'text-accent-blue', value: `${Math.round(job.estimatedDuration / 60)}h` },
        ]
    }
})

// ── Addresses ─────────────────────────────────────────────────────
const fromAddress = computed(() => {
    const job = jobStore.jobData
    const dashboard = driverStore.dashboard
    if (!job) return { name: '--', address: '--' }
    if (isHouseShift.value) return { name: job.sourceLocation?.customerName || 'Source Address', address: job.sourceLocation?.address || 'Awaiting address' }
    if (isPickup.value) return { name: 'Pickup Zones', address: job.stops?.[0]?.address || 'Multiple locations' }
    
    // Use warehouse from dashboard if available
    const warehouseName = dashboard?.shift?.warehouse_name || 'Central Warehouse'
    const warehouseAddr = dashboard?.manifest?.origin_addr || 'Distribution Hub'
    return { name: warehouseName, address: warehouseAddr }
})

const toAddress = computed(() => {
    const job = jobStore.jobData
    if (!job) return null
    if (isHouseShift.value) return { name: job.destinationLocation?.customerName || 'Destination Address', address: job.destinationLocation?.address || 'Awaiting address' }
    
    if (!isPickup.value && job.stops?.length > 0) {
        const firstStop = job.stops[0]
        const areaName = firstStop.address?.split(',').slice(-2, -1)[0]?.trim() || 'Delivery Zone'
        return { 
            name: `Delivery Zone: ${areaName}`, 
            address: `${job.stops.length} stop(s) in this area` 
        }
    }
    return null
})

// ── Stops Preview ─────────────────────────────────────────────────
const previewStops = computed(() => jobStore.jobData?.stops?.slice(0, 3) || [])

// ── Inventory Categories (House Shift) ────────────────────────────
const inventoryCategories = computed(() => {
    const inv = jobStore.jobData?.inventory || []
    const grouped = {}
    inv.forEach(item => {
        grouped[item.category] = (grouped[item.category] || 0) + item.qty
    })
    return Object.entries(grouped).map(([name, count]) => ({ name, count }))
})

// ── Special Notes ─────────────────────────────────────────────────
const specialNotes = computed(() => {
    const job = jobStore.jobData
    if (!job) return []
    const notes = []
    if (isHouseShift.value) {
        if (job.balanceDue > 0) notes.push(`Balance due from customer: ₹${job.balanceDue.toLocaleString()}`)
        if (job.crewRequired) notes.push(`Crew of ${job.crewRequired} required — check all in`)
    } else {
        const codStops = job.stops?.filter(s => s.cod) || []
        if (codStops.length > 0) {
            notes.push(`${codStops.length} COD stop(s) — collect ₹${codStops.reduce((a, s) => a + s.codAmount, 0).toLocaleString()}`)
        }
    }
    return notes
})
const hasSpecialNotes = computed(() => specialNotes.value.length > 0)

// ── Actions ───────────────────────────────────────────────────────
function acceptJob() {
    // Determine next state based on job type
    const nextStates = {
        'PARCEL_DELIVERY': 'LOAD_VERIFICATION',
        'PARCEL_PICKUP': 'START_ROUTE',
        'HOUSE_SHIFT': 'CREW_CHECKIN',
    }
    const nextState = nextStates[jobStore.jobType]

    // Check if we are already in the target state or beyond
    if (jobStore.jobState === nextState) {
        navigateToCurrentState()
        return
    }

    if (!jobStore.canTransitionTo(nextState)) {
        console.warn(`Cannot transition from ${jobStore.jobState} to ${nextState}`)
        // If we're stuck, just try to navigate to the current state
        navigateToCurrentState()
        return
    }

    uiStore.showToast('Job accepted! Starting next step...', 'success', 2000)

    setTimeout(() => {
        advanceAndNavigate(nextState, { acceptedAt: new Date().toISOString() })
    }, 500)
}

function rejectJob() {
    uiStore.showToast('Job rejected. Notifying dispatcher...', 'warning', 2000)
    setTimeout(() => {
        jobStore.reset()
        router.push('/dashboard')
    }, 1500)
}

onMounted(async () => {
    if (!activeOrderId.value) return
    if (tripBrief.value && String(tripBrief.value.order_id) === String(activeOrderId.value)) return
    try {
        routeStore.setTripBrief(await getTripIntelligence(activeOrderId.value))
    } catch (error) {
        console.warn('Unable to load trip intelligence for assignment view', error)
    }
})
</script>
