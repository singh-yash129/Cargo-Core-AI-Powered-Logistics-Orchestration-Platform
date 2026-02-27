<template>
    <div v-if="isOpen" class="fixed inset-0 z-[100] flex items-center justify-center animate-fade-in px-4">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="closeModal"></div>

        <!-- Modal Content -->
        <div
            class="relative w-full max-w-lg bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700 animate-slide-up">

            <!-- Header -->
            <div
                class="px-6 py-4 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-gray-50 dark:bg-white/5">
                <h3 class="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <span class="material-symbols-outlined text-primary">qr_code_scanner</span>
                    Scan Item Input
                </h3>
                <button @click="closeModal"
                    class="text-gray-400 hover:text-red-500 transition-colors p-1 rounded hover:bg-gray-200 dark:hover:bg-white/10">
                    <span class="material-symbols-outlined">close</span>
                </button>
            </div>

            <!-- Global Scanner Listener (Invisible) -->
            <!-- The logic handles keydown events to detect real scanners -->

            <!-- Tabs -->
            <div class="flex border-b border-gray-100 dark:border-white/5">
                <button @click="activeTab = 'scan'"
                    class="flex-1 py-3 text-sm font-bold border-b-2 transition-colors flex items-center justify-center gap-2"
                    :class="activeTab === 'scan' ? 'border-primary text-primary' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'">
                    <span class="material-symbols-outlined text-[18px]">barcode_scanner</span>
                    Device Scan
                </button>
                <button @click="activeTab = 'manual'"
                    class="flex-1 py-3 text-sm font-bold border-b-2 transition-colors flex items-center justify-center gap-2"
                    :class="activeTab === 'manual' ? 'border-primary text-primary' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'">
                    <span class="material-symbols-outlined text-[18px]">keyboard</span>
                    Manual Entry
                </button>
                <button @click="activeTab = 'camera'"
                    class="flex-1 py-3 text-sm font-bold border-b-2 transition-colors flex items-center justify-center gap-2"
                    :class="activeTab === 'camera' ? 'border-primary text-primary' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'">
                    <span class="material-symbols-outlined text-[18px]">photo_camera</span>
                    Camera
                </button>
            </div>

            <div class="p-6">
                <!-- 1. Device Scan View -->
                <div v-if="activeTab === 'scan'" class="text-center space-y-6">
                    <div
                        class="relative w-48 h-48 mx-auto bg-gray-100 dark:bg-black/30 rounded-xl flex items-center justify-center overflow-hidden border border-gray-200 dark:border-gray-700">
                        <!-- Simulated Scanner Hardware Readiness -->
                        <span
                            class="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600 animate-pulse">document_scanner</span>

                        <!-- Simulated laser line -->
                        <div
                            class="absolute inset-x-0 h-0.5 bg-red-500/50 shadow-[0_0_15px_3px_rgba(239,68,68,0.5)] animate-scan-line">
                        </div>
                    </div>

                    <div>
                        <h4 class="font-bold text-gray-900 dark:text-white">Ready to Scan</h4>
                        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Point your hardware scanner at the barcode and scan. The system will automatically detect
                            the input.
                        </p>
                    </div>

                    <div
                        class="inline-flex items-center gap-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 px-3 py-1.5 rounded-lg text-xs font-bold border border-green-200 dark:border-green-500/30">
                        <span class="material-symbols-outlined text-[16px]">usb</span>
                        Listening for hardware scanner...
                    </div>

                    <div v-if="buffer"
                        class="text-xs text-left font-mono bg-gray-50 dark:bg-black/50 p-2 rounded mt-4 border border-gray-200 dark:border-gray-700">
                        <span class="text-gray-400">Buffer:</span> {{ buffer }}
                    </div>

                    <button @click="connectUsbScanner"
                        class="mt-6 px-4 py-2 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 rounded font-bold transition-colors text-xs flex items-center gap-2 mx-auto border border-gray-200 dark:border-white/10">
                        <span class="material-symbols-outlined text-[16px]">usb</span> Pair WebUSB Scanner
                    </button>
                    <div v-if="usbDeviceName"
                        class="text-xs text-green-500 mt-2 font-bold flex items-center justify-center gap-1">
                        <span class="material-symbols-outlined text-[14px]">check_circle</span> Connected: {{
                        usbDeviceName }}
                    </div>
                </div>

                <!-- 2. Manual Entry View -->
                <div v-if="activeTab === 'manual'" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Enter Barcode /
                            Tracking Number</label>
                        <input ref="manualInputRef" type="text" v-model="manualData" placeholder="e.g. RMA-3321"
                            @keyup.enter="submitManualData"
                            class="w-full bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-lg p-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono text-lg uppercase" />
                    </div>

                    <div class="grid grid-cols-2 gap-3 mt-6">
                        <button @click="closeModal"
                            class="px-4 py-2 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 rounded font-bold transition-colors">
                            Cancel
                        </button>
                        <button @click="submitManualData" :disabled="!manualData"
                            class="px-4 py-2 bg-primary hover:bg-primary-dark text-background-dark rounded font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2">
                            Submit <span class="material-symbols-outlined text-[18px]">send</span>
                        </button>
                    </div>
                </div>

                <!-- 3. Real Camera Capture View -->
                <div v-if="activeTab === 'camera'" class="text-center space-y-4">
                    <div
                        class="relative w-full aspect-video mx-auto bg-black rounded-xl flex items-center justify-center overflow-hidden border border-gray-300 dark:border-gray-700 group">
                        <!-- Live Video Feed -->
                        <video ref="videoRef" class="w-full h-full object-cover" autoplay playsinline></video>
                        <canvas ref="canvasRef" class="hidden"></canvas>

                        <!-- Captured Photo Overlay -->
                        <img v-if="photoData" :src="photoData"
                            class="absolute inset-0 w-full h-full object-cover z-10" />

                        <!-- Camera Viewfinder UI -->
                        <div v-if="!photoData" class="absolute inset-4 pointer-events-none z-20">
                            <div class="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-primary/50"></div>
                            <div class="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-primary/50"></div>
                            <div class="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-primary/50"></div>
                            <div class="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-primary/50">
                            </div>
                        </div>

                        <!-- Error State -->
                        <div v-if="cameraError"
                            class="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-4 z-30">
                            <span class="material-symbols-outlined text-4xl text-red-500 mb-2">error</span>
                            <div class="text-sm font-bold text-red-400">{{ cameraError }}</div>
                        </div>
                    </div>

                    <div class="flex justify-between items-center px-2">
                        <button v-if="photoData" @click="retakePhoto"
                            class="text-xs text-gray-500 hover:text-gray-900 dark:hover:text-white font-bold transition-colors">
                            Retake Photo
                        </button>
                        <div v-else class="text-xs text-gray-500">Live feed active</div>

                        <button v-if="!photoData" @click="takeRealPhoto" :disabled="!!cameraError"
                            class="px-6 py-2 bg-primary hover:bg-primary-dark text-background-dark rounded font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center gap-2">
                            <span class="material-symbols-outlined text-[18px]">camera</span> Capture
                        </button>
                        <button v-else @click="submitRealPhoto"
                            class="px-6 py-2 bg-green-500 hover:bg-green-600 text-white dark:text-gray-900 rounded font-bold transition-colors text-sm flex items-center gap-2">
                            <span class="material-symbols-outlined text-[18px]">check</span> Use Photo
                        </button>
                    </div>
                </div>

            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'

const props = defineProps({
    isOpen: {
        type: Boolean,
        default: false
    },
    defaultTab: {
        type: String,
        default: 'scan' // scan, manual, camera
    }
})

const emit = defineEmits(['close', 'scan', 'camera'])

const activeTab = ref(props.defaultTab)
const manualData = ref('')
const photoTaken = ref(false)

// Hardware Scanner Detection State
const buffer = ref('')
const lastKeyTime = ref(0)
const usbDeviceName = ref(null)
const SCANNER_TIMING_THRESHOLD_MS = 30 // Typically barcode scanners type extremely fast (< 20ms per char)
const MIN_BARCODE_LENGTH = 3

// Camera state
const videoRef = ref(null)
const canvasRef = ref(null)
const photoData = ref(null)
const cameraError = ref('')
let mediaStream = null

// Refs
const manualInputRef = ref(null)

// Watcher to reset state and focus input when modal opens
watch(() => props.isOpen, async (newVal) => {
    if (newVal) {
        activeTab.value = props.defaultTab
        buffer.value = ''
        manualData.value = ''
        photoTaken.value = false
        photoData.value = null
        usbDeviceName.value = null
        cameraError.value = ''

        if (activeTab.value === 'manual') {
            await nextTick()
            manualInputRef.value?.focus()
        } else if (activeTab.value === 'camera') {
            await startCamera()
        }
    } else {
        stopCamera()
    }
})

// Watch tab change to handle focus and camera streams
watch(activeTab, async (newVal, oldVal) => {
    if (oldVal === 'camera') {
        stopCamera()
    }

    if (newVal === 'manual') {
        await nextTick()
        manualInputRef.value?.focus()
    } else if (newVal === 'camera') {
        await startCamera()
    }
})

const closeModal = () => {
    stopCamera()
    emit('close')
}

const submitManualData = () => {
    if (manualData.value.trim()) {
        const payload = manualData.value.trim().toUpperCase()
        emit('scan', payload)
        closeModal()
    }
}

const connectUsbScanner = async () => {
    try {
        // Triggers the browser's hardware permission prompt to physically pair a WebUSB device
        const device = await navigator.usb.requestDevice({ filters: [] })
        if (device) {
            usbDeviceName.value = device.productName || 'USB Scanner'
            console.log("Hardware device permitted:", device)
        }
    } catch (err) {
        console.error("USB connection error or cancelled:", err)
    }
}

// ------ NATIVE CAMERA API ------ //

const startCamera = async () => {
    cameraError.value = ''
    try {
        await nextTick()
        mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        if (videoRef.value) {
            videoRef.value.srcObject = mediaStream
        }
    } catch (err) {
        console.error("Camera access denied or failed:", err)
        cameraError.value = 'Camera access denied. Please grant browser permissions.'
    }
}

const stopCamera = () => {
    if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop())
        mediaStream = null
    }
}

const takeRealPhoto = () => {
    if (!videoRef.value || !canvasRef.value) return
    const video = videoRef.value
    const canvas = canvasRef.value
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height)
    photoData.value = canvas.toDataURL('image/jpeg')
}

const retakePhoto = () => {
    photoData.value = null
}

const submitRealPhoto = () => {
    emit('camera', photoData.value || 'captured_image_data_mock')
    closeModal()
}

// ------ SMART HARDWARE SCANNER DETECTION ------ //

const handleGlobalKeyDown = (e) => {
    // Only process global keydowns if the modal is open, we are on the scan tab, 
    // and the user is NOT typing inside an input field.
    if (!props.isOpen || activeTab.value !== 'scan') return;

    // Ignore if target is an input or textarea
    const activeTagName = document.activeElement?.tagName?.toLowerCase()
    if (activeTagName === 'input' || activeTagName === 'textarea') return;

    // Ignore modifier keys
    if (e.ctrlKey || e.metaKey || e.altKey) return;

    const currentTime = Date.now();
    const elapsedTime = currentTime - lastKeyTime.value;

    // Check timing. If it's been a long time since the last keypress (> threshold),
    // it's likely human typing, so reset the buffer.
    if (elapsedTime > SCANNER_TIMING_THRESHOLD_MS && buffer.value.length > 0) {
        buffer.value = '';
    }

    lastKeyTime.value = currentTime;

    // Handle string building and submit
    if (e.key === 'Enter') {
        if (buffer.value.length >= MIN_BARCODE_LENGTH) {
            // Scanner finished reading
            e.preventDefault()
            const finalRead = buffer.value.toUpperCase()
            emit('scan', finalRead)

            // Visual feedback before closing (optional, can just close instantly)
            setTimeout(() => {
                closeModal()
            }, 100)

            buffer.value = ''
            return
        }
        buffer.value = '' // Enter pressed but too short, reset
    } else if (e.key.length === 1) { // Normal character
        buffer.value += e.key;
    }
}

onMounted(() => {
    window.addEventListener('keydown', handleGlobalKeyDown)
})

onUnmounted(() => {
    window.removeEventListener('keydown', handleGlobalKeyDown)
    stopCamera()
})
</script>

<style scoped>
@keyframes scan-line {
    0% {
        top: 0;
    }

    50% {
        top: 100%;
    }

    100% {
        top: 0;
    }
}

.animate-scan-line {
    animation: scan-line 2s linear infinite;
}
</style>
