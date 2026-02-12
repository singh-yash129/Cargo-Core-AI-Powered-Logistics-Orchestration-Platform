<template>
    <div class="max-w-4xl mx-auto space-y-6">
        <div class="glass-panel p-8 rounded-xl flex flex-col md:flex-row items-center gap-8">
            <div class="relative">
                <div
                    class="w-32 h-32 rounded-full bg-gradient-to-br from-green-400 to-blue-500 p-1 flex items-center justify-center">
                    <div
                        class="w-full h-full rounded-full bg-gray-900 border-4 border-transparent flex items-center justify-center overflow-hidden">
                        <span class="material-symbols-outlined text-6xl text-white">person</span>
                    </div>
                </div>
                <button
                    class="absolute bottom-0 right-0 p-2 bg-primary rounded-full text-background-dark hover:bg-primary-dark transition-colors shadow-lg">
                    <span class="material-symbols-outlined text-sm">edit</span>
                </button>
            </div>

            <div class="text-center md:text-left flex-1">
                <h2 class="text-3xl font-bold text-white mb-2">Alex Johnson</h2>
                <p class="text-gray-400 mb-4">Individual User • Member since 2023</p>
                <div class="flex flex-wrap justify-center md:justify-start gap-3">
                    <span
                        class="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-bold border border-green-500/30">Verified
                        Phone</span>
                    <span
                        class="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-bold border border-blue-500/30">Email
                        Verified</span>
                </div>
            </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="glass-panel p-6 rounded-xl space-y-4">
                <h3 class="font-bold text-white border-b border-white/10 pb-2">Personal Information</h3>
                <div class="grid grid-cols-1 gap-4">
                    <div>
                        <label class="text-xs text-gray-400 block mb-1">Full Name</label>
                        <input type="text" value="Alex Johnson"
                            class="w-full bg-black/20 border border-white/10 rounded px-3 py-2 text-white">
                    </div>
                    <div>
                        <label class="text-xs text-gray-400 block mb-1">Email Address</label>
                        <input type="email" value="alex.j@example.com"
                            class="w-full bg-black/20 border border-white/10 rounded px-3 py-2 text-white">
                    </div>
                    <div>
                        <label class="text-xs text-gray-400 block mb-1">Phone Number</label>
                        <input type="tel" value="+1 (555) 012-9988"
                            class="w-full bg-black/20 border border-white/10 rounded px-3 py-2 text-white">
                    </div>
                </div>
                <div class="pt-2 text-right">
                    <button class="text-primary text-sm font-bold hover:underline">Save Changes</button>
                </div>
            </div>

            <div class="glass-panel p-6 rounded-xl space-y-4">
                <h3 class="font-bold text-white border-b border-white/10 pb-2">Saved Addresses</h3>
                <div class="space-y-3">
                    <div class="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <div class="flex items-center gap-3">
                            <span class="material-symbols-outlined text-gray-400">home</span>
                            <div>
                                <div class="text-white text-sm font-bold">Home</div>
                                <div class="text-xs text-gray-500">123 Main St, Apt 4B, NY</div>
                            </div>
                        </div>
                        <button class="text-gray-400 hover:text-white"><span
                                class="material-symbols-outlined">edit</span></button>
                    </div>
                    <div class="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <div class="flex items-center gap-3">
                            <span class="material-symbols-outlined text-gray-400">work</span>
                            <div>
                                <div class="text-white text-sm font-bold">Office</div>
                                <div class="text-xs text-gray-500">456 Corp Blvd, NY</div>
                            </div>
                        </div>
                        <button class="text-gray-400 hover:text-white"><span
                                class="material-symbols-outlined">edit</span></button>
                    </div>
                    <button
                        class="w-full py-2 bg-white/5 text-gray-400 rounded-lg hover:text-white hover:bg-white/10 transition-colors text-sm">+
                        Add Address</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
</script>
