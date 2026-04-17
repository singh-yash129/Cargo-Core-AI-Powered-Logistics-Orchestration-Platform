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
                <p v-if="transcript" class="text-base mt-2 font-medium text-ai-blue">
                    "{{ transcript }}"
                </p>
                <p v-else class="text-sm mt-2 italic" :class="isDark ? 'text-gray-400' : 'text-gray-500'">
                    {{ lastCommand || '"Navigate" • "Chat" • "Wallet" • "Fuel" • "SOS"' }}
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
import { ref, computed, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUiStore } from '../stores/uiStore.js'
import { useJobStore } from '../stores/jobStore.js'
import { useRouteStore } from '../stores/routeStore.js'
import { openExternalNavigation } from '../utils/navigation.js'
import { SpeechRecognition } from '@capacitor-community/speech-recognition'
import { TextToSpeech } from '@capacitor-community/text-to-speech'
import { Capacitor } from '@capacitor/core'

const router = useRouter()
const uiStore = useUiStore()
const jobStore = useJobStore()
const routeStore = useRouteStore()
const isDark = computed(() => uiStore.theme !== 'light')

const listening = ref(false)
const lastCommand = ref('')
const transcript = ref('')

const commands = [
    'Navigate to next stop',
    'Open dispatcher chat',
    'Open manager chat',
    'What is my ETA?',
    'Log fuel receipt',
    'Report route deviation',
    'Activate SOS',
]

// Routes for voice commands
const voiceRoutes = {
    'navigate': '/navigation',
    'navigation': '/navigation',
    'next stop': '/navigation',
    'maps': '/navigation',
    
    'chat': '/chat',
    'dispatcher': '/chat',
    'dispatch': '/chat',
    'manager': '/manager-chat',
    'logistics manager': '/manager-chat',
    'support': '/manager-chat',
    
    'wallet': '/wallet',
    'money': '/wallet',
    'earnings': '/wallet',
    'payment': '/wallet',
    
    'fuel': '/fuel-receipt',
    'petrol': '/fuel-receipt',
    'diesel': '/fuel-receipt',
    
    'deviation': '/route-deviation',
    'detour': '/route-deviation',
    
    'sos': '/crisis',
    'emergency': '/crisis',
    'help': '/crisis',
    'crisis': '/crisis',
    
    'home': '/dashboard',
    'dashboard': '/dashboard',
    
    'manifest': '/manifest',
    'deliveries': '/manifest',
    'stops': '/manifest',
    
    'crew': '/crew',
    'team': '/crew',
    
    'notifications': '/notifications',
    'alerts': '/notifications',
    
    'settings': '/settings',
    
    'summary': '/shift-summary',
    'audit': '/audit',
    'offline': '/offline',
}

function findRoute(text) {
    const lower = text.toLowerCase().trim()
    for (const [keyword, route] of Object.entries(voiceRoutes)) {
        if (lower.includes(keyword)) {
            return { keyword, route }
        }
    }
    return null
}

async function speak(text) {
    // Use native TTS for Android
    if (Capacitor.isNativePlatform()) {
        try {
            await TextToSpeech.speak({
                text: text,
                lang: 'en-US',
                rate: 1.0,
                pitch: 1.0,
                volume: 1.0,
                category: 'ambient'
            })
        } catch (e) {
            console.log('TTS error:', e)
        }
    }
}

function navigateTo(route, keyword) {
    lastCommand.value = `✦ Opening ${keyword}`
    uiStore.showToast(`✦ CargoAI: Opening ${keyword}`, 'success', 1500)
    
    // Speak the action
    speak(`Opening ${keyword}`)
    
    setTimeout(() => router.push(route), 800)
}

function processAndStop() {
    const textToProcess = transcript.value
    listening.value = false
    
    // Stop speech recognition
    try {
        SpeechRecognition.removeAllListeners()
        SpeechRecognition.stop().catch(() => {})
    } catch (e) {}
    
    // Process command
    if (textToProcess) {
        const match = findRoute(textToProcess)
        if (match) {
            navigateTo(match.route, match.keyword)
        } else {
            lastCommand.value = `"${textToProcess}" - Not recognized`
            uiStore.showToast(`Not recognized: "${textToProcess}"`, 'warning', 2000)
            speak(`Sorry, I didn't understand ${textToProcess}`)
        }
    }
    transcript.value = ''
}

async function toggleListen() {
    if (listening.value) {
        // STOP - process transcript immediately
        const textToProcess = transcript.value
        listening.value = false
        
        // Stop speech recognition
        try {
            SpeechRecognition.removeAllListeners()
            SpeechRecognition.stop().catch(() => {})
        } catch (e) {}
        
        // Process command
        if (textToProcess) {
            const match = findRoute(textToProcess)
            if (match) {
                navigateTo(match.route, match.keyword)
            } else {
                lastCommand.value = `"${textToProcess}" - Not recognized`
                uiStore.showToast(`Not recognized: "${textToProcess}"`, 'warning', 2000)
            }
        } else {
            uiStore.showToast('No speech detected', 'warning', 2000)
        }
        transcript.value = ''
    } else {
        // START listening
        await startListening()
    }
}

async function startListening() {
    if (!Capacitor.isNativePlatform()) {
        uiStore.showToast('Voice only works on Android', 'error', 2000)
        return
    }
    
    try {
        // Check permission
        const permStatus = await SpeechRecognition.checkPermissions()
        if (permStatus.speechRecognition !== 'granted') {
            const req = await SpeechRecognition.requestPermissions()
            if (req.speechRecognition !== 'granted') {
                uiStore.showToast('Microphone permission required', 'error', 2000)
                return
            }
        }
        
        // Check availability
        const avail = await SpeechRecognition.available()
        if (!avail.available) {
            uiStore.showToast('Speech recognition not available', 'error', 2000)
            return
        }
        
        transcript.value = ''
        listening.value = true
        
        let autoStopTimer = null
        
        // Listen for partial results
        SpeechRecognition.addListener('partialResults', (data) => {
            if (data.matches && data.matches.length > 0) {
                transcript.value = data.matches[0]
                
                // Reset auto-stop timer every time we get new speech
                if (autoStopTimer) clearTimeout(autoStopTimer)
                
                // Auto-stop 1.5 seconds after last speech
                autoStopTimer = setTimeout(() => {
                    if (listening.value && transcript.value) {
                        // Auto-stop and process
                        processAndStop()
                    }
                }, 1500)
            }
        })
        
        // Start recognition
        await SpeechRecognition.start({
            language: 'en-US',
            maxResults: 3,
            partialResults: true,
            popup: false,
        })
        
        // Fallback: timeout after 6 seconds if no speech
        setTimeout(() => {
            if (listening.value && !transcript.value) {
                listening.value = false
                try {
                    SpeechRecognition.removeAllListeners()
                    SpeechRecognition.stop().catch(() => {})
                } catch (e) {}
                uiStore.showToast('No speech detected. Try again.', 'warning', 2000)
            }
        }, 6000)
        
    } catch (e) {
        listening.value = false
        uiStore.showToast('Voice error: ' + (e.message || e), 'error', 2000)
    }
}

function handleCommand(cmd) {
    lastCommand.value = cmd
    uiStore.showToast(`✦ CargoAI: ${cmd}`, 'info')
    
    if (cmd === 'Navigate to next stop') {
        openNextStopNavigation()
    } else if (cmd === 'Open dispatcher chat') {
        router.push('/chat')
    } else if (cmd === 'Open manager chat') {
        router.push('/manager-chat')
    } else if (cmd === 'What is my ETA?') {
        const eta = routeStore.currentStop?.eta || jobStore.currentStop?.eta || 'Unknown'
        uiStore.showToast(`✦ Your ETA is: ${eta}`, 'info', 3000)
    } else if (cmd === 'Log fuel receipt') {
        router.push('/fuel-receipt')
    } else if (cmd === 'Report route deviation') {
        router.push('/route-deviation')
    } else if (cmd === 'Activate SOS') {
        router.push('/crisis')
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

onUnmounted(() => {
    if (listening.value) {
        try {
            SpeechRecognition.removeAllListeners()
            SpeechRecognition.stop().catch(() => {})
        } catch (e) {}
    }
})
</script>
