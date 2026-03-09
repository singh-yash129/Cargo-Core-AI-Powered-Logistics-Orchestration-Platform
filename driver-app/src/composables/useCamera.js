import { ref, render, h } from 'vue'
import { Capacitor } from '@capacitor/core'
import PremiumQrScanner from '../components/scanners/PremiumQrScanner.vue'
import PremiumOcrScanner from '../components/scanners/PremiumOcrScanner.vue'
import PremiumCameraView from '../components/scanners/PremiumCameraView.vue'

export function useCamera() {
    const isCapturing = ref(false)
    const lastError = ref('')

    function mountScanner(Component, propsData) {
        return new Promise((resolve) => {
            // ONLY make app transparent if running on native device with real camera underneath array
            if (Capacitor.isNativePlatform()) {
                document.documentElement.classList.add('camera-active')
            }

            const mountNode = document.createElement('div')
            // Add a class so we can potentially target it if needed
            mountNode.className = 'scanner-mount-point'
            document.body.appendChild(mountNode)

            isCapturing.value = true

            const cleanup = () => {
                isCapturing.value = false
                if (Capacitor.isNativePlatform()) {
                    document.documentElement.classList.remove('camera-active')
                }
                // Small delay to allow fade out animations if they existed
                setTimeout(() => {
                    render(null, mountNode)
                    mountNode.remove()
                }, 50)
            }

            const onClose = () => {
                cleanup()
                resolve(null)
            }

            const onScanned = (data) => {
                cleanup()
                resolve(data)
            }

            const vnode = h(Component, {
                ...propsData,
                onClose,
                onScanned,        // From PremiumQrScanner
                onExtracted: onScanned, // From PremiumOcrScanner
                onCaptured: onScanned   // From PremiumCameraView
            })

            render(vnode, mountNode)
        })
    }

    async function scanQrCode(promptText = 'Scan QR Code') {
        const result = await mountScanner(PremiumQrScanner, { promptText })
        return result // returns string representation of QR code, or null
    }

    async function scanOdometer(promptText = 'Align Dashboard Text') {
        const result = await mountScanner(PremiumOcrScanner, { promptText })
        return result // returns { text, base64 } or null
    }

    async function takePhoto(opts = {}) {
        const base64Pic = await mountScanner(PremiumCameraView, { promptText: opts.promptLabel || 'TAKE PHOTO' })
        if (base64Pic) {
            return { base64: base64Pic, format: 'jpeg' }
        }
        return null
    }

    async function scanDocument(label = 'SCAN DOCUMENT') {
        const base64Pic = await mountScanner(PremiumCameraView, { promptText: label })
        if (base64Pic) {
            return { base64: base64Pic, format: 'jpeg' }
        }
        return null
    }

    const isNative = Capacitor.isNativePlatform()

    return {
        takePhoto,
        scanDocument,
        scanQrCode,
        scanOdometer,
        isCapturing,
        lastError,
        isNative
    }
}
