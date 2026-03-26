<template>
    <Transition name="toast">
        <div v-if="uiStore.toast" :key="uiStore.toast.id"
            class="fixed bottom-24 left-4 right-4 z-[200] flex justify-center pointer-events-none">
            <div class="flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl backdrop-blur-xl border text-sm font-semibold max-w-sm w-full"
                :class="{
                    'bg-primary/15 border-primary/30 text-primary': uiStore.toast.type === 'success',
                    'bg-red-500/15 border-red-500/30 text-red-400': uiStore.toast.type === 'error',
                    'bg-accent-blue/15 border-accent-blue/30 text-accent-blue': uiStore.toast.type === 'info',
                    'bg-signal-amber/15 border-signal-amber/30 text-signal-amber': uiStore.toast.type === 'warning',
                }">
                <span class="material-icons text-lg">
                    {{ toastIcon }}
                </span>
                <span class="flex-1">{{ uiStore.toast.message }}</span>
            </div>
        </div>
    </Transition>
</template>

<script setup>
import { computed } from 'vue'
import { useUiStore } from '../stores/uiStore.js'

const uiStore = useUiStore()
const toastIcon = computed(() => {
    const t = uiStore.toast?.type
    if (t === 'success') return 'check_circle'
    if (t === 'error') return 'error'
    if (t === 'warning') return 'warning'
    return 'info'
})
</script>

<style scoped>
.toast-enter-active {
    animation: toastIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.toast-leave-active {
    animation: toastIn 0.2s ease-in reverse;
}

@keyframes toastIn {
    from {
        opacity: 0;
        transform: translateY(16px) scale(0.95);
    }

    to {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}
</style>
