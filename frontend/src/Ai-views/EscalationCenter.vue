<template>
    <div class="space-y-6">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Escalation Center</h2>
                <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage and resolve high-priority customer
                    escalations</p>
            </div>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div
                class="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 p-4 rounded-xl border-l-4 border-l-red-500">
                <div class="text-xs text-gray-500 dark:text-gray-400">Total Escalations</div>
                <div class="text-2xl font-bold text-gray-900 dark:text-white">12</div>
                <div class="text-xs text-red-500 dark:text-red-400 mt-1">↑ 3 new today</div>
            </div>
            <div
                class="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 p-4 rounded-xl border-l-4 border-l-yellow-500">
                <div class="text-xs text-gray-500 dark:text-gray-400">Pending Review</div>
                <div class="text-2xl font-bold text-gray-900 dark:text-white">5</div>
                <div class="text-xs text-yellow-500 dark:text-yellow-400 mt-1">Needs attention</div>
            </div>
            <div
                class="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 p-4 rounded-xl border-l-4 border-l-blue-500">
                <div class="text-xs text-gray-500 dark:text-gray-400">Legal Threats</div>
                <div class="text-2xl font-bold text-gray-900 dark:text-white">1</div>
                <div class="text-xs text-blue-500 dark:text-blue-400 mt-1">Escalated to legal</div>
            </div>
            <div
                class="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 p-4 rounded-xl border-l-4 border-l-green-500">
                <div class="text-xs text-gray-500 dark:text-gray-400">Resolved Today</div>
                <div class="text-2xl font-bold text-gray-900 dark:text-white">8</div>
                <div class="text-xs text-green-500 dark:text-green-400 mt-1">↑ Great progress</div>
            </div>
        </div>

        <!-- Filters -->
        <div class="flex gap-2 overflow-x-auto no-scrollbar flex-wrap">
            <button v-for="f in filters" :key="f.label" @click="activeFilter = f.label"
                class="px-4 py-2 rounded-lg text-sm font-bold border transition-colors whitespace-nowrap"
                :class="activeFilter === f.label
                    ? 'bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-500/20 dark:text-purple-400 dark:border-purple-500/30'
                    : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200 dark:bg-white/5 dark:text-gray-400 dark:border-white/5 dark:hover:bg-white/10'">
                {{ f.label }}
            </button>
        </div>

        <!-- Escalation List -->
        <div
            class="bg-white dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/5 overflow-hidden overflow-x-auto shadow-sm">
            <table class="w-full text-left text-sm min-w-[750px]">
                <thead class="bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-gray-400 uppercase text-xs">
                    <tr>
                        <th class="p-4">Customer</th>
                        <th class="p-4">Order ID</th>
                        <th class="p-4">Reason</th>
                        <th class="p-4">Sentiment</th>
                        <th class="p-4">Time</th>
                        <th class="p-4 text-right">Action</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-100 dark:divide-white/5">
                    <tr v-for="ticket in filteredTickets" :key="ticket.id"
                        class="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                        <td class="p-4 font-bold text-gray-900 dark:text-white">{{ ticket.customer }}</td>
                        <td class="p-4 text-purple-600 dark:text-purple-400 font-mono text-xs">{{ ticket.orderId }}
                        </td>
                        <td class="p-4">
                            <span class="px-2 py-1 rounded text-xs font-bold" :class="ticket.badgeClass">
                                {{ ticket.reason }}
                            </span>
                        </td>
                        <td class="p-4">
                            <div class="w-24 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div class="h-full bg-red-500" :style="{ width: ticket.sentimentScore + '%' }"></div>
                            </div>
                            <div class="text-[10px] text-red-500 dark:text-red-400 mt-1">{{ ticket.sentimentScore }}%
                                Negative</div>
                        </td>
                        <td class="p-4 text-gray-500 dark:text-gray-400">{{ ticket.time }}</td>
                        <td class="p-4 text-right">
                            <div class="flex justify-end gap-2">
                                <button @click="openResolveModal(ticket)"
                                    class="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg transition-colors">
                                    Resolve
                                </button>
                                <button @click="openDetailsModal(ticket)"
                                    class="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 text-xs font-bold rounded-lg transition-colors">
                                    Details
                                </button>
                            </div>
                        </td>
                    </tr>
                    <tr v-if="filteredTickets.length === 0">
                        <td colspan="6" class="p-8 text-center text-gray-500 dark:text-gray-400">
                            No escalations match this filter.
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Details Modal -->
        <Teleport to="body">
            <div v-if="showDetailsModal"
                class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                @click.self="showDetailsModal = false">
                <div
                    class="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-lg shadow-2xl border border-gray-100 dark:border-white/10 overflow-hidden">
                    <div class="p-6 border-b border-gray-100 dark:border-white/5 flex justify-between items-center">
                        <h3 class="text-xl font-bold text-gray-900 dark:text-white">Escalation Details</h3>
                        <button @click="showDetailsModal = false"
                            class="text-gray-400 hover:text-gray-600 dark:hover:text-white">
                            <span class="material-symbols-outlined">close</span>
                        </button>
                    </div>
                    <div class="p-6 space-y-4" v-if="selectedTicket">
                        <div class="flex items-center gap-3">
                            <div
                                class="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                                {{selectedTicket.customer.split(' ').map(n => n[0]).join('')}}
                            </div>
                            <div>
                                <div class="font-bold text-gray-900 dark:text-white">{{ selectedTicket.customer }}
                                </div>
                                <div class="text-sm text-gray-500 dark:text-gray-400">{{ selectedTicket.orderId }}
                                </div>
                            </div>
                            <span class="ml-auto px-2 py-1 rounded text-xs font-bold"
                                :class="selectedTicket.badgeClass">
                                {{ selectedTicket.reason }}
                            </span>
                        </div>
                        <div class="grid grid-cols-2 gap-3">
                            <div class="p-3 bg-gray-50 dark:bg-white/5 rounded-lg">
                                <div class="text-xs text-gray-500 mb-1">Sentiment Score</div>
                                <div class="font-bold text-red-600 dark:text-red-400">{{ selectedTicket.sentimentScore
                                    }}% Negative</div>
                            </div>
                            <div class="p-3 bg-gray-50 dark:bg-white/5 rounded-lg">
                                <div class="text-xs text-gray-500 mb-1">Time Opened</div>
                                <div class="font-medium text-gray-900 dark:text-white">{{ selectedTicket.time }}</div>
                            </div>
                        </div>
                        <div class="p-3 bg-gray-50 dark:bg-white/5 rounded-lg">
                            <div class="text-xs text-gray-500 mb-2">AI Recommendation</div>
                            <p class="text-sm text-gray-700 dark:text-gray-300">{{ selectedTicket.recommendation }}</p>
                        </div>
                    </div>
                    <div class="p-6 border-t border-gray-100 dark:border-white/5 flex gap-3">
                        <button @click="showDetailsModal = false"
                            class="flex-1 py-2.5 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-white font-bold rounded-xl transition-colors">
                            Close
                        </button>
                        <button @click="openResolveModal(selectedTicket); showDetailsModal = false"
                            class="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-colors">
                            Resolve Now
                        </button>
                    </div>
                </div>
            </div>
        </Teleport>

        <!-- Resolve Modal -->
        <Teleport to="body">
            <div v-if="showResolveModal"
                class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                @click.self="showResolveModal = false">
                <div
                    class="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md shadow-2xl border border-gray-100 dark:border-white/10 overflow-hidden">
                    <div class="p-6 border-b border-gray-100 dark:border-white/5">
                        <h3 class="text-xl font-bold text-gray-900 dark:text-white">Resolve Escalation</h3>
                        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Provide resolution details and close
                            this ticket.</p>
                    </div>
                    <div class="p-6 space-y-4">
                        <div>
                            <label
                                class="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase">Resolution
                                Type</label>
                            <select v-model="resolutionType"
                                class="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white outline-none focus:border-purple-500 transition-colors">
                                <option value="">Select resolution...</option>
                                <option>Refund Issued</option>
                                <option>Apology + Discount</option>
                                <option>Escalated to Human Agent</option>
                                <option>Legal Team Notified</option>
                                <option>Issue Resolved</option>
                            </select>
                        </div>
                        <div>
                            <label
                                class="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase">Resolution
                                Notes</label>
                            <textarea v-model="resolutionNotes" rows="3"
                                class="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white outline-none focus:border-purple-500 transition-colors resize-none"
                                placeholder="Describe the resolution taken..."></textarea>
                        </div>
                    </div>
                    <div class="p-6 border-t border-gray-100 dark:border-white/5 flex gap-3">
                        <button @click="showResolveModal = false"
                            class="flex-1 py-2.5 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-white font-bold rounded-xl transition-colors">
                            Cancel
                        </button>
                        <button @click="confirmResolve" :disabled="!resolutionType"
                            class="flex-1 py-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold rounded-xl transition-colors">
                            Mark Resolved
                        </button>
                    </div>
                </div>
            </div>
        </Teleport>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const activeFilter = ref('All')
const showDetailsModal = ref(false)
const showResolveModal = ref(false)
const selectedTicket = ref(null)
const resolutionType = ref('')
const resolutionNotes = ref('')

const filters = [
    { label: 'All' },
    { label: 'Anger Detected' },
    { label: 'Legal Risks' },
    { label: 'Damage Claims' },
    { label: 'Payment Dispute' },
]

const tickets = ref([
    { id: 1, customer: 'Michael Scott', orderId: 'MV-1029', reason: 'Legal Threat', badgeClass: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400', sentimentScore: 92, time: '10m ago', recommendation: 'Immediately escalate to the legal team. Do not engage further without supervisor present. Offer a full refund to de-escalate.' },
    { id: 2, customer: 'Dwight Schrute', orderId: 'MV-9921', reason: 'Damage Claim', badgeClass: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400', sentimentScore: 78, time: '1h ago', recommendation: 'Request photos of damage. Offer partial refund or replacement. Log RMA claim in the system.' },
    { id: 3, customer: 'Jim Halpert', orderId: 'MV-3321', reason: 'Bot Failure', badgeClass: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400', sentimentScore: 65, time: '2h ago', recommendation: 'Apologize for the bot failure. Transfer to a live human agent for full resolution.' },
    { id: 4, customer: 'Pam Beesly', orderId: 'MV-4411', reason: 'Payment Dispute', badgeClass: 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400', sentimentScore: 50, time: '3h ago', recommendation: 'Review payment gateway logs. Confirm with finance team before issuing any credit.' },
])

const filteredTickets = computed(() => {
    if (activeFilter.value === 'All') return tickets.value
    return tickets.value.filter(t => t.reason.includes(activeFilter.value.replace('Detected', 'Threat').trim()))
})

function openDetailsModal(ticket) {
    selectedTicket.value = ticket
    showDetailsModal.value = true
}

function openResolveModal(ticket) {
    selectedTicket.value = ticket
    resolutionType.value = ''
    resolutionNotes.value = ''
    showResolveModal.value = true
}

function confirmResolve() {
    if (!resolutionType.value) return
    // Remove ticket from list
    const idx = tickets.value.findIndex(t => t.id === selectedTicket.value.id)
    if (idx !== -1) tickets.value.splice(idx, 1)
    showResolveModal.value = false
    selectedTicket.value = null
}
</script>
