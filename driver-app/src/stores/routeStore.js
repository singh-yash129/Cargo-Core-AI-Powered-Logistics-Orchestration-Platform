import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useRouteStore = defineStore('route', () => {
    const manifest = ref(null)
    const stops = ref([])
    const currentStopIndex = ref(0)
    const isRouteActive = ref(false)
    const codPayments = ref([])
    const completedStops = ref([])
    const dwellTimes = ref({})
    const deviations = ref([])

    const currentStop = computed(() => stops.value[currentStopIndex.value] || null)
    const totalStops = computed(() => stops.value.length)
    const completedCount = computed(() => completedStops.value.length)
    const progressPercent = computed(() =>
        totalStops.value ? Math.round((completedCount.value / totalStops.value) * 100) : 0
    )

    function loadManifest(data) {
        manifest.value = data
        stops.value = data.stops || []
        currentStopIndex.value = 0
        isRouteActive.value = false
    }

    function startRoute() {
        isRouteActive.value = true
    }

    function completeDelivery(stopId) {
        if (!completedStops.value.includes(stopId)) {
            completedStops.value.push(stopId)
        }
        const idx = stops.value.findIndex(s => s.id === stopId)
        if (idx !== -1 && idx >= currentStopIndex.value) {
            currentStopIndex.value = idx + 1
        }
    }

    function logCODPayment(data) {
        codPayments.value.push({ ...data, id: Date.now() })
    }

    function logDeviation(reason) {
        deviations.value.push({ reason, timestamp: new Date().toISOString() })
    }

    function startDwell(stopId) {
        dwellTimes.value[stopId] = { start: Date.now(), end: null }
    }

    function endDwell(stopId) {
        if (dwellTimes.value[stopId]) {
            dwellTimes.value[stopId].end = Date.now()
        }
    }

    return {
        manifest, stops, currentStopIndex, isRouteActive,
        codPayments, completedStops, dwellTimes, deviations,
        currentStop, totalStops, completedCount, progressPercent,
        loadManifest, startRoute, completeDelivery,
        logCODPayment, logDeviation, startDwell, endDwell
    }
})
