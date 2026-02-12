<template>
    <div class="max-w-4xl mx-auto space-y-6">
        <h2 class="text-2xl font-bold text-white">Company Settings</h2>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="glass-panel p-6 rounded-xl space-y-2">
                <button class="w-full text-left px-4 py-3 rounded-lg bg-blue-600 font-bold text-white mb-2">General
                    Profile</button>
                <button
                    class="w-full text-left px-4 py-3 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors">Team
                    Members</button>
                <button
                    class="w-full text-left px-4 py-3 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors">Notifications</button>
                <button
                    class="w-full text-left px-4 py-3 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors">API
                    Keys</button>
            </div>

            <div class="md:col-span-2 glass-panel p-8 rounded-xl space-y-6">
                <div>
                    <h3 class="font-bold text-white border-b border-white/10 pb-2 mb-4">Company Profile</h3>
                    <div class="flex items-center gap-4 mb-6">
                        <div class="w-20 h-20 bg-white p-2 rounded-lg flex items-center justify-center">
                            <img src="https://via.placeholder.com/150" alt="Logo" class="w-full h-full object-contain">
                        </div>
                        <button
                            class="px-4 py-2 border border-white/10 rounded text-sm text-white hover:bg-white/5">Upload
                            Logo</button>
                    </div>

                    <div class="grid grid-cols-1 gap-4">
                        <div>
                            <label class="text-xs text-gray-400 block mb-1">Company Name</label>
                            <input type="text" value="Acme Logistics Inc."
                                class="w-full bg-black/20 border border-white/10 rounded px-3 py-2 text-white">
                        </div>
                        <div>
                            <label class="text-xs text-gray-400 block mb-1">Tax ID / EIN</label>
                            <input type="text" value="XX-XXXXXXX"
                                class="w-full bg-black/20 border border-white/10 rounded px-3 py-2 text-white">
                        </div>
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="text-xs text-gray-400 block mb-1">Contact Person</label>
                                <input type="text" value="Jane Doe"
                                    class="w-full bg-black/20 border border-white/10 rounded px-3 py-2 text-white">
                            </div>
                            <div>
                                <label class="text-xs text-gray-400 block mb-1">Phone</label>
                                <input type="tel" value="+1 800 123 4567"
                                    class="w-full bg-black/20 border border-white/10 rounded px-3 py-2 text-white">
                            </div>
                        </div>
                    </div>
                </div>

                <div class="pt-4 flex justify-end">
                    <button
                        class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors">Save
                        Changes</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
</script>
