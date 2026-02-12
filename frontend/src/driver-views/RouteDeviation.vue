<template>
    <div class="bg-background-dark text-white min-h-screen flex flex-col p-6">
        <!-- Header -->
        <div class="mb-8">
            <button @click="$router.back()" class="mb-6 text-gray-400 hover:text-white flex items-center gap-2">
                <span class="material-icons">arrow_back</span>
                <span>Back to Navigation</span>
            </button>

            <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
                    <span class="material-icons text-amber-500 text-2xl">warning</span>
                </div>
                <div>
                    <h3 class="text-amber-500 text-sm font-semibold tracking-wider uppercase">Off-Route Detected</h3>
                    <h1 class="text-3xl font-bold">Route Deviation</h1>
                </div>
            </div>
        </div>

        <!-- Info Banner -->
        <div class="bg-white/5 border border-white/10 rounded-xl p-4 mb-6">
            <p class="text-gray-400 text-sm">
                You've been off the planned route for <span class="text-white font-semibold">12 minutes</span>.
                Please select a reason below to log this deviation.
            </p>
        </div>

        <!-- Reason Selection -->
        <div class="mb-8">
            <label class="block text-gray-400 text-sm mb-4 font-medium">Select Reason</label>
            <div class="space-y-3">
                <button v-for="reason in reasons" :key="reason.id" @click="selectedReason = reason.id" :class="[
                    'w-full glass-panel p-4 rounded-xl flex items-center gap-4 transition-all',
                    selectedReason === reason.id ? 'border-2 border-primary bg-primary/5' : 'border border-white/10'
                ]">
                    <div
                        :class="['w-12 h-12 rounded-lg flex items-center justify-center', selectedReason === reason.id ? 'bg-primary/20' : 'bg-white/5']">
                        <span
                            :class="['material-icons text-2xl', selectedReason === reason.id ? 'text-primary' : 'text-gray-400']">
                            {{ reason.icon }}
                        </span>
                    </div>
                    <div class="flex-1 text-left">
                        <p class="font-semibold text-white">{{ reason.label }}</p>
                        <p class="text-xs text-gray-400">{{ reason.description }}</p>
                    </div>
                    <span v-if="selectedReason === reason.id" class="material-icons text-primary">check_circle</span>
                </button>
            </div>
        </div>

        <!-- Optional Notes -->
        <div class="mb-8">
            <label class="block text-gray-400 text-sm mb-3 font-medium">Additional Notes (Optional)</label>
            <textarea v-model="notes" placeholder="Add any additional details..." rows="4"
                class="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder:text-gray-600 focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none"></textarea>
        </div>

        <!-- Location Info -->
        <div class="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-8">
            <div class="flex items-center gap-3">
                <span class="material-icons text-blue-500">location_on</span>
                <div>
                    <p class="text-white font-semibold text-sm">Current Location Logged</p>
                    <p class="text-xs text-gray-400 font-mono">{{ currentLocation }}</p>
                </div>
            </div>
        </div>

        <!-- Action Buttons -->
        <button @click="submitDeviation" :disabled="!selectedReason" :class="[
            'w-full py-5 rounded-xl font-bold text-xl mb-3 transition-all',
            selectedReason
                ? 'bg-primary text-black shadow-glow hover:bg-primary-dark active:scale-[0.98]'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
        ]">
            Submit Deviation
        </button>

        <button @click="$router.back()"
            class="w-full py-4 rounded-xl font-medium bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
            Cancel
        </button>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useRouteStore } from '../stores/routeStore'

const router = useRouter()
const routeStore = useRouteStore()

const selectedReason = ref(null)
const notes = ref('')
const currentLocation = ref('30.2672° N, 97.7431° W')

const reasons = [
    { id: 'traffic', icon: 'traffic', label: 'Traffic Congestion', description: 'Heavy traffic or road jam' },
    { id: 'roadblock', icon: 'block', label: 'Road Blocked', description: 'Road closed or inaccessible' },
    { id: 'fuel', icon: 'local_gas_station', label: 'Fuel Stop', description: 'Refueling vehicle' },
    { id: 'emergency', icon: 'emergency', label: 'Emergency', description: 'Urgent situation' },
    { id: 'other', icon: 'more_horiz', label: 'Other', description: 'Different reason' }
]

const submitDeviation = () => {
    if (!selectedReason.value) return

    routeStore.logDeviation({
        reason: reasons.find(r => r.id === selectedReason.value)?.label,
        notes: notes.value,
        location: currentLocation.value,
        timestamp: new Date().toISOString()
    })

    router.back()
}
</script>
