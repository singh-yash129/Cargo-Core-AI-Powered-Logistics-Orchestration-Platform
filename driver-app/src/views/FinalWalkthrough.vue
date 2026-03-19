<template>
    <div class="screen-layout" :class="isDark ? 'bg-background-dark text-white' : 'bg-background-light text-gray-900'">

        <header class="flex-shrink-0 px-5 pt-5 pb-4 border-b"
            :class="isDark ? 'border-white/5' : 'border-gray-100'">
            <div class="flex items-center gap-3">
                <button @click="$router.back()" class="w-8 h-8 rounded-full flex items-center justify-center"
                    :class="isDark ? 'bg-surface-dark/50 text-gray-400' : 'bg-gray-100 text-gray-600'">
                    <span class="material-icons text-lg">arrow_back</span>
                </button>
                <div>
                    <p class="text-xs uppercase tracking-wider font-bold text-purple-400">Final Phase</p>
                    <h1 class="text-xl font-black">Final Walkthrough</h1>
                </div>
            </div>
        </header>

        <div class="screen-body flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">

            <!-- After Photos -->
            <div class="rounded-2xl border p-4"
                :class="isDark ? 'bg-surface-dark/40 border-white/8' : 'bg-white border-gray-100 shadow-sm'">
                <div class="flex items-center justify-between mb-3">
                    <p class="text-xs uppercase tracking-wider font-bold"
                        :class="isDark ? 'text-gray-400' : 'text-gray-500'">After-State Photos</p>
                    <span class="text-xs font-bold text-primary">{{ afterPhotos.length }}/2 required</span>
                </div>
                <div class="grid grid-cols-3 gap-2">
                    <div v-for="(photo, i) in afterPhotoSlots" :key="i"
                        class="aspect-square rounded-xl overflow-hidden border-2 border-dashed flex items-center justify-center cursor-pointer active:scale-95 transition-all"
                        :class="photo ? 'border-transparent' : isDark ? 'border-gray-700 bg-black/20' : 'border-gray-200 bg-gray-50'"
                        @click="captureAfterPhoto(i)">
                        <img v-if="photo" :src="photo" class="w-full h-full object-cover" />
                        <div v-else class="flex flex-col items-center gap-1">
                            <span class="material-icons text-2xl" :class="isDark ? 'text-gray-600' : 'text-gray-300'">add_a_photo</span>
                            <span class="text-[9px]" :class="isDark ? 'text-gray-600' : 'text-gray-400'">After {{ i + 1 }}</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Final Checklist -->
            <div class="rounded-2xl border overflow-hidden"
                :class="isDark ? 'bg-surface-dark/40 border-white/8' : 'bg-white border-gray-100 shadow-sm'">
                <div class="px-4 py-3 border-b flex items-center justify-between"
                    :class="isDark ? 'border-white/5' : 'border-gray-100'">
                    <p class="text-xs uppercase tracking-wider font-bold"
                        :class="isDark ? 'text-gray-400' : 'text-gray-500'">Final Checklist</p>
                    <span class="text-xs font-bold text-purple-400">
                        {{ finalDone }}/{{ finalTotal }}
                    </span>
                </div>
                <div class="divide-y" :class="isDark ? 'divide-white/5' : 'divide-gray-50'">
                    <div v-for="task in finalTasks" :key="task.id"
                        class="flex items-center gap-3 px-4 py-3.5 cursor-pointer"
                        @click="task.completed = !task.completed">
                        <div class="w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                            :class="task.completed ? 'bg-green-500 border-green-500' : isDark ? 'border-gray-600' : 'border-gray-300'">
                            <span v-if="task.completed" class="material-icons text-white text-sm">check</span>
                        </div>
                        <div class="flex-1">
                            <p class="text-sm font-semibold"
                                :class="task.completed ? 'text-gray-400' : ''">{{ task.task }}</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Damage Notes -->
            <div class="rounded-2xl border p-4"
                :class="isDark ? 'bg-surface-dark/40 border-white/8' : 'bg-white border-gray-100 shadow-sm'">
                <p class="text-xs uppercase tracking-wider font-bold mb-2"
                    :class="isDark ? 'text-gray-400' : 'text-gray-500'">Damage / Notes (Optional)</p>
                <textarea v-model="damageNotes" rows="3" placeholder="Note any damage, missing items, or customer feedback..."
                    class="w-full rounded-xl px-3 py-2.5 text-sm resize-none border outline-none focus:ring-2 focus:ring-purple-500/50"
                    :class="isDark ? 'bg-black/20 border-white/10 text-white placeholder-gray-600' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'">
                </textarea>
            </div>
        </div>

        <!-- Footer -->
        <div class="screen-footer border-t px-5 pt-4 pb-4"
            :class="isDark ? 'border-white/5 bg-background-dark' : 'border-gray-100 bg-background-light'">
            <div v-if="!canProceed" class="mb-3 px-3 py-2 rounded-xl text-xs font-semibold text-center"
                :class="isDark ? 'bg-red-500/10 text-red-400' : 'bg-red-50 text-red-600 border border-red-200'">
                {{ blockReason }}
            </div>
            <button @click="confirmWalkthrough" :disabled="!canProceed"
                class="w-full rounded-2xl h-14 flex items-center justify-center gap-3 relative overflow-hidden active:scale-[0.98] transition-all"
                :class="canProceed ? 'shadow-glow cursor-pointer' : 'opacity-40 cursor-not-allowed'">
                <div class="absolute inset-0"
                    :class="canProceed ? 'bg-gradient-to-r from-purple-600 to-purple-500' : (isDark ? 'bg-gray-700' : 'bg-gray-200')">
                </div>
                <span class="relative material-icons text-2xl text-white">draw</span>
                <span class="relative text-lg font-black uppercase tracking-wide text-white">Customer Sign-Off</span>
            </button>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useJobStore } from '../stores/jobStore.js'
import { useUiStore } from '../stores/uiStore.js'
import { useFlowRouter } from '../composables/useFlowRouter.js'

const jobStore = useJobStore()
const uiStore = useUiStore()
const { advanceAndNavigate } = useFlowRouter()
const isDark = computed(() => uiStore.theme !== 'light')
const afterPhotos = ref([])
const damageNotes = ref('')

const afterPhotoSlots = computed(() => {
    const slots = [null, null, null]
    afterPhotos.value.forEach((p, i) => { if (i < 3) slots[i] = p })
    return slots
})

const finalTasks = computed(() =>
    (jobStore.jobData?.checklist || []).filter(t => t.phase === 'final')
)
const finalTotal = computed(() => finalTasks.value.filter(t => t.required).length)
const finalDone = computed(() => finalTasks.value.filter(t => t.required && t.completed).length)

const hasPhotos = computed(() => afterPhotos.value.length >= 2)
const allChecked = computed(() => finalDone.value === finalTotal.value)
const canProceed = computed(() => hasPhotos.value && allChecked.value)

const blockReason = computed(() => {
    if (!hasPhotos.value) return 'Capture at least 2 after-state photos'
    if (!allChecked.value) return `Complete ${finalTotal.value - finalDone.value} more checklist items`
    return ''
})

function captureAfterPhoto(index) {
    const dummyImages = [
        'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=300&q=80',
        'https://images.unsplash.com/photo-1556909175-c6f88b491614?w=300&q=80',
        'https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=300&q=80',
    ]
    afterPhotos.value[index] = dummyImages[index % 3]
    uiStore.showToast('After photo captured ✓', 'success', 1500)
}

function confirmWalkthrough() {
    if (!canProceed.value) return
    if (jobStore.jobData) jobStore.jobData.afterPhotos = afterPhotos.value
    uiStore.showToast('Walkthrough complete! Getting customer sign-off...', 'success', 2000)
    setTimeout(() => {
        advanceAndNavigate('POC_CAPTURE', { walkthroughCompletedAt: new Date().toISOString() })
    }, 500)
}
</script>
