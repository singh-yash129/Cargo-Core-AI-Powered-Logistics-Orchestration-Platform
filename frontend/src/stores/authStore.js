/**
 * @file authStore.js
 * Pinia store for authentication state management.
 *
 * Manages: login (email/password, Google, OTP), registration (Vendor/Customer),
 * TFA setup/verification, account lockout, role-based routing.
 *
 * SECURITY:
 * ─────────────────────────────────────────────────────────────
 * • In production, tokens should be in httpOnly cookies — never accessible to JS.
 * • Role is ALWAYS returned from backend; never set from frontend input.
 * • Passwords are NEVER stored client-side beyond the form submission.
 * • Failed login attempts are tracked both client-side (UX) and server-side (enforcement).
 * ─────────────────────────────────────────────────────────────
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../utils/api.js'

/** Max failed attempts before lockout */
const MAX_LOGIN_ATTEMPTS = 5
/** Lockout duration in milliseconds (5 minutes) */
const LOCKOUT_DURATION_MS = 5 * 60 * 1000

/** Role → dashboard path mapping (role determined by backend ONLY) */
const ROLE_DASHBOARD_MAP = {
    'logistics_manager': '/logistic/dashboard',
    'warehouse_manager': '/warehouse/dashboard',
    'dispatcher': '/dispatcher/dashboard',
    'driver': '/driver/dashboard',
    'vendor': '/vendor/dashboard',
    'customer': '/individual/dashboard',
    'ai_support': '/ai/dashboard'
}

export const useAuthStore = defineStore('auth', () => {
    // ── State ────────────────────────────────────────────────
    const user = ref(JSON.parse(localStorage.getItem('auth_user') || 'null'))
    const token = ref(localStorage.getItem('auth_token') || '')
    const isAuthenticated = ref(!!token.value)

    // Login flow state
    const loginAttempts = ref(parseInt(localStorage.getItem('login_attempts') || '0', 10))
    const lockoutUntil = ref(parseInt(localStorage.getItem('lockout_until') || '0', 10))
    const tfaRequired = ref(false)
    const tfaPendingToken = ref('')
    const otpMode = ref(false)
    const otpTarget = ref('')

    // Registration flow state
    const registrationPending = ref(false)
    const registrationRole = ref('')

    // TFA setup state
    const tfaSecret = ref('')
    const tfaQrUrl = ref('')
    const tfaBackupCodes = ref([])

    // UI state
    const loading = ref(false)
    const error = ref('')
    const successMessage = ref('')

    // ── Getters ──────────────────────────────────────────────
    const isLockedOut = computed(() => {
        if (lockoutUntil.value === 0) return false
        if (Date.now() < lockoutUntil.value) return true
        // Lockout expired → reset
        clearLockout()
        return false
    })

    const lockoutRemainingMs = computed(() => {
        if (!isLockedOut.value) return 0
        return Math.max(0, lockoutUntil.value - Date.now())
    })

    const userRole = computed(() => user.value?.role || '')
    const dashboardPath = computed(() => ROLE_DASHBOARD_MAP[userRole.value] || '/login')

    // ── Internal Helpers ─────────────────────────────────────
    function setAuthState(userData, authToken) {
        user.value = userData
        token.value = authToken
        isAuthenticated.value = true
        localStorage.setItem('auth_user', JSON.stringify(userData))
        localStorage.setItem('auth_token', authToken)
        // Legacy driver auth compat
        localStorage.setItem('driverAuthenticated', 'true')
        resetLoginAttempts()
    }

    function clearAuthState() {
        user.value = null
        token.value = ''
        isAuthenticated.value = false
        tfaRequired.value = false
        tfaPendingToken.value = ''
        otpMode.value = false
        otpTarget.value = ''
        localStorage.removeItem('auth_user')
        localStorage.removeItem('auth_token')
        localStorage.removeItem('driverAuthenticated')
    }

    function incrementAttempts() {
        loginAttempts.value++
        localStorage.setItem('login_attempts', String(loginAttempts.value))

        if (loginAttempts.value >= MAX_LOGIN_ATTEMPTS) {
            const until = Date.now() + LOCKOUT_DURATION_MS
            lockoutUntil.value = until
            localStorage.setItem('lockout_until', String(until))
        }
    }

    function resetLoginAttempts() {
        loginAttempts.value = 0
        lockoutUntil.value = 0
        localStorage.removeItem('login_attempts')
        localStorage.removeItem('lockout_until')
    }

    function clearLockout() {
        lockoutUntil.value = 0
        loginAttempts.value = 0
        localStorage.removeItem('lockout_until')
        localStorage.removeItem('login_attempts')
    }

    /** Sanitize input to prevent basic XSS in form values */
    function sanitize(value) {
        if (typeof value !== 'string') return value
        return value.replace(/[<>"'&]/g, (ch) => {
            const map = { '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '&': '&amp;' }
            return map[ch]
        })
    }

    // ── Actions ──────────────────────────────────────────────

    /**
     * Email + password login
     */
    async function login(email, password, rememberMe = false) {
        if (isLockedOut.value) {
            error.value = 'Account temporarily locked. Please try again later.'
            return { success: false, locked: true }
        }

        loading.value = true
        error.value = ''

        try {
            // MOCK: Replace with real API call
            // const res = await api.post('/auth/login', { email: sanitize(email), password })
            const mockRes = await mockLogin(email, password)

            if (!mockRes.success) {
                incrementAttempts()
                // Generic error — never reveal if email exists or password is wrong
                error.value = mockRes.message || 'Invalid credentials. Please try again.'
                return { success: false, locked: isLockedOut.value, attemptsLeft: MAX_LOGIN_ATTEMPTS - loginAttempts.value }
            }

            // Check account status
            if (mockRes.accountStatus === 'pending_approval') {
                error.value = 'Your account is pending admin approval.'
                return { success: false, pendingApproval: true }
            }
            if (mockRes.accountStatus === 'suspended') {
                error.value = 'Your account has been suspended. Contact support.'
                return { success: false, suspended: true }
            }

            // TFA check
            if (mockRes.tfaEnabled) {
                tfaRequired.value = true
                tfaPendingToken.value = mockRes.pendingToken || ''
                return { success: true, tfaRequired: true }
            }

            // Success — set auth
            setAuthState(mockRes.user, mockRes.token)

            if (rememberMe) {
                localStorage.setItem('remember_email', email)
            } else {
                localStorage.removeItem('remember_email')
            }

            return { success: true, redirect: dashboardPath.value }
        } catch (err) {
            incrementAttempts()
            error.value = 'Something went wrong. Please try again.'
            return { success: false }
        } finally {
            loading.value = false
        }
    }

    /**
     * Google OAuth login
     */
    async function loginWithGoogle() {
        loading.value = true
        error.value = ''

        try {
            // In production: redirect to /auth/google → backend handles OAuth → callback
            // MOCK: simulate Google login
            const mockRes = await mockGoogleLogin()

            if (mockRes.needsProfile) {
                // New Google user needs to complete registration
                return { success: true, needsProfile: true }
            }

            if (mockRes.tfaEnabled) {
                tfaRequired.value = true
                tfaPendingToken.value = mockRes.pendingToken || ''
                return { success: true, tfaRequired: true }
            }

            setAuthState(mockRes.user, mockRes.token)
            return { success: true, redirect: dashboardPath.value }
        } catch (err) {
            error.value = 'Google login failed. Please try again.'
            return { success: false }
        } finally {
            loading.value = false
        }
    }

    /**
     * Send OTP to email or phone
     */
    async function sendOTP(target) {
        loading.value = true
        error.value = ''

        try {
            // MOCK: await api.post('/auth/send-otp', { target: sanitize(target) })
            await new Promise(r => setTimeout(r, 1000))
            otpTarget.value = target
            successMessage.value = `OTP sent to ${maskTarget(target)}`
            return { success: true }
        } catch (err) {
            error.value = 'Failed to send OTP. Please try again.'
            return { success: false }
        } finally {
            loading.value = false
        }
    }

    /**
     * Verify OTP code
     */
    async function verifyOTP(code, isTfa = false) {
        loading.value = true
        error.value = ''

        try {
            // MOCK: await api.post('/auth/verify-otp', { code, target: otpTarget.value, pendingToken: tfaPendingToken.value })
            const mockRes = await mockVerifyOTP(code, isTfa)

            if (!mockRes.success) {
                error.value = 'Invalid code. Please try again.'
                return { success: false }
            }

            setAuthState(mockRes.user, mockRes.token)
            tfaRequired.value = false
            tfaPendingToken.value = ''
            return { success: true, redirect: dashboardPath.value }
        } catch (err) {
            error.value = 'Verification failed. Please try again.'
            return { success: false }
        } finally {
            loading.value = false
        }
    }

    /**
     * Register a new Vendor or Customer
     */
    async function register(formData) {
        // Only Vendor and Customer can self-register
        if (!['vendor', 'customer'].includes(formData.role)) {
            error.value = 'Self-registration is only available for Vendor and Customer accounts.'
            return { success: false }
        }

        loading.value = true
        error.value = ''

        try {
            // Sanitize all string fields
            const sanitized = {}
            for (const [key, val] of Object.entries(formData)) {
                sanitized[key] = sanitize(val)
            }

            // MOCK: await api.post('/auth/register', sanitized)
            await new Promise(r => setTimeout(r, 1500))

            registrationRole.value = formData.role

            if (formData.role === 'vendor') {
                registrationPending.value = true
                successMessage.value = 'Registration successful! Your account is pending admin approval.'
                return { success: true, pendingApproval: true }
            }

            successMessage.value = 'Registration successful! You can now log in.'
            return { success: true, pendingApproval: false }
        } catch (err) {
            error.value = err.response?.data?.message || 'Registration failed. Please try again.'
            return { success: false }
        } finally {
            loading.value = false
        }
    }

    /**
     * Initialize TFA setup — generate QR code
     */
    async function initTFASetup() {
        loading.value = true
        error.value = ''

        try {
            // MOCK: const res = await api.post('/auth/tfa/setup')
            await new Promise(r => setTimeout(r, 800))
            tfaSecret.value = 'JBSWY3DPEHPK3PXP' // Mock TOTP secret
            tfaQrUrl.value = `otpauth://totp/CargoCore:${user.value?.email || 'user@example.com'}?secret=JBSWY3DPEHPK3PXP&issuer=CargoCore`
            tfaBackupCodes.value = [
                'A1B2-C3D4', 'E5F6-G7H8', 'I9J0-K1L2',
                'M3N4-O5P6', 'Q7R8-S9T0', 'U1V2-W3X4',
                'Y5Z6-A7B8', 'C9D0-E1F2'
            ]
            return { success: true }
        } catch (err) {
            error.value = 'Failed to initialize TFA setup.'
            return { success: false }
        } finally {
            loading.value = false
        }
    }

    /**
     * Verify TFA code during setup
     */
    async function confirmTFASetup(code) {
        loading.value = true
        error.value = ''

        try {
            // MOCK: await api.post('/auth/tfa/confirm', { code, secret: tfaSecret.value })
            await new Promise(r => setTimeout(r, 600))

            if (code.length !== 6 || !/^\d{6}$/.test(code)) {
                error.value = 'Please enter a valid 6-digit code.'
                return { success: false }
            }

            // Update user object
            if (user.value) {
                user.value = { ...user.value, tfaEnabled: true }
                localStorage.setItem('auth_user', JSON.stringify(user.value))
            }

            successMessage.value = 'Two-factor authentication enabled successfully!'
            return { success: true }
        } catch (err) {
            error.value = 'Verification failed. Please scan the QR code again.'
            return { success: false }
        } finally {
            loading.value = false
        }
    }

    /**
     * Logout
     */
    async function logout() {
        try {
            // MOCK: await api.post('/auth/logout')
        } catch { /* silent */ }
        clearAuthState()
    }

    function clearError() {
        error.value = ''
        successMessage.value = ''
    }

    // ── Mock Helpers (remove when backend is ready) ──────────
    function maskTarget(target) {
        if (target.includes('@')) {
            const [local, domain] = target.split('@')
            return `${local[0]}***@${domain}`
        }
        return target.slice(0, 3) + '****' + target.slice(-2)
    }

    async function mockLogin(email, password) {
        await new Promise(r => setTimeout(r, 1000))

        // Simulate various scenarios
        if (email === 'vendor@test.com' && password === 'Test@1234') {
            return {
                success: true, accountStatus: 'pending_approval'
            }
        }

        if (email === 'suspended@test.com') {
            return { success: true, accountStatus: 'suspended' }
        }

        if (password.length < 4) {
            return { success: false, message: 'Invalid credentials.' }
        }

        // Default: successful login
        const roleMap = {
            'admin@cargocore.com': 'logistics_manager',
            'warehouse@cargocore.com': 'warehouse_manager',
            'dispatch@cargocore.com': 'dispatcher',
            'driver@cargocore.com': 'driver',
            'vendor@cargocore.com': 'vendor',
        }

        return {
            success: true,
            accountStatus: 'active',
            tfaEnabled: false,
            user: {
                id: 'usr_' + Math.random().toString(36).substr(2, 9),
                fullName: 'Demo User',
                email: email,
                role: roleMap[email] || 'customer',
                tfaEnabled: false,
                avatar: null
            },
            token: 'mock_jwt_' + Date.now()
        }
    }

    async function mockGoogleLogin() {
        await new Promise(r => setTimeout(r, 800))
        return {
            success: true,
            needsProfile: false,
            user: {
                id: 'usr_google_' + Math.random().toString(36).substr(2, 9),
                fullName: 'Google User',
                email: 'googleuser@gmail.com',
                role: 'customer',
                tfaEnabled: false,
                avatar: 'https://lh3.googleusercontent.com/a/default-user'
            },
            token: 'mock_jwt_google_' + Date.now()
        }
    }

    async function mockVerifyOTP(code, isTfa) {
        await new Promise(r => setTimeout(r, 800))
        if (code === '000000') return { success: false }
        return {
            success: true,
            user: {
                id: 'usr_otp_' + Math.random().toString(36).substr(2, 9),
                fullName: user.value?.fullName || 'OTP User',
                email: user.value?.email || otpTarget.value,
                role: user.value?.role || 'customer',
                tfaEnabled: isTfa,
                avatar: null
            },
            token: 'mock_jwt_otp_' + Date.now()
        }
    }

    return {
        // State
        user, token, isAuthenticated, loginAttempts, lockoutUntil,
        tfaRequired, tfaPendingToken, otpMode, otpTarget,
        registrationPending, registrationRole,
        tfaSecret, tfaQrUrl, tfaBackupCodes,
        loading, error, successMessage,
        // Getters
        isLockedOut, lockoutRemainingMs, userRole, dashboardPath,
        // Actions
        login, loginWithGoogle, sendOTP, verifyOTP,
        register, initTFASetup, confirmTFASetup,
        logout, clearError, clearAuthState
    }
})
