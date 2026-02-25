<template>
    <div class="h-full flex flex-col space-y-6">
        <!-- Header & Control Bar -->
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
            <div>
                <h2 class="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <span class="material-symbols-outlined text-primary">analytics</span> Reports & Command Center
                </h2>
                <p class="text-xs text-gray-500 font-mono mt-1">
                    Live Operational Intelligence • {{ store.activeWarehouseName }}
                </p>
            </div>

            <div class="flex flex-wrap gap-2 items-center">
                <!-- AI Query Bar -->
                <div class="relative group mr-2">
                    <input v-model="aiQuery" @keyup.enter="handleAiQuery" type="text"
                        placeholder="Ask AI: 'Show me top spending vendors...'"
                        class="pl-10 pr-4 py-2 bg-white dark:bg-white/5 border border-purple-200 dark:border-purple-500/30 rounded-full text-sm w-64 focus:w-80 transition-all outline-none focus:ring-2 focus:ring-purple-500/50 shadow-sm">
                    <span
                        class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-purple-500">auto_awesome</span>
                </div>

                <select v-model="timeRange"
                    class="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-sm px-3 py-2 outline-none focus:ring-2 focus:ring-primary/50 text-gray-700 dark:text-gray-200 cursor-pointer">
                    <option value="today">Today (Live)</option>
                    <option value="7d">Last 7 Days</option>
                    <option value="30d">Last 30 Days</option>
                    <option value="ytd">Year to Date</option>
                </select>

                <button @click="downloadCurrentView"
                    class="bg-white hover:bg-gray-50 dark:bg-white/10 dark:hover:bg-white/20 text-gray-700 dark:text-white font-bold px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-all border border-gray-200 dark:border-white/10">
                    <span class="material-symbols-outlined">download</span> Export View
                </button>
            </div>
        </div>

        <!-- Navigation Tabs -->
        <div
            class="flex gap-1 overflow-x-auto pb-2 shrink-0 border-b border-gray-200 dark:border-white/10 no-scrollbar">
            <button v-for="tab in tabs" :key="tab.id" @click="activeTab = tab.id"
                class="px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2"
                :class="activeTab === tab.id ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5'">
                <span class="material-symbols-outlined text-[18px]">{{ tab.icon }}</span>
                {{ tab.label }}
            </button>
        </div>

        <!-- Main Content Area -->
        <div class="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-10">

            <!-- 1. CONTROL TOWER (Executive Summary) -->
            <div v-if="activeTab === 'control_tower'" class="space-y-6 animate-fade-in">
                <!-- Top Row Alerts -->
                <div v-if="crisisAlerts.length > 0" class="flex gap-4 overflow-x-auto pb-2">
                    <div v-for="(alert, i) in crisisAlerts" :key="i"
                        class="flex-shrink-0 w-80 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 p-4 rounded-xl flex items-start gap-3 shadow-sm hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors">
                        <span class="material-symbols-outlined text-red-600 animate-bounce">warning</span>
                        <div>
                            <h4 class="font-bold text-red-700 dark:text-red-400 text-sm">{{ alert.title }}</h4>
                            <p class="text-xs text-red-600/80 dark:text-red-400/80 mt-1">{{ alert.desc }}</p>
                            <p class="text-[10px] text-red-500 font-mono mt-2">Active Alert</p>
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <!-- Daily Orders Gauge -->
                    <div
                        class="lg:col-span-1 p-6 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl shadow-sm text-center relative overflow-hidden group hover:scale-[1.02] transition-transform">
                        <h3 class="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-4">
                            Daily Completion</h3>
                        <div class="relative h-74 w-40 mx-auto">
                            <svg class="h-full w-full -rotate-90" viewBox="0 0 36 36">
                                <path class="text-gray-200 dark:text-gray-700"
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                    fill="none" stroke="currentColor" stroke-width="3" />
                                <path class="text-primary transition-all duration-1000 ease-out"
                                    :stroke-dasharray="`${completionRate}, 100`"
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                    fill="none" stroke="currentColor" stroke-width="3" />
                            </svg>
                            <div class="absolute inset-0 flex flex-col items-center justify-center">
                                <span class="text-xl font-black text-gray-900 dark:text-white">{{ completedOrders }}/{{
                                    totalOrders }}</span>
                                <span class="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Orders</span>
                            </div>
                        </div>
                    </div>

                    <!-- System Health + Dues -->
                    <div class="lg:col-span-1 space-y-4">
                        <div
                            class="p-5 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                            <h3 class="text-xs font-bold text-gray-500 uppercase mb-2">System Health</h3>
                            <div class="flex items-end gap-2">
                                <span class="text-4xl font-black text-green-500">{{ store.dashboardStats.deliverySuccess
                                    }}%</span>
                                <span
                                    class="text-xs text-green-600 mb-1 font-bold bg-green-100 px-2 py-0.5 rounded-full">+0.4%</span>
                            </div>
                            <p class="text-xs text-gray-400 mt-2">Delivery Success Rate</p>
                        </div>
                        <div
                            class="p-5 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-500/20 rounded-2xl shadow-sm relative overflow-hidden group hover:scale-[1.02] transition-transform">
                            <div
                                class="absolute -right-4 -top-4 bg-red-500 w-16 h-16 rounded-full opacity-20 blur-xl group-hover:opacity-30 transition-opacity">
                            </div>
                            <h3
                                class="text-xs font-bold text-red-600 dark:text-red-400 uppercase mb-2 flex items-center gap-1">
                                <span class="material-symbols-outlined text-[16px]">payments</span> Pending Dues
                            </h3>
                            <span class="text-3xl font-black text-gray-900 dark:text-white">$52,430</span>
                            <p class="text-xs text-red-500 mt-1 font-medium">Critical Collection Required</p>
                        </div>
                    </div>

                    <!-- AI Daily Summary -->
                    <div
                        class="lg:col-span-2 p-6 bg-gradient-to-br from-purple-50 to-white dark:from-purple-900/10 dark:to-white/5 border border-purple-100 dark:border-purple-500/20 rounded-2xl shadow-sm relative">
                        <span
                            class="material-symbols-outlined absolute top-4 right-4 text-purple-300 text-6xl opacity-20 animate-pulse">auto_awesome</span>
                        <h3 class="font-bold text-purple-900 dark:text-purple-300 flex items-center gap-2 mb-3">
                            <span class="material-symbols-outlined">smart_toy</span> Daily AI Briefing
                        </h3>
                        <ul class="space-y-2">
                            <li v-for="(insight, i) in aiInsights" :key="i"
                                class="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                                <span class="mt-1 h-1.5 w-1.5 rounded-full bg-purple-500 shrink-0"></span>
                                {{ insight }}
                            </li>
                        </ul>
                    </div>
                </div>

                <!-- Entity Stats Overview Table -->
                <div
                    class="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl shadow-sm overflow-hidden animate-fade-in-up">
                    <div class="p-4 border-b border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/5">
                        <h3 class="font-bold text-gray-900 dark:text-white">Operational Entity Overview</h3>
                    </div>
                    <table class="w-full text-left text-xs">
                        <thead class="bg-gray-50 dark:bg-black/20 text-gray-500 dark:text-gray-400 font-bold uppercase">
                            <tr>
                                <th class="p-4">Entity Type</th>
                                <th class="p-4 text-center">Active Count</th>
                                <th class="p-4 text-center">Issues</th>
                                <th class="p-4 text-right">Performance/Status</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-100 dark:divide-white/5">
                            <tr class="hover:bg-gray-50 dark:hover:bg-white/5">
                                <td class="p-4 font-bold">Drivers</td>
                                <td class="p-4 text-center">{{ store.filteredDrivers.length }}</td>
                                <td class="p-4 text-center text-red-500 font-bold">{{store.filteredDrivers.filter(d => d.status !== 'Active').length }}</td>
                                <td class="p-4 text-right text-green-600 font-mono">94% Efficiency</td>
                            </tr>
                            <tr class="hover:bg-gray-50 dark:hover:bg-white/5">
                                <td class="p-4 font-bold">Vehicles</td>
                                <td class="p-4 text-center">{{ store.filteredVehicles.length }}</td>
                                <td class="p-4 text-center text-yellow-500 font-bold">{{store.filteredVehicles.filter(v => v.status !== 'Active').length }}</td>
                                <td class="p-4 text-right font-mono">2 In Shop</td>
                            </tr>
                            <tr class="hover:bg-gray-50 dark:hover:bg-white/5">
                                <td class="p-4 font-bold">Returns (RMA)</td>
                                <td class="p-4 text-center">{{ store.filteredReturns.length }}</td>
                                <td class="p-4 text-center text-blue-500 font-bold">{{store.filteredReturns.filter(r => r.status === 'Pending').length }}</td>
                                <td class="p-4 text-right font-mono">Processing</td>
                            </tr>
                            <tr class="hover:bg-gray-50 dark:hover:bg-white/5">
                                <td class="p-4 font-bold">Inventory</td>
                                <td class="p-4 text-center">{{ store.filteredInventory.length }} items</td>
                                <td class="p-4 text-center text-red-500 font-bold">{{store.filteredInventory.filter(i => i.status.includes('Low')).length }}</td>
                                <td class="p-4 text-right font-mono">Stock Level OK</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- 2. FINANCIAL LEDGER -->
            <div v-if="activeTab === 'financials'" class="space-y-6 animate-fade-in">
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <!-- Revenue Split -->
                    <div
                        class="p-6 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl shadow-sm">
                        <h3 class="font-bold text-gray-900 dark:text-white mb-4">Revenue Stream</h3>
                        <div class="h-74 relative flex justify-center">
                            <Doughnut :data="revenueStreamData" :options="doughnutOptions" />
                        </div>
                    </div>
                    <!-- Recon Breakdown -->
                    <div
                        class="lg:col-span-2 p-6 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl shadow-sm">
                        <h3 class="font-bold text-gray-900 dark:text-white mb-4">Payment Reconciliation (COD vs Digital)
                        </h3>
                        <div class="h-74 relative">
                            <Bar :data="paymentReconData" :options="chartOptions" />
                        </div>
                    </div>
                </div>

                <!-- Fuel Audit Chart -->
                <div
                    class="p-6 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl shadow-sm">
                    <h3 class="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <span class="material-symbols-outlined text-orange-500">local_gas_station</span>
                        Fuel Expense Audit (Receipts vs GPS)
                    </h3>
                    <div class="h-74 w-full relative">
                        <Line :data="fuelAuditData" :options="chartOptions" />
                    </div>
                    <div
                        class="mt-4 p-3 bg-orange-50 dark:bg-orange-500/10 border border-orange-100 dark:border-orange-500/20 rounded-lg flex items-center gap-3">
                        <span class="material-symbols-outlined text-orange-600">visibility</span>
                        <p class="text-xs text-orange-800 dark:text-orange-300"><strong>Anomaly Detected:</strong>
                            Vehicle V-402 reported 450km but GPS logs show 320km on Feb 22.</p>
                    </div>
                </div>

                <!-- Payment Ledger -->
                <div
                    class="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl shadow-sm overflow-hidden">
                    <div
                        class="p-4 border-b border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/5 flex justify-between">
                        <h3 class="font-bold text-gray-900 dark:text-white">Live Payment Ledger</h3>
                        <button class="text-xs text-primary font-bold hover:underline">View All</button>
                    </div>
                    <table class="w-full text-left text-xs">
                        <thead class="bg-gray-50 dark:bg-black/20 text-gray-500 dark:text-gray-400 font-bold uppercase">
                            <tr>
                                <th class="p-4">Customer</th>
                                <th class="p-4">Transaction ID</th>
                                <th class="p-4 text-right">Amount</th>
                                <th class="p-4 text-right">Date</th>
                                <th class="p-4">Status</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-100 dark:divide-white/5">
                            <tr v-for="tx in store.filteredTransactions" :key="tx.id"
                                class="hover:bg-gray-50 dark:hover:bg-white/5">
                                <td class="p-4 font-bold text-gray-900 dark:text-white">{{ tx.desc }}</td>
                                <td class="p-4 font-mono text-gray-500">{{ tx.id }}</td>
                                <td class="p-4 text-right font-mono font-bold"
                                    :class="tx.amount > 0 ? 'text-green-600' : 'text-red-500'">${{ Math.abs(tx.amount)
                                    }}</td>
                                <td class="p-4 text-right font-mono">{{ tx.date }}</td>
                                <td class="p-4">
                                    <span class="px-2 py-1 rounded text-[10px] uppercase font-bold"
                                        :class="tx.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'">
                                        {{ tx.status }}
                                    </span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- Outstanding Dues Ageing Report -->
                <div
                    class="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl shadow-sm overflow-hidden mt-6">
                    <div
                        class="p-4 border-b border-gray-100 dark:border-white/10 bg-red-50 dark:bg-red-900/10 flex justify-between">
                        <h3 class="font-bold text-red-900 dark:text-red-300 flex items-center gap-2">
                            <span class="material-symbols-outlined">warning</span> Outstanding Dues Ageing Report
                        </h3>
                        <button class="text-xs text-red-700 font-bold hover:underline">Export Report</button>
                    </div>
                    <table class="w-full text-left text-xs">
                        <thead class="bg-gray-50 dark:bg-black/20 text-gray-500 dark:text-gray-400 font-bold uppercase">
                            <tr>
                                <th class="p-4">Customer / Vendor</th>
                                <th class="p-4 text-center">Days Overdue</th>
                                <th class="p-4 text-right">Outstanding Amount</th>
                                <th class="p-4">Status</th>
                                <th class="p-4 text-right">Last Contact</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-100 dark:divide-white/5">
                            <tr class="hover:bg-gray-50 dark:hover:bg-white/5">
                                <td class="p-4 font-bold text-gray-900 dark:text-white">TechCorp Logistics</td>
                                <td class="p-4 text-center font-mono text-red-600 font-bold">45 Days</td>
                                <td class="p-4 text-right font-mono font-bold text-red-600">$12,450.00</td>
                                <td class="p-4"><span
                                        class="bg-red-100 text-red-700 px-2 py-1 rounded text-[10px] font-bold">CRITICAL</span>
                                </td>
                                <td class="p-4 text-right text-gray-500">2 Days ago</td>
                            </tr>
                            <tr class="hover:bg-gray-50 dark:hover:bg-white/5">
                                <td class="p-4 font-bold text-gray-900 dark:text-white">BlueSky Retailers</td>
                                <td class="p-4 text-center font-mono text-orange-500 font-bold">28 Days</td>
                                <td class="p-4 text-right font-mono font-bold">$3,200.00</td>
                                <td class="p-4"><span
                                        class="bg-orange-100 text-orange-700 px-2 py-1 rounded text-[10px] font-bold">Overdue</span>
                                </td>
                                <td class="p-4 text-right text-gray-500">1 Week ago</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- Automated Payroll History -->
                <div
                    class="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl shadow-sm overflow-hidden mt-6">
                    <div
                        class="p-4 border-b border-gray-100 dark:border-white/10 bg-blue-50 dark:bg-blue-900/10 flex justify-between">
                        <h3 class="font-bold text-blue-900 dark:text-blue-300 flex items-center gap-2">
                            <span class="material-symbols-outlined">payments</span> Automated Payroll History
                        </h3>
                        <button class="text-xs text-blue-700 font-bold hover:underline">Download Payslips</button>
                    </div>
                    <table class="w-full text-left text-xs">
                        <thead class="bg-gray-50 dark:bg-black/20 text-gray-500 dark:text-gray-400 font-bold uppercase">
                            <tr>
                                <th class="p-4">Employee Name</th>
                                <th class="p-4">Role</th>
                                <th class="p-4 text-right">Base Salary</th>
                                <th class="p-4 text-right">Overtime</th>
                                <th class="p-4 text-right">Deductions</th>
                                <th class="p-4 text-right">Net Pay</th>
                                <th class="p-4">Status</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-100 dark:divide-white/5">
                            <tr class="hover:bg-gray-50 dark:hover:bg-white/5">
                                <td class="p-4 font-bold text-gray-900 dark:text-white">Alex Morgan</td>
                                <td class="p-4 text-gray-500">Driver</td>
                                <td class="p-4 text-right font-mono">$3,200.00</td>
                                <td class="p-4 text-right font-mono text-green-600">+$450.00</td>
                                <td class="p-4 text-right font-mono text-red-500">-$120.00</td>
                                <td class="p-4 text-right font-mono font-bold">$3,530.00</td>
                                <td class="p-4"><span
                                        class="bg-green-100 text-green-700 px-2 py-1 rounded text-[10px] font-bold">PAID</span>
                                </td>
                            </tr>
                            <tr class="hover:bg-gray-50 dark:hover:bg-white/5">
                                <td class="p-4 font-bold text-gray-900 dark:text-white">Sarah Connor</td>
                                <td class="p-4 text-gray-500">Dispatcher</td>
                                <td class="p-4 text-right font-mono">$4,100.00</td>
                                <td class="p-4 text-right font-mono text-gray-400">$0.00</td>
                                <td class="p-4 text-right font-mono text-red-500">-$200.00</td>
                                <td class="p-4 text-right font-mono font-bold">$3,900.00</td>
                                <td class="p-4"><span
                                        class="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-[10px] font-bold">PROCESSING</span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- 3. ATTENDANCE & LEAVE (New) -->
            <div v-if="activeTab === 'attendance'" class="space-y-6 animate-fade-in">
                <!-- Overview Stats Cards -->
                <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div
                        class="p-5 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl shadow-sm text-center">
                        <h3 class="text-xs uppercase font-bold text-gray-500 mb-2">Present Today</h3>
                        <span class="text-4xl font-black text-green-500">42</span>
                        <p class="text-[10px] text-gray-400 mt-1">94% of Active Staff</p>
                    </div>
                    <div
                        class="p-5 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl shadow-sm text-center">
                        <h3 class="text-xs uppercase font-bold text-gray-500 mb-2">On Leave</h3>
                        <span class="text-4xl font-black text-yellow-500">3</span>
                        <p class="text-[10px] text-gray-400 mt-1">Scheduled Absences</p>
                    </div>
                    <div
                        class="p-5 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl shadow-sm text-center">
                        <h3 class="text-xs uppercase font-bold text-gray-500 mb-2">Unplanned Absences</h3>
                        <span class="text-4xl font-black text-red-500">1</span>
                        <p class="text-[10px] text-gray-400 mt-1">Requires Attention</p>
                    </div>
                    <div
                        class="p-5 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl shadow-sm text-center">
                        <h3 class="text-xs uppercase font-bold text-gray-500 mb-2">Total Workforce</h3>
                        <span class="text-4xl font-black text-blue-500">46</span>
                        <p class="text-[10px] text-gray-400 mt-1">Active Accounts</p>
                    </div>
                </div>

                <!-- Detailed Leave Table -->
                <div
                    class="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl shadow-sm overflow-hidden flex flex-col">
                    <div class="p-4 border-b border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/5">
                        <h3 class="font-bold text-gray-900 dark:text-white">Attendance & Leave Tracker</h3>
                    </div>
                    <table class="w-full text-left text-xs">
                        <thead class="bg-gray-50 dark:bg-black/20 text-gray-500 dark:text-gray-400 font-bold uppercase">
                            <tr>
                                <th class="p-4">Employee</th>
                                <th class="p-4">Status</th>
                                <th class="p-4 text-center">Allowed Leave</th>
                                <th class="p-4 text-center">Taken</th>
                                <th class="p-4 text-center">Balance</th>
                                <th class="p-4 text-center">Extra Absent</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-100 dark:divide-white/5">
                            <tr v-for="user in store.filteredUsers" :key="user.email"
                                class="hover:bg-gray-50 dark:hover:bg-white/5">
                                <td class="p-4 flex items-center gap-3">
                                    <img :src="user.avatar" class="w-8 h-8 rounded-full">
                                    <div>
                                        <p class="font-bold text-gray-900 dark:text-white">{{ user.name }}</p>
                                        <p class="text-[10px] text-gray-400">{{ user.email }}</p>
                                    </div>
                                </td>
                                <td class="p-4">
                                    <span class="px-2 py-1 rounded text-[10px] uppercase font-bold"
                                        :class="user.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'">
                                        {{ user.status === 'Active' ? 'Present' : 'Absent' }}
                                    </span>
                                </td>
                                <td class="p-4 text-center font-mono font-bold">20 Days</td>
                                <td class="p-4 text-center font-mono text-gray-500">5</td>
                                <td class="p-4 text-center font-mono text-green-600 font-bold">15</td>
                                <td class="p-4 text-center font-mono text-red-500 font-bold">0</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- Automated Payroll History -->
                <div
                    class="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl shadow-sm overflow-hidden mt-6">
                    <div
                        class="p-4 border-b border-gray-100 dark:border-white/10 bg-green-50 dark:bg-green-900/10 flex justify-between">
                        <h3 class="font-bold text-green-900 dark:text-green-300 flex items-center gap-2">
                            <span class="material-symbols-outlined">payments</span> Automated Payroll History
                        </h3>
                        <button class="text-xs text-green-700 font-bold hover:underline">Export Excel</button>
                    </div>
                    <table class="w-full text-left text-xs">
                        <thead class="bg-gray-50 dark:bg-black/20 text-gray-500 dark:text-gray-400 font-bold uppercase">
                            <tr>
                                <th class="p-4">Staff Name</th>
                                <th class="p-4">Role</th>
                                <th class="p-4 text-center">Hours / Trips</th>
                                <th class="p-4 text-right">Base Pay</th>
                                <th class="p-4 text-right">Bonuses</th>
                                <th class="p-4 text-right">Total Payout</th>
                                <th class="p-4">Status</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-100 dark:divide-white/5">
                            <tr class="hover:bg-gray-50 dark:hover:bg-white/5">
                                <td class="p-4 font-bold text-gray-900 dark:text-white">Sarah Connor</td>
                                <td class="p-4 text-gray-500">Warehouse Manager</td>
                                <td class="p-4 text-center font-mono">160 hrs</td>
                                <td class="p-4 text-right font-mono">$4,800.00</td>
                                <td class="p-4 text-right text-green-600 font-mono">+$250.00</td>
                                <td class="p-4 text-right font-bold text-gray-900 dark:text-white">$5,050.00</td>
                                <td class="p-4"><span
                                        class="bg-green-100 text-green-700 px-2 py-1 rounded text-[10px] font-bold">PAID</span>
                                </td>
                            </tr>
                            <tr class="hover:bg-gray-50 dark:hover:bg-white/5">
                                <td class="p-4 font-bold text-gray-900 dark:text-white">John Doe</td>
                                <td class="p-4 text-gray-500">Dispatcher</td>
                                <td class="p-4 text-center font-mono">155 hrs</td>
                                <td class="p-4 text-right font-mono">$3,875.00</td>
                                <td class="p-4 text-right text-green-600 font-mono">+$100.00</td>
                                <td class="p-4 text-right font-bold text-gray-900 dark:text-white">$3,975.00</td>
                                <td class="p-4"><span
                                        class="bg-green-100 text-green-700 px-2 py-1 rounded text-[10px] font-bold">PAID</span>
                                </td>
                            </tr>
                            <tr class="hover:bg-gray-50 dark:hover:bg-white/5">
                                <td class="p-4 font-bold text-gray-900 dark:text-white">Mike Ross</td>
                                <td class="p-4 text-gray-500">Driver (L3)</td>
                                <td class="p-4 text-center font-mono">42 Trips</td>
                                <td class="p-4 text-right font-mono">$2,100.00</td>
                                <td class="p-4 text-right text-green-600 font-mono">+$320.00</td>
                                <td class="p-4 text-right font-bold text-gray-900 dark:text-white">$2,420.00</td>
                                <td class="p-4"><span
                                        class="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-[10px] font-bold">PROCESSING</span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- 4. WORKFORCE & ROLES -->
            <div v-if="activeTab === 'workforce'" class="space-y-6 animate-fade-in">
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div
                        class="lg:col-span-1 p-6 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl shadow-sm">
                        <h3 class="font-bold text-gray-900 dark:text-white mb-4">Labour Allocation</h3>
                        <div class="h-74 relative flex justify-center">
                            <Doughnut :data="workforceData" :options="doughnutOptions" />
                        </div>
                    </div>

                    <!-- Vendor Performance -->
                    <div
                        class="lg:col-span-1 p-6 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl shadow-sm">
                        <h3 class="font-bold text-gray-900 dark:text-white mb-4">Vendor Performance & Lead Time</h3>
                        <div class="h-74 relative">
                            <Line :data="vendorLeadTimeData" :options="chartOptions" />
                        </div>
                    </div>

                    <!-- Safety Incident Trends (New to fill gap) -->
                    <div
                        class="lg:col-span-1 p-6 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl shadow-sm">
                        <h3 class="font-bold text-gray-900 dark:text-white mb-4">Safety Incident Alerts</h3>
                        <div class="h-74 relative">
                            <Bar :data="safetyIncidentData" :options="chartOptions" />
                        </div>
                    </div>
                </div>

                <!-- Warehouse Dwell Time -->
                <div
                    class="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl shadow-sm p-6 mb-6">
                    <h3 class="font-bold text-gray-900 dark:text-white mb-4">Warehouse Dwell Time Analytics
                        (Loading/Unloading)</h3>
                    <div class="h-74 relative">
                        <Bar :data="dwellTimeData" :options="chartOptions" />
                    </div>
                </div>

                <!-- Dynamic Roles Table -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div
                        class="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl shadow-sm overflow-hidden flex flex-col">
                        <div class="p-4 border-b border-gray-100 dark:border-white/10 flex justify-between">
                            <h3 class="font-bold text-gray-900 dark:text-white">Warehouse Staff & Dispatchers</h3>
                            <div class="flex gap-2">
                                <button class="text-xs bg-gray-100 dark:bg-white/10 px-2 py-1 rounded">Metrics</button>
                                <button class="text-xs bg-gray-100 dark:bg-white/10 px-2 py-1 rounded">Roster</button>
                            </div>
                        </div>
                        <table class="w-full text-left text-xs">
                            <thead
                                class="bg-gray-50 dark:bg-black/20 text-gray-500 dark:text-gray-400 font-bold uppercase">
                                <tr>
                                    <th class="p-3">Staff</th>
                                    <th class="p-3">Role</th>
                                    <th class="p-3">Shift Status</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-100 dark:divide-white/5">
                                <tr v-for="user in store.filteredUsers" :key="user.email"
                                    class="hover:bg-gray-50 dark:hover:bg-white/5">
                                    <td class="p-3 flex items-center gap-3">
                                        <img :src="user.avatar" class="w-8 h-8 rounded-full">
                                        <div>
                                            <p class="font-bold text-gray-900 dark:text-white">{{ user.name }}</p>
                                            <p class="text-[10px] text-gray-400">{{ user.email }}</p>
                                        </div>
                                    </td>
                                    <td class="p-3">
                                        <span
                                            class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100">{{
                                            user.role }}</span>
                                    </td>
                                    <td class="p-3 text-green-500 font-bold">{{ user.status }}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <!-- Staff Efficiency & Overtime (Filling the gap) -->
                    <div
                        class="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl shadow-sm overflow-hidden flex flex-col p-6">
                        <h3 class="font-bold text-gray-900 dark:text-white mb-4">Shift Efficiency & Overtime</h3>
                        <div class="h-64 relative">
                            <Bar :data="shiftEfficiencyData" :options="chartOptions" />
                        </div>
                    </div>
                </div>

                <!-- Driver Performance Scorecard -->
                <div
                    class="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl shadow-sm overflow-hidden">
                    <div class="p-4 border-b border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/5">
                        <h3 class="font-bold text-gray-900 dark:text-white">Driver Performance Scorecard</h3>
                    </div>
                    <table class="w-full text-left text-xs">
                        <thead class="bg-gray-50 dark:bg-black/20 text-gray-500 dark:text-gray-400 font-bold uppercase">
                            <tr>
                                <th class="p-3">Driver</th>
                                <th class="p-3 text-center">Rating</th>
                                <th class="p-3 text-center">Safety Incidents</th>
                                <th class="p-3 text-center">Fuel Eff.</th>
                                <th class="p-3 text-center">Avg Speed</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-100 dark:divide-white/5">
                            <tr v-for="d in store.filteredDrivers" :key="d.id"
                                class="hover:bg-gray-50 dark:hover:bg-white/5">
                                <td class="p-3 font-bold text-gray-900 dark:text-white">{{ d.name }}</td>
                                <td class="p-3 text-center">
                                    <div class="flex items-center justify-center gap-1 text-yellow-500">
                                        <span class="font-bold text-gray-900 dark:text-white">{{ d.rating }} -
                                            4.8</span> <!-- Mock rating if missing -->
                                        <span class="material-symbols-outlined text-[14px]">star</span>
                                    </div>
                                </td>
                                <td class="p-3 text-center font-bold"
                                    :class="d.status === 'breakdown' ? 'text-red-500' : 'text-gray-300'">{{ d.status ===
                                    'breakdown' ? 1 : 0 }}</td>
                                <td class="p-3 text-center font-mono text-green-600">92%</td>
                                <td class="p-3 text-center font-mono">65 km/h</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- 5. ASSETS & INVENTORY (Specific Items) -->
            <div v-if="activeTab === 'assets'" class="space-y-6 animate-fade-in">

                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <!-- Specific Counts for User Requests -->
                    <div
                        class="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-500/20">
                        <h4 class="text-xs uppercase font-bold text-blue-800 dark:text-blue-300">Total Boxes</h4>
                        <p class="text-2xl font-black text-gray-900 dark:text-white mt-1">{{ getInventoryCount(['Box',
                            'Packaging']) }}</p>
                    </div>
                    <div
                        class="p-4 bg-orange-50 dark:bg-orange-900/10 rounded-xl border border-orange-100 dark:border-orange-500/20">
                        <h4 class="text-xs uppercase font-bold text-orange-800 dark:text-orange-300">Crates & Cargo</h4>
                        <p class="text-2xl font-black text-gray-900 dark:text-white mt-1">{{
                            getInventoryCount(['Crates', 'Cargo']) }}</p>
                    </div>
                    <div
                        class="p-4 bg-purple-50 dark:bg-purple-900/10 rounded-xl border border-purple-100 dark:border-purple-500/20">
                        <h4 class="text-xs uppercase font-bold text-purple-800 dark:text-purple-300">Tape & Tools</h4>
                        <p class="text-2xl font-black text-gray-900 dark:text-white mt-1">{{ getInventoryCount(['Tape',
                            'Consumables']) }}</p>
                    </div>
                    <div
                        class="p-4 bg-teal-50 dark:bg-teal-900/10 rounded-xl border border-teal-100 dark:border-teal-500/20">
                        <h4 class="text-xs uppercase font-bold text-teal-800 dark:text-teal-300">Utensils</h4>
                        <p class="text-2xl font-black text-gray-900 dark:text-white mt-1">{{
                            getInventoryCount(['Utensils']) }}</p>
                    </div>
                </div>

                <!-- Returnable Equipment Audit -->
                <div
                    class="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl shadow-sm overflow-hidden mt-6 mb-6">
                    <div class="p-4 border-b border-gray-100 dark:border-white/10 bg-indigo-50 dark:bg-indigo-900/10">
                        <h3 class="font-bold text-indigo-900 dark:text-indigo-300">Returnable Equipment Audit
                            (Crates/Blankets)</h3>
                    </div>
                    <table class="w-full text-left text-xs">
                        <thead class="bg-gray-50 dark:bg-black/20 text-gray-500 dark:text-gray-400 font-bold uppercase">
                            <tr>
                                <th class="p-4">Customer Order</th>
                                <th class="p-4 text-center">Equipment Issued</th>
                                <th class="p-4 text-center">Returned</th>
                                <th class="p-4 text-center text-red-500">Missing/Damaged</th>
                                <th class="p-4 text-right">Penalty Cost</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-100 dark:divide-white/5">
                            <tr class="hover:bg-gray-50 dark:hover:bg-white/5">
                                <td class="p-4 font-bold text-gray-900 dark:text-white">ORD-4920</td>
                                <td class="p-4 text-center font-mono">50 Crates</td>
                                <td class="p-4 text-center font-mono">48</td>
                                <td class="p-4 text-center font-bold text-red-500">2</td>
                                <td class="p-4 text-right text-red-600 font-mono font-bold">-$40.00</td>
                            </tr>
                            <tr class="hover:bg-gray-50 dark:hover:bg-white/5">
                                <td class="p-4 font-bold text-gray-900 dark:text-white">ORD-4921</td>
                                <td class="p-4 text-center font-mono">12 Blankets</td>
                                <td class="p-4 text-center font-mono">12</td>
                                <td class="p-4 text-center font-bold text-gray-300">0</td>
                                <td class="p-4 text-right text-green-600 font-mono font-bold">$0.00</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <!-- MAIN INVENTORY TABLE -->
                    <div
                        class="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl shadow-sm p-6 overflow-hidden flex flex-col">
                        <div class="flex justify-between items-center mb-4">
                            <h3 class="font-bold text-gray-900 dark:text-white">Detailed Inventory Levels</h3>
                            <button @click="openRestockModal"
                                class="bg-primary/10 hover:bg-primary/20 text-primary px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1">
                                <span class="material-symbols-outlined text-[14px]">add_circle</span> Restock
                            </button>
                        </div>
                        <div class="flex-1 overflow-y-auto custom-scrollbar">
                            <table class="w-full text-left text-xs">
                                <thead>
                                    <tr class="text-gray-400 border-b border-gray-100 dark:border-white/5">
                                        <th class="pb-2">Item Name</th>
                                        <th class="pb-2">Category</th>
                                        <th class="pb-2 text-right">Capacity</th>
                                        <th class="pb-2 text-right">Stock Left</th>
                                        <th class="pb-2 text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-gray-100 dark:divide-white/5">
                                    <tr v-for="item in store.filteredInventory" :key="item.id">
                                        <td class="py-2 font-medium">{{ item.name }}</td>
                                        <td class="py-2 text-gray-500">{{ item.category }}</td>
                                        <td class="py-2 text-right font-mono">{{ Math.floor(item.quantity * 1.5) }} {{
                                            item.unit }}</td>
                                        <td class="py-2 text-right font-mono font-bold">{{ item.quantity }} {{ item.unit
                                            }}</td>
                                        <td class="py-2 text-right">
                                            <span class="px-2 py-0.5 rounded text-[10px]"
                                                :class="item.status === 'Good' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">{{
                                                item.status }}</span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- Damage Claims -->
                    <div
                        class="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl shadow-sm p-6 overflow-hidden flex flex-col">
                        <h3 class="font-bold text-gray-900 dark:text-white mb-4">Damage & Claims Queue</h3>
                        <div class="flex-1 overflow-y-auto custom-scrollbar space-y-3">
                            <div v-for="(claim, index) in damageClaims" :key="index" @click="openClaimModal(claim)"
                                class="p-3 border border-red-100 dark:border-red-500/20 bg-red-50 dark:bg-red-500/5 rounded-xl flex gap-3 cursor-pointer hover:bg-red-100 dark:hover:bg-red-500/10 transition-colors">
                                <div
                                    class="w-12 h-12 bg-gray-300 rounded-lg shrink-0 flex items-center justify-center font-bold text-gray-500 bg-gray-200 overflow-hidden">
                                    <img v-if="claim.image" :src="claim.image" class="w-full h-full object-cover">
                                    <span v-else>IMG</span>
                                </div>
                                <div class="flex-1">
                                    <h4 class="text-sm font-bold text-gray-900 dark:text-white">{{ claim.title }}</h4>
                                    <p class="text-xs text-gray-500">Reported by {{ claim.reporter }} • {{ claim.time }}
                                    </p>
                                    <div class="mt-2 text-red-500 text-xs font-bold"
                                        :class="{ 'text-green-500': claim.status === 'Resolved' }">{{ claim.status }}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Claims Action Modal -->
            <div v-if="claimsModalOpen && selectedClaim"
                class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
                <div
                    class="bg-white dark:bg-gray-900 w-full max-w-md rounded-2xl shadow-2xl p-6 border border-gray-100 dark:border-white/10 transform transition-all scale-100">
                    <div class="flex justify-between items-start mb-4">
                        <h3 class="text-lg font-bold text-gray-900 dark:text-white">Review Damage Claim</h3>
                        <button @click="claimsModalOpen = false"
                            class="text-gray-400 hover:text-gray-600 dark:hover:text-white">
                            <span class="material-symbols-outlined">close</span>
                        </button>
                    </div>

                    <div class="mb-4">
                        <img v-if="selectedClaim.image" :src="selectedClaim.image"
                            class="w-full h-48 object-cover rounded-xl bg-gray-100 mb-3">
                        <div v-else
                            class="w-full h-48 bg-gray-100 dark:bg-white/5 rounded-xl flex items-center justify-center text-gray-400 mb-3">
                            No Image Available</div>

                        <h4 class="font-bold text-gray-800 dark:text-gray-200">{{ selectedClaim.title }}</h4>
                        <p class="text-sm text-gray-500 mt-1">Reported by: <span
                                class="font-mono text-gray-700 dark:text-gray-300">{{ selectedClaim.reporter }}</span>
                        </p>
                        <p class="text-sm text-gray-500">Time: {{ selectedClaim.time }}</p>
                        <div
                            class="mt-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg text-xs leading-relaxed text-red-800 dark:text-red-200">
                            <strong>Description:</strong> {{ selectedClaim.description || 'Item was found damaged upon arrival at the loading bay. Packaging was torn.' }}
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-3 mt-6">
                        <button @click="resolveClaim('Approved')"
                            class="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-bold text-sm transition-colors">Approve
                            Replacement</button>
                        <button @click="resolveClaim('Rejected')"
                            class="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/20 text-gray-700 dark:text-gray-300 rounded-lg font-bold text-sm transition-colors">Reject
                            Claim</button>
                    </div>
                </div>
            </div>

            <!-- 6. RETURNS & REVERSE LOGISTICS -->
            <div v-if="activeTab === 'returns'" class="space-y-6 animate-fade-in">
                <div
                    class="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl shadow-sm overflow-hidden">
                    <div
                        class="p-4 border-b border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/5 flex gap-4 items-center">
                        <h3 class="font-bold text-gray-900 dark:text-white">RMA Returns Processing</h3>
                        <span class="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs font-bold">{{
                            store.filteredReturns.length }} Active</span>
                    </div>
                    <table class="w-full text-left text-xs">
                        <thead class="bg-gray-50 dark:bg-black/20 text-gray-500 dark:text-gray-400 font-bold uppercase">
                            <tr>
                                <th class="p-4">RMA ID</th>
                                <th class="p-4">Customer</th>
                                <th class="p-4">Order Ref</th>
                                <th class="p-4">Reason</th>
                                <th class="p-4">Condition</th>
                                <th class="p-4 text-center">Images</th>
                                <th class="p-4">Status</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-100 dark:divide-white/5">
                            <tr v-for="rma in store.filteredReturns" :key="rma.id"
                                class="hover:bg-gray-50 dark:hover:bg-white/5">
                                <td class="p-4 font-mono font-bold">{{ rma.id }}</td>
                                <td class="p-4">{{ rma.customer }}</td>
                                <td class="p-4 font-mono text-blue-600 font-bold cursor-pointer hover:underline">
                                    #ORD-9921</td>
                                <td class="p-4">{{ rma.reason }}</td>
                                <td class="p-4 whitespace-nowrap">
                                    <span class="px-2 py-1 rounded border"
                                        :class="rma.condition === 'Damaged' ? 'bg-red-50 border-red-200 text-red-600' : 'bg-green-50 border-green-200 text-green-600'">{{
                                        rma.condition }}</span>
                                </td>
                                <td class="p-4 text-center">
                                    <button v-if="rma.images.length"
                                        class="text-blue-500 hover:underline hover:text-blue-600">View {{
                                        rma.images.length }}</button>
                                    <span v-else class="text-gray-400">-</span>
                                </td>
                                <td class="p-4">
                                    <span class="font-bold"
                                        :class="{ 'Pending': 'text-yellow-500', 'Approved': 'text-green-500' }[rma.status]">{{
                                        rma.status }}</span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- RMA vs Order Analytics -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                    <div
                        class="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl shadow-sm p-6">
                        <h3 class="font-bold text-gray-900 dark:text-white mb-4">RMA Rate vs Total Orders</h3>
                        <div class="h-74 relative">
                            <Line :data="rmaVsOrdersData" :options="chartOptions" />
                        </div>
                    </div>
                    <div
                        class="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl shadow-sm p-6">
                        <h3 class="font-bold text-gray-900 dark:text-white mb-4">Reason for Return (Pareto)</h3>
                        <div class="h-74 relative">
                            <Bar :data="rmaReasonsData" :options="chartOptions" />
                        </div>
                    </div>
                </div>
            </div>

            <!-- Restock Modal -->
            <div v-if="restockModalOpen"
                class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
                <div
                    class="bg-white dark:bg-gray-900 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-gray-100 dark:border-white/10 flex flex-col max-h-[90vh]">
                    <div
                        class="p-4 border-b border-gray-100 dark:border-white/10 flex justify-between items-center bg-gray-50 dark:bg-white/5">
                        <h3 class="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <span class="material-symbols-outlined text-green-600">inventory</span> Inbound Restock
                            Manifest
                        </h3>
                        <button @click="restockModalOpen = false"
                            class="text-gray-400 hover:text-gray-600 dark:hover:text-white">
                            <span class="material-symbols-outlined">close</span>
                        </button>
                    </div>

                    <div class="p-6 overflow-y-auto custom-scrollbar">
                        <p class="text-sm text-gray-500 mb-4">Enter the quantity of new stock arriving today. Previous
                            stock levels are shown for reference.</p>

                        <div class="space-y-3">
                            <div v-for="item in restockItems" :key="item.id"
                                class="flex items-center gap-4 p-3 border border-gray-200 dark:border-white/10 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                <div
                                    class="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0">
                                    {{ item.category.substring(0, 2).toUpperCase() }}
                                </div>
                                <div class="flex-1">
                                    <h4 class="font-bold text-sm text-gray-900 dark:text-white">{{ item.name }}</h4>
                                    <p class="text-xs text-gray-500">
                                        Ref Capacity: <span class="font-mono text-gray-400 mr-2">{{
                                            Math.floor(item.quantity * 1.5) }} {{ item.unit }}</span>
                                        Stock Left: <span class="font-mono font-bold">{{ item.quantity }} {{ item.unit
                                            }}</span>
                                    </p>
                                </div>
                                <div class="w-32">
                                    <label class="text-[10px] uppercase font-bold text-gray-400 mb-1 block">Add
                                        Qty</label>
                                    <input type="number" v-model.number="item.incomingQty" min="0"
                                        class="w-full bg-gray-100 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded px-2 py-1 text-sm font-mono focus:ring-2 focus:ring-primary/50 outline-none">
                                </div>
                            </div>
                        </div>
                    </div>

                    <div
                        class="p-4 border-t border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/5 flex justify-end gap-3">
                        <button @click="restockModalOpen = false"
                            class="px-4 py-2 text-gray-500 hover:text-gray-700 font-bold text-sm">Cancel</button>
                        <button @click="confirmRestock"
                            class="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-bold text-sm shadow-lg shadow-green-500/30 transition-all flex items-center gap-2">
                            <span class="material-symbols-outlined text-[18px]">verified</span> Confirm Inbound
                        </button>
                    </div>
                </div>
            </div>

            <!-- 8. SECURITY & AUDIT LOGS (New) -->
            <div v-if="activeTab === 'security_audit'" class="space-y-6 animate-fade-in">
                <div
                    class="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl shadow-sm overflow-hidden">
                    <div
                        class="p-4 border-b border-gray-100 dark:border-white/10 bg-gray-900 text-white flex justify-between items-center">
                        <h3 class="font-bold flex items-center gap-2">
                            <span class="material-symbols-outlined text-green-400">gpp_good</span> Immutable System
                            Audit Ledger
                        </h3>
                        <span class="text-xs text-gray-400 font-mono">Last Sync: Live</span>
                    </div>
                    <table class="w-full text-left text-xs">
                        <thead
                            class="bg-gray-100 dark:bg-black/40 text-gray-500 dark:text-gray-400 font-bold uppercase">
                            <tr>
                                <th class="p-4">Timestamp</th>
                                <th class="p-4">Admin User</th>
                                <th class="p-4">Action Type</th>
                                <th class="p-4">Target Entity</th>
                                <th class="p-4">Details</th>
                                <th class="p-4 text-right">IP Address</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-100 dark:divide-white/5 font-mono">
                            <tr class="hover:bg-gray-50 dark:hover:bg-white/5">
                                <td class="p-4 text-gray-400">Feb 24, 10:42:12 AM</td>
                                <td class="p-4 font-bold text-blue-600">finance_lead_john</td>
                                <td class="p-4"><span
                                        class="text-yellow-600 bg-yellow-100 px-2 py-0.5 rounded font-bold">UPDATE_PAY_RATE</span>
                                </td>
                                <td class="p-4">Driver: Mike Ross</td>
                                <td class="p-4 text-gray-600 font-sans text-sm">Changed base rate from $22/hr to $24/hr
                                    (Compliance review)</td>
                                <td class="p-4 text-right text-gray-400">192.168.1.45</td>
                            </tr>
                            <tr class="hover:bg-gray-50 dark:hover:bg-white/5">
                                <td class="p-4 text-gray-400">Feb 24, 09:15:00 AM</td>
                                <td class="p-4 font-bold text-blue-600">risk_admin_sarah</td>
                                <td class="p-4"><span
                                        class="text-red-600 bg-red-100 px-2 py-0.5 rounded font-bold">DELETE_ORDER</span>
                                </td>
                                <td class="p-4">Order #99212</td>
                                <td class="p-4 text-gray-600 font-sans text-sm">Deleted flagged order (Fraud suspicion)
                                </td>
                                <td class="p-4 text-right text-gray-400">10.0.0.12</td>
                            </tr>
                            <tr class="hover:bg-gray-50 dark:hover:bg-white/5">
                                <td class="p-4 text-gray-400">Feb 23, 11:05:44 PM</td>
                                <td class="p-4 font-bold text-blue-600">dispatch_manager_alex</td>
                                <td class="p-4"><span
                                        class="text-blue-600 bg-blue-100 px-2 py-0.5 rounded font-bold">REASSIGN_DRIVER</span>
                                </td>
                                <td class="p-4">Route: South-East 14</td>
                                <td class="p-4 text-gray-600 font-sans text-sm">Reassigned from Alex Morgan to David
                                    Chen (Dispute resolution)</td>
                                <td class="p-4 text-right text-gray-400">10.0.0.18</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- 7. REPORT HISTORY & ANALYTICS -->
            <div v-if="activeTab === 'reports_history'" class="space-y-6 animate-fade-in">
                <!-- Analytics Charts -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div
                        class="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl p-6 shadow-sm">
                        <h3 class="font-bold text-gray-900 dark:text-white mb-4">SLA Compliance Trends</h3>
                        <div class="h-74 relative w-full">
                            <Line :data="analyticsSLAData" :options="chartOptions" />
                        </div>
                    </div>
                    <div
                        class="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl p-6 shadow-sm">
                        <h3 class="font-bold text-gray-900 dark:text-white mb-4">Hub Efficiency Leaderboard</h3>
                        <div class="h-74 relative">
                            <Bar :data="analyticsHubData" :options="chartOptions" />
                        </div>
                    </div>
                </div>

                <!-- Reports List -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div v-for="report in store.filteredReports" :key="report.id"
                        class="p-4 bg-white hover:bg-gray-50 dark:bg-white/5 dark:hover:bg-white/10 rounded-xl border border-gray-200 dark:border-white/5 hover:border-primary/50 dark:hover:border-primary/30 cursor-pointer transition-all group flex items-start gap-4 shadow-sm">
                        <div class="p-2.5 rounded-lg shadow-sm"
                            :class="`bg-${report.color}-50 text-${report.color}-600 dark:bg-${report.color}-500/10 dark:text-${report.color}-400`">
                            <span class="material-symbols-outlined">{{ report.icon }}</span>
                        </div>
                        <div>
                            <div
                                class="font-bold text-gray-900 dark:text-white text-sm group-hover:text-primary transition-colors leading-tight mb-1">
                                {{ report.title }}
                            </div>
                            <div class="text-xs text-gray-500 dark:text-gray-400">Date: {{ report.date }} • {{
                                activeWarehouseName }}</div>
                            <button @click.stop="downloadReport(report.id)"
                                class="mt-2 text-[10px] font-bold text-primary flex items-center gap-1 hover:underline">
                                <span class="material-symbols-outlined text-[12px]">download</span> Download PDF
                            </button>
                        </div>
                    </div>
                    <!-- Previous Report Placeholder -->
                    <button
                        class="p-4 border-2 border-dashed border-gray-200 dark:border-white/10 rounded-xl flex items-center justify-center text-gray-400 hover:text-primary hover:border-primary/50 transition-colors gap-2">
                        <span class="material-symbols-outlined">history</span> Load Archived Reports
                    </button>
                </div>
            </div>

        </div>

        <!-- Notification Toast -->
        <div v-if="notification" class="fixed bottom-6 right-6 z-50 animate-fade-in-up transition-all cursor-pointer"
            @click="notification = null">
            <div class="px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 border backdrop-blur-md"
                :class="notification.type === 'success' ? 'bg-green-50/90 dark:bg-green-900/90 border-green-200 dark:border-green-700 text-green-800 dark:text-green-100' : 'bg-blue-50/90 dark:bg-blue-900/90 border-blue-200 dark:border-blue-700 text-blue-800 dark:text-blue-100'">
                <span class="material-symbols-outlined text-2xl">{{ notification.type === 'success' ? 'check_circle' :
                    'info' }}</span>
                <div>
                    <h4 class="font-bold text-sm uppercase tracking-wide opacity-80 mb-0.5">{{ notification.type }}</h4>
                    <span class="font-bold text-sm block leading-tight">{{ notification.msg }}</span>
                </div>
            </div>
        </div>

    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useLogisticStore } from '@/stores/logisticStore'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js'
import { Line, Bar, Doughnut } from 'vue-chartjs'

// Register ChartJS Components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend)

const store = useLogisticStore()

// State
const activeTab = ref('control_tower')
const timeRange = ref('today')
const aiQuery = ref('')

// Tabs Structure
const tabs = [
    { id: 'control_tower', label: 'Control Tower', icon: 'cell_tower' },
    { id: 'financials', label: 'Finances', icon: 'account_balance' },
    { id: 'attendance', label: 'Attendance', icon: 'calendar_month' },
    { id: 'workforce', label: 'Workforce', icon: 'groups' },
    { id: 'assets', label: 'Inventory (Boxes/Tools)', icon: 'inventory_2' },
    { id: 'returns', label: 'Returns (RMA)', icon: 'assignment_return' },
    { id: 'security_audit', label: 'System Logs', icon: 'security' },
    { id: 'reports_history', label: 'Analytics & History', icon: 'history' }
]

// --- Helper Functions ---
const getInventoryCount = (keywords) => {
    return store.filteredInventory
        .filter(i => keywords.some(k => i.name.includes(k) || i.category.includes(k)))
        .reduce((sum, item) => sum + item.quantity, 0)
}

// --- Interaction Handlers ---
const isDownloading = ref(false)
const aiThinking = ref(false)
const notification = ref(null)

const showNotification = (msg, type = 'success') => {
    notification.value = { msg, type }
    setTimeout(() => notification.value = null, 3000)
}

const downloadReport = (id) => {
    isDownloading.value = true
    showNotification(`Preparing Report #${id}...`, 'info')
    setTimeout(() => {
        isDownloading.value = false
        showNotification(`Report #${id} Downloaded Successfully`, 'success')
    }, 1500)
}

const downloadCurrentView = () => {
    isDownloading.value = true
    showNotification(`Exporting "${tabs.find(t => t.id === activeTab.value)?.label}" View...`, 'info')
    setTimeout(() => {
        isDownloading.value = false
        showNotification('PDF Export Completed', 'success')
    }, 2000)
}

const handleAiQuery = () => {
    if (!aiQuery.value) return
    aiThinking.value = true

    // Simulate API delay
    setTimeout(() => {
        aiThinking.value = false
        const responses = [
            `Analysis for "${aiQuery.value}": Top spending vendor is Amazon Logistics ($15,200).`,
            `Insight: "${aiQuery.value}" correlates with a 5% increase in fuel efficiency when using optimized routes.`,
            `Report: "${aiQuery.value}" shows 3 drivers are exceeding speed limits in Zone B.`
        ]
        const randomResponse = responses[Math.floor(Math.random() * responses.length)]

        // Add to insights list
        aiInsights.value.unshift(randomResponse)
        aiQuery.value = ''
        showNotification('AI Analysis Added to Briefing', 'success')
    }, 1500)
}

// --- Mock Data Generators based on Store & Requirements ---

// 1. Control Tower Data
const totalOrders = computed(() => store.dashboardStats.ordersToday || 150)
const completedOrders = computed(() => Math.floor(totalOrders.value * (store.dashboardStats.deliverySuccess / 100)))
const completionRate = computed(() => Math.round((completedOrders.value / totalOrders.value) * 100))

// Sync alerts from store instead of hardcoded
const crisisAlerts = computed(() => (store.alerts || []).map(a => ({
    ...a,
    desc: a.description // Map for template compatibility
})))

const aiInsights = ref([
    'Operational Health is at 98%. Excellent performance.',
    '1 Delay detected in Hub A due to traffic.',
    '3 Vehicles (V-102, V-404) are due for preventative maintenance next week.',
    'Driver Sarah reported consistent 15% fuel savings on Route 9.'
])

// --- Mock Data Generators (Reactive) ---
const seed = computed(() => store.activeWarehouse === 'all' ? 0 : store.activeWarehouse)

// Helper to simulate dynamic data based on warehouse selection AND Time Range
const getDynamicData = (baseData, variance = 10) => {
    let multiplier = 1
    if (timeRange.value === '7d') multiplier = 6.5
    if (timeRange.value === '30d') multiplier = 28
    if (timeRange.value === 'ytd') multiplier = 120

    return baseData.map(v => {
        let val = Math.max(0, v * multiplier + (Math.random() * variance * multiplier * 0.2 - variance))
        return Math.floor(val) // Convert to integer for clean charts
    })
}

// 2. Financial Data
const revenueStreamData = computed(() => ({
    labels: ['Standard Delivery', 'Personal Moves'],
    datasets: [{
        backgroundColor: ['#3b82f6', '#8b5cf6'],
        data: store.activeWarehouse === 'all' ? [65, 35] : [55 + (seed.value * 5), 45 - (seed.value * 5)]
    }]
}))

const paymentReconData = computed(() => ({
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    datasets: [
        { label: 'Expected (Digital)', backgroundColor: '#34d399', data: getDynamicData([4000, 3000, 5000, 4500, 6000], 500) },
        { label: 'Actual (Digital)', backgroundColor: '#059669', data: getDynamicData([3950, 2900, 4900, 4400, 5900], 400) },
        { label: 'Expected (COD)', backgroundColor: '#fbbf24', data: getDynamicData([2000, 1500, 2200, 1800, 2500], 200) },
        { label: 'Actual (COD)', backgroundColor: '#d97706', data: getDynamicData([1800, 1400, 2100, 1600, 2400], 150) }
    ]
}))

const fuelAuditData = computed(() => ({
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
        { label: 'Fuel Expense ($)', borderColor: '#ef4444', data: getDynamicData([1200, 1350, 1100, 1400], 100), tension: 0.4 },
        { label: 'GPS Mileage (km/10)', borderColor: '#3b82f6', data: getDynamicData([1150, 1200, 1080, 1380], 100), tension: 0.4, borderDash: [5, 5] }
    ]
}))

// Damage Claims Logic
const claimsModalOpen = ref(false)
const selectedClaim = ref(null)

const damageClaims = ref([
    { title: 'Broken Crate #C-99', reporter: 'Driver Mike', time: '2h ago', status: 'Pending Review', image: 'https://placehold.co/100x100?text=Damaged' },
    { title: 'Dented Package #P-22', reporter: 'Loader Sarah', time: '3h ago', status: 'Pending Review', image: 'https://placehold.co/100x100?text=Scan' },
    { title: 'Missing Label #L-44', reporter: 'Sorter Tom', time: '5h ago', status: 'Pending Review', image: '' },
])

const openClaimModal = (claim) => {
    selectedClaim.value = claim
    claimsModalOpen.value = true
}

const resolveClaim = (decision) => {
    if (!selectedClaim.value) return
    showNotification(`Claim resolved: ${decision}. Notification sent to reporter.`, 'success')
    selectedClaim.value.status = 'Resolved'
    claimsModalOpen.value = false
    selectedClaim.value = null
}

// Restock Logic
const restockModalOpen = ref(false)
const restockItems = ref([])

const openRestockModal = () => {
    // Populate with current inventory
    restockItems.value = store.filteredInventory.map(i => ({
        ...i,
        incomingQty: 0
    }))
    restockModalOpen.value = true
}

const confirmRestock = () => {
    const totalAdded = restockItems.value.reduce((sum, item) => sum + item.incomingQty, 0)

    if (totalAdded > 0) {
        // In a real app, dispatch an action to update store
        // store.updateInventory(restockItems.value)
        showNotification(`Inventory Updated: +${totalAdded} items added to stock successfully.`, 'success')
    } else {
        showNotification('No items were added.', 'info')
    }

    restockModalOpen.value = false
}

// 4. Workforce Data
const workforceData = computed(() => ({
    labels: ['In-Warehouse', 'On-Field', 'Off-Duty'],
    datasets: [{
        backgroundColor: ['#f59e0b', '#10b981', '#9ca3af'],
        data: store.activeWarehouse === 'all' ? [20, 45, 35] : [15 + seed.value, 50 - seed.value, 35]
    }]
}))

const vendorLeadTimeData = computed(() => ({
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
        {
            label: 'Avg Lead Time (Days)',
            borderColor: '#8b5cf6',
            backgroundColor: 'rgba(139, 92, 246, 0.1)',
            data: getDynamicData([5, 4.5, 6, 4, 3.8, 4.2], 1),
            fill: true,
            tension: 0.4
        }
    ]
}))

const safetyIncidentData = computed(() => ({
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
        {
            label: 'Safety Incidents',
            backgroundColor: '#ef4444',
            data: getDynamicData([2, 5, 1, 3, 0, 1], 1),
            borderRadius: 4
        }
    ]
}))

const shiftEfficiencyData = computed(() => ({
    labels: ['Shift A', 'Shift B', 'Shift C'],
    datasets: [
        { label: 'Avg Efficiency (%)', backgroundColor: '#10b981', data: getDynamicData([92, 88, 95], 5) },
        { label: 'Overtime Hours', backgroundColor: '#f59e0b', data: getDynamicData([12, 18, 5], 3) }
    ]
}))

const dwellTimeData = computed(() => ({
    labels: ['6am-9am', '9am-12pm', '12pm-3pm', '3pm-6pm', '6pm-9pm'],
    datasets: [
        { label: 'Avg Dwell Time (Minutes)', backgroundColor: '#f97316', data: getDynamicData([15, 45, 25, 60, 20], 10) }
    ]
}))

const rmaVsOrdersData = computed(() => ({
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
        { label: 'Total Orders', borderColor: '#3b82f6', data: getDynamicData([120, 150, 140, 160], 20), yAxisID: 'y' },
        { label: 'RMA Cases', borderColor: '#ef4444', data: getDynamicData([2, 5, 3, 4], 2), yAxisID: 'y1', borderDash: [5, 5] }
    ]
}))

const rmaReasonsData = computed(() => ({
    labels: ['Damaged', 'Wrong Item', 'Late Delivery', 'Changed Mind'],
    datasets: [{
        label: 'Issues Count',
        backgroundColor: ['#ef4444', '#f59e0b', '#3b82f6', '#9ca3af'],
        data: getDynamicData([12, 5, 3, 8], 3)
    }]
}))

// 6. Detailed Analytics (New)
const analyticsSLAData = computed(() => ({
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
        label: 'SLA Compliance (%)',
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        data: store.dashboardStats?.slaCompliance?.week || [92, 94, 88, 95, 90, 96, 98],
        fill: true,
        tension: 0.4
    }, {
        label: 'Target SLA',
        borderColor: '#ef4444',
        borderDash: [5, 5],
        data: [95, 95, 95, 95, 95, 95, 95],
        pointRadius: 0
    }]
}))

const analyticsHubData = computed(() => ({
    labels: store.hubs ? store.hubs.map(h => h.name) : ['North', 'South', 'West'],
    datasets: [{
        label: 'Hub Efficiency (%)',
        backgroundColor: store.hubs ? store.hubs.map(h => h.efficiency > 90 ? '#10b981' : h.efficiency > 80 ? '#f59e0b' : '#ef4444') : ['#10b981'],
        data: store.hubs ? store.hubs.map(h => h.efficiency) : [88, 92, 75]
    }]
}))

// --- Chart Options with Animations ---
const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
        duration: 2000,
        easing: 'easeOutQuart',
        delay: (context) => context.dataIndex * 100
    },
    plugins: {
        legend: { position: 'bottom', labels: { usePointStyle: true } }
    },
    scales: {
        y: { beginAtZero: true, grid: { color: 'rgba(200, 200, 200, 0.1)' } },
        x: { grid: { display: false } }
    }
}

const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
        animateScale: true,
        animateRotate: true,
        duration: 2000,
        easing: 'easeOutBounce'
    },
    plugins: {
        legend: { position: 'right' }
    }
}
</script>

<style scoped>
.glass-panel {
    @apply bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 shadow-sm backdrop-blur-xl;
}

/* Custom Scrollbar for inner containers */
.custom-scrollbar::-webkit-scrollbar {
    width: 4px;
}

.custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: rgba(156, 163, 175, 0.5);
    border-radius: 20px;
}
</style>
