<template>
    <div class="screen-layout" :class="isDark ? 'bg-background-dark text-white' : 'bg-background-light text-gray-900'">

        <!-- Animated Success Background -->
        <div class="absolute inset-0 z-0 flex items-center justify-center pointer-events-none overflow-hidden">
            <div class="w-96 h-96 rounded-full blur-3xl opacity-20 animate-pulse"
                :class="jobBgGlow"></div>
        </div>

        <div class="relative z-10 flex flex-col items-center justify-between h-full px-6 py-12">

            <!-- Success Animation -->
            <div class="flex-1 flex flex-col items-center justify-center text-center">
                <div class="w-24 h-24 rounded-full flex items-center justify-center mb-6 shadow-2xl"
                    :class="jobBgColor">
                    <span class="material-icons text-white text-5xl">check</span>
                </div>
                <p class="text-xs uppercase font-bold tracking-widest mb-2" :class="jobTextColor">Job Complete</p>
                <h1 class="text-3xl font-black mb-2">Excellent Work! 🎉</h1>
                <p class="text-lg font-semibold" :class="isDark ? 'text-gray-400' : 'text-gray-600'">
                    {{ jobStore.jobTypeLabel }} completed
                </p>
                <p class="text-sm mt-1" :class="isDark ? 'text-gray-500' : 'text-gray-400'">
                    {{ jobStore.jobData?.jobId }}
                </p>
            </div>

            <!-- Job Summary Card -->
            <div class="w-full rounded-3xl border p-5 mb-6"
                :class="isDark ? 'bg-surface-dark/60 border-white/10' : 'bg-white border-gray-100 shadow-xl'">
                <p class="text-xs uppercase tracking-wider font-bold mb-4"
                    :class="isDark ? 'text-gray-400' : 'text-gray-500'">Job Summary</p>
                <div class="grid grid-cols-2 gap-3">
                    <div v-for="stat in completionStats" :key="stat.label"
                        class="rounded-2xl p-3.5 border text-center"
                        :class="isDark ? 'bg-black/20 border-white/5' : 'bg-gray-50 border-gray-100'">
                        <span class="material-icons text-xl mb-1 block" :class="stat.color">{{ stat.icon }}</span>
                        <p class="text-xl font-black">{{ stat.value }}</p>
                        <p class="text-[10px] uppercase font-semibold mt-0.5"
                            :class="isDark ? 'text-gray-500' : 'text-gray-400'">{{ stat.label }}</p>
                    </div>
                </div>
            </div>

            <!-- Rating Prompt -->
            <div class="w-full rounded-2xl border p-4 mb-4"
                :class="isDark ? 'bg-surface-dark/40 border-white/8' : 'bg-white border-gray-100 shadow-sm'">
                <p class="text-sm font-semibold mb-3 text-center"
                    :class="isDark ? 'text-gray-300' : 'text-gray-700'">
                    How was this job?
                </p>
                <div class="flex justify-center gap-3">
                    <button v-for="star in 5" :key="star" @click="selectedRating = star"
                        class="w-10 h-10 flex items-center justify-center transition-transform active:scale-90">
                        <span class="material-icons text-3xl"
                            :class="star <= selectedRating ? 'text-accent-gold' : isDark ? 'text-gray-700' : 'text-gray-300'">
                            star
                        </span>
                    </button>
                </div>
                <input v-model="feedbackNote" type="text" placeholder="Feedback note (optional)..."
                    class="w-full mt-3 rounded-xl px-3 py-2.5 text-sm border outline-none focus:ring-2 focus:ring-primary/50"
                    :class="isDark ? 'bg-black/20 border-white/10 text-white placeholder-gray-600' : 'bg-gray-50 border-gray-200'" />
            </div>

            <!-- Return to Dashboard -->
            <div class="w-full flex flex-col gap-3">
                <button @click="returnToDashboard"
                    class="w-full rounded-2xl h-14 flex items-center justify-center gap-3 relative overflow-hidden shadow-glow active:scale-[0.98] transition-transform">
                    <div class="absolute inset-0 bg-gradient-to-r from-primary to-primary-dark"></div>
                    <span class="relative material-icons text-2xl text-background-dark">home</span>
                    <span class="relative text-lg font-black uppercase tracking-wide text-background-dark">Return to Dashboard</span>
                </button>
                <button @click="viewAuditLog"
                    class="w-full rounded-xl h-10 flex items-center justify-center gap-2 border"
                    :class="isDark ? 'border-white/10 text-gray-400' : 'border-gray-200 text-gray-500'">
                    <span class="material-icons text-sm">receipt_long</span>
                    <span class="text-xs font-semibold">View Audit Log</span>
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useJobStore } from '../stores/jobStore.js'
import { useUiStore } from '../stores/uiStore.js'

const router = useRouter()
const jobStore = useJobStore()
const uiStore = useUiStore()
const isDark = computed(() => uiStore.theme !== 'light')
const selectedRating = ref(5)
const feedbackNote = ref('')

const jobBgColor = computed(() => ({
    'PARCEL_DELIVERY': 'bg-green-500',
    'PARCEL_PICKUP': 'bg-blue-500',
    'HOUSE_SHIFT': 'bg-purple-500',
})[jobStore.jobType] || 'bg-primary')

const jobBgGlow = computed(() => ({
    'PARCEL_DELIVERY': 'bg-green-500',
    'PARCEL_PICKUP': 'bg-blue-500',
    'HOUSE_SHIFT': 'bg-purple-500',
})[jobStore.jobType] || 'bg-primary')

const jobTextColor = computed(() => ({
    'PARCEL_DELIVERY': 'text-green-400',
    'PARCEL_PICKUP': 'text-blue-400',
    'HOUSE_SHIFT': 'text-purple-400',
})[jobStore.jobType] || 'text-primary')

// Compute duration from state history
const jobDuration = computed(() => {
    const history = jobStore.stateHistory
    if (history.length < 2) return '~3h'
    const start = new Date(history[0].timestamp)
    const end = new Date(history[history.length - 1].timestamp)
    const mins = Math.round((end - start) / 1000 / 60)
    if (mins < 60) return `${mins}m`
    return `${Math.floor(mins / 60)}h ${mins % 60}m`
})

const completionStats = computed(() => {
    const job = jobStore.jobData
    if (!job) return []

    if (jobStore.jobType === 'HOUSE_SHIFT') {
        return [
            { label: 'Duration', icon: 'schedule', color: 'text-primary', value: jobDuration.value },
            { label: 'Crew', icon: 'group', color: 'text-accent-blue', value: job.crewRequired || 0 },
            { label: 'Items Moved', icon: 'inventory', color: 'text-purple-400', value: job.inventory?.length || 0 },
            { label: 'Earned', icon: 'payments', color: 'text-accent-gold', value: `₹2.4K` },
        ]
    } else {
        return [
            { label: 'Stops', icon: 'place', color: 'text-primary', value: job.stops?.length || 0 },
            { label: 'Duration', icon: 'schedule', color: 'text-accent-blue', value: jobDuration.value },
            { label: 'Distance', icon: 'timeline', color: 'text-green-400', value: `${job.routeDistance || 47} km` },
            { label: 'Earned', icon: 'payments', color: 'text-accent-gold', value: '₹1.8K' },
        ]
    }
})

function returnToDashboard() {
    jobStore.reset()
    router.push('/dashboard')
}

function viewAuditLog() {
    router.push('/audit')
}
</script>
