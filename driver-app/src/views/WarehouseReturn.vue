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
                    <h1 class="text-2xl font-black tracking-tight">Return to Warehouse</h1>
                    <p class="text-xs" :class="isDark ? 'text-gray-400' : 'text-gray-500'">Navigate back to unload</p>
                </div>
            </div>
        </header>

        <!-- ── SCROLLABLE BODY ───────────────────────── -->
        <div class="screen-body px-5 py-4 flex flex-col gap-4">

            <!-- Warehouse Location Card -->
            <div class="rounded-3xl p-6 border text-center relative overflow-hidden"
                :class="isDark ? 'bg-surface-dark/60 border-white/10' : 'bg-white border-gray-100 shadow-xl'">
                <div class="absolute top-0 right-0 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl"></div>
                <div class="relative">
                    <div class="w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4"
                        :class="isDark ? 'bg-blue-500/15' : 'bg-blue-50'">
                        <span class="material-icons text-5xl text-blue-400">warehouse</span>
                    </div>
                    <h2 class="font-black text-xl mb-2">{{ warehouse.name }}</h2>
                    <p class="text-sm mb-4" :class="isDark ? 'text-gray-400' : 'text-gray-500'">{{ warehouse.address }}</p>

                    <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold"
                        :class="isInTransit ? 'bg-yellow-500/15 text-yellow-400' : 'bg-gray-500/15 text-gray-400'">
                        <span class="relative w-2 h-2 flex" v-if="isInTransit">
                            <span class="absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75 animate-ping"></span>
                            <span class="relative inline-flex rounded-full h-2 w-2 bg-yellow-400"></span>
                        </span>
                        <span class="material-icons text-base" v-else>location_on</span>
                        {{ isInTransit ? 'IN TRANSIT' : 'WAITING TO START' }}
                    </div>
                </div>
            </div>

            <!-- Pickup Summary -->
            <div class="rounded-2xl p-5 border"
                :class="isDark ? 'bg-surface-dark/40 border-white/8' : 'bg-white border-gray-100 shadow-sm'">
                <h3 class="text-xs font-black uppercase tracking-wider text-primary mb-4">Pickup Summary</h3>
                <div class="space-y-3">
                    <div v-for="(stop, idx) in jobStore.jobData.stops" :key="stop.id"
                        class="flex items-center gap-3 p-3 rounded-xl"
                        :class="isDark ? 'bg-black/20' : 'bg-gray-50'">
                        <div class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                            :class="stop.signature ? 'bg-green-500/15' : 'bg-gray-500/15'">
                            <span class="material-icons text-sm"
                                :class="stop.signature ? 'text-green-400' : 'text-gray-400'">
                                {{ stop.signature ? 'check_circle' : 'pending' }}
                            </span>
                        </div>
                        <div class="flex-1">
                            <p class="font-bold text-sm">{{ stop.customerName }}</p>
                            <p class="text-xs" :class="isDark ? 'text-gray-400' : 'text-gray-500'">
                                {{ stop.itemsScanned?.length || 0 }} items collected
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Distance/ETA Info (Simulated) -->
            <div class="rounded-2xl p-4 border"
                :class="isDark ? 'bg-surface-dark/30 border-white/5' : 'bg-gray-50 border-gray-100'">
                <div class="grid grid-cols-3 gap-3 text-center">
                    <div>
                        <p class="text-2xl font-black text-primary">12.5</p>
                        <p class="text-[10px] font-semibold uppercase tracking-wider" :class="isDark ? 'text-gray-400' : 'text-gray-500'">
                            km away
                        </p>
                    </div>
                    <div>
                        <p class="text-2xl font-black text-primary">18</p>
                        <p class="text-[10px] font-semibold uppercase tracking-wider" :class="isDark ? 'text-gray-400' : 'text-gray-500'">
                            min ETA
                        </p>
                    </div>
                    <div>
                        <p class="text-2xl font-black text-primary">{{ totalItems }}</p>
                        <p class="text-[10px] font-semibold uppercase tracking-wider" :class="isDark ? 'text-gray-400' : 'text-gray-500'">
                            total items
                        </p>
                    </div>
                </div>
            </div>

        </div>

        <!-- ── STICKY FOOTER ────────────────────────── -->
        <div class="screen-footer px-5 py-4 border-t"
            :class="isDark ? 'border-white/5 bg-background-dark' : 'border-gray-100 bg-background-light'">
            <button @click="startReturn" v-if="!isInTransit"
                class="w-full rounded-2xl h-14 flex items-center justify-center gap-2 font-bold text-lg active:scale-[0.98] transition-all bg-blue-500 text-white shadow-xl">
                <span class="material-icons">navigation</span>
                Start Navigation to Warehouse
            </button>
            <button @click="arrivedAtWarehouse" v-else :disabled="!canMarkArrived"
                class="w-full rounded-2xl h-14 flex items-center justify-center gap-2 font-bold text-lg active:scale-[0.98] transition-all"
                :class="canMarkArrived
                    ? 'bg-green-500 text-white shadow-xl'
                    : isDark ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-gray-100 text-gray-400 cursor-not-allowed'">
                <span class="material-icons">{{ canMarkArrived ? 'check' : 'lock' }}</span>
                {{ canMarkArrived ? 'Arrived at Warehouse' : 'Get within 50m to continue' }}
            </button>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useJobStore } from '../stores/jobStore.js'
import { useUiStore } from '../stores/uiStore.js'
import { useGpsTracking } from '../composables/useGpsTracking.js'

const router = useRouter()
const jobStore = useJobStore()
const uiStore = useUiStore()
const isDark = computed(() => uiStore.theme !== 'light')

const isInTransit = ref(false)
const canMarkArrived = ref(false)
let arrivalTimer = null

const warehouse = computed(() => jobStore.jobData.warehouseLocation || {
    name: 'Mumbai Central Warehouse',
    address: 'Gate 5, Goregaon East, Mumbai 400063'
})

const totalItems = computed(() => {
    if (!jobStore.jobData.stops) return 0
    return jobStore.jobData.stops.reduce((sum, stop) => {
        return sum + (stop.itemsScanned?.length || 0)
    }, 0)
})

const gps = useGpsTracking()

onMounted(() => {
    // Check if already in transit state
    if (jobStore.jobState === 'RETURN_TRANSIT') {
        isInTransit.value = true
        gps.startTracking(true)
        // Simulate arrival after 10 seconds for demo
        arrivalTimer = setTimeout(() => {
            canMarkArrived.value = true
        }, 10000)
    }
})

onUnmounted(() => {
    if (arrivalTimer) clearTimeout(arrivalTimer)
    gps.stopTracking()
})

async function startReturn() {
    try {
        await jobStore.transition('RETURN_TRANSIT')
        isInTransit.value = true
        gps.startTracking(true)
        uiStore.showToast('Navigation started to warehouse', 'success', 2000)

        // Simulate arrival after 10 seconds for demo
        arrivalTimer = setTimeout(() => {
            canMarkArrived.value = true
            uiStore.showToast('Approaching warehouse', 'info', 2000)
        }, 10000)
    } catch (e) {
        uiStore.showToast(e.message, 'error', 2000)
    }
}

async function arrivedAtWarehouse() {
    if (!canMarkArrived.value) return

    try {
        await jobStore.transition('WAREHOUSE_ARRIVAL', {
            arrivedAt: new Date().toISOString(),
            location: gps.currentLocation.value
        })
        gps.stopTracking()
        router.push('/unload-verification')
    } catch (e) {
        uiStore.showToast(e.message, 'error', 2000)
    }
}
</script>
