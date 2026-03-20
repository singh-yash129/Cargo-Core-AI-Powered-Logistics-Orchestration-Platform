import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { apiUrl } from '@/config/api';

export const useAuthStore = defineStore('auth', () => {
  const savedUser = JSON.parse(localStorage.getItem('auth_user') || 'null');
  const savedToken = localStorage.getItem('auth_token');

  const currentUser = ref(savedUser);
  const isAuthenticated = ref(!!savedToken);
  const authToken = ref(savedToken);
  const pendingEmail = ref('');
  const pendingRole = ref('');
  const pendingFlow = ref('');
  const pendingRegistrationData = ref(null);
  const loginError = ref('');
  const signupError = ref('');
  const otpError = ref('');
  const resetError = ref('');
  const isLoading = ref(false);
  const currentWarehouse = ref(null);

  const userRole = computed(() => currentUser.value?.role ?? '');
  const userName = computed(() => currentUser.value?.name ?? '');
  const userEmail = computed(() => currentUser.value?.email ?? pendingEmail.value);
  const userRoleLabel = computed(() => {
    const role = currentUser.value?.role ?? '';

    if (role === 'INDIVIDUAL') return 'Customer';
    if (role === 'VENDOR') return 'Vendor';
    if (role === 'LOGISTIC_MANAGER' || role === 'manager') return 'Logistics Manager';
    if (role === 'WAREHOUSE_MANAGER' || role === 'warehouse') return 'Warehouse Manager';
    if (role === 'DISPATCHER' || role === 'dispatcher') return 'Dispatcher';
    if (role === 'DRIVER' || role === 'driver') return 'Driver';
    if (role === 'AI_AGENT' || role === 'support') return 'AI Support';

    return role;
  });

  function getDashboardRoute(role = currentUser.value?.role) {
    if (role === 'INDIVIDUAL') return '/individual/dashboard';
    if (role === 'VENDOR') return '/vendor/dashboard';
    if (role === 'LOGISTIC_MANAGER' || role === 'manager') return '/logistic/dashboard';
    if (role === 'WAREHOUSE_MANAGER' || role === 'warehouse') return '/warehouse/dashboard';
    if (role === 'DISPATCHER' || role === 'dispatcher') return '/dispatcher/dashboard';
    if (role === 'DRIVER' || role === 'driver') return '/driver/dashboard';
    return '/dashboard';
  }

  function persistCurrentUser(user) {
    currentUser.value = user;
    localStorage.setItem('auth_user', JSON.stringify(user));
  }

  async function ensureWarehouseContext() {
    if (!authToken.value || !currentUser.value) return null;

    let profile = currentUser.value;
    const cachedWarehouseId = currentUser.value?.warehouse_id ?? null;

    try {
      const profileResp = await fetch(apiUrl('api/v1/auth/me'), {
        headers: { Authorization: `Bearer ${authToken.value}` },
      });

      if (profileResp.ok) {
        const refreshedProfile = await profileResp.json();
        profile = {
          ...currentUser.value,
          ...refreshedProfile,
          warehouse_id: refreshedProfile.warehouse_id ?? cachedWarehouseId,
        };
        persistCurrentUser(profile);
      }
    } catch (_) {
      // Keep using cached auth data if the profile refresh fails.
    }

    if (profile?.role !== 'WAREHOUSE_MANAGER') {
      currentWarehouse.value = null;
      return null;
    }

    try {
      const listResp = await fetch(apiUrl('api/v1/warehouses?page=1&page_size=100'), {
        headers: { Authorization: `Bearer ${authToken.value}` },
      });

      if (!listResp.ok) return null;

      const data = await listResp.json();
      const warehouses = data.items || [];
      const linkedWarehouse = warehouses.find((warehouse) =>
        warehouse.id === profile.warehouse_id || warehouse.manager_id === profile.id
      ) || (
        warehouses.length === 1 ? warehouses[0] : null
      );

      currentWarehouse.value = linkedWarehouse;

      if (linkedWarehouse && profile.warehouse_id !== linkedWarehouse.id) {
        persistCurrentUser({
          ...currentUser.value,
          warehouse_id: linkedWarehouse.id,
        });
      }

      return linkedWarehouse;
    } catch (_) {
      return null;
    }
  }

  async function login(emailOrPhone, password) {
    isLoading.value = true;
    loginError.value = '';

    try {
      const response = await fetch(apiUrl('api/v1/auth/login'), {
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

      currentUser.value = data.user;
      isAuthenticated.value = true;
      authToken.value = data.access_token;

      localStorage.setItem('auth_token', data.access_token);
      localStorage.setItem('auth_user', JSON.stringify(data.user));

      if (data.user.role === 'WAREHOUSE_MANAGER') {
        await ensureWarehouseContext();
      }

      return {
        success: true,
        message: `Welcome back, ${data.user.name}!`,
        redirect: getDashboardRoute(data.user.role),
      };
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

    try {
      if (pendingFlow.value === 'signup') {
        const verifyResp = await fetch(apiUrl('api/v1/auth/verify-otp'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: pendingEmail.value, otp: otp }),
        });

        if (!verifyResp.ok) {
          const errData = await verifyResp.json().catch(() => ({}));
          otpError.value = errData.detail || 'Invalid OTP. Please try again.';
          return { success: false, message: otpError.value };
        }

        const registerResp = await fetch(apiUrl('api/v1/auth/register'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(pendingRegistrationData.value),
        });

        if (!registerResp.ok) {
          const errData = await registerResp.json().catch(() => ({}));
          let errMsg = errData.detail || 'An error occurred during registration.';
          if (Array.isArray(errMsg)) errMsg = errMsg[0]?.msg || JSON.stringify(errMsg);
          otpError.value = typeof errMsg === 'string' ? errMsg : 'Registration failed.';
          return { success: false, message: otpError.value };
        }

        const data = await registerResp.json();
        const payload = pendingRegistrationData.value;
        currentUser.value = {
          name: payload.name,
          email: payload.email,
          phone: payload.phone,
          address: payload.address,
          role: payload.role
        };
        authToken.value = data.access_token;
        isAuthenticated.value = true;
        localStorage.setItem('auth_token', data.access_token);
        localStorage.setItem('auth_user', JSON.stringify(currentUser.value));

        return {
          success: true,
          message: 'Account created successfully.',
          redirect: getDashboardRoute(currentUser.value.role),
        };
      }

      otpError.value = 'OTP verification is only available for signup in the current flow.';
      return { success: false, message: otpError.value };
    } catch (error) {
      otpError.value = 'Error connecting to the server.';
      return { success: false, message: otpError.value };
    } finally {
      isLoading.value = false;
    }
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
        address: userData.address || null,
        password: userData.password,
        role: mappedRole
      };

      const response = await fetch(apiUrl('api/v1/auth/send-otp'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: payload.email }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        let errMsg = errData.detail || 'An error occurred sending OTP.';
        if (Array.isArray(errMsg)) errMsg = errMsg[0]?.msg || JSON.stringify(errMsg);
        signupError.value = typeof errMsg === 'string' ? errMsg : 'OTP request failed.';
        return { success: false, message: signupError.value };
      }

      pendingEmail.value = userData.email;
      pendingRole.value = userData.role;
      pendingFlow.value = 'signup';
      pendingRegistrationData.value = payload;

      return { success: true, message: 'OTP sent successfully.' };
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
      const response = await fetch(apiUrl('api/v1/auth/forgot-password'), {
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

  async function resetPassword(email, otp, newPassword) {
    isLoading.value = true;
    resetError.value = '';

    try {
      const response = await fetch(apiUrl('api/v1/auth/reset-password'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email,
          token: otp,
          new_password: newPassword
        }),
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
  }

  function logout() {
    isAuthenticated.value = false;
    authToken.value = null;
    currentUser.value = null;
    currentWarehouse.value = null;
    pendingEmail.value = '';
    pendingRole.value = '';
    pendingFlow.value = '';
    loginError.value = '';
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  }

  async function googleLogin(credential, role = 'INDIVIDUAL') {
    isLoading.value = true;
    loginError.value = '';

    try {
      const response = await fetch(apiUrl('api/v1/auth/google-login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential, role }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        loginError.value = errData.detail || 'Google Login failed.';
        return { success: false, message: loginError.value, status: response.status };
      }

      const data = await response.json();

      currentUser.value = data.user;
      isAuthenticated.value = true;
      authToken.value = data.access_token;
      localStorage.setItem('auth_token', data.access_token);
      localStorage.setItem('auth_user', JSON.stringify(data.user));

      if (data.user.role === 'WAREHOUSE_MANAGER') {
        await ensureWarehouseContext();
      }

      return {
        success: true,
        message: `Welcome back, ${data.user.name}!`,
        status: response.status,
        redirect: getDashboardRoute(data.user.role),
      };
    } catch (error) {
      loginError.value = 'Error connecting to the server.';
      return { success: false, message: loginError.value, status: 0 };
    } finally {
      isLoading.value = false;
    }
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
    userRoleLabel,
    userName,
    userEmail,
    currentWarehouse,
    login,
    verifyOTP,
    signup,
    sendPasswordResetOTP,
    resetPassword,
    logout,
    googleLogin,
    ensureWarehouseContext,
    getDashboardRoute,
    clearErrors,
  };
});
