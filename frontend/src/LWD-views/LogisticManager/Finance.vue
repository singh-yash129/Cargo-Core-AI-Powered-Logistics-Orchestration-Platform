<template>
    <div class="h-[calc(100vh-8rem)] flex flex-col gap-6">
        <!-- Header -->
        <div class="flex justify-between items-center bg-white dark:bg-card-dark p-4 rounded-xl shadow-sm border border-gray-100 dark:border-white/5">
            <div>
                <h2 class="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <span class="material-symbols-outlined text-primary">account_balance_wallet</span>
                    Finance & Payroll
                </h2>
                <p class="text-xs text-gray-500 mt-1">Manage cash flow, reconcile COD, and process payments across all departments.</p>
            </div>
            <div class="flex gap-3">
                <div class="relative group">
                    <button @click="openPayrollModal" :disabled="!filteredUsers.some(u => u.pending_payout > 0)"
                        class="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5">
                        <span class="material-symbols-outlined">payments</span> Pay All Due
                    </button>
                    <div v-if="!filteredUsers.some(u => u.pending_payout > 0)" class="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-48 bg-black/80 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none text-center">
                        No pending payouts
                    </div>
                </div>
                <button @click="openBulkActionModal" 
                    class="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5">
                    <span class="material-symbols-outlined">auto_fix_high</span> Smart Bonus/Deduct
                </button>
                <button @click="openTransactionModal" 
                    class="bg-primary hover:bg-primary/90 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5">
                    <span class="material-symbols-outlined">add_circle</span> New Record
                </button>
            </div>
        </div>

        <!-- Dynamic Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div class="glass-panel p-4 rounded-xl border border-gray-200 dark:border-white/5 flex flex-col justify-between relative overflow-hidden group hover:border-primary/30 transition-colors">
                <div class="absolute right-0 top-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                    <span class="material-symbols-outlined text-6xl text-green-500">payments</span>
                </div>
                <p class="text-xs text-gray-500 uppercase font-bold tracking-wider z-10">Total Revenue (MTD)</p>
                <div class="flex items-end gap-2 z-10 mt-1">
                    <p class="text-2xl font-bold text-gray-900 dark:text-white">${{ totalRevenue.toLocaleString() }}</p>
                    <span class="text-xs font-bold text-green-500 bg-green-50 dark:bg-green-500/10 px-1.5 py-0.5 rounded flex items-center mb-1">
                        <span class="material-symbols-outlined text-[10px] mr-0.5">trending_up</span> 12%
                    </span>
                </div>
            </div>
            
            <div class="glass-panel p-4 rounded-xl border border-gray-200 dark:border-white/5 flex flex-col justify-between relative overflow-hidden group hover:border-red-500/30 transition-colors">
                <div class="absolute right-0 top-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                    <span class="material-symbols-outlined text-6xl text-red-500">account_balance_wallet</span>
                </div>
                <p class="text-xs text-gray-500 uppercase font-bold tracking-wider z-10">Total Expenses</p>
                <div class="flex items-end gap-2 z-10 mt-1">
                    <p class="text-2xl font-bold text-gray-900 dark:text-white">${{ Math.abs(totalExpenses).toLocaleString() }}</p>
                </div>
            </div>

            <div class="glass-panel p-4 rounded-xl border border-gray-200 dark:border-white/5 flex flex-col justify-between relative overflow-hidden group hover:border-blue-500/30 transition-colors">
                <div class="absolute right-0 top-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                    <span class="material-symbols-outlined text-6xl text-blue-500">local_shipping</span>
                </div>
                <p class="text-xs text-gray-500 uppercase font-bold tracking-wider z-10">Pending COD</p>
                <div class="flex items-end gap-2 z-10 mt-1">
                    <p class="text-2xl font-bold text-gray-900 dark:text-white">${{ pendingCOD.toLocaleString() }}</p>
                    <button @click="activeTab = 'cod'" class="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline z-10 ml-auto font-medium">View Detail</button>
                </div>
            </div>

            <div class="glass-panel p-4 rounded-xl border border-gray-200 dark:border-white/5 flex flex-col justify-between relative overflow-hidden group hover:border-orange-500/30 transition-colors">
                <div class="absolute right-0 top-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                    <span class="material-symbols-outlined text-6xl text-orange-500">group</span>
                </div>
                <p class="text-xs text-gray-500 uppercase font-bold tracking-wider z-10">Total Payroll Due</p>
                <div class="flex items-end gap-2 z-10 mt-1">
                    <p class="text-2xl font-bold text-gray-900 dark:text-white">${{ totalPayrollDue.toLocaleString() }}</p>
                </div>
            </div>
        </div>

        <!-- Tabs Navigation -->
        <div class="flex gap-1 bg-gray-100 dark:bg-white/5 p-1 rounded-lg self-start border border-gray-200 dark:border-white/10">
            <button v-for="tab in tabs" :key="tab.id"
                @click="activeTab = tab.id"
                class="px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2"
                :class="activeTab === tab.id ? 'bg-white dark:bg-gray-700 text-primary shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'">
                <span class="material-symbols-outlined text-[18px]">{{ tab.icon }}</span>
                {{ tab.label }}
            </button>
        </div>

        <!-- Main Content Area -->
        <div class="flex-1 glass-panel rounded-xl overflow-hidden flex flex-col border border-gray-200 dark:border-white/5 relative">
            <!-- Filter Bar -->
            <div class="p-4 border-b border-gray-200 dark:border-white/5 flex justify-between items-center bg-gray-50 dark:bg-white/5">
                <h3 class="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    {{ activeTabLabel }}
                </h3>
                <div class="flex gap-2">
                    <div class="relative">
                        <span class="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">search</span>
                        <input v-model="searchQuery" type="text" placeholder="Search records..." 
                            class="pl-9 pr-4 py-1.5 bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-gray-700 dark:text-gray-200 w-64">
                    </div>
                </div>
            </div>
            
            <div class="flex-1 overflow-auto custom-scrollbar bg-white dark:bg-gray-900">
                <table class="w-full text-left text-sm border-separate border-spacing-0">
                    <thead class="bg-gray-50 dark:bg-card-dark sticky top-0 z-10 shadow-sm">
                        <tr class="text-gray-500 dark:text-gray-400 uppercase tracking-wider text-[10px]">
                            <th class="py-3 px-4 font-medium border-b dark:border-white/10">Ref ID</th>
                            <th class="py-3 px-4 font-medium border-b dark:border-white/10">Date</th>
                            <th class="py-3 px-4 font-medium border-b dark:border-white/10">
                                {{ activeTab === 'cod' ? 'Driver / Route' : 'Beneficiary / Description' }}
                            </th>
                            <th v-if="activeTab !== 'cod'" class="py-3 px-4 font-medium border-b dark:border-white/10">Role/Category</th>
                            <th class="py-3 px-4 font-medium border-b dark:border-white/10 text-right">Amount</th>
                            <th class="py-3 px-4 font-medium border-b dark:border-white/10 text-right">Status</th>
                            <th class="py-3 px-4 font-medium border-b dark:border-white/10 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100 dark:divide-white/5">
                        <template v-for="item in filteredItems" :key="item.id">
                            <!-- Main Row -->
                            <tr @click="toggleRow(item.id)" 
                                class="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer group"
                                :class="expandedRow === item.id ? 'bg-blue-50/50 dark:bg-blue-500/5' : ''">
                                <td class="py-3 px-4 font-mono text-gray-600 dark:text-gray-300 text-xs flex items-center gap-2">
                                    <span class="material-symbols-outlined text-gray-400 transition-transform text-sm"
                                        :class="expandedRow === item.id ? 'rotate-90 text-primary' : ''">chevron_right</span>
                                    {{ item.id }}
                                </td>
                                <td class="py-3 px-4 text-gray-500 dark:text-gray-400">{{ item.date }}</td>
                                <td class="py-3 px-4 font-medium text-gray-900 dark:text-white">
                                    <div class="flex items-center gap-2">
                                        <div v-if="item.avatar" class="w-6 h-6 rounded-full overflow-hidden bg-gray-200">
                                            <img :src="item.avatar" class="w-full h-full object-cover">
                                        </div>
                                        <span>{{ item.desc || item.name }}</span>
                                    </div>
                                </td>
                                <td v-if="activeTab !== 'cod'" class="py-3 px-4">
                                    <span class="px-2 py-0.5 rounded text-[11px] bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-white/5">
                                        {{ item.role || item.type }}
                                    </span>
                                </td>
                                <td class="py-3 px-4 font-bold font-mono text-right"
                                    :class="item.amount > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'">
                                    {{ item.amount > 0 ? '+' : '' }}{{ item.amount.toLocaleString() }}
                                </td>
                                <td class="py-3 px-4 text-right">
                                    <span class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border"
                                        :class="{
                                            'bg-green-50 border-green-200 text-green-600 dark:bg-green-500/10 dark:text-green-400': item.status === 'Completed' || item.status === 'Paid',
                                            'bg-yellow-50 border-yellow-200 text-yellow-600 dark:bg-yellow-500/10 dark:text-yellow-400': item.status === 'Pending',
                                            'bg-red-50 border-red-200 text-red-600 dark:bg-red-500/10 dark:text-red-400': item.status === 'Overdue'
                                        }">
                                        {{ item.status }}
                                    </span>
                                </td>
                                <td class="py-3 px-4 text-right">
                                    <button v-if="item.status === 'Pending' && activeTab === 'cod'" 
                                        @click.stop="openReconcileModal(item)"
                                        class="text-xs bg-primary hover:bg-primary/90 text-white px-3 py-1.5 rounded transition-colors shadow-sm">
                                        Reconcile
                                    </button>
                                    <button v-else-if="item.status === 'Pending' && (activeTab === 'staff' || activeTab === 'drivers')"
                                        @click.stop="payUser(item)"
                                        class="text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded transition-colors shadow-sm flex items-center gap-1 ml-auto">
                                        <span class="material-symbols-outlined text-[14px]">payments</span> Pay
                                    </button>
                                    <button v-else
                                        @click.stop="downloadSlip(item)"
                                        class="text-gray-400 hover:text-primary transition-colors tooltip" title="Download Slip">
                                        <span class="material-symbols-outlined text-[20px]">download</span>
                                    </button>
                                </td>
                            </tr>
                            
                            <!-- Expanded Detail Row -->
                            <tr v-if="expandedRow === item.id" class="bg-gray-50/50 dark:bg-white/[0.02]">
                                <td :colspan="activeTab === 'cod' ? 6 : 7" class="p-4 border-b border-gray-100 dark:border-white/5">
                                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm ml-8">
                                        <div class="space-y-2">
                                            <p class="text-xs font-bold text-gray-500 uppercase tracking-widest">Transaction Details</p>
                                            <div class="grid grid-cols-2 gap-y-1 text-gray-600 dark:text-gray-400">
                                                <span>Transaction ID:</span> <span class="font-mono text-gray-900 dark:text-white">{{ item.id }}</span>
                                                <span>Date processed:</span> <span>{{ item.date }}</span>
                                                <span>Payment Method:</span> <span>Direct Deposit</span>
                                                <span>Reference:</span> <span>#REF-{{ Math.floor(Math.random()*10000) }}</span>
                                            </div>
                                        </div>
                                        <div class="space-y-2">
                                            <p class="text-xs font-bold text-gray-500 uppercase tracking-widest">Breakdown</p>
                                            <div class="bg-white dark:bg-black/20 p-3 rounded border border-gray-100 dark:border-white/5 space-y-1">
                                                <div class="flex justify-between text-gray-600 dark:text-gray-400">
                                                    <span>Base Amount</span>
                                                    <span>${{ Math.abs(item.amount * 0.9).toFixed(2) }}</span>
                                                </div>
                                                <div class="flex justify-between text-gray-600 dark:text-gray-400">
                                                    <span>Tax / Deductions</span>
                                                    <span>${{ Math.abs(item.amount * 0.1).toFixed(2) }}</span>
                                                </div>
                                                <div class="border-t border-gray-200 dark:border-white/10 pt-1 mt-1 flex justify-between font-bold text-gray-900 dark:text-white">
                                                    <span>Total</span>
                                                    <span>${{ Math.abs(item.amount).toLocaleString() }}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="flex flex-col justify-end items-start gap-2">
                                            <button @click="downloadSlip(item)" class="text-xs text-primary hover:underline flex items-center gap-1">
                                                <span class="material-symbols-outlined text-[16px]">description</span> Download Invoice/Slip
                                            </button>
                                             <button class="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 flex items-center gap-1">
                                                <span class="material-symbols-outlined text-[16px]">report</span> Report Issue
                                            </button>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        </template>

                        <tr v-if="filteredItems.length === 0">
                            <td :colspan="activeTab === 'cod' ? 6 : 7" class="py-12 text-center text-gray-500 flex flex-col items-center justify-center">
                                <span class="material-symbols-outlined text-4xl mb-2 opacity-20">inbox</span>
                                No records found for this category.
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Smart Bonus/Deduct Modal -->
         <Teleport to="body">
            <div v-if="showBulkActionModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div class="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-scale-in">
                    <div class="p-6 border-b border-gray-100 dark:border-white/10 flex justify-between items-center bg-gray-50 dark:bg-white/5">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                                <span class="material-symbols-outlined">auto_fix_high</span>
                            </div>
                            <div>
                                <h3 class="text-lg font-bold text-gray-900 dark:text-white">Smart Bonus & Deductions</h3>
                                <p class="text-xs text-gray-500">Apply financial adjustments to multiple staff members based on criteria.</p>
                            </div>
                        </div>
                        <button @click="showBulkActionModal = false" class="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                            <span class="material-symbols-outlined">close</span>
                        </button>
                    </div>
                    
                    <div class="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 h-[400px] overflow-y-auto custom-scrollbar">
                        <!-- Left: Filters & Actions -->
                        <div class="space-y-4">
                            <div>
                                <label class="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-2">Target Group</label>
                                <select v-model="bulkForm.role" class="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500/50">
                                    <option value="all">All Staff</option>
                                    <option value="Driver">Drivers Only</option>
                                    <option value="Dispatcher">Dispatchers Only</option>
                                    <option value="Warehouse Manager">Warehouse Managers</option>
                                </select>
                            </div>

                            <div class="bg-gray-50 dark:bg-white/5 p-3 rounded-lg border border-gray-200 dark:border-white/10 space-y-3">
                                <p class="text-xs font-bold text-gray-500 uppercase">Performance Criteria</p>
                                <div class="flex items-center gap-2">
                                    <input type="checkbox" v-model="bulkForm.filterByRating" class="rounded text-purple-600 focus:ring-purple-500 border-gray-300">
                                    <span class="text-sm text-gray-700 dark:text-gray-300">Rating Above</span>
                                    <input type="number" step="0.1" max="5" min="0" v-model="bulkForm.minRating" :disabled="!bulkForm.filterByRating" class="w-16 bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded px-2 py-1 text-xs">
                                </div>
                                <div class="flex items-center gap-2">
                                    <input type="checkbox" v-model="bulkForm.filterByTrips" class="rounded text-purple-600 focus:ring-purple-500 border-gray-300">
                                    <span class="text-sm text-gray-700 dark:text-gray-300">Completed Trips ></span>
                                    <input type="number" v-model="bulkForm.minTrips" :disabled="!bulkForm.filterByTrips" class="w-16 bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded px-2 py-1 text-xs">
                                </div>
                            </div>

                            <div class="pt-4 border-t border-gray-200 dark:border-white/10">
                                <label class="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-2">Action Type</label>
                                <div class="grid grid-cols-2 gap-2 mb-3">
                                    <button @click="bulkForm.type = 'Bonus'" 
                                        class="py-2 rounded-lg text-sm font-bold border transition-colors flex items-center justify-center gap-1"
                                        :class="bulkForm.type === 'Bonus' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'">
                                        <span class="material-symbols-outlined text-[16px]">add_circle</span> Bonus
                                    </button>
                                    <button @click="bulkForm.type = 'Deduction'" 
                                        class="py-2 rounded-lg text-sm font-bold border transition-colors flex items-center justify-center gap-1"
                                        :class="bulkForm.type === 'Deduction' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'">
                                        <span class="material-symbols-outlined text-[16px]">remove_circle</span> Deduct
                                    </button>
                                </div>
                                <label class="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">Amount ($)</label>
                                <input v-model.number="bulkForm.amount" type="number" class="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500/50 font-mono font-bold text-lg">
                                <input v-model="bulkForm.reason" type="text" placeholder="Reason (e.g. Performance Bonus)" class="w-full mt-2 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500/50">
                            </div>
                        </div>

                        <!-- Right: Preview Users -->
                        <div class="flex flex-col h-full bg-gray-50 dark:bg-black/20 rounded-xl border border-gray-200 dark:border-white/10 overflow-hidden">
                            <div class="p-3 border-b border-gray-200 dark:border-white/10 bg-gray-100 dark:bg-white/5 flex justify-between items-center">
                                <span class="text-xs font-bold uppercase text-gray-500">Affected Users ({{ bulkTargetUsers.length }})</span>
                                <span class="text-xs font-mono font-bold" :class="bulkForm.type === 'Bonus' ? 'text-green-600' : 'text-red-600'">
                                    Total: ${{ (bulkTargetUsers.length * bulkForm.amount).toLocaleString() }}
                                </span>
                            </div>
                            <div class="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                                <div v-for="user in bulkTargetUsers" :key="user.username" class="flex items-center gap-2 p-2 rounded bg-white dark:bg-card-dark border border-gray-100 dark:border-white/5 transition-all hover:translate-x-1">
                                    <img :src="user.avatar" class="w-8 h-8 rounded-full bg-gray-200">
                                    <div class="flex-1 min-w-0">
                                        <p class="text-sm font-bold text-gray-900 dark:text-white truncate">{{ user.name }}</p>
                                        <p class="text-[10px] text-gray-500 truncate">{{ user.role }} • Rating: {{ user.rating || 'N/A' }}</p>
                                    </div>
                                    <span class="text-xs font-bold" :class="bulkForm.type === 'Bonus' ? 'text-green-600' : 'text-red-600'">
                                        {{ bulkForm.type === 'Bonus' ? '+' : '-' }}${{ bulkForm.amount }}
                                    </span>
                                </div>
                                <div v-if="bulkTargetUsers.length === 0" class="h-full flex flex-col items-center justify-center text-gray-400 p-4 text-center">
                                    <span class="material-symbols-outlined text-3xl mb-2">groups</span>
                                    <p class="text-xs">No users match criteria</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="p-4 bg-gray-50 dark:bg-white/5 flex justify-end gap-2 border-t border-gray-100 dark:border-white/10">
                        <button @click="showBulkActionModal = false" class="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900">Cancel</button>
                        <button @click="applyBulkAction" :disabled="bulkTargetUsers.length === 0 || bulkForm.amount <= 0" 
                            class="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold rounded-lg shadow-lg shadow-purple-500/20 transition-all flex items-center gap-2">
                            <span class="material-symbols-outlined text-[18px]">done_all</span> Apply to {{ bulkTargetUsers.length }} Users
                        </button>
                    </div>
                </div>
            </div>
        </Teleport>

        <!-- Payroll Confirmation Modal -->
        <Teleport to="body">
            <div v-if="showPayrollModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div class="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-scale-in">
                    <template v-if="!payrollSuccess">
                        <div class="p-6 border-b border-gray-100 dark:border-white/10 flex justify-between items-center bg-gray-50 dark:bg-white/5">
                            <h3 class="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <span class="material-symbols-outlined text-green-600">payments</span>
                                Confirm Payroll Run
                            </h3>
                            <button @click="showPayrollModal = false" :disabled="payrollProcessing" class="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors disabled:opacity-50">
                                <span class="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div class="p-6 space-y-4">
                            <div class="bg-yellow-50 dark:bg-yellow-500/10 border border-yellow-200 dark:border-yellow-500/20 p-4 rounded-lg flex gap-3">
                                <span class="material-symbols-outlined text-yellow-600 text-2xl">warning</span>
                                <div>
                                    <h4 class="font-bold text-yellow-800 dark:text-yellow-400 text-sm">Action Confirmation</h4>
                                    <p class="text-xs text-yellow-700 dark:text-yellow-300/80 mt-1">This will process payouts for all staff with pending balances. This action cannot be undone.</p>
                                </div>
                            </div>
                            
                            <div class="flex justify-between items-center py-2 border-b border-gray-100 dark:border-white/5">
                                <span class="text-sm text-gray-500">Total Employees</span>
                                <span class="font-bold text-gray-900 dark:text-white">{{ payrollSummary.count }}</span>
                            </div>
                            <div class="flex justify-between items-center py-2">
                                <span class="text-lg font-bold text-gray-900 dark:text-white">Total Payout</span>
                                <span class="text-2xl font-mono font-bold text-green-600">${{ payrollSummary.total.toLocaleString() }}</span>
                            </div>

                            <div class="max-h-32 overflow-y-auto custom-scrollbar bg-gray-50 dark:bg-black/20 p-2 rounded text-xs space-y-1">
                                <div v-for="u in payrollSummary.pendingUsers" :key="u.id" class="flex justify-between">
                                    <span class="text-gray-600 dark:text-gray-400">{{ u.name }}</span>
                                    <span class="font-mono font-bold">${{ u.pending_payout }}</span>
                                </div>
                            </div>
                        </div>
                        <div class="p-4 bg-gray-50 dark:bg-white/5 flex justify-end gap-2">
                            <button @click="showPayrollModal = false" :disabled="payrollProcessing" class="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 disabled:opacity-50">Cancel</button>
                            <button @click="confirmPayrollRun" :disabled="payrollProcessing" class="px-6 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-700 shadow-sm flex items-center gap-2 justify-center min-w-[160px] disabled:opacity-75 disabled:cursor-wait">
                                <span v-if="!payrollProcessing" class="material-symbols-outlined text-[18px]">check_circle</span>
                                <span v-if="payrollProcessing" class="animate-spin material-symbols-outlined text-[18px]">progress_activity</span>
                                {{ payrollProcessing ? 'Processing Batch...' : 'Confirm Payout' }}
                            </button>
                        </div>
                    </template>

                    <!-- Payroll Success State -->
                    <template v-else>
                        <div class="p-8 flex flex-col items-center justify-center text-center space-y-4">
                            <div class="w-20 h-20 rounded-full bg-green-100 text-green-600 flex items-center justify-center animate-bounce-short">
                                <span class="material-symbols-outlined text-5xl">checklist</span>
                            </div>
                            <div>
                                <h3 class="text-xl font-bold text-gray-900 dark:text-white">Batch Payment Complete!</h3>
                                <p class="text-sm text-gray-500 mt-1">Successfully processed payouts for {{ payrollSummary.count }} employees.</p>
                            </div>
                            <div class="w-full bg-gray-50 dark:bg-white/5 p-4 rounded-lg mt-4 border border-dashed border-gray-200 dark:border-white/10">
                                <p class="text-xs text-gray-400 uppercase font-bold tracking-wider">Total Disbursed</p>
                                <p class="text-3xl font-bold font-mono text-gray-900 dark:text-white mt-1">${{ payrollSummary.total.toLocaleString() }}</p>
                            </div>
                            <button @click="showPayrollModal = false" class="w-full py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg font-bold text-sm mt-4 hover:opacity-90 transition-opacity shadow-lg">
                                Close & Return to Dashboard
                            </button>
                        </div>
                    </template>
                </div>
            </div>
        </Teleport>

        <!-- Single Payment Modal -->
        <Teleport to="body">
            <div v-if="showPaymentModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div class="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden animate-scale-in">
                    <!-- Default State -->
                    <template v-if="!paymentSuccess">
                        <div class="p-6 border-b border-gray-100 dark:border-white/10 flex justify-between items-center bg-gray-50 dark:bg-white/5">
                            <h3 class="text-lg font-bold text-gray-900 dark:text-white">Process Payout</h3>
                            <button @click="showPaymentModal = false" :disabled="paymentProcessing" class="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors disabled:opacity-50">
                                <span class="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div class="p-6 space-y-4">
                            <div class="flex flex-col items-center">
                                <div class="w-16 h-16 rounded-full bg-gray-100 mb-3 overflow-hidden border-2 border-gray-200 shadow-inner">
                                    <img v-if="paymentTarget?.avatar" :src="paymentTarget.avatar" class="w-full h-full object-cover">
                                    <span v-else class="material-symbols-outlined text-3xl text-gray-400">person</span>
                                </div>
                                <h4 class="font-bold text-lg text-gray-900 dark:text-white">{{ paymentTarget?.name }}</h4>
                                <p class="text-xs text-gray-500 font-mono">{{ paymentTarget?.role }} • {{ paymentTarget?.id }}</p>
                            </div>
                            
                            <div class="bg-gray-50 dark:bg-black/20 p-4 rounded-xl border border-dashed border-gray-200 dark:border-white/10 text-center">
                                <p class="text-xs font-bold uppercase text-gray-500 mb-1">Total Transfer Amount</p>
                                <p class="text-3xl font-bold font-mono text-gray-900 dark:text-white">${{ paymentTarget?.amount.toLocaleString() }}</p>
                            </div>

                            <p class="text-center text-xs text-gray-400 px-4">Funds will be transferred directly to the linked account ending in **4291.</p>
                        </div>
                        <div class="p-4 bg-gray-50 dark:bg-white/5 flex justify-end gap-2">
                            <button @click="showPaymentModal = false" :disabled="paymentProcessing" class="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 disabled:opacity-50">Cancel</button>
                            <button @click="confirmSinglePayment" :disabled="paymentProcessing" class="px-6 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-700 shadow-sm flex items-center gap-2 min-w-[140px] justify-center disabled:opacity-75 disabled:cursor-wait">
                                <span v-if="!paymentProcessing" class="material-symbols-outlined text-[18px]">send_money</span>
                                <span v-if="paymentProcessing" class="animate-spin material-symbols-outlined text-[18px]">progress_activity</span>
                                {{ paymentProcessing ? 'Processing...' : 'Transfer Now' }}
                            </button>
                        </div>
                    </template>

                    <!-- Success State -->
                    <template v-else>
                        <div class="p-8 flex flex-col items-center justify-center text-center space-y-4">
                            <div class="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center animate-bounce-short">
                                <span class="material-symbols-outlined text-4xl">check_circle</span>
                            </div>
                            <div>
                                <h3 class="text-xl font-bold text-gray-900 dark:text-white">Payment Successful!</h3>
                                <p class="text-sm text-gray-500 mt-1">Transaction ID: #tx-{{ Math.floor(Math.random()*100000) }}</p>
                            </div>
                            <div class="w-full bg-gray-50 dark:bg-white/5 p-4 rounded-lg mt-4">
                                <p class="text-xs text-gray-400">Total Paid</p>
                                <p class="text-lg font-bold font-mono text-gray-900 dark:text-white">${{ paymentTarget?.amount.toLocaleString() }}</p>
                            </div>
                            <button @click="showPaymentModal = false" class="w-full py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg font-bold text-sm mt-4 hover:opacity-90 transition-opacity">
                                Close Receipt
                            </button>
                        </div>
                    </template>
                </div>
            </div>
        </Teleport>

        <!-- Create Transaction Modal -->
        <Teleport to="body">
            <div v-if="showTransactionModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div class="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-scale-in">
                    <div class="p-6 border-b border-gray-100 dark:border-white/10 flex justify-between items-center bg-gray-50 dark:bg-white/5">
                        <h3 class="text-lg font-bold text-gray-900 dark:text-white">Record Transaction</h3>
                        <button @click="showTransactionModal = false" class="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                            <span class="material-symbols-outlined">close</span>
                        </button>
                    </div>
                    <div class="p-6 space-y-4">
                        <div>
                            <label class="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">Description</label>
                            <input v-model="newTx.desc" type="text" placeholder="e.g. Office Rent Payment" class="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/50 text-gray-900 dark:text-white">
                        </div>
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">Category</label>
                                <select v-model="newTx.type" class="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/50 text-gray-900 dark:text-white">
                                    <option value="Incoming">Income</option>
                                    <option value="Expense">Expense</option>
                                    <option value="Payroll">Payroll Adjustment</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">Amount ($)</label>
                                <input v-model.number="newTx.amount" type="number" class="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/50 text-gray-900 dark:text-white">
                            </div>
                        </div>
                    </div>
                    <div class="p-4 bg-gray-50 dark:bg-white/5 flex justify-end gap-2">
                        <button @click="showTransactionModal = false" class="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900">Cancel</button>
                        <button @click="addTransaction" class="px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary/90 shadow-sm flex items-center gap-2">
                            <span class="material-symbols-outlined text-[18px]">save</span> Save Record
                        </button>
                    </div>
                </div>
            </div>
        </Teleport>

        <!-- Reconcile COD Modal -->
        <Teleport to="body">
            <div v-if="reconcileModalOpen" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div class="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-scale-in">
                    <div class="p-6 border-b border-gray-100 dark:border-white/10 flex justify-between items-center bg-gray-50 dark:bg-white/5">
                        <div>
                            <h3 class="text-lg font-bold text-gray-900 dark:text-white">Reconcile COD Payment</h3>
                            <p class="text-xs text-gray-500">Confirm cash collection from driver</p>
                        </div>
                        <button @click="reconcileModalOpen = false" class="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                            <span class="material-symbols-outlined">close</span>
                        </button>
                    </div>
                    <div v-if="selectedItem" class="p-6 space-y-4">
                        <div class="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-500/10 rounded-lg border border-blue-100 dark:border-blue-500/20">
                            <div class="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                <span class="material-symbols-outlined">local_shipping</span>
                            </div>
                            <div>
                                <p class="text-sm font-bold text-gray-900 dark:text-white">{{ selectedItem.desc }}</p>
                                <p class="text-xs text-gray-500">{{ selectedItem.date }} • ID: {{ selectedItem.id }}</p>
                            </div>
                        </div>

                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">Expected Amount</label>
                                <div class="w-full bg-gray-100 dark:bg-white/5 border border-transparent rounded-lg px-4 py-2 text-sm text-gray-500 font-mono">
                                    ${{ selectedItem.amount.toLocaleString() }}
                                </div>
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">Counted Cash</label>
                                <input v-model.number="reconcileAmount" type="number" class="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/50 text-gray-900 dark:text-white font-mono">
                            </div>
                        </div>

                        <div v-if="reconcileDiff !== 0" class="p-3 rounded text-xs font-bold flex items-center gap-2"
                             :class="reconcileDiff > 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'">
                            <span class="material-symbols-outlined text-[16px]">{{ reconcileDiff > 0 ? 'add_circle' : 'warning' }}</span>
                            {{ reconcileDiff > 0 ? `Surplus of $${reconcileDiff}` : `Shortage of $${Math.abs(reconcileDiff)}` }}
                        </div>
                    </div>
                    <div class="p-4 bg-gray-50 dark:bg-white/5 flex justify-end gap-2">
                        <button @click="reconcileModalOpen = false" class="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900">Cancel</button>
                        <button @click="confirmReconciliation" class="px-6 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary/90 shadow-sm flex items-center gap-2">
                            <span class="material-symbols-outlined text-[18px]">verified</span> Confirm & Close
                        </button>
                    </div>
                </div>
            </div>
        </Teleport>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useLogisticStore } from '@/stores/logisticStore'
import { storeToRefs } from 'pinia'

const store = useLogisticStore()
const { filteredTransactions, filteredUsers } = storeToRefs(store)

// View State
const activeTab = ref('overview') // overview, cod, staff, drivers
const searchQuery = ref('')
const expandedRow = ref(null)
const showTransactionModal = ref(false)
const reconcileModalOpen = ref(false)
const selectedItem = ref(null)
const reconcileAmount = ref(0)
const newTx = ref({ desc: '', type: 'Expense', amount: 0, hubId: null })

// Payroll Modal State
const showPayrollModal = ref(false)
const payrollProcessing = ref(false)
const payrollSuccess = ref(false)
const payrollSummary = ref({ count: 0, total: 0, pendingUsers: [] })

// Single Payment State
const showPaymentModal = ref(false)
const paymentTarget = ref(null)
const paymentProcessing = ref(false)
const paymentSuccess = ref(false)

// Bulk Action State
const showBulkActionModal = ref(false)
const bulkForm = ref({
    type: 'Bonus', // Bonus or Deduct
    amount: 0,
    reason: '',
    role_filter: 'All', // All, Driver, warehouse_staff
    min_rating: 0,
    min_trips: 0
})

// Bulk Computed Logic
const bulkTargetUsers = computed(() => {
    if (!bulkForm.value.min_rating && !bulkForm.value.min_trips && bulkForm.value.role_filter === 'All') {
        return [] // Safety: Don't select everyone by default if no filters
    }

    return filteredUsers.value.filter(user => {
        // 1. Role Filter
        if (bulkForm.value.role_filter !== 'All' && user.role !== bulkForm.value.role_filter) return false
        
        // 2. Mock Data for Filtering (Since not all users have these fields in store yet)
        const mockRating = user.rating || (Math.random() * 2 + 3).toFixed(1) // 3.0 - 5.0
        const mockTrips = user.trips || Math.floor(Math.random() * 50)

        // 3. Apply Filters
        if (bulkForm.value.min_rating > 0 && parseFloat(mockRating) < bulkForm.value.min_rating) return false
        if (bulkForm.value.min_trips > 0 && mockTrips < bulkForm.value.min_trips) return false

        return true
    }).map(u => ({
        ...u,
        _mockRating: u.rating || (Math.random() * 2 + 3).toFixed(1),
        _mockTrips: u.trips || Math.floor(Math.random() * 50)
    }))
})

// Bulk Methods
const openBulkActionModal = () => {
    bulkForm.value = {
        type: 'Bonus',
        amount: 50,
        reason: 'Performance Bonus',
        role_filter: 'Driver',
        min_rating: 4.5,
        min_trips: 10
    }
    showBulkActionModal.value = true
}

const applyBulkAction = () => {
    if (!bulkTargetUsers.value.length) return
    
    // In a real app, this would be a batch API call
    // Here we simulate individual transactions
    const totalAmount = bulkTargetUsers.value.length * bulkForm.value.amount
    
    // Add a summary transaction to the ledger
    store.addTransaction({
        id: Date.now(),
        date: new Date().toISOString().split('T')[0],
        desc: `Bulk ${bulkForm.value.type}: ${bulkTargetUsers.value.length} users`,
        amount: bulkForm.value.type === 'Bonus' ? -totalAmount : totalAmount, // Details logic inverted for expense/income representation
        type: bulkForm.value.type === 'Bonus' ? 'Expense' : 'Income',
        status: 'Completed',
        hubId: store.activeWarehouse
    })

    // Update individual users (Mock update)
    bulkTargetUsers.value.forEach(user => {
        // e.g., store.updateUserBalance(user.id, amount)
        console.log(`Applied ${bulkForm.value.type} of ${bulkForm.value.amount} to ${user.name}`)
    })

    showBulkActionModal.value = false
}

const openPayrollModal = () => {
    payrollSuccess.value = false
    const pending = filteredUsers.value.filter(u => u.pending_payout > 0)
    
    if (pending.length === 0) {
        // Optional: show a toast or small notification instead of alert
        return
    }

    payrollSummary.value = {
        count: pending.length,
        total: pending.reduce((sum, u) => sum + u.pending_payout, 0),
        pendingUsers: pending
    }
    showPayrollModal.value = true
}

const confirmPayrollRun = async () => {
    payrollProcessing.value = true
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000))

    store.addTransaction({
        id: Date.now(),
        date: new Date().toISOString().split('T')[0],
        desc: `Batch Payroll Run (${payrollSummary.value.count} staff)`,
        amount: -payrollSummary.value.total, 
        type: 'Expense',
        status: 'Completed',
        hubId: store.activeWarehouse
    })
    
    // Clear pending payoutsMock
    payrollSummary.value.pendingUsers.forEach(u => {
        // In real app, call store action to clear
        u.pending_payout = 0
    })

    payrollProcessing.value = false
    payrollSuccess.value = true
}

// Tabs Configuration
const tabs = [
    { id: 'overview', label: 'Overview', icon: 'dashboard' },
    { id: 'cod', label: 'COD Reconciliation', icon: 'payments' },
    { id: 'staff', label: 'Staff Payroll', icon: 'badge' },
    { id: 'drivers', label: 'Driver/Labor Payouts', icon: 'engineering' }
]

// Computed Data & Logic
const activeTabLabel = computed(() => {
    return tabs.find(t => t.id === activeTab.value)?.label || 'Transactions'
})

const totalRevenue = computed(() => filteredTransactions.value.filter(t => t.type === 'Incoming').reduce((s, t) => s + t.amount, 0))
const totalExpenses = computed(() => filteredTransactions.value.filter(t => t.type === 'Expense').reduce((s, t) => s + t.amount, 0))
const totalPayrollDue = computed(() => {
    // Mock calculation
    return activeTab.value === 'staff' ? 12500 : 4200
})
const pendingCOD = computed(() => {
    // Mock pending COD
    return 3240
})

const reconcileDiff = computed(() => {
    if(!selectedItem.value) return 0
    return reconcileAmount.value - selectedItem.value.amount
})

const filteredItems = computed(() => {
    let items = []
    
    if (activeTab.value === 'overview') {
        items = filteredTransactions.value
    } else if (activeTab.value === 'cod') {
        // Mock COD data
        items = [
            { id: 'COD-9921', date: 'Today', desc: 'Route 4B Collection', name: 'David Miller', amount: 450, status: 'Pending', type: 'COD' },
            { id: 'COD-9922', date: 'Yesterday', desc: 'Sector 7 Dropoff', name: 'Sarah Jenkins', amount: 1250, status: 'Completed', type: 'COD' }
        ]
    } else if (activeTab.value === 'staff') {
        // Filter users for staff roles
        items = filteredUsers.value.filter(u => ['Logistic Manager', 'Dispatcher', 'Warehouse Manager', 'Customer Support'].includes(u.role)).map(u => ({
            id: `PAY-${u.username}`,
            date: 'Oct 31, 2023',
            name: u.name,
            role: u.role,
            amount: 3200, // Mock salary
            status: Math.random() > 0.5 ? 'Paid' : 'Pending',
            avatar: u.avatar
        }))
    } else if (activeTab.value === 'drivers') {
        // Drivers and Labor
        items = filteredUsers.value.filter(u => ['Driver', 'Labor'].includes(u.role)).map(u => ({
            id: `WAGE-${u.username}`,
            date: 'Weekly',
            name: u.name,
            role: u.role,
            amount: 850 + Math.floor(Math.random()*200), // Mock wage
            status: Math.random() > 0.3 ? 'Paid' : 'Pending',
            avatar: u.avatar
        }))
    }

    if (searchQuery.value) {
        const q = searchQuery.value.toLowerCase()
        items = items.filter(i => 
            (i.desc && i.desc.toLowerCase().includes(q)) || 
            (i.name && i.name.toLowerCase().includes(q)) ||
            (i.id && i.id.toLowerCase().includes(q))
        )
    }
    return items
})

// Actions
const toggleRow = (id) => {
    expandedRow.value = expandedRow.value === id ? null : id
}

const openTransactionModal = () => {
    newTx.value = { desc: '', type: 'Expense', amount: 0, hubId: store.activeWarehouse }
    showTransactionModal.value = true
}

const addTransaction = () => {
    let finalAmount = Math.abs(newTx.value.amount)
    if (newTx.value.type !== 'Incoming') finalAmount = -finalAmount
    
    store.transactions.unshift({
        id: `TX-${Math.floor(Math.random()*90000)}`,
        hubId: newTx.value.hubId || 1,
        date: new Date().toLocaleDateString(),
        desc: newTx.value.desc,
        type: newTx.value.type,
        amount: finalAmount,
        status: 'Completed'
    })
    showTransactionModal.value = false
    window.alert('Transaction recorded successfully')
}

const openReconcileModal = (item) => {
    selectedItem.value = item
    reconcileAmount.value = item.amount
    reconcileModalOpen.value = true
}

const confirmReconciliation = () => {
    // In real app, update status
    selectedItem.value.status = 'Completed'
    reconcileModalOpen.value = false
    window.alert(`COD Reconciled. Receipt generated for ID: ${selectedItem.value.id}`)
}

const payUser = (item) => {
    paymentTarget.value = item
    showPaymentModal.value = true
    paymentSuccess.value = false
    paymentProcessing.value = false
}

const confirmSinglePayment = async () => {
    paymentProcessing.value = true
    
    // Simulate transaction
    await new Promise(resolve => setTimeout(resolve, 1500))

    store.addTransaction({
        id: `TX-PAY-${Math.floor(Math.random()*90000)}`,
        hubId: store.activeWarehouse,
        date: new Date().toLocaleDateString(),
        desc: `Payout to ${paymentTarget.value.name}`,
        type: 'Expense',
        amount: -paymentTarget.value.amount,
        status: 'Completed'
    })

    // Update Local State (Mock)
    paymentTarget.value.status = 'Paid'

    paymentProcessing.value = false
    paymentSuccess.value = true

    // Auto close
    setTimeout(() => {
        showPaymentModal.value = false
        paymentSuccess.value = false
        paymentTarget.value = null
    }, 2000)
}

const downloadSlip = (item) => {
    window.alert(`Downloading Slip for ${item.id}...`)
}

</script>
