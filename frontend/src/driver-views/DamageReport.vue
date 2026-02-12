<template>
    <div class="bg-background-dark text-white min-h-screen flex flex-col p-6">
        <!-- Header -->
        <div class="mb-8">
            <button @click="$router.back()" class="mb-6 text-gray-400 hover:text-white flex items-center gap-2">
                <span class="material-icons">arrow_back</span>
                <span>Back</span>
            </button>

            <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                    <span class="material-icons text-red-500 text-2xl">report_problem</span>
                </div>
                <div>
                    <h3 class="text-red-500 text-sm font-semibold tracking-wider uppercase">Vehicle Issue</h3>
                    <h1 class="text-3xl font-bold">Damage Report</h1>
                </div>
            </div>
        </div>

        <!-- Vehicle Info -->
        <div class="glass-panel rounded-xl p-4 mb-6">
            <div class="flex justify-between items-center">
                <div>
                    <p class="text-gray-400 text-xs mb-1">Current Vehicle</p>
                    <p class="text-white font-bold text-lg">{{ vehicleId }}</p>
                </div>
                <div class="text-right">
                    <p class="text-gray-400 text-xs mb-1">Odometer</p>
                    <p class="text-white font-mono">{{ odometer }} mi</p>
                </div>
            </div>
        </div>

        <!-- Damage Location Selector -->
        <div class="mb-6">
            <label class="block text-gray-400 text-sm mb-3 font-medium">Damage Location</label>
            <div class="grid grid-cols-2 gap-3">
                <button v-for="location in locations" :key="location" @click="selectedLocation = location" :class="[
                    'glass-panel p-4 rounded-xl transition-all border',
                    selectedLocation === location ? 'border-2 border-red-500 bg-red-500/10' : 'border-white/10'
                ]">
                    <p :class="['font-semibold', selectedLocation === location ? 'text-red-500' : 'text-white']">
                        {{ location }}
                    </p>
                </button>
            </div>
        </div>

        <!-- Severity Selection -->
        <div class="mb-6">
            <label class="block text-gray-400 text-sm mb-3 font-medium">Severity Level</label>
            <div class="flex gap-3">
                <button v-for="level in severityLevels" :key="level.value" @click="severity = level.value" :class="[
                    'flex-1 p-4 rounded-xl transition-all border-2',
                    severity === level.value
                        ? `border-${level.color} bg-${level.color}/10`
                        : 'border-white/10 bg-white/5'
                ]">
                    <p :class="['text-xs mb-1', severity === level.value ? `text-${level.color}` : 'text-gray-400']">
                        {{ level.label }}
                    </p>
                    <div :class="['w-full h-2 rounded-full', `bg-${level.color}`]"></div>
                </button>
            </div>
        </div>

        <!-- Photo Capture -->
        <div class="mb-6">
            <label class="block text-gray-400 text-sm mb-3 font-medium">Damage Photo</label>
            <div v-if="!damagePhoto" @click="showCamera = true"
                class="glass-panel rounded-xl p-8 border-2 border-dashed border-white/20 hover:border-primary cursor-pointer transition-all text-center">
                <span class="material-icons text-gray-500 text-5xl mb-2">add_a_photo</span>
                <p class="text-gray-400">Tap to capture damage photo</p>
            </div>
            <div v-else class="relative">
                <img :src="damagePhoto" alt="Damage" class="w-full h-64 object-cover rounded-xl" />
                <button @click="damagePhoto = null"
                    class="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full shadow-lg">
                    <span class="material-icons">delete</span>
                </button>
            </div>
        </div>

        <!-- Description -->
        <div class="mb-8">
            <label class="block text-gray-400 text-sm mb-3 font-medium">Description</label>
            <textarea v-model="description" placeholder="Describe the damage in detail..." rows="4"
                class="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder:text-gray-600 focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none"></textarea>
        </div>

        <!-- Timestamp & GPS -->
        <div class="bg-white/5 border border-white/10 rounded-xl p-4 mb-8">
            <div class="flex justify-between items-center mb-2">
                <span class="text-gray-400 text-sm">Reported At</span>
                <span class="font-mono text-white text-sm">{{ timestamp }}</span>
            </div>
            <div class="flex justify-between items-center">
                <span class="text-gray-400 text-sm">Location</span>
                <span class="font-mono text-gray-400 text-xs">{{ gpsLocation }}</span>
            </div>
        </div>

        <!-- Submit Button -->
        <button @click="submitReport" :disabled="!selectedLocation || !severity || !description" :class="[
            'w-full py-5 rounded-xl font-bold text-xl mb-3 transition-all',
            selectedLocation && severity && description
                ? 'bg-primary text-black shadow-glow hover:bg-primary-dark active:scale-[0.98]'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
        ]">
            Submit Damage Report
        </button>

        <!-- Camera Modal -->
        <CameraCapture v-if="showCamera" title="Capture Damage" hint="Take clear photo of the damage"
            @close="showCamera = false" @capture="handlePhotoCapture" />
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import CameraCapture from '../driver-components/CameraCapture.vue'

const router = useRouter()

const showCamera = ref(false)
const vehicleId = ref('TRK-2891')
const odometer = ref('45,231')
const selectedLocation = ref(null)
const severity = ref(null)
const damagePhoto = ref(null)
const description = ref('')
const timestamp = ref('')
const gpsLocation = ref('30.2672° N, 97.7431° W')

const locations = ['Front', 'Rear', 'Left Side', 'Right Side', 'Interior', 'Undercarriage']

const severityLevels = [
    { value: 1, label: 'Minor', color: 'yellow-500' },
    { value: 2, label: 'Moderate', color: 'orange-500' },
    { value: 3, label: 'Severe', color: 'red-500' }
]

onMounted(() => {
    timestamp.value = new Date().toLocaleString()
})

const handlePhotoCapture = (photo) => {
    damagePhoto.value = photo
}

const submitReport = () => {
    if (!selectedLocation.value || !severity.value || !description.value) return

    alert(`Damage report submitted!\n\nLocation: ${selectedLocation.value}\nSeverity: ${severityLevels.find(s => s.value === severity.value)?.label}\n\nDispatch has been notified.`)

    router.back()
}
</script>
