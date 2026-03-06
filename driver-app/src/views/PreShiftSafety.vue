<template>
    <div class="min-h-screen pb-8 overflow-y-auto no-scrollbar"
        :class="isDark ? 'bg-background-dark text-white' : 'bg-background-light text-gray-900'">

        <!-- Ambient glow -->
        <div
            class="absolute top-10 left-1/2 -translate-x-1/2 w-64 h-64 bg-primary/8 rounded-full blur-[100px] pointer-events-none z-0">
        </div>

        <div class="relative z-10 px-5 flex flex-col h-full">
            <!-- Header -->
            <header class="pt-6 mb-7">
                <div class="flex items-center justify-between mb-3">
                    <div class="flex items-center gap-2 px-3 py-1 rounded-full border"
                        :class="isDark ? 'bg-primary/10 border-primary/20' : 'bg-primary/10 border-primary/30'">
                        <div class="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
                        <span class="text-xs font-bold uppercase tracking-wider text-primary">Pre-Shift</span>
                    </div>
                    <button @click="$router.push('/settings')" class="transition-colors"
                        :class="isDark ? 'text-gray-400 hover:text-white' : 'text-gray-400 hover:text-gray-800'">
                        <span class="material-icons">help_outline</span>
                    </button>
                </div>
                <h1 class="text-4xl font-black tracking-tight bg-clip-text text-transparent"
                    style="background-image: linear-gradient(135deg, white, rgba(255,255,255,0.5)); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
                    Ready to Go?
                </h1>
                <p class="mt-2 text-sm" :class="isDark ? 'text-gray-400' : 'text-gray-500'">
                    Daily authorization &amp; hours-of-service check · Shift #402
                </p>
            </header>

            <!-- Authorization Card -->
            <div class="rounded-2xl p-5 mb-6 border"
                :class="isDark ? 'bg-surface-dark/40 border-white/8' : 'bg-white border-gray-100 shadow-sm'">
                <h3 class="text-xs uppercase font-bold tracking-widest mb-4"
                    :class="isDark ? 'text-gray-400' : 'text-gray-500'">Authorization Status</h3>

                <div class="space-y-3">
                    <div v-for="check in authChecks" :key="check.id"
                        class="flex items-center gap-3 p-3 rounded-xl border transition-all" :class="check.ok
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
                        <span v-if="check.ok" class="material-icons text-primary text-xl">check_circle</span>
                    </div>
                </div>
            </div>

            <!-- Hours of Service -->
            <div class="rounded-2xl p-5 mb-8 border"
                :class="isDark ? 'bg-surface-dark/30 border-white/5' : 'bg-white border-gray-100 shadow-sm'">
                <div class="flex items-center justify-between mb-3">
                    <h3 class="text-xs uppercase font-bold tracking-widest"
                        :class="isDark ? 'text-gray-400' : 'text-gray-500'">Hours of Service</h3>
                    <span class="text-xs font-bold text-primary">5h 20m Today</span>
                </div>
                <div class="w-full rounded-full h-2 mb-2" :class="isDark ? 'bg-gray-800' : 'bg-gray-100'">
                    <div class="h-2 rounded-full bg-gradient-to-r from-primary to-accent-blue" style="width: 37%"></div>
                </div>
                <div class="flex justify-between text-[10px]" :class="isDark ? 'text-gray-500' : 'text-gray-400'">
                    <span>5h 20m used</span>
                    <span class="text-primary">9h 10m remaining</span>
                    <span>14h max</span>
                </div>
            </div>

            <!-- Confirm Button -->
            <button @click="proceed"
                class="w-full rounded-2xl h-16 flex items-center justify-center gap-3 font-black text-lg text-background-dark shadow-glow transition-all active:scale-[0.98]"
                style="background: linear-gradient(135deg, #1CE783, #15b86a);">
                <span class="material-icons text-2xl">verified_user</span>
                <span>Confirm &amp; Proceed</span>
            </button>

            <p class="text-center text-xs mt-4" :class="isDark ? 'text-gray-600' : 'text-gray-400'">
                All actions are logged in the non-editable audit ledger
            </p>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUiStore } from '../stores/uiStore.js'

const router = useRouter()
const uiStore = useUiStore()
const isDark = computed(() => uiStore.theme !== 'light')

const authChecks = ref([
    { id: 1, label: 'RBAC Credential Verified', status: 'DRV-2049 · Active', ok: true, icon: 'badge' },
    { id: 2, label: 'Roster Authorized', status: 'Shift-402 · North-East Hub', ok: true, icon: 'assignment' },
    { id: 3, label: 'Driver License Valid', status: 'Expires 2028-12-31', ok: true, icon: 'card_membership' },
    { id: 4, label: 'Medical Fitness', status: 'Cleared – Last check Mar 1', ok: true, icon: 'health_and_safety' },
])

function proceed() {
    router.push('/vehicle-binding')
}
</script>
