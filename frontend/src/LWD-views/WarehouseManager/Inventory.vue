<template>
    <div class="space-y-6">
        <div class="flex justify-between items-center">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Inventory Management</h2>
            <div class="flex gap-2">
                <button @click="openScanner('scan')"
                    class="bg-gray-50 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 py-2 px-4 rounded-lg transition-colors flex items-center gap-2">
                    <span class="material-symbols-outlined">qr_code_scanner</span> Scan Item
                </button>
                <button @click="showAddModal = true"
                    class="bg-primary hover:bg-primary-dark text-background-dark font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors">
                    <span class="material-symbols-outlined">add</span> Add Stock
                </button>
            </div>
        </div>

        <!-- Inventory Stats -->
        <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div class="glass-panel p-4 rounded-xl text-center">
                <div class="text-2xl font-bold text-gray-900 dark:text-white">{{ totalItems.toLocaleString() }}</div>
                <div class="text-xs text-gray-600 dark:text-gray-400">Total Items</div>
            </div>
            <div class="glass-panel p-4 rounded-xl text-center">
                <div class="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{{ lowStockCount }}</div>
                <div class="text-xs text-gray-600 dark:text-gray-400">Low Stock Alerts</div>
            </div>
            <div class="glass-panel p-4 rounded-xl text-center">
                <div class="text-2xl font-bold text-green-600 dark:text-green-400">98%</div>
                <div class="text-xs text-gray-600 dark:text-gray-400">Inventory Accuracy</div>
            </div>
            <div class="glass-panel p-4 rounded-xl text-center">
                <div class="text-2xl font-bold text-orange-600 dark:text-orange-400">{{ fastMovingCount }}</div>
                <div class="text-xs text-gray-600 dark:text-gray-400">Fast-Moving SKUs</div>
            </div>
            <div class="glass-panel p-4 rounded-xl text-center">
                <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">{{ totalValue }}</div>
                <div class="text-xs text-gray-600 dark:text-gray-400">Total Value</div>
            </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="glass-panel rounded-xl p-8 text-center">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <div class="mt-2 text-gray-600 dark:text-gray-400">Loading inventory...</div>
        </div>

        <!-- Inventory Table -->
        <div v-else class="glass-panel rounded-xl overflow-hidden">
            <div class="p-4 border-b border-gray-100 dark:border-white/5 flex flex-wrap gap-4 items-center">
                <input v-model="searchQuery" type="text" placeholder="Search SKU, name, or location..."
                    class="flex-1 min-w-[200px] bg-gray-100 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg py-2 px-4 text-gray-900 dark:text-white focus:outline-none focus:border-primary/50">
                <select v-model="categoryFilter"
                    class="bg-gray-100 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2 text-gray-900 dark:text-white">
                    <option value="" class="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">All Categories</option>
                    <option v-for="category in categoryOptions" :key="category" :value="category"
                        class="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">{{ category }}</option>
                </select>
                <select v-model="zoneFilter"
                    class="bg-gray-100 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2 text-gray-900 dark:text-white">
                    <option value="" class="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">All Zones</option>
                    <option value="A" class="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">Zone A</option>
                    <option value="B" class="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">Zone B</option>
                    <option value="C" class="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">Zone C</option>
                    <option value="D" class="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">Zone D</option>
                </select>
                <label class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
                    <input type="checkbox" v-model="showFastMoving" class="accent-primary" />
                    Fast-Moving Only
                </label>
            </div>

            <div class="overflow-auto max-h-[600px]">
                <table class="w-full text-left text-sm">
                    <thead class="bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-400 uppercase sticky top-0">
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
                    <tbody class="divide-y divide-gray-100 dark:divide-white/5">
                        <tr v-for="item in filteredInventory" :key="item.sku"
                            class="hover:bg-gray-50 dark:bg-white/5 transition-colors">
                            <td class="p-4 font-mono text-gray-600 dark:text-gray-300">{{ item.sku }}</td>
                            <td class="p-4">
                                <div class="flex items-center gap-2">
                                    <span class="font-bold text-gray-900 dark:text-white">{{ item.name }}</span>
                                    <span v-if="item.fastMoving"
                                        class="px-1.5 py-0.5 bg-orange-500/20 text-orange-400 text-[9px] font-bold rounded border border-orange-500/20 animate-pulse">🔥
                                        FAST</span>
                                </div>
                            </td>
                            <td class="p-4 text-gray-600 dark:text-gray-400">{{ item.category }}</td>
                            <td class="p-4 text-gray-600 dark:text-gray-400 font-mono text-xs">{{ item.dimensions }}
                            </td>
                            <td class="p-4 text-gray-600 dark:text-gray-400">{{ item.weight }} kg</td>
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
                                    <div class="w-24 bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
                                        <div class="h-full" :class="item.stock < 20 ? 'bg-red-500' : 'bg-green-500'"
                                            :style="`width: ${item.stockPercentage}%`"></div>
                                    </div>
                                    <span :class="item.stock < 20 ? 'text-red-600 dark:text-red-400 font-bold' : 'text-gray-600 dark:text-gray-300'">{{
                                        item.stock }}</span>
                                </div>
                            </td>
                            <td class="p-4 flex gap-2">
                                <button @click="openEditModal(item)"
                                    class="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:text-white"
                                    title="Edit"><span
                                        class="material-symbols-outlined text-[18px]">edit</span></button>
                                <button @click="openMoveModal(item)"
                                    class="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:text-white"
                                    title="Move"><span
                                        class="material-symbols-outlined text-[18px]">move_down</span></button>
                                <button @click="printLabel(item)"
                                    class="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:text-white"
                                    title="Print Label"><span
                                        class="material-symbols-outlined text-[18px]">print</span></button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Edit SKU Modal -->
        <Teleport to="body">
            <div v-if="showEditModal && editItem"
                class="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                @click.self="showEditModal = false">
                <div class="bg-white dark:bg-gray-900 shadow-2xl rounded-2xl w-full max-w-md border border-gray-200 dark:border-white/10">
                    <div class="p-6 border-b border-gray-100 dark:border-white/5 flex justify-between items-center">
                        <h3 class="font-bold text-gray-900 dark:text-white text-lg">Edit {{ editItem.sku }}</h3>
                        <button @click="showEditModal = false"
                            class="text-gray-500 hover:text-gray-900 dark:text-white"><span
                                class="material-symbols-outlined">close</span></button>
                    </div>
                    <div class="p-6 space-y-4">
                        <div>
                            <label class="text-xs text-gray-600 dark:text-gray-400 mb-1 block">Product Name</label>
                            <input type="text" v-model="editItem.name"
                                class="w-full bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-lg p-3 text-gray-900 dark:text-white focus:outline-none focus:border-primary/50" />
                        </div>
                        <div class="grid grid-cols-2 gap-3">
                            <div>
                                <label class="text-xs text-gray-600 dark:text-gray-400 mb-1 block">Stock Qty</label>
                                <input type="number" v-model.number="editItem.stock"
                                    class="w-full bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-lg p-3 text-gray-900 dark:text-white focus:outline-none focus:border-primary/50" />
                            </div>
                            <div>
                                <label class="text-xs text-gray-600 dark:text-gray-400 mb-1 block">Weight (kg)</label>
                                <input type="number" step="0.1" v-model.number="editItem.weight"
                                    class="w-full bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-lg p-3 text-gray-900 dark:text-white focus:outline-none focus:border-primary/50" />
                            </div>
                        </div>
                        <div>
                            <label class="text-xs text-gray-600 dark:text-gray-400 mb-1 block">Dimensions (cm)</label>
                            <input type="text" v-model="editItem.dimensions"
                                class="w-full bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-lg p-3 text-gray-900 dark:text-white focus:outline-none focus:border-primary/50" />
                        </div>
                        <label class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 cursor-pointer">
                            <input type="checkbox" v-model="editItem.fastMoving" class="accent-primary" />
                            Mark as Fast-Moving
                        </label>
                        <button @click="saveEdit"
                            class="w-full bg-primary hover:bg-primary-dark text-background-dark font-bold py-3 rounded-lg transition-colors">Save
                            Changes</button>
                    </div>
                </div>
            </div>
        </Teleport>

        <!-- Move SKU Modal -->
        <Teleport to="body">
            <div v-if="showMoveModal && moveItem"
                class="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                @click.self="showMoveModal = false">
                <div class="bg-white dark:bg-gray-900 shadow-2xl rounded-2xl w-full max-w-md border border-gray-200 dark:border-white/10">
                    <div class="p-6 border-b border-gray-100 dark:border-white/5 flex justify-between items-center">
                        <h3 class="font-bold text-gray-900 dark:text-white text-lg">Move {{ moveItem.sku }}</h3>
                        <button @click="showMoveModal = false"
                            class="text-gray-500 hover:text-gray-900 dark:text-white"><span
                                class="material-symbols-outlined">close</span></button>
                    </div>
                    <div class="p-6 space-y-4">
                        <div
                            class="p-3 bg-gray-50 dark:bg-white/5 rounded-lg border border-gray-100 dark:border-white/5 text-center">
                            <div class="text-xs text-gray-600 dark:text-gray-400">Current Location</div>
                            <div class="font-mono text-primary font-bold">{{ moveItem.zone }}-{{ moveItem.aisle }}-{{
                                moveItem.rack }}-{{ moveItem.shelf }}-{{ moveItem.bin }}</div>
                        </div>
                        <div class="text-center text-gray-500"><span
                                class="material-symbols-outlined">arrow_downward</span>
                        </div>
                        <div class="grid grid-cols-5 gap-2">
                            <div>
                                <label class="text-[10px] text-gray-600 dark:text-gray-400 block mb-1">Zone</label>
                                <select v-model="newLocation.zone"
                                    class="w-full bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-lg p-2 text-gray-900 dark:text-white text-sm">
                                    <option v-for="z in ['A', 'B', 'C', 'D']" :key="z" class="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">{{ z }}</option>
                                </select>
                            </div>
                            <div>
                                <label class="text-[10px] text-gray-600 dark:text-gray-400 block mb-1">Aisle</label>
                                <input type="text" v-model="newLocation.aisle"
                                    class="w-full bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-lg p-2 text-gray-900 dark:text-white text-sm" />
                            </div>
                            <div>
                                <label class="text-[10px] text-gray-600 dark:text-gray-400 block mb-1">Rack</label>
                                <input type="text" v-model="newLocation.rack"
                                    class="w-full bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-lg p-2 text-gray-900 dark:text-white text-sm" />
                            </div>
                            <div>
                                <label class="text-[10px] text-gray-600 dark:text-gray-400 block mb-1">Shelf</label>
                                <input type="text" v-model="newLocation.shelf"
                                    class="w-full bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-lg p-2 text-gray-900 dark:text-white text-sm" />
                            </div>
                            <div>
                                <label class="text-[10px] text-gray-600 dark:text-gray-400 block mb-1">Bin</label>
                                <input type="text" v-model="newLocation.bin"
                                    class="w-full bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-lg p-2 text-gray-900 dark:text-white text-sm" />
                            </div>
                        </div>
                        <button @click="confirmMove"
                            class="w-full bg-primary hover:bg-primary-dark text-background-dark font-bold py-3 rounded-lg transition-colors">Confirm
                            Move</button>
                    </div>
                </div>
            </div>
        </Teleport>

        <!-- Deprecated Local Scan Item Modal - Replaced by Global SmartScannerModal -->
        <!-- Search Results (Display inline when scan happens) -->
        <div v-if="scanResult" class="glass-panel rounded-xl p-6 border border-green-500/30 animate-fade-in relative">
            <button @click="clearScan"
                class="absolute top-4 right-4 text-gray-400 hover:text-gray-900 dark:hover:text-white">
                <span class="material-symbols-outlined">close</span>
            </button>
            <div class="flex items-start gap-4">
                <div
                    class="w-12 h-12 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center shrink-0">
                    <span class="material-symbols-outlined text-2xl">check_circle</span>
                </div>
                <div>
                    <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-1">Scan Successful</h3>
                    <div class="text-sm font-bold text-gray-900 dark:text-white">{{ scanResult.name }}</div>
                    <div class="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        <span class="font-mono text-primary mr-2">{{ scanResult.sku }}</span>
                        Stock: <span :class="scanResult.stock < 20 ? 'text-red-500' : 'text-green-500'">{{
                            scanResult.stock }}</span> — Zone {{ scanResult.zone }}
                    </div>
                    <div class="mt-4 flex gap-2">
                        <button @click="openEditModal(scanResult)"
                            class="px-3 py-1 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 rounded text-xs font-bold transition-colors">Edit
                            Item</button>
                        <button @click="openMoveModal(scanResult)"
                            class="px-3 py-1 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 rounded text-xs font-bold transition-colors">Move
                            Item</button>
                    </div>
                </div>
            </div>
        </div>
        <div v-if="scanError"
            class="glass-panel rounded-xl p-4 border border-red-500/30 animate-fade-in flex items-center gap-3">
            <span class="material-symbols-outlined text-red-500">error</span>
            <div class="text-red-600 dark:text-red-400 text-sm flex-1">{{ scanError }}</div>
            <button @click="clearScan" class="text-gray-400 hover:text-gray-900 dark:hover:text-white"><span
                    class="material-symbols-outlined text-[18px]">close</span></button>
        </div>

        <!-- Add Stock Modal -->
        <Teleport to="body">
            <div v-if="showAddModal"
                class="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                @click.self="showAddModal = false">
                <div class="bg-white dark:bg-gray-900 shadow-2xl rounded-2xl w-full max-w-md border border-gray-200 dark:border-white/10">
                    <div class="p-6 border-b border-gray-100 dark:border-white/5 flex justify-between items-center">
                        <h3 class="font-bold text-gray-900 dark:text-white text-lg">Add New Stock</h3>
                        <button @click="showAddModal = false"
                            class="text-gray-500 hover:text-gray-900 dark:text-white"><span
                                class="material-symbols-outlined">close</span></button>
                    </div>
                    <div class="p-6 space-y-4">
                        <div class="grid grid-cols-2 gap-3">
                            <div>
                                <label class="text-xs text-gray-600 dark:text-gray-400 mb-1 block">SKU</label>
                                <input type="text" v-model="addForm.sku" placeholder="XX-XXXX"
                                    class="w-full bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-lg p-3 text-gray-900 dark:text-white focus:outline-none focus:border-primary/50 font-mono" />
                            </div>
                            <div>
                                <label class="text-xs text-gray-600 dark:text-gray-400 mb-1 block">Product Name</label>
                                <input type="text" v-model="addForm.name" placeholder="Product name"
                                    class="w-full bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-lg p-3 text-gray-900 dark:text-white focus:outline-none focus:border-primary/50" />
                            </div>
                        </div>
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div>
                                <label class="text-xs text-gray-600 dark:text-gray-400 mb-1 block">Qty</label>
                                <input type="number" v-model.number="addForm.stock"
                                    class="w-full bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-lg p-3 text-gray-900 dark:text-white focus:outline-none focus:border-primary/50" />
                            </div>
                            <div>
                                <label class="text-xs text-gray-600 dark:text-gray-400 mb-1 block">Weight (kg)</label>
                                <input type="number" step="0.1" v-model.number="addForm.weight"
                                    class="w-full bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-lg p-3 text-gray-900 dark:text-white focus:outline-none focus:border-primary/50" />
                            </div>
                            <div>
                                <label class="text-xs text-gray-600 dark:text-gray-400 mb-1 block">Zone</label>
                                <select v-model="addForm.zone"
                                    class="w-full bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-lg p-3 text-gray-900 dark:text-white">
                                    <option v-for="z in ['A', 'B', 'C', 'D']" :key="z" class="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">{{ z }}</option>
                                </select>
                            </div>
                            <div>
                                <label class="text-xs text-gray-600 dark:text-gray-400 mb-1 block">Category</label>
                                <div class="flex gap-2">
                                    <input type="text" v-model="addForm.category" list="inventory-category-options"
                                        placeholder="Select or type new"
                                        class="w-full bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-lg p-3 text-gray-900 dark:text-white focus:outline-none focus:border-primary/50" />
                                    <button @click="showAddCategoryModal = true"
                                        class="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 p-3 rounded-lg border border-gray-200 dark:border-white/10"
                                        title="Create New Category">
                                        <span class="material-symbols-outlined text-[20px]">add</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                        <datalist id="inventory-category-options">
                            <option v-for="category in categoryOptions" :key="`add-${category}`" :value="category">{{ category }}</option>
                        </datalist>
                        <p class="text-[11px] text-gray-500">You can choose existing category or type a new one.</p>
                        <button @click="addNewStock" :disabled="!addForm.sku || !addForm.name"
                            class="w-full bg-primary hover:bg-primary-dark text-background-dark font-bold py-3 rounded-lg transition-colors">Add
                            to Inventory</button>
                    </div>
                </div>
            </div>
        </Teleport>

        <!-- Create Category Modal -->
        <Teleport to="body">
            <div v-if="showAddCategoryModal"
                class="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
                @click.self="showAddCategoryModal = false">
                <div class="bg-white dark:bg-gray-900 shadow-2xl rounded-2xl w-full max-w-sm border border-gray-200 dark:border-white/10">
                    <div class="p-6 border-b border-gray-100 dark:border-white/5 flex justify-between items-center">
                        <h3 class="font-bold text-gray-900 dark:text-white text-lg">Create Category</h3>
                        <button @click="showAddCategoryModal = false"
                            class="text-gray-500 hover:text-gray-900 dark:text-white"><span
                                class="material-symbols-outlined">close</span></button>
                    </div>
                    <div class="p-6 space-y-4">
                        <div>
                            <label class="text-xs text-gray-600 dark:text-gray-400 mb-1 block">Category Name</label>
                            <input type="text" v-model="newCategoryName" placeholder="e.g. Electronics" autofocus
                                @keyup.enter="createCategory"
                                class="w-full bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-lg p-3 text-gray-900 dark:text-white focus:outline-none focus:border-primary/50" />
                        </div>
                        <button @click="createCategory" :disabled="!newCategoryName.trim()"
                            class="w-full bg-primary hover:bg-primary-dark text-background-dark font-bold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                            Create Category
                        </button>
                    </div>
                </div>
            </div>
        </Teleport>

        <!-- Toasts -->
        <div v-if="toastMsg"
            class="fixed bottom-6 right-6 bg-green-500/90 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 z-50 animate-bounce">
            <span class="material-symbols-outlined">check_circle</span>
            <div class="font-bold">{{ toastMsg }}</div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, reactive, inject, watch } from 'vue'
import { useAuthStore } from '@/stores/authStore'

const authStore = useAuthStore()
const openScanner = inject('openScanner')
const lastGlobalScan = inject('lastGlobalScan')

const searchQuery = ref('')
const categoryFilter = ref('')
const zoneFilter = ref('')
const showFastMoving = ref(false)
const showEditModal = ref(false)
const showMoveModal = ref(false)
const showAddModal = ref(false)
const showAddCategoryModal = ref(false)
const newCategoryName = ref('')
const customCategories = ref([])
const editItem = ref(null)
const moveItem = ref(null)
const scanResult = ref(null)
const scanError = ref('')
const toastMsg = ref('')
const loading = ref(false)
const newLocation = reactive({ zone: 'A', aisle: '01', rack: 'R1', shelf: 'S1', bin: 'B01' })
const addForm = reactive({ sku: '', name: '', stock: 0, weight: 0, zone: 'A', category: 'General' })

const inventory = ref([])
const categories = ref([])
const CATEGORY_STORAGE_PREFIX = 'warehouse-manager-inventory-categories'

// Watch for global scans and handle them here
watch(lastGlobalScan, (newScanObj) => {
    if (newScanObj) {
        lookupScan(newScanObj)
        // Reset it back to null so we can scan the same item twice if needed
        lastGlobalScan.value = null
    }
})

// Currency formatter for INR
function formatCurrency(value) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(value || 0)
}

function getWarehouseId() {
    return authStore.currentUser?.warehouse_id || authStore.currentWarehouse?.id || null
}

function normalizeCategory(value) {
    const normalized = String(value || '').trim()
    if (!normalized || normalized.toLowerCase() === 'uncategorized') return 'General'
    return normalized
}

function normalizeCategoryList(values = []) {
    const seen = new Set()
    return values.reduce((list, value) => {
        const normalized = normalizeCategory(
            typeof value === 'string'
                ? value
                : (value?.category || value?.name || value?.label || '')
        )
        const key = normalized.toLowerCase()
        if (!seen.has(key)) {
            seen.add(key)
            list.push(normalized)
        }
        return list
    }, []).sort((a, b) => a.localeCompare(b))
}

function getCategoryStorageKey(warehouseId = getWarehouseId()) {
    return `${CATEGORY_STORAGE_PREFIX}:${warehouseId || 'default'}`
}

function loadCustomCategories(warehouseId = getWarehouseId()) {
    if (typeof window === 'undefined' || !warehouseId) {
        customCategories.value = []
        return
    }

    try {
        const raw = JSON.parse(window.localStorage.getItem(getCategoryStorageKey(warehouseId)) || '[]')
        customCategories.value = normalizeCategoryList(Array.isArray(raw) ? raw : [])
    } catch (error) {
        console.error('Error loading custom categories:', error)
        customCategories.value = []
    }
}

function persistCustomCategories(warehouseId = getWarehouseId()) {
    if (typeof window === 'undefined' || !warehouseId) return

    window.localStorage.setItem(
        getCategoryStorageKey(warehouseId),
        JSON.stringify(normalizeCategoryList(customCategories.value))
    )
}

const categoryOptions = computed(() => {
    const fromInventory = inventory.value.map(item => normalizeCategory(item.category))
    const merged = [...categories.value, ...customCategories.value, ...fromInventory, 'General']
    return normalizeCategoryList(merged.filter(Boolean))
})

function ensureCategoryAvailable(value, warehouseId = getWarehouseId()) {
    const category = normalizeCategory(value)
    if (!category) return ''

    const existing = categoryOptions.value.find(option => option.toLowerCase() === category.toLowerCase())
    if (existing) return existing

    customCategories.value = normalizeCategoryList([...customCategories.value, category])
    persistCustomCategories(warehouseId)
    return category
}

function createCategory() {
    const category = ensureCategoryAvailable(newCategoryName.value)
    if (!category) return

    addForm.category = category
    newCategoryName.value = ''
    showAddCategoryModal.value = false
    showToast(`Category "${category}" created`)
}

async function fetchCategories() {
    const warehouseId = getWarehouseId()
    if (!warehouseId) return

    try {
        const response = await fetch(`http://localhost:8000/api/v1/inventory/categories?warehouse_id=${warehouseId}`, {
            headers: {
                'Authorization': `Bearer ${authStore.authToken}`,
                'Content-Type': 'application/json'
            }
        })
        if (!response.ok) return
        const data = await response.json()
        const rows = Array.isArray(data) ? data : (data?.items || data?.categories || [])
        categories.value = normalizeCategoryList(rows)
    } catch (error) {
        console.error('Error fetching categories:', error)
    }
}

// Fetch inventory from backend
async function fetchInventory() {
    loading.value = true
    try {
        const warehouseId = getWarehouseId()
        if (!warehouseId) {
            console.error('No warehouse_id found for current user')
            loading.value = false
            return
        }

        const response = await fetch(`http://localhost:8000/api/v1/inventory?page=1&page_size=100&warehouse_id=${warehouseId}`, {
            headers: {
                'Authorization': `Bearer ${authStore.authToken}`,
                'Content-Type': 'application/json'
            }
        })

        if (!response.ok) {
            throw new Error(`Failed to fetch inventory: ${response.statusText}`)
        }

        const payload = await response.json()
        const items = Array.isArray(payload) ? payload : (payload.items || [])

        inventory.value = items.map((item) => {
            const stock = Number(item.quantity_on_hand ?? item.stock ?? 0)
            const threshold = Number(item.safety_stock ?? item.threshold ?? 100)
            const rawAisle = item.aisle || '01'
            const zoneFromAisle = rawAisle.includes('-') ? rawAisle.split('-')[0] : ''
            const aisle = rawAisle.includes('-') ? (rawAisle.split('-').pop() || '01') : rawAisle
            const zone = item.zone || zoneFromAisle || 'A'
            const shelf = item.shelf || 'S1'
            const category = normalizeCategory(item.category)

            return {
                ...item,
                stock,
                stockPercentage: Math.min((stock / (threshold || 100)) * 100, 100),
                fastMoving: item.fast_moving || false,
                dimensions: item.dimensions || '--',
                category,
                zone,
                aisle,
                rack: item.rack || 'R1',
                shelf,
                bin: item.bin || 'B01'
            }
        })
    } catch (error) {
        console.error('Error fetching inventory:', error)
    } finally {
        loading.value = false
    }
}

watch(
    () => authStore.currentWarehouse?.id || authStore.currentUser?.warehouse_id || null,
    async (warehouseId) => {
        inventory.value = []
        categories.value = []
        loadCustomCategories(warehouseId)

        if (!warehouseId) return

        await Promise.all([fetchInventory(), fetchCategories()])
    },
    { immediate: true }
)

const totalItems = computed(() => inventory.value.reduce((sum, i) => sum + i.stock, 0))
const lowStockCount = computed(() => inventory.value.filter(i => i.stock < 20).length)
const fastMovingCount = computed(() => inventory.value.filter(i => i.fastMoving).length)
const totalValue = computed(() => {
    const value = inventory.value.reduce((sum, i) => sum + (i.stock * (i.unit_price || 0)), 0)
    return formatCurrency(value)
})

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

function showToast(msg) {
    toastMsg.value = msg
    setTimeout(() => { toastMsg.value = '' }, 2500)
}

function openEditModal(item) {
    editItem.value = item
    showEditModal.value = true
}

function saveEdit() {
    showEditModal.value = false
    showToast(`${editItem.value.sku} updated`)
}

function openMoveModal(item) {
    moveItem.value = item
    newLocation.zone = item.zone
    newLocation.aisle = item.aisle
    newLocation.rack = item.rack
    newLocation.shelf = item.shelf
    newLocation.bin = item.bin
    showMoveModal.value = true
}

function confirmMove() {
    moveItem.value.zone = newLocation.zone
    moveItem.value.aisle = newLocation.aisle
    moveItem.value.rack = newLocation.rack
    moveItem.value.shelf = newLocation.shelf
    moveItem.value.bin = newLocation.bin
    showMoveModal.value = false
    showToast(`${moveItem.value.sku} moved to ${newLocation.zone}-${newLocation.aisle}-${newLocation.rack}-${newLocation.shelf}-${newLocation.bin}`)
}

function printLabel(item) {
    showToast(`Label printed for ${item.sku} — ${item.name}`)
}

function lookupScan(scannedSku) {
    scanResult.value = null
    scanError.value = ''

    // Safety check just in case
    if (!scannedSku) return

    const found = inventory.value.find(i => i.sku.toLowerCase() === scannedSku.toLowerCase())
    if (found) {
        scanResult.value = found
    } else {
        scanError.value = `SKU "${scannedSku}" not found in inventory`
    }
}

function clearScan() {
    scanResult.value = null
    scanError.value = ''
}

async function addNewStock() {
    const warehouseId = getWarehouseId()
    if (!warehouseId) {
        showToast('Warehouse is not linked to this account')
        return
    }

    try {
        const category = ensureCategoryAvailable(addForm.category, warehouseId)
        const response = await fetch('http://localhost:8000/api/v1/inventory', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authStore.authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                warehouse_id: warehouseId,
                sku: addForm.sku.trim(),
                name: addForm.name.trim(),
                category,
                unit: 'pcs',
                quantity_on_hand: Math.max(Number(addForm.stock) || 0, 0),
                safety_stock: 0,
                aisle: `${addForm.zone}-01`,
                shelf: 'S1',
                bin: 'B01'
            })
        })

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}))
            const message = errData.detail || `Failed to add stock (${response.status})`
            throw new Error(typeof message === 'string' ? message : 'Failed to add stock')
        }

        await fetchInventory()
        await fetchCategories()
        window.dispatchEvent(new CustomEvent('warehouse-inventory-updated', {
            detail: {
                warehouseId,
                sku: addForm.sku.trim()
            }
        }))

        showAddModal.value = false
        addForm.sku = ''
        addForm.name = ''
        addForm.stock = 0
        addForm.weight = 0
        addForm.zone = 'A'
        addForm.category = 'General'
        newCategoryName.value = ''
        showToast('New stock item added to inventory')
    } catch (error) {
        console.error('Error adding stock:', error)
        showToast(error.message || 'Failed to add stock')
    }
}
</script>
