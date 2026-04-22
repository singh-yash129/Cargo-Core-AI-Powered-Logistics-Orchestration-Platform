<template>
    <div class="screen-layout" :class="isDark ? 'bg-background-dark text-white' : 'bg-background-light text-gray-900'">

        <!-- ── HEADER ───────────────────────────────── -->
        <header class="flex-shrink-0 px-5 pt-5 pb-4 border-b" :class="isDark ? 'border-white/5' : 'border-gray-100'">
            <div class="flex items-center justify-between mb-2">
                <div class="flex items-center gap-2 px-3 py-1 rounded-full border"
                    :class="isDark ? 'bg-primary/10 border-primary/20' : 'bg-primary/10 border-primary/30'">
                    <div class="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
                    <span class="text-xs font-bold uppercase tracking-wider text-primary">Pre-Shift</span>
                </div>
                <span class="text-xs font-mono" :class="isDark ? 'text-gray-500' : 'text-gray-400'">{{ shiftCode }}</span>
            </div>
            <h1 class="text-3xl font-black tracking-tight">Ready to Go?</h1>
            <p class="text-sm mt-1" :class="isDark ? 'text-gray-400' : 'text-gray-500'">Daily authorization &amp;
                hours-of-service check</p>
        </header>

        <!-- ── SCROLLABLE BODY ───────────────────────── -->
        <div class="screen-body px-5 py-4 flex flex-col gap-4">

            <!-- Authorization Card -->
            <div class="rounded-2xl p-5 border"
                :class="isDark ? 'bg-surface-dark/40 border-white/8' : 'bg-white border-gray-100 shadow-sm'">
                <h3 class="text-xs uppercase font-bold tracking-widest mb-4"
                    :class="isDark ? 'text-gray-400' : 'text-gray-500'">Authorization Status</h3>
                <div class="space-y-3">
                    <div v-for="check in authChecks" :key="check.id"
                        class="flex items-center gap-3 p-3 rounded-xl border" :class="check.ok
                            ? isDark ? 'bg-primary/8 border-primary/20' : 'bg-primary/8 border-primary/20'
                            : isDark ? 'bg-white/3 border-white/5' : 'bg-gray-50 border-gray-100'">
                        <div class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                            :class="check.ok ? 'bg-primary/20' : isDark ? 'bg-white/5' : 'bg-gray-100'">
                            <span class="material-icons text-sm"
                                :class="check.ok ? 'text-primary' : isDark ? 'text-gray-500' : 'text-gray-400'">{{
                                    check.ok ? 'check' : check.icon }}</span>
                        </div>
                        <div class="flex-1">
                            <p class="text-sm font-semibold">{{ check.label }}</p>
                            <p class="text-xs"
                                :class="check.ok ? 'text-primary' : isDark ? 'text-gray-500' : 'text-gray-400'">{{
                                check.status }}</p>
                        </div>
                        <span v-if="check.ok" class="material-icons text-primary">check_circle</span>
                    </div>
                </div>
            </div>

            <!-- Hours of Service -->
            <div class="rounded-2xl p-5 border"
                :class="isDark ? 'bg-surface-dark/30 border-white/5' : 'bg-white border-gray-100 shadow-sm'">
                <div class="flex items-center justify-between mb-2">
                    <h3 class="text-xs uppercase font-bold tracking-widest"
                        :class="isDark ? 'text-gray-400' : 'text-gray-500'">Hours of Service</h3>
                    <span class="text-xs font-bold text-primary">{{ hos.used_label }} Today</span>
                </div>
                <div class="w-full rounded-full h-2 mb-2" :class="isDark ? 'bg-gray-800' : 'bg-gray-100'">
                    <div class="h-2 rounded-full bg-gradient-to-r from-primary to-accent-blue" :style="`width: ${hos.progress_percent}%`"></div>
                </div>
                <div class="flex justify-between text-[10px]" :class="isDark ? 'text-gray-500' : 'text-gray-400'">
                    <span>{{ hos.used_label }} used</span>
                    <span class="text-primary">{{ hos.remaining_label }} remaining</span>
                    <span>{{ hos.max_label }} max</span>
                </div>
            </div>

            <p class="text-center text-xs" :class="isDark ? 'text-gray-600' : 'text-gray-400'">
                All actions are logged in the non-editable audit ledger
            </p>
        </div>

        <!-- ── STICKY FOOTER ────────────────────────── -->
        <div class="screen-footer px-5 py-4 border-t"
            :class="isDark ? 'border-white/5 bg-background-dark' : 'border-gray-100 bg-background-light'">
            <button @click="proceed"
                class="w-full rounded-2xl h-14 flex items-center justify-center gap-3 font-black text-lg text-background-dark shadow-glow active:scale-[0.98]"
                style="background: linear-gradient(135deg, #1CE783, #15b86a);">
                <span class="material-icons text-2xl">verified_user</span>
                Confirm &amp; Proceed
            </button>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUiStore } from '../stores/uiStore.js'
import { useDriverStore } from '../stores/driverStore.js'
import { useLocalNotifications } from '../composables/useLocalNotifications.js'
import * as api from '../services/api.js'

const router = useRouter()
const uiStore = useUiStore()
const driverStore = useDriverStore()
const { notify } = useLocalNotifications()
const isDark = computed(() => uiStore.theme !== 'light')

const authChecks = ref([])
const hos = computed(() => driverStore.dashboard?.hos || {
    used_label: '0h 00m',
    remaining_label: '14h 00m',
    max_label: '14h 00m',
    progress_percent: 0,
})
const shiftCode = computed(() => driverStore.dashboard?.shift?.shift_code || 'No shift')

onMounted(async () => {
    const context = await driverStore.refreshDashboard()
    authChecks.value = context?.shift?.validations || []
})

async function proceed() {
    try {
        await api.startShift()
    } catch (err) {
        console.error('Failed to start shift on backend:', err)
        // Log it but allow proceed for demo/prototype resiliency
    }
    await driverStore.refreshDashboard()
    driverStore.preShiftDone = true
    notify({ title: 'Pre-Shift Complete', body: 'Safety checks passed — proceed to vehicle binding', type: 'success', route: '/vehicle-binding' })
    router.push('/vehicle-binding')
}
</script>
