<template>
    <div class="relative" ref="popoverRef">
        <!-- Trigger Button -->
        <button @click="togglePopover"
            class="relative w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-white/5 transition-colors text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            :class="{ 'bg-gray-200 dark:bg-white/10 text-gray-900 dark:text-white': isOpen }">
            <span class="material-symbols-outlined text-[20px]">calendar_add_on</span>
            <!-- Active Meetings Badge -->
            <span v-if="upcomingMeetingsCount > 0"
                class="absolute top-0 right-0 w-4 h-4 bg-primary text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-surface-light dark:border-background-dark">
                {{ upcomingMeetingsCount }}
            </span>
        </button>

        <!-- Popover -->
        <div v-show="isOpen"
            class="absolute right-0 mt-2 w-96 bg-white dark:bg-card-darker rounded-2xl shadow-xl border border-gray-200 dark:border-white/10 overflow-hidden z-50 transform origin-top-right transition-all duration-200"
            :class="isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'">

            <!-- Header -->
            <div class="p-4 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-gray-50/50 dark:bg-black/20">
                <h3 class="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <span class="material-symbols-outlined text-primary">video_call</span>
                    Meetings
                </h3>
                <div class="flex items-center gap-2">
                    <button v-if="!isCreating && !isEditing" @click.stop="startCreating"
                        class="text-xs font-semibold px-2 py-1 rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                        + Schedule
                    </button>
                    <button v-else @click.stop="cancelEdit"
                        class="text-xs font-semibold px-2 py-1 rounded-md bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 hover:bg-red-100 transition-colors">
                        Cancel
                    </button>
                </div>
            </div>

            <!-- VIEW MODE: List of Meetings -->
            <div v-if="!isCreating && !isEditing" class="max-h-[500px] overflow-y-auto no-scrollbar">
                <div v-if="meetings.length === 0" class="p-8 text-center text-gray-500 dark:text-gray-400">
                    <span class="material-symbols-outlined text-4xl mb-2 opacity-50">event_busy</span>
                    <p class="text-sm">No scheduled meetings.</p>
                </div>

                <div v-else class="divide-y divide-gray-100 dark:divide-white/5">
                    <div v-for="meeting in sortedMeetings" :key="meeting.id"
                        class="p-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group relative cursor-pointer select-none"
                        @click.stop="handleMeetingClick($event, meeting)" title="Triple click to edit">
                        
                        <div class="flex justify-between items-start mb-1">
                            <h4 class="font-semibold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                                {{ meeting.topic }}
                                <span v-if="isMeetingLive(meeting)" class="flex h-2 w-2 relative">
                                    <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span class="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                </span>
                            </h4>
                            <span class="text-[10px] font-medium px-1.5 py-0.5 rounded bg-gray-100 dark:bg-white/10 text-gray-500">
                                {{ formatDate(meeting.date) }}
                            </span>
                        </div>

                        <div class="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-2">
                            <span class="material-symbols-outlined text-[14px]">schedule</span>
                            {{ meeting.startTime }} - {{ meeting.endTime }}
                        </div>

                        <p class="text-xs text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                            {{ meeting.description }}
                        </p>

                        <div class="flex items-center justify-between">
                            <div class="flex -space-x-2 overflow-hidden">
                                <div v-for="uid in meeting.participants.slice(0, 3)" :key="uid"
                                    class="inline-block h-6 w-6 rounded-full ring-2 ring-white dark:ring-gray-800 bg-gray-200 flex items-center justify-center text-[8px] font-bold text-gray-600"
                                    :title="getUserName(uid)">
                                    {{ getUserInitials(uid) }}
                                </div>
                                <div v-if="meeting.participants.length > 3" class="inline-block h-6 w-6 rounded-full ring-2 ring-white dark:ring-gray-800 bg-gray-100 flex items-center justify-center text-[8px] font-bold text-gray-500">
                                    +{{ meeting.participants.length - 3 }}
                                </div>
                            </div>

                            <div class="flex items-center gap-2">
                                <button @click.stop="deleteMeeting(meeting.id)" class="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100" title="Delete Meeting">
                                    <span class="material-symbols-outlined text-[18px]">delete</span>
                                </button>
                                <button @click.stop="joinMeeting(meeting)"
                                    class="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm"
                                    :class="isMeetingLive(meeting) || true ? 'bg-primary text-white hover:bg-primary/90' : 'bg-gray-100 text-gray-400 cursor-not-allowed'">
                                    <span class="material-symbols-outlined text-[14px]">videocam</span>
                                    Join
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- EDIT/CREATE MODE: Form -->
            <div v-else class="p-4 max-h-[500px] overflow-y-auto no-scrollbar space-y-4 bg-gray-50/30 dark:bg-white/5">
                 <h4 class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    {{ isEditing ? 'Edit Meeting' : 'New Meeting' }}
                </h4>
                
                <!-- 1. Meeting Details -->
                <div class="space-y-3">
                    <div>
                        <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Topic</label>
                        <input v-model="form.topic" type="text" placeholder="e.g. Weekly Sync"
                            class="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-primary/50 transition-colors">
                    </div>

                    <div>
                        <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Meeting Link</label>
                        <input v-model="form.link" type="text" placeholder="https://meet.google.com/..."
                            class="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-blue-500 dark:text-blue-400 focus:outline-none focus:border-primary/50 transition-colors">
                    </div>

                    <div>
                         <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
                         <input v-model="form.date" type="date"
                            class="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-primary/50 transition-colors">
                    </div>

                    <div class="flex gap-2">
                        <div class="flex-1">
                            <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Start Time</label>
                            <input v-model="form.startTime" type="time"
                                class="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-primary/50 transition-colors">
                        </div>
                        <div class="flex-1">
                            <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">End Time</label>
                            <input v-model="form.endTime" type="time"
                                class="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-primary/50 transition-colors">
                        </div>
                    </div>

                    <div>
                        <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                        <textarea v-model="form.description" rows="2" placeholder="Agenda or notes..."
                            class="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-primary/50 transition-colors resize-none"></textarea>
                    </div>
                </div>

                <!-- 2. Select Participants -->
                <div class="space-y-3 pt-2 border-t border-gray-100 dark:border-white/5">
                    <h4 class="text-xs font-bold text-gray-500 uppercase tracking-wider flex justify-between items-center">
                        Participants
                        <span class="text-[10px] font-normal normal-case bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
                            {{ form.participants.length }} selected
                        </span>
                    </h4>

                    <!-- Filters -->
                    <div class="flex gap-2">
                        <select v-model="filters.hub"
                            class="flex-1 bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg px-2 py-1.5 text-xs text-gray-700 dark:text-gray-300 focus:outline-none focus:border-primary/50">
                            <option value="">All Hubs</option>
                            <option v-for="hub in store.hubs" :key="hub.id" :value="hub.id">{{ hub.name }}</option>
                        </select>
                        
                        <select v-model="filters.role"
                            class="flex-1 bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg px-2 py-1.5 text-xs text-gray-700 dark:text-gray-300 focus:outline-none focus:border-primary/50">
                            <option value="">All Roles</option>
                            <option value="Manager">Manager</option>
                            <option value="Dispatcher">Dispatcher</option>
                            <option value="Driver">Driver</option>
                        </select>
                    </div>

                    <!-- User List -->
                    <div class="max-h-40 overflow-y-auto border border-gray-200 dark:border-white/10 rounded-lg bg-gray-50/50 dark:bg-black/20 divide-y divide-gray-100 dark:divide-white/5">
                        <div v-if="filteredUsers.length === 0" class="p-3 text-center text-xs text-gray-500">
                            No users found matching filters.
                        </div>
                        <label v-for="user in filteredUsers" :key="user.id" 
                            class="flex items-center gap-3 p-2 hover:bg-gray-100 dark:hover:bg-white/5 cursor-pointer transition-colors">
                            <input type="checkbox" :value="user.id" v-model="form.participants"
                                class="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary">
                            <div class="flex-1 min-w-0">
                                <div class="text-sm font-medium text-gray-900 dark:text-white truncate">{{ user.name }}</div>
                                <div class="text-[10px] text-gray-500 flex items-center gap-2">
                                    <span>{{ user.role }}</span>
                                    <span class="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600"></span>
                                    <span>{{ getHubName(user.hubId) }}</span>
                                </div>
                            </div>
                        </label>
                    </div>
                </div>

                <!-- Footer ACTIONS -->
                <div class="pt-4 border-t border-gray-100 dark:border-white/5 flex justify-end gap-2">
                    <button @click="saveMeeting"
                        class="w-full px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        :disabled="!isValid">
                        {{ isEditing ? 'Update Schedule' : 'Schedule Meeting' }}
                    </button>
                </div>

            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useLogisticStore } from '@/stores/logisticStore'

const store = useLogisticStore()
const router = useRouter()
const isOpen = ref(false)
const popoverRef = ref(null)

const isCreating = ref(false)
const isEditing = ref(false)
const editId = ref(null)

// Mock Data for Meetings
const meetings = ref([
    {
        id: 101,
        topic: 'Daily Operations Sync',
        description: 'Review morning deliveries and potential delays.',
        link: 'https://meet.google.com/abc-defg-hij',
        date: new Date().toISOString().split('T')[0], // Today
        startTime: '09:00',
        endTime: '09:30',
        participants: [1, 2, 4, 5]
    },
    {
        id: 102,
        topic: 'Fleet Maintenance Review',
        description: 'Check status of vehicles in repair.',
        link: 'https://meet.google.com/xyz-uvw-qrs',
        date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
        startTime: '14:00',
        endTime: '15:00',
        participants: [1, 3, 6]
    }
])

const defaultForm = {
    topic: '',
    link: '',
    date: '',
    startTime: '',
    endTime: '',
    description: '',
    participants: []
}

const form = ref({ ...defaultForm })

const filters = ref({
    hub: '',
    role: ''
})

const mockUsers = [
    { id: 1, name: 'Alex Johnson', role: 'Manager', hubId: 'HUB-001' },
    { id: 2, name: 'Sarah Smith', role: 'Dispatcher', hubId: 'HUB-001' },
    { id: 3, name: 'Mike Brown', role: 'Driver', hubId: 'HUB-001' },
    { id: 4, name: 'Emma Wilson', role: 'Manager', hubId: 'HUB-002' },
    { id: 5, name: 'James Davis', role: 'Dispatcher', hubId: 'HUB-002' },
    { id: 6, name: 'Robert Miller', role: 'Driver', hubId: 'HUB-002' },
    { id: 7, name: 'Linda Taylor', role: 'Driver', hubId: 'HUB-003' },
    { id: 8, name: 'David Anderson', role: 'Dispatcher', hubId: 'HUB-003' },
]

// --- Computed ---

const upcomingMeetingsCount = computed(() => meetings.value.length)

const sortedMeetings = computed(() => {
    return [...meetings.value].sort((a, b) => {
        // Sort by date then time
        const dateA = new Date(`${a.date}T${a.startTime}`)
        const dateB = new Date(`${b.date}T${b.startTime}`)
        return dateA - dateB
    })
})

const filteredUsers = computed(() => {
    return mockUsers.filter(user => {
        const matchHub = filters.value.hub ? user.hubId === filters.value.hub : true
        const matchRole = filters.value.role ? user.role === filters.value.role : true
        return matchHub && matchRole
    })
})

const isValid = computed(() => {
    return form.value.topic && form.value.date && form.value.startTime && form.value.endTime && form.value.participants.length > 0
})

// --- Methods ---

const togglePopover = () => {
    isOpen.value = !isOpen.value
    if (!isOpen.value) cancelEdit()
}

const startCreating = () => {
    isCreating.value = true
    isEditing.value = false
    editId.value = null
    form.value = { ...defaultForm, date: new Date().toISOString().split('T')[0] }
}

const cancelEdit = () => {
    isCreating.value = false
    isEditing.value = false
    editId.value = null
    form.value = { ...defaultForm }
}

const editMeeting = (meeting) => {
    isCreating.value = false
    isEditing.value = true
    editId.value = meeting.id
    form.value = JSON.parse(JSON.stringify(meeting)) // Deep copy
}

const handleMeetingClick = (e, meeting) => {
    const now = new Date()
    // Simple logic to detect triple click within a short timeframe
    if (e.detail === 3) {
        editMeeting(meeting)
        e.stopPropagation() // Prevent bubbling
    }
}

const saveMeeting = () => {
    if (isEditing.value) {
        const index = meetings.value.findIndex(m => m.id === editId.value)
        if (index !== -1) {
            meetings.value[index] = { ...form.value, id: editId.value }
        }
    } else {
        const newMeeting = {
            ...form.value,
            id: Date.now()
        }
        meetings.value.push(newMeeting)
    }
    cancelEdit()
}

const deleteMeeting = (id) => {
    meetings.value = meetings.value.filter(m => m.id !== id)
}

const joinMeeting = (meeting) => {
    // Navigate to meeting room
    router.push({
        path: '/logistic/meeting-room',
        query: {
            url: meeting.link,
            title: meeting.topic
        }
    })
    isOpen.value = false
}

// Helpers
const getHubName = (hubId) => {
    const hub = store.hubs?.find(h => h.id === hubId)
    return hub ? hub.name : hubId
}

const getUserName = (id) => mockUsers.find(u => u.id === id)?.name || 'Unknown'

const getUserInitials = (id) => {
    const name = getUserName(id)
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
}

const formatDate = (dateStr) => {
    const d = new Date(dateStr)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    if (d.toDateString() === today.toDateString()) return 'Today'
    if (d.toDateString() === tomorrow.toDateString()) return 'Tomorrow'
    
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

const isMeetingLive = (meeting) => {
    const now = new Date()
    const start = new Date(`${meeting.date}T${meeting.startTime}`)
    const end = new Date(`${meeting.date}T${meeting.endTime}`)
    // Consider live if within time range or slightly before
    return now >= new Date(start.getTime() - 10 * 60000) && now <= end
}

// Click Outside
const handleClickOutside = (event) => {
    // Check if the click is outside the popover OR if it was a triple click event that bubbled up
    if (popoverRef.value && !popoverRef.value.contains(event.target)) {
        isOpen.value = false
    }
}

onMounted(() => {
    document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
})

</script>
