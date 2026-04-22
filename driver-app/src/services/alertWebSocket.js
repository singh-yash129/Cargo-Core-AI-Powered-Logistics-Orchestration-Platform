// WebSocket service for receiving real-time crisis alerts and broadcasts
import { Capacitor } from '@capacitor/core'
import { useNotificationStore } from '../stores/notificationStore'
import { useUiStore } from '../stores/uiStore'
import { useJobStore } from '../stores/jobStore'
import { useRouteStore } from '../stores/routeStore'

function trimTrailingSlash(url) {
    return url.replace(/\/+$/, '')
}

function resolveWsBase() {
    const apiBase = trimTrailingSlash(
        import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
    )

    // Convert http(s) to ws(s)
    let wsBase = apiBase.replace(/^http/, 'ws')

    if (!Capacitor.isNativePlatform()) {
        return wsBase
    }

    const androidOverride = import.meta.env.VITE_API_BASE_URL_ANDROID
    if (androidOverride) {
        return trimTrailingSlash(androidOverride).replace(/^http/, 'ws')
    }

    try {
        const parsed = new URL(apiBase)
        if (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1') {
            parsed.hostname = '10.0.2.2'
            return trimTrailingSlash(parsed.toString()).replace(/^http/, 'ws')
        }
    } catch {
        // Keep the wsBase if parsing fails.
    }

    return wsBase
}

const ACCESS_TOKEN_STORAGE_KEY = 'cargo-core:driver-access-token'

function getAccessToken() {
    try {
        return localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY)
    } catch {
        return null
    }
}

class AlertWebSocketService {
    constructor() {
        this.ws = null
        this.reconnectAttempts = 0
        this.maxReconnectAttempts = 5
        this.reconnectDelay = 3000
        this.isConnecting = false
        this.isConnected = false
        this.reconnectTimer = null
    }

    connect() {
        if (this.isConnecting || this.isConnected) {
            return
        }

        const token = getAccessToken()
        if (!token) {
            console.log('[AlertWS] No access token, skipping WebSocket connection')
            return
        }

        this.isConnecting = true
        const wsBase = resolveWsBase()
        const wsUrl = `${wsBase}/ws/driver-alerts?token=${encodeURIComponent(token)}`

        try {
            this.ws = new WebSocket(wsUrl)

            this.ws.onopen = () => {
                console.log('[AlertWS] Connected to alert WebSocket')
                this.isConnecting = false
                this.isConnected = true
                this.reconnectAttempts = 0
            }

            this.ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data)
                    this.handleMessage(data)
                } catch (e) {
                    console.error('[AlertWS] Failed to parse message:', e)
                }
            }

            this.ws.onclose = (event) => {
                console.log('[AlertWS] Connection closed:', event.code, event.reason)
                this.isConnecting = false
                this.isConnected = false
                this.scheduleReconnect()
            }

            this.ws.onerror = (error) => {
                console.error('[AlertWS] WebSocket error:', error)
                this.isConnecting = false
                this.isConnected = false
            }
        } catch (e) {
            console.error('[AlertWS] Failed to create WebSocket:', e)
            this.isConnecting = false
            this.scheduleReconnect()
        }
    }

    handleMessage(data) {
        const notificationStore = useNotificationStore()
        const uiStore = useUiStore()

        switch (data.type) {
            case 'connected':
                console.log('[AlertWS] Server confirmed connection:', data.message)
                break

            case 'ping':
                // Respond to keepalive ping
                if (this.ws && this.ws.readyState === WebSocket.OPEN) {
                    this.ws.send(JSON.stringify({ type: 'pong' }))
                }
                break

            case 'broadcast_alert':
                // Dispatcher broadcast alert to all drivers
                this.handleBroadcastAlert(data, notificationStore, uiStore)
                break

            case 'crisis_update':
                // Crisis status update
                this.handleCrisisUpdate(data, notificationStore, uiStore)
                break

            case 'alert':
                // Generic alert
                this.handleGenericAlert(data, notificationStore, uiStore)
                break

            case 'job_assigned':
                // Dispatcher assigned a new order to this driver
                this.handleJobAssigned(data, notificationStore, uiStore)
                break

            case 'route_update':
                this.handleRouteUpdate(data, notificationStore, uiStore)
                break

            default:
                console.log('[AlertWS] Unknown message type:', data.type)
        }
    }

    async _fireNativeNotification(title, body, id) {
        if (!Capacitor.isNativePlatform()) return
        try {
            const { LocalNotifications } = await import('@capacitor/local-notifications')
            const perm = await LocalNotifications.checkPermissions()
            if (perm.display !== 'granted') {
                await LocalNotifications.requestPermissions()
            }
            await LocalNotifications.schedule({
                notifications: [{ title, body, id: Math.abs(id | 0) || Math.floor(Math.random() * 100000) }]
            })
        } catch { /* no-op */ }
    }

    handleBroadcastAlert(data, notificationStore, uiStore) {
        const severityMap = { emergency: 'error', warning: 'warning', info: 'info' }
        const notifType = severityMap[data.severity] || 'warning'
        const title = data.title || 'Broadcast Alert'
        const body = data.message || ''

        const n = notificationStore.addNotification({ title, body, type: notifType, route: null })
        const emoji = data.severity === 'emergency' ? '🚨' : data.severity === 'warning' ? '⚠️' : 'ℹ️'
        uiStore.showToast(`${emoji} ${title}: ${body}`, notifType)
        this._fireNativeNotification(title, body, n.id)
    }

    handleCrisisUpdate(data, notificationStore, uiStore) {
        const title = 'Crisis Update'
        const body = data.message || `Status: ${data.status}`
        const n = notificationStore.addNotification({ title, body, type: 'warning', route: null })
        uiStore.showToast(`🚨 ${title}: ${body}`, 'warning')
        this._fireNativeNotification(title, body, n.id)
    }

    handleGenericAlert(data, notificationStore, uiStore) {
        const typeMap = { critical: 'error', high: 'error', warning: 'warning', info: 'info' }
        const notifType = typeMap[data.severity] || 'info'
        const title = data.title || 'Alert'
        const body = data.message || ''
        const n = notificationStore.addNotification({ title, body, type: notifType, route: null })
        uiStore.showToast(`${title}: ${body}`, notifType)
        this._fireNativeNotification(title, body, n.id)
    }

    async handleJobAssigned(data, notificationStore, uiStore) {
        const title = data.title || 'New Job Assigned'
        const body = data.message || `Order ${data.tracking_code} assigned to you`

        // Show in-app notification and toast
        const n = notificationStore.addNotification({ title, body, type: 'success', route: '/job-assignment' })
        uiStore.showToast(`🚚 ${title}`, 'success', 5000)
        this._fireNativeNotification(title, body, n.id)

        // Fetch the assigned orders and load the job into the store
        try {
            const jobStore = useJobStore()
            const routeStore = useRouteStore()
            // Only auto-load if driver has no active job yet
            if (!jobStore.jobType || jobStore.jobState === 'IDLE') {
                const orders = await jobStore.fetchAssignedOrders()
                if (orders.length > 0) {
                    jobStore.loadJob(orders[0])
                    console.log('[AlertWS] Job auto-loaded from assignment:', orders[0].jobId)
                }
            }
            if (data.trip_intelligence) {
                routeStore.setTripBrief(data.trip_intelligence)
            }
        } catch (err) {
            console.error('[AlertWS] Failed to load job after assignment:', err)
        }
    }

    handleRouteUpdate(data, notificationStore, uiStore) {
        const routeStore = useRouteStore()
        const savedMinutes = Number(data.saved_minutes || 0)
        const title = data.title || 'Route Update'
        const body = data.message
            || (savedMinutes > 0
                ? `Updated route available. Estimated recovery: ${savedMinutes} min`
                : 'Dispatch has shared a route update')

        routeStore.applyRouteUpdate({
            ...data,
            receivedAt: new Date().toISOString(),
        })

        const n = notificationStore.addNotification({
            title,
            body,
            type: savedMinutes > 0 ? 'warning' : 'info',
            route: '/navigation',
        })
        uiStore.showToast(savedMinutes > 0 ? `Route update: save ${savedMinutes} min` : title, 'warning', 5000)
        this._fireNativeNotification(title, body, n.id)
    }

    scheduleReconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.log('[AlertWS] Max reconnect attempts reached, giving up')
            return
        }

        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer)
        }

        const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts)
        console.log(`[AlertWS] Scheduling reconnect in ${delay}ms (attempt ${this.reconnectAttempts + 1})`)

        this.reconnectTimer = setTimeout(() => {
            this.reconnectAttempts++
            this.connect()
        }, delay)
    }

    disconnect() {
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer)
            this.reconnectTimer = null
        }

        if (this.ws) {
            this.ws.close()
            this.ws = null
        }

        this.isConnecting = false
        this.isConnected = false
        this.reconnectAttempts = 0
    }

    // Reset and reconnect (useful after login)
    reconnect() {
        this.disconnect()
        this.connect()
    }
}

// Singleton instance
export const alertWebSocket = new AlertWebSocketService()

// Auto-connect when imported and token exists
if (typeof window !== 'undefined') {
    // Delay initial connection to ensure stores are initialized
    setTimeout(() => {
        alertWebSocket.connect()
    }, 1000)
}
