<template>
  <!--
    MainLayout — Root chrome for all authenticated screens.

    ┌─────────────────────────────────┐
    │  .status-bar-spacer             │  ← height: env(safe-area-inset-top)
    ├─────────────────────────────────┤
    │                                 │
    │  .page-container  (flex: 1)     │  ← pages render here
    │                                 │
    ├─────────────────────────────────┤
    │  .bottom-nav-wrapper            │  ← BottomNav + env(safe-area-inset-bottom)
    └─────────────────────────────────┘

    Safe-area contract:
    • Status bar:       handled by .status-bar-spacer → no per-page pt-safe needed
    • Gesture nav bar:  handled by .bottom-nav-wrapper → no per-page pb-safe-nav needed
    • BottomNav height: accounted for because it is IN the flex flow, not fixed
    • Keyboard:         BottomNav hidden when keyboard is open via useKeyboard()
    • Back button:      useHardwareBack() wired here for all authenticated routes
  -->
  <div class="main-layout" :class="themeClass">

    <!-- Transparent spacer below status bar — all page content automatically starts here -->
    <div class="status-bar-spacer" aria-hidden="true" />

    <!-- In-app notification banner (slides from top) -->
    <NotificationBanner :banner="banner" @dismiss="dismissBanner" @tap="handleBannerTap" />

    <!-- Page render slot: fills remaining height precisely -->
    <main class="page-container">
      <RouterView v-slot="{ Component }">
        <Transition name="route" mode="out-in">
          <component :is="Component" :key="$route.path" />
        </Transition>
      </RouterView>
    </main>

    <!-- Bottom navigation in FLEX FLOW (not fixed).
         Margin snaps instantly to avoid vibration, but visual transform animates cleanly. -->
    <div v-if="!isKeyboardVisible && !route.meta.hideNav" class="bottom-nav-wrapper"
      :class="{ 'nav-hidden': uiStore.isNavHidden }">
      <BottomNav />
    </div>

  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUiStore } from '../stores/uiStore.js'
import BottomNav from '../components/BottomNav.vue'
import NotificationBanner from '../components/NotificationBanner.vue'
import { useKeyboard } from '../composables/useKeyboard.js'
import { useHardwareBack } from '../composables/useHardwareBack.js'
import { useLocalNotifications } from '../composables/useLocalNotifications.js'

const uiStore = useUiStore()
const route = useRoute()
const router = useRouter()
const { isKeyboardVisible } = useKeyboard()
const { banner, dismissBanner } = useLocalNotifications()

// Expose notify globally via provide so child pages can inject it
// (pages can alternatively import useLocalNotifications directly)

// Wire Android hardware back button for all authenticated routes in one place
useHardwareBack()

// ── Smart Auto-Hide Bottom Navbar ─────────────────────────────
let lastScrollY = 0
let ticking = false

onMounted(() => {
  // Use event capturing to catch scroll events from any nested .screen-body
  window.addEventListener('scroll', (e) => {
    // Only care about vertical scrolling inside our main scrollable areas
    const target = e.target
    if (!target || !target.classList || !target.classList.contains('screen-body')) return

    const currentScrollY = target.scrollTop

    if (!ticking) {
      window.requestAnimationFrame(() => {
        // Only trigger hiding if scrolled down past 50px
        if (currentScrollY > 50 && currentScrollY > lastScrollY) {
          // Scrolling down
          uiStore.isNavHidden = true
        } else if (currentScrollY < lastScrollY || currentScrollY <= 50) {
          // Scrolling up (or at the top)
          uiStore.isNavHidden = false
        }
        lastScrollY = currentScrollY <= 0 ? 0 : currentScrollY
        ticking = false
      })
      ticking = true
    }
  }, { capture: true, passive: true })
})

function handleBannerTap() {
  if (banner.value?.route) {
    router.push(banner.value.route)
  }
  dismissBanner()
}

const themeClass = computed(() =>
  uiStore.theme === 'light'
    ? 'light bg-background-light text-gray-900'
    : 'dark bg-background-dark text-white'
)
</script>

<style scoped>
/* ── Layout shell ─────────────────────────────────────────────────── */
.main-layout {
  display: flex;
  flex-direction: column;
  /* 100dvh = dynamic viewport: correct on Android WebView, handles browser chrome */
  height: 100dvh;
  width: 100vw;
  overflow: hidden;
}

/* ── Status bar safe-area spacer ─────────────────────────────────── */
/*
  env(safe-area-inset-top) = exact height of the Android status bar (incl. notch).
  This one div pushes ALL page content below the status bar automatically.
  Pages do NOT need pt-safe or manual status-bar padding.
*/
.status-bar-spacer {
  flex-shrink: 0;
  height: env(safe-area-inset-top, 0px);
  background: transparent;
  pointer-events: none;
}

/* ── Page content area ───────────────────────────────────────────── */
/*
  flex: 1 1 0% with min-height: 0 is the canonical flex pattern that allows
  this container to shrink below its content's natural height.
  Without min-height: 0 the container would overflow MainLayout's bounds.
*/
.page-container {
  flex: 1 1 0%;
  min-height: 0;
  overflow: hidden;
  position: relative;
  /* Promote to GPU compositor layer for silky route transitions */
  transform: translateZ(0);
}

/* ── Bottom navigation wrapper ───────────────────────────────────── */
/*
  padding-bottom = env(safe-area-inset-bottom) lifts BottomNav above the
  Android gesture navigation bar on all devices:
    • Gesture-nav phone: ~34 px
    • Button-nav phone:  ~0 px (or small even number)
    • No nav-bar phone:  0 px
  The BottomNav visual content also has mb-3 margin for its floating appearance.
*/
.bottom-nav-wrapper {
  flex-shrink: 0;
  padding-bottom: env(safe-area-inset-bottom, 0px);
  /* Animate visual movement, but keep layout changes instant to block scroll-jitter */
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease;
}

/* Smart Auto-hide Styles */
.nav-hidden {
  transform: translateY(120%);
  margin-bottom: calc(-78px - env(safe-area-inset-bottom, 0px));
  opacity: 0;
  pointer-events: none;
}
</style>
