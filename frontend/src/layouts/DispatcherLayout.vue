<template>
    <div class="dark min-h-screen bg-background-dark text-white font-display antialiased flex">
        <!-- Sidebar -->
        <DispatcherSidebar />

        <!-- Main Content Area -->
        <main
            class="flex-1 ml-64 min-h-screen flex flex-col transition-all duration-300 relative bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-background-dark to-background-dark">

            <!-- Top Bar -->
            <header
                class="h-14 px-6 flex items-center justify-between border-b border-white/5 bg-background-dark/80 backdrop-blur-md sticky top-0 z-40">
                <div class="flex items-center gap-4">
                    <h2 class="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                        <span class="material-symbols-outlined text-primary">campaign</span>
                        Dispatcher Console
                    </h2>
                    <div class="h-5 w-[1px] bg-white/10 mx-2"></div>
                    <div class="flex items-center gap-2 text-xs text-gray-400">
                        <span class="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                        Live Updates Active
                    </div>
                </div>

                <div class="flex items-center gap-3">
                    <button
                        class="bg-primary hover:bg-primary-dark text-background-dark text-xs font-bold px-4 py-1.5 rounded-md transition-colors flex items-center gap-2 shadow-[0_0_15px_rgba(28,231,131,0.3)]">
                        <span class="material-symbols-outlined text-[16px]">add</span>
                        New Order
                    </button>

                    <div
                        class="h-8 w-8 rounded-full bg-gray-800 flex items-center justify-center border border-white/10">
                        <span class="text-xs font-bold">DP</span>
                    </div>
                </div>
            </header>

            <!-- Page Content - Full Height for Map/Control Center feel -->
            <div class="flex-1 relative overflow-hidden">
                <slot />
            </div>
        </main>
    </div>
</template>

<script setup>
import DispatcherSidebar from '../LWD-components/DispatcherSidebar.vue'
</script>
