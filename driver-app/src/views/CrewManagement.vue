<template>
    <div class="min-h-screen pb-safe-nav overflow-y-auto no-scrollbar"
        :class="isDark ? 'bg-background-dark text-white' : 'bg-background-light text-gray-900'">
        <div class="px-5 pt-5 flex flex-col gap-4">

            <!-- Header -->
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-xs font-bold uppercase tracking-wider text-primary mb-0.5">Crew Management</p>
                    <h1 class="text-3xl font-black tracking-tight">Your Team</h1>
                    <p class="text-sm mt-0.5" :class="isDark ? 'text-gray-400' : 'text-gray-500'">
                        House Shift · 14B Andheri West
                    </p>
                </div>
                <span class="text-xs font-bold px-3 py-1.5 rounded-full border"
                    :class="isDark ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-primary/10 border-primary/30 text-primary'">
                    3 Assigned
                </span>
            </div>

            <!-- Crew Clock-In Cards -->
            <div class="space-y-3">
                <div v-for="member in crew" :key="member.id"
                    class="rounded-2xl p-4 border flex items-center gap-4 transition-all" :class="member.checkInTime
                        ? isDark ? 'bg-primary/8 border-primary/20' : 'bg-primary/8 border-primary/30'
                        : isDark ? 'bg-surface-dark/30 border-white/5' : 'bg-white border-gray-100 shadow-sm'">

                    <!-- Avatar -->
                    <img :src="member.photo" :alt="member.name" class="w-14 h-14 rounded-2xl object-cover border-2"
                        :class="member.checkInTime ? 'border-primary' : isDark ? 'border-gray-700' : 'border-gray-200'" />

                    <!-- Info -->
                    <div class="flex-1 min-w-0">
                        <p class="font-bold">{{ member.name }}</p>
                        <p class="text-xs" :class="isDark ? 'text-gray-400' : 'text-gray-500'">{{ member.role }} · {{
                            member.id }}</p>
                        <div v-if="member.checkInTime" class="flex items-center gap-1 mt-1">
                            <span class="material-icons text-primary text-xs">check_circle</span>
                            <span class="text-xs text-primary font-semibold">Clocked in {{ member.checkInTime }}</span>
                        </div>
                    </div>

                    <!-- Action -->
                    <button v-if="!member.checkInTime" @click="clockIn(member)"
                        class="px-4 py-2 rounded-xl font-bold text-sm text-background-dark active:scale-[0.97] transition-all"
                        style="background: #1CE783;">
                        Clock In
                    </button>
                    <div v-else class="flex flex-col gap-1">
                        <button @click="reportException(member)"
                            class="text-xs px-3 py-1.5 rounded-lg border font-semibold transition-colors"
                            :class="isDark ? 'border-red-500/30 text-red-400 bg-red-500/8 hover:bg-red-500/15' : 'border-red-200 text-red-500 bg-red-50 hover:bg-red-100'">
                            Report
                        </button>
                    </div>
                </div>
            </div>

            <!-- Attendance Summary -->
            <div class="rounded-2xl p-4 border"
                :class="isDark ? 'bg-surface-dark/30 border-white/5' : 'bg-white border-gray-100 shadow-sm'">
                <h3 class="text-xs font-bold uppercase tracking-widest mb-3"
                    :class="isDark ? 'text-gray-400' : 'text-gray-500'">Attendance Summary</h3>
                <div class="grid grid-cols-3 gap-3 text-center">
                    <div>
                        <p class="text-2xl font-black text-primary">{{ clockedIn }}</p>
                        <p class="text-[10px] uppercase" :class="isDark ? 'text-gray-400' : 'text-gray-500'">Clocked In
                        </p>
                    </div>
                    <div>
                        <p class="text-2xl font-black" :class="isDark ? 'text-gray-400' : 'text-gray-600'">{{
                            crew.length - clockedIn }}</p>
                        <p class="text-[10px] uppercase" :class="isDark ? 'text-gray-400' : 'text-gray-500'">Pending</p>
                    </div>
                    <div>
                        <p class="text-2xl font-black text-accent-gold">0</p>
                        <p class="text-[10px] uppercase" :class="isDark ? 'text-gray-400' : 'text-gray-500'">No-Show</p>
                    </div>
                </div>
            </div>

            <!-- CTA -->
            <button @click="proceedToLoad" :disabled="clockedIn < crew.length"
                class="w-full rounded-2xl h-14 flex items-center justify-center gap-2 font-bold text-lg transition-all active:scale-[0.98]"
                :class="clockedIn === crew.length ? 'bg-primary text-background-dark shadow-glow' : isDark ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-gray-100 text-gray-400 cursor-not-allowed'">
                <span class="material-icons">{{ clockedIn === crew.length ? 'check' : 'group' }}</span>
                {{ clockedIn === crew.length ? 'All Clocked In · Proceed' : `${crew.length - clockedIn} crew pending` }}
            </button>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUiStore } from '../stores/uiStore.js'
import { dummyCrewMembers } from '../utils/dummyData.js'

const router = useRouter()
const uiStore = useUiStore()
const isDark = computed(() => uiStore.theme !== 'light')

const crew = ref(dummyCrewMembers.map(m => ({ ...m })))
const clockedIn = computed(() => crew.value.filter(m => m.checkInTime).length)

function clockIn(member) {
    const now = new Date()
    member.checkInTime = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
}

function reportException(member) {
    alert(`Report filed for ${member.name}`)
}

function proceedToLoad() {
    router.push('/load-verify')
}
</script>
