<template>
  <Teleport to="body">
    <button
      v-motion
      :initial="{ scale: 0, opacity: 0 }"
      :enter="{ scale: 1, opacity: 1, transition: { delay: 500, type: 'spring', stiffness: 260, damping: 20 } }"
      @click="toggleOpen"
      class="fixed bottom-8 right-8 z-50 group"
    >
      <div
        v-motion
        :animate="{
          boxShadow: [
            '0 0 20px rgba(0, 196, 255, 0.3)',
            '0 0 40px rgba(0, 196, 255, 0.5)',
            '0 0 20px rgba(0, 196, 255, 0.3)',
          ],
        }"
        :transition="{ duration: 2000, repeat: Infinity }"
        class="w-16 h-16 rounded-full bg-gradient-to-br from-[#00C4FF] to-[#1E3A8A] flex items-center justify-center cursor-pointer hover:scale-110 transition-transform duration-300"
      >
        <MessageCircle class="w-7 h-7 text-white" />
      </div>
    </button>

    <!-- Chat Modal -->
    <Transition name="fade">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        @click="toggleOpen"
      >
        <div
          v-motion
          :initial="{ scale: 0.9, opacity: 0, y: 20 }"
          :enter="{ scale: 1, opacity: 1, y: 0 }"
          class="w-full max-w-md bg-[#0A1428]/95 backdrop-blur-xl rounded-2xl border border-white/10 p-6"
          @click.stop
        >
          <!-- Header -->
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-gradient-to-br from-[#00C4FF] to-[#1E3A8A] flex items-center justify-center">
                <Bot class="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 class="text-white font-semibold">AI Assistant</h3>
                <p class="text-white/50 text-xs">Always here to help</p>
              </div>
            </div>
            <button
              @click="toggleOpen"
              class="p-2 rounded-lg hover:bg-white/10 transition-colors duration-300"
            >
              <X class="w-5 h-5 text-white/70" />
            </button>
          </div>

          <!-- Content -->
          <div class="space-y-4">
            <p class="text-white/70 text-sm">
              Hello! I'm your AI assistant. How can I help you today?
            </p>

            <!-- Quick Actions -->
            <div class="space-y-2">
              <button class="w-full text-left px-4 py-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#00C4FF50] transition-all duration-300">
                <span class="text-white/90 text-sm">Help me sign in</span>
              </button>
              <button class="w-full text-left px-4 py-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#00C4FF50] transition-all duration-300">
                <span class="text-white/90 text-sm">I forgot my password</span>
              </button>
              <button class="w-full text-left px-4 py-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#00C4FF50] transition-all duration-300">
                <span class="text-white/90 text-sm">Tell me about roles</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref } from 'vue';
import { MessageCircle, Bot, X } from 'lucide-vue-next';

const isOpen = ref(false);

const toggleOpen = () => {
  isOpen.value = !isOpen.value;
};
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
