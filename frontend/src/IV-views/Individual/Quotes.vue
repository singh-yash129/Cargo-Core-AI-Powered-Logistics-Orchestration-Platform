<template>
    <div class="space-y-6">
        <h2 class="text-2xl font-bold text-white">My Quotes</h2>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div v-for="quote in quotes" :key="quote.id"
                class="glass-panel p-6 rounded-xl border border-white/5 hover:border-primary/50 transition-colors group relative overflow-hidden">
                <div class="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <span class="material-symbols-outlined text-8xl">format_quote</span>
                </div>

                <div class="flex justify-between items-start mb-4">
                    <div>
                        <div class="text-sm text-gray-400 mb-1">Quote ID</div>
                        <div class="font-mono font-bold text-white">{{ quote.id }}</div>
                    </div>
                    <div class="text-right">
                        <div class="text-sm text-gray-400 mb-1">Valid Until</div>
                        <div class="text-white">{{ quote.expiry }}</div>
                    </div>
                </div>

                <div class="border-y border-white/10 py-4 my-4 space-y-2">
                    <div class="flex items-center gap-2">
                        <span class="material-symbols-outlined text-gray-500 text-sm">grid_view</span>
                        <span class="text-white">{{ quote.items }} Items</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="material-symbols-outlined text-gray-500 text-sm">distance</span>
                        <span class="text-white">{{ quote.distance }}</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="material-symbols-outlined text-gray-500 text-sm">group</span>
                        <span class="text-white">{{ quote.labor }} Helpers</span>
                    </div>
                </div>

                <div class="flex justify-between items-end">
                    <div>
                        <div class="text-sm text-gray-400">Total Estimate</div>
                        <div class="text-2xl font-bold text-primary">{{ quote.price }}</div>
                    </div>
                    <button
                        class="bg-primary hover:bg-primary-dark text-background-dark font-bold py-2 px-6 rounded-lg transition-colors">Book
                        Now</button>
                </div>
            </div>

            <!-- Generate New Card -->
            <div class="glass-panel p-6 rounded-xl border border-dashed border-white/20 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-white/5 transition-colors min-h-[300px]"
                @click="$router.push('/individual/book-move')">
                <div class="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                    <span class="material-symbols-outlined text-3xl text-gray-400">add</span>
                </div>
                <h3 class="font-bold text-white mb-2">Get New Quote</h3>
                <p class="text-sm text-gray-400 max-w-xs">Answer a few questions to get an instant price estimate for
                    your move.</p>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'

const quotes = ref([
    { id: 'QT-9921', expiry: 'Nov 12, 2024', items: '2 Bedroom Apt', distance: '15 km', labor: 2, price: '$245.00' },
    { id: 'QT-9924', expiry: 'Nov 15, 2024', items: 'Sofa & Bed', distance: '5 km', labor: 1, price: '$85.00' },
])
</script>
