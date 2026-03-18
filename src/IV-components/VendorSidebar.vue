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
            :class="$route.path === item.route ? 'bg-blue-500/10 text-blue-500' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'"
          >
            <div v-if="$route.path === item.route" class="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r-full" />
            <span class="material-symbols-outlined mr-3 text-[20px]" :class="$route.path === item.route ? 'text-blue-500' : 'text-gray-500 group-hover:text-gray-900 dark:group-hover:text-white'">{{ item.icon }}</span>
            <span class="text-sm font-medium">{{ item.label }}</span>
          </component>
        </li>
      </ul>

      <div class="mt-8 px-4">
        <div class="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Vendor Metrics</div>
        <div class="grid grid-cols-2 gap-2">
          <div
            v-for="metric in vendorMetrics"
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
        <div class="w-9 h-9 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
          <span class="font-bold text-xs text-blue-600 dark:text-blue-400">{{ vendorInitials }}</span>
        </div>
        <div class="flex-1 min-w-0">
          <div class="text-sm font-medium text-gray-900 dark:text-white truncate">{{ vendorName }}</div>
          <div class="text-xs text-gray-500 dark:text-gray-500 truncate">Vendor Account</div>
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
import { useVendorStore } from '@/stores/vendorStore'

defineProps({ isOpen: Boolean })
defineEmits(['close'])

const router = useRouter()
const authStore = useAuthStore()
const store = useVendorStore()

const menuItems = [
  { label: 'Dashboard', icon: 'dashboard', route: '/vendor/dashboard' },
  { label: 'Create Shipment', icon: 'add_box', route: '/vendor/create-shipment' },
  { label: 'Orders', icon: 'list_alt', route: '/vendor/orders' },
  { label: 'Recurring Orders', icon: 'update', route: '/vendor/recurring' },
  { label: 'Bulk Upload', icon: 'upload_file', route: '/vendor/bulk-upload' },
  { label: 'Shipment Tracking', icon: 'local_shipping', route: '/vendor/tracking' },
  { label: 'Invoices', icon: 'receipt', route: '/vendor/invoices' },
  { label: 'Analytics', icon: 'analytics', route: '/vendor/analytics' },
]

const currentUser = computed(() => authStore.currentUser || JSON.parse(localStorage.getItem('auth_user') || 'null'))
const vendorName = computed(() => currentUser.value?.name || currentUser.value?.company_name || 'Vendor')
const vendorInitials = computed(() => vendorName.value.split(' ').map((part) => part[0]).join('').toUpperCase().slice(0, 2))

const vendorMetrics = computed(() => ([
  { id: 'active', name: 'Active', value: String(store.activeShipments.length), color: 'text-blue-500' },
  { id: 'pending', name: 'Pending', value: String(store.pendingShipments.length), color: 'text-amber-500' },
  { id: 'done', name: 'Delivered', value: String(store.deliveredShipments.length), color: 'text-green-500' },
  { id: 'issues', name: 'Overdue', value: String(store.overdueInvoices.length), color: store.overdueInvoices.length ? 'text-red-500' : 'text-green-500' },
]))

async function handleLogout() {
  await authStore.logout()
  router.push('/login')
}
</script>
