<template>
    <div v-if="isOpen" class="fixed inset-0 z-[9999] bg-transparent flex flex-col font-sans">

        <!-- Top Controls -->
        <div
            class="h-28 bg-gradient-to-b from-black/80 to-transparent flex items-start justify-between px-6 pt-12 z-10 shrink-0">
            <button @click="closeModal"
                class="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white border border-white/20 active:scale-95 transition-all">
                <span class="material-icons">close</span>
            </button>

            <div class="flex items-center gap-4">
                <button @click="toggleFlash"
                    class="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white border border-white/20 active:scale-95 transition-all">
                    <span class="material-icons text-sm">{{ flashMode === 'off' ? 'flash_off' : 'flash_on' }}</span>
                </button>
                <button @click="flipCamera"
                    class="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white border border-white/20 active:scale-95 transition-all">
                    <span class="material-icons text-sm">cameraswitch</span>
                </button>
            </div>
        </div>

        <!-- Viewfinder Center -->
        <div class="flex-1 relative flex flex-col items-center justify-center z-10 pointer-events-none">
            <!-- Full screen framing guides -->
            <div class="absolute inset-4 border border-white/20 rounded-3xl">
                <!-- Center Crosshair -->
                <div
                    class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center opacity-30">
                    <div class="w-8 h-px bg-white"></div>
                    <div class="w-px h-8 bg-white absolute"></div>
                </div>

                <!-- Corner focus brackets -->
                <div class="absolute top-8 left-8 w-6 h-6 border-t-2 border-l-2 border-white/50 rounded-tl-lg"></div>
                <div class="absolute top-8 right-8 w-6 h-6 border-t-2 border-r-2 border-white/50 rounded-tr-lg"></div>
                <div class="absolute bottom-8 left-8 w-6 h-6 border-b-2 border-l-2 border-white/50 rounded-bl-lg"></div>
                <div class="absolute bottom-8 right-8 w-6 h-6 border-b-2 border-r-2 border-white/50 rounded-br-lg">
                </div>
            </div>

            <div v-if="promptText"
                class="absolute bottom-12 bg-black/50 backdrop-blur-md px-6 py-2 rounded-full text-white tracking-widest uppercase text-[10px] font-bold border border-white/10">
                {{ promptText }}
            </div>
        </div>

        <!-- Shutter Area -->
        <div
            class="h-40 bg-gradient-to-t from-black to-transparent z-10 shrink-0 flex items-center justify-center pb-6">

            <!-- Filter/Mode track mock -->
            <div
                class="absolute left-8 text-white/50 uppercase tracking-widest text-[9px] font-bold flex flex-col gap-3 items-center">
                <span>Auto</span>
                <span class="text-primary">•</span>
            </div>

            <button @click="takePicture" :disabled="isCapturing"
                class="relative w-20 h-20 rounded-full border-4 border-white flex items-center justify-center group active:scale-90 transition-transform duration-200 outline-none overflow-hidden">
                <div class="absolute inset-1 rounded-full bg-white/90 group-active:bg-white transition-colors flex items-center justify-center"
                    :class="{ 'scale-95': isCapturing }">
                    <span v-if="isCapturing" class="material-icons animate-spin text-gray-800 text-sm">sync</span>
                </div>
            </button>

            <!-- Gallery thumbnail mock -->
            <div
                class="absolute right-8 w-12 h-12 rounded-full bg-white/10 border border-white/20 overflow-hidden backdrop-blur-sm">
            </div>

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
import { Haptics, ImpactStyle } from '@capacitor/haptics'

const props = defineProps({
    promptText: { type: String, default: 'PHOTO MODE' }
})
const emit = defineEmits(['close', 'captured'])

const isOpen = ref(true)
const isCapturing = ref(false)
const showingFlash = ref(false)
const flashMode = ref('off')
const currentPosition = ref('rear')

onMounted(async () => {
    if (Capacitor.isNativePlatform()) {
        document.body.classList.add('camera-preview-transparent')
        document.documentElement.classList.add('camera-preview-transparent')

        const cameraOptions = {
            position: currentPosition.value,
            parent: 'cameraPreview',
            className: 'cameraPreview',
            toBack: true, // Puts camera behind webview
            enableZoom: true,
        }

        await CameraPreview.start(cameraOptions).catch(e => console.error(e))
    }
})

onUnmounted(() => {
    stopCamera()
})

async function takePicture() {
    if (isCapturing.value) return
    isCapturing.value = true

    // UI Flash effect
    showingFlash.value = true
    Haptics.impact({ style: ImpactStyle.Heavy }).catch(() => { })

    setTimeout(() => { showingFlash.value = false }, 50)

    if (Capacitor.isNativePlatform()) {
        try {
            const result = await CameraPreview.capture({
                quality: 85,
            })
            // Returns base64 string
            const base64Pic = result.value
            emit('captured', base64Pic)
            closeModal()
        } catch (e) {
            console.error('Capture failed', e)
            alert('Failed to capture photo')
            isCapturing.value = false
        }
    } else {
        // Fallback simulated photo
        setTimeout(() => {
            emit('captured', 'MOCK_BASE_64_IMAGE_DATA')
            closeModal()
        }, 1000)
    }
}

async function flipCamera() {
    if (Capacitor.isNativePlatform()) {
        try {
            await CameraPreview.flip()
            currentPosition.value = currentPosition.value === 'rear' ? 'front' : 'rear'
            Haptics.impact({ style: ImpactStyle.Light })
        } catch (e) { }
    }
}

async function toggleFlash() {
    flashMode.value = flashMode.value === 'off' ? 'on' : 'off'
    if (Capacitor.isNativePlatform()) {
        CameraPreview.setFlashMode({ flashMode: flashMode.value }).catch(() => { })
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

<style>
/* Global styles to make capacitor webview totally transparent */
html.camera-preview-transparent,
body.camera-preview-transparent,
.camera-preview-transparent #app {
    background: transparent !important;
    background-color: transparent !important;
}
</style>
