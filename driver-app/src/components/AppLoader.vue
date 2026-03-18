<template>
  <Teleport to="body">
  <Transition name="loading-fade">
    <div v-if="visible" class="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
      style="background: #0F1115;">
      <!-- Ambient blobs -->
      <div class="absolute inset-0 pointer-events-none overflow-hidden">
        <div class="w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] absolute -top-40 -left-40 opacity-30">
        </div>
        <div
          class="w-[400px] h-[400px] bg-accent-blue/10 rounded-full blur-[100px] absolute -bottom-40 -right-40 opacity-20">
        </div>
      </div>

      <!-- Content -->
      <div class="relative z-10 flex flex-col items-center gap-8">
        <!-- Animated Truck Loader (From frontend AppLoading) -->
        <div class="flex items-center justify-center scale-[1.3] my-8">
          <div class="truckWrapper">
            <div class="truckBody">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 198 93" class="w-[130px]">
                <path stroke-width="3" stroke="#282828" fill="#1CE783"
                  d="M135 22.5H177.264C178.295 22.5 179.22 23.133 179.594 24.0939L192.33 56.8443C192.442 57.1332 192.5 57.4404 192.5 57.7504V89C192.5 90.3807 191.381 91.5 190 91.5H135C133.619 91.5 132.5 90.3807 132.5 89V25C132.5 23.6193 133.619 22.5 135 22.5Z">
                </path>
                <path stroke-width="3" stroke="#282828" fill="#7D7C7C"
                  d="M146 33.5H181.741C182.779 33.5 183.709 34.1415 184.078 35.112L190.538 52.112C191.16 53.748 189.951 55.5 188.201 55.5H146C144.619 55.5 143.5 54.3807 143.5 53V36C143.5 34.6193 144.619 33.5 146 33.5Z">
                </path>
                <path stroke-width="2" stroke="#282828" fill="#282828"
                  d="M150 65C150 65.39 149.763 65.8656 149.127 66.2893C148.499 66.7083 147.573 67 146.5 67C145.427 67 144.501 66.7083 143.873 66.2893C143.237 65.8656 143 65.39 143 65C143 64.61 143.237 64.1344 143.873 63.7107C144.501 63.2917 145.427 63 146.5 63C147.573 63 148.499 63.2917 149.127 63.7107C149.763 64.1344 150 64.61 150 65Z">
                </path>
                <rect stroke-width="2" stroke="#282828" fill="#FFFCAB" rx="1" height="7" width="5" y="63" x="187">
                </rect>
                <rect stroke-width="2" stroke="#282828" fill="#282828" rx="1" height="11" width="4" y="81" x="193">
                </rect>
                <rect stroke-width="3" stroke="#282828" fill="#DFDFDF" rx="2.5" height="90" width="121" y="1.5" x="6.5">
                </rect>
                <rect stroke-width="2" stroke="#282828" fill="#DFDFDF" rx="2" height="4" width="6" y="84" x="1"></rect>
              </svg>
            </div>
            <div class="truckTires">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 30 30" class="w-6">
                <circle stroke-width="3" stroke="#282828" fill="#282828" r="13.5" cy="15" cx="15"></circle>
                <circle fill="#DFDFDF" r="7" cy="15" cx="15"></circle>
              </svg>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 30 30" class="w-6">
                <circle stroke-width="3" stroke="#282828" fill="#282828" r="13.5" cy="15" cx="15"></circle>
                <circle fill="#DFDFDF" r="7" cy="15" cx="15"></circle>
              </svg>
            </div>
            <div class="road"></div>
          </div>
        </div>

        <!-- Typewriter Text -->
        <div class="text-center h-8 flex items-center justify-center">
          <p class="text-sm font-semibold tracking-wide text-primary type-text">
            {{ loadingText }}<span class="cursor">_</span>
          </p>
        </div>

        <!-- Progress bar -->
        <div class="w-48 h-1 rounded-full overflow-hidden bg-white/10">
          <div
            class="progress-bar h-full rounded-full bg-gradient-to-r from-primary to-blue-500 shadow-[0_0_10px_rgba(28,231,131,0.5)]">
          </div>
        </div>
      </div>
    </div>
  </Transition>
  </Teleport>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'

const props = defineProps({ visible: { type: Boolean, default: false } })

const phrases = [
  "Firing up engines...",
  "Syncing manifest...",
  "Loading map data...",
  "Connecting to dispatch...",
  "Optimizing route..."
]

const loadingText = ref('')
let phraseIndex = 0
let charIndex = 0
let isDeleting = false
let typistTimeout = null

function typeWriter() {
  const currentPhrase = phrases[phraseIndex]

  if (isDeleting) {
    loadingText.value = currentPhrase.substring(0, charIndex - 1)
    charIndex--
  } else {
    loadingText.value = currentPhrase.substring(0, charIndex + 1)
    charIndex++
  }

  let typingSpeed = isDeleting ? 30 : 50

  if (!isDeleting && charIndex === currentPhrase.length) {
    typingSpeed = 1500 // Pause at end of phrase
    isDeleting = true
  } else if (isDeleting && charIndex === 0) {
    isDeleting = false
    phraseIndex = (phraseIndex + 1) % phrases.length
    typingSpeed = 300 // Pause before typing next
  }

  if (props.visible) {
    typistTimeout = setTimeout(typeWriter, typingSpeed)
  }
}

watch(() => props.visible, (newVal) => {
  if (newVal) {
    loadingText.value = ''
    charIndex = 0
    isDeleting = false
    clearTimeout(typistTimeout)
    typeWriter()
  } else {
    clearTimeout(typistTimeout)
  }
})

onMounted(() => {
  if (props.visible) typeWriter()
})

onUnmounted(() => {
  clearTimeout(typistTimeout)
})
</script>

<style scoped>
.loading-fade-enter-active {
  transition: opacity 0.15s ease;
}

.loading-fade-leave-active {
  transition: opacity 0.35s ease;
}

.loading-fade-enter-from,
.loading-fade-leave-to {
  opacity: 0;
}

.progress-bar {
  width: 30%;
  animation: progress 1.4s ease-in-out infinite;
}

@keyframes progress {
  0% {
    width: 0%;
    margin-left: 0%;
  }

  50% {
    width: 60%;
    margin-left: 20%;
  }

  100% {
    width: 0%;
    margin-left: 100%;
  }
}
</style>
