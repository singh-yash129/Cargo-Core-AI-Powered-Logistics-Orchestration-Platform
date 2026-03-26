<template>
    <div
        class="min-h-screen bg-background-light dark:bg-background-dark text-gray-900 dark:text-white font-display antialiased flex">

        <!-- Mobile Overlay -->
        <div v-if="sidebarOpen" class="fixed inset-0 bg-black/50 z-40 lg:hidden" @click="sidebarOpen = false"></div>

        <!-- Sidebar -->
        <div :class="sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'"
            class="fixed inset-y-0 left-0 z-50 transition-transform duration-300">
            <WarehouseSidebar />
        </div>

        <!-- Main Content Area -->
        <main
            class="flex-1 lg:ml-64 min-h-screen flex flex-col transition-all duration-300 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 dark:from-teal-900/10 via-surface-light dark:via-background-dark to-surface-light dark:to-background-dark">

            <!-- Top Bar -->
            <header
                class="h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between border-b border-gray-200 dark:border-white/5 bg-surface-light/80 dark:bg-background-dark/80 backdrop-blur-md sticky top-0 z-40">
                <div class="flex items-center gap-3">
                    <!-- Mobile Menu Toggle -->
                    <button @click="sidebarOpen = !sidebarOpen"
                        class="lg:hidden p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
                        <span class="material-symbols-outlined">menu</span>
                    </button>
                    <div>
                        <h1 class="text-base sm:text-xl font-bold text-gray-900 dark:text-white">North-East Distribution
                            Hub</h1>
                        <div class="text-xs text-gray-400 flex items-center gap-2">
                            <span class="w-1.5 h-1.5 rounded-full bg-teal-400"></span>
                            Operational • Shift A (06:00 - 14:00)
                        </div>
                    </div>
                </div>

                <div class="flex items-center gap-2 sm:gap-6">
                    <!-- Quick Metrics in Header (hidden on mobile) -->
                    <div class="hidden md:flex gap-4 border-r border-gray-200 dark:border-white/10 pr-6">
                        <div class="text-right">
                            <div class="text-[10px] text-gray-500 uppercase">Capacity</div>
                            <div class="text-sm font-bold text-teal-500 dark:text-teal-400">84%</div>
                        </div>
                        <div class="text-right">
                            <div class="text-[10px] text-gray-500 uppercase">Pending</div>
                            <div class="text-sm font-bold text-gray-900 dark:text-white">1,204</div>
                        </div>
                    </div>

                    <div class="flex items-center gap-1 sm:gap-3">
                        <!-- Weather & Clock Widget (hidden on small mobile) -->
                        <div class="hidden sm:block">
                            <HeaderWeather hub-id="1" />
                        </div>

                        <!-- Notifications -->
                        <NotificationPopover :notifications="store.notifications"
                            :unread-count="store.unreadNotificationsCount" @mark-read="store.markNotificationRead"
                            @mark-all-read="store.markAllNotificationsRead" @clear-all="store.clearNotifications" />

                        <!-- Meeting Scheduler -->
                        <div class="hidden sm:block">
                            <HeaderMeetingScheduler />
                        </div>

                        <!-- To-Do List -->
                        <div class="hidden sm:block">
                            <HeaderTodo />
                        </div>

                        <!-- Theme Toggle -->
                        <ThemeToggle />

                        <div class="hidden sm:block h-6 w-px bg-gray-200 dark:bg-white/10 mx-2"></div>

                        <button @click="isScannerOpen = true"
                            class="hidden sm:flex w-10 h-10 rounded-full items-center justify-center bg-teal-500 text-white hover:bg-teal-600 dark:text-black dark:hover:bg-teal-400 transition-colors shadow-sm">
                            <span class="material-symbols-outlined">qr_code_scanner</span>
                        </button>
                    </div>
                </div>
            </header>

            <!-- Global Scanner/Camera Modal -->
            <SmartScannerModal :is-open="isScannerOpen" @close="isScannerOpen = false" @scan="handleGlobalScan"
                @camera="handleGlobalCamera" />

            <!-- Page Content -->
            <div class="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto overflow-x-hidden">
                <slot />
            </div>
        </main>
    </div>
</template>

<script setup>
import { ref, provide } from 'vue'
import WarehouseSidebar from '../LWD-components/WarehouseSidebar.vue'
import HeaderWeather from '@/components/HeaderWeather.vue'
import HeaderTodo from '@/components/HeaderTodo.vue'
import HeaderMeetingScheduler from '@/components/HeaderMeetingScheduler.vue'
import NotificationPopover from '@/components/NotificationPopover.vue'
import ThemeToggle from '@/components/ThemeToggle.vue'
import SmartScannerModal from '@/components/SmartScannerModal.vue'
import { useLogisticStore } from '@/stores/logisticStore'
import { useRouter } from 'vue-router'

const store = useLogisticStore()
const router = useRouter()
const sidebarOpen = ref(false)

// Global Scanner State & Provide (so children can open it)
const isScannerOpen = ref(false)
const scannerActiveTab = ref('scan')

provide('openScanner', (tab = 'scan') => {
    scannerActiveTab.value = tab
    isScannerOpen.value = true
})

// Used by children to read the last scan globally if they don't have their own modal
const lastGlobalScan = ref(null)
provide('lastGlobalScan', lastGlobalScan)

const handleGlobalScan = (barcode) => {
    lastGlobalScan.value = barcode
    console.log("[Global Header Scanner] Received:", barcode)
    // Optional: Global logic could navigate based on barcode format, for now just log/store.
}

const handleGlobalCamera = (image) => {
    console.log("[Global Header Camera] Captured:", image)
}
</script>
