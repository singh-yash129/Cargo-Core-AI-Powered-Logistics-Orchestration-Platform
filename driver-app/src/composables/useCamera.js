import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCameraBridgeStore } from '../stores/cameraBridgeStore.js'

/**
 * useCamera — Capacitor native-only camera abstraction.
 *
 * Navigates to a dedicated full-screen camera route,
 * awaits the result via cameraBridgeStore, then returns it.
 */
export function useCamera() {
    const isCapturing = ref(false)
    
    // useRouter MUST be called synchronously during the component's setup() phase.
    // By calling it here, it correctly grabs the router instance.
    const router = useRouter()

    async function scanQrCode(promptText = 'Align QR code within frame') {
        const bridge = useCameraBridgeStore()
        isCapturing.value = true
        try {
            return await bridge.openCamera(router, 'qr', promptText)
        } finally {
            isCapturing.value = false
        }
    }

    async function scanOdometer(promptText = 'Align Dashboard Text') {
        const bridge = useCameraBridgeStore()
        isCapturing.value = true
        try {
            return await bridge.openCamera(router, 'ocr', promptText)
        } finally {
            isCapturing.value = false
        }
    }

    async function takePhoto(opts = {}) {
        const bridge = useCameraBridgeStore()
        isCapturing.value = true
        try {
            const base64 = await bridge.openCamera(router, 'photo', opts.promptLabel || 'TAKE PHOTO')
            if (base64) return { base64, format: 'jpeg' }
            return null
        } finally {
            isCapturing.value = false
        }
    }

    async function scanDocument(label = 'SCAN DOCUMENT') {
        return takePhoto({ promptLabel: label })
    }

    return { takePhoto, scanDocument, scanQrCode, scanOdometer, isCapturing }
}
