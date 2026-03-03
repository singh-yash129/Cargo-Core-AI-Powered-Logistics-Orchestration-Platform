<template>
    <aside
        class="w-64 h-screen bg-surface-light dark:bg-card-darker border-r border-gray-200 dark:border-white/5 flex flex-col fixed left-0 top-0 z-50 transition-transform duration-300 transform lg:translate-x-0"
        :class="isOpen ? 'translate-x-0' : '-translate-x-full'">
        <!-- Logo area -->
        <div class="h-16 flex items-center justify-between px-6 border-b border-gray-200 dark:border-white/5">
            <div class="flex items-center gap-3">
                <img src="@/assets/cargo-core-logo.png" alt="Cargo-Core Logo" class="h-8 w-auto" />
                <div class="text-xl font-bold text-primary tracking-wide">Cargo-Core</div>
            </div>
            <!-- Mobile Close Button -->
            <button @click="$emit('close')"
                class="lg:hidden text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
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
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
                        ]">
                        <!-- Active Indicator -->
                        <div v-if="$route.path === item.route"
                            class="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r-full"></div>

                        <span class="material-symbols-outlined mr-3 text-[20px]"
                            :class="$route.path === item.route ? 'text-blue-500' : 'text-gray-500 group-hover:text-gray-900 dark:group-hover:text-white'">
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

            <!-- Vendor Metrics -->
            <div class="mt-8 px-4">
                <div class="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Vendor Metrics</div>
                <div class="grid grid-cols-2 gap-2">
                    <div v-for="m in vendorMetrics" :key="m.id"
                        class="bg-gray-100 dark:bg-white/5 rounded p-2 text-center border border-gray-200 dark:border-white/5 transition-colors cursor-default"
                        :class="[
                            m.status === 'Alert' ? 'hover:border-amber-500/50' :
                                m.status === 'Critical' ? 'hover:border-red-500/50' : 'hover:border-blue-500/50'
                        ]">
                        <div class="text-xs text-gray-500 dark:text-gray-400 font-medium">{{ m.name }}</div>
                        <div class="font-bold mt-1" :class="[
                            m.status === 'Alert' ? 'text-amber-500 dark:text-yellow-400' :
                                m.status === 'Critical' ? 'text-red-500 dark:text-red-400' :
                                    m.status === 'Good' ? 'text-green-500 dark:text-green-400' : 'text-blue-500'
                        ]">{{ m.value }}</div>
                    </div>
                </div>
            </div>
        </nav>

        <!-- Business Profile with Context Menu -->
        <div class="p-4 border-t border-gray-200 dark:border-white/5 relative" @mouseenter="isMenuOpen = true"
            @mouseleave="isMenuOpen = false">

            <!-- Context Menu -->
            <transition enter-active-class="transition duration-200 ease-out"
                enter-from-class="transform scale-95 opacity-0 translate-y-2"
                enter-to-class="transform scale-100 opacity-100 translate-y-0"
                leave-active-class="transition duration-150 ease-in"
                leave-from-class="transform scale-100 opacity-100 translate-y-0"
                leave-to-class="transform scale-95 opacity-0 translate-y-2">
                <div v-if="isMenuOpen"
                    class="absolute bottom-full left-4 right-4 mb-2 bg-white dark:bg-card-dark rounded-xl shadow-xl border border-gray-200 dark:border-white/10 overflow-hidden z-50">
                    <div class="py-1">
                        <!-- Profile -->
                        <button @click="showProfileModal = true"
                            class="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5 flex items-center gap-3 transition-colors">
                            <span
                                class="material-symbols-outlined text-[20px] text-blue-500 dark:text-blue-400">person</span>
                            Profile
                        </button>

                        <!-- ID Card -->
                        <button @click="showIdCardModal = true"
                            class="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5 flex items-center gap-3 transition-colors">
                            <span
                                class="material-symbols-outlined text-[20px] text-blue-500 dark:text-blue-400">badge</span>
                            Business ID Card
                        </button>

                        <!-- Appearance Toggle -->
                        <div class="w-full px-4 py-2.5 flex items-center gap-3">
                            <span
                                class="material-symbols-outlined text-[20px] text-blue-500 dark:text-blue-400 transition-all duration-300">
                                {{ isDark ? 'dark_mode' : 'light_mode' }}
                            </span>
                            <span class="text-sm text-gray-700 dark:text-gray-200 flex-1">Appearance</span>
                            <ThemeToggle />
                        </div>

                        <div class="border-t border-gray-200 dark:border-white/5 my-1"></div>

                        <!-- Logout -->
                        <button @click="showLogoutConfirm = true"
                            class="w-full text-left px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-3 transition-colors">
                            <span class="material-symbols-outlined text-[20px]">logout</span>
                            Logout
                        </button>
                    </div>
                </div>
            </transition>

            <div
                class="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 cursor-pointer transition-colors relative z-10">
                <div
                    class="w-9 h-9 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                    <span class="font-bold text-xs text-blue-600 dark:text-blue-400">{{ vendorInitials }}</span>
                </div>
                <div class="flex-1 min-w-0">
                    <div class="text-sm font-medium text-gray-900 dark:text-white truncate">{{ vendorName }}</div>
                    <div class="text-xs text-gray-500 dark:text-gray-500 truncate">{{ vendorTier }}</div>
                </div>
                <span class="material-symbols-outlined text-gray-500 dark:text-gray-400">more_vert</span>
            </div>
        </div>
    </aside>

    <!-- Profile Modal -->
    <Teleport to="body">
        <BaseModal :isOpen="showProfileModal" @close="showProfileModal = false">
            <template #title>Vendor Profile</template>
            <div class="space-y-6">
                <div class="flex items-center gap-4">
                    <div
                        class="w-20 h-20 rounded-xl bg-blue-500/20 border-2 border-blue-500/30 flex items-center justify-center text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {{ vendorInitials }}
                    </div>
                    <div>
                        <h4 class="text-xl font-bold text-gray-900 dark:text-white">{{ vendorName }}</h4>
                        <p class="text-gray-500">{{ vendorTier }}</p>
                        <div
                            class="mt-2 text-xs bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 px-2 py-0.5 rounded-full inline-block">
                            Active
                        </div>
                    </div>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="p-3 bg-gray-50 dark:bg-white/5 rounded-lg">
                        <div class="text-xs text-gray-500 mb-1">Email Address</div>
                        <div class="font-medium text-sm text-gray-900 dark:text-white">{{ vendorEmail }}</div>
                    </div>
                    <div class="p-3 bg-gray-50 dark:bg-white/5 rounded-lg">
                        <div class="text-xs text-gray-500 mb-1">Vendor ID</div>
                        <div class="font-medium text-sm text-gray-900 dark:text-white">VND-2049</div>
                    </div>
                    <div class="p-3 bg-gray-50 dark:bg-white/5 rounded-lg">
                        <div class="text-xs text-gray-500 mb-1">Business Type</div>
                        <div class="font-medium text-sm text-gray-900 dark:text-white">Logistics & Freight</div>
                    </div>
                    <div class="p-3 bg-gray-50 dark:bg-white/5 rounded-lg">
                        <div class="text-xs text-gray-500 mb-1">Last Login</div>
                        <div class="font-medium text-sm text-gray-900 dark:text-white">Today, 09:30 AM</div>
                    </div>
                </div>
            </div>
            <template #footer>
                <button @click="showProfileModal = false"
                    class="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">Close</button>
            </template>
        </BaseModal>
    </Teleport>

    <!-- ID Card Modal -->
    <Teleport to="body">
        <BaseModal :isOpen="showIdCardModal" @close="showIdCardModal = false">
            <template #title>Business ID Card</template>
            <div class="flex justify-center w-full">
                <IdCard :employee="vendorCardData" />
            </div>
            <template #footer>
                <button @click="showIdCardModal = false"
                    class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Close
                </button>
            </template>
        </BaseModal>
    </Teleport>

    <!-- Logout Confirmation Modal -->
    <Teleport to="body">
        <div v-if="showLogoutConfirm"
            class="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            @click.self="showLogoutConfirm = false">
            <div
                class="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden border border-gray-100 dark:border-white/10 p-6">
                <div class="flex items-center gap-3 mb-4">
                    <div class="w-12 h-12 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center">
                        <span class="material-symbols-outlined text-red-500 text-2xl">logout</span>
                    </div>
                    <div>
                        <h3 class="text-lg font-bold text-gray-900 dark:text-white">Confirm Logout</h3>
                        <p class="text-sm text-gray-500 dark:text-gray-400">Are you sure you want to sign out?</p>
                    </div>
                </div>
                <div class="flex gap-3">
                    <button @click="showLogoutConfirm = false"
                        class="flex-1 py-2.5 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-white font-bold rounded-xl transition-colors">
                        Cancel
                    </button>
                    <button @click="handleLogout"
                        class="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors">
                        Logout
                    </button>
                </div>
            </div>
        </div>
    </Teleport>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import BaseModal from '@/components/BaseModal.vue'
import IdCard from '@/components/IdCard.vue'
import ThemeToggle from '@/components/ThemeToggle.vue'

defineProps({
    isOpen: Boolean
})
defineEmits(['close'])

// Menu & Modal State
const isMenuOpen = ref(false)
const showProfileModal = ref(false)
const showIdCardModal = ref(false)
const showLogoutConfirm = ref(false)

// Dark mode tracking for dynamic icon
const isDark = ref(true)
let themeObserver = null

onMounted(() => {
    isDark.value = document.documentElement.classList.contains('dark')
    themeObserver = new MutationObserver(() => {
        isDark.value = document.documentElement.classList.contains('dark')
    })
    themeObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class']
    })
})

onUnmounted(() => {
    if (themeObserver) themeObserver.disconnect()
})

// Vendor Data
const vendorName = ref('Acme Logistics')
const vendorTier = ref('Enterprise Partner')
const vendorEmail = ref('contact@acmelogistics.com')
const vendorInitials = computed(() => {
    return vendorName.value
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2)
})

const vendorCardData = {
    name: 'Acme Logistics',
    id: 'VND-2049',
    designation: 'Enterprise Partner',
    department: 'Commercial Vendor',
    address: '45, Trade Park, Mumbai - 400001',
    phone: '+91 0000000000',
    email: 'contact@acmelogistics.com',
    joinDate: '01 March 2024',
    validUntil: '28 February 2027',
    emergencyContact: {
        name: 'Support Desk',
        relation: 'Account Manager',
        phone: '+91 0000000000'
    }
}

const router = useRouter()
const authStore = useAuthStore()

const handleLogout = async () => {
    showLogoutConfirm.value = false
    isMenuOpen.value = false
    await authStore.logout()
    router.push('/login')
}

const menuItems = [
    { label: 'Dashboard', icon: 'dashboard', route: '/vendor/dashboard' },
    { label: 'Create Shipment', icon: 'add_box', route: '/vendor/create-shipment' },
    { label: 'Orders', icon: 'list_alt', route: '/vendor/orders' },
    { label: 'Recurring Orders', icon: 'update', route: '/vendor/recurring' },
    { label: 'Bulk Upload', icon: 'upload_file', route: '/vendor/bulk-upload' },
    { label: 'Shipment Tracking', icon: 'local_shipping', route: '/vendor/tracking' },
    { label: 'Proof of Delivery', icon: 'verified', route: '/vendor/proof-of-delivery' },
    { label: 'Invoices', icon: 'receipt', route: '/vendor/invoices', badge: '2' },
    { label: 'Analytics', icon: 'analytics', route: '/vendor/analytics' },
    { label: 'Support', icon: 'help_center', route: '/vendor/support' },
    { label: 'Settings', icon: 'settings', route: '/vendor/settings' },
]

const vendorMetrics = ref([
    { id: 'vm1', name: 'Active', value: '34', status: 'Normal' },
    { id: 'vm2', name: 'Pending', value: '12', status: 'Alert' },
    { id: 'vm3', name: 'Delivered', value: '189', status: 'Good' },
    { id: 'vm4', name: 'Issues', value: '2', status: 'Critical' },
])
</script>
