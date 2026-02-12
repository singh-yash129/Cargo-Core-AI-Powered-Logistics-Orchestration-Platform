<template>
  <div class="bg-background-dark text-white min-h-screen p-6">
    <div class="mb-6">
      <button @click="$router.back()" class="text-gray-400 hover:text-white mb-4">
        <span class="material-icons">arrow_back</span>
      </button>
      <h1 class="text-3xl font-bold">Driver Wallet</h1>
    </div>

    <!-- Today's Earnings -->
    <div class="bg-gradient-to-br from-primary/20 to-primary/5 rounded-3xl p-8 mb-6 text-center relative overflow-hidden">
      <div class="absolute inset-0 bg-gradient-radial from-primary/10 to-transparent"></div>
      <p class="text-sm text-gray-400 mb-2 relative z-10">Today's Earnings</p>
      <h2 class="text-5xl font-bold text-primary relative z-10">$160</h2>
    </div>

    <!-- Breakdown -->
    <div class="glass-panel p-6 rounded-xl space-y-4 mb-6">
      <div class="flex justify-between">
        <span class="text-gray-400">Base Pay</span>
        <span class="font-semibold">$120</span>
      </div>
      <div class="flex justify-between">
        <span class="text-gray-400">Tips</span>
        <span class="font-semibold">$25</span>
      </div>
      <div class="flex justify-between">
        <span class="text-gray-400">Bonuses</span>
        <span class="font-semibold text-primary">$15</span>
      </div>
    </div>

    <!-- Performance -->
    <div class="glass-panel p-6 rounded-xl">
      <h3 class="font-bold mb-4">Performance Scorecard</h3>
      <div class="space-y-3">
        <div class="flex justify-between">
          <span class="text-gray-400">Rating</span>
          <span>⭐ 4.9</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-400">On-Time %</span>
          <span class="text-primary">96%</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-400">Fuel Efficiency</span>
          <span class="text-primary">+8%</span>
        </div>
      </div>
    </div>
  </div>
</template>
