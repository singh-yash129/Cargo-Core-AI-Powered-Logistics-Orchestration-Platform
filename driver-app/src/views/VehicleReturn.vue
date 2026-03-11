<template>
    <div class="screen-layout" :class="isDark ? 'bg-background-dark text-white' : 'bg-background-light text-gray-900'">

        <!-- ── HEADER ───────────────────────────────── -->
        <header class="flex-shrink-0 px-5 pt-5 pb-4 border-b" :class="isDark ? 'border-white/5' : 'border-gray-100'">
            <div class="flex items-center gap-3">
                <button @click="$router.back()" class="w-10 h-10 rounded-full flex items-center justify-center border"
                    :class="isDark ? 'bg-surface-dark border-white/5 text-gray-400' : 'bg-white border-gray-200 shadow-sm'">
                    <span class="material-icons text-xl">arrow_back</span>
                </button>
                <h1 class="text-2xl font-black tracking-tight">Vehicle Return</h1>
            </div>
        </header>

        <!-- ── SCROLLABLE BODY ───────────────────────── -->
        <div class="screen-body px-5 py-4 flex flex-col gap-4">
            <div class="rounded-2xl p-5 border space-y-4"
                :class="isDark ? 'bg-surface-dark/40 border-white/8' : 'bg-white border-gray-100 shadow-sm'">
                <div>
                    <label class="block text-xs uppercase tracking-wider font-bold mb-2"
                        :class="isDark ? 'text-gray-400' : 'text-gray-500'">Fuel Level (%)</label>
                    <div class="flex items-center gap-4">
                        <input v-model.number="fuelLevel" type="range" min="0" max="100"
                            class="flex-1 accent-primary h-2" />
                        <span class="text-lg font-black w-12 text-right text-primary">{{ fuelLevel }}%</span>
                    </div>
                </div>
                <div>
                    <label class="block text-xs uppercase tracking-wider font-bold mb-2"
                        :class="isDark ? 'text-gray-400' : 'text-gray-500'">Odometer (km)</label>
                    <div class="glass-input rounded-xl flex items-center px-4 py-3 gap-2">
                        <span class="material-icons text-primary text-sm">speed</span>
                        <input v-model.number="odometer" type="number"
                            class="flex-1 bg-transparent border-none outline-none text-xl font-black"
                            :class="isDark ? 'text-white' : 'text-gray-900'" />
                    </div>
                </div>
                <div>
                    <label class="block text-xs uppercase tracking-wider font-bold mb-2"
                        :class="isDark ? 'text-gray-400' : 'text-gray-500'">Return Notes (optional)</label>
                    <textarea v-model="notes" rows="2" placeholder="Any issues to report..."
                        class="w-full glass-input rounded-xl px-4 py-3 text-sm outline-none resize-none"
                        :class="isDark ? 'text-white placeholder-gray-600' : 'text-gray-900 placeholder-gray-400'"></textarea>
                </div>

                <!-- Condition Photo -->
                <div>
                    <label class="block text-xs uppercase tracking-wider font-bold mb-2"
                        :class="isDark ? 'text-gray-400' : 'text-gray-500'">Condition Photo (optional)</label>
                    <button v-if="!conditionPhoto" @click="captureCondition" :disabled="isCapturing"
                        class="w-full rounded-xl border-2 border-dashed h-20 flex flex-col items-center justify-center gap-1 transition-all"
                        :class="isDark ? 'border-gray-700 text-gray-500 hover:border-primary/30' : 'border-gray-300 text-gray-400 hover:border-primary'">
                        <span v-if="isCapturing" class="material-icons text-xl animate-spin">hourglass_empty</span>
                        <span v-else class="material-icons text-xl">add_a_photo</span>
                        <span class="text-[10px] font-semibold">{{ isCapturing ? 'Opening...' : 'Capture condition'
                            }}</span>
                    </button>
                    <div v-else class="relative">
                        <img :src="`data:image/jpeg;base64,${conditionPhoto}`" alt="Condition"
                            class="w-full h-24 object-cover rounded-xl border"
                            :class="isDark ? 'border-white/5' : 'border-gray-100'" />
                        <button @click="conditionPhoto = ''"
                            class="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center">
                            <span class="material-icons text-xs">close</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- ── STICKY FOOTER ────────────────────────── -->
        <div class="screen-footer px-5 py-4 border-t"
            :class="isDark ? 'border-white/5 bg-background-dark' : 'border-gray-100 bg-background-light'">
            <button @click="submit"
                class="w-full rounded-2xl h-14 flex items-center justify-center gap-2 font-bold text-background-dark shadow-glow active:scale-[0.98]"
                style="background: linear-gradient(135deg, #1CE783, #15b86a);">
                <span class="material-icons">done_all</span>
                Return Vehicle
            </button>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUiStore } from '../stores/uiStore.js'
import { useDriverStore } from '../stores/driverStore.js'
import { useCamera } from '../composables/useCamera.js'

const router = useRouter()
const uiStore = useUiStore()
const driverStore = useDriverStore()
const isDark = computed(() => uiStore.theme !== 'light')
const { scanDocument, isCapturing } = useCamera()

const fuelLevel = ref(62)
const odometer = ref(48277)
const notes = ref('')
const conditionPhoto = ref('')

async function captureCondition() {
    const result = await scanDocument('Vehicle Condition')
    if (result) {
        conditionPhoto.value = result.base64
        uiStore.showToast('Condition photo captured ✓', 'success', 1200)
    }
}

function submit() {
    driverStore.vehicle = null
    uiStore.showToast('Vehicle returned successfully ✓', 'success')
    router.replace('/shift-summary')
}
</script>
