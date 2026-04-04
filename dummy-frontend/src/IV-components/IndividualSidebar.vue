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
                                ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
                        ]">
                        <!-- Active Indicator -->
                        <div v-if="$route.path === item.route"
                            class="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-green-500 rounded-r-full"></div>

                        <span class="material-symbols-outlined mr-3 text-[20px]"
                            :class="$route.path === item.route ? 'text-green-500' : 'text-gray-500 group-hover:text-gray-900 dark:group-hover:text-white'">
                            {{ item.icon }}
                        </span>
                        <span class="text-sm font-medium">{{ item.label }}</span>
                        <span v-if="item.badge"
                            class="ml-auto bg-green-500 text-white font-bold text-[10px] px-1.5 py-0.5 rounded-full">
                            {{ item.badge }}
                        </span>
                    </router-link>
                </li>
            </ul>

            <!-- Move Metrics -->
            <div class="mt-8 px-4">
                <div class="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Move Metrics</div>
                <div class="grid grid-cols-2 gap-2">
                    <div v-for="m in moveMetrics" :key="m.id"
                        class="bg-gray-100 dark:bg-white/5 rounded p-2 text-center border border-gray-200 dark:border-white/5 transition-colors cursor-default"
                        :class="[
                            m.status === 'Alert' ? 'hover:border-amber-500/50' :
                                m.status === 'Critical' ? 'hover:border-red-500/50' :
                                    m.status === 'Good' ? 'hover:border-green-500/50' : 'hover:border-blue-500/50'
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

            <!-- AI Promo -->
            <div class="mt-6 px-4">
                <router-link to="/individual/estimator"
                    class="block p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 dark:from-purple-600/20 dark:to-blue-600/20 border border-purple-200 dark:border-white/5 hover:border-purple-400 dark:hover:border-purple-500/30 transition-colors">
                    <div class="flex items-center gap-2 mb-2">
                        <span class="material-symbols-outlined text-purple-500 dark:text-purple-400">psychology</span>
                        <span class="text-xs font-bold text-gray-900 dark:text-white">AI Assistant</span>
                    </div>
                    <p class="text-[10px] text-gray-500 dark:text-gray-400 mb-3">Need help estimating your move? Upload
                        a photo.</p>
                    <span
                        class="w-full py-1.5 bg-purple-500 hover:bg-purple-600 text-white text-xs font-bold rounded-lg transition-colors block text-center">Try
                        Now</span>
                </router-link>
            </div>
        </nav>

        <!-- User Profile with Context Menu -->
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
                                class="material-symbols-outlined text-[20px] text-green-500 dark:text-green-400">person</span>
                            Profile
                        </button>

                        <!-- ID Card -->
                        <button @click="showIdCardModal = true"
                            class="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5 flex items-center gap-3 transition-colors">
                            <span
                                class="material-symbols-outlined text-[20px] text-green-500 dark:text-green-400">badge</span>
                            Customer ID Card
                        </button>

                        <!-- Appearance Toggle -->
                        <div class="w-full px-4 py-2.5 flex items-center gap-3">
                            <span
                                class="material-symbols-outlined text-[20px] text-green-500 dark:text-green-400 transition-all duration-300">
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
                    class="w-9 h-9 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center ring-1 ring-black/5 dark:ring-white/10">
                    <span class="font-bold text-xs text-white">{{ store.userInitials }}</span>
                </div>
                <div class="flex-1 min-w-0">
                    <div class="text-sm font-medium text-gray-900 dark:text-white truncate">{{ store.user.name }}</div>
                    <div class="text-xs text-gray-500 dark:text-gray-500 truncate">Individual User</div>
                </div>
                <span class="material-symbols-outlined text-gray-500 dark:text-gray-400">more_vert</span>
            </div>
        </div>
    </aside>

    <!-- Profile Modal -->
    <Teleport to="body">
        <BaseModal :isOpen="showProfileModal" @close="showProfileModal = false">
            <template #title>My Profile</template>
            <div class="space-y-6">
                <div class="flex items-center gap-4">
                    <div
                        class="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-2xl font-bold text-white border-2 border-green-500/30">
                        {{ store.userInitials }}
                    </div>
                    <div>
                        <h4 class="text-xl font-bold text-gray-900 dark:text-white">{{ store.user.name }}</h4>
                        <p class="text-gray-500">Individual User</p>
                        <div
                            class="mt-2 text-xs bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400 px-2 py-0.5 rounded-full inline-block">
                            Active</div>
                    </div>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="p-3 bg-gray-50 dark:bg-white/5 rounded-lg">
                        <div class="text-xs text-gray-500 mb-1">Email</div>
                        <div class="font-medium text-sm text-gray-900 dark:text-white">{{ store.user.email }}</div>
                    </div>
                    <div class="p-3 bg-gray-50 dark:bg-white/5 rounded-lg">
                        <div class="text-xs text-gray-500 mb-1">Phone</div>
                        <div class="font-medium text-sm text-gray-900 dark:text-white">{{ store.user.phone }}</div>
                    </div>
                    <div class="p-3 bg-gray-50 dark:bg-white/5 rounded-lg">
                        <div class="text-xs text-gray-500 mb-1">Address</div>
                        <div class="font-medium text-sm text-gray-900 dark:text-white">{{ store.user.address }}</div>
                    </div>
                    <div class="p-3 bg-gray-50 dark:bg-white/5 rounded-lg">
                        <div class="text-xs text-gray-500 mb-1">Total Spent</div>
                        <div class="font-medium text-sm text-gray-900 dark:text-white">₹{{
                            store.totalSpent.toLocaleString() }}
                        </div>
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
            <template #title>{{ idCardData.cardTitle }}</template>
            <div class="flex justify-center w-full">
                <IdCard :employee="idCardData" />
            </div>
            <template #footer>
                <button @click="showIdCardModal = false"
                    class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">Close</button>
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
import { buildIdCardProfile } from '@/utils/idCardProfile'
import ThemeToggle from '@/components/ThemeToggle.vue'
import { useIndividualStore } from '@/stores/individualStore'

defineProps({ isOpen: Boolean })
defineEmits(['close'])

const store = useIndividualStore()

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
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
})

onUnmounted(() => {
    if (themeObserver) themeObserver.disconnect()
})

const idCardData = computed(() => buildIdCardProfile({
    user: {
        ...authStore.user,
        name: authStore.user?.name || store.user.name,
        email: authStore.user?.email || store.user.email,
        phone: authStore.user?.phone || store.user.phone,
        address: authStore.user?.address || store.user.address,
        joiningDate: authStore.user?.created_at || authStore.user?.createdAt || store.user.joiningDate,
    },
    role: authStore.user?.role || 'customer',
    roleLabel: 'Customer',
    designation: store.user.tier || 'Customer',
    department: 'Personal Moves',
    address: authStore.user?.address || store.user.address,
    phone: authStore.user?.phone || store.user.phone,
    email: authStore.user?.email || store.user.email,
}))

const router = useRouter()
const authStore = useAuthStore()

const handleLogout = async () => {
    showLogoutConfirm.value = false
    isMenuOpen.value = false
    await authStore.logout()
    router.push('/login')
}

const menuItems = [
    { label: 'Dashboard', icon: 'dashboard', route: '/individual/dashboard' },
    { label: 'Book a Move', icon: 'local_shipping', route: '/individual/book-move' },
    { label: 'My Orders', icon: 'receipt_long', route: '/individual/orders', badge: String(store.orders.length) },
    { label: 'Quotes', icon: 'request_quote', route: '/individual/quotes' },
    { label: 'AI Estimator', icon: 'camera_enhance', route: '/individual/estimator' },
    { label: 'Tracking', icon: 'gps_fixed', route: '/individual/tracking' },
    { label: 'Payments', icon: 'credit_card', route: '/individual/payments' },
    { label: 'Damage Report', icon: 'report', route: '/individual/damage-report' },
    { label: 'Support Chat', icon: 'support_agent', route: '/individual/support' },
    { label: 'Profile', icon: 'person', route: '/individual/profile' },
    { label: 'Settings', icon: 'settings', route: '/individual/settings' },
]

const moveMetrics = ref([
    { id: 'mm1', name: 'Active', value: String(store.activeOrders.length), status: 'Normal' },
    { id: 'mm2', name: 'Pending', value: String(store.pendingOrders.length), status: 'Alert' },
    { id: 'mm3', name: 'Delivered', value: String(store.deliveredOrders.length), status: 'Good' },
    { id: 'mm4', name: 'Issues', value: String(store.damageReports.length), status: store.damageReports.length > 0 ? 'Critical' : 'Good' },
])
</script>
