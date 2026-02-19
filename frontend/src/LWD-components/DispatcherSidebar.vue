<template>
    <aside class="w-64 h-screen bg-card-darker border-r border-white/5 flex flex-col fixed left-0 top-0 z-50">
        <!-- Logo area -->
        <div class="h-16 flex items-center px-6 border-b border-white/5 bg-primary/5 gap-3">
            <img src="@/assets/cargo-core-logo.png" alt="Cargo-Core Logo" class="h-8 w-auto" />
            <div class="text-xl font-bold text-white tracking-wide">Cargo-Core </div>
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
                        <span v-if="item.alert"
                            class="ml-auto bg-red-500 text-white font-bold text-[10px] px-1.5 py-0.5 rounded-full animate-pulse">
                            {{ item.alert }}
                        </span>
                    </router-link>
                </li>
            </ul>

            <!-- Operational Status -->
            <div class="mt-auto px-4 pb-6 pt-4 border-t border-white/5">
                <div class="glass-panel p-3 rounded-xl bg-gradient-to-br from-gray-800/50 to-gray-900/50">
                    <div class="flex items-center justify-between mb-2">
                        <span class="text-xs font-semibold text-gray-400">SYSTEM STATUS</span>
                        <span class="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
                    </div>
                    <div class="space-y-2">
                        <div class="flex justify-between text-xs">
                            <span class="text-gray-500">Active Routes</span>
                            <span class="text-white font-mono">42</span>
                        </div>
                        <div class="flex justify-between text-xs">
                            <span class="text-gray-500">Pending</span>
                            <span class="text-yellow-400 font-mono">8</span>
                        </div>
                    </div>
                </div>
            </div>
        </nav>

        <!-- User Profile -->
        <div class="p-4 border-t border-white/5">
            <div class="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors">
                <div
                    class="w-9 h-9 rounded-full bg-gradient-to-br from-blue-700 to-blue-800 flex items-center justify-center ring-1 ring-white/10">
                    <span class="font-bold text-xs text-white">DP</span>
                </div>
                <div class="flex-1 min-w-0">
                    <div class="text-sm font-medium text-white truncate">Dispatcher Mike</div>
                    <div class="text-xs text-gray-500 truncate">Regional Ops</div>
                </div>
                <span class="material-symbols-outlined text-gray-400">more_vert</span>
            </div>
        </div>
    </aside>
</template>

<script setup>
const menuItems = [
    { label: 'Dispatch Board', icon: 'dashboard_customize', route: '/dispatcher/dashboard' },
    { label: 'Route Optimization', icon: 'alt_route', route: '/dispatcher/optimization' },
    { label: 'Driver Management', icon: 'badge', route: '/dispatcher/drivers' },
    { label: 'Manifest Center', icon: 'inventory_2', route: '/dispatcher/manifest' },
    { label: 'Crisis Management', icon: 'emergency_home', route: '/dispatcher/crisis', alert: '!' },
    { label: 'Communication Hub', icon: 'forum', route: '/dispatcher/communication', badge: '5' },
    { label: 'Performance Metrics', icon: 'monitoring', route: '/dispatcher/performance' },
    { label: 'Smart Dispatcher', icon: 'psychology', route: '/dispatcher/ai-assistant' },
]
</script>
