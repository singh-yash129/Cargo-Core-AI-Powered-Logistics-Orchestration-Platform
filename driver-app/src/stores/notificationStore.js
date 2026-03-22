import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

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

    return {
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllRead,
        removeNotification,
        clearAll
    }
})
