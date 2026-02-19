<template>
    <aside
        class="w-64 h-screen bg-card-darker border-r border-white/5 flex flex-col fixed left-0 top-0 z-50 transition-transform duration-300 transform md:translate-x-0"
        :class="isOpen ? 'translate-x-0' : '-translate-x-full'">
        <!-- Logo area -->
        <div class="h-16 flex items-center justify-between px-6 border-b border-white/5">
            <div class="flex items-center gap-3">
                <img src="@/assets/cargo-core-logo.png" alt="Cargo-Core Logo" class="h-8 w-auto" />
                <div class="text-xl font-bold text-white tracking-wide">Cargo-Core </div>
            </div>
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
                                ? 'bg-primary/10 text-primary'
                                : 'text-gray-400 hover:bg-white/5 hover:text-white'
                        ]">
                        <!-- Active Indicator -->
                        <div v-if="$route.path === item.route"
                            class="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full"></div>

                        <span class="material-symbols-outlined mr-3 text-[20px]"
                            :class="$route.path === item.route ? 'text-primary' : 'text-gray-500 group-hover:text-white'">
                            {{ item.icon }}
                        </span>
                        <span class="text-sm font-medium">{{ item.label }}</span>
                        <span v-if="item.badge"
                            class="ml-auto bg-primary text-background-dark font-bold text-[10px] px-1.5 py-0.5 rounded-full">
                            {{ item.badge }}
                        </span>
                    </router-link>
                </li>
            </ul>

            <!-- AI Promo -->
            <div class="mt-6 px-4">
                <div class="p-4 rounded-xl bg-gradient-to-br from-purple-600/20 to-blue-600/20 border border-white/5">
                    <div class="flex items-center gap-2 mb-2">
                        <span class="material-symbols-outlined text-purple-400">psychology</span>
                        <span class="text-xs font-bold text-white">AI Assistant</span>
                    </div>
                    <p class="text-[10px] text-gray-400 mb-3">Need help estimating your move? Upload a photo.</p>
                    <button
                        class="w-full py-1.5 bg-purple-500 hover:bg-purple-600 text-white text-xs font-bold rounded-lg transition-colors">Try
                        Now</button>
                </div>
            </div>
        </nav>

        <!-- User Profile -->
        <div class="p-4 border-t border-white/5">
            <div class="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors">
                <div
                    class="w-9 h-9 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center ring-1 ring-white/10">
                    <span class="material-symbols-outlined text-white text-sm">person</span>
                </div>
                <div class="flex-1 min-w-0">
                    <div class="text-sm font-medium text-white truncate">Alex Johnson</div>
                    <div class="text-xs text-gray-500 truncate">Individual User</div>
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
    { label: 'Dashboard', icon: 'dashboard', route: '/individual/dashboard' },
    { label: 'Book a Move', icon: 'local_shipping', route: '/individual/book-move' },
    { label: 'My Orders', icon: 'receipt_long', route: '/individual/orders' },
    { label: 'Quotes', icon: 'request_quote', route: '/individual/quotes' },
    { label: 'AI Estimator', icon: 'camera_enhance', route: '/individual/estimator' },
    { label: 'Payments', icon: 'credit_card', route: '/individual/payments' },
    { label: 'Support Chat', icon: 'support_agent', route: '/individual/support' },
    { label: 'Profile', icon: 'person', route: '/individual/profile' },
]
</script>
