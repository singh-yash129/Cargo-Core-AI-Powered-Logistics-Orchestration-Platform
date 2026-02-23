<template>
    <div class="relative group flex items-center gap-3">
        <!-- Date & Time (Local to user for now) -->
        <div class="hidden md:flex flex-col text-right border-r border-gray-200 dark:border-white/10 pr-4">
            <span class="text-sm font-bold text-gray-900 dark:text-white leading-none">{{ currentTime }}</span>
            <span class="text-[10px] text-gray-500 uppercase tracking-widest mt-1">{{ currentDate }}</span>
        </div>

        <!-- Weather Display (Active Warehouse) -->
        <div
            class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/5 cursor-default transition-colors group-hover:bg-gray-100 dark:group-hover:bg-white/10">
            <span class="material-symbols-outlined text-gray-500 dark:text-gray-400 text-[18px]">{{ activeWeather.icon
                }}</span>
            <div>
                <div class="text-sm font-bold text-gray-700 dark:text-gray-200 leading-none">
                    {{ activeWeather.temp }}°C
                </div>
                <div class="text-[10px] text-gray-500 truncate max-w-[80px]">
                    {{ activeWeather.condition }}
                </div>
            </div>
        </div>

        <!-- Dropdown for "All Warehouses" view -->
        <div v-if="store.activeWarehouse === 'all'"
            class="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 bg-white dark:bg-card-darker border border-gray-200 dark:border-white/10 rounded-xl shadow-xl p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
            <div class="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 px-1">Global Weather</div>
            <div class="space-y-2">
                <div v-for="(weather, hubId) in allHubsWeather" :key="hubId"
                    class="flex items-center justify-between px-2 py-1.5 rounded bg-gray-50 dark:bg-white/5">
                    <div class="flex items-center gap-2">
                        <span class="material-symbols-outlined text-[14px] text-gray-400">{{ weather.icon }}</span>
                        <span class="text-xs font-medium text-gray-700 dark:text-gray-300">{{ weather.name }}</span>
                    </div>
                    <span class="text-xs font-bold text-gray-900 dark:text-white">{{ weather.temp }}°</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useLogisticStore } from '@/stores/logisticStore'

const store = useLogisticStore()

// --- Time Logic ---
const currentTime = ref('')
const currentDate = ref('')
let timeInterval = null

const updateTime = () => {
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

// --- Mock Weather Logic ---
const hubWeatherData = {
    1: { name: 'NorthEast', temp: 12, condition: 'Rain', icon: 'rainy' },
    2: { name: 'South Hub', temp: 28, condition: 'Clear', icon: 'sunny' },
    3: { name: 'West DC', temp: 19, condition: 'Cloudy', icon: 'cloud' }
}

const allHubsWeather = computed(() => hubWeatherData)

const activeWeather = computed(() => {
    if (store.activeWarehouse === 'all') {
        // Average or Global representation when all hubs selected
        return { temp: 19, condition: 'Mixed', icon: 'partly_cloudy_day' }
    }
    return hubWeatherData[store.activeWarehouse] || { temp: '--', condition: 'Unknown', icon: 'cloud_off' }
})
</script>
