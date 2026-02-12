<template>
    <div class="h-[calc(100vh-8rem)] flex gap-6">
        <!-- Conversation Sidebar -->
        <div class="w-80 glass-panel rounded-xl flex flex-col overflow-hidden">
            <div class="p-4 border-b border-white/5">
                <div class="relative">
                    <span class="material-symbols-outlined absolute left-3 top-2.5 text-gray-500">search</span>
                    <input type="text" placeholder="Search chats..."
                        class="w-full bg-black/20 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-white text-sm focus:outline-none focus:border-primary/50">
                </div>
            </div>
            <div class="flex-1 overflow-y-auto no-scrollbar">
                <div v-for="chat in chats" :key="chat.id"
                    class="p-4 border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors"
                    :class="activeChat === chat.id ? 'bg-white/5 border-l-2 border-l-primary' : ''"
                    @click="activeChat = chat.id">
                    <div class="flex justify-between items-start mb-1">
                        <div class="font-bold text-white text-sm">{{ chat.name }}</div>
                        <div class="text-[10px] text-gray-500">{{ chat.time }}</div>
                    </div>
                    <div class="text-xs text-gray-400 truncate">{{ chat.lastMessage }}</div>
                </div>
            </div>
        </div>

        <!-- Active Chat Area -->
        <div class="flex-1 glass-panel rounded-xl flex flex-col overflow-hidden">
            <div class="p-4 border-b border-white/5 flex justify-between items-center bg-black/20">
                <div class="flex items-center gap-3">
                    <div
                        class="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold">
                        DM</div>
                    <div>
                        <div class="font-bold text-white">Dispatcher Mike</div>
                        <div class="text-xs text-green-400 flex items-center gap-1"><span
                                class="w-1.5 h-1.5 rounded-full bg-green-400"></span> Online</div>
                    </div>
                </div>
                <div class="flex gap-2">
                    <button class="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white"><span
                            class="material-symbols-outlined">call</span></button>
                    <button class="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white"><span
                            class="material-symbols-outlined">videocam</span></button>
                    <button class="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white"><span
                            class="material-symbols-outlined">more_vert</span></button>
                </div>
            </div>

            <div class="flex-1 overflow-y-auto p-6 space-y-4 bg-black/10">
                <div class="flex gap-3">
                    <div
                        class="w-8 h-8 rounded-full bg-purple-600 flex-shrink-0 flex items-center justify-center text-[10px] text-white">
                        DM</div>
                    <div
                        class="bg-white/5 border border-white/10 p-3 rounded-xl rounded-tl-none text-gray-300 text-sm max-w-[70%]">
                        Hi Boss, we have a situation at Hub 4.
                    </div>
                </div>
                <div class="flex gap-3">
                    <div
                        class="w-8 h-8 rounded-full bg-purple-600 flex-shrink-0 flex items-center justify-center text-[10px] text-white">
                        DM</div>
                    <div
                        class="bg-white/5 border border-white/10 p-3 rounded-xl rounded-tl-none text-gray-300 text-sm max-w-[70%]">
                        Two trucks are down. We need approval for expedited maintenance.
                    </div>
                </div>
                <div class="flex gap-3 flex-row-reverse">
                    <div
                        class="w-8 h-8 rounded-full bg-gray-600 flex-shrink-0 flex items-center justify-center text-[10px] text-white">
                        ME</div>
                    <div
                        class="bg-primary/20 border border-primary/30 p-3 rounded-xl rounded-tr-none text-white text-sm max-w-[70%]">
                        Approved. Get them fixed ASAP. Use the contingency budget.
                    </div>
                </div>
            </div>

            <div class="p-4 bg-black/20 border-t border-white/5">
                <div class="relative">
                    <input type="text" placeholder="Type a message..."
                        class="w-full bg-white/5 border border-white/10 rounded-full py-3 pl-4 pr-12 text-white focus:outline-none focus:border-primary/50">
                    <button
                        class="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-primary rounded-full text-black hover:scale-105 transition-transform">
                        <span class="material-symbols-outlined text-[20px]">send</span>
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'

const activeChat = ref(1)

const chats = ref([
    { id: 1, name: 'Dispatcher Mike', time: '2m', lastMessage: 'Two trucks are down. We need approval...' },
    { id: 2, name: 'Warehouse Team A', time: '1h', lastMessage: 'Inventory count complete.' },
    { id: 3, name: 'Sarah (Admin)', time: '3h', lastMessage: 'Payroll report is ready for review.' },
    { id: 4, name: 'Global Broadcast', time: '1d', lastMessage: 'System maintenance scheduled for...' },
])
</script>
