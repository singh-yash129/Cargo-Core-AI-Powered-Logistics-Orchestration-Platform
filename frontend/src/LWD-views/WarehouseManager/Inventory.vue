<template>
    <div class="space-y-6">
        <div class="flex justify-between items-center">
            <h2 class="text-2xl font-bold text-white">Inventory Management</h2>
            <div class="flex gap-2">
                <button
                    class="bg-white/5 hover:bg-white/10 text-white border border-white/10 py-2 px-4 rounded-lg transition-colors flex items-center gap-2">
                    <span class="material-symbols-outlined">qr_code_scanner</span> Scan Item
                </button>
                <button
                    class="bg-primary hover:bg-primary-dark text-background-dark font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors">
                    <span class="material-symbols-outlined">add</span> Add Stock
                </button>
            </div>
        </div>

        <!-- Inventory Stats -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="glass-panel p-4 rounded-xl text-center">
                <div class="text-2xl font-bold text-white">24,500</div>
                <div class="text-xs text-gray-400">Total Items</div>
            </div>
            <div class="glass-panel p-4 rounded-xl text-center">
                <div class="text-2xl font-bold text-yellow-400">12</div>
                <div class="text-xs text-gray-400">Low Stock Alerts</div>
            </div>
            <div class="glass-panel p-4 rounded-xl text-center">
                <div class="text-2xl font-bold text-green-400">98%</div>
                <div class="text-xs text-gray-400">Inventory Accuracy</div>
            </div>
            <div class="glass-panel p-4 rounded-xl text-center">
                <div class="text-2xl font-bold text-blue-400">$1.2M</div>
                <div class="text-xs text-gray-400">Total Value</div>
            </div>
        </div>

        <!-- Inventory Table -->
        <div class="glass-panel rounded-xl overflow-hidden">
            <div class="p-4 border-b border-white/5 flex gap-4">
                <input type="text" placeholder="Search SKU, name, or location..."
                    class="flex-1 bg-black/20 border border-white/10 rounded-lg py-2 px-4 text-white focus:outline-none focus:border-primary/50">
                <select class="bg-black/20 border border-white/10 rounded-lg px-4 text-white">
                    <option>All Categories</option>
                    <option>Electronics</option>
                    <option>Home & Garden</option>
                    <option>Apparel</option>
                </select>
            </div>

            <table class="w-full text-left text-sm">
                <thead class="bg-white/5 text-gray-400 uppercase">
                    <tr>
                        <th class="p-4">SKU</th>
                        <th class="p-4">Product Name</th>
                        <th class="p-4">Category</th>
                        <th class="p-4">Location</th>
                        <th class="p-4">Stock Level</th>
                        <th class="p-4">Action</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-white/5">
                    <tr v-for="item in inventory" :key="item.sku" class="hover:bg-white/5 transition-colors">
                        <td class="p-4 font-mono text-gray-300">{{ item.sku }}</td>
                        <td class="p-4 font-bold text-white">{{ item.name }}</td>
                        <td class="p-4 text-gray-400">{{ item.category }}</td>
                        <td class="p-4 font-mono text-primary">{{ item.location }}</td>
                        <td class="p-4">
                            <div class="flex items-center gap-2">
                                <div class="w-24 bg-gray-700 h-1.5 rounded-full overflow-hidden">
                                    <div class="h-full" :class="item.stock < 20 ? 'bg-red-500' : 'bg-green-500'"
                                        :style="`width: ${item.stockPercentage}%`"></div>
                                </div>
                                <span :class="item.stock < 20 ? 'text-red-400 font-bold' : 'text-gray-300'">{{
                                    item.stock }}</span>
                            </div>
                        </td>
                        <td class="p-4 flex gap-2">
                            <button class="text-gray-400 hover:text-white"><span
                                    class="material-symbols-outlined">edit</span></button>
                            <button class="text-gray-400 hover:text-white"><span
                                    class="material-symbols-outlined">print</span></button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'

const inventory = ref([
    { sku: 'EL-9921', name: 'Wireless Headphones', category: 'Electronics', location: 'A-12-04', stock: 145, stockPercentage: 80 },
    { sku: 'HG-3321', name: 'Ceramic Vase', category: 'Home & Garden', location: 'B-04-11', stock: 12, stockPercentage: 10 },
    { sku: 'AP-5541', name: 'Running Shoes (Size 10)', category: 'Apparel', location: 'C-22-01', stock: 88, stockPercentage: 60 },
    { sku: 'EL-1105', name: 'Smart Watch Gen 5', category: 'Electronics', location: 'A-12-05', stock: 200, stockPercentage: 95 },
])
</script>
