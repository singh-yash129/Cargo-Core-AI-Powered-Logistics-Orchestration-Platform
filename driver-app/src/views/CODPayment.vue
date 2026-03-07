<template>
    <div class="screen-layout" :class="isDark ? 'bg-background-dark text-white' : 'bg-background-light text-gray-900'">

        <!-- ── HEADER ───────────────────────────────── -->
        <header class="flex-shrink-0 px-5 pt-5 pb-4 border-b" :class="isDark ? 'border-white/5' : 'border-gray-100'">
            <div class="flex items-center gap-3 mb-1">
                <button @click="$router.back()" class="w-10 h-10 rounded-full flex items-center justify-center border"
                    :class="isDark ? 'bg-surface-dark border-white/5 text-gray-400' : 'bg-white border-gray-200 shadow-sm'">
                    <span class="material-icons text-xl">arrow_back</span>
                </button>
                <h1 class="text-2xl font-black tracking-tight">COD Collection</h1>
            </div>

            <!-- Amount Card -->
            <div class="mt-3 rounded-2xl p-4 text-center border-2 border-signal-amber/30 relative overflow-hidden"
                :class="isDark ? 'bg-signal-amber/10' : 'bg-amber-50'">
                <div
                    class="absolute -top-6 -right-6 w-20 h-20 bg-signal-amber/15 rounded-full blur-2xl pointer-events-none">
                </div>
                <p class="text-xs font-bold uppercase tracking-widest text-signal-amber mb-1">Amount to Collect</p>
                <div class="text-5xl font-black">₹<span :class="amountMatches ? 'text-primary' : ''">{{ targetAmount
                        }}</span></div>
                <p class="text-xs mt-1" :class="isDark ? 'text-gray-400' : 'text-gray-500'">Stop #3 · Neha Gupta</p>
            </div>

            <!-- Method Tabs -->
            <div class="flex gap-2 mt-3">
                <button v-for="method in ['cash', 'upi']" :key="method" @click="paymentMethod = method"
                    class="flex-1 py-2 rounded-xl text-sm font-bold uppercase tracking-wide border transition-all"
                    :class="paymentMethod === method
                        ? 'bg-primary text-background-dark border-primary'
                        : isDark ? 'bg-surface-dark/30 border-white/5 text-gray-400' : 'bg-white border-gray-200 text-gray-500'">
                    {{ method }}
                </button>
            </div>
        </header>

        <!-- ── SCROLLABLE BODY ───────────────────────── -->
        <div class="screen-body px-5 py-4">

            <!-- CASH: Denomination Counter -->
            <div v-if="paymentMethod === 'cash'" class="space-y-2">
                <div v-for="denom in denominations" :key="denom.value"
                    class="flex items-center justify-between p-4 rounded-2xl border"
                    :class="isDark ? 'bg-surface-dark/30 border-white/5' : 'bg-white border-gray-100 shadow-sm'">
                    <div>
                        <p class="text-lg font-black">₹{{ denom.value }}</p>
                        <p class="text-xs" :class="isDark ? 'text-gray-500' : 'text-gray-400'">{{ denom.count > 0 ? `=
                            ₹${denom.value * denom.count}` : '—' }}</p>
                    </div>
                    <div class="flex items-center gap-3">
                        <button @click="denom.count = Math.max(0, denom.count - 1)"
                            class="w-9 h-9 rounded-full border flex items-center justify-center text-xl font-bold"
                            :class="isDark ? 'border-white/10 bg-surface-dark hover:border-white/20' : 'border-gray-200 bg-gray-50 hover:border-gray-300'">−</button>
                        <span class="text-xl font-black w-6 text-center">{{ denom.count }}</span>
                        <button @click="denom.count++"
                            class="w-9 h-9 rounded-full border flex items-center justify-center text-xl font-bold"
                            :class="isDark ? 'border-primary/40 bg-primary/10 text-primary' : 'border-primary/30 bg-primary/10 text-primary'">+</button>
                    </div>
                </div>

                <!-- Total -->
                <div class="flex justify-between items-center p-4 rounded-2xl border-2 mt-2"
                    :class="amountMatches ? 'border-primary/40 bg-primary/8' : isDark ? 'border-white/10 bg-surface-dark/30' : 'border-gray-200 bg-white'">
                    <span class="font-bold">Total Collected</span>
                    <span class="text-2xl font-black" :class="amountMatches ? 'text-primary' : ''">₹{{ totalCollected
                        }}</span>
                </div>
            </div>

            <!-- UPI QR -->
            <div v-if="paymentMethod === 'upi'" class="flex flex-col items-center gap-4 py-4">
                <div class="w-56 h-56 rounded-2xl border-2 border-primary/30 flex items-center justify-center text-center"
                    :class="isDark ? 'bg-white/5' : 'bg-white'">
                    <div>
                        <span class="material-icons text-6xl text-primary">qr_code_2</span>
                        <p class="text-xs font-bold mt-2" :class="isDark ? 'text-gray-400' : 'text-gray-500'">
                            cargocore.pay/drv2049</p>
                    </div>
                </div>
                <p class="text-sm" :class="isDark ? 'text-gray-400' : 'text-gray-500'">Payment auto-confirmed on receipt
                </p>
                <button @click="simulateUpiPaid"
                    class="px-6 py-2 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-bold">
                    Simulate Payment Received
                </button>
            </div>
        </div>

        <!-- ── STICKY FOOTER ────────────────────────── -->
        <div class="screen-footer px-5 py-4 border-t"
            :class="isDark ? 'border-white/5 bg-background-dark' : 'border-gray-100 bg-background-light'">
            <button @click="confirmCOD" :disabled="!canConfirm"
                class="w-full rounded-2xl h-14 flex items-center justify-center gap-2 font-black text-lg active:scale-[0.98]"
                :class="canConfirm ? 'bg-primary text-background-dark shadow-glow' : isDark ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-gray-100 text-gray-400 cursor-not-allowed'">
                <span class="material-icons">check_circle</span>
                Confirm ₹{{ targetAmount }} Collected
            </button>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUiStore } from '../stores/uiStore.js'

const route = useRoute()
const router = useRouter()
const uiStore = useUiStore()
const isDark = computed(() => uiStore.theme !== 'light')

const targetAmount = 450
const paymentMethod = ref('cash')
const upiPaid = ref(false)

const denominations = ref([
    { value: 500, count: 0 }, { value: 200, count: 0 }, { value: 100, count: 0 },
    { value: 50, count: 0 }, { value: 20, count: 0 }, { value: 10, count: 0 },
])

const totalCollected = computed(() => denominations.value.reduce((s, d) => s + d.value * d.count, 0))
const amountMatches = computed(() => totalCollected.value === targetAmount)
const canConfirm = computed(() => (paymentMethod.value === 'cash' && amountMatches.value) || (paymentMethod.value === 'upi' && upiPaid.value))

function simulateUpiPaid() { upiPaid.value = true }
function confirmCOD() {
    router.push('/pod/' + (route.params.id || 'STOP-003'))
}
</script>
