<template>
    <div class="min-h-screen pb-safe overflow-y-auto no-scrollbar"
        :class="isDark ? 'bg-background-dark text-white' : 'bg-background-light text-gray-900'">
        <div class="px-5 pt-5 pb-12 flex flex-col gap-5">

            <!-- Header with Close -->
            <div class="flex items-center gap-3">
                <button @click="$router.back()" class="w-10 h-10 rounded-full flex items-center justify-center border"
                    :class="isDark ? 'bg-surface-dark border-white/5 text-gray-400' : 'bg-white border-gray-200 shadow-sm'">
                    <span class="material-icons text-xl">arrow_back</span>
                </button>
                <h1 class="text-2xl font-black tracking-tight">Settings</h1>
            </div>

            <!-- Driver Profile Card -->
            <div class="rounded-3xl p-5 border relative overflow-hidden"
                :class="isDark ? 'bg-surface-dark/40 border-white/8' : 'bg-white border-gray-100 shadow-sm'">
                <div
                    class="absolute -top-10 -right-10 w-32 h-32 bg-primary/8 rounded-full blur-3xl pointer-events-none">
                </div>
                <div class="flex items-center gap-4 mb-4">
                    <div class="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center">
                        <span class="material-icons text-primary text-3xl">person</span>
                    </div>
                    <div>
                        <p class="font-black text-lg">Arjun Sharma</p>
                        <p class="text-xs font-mono" :class="isDark ? 'text-gray-400' : 'text-gray-500'">DRV-2049</p>
                        <div class="flex items-center gap-1 mt-0.5">
                            <span class="material-icons text-accent-gold text-xs">star</span>
                            <span class="text-xs font-semibold">4.9 · Pro Driver</span>
                        </div>
                    </div>
                </div>
                <div class="grid grid-cols-3 gap-2 text-center">
                    <div class="rounded-xl p-3 border"
                        :class="isDark ? 'bg-black/20 border-white/5' : 'bg-gray-50 border-gray-100'">
                        <p class="text-xl font-black">1,247</p>
                        <p class="text-[10px] uppercase" :class="isDark ? 'text-gray-400' : 'text-gray-500'">Deliveries
                        </p>
                    </div>
                    <div class="rounded-xl p-3 border"
                        :class="isDark ? 'bg-black/20 border-white/5' : 'bg-gray-50 border-gray-100'">
                        <p class="text-xl font-black text-primary">96%</p>
                        <p class="text-[10px] uppercase" :class="isDark ? 'text-gray-400' : 'text-gray-500'">On Time</p>
                    </div>
                    <div class="rounded-xl p-3 border"
                        :class="isDark ? 'bg-black/20 border-white/5' : 'bg-gray-50 border-gray-100'">
                        <p class="text-xl font-black">L3</p>
                        <p class="text-[10px] uppercase" :class="isDark ? 'text-gray-400' : 'text-gray-500'">Tier</p>
                    </div>
                </div>
            </div>

            <!-- Preferences -->
            <div class="rounded-2xl border overflow-hidden"
                :class="isDark ? 'border-white/5' : 'border-gray-100 shadow-sm'">
                <div class="px-4 py-2 border-b"
                    :class="isDark ? 'bg-surface-dark/30 border-white/5' : 'bg-gray-50 border-gray-100'">
                    <p class="text-xs font-bold uppercase tracking-widest"
                        :class="isDark ? 'text-gray-400' : 'text-gray-500'">Preferences</p>
                </div>
                <div :class="isDark ? 'divide-gray-800' : 'divide-gray-100'" class="divide-y">
                    <!-- Dark mode toggle -->
                    <div class="flex items-center justify-between px-4 py-4">
                        <div class="flex items-center gap-3">
                            <span class="material-icons" :class="isDark ? 'text-gray-400' : 'text-gray-500'">{{ isDark ?
                                'dark_mode' : 'light_mode' }}</span>
                            <div>
                                <p class="text-sm font-semibold">Dark Mode</p>
                                <p class="text-xs" :class="isDark ? 'text-gray-500' : 'text-gray-400'">{{ isDark ?
                                    'Currently dark' : 'Currently light' }}</p>
                            </div>
                        </div>
                        <button @click="uiStore.toggleTheme()" class="relative w-12 h-6 rounded-full transition-all"
                            :class="isDark ? 'bg-primary' : 'bg-gray-200'">
                            <span
                                class="absolute top-0.5 transition-all duration-300 w-5 h-5 bg-white rounded-full shadow"
                                :class="isDark ? 'left-6' : 'left-0.5'"></span>
                        </button>
                    </div>
                    <!-- Language -->
                    <div class="flex items-center justify-between px-4 py-4">
                        <div class="flex items-center gap-3">
                            <span class="material-icons"
                                :class="isDark ? 'text-gray-400' : 'text-gray-500'">language</span>
                            <div>
                                <p class="text-sm font-semibold">Language</p>
                                <p class="text-xs" :class="isDark ? 'text-gray-500' : 'text-gray-400'">English, Hindi
                                </p>
                            </div>
                        </div>
                        <span class="material-icons text-gray-400">chevron_right</span>
                    </div>
                    <!-- Notifications -->
                    <div class="flex items-center justify-between px-4 py-4">
                        <div class="flex items-center gap-3">
                            <span class="material-icons"
                                :class="isDark ? 'text-gray-400' : 'text-gray-500'">notifications</span>
                            <div>
                                <p class="text-sm font-semibold">Notifications</p>
                                <p class="text-xs" :class="isDark ? 'text-gray-500' : 'text-gray-400'">Push, SMS,
                                    Haptics</p>
                            </div>
                        </div>
                        <button class="relative w-12 h-6 rounded-full bg-primary">
                            <span class="absolute top-0.5 left-6 w-5 h-5 bg-white rounded-full shadow"></span>
                        </button>
                    </div>
                </div>
            </div>

            <!-- About -->
            <div class="rounded-2xl border overflow-hidden"
                :class="isDark ? 'border-white/5' : 'border-gray-100 shadow-sm'">
                <div class="px-4 py-2 border-b"
                    :class="isDark ? 'bg-surface-dark/30 border-white/5' : 'bg-gray-50 border-gray-100'">
                    <p class="text-xs font-bold uppercase tracking-widest"
                        :class="isDark ? 'text-gray-400' : 'text-gray-500'">About</p>
                </div>
                <div :class="isDark ? 'divide-gray-800' : 'divide-gray-100'" class="divide-y">
                    <div class="flex items-center justify-between px-4 py-3.5 text-sm">
                        <span :class="isDark ? 'text-gray-300' : 'text-gray-700'">App Version</span>
                        <span class="font-mono font-bold text-primary">v4.2.0</span>
                    </div>
                    <div class="flex items-center justify-between px-4 py-3.5 text-sm">
                        <span :class="isDark ? 'text-gray-300' : 'text-gray-700'">Platform</span>
                        <span class="font-semibold" :class="isDark ? 'text-gray-400' : 'text-gray-500'">Cargo-Core
                            Driver</span>
                    </div>
                    <div class="flex items-center justify-between px-4 py-3.5 text-sm">
                        <span :class="isDark ? 'text-gray-300' : 'text-gray-700'">Build</span>
                        <span class="font-mono font-semibold"
                            :class="isDark ? 'text-gray-400' : 'text-gray-500'">2026.03.06</span>
                    </div>
                </div>
            </div>

            <!-- Sign out -->
            <button @click="handleLogout"
                class="w-full flex items-center justify-center gap-2 py-4 rounded-2xl border font-bold text-red-400 transition-all active:scale-[0.98]"
                :class="isDark ? 'bg-red-500/8 border-red-500/20 hover:bg-red-500/15' : 'bg-red-50 border-red-100 hover:bg-red-100'">
                <span class="material-icons">logout</span>
                Sign Out
            </button>

            <p class="text-center text-xs" :class="isDark ? 'text-gray-600' : 'text-gray-400'">
                © 2026 Cargo-Core Technologies Pvt. Ltd.
            </p>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUiStore } from '../stores/uiStore.js'
import { useDriverStore } from '../stores/driverStore.js'

const router = useRouter()
const uiStore = useUiStore()
const driverStore = useDriverStore()
const isDark = computed(() => uiStore.theme !== 'light')

function handleLogout() {
    driverStore.logout()
    router.replace('/login')
}
</script>
