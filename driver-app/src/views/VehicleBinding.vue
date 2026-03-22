<template>
    <div class="screen-layout" :class="isDark ? 'bg-background-dark text-white' : 'bg-background-light text-gray-900'">

        <!-- ── BINDING SUCCESS OVERLAY ──────────────── -->
        <Transition name="fade-scale">
            <div v-if="phase === 'success'"
                class="absolute inset-0 z-50 flex flex-col items-center justify-center gap-5"
                :class="isDark ? 'bg-background-dark' : 'bg-background-light'">
                <!-- Pulsing ring -->
                <div class="relative flex items-center justify-center">
                    <div class="absolute w-32 h-32 rounded-full bg-primary/20 animate-ping"></div>
                    <div class="absolute w-24 h-24 rounded-full bg-primary/30 animate-pulse"></div>
                    <div class="w-20 h-20 rounded-full bg-primary flex items-center justify-center shadow-glow">
                        <span class="material-icons text-4xl text-background-dark">link</span>
                    </div>
                </div>
                <div class="text-center">
                    <p class="text-xs uppercase tracking-[0.3em] font-bold mb-1"
                        :class="isDark ? 'text-primary/70' : 'text-primary'">Binding Complete</p>
                    <h2 class="text-3xl font-black">{{ vehicle.vehicleId }}</h2>
                    <p class="text-sm mt-1 font-mono" :class="isDark ? 'text-gray-400' : 'text-gray-500'">{{
                        vehicle.plateNumber }}</p>
                </div>
                <div class="flex items-center gap-2 px-4 py-2 rounded-full"
                    :class="isDark ? 'bg-primary/10 border border-primary/20' : 'bg-primary/10 border border-primary/30'">
                    <div class="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
                    <span class="text-xs font-bold text-primary uppercase tracking-widest">Vehicle Assigned to
                        DRV-2049</span>
                </div>
            </div>
        </Transition>

        <!-- ── HEADER ───────────────────────────────── -->
        <header class="flex-shrink-0 px-5 pt-5 pb-4 border-b" :class="isDark ? 'border-white/5' : 'border-gray-100'">
            <div class="flex items-center justify-between mb-2">
                <button @click="$router.back()" class="w-9 h-9 rounded-full flex items-center justify-center border"
                    :class="isDark ? 'bg-white/5 border-white/10 text-gray-400' : 'bg-white border-gray-200 shadow-sm text-gray-600'">
                    <span class="material-icons text-lg">arrow_back</span>
                </button>
                <div class="flex items-center gap-2 px-3 py-1 rounded-full border"
                    :class="isDark ? 'bg-primary/10 border-primary/20' : 'bg-primary/10 border-primary/30'">
                    <div class="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
                    <span class="text-xs font-bold uppercase tracking-wider text-primary">Step 2 of 4</span>
                </div>
            </div>
            <h1 class="text-2xl font-black tracking-tight mt-3">Vehicle Binding</h1>
            <p class="text-sm mt-0.5" :class="isDark ? 'text-gray-400' : 'text-gray-500'">Confirm your unit for Shift
                #402</p>
        </header>

        <!-- ── SCROLLABLE BODY ───────────────────────── -->
        <div class="screen-body px-5 py-4 flex flex-col gap-4 flex-1">

            <!-- ── SCAN / ENTRY PANEL (phase: scan) ─── -->
            <div v-if="phase === 'scan'" class="flex flex-col gap-4 flex-1 h-full min-h-0">

                <!-- QR Scanner mock -->
                <div class="rounded-3xl overflow-hidden border relative flex-1 flex flex-col min-h-0"
                    :class="isDark ? 'border-white/10' : 'border-gray-200 shadow-sm'">
                    <div class="flex-1 flex items-center justify-center relative min-h-[250px]"
                        :class="isDark ? 'bg-black/40' : 'bg-gray-100'">
                        <!-- Corner brackets -->
                        <div class="absolute top-5 left-5 w-10 h-10 border-t-2 border-l-2 border-primary rounded-tl-lg">
                        </div>
                        <div
                            class="absolute top-5 right-5 w-10 h-10 border-t-2 border-r-2 border-primary rounded-tr-lg">
                        </div>
                        <div
                            class="absolute bottom-5 left-5 w-10 h-10 border-b-2 border-l-2 border-primary rounded-bl-lg">
                        </div>
                        <div
                            class="absolute bottom-5 right-5 w-10 h-10 border-b-2 border-r-2 border-primary rounded-br-lg">
                        </div>
                        <!-- Scan line animation -->
                        <div class="scan-line"></div>
                        <!-- Center icon -->
                        <div class="flex flex-col items-center gap-2 z-10">
                            <span class="material-icons text-5xl"
                                :class="isDark ? 'text-white/20' : 'text-gray-300'">qr_code_scanner</span>
                            <p class="text-xs font-semibold" :class="isDark ? 'text-white/30' : 'text-gray-400'">Align
                                QR code in frame</p>
                        </div>
                    </div>
                    <!-- Tap-to-scan button -->
                    <button @click="simulateScan"
                        class="w-full py-5 flex items-center justify-center gap-2 font-bold text-base border-t shrink-0 transition-all active:scale-[0.99]"
                        :class="isDark ? 'bg-white/5 border-white/5 text-white hover:bg-white/8' : 'bg-white border-gray-100 text-gray-700 hover:bg-gray-50'">
                        <span class="material-icons text-xl text-primary">qr_code</span>
                        Tap to Scan QR Code
                    </button>
                </div>

                <!-- Divider -->
                <div class="flex items-center gap-3 shrink-0">
                    <div class="flex-1 h-px" :class="isDark ? 'bg-white/8' : 'bg-gray-200'"></div>
                    <span class="text-[10px] uppercase tracking-widest font-semibold"
                        :class="isDark ? 'text-white/30' : 'text-gray-400'">or enter manually</span>
                    <div class="flex-1 h-px" :class="isDark ? 'bg-white/8' : 'bg-gray-200'"></div>
                </div>

                <!-- Bottom action area -->
                <div class="flex flex-col gap-3 shrink-0 mb-2">
                    <!-- Manual entry -->
                    <div @click="focusVehicleInput" class="glass-input rounded-2xl flex items-center px-5 py-5 gap-3 cursor-text"
                        :class="manualId ? (isDark ? 'border-primary/40' : 'border-primary/50') : ''">
                        <span class="material-icons text-xl shrink-0"
                            :class="manualId ? 'text-primary' : isDark ? 'text-white/30' : 'text-gray-400'">local_shipping</span>
                        <input ref="vehicleInputRef" id="manualVehicleId" v-model="manualId" @keyup.enter="handleManualLookup" type="text"
                            placeholder="e.g. CC-TRK-042"
                            class="flex-1 min-w-0 bg-transparent border-none outline-none font-mono font-bold text-lg disabled:opacity-50"
                            :class="isDark ? 'text-white placeholder-white/30' : 'text-gray-900 placeholder-gray-400'"
                            inputmode="text" enterkeyhint="search"
                            style="text-transform: uppercase; pointer-events: auto; touch-action: manipulation;"
                            autocomplete="off" />
                        <button v-if="manualId" @click.stop.prevent="handleManualLookup"
                            class="shrink-0 w-10 h-10 rounded-full bg-primary flex items-center justify-center active:scale-90">
                            <span class="material-icons text-base text-background-dark">arrow_forward</span>
                        </button>
                    </div>

                    <!-- Error -->
                    <p v-if="lookupError"
                        class="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/20 rounded-xl py-2 px-4">
                        {{ lookupError }}
                    </p>
                </div>
            </div>

            <!-- ── VEHICLE CONFIRM CARD (phase: confirm) ── -->
            <div v-if="phase === 'confirm'" class="flex flex-col gap-4">

                <!-- Match badge -->
                <div class="flex items-center gap-2 px-4 py-2.5 rounded-2xl border"
                    :class="isDark ? 'bg-primary/10 border-primary/20' : 'bg-primary/10 border-primary/30'">
                    <span class="material-icons text-primary text-xl">verified</span>
                    <div>
                        <p class="text-xs font-black text-primary uppercase tracking-widest">Vehicle Found</p>
                        <p class="text-[10px]" :class="isDark ? 'text-white/50' : 'text-gray-500'">Roster match
                            confirmed — Shift #402</p>
                    </div>
                </div>

                <!-- Vehicle card -->
                <div class="rounded-3xl p-5 border relative overflow-hidden"
                    :class="isDark ? 'bg-surface-dark/40 border-white/10' : 'bg-white border-gray-100 shadow-md'">
                    <div
                        class="absolute -top-8 -right-8 w-28 h-28 bg-primary/10 rounded-full blur-3xl pointer-events-none">
                    </div>

                    <!-- Header row -->
                    <div class="flex items-start justify-between mb-5">
                        <div>
                            <span class="text-[10px] uppercase tracking-widest font-semibold"
                                :class="isDark ? 'text-gray-400' : 'text-gray-500'">Assigned Unit</span>
                            <div class="text-2xl font-black flex items-center gap-2 mt-0.5">
                                {{ vehicle.vehicleId }}
                            </div>
                            <span class="text-sm font-mono" :class="isDark ? 'text-gray-400' : 'text-gray-500'">{{
                                vehicle.plateNumber }}</span>
                        </div>
                        <div class="w-12 h-12 rounded-2xl flex items-center justify-center border"
                            :class="isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'">
                            <span class="material-icons text-2xl"
                                :class="isDark ? 'text-gray-400' : 'text-gray-500'">local_shipping</span>
                        </div>
                    </div>

                    <!-- Vehicle illustration (SVG — no external image) -->
                    <div class="rounded-2xl h-36 flex items-center justify-center mb-5 relative overflow-hidden border"
                        :class="isDark ? 'bg-black/30 border-white/5' : 'bg-gray-50 border-gray-100'">
                        <svg viewBox="0 0 220 90" class="w-full h-full px-4" fill="none"
                            xmlns="http://www.w3.org/2000/svg">
                            <!-- truck body -->
                            <rect x="30" y="20" width="140" height="55" rx="6" :fill="isDark ? '#1a2c24' : '#e8f5ee'"
                                :stroke="isDark ? '#1CE78330' : '#1CE78350'" stroke-width="1.5" />
                            <!-- cab -->
                            <rect x="148" y="30" width="38" height="45" rx="5" :fill="isDark ? '#233b2e' : '#d4ede1'"
                                :stroke="isDark ? '#1CE78340' : '#1CE78360'" stroke-width="1.5" />
                            <!-- windshield -->
                            <rect x="153" y="35" width="26" height="18" rx="3" :fill="isDark ? '#0f1c16' : '#b8dfc9'" />
                            <!-- cargo door line -->
                            <line x1="80" y1="20" x2="80" y2="75" :stroke="isDark ? '#1CE78325' : '#1CE78345'"
                                stroke-width="1" />
                            <line x1="105" y1="20" x2="105" y2="75" :stroke="isDark ? '#1CE78325' : '#1CE78345'"
                                stroke-width="1" />
                            <line x1="130" y1="20" x2="130" y2="75" :stroke="isDark ? '#1CE78325' : '#1CE78345'"
                                stroke-width="1" />
                            <!-- Cargo-Core logo mark on side -->
                            <text x="65" y="52" font-size="8" font-weight="bold" font-family="monospace"
                                :fill="isDark ? '#1CE78360' : '#1CE78380'">CARGO-CORE</text>
                            <!-- wheels -->
                            <circle cx="65" cy="78" r="10" :fill="isDark ? '#111' : '#cbd5e1'"
                                :stroke="isDark ? '#333' : '#94a3b8'" stroke-width="2" />
                            <circle cx="65" cy="78" r="4" :fill="isDark ? '#1CE78330' : '#1CE78350'" />
                            <circle cx="155" cy="78" r="10" :fill="isDark ? '#111' : '#cbd5e1'"
                                :stroke="isDark ? '#333' : '#94a3b8'" stroke-width="2" />
                            <circle cx="155" cy="78" r="4" :fill="isDark ? '#1CE78330' : '#1CE78350'" />
                        </svg>
                        <!-- Plate overlay -->
                        <div class="absolute bottom-2.5 right-3">
                            <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded border"
                                :class="isDark ? 'bg-black/50 border-white/10 text-white/60' : 'bg-white/80 border-gray-200 text-gray-600'">{{
                                    vehicle.plateNumber }}</span>
                        </div>
                        <div class="absolute top-2.5 right-3">
                            <span class="text-[10px] font-bold px-2 py-0.5 rounded-full border text-primary"
                                :class="isDark ? 'bg-primary/10 border-primary/20' : 'bg-primary/15 border-primary/30'">●
                                READY</span>
                        </div>
                    </div>

                    <!-- Specs grid -->
                    <div class="grid grid-cols-2 gap-3">
                        <div v-for="spec in vehicleSpecs" :key="spec.label"
                            class="p-3.5 rounded-xl border flex flex-col gap-1"
                            :class="isDark ? 'bg-black/20 border-white/5' : 'bg-gray-50 border-gray-100'">
                            <div class="flex justify-between items-center">
                                <span class="text-[10px] uppercase tracking-wider"
                                    :class="isDark ? 'text-gray-400' : 'text-gray-500'">{{ spec.label }}</span>
                                <span class="material-icons text-xs"
                                    :class="isDark ? 'text-gray-600' : 'text-gray-400'">{{ spec.icon }}</span>
                            </div>
                            <div class="flex items-end gap-1 mt-0.5">
                                <span class="text-lg font-black leading-none">{{ spec.value }}</span>
                                <span class="text-xs pb-0.5" :class="isDark ? 'text-gray-400' : 'text-gray-500'">{{
                                    spec.unit }}</span>
                            </div>
                            <div v-if="spec.bar !== null" class="w-full rounded-full h-1 mt-1"
                                :class="isDark ? 'bg-gray-700' : 'bg-gray-200'">
                                <div class="h-1 rounded-full transition-all duration-700"
                                    :class="spec.bar > 50 ? 'bg-primary' : spec.bar > 20 ? 'bg-yellow-400' : 'bg-red-400'"
                                    :style="`width: ${spec.bar}%`"></div>
                            </div>
                            <p class="text-[10px] mt-0.5" :class="isDark ? 'text-gray-500' : 'text-gray-400'">{{
                                spec.sub }}</p>
                        </div>
                    </div>
                </div>

                <!-- Driver–vehicle confirmation row -->
                <div class="rounded-2xl px-4 py-3 border flex items-center gap-3"
                    :class="isDark ? 'bg-white/3 border-white/5' : 'bg-gray-50 border-gray-100'">
                    <span class="material-icons text-primary">badge</span>
                    <div class="flex-1">
                        <p class="text-xs font-bold">{{ driverStore.driverName }}</p>
                        <p class="text-[10px]" :class="isDark ? 'text-gray-500' : 'text-gray-400'">{{
                            driverStore.driverId }} · Level 3 Field Execution</p>
                    </div>
                    <span class="material-icons text-xs" :class="isDark ? 'text-white/20' : 'text-gray-300'">link</span>
                    <div class="text-right">
                        <p class="text-xs font-bold">{{ vehicle.vehicleId }}</p>
                        <p class="text-[10px]" :class="isDark ? 'text-gray-500' : 'text-gray-400'">{{ vehicle.type }}
                        </p>
                    </div>
                </div>

                <p class="text-center text-[11px]" :class="isDark ? 'text-gray-600' : 'text-gray-400'">
                    <span class="material-icons text-xs align-middle">lock</span>
                    Binding is logged in the non-editable audit ledger
                </p>
            </div>
        </div>

        <!-- ── STICKY FOOTER ────────────────────────── -->
        <div v-if="phase === 'confirm'" class="screen-footer px-5 py-4 border-t"
            :class="isDark ? 'border-white/5 bg-background-dark' : 'border-gray-100 bg-background-light'">

            <!-- Confirm phase: bind button -->
            <div class="flex flex-col gap-2">
                <button @click="handleBind" :disabled="binding"
                    class="group w-full relative rounded-2xl h-14 shadow-glow active:scale-[0.98] flex items-center justify-center gap-3 font-black text-lg text-background-dark disabled:opacity-70"
                    style="background: linear-gradient(135deg, #1CE783, #15b86a);">
                    <span v-if="binding"
                        class="w-5 h-5 border-2 border-background-dark/30 border-t-background-dark rounded-full animate-spin"></span>
                    <span v-else class="material-icons">link</span>
                    {{ binding ? 'Binding...' : 'Confirm & Bind Vehicle' }}
                    <span v-if="!binding"
                        class="material-icons transition-transform group-hover:translate-x-1">arrow_forward</span>
                </button>
                <button @click="resetToScan"
                    class="w-full rounded-2xl h-10 flex items-center justify-center gap-1.5 text-sm font-semibold border transition-all active:scale-[0.98]"
                    :class="isDark ? 'border-white/10 text-white/50 hover:bg-white/5' : 'border-gray-200 text-gray-400 hover:bg-gray-50'">
                    <span class="material-icons text-base">refresh</span>
                    Wrong vehicle? Re-scan
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUiStore } from '../stores/uiStore.js'
import { useDriverStore } from '../stores/driverStore.js'
import { useCamera } from '../composables/useCamera.js'
import { useLocalNotifications } from '../composables/useLocalNotifications.js'
import { dummyVehicle } from '../utils/dummyData.js'

const router = useRouter()
const uiStore = useUiStore()
const driverStore = useDriverStore()
const { scanQrCode, isCapturing } = useCamera()
const { notify } = useLocalNotifications()
const vehicleInputRef = ref(null)
const focusVehicleInput = () => {
    if (vehicleInputRef.value) vehicleInputRef.value.focus()
}

const isDark = computed(() => uiStore.theme !== 'light')

// ── Phase state: 'scan' → 'confirm' → 'success' ──────────────────
const phase = ref('scan')
const manualId = ref('')
const lookupError = ref('')
const binding = ref(false)
const vehicle = ref(dummyVehicle)

// ── Known fleet (in a real app this comes from the API) ───────────
const FLEET = { 'CC-TRK-042': dummyVehicle }

const vehicleSpecs = computed(() => [
    { label: 'Fuel Level', icon: 'local_gas_station', value: vehicle.value.fuelLevel, unit: '%', bar: vehicle.value.fuelLevel, sub: `~${vehicle.value.range} km range` },
    { label: 'Capacity', icon: 'view_in_ar', value: vehicle.value.capacity, unit: 'T', bar: null, sub: `${vehicle.value.seats} crew seats` },
    { label: 'Odometer', icon: 'speed', value: vehicle.value.odometer.toLocaleString('en-IN'), unit: 'km', bar: null, sub: 'Recorded today' },
    { label: 'Last Check', icon: 'build', value: 'Mar 5', unit: '', bar: null, sub: 'Inspection passed' },
])

// ── Simulate or Actual QR scan (resolves to the assigned vehicle) ──────────
async function simulateScan() {
    // If native platform, this opens the custom UI overlay via ML-Kit.
    // If browser, this simulates a scan returning a mock code after 2.5s.
    const result = await scanQrCode('Align QR code in frame')
    if (result) {
        // Typically we'd use the real result to look up the van
        // For our prototype, we'll force it to CC-TRK-042 if successful
        manualId.value = 'CC-TRK-042'
        handleManualLookup()
    }
}

// ── Look up by typed or scanned ID ───────────────────────────────
function handleManualLookup() {
    lookupError.value = ''
    const id = manualId.value.trim().toUpperCase()
    if (!id) return
    const found = FLEET[id]
    if (!found) {
        lookupError.value = `Vehicle "${id}" not found or not assigned to your roster.`
        return
    }
    vehicle.value = found
    phase.value = 'confirm'
}

// ── Reset back to scan phase ──────────────────────────────────────
function resetToScan() {
    phase.value = 'scan'
    manualId.value = ''
    lookupError.value = ''
}

// ── Confirm & bind ────────────────────────────────────────────────
async function handleBind() {
    binding.value = true
    await new Promise(r => setTimeout(r, 900))
    driverStore.bindVehicle(vehicle.value)
    driverStore.vehicleBound = true
    binding.value = false
    phase.value = 'success'
    notify({ title: 'Vehicle Bound', body: `${vehicle.value.vehicleId} linked to your shift`, type: 'success' })
    // Brief success display then advance
    await new Promise(r => setTimeout(r, 1800))
    router.push('/vehicle-inspection')
}
</script>

<style scoped>
/* QR scan line sweep */
.scan-line {
    position: absolute;
    left: 20px;
    right: 20px;
    height: 2px;
    background: linear-gradient(90deg, transparent, #1CE783, transparent);
    animation: scanSweep 2s ease-in-out infinite;
    box-shadow: 0 0 8px rgba(28, 231, 131, 0.6);
}

@keyframes scanSweep {
    0% {
        top: 20px;
        opacity: 1;
    }

    50% {
        top: calc(100% - 20px);
        opacity: 1;
    }

    100% {
        top: 20px;
        opacity: 1;
    }
}

.fade-scale-enter-active,
.fade-scale-leave-active {
    transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-scale-enter-from,
.fade-scale-leave-to {
    opacity: 0;
    transform: scale(0.95);
}
</style>
