<template>
    <transition name="slide-down">
        <div v-if="visible"
            class="fixed top-4 left-4 right-4 z-[90] bg-surface-dark/95 backdrop-blur-xl border border-primary/30 rounded-2xl shadow-2xl p-4 flex items-start gap-4">
            <div class="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center shrink-0 animate-pulse">
                <span class="material-icons text-primary text-2xl">alt_route</span>
            </div>
            <div class="flex-1">
                <h3 class="text-white font-bold text-sm">Route Updated</h3>
                <p class="text-gray-300 text-xs mt-1">Dispatcher added <strong>1 New Stop</strong> to your queue.</p>
                <div class="flex gap-2 mt-3">
                    <button @click="acknowledge"
                        class="flex-1 bg-primary text-black text-xs font-bold py-2 rounded-lg hover:bg-primary-dark transition-colors">
                        Accept & View
                    </button>
                    <button @click="dismiss"
                        class="px-3 py-2 text-xs text-gray-400 font-medium hover:text-white transition-colors">
                        Dismiss
                    </button>
                </div>
            </div>
            <button @click="dismiss" class="text-gray-500 hover:text-white">
                <span class="material-icons text-sm">close</span>
            </button>
        </div>
    </transition>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const visible = ref(false)

const acknowledge = () => {
    visible.value = false
    router.push('/manifest')
    // In real app, re-fetch manifest
}

const dismiss = () => {
    visible.value = false
}

// Expose trigger
const triggerUpdate = () => {
    visible.value = true
    // Auto dismiss after 10s
    setTimeout(() => {
        if (visible.value) visible.value = false
    }, 10000)
}

// Simulate random update
onMounted(() => {
    setTimeout(() => {
        triggerUpdate()
    }, 45000) // Trigger once after 45s
})

defineExpose({ triggerUpdate })
</script>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.slide-down-enter-from,
.slide-down-leave-to {
    transform: translateY(-120%);
    opacity: 0;
}
</style>
