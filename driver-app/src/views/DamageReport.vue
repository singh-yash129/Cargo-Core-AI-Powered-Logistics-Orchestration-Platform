<template>
    <div class="min-h-screen pb-safe overflow-y-auto no-scrollbar"
        :class="isDark ? 'bg-background-dark text-white' : 'bg-background-light text-gray-900'">
        <div class="px-5 pt-5 pb-10 flex flex-col gap-5">
            <div class="flex items-center gap-3">
                <button @click="$router.back()" class="w-10 h-10 rounded-full flex items-center justify-center border"
                    :class="isDark ? 'bg-surface-dark border-white/5 text-gray-400' : 'bg-white border-gray-200 shadow-sm'">
                    <span class="material-icons text-xl">arrow_back</span>
                </button>
                <h1 class="text-2xl font-black tracking-tight">Damage Report</h1>
            </div>

            <div class="rounded-2xl p-5 border space-y-4"
                :class="isDark ? 'bg-surface-dark/40 border-white/8' : 'bg-white border-gray-100 shadow-sm'">
                <div>
                    <label class="block text-xs font-bold uppercase tracking-wider mb-2"
                        :class="isDark ? 'text-gray-400' : 'text-gray-500'">Damage Type</label>
                    <div class="grid grid-cols-2 gap-2">
                        <button v-for="type in damageTypes" :key="type" @click="selectedType = type"
                            class="py-2.5 rounded-xl border text-sm font-semibold transition-all active:scale-[0.97]"
                            :class="selectedType === type
                                ? 'border-red-400/50 bg-red-500/10 text-red-400'
                                : isDark ? 'border-white/5 bg-surface-dark/30 text-gray-400 hover:border-white/10' : 'border-gray-100 bg-gray-50 text-gray-600'">
                            {{ type }}
                        </button>
                    </div>
                </div>
                <div>
                    <label class="block text-xs font-bold uppercase tracking-wider mb-2"
                        :class="isDark ? 'text-gray-400' : 'text-gray-500'">Description</label>
                    <textarea v-model="description" rows="3" placeholder="Describe the damage in detail..."
                        class="w-full glass-input rounded-xl px-4 py-3 text-sm outline-none resize-none"
                        :class="isDark ? 'text-white placeholder-gray-600' : 'text-gray-900 placeholder-gray-400'"></textarea>
                </div>
                <!-- Photo -->
                <button @click="hasPhoto = true"
                    class="w-full rounded-xl border-2 border-dashed h-24 flex flex-col items-center justify-center gap-2 transition-all"
                    :class="hasPhoto ? 'border-primary/40 bg-primary/5 text-primary' : isDark ? 'border-gray-700 text-gray-500' : 'border-gray-300 text-gray-400'">
                    <span class="material-icons text-2xl">{{ hasPhoto ? 'check_circle' : 'add_a_photo' }}</span>
                    <span class="text-xs font-semibold">{{ hasPhoto ? 'Photo captured' : 'Add damage photo' }}</span>
                </button>
            </div>

            <button @click="submit" :disabled="!selectedType || !description"
                class="w-full rounded-2xl h-14 flex items-center justify-center gap-2 font-bold text-lg active:scale-[0.98] transition-all"
                :class="selectedType && description
                    ? 'bg-red-500 text-white shadow-glow-red'
                    : isDark ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-gray-100 text-gray-400 cursor-not-allowed'">
                <span class="material-icons">send</span>
                Submit Report
            </button>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUiStore } from '../stores/uiStore.js'

const router = useRouter()
const uiStore = useUiStore()
const isDark = computed(() => uiStore.theme !== 'light')

const selectedType = ref('')
const description = ref('')
const hasPhoto = ref(false)
const damageTypes = ['Vehicle', 'Cargo', 'Customer Property', 'Infrastructure']

function submit() {
    uiStore.showToast('Damage report filed ✓', 'error', 3000)
    router.back()
}
</script>
