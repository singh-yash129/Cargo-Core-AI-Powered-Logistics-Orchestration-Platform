import { ref } from 'vue'
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera'
import { Capacitor } from '@capacitor/core'

/**
 * Composable for Capacitor Camera integration.
 * Provides takePhoto() and scanDocument() methods that launch the native camera.
 * Falls back gracefully in browser (web dev) mode.
 */
export function useCamera() {
    const isCapturing = ref(false)
    const lastError = ref('')

    /**
     * Take a photo using the native camera.
     * @param {Object} opts - Optional overrides
     * @param {string} opts.promptLabel - Action sheet prompt label
     * @param {boolean} opts.allowGallery - Allow picking from gallery (default true)
     * @returns {Promise<{base64: string, format: string} | null>}
     */
    async function takePhoto(opts = {}) {
        isCapturing.value = true
        lastError.value = ''
        try {
            const image = await Camera.getPhoto({
                resultType: CameraResultType.Base64,
                source: opts.allowGallery === false ? CameraSource.Camera : CameraSource.Prompt,
                quality: 80,
                allowEditing: false,
                promptLabelHeader: opts.promptLabel || 'Capture Photo',
                promptLabelPhoto: 'From Gallery',
                promptLabelPicture: 'Take Photo',
                width: 1280,
                height: 960,
            })
            return { base64: image.base64String, format: image.format || 'jpeg' }
        } catch (err) {
            if (err?.message?.includes('cancelled') || err?.message?.includes('User cancelled')) {
                return null
            }
            lastError.value = err.message || 'Camera error'
            console.warn('[useCamera] takePhoto error:', err)
            return null
        } finally {
            isCapturing.value = false
        }
    }

    /**
     * Capture a document photo (fuel receipt, odometer scan, etc.)
     * Uses camera-only source (no gallery) for compliance.
     * @param {string} label - Prompt label
     * @returns {Promise<{base64: string, format: string} | null>}
     */
    async function scanDocument(label = 'Scan Document') {
        return takePhoto({ promptLabel: label, allowGallery: false })
    }

    /**
     * Check if native camera is available (Capacitor native platform).
     */
    const isNative = Capacitor.isNativePlatform()

    return { takePhoto, scanDocument, isCapturing, lastError, isNative }
}
