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
                    <h1 class="text-2xl font-black tracking-tight">Pickup Location</h1>
                    <p class="text-xs" :class="isDark ? 'text-gray-400' : 'text-gray-500'">Geofence Check</p>
                </div>
            </div>
        </header>

        <!-- ── SCROLLABLE BODY ───────────────────────── -->
        <div class="screen-body px-5 py-4 flex flex-col gap-4">

            <!-- Geofence Status Card -->
            <div class="rounded-3xl p-6 border text-center relative overflow-hidden"
                :class="isWithinGeofence ? isDark ? 'bg-green-500/10 border-green-500/30' : 'bg-green-50 border-green-300'
                    : isDark ? 'bg-surface-dark border-white/10' : 'bg-white border-gray-200 shadow-xl'">

                <!-- Background pulse animation -->
                <div v-if="isWithinGeofence"
                    class="absolute inset-0 bg-green-500/20 rounded-full blur-3xl animate-pulse"></div>

                <div class="relative z-10">
                    <div class="w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-4 relative"
                        :class="isWithinGeofence ? 'bg-green-500/20' : isDark ? 'bg-gray-800' : 'bg-gray-100'">
                        <span class="material-icons text-5xl animate-pulse"
                            :class="isWithinGeofence ? 'text-green-400' : 'text-gray-500'">
                            {{ isWithinGeofence ? 'check_circle' : 'location_searching' }}
                        </span>
                        <div v-if="!isWithinGeofence"
                            class="absolute -inset-2 border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin">
                        </div>
                    </div>

                    <p class="font-black text-2xl mb-2">
                        {{ isWithinGeofence ? 'Arrived at Pickup' : 'Approaching Location' }}
                    </p>
                    <p class="text-sm font-bold mb-4" :class="distanceColor">
                        {{ distanceText }}
                    </p>

                    <div class="text-xs leading-relaxed" :class="isDark ? 'text-gray-400' : 'text-gray-500'">
                        <p v-if="!isWithinGeofence">Move within <strong class="text-primary">50 meters</strong> to unlock scanning</p>
                        <p v-else class="text-green-400 font-semibold">You may proceed with item scanning</p>
                    </div>
                </div>
            </div>

            <!-- Customer Address Card -->
            <div class="rounded-2xl p-5 border space-y-3"
                :class="isDark ? 'bg-surface-dark/40 border-white/5' : 'bg-white border-gray-100 shadow-sm'">
                <h3 class="text-[10px] font-black uppercase tracking-widest text-primary mb-2">Pickup Address</h3>
                <div class="flex items-start gap-3">
                    <div class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        :class="isDark ? 'bg-primary/15' : 'bg-primary/10'">
                        <span class="material-icons text-primary">person</span>
                    </div>
                    <div class="flex-1">
                        <p class="font-bold text-lg">{{ stop.customerName }}</p>
                        <p class="text-sm" :class="isDark ? 'text-gray-400' : 'text-gray-500'">{{ stop.address }}</p>
                        <div class="flex items-center gap-2 mt-2">
                            <a :href="`tel:${stop.customerPhone}`"
                                class="text-xs font-semibold text-primary flex items-center gap-1">
                                <span class="material-icons text-sm">call</span>
                                {{ stop.customerPhone }}
                            </a>
                        </div>
                    </div>
                </div>

                <div v-if="stop.specialInstructions" class="rounded-xl p-3 border mt-3"
                    :class="isDark ? 'bg-blue-500/5 border-blue-500/20' : 'bg-blue-50 border-blue-200'">
                    <div class="flex items-start gap-2">
                        <span class="material-icons text-sm text-blue-400 flex-shrink-0">info</span>
                        <p class="text-xs leading-relaxed" :class="isDark ? 'text-gray-300' : 'text-gray-700'">
                            {{ stop.specialInstructions }}
                        </p>
                    </div>
                </div>

                <div class="flex items-center justify-between text-sm pt-2 border-t"
                    :class="isDark ? 'border-white/5' : 'border-gray-100'">
                    <span class="font-medium" :class="isDark ? 'text-gray-400' : 'text-gray-500'">Expected Items</span>
                    <span class="font-bold">{{ stop.expectedItems }} packages</span>
                </div>
            </div>

            <!-- Simulated GPS Coords (Debug) -->
            <div v-if="currentLocation" class="rounded-xl p-3 border text-xs font-mono"
                :class="isDark ? 'bg-gray-900/50 border-white/5 text-gray-500' : 'bg-gray-50 border-gray-200 text-gray-600'">
                <p>GPS: {{ currentLocation.lat.toFixed(6) }}, {{ currentLocation.lng.toFixed(6) }}</p>
                <p>Accuracy: ±{{ Math.round(currentLocation.accuracy) }}m · Speed: {{ Math.round(currentLocation.speed) }} km/h</p>
            </div>

        </div>

        <!-- ── STICKY FOOTER ────────────────────────── -->
        <div class="screen-footer px-5 py-4 border-t"
            :class="isDark ? 'border-white/5 bg-background-dark' : 'border-gray-100 bg-background-light'">
            <button @click="proceedToScanning" :disabled="!isWithinGeofence"
                class="w-full rounded-2xl h-14 flex items-center justify-center gap-2 font-bold text-lg active:scale-[0.98] transition-all"
                :class="isWithinGeofence
                    ? 'bg-primary text-background-dark shadow-glow'
                    : isDark ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-gray-100 text-gray-400 cursor-not-allowed'">
                <span class="material-icons">{{ isWithinGeofence ? 'qr_code_scanner' : 'lock' }}</span>
                {{ isWithinGeofence ? 'Begin Item Scanning' : `Get within ${Math.round(distanceFromGeofence)}m to continue` }}
            </button>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useJobStore } from '../stores/jobStore.js'
import { useUiStore } from '../stores/uiStore.js'
import { useGpsTracking } from '../composables/useGpsTracking.js'
import { useFlowRouter } from '../composables/useFlowRouter.js'
import { formatDistance } from '../utils/geofence.js'

const { advanceAndNavigate } = useFlowRouter()
const jobStore = useJobStore()
const uiStore = useUiStore()
const isDark = computed(() => uiStore.theme !== 'light')

const gps = useGpsTracking()
const { currentLocation, startTracking, stopTracking, checkGeofence } = gps

const stop = computed(() => jobStore.currentStop || {})

const geofenceCheck = computed(() => {
    if (!stop.value.location || !currentLocation.value) {
        return { isWithin: false, distance: 9999, distanceFromGeofence: 9999 }
    }
    return checkGeofence(stop.value.location, 50)
})

const isWithinGeofence = computed(() => geofenceCheck.value.isWithin)
const distanceFromGeofence = computed(() => geofenceCheck.value.distanceFromGeofence || 0)

const distanceText = computed(() => {
    const dist = geofenceCheck.value.distance
    if (dist === null) return 'Waiting for GPS...'
    return formatDistance(dist)
})

const distanceColor = computed(() => {
    const dist = geofenceCheck.value.distance
    if (dist === null) return isDark.value ? 'text-gray-500' : 'text-gray-400'
    if (dist <= 50) return 'text-green-400'
    if (dist <= 250) return 'text-yellow-400'
    return isDark.value ? 'text-gray-400' : 'text-gray-500'
})

onMounted(() => {
    // Start GPS tracking (simulated for demo)
    startTracking(true)
})

onUnmounted(() => {
    stopTracking()
})

async function proceedToScanning() {
    if (!isWithinGeofence.value) return

    // Transition FSM state and navigate
    advanceAndNavigate('SCAN_ITEMS', {
        arrivedAt: new Date().toISOString(),
        location: currentLocation.value
    })
}
</script>
