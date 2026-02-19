<template>
    <div class="min-h-screen bg-background-dark font-display text-white flex flex-col md:flex-row relative">
        <!-- Mobile Header -->
        <div
            class="md:hidden h-16 bg-card-darker border-b border-white/5 flex items-center justify-between px-4 fixed top-0 left-0 right-0 z-40">
            <div class="text-xl font-bold text-white tracking-wide">Cargo-Core <span class="text-primary">Move</span>
            </div>
            <button @click="isSidebarOpen = true" class="text-white p-2">
                <span class="material-symbols-outlined">menu</span>
            </button>
        </div>

        <!-- Sidebar -->
        <IndividualSidebar :is-open="isSidebarOpen" @close="isSidebarOpen = false" />

        <!-- Overlay -->
        <div v-if="isSidebarOpen" @click="isSidebarOpen = false"
            class="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"></div>

        <!-- Main Content -->
        <main class="flex-1 md:ml-64 p-4 md:p-8 overflow-y-auto h-screen mt-16 md:mt-0">
            <!-- Header (Desktop only or adjusted) -->
            <header class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 class="text-2xl font-bold">Welcome back, Alex! 👋</h1>
                    <p class="text-gray-400 text-sm">Managing your personal moves made easy.</p>
                </div>
                <div class="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                    <button class="p-2 hover:bg-white/5 rounded-full relative">
                        <span class="material-symbols-outlined text-gray-400">notifications</span>
                        <span class="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full"></span>
                    </button>
                    <button
                        class="bg-primary hover:bg-primary-dark text-background-dark font-bold py-2 px-6 rounded-lg transition-colors flex items-center gap-2 text-sm md:text-base">
                        <span class="material-symbols-outlined">add</span> Book New Move
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
import IndividualSidebar from '../IV-components/IndividualSidebar.vue'

const isSidebarOpen = ref(false)
const route = useRoute()

// Close sidebar on route change
watch(route, () => {
    isSidebarOpen.value = false
})
</script>
