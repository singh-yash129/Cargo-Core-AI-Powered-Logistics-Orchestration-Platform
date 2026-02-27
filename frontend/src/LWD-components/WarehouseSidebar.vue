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
                            class="ml-auto bg-amber-500 text-black font-bold text-[10px] px-1.5 py-0.5 rounded-full">
                            {{ item.badge }}
                        </span>
                    </router-link>
                </li>
            </ul>

            <!-- Floor Map Preview (Mini) -->
            <div class="mt-8 px-4" :class="{ 'mt-2': $route.path.includes('/warehouse/comparative-viewers') }">
                <div class="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">
                    {{ $route.path.includes('/warehouse/comparative-viewers') ? 'Drag Zone' : 'Zone Status' }}
                </div>
                <div class="grid grid-cols-2 gap-2">
                    <div v-for="zone in availableZones" :key="zone.id"
                        :draggable="$route.path.includes('/warehouse/comparative-viewers')"
                        @dragstart="onDragStart($event, zone)"
                        class="bg-gray-100 dark:bg-white/5 rounded p-2 text-center border border-gray-200 dark:border-white/5 transition-colors group"
                        :class="[
                            $route.path.includes('/warehouse/comparative-viewers') ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer',
                            zone.status === 'Alert' ? 'hover:border-amber-500/50' :
                                zone.status === 'Full' ? 'hover:border-red-500/50' : 'hover:border-primary/50'
                        ]">
                        <div
                            class="text-xs text-gray-500 dark:text-gray-400 font-medium group-hover:text-gray-900 dark:group-hover:text-white flex items-center justify-center gap-1">
                            <span v-if="$route.path.includes('/warehouse/comparative-viewers')"
                                class="material-symbols-outlined text-[14px] text-gray-400 group-hover:text-primary transition-colors">drag_indicator</span>
                            {{ zone.name }}
                        </div>
                        <div class="font-bold flex items-center justify-center gap-1 mt-1" :class="[
                            zone.status === 'Alert' ? 'text-amber-500 dark:text-yellow-400' :
                                zone.status === 'Full' ? 'text-red-500 dark:text-red-400' : 'text-primary'
                        ]">
                            <div v-if="zone.color" class="w-2 h-2 rounded-full"
                                :style="{ backgroundColor: zone.color }"></div>
                            {{ zone.value }}
                        </div>
                    </div>
                </div>
            </div>
        </nav>

        <!-- User Profile -->
        <div class="p-4 border-t border-gray-200 dark:border-white/5 relative" @mouseenter="isUserMenuOpen = true"
            @mouseleave="isUserMenuOpen = false">

            <!-- Context Menu -->
            <transition enter-active-class="transition duration-200 ease-out"
                enter-from-class="transform scale-95 opacity-0 translate-y-2"
                enter-to-class="transform scale-100 opacity-100 translate-y-0"
                leave-active-class="transition duration-150 ease-in"
                leave-from-class="transform scale-100 opacity-100 translate-y-0"
                leave-to-class="transform scale-95 opacity-0 translate-y-2">
                <div v-if="isUserMenuOpen"
                    class="absolute bottom-full left-4 right-4 mb-2 bg-white dark:bg-card-dark rounded-xl shadow-xl border border-gray-200 dark:border-white/10 overflow-hidden z-50">
                    <div class="py-1">
                        <!-- Profile Option -->
                        <button @click="showProfileModal = true"
                            class="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5 flex items-center gap-3">
                            <span class="material-symbols-outlined text-[20px]">person</span>
                            Profile
                        </button>

                        <!-- Need Support Option -->
                        <div class="relative group/support">
                            <button @click="showSupportModal = true"
                                class="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5 flex items-center gap-3">
                                <span class="material-symbols-outlined text-[20px]">help</span>
                                Need Support
                            </button>
                            <!-- Tooltip/Hover for email -->
                            <div
                                class="hidden group-hover/support:block absolute left-full bottom-0 ml-2 p-2 bg-gray-900 text-white text-xs rounded whitespace-nowrap z-50">
                                {{ userEmail }}
                            </div>
                        </div>

                        <div class="border-t border-gray-200 dark:border-white/5 my-1"></div>

                        <!-- Logout Option -->
                        <button @click="handleLogout"
                            class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-3">
                            <span class="material-symbols-outlined text-[20px]">logout</span>
                            Logout
                        </button>
                    </div>
                </div>
            </transition>

            <div
                class="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 cursor-pointer transition-colors relative z-10">
                <div
                    class="w-9 h-9 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center ring-1 ring-black/5 dark:ring-white/10">
                    <span class="font-bold text-xs text-gray-700 dark:text-white">{{ userInitials }}</span>
                </div>
                <div class="flex-1 min-w-0">
                    <div class="text-sm font-medium text-gray-900 dark:text-white truncate">{{ userName }}</div>
                    <div class="text-xs text-gray-500 truncate">{{ userRole }}</div>
                </div>
                <span class="material-symbols-outlined text-gray-400">more_vert</span>
            </div>
        </div>
    </aside>

    <!-- Support Modal -->
    <Teleport to="body">
        <BaseModal :isOpen="showSupportModal" @close="showSupportModal = false">
            <template #title>Need Support?</template>
            <div class="space-y-4">
                <p class="text-gray-600 dark:text-gray-300">
                    Contact our support team for assistance with any issues or questions.
                </p>
                <div class="p-4 bg-gray-50 dark:bg-white/5 rounded-lg border border-gray-200 dark:border-white/10">
                    <div class="flex items-center gap-3 mb-2">
                        <span class="material-symbols-outlined text-primary">mail</span>
                        <span class="font-medium">Email Support</span>
                    </div>
                    <a :href="'mailto:' + userEmail" class="text-primary hover:underline block ml-9">{{ userEmail }}</a>
                </div>
                <div class="p-4 bg-gray-50 dark:bg-white/5 rounded-lg border border-gray-200 dark:border-white/10">
                    <div class="flex items-center gap-3 mb-2">
                        <span class="material-symbols-outlined text-primary">phone</span>
                        <span class="font-medium">Phone Support</span>
                    </div>
                    <a href="tel:+1234567890" class="text-gray-600 dark:text-gray-300 hover:text-primary block ml-9">+1
                        (234)
                        567-890</a>
                </div>
            </div>
            <template #footer>
                <button @click="showSupportModal = false"
                    class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors">
                    Close
                </button>
            </template>
        </BaseModal>
    </Teleport>

    <!-- Profile Modal -->
    <Teleport to="body">
        <BaseModal :isOpen="showProfileModal" @close="showProfileModal = false">
            <template #title>User Profile</template>
            <div class="space-y-6">
                <div class="flex items-center gap-4">
                    <div
                        class="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-2xl font-bold text-primary border-2 border-primary/20">
                        {{ userInitials }}
                    </div>
                    <div>
                        <h4 class="text-xl font-bold text-gray-900 dark:text-white">{{ userName }}</h4>
                        <p class="text-gray-500">{{ userRole }}</p>
                        <div class="mt-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full inline-block">
                            Active
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="p-3 bg-gray-50 dark:bg-white/5 rounded-lg">
                        <div class="text-xs text-gray-500 mb-1">Email Address</div>
                        <div class="font-medium text-sm">{{ userEmail }}</div>
                    </div>
                    <div class="p-3 bg-gray-50 dark:bg-white/5 rounded-lg">
                        <div class="text-xs text-gray-500 mb-1">Employee ID</div>
                        <div class="font-medium text-sm">WH-1049</div>
                    </div>
                    <div class="p-3 bg-gray-50 dark:bg-white/5 rounded-lg">
                        <div class="text-xs text-gray-500 mb-1">Department</div>
                        <div class="font-medium text-sm">Warehouse Operations</div>
                    </div>
                    <div class="p-3 bg-gray-50 dark:bg-white/5 rounded-lg">
                        <div class="text-xs text-gray-500 mb-1">Last Login</div>
                        <div class="font-medium text-sm">Today, 06:15 AM</div>
                    </div>
                </div>
            </div>
            <template #footer>
                <div class="flex justify-end gap-3">
                    <button @click="showProfileModal = false"
                        class="px-4 py-2 text-gray-600 hover:text-gray-900">Close</button>
                </div>
            </template>
        </BaseModal>
    </Teleport>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import BaseModal from '@/components/BaseModal.vue'
import { useWarehouseFloorStore } from '@/stores/warehouseFloorStore'

const store = useWarehouseFloorStore()

// State for User Menu and Modals
const isUserMenuOpen = ref(false)
const showSupportModal = ref(false)
const showProfileModal = ref(false)

// User Data
const userName = ref('Alex Chen')
const userRole = ref('Warehouse Manager')
const userEmail = ref('alex.chen@quadcore.dev')
const userInitials = computed(() => {
    return userName.value
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2)
})

const handleLogout = () => {
    console.log('Logging out...')
    // Add logout logic here
}

const menuItems = [
    { label: 'Overview', icon: 'grid_view', route: '/warehouse/dashboard' },
    { label: 'New Orders', icon: 'orders', route: '/warehouse/new-orders', badge: '7' },
    { label: 'Inventory', icon: 'inventory', route: '/warehouse/inventory' },
    { label: 'Inbound', icon: 'input', route: '/warehouse/inbound', badge: '12' },
    { label: 'Floor Plan', icon: 'map', route: '/warehouse/floor-plan' },
    { label: 'Picking', icon: 'shopping_basket', route: '/warehouse/picking' },
    { label: 'Packing Materials', icon: 'package_2', route: '/warehouse/packing-materials' },
    { label: 'Safety Stock', icon: 'notification_important', route: '/warehouse/safety-stock' },
    { label: 'Loading Dock', icon: 'local_shipping', route: '/warehouse/dock' },
    { label: 'Returns', icon: 'assignment_return', route: '/warehouse/returns' },
    { label: 'Labor Mgmt', icon: 'groups', route: '/warehouse/labor' },
    { label: 'Smart WMS', icon: 'psychology', route: '/warehouse/ai' },
    { label: 'Comparative Viewers', icon: 'compare_arrows', route: '/warehouse/comparative-viewers' },
]

// Mock zone data mapped to store groups if available, otherwise static fallback
const zones = ref([
    { id: 'g1', name: 'Zone A', value: '92%', status: 'Normal', color: store.presetColors[0] },
    { id: 'g2', name: 'Zone B', value: 'Full', status: 'Full', color: store.presetColors[1] },
    { id: 'g3', name: 'Zone C', value: '45%', status: 'Normal', color: store.presetColors[2] },
    { id: 'g4', name: 'Cold Chain', value: 'Alert', status: 'Alert', color: store.presetColors[6] }
])

// Sync with actual groups if they exist in the store
onMounted(() => {
    if (store.groups && store.groups.length > 0) {
        zones.value = store.groups.slice(0, 4).map((g, index) => {
            // Map some mock statuses based on index for the UI
            let status = 'Normal';
            let value = '45%';
            if (index === 0) value = '92%';
            if (index === 1) { status = 'Full'; value = 'Full'; }
            if (index === 3) { status = 'Alert'; value = 'Alert'; }

            return {
                id: g.id,
                name: g.name.substring(0, 10), // Keep name short for grid
                value: value,
                status: status,
                color: g.color || store.presetColors[index]
            }
        })
    }
})

const availableZones = computed(() => {
    // Only filter out if we are on the comparative viewer page and dragging
    if (store.comparedZones) {
        return zones.value.filter(z => !store.comparedZones.find(cz => cz.id === z.id))
    }
    return zones.value
})

const onDragStart = (event, zone) => {
    event.dataTransfer.effectAllowed = 'copy'
    event.dataTransfer.setData('zoneId', zone.id)
    event.dataTransfer.setData('text/plain', JSON.stringify(zone))
}
</script>
