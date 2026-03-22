<template>
    <div class="screen-layout" :class="isDark ? 'bg-background-dark text-white' : 'bg-background-light text-gray-900'">

        <!-- ── HEADER ───────────────────────────────── -->
        <header class="flex-shrink-0 px-5 pt-5 pb-4 border-b" :class="isDark ? 'border-white/5' : 'border-gray-100'">
            <div class="flex items-center gap-3">
                <button @click="$router.back()" class="w-10 h-10 rounded-full flex items-center justify-center border"
                    :class="isDark ? 'bg-surface-dark border-white/5 text-gray-400' : 'bg-white border-gray-200 shadow-sm'">
                    <span class="material-icons text-xl">arrow_back</span>
                </button>
                <div>
                    <h1 class="text-2xl font-black tracking-tight">Offline Queue</h1>
                    <p class="text-xs" :class="isDark ? 'text-gray-400' : 'text-gray-500'">Actions pending sync</p>
                </div>
            </div>
        </header>

        <!-- ── SCROLLABLE BODY ───────────────────────── -->
        <div class="screen-body px-5 py-4 flex flex-col gap-4">

            <div v-if="uiStore.offlineQueue.length === 0"
                class="flex-1 flex flex-col items-center justify-center py-16 text-center gap-4">
                <div class="w-16 h-16 rounded-full flex items-center justify-center"
                    :class="isDark ? 'bg-primary/10' : 'bg-primary/8'">
                    <span class="material-icons text-primary text-3xl">cloud_done</span>
                </div>
                <div>
                    <p class="font-bold text-lg">All Synced</p>
                    <p class="text-sm" :class="isDark ? 'text-gray-400' : 'text-gray-500'">No pending offline actions
                    </p>
                </div>
            </div>

            <div v-else class="space-y-3">
                <div v-for="action in uiStore.offlineQueue" :key="action.id"
                    class="flex items-start gap-3 p-4 rounded-2xl border"
                    :class="isDark ? 'bg-surface-dark/30 border-signal-amber/20' : 'bg-amber-50 border-amber-200'">
                    <span class="material-icons text-signal-amber flex-shrink-0">sync</span>
                    <div class="flex-1">
                        <p class="text-sm font-bold">{{ action.type || 'Action' }}</p>
                        <p class="text-xs font-mono" :class="isDark ? 'text-gray-500' : 'text-gray-400'">Queued {{
                            action.queued }}</p>
                    </div>
                    <button @click="uiStore.offlineQueue.splice(uiStore.offlineQueue.indexOf(action), 1)"
                        class="text-gray-500 hover:text-red-400 transition-colors">
                        <span class="material-icons text-sm">close</span>
                    </button>
                </div>

                <button @click="syncAll"
                    class="w-full rounded-2xl h-12 flex items-center justify-center gap-2 font-bold border transition-all active:scale-[0.98]"
                    :class="isDark ? 'bg-surface-dark/30 border-primary/20 text-primary hover:bg-primary/10' : 'bg-primary/8 border-primary/20 text-primary'">
                    <span class="material-icons">cloud_sync</span>
                    Sync All Now
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue'
import { useUiStore } from '../stores/uiStore.js'

const uiStore = useUiStore()
const isDark = computed(() => uiStore.theme !== 'light')

function syncAll() {
    uiStore.clearOfflineQueue()
    uiStore.showToast('All actions synced ✓', 'success')
}
</script>
