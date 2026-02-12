<template>
  <!-- Floating Voice Assistant Button -->
  <div v-if="!isActive" class="fixed left-6 bottom-32 z-50">
    <button 
      @click="toggleVoice"
      class="group relative w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center shadow-ai-glow transition-all active:scale-95 hover:bg-blue-500"
    >
      <div class="absolute inset-0 rounded-full border border-blue-400 opacity-50 animate-ping"></div>
      <span class="material-icons text-white text-2xl z-10">mic</span>
    </button>
  </div>

  <!-- Voice Assistant Overlay -->
  <Transition name="fade">
    <div v-if="isActive" class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <div class="bg-surface-dark/90 backdrop-blur-xl rounded-3xl p-8 max-w-md w-full border border-white/10">
        <!-- Close Button -->
        <button @click="toggleVoice" class="absolute top-4 right-4 text-white/60 hover:text-white">
          <span class="material-icons">close</span>
        </button>

        <!-- Mic Animation -->
        <div class="flex flex-col items-center mb-6">
          <div :class="['w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center mb-4', isListening && 'animate-pulse']">
            <span class="material-icons text-white text-5xl">{{ isListening ? 'mic' : 'mic_off' }}</span>
          </div>
          
          <h3 class="text-white text-xl font-bold mb-2">
            {{ isListening ? 'Listening...' : 'AI Assistant' }}
          </h3>
          <p class="text-gray-400 text-sm text-center">
            {{ isListening ? 'Speak your command' : 'Tap to activate' }}
          </p>
        </div>

        <!-- Waveform Visualization (when listening) -->
        <div v-if="isListening" class="flex items-center justify-center gap-1 h-16 mb-6">
          <div v-for="i in 20" :key="i" class="w-1 bg-blue-500 rounded-full animate-pulse" :style="`height: ${Math.random() * 60 + 10}px; animation-delay: ${i * 50}ms`"></div>
        </div>

        <!-- Recent Command / Response -->
        <div v-if="lastCommand" class="bg-white/5 rounded-xl p-4 mb-4">
          <p class="text-white/60 text-xs mb-1">You said:</p>
          <p class="text-white font-medium">{{ lastCommand }}</p>
        </div>

        <div v-if="lastResponse" class="bg-primary/10 border border-primary/20 rounded-xl p-4 mb-6">
          <p class="text-primary/60 text-xs mb-1">AI Response:</p>
          <p class="text-white font-medium">{{ lastResponse }}</p>
        </div>

        <!-- Quick Commands -->
        <div class="space-y-2">
          <p class="text-white/40 text-xs uppercase tracking-wider mb-3">Quick Commands</p>
          <button 
            v-for="cmd in quickCommands" 
            :key="cmd"
            @click="executeCommand(cmd)"
            class="w-full text-left px-4 py-3 bg-white/5 hover:bg-white/10 rounded-lg text-white text-sm transition-colors"
          >
            {{ cmd }}
          </button>
        </div>

        <!-- Activate Button -->
        <button 
          v-if="!isListening"
          @click="startListening"
          class="w-full mt-6 bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-xl font-bold"
        >
          Start Voice Command
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref } from 'vue'

const isActive = ref(false)
const isListening = ref(false)
const lastCommand = ref('')
const lastResponse = ref('')

const quickCommands = [
  'Read next stop',
  'Report delay',
  'Call dispatcher',
  'Add note to delivery'
]

const toggleVoice = () => {
  isActive.value = !isActive.value
  if (!isActive.value) {
    stopListening()
  }
}

const startListening = () => {
  isListening.value = true
  // Simulate voice recognition
  setTimeout(() => {
    stopListening()
    lastCommand.value = 'Read next stop'
    lastResponse.value = 'Next stop is 333 Innovation Drive, 2.4 miles away. ETA 8 minutes.'
  }, 3000)
}

const stopListening = () => {
  isListening.value = false
}

const executeCommand = (cmd) => {
  lastCommand.value = cmd
  // Simulate response
  const responses = {
    'Read next stop': 'Next stop is Warehouse 4B, 1020 Tech Park Dr.',
    'Report delay': 'Delay reported to dispatcher. Reason logged as traffic.',
    'Call dispatcher': 'Connecting to dispatcher...',
    'Add note to delivery': 'Voice note added to current delivery.'
  }
  lastResponse.value = responses[cmd] || 'Command  processed.'
}
</script>

<style scoped>
.shadow-ai-glow {
  box-shadow: 0 0 20px 5px rgba(59, 130, 246, 0.4);
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
