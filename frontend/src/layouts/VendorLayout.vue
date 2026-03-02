<template>
    <div
        class="min-h-screen bg-background-light dark:bg-background-dark font-display text-gray-900 dark:text-white antialiased flex relative">

        <!-- Mobile Overlay -->
        <div v-if="isSidebarOpen" @click="isSidebarOpen = false"
            class="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"></div>

        <!-- Sidebar -->
        <VendorSidebar :is-open="isSidebarOpen" @close="isSidebarOpen = false" />

        <!-- Main Content Area -->
        <main
            class="flex-1 lg:ml-64 min-h-screen flex flex-col transition-all duration-300 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-500/5 dark:from-blue-900/10 via-surface-light dark:via-background-dark to-surface-light dark:to-background-dark">

            <!-- Top Bar -->
            <header
                class="h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between border-b border-gray-200 dark:border-white/5 bg-surface-light/80 dark:bg-background-dark/80 backdrop-blur-md sticky top-0 z-40">

                <div class="flex items-center gap-3">
                    <!-- Mobile Menu Toggle -->
                    <button @click="isSidebarOpen = !isSidebarOpen"
                        class="lg:hidden p-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
                        <span class="material-symbols-outlined">menu</span>
                    </button>
                    <div>
                        <h1 class="text-base sm:text-xl font-bold text-gray-900 dark:text-white">Vendor Portal</h1>
                        <div class="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                            <span class="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                            Manage your commercial shipments.
                        </div>
                    </div>
                </div>

                <div class="flex items-center gap-2 sm:gap-4">
                    <!-- Quick Metrics: Credit Balance (hidden on mobile) -->
                    <div class="hidden md:flex gap-4 border-r border-gray-200 dark:border-white/10 pr-4">
                        <div class="text-right">
                            <div class="text-[10px] text-gray-500 uppercase">Credit Balance</div>
                            <div class="text-sm font-bold text-green-600 dark:text-green-400">$12,450.00</div>
                        </div>
                    </div>

                    <div class="flex items-center gap-1 sm:gap-3">
                        <!-- Weather & Clock Widget -->
                        <div class="hidden sm:block">
                            <HeaderWeather hub-id="1" />
                        </div>

                        <!-- Notifications -->
                        <NotificationPopover :notifications="store.notifications"
                            :unread-count="store.unreadNotificationsCount" @mark-read="store.markNotificationRead"
                            @mark-all-read="store.markAllNotificationsRead" @clear-all="store.clearNotifications" />


                        <div class="hidden sm:block h-6 w-px bg-gray-200 dark:bg-white/10 mx-1"></div>

                        <!-- New Shipment Button -->
                        <router-link to="/vendor/create-shipment"
                            class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center gap-2 text-sm shadow-sm">
                            <span class="material-symbols-outlined text-[18px]">add</span>
                            <span class="hidden sm:inline">New Shipment</span>
                        </router-link>
                    </div>
                </div>
            </header>

            <!-- Page Content -->
            <div class="flex-1 p-4 sm:p-6 lg:p-8">
                <slot />
            </div>
        </main>
    </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import VendorSidebar from '../IV-components/VendorSidebar.vue'
import HeaderWeather from '@/components/HeaderWeather.vue'
import NotificationPopover from '@/components/NotificationPopover.vue'
import ThemeToggle from '@/components/ThemeToggle.vue'
import { useLogisticStore } from '@/stores/logisticStore'

const store = useLogisticStore()
const isSidebarOpen = ref(false)
const route = useRoute()

// Close sidebar on route change
watch(route, () => {
    isSidebarOpen.value = false
})
</script>
