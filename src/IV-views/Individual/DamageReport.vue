<template>
    <div class="space-y-6">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span class="material-symbols-outlined text-red-500">report</span>
            Damage Report
        </h2>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Report Form -->
            <div class="glass-panel p-4 sm:p-6 rounded-xl">
                <h3 class="font-bold text-gray-900 dark:text-white mb-4">Report Damage</h3>
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm text-gray-600 dark:text-gray-400 mb-1.5 font-medium">Select
                            Order</label>
                        <select v-model="form.orderId"
                            class="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500/50 focus:border-red-500 outline-none">
                            <option value="" class="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">Choose an order...</option>
                            <option v-for="o in availableOrders" :key="o.id" :value="o.backendId" class="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">{{ o.id }} — {{
                                o.cargoType }}</option>
                        </select>
                        <p v-if="availableOrders.length === 0" class="mt-2 text-xs text-gray-500 dark:text-gray-400">
                            All delivered orders already have a damage ticket or were already reviewed.
                        </p>
                    </div>
                    <div>
                        <label class="block text-sm text-gray-600 dark:text-gray-400 mb-1.5 font-medium">Describe the
                            Damage</label>
                        <textarea v-model="form.description" rows="4"
                            placeholder="Describe what was damaged, when you noticed it, and the extent..."
                            class="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500/50 focus:border-red-500 outline-none resize-none"></textarea>
                    </div>

                    <!-- Photo Upload -->
                    <div>
                        <label class="block text-sm text-gray-600 dark:text-gray-400 mb-1.5 font-medium">Upload
                            Photos</label>
                        <div @click="$refs.photoInput?.click()"
                            class="border-2 border-dashed border-gray-300 dark:border-white/20 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-red-400 dark:hover:border-red-500 hover:bg-gray-50 dark:hover:bg-white/5 transition-all text-gray-400">
                            <span class="material-symbols-outlined text-3xl mb-2">add_photo_alternate</span>
                            <span class="text-sm font-bold">Click to upload damage photos</span>
                            <span class="text-xs mt-1">{{ photos.length > 0 ? photos.length + ' photo(s) selected' :
                                'Before / After photos recommended' }}</span>
                        </div>
                        <input type="file" ref="photoInput" accept="image/*" multiple class="hidden"
                            @change="handlePhotos" />
                    </div>

                    <button @click="submitReport" :disabled="!form.orderId || !form.description || availableOrders.length === 0"
                        class="w-full py-3 font-bold rounded-xl transition-colors text-sm"
                        :class="(form.orderId && form.description && availableOrders.length > 0) ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-gray-200 dark:bg-white/10 text-gray-400 cursor-not-allowed'">
                        Submit Damage Report
                    </button>
                </div>
            </div>

            <!-- Report History -->
            <div class="space-y-4">
                <div class="glass-panel p-4 sm:p-5 rounded-xl">
                    <h3 class="font-bold text-gray-900 dark:text-white mb-4">Report History</h3>
                    <div v-if="store.damageReports.length === 0"
                        class="text-center py-8 text-gray-400 dark:text-gray-500">
                        <span class="material-symbols-outlined text-4xl block mb-2">verified</span>
                        <p class="text-sm">No damage reports. All is well!</p>
                    </div>
                    <div v-else class="space-y-3">
                        <div v-for="report in store.damageReports" :key="report.id"
                            class="p-3 bg-gray-50 dark:bg-white/5 rounded-lg border border-gray-200 dark:border-white/5">
                            <div class="flex items-center justify-between mb-2">
                                <span class="font-mono font-bold text-red-600 dark:text-red-400 text-sm">{{ report.id
                                    }}</span>
                                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase" :class="{
                                    'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400': report.status === 'reported',
                                    'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400': report.status === 'inspected',
                                    'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400': report.status === 'resolved',
                                    'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400': report.status === 'rejected',
                                }">{{ report.status }}</span>
                            </div>
                            <div class="text-xs text-gray-500 dark:text-gray-400">Order: {{ report.orderId }}</div>
                            <div class="text-sm text-gray-700 dark:text-gray-300 mt-1 line-clamp-2">{{
                                report.description }}</div>

                            <!-- Resolution Details (shown after manager processes) -->
                            <div v-if="report.condition && report.condition !== 'Reported'" class="mt-2 flex flex-wrap gap-2">
                                <span class="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300">
                                    <span class="material-symbols-outlined text-[12px]">inventory_2</span>
                                    Condition: {{ report.condition }}
                                </span>
                                <span v-if="report.refundAmount && report.refundAmount > 0" class="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400">
                                    <span class="material-symbols-outlined text-[12px]">currency_rupee</span>
                                    Refund: ₹{{ report.refundAmount.toLocaleString() }}
                                </span>
                                <span v-else-if="report.status === 'rejected'" class="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400">
                                    <span class="material-symbols-outlined text-[12px]">cancel</span>
                                    No Refund Issued
                                </span>
                            </div>

                            <!-- QR Code -->
                            <div
                                class="mt-3 p-2 bg-white dark:bg-black/20 rounded border border-gray-200 dark:border-white/10 flex items-center gap-3">
                                <div
                                    class="w-12 h-12 bg-gray-100 dark:bg-white/10 rounded flex items-center justify-center">
                                    <span class="material-symbols-outlined text-2xl text-gray-500">qr_code_2</span>
                                </div>
                                <div>
                                    <div class="text-xs text-gray-500 font-medium">Reverse Logistics QR</div>
                                    <div class="text-xs font-mono text-gray-700 dark:text-gray-300">{{ report.qrCode }}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Status Timeline -->
                <div class="glass-panel p-4 sm:p-5 rounded-xl">
                    <h3 class="font-bold text-gray-900 dark:text-white mb-3 text-sm">Report Status Flow</h3>
                    <div class="flex flex-wrap items-center gap-2 text-xs">
                        <div
                            class="px-3 py-1.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 font-bold">
                            Reported</div>
                        <span
                            class="material-symbols-outlined text-gray-300 dark:text-gray-600 text-sm">arrow_forward</span>
                        <div
                            class="px-3 py-1.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 font-bold">
                            Inspected</div>
                        <span
                            class="material-symbols-outlined text-gray-300 dark:text-gray-600 text-sm">arrow_forward</span>
                        <div
                            class="px-3 py-1.5 rounded-full bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400 font-bold">
                            Resolved</div>
                        <span class="text-gray-300 dark:text-gray-600 font-bold">/</span>
                        <div
                            class="px-3 py-1.5 rounded-full bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400 font-bold">
                            Rejected</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Toast -->
        <Teleport to="body">
            <transition enter-active-class="transition duration-300 ease-out" enter-from-class="translate-y-4 opacity-0"
                enter-to-class="translate-y-0 opacity-100" leave-active-class="transition duration-200 ease-in"
                leave-from-class="translate-y-0 opacity-100" leave-to-class="translate-y-4 opacity-0">
                <div v-if="toast.show"
                    class="fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-5 py-3 rounded-xl shadow-xl bg-red-600 text-white border border-red-500 max-w-sm">
                    <span class="material-symbols-outlined">check_circle</span>
                    <span class="text-sm font-medium">{{ toast.message }}</span>
                </div>
            </transition>
        </Teleport>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useIndividualStore } from '@/stores/individualStore'

const store = useIndividualStore()

const form = reactive({ orderId: '', description: '' })
const photos = ref([])
const availableOrders = computed(() => {
    const blockedOrderIds = new Set((store.damageReports || []).map((report) => String(report.orderId || '')))
    return (store.deliveredOrders || []).filter((order) => !blockedOrderIds.has(String(order.backendId || '')))
})

function handlePhotos(e) { photos.value = Array.from(e.target.files) }

async function submitReport() {
    const result = await store.reportDamageRemote(form.orderId, form.description, photos.value.map(f => f.name))
    if (!result.success) {
        showToast(result.message || 'Failed to submit damage report.')
        return
    }
    form.orderId = ''
    form.description = ''
    photos.value = []
    showToast('Damage report submitted! QR code generated.')
}

const toast = reactive({ show: false, message: '' })
function showToast(msg) { toast.show = true; toast.message = msg; setTimeout(() => { toast.show = false }, 3000) }

onMounted(async () => {
    await Promise.all([
        store.fetchOrders('delivered'),
        store.fetchDamageReports(),
    ])
})
</script>
