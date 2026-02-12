<template>
    <div class="bg-background-dark text-white min-h-screen flex flex-col p-6">
        <!-- Header -->
        <div class="mb-8">
            <button @click="$router.back()" class="mb-6 text-gray-400 hover:text-white flex items-center gap-2">
                <span class="material-icons">arrow_back</span>
                <span>Back</span>
            </button>

            <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
                    <span class="material-icons text-amber-500 text-2xl">payments</span>
                </div>
                <div>
                    <h3 class="text-amber-500 text-sm font-semibold tracking-wider uppercase">Cash on Delivery</h3>
                    <h1 class="text-3xl font-bold">Collect Payment</h1>
                </div>
            </div>
        </div>

        <!-- Amount Entry -->
        <div class="mb-8">
            <label class="block text-gray-400 text-sm mb-3 font-medium">Amount to Collect</label>
            <div class="glass-panel rounded-2xl p-6 flex items-center gap-4">
                <span class="text-4xl font-bold text-gray-500">$</span>
                <input v-model="amount" type="number" step="0.01" placeholder="0.00"
                    class="bg-transparent text-5xl font-bold text-white outline-none flex-1 placeholder:text-gray-700"
                    autofocus />
            </div>

            <!--  Preset Amounts -->
            <div class="grid grid-cols-4 gap-2 mt-4">
                <button v-for="preset in [10, 20, 50, 100]" :key="preset" @click="amount = preset"
                    class="bg-white/5 hover:bg-white/10 border border-white/10 py-3 rounded-lg font-semibold transition-colors">
                    ${{ preset }}
                </button>
            </div>
        </div>

        <!-- Payment Method Selection -->
        <div class="mb-8">
            <label class="block text-gray-400 text-sm mb-3 font-medium">Payment Method</label>
            <div class="space-y-3">
                <button @click="paymentMethod = 'cash'" :class="[
                    'w-full glass-panel p-4 rounded-xl flex items-center gap-4 transition-all',
                    paymentMethod === 'cash' ? 'border-2 border-primary bg-primary/5' : 'border border-white/10'
                ]">
                    <div
                        :class="['w-12 h-12 rounded-lg flex items-center justify-center', paymentMethod === 'cash' ? 'bg-primary/20' : 'bg-white/5']">
                        <span
                            :class="['material-icons text-2xl', paymentMethod === 'cash' ? 'text-primary' : 'text-gray-400']">
                            payments
                        </span>
                    </div>
                    <div class="flex-1 text-left">
                        <p class="font-semibold text-white">Cash</p>
                        <p class="text-xs text-gray-400">Physical currency</p>
                    </div>
                    <span v-if="paymentMethod === 'cash'" class="material-icons text-primary">check_circle</span>
                </button>

                <button @click="paymentMethod = 'qr'" :class="[
                    'w-full glass-panel p-4 rounded-xl flex items-center gap-4 transition-all',
                    paymentMethod === 'qr' ? 'border-2 border-primary bg-primary/5' : 'border border-white/10'
                ]">
                    <div
                        :class="['w-12 h-12 rounded-lg flex items-center justify-center', paymentMethod === 'qr' ? 'bg-primary/20' : 'bg-white/5']">
                        <span
                            :class="['material-icons text-2xl', paymentMethod === 'qr' ? 'text-primary' : 'text-gray-400']">
                            qr_code_scanner
                        </span>
                    </div>
                    <div class="flex-1 text-left">
                        <p class="font-semibold text-white">QR Code</p>
                        <p class="text-xs text-gray-400">Scan customer's payment code</p>
                    </div>
                    <span v-if="paymentMethod === 'qr'" class="material-icons text-primary">check_circle</span>
                </button>
            </div>
        </div>

        <!-- Receipt Info -->
        <div v-if="amount > 0" class="bg-white/5 border border-white/10 rounded-xl p-4 mb-8">
            <div class="flex justify-between items-center mb-2">
                <span class="text-gray-400">Amount Collected</span>
                <span class="text-2xl font-bold text-white">${{ parseFloat(amount).toFixed(2) }}</span>
            </div>
            <div class="flex justify-between items-center">
                <span class="text-gray-400 text-sm">Transaction ID</span>
                <span class="font-mono text-xs text-gray-500">COD-{{ Date.now().toString().slice(-8) }}</span>
            </div>
        </div>

        <!-- Confirm Button -->
        <button @click="confirmPayment" :disabled="!amount || amount <= 0" :class="[
            'w-full py-5 rounded-xl font-bold text-xl transition-all',
            amount && amount > 0
                ? 'bg-primary text-black shadow-glow hover:bg-primary-dark active:scale-[0.98]'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
        ]">
            Confirm Payment
        </button>

        <!-- Safe Handling Note -->
        <div class="mt-6 bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
            <div class="flex items-start gap-3">
                <span class="material-icons text-amber-500 text-lg">shield</span>
                <div>
                    <p class="text-amber-500 font-semibold text-sm mb-1">Secure Transaction</p>
                    <p class="text-gray-400 text-xs">This payment will be logged to the financial ledger and included in
                        today's reconciliation.</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useRouteStore } from '../stores/routeStore'

const router = useRouter()
const route = useRoute()
const routeStore = useRouteStore()

const amount = ref(null)
const paymentMethod = ref('cash')

const confirmPayment = () => {
    if (!amount.value || amount.value <= 0) return

    // Log payment
    routeStore.logCODPayment({
        stopId: route.params.stopId,
        amount: parseFloat(amount.value),
        method: paymentMethod.value,
        timestamp: new Date().toISOString()
    })

    // Navigate to proof of delivery
    router.push(`/proof-of-delivery/${route.params.stopId}`)
}
</script>
