<template>
    <aside
        class="w-64 h-screen bg-card-darker border-r border-white/5 flex flex-col fixed left-0 top-0 z-50 transition-transform duration-300 transform md:translate-x-0"
        :class="isOpen ? 'translate-x-0' : '-translate-x-full'">
        <!-- Logo area -->
        <div class="h-16 flex items-center justify-between px-6 border-b border-white/5">
            <div class="text-xl font-bold text-white tracking-wide">Quad<span class="text-purple-500">AI</span></div>
            <!-- Mobile Close Button -->
            <button @click="$emit('close')" class="md:hidden text-gray-400 hover:text-white">
                <span class="material-symbols-outlined">close</span>
            </button>
        </div>

        <!-- Navigation -->
        <nav class="flex-1 overflow-y-auto py-4 no-scrollbar">
            <ul class="space-y-1 px-3">
                <li v-for="item in menuItems" :key="item.name">
                    <router-link :to="item.route"
                        class="flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 group relative"
                        :class="[
                            $route.path === item.route
                                ? 'bg-purple-500/10 text-purple-400'
                                : 'text-gray-400 hover:bg-white/5 hover:text-white'
                        ]">
                        <!-- Active Indicator -->
                        <div v-if="$route.path === item.route"
                            class="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-purple-500 rounded-r-full"></div>

                        <span class="material-symbols-outlined mr-3 text-[20px]"
                            :class="$route.path === item.route ? 'text-purple-400' : 'text-gray-500 group-hover:text-white'">
                            {{ item.icon }}
                        </span>
                        <span class="text-sm font-medium">{{ item.label }}</span>
                        <span v-if="item.badge"
                            class="ml-auto bg-red-500 text-white font-bold text-[10px] px-1.5 py-0.5 rounded-full">
                            {{ item.badge }}
                        </span>
                    </router-link>
                </li>
            </ul>

            <!-- AI Status -->
            <div class="mt-6 px-4">
                <div class="p-4 rounded-xl bg-gradient-to-br from-purple-600/20 to-blue-600/20 border border-white/5">
                    <div class="flex items-center gap-2 mb-2">
                        <span class="relative flex h-2 w-2">
                            <span
                                class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span class="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        <span class="text-xs font-bold text-white">AI Engine Online</span>
                    </div>
                    <p class="text-[10px] text-gray-400">Processing live streams & support tickets.</p>
                </div>
            </div>
        </nav>

        <!-- User Profile -->
        <div class="p-4 border-t border-white/5">
            <div class="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors">
                <div
                    class="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center ring-1 ring-white/10">
                    <span class="material-symbols-outlined text-white text-sm">smart_toy</span>
                </div>
                <div class="flex-1 min-w-0">
                    <div class="text-sm font-medium text-white truncate">AI Admin</div>
                    <div class="text-xs text-gray-500 truncate">System Manager</div>
                </div>
                <span class="material-symbols-outlined text-gray-400">more_vert</span>
            </div>
        </div>
    </aside>
</template>

<script setup>
defineProps({
    isOpen: Boolean
})
defineEmits(['close'])

const menuItems = [
    { label: 'Dashboard', icon: 'dashboard', route: '/ai/dashboard' },
    { label: 'Live Conversations', icon: 'chat', route: '/ai/live-conversations', badge: '3' },
    { label: 'Escalations', icon: 'warning', route: '/ai/escalations', badge: '1' },
    { label: 'Tickets', icon: 'confirmation_number', route: '/ai/tickets' },
    { label: 'Reverse Logistics', icon: 'assignment_return', route: '/ai/reverse-logistics' },
    { label: 'Refund Center', icon: 'currency_exchange', route: '/ai/refund-center' },
    { label: 'AI Analytics', icon: 'analytics', route: '/ai/analytics' },
    { label: 'Knowledge Base', icon: 'menu_book', route: '/ai/knowledge-base' },
    { label: 'Legal & Rules', icon: 'gavel', route: '/ai/legal' },
    { label: 'Settings', icon: 'settings', route: '/ai/settings' },
]
</script>
