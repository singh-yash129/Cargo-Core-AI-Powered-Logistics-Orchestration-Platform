<template>
    <div class="space-y-6">
        <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <div>
                <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Recurring Shipments</h2>
                <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Automate your regular shipping schedules</p>
            </div>
            <button @click="openCreateModal"
                class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm transition-colors flex items-center gap-2">
                <span class="material-symbols-outlined text-[16px]">add</span> Create Schedule
            </button>
        </div>

        <!-- Summary Chips -->
        <div class="flex flex-wrap gap-3">
            <div class="glass-panel px-4 py-2 rounded-lg flex items-center gap-2">
                <span class="material-symbols-outlined text-blue-500 text-[18px]">schedule</span>
                <span class="text-sm font-bold text-gray-900 dark:text-white">{{ store.recurringRules.length }}</span>
                <span class="text-xs text-gray-500">Total</span>
            </div>
            <div class="glass-panel px-4 py-2 rounded-lg flex items-center gap-2">
                <span class="material-symbols-outlined text-green-500 text-[18px]">toggle_on</span>
                <span class="text-sm font-bold text-green-500">{{ activeCount }}</span>
                <span class="text-xs text-gray-500">Active</span>
            </div>
            <div class="glass-panel px-4 py-2 rounded-lg flex items-center gap-2">
                <span class="material-symbols-outlined text-gray-400 text-[18px]">toggle_off</span>
                <span class="text-sm font-bold text-gray-400">{{ store.recurringRules.length - activeCount }}</span>
                <span class="text-xs text-gray-500">Paused</span>
            </div>
        </div>

        <!-- Loading skeleton -->
        <div v-if="store.loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <div v-for="i in 3" :key="i" class="glass-panel p-5 rounded-xl animate-pulse">
                <div class="flex justify-between mb-4">
                    <div class="h-5 w-20 bg-gray-200 dark:bg-white/10 rounded"></div>
                    <div class="flex gap-1">
                        <div class="h-7 w-7 bg-gray-200 dark:bg-white/10 rounded-lg"></div>
                        <div class="h-7 w-7 bg-gray-200 dark:bg-white/10 rounded-lg"></div>
                    </div>
                </div>
                <div class="h-5 w-3/4 bg-gray-200 dark:bg-white/10 rounded mb-2"></div>
                <div class="h-4 w-full bg-gray-200 dark:bg-white/10 rounded mb-4"></div>
                <div class="space-y-2 mb-4">
                    <div class="h-4 w-2/3 bg-gray-200 dark:bg-white/10 rounded"></div>
                    <div class="h-4 w-1/2 bg-gray-200 dark:bg-white/10 rounded"></div>
                </div>
                <div class="flex justify-between pt-3 border-t border-gray-100 dark:border-white/5">
                    <div class="h-4 w-24 bg-gray-200 dark:bg-white/10 rounded"></div>
                    <div class="h-5 w-9 bg-gray-200 dark:bg-white/10 rounded-full"></div>
                </div>
            </div>
        </div>

        <!-- Rules Grid -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <div v-for="rule in store.recurringRules" :key="rule.id"
                class="glass-panel p-5 rounded-xl border-l-4 transition-all duration-200"
                :class="rule.active ? 'border-blue-500' : 'border-gray-300 dark:border-gray-600 opacity-75'">
                <div class="flex justify-between items-start mb-3">
                    <span class="px-2 py-0.5 rounded text-[10px] font-bold"
                        :class="rule.active ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400' : 'bg-gray-500/20 text-gray-500'">{{ rule.frequency }}</span>
                    <div class="flex gap-1">
                        <button @click="openEditModal(rule)" class="p-1.5 rounded-lg hover:bg-blue-500/10 text-gray-400 hover:text-blue-500 transition-colors" title="Edit">
                            <span class="material-symbols-outlined text-[16px]">edit</span>
                        </button>
                        <button @click="confirmDelete(rule)" class="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-500 transition-colors" title="Delete">
                            <span class="material-symbols-outlined text-[16px]">delete</span>
                        </button>
                    </div>
                </div>

                <h3 class="font-bold text-gray-900 dark:text-white text-base mb-1">{{ rule.name }}</h3>
                <p class="text-xs text-gray-500 dark:text-gray-400 mb-4">{{ rule.description || '—' }}</p>

                <div class="space-y-2 mb-4">
                    <div class="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                        <span class="material-symbols-outlined text-[14px] text-blue-500">arrow_forward</span>
                        {{ rule.route }}
                    </div>
                    <div class="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                        <span class="material-symbols-outlined text-[14px] text-purple-500">inventory_2</span>
                        {{ rule.details }}
                    </div>
                </div>

                <div class="flex justify-between items-center border-t border-gray-100 dark:border-white/5 pt-3">
                    <div class="text-[10px] text-gray-500">
                        Next: <span class="font-bold text-gray-700 dark:text-gray-300">{{ formatNextRun(rule.nextRun) }}</span>
                    </div>
                    <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" :checked="rule.active" @change="toggleRule(rule)"
                            :disabled="togglingId === rule.id" class="sr-only peer">
                        <div class="w-9 h-5 rounded-full transition-colors"
                            :class="[
                                togglingId === rule.id ? 'opacity-50' : '',
                                rule.active ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-700'
                            ]">
                            <div class="absolute top-[2px] left-[2px] bg-white rounded-full h-4 w-4 shadow transition-all"
                                :class="rule.active ? 'translate-x-4' : 'translate-x-0'"></div>
                        </div>
                    </label>
                </div>
            </div>

            <!-- Empty state -->
            <div v-if="store.recurringRules.length === 0" class="col-span-full glass-panel p-12 rounded-xl flex flex-col items-center justify-center">
                <span class="material-symbols-outlined text-5xl text-gray-300 dark:text-gray-600 mb-3">event_repeat</span>
                <p class="text-gray-500 dark:text-gray-400 mb-4">No recurring schedules yet</p>
                <button @click="openCreateModal" class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors">Create Your First Schedule</button>
            </div>
        </div>

        <!-- Create / Edit Modal -->
        <Teleport to="body">
            <BaseModal :isOpen="showFormModal" @close="closeFormModal">
                <template #title>{{ editingRule ? 'Edit Schedule' : 'Create Recurring Schedule' }}</template>
                <div class="space-y-4">
                    <div>
                        <label class="block text-xs text-gray-500 dark:text-gray-400 mb-1.5">Schedule Name *</label>
                        <input v-model="form.name" type="text" placeholder="e.g. Weekly Restock - NY Store"
                            class="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg p-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
                            :class="formErrors.name ? 'border-red-400' : ''">
                        <p v-if="formErrors.name" class="text-xs text-red-500 mt-1">{{ formErrors.name }}</p>
                    </div>
                    <div>
                        <label class="block text-xs text-gray-500 dark:text-gray-400 mb-1.5">Description</label>
                        <input v-model="form.description" type="text" placeholder="Brief description"
                            class="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg p-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-blue-500">
                    </div>
                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="block text-xs text-gray-500 dark:text-gray-400 mb-1.5">Frequency *</label>
                            <select v-model="form.frequency"
                                class="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg p-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-blue-500">
                                <option value="Daily" class="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">Daily</option>
                                <option value="Every Monday" class="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">Every Monday</option>
                                <option value="Every Wednesday" class="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">Every Wednesday</option>
                                <option value="Every Friday" class="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">Every Friday</option>
                                <option value="Bi-Weekly" class="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">Bi-Weekly</option>
                                <option value="1st of Month" class="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">1st of Month</option>
                                <option value="15th of Month" class="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">15th of Month</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-xs text-gray-500 dark:text-gray-400 mb-1.5">Next Run Date *</label>
                            <input v-model="form.nextRun" type="date" :min="todayISO"
                                class="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg p-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
                                :class="formErrors.nextRun ? 'border-red-400' : ''">
                            <p v-if="formErrors.nextRun" class="text-xs text-red-500 mt-1">{{ formErrors.nextRun }}</p>
                        </div>
                    </div>
                    <div>
                        <label class="block text-xs text-gray-500 dark:text-gray-400 mb-1.5">Route *</label>
                        <input v-model="form.route" type="text" placeholder="e.g. Mumbai Hub → Store #402"
                            class="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg p-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
                            :class="formErrors.route ? 'border-red-400' : ''">
                        <p v-if="formErrors.route" class="text-xs text-red-500 mt-1">{{ formErrors.route }}</p>
                    </div>
                    <div>
                        <label class="block text-xs text-gray-500 dark:text-gray-400 mb-1.5">Cargo Details *</label>
                        <input v-model="form.details" type="text" placeholder="e.g. 12 Pallets • General Goods"
                            class="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg p-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
                            :class="formErrors.details ? 'border-red-400' : ''">
                        <p v-if="formErrors.details" class="text-xs text-red-500 mt-1">{{ formErrors.details }}</p>
                    </div>

                    <!-- API error -->
                    <div v-if="submitError" class="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg">
                        <span class="material-symbols-outlined text-red-500 text-[16px]">error</span>
                        <p class="text-xs text-red-600 dark:text-red-400">{{ submitError }}</p>
                    </div>
                </div>
                <template #footer>
                    <button @click="closeFormModal" class="px-4 py-2 text-gray-500 text-sm">Cancel</button>
                    <button @click="submitForm" :disabled="isSubmitting"
                        class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2">
                        <span v-if="isSubmitting" class="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                        {{ editingRule ? 'Save Changes' : 'Create Schedule' }}
                    </button>
                </template>
            </BaseModal>
        </Teleport>

        <!-- Delete Confirmation Modal -->
        <Teleport to="body">
            <BaseModal :isOpen="showDeleteModal" @close="showDeleteModal = false">
                <template #title>Delete Schedule</template>
                <div class="text-center py-4">
                    <span class="material-symbols-outlined text-5xl text-red-500 mb-3">warning</span>
                    <p class="text-gray-600 dark:text-gray-300 text-sm">Are you sure you want to delete <strong class="text-gray-900 dark:text-white">{{ deletingRule?.name }}</strong>?</p>
                    <p class="text-xs text-gray-400 mt-2">This action cannot be undone.</p>
                    <p v-if="deleteError" class="text-xs text-red-500 mt-3">{{ deleteError }}</p>
                </div>
                <template #footer>
                    <button @click="showDeleteModal = false" class="px-4 py-2 text-gray-500 text-sm">Cancel</button>
                    <button @click="executeDelete" :disabled="isDeleting"
                        class="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2">
                        <span v-if="isDeleting" class="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                        Delete
                    </button>
                </template>
            </BaseModal>
        </Teleport>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useVendorStore } from '@/stores/vendorStore'
import BaseModal from '@/components/BaseModal.vue'

const store = useVendorStore()

// Modal state
const showFormModal = ref(false)
const showDeleteModal = ref(false)
const editingRule = ref(null)
const deletingRule = ref(null)

// Loading/error state
const isSubmitting = ref(false)
const isDeleting = ref(false)
const togglingId = ref(null)
const submitError = ref('')
const deleteError = ref('')
const formErrors = ref({})

// Form
const defaultForm = { name: '', description: '', frequency: 'Every Monday', route: '', details: '', nextRun: '' }
const form = ref({ ...defaultForm })

// Today's date for the date picker minimum
const todayISO = new Date().toISOString().split('T')[0]

const activeCount = computed(() => store.recurringRules.filter(r => r.active).length)

function formatNextRun(val) {
    if (!val) return '—'
    // If ISO date string (YYYY-MM-DD), format nicely
    if (/^\d{4}-\d{2}-\d{2}/.test(val)) {
        return new Date(val + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    }
    return val
}

function validateForm() {
    const errs = {}
    if (!form.value.name?.trim()) errs.name = 'Schedule name is required'
    if (!form.value.route?.trim()) errs.route = 'Route is required'
    if (!form.value.details?.trim()) errs.details = 'Cargo details are required'
    if (!form.value.nextRun) errs.nextRun = 'Next run date is required'
    formErrors.value = errs
    return Object.keys(errs).length === 0
}

async function toggleRule(rule) {
    if (togglingId.value) return
    togglingId.value = rule.id
    try {
        await store.toggleRecurringRule(rule.id)
        showToast(rule.active ? `"${rule.name}" paused` : `"${rule.name}" activated`)
    } catch (e) {
        showToast(e?.message || 'Failed to toggle schedule', 'error')
    } finally {
        togglingId.value = null
    }
}

function openCreateModal() {
    editingRule.value = null
    form.value = { ...defaultForm }
    formErrors.value = {}
    submitError.value = ''
    showFormModal.value = true
}

function openEditModal(rule) {
    editingRule.value = rule
    // Normalize nextRun to ISO date if possible
    let nextRun = rule.nextRun || ''
    if (nextRun && !/^\d{4}-\d{2}-\d{2}/.test(nextRun)) {
        const parsed = new Date(nextRun)
        if (!isNaN(parsed)) nextRun = parsed.toISOString().split('T')[0]
    }
    form.value = { name: rule.name, description: rule.description || '', frequency: rule.frequency, route: rule.route, details: rule.details, nextRun }
    formErrors.value = {}
    submitError.value = ''
    showFormModal.value = true
}

function closeFormModal() {
    showFormModal.value = false
    submitError.value = ''
    formErrors.value = {}
}

async function submitForm() {
    if (!validateForm()) return
    isSubmitting.value = true
    submitError.value = ''
    try {
        if (editingRule.value) {
            await store.updateRecurringRule(editingRule.value.id, { ...form.value, active: editingRule.value.active })
            showToast('Schedule updated')
        } else {
            await store.addRecurringRule({ ...form.value, active: true })
            showToast('Schedule created')
        }
        closeFormModal()
    } catch (e) {
        submitError.value = e?.message || 'Something went wrong. Please try again.'
    } finally {
        isSubmitting.value = false
    }
}

function confirmDelete(rule) {
    deletingRule.value = rule
    deleteError.value = ''
    showDeleteModal.value = true
}

async function executeDelete() {
    if (!deletingRule.value) return
    isDeleting.value = true
    deleteError.value = ''
    try {
        await store.deleteRecurringRule(deletingRule.value.id)
        showDeleteModal.value = false
        showToast('Schedule deleted')
        deletingRule.value = null
    } catch (e) {
        deleteError.value = e?.message || 'Failed to delete. Please try again.'
    } finally {
        isDeleting.value = false
    }
}

function showToast(msg, type = 'success') {
    const t = document.createElement('div')
    t.className = `fixed right-4 bottom-4 z-[9999] text-white text-sm font-bold px-4 py-2 rounded-lg shadow-xl ${type === 'error' ? 'bg-red-500' : 'bg-green-500'}`
    t.textContent = msg
    document.body.appendChild(t)
    setTimeout(() => t.remove(), 3000)
}
</script>
