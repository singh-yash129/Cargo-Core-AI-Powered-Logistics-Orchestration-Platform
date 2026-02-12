<template>
    <div class="fixed inset-0 z-50 pointer-events-none">
        <!-- Backdrop -->
        <transition name="fade">
            <div v-if="isOpen" @click="close" class="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto">
            </div>
        </transition>

        <!-- Sheet -->
        <transition name="slide-up">
            <div v-if="isOpen"
                class="absolute bottom-0 left-0 right-0 bg-surface-dark rounded-t-3xl border-t border-white/10 shadow-2xl pointer-events-auto max-h-[85vh] overflow-y-auto"
                :style="{ height: height || 'auto' }">
                <!-- Drag Handle -->
                <div class="w-full flex justify-center py-3" @click="close">
                    <div class="w-12 h-1.5 bg-gray-600 rounded-full"></div>
                </div>

                <!-- Content -->
                <div class="p-6 pt-0">
                    <slot></slot>
                </div>
            </div>
        </transition>
    </div>
</template>

<script setup>
defineProps({
    isOpen: Boolean,
    height: String
})

const emit = defineEmits(['update:isOpen', 'close'])

const close = () => {
    emit('update:isOpen', false)
    emit('close')
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

.slide-up-enter-active,
.slide-up-leave-active {
    transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.slide-up-enter-from,
.slide-up-leave-to {
    transform: translateY(100%);
}
</style>
