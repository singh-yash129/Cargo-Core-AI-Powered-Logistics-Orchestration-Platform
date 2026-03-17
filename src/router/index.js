import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  {
    path: '/',
    redirect: '/login',
  },
  {
    path: '/login',
    name: 'MainLoginHub',
    component: () => import('../pages/MainLoginHub.vue'),
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
