<template>
    <div class="space-y-6">
        <div class="flex justify-between items-center">
            <h2 class="text-2xl font-bold text-white">Knowledge Base & SOPs</h2>
            <button
                class="px-4 py-2 border border-white/20 hover:bg-white/5 text-white font-bold rounded-lg flex items-center gap-2 transition-colors">
                <span class="material-symbols-outlined">edit_document</span> Edit Content
            </button>
        </div>

        <!-- Search -->
        <div class="relative max-w-2xl mx-auto mb-8">
            <input type="text" placeholder="Search for answers, policies, or SOPs..."
                class="w-full bg-black/40 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white focus:outline-none focus:border-purple-500/50 shadow-lg">
            <span class="material-symbols-outlined absolute left-4 top-4 text-gray-400 text-xl">search</span>
        </div>

        <!-- Categories -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="glass-panel p-6 rounded-xl hover:border-purple-500/50 transition-colors cursor-pointer group">
                <div
                    class="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400 mb-4 group-hover:scale-110 transition-transform">
                    <span class="material-symbols-outlined">local_shipping</span>
                </div>
                <h3 class="font-bold text-white mb-2">Driver Standard Procedures</h3>
                <p class="text-sm text-gray-400 mb-4">Guidelines for delivery execution, safety protocols, and customer
                    interaction.</p>
                <div class="space-y-2">
                    <div class="flex items-center gap-2 text-sm text-gray-300 hover:text-white"><span
                            class="material-symbols-outlined text-xs">article</span> Contactless Delivery</div>
                    <div class="flex items-center gap-2 text-sm text-gray-300 hover:text-white"><span
                            class="material-symbols-outlined text-xs">article</span> Proof of Delivery Requirements
                    </div>
                    <div class="flex items-center gap-2 text-sm text-gray-300 hover:text-white"><span
                            class="material-symbols-outlined text-xs">article</span> Vehicle breakdown SOP</div>
                </div>
            </div>

            <div class="glass-panel p-6 rounded-xl hover:border-blue-500/50 transition-colors cursor-pointer group">
                <div
                    class="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 mb-4 group-hover:scale-110 transition-transform">
                    <span class="material-symbols-outlined">support_agent</span>
                </div>
                <h3 class="font-bold text-white mb-2">Customer Support Scripts</h3>
                <p class="text-sm text-gray-400 mb-4">Response templates and policy details for support agents and AI
                    bot.</p>
                <div class="space-y-2">
                    <div class="flex items-center gap-2 text-sm text-gray-300 hover:text-white"><span
                            class="material-symbols-outlined text-xs">article</span> Late Delivery Apology</div>
                    <div class="flex items-center gap-2 text-sm text-gray-300 hover:text-white"><span
                            class="material-symbols-outlined text-xs">article</span> Refund Eligibility Policy</div>
                    <div class="flex items-center gap-2 text-sm text-gray-300 hover:text-white"><span
                            class="material-symbols-outlined text-xs">article</span> Damage Claim Process</div>
                </div>
            </div>

            <div class="glass-panel p-6 rounded-xl hover:border-green-500/50 transition-colors cursor-pointer group">
                <div
                    class="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center text-green-400 mb-4 group-hover:scale-110 transition-transform">
                    <span class="material-symbols-outlined">gavel</span>
                </div>
                <h3 class="font-bold text-white mb-2">Legal & Compliance</h3>
                <p class="text-sm text-gray-400 mb-4">Terms of service, privacy policy, and liability waivers.</p>
                <div class="space-y-2">
                    <div class="flex items-center gap-2 text-sm text-gray-300 hover:text-white"><span
                            class="material-symbols-outlined text-xs">article</span> Liability Waiver 2024</div>
                    <div class="flex items-center gap-2 text-sm text-gray-300 hover:text-white"><span
                            class="material-symbols-outlined text-xs">article</span> Data Privacy (GDPR)</div>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup>
</script>
