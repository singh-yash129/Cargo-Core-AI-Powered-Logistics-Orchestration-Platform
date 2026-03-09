import { defineStore } from 'pinia'
import { ref } from 'vue'
import { Capacitor } from '@capacitor/core'

export const useUiStore = defineStore('ui', () => {
    const theme = ref('light') // 'dark' | 'light'
    const syncStatus = ref('connected') // 'connected' | 'syncing' | 'offline'
    const offlineQueue = ref([])
    const isLoading = ref(false)
    const toast = ref(null)
    const isNavHidden = ref(false)

    const isNativePlatform = Capacitor.isNativePlatform()

    let toastTimer = null

    function showToast(message, type = 'info', duration = 3000) {
        if (toastTimer) clearTimeout(toastTimer)
        toast.value = { id: Date.now(), message, type }

        toastTimer = setTimeout(() => {
            toast.value = null
        }, duration)
    }

    function setLoading(status) {
        isLoading.value = status
    }

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

    return {
        theme, syncStatus, offlineQueue, isLoading, toast, isNativePlatform, isNavHidden,
        initTheme, toggleTheme, setTheme,
        setSyncStatus, queueOfflineAction, clearOfflineQueue, setLoading, showToast
    }
})
