<template>
    <div class="space-y-6">
        <h2 class="text-2xl font-bold text-white">AI Performance Analytics</h2>

        <!-- Top Metrics -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div class="glass-panel p-6 rounded-xl">
                <div class="text-gray-400 text-sm mb-1">Total Conversations</div>
                <div class="text-3xl font-bold text-white">1,248</div>
                <div class="text-xs text-green-400 mt-1">↑ 15% vs last week</div>
            </div>
            <div class="glass-panel p-6 rounded-xl">
                <div class="text-gray-400 text-sm mb-1">Bot Resolution Rate</div>
                <div class="text-3xl font-bold text-white">82.4%</div>
                <div class="text-xs text-green-400 mt-1">↑ 2.1% improvement</div>
            </div>
            <div class="glass-panel p-6 rounded-xl">
                <div class="text-gray-400 text-sm mb-1">Avg. Handle Time</div>
                <div class="text-3xl font-bold text-white">45s</div>
                <div class="text-xs text-green-400 mt-1">↓ 12s faster</div>
            </div>
            <div class="glass-panel p-6 rounded-xl">
                <div class="text-gray-400 text-sm mb-1">Estimated Savings</div>
                <div class="text-3xl font-bold text-white">$12.5k</div>
                <div class="text-xs text-gray-500 mt-1">Based on agent hourly rate</div>
            </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Sentiment Trend Chart Placeholder -->
            <div class="glass-panel p-6 rounded-xl min-h-[300px] flex flex-col">
                <h3 class="font-bold text-white mb-6">Sentiment Trends (Last 7 Days)</h3>
                <div class="flex-1 flex items-end gap-2 px-4 border-b border-white/10 pb-4 relative">
                    <!-- Y-axis lines -->
                    <div
                        class="absolute inset-0 flex flex-col justify-between text-xs text-gray-600 pointer-events-none">
                        <div class="border-b border-white/5 w-full h-0"></div>
                        <div class="border-b border-white/5 w-full h-0"></div>
                        <div class="border-b border-white/5 w-full h-0"></div>
                        <div class="border-b border-white/5 w-full h-0"></div>
                    </div>

                    <!-- Bars -->
                    <div class="flex-1 bg-green-500/50 hover:bg-green-500/80 transition-colors rounded-t-sm h-[60%]"
                        title="Mon: 60%"></div>
                    <div class="flex-1 bg-green-500/50 hover:bg-green-500/80 transition-colors rounded-t-sm h-[75%]"
                        title="Tue: 75%"></div>
                    <div class="flex-1 bg-green-500/50 hover:bg-green-500/80 transition-colors rounded-t-sm h-[65%]"
                        title="Wed: 65%"></div>
                    <div class="flex-1 bg-green-500/50 hover:bg-green-500/80 transition-colors rounded-t-sm h-[40%]"
                        title="Thu: 40%"></div>
                    <div class="flex-1 bg-green-500/50 hover:bg-green-500/80 transition-colors rounded-t-sm h-[80%]"
                        title="Fri: 80%"></div>
                    <div class="flex-1 bg-green-500/50 hover:bg-green-500/80 transition-colors rounded-t-sm h-[85%]"
                        title="Sat: 85%"></div>
                    <div class="flex-1 bg-green-500/50 hover:bg-green-500/80 transition-colors rounded-t-sm h-[90%]"
                        title="Sun: 90%"></div>
                </div>
                <div class="flex justify-between text-xs text-gray-400 mt-2 px-1">
                    <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                </div>
            </div>

            <!-- Escalation Reasons Chart Placeholder -->
            <div class="glass-panel p-6 rounded-xl min-h-[300px]">
                <h3 class="font-bold text-white mb-6">Top Escalation Reasons</h3>
                <div class="space-y-4">
                    <div>
                        <div class="flex justify-between text-sm mb-1">
                            <span class="text-white">Refund Dispute</span>
                            <span class="text-gray-400">42%</span>
                        </div>
                        <div class="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
                            <div class="bg-red-500 h-full w-[42%]"></div>
                        </div>
                    </div>
                    <div>
                        <div class="flex justify-between text-sm mb-1">
                            <span class="text-white">Late Delivery</span>
                            <span class="text-gray-400">28%</span>
                        </div>
                        <div class="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
                            <div class="bg-yellow-500 h-full w-[28%]"></div>
                        </div>
                    </div>
                    <div>
                        <div class="flex justify-between text-sm mb-1">
                            <span class="text-white">Damaged Item</span>
                            <span class="text-gray-400">15%</span>
                        </div>
                        <div class="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
                            <div class="bg-orange-500 h-full w-[15%]"></div>
                        </div>
                    </div>
                    <div>
                        <div class="flex justify-between text-sm mb-1">
                            <span class="text-white">Driver Conduct</span>
                            <span class="text-gray-400">10%</span>
                        </div>
                        <div class="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
                            <div class="bg-blue-500 h-full w-[10%]"></div>
                        </div>
                    </div>
                    <div>
                        <div class="flex justify-between text-sm mb-1">
                            <span class="text-white">Other</span>
                            <span class="text-gray-400">5%</span>
                        </div>
                        <div class="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
                            <div class="bg-gray-500 h-full w-[5%]"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Recent Insights -->
        <div class="glass-panel p-6 rounded-xl">
            <h3 class="font-bold text-white mb-4">AI Insights</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="p-4 bg-purple-900/20 border border-purple-500/20 rounded-lg flex gap-3">
                    <span class="material-symbols-outlined text-purple-400 mt-1">lightbulb</span>
                    <div>
                        <h4 class="font-bold text-purple-200">Optimize Refund Policy</h4>
                        <p class="text-sm text-purple-300/70">High volume of small refund requests (< $10). enabling
                                auto-approve for this tier could save 5 hours of manual review weekly.</p>
                    </div>
                </div>
                <div class="p-4 bg-blue-900/20 border border-blue-500/20 rounded-lg flex gap-3">
                    <span class="material-symbols-outlined text-blue-400 mt-1">trending_up</span>
                    <div>
                        <h4 class="font-bold text-blue-200">Traffic Alert Impact</h4>
                        <p class="text-sm text-blue-300/70">New traffic prediction model successfully proactively
                            notified 150 customers, reducing inbound "Where is my order" calls by 40%.</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup>
</script>
