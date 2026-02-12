import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useDriverStore = defineStore('driver', () => {
    // State
    const driver = ref({
        id: 'DRV-2049',
        name: 'John Mitchell',
        photo: 'https://randomuser.me/api/portraits/men/32.jpg',
        rating: 4.9,
        onTimePercentage: 96,
        fuelEfficiency: 8
    })

    const isAuthenticated = ref(false)
    const currentVehicle = ref(null)
    const shiftActive = ref(false)
    const shiftStartTime = ref(null)
    const currentLocation = ref({
        lat: 37.7749,
        lng: -122.4194,
        timestamp: null
    })

    // Actions
    function login(driverId, password) {
        // Simulate login
        if (driverId && password) {
            isAuthenticated.value = true
            localStorage.setItem('driverAuthenticated', 'true')
            return true
        }
        return false
    }

    function logout() {
        isAuthenticated.value = false
        shiftActive.value = false
        currentVehicle.value = null
        localStorage.removeItem('driverAuthenticated')
    }

    function bindVehicle(vehicle) {
        currentVehicle.value = vehicle
    }

    function startShift() {
        shiftActive.value = true
        shiftStartTime.value = new Date()
    }

    function endShift() {
        shiftActive.value = false
        shiftStartTime.value = null
        currentVehicle.value = null
    }

    function updateLocation(lat, lng) {
        currentLocation.value = {
            lat,
            lng,
            timestamp: new Date()
        }
    }

    // Computed
    const shiftDuration = computed(() => {
        if (!shiftStartTime.value) return 0
        return Math.floor((new Date() - new Date(shiftStartTime.value)) / 1000 / 60) // minutes
    })

    return {
        driver,
        isAuthenticated,
        currentVehicle,
        shiftActive,
        shiftStartTime,
        currentLocation,
        shiftDuration,
        login,
        logout,
        bindVehicle,
        startShift,
        endShift,
        updateLocation
    }
})
