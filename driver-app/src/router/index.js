import { createRouter, createWebHashHistory } from 'vue-router'
import { useDriverStore } from '../stores/driverStore.js'

/**
 * Route Architecture — Two layout shells, zero per-page layout boilerplate.
 *
 * App.vue
 *  └─ <RouterView>
 *       ├─ PublicLayout  (splash, login, login-help)
 *       │     └─ <RouterView>  ← full-screen, no BottomNav
 *       └─ MainLayout    (all authenticated routes)
 *             └─ <RouterView>  ← bounded by status-bar-spacer + BottomNav
 *
 * Child paths do NOT start with "/" so they inherit the parent "/" prefix correctly.
 * Adding a new authenticated screen = add one entry to MainLayout's children array.
 */
const routes = [

    // ── PUBLIC LAYOUT (no bottom navigation) ─────────────────────────────
    {
        path: '/',
        component: () => import('../layouts/PublicLayout.vue'),
        children: [
            {
                path: '',
                name: 'splash',
                component: () => import('../views/SplashScreen.vue'),
                meta: { public: true }
            },
            {
                path: 'login',
                name: 'login',
                component: () => import('../views/LoginScreen.vue'),
                meta: { public: true }
            },
            {
                path: 'login-help',
                name: 'login-help',
                component: () => import('../views/LoginHelp.vue'),
                meta: { public: true }
            },
        ]
    },

    // ── MAIN LAYOUT (authenticated — BottomNav + safe area automatic) ─────
    {
        path: '/',
        component: () => import('../layouts/MainLayout.vue'),
        children: [

            // ── Daily Start Flow ─────────────────────────
            {
                path: 'pre-shift',
                name: 'pre-shift',
                component: () => import('../views/PreShiftSafety.vue'),
                meta: { requiresAuth: true, hideNav: true }
            },
            {
                path: 'vehicle-binding',
                name: 'vehicle-binding',
                component: () => import('../views/VehicleBinding.vue'),
                meta: { requiresAuth: true, hideNav: true }
            },
            {
                path: 'vehicle-inspection',
                name: 'vehicle-inspection',
                component: () => import('../views/VehicleInspection.vue'),
                meta: { requiresAuth: true, hideNav: true }
            },

            // ── Main Dashboard ───────────────────────────
            {
                path: 'dashboard',
                name: 'dashboard',
                component: () => import('../views/CommandCenter.vue'),
                meta: { requiresAuth: true }
            },

            // ── Manifest & Route ─────────────────────────
            {
                path: 'manifest',
                name: 'manifest',
                component: () => import('../views/ManifestView.vue'),
                meta: { requiresAuth: true }
            },
            {
                path: 'stop/:id',
                name: 'stop-detail',
                component: () => import('../views/StopDetail.vue'),
                meta: { requiresAuth: true, hideNav: true }
            },
            {
                path: 'route-progress',
                name: 'route-progress',
                component: () => import('../views/RouteProgress.vue'),
                meta: { requiresAuth: true }
            },
            {
                path: 'navigation',
                name: 'navigation',
                component: () => import('../views/LiveNavigation.vue'),
                meta: { requiresAuth: true, hideNav: true }
            },

            // ── Load & Crew ──────────────────────────────
            {
                path: 'load-verify',
                name: 'load-verify',
                component: () => import('../views/LoadVerification.vue'),
                meta: { requiresAuth: true, hideNav: true }
            },
            {
                path: 'crew',
                name: 'crew',
                component: () => import('../views/CrewManagement.vue'),
                meta: { requiresAuth: true, hideNav: true }
            },
            {
                path: 'gate-exit',
                name: 'gate-exit',
                component: () => import('../views/GateExit.vue'),
                meta: { requiresAuth: true, hideNav: true }
            },

            // ── Geofence & Deviation ─────────────────────
            {
                path: 'geofence-arrival/:id',
                name: 'geofence-arrival',
                component: () => import('../views/GeofenceArrival.vue'),
                meta: { requiresAuth: true, hideNav: true }
            },
            {
                path: 'route-deviation',
                name: 'route-deviation',
                component: () => import('../views/RouteDeviation.vue'),
                meta: { requiresAuth: true, hideNav: true }
            },

            // ── Delivery Execution ───────────────────────
            {
                path: 'delivery/:id',
                name: 'delivery',
                component: () => import('../views/DeliveryExecution.vue'),
                meta: { requiresAuth: true, hideNav: true }
            },
            {
                path: 'exception/:id',
                name: 'exception',
                component: () => import('../views/DeliveryException.vue'),
                meta: { requiresAuth: true, hideNav: true }
            },
            {
                path: 'service-checklist/:id',
                name: 'service-checklist',
                component: () => import('../views/ServiceChecklist.vue'),
                meta: { requiresAuth: true, hideNav: true }
            },
            {
                path: 'pod/:id',
                name: 'pod',
                component: () => import('../views/ProofOfDelivery.vue'),
                meta: { requiresAuth: true, hideNav: true }
            },
            {
                path: 'cod/:id',
                name: 'cod',
                component: () => import('../views/CODPayment.vue'),
                meta: { requiresAuth: true, hideNav: true }
            },

            // ── Financial ────────────────────────────────
            {
                path: 'wallet',
                name: 'wallet',
                component: () => import('../views/DriverWallet.vue'),
                meta: { requiresAuth: true }
            },
            {
                path: 'fuel-receipt',
                name: 'fuel-receipt',
                component: () => import('../views/FuelReceipt.vue'),
                meta: { requiresAuth: true, hideNav: true }
            },

            // ── Communication & AI ───────────────────────
            {
                path: 'chat',
                name: 'chat',
                component: () => import('../views/DispatchChat.vue'),
                meta: { requiresAuth: true, hideNav: true }
            },
            {
                path: 'voice',
                name: 'voice',
                component: () => import('../views/VoiceAssistant.vue'),
                meta: { requiresAuth: true, hideNav: true }
            },

            // ── Crisis & Returns ─────────────────────────
            {
                path: 'crisis',
                name: 'crisis',
                component: () => import('../views/CrisisMode.vue'),
                meta: { requiresAuth: true, hideNav: true }
            },
            {
                path: 'returns',
                name: 'returns',
                component: () => import('../views/ReverseLogistics.vue'),
                meta: { requiresAuth: true, hideNav: true }
            },
            {
                path: 'damage-report',
                name: 'damage-report',
                component: () => import('../views/DamageReport.vue'),
                meta: { requiresAuth: true, hideNav: true }
            },

            // ── End of Day ───────────────────────────────
            {
                path: 'shift-summary',
                name: 'shift-summary',
                component: () => import('../views/ShiftSummary.vue'),
                meta: { requiresAuth: true, hideNav: true }
            },
            {
                path: 'vehicle-return',
                name: 'vehicle-return',
                component: () => import('../views/VehicleReturn.vue'),
                meta: { requiresAuth: true, hideNav: true }
            },

            // ── Reports & Safety ─────────────────────────
            {
                path: 'audit',
                name: 'audit',
                component: () => import('../views/AuditLog.vue'),
                meta: { requiresAuth: true, hideNav: true }
            },

            // ── Settings & Profile ───────────────────────
            {
                path: 'settings',
                name: 'settings',
                component: () => import('../views/Settings.vue'),
                meta: { requiresAuth: true, hideNav: true }
            },
            {
                path: 'offline',
                name: 'offline',
                component: () => import('../views/OfflineQueue.vue'),
                meta: { requiresAuth: true, hideNav: true }
            },
        ]
    },

    // ── Fallback ─────────────────────────────────────────────────────────
    {
        path: '/:pathMatch(.*)*',
        redirect: '/'
    }
]

const router = createRouter({
    history: createWebHashHistory(),
    routes,
    scrollBehavior() {
        return { top: 0 }
    }
})

import { useUiStore } from '../stores/uiStore.js'

// Navigation Guard
router.beforeEach((to, from, next) => {
    const driverStore = useDriverStore()
    const uiStore = useUiStore()

    if (to.name !== 'splash' && from.name !== undefined) {
        uiStore.setLoading(true)
    }

    if (to.meta.requiresAuth && !driverStore.isAuthenticated) {
        return next({ name: 'login' })
    }
    if (to.meta.public && driverStore.isAuthenticated && to.name === 'login') {
        return next({ name: 'dashboard' })
    }
    next()
})

router.afterEach(() => {
    const uiStore = useUiStore()
    setTimeout(() => {
        uiStore.setLoading(false)
    }, 600)
})

export default router
