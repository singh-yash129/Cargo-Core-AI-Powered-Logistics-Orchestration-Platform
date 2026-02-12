<template>
    <div class="space-y-6">
        <h2 class="text-2xl font-bold text-white">Book a Move</h2>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Main Form -->
            <div class="lg:col-span-2 space-y-6">
                <!-- Section 1: Cargo Type -->
                <div class="glass-panel p-6 rounded-xl">
                    <h3 class="font-bold text-white mb-4">1. Select Cargo Type</h3>
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <button v-for="type in cargoTypes" :key="type.name"
                            class="p-4 rounded-xl border border-white/10 hover:border-primary/50 transition-all flex flex-col items-center gap-2 group"
                            :class="selectedCargo === type.name ? 'bg-primary/10 border-primary' : 'bg-white/5'"
                            @click="selectedCargo = type.name">
                            <span class="material-symbols-outlined text-3xl"
                                :class="selectedCargo === type.name ? 'text-primary' : 'text-gray-500 group-hover:text-white'">{{
                                type.icon }}</span>
                            <span class="text-sm font-medium"
                                :class="selectedCargo === type.name ? 'text-white' : 'text-gray-400'">{{ type.name
                                }}</span>
                        </button>
                    </div>
                </div>

                <!-- Section 2: Service Customization -->
                <div class="glass-panel p-6 rounded-xl">
                    <h3 class="font-bold text-white mb-4">2. Customize Service</h3>

                    <!-- Packing Service -->
                    <div class="mb-6">
                        <label class="block text-sm text-gray-400 mb-2">Packing Service</label>
                        <div class="flex gap-4">
                            <label
                                class="flex items-center gap-3 p-3 rounded-lg border border-white/10 bg-white/5 cursor-pointer hover:bg-white/10 flex-1">
                                <input type="radio" name="packing"
                                    class="text-primary focus:ring-primary bg-black/20 border-white/20">
                                <span class="text-white text-sm">I will pack myself</span>
                            </label>
                            <label
                                class="flex items-center gap-3 p-3 rounded-lg border border-white/10 bg-white/5 cursor-pointer hover:bg-white/10 flex-1">
                                <input type="radio" name="packing"
                                    class="text-primary focus:ring-primary bg-black/20 border-white/20" checked>
                                <span class="text-white text-sm">Packing Team Required</span>
                            </label>
                        </div>
                    </div>

                    <!-- Labor & Material -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label class="block text-sm text-gray-400 mb-2">Additional Labor</label>
                            <div class="flex items-center gap-4">
                                <button
                                    class="w-10 h-10 rounded bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-xl"
                                    @click="laborCount > 0 ? laborCount-- : null">-</button>
                                <span class="text-xl font-bold text-white">{{ laborCount }}</span>
                                <button
                                    class="w-10 h-10 rounded bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-xl"
                                    @click="laborCount++">+</button>
                            </div>
                        </div>
                        <div>
                            <label class="block text-sm text-gray-400 mb-2">Packing Materials</label>
                            <div class="space-y-2">
                                <div class="flex justify-between items-center text-sm text-gray-300">
                                    <span>Carton Boxes (Large)</span>
                                    <input type="number" value="10"
                                        class="w-16 bg-black/20 border border-white/10 rounded px-2 py-1 text-right">
                                </div>
                                <div class="flex justify-between items-center text-sm text-gray-300">
                                    <span>Bubble Wrap (Rolls)</span>
                                    <input type="number" value="2"
                                        class="w-16 bg-black/20 border border-white/10 rounded px-2 py-1 text-right">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Section 3: AI Volume Estimator -->
                <div class="glass-panel p-6 rounded-xl border border-purple-500/30 relative overflow-hidden">
                    <div class="absolute right-0 top-0 p-4 opacity-10"><span
                            class="material-symbols-outlined text-6xl">psychology</span></div>
                    <h3 class="font-bold text-white mb-2 flex items-center gap-2">
                        <span class="material-symbols-outlined text-purple-400">camera_enhance</span> 3. AI Volume
                        Estimator
                    </h3>
                    <p class="text-sm text-gray-400 mb-4">Upload a photo of your room to get an accurate box count.</p>

                    <div
                        class="border-2 border-dashed border-white/20 rounded-xl p-8 flex flex-col items-center justify-center hover:bg-white/5 transition-colors cursor-pointer text-gray-400 hover:text-white">
                        <span class="material-symbols-outlined text-4xl mb-2">cloud_upload</span>
                        <span class="text-sm font-bold">Click to Upload Photo</span>
                    </div>
                </div>
            </div>

            <!-- Price Preview Sidebar -->
            <div class="glass-panel p-6 rounded-xl flex flex-col h-fit sticky top-6">
                <h3 class="font-bold text-white mb-6">Estimated Cost</h3>

                <div class="space-y-4 mb-6">
                    <div class="flex justify-between text-sm">
                        <span class="text-gray-400">Base Fare (15km)</span>
                        <span class="text-white font-mono">$120</span>
                    </div>
                    <div class="flex justify-between text-sm">
                        <span class="text-gray-400">Labor ({{ laborCount }} x $40/hr)</span>
                        <span class="text-white font-mono">${{ laborCount * 40 }}</span>
                    </div>
                    <div class="flex justify-between text-sm">
                        <span class="text-gray-400">Materials</span>
                        <span class="text-white font-mono">$35</span>
                    </div>
                </div>

                <div class="border-t border-white/10 pt-4 mb-6">
                    <div class="flex justify-between items-end">
                        <span class="text-lg font-bold text-white">Total</span>
                        <span class="text-3xl font-bold text-primary">${{ 120 + (laborCount * 40) + 35 }}</span>
                    </div>
                    <div class="text-xs text-gray-500 text-right mt-1">*Final price may vary by +/- 10%</div>
                </div>

                <button
                    class="w-full py-3 bg-primary hover:bg-primary-dark text-background-dark font-bold rounded-xl transition-colors text-lg mb-3">Confirm
                    Booking</button>
                <button
                    class="w-full py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl transition-colors">Save
                    Quote</button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'

const selectedCargo = ref('Household Goods')
const laborCount = ref(2)

const cargoTypes = [
    { name: 'Household Goods', icon: 'chair' },
    { name: 'Luggage / Boxes', icon: 'package_2' },
    { name: 'Fragile Items', icon: 'check_box_outline_blank' }, // Using available icon
    { name: 'Office Shift', icon: 'desk' },
]
</script>
