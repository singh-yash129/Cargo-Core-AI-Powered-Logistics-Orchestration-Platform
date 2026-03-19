<template>
    <div class="screen-layout" :class="isDark ? 'bg-background-dark text-white' : 'bg-background-light text-gray-900'">

        <header class="flex-shrink-0 px-5 pt-5 pb-4 border-b"
            :class="isDark ? 'border-white/5' : 'border-gray-100'">
            <div class="flex items-center gap-3">
                <button @click="$router.back()" class="w-8 h-8 rounded-full flex items-center justify-center"
                    :class="isDark ? 'bg-surface-dark/50 text-gray-400' : 'bg-gray-100 text-gray-600'">
                    <span class="material-icons text-lg">arrow_back</span>
                </button>
                <div>
                    <p class="text-xs uppercase tracking-wider font-bold text-blue-400">Parcel Pickup · Final Step</p>
                    <h1 class="text-xl font-black">Pickup Completion</h1>
                </div>
            </div>
        </header>

        <div class="screen-body flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">

            <!-- Summary Card -->
            <div class="rounded-2xl border p-4"
                :class="isDark ? 'bg-blue-500/10 border-blue-500/20' : 'bg-blue-50 border-blue-200'">
                <div class="flex items-center gap-3 mb-3">
                    <div class="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center">
                        <span class="material-icons text-blue-400 text-2xl">assignment_return</span>
                    </div>
                    <div>
                        <p class="font-bold text-blue-400">Pickup Complete</p>
                        <p class="text-xs" :class="isDark ? 'text-gray-400' : 'text-gray-600'">
                            All items loaded, heading to warehouse
                        </p>
                    </div>
                </div>
                <div class="grid grid-cols-3 gap-3">
                    <div class="rounded-xl p-3 text-center"
                        :class="isDark ? 'bg-black/20' : 'bg-white border border-blue-100'">
                        <p class="text-2xl font-black text-blue-400">{{ totalStops }}</p>
                        <p class="text-[10px] uppercase font-bold mt-0.5"
                            :class="isDark ? 'text-gray-500' : 'text-gray-400'">Stops</p>
                    </div>
                    <div class="rounded-xl p-3 text-center"
                        :class="isDark ? 'bg-black/20' : 'bg-white border border-blue-100'">
                        <p class="text-2xl font-black text-primary">{{ totalItemsScanned }}</p>
                        <p class="text-[10px] uppercase font-bold mt-0.5"
                            :class="isDark ? 'text-gray-500' : 'text-gray-400'">Scanned</p>
                    </div>
                    <div class="rounded-xl p-3 text-center"
                        :class="isDark ? 'bg-black/20' : 'bg-white border border-blue-100'">
                        <p class="text-2xl font-black text-green-400">✓</p>
                        <p class="text-[10px] uppercase font-bold mt-0.5"
                            :class="isDark ? 'text-gray-500' : 'text-gray-400'">Verified</p>
                    </div>
                </div>
            </div>

            <!-- Warehouse Confirmation -->
            <div class="rounded-2xl border p-5"
                :class="isDark ? 'bg-surface-dark/40 border-white/8' : 'bg-white border-gray-100 shadow-sm'">
                <p class="text-xs uppercase tracking-wider font-bold mb-3"
                    :class="isDark ? 'text-gray-400' : 'text-gray-500'">Return Warehouse</p>
                <div class="flex items-start gap-3">
                    <div class="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
                        <span class="material-icons text-primary">warehouse</span>
                    </div>
                    <div>
                        <p class="font-bold">{{ warehouseName }}</p>
                        <p class="text-sm" :class="isDark ? 'text-gray-400' : 'text-gray-500'">
                            {{ warehouseAddress }}
                        </p>
                    </div>
                </div>

                <!-- Confirm -->
                <div class="mt-4 flex items-center gap-3">
                    <button @click="warehouseConfirmed = !warehouseConfirmed"
                        class="w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all"
                        :class="warehouseConfirmed ? 'bg-green-500 border-green-500' : isDark ? 'border-gray-600' : 'border-gray-300'">
                        <span v-if="warehouseConfirmed" class="material-icons text-white text-sm">check</span>
                    </button>
                    <p class="text-sm font-semibold">I confirm all items are loaded and I'm returning to warehouse</p>
                </div>
            </div>

            <!-- Pickup List Summary -->
            <div class="rounded-2xl border overflow-hidden"
                :class="isDark ? 'bg-surface-dark/40 border-white/8' : 'bg-white border-gray-100 shadow-sm'">
                <div class="px-4 py-3 border-b"
                    :class="isDark ? 'border-white/5' : 'border-gray-100'">
                    <p class="text-xs uppercase tracking-wider font-bold"
                        :class="isDark ? 'text-gray-400' : 'text-gray-500'">Completed Pickups</p>
                </div>
                <div class="divide-y" :class="isDark ? 'divide-white/5' : 'divide-gray-50'">
                    <div v-for="stop in completedStops" :key="stop.id" class="px-4 py-3 flex items-center gap-3">
                        <span class="material-icons text-green-400">check_circle</span>
                        <div class="flex-1">
                            <p class="text-sm font-semibold">{{ stop.customerName }}</p>
                            <p class="text-xs" :class="isDark ? 'text-gray-400' : 'text-gray-500'">
                                {{ stop.itemsScanned?.length || stop.expectedItems }} items collected
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Footer -->
        <div class="screen-footer border-t px-5 pt-4 pb-4"
            :class="isDark ? 'border-white/5 bg-background-dark' : 'border-gray-100 bg-background-light'">
            <div v-if="!warehouseConfirmed" class="mb-3 px-3 py-2 rounded-xl text-xs font-semibold text-center"
                :class="isDark ? 'bg-red-500/10 text-red-400' : 'bg-red-50 text-red-600 border border-red-200'">
                Confirm warehouse return above to proceed
            </div>
            <button @click="finishPickup" :disabled="!warehouseConfirmed"
                class="w-full rounded-2xl h-14 flex items-center justify-center gap-3 relative overflow-hidden active:scale-[0.98] transition-all"
                :class="warehouseConfirmed ? 'shadow-glow cursor-pointer' : 'opacity-40 cursor-not-allowed'">
                <div class="absolute inset-0"
                    :class="warehouseConfirmed ? 'bg-gradient-to-r from-blue-600 to-blue-500' : (isDark ? 'bg-gray-700' : 'bg-gray-200')">
                </div>
                <span class="relative material-icons text-2xl text-white">check_circle</span>
                <span class="relative text-lg font-black uppercase tracking-wide text-white">Complete Pickup Job</span>
            </button>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useJobStore } from '../stores/jobStore.js'
import { useUiStore } from '../stores/uiStore.js'
import { useFlowRouter } from '../composables/useFlowRouter.js'

const jobStore = useJobStore()
const uiStore = useUiStore()
const { advanceAndNavigate } = useFlowRouter()
const isDark = computed(() => uiStore.theme !== 'light')
const warehouseConfirmed = ref(false)

const warehouseName = computed(() => jobStore.jobData?.warehouseLocation?.name || 'Mumbai Central Warehouse')
const warehouseAddress = computed(() => jobStore.jobData?.warehouseLocation?.address || 'Gate 5, Goregaon East, Mumbai 400063')

const completedStops = computed(() => jobStore.jobData?.stops || [])
const totalStops = computed(() => completedStops.value.length)
const totalItemsScanned = computed(() =>
    completedStops.value.reduce((acc, s) => acc + (s.itemsScanned?.length || s.expectedItems || 0), 0)
)

function finishPickup() {
    if (!warehouseConfirmed.value) return
    uiStore.showToast('Pickup job complete! 🎉', 'success', 2000)
    setTimeout(() => {
        advanceAndNavigate('COMPLETED', { completedAt: new Date().toISOString() })
    }, 500)
}
</script>
