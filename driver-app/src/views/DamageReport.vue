<template>
    <div class="screen-layout" :class="isDark ? 'bg-background-dark text-white' : 'bg-background-light text-gray-900'">

        <!-- ── HEADER ───────────────────────────────── -->
        <header class="flex-shrink-0 px-5 pt-5 pb-4 border-b" :class="isDark ? 'border-white/5' : 'border-gray-100'">
            <div class="flex items-center gap-3">
                <button @click="$router.back()" class="w-10 h-10 rounded-full flex items-center justify-center border"
                    :class="isDark ? 'bg-surface-dark border-white/5 text-gray-400' : 'bg-white border-gray-200 shadow-sm'">
                    <span class="material-icons text-xl">arrow_back</span>
                </button>
                <h1 class="text-2xl font-black tracking-tight">Damage Report</h1>
            </div>
        </header>

        <!-- ── SCROLLABLE BODY ───────────────────────── -->
        <div class="screen-body px-5 py-4 flex flex-col gap-4">

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
                                : isDark ? 'border-white/5 bg-surface-dark/30 text-gray-400 hover:border-white/10' : 'border-gray-100 bg-gray-50 text-gray-600 hover:border-gray-200'">
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

                <!-- Photos -->
                <div>
                    <label class="block text-xs font-bold uppercase tracking-wider mb-2"
                        :class="isDark ? 'text-gray-400' : 'text-gray-500'">Evidence Photos</label>
                    <div class="grid grid-cols-3 gap-2">
                        <div v-for="(photo, idx) in photos" :key="idx"
                            class="aspect-square rounded-xl overflow-hidden relative border"
                            :class="isDark ? 'border-white/5' : 'border-gray-100'">
                            <img :src="`data:image/jpeg;base64,${photo}`" alt="Damage"
                                class="w-full h-full object-cover" />
                            <button @click="photos.splice(idx, 1)"
                                class="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center">
                                <span class="material-icons text-xs">close</span>
                            </button>
                        </div>
                        <button @click="captureDamagePhoto" :disabled="isCapturing"
                            class="aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1"
                            :class="isDark ? 'border-gray-600 text-gray-400 hover:border-red-400 hover:text-red-400' : 'border-gray-300 text-gray-400 hover:border-red-400 hover:text-red-400'">
                            <span v-if="isCapturing" class="material-icons text-xl animate-spin">hourglass_empty</span>
                            <span v-else class="material-icons text-xl">add_a_photo</span>
                            <span class="text-[10px] font-semibold">{{ isCapturing ? 'Opening...' : 'Add' }}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- ── STICKY FOOTER ────────────────────────── -->
        <div class="screen-footer px-5 py-4 border-t"
            :class="isDark ? 'border-white/5 bg-background-dark' : 'border-gray-100 bg-background-light'">
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
import { useCamera } from '../composables/useCamera.js'

const router = useRouter()
const uiStore = useUiStore()
const isDark = computed(() => uiStore.theme !== 'light')
const { scanDocument, isCapturing } = useCamera()

const selectedType = ref('')
const description = ref('')
const photos = ref([])
const damageTypes = ['Vehicle', 'Cargo', 'Customer Property', 'Infrastructure']

async function captureDamagePhoto() {
    const result = await scanDocument('Capture Damage Photo')
    if (result) {
        photos.value.push(result.base64)
        uiStore.showToast('Damage photo captured ✓', 'success', 1200)
    }
}

function submit() {
    uiStore.showToast('Damage report submitted ✓', 'warning')
    router.back()
}
</script>
