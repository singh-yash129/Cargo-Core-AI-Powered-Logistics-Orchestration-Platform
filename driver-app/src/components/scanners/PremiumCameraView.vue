<template>
    <div class="flex flex-col h-full font-sans select-none"
        :class="isNative ? 'bg-transparent' : 'bg-gray-900'">

        <!-- ── Top Controls ────────────────────────── -->
        <div class="h-28 bg-gradient-to-b from-black/80 to-transparent flex items-start justify-between px-6 pt-12 z-10 shrink-0">
            <button @touchstart="onClose" @click="onClose"
                class="w-11 h-11 rounded-full bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center text-white active:scale-90 transition-transform">
                <span class="material-icons">close</span>
            </button>
            <div class="flex items-center gap-4">
                <button @touchstart="toggleFlash" @click="toggleFlash"
                    class="w-11 h-11 rounded-full bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center active:scale-90 transition-transform"
                    :class="flashMode === 'on' ? 'text-yellow-300' : 'text-white'">
                    <span class="material-icons text-sm">{{ flashMode === 'off' ? 'flash_off' : 'flash_on' }}</span>
                </button>
                <button @touchstart="flipCamera" @click="flipCamera"
                    class="w-11 h-11 rounded-full bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center text-white active:scale-90 transition-transform">
                    <span class="material-icons text-sm">cameraswitch</span>
                </button>
            </div>
        </div>

        <!-- ── Viewfinder ──────────────────────────── -->
        <div class="flex-1 relative flex flex-col items-center justify-center z-10 pointer-events-none">
            <div class="absolute inset-4 border border-white/20 rounded-3xl">
                <!-- Crosshair -->
                <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center opacity-30">
                    <div class="w-8 h-px bg-white"></div>
                    <div class="w-px h-8 bg-white absolute"></div>
                </div>
                <!-- Corner brackets -->
                <div class="absolute top-8 left-8 w-6 h-6 border-t-2 border-l-2 border-white/50 rounded-tl-lg"></div>
                <div class="absolute top-8 right-8 w-6 h-6 border-t-2 border-r-2 border-white/50 rounded-tr-lg"></div>
                <div class="absolute bottom-8 left-8 w-6 h-6 border-b-2 border-l-2 border-white/50 rounded-bl-lg"></div>
                <div class="absolute bottom-8 right-8 w-6 h-6 border-b-2 border-r-2 border-white/50 rounded-br-lg"></div>
            </div>

            <div v-if="store.promptText"
                class="absolute bottom-12 bg-black/50 backdrop-blur-md px-6 py-2 rounded-full text-white tracking-widest uppercase text-[10px] font-bold border border-white/10">
                {{ store.promptText }}
            </div>
        </div>

        <!-- ── Shutter ─────────────────────────────── -->
        <div class="h-40 bg-gradient-to-t from-black to-transparent z-10 shrink-0 flex items-center justify-center pb-6 relative">
            <button @touchstart="takePicture" @click="takePicture" :disabled="capturing"
                class="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center active:scale-90 transition-transform duration-150 outline-none overflow-hidden relative"
                style="pointer-events: auto; touch-action: manipulation;">
                <div class="absolute inset-[6px] rounded-full bg-white/90 flex items-center justify-center"
                    :class="{ 'scale-95': capturing }">
                    <span v-if="capturing" class="material-icons animate-spin text-gray-800 text-sm">sync</span>
                </div>
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
import { Haptics, ImpactStyle } from '@capacitor/haptics'
import { useCameraBridgeStore } from '../../stores/cameraBridgeStore.js'

const store = useCameraBridgeStore()
const router = useRouter()
const isNative = Capacitor.isNativePlatform()
const capturing = ref(false)
const showingFlash = ref(false)
const flashMode = ref('off')
const cameraFacing = ref('rear')

onMounted(async () => {
    if (!isNative) return
    document.documentElement.classList.add('camera-active')
    await CameraPreview.start({
        position: cameraFacing.value,
        toBack: true,
        enableZoom: true,
    }).catch(e => console.error('CameraPreview start error', e))
})

onUnmounted(() => stopCamera())

async function takePicture() {
    if (capturing.value) return
    capturing.value = true
    showingFlash.value = true
    await Haptics.impact({ style: ImpactStyle.Heavy }).catch(() => {})
    setTimeout(() => { showingFlash.value = false }, 80)

    try {
        const result = await CameraPreview.capture({ quality: 90 })
        const base64Pic = result.value
        await stopCamera()
        store.deliver(base64Pic)
        router.back()
    } catch (e) {
        alert('Emulator camera capture failed. Simulating photo for testing.')
        await stopCamera()
        // Mock 1x1 transparent PNG
        store.deliver('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=')
        router.back()
    }
}

async function flipCamera() {
    await CameraPreview.flip().catch(() => {})
    cameraFacing.value = cameraFacing.value === 'rear' ? 'front' : 'rear'
    await Haptics.impact({ style: ImpactStyle.Light }).catch(() => {})
}

async function toggleFlash() {
    flashMode.value = flashMode.value === 'off' ? 'on' : 'off'
    await CameraPreview.setFlashMode({ flashMode: flashMode.value }).catch(() => {})
}

async function stopCamera() {
    if (!isNative) return
    document.documentElement.classList.remove('camera-active')
    await CameraPreview.stop().catch(() => {})
}

async function onClose() {
    await stopCamera()
    store.cancel()
    router.back()
}
</script>

<style scoped>
.flash-enter-active { transition: opacity 0.05s; }
.flash-leave-active { transition: opacity 0.15s ease-out; }
.flash-enter-from, .flash-leave-to { opacity: 0; }
</style>
