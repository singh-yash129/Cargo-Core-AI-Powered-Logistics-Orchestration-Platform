<template>
  <!-- Full-screen wrapper for public routes (splash, login, login-help).
       No bottom navigation. Pages own their entire layout including safe areas. -->
  <div class="public-layout" :class="themeClass">
    <RouterView v-slot="{ Component }">
      <Transition name="route" mode="out-in">
        <component :is="Component" :key="$route.path" />
      </Transition>
    </RouterView>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useUiStore } from '../stores/uiStore.js'

const uiStore = useUiStore()

const themeClass = computed(() =>
  uiStore.theme === 'light'
    ? 'light bg-background-light text-gray-900'
    : 'dark bg-background-dark text-white'
)
</script>

<style scoped>
.public-layout {
  display: flex;
  flex-direction: column;
  /* Full screen including status bar — public pages handle their own safe areas */
  height: 100dvh;
  width: 100vw;
  overflow: hidden;
}
</style>
