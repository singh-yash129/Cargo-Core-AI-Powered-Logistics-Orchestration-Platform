<template>
    <div class="min-h-screen pb-8 overflow-y-auto no-scrollbar"
        :class="isDark ? 'bg-background-dark text-white' : 'bg-background-light text-gray-900'">
        <div class="px-5 pt-6 flex flex-col gap-5">

            <!-- Header -->
            <header>
                <div class="flex items-center justify-between mb-3">
                    <button @click="$router.back()"
                        class="w-10 h-10 rounded-full flex items-center justify-center border transition-colors"
                        :class="isDark ? 'bg-surface-dark border-white/5 text-gray-400 hover:text-white' : 'bg-white border-gray-200 text-gray-500 shadow-sm'">
                        <span class="material-icons text-xl">arrow_back</span>
                    </button>
                    <div class="flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider"
                        :class="isDark ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-primary/10 border-primary/30 text-primary'">
                        Step 3 of 4
                    </div>
                </div>
                <h1 class="text-3xl font-black tracking-tight">Vehicle Inspection</h1>
                <p class="text-sm mt-1.5" :class="isDark ? 'text-gray-400' : 'text-gray-500'">
                    CC-TRK-042 · Complete all items before departure
                </p>
            </header>

            <!-- Progress -->
            <div class="rounded-2xl p-4 border"
                :class="isDark ? 'bg-surface-dark/30 border-white/5' : 'bg-white border-gray-100 shadow-sm'">
                <div class="flex justify-between items-center mb-2">
                    <span class="text-xs font-bold uppercase tracking-wider"
                        :class="isDark ? 'text-gray-400' : 'text-gray-500'">Inspection Progress</span>
                    <span class="text-sm font-bold text-primary">{{ completedCount }} / {{ items.length }}</span>
                </div>
                <div class="w-full rounded-full h-2" :class="isDark ? 'bg-gray-800' : 'bg-gray-100'">
                    <div class="h-2 rounded-full bg-primary transition-all duration-500" :style="`width: ${progress}%`">
                    </div>
                </div>
            </div>

            <!-- Checklist -->
            <div class="space-y-3">
                <div v-for="item in items" :key="item.id" @click="toggleItem(item.id)"
                    class="flex items-center gap-4 p-4 rounded-2xl border cursor-pointer transition-all active:scale-[0.98]"
                    :class="item.checked
                        ? isDark ? 'bg-primary/10 border-primary/30' : 'bg-primary/10 border-primary/30'
                        : isDark ? 'bg-surface-dark/30 border-white/5 hover:border-white/10' : 'bg-white border-gray-100 shadow-sm hover:border-gray-200'">

                    <!-- Icon -->
                    <div class="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                        :class="item.checked ? 'bg-primary/20' : isDark ? 'bg-white/5' : 'bg-gray-50'">
                        <span class="material-icons"
                            :class="item.checked ? 'text-primary' : isDark ? 'text-gray-400' : 'text-gray-500'">{{
                            item.icon }}</span>
                    </div>

                    <!-- Text -->
                    <div class="flex-1 min-w-0">
                        <p class="font-semibold text-sm" :class="item.checked ? 'text-primary' : ''">{{ item.label }}
                        </p>
                        <p class="text-xs font-mono mt-0.5" :class="isDark ? 'text-gray-500' : 'text-gray-400'">
                            {{ item.value || 'Tap to confirm' }}
                        </p>
                    </div>

                    <!-- Checkbox -->
                    <div class="w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all"
                        :class="item.checked ? 'bg-primary border-primary' : isDark ? 'border-gray-600' : 'border-gray-300'">
                        <span v-if="item.checked" class="material-icons text-background-dark text-sm">check</span>
                    </div>
                </div>
            </div>

            <!-- Safety Note -->
            <div class="rounded-xl p-4 border flex items-start gap-3"
                :class="isDark ? 'bg-signal-amber/10 border-signal-amber/20' : 'bg-amber-50 border-amber-200'">
                <span class="material-icons text-signal-amber">shield</span>
                <div>
                    <p class="text-sm font-bold text-signal-amber">Safety First</p>
                    <p class="text-xs mt-0.5" :class="isDark ? 'text-gray-400' : 'text-gray-600'">
                        Fuel, tire data &amp; odometer are sent to the fraud detection system and maintenance tracker.
                    </p>
                </div>
            </div>

            <!-- CTA -->
            <button @click="handleComplete" :disabled="completedCount < items.length"
                class="w-full rounded-2xl h-16 flex items-center justify-center gap-3 font-black text-lg transition-all active:scale-[0.98]"
                :class="completedCount === items.length
                    ? 'bg-primary text-background-dark shadow-glow'
                    : isDark ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-gray-100 text-gray-400 cursor-not-allowed'">
                <span class="material-icons">{{ completedCount === items.length ? 'check_circle' : 'lock' }}</span>
                <span>{{ completedCount === items.length ? 'Complete Inspection' : `${items.length - completedCount}
                    items remaining` }}</span>
            </button>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUiStore } from '../stores/uiStore.js'
import { dummyInspection } from '../utils/dummyData.js'

const router = useRouter()
const uiStore = useUiStore()
const isDark = computed(() => uiStore.theme !== 'light')

const items = ref(dummyInspection.map(i => ({ ...i })))
const completedCount = computed(() => items.value.filter(i => i.checked).length)
const progress = computed(() => Math.round((completedCount.value / items.value.length) * 100))

function toggleItem(id) {
    const item = items.value.find(i => i.id === id)
    if (item) item.checked = !item.checked
}

function handleComplete() {
    router.push('/load-verify')
}
</script>
