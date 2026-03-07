<template>
    <div class="screen-layout" :class="isDark ? 'bg-background-dark text-white' : 'bg-background-light text-gray-900'">

        <!-- ── HEADER ───────────────────────────────── -->
        <header class="flex-shrink-0 px-5 pt-5 pb-4 border-b" :class="isDark ? 'border-white/5' : 'border-gray-100'">
            <div class="flex items-center gap-3">
                <button @click="$router.back()" class="w-10 h-10 rounded-full flex items-center justify-center border"
                    :class="isDark ? 'bg-surface-dark border-white/5 text-gray-400' : 'bg-white border-gray-200 shadow-sm'">
                    <span class="material-icons text-xl">arrow_back</span>
                </button>
                <h1 class="text-2xl font-black tracking-tight text-red-400">🚨 Crisis Mode</h1>
            </div>
        </header>

        <!-- ── SCROLLABLE BODY ───────────────────────── -->
        <div class="screen-body px-5 py-4 flex flex-col gap-4">

            <!-- Panic Banner -->
            <div class="rounded-3xl p-5 text-center border-2 border-red-500/40 relative overflow-hidden" :style="isDark
                ? 'background: linear-gradient(135deg, rgba(239,68,68,0.2), rgba(239,68,68,0.05))'
                : 'background: linear-gradient(135deg, rgba(239,68,68,0.1), rgba(239,68,68,0.02))'">
                <div
                    class="absolute -top-10 -right-10 w-32 h-32 bg-red-500/15 rounded-full blur-3xl pointer-events-none">
                </div>
                <p class="text-xs font-bold uppercase tracking-widest text-red-400 mb-2">Emergency Mode Active</p>
                <p class="text-sm" :class="isDark ? 'text-gray-300' : 'text-gray-600'">
                    All alerts are being sent to Dispatch &amp; Emergency Operations Center
                </p>
            </div>

            <!-- Emergency Actions -->
            <div class="grid grid-cols-1 gap-3">
                <button v-for="action in emergencyActions" :key="action.id" @click="triggerAction(action)"
                    class="flex items-center gap-4 p-5 rounded-2xl border-2 font-bold text-lg active:scale-[0.98] transition-all"
                    :class="action.primary
                        ? 'border-red-500/50 text-red-400 shadow-glow-red'
                        : isDark ? 'border-white/10 text-white hover:border-white/20' : 'border-gray-200 text-gray-700 hover:border-gray-300 bg-white shadow-sm'"
                    :style="action.primary ? 'background: rgba(239,68,68,0.12)' : ''">
                    <div class="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                        :class="action.primary ? 'bg-red-500/20' : isDark ? 'bg-white/5' : 'bg-gray-50'">
                        <span class="material-icons text-2xl"
                            :class="action.primary ? 'text-red-400' : isDark ? 'text-gray-300' : 'text-gray-600'">{{
                                action.icon }}</span>
                    </div>
                    <div class="text-left flex-1">
                        <p class="font-black">{{ action.label }}</p>
                        <p class="text-xs font-normal mt-0.5" :class="isDark ? 'text-gray-400' : 'text-gray-500'">{{
                            action.description }}</p>
                    </div>
                    <span class="material-icons"
                        :class="isDark ? 'text-gray-500' : 'text-gray-400'">chevron_right</span>
                </button>
            </div>

            <!-- Emergency Contacts -->
            <div class="rounded-2xl border p-4"
                :class="isDark ? 'bg-surface-dark/30 border-white/5' : 'bg-white border-gray-100 shadow-sm'">
                <h3 class="text-xs font-bold uppercase tracking-widest mb-3"
                    :class="isDark ? 'text-gray-400' : 'text-gray-500'">Emergency Contacts</h3>
                <div class="space-y-3">
                    <div v-for="contact in contacts" :key="contact.name" class="flex items-center justify-between">
                        <div>
                            <p class="text-sm font-semibold">{{ contact.name }}</p>
                            <p class="text-xs" :class="isDark ? 'text-gray-500' : 'text-gray-400'">{{ contact.role }}
                            </p>
                        </div>
                        <a :href="'tel:' + contact.phone"
                            class="w-10 h-10 rounded-full flex items-center justify-center bg-primary/20 text-primary">
                            <span class="material-icons">phone</span>
                        </a>
                    </div>
                </div>
            </div>

            <!-- Active Alert (SOS) -->
            <div v-if="sosActive"
                class="rounded-2xl border-2 border-red-500/50 p-4 flex items-center gap-3 animate-pulse"
                style="background: rgba(239,68,68,0.1);">
                <div class="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center animate-pulse">
                    <span class="material-icons text-white text-lg">warning</span>
                </div>
                <div>
                    <p class="font-black text-red-400">SOS Active — GPS Shared</p>
                    <p class="text-xs" :class="isDark ? 'text-gray-400' : 'text-gray-600'">Location sent to Dispatch,
                        Emergency Response, Fleet Manager</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useUiStore } from '../stores/uiStore.js'

const uiStore = useUiStore()
const isDark = computed(() => uiStore.theme !== 'light')
const sosActive = ref(false)

const emergencyActions = [
    { id: 'sos', label: 'SOS Alert', description: 'Send GPS location to dispatch immediately', icon: 'emergency', primary: true },
    { id: 'accident', label: 'Accident Report', description: 'Notify fleet ops, log incident automatically', icon: 'car_crash', primary: false },
    { id: 'breakdown', label: 'Vehicle Breakdown', description: 'Request roadside assistance + tow truck', icon: 'build', primary: false },
    { id: 'security', label: 'Security Threat', description: 'Alert security team + local authorities', icon: 'security', primary: false },
    { id: 'medical', label: 'Medical Emergency', description: 'Call ambulance, notify emergency contact', icon: 'local_hospital', primary: false },
]

const contacts = [
    { name: 'Dispatch Control', role: 'Operations Hotline', phone: '18001234567' },
    { name: 'Fleet Manager', role: 'North-East Hub', phone: '9987654321' },
    { name: 'Emergency Response', role: '24/7 Available', phone: '112' },
]

function triggerAction(action) {
    if (action.id === 'sos') {
        sosActive.value = true
        uiStore.showToast('🚨 SOS Alert sent — GPS location shared', 'error')
    } else {
        uiStore.showToast(`${action.label} reported to dispatch`, 'warning')
    }
}
</script>
