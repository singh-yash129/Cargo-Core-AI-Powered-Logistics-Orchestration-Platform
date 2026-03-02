<template>
    <div class="space-y-6">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Reverse Logistics & Returns</h2>
                <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage returns, pickups and warehouse
                    notifications</p>
            </div>
            <div class="flex gap-2">
                <div class="relative hidden sm:block">
                    <input v-model="searchQuery" type="text" placeholder="Search returns or customers..."
                        class="w-64 bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-purple-500 transition-colors shadow-sm">
                    <span class="material-symbols-outlined absolute left-3 top-2.5 text-gray-400 text-lg">search</span>
                </div>
                <button @click="showNewReturnModal = true"
                    class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg flex items-center gap-2 transition-colors shadow-sm text-sm">
                    <span class="material-symbols-outlined text-sm">add</span> <span class="hidden sm:inline">New
                        Return</span>
                </button>
            </div>
        </div>

        <!-- Action Cards -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div
                class="bg-white dark:bg-black/20 border border-gray-100 dark:border-white/5 p-6 rounded-xl border-l-4 border-l-purple-500 shadow-sm flex flex-col justify-between">
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <div class="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase tracking-wider mb-1">
                            Pending Review</div>
                        <div class="text-3xl font-bold text-gray-900 dark:text-white">{{ pendingReviewCount }}</div>
                    </div>
                    <div class="p-2 bg-purple-50 dark:bg-purple-500/10 rounded-lg">
                        <span
                            class="material-symbols-outlined text-purple-600 dark:text-purple-400 text-2xl">assignment_late</span>
                    </div>
                </div>
                <button @click="showProcessModal = true"
                    class="w-full py-2 bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400 rounded-lg text-sm font-bold hover:bg-purple-600 hover:text-white transition-colors flex items-center justify-center gap-2 mt-2">
                    <span class="material-symbols-outlined text-sm">fact_check</span> Process Requests
                </button>
            </div>

            <div
                class="bg-white dark:bg-black/20 border border-gray-100 dark:border-white/5 p-6 rounded-xl border-l-4 border-l-blue-500 shadow-sm flex flex-col justify-between">
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <div class="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase tracking-wider mb-1">
                            Pickups Needed</div>
                        <div class="text-3xl font-bold text-gray-900 dark:text-white">{{ pickupsNeededCount }}</div>
                    </div>
                    <div class="p-2 bg-blue-50 dark:bg-blue-500/10 rounded-lg">
                        <span
                            class="material-symbols-outlined text-blue-600 dark:text-blue-400 text-2xl">local_shipping</span>
                    </div>
                </div>
                <button @click="showAutoAssignModal = true"
                    class="w-full py-2 bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 rounded-lg text-sm font-bold hover:bg-blue-600 hover:text-white transition-colors flex items-center justify-center gap-2 mt-2">
                    <span class="material-symbols-outlined text-sm">smart_toy</span> AI Auto-Assign
                </button>
            </div>

            <div
                class="bg-white dark:bg-black/20 border border-gray-100 dark:border-white/5 p-6 rounded-xl border-l-4 border-l-orange-500 shadow-sm flex flex-col justify-between">
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <div class="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase tracking-wider mb-1">In
                            Transit</div>
                        <div class="text-3xl font-bold text-gray-900 dark:text-white">{{ inTransitCount }}</div>
                    </div>
                    <div class="p-2 bg-orange-50 dark:bg-orange-500/10 rounded-lg">
                        <span
                            class="material-symbols-outlined text-orange-600 dark:text-orange-400 text-2xl">transfer_within_a_station</span>
                    </div>
                </div>
                <div
                    class="w-full h-8 bg-gray-50 dark:bg-white/5 rounded-lg flex items-center justify-center text-xs text-gray-500 dark:text-gray-400 font-medium mt-2">
                    Monitoring {{ inTransitCount }} vehicles
                </div>
            </div>

            <div
                class="bg-white dark:bg-black/20 border border-gray-100 dark:border-white/5 p-6 rounded-xl border-l-4 border-l-green-500 shadow-sm flex flex-col justify-between">
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <div class="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase tracking-wider mb-1">
                            Completed</div>
                        <div class="text-3xl font-bold text-gray-900 dark:text-white">156</div>
                    </div>
                    <div class="p-2 bg-green-50 dark:bg-green-500/10 rounded-lg">
                        <span
                            class="material-symbols-outlined text-green-600 dark:text-green-400 text-2xl">warehouse</span>
                    </div>
                </div>
                <button
                    class="w-full py-2 bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 rounded-lg text-sm font-bold hover:bg-green-600 hover:text-white transition-colors flex items-center justify-center gap-2 mt-2">
                    <span class="material-symbols-outlined text-sm">bar_chart</span> View Report
                </button>
            </div>
        </div>

        <!-- Returns List -->
        <div
            class="bg-white dark:bg-black/20 border border-gray-100 dark:border-white/5 rounded-xl overflow-hidden shadow-sm">
            <div
                class="p-4 sm:p-6 border-b border-gray-100 dark:border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50 dark:bg-white/5">
                <h3 class="font-bold text-gray-900 dark:text-white">Active Return Requests</h3>

                <!-- Filter Tabs -->
                <div
                    class="flex bg-gray-200 dark:bg-white/10 rounded-lg p-1 overflow-x-auto no-scrollbar w-full sm:w-auto">
                    <button v-for="filter in ['All', 'Pending Review', 'Approved', 'Pickup Scheduled', 'In Transit']"
                        :key="filter" @click="activeListFilter = filter"
                        class="px-4 py-1.5 rounded-md text-xs font-bold transition-all whitespace-nowrap"
                        :class="activeListFilter === filter ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'">
                        {{ filter }}
                    </button>
                </div>
            </div>

            <div class="overflow-x-auto">
                <table class="w-full text-left text-sm min-w-[1000px]">
                    <thead
                        class="bg-gray-50 dark:bg-black/40 text-gray-500 dark:text-gray-400 uppercase text-[10px] tracking-wider font-bold">
                        <tr>
                            <th class="p-4 pl-6">Return Info</th>
                            <th class="p-4">Customer details</th>
                            <th class="p-4">Item & Reason</th>
                            <th class="p-4">Status</th>
                            <th class="p-4">Warehouse</th>
                            <th class="p-4 text-right pr-6">Action</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100 dark:divide-white/5">
                        <tr v-for="item in filteredReturns" :key="item.id"
                            class="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group cursor-pointer"
                            @click.self="openReturnDetail(item)">

                            <td class="p-4 pl-6" @click="openReturnDetail(item)">
                                <div
                                    class="font-mono text-xs font-bold px-2 py-1 rounded bg-gray-100 dark:bg-white/10 inline-block text-gray-800 dark:text-gray-200 mb-1">
                                    {{ item.id }}
                                </div>
                                <div class="text-[10px] text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                    <span class="material-symbols-outlined text-[12px]">schedule</span> {{
                                        item.dateAdded }}
                                </div>
                            </td>

                            <td class="p-4" @click="openReturnDetail(item)">
                                <div class="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <div
                                        class="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-[10px]">
                                        {{ item.customerInitials }}
                                    </div>
                                    {{ item.customer }}
                                </div>
                                <div class="text-xs text-gray-500 dark:text-gray-400 truncate mt-1 max-w-[150px]">{{
                                    item.address }}</div>
                            </td>

                            <td class="p-4" @click="openReturnDetail(item)">
                                <div class="text-sm font-medium text-gray-900 dark:text-gray-200">{{ item.item }}</div>
                                <div class="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                                    <span class="material-symbols-outlined text-[12px] text-red-400"
                                        v-if="item.reason.includes('Defect') || item.reason.includes('Damaged')">warning</span>
                                    {{ item.reason }}
                                </div>
                            </td>

                            <td class="p-4" @click="openReturnDetail(item)">
                                <span class="px-2.5 py-1 rounded-full text-xs font-bold border"
                                    :class="item.statusClass">
                                    {{ item.status }}
                                </span>
                            </td>

                            <td class="p-4" @click="openReturnDetail(item)">
                                <div class="flex items-center gap-2">
                                    <span class="w-2.5 h-2.5 rounded-full shadow-sm"
                                        :class="item.warehouseStatus === 'Notified' ? 'bg-green-500' : (item.warehouseStatus === 'Received' ? 'bg-blue-500' : 'bg-gray-400 dark:bg-gray-600')"></span>
                                    <span class="text-xs font-medium text-gray-700 dark:text-gray-300">{{
                                        item.warehouseStatus }}</span>
                                </div>
                            </td>

                            <td class="p-4 pr-6">
                                <div class="flex justify-end gap-2 relative">
                                    <button @click.stop="openReturnDetail(item)"
                                        class="p-2 bg-gray-100 dark:bg-white/5 rounded-lg hover:bg-gray-200 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300 transition-colors tooltip-trigger">
                                        <span class="material-symbols-outlined text-sm">visibility</span>
                                        <span class="tooltip">View Details</span>
                                    </button>

                                    <button v-if="item.status === 'Approved'" @click.stop="schedulePickup(item)"
                                        class="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1 shadow-sm">
                                        <span class="material-symbols-outlined text-[14px]">calendar_add_on</span>
                                        Schedule
                                    </button>

                                    <button v-if="item.status === 'Pending Review'"
                                        @click.stop="showProcessModal = true"
                                        class="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1 shadow-sm">
                                        <span class="material-symbols-outlined text-[14px]">fact_check</span> Review
                                    </button>
                                </div>
                            </td>
                        </tr>

                        <tr v-if="filteredReturns.length === 0">
                            <td colspan="6" class="p-8 text-center text-gray-500 dark:text-gray-400">
                                <div class="flex flex-col items-center justify-center">
                                    <span
                                        class="material-symbols-outlined text-4xl mb-2 text-gray-300 dark:text-gray-600">inbox</span>
                                    <p>No returns found matching your criteria.</p>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Detail Modal -->
        <Teleport to="body">
            <div v-if="showDetailModal"
                class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-6"
                @click.self="showDetailModal = false">
                <div
                    class="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-2xl shadow-2xl border border-gray-100 dark:border-white/10 overflow-hidden flex flex-col max-h-[90vh]">
                    <div
                        class="p-6 border-b border-gray-100 dark:border-white/5 flex justify-between items-start bg-gray-50 dark:bg-white/5">
                        <div>
                            <div class="flex items-center gap-3 mb-2">
                                <div
                                    class="font-mono text-sm font-bold bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 px-2 py-1 rounded inline-block text-gray-800 dark:text-gray-200">
                                    {{ selectedReturn?.id }}
                                </div>
                                <span class="px-2.5 py-1 rounded-full text-xs font-bold border"
                                    :class="selectedReturn?.statusClass">
                                    {{ selectedReturn?.status }}
                                </span>
                            </div>
                            <h3 class="text-xl font-bold text-gray-900 dark:text-white mt-1">Return Details</h3>
                        </div>
                        <button @click="showDetailModal = false"
                            class="text-gray-400 hover:text-gray-600 dark:hover:text-white bg-white dark:bg-black/20 p-2 rounded-full border border-gray-200 dark:border-white/10 transition-colors">
                            <span class="material-symbols-outlined text-sm">close</span>
                        </button>
                    </div>

                    <div class="p-6 overflow-y-auto custom-scrollbar flex-1 bg-white dark:bg-black/10 space-y-6">
                        <!-- Customer & Product Info -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div
                                class="bg-gray-50 dark:bg-white/5 rounded-xl p-4 border border-gray-100 dark:border-white/5">
                                <h4
                                    class="text-xs uppercase font-bold text-gray-400 tracking-wider mb-3 flex items-center gap-2">
                                    <span class="material-symbols-outlined text-[14px]">person</span> Customer
                                    Information
                                </h4>
                                <div class="space-y-2">
                                    <div class="flex justify-between">
                                        <span class="text-sm text-gray-500">Name</span>
                                        <span class="text-sm font-bold text-gray-900 dark:text-white">{{
                                            selectedReturn?.customer }}</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="text-sm text-gray-500">Phone</span>
                                        <span class="text-sm text-gray-900 dark:text-gray-200">{{ selectedReturn?.phone
                                            || '+1 (555) 123-4567' }}</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="text-sm text-gray-500">Address</span>
                                        <span
                                            class="text-sm text-gray-900 dark:text-gray-200 text-right max-w-[150px] truncate"
                                            :title="selectedReturn?.address">{{ selectedReturn?.address }}</span>
                                    </div>
                                </div>
                            </div>

                            <div
                                class="bg-gray-50 dark:bg-white/5 rounded-xl p-4 border border-gray-100 dark:border-white/5">
                                <h4
                                    class="text-xs uppercase font-bold text-gray-400 tracking-wider mb-3 flex items-center gap-2">
                                    <span class="material-symbols-outlined text-[14px]">inventory_2</span> Product
                                    Details
                                </h4>
                                <div class="space-y-2">
                                    <div class="flex justify-between">
                                        <span class="text-sm text-gray-500">Item Name</span>
                                        <span
                                            class="text-sm font-bold text-gray-900 dark:text-white truncate max-w-[150px]"
                                            :title="selectedReturn?.item">{{ selectedReturn?.item }}</span>
                                    </div>
                                    <div
                                        class="flex justify-between border-t border-gray-200 dark:border-white/10 pt-2 mt-2">
                                        <span class="text-sm text-gray-500">Reason</span>
                                        <span class="text-sm text-red-600 dark:text-red-400 font-medium">{{
                                            selectedReturn?.reason }}</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="text-sm text-gray-500">Condition reported</span>
                                        <span class="text-sm text-gray-900 dark:text-gray-300">{{
                                            selectedReturn?.condition || 'Used/Opened' }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Logistics Status -->
                        <div
                            class="bg-gray-50 dark:bg-white/5 rounded-xl p-4 border border-gray-100 dark:border-white/5">
                            <h4
                                class="text-xs uppercase font-bold text-gray-400 tracking-wider mb-4 flex items-center gap-2">
                                <span class="material-symbols-outlined text-[14px]">local_shipping</span> Logistics
                                Trail
                            </h4>

                            <!-- Timeline -->
                            <div
                                class="relative pl-6 space-y-4 before:absolute before:inset-y-0 before:left-[4px] before:w-[2px] before:bg-gray-200 dark:before:bg-gray-700">
                                <!-- Step 1 -->
                                <div class="relative">
                                    <div
                                        class="absolute -left-[24.5px] top-1.5 w-3 h-3 rounded-full bg-green-500 border-2 border-white dark:border-gray-900 shadow">
                                    </div>
                                    <div class="flex justify-between items-start">
                                        <div>
                                            <div class="text-sm font-bold text-gray-900 dark:text-white">Request
                                                Submitted</div>
                                            <div class="text-xs text-gray-500">Customer initiated return via app</div>
                                        </div>
                                        <div class="text-[10px] text-gray-400">{{ selectedReturn?.dateAdded }}</div>
                                    </div>
                                </div>

                                <!-- Step 2 -->
                                <div class="relative">
                                    <div class="absolute -left-[24.5px] top-1.5 w-3 h-3 rounded-full border-2 border-white dark:border-gray-900 shadow"
                                        :class="['Approved', 'Pickup Scheduled', 'In Transit'].includes(selectedReturn?.status) ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'">
                                    </div>
                                    <div class="flex justify-between items-start">
                                        <div>
                                            <div class="text-sm font-bold"
                                                :class="['Approved', 'Pickup Scheduled', 'In Transit'].includes(selectedReturn?.status) ? 'text-gray-900 dark:text-white' : 'text-gray-400'">
                                                Request Approved</div>
                                            <div class="text-xs text-gray-500"
                                                v-if="['Approved', 'Pickup Scheduled', 'In Transit'].includes(selectedReturn?.status)">
                                                Automated check passed</div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Step 3 -->
                                <div class="relative">
                                    <div class="absolute -left-[24.5px] top-1.5 w-3 h-3 rounded-full border-2 border-white dark:border-gray-900 shadow"
                                        :class="['Pickup Scheduled', 'In Transit'].includes(selectedReturn?.status) ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'">
                                    </div>
                                    <div class="flex justify-between items-start">
                                        <div>
                                            <div class="text-sm font-bold"
                                                :class="['Pickup Scheduled', 'In Transit'].includes(selectedReturn?.status) ? 'text-gray-900 dark:text-white' : 'text-gray-400'">
                                                Pickup Scheduled</div>
                                            <div class="text-xs text-gray-500" v-if="selectedReturn?.driver">Assigned
                                                to: {{ selectedReturn?.driver }}</div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Step 4 -->
                                <div class="relative">
                                    <div class="absolute -left-[24.5px] top-1.5 w-3 h-3 rounded-full border-2 border-white dark:border-gray-900 shadow"
                                        :class="selectedReturn?.warehouseStatus === 'Received' ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'">
                                    </div>
                                    <div class="flex justify-between items-start">
                                        <div>
                                            <div class="text-sm font-bold"
                                                :class="selectedReturn?.warehouseStatus === 'Received' ? 'text-gray-900 dark:text-white' : 'text-gray-400'">
                                                Warehouse Received</div>
                                            <div class="text-xs text-gray-500">Pending physical inspection</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- AI Insight -->
                        <div
                            class="bg-purple-50 dark:bg-purple-500/10 border border-purple-100 dark:border-purple-500/20 rounded-xl p-4 flex items-start gap-3">
                            <span
                                class="material-symbols-outlined text-purple-600 dark:text-purple-400 mt-0.5">smart_toy</span>
                            <div>
                                <h4 class="text-sm font-bold text-purple-900 dark:text-purple-300">AI Fraud Risk
                                    Assessment</h4>
                                <p class="text-xs text-purple-700 dark:text-purple-400 mt-1">
                                    Risk Score: <strong class="text-green-600 dark:text-green-400">Low (12%)</strong>.
                                    Customer has a high lifetime value and valid return history. Recommend instant
                                    approval to maintain satisfaction.
                                </p>
                            </div>
                        </div>

                    </div>

                    <div class="p-6 border-t border-gray-100 dark:border-white/5 flex gap-3 bg-gray-50 dark:bg-white/5">
                        <button @click="showDetailModal = false"
                            class="px-6 py-2.5 bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/10 text-gray-700 dark:text-white font-bold rounded-xl transition-colors shadow-sm">
                            Close
                        </button>
                        <div class="flex-1 flex justify-end gap-2">
                            <button v-if="selectedReturn?.status === 'Pending Review'"
                                @click="rejectReturn(selectedReturn); showDetailModal = false"
                                class="px-6 py-2.5 bg-red-100 hover:bg-red-200 dark:bg-red-500/20 dark:hover:bg-red-500/30 text-red-700 dark:text-red-400 font-bold rounded-xl transition-colors">
                                Reject
                            </button>
                            <button v-if="selectedReturn?.status === 'Pending Review'"
                                @click="approveReturn(selectedReturn); showDetailModal = false"
                                class="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-colors shadow-sm flex items-center gap-2">
                                <span class="material-symbols-outlined text-sm">thumb_up</span> Approve Request
                            </button>
                            <button v-if="selectedReturn?.status === 'Approved'" @click="schedulePickup(selectedReturn)"
                                class="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors shadow-sm flex items-center gap-2">
                                <span class="material-symbols-outlined text-sm">calendar_add_on</span> Schedule Pickup
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Teleport>

        <!-- Process Modal -->
        <Teleport to="body">
            <div v-if="showProcessModal"
                class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                @click.self="showProcessModal = false">
                <div
                    class="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-lg shadow-2xl border border-gray-100 dark:border-white/10 overflow-hidden">
                    <div class="p-6 border-b border-gray-100 dark:border-white/5 bg-purple-50 dark:bg-purple-900/10">
                        <div class="flex items-center gap-3">
                            <span
                                class="material-symbols-outlined text-purple-600 dark:text-purple-400 text-3xl">fact_check</span>
                            <div>
                                <h3 class="text-xl font-bold text-gray-900 dark:text-white">Batch Process Requests</h3>
                                <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">{{ pendingReviewCount }}
                                    requests pending your review.</p>
                            </div>
                        </div>
                    </div>
                    <div class="p-6 space-y-3 max-h-[50vh] overflow-y-auto custom-scrollbar">
                        <div v-for="ret in returns.filter(r => r.status === 'Pending Review')" :key="ret.id"
                            class="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/5 gap-4">
                            <div>
                                <div class="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                                    {{ ret.customer }}
                                    <span
                                        class="text-[10px] bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded font-mono">{{
                                            ret.id }}</span>
                                </div>
                                <div class="text-xs text-gray-500 mt-1">{{ ret.item }}</div>
                                <div class="text-[10px] text-red-500 mt-1 font-medium">Reason: {{ ret.reason }}</div>
                            </div>
                            <div class="flex gap-2 shrink-0">
                                <button @click="approveReturn(ret)"
                                    class="flex-1 sm:flex-none px-3 py-1.5 bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 text-xs font-bold rounded-lg hover:bg-green-200 dark:hover:bg-green-500/30 border border-green-200 dark:border-green-500/30 transition-colors flex items-center justify-center gap-1">
                                    <span class="material-symbols-outlined text-[14px]">check</span> Approve
                                </button>
                                <button @click="rejectReturn(ret)"
                                    class="flex-1 sm:flex-none px-3 py-1.5 bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 text-xs font-bold rounded-lg hover:bg-red-200 dark:hover:bg-red-500/30 border border-red-200 dark:border-red-500/30 transition-colors flex items-center justify-center gap-1">
                                    <span class="material-symbols-outlined text-[14px]">close</span> Reject
                                </button>
                            </div>
                        </div>
                        <div v-if="pendingReviewCount === 0"
                            class="text-center text-gray-500 dark:text-gray-400 py-8 flex flex-col items-center">
                            <span
                                class="material-symbols-outlined text-4xl mb-2 text-gray-300 dark:text-gray-600">done_all</span>
                            <p>All requests processed. Great job!</p>
                        </div>
                    </div>
                    <div class="p-6 border-t border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/5 flex gap-3">
                        <button @click="approveAllPending" v-if="pendingReviewCount > 0"
                            class="flex-1 py-2.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white text-sm font-bold rounded-xl transition-colors">
                            Approve All
                        </button>
                        <button @click="showProcessModal = false"
                            class="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold rounded-xl transition-colors shadow-sm">
                            Done Reviewing
                        </button>
                    </div>
                </div>
            </div>
        </Teleport>

        <!-- Pickup Modal -->
        <Teleport to="body">
            <div v-if="showPickupModal"
                class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                @click.self="showPickupModal = false">
                <div
                    class="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md shadow-2xl border border-gray-100 dark:border-white/10 overflow-hidden">
                    <div class="p-6 border-b border-gray-100 dark:border-white/5 bg-blue-50 dark:bg-blue-900/10">
                        <div class="flex items-center gap-3">
                            <span
                                class="material-symbols-outlined text-blue-600 dark:text-blue-400 text-3xl">edit_calendar</span>
                            <div>
                                <h3 class="text-xl font-bold text-gray-900 dark:text-white">Schedule Pickup</h3>
                                <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Assign driver and slot</p>
                            </div>
                        </div>
                    </div>

                    <div class="p-6 bg-gray-50 dark:bg-black/10 border-b border-gray-100 dark:border-white/5">
                        <div class="flex items-center gap-4 mb-2">
                            <div
                                class="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold shrink-0">
                                {{ selectedReturn?.customerInitials }}
                            </div>
                            <div>
                                <div class="font-bold text-gray-900 dark:text-white">{{ selectedReturn?.customer }}
                                </div>
                                <div class="text-xs text-gray-500 font-mono">{{ selectedReturn?.id }}</div>
                            </div>
                        </div>
                        <div
                            class="text-sm text-gray-600 dark:text-gray-300 mt-3 p-3 bg-white dark:bg-black/20 rounded-lg border border-gray-200 dark:border-white/5">
                            <span class="font-bold block mb-1">Pickup Item:</span>
                            {{ selectedReturn?.item }}
                        </div>
                        <div class="text-xs text-gray-500 mt-2 flex gap-1 items-start">
                            <span class="material-symbols-outlined text-[14px]">location_on</span>
                            <span>{{ selectedReturn?.address }}</span>
                        </div>
                    </div>

                    <div class="p-6 space-y-4">
                        <div>
                            <label
                                class="block text-[10px] font-bold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">Assigned
                                Driver</label>
                            <div class="relative">
                                <select v-model="pickupDriver"
                                    class="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white outline-none focus:border-purple-500 transition-colors appearance-none">
                                    <option>Auto-Assign (AI Optimized)</option>
                                    <option>David Miller (Zone A)</option>
                                    <option>Sarah Jenkins (Zone B)</option>
                                    <option>Mike Chen (Heavy Freight)</option>
                                </select>
                                <span
                                    class="material-symbols-outlined absolute right-3 top-3 text-gray-400 pointer-events-none">expand_more</span>
                            </div>
                        </div>
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label
                                    class="block text-[10px] font-bold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">Pickup
                                    Date</label>
                                <input type="date" v-model="pickupDate"
                                    class="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white outline-none focus:border-blue-500 transition-colors">
                            </div>
                            <div>
                                <label
                                    class="block text-[10px] font-bold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">Time
                                    Window</label>
                                <select v-model="pickupTimeWindow"
                                    class="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white outline-none focus:border-blue-500 transition-colors">
                                    <option>Morning (8A - 12P)</option>
                                    <option>Afternoon (12P - 4P)</option>
                                    <option>Evening (4P - 8P)</option>
                                </select>
                            </div>
                        </div>

                        <div v-if="pickupDriver.includes('Auto-Assign')"
                            class="p-3 bg-blue-50 dark:bg-blue-500/10 rounded-lg flex items-start gap-2 border border-blue-100 dark:border-blue-500/20 text-xs text-blue-800 dark:text-blue-300">
                            <span class="material-symbols-outlined text-[16px] mt-0.5">auto_awesome</span>
                            <p>AI will automatically assign the best driver based on route density and vehicle capacity
                                for the selected date.</p>
                        </div>
                    </div>
                    <div class="p-6 border-t border-gray-100 dark:border-white/5 flex gap-3 bg-gray-50 dark:bg-white/5">
                        <button @click="showPickupModal = false"
                            class="flex-1 py-2.5 bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/10 text-gray-700 dark:text-white font-bold rounded-xl transition-colors shadow-sm">
                            Cancel
                        </button>
                        <button @click="confirmPickup" :disabled="!pickupDate"
                            class="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2">
                            <span class="material-symbols-outlined text-sm">schedule_send</span> Confirm
                        </button>
                    </div>
                </div>
            </div>
        </Teleport>

        <!-- New Return Modal -->
        <Teleport to="body">
            <div v-if="showNewReturnModal"
                class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                @click.self="showNewReturnModal = false">
                <div
                    class="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-lg shadow-2xl border border-gray-100 dark:border-white/10 overflow-hidden">
                    <div class="p-6 border-b border-gray-100 dark:border-white/5">
                        <h3 class="text-xl font-bold text-gray-900 dark:text-white">Create Return Request</h3>
                        <p class="text-xs text-gray-500 mt-1">Manually initiate a return process.</p>
                    </div>
                    <div class="p-6 space-y-4">
                        <div>
                            <label
                                class="block text-[10px] font-bold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">Customer
                                Name</label>
                            <input type="text" placeholder="John Doe"
                                class="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:border-purple-500 transition-colors">
                        </div>
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label
                                    class="block text-[10px] font-bold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">Order
                                    / Invoice ID</label>
                                <input type="text" placeholder="INV-2024..."
                                    class="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:border-purple-500 transition-colors">
                            </div>
                            <div>
                                <label
                                    class="block text-[10px] font-bold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">Return
                                    Reason</label>
                                <select
                                    class="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:border-purple-500 transition-colors">
                                    <option>Defective Product</option>
                                    <option>Wrong Item Sent</option>
                                    <option>Customer Changed Mind</option>
                                    <option>Damaged in shipping</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label
                                class="block text-[10px] font-bold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">Item
                                Details</label>
                            <textarea rows="2" placeholder="Describe the item being returned..."
                                class="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg px-4 py-3 text-sm text-gray-900 dark:text-white outline-none focus:border-purple-500 transition-colors resize-none"></textarea>
                        </div>
                    </div>
                    <div class="p-6 border-t border-gray-100 dark:border-white/5 flex gap-3 bg-gray-50 dark:bg-white/5">
                        <button @click="showNewReturnModal = false"
                            class="flex-1 py-2.5 bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/10 text-gray-700 dark:text-white font-bold rounded-xl transition-colors shadow-sm">
                            Cancel
                        </button>
                        <button @click="showNewReturnModal = false"
                            class="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-colors shadow-sm">
                            Submit Request
                        </button>
                    </div>
                </div>
            </div>
        </Teleport>

        <!-- Auto Assign Modal -->
        <Teleport to="body">
            <div v-if="showAutoAssignModal"
                class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                @click.self="showAutoAssignModal = false">
                <div
                    class="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-sm shadow-2xl border border-gray-100 dark:border-white/10 overflow-hidden text-center">
                    <div class="p-8 pb-4">
                        <div
                            class="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center mx-auto mb-4 relative">
                            <span
                                class="material-symbols-outlined text-4xl text-blue-600 dark:text-blue-400">smart_toy</span>
                            <span
                                class="absolute top-0 right-0 w-4 h-4 rounded-full bg-blue-500 border-2 border-white dark:border-gray-900 animate-ping"></span>
                        </div>
                        <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">AI Auto-Assign</h3>
                        <p class="text-sm text-gray-500 dark:text-gray-400">
                            Our AI will map all <strong class="text-gray-900 dark:text-white">{{ pickupsNeededCount
                            }}</strong> pending pickups to the most efficient driver routes to save time and fuel.
                        </p>
                    </div>
                    <div class="p-6 bg-gray-50 dark:bg-white/5 border-t border-gray-100 dark:border-white/5">
                        <div class="flex gap-3">
                            <button @click="showAutoAssignModal = false"
                                class="flex-1 py-2.5 bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/10 text-gray-700 dark:text-white font-bold rounded-xl transition-colors">
                                Cancel
                            </button>
                            <button @click="runAutoAssign"
                                class="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2">
                                <span class="material-symbols-outlined text-sm">rocket_launch</span> Optimize
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Teleport>

    </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const showProcessModal = ref(false)
const showPickupModal = ref(false)
const showDetailModal = ref(false)
const showNewReturnModal = ref(false)
const showAutoAssignModal = ref(false)

const selectedReturn = ref(null)
const pickupDriver = ref('Auto-Assign (AI Optimized)')
const pickupDate = ref(new Date().toISOString().split('T')[0])
const pickupTimeWindow = ref('Morning (8A - 12P)')

const searchQuery = ref('')
const activeListFilter = ref('All')

// Richer mock data
const returns = ref([
    {
        id: 'RET-8821', customer: 'Alice Smith', customerInitials: 'AS', phone: '+1 (555) 302-1044',
        address: '124 Maple St, Springfield, IL 62704',
        dateAdded: 'Oct 24, 2024',
        item: 'Ergonomic Office Chair (Black)',
        reason: 'Defective Wheels - they don\'t turn smoothly and scratch floor',
        status: 'Approved',
        statusClass: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20',
        warehouseStatus: 'Notified'
    },
    {
        id: 'RET-8824', customer: 'Bob Jones', customerInitials: 'BJ', phone: '+1 (555) 891-2309',
        address: '990 Oak Dr, Apt 4B, Chicago, IL 60614',
        dateAdded: 'Oct 23, 2024',
        item: 'Dual Monitor Stand Component',
        reason: 'Wrong Size - ordered for 27" but received 24" max size',
        status: 'Pending Review',
        statusClass: 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-500/10 dark:text-yellow-400 dark:border-yellow-500/20',
        warehouseStatus: 'Pending'
    },
    {
        id: 'RET-8899', customer: 'Charlie Day', customerInitials: 'CD', phone: '+1 (555) 441-9011',
        address: '42 Paddy\'s Pub Rd, Philadelphia, PA 19104',
        dateAdded: 'Oct 22, 2024',
        item: 'Mechanical Keyboard (Red Switches)',
        reason: 'Changed Mind - too loud for office environment',
        status: 'Pickup Scheduled', driver: 'Sarah Jenkins',
        statusClass: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20',
        warehouseStatus: 'Notified'
    },
    {
        id: 'RET-8902', customer: 'Diana Prince', customerInitials: 'DP', phone: '+1 (555) 777-8888',
        address: '1 Amazon Ave, Washington, DC 20001',
        dateAdded: 'Oct 21, 2024',
        item: 'Golden Lasso Prop Replica',
        reason: 'Damaged in transit - box was crushed on arrival',
        status: 'In Transit', driver: 'Mike Chen',
        statusClass: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20',
        warehouseStatus: 'Awaiting Arrival'
    },
    {
        id: 'RET-8711', customer: 'Evan Wright', customerInitials: 'EW', phone: '+1 (555) 222-3344',
        address: '777 Tech Blvd, Austin, TX 78701',
        dateAdded: 'Oct 20, 2024',
        item: 'Wireless Noise Cancelling Headphones',
        reason: 'Defective - left ear cup has no sound',
        status: 'Pending Review',
        statusClass: 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-500/10 dark:text-yellow-400 dark:border-yellow-500/20',
        warehouseStatus: 'Pending'
    }
])

const filteredReturns = computed(() => {
    let result = returns.value

    // Status Filter
    if (activeListFilter.value !== 'All') {
        result = result.filter(r => r.status === activeListFilter.value)
    }

    // Text Search
    if (searchQuery.value) {
        const q = searchQuery.value.toLowerCase()
        result = result.filter(r =>
            r.id.toLowerCase().includes(q) ||
            r.customer.toLowerCase().includes(q) ||
            r.item.toLowerCase().includes(q)
        )
    }
    return result
})

const pendingReviewCount = computed(() => returns.value.filter(r => r.status === 'Pending Review').length)
const pickupsNeededCount = computed(() => returns.value.filter(r => r.status === 'Approved').length)
const inTransitCount = computed(() => returns.value.filter(r => r.status === 'In Transit').length)

function openReturnDetail(item) {
    selectedReturn.value = item
    showDetailModal.value = true
}

function schedulePickup(item) {
    selectedReturn.value = item
    showPickupModal.value = true
    showDetailModal.value = false
}

function approveReturn(ret) {
    ret.status = 'Approved'
    ret.statusClass = 'bg-green-50 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20'
    ret.warehouseStatus = 'Notified'
}

function rejectReturn(ret) {
    ret.status = 'Rejected'
    ret.statusClass = 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20'
    ret.warehouseStatus = 'Cancelled'
}

function approveAllPending() {
    returns.value.forEach(r => {
        if (r.status === 'Pending Review') {
            approveReturn(r)
        }
    })
    showProcessModal.value = false
}

function confirmPickup() {
    if (selectedReturn.value) {
        selectedReturn.value.status = 'Pickup Scheduled'
        selectedReturn.value.statusClass = 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20'

        let driverName = pickupDriver.value;
        if (driverName.includes('Auto-Assign')) driverName = 'AI Auto-Assigned Driver';
        else driverName = driverName.split(' (')[0]; // strip out the zone string

        selectedReturn.value.driver = driverName;
    }
    showPickupModal.value = false
}

function runAutoAssign() {
    returns.value.forEach(r => {
        if (r.status === 'Approved') {
            r.status = 'Pickup Scheduled'
            r.statusClass = 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20'
            r.driver = 'AI Auto-Assigned Driver'
        }
    })
    showAutoAssignModal.value = false
}
</script>

<style scoped>
/* Tooltip styling */
.tooltip-trigger .tooltip {
    @apply absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-[10px] rounded opacity-0 whitespace-nowrap pointer-events-none transition-opacity;
    z-index: 50;
}

.tooltip-trigger:hover .tooltip {
    @apply opacity-100;
}
</style>
