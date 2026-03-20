import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  {
    path: '/',
    name: 'LandingHome',
    component: () => import('../pages/LandingHome.vue'),
  },
  {
    path: '/login-hub',
    name: 'MainLoginHub',
    component: () => import('../pages/MainLoginHub.vue'),
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../pages/Login.vue'),
  },
  {
    path: '/login/:role',
    name: 'RoleLogin',
    component: () => import('../pages/RoleLogin.vue'),
  },
  {
    path: '/signup',
    name: 'SignupWizard',
    component: () => import('../pages/SignupWizard.vue'),
  },
  {
    path: '/2fa',
    name: 'TwoFactorAuth',
    component: () => import('../pages/TwoFactorAuth.vue'),
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: () => import('../pages/ForgotPassword.vue'),
  },
  {
    path: '/reset-password',
    name: 'ResetPassword',
    component: () => import('../pages/ResetPassword.vue'),
  },
  {
    path: '/signup-success',
    name: 'SignupSuccess',
    component: () => import('../pages/SignupSuccess.vue'),
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../pages/Dashboard.vue'),
  },
  {
    path: '/individual',
    component: () => import('../layouts/IndividualLayout.vue'),
    children: [
      {
        path: 'dashboard',
        name: 'IndividualDashboard',
        component: () => import('../IV-views/Individual/Dashboard.vue'),
      },
      {
        path: 'book-move',
        name: 'IndividualBookMove',
        component: () => import('../IV-views/Individual/BookMove.vue'),
      },
      {
        path: 'orders',
        name: 'IndividualOrders',
        component: () => import('../IV-views/Individual/Orders.vue'),
      },
      {
        path: 'quotes',
        name: 'IndividualQuotes',
        component: () => import('../IV-views/Individual/Quotes.vue'),
      },
      {
        path: 'estimator',
        name: 'IndividualEstimator',
        component: () => import('../IV-views/Individual/Estimator.vue'),
      },
      {
        path: 'payments',
        name: 'IndividualPayments',
        component: () => import('../IV-views/Individual/Payments.vue'),
      },
      {
        path: 'support',
        name: 'IndividualSupport',
        component: () => import('../IV-views/Individual/Support.vue'),
      },
      {
        path: 'profile',
        name: 'IndividualProfile',
        component: () => import('../IV-views/Individual/Profile.vue'),
      },
      {
        path: 'tracking',
        name: 'IndividualTracking',
        component: () => import('../IV-views/Individual/Tracking.vue'),
      },
      {
        path: 'damage-report',
        name: 'IndividualDamageReport',
        component: () => import('../IV-views/Individual/DamageReport.vue'),
      },
      {
        path: 'settings',
        name: 'IndividualSettings',
        component: () => import('../IV-views/Individual/Settings.vue'),
      },
    ],
  },
  {
    path: '/vendor',
    component: () => import('../layouts/VendorLayout.vue'),
    children: [
      {
        path: 'dashboard',
        name: 'VendorDashboard',
        component: () => import('../IV-views/Vendor/Dashboard.vue'),
      },
      {
        path: 'create-shipment',
        name: 'VendorCreateShipment',
        component: () => import('../IV-views/Vendor/CreateShipment.vue'),
      },
      {
        path: 'orders',
        name: 'VendorOrders',
        component: () => import('../IV-views/Vendor/Orders.vue'),
      },
      {
        path: 'tracking',
        name: 'VendorTracking',
        component: () => import('../IV-views/Vendor/Tracking.vue'),
      },
      {
        path: 'recurring',
        name: 'VendorRecurring',
        component: () => import('../IV-views/Vendor/RecurringShipments.vue'),
      },
      {
        path: 'bulk-upload',
        name: 'VendorBulkUpload',
        component: () => import('../IV-views/Vendor/BulkUpload.vue'),
      },
      {
        path: 'proof-of-delivery',
        name: 'VendorProofOfDelivery',
        component: () => import('../IV-views/Vendor/ProofOfDelivery.vue'),
      },
      {
        path: 'invoices',
        name: 'VendorInvoices',
        component: () => import('../IV-views/Vendor/Invoices.vue'),
      },
      {
        path: 'analytics',
        name: 'VendorAnalytics',
        component: () => import('../IV-views/Vendor/Analytics.vue'),
      },
      {
        path: 'settings',
        name: 'VendorSettings',
        component: () => import('../IV-views/Vendor/Settings.vue'),
      },
      {
        path: 'support',
        name: 'VendorSupport',
        component: () => import('../IV-views/Vendor/Support.vue'),
      },
    ],
  },
  {
    path: '/vendor/api-docs',
    name: 'VendorApiDocs',
    component: () => import('../IV-views/Vendor/ApiDocs.vue'),
  },
  {
    path: '/logistic',
    component: () => import('../layouts/LogisticLayout.vue'),
    redirect: '/logistic/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'LogisticDashboard',
        component: () => import('../LWD-views/LogisticManager/Dashboard.vue'),
      },
      {
        path: 'warehouses',
        name: 'LogisticWarehouseManagement',
        component: () => import('../LWD-views/LogisticManager/WarehouseManagement.vue'),
      },
      {
        path: 'users',
        name: 'LogisticUserManagement',
        component: () => import('../LWD-views/LogisticManager/UserManagement.vue'),
      },
      {
        path: 'fleet',
        name: 'LogisticFleetManagement',
        component: () => import('../LWD-views/LogisticManager/FleetManagement.vue'),
      },
      {
        path: 'geofencing',
        name: 'LogisticGeofencing',
        component: () => import('../LWD-views/LogisticManager/Geofencing.vue'),
      },
      {
        path: 'finance',
        name: 'LogisticFinance',
        component: () => import('../LWD-views/LogisticManager/Finance.vue'),
      },
      {
        path: 'rate-governance',
        name: 'LogisticRateGovernance',
        component: () => import('../LWD-views/LogisticManager/RateGovernance.vue'),
      },
      {
        path: 'reverse-logistics',
        name: 'LogisticReverseLogistics',
        component: () => import('../LWD-views/LogisticManager/ReverseLogistics.vue'),
      },
      {
        path: 'reports',
        name: 'LogisticReports',
        component: () => import('../LWD-views/LogisticManager/Reports.vue'),
      },
      {
        path: 'ai',
        name: 'LogisticAIIntelligence',
        component: () => import('../LWD-views/LogisticManager/AIIntelligence.vue'),
      },
      {
        path: 'communication',
        name: 'LogisticCommunication',
        component: () => import('../LWD-views/LogisticManager/Communication.vue'),
      },
      {
        path: 'comparative-viewers',
        name: 'LogisticComparativeViewers',
        component: () => import('../LWD-views/LogisticManager/ComparativeViewers.vue'),
      },
    ],
  },
  {
    path: '/warehouse',
    component: () => import('../layouts/WarehouseLayout.vue'),
    redirect: '/warehouse/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'WarehouseDashboard',
        component: () => import('../LWD-views/WarehouseManager/Dashboard.vue'),
      },
      {
        path: 'new-orders',
        name: 'WarehouseNewOrders',
        component: () => import('../LWD-views/WarehouseManager/NewOrders.vue'),
      },
      {
        path: 'inventory',
        name: 'WarehouseInventory',
        component: () => import('../LWD-views/WarehouseManager/Inventory.vue'),
      },
      {
        path: 'inbound',
        name: 'WarehouseInbound',
        component: () => import('../LWD-views/WarehouseManager/Inbound.vue'),
      },
      {
        path: 'floor-plan',
        name: 'WarehouseFloorPlan',
        component: () => import('../LWD-views/WarehouseManager/FloorPlan.vue'),
      },
      {
        path: 'picking',
        name: 'WarehousePicking',
        component: () => import('../LWD-views/WarehouseManager/Picking.vue'),
      },
      {
        path: 'packing-materials',
        name: 'WarehousePackingMaterials',
        component: () => import('../LWD-views/WarehouseManager/PackingMaterials.vue'),
      },
      {
        path: 'safety-stock',
        name: 'WarehouseSafetyStock',
        component: () => import('../LWD-views/WarehouseManager/SafetyStock.vue'),
      },
      {
        path: 'dock',
        name: 'WarehouseLoadingDock',
        component: () => import('../LWD-views/WarehouseManager/LoadingDock.vue'),
      },
      {
        path: 'returns',
        name: 'WarehouseReturns',
        component: () => import('../LWD-views/WarehouseManager/ReturnsWarehouse.vue'),
      },
      {
        path: 'labor',
        name: 'WarehouseLaborManagement',
        component: () => import('../LWD-views/WarehouseManager/LaborManagement.vue'),
      },
      {
        path: 'performance',
        name: 'WarehousePerformance',
        component: () => import('../LWD-views/WarehouseManager/Performance.vue'),
      },
      {
        path: 'ai',
        name: 'WarehouseSmartWMS',
        component: () => import('../LWD-views/WarehouseManager/SmartWMS.vue'),
      },
      {
        path: 'comparative-viewers',
        name: 'WarehouseComparativeViewers',
        component: () => import('../LWD-views/WarehouseManager/ComparativeViewers.vue'),
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../pages/NotFound.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// ── Auth Guard ─────────────────────────────────────────────────────────────
// Protected route prefixes — any navigation to these requires authentication
const PROTECTED_PREFIXES = [
  '/warehouse',
  '/logistic',
  '/dispatcher',
  '/individual',
  '/vendor',
  '/dashboard',
  '/driver',
]

router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem('auth_token')
  const isProtected = PROTECTED_PREFIXES.some(prefix => to.path.startsWith(prefix))

  if (isProtected && !token) {
    // Replace so the browser back button won't return to the protected page
    return next({ path: '/login', replace: true })
  }

  // If already logged in and trying to hit login/signup, redirect to their dashboard
  if (token && (to.path === '/login' || to.path === '/login-hub' || to.path === '/' )) {
    try {
      const user = JSON.parse(localStorage.getItem('auth_user') || 'null')
      if (user?.role) {
        const roleRoutes = {
          INDIVIDUAL: '/individual/dashboard',
          VENDOR: '/vendor/dashboard',
          LOGISTIC_MANAGER: '/logistic/dashboard',
          manager: '/logistic/dashboard',
          WAREHOUSE_MANAGER: '/warehouse/dashboard',
          warehouse: '/warehouse/dashboard',
          DISPATCHER: '/dispatcher/dashboard',
          dispatcher: '/dispatcher/dashboard',
          DRIVER: '/driver/dashboard',
          driver: '/driver/dashboard',
        }
        const dest = roleRoutes[user.role]
        if (dest && to.path !== dest) return next({ path: dest, replace: true })
      }
    } catch (_) { /* ignore */ }
  }

  next()
})

export default router;
