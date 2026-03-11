<template>
    <div class="screen-layout" :class="isDark ? 'bg-background-dark text-white' : 'bg-background-light text-gray-900'">

        <!-- ── HEADER ───────────────────────────────── -->
        <header class="flex-shrink-0 px-5 pt-5 pb-4 border-b" :class="isDark ? 'border-white/5' : 'border-gray-100'">
            <div class="flex items-center justify-between mb-2">
                <button @click="$router.back()" class="w-10 h-10 rounded-full flex items-center justify-center border"
                    :class="isDark ? 'bg-surface-dark border-white/5 text-gray-400' : 'bg-white border-gray-200 shadow-sm'">
                    <span class="material-icons text-xl">arrow_back</span>
                </button>
                <span class="text-xs font-bold px-3 py-1.5 rounded-full border"
                    :class="isDark ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-primary/10 border-primary/30 text-primary'">
                    {{ clockedIn }} / {{ crew.length }} Clocked In
                </span>
            </div>
            <p class="text-xs font-bold uppercase tracking-wider text-primary mb-0.5">Crew Management</p>
            <h1 class="text-2xl font-black tracking-tight">Your Team</h1>
            <p class="text-sm mt-0.5" :class="isDark ? 'text-gray-400' : 'text-gray-500'">House Shift · 14B Andheri West
            </p>
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

            <!-- Crew Clock-In Cards -->
            <div class="space-y-3">
                <div v-for="member in crew" :key="member.id" class="rounded-2xl p-4 border flex items-center gap-4"
                    :class="member.checkInTime
                        ? isDark ? 'bg-primary/8 border-primary/20' : 'bg-primary/8 border-primary/30'
                        : isDark ? 'bg-surface-dark/30 border-white/5' : 'bg-white border-gray-100 shadow-sm'">
                    <img :src="member.photo" :alt="member.name" class="w-14 h-14 rounded-2xl object-cover border-2"
                        :class="member.checkInTime ? 'border-primary' : isDark ? 'border-gray-700' : 'border-gray-200'" />
                    <div class="flex-1 min-w-0">
                        <p class="font-bold">{{ member.name }}</p>
                        <p class="text-xs" :class="isDark ? 'text-gray-400' : 'text-gray-500'">{{ member.role }} · {{
                            member.id }}</p>
                        <div v-if="member.checkInTime" class="flex items-center gap-1 mt-1">
                            <span class="material-icons text-primary text-xs">check_circle</span>
                            <span class="text-xs text-primary font-semibold">Clocked in {{ member.checkInTime }}</span>
                        </div>
                    </div>
                    <div class="flex flex-col gap-2 items-end">
                        <template v-if="!member.checkInTime">

                            <!-- Status & Report Buttons Row -->
                            <div class="flex items-center gap-2">
                                <!-- Show Reported status badge if reported -->
                                <div v-if="member.reportedReason"
                                    class="text-xs px-3 py-1.5 rounded-lg border font-semibold flex items-center gap-1 cursor-help"
                                    :class="isDark ? 'border-amber-500/30 text-amber-400 bg-amber-500/10' : 'border-amber-200 text-amber-600 bg-amber-50'">
                                    <span class="material-icons text-[10px]">info</span>
                                    {{ member.reportedReason }}
                                </div>

                                <!-- Show Report button ONLY if not reported yet -->
                                <button v-else @click.stop="openReportModal(member)"
                                    class="text-xs px-3 py-1.5 rounded-lg border font-semibold transition-all active:scale-[0.97]"
                                    :class="isDark ? 'border-red-500/30 text-red-400 bg-red-500/8 hover:bg-red-500/15' : 'border-red-200 text-red-500 bg-red-50 hover:bg-red-100'">
                                    Report
                                </button>
                            </div>

                            <!-- ALWAYS Show Clock In if not checked in -->
                            <button @click="clockIn(member)"
                                class="px-4 py-2 rounded-xl font-bold text-sm text-background-dark active:scale-[0.97]"
                                style="background: #1CE783;">
                                {{ member.reportedReason ? 'Arrived Now' : 'Clock In' }}
                            </button>

                        </template>
                    </div>
                </div>

            </div>

        </div>

        <!-- ── STICKY FOOTER ────────────────────────── -->
        <div class="screen-footer shrink-0 px-5 py-4 border-t flex flex-col gap-4"
            :class="isDark ? 'border-white/5 bg-background-dark' : 'border-gray-100 bg-background-light'">

            <!-- Attendance Summary -->
            <div class="rounded-2xl p-4 border"
                :class="isDark ? 'bg-surface-dark/30 border-white/5' : 'bg-white border-gray-100 shadow-sm'">
                <h3 class="text-xs font-bold uppercase tracking-widest mb-3"
                    :class="isDark ? 'text-gray-400' : 'text-gray-500'">
                    Attendance Summary</h3>
                <div class="grid grid-cols-3 gap-3 text-center">
                    <div>
                        <p class="text-2xl font-black text-primary">{{ clockedIn }}</p>
                        <p class="text-[10px] uppercase" :class="isDark ? 'text-gray-400' : 'text-gray-500'">Clocked
                            In
                        </p>
                    </div>
                    <div>
                        <p class="text-2xl font-black">{{ crew.length - clockedIn }}</p>
                        <p class="text-[10px] uppercase" :class="isDark ? 'text-gray-400' : 'text-gray-500'">Pending
                        </p>
                    </div>
                    <div>
                        <p class="text-2xl font-black text-accent-gold">{{ noShows }}</p>
                        <p class="text-[10px] uppercase" :class="isDark ? 'text-gray-400' : 'text-gray-500'">No-Show
                        </p>
                    </div>
                </div>
            </div>

            <button @click="proceedToLoad" :disabled="pendingCount > 0"
                class="w-full rounded-2xl h-14 flex items-center justify-center gap-2 font-bold text-lg active:scale-[0.98]"
                :class="pendingCount === 0
                    ? 'bg-primary text-background-dark shadow-glow'
                    : isDark ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-gray-100 text-gray-400 cursor-not-allowed'">
                <span class="material-icons">{{ pendingCount === 0 ? 'check' : 'group' }}</span>
                {{ pendingCount === 0 ? 'All Accounted For · Proceed' : `${pendingCount} crew pending` }}
            </button>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUiStore } from '../stores/uiStore.js'
import { useDriverStore } from '../stores/driverStore.js'
import { dummyCrewMembers } from '../utils/dummyData.js'

const router = useRouter()
const uiStore = useUiStore()
const driverStore = useDriverStore()
const isDark = computed(() => uiStore.theme !== 'light')

const crew = ref(dummyCrewMembers.map(m => ({ ...m, reportedReason: null })))
const clockedIn = computed(() => crew.value.filter(m => m.checkInTime).length)
const noShows = computed(() => crew.value.filter(m => m.reportedReason).length)
// Pending means neither clocked in nor reported
const pendingCount = computed(() => crew.value.length - clockedIn.value - noShows.value)

// ── Report Modal State ──
const reportModal = ref(false)
const selectedMember = ref(null)
const reportReason = ref(null)
const reportReasons = ['Absent', 'Sick / Medical', 'Arriving Late', 'Unreachable']

function clockIn(member) {
    member.checkInTime = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    member.reportedReason = null // clocking in overrides reports
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
    router.push('/load-verify')
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
</style>
