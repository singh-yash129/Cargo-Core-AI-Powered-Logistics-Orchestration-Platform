<template>
    <div class="min-h-screen bg-background-dark font-display text-white flex flex-col md:flex-row relative">
        <!-- Mobile Header -->
        <div
            class="md:hidden h-16 bg-card-darker border-b border-white/5 flex items-center justify-between px-4 fixed top-0 left-0 right-0 z-40">
            <div class="text-xl font-bold text-white tracking-wide">Cargo-Core <span class="text-blue-500">Vendor</span>
            </div>
            <button @click="isSidebarOpen = true" class="text-white p-2">
                <span class="material-symbols-outlined">menu</span>
            </button>
        </div>

        <!-- Sidebar -->
        <VendorSidebar :is-open="isSidebarOpen" @close="isSidebarOpen = false" />

        <!-- Overlay -->
        <div v-if="isSidebarOpen" @click="isSidebarOpen = false"
            class="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"></div>

        <!-- Main Content -->
        <main class="flex-1 md:ml-64 p-4 md:p-8 overflow-y-auto h-screen mt-16 md:mt-0">
            <!-- Header (Desktop only or adjusted) -->
            <header class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 class="text-2xl font-bold">Vendor Portal</h1>
                    <p class="text-gray-400 text-sm">Manage your commercial shipments.</p>
                </div>
                <div class="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                    <div class="text-right mr-4 hidden md:block">
                        <div class="text-xs text-gray-400">Credit Balance</div>
                        <div class="text-lg font-bold text-green-400">$12,450.00</div>
                    </div>
                    <button
                        class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors flex items-center gap-2 text-sm md:text-base">
                        <span class="material-symbols-outlined">add</span> New Shipment
                    </button>
                </div>
            </header>

            <!-- Page Content -->
            <slot />
        </main>
    </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import VendorSidebar from '../IV-components/VendorSidebar.vue'

const isSidebarOpen = ref(false)
const route = useRoute()

// Close sidebar on route change
watch(route, () => {
    isSidebarOpen.value = false
})
</script>
