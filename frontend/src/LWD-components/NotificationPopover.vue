<template>
    <div class="relative">
        <button @click="toggle"
            class="w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/5 transition-colors text-gray-400 hover:text-white relative outline-none focus:ring-2 focus:ring-primary/50">
            <span class="material-symbols-outlined text-[20px]">notifications</span>
            <span v-if="unreadCount > 0"
                class="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 border border-background-dark animate-pulse"></span>
        </button>

        <!-- Popover -->
        <div v-if="isOpen"
            class="absolute right-0 top-full mt-2 w-80 bg-card-dark border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden transform transition-all origin-top-right">
            <div class="p-3 border-b border-white/10 flex justify-between items-center bg-white/5">
                <h3 class="text-sm font-semibold text-white">Notifications</h3>
                <div v-if="notifications.length > 0" class="flex gap-2">
                    <button @click="$emit('mark-all-read')" title="Mark all as read"
                        class="text-gray-400 hover:text-primary transition-colors">
                        <span class="material-symbols-outlined text-[18px]">done_all</span>
                    </button>
                    <button @click="$emit('clear-all')" title="Clear all"
                        class="text-gray-400 hover:text-red-400 transition-colors">
                        <span class="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                </div>
            </div>

            <div class="transition-all duration-300 ease-in-out overflow-y-auto custom-scrollbar"
                :class="isExpanded ? 'max-h-[500px]' : 'max-h-80'">
                <div v-if="notifications.length === 0" class="p-4 text-center text-gray-500 text-xs">
                    No new notifications
                </div>
                <div v-for="notif in notifications" :key="notif.id"
                    class="p-3 border-b border-white/5 hover:bg-white/5 transition-colors flex gap-3 group relative"
                    :class="{ 'opacity-60': notif.read }">
                    <div class="mt-1">
                        <span class="material-symbols-outlined text-[20px]" :class="getTypeIconClass(notif.type)">{{
                            getTypeIcon(notif.type) }}</span>
                    </div>
                    <div class="flex-1">
                        <div class="flex justify-between items-start">
                            <h4 class="text-sm font-medium text-white line-clamp-1">{{ notif.title }}</h4>
                            <span class="text-[10px] text-gray-500">{{ notif.time }}</span>
                        </div>
                        <p class="text-xs text-gray-400 mt-0.5 line-clamp-2">{{ notif.message }}</p>
                    </div>
                    <button v-if="!notif.read" @click.stop="$emit('mark-read', notif.id)"
                        class="absolute right-2 bottom-2 text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Mark as read">
                        <span class="material-symbols-outlined text-[16px]">check</span>
                    </button>
                </div>
            </div>

            <div class="p-2 border-t border-white/10 bg-white/5 text-center">
                <button @click="toggleExpand" class="text-xs text-primary hover:underline">
                    {{ isExpanded ? 'Show Less' : 'View All Notifications' }}
                </button>
            </div>
        </div>

        <!-- Backdrop to close when clicking outside -->
        <div v-if="isOpen" @click="close" class="fixed inset-0 z-40 bg-transparent cursor-default"></div>
    </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
    notifications: Array,
    unreadCount: Number
})

const emit = defineEmits(['mark-read', 'mark-all-read', 'clear-all'])

const isOpen = ref(false)
const isExpanded = ref(false)

function toggle() {
    isOpen.value = !isOpen.value
    if (!isOpen.value) isExpanded.value = false
}

function close() {
    isOpen.value = false
    isExpanded.value = false
}

function toggleExpand() {
    isExpanded.value = !isExpanded.value
}

function getTypeIcon(type) {
    switch (type) {
        case 'alert': return 'error'
        case 'warning': return 'warning'
        case 'success': return 'check_circle'
        default: return 'notifications'
    }
}

function getTypeIconClass(type) {
    switch (type) {
        case 'alert': return 'text-red-500'
        case 'warning': return 'text-yellow-500'
        case 'success': return 'text-green-500'
        default: return 'text-blue-500'
    }
}
</script>
