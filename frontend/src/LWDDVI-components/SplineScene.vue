<template>
    <div class="relative w-full h-full" :class="className">
        <!-- Loading State -->
        <transition name="fade">
            <div v-if="loading"
                class="absolute inset-0 flex items-center justify-center bg-transparent z-10 pointer-events-none">
                <div class="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin">
                </div>
            </div>
        </transition>

        <!-- Spline Viewer -->
        <spline-viewer ref="splineElement" :url="scene" class="w-full h-full" @load="onLoad"
            loading-anim-type="none"></spline-viewer>

        <!-- Spline Logo Overlay with Branding -->
        <div
            class="absolute bottom-[21px] right-[24px] bg-black/80 backdrop-blur-sm px-[18px] py-[9px] rounded-lg z-20 flex items-center justify-center border border-white/10 pointer-events-none">
            <span class="text-white text-xs font-bold tracking-widest uppercase">Cargo - Core</span>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import '@splinetool/viewer'

const props = defineProps({
    scene: {
        type: String,
        required: true
    },
    className: {
        type: String,
        default: ''
    }
})

const loading = ref(true)
const splineElement = ref(null)

const onLoad = (e) => {
    loading.value = false
}

onMounted(() => {
    const el = splineElement.value
    if (el) {
        el.addEventListener('load', onLoad)
    }

    setTimeout(() => { loading.value = false }, 8000)
})
</script>

<style scoped>
.fade-leave-active {
    transition: opacity 0.5s ease;
}

.fade-leave-to {
    opacity: 0;
}
</style>
