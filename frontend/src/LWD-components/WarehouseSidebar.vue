<template>
    <aside
        class="w-64 h-screen bg-[#0F1115] border-r border-white/5 flex flex-col fixed left-0 top-0 z-50 shadow-[4px_0_24px_rgba(0,0,0,0.4)]">
        <!-- Logo area -->
        <div
            class="h-16 flex items-center px-6 border-b border-white/5 bg-gradient-to-r from-teal-500/10 to-transparent gap-3">
            <img src="@/assets/cargo-core-logo.png" alt="Cargo-Core Logo" class="h-8 w-auto" />
            <div class="text-xl font-bold text-teal-400 tracking-wide">Cargo-Core 
            </div>
        </div>

        <!-- Navigation -->
        <nav class="flex-1 overflow-y-auto py-4 no-scrollbar">
            <ul class="space-y-1 px-3">
                <li v-for="item in menuItems" :key="item.name">
                    <router-link :to="item.route"
                        class="flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 group" :class="[
                            $route.path === item.route
                                ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20'
                                : 'text-gray-400 hover:bg-white/5 hover:text-white border border-transparent'
                        ]">
                        <span class="material-symbols-outlined mr-3 text-[20px]"
                            :class="$route.path === item.route ? 'text-teal-400' : 'text-gray-500 group-hover:text-white'">
                            {{ item.icon }}
                        </span>
                        <span class="text-sm font-medium">{{ item.label }}</span>
                        <span v-if="item.badge"
                            class="ml-auto bg-amber-500 text-black text-[10px] font-bold px-1.5 py-0.5 rounded">
                            {{ item.badge }}
                        </span>
                    </router-link>
                </li>
            </ul>

            <!-- Floor Map Preview (Mini) -->
            <div class="mt-8 px-4">
                <div class="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Zone Status</div>
                <div class="grid grid-cols-2 gap-2">
                    <div
                        class="bg-white/5 rounded p-2 text-center border border-white/5 hover:border-teal-500/50 cursor-pointer transition-colors">
                        <div class="text-xs text-gray-400">Zone A</div>
                        <div class="text-teal-400 font-bold">92%</div>
                    </div>
                    <div
                        class="bg-white/5 rounded p-2 text-center border border-white/5 hover:border-red-500/50 cursor-pointer transition-colors">
                        <div class="text-xs text-gray-400">Zone B</div>
                        <div class="text-red-400 font-bold">Full</div>
                    </div>
                    <div
                        class="bg-white/5 rounded p-2 text-center border border-white/5 hover:border-teal-500/50 cursor-pointer transition-colors">
                        <div class="text-xs text-gray-400">Zone C</div>
                        <div class="text-teal-400 font-bold">45%</div>
                    </div>
                    <div
                        class="bg-white/5 rounded p-2 text-center border border-white/5 hover:border-yellow-500/50 cursor-pointer transition-colors">
                        <div class="text-xs text-gray-400">Cold Chain</div>
                        <div class="text-yellow-400 font-bold">Alert</div>
                    </div>
                </div>
            </div>
        </nav>

        <!-- Manager Profile -->
        <div class="p-4 border-t border-white/5 bg-black/20">
            <div class="flex items-center gap-3">
                <img src="https://i.pravatar.cc/150?u=wm" class="w-8 h-8 rounded-full border border-teal-500/30">
                <div>
                    <div class="text-sm font-bold text-white">Alex Chen</div>
                    <div class="text-[10px] text-teal-400">Warehouse Manager</div>
                </div>
            </div>
        </div>
    </aside>
</template>

<script setup>
const menuItems = [
    { label: 'Overview', icon: 'grid_view', route: '/warehouse/dashboard' },
    { label: 'Inventory', icon: 'inventory', route: '/warehouse/inventory' },
    { label: 'Inbound', icon: 'input', route: '/warehouse/inbound', badge: '12' },
    { label: 'Floor Plan', icon: 'map', route: '/warehouse/floor-plan' },
    { label: 'Picking', icon: 'shopping_basket', route: '/warehouse/picking' },
    { label: 'Loading Dock', icon: 'local_shipping', route: '/warehouse/dock' },
    { label: 'Returns', icon: 'assignment_return', route: '/warehouse/returns' },
    { label: 'Labor Mgmt', icon: 'groups', route: '/warehouse/labor' },
    { label: 'Smart WMS', icon: 'psychology', route: '/warehouse/ai' },
]
</script>
