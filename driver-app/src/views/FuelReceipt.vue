<template>
    <div class="min-h-screen pb-safe overflow-y-auto no-scrollbar"
        :class="isDark ? 'bg-background-dark text-white' : 'bg-background-light text-gray-900'">
        <div class="px-5 pt-5 pb-10 flex flex-col gap-5">
            <div class="flex items-center gap-3">
                <button @click="$router.back()" class="w-10 h-10 rounded-full flex items-center justify-center border"
                    :class="isDark ? 'bg-surface-dark border-white/5 text-gray-400' : 'bg-white border-gray-200 shadow-sm'">
                    <span class="material-icons text-xl">arrow_back</span>
                </button>
                <h1 class="text-2xl font-black tracking-tight">Fuel Receipt</h1>
            </div>

            <div class="rounded-2xl p-5 border space-y-4"
                :class="isDark ? 'bg-surface-dark/40 border-white/8' : 'bg-white border-gray-100 shadow-sm'">
                <div>
                    <label class="block text-xs font-bold uppercase tracking-wider mb-2"
                        :class="isDark ? 'text-gray-400' : 'text-gray-500'">Amount (₹)</label>
                    <div class="glass-input rounded-xl flex items-center px-4 py-3 gap-2">
                        <span class="text-primary font-bold">₹</span>
                        <input v-model="amount" type="number" placeholder="0"
                            class="flex-1 bg-transparent border-none outline-none text-xl font-black"
                            :class="isDark ? 'text-white' : 'text-gray-900'" />
                    </div>
                </div>
                <div>
                    <label class="block text-xs font-bold uppercase tracking-wider mb-2"
                        :class="isDark ? 'text-gray-400' : 'text-gray-500'">Liters</label>
                    <div class="glass-input rounded-xl flex items-center px-4 py-3 gap-2">
                        <span class="material-icons text-primary text-sm">local_gas_station</span>
                        <input v-model="liters" type="number" placeholder="0.0"
                            class="flex-1 bg-transparent border-none outline-none text-xl font-black"
                            :class="isDark ? 'text-white' : 'text-gray-900'" />
                    </div>
                </div>
                <div>
                    <label class="block text-xs font-bold uppercase tracking-wider mb-2"
                        :class="isDark ? 'text-gray-400' : 'text-gray-500'">Station Name</label>
                    <div class="glass-input rounded-xl flex items-center px-4 py-3 gap-2">
                        <input v-model="station" type="text" placeholder="e.g. HP Petrol Pump, Andheri"
                            class="flex-1 bg-transparent border-none outline-none text-sm"
                            :class="isDark ? 'text-white placeholder-gray-600' : 'text-gray-900 placeholder-gray-400'" />
                    </div>
                </div>

                <!-- Photo upload -->
                <button @click="hasPhoto = true"
                    class="w-full rounded-xl border-2 border-dashed h-24 flex flex-col items-center justify-center gap-2 transition-all"
                    :class="hasPhoto
                        ? isDark ? 'border-primary/40 bg-primary/8 text-primary' : 'border-primary/30 bg-primary/5 text-primary'
                        : isDark ? 'border-gray-700 text-gray-500 hover:border-primary/30 hover:text-primary' : 'border-gray-300 text-gray-400 hover:border-primary hover:text-primary'">
                    <span class="material-icons text-2xl">{{ hasPhoto ? 'check_circle' : 'add_a_photo' }}</span>
                    <span class="text-xs font-semibold">{{ hasPhoto ? 'Receipt photo captured' : 'Tap to capture
                        receipt' }}</span>
                </button>
            </div>

            <button @click="submit" :disabled="!amount || !liters"
                class="w-full rounded-2xl h-14 flex items-center justify-center gap-2 font-bold text-lg active:scale-[0.98] transition-all"
                :class="amount && liters ? 'bg-primary text-background-dark shadow-glow' : isDark ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-gray-100 text-gray-400 cursor-not-allowed'">
                <span class="material-icons">receipt</span>
                Submit Receipt
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

const amount = ref('')
const liters = ref('')
const station = ref('')
const hasPhoto = ref(false)

function submit() {
    uiStore.showToast('Fuel receipt uploaded ✓', 'success')
    router.back()
}
</script>
