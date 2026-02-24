<template>
    <div class="h-[calc(100vh-8rem)] flex flex-col gap-6">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span class="material-symbols-outlined text-primary">undo</span>
            Reverse Logistics & Returns
        </h2>

        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div class="glass-panel p-4 rounded-xl border border-gray-200 dark:border-white/5 flex flex-col justify-between relative overflow-hidden group hover:border-orange-500/30 transition-colors">
                <div class="absolute right-0 top-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                    <span class="material-symbols-outlined text-6xl text-orange-500">pending_actions</span>
                </div>
                <div class="text-xs text-gray-500 uppercase font-bold tracking-wider z-10">Pending Returns</div>
                <div class="flex items-end gap-2 z-10 mt-1">
                    <div class="text-3xl font-bold text-gray-900 dark:text-white">{{ pendingReturns }}</div>
                    <span v-if="pendingReturns > 0" class="text-xs font-bold text-orange-500 bg-orange-50 dark:bg-orange-500/10 px-1.5 py-0.5 rounded flex items-center mb-1">
                        Requires Action
                    </span>
                </div>
            </div>
            
            <div class="glass-panel p-4 rounded-xl border border-gray-200 dark:border-white/5 flex flex-col justify-between relative overflow-hidden group hover:border-green-500/30 transition-colors">
                <div class="absolute right-0 top-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                    <span class="material-symbols-outlined text-6xl text-green-500">recycling</span>
                </div>
                <div class="text-xs text-gray-500 uppercase font-bold tracking-wider z-10">Restock Rate</div>
                <div class="text-3xl font-bold text-gray-900 dark:text-white mt-1">68%</div>
            </div>

            <div class="glass-panel p-4 rounded-xl border border-gray-200 dark:border-white/5 flex flex-col justify-between relative overflow-hidden group hover:border-red-500/30 transition-colors">
                <div class="absolute right-0 top-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                    <span class="material-symbols-outlined text-6xl text-red-500">delete</span>
                </div>
                <div class="text-xs text-gray-500 uppercase font-bold tracking-wider z-10">Scrap / Dispose</div>
                <div class="text-3xl font-bold text-gray-900 dark:text-white mt-1">12%</div>
            </div>

            <div class="glass-panel p-4 rounded-xl border border-gray-200 dark:border-white/5 flex flex-col justify-between relative overflow-hidden group hover:border-blue-500/30 transition-colors">
                <div class="absolute right-0 top-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                    <span class="material-symbols-outlined text-6xl text-blue-500">currency_exchange</span>
                </div>
                <div class="text-xs text-gray-500 uppercase font-bold tracking-wider z-10">Total Refund Value</div>
                <div class="text-3xl font-bold text-gray-900 dark:text-white mt-1">${{ refundValue.toLocaleString() }}</div>
            </div>
        </div>

        <!-- Main Content Area -->
        <div class="flex-1 glass-panel rounded-xl overflow-hidden flex flex-col border border-gray-200 dark:border-white/5 relative">
            <!-- Filter Bar -->
            <div class="p-4 border-b border-gray-200 dark:border-white/5 flex justify-between items-center bg-gray-50 dark:bg-white/5">
                <div class="flex gap-1 bg-white dark:bg-black/20 p-1 rounded-lg border border-gray-200 dark:border-white/10">
                    <button v-for="tab in tabs" :key="tab.id"
                        @click="activeStatus = tab.id"
                        class="px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-2"
                        :class="activeStatus === tab.id ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'">
                        {{ tab.label }}
                    </button>
                </div>

                <div class="flex gap-2">
                    <div class="relative">
                        <span class="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">search</span>
                        <input v-model="searchQuery" type="text" placeholder="Search RMA, Order ID..." 
                            class="pl-9 pr-4 py-1.5 bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-gray-700 dark:text-gray-200 w-64">
                    </div>
                </div>
            </div>
            
            <div class="flex-1 overflow-auto custom-scrollbar bg-white dark:bg-gray-900">
                <table class="w-full text-left text-sm border-separate border-spacing-0">
                    <thead class="bg-gray-50 dark:bg-card-dark sticky top-0 z-10 shadow-sm">
                        <tr class="text-gray-500 dark:text-gray-400 uppercase tracking-wider text-[10px]">
                            <th class="py-3 px-4 font-medium border-b dark:border-white/10">RMA ID</th>
                            <th class="py-3 px-4 font-medium border-b dark:border-white/10">Order & Customer</th>
                            <th class="py-3 px-4 font-medium border-b dark:border-white/10">Reason</th>
                            <th class="py-3 px-4 font-medium border-b dark:border-white/10">Condition</th>
                            <th class="py-3 px-4 font-medium border-b dark:border-white/10">Proof</th>
                            <th class="py-3 px-4 font-medium border-b dark:border-white/10">Status</th>
                            <th class="py-3 px-4 font-medium border-b dark:border-white/10 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100 dark:divide-white/5">
                        <tr v-for="rma in filteredList" :key="rma.id"
                            class="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group cursor-pointer"
                            @click="openDetails(rma)">
                            <td class="py-3 px-4 font-mono text-primary font-bold text-xs">{{ rma.id }}</td>
                            <td class="py-3 px-4">
                                <div>
                                    <div class="font-medium text-gray-900 dark:text-white text-sm">{{ rma.customer }}</div>
                                    <div class="text-xs text-gray-500 font-mono">{{ rma.orderId }}</div>
                                </div>
                            </td>
                            <td class="py-3 px-4 text-gray-600 dark:text-gray-300">{{ rma.reason }}</td>
                            <td class="py-3 px-4">
                                <span class="px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider border"
                                    :class="getConditionClass(rma.condition)">
                                    {{ rma.condition }}
                                </span>
                            </td>
                            <td class="py-3 px-4">
                                <button v-if="rma.images && rma.images.length > 0" 
                                    @click.stop="openImageGallery(rma)"
                                    class="text-blue-500 hover:text-blue-700 bg-blue-50 dark:bg-blue-500/10 p-1.5 rounded-lg transition-colors flex items-center justify-center relative group"
                                    :title="rma.images.length + ' image(s)'">
                                    <span class="material-symbols-outlined text-[18px]">photo_library</span>
                                    <span class="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] w-3.5 h-3.5 flex items-center justify-center rounded-full font-bold">{{ rma.images.length }}</span>
                                </button>
                                <span v-else class="text-gray-400 text-xs italic opacity-50 flex items-center gap-1">
                                    <span class="material-symbols-outlined text-[14px]">hide_image</span>
                                </span>
                            </td>
                            <td class="py-3 px-4">
                                <span class="px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider border"
                                    :class="getStatusClass(rma.status)">
                                    {{ rma.status || 'Pending' }}
                                </span>
                            </td>
                            <td class="py-3 px-4 text-right">
                                <button v-if="rma.status === 'Pending' || !rma.status" 
                                    @click.stop="openProcessModal(rma)"
                                    class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1.5 px-3 rounded-lg text-xs shadow-sm transition-all hover:shadow-md flex items-center gap-1 ml-auto">
                                    <span class="material-symbols-outlined text-[14px]">gavel</span> Process
                                </button>
                                <button v-else
                                    class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xs font-medium flex items-center gap-1 ml-auto transition-colors">
                                    <span class="material-symbols-outlined text-[16px]">visibility</span> Details
                                </button>
                            </td>
                        </tr>
                        <tr v-if="filteredList.length === 0">
                            <td colspan="6" class="py-12 text-center text-gray-500">
                                <div class="flex flex-col items-center gap-2 opacity-50">
                                    <span class="material-symbols-outlined text-4xl">inbox</span>
                                    <p class="text-sm">No return requests found.</p>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Process Return Modal -->
        <Teleport to="body">
            <div v-if="showProcessModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div class="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-lg max-h-[90vh] shadow-2xl flex flex-col animate-scale-in border border-gray-100 dark:border-white/10">
                    <div class="p-6 border-b border-gray-100 dark:border-white/10 flex justify-between items-center bg-gray-50 dark:bg-white/5 shrink-0 rounded-t-3xl">
                        <div>
                            <h3 class="text-lg font-bold text-gray-900 dark:text-white">Process Return Request</h3>
                            <p class="text-xs text-gray-500 font-mono">{{ selectedRMA?.id }} • {{ selectedRMA?.orderId }}</p>
                        </div>
                        <button @click="showProcessModal = false" class="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                            <span class="material-symbols-outlined">close</span>
                        </button>
                    </div>
                    
                    <div class="p-6 space-y-6 overflow-y-auto custom-scrollbar">
                        <!-- Customer Info -->
                        <div class="flex items-start gap-4 p-3 bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 rounded-lg">
                            <div class="w-10 h-10 rounded-full bg-blue-200 dark:bg-blue-500/30 flex items-center justify-center text-blue-700 dark:text-blue-300">
                                <span class="material-symbols-outlined">person</span>
                            </div>
                            <div>
                                <h4 class="font-bold text-gray-900 dark:text-white text-sm">{{ selectedRMA?.customer }}</h4>
                                <p class="text-xs text-gray-600 dark:text-gray-400">Reason: <span class="font-medium italic">"{{ selectedRMA?.reason }}"</span></p>
                            </div>
                        </div>

                        <!-- Action Form -->
                        <div class="space-y-4">
                            <div>
                                <label class="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-2">Item Condition Check</label>
                                <div class="grid grid-cols-2 gap-2">
                                    <button v-for="cond in ['Unopened', 'New/Open Box', 'Damaged', 'Defective', 'Scrap']" :key="cond"
                                        @click="processForm.condition = cond"
                                        :disabled="conditionVerified"
                                        class="px-3 py-2 rounded-lg text-xs font-bold border transition-all text-center disabled:opacity-75 disabled:cursor-not-allowed"
                                        :class="processForm.condition === cond ? 'bg-gray-900 text-white border-gray-900 dark:bg-white dark:text-gray-900 dark:border-white' : 'bg-white dark:bg-black/20 text-gray-500 border-gray-200 dark:border-white/10 hover:border-gray-400'">
                                        {{ cond }}
                                    </button>
                                </div>
                                <button v-if="!conditionVerified" 
                                    @click="verifyCondition"
                                    class="w-full mt-3 py-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 font-bold text-xs rounded-lg border border-blue-200 dark:border-blue-500/20 transition-colors flex items-center justify-center gap-2">
                                    <span class="material-symbols-outlined text-[16px]">verified_user</span> Verify Condition Check
                                </button>
                                <div v-else class="flex gap-2 w-full mt-3">
                                    <div class="flex-1 py-2 bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 font-bold text-xs rounded-lg border border-green-200 dark:border-green-500/20 flex items-center justify-center gap-2">
                                        <span class="material-symbols-outlined text-[16px]">check_circle</span> Verified
                                    </div>
                                    <button @click="unverifyCondition" class="px-3 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/20 text-gray-600 dark:text-gray-300 rounded-lg transition-colors" title="Retake Condition Check">
                                        <span class="material-symbols-outlined text-[16px]">edit</span>
                                    </button>
                                </div>
                            </div>

                            <div class="grid grid-cols-2 gap-4 filter" :class="!conditionVerified ? 'grayscale opacity-50 pointer-events-none' : ''">
                                <div>
                                    <label class="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">Decision</label>
                                    <select v-model="processForm.action" @change="updateRefundAmount" class="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/50">
                                        <option value="Refund">Full Refund</option>
                                        <option value="Partial Refund">Partial Refund</option>
                                        <option value="Exchange">Exchange / Replace</option>
                                        <option value="Store Credit">Store Credit</option>
                                    </select>
                                </div>
                                <div class="bg-gray-50 dark:bg-black/20 p-2 rounded-lg border border-gray-200 dark:border-white/10">
                                    <label class="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1 flex justify-between">
                                        <span>Refund ($)</span>
                                        <span class="text-xs font-mono text-gray-500">Max: ${{ selectedRMA?.originalPrice || 0 }}</span>
                                    </label>
                                    <input v-model.number="processForm.amount" type="number" 
                                        class="w-full bg-white dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-primary mb-2 font-mono disabled:opacity-50 disabled:cursor-not-allowed"
                                        :disabled="true">
                                    
                                    <!-- Percentage Quick Actions -->
                                    <div class="flex gap-1 justify-between" v-if="processForm.action === 'Partial Refund' || processForm.action === 'Store Credit' || processForm.action === 'Refund'">
                                        <button v-for="pct in [25, 50, 75, 100]" :key="pct"
                                            @click="processForm.amount = Math.round((selectedRMA?.originalPrice || 0) * (pct/100) * 100) / 100"
                                            class="flex-1 py-1 bg-white dark:bg-white/10 text-[10px] font-bold rounded border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/20 transition-colors text-gray-600 dark:text-gray-300">
                                            {{ pct }}%
                                        </button>
                                    </div>
                                    <div class="text-[10px] text-gray-400 font-bold flex items-center gap-1 mt-1 justify-end italic">
                                        <span class="material-symbols-outlined text-[12px]">lock</span> Read-only (Auto-calculated)
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label class="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">Internal Notes</label>
                                <textarea v-model="processForm.notes" rows="2" placeholder="Add inspection notes..." class="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/50"></textarea>
                            </div>
                        </div>
                    </div>

                    <div class="p-4 bg-gray-50 dark:bg-white/5 flex justify-end gap-2 border-t border-gray-100 dark:border-white/10 shrink-0 rounded-b-3xl">
                        <button @click="confirmProcess('Rejected')" class="px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl text-sm font-bold transition-colors">
                            Reject Return
                        </button>
                        <button @click="confirmProcess('Approved')" 
                            :disabled="!conditionVerified"
                            class="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed dark:disabled:bg-white/10 dark:disabled:text-white/30 text-white text-sm font-bold rounded-xl shadow-sm transition-all flex items-center gap-2">
                            <span class="material-symbols-outlined text-[18px]">check_circle</span> Approve & Process
                        </button>
                    </div>
                </div>
            </div>
        </Teleport>

        <!-- Image Gallery Modal -->
        <Teleport to="body">
            <div v-if="showImageModal" class="fixed inset-0 bg-black/90 backdrop-blur-md z-[60] flex items-center justify-center p-4 animate-fade-in" @click.self="showImageModal = false">
                <div class="w-full max-w-4xl h-[80vh] flex flex-col relative">
                    <!-- Header -->
                    <div class="absolute top-0 left-0 w-full p-4 flex justify-between items-start z-10 pointer-events-none">
                        <div class="pointer-events-auto">
                            <span class="bg-white/10 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-mono border border-white/20">
                                {{ selectedRMA?.id }}
                            </span>
                        </div>
                        <button @click="showImageModal = false" class="pointer-events-auto text-white/50 hover:text-white bg-black/50 hover:bg-black/80 rounded-full p-2 transition-all">
                            <span class="material-symbols-outlined">close</span>
                        </button>
                    </div>

                    <!-- Main Image Stage -->
                    <div class="flex-1 flex items-center justify-center relative overflow-hidden rounded-xl bg-black border border-white/10">
                        <img v-if="selectedImages.length > 0" 
                             :src="selectedImages[activeImageIndex]" 
                             class="max-h-full max-w-full object-contain transition-opacity duration-300"
                             :key="activeImageIndex"
                             alt="Return proof">
                        <div v-else class="text-white/30 flex flex-col items-center gap-2">
                             <span class="material-symbols-outlined text-6xl">broken_image</span>
                             <p>No images available for this return.</p>
                        </div>

                        <!-- Nav Buttons -->
                        <button v-if="selectedImages.length > 1" 
                                @click="activeImageIndex = (activeImageIndex - 1 + selectedImages.length) % selectedImages.length"
                                class="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white text-white hover:text-black rounded-full p-4 hover:shadow-lg transition-all backdrop-blur-md">
                            <span class="material-symbols-outlined text-2xl">chevron_left</span>
                        </button>
                        <button v-if="selectedImages.length > 1" 
                                @click="activeImageIndex = (activeImageIndex + 1) % selectedImages.length"
                                class="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white text-white hover:text-black rounded-full p-4 hover:shadow-lg transition-all backdrop-blur-md">
                            <span class="material-symbols-outlined text-2xl">chevron_right</span>
                        </button>
                    </div>

                    <!-- Thumbnails Strip -->
                    <div v-if="selectedImages.length > 0" class="h-24 mt-4 flex gap-2 justify-center overflow-x-auto py-2">
                        <button v-for="(img, idx) in selectedImages" :key="idx"
                            @click="activeImageIndex = idx"
                            class="relative h-full aspect-video rounded-lg overflow-hidden border-2 transition-all"
                            :class="activeImageIndex === idx ? 'border-primary shadow-lg ring-2 ring-primary/30 scale-105' : 'border-transparent opacity-60 hover:opacity-100'">
                            <img :src="img" class="w-full h-full object-cover">
                        </button>
                    </div>
                </div>
            </div>
        </Teleport>

        <!-- Details Modal -->
        <Teleport to="body">
            <div v-if="showDetailsModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div class="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-md max-h-[90vh] shadow-2xl flex flex-col animate-scale-in border border-gray-100 dark:border-white/10">
                    <div class="p-6 border-b border-gray-100 dark:border-white/10 flex justify-between items-center bg-gray-50 dark:bg-white/5 shrink-0 rounded-t-3xl">
                        <h3 class="text-lg font-bold text-gray-900 dark:text-white">Return Details</h3>
                        <button @click="showDetailsModal = false" class="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                            <span class="material-symbols-outlined">close</span>
                        </button>
                    </div>
                    <div class="p-6 space-y-4 overflow-y-auto custom-scrollbar">
                        <div class="flex justify-between items-center text-sm">
                            <span class="text-gray-500">Status</span>
                            <span class="px-2 py-0.5 rounded-full text-xs font-bold uppercase border" :class="getStatusClass(selectedRMA?.status)">{{ selectedRMA?.status }}</span>
                        </div>
                        <div class="grid grid-cols-2 gap-4 text-sm mt-4">
                            <div>
                                <p class="text-xs text-gray-500 mb-0.5">RMA ID</p>
                                <p class="font-mono font-bold dark:text-white">{{ selectedRMA?.id }}</p>
                            </div>
                             <div>
                                <p class="text-xs text-gray-500 mb-0.5">Order ID</p>
                                <p class="font-mono font-bold dark:text-white">{{ selectedRMA?.orderId }}</p>
                            </div>
                            <div>
                                <p class="text-xs text-gray-500 mb-0.5">Condition</p>
                                <p class="font-bold dark:text-white">{{ selectedRMA?.condition }}</p>
                            </div>
                            <div>
                                <p class="text-xs text-gray-500 mb-0.5">Refunded</p>
                                <p class="font-bold text-green-600 dark:text-green-400 font-mono">${{ selectedRMA?.refundAmount || 0 }}</p>
                            </div>
                        </div>
                        <div v-if="selectedRMA?.notes" class="bg-gray-50 dark:bg-white/5 p-3 rounded-xl text-sm text-gray-600 dark:text-gray-300 italic border border-gray-100 dark:border-white/10">
                            "{{ selectedRMA.notes }}"
                        </div>
                    </div>
                </div>
            </div>
        </Teleport>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useLogisticStore } from '@/stores/logisticStore'
import { storeToRefs } from 'pinia'

// Store Access
const store = useLogisticStore()
const { filteredReturns } = storeToRefs(store)

// View State
const searchQuery = ref('')
const activeStatus = ref('All')
const showProcessModal = ref(false)
const showDetailsModal = ref(false)
const showImageModal = ref(false)
const conditionVerified = ref(false)
const selectedRMA = ref(null)
const selectedImages = ref([])
const activeImageIndex = ref(0)

// Process Form State
const processForm = ref({
    action: 'Refund',
    amount: 0,
    condition: 'Unopened',
    notes: ''
})

// Tabs Config
const tabs = [
    { id: 'All', label: 'All Returns' },
    { id: 'Pending', label: 'Pending Review' },
    { id: 'Approved', label: 'Approved' },
    { id: 'Rejected', label: 'Rejected' }
]

// Logic
const pendingReturns = computed(() => {
    return filteredReturns.value.filter(r => !r.status || r.status === 'Pending').length
})

const refundValue = computed(() => {
    // Only count approved refunds
    return filteredReturns.value
        .filter(r => r.status === 'Approved')
        .reduce((sum, r) => sum + (r.refundAmount || 0), 0)
})

const filteredList = computed(() => {
    let list = filteredReturns.value

    // Status Filter
    if (activeStatus.value !== 'All') {
        if (activeStatus.value === 'Pending') {
            list = list.filter(r => !r.status || r.status === 'Pending')
        } else {
            list = list.filter(r => r.status === activeStatus.value)
        }
    }

    // Search Filter
    if (searchQuery.value) {
        const q = searchQuery.value.toLowerCase()
        list = list.filter(r => 
            r.id.toLowerCase().includes(q) || 
            r.orderId.toLowerCase().includes(q) || 
            r.customer.toLowerCase().includes(q)
        )
    }

    return list
})

// Helpers
const getStatusClass = (status) => {
    switch(status) {
        case 'Approved': return 'bg-green-50 border-green-200 text-green-600 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20'
        case 'Rejected': return 'bg-red-50 border-red-200 text-red-600 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20'
        default: return 'bg-yellow-50 border-yellow-200 text-yellow-600 dark:bg-yellow-500/10 dark:text-yellow-400 dark:border-yellow-500/20'
    }
}

const getConditionClass = (condition) => {
    if (condition === 'Damaged' || condition === 'Scrap') return 'bg-red-50 border-red-200 text-red-600 dark:bg-red-500/10 dark:text-red-400'
    if (condition === 'New/Open Box') return 'bg-green-50 border-green-200 text-green-600 dark:bg-green-500/10 dark:text-green-400'
    if (condition === 'Unopened') return 'bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400'
    return 'bg-yellow-50 border-yellow-200 text-yellow-600 dark:bg-yellow-500/10 dark:text-yellow-400'
}

// Actions
const openImageGallery = (rma) => {
    selectedRMA.value = rma
    selectedImages.value = rma.images || []
    activeImageIndex.value = 0
    showImageModal.value = true
}

const openDetails = (rma) => {
    selectedRMA.value = rma
    if (rma.status && rma.status !== 'Pending') {
        showDetailsModal.value = true
    } else {
        openProcessModal(rma)
    }
}

const openProcessModal = (rma) => {
    selectedRMA.value = rma
    conditionVerified.value = false
    processForm.value = {
        action: 'Refund',
        amount: rma.originalPrice || 0, // Default to full refund
        condition: rma.condition,
        notes: ''
    }
    showProcessModal.value = true
}

const verifyCondition = () => {
    conditionVerified.value = true
}

const unverifyCondition = () => {
    conditionVerified.value = false
}

const updateRefundAmount = () => {
    if (!selectedRMA.value) return
    const price = selectedRMA.value.originalPrice || 0

    switch(processForm.value.action) {
        case 'Refund':
            processForm.value.amount = price
            break
        case 'Exchange':
            processForm.value.amount = 0
            break
        case 'Partial Refund':
            processForm.value.amount = Math.round(price * 0.5 * 100) / 100 // Default to 50%
            break
        case 'Store Credit':
             processForm.value.amount = price
             break
    }
}

const confirmProcess = (decision) => {
    if (!selectedRMA.value) return 

    // Update Store
    store.updateReturnStatus(selectedRMA.value.id, decision, {
        refundAmount: decision === 'Approved' ? processForm.value.amount : 0,
        notes: processForm.value.notes,
        condition: processForm.value.condition
    })
    
    // Add Transaction if Refunded
    if (decision === 'Approved' && processForm.value.amount > 0) {
        store.addTransaction({
            id: Date.now(), // Generate ID
            date: new Date().toISOString().split('T')[0],
            desc: `Refund for ${selectedRMA.value.id}`,
            amount: -processForm.value.amount,
            type: 'Expense',
            status: 'Completed',
            hubId: store.activeWarehouse
        })
    }

    showProcessModal.value = false
}
</script>
