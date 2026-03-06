<template>
    <div class="h-screen flex flex-col overflow-hidden"
        :class="isDark ? 'bg-background-dark text-white' : 'bg-background-light text-gray-900'">

        <!-- Header -->
        <header class="px-5 pt-5 pb-3 border-b flex items-center justify-between flex-shrink-0"
            :class="isDark ? 'border-white/5' : 'border-gray-100'">
            <div>
                <p class="text-xs font-bold uppercase tracking-wider text-primary mb-0.5">Dispatch Line</p>
                <h1 class="text-2xl font-black tracking-tight">Radio Chat</h1>
            </div>
            <div class="flex items-center gap-2">
                <div class="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                <span class="text-xs font-bold" :class="isDark ? 'text-gray-400' : 'text-gray-500'">Dispatcher
                    Online</span>
            </div>
        </header>

        <!-- Messages -->
        <div ref="messagesEl" class="flex-1 overflow-y-auto no-scrollbar px-5 py-4 space-y-4">
            <div v-for="msg in messages" :key="msg.id" class="flex" :class="msg.mine ? 'justify-end' : 'justify-start'">
                <div v-if="!msg.mine"
                    class="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center mr-2 border text-sm font-black"
                    :class="isDark ? 'bg-surface-dark border-white/5 text-primary' : 'bg-primary/10 border-primary/20 text-primary'">
                    D</div>
                <div class="max-w-[75%]">
                    <div class="px-4 py-3 rounded-2xl text-sm leading-relaxed"
                        :class="msg.mine
                            ? 'bg-primary text-background-dark rounded-br-sm font-medium'
                            : isDark ? 'bg-surface-dark border border-white/5 text-white rounded-bl-sm' : 'bg-white border border-gray-100 shadow-sm text-gray-800 rounded-bl-sm'">
                        {{ msg.text }}
                    </div>
                    <p class="text-[10px] mt-1 px-1" :class="msg.mine ? 'text-right' : ''"
                        style="color: rgba(255,255,255,0.3);">{{ msg.time }}</p>
                </div>
            </div>

            <!-- AI Suggestion Chips -->
            <div class="overflow-x-auto no-scrollbar py-1">
                <div class="flex gap-2 w-max">
                    <button v-for="chip in aiChips" :key="chip" @click="sendMessage(chip)"
                        class="text-xs font-semibold px-4 py-2 rounded-full border whitespace-nowrap transition-all active:scale-95"
                        :class="isDark ? 'bg-ai-blue/10 border-ai-blue/20 text-ai-blue hover:bg-ai-blue/20' : 'bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100'">
                        ✦ {{ chip }}
                    </button>
                </div>
            </div>
        </div>

        <!-- Input -->
        <div class="px-4 pt-3 pb-4 flex items-end gap-3 border-t flex-shrink-0"
            :class="isDark ? 'border-white/5 bg-background-dark' : 'border-gray-100 bg-background-light'">
            <div class="flex-1 glass-input rounded-2xl flex items-center px-4 py-3 gap-2">
                <input v-model="inputText" @keyup.enter="handleSend" type="text" placeholder="Message dispatcher..."
                    class="flex-1 bg-transparent border-none outline-none text-sm"
                    :class="isDark ? 'text-white placeholder-gray-600' : 'text-gray-900 placeholder-gray-400'" />
                <button @click="voiceInput" class="transition-colors"
                    :class="isDark ? 'text-gray-500 hover:text-primary' : 'text-gray-400 hover:text-primary'">
                    <span class="material-icons text-lg">mic</span>
                </button>
            </div>
            <button @click="handleSend" :disabled="!inputText.trim()"
                class="w-12 h-12 rounded-2xl flex items-center justify-center transition-all active:scale-95 flex-shrink-0"
                :class="inputText.trim() ? 'bg-primary text-background-dark' : isDark ? 'bg-surface-dark text-gray-600 cursor-not-allowed' : 'bg-gray-100 text-gray-400 cursor-not-allowed'">
                <span class="material-icons">send</span>
            </button>
        </div>

        <BottomNav />
    </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'
import { useUiStore } from '../stores/uiStore.js'
import BottomNav from '../components/BottomNav.vue'

const uiStore = useUiStore()
const isDark = computed(() => uiStore.theme !== 'light')

const messagesEl = ref(null)
const inputText = ref('')

const messages = ref([
    { id: 1, mine: false, text: '🚦 Arjun, heads up — Andheri West has a road block near JVLR. Suggested alternative: Jogeshwari-Vikhroli Link Road.', time: '08:14' },
    { id: 2, mine: true, text: 'Copy that. Rerouting now. ETA updated to 09:05.', time: '08:15' },
    { id: 3, mine: false, text: '✅ Confirmed. Stop #2 TechSoft just called — they need delivery by 11:30 sharp. Can you make it?', time: '08:22' },
    { id: 4, mine: true, text: 'Yes, will prioritize Stop 2 after completing Stop 1 relabeling.', time: '08:23' },
    { id: 5, mine: false, text: '📦 New priority added: Stop #5 Café Roasters moved up to #3 ETA window 12:30-13:00. Updated manifest uploaded.', time: '09:10' },
])

const aiChips = ref([
    'Acknowledged',
    'En route to stop',
    'ETA updated',
    'Need assistance',
    'Traffic delay',
    'Delivery complete',
])

function handleSend() {
    if (!inputText.value.trim()) return
    sendMessage(inputText.value.trim())
    inputText.value = ''
}

function sendMessage(text) {
    const now = new Date()
    messages.value.push({
        id: Date.now(),
        mine: true,
        text,
        time: now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    })
    nextTick(() => {
        if (messagesEl.value) {
            messagesEl.value.scrollTop = messagesEl.value.scrollHeight
        }
        // Simulate dispatcher response
        setTimeout(() => {
            messages.value.push({
                id: Date.now() + 1,
                mine: false,
                text: '✅ Received. On record.',
                time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
            })
        }, 1200)
    })
}

function voiceInput() {
    uiStore.showToast('Voice input activated', 'info')
}
</script>
