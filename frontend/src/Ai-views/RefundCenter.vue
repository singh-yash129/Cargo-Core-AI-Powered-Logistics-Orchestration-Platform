<template>
    <div class="space-y-6">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Refund Center</h2>
                <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage refund requests and auto-approval rules
                </p>
            </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Stats Column -->
            <div class="space-y-6">
                <div
                    class="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 p-6 rounded-xl shadow-sm bg-gradient-to-br from-green-50 dark:from-green-900/20 to-white dark:to-transparent">
                    <div class="flex justify-between items-start mb-2">
                        <div class="text-gray-500 dark:text-gray-400 text-sm">Total Refunded (This Month)</div>
                        <span class="material-symbols-outlined text-green-500">attach_money</span>
                    </div>
                    <div class="text-3xl font-bold text-gray-900 dark:text-white">$4,250.00</div>
                    <div class="text-xs text-green-600 dark:text-green-400 mt-1">↓ 12% decrease vs last month</div>
                </div>

                <div
                    class="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 p-6 rounded-xl shadow-sm">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="font-bold text-gray-900 dark:text-white">Auto-Refund Rules</h3>
                        <button @click="showAddRuleModal = true"
                            class="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300">
                            <span class="material-symbols-outlined text-sm">add</span>
                        </button>
                    </div>
                    <div class="space-y-3">
                        <div v-for="rule in rules" :key="rule.id"
                            class="flex items-center justify-between p-3 bg-gray-50 dark:bg-white/5 rounded-lg border border-gray-100 dark:border-white/5">
                            <div>
                                <div class="text-sm font-bold text-gray-900 dark:text-white">{{ rule.name }}</div>
                                <div class="text-xs text-gray-500 dark:text-gray-400">{{ rule.action }}</div>
                            </div>
                            <button @click="rule.enabled = !rule.enabled"
                                class="w-10 h-6 rounded-full relative transition-colors"
                                :class="rule.enabled ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'">
                                <div class="absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform"
                                    :class="rule.enabled ? 'right-1' : 'left-1'"></div>
                            </button>
                        </div>
                    </div>
                    <button @click="showAddRuleModal = true"
                        class="w-full mt-4 py-2 border border-dashed border-gray-300 dark:border-white/20 text-gray-400 rounded-lg hover:border-purple-400 hover:text-purple-500 transition-colors text-sm">
                        + Add New Rule
                    </button>
                </div>
            </div>

            <!-- Refund Requests List -->
            <div
                class="lg:col-span-2 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 p-6 rounded-xl shadow-sm">
                <div class="flex items-center justify-between mb-6">
                    <h3 class="font-bold text-gray-900 dark:text-white">Refund Requests</h3>
                    <div class="flex gap-2">
                        <button v-for="tab in ['Pending', 'History']" :key="tab" @click="activeTab = tab"
                            class="text-xs px-3 py-1.5 rounded-lg font-bold transition-colors"
                            :class="activeTab === tab
                                ? 'bg-purple-600 text-white'
                                : 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/20'">
                            {{ tab }}
                        </button>
                    </div>
                </div>

                <div class="space-y-4">
                    <div v-for="refund in visibleRefunds" :key="refund.id"
                        class="flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/5 hover:border-gray-300 dark:hover:border-white/20 transition-colors">
                        <div class="flex items-center gap-4">
                            <div
                                class="w-10 h-10 rounded-full bg-gradient-to-br from-gray-200 dark:from-gray-700 to-gray-300 dark:to-gray-600 flex items-center justify-center text-gray-700 dark:text-white font-bold text-sm">
                                {{ refund.initials }}
                            </div>
                            <div>
                                <div class="font-bold text-gray-900 dark:text-white">{{ refund.customer }}
                                    <span class="text-gray-400 font-normal ml-2 text-sm">Order #{{ refund.orderId
                                        }}</span>
                                </div>
                                <div class="text-sm text-gray-500 dark:text-gray-400">{{ refund.reason }}</div>
                                <div class="flex gap-2 mt-1">
                                    <span
                                        class="text-[10px] bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 px-1.5 rounded">{{
                                            refund.type }}</span>
                                    <span class="text-[10px] text-gray-400">{{ refund.time }}</span>
                                </div>
                            </div>
                        </div>
                        <div class="text-right flex items-center gap-4">
                            <div>
                                <div class="text-xl font-bold text-gray-900 dark:text-white">${{ refund.amount }}</div>
                                <div class="text-xs"
                                    :class="refund.autoRefund ? 'text-purple-600 dark:text-purple-400' : 'text-yellow-600 dark:text-yellow-400'">
                                    {{ refund.autoRefund ? 'AI Suggested' : 'Manual Review' }}
                                </div>
                            </div>
                            <div class="flex gap-2" v-if="!refund.resolved">
                                <button @click="approveRefund(refund)"
                                    class="p-2 bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-500 rounded-lg hover:bg-green-500 hover:text-white transition-colors"
                                    title="Approve">
                                    <span class="material-symbols-outlined">check</span>
                                </button>
                                <button @click="rejectRefund(refund)"
                                    class="p-2 bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-colors"
                                    title="Reject">
                                    <span class="material-symbols-outlined">close</span>
                                </button>
                            </div>
                            <div v-else>
                                <span class="text-xs font-bold"
                                    :class="refund.resolvedStatus === 'Approved' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'">
                                    {{ refund.resolvedStatus }}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div v-if="visibleRefunds.length === 0" class="text-center text-gray-400 py-8">
                        No {{ activeTab.toLowerCase() }} refund requests.
                    </div>
                </div>
            </div>
        </div>

        <!-- Add Rule Modal -->
        <Teleport to="body">
            <div v-if="showAddRuleModal"
                class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                @click.self="showAddRuleModal = false">
                <div
                    class="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md shadow-2xl border border-gray-100 dark:border-white/10 overflow-hidden">
                    <div class="p-6 border-b border-gray-100 dark:border-white/5">
                        <h3 class="text-xl font-bold text-gray-900 dark:text-white">Add Auto-Refund Rule</h3>
                    </div>
                    <div class="p-6 space-y-4">
                        <div>
                            <label class="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase">Rule
                                Name</label>
                            <input v-model="newRule.name" type="text"
                                class="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white outline-none focus:border-purple-500 transition-colors"
                                placeholder="e.g. Lost Delivery < $100" />
                        </div>
                        <div>
                            <label
                                class="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase">Action</label>
                            <select v-model="newRule.action"
                                class="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white outline-none focus:border-purple-500 transition-colors">
                                <option>Auto-Approve</option>
                                <option>Manual Review</option>
                                <option>10% Refund</option>
                                <option>Full Refund</option>
                            </select>
                        </div>
                    </div>
                    <div class="p-6 border-t border-gray-100 dark:border-white/5 flex gap-3">
                        <button @click="showAddRuleModal = false"
                            class="flex-1 py-2.5 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-white font-bold rounded-xl transition-colors">
                            Cancel
                        </button>
                        <button @click="addRule" :disabled="!newRule.name"
                            class="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold rounded-xl transition-colors">
                            Add Rule
                        </button>
                    </div>
                </div>
            </div>
        </Teleport>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const activeTab = ref('Pending')
const showAddRuleModal = ref(false)
const newRule = ref({ name: '', action: 'Auto-Approve' })

const rules = ref([
    { id: 1, name: 'Damaged Items < $50', action: 'Auto-Approve', enabled: true },
    { id: 2, name: 'Late Delivery > 24h', action: '10% Refund', enabled: true },
    { id: 3, name: 'Missing Item', action: 'Manual Review', enabled: false },
])

const refunds = ref([
    { id: 1, customer: 'David Rose', initials: 'DR', orderId: 'MV-1122', reason: 'Item arrived damaged (Photo verified)', type: 'Damage', time: '10m ago', amount: '45.00', autoRefund: true, resolved: false },
    { id: 2, customer: 'Alexis Rose', initials: 'AR', orderId: 'MV-3344', reason: 'Service complaint', type: 'Service', time: '1h ago', amount: '120.00', autoRefund: false, resolved: false },
    { id: 3, customer: 'Johnny Rose', initials: 'JR', orderId: 'MV-5566', reason: 'Missing box #4', type: 'Lost Item', time: '2h ago', amount: '200.00', autoRefund: false, resolved: false },
    { id: 4, customer: 'Moira Rose', initials: 'MR', orderId: 'MV-7788', reason: 'Late delivery refund', type: 'Delay', time: 'Yesterday', amount: '35.00', autoRefund: true, resolved: true, resolvedStatus: 'Approved' },
])

const visibleRefunds = computed(() => {
    if (activeTab.value === 'Pending') return refunds.value.filter(r => !r.resolved)
    return refunds.value.filter(r => r.resolved)
})

function approveRefund(refund) {
    refund.resolved = true
    refund.resolvedStatus = 'Approved'
}

function rejectRefund(refund) {
    refund.resolved = true
    refund.resolvedStatus = 'Rejected'
}

function addRule() {
    if (!newRule.value.name) return
    rules.value.push({
        id: Date.now(),
        name: newRule.value.name,
        action: newRule.value.action,
        enabled: true
    })
    newRule.value = { name: '', action: 'Auto-Approve' }
    showAddRuleModal.value = false
}
</script>
