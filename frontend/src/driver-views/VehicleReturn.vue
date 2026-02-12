<template>
    <div
        class="bg-background-dark text-white min-h-screen flex flex-col font-display antialiased selection-custom pb-safe">
        <!-- Header -->
        <header class="px-6 pt-6 pb-2 z-10">
            <h1 class="text-2xl font-bold tracking-tight text-white mb-1">Vehicle Return</h1>
            <p class="text-gray-400 text-sm">Post-shift vehicle inspection</p>
        </header>

        <!-- Main Content -->
        <main class="flex-1 px-6 flex flex-col pt-4 overflow-y-auto pb-32">

            <!-- Vehicle Card -->
            <div class="bg-surface-dark border border-white/5 rounded-xl p-4 mb-6 flex items-start gap-4">
                <div class="w-16 h-16 rounded-xl bg-white/5 flex items-center justify-center">
                    <span class="material-icons text-3xl text-gray-400">local_shipping</span>
                </div>
                <div>
                    <h2 class="text-lg font-bold text-white">{{ vehicle.id }}</h2>
                    <p class="text-xs text-gray-400 uppercase tracking-wider">{{ vehicle.plate }}</p>
                    <div class="flex items-center gap-2 mt-2">
                        <span
                            class="text-xs bg-green-500/20 text-green-500 px-2 py-0.5 rounded border border-green-500/30">Active</span>
                        <span class="text-xs text-gray-500">Since 8:00 AM</span>
                    </div>
                </div>
            </div>

            <!-- Odometer Check -->
            <div class="bg-card-dark border border-white/10 rounded-xl p-6 mb-4">
                <h3 class="text-sm font-bold text-gray-300 mb-4 uppercase tracking-wider">Final Odometer Reading</h3>
                <div class="flex items-center gap-4">
                    <div class="flex-1 bg-black/30 rounded-lg p-3 border border-white/10 text-center">
                        <p class="text-xs text-gray-500 mb-1">Start</p>
                        <p class="text-lg font-mono font-bold text-white">{{ vehicle.startOdometer }}</p>
                    </div>
                    <span class="material-icons text-gray-600">arrow_forward</span>
                    <div
                        class="flex-1 bg-black/30 rounded-lg p-3 border border-white/10 text-center relative max-w-[140px]">
                        <p class="text-xs text-primary mb-1">End</p>
                        <input type="number" v-model="endOdometer"
                            class="w-full bg-transparent text-center font-mono font-bold text-xl text-white outline-none" />
                        <span class="absolute bottom-1 right-2 text-[10px] text-gray-600">mi</span>
                    </div>
                </div>
                <p class="text-center text-xs text-gray-500 mt-3">{{ endOdometer - vehicle.startOdometer }} miles driven
                    today</p>
            </div>

            <!-- Checklist -->
            <div class="space-y-3 mb-6">
                <h3 class="text-sm font-bold text-gray-300 mb-2 uppercase tracking-wider">Inspection Checklist</h3>

                <button v-for="(item, index) in checklist" :key="index" @click="toggleCheck(index)"
                    class="w-full bg-surface-dark border border-white/10 p-4 rounded-xl flex items-center justify-between transition-all"
                    :class="item.checked ? 'border-primary/50 bg-primary/5' : ''">
                    <span class="text-sm font-medium" :class="item.checked ? 'text-white' : 'text-gray-400'">{{
                        item.label }}</span>
                    <div class="w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors"
                        :class="item.checked ? 'bg-primary border-primary' : 'border-gray-600'">
                        <span v-if="item.checked" class="material-icons text-black text-sm font-bold">check</span>
                    </div>
                </button>
            </div>

            <!-- Damage Report Link -->
            <button @click="$router.push('/damage-report')"
                class="w-full border border-dashed border-gray-600 p-4 rounded-xl flex items-center justify-center gap-2 text-gray-400 hover:text-white hover:border-white/30 transition-colors">
                <span class="material-icons">add_a_photo</span>
                <span>Report New Damage</span>
            </button>

        </main>

        <!-- Action Button -->
        <div
            class="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background-dark via-background-dark/95 to-transparent z-20">
            <button @click="completeReturn"
                class="w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all flex items-center justify-center gap-2"
                :class="canComplete ? 'bg-primary text-black hover:bg-primary-dark' : 'bg-gray-800 text-gray-500 cursor-not-allowed'"
                :disabled="!canComplete">
                <span class="material-icons">vpn_key_off</span>
                Confirm Return & Unbind
            </button>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const vehicle = ref({
    id: 'V-2049',
    plate: 'XYZ-888-CA',
    startOdometer: 45280
})

const endOdometer = ref(45325)

const checklist = ref([
    { label: 'Cleaned interior trash', checked: false },
    { label: ' Plugged in / Refueled', checked: false },
    { label: 'Lights & signals working', checked: false },
    { label: 'No new exterior damage', checked: false }
])

const toggleCheck = (index) => {
    checklist.value[index].checked = !checklist.value[index].checked
}

const canComplete = computed(() => {
    return checklist.value.every(i => i.checked) && endOdometer.value > vehicle.value.startOdometer
})

const completeReturn = () => {
    // Save return data logic
    router.push('/shift-summary')
}
</script>

<style scoped>
.pb-safe {
    padding-bottom: env(safe-area-inset-bottom);
}
</style>
