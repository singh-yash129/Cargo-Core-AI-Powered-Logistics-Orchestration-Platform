import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useUiStore } from './uiStore.js'

/**
 * Job Store - Finite State Machine Implementation
 * Manages job state for all 3 job types (Parcel Delivery, Parcel Pickup, House Shift)
 *
 * THIS VERSION USES DUMMY DATA - Backend integration comes later
 */
export const useJobStore = defineStore('job', () => {
    // ── Core State ──────────────────────────────────────
    const jobType = ref(null) // 'PARCEL_DELIVERY' | 'PARCEL_PICKUP' | 'HOUSE_SHIFT'
    const jobState = ref('IDLE')
    const jobData = ref(null)
    const currentStopIndex = ref(0)
    const stateHistory = ref([])

    // ── FSM Configuration ───────────────────────────────
    const fsmConfig = {
        PARCEL_DELIVERY: {
            IDLE: ['ASSIGNED'],
            ASSIGNED: ['VEHICLE_CHECK'],
            VEHICLE_CHECK: ['LOAD_VERIFICATION'],
            LOAD_VERIFICATION: ['START_ROUTE'],
            START_ROUTE: ['IN_TRANSIT'],
            IN_TRANSIT: ['ARRIVED'],
            ARRIVED: ['DELIVERY_IN_PROGRESS'],
            DELIVERY_IN_PROGRESS: ['SERVICE_CHECKLIST', 'DELIVERY_EXCEPTION'],
            SERVICE_CHECKLIST: ['POD_CAPTURE'],
            POD_CAPTURE: ['COD_COLLECTION', 'NEXT_STOP', 'COMPLETED'],
            COD_COLLECTION: ['NEXT_STOP', 'COMPLETED'],
            NEXT_STOP: ['IN_TRANSIT'],
            DELIVERY_EXCEPTION: ['IN_TRANSIT', 'COMPLETED'],
            COMPLETED: []
        },
        PARCEL_PICKUP: {
            IDLE: ['ASSIGNED'],
            ASSIGNED: ['START_ROUTE'],
            START_ROUTE: ['IN_TRANSIT_TO_PICKUP'],
            IN_TRANSIT_TO_PICKUP: ['ARRIVE_PICKUP'],
            ARRIVE_PICKUP: ['SCAN_ITEMS'],
            SCAN_ITEMS: ['PICKUP_SIGNATURE'],
            PICKUP_SIGNATURE: ['LOAD_CONFIRM'],
            LOAD_CONFIRM: ['RETURN_TRANSIT'],
            RETURN_TRANSIT: ['WAREHOUSE_ARRIVAL'],
            WAREHOUSE_ARRIVAL: ['UNLOAD_VERIFY'],
            UNLOAD_VERIFY: ['COMPLETED'],
            COMPLETED: []
        },
        HOUSE_SHIFT: {
            IDLE: ['ASSIGNED'],
            ASSIGNED: ['VEHICLE_CHECK'],
            VEHICLE_CHECK: ['CREW_CHECKIN'],
            CREW_CHECKIN: ['START_ROUTE'],
            START_ROUTE: ['IN_TRANSIT_TO_SOURCE'],
            IN_TRANSIT_TO_SOURCE: ['ARRIVE_SOURCE'],
            ARRIVE_SOURCE: ['PACKING'],
            PACKING: ['LOADING_INVENTORY'],
            LOADING_INVENTORY: ['TRANSIT_TO_DEST'],
            TRANSIT_TO_DEST: ['ARRIVE_DEST'],
            ARRIVE_DEST: ['UNLOADING_INVENTORY'],
            UNLOADING_INVENTORY: ['FINAL_CHECKLIST'],
            FINAL_CHECKLIST: ['POC_CAPTURE'],
            POC_CAPTURE: ['COMPLETED'],
            COMPLETED: []
        }
    }

    // ── Computed Properties ─────────────────────────────
    const allowedTransitions = computed(() => {
        if (!jobType.value || !jobState.value) return []
        return fsmConfig[jobType.value]?.[jobState.value] || []
    })

    const currentStop = computed(() => {
        if (!jobData.value?.stops || jobType.value === 'HOUSE_SHIFT') return null
        return jobData.value.stops[currentStopIndex.value]
    })

    const isLastStop = computed(() => {
        if (!jobData.value?.stops) return false
        return currentStopIndex.value >= jobData.value.stops.length - 1
    })

    const totalStops = computed(() => jobData.value?.stops?.length || 0)

    const completedStopsCount = computed(() => {
        if (!jobData.value?.stops) return 0
        return jobData.value.stops.filter(s => s.status === 'completed').length
    })

    const progressPercent = computed(() => {
        if (!totalStops.value) return 0
        return Math.round((completedStopsCount.value / totalStops.value) * 100)
    })

    const jobTypeLabel = computed(() => {
        const labels = {
            'PARCEL_DELIVERY': 'Parcel Delivery',
            'PARCEL_PICKUP': 'Parcel Pickup',
            'HOUSE_SHIFT': 'House Shift'
        }
        return labels[jobType.value] || 'No Job'
    })

    const jobTypeBadgeColor = computed(() => {
        const colors = {
            'PARCEL_DELIVERY': 'bg-green-500',
            'PARCEL_PICKUP': 'bg-blue-500',
            'HOUSE_SHIFT': 'bg-purple-500'
        }
        return colors[jobType.value] || 'bg-gray-400'
    })

    const stateLabel = computed(() => {
        const labels = {
            'IDLE': 'Waiting',
            'ASSIGNED': 'Job Assigned',
            'VEHICLE_CHECK': 'Vehicle Check',
            'LOAD_VERIFICATION': 'Load Verification',
            'START_ROUTE': 'Starting Route',
            'IN_TRANSIT': 'In Transit',
            'IN_TRANSIT_TO_PICKUP': 'En Route to Pickup',
            'IN_TRANSIT_TO_SOURCE': 'En Route to Source',
            'ARRIVE_PICKUP': 'Arrived at Pickup',
            'ARRIVE_SOURCE': 'Arrived at Source',
            'ARRIVED': 'Arrived',
            'DELIVERY_IN_PROGRESS': 'Delivering',
            'POD_CAPTURE': 'Capturing POD',
            'COD_COLLECTION': 'Collecting COD',
            'PICKUP_SIGNATURE': 'Getting Signature',
            'SCAN_ITEMS': 'Scanning Items',
            'LOAD_CONFIRM': 'Loading Confirmed',
            'RETURN_TRANSIT': 'Returning to Warehouse',
            'WAREHOUSE_ARRIVAL': 'At Warehouse',
            'UNLOAD_VERIFY': 'Unloading',
            'PACKING': 'Packing',
            'LOADING_INVENTORY': 'Loading',
            'TRANSIT_TO_DEST': 'In Transit',
            'ARRIVE_DEST': 'Arrived at Destination',
            'UNLOADING_INVENTORY': 'Unloading',
            'FINAL_CHECKLIST': 'Final Walkthrough',
            'POC_CAPTURE': 'Getting Sign-off',
            'NEXT_STOP': 'Moving to Next Stop',
            'DELIVERY_EXCEPTION': 'Exception Reported',
            'COMPLETED': 'Completed'
        }
        return labels[jobState.value] || jobState.value
    })

    // ── State Transition Logic ──────────────────────────

    function transition(newState, metadata = {}) {
        // Validate transition
        if (!allowedTransitions.value.includes(newState)) {
            const uiStore = useUiStore()
            uiStore.showToast(
                `Cannot skip steps. Complete current task first.`,
                'error',
                2000
            )
            throw new Error(`Invalid transition: ${jobState.value} → ${newState}`)
        }

        const oldState = jobState.value

        // Log transition for audit trail
        stateHistory.value.push({
            from: oldState,
            to: newState,
            timestamp: new Date().toISOString(),
            metadata
        })

        // Update state
        jobState.value = newState

        // Handle state-specific logic
        handleStateEntry(newState, metadata)

        console.log(`✅ Job state transition: ${oldState} → ${newState}`)
    }

    function handleStateEntry(state, metadata) {
        const uiStore = useUiStore()

        // Trigger side effects when entering certain states
        switch (state) {
            case 'ASSIGNED':
                uiStore.showToast(`${jobTypeLabel.value} job assigned`, 'success', 2000)
                break
            case 'IN_TRANSIT':
            case 'IN_TRANSIT_TO_PICKUP':
            case 'IN_TRANSIT_TO_SOURCE':
                // Start simulated GPS tracking
                startSimulatedTracking()
                break
            case 'ARRIVED':
            case 'ARRIVE_PICKUP':
            case 'ARRIVE_SOURCE':
            case 'ARRIVE_DEST':
                // Stop GPS tracking, log arrival
                stopSimulatedTracking()
                if (currentStop.value) {
                    currentStop.value.arrivedAt = new Date().toISOString()
                }
                break
            case 'NEXT_STOP':
                // Move to next stop and go back to transit
                currentStopIndex.value++
                if (!isLastStop.value) {
                    transition('IN_TRANSIT')
                } else {
                    transition('COMPLETED')
                }
                break
            case 'COMPLETED':
                // Stop all tracking, cleanup
                stopSimulatedTracking()
                uiStore.showToast('Job completed successfully! 🎉', 'success', 3000)
                break
        }
    }

    function canTransitionTo(targetState) {
        return allowedTransitions.value.includes(targetState)
    }

    // ── Job Management ──────────────────────────────────

    function loadJob(job) {
        jobType.value = job.jobType
        jobState.value = job.currentState || 'ASSIGNED'
        jobData.value = job
        currentStopIndex.value = job.currentStopIndex || 0
        stateHistory.value = []
    }

    function completeCurrentStop() {
        if (currentStop.value) {
            currentStop.value.status = 'completed'
            currentStop.value.completedAt = new Date().toISOString()
        }
    }

    function markStopException(stopId, reason) {
        const stop = jobData.value.stops.find(s => s.id === stopId)
        if (stop) {
            stop.status = 'exception'
            stop.exceptionReason = reason
            stop.exceptionAt = new Date().toISOString()
        }
    }

    function addCODPayment(amount, method) {
        if (!currentStop.value) return
        currentStop.value.codCollected = true
        currentStop.value.codAmount = amount
        currentStop.value.codMethod = method
        currentStop.value.codCollectedAt = new Date().toISOString()
    }

    function addPOD(podData) {
        if (!currentStop.value) return
        currentStop.value.pod = {
            photo: podData.photo,
            signature: podData.signature,
            customerName: podData.customerName,
            notes: podData.notes,
            capturedAt: new Date().toISOString(),
            // Simulated GPS coords
            location: {
                lat: 19.0760 + (Math.random() * 0.01),
                lng: 72.8777 + (Math.random() * 0.01)
            }
        }
    }

    function reset() {
        jobType.value = null
        jobState.value = 'IDLE'
        jobData.value = null
        currentStopIndex.value = 0
        stateHistory.value = []
    }

    // ── Simulated GPS Tracking ──────────────────────────
    let trackingInterval = null

    function startSimulatedTracking() {
        if (trackingInterval) return
        console.log('📍 Started GPS tracking simulation')

        // Simulate GPS updates every 5 seconds (demo mode)
        trackingInterval = setInterval(() => {
            const simulatedCoords = {
                lat: 19.0760 + (Math.random() * 0.01),
                lng: 72.8777 + (Math.random() * 0.01),
                accuracy: 10 + (Math.random() * 5),
                speed: 30 + (Math.random() * 20),
                heading: Math.random() * 360,
                timestamp: new Date().toISOString()
            }
            console.log('📍 GPS Update:', simulatedCoords)
            // In production, this would call: api.sendLocationUpdate(simulatedCoords)
        }, 5000)
    }

    function stopSimulatedTracking() {
        if (trackingInterval) {
            clearInterval(trackingInterval)
            trackingInterval = null
            console.log('📍 Stopped GPS tracking')
        }
    }

    return {
        // State
        jobType,
        jobState,
        jobData,
        currentStopIndex,
        stateHistory,

        // Computed
        allowedTransitions,
        currentStop,
        isLastStop,
        totalStops,
        completedStopsCount,
        progressPercent,
        jobTypeLabel,
        jobTypeBadgeColor,
        stateLabel,

        // Methods
        transition,
        canTransitionTo,
        loadJob,
        completeCurrentStop,
        markStopException,
        addCODPayment,
        addPOD,
        reset,
        startSimulatedTracking,
        stopSimulatedTracking
    }
}, { persist: true })
