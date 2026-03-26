<template>
    <div class="screen-layout" :class="isDark ? 'bg-background-dark text-white' : 'bg-background-light text-gray-900'">

        <!-- Header -->
        <header class="flex-shrink-0 px-5 pt-5 pb-4 flex items-center justify-between border-b"
            :class="isDark ? 'border-white/5' : 'border-gray-100'">
            <div>
                <p class="text-xs font-bold uppercase tracking-wider text-ai-blue mb-0.5">AI Voice Assistant</p>
                <h1 class="text-2xl font-black tracking-tight">CargoAI ✦</h1>
            </div>
            <button @click="$router.back()" class="w-10 h-10 rounded-full flex items-center justify-center border"
                :class="isDark ? 'bg-surface-dark border-white/5 text-gray-400' : 'bg-white border-gray-200 shadow-sm'">
                <span class="material-icons text-xl">close</span>
            </button>
        </header>

        <!-- Waveform placeholder -->
        <div class="screen-body flex flex-col items-center justify-center px-5 gap-6">

            <!-- AI Avatar -->
            <div class="relative">
                <div class="absolute inset-0 bg-ai-blue/20 rounded-full blur-3xl animate-pulse-slow"></div>
                <div class="relative w-32 h-32 rounded-full flex items-center justify-center border-2"
                    :class="listening ? 'bg-ai-blue/20 border-ai-blue/50' : isDark ? 'bg-surface-dark border-white/10' : 'bg-white border-gray-200'"
                    :style="listening ? 'box-shadow: 0 0 40px rgba(77,163,255,0.3)' : ''">
                    <span class="material-icons text-6xl"
                        :class="listening ? 'text-ai-blue' : isDark ? 'text-gray-400' : 'text-gray-400'">{{ listening ?
                            'mic' : 'smart_toy' }}</span>
                </div>
                <div v-if="listening"
                    class="absolute -inset-4 rounded-full border border-ai-blue/20 animate-ping opacity-40"></div>
            </div>

            <!-- Text -->
            <div class="text-center px-4">
                <p class="text-lg font-bold" :class="isDark ? 'text-white' : 'text-gray-800'">{{ listening ?
                    'Listening...' : 'Say a command' }}</p>
                <p class="text-sm mt-2 italic" :class="isDark ? 'text-gray-400' : 'text-gray-500'">
                    "{{ lastCommand || 'Navigate to next stop • Call dispatcher • Log fuel receipt • Report accident'
                    }}"
                </p>
            </div>

            <!-- Suggestion Chips -->
            <div class="w-full flex flex-wrap gap-2 justify-center">
                <button v-for="cmd in commands" :key="cmd" @click="handleCommand(cmd)"
                    class="text-xs font-semibold px-4 py-2 rounded-full border transition-all active:scale-95"
                    :class="isDark ? 'border-ai-blue/20 bg-ai-blue/8 text-ai-blue hover:bg-ai-blue/15' : 'border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100'">
                    ✦ {{ cmd }}
                </button>
            </div>
        </div>

        <!-- Mic Button Footer -->
        <div class="screen-footer flex justify-center py-6"
            :class="isDark ? 'bg-background-dark' : 'bg-background-light'">
            <button @click="toggleListen"
                class="w-20 h-20 rounded-full flex items-center justify-center text-3xl transition-all active:scale-[0.97]"
                :class="listening
                    ? 'bg-red-500 text-white'
                    : isDark ? 'bg-ai-blue/20 border border-ai-blue/30 text-ai-blue' : 'bg-blue-100 border border-blue-200 text-blue-600'"
                :style="listening ? 'box-shadow: 0 0 30px rgba(239,68,68,0.5)' : ''">
                <span class="material-icons text-4xl">{{ listening ? 'stop' : 'mic' }}</span>
            </button>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUiStore } from '../stores/uiStore.js'
import { useJobStore } from '../stores/jobStore.js'
import { useRouteStore } from '../stores/routeStore.js'
import { openExternalNavigation } from '../utils/navigation.js'

const router = useRouter()
const uiStore = useUiStore()
const jobStore = useJobStore()
const routeStore = useRouteStore()
const isDark = computed(() => uiStore.theme !== 'light')

const listening = ref(false)
const lastCommand = ref('')

const commands = [
    'Navigate to next stop',
    'Open dispatcher chat',
    'What is my ETA?',
    'Log fuel receipt',
    'Report route deviation',
    'Activate SOS',
]

const commandRoutes = {
    'Navigate to next stop': '/navigation',
    'Open dispatcher chat': '/chat',
    'Log fuel receipt': '/fuel-receipt',
    'Report route deviation': '/route-deviation',
    'Activate SOS': '/crisis',
}

function toggleListen() {
    listening.value = !listening.value
    if (listening.value) {
        setTimeout(() => {
            listening.value = false
            lastCommand.value = 'Navigating to next stop...'
            uiStore.showToast('✦ CargoAI: Navigating to next stop', 'info')
            openNextStopNavigation()
        }, 3000)
    }
}

function handleCommand(cmd) {
    lastCommand.value = cmd
    uiStore.showToast(`✦ CargoAI: ${cmd}`, 'info')
    if (cmd === 'Navigate to next stop') {
        setTimeout(() => openNextStopNavigation(), 600)
        return
    }
    const route = commandRoutes[cmd]
    if (route) {
        setTimeout(() => router.push(route), 600)
    }
}

function openNextStopNavigation() {
    const currentStop = routeStore.currentStop
        || jobStore.currentStop
        || jobStore.jobData?.stops?.[0]
        || routeStore.stops?.[0]

    if (!currentStop) {
        uiStore.showToast('No stop available for navigation', 'error', 2200)
        return
    }

    if (!routeStore.stops.length && jobStore.jobData?.stops?.length) {
        routeStore.loadManifest({
            routeId: routeStore.manifest?.routeId || jobStore.jobData?.manifestId || null,
            endTime: routeStore.manifest?.endTime || '--:--',
            stops: jobStore.jobData.stops,
        })
    }

    if (!routeStore.isRouteActive) {
        routeStore.startRoute()
    }

    jobStore.setCurrentStopById(currentStop.id)
    routeStore.setCurrentStopById(currentStop.id)
    jobStore.ensureTransitState({
        startedAt: new Date().toISOString(),
        stopId: currentStop.id,
    })

    try {
        openExternalNavigation(currentStop)
    } catch (error) {
        uiStore.showToast(error.message || 'Unable to open maps', 'error', 2400)
        router.push('/navigation')
    }
}
</script>
