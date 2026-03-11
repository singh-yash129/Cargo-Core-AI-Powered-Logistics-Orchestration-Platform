<template>
    <nav class="w-full">
        <div class="mx-3 mb-3 p-2 flex items-center justify-around rounded-full border shadow-2xl"
            :class="isDark ? 'bg-background-dark/95 backdrop-blur-xl border-white/10' : 'bg-white/95 backdrop-blur-xl border-gray-200'">

            <button v-for="item in navItems" :key="item.name" @click="navigate(item.route)"
                class="relative flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ease-in-out group"
                :class="isActive(item.route) ? 'bg-primary/15' : 'hover:bg-white/5'">

                <!-- Icon -->
                <div class="relative flex items-center justify-center">
                    <span class="material-icons text-[22px] transition-colors duration-300"
                        :class="isActive(item.route) ? 'text-primary' : isDark ? 'text-gray-400 group-hover:text-gray-300' : 'text-gray-400 group-hover:text-gray-600'">
                        {{ item.icon }}
                    </span>
                    <!-- Badge -->
                    <span v-if="item.badge" class="absolute w-2.5 h-2.5 rounded-full bg-red-500 ring-2" style="right: -0.35rem; top: -0.2rem;"
                        :class="isDark ? 'ring-background-dark' : 'ring-white'">
                    </span>
                </div>

            </button>
        </div>
    </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUiStore } from '../stores/uiStore.js'
import { useNotificationStore } from '../stores/notificationStore.js'

const router = useRouter()
const route = useRoute()
const uiStore = useUiStore()
const notificationStore = useNotificationStore()
const isDark = computed(() => uiStore.theme === 'dark')

const navItems = computed(() => [
    { name: 'home', label: 'Home', icon: 'home', route: '/dashboard', badge: null },
    { name: 'manifest', label: 'Manifest', icon: 'list_alt', route: '/manifest', badge: null },
    { name: 'navigation', label: 'Navigate', icon: 'near_me', route: '/navigation', badge: null },
    { name: 'wallet', label: 'Wallet', icon: 'account_balance_wallet', route: '/wallet', badge: null },
    { name: 'notifications', label: 'Alerts', icon: 'notifications', route: '/notifications', badge: notificationStore.unreadCount > 0 ? notificationStore.unreadCount : null },
])

function isActive(r) {
    if (r === '/dashboard') return route.path === '/dashboard' || route.path === '/'
    return route.path.startsWith(r)
}

function navigate(r) {
    router.push(r)
}
</script>
