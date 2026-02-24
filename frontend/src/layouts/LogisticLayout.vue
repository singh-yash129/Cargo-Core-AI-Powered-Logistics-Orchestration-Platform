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
                    <!-- Warehouse Switcher (Hidden on Global Pages) -->
                    <div v-if="!isGlobalPage" class="relative group">
                        <button @click="store.openModal('warehouse-select')"
                            class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors border border-gray-200 dark:border-white/5">
                            <span
                                class="material-symbols-outlined text-gray-500 dark:text-gray-400 text-[18px]">public</span>
                            <span class="text-sm font-medium text-gray-700 dark:text-white">{{ store.activeWarehouseName
                            }}</span>
                            <span class="material-symbols-outlined text-gray-500 text-[18px]">arrow_drop_down</span>
                        </button>
                    </div>

                    <!-- Static Header for Global Pages -->
                    <div v-else
                        class="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-primary/10 border border-primary/20 dark:bg-primary/20 dark:border-primary/30 shadow-sm cursor-default">
                        <span class="material-symbols-outlined text-primary text-[18px]">
                            {{ route.path.includes('ai') ? 'smart_toy' : (route.path.includes('comparative') ? 'compare_arrows' : 'domain') }}
                        </span>
                        <span class="text-sm font-bold text-primary dark:text-blue-400 tracking-wide uppercase">
                            {{ route.path.includes('ai') ? 'Corporate AI Assistant' : (route.path.includes('comparative') ? 'Comparative Viewers' : 'Global Network Overview') }}
                        </span>
                    </div>

                    <!-- Breadcrumbs or Page Title could go here -->
                    <h1 class="text-lg font-semibold text-white/80 hidden">Dashboard</h1>
                </div>

                <div class="flex items-center gap-4">
                    <!-- Search Bar Moved to Dashboard -->

                    <!-- Weather & Clock Widget -->
                    <LogisticHeaderWeather />

                    <!-- Notifications -->
                    <NotificationPopover :notifications="store.notifications"
                        :unread-count="store.unreadNotificationsCount" @mark-read="store.markNotificationRead"
                        @mark-all-read="store.markAllNotificationsRead" @clear-all="store.clearNotifications" />

                    <!-- To-Do List -->
                    <LogisticHeaderTodo />

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
import LogisticHeaderWeather from '@/LWD-components/LogisticHeaderWeather.vue'
import LogisticHeaderTodo from '@/LWD-components/LogisticHeaderTodo.vue'
import ThemeToggle from '@/components/ThemeToggle.vue'
import { useLogisticStore } from '@/stores/logisticStore'
import { useRoute } from 'vue-router'
import { computed } from 'vue'

const store = useLogisticStore()
const route = useRoute()

const isGlobalPage = computed(() => {
    return route.path.includes('/logistic/warehouses') || route.path.includes('/logistic/ai') || route.path.includes('/logistic/comparative-viewers')
})
</script>
