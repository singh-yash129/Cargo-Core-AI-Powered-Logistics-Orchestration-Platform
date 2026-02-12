<template>
  <component :is="layout">
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </component>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import DriverLayout from './layouts/DriverLayout.vue'
import DesktopLayout from './layouts/DesktopLayout.vue'
import BlankLayout from './layouts/BlankLayout.vue'
import LogisticLayout from './layouts/LogisticLayout.vue'
import DispatcherLayout from './layouts/DispatcherLayout.vue'
import WarehouseLayout from './layouts/WarehouseLayout.vue'
import IndividualLayout from './layouts/IndividualLayout.vue'
import VendorLayout from './layouts/VendorLayout.vue'

const route = useRoute()

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
