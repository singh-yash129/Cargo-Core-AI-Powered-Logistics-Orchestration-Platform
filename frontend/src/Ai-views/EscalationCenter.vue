<template>
    <div class="space-y-6">
        <!-- Header & Search -->
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                <h2 class="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <span class="material-symbols-outlined text-red-500 text-3xl">local_fire_department</span>
                    Escalation Center
                </h2>
                <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage, de-escalate, and resolve high-priority
                    customer issues</p>
            </div>
            <div class="flex gap-2 w-full sm:w-auto">
                <div class="relative w-full sm:w-64 relative">
                    <input v-model="searchQuery" type="text" placeholder="Search customer or Order ID..."
                        class="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-red-500 transition-colors shadow-sm">
                    <span class="material-symbols-outlined absolute left-3 top-2.5 text-gray-400 text-lg">search</span>
                </div>
            </div>
        </div>

        <!-- Metrics Cards -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            <div
                class="bg-white dark:bg-black/20 border border-gray-100 dark:border-white/5 p-5 rounded-xl shadow-sm border-t-4 border-t-red-500 relative overflow-hidden group">
                <div
                    class="absolute -right-4 -top-4 w-16 h-16 bg-red-500/10 rounded-full group-hover:scale-150 transition-transform duration-500 delay-100">
                </div>
                <div class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Total
                    Escalations</div>
                <div class="flex items-end gap-3">
                    <div class="text-3xl font-bold text-gray-900 dark:text-white">{{ tickets.length }}</div>
                    <div class="text-xs text-red-500 mb-1 font-bold flex items-center gap-1"><span
                            class="material-symbols-outlined text-[14px]">trending_up</span> 3 new today</div>
                </div>
            </div>
            <div
                class="bg-white dark:bg-black/20 border border-gray-100 dark:border-white/5 p-5 rounded-xl shadow-sm border-t-4 border-t-orange-500 relative overflow-hidden group">
                <div
                    class="absolute -right-4 -top-4 w-16 h-16 bg-orange-500/10 rounded-full group-hover:scale-150 transition-transform duration-500 delay-100">
                </div>
                <div
                    class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                    Avg Time to Resolve
                </div>
                <div class="flex items-end gap-3">
                    <div class="text-3xl font-bold text-gray-900 dark:text-white">4h</div>
                    <div class="text-xs text-orange-500 dark:text-orange-400 font-bold flex items-center gap-1">
                        <span class="material-symbols-outlined text-[14px]">warning</span> SLA Risk
                    </div>
                </div>
            </div>
            <div
                class="bg-white dark:bg-black/20 border border-gray-100 dark:border-white/5 p-5 rounded-xl shadow-sm border-t-4 border-t-purple-500 relative overflow-hidden group">
                <div
                    class="absolute -right-4 -top-4 w-16 h-16 bg-purple-500/10 rounded-full group-hover:scale-150 transition-transform duration-500 delay-100">
                </div>
                <div class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Unresolved
                </div>
                <div class="flex items-end gap-3">
                    <div class="text-3xl font-bold text-gray-900 dark:text-white">{{tickets.filter(t =>
                        !t.resolved).length}}</div>
                    <div class="text-xs text-purple-500 dark:text-purple-400 mb-1 font-bold">Needs Attention</div>
                </div>
            </div>
            <div
                class="bg-white dark:bg-black/20 border border-gray-100 dark:border-white/5 p-5 rounded-xl shadow-sm border-t-4 border-t-green-500 relative overflow-hidden group">
                <div
                    class="absolute -right-4 -top-4 w-16 h-16 bg-green-500/10 rounded-full group-hover:scale-150 transition-transform duration-500 delay-100">
                </div>
                <div class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Resolved
                    (24h)</div>
                <div class="flex items-end gap-3">
                    <div class="text-3xl font-bold text-gray-900 dark:text-white">8</div>
                    <div class="text-xs text-green-500 dark:text-green-400 mb-1 font-bold flex items-center gap-1"><span
                            class="material-symbols-outlined text-[14px]">check_circle</span> Great Progress</div>
                </div>
            </div>
        </div>

        <!-- Main Content Area: Filters + Table -->
        <div
            class="bg-white dark:bg-black/20 border border-gray-100 dark:border-white/5 rounded-xl overflow-hidden shadow-sm flex flex-col">
            <!-- Filter Bar -->
            <div
                class="p-4 bg-gray-50 dark:bg-white/5 border-b border-gray-100 dark:border-white/5 flex gap-2 overflow-x-auto no-scrollbar">
                <button v-for="f in filterTabs" :key="f.label" @click="activeListFilter = f.label"
                    class="px-4 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2"
                    :class="activeListFilter === f.label
                        ? 'bg-red-50 text-red-700 border border-red-200 shadow-sm dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30'
                        : 'bg-transparent text-gray-600 border border-transparent hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/10'">
                    <span class="material-symbols-outlined text-[16px]" v-if="f.icon">{{ f.icon }}</span> {{ f.label }}
                </button>
            </div>

            <!-- Escalations Table -->
            <div class="overflow-x-auto">
                <table class="w-full text-left text-sm min-w-[900px]">
                    <thead
                        class="bg-gray-100/50 dark:bg-black/40 text-gray-500 dark:text-gray-400 uppercase text-[10px] tracking-wider font-bold">
                        <tr>
                            <th class="p-4 pl-6 w-16">Status</th>
                            <th class="p-4">Customer Details</th>
                            <th class="p-4">Escalation Threat / Reason</th>
                            <th class="p-4">AI Sentiment & Priority</th>
                            <th class="p-4">Time Escalated</th>
                            <th class="p-4 text-right pr-6">Action</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100 dark:divide-white/5">
                        <tr v-for="ticket in filteredTickets" :key="ticket.id"
                            class="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group cursor-pointer"
                            @click="openDetailsModal(ticket)">

                            <!-- Status Indicator -->
                            <td class="p-4 pl-6">
                                <div class="w-3 h-3 rounded-full shadow-inner mx-auto"
                                    :class="ticket.priority === 'Critical' ? 'bg-red-500 animate-pulse' : (ticket.priority === 'High' ? 'bg-orange-500' : 'bg-yellow-500')">
                                </div>
                            </td>

                            <!-- Customer Details -->
                            <td class="p-4">
                                <div class="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <div
                                        class="w-7 h-7 rounded-sm bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center text-gray-700 dark:text-gray-300 font-bold text-xs uppercase shadow-sm">
                                        {{ticket.customer.split(' ').map(n => n[0]).join('')}}
                                    </div>
                                    <div>
                                        {{ ticket.customer }}
                                        <div class="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 font-normal">
                                            Order <span class="text-purple-600 dark:text-purple-400 font-mono">{{
                                                ticket.orderId }}</span></div>
                                    </div>
                                </div>
                            </td>

                            <!-- Reason -->
                            <td class="p-4">
                                <span
                                    class="px-2 py-1 rounded text-[10px] font-bold border inline-flex items-center gap-1 mt-1"
                                    :class="ticket.badgeClass">
                                    <span class="material-symbols-outlined text-[12px]">{{ ticket.icon }}</span> {{
                                        ticket.reason }}
                                </span>
                            </td>

                            <!-- Sentiment / Priority -->
                            <td class="p-4">
                                <div class="flex items-center gap-2 mb-1">
                                    <div
                                        class="flex-1 max-w-[100px] h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                        <div class="h-full transition-all duration-500"
                                            :class="ticket.sentimentScore > 80 ? 'bg-red-500' : (ticket.sentimentScore > 50 ? 'bg-orange-500' : 'bg-blue-500')"
                                            :style="{ width: ticket.sentimentScore + '%' }"></div>
                                    </div>
                                    <span class="text-[10px] font-bold"
                                        :class="ticket.sentimentScore > 80 ? 'text-red-500' : (ticket.sentimentScore > 50 ? 'text-orange-500' : 'text-blue-500')">
                                        {{ ticket.sentimentHeat }}
                                    </span>
                                </div>
                                <div class="text-[10px] text-gray-500 font-bold uppercase">{{ ticket.priority }}
                                    Priority</div>
                            </td>

                            <!-- Time -->
                            <td class="p-4">
                                <div class="text-sm font-bold text-gray-900 dark:text-gray-300">{{ ticket.time }}</div>
                                <div class="text-[10px] text-gray-400 mt-0.5">Assigned to: AI Escalation Bot</div>
                            </td>

                            <!-- Actions -->
                            <td class="p-4 pr-6 text-right">
                                <button @click.stop="openResolveModal(ticket)"
                                    class="px-3 py-1.5 bg-red-100 hover:bg-red-200 dark:bg-red-500/20 dark:hover:bg-red-500/30 text-red-700 dark:text-red-400 text-xs font-bold rounded-lg transition-colors border border-red-200 dark:border-red-500/30 tooltip-trigger relative shadow-sm">
                                    Resolve
                                </button>
                            </td>
                        </tr>
                        <tr v-if="filteredTickets.length === 0">
                            <td colspan="6" class="p-12 text-center text-gray-500 dark:text-gray-400">
                                <div class="flex flex-col items-center justify-center">
                                    <span
                                        class="material-symbols-outlined text-5xl mb-3 text-gray-300 dark:text-gray-600">volunteer_activism</span>
                                    <p class="text-lg font-bold">No High-Priority Escalations</p>
                                    <p class="text-sm mt-1">Inbox zero! Customer support is running smoothly.</p>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Details Modal w/ Conversation Context -->
        <Teleport to="body">
            <div v-if="showDetailsModal"
                class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-6"
                @click.self="showDetailsModal = false">
                <div
                    class="bg-gray-50 dark:bg-gray-900 flex flex-col rounded-2xl w-full max-w-4xl h-[90vh] shadow-2xl border border-gray-100 dark:border-white/10 overflow-hidden">

                    <!-- Header -->
                    <div
                        class="px-6 py-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-white/10 flex justify-between items-center shrink-0">
                        <div class="flex items-center gap-4">
                            <div
                                class="w-12 h-12 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white font-bold text-lg shadow-inner">
                                {{selectedTicket?.customer.split(' ').map(n => n[0]).join('')}}
                            </div>
                            <div>
                                <h3 class="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    {{ selectedTicket?.customer }}
                                </h3>
                                <div class="flex items-center gap-3 text-sm mt-1">
                                    <span class="text-gray-500 dark:text-gray-400">Escalated: <strong
                                            class="text-gray-900 dark:text-gray-200">{{ selectedTicket?.time
                                            }}</strong></span>
                                    <span class="text-gray-300 dark:text-gray-600">|</span>
                                    <span class="text-gray-500 dark:text-gray-400">Order: <strong
                                            class="text-purple-600 dark:text-purple-400 font-mono">{{
                                                selectedTicket?.orderId }}</strong></span>
                                </div>
                            </div>
                        </div>
                        <div class="flex items-center gap-3">
                            <span class="px-3 py-1.5 rounded-lg text-xs font-bold border"
                                :class="selectedTicket?.badgeClass">
                                <span class="material-symbols-outlined text-[12px] mr-1 align-sub">{{
                                    selectedTicket?.icon }}</span> {{ selectedTicket?.reason }}
                            </span>
                            <button @click="showDetailsModal = false"
                                class="text-gray-400 hover:text-gray-600 dark:hover:text-white p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition">
                                <span class="material-symbols-outlined">close</span>
                            </button>
                        </div>
                    </div>

                    <!-- Main Body Layout (Sidebar + Chat) -->
                    <div class="flex-1 flex overflow-hidden">

                        <!-- AI Analysis Sidebar -->
                        <div
                            class="w-1/3 bg-white dark:bg-black/20 border-r border-gray-200 dark:border-white/5 p-5 overflow-y-auto custom-scrollbar flex flex-col gap-6">

                            <div>
                                <h4
                                    class="text-[10px] uppercase tracking-wider font-bold text-gray-500 dark:text-gray-400 mb-2">
                                    Customer Profile</h4>
                                <div
                                    class="space-y-3 bg-gray-50 dark:bg-white/5 p-3 rounded-lg border border-gray-100 dark:border-white/5">
                                    <div class="flex justify-between text-sm"><span
                                            class="text-gray-500">Tier</span><strong
                                            class="text-purple-600 dark:text-purple-400">Gold Member</strong></div>
                                    <div class="flex justify-between text-sm"><span
                                            class="text-gray-500">LTV</span><strong
                                            class="text-green-600 dark:text-green-400">$3,450.00</strong></div>
                                    <div class="flex justify-between text-sm"><span class="text-gray-500">Prior
                                            Escalations</span><strong class="text-gray-900 dark:text-white">0</strong>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h4
                                    class="text-[10px] uppercase tracking-wider font-bold text-gray-500 dark:text-gray-400 mb-2">
                                    AI Sentiment Analysis</h4>
                                <div
                                    class="bg-gray-50 dark:bg-white/5 p-4 rounded-lg border border-gray-100 dark:border-white/5">
                                    <div class="text-2xl font-bold mb-1"
                                        :class="selectedTicket?.sentimentScore > 80 ? 'text-red-600' : 'text-orange-500'">
                                        {{ selectedTicket?.sentimentHeat }}</div>
                                    <p class="text-xs text-gray-600 dark:text-gray-400 leading-relaxed italic border-l-2 pl-2"
                                        :class="selectedTicket?.sentimentScore > 80 ? 'border-red-500' : 'border-orange-500'">
                                        "AI detected high levels of frustration. Customer escalated after bot failed to
                                        authorize a return outside of the 30-day window."
                                    </p>
                                </div>
                            </div>

                            <div class="mt-auto">
                                <h4
                                    class="text-[10px] uppercase tracking-wider font-bold text-gray-500 dark:text-gray-400 mb-2">
                                    AI Recommended Action</h4>
                                <div
                                    class="bg-purple-50 dark:bg-purple-500/10 p-4 rounded-lg border border-purple-200 dark:border-purple-500/20 shadow-inner">
                                    <span
                                        class="material-symbols-outlined text-purple-600 dark:text-purple-400 mb-2">auto_awesome</span>
                                    <p class="text-xs text-purple-900 dark:text-purple-200 leading-relaxed font-medium">
                                        {{ selectedTicket?.recommendation }}
                                    </p>
                                </div>
                            </div>

                        </div>

                        <!-- Chat Context -->
                        <div class="flex-1 bg-gray-50 dark:bg-transparent flex flex-col">
                            <div
                                class="p-4 bg-white/50 dark:bg-black/40 border-b border-gray-200 dark:border-white/5 flex items-center gap-2 shrink-0">
                                <span class="material-symbols-outlined text-gray-500 text-sm">history</span>
                                <h4 class="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                    Conversation History prior to Escalation</h4>
                            </div>

                            <div class="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                                <!-- Bot Message -->
                                <div class="flex gap-4">
                                    <div
                                        class="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0 border border-blue-200 dark:border-blue-800">
                                        <span
                                            class="material-symbols-outlined text-blue-600 dark:text-blue-400 text-sm">smart_toy</span>
                                    </div>
                                    <div
                                        class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-white/10 p-3 rounded-2xl rounded-tl-sm shadow-sm max-w-[85%]">
                                        <p class="text-sm text-gray-800 dark:text-gray-200">Hello! I see you are
                                            inquiring about order <span class="font-mono text-purple-500">{{
                                                selectedTicket?.orderId }}</span>.
                                            The return window for this item expired 5 days ago. Unfortunately, I cannot
                                            process a return for this item.</p>
                                    </div>
                                </div>
                                <!-- User Message -->
                                <div class="flex gap-4 flex-row-reverse">
                                    <div
                                        class="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center shrink-0 text-xs font-bold text-gray-600 dark:text-gray-300">
                                        {{selectedTicket?.customer.split(' ').map(n => n[0]).join('')}}
                                    </div>
                                    <div
                                        class="bg-gray-900 dark:bg-gray-200 p-3 rounded-2xl rounded-tr-sm shadow-sm max-w-[85%]">
                                        <p class="text-sm text-white dark:text-gray-900">This is unacceptable! The item
                                            broke on the second use. It's clearly defective. I've spent thousands of
                                            dollars here. Let me speak to a human NOW before I call my lawyer!</p>
                                    </div>
                                </div>
                                <!-- System Message -->
                                <div class="flex justify-center my-4">
                                    <span
                                        class="bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 text-[10px] font-bold px-3 py-1 rounded-full border border-red-200 dark:border-red-800 uppercase tracking-wider flex items-center gap-1">
                                        <span class="material-symbols-outlined text-[14px]">warning</span> Escalation
                                        criteria met
                                    </span>
                                </div>
                            </div>

                            <!-- Action Footer -->
                            <div
                                class="p-6 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-white/10 flex gap-3 shrink-0">
                                <button @click="showDetailsModal = false"
                                    class="flex-1 py-3 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-white font-bold rounded-xl transition-colors">
                                    Leave in Queue
                                </button>
                                <button @click="openResolveModal(selectedTicket); showDetailsModal = false"
                                    class="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-colors shadow-sm flex justify-center items-center gap-2">
                                    <span class="material-symbols-outlined text-[18px]">check_circle</span> Resolve
                                    Escalation
                                </button>
                            </div>
                        </div>

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
                    <div class="p-6 border-b border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/5">
                        <div class="flex items-center gap-3">
                            <div
                                class="p-2 bg-green-100 dark:bg-green-900/30 rounded-full text-green-600 dark:text-green-400">
                                <span class="material-symbols-outlined">gpp_good</span>
                            </div>
                            <div>
                                <h3 class="text-xl font-bold text-gray-900 dark:text-white">Resolve Escalation</h3>
                                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Ticket: {{
                                    selectedTicket?.customer }}</p>
                            </div>
                        </div>
                    </div>

                    <div
                        class="p-4 bg-purple-50 dark:bg-purple-900/10 border-b border-purple-100 dark:border-purple-500/20 text-xs text-purple-800 dark:text-purple-300 flex flex-col gap-2">
                        <div
                            class="flex items-center gap-1 font-bold border-b border-purple-200/50 dark:border-purple-500/20 pb-2 mb-1">
                            <span class="material-symbols-outlined text-[14px]">auto_awesome</span> Suggested Resolution
                        </div>
                        <p>{{ selectedTicket?.recommendation }}</p>
                        <button @click="autoFillResolution"
                            class="self-start mt-2 bg-white dark:bg-black/20 px-3 py-1 rounded shadow-sm hover:bg-gray-50 dark:hover:bg-black/40 font-bold border border-purple-200 dark:border-purple-500/30">Apply
                            Suggestion</button>
                    </div>

                    <div class="p-6 space-y-4">
                        <div>
                            <label
                                class="block text-[10px] font-bold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">Resolution
                                Action Taken</label>
                            <select v-model="resolutionType"
                                class="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white outline-none focus:border-green-500 transition-colors">
                                <option value="" disabled>Select resolution...</option>
                                <option>Exception Granted (Full Refund)</option>
                                <option>Partial Credit / Discount applied</option>
                                <option>Transferred to Voice Support</option>
                                <option>Legal Team Involved</option>
                                <option>Policy Enforced (No Action)</option>
                            </select>
                        </div>
                        <div>
                            <label
                                class="block text-[10px] font-bold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">Internal
                                Post-Mortem Notes</label>
                            <textarea v-model="resolutionNotes" rows="3"
                                class="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white outline-none focus:border-green-500 transition-colors resize-none"
                                placeholder="Summary of manual intervention..."></textarea>
                        </div>
                    </div>
                    <div class="p-6 border-t border-gray-100 dark:border-white/5 flex gap-3 bg-gray-50 dark:bg-white/5">
                        <button @click="showResolveModal = false"
                            class="flex-1 py-2.5 bg-white dark:bg-black/20 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-700 dark:text-white font-bold rounded-xl transition-colors border border-gray-200 dark:border-white/10 shadow-sm">
                            Cancel
                        </button>
                        <button @click="confirmResolve" :disabled="!resolutionType"
                            class="flex-1 py-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold rounded-xl transition-colors shadow-sm">
                            Submit & Close
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

const showDetailsModal = ref(false)
const showResolveModal = ref(false)
const selectedTicket = ref(null)
const resolutionType = ref('')
const resolutionNotes = ref('')

const filterTabs = [
    { label: 'All', icon: 'list' },
    { label: 'Legal Threats', icon: 'gavel' },
    { label: 'Damage Claims', icon: 'broken_image' },
    { label: 'Payment Dispute', icon: 'credit_card' },
    { label: 'Bot Failure', icon: 'smart_toy' }
]

const tickets = ref([
    { id: 1, customer: 'Michael Scott', orderId: 'MV-1029', reason: 'Legal Threat', icon: 'gavel', badgeClass: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20', sentimentScore: 92, sentimentHeat: 'Furious', priority: 'Critical', time: '10 mins ago', recommendation: 'Immediately escalate to the legal team. Do not engage further without supervisor present. Offer a full refund to de-escalate.' },
    { id: 2, customer: 'Dwight Schrute', orderId: 'MV-9921', reason: 'Damage Claim', icon: 'broken_image', badgeClass: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20', sentimentScore: 78, sentimentHeat: 'Angry', priority: 'High', time: '1 hour ago', recommendation: 'Request photos of damage. Offer partial refund or replacement. Log RMA claim in the system.' },
    { id: 3, customer: 'Jim Halpert', orderId: 'MV-3321', reason: 'Bot Failure', icon: 'smart_toy', badgeClass: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20', sentimentScore: 65, sentimentHeat: 'Frustrated', priority: 'Medium', time: '2 hours ago', recommendation: 'Apologize for the bot failure handling the return policy loop. Grant a one-time policy exception based on LTV.' },
    { id: 4, customer: 'Pam Beesly', orderId: 'MV-4411', reason: 'Payment Dispute', icon: 'credit_card', badgeClass: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20', sentimentScore: 50, sentimentHeat: 'Annoyed', priority: 'Medium', time: '3 hours ago', recommendation: 'Review payment gateway logs. Confirm with finance team before issuing any credit or disputing chargeback.' },
])

const filteredTickets = computed(() => {
    let result = tickets.value

    // Status Filter
    if (activeListFilter.value !== 'All') {
        result = result.filter(t => t.reason === activeListFilter.value)
    }

    // Text Search
    if (searchQuery.value) {
        const q = searchQuery.value.toLowerCase()
        result = result.filter(t =>
            t.customer.toLowerCase().includes(q) ||
            t.orderId.toLowerCase().includes(q)
        )
    }

    return result
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

function autoFillResolution() {
    resolutionType.value = 'Exception Granted (Full Refund)';
    resolutionNotes.value = 'Applied AI suggestion: ' + selectedTicket.value.recommendation;
}

function confirmResolve() {
    if (!resolutionType.value) return
    // Remove ticket from list visually to indicate resolve
    const idx = tickets.value.findIndex(t => t.id === selectedTicket.value.id)
    if (idx !== -1) tickets.value.splice(idx, 1)

    showResolveModal.value = false
    selectedTicket.value = null
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
