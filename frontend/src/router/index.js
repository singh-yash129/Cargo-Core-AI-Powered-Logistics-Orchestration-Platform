import { createRouter, createWebHistory } from 'vue-router'

// Import views (will be created)
import SplashScreen from '../driver-views/SplashScreen.vue'
import LoginScreen from '../driver-views/LoginScreen.vue'
import VehicleBinding from '../driver-views/VehicleBinding.vue'
import VehicleInspection from '../driver-views/VehicleInspection.vue'
import CrewCheckIn from '../driver-views/CrewCheckIn.vue'
import CommandCenter from '../driver-views/CommandCenter.vue'
import ManifestView from '../driver-views/ManifestView.vue'
import LoadVerification from '../driver-views/LoadVerification.vue'
import LiveNavigation from '../driver-views/LiveNavigation.vue'
import GeofenceArrival from '../driver-views/GeofenceArrival.vue'
import DeliveryExecution from '../driver-views/DeliveryExecution.vue'
import ProofOfDelivery from '../driver-views/ProofOfDelivery.vue'
import CODPayment from '../driver-views/CODPayment.vue'
import RouteDeviation from '../driver-views/RouteDeviation.vue'
import DamageReport from '../driver-views/DamageReport.vue'
import CrisisMode from '../driver-views/CrisisMode.vue'
import FuelReceipt from '../driver-views/FuelReceipt.vue'
import DriverWallet from '../driver-views/DriverWallet.vue'
import SafetyScore from '../driver-views/SafetyScore.vue'
import ShiftSummary from '../driver-views/ShiftSummary.vue'
import OfflineQueue from '../driver-views/OfflineQueue.vue'
import Settings from '../driver-views/Settings.vue'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/route-progress',
            name: 'RouteProgress',
            component: () => import('../driver-views/RouteProgress.vue'),
            meta: { requiresAuth: true, layout: 'driver' }
        },
        {
            path: '/',
            redirect: '/splash',
            meta: { layout: 'blank' }
        },
        {
            path: '/splash',
            name: 'splash',
            component: SplashScreen
        },
        {
            path: '/login',
            name: 'login',
            component: LoginScreen
        },
        {
            path: '/vehicle-binding',
            name: 'vehicle-binding',
            component: VehicleBinding,
            meta: { requiresAuth: true, layout: 'driver' }
        },
        {
            path: '/vehicle-inspection',
            name: 'vehicle-inspection',
            component: VehicleInspection,
            meta: { requiresAuth: true, layout: 'driver' }
        },
        {
            path: '/pre-shift-safety',
            name: 'pre-shift-safety',
            component: () => import('../driver-views/PreShiftSafety.vue'),
            meta: { requiresAuth: true, layout: 'driver' }
        },
        {
            path: '/crew-checkin',
            name: 'crew-checkin',
            component: CrewCheckIn,
            meta: { requiresAuth: true, layout: 'driver' }
        },
        {
            path: '/dashboard',
            name: 'dashboard',
            component: CommandCenter,
            meta: { requiresAuth: true, layout: 'driver' }
        },
        {
            path: '/manifest',
            name: 'manifest',
            component: ManifestView,
            meta: { requiresAuth: true, layout: 'driver' }
        },
        {
            path: '/load-verification',
            name: 'load-verification',
            component: LoadVerification,
            meta: { requiresAuth: true, layout: 'driver' }
        },
        {
            path: '/navigation',
            name: 'navigation',
            component: LiveNavigation,
            meta: { requiresAuth: true, layout: 'driver' }
        },
        {
            path: '/arrival/:stopId',
            name: 'arrival',
            component: GeofenceArrival,
            meta: { requiresAuth: true, layout: 'driver' }
        },
        {
            path: '/delivery/:stopId',
            name: 'delivery',
            component: DeliveryExecution,
            meta: { requiresAuth: true, layout: 'driver' }
        },
        {
            path: '/pickup/:stopId',
            name: 'pickup',
            component: () => import('../driver-views/PickupExecution.vue'),
            meta: { requiresAuth: true, layout: 'driver' }
        },
        {
            path: '/proof-of-delivery/:stopId',
            name: 'proof-of-delivery',
            component: ProofOfDelivery,
            meta: { requiresAuth: true, layout: 'driver' }
        },
        {
            path: '/cod-payment/:stopId',
            name: 'cod-payment',
            component: CODPayment,
            meta: { requiresAuth: true, layout: 'driver' }
        },
        {
            path: '/route-deviation',
            name: 'route-deviation',
            component: RouteDeviation,
            meta: { requiresAuth: true, layout: 'driver' }
        },
        {
            path: '/damage-report',
            name: 'damage-report',
            component: DamageReport,
            meta: { requiresAuth: true, layout: 'driver' }
        },
        {
            path: '/crisis',
            name: 'crisis',
            component: CrisisMode,
            meta: { requiresAuth: true, layout: 'driver' }
        },
        {
            path: '/fuel-receipt',
            name: 'fuel-receipt',
            component: FuelReceipt,
            meta: { requiresAuth: true, layout: 'driver' }
        },
        {
            path: '/wallet',
            name: 'wallet',
            component: DriverWallet,
            meta: { requiresAuth: true, layout: 'driver' }
        },
        {
            path: '/safety-score',
            name: 'safety-score',
            component: SafetyScore,
            meta: { requiresAuth: true, layout: 'driver' }
        },
        {
            path: '/shift-summary',
            name: 'shift-summary',
            component: ShiftSummary,
            meta: { requiresAuth: true, layout: 'driver' }
        },
        {
            path: '/offline-queue',
            name: 'offline-queue',
            component: OfflineQueue,
            meta: { requiresAuth: true, layout: 'driver' }
        },
        {
            path: '/warehouse-return',
            name: 'warehouse-return',
            component: () => import('../driver-views/WarehouseReturn.vue'),
            meta: { requiresAuth: true, layout: 'driver' }
        },
        {
            path: '/chat',
            name: 'chat',
            component: () => import('../driver-views/DispatchChat.vue'),
            meta: { requiresAuth: true, layout: 'driver' }
        },
        {
            path: '/vehicle-return',
            name: 'vehicle-return',
            component: () => import('../driver-views/VehicleReturn.vue'),
            meta: { requiresAuth: true, layout: 'driver' }
        },
        {
            path: '/audit-log',
            name: 'audit-log',
            component: () => import('../driver-views/AuditLog.vue'),
            meta: { requiresAuth: true, layout: 'driver' }
        },
        {
            path: '/gate-exit',
            name: 'gate-exit',
            component: () => import('../driver-views/GateExit.vue'),
            meta: { requiresAuth: true, layout: 'driver' }
        },
        {
            path: '/settings',
            name: 'settings',
            component: Settings,
            meta: { requiresAuth: true, layout: 'driver' }
        }
    ]
})

// Navigation guard for authentication
router.beforeEach((to, from, next) => {
    const isAuthenticated = localStorage.getItem('driverAuthenticated') === 'true'

    if (to.meta.requiresAuth && !isAuthenticated) {
        next({ name: 'login' })
    } else {
        next()
    }
})

export default router
