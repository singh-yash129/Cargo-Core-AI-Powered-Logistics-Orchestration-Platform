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
    const exceptions = ref([])
    const tripBrief = ref(null)
    const routeUpdates = ref([])
    const lastRouteUpdate = ref(null)

    const currentStop = computed(() => stops.value[currentStopIndex.value] || null)
    const totalStops = computed(() => stops.value.length)
    const completedCount = computed(() => completedStops.value.length)
    const isLastStop = computed(() => currentStopIndex.value >= Math.max(0, stops.value.length - 1))
    const progressPercent = computed(() =>
        totalStops.value ? Math.round((completedCount.value / totalStops.value) * 100) : 0
    )

    function getStopIndex(stopId) {
        return stops.value.findIndex(stop => String(stop.id) === String(stopId))
    }

    function loadManifest(data) {
        manifest.value = data
        stops.value = data.stops || []
        currentStopIndex.value = 0
        isRouteActive.value = false
    }

    function setTripBrief(data) {
        tripBrief.value = data || null
    }

    function applyRouteUpdate(update) {
        if (!update) return
        lastRouteUpdate.value = update
        routeUpdates.value.unshift({
            ...update,
            receivedAt: update.receivedAt || new Date().toISOString(),
        })
        if (update.trip_intelligence) {
            tripBrief.value = update.trip_intelligence
        }
    }

    function clearRouteUpdate() {
        lastRouteUpdate.value = null
    }

    function startRoute() {
        isRouteActive.value = true
    }

    function setCurrentStopById(stopId) {
        const index = getStopIndex(stopId)
        if (index >= 0) {
            currentStopIndex.value = index
        }
        return index
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

    function logException(data) {
        exceptions.value.push({ ...data, capturedAt: Date.now() })
    }

    function startDwell(stopId) {
        dwellTimes.value[stopId] = { start: Date.now(), end: null }
    }

    function endDwell(stopId) {
        if (dwellTimes.value[stopId]) {
            dwellTimes.value[stopId].end = Date.now()
        }
    }

    function reset() {
        manifest.value = null
        stops.value = []
        currentStopIndex.value = 0
        isRouteActive.value = false
        codPayments.value = []
        completedStops.value = []
        dwellTimes.value = {}
        deviations.value = []
        exceptions.value = []
        tripBrief.value = null
        routeUpdates.value = []
        lastRouteUpdate.value = null
    }

    return {
        manifest, stops, currentStopIndex, isRouteActive,
        codPayments, completedStops, dwellTimes, deviations, exceptions,
        tripBrief, routeUpdates, lastRouteUpdate,
        currentStop, totalStops, completedCount, isLastStop, progressPercent,
        getStopIndex, setCurrentStopById,
        loadManifest, startRoute, completeDelivery,
        logCODPayment, logDeviation, logException, startDwell, endDwell,
        setTripBrief, applyRouteUpdate, clearRouteUpdate, reset
    }
})
