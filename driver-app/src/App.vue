<template>
  <div :class="['min-h-screen h-full', themeClass, 'font-display antialiased selection-custom overflow-hidden']">
    <!-- Sync Status Banner -->
    <SyncBanner />
    <!-- Route Update Toast -->
    <RouteToast />
    <!-- App Loading Overlay -->
    <AppLoader :visible="isLoading" />
    <!-- Router View with transition -->
    <RouterView v-slot="{ Component }">
      <Transition name="route" mode="out-in">
        <component :is="Component" :key="$route.path" />
      </Transition>
    </RouterView>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useUiStore } from './stores/uiStore.js'
import SyncBanner from './components/SyncBanner.vue'
import RouteToast from './components/RouteToast.vue'
import AppLoader from './components/AppLoader.vue'

const uiStore = useUiStore()
const isLoading = ref(false)

const themeClass = computed(() =>
  uiStore.theme === 'light' ? 'light bg-background-light text-gray-900' : 'dark bg-background-dark text-white'
)

onMounted(() => {
  uiStore.initTheme()
})
</script>

<style>
.route-enter-active { animation: slideUp 0.28s ease-out; }
.route-leave-active { animation: slideUp 0.18s ease-in reverse; }
</style>
