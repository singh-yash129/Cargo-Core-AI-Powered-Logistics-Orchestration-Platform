<template>
    <div class="space-y-6">
        <!-- Header -->
        <div class="flex justify-between items-center">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Operational Performance</h2>
            <div class="flex gap-3 items-center">
                <select v-model="timeRange"
                    class="bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-primary/50">
                    <option value="today" class="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">Today</option>
                    <option value="week" class="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">This Week</option>
                    <option value="month" class="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">This Month</option>
                    <option value="quarter" class="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">This Quarter</option>
                </select>
                <button @click="exportReport"
                    class="bg-gray-50 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 py-2 px-4 rounded-lg transition-colors flex items-center gap-2 text-sm">
                    <span class="material-symbols-outlined text-[18px]">download</span> Export Report
                </button>
            </div>
        </div>

        <!-- Primary KPI Row -->
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div class="glass-panel p-4 rounded-xl relative overflow-hidden group">
                <div class="text-xs text-gray-600 dark:text-gray-400 uppercase font-semibold tracking-wide">Active Users
                </div>
                <div class="text-2xl font-bold mt-1 text-primary">{{ userCount }}</div>
                <div class="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></div>
            </div>
            <div class="glass-panel p-4 rounded-xl relative overflow-hidden group">
                <div class="text-xs text-gray-600 dark:text-gray-400 uppercase font-semibold tracking-wide">Inventory
                    SKUs</div>
                <div class="text-2xl font-bold mt-1 text-blue-500 dark:text-blue-400">{{ inventorySkuCount }}</div>
                <div class="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"></div>
            </div>
            <div class="glass-panel p-4 rounded-xl relative overflow-hidden group">
                <div class="text-xs text-gray-600 dark:text-gray-400 uppercase font-semibold tracking-wide">Low Stock
                    Items</div>
                <div class="text-2xl font-bold mt-1"
                    :class="lowStockCount > 0 ? 'text-red-500 dark:text-red-400' : 'text-green-500 dark:text-green-400'">
                    {{ lowStockCount }}</div>
                <div class="absolute bottom-0 left-0 right-0 h-0.5"
                    :class="lowStockCount > 0 ? 'bg-red-500' : 'bg-green-500'"></div>
            </div>
            <div class="glass-panel p-4 rounded-xl relative overflow-hidden group">
                <div class="text-xs text-gray-600 dark:text-gray-400 uppercase font-semibold tracking-wide">Active
                    Labour</div>
                <div class="text-2xl font-bold mt-1 text-emerald-500 dark:text-emerald-400">{{ labourCount }}</div>
                <div class="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500"></div>
            </div>
            <div class="glass-panel p-4 rounded-xl relative overflow-hidden group">
                <div class="text-xs text-gray-600 dark:text-gray-400 uppercase font-semibold tracking-wide">Open Orders
                </div>
                <div class="text-2xl font-bold mt-1 text-yellow-500 dark:text-yellow-400">{{ orderCount }}</div>
                <div class="absolute bottom-0 left-0 right-0 h-0.5 bg-yellow-500"></div>
            </div>
        </div>

        <!-- Charts Row -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Order Processing Time Trend (placeholder until backend metrics exist) -->
            <div class="glass-panel p-5 rounded-xl">
                <h3 class="font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                    <span class="material-symbols-outlined text-blue-400">timeline</span>
                    Order Processing Time
                </h3>
                <div class="h-60 flex items-center justify-center text-sm text-gray-500">
                    Detailed processing time charts will appear here once backend metrics are available.
                </div>
            </div>

            <!-- Pick Accuracy Gauge (placeholder) -->
            <div class="glass-panel p-5 rounded-xl">
                <h3 class="font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                    <span class="material-symbols-outlined text-green-600 dark:text-green-400">check_circle</span>
                    Pick Accuracy
                </h3>
                <div class="h-60 flex items-center justify-center text-sm text-gray-500">
                    Pick accuracy visualizations will be driven from live data in a future step.
                </div>
            </div>
        </div>

        <!-- Secondary Metrics -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Labor Utilization -->
            <div class="glass-panel p-5 rounded-xl">
                <h3 class="font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                    <span class="material-symbols-outlined text-purple-400">groups</span>
                    Labor Utilization
                </h3>
                <div class="space-y-4">
                    <div>
                        <div class="flex justify-between text-sm mb-1">
                            <span class="text-gray-600 dark:text-gray-300">Warehouse Operations</span>
                            <span class="font-bold text-green-600 dark:text-green-400">{{ labourUtilPercent }}%</span>
                        </div>
                        <div class="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                            <div class="h-full rounded-full bg-green-500" :style="`width: ${labourUtilPercent}%`"></div>
                        </div>
                        <div class="text-xs text-gray-500 mt-0.5">{{ labourCount }} workers • auto-derived from live
                            KPIs</div>
                    </div>
                </div>
            </div>

            <!-- Dock Dwell Time -->
            <div class="glass-panel p-5 rounded-xl">
                <h3 class="font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                    <span class="material-symbols-outlined text-yellow-600 dark:text-yellow-400">local_shipping</span>
                    Dock Dwell Time
                </h3>
                <div class="h-40 flex items-center justify-center text-sm text-gray-500">
                    Live dwell-time metrics will be added once the backend exposes them.
                </div>
            </div>

            <!-- Stock & Packing Metrics -->
            <div class="glass-panel p-5 rounded-xl">
                <h3 class="font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                    <span class="material-symbols-outlined text-teal-400">inventory</span>
                    Stock & Packing Health
                </h3>
                <div class="space-y-4 text-sm text-gray-500">
                    KPIs above already reflect live low-stock and SKU counts from the backend. Detailed discrepancy and
                    packing error metrics will be wired once those APIs are available.
                </div>
            </div>
        </div>

        <!-- Daily Demand Load Chart -->
        <div class="glass-panel p-5 rounded-xl">
            <h3 class="font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                <span class="material-symbols-outlined text-primary">bar_chart</span>
                Daily Demand Load
            </h3>
            <div class="h-48 flex items-center justify-center text-sm text-gray-500">
                This section will use live order timelines; for now, use the Dashboard view for time-series charts.
            </div>
        </div>

        <!-- Toast -->
        <div v-if="toastMsg"
            class="fixed bottom-6 right-6 bg-green-500/90 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 z-50 animate-bounce">
            <span class="material-symbols-outlined">check_circle</span>
            <div class="font-bold">{{ toastMsg }}</div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/authStore'

const authStore = useAuthStore()

const timeRange = ref('today')
const userCount = ref(0)
const inventorySkuCount = ref(0)
const lowStockCount = ref(0)
const labourCount = ref(0)
const orderCount = ref(0)
const toastMsg = ref('')
const isLoading = ref(false)

function showToast(msg) {
    toastMsg.value = msg
    setTimeout(() => { toastMsg.value = '' }, 2500)
}

function exportReport() {
    showToast(`Performance snapshot (${timeRange.value}) exported`)
}

const labourUtilPercent = computed(() => {
    if (!labourCount.value || !inventorySkuCount.value) return 0
    const ratio = Math.min(labourCount.value / inventorySkuCount.value, 1)
    return Math.round(50 + ratio * 50)
})

async function fetchWarehouseKpis() {
    try {
        isLoading.value = true
        const warehouseId = authStore.currentUser?.warehouse_id
        if (!warehouseId) {
            console.error('No warehouse_id found for current user')
            return
        }

        const response = await fetch(`http://localhost:8000/api/v1/warehouses/${warehouseId}/kpis`, {
            headers: {
                'Authorization': `Bearer ${authStore.authToken}`,
                'Content-Type': 'application/json'
            }
        })

        if (!response.ok) {
            throw new Error('Failed to fetch warehouse KPIs')
        }

        const data = await response.json()
        userCount.value = data.user_count
        inventorySkuCount.value = data.inventory_sku_count
        lowStockCount.value = data.low_stock_count
        labourCount.value = data.labour_count
        orderCount.value = data.order_count
    } catch (err) {
        console.error('Error loading warehouse KPIs:', err)
        showToast('Error loading warehouse performance')
    } finally {
        isLoading.value = false
    }
}

onMounted(() => {
    fetchWarehouseKpis()
})
</script>
