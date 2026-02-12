<template>
    <div class="max-w-4xl mx-auto space-y-8">
        <div class="text-center space-y-2">
            <h2 class="text-3xl font-bold text-white">Bulk Order Upload</h2>
            <p class="text-gray-400">Upload CSV or Excel files to create multiple shipments at once.</p>
        </div>

        <!-- Upload Area -->
        <div
            class="glass-panel p-12 rounded-xl border-2 border-dashed border-white/20 hover:border-blue-500/50 transition-colors flex flex-col items-center justify-center cursor-pointer group bg-black/20">
            <div
                class="w-20 h-20 rounded-full bg-blue-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span class="material-symbols-outlined text-5xl text-blue-500">upload_file</span>
            </div>
            <div class="font-bold text-lg text-white mb-2">Drag & Drop your file here</div>
            <p class="text-sm text-gray-500 mb-6">Supported formats: .CSV, .XLSX, .JSON</p>
            <button
                class="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors">Browse
                Files</button>
        </div>

        <!-- Template Download -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="glass-panel p-6 rounded-xl flex items-center gap-4">
                <div class="p-3 bg-green-500/20 rounded-lg text-green-500">
                    <span class="material-symbols-outlined">table_view</span>
                </div>
                <div class="flex-1">
                    <div class="font-bold text-white">Standard Template</div>
                    <div class="text-xs text-gray-400">Use this for general cargo shipments.</div>
                </div>
                <button class="text-white hover:text-blue-400"><span
                        class="material-symbols-outlined">download</span></button>
            </div>
            <div class="glass-panel p-6 rounded-xl flex items-center gap-4">
                <div class="p-3 bg-purple-500/20 rounded-lg text-purple-500">
                    <span class="material-symbols-outlined">code</span>
                </div>
                <div class="flex-1">
                    <div class="font-bold text-white">API Documentation</div>
                    <div class="text-xs text-gray-400">Integrate directly with your ERP.</div>
                </div>
                <button class="text-white hover:text-blue-400"><span
                        class="material-symbols-outlined">open_in_new</span></button>
            </div>
        </div>

        <!-- Recent Uploads -->
        <div class="glass-panel rounded-xl overflow-hidden overflow-x-auto">
            <div class="p-6 border-b border-white/5 min-w-[600px]">
                <h3 class="font-bold text-white">Recent Uploads</h3>
            </div>
            <table class="w-full text-left text-sm min-w-[600px]">
                <thead class="bg-white/5 text-gray-400 uppercase">
                    <tr>
                        <th class="p-4">File Name</th>
                        <th class="p-4">Date</th>
                        <th class="p-4">Orders</th>
                        <th class="p-4">Status</th>
                        <th class="p-4">Action</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-white/5">
                    <tr class="hover:bg-white/5 transition-colors">
                        <td class="p-4 text-white font-medium">oct_orders_batch_01.csv</td>
                        <td class="p-4 text-gray-400">Today, 10:00 AM</td>
                        <td class="p-4 text-white">45</td>
                        <td class="p-4 flex items-center gap-2 text-green-400">
                            <span class="material-symbols-outlined text-sm">check_circle</span> Processed
                        </td>
                        <td class="p-4 text-blue-400 hover:text-white cursor-pointer">View Details</td>
                    </tr>
                    <tr class="hover:bg-white/5 transition-colors">
                        <td class="p-4 text-white font-medium">sep_restock.xlsx</td>
                        <td class="p-4 text-gray-400">Sep 28, 2024</td>
                        <td class="p-4 text-white">120</td>
                        <td class="p-4 flex items-center gap-2 text-red-400">
                            <span class="material-symbols-outlined text-sm">error</span> Failed (2 errors)
                        </td>
                        <td class="p-4 text-blue-400 hover:text-white cursor-pointer">View Errors</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script setup>
</script>
