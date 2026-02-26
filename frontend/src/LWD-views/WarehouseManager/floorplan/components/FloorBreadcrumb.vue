<template>
    <div
        class="flex items-center gap-2 px-4 py-2 border-b border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-black/20">
        <!-- Breadcrumb trail -->
        <div class="flex items-center gap-1 text-xs flex-1">
            <button @click="$emit('navigate', 'FLOOR')" class="font-bold transition-colors"
                :class="level !== 'FLOOR' ? 'text-primary hover:text-primary/80 cursor-pointer' : 'text-gray-900 dark:text-white'">
                <span class="material-symbols-outlined text-[14px] align-middle mr-0.5">home</span>{{ floorLabel }}
            </button>
            <template v-if="level !== 'FLOOR' && sectionLabel">
                <span class="text-gray-400">›</span>
                <button @click="$emit('navigate', 'SECTION')"
                    class="font-bold transition-colors flex items-center gap-1"
                    :class="level === 'RACK' ? 'text-primary hover:text-primary/80 cursor-pointer' : 'text-gray-900 dark:text-white'">
                    <span class="w-2 h-2 rounded-full" :style="{ background: sectionColor }"></span>
                    {{ sectionLabel }}
                </button>
                <span class="text-[10px] px-1.5 py-0.5 rounded ml-1"
                    :style="{ background: sectionColor + '20', color: sectionColor }">{{ groupName || 'Ungrouped'
                    }}</span>
            </template>
            <template v-if="level === 'RACK' && rackLabel">
                <span class="text-gray-400">›</span>
                <span class="text-gray-900 dark:text-white font-bold">{{ rackLabel }}</span>
            </template>
        </div>

        <!-- Search result navigation -->
        <div v-if="searchPathCount > 0" class="flex items-center gap-1 text-xs">
            <button @click="$emit('prev-result')"
                class="w-6 h-6 flex items-center justify-center rounded bg-gray-200 dark:bg-white/10 hover:bg-gray-300 dark:hover:bg-white/20 text-gray-700 dark:text-gray-300">
                <span class="material-symbols-outlined text-[14px]">keyboard_arrow_up</span>
            </button>
            <span class="text-gray-500 font-mono px-1">{{ currentIdx + 1 }}/{{ searchPathCount }}</span>
            <button @click="$emit('next-result')"
                class="w-6 h-6 flex items-center justify-center rounded bg-gray-200 dark:bg-white/10 hover:bg-gray-300 dark:hover:bg-white/20 text-gray-700 dark:text-gray-300">
                <span class="material-symbols-outlined text-[14px]">keyboard_arrow_down</span>
            </button>
            <button @click="$emit('clear-search')" class="ml-1 text-gray-400 hover:text-red-400">
                <span class="material-symbols-outlined text-[14px]">close</span>
            </button>
        </div>

        <!-- ESC hint -->
        <div v-if="level !== 'FLOOR'"
            class="text-[10px] text-gray-400 bg-gray-200 dark:bg-white/10 px-1.5 py-0.5 rounded font-mono">
            ESC ← back
        </div>
    </div>
</template>

<script setup>
defineProps({
    level: { type: String, default: 'FLOOR' },
    floorLabel: { type: String, default: 'Floor' },
    sectionLabel: { type: String, default: '' },
    sectionColor: { type: String, default: '#6b7280' },
    groupName: { type: String, default: '' },
    rackLabel: { type: String, default: '' },
    searchPathCount: { type: Number, default: 0 },
    currentIdx: { type: Number, default: 0 }
})

defineEmits(['navigate', 'prev-result', 'next-result', 'clear-search'])
</script>
