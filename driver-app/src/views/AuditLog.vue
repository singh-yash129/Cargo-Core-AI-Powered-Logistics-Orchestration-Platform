<template>
    <div class="screen-layout" :class="isDark ? 'bg-background-dark text-white' : 'bg-background-light text-gray-900'">

        <!-- ── HEADER ───────────────────────────────── -->
        <header class="flex-shrink-0 px-5 pt-5 pb-4 border-b" :class="isDark ? 'border-white/5' : 'border-gray-100'">
            <div class="flex items-center gap-3">
                <button @click="$router.back()" class="w-10 h-10 rounded-full flex items-center justify-center border"
                    :class="isDark ? 'bg-surface-dark border-white/5 text-gray-400' : 'bg-white border-gray-200 shadow-sm'">
                    <span class="material-icons text-xl">arrow_back</span>
                </button>
                <h1 class="text-2xl font-black tracking-tight">Audit Log</h1>
            </div>
        </header>

        <!-- ── SCROLLABLE BODY ───────────────────────── -->
        <div class="screen-body px-5 py-4 flex flex-col gap-4">

            <div v-if="isLoading" class="flex items-center justify-center py-12 opacity-40">
                <span class="material-icons text-3xl animate-spin">hourglass_empty</span>
            </div>

            <div v-else class="rounded-2xl border overflow-hidden"
                :class="isDark ? 'border-white/5' : 'border-gray-100 shadow-sm'">
                <div class="px-4 py-3 border-b"
                    :class="isDark ? 'bg-surface-dark/50 border-white/5' : 'bg-gray-50 border-gray-100'">
                    <p class="text-xs font-bold uppercase tracking-widest"
                        :class="isDark ? 'text-gray-400' : 'text-gray-500'">Today's Audit Trail (Immutable)</p>
                </div>
                <div v-if="auditEvents.length" class="divide-y" :class="isDark ? 'divide-gray-800' : 'divide-gray-100'">
                    <div v-for="event in auditEvents" :key="event.id" class="flex items-start gap-3 px-4 py-3">
                        <div class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                            :class="isDark ? 'bg-surface-dark' : 'bg-gray-50'">
                            <span class="material-icons text-sm" :class="event.color">{{ event.icon }}</span>
                        </div>
                        <div class="flex-1 min-w-0">
                            <p class="text-sm font-semibold">{{ event.action }}</p>
                            <p class="text-xs" :class="isDark ? 'text-gray-500' : 'text-gray-400'">{{ event.detail }}
                            </p>
                        </div>
                        <span class="text-[10px] font-mono flex-shrink-0"
                            :class="isDark ? 'text-gray-600' : 'text-gray-400'">{{ event.time }}</span>
                    </div>
                </div>
                <div v-else class="flex flex-col items-center justify-center py-10 opacity-40">
                    <span class="material-icons text-3xl mb-2">history</span>
                    <p class="text-sm">No audit events for today</p>
                </div>
            </div>

            <p class="text-center text-xs" :class="isDark ? 'text-gray-600' : 'text-gray-400'">
                All entries are cryptographically signed and non-editable
            </p>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUiStore } from '../stores/uiStore.js'
import * as api from '../services/api.js'

const uiStore = useUiStore()
const isDark = computed(() => uiStore.theme !== 'light')

const auditEvents = ref([])
const isLoading = ref(true)

onMounted(async () => {
    try {
        auditEvents.value = await api.getDriverAuditLog()
    } catch (err) {
        uiStore.showToast('Could not load audit log', 'error', 2000)
    } finally {
        isLoading.value = false
    }
})
</script>
