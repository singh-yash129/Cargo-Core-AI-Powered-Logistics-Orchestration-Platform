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
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../pages/NotFound.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
