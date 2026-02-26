<template>
    <div class="h-[calc(100vh-8rem)] flex gap-6">
        <!-- Contact List Sidebar -->
        <div class="w-80 glass-panel rounded-xl flex flex-col overflow-hidden">
            <div class="p-4 border-b border-white/5 bg-black/20">
                <!-- Contact Type Tabs -->
                <div class="flex gap-1 mb-3">
                    <button v-for="tab in contactTabs" :key="tab.key" @click="contactType = tab.key"
                        :class="contactType === tab.key ? 'bg-primary/20 text-primary border-primary/30' : 'bg-white/5 text-gray-400 border-transparent'"
                        class="flex-1 text-[10px] font-bold py-1.5 rounded border transition-colors">{{ tab.label }}</button>
                </div>
                <div class="relative">
                    <span class="material-symbols-outlined absolute left-3 top-2.5 text-gray-500">search</span>
                    <input type="text" v-model="searchQuery" placeholder="Find contact..."
                        class="w-full bg-black/40 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-white text-sm focus:outline-none focus:border-primary/50">
                </div>
            </div>
            <div class="flex-1 overflow-y-auto no-scrollbar">
                <div v-for="contact in filteredContacts" :key="contact.id"
                    class="p-4 border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors flex items-center gap-3"
                    :class="activeChat === contact.id ? 'bg-white/5 border-l-2 border-l-primary' : ''"
                    @click="activeChat = contact.id">
                    <div class="relative">
                        <div v-if="contact.type === 'warehouse'"
                            class="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                            <span class="material-symbols-outlined text-blue-400 text-[18px]">warehouse</span>
                        </div>
                        <img v-else :src="contact.avatar" class="w-10 h-10 rounded-full bg-gray-700">
                        <span class="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border border-black"
                            :class="contact.online ? 'bg-green-500' : 'bg-gray-500'"></span>
                    </div>
                    <div class="flex-1 min-w-0">
                        <div class="flex justify-between">
                            <div class="font-bold text-white text-sm truncate">{{ contact.name }}</div>
                            <span v-if="contact.unread" class="w-4 h-4 bg-primary rounded-full text-[9px] text-black font-bold flex items-center justify-center">{{ contact.unread }}</span>
                        </div>
                        <div class="text-[10px] text-gray-500 truncate">{{ contact.lastMessage }}</div>
                        <div class="text-[9px] mt-0.5" :class="contact.type === 'warehouse' ? 'text-blue-400' : 'text-gray-600'">
                            {{ contact.type === 'warehouse' ? 'Warehouse' : contact.role || 'Driver' }}
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Active Chat Area -->
        <div class="flex-1 glass-panel rounded-xl flex flex-col overflow-hidden">
            <div class="p-4 border-b border-white/5 flex justify-between items-center bg-black/20">
                <div class="flex items-center gap-3">
                    <div v-if="activeContact?.type === 'warehouse'" class="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                        <span class="material-symbols-outlined text-blue-400 text-[18px]">warehouse</span>
                    </div>
                    <img v-else :src="activeContact?.avatar" class="w-10 h-10 rounded-full bg-gray-700">
                    <div>
                        <div class="font-bold text-white">{{ activeContact?.name || 'Select a contact' }}</div>
                        <div class="text-xs text-green-400">{{ activeContact?.status || '' }}</div>
                    </div>
                </div>
                <div class="flex gap-2">
                    <button @click="pushRouteUpdate"
                        class="p-2 hover:bg-blue-500/20 rounded-full text-blue-400 hover:text-blue-300 transition-colors"
                        title="Push Route Update">
                        <span class="material-symbols-outlined">route</span>
                    </button>
                    <button @click="sendUrgentInstruction"
                        class="p-2 hover:bg-red-500/20 rounded-full text-red-400 hover:text-red-300 transition-colors"
                        title="Urgent Instruction">
                        <span class="material-symbols-outlined">priority_high</span>
                    </button>
                    <button class="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white"
                        title="Push to Talk"><span class="material-symbols-outlined">mic</span></button>
                    <button class="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white"><span
                            class="material-symbols-outlined">call</span></button>
                    <button @click="showLog = !showLog" class="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white"
                        title="Communication Log"><span class="material-symbols-outlined">history</span></button>
                </div>
            </div>

            <!-- Route Update / Urgent Instruction Banners -->
            <div v-if="routeUpdateSent" class="px-4 py-2 bg-blue-500/10 border-b border-blue-500/20 flex items-center gap-2 text-xs text-blue-300">
                <span class="material-symbols-outlined text-[16px]">check_circle</span>
                Route update pushed to driver at {{ new Date().toLocaleTimeString() }}
            </div>
            <div v-if="urgentSent" class="px-4 py-2 bg-red-500/10 border-b border-red-500/20 flex items-center gap-2 text-xs text-red-300">
                <span class="material-symbols-outlined text-[16px]">warning</span>
                Urgent instruction sent – awaiting acknowledgment
            </div>

            <div class="flex-1 overflow-y-auto p-6 space-y-4 bg-black/10" ref="chatAreaRef">
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
                        <div>
                            <div class="bg-primary/20 border border-primary/30 p-3 rounded-xl rounded-tr-none text-white text-sm max-w-[70%]">{{ msg.text }}</div>
                            <div class="text-[9px] text-gray-600 mt-1 text-right">{{ msg.time }}</div>
                        </div>
                    </template>
                    <template v-else>
                        <div v-if="activeContact?.type === 'warehouse'" class="w-8 h-8 rounded-full bg-blue-500/20 flex-shrink-0 flex items-center justify-center">
                            <span class="material-symbols-outlined text-blue-400 text-[14px]">warehouse</span>
                        </div>
                        <img v-else :src="activeContact?.avatar" class="w-8 h-8 rounded-full bg-gray-700">
                        <div>
                            <div class="bg-white/5 border border-white/10 p-3 rounded-xl rounded-tl-none text-gray-300 text-sm max-w-[70%]">{{ msg.text }}</div>
                            <div class="text-[9px] text-gray-600 mt-1">{{ msg.time }}</div>
                        </div>
                    </template>
                </div>
            </div>

            <div class="p-4 bg-black/20 border-t border-white/5">
                <div class="relative flex gap-2">
                    <input v-model="newMessage" type="text" :placeholder="'Message ' + (activeContact?.name || 'Mike') + '...'"
                        class="flex-1 bg-white/5 border border-white/10 rounded-full py-3 pl-4 pr-4 text-white focus:outline-none focus:border-primary/50"
                        @keyup.enter="sendMessage">
                    <button @click="sendMessage"
                        class="p-3 bg-primary rounded-full text-black hover:scale-105 transition-transform">
                        <span class="material-symbols-outlined text-[20px]">send</span>
                    </button>
                </div>
            </div>
        </div>

        <!-- Communication Log Panel -->
        <div v-if="showLog" class="w-72 glass-panel rounded-xl flex flex-col overflow-hidden">
            <div class="p-4 border-b border-white/5 bg-black/20">
                <div class="text-xs font-bold text-gray-400 uppercase">Communication Log</div>
                <div class="text-[10px] text-gray-600 mt-1">All interactions archived</div>
            </div>
            <div class="flex-1 overflow-y-auto no-scrollbar p-3 space-y-2">
                <div v-for="log in commLog" :key="log.id"
                    class="p-2 rounded-lg text-[10px] border border-white/5"
                    :class="log.type === 'urgent' ? 'bg-red-500/5 border-red-500/10' : log.type === 'route' ? 'bg-blue-500/5 border-blue-500/10' : 'bg-white/5'">
                    <div class="flex justify-between">
                        <span class="font-bold" :class="log.type === 'urgent' ? 'text-red-400' : log.type === 'route' ? 'text-blue-400' : 'text-gray-300'">{{ log.action }}</span>
                        <span class="text-gray-600">{{ log.time }}</span>
                    </div>
                    <div class="text-gray-500 mt-0.5">{{ log.contact }} – {{ log.detail }}</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'

const activeChat = ref(1)
const contactType = ref('all')
const searchQuery = ref('')
const newMessage = ref('')
const showLog = ref(false)
const routeUpdateSent = ref(false)
const urgentSent = ref(false)
const chatAreaRef = ref(null)

const contactTabs = [
    { key: 'all', label: 'All' },
    { key: 'driver', label: 'Drivers' },
    { key: 'warehouse', label: 'Warehouse' }
]

const contacts = ref([
    { id: 1, name: 'Mike Ross', type: 'driver', online: true, lastMessage: 'Got the new route. Thanks!', avatar: 'https://i.pravatar.cc/150?u=1', status: 'On Route to Zone A', unread: 0 },
    { id: 2, name: 'Harvey Specter', type: 'driver', online: false, lastMessage: 'Delivered successfully.', avatar: 'https://i.pravatar.cc/150?u=2', status: 'Off Duty', unread: 0 },
    { id: 3, name: 'Rachel Zane', type: 'driver', online: true, lastMessage: 'Pick up done.', avatar: 'https://i.pravatar.cc/150?u=3', status: 'At Warehouse B', unread: 2 },
    { id: 4, name: 'Warehouse Alpha', type: 'warehouse', online: true, lastMessage: 'Batch 42 ready for pickup.', avatar: '', status: 'Active', role: 'Main Warehouse', unread: 1 },
    { id: 5, name: 'Warehouse Beta', type: 'warehouse', online: true, lastMessage: 'Cold storage order staged.', avatar: '', status: 'Active', role: 'Cold Storage Hub', unread: 0 },
])

const filteredContacts = computed(() => {
    return contacts.value.filter(c => {
        const matchType = contactType.value === 'all' || c.type === contactType.value
        const matchSearch = c.name.toLowerCase().includes(searchQuery.value.toLowerCase())
        return matchType && matchSearch
    })
})

const activeContact = computed(() => contacts.value.find(c => c.id === activeChat.value))

// Per-contact message history
const messageHistory = ref({
    1: [
        { id: 1, from: 'contact', text: 'Boss, traffic is heavy on Main St. Estimated delay 10 mins.', time: '10:14 AM' },
        { id: 2, from: 'dispatch', text: 'Copy that Mike. Proceed with caution. Dispatching updated route to your nav.', time: '10:15 AM' },
        { id: 3, from: 'contact', text: '', time: '10:16 AM', type: 'system' },
        { id: 4, from: 'contact', text: 'Got the new route. ETA looks good now. Thanks!', time: '10:18 AM' }
    ],
    2: [
        { id: 1, from: 'contact', text: 'All deliveries completed for Zone B. Heading back.', time: '3:45 PM' },
        { id: 2, from: 'dispatch', text: 'Great work Harvey. See you at the hub.', time: '3:46 PM' }
    ],
    3: [
        { id: 1, from: 'contact', text: 'Pickup at Warehouse B done. 24 parcels loaded.', time: '11:30 AM' },
        { id: 2, from: 'dispatch', text: 'Confirmed. Head to Zone C next.', time: '11:31 AM' },
        { id: 3, from: 'contact', text: 'On my way. ETA 25 mins.', time: '11:32 AM' }
    ],
    4: [
        { id: 1, from: 'contact', text: 'Batch 42 ready for pickup. 38 parcels staged at Dock 2.', time: '9:15 AM' },
        { id: 2, from: 'dispatch', text: 'Driver en route. ETA 15 mins.', time: '9:16 AM' }
    ],
    5: [
        { id: 1, from: 'contact', text: 'Cold storage order OCS-221 staged. Temp verified at -18°C.', time: '8:30 AM' },
        { id: 2, from: 'dispatch', text: 'Acknowledged. Refrigerated van dispatched.', time: '8:32 AM' }
    ]
})

// Init the system message text
messageHistory.value[1][2].text = "Route update pushed to driver's navigation – 10:16 AM"

const currentMessages = computed(() => messageHistory.value[activeChat.value] || [])

const commLog = ref([
    { id: 1, action: 'Route Update Pushed', type: 'route', contact: 'Mike Ross', detail: 'Alternative via Route 7', time: '10:16 AM' },
    { id: 2, action: 'Urgent Instruction', type: 'urgent', contact: 'Rachel Zane', detail: 'Dock 3 closed, use Dock 5', time: '9:45 AM' },
    { id: 3, action: 'Message Sent', type: 'message', contact: 'Warehouse Alpha', detail: 'Confirmed pickup at 11:00', time: '9:30 AM' },
    { id: 4, action: 'Call Connected', type: 'message', contact: 'Harvey Specter', detail: 'Duration: 2m 15s', time: '9:12 AM' },
    { id: 5, action: 'Route Update Pushed', type: 'route', contact: 'Mike Ross', detail: 'Original route restored', time: '8:50 AM' },
    { id: 6, action: 'Broadcast Sent', type: 'urgent', contact: 'All Drivers', detail: 'Weather alert: heavy rain Zone C', time: '8:30 AM' },
])

function pushRouteUpdate() {
    routeUpdateSent.value = true
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    addSystemMessage(`Route update pushed to ${activeContact.value?.name}'s navigation – ${now}`)
    commLog.value.unshift({ id: Date.now(), action: 'Route Update Pushed', type: 'route', contact: activeContact.value?.name, detail: 'Updated route sent', time: now })
    setTimeout(() => { routeUpdateSent.value = false }, 5000)
}

function sendUrgentInstruction() {
    urgentSent.value = true
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    addSystemMessage(`Urgent instruction sent to ${activeContact.value?.name} – ${now}`)
    commLog.value.unshift({ id: Date.now(), action: 'Urgent Instruction', type: 'urgent', contact: activeContact.value?.name, detail: 'Awaiting acknowledgment', time: now })
    setTimeout(() => { urgentSent.value = false }, 5000)
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
    
    // Update last message on contact
    const contact = contacts.value.find(c => c.id === activeChat.value)
    if (contact) { contact.lastMessage = 'You: ' + newMessage.value; contact.unread = 0 }
    
    // Log to comm log
    commLog.value.unshift({ id: Date.now(), action: 'Message Sent', type: 'message', contact: activeContact.value?.name, detail: newMessage.value.substring(0, 40), time: now })
    
    const sentMsg = newMessage.value
    newMessage.value = ''
    
    // Auto scroll
    nextTick(() => { if (chatAreaRef.value) chatAreaRef.value.scrollTop = chatAreaRef.value.scrollHeight })
    
    // Simulate reply
    setTimeout(() => {
        const replyTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        const replies = ['Roger that, understood.', 'Copy. Will do.', 'Acknowledged. On it.', 'Got it, thanks!', 'Confirmed.']
        const reply = replies[Math.floor(Math.random() * replies.length)]
        messageHistory.value[activeChat.value].push({ id: Date.now(), from: 'contact', text: reply, time: replyTime })
        if (contact) contact.lastMessage = reply
        nextTick(() => { if (chatAreaRef.value) chatAreaRef.value.scrollTop = chatAreaRef.value.scrollHeight })
    }, 1500)
}
</script>
