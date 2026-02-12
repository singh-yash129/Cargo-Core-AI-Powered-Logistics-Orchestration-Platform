<template>
    <div class="bg-[#1a0f0a] text-white min-h-screen flex flex-col p-6">
        <!-- CRITICAL: Amber theme for crisis -->

        <!-- Header -->
        <div class="mb-8">
            <div class="flex items-center gap-3 mb-6 animate-pulse">
                <div
                    class="w-16 h-16 rounded-full bg-amber-500/30 flex items-center justify-center border-2 border-amber-500">
                    <span class="material-icons text-amber-500 text-4xl">emergency</span>
                </div>
                <div>
                    <h3 class="text-amber-500 text-sm font-bold tracking-wider uppercase">Emergency Mode</h3>
                    <h1 class="text-4xl font-bold text-white">Crisis Alert</h1>
                </div>
            </div>

            <div class="bg-amber-500/20 border-2 border-amber-500 rounded-xl p-4">
                <p class="text-amber-100 font-semibold">
                    ⚠️ Your location and status will be shared with dispatch immediately
                </p>
            </div>
        </div>

        <!-- Crisis Type Selection -->
        <div class="mb-8">
            <label class="block text-amber-200 text-sm mb-4 font-bold">Select Emergency Type</label>
            <div class="space-y-3">
                <button v-for="crisis in crisisTypes" :key="crisis.id" @click="selectedCrisis = crisis.id" :class="[
                    'w-full p-5 rounded-xl flex items-center gap-4 transition-all border-2',
                    selectedCrisis === crisis.id
                        ? 'border-amber-500 bg-amber-500/20'
                        : 'border-amber-500/30 bg-amber-500/5'
                ]">
                    <div
                        :class="['w-14 h-14 rounded-full flex items-center justify-center', selectedCrisis === crisis.id ? 'bg-amber-500/40' : 'bg-amber-500/20']">
                        <span
                            :class="['material-icons text-3xl', selectedCrisis === crisis.id ? 'text-amber-300' : 'text-amber-500']">
                            {{ crisis.icon }}
                        </span>
                    </div>
                    <div class="flex-1 text-left">
                        <p class="font-bold text-white text-lg">{{ crisis.label }}</p>
                        <p class="text-sm text-amber-200">{{ crisis.description }}</p>
                    </div>
                    <span v-if="selectedCrisis === crisis.id"
                        class="material-icons text-amber-500 text-2xl">check_circle</span>
                </button>
            </div>
        </div>

        <!-- Live GPS Status -->
        <div class="bg-blue-900/30 border border-blue-500/30 rounded-xl p-4 mb-6">
            <div class="flex items-start gap-3">
                <div class="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center animate-pulse">
                    <span class="material-icons text-blue-400">gps_fixed</span>
                </div>
                <div class="flex-1">
                    <p class="text-blue-300 font-semibold text-sm mb-1">Live Location Tracking Active</p>
                    <p class="text-xs text-blue-200 font-mono">{{ currentLocation }}</p>
                    <p class="text-xs text-blue-400 mt-1">Broadcasting to dispatch every 10 seconds</p>
                </div>
            </div>
        </div>

        <!-- Optional Details -->
        <div class="mb-8">
            <label class="block text-amber-200 text-sm mb-3 font-medium">Additional Information (Optional)</label>
            <textarea v-model="details" placeholder="Describe the situation..." rows="4"
                class="w-full bg-amber-500/10 border-2 border-amber-500/30 rounded-xl p-4 text-white placeholder:text-amber-900 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/50 outline-none resize-none"></textarea>
        </div>

        <!-- Emergency Contacts -->
        <div class="mb-8">
            <!-- Action Buttons -->
            <div class="grid grid-cols-2 gap-4">
                <button
                    class="bg-red-500 hover:bg-red-600 text-white py-4 rounded-xl font-bold flex flex-col items-center justify-center gap-1 active:scale-[0.98] transition-all">
                    <span class="material-icons text-3xl">emergency</span>
                    <span>Call 911</span>
                </button>

                <button @click="$router.push('/chat')"
                    class="bg-white/10 hover:bg-white/20 border border-white/20 text-white py-4 rounded-xl font-bold flex flex-col items-center justify-center gap-1 active:scale-[0.98] transition-all">
                    <span class="material-icons text-3xl">support_agent</span>
                    <span>Dispatch</span>
                </button>
            </div>
        </div>

        <!-- Alert Button -->
        <button @click="triggerAlert" :disabled="!selectedCrisis" :class="[
            'w-full py-6 rounded-xl font-bold text-2xl mb-3 transition-all shadow-[0_0_30px_rgba(245,158,11,0.5)]',
            selectedCrisis
                ? 'bg-amber-500 text-black hover:bg-amber-400 active:scale-[0.98] animate-pulse'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
        ]">
            🚨 SEND ALERT NOW
        </button>

        <button @click="$router.back()"
            class="w-full py-4 rounded-xl font-medium bg-white/10 text-white hover:bg-white/20 transition-colors">
            Cancel
        </button>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const selectedCrisis = ref(null)
const details = ref('')
const currentLocation = ref('30.2672° N, 97.7431° W')

const crisisTypes = [
    { id: 'mechanical', icon: 'build_circle', label: 'Mechanical Failure', description: 'Vehicle breakdown or malfunction' },
    { id: 'accident', icon: 'car_crash', label: 'Accident', description: 'Vehicle collision or crash' },
    { id: 'medical', icon: 'medical_services', label: 'Medical Emergency', description: 'Health-related urgent situation' },
    { id: 'unsafe', icon: 'shield', label: 'Unsafe Area', description: 'Security or safety threat' }
]

const triggerAlert = () => {
    if (!selectedCrisis.value) return

    // Send crisis alert
    alert(`🚨 CRISIS ALERT SENT!\n\nType: ${crisisTypes.find(c => c.id === selectedCrisis.value)?.label}\nLocation: ${currentLocation.value}\n\nDispatch has been notified and is coordinating response.`)

    router.push('/dashboard')
}
</script>
