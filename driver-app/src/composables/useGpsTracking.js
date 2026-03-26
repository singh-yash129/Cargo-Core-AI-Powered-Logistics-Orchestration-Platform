import { ref, computed } from 'vue'
import { Geolocation } from '@capacitor/geolocation'
import { getSimulatedGPS, isWithinGeofence, calculateDistance } from '../utils/geofence.js'

/**
 * GPS Tracking Composable
 * Simulated version for demo - uses device GPS when available
 *
 * Production: Would send updates to backend every 30 seconds
 * Demo: Logs to console and updates local state
 */
export function useGpsTracking() {
    const currentLocation = ref(null)
    const isTracking = ref(false)
    const trackingError = ref(null)
    let watchId = null
    let simulationInterval = null

    const hasLocation = computed(() => currentLocation.value !== null)

    /**
     * Start GPS tracking
     * @param {boolean} useSimulation - Use simulated GPS if true (for emulator/testing)
     */
    async function startTracking(useSimulation = false) {
        if (isTracking.value) return

        isTracking.value = true
        trackingError.value = null

        if (useSimulation) {
            // Simulated GPS for emulator/demo
            startSimulatedTracking()
        } else {
            // Real device GPS
            try {
                // Request permission first
                const permission = await Geolocation.checkPermissions()
                if (permission.location !== 'granted') {
                    const requested = await Geolocation.requestPermissions()
                    if (requested.location !== 'granted') {
                        throw new Error('GPS permission denied')
                    }
                }

                // Start watching position
                watchId = await Geolocation.watchPosition(
                    {
                        enableHighAccuracy: true,
                        timeout: 30000,
                        maximumAge: 0
                    },
                    (position, err) => {
                        if (err) {
                            console.error('GPS error:', err)
                            trackingError.value = err.message
                            // Fallback to simulation if real GPS fails
                            startSimulatedTracking()
                            return
                        }

                        if (position) {
                            currentLocation.value = {
                                lat: position.coords.latitude,
                                lng: position.coords.longitude,
                                accuracy: position.coords.accuracy,
                                speed: position.coords.speed || 0,
                                heading: position.coords.heading || 0,
                                timestamp: new Date(position.timestamp).toISOString(),
                                isMocked: false // TODO: Detect mocked GPS on Android
                            }

                            console.log('📍 Real GPS Update:', currentLocation.value)

                            // In production: send to backend
                            // await api.sendLocationUpdate(currentLocation.value)
                        }
                    }
                )
            } catch (e) {
                console.error('Failed to start real GPS, using simulation:', e)
                trackingError.value = e.message
                startSimulatedTracking()
            }
        }
    }

    function startSimulatedTracking() {
        console.log('📍 Starting simulated GPS tracking')

        // Update every 5 seconds
        simulationInterval = setInterval(() => {
            currentLocation.value = getSimulatedGPS()
            console.log('📍 Simulated GPS:', currentLocation.value)
        }, 5000)

        // Set initial position immediately
        currentLocation.value = getSimulatedGPS()
    }

    function stopTracking() {
        if (!isTracking.value) return

        if (watchId !== null) {
            Geolocation.clearWatch({ id: watchId })
            watchId = null
        }

        if (simulationInterval) {
            clearInterval(simulationInterval)
            simulationInterval = null
        }

        isTracking.value = false
        console.log('📍 GPS tracking stopped')
    }

    /**
     * Get current position once (no continuous tracking)
     */
    async function getCurrentPosition(useSimulation = false) {
        if (useSimulation) {
            return getSimulatedGPS()
        }

        try {
            const position = await Geolocation.getCurrentPosition({
                enableHighAccuracy: true,
                timeout: 10000
            })

            return {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
                accuracy: position.coords.accuracy,
                speed: position.coords.speed || 0,
                heading: position.coords.heading || 0,
                timestamp: new Date(position.timestamp).toISOString(),
                isMocked: false
            }
        } catch (e) {
            console.error('Failed to get position, using simulation:', e)
            return getSimulatedGPS()
        }
    }

    /**
     * Check if current location is within geofence of target
     * @param {object} target - { lat, lng }
     * @param {number} radiusMeters - Geofence radius (default: 50m)
     * @returns {object} { isWithin, distance }
     */
    function checkGeofence(target, radiusMeters = 50) {
        if (!currentLocation.value || !target) {
            return { isWithin: false, distance: null }
        }

        const distance = calculateDistance(
            currentLocation.value.lat,
            currentLocation.value.lng,
            target.lat,
            target.lng
        )

        return {
            isWithin: distance <= radiusMeters,
            distance,
            distanceFromGeofence: Math.max(0, distance - radiusMeters)
        }
    }

    return {
        currentLocation,
        isTracking,
        trackingError,
        hasLocation,
        startTracking,
        stopTracking,
        getCurrentPosition,
        checkGeofence
    }
}
