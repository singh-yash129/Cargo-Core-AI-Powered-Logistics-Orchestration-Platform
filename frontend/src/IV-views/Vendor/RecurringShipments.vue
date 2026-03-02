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

        <!-- Rules Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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
                <p class="text-xs text-gray-500 dark:text-gray-400 mb-4">{{ rule.description }}</p>

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
                    <div class="text-[10px] text-gray-500">Next: <span class="font-bold text-gray-700 dark:text-gray-300">{{ rule.nextRun }}</span></div>
                    <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" :checked="rule.active" @change="toggleRule(rule)" class="sr-only peer">
                        <div class="w-9 h-5 bg-gray-300 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
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
            <BaseModal :isOpen="showFormModal" @close="showFormModal = false">
                <template #title>{{ editingRule ? 'Edit Schedule' : 'Create Recurring Schedule' }}</template>
                <div class="space-y-4">
                    <div>
                        <label class="block text-xs text-gray-500 dark:text-gray-400 mb-1.5">Schedule Name *</label>
                        <input v-model="form.name" type="text" placeholder="e.g. Weekly Restock - NY Store" class="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg p-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-blue-500">
                    </div>
                    <div>
                        <label class="block text-xs text-gray-500 dark:text-gray-400 mb-1.5">Description</label>
                        <input v-model="form.description" type="text" placeholder="Brief description" class="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg p-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-blue-500">
                    </div>
                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="block text-xs text-gray-500 dark:text-gray-400 mb-1.5">Frequency *</label>
                            <select v-model="form.frequency" class="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg p-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-blue-500">
                                <option value="Daily">Daily</option>
                                <option value="Every Monday">Every Monday</option>
                                <option value="Every Wednesday">Every Wednesday</option>
                                <option value="Every Friday">Every Friday</option>
                                <option value="Bi-Weekly">Bi-Weekly</option>
                                <option value="1st of Month">1st of Month</option>
                                <option value="15th of Month">15th of Month</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-xs text-gray-500 dark:text-gray-400 mb-1.5">Next Run *</label>
                            <input v-model="form.nextRun" type="text" placeholder="e.g. Oct 28" class="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg p-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-blue-500">
                        </div>
                    </div>
                    <div>
                        <label class="block text-xs text-gray-500 dark:text-gray-400 mb-1.5">Route *</label>
                        <input v-model="form.route" type="text" placeholder="e.g. Hub A -> Store #402" class="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg p-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-blue-500">
                    </div>
                    <div>
                        <label class="block text-xs text-gray-500 dark:text-gray-400 mb-1.5">Cargo Details *</label>
                        <input v-model="form.details" type="text" placeholder="e.g. 12 Pallets • General Goods" class="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg p-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-blue-500">
                    </div>
                </div>
                <template #footer>
                    <button @click="showFormModal = false" class="px-4 py-2 text-gray-500 text-sm">Cancel</button>
                    <button @click="submitForm" :disabled="!form.name || !form.route || !form.details" class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors disabled:opacity-50">{{ editingRule ? 'Save Changes' : 'Create Schedule' }}</button>
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
                </div>
                <template #footer>
                    <button @click="showDeleteModal = false" class="px-4 py-2 text-gray-500 text-sm">Cancel</button>
                    <button @click="executeDelete" class="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 transition-colors">Delete</button>
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
const showFormModal = ref(false)
const showDeleteModal = ref(false)
const editingRule = ref(null)
const deletingRule = ref(null)

const defaultForm = { name: '', description: '', frequency: 'Every Monday', route: '', details: '', nextRun: '' }
const form = ref({ ...defaultForm })

const activeCount = computed(() => store.recurringRules.filter(r => r.active).length)

function toggleRule(rule) {
    store.toggleRecurringRule(rule.id)
    showToast(rule.active ? `"${rule.name}" paused` : `"${rule.name}" activated`)
}

function openCreateModal() {
    editingRule.value = null
    form.value = { ...defaultForm }
    showFormModal.value = true
}

function openEditModal(rule) {
    editingRule.value = rule
    form.value = { name: rule.name, description: rule.description, frequency: rule.frequency, route: rule.route, details: rule.details, nextRun: rule.nextRun }
    showFormModal.value = true
}

function submitForm() {
    if (!form.value.name || !form.value.route || !form.value.details) return
    if (editingRule.value) {
        Object.assign(editingRule.value, form.value)
        showToast('Schedule updated')
    } else {
        store.recurringRules.push({ id: Date.now(), ...form.value, active: true })
        showToast('Schedule created')
    }
    showFormModal.value = false
}

function confirmDelete(rule) {
    deletingRule.value = rule
    showDeleteModal.value = true
}

function executeDelete() {
    if (!deletingRule.value) return
    const idx = store.recurringRules.findIndex(r => r.id === deletingRule.value.id)
    if (idx !== -1) store.recurringRules.splice(idx, 1)
    showDeleteModal.value = false
    showToast('Schedule deleted')
    deletingRule.value = null
}

function showToast(msg) {
    const t = document.createElement('div')
    t.className = 'fixed right-4 bottom-4 z-[9999] bg-green-500 text-white text-sm font-bold px-4 py-2 rounded-lg shadow-xl'
    t.textContent = msg
    document.body.appendChild(t)
    setTimeout(() => t.remove(), 3000)
}

</script>
