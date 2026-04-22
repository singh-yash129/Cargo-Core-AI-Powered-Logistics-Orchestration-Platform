<template>
    <div class="screen-layout" :class="isDark ? 'bg-background-dark text-white' : 'bg-background-light text-gray-900'">

        <!-- ── HEADER ───────────────────────────────── -->
        <header class="flex-shrink-0 px-5 pt-5 pb-4 border-b" :class="isDark ? 'border-white/5' : 'border-gray-100'">
            <div class="flex items-center gap-3">
                <button @click="$router.back()" class="w-10 h-10 rounded-full flex items-center justify-center border"
                    :class="isDark ? 'bg-surface-dark border-white/5 text-gray-400' : 'bg-white border-gray-200 shadow-sm'">
                    <span class="material-icons text-xl">arrow_back</span>
                </button>
                <div class="flex-1 min-w-0">
                    <h1 class="text-xl font-black tracking-tight leading-tight">Delivery Details</h1>
                    <p class="text-xs font-semibold" :class="isDark ? 'text-gray-400' : 'text-gray-500'">
                        Stop #1 · Arrived <span class="text-primary">{{ time }}</span>
                    </p>
                </div>
                <!-- Dwell timer badge -->
                <div class="px-3 py-1.5 rounded-full border text-xs font-black font-mono"
                    :class="isDark ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-primary/10 border-primary/30 text-primary'">
                    {{ dwellTime }}
                </div>
            </div>
        </header>

        <!-- ── SCROLLABLE BODY ───────────────────────── -->
        <div class="screen-body px-5 py-4 flex flex-col gap-4">

            <!-- Customer Card -->
            <div class="rounded-2xl p-5 border"
                :class="isDark ? 'bg-surface-dark/40 border-white/8' : 'bg-white border-gray-100 shadow-sm'">
                <p class="text-[10px] font-black uppercase tracking-widest mb-2"
                    :class="isDark ? 'text-gray-500' : 'text-gray-400'">Customer</p>
                <div class="flex items-start gap-3">
                    <div class="w-11 h-11 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
                        <span class="material-icons text-primary leading-none" style="font-size:20px;">person</span>
                    </div>
                    <div class="flex-1 min-w-0">
                        <p class="font-black text-base leading-tight">{{ customerName }}</p>
                        <p class="text-xs mt-0.5" :class="isDark ? 'text-gray-400' : 'text-gray-500'">{{ customerPhone }}</p>
                    </div>
                    <a :href="customerPhoneHref"
                        class="w-9 h-9 rounded-full flex items-center justify-center border shrink-0"
                        :class="isDark ? 'border-white/10 bg-white/5 text-gray-300' : 'border-gray-200 bg-gray-50 text-gray-600'">
                        <span class="material-icons leading-none" style="font-size:16px;">call</span>
                    </a>
                </div>

                <!-- Divider -->
                <div class="h-px my-4" :class="isDark ? 'bg-white/5' : 'bg-gray-100'"></div>

                <!-- Address -->
                <div class="flex items-start gap-2">
                    <span class="material-icons text-primary leading-none mt-0.5" style="font-size:16px;">place</span>
                    <div>
                        <p class="text-sm font-semibold leading-snug">{{ stop.address || 'Awaiting destination address' }}</p>
                        <p class="text-xs mt-0.5" :class="isDark ? 'text-gray-500' : 'text-gray-400'">{{ stopMeta }}</p>
                    </div>
                </div>
            </div>

            <!-- Return Pickup Banner -->
            <div v-if="isReturnPickup"
                class="rounded-2xl p-4 border flex items-start gap-3"
                :class="isDark ? 'bg-purple-500/10 border-purple-500/20' : 'bg-purple-50 border-purple-200'">
                <span class="material-icons text-purple-400 leading-none mt-0.5" style="font-size:20px;">undo</span>
                <div class="flex-1">
                    <p class="text-xs font-black uppercase tracking-wide text-purple-400 mb-1">Return Pickup Job</p>
                    <p class="text-xs leading-relaxed" :class="isDark ? 'text-gray-300' : 'text-gray-600'">
                        Collect parcel from customer for damage claim inspection at warehouse.
                    </p>
                    <div v-if="stop.damageClaimId" class="mt-1 font-mono text-[10px] text-purple-400 opacity-80">
                        Claim: {{ stop.damageClaimId }}
                    </div>
                </div>
            </div>

            <!-- Return Pickup: Customer Damage Description -->
            <div v-if="isReturnPickup && stop.damageDescription"
                class="rounded-2xl p-4 border"
                :class="isDark ? 'bg-surface-dark/40 border-white/8' : 'bg-white border-gray-100 shadow-sm'">
                <p class="text-[10px] font-black uppercase tracking-widest mb-2"
                    :class="isDark ? 'text-gray-500' : 'text-gray-400'">Customer's Damage Description</p>
                <p class="text-sm" :class="isDark ? 'text-gray-300' : 'text-gray-700'">{{ stop.damageDescription }}</p>
            </div>

            <!-- Return Pickup: Parcel to Collect -->
            <div v-if="isReturnPickup"
                class="rounded-2xl p-5 border"
                :class="isDark ? 'bg-surface-dark/40 border-white/8' : 'bg-white border-gray-100 shadow-sm'">
                <p class="text-[10px] font-black uppercase tracking-widest mb-3"
                    :class="isDark ? 'text-gray-500' : 'text-gray-400'">Parcel to Collect</p>
                <div class="flex items-center gap-3 p-3 rounded-xl"
                    :class="isDark ? 'bg-black/20' : 'bg-gray-50'">
                    <div class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-purple-500/15">
                        <span class="material-icons leading-none text-purple-400" style="font-size:15px;">undo</span>
                    </div>
                    <div class="flex-1 min-w-0">
                        <p class="text-sm font-semibold leading-tight">{{ stop.parcelDescription || 'Return Parcel' }}</p>
                        <p class="text-[10px] mt-0.5" :class="isDark ? 'text-gray-500' : 'text-gray-400'">
                            Inspect condition visually before collecting
                        </p>
                    </div>
                    <span class="text-[10px] font-black px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-400">COLLECT</span>
                </div>
            </div>

            <!-- Standard Delivery: Parcel / Items -->
            <div v-if="!isReturnPickup"
                class="rounded-2xl p-5 border"
                :class="isDark ? 'bg-surface-dark/40 border-white/8' : 'bg-white border-gray-100 shadow-sm'">
                <p class="text-[10px] font-black uppercase tracking-widest mb-3"
                    :class="isDark ? 'text-gray-500' : 'text-gray-400'">Parcels to Deliver</p>
                <div class="flex flex-col gap-2">
                    <div v-for="item in parcels" :key="item.id"
                        class="flex items-center gap-3 p-3 rounded-xl"
                        :class="isDark ? 'bg-black/20' : 'bg-gray-50'">
                        <div class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                            :class="isDark ? 'bg-white/5' : 'bg-white border border-gray-200'">
                            <span class="material-icons leading-none text-primary" style="font-size:15px;">inventory_2</span>
                        </div>
                        <div class="flex-1 min-w-0">
                            <p class="text-sm font-semibold leading-tight truncate">{{ item.label }}</p>
                            <p class="text-[10px] mt-0.5" :class="isDark ? 'text-gray-500' : 'text-gray-400'">{{ item.weight }} · {{ item.dims }}</p>
                        </div>
                        <span class="text-[10px] font-black px-2 py-0.5 rounded-full"
                            :class="item.fragile ? 'bg-signal-amber/15 text-signal-amber' : isDark ? 'bg-white/5 text-gray-500' : 'bg-gray-100 text-gray-400'">
                            {{ item.fragile ? 'FRAGILE' : 'STD' }}
                        </span>
                    </div>
                </div>
            </div>

            <!-- Special Instructions -->
            <div class="rounded-2xl p-4 border flex items-start gap-3"
                :class="isDark ? 'bg-signal-amber/5 border-signal-amber/20' : 'bg-amber-50 border-amber-200'">
                <span class="material-icons text-signal-amber leading-none mt-0.5" style="font-size:18px;">info</span>
                <div>
                    <p class="text-xs font-black uppercase tracking-wide text-signal-amber mb-0.5">Special Instructions</p>
                    <p class="text-xs leading-relaxed" :class="isDark ? 'text-gray-300' : 'text-gray-600'">
                        {{ stop.specialInstructions || 'Follow dispatch instructions and hand over to the consignee directly.' }}
                    </p>
                </div>
            </div>

            <!-- COD Info (if applicable) -->
            <div v-if="stop.cod" class="rounded-2xl p-4 border flex items-center gap-3"
                :class="isDark ? 'bg-green-500/5 border-green-500/20' : 'bg-green-50 border-green-200'">
                <span class="material-icons text-green-400 leading-none" style="font-size:20px;">payments</span>
                <div class="flex-1">
                    <p class="text-xs font-black uppercase tracking-wide text-green-400 mb-0.5">Cash on Delivery</p>
                    <p class="text-sm font-black">₹ {{ Number(stop.codAmount || 0).toLocaleString('en-IN') }}</p>
                </div>
                <span class="text-[10px] font-black px-2.5 py-1 rounded-full bg-green-500/15 text-green-400 border border-green-500/30">
                    COLLECT
                </span>
            </div>

            <!-- Exception / Damage links (secondary) -->
            <div class="flex gap-2 pt-1">
                <button @click="$router.push('/damage-report')"
                    class="flex-1 rounded-xl h-10 flex items-center justify-center gap-1.5 text-xs font-semibold border transition-all active:scale-[0.98] text-red-400"
                    :class="isDark ? 'border-red-500/20 bg-red-500/5' : 'border-red-100 bg-red-50'">
                    <span class="material-icons leading-none" style="font-size:14px;">report_problem</span>
                    Report Damage
                </button>
                <button @click="$router.push('/exception/' + stopId)"
                    class="flex-1 rounded-xl h-10 flex items-center justify-center gap-1.5 text-xs font-semibold border transition-all active:scale-[0.98] text-red-500"
                    :class="isDark ? 'border-red-500/25 bg-red-500/8' : 'border-red-200 bg-red-50'">
                    <span class="material-icons leading-none" style="font-size:14px;">cancel</span>
                    Exception
                </button>
            </div>

        </div>

        <!-- ── STICKY FOOTER ────────────────────────── -->
        <div class="screen-footer px-5 py-4 border-t"
            :class="isDark ? 'border-white/5 bg-background-dark' : 'border-gray-100 bg-background-light'">
            <!-- Return Pickup: Confirm Collection -->
            <template v-if="isReturnPickup">
                <button v-if="!collectionConfirmed"
                    @click="confirmCollection"
                    :disabled="confirmingCollection"
                    class="w-full rounded-2xl h-14 flex items-center justify-center gap-2 font-bold text-white shadow-glow active:scale-[0.98] transition-transform disabled:opacity-70"
                    style="background: linear-gradient(135deg, #9333ea, #7c3aed);">
                    <span v-if="confirmingCollection" class="material-icons text-xl animate-spin">progress_activity</span>
                    <span v-else class="material-icons text-xl">check_circle</span>
                    {{ confirmingCollection ? 'Confirming...' : 'Confirm Parcel Collected' }}
                </button>
                <div v-else class="flex flex-col gap-2">
                    <div class="w-full rounded-2xl h-10 flex items-center justify-center gap-2 font-bold text-green-400 bg-green-500/10 border border-green-500/20 text-sm">
                        <span class="material-icons text-lg">check_circle</span>
                        Parcel Collected
                    </div>
                    <button @click="markArrivedAtWarehouse"
                        :disabled="markingWarehouse"
                        class="w-full rounded-2xl h-14 flex items-center justify-center gap-2 font-bold text-white active:scale-[0.98] transition-transform disabled:opacity-70"
                        style="background: linear-gradient(135deg, #1CE783, #15b86a);">
                        <span v-if="markingWarehouse" class="material-icons text-xl animate-spin">progress_activity</span>
                        <span v-else class="material-icons text-xl">warehouse</span>
                        {{ markingWarehouse ? 'Updating...' : 'Mark Arrived at Warehouse' }}
                    </button>
                </div>
            </template>

            <!-- Standard delivery -->
            <button v-else @click="beginService"
                class="w-full rounded-2xl h-14 flex items-center justify-center gap-2 font-bold text-background-dark shadow-glow active:scale-[0.98] transition-transform"
                style="background: linear-gradient(135deg, #1CE783, #15b86a);">
                <span class="material-icons text-xl">checklist</span>
                {{ primaryActionLabel }}
            </button>
        </div>

    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUiStore } from '../stores/uiStore.js'
import { useJobStore } from '../stores/jobStore.js'
import { useRouteStore } from '../stores/routeStore.js'
import { useFlowRouter } from '../composables/useFlowRouter.js'

const route = useRoute()
const router = useRouter()
const { advanceAndNavigate } = useFlowRouter()
const uiStore = useUiStore()
const jobStore = useJobStore()
const routeStore = useRouteStore()
const isDark = computed(() => uiStore.theme !== 'light')
const stopId = computed(() => route.params.id || 'STOP-001')
const stop = computed(() => jobStore.getStopById(stopId.value) || jobStore.currentStop || {})
const customerName = computed(() => stop.value.customerName || 'Customer')
const customerPhone = computed(() => stop.value.customerPhone || stop.value.phone || 'Phone unavailable')
const customerPhoneHref = computed(() => customerPhone.value && customerPhone.value !== 'Phone unavailable' ? `tel:${customerPhone.value}` : null)
const parcels = computed(() => Array.isArray(stop.value.packages) ? stop.value.packages.map(pkg => ({
    id: pkg.id,
    label: pkg.description || pkg.barcode || 'Package',
    weight: pkg.weight || 'N/A',
    dims: pkg.dims || 'Standard parcel',
    fragile: Boolean(pkg.fragile),
})) : [])
const stopMeta = computed(() => {
    const parts = []
    if (stop.value.timeWindow?.start) {
        parts.push(`Window ${stop.value.timeWindow.start}`)
    }
    if (stop.value.trackingCode) {
        parts.push(stop.value.trackingCode)
    }
    return parts.join(' · ') || 'Dispatch-managed stop'
})
const primaryActionLabel = computed(() =>
    jobStore.jobState === 'DELIVERY_IN_PROGRESS'
        ? 'Continue to Checklist'
        : 'Begin Service'
)

// Return Pickup job detection
const isReturnPickup = computed(() => stop.value.jobType === 'return_pickup' || stop.value.job_type === 'return_pickup')
const collectionConfirmed = ref(false)
const confirmingCollection = ref(false)
const markingWarehouse = ref(false)

async function confirmCollection() {
    if (confirmingCollection.value) return
    confirmingCollection.value = true
    try {
        const claimId = stop.value.damageClaimId || stop.value.damage_claim_id
        if (claimId) {
            await fetch(`http://localhost:8000/api/v1/damage-reports/${claimId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'Collected' })
            })
        }
        collectionConfirmed.value = true
    } catch (e) {
        console.error('confirmCollection error:', e)
        // Still mark locally so driver is not blocked
        collectionConfirmed.value = true
    } finally {
        confirmingCollection.value = false
    }
}

async function markArrivedAtWarehouse() {
    if (markingWarehouse.value) return
    markingWarehouse.value = true
    try {
        const claimId = stop.value.damageClaimId || stop.value.damage_claim_id
        if (claimId) {
            await fetch(`http://localhost:8000/api/v1/damage-reports/${claimId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'At Warehouse' })
            })
        }
        router.push('/dashboard')
    } catch (e) {
        console.error('markArrivedAtWarehouse error:', e)
        router.push('/dashboard')
    } finally {
        markingWarehouse.value = false
    }
}

// ── Dwell timer (counts up from arrival) ─────────────────────────────
const seconds = ref(0)
let timer = null
const dwellTime = computed(() => {
    const m = Math.floor(seconds.value / 60)
    const s = seconds.value % 60
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
})
// Arrival time label (static, set on mount)
const time = ref('')

onMounted(() => {
    jobStore.setCurrentStopById(stopId.value)
    routeStore.setCurrentStopById(stopId.value)

    try {
        jobStore.ensureArrivalState(stopId.value, {
            arrivedAt: new Date().toISOString(),
        })
    } catch (error) {
        console.warn('Unable to mark delivery details as arrived:', error)
    }

    routeStore.startDwell(stopId.value)
    time.value = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    timer = setInterval(() => seconds.value++, 1000)
})
onUnmounted(() => {
    if (timer) clearInterval(timer)
})

// ── Navigation ────────────────────────────────────────────────────────
function beginService() {
    const state = jobStore.jobState

    // Already in DELIVERY_IN_PROGRESS — go to checklist
    if (state === 'DELIVERY_IN_PROGRESS' || jobStore.canTransitionTo('SERVICE_CHECKLIST')) {
        advanceAndNavigate('SERVICE_CHECKLIST')
        return
    }

    // Can directly transition to DELIVERY_IN_PROGRESS (state is ARRIVED)
    if (jobStore.canTransitionTo('DELIVERY_IN_PROGRESS')) {
        try {
            jobStore.transition('DELIVERY_IN_PROGRESS', {
                startedAt: new Date().toISOString(),
                stopId: stopId.value,
            })
        } catch { /* ignore */ }
        advanceAndNavigate('SERVICE_CHECKLIST')
        return
    }

    // Recovery: try to get to ARRIVED then DELIVERY_IN_PROGRESS
    try {
        jobStore.ensureArrivalState(stopId.value, { arrivedAt: new Date().toISOString() })
    } catch { /* ignore */ }

    if (jobStore.canTransitionTo('DELIVERY_IN_PROGRESS')) {
        try {
            jobStore.transition('DELIVERY_IN_PROGRESS', {
                startedAt: new Date().toISOString(),
                stopId: stopId.value,
            })
        } catch { /* ignore */ }
        advanceAndNavigate('SERVICE_CHECKLIST')
        return
    }

    // Last resort: force the state to SERVICE_CHECKLIST and navigate
    const resolvedStopId = stopId.value || jobStore.currentStopId || jobStore.currentStop?.id || 'current'
    console.warn(`[DeliveryExecution] Force-navigating to service checklist from state: ${state}`)
    jobStore.jobState = 'SERVICE_CHECKLIST'
    router.push(`/service-checklist/${resolvedStopId}`)
}
</script>
