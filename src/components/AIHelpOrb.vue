<template>
  <Teleport to="body">
    <!-- Trigger Button -->
    <button
      v-motion
      :initial="{ scale: 0, opacity: 0 }"
      :enter="{ scale: 1, opacity: 1, transition: { delay: 500, type: 'spring', stiffness: 260, damping: 20 } }"
      @click="toggleOpen"
      class="fixed bottom-8 right-8 z-50"
    >
      <div
        class="w-16 h-16 rounded-full bg-gradient-to-br from-[#00C4FF] to-[#1E3A8A] flex items-center justify-center cursor-pointer hover:scale-110 transition-transform duration-300 shadow-[0_0_24px_rgba(0,196,255,0.35)]"
      >
        <HelpCircle class="w-7 h-7 text-white" />
      </div>
      <span class="absolute -top-1 -left-1 bg-[#00C4FF] text-[10px] text-white font-bold px-1.5 py-0.5 rounded-full leading-none">FAQ</span>
    </button>

    <!-- Q&A Panel -->
    <Transition name="fade">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        @click="close"
      >
        <div
          v-motion
          :initial="{ scale: 0.95, opacity: 0, y: 30 }"
          :enter="{ scale: 1, opacity: 1, y: 0, transition: { type: 'spring', stiffness: 280, damping: 24 } }"
          class="w-full max-w-md bg-[#07111f]/95 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden"
          @click.stop
        >
          <!-- Header -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/5">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-full bg-gradient-to-br from-[#00C4FF] to-[#1E3A8A] flex items-center justify-center">
                <HelpCircle class="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 class="text-white font-semibold text-sm">Help Centre</h3>
                <p class="text-white/40 text-xs">Common questions answered</p>
              </div>
            </div>
            <button @click="close" class="p-1.5 rounded-lg hover:bg-white/10 transition-colors duration-300">
              <X class="w-4 h-4 text-white/60" />
            </button>
          </div>

          <!-- Question List / Answer View -->
          <div class="max-h-[420px] overflow-y-auto">
            <!-- Answer view -->
            <div v-if="activeIndex !== null" class="p-5">
              <button @click="activeIndex = null" class="flex items-center gap-1.5 text-[#00C4FF] text-xs mb-4 hover:underline">
                <ChevronLeft class="w-3.5 h-3.5" />
                Back to questions
              </button>
              <p class="text-[#00C4FF] font-semibold text-sm mb-2">{{ faqs[activeIndex].q }}</p>
              <p class="text-white/75 text-sm leading-relaxed">{{ faqs[activeIndex].a }}</p>
            </div>

            <!-- Question list -->
            <div v-else class="divide-y divide-white/5">
              <button
                v-for="(faq, i) in faqs"
                :key="i"
                @click="activeIndex = i"
                class="w-full flex items-center justify-between px-5 py-4 hover:bg-white/5 transition-colors duration-200 text-left group"
              >
                <div class="flex items-start gap-3">
                  <span class="mt-0.5 flex-shrink-0 w-6 h-6 rounded-full bg-[#00C4FF]/15 text-[#00C4FF] text-xs font-bold flex items-center justify-center">{{ i + 1 }}</span>
                  <span class="text-white/85 text-sm group-hover:text-white transition-colors">{{ faq.q }}</span>
                </div>
                <ChevronRight class="w-4 h-4 text-white/30 group-hover:text-[#00C4FF] flex-shrink-0 ml-2 transition-colors" />
              </button>
            </div>
          </div>

          <!-- Footer -->
          <div class="px-5 py-3 border-t border-white/10 bg-white/5 text-center text-white/30 text-xs">
            Cargo Core · Support Docs
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref } from 'vue';
import { HelpCircle, X, ChevronRight, ChevronLeft } from 'lucide-vue-next';

const isOpen = ref(false);
const activeIndex = ref(null);

const faqs = [
  {
    q: 'How do I log in to Cargo Core?',
    a: 'Select your role on the login page (Customer, Vendor, Manager, etc.), then enter your registered email and password. After successful login you will receive a one-time OTP on your email for 2-factor verification.',
  },
  {
    q: 'I forgot my password. How do I reset it?',
    a: 'Click "Forgot Password?" on the login screen, enter your registered email address, and we will send you a 6-digit verification code. Enter the code on the Reset Password page, then set your new password.',
  },
  {
    q: 'What roles are available on the platform?',
    a: 'Cargo Core supports six roles: Customer (places orders), Vendor (logistics partner), Operations Manager (oversees operations), Warehouse Staff (handles inventory), Dispatcher (assigns drivers), and Driver (fulfils deliveries).',
  },
  {
    q: 'How do I create a new account?',
    a: 'Click "Create Account" on the login page, choose either Customer or Vendor, fill in your personal details and address across the sign-up steps, and verify your email with the OTP sent at the end.',
  },
  {
    q: 'What is the 2-factor authentication (2FA) step?',
    a: 'After entering correct credentials, a 6-digit OTP is sent to your registered email. Enter that code on the verification screen to complete login. This extra step keeps your account secure.',
  },
  {
    q: 'Why can\'t I see certain role options?',
    a: 'Roles like Operations Manager, Warehouse Staff, Dispatcher, and Driver are internal staff roles. Accounts for these must be created by an admin. If you are staff and cannot log in, contact your operations manager.',
  },
];

const toggleOpen = () => {
  isOpen.value = !isOpen.value;
  if (!isOpen.value) activeIndex.value = null;
};

const close = () => {
  isOpen.value = false;
  activeIndex.value = null;
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
