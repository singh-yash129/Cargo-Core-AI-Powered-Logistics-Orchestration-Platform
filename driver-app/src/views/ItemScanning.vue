<template>
    <div class="screen-layout" :class="isDark ? 'bg-background-dark text-white' : 'bg-background-light text-gray-900'">

        <!-- ── HEADER ───────────────────────────────── -->
        <header class="flex-shrink-0 px-5 pt-5 pb-4 border-b" :class="isDark ? 'border-white/5' : 'border-gray-100'">
            <div class="flex items-center gap-3">
                <button @click="cancelScanning" class="w-10 h-10 rounded-full flex items-center justify-center border"
                    :class="isDark ? 'bg-surface-dark border-white/5 text-gray-400' : 'bg-white border-gray-200 shadow-sm'">
                    <span class="material-icons text-xl">close</span>
                </button>
                <div>
                    <h1 class="text-2xl font-black tracking-tight">Scan Pickup Items</h1>
                    <p class="text-xs" :class="isDark ? 'text-gray-400' : 'text-gray-500'">
                        {{ scannedItems.length }} of {{ expectedItems }} items scanned
                    </p>
                </div>
            </div>
        </header>

        <!-- ── SCROLLABLE BODY ───────────────────────── -->
        <div class="screen-body px-5 py-4 flex flex-col gap-4">

            <!-- Progress Card -->
            <div class="rounded-2xl p-5 border"
                :class="isDark ? 'bg-surface-dark/40 border-white/8' : 'bg-white border-gray-100 shadow-sm'">
                <div class="flex items-center justify-between mb-3">
                    <span class="text-xs font-bold uppercase tracking-wider" :class="isDark ? 'text-gray-400' : 'text-gray-500'">
                        Scanning Progress
                    </span>
                    <span class="text-lg font-black text-primary">{{ Math.round(progressPercent) }}%</span>
                </div>
                <div class="w-full h-3 rounded-full" :class="isDark ? 'bg-gray-800' : 'bg-gray-200'">
                    <div class="h-3 rounded-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-300"
                        :style="`width: ${progressPercent}%`"></div>
                </div>
            </div>

            <!-- Scan Button -->
            <button @click="scanItem" :disabled="isScanning"
                class="rounded-2xl p-8 border-2 border-dashed transition-all active:scale-[0.98]"
                :class="isScanning
                    ? isDark ? 'bg-primary/5 border-primary/20 cursor-wait' : 'bg-primary/5 border-primary/20 cursor-wait'
                    : isDark ? 'bg-surface-dark/30 border-white/10 hover:border-primary/30' : 'bg-white border-gray-200 hover:border-primary'">
                <div class="flex flex-col items-center gap-3">
                    <div class="w-20 h-20 rounded-full flex items-center justify-center"
                        :class="isScanning ? 'bg-primary/20 animate-pulse' : isDark ? 'bg-primary/10' : 'bg-primary/10'">
                        <span class="material-icons text-5xl" :class="isScanning ? 'text-primary animate-spin' : 'text-primary'">
                            {{ isScanning ? 'sync' : 'qr_code_scanner' }}
                        </span>
                    </div>
                    <p class="font-bold text-lg">{{ isScanning ? 'Scanning...' : 'Tap to Scan Barcode' }}</p>
                    <p class="text-xs" :class="isDark ? 'text-gray-400' : 'text-gray-500'">
                        Scan return item barcode or QR code
                    </p>
                </div>
            </button>

            <!-- Scanned Items List -->
            <div v-if="scannedItems.length > 0" class="rounded-2xl border"
                :class="isDark ? 'bg-surface-dark/30 border-white/5' : 'bg-white border-gray-100 shadow-sm'">
                <div class="p-4 border-b" :class="isDark ? 'border-white/5' : 'border-gray-100'">
                    <h3 class="text-xs font-black uppercase tracking-wider text-primary">Scanned Items</h3>
                </div>
                <div class="divide-y" :class="isDark ? 'divide-white/5' : 'divide-gray-100'">
                    <div v-for="(item, idx) in scannedItems" :key="idx"
                        class="p-4 flex items-center gap-3 transition-colors"
                        :class="isDark ? 'hover:bg-white/5' : 'hover:bg-gray-50'">
                        <div class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                            :class="isDark ? 'bg-green-500/15' : 'bg-green-50'">
                            <span class="material-icons text-green-400">check_circle</span>
                        </div>
                        <div class="flex-1">
                            <p class="font-bold text-sm">{{ item.barcode }}</p>
                            <p class="text-xs" :class="isDark ? 'text-gray-400' : 'text-gray-500'">
                                Scanned at {{ new Date(item.scannedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) }}
                            </p>
                        </div>
                        <button @click="removeItem(idx)"
                            class="w-8 h-8 rounded-lg flex items-center justify-center"
                            :class="isDark ? 'hover:bg-red-500/10 text-red-400' : 'hover:bg-red-50 text-red-500'">
                            <span class="material-icons text-sm">delete</span>
                        </button>
                    </div>
                </div>
            </div>

            <!-- Customer Info -->
            <div class="rounded-2xl p-4 border text-xs space-y-1"
                :class="isDark ? 'bg-surface-dark/30 border-white/5 text-gray-400' : 'bg-gray-50 border-gray-100 text-gray-600'">
                <p><strong class="text-primary">Customer:</strong> {{ stop.customerName }}</p>
                <p><strong class="text-primary">Expected Items:</strong> {{ expectedItems }}</p>
                <p><strong class="text-primary">Instructions:</strong> {{ stop.specialInstructions }}</p>
            </div>

        </div>

        <!-- ── STICKY FOOTER ────────────────────────── -->
        <div class="screen-footer px-5 py-4 border-t"
            :class="isDark ? 'border-white/5 bg-background-dark' : 'border-gray-100 bg-background-light'">
            <button @click="completeScanning" :disabled="!allItemsScanned"
                class="w-full rounded-2xl h-14 flex items-center justify-center gap-2 font-bold text-lg active:scale-[0.98] transition-all"
                :class="allItemsScanned
                    ? 'bg-blue-500 text-white shadow-xl'
                    : isDark ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-gray-100 text-gray-400 cursor-not-allowed'">
                <span class="material-icons">{{ allItemsScanned ? 'draw' : 'lock' }}</span>
                {{ allItemsScanned ? 'Get Customer Signature' : `Scan ${expectedItems - scannedItems.length} more items` }}
            </button>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useJobStore } from '../stores/jobStore.js'
import { useUiStore } from '../stores/uiStore.js'
import { useCamera } from '../composables/useCamera.js'

const router = useRouter()
const jobStore = useJobStore()
const uiStore = useUiStore()
const isDark = computed(() => uiStore.theme !== 'light')

const { scanQrCode, isCapturing: isScanning } = useCamera()

const stop = computed(() => jobStore.currentStop || {})
const expectedItems = computed(() => stop.value.expectedItems || 0)
const scannedItems = ref([])

const progressPercent = computed(() => {
    if (expectedItems.value === 0) return 0
    return (scannedItems.value.length / expectedItems.value) * 100
})

const allItemsScanned = computed(() => {
    return scannedItems.value.length >= expectedItems.value && expectedItems.value > 0
})

async function scanItem() {
    try {
        const barcode = await scanQrCode('Scan Return Item Barcode')

        if (barcode) {
            // Add to scanned items
            scannedItems.value.push({
                barcode: barcode,
                scannedAt: new Date().toISOString()
            })

            uiStore.showToast(`Item scanned: ${barcode}`, 'success', 1500)

            // Update stop data in job store
            if (stop.value.itemsScanned) {
                stop.value.itemsScanned = scannedItems.value
            }
        }
    } catch (e) {
        console.error('Scan error:', e)
        // Simulate scan for testing
        const mockBarcode = `RTN-${Date.now().toString().substr(-6)}`
        scannedItems.value.push({
            barcode: mockBarcode,
            scannedAt: new Date().toISOString()
        })
        uiStore.showToast(`Simulated scan: ${mockBarcode}`, 'info', 1500)
    }
}

function removeItem(index) {
    scannedItems.value.splice(index, 1)
    uiStore.showToast('Item removed from scan list', 'info', 1500)
}

function cancelScanning() {
    if (scannedItems.value.length > 0) {
        if (confirm('Discard scanned items and go back?')) {
            router.back()
        }
    } else {
        router.back()
    }
}

async function completeScanning() {
    if (!allItemsScanned.value) return

    try {
        // Update job store with scanned items
        stop.value.itemsScanned = scannedItems.value

        // Transition to next state
        await jobStore.transition('PICKUP_SIGNATURE', {
            itemsScanned: scannedItems.value,
            scannedAt: new Date().toISOString()
        })

        router.push(`/pickup-signature/${stop.value.id}`)
    } catch (e) {
        uiStore.showToast(e.message, 'error', 2000)
    }
}
</script>
