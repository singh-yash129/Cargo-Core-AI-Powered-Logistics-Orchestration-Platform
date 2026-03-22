import { Capacitor } from '@capacitor/core'

/**
 * requestAppPermissions
 * ---------------------
 * Requests Camera and Location permissions at boot.
 * Same pattern as LocalNotifications in useLocalNotifications.js:
 *   check → if not granted → request once. OS handles the rest.
 */
export async function requestAppPermissions() {
    if (!Capacitor.isNativePlatform()) return

    // Camera
    try {
        const { Camera } = await import('@capacitor/camera')
        const status = await Camera.checkPermissions()
        if (status.camera !== 'granted') {
            await Camera.requestPermissions()
        }
    } catch (e) {
        alert('Camera Perm Error: ' + e.message)
    }

    // Location
    try {
        const { Geolocation } = await import('@capacitor/geolocation')
        const status = await Geolocation.checkPermissions()
        if (status.location !== 'granted' && status.coarseLocation !== 'granted') {
            await Geolocation.requestPermissions()
        }
    } catch (e) {
        alert('Location Perm Error: ' + e.message)
    }
}
