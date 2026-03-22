<template>
    <div class="screen-layout" :class="isDark ? 'bg-background-dark text-white' : 'bg-background-light text-gray-900'">

        <header class="flex-shrink-0 px-5 pt-5 pb-4 border-b"
            :class="isDark ? 'border-white/5' : 'border-gray-100'">
            <div class="flex items-center gap-3">
                <button @click="$router.back()" class="w-8 h-8 rounded-full flex items-center justify-center"
                    :class="isDark ? 'bg-surface-dark/50 text-gray-400' : 'bg-gray-100 text-gray-600'">
                    <span class="material-icons text-lg">arrow_back</span>
                </button>
                <div>
                    <p class="text-xs uppercase tracking-wider font-bold text-purple-400">House Shift · Final Step</p>
                    <h1 class="text-xl font-black">Customer Sign-Off</h1>
                </div>
            </div>
        </header>

        <div class="screen-body flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">

            <!-- Customer Info -->
            <div class="rounded-2xl border p-4"
                :class="isDark ? 'bg-surface-dark/40 border-white/8' : 'bg-white border-gray-100 shadow-sm'">
                <p class="text-xs uppercase tracking-wider font-bold mb-3"
                    :class="isDark ? 'text-gray-400' : 'text-gray-500'">Customer Confirmation</p>
                <div class="flex items-center gap-3 mb-4">
                    <div class="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                        <span class="material-icons text-purple-400 text-xl">person</span>
                    </div>
                    <div>
                        <p class="font-bold">{{ customerName }}</p>
                        <p class="text-xs" :class="isDark ? 'text-gray-400' : 'text-gray-500'">
                            {{ jobStore.jobData?.destinationLocation?.address?.slice(0, 40) }}...
                        </p>
                    </div>
                </div>
                <div class="space-y-1">
                    <p class="text-xs uppercase font-bold tracking-wider mb-2"
                        :class="isDark ? 'text-gray-400' : 'text-gray-500'">Customer Name (Print)</p>
                    <input v-model="printedName" type="text" placeholder="Customer full name..."
                        class="w-full rounded-xl px-4 py-3 text-sm border outline-none focus:ring-2 focus:ring-purple-500/50"
                        :class="isDark ? 'bg-black/20 border-white/10 text-white placeholder-gray-600' : 'bg-gray-50 border-gray-200'" />
                </div>
            </div>

            <!-- Signature Pad -->
            <div class="rounded-2xl border overflow-hidden"
                :class="isDark ? 'bg-surface-dark/40 border-white/8' : 'bg-white border-gray-100 shadow-sm'">
                <div class="px-4 py-3 border-b flex items-center justify-between"
                    :class="isDark ? 'border-white/5' : 'border-gray-100'">
                    <p class="text-xs uppercase tracking-wider font-bold"
                        :class="isDark ? 'text-gray-400' : 'text-gray-500'">Customer Signature</p>
                    <button @click="clearSignature" class="text-xs text-red-400 font-semibold flex items-center gap-1">
                        <span class="material-icons text-sm">refresh</span> Clear
                    </button>
                </div>
                <div class="p-3">
                    <canvas ref="signatureCanvas" width="340" height="160"
                        class="w-full rounded-xl border-2 border-dashed cursor-crosshair touch-none"
                        :class="hasSignature
                            ? 'border-purple-500/50 bg-purple-500/5'
                            : isDark ? 'border-gray-700 bg-black/20' : 'border-gray-200 bg-gray-50'"
                        @mousedown="startDraw" @mousemove="draw" @mouseup="endDraw" @mouseleave="endDraw"
                        @touchstart.prevent="startDrawTouch" @touchmove.prevent="drawTouch" @touchend="endDraw">
                    </canvas>
                    <p v-if="!hasSignature" class="text-center text-xs mt-2"
                        :class="isDark ? 'text-gray-600' : 'text-gray-400'">
                        Hand device to customer for signature
                    </p>
                </div>
            </div>

            <!-- Balance Due -->
            <div v-if="balanceDue > 0" class="rounded-2xl border p-4"
                :class="isDark ? 'bg-signal-amber/10 border-signal-amber/30' : 'bg-amber-50 border-amber-200'">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-xs uppercase font-bold tracking-wider text-signal-amber">Balance Due</p>
                        <p class="text-2xl font-black text-signal-amber mt-0.5">₹{{ balanceDue.toLocaleString() }}</p>
                    </div>
                    <button @click="collectedBalance = !collectedBalance"
                        class="px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all"
                        :class="collectedBalance
                            ? 'bg-green-500 border-green-500 text-white'
                            : 'border-signal-amber text-signal-amber'">
                        {{ collectedBalance ? '✓ Collected' : 'Mark Collected' }}
                    </button>
                </div>
            </div>
        </div>

        <!-- Footer -->
        <div class="screen-footer border-t px-5 pt-4 pb-4"
            :class="isDark ? 'border-white/5 bg-background-dark' : 'border-gray-100 bg-background-light'">
            <div v-if="!canComplete" class="mb-3 px-3 py-2 rounded-xl text-xs font-semibold text-center"
                :class="isDark ? 'bg-red-500/10 text-red-400' : 'bg-red-50 text-red-600 border border-red-200'">
                {{ blockReason }}
            </div>
            <button @click="completeJob" :disabled="!canComplete"
                class="w-full rounded-2xl h-14 flex items-center justify-center gap-3 relative overflow-hidden active:scale-[0.98] transition-all"
                :class="canComplete ? 'shadow-glow cursor-pointer' : 'opacity-40 cursor-not-allowed'">
                <div class="absolute inset-0"
                    :class="canComplete ? 'bg-gradient-to-r from-green-600 to-green-500' : (isDark ? 'bg-gray-700' : 'bg-gray-200')">
                </div>
                <span class="relative material-icons text-2xl text-white">check_circle</span>
                <span class="relative text-lg font-black uppercase tracking-wide text-white">Complete Job</span>
            </button>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useJobStore } from '../stores/jobStore.js'
import { useUiStore } from '../stores/uiStore.js'
import { useFlowRouter } from '../composables/useFlowRouter.js'

const jobStore = useJobStore()
const uiStore = useUiStore()
const { advanceAndNavigate } = useFlowRouter()
const isDark = computed(() => uiStore.theme !== 'light')

const printedName = ref('')
const signatureCanvas = ref(null)
const hasSignature = ref(false)
const collectedBalance = ref(false)
let isDrawing = false
let ctx = null

const customerName = computed(() => jobStore.jobData?.destinationLocation?.customerName || 'Customer')
const balanceDue = computed(() => jobStore.jobData?.balanceDue || 0)

const canComplete = computed(() => {
    const nameOk = printedName.value.trim().length >= 3
    const signatureOk = hasSignature.value
    const balanceOk = balanceDue.value === 0 || collectedBalance.value
    return nameOk && signatureOk && balanceOk
})

const blockReason = computed(() => {
    if (printedName.value.trim().length < 3) return 'Enter customer full name'
    if (!hasSignature.value) return 'Customer signature required'
    if (balanceDue.value > 0 && !collectedBalance.value) return `Collect balance ₹${balanceDue.value.toLocaleString()} first`
    return ''
})

onMounted(() => {
    if (signatureCanvas.value) {
        ctx = signatureCanvas.value.getContext('2d')
        ctx.strokeStyle = isDark.value ? '#ffffff' : '#1a1a1a'
        ctx.lineWidth = 2.5
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
    }
})

function getPos(canvas, event) {
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    return {
        x: (event.clientX - rect.left) * scaleX,
        y: (event.clientY - rect.top) * scaleY
    }
}

function startDraw(e) {
    isDrawing = true
    const pos = getPos(signatureCanvas.value, e)
    ctx.beginPath()
    ctx.moveTo(pos.x, pos.y)
}

function draw(e) {
    if (!isDrawing) return
    const pos = getPos(signatureCanvas.value, e)
    ctx.lineTo(pos.x, pos.y)
    ctx.stroke()
    hasSignature.value = true
}

function endDraw() { isDrawing = false }

function startDrawTouch(e) {
    isDrawing = true
    const touch = e.touches[0]
    const pos = getPos(signatureCanvas.value, touch)
    ctx.beginPath()
    ctx.moveTo(pos.x, pos.y)
}

function drawTouch(e) {
    if (!isDrawing) return
    const touch = e.touches[0]
    const pos = getPos(signatureCanvas.value, touch)
    ctx.lineTo(pos.x, pos.y)
    ctx.stroke()
    hasSignature.value = true
}

function clearSignature() {
    ctx.clearRect(0, 0, signatureCanvas.value.width, signatureCanvas.value.height)
    hasSignature.value = false
}

function completeJob() {
    if (!canComplete.value) return
    uiStore.showToast('Job completed! 🎉', 'success', 3000)
    setTimeout(() => {
        advanceAndNavigate('COMPLETED', {
            customerName: printedName.value,
            completedAt: new Date().toISOString(),
            balanceCollected: collectedBalance.value
        })
    }, 500)
}
</script>
