<template>
    <div class="screen-layout" :class="isDark ? 'bg-background-dark text-white' : 'bg-background-light text-gray-900'">

        <!-- Header -->
        <header class="flex-shrink-0 px-5 pt-5 pb-4 border-b"
            :class="isDark ? 'border-white/5' : 'border-gray-100'">
            <div class="flex items-center gap-3 mb-3">
                <button @click="$router.back()" class="w-8 h-8 rounded-full flex items-center justify-center"
                    :class="isDark ? 'bg-surface-dark/50 text-gray-400' : 'bg-gray-100 text-gray-600'">
                    <span class="material-icons text-lg">arrow_back</span>
                </button>
                <div>
                    <p class="text-xs uppercase tracking-wider font-bold text-purple-400">House Shift</p>
                    <h1 class="text-xl font-black">Packing Progress</h1>
                </div>
                <div class="ml-auto text-right">
                    <p class="text-xs font-mono" :class="isDark ? 'text-gray-500' : 'text-gray-400'">Phase 1 of 3</p>
                    <p class="text-sm font-bold text-purple-400">{{ completedCount }}/{{ totalRequired }} Done</p>
                </div>
            </div>

            <!-- Progress Bar -->
            <div class="w-full h-2 rounded-full" :class="isDark ? 'bg-gray-800' : 'bg-gray-200'">
                <div class="h-2 rounded-full bg-purple-500 transition-all duration-500"
                    :style="`width: ${progressPercent}%`"></div>
            </div>
        </header>

        <!-- Body -->
        <div class="screen-body flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">

            <!-- Summary Badge -->
            <div class="rounded-2xl p-4 flex items-center gap-4 border"
                :class="isDark ? 'bg-purple-500/10 border-purple-500/20' : 'bg-purple-50 border-purple-200'">
                <div class="w-12 h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center">
                    <span class="material-icons text-purple-400 text-2xl">inventory</span>
                </div>
                <div class="flex-1">
                    <p class="font-bold text-purple-400">{{ packingStatus }}</p>
                    <p class="text-xs mt-0.5" :class="isDark ? 'text-gray-400' : 'text-gray-600'">
                        Source: {{ jobStore.jobData?.sourceLocation?.address?.slice(0, 40) }}...
                    </p>
                </div>
            </div>

            <!-- Checklist -->
            <div class="rounded-2xl border overflow-hidden"
                :class="isDark ? 'bg-surface-dark/40 border-white/8' : 'bg-white border-gray-100 shadow-sm'">
                <div class="px-4 py-3 border-b"
                    :class="isDark ? 'border-white/5' : 'border-gray-100'">
                    <p class="text-xs uppercase tracking-wider font-bold"
                        :class="isDark ? 'text-gray-400' : 'text-gray-500'">Packing Checklist</p>
                </div>
                <div class="divide-y" :class="isDark ? 'divide-white/5' : 'divide-gray-50'">
                    <div v-for="task in packingTasks" :key="task.id"
                        class="flex items-center gap-3 px-4 py-3.5 transition-all"
                        :class="task.completed ? (isDark ? 'bg-green-500/5' : 'bg-green-50') : ''"
                        @click="toggleTask(task)">
                        <div class="w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all"
                            :class="task.completed
                                ? 'bg-green-500 border-green-500'
                                : isDark ? 'border-gray-600' : 'border-gray-300'">
                            <span v-if="task.completed" class="material-icons text-white text-sm">check</span>
                        </div>
                        <div class="flex-1">
                            <p class="text-sm font-semibold"
                                :class="task.completed ? (isDark ? 'text-gray-400 line-through' : 'text-gray-400 line-through') : ''">
                                {{ task.task }}
                            </p>
                            <p v-if="task.required" class="text-[10px] uppercase font-bold text-red-400 mt-0.5">Required</p>
                        </div>
                        <span class="material-icons text-lg"
                            :class="task.completed ? 'text-green-400' : isDark ? 'text-gray-600' : 'text-gray-300'">
                            {{ task.completed ? 'check_circle' : 'radio_button_unchecked' }}
                        </span>
                    </div>
                </div>
            </div>

            <!-- Before Photos Section -->
            <div class="rounded-2xl border p-4"
                :class="isDark ? 'bg-surface-dark/40 border-white/8' : 'bg-white border-gray-100 shadow-sm'">
                <div class="flex items-center justify-between mb-3">
                    <p class="text-xs uppercase tracking-wider font-bold"
                        :class="isDark ? 'text-gray-400' : 'text-gray-500'">Before Photos</p>
                    <span class="text-xs font-bold text-primary">{{ beforePhotos.length }}/2 required</span>
                </div>
                <div class="grid grid-cols-3 gap-2">
                    <div v-for="(photo, i) in photoSlots" :key="i"
                        class="aspect-square rounded-xl overflow-hidden border-2 border-dashed flex items-center justify-center cursor-pointer transition-all active:scale-95"
                        :class="photo
                            ? 'border-transparent'
                            : isDark ? 'border-gray-700 bg-black/20' : 'border-gray-200 bg-gray-50'"
                        @click="captureBeforePhoto(i)">
                        <img v-if="photo" :src="photo" class="w-full h-full object-cover" />
                        <div v-else class="flex flex-col items-center gap-1">
                            <span class="material-icons text-2xl"
                                :class="isCapturing ? 'animate-spin text-purple-400' : isDark ? 'text-gray-600' : 'text-gray-300'">
                                {{ isCapturing ? 'hourglass_empty' : 'add_a_photo' }}
                            </span>
                            <span class="text-[9px]"
                                :class="isDark ? 'text-gray-600' : 'text-gray-400'">Photo {{ i + 1 }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Footer -->
        <div class="screen-footer border-t px-5 pt-4 pb-4"
            :class="isDark ? 'border-white/5 bg-background-dark' : 'border-gray-100 bg-background-light'">

            <div v-if="!canProceed" class="mb-3 px-3 py-2 rounded-xl text-xs font-semibold text-center"
                :class="isDark ? 'bg-red-500/10 text-red-400' : 'bg-red-50 text-red-600 border border-red-200'">
                {{ blockReason }}
            </div>

            <button @click="confirmPacking" :disabled="!canProceed"
                class="w-full rounded-2xl h-14 flex items-center justify-center gap-3 relative overflow-hidden group active:scale-[0.98] transition-all"
                :class="canProceed
                    ? 'shadow-glow cursor-pointer'
                    : 'opacity-40 cursor-not-allowed'">
                <div class="absolute inset-0"
                    :class="canProceed ? 'bg-gradient-to-r from-purple-600 to-purple-500' : (isDark ? 'bg-gray-700' : 'bg-gray-200')">
                </div>
                <span class="relative material-icons text-2xl"
                    :class="canProceed ? 'text-white' : (isDark ? 'text-gray-500' : 'text-gray-400')">
                    inventory_2
                </span>
                <span class="relative text-lg font-black uppercase tracking-wide"
                    :class="canProceed ? 'text-white' : (isDark ? 'text-gray-500' : 'text-gray-400')">
                    Packing Complete → Load
                </span>
            </button>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useJobStore } from '../stores/jobStore.js'
import { useUiStore } from '../stores/uiStore.js'
import { useFlowRouter } from '../composables/useFlowRouter.js'
import { useCamera } from '../composables/useCamera.js'

const jobStore = useJobStore()
const uiStore = useUiStore()
const { advanceAndNavigate } = useFlowRouter()
const { scanDocument, isCapturing } = useCamera()
const isDark = computed(() => uiStore.theme !== 'light')
const beforePhotos = ref([])

// ── Packing Tasks from jobStore ───────────────────────────────────
const packingTasks = computed(() => {
    return (jobStore.jobData?.checklist || []).filter(t => t.phase === 'packing')
})

const totalRequired = computed(() => packingTasks.value.filter(t => t.required).length)
const completedCount = computed(() => packingTasks.value.filter(t => t.required && t.completed).length)
const progressPercent = computed(() => totalRequired.value > 0
    ? Math.round((completedCount.value / totalRequired.value) * 100)
    : 0)

const packingStatus = computed(() => {
    if (completedCount.value === 0) return 'Not started — tap items to check off'
    if (completedCount.value < totalRequired.value) return `${completedCount.value}/${totalRequired.value} required tasks done`
    return 'All required tasks complete ✓'
})

// ── Photos ────────────────────────────────────────────────────────
const photoSlots = computed(() => {
    const slots = [null, null, null]
    beforePhotos.value.forEach((p, i) => { if (i < 3) slots[i] = p })
    return slots
})

// ── Validation ────────────────────────────────────────────────────
const allRequiredDone = computed(() =>
    packingTasks.value.filter(t => t.required).every(t => t.completed)
)
const hasEnoughPhotos = computed(() => beforePhotos.value.length >= 2)
const canProceed = computed(() => allRequiredDone.value && hasEnoughPhotos.value)

const blockReason = computed(() => {
    if (!allRequiredDone.value) return `Complete all ${totalRequired.value - completedCount.value} required tasks first`
    if (!hasEnoughPhotos.value) return `Capture at least 2 before-photos`
    return ''
})

// ── Actions ───────────────────────────────────────────────────────
function toggleTask(task) {
    task.completed = !task.completed
    if (task.completed) {
        uiStore.showToast(`✓ ${task.task}`, 'success', 1500)
    }
}

async function captureBeforePhoto(index) {
    const result = await scanDocument('Before Photo')
    if (!result) return
    const dataUrl = result.base64.startsWith('data:')
        ? result.base64
        : `data:image/jpeg;base64,${result.base64}`
    beforePhotos.value[index] = dataUrl
    // Force reactivity on array mutation
    beforePhotos.value = [...beforePhotos.value]
    uiStore.showToast('Before photo captured ✓', 'success', 1500)
}

function confirmPacking() {
    if (!canProceed.value) return

    // Save photos to job data
    if (jobStore.jobData) {
        jobStore.jobData.beforePhotos = beforePhotos.value
    }

    uiStore.showToast('Packing complete! Starting load inventory...', 'success', 2000)
    setTimeout(() => {
        advanceAndNavigate('LOADING_INVENTORY', { packingCompletedAt: new Date().toISOString() })
    }, 500)
}
</script>
