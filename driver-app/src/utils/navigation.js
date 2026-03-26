import { Capacitor } from '@capacitor/core'

function toFiniteNumber(value) {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
}

export function resolveNavigationDestination(stop) {
    if (!stop) return null

    const lat = toFiniteNumber(stop.location?.lat ?? stop.lat)
    const lng = toFiniteNumber(stop.location?.lng ?? stop.lng)
    const address = String(
        stop.address
        || stop.deliveryAddr
        || stop.pickupAddr
        || stop.destinationLocation?.address
        || stop.sourceLocation?.address
        || ''
    ).trim()

    if (lat != null && lng != null) {
        return { lat, lng, address }
    }

    if (address) {
        return { lat: null, lng: null, address }
    }

    return null
}

function buildAndroidNavigationUrl(destination) {
    if (destination.lat != null && destination.lng != null) {
        return `geo:0,0?q=${destination.lat},${destination.lng}`
    }

    return `geo:0,0?q=${encodeURIComponent(destination.address)}`
}

function buildWebNavigationUrl(destination) {
    if (destination.lat != null && destination.lng != null) {
        return `https://www.google.com/maps/dir/?api=1&destination=${destination.lat},${destination.lng}&travelmode=driving`
    }

    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination.address)}&travelmode=driving`
}

export function openExternalNavigation(stop) {
    const destination = resolveNavigationDestination(stop)

    if (!destination) {
        throw new Error('No address or coordinates available for this stop')
    }

    const isAndroidNative = Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android'
    const url = isAndroidNative
        ? buildAndroidNavigationUrl(destination)
        : buildWebNavigationUrl(destination)

    if (typeof window === 'undefined') {
        return false
    }

    if (isAndroidNative) {
        window.location.assign(url)
        return true
    }

    window.open(url, '_blank', 'noopener,noreferrer')
    return true
}
