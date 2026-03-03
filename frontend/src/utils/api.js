/**
 * @file api.js
 * Axios HTTP client with JWT auth interceptors, CSRF protection, and error handling.
 *
 * SECURITY NOTES:
 * ─────────────────────────────────────────────────────────────
 * • In production, JWT should be stored in httpOnly cookies set by the backend.
 *   The localStorage approach here is a fallback for SPA-only development.
 * • CSRF tokens should come from a server-rendered meta tag or a /csrf-token endpoint.
 * • Rate limiting is enforced server-side; client shows lockout UX.
 * ─────────────────────────────────────────────────────────────
 */

import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1'

const api = axios.create({
    baseURL: BASE_URL,
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    withCredentials: true // Send cookies for httpOnly JWT / CSRF
})

// ── Request Interceptor ──────────────────────────────────────
api.interceptors.request.use(
    (config) => {
        // Attach JWT token (fallback when not using httpOnly cookies)
        const token = localStorage.getItem('auth_token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }

        // Attach CSRF token from meta tag (backend should render this)
        const csrfMeta = document.querySelector('meta[name="csrf-token"]')
        if (csrfMeta) {
            config.headers['X-CSRF-Token'] = csrfMeta.getAttribute('content')
        }

        return config
    },
    (error) => Promise.reject(error)
)

// ── Response Interceptor ─────────────────────────────────────
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status

        if (status === 401) {
            // Token expired or invalid → clear auth state and redirect
            localStorage.removeItem('auth_token')
            localStorage.removeItem('auth_user')
            localStorage.removeItem('driverAuthenticated')

            // Avoid redirect loops
            if (window.location.pathname !== '/login') {
                window.location.href = '/login?session=expired'
            }
        }

        if (status === 429) {
            // Rate limited — surface to caller
            const retryAfter = error.response.headers['retry-after'] || 60
            error.retryAfter = parseInt(retryAfter, 10)
        }

        return Promise.reject(error)
    }
)

export default api
