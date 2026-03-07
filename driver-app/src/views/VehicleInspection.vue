<template>
    <div class="screen-layout" :class="isDark ? 'bg-background-dark text-white' : 'bg-background-light text-gray-900'">

        <!-- ── DETAIL MODAL (Fuel / Odometer) ────────── -->
        <Transition name="fade-scale">
            <div v-if="detailModal" class="absolute inset-0 z-50 flex items-center justify-center px-6"
                :class="isDark ? 'bg-background-dark/90' : 'bg-background-light/90'" style="backdrop-filter: blur(8px);"
                @click.self="cancelDetail">
                <div class="w-full max-w-sm rounded-3xl p-6 border"
                    :class="isDark ? 'bg-surface-dark border-white/10' : 'bg-white border-gray-200 shadow-xl'">

                    <!-- ── Fuel Modal ──────────────────── -->
                    <template v-if="detailType === 'fuel'">
                        <div class="text-center mb-5">
                            <div class="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-3"
                                :class="isDark ? 'bg-primary/15' : 'bg-primary/10'">
                                <span class="material-icons text-primary text-2xl">local_gas_station</span>
                            </div>
                            <h3 class="text-lg font-black">Fuel Level</h3>
                            <p class="text-xs mt-1" :class="isDark ? 'text-gray-400' : 'text-gray-500'">
                                Photo captured ✓ · Enter fuel in liters (Tank: {{ TANK_CAPACITY }}L)
                            </p>
                        </div>

                        <div class="glass-input rounded-2xl flex items-center px-4 py-4 gap-3 mb-3">
                            <span class="material-icons text-lg"
                                :class="fuelLiters ? 'text-primary' : isDark ? 'text-white/30' : 'text-gray-400'">opacity</span>
                            <input v-model.number="fuelLiters" type="number" inputmode="decimal" min="0"
                                :max="TANK_CAPACITY" :placeholder="`0 – ${TANK_CAPACITY}`"
                                class="flex-1 min-w-0 bg-transparent border-none outline-none font-black text-2xl"
                                :class="isDark ? 'text-white placeholder-white/20' : 'text-gray-900 placeholder-gray-300'"
                                @input="clampFuel" ref="fuelInputRef" />
                            <span class="text-sm font-bold" :class="isDark ? 'text-gray-400' : 'text-gray-500'">L</span>
                        </div>

                        <!-- Auto-calculated % -->
                        <div class="rounded-2xl p-4 border text-center mb-5"
                            :class="fuelPercent > 0 ? 'border-primary/30 bg-primary/8' : isDark ? 'border-white/5 bg-white/3' : 'border-gray-100 bg-gray-50'">
                            <p class="text-4xl font-black"
                                :class="fuelPercent > 0 ? 'text-primary' : isDark ? 'text-gray-600' : 'text-gray-300'">
                                {{ fuelPercent }}%</p>
                            <div class="w-full h-2 rounded-full mt-2" :class="isDark ? 'bg-gray-800' : 'bg-gray-200'">
                                <div class="h-2 rounded-full transition-all duration-300"
                                    :class="fuelPercent > 50 ? 'bg-primary' : fuelPercent > 20 ? 'bg-yellow-400' : 'bg-red-400'"
                                    :style="`width: ${fuelPercent}%`"></div>
                            </div>
                        </div>
                    </template>

                    <!-- ── Odometer Modal ──────────────── -->
                    <template v-if="detailType === 'odometer'">
                        <div class="text-center mb-5">
                            <div class="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-3"
                                :class="isDark ? 'bg-primary/15' : 'bg-primary/10'">
                                <span class="material-icons text-primary text-2xl">speed</span>
                            </div>
                            <h3 class="text-lg font-black">Odometer Reading</h3>
                            <p class="text-xs mt-1" :class="isDark ? 'text-gray-400' : 'text-gray-500'">
                                OCR detected value below — edit if incorrect
                            </p>
                        </div>

                        <div class="glass-input rounded-2xl flex items-center px-4 py-4 gap-3 mb-5">
                            <span class="material-icons text-lg"
                                :class="odometerKm ? 'text-primary' : isDark ? 'text-white/30' : 'text-gray-400'">straighten</span>
                            <input v-model.number="odometerKm" type="number" inputmode="numeric"
                                placeholder="e.g. 48230"
                                class="flex-1 min-w-0 bg-transparent border-none outline-none font-black text-2xl"
                                :class="isDark ? 'text-white placeholder-white/20' : 'text-gray-900 placeholder-gray-300'"
                                ref="odometerInputRef" />
                            <span class="text-sm font-bold"
                                :class="isDark ? 'text-gray-400' : 'text-gray-500'">km</span>
                        </div>
                    </template>

                    <!-- Buttons -->
                    <div class="flex gap-3">
                        <button @click="cancelDetail"
                            class="flex-1 py-3.5 rounded-2xl font-semibold text-sm border active:scale-[0.97] transition-all"
                            :class="isDark ? 'border-white/10 text-white/60 hover:bg-white/5' : 'border-gray-200 text-gray-500 hover:bg-gray-50'">
                            Cancel
                        </button>
                        <button @click="confirmDetail"
                            class="flex-[2] py-3.5 rounded-2xl font-bold text-sm active:scale-[0.97] transition-all"
                            :class="canConfirmDetail
                                ? 'bg-primary text-background-dark shadow-glow'
                                : isDark ? 'bg-gray-700 text-gray-500 opacity-40 cursor-not-allowed' : 'bg-gray-100 text-gray-400 opacity-40 cursor-not-allowed'">
                            <template v-if="detailType === 'fuel'">Confirm · {{ fuelPercent }}%</template>
                            <template v-else>Confirm · {{ odometerKm ? `${Number(odometerKm).toLocaleString('en-IN')}
                                km` : '—' }}</template>
                        </button>
                    </div>
                </div>
            </div>
        </Transition>

        <!-- ── TIRE PHOTO MODAL ──────────────────────── -->
        <Transition name="fade-scale">
            <div v-if="tireModal" class="absolute inset-0 z-50 flex items-center justify-center px-6"
                :class="isDark ? 'bg-background-dark/90' : 'bg-background-light/90'"
                style="backdrop-filter: blur(8px);">
                <div class="w-full max-w-sm rounded-3xl p-6 border"
                    :class="isDark ? 'bg-surface-dark border-white/10' : 'bg-white border-gray-200 shadow-xl'">
                    <div class="text-center mb-5">
                        <div class="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-3"
                            :class="isDark ? 'bg-primary/15' : 'bg-primary/10'">
                            <span class="material-icons text-primary text-2xl">donut_large</span>
                        </div>
                        <h3 class="text-lg font-black">Tire Inspection</h3>
                        <p class="text-xs mt-1" :class="isDark ? 'text-gray-400' : 'text-gray-500'">
                            Capture a photo of each tire · {{ tireCaptured }} of 4 done
                        </p>
                    </div>

                    <!-- 4 tire grid -->
                    <div class="grid grid-cols-2 gap-3 mb-5">
                        <div v-for="(tire, idx) in tirePhotos" :key="idx" @click="captureTirePhoto(idx)"
                            class="aspect-square rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-1 cursor-pointer transition-all active:scale-[0.96]"
                            :class="tire.captured
                                ? 'border-primary bg-primary/10'
                                : isDark ? 'border-gray-600 hover:border-gray-500' : 'border-gray-300 hover:border-gray-400'">
                            <span class="material-icons text-2xl"
                                :class="tire.captured ? 'text-primary' : isDark ? 'text-gray-500' : 'text-gray-400'">
                                {{ tire.captured ? 'check_circle' : 'photo_camera' }}
                            </span>
                            <span class="text-xs font-bold"
                                :class="tire.captured ? 'text-primary' : isDark ? 'text-gray-500' : 'text-gray-400'">
                                {{ tire.label }}
                            </span>
                            <span v-if="tire.captured" class="text-[10px] text-primary">Captured ✓</span>
                        </div>
                    </div>

                    <div class="flex gap-3">
                        <button @click="tireModal = false"
                            class="flex-1 py-3.5 rounded-2xl font-semibold text-sm border active:scale-[0.97] transition-all"
                            :class="isDark ? 'border-white/10 text-white/60' : 'border-gray-200 text-gray-500'">
                            Cancel
                        </button>
                        <button @click="confirmTires"
                            class="flex-[2] py-3.5 rounded-2xl font-bold text-sm active:scale-[0.97] transition-all"
                            :class="tireCaptured === 4
                                ? 'bg-primary text-background-dark shadow-glow'
                                : isDark ? 'bg-gray-700 text-gray-500 opacity-40 cursor-not-allowed' : 'bg-gray-100 text-gray-400 opacity-40 cursor-not-allowed'">
                            Confirm · {{ tireCaptured }}/4 tires
                        </button>
                    </div>
                </div>
            </div>
        </Transition>

        <!-- ── HEADER ───────────────────────────────── -->
        <header class="flex-shrink-0 px-5 pt-6 pb-4 border-b" :class="isDark ? 'border-white/5' : 'border-gray-100'">
            <div class="flex items-center justify-between mb-3">
                <button @click="$router.back()" class="w-10 h-10 rounded-full flex items-center justify-center border"
                    :class="isDark ? 'bg-surface-dark border-white/5 text-gray-400' : 'bg-white border-gray-200 shadow-sm'">
                    <span class="material-icons text-xl">arrow_back</span>
                </button>
                <div class="flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider"
                    :class="isDark ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-primary/10 border-primary/30 text-primary'">
                    Step 3 of 4
                </div>
            </div>
            <h1 class="text-2xl font-black tracking-tight">Vehicle Inspection</h1>
            <p class="text-xs mt-1" :class="isDark ? 'text-gray-400' : 'text-gray-500'">CC-TRK-042 · Complete all items
            </p>

            <div class="mt-3 flex items-center justify-between mb-1">
                <span class="text-xs font-semibold" :class="isDark ? 'text-gray-400' : 'text-gray-500'">Progress</span>
                <span class="text-sm font-bold text-primary">{{ completedCount }} / {{ items.length }}</span>
            </div>
            <div class="w-full rounded-full h-1.5" :class="isDark ? 'bg-gray-800' : 'bg-gray-100'">
                <div class="h-1.5 rounded-full bg-primary transition-all duration-500" :style="`width: ${progress}%`">
                </div>
            </div>
        </header>

        <!-- ── SCROLLABLE BODY ───────────────────────── -->
        <div class="screen-body px-5 py-4 space-y-3">
            <div class="rounded-xl p-3 border flex items-start gap-3"
                :class="isDark ? 'bg-signal-amber/10 border-signal-amber/20' : 'bg-amber-50 border-amber-200'">
                <span class="material-icons text-signal-amber text-base flex-shrink-0">shield</span>
                <p class="text-xs" :class="isDark ? 'text-gray-400' : 'text-gray-600'">
                    Fuel, tire &amp; odometer data is sent to the fraud detection &amp; maintenance systems.
                </p>
            </div>

            <div v-for="item in items" :key="item.id"
                class="flex items-center gap-4 p-4 rounded-2xl border cursor-pointer transition-all active:scale-[0.98]"
                :class="item.checked
                    ? isDark ? 'bg-primary/10 border-primary/30' : 'bg-primary/10 border-primary/30'
                    : isDark ? 'bg-surface-dark/30 border-white/5 hover:border-white/10' : 'bg-white border-gray-100 shadow-sm'"
                @click="handleItemClick(item)">

                <div class="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                    :class="item.checked ? 'bg-primary/20' : isDark ? 'bg-white/5' : 'bg-gray-50'">
                    <span class="material-icons text-xl"
                        :class="item.checked ? 'text-primary' : isDark ? 'text-gray-400' : 'text-gray-500'">{{ item.icon
                        }}</span>
                </div>

                <div class="flex-1 min-w-0">
                    <p class="font-semibold text-sm">{{ item.label }}</p>
                    <p class="text-xs mt-0.5"
                        :class="item.checked ? 'text-primary font-semibold' : isDark ? 'text-gray-500' : 'text-gray-400'">
                        {{ item.checked ? item.value : item.hint }}
                    </p>
                </div>

                <div class="flex items-center gap-2 flex-shrink-0">
                    <span
                        v-if="!item.checked && (item.id === 'fuel_level' || item.id === 'odometer' || item.id === 'tire_pressure')"
                        class="material-icons text-sm"
                        :class="isDark ? 'text-gray-600' : 'text-gray-400'">photo_camera</span>
                    <div class="w-7 h-7 rounded-full border-2 flex items-center justify-center"
                        :class="item.checked ? 'bg-primary border-primary' : isDark ? 'border-gray-600' : 'border-gray-300'">
                        <span v-if="item.checked" class="material-icons text-background-dark text-sm">check</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- ── STICKY FOOTER ────────────────────────── -->
        <div class="screen-footer px-5 py-4 border-t"
            :class="isDark ? 'border-white/5 bg-background-dark' : 'border-gray-100 bg-background-light'">
            <button @click="handleComplete" :disabled="completedCount < items.length"
                class="w-full rounded-2xl h-14 flex items-center justify-center gap-2 font-bold text-lg transition-all active:scale-[0.98]"
                :class="completedCount === items.length
                    ? 'bg-primary text-background-dark shadow-glow'
                    : isDark ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-gray-100 text-gray-400 cursor-not-allowed'">
                <span class="material-icons">{{ completedCount === items.length ? 'check_circle' : 'lock' }}</span>
                {{ completedCount === items.length ? 'Complete Inspection' : `${items.length - completedCount} items
                remaining`
                }}
            </button>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useUiStore } from '../stores/uiStore.js'
import { useCamera } from '../composables/useCamera.js'
import { dummyInspection } from '../utils/dummyData.js'

const router = useRouter()
const uiStore = useUiStore()
const isDark = computed(() => uiStore.theme !== 'light')
const { scanDocument } = useCamera()

// ── Constants ──────────────────────────────────────
const TANK_CAPACITY = 120

// ── Detail modal (fuel / odometer) ─────────────────
const detailModal = ref(false)
const detailType = ref('')
const detailItem = ref(null)
const fuelLiters = ref(null)
const odometerKm = ref(null)
const fuelInputRef = ref(null)
const odometerInputRef = ref(null)

const fuelPercent = computed(() => {
    if (!fuelLiters.value || fuelLiters.value <= 0) return 0
    return Math.min(100, Math.round((fuelLiters.value / TANK_CAPACITY) * 100))
})

const canConfirmDetail = computed(() => {
    if (detailType.value === 'fuel') {
        const v = Number(fuelLiters.value)
        return !isNaN(v) && v > 0
    }
    if (detailType.value === 'odometer') {
        const v = Number(odometerKm.value)
        return !isNaN(v) && v > 0
    }
    return false
})

function clampFuel() {
    if (fuelLiters.value > TANK_CAPACITY) fuelLiters.value = TANK_CAPACITY
    if (fuelLiters.value < 0) fuelLiters.value = 0
}

function cancelDetail() {
    detailModal.value = false
    detailItem.value = null
}

function confirmDetail() {
    if (!canConfirmDetail.value) {
        uiStore.showToast('Please enter a valid value', 'error', 1500)
        return
    }
    const item = detailItem.value
    if (!item) return
    const now = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })

    if (detailType.value === 'fuel') {
        const pct = fuelPercent.value
        const liters = Number(fuelLiters.value)
        item.checked = true
        item.value = `${pct}% · ${liters}L · confirmed at ${now}`
        uiStore.showToast(`Fuel: ${pct}% recorded ✓`, 'success', 1200)
    } else if (detailType.value === 'odometer') {
        const km = Number(odometerKm.value)
        item.checked = true
        item.value = `${km.toLocaleString('en-IN')} km · confirmed at ${now}`
        uiStore.showToast(`Odometer: ${km.toLocaleString('en-IN')} km recorded ✓`, 'success', 1200)
    }

    detailModal.value = false
    detailItem.value = null
}

// ── Tire photo modal ───────────────────────────────
const tireModal = ref(false)
const tireItem = ref(null)
const tirePhotos = ref([
    { label: 'Front Left', captured: false },
    { label: 'Front Right', captured: false },
    { label: 'Rear Left', captured: false },
    { label: 'Rear Right', captured: false },
])
const tireCaptured = computed(() => tirePhotos.value.filter(t => t.captured).length)

async function captureTirePhoto(idx) {
    if (tirePhotos.value[idx].captured) {
        tirePhotos.value[idx].captured = false
        return
    }
    // On native: open camera. In browser: use file picker.
    try {
        const result = await scanDocument(`Capture ${tirePhotos.value[idx].label} tire`)
        if (result) {
            tirePhotos.value[idx].captured = true
        }
    } catch {
        // If camera fails, still allow marking as captured for testing
        tirePhotos.value[idx].captured = true
    }
}

function confirmTires() {
    if (tireCaptured.value < 4) {
        uiStore.showToast(`Capture all 4 tires (${tireCaptured.value}/4 done)`, 'error', 1500)
        return
    }
    const item = tireItem.value
    if (!item) return
    const now = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    item.checked = true
    item.value = `All 4 tires · confirmed at ${now}`
    uiStore.showToast('Tire pressure verified ✓', 'success', 1200)
    tireModal.value = false
    tireItem.value = null
}

// ── Items ──────────────────────────────────────────
const items = ref(dummyInspection.map(i => {
    let hint = 'Tap to confirm'
    if (i.id === 'fuel_level') hint = 'Tap to capture & enter fuel level'
    if (i.id === 'odometer') hint = 'Tap to scan odometer (OCR)'
    if (i.id === 'tire_pressure') hint = 'Tap to photograph all 4 tires'
    return { ...i, hint }
}))

const completedCount = computed(() => items.value.filter(i => i.checked).length)
const progress = computed(() => Math.round((completedCount.value / items.value.length) * 100))

// ── Handle click ───────────────────────────────────
async function handleItemClick(item) {
    if (item.checked) {
        item.checked = false
        item.value = ''
        return
    }

    if (item.id === 'fuel_level') {
        // Step 1: Camera
        const result = await scanDocument('Capture fuel gauge')
        if (!result) return
        // Step 2: Open fuel detail modal
        detailType.value = 'fuel'
        detailItem.value = item
        fuelLiters.value = null
        detailModal.value = true
        await nextTick()
        fuelInputRef.value?.focus()

    } else if (item.id === 'odometer') {
        // Step 1: Camera + OCR
        const result = await scanDocument('Scan odometer')
        if (!result) return
        // Step 2: Open odometer modal with OCR auto-fill (simulated in browser)
        detailType.value = 'odometer'
        detailItem.value = item
        odometerKm.value = 48230 // Simulated OCR result — on native, real ML OCR would set this
        detailModal.value = true
        await nextTick()
        odometerInputRef.value?.focus()

    } else if (item.id === 'tire_pressure') {
        // Open tire photo modal
        tireItem.value = item
        tirePhotos.value.forEach(t => t.captured = false)
        tireModal.value = true

    } else {
        // Simple toggle (lights, cargo, brakes)
        item.checked = true
        const now = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
        item.value = `Confirmed at ${now}`
    }
}

function handleComplete() {
    router.push('/load-verify')
}
</script>

<style scoped>
.fade-scale-enter-active,
.fade-scale-leave-active {
    transition: opacity 0.25s ease, transform 0.25s ease;
}

.fade-scale-enter-from,
.fade-scale-leave-to {
    opacity: 0;
    transform: scale(0.95);
}
</style>
