<template>
    <div class="screen-layout" :class="isDark ? 'bg-background-dark text-white' : 'bg-background-light text-gray-900'">

        <!-- ── DETAIL MODAL (Fuel / Odometer) ────────── -->
        <Transition name="fade-scale">
            <div v-if="detailModal" class="absolute inset-0 z-50 flex flex-col items-center justify-center px-6"
                :class="isDark ? 'bg-background-dark/90' : 'bg-background-light/90'" style="backdrop-filter: blur(8px);"
                @click.self="cancelDetail">
                <div class="w-full max-w-sm rounded-3xl p-6 border flex flex-col gap-4"
                    :class="isDark ? 'bg-surface-dark border-white/10' : 'bg-white border-gray-200 shadow-xl'">

                    <!-- ── Image Preview ─────────────────── -->
                    <div v-if="photoUrl" class="w-full h-40 rounded-2xl overflow-hidden relative border"
                        :class="isDark ? 'border-white/10' : 'border-gray-200'">
                        <img :src="photoUrl" class="w-full h-full object-cover" />
                        <button @click.stop="removePhoto"
                            class="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center backdrop-blur-sm active:scale-95 transition-transform hover:bg-black/70">
                            <span class="material-icons text-lg">close</span>
                        </button>
                        <div
                            class="absolute bottom-2 left-2 px-2 py-1 rounded bg-black/50 text-white text-[10px] font-bold backdrop-blur-sm uppercase tracking-wider">
                            Captured Info
                        </div>
                    </div>

                    <!-- ── Fuel Modal ──────────────────── -->
                    <template v-if="detailType === 'fuel'">
                        <div class="text-center mb-1 mt-2">
                            <div class="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-3"
                                :class="isDark ? 'bg-primary/15' : 'bg-primary/10'">
                                <span class="material-icons text-primary text-2xl">local_gas_station</span>
                            </div>
                            <h3 class="text-lg font-black">Fuel Level</h3>
                            <p class="text-xs mt-1" :class="isDark ? 'text-gray-400' : 'text-gray-500'">
                                Photo captured ✓ · Enter fuel in liters (Tank: {{ TANK_CAPACITY }}L)
                            </p>
                        </div>

                        <label for="inspFuelLiters" class="glass-input rounded-2xl flex items-center px-4 py-4 gap-3 mb-3 cursor-text">
                            <span class="material-icons text-lg"
                                :class="fuelLiters ? 'text-primary' : isDark ? 'text-white/30' : 'text-gray-400'">opacity</span>
                            <input id="inspFuelLiters" v-model.number="fuelLiters" type="number" inputmode="decimal" min="0"
                                :max="TANK_CAPACITY" :placeholder="`0 – ${TANK_CAPACITY}`"
                                class="flex-1 min-w-0 bg-transparent border-none outline-none font-black text-2xl"
                                :class="isDark ? 'text-white placeholder-white/20' : 'text-gray-900 placeholder-gray-300'"
                                @input="clampFuel" ref="fuelInputRef" />
                            <span class="text-sm font-bold" :class="isDark ? 'text-gray-400' : 'text-gray-500'">L</span>
                        </label>

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
                        <div class="text-center mb-1 mt-2">
                            <div v-if="!photoUrl"
                                class="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-3"
                                :class="isDark ? 'bg-primary/15' : 'bg-primary/10'">
                                <span class="material-icons text-primary text-2xl">speed</span>
                            </div>
                            <h3 class="text-lg font-black">Odometer Reading</h3>
                            <p class="text-xs mt-1" :class="isDark ? 'text-gray-400' : 'text-gray-500'">
                                OCR detected value below — edit if incorrect
                            </p>
                        </div>

                        <label for="inspOdometerKm" class="glass-input rounded-2xl flex items-center px-4 py-4 gap-3 mb-5 cursor-text">
                            <span class="material-icons text-lg"
                                :class="odometerKm ? 'text-primary' : isDark ? 'text-white/30' : 'text-gray-400'">straighten</span>
                            <input id="inspOdometerKm" v-model.number="odometerKm" type="number" inputmode="numeric"
                                placeholder="e.g. 48230"
                                class="flex-1 min-w-0 bg-transparent border-none outline-none font-black text-2xl"
                                :class="isDark ? 'text-white placeholder-white/20' : 'text-gray-900 placeholder-gray-300'"
                                ref="odometerInputRef" />
                            <span class="text-sm font-bold"
                                :class="isDark ? 'text-gray-400' : 'text-gray-500'">km</span>
                        </label>
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
                        <div v-for="(tire, idx) in tirePhotos" :key="idx"
                            class="aspect-square rounded-2xl border-2 flex flex-col relative overflow-hidden transition-all"
                            :class="tire.url
                                ? 'border-primary'
                                : isDark ? 'border-dashed border-gray-600 hover:border-gray-500 cursor-pointer' : 'border-dashed border-gray-300 hover:border-gray-400 cursor-pointer'"
                            @click="!tire.url && captureTirePhoto(idx)">

                            <!-- Captured state (Image) -->
                            <template v-if="tire.url">
                                <div class="absolute inset-0 m-1 rounded-xl overflow-hidden">
                                    <img :src="tire.url" class="w-full h-full object-cover" />
                                    <div
                                        class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none">
                                    </div>
                                    <div
                                        class="absolute bottom-2 left-2 right-2 flex items-center justify-between z-10">
                                        <div class="flex items-center gap-1">
                                            <span class="material-icons text-primary text-[10px]">check_circle</span>
                                            <span class="text-[10px] font-bold text-white">{{ tire.label }}</span>
                                        </div>
                                    </div>
                                    <button @click.stop="removeTirePhoto(idx)"
                                        class="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center backdrop-blur-sm active:scale-90 transition-transform hover:bg-black/80 z-20">
                                        <span class="material-icons text-xs">close</span>
                                    </button>
                                </div>
                            </template>

                            <!-- Uncaptured state -->
                            <template v-else>
                                <div class="w-full h-full flex flex-col items-center justify-center gap-1">
                                    <span class="material-icons text-2xl"
                                        :class="isDark ? 'text-gray-500' : 'text-gray-400'">
                                        photo_camera
                                    </span>
                                    <span class="text-xs font-bold text-center px-2"
                                        :class="isDark ? 'text-gray-500' : 'text-gray-400'">
                                        {{ tire.label }}
                                    </span>
                                </div>
                            </template>
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
import { useDriverStore } from '../stores/driverStore.js'
import { useCamera } from '../composables/useCamera.js'
import { dummyInspection } from '../utils/dummyData.js'

const router = useRouter()
const uiStore = useUiStore()
const driverStore = useDriverStore()
const isDark = computed(() => uiStore.theme !== 'light')
const { takePhoto, scanOdometer } = useCamera()

// ── Constants ──────────────────────────────────────
const TANK_CAPACITY = 120

// ── Detail modal (fuel / odometer) ─────────────────
const detailModal = ref(false)
const detailType = ref('')
const detailItem = ref(null)
const fuelLiters = ref(null)
const odometerKm = ref(null)
const photoUrl = ref(null)
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
    photoUrl.value = null
}

async function removePhoto() {
    photoUrl.value = null
    if (detailType.value === 'fuel') {
        const result = await takePhoto({ promptLabel: 'Capture fuel gauge' })
        if (result) photoUrl.value = result.base64
        else cancelDetail()
    } else {
        const result = await scanOdometer('Scan odometer')
        if (result) {
            photoUrl.value = result.base64 || 'data:image/jpeg;base64,MOCK'
            odometerKm.value = result.text.replace(/[^0-9]/g, '') || 48230
        } else {
            cancelDetail()
        }
    }
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
    { label: 'Front Left', url: null },
    { label: 'Front Right', url: null },
    { label: 'Rear Left', url: null },
    { label: 'Rear Right', url: null },
])
const tireCaptured = computed(() => tirePhotos.value.filter(t => t.url).length)

async function captureTirePhoto(idx) {
    if (tirePhotos.value[idx].url) return // already captured

    // On native: open camera. In browser: use file picker.
    try {
        const result = await takePhoto({ promptLabel: `Capture ${tirePhotos.value[idx].label} tire` })
        if (result && result.base64 && result.base64.startsWith('data:')) {
            tirePhotos.value[idx].url = result.base64
        } else if (result && result.base64) {
            tirePhotos.value[idx].url = `data:image/jpeg;base64,${result.base64}`
        } else if (result) {
            tirePhotos.value[idx].url = 'https://images.unsplash.com/photo-1580274455191-1c62238fa333?auto=format&fit=crop&q=80&w=200&h=200'
        }
    } catch {
        // If camera fails, still allow marking as captured for testing
        tirePhotos.value[idx].url = 'https://images.unsplash.com/photo-1580274455191-1c62238fa333?auto=format&fit=crop&q=80&w=200&h=200'
    }
}

function removeTirePhoto(idx) {
    tirePhotos.value[idx].url = null
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
        const result = await takePhoto({ promptLabel: 'Capture fuel gauge' })
        if (!result) return

        // Step 2: Open fuel detail modal
        detailType.value = 'fuel'
        detailItem.value = item
        fuelLiters.value = null
        photoUrl.value = (result.base64 && !result.base64.startsWith('MOCK'))
            ? `data:image/jpeg;base64,${result.base64}`
            : 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&q=80&w=400&h=200'
        detailModal.value = true
        await nextTick()
        fuelInputRef.value?.focus()

    } else if (item.id === 'odometer') {
        // Step 1: Camera + OCR
        const result = await scanOdometer('Scan odometer')
        if (!result) return

        // Step 2: Open odometer modal with OCR auto-fill
        detailType.value = 'odometer'
        detailItem.value = item
        photoUrl.value = (result.base64 && !result.base64.startsWith('MOCK'))
            ? `data:image/jpeg;base64,${result.base64}`
            : 'https://images.unsplash.com/photo-1627883287040-e2ef6cb90b21?auto=format&fit=crop&q=80&w=400&h=200'
        odometerKm.value = result.text.replace(/[^0-9]/g, '') || 48230 // OCR result
        detailModal.value = true
        await nextTick()
        odometerInputRef.value?.focus()

    } else if (item.id === 'tire_pressure') {
        // Open tire photo modal
        tireItem.value = item
        tirePhotos.value.forEach(t => t.url = null)
        tireModal.value = true

    } else {
        // Simple toggle (lights, cargo, brakes)
        item.checked = true
        const now = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
        item.value = `Confirmed at ${now}`
    }
}

function handleComplete() {
    driverStore.inspectionDone = true
    router.push('/crew')
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
