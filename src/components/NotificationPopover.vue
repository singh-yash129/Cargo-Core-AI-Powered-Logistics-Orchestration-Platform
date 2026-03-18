<template>
  <div class="relative">
    <button
      class="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-white/5 transition-colors text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white relative outline-none focus:ring-2 focus:ring-primary/50"
      @click="toggle"
    >
      <span class="material-symbols-outlined text-[20px]">notifications</span>
      <span
        v-if="unreadCount > 0"
        class="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 border border-white dark:border-background-dark animate-pulse"
      />
    </button>

    <div
      v-if="isOpen"
      class="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-card-darker border border-gray-200 dark:border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden"
    >
      <div class="p-3 border-b border-gray-200 dark:border-white/10 flex justify-between items-center bg-gray-50 dark:bg-white/5">
        <h3 class="text-sm font-semibold text-gray-900 dark:text-white">Notifications</h3>
        <div v-if="notifications.length > 0" class="flex gap-2">
          <button class="text-gray-400 hover:text-primary transition-colors" title="Mark all as read" @click="$emit('mark-all-read')">
            <span class="material-symbols-outlined text-[18px]">done_all</span>
          </button>
          <button class="text-gray-400 hover:text-red-400 transition-colors" title="Clear all" @click="$emit('clear-all')">
            <span class="material-symbols-outlined text-[18px]">delete</span>
          </button>
        </div>
      </div>

      <div class="max-h-80 overflow-y-auto">
        <div v-if="notifications.length === 0" class="p-4 text-center text-gray-500 text-xs">No new notifications</div>
        <div
          v-for="notif in notifications"
          :key="notif.id"
          class="p-3 border-b border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors flex gap-3 group relative"
          :class="{ 'opacity-60': notif.read }"
        >
          <div class="mt-1">
            <span class="material-symbols-outlined text-[20px]" :class="getTypeIconClass(notif.type)">{{ getTypeIcon(notif.type) }}</span>
          </div>
          <div class="flex-1">
            <div class="flex justify-between items-start">
              <h4 class="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">{{ notif.title }}</h4>
              <span class="text-[10px] text-gray-500">{{ notif.time }}</span>
            </div>
            <p class="text-xs text-gray-600 dark:text-gray-400 mt-0.5 line-clamp-2">{{ notif.message }}</p>
          </div>
          <button
            v-if="!notif.read"
            class="absolute right-2 bottom-2 text-primary opacity-0 group-hover:opacity-100 transition-opacity"
            title="Mark as read"
            @click.stop="$emit('mark-read', notif.id)"
          >
            <span class="material-symbols-outlined text-[16px]">check</span>
          </button>
        </div>
      </div>
    </div>

    <div v-if="isOpen" class="fixed inset-0 z-40 bg-transparent" @click="close" />
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  notifications: { type: Array, default: () => [] },
  unreadCount: { type: Number, default: 0 },
})

defineEmits(['mark-read', 'mark-all-read', 'clear-all'])

const isOpen = ref(false)

function toggle() {
  isOpen.value = !isOpen.value
}

function close() {
  isOpen.value = false
}

function getTypeIcon(type) {
  switch (type) {
    case 'alert':
      return 'error'
    case 'warning':
      return 'warning'
    case 'success':
      return 'check_circle'
    default:
      return 'notifications'
  }
}

function getTypeIconClass(type) {
  switch (type) {
    case 'alert':
      return 'text-red-500'
    case 'warning':
      return 'text-yellow-500'
    case 'success':
      return 'text-green-500'
    default:
      return 'text-blue-500'
  }
}
</script>
