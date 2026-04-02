<template>
  <aside
    class="w-64 h-screen bg-surface-light dark:bg-card-darker border-r border-gray-200 dark:border-white/5 flex flex-col fixed left-0 top-0 z-50 transition-transform duration-300 transform lg:translate-x-0"
    :class="isOpen ? 'translate-x-0' : '-translate-x-full'"
  >
    <div class="h-16 flex items-center justify-between px-6 border-b border-gray-200 dark:border-white/5">
      <div class="flex items-center gap-3">
        <img src="/a-standalone-vector-logo-icon-based-exac_VyOETc4yR5-IePoBy-7pGw_etxGKfs2SfKMsgaJ3OD4CQ_sd.jpeg" alt="Cargo Core Logo" class="h-8 w-8 rounded-md object-cover">
        <div class="text-xl font-bold text-primary">Cargo-Core</div>
      </div>
      <button class="lg:hidden text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white" @click="$emit('close')">
        <span class="material-symbols-outlined">close</span>
      </button>
    </div>

    <nav class="flex-1 overflow-y-auto py-4 no-scrollbar">
      <ul class="space-y-1 px-3">
        <li v-for="item in menuItems" :key="item.route">
          <component
            :is="'router-link'"
            :to="item.route"
            class="w-full flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 group relative text-left"
            :class="$route.path === item.route ? 'bg-green-500/10 text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'"
          >
            <div v-if="$route.path === item.route" class="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-green-500 rounded-r-full" />
            <span class="material-symbols-outlined mr-3 text-[20px]" :class="$route.path === item.route ? 'text-green-500' : 'text-gray-500 group-hover:text-gray-900 dark:group-hover:text-white'">{{ item.icon }}</span>
            <span class="text-sm font-medium">{{ item.label }}</span>
          </component>
        </li>
      </ul>

      <div class="mt-8 px-4">
        <div class="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Move Metrics</div>
        <div class="grid grid-cols-2 gap-2">
          <div
            v-for="metric in moveMetrics"
            :key="metric.id"
            class="bg-gray-100 dark:bg-white/5 rounded p-2 text-center border border-gray-200 dark:border-white/5"
          >
            <div class="text-xs text-gray-500 dark:text-gray-400 font-medium">{{ metric.name }}</div>
            <div class="font-bold mt-1" :class="metric.color">{{ metric.value }}</div>
          </div>
        </div>
      </div>
    </nav>

    <div class="p-4 border-t border-gray-200 dark:border-white/5">
      <div class="flex items-center gap-3 p-2 rounded-lg">
        <div class="w-9 h-9 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
          <span class="font-bold text-xs text-white">{{ store.userInitials }}</span>
        </div>
        <div class="flex-1 min-w-0">
          <div class="text-sm font-medium text-gray-900 dark:text-white truncate">{{ store.user.name }}</div>
          <div class="text-xs text-gray-500 dark:text-gray-500 truncate">Individual User</div>
        </div>
        <button class="text-gray-500 hover:text-red-500 transition-colors" @click="handleLogout">
          <span class="material-symbols-outlined">logout</span>
        </button>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useIndividualStore } from '@/stores/individualStore'

defineProps({ isOpen: Boolean })
defineEmits(['close'])

const router = useRouter()
const authStore = useAuthStore()
const store = useIndividualStore()

const menuItems = [
  { label: 'Dashboard', icon: 'dashboard', route: '/individual/dashboard' },
  { label: 'Book a Move', icon: 'local_shipping', route: '/individual/book-move' },
  { label: 'My Orders', icon: 'receipt_long', route: '/individual/orders' },
  { label: 'Quotes', icon: 'request_quote', route: '/individual/quotes' },
  { label: 'Tracking', icon: 'gps_fixed', route: '/individual/tracking' },
  { label: 'Wallet', icon: 'account_balance_wallet', route: '/individual/wallet' },
  { label: 'Payments', icon: 'credit_card', route: '/individual/payments' },
  { label: 'Damage Report', icon: 'report', route: '/individual/damage-report' },
  { label: 'Profile', icon: 'person', route: '/individual/profile' },
]

const moveMetrics = computed(() => ([
  { id: 'active', name: 'Active', value: String(store.activeOrders.length), color: 'text-blue-500' },
  { id: 'pending', name: 'Pending', value: String(store.pendingOrders.length), color: 'text-amber-500' },
  { id: 'done', name: 'Delivered', value: String(store.deliveredOrders.length), color: 'text-green-500' },
  { id: 'issues', name: 'Issues', value: String(store.damageReports.length), color: store.damageReports.length ? 'text-red-500' : 'text-green-500' },
]))

async function handleLogout() {
  const loginPath = authStore.logout()
  router.replace(loginPath)
}
</script>
