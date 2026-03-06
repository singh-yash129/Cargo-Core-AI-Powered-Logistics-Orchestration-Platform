<template>
    <div class="min-h-screen pb-8 overflow-y-auto no-scrollbar relative"
        :class="isDark ? 'bg-background-dark text-white' : 'bg-background-light text-gray-900'">

        <!-- Ambient glow -->
        <div
            class="absolute top-16 left-1/2 -translate-x-1/2 w-72 h-72 bg-primary/10 rounded-full blur-[120px] pointer-events-none z-0">
        </div>

        <div class="relative z-10 px-5 flex flex-col min-h-screen">
            <!-- Header -->
            <header class="pt-6 mb-7">
                <div class="flex items-center justify-between mb-3">
                    <div class="flex items-center gap-2 px-3 py-1 rounded-full border"
                        :class="isDark ? 'bg-primary/10 border-primary/20' : 'bg-primary/10 border-primary/30'">
                        <div class="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
                        <span class="text-xs font-bold uppercase tracking-wider text-primary">Pre-Shift · Step 2</span>
                    </div>
                    <button @click="$router.push('/damage-report')" class="transition-colors"
                        :class="isDark ? 'text-gray-400 hover:text-white' : 'text-gray-400 hover:text-gray-800'">
                        <span class="material-icons">report_problem</span>
                    </button>
                </div>
                <h1 class="text-4xl font-black tracking-tight mb-2"
                    style="background: linear-gradient(135deg, rgba(255,255,255,1), rgba(255,255,255,0.4)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">
                    Vehicle Binding
                </h1>
                <p class="text-sm" :class="isDark ? 'text-gray-400' : 'text-gray-500'">Assign vehicle for Shift #402</p>
            </header>

            <!-- Vehicle Card -->
            <div class="rounded-3xl p-6 border mb-6 relative overflow-hidden transition-all"
                :class="isDark ? 'bg-surface-dark/40 border-white/10 hover:border-primary/30' : 'bg-white border-gray-100 shadow-md hover:border-primary/30'">

                <!-- Decorative corner glow -->
                <div class="absolute -top-6 -right-6 w-24 h-24 bg-primary/10 rounded-full blur-3xl pointer-events-none">
                </div>

                <!-- Card Header -->
                <div class="flex justify-between items-start mb-5">
                    <div>
                        <span class="block text-xs uppercase tracking-widest mb-1"
                            :class="isDark ? 'text-gray-400' : 'text-gray-500'">Assigned Unit</span>
                        <div class="text-2xl font-black flex items-center gap-2">
                            CC-TRK-042
                            <span class="material-icons text-primary text-lg">verified</span>
                        </div>
                        <span class="text-sm font-mono mt-0.5" :class="isDark ? 'text-gray-500' : 'text-gray-400'">MH 04
                            AB 2049</span>
                    </div>
                    <div class="w-11 h-11 rounded-full flex items-center justify-center border"
                        :class="isDark ? 'bg-surface-dark border-white/5' : 'bg-gray-50 border-gray-200'">
                        <span class="material-icons text-gray-400 text-xl">local_shipping</span>
                    </div>
                </div>

                <!-- Vehicle Image -->
                <div class="h-44 w-full rounded-2xl mb-6 overflow-hidden relative">
                    <img src="https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=800&q=80"
                        alt="Delivery Truck"
                        class="w-full h-full object-cover opacity-70 grayscale hover:grayscale-0 transition-all duration-700" />
                    <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div class="absolute bottom-3 left-3 right-3 flex justify-between items-end">
                        <span
                            class="bg-black/40 backdrop-blur-md text-white text-xs font-mono px-3 py-1 rounded-lg border border-white/10">
                            MH 04 AB 2049
                        </span>
                        <span
                            class="bg-primary/20 border border-primary/30 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full">READY</span>
                    </div>
                </div>

                <!-- Specs Grid -->
                <div class="grid grid-cols-2 gap-4">
                    <div v-for="spec in vehicleSpecs" :key="spec.label"
                        class="p-4 rounded-xl border flex flex-col gap-1"
                        :class="isDark ? 'bg-black/20 border-white/5' : 'bg-gray-50 border-gray-100'">
                        <div class="flex justify-between items-center">
                            <span class="text-xs" :class="isDark ? 'text-gray-400' : 'text-gray-500'">{{ spec.label
                                }}</span>
                            <span class="material-icons text-xs" :class="isDark ? 'text-gray-600' : 'text-gray-400'">{{
                                spec.icon }}</span>
                        </div>
                        <div class="flex items-end gap-1">
                            <span class="text-2xl font-black">{{ spec.value }}</span>
                            <span class="text-sm pb-0.5" :class="isDark ? 'text-gray-400' : 'text-gray-500'">{{
                                spec.unit }}</span>
                        </div>
                        <div v-if="spec.bar" class="w-full rounded-full h-1 mt-1"
                            :class="isDark ? 'bg-gray-700' : 'bg-gray-200'">
                            <div class="h-1 rounded-full bg-primary" :style="`width: ${spec.bar}%`"></div>
                        </div>
                        <p v-if="spec.sub" class="text-[10px]" :class="isDark ? 'text-gray-500' : 'text-gray-400'">{{
                            spec.sub }}</p>
                    </div>
                </div>
            </div>

            <!-- CTA -->
            <div class="mt-auto">
                <p class="text-center text-xs mb-4 flex items-center justify-center gap-1.5"
                    :class="isDark ? 'text-gray-500' : 'text-gray-400'">
                    <span class="material-icons text-xs">info</span>
                    Check mirrors and tires before binding
                </p>
                <button @click="handleBind"
                    class="group w-full relative overflow-hidden rounded-2xl h-16 shadow-glow active:scale-[0.98] transition-all"
                    style="background: linear-gradient(135deg, #1CE783, #15b86a);">
                    <div class="relative flex items-center justify-center gap-3">
                        <span
                            class="font-black text-lg text-background-dark tracking-wide group-hover:tracking-wider transition-all">BIND
                            &amp; INSPECT</span>
                        <span
                            class="material-icons text-background-dark transition-transform group-hover:translate-x-1">arrow_forward</span>
                    </div>
                </button>
                <button @click="$router.push('/damage-report')"
                    class="w-full text-center text-sm mt-4 underline decoration-white/20 underline-offset-4 transition-colors"
                    :class="isDark ? 'text-gray-500 hover:text-white' : 'text-gray-400 hover:text-gray-700'">
                    Report Issue with Vehicle
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUiStore } from '../stores/uiStore.js'
import { useDriverStore } from '../stores/driverStore.js'
import { dummyVehicle } from '../utils/dummyData.js'

const router = useRouter()
const uiStore = useUiStore()
const driverStore = useDriverStore()
const isDark = computed(() => uiStore.theme !== 'light')

const vehicleSpecs = [
    { label: 'Fuel Level', icon: 'local_gas_station', value: '78', unit: '%', bar: 78, sub: '~312 km range' },
    { label: 'Capacity', icon: 'view_in_ar', value: '3.5', unit: 'T', bar: null, sub: '2 crew seats' },
    { label: 'Odometer', icon: 'speed', value: '48,230', unit: 'km', bar: null, sub: 'Recorded today' },
    { label: 'Last Check', icon: 'build', value: 'Mar 5', unit: '', bar: null, sub: 'Inspection passed' },
]

function handleBind() {
    driverStore.bindVehicle(dummyVehicle)
    router.push('/vehicle-inspection')
}
</script>
