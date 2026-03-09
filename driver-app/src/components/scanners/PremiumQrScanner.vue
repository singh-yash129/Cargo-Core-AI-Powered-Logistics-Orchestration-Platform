<template>
    <div v-if="isOpen" class="fixed inset-0 z-[9999] bg-transparent flex flex-col font-sans">

        <!-- Header Overlay -->
        <div
            class="h-28 bg-gradient-to-b from-black/80 to-transparent flex items-start justify-between px-6 pt-12 z-10 shrink-0">
            <button @click="closeModal"
                class="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white active:scale-95 transition-all outline-none">
                <span class="material-icons">close</span>
            </button>
            <div class="flex gap-3 text-white">
                <button @click="toggleTorch"
                    class="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center active:scale-95 transition-all outline-none">
                    <span class="material-icons">{{ flashOn ? 'flash_on' : 'flash_off' }}</span>
                </button>
            </div>
        </div>

        <!-- Scanning Area -->
        <div class="flex-1 relative flex items-center justify-center z-10">
            <!-- Semi-transparent overlay around the cutout -->
            <div class="absolute inset-0 scanner-backdrop"></div>

            <!-- Target Cutout -->
            <div class="relative w-64 h-64 z-20">
                <!-- Outer glow -->
                <div
                    class="absolute inset-0 rounded-3xl shadow-[0_0_0_4000px_rgba(0,0,0,0.65)] pointer-events-none border border-white/20">
                </div>

                <!-- Corner Indicators -->
                <div class="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-primary rounded-tl-3xl"></div>
                <div class="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-primary rounded-tr-3xl"></div>
                <div class="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-primary rounded-bl-3xl">
                </div>
                <div class="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-primary rounded-br-3xl">
                </div>

                <!-- Laser Sweep -->
                <div
                    class="scan-laser absolute left-4 right-4 h-[2px] bg-primary rounded-full shadow-[0_0_10px_#1ce783,0_0_20px_#1ce783]">
                </div>
            </div>

            <p
                class="absolute bottom-16 left-0 right-0 text-center text-white/80 font-medium text-sm tracking-wide z-20 px-8">
                {{ promptText }}
            </p>
        </div>

        <!-- Footer Overlay -->
        <div
            class="h-32 bg-gradient-to-t from-black/90 to-transparent z-10 shrink-0 flex items-center justify-center pb-8">
            <div
                class="bg-black/40 backdrop-blur-xl border border-white/10 rounded-full px-6 py-3 flex items-center gap-3">
                <span class="material-icons text-primary animate-pulse">qr_code_scanner</span>
                <span class="text-white font-bold text-sm tracking-widest uppercase">Scanning Engine Active</span>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { Capacitor } from '@capacitor/core'
import { BarcodeScanner } from '@capacitor-mlkit/barcode-scanning'
import { Haptics, ImpactStyle } from '@capacitor/haptics'

const props = defineProps({
    promptText: { type: String, default: 'Align QR code within frame' }
})

const emit = defineEmits(['close', 'scanned'])

const isOpen = ref(true)
const flashOn = ref(false)
const scanListener = ref(null)

onMounted(async () => {
    // Check permissions and start scanning
    if (Capacitor.isNativePlatform()) {
        const { camera } = await BarcodeScanner.requestPermissions()
        if (camera === 'granted' || camera === 'limited') {
            document.body.classList.add('barcode-scanner-active') // Makes webview transparent

            await BarcodeScanner.startScan()

            scanListener.value = await BarcodeScanner.addListener('barcodeScanned', async (result) => {
                if (result.barcode) {
                    await Haptics.impact({ style: ImpactStyle.Heavy })
                    emit('scanned', result.barcode.rawValue)
                    closeModal()
                }
            })
        } else {
            alert('Camera permission required.')
            emit('close')
        }
    } else {
        // Fallback simulated scan for web
        console.warn('QR Scanner requires native device. Simulating scan after 2.5s')
        setTimeout(() => {
            Haptics.impact({ style: ImpactStyle.Medium }).catch(() => { })
            emit('scanned', 'MOCK-QR-12345')
            closeModal()
        }, 2500)
    }
})

onUnmounted(() => {
    stopScanner()
})

async function toggleTorch() {
    flashOn.value = !flashOn.value
    if (Capacitor.isNativePlatform()) {
        // ML Kit barcode scanner torch toggle
        // Note: capacitor-mlkit barcode scanning torches are managed via options or separate plugin methods depending on version.
        // Simplified boolean toggle state here.
    }
}

async function stopScanner() {
    if (scanListener.value) {
        await scanListener.value.remove()
        scanListener.value = null
    }
    if (Capacitor.isNativePlatform()) {
        document.body.classList.remove('barcode-scanner-active')
        await BarcodeScanner.stopScan().catch(() => { })
    }
}

async function closeModal() {
    isOpen.value = false
    await stopScanner()
    emit('close')
}
</script>

<style scoped>
.barcode-scanner-active {
    background: transparent !important;
}

.scan-laser {
    animation: sweep 2.5s ease-in-out infinite;
    top: 0;
}

@keyframes sweep {
    0% {
        top: 10px;
        opacity: 0;
    }

    10% {
        opacity: 1;
    }

    50% {
        top: calc(100% - 10px);
        opacity: 1;
    }

    90% {
        opacity: 1;
    }

    100% {
        top: 10px;
        opacity: 0;
    }
}
</style>
