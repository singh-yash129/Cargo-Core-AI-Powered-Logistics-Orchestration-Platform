<template>
    <div v-if="isOpen" class="fixed inset-0 z-[9999] flex flex-col font-sans"
        :class="isNative ? 'bg-transparent' : 'bg-gray-900'">

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
        <div class="flex-1 relative flex items-center justify-center z-10 pointer-events-none">
            <!-- Semi-transparent overlay around the cutout -->
            <div class="absolute inset-0 scanner-backdrop"></div>

            <!-- Wide Odometer Cutout -->
            <div class="relative w-[300px] h-[100px] z-20">
                <!-- Outer shading -->
                <div
                    class="absolute inset-0 rounded-2xl shadow-[0_0_0_4000px_rgba(0,0,0,0.7)] pointer-events-none border border-white/30">
                </div>

                <!-- Corner Indicators -->
                <div class="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[#1ce783] rounded-tl-2xl"></div>
                <div class="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-[#1ce783] rounded-tr-2xl"></div>
                <div class="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-[#1ce783] rounded-bl-2xl">
                </div>
                <div class="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[#1ce783] rounded-br-2xl">
                </div>

                <!-- Laser Sweep -->
                <div v-show="!isExtracting"
                    class="scan-laser absolute left-4 right-4 h-[2px] bg-[#1ce783] rounded-full shadow-[0_0_10px_#1ce783,0_0_20px_#1ce783]">
                </div>
            </div>

            <p
                class="absolute bottom-24 left-0 right-0 text-center text-white/90 font-bold text-sm tracking-widest uppercase z-20 px-8">
                {{ isExtracting ? 'Extracting Text...' : promptText }}
            </p>
        </div>

        <!-- Footer Overlay -->
        <div
            class="h-40 bg-gradient-to-t from-black to-transparent z-10 shrink-0 flex items-center justify-center pb-6">
            <button @click="captureAndExtract" :disabled="isExtracting"
                class="relative w-20 h-20 rounded-full border-4 border-[#1ce783] text-[#1ce783] flex items-center justify-center group active:scale-90 transition-all outline-none overflow-hidden bg-black/40 backdrop-blur-md">

                <span v-if="isExtracting" class="material-icons animate-spin">autorenew</span>
                <span v-else class="material-icons text-3xl">text_snippet</span>
            </button>
        </div>

        <!-- White Flash Overlay -->
        <div v-if="showingFlash" class="absolute inset-0 bg-white z-[10000] transition-opacity duration-100 ease-out"
            :class="showingFlash ? 'opacity-100' : 'opacity-0'"></div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { Capacitor } from '@capacitor/core'
import { CameraPreview } from '@capacitor-community/camera-preview'
import { Ocr } from '@capacitor-community/image-to-text'
import { Haptics, ImpactStyle } from '@capacitor/haptics'

const props = defineProps({
    promptText: { type: String, default: 'Fit dashboard text inside frame' }
})
const emit = defineEmits(['close', 'extracted'])

const isOpen = ref(true)
const isExtracting = ref(false)
const showingFlash = ref(false)
const flashOn = ref(false)
const isNative = Capacitor.isNativePlatform()

onMounted(async () => {
    if (isNative) {
        document.body.classList.add('camera-preview-transparent')
        document.documentElement.classList.add('camera-preview-transparent')

        const cameraOptions = {
            position: 'rear',
            parent: 'cameraPreview',
            className: 'cameraPreview',
            toBack: true,
            enableZoom: true,
        }

        await CameraPreview.start(cameraOptions).catch(e => console.error(e))
    }
})

onUnmounted(() => {
    stopCamera()
})

async function captureAndExtract() {
    if (isExtracting.value) return
    isExtracting.value = true

    // UI Flash effect
    showingFlash.value = true
    Haptics.impact({ style: ImpactStyle.Heavy }).catch(() => { })
    setTimeout(() => { showingFlash.value = false }, 50)

    if (Capacitor.isNativePlatform()) {
        try {
            // Take high quality photo
            const result = await CameraPreview.capture({ quality: 90 })
            const base64Pic = result.value

            // Send base64 to image-to-text OCR
            const ocrResult = await Ocr.detectText({ base64Image: base64Pic })
            const extractedText = ocrResult.textElements.map(el => el.text).join(' ')

            emit('extracted', { text: extractedText, base64: base64Pic })
            closeModal()
        } catch (e) {
            console.error('OCR Extraction failed', e)
            alert('Failed to extract text. Try again clearly.')
            isExtracting.value = false
        }
    } else {
        // Fallback simulated extraction
        setTimeout(() => {
            emit('extracted', { text: '124,530 KM', base64: 'MOCK_BASE64' })
            closeModal()
        }, 1500)
    }
}

async function toggleTorch() {
    flashOn.value = !flashOn.value
    if (Capacitor.isNativePlatform()) {
        CameraPreview.setFlashMode({ flashMode: flashOn.value ? 'torch' : 'off' }).catch(() => { })
    }
}

async function stopCamera() {
    if (Capacitor.isNativePlatform()) {
        document.body.classList.remove('camera-preview-transparent')
        document.documentElement.classList.remove('camera-preview-transparent')
        await CameraPreview.stop().catch(() => { })
    }
}

function closeModal() {
    isOpen.value = false
    stopCamera()
    emit('close')
}
</script>

<style scoped>
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

.scanner-backdrop {
    background: radial-gradient(circle, transparent 40%, rgba(0, 0, 0, 0.8) 100%);
}
</style>
