<template>
    <div class="camera-layout">
        <RouterView />
    </div>
</template>

<script setup>
// Full-screen camera shell — no navigation, no bottom bar, no status gap.
// The RouterView here hosts CameraQrView / CameraPhotoView / CameraOcrView.
</script>

<style>
/* The layout itself must be transparent so the native CameraPreview renders through */
.camera-layout {
    position: fixed;
    inset: 0;
    background: transparent;
    z-index: 9999;
    display: flex;
    flex-direction: column;
}

/* Make the entire WebView chain transparent when camera is active */
html.camera-active,
html.camera-active body,
html.camera-active #app {
    background: transparent !important;
    background-color: transparent !important;
}
</style>
