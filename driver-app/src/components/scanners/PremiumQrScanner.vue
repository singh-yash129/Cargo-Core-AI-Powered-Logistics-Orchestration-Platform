<template>
    <div class="flex flex-col h-full font-sans select-none"
        :class="isNative ? 'bg-transparent' : 'bg-gray-900'">

        <!-- ── Header ─────────────────────────────── -->
        <div class="h-28 bg-gradient-to-b from-black/80 to-transparent flex items-start justify-between px-6 pt-12 z-10 shrink-0">
            <button @click.stop.prevent="onClose"
                class="w-11 h-11 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white active:scale-90 transition-transform outline-none"
                style="pointer-events: auto; touch-action: manipulation;">
                <span class="material-icons">close</span>
            </button>
            <div class="flex gap-3 text-white">
                <button @click.stop.prevent="toggleTorch"
                    class="w-11 h-11 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center active:scale-90 transition-transform outline-none"
                    :class="torchOn ? 'text-yellow-300' : 'text-white'">
                    <span class="material-icons">{{ torchOn ? 'flash_on' : 'flash_off' }}</span>
                </button>
            </div>
        </div>

        <!-- ── Scan Area ───────────────────────────── -->
        <div class="flex-1 relative flex items-center justify-center z-10">
            <div class="absolute inset-0 scanner-backdrop"></div>

            <!-- QR Frame -->
            <div class="relative w-64 h-64 z-20">
                <div class="absolute inset-0 rounded-3xl shadow-[0_0_0_4000px_rgba(0,0,0,0.65)] pointer-events-none border border-white/20"></div>
                <div class="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-primary rounded-tl-3xl"></div>
                <div class="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-primary rounded-tr-3xl"></div>
                <div class="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-primary rounded-bl-3xl"></div>
                <div class="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-primary rounded-br-3xl"></div>
                <div class="scan-laser absolute left-4 right-4 h-[2px] bg-primary rounded-full shadow-[0_0_10px_#1ce783,0_0_20px_#1ce783]"></div>
            </div>

            <p class="absolute bottom-16 left-0 right-0 text-center text-white/80 font-medium text-sm tracking-wide z-20 px-8">
                {{ store.promptText || 'Align QR code within frame' }}
            </p>
        </div>

        <!-- ── Footer ─────────────────────────────── -->
        <div class="h-32 bg-gradient-to-t from-black/90 to-transparent z-10 shrink-0 flex items-center justify-center pb-8">
            <div class="bg-black/40 backdrop-blur-xl border border-white/10 rounded-full px-6 py-3 flex items-center gap-3">
                <span class="material-icons text-primary animate-pulse">qr_code_scanner</span>
                <span class="text-white font-bold text-sm tracking-widest uppercase">Scanning Engine Active</span>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { Capacitor } from '@capacitor/core'
import { BarcodeScanner } from '@capacitor-mlkit/barcode-scanning'
import { Haptics, ImpactStyle } from '@capacitor/haptics'
import { useCameraBridgeStore } from '../../stores/cameraBridgeStore.js'

const store = useCameraBridgeStore()
const router = useRouter()
const isNative = Capacitor.isNativePlatform()
const torchOn = ref(false)
const scanListener = ref(null)

onMounted(async () => {
    if (!isNative) return
    try {
        let status = await BarcodeScanner.checkPermissions()
        let camera = status.camera
        if (camera !== 'granted' && camera !== 'limited') {
            status = await BarcodeScanner.requestPermissions()
            camera = status.camera
        }

        if (camera === 'granted' || camera === 'limited') {
            document.body.classList.add('barcode-scanner-active')
            
            // On Android, the Google scanner module might need installation
            if (Capacitor.getPlatform() === 'android') {
                try {
                    await BarcodeScanner.installGoogleBarcodeScannerModule()
                } catch (e) { /* already installed or unavailable */ }
            }

            await BarcodeScanner.startScan()
            scanListener.value = await BarcodeScanner.addListener('barcodeScanned', async (result) => {
                if (result.barcode) {
                    await Haptics.impact({ style: ImpactStyle.Heavy }).catch(() => {})
                    await stopScanner()
                    store.deliver(result.barcode.rawValue)
                    await store.navigateBack(router)
                }
            })
        } else {
            alert('Scanner Error: Camera permission is ' + camera)
            store.cancel()
            await store.navigateBack(router)
        }
    } catch (e) {
        // Handle emulator CameraX NullPointerException gracefully
        if (e.message && e.message.includes('null object reference')) {
            alert('Emulator camera failed: ' + e.message + '\n\nSimulating scan for testing.')
            store.deliver('CC-TRK-042') // Mock result
            await store.navigateBack(router)
            return
        }
        alert('QR Mount Error: ' + e.message)
        store.cancel()
        await store.navigateBack(router)
    }
})

onUnmounted(() => stopScanner())

async function stopScanner() {
    if (scanListener.value) {
        await scanListener.value.remove().catch(() => {})
        scanListener.value = null
    }
    document.body.classList.remove('barcode-scanner-active')
    await BarcodeScanner.stopScan().catch(() => {})
}

async function toggleTorch() {
    torchOn.value = !torchOn.value
    try {
        await BarcodeScanner.stopScan()
        await BarcodeScanner.startScan({ torchEnabled: torchOn.value })
    } catch { /* ignore */ }
}

async function onClose() {
    await stopScanner()
    store.cancel()
    await store.navigateBack(router)
}
</script>

<style>
.barcode-scanner-active body,
.barcode-scanner-active #app {
    background: transparent !important;
}
</style>

<style scoped>
.scan-laser {
    animation: sweep 2.5s ease-in-out infinite;
    top: 0;
}
@keyframes sweep {
    0%   { top: 10px; opacity: 0; }
    10%  { opacity: 1; }
    50%  { top: calc(100% - 10px); opacity: 1; }
    90%  { opacity: 1; }
    100% { top: 10px; opacity: 0; }
}
.scanner-backdrop {
    background: radial-gradient(circle, transparent 40%, rgba(0,0,0,0.8) 100%);
}
</style>
