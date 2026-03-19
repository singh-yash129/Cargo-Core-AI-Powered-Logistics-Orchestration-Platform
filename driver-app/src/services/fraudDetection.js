/**
 * FraudDetectionService — Security & Validation Layer
 *
 * Validates GPS coordinates, barcode scans, and POD images.
 * Prevents fake GPS, wrong scan, and stale/edited photos.
 *
 * WITH DUMMY DATA — All validations are simulated but structurally correct.
 * In production: integrate real EXIF parsing and server-side validation.
 */

class FraudDetectionService {

    // ── GPS Validation ───────────────────────────────────────────────

    /**
     * Validate GPS coordinates for authenticity.
     * @param {Object} coords - { latitude, longitude, accuracy, altitude, mocked }
     * @returns {{ valid: boolean, error?: string }}
     */
    validateGPS(coords) {
        if (!coords) {
            return { valid: false, error: 'NO_GPS_DATA' }
        }

        // Check if mock location is enabled (Android sets this)
        if (coords.mocked === true) {
            return { valid: false, error: 'FAKE_GPS_DETECTED' }
        }

        // Check accuracy — if > 100m, too inaccurate
        if (coords.accuracy && coords.accuracy > 100) {
            return { valid: false, error: 'GPS_ACCURACY_TOO_LOW', accuracy: coords.accuracy }
        }

        // Sanity check: latitude must be -90 to 90, longitude -180 to 180
        if (
            coords.latitude < -90 || coords.latitude > 90 ||
            coords.longitude < -180 || coords.longitude > 180
        ) {
            return { valid: false, error: 'INVALID_COORDINATES' }
        }

        // Check for zero coordinates (often fake/emulator default)
        if (coords.latitude === 0 && coords.longitude === 0) {
            return { valid: false, error: 'NULL_ISLAND_COORDINATES' }
        }

        return { valid: true }
    }

    /**
     * Detect suspicious GPS speed (teleportation check).
     * @param {Object} lastCoords - Previous GPS reading
     * @param {Object} newCoords - New GPS reading
     * @returns {{ valid: boolean, error?: string, speed?: number }}
     */
    detectTeleportation(lastCoords, newCoords) {
        if (!lastCoords || !newCoords) return { valid: true }

        const timeDiffSeconds = (new Date(newCoords.timestamp) - new Date(lastCoords.timestamp)) / 1000
        if (timeDiffSeconds <= 0) return { valid: true }

        const distanceMeters = this._haversineDistance(
            lastCoords.latitude, lastCoords.longitude,
            newCoords.latitude, newCoords.longitude
        )

        const speedMetersPerSecond = distanceMeters / timeDiffSeconds
        const speedKmh = speedMetersPerSecond * 3.6

        // If speed > 200 km/h, suspicious (trucks can't go that fast)
        if (speedKmh > 200) {
            return {
                valid: false,
                error: 'IMPOSSIBLE_SPEED_DETECTED',
                speed: Math.round(speedKmh)
            }
        }

        return { valid: true, speed: Math.round(speedKmh) }
    }

    // ── Barcode / QR Validation ──────────────────────────────────────

    /**
     * Validate a scanned barcode against expected value.
     * @param {string} scannedCode - What the camera read
     * @param {string} expectedCode - What the system expects
     * @returns {{ valid: boolean, error?: string }}
     */
    validateBarcode(scannedCode, expectedCode) {
        if (!scannedCode || scannedCode.trim() === '') {
            return { valid: false, error: 'EMPTY_SCAN' }
        }

        if (!expectedCode) {
            // No expected code = accept any valid format
            const isValidFormat = /^[A-Z0-9\-]{6,30}$/.test(scannedCode.trim())
            return isValidFormat
                ? { valid: true }
                : { valid: false, error: 'INVALID_BARCODE_FORMAT' }
        }

        const isMatch = scannedCode.trim().toUpperCase() === expectedCode.trim().toUpperCase()
        return isMatch
            ? { valid: true }
            : { valid: false, error: 'WRONG_BARCODE_SCANNED', scanned: scannedCode, expected: expectedCode }
    }

    /**
     * Validate that all required packages in a stop have been scanned.
     * @param {Array} packages - Package list from job data  
     * @param {Array} scannedBarcodes - List of scanned barcodes
     * @returns {{ valid: boolean, missing: Array, extra: Array }}
     */
    validateAllPackagesScanned(packages, scannedBarcodes) {
        const required = packages.map(p => p.barcode.toUpperCase())
        const scanned = scannedBarcodes.map(b => b.toUpperCase())

        const missing = required.filter(b => !scanned.includes(b))
        const extra = scanned.filter(b => !required.includes(b))

        return {
            valid: missing.length === 0,
            missing,
            extra,
            message: missing.length > 0
                ? `${missing.length} package(s) not scanned`
                : 'All packages verified'
        }
    }

    // ── POD Image Validation ─────────────────────────────────────────

    /**
     * Validate a POD image for freshness and authenticity.
     * DUMMY: Simulates EXIF check. In production, use real EXIF library.
     *
     * @param {string} base64Image - Base64 encoded image
     * @param {Object} currentLocation - Current GPS coordinates
     * @returns {{ valid: boolean, metadata?: Object, error?: string }}
     */
    async validatePODImage(base64Image, currentLocation) {
        if (!base64Image || base64Image.length < 100) {
            return { valid: false, error: 'INVALID_IMAGE_DATA' }
        }

        // DUMMY: In production, extract real EXIF metadata from base64
        const simulatedEXIF = {
            DateTime: new Date().toISOString(), // Freshly taken
            GPSLatitude: currentLocation?.latitude || 19.0760,
            GPSLongitude: currentLocation?.longitude || 72.8777,
            Make: 'Android',
            Model: 'Pixel 7',
            hasGPS: true
        }

        // Check timestamp (within 5 minutes)
        const imageTime = new Date(simulatedEXIF.DateTime)
        const now = new Date()
        const diffMinutes = Math.abs(now - imageTime) / 1000 / 60

        if (diffMinutes > 5) {
            return {
                valid: false,
                error: 'IMAGE_TOO_OLD',
                ageMinutes: Math.round(diffMinutes)
            }
        }

        return {
            valid: true,
            metadata: {
                ...simulatedEXIF,
                capturedAt: simulatedEXIF.DateTime,
                location: {
                    lat: simulatedEXIF.GPSLatitude,
                    lng: simulatedEXIF.GPSLongitude
                }
            }
        }
    }

    // ── Signature Validation ─────────────────────────────────────────

    /**
     * Validate a signature canvas has actual strokes (not blank submit).
     * @param {HTMLCanvasElement} canvas
     * @returns {{ valid: boolean, error?: string }}
     */
    validateSignature(canvas) {
        if (!canvas) return { valid: false, error: 'NO_CANVAS' }

        const ctx = canvas.getContext('2d')
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const pixels = imageData.data

        // Count non-transparent pixels
        let inkPixels = 0
        for (let i = 3; i < pixels.length; i += 4) {
            if (pixels[i] > 10) inkPixels++
        }

        const inkPercent = (inkPixels / (canvas.width * canvas.height)) * 100

        if (inkPercent < 0.5) {
            return { valid: false, error: 'SIGNATURE_TOO_SPARSE' }
        }

        return { valid: true, inkPercent: inkPercent.toFixed(2) }
    }

    // ── Device Binding ───────────────────────────────────────────────

    /**
     * Get a device fingerprint for fraud prevention.
     * DUMMY: Returns simulated fingerprint. In production use @capacitor/device.
     */
    async getDeviceFingerprint() {
        const ua = navigator.userAgent
        const screen = `${window.screen.width}x${window.screen.height}`

        // DUMMY fingerprint
        const fingerprint = btoa(`${ua}|${screen}|${navigator.language}`).slice(0, 32)

        return {
            deviceId: fingerprint,
            platform: /Android/.test(ua) ? 'android' : /iPhone/.test(ua) ? 'ios' : 'web',
            osVersion: 'simulated',
            manufacturer: 'simulated',
            model: 'Driver Device',
        }
    }

    /**
     * Verify current device matches the registered device.
     * @param {string} registeredDeviceId
     * @returns {{ valid: boolean, error?: string }}
     */
    async verifyDeviceBinding(registeredDeviceId) {
        const current = await this.getDeviceFingerprint()

        // DUMMY: In production, compare against server-registered deviceId
        if (!registeredDeviceId) {
            // First-time binding
            return { valid: true, isFirstBinding: true, deviceId: current.deviceId }
        }

        // Compare fingerprints
        const matches = current.deviceId === registeredDeviceId
        return {
            valid: matches,
            error: matches ? undefined : 'DEVICE_MISMATCH',
            currentDeviceId: current.deviceId
        }
    }

    // ── Helpers ──────────────────────────────────────────────────────

    /**
     * Calculate distance between two GPS coordinates (Haversine formula).
     */
    _haversineDistance(lat1, lng1, lat2, lng2) {
        const R = 6371e3 // Earth radius in meters
        const toRad = deg => deg * Math.PI / 180

        const φ1 = toRad(lat1)
        const φ2 = toRad(lat2)
        const Δφ = toRad(lat2 - lat1)
        const Δλ = toRad(lng2 - lng1)

        const a = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

        return R * c // Distance in meters
    }

    /**
     * Check if current location is within a geofence radius.
     */
    isWithinGeofence(currentLat, currentLng, targetLat, targetLng, radiusMeters = 50) {
        const distance = this._haversineDistance(currentLat, currentLng, targetLat, targetLng)
        return {
            withinGeofence: distance <= radiusMeters,
            distance: Math.round(distance),
            radiusMeters
        }
    }

    // ── Audit Trail ──────────────────────────────────────────────────

    /**
     * Generate a tamper-evident action hash for audit logs.
     * DUMMY: Simple hash. In production use HMAC-SHA256.
     */
    generateActionHash(action) {
        const data = `${action.type}|${action.timestamp}|${JSON.stringify(action.body)}`
        let hash = 0
        for (let i = 0; i < data.length; i++) {
            const char = data.charCodeAt(i)
            hash = ((hash << 5) - hash) + char
            hash = hash & hash
        }
        return hash.toString(16)
    }
}

// Singleton instance
export const fraudDetection = new FraudDetectionService()

export default fraudDetection
