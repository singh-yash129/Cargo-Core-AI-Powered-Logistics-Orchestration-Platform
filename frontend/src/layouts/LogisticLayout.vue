<template>
    <div
        class="min-h-screen bg-background-light dark:bg-background-dark text-gray-900 dark:text-white font-display antialiased flex">
        <!-- Sidebar -->
        <LogisticSidebar />

        <!-- Main Content Area -->
        <main class="flex-1 ml-64 min-h-screen flex flex-col transition-all duration-300">
            <!-- Top Bar with Warehouse Switcher -->
            <header
                class="h-16 px-8 flex items-center justify-between border-b border-gray-200 dark:border-white/5 bg-surface-light/80 dark:bg-background-dark/80 backdrop-blur-md sticky top-0 z-40">
                <div class="flex items-center gap-4">
                    <!-- Warehouse Switcher -->
                    <div class="relative group">
                        <button @click="store.openModal('warehouse-select')"
                            class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors border border-gray-200 dark:border-white/5">
                            <span
                                class="material-symbols-outlined text-gray-500 dark:text-gray-400 text-[18px]">public</span>
                            <span class="text-sm font-medium text-gray-700 dark:text-white">{{ store.activeWarehouseName
                                }}</span>
                            <span class="material-symbols-outlined text-gray-500 text-[18px]">arrow_drop_down</span>
                        </button>
                    </div>

                    <!-- Breadcrumbs or Page Title could go here -->
                    <h1 class="text-lg font-semibold text-white/80 hidden">Dashboard</h1>
                </div>

                <div class="flex items-center gap-4">
                    <!-- Search -->
                    <div class="relative flex items-center">
                        <input v-if="store.isSearchOpen" v-model="store.searchQuery" type="text"
                            placeholder="Search drivers, alerts..."
                            class="w-80 md:w-96 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-1.5 text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-primary/50 transition-all mr-2"
                            autoFocus />
                        <button @click="store.toggleSearch"
                            class="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-white/5 transition-colors text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                            :class="{ 'bg-gray-200 dark:bg-white/10 text-gray-900 dark:text-white': store.isSearchOpen }">
                            <span class="material-symbols-outlined text-[20px]">search</span>
                        </button>
                    </div>

                    <!-- Notifications -->
                    <NotificationPopover :notifications="store.notifications"
                        :unread-count="store.unreadNotificationsCount" @mark-read="store.markNotificationRead"
                        @mark-all-read="store.markAllNotificationsRead" @clear-all="store.clearNotifications" />

                    <!-- Theme Toggle -->
                    <ThemeToggle />
                </div>
            </header>

            <!-- Page Content -->
            <div class="flex-1 p-8 overflow-y-auto overflow-x-hidden">
                <slot />
            </div>

            <!-- Global Modals for Logistic Layout -->
            <WarehouseSelectorModal :is-open="store.activeModal === 'warehouse-select'" :hubs="store.hubs"
                :active-id="store.activeWarehouse" @close="store.closeModal()" @select="store.setWarehouse" />
        </main>
    </div>
</template>

<script setup>
import LogisticSidebar from '../LWD-components/LogisticSidebar.vue'
import WarehouseSelectorModal from '@/LWD-components/WarehouseSelectorModal.vue'
import NotificationPopover from '@/LWD-components/NotificationPopover.vue'
import ThemeToggle from '@/components/ThemeToggle.vue'
import { useLogisticStore } from '@/stores/logisticStore'

const store = useLogisticStore()
</script>
