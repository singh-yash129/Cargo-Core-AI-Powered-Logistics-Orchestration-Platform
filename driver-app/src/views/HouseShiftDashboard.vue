<template>
    <div class="screen-layout" :class="isDark ? 'bg-background-dark text-white' : 'bg-background-light text-gray-900'">

        <!-- Header -->
        <header class="flex-shrink-0 px-5 pt-5 pb-4 border-b"
            :class="isDark ? 'border-white/5' : 'border-gray-100'">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-xs uppercase tracking-wider font-bold text-purple-400">House Shift</p>
                    <h1 class="text-2xl font-black">Shift Dashboard</h1>
                </div>
                <div class="flex items-center gap-2">
                    <div class="px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider"
                        :class="isDark ? 'bg-purple-500/15 text-purple-400' : 'bg-purple-50 text-purple-600 border border-purple-200'">
                        {{ jobStore.stateLabel }}
                    </div>
                </div>
            </div>
        </header>

        <!-- Body -->
        <div class="screen-body flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">

            <!-- Job ID -->
            <div class="rounded-2xl p-4 border"
                :class="isDark ? 'bg-surface-dark/40 border-white/8' : 'bg-white border-gray-100 shadow-sm'">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-xs uppercase font-bold tracking-wider text-purple-400 mb-0.5">Job ID</p>
                        <p class="text-xl font-black">{{ jobStore.jobData?.jobId }}</p>
                    </div>
                    <span class="material-icons text-4xl opacity-20 text-purple-400">moving</span>
                </div>
            </div>

            <!-- Phase Progress -->
            <div class="rounded-2xl border overflow-hidden"
                :class="isDark ? 'bg-surface-dark/40 border-white/8' : 'bg-white border-gray-100 shadow-sm'">
                <div class="px-4 py-3 border-b"
                    :class="isDark ? 'border-white/5' : 'border-gray-100'">
                    <p class="text-xs uppercase tracking-wider font-bold"
                        :class="isDark ? 'text-gray-400' : 'text-gray-500'">Shift Phases</p>
                </div>
                <div class="divide-y" :class="isDark ? 'divide-white/5' : 'divide-gray-50'">
                    <div v-for="phase in shiftPhases" :key="phase.state"
                        class="flex items-center gap-3 px-4 py-3.5"
                        :class="phase.isCurrent ? (isDark ? 'bg-purple-500/5' : 'bg-purple-50') : ''">
                        <div class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                            :class="phase.done
                                ? 'bg-green-500'
                                : phase.isCurrent
                                    ? 'bg-purple-500'
                                    : isDark ? 'bg-gray-800' : 'bg-gray-100'">
                            <span class="material-icons text-sm"
                                :class="phase.done || phase.isCurrent ? 'text-white' : isDark ? 'text-gray-600' : 'text-gray-400'">
                                {{ phase.done ? 'check' : phase.icon }}
                            </span>
                        </div>
                        <div class="flex-1">
                            <p class="text-sm font-semibold"
                                :class="phase.locked ? (isDark ? 'text-gray-600' : 'text-gray-400') : ''">
                                {{ phase.label }}
                            </p>
                            <p v-if="phase.isCurrent" class="text-xs font-bold text-purple-400">Current Phase</p>
                            <p v-else-if="phase.done" class="text-xs font-bold text-green-400">Completed</p>
                            <p v-else-if="phase.locked" class="text-xs" :class="isDark ? 'text-gray-600' : 'text-gray-400'">Locked</p>
                        </div>
                        <span v-if="phase.locked" class="material-icons text-sm"
                            :class="isDark ? 'text-gray-700' : 'text-gray-300'">lock</span>
                    </div>
                </div>
            </div>

            <!-- Location Info -->
            <div class="grid grid-cols-2 gap-3">
                <div class="rounded-2xl border p-3"
                    :class="isDark ? 'bg-surface-dark/40 border-white/8' : 'bg-white border-gray-100 shadow-sm'">
                    <p class="text-[10px] uppercase font-bold text-primary mb-1">Source</p>
                    <p class="text-xs font-semibold leading-tight">
                        {{ jobStore.jobData?.sourceLocation?.address?.split(',').slice(0, 2).join(',') }}
                    </p>
                </div>
                <div class="rounded-2xl border p-3"
                    :class="isDark ? 'bg-surface-dark/40 border-white/8' : 'bg-white border-gray-100 shadow-sm'">
                    <p class="text-[10px] uppercase font-bold text-purple-400 mb-1">Destination</p>
                    <p class="text-xs font-semibold leading-tight">
                        {{ jobStore.jobData?.destinationLocation?.address?.split(',').slice(0, 2).join(',') }}
                    </p>
                </div>
            </div>

            <!-- Crew Status -->
            <div class="rounded-2xl border p-4"
                :class="isDark ? 'bg-surface-dark/40 border-white/8' : 'bg-white border-gray-100 shadow-sm'">
                <div class="flex items-center justify-between mb-3">
                    <p class="text-xs uppercase tracking-wider font-bold"
                        :class="isDark ? 'text-gray-400' : 'text-gray-500'">Crew</p>
                    <span class="text-xs font-bold text-primary">
                        {{ checkedInCount }}/{{ totalCrew }} checked in
                    </span>
                </div>
                <div class="flex gap-2">
                    <img v-for="m in crewPreview" :key="m.id" :src="m.photo"
                        class="w-9 h-9 rounded-full object-cover border-2"
                        :class="m.checkedIn ? 'border-green-500' : isDark ? 'border-gray-600' : 'border-gray-200'" />
                </div>
            </div>
        </div>

        <!-- Footer -->
        <div class="screen-footer border-t px-5 pt-4 pb-4"
            :class="isDark ? 'border-white/5 bg-background-dark' : 'border-gray-100 bg-background-light'">
            <button @click="continueFlow"
                class="w-full rounded-2xl h-14 flex items-center justify-center gap-3 relative overflow-hidden shadow-glow active:scale-[0.98] transition-transform">
                <div class="absolute inset-0 bg-gradient-to-r from-purple-600 to-purple-500"></div>
                <span class="relative material-icons text-2xl text-white">{{ currentPhaseIcon }}</span>
                <span class="relative text-lg font-black uppercase tracking-wide text-white">{{ currentPhaseLabel }}</span>
            </button>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue'
import { useJobStore } from '../stores/jobStore.js'
import { useUiStore } from '../stores/uiStore.js'
import { useFlowRouter, FLOW_STEPS } from '../composables/useFlowRouter.js'

const jobStore = useJobStore()
const uiStore = useUiStore()
const { advanceAndNavigate, navigateToCurrentState, getNextActionLabel } = useFlowRouter()
const isDark = computed(() => uiStore.theme !== 'light')

// ── State Phases ──────────────────────────────────────────────────
const allSteps = FLOW_STEPS.HOUSE_SHIFT
const currentStateIdx = computed(() =>
    allSteps.findIndex(s => s.state === jobStore.jobState)
)

const shiftPhases = computed(() => allSteps.map((step, i) => ({
    ...step,
    done: i < currentStateIdx.value,
    isCurrent: i === currentStateIdx.value,
    locked: i > currentStateIdx.value,
})))

// ── Crew ──────────────────────────────────────────────────────────
const crew = computed(() => jobStore.jobData?.crewAssigned || [])
const totalCrew = computed(() => crew.value.length)
const checkedInCount = computed(() => crew.value.filter(m => m.checkedIn).length)
const crewPreview = computed(() => crew.value.slice(0, 5))

// ── Current Phase Button ──────────────────────────────────────────
const currentPhaseLabel = computed(() => getNextActionLabel())
const currentPhaseIcon = computed(() => {
    const step = allSteps[currentStateIdx.value]
    return step?.icon || 'arrow_forward'
})

function continueFlow() {
    // Advance to the next state; fall back to re-navigating current state
    const nextState = jobStore.allowedTransitions[0]
    if (nextState) {
        advanceAndNavigate(nextState)
    } else {
        navigateToCurrentState()
    }
}
</script>
