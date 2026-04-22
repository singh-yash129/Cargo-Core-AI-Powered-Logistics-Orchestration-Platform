import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getDriverNotifications } from '../services/api.js'

export const useNotificationStore = defineStore('notifications', () => {
    const notifications = ref([])
    const maxNotifications = 50

    const unreadCount = computed(() =>
        notifications.value.filter(n => !n.read).length
    )

    function addNotification({ title, body, type = 'info', route = null }) {
        const notification = {
            id: Date.now() + Math.random(),
            title,
            body,
            type, // 'info' | 'success' | 'warning' | 'error' | 'delivery' | 'navigation' | 'system'
            route,
            read: false,
            timestamp: new Date().toISOString(),
        }
        notifications.value.unshift(notification)
        // Cap the stored notifications
        if (notifications.value.length > maxNotifications) {
            notifications.value = notifications.value.slice(0, maxNotifications)
        }
        return notification
    }

    function markAsRead(id) {
        const n = notifications.value.find(n => n.id === id)
        if (n) n.read = true
    }

    function markAllRead() {
        notifications.value.forEach(n => { n.read = true })
    }

    function removeNotification(id) {
        notifications.value = notifications.value.filter(n => n.id !== id)
    }

    function clearAll() {
        notifications.value = []
    }

    async function fetchFromBackend() {
        try {
            const data = await getDriverNotifications()
            const existingIds = new Set(notifications.value.map(n => String(n.id)))
            const incoming = data
                .filter(n => !existingIds.has(String(n.id)))
                .map(n => ({
                    id: n.id,
                    title: n.title,
                    body: n.message,
                    type: n.type === 'alert' ? 'error' : n.type || 'info',
                    route: null,
                    read: n.read ?? false,
                    timestamp: n.time || new Date().toISOString(),
                }))
            if (incoming.length) {
                notifications.value = [...incoming, ...notifications.value].slice(0, 50)
            }
        } catch (_) {}
    }

    return {
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllRead,
        removeNotification,
        clearAll,
        fetchFromBackend,
    }
})
