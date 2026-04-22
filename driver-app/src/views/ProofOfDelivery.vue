<template>
    <div class="screen-layout" :class="isDark ? 'bg-background-dark text-white' : 'bg-background-light text-gray-900'">

        <!-- ── HEADER ───────────────────────────────── -->
        <header class="flex-shrink-0 px-5 pt-5 pb-3 border-b" :class="isDark ? 'border-white/5' : 'border-gray-100'">
            <div class="flex items-center justify-between mb-2">
                <button @click="$router.back()" class="w-10 h-10 rounded-full flex items-center justify-center border"
                    :class="isDark ? 'bg-surface-dark border-white/5 text-gray-400' : 'bg-white border-gray-200 shadow-sm'">
                    <span class="material-icons text-xl">arrow_back</span>
                </button>
                <h1 class="text-xl font-black tracking-tight">Proof of Delivery</h1>
                <div class="w-10"></div>
            </div>
            <p class="text-xs text-center" :class="isDark ? 'text-gray-400' : 'text-gray-500'">Stop #{{ stop.stopNumber || 1 }} · {{ stop.customerName || 'Customer' }}</p>

            <!-- Progress Steps -->
            <div class="flex items-center gap-2 mt-3">
                <div v-for="(step, i) in steps" :key="step" class="flex-1 flex flex-col items-center gap-1">
                    <div class="w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-bold"
                        :class="currentStep > i ? 'bg-primary border-primary text-background-dark'
                            : currentStep === i ? isDark ? 'border-primary text-primary' : 'border-primary text-primary'
                                : isDark ? 'border-gray-700 text-gray-600' : 'border-gray-200 text-gray-400'">
                        <span v-if="currentStep > i" class="material-icons text-sm">check</span>
                        <span v-else>{{ i + 1 }}</span>
                    </div>
                    <p class="text-[9px] uppercase font-bold text-center"
                        :class="currentStep >= i ? (isDark ? 'text-white' : 'text-gray-700') : isDark ? 'text-gray-600' : 'text-gray-400'">
                        {{ step }}</p>
                </div>
            </div>
        </header>

        <!-- ── SCROLLABLE BODY ───────────────────────── -->
        <div class="screen-body px-5 py-5 flex flex-col">

            <!-- STEP 0: Signature -->
            <div v-show="currentStep === 0" class="flex-1 rounded-2xl border overflow-hidden flex flex-col min-h-[40vh]"
                :class="isDark ? 'border-white/5' : 'border-gray-100'">
                <div class="p-4 flex justify-between items-center border-b shrink-0"
                    :class="isDark ? 'bg-surface-dark/50 border-white/5' : 'bg-gray-50 border-gray-100'">
                    <h3 class="font-bold text-sm">Customer Signature</h3>
                    <button @click="clearSignature" class="text-xs font-semibold text-primary">Clear</button>
                </div>
                <div class="flex-1 flex items-center justify-center cursor-crosshair relative overflow-hidden"
                    :class="isDark ? 'bg-black/20' : 'bg-gray-50'">
                    <canvas ref="signatureCanvas" class="w-full h-full absolute inset-0 touch-none"
                        @touchstart="startDrawing" @touchmove="draw" @touchend="stopDrawing" @mousedown="startDrawing"
                        @mousemove="draw" @mouseup="stopDrawing" @mouseleave="stopDrawing"></canvas>
                    <div v-if="!hasSig" class="text-center pointer-events-none">
                        <span class="material-icons text-4xl mb-2"
                            :class="isDark ? 'text-gray-600' : 'text-gray-300'">draw</span>
                        <p class="text-sm" :class="isDark ? 'text-gray-400' : 'text-gray-400'">Tap to sign</p>
                    </div>
                </div>
                <p class="text-center text-xs py-2 shrink-0 bg-transparent"
                    :class="isDark ? 'text-gray-600' : 'text-gray-400'">Geotagged &amp;
                    timestamped automatically</p>
            </div>

            <!-- STEP 1: Photos -->
            <div v-if="currentStep === 1" class="flex flex-col gap-3">
                <div class="grid grid-cols-3 gap-3">
                    <div v-for="(photo, idx) in photos" :key="idx"
                        class="aspect-square rounded-xl overflow-hidden relative border"
                        :class="isDark ? 'border-white/5' : 'border-gray-100'">
                        <img :src="photo.startsWith('data:') ? photo : `data:image/jpeg;base64,${photo}`"
                            alt="POD Photo" class="w-full h-full object-cover" />
                        <button @click="removePhoto(idx)"
                            class="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center">
                            <span class="material-icons text-xs">close</span>
                        </button>
                    </div>
                    <button @click="addPhoto" :disabled="isCapturing"
                        class="aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1"
                        :class="isDark ? 'border-gray-600 text-gray-400 hover:border-primary hover:text-primary' : 'border-gray-300 text-gray-400 hover:border-primary hover:text-primary'">
                        <span v-if="isCapturing" class="material-icons text-2xl animate-spin">hourglass_empty</span>
                        <span v-else class="material-icons text-2xl">add_a_photo</span>
                        <span class="text-[10px] font-semibold">{{ isCapturing ? 'Opening...' : 'Add' }}</span>
                    </button>
                </div>
                <p class="text-xs text-center" :class="isDark ? 'text-gray-500' : 'text-gray-400'">Minimum 1 photo ·
                    Geotagged automatically</p>
            </div>

            <!-- STEP 2: OTP -->
            <div v-if="currentStep === 2" class="flex flex-col gap-4">
                <div class="rounded-2xl p-5 text-center border"
                    :class="isDark ? 'bg-primary/10 border-primary/20' : 'bg-primary/10 border-primary/30'">
                    <span class="material-icons text-4xl text-primary">mail</span>
                    <h3 class="text-lg font-bold mt-2">Customer OTP</h3>
                    <p class="text-sm mt-1" :class="isDark ? 'text-gray-400' : 'text-gray-500'">
                        {{ otpStatusMessage || 'Requesting OTP from the customer email linked to this order.' }}
                    </p>
                </div>
                <div class="flex gap-3 justify-center">
                    <input v-for="(digit, idx) in 4" :key="idx" type="tel" maxlength="1" v-model="otp[idx]"
                        inputmode="numeric" enterkeyhint="next"
                        ref="otpInputs" @input="handleOtpInput(idx, $event)" @keydown="handleOtpKeydown(idx, $event)"
                        class="w-14 h-14 text-center text-2xl font-black rounded-2xl border outline-none transition-colors"
                        style="pointer-events: auto; touch-action: manipulation;"
                        :class="isDark ? 'bg-surface-dark border-white/10 text-white focus:border-primary' : 'bg-white border-gray-200 text-gray-900 focus:border-primary shadow-sm'" />
                </div>
                <button @click="requestDeliveryOtp(true)" :disabled="otpSending"
                    class="text-center text-xs font-semibold text-primary disabled:opacity-50">
                    {{ otpSending ? 'Sending OTP...' : `Resend OTP${otpDestination ? ` to ${otpDestination}` : ''}` }}
                </button>
            </div>
        </div>

        <!-- ── STICKY FOOTER ────────────────────────── -->
        <div class="screen-footer px-5 py-4 border-t flex gap-3"
            :class="isDark ? 'border-white/5 bg-background-dark' : 'border-gray-100 bg-background-light'">
            <button v-if="currentStep > 0" @click="currentStep--"
                class="flex-1 py-4 rounded-2xl border font-semibold text-sm active:scale-[0.97]"
                :class="isDark ? 'bg-surface-dark/50 border-white/5 text-white' : 'bg-white border-gray-200 text-gray-700 shadow-sm'">Back</button>
            <button @click="handleNext" :disabled="!canProceed"
                class="flex-[2] py-4 rounded-2xl font-black text-lg active:scale-[0.97]"
                :class="canProceed ? 'bg-primary text-background-dark shadow-glow' : isDark ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-gray-100 text-gray-400 cursor-not-allowed'">
                {{ currentStep < steps.length - 1 ? 'Next' : 'Complete ✓' }} </button>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useUiStore } from '../stores/uiStore.js'
import { useRouteStore } from '../stores/routeStore.js'
import { useDriverStore } from '../stores/driverStore.js'
import { useJobStore } from '../stores/jobStore.js'
import { useCamera } from '../composables/useCamera.js'
import { useLocalNotifications } from '../composables/useLocalNotifications.js'
import { useFlowRouter } from '../composables/useFlowRouter.js'
import * as api from '../services/api.js'

const route = useRoute()
const { advanceAndNavigate } = useFlowRouter()
const uiStore = useUiStore()
const routeStore = useRouteStore()
const driverStore = useDriverStore()
const jobStore = useJobStore()
const { notify } = useLocalNotifications()
const isDark = computed(() => uiStore.theme !== 'light')
const { scanDocument, isCapturing } = useCamera()
const stopId = computed(() => route.params.id || 'STOP-001')
const stop = computed(() => jobStore.getStopById(stopId.value) || jobStore.currentStop || {})
const requiresCodCollection = computed(() =>
    Boolean(stop.value.cod && Number(stop.value.codAmount || 0) > 0 && !stop.value.codCollected)
)

const steps = ['Signature', 'Photos', 'OTP']
const currentStep = ref(0)
const otpStatusMessage = ref('')
const otpDestination = ref('')
const otpRequested = ref(false)
const otpSending = ref(false)
const signatureDataUrl = ref(null)

// --- Signature Pad Logic ---
const signatureCanvas = ref(null)
const hasSig = ref(false)
const isDrawing = ref(false)
let ctx = null
let canvasInitialized = false

function initSignature() {
    if (!signatureCanvas.value) return;
    const canvas = signatureCanvas.value;
    const w = canvas.offsetWidth || canvas.parentElement.clientWidth;
    const h = canvas.offsetHeight || canvas.parentElement.clientHeight;

    if (w > 0 && h > 0) {
        // High DPI canvas scaling for crisp drawing
        const dpr = window.devicePixelRatio || 1;
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        ctx = canvas.getContext('2d');
        ctx.scale(dpr, dpr);
        ctx.strokeStyle = '#1ce783'; // Primary color
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        canvasInitialized = true;

        if (signatureDataUrl.value) {
            const img = new Image()
            img.onload = () => {
                ctx.clearRect(0, 0, w, h)
                ctx.drawImage(img, 0, 0, w, h)
            }
            img.src = signatureDataUrl.value
        }
    }
}

// Reactively re-initialize whenever we mount Step 0, wait for DOM layout
watch(currentStep, (newStep) => {
    if (newStep === 0) {
        nextTick(() => {
            setTimeout(initSignature, 400); // Wait for transition & layout
        });
    }
    if (newStep === 2 && !otpRequested.value) {
        requestDeliveryOtp().catch(() => {})
    }
}, { immediate: true });

function getCoordinates(event) {
    if (!signatureCanvas.value) return { x: 0, y: 0 };
    const canvas = signatureCanvas.value;
    const rect = canvas.getBoundingClientRect();

    let clientX = event.clientX;
    let clientY = event.clientY;

    if (event.touches && event.touches.length > 0) {
        clientX = event.touches[0].clientX;
        clientY = event.touches[0].clientY;
    } else if (event.changedTouches && event.changedTouches.length > 0) {
        clientX = event.changedTouches[0].clientX;
        clientY = event.changedTouches[0].clientY;
    }

    return {
        x: clientX - rect.left,
        y: clientY - rect.top
    };
}

function startDrawing(event) {
    if (event.cancelable) event.preventDefault(); // Stop mobile scrolling
    if (!signatureCanvas.value) return;
    if (!ctx || !canvasInitialized || signatureCanvas.value.width === 0) {
        initSignature();
    }
    if (!ctx) return;

    isDrawing.value = true;
    hasSig.value = true;
    const { x, y } = getCoordinates(event);
    ctx.beginPath();
    ctx.moveTo(x, y);
}

function draw(event) {
    if (!isDrawing.value || !ctx) return;
    if (event.cancelable) event.preventDefault(); // Stop mobile scrolling
    const { x, y } = getCoordinates(event);
    ctx.lineTo(x, y);
    ctx.stroke();
}

function stopDrawing(event) {
    if (!isDrawing.value || !ctx) return;
    if (event && event.cancelable) event.preventDefault();
    isDrawing.value = false;
    ctx.closePath();

    // CRITICAL: Always persist immediately after drawing
    const dataUrl = persistSignature()
    console.log('[POD] Signature persisted on stroke end:', dataUrl ? 'success' : 'failed')
}

function clearSignature() {
    hasSig.value = false;
    signatureDataUrl.value = null
    if (ctx && signatureCanvas.value) {
        ctx.clearRect(0, 0, signatureCanvas.value.width, signatureCanvas.value.height);
    }
}

function persistSignature() {
    if (!signatureCanvas.value || !hasSig.value) {
        console.warn('[POD] Cannot persist signature: canvas=', !!signatureCanvas.value, 'hasSig=', hasSig.value)
        return null
    }

    try {
        const dataUrl = signatureCanvas.value.toDataURL('image/png')
        if (dataUrl && dataUrl.length > 100) { // Sanity check: valid base64 should be longer than 100 chars
            signatureDataUrl.value = dataUrl
            console.log('[POD] Signature persisted successfully, length:', dataUrl.length)
            return dataUrl
        } else {
            console.error('[POD] Invalid signature data URL generated')
            return null
        }
    } catch (err) {
        console.error('[POD] Error persisting signature:', err)
        return null
    }
}

// --- OTP Logic ---
const otp = ref(['', '', '', ''])
const otpInputs = ref([])

function handleOtpInput(idx, event) {
    const val = event.target.value;
    // Allow only digits
    if (!/^\d*$/.test(val)) {
        otp.value[idx] = '';
        return;
    }
    // Move to next input if filled and next exists
    if (val && idx < 3) {
        otpInputs.value[idx + 1]?.focus();
    }
}

function handleOtpKeydown(idx, event) {
    // Move to previous input on backspace if current is empty
    if (event.key === 'Backspace' && !otp.value[idx] && idx > 0) {
        otpInputs.value[idx - 1]?.focus();
    }
}

// --- Photos & Navigation ---
const photos = ref([])

const canProceed = computed(() => {
    if (currentStep.value === 0) return hasSig.value
    if (currentStep.value === 1) return photos.value.length >= 1
    if (currentStep.value === 2) {
        return otpRequested.value && otp.value.join('').length === 4
    }
    return false
})

async function requestDeliveryOtp(forceResend = false) {
    const orderId = jobStore.getOrderIdForStop(stopId.value)
    if (!orderId) {
        otpStatusMessage.value = 'No order found for OTP verification.'
        return
    }

    otpSending.value = true
    try {
        const response = await api.sendDeliveryOtp(orderId, forceResend)
        const debugOtp = String(response?.debug_otp || '').trim()

        otpRequested.value = true
        otpDestination.value = response.email || ''

        if (/^\d{4}$/.test(debugOtp)) {
            otp.value = debugOtp.split('')
            otpStatusMessage.value = `Dev OTP generated: ${debugOtp}. SMTP is not configured, so email delivery is skipped.`
            uiStore.showToast('OTP generated in dev mode', 'warning', 2000)
        } else {
            otpStatusMessage.value = response.email
                ? `OTP sent to ${response.email}. Ask the customer for the code after handover.`
                : 'OTP sent to the customer email.'
            uiStore.showToast('Delivery OTP sent', 'success', 1600)
        }
    } catch (error) {
        otpStatusMessage.value = error.message || 'Unable to send delivery OTP.'
        uiStore.showToast(otpStatusMessage.value, 'error', 2400)
    } finally {
        otpSending.value = false
    }
}

async function addPhoto() {
    const result = await scanDocument('Capture Proof of Delivery')
    if (result) {
        photos.value.push(result.base64.startsWith('data:') ? result.base64 : `data:image/jpeg;base64,${result.base64}`)
        uiStore.showToast('Photo added ✓', 'success', 1200)
    }
}
function removePhoto(idx) { photos.value.splice(idx, 1) }
async function handleNext() {
    // CRITICAL: Persist signature before leaving step 0
    if (currentStep.value === 0) {
        const persisted = persistSignature()
        if (!persisted) {
            uiStore.showToast('Please provide a signature', 'error', 2000)
            return
        }
    }

    if (currentStep.value < steps.length - 1) {
        currentStep.value++
    }
    else {
        uiStore.showToast('Uploading Proof of Delivery...', 'info', 1500)
        try {
            jobStore.setCurrentStopById(stopId.value)
            const orderId = jobStore.getOrderIdForStop(stopId.value)
            const hasMoreStops = jobStore.currentStopIndex < (jobStore.totalStops - 1)

            const photoBase64List = photos.value
                .map(photo => photo.includes(',') ? photo.split(',')[1] : photo)
                .filter(Boolean)

            // Use the persisted signature (never try to re-capture at this point)
            if (!signatureDataUrl.value) {
                throw new Error('Signature data was lost. Please go back and re-sign.')
            }

            const sigBase64 = signatureDataUrl.value.includes(',')
                ? signatureDataUrl.value.split(',')[1]
                : signatureDataUrl.value

            console.log('[POD] Final submit - hasSig:', hasSig.value, 'sigBase64 length:', sigBase64?.length || 0)

            // Fallback: if stop-based lookup failed, use the top-level job id
            const resolvedOrderId = orderId || jobStore.jobData?.id || jobStore.jobData?.jobId || null

            if (!resolvedOrderId) {
                throw new Error('Order ID not found. Cannot upload proof of delivery.')
            }

            await api.uploadProofOfDelivery(
                resolvedOrderId,
                photoBase64List,
                sigBase64, // This is now guaranteed to be valid
                otp.value.join(''),
                stop.value.customerName || null,
                '',
            )

            jobStore.addPOD({
                photo: photoBase64List[0] || null,
                signature: sigBase64,
                customerName: stop.value.customerName,
                notes: '',
            })

            // COD orders require payment collection after POD but before closing the stop.
            if (requiresCodCollection.value) {
                uiStore.showToast('POD saved. Proceed to COD collection.', 'success', 1800)
                advanceAndNavigate('COD_COLLECTION')
                return
            }

            jobStore.completeCurrentStop()
            routeStore.completeDelivery(stopId.value)
            routeStore.endDwell(stopId.value)
            await driverStore.refreshDashboard()
            notify({ title: 'Delivery Complete', body: `Stop ${stopId.value} delivered successfully`, type: 'delivery', route: '/manifest' })

            // Use FSM: go to NEXT_STOP if more stops, or COMPLETED if last
            const nextState = hasMoreStops ? 'NEXT_STOP' : 'COMPLETED'
            advanceAndNavigate(nextState)
        } catch (err) {
            console.error('POD upload error:', err)
            uiStore.showToast(err?.message || 'Failed to upload POD. Please try again.', 'error', 2500)
        }
    }
}
</script>
