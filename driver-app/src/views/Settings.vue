<template>
    <div class="screen-layout" :class="isDark ? 'bg-background-dark text-white' : 'bg-background-light text-gray-900'">
        <!-- HEADER -->
        <header class="flex-shrink-0 px-5 pt-5 pb-4 border-b" :class="isDark ? 'border-white/5' : 'border-gray-100'">
            <div class="flex items-center gap-3 mb-2">
                <button @click="$router.back()" class="w-10 h-10 rounded-full flex items-center justify-center border"
                    :class="isDark ? 'bg-surface-dark border-white/5 text-gray-400' : 'bg-white border-gray-200 shadow-sm'">
                    <span class="material-icons text-xl">arrow_back</span>
                </button>
                <h1 class="text-2xl font-black tracking-tight">Settings</h1>
            </div>
            <!-- Driver identity strip -->
            <div class="flex items-center gap-3 mt-1 p-3 rounded-2xl border"
                :class="isDark ? 'bg-primary/8 border-primary/20' : 'bg-primary/8 border-primary/30'">
                <div class="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                    <span class="material-icons text-primary text-2xl">person</span>
                </div>
                <div class="flex-1">
                    <p class="font-black">{{ driverStore.driverName }}</p>
                    <p class="text-xs font-mono text-primary">{{ driverStore.driverId }} · {{ driverStore.driver?.badge || 'Driver' }} · {{ driverStore.driver?.tier || 'Field Ops' }}</p>
                </div>
                <div class="text-right">
                    <p class="text-xl font-black text-accent-gold">{{ driverStore.driver?.rating ?? '—' }}★</p>
                    <p class="text-[10px]" :class="isDark ? 'text-gray-500' : 'text-gray-400'">{{ driverStore.driver?.totalDeliveries ?? 0 }} trips</p>
                </div>
            </div>
        </header>

        <!-- SCROLLABLE BODY -->
        <div class="screen-body px-5 py-4 flex flex-col gap-3">

            <!-- Display -->
            <div class="rounded-2xl border overflow-hidden"
                :class="isDark ? 'border-white/5' : 'border-gray-100 shadow-sm'">
                <div class="px-4 py-2 border-b text-xs font-bold uppercase tracking-widest"
                    :class="isDark ? 'bg-surface-dark/40 text-gray-400 border-white/5' : 'bg-gray-50 text-gray-500 border-gray-100'">
                    Display</div>
                <div class="divide-y" :class="isDark ? 'divide-gray-800' : 'divide-gray-100'">
                    <div class="flex items-center justify-between px-4 py-4">
                        <div class="flex items-center gap-3">
                            <span class="material-icons" :class="isDark ? 'text-primary' : 'text-gray-500'">{{ isDark ?
                                'dark_mode' : 'light_mode' }}</span>
                            <div>
                                <p class="text-sm font-semibold">Dark Mode</p>
                                <p class="text-xs" :class="isDark ? 'text-gray-500' : 'text-gray-400'">{{ isDark ? 'Dark theme active' : 'Light theme active' }}</p>
                            </div>
                        </div>
                        <button @click="uiStore.toggleTheme()"
                            class="relative w-12 h-6 rounded-full transition-colors duration-300"
                            :class="isDark ? 'bg-primary' : 'bg-gray-200'">
                            <span
                                class="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-300"
                                :class="isDark ? 'left-6' : 'left-0.5'"></span>
                        </button>
                    </div>
                    <div class="flex items-center justify-between px-4 py-4">
                        <div class="flex items-center gap-3">
                            <span class="material-icons"
                                :class="isDark ? 'text-gray-400' : 'text-gray-500'">language</span>
                            <p class="text-sm font-semibold">Language</p>
                        </div>
                        <span class="text-sm font-semibold text-primary">EN / HI</span>
                    </div>
                </div>
            </div>

            <!-- Notifications -->
            <div class="rounded-2xl border overflow-hidden"
                :class="isDark ? 'border-white/5' : 'border-gray-100 shadow-sm'">
                <div class="px-4 py-2 border-b text-xs font-bold uppercase tracking-widest"
                    :class="isDark ? 'bg-surface-dark/40 text-gray-400 border-white/5' : 'bg-gray-50 text-gray-500 border-gray-100'">
                    Notifications</div>
                <div class="divide-y" :class="isDark ? 'divide-gray-800' : 'divide-gray-100'">
                    <div v-for="notif in notifSettings" :key="notif.label"
                        class="flex items-center justify-between px-4 py-3.5">
                        <div class="flex items-center gap-3">
                            <span class="material-icons text-sm" :class="isDark ? 'text-gray-400' : 'text-gray-500'">{{
                                notif.icon }}</span>
                            <p class="text-sm font-medium">{{ notif.label }}</p>
                        </div>
                        <button @click="notif.on = !notif.on" class="relative w-10 h-5 rounded-full transition-colors"
                            :class="notif.on ? 'bg-primary' : isDark ? 'bg-gray-700' : 'bg-gray-200'">
                            <span class="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all"
                                :class="notif.on ? 'left-5' : 'left-0.5'"></span>
                        </button>
                    </div>
                </div>
            </div>

            <!-- About -->
            <div class="rounded-2xl border overflow-hidden"
                :class="isDark ? 'border-white/5' : 'border-gray-100 shadow-sm'">
                <div class="px-4 py-2 border-b text-xs font-bold uppercase tracking-widest"
                    :class="isDark ? 'bg-surface-dark/40 text-gray-400 border-white/5' : 'bg-gray-50 text-gray-500 border-gray-100'">
                    About</div>
                <div class="divide-y" :class="isDark ? 'divide-gray-800' : 'divide-gray-100'">
                    <div v-for="row in aboutRows" :key="row.label"
                        class="flex justify-between items-center px-4 py-3.5 text-sm">
                        <span :class="isDark ? 'text-gray-400' : 'text-gray-500'">{{ row.label }}</span>
                        <span class="font-semibold" :class="row.accent ? 'text-primary' : ''">{{ row.value }}</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- STICKY FOOTER -->
        <div class="screen-footer border-t"
            :class="isDark ? 'border-white/5 bg-background-dark' : 'border-gray-100 bg-background-light'">
            <div class="px-5 py-4">
                <button @click="handleLogout"
                    class="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border font-bold text-red-400 transition-all active:scale-[0.98]"
                    :class="isDark ? 'bg-red-500/8 border-red-500/20 hover:bg-red-500/15' : 'bg-red-50 border-red-100'">
                    <span class="material-icons">logout</span>
                    Sign Out
                </button>
                <p class="text-center text-xs mt-2" :class="isDark ? 'text-gray-700' : 'text-gray-400'">© 2026
                    Cargo-Core Technologies Pvt. Ltd.</p>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUiStore } from '../stores/uiStore.js'
import { useDriverStore } from '../stores/driverStore.js'

const router = useRouter()
const uiStore = useUiStore()
const driverStore = useDriverStore()
const isDark = computed(() => uiStore.theme !== 'light')

onMounted(() => {
    driverStore.refreshDashboard()
})

const notifSettings = ref([
    { label: 'Push Notifications', icon: 'notifications', on: true },
    { label: 'SMS Alerts', icon: 'sms', on: true },
    { label: 'Haptic Feedback', icon: 'vibration', on: true },
])
const aboutRows = [
    { label: 'App Version', value: 'v4.2.0', accent: true },
    { label: 'Platform', value: 'Cargo-Core Driver' },
    { label: 'Build', value: '2026.03.06' },
]

function handleLogout() {
    driverStore.logout()
    router.replace('/login')
}
</script>
