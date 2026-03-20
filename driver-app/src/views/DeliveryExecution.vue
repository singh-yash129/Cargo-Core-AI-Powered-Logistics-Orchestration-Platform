<template>
    <div class="screen-layout" :class="isDark ? 'bg-background-dark text-white' : 'bg-background-light text-gray-900'">

        <!-- ── HEADER ───────────────────────────────── -->
        <header class="flex-shrink-0 px-5 pt-5 pb-4 border-b" :class="isDark ? 'border-white/5' : 'border-gray-100'">
            <div class="flex items-center gap-3">
                <button @click="$router.back()" class="w-10 h-10 rounded-full flex items-center justify-center border"
                    :class="isDark ? 'bg-surface-dark border-white/5 text-gray-400' : 'bg-white border-gray-200 shadow-sm'">
                    <span class="material-icons text-xl">arrow_back</span>
                </button>
                <div class="flex-1 min-w-0">
                    <h1 class="text-xl font-black tracking-tight leading-tight">Delivery Details</h1>
                    <p class="text-xs font-semibold" :class="isDark ? 'text-gray-400' : 'text-gray-500'">
                        Stop #1 · Arrived <span class="text-primary">{{ time }}</span>
                    </p>
                </div>
                <!-- Dwell timer badge -->
                <div class="px-3 py-1.5 rounded-full border text-xs font-black font-mono"
                    :class="isDark ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-primary/10 border-primary/30 text-primary'">
                    {{ dwellTime }}
                </div>
            </div>
        </header>

        <!-- ── SCROLLABLE BODY ───────────────────────── -->
        <div class="screen-body px-5 py-4 flex flex-col gap-4">

            <!-- Customer Card -->
            <div class="rounded-2xl p-5 border"
                :class="isDark ? 'bg-surface-dark/40 border-white/8' : 'bg-white border-gray-100 shadow-sm'">
                <p class="text-[10px] font-black uppercase tracking-widest mb-2"
                    :class="isDark ? 'text-gray-500' : 'text-gray-400'">Customer</p>
                <div class="flex items-start gap-3">
                    <div class="w-11 h-11 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
                        <span class="material-icons text-primary leading-none" style="font-size:20px;">person</span>
                    </div>
                    <div class="flex-1 min-w-0">
                        <p class="font-black text-base leading-tight">Priya &amp; Rohit Mehta</p>
                        <p class="text-xs mt-0.5" :class="isDark ? 'text-gray-400' : 'text-gray-500'">+91 98765 43210</p>
                    </div>
                    <a href="tel:+919876543210"
                        class="w-9 h-9 rounded-full flex items-center justify-center border shrink-0"
                        :class="isDark ? 'border-white/10 bg-white/5 text-gray-300' : 'border-gray-200 bg-gray-50 text-gray-600'">
                        <span class="material-icons leading-none" style="font-size:16px;">call</span>
                    </a>
                </div>

                <!-- Divider -->
                <div class="h-px my-4" :class="isDark ? 'bg-white/5' : 'bg-gray-100'"></div>

                <!-- Address -->
                <div class="flex items-start gap-2">
                    <span class="material-icons text-primary leading-none mt-0.5" style="font-size:16px;">place</span>
                    <div>
                        <p class="text-sm font-semibold leading-snug">14B, Andheri West, Near JVLR</p>
                        <p class="text-xs mt-0.5" :class="isDark ? 'text-gray-500' : 'text-gray-400'">Mumbai · 400053 · 3rd Floor · No Lift</p>
                    </div>
                </div>
            </div>

            <!-- Parcel / Items -->
            <div class="rounded-2xl p-5 border"
                :class="isDark ? 'bg-surface-dark/40 border-white/8' : 'bg-white border-gray-100 shadow-sm'">
                <p class="text-[10px] font-black uppercase tracking-widest mb-3"
                    :class="isDark ? 'text-gray-500' : 'text-gray-400'">Parcels to Deliver</p>
                <div class="flex flex-col gap-2">
                    <div v-for="item in parcels" :key="item.id"
                        class="flex items-center gap-3 p-3 rounded-xl"
                        :class="isDark ? 'bg-black/20' : 'bg-gray-50'">
                        <div class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                            :class="isDark ? 'bg-white/5' : 'bg-white border border-gray-200'">
                            <span class="material-icons leading-none text-primary" style="font-size:15px;">inventory_2</span>
                        </div>
                        <div class="flex-1 min-w-0">
                            <p class="text-sm font-semibold leading-tight truncate">{{ item.label }}</p>
                            <p class="text-[10px] mt-0.5" :class="isDark ? 'text-gray-500' : 'text-gray-400'">{{ item.weight }} · {{ item.dims }}</p>
                        </div>
                        <span class="text-[10px] font-black px-2 py-0.5 rounded-full"
                            :class="item.fragile ? 'bg-signal-amber/15 text-signal-amber' : isDark ? 'bg-white/5 text-gray-500' : 'bg-gray-100 text-gray-400'">
                            {{ item.fragile ? 'FRAGILE' : 'STD' }}
                        </span>
                    </div>
                </div>
            </div>

            <!-- Special Instructions -->
            <div class="rounded-2xl p-4 border flex items-start gap-3"
                :class="isDark ? 'bg-signal-amber/5 border-signal-amber/20' : 'bg-amber-50 border-amber-200'">
                <span class="material-icons text-signal-amber leading-none mt-0.5" style="font-size:18px;">info</span>
                <div>
                    <p class="text-xs font-black uppercase tracking-wide text-signal-amber mb-0.5">Special Instructions</p>
                    <p class="text-xs leading-relaxed" :class="isDark ? 'text-gray-300' : 'text-gray-600'">
                        Call before arriving. Do not leave at door. Customer requires ID verification for COD.
                    </p>
                </div>
            </div>

            <!-- COD Info (if applicable) -->
            <div class="rounded-2xl p-4 border flex items-center gap-3"
                :class="isDark ? 'bg-green-500/5 border-green-500/20' : 'bg-green-50 border-green-200'">
                <span class="material-icons text-green-400 leading-none" style="font-size:20px;">payments</span>
                <div class="flex-1">
                    <p class="text-xs font-black uppercase tracking-wide text-green-400 mb-0.5">Cash on Delivery</p>
                    <p class="text-sm font-black">₹ 3,450.00</p>
                </div>
                <span class="text-[10px] font-black px-2.5 py-1 rounded-full bg-green-500/15 text-green-400 border border-green-500/30">
                    COLLECT
                </span>
            </div>

            <!-- Exception / Damage links (secondary) -->
            <div class="flex gap-2 pt-1">
                <button @click="$router.push('/damage-report')"
                    class="flex-1 rounded-xl h-10 flex items-center justify-center gap-1.5 text-xs font-semibold border transition-all active:scale-[0.98] text-red-400"
                    :class="isDark ? 'border-red-500/20 bg-red-500/5' : 'border-red-100 bg-red-50'">
                    <span class="material-icons leading-none" style="font-size:14px;">report_problem</span>
                    Report Damage
                </button>
                <button @click="$router.push('/exception/' + stopId)"
                    class="flex-1 rounded-xl h-10 flex items-center justify-center gap-1.5 text-xs font-semibold border transition-all active:scale-[0.98] text-red-500"
                    :class="isDark ? 'border-red-500/25 bg-red-500/8' : 'border-red-200 bg-red-50'">
                    <span class="material-icons leading-none" style="font-size:14px;">cancel</span>
                    Exception
                </button>
            </div>

        </div>

        <!-- ── STICKY FOOTER ────────────────────────── -->
        <div class="screen-footer px-5 py-4 border-t"
            :class="isDark ? 'border-white/5 bg-background-dark' : 'border-gray-100 bg-background-light'">
            <button @click="beginService"
                class="w-full rounded-2xl h-14 flex items-center justify-center gap-2 font-bold text-background-dark shadow-glow active:scale-[0.98] transition-transform"
                style="background: linear-gradient(135deg, #1CE783, #15b86a);">
                <span class="material-icons text-xl">checklist</span>
                Begin Service
            </button>
        </div>

    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUiStore } from '../stores/uiStore.js'

const route = useRoute()
const router = useRouter()
const uiStore = useUiStore()
const isDark = computed(() => uiStore.theme !== 'light')
const stopId = computed(() => route.params.id || 'STOP-001')

// ── Dwell timer (counts up from arrival) ─────────────────────────────
const seconds = ref(0)
let timer = null
const dwellTime = computed(() => {
    const m = Math.floor(seconds.value / 60)
    const s = seconds.value % 60
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
})
// Arrival time label (static, set on mount)
const time = ref('')

onMounted(() => {
    time.value = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    timer = setInterval(() => seconds.value++, 1000)
})
onUnmounted(() => clearInterval(timer))

// ── Parcel data (would come from jobStore/stop data in production) ────
const parcels = [
    { id: 1, label: 'Electronics Box', weight: '4.2 kg', dims: '40×30×20 cm', fragile: true },
    { id: 2, label: 'Clothing Package', weight: '1.8 kg', dims: '35×25×10 cm', fragile: false },
    { id: 3, label: 'Documents Envelope', weight: '0.3 kg', dims: '32×24×1 cm', fragile: false },
]

// ── Navigation ────────────────────────────────────────────────────────
function beginService() {
    router.push('/service-checklist/' + stopId.value)
}
</script>
