import { App } from '@capacitor/app'
import { useRouter, useRoute } from 'vue-router'
import { onMounted, onUnmounted } from 'vue'

export function useHardwareBack() {
    const router = useRouter()
    const route = useRoute()
    let backListener = null

    onMounted(async () => {
        try {
            backListener = await App.addListener('backButton', ({ canGoBack }) => {
                // If we correspond to the base routes, exit entirely
                if (route.path === '/' || route.path === '/login' || route.path === '/dashboard') {
                    App.exitApp()
                } else if (canGoBack) {
                    router.back()
                } else {
                    App.exitApp()
                }
            })
        } catch (e) {
            console.warn('App plugin not available, hardware back disabled.')
        }
    })

    onUnmounted(() => {
        if (backListener) backListener.remove()
    })
}
