<template>
    <div class="dark min-h-screen bg-background-dark text-white font-display antialiased flex">
        <!-- Sidebar -->
        <LogisticSidebar />

        <!-- Main Content Area -->
        <main class="flex-1 ml-64 min-h-screen flex flex-col transition-all duration-300">
            <!-- Top Bar with Warehouse Switcher -->
            <header
                class="h-16 px-8 flex items-center justify-between border-b border-white/5 bg-background-dark/80 backdrop-blur-md sticky top-0 z-40">
                <div class="flex items-center gap-4">
                    <!-- Warehouse Switcher -->
                    <div class="relative group">
                        <button
                            class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/5">
                            <span class="material-symbols-outlined text-gray-400 text-[18px]">public</span>
                            <span class="text-sm font-medium">All Warehouses</span>
                            <span class="material-symbols-outlined text-gray-500 text-[18px]">arrow_drop_down</span>
                        </button>
                    </div>

                    <!-- Breadcrumbs or Page Title could go here -->
                    <h1 class="text-lg font-semibold text-white/80 hidden">Dashboard</h1>
                </div>

                <div class="flex items-center gap-4">
                    <!-- Quick Actions -->
                    <button
                        class="w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/5 transition-colors text-gray-400 hover:text-white">
                        <span class="material-symbols-outlined text-[20px]">search</span>
                    </button>
                    <button
                        class="w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/5 transition-colors text-gray-400 hover:text-white relative">
                        <span class="material-symbols-outlined text-[20px]">notifications</span>
                        <span
                            class="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 border border-background-dark"></span>
                    </button>
                </div>
            </header>

            <!-- Page Content -->
            <div class="flex-1 p-8 overflow-y-auto overflow-x-hidden">
                <slot />
            </div>
        </main>
    </div>
</template>

<script setup>
import LogisticSidebar from '../LWD-components/LogisticSidebar.vue'
</script>
