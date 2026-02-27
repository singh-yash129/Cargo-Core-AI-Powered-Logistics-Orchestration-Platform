<template>
    <div class="fixed inset-0 flex flex-col bg-surface-light dark:bg-background-dark p-6 z-[100]">
        <!-- Header -->
        <div class="mb-4 flex justify-between items-center">
            <div>
                <h1 class="text-2xl font-bold text-gray-900 dark:text-white">{{ meetingTitle || 'Live Meeting' }}</h1>
                <p class="text-sm text-gray-500 dark:text-gray-400">Connected to secure meeting room</p>
            </div>
            <button @click="showLeaveModal = true"
                class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2">
                <span class="material-symbols-outlined">call_end</span>
                Leave Room
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

        <!-- Leave Room Confirmation Modal -->
        <Teleport to="body">
            <div v-if="showLeaveModal"
                class="fixed inset-0 bg-black/70 backdrop-blur-sm z-[200] flex items-center justify-center p-4"
                @click.self="showLeaveModal = false">
                <div
                    class="bg-white dark:bg-gray-900 shadow-2xl rounded-2xl w-full max-w-sm border border-gray-200 dark:border-white/10 overflow-hidden">
                    <div class="p-6 text-center">
                        <div
                            class="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
                            <span class="material-symbols-outlined text-4xl text-red-500">meeting_room</span>
                        </div>
                        <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-2">Leave this Room?</h3>
                        <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">Before leaving, make sure you have
                            exited the meeting. You will be redirected back to your dashboard.</p>

                        <!-- Verification Checkbox -->
                        <label
                            class="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors mb-6"
                            :class="hasExitedMeeting ? 'bg-green-500/10 border border-green-500/20' : 'bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10'"
                            @click="hasExitedMeeting = !hasExitedMeeting">
                            <span class="material-symbols-outlined text-[20px]"
                                :class="hasExitedMeeting ? 'text-green-500' : 'text-gray-400'">
                                {{ hasExitedMeeting ? 'check_circle' : 'radio_button_unchecked' }}
                            </span>
                            <span class="text-sm font-medium"
                                :class="hasExitedMeeting ? 'text-green-700 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'">
                                I confirm I have exited the meeting
                            </span>
                        </label>

                        <div class="flex gap-3">
                            <button @click="showLeaveModal = false; hasExitedMeeting = false"
                                class="flex-1 py-3 rounded-lg text-sm font-bold bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 transition-colors">
                                Stay in Room
                            </button>
                            <button @click="leaveRoom" :disabled="!hasExitedMeeting"
                                class="flex-1 py-3 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2"
                                :class="hasExitedMeeting ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'">
                                <span class="material-symbols-outlined text-[18px]">logout</span>
                                Leave Room
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Teleport>
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
const showLeaveModal = ref(false)
const hasExitedMeeting = ref(false)

function leaveRoom() {
    showLeaveModal.value = false
    hasExitedMeeting.value = false
    router.back()
}

onMounted(() => {
    // Expecting query params: ?url=...&title=...
    if (route.query.url) {
        meetingUrl.value = route.query.url
        meetingTitle.value = route.query.title || 'Meeting'
    }
})
</script>
