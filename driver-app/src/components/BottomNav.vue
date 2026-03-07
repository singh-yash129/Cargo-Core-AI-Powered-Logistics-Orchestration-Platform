<template>
    <nav class="w-full">
        <div class="mx-3 mb-3 flex items-center justify-around rounded-2xl border shadow-2xl"
            :class="isDark ? 'bg-surface-dark/95 backdrop-blur-xl border-white/8' : 'bg-white/95 backdrop-blur-xl border-gray-200'">

            <button v-for="item in navItems" :key="item.name" @click="navigate(item.route)"
                class="flex-1 flex flex-col items-center justify-center py-3 gap-0.5 group relative btn-active">

                <!-- Active indicator -->
                <div v-if="isActive(item.route)"
                    class="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-primary"></div>

                <!-- Icon -->
                <div class="relative p-1.5 rounded-xl transition-all duration-200"
                    :class="isActive(item.route) ? 'bg-primary/15' : 'group-hover:bg-white/5'">
                    <span class="material-icons text-xl transition-colors duration-200"
                        :class="isActive(item.route) ? 'text-primary' : isDark ? 'text-gray-500 group-hover:text-gray-300' : 'text-gray-400 group-hover:text-gray-600'">
                        {{ item.icon }}
                    </span>
                    <!-- Badge -->
                    <span v-if="item.badge"
                        class="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
                        {{ item.badge }}
                    </span>
                </div>

                <!-- Label -->
                <span class="text-[9px] font-semibold tracking-wide transition-colors duration-200"
                    :class="isActive(item.route) ? 'text-primary' : isDark ? 'text-gray-600' : 'text-gray-400'">
                    {{ item.label }}
                </span>
            </button>
        </div>
    </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUiStore } from '../stores/uiStore.js'

const router = useRouter()
const route = useRoute()
const uiStore = useUiStore()
const isDark = computed(() => uiStore.theme === 'dark')

const navItems = [
    { name: 'home', label: 'Home', icon: 'home', route: '/dashboard', badge: null },
    { name: 'manifest', label: 'Manifest', icon: 'list_alt', route: '/manifest', badge: null },
    { name: 'navigation', label: 'Navigate', icon: 'near_me', route: '/navigation', badge: null },
    { name: 'wallet', label: 'Wallet', icon: 'account_balance_wallet', route: '/wallet', badge: null },
    { name: 'chat', label: 'Chat', icon: 'headset_mic', route: '/chat', badge: '2' },
]

function isActive(r) {
    if (r === '/dashboard') return route.path === '/dashboard' || route.path === '/'
    return route.path.startsWith(r)
}

function navigate(r) {
    router.push(r)
}
</script>
