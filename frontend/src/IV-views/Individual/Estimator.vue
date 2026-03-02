<template>
    <div class="space-y-6">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span class="material-symbols-outlined text-purple-500">psychology</span>
            AI Volume Estimator
        </h2>
        <p class="text-gray-500 dark:text-gray-400 text-sm -mt-4">Upload a photo of your room or luggage. Our AI will
            estimate everything you need.</p>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Upload Area -->
            <div class="glass-panel p-4 sm:p-6 rounded-xl">
                <h3 class="font-bold text-gray-900 dark:text-white mb-4">Upload Room Photo</h3>
                <div @click="triggerUpload" @dragover.prevent @drop.prevent="handleDrop"
                    class="border-2 border-dashed rounded-xl p-8 sm:p-12 flex flex-col items-center justify-center cursor-pointer transition-all"
                    :class="uploaded ? 'border-green-500 bg-green-500/5' : 'border-gray-300 dark:border-white/20 hover:border-purple-400 dark:hover:border-purple-500 hover:bg-gray-50 dark:hover:bg-white/5'">
                    <span class="material-symbols-outlined text-5xl mb-3"
                        :class="uploaded ? 'text-green-500' : 'text-gray-400 dark:text-gray-500'">
                        {{ uploaded ? 'check_circle' : 'cloud_upload' }}
                    </span>
                    <span class="text-sm font-bold text-gray-700 dark:text-gray-300" v-if="!uploaded">Click or drag to
                        upload photo</span>
                    <span class="text-sm font-bold text-green-600 dark:text-green-400" v-else>room_photo.jpg
                        uploaded!</span>
                    <span class="text-xs text-gray-400 mt-1">JPG, PNG up to 10MB</span>
                </div>
                <input type="file" ref="fileInput" accept="image/*" class="hidden" @change="handleFileSelect" />

                <button @click="analyzePhoto" :disabled="!uploaded || analyzing"
                    class="w-full mt-4 py-3 rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
                    :class="uploaded ? 'bg-purple-600 hover:bg-purple-700 text-white' : 'bg-gray-200 dark:bg-white/10 text-gray-400 cursor-not-allowed'">
                    <span v-if="analyzing"
                        class="material-symbols-outlined animate-spin text-lg">progress_activity</span>
                    <span class="material-symbols-outlined text-lg" v-else>auto_awesome</span>
                    {{ analyzing ? 'Analyzing...' : 'Analyze with AI' }}
                </button>
            </div>

            <!-- AI Results -->
            <div class="glass-panel p-4 sm:p-6 rounded-xl" :class="showResults ? 'border-purple-500/30' : ''">
                <h3 class="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <span class="material-symbols-outlined text-purple-400">auto_awesome</span>
                    AI Recommendation
                </h3>

                <div v-if="!showResults" class="text-center py-12 text-gray-400 dark:text-gray-500">
                    <span class="material-symbols-outlined text-4xl block mb-2">camera_enhance</span>
                    <p class="text-sm">Upload and analyze a photo to see recommendations.</p>
                </div>

                <div v-else class="space-y-4 animate-fade-in">
                    <div class="grid grid-cols-2 gap-3">
                        <div v-for="rec in aiResults" :key="rec.label"
                            class="p-3 bg-gray-50 dark:bg-white/5 rounded-lg border border-gray-200 dark:border-white/5 text-center">
                            <span class="material-symbols-outlined text-2xl" :class="rec.color">{{ rec.icon }}</span>
                            <div class="text-lg font-bold text-gray-900 dark:text-white mt-1">{{ rec.value }}</div>
                            <div class="text-xs text-gray-500 dark:text-gray-400">{{ rec.label }}</div>
                        </div>
                    </div>

                    <div class="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                        <div class="flex items-start gap-2">
                            <span
                                class="material-symbols-outlined text-purple-500 text-lg mt-0.5">tips_and_updates</span>
                            <div>
                                <div class="text-sm font-bold text-gray-900 dark:text-white">AI Suggestion</div>
                                <p class="text-xs text-gray-600 dark:text-gray-300 mt-0.5">Based on the room analysis,
                                    we recommend a mid-size van with 2 helpers. Packing service is strongly recommended
                                    for fragile items detected.</p>
                            </div>
                        </div>
                    </div>

                    <router-link to="/individual/book-move"
                        class="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2">
                        <span class="material-symbols-outlined">arrow_forward</span>
                        Apply to Booking
                    </router-link>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'

const fileInput = ref(null)
const uploaded = ref(false)
const analyzing = ref(false)
const showResults = ref(false)

const aiResults = ref([
    { label: 'Boxes Needed', value: '12', icon: 'inventory_2', color: 'text-blue-500' },
    { label: 'Helpers Needed', value: '2', icon: 'group', color: 'text-green-500' },
    { label: 'Bubble Wrap', value: '3 Rolls', icon: 'bubble_chart', color: 'text-amber-500' },
    { label: 'Blankets', value: '6', icon: 'bed', color: 'text-purple-500' },
])

function triggerUpload() { fileInput.value?.click() }
function handleFileSelect() { uploaded.value = true; showResults.value = false }
function handleDrop() { uploaded.value = true; showResults.value = false }

function analyzePhoto() {
    analyzing.value = true
    setTimeout(() => {
        analyzing.value = false
        showResults.value = true
    }, 2000)
}
</script>

<style scoped>
.animate-fade-in {
    animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(8px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>
