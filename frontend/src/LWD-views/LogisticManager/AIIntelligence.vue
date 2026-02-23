<template>
    <div class="space-y-6">
        <div class="flex items-center gap-3">
            <div
                class="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                <span class="material-symbols-outlined text-white">smart_toy</span>
            </div>
            <h2
                class="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
                Cargo-Core AI Intelligence</h2>
        </div>

        <!-- Chat Interface -->
        <div class="glass-panel h-[600px] flex flex-col rounded-2xl overflow-hidden relative">
            <div
                class="absolute inset-0 bg-gradient-to-b from-blue-50/50 to-transparent dark:from-blue-900/10 dark:to-transparent pointer-events-none">
            </div>

            <!-- Chat History -->
            <div class="flex-1 overflow-y-auto p-6 space-y-6">
                <!-- AI Message -->
                <div class="flex gap-4 max-w-[80%]">
                    <div
                        class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex-shrink-0 flex items-center justify-center text-xs font-bold text-white">
                        AI</div>
                    <div class="space-y-2">
                        <div
                            class="bg-gray-50/50 border border-gray-100 dark:bg-white/5 dark:border-white/10 p-4 rounded-2xl rounded-tl-none text-gray-800 dark:text-gray-200 text-sm leading-relaxed shadow-sm">
                            Hello, Manager. I've analyzed today's fleet data. <br><br>
                            Currently, <span class="text-yellow-600 dark:text-yellow-400 font-bold">Sector 4</span>
                            shows a <span class="text-red-500 dark:text-red-400 font-bold">15% delay risk</span> due to
                            unexpected roadwork.
                            <br><br>
                            I recommend rerouting <span class="text-blue-500 dark:text-blue-400 font-bold">3
                                trucks</span> to avoid missing
                            the SLAs for the 2 PM delivery window. Would you like me to proceed with the optimization?
                        </div>
                        <div class="text-xs text-gray-500 ml-2">10:42 AM</div>
                    </div>
                </div>

                <!-- User Message -->
                <div class="flex gap-4 max-w-[80%] ml-auto flex-row-reverse">
                    <div
                        class="w-8 h-8 rounded-full bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-white flex-shrink-0 flex items-center justify-center text-xs font-bold">
                        ME</div>
                    <div class="space-y-2">
                        <div
                            class="bg-primary/10 border border-primary/20 dark:bg-primary/20 dark:border-primary/30 p-4 rounded-2xl rounded-tr-none text-gray-900 dark:text-white text-sm leading-relaxed shadow-sm">
                            Yes, please optimize the routes. Also, give me updated ETA for truck #402.
                        </div>
                        <div class="text-xs text-gray-500 mr-2 text-right">10:44 AM</div>
                    </div>
                </div>

                <!-- AI Message -->
                <div class="flex gap-4 max-w-[80%]">
                    <div
                        class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex-shrink-0 flex items-center justify-center text-xs font-bold text-white">
                        AI</div>
                    <div class="space-y-2">
                        <div
                            class="bg-gray-50/50 border border-gray-100 dark:bg-white/5 dark:border-white/10 p-4 rounded-2xl rounded-tl-none text-gray-800 dark:text-gray-200 text-sm leading-relaxed shadow-sm">
                            <div class="flex items-center gap-2 text-green-500 dark:text-green-400 mb-2 font-bold">
                                <span class="material-symbols-outlined text-[16px]">check_circle</span> Optimization
                                Complete
                            </div>
                            Routes updated. 3 trucks rerouted via Highway 9.
                            <br><br>
                            Here is the status for <span class="text-gray-900 dark:text-white font-bold">Truck
                                #402</span>:
                            <div
                                class="mt-3 p-3 bg-white dark:bg-black/30 rounded-lg border border-gray-200 dark:border-white/5 text-xs shadow-sm">
                                <div class="flex justify-between mb-1">
                                    <span class="text-gray-500 dark:text-gray-400">Current Location:</span>
                                    <span class="text-gray-900 dark:text-white">Exit 42, Downtown</span>
                                </div>
                                <div class="flex justify-between mb-1">
                                    <span class="text-gray-500 dark:text-gray-400">Speed:</span>
                                    <span class="text-gray-900 dark:text-white">55 km/h</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-500 dark:text-gray-400">Updated ETA:</span>
                                    <span class="text-green-500 dark:text-green-400 font-bold">14:15 PM (On Time)</span>
                                </div>
                            </div>
                        </div>
                        <div class="text-xs text-gray-500 ml-2">10:45 AM</div>
                    </div>
                </div>
            </div>

            <!-- Input Area -->
            <div class="p-6 pt-2">
                <div class="relative">
                    <input type="text" placeholder="Ask AI anything about your fleet, stock, or predictions..."
                        class="w-full bg-white border border-gray-200 dark:bg-white/5 dark:border-white/10 rounded-xl py-4 pl-6 pr-14 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all shadow-sm">
                    <button
                        class="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-primary rounded-lg text-white hover:bg-primary/90 transition-colors shadow-sm">
                        <span class="material-symbols-outlined text-[20px] ml-1">send</span>
                    </button>
                </div>
                <div class="flex gap-3 mt-4 overflow-x-auto no-scrollbar pb-2">
                    <button
                        class="whitespace-nowrap px-4 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 dark:bg-white/5 dark:hover:bg-white/10 rounded-full dark:border-white/10 text-xs text-gray-600 dark:text-gray-300 transition-colors shadow-sm">Predict
                        bottleneck risks</button>
                    <button
                        class="whitespace-nowrap px-4 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 dark:bg-white/5 dark:hover:bg-white/10 rounded-full dark:border-white/10 text-xs text-gray-600 dark:text-gray-300 transition-colors shadow-sm">Show
                        revenue forecast</button>
                    <button
                        class="whitespace-nowrap px-4 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 dark:bg-white/5 dark:hover:bg-white/10 rounded-full dark:border-white/10 text-xs text-gray-600 dark:text-gray-300 transition-colors shadow-sm">Identify
                        underperforming hubs</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
</script>
