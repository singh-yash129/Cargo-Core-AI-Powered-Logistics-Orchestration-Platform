<template>
    <div class="space-y-6">
        <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <div>
                <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Invoices & Billing</h2>
                <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage payments, invoices, and billing history</p>
            </div>
            <div class="flex gap-3">
                <button @click="exportReport" class="px-4 py-2 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-white rounded-lg font-bold text-sm transition-colors flex items-center gap-2">
                    <span class="material-symbols-outlined text-[16px]">download</span> Export
                </button>
                <button @click="payAllDue" :disabled="store.totalUnpaid === 0" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                    <span class="material-symbols-outlined text-[16px]">payments</span> Pay All Due
                </button>
            </div>
        </div>

        <!-- Summary Cards -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div class="glass-panel p-5 rounded-xl border-l-4 border-red-500">
                <div class="text-gray-500 dark:text-gray-400 text-xs font-medium uppercase mb-1">Overdue</div>
                <div class="text-2xl font-bold text-red-500">₹{{ store.totalOverdue.toLocaleString() }}</div>
                <div class="text-xs text-red-400 mt-1">{{ store.overdueInvoices.length }} invoice(s)</div>
            </div>
            <div class="glass-panel p-5 rounded-xl border-l-4 border-blue-500">
                <div class="text-gray-500 dark:text-gray-400 text-xs font-medium uppercase mb-1">Unpaid</div>
                <div class="text-2xl font-bold text-gray-900 dark:text-white">{{ store.totalUnpaid }}</div>
                <div class="text-xs text-blue-400 mt-1">Pending settlement</div>
            </div>
            <div class="glass-panel p-5 rounded-xl border-l-4 border-green-500">
                <div class="text-gray-500 dark:text-gray-400 text-xs font-medium uppercase mb-1">Paid This Month</div>
                <div class="text-2xl font-bold text-green-500">₹{{ store.totalPaidThisMonth.toLocaleString() }}</div>
                <div class="text-xs text-green-400 mt-1">Successful transactions</div>
            </div>
            <div class="glass-panel p-5 rounded-xl border-l-4 border-purple-500">
                <div class="text-gray-500 dark:text-gray-400 text-xs font-medium uppercase mb-1">Credit Balance</div>
                <div class="text-2xl font-bold text-purple-500">₹{{ store.creditBalance.toLocaleString() }}</div>
                <div class="text-xs text-purple-400 mt-1">Available credit</div>
            </div>
        </div>

        <!-- Filters -->
        <div class="glass-panel p-4 rounded-xl flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <div class="relative flex-1">
                <span class="material-symbols-outlined absolute left-3 top-2.5 text-gray-400 text-sm">search</span>
                <input v-model="searchQuery" type="text" placeholder="Search invoice ID, order ID..."
                    class="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg py-2 pl-9 pr-4 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-blue-500">
            </div>
            <select v-model="statusFilter" class="text-sm bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500">
                <option value="all" class="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">All Status</option>
                <option value="Unpaid" class="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">Unpaid</option>
                <option value="Overdue" class="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">Overdue</option>
                <option value="Partial" class="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">Partial</option>
                <option value="Paid" class="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">Paid</option>
            </select>
        </div>

        <!-- Invoices Table -->
        <div class="glass-panel rounded-xl overflow-hidden">
            <div class="overflow-x-auto">
                <table class="w-full text-left text-sm min-w-[700px]">
                    <thead class="bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 text-xs uppercase">
                        <tr>
                            <th class="px-5 py-3">Invoice #</th>
                            <th class="px-5 py-3">Order</th>
                            <th class="px-5 py-3">Date</th>
                            <th class="px-5 py-3">Due Date</th>
                            <th class="px-5 py-3 text-right">Amount</th>
                            <th class="px-5 py-3 text-right">Paid</th>
                            <th class="px-5 py-3">Status</th>
                            <th class="px-5 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100 dark:divide-white/5">
                        <tr v-if="filteredInvoices.length === 0">
                            <td colspan="8" class="px-5 py-8 text-center text-gray-500 dark:text-gray-400">No invoices found</td>
                        </tr>
                        <tr v-for="inv in filteredInvoices" :key="inv.id" class="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                            <td class="px-5 py-3 font-mono text-blue-500 text-xs font-bold">{{ inv.id }}</td>
                            <td class="px-5 py-3 text-gray-600 dark:text-gray-300 text-xs">{{ inv.orderId }}</td>
                            <td class="px-5 py-3 text-gray-500 dark:text-gray-400 text-xs">{{ inv.date }}</td>
                            <td class="px-5 py-3 text-xs" :class="inv.status === 'Overdue' ? 'text-red-500 font-bold' : 'text-gray-500 dark:text-gray-400'">{{ inv.dueDate }}</td>
                            <td class="px-5 py-3 text-right font-bold text-gray-900 dark:text-white text-xs">₹{{ inv.amount.toLocaleString() }}</td>
                            <td class="px-5 py-3 text-right text-xs" :class="inv.paid > 0 ? 'text-green-500 font-bold' : 'text-gray-400'">₹{{ inv.paid.toLocaleString() }}</td>
                            <td class="px-5 py-3"><span class="px-2 py-0.5 rounded text-[10px] font-bold" :class="invoiceStatusClass(inv.status)">{{ inv.status }}</span></td>
                            <td class="px-5 py-3 text-right">
                                <div class="flex items-center justify-end gap-1">
                                    <button @click="viewInvoice(inv)" class="p-1.5 rounded-lg hover:bg-blue-500/10 text-gray-400 hover:text-blue-500 transition-colors" title="View">
                                        <span class="material-symbols-outlined text-[16px]">visibility</span>
                                    </button>
                                    <button v-if="inv.status !== 'Paid'" @click="openPayModal(inv)" class="p-1.5 rounded-lg hover:bg-green-500/10 text-gray-400 hover:text-green-500 transition-colors" title="Pay">
                                        <span class="material-symbols-outlined text-[16px]">payments</span>
                                    </button>
                                    <button @click="downloadInvoice(inv)" class="p-1.5 rounded-lg hover:bg-gray-500/10 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors" title="Download">
                                        <span class="material-symbols-outlined text-[16px]">download</span>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Invoice Detail Modal -->
        <Teleport to="body">
            <BaseModal :isOpen="!!viewingInvoice" @close="viewingInvoice = null">
                <template #title>Invoice {{ viewingInvoice?.id }}</template>
                <div v-if="viewingInvoice" class="space-y-4">
                    <div class="grid grid-cols-2 gap-3">
                        <div class="p-3 bg-gray-50 dark:bg-white/5 rounded-lg"><div class="text-xs text-gray-500 mb-1">Order</div><div class="text-sm font-bold text-gray-900 dark:text-white">{{ viewingInvoice.orderId }}</div></div>
                        <div class="p-3 bg-gray-50 dark:bg-white/5 rounded-lg"><div class="text-xs text-gray-500 mb-1">Status</div><span class="px-2 py-0.5 rounded text-[10px] font-bold" :class="invoiceStatusClass(viewingInvoice.status)">{{ viewingInvoice.status }}</span></div>
                        <div class="p-3 bg-gray-50 dark:bg-white/5 rounded-lg"><div class="text-xs text-gray-500 mb-1">Issue Date</div><div class="text-sm font-medium text-gray-900 dark:text-white">{{ viewingInvoice.date }}</div></div>
                        <div class="p-3 bg-gray-50 dark:bg-white/5 rounded-lg"><div class="text-xs text-gray-500 mb-1">Due Date</div><div class="text-sm font-medium text-gray-900 dark:text-white">{{ viewingInvoice.dueDate }}</div></div>
                    </div>
                    <div class="border-t border-gray-200 dark:border-white/10 pt-4 space-y-2">
                        <div class="flex justify-between text-sm"><span class="text-gray-500">Total Amount</span><span class="font-bold text-gray-900 dark:text-white">₹{{ viewingInvoice.amount.toLocaleString() }}</span></div>
                        <div class="flex justify-between text-sm"><span class="text-gray-500">Paid Amount</span><span class="font-bold text-green-500">₹{{ viewingInvoice.paid.toLocaleString() }}</span></div>
                        <div class="flex justify-between text-sm border-t border-gray-200 dark:border-white/10 pt-2"><span class="text-gray-500 font-bold">Balance Due</span><span class="font-bold text-red-500">₹{{ (viewingInvoice.amount - viewingInvoice.paid).toLocaleString() }}</span></div>
                    </div>
                </div>
                <template #footer>
                    <button @click="viewingInvoice = null" class="px-4 py-2 text-gray-500 text-sm">Close</button>
                    <button v-if="viewingInvoice?.status !== 'Paid'" @click="openPayModal(viewingInvoice); viewingInvoice = null" class="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 transition-colors">Make Payment</button>
                </template>
            </BaseModal>
        </Teleport>

        <!-- Payment Modal -->
        <Teleport to="body">
            <BaseModal :isOpen="showPayModal" @close="showPayModal = false">
                <template #title>Make Payment — {{ payingInvoice?.id }}</template>
                <div v-if="payingInvoice" class="space-y-4">
                    <div class="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div class="flex justify-between text-sm mb-1"><span class="text-gray-500">Total Due</span><span class="font-bold text-gray-900 dark:text-white">₹{{ (payingInvoice.amount - payingInvoice.paid).toLocaleString() }}</span></div>
                    </div>
                    <div>
                        <label class="block text-xs text-gray-500 dark:text-gray-400 mb-1.5">Payment Type</label>
                        <div class="flex gap-3">
                            <label class="flex-1 text-center px-3 py-2 rounded-lg border cursor-pointer text-sm font-medium transition-colors" :class="paymentType === 'full' ? 'border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400' : 'border-gray-200 dark:border-white/10 text-gray-500'">
                                <input type="radio" value="full" v-model="paymentType" class="sr-only">Full Payment
                            </label>
                            <label class="flex-1 text-center px-3 py-2 rounded-lg border cursor-pointer text-sm font-medium transition-colors" :class="paymentType === 'partial' ? 'border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400' : 'border-gray-200 dark:border-white/10 text-gray-500'">
                                <input type="radio" value="partial" v-model="paymentType" class="sr-only">Partial
                            </label>
                        </div>
                    </div>
                    <div v-if="paymentType === 'partial'">
                        <label class="block text-xs text-gray-500 dark:text-gray-400 mb-1.5">Amount (₹) *</label>
                        <input v-model.number="payAmount" type="number" :max="payingInvoice.amount - payingInvoice.paid" min="1" placeholder="Enter amount" class="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg p-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-blue-500">
                    </div>
                    <div>
                        <label class="block text-xs text-gray-500 dark:text-gray-400 mb-1.5">Payment Method</label>
                        <div class="flex flex-wrap gap-2">
                            <label v-for="m in ['Bank Transfer', 'Credit Card', 'UPI', 'Wallet']" :key="m" class="px-3 py-2 rounded-lg border cursor-pointer text-xs font-medium transition-colors" :class="payMethod === m ? 'border-green-500 bg-green-500/10 text-green-600 dark:text-green-400' : 'border-gray-200 dark:border-white/10 text-gray-500'">
                                <input type="radio" :value="m" v-model="payMethod" class="sr-only">{{ m }}
                            </label>
                        </div>
                    </div>
                </div>
                <template #footer>
                    <button @click="showPayModal = false" class="px-4 py-2 text-gray-500 text-sm">Cancel</button>
                    <button @click="submitPayment" class="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 transition-colors">Confirm Payment</button>
                </template>
            </BaseModal>
        </Teleport>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useVendorStore } from '@/stores/vendorStore'
import BaseModal from '@/components/BaseModal.vue'

const store = useVendorStore()
const searchQuery = ref('')
const statusFilter = ref('all')
const viewingInvoice = ref(null)
const showPayModal = ref(false)
const payingInvoice = ref(null)
const paymentType = ref('full')
const payAmount = ref(0)
const payMethod = ref('Bank Transfer')

const filteredInvoices = computed(() => {
    let list = store.invoices
    if (statusFilter.value !== 'all') list = list.filter(i => i.status === statusFilter.value)
    if (searchQuery.value.trim()) {
        const q = searchQuery.value.toLowerCase()
        list = list.filter(i => i.id.toLowerCase().includes(q) || i.orderId.toLowerCase().includes(q))
    }
    return list
})

const invoiceStatusClass = s => ({
    Unpaid: 'bg-blue-500/20 text-blue-600 dark:text-blue-400',
    Overdue: 'bg-red-500/20 text-red-600 dark:text-red-400',
    Partial: 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400',
    Paid: 'bg-green-500/20 text-green-600 dark:text-green-400',
}[s] || 'bg-gray-500/20 text-gray-500')

function viewInvoice(inv) {
    viewingInvoice.value = inv
}

function openPayModal(inv) {
    payingInvoice.value = inv
    paymentType.value = 'full'
    payAmount.value = inv.amount - inv.paid
    payMethod.value = 'Bank Transfer'
    showPayModal.value = true
}

function submitPayment() {
    if (!payingInvoice.value) return
    const amount = paymentType.value === 'full' ? (payingInvoice.value.amount - payingInvoice.value.paid) : payAmount.value
    if (amount <= 0) return
    store.payInvoice(payingInvoice.value.id, amount)
    showPayModal.value = false
    payingInvoice.value = null
    showToast('Payment recorded successfully')
}

function payAllDue() {
    if (!confirm('Pay all outstanding invoices?')) return
    store.invoices.filter(i => i.status !== 'Paid').forEach(inv => {
        store.payInvoice(inv.id, inv.amount - inv.paid)
    })
    showToast('All invoices settled')
}

function downloadInvoice(inv) {
    showToast(`Downloading ${inv.id}...`)
}

function exportReport() {
    showToast('Exporting billing report...')
}

function showToast(msg) {
    const t = document.createElement('div')
    t.className = 'fixed right-4 bottom-4 z-[9999] bg-green-500 text-white text-sm font-bold px-4 py-2 rounded-lg shadow-xl'
    t.textContent = msg
    document.body.appendChild(t)
    setTimeout(() => t.remove(), 3000)
}

</script>
