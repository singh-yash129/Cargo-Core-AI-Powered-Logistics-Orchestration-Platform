<template>
    <div class="screen-body flex flex-col h-full" :class="isDark ? 'bg-background-dark' : 'bg-background-light'">

        <!-- Header -->
        <div class="flex items-center justify-between px-5 pt-5 pb-3">
            <div class="flex items-center gap-3">
                <button @click="router.back()"
                    class="w-10 h-10 rounded-xl flex items-center justify-center"
                    :class="isDark ? 'bg-white/10' : 'bg-gray-100'">
                    <span class="material-icons text-xl">arrow_back</span>
                </button>
                <div>
                    <h1 class="text-lg font-bold">Notifications</h1>
                    <p class="text-xs opacity-50">{{ notificationStore.unreadCount }} unread</p>
                </div>
            </div>
            <button v-if="notificationStore.notifications.length" @click="handleClearAll"
                class="text-xs font-semibold px-3 py-1.5 rounded-lg"
                :class="isDark ? 'bg-white/10 text-white/70' : 'bg-gray-100 text-gray-600'">
                {{ notificationStore.unreadCount > 0 ? 'Mark all read' : 'Clear all' }}
            </button>
        </div>

        <!-- Notification List -->
        <div class="flex-1 overflow-y-auto px-4 pb-6 space-y-2">
            <TransitionGroup name="notif-list">
                <div v-for="n in notificationStore.notifications" :key="n.id"
                    @click="handleTap(n)"
                    class="p-4 rounded-2xl border flex items-start gap-3 cursor-pointer transition-all active:scale-[0.98]"
                    :class="[
                        isDark ? 'border-white/5' : 'border-gray-100',
                        n.read
                            ? isDark ? 'bg-white/[0.02]' : 'bg-gray-50/50'
                            : isDark ? 'bg-white/[0.06]' : 'bg-white'
                    ]">
                    <!-- Icon -->
                    <div class="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                        :class="typeConfig[n.type]?.bg || 'bg-accent-blue/15'">
                        <span class="material-icons text-lg"
                            :class="typeConfig[n.type]?.color || 'text-accent-blue'">
                            {{ typeConfig[n.type]?.icon || 'info' }}
                        </span>
                    </div>

                    <!-- Content -->
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2">
                            <p class="text-sm font-semibold truncate" :class="{ 'font-bold': !n.read }">
                                {{ n.title }}
                            </p>
                            <span v-if="!n.read" class="w-2 h-2 rounded-full bg-primary flex-shrink-0"></span>
                        </div>
                        <p class="text-xs mt-0.5 opacity-60 line-clamp-2">{{ n.body }}</p>
                        <p class="text-[10px] mt-1.5 opacity-35">{{ formatTime(n.timestamp) }}</p>
                    </div>

                    <!-- Swipe / Delete -->
                    <button @click.stop="notificationStore.removeNotification(n.id)"
                        class="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 opacity-30 hover:opacity-60">
                        <span class="material-icons text-sm">close</span>
                    </button>
                </div>
            </TransitionGroup>

            <!-- Empty State -->
            <div v-if="!notificationStore.notifications.length"
                class="flex flex-col items-center justify-center pt-20 opacity-40">
                <span class="material-icons text-5xl mb-3">notifications_none</span>
                <p class="text-sm font-medium">No notifications yet</p>
                <p class="text-xs mt-1">You'll see delivery updates, alerts & more here</p>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useNotificationStore } from '../stores/notificationStore.js'
import { useUiStore } from '../stores/uiStore.js'

const router = useRouter()
const notificationStore = useNotificationStore()
const uiStore = useUiStore()
const isDark = computed(() => uiStore.theme !== 'light')

const typeConfig = {
    info: { icon: 'info', bg: 'bg-accent-blue/15', color: 'text-accent-blue' },
    success: { icon: 'check_circle', bg: 'bg-primary/15', color: 'text-primary' },
    warning: { icon: 'warning', bg: 'bg-signal-amber/15', color: 'text-signal-amber' },
    error: { icon: 'error', bg: 'bg-red-500/15', color: 'text-red-400' },
    delivery: { icon: 'local_shipping', bg: 'bg-primary/15', color: 'text-primary' },
    navigation: { icon: 'near_me', bg: 'bg-accent-blue/15', color: 'text-accent-blue' },
    system: { icon: 'settings', bg: 'bg-gray-500/15', color: 'text-gray-400' },
}

function handleTap(n) {
    notificationStore.markAsRead(n.id)
    if (n.route) {
        router.push(n.route)
    }
}

function handleClearAll() {
    if (notificationStore.unreadCount > 0) {
        notificationStore.markAllRead()
    } else {
        notificationStore.clearAll()
    }
}

function formatTime(iso) {
    if (!iso) return ''
    const diff = Date.now() - new Date(iso).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'Just now'
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    const days = Math.floor(hrs / 24)
    return `${days}d ago`
}
</script>

<style scoped>
.notif-list-enter-active { transition: all 0.3s ease; }
.notif-list-leave-active { transition: all 0.25s ease; }
.notif-list-enter-from { opacity: 0; transform: translateX(-20px); }
.notif-list-leave-to { opacity: 0; transform: translateX(20px); }
.notif-list-move { transition: transform 0.3s ease; }
</style>
