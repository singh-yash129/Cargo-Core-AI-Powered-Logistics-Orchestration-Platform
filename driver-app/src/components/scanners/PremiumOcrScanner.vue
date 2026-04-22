<template>
    <div class="flex flex-col h-full font-sans select-none"
        :class="isNative ? 'bg-transparent' : 'bg-gray-900'">

        <!-- ── Header ─────────────────────────────── -->
        <div class="h-28 bg-gradient-to-b from-black/80 to-transparent flex items-start justify-between px-6 pt-12 z-10 shrink-0">
            <button @click.stop.prevent="onClose"
                class="w-11 h-11 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white active:scale-90 transition-transform outline-none">
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
        <div class="flex-1 relative flex items-center justify-center z-10 pointer-events-none">
            <div class="absolute inset-0 scanner-backdrop"></div>

            <!-- Wide odometer frame -->
            <div class="relative w-[300px] h-[100px] z-20">
                <div class="absolute inset-0 rounded-2xl shadow-[0_0_0_4000px_rgba(0,0,0,0.7)] pointer-events-none border border-white/30"></div>
                <div class="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-2xl"></div>
                <div class="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-2xl"></div>
                <div class="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-2xl"></div>
                <div class="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-2xl"></div>
                <div v-show="!extracting" class="scan-laser absolute left-4 right-4 h-[2px] bg-primary rounded-full shadow-[0_0_10px_#1ce783,0_0_20px_#1ce783]"></div>
            </div>

            <p class="absolute bottom-24 left-0 right-0 text-center text-white/90 font-bold text-sm tracking-widest uppercase z-20 px-8">
                {{ extracting ? 'Extracting Text...' : (store.promptText || 'Fit dashboard text inside frame') }}
            </p>
        </div>

        <!-- ── Footer + capture button ────────────── -->
        <div class="h-40 bg-gradient-to-t from-black to-transparent z-10 shrink-0 flex items-center justify-center pb-6 relative">
            <!-- Camera Initializing Indicator -->
            <div v-if="initializingCamera" class="absolute top-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full text-white text-xs font-bold border border-white/20 flex items-center gap-2">
                <span class="material-icons text-sm animate-spin">sync</span>
                Initializing camera...
            </div>

            <button @click.stop.prevent="captureAndExtract" :disabled="extracting || !cameraReady"
                class="relative w-20 h-20 rounded-full border-4 flex items-center justify-center group transition-all outline-none overflow-hidden bg-black/40 backdrop-blur-md"
                :class="[
                    cameraReady && !extracting ? 'border-primary text-primary active:scale-90' : 'border-white/30 text-white/30 opacity-50 cursor-not-allowed'
                ]"
                style="pointer-events: auto; touch-action: manipulation;">
                <span v-if="extracting" class="material-icons animate-spin">autorenew</span>
                <span v-else-if="initializingCamera" class="material-icons text-2xl">hourglass_empty</span>
                <span v-else class="material-icons text-3xl">text_snippet</span>
            </button>
        </div>

        <!-- White Flash -->
        <Transition name="flash">
            <div v-if="showingFlash" class="absolute inset-0 bg-white z-[10000] pointer-events-none"></div>
        </Transition>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { Capacitor } from '@capacitor/core'
import { CameraPreview } from '@capacitor-community/camera-preview'
import { Ocr } from '@capacitor-community/image-to-text'
import { Haptics, ImpactStyle } from '@capacitor/haptics'
import { useCameraBridgeStore } from '../../stores/cameraBridgeStore.js'
import { normalizeCameraResult, extractOcrText, isValidBase64 } from '../../utils/cameraUtils.js'
import { CameraError, MockCameraData } from '../../utils/cameraConstants.js'

const store = useCameraBridgeStore()
const router = useRouter()
const isNative = Capacitor.isNativePlatform()
const extracting = ref(false)
const showingFlash = ref(false)
const torchOn = ref(false)
const cameraReady = ref(false)
const initializingCamera = ref(false)
const cameraStopped = ref(false)

onMounted(async () => {
    if (!isNative) {
        cameraReady.value = true
        return
    }

    document.documentElement.classList.add('camera-active')
    initializingCamera.value = true
    cameraStopped.value = false

    try {
        await CameraPreview.start({
            position: 'rear',
            toBack: true,
            enableZoom: true,
        })

        // Give the camera a moment to fully initialize (especially important on emulators)
        await new Promise(resolve => setTimeout(resolve, 300))

        cameraReady.value = true
    } catch (e) {
        console.error('CameraPreview OCR start error', e)
        cameraReady.value = true // Allow fallback to mock data
    } finally {
        initializingCamera.value = false
    }
})

onUnmounted(async () => {
    // Only stop if not already stopped
    if (!cameraStopped.value) {
        await stopCamera()
    }
})

async function captureAndExtract() {
    if (extracting.value || !cameraReady.value) return
    extracting.value = true
    showingFlash.value = true
    await Haptics.impact({ style: ImpactStyle.Heavy }).catch(() => {})
    setTimeout(() => { showingFlash.value = false }, 60)

    let base64Pic = ''

    try {
        let extractedText = ''

        if (isNative) {
            const captured = await CameraPreview.capture({ quality: 90 })
            base64Pic = normalizeCameraResult(captured)

            if (!isValidBase64(base64Pic)) {
                throw new Error(CameraError.NO_IMAGE_DATA)
            }

            const ocrResult = await Ocr.detectText({ base64Image: base64Pic })
            extractedText = extractOcrText(ocrResult)
        } else {
            base64Pic = MockCameraData ? MockCameraData.TRANSPARENT_PNG : ''; // graceful fallback
            extractedText = '123,456';
        }

        // Stop camera first and wait for full cleanup
        await stopCamera()

        // Deliver result and navigate
        store.deliver({ text: extractedText, base64: base64Pic })

        // Small delay to ensure store state is updated before navigation
        await new Promise(resolve => setTimeout(resolve, 50))
        await store.navigateBack(router)
    } catch (e) {
        console.error('OCR capture error:', e?.message || String(e))
        if (isNative && isValidBase64(base64Pic)) {
            alert('Auto-read failed. Enter the odometer manually.')
            await stopCamera()
            store.deliver({ text: '', base64: base64Pic, manualEntryRequired: true })
            await new Promise(resolve => setTimeout(resolve, 50))
            await store.navigateBack(router)
            return
        }
        alert('Capture failed. Simulating odometer read for testing.')
        await stopCamera()
        store.deliver({ text: '123,456', base64: MockCameraData ? MockCameraData.TRANSPARENT_PNG : '' })
        await new Promise(resolve => setTimeout(resolve, 50))
        await store.navigateBack(router)
    } finally {
        extracting.value = false
    }
}

async function toggleTorch() {
    torchOn.value = !torchOn.value
    await CameraPreview.setFlashMode({ flashMode: torchOn.value ? 'torch' : 'off' }).catch(() => {})
}

async function stopCamera() {
    if (!isNative || cameraStopped.value) return

    cameraStopped.value = true // Prevent multiple stops

    try {
        document.documentElement.classList.remove('camera-active')
        await CameraPreview.stop()

        // Give the camera a moment to fully release (critical for emulators)
        await new Promise(resolve => setTimeout(resolve, 200))
    } catch (e) {
        console.error('Camera stop error:', e)
        // Force cleanup even if stop fails
        await new Promise(resolve => setTimeout(resolve, 200))
    }
}

async function onClose() {
    await stopCamera()
    store.cancel()
    // Ensure cleanup before navigation
    await new Promise(resolve => setTimeout(resolve, 50))
    await store.navigateBack(router)
}
</script>

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
.flash-enter-active { transition: opacity 0.05s; }
.flash-leave-active { transition: opacity 0.15s ease-out; }
.flash-enter-from, .flash-leave-to { opacity: 0; }
</style>
