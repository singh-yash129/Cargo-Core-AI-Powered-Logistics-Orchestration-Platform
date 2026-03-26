import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { dummyManifest, dummyStops } from '../utils/dummyData'

export const useRouteStore = defineStore('route', () => {
    // State
    const manifest = ref(dummyManifest)
    const stops = ref(dummyStops)
    const currentStopIndex = ref(0)
    const deliveredStops = ref([])
    const routeStarted = ref(false)
    const packagesScanned = ref([])
    const earnings = ref({
        basePay: 0,
        tips: 0,
        bonuses: 0,
        codHandled: 0
    })

    // Computed
    const currentStop = computed(() => {
        if (currentStopIndex.value < stops.value.length) {
            return stops.value[currentStopIndex.value]
        }
        return null
    })

    const completedStops = computed(() => {
        return deliveredStops.value.length
    })

    const totalStops = computed(() => {
        return stops.value.length
    })

    const totalEarnings = computed(() => {
        return earnings.value.basePay + earnings.value.tips + earnings.value.bonuses + earnings.value.codHandled
    })

    const routeProgress = computed(() => {
        if (totalStops.value === 0) return 0
        return Math.round((completedStops.value / totalStops.value) * 100)
    })

    // Actions
    function startRoute() {
        routeStarted.value = true
    }

    function scanPackage(packageId) {
        if (!packagesScanned.value.includes(packageId)) {
            packagesScanned.value.push(packageId)
        }
    }

    function completeDelivery(stopId, deliveryData) {
        const stop = stops.value.find(s => s.id === stopId)
        if (stop) {
            deliveredStops.value.push({
                ...stop,
                completedAt: new Date(),
                deliveryData
            })

            // Update earnings
            earnings.value.basePay += 12 // Base per delivery
            if (deliveryData.cod) {
                earnings.value.codHandled += deliveryData.codAmount || 0
            }
            if (deliveryData.onTime) {
                earnings.value.bonuses += 2
            }

            currentStopIndex.value++
        }
    }

    function nextStop() {
        if (currentStopIndex.value < stops.value.length - 1) {
            currentStopIndex.value++
        }
    }

    function resetRoute() {
        currentStopIndex.value = 0
        deliveredStops.value = []
        routeStarted.value = false
        packagesScanned.value = []
        earnings.value = {
            basePay: 0,
            tips: 0,
            bonuses: 0,
            codHandled: 0
        }
    }

    return {
        manifest,
        stops,
        currentStopIndex,
        deliveredStops,
        routeStarted,
        packagesScanned,
        earnings,
        currentStop,
        completedStops,
        totalStops,
        totalEarnings,
        routeProgress,
        startRoute,
        scanPackage,
        completeDelivery,
        nextStop,
        resetRoute
    }
})
