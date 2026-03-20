<template>
    <div class="space-y-6">
        <div class="flex items-center gap-3">
            <div
                class="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                <span class="material-symbols-outlined text-white">smart_toy</span>
            </div>
            <h2
                class="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
                Cargo-Core AI Intelligence</h2>
        </div>

        <!-- Chat Interface -->
        <div class="glass-panel h-[600px] flex flex-col rounded-2xl overflow-hidden relative">
            <div
                class="absolute inset-0 bg-gradient-to-b from-blue-50/50 to-transparent dark:from-blue-900/10 dark:to-transparent pointer-events-none z-0">
            </div>

            <!-- Chat History -->
            <div ref="chatContainer" class="flex-1 overflow-y-auto p-6 space-y-6 relative z-10 scroll-smooth">
                <div v-for="(msg, index) in store.aiMessages" :key="msg.id || index" class="flex gap-4 max-w-[80%]" :class="msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''">
                    <!-- Avatar -->
                    <div class="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold"
                        :class="msg.role === 'ai' ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white' : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-white'">
                        {{ msg.role === 'ai' ? 'AI' : 'ME' }}
                    </div>

                    <div class="space-y-2">
                        <!-- Message Bubble -->
                        <div class="p-4 rounded-2xl text-sm leading-relaxed shadow-sm"
                            :class="msg.role === 'ai' 
                                ? 'bg-white border border-gray-100 dark:bg-white/5 dark:border-white/10 rounded-tl-none text-gray-700 dark:text-gray-300' 
                                : 'bg-primary/10 border border-primary/20 dark:bg-primary/20 dark:border-primary/30 rounded-tr-none text-gray-900 dark:text-white'">
                            
                            <div v-html="msg.text"></div>

                            <!-- Structured Data Visualization (if any) -->
                            <div v-if="msg.data" class="mt-3 p-3 bg-white dark:bg-black/30 rounded-lg border border-gray-200 dark:border-white/5 text-xs shadow-sm">
                                <div v-for="(val, key) in msg.data" :key="key" class="flex justify-between mb-1 last:mb-0">
                                    <span class="text-gray-500 dark:text-gray-400 capitalize">{{ key.replace(/_/g, ' ') }}:</span>
                                    <span class="text-gray-900 dark:text-white font-bold" :class="{'text-green-500': String(val).includes('On Time') || String(val).includes('Complete')}">{{ val }}</span>
                                </div>
                            </div>
                        </div>
                        <div class="text-[10px] text-gray-400" :class="msg.role === 'user' ? 'text-right mr-2' : 'ml-2'">{{ msg.time }}</div>
                    </div>
                </div>

                <!-- Typing Indicator -->
                <div v-if="isTyping" class="flex gap-4 max-w-[80%] animate-pulse">
                     <div class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex-shrink-0 flex items-center justify-center text-xs font-bold text-white">AI</div>
                     <div class="bg-white dark:bg-white/5 p-4 rounded-2xl rounded-tl-none flex items-center gap-1">
                         <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                         <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></span>
                         <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></span>
                     </div>
                </div>
            </div>

            <!-- Input Area -->
            <div class="p-6 pt-2 relative z-10">
                <div class="relative">
                    <input 
                        v-model="userInput" 
                        @keyup.enter="handleSend"
                        type="text" 
                        placeholder="Ask AI anything about your fleet, stock, or predictions..."
                        class="w-full bg-gray-50 border border-gray-200 dark:bg-white/5 dark:border-white/10 rounded-xl py-4 pl-6 pr-14 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-primary/50 focus:bg-white dark:focus:bg-white/10 transition-all shadow-inner"
                    >
                    <button 
                        @click="handleSend"
                        class="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-primary rounded-lg text-white hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50"
                        :disabled="!userInput.trim() || isTyping">
                        <span class="material-symbols-outlined text-[20px] ml-1">send</span>
                    </button>
                </div>
                <div class="flex gap-3 mt-4 overflow-x-auto no-scrollbar pb-2">
                    <button v-for="chip in store.aiSuggestionChips" :key="chip" @click="sendChip(chip)"
                        class="whitespace-nowrap px-4 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 dark:bg-white/5 dark:hover:bg-white/10 rounded-full dark:border-white/10 text-xs text-gray-600 dark:text-gray-300 transition-colors shadow-sm">
                        {{ chip }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import { useLogisticStore } from '@/stores/logisticStore'

const userInput = ref('')
const isTyping = ref(false)
const chatContainer = ref(null)
const store = useLogisticStore()

const scrollToBottom = async () => {
    await nextTick()
    if (chatContainer.value) {
        chatContainer.value.scrollTop = chatContainer.value.scrollHeight
    }
}

const handleSend = async () => {
    const text = userInput.value.trim()
    if (!text) return

    userInput.value = ''
    isTyping.value = true
    await scrollToBottom()
    try {
        await store.askAi(text)
    } finally {
        isTyping.value = false
        await scrollToBottom()
    }
}

const sendChip = (chipText) => {
    userInput.value = chipText
    handleSend()
}
</script>
