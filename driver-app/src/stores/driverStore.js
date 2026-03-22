import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useDriverStore = defineStore('driver', () => {
    const driver = ref(null)
    const vehicle = ref(null)
    const isAuthenticated = ref(false)
    const shiftStartTime = ref(null)

    // ── Shift Flow State ──────────────────────────
    const preShiftDone = ref(false)
    const vehicleBound = ref(false)
    const inspectionDone = ref(false)
    const jobTypeSelected = ref(false)
    const crewCheckedIn = ref(false)
    const loadVerified = ref(false)
    const gateExited = ref(false)

    const driverName = computed(() => driver.value?.name || 'Driver')
    const driverId = computed(() => driver.value?.driverId || 'DRV-0000')
    const vehicleId = computed(() => vehicle.value?.vehicleId || null)

    // Computed: can the driver access the main dashboard?
    const shiftFlowComplete = computed(() =>
        preShiftDone.value && vehicleBound.value && inspectionDone.value &&
        jobTypeSelected.value && loadVerified.value && gateExited.value
    )

    function login(id, method = 'password') {
        driver.value = {
            driverId: id || 'DRV-2049',
            name: 'Arjun Sharma',
            avatar: null,
            role: 'Driver',
            tier: 'Level 3 – Field Execution',
            rating: 4.9,
            totalDeliveries: 1247,
            onTimePercent: 96,
            fuelEfficiency: '+8%',
            badge: 'Pro Driver',
            phone: '+91 98765 43210',
            email: 'arjun.sharma@cargocoredriver.com',
        }
        isAuthenticated.value = true
        shiftStartTime.value = new Date().toISOString()
    }

    function logout() {
        driver.value = null
        vehicle.value = null
        isAuthenticated.value = false
        shiftStartTime.value = null
        preShiftDone.value = false
        vehicleBound.value = false
        inspectionDone.value = false
        jobTypeSelected.value = false
        crewCheckedIn.value = false
        loadVerified.value = false
        gateExited.value = false
    }

    function bindVehicle(v) {
        vehicle.value = v
    }

    return {
        driver, vehicle, isAuthenticated, shiftStartTime,
        preShiftDone, vehicleBound, inspectionDone, jobTypeSelected, crewCheckedIn, loadVerified, gateExited,
        driverName, driverId, vehicleId, shiftFlowComplete,
        login, logout, bindVehicle
    }
}, { persist: true })
