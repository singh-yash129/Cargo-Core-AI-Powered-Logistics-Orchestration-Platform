import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as api from '../services/api'

export const useDriverStore = defineStore('driver', () => {
    const driver = ref(null)
    const vehicle = ref(null)
    const dashboard = ref(null)
    const isAuthenticated = ref(false)
    const shiftStartTime = ref(null)
    const loading = ref(false)
    const error = ref(null)

    // ── Shift Flow State ──────────────────────────
    const preShiftDone = ref(false)
    const vehicleBound = ref(false)
    const inspectionDone = ref(false)
    const jobTypeSelected = ref(false)
    const crewCheckedIn = ref(false)
    const loadVerified = ref(false)
    const gateExited = ref(false)

    const driverName = computed(() => driver.value?.name || 'Driver')
    const driverId = computed(() => driver.value?.id || driver.value?.driverId || 'DRV-0000')
    const vehicleId = computed(() => vehicle.value?.id || vehicle.value?.vehicleId || null)

    // Computed: can the driver access the main dashboard?
    const shiftFlowComplete = computed(() =>
        preShiftDone.value && vehicleBound.value && inspectionDone.value &&
        jobTypeSelected.value && loadVerified.value && gateExited.value
    )

    async function login(username, password) {
        loading.value = true
        error.value = null

        try {
            // Authenticate with backend
            const authData = await api.loginDriver(username, password)

            // Fetch full driver profile
            const profile = await api.getDriverProfile()

            driver.value = {
                id: profile.id,
                driverId: username,
                name: profile.name || username,
                avatar: null,
                role: profile.role || 'DRIVER',
                tier: 'Level 3 – Field Execution',
                rating: profile.rating || 0,
                totalDeliveries: profile.total_deliveries || 0,
                onTimePercent: profile.on_time_percent || 0,
                fuelEfficiency: profile.fuel_efficiency || 'N/A',
                badge: profile.badge || 'Driver',
                phone: profile.phone || '',
                email: profile.email || '',
            }

            isAuthenticated.value = true
            shiftStartTime.value = new Date().toISOString()
            await refreshDashboard()

            return true
        } catch (err) {
            error.value = err.message || 'Login failed'
            throw err
        } finally {
            loading.value = false
        }
    }

    function logout() {
        driver.value = null
        vehicle.value = null
        dashboard.value = null
        isAuthenticated.value = false
        shiftStartTime.value = null
        preShiftDone.value = false
        vehicleBound.value = false
        inspectionDone.value = false
        jobTypeSelected.value = false
        crewCheckedIn.value = false
        loadVerified.value = false
        gateExited.value = false
        error.value = null
        api.clearAccessToken()
    }

    function bindVehicle(v) {
        vehicle.value = v
    }

    function applyDashboardContext(context) {
        dashboard.value = context

        if (context?.profile) {
            driver.value = {
                ...(driver.value || {}),
                id: context.profile.id || driver.value?.id || null,
                driverId: context.profile.driverId || driver.value?.driverId || 'DRV-0000',
                name: context.profile.name || driver.value?.name || 'Driver',
                role: context.profile.role || driver.value?.role || 'DRIVER',
                tier: context.profile.tier || driver.value?.tier || 'Level 3 – Field Execution',
                rating: context.profile.rating ?? driver.value?.rating ?? 0,
                totalDeliveries: context.profile.totalDeliveries ?? driver.value?.totalDeliveries ?? 0,
                onTimePercent: context.profile.onTimePercent ?? driver.value?.onTimePercent ?? 0,
                fuelEfficiency: context.profile.fuelEfficiency ?? driver.value?.fuelEfficiency ?? 'N/A',
                badge: context.profile.badge || driver.value?.badge || 'Driver',
                phone: context.profile.phone ?? driver.value?.phone ?? '',
                email: context.profile.email ?? driver.value?.email ?? '',
                activeOrders: context.profile.activeOrders ?? 0,
                completedOrders: context.profile.completedOrders ?? 0,
            }
        }

        if (context?.current_vehicle) {
            vehicle.value = context.current_vehicle
            vehicleBound.value = true
        }

        if (context?.shift?.started_at) {
            shiftStartTime.value = context.shift.started_at
        }
    }

    async function refreshDashboard() {
        try {
            const context = await api.getDriverDashboard()
            applyDashboardContext(context)
            return context
        } catch (err) {
            console.error('Failed to fetch driver dashboard:', err)
            return null
        }
    }

    async function fetchVehicles() {
        try {
            const vehicles = await api.getDriverVehicles()
            return vehicles
        } catch (err) {
            console.error('Failed to fetch vehicles:', err)
            return []
        }
    }

    return {
        driver, vehicle, dashboard, isAuthenticated, shiftStartTime, loading, error,
        preShiftDone, vehicleBound, inspectionDone, jobTypeSelected, crewCheckedIn, loadVerified, gateExited,
        driverName, driverId, vehicleId, shiftFlowComplete,
        login, logout, bindVehicle, fetchVehicles, applyDashboardContext, refreshDashboard
    }
}, { persist: true })
