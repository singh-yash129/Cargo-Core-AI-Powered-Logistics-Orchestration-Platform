<template>
    <div class="screen-layout" :class="isDark ? 'bg-background-dark text-white' : 'bg-background-light text-gray-900'">

        <!-- ── HEADER ───────────────────────────────── -->
        <header class="flex-shrink-0 px-5 pt-5 pb-3 border-b" :class="isDark ? 'border-white/5' : 'border-gray-100'">
            <div class="flex items-center justify-between mb-2">
                <div class="flex items-center gap-3">
                    <button @click="$router.back()"
                        class="w-10 h-10 rounded-full flex items-center justify-center border flex-shrink-0"
                        :class="isDark ? 'bg-surface-dark border-white/5 text-gray-400' : 'bg-white border-gray-200 shadow-sm'">
                        <span class="material-icons text-xl">arrow_back</span>
                    </button>
                    <div>
                        <h1 class="text-xl font-black leading-tight">Dispatch Chat</h1>
                        <div class="flex items-center gap-1.5 mt-0.5">
                            <span class="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                            <p class="text-xs font-semibold text-primary">Dispatcher Online</p>
                        </div>
                    </div>
                </div>
                <button @click="$router.push('/voice')" class="p-2 rounded-xl border"
                    :class="isDark ? 'bg-surface-dark/50 border-white/5 text-primary' : 'bg-primary/10 border-primary/20 text-primary'">
                    <span class="material-icons">record_voice_over</span>
                </button>
            </div>
        </header>

        <!-- ── SCROLLABLE CHAT BODY ──────────────────── -->
        <div class="screen-body px-4 py-4 flex flex-col gap-3" ref="chatBody">

            <!-- AI Suggestion Chips -->
            <div class="flex gap-2 flex-wrap">
                <button v-for="chip in suggestions" :key="chip" @click="sendMessage(chip)"
                    class="text-xs font-semibold px-3 py-1.5 rounded-full border transition-all active:scale-95"
                    :class="isDark ? 'border-ai-blue/20 bg-ai-blue/8 text-ai-blue' : 'border-blue-200 bg-blue-50 text-blue-600'">
                    ✦ {{ chip }}
                </button>
            </div>

            <!-- Messages -->
            <div v-for="msg in renderedMessages" :key="msg.id" class="flex"
                :class="msg.fromDriver ? 'justify-end' : 'justify-start'">
                <div v-if="!msg.fromDriver"
                    class="w-7 h-7 rounded-full mr-2 flex-shrink-0 self-end bg-primary/20 flex items-center justify-center">
                    <span class="material-icons text-primary text-xs">headset_mic</span>
                </div>
                <div v-if="msg.action && !msg.fromDriver" class="max-w-[78%] rounded-3xl border px-4 py-3 text-sm shadow-sm"
                    :class="msg.action.kind === 'route'
                        ? (isDark ? 'bg-accent-blue/12 border-accent-blue/25 text-white' : 'bg-blue-50 border-blue-200 text-gray-900')
                        : (isDark ? 'bg-red-500/12 border-red-400/30 text-white' : 'bg-red-50 border-red-200 text-gray-900')">
                    <div class="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em]"
                        :class="msg.action.kind === 'route' ? 'text-primary' : 'text-red-400'">
                        <span class="material-icons text-base">{{ msg.action.kind === 'route' ? 'alt_route' : 'priority_high' }}</span>
                        {{ msg.action.title }}
                    </div>
                    <p class="mt-2 whitespace-pre-line leading-relaxed">{{ msg.action.body }}</p>
                    <p class="text-[10px] mt-2 opacity-60 text-right">{{ msg.time }}</p>
                </div>
                <div v-else class="max-w-[75%] px-4 py-2.5 rounded-2xl text-sm"
                    :class="msg.fromDriver
                        ? 'bg-primary text-background-dark rounded-br-sm'
                        : isDark ? 'bg-surface-dark border border-white/8 text-white rounded-bl-sm' : 'bg-white border border-gray-100 text-gray-800 shadow-sm rounded-bl-sm'">
                    {{ msg.text }}
                    <p class="text-[10px] mt-1 opacity-60 text-right">{{ msg.time }}</p>
                </div>
            </div>

            <!-- Typing indicator -->
            <div v-if="isTyping" class="flex items-center gap-2">
                <div class="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <span class="material-icons text-primary text-xs">headset_mic</span>
                </div>
                <div class="px-4 py-3 rounded-2xl rounded-bl-sm border"
                    :class="isDark ? 'bg-surface-dark border-white/8' : 'bg-white border-gray-200 shadow-sm'">
                    <div class="flex gap-1">
                        <span class="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce"
                            style="animation-delay:0ms"></span>
                        <span class="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce"
                            style="animation-delay:150ms"></span>
                        <span class="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce"
                            style="animation-delay:300ms"></span>
                    </div>
                </div>
            </div>

            <!-- Spacer for scroll breathing room -->
            <div class="h-1"></div>
        </div>

        <!-- ── STICKY FOOTER ────────────────────────── -->
        <div class="screen-footer border-t"
            :class="isDark ? 'border-white/5 bg-background-dark' : 'border-gray-100 bg-background-light'">
            <div class="flex items-center gap-3 px-4 py-3">
                <div @click="focusChatInput" class="flex-1 flex items-center gap-2 rounded-2xl border px-4 py-2.5 cursor-text"
                    :class="isDark ? 'bg-surface-dark/50 border-white/8' : 'bg-white border-gray-200 shadow-sm'">
                    <input ref="chatInputRef" id="chatInput" v-model="inputText" placeholder="Message dispatcher…" type="text"
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
const ROUTE_UPDATE_PREFIX = 'ROUTE UPDATE'
const URGENT_INSTRUCTION_PREFIX = 'URGENT INSTRUCTION'

const chatBody = ref(null)
const chatInputRef = ref(null)
const inputText = ref('')
const isTyping = ref(false)
const isSending = ref(false)
const focusChatInput = () => { chatInputRef.value?.focus() }

const suggestions = ['Current ETA?', 'Request re-route', 'Need backup crew', 'COD discrepancy']

const messages = ref([])
const renderedMessages = computed(() => messages.value.map((msg) => ({
    ...msg,
    action: !msg.fromDriver ? parseDispatchAction(msg.text) : null,
})))

function t() { return new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false }) }

function parseDispatchAction(text) {
    const raw = String(text || '').trim()
    if (!raw) return null

    if (raw === ROUTE_UPDATE_PREFIX || raw.startsWith(`${ROUTE_UPDATE_PREFIX}\n`)) {
        const body = raw.slice(ROUTE_UPDATE_PREFIX.length).trim() || 'Updated route pushed to your navigation.'
        return { kind: 'route', title: 'Route Update', body }
    }

    if (raw === URGENT_INSTRUCTION_PREFIX || raw.startsWith(`${URGENT_INSTRUCTION_PREFIX}\n`)) {
        const body = raw.slice(URGENT_INSTRUCTION_PREFIX.length).trim() || 'Immediate dispatcher instruction received.'
        return { kind: 'urgent', title: 'Urgent Instruction', body }
    }

    return null
}

function scrollToBottom() {
    nextTick(() => { if (chatBody.value) chatBody.value.scrollTop = chatBody.value.scrollHeight })
}

async function loadThread() {
    try {
        const thread = await api.getDispatchThread()
        messages.value = thread.messages || []
        scrollToBottom()
    } catch (err) {
        uiStore.showToast(err.message || 'Could not load chat', 'error', 3000)
        console.error('[DispatchChat] load error:', err)
    }
}

async function sendMessage(text) {
    if (isSending.value) return
    isSending.value = true
    // Optimistic update
    const tempId = `temp-${Date.now()}`
    messages.value.push({ id: tempId, text, fromDriver: true, time: t() })
    scrollToBottom()
    try {
        const thread = await api.sendDispatchMessage(text)
        messages.value = thread.messages || []
        scrollToBottom()
    } catch (err) {
        // Remove failed optimistic message
        messages.value = messages.value.filter(m => m.id !== tempId)
        uiStore.showToast(err.message || 'Failed to send message', 'error', 3000)
        console.error('[DispatchChat] send error:', err)
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

let _pollInterval = null

onMounted(() => {
    loadThread()
    // Poll every 8s so driver sees new dispatcher messages without manual action
    _pollInterval = setInterval(async () => {
        if (isSending.value) return
        try {
            const thread = await api.getDispatchThread()
            messages.value = thread.messages || []
            scrollToBottom()
        } catch (_) {}
    }, 8000)
})

onUnmounted(() => { if (_pollInterval) clearInterval(_pollInterval) })
</script>
