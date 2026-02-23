import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

// ─────────────────────────────────────────────
//  DUMMY USER DATABASE
// ─────────────────────────────────────────────
export const DUMMY_USERS = [
  {
    id: 'usr_001',
    role: 'customer',
    name: 'Aanya Sharma',
    email: 'aanya.sharma@gmail.com',
    phone: '+91 98765 43210',
    password: 'Customer@123',
  },
  {
    id: 'usr_002',
    role: 'vendor',
    name: 'Rajesh Logistics Pvt. Ltd.',
    email: 'rajesh@rlpl.in',
    phone: '+91 91234 56789',
    password: 'Vendor@123',
    company: 'Rajesh Logistics Pvt. Ltd.',
  },
  {
    id: 'usr_003',
    role: 'manager',
    name: 'Priya Nair',
    email: 'priya.nair@cargocorp.in',
    phone: '+91 99001 12345',
    password: 'Manager@123',
    company: 'Cargo Core HQ',
  },
  {
    id: 'usr_004',
    role: 'warehouse',
    name: 'Suresh Patel',
    email: 'suresh.patel@cargocorp.in',
    phone: '+91 97654 32109',
    password: 'Warehouse@123',
    company: 'Cargo Core Warehouse',
  },
  {
    id: 'usr_005',
    role: 'dispatcher',
    name: 'Meena Krishnan',
    email: 'meena.k@cargocorp.in',
    phone: '+91 85678 90123',
    password: 'Dispatch@123',
    company: 'Cargo Core Dispatch',
  },
  {
    id: 'usr_006',
    role: 'driver',
    name: 'Arjun Singh',
    email: 'arjun.singh@cargocorp.in',
    phone: '+91 70123 45678',
    password: 'Driver@123',
  },
];

// Dummy OTP for 2FA / password reset
export const DUMMY_OTP = '123456';

// ─────────────────────────────────────────────
//  AUTH STORE
// ─────────────────────────────────────────────
export const useAuthStore = defineStore('auth', () => {
  // ── State ──────────────────────────────────
  const currentUser = ref(null);
  const isAuthenticated = ref(false);
  const authToken = ref(null);
  const pendingEmail = ref('');
  const pendingRole = ref('');
  const loginError = ref('');
  const signupError = ref('');
  const otpError = ref('');
  const resetError = ref('');
  const isLoading = ref(false);

  // ── Getters ────────────────────────────────
  const userRole = computed(() => currentUser.value?.role ?? '');
  const userName = computed(() => currentUser.value?.name ?? '');
  const userEmail = computed(() => currentUser.value?.email ?? pendingEmail.value);

  // ── Actions ────────────────────────────────

  function findUser(emailOrPhone, password, role) {
    return (
      DUMMY_USERS.find(
        (u) =>
          (u.email === emailOrPhone || u.phone === emailOrPhone) &&
          u.password === password &&
          u.role === role
      ) ?? null
    );
  }

  async function login(emailOrPhone, password, role) {
    isLoading.value = true;
    loginError.value = '';

    await new Promise((resolve) => setTimeout(resolve, 1200));

    const user = findUser(emailOrPhone, password, role);

    if (!user) {
      loginError.value = 'Invalid credentials. Please check your email/phone and password.';
      isLoading.value = false;
      return { success: false, message: loginError.value };
    }

    pendingEmail.value = user.email;
    pendingRole.value = role;
    currentUser.value = user;

    isLoading.value = false;
    return { success: true, message: 'OTP sent to ' + user.email };
  }

  async function verifyOTP(otp) {
    isLoading.value = true;
    otpError.value = '';

    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (otp !== DUMMY_OTP) {
      otpError.value = 'Invalid OTP. Use ' + DUMMY_OTP + ' for demo.';
      isLoading.value = false;
      return { success: false, message: otpError.value };
    }

    isAuthenticated.value = true;
    authToken.value = 'token_' + Math.random().toString(36).slice(2);
    isLoading.value = false;
    return { success: true, message: 'Verified!' };
  }

  async function signup(userData) {
    isLoading.value = true;
    signupError.value = '';

    await new Promise((resolve) => setTimeout(resolve, 1200));

    const existing = DUMMY_USERS.find((u) => u.email === userData.email);
    if (existing) {
      signupError.value = 'An account with this email already exists.';
      isLoading.value = false;
      return { success: false, message: signupError.value };
    }

    const newUser = {
      id: 'usr_' + Date.now(),
      role: userData.role,
      name: userData.firstName + ' ' + userData.lastName,
      email: userData.email,
      phone: userData.phone,
      password: userData.password,
      company: userData.company,
    };

    DUMMY_USERS.push(newUser);
    pendingEmail.value = userData.email;
    currentUser.value = newUser;

    isLoading.value = false;
    return { success: true, message: 'Account created. OTP sent to ' + userData.email };
  }

  async function sendPasswordResetOTP(email) {
    isLoading.value = true;
    resetError.value = '';

    await new Promise((resolve) => setTimeout(resolve, 1200));

    const user = DUMMY_USERS.find((u) => u.email === email);
    if (!user) {
      resetError.value = 'No account found with this email.';
      isLoading.value = false;
      return { success: false, message: resetError.value };
    }

    pendingEmail.value = email;
    isLoading.value = false;
    return { success: true, message: 'OTP sent to ' + email };
  }

  async function resetPassword(otp, newPassword) {
    isLoading.value = true;
    resetError.value = '';

    await new Promise((resolve) => setTimeout(resolve, 1500));

    if (otp !== DUMMY_OTP) {
      resetError.value = 'Invalid OTP. Use ' + DUMMY_OTP + ' for demo.';
      isLoading.value = false;
      return { success: false, message: resetError.value };
    }

    const user = DUMMY_USERS.find((u) => u.email === pendingEmail.value);
    if (user) user.password = newPassword;

    pendingEmail.value = '';
    isLoading.value = false;
    return { success: true, message: 'Password reset successful!' };
  }

  function logout() {
    currentUser.value = null;
    isAuthenticated.value = false;
    authToken.value = null;
    pendingEmail.value = '';
    pendingRole.value = '';
    loginError.value = '';
  }

  function clearErrors() {
    loginError.value = '';
    signupError.value = '';
    otpError.value = '';
    resetError.value = '';
  }

  return {
    currentUser,
    isAuthenticated,
    authToken,
    pendingEmail,
    pendingRole,
    loginError,
    signupError,
    otpError,
    resetError,
    isLoading,
    userRole,
    userName,
    userEmail,
    login,
    verifyOTP,
    signup,
    sendPasswordResetOTP,
    resetPassword,
    logout,
    clearErrors,
    DUMMY_USERS,
    DUMMY_OTP,
  };
});
