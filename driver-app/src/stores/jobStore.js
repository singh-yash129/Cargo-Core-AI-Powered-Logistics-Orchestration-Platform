import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useUiStore } from './uiStore.js'
import { useDriverStore } from './driverStore.js'
import * as api from '../services/api'

/**
 * Job Store - Finite State Machine Implementation
 * Manages job state for all 3 job types (Parcel Delivery, Parcel Pickup, House Shift)
 *
 */
export const useJobStore = defineStore('job', () => {
    // ── Core State ──────────────────────────────────────
    const jobType = ref(null) // 'PARCEL_DELIVERY' | 'PARCEL_PICKUP' | 'HOUSE_SHIFT'
    const jobState = ref('IDLE')
    const jobData = ref(null)
    const currentStopIndex = ref(0)
    const stateHistory = ref([])
    const currentLocation = ref(null)

    // ── FSM Configuration ───────────────────────────────
    const fsmConfig = {
        PARCEL_DELIVERY: {
            IDLE: ['ASSIGNED'],
            ASSIGNED: ['LOAD_VERIFICATION'],
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
            ASSIGNED: ['CREW_CHECKIN'],
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
            POC_CAPTURE: ['PACKING_RETURN'],
            PACKING_RETURN: ['COMPLETED'],
            COMPLETED: []
        }
    }

    // ── Computed Properties ─────────────────────────────
    const allowedTransitions = computed(() => {
        if (!jobType.value || !jobState.value) return []
        return fsmConfig[jobType.value]?.[jobState.value] || []
    })

    const currentStop = computed(() => {
        if (!jobData.value?.stops?.length) return null
        return jobData.value.stops[currentStopIndex.value]
    })

    const currentStopId = computed(() => currentStop.value?.id || null)

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

    function getStopIndex(stopId) {
        if (!jobData.value?.stops?.length) return -1
        return jobData.value.stops.findIndex(stop => String(stop.id) === String(stopId))
    }

    function getStopById(stopId) {
        const index = getStopIndex(stopId)
        return index >= 0 ? jobData.value.stops[index] : null
    }

    function setCurrentStopById(stopId) {
        const index = getStopIndex(stopId)
        if (index >= 0) {
            currentStopIndex.value = index
        }
        return index
    }

    function getOrderIdForStop(stopId = null) {
        const stop = stopId ? getStopById(stopId) : currentStop.value
        return stop?.orderId || stop?.id || null
    }

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
        const uiStore = useUiStore()

        // Validate transition
        if (!allowedTransitions.value.includes(newState)) {
            console.error(`❌ Job Transition Failed: ${jobState.value} → ${newState}`)
            console.log('Allowed transitions:', allowedTransitions.value)

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

        // Sync with backend
        syncOrderStatusToBackend(newState).catch(err => {
            console.error('Failed to sync order status to backend:', err)
        })

        // Handle state-specific logic
        handleStateEntry(newState, metadata)

        console.log(`✅ Job state transition: ${oldState} → ${newState}`)
    }

    // Map FSM states to backend order statuses
    function mapStateToOrderStatus(state) {
        const stateMap = {
            'ASSIGNED': 'ASSIGNED',
            'LOAD_VERIFICATION': 'CONFIRMED',
            'START_ROUTE': 'IN_TRANSIT',
            'IN_TRANSIT': 'IN_TRANSIT',
            'IN_TRANSIT_TO_PICKUP': 'IN_TRANSIT',
            'IN_TRANSIT_TO_SOURCE': 'IN_TRANSIT',
            'ARRIVED': 'IN_TRANSIT',
            'ARRIVE_PICKUP': 'IN_TRANSIT',
            'ARRIVE_SOURCE': 'IN_TRANSIT',
            'ARRIVE_DEST': 'IN_TRANSIT',
            'DELIVERY_IN_PROGRESS': 'IN_TRANSIT',
            'POD_CAPTURE': 'IN_TRANSIT',
            'COMPLETED': 'DELIVERED',
        }
        return stateMap[state] || null
    }

    async function syncOrderStatusToBackend(state) {
        const orderId = getOrderIdForStop(currentStopId.value)
        if (!orderId) {
            console.warn('No orderId found for syncing order status')
            return
        }

        // PARCEL_PICKUP completion uses the dedicated return endpoint which
        // transitions the order to DELIVERED, sets warehouse_substatus=RETURN_ARRIVED,
        // and auto-creates a pending ReturnGrading for the Warehouse Manager queue.
        if (state === 'COMPLETED' && jobType.value === 'PARCEL_PICKUP') {
            try {
                await api.completeReturn(orderId)
                console.log(`✅ Return order ${orderId} completed — sent to warehouse inspection queue`)
            } catch (err) {
                console.error(`❌ Failed to complete return order ${orderId}:`, err)
            }
            return
        }

        const backendStatus = mapStateToOrderStatus(state)
        if (!backendStatus) {
            console.log(`State ${state} does not require backend sync`)
            return
        }

        try {
            await api.updateOrderStatus(orderId, backendStatus)
            console.log(`✅ Order ${orderId} status synced to backend: ${backendStatus}`)
        } catch (err) {
            console.error(`❌ Failed to sync order ${orderId} status to backend:`, err)
        }
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
                // Start live GPS tracking when the route is active.
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
                // Move to the next pending stop instead of skipping directly to completion.
                currentStopIndex.value++
                if (currentStopIndex.value < (jobData.value?.stops?.length || 0)) {
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

    function transitionAlongPath(path, metadata = {}) {
        if (!Array.isArray(path) || path.length === 0) return false

        const currentIndex = path.indexOf(jobState.value)
        if (currentIndex === -1) return false
        if (currentIndex === path.length - 1) return true

        for (let i = currentIndex + 1; i < path.length; i += 1) {
            const nextState = path[i]
            if (!canTransitionTo(nextState)) {
                return false
            }
            transition(nextState, metadata)
        }
        return true
    }

    function ensureTransitState(metadata = {}) {
        const transitPathMap = {
            PARCEL_DELIVERY: ['ASSIGNED', 'LOAD_VERIFICATION', 'START_ROUTE', 'IN_TRANSIT'],
            PARCEL_PICKUP: ['ASSIGNED', 'START_ROUTE', 'IN_TRANSIT_TO_PICKUP'],
            HOUSE_SHIFT: ['ASSIGNED', 'CREW_CHECKIN', 'START_ROUTE', 'IN_TRANSIT_TO_SOURCE'],
        }

        // House-shift destination leg uses a different transit state.
        if (jobType.value === 'HOUSE_SHIFT' && ['LOADING_INVENTORY', 'TRANSIT_TO_DEST'].includes(jobState.value)) {
            const destinationPath = ['LOADING_INVENTORY', 'TRANSIT_TO_DEST']
            return transitionAlongPath(destinationPath, metadata)
        }

        const path = transitPathMap[jobType.value]
        if (!path) return false
        return transitionAlongPath(path, metadata)
    }

    function ensureArrivalState(stopId = null, metadata = {}) {
        const resolvedStopId = stopId || currentStopId.value || currentStop.value?.id || null
        if (resolvedStopId) {
            setCurrentStopById(resolvedStopId)
        }

        const arrivalStateMap = {
            PARCEL_DELIVERY: 'ARRIVED',
            PARCEL_PICKUP: 'ARRIVE_PICKUP',
            HOUSE_SHIFT: jobState.value === 'TRANSIT_TO_DEST' ? 'ARRIVE_DEST' : 'ARRIVE_SOURCE',
        }

        const arrivalState = arrivalStateMap[jobType.value]
        if (!arrivalState) return false

        if (jobState.value === arrivalState) {
            return true
        }

        ensureTransitState({
            stopId: resolvedStopId,
            ...metadata,
        })

        if (!canTransitionTo(arrivalState)) {
            return false
        }

        transition(arrivalState, {
            stopId: resolvedStopId,
            ...metadata,
        })

        return true
    }

    function resolveCurrentStopIndex(job) {
        if (Number.isInteger(job?.currentStopIndex)) {
            return job.currentStopIndex
        }

        const stops = Array.isArray(job?.stops) ? job.stops : []
        const nextPendingIndex = stops.findIndex(stop => stop.status !== 'completed')
        return nextPendingIndex >= 0 ? nextPendingIndex : 0
    }

    // ── Job Management ──────────────────────────────────

    function loadJob(job) {
        if (!job) {
            reset()
            return
        }

        const clonedStops = Array.isArray(job.stops)
            ? job.stops.map(stop => ({
                ...stop,
                orderId: stop.orderId || stop.id,
                location: stop.location || (
                    stop.lat != null || stop.lng != null
                        ? { lat: stop.lat ?? null, lng: stop.lng ?? null }
                        : null
                ),
                itemsScanned: Array.isArray(stop.itemsScanned) ? [...stop.itemsScanned] : [],
                packages: Array.isArray(stop.packages) ? [...stop.packages] : [],
            }))
            : []

        jobType.value = job.jobType
        jobState.value = job.currentState || 'ASSIGNED'
        jobData.value = {
            ...job,
            stops: clonedStops,
        }
        currentStopIndex.value = resolveCurrentStopIndex(jobData.value)
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
            location: currentLocation.value
                ? {
                    lat: currentLocation.value.lat,
                    lng: currentLocation.value.lng,
                }
                : null
        }
    }

    function reset() {
        jobType.value = null
        jobState.value = 'IDLE'
        jobData.value = null
        currentStopIndex.value = 0
        stateHistory.value = []
        currentLocation.value = null
        stopSimulatedTracking()
    }

    // ── Live GPS Tracking ───────────────────────────────
    let geoWatchId = null
    let lastLocationPushAt = 0
    const LOCATION_PUSH_INTERVAL_MS = 5000 // push at most every 5 seconds

    function startSimulatedTracking() {
        if (geoWatchId !== null || typeof navigator === 'undefined' || !navigator.geolocation) {
            return
        }

        geoWatchId = navigator.geolocation.watchPosition(
            position => {
                currentLocation.value = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                    speed: position.coords.speed || 0,
                    heading: position.coords.heading || 0,
                    timestamp: new Date(position.timestamp).toISOString(),
                }

                // Throttle: only push to backend if ≥5s since last push
                const now = Date.now()
                if (now - lastLocationPushAt >= LOCATION_PUSH_INTERVAL_MS) {
                    lastLocationPushAt = now
                    api.updateDriverLocation(currentLocation.value.lat, currentLocation.value.lng)
                        .catch(err => console.warn('Failed to push GPS update', err))
                }
            },
            error => {
                console.warn('Live GPS tracking unavailable', error)
            },
            {
                enableHighAccuracy: true,
                maximumAge: 0,
                timeout: 30000,
            }
        )
    }

    function stopSimulatedTracking() {
        if (geoWatchId !== null && typeof navigator !== 'undefined' && navigator.geolocation) {
            navigator.geolocation.clearWatch(geoWatchId)
            geoWatchId = null
        }
    }

    // ── API Integration ─────────────────────────────────────────────────────
    async function fetchAssignedOrders() {
        const driverStore = useDriverStore()
        try {
            const dashboard = driverStore.dashboard || await driverStore.refreshDashboard()
            const orders = await api.getAssignedOrders()
            return orders.map(order => mapOrderToJob(order, dashboard))
        } catch (err) {
            console.error('Failed to fetch assigned orders:', err)
            const uiStore = useUiStore()
            uiStore.showToast('Could not load assigned orders', 'error', 3000)
            return []
        }
    }

    function mapOrderTypeToJobType(orderType) {
        const signal = String(orderType || '').toLowerCase()
        if (['house', 'shift', 'move', 'moving', 'relocation', 'furniture',
             'luggage', 'household', 'mixed'].some(token => signal.includes(token))) {
            return 'HOUSE_SHIFT'
        }
        if (['pickup', 'return', 'reverse', 'collection'].some(token => signal.includes(token))) {
            return 'PARCEL_PICKUP'
        }
        return 'PARCEL_DELIVERY'
    }

    function mapOrderStatusToJobState(status, jobType = 'PARCEL_DELIVERY') {
        const upper = String(status || '').toUpperCase()
        const pickupStateMap = {
            'ASSIGNED': 'ASSIGNED',
            'CONFIRMED': 'ASSIGNED',
            'IN_TRANSIT': 'RETURN_TRANSIT',
            'DELIVERED': 'COMPLETED',
            'COMPLETED': 'COMPLETED',
            'CLOSED': 'COMPLETED',
        }
        const deliveryStateMap = {
            'ASSIGNED': 'ASSIGNED',
            'CONFIRMED': 'ASSIGNED',
            'IN_TRANSIT': 'IN_TRANSIT',
            'DELIVERED': 'COMPLETED',
            'COMPLETED': 'COMPLETED',
            'CLOSED': 'COMPLETED',
        }
        if (jobType === 'HOUSE_SHIFT') return deliveryStateMap[upper] || 'ASSIGNED'
        return (jobType === 'PARCEL_PICKUP' ? pickupStateMap : deliveryStateMap)[upper] || 'ASSIGNED'
    }

    function estimateDuration(order, jobType) {
        if (jobType === 'HOUSE_SHIFT') return 6 * 60
        const itemCount = (order.items || []).reduce((sum, item) => sum + (item.quantity || 0), 0)
        return Math.max(45, 35 + itemCount * 8)
    }

    function estimateDistance(order, dashboard, jobType) {
        if (dashboard?.manifest?.total_distance_km && jobType === dashboard?.current_job?.jobType) {
            return dashboard.manifest.total_distance_km
        }
        if (jobType === 'HOUSE_SHIFT') return 24
        return 8.5
    }

    function normalizeCrewMembers(rawCrew = []) {
        return rawCrew.map(member => ({
            id: member.labourer_id || member.id,
            labourerId: member.labourer_id || member.id,
            name: member.name,
            role: member.role || 'Crew',
            photo: member.photo || null,
            checkedIn: Boolean(member.checked_in || member.checkedIn),
            checkInTime: member.check_in_time || member.checkInTime || null,
        }))
    }

    function buildHouseShiftChecklist(crew = []) {
        return [
            { id: 'packing-1', phase: 'packing', task: 'Crew attendance confirmed', required: true, completed: crew.length > 0 && crew.every(member => member.checkedIn) },
            { id: 'packing-2', phase: 'packing', task: 'Customer inventory verified', required: true, completed: false },
            { id: 'loading-1', phase: 'loading', task: 'Heavy items secured', required: true, completed: false },
            { id: 'unloading-1', phase: 'unloading', task: 'Destination placement confirmed', required: true, completed: false },
            { id: 'final-1', phase: 'final', task: 'Customer walkthrough completed', required: true, completed: false },
        ]
    }

    function parseOrderStops(order, jobType) {
        const items = Array.isArray(order.items) ? order.items : []
        const completed = ['DELIVERED', 'COMPLETED', 'CLOSED'].includes(String(order.status || '').toUpperCase())

        return [{
            id: order.id || order.tracking_code || 'stop-1',
            orderId: order.id || order.tracking_code || 'stop-1',
            trackingCode: order.tracking_code,
            sequence: 1,
            stopNumber: 1,
            type: jobType === 'PARCEL_PICKUP' ? 'pickup' : 'parcel',
            stopType: jobType === 'PARCEL_PICKUP' ? 'pickup' : 'delivery',
            address: jobType === 'PARCEL_PICKUP' ? (order.pickup_addr || '') : (order.delivery_addr || order.destination_addr || ''),
            lat: order.delivery_lat || order.destination_lat || order.dest_lat,
            lng: order.delivery_lng || order.destination_lng || order.dest_lng,
            location: {
                lat: order.delivery_lat || order.destination_lat || order.dest_lat || null,
                lng: order.delivery_lng || order.destination_lng || order.dest_lng || null,
            },
            backendStatus: order.status,
            status: completed ? 'completed' : 'pending',
            customerName: order.customer_name || `Order ${order.tracking_code || ''}`.trim(),
            customerPhone: order.customer_phone || '',
            phone: order.customer_phone || '',
            packages: items.map(item => ({
                id: item.id,
                barcode: item.sku,
                weight: `${item.quantity} unit`,
                description: item.sku,
            })),
            expectedItems: items.reduce((sum, item) => sum + (item.quantity || 0), 0),
            itemsScanned: [],
            serviceOtp: order.service_otp || null,
            timeWindow: order.scheduled_at
                ? {
                    start: new Date(order.scheduled_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
                    end: new Date(new Date(order.scheduled_at).getTime() + 45 * 60 * 1000).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
                }
                : { start: '--:--', end: '--:--' },
            cod: String(order.payment_mode || '').toUpperCase() === 'COD',
            codAmount: Math.max((order.total_amount || 0) - (order.paid_amount || 0), 0),
            paymentMode: order.payment_mode || null,
            paymentStatus: order.payment_status || null,
            specialInstructions: order.service_time_block || 'Follow dispatch instructions.',
        }]
    }

    // Cargo types that belong to the "Small Package / Parcel" booking mode.
    // Everything else under INDIVIDUAL order_type is a house shift / goods move.
    const SMALL_PACKAGE_CARGO_TYPES = new Set([
        'document', 'fragile item', 'soft item', 'hard item',
    ])

    function mapOrderToJob(order, dashboard) {
        const rawOrderType = String(order.order_type || '').toUpperCase()
        const rawCargoType = String(order.cargo_type || '').toLowerCase().trim()

        let jobType
        if (rawOrderType === 'SERVICE_MOVE') {
            // SERVICE_MOVE is always a goods move
            jobType = 'HOUSE_SHIFT'
        } else if (rawOrderType === 'INDIVIDUAL') {
            // For INDIVIDUAL orders the cargo_type tells us which booking mode was used:
            // Small Package mode uses: Document / Fragile Item / Soft Item / Hard Item
            // House Shift mode uses everything else (Household Goods, Furniture, Luggage/Boxes, etc.)
            jobType = SMALL_PACKAGE_CARGO_TYPES.has(rawCargoType) ? 'PARCEL_DELIVERY' : 'HOUSE_SHIFT'
        } else {
            jobType = mapOrderTypeToJobType([
                order.order_type,
                order.cargo_type,
                order.vehicle_type,
                order.service_time_block,
            ].filter(Boolean).join(' '))
        }
        const vehicleId = order.assigned_vehicle_code?.split(' · ')[0]
            || dashboard?.current_vehicle?.vehicleId
            || null
        const assignedAt = order.scheduled_at || order.created_at || new Date().toISOString()
        const currentState = mapOrderStatusToJobState(order.status, jobType)
        const routeDistance = estimateDistance(order, dashboard, jobType)
        const estimatedDuration = estimateDuration(order, jobType)
        const normalizedCrew = normalizeCrewMembers(dashboard?.crew || [])
        const items = Array.isArray(order.items) ? order.items : []

        if (jobType === 'HOUSE_SHIFT') {
            if (dashboard?.current_job?.jobType === 'HOUSE_SHIFT' && String(dashboard.current_job.jobId) === String(order.tracking_code)) {
                return dashboard.current_job
            }
            return {
                id: order.id || order.tracking_code,
                jobId: order.tracking_code,
                jobType,
                currentState,
                manifestId: dashboard?.manifest?.route_id || order.tracking_code,
                vehicleId,
                driverId: dashboard?.profile?.driverId || null,
                assignedAt,
                estimatedDuration,
                routeDistance,
                currentStopIndex: 0,
                crewRequired: order.labor_count || normalizedCrew.length || 0,
                crewAssigned: normalizedCrew,
                sourceLocation: {
                    name: 'Source Address',
                    customerName: order.customer_name || 'Pickup Location',
                    customerPhone: order.customer_phone || '',
                    address: order.pickup_addr || '',
                    location: { lat: null, lng: null },
                },
                destinationLocation: {
                    name: 'Destination Address',
                    customerName: order.customer_name || 'Drop Location',
                    customerPhone: order.customer_phone || '',
                    address: order.delivery_addr || '',
                    location: { lat: order.delivery_lat || null, lng: order.delivery_lng || null },
                },
                inventory: items.map(item => ({
                    id: item.id,
                    category: 'Inventory',
                    item: item.sku,
                    qty: item.quantity,
                    loaded: false,
                    unloaded: false,
                    packed: false,
                })),
                equipment: [],
                checklist: buildHouseShiftChecklist(normalizedCrew),
                beforePhotos: [],
                afterPhotos: [],
                totalCost: order.total_amount || 0,
                advancePaid: order.paid_amount || 0,
                balanceDue: Math.max((order.total_amount || 0) - (order.paid_amount || 0), 0),
                stops: parseOrderStops(order, jobType),
            }
        }

        return {
            id: order.id || order.tracking_code,
            jobId: order.tracking_code,
            jobType,
            currentState,
            manifestId: dashboard?.manifest?.route_id || order.tracking_code,
            trackingCode: order.tracking_code,
            vehicleId,
            driverId: dashboard?.profile?.driverId || null,
            assignedAt,
            estimatedDuration,
            routeDistance,
            currentStopIndex: 0,
            customerName: order.customer_name || 'Customer',
            pickupAddr: order.pickup_addr || '',
            deliveryAddr: order.delivery_addr || order.destination_addr || '',
            weight: order.cargo_weight_kg || order.weight || order.total_weight || 0,
            volume: order.cargo_volume_m3 || order.volume || order.total_volume || 0,
            deadline: order.delivery_deadline || order.scheduled_at,
            stops: parseOrderStops(order, jobType),
            warehouseId: order.warehouse_id || null,
            warehouseLocation: {
                name: dashboard?.shift?.warehouse_name || 'Warehouse',
                address: dashboard?.shift?.warehouse_name || 'Warehouse',
            },
        }
    }

    return {
        // State
        jobType,
        jobState,
        jobData,
        currentStopIndex,
        stateHistory,
        currentLocation,

        // Computed
        allowedTransitions,
        currentStop,
        currentStopId,
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
        ensureTransitState,
        ensureArrivalState,
        getStopById,
        getStopIndex,
        setCurrentStopById,
        getOrderIdForStop,
        loadJob,
        completeCurrentStop,
        markStopException,
        addCODPayment,
        addPOD,
        reset,
        startSimulatedTracking,
        stopSimulatedTracking,
        fetchAssignedOrders
    }
}, { persist: true })
