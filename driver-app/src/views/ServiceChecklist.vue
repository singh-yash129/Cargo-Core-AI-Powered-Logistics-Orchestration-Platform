<template>
    <div class="screen-layout" :class="isDark ? 'bg-background-dark text-white' : 'bg-background-light text-gray-900'">

        <!-- ── HEADER ───────────────────────────────── -->
        <header class="flex-shrink-0 px-5 pt-5 pb-4 border-b" :class="isDark ? 'border-white/5' : 'border-gray-100'">
            <div class="flex items-center gap-3 mb-2">
                <button @click="$router.back()" class="w-10 h-10 rounded-full flex items-center justify-center border"
                    :class="isDark ? 'bg-surface-dark border-white/5 text-gray-400' : 'bg-white border-gray-200 shadow-sm'">
                    <span class="material-icons text-xl">arrow_back</span>
                </button>
                <div>
                    <h1 class="text-2xl font-black tracking-tight">Service Checklist</h1>
                    <p class="text-xs" :class="isDark ? 'text-gray-400' : 'text-gray-500'">{{ checklistSubtitle }}</p>
                </div>
            </div>
            <!-- Progress -->
            <div class="flex justify-between items-center mb-1">
                <span class="text-sm" :class="isDark ? 'text-gray-400' : 'text-gray-500'">
                    {{ done }} of {{ checklist.length }} completed
                </span>
                <span class="text-lg font-black text-primary">{{ progressPct }}%</span>
            </div>
            <div class="w-full h-1.5 rounded-full" :class="isDark ? 'bg-gray-800' : 'bg-gray-100'">
                <div class="h-1.5 rounded-full bg-primary transition-all" :style="`width: ${progressPct}%`"></div>
            </div>
        </header>

        <!-- ── SCROLLABLE BODY ───────────────────────── -->
        <div class="screen-body px-5 py-4 flex flex-col gap-3">
            <div v-for="item in checklist" :key="item.id" @click="item.checked = !item.checked"
                class="flex items-center gap-4 p-4 rounded-2xl border cursor-pointer transition-all active:scale-[0.98]"
                :class="item.checked
                    ? isDark ? 'bg-primary/8 border-primary/20' : 'bg-primary/8 border-primary/30'
                    : isDark ? 'bg-surface-dark/30 border-white/5 hover:border-white/10' : 'bg-white border-gray-100 shadow-sm hover:border-gray-200'">
                <div class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    :class="item.checked ? 'bg-primary text-background-dark' : isDark ? 'bg-white/5 text-gray-500' : 'bg-gray-50 text-gray-400'">
                    <span class="material-icons text-sm">{{ item.checked ? 'check' : item.required ? 'priority_high' :
                        'circle' }}</span>
                </div>
                <div class="flex-1">
                    <p class="text-sm font-semibold">{{ item.label || item.task }}</p>
                    <p v-if="item.required" class="text-[10px] uppercase font-bold mt-0.5"
                        :class="item.checked ? 'text-primary' : 'text-signal-amber'">{{ item.checked ? 'Done' :
                        'Required' }}</p>
                </div>
            </div>
        </div>

        <!-- ── STICKY FOOTER ────────────────────────── -->
        <div class="screen-footer px-5 py-4 border-t"
            :class="isDark ? 'border-white/5 bg-background-dark' : 'border-gray-100 bg-background-light'">
            <button @click="proceed" :disabled="!allRequiredDone"
                class="w-full rounded-2xl h-14 flex items-center justify-center gap-2 font-bold text-lg transition-all active:scale-[0.98]"
                :class="allRequiredDone
                    ? 'bg-primary text-background-dark shadow-glow'
                    : isDark ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-gray-100 text-gray-400 cursor-not-allowed'">
                <span class="material-icons">{{ allRequiredDone ? 'check_circle' : 'lock' }}</span>
                {{ allRequiredDone ? proceedLabel : 'Complete required items' }}
            </button>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUiStore } from '../stores/uiStore.js'
import { useJobStore } from '../stores/jobStore.js'
import { useFlowRouter } from '../composables/useFlowRouter.js'

const route = useRoute()
const router = useRouter()
const { advanceAndNavigate } = useFlowRouter()
const uiStore = useUiStore()
const jobStore = useJobStore()
const isDark = computed(() => uiStore.theme !== 'light')
const stopId = computed(() => route.params.id || 'STOP-001')
const stop = computed(() => jobStore.getStopById(stopId.value) || jobStore.currentStop || {})

function buildChecklist() {
    if (jobStore.jobType === 'HOUSE_SHIFT') {
        return (jobStore.jobData?.checklist || []).map(item => ({
            ...item,
            label: item.task || item.label,
            checked: Boolean(item.completed || item.checked),
        }))
    }

    return [
        {
            id: 'verify-recipient',
            label: `Verify recipient for ${stop.value.customerName || 'delivery stop'}`,
            required: true,
            checked: false,
        },
        {
            id: 'handover-items',
            label: `Confirm handover of ${stop.value.packages?.length || stop.value.expectedItems || 0} item(s)`,
            required: true,
            checked: false,
        },
        {
            id: 'capture-notes',
            label: stop.value.specialInstructions || 'Record any delivery notes or exceptions',
            required: false,
            checked: false,
        },
    ]
}

const checklist = ref(buildChecklist())
const checklistSubtitle = computed(() => `${jobStore.jobTypeLabel} · Stop #${stop.value.stopNumber || 1}`)
const proceedLabel = computed(() =>
    jobStore.jobType === 'HOUSE_SHIFT' ? 'Proceed to Sign-off' : 'Proceed to POD'
)

watch([() => stop.value?.id, () => jobStore.jobType, () => jobStore.jobData?.checklist], () => {
    checklist.value = buildChecklist()
}, { immediate: true })

const done = computed(() => checklist.value.filter(c => c.checked).length)
const progressPct = computed(() => checklist.value.length ? Math.round(done.value / checklist.value.length * 100) : 0)
const allRequiredDone = computed(() => checklist.value.filter(c => c.required).every(c => c.checked))

function proceed() {
    if (jobStore.jobType === 'HOUSE_SHIFT') {
        // HOUSE_SHIFT path: UNLOADING_INVENTORY → FINAL_CHECKLIST → POC_CAPTURE
        // Step through FINAL_CHECKLIST first if needed
        if (jobStore.canTransitionTo('FINAL_CHECKLIST')) {
            try { jobStore.transition('FINAL_CHECKLIST') } catch { /* already past it */ }
        }
        if (jobStore.canTransitionTo('POC_CAPTURE')) {
            advanceAndNavigate('POC_CAPTURE')
        } else if (jobStore.jobState === 'COMPLETED') {
            // Already completed — go straight to completion screen
            router.push('/job-completion')
        } else {
            // FSM state is out of sync — force it to POC_CAPTURE before navigating
            jobStore.jobState = 'POC_CAPTURE'
            router.push('/customer-signoff')
        }
    } else {
        if (!jobStore.canTransitionTo('POD_CAPTURE')) {
            jobStore.jobState = 'SERVICE_CHECKLIST'
        }
        advanceAndNavigate('POD_CAPTURE')
    }
}
</script>
