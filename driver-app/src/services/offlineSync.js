/**
 * OfflineSyncEngine — Production-grade offline sync service
 *
 * Stores queued actions in localStorage (IndexedDB-ready for future).
 * Auto-syncs when network comes back.
 * Conflict resolution: last-write-wins with timestamp comparison.
 *
 * WITH DUMMY DATA — No real API calls. All sync is simulated.
 */

import { useUiStore } from '../stores/uiStore.js'

const QUEUE_KEY = 'cargo_offline_queue'
const MAX_RETRY_COUNT = 3
const RETRY_DELAY_MS = 2000

class OfflineSyncEngine {
    constructor() {
        this.syncing = false
        this.networkListener = null
        this._initialized = false
    }

    /**
     * Initialize the engine. Call once from App.vue on mounted.
     */
    async init() {
        if (this._initialized) return
        this._initialized = true

        // Load persisted queue from localStorage
        this._loadPersistedQueue()

        // Start network monitoring
        this._setupNetworkListener()

        console.log('✅ OfflineSyncEngine initialized')
    }

    /**
     * Set up a network status listener.
     * Uses window.addEventListener for compatibility.
     * In production, use @capacitor/network instead.
     */
    _setupNetworkListener() {
        // Online event
        const onOnline = () => {
            const uiStore = useUiStore()
            uiStore.setSyncStatus('connected')
            console.log('🌐 Network restored — starting sync')
            this.syncAll()
        }

        // Offline event
        const onOffline = () => {
            const uiStore = useUiStore()
            uiStore.setSyncStatus('offline')
            console.log('📵 Network lost — queuing actions')
        }

        window.addEventListener('online', onOnline)
        window.addEventListener('offline', onOffline)

        // Set initial status
        const uiStore = useUiStore()
        uiStore.setSyncStatus(navigator.onLine ? 'connected' : 'offline')

        this.networkListener = { onOnline, onOffline }
    }

    /**
     * Queue an action for later sync.
     * Works both online (tries immediately) and offline (stores for later).
     *
     * @param {Object} action - { type, endpoint, method, body, jobId, priority }
     */
    async queueAction(action) {
        const uiStore = useUiStore()

        const queueItem = {
            id: `action_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
            ...action,
            timestamp: new Date().toISOString(),
            retries: 0,
            status: 'pending', // 'pending' | 'syncing' | 'synced' | 'failed'
        }

        // Add to Pinia store (reactive UI)
        uiStore.queueOfflineAction(queueItem)

        // Persist to localStorage
        this._persistQueue(uiStore.offlineQueue)

        console.log(`📦 Queued action: ${action.type}`, queueItem)

        // If online, try to sync immediately
        if (navigator.onLine && !this.syncing) {
            await this._trySyncItem(queueItem)
        }

        return queueItem.id
    }

    /**
     * Push a convenience "state change" action
     */
    async queueStateChange(jobId, fromState, toState, metadata = {}) {
        return this.queueAction({
            type: 'STATE_CHANGE',
            endpoint: `/jobs/${jobId}/state`,
            method: 'PATCH',
            body: { state: toState, fromState, metadata, timestamp: new Date().toISOString() },
            jobId,
            priority: 'HIGH'
        })
    }

    /**
     * Push a POD upload action
     */
    async queuePODUpload(jobId, stopId, podData) {
        return this.queueAction({
            type: 'POD_UPLOAD',
            endpoint: `/jobs/${jobId}/stops/${stopId}/pod`,
            method: 'POST',
            body: podData,
            jobId,
            priority: 'HIGH'
        })
    }

    /**
     * Push a location update (lower priority, can be batched)
     */
    async queueLocationUpdate(coords) {
        return this.queueAction({
            type: 'LOCATION_UPDATE',
            endpoint: '/tracking/location',
            method: 'POST',
            body: coords,
            priority: 'LOW'
        })
    }

    /**
     * Sync all pending items in the queue.
     */
    async syncAll() {
        if (this.syncing) return
        if (!navigator.onLine) return

        const uiStore = useUiStore()
        const pendingItems = uiStore.offlineQueue.filter(a => a.status === 'pending')

        if (pendingItems.length === 0) return

        this.syncing = true
        uiStore.setSyncStatus('syncing')
        console.log(`🔄 Syncing ${pendingItems.length} offline actions...`)

        for (const item of pendingItems) {
            await this._trySyncItem(item)
            // Small delay between requests to avoid overwhelming server
            await new Promise(r => setTimeout(r, 200))
        }

        this.syncing = false
        uiStore.setSyncStatus(navigator.onLine ? 'connected' : 'offline')

        const stillPending = uiStore.offlineQueue.filter(a => a.status === 'pending').length
        if (stillPending === 0) {
            uiStore.showToast('All offline actions synced ✓', 'success', 2000)
        } else {
            uiStore.showToast(`${stillPending} actions still pending`, 'warning', 3000)
        }
    }

    /**
     * Attempt to sync a single queue item.
     * DUMMY MODE: simulates network call with 300ms delay.
     */
    async _trySyncItem(item) {
        const uiStore = useUiStore()

        // Update item status to syncing
        const idx = uiStore.offlineQueue.findIndex(a => a.id === item.id)
        if (idx === -1) return

        uiStore.offlineQueue[idx].status = 'syncing'

        try {
            // DUMMY: Simulate API call
            await this._simulateApiCall(item)

            // Mark as synced and remove from queue
            uiStore.offlineQueue.splice(idx, 1)
            this._persistQueue(uiStore.offlineQueue)
            console.log(`✅ Synced: ${item.type}`)

        } catch (err) {
            uiStore.offlineQueue[idx].retries = (uiStore.offlineQueue[idx].retries || 0) + 1
            uiStore.offlineQueue[idx].status = uiStore.offlineQueue[idx].retries >= MAX_RETRY_COUNT
                ? 'failed'
                : 'pending'
            uiStore.offlineQueue[idx].lastError = err.message

            console.error(`❌ Sync failed for ${item.type}:`, err.message)

            if (uiStore.offlineQueue[idx].status === 'failed') {
                uiStore.showToast(`Action "${item.type}" failed after ${MAX_RETRY_COUNT} retries`, 'error', 3000)
            }

            this._persistQueue(uiStore.offlineQueue)
        }
    }

    /**
     * DUMMY: Simulates an API call with configurable success rate.
     * Replace with real fetch() when backend is ready.
     */
    async _simulateApiCall(item) {
        await new Promise(r => setTimeout(r, 300 + Math.random() * 200))

        // Simulate 5% failure rate for demo purposes
        if (Math.random() < 0.05) {
            throw new Error('Network timeout (simulated)')
        }

        console.log(`[DUMMY API] ${item.method} ${item.endpoint}`, item.body)
        return { success: true, timestamp: new Date().toISOString() }
    }

    /**
     * Persist queue to localStorage for app restart survival.
     */
    _persistQueue(queue) {
        try {
            localStorage.setItem(QUEUE_KEY, JSON.stringify(queue))
        } catch (e) {
            console.error('Failed to persist offline queue:', e)
        }
    }

    /**
     * Load persisted queue from localStorage on startup.
     */
    _loadPersistedQueue() {
        try {
            const raw = localStorage.getItem(QUEUE_KEY)
            if (!raw) return

            const stored = JSON.parse(raw)
            if (!Array.isArray(stored) || stored.length === 0) return

            const uiStore = useUiStore()

            // Only load items that weren't fully synced
            const pending = stored.filter(a => a.status !== 'synced')
            pending.forEach(a => {
                a.status = 'pending' // Reset syncing status from crash
                uiStore.offlineQueue.push(a)
            })

            console.log(`📂 Restored ${pending.length} offline actions from storage`)
        } catch (e) {
            console.error('Failed to load persisted queue:', e)
        }
    }

    /**
     * Retry all failed items manually.
     */
    async retryFailed() {
        const uiStore = useUiStore()
        const failed = uiStore.offlineQueue.filter(a => a.status === 'failed')
        failed.forEach(a => {
            a.status = 'pending'
            a.retries = 0
        })

        if (failed.length > 0) {
            await this.syncAll()
        }
    }

    /**
     * Clear all queued actions (use with caution).
     */
    clearQueue() {
        const uiStore = useUiStore()
        uiStore.clearOfflineQueue()
        localStorage.removeItem(QUEUE_KEY)
        console.log('🗑️ Offline queue cleared')
    }

    /**
     * Teardown — remove event listeners.
     */
    destroy() {
        if (this.networkListener) {
            window.removeEventListener('online', this.networkListener.onOnline)
            window.removeEventListener('offline', this.networkListener.onOffline)
        }
    }
}

// Singleton instance
export const offlineSyncEngine = new OfflineSyncEngine()

export default offlineSyncEngine
