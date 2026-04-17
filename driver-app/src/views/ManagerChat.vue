<template>
    <div class="screen-layout" :class="isDark ? 'bg-background-dark text-white' : 'bg-background-light text-gray-900'">

        <header class="flex-shrink-0 px-5 pt-5 pb-3 border-b" :class="isDark ? 'border-white/5' : 'border-gray-100'">
            <div class="flex items-center justify-between mb-2">
                <div class="flex items-center gap-3">
                    <button @click="$router.back()"
                        class="w-10 h-10 rounded-full flex items-center justify-center border flex-shrink-0"
                        :class="isDark ? 'bg-surface-dark border-white/5 text-gray-400' : 'bg-white border-gray-200 shadow-sm'">
                        <span class="material-icons text-xl">arrow_back</span>
                    </button>
                    <div>
                        <h1 class="text-xl font-black leading-tight">Manager Chat</h1>
                        <div class="flex items-center gap-1.5 mt-0.5">
                            <span class="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                            <p class="text-xs font-semibold text-primary">Logistics Manager</p>
                        </div>
                    </div>
                </div>
                <button @click="$router.push('/voice')" class="p-2 rounded-xl border"
                    :class="isDark ? 'bg-surface-dark/50 border-white/5 text-primary' : 'bg-primary/10 border-primary/20 text-primary'">
                    <span class="material-icons">record_voice_over</span>
                </button>
            </div>
        </header>

        <div class="screen-body px-4 py-4 flex flex-col gap-3" ref="chatBody">
            <div class="flex gap-2 flex-wrap">
                <button v-for="chip in suggestions" :key="chip" @click="sendMessage(chip)"
                    class="text-xs font-semibold px-3 py-1.5 rounded-full border transition-all active:scale-95"
                    :class="isDark ? 'border-ai-blue/20 bg-ai-blue/8 text-ai-blue' : 'border-blue-200 bg-blue-50 text-blue-600'">
                    ✦ {{ chip }}
                </button>
            </div>

            <div v-for="msg in messages" :key="msg.id" class="flex"
                :class="msg.fromDriver ? 'justify-end' : 'justify-start'">
                <div v-if="!msg.fromDriver"
                    class="w-7 h-7 rounded-full mr-2 flex-shrink-0 self-end bg-primary/20 flex items-center justify-center">
                    <span class="material-icons text-primary text-xs">support_agent</span>
                </div>
                <div class="max-w-[75%] px-4 py-2.5 rounded-2xl text-sm"
                    :class="msg.fromDriver
                        ? 'bg-primary text-background-dark rounded-br-sm'
                        : isDark ? 'bg-surface-dark border border-white/8 text-white rounded-bl-sm' : 'bg-white border border-gray-100 text-gray-800 shadow-sm rounded-bl-sm'">
                    {{ msg.text }}
                    <p class="text-[10px] mt-1 opacity-60 text-right">{{ msg.time }}</p>
                </div>
            </div>

            <div v-if="isTyping" class="flex items-center gap-2">
                <div class="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <span class="material-icons text-primary text-xs">support_agent</span>
                </div>
                <div class="px-4 py-3 rounded-2xl rounded-bl-sm border"
                    :class="isDark ? 'bg-surface-dark border-white/8' : 'bg-white border-gray-200 shadow-sm'">
                    <div class="flex gap-1">
                        <span class="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style="animation-delay:0ms"></span>
                        <span class="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style="animation-delay:150ms"></span>
                        <span class="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style="animation-delay:300ms"></span>
                    </div>
                </div>
            </div>

            <div class="h-1"></div>
        </div>

        <div class="screen-footer border-t"
            :class="isDark ? 'border-white/5 bg-background-dark' : 'border-gray-100 bg-background-light'">
            <div class="flex items-center gap-3 px-4 py-3">
                <div @click="focusChatInput" class="flex-1 flex items-center gap-2 rounded-2xl border px-4 py-2.5 cursor-text"
                    :class="isDark ? 'bg-surface-dark/50 border-white/8' : 'bg-white border-gray-200 shadow-sm'">
                    <input ref="chatInputRef" id="managerChatInput" v-model="inputText" placeholder="Message logistics manager…" type="text"
                        inputmode="text" enterkeyhint="send"
                        class="flex-1 text-sm bg-transparent outline-none"
                        style="pointer-events: auto; touch-action: manipulation;"
                        :class="isDark ? 'text-white placeholder-gray-600' : 'text-gray-900 placeholder-gray-400'"
                        @keyup.enter="handleSend" />
                </div>
                <button @click="handleSend" :disabled="!inputText.trim()"
                    class="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all active:scale-95"
                    :class="inputText.trim() ? 'bg-primary text-background-dark' : isDark ? 'bg-surface-dark text-gray-600' : 'bg-gray-100 text-gray-400'">
                    <span class="material-icons">send</span>
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, nextTick, computed, onMounted, onUnmounted } from 'vue'
import { useUiStore } from '../stores/uiStore.js'
import * as api from '../services/api.js'

const uiStore = useUiStore()
const isDark = computed(() => uiStore.theme !== 'light')

const chatBody = ref(null)
const chatInputRef = ref(null)
const inputText = ref('')
const isTyping = ref(false)
const isSending = ref(false)
const focusChatInput = () => { chatInputRef.value?.focus() }

const suggestions = ['Need route approval', 'Vehicle issue update', 'Request labor support', 'Need customer escalation']

const messages = ref([])

function scrollToBottom() {
    nextTick(() => { if (chatBody.value) chatBody.value.scrollTop = chatBody.value.scrollHeight })
}

async function loadThread() {
    try {
        const thread = await api.getManagerThread()
        messages.value = thread.messages || []
        scrollToBottom()
    } catch (err) {
        uiStore.showToast(err.message || 'Could not load manager chat', 'error', 3000)
        console.error('[ManagerChat] load error:', err)
    }
}

async function sendMessage(text) {
    if (isSending.value) return
    isSending.value = true
    const tempId = `temp-${Date.now()}`
    const now = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false })
    messages.value.push({ id: tempId, text, fromDriver: true, time: now })
    scrollToBottom()
    try {
        const thread = await api.sendManagerMessage(text)
        messages.value = thread.messages || []
        scrollToBottom()
    } catch (err) {
        messages.value = messages.value.filter(m => m.id !== tempId)
        uiStore.showToast(err.message || 'Failed to send message', 'error', 3000)
        console.error('[ManagerChat] send error:', err)
    } finally {
        isSending.value = false
    }
}

function handleSend() {
    if (!inputText.value.trim()) return
    const text = inputText.value.trim()
    inputText.value = ''
    sendMessage(text)
}

let pollInterval = null

onMounted(() => {
    loadThread()
    pollInterval = setInterval(async () => {
        if (isSending.value) return
        try {
            const thread = await api.getManagerThread()
            messages.value = thread.messages || []
            scrollToBottom()
        } catch (_) {}
    }, 8000)
})

onUnmounted(() => {
    if (pollInterval) clearInterval(pollInterval)
})
</script>
