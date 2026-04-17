import { useRouter } from 'vue-router'
import { useJobStore } from '../stores/jobStore.js'
import { useUiStore } from '../stores/uiStore.js'

/**
 * useFlowRouter — FSM-Driven Navigation Orchestrator
 *
 * The SINGLE source of truth for "where should the driver go next?"
 * Every "Begin Route" / "Continue" / "Next Step" button calls this.
 *
 * Maps jobType + jobState → correct route.
 * No hardcoded /manifest links anywhere else.
 */

// ── State → Route Map for all 3 FSMs ────────────────────────────────
const STATE_ROUTE_MAP = {
    PARCEL_DELIVERY: {
        ASSIGNED: '/job-assignment',
        LOAD_VERIFICATION: '/load-verify',
        START_ROUTE: '/manifest',
        IN_TRANSIT: '/navigation',
        ARRIVED: '/geofence-arrival/current',
        DELIVERY_IN_PROGRESS: '/delivery/current',
        SERVICE_CHECKLIST: '/service-checklist/current',
        POD_CAPTURE: '/pod/current',
        COD_COLLECTION: '/cod/current',
        NEXT_STOP: '/manifest',
        DELIVERY_EXCEPTION: '/exception/current',
        COMPLETED: '/job-completion',
    },
    PARCEL_PICKUP: {
        ASSIGNED: '/job-assignment',
        START_ROUTE: '/manifest',
        IN_TRANSIT_TO_PICKUP: '/navigation',
        ARRIVE_PICKUP: '/pickup-arrival/current',
        SCAN_ITEMS: '/pickup-scanning/current',
        PICKUP_SIGNATURE: '/pickup-signature/current',
        LOAD_CONFIRM: '/load-verify',
        RETURN_TRANSIT: '/warehouse-return',
        WAREHOUSE_ARRIVAL: '/unload-verification',
        UNLOAD_VERIFY: '/pickup-completion',
        COMPLETED: '/job-completion',
    },
    HOUSE_SHIFT: {
        ASSIGNED: '/job-assignment',
        CREW_CHECKIN: '/crew',
        START_ROUTE: '/navigation',
        IN_TRANSIT_TO_SOURCE: '/navigation',
        ARRIVE_SOURCE: '/house-shift-dashboard',
        PACKING: '/packing-progress',
        LOADING_INVENTORY: '/loading-inventory',
        TRANSIT_TO_DEST: '/transit-mode',
        ARRIVE_DEST: '/unloading-inventory',
        UNLOADING_INVENTORY: '/unloading-inventory',
        FINAL_CHECKLIST: '/final-walkthrough',
        POC_CAPTURE: '/customer-signoff',
        PACKING_RETURN: '/packing-return',
        COMPLETED: '/job-completion',
    }
}

// ── Step Labels for Progress Bar ─────────────────────────────────────
export const FLOW_STEPS = {
    PARCEL_DELIVERY: [
        { state: 'ASSIGNED', label: 'Job', icon: 'assignment' },
        { state: 'LOAD_VERIFICATION', label: 'Load', icon: 'inventory_2' },
        { state: 'START_ROUTE', label: 'Route', icon: 'map' },
        { state: 'IN_TRANSIT', label: 'Transit', icon: 'local_shipping' },
        { state: 'ARRIVED', label: 'Arrived', icon: 'place' },
        { state: 'DELIVERY_IN_PROGRESS', label: 'Deliver', icon: 'move_to_inbox' },
        { state: 'SERVICE_CHECKLIST', label: 'Checklist', icon: 'checklist' },
        { state: 'POD_CAPTURE', label: 'POD', icon: 'fact_check' },
        { state: 'COMPLETED', label: 'Done', icon: 'check_circle' },
    ],
    PARCEL_PICKUP: [
        { state: 'ASSIGNED', label: 'Job', icon: 'assignment' },
        { state: 'START_ROUTE', label: 'Route', icon: 'map' },
        { state: 'IN_TRANSIT_TO_PICKUP', label: 'Transit', icon: 'local_shipping' },
        { state: 'ARRIVE_PICKUP', label: 'Arrived', icon: 'place' },
        { state: 'SCAN_ITEMS', label: 'Scan', icon: 'qr_code_scanner' },
        { state: 'PICKUP_SIGNATURE', label: 'Sign', icon: 'draw' },
        { state: 'LOAD_CONFIRM', label: 'Load', icon: 'inventory_2' },
        { state: 'RETURN_TRANSIT', label: 'Return', icon: 'u_turn_left' },
        { state: 'WAREHOUSE_ARRIVAL', label: 'Warehouse', icon: 'warehouse' },
        { state: 'UNLOAD_VERIFY', label: 'Unload', icon: 'unarchive' },
        { state: 'COMPLETED', label: 'Done', icon: 'check_circle' },
    ],
    HOUSE_SHIFT: [
        { state: 'ASSIGNED', label: 'Job', icon: 'assignment' },
        { state: 'CREW_CHECKIN', label: 'Crew', icon: 'group' },
        { state: 'ARRIVE_SOURCE', label: 'Source', icon: 'place' },
        { state: 'PACKING', label: 'Pack', icon: 'inventory' },
        { state: 'LOADING_INVENTORY', label: 'Load', icon: 'local_shipping' },
        { state: 'TRANSIT_TO_DEST', label: 'Transit', icon: 'moving' },
        { state: 'ARRIVE_DEST', label: 'Dest', icon: 'place' },
        { state: 'UNLOADING_INVENTORY', label: 'Unload', icon: 'unarchive' },
        { state: 'FINAL_CHECKLIST', label: 'Checklist', icon: 'checklist' },
        { state: 'POC_CAPTURE', label: 'Sign-off', icon: 'draw' },
        { state: 'PACKING_RETURN', label: 'Assets', icon: 'inventory_2' },
        { state: 'COMPLETED', label: 'Done', icon: 'check_circle' },
    ]
}

export function useFlowRouter() {
    const router = useRouter()
    const jobStore = useJobStore()
    const uiStore = useUiStore()

    /**
     * Navigate to the screen that corresponds to the current FSM state.
     * Call this from ANY "Begin Route" / "Continue" / "Next" button.
     */
    function navigateToCurrentState() {
        const { jobType, jobState } = jobStore

        if (!jobType || !jobState) {
            uiStore.showToast('No active job assigned.', 'warning', 3000)
            return
        }

        const routeMap = STATE_ROUTE_MAP[jobType]
        if (!routeMap) {
            console.error('Unknown job type:', jobType)
            return
        }

        let targetRoute = routeMap[jobState]
        if (!targetRoute) {
            console.warn(`No route for state: ${jobState} in jobType: ${jobType}`)
            uiStore.showToast(`Unhandled state: ${jobState}`, 'error', 3000)
            return
        }

        const stopId = jobStore.currentStop?.id || jobStore.currentStopId || jobStore.jobData?.stops?.[jobStore.currentStopIndex]?.id
        if (targetRoute.includes('/current')) {
            targetRoute = targetRoute.replace('/current', `/${stopId || 'current'}`)
        }

        console.log(`🗺️ FlowRouter: ${jobType}/${jobState} → ${targetRoute}`)
        router.push(targetRoute)
    }

    /**
     * Advance to the next state and navigate to the corresponding screen.
     * @param {string} nextState - The target FSM state (must be in allowedTransitions)
     * @param {Object} metadata - Optional metadata for the transition log
     */
    function advanceAndNavigate(nextState, metadata = {}) {
        try {
            jobStore.transition(nextState, metadata)
            navigateToCurrentState()
        } catch (err) {
            console.error('Flow advance failed:', err.message)
        }
    }

    /**
     * Get the current step index and total steps for progress display.
     */
    function getProgress() {
        const { jobType, jobState } = jobStore
        if (!jobType) return { current: 0, total: 0, percent: 0 }

        const steps = FLOW_STEPS[jobType] || []
        const currentIdx = steps.findIndex(s => s.state === jobState)
        const total = steps.length

        return {
            current: Math.max(0, currentIdx),
            total,
            percent: total > 0 ? Math.round(((currentIdx + 1) / total) * 100) : 0,
            steps
        }
    }

    /**
     * Get the label for the next action button based on current state.
     */
    function getNextActionLabel() {
        const { jobType, jobState } = jobStore
        if (!jobType) return 'Begin Route'

        const labels = {
            ASSIGNED: 'View Job Details',
            LOAD_VERIFICATION: 'Verify Load',
            CREW_CHECKIN: 'Check In Crew',
            START_ROUTE: 'Start Navigation',
            IN_TRANSIT: 'Navigating...',
            IN_TRANSIT_TO_PICKUP: 'Navigating to Pickup...',
            IN_TRANSIT_TO_SOURCE: 'Navigating to Source...',
            ARRIVED: 'Confirm Arrival',
            ARRIVE_PICKUP: 'Begin Item Scan',
            ARRIVE_SOURCE: 'Start Packing',
            DELIVERY_IN_PROGRESS: 'Record Delivery',
            SERVICE_CHECKLIST: 'Complete Checklist',
            POD_CAPTURE: 'Capture POD',
            PICKUP_SIGNATURE: 'Get Signature',
            COD_COLLECTION: 'Collect COD',
            SCAN_ITEMS: 'Scan Items',
            LOAD_CONFIRM: 'Confirm Load',
            RETURN_TRANSIT: 'Return to Warehouse',
            WAREHOUSE_ARRIVAL: 'Begin Unloading',
            UNLOAD_VERIFY: 'Verify Unload',
            PACKING: 'Start Packing',
            LOADING_INVENTORY: 'Load Inventory',
            TRANSIT_TO_DEST: 'In Transit...',
            ARRIVE_DEST: 'Start Unloading',
            UNLOADING_INVENTORY: 'Unload Items',
            FINAL_CHECKLIST: 'Final Walkthrough',
            POC_CAPTURE: 'Get Customer Sign-off',
            PACKING_RETURN: 'Log Packing Assets',
            COMPLETED: 'View Summary',
        }

        return labels[jobState] || 'Continue'
    }

    return {
        navigateToCurrentState,
        advanceAndNavigate,
        getProgress,
        getNextActionLabel,
        STATE_ROUTE_MAP
    }
}
