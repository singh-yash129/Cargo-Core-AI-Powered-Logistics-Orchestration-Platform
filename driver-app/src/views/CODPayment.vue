<template>
    <div class="min-h-screen pb-safe-nav overflow-y-auto no-scrollbar"
        :class="isDark ? 'bg-background-dark text-white' : 'bg-background-light text-gray-900'">
        <div class="px-5 pt-5 pb-8 flex flex-col gap-5">

            <!-- Header -->
            <div class="flex items-center gap-3">
                <button @click="$router.back()" class="w-10 h-10 rounded-full flex items-center justify-center border"
                    :class="isDark ? 'bg-surface-dark border-white/5 text-gray-400' : 'bg-white border-gray-200 shadow-sm text-gray-500'">
                    <span class="material-icons text-xl">arrow_back</span>
                </button>
                <div>
                    <h1 class="text-2xl font-black tracking-tight">COD Collection</h1>
                    <p class="text-xs" :class="isDark ? 'text-gray-400' : 'text-gray-500'">Stop #3 · Neha Gupta</p>
                </div>
            </div>

            <!-- Amount Card -->
            <div class="rounded-3xl p-8 text-center relative overflow-hidden"
                style="background: linear-gradient(135deg, rgba(255,176,32,0.15), rgba(255,176,32,0.05)); border: 1px solid rgba(255,176,32,0.25);">
                <div
                    class="absolute -top-8 -right-8 w-32 h-32 bg-signal-amber/10 rounded-full blur-3xl pointer-events-none">
                </div>
                <p class="text-xs font-bold uppercase tracking-widest text-signal-amber mb-2">Amount to Collect</p>
                <div class="text-6xl font-black mb-1">
                    ₹<span style="color: #FFB020;">{{ codAmount.toLocaleString() }}</span>
                </div>
                <p class="text-xs" :class="isDark ? 'text-gray-400' : 'text-gray-500'">Cash on Delivery · Exact amount
                    required</p>
            </div>

            <!-- Payment Method -->
            <div class="flex flex-col gap-2">
                <p class="text-xs font-bold uppercase tracking-widest"
                    :class="isDark ? 'text-gray-400' : 'text-gray-500'">Payment Method</p>
                <div class="grid grid-cols-2 gap-3">
                    <button v-for="method in methods" :key="method.id" @click="selectedMethod = method.id"
                        class="rounded-2xl p-4 border flex flex-col items-center gap-2 transition-all active:scale-[0.97]"
                        :class="selectedMethod === method.id
                            ? 'border-signal-amber bg-signal-amber/10'
                            : isDark ? 'border-white/5 bg-surface-dark/30 hover:border-white/10' : 'border-gray-100 bg-white shadow-sm hover:border-gray-200'">
                        <span class="material-icons text-2xl"
                            :class="selectedMethod === method.id ? 'text-signal-amber' : isDark ? 'text-gray-400' : 'text-gray-500'">{{
                            method.icon }}</span>
                        <span class="text-sm font-bold">{{ method.label }}</span>
                    </button>
                </div>
            </div>

            <!-- Denomination Counter (Cash only) -->
            <div v-if="selectedMethod === 'cash'" class="rounded-2xl border p-4 space-y-3"
                :class="isDark ? 'bg-surface-dark/30 border-white/5' : 'bg-white border-gray-100 shadow-sm'">
                <h3 class="text-xs font-bold uppercase tracking-widest"
                    :class="isDark ? 'text-gray-400' : 'text-gray-500'">Cash Denominations</h3>
                <div v-for="denom in denominations" :key="denom.value" class="flex items-center justify-between">
                    <span class="text-sm font-semibold">₹{{ denom.value }}</span>
                    <div class="flex items-center gap-4">
                        <button @click="denom.count > 0 && denom.count--"
                            class="w-8 h-8 rounded-full border flex items-center justify-center transition-colors"
                            :class="isDark ? 'border-gray-600 text-gray-400 hover:border-primary hover:text-primary' : 'border-gray-200 text-gray-500 hover:border-primary hover:text-primary'">
                            <span class="material-icons text-sm">remove</span>
                        </button>
                        <span class="w-6 text-center font-bold text-lg">{{ denom.count }}</span>
                        <button @click="denom.count++"
                            class="w-8 h-8 rounded-full border border-primary flex items-center justify-center text-primary transition-colors hover:bg-primary/10">
                            <span class="material-icons text-sm">add</span>
                        </button>
                    </div>
                    <span class="w-20 text-right font-mono text-sm text-primary">₹{{ (denom.value *
                        denom.count).toLocaleString() }}</span>
                </div>
                <div class="flex justify-between items-center pt-3 border-t"
                    :class="isDark ? 'border-gray-700' : 'border-gray-100'">
                    <span class="font-bold text-sm">Total Counted</span>
                    <span class="font-black text-lg"
                        :class="totalCounted >= codAmount ? 'text-primary' : 'text-signal-amber'">
                        ₹{{ totalCounted.toLocaleString() }}
                    </span>
                </div>
            </div>

            <!-- UPI QR (digital payment) -->
            <div v-if="selectedMethod === 'upi'" class="text-center py-6 rounded-2xl border"
                :class="isDark ? 'border-white/5 bg-surface-dark/30' : 'border-gray-100 bg-white shadow-sm'">
                <div class="inline-flex flex-col items-center gap-2">
                    <div class="w-32 h-32 bg-white rounded-xl flex items-center justify-center">
                        <span class="material-icons text-gray-900" style="font-size: 80px;">qr_code_2</span>
                    </div>
                    <p class="text-sm font-bold">Scan to Pay ₹{{ codAmount }}</p>
                    <p class="text-xs" :class="isDark ? 'text-gray-400' : 'text-gray-500'">cargocoredriver@paytm</p>
                </div>
            </div>

            <!-- Confirm CTA -->
            <button @click="confirmCollection" :disabled="!canConfirm"
                class="w-full rounded-2xl h-16 flex items-center justify-center gap-3 font-black text-lg active:scale-[0.98] transition-all"
                :class="canConfirm
                    ? 'shadow-[0_0_30px_rgba(255,176,32,0.3)]'
                    : isDark ? 'cursor-not-allowed opacity-50' : 'cursor-not-allowed opacity-50'"
                :style="canConfirm ? 'background: linear-gradient(135deg, #FFB020, #e09010); color: #0F1115;' : ''">
                <span class="material-icons">payments</span>
                {{ canConfirm ? 'Confirm Collection' : 'Amount mismatch' }}
            </button>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUiStore } from '../stores/uiStore.js'
import { useRouteStore } from '../stores/routeStore.js'

const router = useRouter()
const uiStore = useUiStore()
const routeStore = useRouteStore()
const isDark = computed(() => uiStore.theme !== 'light')

const codAmount = 450
const selectedMethod = ref('cash')

const methods = [
    { id: 'cash', label: 'Cash', icon: 'payments' },
    { id: 'upi', label: 'UPI / QR', icon: 'qr_code' },
]

const denominations = ref([
    { value: 500, count: 0 }, { value: 200, count: 0 }, { value: 100, count: 0 },
    { value: 50, count: 0 }, { value: 20, count: 0 }, { value: 10, count: 0 },
])

const totalCounted = computed(() => denominations.value.reduce((sum, d) => sum + d.value * d.count, 0))
const canConfirm = computed(() => selectedMethod.value === 'upi' || totalCounted.value === codAmount)

function confirmCollection() {
    routeStore.logCODPayment({ stopId: 'STOP-003', amount: codAmount, method: selectedMethod.value })
    uiStore.showToast(`₹${codAmount} collected successfully`, 'success')
    router.push('/manifest')
}
</script>
