import { createRouter, createWebHashHistory } from 'vue-router'
import { useDriverStore } from '../stores/driverStore.js'

const routes = [
    // ── Onboarding ──────────────────────────────
    {
        path: '/',
        name: 'splash',
        component: () => import('../views/SplashScreen.vue'),
        meta: { public: true }
    },
    {
        path: '/login',
        name: 'login',
        component: () => import('../views/LoginScreen.vue'),
        meta: { public: true }
    },

    // ── Daily Start Flow ─────────────────────────
    {
        path: '/pre-shift',
        name: 'pre-shift',
        component: () => import('../views/PreShiftSafety.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/vehicle-binding',
        name: 'vehicle-binding',
        component: () => import('../views/VehicleBinding.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/vehicle-inspection',
        name: 'vehicle-inspection',
        component: () => import('../views/VehicleInspection.vue'),
        meta: { requiresAuth: true }
    },

    // ── Main Dashboard ───────────────────────────
    {
        path: '/dashboard',
        name: 'dashboard',
        component: () => import('../views/CommandCenter.vue'),
        meta: { requiresAuth: true }
    },

    // ── Manifest & Route ─────────────────────────
    {
        path: '/manifest',
        name: 'manifest',
        component: () => import('../views/ManifestView.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/stop/:id',
        name: 'stop-detail',
        component: () => import('../views/StopDetail.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/route-progress',
        name: 'route-progress',
        component: () => import('../views/RouteProgress.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/navigation',
        name: 'navigation',
        component: () => import('../views/LiveNavigation.vue'),
        meta: { requiresAuth: true }
    },

    // ── Load & Crew ──────────────────────────────
    {
        path: '/load-verify',
        name: 'load-verify',
        component: () => import('../views/LoadVerification.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/crew',
        name: 'crew',
        component: () => import('../views/CrewManagement.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/gate-exit',
        name: 'gate-exit',
        component: () => import('../views/GateExit.vue'),
        meta: { requiresAuth: true }
    },

    // ── Geofence & Deviation ─────────────────────
    {
        path: '/geofence-arrival/:id',
        name: 'geofence-arrival',
        component: () => import('../views/GeofenceArrival.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/route-deviation',
        name: 'route-deviation',
        component: () => import('../views/RouteDeviation.vue'),
        meta: { requiresAuth: true }
    },

    // ── Delivery Execution ───────────────────────
    {
        path: '/delivery/:id',
        name: 'delivery',
        component: () => import('../views/DeliveryExecution.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/service-checklist/:id',
        name: 'service-checklist',
        component: () => import('../views/ServiceChecklist.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/pod/:id',
        name: 'pod',
        component: () => import('../views/ProofOfDelivery.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/cod/:id',
        name: 'cod',
        component: () => import('../views/CODPayment.vue'),
        meta: { requiresAuth: true }
    },

    // ── Financial ────────────────────────────────
    {
        path: '/wallet',
        name: 'wallet',
        component: () => import('../views/DriverWallet.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/fuel-receipt',
        name: 'fuel-receipt',
        component: () => import('../views/FuelReceipt.vue'),
        meta: { requiresAuth: true }
    },

    // ── Communication & AI ───────────────────────
    {
        path: '/chat',
        name: 'chat',
        component: () => import('../views/DispatchChat.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/voice',
        name: 'voice',
        component: () => import('../views/VoiceAssistant.vue'),
        meta: { requiresAuth: true }
    },

    // ── Crisis & Returns ─────────────────────────
    {
        path: '/crisis',
        name: 'crisis',
        component: () => import('../views/CrisisMode.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/returns',
        name: 'returns',
        component: () => import('../views/ReverseLogistics.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/damage-report',
        name: 'damage-report',
        component: () => import('../views/DamageReport.vue'),
        meta: { requiresAuth: true }
    },

    // ── End of Day ───────────────────────────────
    {
        path: '/shift-summary',
        name: 'shift-summary',
        component: () => import('../views/ShiftSummary.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/vehicle-return',
        name: 'vehicle-return',
        component: () => import('../views/VehicleReturn.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/audit',
        name: 'audit',
        component: () => import('../views/AuditLog.vue'),
        meta: { requiresAuth: true }
    },

    // ── Settings & Profile ───────────────────────
    {
        path: '/settings',
        name: 'settings',
        component: () => import('../views/Settings.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/offline',
        name: 'offline',
        component: () => import('../views/OfflineQueue.vue'),
        meta: { requiresAuth: true }
    },

    // ── Fallback ─────────────────────────────────
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

// Navigation Guard
router.beforeEach((to) => {
    const driverStore = useDriverStore()
    if (to.meta.requiresAuth && !driverStore.isAuthenticated) {
        return { name: 'login' }
    }
    if (to.meta.public && driverStore.isAuthenticated && to.name === 'login') {
        return { name: 'dashboard' }
    }
})

export default router
