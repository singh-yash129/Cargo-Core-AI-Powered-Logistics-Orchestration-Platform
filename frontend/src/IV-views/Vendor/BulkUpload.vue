<template>
    <div class="max-w-4xl mx-auto space-y-8">
        <div class="text-center space-y-2">
            <h2 class="text-3xl font-bold text-gray-900 dark:text-white">Bulk Order Upload</h2>
            <p class="text-gray-500 dark:text-gray-400 text-sm">Upload CSV or Excel files to create multiple shipments at once.</p>
        </div>

        <!-- Upload Area -->
        <div @dragover.prevent="isDragging = true" @dragleave="isDragging = false" @drop.prevent="handleDrop" @click="$refs.fileInput.click()"
            class="glass-panel p-12 rounded-xl border-2 border-dashed transition-colors flex flex-col items-center justify-center cursor-pointer group"
            :class="isDragging ? 'border-blue-500 bg-blue-500/5' : 'border-gray-300 dark:border-white/20 hover:border-blue-500/50'">
            <input ref="fileInput" type="file" accept=".csv,.xlsx,.json" class="hidden" @change="handleFileSelect">
            <div class="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span class="material-symbols-outlined text-4xl text-blue-500">upload_file</span>
            </div>
            <div v-if="!selectedFile" class="text-center">
                <div class="font-bold text-gray-900 dark:text-white text-lg mb-1">Drag & Drop your file here</div>
                <p class="text-xs text-gray-500 mb-4">Supported formats: .CSV, .XLSX, .JSON</p>
                <button class="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-sm transition-colors">Browse Files</button>
            </div>
            <div v-else class="text-center">
                <span class="material-symbols-outlined text-3xl text-green-500 mb-2">description</span>
                <div class="font-bold text-gray-900 dark:text-white mb-1">{{ selectedFile.name }}</div>
                <div class="text-xs text-gray-500">{{ (selectedFile.size / 1024).toFixed(1) }} KB</div>
            </div>
        </div>

        <!-- Upload Button -->
        <div v-if="selectedFile" class="flex justify-center gap-3">
            <button @click="selectedFile = null" class="px-5 py-2.5 bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-bold hover:bg-gray-200 dark:hover:bg-white/10 transition-colors">Cancel</button>
            <button @click="processUpload" :disabled="uploading" class="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-sm transition-colors flex items-center gap-2 disabled:opacity-50">
                <span v-if="uploading" class="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                {{ uploading ? 'Processing...' : 'Upload & Process' }}
            </button>
        </div>

        <!-- Template Download -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="glass-panel p-5 rounded-xl flex items-center gap-4">
                <div class="p-2.5 bg-green-500/20 rounded-lg text-green-500">
                    <span class="material-symbols-outlined">table_view</span>
                </div>
                <div class="flex-1">
                    <div class="font-bold text-gray-900 dark:text-white text-sm">Standard Template</div>
                    <div class="text-[10px] text-gray-500">CSV for general cargo shipments</div>
                </div>
                <button @click="downloadTemplate('standard')" class="p-2 rounded-lg hover:bg-green-500/10 text-gray-400 hover:text-green-500 transition-colors">
                    <span class="material-symbols-outlined">download</span>
                </button>
            </div>
            <div class="glass-panel p-5 rounded-xl flex items-center gap-4">
                <div class="p-2.5 bg-purple-500/20 rounded-lg text-purple-500">
                    <span class="material-symbols-outlined">code</span>
                </div>
                <div class="flex-1">
                    <div class="font-bold text-gray-900 dark:text-white text-sm">API Documentation</div>
                    <div class="text-[10px] text-gray-500">Integrate directly with your ERP</div>
                </div>
                <button @click="showToast('Opening API docs...')" class="p-2 rounded-lg hover:bg-purple-500/10 text-gray-400 hover:text-purple-500 transition-colors">
                    <span class="material-symbols-outlined">open_in_new</span>
                </button>
            </div>
        </div>

        <!-- Recent Uploads -->
        <div class="glass-panel rounded-xl overflow-hidden">
            <div class="p-4 border-b border-gray-100 dark:border-white/5 flex justify-between items-center">
                <h3 class="font-bold text-gray-900 dark:text-white text-sm">Recent Uploads</h3>
                <span class="text-xs text-gray-500">{{ store.bulkUploads.length }} upload(s)</span>
            </div>
            <div class="overflow-x-auto">
                <table class="w-full text-left text-sm min-w-[600px]">
                    <thead class="bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 uppercase text-[10px]">
                        <tr>
                            <th class="px-4 py-3">File</th>
                            <th class="px-4 py-3">Date</th>
                            <th class="px-4 py-3">Orders</th>
                            <th class="px-4 py-3">Status</th>
                            <th class="px-4 py-3 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100 dark:divide-white/5">
                        <tr v-if="store.bulkUploads.length === 0">
                            <td colspan="5" class="px-4 py-8 text-center text-gray-400 text-sm">No uploads yet</td>
                        </tr>
                        <tr v-for="u in store.bulkUploads" :key="u.id" class="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                            <td class="px-4 py-3">
                                <div class="flex items-center gap-2">
                                    <span class="material-symbols-outlined text-[16px]" :class="u.status === 'Processed' ? 'text-green-500' : u.status === 'Failed' ? 'text-red-500' : 'text-yellow-500'">{{ u.status === 'Processed' ? 'check_circle' : u.status === 'Failed' ? 'error' : 'pending' }}</span>
                                    <span class="text-gray-900 dark:text-white text-xs font-medium">{{ u.fileName }}</span>
                                </div>
                            </td>
                            <td class="px-4 py-3 text-gray-500 text-xs">{{ u.date }}</td>
                            <td class="px-4 py-3 text-gray-900 dark:text-white text-xs font-bold">{{ u.orders }}</td>
                            <td class="px-4 py-3">
                                <span class="px-2 py-0.5 rounded text-[10px] font-bold" :class="uploadStatusClass(u.status)">{{ u.status }}</span>
                                <span v-if="u.errors" class="ml-1 text-[10px] text-red-400">({{ u.errors }} errors)</span>
                            </td>
                            <td class="px-4 py-3 text-right">
                                <button @click="viewUploadDetail(u)" class="text-blue-500 hover:text-blue-600 text-xs font-bold transition-colors">{{ u.status === 'Failed' ? 'View Errors' : 'View Details' }}</button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Upload Detail Modal -->
        <Teleport to="body">
            <BaseModal :isOpen="!!viewingUpload" @close="viewingUpload = null">
                <template #title>Upload Details — {{ viewingUpload?.fileName }}</template>
                <div v-if="viewingUpload" class="space-y-4">
                    <div class="grid grid-cols-3 gap-3">
                        <div class="p-3 bg-gray-50 dark:bg-white/5 rounded-lg text-center"><div class="text-xs text-gray-500 mb-1">Orders</div><div class="text-lg font-bold text-gray-900 dark:text-white">{{ viewingUpload.orders }}</div></div>
                        <div class="p-3 bg-gray-50 dark:bg-white/5 rounded-lg text-center"><div class="text-xs text-gray-500 mb-1">Status</div><span class="px-2 py-0.5 rounded text-[10px] font-bold" :class="uploadStatusClass(viewingUpload.status)">{{ viewingUpload.status }}</span></div>
                        <div class="p-3 bg-gray-50 dark:bg-white/5 rounded-lg text-center"><div class="text-xs text-gray-500 mb-1">Errors</div><div class="text-lg font-bold" :class="viewingUpload.errors ? 'text-red-500' : 'text-green-500'">{{ viewingUpload.errors || 0 }}</div></div>
                    </div>
                    <div v-if="viewingUpload.errors" class="space-y-2">
                        <div class="text-xs font-bold text-red-500">Error Details:</div>
                        <div v-for="(err, i) in mockErrors" :key="i" class="p-2 bg-red-500/10 rounded text-xs text-red-400 flex items-center gap-2">
                            <span class="material-symbols-outlined text-[14px]">error</span>{{ err }}
                        </div>
                    </div>
                    <div class="text-xs text-gray-500">Uploaded on {{ viewingUpload.date }}</div>
                </div>
                <template #footer>
                    <button @click="viewingUpload = null" class="px-4 py-2 text-gray-500 text-sm">Close</button>
                    <button v-if="viewingUpload?.status === 'Failed'" @click="retryUpload(viewingUpload)" class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors">Retry Upload</button>
                </template>
            </BaseModal>
        </Teleport>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { useVendorStore } from '@/stores/vendorStore'
import BaseModal from '@/components/BaseModal.vue'

const store = useVendorStore()
const selectedFile = ref(null)
const uploading = ref(false)
const isDragging = ref(false)
const viewingUpload = ref(null)
const fileInput = ref(null)

const mockErrors = ['Row 14: Missing required field "destination_address"', 'Row 27: Invalid weight format "5kg" — expected numeric value', 'Row 45: Duplicate order reference "ORD-2024-1122"']

const uploadStatusClass = s => ({
    Processed: 'bg-green-500/20 text-green-600 dark:text-green-400',
    Failed: 'bg-red-500/20 text-red-600 dark:text-red-400',
    Processing: 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400',
}[s] || 'bg-gray-500/20 text-gray-500')

function handleFileSelect(e) {
    if (e.target.files.length) selectedFile.value = e.target.files[0]
}

function handleDrop(e) {
    isDragging.value = false
    if (e.dataTransfer.files.length) selectedFile.value = e.dataTransfer.files[0]
}

function processUpload() {
    if (!selectedFile.value) return
    uploading.value = true
    const fName = selectedFile.value.name
    setTimeout(() => {
        const hasErrors = Math.random() > 0.7
        store.addBulkUpload({
            fileName: fName,
            orders: Math.floor(Math.random() * 100) + 10,
            status: hasErrors ? 'Failed' : 'Processed',
            errors: hasErrors ? Math.floor(Math.random() * 5) + 1 : 0,
        })
        uploading.value = false
        selectedFile.value = null
        showToast(hasErrors ? 'Upload processed with errors' : 'Upload processed successfully')
    }, 2000)
}

function viewUploadDetail(u) {
    viewingUpload.value = u
}

function retryUpload(u) {
    u.status = 'Processing'
    viewingUpload.value = null
    setTimeout(() => {
        u.status = 'Processed'
        u.errors = 0
        showToast(`${u.fileName} reprocessed successfully`)
    }, 1500)
}

function downloadTemplate(type) {
    showToast(`Downloading ${type} template...`)
}

function showToast(msg) {
    const t = document.createElement('div')
    t.className = 'fixed top-4 right-4 z-[9999] bg-green-500 text-white text-sm font-bold px-4 py-2 rounded-lg shadow-xl'
    t.textContent = msg
    document.body.appendChild(t)
    setTimeout(() => t.remove(), 3000)
}
</script>
