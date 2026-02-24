<template>
    <div class="h-[calc(100vh-8rem)] flex gap-6">
        <!-- Conversation Sidebar -->
        <div class="w-80 glass-panel rounded-xl flex flex-col overflow-hidden">
            <div class="p-4 border-b border-gray-200 dark:border-white/5">
                <div class="relative">
                    <span
                        class="material-symbols-outlined absolute left-3 top-2.5 text-gray-400 dark:text-gray-500">search</span>
                    <input type="text" placeholder="Search chats..."
                        class="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg py-2 pl-10 pr-4 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-primary/50 transition-colors">
                </div>
            </div>
            <div class="flex-1 overflow-y-auto no-scrollbar">
                <div v-for="chat in filteredChats" :key="chat.id"
                    class="p-4 border-b border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer transition-colors"
                    :class="activeChat === chat.id ? 'bg-primary/5 border-l-2 border-l-primary dark:bg-white/5' : ''"
                    @click="activeChat = chat.id">
                    <div class="flex justify-between items-start mb-1">
                        <div class="font-bold text-gray-900 dark:text-white text-sm">{{ chat.name }}</div>
                        <div class="text-[10px] text-gray-500">{{ chat.time }}</div>
                    </div>
                    <div class="text-xs text-gray-500 dark:text-gray-400 truncate">{{ chat.lastMessage }}</div>
                </div>
            </div>
        </div>

        <!-- Active Chat Area -->
        <div class="flex-1 glass-panel rounded-xl flex flex-col overflow-hidden">
            <div
                class="p-4 border-b border-gray-200 dark:border-white/5 flex justify-between items-center bg-gray-50/50 dark:bg-black/20">
                <div class="flex items-center gap-3">
                    <div
                        class="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold shadow-sm">
                        DM</div>
                    <div>
                        <div class="font-bold text-gray-900 dark:text-white">Dispatcher Mike</div>
                        <div class="text-xs text-green-500 dark:text-green-400 flex items-center gap-1"><span
                                class="w-1.5 h-1.5 rounded-full bg-green-500 dark:bg-green-400"></span> Online</div>
                    </div>
                </div>
                <div class="flex gap-2">
                    <button
                        class="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"><span
                            class="material-symbols-outlined">call</span></button>
                    <button
                        class="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"><span
                            class="material-symbols-outlined">videocam</span></button>
                    <button
                        class="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"><span
                            class="material-symbols-outlined">more_vert</span></button>
                </div>
            </div>

            <div class="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/30 dark:bg-black/10">
                <div class="flex gap-3">
                    <div
                        class="w-8 h-8 rounded-full bg-purple-600 flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-white shadow-sm">
                        DM</div>
                    <div
                        class="bg-white border border-gray-100 dark:bg-white/5 dark:border-white/10 p-3 rounded-xl rounded-tl-none text-gray-700 dark:text-gray-300 text-sm max-w-[70%] shadow-sm">
                        Hi Boss, we have a situation at Hub 4.
                    </div>
                </div>
                <div class="flex gap-3">
                    <div
                        class="w-8 h-8 rounded-full bg-purple-600 flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-white shadow-sm">
                        DM</div>
                    <div
                        class="bg-white border border-gray-100 dark:bg-white/5 dark:border-white/10 p-3 rounded-xl rounded-tl-none text-gray-700 dark:text-gray-300 text-sm max-w-[70%] shadow-sm">
                        Two trucks are down. We need approval for expedited maintenance.
                    </div>
                </div>
                <div class="flex gap-3 flex-row-reverse">
                    <div
                        class="w-8 h-8 rounded-full bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-white flex-shrink-0 flex items-center justify-center text-[10px] font-bold shadow-sm">
                        ME</div>
                    <div
                        class="bg-primary/10 border border-primary/20 dark:bg-primary/20 dark:border-primary/30 p-3 rounded-xl rounded-tr-none text-gray-900 dark:text-white text-sm max-w-[70%] shadow-sm">
                        Approved. Get them fixed ASAP. Use the contingency budget.
                    </div>
                </div>
            </div>

            <div class="p-4 bg-gray-50 dark:bg-black/20 border-t border-gray-200 dark:border-white/5">
                <div class="relative">
                    <input type="text" placeholder="Type a message..."
                        class="w-full bg-white border border-gray-200 dark:bg-white/5 dark:border-white/10 rounded-full py-3 pl-4 pr-12 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all shadow-sm">
                    <button
                        class="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center bg-primary rounded-full text-white hover:bg-primary/90 hover:scale-105 transition-all shadow-sm">
                        <span class="material-symbols-outlined text-[18px] ml-0.5">send</span>
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { useLogisticStore } from '@/stores/logisticStore'
import { storeToRefs } from 'pinia'

const store = useLogisticStore()
const { filteredChats } = storeToRefs(store)

const activeChat = ref(1)
</script>
