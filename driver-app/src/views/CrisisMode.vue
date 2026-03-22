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
            <div class="rounded-3xl p-5 text-center relative border border-red-500/30"
                :class="isDark ? 'bg-surface-dark/40 border-white/8' : 'bg-white border-red-100 shadow-sm'">
                <div class="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
                    <div class="absolute inset-0 bg-red-500/5"></div>
                    <div class="absolute -top-12 -right-12 w-36 h-36 bg-red-500/20 rounded-full blur-2xl">
                    </div>
                </div>
                <div class="relative z-10 flex flex-col items-center">
                    <div class="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mb-3">
                        <span class="material-icons text-red-500 text-2xl animate-pulse">warning</span>
                    </div>
                    <p class="text-xs font-bold uppercase tracking-widest text-red-500 mb-2">Emergency Mode Active</p>
                    <p class="text-xs leading-relaxed" :class="isDark ? 'text-gray-300' : 'text-gray-600'">
                        All alerts are being sent to Dispatch &amp; Emergency Operations Center
                    </p>
                </div>
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
                    <a v-for="contact in contacts" :key="contact.name" :href="'tel:' + contact.phone"
                        class="flex items-center justify-between p-2 -mx-2 rounded-xl transition-colors active:scale-[0.98]"
                        :class="isDark ? 'hover:bg-white/5' : 'hover:bg-gray-50'">
                        <div>
                            <p class="text-sm font-semibold">{{ contact.name }}</p>
                            <p class="text-xs" :class="isDark ? 'text-gray-500' : 'text-gray-400'">{{ contact.role }}
                            </p>
                        </div>
                        <div
                            class="w-10 h-10 rounded-full flex items-center justify-center bg-primary/20 text-primary flex-shrink-0">
                            <span class="material-icons">phone</span>
                        </div>
                    </a>
                </div>
            </div>

            <!-- Active Alert (SOS) -->
            <div v-if="sosActive"
                class="rounded-2xl border-2 border-red-500/50 p-4 flex items-center gap-3 animate-pulse relative pr-12"
                style="background: rgba(239,68,68,0.1);">
                <div
                    class="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center animate-pulse flex-shrink-0">
                    <span class="material-icons text-white text-lg">warning</span>
                </div>
                <div>
                    <p class="font-black text-red-400 text-sm">SOS Active — GPS Shared</p>
                    <p class="text-[10px]" :class="isDark ? 'text-gray-400' : 'text-gray-600'">Location sent to
                        Dispatch,
                        Emergency Response, Fleet Manager</p>
                </div>
                <button @click="sosActive = false"
                    class="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/10 active:scale-95 text-red-400">
                    <span class="material-icons">close</span>
                </button>
            </div>
        </div>

        <!-- ── CONFIRMATION MODAL ───────────────────────── -->
        <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0 scale-95"
            enter-to-class="opacity-100 scale-100" leave-active-class="transition duration-150 ease-in"
            leave-from-class="opacity-100 scale-100" leave-to-class="opacity-0 scale-95">
            <div v-if="selectedAction"
                class="fixed inset-0 z-50 flex items-center justify-center p-5 bg-black/50 backdrop-blur-sm">
                <div class="w-full max-w-sm rounded-3xl p-6 border shadow-2xl"
                    :class="isDark ? 'bg-surface-dark border-white/10' : 'bg-white border-gray-200'">
                    <div class="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                        :class="selectedAction.primary ? 'bg-red-500/20 text-red-400' : 'bg-primary/20 text-primary'">
                        <span class="material-icons text-3xl">{{ selectedAction.icon }}</span>
                    </div>
                    <h2 class="text-xl font-black text-center mb-2">{{ selectedAction.label }}</h2>
                    <p class="text-sm text-center mb-6" :class="isDark ? 'text-gray-400' : 'text-gray-500'">
                        Are you sure you want to trigger this emergency action?
                        <span v-if="selectedAction.id === 'sos'" class="block mt-1 font-bold text-red-400">This will
                            immediately broadcast your location.</span>
                    </p>
                    <div class="flex gap-3">
                        <button @click="selectedAction = null"
                            class="flex-1 py-3.5 rounded-xl font-bold uppercase tracking-wide text-xs transition-colors"
                            :class="isDark ? 'bg-white/5 hover:bg-white/10 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'">
                            Cancel
                        </button>
                        <button @click="confirmAction"
                            class="flex-1 py-3.5 rounded-xl font-bold uppercase tracking-wide text-xs text-white shadow-glow transition-transform active:scale-95"
                            :class="selectedAction.primary ? 'bg-red-500 shadow-glow-red' : 'bg-primary'">
                            Confirm
                        </button>
                    </div>
                </div>
            </div>
        </Transition>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useUiStore } from '../stores/uiStore.js'
import { useLocalNotifications } from '../composables/useLocalNotifications.js'

const uiStore = useUiStore()
const { notify } = useLocalNotifications()
const isDark = computed(() => uiStore.theme !== 'light')
const sosActive = ref(false)
const selectedAction = ref(null)

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
    selectedAction.value = action
}

function confirmAction() {
    if (!selectedAction.value) return

    if (selectedAction.value.id === 'sos') {
        sosActive.value = true
        uiStore.showToast('🚨 SOS Alert sent — GPS location shared', 'error')
        notify({ title: 'SOS Activated', body: 'Emergency alert sent — GPS shared with dispatch', type: 'error' })
    } else {
        uiStore.showToast(`${selectedAction.value.label} reported to dispatch`, 'warning')
        notify({ title: selectedAction.value.label, body: 'Reported to dispatch control', type: 'warning' })
    }
    selectedAction.value = null
}
</script>
