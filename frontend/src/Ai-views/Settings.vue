<template>
    <div class="max-w-4xl mx-auto space-y-8">
        <h2 class="text-2xl font-bold text-white">AI Configuration</h2>

        <!-- General Settings -->
        <div class="glass-panel p-6 rounded-xl space-y-6">
            <h3 class="font-bold text-white border-b border-white/10 pb-2">Bot Behavior</h3>

            <div class="flex items-center justify-between">
                <div>
                    <div class="font-bold text-white">Auto-Reply</div>
                    <div class="text-sm text-gray-400">Allow AI to send responses without human approval.</div>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked class="sr-only peer">
                    <div
                        class="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600">
                    </div>
                </label>
            </div>

            <div class="flex items-center justify-between">
                <div>
                    <div class="font-bold text-white">Tone of Voice</div>
                    <div class="text-sm text-gray-400">Select the personality of the AI assistant.</div>
                </div>
                <select
                    class="bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500">
                    <option>Professional & Formal</option>
                    <option selected>Friendly & Empathetic</option>
                    <option>Direct & Concise</option>
                </select>
            </div>
        </div>

        <!-- Thresholds -->
        <div class="glass-panel p-6 rounded-xl space-y-6">
            <h3 class="font-bold text-white border-b border-white/10 pb-2">Automation Thresholds</h3>

            <div class="space-y-4">
                <div>
                    <div class="flex justify-between mb-2">
                        <label class="text-sm text-white">Sentiment Escalation Trigger</label>
                        <span class="text-sm text-red-400 font-bold">Negative (>80%)</span>
                    </div>
                    <input type="range"
                        class="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                        min="0" max="100" value="80">
                    <div class="text-xs text-gray-500 mt-1">Escalate to human if sentiment score drops below this value.
                    </div>
                </div>

                <div>
                    <div class="flex justify-between mb-2">
                        <label class="text-sm text-white">Auto-Refund Limit ($)</label>
                        <span class="text-sm text-green-400 font-bold">$50.00</span>
                    </div>
                    <input type="range"
                        class="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-500"
                        min="0" max="200" value="50">
                    <div class="text-xs text-gray-500 mt-1">Maximum amount for auto-approved refunds.</div>
                </div>
            </div>
        </div>

        <!-- System Prompt -->
        <div class="glass-panel p-6 rounded-xl space-y-4">
            <h3 class="font-bold text-white border-b border-white/10 pb-2">Custom System Prompt</h3>
            <p class="text-sm text-gray-400">Override the base instructions for the AI model.</p>
            <textarea
                class="w-full h-32 bg-black/20 border border-white/10 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-purple-500 font-mono"
                placeholder="You are a helpful logistics assistant..."></textarea>
            <div class="flex justify-end">
                <button
                    class="px-6 py-2 bg-white/10 hover:bg-white/20 text-white font-bold rounded-lg transition-colors">Save
                    Changes</button>
            </div>
        </div>
    </div>
</template>
<script setup>
</script>
