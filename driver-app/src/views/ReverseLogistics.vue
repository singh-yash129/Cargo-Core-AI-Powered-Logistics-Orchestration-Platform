<template>
    <div class="min-h-screen pb-safe overflow-y-auto no-scrollbar"
        :class="isDark ? 'bg-background-dark text-white' : 'bg-background-light text-gray-900'">
        <div class="px-5 pt-5 pb-10 flex flex-col gap-5">
            <div class="flex items-center gap-3">
                <button @click="$router.back()" class="w-10 h-10 rounded-full flex items-center justify-center border"
                    :class="isDark ? 'bg-surface-dark border-white/5 text-gray-400' : 'bg-white border-gray-200 shadow-sm'">
                    <span class="material-icons text-xl">arrow_back</span>
                </button>
                <h1 class="text-2xl font-black tracking-tight">Reverse Logistics</h1>
            </div>

            <div class="rounded-2xl p-5 border"
                :class="isDark ? 'bg-surface-dark/40 border-orange-500/20' : 'bg-orange-50 border-orange-200'">
                <div class="flex items-start gap-3">
                    <span class="material-icons text-orange-400 text-3xl">outbox</span>
                    <div>
                        <p class="font-black text-orange-400">Return Pickup · Stop #4</p>
                        <p class="text-sm mt-1" :class="isDark ? 'text-gray-400' : 'text-gray-600'">Amazon Returns Hub ·
                            Gate 3, Bhiwandi</p>
                    </div>
                </div>
            </div>

            <div class="space-y-3">
                <div v-for="item in returnItems" :key="item.id" @click="item.collected = !item.collected"
                    class="flex items-center gap-3 p-4 rounded-2xl border cursor-pointer transition-all active:scale-[0.98]"
                    :class="item.collected
                        ? isDark ? 'bg-primary/8 border-primary/20' : 'bg-primary/8 border-primary/30'
                        : isDark ? 'bg-surface-dark/30 border-white/5' : 'bg-white border-gray-100 shadow-sm'">
                    <span class="material-icons"
                        :class="item.collected ? 'text-primary' : isDark ? 'text-gray-400' : 'text-gray-500'">inventory_2</span>
                    <div class="flex-1">
                        <p class="text-sm font-semibold">{{ item.id }}</p>
                        <p class="text-xs" :class="isDark ? 'text-gray-500' : 'text-gray-400'">{{ item.reason }}</p>
                    </div>
                    <span class="material-icons text-xl"
                        :class="item.collected ? 'text-primary' : isDark ? 'text-gray-700' : 'text-gray-300'">{{
                            item.collected ? 'check_circle' : 'radio_button_unchecked' }}</span>
                </div>
            </div>

            <button @click="$router.back()"
                class="w-full rounded-2xl h-14 flex items-center justify-center gap-2 font-bold text-background-dark shadow-glow active:scale-[0.98]"
                style="background: linear-gradient(135deg, #1CE783, #15b86a);">
                <span class="material-icons">done_all</span>
                Confirm Pickups
            </button>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useUiStore } from '../stores/uiStore.js'

const uiStore = useUiStore()
const isDark = computed(() => uiStore.theme !== 'light')

const returnItems = ref([
    { id: 'RTN-001-A', reason: 'Defective product — customer return', collected: false },
    { id: 'RTN-001-B', reason: 'Wrong item delivered', collected: false },
])
</script>
