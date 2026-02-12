<template>
    <div class="dark min-h-screen bg-background-dark text-white font-display antialiased flex">
        <!-- Sidebar -->
        <WarehouseSidebar />

        <!-- Main Content Area -->
        <main
            class="flex-1 ml-64 min-h-screen flex flex-col transition-all duration-300 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal-900/10 via-background-dark to-background-dark">

            <!-- Top Bar -->
            <header
                class="h-16 px-8 flex items-center justify-between border-b border-white/5 bg-background-dark/95 backdrop-blur-md sticky top-0 z-40">
                <div>
                    <h1 class="text-xl font-bold text-white">North-East Distribution Hub</h1>
                    <div class="text-xs text-gray-400 flex items-center gap-2">
                        <span class="w-1.5 h-1.5 rounded-full bg-teal-400"></span>
                        Operational • Shift A (06:00 - 14:00)
                    </div>
                </div>

                <div class="flex items-center gap-6">
                    <!-- Quick Metrics in Header -->
                    <div class="flex gap-4 border-r border-white/10 pr-6">
                        <div class="text-right">
                            <div class="text-[10px] text-gray-500 uppercase">Capacity</div>
                            <div class="text-sm font-bold text-teal-400">84%</div>
                        </div>
                        <div class="text-right">
                            <div class="text-[10px] text-gray-500 uppercase">Pending</div>
                            <div class="text-sm font-bold text-white">1,204</div>
                        </div>
                    </div>

                    <div class="flex items-center gap-3">
                        <button
                            class="w-10 h-10 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 text-white transition-colors relative">
                            <span class="material-symbols-outlined">notifications</span>
                            <span class="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500"></span>
                        </button>
                        <button
                            class="w-10 h-10 rounded-full flex items-center justify-center bg-teal-500 text-black hover:bg-teal-400 transition-colors">
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
</script>
