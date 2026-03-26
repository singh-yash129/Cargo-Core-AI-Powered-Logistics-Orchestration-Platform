<template>
    <!-- Job Type Selector - For Demo/Testing -->
    <div class="fixed top-20 right-4 z-[9999]" v-if="showSelector">
        <div class="rounded-2xl border p-4 shadow-2xl backdrop-blur-xl"
            :class="isDark ? 'bg-surface-dark/95 border-white/10' : 'bg-white/95 border-gray-200'">
            <div class="flex items-center justify-between mb-3">
                <span class="text-xs font-bold uppercase tracking-wider"
                    :class="isDark ? 'text-gray-400' : 'text-gray-500'">Demo Mode</span>
                <button @click="showSelector = false" class="text-gray-500 hover:text-gray-700">
                    <span class="material-icons text-sm">close</span>
                </button>
            </div>
            <div class="space-y-2">
                <button v-for="type in jobTypes" :key="type.value" @click="selectJobType(type.value)"
                    class="w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold transition-all"
                    :class="jobStore.jobType === type.value
                        ? `${type.bgActive} ${type.textActive} border-2 ${type.borderActive}`
                        : isDark ? 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 border-2 border-transparent' : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border-2 border-transparent'">
                    <div class="flex items-center gap-2">
                        <span class="material-icons text-base">{{ type.icon }}</span>
                        {{ type.label }}
                    </div>
                </button>
                <button @click="resetJob"
                    class="w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold transition-all border-2"
                    :class="isDark ? 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20' : 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'">
                    <div class="flex items-center gap-2">
                        <span class="material-icons text-base">restart_alt</span>
                        Reset Job
                    </div>
                </button>
            </div>
        </div>
    </div>

    <!-- Floating Toggle Button -->
    <button @click="showSelector = !showSelector"
        class="fixed bottom-24 right-4 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center z-[9998] border-2"
        :class="isDark ? 'bg-primary border-primary/30 text-background-dark' : 'bg-primary border-primary/30 text-white'">
        <span class="material-icons">{{ showSelector ? 'close' : 'science' }}</span>
    </button>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useJobStore } from '../stores/jobStore.js'
import { useUiStore } from '../stores/uiStore.js'
import { dummyParcelDeliveryJob, dummyParcelPickupJob, dummyHouseShiftJob } from '../utils/dummyData.js'

const jobStore = useJobStore()
const uiStore = useUiStore()
const isDark = computed(() => uiStore.theme !== 'light')
const showSelector = ref(false)

const jobTypes = [
    {
        value: 'PARCEL_DELIVERY',
        label: 'Parcel Delivery',
        icon: 'local_shipping',
        bgActive: 'bg-green-500/20',
        textActive: 'text-green-400',
        borderActive: 'border-green-500/40'
    },
    {
        value: 'PARCEL_PICKUP',
        label: 'Parcel Pickup',
        icon: 'assignment_return',
        bgActive: 'bg-blue-500/20',
        textActive: 'text-blue-400',
        borderActive: 'border-blue-500/40'
    },
    {
        value: 'HOUSE_SHIFT',
        label: 'House Shift',
        icon: 'moving',
        bgActive: 'bg-purple-500/20',
        textActive: 'text-purple-400',
        borderActive: 'border-purple-500/40'
    }
]

function selectJobType(type) {
    const jobData = {
        'PARCEL_DELIVERY': dummyParcelDeliveryJob,
        'PARCEL_PICKUP': dummyParcelPickupJob,
        'HOUSE_SHIFT': dummyHouseShiftJob
    }

    jobStore.loadJob(jobData[type])
    uiStore.showToast(`${jobTypes.find(j => j.value === type).label} job loaded`, 'success', 2000)
    showSelector.value = false
}

function resetJob() {
    jobStore.reset()
    uiStore.showToast('Job reset - select job type to continue', 'info', 2000)
    showSelector.value = false
}
</script>
