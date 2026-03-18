<template>
    <div class="space-y-6">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span class="material-symbols-outlined text-purple-500">support_agent</span>
            AI Support Chat
        </h2>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Chat Area -->
            <div class="lg:col-span-2 glass-panel rounded-xl flex flex-col" style="height: min(70vh, 600px);">
                <!-- Chat Header -->
                <div class="p-4 border-b border-gray-200 dark:border-white/5 flex items-center gap-3">
                    <div
                        class="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                        <span class="material-symbols-outlined text-white">smart_toy</span>
                    </div>
                    <div>
                        <div class="font-bold text-gray-900 dark:text-white text-sm">Cargo-Core AI</div>
                        <div class="flex items-center gap-1 text-xs text-green-500"><span
                                class="w-1.5 h-1.5 rounded-full bg-green-500"></span> Online · Multi-language</div>
                    </div>
                </div>

                <!-- Messages -->
                <div class="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
                    <div v-for="msg in messages" :key="msg.id"
                        :class="msg.sender === 'user' ? 'flex justify-end' : 'flex justify-start'">
                        <div class="max-w-[80%] sm:max-w-[70%] p-3 rounded-xl text-sm" :class="msg.sender === 'user'
                            ? 'bg-green-600 text-white rounded-br-sm'
                            : 'bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white rounded-bl-sm'">
                            <p>{{ msg.text }}</p>
                            <div class="text-[10px] mt-1"
                                :class="msg.sender === 'user' ? 'text-green-200' : 'text-gray-400'">{{ msg.time }}</div>
                        </div>
                    </div>
                    <div v-if="typing" class="flex justify-start">
                        <div class="bg-gray-100 dark:bg-white/10 px-4 py-2 rounded-xl text-gray-400 text-sm">
                            <span class="animate-pulse">● ● ●</span>
                        </div>
                    </div>
                </div>

                <!-- Input -->
                <div class="p-4 border-t border-gray-200 dark:border-white/5">
                    <div class="flex gap-2">
                        <input v-model="newMessage" @keyup.enter="sendMessage" type="text"
                            placeholder="Type your message..."
                            class="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500/50 focus:border-green-500 outline-none text-sm" />
                        <button @click="sendMessage"
                            class="px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1">
                            <span class="material-symbols-outlined text-sm">send</span>
                        </button>
                    </div>
                </div>
            </div>

            <!-- Quick Actions -->
            <div class="space-y-4">
                <div class="glass-panel p-4 sm:p-5 rounded-xl">
                    <h3 class="font-bold text-gray-900 dark:text-white mb-3 text-sm">Quick Actions</h3>
                    <div class="space-y-2">
                        <button v-for="action in quickActions" :key="action.label"
                            @click="sendQuickAction(action.message)"
                            class="w-full text-left p-3 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/5 hover:border-green-500/50 hover:bg-gray-100 dark:hover:bg-white/10 transition-all flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                            <span class="material-symbols-outlined text-lg" :class="action.color">{{ action.icon
                                }}</span>
                            {{ action.label }}
                        </button>
                    </div>
                </div>

                <div class="glass-panel p-4 sm:p-5 rounded-xl">
                    <h3 class="font-bold text-gray-900 dark:text-white mb-3 text-sm">Service Modifications</h3>
                    <p class="text-xs text-gray-500 dark:text-gray-400 mb-3">Ask the bot to modify your active orders:
                    </p>
                    <div class="space-y-2">
                        <button v-for="mod in serviceMods" :key="mod.label" @click="sendQuickAction(mod.message)"
                            class="w-full text-left p-3 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/5 hover:border-blue-500/50 hover:bg-gray-100 dark:hover:bg-white/10 transition-all flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                            <span class="material-symbols-outlined text-lg" :class="mod.color">{{ mod.icon }}</span>
                            {{ mod.label }}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'

const newMessage = ref('')
const typing = ref(false)
let msgId = 3
const sessionId = ref(typeof window !== 'undefined' ? localStorage.getItem('customer_support_session_id') : null)

const messages = ref([
    { id: 1, sender: 'bot', text: '👋 Hello! I\'m the Cargo-Core AI assistant. I can help with your moves, update delivery status, reschedule orders, or answer any questions. How can I help you?', time: '10:30 AM' },
    { id: 2, sender: 'bot', text: 'I support multiple languages — feel free to chat in Hindi, English, or any preferred language! 🌐', time: '10:30 AM' },
])

async function sendMessage() {
    if (!newMessage.value.trim()) return
    messages.value.push({ id: ++msgId, sender: 'user', text: newMessage.value, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) })
    const msg = newMessage.value
    newMessage.value = ''
    typing.value = true
    try {
        const token = localStorage.getItem('auth_token')
        const response = await fetch('http://localhost:8000/api/v1/ai/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({
                message: msg,
                session_id: sessionId.value || undefined,
            }),
        })

        const data = await response.json().catch(() => ({}))
        typing.value = false
        if (response.ok) {
            sessionId.value = data.session_id || sessionId.value
            if (typeof window !== 'undefined' && sessionId.value) {
                localStorage.setItem('customer_support_session_id', sessionId.value)
            }
            messages.value.push({ id: ++msgId, sender: 'bot', text: data.message || 'Support response received.', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) })
        } else {
            messages.value.push({ id: ++msgId, sender: 'bot', text: data.detail || 'Support is temporarily unavailable. Please try again.', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) })
        }
    } catch (error) {
        typing.value = false
        messages.value.push({ id: ++msgId, sender: 'bot', text: 'Support is temporarily unavailable. Please try again.', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) })
    }
}

function sendQuickAction(msg) {
    newMessage.value = msg
    sendMessage()
}

const quickActions = [
    { label: 'Track my crew', icon: 'gps_fixed', color: 'text-green-500', message: 'Where is my crew right now?' },
    { label: 'Check ETA', icon: 'schedule', color: 'text-blue-500', message: 'What\'s the ETA for my active move?' },
    { label: 'Download receipt', icon: 'receipt', color: 'text-purple-500', message: 'Can I get a receipt for my last order?' },
]

const serviceMods = [
    { label: 'Change Address', icon: 'edit_location', color: 'text-amber-500', message: 'I need to correct my delivery address.' },
    { label: 'Reschedule Move', icon: 'event', color: 'text-blue-500', message: 'I want to reschedule my pending move.' },
    { label: 'Add Extra Helper', icon: 'person_add', color: 'text-green-500', message: 'I need to add 1 more helper to my move.' },
]
</script>
