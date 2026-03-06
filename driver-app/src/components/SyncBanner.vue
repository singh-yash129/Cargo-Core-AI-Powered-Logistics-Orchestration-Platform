<template>
  <Transition name="toast">
    <div v-if="status !== 'connected'"
      class="fixed top-0 left-0 right-0 z-[100] flex justify-center pt-safe pointer-events-none">
      <div class="mt-3 rounded-full px-5 py-2 flex items-center gap-2.5 shadow-xl backdrop-blur-md border text-xs font-bold uppercase tracking-wider"
        :class="status === 'offline'
          ? 'bg-red-950/90 border-red-500/40 text-red-400'
          : 'bg-amber-950/90 border-amber-500/40 text-amber-400'">
        <span class="relative w-2 h-2 flex">
          <span class="absolute inline-flex h-full w-full rounded-full animate-ping opacity-75"
            :class="status === 'offline' ? 'bg-red-500' : 'bg-amber-500'"></span>
          <span class="relative inline-flex rounded-full h-2 w-2"
            :class="status === 'offline' ? 'bg-red-500' : 'bg-amber-500'"></span>
        </span>
        {{ status === 'offline' ? 'Offline Mode' : 'Syncing...' }}
        <span class="opacity-60 border-l border-white/10 pl-2.5 text-[10px]">
          {{ status === 'offline' ? `${queueCount} actions queued` : 'Connecting...' }}
        </span>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { computed } from 'vue'
import { useUiStore } from '../stores/uiStore.js'

const uiStore = useUiStore()
const status = computed(() => uiStore.syncStatus)
const queueCount = computed(() => uiStore.offlineQueue.length)
</script>

<style scoped>
.toast-enter-active, .toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(-20px); }
</style>
