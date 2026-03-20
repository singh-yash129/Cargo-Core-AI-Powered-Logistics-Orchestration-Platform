<template>
    <div class="h-[calc(100vh-8rem)] flex gap-6">
        <!-- Conversation & Escalation Sidebar -->
        <div class="w-80 glass-panel rounded-xl flex flex-col overflow-hidden">
            <!-- Tabs -->
            <div class="flex border-b border-gray-200 dark:border-white/5">
                <button @click="activeTab = 'chats'" class="flex-1 py-3 text-sm font-bold text-center transition-colors"
                    :class="activeTab === 'chats' ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5'">Messages</button>
                <button @click="activeTab = 'escalations'"
                    class="flex-1 py-3 text-sm font-bold text-center transition-colors flex items-center justify-center gap-1"
                    :class="activeTab === 'escalations' ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5'">
                    Escalations <span v-if="filteredEscalations.length"
                        class="bg-red-500 text-white text-[10px] px-1.5 rounded-full">{{ filteredEscalations.length
                        }}</span>
                </button>
            </div>
            <div class="p-4 border-b border-gray-200 dark:border-white/5">
                <div class="relative">
                    <span
                        class="material-symbols-outlined absolute left-3 top-2.5 text-gray-400 dark:text-gray-500">search</span>
                    <input type="text" :placeholder="activeTab === 'chats' ? 'Search chats...' : 'Search tickets...'"
                        v-model="searchQuery"
                        class="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg py-2 pl-10 pr-4 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-primary/50 transition-colors">
                </div>
            </div>
            <div class="flex-1 overflow-y-auto no-scrollbar">
                <!-- Chats List -->
                <div v-if="activeTab === 'chats'">
                    <div v-for="chat in displayChats" :key="chat.id"
                        class="p-4 border-b border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer transition-colors"
                        :class="activeChatId === chat.id ? 'bg-primary/5 border-l-2 border-l-primary dark:bg-white/5' : ''"
                        @click="activeChatId = chat.id">
                        <div class="flex justify-between items-start mb-1">
                            <div class="font-bold text-gray-900 dark:text-white text-sm">{{ chat.name }}</div>
                            <div class="text-[10px] text-gray-500">{{ chat.time }}</div>
                        </div>
                        <div class="text-xs text-gray-500 dark:text-gray-400 truncate">{{ chat.lastMessage }}</div>
                    </div>
                </div>

                <!-- Escalations List -->
                <div v-if="activeTab === 'escalations'">
                    <div v-for="ticket in displayEscalations" :key="ticket.id"
                        class="p-4 border-b border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer transition-colors"
                        :class="activeTicketId === ticket.id ? 'bg-red-500/5 border-l-2 border-l-red-500 dark:bg-white/5' : ''"
                        @click="activeTicketId = ticket.id">
                        <div class="flex justify-between items-start mb-1">
                            <div class="font-bold text-gray-900 dark:text-white text-sm truncate pr-2">{{ ticket.title
                            }}</div>
                            <div class="text-[10px] text-gray-500 flex-shrink-0">{{ ticket.time }}</div>
                        </div>
                        <div class="flex items-center gap-2 mt-1">
                            <span class="px-2 py-0.5 rounded text-[10px] font-bold"
                                :class="ticket.priority === 'High' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'">
                                {{ ticket.priority }}
                            </span>
                            <span class="text-xs text-gray-500 truncate">From: {{ ticket.from }}</span>
                        </div>
                    </div>
                    <div v-if="filteredEscalations.length === 0" class="p-8 text-center text-sm text-gray-500">
                        No pending escalations.
                    </div>
                    <div v-else-if="displayEscalations.length === 0" class="p-8 text-center text-sm text-gray-500">
                        No escalations match "{{ searchQuery }}".
                    </div>
                </div>
            </div>

            <!-- Broadcast Button -->
            <div class="p-4 border-t border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-black/20">
                <button @click="isBroadcastModalOpen = true"
                    class="w-full py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg font-bold text-sm shadow-sm flex items-center justify-center gap-2 transition-transform hover:scale-[1.02]">
                    <span class="material-symbols-outlined text-[18px]">campaign</span> System Broadcast
                </button>
            </div>
        </div>

        <!-- Active Chat / Ticket Area -->
        <div class="flex-1 glass-panel rounded-xl flex flex-col overflow-hidden">
            <template v-if="activeTab === 'chats' && activeChat">
                <div
                    class="p-4 border-b border-gray-200 dark:border-white/5 flex justify-between items-center bg-gray-50/50 dark:bg-black/20">
                    <div class="flex items-center gap-3">
                        <div
                            class="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold shadow-sm">
                            {{ activeChat.name.substring(0, 2).toUpperCase() }}</div>
                        <div>
                            <div class="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                {{ activeChat.name }}
                                <span v-if="activeChat.muted"
                                    class="material-symbols-outlined text-gray-400 text-[16px]"
                                    title="Chat Muted">notifications_off</span>
                            </div>
                            <div class="text-xs flex items-center gap-2">
                                <span class="flex items-center gap-1"
                                    :class="activeChat.status === 'Online' ? 'text-green-500' : 'text-gray-400'">
                                    <span class="w-1.5 h-1.5 rounded-full"
                                        :class="activeChat.status === 'Online' ? 'bg-green-500' : 'bg-gray-400'"></span>
                                    {{ activeChat.status }}
                                </span>
                                <span v-if="activeChat.phone"
                                    class="text-gray-400 border-l border-gray-300 dark:border-gray-600 pl-2 font-mono">{{
                                        activeChat.phone }}</span>
                            </div>
                        </div>
                    </div>
                    <div class="flex gap-2 relative">
                        <button @click="isMenuOpen = !isMenuOpen"
                            class="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"><span
                                class="material-symbols-outlined">more_vert</span></button>

                        <!-- Dropdown Menu -->
                        <div v-if="isMenuOpen"
                            class="absolute right-0 top-12 w-48 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-100 dark:border-white/10 overflow-hidden z-50 animate-fade-in-up origin-top-right">
                            <button
                                class="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300 flex items-center gap-3 transition-colors"
                                @click="handleViewProfile">
                                <span class="material-symbols-outlined text-[18px] text-gray-400">person</span> View
                                Profile
                            </button>
                            <button
                                class="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300 flex items-center gap-3 transition-colors"
                                @click="handleMuteChat">
                                <span class="material-symbols-outlined text-[18px] text-gray-400">{{ activeChat.muted ?
                                    'notifications' : 'notifications_off' }}</span> {{ activeChat.muted ? 'Unmute Chat'
                                        : 'Mute Chat' }}
                            </button>
                            <button
                                class="w-full text-left px-4 py-3 text-sm hover:bg-red-50 dark:hover:bg-red-900/10 text-red-600 dark:text-red-400 flex items-center gap-3 transition-colors"
                                @click="handleDeleteChat">
                                <span class="material-symbols-outlined text-[18px]">delete</span> Delete Chat
                            </button>
                            <!-- Click Outside Overlay -->
                            <div v-if="isMenuOpen" @click="isMenuOpen = false" class="fixed inset-0 z-[-1]"></div>
                        </div>
                    </div>
                </div>

                <div ref="chatHistoryContainer"
                    class="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/30 dark:bg-black/10 scroll-smooth">
                    <div v-for="msg in activeChat.messages" :key="msg.id" class="flex gap-3"
                        :class="{ 'flex-row-reverse': msg.sender === 'me' }">
                        <div class="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold shadow-sm"
                            :class="msg.sender === 'me' ? 'bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-white' : 'bg-purple-600 text-white'">
                            {{ msg.sender === 'me' ? 'ME' : activeChat.name.substring(0, 2).toUpperCase() }}
                        </div>
                        <div class="max-w-[70%]">
                            <div class="p-3 rounded-xl text-sm shadow-sm"
                                :class="msg.sender === 'me'
                                    ? 'bg-primary/10 border border-primary/20 dark:bg-primary/20 dark:border-primary/30 rounded-tr-none text-gray-900 dark:text-white'
                                    : 'bg-white border border-gray-100 dark:bg-white/5 dark:border-white/10 rounded-tl-none text-gray-700 dark:text-gray-300'">
                                {{ msg.text }}
                            </div>
                            <div class="text-[10px] text-gray-400 mt-1" :class="{ 'text-right': msg.sender === 'me' }">
                                {{
                                    msg.time }}</div>
                        </div>
                    </div>
                </div>

                <div class="p-4 bg-gray-50 dark:bg-black/20 border-t border-gray-200 dark:border-white/5">
                    <div class="relative">
                        <input v-model="messageInput" @keyup.enter="sendMessage" type="text"
                            placeholder="Type a message..."
                            class="w-full bg-white border border-gray-200 dark:bg-white/5 dark:border-white/10 rounded-full py-3 pl-4 pr-12 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all shadow-sm">
                        <button @click="sendMessage"
                            class="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center bg-primary rounded-full text-white hover:bg-primary/90 hover:scale-105 transition-all shadow-sm">
                            <span class="material-symbols-outlined text-[18px] ml-0.5">send</span>
                        </button>
                    </div>
                </div>
            </template>

            <!-- Escalation Detail View -->
            <template v-else-if="activeTab === 'escalations' && activeTicket">
                <div
                    class="p-6 border-b border-gray-200 dark:border-white/5 bg-gray-50/50 dark:bg-black/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <div class="flex items-center gap-3 mb-2">
                            <span
                                class="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300">Ticket
                                #{{ activeTicket.id }}</span>
                            <span class="px-2 py-0.5 rounded text-[10px] font-bold"
                                :class="activeTicket.priority === 'High' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'">
                                {{ activeTicket.priority }} Priority
                            </span>
                        </div>
                        <h2 class="text-xl font-bold text-gray-900 dark:text-white">{{ activeTicket.title }}</h2>
                    </div>
                    <div class="flex gap-2 shrink-0">
                        <button @click="resolveTicket('Approved')"
                            class="px-5 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold text-sm transition-colors shadow-sm flex items-center gap-2">
                            <span class="material-symbols-outlined text-[20px]">check_circle</span> Approve
                        </button>
                        <button @click="resolveTicket('Denied')"
                            class="px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold text-sm transition-colors shadow-sm flex items-center gap-2">
                            <span class="material-symbols-outlined text-[20px]">cancel</span> Deny
                        </button>
                    </div>
                </div>
                <div class="flex-1 p-6 overflow-y-auto bg-gray-50/30 dark:bg-black/10">
                    <div
                        class="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 p-6 rounded-2xl shadow-sm space-y-6">
                        <div class="flex items-center gap-4 pb-6 border-b border-gray-100 dark:border-white/10">
                            <div
                                class="w-12 h-12 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center font-bold text-gray-700 dark:text-white text-lg shadow-inner">
                                {{ activeTicket.from.substring(0, 2).toUpperCase() }}</div>
                            <div>
                                <div class="font-bold text-gray-900 dark:text-white text-lg">{{ activeTicket.from }}
                                </div>
                                <div class="text-sm text-gray-500">{{ activeTicket.role }} • <span
                                        class="font-mono text-xs">{{ activeTicket.time }}</span></div>
                            </div>
                        </div>
                        <div>
                            <h4 class="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                                <span class="material-symbols-outlined text-[18px]">report</span> Issue Description
                            </h4>
                            <p class="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{{
                                activeTicket.description }}</p>
                        </div>
                        <div
                            class="bg-blue-50 dark:bg-blue-900/10 p-5 rounded-xl border border-blue-100 dark:border-blue-500/20">
                            <h4
                                class="text-xs font-bold text-blue-800 dark:text-blue-300 uppercase tracking-wider mb-2">
                                Requested Action Override</h4>
                            <p
                                class="text-sm font-mono text-blue-900 dark:text-blue-200 font-bold bg-white/50 dark:bg-black/20 p-2 rounded">
                                {{ activeTicket.actionDetails }}</p>
                        </div>
                    </div>
                </div>
            </template>
            <div v-else class="flex-1 flex items-center justify-center text-gray-400">
                Select an item from the sidebar to view details.
            </div>
        </div>

        <!-- Profile Modal -->
        <div v-if="isProfileModalOpen && activeChat"
            class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
            <div
                class="bg-white dark:bg-gray-900 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-gray-100 dark:border-white/10 flex flex-col md:flex-row h-[500px]">
                <!-- Left: Profile Details -->
                <div
                    class="w-full md:w-1/2 p-8 bg-gray-50 dark:bg-white/5 flex flex-col items-center justify-center text-center border-r border-gray-100 dark:border-white/10">
                    <div
                        class="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-3xl font-bold text-white mb-4 shadow-lg shadow-purple-500/30">
                        {{ activeChat.name.substring(0, 2).toUpperCase() }}
                    </div>
                    <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-1">{{ activeChat.name }}</h3>
                    <p class="text-sm text-gray-500 mb-4">{{ activeChat.role || 'Logistic Partner' }}</p>

                    <div class="flex gap-2 mb-6">
                        <span
                            class="px-3 py-1 rounded-full text-xs font-bold border border-gray-200 dark:border-white/10"
                            :class="activeChat.status === 'Online' ? 'bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'">
                            {{ activeChat.status }}
                        </span>
                        <span v-if="activeChat.muted"
                            class="px-3 py-1 rounded-full text-xs font-bold bg-yellow-50 text-yellow-600 border border-yellow-200 dark:bg-yellow-500/10 dark:text-yellow-400 dark:border-yellow-500/20 flex items-center gap-1">
                            <span class="material-symbols-outlined text-[14px]">notifications_off</span> Muted
                        </span>
                    </div>

                    <div class="w-full space-y-3 text-left">
                        <div class="flex justify-between text-sm py-2 border-b border-gray-200 dark:border-white/10">
                            <span class="text-gray-500">Phone</span>
                            <span class="font-mono text-gray-900 dark:text-white">{{ activeChat.phone || 'N/A' }}</span>
                        </div>
                        <div class="flex justify-between text-sm py-2 border-b border-gray-200 dark:border-white/10">
                            <span class="text-gray-500">Email</span>
                            <span class="font-mono text-gray-900 dark:text-white">user@logitics.co</span>
                        </div>
                        <div class="flex justify-between text-sm py-2 border-b border-gray-200 dark:border-white/10">
                            <span class="text-gray-500">Member Since</span>
                            <span class="text-gray-900 dark:text-white">Oct 2023</span>
                        </div>
                    </div>
                </div>

                <!-- Right: Stats / Actions -->
                <div class="w-full md:w-1/2 p-8 flex flex-col">
                    <div class="flex justify-between items-center mb-6">
                        <h4 class="font-bold text-gray-900 dark:text-white">Performance Metrics</h4>
                        <button @click="isProfileModalOpen = false" class="text-gray-400 hover:text-gray-600"><span
                                class="material-symbols-outlined">close</span></button>
                    </div>

                    <div class="space-y-4 mb-auto">
                        <div
                            class="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-500/20">
                            <div class="flex justify-between items-center mb-1">
                                <span class="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase">Efficiency
                                    Score</span>
                                <span class="text-xl font-black text-gray-900 dark:text-white">94%</span>
                            </div>
                            <div class="w-full h-1.5 bg-blue-200 dark:bg-blue-900/30 rounded-full overflow-hidden">
                                <div class="h-full bg-blue-500 w-[94%]"></div>
                            </div>
                        </div>
                        <div
                            class="bg-purple-50 dark:bg-purple-900/10 p-4 rounded-xl border border-purple-100 dark:border-purple-500/20">
                            <div class="flex justify-between items-center mb-1">
                                <span class="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase">On-Time
                                    Deliveries</span>
                                <span class="text-xl font-black text-gray-900 dark:text-white">1,240</span>
                            </div>
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-3 mt-6">
                        <button @click="handleMuteChat"
                            class="px-4 py-3 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-700 dark:text-gray-300 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2">
                            <span class="material-symbols-outlined text-[18px]">{{ activeChat.muted ? 'notifications' :
                                'notifications_off' }}</span> {{ activeChat.muted ? 'Unmute' : 'Mute' }}
                        </button>
                        <button @click="isProfileModalOpen = false"
                            class="px-4 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2">
                            <span class="material-symbols-outlined text-[18px]">chat</span> Message
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Delete Modal -->
        <div v-if="isDeleteModalOpen"
            class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
            <div
                class="bg-white dark:bg-gray-900 w-full max-w-sm rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-white/10 text-center">
                <div
                    class="w-16 h-16 bg-red-100 dark:bg-red-900/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span class="material-symbols-outlined text-3xl">warning</span>
                </div>
                <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-2">Delete Conversation?</h3>
                <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">Are you sure you want to delete the chat with
                    <span class="font-bold text-gray-900 dark:text-white">{{ activeChat?.name }}</span>? This action
                    cannot be
                    undone.
                </p>

                <div class="flex gap-3 justify-center">
                    <button @click="isDeleteModalOpen = false"
                        class="px-5 py-2.5 rounded-xl font-bold text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 dark:text-gray-300 transition-colors">Cancel</button>
                    <button @click="confirmDeleteChat"
                        class="px-5 py-2.5 rounded-xl font-bold text-sm text-white bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/30 transition-colors">Delete
                        Chat</button>
                </div>
            </div>
        </div>

        <!-- Broadcast Modal -->
        <div v-if="isBroadcastModalOpen"
            class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
            <div
                class="bg-white dark:bg-card-dark w-full max-w-md rounded-2xl shadow-xl border border-gray-200 dark:border-white/10 overflow-hidden">
                <div
                    class="p-5 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-gray-50/50 dark:bg-black/20">
                    <h3 class="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <span class="material-symbols-outlined text-purple-600">campaign</span> New System Broadcast
                    </h3>
                    <button @click="isBroadcastModalOpen = false"
                        class="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"><span
                            class="material-symbols-outlined">close</span></button>
                </div>
                <div class="p-6 space-y-5">
                    <div class="space-y-1.5">
                        <label class="text-xs font-bold text-gray-500 uppercase tracking-wider">Target Audience</label>
                        <select v-model="broadcastForm.audience"
                            class="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl p-3 text-sm text-gray-900 dark:text-white outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 shadow-sm transition-all">
                            <option value="all" class="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">All Personnel</option>
                            <option value="drivers" class="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">All Drivers (On-Duty)</option>
                            <option value="warehouses" class="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">All Warehouse Managers</option>
                        </select>
                    </div>
                    <div class="space-y-1.5">
                        <label class="text-xs font-bold text-gray-500 uppercase tracking-wider">Alert Type</label>
                        <select v-model="broadcastForm.type"
                            class="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl p-3 text-sm text-gray-900 dark:text-white outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 shadow-sm transition-all">
                            <option value="info" class="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">General Information</option>
                            <option value="warning" class="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">System Warning</option>
                            <option value="emergency" class="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">Emergency Recall / Halt</option>
                        </select>
                    </div>
                    <div class="space-y-1.5">
                        <label class="text-xs font-bold text-gray-500 uppercase tracking-wider">Message Details</label>
                        <textarea v-model="broadcastForm.message" rows="4" placeholder="Enter broadcast message here..."
                            class="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl p-3 text-sm text-gray-900 dark:text-white outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 shadow-sm transition-all resize-none"></textarea>
                    </div>
                </div>
                <div
                    class="p-5 border-t border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-black/20 flex justify-end gap-3">
                    <button @click="isBroadcastModalOpen = false"
                        class="px-5 py-2.5 rounded-xl text-gray-600 bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 dark:text-gray-300 font-bold text-sm transition-colors">Cancel</button>
                    <button @click="sendBroadcast"
                        class="px-6 py-2.5 rounded-xl font-bold text-sm text-white shadow-lg flex items-center gap-2 transition-all hover:scale-105"
                        :class="broadcastForm.type === 'emergency' ? 'bg-red-500 hover:bg-red-600 shadow-red-500/30' : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-purple-500/30'">
                        <span class="material-symbols-outlined text-[18px]">send_time_extension</span> Deploy Alert
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, nextTick, watch } from 'vue'
import { useLogisticStore } from '@/stores/logisticStore'
import { storeToRefs } from 'pinia'

const store = useLogisticStore()
const { filteredChats, filteredEscalations } = storeToRefs(store)

const activeTab = ref('chats')
const activeChatId = ref(1)
const activeTicketId = ref(1)
const searchQuery = ref('')
const messageInput = ref('')
const chatHistoryContainer = ref(null)
const isMenuOpen = ref(false)
const isProfileModalOpen = ref(false)
const isDeleteModalOpen = ref(false)
const isBroadcastModalOpen = ref(false)

const broadcastForm = ref({
    audience: 'all',
    type: 'info',
    message: ''
})

const activeChat = computed(() => {
    return filteredChats.value.find(c => c.id === activeChatId.value) || (filteredChats.value.length ? filteredChats.value[0] : null)
})

const activeTicket = computed(() => {
    return filteredEscalations.value?.find(t => t.id === activeTicketId.value) || (filteredEscalations.value?.length ? filteredEscalations.value[0] : null)
})

const displayChats = computed(() => {
    if (activeTab.value !== 'chats') return []
    if (!searchQuery.value) return filteredChats.value
    return filteredChats.value.filter(c => c.name.toLowerCase().includes(searchQuery.value.toLowerCase()))
})

const displayEscalations = computed(() => {
    if (activeTab.value !== 'escalations') return []
    if (!searchQuery.value) return filteredEscalations.value || []

    const query = searchQuery.value.toLowerCase()
    return (filteredEscalations.value || []).filter(t =>
        t.title.toLowerCase().includes(query) ||
        t.from.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query)
    )
})

const scrollToBottom = async () => {
    await nextTick()
    if (chatHistoryContainer.value) {
        chatHistoryContainer.value.scrollTop = chatHistoryContainer.value.scrollHeight
    }
}

const selectChat = (id) => {
    activeChatId.value = id
    scrollToBottom()
}

const sendMessage = () => {
    const text = messageInput.value.trim()
    if (!text || !activeChat.value) return

    // Add message to store (assuming nested object mutation is reactive)
    activeChat.value.messages.push({
        id: Date.now(),
        text: text,
        sender: 'me',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    })

    activeChat.value.lastMessage = text
    activeChat.value.time = 'Just now'

    messageInput.value = ''
    scrollToBottom()

    if (activeChat.value.id !== 4 && !activeChat.value.muted) { // Don't reply on broadcast
        setTimeout(() => {
            if (!activeChat.value) return
            activeChat.value.messages.push({
                id: Date.now() + 1,
                text: 'Got it via system.',
                sender: 'other',
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            })
            scrollToBottom()
        }, 3000)
    }
}

// Watch active chat to scroll on change
watch(activeChatId, () => {
    scrollToBottom()
})

const handleViewProfile = () => {
    isMenuOpen.value = false
    isProfileModalOpen.value = true
}

const handleMuteChat = () => {
    isMenuOpen.value = false
    if (activeChat.value) {
        activeChat.value.muted = !activeChat.value.muted
        // In a real app, this would persist to the store/backend
    }
}

const handleDeleteChat = () => {
    isMenuOpen.value = false
    isDeleteModalOpen.value = true
}

const confirmDeleteChat = () => {
    if (activeChat.value) {
        // Find in store's chats array and remove (assuming store.chats is accessible)
        const index = store.chats.findIndex(c => c.id === activeChat.value.id)
        if (index !== -1) {
            store.chats.splice(index, 1)
            // Select the first available chat or null
            activeChatId.value = store.chats.length > 0 ? store.chats[0].id : null
        }
    }
    isDeleteModalOpen.value = false
}

const resolveTicket = (status) => {
    escalations.value = escalations.value.filter(t => t.id !== activeTicketId.value)
    if (escalations.value.length > 0) {
        activeTicketId.value = escalations.value[0].id
    } else {
        activeTicketId.value = null
    }
}

const sendBroadcast = () => {
    // In a real app this would trigger an API call to broadcast to connections
    isBroadcastModalOpen.value = false
    broadcastForm.value.message = ''
    // Optionally create a chat entry or system log for the broadcast
}
</script>
