<template>
    <div class="screen-layout" :class="isDark ? 'bg-background-dark text-white' : 'bg-background-light text-gray-900'">

        <!-- ── HEADER ───────────────────────────────── -->
        <header class="flex-shrink-0 px-5 pt-5 pb-4 border-b relative overflow-hidden" :class="isDark ? 'border-white/5' : 'border-gray-100'">
            <!-- Background Glow -->
            <div class="absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl opacity-20 pointer-events-none"
                :class="isDark ? 'bg-primary/30' : 'bg-primary/20'"></div>

            <div class="flex items-center justify-between mb-3 relative z-10">
                <button @click="$router.back()" class="w-10 h-10 rounded-full flex items-center justify-center border transition-all active:scale-95"
                    :class="isDark ? 'bg-surface-dark border-white/5 text-gray-400 hover:border-white/10' : 'bg-white border-gray-200 shadow-sm hover:shadow'">
                    <span class="material-icons text-xl">arrow_back</span>
                </button>
                <div class="flex items-center gap-2">
                    <!-- Live Sync Indicator -->
                    <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] font-bold"
                        :class="isDark ? 'bg-surface-dark/50 border-white/5 text-gray-400' : 'bg-white border-gray-200 text-gray-500'">
                        <span class="relative flex h-2 w-2">
                            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span class="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                        </span>
                        LIVE SYNC
                    </div>
                    <!-- Attendance Badge -->
                    <span class="text-xs font-black px-3 py-1.5 rounded-full border flex items-center gap-1.5"
                        :class="isDark ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-primary/10 border-primary/30 text-primary'">
                        <span class="material-icons text-xs">group</span>
                        {{ clockedIn }} / {{ crew.length }}
                    </span>
                </div>
            </div>
            <div class="relative z-10">
                <p class="text-xs font-black uppercase tracking-widest text-primary mb-1 flex items-center gap-2">
                    <span class="material-icons text-sm">groups</span>
                    Crew Management
                </p>
                <h1 class="text-3xl font-black tracking-tight mb-1">Your Team</h1>
                <div class="flex items-center gap-2 mt-1.5">
                    <div class="flex items-center gap-1.5 text-xs" :class="isDark ? 'text-gray-400' : 'text-gray-500'">
                        <span class="material-icons text-sm">location_on</span>
                        <span class="font-semibold">{{ jobStore.jobData?.sourceLocation?.address?.split(',').slice(0, 2).join(', ') || 'Assigned location' }}</span>
                    </div>
                    <span :class="isDark ? 'text-gray-700' : 'text-gray-300'">•</span>
                    <div class="flex items-center gap-1.5 text-xs" :class="isDark ? 'text-gray-400' : 'text-gray-500'">
                        <span class="material-icons text-sm">local_shipping</span>
                        <span class="font-semibold">{{ jobStore.jobTypeLabel || 'House Shift' }}</span>
                    </div>
                </div>
            </div>
        </header>

        <!-- ── REPORT MODAL ───────────────────────── -->
        <Transition name="fade-scale">
            <div v-if="reportModal" class="fixed inset-0 z-[100] flex items-center justify-center px-6"
                :class="isDark ? 'bg-background-dark/90' : 'bg-background-light/90'" style="backdrop-filter: blur(8px);"
                @click.self="closeReportModal">
                <div class="w-full max-w-sm rounded-3xl p-6 border flex flex-col gap-4"
                    :class="isDark ? 'bg-surface-dark border-white/10' : 'bg-white border-gray-200 shadow-xl'">

                    <div class="text-center mb-2">
                        <div class="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-3"
                            :class="isDark ? 'bg-red-500/15' : 'bg-red-500/10'">
                            <span class="material-icons text-red-500 text-2xl">warning</span>
                        </div>
                        <h3 class="text-lg font-black">Report Exception</h3>
                        <p class="text-xs mt-1" :class="isDark ? 'text-gray-400' : 'text-gray-500'">
                            Reporting issue for {{ selectedMember?.name }}
                        </p>
                    </div>

                    <div class="space-y-2">
                        <label v-for="reason in reportReasons" :key="reason" @click="reportReason = reason"
                            class="flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all active:scale-[0.98]"
                            :class="reportReason === reason
                                ? isDark ? 'border-primary bg-primary/10' : 'border-primary bg-primary/5'
                                : isDark ? 'border-white/5 bg-surface-dark/30 hover:border-white/10' : 'border-gray-100 bg-gray-50 hover:bg-white'">
                            <input type="radio" :value="reason" v-model="reportReason" class="hidden" />
                            <div class="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors"
                                :class="reportReason === reason ? 'border-primary' : isDark ? 'border-gray-600' : 'border-gray-300'">
                                <div v-if="reportReason === reason" class="w-2.5 h-2.5 rounded-full bg-primary"></div>
                            </div>
                            <span class="text-sm font-semibold">{{ reason }}</span>
                        </label>
                    </div>

                    <div class="flex gap-3 mt-2">
                        <button @click="closeReportModal"
                            class="flex-1 py-3.5 rounded-2xl font-semibold text-sm border active:scale-[0.97] transition-all"
                            :class="isDark ? 'border-white/10 text-white/60 hover:bg-white/5' : 'border-gray-200 text-gray-500 hover:bg-gray-50'">
                            Cancel
                        </button>
                        <button @click="submitReport" :disabled="!reportReason"
                            class="flex-[2] py-3.5 rounded-2xl font-bold text-sm active:scale-[0.97] transition-all"
                            :class="reportReason
                                ? 'bg-primary text-background-dark shadow-glow'
                                : isDark ? 'bg-gray-700 text-gray-500 opacity-40 cursor-not-allowed' : 'bg-gray-100 text-gray-400 opacity-40 cursor-not-allowed'">
                            Submit Report
                        </button>
                    </div>
                </div>
            </div>
        </Transition>

        <!-- ── SCROLLABLE BODY ───────────────────────── -->
        <div class="screen-body flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">

            <!-- Quick Stats -->
            <div class="grid grid-cols-3 gap-3">
                <div class="rounded-2xl p-4 border relative overflow-hidden"
                    :class="isDark ? 'bg-surface-dark/40 border-white/8' : 'bg-white border-gray-100 shadow-sm'">
                    <div class="absolute top-0 right-0 w-16 h-16 rounded-full blur-2xl opacity-20 bg-primary"></div>
                    <div class="relative">
                        <div class="w-8 h-8 rounded-lg flex items-center justify-center mb-2"
                            :class="isDark ? 'bg-primary/15' : 'bg-primary/10'">
                            <span class="material-icons text-primary text-sm">check_circle</span>
                        </div>
                        <p class="text-2xl font-black text-primary">{{ clockedIn }}</p>
                        <p class="text-[9px] uppercase font-bold tracking-wider mt-0.5"
                            :class="isDark ? 'text-gray-500' : 'text-gray-400'">Clocked In</p>
                    </div>
                </div>

                <div class="rounded-2xl p-4 border relative overflow-hidden"
                    :class="isDark ? 'bg-surface-dark/40 border-white/8' : 'bg-white border-gray-100 shadow-sm'">
                    <div class="absolute top-0 right-0 w-16 h-16 rounded-full blur-2xl opacity-20 bg-amber-500"></div>
                    <div class="relative">
                        <div class="w-8 h-8 rounded-lg flex items-center justify-center mb-2"
                            :class="isDark ? 'bg-amber-500/15' : 'bg-amber-500/10'">
                            <span class="material-icons text-amber-400 text-sm">schedule</span>
                        </div>
                        <p class="text-2xl font-black" :class="pendingCount > 0 ? 'text-amber-400' : isDark ? 'text-gray-500' : 'text-gray-400'">{{ pendingCount }}</p>
                        <p class="text-[9px] uppercase font-bold tracking-wider mt-0.5"
                            :class="isDark ? 'text-gray-500' : 'text-gray-400'">Pending</p>
                    </div>
                </div>

                <div class="rounded-2xl p-4 border relative overflow-hidden"
                    :class="isDark ? 'bg-surface-dark/40 border-white/8' : 'bg-white border-gray-100 shadow-sm'">
                    <div class="absolute top-0 right-0 w-16 h-16 rounded-full blur-2xl opacity-20 bg-red-500"></div>
                    <div class="relative">
                        <div class="w-8 h-8 rounded-lg flex items-center justify-center mb-2"
                            :class="isDark ? 'bg-red-500/15' : 'bg-red-500/10'">
                            <span class="material-icons text-red-400 text-sm">warning</span>
                        </div>
                        <p class="text-2xl font-black" :class="noShows > 0 ? 'text-red-400' : isDark ? 'text-gray-500' : 'text-gray-400'">{{ noShows }}</p>
                        <p class="text-[9px] uppercase font-bold tracking-wider mt-0.5"
                            :class="isDark ? 'text-gray-500' : 'text-gray-400'">Issues</p>
                    </div>
                </div>
            </div>

            <!-- Section Header -->
            <div class="flex items-center justify-between px-1">
                <h2 class="text-xs font-black uppercase tracking-widest" :class="isDark ? 'text-gray-400' : 'text-gray-500'">
                    Team Members
                </h2>
                <span class="text-xs font-semibold" :class="isDark ? 'text-gray-500' : 'text-gray-400'">
                    {{ crew.length }} total
                </span>
            </div>

            <!-- Crew Clock-In Cards -->
            <div class="space-y-3">
                <div v-for="(member, index) in crew" :key="member.id"
                    class="rounded-2xl p-4 border relative overflow-hidden transition-all duration-300"
                    :class="member.checkInTime
                        ? isDark ? 'bg-gradient-to-br from-primary/10 to-primary/5 border-primary/30 shadow-lg shadow-primary/10' : 'bg-gradient-to-br from-primary/10 to-primary/5 border-primary/40 shadow-xl'
                        : isDark ? 'bg-surface-dark/40 border-white/8 hover:border-white/15' : 'bg-white border-gray-100 shadow-sm hover:shadow-md'">

                    <!-- Background Effects -->
                    <div v-if="member.checkInTime" class="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-30 bg-primary"></div>

                    <div class="flex items-center gap-4 relative">
                        <!-- Avatar with Status Ring -->
                        <div class="relative">
                            <div v-if="member.checkInTime" class="absolute inset-0 rounded-2xl bg-primary/30 animate-pulse"></div>
                            <img :src="member.photo" :alt="member.name" class="w-16 h-16 rounded-2xl object-cover border-2 relative z-10"
                                :class="member.checkInTime ? 'border-primary shadow-lg shadow-primary/30' : isDark ? 'border-gray-700' : 'border-gray-200'" />
                            <div v-if="member.checkInTime" class="absolute -bottom-1 -right-1 w-5 h-5 bg-primary rounded-full border-2 flex items-center justify-center z-20"
                                :class="isDark ? 'border-background-dark' : 'border-background-light'">
                                <span class="material-icons text-[10px] text-background-dark">check</span>
                            </div>
                            <div v-else-if="member.reportedReason" class="absolute -bottom-1 -right-1 w-5 h-5 bg-amber-500 rounded-full border-2 flex items-center justify-center z-20"
                                :class="isDark ? 'border-background-dark' : 'border-background-light'">
                                <span class="material-icons text-[10px] text-white">priority_high</span>
                            </div>
                        </div>

                        <!-- Member Info -->
                        <div class="flex-1 min-w-0">
                            <div class="flex items-center gap-2 mb-0.5">
                                <p class="font-black text-base truncate">{{ member.name }}</p>
                                <span v-if="member.checkInTime" class="material-icons text-primary text-sm animate-bounce">verified</span>
                            </div>
                            <div class="flex items-center gap-1.5 flex-wrap">
                                <span class="text-xs font-semibold px-2 py-0.5 rounded-md"
                                    :class="isDark ? 'bg-white/5 text-gray-400' : 'bg-gray-100 text-gray-600'">
                                    {{ member.role }}
                                </span>
                                <span class="text-[10px] font-mono" :class="isDark ? 'text-gray-600' : 'text-gray-400'">{{ member.id }}</span>
                            </div>

                            <!-- Status -->
                            <div v-if="member.checkInTime" class="flex items-center gap-1.5 mt-2">
                                <span class="material-icons text-primary text-xs">schedule</span>
                                <span class="text-xs text-primary font-bold">{{ member.checkInTime }}</span>
                                <span class="text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider"
                                    :class="isDark ? 'bg-primary/15 text-primary' : 'bg-primary/20 text-primary'">
                                    Active
                                </span>
                            </div>
                        </div>

                        <!-- Actions -->
                        <div class="flex flex-col gap-2 items-end">
                            <template v-if="!member.checkInTime">
                                <!-- Report Status or Button -->
                                <div v-if="member.reportedReason"
                                    class="text-[10px] px-2.5 py-1.5 rounded-lg border font-black uppercase tracking-wider flex items-center gap-1"
                                    :class="isDark ? 'border-amber-500/30 text-amber-400 bg-amber-500/15' : 'border-amber-300 text-amber-700 bg-amber-100'">
                                    <span class="material-icons text-xs">info</span>
                                    {{ member.reportedReason }}
                                </div>

                                <button v-else @click.stop="openReportModal(member)"
                                    class="text-[10px] px-3 py-1.5 rounded-lg border font-bold uppercase tracking-wider transition-all active:scale-95 flex items-center gap-1"
                                    :class="isDark ? 'border-red-500/30 text-red-400 bg-red-500/10 hover:bg-red-500/20' : 'border-red-200 text-red-600 bg-red-50 hover:bg-red-100'">
                                    <span class="material-icons text-xs">flag</span>
                                    Report
                                </button>

                                <!-- Clock In Button -->
                                <button @click="clockIn(member)"
                                    class="px-5 py-2.5 rounded-xl font-black text-sm text-background-dark active:scale-95 transition-transform shadow-lg flex items-center gap-2"
                                    style="background: linear-gradient(135deg, #1CE783 0%, #00D170 100%);">
                                    <span class="material-icons text-base">login</span>
                                    {{ member.reportedReason ? 'Override' : 'Clock In' }}
                                </button>
                            </template>

                            <!-- Clocked In Badge -->
                            <div v-else class="flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-sm bg-primary text-background-dark">
                                <span class="material-icons text-base">how_to_reg</span>
                                Ready
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>

        <!-- ── STICKY FOOTER ────────────────────────── -->
        <div class="screen-footer shrink-0 px-5 py-4 border-t flex flex-col gap-3 relative"
            :class="isDark ? 'border-white/5 bg-background-dark' : 'border-gray-100 bg-background-light'">

            <!-- Progress Bar -->
            <div class="rounded-xl p-3 border"
                :class="isDark ? 'bg-surface-dark/50 border-white/8' : 'bg-white border-gray-100'">
                <div class="flex items-center justify-between mb-2">
                    <span class="text-[10px] font-black uppercase tracking-widest" :class="isDark ? 'text-gray-400' : 'text-gray-500'">
                        Team Readiness
                    </span>
                    <span class="text-sm font-black" :class="clockedIn === crew.length ? 'text-primary' : isDark ? 'text-gray-400' : 'text-gray-500'">
                        {{ readinessPercent }}%
                    </span>
                </div>
                <div class="w-full h-2 rounded-full overflow-hidden" :class="isDark ? 'bg-gray-800' : 'bg-gray-200'">
                    <div class="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-primary to-primary-dark"
                        :style="`width: ${readinessPercent}%`"></div>
                </div>
            </div>

            <!-- Action Button -->
            <button @click="proceedToLoad" :disabled="pendingCount > 0"
                class="w-full rounded-2xl h-14 flex items-center justify-center gap-3 font-black text-base active:scale-[0.98] transition-all relative overflow-hidden"
                :class="pendingCount === 0
                    ? 'bg-gradient-to-r from-primary to-primary-dark text-background-dark shadow-glow'
                    : isDark ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-gray-100 text-gray-400 cursor-not-allowed'">
                <div v-if="pendingCount === 0" class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
                <span class="material-icons text-xl relative z-10">{{ pendingCount === 0 ? 'check_circle' : 'group' }}</span>
                <span class="relative z-10">{{ pendingCount === 0 ? 'All Set · Proceed to Gate Exit' : `Waiting for ${pendingCount} crew member${pendingCount > 1 ? 's' : ''}` }}</span>
            </button>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUiStore } from '../stores/uiStore.js'
import { useDriverStore } from '../stores/driverStore.js'
import { useJobStore } from '../stores/jobStore.js'
import * as api from '../services/api.js'

const router = useRouter()
const uiStore = useUiStore()
const driverStore = useDriverStore()
const jobStore = useJobStore()
const isDark = computed(() => uiStore.theme !== 'light')

const crew = ref([])
const clockedIn = computed(() => crew.value.filter(m => m.checkInTime).length)
const noShows = computed(() => crew.value.filter(m => m.reportedReason).length)
// Pending means neither clocked in nor reported
const pendingCount = computed(() => crew.value.length - clockedIn.value - noShows.value)
const readinessPercent = computed(() => crew.value.length ? Math.round((clockedIn.value / crew.value.length) * 100) : 100)

// ── Report Modal State ──
const reportModal = ref(false)
const selectedMember = ref(null)
const reportReason = ref(null)
const reportReasons = ['Absent', 'Sick / Medical', 'Arriving Late', 'Unreachable']

onMounted(async () => {
    const context = await driverStore.refreshDashboard()
    const mappedCrew = (context?.crew || []).map(member => ({
        id: member.labourer_id || member.id,
        labourerId: member.labourer_id || member.id,
        name: member.name,
        role: member.role || 'Crew',
        photo: member.photo || null,
        checkInTime: member.check_in_time || null,
        reportedReason: null,
    }))
    crew.value = mappedCrew

    if (jobStore.jobData?.jobType === 'HOUSE_SHIFT') {
        jobStore.jobData.crewAssigned = mappedCrew.map(member => ({
            id: member.id,
            labourerId: member.labourerId,
            name: member.name,
            role: member.role,
            photo: member.photo,
            checkedIn: Boolean(member.checkInTime),
            checkInTime: member.checkInTime,
        }))
    }
})

async function clockIn(member) {
    try {
        const updated = await api.checkInCrewMember(member.labourerId || member.id)
        member.checkInTime = updated.check_in_time || new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
        member.reportedReason = null

        if (jobStore.jobData?.crewAssigned) {
            const target = jobStore.jobData.crewAssigned.find(item =>
                String(item.id) === String(member.id) || String(item.labourerId) === String(member.labourerId)
            )
            if (target) {
                target.checkedIn = true
                target.checkInTime = member.checkInTime
            }
        }
    } catch (err) {
        uiStore.showToast(err.message || 'Could not check in crew member', 'error', 2000)
    }
}

function openReportModal(member) {
    selectedMember.value = member
    reportReason.value = null
    reportModal.value = true
}

function closeReportModal() {
    reportModal.value = false
    selectedMember.value = null
    reportReason.value = null
}

function submitReport() {
    if (selectedMember.value && reportReason.value) {
        selectedMember.value.reportedReason = reportReason.value
        uiStore.showToast(`${selectedMember.value.name} reported as ${reportReason.value}`, 'error', 2000)
    }
    closeReportModal()
}

function proceedToLoad() {
    driverStore.crewCheckedIn = true

    // Advance FSM through crew states so dashboard doesn't loop back
    // ASSIGNED → CREW_CHECKIN → START_ROUTE
    if (jobStore.jobState === 'ASSIGNED') {
        jobStore.transition('CREW_CHECKIN')
    }
    if (jobStore.jobState === 'CREW_CHECKIN') {
        jobStore.transition('START_ROUTE')
    }

    router.push('/gate-exit')
}
</script>

<style scoped>
.fade-scale-enter-active,
.fade-scale-leave-active {
    transition: opacity 0.25s ease, transform 0.25s ease;
}

.fade-scale-enter-from,
.fade-scale-leave-to {
    opacity: 0;
    transform: scale(0.95);
}

@keyframes shimmer {
    0% {
        transform: translateX(-100%);
    }
    100% {
        transform: translateX(100%);
    }
}

.animate-shimmer {
    animation: shimmer 2s infinite;
}
</style>
