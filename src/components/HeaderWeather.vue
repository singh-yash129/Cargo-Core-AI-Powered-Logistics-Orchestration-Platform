<template>
  <div class="relative flex items-center gap-3">
    <div class="hidden md:flex flex-col text-right border-r border-gray-200 dark:border-white/10 pr-4">
      <span class="text-sm font-bold text-gray-900 dark:text-white leading-none">{{ currentTime }}</span>
      <span class="text-[10px] text-gray-500 uppercase tracking-widest mt-1">{{ currentDate }}</span>
    </div>

    <div class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/5">
      <span class="material-symbols-outlined text-gray-500 dark:text-gray-400 text-[18px]">{{ weather.icon }}</span>
      <div>
        <div class="text-sm font-bold text-gray-700 dark:text-gray-200 leading-none">{{ weather.temp }}°C</div>
        <div class="text-[10px] text-gray-500 truncate max-w-[80px]">{{ weather.condition }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue'

const currentTime = ref('')
const currentDate = ref('')
const weather = ref({ temp: 28, condition: 'Clear', icon: 'sunny' })

let timeInterval = null

function updateTime() {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  currentDate.value = now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })
}

onMounted(() => {
  updateTime()
  timeInterval = setInterval(updateTime, 1000)
})

onUnmounted(() => {
  if (timeInterval) clearInterval(timeInterval)
})
</script>
