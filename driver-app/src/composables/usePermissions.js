import { Capacitor } from '@capacitor/core'

/**
 * requestAppPermissions
 * ---------------------
 * Requests Camera and Location permissions at boot.
 * Same pattern as LocalNotifications in useLocalNotifications.js:
 *   check → if not granted → request once. OS handles the rest.
 * 
 * Note: Permissions are requested gracefully - errors are logged but don't
 * block app startup. Specific features will request permissions when needed.
 */
export async function requestAppPermissions() {
    if (!Capacitor.isNativePlatform()) return

    // Small delay to ensure native plugins are fully initialized
    await new Promise(resolve => setTimeout(resolve, 500))

    // Camera
    try {
        const { Camera } = await import('@capacitor/camera')
        const status = await Camera.checkPermissions()
        if (status.camera !== 'granted') {
            await Camera.requestPermissions()
        }
    } catch (e) {
        console.warn('Camera permission check skipped:', e.message)
    }

    // Location - check if location permission is granted (handles both precise and coarse)
    try {
        const { Geolocation } = await import('@capacitor/geolocation')
        const status = await Geolocation.checkPermissions()
        // On Android, 'location' covers ACCESS_FINE_LOCATION, 'coarseLocation' covers ACCESS_COARSE_LOCATION
        // We only need one of them to be granted for basic functionality
        const hasLocationPermission = 
            status.location === 'granted' || 
            status.coarseLocation === 'granted'
        
        if (!hasLocationPermission) {
            // Request permissions - the OS will show the appropriate dialog
            await Geolocation.requestPermissions({ permissions: ['location'] })
        }
    } catch (e) {
        // Don't alert on permission errors at startup - features will request when needed
        console.warn('Location permission check skipped:', e.message)
    }
}
