<template>
    <div class="bg-background-dark text-white min-h-screen flex flex-col p-6">
        <!-- Header -->
        <div class="mb-8">
            <button @click="$router.back()" class="mb-6 text-gray-400 hover:text-white flex items-center gap-2">
                <span class="material-icons">arrow_back</span>
                <span>Back</span>
            </button>

            <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <span class="material-icons text-blue-500 text-2xl">local_gas_station</span>
                </div>
                <div>
                    <h3 class="text-blue-500 text-sm font-semibold tracking-wider uppercase">Expense Report</h3>
                    <h1 class="text-3xl font-bold">Fuel Receipt Upload</h1>
                </div>
            </div>
        </div>

        <!-- Vehicle Info -->
        <div class="glass-panel rounded-xl p-4 mb-6">
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <p class="text-gray-400 text-xs mb-1">Vehicle ID</p>
                    <p class="text-white font-bold">{{ vehicleId }}</p>
                </div>
                <div>
                    <p class="text-gray-400 text-xs mb-1">Current Odometer</p>
                    <p class="text-white font-mono font-semibold">{{ odometer }} mi</p>
                </div>
            </div>
        </div>

        <!-- Receipt Photo -->
        <div class="mb-6">
            <label class="block text-gray-400 text-sm mb-3 font-medium">Receipt Photo</label>
            <div v-if="!receiptPhoto" @click="showCamera = true"
                class="glass-panel rounded-xl p-12 border-2 border-dashed border-white/20 hover:border-primary cursor-pointer transition-all text-center">
                <span class="material-icons text-gray-500 text-6xl mb-3">receipt_long</span>
                <p class="text-gray-400 font-medium">Tap to capture receipt</p>
                <p class="text-gray-600 text-xs mt-1">OCR will extract amount automatically</p>
            </div>
            <div v-else class="relative">
                <img :src="receiptPhoto" alt="Receipt" class="w-full h-96 object-contain rounded-xl bg-white/5" />
                <button @click="receiptPhoto = null; amount = null"
                    class="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full shadow-lg">
                    <span class="material-icons">delete</span>
                </button>

                <!-- OCR Detected Amount -->
                <div v-if="amount"
                    class="absolute bottom-2 left-2 right-2 bg-primary/90 backdrop-blur-sm rounded-lg p-3">
                    <p class="text-black text-xs font-semibold mb-1">✓ Amount Detected</p>
                    <p class="text-black text-2xl font-bold">${{ amount }}</p>
                </div>
            </div>
        </div>

        <!-- Manual Entry (if OCR fails) -->
        <div v-if="receiptPhoto && !amount" class="mb-6">
            <label class="block text-gray-400 text-sm mb-3 font-medium">Manual Amount Entry</label>
            <div class="glass-panel rounded-xl p-4 flex items-center gap-3">
                <span class="text-3xl font-bold text-gray-500">$</span>
                <input v-model="manualAmount" type="number" step="0.01" placeholder="0.00"
                    class="bg-transparent text-3xl font-bold text-white outline-none flex-1 placeholder:text-gray-700" />
            </div>
        </div>

        <!-- Fuel Type Selection -->
        <div v-if="receiptPhoto" class="mb-6">
            <label class="block text-gray-400 text-sm mb-3 font-medium">Fuel Type</label>
            <div class="grid grid-cols-3 gap-3">
                <button v-for="type in fuelTypes" :key="type" @click="fuelType = type" :class="[
                    'glass-panel p-4 rounded-xl transition-all border',
                    fuelType === type ? 'border-2 border-primary bg-primary/10' : 'border-white/10'
                ]">
                    <p :class="['font-semibold text-sm', fuelType === type ? 'text-primary' : 'text-white']">
                        {{ type }}
                    </p>
                </button>
            </div>
        </div>

        <!-- Gallons (Optional) -->
        <div v-if="receiptPhoto" class="mb-8">
            <label class="block text-gray-400 text-sm mb-3 font-medium">Gallons (Optional)</label>
            <input v-model="gallons" type="number" step="0.1" placeholder="0.0"
                class="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white font-mono text-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
        </div>

        <!-- Metadata -->
        <div v-if="receiptPhoto" class="bg-white/5 border border-white/10 rounded-xl p-4 mb-8">
            <div class="space-y-2">
                <div class="flex justify-between items-center">
                    <span class="text-gray-400 text-sm">Timestamp</span>
                    <span class="font-mono text-white text-sm">{{ timestamp }}</span>
                </div>
                <div class="flex justify-between items-center">
                    <span class="text-gray-400 text-sm">Location</span>
                    <span class="font-mono text-gray-400 text-xs">{{ gpsLocation }}</span>
                </div>
            </div>
        </div>

        <!-- Submit Button -->
        <button @click="submitReceipt" :disabled="!receiptPhoto || (!amount && !manualAmount)" :class="[
            'w-full py-5 rounded-xl font-bold text-xl transition-all',
            receiptPhoto && (amount || manualAmount)
                ? 'bg-primary text-black shadow-glow hover:bg-primary-dark active:scale-[0.98]'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
        ]">
            Submit Receipt
        </button>

        <!-- Camera Modal -->
        <CameraCapture v-if="showCamera" title="Fuel Receipt" hint="Capture clear photo of receipt"
            @close="showCamera = false" @capture="handlePhotoCapture" />
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import CameraCapture from '../driver-components/CameraCapture.vue'

const router = useRouter()

const showCamera = ref(false)
const vehicleId = ref('TRK-2891')
const odometer = ref('45,231')
const receiptPhoto = ref(null)
const amount = ref(null)
const manualAmount = ref(null)
const fuelType = ref('Regular')
const gallons = ref(null)
const timestamp = ref('')
const gpsLocation = ref('30.2672° N, 97.7431° W')

const fuelTypes = ['Regular', 'Premium', 'Diesel']

onMounted(() => {
    timestamp.value = new Date().toLocaleString()
})

const handlePhotoCapture = (photo) => {
    receiptPhoto.value = photo

    // Simulate OCR detection
    setTimeout(() => {
        amount.value = (Math.random() * 50 + 30).toFixed(2)
    }, 1500)
}

const submitReceipt = () => {
    if (!receiptPhoto.value || (!amount.value && !manualAmount.value)) return

    const finalAmount = amount.value || manualAmount.value

    alert(`Fuel receipt submitted!\n\nAmount: $${finalAmount}\nFuel Type: ${fuelType.value}\n\nExpense logged to financial system.`)

    router.back()
}
</script>
