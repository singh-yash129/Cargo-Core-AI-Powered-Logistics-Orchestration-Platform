<template>
    <transition name="slide-up">
        <div v-if="visible"
            class="fixed bottom-24 left-4 right-4 z-[90] bg-surface-dark/95 backdrop-blur-xl border border-accent-gold/30 rounded-2xl shadow-2xl p-4 flex items-center gap-4">
            <div class="w-12 h-12 rounded-full bg-accent-gold/20 flex items-center justify-center shrink-0">
                <span class="material-icons text-accent-gold text-2xl">star</span>
            </div>
            <div class="flex-1">
                <h3 class="text-white font-bold text-sm">New 5-Star Rating!</h3>
                <p class="text-gray-300 text-xs mt-1">"Excellent service, very polite driver!"</p>
                <div class="flex items-center gap-1 mt-1">
                    <span v-for="i in 5" :key="i" class="material-icons text-accent-gold text-[10px]">star</span>
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

const visible = ref(false)

const dismiss = () => {
    visible.value = false
}

// Expose trigger
const triggerRating = () => {
    visible.value = true
    // Auto dismiss after 5s
    setTimeout(() => {
        if (visible.value) visible.value = false
    }, 5000)
}

// Simulate random rating
onMounted(() => {
    setTimeout(() => {
        triggerRating()
    }, 60000) // Trigger after 60s
})

defineExpose({ triggerRating })
</script>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.slide-up-enter-from,
.slide-up-leave-to {
    transform: translateY(120%);
    opacity: 0;
}
</style>
