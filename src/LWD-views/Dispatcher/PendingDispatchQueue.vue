<template>
    <div class="space-y-6">
        <!-- Header -->
        <div class="flex justify-between items-center">
            <div>
                <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Pending Dispatch Queue</h2>
                <p class="text-sm text-gray-400 mt-1">Orders marked "Ready for Dispatch" by Warehouse Manager</p>
            </div>
            <div class="flex gap-2 items-center">
                <div class="text-[10px] text-gray-500 text-right hidden sm:block">
                    <div>Auto-refreshes every 30s</div>
                    <div v-if="lastRefreshed" class="text-gray-400">Updated {{ lastRefreshed }}</div>
                </div>
                <button @click="manualRefresh" :disabled="refreshing"
                    class="bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-white/10 py-2 px-3 rounded-lg transition-colors flex items-center gap-1 text-sm font-bold disabled:opacity-50">
                    <span class="material-symbols-outlined text-[18px]" :class="refreshing ? 'animate-spin' : ''">refresh</span>
                </button>
                <button @click="runGlobalFeasibilityCheck"
                    class="bg-yellow-100 dark:bg-yellow-500/15 hover:bg-yellow-200 dark:hover:bg-yellow-500/25 text-yellow-700 dark:text-yellow-400 border border-yellow-300 dark:border-yellow-500/30 py-2 px-4 rounded-lg transition-colors flex items-center gap-2 text-sm font-bold">
                    <span class="material-symbols-outlined text-[18px]">verified</span> Feasibility Check
                </button>
                <button @click="openSlip('tripManifest')"
                    class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 text-sm transition-colors">
                    <span class="material-symbols-outlined text-[18px]">assignment</span> Manifest
                </button>
                <button @click="openSlip('assetCheckout')"
                    class="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 text-sm transition-colors">
                    <span class="material-symbols-outlined text-[18px]">inventory_2</span> Asset Kit
                </button>
                <button @click="batchAssign" :disabled="selectedOrders.length === 0"
                    class="bg-primary hover:bg-primary-dark text-black font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors text-sm disabled:opacity-40 disabled:cursor-not-allowed">
                    <span class="material-symbols-outlined text-[18px]">assignment_turned_in</span> Batch Assign ({{ selectedOrders.length }})
                </button>
            </div>
        </div>

        <!-- Ready-for-dispatch alert banner -->
        <div v-if="readyCount > 0"
            class="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl animate-pulse">
            <span class="material-symbols-outlined text-emerald-400 text-[22px]">local_shipping</span>
            <div class="flex-1">
                <div class="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                    {{ readyCount }} order{{ readyCount > 1 ? 's' : '' }} ready for dispatch from warehouse!
                </div>
                <div class="text-[11px] text-emerald-600/70 dark:text-emerald-300/70">
                    Warehouse Manager has completed packing & QC. Assign a driver now.
                </div>
            </div>
            <button @click="filterReady = !filterReady"
                class="px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                :class="filterReady ? 'bg-emerald-500 text-white' : 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/30'">
                {{ filterReady ? 'Show All' : 'Show Ready Only' }}
            </button>
        </div>

        <!-- Summary Cards -->
        <div class="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div class="glass-panel p-4 rounded-xl text-center border-2"
                :class="readyCount > 0 ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-transparent'">
                <div class="text-2xl font-bold text-emerald-400 flex items-center justify-center gap-1">
                    {{ readyCount }}
                    <span v-if="readyCount > 0" class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                </div>
                <div class="text-[10px] text-gray-400 uppercase tracking-wider mt-1">Ready</div>
            </div>
            <div class="glass-panel p-4 rounded-xl text-center">
                <div class="text-2xl font-bold text-yellow-400">{{ pendingOrders.length }}</div>
                <div class="text-[10px] text-gray-400 uppercase tracking-wider mt-1">Pending</div>
            </div>
            <div class="glass-panel p-4 rounded-xl text-center">
                <div class="text-2xl font-bold text-red-400">{{ urgentCount }}</div>
                <div class="text-[10px] text-gray-400 uppercase tracking-wider mt-1">Urgent</div>
            </div>
            <div class="glass-panel p-4 rounded-xl text-center">
                <div class="text-2xl font-bold text-blue-400">{{ highCount }}</div>
                <div class="text-[10px] text-gray-400 uppercase tracking-wider mt-1">High Priority</div>
            </div>
            <div class="glass-panel p-4 rounded-xl text-center">
                <div class="text-2xl font-bold text-gray-900 dark:text-white">{{ totalWeight.toLocaleString() }} kg</div>
                <div class="text-[10px] text-gray-400 uppercase tracking-wider mt-1">Total Weight</div>
            </div>
            <div class="glass-panel p-4 rounded-xl text-center">
                <div class="text-2xl font-bold text-primary">{{ feasibleCount }}/{{ pendingOrders.length }}</div>
                <div class="text-[10px] text-gray-400 uppercase tracking-wider mt-1">Feasible</div>
            </div>
        </div>

        <!-- Filters -->
        <div class="glass-panel p-4 rounded-xl flex flex-wrap gap-3 items-center">
            <div class="relative flex-1 min-w-[200px]">
                <span class="material-symbols-outlined absolute left-3 top-2.5 text-gray-500 text-[18px]">search</span>
                <input v-model="searchQuery" type="text" placeholder="Search by Order ID, warehouse, type..."
                    class="w-full bg-gray-100 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg py-2 pl-10 pr-4 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-primary/50">
            </div>
            <select v-model="filterPriority"
                class="bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-primary/50">
                <option value="" class="bg-white dark:bg-gray-800">All Priorities</option>
                <option value="URGENT" class="bg-white dark:bg-gray-800">Urgent</option>
                <option value="HIGH" class="bg-white dark:bg-gray-800">High</option>
                <option value="NORMAL" class="bg-white dark:bg-gray-800">Normal</option>
                <option value="LOW" class="bg-white dark:bg-gray-800">Low</option>
            </select>
            <select v-model="filterWarehouse"
                class="bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-primary/50">
                <option value="" class="bg-white dark:bg-gray-800">All Warehouses</option>
                <option v-for="wh in warehouses" :key="wh" :value="wh" class="bg-white dark:bg-gray-800">{{ wh }}</option>
            </select>
            <select v-model="filterFeasibility"
                class="bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-primary/50">
                <option value="" class="bg-white dark:bg-gray-800">All Status</option>
                <option value="feasible" class="bg-white dark:bg-gray-800">Feasible</option>
                <option value="infeasible" class="bg-white dark:bg-gray-800">Not Feasible</option>
                <option value="unchecked" class="bg-white dark:bg-gray-800">Unchecked</option>
            </select>
        </div>

        <!-- Orders Table -->
        <div class="glass-panel rounded-xl overflow-hidden">
            <div class="overflow-x-auto">
                <table class="w-full text-left text-sm">
                    <thead class="bg-gray-50 dark:bg-white/5 text-gray-400 uppercase text-[10px] tracking-wider">
                        <tr>
                            <th class="p-4">
                                <input type="checkbox" v-model="selectAll"
                                    class="rounded border-gray-600 bg-gray-100 dark:bg-black/20 text-primary focus:ring-primary">
                            </th>
                            <th class="p-4">Order ID</th>
                            <th class="p-4">Pickup Warehouse</th>
                            <th class="p-4">Weight / Volume</th>
                            <th class="p-4">Labor</th>
                            <th class="p-4">Priority</th>
                            <th class="p-4">Delivery Deadline</th>
                            <th class="p-4">Special Instructions</th>
                            <th class="p-4">Feasibility</th>
                            <th class="p-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-200 dark:divide-white/5">
                        <tr v-for="order in filteredOrders" :key="order.id"
                            class="hover:bg-gray-100 dark:hover:bg-white/5 transition-colors group"
                            :class="order.loadingInProgress ? 'bg-amber-50/50 dark:bg-amber-500/5 opacity-80' : order.readyForDispatch ? 'bg-emerald-50/50 dark:bg-emerald-500/5' : ''">
                            <td class="p-4">
                                <input type="checkbox" v-model="order.selected" :disabled="order.loadingInProgress"
                                    class="rounded border-gray-600 bg-gray-100 dark:bg-black/20 text-primary focus:ring-primary disabled:opacity-40 disabled:cursor-not-allowed">
                            </td>
                            <td class="p-4">
                                <div class="font-mono text-gray-900 dark:text-white font-bold">{{ order.id }}</div>
                                <span v-if="order.loadingInProgress"
                                    class="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                                    <span class="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                                    Loading in Progress
                                </span>
                                <span v-else-if="order.readyForDispatch"
                                    class="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                    Ready for Dispatch
                                </span>
                            </td>
                            <td class="p-4">
                                <div class="flex items-center gap-2">
                                    <span
                                        class="material-symbols-outlined text-gray-500 text-[16px]">warehouse</span>
                                    <span class="text-gray-600 dark:text-gray-300">{{ order.warehouse }}</span>
                                </div>
                            </td>
                            <td class="p-4">
                                <div class="text-gray-900 dark:text-white">{{ order.weight }} kg</div>
                                <div class="text-[10px] text-gray-500">{{ order.volume }} m³</div>
                            </td>
                            <td class="p-4">
                                <div class="flex items-center gap-1" v-if="order.laborCount > 0">
                                    <span class="material-symbols-outlined text-blue-400 text-[16px]">groups</span>
                                    <span class="text-blue-400 font-bold">{{ order.laborCount }}</span>
                                </div>
                                <span v-else class="text-gray-600">—</span>
                            </td>
                            <td class="p-4">
                                <span class="px-2 py-1 rounded text-[10px] font-bold border"
                                    :class="getPriorityClass(order.priority)">
                                    {{ order.priority }}
                                </span>
                            </td>
                            <td class="p-4">
                                <div class="text-gray-900 dark:text-white text-xs">{{ order.deadline }}</div>
                                <div class="text-[10px]" :class="isDeadlineCritical(order.deadline) ? 'text-red-400' : 'text-gray-500'">
                                    {{ getTimeRemaining(order.deadline) }}
                                </div>
                            </td>
                            <td class="p-4">
                                <div v-if="order.specialInstructions" class="max-w-[150px]">
                                    <span class="text-xs text-yellow-600 dark:text-yellow-300 truncate block" :title="order.specialInstructions">
                                        {{ order.specialInstructions }}
                                    </span>
                                </div>
                                <span v-else class="text-gray-600">—</span>
                            </td>
                            <td class="p-4">
                                <div v-if="order.feasibility === 'feasible'"
                                    class="flex items-center gap-1 text-green-400 text-xs font-bold">
                                    <span class="material-symbols-outlined text-[14px]">check_circle</span> Feasible
                                </div>
                                <div v-else-if="order.feasibility === 'infeasible'"
                                    class="flex items-center gap-1 text-red-400 text-xs font-bold">
                                    <span class="material-symbols-outlined text-[14px]">cancel</span> {{ order.failReason }}
                                </div>
                                <div v-else class="flex items-center gap-1 text-gray-500 text-xs">
                                    <span class="material-symbols-outlined text-[14px]">pending</span> Unchecked
                                </div>
                            </td>
                            <td class="p-4">
                                <div class="flex gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                                    <button @click="runFeasibilityCheck(order)"
                                        class="p-1.5 bg-yellow-100 dark:bg-yellow-500/10 hover:bg-yellow-200 dark:hover:bg-yellow-500/20 rounded text-yellow-700 dark:text-yellow-400 transition-colors" title="Run Feasibility Check">
                                        <span class="material-symbols-outlined text-[16px]">verified</span>
                                    </button>
                                    <button @click="assignDriver(order)" :disabled="order.loadingInProgress"
                                        class="p-1.5 rounded transition-colors"
                                        :class="order.loadingInProgress ? 'bg-gray-100 dark:bg-white/5 text-gray-400 cursor-not-allowed opacity-50' : 'bg-green-100 dark:bg-primary/10 hover:bg-green-200 dark:hover:bg-primary/20 text-green-700 dark:text-primary'"
                                        :title="order.loadingInProgress ? 'Awaiting warehouse release' : 'Assign Driver'">
                                        <span class="material-symbols-outlined text-[16px]">person_add</span>
                                    </button>
                                    <button @click="escalateOrder(order)" class="p-1.5 rounded transition-colors" :class="order.priority === 'URGENT' ? 'bg-yellow-100 dark:bg-yellow-500/10 hover:bg-yellow-200 dark:hover:bg-yellow-500/20 text-yellow-700 dark:text-yellow-400' : 'bg-blue-100 dark:bg-blue-500/10 hover:bg-blue-200 dark:hover:bg-blue-500/20 text-blue-700 dark:text-blue-400'" :title="order.priority === 'URGENT' ? 'Set Normal' : 'Escalate to Urgent'">
                                        <span class="material-symbols-outlined text-[16px]">{{ order.priority === 'URGENT' ? 'arrow_downward' : 'arrow_upward' }}</span>
                                    </button>
                                    <button @click="holdOrder(order)" class="p-1.5 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/15 rounded text-gray-600 dark:text-gray-400 transition-colors" title="Hold Order">
                                        <span class="material-symbols-outlined text-[16px]">pause_circle</span>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Feasibility Check Modal -->
        <Teleport to="body">
        <div v-if="showFeasibilityModal"
            class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div class="bg-white dark:bg-card-dark border border-gray-200 dark:border-white/10 rounded-2xl p-6 w-full max-w-2xl shadow-2xl">
                <div class="flex justify-between items-center mb-6">
                    <h3 class="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <span class="material-symbols-outlined text-yellow-400">verified</span>
                        Dispatch Feasibility Validator
                    </h3>
                    <button @click="showFeasibilityModal = false" class="text-gray-400 hover:text-gray-900 dark:text-white">
                        <span class="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div class="space-y-4">
                    <!-- Vehicle Capacity Check -->
                    <div class="p-4 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/5">
                        <div class="flex items-center justify-between mb-2">
                            <span class="font-bold text-gray-900 dark:text-white text-sm flex items-center gap-2">
                                <span class="material-symbols-outlined text-blue-400 text-[18px]">local_shipping</span>
                                Vehicle Capacity Check
                            </span>
                            <span class="px-2 py-0.5 rounded text-[10px] font-bold" :class="feasCheckOrder?.weight <= 1000 ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'">
                                {{ feasCheckOrder?.weight <= 1000 ? 'PASS' : 'HEAVY' }}
                            </span>
                        </div>
                        <div class="grid grid-cols-3 gap-3 text-xs">
                            <div>
                                <span class="text-gray-500 block">Weight</span>
                                <span class="text-gray-900 dark:text-white">{{ feasCheckOrder?.weight }} / 2000 kg</span>
                                <div class="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded mt-1">
                                    <div class="h-full rounded" :class="(feasCheckOrder?.weight / 2000 * 100) > 70 ? 'bg-yellow-500' : 'bg-green-500'" :style="{ width: Math.min(100, (feasCheckOrder?.weight / 2000) * 100) + '%' }"></div>
                                </div>
                            </div>
                            <div>
                                <span class="text-gray-500 block">Volume</span>
                                <span class="text-gray-900 dark:text-white">{{ feasCheckOrder?.volume }} / 12 m³</span>
                                <div class="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded mt-1">
                                    <div class="h-full bg-green-500 rounded" :style="{ width: Math.min(100, (feasCheckOrder?.volume / 12) * 100) + '%' }"></div>
                                </div>
                            </div>
                            <div>
                                <span class="text-gray-500 block">Labor</span>
                                <span class="text-gray-900 dark:text-white">{{ feasCheckOrder?.laborCount || 0 }} crew needed</span>
                                <div class="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded mt-1">
                                    <div class="h-full rounded" :class="feasCheckOrder?.laborCount > 2 ? 'bg-yellow-500' : 'bg-green-500'" :style="{ width: Math.min(100, ((feasCheckOrder?.laborCount || 0) / 5) * 100) + '%' }"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Driver Availability -->
                    <div class="p-4 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/5">
                        <div class="flex items-center justify-between mb-2">
                            <span class="font-bold text-gray-900 dark:text-white text-sm flex items-center gap-2">
                                <span class="material-symbols-outlined text-purple-400 text-[18px]">badge</span>
                                Driver Availability
                            </span>
                            <span class="px-2 py-0.5 rounded bg-green-500/20 text-green-400 text-[10px] font-bold">AVAILABLE</span>
                        </div>
                        <div class="grid grid-cols-3 gap-3 text-xs">
                            <div>
                                <span class="text-gray-500 block">Driver Status</span>
                                <span class="text-green-400 font-bold">Free</span>
                            </div>
                            <div>
                                <span class="text-gray-500 block">Working Hours</span>
                                <span class="text-gray-900 dark:text-white">4.2h / 10h max</span>
                            </div>
                            <div>
                                <span class="text-gray-500 block">HOS Compliance</span>
                                <span class="text-green-400 flex items-center gap-1">
                                    <span class="material-symbols-outlined text-[12px]">check</span> Within limits
                                </span>
                            </div>
                        </div>
                    </div>

                    <!-- Delivery Window -->
                    <div class="p-4 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/5">
                        <div class="flex items-center justify-between mb-2">
                            <span class="font-bold text-gray-900 dark:text-white text-sm flex items-center gap-2">
                                <span class="material-symbols-outlined text-orange-400 text-[18px]">schedule</span>
                                Delivery Window Check
                            </span>
                            <span class="px-2 py-0.5 rounded text-[10px] font-bold"
                                :class="isDeadlineCritical(feasCheckOrder?.deadline) ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'">
                                {{ isDeadlineCritical(feasCheckOrder?.deadline) ? 'TIGHT' : 'ON TRACK' }}
                            </span>
                        </div>
                        <div class="grid grid-cols-3 gap-3 text-xs">
                            <div>
                                <span class="text-gray-500 block">Deadline</span>
                                <span class="text-gray-900 dark:text-white">{{ feasCheckOrder?.deadline }}</span>
                            </div>
                            <div>
                                <span class="text-gray-500 block">Remaining</span>
                                <span :class="isDeadlineCritical(feasCheckOrder?.deadline) ? 'text-red-400' : 'text-gray-900 dark:text-white'">{{ getTimeRemaining(feasCheckOrder?.deadline) }}</span>
                            </div>
                            <div>
                                <span class="text-gray-500 block">Priority</span>
                                <span class="text-gray-900 dark:text-white">{{ feasCheckOrder?.priority }}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="flex gap-3 mt-6">
                    <button @click="approveAndAssign"
                        class="flex-1 bg-primary hover:bg-primary-dark text-black font-bold py-2.5 rounded-lg transition-colors">
                        Approve & Assign
                    </button>
                    <button @click="holdFeasOrder"
                        class="flex-1 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/15 text-gray-900 dark:text-white font-bold py-2.5 rounded-lg transition-colors">
                        Hold Order
                    </button>
                    <button @click="escalateFeasOrder"
                        class="bg-red-500/10 dark:bg-red-500/20 hover:bg-red-500/20 dark:hover:bg-red-500/30 text-red-600 dark:text-red-400 font-bold py-2.5 px-4 rounded-lg transition-colors">
                        Escalate
                    </button>
                </div>
                <div v-if="feasibilityToast" class="mt-3 text-center text-xs font-bold" :class="feasibilityToast.includes('Assigned') ? 'text-green-400' : feasibilityToast.includes('Hold') ? 'text-yellow-400' : 'text-red-400'">
                    {{ feasibilityToast }}
                </div>
            </div>
        </div>
        </Teleport>

    <!-- Assign Driver Modal -->
    <Teleport to="body">
    <div v-if="showAssignConfirm" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center" @click.self="showAssignConfirm = false">
        <div class="bg-white dark:bg-card-darker rounded-2xl p-6 w-full max-w-md m-4 border border-gray-200 dark:border-white/10 shadow-2xl">
            <h3 class="font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
                <span class="material-symbols-outlined text-primary">assignment_turned_in</span> Assign Driver & Vehicle
            </h3>
            <p class="text-xs text-gray-500 dark:text-gray-400 mb-4">
                Order <strong class="text-gray-900 dark:text-white">{{ assignConfirmOrder?.trackingCode || assignConfirmOrder?.id }}</strong>
                · {{ assignConfirmOrder?.priority }}
            </p>
            <div class="space-y-3">
                <div>
                    <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Driver <span class="text-red-500">*</span></label>
                    <select v-model="assignDriverId"
                        class="w-full bg-gray-100 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none">
                        <option value="" class="bg-white dark:bg-gray-800">— Select Driver —</option>
                        <option v-for="d in assignDrivers" :key="d.id" :value="d.id" class="bg-white dark:bg-gray-800">
                            {{ d.name }} ({{ d.status }}){{ d.vehicle ? ' · ' + d.vehicle : '' }}
                        </option>
                    </select>
                    <p v-if="assignDriversLoading" class="text-xs text-gray-400 mt-1">Loading drivers...</p>
                    <p v-if="!assignDriversLoading && assignDrivers.length === 0" class="text-xs text-red-400 mt-1">No drivers available. Ask Logistic Manager to add drivers.</p>
                </div>
                <div>
                    <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Vehicle <span class="text-red-500">*</span></label>
                    <select v-model="assignVehicleId"
                        class="w-full bg-gray-100 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none">
                        <option value="" class="bg-white dark:bg-gray-800">— Select Vehicle —</option>
                        <option v-for="v in assignVehicles" :key="v.id" :value="v.id" class="bg-white dark:bg-gray-800">
                            {{ v.code }} · {{ v.type }}{{ v.license_plate ? ' (' + v.license_plate + ')' : '' }}
                        </option>
                    </select>
                    <p v-if="assignVehiclesLoading" class="text-xs text-gray-400 mt-1">Loading vehicles...</p>
                </div>
            </div>
            <div v-if="assignError" class="mt-3 text-xs text-red-400 font-bold">{{ assignError }}</div>
            <div v-if="assignSuccess" class="mt-3 text-xs text-green-400 font-bold">{{ assignSuccess }}</div>
            <div class="flex gap-2 mt-5">
                <button @click="confirmAssign" :disabled="!assignDriverId || !assignVehicleId || isAssigning"
                    class="flex-1 bg-primary hover:bg-primary-dark text-black font-bold py-2 rounded-lg text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
                    <span v-if="isAssigning" class="w-3.5 h-3.5 rounded-full border-2 border-black/30 border-t-black animate-spin"></span>
                    {{ isAssigning ? 'Assigning...' : 'Confirm Assignment' }}
                </button>
                <button @click="showAssignConfirm = false" class="flex-1 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-900 dark:text-white py-2 rounded-lg text-sm transition-colors">Cancel</button>
            </div>
        </div>
    </div>
    </Teleport>

    <!-- Batch Assign Confirm Modal -->
    <Teleport to="body">
    <div v-if="showBatchConfirm" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center" @click.self="showBatchConfirm = false">
        <div class="bg-white dark:bg-card-dark rounded-2xl p-6 w-full max-w-md m-4 border border-gray-200 dark:border-white/10 shadow-2xl">
            <h3 class="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <span class="material-symbols-outlined text-primary">assignment_turned_in</span> Confirm Batch Assignment
            </h3>
            <p class="text-sm text-gray-600 dark:text-gray-300 mb-3">
                Dispatch <strong>{{ selectedOrders.length }}</strong> selected orders to available drivers?
            </p>
            <div class="max-h-32 overflow-y-auto space-y-1 mb-4">
                <div v-for="order in selectedOrders" :key="order.id" class="text-xs p-2 bg-gray-50 dark:bg-white/5 rounded-lg flex justify-between">
                    <span class="text-gray-900 dark:text-white font-bold">{{ order.id }}</span>
                    <span class="text-gray-500">{{ order.weight }}kg • {{ order.priority }}</span>
                </div>
            </div>
            <div class="flex gap-2">
                <button @click="confirmBatchAssign" class="flex-1 bg-primary hover:bg-primary-dark text-black font-bold py-2 rounded-lg text-sm transition-colors">Dispatch All</button>
                <button @click="showBatchConfirm = false" class="flex-1 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-900 dark:text-white py-2 rounded-lg text-sm transition-colors">Cancel</button>
            </div>
            <div v-if="batchToast" class="mt-3 text-center text-xs text-green-500 font-bold">{{ batchToast }}</div>
        </div>
    </div>
    </Teleport>
    </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useDispatcherStore } from '@/stores/dispatcherStore'
import { getStoredAccessToken } from '@/config/api'
import { useSlipPrinter } from '@/composables/useSlipPrinter'

const { openSlip } = useSlipPrinter()

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
function authHeaders() {
    const token = getStoredAccessToken()
    return token ? { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } : { 'Content-Type': 'application/json' }
}

const store = useDispatcherStore()

function onWarehouseUpdate() {
    store.fetchOrders().catch(() => {})
}

onMounted(() => {
    store.initialize().catch(() => {})
    window.addEventListener('warehouse-orders-updated', onWarehouseUpdate)
})

onUnmounted(() => {
    window.removeEventListener('warehouse-orders-updated', onWarehouseUpdate)
})

const searchQuery = ref('')
const filterPriority = ref('')
const filterWarehouse = ref('')
const filterFeasibility = ref('')
const filterReady = ref(false)
const refreshing = ref(false)
const lastRefreshed = ref('')

async function manualRefresh() {
    refreshing.value = true
    try {
        await store.fetchOrders()
        const now = new Date()
        lastRefreshed.value = `${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}:${now.getSeconds().toString().padStart(2,'0')}`
    } finally {
        refreshing.value = false
    }
}
const selectAll = ref(false)
const showFeasibilityModal = ref(false)
const feasCheckOrder = ref(null)
const feasibilityToast = ref('')
const showAssignConfirm = ref(false)
const assignConfirmOrder = ref(null)
const assignDriverId = ref('')
const assignVehicleId = ref('')
const assignDrivers = ref([])
const assignVehicles = ref([])
const assignDriversLoading = ref(false)
const assignVehiclesLoading = ref(false)
const isAssigning = ref(false)
const assignError = ref('')
const assignSuccess = ref('')
const showBatchConfirm = ref(false)
const batchToast = ref('')

const warehouses = computed(() => store.hubs.map(h => h.name))

const pendingOrders = ref([])

watch(() => store.pendingOrders, (list) => {
    pendingOrders.value = list.map(o => ({ ...o, selected: false, feasibility: o.feasibility || 'unchecked' }))
}, { immediate: true })

const urgentCount = computed(() => pendingOrders.value.filter(o => o.priority === 'URGENT').length)
const highCount = computed(() => pendingOrders.value.filter(o => o.priority === 'HIGH').length)
const totalWeight = computed(() => pendingOrders.value.reduce((sum, o) => sum + o.weight, 0))
const feasibleCount = computed(() => pendingOrders.value.filter(o => o.feasibility === 'feasible').length)
const selectedOrders = computed(() => pendingOrders.value.filter(o => o.selected))
const readyCount = computed(() => pendingOrders.value.filter(o => o.readyForDispatch).length)

watch(selectAll, (val) => { pendingOrders.value.forEach(o => { o.selected = val }) })

const filteredOrders = computed(() => {
    const list = pendingOrders.value.filter(o => {
        if (filterReady.value && (!o.readyForDispatch || o.loadingInProgress)) return false
        if (searchQuery.value && !o.id.toLowerCase().includes(searchQuery.value.toLowerCase()) && !o.warehouse.toLowerCase().includes(searchQuery.value.toLowerCase())) return false
        if (filterPriority.value && o.priority !== filterPriority.value) return false
        if (filterWarehouse.value && o.warehouse !== filterWarehouse.value) return false
        if (filterFeasibility.value && o.feasibility !== filterFeasibility.value) return false
        return true
    })
    // Ready-for-dispatch orders float to the top
    return [...list].sort((a, b) => (b.readyForDispatch ? 1 : 0) - (a.readyForDispatch ? 1 : 0))
})

function getPriorityClass(priority) {
    const map = {
        URGENT: 'bg-red-500/20 text-red-400 border-red-500/30',
        HIGH: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
        NORMAL: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        LOW: 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
    return map[priority] || map.NORMAL
}

function isDeadlineCritical(deadline) {
    if (!deadline) return false
    const diff = new Date(deadline) - new Date()
    return diff < 3 * 60 * 60 * 1000
}

function getTimeRemaining(deadline) {
    if (!deadline) return '--'
    const diff = new Date(deadline) - new Date()
    if (diff < 0) return 'OVERDUE'
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    return `${hours}h ${mins}m remaining`
}

function runFeasibilityCheck(order) {
    feasCheckOrder.value = order
    feasibilityToast.value = ''
    showFeasibilityModal.value = true
}

function runGlobalFeasibilityCheck() {
    pendingOrders.value.forEach(o => {
        if (o.feasibility === 'unchecked') {
            o.feasibility = o.weight > 1000 ? 'infeasible' : 'feasible'
            o.failReason = o.weight > 1000 ? 'Overweight' : ''
        }
    })
}

function approveAndAssign() {
    if (feasCheckOrder.value) {
        feasCheckOrder.value.feasibility = 'feasible'
        feasCheckOrder.value.failReason = ''
        feasibilityToast.value = `✓ ${feasCheckOrder.value.id} — Assigned to next available driver`
        setTimeout(() => {
            const idx = pendingOrders.value.findIndex(o => o.id === feasCheckOrder.value.id)
            if (idx > -1) pendingOrders.value.splice(idx, 1)
            showFeasibilityModal.value = false
        }, 1200)
    }
}

function holdFeasOrder() {
    if (feasCheckOrder.value) {
        feasibilityToast.value = `⏸ ${feasCheckOrder.value.id} — Hold placed`
        setTimeout(() => { showFeasibilityModal.value = false }, 1000)
    }
}

function escalateFeasOrder() {
    if (feasCheckOrder.value) {
        feasibilityToast.value = `⬆ ${feasCheckOrder.value.id} — Escalated to Manager`
        setTimeout(() => { showFeasibilityModal.value = false }, 1000)
    }
}

async function assignDriver(order) {
    assignConfirmOrder.value = order
    assignDriverId.value = ''
    assignVehicleId.value = ''
    assignError.value = ''
    assignSuccess.value = ''
    showAssignConfirm.value = true
    // Fetch drivers, vehicles, and active orders to filter out busy ones
    assignDriversLoading.value = true
    assignVehiclesLoading.value = true
    try {
        const warehouseId = assignConfirmOrder.value?.warehouseId
        const fetches = [
            fetch(`${API_BASE}/api/v1/logistics/drivers`, { headers: authHeaders() }),
            fetch(`${API_BASE}/api/v1/logistics/vehicles`, { headers: authHeaders() }),
            fetch(`${API_BASE}/api/v1/orders?status_filter=ASSIGNED&page_size=100`, { headers: authHeaders() }),
            fetch(`${API_BASE}/api/v1/orders?status_filter=IN_TRANSIT&page_size=100`, { headers: authHeaders() }),
        ]
        if (warehouseId) {
            fetches.push(fetch(`${API_BASE}/api/v1/warehouses/${warehouseId}/operations/loading-docks`, { headers: authHeaders() }))
        }
        const [dRes, vRes, aRes, tRes, docksRes] = await Promise.all(fetches)
        const allDrivers = dRes.ok ? await dRes.json() : []
        const allVehicles = vRes.ok ? await vRes.json() : []
        const assignedOrders = aRes.ok ? await aRes.json() : []
        const transitOrders = tRes.ok ? await tRes.json() : []
        const activeOrders = [...(Array.isArray(assignedOrders) ? assignedOrders : assignedOrders.items || []), ...(Array.isArray(transitOrders) ? transitOrders : transitOrders.items || [])]

        // Drivers already on an active order
        const busyDriverIds = new Set(activeOrders.map(o => String(o.assigned_driver_id)).filter(Boolean))
        assignDrivers.value = allDrivers.filter(d => !busyDriverIds.has(String(d.id)))

        // Vehicle already assigned to this order (set by warehouse at loading dock)
        const preAssignedVehicleId = assignConfirmOrder.value?.vehicleId
            ? String(assignConfirmOrder.value.vehicleId) : null

        // Collect vehicles on occupied docks (still loading, not yet released)
        const docksData = docksRes?.ok ? await docksRes.json() : null
        const dockedVehicleIds = new Set(
            (docksData?.items || [])
                .filter(d => d.status === 'OCCUPIED' && d.assigned_vehicle_id)
                .map(d => String(d.assigned_vehicle_id))
        )

        // Vehicles already committed to another ASSIGNED/IN_TRANSIT order — exclude these
        const busyVehicleIds = new Set(activeOrders.map(o => String(o.assigned_vehicle_id)).filter(Boolean))

        // If warehouse already picked a vehicle for this order, show ONLY that vehicle (locked)
        const vehicleArr = Array.isArray(allVehicles) ? allVehicles : (allVehicles.items || [])
        let dispatchable
        if (preAssignedVehicleId) {
            // Warehouse pre-selected — restrict to just that vehicle
            const v = vehicleArr.find(v => String(v.id) === preAssignedVehicleId)
            dispatchable = v ? [v] : []
            assignVehicleId.value = preAssignedVehicleId
        } else {
            // No pre-selection — show vehicles on occupied docks or "In Use" (not on another active order)
            dispatchable = vehicleArr.filter(v => {
                const id = String(v.id)
                if (busyVehicleIds.has(id)) return false
                if (v.status === 'Active' && dockedVehicleIds.has(id)) return true
                if (v.status === 'In Use') return true
                return false
            })
            if (dispatchable.length === 1) assignVehicleId.value = String(dispatchable[0].id)
        }

        assignVehicles.value = dispatchable
    } catch (_) {
        assignDrivers.value = []
        assignVehicles.value = []
    } finally {
        assignDriversLoading.value = false
        assignVehiclesLoading.value = false
    }
}

async function confirmAssign() {
    if (!assignConfirmOrder.value || !assignDriverId.value || !assignVehicleId.value) return
    isAssigning.value = true
    assignError.value = ''
    assignSuccess.value = ''
    try {
        const res = await fetch(`${API_BASE}/api/v1/orders/${assignConfirmOrder.value.id}/assign`, {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify({ driver_id: assignDriverId.value, vehicle_id: assignVehicleId.value }),
        })
        if (res.ok) {
            assignSuccess.value = `✓ Order assigned successfully`
            setTimeout(() => {
                const idx = pendingOrders.value.findIndex(o => o.id === assignConfirmOrder.value.id)
                if (idx > -1) pendingOrders.value.splice(idx, 1)
                showAssignConfirm.value = false
                store.fetchOrders().catch(() => {})
            }, 900)
        } else {
            const err = await res.json().catch(() => ({}))
            assignError.value = err.detail || 'Assignment failed. Please try again.'
        }
    } catch (_) {
        assignError.value = 'Network error. Please try again.'
    } finally {
        isAssigning.value = false
    }
}

function escalateOrder(order) {
    order.priority = order.priority === 'URGENT' ? 'NORMAL' : 'URGENT'
}

function holdOrder(order) {
    order.feasibility = 'infeasible'
    order.failReason = 'On Hold'
}

function batchAssign() {
    showBatchConfirm.value = true
}

function confirmBatchAssign() {
    const count = selectedOrders.value.length
    const ids = selectedOrders.value.map(o => o.id)
    batchToast.value = `✓ ${count} order${count > 1 ? 's' : ''} dispatched successfully`
    setTimeout(() => {
        pendingOrders.value = pendingOrders.value.filter(o => !ids.includes(o.id))
        selectAll.value = false
        setTimeout(() => { showBatchConfirm.value = false; batchToast.value = '' }, 300)
    }, 1200)
}
</script>
