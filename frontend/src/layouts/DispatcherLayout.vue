<template>
    <div
        class="min-h-screen bg-background-light dark:bg-background-dark text-gray-900 dark:text-white font-display antialiased flex">

        <!-- Mobile Overlay -->
        <div v-if="sidebarOpen" class="fixed inset-0 bg-black/50 z-40 lg:hidden" @click="sidebarOpen = false"></div>

        <!-- Sidebar -->
        <div :class="sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'"
            class="fixed inset-y-0 left-0 z-50 transition-transform duration-300">
            <DispatcherSidebar />
        </div>

        <!-- Main Content Area -->
        <main
            class="flex-1 lg:ml-64 min-h-screen flex flex-col transition-all duration-300 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 dark:from-primary/5 via-surface-light dark:via-background-dark to-surface-light dark:to-background-dark">

            <!-- Top Bar -->
            <header
                class="h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between border-b border-gray-200 dark:border-white/5 bg-surface-light/80 dark:bg-background-dark/80 backdrop-blur-md sticky top-0 z-40">
                <div class="flex items-center gap-3">
                    <!-- Mobile Menu Toggle -->
                    <button @click="sidebarOpen = !sidebarOpen"
                        class="lg:hidden p-2 rounded-lg bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                        <span class="material-symbols-outlined">menu</span>
                    </button>
                    <div>
                        <h1 class="text-base sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <span class="material-symbols-outlined text-primary text-[20px]">campaign</span>
                            Dispatch Console
                        </h1>
                        <div class="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                            <span class="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                            North-East Hub • Shift A (06:00 – 14:00)
                        </div>
                    </div>
                </div>

                <div class="flex items-center gap-2 sm:gap-6">
                    <!-- Quick Metrics in Header (hidden on mobile) -->
                    <div class="hidden md:flex gap-4 border-r border-gray-200 dark:border-white/10 pr-6">
                        <div class="text-right">
                            <div class="text-[10px] text-gray-500 uppercase">Active</div>
                            <div class="text-sm font-bold text-green-500 dark:text-green-400">18</div>
                        </div>
                        <div class="text-right">
                            <div class="text-[10px] text-gray-500 uppercase">Pending</div>
                            <div class="text-sm font-bold text-gray-900 dark:text-white">42</div>
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

                        <!-- New Service Button -->
                        <button @click="showNewMove = true"
                            class="hidden sm:flex h-10 rounded-lg items-center justify-center gap-2 bg-primary text-white hover:bg-primary-dark dark:text-black dark:hover:bg-primary-dark transition-colors shadow-sm px-4 text-xs font-bold">
                            <span class="material-symbols-outlined text-[16px]">add</span>
                            New Service
                        </button>
                    </div>
                </div>
            </header>

            <!-- Page Content - Responsive Padding -->
            <div class="flex-1 relative" :class="route.meta.fullWidth ? 'overflow-hidden p-0' : 'overflow-y-auto p-4 sm:p-6 lg:p-8'">
                <slot />
            </div>
        </main>

        <!-- New Service Move Modal -->
        <Teleport to="body">
        <div v-if="showNewMove" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center" @click.self="showNewMove = false">
            <div class="bg-white dark:bg-card-dark shadow-2xl border border-gray-200 dark:border-white/10 rounded-2xl p-6 w-full max-w-lg m-4">
                <h3 class="font-bold text-gray-900 dark:text-white mb-4">Create New Service Move</h3>
                <div class="space-y-3">
                    <input v-model="newMove.title" type="text" placeholder="Move Title (e.g., Johnson Family House Shift)"
                        class="w-full bg-gray-100 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none">
                    <select v-model="newMove.type" class="w-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none">
                        <option class="bg-white dark:bg-gray-800">House Shift</option><option class="bg-white dark:bg-gray-800">Office Shift</option><option class="bg-white dark:bg-gray-800">Warehouse Transfer</option>
                    </select>
                    <div class="grid grid-cols-2 gap-3">
                        <input v-model="newMove.pickup" type="text" placeholder="Pickup Address" class="w-full bg-gray-100 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none">
                        <input v-model="newMove.delivery" type="text" placeholder="Delivery Address" class="w-full bg-gray-100 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none">
                    </div>
                    <select v-model="newMove.vehicle" class="w-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none">
                        <option class="bg-white dark:bg-gray-800">Van T-15</option><option class="bg-white dark:bg-gray-800">Van T-20</option><option class="bg-white dark:bg-gray-800">Truck XL</option>
                    </select>
                    <textarea v-model="newMove.notes" rows="2" placeholder="Special notes..."
                        class="w-full bg-gray-100 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none"></textarea>
                </div>
                <div class="flex gap-2 mt-4">
                    <button @click="createServiceMove" :disabled="!newMove.title || !newMove.pickup"
                        class="flex-1 bg-primary text-black font-bold py-2 rounded-lg text-sm disabled:opacity-40 disabled:cursor-not-allowed">Create Move</button>
                    <button @click="showNewMove = false" class="flex-1 bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white py-2 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-white/20 transition-colors">Cancel</button>
                </div>
            </div>
        </div>
        </Teleport>
    </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRoute } from 'vue-router'
import DispatcherSidebar from '../LWD-components/DispatcherSidebar.vue'
import HeaderWeather from '@/components/HeaderWeather.vue'
import HeaderTodo from '@/components/HeaderTodo.vue'
import HeaderMeetingScheduler from '@/components/HeaderMeetingScheduler.vue'
import NotificationPopover from '@/components/NotificationPopover.vue'
import ThemeToggle from '@/components/ThemeToggle.vue'
import { useLogisticStore } from '@/stores/logisticStore'

const store = useLogisticStore()
const route = useRoute()
const sidebarOpen = ref(false)
const showNewMove = ref(false)
const newMove = reactive({ title: '', type: 'House Shift', pickup: '', delivery: '', vehicle: 'Van T-20', notes: '' })

const createServiceMove = () => {
    // Here you would typically save to backend or store
    console.log('Creating service move:', newMove)
    showNewMove.value = false
    // Reset form
    newMove.title = ''
    newMove.type = 'House Shift'
    newMove.pickup = ''
    newMove.delivery = ''
    newMove.vehicle = 'Van T-20'
    newMove.notes = ''
}
</script>
