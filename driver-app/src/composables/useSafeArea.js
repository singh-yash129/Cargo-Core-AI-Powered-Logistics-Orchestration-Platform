import { onMounted } from 'vue'

/**
 * useSafeArea — call once in App.vue.
 *
 * Configures Capacitor StatusBar to overlay the WebView so the app extends
 * edge-to-edge behind the Android status bar.
 * CSS env(safe-area-inset-top/bottom) then provides the exact pixel offsets
 * used by MainLayout's .status-bar-spacer and .bottom-nav-wrapper.
 */
export function useSafeArea() {
  onMounted(async () => {
    try {
      const { StatusBar, Style } = await import('@capacitor/status-bar')
      // Extend the WebView behind the status bar (edge-to-edge)
      await StatusBar.setOverlaysWebView({ overlay: true })
      // White icons on dark app background
      await StatusBar.setStyle({ style: Style.Dark })
    } catch {
      // Running in browser / StatusBar plugin unavailable — silently skip
    }
  })
}
