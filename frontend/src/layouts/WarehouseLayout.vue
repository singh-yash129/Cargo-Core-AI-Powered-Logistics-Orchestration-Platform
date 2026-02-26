<template>
    <div
        class="min-h-screen bg-background-light dark:bg-background-dark text-gray-900 dark:text-white font-display antialiased flex">
        <!-- Sidebar -->
        <WarehouseSidebar />

        <!-- Main Content Area -->
        <main
            class="flex-1 ml-64 min-h-screen flex flex-col transition-all duration-300 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 dark:from-teal-900/10 via-surface-light dark:via-background-dark to-surface-light dark:to-background-dark">

            <!-- Top Bar -->
            <header
                class="h-16 px-8 flex items-center justify-between border-b border-gray-200 dark:border-white/5 bg-surface-light/80 dark:bg-background-dark/80 backdrop-blur-md sticky top-0 z-40">
                <div>
                    <h1 class="text-xl font-bold text-gray-900 dark:text-white">North-East Distribution Hub</h1>
                    <div class="text-xs text-gray-400 flex items-center gap-2">
                        <span class="w-1.5 h-1.5 rounded-full bg-teal-400"></span>
                        Operational • Shift A (06:00 - 14:00)
                    </div>
                </div>

                <div class="flex items-center gap-6">
                    <!-- Quick Metrics in Header -->
                    <div class="flex gap-4 border-r border-gray-200 dark:border-white/10 pr-6">
                        <div class="text-right">
                            <div class="text-[10px] text-gray-500 uppercase">Capacity</div>
                            <div class="text-sm font-bold text-teal-500 dark:text-teal-400">84%</div>
                        </div>
                        <div class="text-right">
                            <div class="text-[10px] text-gray-500 uppercase">Pending</div>
                            <div class="text-sm font-bold text-gray-900 dark:text-white">1,204</div>
                        </div>
                    </div>

                    <div class="flex items-center gap-3">
                        <!-- Weather & Clock Widget -->
                        <HeaderWeather />

                        <!-- Notifications -->
                        <NotificationPopover :notifications="store.notifications"
                            :unread-count="store.unreadNotificationsCount" @mark-read="store.markNotificationRead"
                            @mark-all-read="store.markAllNotificationsRead" @clear-all="store.clearNotifications" />

                        <!-- Meeting Scheduler -->
                        <HeaderMeetingScheduler />

                        <!-- To-Do List -->
                        <HeaderTodo />

                        <!-- Theme Toggle -->
                        <ThemeToggle />

                        <div class="h-6 w-px bg-gray-200 dark:bg-white/10 mx-2"></div>

                        <button
                            class="w-10 h-10 rounded-full flex items-center justify-center bg-teal-500 text-white hover:bg-teal-600 dark:text-black dark:hover:bg-teal-400 transition-colors shadow-sm">
                            <span class="material-symbols-outlined">qr_code_scanner</span>
                        </button>
                    </div>
                </div>
            </header>

            <!-- Page Content -->
            <div class="flex-1 p-8 overflow-y-auto">
                <slot />
            </div>
        </main>
    </div>
</template>

<script setup>
import WarehouseSidebar from '../LWD-components/WarehouseSidebar.vue'
import HeaderWeather from '@/components/HeaderWeather.vue'
import HeaderTodo from '@/components/HeaderTodo.vue'
import HeaderMeetingScheduler from '@/components/HeaderMeetingScheduler.vue'
import NotificationPopover from '@/components/NotificationPopover.vue'
import ThemeToggle from '@/components/ThemeToggle.vue'
import { useLogisticStore } from '@/stores/logisticStore'

const store = useLogisticStore()
</script>
