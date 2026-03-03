<template>
    <div class="spline-wrapper" :class="className">
        <!-- Loading State -->
        <transition name="fade">
            <div v-if="loading" class="spline-loading">
                <div class="spline-spinner"></div>
            </div>
        </transition>

        <!-- Spline Viewer -->
        <spline-viewer ref="splineElement" :url="scene" class="spline-canvas" loading-anim-type="none"></spline-viewer>

        <!-- Branding overlay (hides default Spline watermark area) -->
        <div class="branding">
            <span>Cargo-Core</span>
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
/* Root wrapper fills whatever container it lives in */
.spline-wrapper {
    position: relative;
    width: 100%;
    height: 100%;
}

/* The web-component canvas must stretch to fill the wrapper */
.spline-canvas {
    display: block;
    width: 100%;
    height: 100%;
}

/* Loading spinner */
.spline-loading {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
    pointer-events: none;
}

.spline-spinner {
    width: 48px;
    height: 48px;
    border: 4px solid rgba(139, 92, 246, 0.3);
    border-top-color: rgba(139, 92, 246, 1);
    border-radius: 50%;
    animation: spin 0.9s linear infinite;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

/* Tiny branding pill — covers the Spline watermark */
.branding {
    position: absolute;
    bottom: 21px;
    right: 10px;
    z-index: 20;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 6px 14px;
    background: rgba(0, 0, 0, 0.75);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    pointer-events: none;
    backdrop-filter: blur(200px);
    width: 150px;
    height: 35px;
    
}

.branding span {
    color: #fff;
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 0.15em;
    text-transform: uppercase;
}

/* Fade-out transition for loading overlay */
.fade-leave-active {
    transition: opacity 0.5s ease;
}

.fade-leave-to {
    opacity: 0;
}
</style>
