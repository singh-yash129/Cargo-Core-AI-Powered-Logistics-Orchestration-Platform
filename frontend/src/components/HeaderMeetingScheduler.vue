<template>
    <div class="relative" ref="popoverRef">
        <!-- Trigger Button -->
        <button @click="togglePopover"
            class="relative w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-white/5 transition-colors text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            :class="{ 'bg-gray-200 dark:bg-white/10 text-gray-900 dark:text-white': isOpen }">
            <span class="material-symbols-outlined text-[20px]">calendar_add_on</span>
            <span v-if="upcomingMeetingsCount > 0"
                class="absolute top-0 right-0 w-4 h-4 bg-primary text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-surface-light dark:border-background-dark">
                {{ upcomingMeetingsCount }}
            </span>
        </button>

        <!-- Popover -->
        <div v-show="isOpen"
            class="absolute right-0 mt-3 w-[420px] rounded-2xl z-50 transition-all duration-200 origin-top-right"
            :class="isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'"
            style="background:#ffffff; box-shadow:0 20px 60px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.10);"
            :style="{ background: isDark ? '#13161f' : '#ffffff', boxShadow: '0 20px 60px rgba(0,0,0,0.25), 0 4px 16px rgba(0,0,0,0.15)' }">

            <!-- Header bar with gradient accent -->
            <div class="px-5 pt-5 pb-4" :style="{ background: isDark ? '#1a1e2e' : '#f8faff', borderRadius: '16px 16px 0 0', borderBottom: isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid #e8edf5' }">
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                        <div class="w-9 h-9 rounded-xl flex items-center justify-center" style="background: linear-gradient(135deg,#6366f1,#8b5cf6)">
                            <span class="material-symbols-outlined text-white text-[18px]">video_call</span>
                        </div>
                        <div>
                            <h3 class="font-bold text-[15px]" :style="{ color: isDark ? '#f1f5f9' : '#0f172a' }">Meetings</h3>
                            <p class="text-[11px]" :style="{ color: isDark ? '#64748b' : '#94a3b8' }">
                                {{ meetings.length > 0 ? `${meetings.length} scheduled` : 'No meetings yet' }}
                            </p>
                        </div>
                    </div>
                    <div class="flex items-center gap-2">
                        <button v-if="!isCreating && !isEditing" @click.stop="startCreating"
                            class="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
                            style="background: linear-gradient(135deg,#6366f1,#8b5cf6); color: white;">
                            <span class="material-symbols-outlined text-[14px]">add</span>
                            Schedule
                        </button>
                        <button v-else @click.stop="cancelEdit"
                            class="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                            :style="{ background: isDark ? 'rgba(239,68,68,0.15)' : '#fef2f2', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }">
                            <span class="material-symbols-outlined text-[14px]">close</span>
                            Cancel
                        </button>
                    </div>
                </div>
            </div>

            <!-- VIEW MODE -->
            <div v-if="!isCreating && !isEditing" class="max-h-[480px] overflow-y-auto no-scrollbar">

                <div v-if="isLoadingMeetings" class="py-12 text-center">
                    <span class="material-symbols-outlined text-4xl animate-spin mb-3" :style="{ color: isDark ? '#475569' : '#94a3b8' }">progress_activity</span>
                    <p class="text-sm" :style="{ color: isDark ? '#475569' : '#94a3b8' }">Loading meetings...</p>
                </div>

                <div v-else-if="meetingError" class="py-10 px-5 text-center space-y-3">
                    <span class="material-symbols-outlined text-4xl" style="color:#ef4444">error_outline</span>
                    <p class="text-sm" :style="{ color: isDark ? '#94a3b8' : '#64748b' }">{{ meetingError }}</p>
                    <button @click="loadMeetings" class="text-xs font-semibold px-4 py-1.5 rounded-lg" style="background:rgba(99,102,241,0.1);color:#6366f1">Retry</button>
                </div>

                <div v-else-if="meetings.length === 0" class="py-14 px-5 text-center">
                    <div class="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center" :style="{ background: isDark ? 'rgba(99,102,241,0.1)' : '#f0f0ff' }">
                        <span class="material-symbols-outlined text-3xl" style="color:#6366f1">event_note</span>
                    </div>
                    <p class="font-semibold text-sm mb-1" :style="{ color: isDark ? '#e2e8f0' : '#1e293b' }">No meetings scheduled</p>
                    <p class="text-xs mb-4" :style="{ color: isDark ? '#475569' : '#94a3b8' }">Schedule your first meeting to get started</p>
                    <button @click.stop="startCreating" class="text-xs font-semibold px-4 py-2 rounded-lg text-white" style="background:linear-gradient(135deg,#6366f1,#8b5cf6)">
                        + Schedule Meeting
                    </button>
                </div>

                <div v-else class="p-3 space-y-2">
                    <div v-for="meeting in sortedMeetings" :key="meeting.id"
                        class="group rounded-xl p-4 cursor-pointer select-none transition-all border"
                        :style="{ background: isDark ? '#1e2235' : '#f8faff', borderColor: isDark ? 'rgba(255,255,255,0.06)' : '#e8edf5' }"
                        @click.stop="handleMeetingClick($event, meeting)" :title="meetingCardTitle(meeting)">

                        <!-- Live pulse + topic row -->
                        <div class="flex items-start justify-between gap-2 mb-2">
                            <div class="flex items-center gap-2 min-w-0">
                                <span v-if="isMeetingLive(meeting)" class="flex h-2 w-2 shrink-0 relative">
                                    <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span class="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                </span>
                                <h4 class="font-semibold text-sm truncate" :style="{ color: isDark ? '#f1f5f9' : '#0f172a' }">{{ meeting.topic }}</h4>
                            </div>
                            <span class="shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full" :style="{ background: isDark ? 'rgba(255,255,255,0.08)' : '#e8edf5', color: isDark ? '#94a3b8' : '#64748b' }">
                                {{ formatDate(meeting.date) }}
                            </span>
                        </div>

                        <!-- Meta row -->
                        <div class="flex items-center gap-2 mb-3">
                            <span class="text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1"
                                :class="getPlatformConfig(getMeetingPlatform(meeting)).badgeClass">
                                <span class="w-1.5 h-1.5 rounded-full inline-block shrink-0" :class="getPlatformConfig(getMeetingPlatform(meeting)).dotClass"></span>
                                {{ getPlatformConfig(getMeetingPlatform(meeting)).label }}
                            </span>
                            <span class="text-[11px] flex items-center gap-1" :style="{ color: isDark ? '#64748b' : '#94a3b8' }">
                                <span class="material-symbols-outlined text-[12px]">schedule</span>
                                {{ meeting.startTime }} – {{ meeting.endTime }}
                            </span>
                        </div>

                        <p v-if="meeting.description" class="text-xs mb-3 line-clamp-1" :style="{ color: isDark ? '#64748b' : '#94a3b8' }">{{ meeting.description }}</p>

                        <!-- Footer: avatars + actions -->
                        <div class="flex items-center justify-between">
                            <div class="flex -space-x-1.5">
                                <div v-for="uid in meeting.participants.slice(0, 4)" :key="uid"
                                    class="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold ring-2 ring-white dark:ring-[#1e2235]"
                                    :style="{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: 'white' }"
                                    :title="getUserName(uid)">{{ getUserInitials(uid) }}</div>
                                <div v-if="meeting.participants.length > 4"
                                    class="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold ring-2 ring-white dark:ring-[#1e2235]"
                                    :style="{ background: isDark ? '#2d3348' : '#e8edf5', color: isDark ? '#94a3b8' : '#64748b' }">
                                    +{{ meeting.participants.length - 4 }}
                                </div>
                            </div>
                            <div class="flex items-center gap-1.5">
                                <button v-if="canManageMeeting(meeting)" @click.stop="deleteMeeting(meeting.id)"
                                    class="w-7 h-7 flex items-center justify-center rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                    :style="{ color: '#ef4444', background: isDark ? 'rgba(239,68,68,0.1)' : '#fef2f2' }">
                                    <span class="material-symbols-outlined text-[15px]">delete</span>
                                </button>
                                <button @click.stop="joinMeeting(meeting)"
                                    class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-all"
                                    style="background: linear-gradient(135deg,#6366f1,#8b5cf6); box-shadow: 0 2px 8px rgba(99,102,241,0.35)">
                                    <span class="material-symbols-outlined text-[13px]">videocam</span>
                                    Join
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- CREATE / EDIT FORM -->
            <div v-else class="max-h-[520px] overflow-y-auto no-scrollbar">
                <div class="p-5 space-y-4">

                    <div v-if="meetingError" class="rounded-xl px-4 py-3 text-xs font-medium flex items-center gap-2" style="background:rgba(239,68,68,0.1);color:#ef4444;border:1px solid rgba(239,68,68,0.2)">
                        <span class="material-symbols-outlined text-[15px]">error</span>
                        {{ meetingError }}
                    </div>

                    <!-- Topic -->
                    <div>
                        <label class="block text-xs font-semibold mb-1.5" :style="{ color: isDark ? '#94a3b8' : '#64748b' }">Meeting Topic</label>
                        <input v-model="form.topic" type="text" placeholder="e.g. Weekly Sync"
                            class="w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-all"
                            :style="{ background: isDark ? '#1e2235' : '#f8faff', border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0', color: isDark ? '#f1f5f9' : '#0f172a' }">
                    </div>

                    <!-- Platform -->
                    <div>
                        <label class="block text-xs font-semibold mb-1.5" :style="{ color: isDark ? '#94a3b8' : '#64748b' }">Platform</label>
                        <div class="grid grid-cols-2 gap-2">
                            <button v-for="p in platformOptions" :key="p.id"
                                type="button" @click="form.meetingType = p.id"
                                class="py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all border-2"
                                :class="form.meetingType === p.id ? p.activeClass : 'border-transparent'"
                                :style="form.meetingType !== p.id ? { background: isDark ? '#1e2235' : '#f1f5f9', color: isDark ? '#64748b' : '#94a3b8' } : {}">
                                <span class="w-2 h-2 rounded-full shrink-0" :class="p.dotColor"></span>
                                {{ p.label }}
                            </button>
                        </div>
                    </div>

                    <!-- Jitsi info / link input -->
                    <div v-if="form.meetingType === 'jitsi'" class="flex items-start gap-3 rounded-xl px-4 py-3" style="background:rgba(139,92,246,0.1);border:1px solid rgba(139,92,246,0.2)">
                        <span class="material-symbols-outlined text-[18px] mt-0.5 shrink-0" style="color:#8b5cf6">auto_awesome</span>
                        <p class="text-xs leading-relaxed" style="color:#8b5cf6">
                            A private video room is <strong>auto-generated and runs inside the app</strong> — no link needed.
                        </p>
                    </div>
                    <div v-else>
                        <label class="block text-xs font-semibold mb-1.5" :style="{ color: isDark ? '#94a3b8' : '#64748b' }">Meeting Link</label>
                        <input v-model="form.link" type="text" :placeholder="linkPlaceholder"
                            class="w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-all"
                            :style="{ background: isDark ? '#1e2235' : '#f8faff', border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0', color: '#6366f1' }">
                        <p v-if="form.link && getMeetingPlatform(form)" class="text-[10px] mt-1.5 flex items-center gap-1.5" :class="getPlatformConfig(getMeetingPlatform(form)).badgeClass.split(' ')[2]">
                            <span class="w-1.5 h-1.5 rounded-full" :class="getPlatformConfig(getMeetingPlatform(form)).dotClass"></span>
                            Detected: {{ getPlatformConfig(getMeetingPlatform(form)).label }}
                        </p>
                    </div>

                    <!-- Date + Time row -->
                    <div class="grid grid-cols-3 gap-2">
                        <div class="col-span-3">
                            <label class="block text-xs font-semibold mb-1.5" :style="{ color: isDark ? '#94a3b8' : '#64748b' }">Date</label>
                            <input v-model="form.date" type="date"
                                class="w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-all"
                                :style="{ background: isDark ? '#1e2235' : '#f8faff', border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0', color: isDark ? '#f1f5f9' : '#0f172a' }">
                        </div>
                        <div>
                            <label class="block text-xs font-semibold mb-1.5" :style="{ color: isDark ? '#94a3b8' : '#64748b' }">Start</label>
                            <input v-model="form.startTime" type="time"
                                class="w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none transition-all"
                                :style="{ background: isDark ? '#1e2235' : '#f8faff', border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0', color: isDark ? '#f1f5f9' : '#0f172a' }">
                        </div>
                        <div class="col-span-2">
                            <label class="block text-xs font-semibold mb-1.5" :style="{ color: isDark ? '#94a3b8' : '#64748b' }">End</label>
                            <input v-model="form.endTime" type="time"
                                class="w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none transition-all"
                                :style="{ background: isDark ? '#1e2235' : '#f8faff', border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0', color: isDark ? '#f1f5f9' : '#0f172a' }">
                        </div>
                    </div>

                    <!-- Description -->
                    <div>
                        <label class="block text-xs font-semibold mb-1.5" :style="{ color: isDark ? '#94a3b8' : '#64748b' }">Description <span class="font-normal opacity-60">(optional)</span></label>
                        <textarea v-model="form.description" rows="2" placeholder="Agenda or notes..."
                            class="w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-all resize-none"
                            :style="{ background: isDark ? '#1e2235' : '#f8faff', border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0', color: isDark ? '#f1f5f9' : '#0f172a' }"></textarea>
                    </div>

                    <!-- Participants -->
                    <div class="rounded-xl overflow-hidden" :style="{ border: isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid #e2e8f0' }">
                        <div class="px-4 py-3 flex items-center justify-between" :style="{ background: isDark ? '#1a1e2e' : '#f8faff' }">
                            <span class="text-xs font-semibold" :style="{ color: isDark ? '#94a3b8' : '#64748b' }">Participants</span>
                            <span class="text-[10px] font-semibold px-2 py-0.5 rounded-full" style="background:rgba(99,102,241,0.12);color:#6366f1">
                                {{ selectedParticipantCount }} added
                            </span>
                        </div>
                        <div class="px-4 py-2 flex gap-2" :style="{ borderTop: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid #f1f5f9' }">
                            <select v-model="filters.hub" class="flex-1 rounded-lg px-2 py-1.5 text-xs focus:outline-none"
                                :style="{ background: isDark ? '#1e2235' : '#f1f5f9', color: isDark ? '#94a3b8' : '#64748b', border: 'none' }">
                                <option value="">All Hubs</option>
                                <option v-for="hub in store.hubs" :key="hub.id" :value="hub.id">{{ hub.name }}</option>
                            </select>
                            <select v-model="filters.role" class="flex-1 rounded-lg px-2 py-1.5 text-xs focus:outline-none"
                                :style="{ background: isDark ? '#1e2235' : '#f1f5f9', color: isDark ? '#94a3b8' : '#64748b', border: 'none' }">
                                <option value="">All Roles</option>
                                <option v-for="role in roleOptions" :key="role" :value="role">{{ role }}</option>
                            </select>
                        </div>
                        <div class="max-h-36 overflow-y-auto divide-y" :style="{ borderTop: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid #f1f5f9', divideColor: isDark ? 'rgba(255,255,255,0.04)' : '#f1f5f9' }">
                            <div v-if="filteredUsers.length === 0" class="p-4 text-center text-xs" :style="{ color: isDark ? '#475569' : '#94a3b8' }">No users found.</div>
                            <label v-for="user in filteredUsers" :key="user.id"
                                class="flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors"
                                :style="{ borderBottom: isDark ? '1px solid rgba(255,255,255,0.04)' : '1px solid #f8faff' }"
                                :class="isDark ? 'hover:bg-white/5' : 'hover:bg-indigo-50/50'">
                                <input type="checkbox" :value="user.id" v-model="form.participants"
                                    class="w-4 h-4 rounded accent-indigo-500">
                                <div class="flex-1 min-w-0">
                                    <div class="text-sm font-medium truncate" :style="{ color: isDark ? '#e2e8f0' : '#1e293b' }">{{ user.name }}</div>
                                    <div class="text-[10px] flex items-center gap-1.5" :style="{ color: isDark ? '#475569' : '#94a3b8' }">
                                        <span>{{ user.role }}</span>
                                        <span class="w-1 h-1 rounded-full" :style="{ background: isDark ? '#334155' : '#cbd5e1' }"></span>
                                        <span>{{ getHubName(user.hubId) }}</span>
                                    </div>
                                </div>
                            </label>
                        </div>
                    </div>
                </div>

                <!-- Sticky footer -->
                <div class="px-5 pb-5">
                    <button @click="saveMeeting"
                        class="w-full py-3 rounded-xl text-sm font-bold text-white transition-all"
                        :style="isValid && !isSaving ? 'background:linear-gradient(135deg,#6366f1,#8b5cf6);box-shadow:0 4px 14px rgba(99,102,241,0.4)' : 'background:#94a3b8;cursor:not-allowed'"
                        :disabled="!isValid || isSaving">
                        <span class="flex items-center justify-center gap-2">
                            <span class="material-symbols-outlined text-[16px]">{{ isSaving ? 'hourglass_top' : (isEditing ? 'edit_calendar' : 'event_available') }}</span>
                            {{ isSaving ? (isEditing ? 'Updating...' : 'Scheduling...') : (isEditing ? 'Update Schedule' : 'Schedule Meeting') }}
                        </span>
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { authenticatedJsonRequest } from '@/config/api'
import { useLogisticStore } from '@/stores/logisticStore'
import { useDispatcherStore } from '@/stores/dispatcherStore'
import { useAuthStore } from '@/stores/authStore'

const store = useLogisticStore()
const dispatchStore = useDispatcherStore()

const isDark = computed(() => document.documentElement.classList.contains('dark'))
const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()
const isOpen = ref(false)
const popoverRef = ref(null)

const isCreating = ref(false)
const isEditing = ref(false)
const isSaving = ref(false)
const isLoadingMeetings = ref(false)
const isLoadingParticipants = ref(false)
const meetingError = ref('')
const editId = ref(null)
const participantOptions = ref([])

const detectPlatform = (url) => {
    if (!url) return 'other'
    const lower = url.toLowerCase()
    if (lower.includes('meet.jit.si')) return 'jitsi'
    if (lower.includes('meet.google.com')) return 'gmeet'
    if (lower.includes('zoom.us') || lower.includes('zoom.com')) return 'zoom'
    return 'other'
}

const generateJitsiUrl = (topic) => {
    const slug = (topic || 'meeting')
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .substring(0, 30)
    const id = Math.random().toString(36).substring(2, 8)
    return `https://meet.jit.si/logistics-${slug}-${id}`
}

const normalizeMeetingUrl = (value) => {
    const trimmed = String(value || '').trim()
    if (!trimmed) return ''
    if (/^https?:\/\//i.test(trimmed)) return trimmed
    if (/^(meet\.google\.com|[\w-]+\.zoom\.(us|com)|zoom\.us|zoom\.com)/i.test(trimmed)) {
        return `https://${trimmed}`
    }
    return trimmed
}

const platformOptions = [
    {
        id: 'jitsi',
        label: 'Video Call (In-App)',
        dotColor: 'bg-violet-500',
        activeClass: 'border-violet-500 bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-400'
    },
    {
        id: 'gmeet',
        label: 'Google Meet',
        dotColor: 'bg-green-500',
        activeClass: 'border-green-500 bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400'
    },
    {
        id: 'zoom',
        label: 'Zoom',
        dotColor: 'bg-blue-500',
        activeClass: 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400'
    },
    {
        id: 'other',
        label: 'Other',
        dotColor: 'bg-gray-400',
        activeClass: 'border-gray-400 bg-gray-50 dark:bg-white/10 text-gray-700 dark:text-gray-300'
    }
]

const getPlatformConfig = (type) => {
    const configs = {
        jitsi: {
            label: 'Video Call',
            badgeClass: 'bg-violet-100 dark:bg-violet-500/15 text-violet-700 dark:text-violet-400',
            dotClass: 'bg-violet-500',
            joinClass: 'bg-violet-600 hover:bg-violet-700 text-white'
        },
        gmeet: {
            label: 'Google Meet',
            badgeClass: 'bg-green-100 dark:bg-green-500/15 text-green-700 dark:text-green-400',
            dotClass: 'bg-green-500',
            joinClass: 'bg-green-600 hover:bg-green-700 text-white'
        },
        zoom: {
            label: 'Zoom',
            badgeClass: 'bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400',
            dotClass: 'bg-blue-500',
            joinClass: 'bg-blue-600 hover:bg-blue-700 text-white'
        },
        other: {
            label: 'Meeting',
            badgeClass: 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300',
            dotClass: 'bg-gray-400',
            joinClass: 'bg-primary hover:bg-primary/90 text-white'
        }
    }
    return configs[type] || configs.other
}

const getMeetingPlatform = (meeting) => meeting.meetingType || detectPlatform(meeting.link)

const todayDate = () => new Date().toISOString().split('T')[0]
const normalizeId = (value) => value == null ? '' : String(value)
const titleCase = (value) => String(value || 'User')
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())

const normalizeMeeting = (meeting) => {
    if (!meeting || typeof meeting !== 'object') return null

    const explicitType = String(meeting.meetingType || meeting.meeting_type || '').toLowerCase()
    const meetingType = ['gmeet', 'zoom', 'jitsi', 'other'].includes(explicitType)
        ? explicitType
        : detectPlatform(meeting.link)

    return {
        id: normalizeId(meeting.id),
        topic: String(meeting.topic || '').trim(),
        description: String(meeting.description || '').trim(),
        meetingType,
        link: normalizeMeetingUrl(meeting.link),
        date: String(meeting.date || ''),
        startTime: String(meeting.startTime || meeting.start_time || ''),
        endTime: String(meeting.endTime || meeting.end_time || ''),
        participants: Array.isArray(meeting.participants)
            ? meeting.participants.map(normalizeId).filter(Boolean)
            : [],
        createdById: normalizeId(meeting.createdById || meeting.created_by_id),
        warehouseId: normalizeId(meeting.warehouseId || meeting.warehouse_id),
        createdAt: String(meeting.createdAt || meeting.created_at || ''),
        updatedAt: String(meeting.updatedAt || meeting.updated_at || '')
    }
}

const meetings = ref([])

const defaultForm = {
    topic: '',
    link: '',
    meetingType: 'jitsi',
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

const currentUserId = computed(() => normalizeId(authStore.currentUser?.id))

const legacyAvailableUsers = computed(() => {
    const registry = new Map()

    const upsertUser = (user) => {
        const id = normalizeId(user?.id)
        const name = String(user?.name || '').trim()
        if (!id || !name) return

        registry.set(id, {
            id,
            name,
            role: String(user.role || 'User').trim() || 'User',
            hubId: user.hubId ? normalizeId(user.hubId) : '',
        })
    }

    store.users.forEach((user) => {
        upsertUser({
            id: user.id,
            name: user.name || user.email,
            role: user.role || 'User',
            hubId: user.hubId,
        })
    })

    store.drivers.forEach((driver) => {
        upsertUser({
            id: driver.id,
            name: driver.name,
            role: 'Driver',
            hubId: driver.hubId,
        })
    })

    dispatchStore.dispatcherContacts.forEach((contact) => {
        upsertUser({
            id: contact.id,
            name: contact.name,
            role: titleCase(contact.role || contact.type || 'User'),
            hubId: authStore.currentUser?.warehouse_id,
        })
    })

    if (authStore.currentUser) {
        upsertUser({
            id: authStore.currentUser.id,
            name: authStore.currentUser.name || authStore.userEmail,
            role: titleCase(authStore.currentUser.role || authStore.userRole || 'User'),
            hubId: authStore.currentUser.warehouse_id,
        })
    }

    return [...registry.values()].sort((a, b) => a.name.localeCompare(b.name))
})

const availableUsers = computed(() => {
    if (participantOptions.value.length > 0) {
        return participantOptions.value
    }
    return legacyAvailableUsers.value
})

const upcomingMeetingsCount = computed(() => meetings.value.length)
const roleOptions = computed(() => [...new Set(availableUsers.value.map((user) => user.role).filter(Boolean))])
const selectedParticipantCount = computed(() => form.value.participants.filter((id) => id !== currentUserId.value).length)

const sortedMeetings = computed(() => {
    return [...meetings.value].sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.startTime}`)
        const dateB = new Date(`${b.date}T${b.startTime}`)
        return dateA - dateB
    })
})

const filteredUsers = computed(() => {
    return availableUsers.value.filter((user) => {
        if (user.id === currentUserId.value) return false
        const matchHub = filters.value.hub ? user.hubId === filters.value.hub : true
        const matchRole = filters.value.role ? user.role === filters.value.role : true
        return matchHub && matchRole
    })
})

const isValid = computed(() => {
    const linkOk = form.value.meetingType === 'jitsi' || Boolean(form.value.link.trim())
    return Boolean(
        form.value.topic.trim() &&
        linkOk &&
        form.value.date &&
        form.value.startTime &&
        form.value.endTime &&
        form.value.endTime > form.value.startTime &&
        form.value.participants.length > 0
    )
})

const linkPlaceholder = computed(() => {
    const map = {
        jitsi: 'Room auto-created — no link needed',
        gmeet: 'Paste Google Meet URL',
        zoom: 'Paste Zoom meeting URL',
        other: 'Paste meeting URL'
    }
    return map[form.value.meetingType] || map.other
})

const canManageMeeting = (meeting) => normalizeId(meeting?.createdById) === currentUserId.value
const meetingCardTitle = (meeting) => canManageMeeting(meeting) ? 'Triple click to edit' : 'Scheduled meeting'

watch(() => form.value.link, (newLink) => {
    form.value.meetingType = detectPlatform(newLink)
})

watch(isOpen, (open) => {
    if (open) {
        loadMeetings()
    }
})

const upsertMeeting = (meeting) => {
    const normalized = normalizeMeeting(meeting)
    if (!normalized) return

    const index = meetings.value.findIndex((item) => item.id === normalized.id)
    if (index === -1) {
        meetings.value.push(normalized)
        return
    }

    meetings.value[index] = normalized
}

const loadMeetings = async () => {
    isLoadingMeetings.value = true
    meetingError.value = ''

    try {
        const data = await authenticatedJsonRequest('api/v1/logistics/meetings')
        meetings.value = Array.isArray(data)
            ? data.map(normalizeMeeting).filter(Boolean)
            : []
    } catch (error) {
        meetingError.value = error instanceof Error ? error.message : 'Unable to load meetings.'
        meetings.value = []
    } finally {
        isLoadingMeetings.value = false
    }
}

const loadParticipantOptions = async () => {
    isLoadingParticipants.value = true

    try {
        const data = await authenticatedJsonRequest('api/v1/logistics/meeting-participants')
        participantOptions.value = Array.isArray(data)
            ? data.map((user) => ({
                id: normalizeId(user.id),
                name: String(user.name || '').trim(),
                role: String(user.role || 'User').trim() || 'User',
                hubId: normalizeId(user.hub_id),
            })).filter((user) => user.id && user.name)
            : []
    } catch {
        participantOptions.value = []
    } finally {
        isLoadingParticipants.value = false
    }
}

const togglePopover = () => {
    isOpen.value = !isOpen.value
    if (!isOpen.value) cancelEdit()
}

const startCreating = () => {
    isCreating.value = true
    isEditing.value = false
    editId.value = null
    form.value = {
        ...defaultForm,
        date: todayDate(),
        participants: currentUserId.value ? [currentUserId.value] : []
    }
}

const cancelEdit = () => {
    isCreating.value = false
    isEditing.value = false
    editId.value = null
    form.value = { ...defaultForm }
}

const editMeeting = (meeting) => {
    if (!canManageMeeting(meeting)) return

    isCreating.value = false
    isEditing.value = true
    editId.value = meeting.id
    form.value = {
        topic: meeting.topic,
        link: meeting.link,
        meetingType: meeting.meetingType,
        date: meeting.date,
        startTime: meeting.startTime,
        endTime: meeting.endTime,
        description: meeting.description,
        participants: [...meeting.participants]
    }
}

const handleMeetingClick = (event, meeting) => {
    if (event.detail === 3 && canManageMeeting(meeting)) {
        editMeeting(meeting)
        event.stopPropagation()
    }
}

const saveMeeting = async () => {
    if (!isValid.value) return

    isSaving.value = true
    meetingError.value = ''

    const resolvedLink = form.value.meetingType === 'jitsi'
        ? generateJitsiUrl(form.value.topic)
        : normalizeMeetingUrl(form.value.link)

    const payload = {
        topic: form.value.topic.trim(),
        description: form.value.description.trim(),
        meeting_type: form.value.meetingType,
        link: resolvedLink,
        date: form.value.date,
        start_time: form.value.startTime,
        end_time: form.value.endTime,
        participants: form.value.participants,
    }

    try {
        const response = isEditing.value
            ? await authenticatedJsonRequest(`api/v1/logistics/meetings/${editId.value}`, {
                method: 'PUT',
                body: JSON.stringify(payload),
            })
            : await authenticatedJsonRequest('api/v1/logistics/meetings', {
                method: 'POST',
                body: JSON.stringify(payload),
            })

        upsertMeeting(response)
        cancelEdit()
    } catch (error) {
        meetingError.value = error instanceof Error ? error.message : 'Unable to save meeting.'
    } finally {
        isSaving.value = false
    }
}

const deleteMeeting = async (id) => {
    const meeting = meetings.value.find((item) => item.id === normalizeId(id))
    if (!meeting || !canManageMeeting(meeting)) return

    meetingError.value = ''

    try {
        await authenticatedJsonRequest(`api/v1/logistics/meetings/${id}`, {
            method: 'DELETE',
        })
        meetings.value = meetings.value.filter((item) => item.id !== normalizeId(id))
    } catch (error) {
        meetingError.value = error instanceof Error ? error.message : 'Unable to delete meeting.'
    }
}

const getRoutePrefix = (path) => {
    if (path.startsWith('/warehouse')) return '/warehouse'
    if (path.startsWith('/dispatcher')) return '/dispatcher'
    return '/logistic'
}

const joinMeeting = (meeting) => {
    const prefix = getRoutePrefix(route.path)
    const normalizedUrl = normalizeMeetingUrl(meeting.link)
    router.push({
        path: `${prefix}/meeting-room`,
        query: {
            url: normalizedUrl,
            title: meeting.topic,
            type: getMeetingPlatform(meeting)
        }
    })
    isOpen.value = false
}

const getHubName = (hubId) => {
    const hub = store.hubs?.find((item) => item.id === hubId)
    return hub ? hub.name : hubId
}

const getUserName = (id) => availableUsers.value.find((user) => user.id === normalizeId(id))?.name || 'Unknown'

const getUserInitials = (id) => {
    const name = getUserName(id)
    return name
        .split(' ')
        .map((part) => part[0])
        .filter(Boolean)
        .join('')
        .substring(0, 2)
        .toUpperCase() || '?'
}

const formatDate = (dateStr) => {
    const dateValue = new Date(dateStr)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    if (dateValue.toDateString() === today.toDateString()) return 'Today'
    if (dateValue.toDateString() === tomorrow.toDateString()) return 'Tomorrow'

    return dateValue.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

const isMeetingLive = (meeting) => {
    const now = new Date()
    const start = new Date(`${meeting.date}T${meeting.startTime}`)
    const end = new Date(`${meeting.date}T${meeting.endTime}`)
    return now >= new Date(start.getTime() - 10 * 60000) && now <= end
}

const handleClickOutside = (event) => {
    if (popoverRef.value && !popoverRef.value.contains(event.target)) {
        isOpen.value = false
    }
}

onMounted(() => {
    document.addEventListener('click', handleClickOutside)

    if (!store.initialized && authStore.userRole !== 'DISPATCHER') {
        store.initialize().catch(() => {})
    }

    if (authStore.userRole === 'DISPATCHER' && dispatchStore.dispatcherContacts.length === 0) {
        dispatchStore.initialize().catch(() => {})
    }

    loadMeetings()
    loadParticipantOptions()
})

onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
})
</script>
