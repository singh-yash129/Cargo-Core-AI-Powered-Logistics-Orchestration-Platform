<template>
  <!--
    App.vue — Top-level shell.
    Only global system-layer overlays live here.
    RouterView renders either PublicLayout or MainLayout based on the route.
    Those layouts own their RouterViews and render individual page components.
  -->
  <div :class="['h-full w-full', themeClass, 'font-display antialiased selection-custom overflow-hidden']">
    <!-- Global overlays — always above all pages and layouts -->
    <SyncBanner />
    <AppLoader :visible="uiStore.isLoading" />

    <!-- Renders PublicLayout or MainLayout depending on route -->
    <RouterView />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useUiStore } from './stores/uiStore.js'
import { useSafeArea } from './composables/useSafeArea.js'
import SyncBanner from './components/SyncBanner.vue'
import AppLoader from './components/AppLoader.vue'

const uiStore = useUiStore()

// Run synchronously — sets theme.value from localStorage/system preference BEFORE
// the component tree renders, preventing a dark→light flash on first paint.
uiStore.initTheme()

// Configure Android StatusBar to be transparent and overlay the WebView.
useSafeArea()

const themeClass = computed(() =>
  uiStore.theme === 'light' ? 'light bg-background-light text-gray-900' : 'dark bg-background-dark text-white'
)
</script>
