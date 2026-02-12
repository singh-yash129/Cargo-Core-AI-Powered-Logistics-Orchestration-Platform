<template>
    <div class="h-[calc(100vh-8rem)] flex flex-col md:flex-row gap-6">
        <!-- Chat Sidebar -->
        <div class="w-full md:w-80 glass-panel rounded-xl overflow-hidden flex flex-col h-48 md:h-auto shrink-0">
            <div class="p-4 border-b border-white/5">
                <h3 class="font-bold text-white">Support Tickets</h3>
            </div>
            <div class="flex-1 overflow-y-auto p-2 space-y-2">
                <div class="p-3 bg-white/10 rounded-lg cursor-pointer border-l-4 border-primary">
                    <div class="flex justify-between items-start mb-1">
                        <span class="font-bold text-white text-sm">Order #MV-9021</span>
                        <span class="text-[10px] text-gray-400">10m ago</span>
                    </div>
                    <div class="text-xs text-gray-300 line-clamp-2">Where is the driver? He hasn't moved for 10 mins.
                    </div>
                </div>
                <div class="p-3 hover:bg-white/5 rounded-lg cursor-pointer border-l-4 border-transparent">
                    <div class="flex justify-between items-start mb-1">
                        <span class="font-bold text-gray-300 text-sm">Billing Issue</span>
                        <span class="text-[10px] text-gray-500">Yesterday</span>
                    </div>
                    <div class="text-xs text-gray-500 line-clamp-2">I was charged twice for the packing material.</div>
                </div>
            </div>
            <div class="p-4 border-t border-white/5">
                <button
                    class="w-full py-2 bg-primary hover:bg-primary-dark text-background-dark font-bold rounded-lg transition-colors">New
                    Ticket</button>
            </div>
        </div>

        <!-- Active Chat -->
        <div class="flex-1 glass-panel rounded-xl overflow-hidden flex flex-col">
            <!-- Header -->
            <div class="p-4 border-b border-white/5 flex justify-between items-center">
                <div class="flex items-center gap-3">
                    <div
                        class="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                        CS</div>
                    <div>
                        <div class="text-white font-bold">Customer Support</div>
                        <div class="text-xs text-green-400 flex items-center gap-1">
                            <span class="w-1.5 h-1.5 rounded-full bg-green-400"></span> Online
                        </div>
                    </div>
                </div>
                <button class="text-gray-400 hover:text-white"><span
                        class="material-symbols-outlined">more_vert</span></button>
            </div>

            <!-- Messages -->
            <div class="flex-1 p-6 overflow-y-auto space-y-4 bg-black/20">
                <div class="flex justify-center">
                    <span class="text-xs text-gray-500 bg-white/5 px-3 py-1 rounded-full">Today, 10:23 AM</span>
                </div>

                <div class="flex gap-4">
                    <div
                        class="w-8 h-8 rounded-full bg-blue-500 flex-shrink-0 flex items-center justify-center text-xs text-white">
                        CS</div>
                    <div class="bg-white/10 p-3 rounded-r-xl rounded-bl-xl max-w-md text-sm text-gray-200">
                        Hello Alex, how can I help you with your order today?
                    </div>
                </div>

                <div class="flex gap-4 flex-row-reverse">
                    <div
                        class="w-8 h-8 rounded-full bg-primary/20 flex-shrink-0 flex items-center justify-center text-xs text-primary">
                        Me</div>
                    <div
                        class="bg-primary p-3 rounded-l-xl rounded-br-xl max-w-md text-sm text-background-dark font-medium">
                        Hi, tracking shows the driver stuck at the highway for 20 mins. Is everything okay?
                    </div>
                </div>

                <div class="flex gap-4">
                    <div
                        class="w-8 h-8 rounded-full bg-blue-500 flex-shrink-0 flex items-center justify-center text-xs text-white">
                        CS</div>
                    <div class="bg-white/10 p-3 rounded-r-xl rounded-bl-xl max-w-md text-sm text-gray-200">
                        Let me check with the driver quickly. Please hold on a moment.
                    </div>
                </div>
            </div>

            <!-- Input -->
            <div class="p-4 bg-white/5 border-t border-white/5 flex gap-4">
                <button class="text-gray-400 hover:text-white"><span
                        class="material-symbols-outlined">attach_file</span></button>
                <input type="text" placeholder="Type a message..."
                    class="flex-1 bg-black/40 border-none rounded-lg px-4 text-white focus:ring-1 focus:ring-primary">
                <button
                    class="p-2 bg-primary text-background-dark rounded-lg hover:bg-primary-dark transition-colors"><span
                        class="material-symbols-outlined">send</span></button>
            </div>
        </div>
    </div>
</template>

<script setup>
</script>
