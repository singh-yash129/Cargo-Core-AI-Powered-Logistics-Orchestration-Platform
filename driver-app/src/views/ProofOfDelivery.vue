<template>
    <div class="min-h-screen pb-safe overflow-y-auto no-scrollbar"
        :class="isDark ? 'bg-background-dark text-white' : 'bg-background-light text-gray-900'">
        <div class="px-5 pt-5 pb-10 flex flex-col gap-5">

            <!-- Header -->
            <div class="flex items-center gap-3">
                <button @click="$router.back()"
                    class="w-10 h-10 rounded-full flex items-center justify-center border flex-shrink-0"
                    :class="isDark ? 'bg-surface-dark border-white/5 text-gray-400' : 'bg-white border-gray-200 shadow-sm text-gray-500'">
                    <span class="material-icons text-xl">arrow_back</span>
                </button>
                <div>
                    <h1 class="text-2xl font-black tracking-tight">Proof of Delivery</h1>
                    <p class="text-xs" :class="isDark ? 'text-gray-400' : 'text-gray-500'">Stop #1 · Priya & Rohit Mehta
                    </p>
                </div>
            </div>

            <!-- Progress Steps -->
            <div class="flex items-center gap-2">
                <div v-for="(step, i) in steps" :key="step" class="flex-1 flex flex-col items-center gap-1">
                    <div class="w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-bold transition-all"
                        :class="currentStep > i
                            ? 'bg-primary border-primary text-background-dark'
                            : currentStep === i
                                ? isDark ? 'border-primary text-primary' : 'border-primary text-primary'
                                : isDark ? 'border-gray-700 text-gray-600' : 'border-gray-200 text-gray-400'">
                        <span v-if="currentStep > i" class="material-icons text-sm">check</span>
                        <span v-else>{{ i + 1 }}</span>
                    </div>
                    <p class="text-[9px] uppercase font-bold text-center"
                        :class="currentStep >= i ? (isDark ? 'text-white' : 'text-gray-700') : isDark ? 'text-gray-600' : 'text-gray-400'">
                        {{ step }}
                    </p>
                </div>
            </div>

            <!-- Step Content -->
            <!-- STEP 0: Customer Signature -->
            <div v-if="currentStep === 0" class="rounded-2xl border overflow-hidden"
                :class="isDark ? 'border-white/5' : 'border-gray-100'">
                <div class="p-4 flex justify-between items-center border-b"
                    :class="isDark ? 'bg-surface-dark/50 border-white/5' : 'bg-gray-50 border-gray-100'">
                    <h3 class="font-bold text-sm">Customer Signature</h3>
                    <button @click="clearSignature" class="text-xs font-semibold text-primary">Clear</button>
                </div>
                <div class="h-48 flex items-center justify-center cursor-crosshair relative"
                    :class="isDark ? 'bg-black/20' : 'bg-gray-50'" @click="hasSig = true">
                    <div v-if="!hasSig" class="text-center">
                        <span class="material-icons text-4xl mb-2"
                            :class="isDark ? 'text-gray-600' : 'text-gray-300'">draw</span>
                        <p class="text-sm" :class="isDark ? 'text-gray-400' : 'text-gray-400'">Tap to sign</p>
                    </div>
                    <div v-else class="flex items-center justify-center w-full h-full">
                        <svg viewBox="0 0 300 100" class="w-4/5 h-20">
                            <path d="M 10 60 Q 60 20 100 50 Q 140 80 180 40 Q 220 10 260 50 Q 290 70 290 70"
                                stroke="#1CE783" stroke-width="3" fill="none" stroke-linecap="round"
                                class="opacity-80" />
                        </svg>
                    </div>
                </div>
            </div>

            <!-- STEP 1: Photo Evidence -->
            <div v-if="currentStep === 1" class="flex flex-col gap-3">
                <div class="grid grid-cols-3 gap-3">
                    <div v-for="(photo, idx) in photos" :key="idx"
                        class="aspect-square rounded-xl overflow-hidden relative border"
                        :class="isDark ? 'border-white/5' : 'border-gray-100'">
                        <img :src="photo" alt="POD Photo" class="w-full h-full object-cover" />
                        <button @click="removePhoto(idx)"
                            class="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center">
                            <span class="material-icons text-xs">close</span>
                        </button>
                    </div>
                    <button @click="addPhoto"
                        class="aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1 transition-colors"
                        :class="isDark ? 'border-gray-600 text-gray-400 hover:border-primary hover:text-primary' : 'border-gray-300 text-gray-400 hover:border-primary hover:text-primary'">
                        <span class="material-icons text-2xl">add_a_photo</span>
                        <span class="text-[10px] font-semibold">Add Photo</span>
                    </button>
                </div>
                <p class="text-xs text-center" :class="isDark ? 'text-gray-500' : 'text-gray-400'">
                    Minimum 1 photo required · Geotagged automatically
                </p>
            </div>

            <!-- STEP 2: OTP Confirmation -->
            <div v-if="currentStep === 2" class="flex flex-col gap-4">
                <div class="rounded-2xl p-5 text-center border"
                    :class="isDark ? 'bg-primary/10 border-primary/20' : 'bg-primary/10 border-primary/30'">
                    <span class="material-icons text-4xl text-primary">sms</span>
                    <h3 class="text-lg font-bold mt-2">Customer OTP</h3>
                    <p class="text-sm mt-1" :class="isDark ? 'text-gray-400' : 'text-gray-500'">
                        OTP sent to +91 ****4321
                    </p>
                </div>
                <div class="flex gap-3 justify-center">
                    <input v-for="i in 4" :key="i" type="tel" maxlength="1" v-model="otp[i - 1]"
                        class="w-14 h-14 text-center text-2xl font-black rounded-2xl border outline-none transition-all"
                        :class="isDark ? 'bg-surface-dark border-white/10 text-white focus:border-primary' : 'bg-white border-gray-200 text-gray-900 focus:border-primary shadow-sm'" />
                </div>
                <p class="text-center text-xs" :class="isDark ? 'text-gray-500' : 'text-gray-400'">
                    Resend OTP in 28s
                </p>
            </div>

            <!-- Navigation -->
            <div class="flex gap-3 mt-auto">
                <button v-if="currentStep > 0" @click="currentStep--"
                    class="flex-1 py-4 rounded-2xl border font-semibold text-sm active:scale-[0.97] transition-all"
                    :class="isDark ? 'bg-surface-dark/50 border-white/5 text-white' : 'bg-white border-gray-200 text-gray-700 shadow-sm'">
                    Back
                </button>
                <button @click="handleNext" :disabled="!canProceed"
                    class="flex-[2] py-4 rounded-2xl font-black text-lg active:scale-[0.97] transition-all"
                    :class="canProceed
                        ? 'bg-primary text-background-dark shadow-glow'
                        : isDark ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-gray-100 text-gray-400 cursor-not-allowed'">
                    {{ currentStep < steps.length - 1 ? 'Next' : 'Complete Delivery ✓' }} </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUiStore } from '../stores/uiStore.js'
import { useRouteStore } from '../stores/routeStore.js'

const router = useRouter()
const uiStore = useUiStore()
const routeStore = useRouteStore()
const isDark = computed(() => uiStore.theme !== 'light')

const steps = ['Signature', 'Photos', 'OTP']
const currentStep = ref(0)
const hasSig = ref(false)
const otp = ref(['', '', '', ''])
const photos = ref([
    'https://images.unsplash.com/photo-1560520656-2f7d3ad3a2fd?w=300&q=80',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&q=80',
])

const canProceed = computed(() => {
    if (currentStep.value === 0) return hasSig.value
    if (currentStep.value === 1) return photos.value.length >= 1
    if (currentStep.value === 2) return otp.value.join('').length === 4
    return false
})

function clearSignature() {
    hasSig.value = false
}

function addPhoto() {
    const urls = [
        'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=300&q=80',
        'https://images.unsplash.com/photo-1580674684081-7617fbf3d745?w=300&q=80',
    ]
    photos.value.push(urls[photos.value.length % urls.length])
}

function removePhoto(idx) {
    photos.value.splice(idx, 1)
}

function handleNext() {
    if (currentStep.value < steps.length - 1) {
        currentStep.value++
    } else {
        routeStore.completeDelivery('STOP-001')
        uiStore.showToast('Delivery completed successfully! 🎉', 'success')
        router.push('/manifest')
    }
}
</script>
