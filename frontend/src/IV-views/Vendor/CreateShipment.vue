<template>
    <div class="max-w-4xl mx-auto space-y-6">
        <div class="flex items-center gap-4 mb-6">
            <button class="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors">
                <span class="material-symbols-outlined">arrow_back</span>
            </button>
            <h2 class="text-2xl font-bold text-white">Create New Shipment</h2>
        </div>

        <div class="glass-panel p-8 rounded-xl space-y-8">
            <!-- Section 1: Shipment Details -->
            <div>
                <h3 class="text-lg font-bold text-white mb-4 border-b border-white/10 pb-2">1. Cargo Details</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label class="block text-sm text-gray-400 mb-2">Pallet Count</label>
                        <input type="number"
                            class="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500/50"
                            placeholder="e.g. 12">
                    </div>
                    <div>
                        <label class="block text-sm text-gray-400 mb-2">Total Weight (kg)</label>
                        <input type="number"
                            class="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500/50"
                            placeholder="e.g. 4500">
                    </div>
                    <div class="md:col-span-2">
                        <label class="block text-sm text-gray-400 mb-2">Special Handling</label>
                        <div class="flex gap-4">
                            <label
                                class="flex items-center gap-2 p-3 rounded-lg border border-white/10 bg-white/5 cursor-pointer hover:bg-white/10">
                                <input type="checkbox" class="rounded text-blue-500 bg-black/20 border-white/20">
                                <span class="text-white text-sm">Fragile</span>
                            </label>
                            <label
                                class="flex items-center gap-2 p-3 rounded-lg border border-white/10 bg-white/5 cursor-pointer hover:bg-white/10">
                                <input type="checkbox" class="rounded text-blue-500 bg-black/20 border-white/20">
                                <span class="text-white text-sm">Cold Storage</span>
                            </label>
                            <label
                                class="flex items-center gap-2 p-3 rounded-lg border border-white/10 bg-white/5 cursor-pointer hover:bg-white/10">
                                <input type="checkbox" class="rounded text-blue-500 bg-black/20 border-white/20">
                                <span class="text-white text-sm">Hazardous</span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Section 2: Logistics -->
            <div>
                <h3 class="text-lg font-bold text-white mb-4 border-b border-white/10 pb-2">2. Route & Schedule</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label class="block text-sm text-gray-400 mb-2">Pickup Location (Warehouse)</label>
                        <select
                            class="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500/50">
                            <option>Main Hub - New York</option>
                            <option>West Coast Distribution</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm text-gray-400 mb-2">Destination</label>
                        <input type="text"
                            class="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500/50"
                            placeholder="Enter address or store ID">
                    </div>
                    <div>
                        <label class="block text-sm text-gray-400 mb-2">Pickup Date</label>
                        <input type="date"
                            class="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500/50">
                    </div>
                    <div>
                        <label class="block text-sm text-gray-400 mb-2">Pickup Time Window</label>
                        <select
                            class="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500/50">
                            <option>08:00 AM - 12:00 PM</option>
                            <option>12:00 PM - 04:00 PM</option>
                        </select>
                    </div>
                </div>
            </div>

            <!-- Action Actions -->
            <div class="pt-6 border-t border-white/10 flex justify-end gap-4">
                <button class="px-6 py-3 rounded-lg border border-white/10 text-white hover:bg-white/5 font-bold">Save
                    Draft</button>
                <button
                    class="px-8 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-500/20">Confirm
                    Shipment</button>
            </div>
        </div>
    </div>
</template>

<script setup>
</script>
