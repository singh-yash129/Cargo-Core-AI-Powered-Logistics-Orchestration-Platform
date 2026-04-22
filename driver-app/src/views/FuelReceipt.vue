<template>
    <div class="screen-layout" :class="isDark ? 'bg-background-dark text-white' : 'bg-background-light text-gray-900'">

        <!-- ── HEADER ───────────────────────────────── -->
        <header class="flex-shrink-0 px-5 pt-5 pb-4 border-b" :class="isDark ? 'border-white/5' : 'border-gray-100'">
            <div class="flex items-center gap-3">
                <button @click="$router.back()" class="w-10 h-10 rounded-full flex items-center justify-center border"
                    :class="isDark ? 'bg-surface-dark border-white/5 text-gray-400' : 'bg-white border-gray-200 shadow-sm'">
                    <span class="material-icons text-xl">arrow_back</span>
                </button>
                <h1 class="text-2xl font-black tracking-tight">Fuel Receipt</h1>
            </div>
        </header>

        <!-- ── SCROLLABLE BODY ───────────────────────── -->
        <div class="screen-body px-5 py-4 flex flex-col gap-4">

            <div class="rounded-2xl p-5 border space-y-4"
                :class="isDark ? 'bg-surface-dark/40 border-white/8' : 'bg-white border-gray-100 shadow-sm'">
                <div>
                    <label class="block text-xs font-bold uppercase tracking-wider mb-2"
                        :class="isDark ? 'text-gray-400' : 'text-gray-500'">Amount (₹)</label>
                    <div @click="focusAmount" class="glass-input rounded-xl flex items-center px-4 py-3 gap-2 cursor-text">
                        <span class="text-primary font-bold">₹</span>
                        <input ref="amountRef" id="fuelAmount" v-model="amount" type="number" placeholder="0"
                            inputmode="decimal" enterkeyhint="next"
                            class="flex-1 bg-transparent border-none outline-none text-xl font-black"
                            style="pointer-events: auto; touch-action: manipulation;"
                            :class="isDark ? 'text-white placeholder-gray-600' : 'text-gray-900 placeholder-gray-400'" />
                    </div>
                </div>
                <div>
                    <label class="block text-xs font-bold uppercase tracking-wider mb-2"
                        :class="isDark ? 'text-gray-400' : 'text-gray-500'">Liters</label>
                    <div @click="focusLiters" class="glass-input rounded-xl flex items-center px-4 py-3 gap-2 cursor-text">
                        <span class="material-icons text-primary text-sm">local_gas_station</span>
                        <input ref="litersRef" id="fuelLiters" v-model="liters" type="number" placeholder="0.0"
                            inputmode="decimal" enterkeyhint="next"
                            class="flex-1 bg-transparent border-none outline-none text-xl font-black"
                            style="pointer-events: auto; touch-action: manipulation;"
                            :class="isDark ? 'text-white placeholder-gray-600' : 'text-gray-900 placeholder-gray-400'" />
                    </div>
                </div>
                <div>
                    <label class="block text-xs font-bold uppercase tracking-wider mb-2"
                        :class="isDark ? 'text-gray-400' : 'text-gray-500'">Station Name</label>
                    <div @click="focusStation" class="glass-input rounded-xl flex items-center px-4 py-3 gap-2 cursor-text">
                        <input ref="stationRef" id="fuelStation" v-model="station" type="text" placeholder="e.g. HP Petrol Pump, Andheri"
                            inputmode="text" enterkeyhint="done"
                            class="flex-1 bg-transparent border-none outline-none text-sm"
                            style="pointer-events: auto; touch-action: manipulation;"
                            :class="isDark ? 'text-white placeholder-gray-600' : 'text-gray-900 placeholder-gray-400'" />
                    </div>
                </div>

                <!-- Photo upload -->
                <button @click="captureReceipt" :disabled="isCapturing"
                    class="w-full rounded-xl border-2 border-dashed h-24 flex flex-col items-center justify-center gap-2 transition-all"
                    :class="receiptPhoto
                        ? isDark ? 'border-primary/40 bg-primary/8 text-primary' : 'border-primary/30 bg-primary/5 text-primary'
                        : isDark ? 'border-gray-700 text-gray-500 hover:border-primary/30 hover:text-primary' : 'border-gray-300 text-gray-400 hover:border-primary hover:text-primary'">
                    <span v-if="isCapturing" class="material-icons text-2xl animate-spin">hourglass_empty</span>
                    <span v-else class="material-icons text-2xl">{{ receiptPhoto ? 'check_circle' : 'add_a_photo'
                        }}</span>
                    <span class="text-xs font-semibold">{{ captureLabel }}</span>
                </button>

                <!-- Thumbnail preview -->
                <div v-if="receiptPhoto" class="relative">
                    <img :src="`data:image/jpeg;base64,${receiptPhoto}`" alt="Receipt"
                        class="w-full h-32 object-cover rounded-xl border"
                        :class="isDark ? 'border-white/5' : 'border-gray-100'" />
                    <button @click="receiptPhoto = ''"
                        class="absolute top-2 right-2 w-7 h-7 rounded-full bg-red-500 text-white flex items-center justify-center">
                        <span class="material-icons text-sm">close</span>
                    </button>
                </div>
            </div>
        </div>

        <!-- ── STICKY FOOTER ────────────────────────── -->
        <div class="screen-footer px-5 py-4 border-t"
            :class="isDark ? 'border-white/5 bg-background-dark' : 'border-gray-100 bg-background-light'">
            <button @click="submit" :disabled="!amount || !liters || isSubmitting"
                class="w-full rounded-2xl h-14 flex items-center justify-center gap-2 font-bold text-lg active:scale-[0.98] transition-all"
                :class="amount && liters && !isSubmitting ? 'bg-primary text-background-dark shadow-glow' : isDark ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-gray-100 text-gray-400 cursor-not-allowed'">
                <span v-if="isSubmitting" class="material-icons animate-spin">hourglass_empty</span>
                <span v-else class="material-icons">receipt</span>
                {{ isSubmitting ? 'Submitting…' : 'Submit Receipt' }}
            </button>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUiStore } from '../stores/uiStore.js'
import { useCamera } from '../composables/useCamera.js'
import * as api from '../services/api.js'

const router = useRouter()
const uiStore = useUiStore()
const isDark = computed(() => uiStore.theme !== 'light')
const { scanDocument, isCapturing } = useCamera()

const amount = ref('')
const liters = ref('')
const station = ref('')
const receiptPhoto = ref('')
const isSubmitting = ref(false)

const amountRef = ref(null)
const litersRef = ref(null)
const stationRef = ref(null)
const focusAmount = () => { amountRef.value?.focus() }
const focusLiters = () => { litersRef.value?.focus() }
const focusStation = () => { stationRef.value?.focus() }
const captureLabel = computed(() => {
    if (isCapturing.value) return 'Opening camera...'
    if (receiptPhoto.value) return 'Receipt photo captured ✓'
    return 'Tap to capture receipt'
})

async function captureReceipt() {
    const result = await scanDocument('Capture Fuel Receipt')
    if (result) {
        receiptPhoto.value = result.base64
        uiStore.showToast('Receipt photo captured ✓', 'success', 1500)
    }
}

async function submit() {
    if (isSubmitting.value) return
    isSubmitting.value = true
    try {
        await api.submitFuelReceipt({
            amount: amount.value,
            liters: liters.value,
            station: station.value,
            photoBase64: receiptPhoto.value || null,
        })
        uiStore.showToast('Fuel receipt submitted ✓', 'success')
        amount.value = ''
        liters.value = ''
        station.value = ''
        receiptPhoto.value = ''
        router.back()
    } catch (err) {
        uiStore.showToast(err.message || 'Failed to submit receipt', 'error')
    } finally {
        isSubmitting.value = false
    }
}
</script>
