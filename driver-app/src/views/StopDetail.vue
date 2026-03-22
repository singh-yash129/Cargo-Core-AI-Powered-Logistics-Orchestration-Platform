<template>
    <div class="screen-layout" :class="isDark ? 'bg-background-dark text-white' : 'bg-background-light text-gray-900'">

        <!-- ── HEADER ───────────────────────────────── -->
        <header class="flex-shrink-0 px-5 pt-5 pb-4 border-b" :class="isDark ? 'border-white/5' : 'border-gray-100'">
            <div class="flex items-center gap-3 mb-2">
                <button @click="$router.back()"
                    class="w-10 h-10 rounded-full flex items-center justify-center border flex-shrink-0"
                    :class="isDark ? 'bg-surface-dark border-white/5 text-gray-400' : 'bg-white border-gray-200 shadow-sm'">
                    <span class="material-icons text-xl">arrow_back</span>
                </button>
                <div>
                    <span
                        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border mb-1"
                        :class="typeBadgeClass(stop.type)">{{ stop.type }}</span>
                    <h1 class="text-xl font-black leading-tight">{{ stop.customerName }}</h1>
                </div>
            </div>
            <!-- Map preview (in header as accent) -->
            <div class="h-28 rounded-2xl overflow-hidden border relative"
                :class="isDark ? 'border-white/5' : 'border-gray-100'">
                <img src="https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&q=80" alt="Map"
                    class="w-full h-full object-cover opacity-50 grayscale" />
                <div class="absolute inset-0"
                    :class="isDark ? 'bg-gradient-to-t from-background-dark/80 to-transparent' : 'bg-gradient-to-t from-background-light/80 to-transparent'">
                </div>
                <div class="absolute bottom-2 left-3 right-3 flex items-end justify-between">
                    <div>
                        <p class="text-xs font-bold">{{ stop.distance }} away · ETA 12 min</p>
                    </div>
                    <button @click="$router.push('/navigation')"
                        class="bg-primary text-background-dark text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1">
                        <span class="material-icons text-sm">near_me</span> Navigate
                    </button>
                </div>
            </div>
        </header>

        <!-- ── SCROLLABLE BODY ───────────────────────── -->
        <div class="screen-body px-5 py-4 flex flex-col gap-3">

            <!-- Order Details -->
            <div class="rounded-2xl p-4 border"
                :class="isDark ? 'bg-surface-dark/30 border-white/5' : 'bg-white border-gray-100 shadow-sm'">
                <h3 class="text-xs font-bold uppercase tracking-widest mb-3"
                    :class="isDark ? 'text-gray-400' : 'text-gray-500'">Order Details</h3>
                <div class="space-y-2.5">
                    <div v-for="row in orderDetails" :key="row.label" class="flex justify-between text-sm">
                        <span :class="isDark ? 'text-gray-400' : 'text-gray-500'">{{ row.label }}</span>
                        <span class="font-semibold" :class="row.highlight ? 'text-primary' : ''">{{ row.value }}</span>
                    </div>
                </div>
            </div>

            <!-- Packages -->
            <div v-if="stop.packages?.length" class="rounded-2xl p-4 border"
                :class="isDark ? 'bg-surface-dark/30 border-white/5' : 'bg-white border-gray-100 shadow-sm'">
                <h3 class="text-xs font-bold uppercase tracking-widest mb-3"
                    :class="isDark ? 'text-gray-400' : 'text-gray-500'">Packages ({{ stop.packages.length }})</h3>
                <div class="space-y-2">
                    <div v-for="pkg in stop.packages" :key="pkg.id"
                        class="flex items-center gap-3 p-3 rounded-xl border"
                        :class="isDark ? 'bg-black/20 border-white/5' : 'bg-gray-50 border-gray-100'">
                        <span class="material-icons text-primary">inventory_2</span>
                        <div class="flex-1 min-w-0">
                            <p class="text-sm font-semibold truncate">{{ pkg.description }}</p>
                            <p class="text-[10px] font-mono" :class="isDark ? 'text-gray-500' : 'text-gray-400'">{{
                                pkg.barcode }} · {{ pkg.weight }}</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Move Items -->
            <div v-if="stop.moveItems?.length" class="rounded-2xl p-4 border"
                :class="isDark ? 'bg-accent-purple/10 border-accent-purple/20' : 'bg-purple-50 border-purple-100'">
                <h3 class="text-xs font-bold uppercase tracking-widest mb-3 text-accent-purple">Move Items</h3>
                <div class="flex flex-wrap gap-2">
                    <span v-for="item in stop.moveItems" :key="item"
                        class="text-xs font-semibold px-3 py-1.5 rounded-full border border-accent-purple/30 bg-accent-purple/10 text-accent-purple">{{
                        item }}</span>
                </div>
            </div>

            <!-- Special Instructions -->
            <div v-if="stop.specialInstructions" class="rounded-xl p-4 border flex items-start gap-3"
                :class="isDark ? 'bg-signal-amber/8 border-signal-amber/20' : 'bg-amber-50 border-amber-200'">
                <span class="material-icons text-signal-amber text-lg flex-shrink-0">info</span>
                <div>
                    <p class="text-xs font-bold text-signal-amber uppercase tracking-wide mb-1">Special Instructions</p>
                    <p class="text-sm" :class="isDark ? 'text-gray-300' : 'text-gray-700'">{{ stop.specialInstructions
                        }}</p>
                </div>
            </div>
        </div>

        <!-- ── STICKY FOOTER ────────────────────────── -->
        <div class="screen-footer px-5 py-4 border-t flex flex-col gap-2"
            :class="isDark ? 'border-white/5 bg-background-dark' : 'border-gray-100 bg-background-light'">
            <button @click="startDelivery"
                class="w-full rounded-2xl h-13 flex items-center justify-center gap-2 font-bold text-background-dark shadow-glow active:scale-[0.98]"
                style="background: linear-gradient(135deg, #1CE783, #15b86a); height: 52px;">
                <span class="material-icons">navigation</span>
                Start Delivery
            </button>
            <button v-if="stop.cod" @click="$router.push('/cod/' + stop.id)"
                class="w-full rounded-2xl flex items-center justify-center gap-2 font-bold text-signal-amber border border-signal-amber/30 active:scale-[0.98]"
                :class="isDark ? 'bg-signal-amber/10' : 'bg-amber-50'" style="height: 44px;">
                <span class="material-icons">payments</span>
                Collect ₹{{ stop.codAmount }} COD
            </button>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUiStore } from '../stores/uiStore.js'
import { useJobStore } from '../stores/jobStore.js'
import { dummyStops } from '../utils/dummyData.js'

const route = useRoute()
const router = useRouter()
const uiStore = useUiStore()
const jobStore = useJobStore()
const isDark = computed(() => uiStore.theme !== 'light')

const stop = computed(() => dummyStops.find(s => s.id === route.params.id) || dummyStops[0])

const orderDetails = computed(() => [
    { label: 'Service Type', value: stop.value.serviceType },
    { label: 'Time Window', value: stop.value.timeWindow, highlight: true },
    { label: 'Stop Number', value: `#${stop.value.stopNumber}` },
    { label: 'Distance', value: stop.value.distance },
    ...(stop.value.cod ? [{ label: 'COD Amount', value: `₹${stop.value.codAmount}`, highlight: true }] : []),
])

function typeBadgeClass(type) {
    const map = { express: 'bg-accent-gold/10 text-accent-gold border-accent-gold/20', move: 'bg-accent-purple/10 text-accent-purple border-accent-purple/20', pickup: 'bg-orange-500/10 text-orange-400 border-orange-500/20', parcel: 'bg-accent-blue/10 text-accent-blue border-accent-blue/20' }
    return map[type] || 'bg-gray-500/10 text-gray-400 border-gray-500/20'
}

function startDelivery() {
    if (jobStore.jobType === 'PARCEL_PICKUP') {
        router.push('/pickup-arrival/' + stop.value.id)
    } else {
        router.push('/geofence-arrival/' + stop.value.id)
    }
}
</script>
