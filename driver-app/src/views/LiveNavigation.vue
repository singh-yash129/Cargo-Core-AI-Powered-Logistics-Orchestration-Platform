<template>
    <div class="h-screen w-screen overflow-hidden flex flex-col"
        :class="isDark ? 'bg-background-dark text-white' : 'bg-background-light text-gray-900'">

        <div class="absolute inset-0 z-0">
            <div class="absolute inset-0" :class="isDark ? 'bg-background-dark' : 'bg-background-light'"></div>
            <div class="absolute -top-16 left-1/2 -translate-x-1/2 w-[28rem] h-[28rem] rounded-full blur-3xl opacity-30"
                style="background: radial-gradient(circle, rgba(28,231,131,0.28) 0%, rgba(28,231,131,0) 72%);"></div>
            <div class="absolute bottom-[-6rem] right-[-4rem] w-80 h-80 rounded-full blur-3xl opacity-30"
                style="background: radial-gradient(circle, rgba(68,168,233,0.24) 0%, rgba(68,168,233,0) 72%);"></div>
        </div>

        <div class="absolute top-6 left-5 z-30">
            <button @click="$router.back()"
                class="w-11 h-11 rounded-full flex items-center justify-center backdrop-blur-xl border"
                :class="isDark ? 'border-white/10 bg-black/40 text-white' : 'border-gray-200 bg-white/90 text-gray-900 shadow-sm'">
                <span class="material-icons">arrow_back</span>
            </button>
        </div>

        <div
            class="absolute top-6 right-5 z-30 flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-xl border text-xs font-bold"
            :class="isDark ? 'border-white/10 bg-black/40 text-white' : 'border-gray-200 bg-white/90 text-gray-900 shadow-sm'">
            <span class="relative w-2 h-2 flex">
                <span class="absolute inline-flex h-full w-full rounded-full bg-primary opacity-75 animate-ping"></span>
                <span class="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span class="text-primary">MAPS</span>
        </div>

        <div class="relative z-20 flex-1 flex flex-col px-5 pt-24 pb-40">
            <div class="rounded-3xl p-5 border backdrop-blur-xl"
                :class="isDark ? 'bg-black/35 border-white/10' : 'bg-white/85 border-gray-200 shadow-sm'">
                <p class="text-xs font-black uppercase tracking-[0.28em] text-primary mb-2">External Navigation</p>
                <h1 class="text-3xl font-black tracking-tight mb-2">{{ stopTitle }}</h1>
                <p class="text-sm leading-relaxed" :class="isDark ? 'text-white/70' : 'text-gray-600'">
                    {{ stopAddress }}
                </p>

                <div class="grid grid-cols-3 gap-3 mt-5">
                    <div v-for="stat in routeStats" :key="stat.label"
                        class="rounded-2xl p-3 text-center border"
                        :class="isDark ? 'bg-white/5 border-white/5' : 'bg-gray-50 border-gray-100'">
                        <p class="text-lg font-black">{{ stat.value }}</p>
                        <p class="text-[10px] uppercase tracking-wider"
                            :class="isDark ? 'text-white/40' : 'text-gray-500'">{{ stat.label }}</p>
                    </div>
                </div>
            </div>

            <div class="mt-4 rounded-3xl p-5 border backdrop-blur-xl"
                :class="isDark ? 'bg-black/25 border-white/10' : 'bg-white/85 border-gray-200 shadow-sm'">
                <div class="flex items-start gap-4">
                    <div
                        class="w-14 h-14 rounded-2xl bg-primary/15 border border-primary/25 flex items-center justify-center flex-shrink-0">
                        <span class="material-icons text-primary text-3xl">near_me</span>
                    </div>
                    <div class="min-w-0 flex-1">
                        <p class="text-base font-black">Turn-by-turn directions open in your maps app</p>
                        <p class="text-sm mt-1" :class="isDark ? 'text-white/60' : 'text-gray-600'">
                            Use Google Maps or your preferred map app for live routing, then come back here and tap
                            <strong>I've Arrived</strong>.
                        </p>
                    </div>
                </div>

                <button @click="openMaps"
                    class="w-full mt-4 flex items-center justify-center gap-2 py-3 rounded-2xl font-black text-background-dark shadow-glow active:scale-[0.97]"
                    style="background: linear-gradient(135deg, #1CE783, #15b86a);">
                    <span class="material-icons text-lg">map</span>
                    Open in Maps
                </button>
            </div>
        </div>

        <div class="absolute bottom-0 left-0 right-0 z-30">
            <div class="mx-4 mb-4 rounded-3xl p-5 backdrop-blur-2xl border"
                :class="isDark ? 'border-white/10 bg-black/50' : 'border-gray-200 bg-white/90 shadow-sm'">
                <div class="flex gap-3">
                    <button @click="$router.push('/route-deviation')"
                        class="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-semibold active:scale-[0.97] transition-all"
                        :class="isDark ? 'border-white/10 bg-white/5 text-white' : 'border-gray-200 bg-gray-50 text-gray-700'">
                        <span class="material-icons text-sm">warning</span>
                        Deviation
                    </button>
                    <button @click="handleArrival"
                        class="flex-[2] flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-background-dark shadow-glow active:scale-[0.97] transition-all text-sm"
                        style="background: linear-gradient(135deg, #1CE783, #15b86a);">
                        <span class="material-icons text-lg">where_to_vote</span>
                        I've Arrived
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUiStore } from '../stores/uiStore.js'
import { useRouteStore } from '../stores/routeStore.js'
import { useJobStore } from '../stores/jobStore.js'
import { openExternalNavigation } from '../utils/navigation.js'

const router = useRouter()
const uiStore = useUiStore()
const routeStore = useRouteStore()
const jobStore = useJobStore()
const isDark = computed(() => uiStore.theme !== 'light')
const currentStop = computed(() =>
    routeStore.currentStop
    || jobStore.currentStop
    || jobStore.jobData?.stops?.[0]
    || routeStore.stops?.[0]
    || null
)
const currentStopId = computed(() => currentStop.value?.id || 'STOP-001')
const stopTitle = computed(() => currentStop.value?.customerName || currentStop.value?.trackingCode || 'Next stop')
const stopAddress = computed(() => currentStop.value?.address || 'Destination details are not available yet.')
const stopDistance = computed(() => currentStop.value?.distance || (jobStore.jobData?.routeDistance ? `${jobStore.jobData.routeDistance} km` : '--'))
const etaLabel = computed(() => {
    const timeWindow = currentStop.value?.timeWindow
    if (typeof timeWindow === 'string') return timeWindow
    if (timeWindow?.start) return timeWindow.start
    return routeStore.manifest?.endTime || '--:--'
})

function handleArrival() {
    ensureRouteContext()
    routeStore.startDwell(currentStopId.value)
    if (jobStore.jobType === 'PARCEL_PICKUP') {
        router.push(`/pickup-arrival/${currentStopId.value}`)
    } else {
        router.push(`/geofence-arrival/${currentStopId.value}`)
    }
}

function ensureRouteContext() {
    const manifestStops = routeStore.stops.length ? routeStore.stops : (jobStore.jobData?.stops || [])

    if (!routeStore.stops.length && manifestStops.length) {
        routeStore.loadManifest({
            routeId: routeStore.manifest?.routeId || jobStore.jobData?.manifestId || null,
            endTime: routeStore.manifest?.endTime || '--:--',
            stops: manifestStops,
        })
    }

    if (!routeStore.isRouteActive && manifestStops.length) {
        routeStore.startRoute()
    }

    if (currentStop.value?.id) {
        jobStore.setCurrentStopById(currentStop.value.id)
        routeStore.setCurrentStopById(currentStop.value.id)
        jobStore.ensureTransitState({
            startedAt: new Date().toISOString(),
            stopId: currentStop.value.id,
        })
    }
}

function openMaps() {
    if (!currentStop.value) {
        uiStore.showToast('No stop available for navigation', 'error', 2200)
        return
    }

    ensureRouteContext()

    try {
        openExternalNavigation(currentStop.value)
        uiStore.showToast('Opening navigation in Maps', 'success', 1600)
    } catch (error) {
        uiStore.showToast(error.message || 'Unable to open maps', 'error', 2400)
    }
}

const routeStats = computed(() => [
    { label: 'Stop', value: currentStop.value?.stopNumber ? String(currentStop.value.stopNumber).padStart(2, '0') : '--' },
    { label: 'Distance', value: stopDistance.value || '--' },
    { label: 'ETA', value: etaLabel.value || '--:--' },
])

let hasAutoOpened = false

onMounted(() => {
    ensureRouteContext()

    if (!hasAutoOpened && currentStop.value) {
        hasAutoOpened = true
        setTimeout(() => {
            openMaps()
        }, 150)
    }
})
</script>
