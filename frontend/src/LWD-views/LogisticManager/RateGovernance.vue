<template>
    <div class="space-y-6">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Rate & Pricing Governance</h2>
                <p class="text-sm text-gray-500 mt-1">Central Authority for System-Wide Monetary Configuration</p>
            </div>

            <div class="flex items-center gap-4">
                <button v-if="!isEditMode" @click="isEditMode = true"
                    class="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium py-2 px-4 rounded-lg flex items-center gap-2 transition-colors shadow-sm text-sm">
                    <span class="material-symbols-outlined text-[18px]">lock_open</span>
                    Unlock Edit Mode
                </button>

                <button v-else @click="saveAndLock"
                    class="bg-primary hover:bg-primary/90 text-white font-medium py-2 px-4 rounded-lg flex items-center gap-2 transition-colors shadow-sm text-sm">
                    <span class="material-symbols-outlined text-[18px]">cloud_upload</span>
                    Deploy & Lock Rates
                </button>
            </div>
        </div>

        <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <!-- Left Column: Revenue & Customers -->
            <div class="xl:col-span-2 flex flex-col gap-6">
                <!-- 1. Customer Charges (Revenue Side) -->
                <div class="glass-panel rounded-xl overflow-hidden">
                    <div
                        class="p-4 border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-black/20 flex items-center gap-3">
                        <div
                            class="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 flex items-center justify-center">
                            <span class="material-symbols-outlined text-[20px]">account_balance_wallet</span>
                        </div>
                        <h3 class="font-bold text-gray-900 dark:text-white text-lg">Customer Charges <span
                                class="text-xs font-normal text-gray-500 ml-2">(Revenue Basis)</span></h3>
                    </div>

                    <div class="p-6 space-y-8">
                        <!-- A. Base Transport -->
                        <div>
                            <h4
                                class="text-sm font-bold text-gray-700 dark:text-gray-300 mb-4 border-b border-gray-100 dark:border-white/5 pb-2">
                                A. Base Transport Rate (per Vendor/Individual)</h4>
                            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Base Fee
                                        (₹)</label>
                                    <input type="number" :disabled="!isEditMode" v-model.number="rates.baseBookingFee"
                                        class="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg p-2.5 text-sm font-mono focus:ring-2 focus:ring-primary/20 outline-none">
                                </div>
                                <div>
                                    <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Rate / KM
                                        (₹)</label>
                                    <input type="number" :disabled="!isEditMode" v-model.number="rates.perKmRate"
                                        class="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg p-2.5 text-sm font-mono focus:ring-2 focus:ring-primary/20 outline-none">
                                </div>
                                <div>
                                    <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Minimum
                                        (₹)</label>
                                    <input type="number" :disabled="!isEditMode" v-model.number="rates.minimumCharge"
                                        class="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg p-2.5 text-sm font-mono focus:ring-2 focus:ring-primary/20 outline-none">
                                </div>
                                <div>
                                    <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Express Mul
                                        (x)</label>
                                    <input type="number" :disabled="!isEditMode" step="0.1"
                                        v-model.number="rates.expressMultiplier"
                                        class="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg p-2.5 text-sm font-mono focus:ring-2 focus:ring-primary/20 outline-none">
                                </div>
                            </div>
                        </div>

                        <!-- B. Labor & Packing -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h4
                                    class="text-sm font-bold text-gray-700 dark:text-gray-300 mb-4 border-b border-gray-100 dark:border-white/5 pb-2">
                                    B. Customer Labor Add-on</h4>
                                <div
                                    class="bg-blue-50/50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-800/20">
                                    <label
                                        class="block text-xs font-bold text-blue-700 dark:text-blue-400 uppercase mb-2">Charge
                                        per Labor / Hour (₹)</label>
                                    <input type="number" :disabled="!isEditMode"
                                        v-model.number="rates.customerLaborRate"
                                        class="w-full bg-white dark:bg-black/40 border border-blue-200 dark:border-blue-800/30 rounded-lg p-3 text-sm font-mono font-bold text-blue-900 dark:text-blue-100 focus:ring-2 focus:ring-blue-500/20 outline-none">
                                    <p class="text-[10px] text-blue-600 dark:text-blue-400 mt-2 opacity-80">Used in
                                        instant quotes and invoice generation.</p>
                                </div>
                            </div>
                            <div>
                                <h4
                                    class="text-sm font-bold text-gray-700 dark:text-gray-300 mb-4 border-b border-gray-100 dark:border-white/5 pb-2">
                                    C. Packing Materials</h4>
                                <div class="space-y-3">
                                    <div class="flex items-center gap-3">
                                        <span class="text-sm text-gray-600 dark:text-gray-400 w-24">Box</span>
                                        <span class="text-sm font-mono text-gray-400">₹</span>
                                        <input type="number" :disabled="!isEditMode"
                                            v-model.number="rates.materials.box"
                                            class="flex-1 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg p-2 text-sm font-mono focus:ring-2 focus:ring-primary/20 outline-none">
                                    </div>
                                    <div class="flex items-center gap-3">
                                        <span class="text-sm text-gray-600 dark:text-gray-400 w-24">Bubble Wrap</span>
                                        <span class="text-sm font-mono text-gray-400">₹</span>
                                        <input type="number" :disabled="!isEditMode"
                                            v-model.number="rates.materials.bubbleWrap"
                                            class="flex-1 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg p-2 text-sm font-mono focus:ring-2 focus:ring-primary/20 outline-none">
                                        <span class="text-xs text-gray-400 w-12">/ m</span>
                                    </div>
                                    <div class="flex items-center gap-3">
                                        <span class="text-sm text-gray-600 dark:text-gray-400 w-24">Crate Rental</span>
                                        <span class="text-sm font-mono text-gray-400">₹</span>
                                        <input type="number" :disabled="!isEditMode"
                                            v-model.number="rates.materials.crate"
                                            class="flex-1 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg p-2 text-sm font-mono focus:ring-2 focus:ring-primary/20 outline-none">
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 2. Payroll Rates (Cost Side) -->
                <div class="glass-panel rounded-xl overflow-hidden">
                    <div
                        class="p-4 border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-black/20 flex items-center gap-3">
                        <div
                            class="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 flex items-center justify-center">
                            <span class="material-symbols-outlined text-[20px]">payments</span>
                        </div>
                        <h3 class="font-bold text-gray-900 dark:text-white text-lg">Payroll Control <span
                                class="text-xs font-normal text-gray-500 ml-2">(Cost Basis)</span></h3>
                    </div>

                    <div class="p-6 space-y-8">
                        <!-- Driver Pay -->
                        <div>
                            <h4
                                class="text-sm font-bold text-gray-700 dark:text-gray-300 mb-4 border-b border-gray-100 dark:border-white/5 pb-2">
                                A. Driver Compensation</h4>
                            <div class="space-y-4">
                                <div class="flex flex-col gap-1">
                                    <label class="text-xs font-bold text-gray-500 uppercase">Payout Structure</label>
                                    <select :disabled="!isEditMode" v-model="rates.driver.type"
                                        class="w-full lg:w-1/2 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none">
                                        <option value="per_km">Per KM Model</option>
                                        <option value="per_delivery">Per Delivery Target</option>
                                        <option value="salary_bonus">Fixed Salary (Base + HRA/DA + Bonus)</option>
                                    </select>
                                </div>

                                <div class="grid grid-cols-2 lg:grid-cols-4 gap-4"
                                    v-if="rates.driver.type === 'salary_bonus'">
                                    <div>
                                        <label class="block text-xs text-gray-500 mb-1">Base Salary (₹)</label>
                                        <input type="number" :disabled="!isEditMode"
                                            v-model.number="rates.driver.baseSalary"
                                            class="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg p-2 text-sm font-mono outline-none">
                                    </div>
                                    <div>
                                        <label class="block text-xs text-gray-500 mb-1">HRA (₹)</label>
                                        <input type="number" :disabled="!isEditMode" v-model.number="rates.driver.hra"
                                            class="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg p-2 text-sm font-mono outline-none">
                                    </div>
                                    <div>
                                        <label class="block text-xs text-gray-500 mb-1">DA (₹)</label>
                                        <input type="number" :disabled="!isEditMode" v-model.number="rates.driver.da"
                                            class="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg p-2 text-sm font-mono outline-none">
                                    </div>
                                    <div>
                                        <label class="block text-xs text-gray-500 mb-1">Perf. Bonus (₹)</label>
                                        <input type="number" :disabled="!isEditMode"
                                            v-model.number="rates.driver.performanceBonus"
                                            class="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg p-2 text-sm font-mono outline-none">
                                    </div>
                                </div>
                                <div class="grid grid-cols-2 gap-4" v-if="rates.driver.type === 'per_km'">
                                    <div>
                                        <label class="block text-xs text-gray-500 mb-1">Rate (₹ / KM)</label>
                                        <input type="number" :disabled="!isEditMode"
                                            v-model.number="rates.driver.kmRate"
                                            class="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg p-2.5 text-sm font-mono outline-none">
                                    </div>
                                    <div>
                                        <label class="block text-xs text-gray-500 mb-1">Fuel Incentive (₹ / Day)</label>
                                        <input type="number" :disabled="!isEditMode"
                                            v-model.number="rates.driver.fuelIncentive"
                                            class="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg p-2.5 text-sm font-mono outline-none">
                                    </div>
                                </div>
                                <div class="grid grid-cols-2 gap-4" v-if="rates.driver.type === 'per_delivery'">
                                    <div>
                                        <label class="block text-xs text-gray-500 mb-1">Base Drop Rate (₹)</label>
                                        <input type="number" :disabled="!isEditMode"
                                            v-model.number="rates.driver.deliveryBaseRate"
                                            class="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg p-2.5 text-sm font-mono outline-none">
                                    </div>
                                    <div>
                                        <label class="block text-xs text-gray-500 mb-1">Heavy Item Bonus (₹)</label>
                                        <input type="number" :disabled="!isEditMode"
                                            v-model.number="rates.driver.heavyItemBonus"
                                            class="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg p-2.5 text-sm font-mono outline-none">
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Labor Pay -->
                        <div>
                            <h4
                                class="text-sm font-bold text-gray-700 dark:text-gray-300 mb-4 border-b border-gray-100 dark:border-white/5 pb-2">
                                B. Labor / Mover Wage</h4>
                            <div class="space-y-4">
                                <div class="flex flex-col gap-1">
                                    <label class="text-xs font-bold text-gray-500 uppercase">Payout Structure</label>
                                    <select :disabled="!isEditMode" v-model="rates.labor.type"
                                        class="w-full lg:w-1/2 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none">
                                        <option value="hourly">Hourly Contract</option>
                                        <option value="salary_bonus">Fixed Salary (Base + HRA/DA + Bonus)</option>
                                    </select>
                                </div>
                                <div class="grid grid-cols-2 lg:grid-cols-4 gap-4"
                                    v-if="rates.labor.type === 'salary_bonus'">
                                    <div>
                                        <label class="block text-xs text-gray-500 mb-1">Base Salary (₹)</label>
                                        <input type="number" :disabled="!isEditMode"
                                            v-model.number="rates.labor.baseSalary"
                                            class="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg p-2 text-sm font-mono outline-none">
                                    </div>
                                    <div>
                                        <label class="block text-xs text-gray-500 mb-1">HRA (₹)</label>
                                        <input type="number" :disabled="!isEditMode" v-model.number="rates.labor.hra"
                                            class="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg p-2 text-sm font-mono outline-none">
                                    </div>
                                    <div>
                                        <label class="block text-xs text-gray-500 mb-1">DA (₹)</label>
                                        <input type="number" :disabled="!isEditMode" v-model.number="rates.labor.da"
                                            class="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg p-2 text-sm font-mono outline-none">
                                    </div>
                                    <div>
                                        <label class="block text-xs text-gray-500 mb-1">Bonus (₹)</label>
                                        <input type="number" :disabled="!isEditMode"
                                            v-model.number="rates.labor.performanceBonus"
                                            class="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg p-2 text-sm font-mono outline-none">
                                    </div>
                                </div>
                                <div class="grid grid-cols-2 lg:grid-cols-3 gap-4" v-if="rates.labor.type === 'hourly'">
                                    <div
                                        class="bg-gray-50 dark:bg-white/5 p-3 rounded-xl border border-gray-100 dark:border-white/5">
                                        <label class="block text-[10px] text-gray-500 uppercase mb-1">Hourly Wage
                                            (₹)</label>
                                        <input type="number" :disabled="!isEditMode"
                                            v-model.number="rates.labor.hourlyWage"
                                            class="w-full bg-transparent border-b border-gray-200 dark:border-white/10 py-1 text-sm font-mono outline-none">
                                    </div>
                                    <div
                                        class="bg-gray-50 dark:bg-white/5 p-3 rounded-xl border border-gray-100 dark:border-white/5">
                                        <label class="block text-[10px] text-gray-500 uppercase mb-1">Overtime
                                            (x)</label>
                                        <input type="number" :disabled="!isEditMode" step="0.1"
                                            v-model.number="rates.labor.overtimeMul"
                                            class="w-full bg-transparent border-b border-gray-200 dark:border-white/10 py-1 text-sm font-mono outline-none">
                                    </div>
                                    <div
                                        class="bg-gray-50 dark:bg-white/5 p-3 rounded-xl border border-gray-100 dark:border-white/5">
                                        <label class="block text-[10px] text-gray-500 uppercase mb-1">Field Allow.
                                            (₹)</label>
                                        <input type="number" :disabled="!isEditMode"
                                            v-model.number="rates.labor.fieldAllowance"
                                            class="w-full bg-transparent border-b border-gray-200 dark:border-white/10 py-1 text-sm font-mono outline-none">
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Management & Dispatch -->
                        <div>
                            <h4
                                class="text-sm font-bold text-gray-700 dark:text-gray-300 mb-4 border-b border-gray-100 dark:border-white/5 pb-2">
                                C. Management & Dispatch Executives</h4>
                            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div class="space-y-4">
                                    <h5
                                        class="text-xs font-bold text-gray-500 uppercase bg-gray-100 dark:bg-white/5 inline-block px-2 py-1 rounded">
                                        Warehouse Manager</h5>
                                    <div class="grid grid-cols-2 gap-3">
                                        <div><label class="block text-[10px] text-gray-500">Base Salary</label><input
                                                type="number" v-model.number="rates.managers.warehouseBase"
                                                class="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded p-1.5 text-sm font-mono outline-none">
                                        </div>
                                        <div><label class="block text-[10px] text-gray-500">HRA</label><input
                                                type="number" v-model.number="rates.managers.warehouseHra"
                                                class="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded p-1.5 text-sm font-mono outline-none">
                                        </div>
                                        <div><label class="block text-[10px] text-gray-500">DA</label><input
                                                type="number" v-model.number="rates.managers.warehouseDa"
                                                class="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded p-1.5 text-sm font-mono outline-none">
                                        </div>
                                        <div><label class="block text-[10px] text-gray-500 text-blue-500 font-bold">Max
                                                SLA Bonus</label><input type="number" :disabled="!isEditMode"
                                                v-model.number="rates.managers.warehouseBonus"
                                                class="w-full bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded p-1.5 text-sm font-mono font-bold text-blue-700 dark:text-blue-300 outline-none">
                                        </div>
                                    </div>
                                </div>
                                <div class="space-y-4">
                                    <h5
                                        class="text-xs font-bold text-gray-500 uppercase bg-gray-100 dark:bg-white/5 inline-block px-2 py-1 rounded">
                                        Fleet Dispatcher</h5>
                                    <div class="grid grid-cols-2 gap-3">
                                        <div><label class="block text-[10px] text-gray-500">Base Salary</label><input
                                                type="number" v-model.number="rates.managers.dispatcherBase"
                                                class="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded p-1.5 text-sm font-mono outline-none">
                                        </div>
                                        <div><label class="block text-[10px] text-gray-500">HRA</label><input
                                                type="number" v-model.number="rates.managers.dispatcherHra"
                                                class="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded p-1.5 text-sm font-mono outline-none">
                                        </div>
                                        <div><label class="block text-[10px] text-gray-500">DA</label><input
                                                type="number" v-model.number="rates.managers.dispatcherDa"
                                                class="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded p-1.5 text-sm font-mono outline-none">
                                        </div>
                                        <div><label
                                                class="block text-[10px] text-gray-500 text-blue-500 font-bold">Efficiency
                                                Bonus</label><input type="number" :disabled="!isEditMode"
                                                v-model.number="rates.managers.dispatcherBonus"
                                                class="w-full bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded p-1.5 text-sm font-mono font-bold text-blue-700 dark:text-blue-300 outline-none">
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Right Column: Fuel & Exceptions -->
            <div class="flex flex-col gap-6">

                <!-- 3. Exceptions & Discounts -->
                <div class="glass-panel rounded-xl overflow-hidden border border-purple-100 dark:border-purple-500/20">
                    <div
                        class="p-4 bg-purple-50 dark:bg-purple-900/10 flex items-center justify-between border-b border-purple-100 dark:border-purple-500/20">
                        <div class="flex items-center gap-2">
                            <span
                                class="material-symbols-outlined text-purple-600 dark:text-purple-400">local_offer</span>
                            <h3 class="font-bold text-purple-900 dark:text-purple-100">Discount Logic</h3>
                        </div>
                    </div>
                    <div class="p-5 space-y-4">
                        <div
                            class="p-4 bg-white dark:bg-black/20 rounded-xl border border-gray-100 dark:border-white/5 flex flex-col h-[400px]">
                            <div class="flex items-center justify-between mb-4 flex-shrink-0">
                                <div>
                                    <span
                                        class="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                        <span class="material-symbols-outlined text-purple-500">smart_toy</span>
                                        AI Generated Quotations
                                    </span>
                                    <p class="text-[10px] text-gray-500 mt-1 max-w-[250px]">Review and approve
                                        AI-negotiated custom volumetric rates.</p>
                                </div>
                                <span
                                    class="bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 text-[10px] font-bold px-2 py-0.5 rounded-full">{{
                                        pendingQuotes.length }} Awaiting</span>
                            </div>

                            <!-- Empty State -->
                            <div v-if="pendingQuotes.length === 0"
                                class="flex-1 flex flex-col items-center justify-center bg-gray-50/50 dark:bg-black/10 rounded-lg border border-dashed border-gray-200 dark:border-white/10">
                                <span class="material-symbols-outlined text-gray-400 text-4xl mb-2">done_all</span>
                                <p class="text-xs text-gray-500 font-medium">All AI quotations reviewed</p>
                            </div>

                            <!-- Quotes List -->
                            <div v-else class="flex-1 overflow-y-auto pr-1 space-y-3 custom-scrollbar">
                                <div v-for="quote in pendingQuotes" :key="quote.id"
                                    class="bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-lg p-3 shadow-sm hover:border-purple-300 dark:hover:border-purple-500/30 transition-colors">
                                    <div class="flex justify-between items-start mb-2">
                                        <div>
                                            <h4 class="text-xs font-bold text-gray-900 dark:text-white">{{
                                                quote.customer }}</h4>
                                            <p class="text-[10px] text-gray-500 flex items-center gap-1 mt-0.5">
                                                <span class="material-symbols-outlined text-[12px]">route</span> {{
                                                    quote.origin }} → {{ quote.dest }}
                                            </p>
                                        </div>
                                        <div class="text-right">
                                            <span class="text-xs font-bold text-purple-600 dark:text-purple-400">₹{{
                                                quote.aiQuote.toLocaleString() }}</span>
                                            <p class="text-[10px] text-red-500 line-through">₹{{
                                                quote.originalPrice.toLocaleString() }}</p>
                                        </div>
                                    </div>

                                    <div
                                        class="grid grid-cols-2 gap-2 mb-3 bg-white dark:bg-white/5 p-2 rounded-md border border-gray-100 dark:border-white/5">
                                        <div>
                                            <span class="block text-[9px] text-gray-500 uppercase font-bold">Valid
                                                From</span>
                                            <span class="text-[11px] text-gray-800 dark:text-gray-300 font-mono">{{
                                                quote.startDate }}</span>
                                        </div>
                                        <div>
                                            <span class="block text-[9px] text-gray-500 uppercase font-bold">Valid
                                                Until</span>
                                            <span class="text-[11px] text-gray-800 dark:text-gray-300 font-mono">{{
                                                quote.endDate }}</span>
                                        </div>
                                        <div class="col-span-2 mt-1">
                                            <div class="flex justify-between items-end">
                                                <span
                                                    class="block text-[9px] text-gray-500 uppercase font-bold">Discount
                                                    Applied</span>
                                                <span
                                                    class="text-[10px] text-purple-600 dark:text-purple-400 font-bold leading-none">{{
                                                        quote.discount }}% OFF</span>
                                            </div>
                                            <div
                                                class="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-1.5 mt-1.5 overflow-hidden">
                                                <div class="bg-gradient-to-r from-purple-400 to-purple-600 h-1.5 rounded-full"
                                                    :style="{ width: `${quote.discount}%` }"></div>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="flex gap-2">
                                        <button @click="approveQuote(quote.id)" :disabled="!isEditMode"
                                            class="flex-1 bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/40 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800 rounded py-1.5 text-[11px] font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1">
                                            <span class="material-symbols-outlined text-[14px]">check</span> Approve
                                        </button>
                                        <button @click="denyQuote(quote.id)" :disabled="!isEditMode"
                                            class="flex-1 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 rounded py-1.5 text-[11px] font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1">
                                            <span class="material-symbols-outlined text-[14px]">close</span> Deny
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div
                            class="bg-red-50 dark:bg-red-900/10 p-3 rounded-lg flex items-start gap-2 border border-red-100 dark:border-red-500/20">
                            <span class="material-symbols-outlined text-red-500 text-[16px] mt-0.5">lock</span>
                            <p class="text-[10px] text-red-800 dark:text-red-200">Dispatchers and Warehouse Managers are
                                <strong>hard-locked</strong> from modifying price quotes.
                            </p>
                        </div>
                    </div>
                </div>

                <!-- 4. Fuel Reimbursement -->
                <div class="glass-panel rounded-xl overflow-hidden border border-orange-100 dark:border-orange-500/20">
                    <div
                        class="p-4 bg-orange-50 dark:bg-orange-900/10 flex items-center justify-between border-b border-orange-100 dark:border-orange-500/20">
                        <div class="flex items-center gap-2">
                            <span
                                class="material-symbols-outlined text-orange-600 dark:text-orange-400">local_gas_station</span>
                            <h3 class="font-bold text-orange-900 dark:text-orange-100">Fuel & Fleet Expenses</h3>
                        </div>
                    </div>
                    <div class="p-5 space-y-4">
                        <div class="grid grid-cols-2 gap-4">
                            <div
                                class="bg-gray-50 dark:bg-black/20 p-3 rounded-lg border border-gray-200 dark:border-white/10">
                                <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Current Fuel Rate
                                    (₹/L)</label>
                                <input type="number" :disabled="!isEditMode" step="0.1"
                                    v-model.number="rates.fuel.currentRate"
                                    class="w-full bg-white dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded p-2 text-sm font-mono text-orange-600 dark:text-orange-400 font-bold outline-none">
                            </div>
                            <div
                                class="bg-gray-50 dark:bg-black/20 p-3 rounded-lg border border-gray-200 dark:border-white/10">
                                <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Max Claim Limit
                                    (₹/KM)</label>
                                <input type="number" :disabled="!isEditMode" step="0.1"
                                    v-model.number="rates.fuel.maxClaimPerKm"
                                    class="w-full bg-white dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded p-2 text-sm font-mono outline-none">
                            </div>
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Expected Standard
                                Mileage (KM/L)</label>
                            <input type="number" :disabled="!isEditMode" step="0.5"
                                v-model.number="rates.fuel.benchmarkMileage"
                                class="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg p-2.5 text-sm font-mono outline-none">
                            <p class="text-[10px] text-gray-500 mt-1">Deviations beyond 15% between odometer and fuel
                                receipts trigger immediate OCR/GPS fraud audit logs.</p>
                        </div>
                    </div>
                </div>

                <!-- 5. Seasonal / Dynamic -->
                <div class="glass-panel rounded-xl overflow-hidden">
                    <div class="p-4 border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-black/20">
                        <h3 class="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <span class="material-symbols-outlined text-blue-500">trending_up</span> Dynamic Pricing
                        </h3>
                    </div>
                    <div class="p-5 space-y-4">
                        <div
                            class="flex items-center justify-between border-b border-gray-100 dark:border-white/10 pb-3">
                            <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Harvest/Peak Surge</span>
                            <div class="flex items-center gap-2">
                                <span class="text-xs text-gray-500">x</span>
                                <input type="number" :disabled="!isEditMode" step="0.1"
                                    v-model.number="rates.dynamic.peak"
                                    class="w-16 bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded px-2 py-1 text-sm font-mono text-center outline-none">
                            </div>
                        </div>
                        <div class="flex items-center justify-between">
                            <span
                                class="text-sm font-medium text-red-600 dark:text-red-400 flex items-center gap-1"><span
                                    class="material-symbols-outlined text-[16px]">warning</span> Emergency
                                Priority</span>
                            <div class="flex items-center gap-2">
                                <span class="text-xs text-gray-500">x</span>
                                <input type="number" :disabled="!isEditMode" step="0.1"
                                    v-model.number="rates.dynamic.emergency"
                                    class="w-16 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-300 rounded px-2 py-1 text-sm font-mono text-center outline-none">
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>

        <!-- Audit Note -->
        <div class="flex justify-center mt-4">
            <span
                class="text-xs text-gray-400 flex items-center gap-1 bg-gray-100 dark:bg-white/5 px-3 py-1 rounded-full"><span
                    class="material-symbols-outlined text-[14px]">history</span> Matrix last updated by sys_admin on Oct
                24, 09:41 AM</span>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'

const isEditMode = ref(false)

const rates = ref({
    // Revenue
    baseBookingFee: 1500,
    perKmRate: 45,
    minimumCharge: 2000,
    expressMultiplier: 1.5,

    customerLaborRate: 300,

    materials: {
        box: 50,
        bubbleWrap: 20,
        crate: 200
    },

    // Cost
    driver: {
        type: 'salary_bonus',
        baseSalary: 25000,
        hra: 5000,
        da: 2000,
        performanceBonus: 3000,
        kmRate: 15,
        fuelIncentive: 500,
        ratingMultiplier: 1.1
    },
    labor: {
        baseSalary: 18000,
        hra: 3500,
        da: 1500,
        performanceBonus: 2000,
        hourlyWage: 150,
        overtimeMul: 1.5,
        fieldAllowance: 200
    },
    managers: {
        warehouseBase: 65000,
        warehouseHra: 15000,
        warehouseDa: 5000,
        warehouseBonus: 10000,
        dispatcherBase: 45000,
        dispatcherHra: 10000,
        dispatcherDa: 4000,
        dispatcherBonus: 8000
    },

    // Discounts
    // dynamic quotes list handled via pendingQuotes

    // Fuel
    fuel: {
        maxClaimPerKm: 12.5,
        benchmarkMileage: 8.5
    },

    // Dynamic
    dynamic: {
        peak: 1.2,
        emergency: 2.5
    }
})

const pendingQuotes = ref([
    { id: 1, customer: "Acme Corp", origin: "Delhi", dest: "Mumbai", originalPrice: 45000, aiQuote: 38000, discount: 15.5, startDate: "2026-03-01", endDate: "2026-03-31" },
    { id: 2, customer: "TechFlow Ltd", origin: "Bangalore", dest: "Chennai", originalPrice: 15000, aiQuote: 12000, discount: 20.0, startDate: "2026-02-28", endDate: "2026-03-15" },
    { id: 3, customer: "Global Traders", origin: "Pune", dest: "Hyderabad", originalPrice: 28000, aiQuote: 25000, discount: 10.7, startDate: "2026-03-05", endDate: "2026-04-05" }
])

const approveQuote = (id) => {
    if (!isEditMode.value) return;
    pendingQuotes.value = pendingQuotes.value.filter(q => q.id !== id);
}

const denyQuote = (id) => {
    if (!isEditMode.value) return;
    pendingQuotes.value = pendingQuotes.value.filter(q => q.id !== id);
}

const saveAndLock = () => {
    saveAllRates();
    isEditMode.value = false;
}

const saveAllRates = () => {
    alert("Global Rate Matrix safely deployed to all booking algorithms & payroll systems. Logged in Immutable System Audit.")
}
</script>
