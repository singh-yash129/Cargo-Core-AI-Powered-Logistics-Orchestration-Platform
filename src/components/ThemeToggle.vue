<template>
  <button
    class="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
    @click="toggleTheme"
  >
    <span class="material-symbols-outlined text-[18px] text-gray-600 dark:text-gray-200">
      {{ isDark ? 'light_mode' : 'dark_mode' }}
    </span>
  </button>
</template>

<script setup>
import { onMounted, ref } from 'vue'

const isDark = ref(true)

function applyTheme(value) {
  isDark.value = value
  document.documentElement.classList.toggle('dark', value)
  localStorage.theme = value ? 'dark' : 'light'
}

function toggleTheme() {
  applyTheme(!isDark.value)
}

onMounted(() => {
  applyTheme(localStorage.theme !== 'light')
})
</script>
