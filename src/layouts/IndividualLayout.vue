<template>
  <div class="min-h-screen bg-background-light text-gray-900 dark:bg-background-dark dark:text-white flex relative font-display antialiased">
    <div
      v-if="isSidebarOpen"
      class="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
      @click="isSidebarOpen = false"
    />

    <IndividualSidebar :is-open="isSidebarOpen" @close="isSidebarOpen = false" />

    <main class="flex-1 min-h-screen lg:ml-64 flex flex-col bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-green-500/5 via-surface-light to-surface-light dark:from-green-900/10 dark:via-background-dark dark:to-background-dark">
      <header class="sticky top-0 z-30 h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between border-b border-gray-200 dark:border-white/5 bg-surface-light/80 dark:bg-background-dark/80 backdrop-blur-md">
        <div class="flex items-center gap-3">
          <button
            class="lg:hidden p-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
            @click="isSidebarOpen = !isSidebarOpen"
          >
            <span class="material-symbols-outlined">menu</span>
          </button>
          <div>
            <h1 class="text-base sm:text-xl font-bold text-gray-900 dark:text-white">
              Welcome, {{ firstName }}!
            </h1>
            <div class="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
              <span class="w-1.5 h-1.5 rounded-full bg-green-400" />
              Personal moves made easy.
            </div>
          </div>
        </div>

        <div class="flex items-center gap-2 sm:gap-4">
          <div class="flex items-center gap-1 sm:gap-3">
            <router-link
              to="/individual/book-move"
              class="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center gap-2 text-sm shadow-sm"
            >
              <span class="material-symbols-outlined text-[18px]">add</span>
              <span class="hidden sm:inline">Book Move</span>
            </router-link>
          </div>
        </div>
      </header>

      <div class="flex-1 p-4 sm:p-6 lg:p-8">
        <RouterView />
      </div>

    <!-- AI chat orb - available on all customer pages -->
    <AIHelpOrb />
    </main>

  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import IndividualSidebar from '@/IV-components/IndividualSidebar.vue'
import { useIndividualStore } from '@/stores/individualStore'
import AIHelpOrb from '@/components/AIHelpOrb.vue'

const store = useIndividualStore()
const route = useRoute()
const isSidebarOpen = ref(false)

const firstName = computed(() => {
  const fullName = store.user?.name || 'Customer'
  return fullName.split(' ')[0]
})

watch(route, () => {
  isSidebarOpen.value = false
})
</script>
