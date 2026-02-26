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
        <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
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
                <div class="text-2xl font-bold text-orange-400">8</div>
                <div class="text-xs text-gray-400">Fast-Moving SKUs</div>
            </div>
            <div class="glass-panel p-4 rounded-xl text-center">
                <div class="text-2xl font-bold text-blue-400">$1.2M</div>
                <div class="text-xs text-gray-400">Total Value</div>
            </div>
        </div>

        <!-- Inventory Table -->
        <div class="glass-panel rounded-xl overflow-hidden">
            <div class="p-4 border-b border-white/5 flex flex-wrap gap-4 items-center">
                <input v-model="searchQuery" type="text" placeholder="Search SKU, name, or location..."
                    class="flex-1 min-w-[200px] bg-black/20 border border-white/10 rounded-lg py-2 px-4 text-white focus:outline-none focus:border-primary/50">
                <select v-model="categoryFilter"
                    class="bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white">
                    <option value="">All Categories</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Home & Garden">Home & Garden</option>
                    <option value="Apparel">Apparel</option>
                    <option value="Furniture">Furniture</option>
                </select>
                <select v-model="zoneFilter" class="bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white">
                    <option value="">All Zones</option>
                    <option value="A">Zone A</option>
                    <option value="B">Zone B</option>
                    <option value="C">Zone C</option>
                    <option value="D">Zone D</option>
                </select>
                <label class="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
                    <input type="checkbox" v-model="showFastMoving" class="accent-primary" />
                    Fast-Moving Only
                </label>
            </div>

            <div class="overflow-auto max-h-[600px]">
                <table class="w-full text-left text-sm">
                    <thead class="bg-white/5 text-gray-400 uppercase sticky top-0">
                        <tr>
                            <th class="p-4">SKU</th>
                            <th class="p-4">Product Name</th>
                            <th class="p-4">Category</th>
                            <th class="p-4">Dimensions (cm)</th>
                            <th class="p-4">Weight</th>
                            <th class="p-4">Location</th>
                            <th class="p-4">Stock Level</th>
                            <th class="p-4">Action</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-white/5">
                        <tr v-for="item in filteredInventory" :key="item.sku"
                            class="hover:bg-white/5 transition-colors">
                            <td class="p-4 font-mono text-gray-300">{{ item.sku }}</td>
                            <td class="p-4">
                                <div class="flex items-center gap-2">
                                    <span class="font-bold text-white">{{ item.name }}</span>
                                    <span v-if="item.fastMoving"
                                        class="px-1.5 py-0.5 bg-orange-500/20 text-orange-400 text-[9px] font-bold rounded border border-orange-500/20 animate-pulse">🔥
                                        FAST</span>
                                </div>
                            </td>
                            <td class="p-4 text-gray-400">{{ item.category }}</td>
                            <td class="p-4 text-gray-400 font-mono text-xs">{{ item.dimensions }}</td>
                            <td class="p-4 text-gray-400">{{ item.weight }} kg</td>
                            <td class="p-4">
                                <div class="flex flex-col">
                                    <span class="font-mono text-primary text-xs">{{ item.zone }}-{{ item.aisle }}-{{
                                        item.rack }}-{{ item.shelf }}-{{ item.bin }}</span>
                                    <span class="text-[10px] text-gray-500">Zone {{ item.zone }} • Aisle {{ item.aisle
                                        }}</span>
                                </div>
                            </td>
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
                                <button class="text-gray-400 hover:text-white" title="Edit"><span
                                        class="material-symbols-outlined text-[18px]">edit</span></button>
                                <button class="text-gray-400 hover:text-white" title="Move"><span
                                        class="material-symbols-outlined text-[18px]">move_down</span></button>
                                <button class="text-gray-400 hover:text-white" title="Print Label"><span
                                        class="material-symbols-outlined text-[18px]">print</span></button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const searchQuery = ref('')
const categoryFilter = ref('')
const zoneFilter = ref('')
const showFastMoving = ref(false)

const inventory = ref([
    { sku: 'EL-9921', name: 'Wireless Headphones', category: 'Electronics', dimensions: '20×15×8', weight: 0.4, zone: 'A', aisle: '12', rack: 'R3', shelf: 'S2', bin: 'B04', stock: 145, stockPercentage: 80, fastMoving: true },
    { sku: 'HG-3321', name: 'Ceramic Vase', category: 'Home & Garden', dimensions: '30×30×45', weight: 2.5, zone: 'B', aisle: '04', rack: 'R1', shelf: 'S3', bin: 'B11', stock: 12, stockPercentage: 10, fastMoving: false },
    { sku: 'AP-5541', name: 'Running Shoes (Size 10)', category: 'Apparel', dimensions: '35×22×14', weight: 0.8, zone: 'C', aisle: '22', rack: 'R5', shelf: 'S1', bin: 'B01', stock: 88, stockPercentage: 60, fastMoving: true },
    { sku: 'EL-1105', name: 'Smart Watch Gen 5', category: 'Electronics', dimensions: '10×10×8', weight: 0.2, zone: 'A', aisle: '12', rack: 'R3', shelf: 'S2', bin: 'B05', stock: 200, stockPercentage: 95, fastMoving: true },
    { sku: 'FN-7701', name: 'Office Chair Ergonomic', category: 'Furniture', dimensions: '65×65×120', weight: 14.5, zone: 'D', aisle: '01', rack: 'R1', shelf: 'S1', bin: 'B01', stock: 22, stockPercentage: 40, fastMoving: false },
    { sku: 'EL-2234', name: 'Bluetooth Speaker', category: 'Electronics', dimensions: '12×12×18', weight: 0.6, zone: 'A', aisle: '14', rack: 'R2', shelf: 'S4', bin: 'B09', stock: 310, stockPercentage: 90, fastMoving: true },
    { sku: 'HG-4452', name: 'Garden Hose 30m', category: 'Home & Garden', dimensions: '40×40×15', weight: 3.2, zone: 'B', aisle: '08', rack: 'R4', shelf: 'S2', bin: 'B03', stock: 8, stockPercentage: 8, fastMoving: false },
    { sku: 'AP-6612', name: 'Winter Jacket (M)', category: 'Apparel', dimensions: '45×35×10', weight: 1.2, zone: 'C', aisle: '18', rack: 'R2', shelf: 'S3', bin: 'B07', stock: 55, stockPercentage: 55, fastMoving: true },
])

const filteredInventory = computed(() => {
    return inventory.value.filter(item => {
        const matchesSearch = !searchQuery.value ||
            item.sku.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
            item.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
            `${item.zone}-${item.aisle}-${item.rack}-${item.shelf}-${item.bin}`.toLowerCase().includes(searchQuery.value.toLowerCase())
        const matchesCategory = !categoryFilter.value || item.category === categoryFilter.value
        const matchesZone = !zoneFilter.value || item.zone === zoneFilter.value
        const matchesFastMoving = !showFastMoving.value || item.fastMoving
        return matchesSearch && matchesCategory && matchesZone && matchesFastMoving
    })
})
</script>
