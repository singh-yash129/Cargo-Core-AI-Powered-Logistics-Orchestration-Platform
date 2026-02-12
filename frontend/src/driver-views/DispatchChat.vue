<template>
    <div class="bg-background-dark text-white h-screen flex flex-col font-display antialiased selection-custom pb-safe">
        <!-- Header -->
        <header
            class="px-4 py-3 bg-surface-dark border-b border-white/5 flex justify-between items-center z-10 shadow-sm">
            <div class="flex items-center gap-3">
                <button @click="$router.back()"
                    class="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10">
                    <span class="material-icons text-gray-400">arrow_back</span>
                </button>
                <div class="relative">
                    <div
                        class="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
                        <span class="material-icons text-primary">support_agent</span>
                    </div>
                    <span
                        class="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-background-dark"></span>
                </div>
                <div>
                    <h1 class="text-base font-bold text-white leading-tight">Dispatch Control</h1>
                    <p class="text-[10px] text-primary font-medium uppercase tracking-wider">Online • Typng...</p>
                </div>
            </div>
            <button class="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10">
                <span class="material-icons text-white text-sm">more_vert</span>
            </button>
        </header>

        <!-- Chat Area -->
        <main class="flex-1 overflow-y-auto p-4 space-y-6 bg-background-dark w-full" ref="chatContainer">

            <!-- Timestamp -->
            <div class="flex justify-center">
                <span class="bg-white/5 text-gray-500 text-[10px] font-bold px-2 py-1 rounded-full">TODAY 10:23
                    AM</span>
            </div>

            <!-- Messages -->
            <div v-for="msg in messages" :key="msg.id" class="flex w-full"
                :class="msg.isMe ? 'justify-end' : 'justify-start'">
                <div class="max-w-[75%] rounded-2xl p-3 relative group" :class="[
                    msg.isMe ? 'bg-primary text-black rounded-tr-sm' : 'bg-surface-dark border border-white/5 text-gray-200 rounded-tl-sm',
                    msg.isImage ? 'p-1' : ''
                ]">
                    <!-- Text Content -->
                    <p v-if="!msg.isImage" class="text-sm leading-relaxed whitespace-pre-wrap">{{ msg.text }}</p>

                    <!-- Image Content -->
                    <img v-else :src="msg.imageUrl" class="rounded-xl w-full h-auto mb-1" />

                    <!-- Metadata -->
                    <div class="flex items-center gap-1 justify-end mt-1 opacity-70">
                        <span class="text-[10px] font-medium">{{ msg.time }}</span>
                        <span v-if="msg.isMe" class="material-icons text-[10px]">{{ msg.read ? 'done_all' : 'done'
                            }}</span>
                    </div>
                </div>
            </div>

        </main>

        <!-- Input Area -->
        <footer class="p-3 bg-surface-dark border-t border-white/5 shrink-0 z-20">
            <div class="flex items-end gap-2 max-w-full">
                <button
                    class="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0 hover:bg-white/10 active:scale-95 transition-transform">
                    <span class="material-icons text-gray-400">add</span>
                </button>

                <div
                    class="flex-1 bg-background-dark rounded-2xl border border-white/10 flex items-center px-4 py-2 min-h-[44px]">
                    <input v-model="newMessage" @keyup.enter="sendMessage" type="text" placeholder="Type a message..."
                        class="bg-transparent border-none outline-none text-white text-sm w-full placeholder-gray-500" />
                </div>

                <button @click="sendMessage"
                    class="w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all active:scale-95 shadow-lg"
                    :class="newMessage.trim() ? 'bg-primary text-black' : 'bg-white/5 text-gray-500'"
                    :disabled="!newMessage.trim()">
                    <span class="material-icons">send</span>
                </button>
            </div>
        </footer>
    </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'

const chatContainer = ref(null)
const newMessage = ref('')

const messages = ref([
    { id: 1, text: "Hey Marcus, looks like traffic is heavy on I-80. We've updated your route for stop #5.", time: "10:24 AM", isMe: false, read: true },
    { id: 2, text: "Copy that. ETA still looking good for 12pm?", time: "10:25 AM", isMe: true, read: true },
    { id: 3, text: "Yes, you should be fine. Watch out for the construction near the exit.", time: "10:26 AM", isMe: false, read: true },
])

const scrollToBottom = () => {
    nextTick(() => {
        if (chatContainer.value) {
            chatContainer.value.scrollTop = chatContainer.value.scrollHeight
        }
    })
}

const sendMessage = () => {
    if (!newMessage.value.trim()) return

    // Add user message
    messages.value.push({
        id: Date.now(),
        text: newMessage.value,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isMe: true,
        read: false
    })

    const sentText = newMessage.value
    newMessage.value = ''
    scrollToBottom()

    // Simulate dispatcher reply
    setTimeout(() => {
        // Mark as read
        const lastMsg = messages.value[messages.value.length - 1]
        if (lastMsg.isMe) lastMsg.read = true

        // Typing indicator logic could replace header status

        setTimeout(() => {
            messages.value.push({
                id: Date.now(),
                text: "Received. Let us know if you need anything else.",
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                isMe: false,
                read: true
            })
            scrollToBottom()
        }, 1500)
    }, 1000)
}

onMounted(() => {
    scrollToBottom()
})
</script>

<style scoped>
.pb-safe {
    padding-bottom: env(safe-area-inset-bottom);
}
</style>
