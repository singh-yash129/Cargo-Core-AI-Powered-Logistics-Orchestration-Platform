<template>
    <div class="h-[calc(100vh-8rem)] flex gap-6">
        <!-- Contact List Sidebar -->
        <div class="w-80 glass-panel rounded-xl flex flex-col overflow-hidden">
            <div class="p-4 border-b border-gray-200 dark:border-white/5 bg-gray-100 dark:bg-black/20">
                <!-- Contact Type Tabs -->
                <div class="flex gap-1 mb-3">
                    <button v-for="tab in contactTabs" :key="tab.key" @click="contactType = tab.key"
                        :class="contactType === tab.key ? 'bg-primary text-black dark:text-black border-primary shadow-md' : 'bg-white dark:bg-white/5 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-white/10 hover:bg-gray-200 dark:hover:bg-white/10'"
                        class="flex-1 text-[10px] font-bold py-1.5 rounded border transition-colors">{{ tab.label }}</button>
                </div>
                <div class="relative">
                    <span class="material-symbols-outlined absolute left-3 top-2.5 text-gray-500">search</span>
                    <input type="text" v-model="searchQuery" placeholder="Find contact..."
                        class="w-full bg-white dark:bg-black/40 border-2 border-gray-300 dark:border-white/10 rounded-lg py-2 pl-10 pr-4 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-primary/50">
                </div>
            </div>
            <div class="flex-1 overflow-y-auto no-scrollbar">
                <div v-for="contact in filteredContacts" :key="contact.id"
                    class="p-4 border-b border-gray-200 dark:border-white/5 hover:bg-gray-100 dark:hover:bg-white/5 cursor-pointer transition-colors flex items-center gap-3"
                    :class="activeChat === contact.id ? 'bg-gray-50 dark:bg-white/5 border-l-2 border-l-primary' : ''"
                    @click="activeChat = contact.id">
                    <div class="relative">
                        <div v-if="contact.type === 'warehouse'"
                            class="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                            <span class="material-symbols-outlined text-blue-400 text-[18px]">warehouse</span>
                        </div>
                        <img v-else :src="contact.avatar" class="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700">
                        <span class="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border border-white dark:border-black"
                            :class="contact.online ? 'bg-green-500' : 'bg-gray-500'"></span>
                    </div>
                    <div class="flex-1 min-w-0">
                        <div class="flex justify-between items-center">
                            <div class="font-bold text-gray-900 dark:text-white text-sm truncate">{{ contact.name }}</div>
                            <span v-if="contact.unread" class="min-w-[16px] h-4 bg-primary rounded-full text-[9px] text-black font-bold flex items-center justify-center px-1">{{ contact.unread }}</span>
                        </div>
                        <div class="text-[10px] text-gray-500 truncate">{{ contact.lastMessage }}</div>
                        <div class="text-[9px] mt-0.5 font-semibold px-1.5 py-0.5 rounded-full inline-block" :class="contact.type === 'warehouse' ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400' : 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400'">
                            {{ contact.type === 'warehouse' ? 'Warehouse' : contact.role || 'Driver' }}
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Active Chat Area -->
        <div class="flex-1 glass-panel rounded-xl flex flex-col overflow-hidden">
            <div class="p-4 border-b border-gray-200 dark:border-white/5 flex justify-between items-center bg-gray-100 dark:bg-black/20">
                <div class="flex items-center gap-3">
                    <div v-if="activeContact?.type === 'warehouse'" class="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                        <span class="material-symbols-outlined text-blue-400 text-[18px]">warehouse</span>
                    </div>
                    <img v-else :src="activeContact?.avatar" class="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700">
                    <div>
                        <div class="font-bold text-gray-900 dark:text-white">{{ activeContact?.name || 'Select a contact' }}</div>
                        <div v-if="activeContact?.phone" class="text-[11px] text-gray-500 dark:text-gray-400">{{ activeContact.phone }}</div>
                        <div class="text-xs text-green-600 dark:text-green-400">{{ activeContact?.status || '' }}</div>
                    </div>
                </div>
                <div class="flex gap-2">
                    <button @click="showRouteModal = true"
                        class="p-2 hover:bg-blue-100 dark:hover:bg-blue-500/20 rounded-full text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 transition-colors"
                        title="Push Route Update">
                        <span class="material-symbols-outlined">route</span>
                    </button>
                    <button @click="showUrgentModal = true"
                        class="p-2 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-full text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 transition-colors"
                        title="Urgent Instruction">
                        <span class="material-symbols-outlined">priority_high</span>
                    </button>
                    <button @click="showLog = !showLog" class="p-2 hover:bg-gray-200 dark:hover:bg-white/10 rounded-full text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                        title="Communication Log"><span class="material-symbols-outlined">history</span></button>
                </div>
            </div>

            <!-- Route Update / Urgent Instruction Banners -->
            <div v-if="routeUpdateSent" class="px-4 py-2 bg-blue-100 dark:bg-blue-500/10 border-b border-blue-500/20 flex items-center gap-2 text-xs text-blue-700 dark:text-blue-300">
                <span class="material-symbols-outlined text-[16px]">check_circle</span>
                Route update pushed to driver at {{ new Date().toLocaleTimeString() }}
            </div>
            <div v-if="urgentSent" class="px-4 py-2 bg-red-100 dark:bg-red-500/10 border-b border-red-500/20 flex items-center gap-2 text-xs text-red-700 dark:text-red-300">
                <span class="material-symbols-outlined text-[16px]">warning</span>
                Urgent instruction sent – awaiting acknowledgment
            </div>

            <div class="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50 dark:bg-black/10" ref="chatAreaRef">
                <!-- Messages -->
                <div v-for="msg in currentMessages" :key="msg.id" :class="msg.from === 'dispatch' ? 'flex gap-3 flex-row-reverse' : 'flex gap-3'">
                    <template v-if="msg.type === 'system'">
                        <div class="w-full flex justify-center">
                            <div class="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-[10px] text-blue-400">
                                {{ msg.text }}
                            </div>
                        </div>
                    </template>
                    <template v-else-if="msg.from === 'dispatch'">
                        <div class="w-8 h-8 rounded-full bg-primary flex-shrink-0 flex items-center justify-center text-[10px] text-black font-bold">DISP</div>
                        <div class="max-w-[70%]">
                            <div class="bg-emerald-100 dark:bg-primary/20 border border-emerald-200 dark:border-primary/30 p-3 rounded-xl rounded-tr-none text-gray-900 dark:text-white text-sm break-words">{{ msg.text }}</div>
                            <div class="text-[9px] text-gray-500 dark:text-gray-600 mt-1 text-right">{{ msg.time }}</div>
                        </div>
                    </template>
                    <template v-else>
                        <div v-if="activeContact?.type === 'warehouse'" class="w-8 h-8 rounded-full bg-blue-500/20 flex-shrink-0 flex items-center justify-center">
                            <span class="material-symbols-outlined text-blue-400 text-[14px]">warehouse</span>
                        </div>
                        <img v-else :src="activeContact?.avatar" class="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0">
                        <div class="max-w-[70%]">
                            <div class="bg-gray-200 dark:bg-white/5 border border-gray-300 dark:border-white/10 p-3 rounded-xl rounded-tl-none text-gray-800 dark:text-gray-300 text-sm break-words">{{ msg.text }}</div>
                            <div class="text-[9px] text-gray-500 dark:text-gray-600 mt-1">{{ msg.time }}</div>
                        </div>
                    </template>
                </div>
            </div>

            <div class="p-4 bg-gray-100 dark:bg-black/20 border-t border-gray-200 dark:border-white/5">
                <div class="relative flex gap-2 items-stretch">
                    <input v-model="newMessage" type="text" :placeholder="'Message ' + (activeContact?.name || 'Mike') + '...'"
                        class="flex-1 bg-white dark:bg-white/5 border-2 border-gray-300 dark:border-white/10 rounded-full py-3 pl-4 pr-4 text-gray-900 dark:text-white focus:outline-none focus:border-primary/50"
                        @keyup.enter="sendMessage">
                    <button @click="sendMessage" :disabled="!newMessage.trim()"
                        class="px-4 bg-primary rounded-full text-black hover:scale-105 transition-transform disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 flex-shrink-0 flex items-center justify-center">
                        <span class="material-symbols-outlined text-[20px]">send</span>
                    </button>
                </div>
            </div>
        </div>

        <!-- Communication Log Panel -->
        <div v-if="showLog" class="w-72 glass-panel rounded-xl flex flex-col overflow-hidden">
            <div class="p-4 border-b border-gray-200 dark:border-white/5 bg-gray-100 dark:bg-black/20">
                <div class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Communication Log</div>
                <div class="text-[10px] text-gray-500 dark:text-gray-600 mt-1">All interactions archived</div>
            </div>
            <div class="flex-1 overflow-y-auto no-scrollbar p-3 space-y-2">
                <div v-for="log in commLog" :key="log.id"
                    class="p-2 rounded-lg text-[10px] border border-gray-200 dark:border-white/5"
                    :class="log.type === 'urgent' ? 'bg-red-100 dark:bg-red-500/5 border-red-500/20 dark:border-red-500/10' : log.type === 'route' ? 'bg-blue-100 dark:bg-blue-500/5 border-blue-500/20 dark:border-blue-500/10' : 'bg-gray-50 dark:bg-white/5'">
                    <div class="flex justify-between">
                        <span class="font-bold" :class="log.type === 'urgent' ? 'text-red-600 dark:text-red-400' : log.type === 'route' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'">{{ log.action }}</span>
                        <span class="text-gray-600 dark:text-gray-400">{{ log.time }}</span>
                    </div>
                    <div class="text-gray-600 dark:text-gray-400 mt-0.5">{{ log.contact }} – {{ log.detail }}</div>
                </div>
            </div>
        </div>

        <!-- Route Update Modal -->
        <Teleport to="body">
        <div v-if="showRouteModal" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center" @click.self="showRouteModal = false">
            <div class="bg-white dark:bg-card-dark shadow-2xl border border-gray-200 dark:border-white/10 rounded-2xl p-6 w-full max-w-md m-4">
                <h3 class="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <span class="material-symbols-outlined text-blue-500">route</span> Push Route Update
                </h3>
                <p class="text-sm text-gray-500 dark:text-gray-400 mb-3">Send a route update to <span class="font-bold text-gray-900 dark:text-white">{{ activeContact?.name }}</span></p>
                <textarea v-model="routeUpdateMsg" rows="2" placeholder="Optional: Add route notes..."
                    class="w-full bg-gray-100 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none mb-3"></textarea>
                <div class="flex gap-2">
                    <button @click="confirmRouteUpdate" class="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 rounded-lg text-sm transition-colors">Push Update</button>
                    <button @click="showRouteModal = false" class="flex-1 bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-white py-2 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-white/20 transition-colors">Cancel</button>
                </div>
            </div>
        </div>
        </Teleport>

        <!-- Urgent Instruction Modal -->
        <Teleport to="body">
        <div v-if="showUrgentModal" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center" @click.self="showUrgentModal = false">
            <div class="bg-white dark:bg-card-dark shadow-2xl border border-red-300 dark:border-red-500/20 rounded-2xl p-6 w-full max-w-md m-4">
                <h3 class="font-bold text-red-600 dark:text-red-400 mb-3 flex items-center gap-2">
                    <span class="material-symbols-outlined">priority_high</span> Send Urgent Instruction
                </h3>
                <p class="text-sm text-gray-500 dark:text-gray-400 mb-3">Send urgent instructions to <span class="font-bold text-gray-900 dark:text-white">{{ activeContact?.name }}</span></p>
                <textarea v-model="urgentInstructionMsg" rows="3" placeholder="Type urgent instruction..."
                    class="w-full bg-gray-100 dark:bg-black/30 border border-red-300 dark:border-red-500/20 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none mb-3"></textarea>
                <div class="flex gap-2">
                    <button @click="confirmUrgentInstruction" :disabled="!urgentInstructionMsg.trim()" class="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2 rounded-lg text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed">Send Urgent</button>
                    <button @click="showUrgentModal = false" class="flex-1 bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-white py-2 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-white/20 transition-colors">Cancel</button>
                </div>
            </div>
        </div>
        </Teleport>
    </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, watch } from 'vue'
import { useDispatcherStore } from '@/stores/dispatcherStore'

const store = useDispatcherStore()
onMounted(() => store.initialize().catch(() => {}))

const activeChat = ref(null)
const contactType = ref('all')
const searchQuery = ref('')
const newMessage = ref('')
const showLog = ref(false)
const routeUpdateSent = ref(false)
const urgentSent = ref(false)
const chatAreaRef = ref(null)
const showRouteModal = ref(false)
const showUrgentModal = ref(false)
const routeUpdateMsg = ref('')
const urgentInstructionMsg = ref('')

const contactTabs = [
    { key: 'all', label: 'All' },
    { key: 'driver', label: 'Drivers' },
    { key: 'warehouse', label: 'Warehouse' }
]

const contacts = computed(() => store.dispatcherContacts)

// Set first contact as active once loaded
watch(contacts, (list) => {
    if (list.length && activeChat.value === null) activeChat.value = list[0].id
}, { immediate: true })

const filteredContacts = computed(() => {
    return contacts.value.filter(c => {
        const matchType = contactType.value === 'all' || c.type === contactType.value
        const matchSearch = c.name.toLowerCase().includes(searchQuery.value.toLowerCase())
        return matchType && matchSearch
    })
})

const activeContact = computed(() => contacts.value.find(c => c.id === activeChat.value))

// Per-contact message history (local state for session)
const messageHistory = ref({})

// Seed history from store contacts on load
watch(contacts, (list) => {
    list.forEach(c => {
        if (!messageHistory.value[c.id] && c.messages?.length) {
            messageHistory.value[c.id] = c.messages
        }
    })
}, { immediate: true })

const currentMessages = computed(() => messageHistory.value[activeChat.value] || [])

const commLog = ref([])

// PTT and Call buttons removed from UI — dispatcher uses phone number shown in header

function pushRouteUpdate() {
    // kept for internal use
    routeUpdateSent.value = true
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    const notes = routeUpdateMsg.value ? ` – ${routeUpdateMsg.value}` : ''
    addSystemMessage(`Route update pushed to ${activeContact.value?.name}'s navigation – ${now}${notes}`)
    commLog.value.unshift({ id: Date.now(), action: 'Route Update Pushed', type: 'route', contact: activeContact.value?.name, detail: routeUpdateMsg.value || 'Updated route sent', time: now })
    setTimeout(() => { routeUpdateSent.value = false }, 5000)
}

function confirmRouteUpdate() {
    pushRouteUpdate()
    showRouteModal.value = false
    routeUpdateMsg.value = ''
}

function sendUrgentInstruction() {
    urgentSent.value = true
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    addSystemMessage(`Urgent instruction sent to ${activeContact.value?.name} – ${now}: ${urgentInstructionMsg.value}`)
    commLog.value.unshift({ id: Date.now(), action: 'Urgent Instruction', type: 'urgent', contact: activeContact.value?.name, detail: urgentInstructionMsg.value || 'Awaiting acknowledgment', time: now })
    setTimeout(() => { urgentSent.value = false }, 5000)
}

function confirmUrgentInstruction() {
    sendUrgentInstruction()
    showUrgentModal.value = false
    urgentInstructionMsg.value = ''
}

function addSystemMessage(text) {
    if (!messageHistory.value[activeChat.value]) messageHistory.value[activeChat.value] = []
    messageHistory.value[activeChat.value].push({ id: Date.now(), from: 'system', text, time: '', type: 'system' })
}

function sendMessage() {
    if (!newMessage.value.trim()) return
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    if (!messageHistory.value[activeChat.value]) messageHistory.value[activeChat.value] = []
    messageHistory.value[activeChat.value].push({ id: Date.now(), from: 'dispatch', text: newMessage.value, time: now })

    // Send to driver via store if contact is a driver
    const contact = activeContact.value
    if (contact?.type === 'driver') store.sendMessageToDriver(contact.id, newMessage.value)

    // Log to comm log
    commLog.value.unshift({ id: Date.now(), action: 'Message Sent', type: 'message', contact: contact?.name, detail: newMessage.value.substring(0, 40), time: now })

    newMessage.value = ''
    nextTick(() => { if (chatAreaRef.value) chatAreaRef.value.scrollTop = chatAreaRef.value.scrollHeight })

    // Simulate reply
    setTimeout(() => {
        const replyTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        const replies = ['Roger that, understood.', 'Copy. Will do.', 'Acknowledged. On it.', 'Got it, thanks!', 'Confirmed.']
        if (!messageHistory.value[activeChat.value]) return
        messageHistory.value[activeChat.value].push({ id: Date.now(), from: 'contact', text: replies[Math.floor(Math.random() * replies.length)], time: replyTime })
        nextTick(() => { if (chatAreaRef.value) chatAreaRef.value.scrollTop = chatAreaRef.value.scrollHeight })
    }, 1500)
}
</script>
