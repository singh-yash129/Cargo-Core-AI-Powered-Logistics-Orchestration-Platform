/**
 * Geofence Utilities
 * Calculate distances, check if driver is within geofence radius
 * Uses Haversine formula for accurate lat/lng distance calculation
 */

/**
 * Calculate distance between two GPS coordinates (Haversine formula)
 * @param {number} lat1 - Latitude of point 1
 * @param {number} lng1 - Longitude of point 1
 * @param {number} lat2 - Latitude of point 2
 * @param {number} lng2 - Longitude of point 2
 * @returns {number} Distance in meters
 */
export function calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371e3 // Earth radius in meters
    const φ1 = (lat1 * Math.PI) / 180
    const φ2 = (lat2 * Math.PI) / 180
    const Δφ = ((lat2 - lat1) * Math.PI) / 180
    const Δλ = ((lng2 - lng1) * Math.PI) / 180

    const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const distance = R * c

    return distance
}

/**
 * Check if current location is within geofence radius
 * @param {number} currentLat - Current latitude
 * @param {number} currentLng - Current longitude
 * @param {number} targetLat - Target latitude
 * @param {number} targetLng - Target longitude
 * @param {number} radiusMeters - Geofence radius in meters (default: 50m)
 * @returns {boolean} True if within geofence
 */
export function isWithinGeofence(currentLat, currentLng, targetLat, targetLng, radiusMeters = 50) {
    const distance = calculateDistance(currentLat, currentLng, targetLat, targetLng)
    return distance <= radiusMeters
}

/**
 * Get simulated GPS coordinates (for demo/testing)
 * Simulates movement along Mumbai route
 * @returns {object} { lat, lng, accuracy, speed, heading, timestamp }
 */
export function getSimulatedGPS() {
    // Base location: Mumbai, with slight random variation
    const baseLat = 19.0760
    const baseLng = 72.8777

    return {
        lat: baseLat + (Math.random() * 0.05 - 0.025), // ±2.5km variance
        lng: baseLng + (Math.random() * 0.05 - 0.025),
        accuracy: 10 + Math.random() * 15, // 10-25m accuracy
        speed: 20 + Math.random() * 40, // 20-60 km/h
        heading: Math.random() * 360, // Random direction
        timestamp: new Date().toISOString(),
        isMocked: false // In production, detect if GPS is mocked
    }
}

/**
 * Simulate approaching a target location
 * Returns coordinates that get closer to target over time
 * @param {object} target - { lat, lng }
 * @param {number} progress - 0 to 1 (how close to target)
 * @returns {object} GPS coordinates
 */
export function getApproachingGPS(target, progress = 0.5) {
    const currentLat = 19.0760 + ((target.lat - 19.0760) * progress)
    const currentLng = 72.8777 + ((target.lng - 72.8777) * progress)

    return {
        lat: currentLat,
        lng: currentLng,
        accuracy: 10 + Math.random() * 5,
        speed: 30 + Math.random() * 20,
        heading: Math.atan2(target.lng - currentLng, target.lat - currentLat) * (180 / Math.PI),
        timestamp: new Date().toISOString(),
        isMocked: false
    }
}

/**
 * Format distance for display
 * @param {number} meters - Distance in meters
 * @returns {string} Formatted distance
 */
export function formatDistance(meters) {
    if (meters < 1000) {
        return `${Math.round(meters)}m`
    }
    return `${(meters / 1000).toFixed(1)}km`
}

/**
 * Get distance status color class
 * @param {number} meters - Distance in meters
 * @param {number} threshold - Geofence threshold in meters
 * @returns {string} Color class
 */
export function getDistanceColorClass(meters, threshold = 50) {
    if (meters <= threshold) return 'text-green-500'
    if (meters <= threshold * 5) return 'text-yellow-500'
    return 'text-gray-400'
}
