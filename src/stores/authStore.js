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
  const pendingFlow = ref('');
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

    try {
      const response = await fetch('http://localhost:8000/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailOrPhone, password }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        loginError.value = errData.detail || 'Invalid credentials. Please try again.';
        return { success: false, message: loginError.value };
      }

      const data = await response.json();

      pendingEmail.value = emailOrPhone;
      pendingRole.value = role;
      pendingFlow.value = 'login';
      
      // Fallback details since login only returns tokens, you would ideally fetch /me here
      currentUser.value = { email: emailOrPhone, role: role };
      isAuthenticated.value = true;
      authToken.value = data.access_token;
      
      localStorage.setItem('auth_token', data.access_token);

      return { success: true, message: 'Login successful' };
    } catch (error) {
      loginError.value = 'Error connecting to the server.';
      return { success: false, message: loginError.value };
    } finally {
      isLoading.value = false;
    }
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

    if (!currentUser.value && pendingEmail.value) {
      currentUser.value = { email: pendingEmail.value, role: pendingRole.value };
    }
    if (!pendingRole.value && currentUser.value?.role) {
      pendingRole.value = currentUser.value.role;
    }

    isAuthenticated.value = true;
    isLoading.value = false;
    return { success: true, message: 'Verified!' };
  }

  async function signup(userData) {
    isLoading.value = true;
    signupError.value = '';

    try {
      const mappedRole = userData.role?.toUpperCase() === 'VENDOR' ? 'VENDOR' : 'INDIVIDUAL';
      
      const payload = {
        name: `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || 'New User',
        email: userData.email,
        phone: userData.phone || null,
        password: userData.password,
        role: mappedRole
      };

      const response = await fetch('http://localhost:8000/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        let errMsg = errData.detail || 'An error occurred during registration.';
        if (Array.isArray(errMsg)) errMsg = errMsg[0]?.msg || JSON.stringify(errMsg);
        signupError.value = typeof errMsg === 'string' ? errMsg : 'Registration failed.';
        return { success: false, message: signupError.value };
      }

      const data = await response.json();

      pendingEmail.value = userData.email;
      pendingRole.value = userData.role;
      pendingFlow.value = 'signup';
      currentUser.value = { 
        name: payload.name, 
        email: payload.email, 
        role: userData.role 
      };
      
      authToken.value = data.access_token;
      isAuthenticated.value = true;
      localStorage.setItem('auth_token', data.access_token);

      return { success: true, message: 'Account created successfully.' };
    } catch (error) {
      signupError.value = 'Error connecting to the server.';
      return { success: false, message: signupError.value };
    } finally {
      isLoading.value = false;
    }
  }

  async function sendPasswordResetOTP(email) {
    isLoading.value = true;
    resetError.value = '';

    try {
      const response = await fetch('http://localhost:8000/api/v1/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        resetError.value = errData.detail || 'Failed to send reset link.';
        return { success: false, message: resetError.value };
      }

      pendingEmail.value = email;
      return { success: true, message: 'OTP sent to ' + email };
    } catch (error) {
      resetError.value = 'Error connecting to the server.';
      return { success: false, message: resetError.value };
    } finally {
      isLoading.value = false;
    }
  }

  async function resetPassword(otp, newPassword) {
    isLoading.value = true;
    resetError.value = '';

    try {
      const response = await fetch('http://localhost:8000/api/v1/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: otp, new_password: newPassword }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        resetError.value = errData.detail || 'Reset failed. Invalid OTP?';
        return { success: false, message: resetError.value };
      }

      pendingEmail.value = '';
      return { success: true, message: 'Password reset successful!' };
    } catch (error) {
      resetError.value = 'Error connecting to the server.';
      return { success: false, message: resetError.value };
    } finally {
      isLoading.value = false;
    }
    isAuthenticated.value = false;
    authToken.value = null;
    pendingEmail.value = '';
    pendingRole.value = '';
    pendingFlow.value = '';
    loginError.value = '';
    localStorage.removeItem('auth_token');
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
    pendingFlow,
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
