<template>
    <div class="screen-layout"
        :class="isDark ? 'bg-background-dark text-white' : 'bg-background-light text-gray-900'">

        <!-- ── HEADER ───────────────────────────────── -->
        <header class="flex-shrink-0 px-5 pt-6 pb-4 border-b" :class="isDark ? 'border-white/5' : 'border-gray-100'">
            <div class="flex items-center justify-between mb-3">
                <button @click="$router.back()" class="w-10 h-10 rounded-full flex items-center justify-center border"
                    :class="isDark ? 'bg-surface-dark border-white/5 text-gray-400' : 'bg-white border-gray-200 shadow-sm'">
                    <span class="material-icons text-xl">arrow_back</span>
                </button>
                <div class="flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider"
                    :class="isDark ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-primary/10 border-primary/30 text-primary'">
                    Step 4 of 5
                </div>
            </div>
            <h1 class="text-2xl font-black tracking-tight">Select Job Type</h1>
            <p class="text-xs mt-1" :class="isDark ? 'text-gray-400' : 'text-gray-500'">
                Choose your assignment for today's shift
            </p>
        </header>

        <!-- ── SCROLLABLE BODY ───────────────────────── -->
        <div class="screen-body flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-4">

            <!-- Ambient glow -->
            <div class="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
                <div class="w-80 h-80 rounded-full blur-[140px] opacity-20"
                    :class="isDark ? 'bg-primary/30' : 'bg-primary/10'"></div>
            </div>

            <!-- Job Type Cards -->
            <button v-for="job in jobOptions" :key="job.type" @click="selectJob(job)"
                class="relative w-full h-auto shrink-0 block rounded-3xl p-5 border text-left transition-all active:scale-[0.97] group overflow-hidden"
                :class="isDark
                    ? 'bg-surface-dark/40 border-white/8 hover:border-white/15'
                    : 'bg-white border-gray-100 shadow-sm hover:shadow-lg'">

                <!-- Background glow -->
                <div class="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
                    <div class="absolute top-0 right-0 w-36 h-36 rounded-full blur-3xl opacity-0 group-hover:opacity-30 transition-opacity duration-500"
                        :class="job.glow"></div>
                </div>

                <div class="relative flex items-start gap-4">
                    <!-- Icon -->
                    <div class="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ring-2 ring-offset-2"
                        :class="[job.iconBg, job.ring, 'ring-offset-transparent']">
                        <span class="material-icons text-2xl" :class="job.iconColor">{{ job.icon }}</span>
                    </div>

                    <!-- Text -->
                    <div class="flex-1 min-w-0">
                        <h3 class="text-lg font-black tracking-tight">{{ job.label }}</h3>
                        <p class="text-xs mt-1 leading-relaxed"
                            :class="isDark ? 'text-gray-400' : 'text-gray-500'">
                            {{ job.description }}
                        </p>

                        <!-- Feature chips -->
                        <div class="flex flex-wrap gap-1.5 mt-3">
                            <span v-for="chip in job.chips" :key="chip"
                                class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border"
                                :class="isDark
                                    ? `${job.chipBg} ${job.chipText} border-transparent`
                                    : `${job.chipBgLight} ${job.chipTextLight} border-transparent`">
                                {{ chip }}
                            </span>
                        </div>
                    </div>

                    <!-- Arrow -->
                    <span class="material-icons text-lg mt-1 opacity-30 group-hover:opacity-60 transition-opacity"
                        :class="isDark ? 'text-gray-400' : 'text-gray-500'">
                        arrow_forward_ios
                    </span>
                </div>
            </button>

            <!-- Loading & Empty States -->
            <div v-if="loading" class="shrink-0 p-8 text-center flex flex-col items-center justify-center">
                <div class="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                <p class="text-sm font-semibold" :class="isDark ? 'text-gray-400' : 'text-gray-500'">Connecting to dispatch...</p>
            </div>
            <div v-else-if="jobOptions.length === 0" class="shrink-0 p-8 border rounded-3xl text-center"
                 :class="isDark ? 'bg-surface-dark/30 border-white/5' : 'bg-gray-50 border-gray-100'">
                <div class="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-3"
                     :class="isDark ? 'bg-white/5' : 'bg-white shadow-sm'">
                     <span class="material-icons text-3xl" :class="isDark ? 'text-gray-600' : 'text-gray-400'">inbox</span>
                </div>
                <h3 class="text-lg font-black mb-1">No Active Assignments</h3>
                <p class="text-xs" :class="isDark ? 'text-gray-400' : 'text-gray-500'">You currently have no jobs assigned for this shift.</p>
                <button @click="$router.push('/dashboard')" class="mt-5 px-6 py-2.5 rounded-full bg-primary text-background-dark font-bold text-sm">
                    Return to Dashboard
                </button>
            </div>

            <!-- Info Card -->
            <div class="shrink-0 rounded-xl p-3 border flex items-start gap-3 mt-2"
                :class="isDark ? 'bg-surface-dark/30 border-white/5' : 'bg-gray-50 border-gray-100'">
                <span class="material-icons text-primary text-base flex-shrink-0 mt-0.5">info</span>
                <p class="text-xs leading-relaxed" :class="isDark ? 'text-gray-400' : 'text-gray-500'">
                    Your workflow, navigation, and screens are loaded from the live assignment type returned by dispatch.
                </p>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUiStore } from '../stores/uiStore.js'
import { useDriverStore } from '../stores/driverStore.js'
import { useJobStore } from '../stores/jobStore.js'

const router = useRouter()
const uiStore = useUiStore()
const driverStore = useDriverStore()
const jobStore = useJobStore()
const isDark = computed(() => uiStore.theme !== 'light')

const jobOptions = ref([])
const loading = ref(true)

onMounted(async () => {
    loading.value = true
    try {
        const jobs = await jobStore.fetchAssignedOrders()
        if (jobs && jobs.length > 0) {
            jobOptions.value = jobs.map(job => {
                const isHouseShift = job.jobType === 'HOUSE_SHIFT'
                const isPickup = job.jobType === 'PARCEL_PICKUP'
                return {
                    type: job.jobType,
                    label: isHouseShift ? 'House Shifting' : (isPickup ? 'Parcel Pickup' : 'Parcel Delivery'),
                    description: `Assigned Job: ${job.id}. ${job.stops.length} stop(s). Route ending at ${job.deliveryAddr}.`,
                    icon: isHouseShift ? 'moving' : (isPickup ? 'assignment_return' : 'local_shipping'),
                    iconBg: isHouseShift ? 'bg-purple-500/15' : (isPickup ? 'bg-blue-500/15' : 'bg-green-500/15'),
                    iconColor: isHouseShift ? 'text-purple-400' : (isPickup ? 'text-blue-400' : 'text-green-400'),
                    ring: isHouseShift ? 'ring-purple-500/30' : (isPickup ? 'ring-blue-500/30' : 'ring-green-500/30'),
                    glow: isHouseShift ? 'bg-purple-500' : (isPickup ? 'bg-blue-500' : 'bg-green-500'),
                    chips: isHouseShift ? ['Crew', 'Inventory'] : ['Manifest', 'POD'],
                    chipBg: isHouseShift ? 'bg-purple-500/15' : 'bg-green-500/15',
                    chipText: isHouseShift ? 'text-purple-400' : 'text-green-400',
                    chipBgLight: isHouseShift ? 'bg-purple-100' : 'bg-green-100',
                    chipTextLight: isHouseShift ? 'text-purple-700' : 'text-green-700',
                    data: job,
                    nextRoute: '/job-assignment'
                }
            })
        }
    } finally {
        loading.value = false
    }
})

function selectJob(job) {
    // Load the job into the store
    jobStore.loadJob(job.data)

    // Mark job type as selected in driver flow
    driverStore.jobTypeSelected = true

    uiStore.showToast(`Active job selected`, 'success', 1500)

    router.push(job.nextRoute)
}
</script>
