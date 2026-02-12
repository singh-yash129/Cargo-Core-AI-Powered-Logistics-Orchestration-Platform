<template>
    <div @click="toggle"
        class="flex items-center justify-between p-4 rounded-xl bg-surface-dark border border-white/5 active:scale-[0.98] transition-all cursor-pointer"
        :class="{ 'border-primary/30 bg-primary/5': checked }">
        <div class="flex items-center gap-3">
            <div class="w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors"
                :class="checked ? 'bg-primary border-primary' : 'border-gray-500'">
                <span v-if="checked" class="material-icons text-black text-sm font-bold">check</span>
            </div>
            <span class="font-medium" :class="{ 'text-gray-400 line-through': checked }">{{ label }}</span>
        </div>
        <span v-if="icon" class="material-icons text-gray-500">{{ icon }}</span>
    </div>
</template>

<script setup>
const props = defineProps({
    label: String,
    modelValue: Boolean,
    icon: String
})

const emit = defineEmits(['update:modelValue'])

const toggle = () => {
    emit('update:modelValue', !props.modelValue)
}
</script>
