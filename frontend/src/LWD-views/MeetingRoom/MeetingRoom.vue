<template>
    <div class="h-full flex flex-col bg-surface-light dark:bg-background-dark p-6">
        <!-- Header -->
        <div class="mb-6 flex justify-between items-center">
            <div>
                <h1 class="text-2xl font-bold text-gray-900 dark:text-white">{{ meetingTitle || 'Live Meeting' }}</h1>
                <p class="text-sm text-gray-500 dark:text-gray-400">Connected to secure meeting room</p>
            </div>
            <button @click="$router.back()" 
                class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2">
                <span class="material-symbols-outlined">call_end</span>
                Leave Meeting
            </button>
        </div>

        <!-- Meeting Container -->
        <div class="flex-1 bg-black rounded-2xl overflow-hidden shadow-2xl relative border border-gray-200 dark:border-white/10">
            <div v-if="loading" class="absolute inset-0 flex items-center justify-center text-white">
                <div class="flex flex-col items-center gap-2">
                    <span class="material-symbols-outlined animate-spin text-4xl">sync</span>
                    <span>Connecting...</span>
                </div>
            </div>
            
            <div v-if="meetingUrl" class="flex flex-col items-center justify-center w-full h-full bg-gray-900 text-white p-8 text-center">
                <div class="mb-6 rounded-full bg-primary/20 p-6 animate-pulse">
                    <span class="material-symbols-outlined text-6xl text-primary">videocam</span>
                </div>
                
                <h2 class="text-3xl font-bold mb-2">Ready to Join?</h2>
                <p class="text-gray-400 max-w-md mb-8">
                    This meeting is hosted on an external platform. 
                    Click the button below to open the secure meeting room in a new window.
                </p>

                <a :href="meetingUrl" target="_blank" rel="noopener noreferrer"
                   class="px-8 py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl transition-all transform hover:scale-105 shadow-lg flex items-center gap-2">
                    <span>Launch Meeting</span>
                    <span class="material-symbols-outlined">open_in_new</span>
                </a>
                
                <div class="mt-8 text-sm text-gray-500">
                    <p>Meeting Link:</p>
                    <code class="bg-black/30 px-2 py-1 rounded mt-1 block">{{ meetingUrl }}</code>
                </div>
            </div>
            
            <div v-else class="flex items-center justify-center h-full text-white">
                <div class="text-center">
                    <span class="material-symbols-outlined text-6xl text-gray-600 mb-4">link_off</span>
                    <h3 class="text-xl font-bold">No Meeting Link Provided</h3>
                    <p class="text-gray-500">Please verify the meeting URL.</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const meetingUrl = ref('')
const meetingTitle = ref('')
const loading = ref(false)

onMounted(() => {
    // Expecting query params: ?url=...&title=...
    if (route.query.url) {
        meetingUrl.value = route.query.url
        meetingTitle.value = route.query.title || 'Meeting'
    }
})
</script>
