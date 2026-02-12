<template>
    <div class="space-y-6">
        <div class="flex justify-between items-center">
            <h2 class="text-2xl font-bold text-white">Support Tickets</h2>
            <button
                class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg flex items-center gap-2 transition-colors">
                <span class="material-symbols-outlined">add</span> New Ticket
            </button>
        </div>

        <!-- Kanban Board -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 overflow-x-auto pb-4">
            <!-- New Column -->
            <div class="glass-panel p-4 rounded-xl min-w-[300px] h-full flex flex-col">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="font-bold text-white flex items-center gap-2">
                        <span class="w-2 h-2 rounded-full bg-blue-500"></span> New
                    </h3>
                    <span class="bg-white/10 text-gray-400 px-2 py-0.5 rounded text-xs">3</span>
                </div>
                <div class="space-y-3 flex-1 overflow-y-auto max-h-[calc(100vh-250px)] custom-scrollbar pr-1">
                    <div
                        class="bg-white/5 p-4 rounded-lg border border-white/5 hover:border-blue-500/50 cursor-pointer transition-colors group relative">
                        <div class="flex justify-between items-start mb-2">
                            <span class="text-xs text-blue-400 font-mono">#TK-9921</span>
                            <span class="bg-red-500/20 text-red-400 text-[10px] px-1.5 py-0.5 rounded">High</span>
                        </div>
                        <h4 class="text-white font-bold text-sm mb-1">Login Issue on App</h4>
                        <p class="text-xs text-gray-400 mb-3 line-clamp-2">Driver unable to login after update v2.1.
                            Keeps getting error 500.</p>
                        <div class="flex items-center justify-between mt-auto">
                            <div class="flex items-center gap-2">
                                <div
                                    class="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-[10px]">
                                    MJ</div>
                                <span class="text-xs text-gray-500">2h ago</span>
                            </div>
                        </div>
                    </div>
                    <div
                        class="bg-white/5 p-4 rounded-lg border border-white/5 hover:border-blue-500/50 cursor-pointer transition-colors">
                        <div class="flex justify-between items-start mb-2">
                            <span class="text-xs text-blue-400 font-mono">#TK-9924</span>
                            <span class="bg-yellow-500/20 text-yellow-400 text-[10px] px-1.5 py-0.5 rounded">Med</span>
                        </div>
                        <h4 class="text-white font-bold text-sm mb-1">Missing Invoice</h4>
                        <p class="text-xs text-gray-400 mb-3 line-clamp-2">Vendor requires invoice for shipment
                            #SH-8821.</p>
                        <div class="flex items-center justify-between mt-auto">
                            <div class="flex items-center gap-2">
                                <div
                                    class="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-[10px]">
                                    AS</div>
                                <span class="text-xs text-gray-500">4h ago</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- In Progress Column -->
            <div class="glass-panel p-4 rounded-xl min-w-[300px] h-full flex flex-col">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="font-bold text-white flex items-center gap-2">
                        <span class="w-2 h-2 rounded-full bg-yellow-500"></span> In Progress
                    </h3>
                    <span class="bg-white/10 text-gray-400 px-2 py-0.5 rounded text-xs">2</span>
                </div>
                <div class="space-y-3 flex-1 overflow-y-auto max-h-[calc(100vh-250px)] custom-scrollbar pr-1">
                    <div
                        class="bg-white/5 p-4 rounded-lg border border-white/5 hover:border-yellow-500/50 cursor-pointer transition-colors">
                        <div class="flex justify-between items-start mb-2">
                            <span class="text-xs text-yellow-400 font-mono">#TK-8811</span>
                            <span class="bg-red-500/20 text-red-400 text-[10px] px-1.5 py-0.5 rounded">High</span>
                        </div>
                        <h4 class="text-white font-bold text-sm mb-1">Damaged Cargo Claim</h4>
                        <p class="text-xs text-gray-400 mb-3 line-clamp-2">Investigating photos of damaged furniture.
                            Waiting for driver report.</p>
                        <div class="flex items-center justify-between mt-auto">
                            <div class="flex items-center gap-2">
                                <div
                                    class="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center text-[10px] text-white">
                                    AI</div>
                                <span class="text-xs text-gray-500">1d ago</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Resolved Column -->
            <div class="glass-panel p-4 rounded-xl min-w-[300px] h-full flex flex-col border-t-4 border-green-500/20">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="font-bold text-white flex items-center gap-2">
                        <span class="w-2 h-2 rounded-full bg-green-500"></span> Resolved
                    </h3>
                    <span class="bg-white/10 text-gray-400 px-2 py-0.5 rounded text-xs">12</span>
                </div>
                <div class="space-y-3 flex-1 overflow-y-auto max-h-[calc(100vh-250px)] custom-scrollbar pr-1">
                    <div
                        class="bg-white/5 p-4 rounded-lg border border-white/5 hover:border-green-500/50 cursor-pointer transition-colors opacity-70 hover:opacity-100">
                        <div class="flex justify-between items-start mb-2">
                            <span class="text-xs text-green-400 font-mono">#TK-7744</span>
                        </div>
                        <h4 class="text-white font-bold text-sm mb-1">Refund Processed</h4>
                        <p class="text-xs text-gray-400 mb-3">Auto-refund approved by system.</p>
                        <div class="flex items-center justify-between mt-auto">
                            <div class="flex items-center gap-2">
                                <span class="material-symbols-outlined text-green-500 text-sm">check_circle</span>
                                <span class="text-xs text-gray-500">Yesterday</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup>
</script>
