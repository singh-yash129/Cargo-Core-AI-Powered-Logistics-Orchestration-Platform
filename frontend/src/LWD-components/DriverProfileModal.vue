<template>
    <BaseModal :is-open="isOpen" @close="$emit('close')">
        <template #title>Driver Profile</template>

        <div v-if="driver" class="space-y-6">
            <!-- Header Profile -->
            <div class="flex items-center gap-4">
                <div class="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-white shadow-lg ring-2 ring-white/10"
                    :class="driver.avatarColor || 'bg-gray-700'">
                    {{ driver.name.charAt(0) }}
                </div>
                <div>
                    <h2 class="text-xl font-bold text-white">{{ driver.name }}</h2>
                    <div class="flex items-center gap-2 mt-1">
                        <span class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border"
                            :class="getStatusClass(driver.status)">
                            {{ driver.status }}
                        </span>
                        <span class="text-gray-400 text-xs">• ID: {{ driver.id }}</span>
                    </div>
                </div>
            </div>

            <!-- Stats Grid -->
            <div class="grid grid-cols-2 gap-3">
                <div class="p-3 bg-white/5 rounded-xl border border-white/5">
                    <div class="text-xs text-gray-500">Current Vehicle</div>
                    <div class="text-lg font-semibold text-white mt-1">{{ driver.vehicle }}</div>
                </div>
                <div class="p-3 bg-white/5 rounded-xl border border-white/5">
                    <div class="text-xs text-gray-500">Efficiency Score</div>
                    <div class="text-lg font-semibold text-green-400 mt-1">{{ driver.efficiency }}%</div>
                </div>
            </div>

            <!-- Current Status -->
            <div class="p-4 bg-white/5 rounded-xl border border-white/5 space-y-3">
                <div class="flex justify-between items-center text-sm border-b border-white/5 pb-2">
                    <span class="text-gray-400">Current Job</span>
                    <span class="text-white">{{ driver.currentJob }}</span>
                </div>
                <div class="flex justify-between items-center text-sm border-b border-white/5 pb-2">
                    <span class="text-gray-400">Location</span>
                    <span class="text-white flex items-center gap-1">
                        <span class="material-symbols-outlined text-[16px]">location_on</span>
                        {{ driver.location }}
                    </span>
                </div>
                <div class="flex justify-between items-center text-sm">
                    <span class="text-gray-400">Phone</span>
                    <a href="#" class="text-primary hover:underline">{{ driver.phone }}</a>
                </div>
            </div>

            <!-- Quick Actions -->
            <div class="grid grid-cols-2 gap-3">
                <button
                    class="flex items-center justify-center gap-2 py-2.5 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-white transition-colors border border-white/5">
                    <span class="material-symbols-outlined text-[18px]">call</span>
                    Call Driver
                </button>
                <button
                    class="flex items-center justify-center gap-2 py-2.5 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-white transition-colors border border-white/5">
                    <span class="material-symbols-outlined text-[18px]">chat</span>
                    Message
                </button>
            </div>
        </div>
    </BaseModal>
</template>

<script setup>
import BaseModal from '../components/BaseModal.vue'

defineProps({
    isOpen: Boolean,
    driver: Object
})

defineEmits(['close'])

function getStatusClass(status) {
    if (!status) return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    switch (status.toLowerCase()) {
        case 'active': return 'bg-green-500/20 text-green-400 border-green-500/30'
        case 'breakdown': return 'bg-red-500/20 text-red-400 border-red-500/30'
        case 'delayed': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
        default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
}
</script>
