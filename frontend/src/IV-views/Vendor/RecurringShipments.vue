<template>
    <div class="space-y-6">
        <div class="flex justify-between items-center">
            <h2 class="text-2xl font-bold text-white">Recurring Shipments</h2>
            <button
                class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold transition-colors flex items-center gap-2">
                <span class="material-symbols-outlined">add</span> Create Schedule
            </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div v-for="rule in rules" :key="rule.id" class="glass-panel p-6 rounded-xl border-l-4"
                :class="rule.active ? 'border-blue-500' : 'border-gray-600 opacity-75'">
                <div class="flex justify-between items-start mb-4">
                    <div class="px-2 py-1 rounded bg-white/5 text-xs font-bold text-gray-300">{{ rule.frequency }}</div>
                    <div class="flex gap-2">
                        <button class="text-gray-400 hover:text-white"><span
                                class="material-symbols-outlined text-sm">edit</span></button>
                        <button class="text-gray-400 hover:text-red-400"><span
                                class="material-symbols-outlined text-sm">delete</span></button>
                    </div>
                </div>

                <h3 class="font-bold text-white text-lg mb-1">{{ rule.name }}</h3>
                <p class="text-sm text-gray-400 mb-4">{{ rule.description }}</p>

                <div class="space-y-2 mb-6">
                    <div class="flex items-center gap-2 text-sm text-gray-300">
                        <span class="material-symbols-outlined text-xs">arrow_forward</span>
                        {{ rule.route }}
                    </div>
                    <div class="flex items-center gap-2 text-sm text-gray-300">
                        <span class="material-symbols-outlined text-xs">inventory_2</span>
                        {{ rule.details }}
                    </div>
                </div>

                <div class="flex justify-between items-center border-t border-white/5 pt-4">
                    <div class="text-xs text-gray-500">Next: {{ rule.nextRun }}</div>
                    <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" v-model="rule.active" class="sr-only peer">
                        <div
                            class="w-9 h-5 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600">
                        </div>
                    </label>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'

const rules = ref([
    { id: 1, name: 'Weekly Restock - NY Store', description: 'Standard inventory replenishment for downtown branch.', frequency: 'Every Monday', route: 'Hub A -> Store #402', details: '12 Pallets • General Goods', nextRun: 'Oct 28', active: true },
    { id: 2, name: 'Monthly Supplies - HQ', description: 'Office supplies and pantry restock.', frequency: '1st of Month', route: 'Hub B -> Corporate HQ', details: '5 Boxes', nextRun: 'Nov 01', active: true },
    { id: 3, name: 'Daily Grocery - Fresh', description: 'Perishable goods delivery.', frequency: 'Daily @ 5AM', route: 'Puntac -> Distribution C', details: 'Refrigerated Truck', nextRun: 'Tomorrow', active: false },
])
</script>
