<template>
    <div class="min-h-screen pb-safe overflow-y-auto no-scrollbar"
        :class="isDark ? 'bg-background-dark text-white' : 'bg-background-light text-gray-900'">
        <div class="px-5 pt-5 pb-10 flex flex-col gap-5">
            <div class="flex items-center gap-3">
                <button @click="$router.back()" class="w-10 h-10 rounded-full flex items-center justify-center border"
                    :class="isDark ? 'bg-surface-dark border-white/5 text-gray-400' : 'bg-white border-gray-200 shadow-sm'">
                    <span class="material-icons text-xl">arrow_back</span>
                </button>
                <h1 class="text-2xl font-black tracking-tight">Vehicle Return</h1>
            </div>

            <div class="rounded-2xl p-5 border space-y-4"
                :class="isDark ? 'bg-surface-dark/40 border-white/8' : 'bg-white border-gray-100 shadow-sm'">
                <div class="flex justify-between items-start">
                    <div>
                        <p class="text-xs uppercase tracking-widest"
                            :class="isDark ? 'text-gray-400' : 'text-gray-500'">Returning</p>
                        <p class="text-2xl font-black">CC-TRK-042</p>
                        <p class="text-sm font-mono" :class="isDark ? 'text-gray-500' : 'text-gray-400'">MH 04 AB 2049
                        </p>
                    </div>
                    <div class="text-right">
                        <p class="text-xs uppercase tracking-widest"
                            :class="isDark ? 'text-gray-400' : 'text-gray-500'">Fuel on return</p>
                        <div class="flex items-center gap-1 justify-end">
                            <span class="material-icons text-primary text-sm">local_gas_station</span>
                            <span class="text-xl font-black text-primary">{{ fuelLevel }}%</span>
                        </div>
                    </div>
                </div>

                <div>
                    <label class="block text-xs uppercase tracking-wider font-bold mb-2"
                        :class="isDark ? 'text-gray-400' : 'text-gray-500'">Fuel Level</label>
                    <input type="range" v-model="fuelLevel" min="10" max="100" class="w-full accent-primary" />
                    <div class="flex justify-between text-xs mt-1" :class="isDark ? 'text-gray-600' : 'text-gray-400'">
                        <span>10%</span>
                        <span>100%</span>
                    </div>
                </div>
                <div>
                    <label class="block text-xs uppercase tracking-wider font-bold mb-2"
                        :class="isDark ? 'text-gray-400' : 'text-gray-500'">Odometer (km)</label>
                    <div class="glass-input rounded-xl px-4 py-3">
                        <input v-model="odometer" type="number"
                            class="w-full bg-transparent outline-none font-black text-xl"
                            :class="isDark ? 'text-white' : 'text-gray-900'" />
                    </div>
                </div>
                <div>
                    <label class="block text-xs uppercase tracking-wider font-bold mb-2"
                        :class="isDark ? 'text-gray-400' : 'text-gray-500'">Return Notes (optional)</label>
                    <textarea v-model="notes" rows="2" placeholder="Any issues to report..."
                        class="w-full glass-input rounded-xl px-4 py-3 text-sm outline-none resize-none"
                        :class="isDark ? 'text-white placeholder-gray-600' : 'text-gray-900 placeholder-gray-400'"></textarea>
                </div>
            </div>

            <button @click="submit"
                class="w-full rounded-2xl h-14 flex items-center justify-center gap-2 font-bold text-background-dark shadow-glow active:scale-[0.98]"
                style="background: linear-gradient(135deg, #1CE783, #15b86a);">
                <span class="material-icons">done_all</span>
                Return Vehicle
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

const fuelLevel = ref(62)
const odometer = ref(48277)
const notes = ref('')

function submit() {
    uiStore.showToast('Vehicle returned successfully ✓', 'success')
    router.push('/shift-summary')
}
</script>
