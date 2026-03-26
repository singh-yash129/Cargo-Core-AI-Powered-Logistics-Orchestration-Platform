<template>
    <div class="space-y-6">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Support Tickets</h2>
                <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage and track all support requests</p>
            </div>
            <div class="flex gap-2">
                <div class="relative hidden sm:block">
                    <input v-model="searchQuery" type="text" placeholder="Search tickets..."
                        class="w-64 bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-purple-500 transition-colors shadow-sm">
                    <span class="material-symbols-outlined absolute left-3 top-2.5 text-gray-400 text-lg">search</span>
                </div>
                <button @click="showNewTicketModal = true"
                    class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg flex items-center gap-2 transition-colors shadow-sm text-sm">
                    <span class="material-symbols-outlined text-sm">add</span> <span class="hidden sm:inline">New
                        Ticket</span>
                </button>
            </div>
        </div>

        <!-- Kanban Board -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 pb-4">
            <!-- New Column -->
            <div
                class="bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 p-4 rounded-xl flex flex-col shadow-sm">
                <div class="flex justify-between items-center mb-4">
                    <h3
                        class="font-bold text-gray-900 dark:text-white flex items-center gap-2 text-sm uppercase tracking-wider">
                        <span class="w-2 h-2 rounded-full bg-blue-500"></span> New
                    </h3>
                    <span
                        class="bg-white dark:bg-white/10 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full text-xs font-bold shadow-sm">{{
                            newTickets.length }}</span>
                </div>
                <div class="space-y-3 flex-1 overflow-y-auto max-h-[calc(100vh-300px)] custom-scrollbar pr-1">
                    <div v-for="ticket in newTickets" :key="ticket.id"
                        class="bg-white dark:bg-black/20 p-4 rounded-xl border border-gray-200 dark:border-white/10 hover:border-blue-400 dark:hover:border-blue-500/50 cursor-pointer transition-all group shadow-sm flex flex-col gap-3"
                        @click="openTicketModal(ticket)">
                        <div class="flex justify-between items-start">
                            <span
                                class="text-xs text-blue-600 dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-500/10 px-2 py-0.5 rounded">{{
                                ticket.id }}</span>
                            <span class="text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider"
                                :class="ticket.priorityClass">{{
                                    ticket.priority }}</span>
                        </div>
                        <div>
                            <h4 class="text-gray-900 dark:text-white font-bold text-sm mb-1 leading-snug">{{
                                ticket.title }}</h4>
                            <p class="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{{ ticket.description }}
                            </p>
                        </div>
                        <div class="grid grid-cols-2 gap-2 text-xs border-t border-gray-100 dark:border-white/5 pt-3">
                            <div>
                                <span class="text-gray-400 block mb-0.5">Category</span>
                                <span class="text-gray-700 dark:text-gray-300 font-medium flex items-center gap-1">
                                    <span class="material-symbols-outlined text-[10px]">{{ ticket.categoryIcon }}</span>
                                    {{ ticket.category }}
                                </span>
                            </div>
                            <div>
                                <span class="text-gray-400 block mb-0.5">Customer</span>
                                <span class="text-gray-700 dark:text-gray-300 font-medium truncate">{{ ticket.customer
                                    }}</span>
                            </div>
                        </div>
                        <div class="flex items-center justify-between mt-auto pt-2">
                            <div class="flex items-center gap-2">
                                <div class="relative group/tooltip">
                                    <div
                                        class="w-6 h-6 rounded-full bg-gradient-to-br from-gray-200 dark:from-gray-700 to-gray-300 dark:to-gray-600 flex items-center justify-center text-[10px] text-gray-700 dark:text-white font-bold border border-white dark:border-gray-800">
                                        {{ ticket.assigneeInitials }}
                                    </div>
                                    <div
                                        class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-[10px] rounded opacity-0 group-hover/tooltip:opacity-100 whitespace-nowrap pointer-events-none transition-opacity">
                                        {{ ticket.assignee }}
                                    </div>
                                </div>
                                <span class="text-xs text-gray-500 dark:text-gray-500">{{ ticket.time }}</span>
                            </div>
                            <span v-if="ticket.slaBreach"
                                class="text-[10px] text-red-500 font-bold flex items-center gap-1">
                                <span class="material-symbols-outlined text-[12px]">warning</span> SLA Breach
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- In Progress Column -->
            <div
                class="bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 p-4 rounded-xl flex flex-col shadow-sm">
                <div class="flex justify-between items-center mb-4">
                    <h3
                        class="font-bold text-gray-900 dark:text-white flex items-center gap-2 text-sm uppercase tracking-wider">
                        <span class="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></span> In Progress
                    </h3>
                    <span
                        class="bg-white dark:bg-white/10 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full text-xs font-bold shadow-sm">{{
                            inProgressTickets.length }}</span>
                </div>
                <div class="space-y-3 flex-1 overflow-y-auto max-h-[calc(100vh-300px)] custom-scrollbar pr-1">
                    <div v-for="ticket in inProgressTickets" :key="ticket.id"
                        class="bg-white dark:bg-black/20 p-4 rounded-xl border border-gray-200 dark:border-white/10 hover:border-yellow-400 dark:hover:border-yellow-500/50 cursor-pointer transition-all group shadow-sm flex flex-col gap-3"
                        @click="openTicketModal(ticket)">
                        <div class="flex justify-between items-start">
                            <span
                                class="text-xs text-yellow-600 dark:text-yellow-400 font-bold bg-yellow-50 dark:bg-yellow-500/10 px-2 py-0.5 rounded">{{
                                ticket.id }}</span>
                            <span class="text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider"
                                :class="ticket.priorityClass">{{
                                    ticket.priority }}</span>
                        </div>
                        <div>
                            <h4 class="text-gray-900 dark:text-white font-bold text-sm mb-1 leading-snug">{{
                                ticket.title }}</h4>
                            <p class="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{{ ticket.description }}
                            </p>
                        </div>
                        <div class="grid grid-cols-2 gap-2 text-xs border-t border-gray-100 dark:border-white/5 pt-3">
                            <div>
                                <span class="text-gray-400 block mb-0.5">Category</span>
                                <span class="text-gray-700 dark:text-gray-300 font-medium flex items-center gap-1">
                                    <span class="material-symbols-outlined text-[10px]">{{ ticket.categoryIcon }}</span>
                                    {{ ticket.category }}
                                </span>
                            </div>
                            <div>
                                <span class="text-gray-400 block mb-0.5">Update</span>
                                <span class="text-gray-700 dark:text-gray-300 font-medium truncate text-[10px]">{{
                                    ticket.lastUpdate }}</span>
                            </div>
                        </div>
                        <div class="flex items-center justify-between mt-auto pt-2">
                            <div class="flex items-center gap-2">
                                <div class="relative group/tooltip">
                                    <div
                                        class="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-[10px] text-white font-bold border border-white dark:border-gray-800 shadow-sm">
                                        {{ ticket.assigneeInitials }}
                                    </div>
                                    <div
                                        class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-[10px] rounded opacity-0 group-hover/tooltip:opacity-100 whitespace-nowrap pointer-events-none transition-opacity">
                                        {{ ticket.assignee }}
                                    </div>
                                </div>
                                <span class="text-xs text-gray-500 dark:text-gray-500">{{ ticket.time }}</span>
                            </div>
                            <div class="w-16 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div class="h-full bg-yellow-400" :style="{ width: ticket.progress + '%' }"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Resolved Column -->
            <div
                class="bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 p-4 rounded-xl flex flex-col shadow-sm border-t-4 border-t-green-500/50">
                <div class="flex justify-between items-center mb-4">
                    <h3
                        class="font-bold text-gray-900 dark:text-white flex items-center gap-2 text-sm uppercase tracking-wider">
                        <span class="w-2 h-2 rounded-full bg-green-500"></span> Resolved
                    </h3>
                    <span
                        class="bg-white dark:bg-white/10 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full text-xs font-bold shadow-sm">{{
                            resolvedTickets.length }}</span>
                </div>
                <div class="space-y-3 flex-1 overflow-y-auto max-h-[calc(100vh-300px)] custom-scrollbar pr-1">
                    <div v-for="ticket in resolvedTickets" :key="ticket.id"
                        class="bg-white dark:bg-black/20 p-4 rounded-xl border border-gray-200 dark:border-white/10 hover:border-green-400 dark:hover:border-green-500/50 cursor-pointer transition-all opacity-70 hover:opacity-100 flex flex-col gap-3"
                        @click="openTicketModal(ticket)">
                        <div class="flex justify-between items-start">
                            <span
                                class="text-xs text-green-600 dark:text-green-400 font-bold bg-green-50 dark:bg-green-500/10 px-2 py-0.5 rounded">{{
                                ticket.id }}</span>
                        </div>
                        <div>
                            <h4
                                class="text-gray-900 dark:text-white font-bold text-sm mb-1 line-through decoration-gray-400 dark:decoration-gray-600">
                                {{ ticket.title }}</h4>
                            <p class="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 truncate">{{
                                ticket.resolutionInfo }}</p>
                        </div>
                        <div
                            class="flex items-center justify-between mt-auto pt-2 border-t border-gray-100 dark:border-white/5">
                            <div class="flex items-center gap-2">
                                <span class="material-symbols-outlined text-green-500 text-sm">check_circle</span>
                                <span
                                    class="text-[10px] text-gray-500 dark:text-gray-500 font-medium uppercase tracking-wider">Resolved</span>
                            </div>
                            <span class="text-xs text-gray-400 dark:text-gray-500">{{ ticket.time }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Ticket Detail Modal -->
        <Teleport to="body">
            <div v-if="showTicketModal"
                class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-6"
                @click.self="showTicketModal = false">
                <div
                    class="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-2xl shadow-2xl border border-gray-100 dark:border-white/10 overflow-hidden flex flex-col max-h-[90vh]">

                    <!-- Header -->
                    <div
                        class="p-6 border-b border-gray-100 dark:border-white/5 flex justify-between items-start bg-gray-50 dark:bg-white/5 shrink-0">
                        <div class="flex-1 pr-4">
                            <div class="flex items-center gap-3 mb-2">
                                <span class="text-xs font-mono font-bold px-2 py-0.5 rounded"
                                    :class="selectedTicket?.status === 'Resolved' ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' : 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400'">
                                    {{ selectedTicket?.id }}
                                </span>
                                <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border"
                                    :class="selectedTicket?.priorityClass">
                                    {{ selectedTicket?.priority }} Priority
                                </span>
                            </div>
                            <h3 class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white leading-tight">
                                {{ selectedTicket?.title }}
                            </h3>
                        </div>
                        <button @click="showTicketModal = false"
                            class="text-gray-400 hover:text-gray-600 dark:hover:text-white bg-white dark:bg-black/20 p-2 rounded-full border border-gray-200 dark:border-white/10 transition-colors">
                            <span class="material-symbols-outlined text-sm">close</span>
                        </button>
                    </div>

                    <!-- Body -->
                    <div class="p-6 overflow-y-auto custom-scrollbar flex-1 bg-white dark:bg-black/10">

                        <!-- Properties Grid -->
                        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                            <div>
                                <div class="text-[10px] uppercase font-bold text-gray-400 mb-1 tracking-wider">Status
                                </div>
                                <div
                                    class="font-medium text-sm text-gray-900 dark:text-white flex items-center gap-1.5">
                                    <span class="w-2 h-2 rounded-full"
                                        :class="selectedTicket?.status === 'New' ? 'bg-blue-500' : selectedTicket?.status === 'In Progress' ? 'bg-yellow-500' : 'bg-green-500'"></span>
                                    {{ selectedTicket?.status }}
                                </div>
                            </div>
                            <div>
                                <div class="text-[10px] uppercase font-bold text-gray-400 mb-1 tracking-wider">Assignee
                                </div>
                                <div class="font-medium text-sm text-gray-900 dark:text-white flex items-center gap-2">
                                    <div
                                        class="w-5 h-5 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-[8px] text-white font-bold">
                                        {{ selectedTicket?.assigneeInitials }}
                                    </div>
                                    {{ selectedTicket?.assignee }}
                                </div>
                            </div>
                            <div>
                                <div class="text-[10px] uppercase font-bold text-gray-400 mb-1 tracking-wider">Customer
                                </div>
                                <div
                                    class="font-medium text-sm text-gray-900 dark:text-white flex items-center gap-1.5">
                                    <span class="material-symbols-outlined text-sm text-gray-400">person</span>
                                    {{ selectedTicket?.customer || 'Unknown' }}
                                </div>
                            </div>
                            <div>
                                <div class="text-[10px] uppercase font-bold text-gray-400 mb-1 tracking-wider">Created
                                </div>
                                <div class="font-medium text-sm text-gray-900 dark:text-white">{{
                                    selectedTicket?.fullDate || 'Oct 24, 2024' }}</div>
                            </div>
                        </div>

                        <!-- Description -->
                        <div class="mb-8">
                            <div class="text-[10px] uppercase font-bold text-gray-400 mb-2 tracking-wider">Description
                            </div>
                            <div
                                class="bg-gray-50 dark:bg-white/5 rounded-xl p-4 border border-gray-100 dark:border-white/5">
                                <p class="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">
                                    {{ selectedTicket?.description }}
                                </p>
                            </div>
                        </div>

                        <!-- AI Analysis/Summary (Fake data for professionalism) -->
                        <div class="mb-2" v-if="selectedTicket?.status !== 'Resolved'">
                            <div class="flex items-center justify-between mb-2">
                                <div
                                    class="text-[10px] uppercase font-bold text-purple-600 dark:text-purple-400 tracking-wider flex items-center gap-1">
                                    <span class="material-symbols-outlined text-xs">smart_toy</span> AI Analysis
                                </div>
                                <span class="text-[10px] text-gray-400">{{ selectedTicket?.aiConfidence || '94' }}%
                                    Confidence</span>
                            </div>
                            <div
                                class="bg-purple-50 dark:bg-purple-500/10 rounded-xl p-4 border border-purple-100 dark:border-purple-500/20">
                                <ul class="text-xs text-purple-800 dark:text-purple-300 space-y-2 list-disc pl-4">
                                    <li>Recommended classification: <strong>{{ selectedTicket?.category }}</strong></li>
                                    <li>Sentiment detected: <strong>{{ selectedTicket?.sentiment || 'Neutral'
                                            }}</strong></li>
                                    <li>Action suggested: Review attached logs and respond within 2 hours to avoid SLA
                                        breach.</li>
                                </ul>
                            </div>
                        </div>

                    </div>

                    <!-- Footer Actions -->
                    <div
                        class="p-6 border-t border-gray-100 dark:border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50 dark:bg-white/5 shrink-0">
                        <div class="text-xs text-gray-500 hidden sm:block">
                            Last update: {{ selectedTicket?.lastUpdate || 'Just now' }}
                        </div>
                        <div class="flex gap-3 w-full sm:w-auto">
                            <button @click="showTicketModal = false"
                                class="flex-1 sm:flex-none px-6 py-2 bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/10 text-gray-700 dark:text-white font-bold rounded-lg transition-colors shadow-sm">
                                Close
                            </button>
                            <button v-if="selectedTicket?.status !== 'Resolved'" @click="resolveTicket"
                                class="flex-1 sm:flex-none px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2">
                                <span class="material-symbols-outlined text-sm">check_circle</span> Mark Resolved
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Teleport>

        <!-- New Ticket Modal -->
        <Teleport to="body">
            <div v-if="showNewTicketModal"
                class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                @click.self="showNewTicketModal = false">
                <div
                    class="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-lg shadow-2xl border border-gray-100 dark:border-white/10 overflow-hidden">
                    <div class="p-6 border-b border-gray-100 dark:border-white/5">
                        <h3 class="text-xl font-bold text-gray-900 dark:text-white">Create New Ticket</h3>
                        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Open a new support request manually</p>
                    </div>
                    <div class="p-6 space-y-5">
                        <div class="grid grid-cols-2 gap-4">
                            <div class="col-span-2">
                                <label
                                    class="block text-[10px] font-bold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">Title</label>
                                <input v-model="newTicket.title" type="text"
                                    class="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:border-purple-500 transition-colors placeholder-gray-400"
                                    placeholder="Brief summary of the issue" />
                            </div>
                            <div>
                                <label
                                    class="block text-[10px] font-bold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">Priority</label>
                                <select v-model="newTicket.priority"
                                    class="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:border-purple-500 transition-colors">
                                    <option>High</option>
                                    <option>Medium</option>
                                    <option>Low</option>
                                </select>
                            </div>
                            <div>
                                <label
                                    class="block text-[10px] font-bold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">Category</label>
                                <select v-model="newTicket.category"
                                    class="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:border-purple-500 transition-colors">
                                    <option>Technical Issue</option>
                                    <option>Billing Dispute</option>
                                    <option>Logistics Delay</option>
                                    <option>Account Access</option>
                                </select>
                            </div>
                            <div class="col-span-2">
                                <label
                                    class="block text-[10px] font-bold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">Customer
                                    / Vendor (Optional)</label>
                                <input v-model="newTicket.customer" type="text"
                                    class="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:border-purple-500 transition-colors placeholder-gray-400"
                                    placeholder="Name or ID" />
                            </div>
                            <div class="col-span-2">
                                <label
                                    class="block text-[10px] font-bold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">Description</label>
                                <textarea v-model="newTicket.description" rows="4"
                                    class="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg px-4 py-3 text-sm text-gray-900 dark:text-white outline-none focus:border-purple-500 transition-colors resize-none placeholder-gray-400"
                                    placeholder="Provide detailed information about the issue..."></textarea>
                            </div>
                        </div>
                    </div>
                    <div class="p-6 border-t border-gray-100 dark:border-white/5 flex gap-3 bg-gray-50 dark:bg-white/5">
                        <button @click="showNewTicketModal = false"
                            class="flex-1 py-2.5 bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/10 text-gray-700 dark:text-white font-bold rounded-lg transition-colors">
                            Cancel
                        </button>
                        <button @click="createTicket" :disabled="!newTicket.title"
                            class="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors shadow-sm">
                            Create Ticket
                        </button>
                    </div>
                </div>
            </div>
        </Teleport>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const showTicketModal = ref(false)
const showNewTicketModal = ref(false)
const selectedTicket = ref(null)
const searchQuery = ref('')

const newTicket = ref({ title: '', description: '', priority: 'Medium', category: 'Technical Issue', customer: '' })

// Richer mock data
const tickets = ref([
    {
        id: '#TK-9921', title: 'Login Issue on App',
        description: 'Driver unable to login after update v2.1. Keeps getting error 500 when tapping login button. Occurs on iOS 16 devices mostly.\n\nSteps to reproduce:\n1. Open app\n2. Enter credentials\n3. Tap login\n4. Error 500 appears',
        priority: 'High', priorityClass: 'bg-red-50 text-red-600 dark:bg-red-500/20 dark:text-red-400 border-red-200 dark:border-red-500/30',
        status: 'New', assignee: 'Alex Chen', assigneeInitials: 'AC',
        time: '2h ago', fullDate: 'Oct 24, 2024 at 09:41 AM',
        category: 'Technical Issue', categoryIcon: 'bug_report', customer: 'Driver D-402',
        sentiment: 'Negative', aiConfidence: '98', slaBreach: false
    },
    {
        id: '#TK-9924', title: 'Missing Invoice',
        description: 'Vendor Logistics Inc requires invoice for shipment #SH-8821. The automated email was sent but attachment was corrupted.',
        priority: 'Medium', priorityClass: 'bg-yellow-50 text-yellow-600 dark:bg-yellow-500/20 dark:text-yellow-400 border-yellow-200 dark:border-yellow-500/30',
        status: 'New', assignee: 'Sarah Jenkins', assigneeInitials: 'SJ',
        time: '4h ago', fullDate: 'Oct 24, 2024 at 07:15 AM',
        category: 'Billing', categoryIcon: 'receipt_long', customer: 'Logistics Inc',
        sentiment: 'Neutral', aiConfidence: '85', slaBreach: true
    },
    {
        id: '#TK-9930', title: 'GPS Not Updating',
        description: 'Live tracking not refreshing for Fleet unit #12. Last ping was 4 hours ago near Springfield.',
        priority: 'Low', priorityClass: 'bg-blue-50 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 border-blue-200 dark:border-blue-500/30',
        status: 'New', assignee: 'David Kim', assigneeInitials: 'DK',
        time: '5h ago', fullDate: 'Oct 24, 2024 at 06:10 AM',
        category: 'Logistics', categoryIcon: 'local_shipping', customer: 'Internal Fleet',
        sentiment: 'Neutral', aiConfidence: '92', slaBreach: false
    },
    {
        id: '#TK-8811', title: 'Damaged Cargo Claim',
        description: 'Investigating photos of damaged furniture upon arrival. Customer submitted 4 photos showing crushed box corners and scratched table surface. Waiting for driver incident report before processing refund.',
        priority: 'High', priorityClass: 'bg-red-50 text-red-600 dark:bg-red-500/20 dark:text-red-400 border-red-200 dark:border-red-500/30',
        status: 'In Progress', assignee: 'AI System', assigneeInitials: 'AI',
        time: '1d ago', fullDate: 'Oct 23, 2024 at 14:20 PM',
        category: 'Claims', categoryIcon: 'gavel', customer: 'John Doe',
        progress: 60, lastUpdate: 'Requested photos from driver', sentiment: 'Negative', aiConfidence: '95'
    },
    {
        id: '#TK-8799', title: 'Refund Not Received',
        description: 'Customer claims refund of $45.00 for order MV-900 was not credited to their bank account after 7 business days. Payment gateway shows status as "Completed".',
        priority: 'Medium', priorityClass: 'bg-yellow-50 text-yellow-600 dark:bg-yellow-500/20 dark:text-yellow-400 border-yellow-200 dark:border-yellow-500/30',
        status: 'In Progress', assignee: 'Jessica Park', assigneeInitials: 'JP',
        time: '2d ago', fullDate: 'Oct 22, 2024 at 11:05 AM',
        category: 'Billing', categoryIcon: 'payments', customer: 'Alice Smith',
        progress: 30, lastUpdate: 'Escalated to Stripe support', sentiment: 'Angry', aiConfidence: '88'
    },
    {
        id: '#TK-7744', title: 'Auto-Refund Processed',
        description: 'Order MV-3301 was automatically refunded due to "Late Delivery > 24h" rule.',
        priority: 'Low', priorityClass: 'bg-blue-50 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 border-blue-200 dark:border-blue-500/30',
        status: 'Resolved', assignee: 'AI System', assigneeInitials: 'AI',
        time: 'Yesterday', fullDate: 'Oct 23, 2024 at 09:00 AM',
        category: 'Automated Action', categoryIcon: 'smart_toy', customer: 'System Actions',
        resolutionInfo: 'Refund confirmed via Stripe API (#tr_123)', sentiment: 'Positive'
    },
])

const filteredTickets = computed(() => {
    let result = tickets.value
    if (searchQuery.value) {
        const q = searchQuery.value.toLowerCase()
        result = result.filter(t =>
            t.title.toLowerCase().includes(q) ||
            t.id.toLowerCase().includes(q) ||
            t.customer.toLowerCase().includes(q)
        )
    }
    return result
})

const newTickets = computed(() => filteredTickets.value.filter(t => t.status === 'New'))
const inProgressTickets = computed(() => filteredTickets.value.filter(t => t.status === 'In Progress'))
const resolvedTickets = computed(() => filteredTickets.value.filter(t => t.status === 'Resolved'))

function openTicketModal(ticket) {
    selectedTicket.value = ticket
    showTicketModal.value = true
}

function resolveTicket() {
    if (selectedTicket.value) {
        selectedTicket.value.status = 'Resolved'
        selectedTicket.value.resolutionInfo = 'Manually resolved by agent.'
        showTicketModal.value = false
    }
}

function createTicket() {
    if (!newTicket.value.title) return

    const priorityClasses = {
        'High': 'bg-red-50 text-red-600 dark:bg-red-500/20 dark:text-red-400 border-red-200 dark:border-red-500/30',
        'Medium': 'bg-yellow-50 text-yellow-600 dark:bg-yellow-500/20 dark:text-yellow-400 border-yellow-200 dark:border-yellow-500/30',
        'Low': 'bg-blue-50 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 border-blue-200 dark:border-blue-500/30',
    }

    const categoryIcons = {
        'Technical Issue': 'bug_report',
        'Billing Dispute': 'receipt_long',
        'Logistics Delay': 'local_shipping',
        'Account Access': 'lock',
    }

    const now = new Date();

    tickets.value.unshift({
        id: `#TK-${Math.floor(9000 + Math.random() * 999)}`,
        title: newTicket.value.title,
        description: newTicket.value.description || 'No description provided for this ticket.',
        priority: newTicket.value.priority,
        priorityClass: priorityClasses[newTicket.value.priority],
        status: 'New',
        assignee: 'Support Team',
        assigneeInitials: 'ST',
        time: 'Just now',
        fullDate: now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' at ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        category: newTicket.value.category,
        categoryIcon: categoryIcons[newTicket.value.category],
        customer: newTicket.value.customer || 'Guest User',
        sentiment: 'Neutral',
        aiConfidence: '80',
        slaBreach: false
    })

    newTicket.value = { title: '', description: '', priority: 'Medium', category: 'Technical Issue', customer: '' }
    showNewTicketModal.value = false
}
</script>

<style scoped>
/* Tooltip styling logic relies on Tailwind classes `group/tooltip` and `group-hover/tooltip:opacity-100` */
</style>
