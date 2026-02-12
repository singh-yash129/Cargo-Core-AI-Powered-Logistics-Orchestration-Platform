<template>
    <div class="h-[calc(100vh-8rem)] flex gap-6">
        <!-- Driver List Sidebar -->
        <div class="w-80 glass-panel rounded-xl flex flex-col overflow-hidden">
            <div class="p-4 border-b border-white/5 bg-black/20">
                <div class="text-xs font-bold text-gray-400 uppercase mb-2">Active Drivers</div>
                <div class="relative">
                    <span class="material-symbols-outlined absolute left-3 top-2.5 text-gray-500">search</span>
                    <input type="text" placeholder="Find driver..."
                        class="w-full bg-black/40 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-white text-sm focus:outline-none focus:border-primary/50">
                </div>
            </div>
            <div class="flex-1 overflow-y-auto no-scrollbar">
                <div v-for="driver in drivers" :key="driver.id"
                    class="p-4 border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors flex items-center gap-3"
                    :class="activeChat === driver.id ? 'bg-white/5 border-l-2 border-l-primary' : ''"
                    @click="activeChat = driver.id">
                    <div class="relative">
                        <img :src="driver.avatar" class="w-10 h-10 rounded-full bg-gray-700">
                        <span class="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border border-black"
                            :class="driver.online ? 'bg-green-500' : 'bg-gray-500'"></span>
                    </div>
                    <div>
                        <div class="font-bold text-white text-sm">{{ driver.name }}</div>
                        <div class="text-[10px] text-gray-500 truncate w-40">{{ driver.lastMessage }}</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Active Chat Area -->
        <div class="flex-1 glass-panel rounded-xl flex flex-col overflow-hidden">
            <div class="p-4 border-b border-white/5 flex justify-between items-center bg-black/20">
                <div class="flex items-center gap-3">
                    <img src="https://i.pravatar.cc/150?u=1" class="w-10 h-10 rounded-full bg-gray-700">
                    <div>
                        <div class="font-bold text-white">Mike Ross</div>
                        <div class="text-xs text-green-400">On Route to Zone A</div>
                    </div>
                </div>
                <div class="flex gap-2">
                    <button class="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white"
                        title="Push to Talk"><span class="material-symbols-outlined">mic</span></button>
                    <button class="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white"><span
                            class="material-symbols-outlined">call</span></button>
                </div>
            </div>

            <div class="flex-1 overflow-y-auto p-6 space-y-4 bg-black/10">
                <!-- Messages -->
                <div class="flex gap-3">
                    <img src="https://i.pravatar.cc/150?u=1" class="w-8 h-8 rounded-full bg-gray-700">
                    <div
                        class="bg-white/5 border border-white/10 p-3 rounded-xl rounded-tl-none text-gray-300 text-sm max-w-[70%]">
                        Boss, traffic is heavy on Main St. Estimated delay 10 mins.
                    </div>
                </div>
                <div class="flex gap-3 flex-row-reverse">
                    <div
                        class="w-8 h-8 rounded-full bg-primary flex-shrink-0 flex items-center justify-center text-[10px] text-black font-bold">
                        DISP</div>
                    <div
                        class="bg-primary/20 border border-primary/30 p-3 rounded-xl rounded-tr-none text-white text-sm max-w-[70%]">
                        Copy that Mike. Proceed with caution. Dispatching updated route to your nav.
                    </div>
                </div>
            </div>

            <div class="p-4 bg-black/20 border-t border-white/5">
                <div class="relative">
                    <input type="text" placeholder="Message Mike..."
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

const drivers = ref([
    { id: 1, name: 'Mike Ross', online: true, lastMessage: 'Traffic is heavy...', avatar: 'https://i.pravatar.cc/150?u=1' },
    { id: 2, name: 'Harvey Specter', online: false, lastMessage: 'Delivered successfully.', avatar: 'https://i.pravatar.cc/150?u=2' },
    { id: 3, name: 'Rachel Zane', online: true, lastMessage: 'Pick up done.', avatar: 'https://i.pravatar.cc/150?u=3' },
])
</script>
