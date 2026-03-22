import { ref, onMounted, onUnmounted } from 'vue'
import { Capacitor } from '@capacitor/core'
import { useNotificationStore } from '../stores/notificationStore.js'
import { useUiStore } from '../stores/uiStore.js'

/**
 * useLocalNotifications — Composable for in-app local notification system.
 *
 * Works on both native (Capacitor LocalNotifications) and web (in-app banner + store).
 * Provides:
 *  - notify({ title, body, type, route }) — fire a notification
 *  - banner — reactive ref to the currently-displayed banner (or null)
 *  - dismissBanner() — hide the current banner
 *
 * On native platforms, also fires a real OS-level local notification.
 */
export function useLocalNotifications() {
    const notificationStore = useNotificationStore()
    const uiStore = useUiStore()

    const banner = ref(null)
    let bannerTimer = null
    let LocalNotifications = null

    // Try to load Capacitor LocalNotifications (available on native only)
    onMounted(async () => {
        if (Capacitor.isNativePlatform()) {
            try {
                const mod = await import('@capacitor/local-notifications')
                LocalNotifications = mod.LocalNotifications
                // Request permission
                const perm = await LocalNotifications.checkPermissions()
                if (perm.display !== 'granted') {
                    await LocalNotifications.requestPermissions()
                }
            } catch {
                // Plugin not available — fall back to in-app only
                LocalNotifications = null
            }
        }
    })

    onUnmounted(() => {
        if (bannerTimer) clearTimeout(bannerTimer)
    })

    /**
     * Fire a local notification.
     * @param {Object} opts
     * @param {string} opts.title - Notification title
     * @param {string} opts.body  - Notification body text
     * @param {string} [opts.type='info'] - info|success|warning|error|delivery|navigation|system
     * @param {string} [opts.route=null] - Route to navigate to when tapped
     * @param {number} [opts.duration=4000] - Banner display duration (ms)
     */
    async function notify({ title, body, type = 'info', route = null, duration = 4000 }) {
        // 1. Store the notification persistently
        const notification = notificationStore.addNotification({ title, body, type, route })

        // 2. Show an in-app banner
        if (bannerTimer) clearTimeout(bannerTimer)
        banner.value = { ...notification }
        bannerTimer = setTimeout(() => {
            banner.value = null
        }, duration)

        // 3. Haptic feedback
        try {
            if (Capacitor.isNativePlatform()) {
                const { Haptics, ImpactStyle } = await import('@capacitor/haptics')
                await Haptics.impact({ style: ImpactStyle.Medium })
            }
        } catch { /* no-op */ }

        // 4. Native local notification (scheduled immediately)
        if (LocalNotifications) {
            try {
                await LocalNotifications.schedule({
                    notifications: [{
                        title,
                        body,
                        id: Math.floor(notification.id),
                        schedule: { at: new Date() },
                        extra: { route },
                    }]
                })
            } catch { /* native notification failed, in-app banner still shown */ }
        }
    }

    function dismissBanner() {
        banner.value = null
        if (bannerTimer) clearTimeout(bannerTimer)
    }

    return {
        notify,
        banner,
        dismissBanner,
    }
}
