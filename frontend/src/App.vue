<template>
  <AppLoading :visible="isLoading" />
  <component :is="layout">
    <router-view v-slot="{ Component, route: currentRoute }">
      <transition :name="currentRoute.name === 'NoInternet' ? '' : 'fade'" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </component>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppLoading from './components/AppLoading.vue'
import DriverLayout from './layouts/DriverLayout.vue'
import DesktopLayout from './layouts/DesktopLayout.vue'
import BlankLayout from './layouts/BlankLayout.vue'
import LogisticLayout from './layouts/LogisticLayout.vue'
import DispatcherLayout from './layouts/DispatcherLayout.vue'
import WarehouseLayout from './layouts/WarehouseLayout.vue'
import IndividualLayout from './layouts/IndividualLayout.vue'
import VendorLayout from './layouts/VendorLayout.vue'
import AILayout from './layouts/AILayout.vue'
import AuthLayout from './layouts/AuthLayout.vue'

const route = useRoute()
const router = useRouter()

// Global loading state
const isLoading = ref(false)
router.beforeEach((to) => {
  // Skip loading overlay for offline page — it should appear instantly
  if (to.name !== 'NoInternet') {
    isLoading.value = true
  }
})
router.afterEach(() => {
  isLoading.value = false
})

// Global offline/online detection
const handleOffline = () => {
  if (route.name !== 'NoInternet') {
    router.replace('/offline')
  }
}
const handleOnline = () => {
  // handled inside NoInternet.vue itself
}
onMounted(() => {
  window.addEventListener('offline', handleOffline)
  window.addEventListener('online', handleOnline)
  // Redirect immediately if already offline on load
  if (!navigator.onLine && route.name !== 'NoInternet') {
    router.push('/offline')
  }
})
onUnmounted(() => {
  window.removeEventListener('offline', handleOffline)
  window.removeEventListener('online', handleOnline)
})

const layout = computed(() => {
  const layoutName = route.meta.layout || 'blank'

  switch (layoutName) {
    case 'driver':
      return DriverLayout
    case 'desktop':
      return DesktopLayout
    case 'logistic':
      return LogisticLayout
    case 'dispatcher':
      return DispatcherLayout
    case 'warehouse':
      return WarehouseLayout
    case 'individual':
      return IndividualLayout
    case 'vendor':
      return VendorLayout
    case 'ai':
      return AILayout
    case 'auth':
      return AuthLayout
    default:
      return BlankLayout
  }
})
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
