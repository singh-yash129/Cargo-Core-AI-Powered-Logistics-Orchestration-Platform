<template>
    <div class="screen-layout" :class="isDark ? 'bg-background-dark text-white' : 'bg-background-light text-gray-900'">

        <!-- ── HEADER ───────────────────────────────── -->
        <header class="flex-shrink-0 px-5 pt-5 pb-4 border-b" :class="isDark ? 'border-white/5' : 'border-gray-100'">
            <div class="flex items-center justify-between mb-2">
                <button @click="$router.back()" class="w-10 h-10 rounded-full flex items-center justify-center border"
                    :class="isDark ? 'bg-surface-dark border-white/5 text-gray-400' : 'bg-white border-gray-200 shadow-sm'">
                    <span class="material-icons text-xl">close</span>
                </button>
                <h1 class="text-xl font-black tracking-tight text-red-500">Report Exception</h1>
                <div class="w-10"></div>
            </div>
            <p class="text-xs text-center" :class="isDark ? 'text-gray-400' : 'text-gray-500'">Stop {{ stopId }}</p>
        </header>

        <!-- ── SCROLLABLE BODY ───────────────────────── -->
        <div class="screen-body px-5 py-5 flex flex-col gap-5">

            <!-- EXCEPTION REASON -->
            <div v-if="!showOtpStage">
                <h3 class="text-sm font-bold mb-3">Reason for Failure</h3>
                <div class="grid grid-cols-1 gap-2">
                    <button v-for="reason in reasons" :key="reason" @click="selectedReason = reason"
                        class="text-left px-4 py-3 rounded-xl border font-semibold text-sm transition-all"
                        :class="selectedReason === reason
                            ? (isDark ? 'bg-red-500/20 border-red-500 text-red-400' : 'bg-red-50 border-red-500 text-red-600')
                            : (isDark ? 'bg-surface-dark/50 border-white/10 text-gray-300' : 'bg-white border-gray-200 text-gray-700')">
                        {{ reason }}
                    </button>
                </div>
            </div>

            <!-- ADDITIONAL NOTES -->
            <div v-if="!showOtpStage">
                <h3 class="text-sm font-bold mb-3">Additional Notes (Optional)</h3>
                <textarea v-model="notes" rows="3" placeholder="Enter any specific details..."
                    class="w-full rounded-xl border p-3 text-sm outline-none transition-colors"
                    :class="isDark ? 'bg-surface-dark/50 border-white/10 text-white focus:border-red-500/50' : 'bg-white border-gray-200 text-gray-900 focus:border-red-500/50 block shadow-sm'"></textarea>
            </div>

            <!-- PROOF PHOTO -->
            <div v-if="!showOtpStage">
                <h3 class="text-sm font-bold mb-3">Proof Photo <span class="text-red-500">*</span></h3>
                <div v-if="photoUrl" class="aspect-video rounded-xl overflow-hidden relative border"
                    :class="isDark ? 'border-white/10' : 'border-gray-200'">
                    <img :src="photoUrl" class="w-full h-full object-cover" alt="Proof" />
                    <button @click="photoUrl = null"
                        class="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-500/90 text-white flex items-center justify-center backdrop-blur-md">
                        <span class="material-icons text-sm">delete</span>
                    </button>
                </div>
                <button v-else @click="captureProof" :disabled="isCapturing"
                    class="w-full h-32 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all"
                    :class="isDark ? 'border-white/20 text-gray-400 hover:border-red-500/50 hover:text-red-400' : 'border-gray-300 text-gray-500 hover:border-red-400 hover:text-red-500'">
                    <span v-if="isCapturing" class="material-icons animate-spin">hourglass_empty</span>
                    <span v-else class="material-icons text-3xl">add_a_photo</span>
                    <span class="text-xs font-semibold">Take Photo Proof</span>
                </button>
                <p class="text-[10px] mt-2 text-center" :class="isDark ? 'text-gray-500' : 'text-gray-400'">
                    Required for auditing: e.g. closed door, address plate, etc.
                </p>
            </div>

            <!-- EXCEPTION OTP STAGE -->
            <div v-if="showOtpStage" class="flex flex-col gap-4 mt-6">
                <div class="rounded-2xl p-5 text-center border"
                    :class="isDark ? 'bg-red-500/10 border-red-500/20' : 'bg-red-50 border-red-500/30'">
                    <span class="material-icons text-4xl text-red-500">sms_failed</span>
                    <h3 class="text-lg font-bold mt-2">Cancellation OTP</h3>
                    <p class="text-sm mt-1" :class="isDark ? 'text-gray-400' : 'text-gray-500'">
                        To confirm cancellation, enter OTP from customer
                    </p>
                </div>
                <div class="flex gap-3 justify-center">
                    <input v-for="(digit, idx) in 4" :key="idx" type="tel" maxlength="1" v-model="otp[idx]"
                        ref="otpInputs" @input="handleOtpInput(idx, $event)" @keydown="handleOtpKeydown(idx, $event)"
                        class="w-14 h-14 text-center text-2xl font-black rounded-2xl border outline-none transition-colors"
                        :class="isDark ? 'bg-surface-dark border-white/10 text-white focus:border-red-500' : 'bg-white border-gray-200 text-gray-900 focus:border-red-500 shadow-sm'" />
                </div>
                <p class="text-center text-xs" :class="isDark ? 'text-gray-500' : 'text-gray-400'">Resend OTP in 28s</p>
            </div>

        </div>

        <!-- ── STICKY FOOTER ────────────────────────── -->
        <div class="screen-footer px-5 py-4 border-t flex gap-3"
            :class="isDark ? 'border-white/5 bg-background-dark' : 'border-gray-100 bg-background-light'">

            <button v-if="showOtpStage" @click="showOtpStage = false"
                class="flex-1 py-4 rounded-2xl border font-semibold text-sm active:scale-[0.97]"
                :class="isDark ? 'bg-surface-dark/50 border-white/5 text-white' : 'bg-white border-gray-200 text-gray-700 shadow-sm'">
                Back
            </button>
            <button @click="handleAction" :disabled="!canProceed"
                class="flex-[2] py-4 rounded-2xl font-black text-lg transition-all active:scale-[0.98]"
                :class="canProceed
                    ? 'bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]'
                    : (isDark ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-gray-100 text-gray-400 cursor-not-allowed')">
                {{ showOtpStage ? 'Verify & Fail' : (needsOtp ? 'Next' : 'Submit Report') }}
            </button>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUiStore } from '../stores/uiStore.js'
import { useRouteStore } from '../stores/routeStore.js'
import { useCamera } from '../composables/useCamera.js'

const route = useRoute()
const router = useRouter()
const uiStore = useUiStore()
const routeStore = useRouteStore()
const { scanDocument, isCapturing } = useCamera()

const isDark = computed(() => uiStore.theme !== 'light')
const stopId = computed(() => route.params.id || 'Unknown')

const reasons = [
    'Customer Not Available (Not at home)',
    'Customer Rejected Delivery',
    'Customer Cancelled Order',
    'Could Not Contact Customer',
    'Address Not Found / Incorrect',
    'Other'
]

const selectedReason = ref('')
const notes = ref('')
const photoUrl = ref(null)

// OTP Logic
const showOtpStage = ref(false)
const otp = ref(['', '', '', ''])
const otpInputs = ref([])

const needsOtp = computed(() => {
    return selectedReason.value === 'Customer Rejected Delivery' ||
        selectedReason.value === 'Customer Cancelled Order';
})

function handleOtpInput(idx, event) {
    const val = event.target.value;
    if (!/^\d*$/.test(val)) {
        otp.value[idx] = '';
        return;
    }
    if (val && idx < 3) {
        otpInputs.value[idx + 1]?.focus();
    }
}

function handleOtpKeydown(idx, event) {
    if (event.key === 'Backspace' && !otp.value[idx] && idx > 0) {
        otpInputs.value[idx - 1]?.focus();
    }
}

const canProceed = computed(() => {
    if (showOtpStage.value) {
        return otp.value.join('').length === 4;
    }
    return selectedReason.value !== '' && photoUrl.value !== null;
})

function handleAction() {
    if (!needsOtp.value || showOtpStage.value) {
        submitException();
    } else {
        showOtpStage.value = true;
    }
}

async function captureProof() {
    // Force camera capture directly (no gallery prompt)
    const result = await scanDocument('Capture Proof of Failure')
    if (result) {
        photoUrl.value = result.base64.startsWith('data:') ? result.base64 : `data:image/jpeg;base64,${result.base64}`
    }
}

function submitException() {
    // Log exception in the store (complete the delivery as 'failed')
    routeStore.logException({
        stopId: stopId.value,
        reason: selectedReason.value,
        notes: notes.value,
        timestamp: new Date().toISOString()
    })

    // Mark as completed so itinerary advances
    routeStore.completeDelivery(stopId.value)

    uiStore.showToast('Exception Report Submitted', 'error', 2000)
    router.replace('/manifest')
}
</script>
