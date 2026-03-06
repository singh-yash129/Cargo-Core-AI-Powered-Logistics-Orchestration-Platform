import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUiStore = defineStore('ui', () => {
    const theme = ref('dark') // 'dark' | 'light'
    const syncStatus = ref('connected') // 'connected' | 'syncing' | 'offline'
    const offlineQueue = ref([])
    const toast = ref(null)

    function initTheme() {
        const saved = localStorage.getItem('cargo_theme')
        if (saved) {
            theme.value = saved
        } else {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
            theme.value = prefersDark ? 'dark' : 'light'
        }
        applyTheme()
    }

    function toggleTheme() {
        theme.value = theme.value === 'dark' ? 'light' : 'dark'
        localStorage.setItem('cargo_theme', theme.value)
        applyTheme()
    }

    function setTheme(t) {
        theme.value = t
        localStorage.setItem('cargo_theme', t)
        applyTheme()
    }

    function applyTheme() {
        const html = document.documentElement
        if (theme.value === 'dark') {
            html.classList.add('dark')
            html.classList.remove('light')
        } else {
            html.classList.remove('dark')
            html.classList.add('light')
        }
    }

    function setSyncStatus(status) {
        syncStatus.value = status
    }

    function queueOfflineAction(action) {
        offlineQueue.value.push({ ...action, id: Date.now(), queued: new Date().toISOString() })
    }

    function clearOfflineQueue() {
        offlineQueue.value = []
    }

    function showToast(message, type = 'info', duration = 3000) {
        toast.value = { message, type, id: Date.now() }
        setTimeout(() => { toast.value = null }, duration)
    }

    return {
        theme, syncStatus, offlineQueue, toast,
        initTheme, toggleTheme, setTheme,
        setSyncStatus, queueOfflineAction, clearOfflineQueue, showToast
    }
})
