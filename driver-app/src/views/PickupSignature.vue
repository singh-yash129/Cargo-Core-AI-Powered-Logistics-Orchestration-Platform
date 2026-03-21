<template>
    <div class="screen-layout" :class="isDark ? 'bg-background-dark text-white' : 'bg-background-light text-gray-900'">

        <!-- ── HEADER ───────────────────────────────── -->
        <header class="flex-shrink-0 px-5 pt-5 pb-4 border-b" :class="isDark ? 'border-white/5' : 'border-gray-100'">
            <div class="flex items-center gap-3">
                <button @click="$router.back()" class="w-10 h-10 rounded-full flex items-center justify-center border"
                    :class="isDark ? 'bg-surface-dark border-white/5 text-gray-400' : 'bg-white border-gray-200 shadow-sm'">
                    <span class="material-icons text-xl">arrow_back</span>
                </button>
                <div>
                    <h1 class="text-2xl font-black tracking-tight">Customer Signature</h1>
                    <p class="text-xs" :class="isDark ? 'text-gray-400' : 'text-gray-500'">Confirm item handover</p>
                </div>
            </div>
        </header>

        <!-- ── SCROLLABLE BODY ───────────────────────── -->
        <div class="screen-body px-5 py-4 flex flex-col gap-4">

            <!-- Items Summary -->
            <div class="rounded-2xl p-5 border"
                :class="isDark ? 'bg-surface-dark/40 border-white/8' : 'bg-white border-gray-100 shadow-sm'">
                <h3 class="text-xs font-black uppercase tracking-wider text-primary mb-3">Items Collected</h3>
                <div class="space-y-2">
                    <div v-for="(item, idx) in stop.itemsScanned" :key="idx"
                        class="flex items-center gap-2 text-sm">
                        <span class="material-icons text-green-400 text-base">check_circle</span>
                        <span class="font-mono">{{ item.barcode }}</span>
                    </div>
                </div>
                <div class="mt-4 pt-4 border-t flex items-center justify-between"
                    :class="isDark ? 'border-white/5' : 'border-gray-100'">
                    <span class="font-semibold text-sm">Total Items</span>
                    <span class="font-black text-lg text-primary">{{ stop.itemsScanned?.length || 0 }}</span>
                </div>
            </div>

            <!-- Customer Info -->
            <div class="rounded-2xl p-4 border"
                :class="isDark ? 'bg-surface-dark/30 border-white/5' : 'bg-gray-50 border-gray-100'">
                <p class="text-xs font-semibold mb-2" :class="isDark ? 'text-gray-400' : 'text-gray-500'">Customer</p>
                <p class="font-bold text-lg">{{ stop.customerName }}</p>
                <p class="text-sm" :class="isDark ? 'text-gray-400' : 'text-gray-500'">{{ stop.address }}</p>
            </div>

            <!-- Signature Canvas -->
            <div class="rounded-2xl border overflow-hidden"
                :class="isDark ? 'bg-surface-dark border-white/10' : 'bg-white border-gray-200 shadow-sm'">
                <div class="p-4 border-b" :class="isDark ? 'border-white/5' : 'border-gray-100'">
                    <div class="flex items-center justify-between">
                        <h3 class="text-xs font-black uppercase tracking-wider text-primary">Signature Pad</h3>
                        <button @click="clearSignature"
                            class="text-xs font-semibold text-red-400 flex items-center gap-1">
                            <span class="material-icons text-sm">replay</span>
                            Clear
                        </button>
                    </div>
                </div>
                <div class="relative">
                    <canvas ref="signatureCanvas" width="800" height="300"
                        class="w-full h-[200px] touch-none cursor-crosshair"
                        :class="isDark ? 'bg-gray-900' : 'bg-gray-50'"
                        @touchstart="startDrawing" @touchmove="draw" @touchend="stopDrawing"
                        @mousedown="startDrawing" @mousemove="draw" @mouseup="stopDrawing" @mouseleave="stopDrawing">
                    </canvas>
                    <div v-if="!hasSignature"
                        class="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <p class="text-sm font-semibold" :class="isDark ? 'text-gray-600' : 'text-gray-400'">
                            Sign here
                        </p>
                    </div>
                </div>
            </div>

        </div>

        <!-- ── STICKY FOOTER ────────────────────────── -->
        <div class="screen-footer px-5 py-4 border-t"
            :class="isDark ? 'border-white/5 bg-background-dark' : 'border-gray-100 bg-background-light'">
            <button @click="confirmSignature" :disabled="!hasSignature"
                class="w-full rounded-2xl h-14 flex items-center justify-center gap-2 font-bold text-lg active:scale-[0.98] transition-all"
                :class="hasSignature
                    ? 'bg-blue-500 text-white shadow-xl'
                    : isDark ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-gray-100 text-gray-400 cursor-not-allowed'">
                <span class="material-icons">{{ hasSignature ? 'check' : 'lock' }}</span>
                {{ hasSignature ? 'Confirm Pickup' : 'Signature required' }}
            </button>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useJobStore } from '../stores/jobStore.js'
import { useUiStore } from '../stores/uiStore.js'
import { useFlowRouter } from '../composables/useFlowRouter.js'

const { advanceAndNavigate } = useFlowRouter()
const jobStore = useJobStore()
const uiStore = useUiStore()
const isDark = computed(() => uiStore.theme !== 'light')

const signatureCanvas = ref(null)
let ctx = null
let isDrawing = false
const hasSignature = ref(false)

const stop = computed(() => jobStore.currentStop || {})

onMounted(async () => {
    await nextTick()
    if (signatureCanvas.value) {
        ctx = signatureCanvas.value.getContext('2d')
        ctx.strokeStyle = isDark.value ? '#ffffff' : '#000000'
        ctx.lineWidth = 2
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
    }
})

function getCoordinates(e) {
    const rect = signatureCanvas.value.getBoundingClientRect()
    const scaleX = signatureCanvas.value.width / rect.width
    const scaleY = signatureCanvas.value.height / rect.height

    if (e.touches && e.touches[0]) {
        return {
            x: (e.touches[0].clientX - rect.left) * scaleX,
            y: (e.touches[0].clientY - rect.top) * scaleY
        }
    }
    return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY
    }
}

function startDrawing(e) {
    e.preventDefault()
    isDrawing = true
    const coords = getCoordinates(e)
    ctx.beginPath()
    ctx.moveTo(coords.x, coords.y)
    hasSignature.value = true
}

function draw(e) {
    if (!isDrawing) return
    e.preventDefault()
    const coords = getCoordinates(e)
    ctx.lineTo(coords.x, coords.y)
    ctx.stroke()
}

function stopDrawing(e) {
    if (!isDrawing) return
    e.preventDefault()
    isDrawing = false
    ctx.closePath()
}

function clearSignature() {
    if (!signatureCanvas.value) return
    ctx.clearRect(0, 0, signatureCanvas.value.width, signatureCanvas.value.height)
    hasSignature.value = false
}

async function confirmSignature() {
    if (!hasSignature.value) return

    // Get signature as base64
    const signatureData = signatureCanvas.value.toDataURL('image/png')

    // Update stop with signature
    stop.value.signature = signatureData

    uiStore.showToast('Signature captured successfully', 'success', 1500)

    // Transition to next state via FSM
    advanceAndNavigate('LOAD_CONFIRM', {
        signedAt: new Date().toISOString(),
        signature: signatureData
    })
}
</script>
