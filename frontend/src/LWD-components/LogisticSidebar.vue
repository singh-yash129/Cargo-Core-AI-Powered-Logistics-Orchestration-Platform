<template>
    <aside
        class="w-64 h-screen bg-surface-light dark:bg-card-darker border-r border-gray-200 dark:border-white/5 flex flex-col fixed left-0 top-0 z-50">
        <!-- Logo area -->
        <div class="h-16 flex items-center px-6 border-b border-gray-200 dark:border-white/5 gap-3">
            <img src="@/assets/cargo-core-logo.png" alt="Cargo-Core Logo" class="h-8 w-auto" />
            <div class="text-xl font-bold text-primary tracking-wide">Cargo-Core</div>
        </div>

        <!-- Navigation -->
        <nav class="flex-1 overflow-y-auto py-4 no-scrollbar">
            <ul class="space-y-1 px-3">
                <li v-for="item in menuItems" :key="item.name">
                    <router-link :to="item.route"
                        class="flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 group" :class="[
                            $route.path === item.route
                                ? 'bg-primary/10 text-primary'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
                        ]">
                        <span class="material-symbols-outlined mr-3 text-[20px]"
                            :class="$route.path === item.route ? 'text-primary' : 'text-gray-500 group-hover:text-gray-900 dark:group-hover:text-white'">
                            {{ item.icon }}
                        </span>
                        <span class="text-sm font-medium">{{ item.label }}</span>
                        <span v-if="item.badge"
                            class="ml-auto bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                            {{ item.badge }}
                        </span>
                    </router-link>
                </li>
            </ul>

            <!-- Pinned Warehouses Section -->
            <div class="mt-6 px-4">
                <div class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Pinned Warehouses</div>
                <div class="space-y-2">
                    <div v-for="hub in store.pinnedHubs" :key="hub.id" @click="store.setWarehouse(hub.id)"
                        class="flex items-center justify-between p-2 rounded bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 cursor-pointer transition-colors group">
                        <div class="flex items-center">
                            <span class="w-1.5 h-1.5 rounded-full bg-primary mr-2"></span>
                            <span
                                class="text-sm text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white truncate max-w-[120px]">{{
                                    hub.name }}</span>
                        </div>
                        <span class="material-symbols-outlined text-[14px] text-yellow-400">star</span>
                    </div>
                    <button @click="store.openModal('warehouse-select')"
                        class="flex items-center text-xs text-gray-500 hover:text-primary mt-2 transition-colors">
                        <span class="material-symbols-outlined text-[14px] mr-1">add</span>
                        Manage list
                    </button>
                </div>
            </div>
        </nav>

        <!-- User Profile -->
        <div class="p-4 border-t border-gray-200 dark:border-white/5">
            <div
                class="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 cursor-pointer transition-colors">
                <div
                    class="w-9 h-9 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center ring-1 ring-black/5 dark:ring-white/10">
                    <span class="font-bold text-xs text-gray-700 dark:text-white">LM</span>
                </div>
                <div class="flex-1 min-w-0">
                    <div class="text-sm font-medium text-gray-900 dark:text-white truncate">Logistics Admin</div>
                    <div class="text-xs text-gray-500 truncate">System Owner</div>
                </div>
                <span class="material-symbols-outlined text-gray-400">more_vert</span>
            </div>
        </div>
    </aside>
</template>

<script setup>
import { useLogisticStore } from '@/stores/logisticStore'

const store = useLogisticStore()

const menuItems = [
    { label: 'Dashboard', icon: 'dashboard', route: '/logistic/dashboard' },
    { label: 'Warehouse Mgmt', icon: 'warehouse', route: '/logistic/warehouses' },
    { label: 'User & Roles', icon: 'admin_panel_settings', route: '/logistic/users' },
    { label: 'Fleet & Drivers', icon: 'local_shipping', route: '/logistic/fleet' },
    { label: 'Geofencing', icon: 'map', route: '/logistic/geofencing' },
    { label: 'Finance & Payroll', icon: 'payments', route: '/logistic/finance' },
    { label: 'Reverse Logistics', icon: 'undo', route: '/logistic/reverse-logistics' },
    { label: 'Reports', icon: 'bar_chart', route: '/logistic/reports' },
    { label: 'AI Intelligence', icon: 'smart_toy', route: '/logistic/ai' },
    { label: 'Communication', icon: 'chat', route: '/logistic/communication', badge: '3' },
]
</script>
