<template>
    <div
        class="min-h-screen bg-background-light dark:bg-background-dark font-display text-gray-900 dark:text-white antialiased flex relative">

        <!-- Mobile Overlay -->
        <div v-if="isSidebarOpen" @click="isSidebarOpen = false"
            class="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"></div>

        <!-- Sidebar -->
        <IndividualSidebar :is-open="isSidebarOpen" @close="isSidebarOpen = false" />

        <!-- Main Content Area -->
        <main
            class="flex-1 lg:ml-64 min-h-screen flex flex-col transition-all duration-300 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-green-500/5 dark:from-green-900/10 via-surface-light dark:via-background-dark to-surface-light dark:to-background-dark">

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
                        <h1 class="text-base sm:text-xl font-bold text-gray-900 dark:text-white">Welcome, {{
                            store.user.name.split(' ')[0] }}! 👋</h1>
                        <div class="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                            <span class="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                            Personal moves made easy.
                        </div>
                    </div>
                </div>

                <div class="flex items-center gap-2 sm:gap-4">
                    <!-- Quick Metrics (hidden on mobile) -->
                    <div class="hidden md:flex gap-4 border-r border-gray-200 dark:border-white/10 pr-4">
                        <div class="text-right flex flex-col items-end">
                            <div class="text-[10px] text-gray-500 uppercase font-bold">Wallet Balance</div>
                            <button @click="showAddFundsModal = true"
                                class="flex items-center gap-1 hover:bg-gray-100 dark:hover:bg-white/5 px-2 py-0.5 -mr-2 rounded transition-colors text-sm font-bold text-green-600 dark:text-green-400">
                                <span class="material-symbols-outlined text-[16px]">account_balance_wallet</span>
                                ₹{{ store.walletBalance.toLocaleString() }}
                            </button>
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

                        <!-- Book New Move Button -->
                        <router-link to="/individual/book-move"
                            class="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center gap-2 text-sm shadow-sm">
                            <span class="material-symbols-outlined text-[18px]">add</span>
                            <span class="hidden sm:inline">Book Move</span>
                        </router-link>
                    </div>
                </div>
            </header>

            <!-- Page Content -->
            <div class="flex-1 p-4 sm:p-6 lg:p-8">
                <slot />
            </div>

            <!-- Add Funds Modal -->
            <Teleport to="body">
                <div v-if="showAddFundsModal"
                    class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div
                        class="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden animate-slide-up border border-gray-100 dark:border-white/10">
                        <div class="p-6">
                            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                                <span class="material-symbols-outlined text-green-500">account_balance_wallet</span>
                                Add Funds
                            </h3>
                            <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">Top up your wallet balance.</p>

                            <div class="space-y-4 mb-6">
                                <div>
                                    <label
                                        class="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">Amount</label>
                                    <div class="relative">
                                        <span
                                            class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">₹</span>
                                        <input type="number" v-model.number="addAmount"
                                            class="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl pl-8 pr-4 py-3 text-lg font-bold text-gray-900 dark:text-white outline-none focus:border-green-500 transition-colors"
                                            placeholder="0">
                                    </div>
                                </div>
                                <div class="flex gap-2">
                                    <button v-for="amt in [500, 1000, 5000]" :key="amt" @click="addAmount = amt"
                                        class="flex-1 py-2 rounded-lg border border-gray-200 dark:border-white/10 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-500/10 hover:border-green-500 hover:text-green-600 dark:hover:text-green-400 transition-all">+₹{{
                                        amt }}</button>
                                </div>
                            </div>

                            <div class="flex gap-3">
                                <button @click="showAddFundsModal = false; addAmount = null"
                                    class="flex-1 py-3 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-white font-bold rounded-xl transition-colors">Cancel</button>
                                <button @click="submitAddFunds" :disabled="!addAmount || addAmount <= 0"
                                    class="flex-1 py-3 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:hover:bg-green-600 text-white font-bold rounded-xl transition-colors">Add
                                    ₹{{ addAmount || 0 }}</button>
                            </div>
                        </div>
                    </div>
                </div>
            </Teleport>

        </main>
    </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import IndividualSidebar from '../IV-components/IndividualSidebar.vue'
import HeaderWeather from '@/components/HeaderWeather.vue'
import NotificationPopover from '@/components/NotificationPopover.vue'
import { useIndividualStore } from '@/stores/individualStore'

const store = useIndividualStore()
const isSidebarOpen = ref(false)
const route = useRoute()
const showAddFundsModal = ref(false)
const addAmount = ref(null)

function submitAddFunds() {
    if (addAmount.value && addAmount.value > 0) {
        store.addFunds(addAmount.value)
        showAddFundsModal.value = false
        addAmount.value = null
    }
}

// Close sidebar on route change
watch(route, () => {
    isSidebarOpen.value = false
})
</script>
