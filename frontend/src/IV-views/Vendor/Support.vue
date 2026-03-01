<template>
    <div class="h-[calc(100vh-8rem)] flex flex-col md:flex-row gap-6">
        <!-- Quick Links -->
        <div class="w-full md:w-72 space-y-4 flex-shrink-0">
            <div class="glass-panel p-5 rounded-xl flex flex-col items-center text-center">
                <div class="w-14 h-14 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 mb-3">
                    <span class="material-symbols-outlined text-2xl">phone_in_talk</span>
                </div>
                <h3 class="font-bold text-gray-900 dark:text-white text-sm">Priority Support</h3>
                <p class="text-[10px] text-gray-400 mb-3">Dedicated line for enterprise partners.</p>
                <div class="text-base font-bold text-gray-900 dark:text-white">+91 1800 999 0000</div>
            </div>

            <div class="glass-panel p-5 rounded-xl">
                <h3 class="font-bold text-gray-900 dark:text-white text-sm mb-3">FAQ</h3>
                <ul class="space-y-2">
                    <li v-for="faq in faqs" :key="faq" class="text-xs text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 cursor-pointer flex gap-2 items-center">
                        <span class="material-symbols-outlined text-[12px]">chevron_right</span> {{ faq }}
                    </li>
                </ul>
            </div>

            <div class="glass-panel p-5 rounded-xl">
                <h3 class="font-bold text-gray-900 dark:text-white text-sm mb-2">Ticket Summary</h3>
                <div class="space-y-2 text-xs">
                    <div class="flex justify-between"><span class="text-gray-500">Open</span><span class="font-bold text-yellow-500">{{ openCount }}</span></div>
                    <div class="flex justify-between"><span class="text-gray-500">In Progress</span><span class="font-bold text-blue-500">{{ inProgressCount }}</span></div>
                    <div class="flex justify-between"><span class="text-gray-500">Resolved</span><span class="font-bold text-green-500">{{ resolvedCount }}</span></div>
                </div>
            </div>
        </div>

        <!-- Ticket System -->
        <div class="flex-1 flex flex-col min-w-0">
            <!-- Header -->
            <div class="glass-panel rounded-t-xl p-4 border-b border-gray-100 dark:border-white/5 flex justify-between items-center">
                <div class="flex items-center gap-3">
                    <h3 class="font-bold text-gray-900 dark:text-white text-sm">Support Tickets</h3>
                    <select v-model="statusFilter" class="text-xs bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded px-2 py-1 text-gray-700 dark:text-gray-300 focus:outline-none">
                        <option value="all">All</option>
                        <option value="Open">Open</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                    </select>
                </div>
                <button @click="openCreateModal" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-1">
                    <span class="material-symbols-outlined text-[14px]">add</span> Create Ticket
                </button>
            </div>

            <!-- Ticket List -->
            <div class="glass-panel rounded-b-xl flex-1 overflow-auto">
                <table class="w-full text-left text-sm min-w-[600px]">
                    <thead class="bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 uppercase text-[10px]">
                        <tr>
                            <th class="px-4 py-3">Ticket</th>
                            <th class="px-4 py-3">Subject</th>
                            <th class="px-4 py-3">Created</th>
                            <th class="px-4 py-3">Priority</th>
                            <th class="px-4 py-3">Status</th>
                            <th class="px-4 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100 dark:divide-white/5">
                        <tr v-if="filteredTickets.length === 0">
                            <td colspan="6" class="px-4 py-8 text-center text-gray-400 text-sm">No tickets found</td>
                        </tr>
                        <tr v-for="t in filteredTickets" :key="t.id" class="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer" @click="openTicketDetail(t)">
                            <td class="px-4 py-3 font-mono text-blue-500 text-xs font-bold">{{ t.id }}</td>
                            <td class="px-4 py-3 text-gray-900 dark:text-white text-xs font-medium">{{ t.subject }}</td>
                            <td class="px-4 py-3 text-gray-500 text-xs">{{ t.created }}</td>
                            <td class="px-4 py-3"><span class="text-[10px] font-bold uppercase" :class="priorityClass(t.priority)">{{ t.priority }}</span></td>
                            <td class="px-4 py-3"><span class="px-2 py-0.5 rounded text-[10px] font-bold" :class="ticketStatusClass(t.status)">{{ t.status }}</span></td>
                            <td class="px-4 py-3 text-right" @click.stop>
                                <button v-if="t.status !== 'Resolved'" @click="markResolved(t)" class="p-1 rounded hover:bg-green-500/10 text-gray-400 hover:text-green-500 transition-colors" title="Resolve">
                                    <span class="material-symbols-outlined text-[16px]">check_circle</span>
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Create Ticket Modal -->
        <Teleport to="body">
            <BaseModal :isOpen="showCreateModal" @close="showCreateModal = false">
                <template #title>Create Support Ticket</template>
                <div class="space-y-4">
                    <div>
                        <label class="block text-xs text-gray-500 dark:text-gray-400 mb-1.5">Subject *</label>
                        <input v-model="newTicket.subject" type="text" placeholder="Brief description of issue" class="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg p-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-blue-500">
                    </div>
                    <div>
                        <label class="block text-xs text-gray-500 dark:text-gray-400 mb-1.5">Priority</label>
                        <div class="flex gap-2">
                            <label v-for="p in ['Low', 'Medium', 'High']" :key="p" class="flex-1 text-center px-3 py-2 rounded-lg border cursor-pointer text-xs font-bold transition-colors" :class="newTicket.priority === p ? priorityBorderClass(p) : 'border-gray-200 dark:border-white/10 text-gray-500'">
                                <input type="radio" :value="p" v-model="newTicket.priority" class="sr-only">{{ p }}
                            </label>
                        </div>
                    </div>
                    <div>
                        <label class="block text-xs text-gray-500 dark:text-gray-400 mb-1.5">Related Shipment (optional)</label>
                        <select v-model="newTicket.shipmentId" class="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg p-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-blue-500">
                            <option value="">None</option>
                            <option v-for="s in store.shipments" :key="s.id" :value="s.id">{{ s.id }} — {{ s.origin }} → {{ s.destination }}</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-xs text-gray-500 dark:text-gray-400 mb-1.5">Description *</label>
                        <textarea v-model="newTicket.message" rows="4" placeholder="Provide details about your issue..." class="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg p-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 resize-none"></textarea>
                    </div>
                </div>
                <template #footer>
                    <button @click="showCreateModal = false" class="px-4 py-2 text-gray-500 text-sm">Cancel</button>
                    <button @click="submitTicket" :disabled="!newTicket.subject || !newTicket.message" class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors disabled:opacity-50">Submit Ticket</button>
                </template>
            </BaseModal>
        </Teleport>

        <!-- Ticket Detail Modal -->
        <Teleport to="body">
            <BaseModal :isOpen="!!detailTicket" @close="detailTicket = null">
                <template #title>{{ detailTicket?.id }} — {{ detailTicket?.subject }}</template>
                <div v-if="detailTicket" class="space-y-4">
                    <div class="flex gap-3 text-xs">
                        <span class="px-2 py-0.5 rounded font-bold" :class="ticketStatusClass(detailTicket.status)">{{ detailTicket.status }}</span>
                        <span class="font-bold uppercase" :class="priorityClass(detailTicket.priority)">{{ detailTicket.priority }}</span>
                        <span class="text-gray-400">{{ detailTicket.created }}</span>
                    </div>

                    <!-- Messages -->
                    <div class="space-y-3 max-h-64 overflow-y-auto pr-1">
                        <div v-for="(msg, idx) in detailTicket.replies" :key="idx" class="p-3 rounded-lg text-xs" :class="msg.from === 'You' ? 'bg-blue-500/10 ml-6' : 'bg-gray-100 dark:bg-white/5 mr-6'">
                            <div class="flex justify-between mb-1">
                                <span class="font-bold text-gray-900 dark:text-white">{{ msg.from }}</span>
                                <span class="text-gray-400 text-[10px]">{{ msg.time }}</span>
                            </div>
                            <p class="text-gray-600 dark:text-gray-300">{{ msg.message }}</p>
                        </div>
                    </div>

                    <!-- Reply -->
                    <div v-if="detailTicket.status !== 'Resolved'" class="flex gap-2">
                        <input v-model="replyText" type="text" placeholder="Type a reply..." class="flex-1 bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg p-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-blue-500" @keyup.enter="sendReply">
                        <button @click="sendReply" :disabled="!replyText.trim()" class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors disabled:opacity-50">Send</button>
                    </div>
                </div>
                <template #footer>
                    <button @click="detailTicket = null" class="px-4 py-2 text-gray-500 text-sm">Close</button>
                    <button v-if="detailTicket?.status !== 'Resolved'" @click="markResolved(detailTicket); detailTicket = null" class="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 transition-colors">Mark Resolved</button>
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
const statusFilter = ref('all')
const showCreateModal = ref(false)
const detailTicket = ref(null)
const replyText = ref('')

const faqs = ['How to bulk upload?', 'Invoice & billing cycles', 'API Integration guide', 'Damage claim process', 'Recurring schedule setup']

const newTicket = ref({ subject: '', priority: 'Medium', shipmentId: '', message: '' })

const filteredTickets = computed(() => {
    if (statusFilter.value === 'all') return store.tickets
    return store.tickets.filter(t => t.status === statusFilter.value)
})

const openCount = computed(() => store.tickets.filter(t => t.status === 'Open').length)
const inProgressCount = computed(() => store.tickets.filter(t => t.status === 'In Progress').length)
const resolvedCount = computed(() => store.tickets.filter(t => t.status === 'Resolved').length)

const priorityClass = p => ({
    High: 'text-red-500',
    Medium: 'text-yellow-500',
    Low: 'text-green-500',
}[p] || 'text-gray-500')

const priorityBorderClass = p => ({
    High: 'border-red-500 bg-red-500/10 text-red-500',
    Medium: 'border-yellow-500 bg-yellow-500/10 text-yellow-500',
    Low: 'border-green-500 bg-green-500/10 text-green-500',
}[p])

const ticketStatusClass = s => ({
    Open: 'bg-blue-500/20 text-blue-600 dark:text-blue-400',
    'In Progress': 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400',
    Resolved: 'bg-green-500/20 text-green-600 dark:text-green-400',
}[s] || 'bg-gray-500/20 text-gray-500')

function openCreateModal() {
    newTicket.value = { subject: '', priority: 'Medium', shipmentId: '', message: '' }
    showCreateModal.value = true
}

function submitTicket() {
    if (!newTicket.value.subject || !newTicket.value.message) return
    store.addTicket({
        subject: newTicket.value.subject,
        priority: newTicket.value.priority,
        shipmentId: newTicket.value.shipmentId || null,
        message: newTicket.value.message,
    })
    showCreateModal.value = false
    showToast('Ticket created successfully')
}

function openTicketDetail(t) {
    detailTicket.value = t
    replyText.value = ''
}

function sendReply() {
    if (!replyText.value.trim() || !detailTicket.value) return
    store.replyTicket(detailTicket.value.id, replyText.value.trim())
    replyText.value = ''
}

function markResolved(t) {
    store.resolveTicket(t.id)
    showToast(`Ticket ${t.id} resolved`)
}

function showToast(msg) {
    const el = document.createElement('div')
    el.className = 'fixed top-4 right-4 z-[9999] bg-green-500 text-white text-sm font-bold px-4 py-2 rounded-lg shadow-xl'
    el.textContent = msg
    document.body.appendChild(el)
    setTimeout(() => el.remove(), 3000)
}
</script>
