<template>
  <Transition name="loading-fade">
    <div v-if="visible"
      class="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
      style="background: #0F1115;">
      <!-- Ambient blobs -->
      <div class="absolute inset-0 pointer-events-none overflow-hidden">
        <div class="w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] absolute -top-40 -left-40 opacity-30"></div>
        <div class="w-[400px] h-[400px] bg-accent-blue/10 rounded-full blur-[100px] absolute -bottom-40 -right-40 opacity-20"></div>
      </div>

      <!-- Content -->
      <div class="relative z-10 flex flex-col items-center gap-8">
        <!-- Animated Truck Loader -->
        <div class="flex items-center justify-center" style="transform: scale(1.8); margin: 50px 0;">
          <div class="truckWrapper">
            <div class="truckBody">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 198 93" style="width:130px;">
                <path stroke-width="3" stroke="#1a2c24" fill="#1CE783"
                  d="M135 22.5H177.264C178.295 22.5 179.22 23.133 179.594 24.0939L192.33 56.8443C192.442 57.1332 192.5 57.4404 192.5 57.7504V89C192.5 90.3807 191.381 91.5 190 91.5H135C133.619 91.5 132.5 90.3807 132.5 89V25C132.5 23.6193 133.619 22.5 135 22.5Z"></path>
                <path stroke-width="3" stroke="#1a2c24" fill="#0F1115"
                  d="M146 33.5H181.741C182.779 33.5 183.709 34.1415 184.078 35.112L190.538 52.112C191.16 53.748 189.951 55.5 188.201 55.5H146C144.619 55.5 143.5 54.3807 143.5 53V36C143.5 34.6193 144.619 33.5 146 33.5Z"></path>
                <path stroke-width="2" stroke="#1a2c24" fill="#1a2c24"
                  d="M150 65C150 65.39 149.763 65.8656 149.127 66.2893C148.499 66.7083 147.573 67 146.5 67C145.427 67 144.501 66.7083 143.873 66.2893C143.237 65.8656 143 65.39 143 65C143 64.61 143.237 64.1344 143.873 63.7107C144.501 63.2917 145.427 63 146.5 63C147.573 63 148.499 63.2917 149.127 63.7107C149.763 64.1344 150 64.61 150 65Z"></path>
                <rect stroke-width="2" stroke="#1a2c24" fill="#FFFCAB" rx="1" height="7" width="5" y="63" x="187"></rect>
                <rect stroke-width="2" stroke="#1a2c24" fill="#1a2c24" rx="1" height="11" width="4" y="81" x="193"></rect>
                <rect stroke-width="3" stroke="#1a2c24" fill="#1a2c24" rx="2.5" height="90" width="121" y="1.5" x="6.5"></rect>
                <rect stroke-width="2" stroke="#1a2c24" fill="#1a2c24" rx="2" height="4" width="6" y="84" x="1"></rect>
              </svg>
            </div>
            <div class="truckTires">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 30 30" style="width:24px;">
                <circle stroke-width="3" stroke="#1a2c24" fill="#1a2c24" r="13.5" cy="15" cx="15"></circle>
                <circle fill="#1CE783" r="7" cy="15" cx="15"></circle>
              </svg>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 30 30" style="width:24px;">
                <circle stroke-width="3" stroke="#1a2c24" fill="#1a2c24" r="13.5" cy="15" cx="15"></circle>
                <circle fill="#1CE783" r="7" cy="15" cx="15"></circle>
              </svg>
            </div>
            <div class="road"></div>
          </div>
        </div>

        <!-- Brand -->
        <div class="text-center">
          <div class="text-2xl font-black tracking-tight bg-clip-text text-transparent"
            style="background-image: linear-gradient(135deg, #1CE783, #44a8e9); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
            Cargo-Core
          </div>
          <p class="text-[10px] mt-1 tracking-[0.3em] uppercase"
            style="color: rgba(255,255,255,0.4);">Moving What Matters</p>
          <p class="text-[9px] mt-0.5 tracking-widest uppercase"
            style="color: rgba(28,231,131,0.35);">v4.2.0 · Pro Driver · Field Execution</p>
        </div>

        <!-- Progress bar -->
        <div class="w-48 h-0.5 rounded-full overflow-hidden" style="background: rgba(255,255,255,0.06);">
          <div class="progress-bar h-full rounded-full"
            style="background: linear-gradient(90deg, #1CE783, #44a8e9);"></div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
defineProps({ visible: { type: Boolean, default: false } })
</script>

<style scoped>
.loading-fade-enter-active { transition: opacity 0.15s ease; }
.loading-fade-leave-active { transition: opacity 0.35s ease; }
.loading-fade-enter-from, .loading-fade-leave-to { opacity: 0; }

.progress-bar { width: 30%; animation: progress 1.4s ease-in-out infinite; }
@keyframes progress {
  0%   { width: 0%; margin-left: 0%; }
  50%  { width: 60%; margin-left: 20%; }
  100% { width: 0%; margin-left: 100%; }
}
</style>
