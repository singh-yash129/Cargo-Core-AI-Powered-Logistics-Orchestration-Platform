<template>
    <div class="space-y-6">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Picking & Packing</h2>
            <div class="flex flex-wrap gap-2">
                <div
                    class="px-4 py-2 bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white text-sm">
                    Active Pickers: <span class="text-green-600 dark:text-green-400 font-bold">{{ activePickers }}</span>
                </div>
                <div v-if="autoRefreshEnabled"
                    class="px-3 py-2 bg-green-500/10 border border-green-500/20 rounded-lg text-green-600 dark:text-green-400 text-xs flex items-center gap-1">
                    <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    Live {{ autoRefreshCountdown }}s
                </div>
                <button @click="toggleAutoRefresh"
                    class="px-3 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                    :class="autoRefreshEnabled ? 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-400' : 'bg-primary/20 text-primary'">
                    <span class="material-symbols-outlined text-[14px]">{{ autoRefreshEnabled ? 'pause' : 'play_arrow' }}</span>
                    {{ autoRefreshEnabled ? 'Pause' : 'Auto' }}
                </button>
                <button @click="refreshData"
                    class="bg-primary hover:bg-primary-dark text-background-dark font-bold py-2 px-4 rounded-lg transition-colors flex items-center gap-1">
                    <span class="material-symbols-outlined text-[18px]">refresh</span>
                    Refresh
                </button>
            </div>
        </div>

        <!-- Search & Filter Bar -->
        <div class="glass-panel p-4 rounded-xl">
            <div class="flex flex-col md:flex-row gap-3">
                <div class="flex-1 relative">
                    <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">search</span>
                    <input v-model="searchQuery" type="text" placeholder="Search by Order ID, Type..."
                        class="w-full bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-lg pl-10 pr-4 py-2 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-primary/50" />
                </div>
                <div class="flex flex-wrap gap-2">
                    <button v-for="filter in statusFilters" :key="filter.value"
                        @click="toggleStatusFilter(filter.value)"
                        class="px-3 py-2 rounded-lg text-xs font-bold transition-all border"
                        :class="activeStatusFilters.includes(filter.value)
                            ? 'bg-primary text-background-dark border-primary'
                            : 'bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-white/10 hover:border-primary/50'">
                        {{ filter.label }}
                    </button>
                    <select v-model="priorityFilter"
                        class="px-3 py-2 bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white text-xs focus:outline-none focus:border-primary/50">
                        <option value="">All Priorities</option>
                        <option value="EXPRESS">🔥 Express</option>
                        <option value="STANDARD">📦 Standard</option>
                        <option value="ECONOMY">🐢 Economy</option>
                    </select>
                    <button v-if="hasActiveFilters" @click="clearFilters"
                        class="px-3 py-2 bg-red-500/10 text-red-500 rounded-lg text-xs font-bold hover:bg-red-500/20 transition-colors">
                        Clear
                    </button>
                </div>
            </div>
        </div>

        <!-- Undo Toast -->
        <Transition name="slide-up">
            <div v-if="undoAction"
                class="fixed bottom-20 left-1/2 -translate-x-1/2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-6 py-3 rounded-xl shadow-2xl flex items-center gap-4 z-50">
                <span class="text-sm">{{ undoAction.message }}</span>
                <button @click="performUndo"
                    class="bg-primary text-background-dark px-3 py-1 rounded-lg text-xs font-bold hover:bg-primary-dark transition-colors">
                    Undo
                </button>
                <button @click="dismissUndo" class="text-gray-400 hover:text-white">
                    <span class="material-symbols-outlined text-[18px]">close</span>
                </button>
            </div>
        </Transition>

        <!-- Order Fulfillment Pipeline -->
        <div class="glass-panel p-4 rounded-xl">
            <div class="text-xs text-gray-600 dark:text-gray-400 uppercase font-semibold mb-3">Order Fulfillment
                Pipeline</div>
            <div v-if="pipelineLoading" class="flex items-center justify-center py-4">
                <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
            </div>
            <div v-else class="flex items-center justify-between gap-2">
                <div v-for="(step, idx) in pipelineSteps" :key="step.label"
                    class="flex-1 flex flex-col items-center relative group">
                    <div class="w-full flex items-center">
                        <div class="flex-1 h-1 rounded-full"
                            :class="idx === 0 ? 'bg-transparent' : step.active ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'">
                        </div>
                        <div class="w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all"
                            :class="step.active ? 'bg-primary text-background-dark shadow-lg shadow-primary/30' : 'bg-gray-50 dark:bg-white/5 text-gray-500 border border-gray-200 dark:border-white/10'">
                            <span class="material-symbols-outlined text-[18px]">{{ step.icon }}</span>
                        </div>
                        <div class="flex-1 h-1 rounded-full"
                            :class="idx === pipelineSteps.length - 1 ? 'bg-transparent' : pipelineSteps[idx + 1]?.active ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'">
                        </div>
                    </div>
                    <div class="text-[10px] mt-2 font-bold text-center"
                        :class="step.active ? 'text-primary' : 'text-gray-500'">{{ step.label }}</div>
                    <div class="text-[10px] text-gray-600 text-center">{{ step.count }} orders</div>
                </div>
            </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Pick Wave Status -->
            <div class="lg:col-span-2 glass-panel rounded-xl overflow-hidden">
                <div class="p-6 border-b border-gray-100 dark:border-white/5 flex flex-col sm:flex-row justify-between gap-2">
                    <h3 class="font-bold text-gray-900 dark:text-white">Active Pick Waves</h3>
                    <span class="text-xs text-gray-600 dark:text-gray-400">
                        {{ filteredWaves.length }} of {{ waves.length }} orders
                        <span v-if="hasActiveFilters" class="text-primary">(filtered)</span>
                    </span>
                </div>

                <!-- Loading -->
                <div v-if="loading" class="p-8 text-center">
                    <div class="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    <div class="mt-2 text-xs text-gray-500">Loading pick waves...</div>
                </div>

                <!-- Mobile Card View -->
                <div v-else class="md:hidden p-4 space-y-3 max-h-[500px] overflow-y-auto">
                    <div v-for="wave in filteredWaves" :key="wave.id"
                        class="p-4 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/5">
                        <div class="flex justify-between items-start mb-3">
                            <div>
                                <div class="font-mono text-primary font-bold">{{ wave.id }}</div>
                                <div class="flex items-center gap-2 mt-1">
                                    <span :class="getPriorityBadgeClass(wave.priority)" class="px-2 py-0.5 rounded text-[10px] font-bold">
                                        {{ getPriorityIcon(wave.priority) }} {{ wave.priority || 'Standard' }}
                                    </span>
                                    <span class="px-2 py-1 rounded text-[10px] font-bold border" :class="wave.statusClass">
                                        {{ wave.status }}
                                    </span>
                                </div>
                            </div>
                            <button @click="openPickList(wave)" class="text-primary text-sm font-bold">
                                {{ wave.items }} items →
                            </button>
                        </div>
                        <div class="grid grid-cols-2 gap-2 text-xs mb-3">
                            <div>
                                <span class="text-gray-500">Value:</span>
                                <span class="text-gray-900 dark:text-white ml-1">{{ formatCurrency(wave.value) }}</span>
                            </div>
                            <div>
                                <span class="text-gray-500">Deadline:</span>
                                <span class="text-gray-900 dark:text-white ml-1 font-mono">{{ wave.deadline }}</span>
                            </div>
                            <div class="col-span-2">
                                <span class="text-gray-500">Picker:</span>
                                <span v-if="wave.assignedPicker" class="text-green-600 ml-1">{{ wave.assignedPicker }}</span>
                                <button v-else @click="openAssignPicker(wave)" class="text-yellow-500 ml-1 underline">Assign</button>
                            </div>
                        </div>
                        <div class="flex gap-2">
                            <button v-if="hasAction(wave)" @click="handleWaveAction(wave)"
                                class="flex-1 bg-primary text-background-dark py-2 rounded-lg text-xs font-bold">
                                {{ getActionLabel(wave) }}
                            </button>
                            <button v-if="wave.canUndo" @click="undoWaveStatus(wave)"
                                class="px-3 py-2 bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-400 rounded-lg text-xs">
                                <span class="material-symbols-outlined text-[14px]">undo</span>
                            </button>
                        </div>
                    </div>
                    <div v-if="filteredWaves.length === 0" class="text-center py-8 text-gray-500">
                        <span class="material-symbols-outlined text-4xl mb-2 opacity-50">search_off</span>
                        <p>No orders match your filters</p>
                    </div>
                </div>

                <!-- Desktop Table View -->
                <div class="hidden md:block overflow-x-auto">
                <table class="w-full min-w-[1100px] text-left text-sm">
                    <thead class="bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-400 uppercase">
                        <tr>
                            <th class="p-4">Order ID</th>
                            <th class="p-4">Priority</th>
                            <th class="p-4">Items</th>
                            <th class="p-4">Value</th>
                            <th class="p-4">Assigned Picker</th>
                            <th class="p-4">Deadline</th>
                            <th class="p-4">Status</th>
                            <th class="p-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100 dark:divide-white/5">
                        <tr v-for="wave in filteredWaves" :key="wave.id"
                            class="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                            <td class="p-4 font-mono text-primary">{{ wave.id }}</td>
                            <td class="p-4">
                                <span :class="getPriorityBadgeClass(wave.priority)" class="px-2 py-1 rounded text-[10px] font-bold inline-flex items-center gap-1">
                                    {{ getPriorityIcon(wave.priority) }} {{ wave.priority || 'Standard' }}
                                </span>
                            </td>
                            <td class="p-4">
                                <button @click="openPickList(wave)"
                                    class="text-primary hover:text-primary-dark underline text-sm font-medium flex items-center gap-1">
                                    <span class="material-symbols-outlined text-[14px]">list_alt</span>
                                    {{ wave.items }} items
                                </button>
                            </td>
                            <td class="p-4 text-gray-600 dark:text-gray-300">{{ formatCurrency(wave.value) }}</td>
                            <td class="p-4">
                                <div v-if="wave.assignedPicker" class="flex items-center gap-2">
                                    <span class="w-2 h-2 rounded-full bg-green-500"></span>
                                    <span class="text-gray-900 dark:text-white text-xs">{{ wave.assignedPicker }}</span>
                                </div>
                                <button v-else @click="openAssignPicker(wave)"
                                    class="text-yellow-600 dark:text-yellow-400 hover:text-yellow-500 text-xs flex items-center gap-1">
                                    <span class="material-symbols-outlined text-[14px]">person_add</span>
                                    Assign
                                </button>
                            </td>
                            <td class="p-4">
                                <span class="font-mono text-xs" :class="isOverdue(wave.deadline) ? 'text-red-500 font-bold' : 'text-gray-900 dark:text-white'">
                                    {{ wave.deadline }}
                                    <span v-if="isOverdue(wave.deadline)" class="ml-1">⚠️</span>
                                </span>
                            </td>
                            <td class="p-4">
                                <span class="px-2 py-1 rounded text-[10px] font-bold border" :class="wave.statusClass">
                                    {{ wave.status }}
                                </span>
                            </td>
                            <td class="p-4">
                                <div class="flex gap-2">
                                    <button v-if="hasAction(wave)" @click="handleWaveAction(wave)"
                                        class="bg-primary/20 hover:bg-primary/30 text-primary px-3 py-1 rounded text-xs font-bold transition-colors">
                                        {{ getActionLabel(wave) }}
                                    </button>
                                    <span v-else class="text-xs text-gray-500">QC / Dispatch</span>
                                    <button v-if="wave.canUndo" @click="undoWaveStatus(wave)"
                                        class="px-2 py-1 bg-gray-100 dark:bg-white/10 text-gray-500 rounded text-xs hover:bg-gray-200 dark:hover:bg-white/20 transition-colors"
                                        title="Undo last status change">
                                        <span class="material-symbols-outlined text-[14px]">undo</span>
                                    </button>
                                </div>
                            </td>
                        </tr>
                        <tr v-if="filteredWaves.length === 0">
                            <td colspan="8" class="p-8 text-center text-gray-500">
                                <span class="material-symbols-outlined text-4xl mb-2 opacity-50">{{ hasActiveFilters ? 'search_off' : 'inventory_2' }}</span>
                                <p v-if="hasActiveFilters">No orders match your filters. <button @click="clearFilters" class="text-primary underline">Clear filters</button></p>
                                <p v-else>No active pick waves yet. Accepted orders stay in New Orders until a real picking status exists.</p>
                            </td>
                        </tr>
                    </tbody>
                </table>
                </div>
            </div>

            <!-- Packing Station View + Quality Check -->
            <div class="space-y-6">
                <div class="glass-panel p-6 rounded-xl">
                    <h3 class="font-bold text-gray-900 dark:text-white mb-4">Packing Stations</h3>
                    <div class="space-y-4">
                        <div v-for="station in stations" :key="station.id"
                            class="p-4 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-lg">
                            <div class="flex justify-between items-center mb-2">
                                <span class="font-bold text-gray-900 dark:text-white">{{ station.name }}</span>
                                <span class="w-2 h-2 rounded-full"
                                    :class="station.active ? 'bg-green-500 animate-pulse' : 'bg-gray-500'"></span>
                            </div>
                            <div class="text-xs text-gray-600 dark:text-gray-400 mb-2">{{ station.packer }}</div>
                            <div class="flex justify-between items-end text-sm">
                                <div>
                                    <div class="text-gray-500 text-[10px] uppercase">Throughput</div>
                                    <div class="text-gray-900 dark:text-white font-bold">{{ station.rate }} / hr</div>
                                </div>
                                <button @click="monitorStation(station)"
                                    class="bg-gray-100 dark:bg-white/10 hover:bg-gray-300 dark:hover:bg-white/20 text-gray-900 dark:text-white px-2 py-1 rounded text-xs transition-colors"
                                    :class="station.monitoring ? 'ring-1 ring-primary bg-primary/20 text-primary' : ''">
                                    {{ station.monitoring ? '● Live' : 'Monitor' }}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Quality Check Panel -->
                <div class="glass-panel p-6 rounded-xl">
                    <h3 class="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <span class="material-symbols-outlined text-green-600 dark:text-green-400">verified</span>
                        Quality Verification
                    </h3>
                    <div class="space-y-3">
                        <div v-for="check in qualityChecks" :key="check.orderId"
                            class="p-3 bg-gray-50 dark:bg-white/5 rounded-lg border border-gray-100 dark:border-white/5">
                            <div class="flex justify-between items-center mb-2">
                                <span class="font-mono text-primary text-xs font-bold">{{ check.orderId }}</span>
                                <span class="px-2 py-0.5 rounded text-[10px] font-bold"
                                    :class="check.verified ? 'bg-green-500/20 text-green-600 dark:text-green-400' : 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400'">
                                    {{ check.verified ? 'Verified' : 'Pending' }}
                                </span>
                            </div>
                            <div class="space-y-1 text-xs">
                                <div v-for="(field, fIdx) in checkFields" :key="fIdx"
                                    @click="toggleCheck(check, field.key)"
                                    class="flex items-center gap-2 cursor-pointer hover:bg-gray-50 dark:bg-white/5 rounded p-0.5 transition-colors">
                                    <span class="material-symbols-outlined text-[14px]"
                                        :class="check[field.key] ? 'text-green-600 dark:text-green-400' : 'text-gray-600'">{{
                                            check[field.key] ? 'check_circle' : 'radio_button_unchecked' }}</span>
                                    <span class="text-gray-600 dark:text-gray-300">{{ field.label }}</span>
                                </div>
                            </div>
                            <button v-if="check.verified" @click="triggerDispatch(check)"
                                class="mt-3 w-full py-2 bg-green-500/20 hover:bg-green-500/30 text-green-600 dark:text-green-400 rounded text-xs font-bold transition-colors flex items-center justify-center gap-1">
                                <span class="material-symbols-outlined text-[14px]">send</span> Ready for Dispatch
                            </button>
                            <button v-else
                                class="mt-3 w-full py-2 bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 rounded text-xs font-bold cursor-not-allowed opacity-50">
                                Complete all checks first
                            </button>
                        </div>
                        <div v-if="qualityChecks.length === 0" class="text-center text-xs text-gray-500 py-4">
                            No orders pending quality check
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Dispatch Toast -->
        <div v-if="dispatchToast"
            class="fixed bottom-6 right-6 bg-green-500/90 text-white px-6 py-4 rounded-xl shadow-2xl shadow-green-500/30 flex items-center gap-3 z-50 animate-bounce">
            <span class="material-symbols-outlined">check_circle</span>
            <div>
                <div class="font-bold">{{ dispatchToast }}</div>
                <div class="text-xs opacity-80">Notification sent to Dispatcher</div>
            </div>
        </div>
        <div v-if="actionToast"
            class="fixed bottom-6 left-6 bg-blue-500/90 text-white px-6 py-4 rounded-xl shadow-2xl shadow-blue-500/30 flex items-center gap-3 z-50 animate-bounce">
            <span class="material-symbols-outlined">inventory</span>
            <div class="font-bold">{{ actionToast }}</div>
        </div>

        <!-- Pick List Modal -->
        <Teleport to="body">
            <div v-if="showPickListModal"
                class="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                @click.self="showPickListModal = false">
                <div class="bg-white dark:bg-gray-900 shadow-2xl rounded-2xl w-full max-w-4xl border border-gray-200 dark:border-white/10 max-h-[90vh] flex flex-col">
                    <div class="p-6 border-b border-gray-100 dark:border-white/5 flex justify-between items-center shrink-0">
                        <div>
                            <h3 class="font-bold text-gray-900 dark:text-white text-lg flex items-center gap-2">
                                <span class="material-symbols-outlined text-primary">list_alt</span>
                                Pick List — {{ selectedWave?.id }}
                            </h3>
                            <p class="text-xs text-gray-500 mt-1">Item-by-item picking locations</p>
                        </div>
                        <button @click="showPickListModal = false" class="text-gray-500 hover:text-gray-900 dark:text-white">
                            <span class="material-symbols-outlined">close</span>
                        </button>
                    </div>
                    <div class="p-6 overflow-y-auto flex-1">
                        <div v-if="pickListLoading" class="flex items-center justify-center py-8">
                            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                        <div v-else-if="pickListItems.length === 0" class="text-center py-8 text-gray-500">
                            <span class="material-symbols-outlined text-4xl mb-2 opacity-50">inventory_2</span>
                            <p>No items found for this order</p>
                        </div>
                        <div v-else class="space-y-3">
                            <div v-for="(item, idx) in pickListItems" :key="item.sku"
                                class="p-4 rounded-xl border transition-all"
                                :class="item.picked ? 'bg-green-500/10 border-green-500/30' : 'bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-white/5'">
                                <div class="flex justify-between items-start">
                                    <div class="flex items-start gap-4">
                                        <div class="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-sm">
                                            {{ idx + 1 }}
                                        </div>
                                        <div>
                                            <div class="font-bold text-gray-900 dark:text-white">{{ item.item_name || item.name }}</div>
                                            <div class="text-xs text-gray-500 font-mono">SKU: {{ item.sku }}</div>
                                            <div class="mt-2 flex gap-4 text-xs">
                                                <span class="text-gray-600 dark:text-gray-400">
                                                    <strong class="text-primary">{{ item.required_quantity || item.quantity }}</strong> {{ item.unit || 'pcs' }} required
                                                </span>
                                                <span v-if="item.shortage_quantity > 0" class="text-red-500 font-bold">
                                                    ⚠ Shortage: {{ item.shortage_quantity }}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="text-right">
                                        <div class="px-3 py-1 rounded-lg bg-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-bold mb-2">
                                            {{ item.location_path || formatLocation(item) }}
                                        </div>
                                        <div class="text-[10px] text-gray-500 font-mono">
                                            Scan: {{ item.scan_code || item.sku }}
                                        </div>
                                    </div>
                                </div>
                                <div class="mt-3 flex items-center justify-between">
                                    <div class="flex gap-2 text-[10px] text-gray-500">
                                        <span v-if="item.zone" class="px-2 py-0.5 bg-gray-100 dark:bg-white/10 rounded">Zone: {{ item.zone }}</span>
                                        <span v-if="item.aisle" class="px-2 py-0.5 bg-gray-100 dark:bg-white/10 rounded">Aisle: {{ item.aisle }}</span>
                                        <span v-if="item.rack" class="px-2 py-0.5 bg-gray-100 dark:bg-white/10 rounded">Rack: {{ item.rack }}</span>
                                        <span v-if="item.shelf" class="px-2 py-0.5 bg-gray-100 dark:bg-white/10 rounded">Shelf: {{ item.shelf }}</span>
                                        <span v-if="item.bin" class="px-2 py-0.5 bg-gray-100 dark:bg-white/10 rounded">Bin: {{ item.bin }}</span>
                                    </div>
                                    <button @click="toggleItemPicked(item)"
                                        class="px-3 py-1 rounded text-xs font-bold transition-all flex items-center gap-1"
                                        :class="item.picked ? 'bg-green-500/30 text-green-600 dark:text-green-400' : 'bg-gray-200 dark:bg-white/10 text-gray-600 dark:text-gray-300 hover:bg-primary/20 hover:text-primary'">
                                        <span class="material-symbols-outlined text-[14px]">{{ item.picked ? 'check_circle' : 'radio_button_unchecked' }}</span>
                                        {{ item.picked ? 'Picked' : 'Mark Picked' }}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="p-4 border-t border-gray-100 dark:border-white/5 flex justify-between items-center shrink-0 bg-gray-50 dark:bg-black/20">
                        <div class="text-sm text-gray-600 dark:text-gray-400">
                            {{ pickedCount }} / {{ pickListItems.length }} items picked
                        </div>
                        <div class="flex gap-2">
                            <button @click="printPickList" class="px-4 py-2 bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white rounded-lg text-sm font-bold hover:bg-gray-200 dark:hover:bg-white/20 transition-colors flex items-center gap-2">
                                <span class="material-symbols-outlined text-[18px]">print</span>
                                Print List
                            </button>
                            <button @click="completePickList" :disabled="pickedCount < pickListItems.length"
                                class="px-4 py-2 bg-primary text-background-dark rounded-lg text-sm font-bold transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                                <span class="material-symbols-outlined text-[18px]">check</span>
                                Complete Picking
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Teleport>

        <!-- Assign Picker Modal -->
        <Teleport to="body">
            <div v-if="showAssignPickerModal"
                class="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                @click.self="showAssignPickerModal = false">
                <div class="bg-white dark:bg-gray-900 shadow-2xl rounded-2xl w-full max-w-md border border-gray-200 dark:border-white/10">
                    <div class="p-6 border-b border-gray-100 dark:border-white/5 flex justify-between items-center">
                        <div>
                            <h3 class="font-bold text-gray-900 dark:text-white text-lg flex items-center gap-2">
                                <span class="material-symbols-outlined text-primary">person_add</span>
                                Assign Picker
                            </h3>
                            <p class="text-xs text-gray-500 mt-1">Order: {{ selectedWave?.id }}</p>
                        </div>
                        <button @click="showAssignPickerModal = false" class="text-gray-500 hover:text-gray-900 dark:text-white">
                            <span class="material-symbols-outlined">close</span>
                        </button>
                    </div>
                    <div class="p-6">
                        <div v-if="labourersLoading" class="flex items-center justify-center py-4">
                            <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                        </div>
                        <div v-else>
                            <label class="text-xs text-gray-600 dark:text-gray-400 mb-2 block">Select Available Picker</label>
                            <div class="space-y-2 max-h-64 overflow-y-auto">
                                <div v-for="labourer in availableLabourers" :key="labourer.id"
                                    @click="selectedLabourer = labourer"
                                    class="p-3 rounded-lg border cursor-pointer transition-all"
                                    :class="selectedLabourer?.id === labourer.id ? 'bg-primary/20 border-primary' : 'bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-white/5 hover:border-primary/50'">
                                    <div class="flex justify-between items-center">
                                        <div class="flex items-center gap-3">
                                            <div class="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold">
                                                {{ (labourer.name || labourer.full_name || '?')[0].toUpperCase() }}
                                            </div>
                                            <div>
                                                <div class="font-bold text-gray-900 dark:text-white text-sm">{{ labourer.name || labourer.full_name }}</div>
                                                <div class="text-xs text-gray-500">{{ labourer.designation || labourer.role || 'Picker' }}</div>
                                            </div>
                                        </div>
                                        <span v-if="labourer.status === 'AVAILABLE'" class="px-2 py-0.5 bg-green-500/20 text-green-600 dark:text-green-400 rounded text-[10px] font-bold">Available</span>
                                        <span v-else class="px-2 py-0.5 bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 rounded text-[10px] font-bold">{{ labourer.status || 'Active' }}</span>
                                    </div>
                                </div>
                                <div v-if="availableLabourers.length === 0" class="text-center py-4 text-gray-500 text-sm">
                                    No labourers available
                                </div>
                            </div>
                            <button @click="assignPicker" :disabled="!selectedLabourer || assigningPicker"
                                class="mt-4 w-full py-3 bg-primary text-background-dark rounded-lg font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                                <span v-if="assigningPicker" class="animate-spin rounded-full h-4 w-4 border-b-2 border-background-dark"></span>
                                <span>{{ assigningPicker ? 'Assigning...' : 'Assign Picker' }}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Teleport>

        <!-- Packing Station Live Monitor Modal -->
        <Teleport to="body">
            <div v-if="showStationMonitor"
                class="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                @click.self="showStationMonitor = false">
                <div class="bg-white dark:bg-gray-900 shadow-2xl rounded-2xl w-full max-w-lg border border-gray-200 dark:border-white/10">
                    <div class="p-6 border-b border-gray-100 dark:border-white/5 flex justify-between items-center">
                        <div>
                            <h3 class="font-bold text-gray-900 dark:text-white text-lg flex items-center gap-2">
                                <span class="material-symbols-outlined text-green-500 animate-pulse">radio_button_checked</span>
                                Live Monitor — {{ monitoredStation?.name }}
                            </h3>
                            <p class="text-xs text-gray-500 mt-1">Real-time packing station activity</p>
                        </div>
                        <button @click="closeStationMonitor" class="text-gray-500 hover:text-gray-900 dark:text-white">
                            <span class="material-symbols-outlined">close</span>
                        </button>
                    </div>
                    <div class="p-6 space-y-4">
                        <div class="grid grid-cols-2 gap-4">
                            <div class="p-4 bg-gray-50 dark:bg-white/5 rounded-xl text-center">
                                <div class="text-3xl font-bold text-primary">{{ monitoredStation?.rate || 0 }}</div>
                                <div class="text-xs text-gray-500 mt-1">Items Packed Today</div>
                            </div>
                            <div class="p-4 bg-gray-50 dark:bg-white/5 rounded-xl text-center">
                                <div class="text-3xl font-bold" :class="monitoredStation?.active ? 'text-green-500' : 'text-gray-500'">
                                    {{ monitoredStation?.active ? 'Active' : 'Idle' }}
                                </div>
                                <div class="text-xs text-gray-500 mt-1">Station Status</div>
                            </div>
                        </div>
                        <div class="p-4 bg-gray-50 dark:bg-white/5 rounded-xl">
                            <div class="text-xs text-gray-500 mb-2">Current Order</div>
                            <div v-if="monitoredStation?.currentOrderTracking" class="font-mono text-primary font-bold">
                                {{ monitoredStation.currentOrderTracking }}
                            </div>
                            <div v-else class="text-gray-500 text-sm">No order in progress</div>
                        </div>
                        <div class="p-4 bg-gray-50 dark:bg-white/5 rounded-xl">
                            <div class="text-xs text-gray-500 mb-2">Assigned Packer</div>
                            <div class="font-bold text-gray-900 dark:text-white">{{ monitoredStation?.packer || 'Unassigned' }}</div>
                        </div>
                        <div class="flex gap-2">
                            <button @click="refreshStationData" class="flex-1 py-2 bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white rounded-lg text-sm font-bold hover:bg-gray-200 dark:hover:bg-white/20 transition-colors">
                                Refresh Data
                            </button>
                            <button @click="closeStationMonitor" class="flex-1 py-2 bg-primary text-background-dark rounded-lg text-sm font-bold">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Teleport>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { getEffectiveWarehouseSubstatus, patchWarehouseOrderUiState, readWarehouseOrderState, writeWarehouseOrderState } from '@/utils/warehouseOrderState'

const authStore = useAuthStore()
const dispatchToast = ref('')
const actionToast = ref('')
const loading = ref(false)
const pipelineLoading = ref(false)

// Search & Filter state
const searchQuery = ref('')
const activeStatusFilters = ref([])
const priorityFilter = ref('')
const statusFilters = [
    { label: 'Awaiting', value: 'AWAITING_PICK' },
    { label: 'Picking', value: 'PICKING' },
    { label: 'Picked', value: 'PICKED' },
    { label: 'Packing', value: 'PACKING' },
]

// Auto-refresh state
const autoRefreshEnabled = ref(true)
const autoRefreshCountdown = ref(30)
let autoRefreshInterval = null
let countdownInterval = null

// Undo state
const undoAction = ref(null)
const undoHistory = ref([]) // Stack of previous states
let undoTimeout = null

// Pick list modal state
const showPickListModal = ref(false)
const selectedWave = ref(null)
const pickListItems = ref([])
const pickListLoading = ref(false)

// Assign picker modal state
const showAssignPickerModal = ref(false)
const availableLabourers = ref([])
const selectedLabourer = ref(null)
const labourersLoading = ref(false)
const assigningPicker = ref(false)

// Station monitor state
const showStationMonitor = ref(false)
const monitoredStation = ref(null)

// QC check persistence key
const QC_STORAGE_KEY = 'warehouse-qc-checks'

const checkFields = [
    { key: 'goodsCorrect', label: 'Correct goods' },
    { key: 'countCorrect', label: 'Correct count' },
    { key: 'packagingOk', label: 'Packaging verified' },
    { key: 'laborConfirmed', label: 'Labor assigned' },
    { key: 'weightOk', label: 'Weight verified' },
    { key: 'labelAttached', label: 'Shipping label attached' },
]

// Dynamic data
const waves = ref([])
const qualityChecks = ref([])
const pipelineSteps = ref([
    { label: 'Accepted', icon: 'task_alt', active: true, count: 0 },
    { label: 'Picking', icon: 'shopping_basket', active: false, count: 0 },
    { label: 'Packing', icon: 'package_2', active: false, count: 0 },
    { label: 'Quality Check', icon: 'verified', active: false, count: 0 },
    { label: 'Ready for Dispatch', icon: 'local_shipping', active: false, count: 0 },
])

// Packing stations - fetched from API
const stations = ref([])

// Track assigned labourers per order
const orderAssignments = ref({})

// Filtered waves computed
const filteredWaves = computed(() => {
    let result = waves.value

    // Search filter
    if (searchQuery.value.trim()) {
        const query = searchQuery.value.toLowerCase().trim()
        result = result.filter(w =>
            w.id.toLowerCase().includes(query) ||
            (w.type || '').toLowerCase().includes(query) ||
            (w.priority || '').toLowerCase().includes(query) ||
            (w.assignedPicker || '').toLowerCase().includes(query)
        )
    }

    // Status filter
    if (activeStatusFilters.value.length > 0) {
        result = result.filter(w => activeStatusFilters.value.includes(w.status))
    }

    // Priority filter
    if (priorityFilter.value) {
        result = result.filter(w => (w.priority || 'STANDARD').toUpperCase() === priorityFilter.value)
    }

    return result
})

const hasActiveFilters = computed(() => searchQuery.value.trim() || activeStatusFilters.value.length > 0 || priorityFilter.value)

// Active pickers: count unique assigned pickers for PICKING/PACKING orders
const activePickers = computed(() => {
    const pickingOrderIds = waves.value
        .filter(w => w.status === 'PICKING' || w.status === 'PACKING')
        .map(w => w.rawId)

    const uniquePickers = new Set()
    for (const orderId of pickingOrderIds) {
        const assignment = orderAssignments.value[orderId]
        if (assignment?.labourerId) {
            uniquePickers.add(assignment.labourerId)
        }
    }
    return uniquePickers.size
})

// Computed for pick list
const pickedCount = computed(() => pickListItems.value.filter(i => i.picked).length)

// ==================
// Filter Functions
// ==================

function toggleStatusFilter(status) {
    const idx = activeStatusFilters.value.indexOf(status)
    if (idx >= 0) {
        activeStatusFilters.value.splice(idx, 1)
    } else {
        activeStatusFilters.value.push(status)
    }
}

function clearFilters() {
    searchQuery.value = ''
    activeStatusFilters.value = []
    priorityFilter.value = ''
}

// ==================
// Priority Helpers
// ==================

function getPriorityIcon(priority) {
    const p = (priority || 'STANDARD').toUpperCase()
    if (p === 'EXPRESS' || p === 'URGENT') return '🔥'
    if (p === 'ECONOMY' || p === 'LOW') return '🐢'
    return '📦'
}

function getPriorityBadgeClass(priority) {
    const p = (priority || 'STANDARD').toUpperCase()
    if (p === 'EXPRESS' || p === 'URGENT') return 'bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30'
    if (p === 'ECONOMY' || p === 'LOW') return 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30'
    return 'bg-gray-500/20 text-gray-600 dark:text-gray-400 border border-gray-500/30'
}

function isOverdue(deadline) {
    if (!deadline || deadline === 'N/A') return false
    try {
        const deadlineDate = new Date(deadline)
        return deadlineDate < new Date()
    } catch {
        return false
    }
}

// ==================
// Auto-Refresh
// ==================

function toggleAutoRefresh() {
    autoRefreshEnabled.value = !autoRefreshEnabled.value
    if (autoRefreshEnabled.value) {
        startAutoRefresh()
    } else {
        stopAutoRefresh()
    }
}

function startAutoRefresh() {
    stopAutoRefresh()
    autoRefreshCountdown.value = 30

    countdownInterval = setInterval(() => {
        autoRefreshCountdown.value--
        if (autoRefreshCountdown.value <= 0) {
            autoRefreshCountdown.value = 30
        }
    }, 1000)

    autoRefreshInterval = setInterval(async () => {
        if (!loading.value) {
            await fetchPickingData()
        }
        autoRefreshCountdown.value = 30
    }, 30000)
}

function stopAutoRefresh() {
    if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval)
        autoRefreshInterval = null
    }
    if (countdownInterval) {
        clearInterval(countdownInterval)
        countdownInterval = null
    }
}

// ==================
// Undo Functionality
// ==================

function saveUndoState(wave, previousStatus, newStatus) {
    undoHistory.value.push({
        orderId: wave.rawId,
        waveId: wave.id,
        previousStatus,
        newStatus,
        timestamp: Date.now()
    })

    // Keep only last 5 undo actions
    if (undoHistory.value.length > 5) {
        undoHistory.value.shift()
    }

    // Show undo toast
    undoAction.value = {
        message: `${wave.id} moved to ${newStatus.replace(/_/g, ' ')}`,
        orderId: wave.rawId,
        previousStatus
    }

    // Auto-dismiss after 10 seconds
    if (undoTimeout) clearTimeout(undoTimeout)
    undoTimeout = setTimeout(() => {
        undoAction.value = null
    }, 10000)
}

async function performUndo() {
    if (!undoAction.value) return

    const { orderId, previousStatus } = undoAction.value
    const warehouseId = getWarehouseId()

    if (!warehouseId) return

    patchWarehouseOrderUiState(warehouseId, orderId, {
        accepted: true,
        warehouse_substatus: previousStatus,
    })

    notifyOrdersUpdated()
    await fetchPickingData()

    actionToast.value = `Reverted to ${previousStatus.replace(/_/g, ' ')}`
    setTimeout(() => { actionToast.value = '' }, 2500)

    undoAction.value = null
    if (undoTimeout) clearTimeout(undoTimeout)
}

function dismissUndo() {
    undoAction.value = null
    if (undoTimeout) clearTimeout(undoTimeout)
}

async function undoWaveStatus(wave) {
    // Find the last undo state for this wave
    const lastState = undoHistory.value.filter(h => h.orderId === wave.rawId).pop()
    if (!lastState) return

    const warehouseId = getWarehouseId()
    if (!warehouseId) return

    patchWarehouseOrderUiState(warehouseId, wave.rawId, {
        accepted: true,
        warehouse_substatus: lastState.previousStatus,
    })

    notifyOrdersUpdated()
    await fetchPickingData()

    actionToast.value = `${wave.id} reverted to ${lastState.previousStatus.replace(/_/g, ' ')}`
    setTimeout(() => { actionToast.value = '' }, 2500)

    // Remove this from history
    const idx = undoHistory.value.indexOf(lastState)
    if (idx >= 0) undoHistory.value.splice(idx, 1)
}

function formatCurrency(value) {
    if (!value) return '₹0'
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(value)
}

function formatDate(dateString) {
    if (!dateString) return 'N/A'
    try {
        return new Date(dateString).toLocaleDateString('en-IN', {
            month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
        })
    } catch {
        return 'N/A'
    }
}

function formatLocation(item) {
    const parts = []
    if (item.zone) parts.push(item.zone)
    if (item.aisle) parts.push(`A${item.aisle}`)
    if (item.rack) parts.push(`R${item.rack}`)
    if (item.shelf) parts.push(`S${item.shelf}`)
    if (item.bin) parts.push(`B${item.bin}`)
    return parts.length > 0 ? parts.join('-') : 'Location TBD'
}

function getStatusClass(status) {
    const map = {
        'AWAITING_PICK': 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
        'PICKING': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
        'PICKED': 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
        'PACKING': 'bg-green-500/10 text-green-500 border-green-500/20',
        'PACKED': 'bg-teal-500/10 text-teal-500 border-teal-500/20',
        'QC_PASSED': 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
        'READY_FOR_DISPATCH': 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
        'ON_DOCK': 'bg-orange-500/10 text-orange-500 border-orange-500/20',
        'CONFIRMED': 'bg-gray-500/10 text-gray-500 border-gray-500/20',
    }
    return map[status] || 'bg-gray-500/10 text-gray-500 border-gray-500/20'
}

function dedupeOrders(orders) {
    const seen = new Set()
    return orders.filter(order => {
        const key = order.id || order.tracking_code
        if (!key || seen.has(key)) return false
        seen.add(key)
        return true
    })
}

function getWarehouseId() {
    return authStore.currentWarehouse?.id || authStore.currentUser?.warehouse_id
}

function getActionLabel(wave) {
    if (wave.status === 'AWAITING_PICK' || wave.status === 'CONFIRMED') return 'Start Picking'
    if (wave.status === 'PICKING') return 'Complete Picking'
    if (wave.status === 'PICKED') return 'Start Packing'
    if (wave.status === 'PACKING') return 'Complete Packing'
    return ''
}

function hasAction(wave) {
    return Boolean(getActionLabel(wave))
}

function notifyOrdersUpdated() {
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('warehouse-orders-updated'))
    }
}

// ==================
// QC Check Persistence
// ==================

function loadQcChecks() {
    try {
        const stored = localStorage.getItem(QC_STORAGE_KEY)
        return stored ? JSON.parse(stored) : {}
    } catch {
        return {}
    }
}

function saveQcChecks(checks) {
    try {
        const data = {}
        for (const check of checks) {
            data[check.orderId] = {
                goodsCorrect: check.goodsCorrect,
                countCorrect: check.countCorrect,
                packagingOk: check.packagingOk,
                laborConfirmed: check.laborConfirmed,
                weightOk: check.weightOk,
                labelAttached: check.labelAttached,
                verified: check.verified,
            }
        }
        localStorage.setItem(QC_STORAGE_KEY, JSON.stringify(data))
    } catch (e) {
        console.error('Failed to save QC checks:', e)
    }
}

function loadOrderAssignments() {
    try {
        const stored = localStorage.getItem('warehouse-order-assignments')
        return stored ? JSON.parse(stored) : {}
    } catch {
        return {}
    }
}

function saveOrderAssignments() {
    try {
        localStorage.setItem('warehouse-order-assignments', JSON.stringify(orderAssignments.value))
    } catch (e) {
        console.error('Failed to save order assignments:', e)
    }
}

// ==================
// Pick List Modal
// ==================

async function openPickList(wave) {
    selectedWave.value = wave
    showPickListModal.value = true
    pickListLoading.value = true
    pickListItems.value = []

    try {
        const response = await fetch(`http://localhost:8000/api/v1/inventory/pick-list/${wave.rawId}`, {
            headers: { 'Authorization': `Bearer ${authStore.authToken}`, 'Content-Type': 'application/json' }
        })

        if (response.ok) {
            const data = await response.json()
            pickListItems.value = (data.items || []).map(item => ({
                ...item,
                picked: false
            }))
        } else {
            // Fallback: show order items if pick list endpoint fails
            const orderRes = await fetch(`http://localhost:8000/api/v1/orders/${wave.rawId}`, {
                headers: { 'Authorization': `Bearer ${authStore.authToken}`, 'Content-Type': 'application/json' }
            })
            if (orderRes.ok) {
                const orderData = await orderRes.json()
                pickListItems.value = (orderData.items || []).map((item, idx) => ({
                    sku: item.sku || `ITEM-${idx + 1}`,
                    item_name: item.name || item.description || 'Item',
                    required_quantity: item.quantity || 1,
                    available_quantity: item.quantity || 1,
                    shortage_quantity: 0,
                    unit: item.unit || 'pcs',
                    scan_code: item.sku || `SCAN-${idx + 1}`,
                    zone: null,
                    aisle: null,
                    shelf: null,
                    bin: null,
                    location_path: 'Location TBD',
                    picked: false
                }))
            }
        }
    } catch (error) {
        console.error('Error fetching pick list:', error)
    } finally {
        pickListLoading.value = false
    }
}

function toggleItemPicked(item) {
    item.picked = !item.picked
}

function printPickList() {
    const printContent = pickListItems.value.map((item, idx) =>
        `${idx + 1}. ${item.item_name || item.name} (${item.sku}) - Qty: ${item.required_quantity || item.quantity} - Location: ${item.location_path || formatLocation(item)}`
    ).join('\n')

    const printWindow = window.open('', '_blank')
    printWindow.document.write(`<pre style="font-family: monospace; font-size: 14px;">
PICK LIST - Order: ${selectedWave.value?.id}
${'='.repeat(50)}
${printContent}
${'='.repeat(50)}
Printed: ${new Date().toLocaleString()}
</pre>`)
    printWindow.document.close()
    printWindow.print()
}

async function completePickList() {
    if (pickedCount.value < pickListItems.value.length) return

    showPickListModal.value = false
    if (selectedWave.value) {
        await handleWaveAction(selectedWave.value)
    }
}

// ==================
// Assign Picker
// ==================

async function openAssignPicker(wave) {
    selectedWave.value = wave
    selectedLabourer.value = null
    showAssignPickerModal.value = true
    labourersLoading.value = true

    try {
        const warehouseId = getWarehouseId()
        const url = warehouseId
            ? `http://localhost:8000/api/v1/labourers?warehouse_id=${warehouseId}&page_size=50`
            : 'http://localhost:8000/api/v1/labourers?page_size=50'

        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${authStore.authToken}`, 'Content-Type': 'application/json' }
        })

        if (response.ok) {
            const data = await response.json()
            availableLabourers.value = (data.items || []).filter(l =>
                l.status === 'AVAILABLE' || l.status === 'ACTIVE' || !l.status
            )
        }
    } catch (error) {
        console.error('Error fetching labourers:', error)
    } finally {
        labourersLoading.value = false
    }
}

async function assignPicker() {
    if (!selectedLabourer.value || !selectedWave.value) return

    assigningPicker.value = true

    try {
        const response = await fetch(
            `http://localhost:8000/api/v1/labourers/${selectedLabourer.value.id}/assign/${selectedWave.value.rawId}`,
            {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${authStore.authToken}`, 'Content-Type': 'application/json' }
            }
        )

        if (response.ok || response.status === 404) {
            // Store assignment locally
            orderAssignments.value[selectedWave.value.rawId] = {
                labourerId: selectedLabourer.value.id,
                labourerName: selectedLabourer.value.name || selectedLabourer.value.full_name
            }
            saveOrderAssignments()

            // Update the wave in the list
            const wave = waves.value.find(w => w.rawId === selectedWave.value.rawId)
            if (wave) {
                wave.assignedPicker = selectedLabourer.value.name || selectedLabourer.value.full_name
            }

            showAssignPickerModal.value = false
            actionToast.value = `${selectedLabourer.value.name || selectedLabourer.value.full_name} assigned to ${selectedWave.value.id}`
            setTimeout(() => { actionToast.value = '' }, 2500)
        }
    } catch (error) {
        console.error('Error assigning picker:', error)
    } finally {
        assigningPicker.value = false
    }
}

// ==================
// Station Monitor
// ==================

function monitorStation(station) {
    monitoredStation.value = { ...station }
    showStationMonitor.value = true
}

function closeStationMonitor() {
    showStationMonitor.value = false
    monitoredStation.value = null
}

async function refreshStationData() {
    const warehouseId = getWarehouseId()
    if (!warehouseId || !monitoredStation.value) return

    await fetchPackingStations(warehouseId)
    const updated = stations.value.find(s => s.id === monitoredStation.value.id)
    if (updated) {
        monitoredStation.value = { ...updated }
    }
}

// ==================
// Data Fetching
// ==================

async function refreshData() {
    // Keep QC checks when refreshing
    const savedQcState = {}
    for (const check of qualityChecks.value) {
        savedQcState[check.orderId] = { ...check }
    }

    await fetchPickingData()

    // Restore QC check states
    for (const check of qualityChecks.value) {
        const saved = savedQcState[check.orderId]
        if (saved) {
            Object.assign(check, saved)
        }
    }
}

async function fetchPickingData() {
    loading.value = true
    pipelineLoading.value = true
    const warehouseId = getWarehouseId()

    // Load stored assignments
    orderAssignments.value = loadOrderAssignments()

    try {
        // Fetch orders
        const response = await fetch('http://localhost:8000/api/v1/orders?page=1&page_size=100', {
            headers: { 'Authorization': `Bearer ${authStore.authToken}`, 'Content-Type': 'application/json' }
        })

        let awaitingPickOrders = []
        let pickingOrders = []
        let pickedOrders = []
        let packingOrders = []
        let packedOrders = []

        if (response.ok) {
            const data = await response.json()
            const warehouseOrders = (data.items || []).filter(order =>
                warehouseId ? order.warehouse_id === warehouseId : true
            )

            awaitingPickOrders = warehouseOrders.filter(order => {
                const substatus = getEffectiveWarehouseSubstatus(order, warehouseId)
                return order.status === 'CONFIRMED' && (!substatus || substatus === 'AWAITING_PICK')
            }).map(order => ({
                ...order,
                warehouse_substatus: getEffectiveWarehouseSubstatus(order, warehouseId) || 'AWAITING_PICK'
            }))
            pickingOrders = warehouseOrders.filter(order => getEffectiveWarehouseSubstatus(order, warehouseId) === 'PICKING')
                .map(order => ({ ...order, warehouse_substatus: 'PICKING' }))
            pickedOrders = warehouseOrders.filter(order => getEffectiveWarehouseSubstatus(order, warehouseId) === 'PICKED')
                .map(order => ({ ...order, warehouse_substatus: 'PICKED' }))
            packingOrders = warehouseOrders.filter(order => getEffectiveWarehouseSubstatus(order, warehouseId) === 'PACKING')
                .map(order => ({ ...order, warehouse_substatus: 'PACKING' }))
            packedOrders = warehouseOrders.filter(order => {
                const substatus = getEffectiveWarehouseSubstatus(order, warehouseId)
                return ['PACKED', 'QC_PASSED', 'READY_FOR_DISPATCH'].includes(substatus)
            }).map(order => ({
                ...order,
                warehouse_substatus: getEffectiveWarehouseSubstatus(order, warehouseId)
            }))
        }

        const allActiveOrders = dedupeOrders([...awaitingPickOrders, ...pickingOrders, ...pickedOrders, ...packingOrders])
        waves.value = allActiveOrders.map(order => {
            const assignment = orderAssignments.value[order.id]
            const hasUndoHistory = undoHistory.value.some(h => h.orderId === order.id)
            return {
                id: order.tracking_code || order.id?.slice(0, 8).toUpperCase(),
                type: order.order_type || 'Standard',
                priority: order.priority || order.shipping_priority || 'STANDARD',
                items: order.items?.length || order.item_count || 0,
                value: order.total_amount || 0,
                deadline: formatDate(order.scheduled_at),
                status: order.warehouse_substatus || order.status,
                statusClass: getStatusClass(order.warehouse_substatus || order.status),
                rawId: order.id,
                assignedPicker: assignment?.labourerName || null,
                canUndo: hasUndoHistory
            }
        })

        pipelineSteps.value[0].count = awaitingPickOrders.length
        pipelineSteps.value[0].active = awaitingPickOrders.length > 0
        pipelineSteps.value[1].count = pickingOrders.length + pickedOrders.length
        pipelineSteps.value[1].active = pipelineSteps.value[1].count > 0
        pipelineSteps.value[2].count = packingOrders.length
        pipelineSteps.value[2].active = packingOrders.length > 0
        pipelineSteps.value[3].count = packedOrders.length
        pipelineSteps.value[3].active = packedOrders.length > 0

        // Build quality checks from packed orders, restore from localStorage
        const storedQc = loadQcChecks()
        qualityChecks.value = packedOrders.slice(0, 5).map(order => {
            const orderId = order.tracking_code || order.id?.slice(0, 8)
            const stored = storedQc[orderId] || {}
            return {
                orderId,
                rawId: order.id,
                goodsCorrect: stored.goodsCorrect || false,
                countCorrect: stored.countCorrect || false,
                packagingOk: stored.packagingOk || false,
                laborConfirmed: stored.laborConfirmed || false,
                weightOk: stored.weightOk || false,
                labelAttached: stored.labelAttached || false,
                verified: stored.verified || false
            }
        })

        // Fetch packing stations from API
        if (warehouseId) {
            await fetchPackingStations(warehouseId)
        } else {
            // Default stations if no warehouse
            stations.value = [
                { id: 1, name: 'Pack Station 1', packer: '-- No Warehouse --', rate: 0, active: false, monitoring: false },
                { id: 2, name: 'Pack Station 2', packer: '-- No Warehouse --', rate: 0, active: false, monitoring: false },
            ]
        }

    } catch (error) {
        console.error('Error fetching picking data:', error)
    } finally {
        loading.value = false
        pipelineLoading.value = false
    }
}

async function fetchPackingStations(warehouseId) {
    try {
        const response = await fetch(`http://localhost:8000/api/v1/warehouses/${warehouseId}/operations/packing-stations`, {
            headers: { 'Authorization': `Bearer ${authStore.authToken}`, 'Content-Type': 'application/json' }
        })

        if (response.ok) {
            const data = await response.json()
            if (data.items && data.items.length > 0) {
                stations.value = data.items.map(station => ({
                    id: station.id,
                    name: station.station_number,
                    packer: station.assigned_labourer_name || (station.status === 'ACTIVE' ? 'Active' : '-- Idle --'),
                    rate: station.items_packed_today || 0,
                    active: station.status === 'ACTIVE',
                    monitoring: false,
                    currentOrderId: station.current_order_id,
                    currentOrderTracking: station.current_order_tracking
                }))
            } else {
                // No stations configured - show default
                stations.value = [
                    { id: 'default-1', name: 'Pack Station 1', packer: '-- Not Configured --', rate: 0, active: false, monitoring: false },
                    { id: 'default-2', name: 'Pack Station 2', packer: '-- Not Configured --', rate: 0, active: false, monitoring: false },
                ]
            }
        }
    } catch (error) {
        console.error('Error fetching packing stations:', error)
        stations.value = [
            { id: 'error-1', name: 'Pack Station 1', packer: '-- Error --', rate: 0, active: false, monitoring: false },
        ]
    }
}

async function updateWaveStatus(wave, targetStatus, request) {
    const warehouseId = getWarehouseId()
    if (!warehouseId) {
        actionToast.value = 'Warehouse not linked'
        setTimeout(() => { actionToast.value = '' }, 2500)
        return
    }

    try {
        const response = await fetch(request.url, request.options)
        if (!response.ok && response.status !== 404) {
            throw new Error(`Failed warehouse action: ${response.status}`)
        }
    } catch (error) {
        console.error('Warehouse action fallback:', error)
    }

    patchWarehouseOrderUiState(warehouseId, wave.rawId, {
        accepted: true,
        warehouse_substatus: targetStatus,
    })
    notifyOrdersUpdated()
    actionToast.value = `${wave.id} moved to ${targetStatus.replaceAll('_', ' ')}`
    await fetchPickingData()
    setTimeout(() => { actionToast.value = '' }, 2500)
}

async function handleWaveAction(wave) {
    const warehouseId = getWarehouseId()
    const headers = { 'Authorization': `Bearer ${authStore.authToken}`, 'Content-Type': 'application/json' }
    const previousStatus = wave.status

    if (wave.status === 'AWAITING_PICK' || wave.status === 'CONFIRMED') {
        const assignment = orderAssignments.value[wave.rawId]
        saveUndoState(wave, previousStatus, 'PICKING')
        return updateWaveStatus(wave, 'PICKING', {
            url: `http://localhost:8000/api/v1/warehouses/${warehouseId}/operations/orders/${wave.rawId}/start-picking`,
            options: { method: 'POST', headers, body: JSON.stringify({ labourer_id: assignment?.labourerId || null }) }
        })
    }

    if (wave.status === 'PICKING') {
        saveUndoState(wave, previousStatus, 'PICKED')
        return updateWaveStatus(wave, 'PICKED', {
            url: `http://localhost:8000/api/v1/warehouses/${warehouseId}/operations/orders/${wave.rawId}/complete-picking`,
            options: { method: 'POST', headers }
        })
    }

    if (wave.status === 'PICKED') {
        saveUndoState(wave, previousStatus, 'PACKING')
        return updateWaveStatus(wave, 'PACKING', {
            url: `http://localhost:8000/api/v1/warehouses/${warehouseId}/operations/orders/${wave.rawId}/start-packing`,
            options: { method: 'POST', headers, body: JSON.stringify({}) }
        })
    }

    if (wave.status === 'PACKING') {
        saveUndoState(wave, previousStatus, 'PACKED')
        return updateWaveStatus(wave, 'PACKED', {
            url: `http://localhost:8000/api/v1/warehouses/${warehouseId}/operations/orders/${wave.rawId}/complete-packing`,
            options: { method: 'POST', headers }
        })
    }
}

function toggleCheck(check, key) {
    check[key] = !check[key]
    check.verified = check.goodsCorrect && check.countCorrect && check.packagingOk && check.laborConfirmed && check.weightOk && check.labelAttached
    // Persist to localStorage
    saveQcChecks(qualityChecks.value)
}

async function triggerDispatch(check) {
    const warehouseId = getWarehouseId()
    if (!warehouseId || !check.rawId) {
        dispatchToast.value = 'Cannot dispatch - missing warehouse or order'
        setTimeout(() => { dispatchToast.value = '' }, 3000)
        return
    }

    try {
        // First create or update the quality check in the backend
        const qcResponse = await fetch(`http://localhost:8000/api/v1/warehouses/${warehouseId}/operations/orders/${check.rawId}/quality-check`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${authStore.authToken}`, 'Content-Type': 'application/json' }
        })

        if (qcResponse.ok) {
            const qcData = await qcResponse.json()

            // Update check fields
            await fetch(`http://localhost:8000/api/v1/warehouses/${warehouseId}/operations/quality-checks/${qcData.id}`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${authStore.authToken}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    goods_correct: check.goodsCorrect,
                    count_correct: check.countCorrect,
                    packaging_verified: check.packagingOk,
                    labor_assigned: check.laborConfirmed,
                    weight_verified: check.weightOk,
                    label_attached: check.labelAttached
                })
            })

            // Pass the quality check
            await fetch(`http://localhost:8000/api/v1/warehouses/${warehouseId}/operations/quality-checks/${qcData.id}/pass`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${authStore.authToken}`, 'Content-Type': 'application/json' }
            })
        }
        patchWarehouseOrderUiState(warehouseId, check.rawId, {
            accepted: true,
            warehouse_substatus: 'QC_PASSED',
        })

        // Remove from localStorage as it's now complete
        const storedQc = loadQcChecks()
        delete storedQc[check.orderId]
        localStorage.setItem(QC_STORAGE_KEY, JSON.stringify(storedQc))

        pipelineSteps.value[4].count++
        pipelineSteps.value[4].active = true
        pipelineSteps.value[3].count = Math.max(0, pipelineSteps.value[3].count - 1)
        dispatchToast.value = `${check.orderId} — Ready for Dispatch!`

        // Refresh data
        notifyOrdersUpdated()
        await fetchPickingData()
    } catch (error) {
        console.error('Error triggering dispatch:', error)
        dispatchToast.value = 'Error updating order status'
    }

    setTimeout(() => { dispatchToast.value = '' }, 3000)
}

onMounted(() => {
    window.addEventListener('warehouse-orders-updated', fetchPickingData)
    fetchPickingData()
    if (autoRefreshEnabled.value) {
        startAutoRefresh()
    }
})

onUnmounted(() => {
    window.removeEventListener('warehouse-orders-updated', fetchPickingData)
    stopAutoRefresh()
    if (undoTimeout) clearTimeout(undoTimeout)
})
</script>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
    transition: all 0.3s ease;
}
.slide-up-enter-from,
.slide-up-leave-to {
    transform: translate(-50%, 100%);
    opacity: 0;
}
</style>
