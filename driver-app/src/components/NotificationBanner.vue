<template>
    <!-- In-App Notification Banner — slides down from top -->
    <Teleport to="body">
        <Transition name="notif-slide">
            <div v-if="banner" @click="handleTap"
                class="fixed top-0 left-0 right-0 z-[9999] pointer-events-auto"
                style="padding-top: env(safe-area-inset-top, 0px);">
                <div class="mx-3 mt-2 p-4 rounded-2xl border backdrop-blur-xl shadow-2xl flex items-start gap-3 cursor-pointer active:scale-[0.98] transition-transform"
                    :class="bannerClass">
                    <!-- Icon -->
                    <div class="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" :class="iconBg">
                        <span class="material-icons text-lg" :class="iconColor">{{ iconName }}</span>
                    </div>
                    <!-- Content -->
                    <div class="flex-1 min-w-0">
                        <p class="text-sm font-bold truncate">{{ banner.title }}</p>
                        <p class="text-xs mt-0.5 opacity-70 truncate">{{ banner.body }}</p>
                        <p class="text-[10px] mt-1 opacity-40">{{ timeAgo }}</p>
                    </div>
                    <!-- Dismiss -->
                    <button @click.stop="$emit('dismiss')"
                        class="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 opacity-40 hover:opacity-70">
                        <span class="material-icons text-sm">close</span>
                    </button>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<script setup>
import { computed } from 'vue'
import { useUiStore } from '../stores/uiStore.js'

const props = defineProps({
    banner: { type: Object, default: null }
})

defineEmits(['dismiss', 'tap'])

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

const cfg = computed(() => typeConfig[props.banner?.type] || typeConfig.info)
const iconName = computed(() => cfg.value.icon)
const iconBg = computed(() => cfg.value.bg)
const iconColor = computed(() => cfg.value.color)

const bannerClass = computed(() =>
    isDark.value
        ? 'bg-surface-dark/95 border-white/10 text-white'
        : 'bg-white/95 border-gray-200 text-gray-900'
)

const timeAgo = computed(() => {
    if (!props.banner?.timestamp) return ''
    return 'just now'
})

function handleTap() {
    // Parent handles navigation via banner.route
}
</script>

<style scoped>
.notif-slide-enter-active {
    transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.25s ease;
}
.notif-slide-leave-active {
    transition: transform 0.25s ease, opacity 0.2s ease;
}
.notif-slide-enter-from {
    transform: translateY(-100%);
    opacity: 0;
}
.notif-slide-leave-to {
    transform: translateY(-100%);
    opacity: 0;
}
</style>
