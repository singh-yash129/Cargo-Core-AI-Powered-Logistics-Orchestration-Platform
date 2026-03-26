<template>
    <div class="screen-layout" :class="isDark ? 'bg-background-dark text-white' : 'bg-background-light text-gray-900'">

        <!-- Header -->
        <header class="flex-shrink-0 px-5 pt-5 pb-4 border-b"
            :class="isDark ? 'border-white/5' : 'border-gray-100'">
            <div class="flex items-center gap-3 mb-3">
                <button @click="$router.back()" class="w-8 h-8 rounded-full flex items-center justify-center"
                    :class="isDark ? 'bg-surface-dark/50 text-gray-400' : 'bg-gray-100 text-gray-600'">
                    <span class="material-icons text-lg">arrow_back</span>
                </button>
                <div>
                    <p class="text-xs uppercase tracking-wider font-bold text-purple-400">House Shift · Phase 3</p>
                    <h1 class="text-xl font-black">Unloading Inventory</h1>
                </div>
                <div class="ml-auto">
                    <p class="text-sm font-black text-purple-400">{{ unloadedCount }}/{{ totalItems }} Done</p>
                </div>
            </div>
            <div class="w-full h-2 rounded-full" :class="isDark ? 'bg-gray-800' : 'bg-gray-200'">
                <div class="h-2 rounded-full bg-purple-500 transition-all duration-500"
                    :style="`width: ${unloadProgress}%`"></div>
            </div>
        </header>

        <!-- Body -->
        <div class="screen-body flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">

            <!-- Destination Card -->
            <div class="rounded-2xl p-4 flex items-center gap-4 border"
                :class="isDark ? 'bg-purple-500/10 border-purple-500/20' : 'bg-purple-50 border-purple-200'">
                <div class="w-12 h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center">
                    <span class="material-icons text-purple-400 text-2xl">place</span>
                </div>
                <div>
                    <p class="font-bold text-purple-400">Unloading at Destination</p>
                    <p class="text-xs mt-0.5" :class="isDark ? 'text-gray-400' : 'text-gray-600'">
                        {{ jobStore.jobData?.destinationLocation?.address?.slice(0, 45) }}...
                    </p>
                </div>
            </div>

            <!-- Inventory by Category -->
            <div v-for="category in inventoryByCategory" :key="category.name"
                class="rounded-2xl border overflow-hidden"
                :class="isDark ? 'bg-surface-dark/40 border-white/8' : 'bg-white border-gray-100 shadow-sm'">
                <div class="px-4 py-2.5 border-b flex items-center justify-between"
                    :class="isDark ? 'border-white/5 bg-black/20' : 'border-gray-100 bg-gray-50'">
                    <p class="text-xs uppercase tracking-wider font-bold"
                        :class="isDark ? 'text-gray-400' : 'text-gray-500'">{{ category.name }}</p>
                    <span class="text-xs font-bold text-purple-400">
                        {{ category.items.filter(i => i.unloaded).length }}/{{ category.items.length }}
                    </span>
                </div>
                <div class="divide-y" :class="isDark ? 'divide-white/5' : 'divide-gray-50'">
                    <div v-for="item in category.items" :key="item.id"
                        class="flex items-center gap-3 px-4 py-3.5 cursor-pointer transition-all active:scale-[0.98]"
                        :class="item.unloaded ? (isDark ? 'bg-green-500/5' : 'bg-green-50') : ''"
                        @click="toggleItemUnloaded(item)">
                        <div class="w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all"
                            :class="item.unloaded
                                ? 'bg-green-500 border-green-500'
                                : isDark ? 'border-gray-600' : 'border-gray-300'">
                            <span v-if="item.unloaded" class="material-icons text-white text-sm">check</span>
                        </div>
                        <div class="flex-1">
                            <p class="text-sm font-semibold"
                                :class="item.unloaded ? (isDark ? 'text-gray-400' : 'text-gray-400') : ''">
                                {{ item.item }}
                            </p>
                            <p class="text-xs" :class="isDark ? 'text-gray-500' : 'text-gray-400'">
                                Qty: {{ item.qty }}
                                <span v-if="item.loaded && !item.unloaded" class="text-primary ml-2">· Was loaded</span>
                            </p>
                        </div>
                        <span class="material-icons text-lg"
                            :class="item.unloaded ? 'text-green-400' : isDark ? 'text-gray-600' : 'text-gray-300'">
                            {{ item.unloaded ? 'check_circle' : 'circle' }}
                        </span>
                    </div>
                </div>
            </div>

            <!-- Damage Flag -->
            <div class="rounded-2xl border p-4"
                :class="isDark ? 'bg-red-500/5 border-red-500/20' : 'bg-red-50 border-red-200'">
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                        <span class="material-icons text-red-400">report_problem</span>
                        <p class="text-sm font-bold text-red-400">Report Damage</p>
                    </div>
                    <button @click="reportDamage"
                        class="px-3 py-1.5 rounded-lg text-xs font-bold border-2 border-red-400 text-red-400 active:scale-95">
                        Flag Item
                    </button>
                </div>
                <p class="text-xs mt-1" :class="isDark ? 'text-gray-400' : 'text-gray-600'">
                    Report any damaged items found during unloading
                </p>
            </div>
        </div>

        <!-- Footer -->
        <div class="screen-footer border-t px-5 pt-4 pb-4"
            :class="isDark ? 'border-white/5 bg-background-dark' : 'border-gray-100 bg-background-light'">
            <div v-if="!canProceed" class="mb-3 px-3 py-2 rounded-xl text-xs text-center font-semibold"
                :class="isDark ? 'bg-red-500/10 text-red-400' : 'bg-red-50 text-red-600 border border-red-200'">
                Mark all {{ totalItems - unloadedCount }} remaining items as unloaded
            </div>
            <button @click="confirmUnloading" :disabled="!canProceed"
                class="w-full rounded-2xl h-14 flex items-center justify-center gap-3 relative overflow-hidden active:scale-[0.98] transition-all"
                :class="canProceed ? 'shadow-glow cursor-pointer' : 'opacity-40 cursor-not-allowed'">
                <div class="absolute inset-0"
                    :class="canProceed ? 'bg-gradient-to-r from-purple-600 to-purple-500' : (isDark ? 'bg-gray-700' : 'bg-gray-200')">
                </div>
                <span class="relative material-icons text-2xl text-white">fact_check</span>
                <span class="relative text-lg font-black uppercase tracking-wide text-white">Final Walkthrough</span>
            </button>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useJobStore } from '../stores/jobStore.js'
import { useUiStore } from '../stores/uiStore.js'
import { useFlowRouter } from '../composables/useFlowRouter.js'

const router = useRouter()
const jobStore = useJobStore()
const uiStore = useUiStore()
const { advanceAndNavigate } = useFlowRouter()
const isDark = computed(() => uiStore.theme !== 'light')

const inventory = computed(() => jobStore.jobData?.inventory || [])

const inventoryByCategory = computed(() => {
    const grouped = {}
    inventory.value.forEach(item => {
        if (!grouped[item.category]) grouped[item.category] = { name: item.category, items: [] }
        grouped[item.category].items.push(item)
    })
    return Object.values(grouped)
})

const totalItems = computed(() => inventory.value.length)
const unloadedCount = computed(() => inventory.value.filter(i => i.unloaded).length)
const unloadProgress = computed(() => totalItems.value > 0 ? Math.round((unloadedCount.value / totalItems.value) * 100) : 0)
const canProceed = computed(() => unloadedCount.value === totalItems.value)

function toggleItemUnloaded(item) {
    item.unloaded = !item.unloaded
    if (item.unloaded) uiStore.showToast(`✓ ${item.item} unloaded`, 'success', 1200)
}

function reportDamage() {
    router.push('/damage-report')
}

function confirmUnloading() {
    if (!canProceed.value) return
    uiStore.showToast('All items unloaded! Final walkthrough...', 'success', 2000)
    setTimeout(() => {
        advanceAndNavigate('FINAL_CHECKLIST', { unloadingCompletedAt: new Date().toISOString() })
    }, 500)
}
</script>
