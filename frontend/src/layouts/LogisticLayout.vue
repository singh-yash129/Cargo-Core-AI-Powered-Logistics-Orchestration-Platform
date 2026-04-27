<template>
    <div
        class="logistic-theme min-h-screen bg-background-light dark:bg-background-dark text-gray-900 dark:text-white font-display antialiased overflow-x-hidden relative"
        :class="{ 'lm-critical-state': criticalEmptyFunds }"
    >
        <!-- ═══════════════════════════════════════════════════════════
             CRITICAL FINANCIAL EMERGENCY OVERLAY
             Fires only when both revenue AND capital are drained to 0.
             pointer-events-none so it never blocks any UI interaction.
        ════════════════════════════════════════════════════════════════ -->
        <Transition name="critical-overlay">
            <div v-if="criticalEmptyFunds" class="critical-overlay" aria-hidden="true">

                <!-- Edge glow border (all 4 sides) -->
                <div class="critical-edge critical-edge--top"></div>
                <div class="critical-edge critical-edge--bottom"></div>
                <div class="critical-edge critical-edge--left"></div>
                <div class="critical-edge critical-edge--right"></div>

                <!-- Corner brackets (HUD / Command-Center style) -->
                <div class="critical-corner critical-corner--tl">
                    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                        <path d="M2 18V2H18" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
                    </svg>
                </div>
                <div class="critical-corner critical-corner--tr">
                    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                        <path d="M34 18V2H18" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
                    </svg>
                </div>
                <div class="critical-corner critical-corner--bl">
                    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                        <path d="M2 18V34H18" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
                    </svg>
                </div>
                <div class="critical-corner critical-corner--br">
                    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                        <path d="M34 18V34H18" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
                    </svg>
                </div>

                <!-- Subtle red vignette (does NOT obscure content) -->
                <div class="critical-vignette"></div>

                <!-- Floating status pill — top-center -->
                <div class="critical-pill">
                    <span class="critical-pill__dot"></span>
                    <span class="material-symbols-outlined" style="font-size:14px;line-height:1">emergency</span>
                    <span class="critical-pill__text">FINANCIAL LOCKDOWN &nbsp;·&nbsp; Revenue &amp; Capital Drained</span>
                    <span class="critical-pill__sep">|</span>
                    <span class="critical-pill__action" @click.stop="goToFinances">Fund Now ↗</span>
                </div>

            </div>
        </Transition>

        <!-- Sidebar -->
        <LogisticSidebar />

        <!-- Main Content Area -->
        <main class="ml-64 min-h-screen flex flex-col transition-all duration-300 overflow-x-hidden">
            <!-- Top Bar with Warehouse Switcher -->
            <header
                class="h-16 px-8 flex items-center justify-between border-b border-gray-200 dark:border-white/5 bg-surface-light/80 dark:bg-background-dark/80 backdrop-blur-md sticky top-0 z-40">
                <div class="flex items-center gap-4">
                    <!-- Warehouse Switcher (Hidden on Global Pages) -->
                    <div v-if="!isGlobalPage" class="relative group">
                        <button @click="store.openModal('warehouse-select')"
                            class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors border border-gray-200 dark:border-white/5">
                            <span
                                class="material-symbols-outlined text-gray-500 dark:text-gray-400 text-[18px]">public</span>
                            <span class="text-sm font-medium text-gray-700 dark:text-white">{{ store.activeWarehouseName
                                }}</span>
                            <span class="material-symbols-outlined text-gray-500 text-[18px]">arrow_drop_down</span>
                        </button>
                    </div>

                    <!-- Static Header for Global Pages -->
                    <div v-else
                        class="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-primary/10 border border-primary/20 dark:bg-primary/20 dark:border-primary/30 shadow-sm cursor-default">
                        <span class="material-symbols-outlined text-primary text-[18px]">
                            {{ globalPageIcon }}
                        </span>
                        <span class="text-sm font-bold text-primary dark:text-blue-400 tracking-wide uppercase">
                            {{ globalPageTitle }}
                        </span>
                    </div>

                    <!-- Breadcrumbs or Page Title could go here -->
                    <h1 class="text-lg font-semibold text-white/80 hidden">Dashboard</h1>
                </div>

                <div class="flex items-center gap-4">
                    <div class="hidden sm:block">
                        <HeaderWeather hub-id="1" />
                    </div>

                    <!-- Search Bar Moved to Dashboard -->

                    <!-- Notifications -->
                    <NotificationPopover :notifications="store.notifications"
                        :unread-count="store.unreadNotificationsCount" @open="store.fetchNotifications()"
                        @mark-read="store.markNotificationRead"
                        @mark-all-read="store.markAllNotificationsRead" @clear-all="store.clearNotifications" />

                    <!-- Meeting Scheduler -->
                    <HeaderMeetingScheduler />

                    <!-- To-Do List -->
                    <HeaderTodo />

                </div>
            </header>

            <!-- Page Content -->
            <div class="flex-1 p-8 overflow-y-auto overflow-x-hidden">
                <div v-if="store.error"
                    class="mb-6 rounded-2xl border border-amber-300/60 bg-amber-50 px-4 py-3 text-sm text-amber-900 shadow-sm dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100">
                    <div class="flex items-start justify-between gap-4">
                        <div>
                            <div class="font-semibold">Unable to load logistics data</div>
                            <div class="mt-1 text-amber-800/90 dark:text-amber-100/90">{{ store.error }}</div>
                        </div>
                        <button
                            class="shrink-0 rounded-lg border border-amber-400/60 px-3 py-1.5 font-medium transition-colors hover:bg-amber-100 dark:border-amber-400/30 dark:hover:bg-amber-500/10"
                            @click="store.initialize(true).catch((err) => console.error('Failed to reload logistics data', err))">
                            Retry
                        </button>
                    </div>
                </div>
                <RouterView />
            </div>

            <!-- Global Modals for Logistic Layout -->
            <WarehouseSelectorModal :is-open="store.activeModal === 'warehouse-select'" :hubs="store.hubs"
                :active-id="store.activeWarehouse" @close="store.closeModal()" @select="store.setWarehouse" />
        </main>
    </div>
</template>

<script setup>
import LogisticSidebar from '../LWD-components/LogisticSidebar.vue'
import WarehouseSelectorModal from '@/LWD-components/WarehouseSelectorModal.vue'
import HeaderWeather from '@/components/HeaderWeather.vue'
import NotificationPopover from '@/components/NotificationPopover.vue'
import HeaderTodo from '@/components/HeaderTodo.vue'
import HeaderMeetingScheduler from '@/components/HeaderMeetingScheduler.vue'
import { useLogisticStore } from '@/stores/logisticStore'
import { RouterView, useRoute, useRouter } from 'vue-router'
import { computed, onBeforeUnmount, onMounted } from 'vue'

const store = useLogisticStore()
const route = useRoute()
const router = useRouter()

// Critical lockdown: both revenue AND capital are fully drained.
// Guard on store.initialized so this NEVER fires during the loading
// flash (all values are 0 by default before bootstrap data arrives).
const criticalEmptyFunds = computed(() => {
    if (!store.initialized || store.isLoading) return false
    const s = store.activeFinanceSummary
    return (s.total_revenue ?? 1) <= 0 && (s.capital_invested ?? 1) <= 0
})

function goToFinances() {
    router.push('/logistic/reports').then(() => {
        // Brief delay so Reports.vue mounts, then switch to financials tab
        // (Reports.vue reads activeTab from its own local ref, so we use
        //  a CustomEvent the page can listen to)
        setTimeout(() => document.dispatchEvent(new CustomEvent('lm:goto-tab', { detail: 'financials' })), 150)
    })
}
let notificationPoll = null

onMounted(() => {
    store.initialize().catch((err) => {
        console.error('Failed to initialize logistic data', err)
    })
    store.fetchNotifications().catch(() => {})
    notificationPoll = window.setInterval(() => {
        store.fetchNotifications().catch(() => {})
    }, 30000)
    document.body.classList.add('logistic-theme-portal')
})

onBeforeUnmount(() => {
    if (notificationPoll) window.clearInterval(notificationPoll)
    document.body.classList.remove('logistic-theme-portal')
})

const isGlobalPage = computed(() => {
    return route.path.includes('/logistic/warehouses') ||
        route.path.includes('/logistic/ai') ||
        route.path.includes('/logistic/comparative-viewers') ||
        route.path.includes('/logistic/rate-governance')
})

const globalPageIcon = computed(() => {
    if (route.path.includes('ai')) return 'smart_toy'
    if (route.path.includes('comparative')) return 'compare_arrows'
    if (route.path.includes('rate-governance')) return 'account_balance'
    return 'domain'
})

const globalPageTitle = computed(() => {
    if (route.path.includes('ai')) return 'Corporate AI Assistant'
    if (route.path.includes('comparative')) return 'Comparative Viewers'
    if (route.path.includes('rate-governance')) return 'Global Rate Governance'
    return 'Global Network Overview'
})
</script>

<style>
.logistic-theme,
body.logistic-theme-portal {
    --primary: #1ce783;
    --primary-dark: #17c06d;
    --logistic-surface-light: rgba(255, 255, 255, 0.92);
    --logistic-surface-light-strong: rgba(255, 255, 255, 0.98);
    --logistic-surface-dark: rgba(15, 23, 42, 0.72);
    --logistic-surface-dark-strong: rgba(15, 23, 42, 0.88);
    --logistic-border-light: rgba(148, 163, 184, 0.22);
    --logistic-border-dark: rgba(148, 163, 184, 0.18);
    --logistic-text-light: rgb(15 23 42);
    --logistic-text-light-muted: rgb(100 116 139);
    --logistic-text-dark: rgb(226 232 240);
    --logistic-text-dark-muted: rgb(148 163 184);
}

:is(.logistic-theme, body.logistic-theme-portal) {
    color: var(--logistic-text-light);
}

.dark :is(.logistic-theme, body.logistic-theme-portal) {
    color: var(--logistic-text-dark);
}

:is(.logistic-theme, body.logistic-theme-portal) :is(
    .glass-panel,
    .bg-white,
    .bg-white\/80,
    .bg-white\/90,
    .bg-gray-50,
    .bg-gray-50\/30,
    .bg-gray-50\/50,
    .bg-gray-100,
    .bg-surface-light,
    .bg-surface-light\/80,
    .bg-slate-800\/80,
    .dark\:bg-card-dark,
    .dark\:bg-card-darker,
    .dark\:bg-gray-900,
    .dark\:bg-gray-700,
    .dark\:bg-gray-800,
    .dark\:bg-black\/10,
    .dark\:bg-black\/20,
    .dark\:bg-black\/30,
    .dark\:bg-black\/40,
    .dark\:bg-black\/50,
    .dark\:bg-black\/80,
    .dark\:bg-white\/5,
    .dark\:bg-white\/10
) {
    background-color: var(--logistic-surface-light) !important;
    border-color: var(--logistic-border-light) !important;
    backdrop-filter: blur(18px);
}

.dark :is(.logistic-theme, body.logistic-theme-portal) :is(
    .glass-panel,
    .bg-white,
    .bg-white\/80,
    .bg-white\/90,
    .bg-gray-50,
    .bg-gray-50\/30,
    .bg-gray-50\/50,
    .bg-gray-100,
    .bg-surface-light,
    .bg-surface-light\/80,
    .bg-slate-800\/80,
    .dark\:bg-card-dark,
    .dark\:bg-card-darker,
    .dark\:bg-gray-900,
    .dark\:bg-gray-700,
    .dark\:bg-gray-800,
    .dark\:bg-black\/10,
    .dark\:bg-black\/20,
    .dark\:bg-black\/30,
    .dark\:bg-black\/40,
    .dark\:bg-black\/50,
    .dark\:bg-black\/80,
    .dark\:bg-white\/5,
    .dark\:bg-white\/10
) {
    background-color: var(--logistic-surface-dark) !important;
    border-color: var(--logistic-border-dark) !important;
}

:is(.logistic-theme, body.logistic-theme-portal) :is(
    input,
    select,
    textarea
) {
    background-color: var(--logistic-surface-light-strong);
    color: var(--logistic-text-light);
    border-color: var(--logistic-border-light) !important;
}

.dark :is(.logistic-theme, body.logistic-theme-portal) :is(
    input,
    select,
    textarea
) {
    background-color: var(--logistic-surface-dark-strong);
    color: var(--logistic-text-dark);
    border-color: var(--logistic-border-dark) !important;
}

:is(.logistic-theme, body.logistic-theme-portal) :is(input, textarea)::placeholder {
    color: var(--logistic-text-light-muted);
}

.dark :is(.logistic-theme, body.logistic-theme-portal) :is(input, textarea)::placeholder {
    color: var(--logistic-text-dark-muted);
}

:is(.logistic-theme, body.logistic-theme-portal) :is(
    .text-gray-900,
    .text-gray-800,
    .text-gray-700,
    .text-gray-600
) {
    color: var(--logistic-text-light) !important;
}

.dark :is(.logistic-theme, body.logistic-theme-portal) :is(
    .text-gray-900,
    .text-gray-800,
    .text-gray-700,
    .text-gray-600
) {
    color: var(--logistic-text-dark) !important;
}

:is(.logistic-theme, body.logistic-theme-portal) :is(
    .text-gray-500,
    .text-gray-400
) {
    color: var(--logistic-text-light-muted) !important;
}

.dark :is(.logistic-theme, body.logistic-theme-portal) :is(
    .text-gray-500,
    .text-gray-400
) {
    color: var(--logistic-text-dark-muted) !important;
}

:is(.logistic-theme, body.logistic-theme-portal) :is(
    .border-gray-100,
    .border-gray-200,
    .border-gray-300
) {
    border-color: var(--logistic-border-light) !important;
}

:is(.logistic-theme, body.logistic-theme-portal) button:is(
    .bg-white,
    .bg-gray-50,
    .bg-gray-100,
    .dark\:bg-white\/5,
    .dark\:bg-white\/10
) {
    background-color: rgba(255, 255, 255, 0.94) !important;
    color: var(--logistic-text-light) !important;
    border-color: rgba(148, 163, 184, 0.22) !important;
}

.dark :is(.logistic-theme, body.logistic-theme-portal) button:is(
    .bg-white,
    .bg-gray-50,
    .bg-gray-100,
    .dark\:bg-white\/5,
    .dark\:bg-white\/10
) {
    background-color: rgba(15, 23, 42, 0.82) !important;
    color: var(--logistic-text-dark) !important;
    border-color: rgba(148, 163, 184, 0.18) !important;
}

:is(.logistic-theme, body.logistic-theme-portal) button:is(
    .bg-primary,
    .dark\:bg-primary
) {
    background-color: var(--primary) !important;
    color: rgb(255 255 255) !important;
    border-color: rgba(28, 231, 131, 0.35) !important;
}

:is(.logistic-theme, body.logistic-theme-portal) button:is(
    .hover\:bg-primary\/90,
    .dark\:hover\:bg-primary\/90
):hover {
    background-color: var(--primary-dark) !important;
    color: rgb(255 255 255) !important;
}

:is(.logistic-theme, body.logistic-theme-portal) button:is(
    .border,
    .border-gray-100,
    .border-gray-200,
    .border-gray-300
):not(.bg-primary):not(.bg-blue-500):not(.bg-green-500):not(.bg-red-500):not(.bg-yellow-500) {
    background-color: rgba(255, 255, 255, 0.94);
    color: var(--logistic-text-light);
    border-color: rgba(148, 163, 184, 0.22) !important;
}

.dark :is(.logistic-theme, body.logistic-theme-portal) button:is(
    .border,
    .border-gray-100,
    .border-gray-200,
    .border-gray-300
):not(.bg-primary):not(.bg-blue-500):not(.bg-green-500):not(.bg-red-500):not(.bg-yellow-500) {
    background-color: rgba(15, 23, 42, 0.82);
    color: var(--logistic-text-dark);
    border-color: rgba(148, 163, 184, 0.18) !important;
}

:is(.logistic-theme, body.logistic-theme-portal) button:is(
    .hover\:bg-gray-50,
    .hover\:bg-gray-100,
    .hover\:bg-gray-200
):hover {
    background-color: rgba(241, 245, 249, 0.98) !important;
}

.dark :is(.logistic-theme, body.logistic-theme-portal) button:is(
    .hover\:bg-gray-50,
    .hover\:bg-gray-100,
    .hover\:bg-gray-200
):hover {
    background-color: rgba(30, 41, 59, 0.92) !important;
}

:is(.logistic-theme, body.logistic-theme-portal) option {
    background-color: rgb(255 255 255);
    color: var(--logistic-text-light);
}

.dark :is(.logistic-theme, body.logistic-theme-portal) option {
    background-color: rgb(15 23 42);
    color: var(--logistic-text-dark);
}

/* ═══════════════════════════════════════════════════
   CRITICAL FINANCIAL EMERGENCY OVERLAY
   Aesthetic: HUD / Mission-Control / Command-Center
═══════════════════════════════════════════════════ */

/* Transition */
.critical-overlay-enter-active,
.critical-overlay-leave-active { transition: opacity 0.6s ease; }
.critical-overlay-enter-from,
.critical-overlay-leave-to   { opacity: 0; }

/* Base overlay container — covers the entire viewport */
.critical-overlay {
    position: fixed;
    inset: 0;
    z-index: 9999;
    pointer-events: none;   /* never blocks any click */
    --cc-red: #ff2d55;
    --cc-orange: #ff6b35;
}

/* ── Edge glow lines ── */
.critical-edge {
    position: absolute;
    background: linear-gradient(90deg, transparent, var(--cc-red), var(--cc-orange), var(--cc-red), transparent);
    animation: cc-edge-pulse 2s ease-in-out infinite;
}
.critical-edge--top    { top: 0;    left: 0;  right: 0;  height: 2px; }
.critical-edge--bottom { bottom: 0; left: 0;  right: 0;  height: 2px; }
.critical-edge--left  {
    top: 0; bottom: 0; left: 0; width: 2px;
    background: linear-gradient(180deg, transparent, var(--cc-red), var(--cc-orange), var(--cc-red), transparent);
}
.critical-edge--right {
    top: 0; bottom: 0; right: 0; width: 2px;
    background: linear-gradient(180deg, transparent, var(--cc-red), var(--cc-orange), var(--cc-red), transparent);
}

@keyframes cc-edge-pulse {
    0%, 100% { opacity: 0.4; filter: blur(0px); }
    50%       { opacity: 1;   filter: blur(1px) drop-shadow(0 0 6px var(--cc-red)); }
}

/* ── Corner brackets ── */
.critical-corner {
    position: absolute;
    color: var(--cc-red);
    animation: cc-corner-pulse 2s ease-in-out infinite;
    filter: drop-shadow(0 0 6px var(--cc-red));
}
.critical-corner--tl { top: 12px;    left: 12px;  }
.critical-corner--tr { top: 12px;    right: 12px; }
.critical-corner--bl { bottom: 12px; left: 12px;  }
.critical-corner--br { bottom: 12px; right: 12px; }

/* Stagger corner animations for a living feel */
.critical-corner--tr { animation-delay: 0.5s; }
.critical-corner--bl { animation-delay: 1.0s; }
.critical-corner--br { animation-delay: 1.5s; }

@keyframes cc-corner-pulse {
    0%, 100% { opacity: 0.5; transform: scale(1);    color: var(--cc-red); }
    50%       { opacity: 1;   transform: scale(1.08); color: var(--cc-orange); }
}

/* ── Vignette ── */
.critical-vignette {
    position: absolute;
    inset: 0;
    background: radial-gradient(
        ellipse at center,
        transparent 55%,
        rgba(255, 45, 85, 0.08) 100%
    );
    animation: cc-vignette-pulse 3s ease-in-out infinite;
}
@keyframes cc-vignette-pulse {
    0%, 100% { opacity: 0.6; }
    50%       { opacity: 1;   }
}

/* ── Floating emergency pill (top-center) ── */
.critical-pill {
    pointer-events: all;    /* pill IS clickable */
    position: absolute;
    top: 10px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 5px 14px 5px 10px;
    background: rgba(15, 0, 5, 0.82);
    border: 1px solid rgba(255, 45, 85, 0.55);
    border-radius: 999px;
    backdrop-filter: blur(12px);
    box-shadow: 0 0 16px rgba(255, 45, 85, 0.35), 0 2px 8px rgba(0,0,0,0.5);
    animation: cc-pill-in 0.5s cubic-bezier(.34,1.56,.64,1) both;
    white-space: nowrap;
}
@keyframes cc-pill-in {
    from { opacity: 0; transform: translateX(-50%) translateY(-10px) scale(0.92); }
    to   { opacity: 1; transform: translateX(-50%) translateY(0)       scale(1);    }
}
.critical-pill__dot {
    width: 7px; height: 7px;
    border-radius: 50%;
    background: var(--cc-red);
    box-shadow: 0 0 6px var(--cc-red);
    animation: cc-dot-blink 1.2s ease-in-out infinite;
    flex-shrink: 0;
}
@keyframes cc-dot-blink {
    0%, 100% { opacity: 1; transform: scale(1); }
    50%       { opacity: 0.3; transform: scale(0.7); }
}
.critical-pill .material-symbols-outlined {
    color: var(--cc-red);
    flex-shrink: 0;
}
.critical-pill__text {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: #ffbac8;
    font-family: 'Courier New', monospace;
}
.critical-pill__sep {
    color: rgba(255,255,255,0.2);
    font-size: 11px;
}
.critical-pill__action {
    font-size: 11px;
    font-weight: 800;
    color: var(--cc-orange);
    cursor: pointer;
    text-decoration: underline;
    text-underline-offset: 2px;
    letter-spacing: 0.03em;
    transition: color 0.2s;
}
.critical-pill__action:hover { color: #fff; }
</style>
