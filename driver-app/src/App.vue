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
    <RouteToast />
    <AppLoader :visible="uiStore.isLoading" />

    <!-- Renders PublicLayout or MainLayout or CameraLayout depending on route -->
    <!-- Wrapped in KeepAlive so pulling up the full-screen camera doesn't wipe your current app state! -->
    <!-- ONLY caching MainLayout to ensure native Camera processes in CameraLayout properly cleanup and restart on Android! -->
    <RouterView v-slot="{ Component }">
      <KeepAlive include="MainLayout">
        <component :is="Component" />
      </KeepAlive>
    </RouterView>
  </div>
</template>

<script setup>
import { computed, onMounted, watch } from 'vue'
import { useUiStore } from './stores/uiStore.js'
import { useDriverStore } from './stores/driverStore.js'
import { useSafeArea } from './composables/useSafeArea.js'
import SyncBanner from './components/SyncBanner.vue'
import RouteToast from './components/RouteToast.vue'
import AppLoader from './components/AppLoader.vue'
import { requestAppPermissions } from './composables/usePermissions.js'
import { offlineSyncEngine } from './services/offlineSync.js'
import { alertWebSocket } from './services/alertWebSocket.js'

const uiStore = useUiStore()
const driverStore = useDriverStore()

// Run synchronously — sets theme.value from localStorage/system preference BEFORE
// the component tree renders, preventing a dark→light flash on first paint.
uiStore.initTheme()

// Configure Android StatusBar to be transparent and overlay the WebView.
useSafeArea()

// Request native permissions at boot (Camera, Location).
// Skips if already granted; retries with explanation if denied.
onMounted(() => {
  requestAppPermissions()
  // Initialize offline sync engine — sets up network listener, restores persisted queue
  offlineSyncEngine.init()
  // Connect to alert WebSocket if authenticated
  if (driverStore.isAuthenticated) {
    alertWebSocket.connect()
  }
})

// Watch for auth changes to connect/disconnect WebSocket
watch(() => driverStore.isAuthenticated, (isAuth) => {
  if (isAuth) {
    alertWebSocket.reconnect()
  } else {
    alertWebSocket.disconnect()
  }
})

const themeClass = computed(() =>
  uiStore.theme === 'light' ? 'light bg-background-light text-gray-900' : 'dark bg-background-dark text-white'
)
</script>
