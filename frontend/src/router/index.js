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
        // Landing Page
        {
            path: '/',
            name: 'Home',
            component: () => import('../LWDDVI-views/Home.vue'),
            meta: { layout: 'blank' }
        },
        // Authentication — AuthLayout handles view switching internally
        {
            path: '/login',
            name: 'SystemLogin',
            component: () => import('../layouts/AuthLayout.vue'),
            meta: { layout: 'blank', guest: true }
        },
        {
            path: '/register',
            name: 'SystemRegister',
            component: () => import('../layouts/AuthLayout.vue'),
            meta: { layout: 'blank', guest: true }
        },
        {
            path: '/verify-otp',
            name: 'VerifyOTP',
            component: () => import('../layouts/AuthLayout.vue'),
            meta: { layout: 'blank', guest: true }
        },
        {
            path: '/setup-tfa',
            name: 'SetupTFA',
            component: () => import('../layouts/AuthLayout.vue'),
            meta: { layout: 'blank', requiresAuth: true }
        },

        // Role-Based Dashboards
        {
            path: '/logistic/dashboard',
            name: 'LogisticDashboard',
            component: () => import('../LWD-views/LogisticManager/Dashboard.vue'),
            meta: { requiresAuth: true, layout: 'logistic' }
        },
        {
            path: '/dispatcher/dashboard',
            name: 'DispatcherDashboard',
            component: () => import('../LWD-views/Dispatcher/Dashboard.vue'),
            meta: { requiresAuth: true, layout: 'dispatcher' }
        },
        {
            path: '/warehouse/dashboard',
            name: 'WarehouseDashboard',
            component: () => import('../LWD-views/WarehouseManager/Dashboard.vue'),
            meta: { requiresAuth: true, layout: 'warehouse' }
        },

        // Individual User Routes
        { path: '/individual/dashboard', component: () => import('../IV-views/Individual/Dashboard.vue'), meta: { requiresAuth: true, layout: 'individual' } },
        { path: '/individual/book-move', component: () => import('../IV-views/Individual/BookMove.vue'), meta: { requiresAuth: true, layout: 'individual' } },
        { path: '/individual/orders', component: () => import('../IV-views/Individual/Orders.vue'), meta: { requiresAuth: true, layout: 'individual' } },
        { path: '/individual/quotes', component: () => import('../IV-views/Individual/Quotes.vue'), meta: { requiresAuth: true, layout: 'individual' } },
        { path: '/individual/estimator', component: () => import('../IV-views/Individual/Estimator.vue'), meta: { requiresAuth: true, layout: 'individual' } },
        { path: '/individual/payments', component: () => import('../IV-views/Individual/Payments.vue'), meta: { requiresAuth: true, layout: 'individual' } },
        { path: '/individual/support', component: () => import('../IV-views/Individual/Support.vue'), meta: { requiresAuth: true, layout: 'individual' } },
        { path: '/individual/profile', component: () => import('../IV-views/Individual/Profile.vue'), meta: { requiresAuth: true, layout: 'individual' } },
        { path: '/individual/tracking', component: () => import('../IV-views/Individual/Tracking.vue'), meta: { requiresAuth: true, layout: 'individual' } },
        { path: '/individual/damage-report', component: () => import('../IV-views/Individual/DamageReport.vue'), meta: { requiresAuth: true, layout: 'individual' } },
        { path: '/individual/settings', component: () => import('../IV-views/Individual/Settings.vue'), meta: { requiresAuth: true, layout: 'individual' } },

        // Vendor Routes
        { path: '/vendor/dashboard', component: () => import('../IV-views/Vendor/Dashboard.vue'), meta: { requiresAuth: true, layout: 'vendor' } },
        { path: '/vendor/create-shipment', component: () => import('../IV-views/Vendor/CreateShipment.vue'), meta: { requiresAuth: true, layout: 'vendor' } },
        { path: '/vendor/orders', component: () => import('../IV-views/Vendor/Orders.vue'), meta: { requiresAuth: true, layout: 'vendor' } },
        { path: '/vendor/tracking', component: () => import('../IV-views/Vendor/Tracking.vue'), meta: { requiresAuth: true, layout: 'vendor' } },
        { path: '/vendor/recurring', component: () => import('../IV-views/Vendor/RecurringShipments.vue'), meta: { requiresAuth: true, layout: 'vendor' } },
        { path: '/vendor/bulk-upload', component: () => import('../IV-views/Vendor/BulkUpload.vue'), meta: { requiresAuth: true, layout: 'vendor' } },
        { path: '/vendor/api-docs', component: () => import('../IV-views/Vendor/ApiDocs.vue'), meta: { requiresAuth: true, layout: 'blank' } },
        { path: '/vendor/proof-of-delivery', component: () => import('../IV-views/Vendor/ProofOfDelivery.vue'), meta: { requiresAuth: true, layout: 'vendor' } },
        { path: '/vendor/invoices', component: () => import('../IV-views/Vendor/Invoices.vue'), meta: { requiresAuth: true, layout: 'vendor' } },
        { path: '/vendor/analytics', component: () => import('../IV-views/Vendor/Analytics.vue'), meta: { requiresAuth: true, layout: 'vendor' } },
        { path: '/vendor/settings', component: () => import('../IV-views/Vendor/Settings.vue'), meta: { requiresAuth: true, layout: 'vendor' } },
        { path: '/vendor/support', component: () => import('../IV-views/Vendor/Support.vue'), meta: { requiresAuth: true, layout: 'vendor' } },

        // Logistic Manager Routes
        { path: '/logistic/warehouses', component: () => import('../LWD-views/LogisticManager/WarehouseManagement.vue'), meta: { requiresAuth: true, layout: 'logistic' } },
        { path: '/logistic/users', component: () => import('../LWD-views/LogisticManager/UserManagement.vue'), meta: { requiresAuth: true, layout: 'logistic' } },
        { path: '/logistic/fleet', component: () => import('../LWD-views/LogisticManager/FleetManagement.vue'), meta: { requiresAuth: true, layout: 'logistic' } },
        { path: '/logistic/geofencing', component: () => import('../LWD-views/LogisticManager/Geofencing.vue'), meta: { requiresAuth: true, layout: 'logistic' } },
        { path: '/logistic/finance', component: () => import('../LWD-views/LogisticManager/Finance.vue'), meta: { requiresAuth: true, layout: 'logistic' } },
        { path: '/logistic/rate-governance', component: () => import('../LWD-views/LogisticManager/RateGovernance.vue'), meta: { requiresAuth: true, layout: 'logistic' } },
        { path: '/logistic/reverse-logistics', component: () => import('../LWD-views/LogisticManager/ReverseLogistics.vue'), meta: { requiresAuth: true, layout: 'logistic' } },
        { path: '/logistic/reports', component: () => import('../LWD-views/LogisticManager/Reports.vue'), meta: { requiresAuth: true, layout: 'logistic' } },
        { path: '/logistic/comparative-viewers', component: () => import('../LWD-views/LogisticManager/ComparativeViewers.vue'), meta: { requiresAuth: true, layout: 'logistic' } },
        { path: '/logistic/ai', component: () => import('../LWD-views/LogisticManager/AIIntelligence.vue'), meta: { requiresAuth: true, layout: 'logistic' } },
        { path: '/logistic/communication', component: () => import('../LWD-views/LogisticManager/Communication.vue'), meta: { requiresAuth: true, layout: 'logistic' } },
        { path: '/logistic/meeting-room', component: () => import('../views/MeetingRoom/MeetingRoom.vue'), meta: { requiresAuth: true, layout: 'blank' } },

        // Dispatcher Routes
        { path: '/dispatcher/pending-queue', component: () => import('../LWD-views/Dispatcher/PendingDispatchQueue.vue'), meta: { requiresAuth: true, layout: 'dispatcher' } },
        { path: '/dispatcher/clustering', component: () => import('../LWD-views/Dispatcher/OrderClustering.vue'), meta: { requiresAuth: true, layout: 'dispatcher' } },
        { path: '/dispatcher/optimization', component: () => import('../LWD-views/Dispatcher/RouteOptimization.vue'), meta: { requiresAuth: true, layout: 'dispatcher' } },
        { path: '/dispatcher/load-balancing', component: () => import('../LWD-views/Dispatcher/LoadBalancing.vue'), meta: { requiresAuth: true, layout: 'dispatcher' } },
        { path: '/dispatcher/drivers', component: () => import('../LWD-views/Dispatcher/DriverManagement.vue'), meta: { requiresAuth: true, layout: 'dispatcher' } },
        { path: '/dispatcher/manifest', component: () => import('../LWD-views/Dispatcher/ManifestCenter.vue'), meta: { requiresAuth: true, layout: 'dispatcher' } },
        { path: '/dispatcher/service-moves', component: () => import('../LWD-views/Dispatcher/ServiceMoves.vue'), meta: { requiresAuth: true, layout: 'dispatcher' } },
        { path: '/dispatcher/order-status', component: () => import('../LWD-views/Dispatcher/OrderStatusControl.vue'), meta: { requiresAuth: true, layout: 'dispatcher' } },
        { path: '/dispatcher/crisis', component: () => import('../LWD-views/Dispatcher/CrisisManagement.vue'), meta: { requiresAuth: true, layout: 'dispatcher' } },
        { path: '/dispatcher/communication', component: () => import('../LWD-views/Dispatcher/Communication.vue'), meta: { requiresAuth: true, layout: 'dispatcher' } },
        { path: '/dispatcher/performance', component: () => import('../LWD-views/Dispatcher/PerformanceMetrics.vue'), meta: { requiresAuth: true, layout: 'dispatcher' } },
        { path: '/dispatcher/ai-assistant', component: () => import('../LWD-views/Dispatcher/SmartDispatcher.vue'), meta: { requiresAuth: true, layout: 'dispatcher' } },
        { path: '/dispatcher/meeting-room', component: () => import('../views/MeetingRoom/MeetingRoom.vue'), meta: { requiresAuth: true, layout: 'blank' } },

        // Warehouse Manager Routes
        { path: '/warehouse/inventory', component: () => import('../LWD-views/WarehouseManager/Inventory.vue'), meta: { requiresAuth: true, layout: 'warehouse' } },
        { path: '/warehouse/inbound', component: () => import('../LWD-views/WarehouseManager/Inbound.vue'), meta: { requiresAuth: true, layout: 'warehouse' } },
        { path: '/warehouse/floor-plan', component: () => import('../LWD-views/WarehouseManager/FloorPlan.vue'), meta: { requiresAuth: true, layout: 'warehouse' } },
        { path: '/warehouse/picking', component: () => import('../LWD-views/WarehouseManager/Picking.vue'), meta: { requiresAuth: true, layout: 'warehouse' } },
        { path: '/warehouse/dock', component: () => import('../LWD-views/WarehouseManager/LoadingDock.vue'), meta: { requiresAuth: true, layout: 'warehouse' } },
        { path: '/warehouse/returns', component: () => import('../LWD-views/WarehouseManager/ReturnsWarehouse.vue'), meta: { requiresAuth: true, layout: 'warehouse' } },
        { path: '/warehouse/labor', component: () => import('../LWD-views/WarehouseManager/LaborManagement.vue'), meta: { requiresAuth: true, layout: 'warehouse' } },
        { path: '/warehouse/ai', component: () => import('../LWD-views/WarehouseManager/SmartWMS.vue'), meta: { requiresAuth: true, layout: 'warehouse' } },
        { path: '/warehouse/new-orders', component: () => import('../LWD-views/WarehouseManager/NewOrders.vue'), meta: { requiresAuth: true, layout: 'warehouse' } },
        { path: '/warehouse/packing-materials', component: () => import('../LWD-views/WarehouseManager/PackingMaterials.vue'), meta: { requiresAuth: true, layout: 'warehouse' } },
        { path: '/warehouse/safety-stock', component: () => import('../LWD-views/WarehouseManager/SafetyStock.vue'), meta: { requiresAuth: true, layout: 'warehouse' } },
        { path: '/warehouse/performance', component: () => import('../LWD-views/WarehouseManager/Performance.vue'), meta: { requiresAuth: true, layout: 'warehouse' } },
        { path: '/warehouse/comparative-viewers', component: () => import('../LWD-views/WarehouseManager/ComparativeViewers.vue'), meta: { requiresAuth: true, layout: 'warehouse' } },
        { path: '/warehouse/meeting-room', component: () => import('../views/MeetingRoom/MeetingRoom.vue'), meta: { requiresAuth: true, layout: 'blank' } },

        // AI Support Module Routes
        { path: '/ai/dashboard', component: () => import('../ai-views/Dashboard.vue'), meta: { requiresAuth: true, layout: 'ai' } },
        { path: '/ai/contact-forms', component: () => import('../Ai-views/ContactForms.vue'), meta: { requiresAuth: true, layout: 'ai' } },
        { path: '/ai/live-conversations', component: () => import('../ai-views/LiveConversations.vue'), meta: { requiresAuth: true, layout: 'ai' } },
        { path: '/ai/escalations', component: () => import('../ai-views/EscalationCenter.vue'), meta: { requiresAuth: true, layout: 'ai' } },
        { path: '/ai/tickets', component: () => import('../ai-views/Tickets.vue'), meta: { requiresAuth: true, layout: 'ai' } },
        { path: '/ai/reverse-logistics', component: () => import('../ai-views/ReverseLogistics.vue'), meta: { requiresAuth: true, layout: 'ai' } },
        { path: '/ai/refund-center', component: () => import('../ai-views/RefundCenter.vue'), meta: { requiresAuth: true, layout: 'ai' } },
        { path: '/ai/analytics', component: () => import('../ai-views/AIAnalytics.vue'), meta: { requiresAuth: true, layout: 'ai' } },
        { path: '/ai/knowledge-base', component: () => import('../ai-views/KnowledgeBase.vue'), meta: { requiresAuth: true, layout: 'ai' } },
        { path: '/ai/legal', component: () => import('../ai-views/LegalCompliance.vue'), meta: { requiresAuth: true, layout: 'ai' } },
        { path: '/ai/settings', component: () => import('../ai-views/Settings.vue'), meta: { requiresAuth: true, layout: 'ai' } },

        {
            path: '/driver/route-progress',
            name: 'RouteProgress',
            component: () => import('../driver-views/RouteProgress.vue'),
            meta: { requiresAuth: true, layout: 'driver' }
        },
        {
            path: '/driver/',
            redirect: '/driver/splash',
            meta: { layout: 'blank' }
        },
        {
            path: '/driver/splash',
            name: 'splash',
            component: SplashScreen
        },
        {
            path: '/driver/login',
            name: 'login',
            component: LoginScreen
        },
        {
            path: '/driver/vehicle-binding',
            name: 'vehicle-binding',
            component: VehicleBinding,
            meta: { requiresAuth: true, layout: 'driver' }
        },
        {
            path: '/driver/vehicle-inspection',
            name: 'vehicle-inspection',
            component: VehicleInspection,
            meta: { requiresAuth: true, layout: 'driver' }
        },
        {
            path: '/driver/pre-shift-safety',
            name: 'pre-shift-safety',
            component: () => import('../driver-views/PreShiftSafety.vue'),
            meta: { requiresAuth: true, layout: 'driver' }
        },
        {
            path: '/driver/crew-checkin',
            name: 'crew-checkin',
            component: CrewCheckIn,
            meta: { requiresAuth: true, layout: 'driver' }
        },
        {
            path: '/driver/dashboard',
            name: 'dashboard',
            component: CommandCenter,
            meta: { requiresAuth: true, layout: 'driver' }
        },
        {
            path: '/driver/manifest',
            name: 'manifest',
            component: ManifestView,
            meta: { requiresAuth: true, layout: 'driver' }
        },
        {
            path: '/driver/load-verification',
            name: 'load-verification',
            component: LoadVerification,
            meta: { requiresAuth: true, layout: 'driver' }
        },
        {
            path: '/driver/navigation',
            name: 'navigation',
            component: LiveNavigation,
            meta: { requiresAuth: true, layout: 'driver' }
        },
        {
            path: '/driver/arrival/:stopId',
            name: 'arrival',
            component: GeofenceArrival,
            meta: { requiresAuth: true, layout: 'driver' }
        },
        {
            path: '/driver/delivery/:stopId',
            name: 'delivery',
            component: DeliveryExecution,
            meta: { requiresAuth: true, layout: 'driver' }
        },
        {
            path: '/driver/pickup/:stopId',
            name: 'pickup',
            component: () => import('../driver-views/PickupExecution.vue'),
            meta: { requiresAuth: true, layout: 'driver' }
        },
        {
            path: '/driver/proof-of-delivery/:stopId',
            name: 'proof-of-delivery',
            component: ProofOfDelivery,
            meta: { requiresAuth: true, layout: 'driver' }
        },
        {
            path: '/driver/cod-payment/:stopId',
            name: 'cod-payment',
            component: CODPayment,
            meta: { requiresAuth: true, layout: 'driver' }
        },
        {
            path: '/driver/route-deviation',
            name: 'route-deviation',
            component: RouteDeviation,
            meta: { requiresAuth: true, layout: 'driver' }
        },
        {
            path: '/driver/damage-report',
            name: 'damage-report',
            component: DamageReport,
            meta: { requiresAuth: true, layout: 'driver' }
        },
        {
            path: '/driver/crisis',
            name: 'crisis',
            component: CrisisMode,
            meta: { requiresAuth: true, layout: 'driver' }
        },
        {
            path: '/driver/fuel-receipt',
            name: 'fuel-receipt',
            component: FuelReceipt,
            meta: { requiresAuth: true, layout: 'driver' }
        },
        {
            path: '/driver/wallet',
            name: 'wallet',
            component: DriverWallet,
            meta: { requiresAuth: true, layout: 'driver' }
        },
        {
            path: '/driver/safety-score',
            name: 'safety-score',
            component: SafetyScore,
            meta: { requiresAuth: true, layout: 'driver' }
        },
        {
            path: '/driver/shift-summary',
            name: 'shift-summary',
            component: ShiftSummary,
            meta: { requiresAuth: true, layout: 'driver' }
        },
        {
            path: '/driver/offline-queue',
            name: 'offline-queue',
            component: OfflineQueue,
            meta: { requiresAuth: true, layout: 'driver' }
        },
        {
            path: '/driver/warehouse-return',
            name: 'warehouse-return',
            component: () => import('../driver-views/WarehouseReturn.vue'),
            meta: { requiresAuth: true, layout: 'driver' }
        },
        {
            path: '/driver/chat',
            name: 'chat',
            component: () => import('../driver-views/DispatchChat.vue'),
            meta: { requiresAuth: true, layout: 'driver' }
        },
        {
            path: '/driver/vehicle-return',
            name: 'vehicle-return',
            component: () => import('../driver-views/VehicleReturn.vue'),
            meta: { requiresAuth: true, layout: 'driver' }
        },
        {
            path: '/driver/audit-log',
            name: 'audit-log',
            component: () => import('../driver-views/AuditLog.vue'),
            meta: { requiresAuth: true, layout: 'driver' }
        },
        {
            path: '/driver/gate-exit',
            name: 'gate-exit',
            component: () => import('../driver-views/GateExit.vue'),
            meta: { requiresAuth: true, layout: 'driver' }
        },
        {
            path: '/driver/settings',
            name: 'settings',
            component: Settings,
            meta: { requiresAuth: true, layout: 'driver' }
        },
        // Public pages
        {
            path: '/forgot-password',
            name: 'ForgotPassword',
            component: () => import('../layouts/AuthLayout.vue'),
            meta: { layout: 'blank', guest: true }
        },
        {
            path: '/about',
            name: 'About',
            component: () => import('../LWDDVI-views/About.vue'),
            meta: { layout: 'blank' }
        },
        {
            path: '/article',
            name: 'Article',
            component: () => import('../LWDDVI-views/Article.vue'),
            meta: { layout: 'blank' }
        },
        {
            path: '/contact',
            name: 'Contact',
            component: () => import('../LWDDVI-views/Contact.vue'),
            meta: { layout: 'blank' }
        },
        {
            path: '/terms',
            name: 'Terms',
            component: () => import('../LWDDVI-views/Terms.vue'),
            meta: { layout: 'blank' }
        },
        {
            path: '/privacy',
            name: 'Privacy',
            component: () => import('../LWDDVI-views/Privacy.vue'),
            meta: { layout: 'blank' }
        },
        {
            path: '/offline',
            name: 'NoInternet',
            component: () => import('../views/NoInternet.vue'),
            meta: { layout: 'blank' }
        },
        {
            path: '/:pathMatch(.*)*',
            name: 'NotFound',
            component: () => import('../views/NotFound.vue'),
            meta: { layout: 'blank' }
        }
    ]
})

// Navigation guard for authentication
router.beforeEach((to, from, next) => {
    // Use auth store for authentication checks
    const isAuthenticated = !!localStorage.getItem('auth_token')

    // Guest-only routes (login, register) — redirect if already logged in
    if (to.meta.guest && isAuthenticated) {
        const user = JSON.parse(localStorage.getItem('auth_user') || '{}')
        const roleMap = {
            'logistics_manager': '/logistic/dashboard',
            'warehouse_manager': '/warehouse/dashboard',
            'dispatcher': '/dispatcher/dashboard',
            'driver': '/driver/dashboard',
            'vendor': '/vendor/dashboard',
            'customer': '/individual/dashboard',
            'ai_support': '/ai/dashboard'
        }
        next(roleMap[user.role] || '/individual/dashboard')
        return
    }

    // Auth-required routes — redirect to login if not authenticated
    if (to.meta.requiresAuth && !isAuthenticated) {
        next({ path: '/login', query: { redirect: to.fullPath } })
        return
    }

    next()
})

export default router

