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
                                ? 'bg-blue-500/10 text-blue-500'
                                : 'text-gray-400 hover:bg-white/5 hover:text-white'
                        ]">
                        <!-- Active Indicator -->
                        <div v-if="$route.path === item.route"
                            class="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r-full"></div>

                        <span class="material-symbols-outlined mr-3 text-[20px]"
                            :class="$route.path === item.route ? 'text-blue-500' : 'text-gray-500 group-hover:text-white'">
                            {{ item.icon }}
                        </span>
                        <span class="text-sm font-medium">{{ item.label }}</span>
                        <span v-if="item.badge"
                            class="ml-auto bg-blue-500 text-white font-bold text-[10px] px-1.5 py-0.5 rounded-full">
                            {{ item.badge }}
                        </span>
                    </router-link>
                </li>
            </ul>
        </nav>

        <!-- Business Profile -->
        <div class="p-4 border-t border-white/5">
            <div class="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors">
                <div class="w-9 h-9 rounded bg-white p-1 flex items-center justify-center">
                    <img src="https://via.placeholder.com/150" alt="Logo" class="w-full h-full object-contain">
                </div>
                <div class="flex-1 min-w-0">
                    <div class="text-sm font-medium text-white truncate">Acme Logistics</div>
                    <div class="text-xs text-gray-500 truncate">Enterprise Partner</div>
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
    { label: 'Dashboard', icon: 'dashboard', route: '/vendor/dashboard' },
    { label: 'Create Shipment', icon: 'add_box', route: '/vendor/create-shipment' },
    { label: 'Recurring Orders', icon: 'update', route: '/vendor/recurring' },
    { label: 'Bulk Upload', icon: 'upload_file', route: '/vendor/bulk-upload' },
    { label: 'Shipment Tracking', icon: 'local_shipping', route: '/vendor/tracking' },
    { label: 'Invoices', icon: 'receipt', route: '/vendor/invoices', badge: '2' },
    { label: 'Analytics', icon: 'analytics', route: '/vendor/analytics' },
    { label: 'Support', icon: 'help_center', route: '/vendor/support' },
    { label: 'Settings', icon: 'settings', route: '/vendor/settings' },
]
</script>
