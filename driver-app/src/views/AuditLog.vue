<template>
    <div class="screen-layout" :class="isDark ? 'bg-background-dark text-white' : 'bg-background-light text-gray-900'">

        <!-- ── HEADER ───────────────────────────────── -->
        <header class="flex-shrink-0 px-5 pt-5 pb-4 border-b" :class="isDark ? 'border-white/5' : 'border-gray-100'">
            <div class="flex items-center gap-3">
                <button @click="$router.back()" class="w-10 h-10 rounded-full flex items-center justify-center border"
                    :class="isDark ? 'bg-surface-dark border-white/5 text-gray-400' : 'bg-white border-gray-200 shadow-sm'">
                    <span class="material-icons text-xl">arrow_back</span>
                </button>
                <h1 class="text-2xl font-black tracking-tight">Audit Log</h1>
            </div>
        </header>

        <!-- ── SCROLLABLE BODY ───────────────────────── -->
        <div class="screen-body px-5 py-4 flex flex-col gap-4">

            <div class="rounded-2xl border overflow-hidden"
                :class="isDark ? 'border-white/5' : 'border-gray-100 shadow-sm'">
                <div class="px-4 py-3 border-b"
                    :class="isDark ? 'bg-surface-dark/50 border-white/5' : 'bg-gray-50 border-gray-100'">
                    <p class="text-xs font-bold uppercase tracking-widest"
                        :class="isDark ? 'text-gray-400' : 'text-gray-500'">Today's Audit Trail (Immutable)</p>
                </div>
                <div class="divide-y" :class="isDark ? 'divide-gray-800' : 'divide-gray-100'">
                    <div v-for="event in auditEvents" :key="event.id" class="flex items-start gap-3 px-4 py-3">
                        <div class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                            :class="isDark ? 'bg-surface-dark' : 'bg-gray-50'">
                            <span class="material-icons text-sm" :class="event.color">{{ event.icon }}</span>
                        </div>
                        <div class="flex-1 min-w-0">
                            <p class="text-sm font-semibold">{{ event.action }}</p>
                            <p class="text-xs" :class="isDark ? 'text-gray-500' : 'text-gray-400'">{{ event.detail }}
                            </p>
                        </div>
                        <span class="text-[10px] font-mono flex-shrink-0"
                            :class="isDark ? 'text-gray-600' : 'text-gray-400'">{{ event.time }}</span>
                    </div>
                </div>
            </div>

            <p class="text-center text-xs" :class="isDark ? 'text-gray-600' : 'text-gray-400'">
                All entries are cryptographically signed and non-editable
            </p>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue'
import { useUiStore } from '../stores/uiStore.js'

const uiStore = useUiStore()
const isDark = computed(() => uiStore.theme !== 'light')

const auditEvents = [
    { id: 1, icon: 'login', color: 'text-primary', action: 'Shift Started — Driver Authenticated', detail: 'DRV-2049 · RBAC Level 3', time: '07:58' },
    { id: 2, icon: 'directions_car', color: 'text-accent-blue', action: 'Vehicle Bound', detail: 'CC-TRK-042 · MH 04 AB 2049', time: '08:02' },
    { id: 3, icon: 'build', color: 'text-accent-gold', action: 'Inspection Completed', detail: '6/6 items passed', time: '08:11' },
    { id: 4, icon: 'exit_to_app', color: 'text-primary', action: 'Gate Exit Logged', detail: 'North-East Hub · Gate 7', time: '08:19' },
    { id: 5, icon: 'place', color: 'text-accent-purple', action: 'Geofence Arrival — Stop #1', detail: '14B Andheri West', time: '08:48' },
    { id: 6, icon: 'payments', color: 'text-signal-amber', action: 'COD Collected — ₹450', detail: 'Stop #3 · Neha Gupta', time: '11:34' },
    { id: 7, icon: 'verified', color: 'text-primary', action: 'Delivery Completed — Stop #1', detail: 'POD + OTP verified', time: '10:12' },
]
</script>
