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
                meta: { requiresAuth: false, hideNav: true }
            },
            {
                path: 'vehicle-binding',
                name: 'vehicle-binding',
                component: () => import('../views/VehicleBinding.vue'),
                meta: { requiresAuth: false, hideNav: true }
            },
            {
                path: 'vehicle-inspection',
                name: 'vehicle-inspection',
                component: () => import('../views/VehicleInspection.vue'),
                meta: { requiresAuth: false, hideNav: true }
            },

            // ── Main Dashboard ───────────────────────────
            {
                path: 'dashboard',
                name: 'dashboard',
                component: () => import('../views/CommandCenter.vue'),
                meta: { requiresAuth: false }
            },

            // ── Manifest & Route ─────────────────────────
            {
                path: 'manifest',
                name: 'manifest',
                component: () => import('../views/ManifestView.vue'),
                meta: { requiresAuth: false }
            },
            {
                path: 'stop/:id',
                name: 'stop-detail',
                component: () => import('../views/StopDetail.vue'),
                meta: { requiresAuth: false, hideNav: true }
            },
            {
                path: 'route-progress',
                name: 'route-progress',
                component: () => import('../views/RouteProgress.vue'),
                meta: { requiresAuth: false }
            },
            {
                path: 'navigation',
                name: 'navigation',
                component: () => import('../views/LiveNavigation.vue'),
                meta: { requiresAuth: false, hideNav: true }
            },

            // ── Load & Crew ──────────────────────────────
            {
                path: 'load-verify',
                name: 'load-verify',
                component: () => import('../views/LoadVerification.vue'),
                meta: { requiresAuth: false, hideNav: true }
            },
            {
                path: 'crew',
                name: 'crew',
                component: () => import('../views/CrewManagement.vue'),
                meta: { requiresAuth: false, hideNav: true }
            },
            {
                path: 'gate-exit',
                name: 'gate-exit',
                component: () => import('../views/GateExit.vue'),
                meta: { requiresAuth: false, hideNav: true }
            },

            // ── Geofence & Deviation ─────────────────────
            {
                path: 'geofence-arrival/:id',
                name: 'geofence-arrival',
                component: () => import('../views/GeofenceArrival.vue'),
                meta: { requiresAuth: false, hideNav: true }
            },
            {
                path: 'route-deviation',
                name: 'route-deviation',
                component: () => import('../views/RouteDeviation.vue'),
                meta: { requiresAuth: false, hideNav: true }
            },

            // ── Delivery Execution ───────────────────────
            {
                path: 'delivery/:id',
                name: 'delivery',
                component: () => import('../views/DeliveryExecution.vue'),
                meta: { requiresAuth: false, hideNav: true }
            },
            {
                path: 'exception/:id',
                name: 'exception',
                component: () => import('../views/DeliveryException.vue'),
                meta: { requiresAuth: false, hideNav: true }
            },
            {
                path: 'service-checklist/:id',
                name: 'service-checklist',
                component: () => import('../views/ServiceChecklist.vue'),
                meta: { requiresAuth: false, hideNav: true }
            },
            {
                path: 'pod/:id',
                name: 'pod',
                component: () => import('../views/ProofOfDelivery.vue'),
                meta: { requiresAuth: false, hideNav: true }
            },
            {
                path: 'cod/:id',
                name: 'cod',
                component: () => import('../views/CODPayment.vue'),
                meta: { requiresAuth: false, hideNav: true }
            },

            // ── Parcel Pickup Flow ──────────────────────
            {
                path: 'pickup-arrival/:id',
                name: 'pickup-arrival',
                component: () => import('../views/PickupArrival.vue'),
                meta: { requiresAuth: false, hideNav: true }
            },
            {
                path: 'pickup-scanning/:id',
                name: 'pickup-scanning',
                component: () => import('../views/ItemScanning.vue'),
                meta: { requiresAuth: false, hideNav: true }
            },
            {
                path: 'pickup-signature/:id',
                name: 'pickup-signature',
                component: () => import('../views/PickupSignature.vue'),
                meta: { requiresAuth: false, hideNav: true }
            },
            {
                path: 'warehouse-return',
                name: 'warehouse-return',
                component: () => import('../views/WarehouseReturn.vue'),
                meta: { requiresAuth: false, hideNav: true }
            },
            {
                path: 'unload-verification',
                name: 'unload-verification',
                component: () => import('../views/UnloadVerification.vue'),
                meta: { requiresAuth: false, hideNav: true }
            },

            // ── Financial ────────────────────────────────
            {
                path: 'wallet',
                name: 'wallet',
                component: () => import('../views/DriverWallet.vue'),
                meta: { requiresAuth: false }
            },
            {
                path: 'fuel-receipt',
                name: 'fuel-receipt',
                component: () => import('../views/FuelReceipt.vue'),
                meta: { requiresAuth: false, hideNav: true }
            },

            // ── Communication & AI ───────────────────────
            {
                path: 'chat',
                name: 'chat',
                component: () => import('../views/DispatchChat.vue'),
                meta: { requiresAuth: false, hideNav: true }
            },
            {
                path: 'voice',
                name: 'voice',
                component: () => import('../views/VoiceAssistant.vue'),
                meta: { requiresAuth: false, hideNav: true }
            },

            // ── Crisis & Returns ─────────────────────────
            {
                path: 'crisis',
                name: 'crisis',
                component: () => import('../views/CrisisMode.vue'),
                meta: { requiresAuth: false, hideNav: true }
            },
            {
                path: 'returns',
                name: 'returns',
                component: () => import('../views/ReverseLogistics.vue'),
                meta: { requiresAuth: false, hideNav: true }
            },
            {
                path: 'damage-report',
                name: 'damage-report',
                component: () => import('../views/DamageReport.vue'),
                meta: { requiresAuth: false, hideNav: true }
            },

            // ── End of Day ───────────────────────────────
            {
                path: 'shift-summary',
                name: 'shift-summary',
                component: () => import('../views/ShiftSummary.vue'),
                meta: { requiresAuth: false, hideNav: true }
            },
            {
                path: 'vehicle-return',
                name: 'vehicle-return',
                component: () => import('../views/VehicleReturn.vue'),
                meta: { requiresAuth: false, hideNav: true }
            },

            // ── Reports & Safety ─────────────────────────
            {
                path: 'audit',
                name: 'audit',
                component: () => import('../views/AuditLog.vue'),
                meta: { requiresAuth: false, hideNav: true }
            },

            // ── Settings & Profile ───────────────────────
            {
                path: 'settings',
                name: 'settings',
                component: () => import('../views/Settings.vue'),
                meta: { requiresAuth: false, hideNav: true }
            },
            {
                path: 'offline',
                name: 'offline',
                component: () => import('../views/OfflineQueue.vue'),
                meta: { requiresAuth: false, hideNav: true }
            },
            {
                path: 'notifications',
                name: 'notifications',
                component: () => import('../views/NotificationCenter.vue'),
                meta: { requiresAuth: false, hideNav: true }
            },
        ]
    },

    // ── Camera Screens (full-screen native, no nav, no auth flow guard) ──
    {
        path: '/camera',
        component: () => import('../layouts/CameraLayout.vue'),
        meta: { cameraScreen: true },
        children: [
            {
                path: 'qr',
                name: 'camera-qr',
                component: () => import('../components/scanners/PremiumQrScanner.vue'),
                meta: { cameraScreen: true }
            },
            {
                path: 'photo',
                name: 'camera-photo',
                component: () => import('../components/scanners/PremiumCameraView.vue'),
                meta: { cameraScreen: true }
            },
            {
                path: 'ocr',
                name: 'camera-ocr',
                component: () => import('../components/scanners/PremiumOcrScanner.vue'),
                meta: { cameraScreen: true }
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

    // Camera screens bypass all auth and flow guards
    if (to.meta.cameraScreen) return next()

    if (to.meta.requiresAuth && !driverStore.isAuthenticated) {
        return next({ name: 'login' })
    }
    if (to.meta.public && driverStore.isAuthenticated && to.name === 'login') {
        return next({ name: driverStore.preShiftDone ? 'dashboard' : 'pre-shift' })
    }

    // ── Shift flow enforcement ─────────────────────────────────
    // Pages that are always accessible once authenticated (no flow guard)
    const flowExempt = ['pre-shift', 'settings', 'notifications']
    if (to.meta.requiresAuth && !flowExempt.includes(to.name)) {
        // Must complete pre-shift before anything else
        if (!driverStore.preShiftDone) {
            return next({ name: 'pre-shift' })
        }
        // Must bind vehicle before inspection+
        if (!driverStore.vehicleBound && to.name !== 'vehicle-binding') {
            return next({ name: 'vehicle-binding' })
        }
        // Must inspect before crew+
        if (!driverStore.inspectionDone && !['vehicle-binding', 'vehicle-inspection'].includes(to.name)) {
            return next({ name: 'vehicle-inspection' })
        }
        // Must check crew before load+
        if (!driverStore.crewCheckedIn && !['vehicle-binding', 'vehicle-inspection', 'crew'].includes(to.name)) {
            return next({ name: 'crew' })
        }
        // Must verify load before gate+
        if (!driverStore.loadVerified && !['vehicle-binding', 'vehicle-inspection', 'crew', 'load-verify'].includes(to.name)) {
            return next({ name: 'load-verify' })
        }
        // Must pass gate before main app
        if (!driverStore.gateExited && !['vehicle-binding', 'vehicle-inspection', 'crew', 'load-verify', 'gate-exit'].includes(to.name)) {
            return next({ name: 'gate-exit' })
        }
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
