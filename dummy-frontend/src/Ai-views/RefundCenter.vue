<template>
    <div class="space-y-6">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Refund Center</h2>
                <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage refund requests, analyze risk, and
                    configure auto-approval rules</p>
            </div>
            <div class="flex gap-2">
                <div class="relative hidden sm:block">
                    <input v-model="searchQuery" type="text" placeholder="Search refunds or customers..."
                        class="w-64 bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-purple-500 transition-colors shadow-sm">
                    <span class="material-symbols-outlined absolute left-3 top-2.5 text-gray-400 text-lg">search</span>
                </div>
                <button @click="showAddRefundModal = true"
                    class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg flex items-center gap-2 transition-colors shadow-sm text-sm">
                    <span class="material-symbols-outlined text-sm">add</span> <span class="hidden sm:inline">Issue
                        Refund</span>
                </button>
            </div>
        </div>

        <!-- Top Metrics & Rules -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Stats -->
            <div class="space-y-6">
                <div
                    class="bg-white dark:bg-black/20 border border-gray-100 dark:border-white/5 p-6 rounded-xl shadow-sm bg-gradient-to-br from-green-50 dark:from-green-900/20 to-white dark:to-transparent flex flex-col justify-between">
                    <div class="flex justify-between items-start mb-2">
                        <div class="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase tracking-wider">Total
                            Refunded (MTD)</div>
                        <div class="p-2 bg-green-100 dark:bg-green-500/20 rounded-lg">
                            <span
                                class="material-symbols-outlined text-green-600 dark:text-green-400 text-xl">payments</span>
                        </div>
                    </div>
                    <div>
                        <div class="text-3xl font-bold text-gray-900 dark:text-white">$4,250.00</div>
                        <div class="text-xs text-green-600 dark:text-green-400 mt-2 flex items-center gap-1 font-bold">
                            <span class="material-symbols-outlined text-[14px]">trending_down</span> 12% decrease vs
                            last month
                        </div>
                    </div>
                </div>

                <div
                    class="bg-white dark:bg-black/20 border border-gray-100 dark:border-white/5 p-6 rounded-xl shadow-sm flex flex-col justify-between">
                    <div class="flex justify-between items-start mb-2">
                        <div class="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase tracking-wider">Pending
                            Review</div>
                        <div class="p-2 bg-purple-50 dark:bg-purple-500/10 rounded-lg">
                            <span
                                class="material-symbols-outlined text-purple-600 dark:text-purple-400 text-xl">pending_actions</span>
                        </div>
                    </div>
                    <div>
                        <div class="flex items-end gap-3">
                            <div class="text-3xl font-bold text-gray-900 dark:text-white">{{ pendingCount }}</div>
                            <div class="text-sm text-gray-500 mb-1">Requests</div>
                        </div>
                        <button @click="showProcessModal = true"
                            class="w-full mt-4 py-2 bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400 rounded-lg text-sm font-bold hover:bg-purple-600 hover:text-white transition-colors flex items-center justify-center gap-2">
                            <span class="material-symbols-outlined text-sm">fact_check</span> Batch Review
                        </button>
                    </div>
                </div>
            </div>

            <!-- Auto-Refund Rules -->
            <div
                class="lg:col-span-2 bg-white dark:bg-black/20 border border-gray-100 dark:border-white/5 p-6 rounded-xl shadow-sm">
                <div class="flex items-center justify-between mb-4">
                    <div>
                        <h3 class="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <span class="material-symbols-outlined text-purple-500">smart_toy</span> AI Auto-Refund
                            Rules
                        </h3>
                        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Configure automated rules to process
                            low-risk refunds instantly.</p>
                    </div>
                    <button @click="showAddRuleModal = true"
                        class="px-3 py-1.5 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-bold transition-colors flex items-center gap-1">
                        <span class="material-symbols-outlined text-[14px]">add</span> New Rule
                    </button>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div v-for="rule in rules" :key="rule.id"
                        class="flex flex-col p-4 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/5 hover:border-purple-200 dark:hover:border-purple-500/30 transition-colors group">
                        <div class="flex items-start justify-between mb-2">
                            <div class="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                {{ rule.name }}
                            </div>
                            <!-- Custom Toggle -->
                            <button @click="rule.enabled = !rule.enabled"
                                class="w-9 h-5 rounded-full relative transition-colors"
                                :class="rule.enabled ? 'bg-purple-500' : 'bg-gray-300 dark:bg-gray-600'">
                                <div class="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform"
                                    :class="rule.enabled ? 'right-0.5' : 'left-0.5'"></div>
                            </button>
                        </div>
                        <div
                            class="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-auto pt-2 border-t border-gray-200 dark:border-white/10">
                            <span class="material-symbols-outlined text-[14px]">turn_right</span> Action: <strong
                                class="text-gray-700 dark:text-gray-300">{{ rule.action }}</strong>
                        </div>
                    </div>
                </div>
                <div
                    class="mt-4 p-3 bg-blue-50 dark:bg-blue-500/10 rounded-lg flex items-start gap-2 border border-blue-100 dark:border-blue-500/20 text-xs text-blue-800 dark:text-blue-300">
                    <span class="material-symbols-outlined text-[16px] mt-0.5">info</span>
                    <p>Rules only apply to requests where AI computes Fraud Risk &lt; 15%. High risk requests always
                        require manual review.</p>
                </div>
            </div>
        </div>

        <!-- Refund Requests Table -->
        <div
            class="bg-white dark:bg-black/20 border border-gray-100 dark:border-white/5 rounded-xl overflow-hidden shadow-sm">
            <div
                class="p-4 sm:p-6 border-b border-gray-100 dark:border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50 dark:bg-white/5">
                <h3 class="font-bold text-gray-900 dark:text-white">Refund Requests Queue</h3>

                <!-- Filter Tabs -->
                <div
                    class="flex bg-gray-200 dark:bg-white/10 rounded-lg p-1 overflow-x-auto no-scrollbar w-full sm:w-auto">
                    <button v-for="filter in ['All', 'Pending Review', 'Approved', 'Rejected']" :key="filter"
                        @click="activeListFilter = filter"
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
                            <th class="p-4 pl-6 w-32">Date & ID</th>
                            <th class="p-4">Customer Details</th>
                            <th class="p-4">Amount & Reason</th>
                            <th class="p-4">AI Risk & Status</th>
                            <th class="p-4 text-right pr-6">Action</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100 dark:divide-white/5">
                        <tr v-for="refund in filteredRefunds" :key="refund.id"
                            class="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group cursor-pointer"
                            @click="openRefundDetail(refund)">

                            <td class="p-4 pl-6">
                                <div
                                    class="font-mono text-xs font-bold px-2 py-1 rounded bg-gray-100 dark:bg-white/10 inline-block text-gray-800 dark:text-gray-200 mb-1">
                                    {{ refund.reqId }}
                                </div>
                                <div class="text-[10px] text-gray-500 dark:text-gray-400">{{ refund.date }}</div>
                            </td>

                            <td class="p-4">
                                <div class="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <div
                                        class="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-[10px]">
                                        {{ refund.initials }}
                                    </div>
                                    {{ refund.customer }}
                                </div>
                                <div class="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                                    <span class="material-symbols-outlined text-[12px]">receipt</span> Order #{{
                                    refund.orderId }}
                                </div>
                            </td>

                            <td class="p-4">
                                <div class="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1">
                                    ${{ refund.amount.toFixed(2) }}
                                </div>
                                <div class="text-[10px] mt-1 flex gap-1 items-center">
                                    <span
                                        class="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-1.5 py-0.5 rounded border border-gray-300 dark:border-gray-600 shrink-0">{{
                                        refund.type }}</span>
                                    <span class="text-gray-500 truncate max-w-[150px] inline-block">{{ refund.reason
                                        }}</span>
                                </div>
                            </td>

                            <td class="p-4">
                                <div class="flex flex-col items-start gap-1.5">
                                    <span class="px-2.5 py-1 rounded-full text-[10px] font-bold border"
                                        :class="refund.statusClass">
                                        {{ refund.status }}
                                    </span>
                                    <span v-if="refund.status === 'Pending Review'"
                                        class="flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded"
                                        :class="refund.riskScore > 50 ? 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-500/10' : 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-500/10'">
                                        <span class="material-symbols-outlined text-[12px]">{{ refund.riskScore > 50 ?
                                            'warning' : 'verified' }}</span>
                                        Risk: {{ refund.riskScore }}%
                                    </span>
                                </div>
                            </td>

                            <td class="p-4 pr-6">
                                <div class="flex justify-end gap-2">
                                    <button @click.stop="openRefundDetail(refund)"
                                        class="p-2 bg-gray-100 dark:bg-white/5 rounded-lg hover:bg-gray-200 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300 transition-colors tooltip-trigger relative">
                                        <span class="material-symbols-outlined text-sm">visibility</span>
                                        <span class="tooltip">View Details</span>
                                    </button>

                                    <template v-if="refund.status === 'Pending Review'">
                                        <button @click.stop="approveRefund(refund)"
                                            class="px-2.5 py-1.5 bg-green-100 hover:bg-green-200 dark:bg-green-500/20 dark:hover:bg-green-500/30 text-green-700 dark:text-green-400 text-xs font-bold rounded-lg transition-colors border border-green-200 dark:border-green-500/30">
                                            Approve
                                        </button>
                                        <button @click.stop="rejectRefund(refund)"
                                            class="px-2.5 py-1.5 bg-red-100 hover:bg-red-200 dark:bg-red-500/20 dark:hover:bg-red-500/30 text-red-700 dark:text-red-400 text-xs font-bold rounded-lg transition-colors border border-red-200 dark:border-red-500/30">
                                            Reject
                                        </button>
                                    </template>
                                </div>
                            </td>
                        </tr>

                        <tr v-if="filteredRefunds.length === 0">
                            <td colspan="5" class="p-8 text-center text-gray-500 dark:text-gray-400">
                                <div class="flex flex-col items-center justify-center">
                                    <span
                                        class="material-symbols-outlined text-4xl mb-2 text-gray-300 dark:text-gray-600">receipt_long</span>
                                    <p>No refund requests found matching your criteria.</p>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Details Modal -->
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
                                    {{ selectedRefund?.reqId }}
                                </div>
                                <span class="px-2.5 py-1 rounded-full text-xs font-bold border"
                                    :class="selectedRefund?.statusClass">
                                    {{ selectedRefund?.status }}
                                </span>
                            </div>
                            <h3 class="text-xl font-bold text-gray-900 dark:text-white mt-1">Refund Details</h3>
                        </div>
                        <div class="text-right">
                            <div class="text-sm text-gray-500 dark:text-gray-400 mb-1">Requested Amount</div>
                            <div class="text-3xl font-bold text-gray-900 dark:text-white">${{
                                selectedRefund?.amount.toFixed(2)
                                }}</div>
                        </div>
                    </div>

                    <div class="p-6 overflow-y-auto custom-scrollbar flex-1 bg-white dark:bg-black/10 space-y-6">
                        <!-- Customer & Order Info -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div
                                class="bg-gray-50 dark:bg-white/5 rounded-xl p-4 border border-gray-100 dark:border-white/5">
                                <h4
                                    class="text-xs uppercase font-bold text-gray-400 tracking-wider mb-3 flex items-center gap-2">
                                    <span class="material-symbols-outlined text-[14px]">person</span> Customer Profile
                                </h4>
                                <div class="space-y-2">
                                    <div class="flex justify-between">
                                        <span class="text-sm text-gray-500">Name</span>
                                        <span class="text-sm font-bold text-gray-900 dark:text-white">{{
                                            selectedRefund?.customer }}</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="text-sm text-gray-500">LTV</span>
                                        <span class="text-sm font-bold text-green-600 dark:text-green-400">${{
                                            selectedRefund?.ltv || '1,450.00' }}</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="text-sm text-gray-500">Prior Refunds</span>
                                        <span class="text-sm font-medium text-gray-900 dark:text-gray-300">{{
                                            selectedRefund?.priorRefunds || 0 }}</span>
                                    </div>
                                </div>
                            </div>

                            <div
                                class="bg-gray-50 dark:bg-white/5 rounded-xl p-4 border border-gray-100 dark:border-white/5">
                                <h4
                                    class="text-xs uppercase font-bold text-gray-400 tracking-wider mb-3 flex items-center gap-2">
                                    <span class="material-symbols-outlined text-[14px]">receipt_long</span> Order
                                    Information
                                </h4>
                                <div class="space-y-2">
                                    <div class="flex justify-between">
                                        <span class="text-sm text-gray-500">Order ID</span>
                                        <span class="text-sm font-bold text-purple-600 dark:text-purple-400">{{
                                            selectedRefund?.orderId }}</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="text-sm text-gray-500">Order Date</span>
                                        <span class="text-sm text-gray-900 dark:text-gray-300">Oct 15, 2024</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="text-sm text-gray-500">Payment Method</span>
                                        <span class="text-sm text-gray-900 dark:text-gray-300">Visa ending in
                                            4242</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Refund Reason -->
                        <div
                            class="bg-gray-50 dark:bg-white/5 rounded-xl p-4 border border-gray-100 dark:border-white/5">
                            <h4 class="text-xs uppercase font-bold text-gray-400 tracking-wider mb-3">Claim details</h4>
                            <div class="flex gap-2 mb-2">
                                <span
                                    class="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded border border-gray-300 dark:border-gray-600 text-xs font-bold">{{
                                    selectedRefund?.type }}</span>
                            </div>
                            <p
                                class="text-sm text-gray-700 dark:text-gray-300 italic border-l-2 border-gray-300 dark:border-gray-600 pl-3">
                                "{{ selectedRefund?.reason }}"
                            </p>
                        </div>

                        <!-- AI Insight -->
                        <div class="rounded-xl p-4 flex items-start gap-3 border"
                            :class="selectedRefund?.riskScore > 50 ? 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20' : 'bg-purple-50 dark:bg-purple-500/10 border-purple-200 dark:border-purple-500/20'">
                            <span class="material-symbols-outlined mt-0.5"
                                :class="selectedRefund?.riskScore > 50 ? 'text-red-600 dark:text-red-400' : 'text-purple-600 dark:text-purple-400'">
                                smart_toy
                            </span>
                            <div>
                                <div class="flex items-center justify-between mb-1">
                                    <h4 class="text-sm font-bold"
                                        :class="selectedRefund?.riskScore > 50 ? 'text-red-900 dark:text-red-300' : 'text-purple-900 dark:text-purple-300'">
                                        AI Fraud risk assessment</h4>
                                    <span class="text-xs font-bold px-2 py-0.5 rounded"
                                        :class="selectedRefund?.riskScore > 50 ? 'bg-red-200 dark:bg-red-500/30 text-red-800 dark:text-red-200' : 'bg-purple-200 dark:bg-purple-500/30 text-purple-800 dark:text-purple-200'">
                                        Risk: {{ selectedRefund?.riskScore }}%
                                    </span>
                                </div>
                                <p class="text-xs mt-1"
                                    :class="selectedRefund?.riskScore > 50 ? 'text-red-700 dark:text-red-400' : 'text-purple-700 dark:text-purple-400'">
                                    {{ selectedRefund?.riskScore > 50 ? 'High Risk: Customer has requested 3 refunds in the last 30 days for similar items.Manual verification strongly recommended before approval.' : 'Low Risk: Customer has high lifetime value and no previous refund history.Pattern matches standard courier delay metrics.' }}
                                </p>
                            </div>
                        </div>

                    </div>

                    <div class="p-6 border-t border-gray-100 dark:border-white/5 flex gap-3 bg-gray-50 dark:bg-white/5">
                        <button @click="showDetailModal = false"
                            class="px-6 py-2.5 bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/10 text-gray-700 dark:text-white font-bold rounded-xl transition-colors shadow-sm">
                            Close
                        </button>
                        <div class="flex-1 flex justify-end gap-2" v-if="selectedRefund?.status === 'Pending Review'">
                            <button @click="rejectRefund(selectedRefund); showDetailModal = false"
                                class="px-6 py-2.5 bg-red-100 hover:bg-red-200 dark:bg-red-500/20 dark:hover:bg-red-500/30 text-red-700 dark:text-red-400 font-bold rounded-xl transition-colors border border-red-200 dark:border-red-500/30">
                                Reject Refund
                            </button>
                            <button @click="approveRefund(selectedRefund); showDetailModal = false"
                                class="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-colors shadow-sm flex items-center gap-2">
                                <span class="material-symbols-outlined text-sm">thumb_up</span> Approve ${{
                                selectedRefund.amount.toFixed(2) }}
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
                                <h3 class="text-xl font-bold text-gray-900 dark:text-white">Batch Process Refunds</h3>
                                <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">{{ pendingCount }} requests
                                    pending
                                    your review.</p>
                            </div>
                        </div>
                    </div>

                    <div
                        class="p-4 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-100 dark:border-blue-500/20 text-xs text-blue-800 dark:text-blue-300 flex gap-2">
                        <span class="material-symbols-outlined text-[16px]">info</span>
                        Focus on High-Risk items manually. Use AI Auto-Approve for low-risk items below $50.
                    </div>

                    <div class="p-6 space-y-3 max-h-[40vh] overflow-y-auto custom-scrollbar">
                        <div v-for="ref in refunds.filter(r => r.status === 'Pending Review')" :key="ref.id"
                            class="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/5 gap-4">
                            <div>
                                <div class="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                                    {{ ref.customer }}
                                    <span class="text-xs text-green-600 dark:text-green-400 font-bold">${{
                                        ref.amount.toFixed(2)
                                        }}</span>
                                </div>
                                <div class="text-xs text-gray-500 mt-1">{{ ref.type }}</div>
                                <div class="text-[10px] mt-1 font-bold"
                                    :class="ref.riskScore > 50 ? 'text-red-500' : 'text-green-500'">AI Risk: {{
                                    ref.riskScore
                                    }}%</div>
                            </div>
                            <div class="flex gap-2 shrink-0">
                                <button @click="approveRefund(ref)"
                                    class="p-2 bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-500/30 border border-green-200 dark:border-green-500/30 transition-colors"
                                    title="Approve">
                                    <span class="material-symbols-outlined text-sm">check</span>
                                </button>
                                <button @click="rejectRefund(ref)"
                                    class="p-2 bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-500/30 border border-red-200 dark:border-red-500/30 transition-colors"
                                    title="Reject">
                                    <span class="material-symbols-outlined text-sm">close</span>
                                </button>
                            </div>
                        </div>
                        <div v-if="pendingCount === 0"
                            class="text-center text-gray-500 dark:text-gray-400 py-8 flex flex-col items-center">
                            <span
                                class="material-symbols-outlined text-4xl mb-2 text-gray-300 dark:text-gray-600">done_all</span>
                            <p>All requests processed. Queue is clear!</p>
                        </div>
                    </div>
                    <div class="p-6 border-t border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/5 flex gap-3">
                        <button @click="approveAllLowRisk" v-if="pendingCount > 0"
                            class="flex-1 py-2.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white text-sm font-bold rounded-xl transition-colors flex justify-center items-center gap-2">
                            <span class="material-symbols-outlined text-sm">smart_toy</span> Approve Low Risk
                        </button>
                        <button @click="showProcessModal = false"
                            class="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold rounded-xl transition-colors shadow-sm">
                            Done Reviewing
                        </button>
                    </div>
                </div>
            </div>
        </Teleport>

        <!-- Auto-Refund Rule Modal -->
        <Teleport to="body">
            <div v-if="showAddRuleModal"
                class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                @click.self="showAddRuleModal = false">
                <div
                    class="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md shadow-2xl border border-gray-100 dark:border-white/10 overflow-hidden">
                    <div class="p-6 border-b border-gray-100 dark:border-white/5 bg-purple-50 dark:bg-purple-900/10">
                        <div class="flex items-center gap-3">
                            <span
                                class="material-symbols-outlined text-purple-600 dark:text-purple-400 text-3xl">rule_settings</span>
                            <div>
                                <h3 class="text-xl font-bold text-gray-900 dark:text-white">Add Auto-Refund Rule</h3>
                                <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Create logic to reduce manual
                                    reviews.
                                </p>
                            </div>
                        </div>
                    </div>
                    <div class="p-6 space-y-4">
                        <div>
                            <label
                                class="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">Rule
                                Name</label>
                            <input v-model="newRule.name" type="text"
                                class="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white outline-none focus:border-purple-500 transition-colors"
                                placeholder="e.g. Lost Delivery < $100" />
                        </div>
                        <div>
                            <label
                                class="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">Trigger
                                Condition</label>
                            <select
                                class="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white outline-none focus:border-purple-500 transition-colors">
                                <option>Order Amount &lt; $50</option>
                                <option>Time in Transit &gt; 14 days</option>
                                <option>Customer LTV &gt; $500</option>
                            </select>
                        </div>
                        <div>
                            <label
                                class="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">Action</label>
                            <select v-model="newRule.action"
                                class="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white outline-none focus:border-purple-500 transition-colors">
                                <option>Auto-Approve Full Refund</option>
                                <option>Flag for Manual Review</option>
                                <option>Offer Store Credit (+10%)</option>
                            </select>
                        </div>
                    </div>
                    <div class="p-6 border-t border-gray-100 dark:border-white/5 flex gap-3 bg-gray-50 dark:bg-white/5">
                        <button @click="showAddRuleModal = false"
                            class="flex-1 py-2.5 bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/10 text-gray-700 dark:text-white font-bold rounded-xl transition-colors shadow-sm">
                            Cancel
                        </button>
                        <button @click="addRule" :disabled="!newRule.name"
                            class="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold rounded-xl transition-colors shadow-sm">
                            Save Rule
                        </button>
                    </div>
                </div>
            </div>
        </Teleport>

        <!-- Add Refund Modal (Issue Refund) -->
        <Teleport to="body">
            <div v-if="showAddRefundModal"
                class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                @click.self="showAddRefundModal = false">
                <div
                    class="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-lg shadow-2xl border border-gray-100 dark:border-white/10 overflow-hidden">
                    <div class="p-6 border-b border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/5">
                        <h3 class="text-xl font-bold text-gray-900 dark:text-white">Issue Manual Refund</h3>
                        <p class="text-xs text-gray-500 mt-1">Initiate a refund directly to a customer's original
                            payment
                            method.</p>
                    </div>
                    <div class="p-6 space-y-4">
                        <div>
                            <label
                                class="block text-[10px] font-bold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">Search
                                Order / Customer</label>
                            <div class="relative">
                                <input type="text" placeholder="e.g. MV-4422 or Jane Doe"
                                    class="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:border-purple-500 transition-colors">
                                <span
                                    class="material-symbols-outlined absolute left-3 top-2.5 text-gray-400 text-lg">search</span>
                            </div>
                        </div>
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label
                                    class="block text-[10px] font-bold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">Refund
                                    Amount ($)</label>
                                <input type="number" placeholder="0.00"
                                    class="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:border-purple-500 transition-colors">
                            </div>
                            <div>
                                <label
                                    class="block text-[10px] font-bold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">Reason
                                    Category</label>
                                <select
                                    class="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:border-purple-500 transition-colors">
                                    <option>Customer Satisfaction</option>
                                    <option>Late Delivery</option>
                                    <option>Lost/Damaged Item</option>
                                    <option>Price Adjustment</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label
                                class="block text-[10px] font-bold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">Internal
                                Notes (Optional)</label>
                            <textarea rows="2" placeholder="Why is this refund being issued?"
                                class="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg px-4 py-3 text-sm text-gray-900 dark:text-white outline-none focus:border-purple-500 transition-colors resize-none"></textarea>
                        </div>
                    </div>
                    <div class="p-6 border-t border-gray-100 dark:border-white/5 flex gap-3 bg-gray-50 dark:bg-white/5">
                        <button @click="showAddRefundModal = false"
                            class="flex-1 py-2.5 bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/10 text-gray-700 dark:text-white font-bold rounded-xl transition-colors shadow-sm">
                            Cancel
                        </button>
                        <button @click="showAddRefundModal = false"
                            class="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2">
                            <span class="material-symbols-outlined text-[16px]">credit_card</span> Issue Refund
                        </button>
                    </div>
                </div>
            </div>
        </Teleport>

    </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const searchQuery = ref('')
const activeListFilter = ref('All')

const showAddRuleModal = ref(false)
const showDetailModal = ref(false)
const showProcessModal = ref(false)
const showAddRefundModal = ref(false)

const selectedRefund = ref(null)

const newRule = ref({ name: '', action: 'Auto-Approve Full Refund' })

const rules = ref([
    { id: 1, name: 'Damaged Items < $50', action: 'Auto-Approve Full Refund', enabled: true },
    { id: 2, name: 'Late Delivery > 24h', action: 'Offer Store Credit (+10%)', enabled: true },
    { id: 3, name: 'High Value Missing Item', action: 'Flag for Manual Review', enabled: false },
])

const refunds = ref([
    { id: 1, reqId: 'REF-0012', customer: 'David Rose', initials: 'DR', orderId: 'MV-1122', reason: 'Sweater arrived damaged, completely unraveled', type: 'Damaged Item', date: 'Today, 10:45 AM', amount: 45.00, riskScore: 12, priorRefunds: 0, status: 'Pending Review', statusClass: 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-500/10 dark:text-yellow-400 dark:border-yellow-500/20' },
    { id: 2, reqId: 'REF-0013', customer: 'Alexis Rose', initials: 'AR', orderId: 'MV-3344', reason: 'Service complaint, extremely rude driver', type: 'Service Issue', date: 'Yesterday, 2:15 PM', amount: 120.00, riskScore: 8, priorRefunds: 1, status: 'Pending Review', statusClass: 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-500/10 dark:text-yellow-400 dark:border-yellow-500/20' },
    { id: 3, reqId: 'REF-0014', customer: 'Johnny Rose', initials: 'JR', orderId: 'MV-5566', reason: 'Missing box #4 from the shipment of 10 boxes', type: 'Lost Transit', date: 'Oct 24, 2024', amount: 200.00, riskScore: 78, priorRefunds: 4, ltv: '350.00', status: 'Pending Review', statusClass: 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-500/10 dark:text-yellow-400 dark:border-yellow-500/20' },
    { id: 4, reqId: 'REF-0008', customer: 'Moira Rose', initials: 'MR', orderId: 'MV-7788', reason: 'Package arrived 3 days past guaranteed date', type: 'Late Delivery', date: 'Oct 21, 2024', amount: 35.00, riskScore: 4, priorRefunds: 0, status: 'Approved', statusClass: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20' },
    { id: 5, reqId: 'REF-0005', customer: 'Stevie Budd', initials: 'SB', orderId: 'MV-9911', reason: 'Empty box received, claimed stolen', type: 'Theft Claim', date: 'Oct 18, 2024', amount: 550.00, riskScore: 92, priorRefunds: 1, status: 'Rejected', statusClass: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20' },
])

const filteredRefunds = computed(() => {
    let result = refunds.value

    // Status Filter
    if (activeListFilter.value !== 'All') {
        result = result.filter(r => r.status === activeListFilter.value)
    }

    // Text Search
    if (searchQuery.value) {
        const q = searchQuery.value.toLowerCase()
        result = result.filter(r =>
            r.reqId.toLowerCase().includes(q) ||
            r.customer.toLowerCase().includes(q) ||
            r.orderId.toLowerCase().includes(q)
        )
    }
    return result
})

const pendingCount = computed(() => refunds.value.filter(r => r.status === 'Pending Review').length)

function openRefundDetail(refund) {
    selectedRefund.value = refund
    showDetailModal.value = true
}

function approveRefund(refund) {
    refund.status = 'Approved'
    refund.statusClass = 'bg-green-50 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20'
}

function rejectRefund(refund) {
    refund.status = 'Rejected'
    refund.statusClass = 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20'
}

function approveAllLowRisk() {
    refunds.value.forEach(r => {
        if (r.status === 'Pending Review' && r.riskScore <= 50) {
            approveRefund(r)
        }
    })
    showProcessModal.value = false
}

function addRule() {
    if (!newRule.value.name) return
    rules.value.push({
        id: Date.now(),
        name: newRule.value.name,
        action: newRule.value.action,
        enabled: true
    })
    newRule.value = { name: '', action: 'Auto-Approve Full Refund' }
    showAddRuleModal.value = false
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
