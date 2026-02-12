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

const route = useRoute()

const layout = computed(() => {
  const layoutName = route.meta.layout || 'blank'

  switch (layoutName) {
    case 'driver':
      return DriverLayout
    case 'desktop':
      return DesktopLayout
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
