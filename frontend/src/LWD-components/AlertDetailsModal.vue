<template>
    <BaseModal :is-open="isOpen" @close="$emit('close')">
        <template #title>
            <div class="flex items-center gap-2">
                <span class="material-symbols-outlined" :class="getSeverityClass(alert?.severity)">
                    {{ alert?.icon || 'info' }}
                </span>
                {{ alert?.title || 'Alert Details' }}
            </div>
        </template>

        <div v-if="alert" class="space-y-4">
            <div class="p-3 bg-white/5 rounded-lg border border-white/5">
                <div class="text-xs text-gray-400 mb-1">Description</div>
                <div class="text-sm text-gray-200">{{ alert.description }}</div>
            </div>

            <div class="grid grid-cols-2 gap-4">
                <div class="p-3 bg-white/5 rounded-lg border border-white/5">
                    <div class="text-xs text-gray-400 mb-1">Location</div>
                    <div class="text-sm text-white font-medium">{{ alert.location }}</div>
                </div>
                <div class="p-3 bg-white/5 rounded-lg border border-white/5">
                    <div class="text-xs text-gray-400 mb-1">Time Reported</div>
                    <div class="text-sm text-white font-medium">{{ alert.timestamp }}</div>
                </div>
            </div>

            <div v-if="alert.recommendation" class="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <div class="flex items-start gap-2">
                    <span class="material-symbols-outlined text-blue-400 text-sm mt-0.5">lightbulb</span>
                    <div>
                        <div class="text-xs text-blue-300 font-bold mb-1">AI Recommendation</div>
                        <div class="text-sm text-blue-100">{{ alert.recommendation }}</div>
                    </div>
                </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex flex-col gap-2 pt-2">
                <button @click="handleAction('acknowledge')"
                    class="w-full py-2 bg-primary hover:bg-primary-dark text-white rounded-lg font-medium text-sm transition-colors">
                    Acknowledge & Assign Team
                </button>
                <button @click="handleAction('ignore')"
                    class="w-full py-2 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg font-medium text-sm transition-colors border border-white/5">
                    Dismiss Alert
                </button>
            </div>
        </div>
    </BaseModal>
</template>

<script setup>
import BaseModal from '../components/BaseModal.vue'

const props = defineProps({
    isOpen: Boolean,
    alert: Object
})

const emit = defineEmits(['close', 'action'])

function getSeverityClass(severity) {
    switch (severity) {
        case 'high': return 'text-red-500'
        case 'medium': return 'text-yellow-500'
        default: return 'text-blue-500'
    }
}

function handleAction(type) {
    emit('action', { type, alertId: props.alert.id })
}
</script>
