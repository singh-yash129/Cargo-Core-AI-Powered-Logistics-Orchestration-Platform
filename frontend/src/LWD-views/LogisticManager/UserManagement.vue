<template>
    <div class="space-y-6">
        <div class="flex justify-between items-center">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white">User & Role Management</h2>
            <button @click="openModal('create')"
                class="bg-primary hover:bg-primary/90 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors shadow-sm">
                <span class="material-symbols-outlined">person_add</span>
                Create Manager / Dispatcher
            </button>
        </div>

        <!-- Role Filter Tabs -->
        <div class="flex gap-4 border-b border-gray-200 dark:border-white/10 pb-1">
            <button v-for="tab in tabs" :key="tab" class="px-4 py-2 text-sm font-medium transition-colors relative"
                :class="activeTab === tab ? 'text-primary' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'"
                @click="activeTab = tab">
                {{ tab }}
                <div v-if="activeTab === tab"
                    class="absolute bottom-[-5px] left-0 w-full h-1 bg-primary rounded-t-full"></div>
            </button>
        </div>

        <!-- User List -->
        <div class="glass-panel rounded-xl overflow-hidden p-6">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <!-- User Card -->
                <div v-for="user in displayedUsers" :key="user.email"
                    class="bg-gray-50 dark:bg-white/5 rounded-xl p-5 border border-gray-200 dark:border-white/5 hover:border-primary/50 dark:hover:border-primary/30 transition-all group relative shadow-sm">
                    <div class="absolute top-4 right-4 flex items-center gap-1" @click.stop>
                        <button v-if="user.username" @click="openCreds(user)"
                            class="text-gray-400 hover:text-primary transition-colors p-1 rounded-full hover:bg-gray-100 dark:hover:bg-white/10"
                            title="View Credentials">
                            <span class="material-symbols-outlined text-[20px]">visibility</span>
                        </button>
                        <button @click="toggleDropdown(user.email)"
                            class="text-gray-400 hover:text-gray-900 dark:text-gray-500 dark:hover:text-white cursor-pointer transition-colors p-1 rounded-full hover:bg-gray-100 dark:hover:bg-white/10">
                            <span class="material-symbols-outlined">more_vert</span>
                        </button>

                        <!-- Action Dropdown -->
                        <div v-if="activeDropdown === user.email"
                            class="absolute right-0 mt-1 w-48 bg-white dark:bg-card-dark border border-gray-200 dark:border-white/10 rounded-xl shadow-lg z-10 py-1 overflow-hidden">
                            <button @click="openModal('edit-profile', user); activeDropdown = null"
                                class="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 flex items-center gap-2 transition-colors">
                                <span class="material-symbols-outlined text-[18px]">edit</span>
                                Edit Profile
                            </button>
                            <button @click="store.toggleUserStatus(user.email); activeDropdown = null"
                                class="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 flex items-center gap-2 transition-colors">
                                <span class="material-symbols-outlined text-[18px]">
                                    {{ user.status === 'Active' ? 'block' : 'check_circle' }}
                                </span>
                                {{ user.status === 'Active' ? 'Suspend User' : 'Activate User' }}
                            </button>
                            <div class="h-px bg-gray-200 dark:bg-white/5 my-1"></div>
                            <button @click="store.deleteUser(user.email); activeDropdown = null"
                                class="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center gap-2 transition-colors">
                                <span class="material-symbols-outlined text-[18px]">delete</span>
                                Delete
                            </button>
                        </div>
                    </div>

                    <div class="flex items-center gap-4 mb-4">
                        <img :src="user.avatar"
                            class="w-14 h-14 rounded-full border-2 border-white dark:border-card-dark shadow-sm">
                        <div>
                            <div class="font-bold text-gray-900 dark:text-white text-lg leading-tight">{{ user.name }}
                            </div>
                            <div class="text-xs text-gray-500 dark:text-gray-400">{{ user.email }}</div>
                        </div>
                    </div>

                    <div class="flex gap-2 mb-4">
                        <span
                            class="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 text-[10px] uppercase font-bold tracking-wider border border-blue-200 dark:border-blue-500/20 shadow-sm">{{
                                user.role }}</span>
                        <span v-if="user.status === 'Active'"
                            class="px-2 py-0.5 rounded-full bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400 text-[10px] uppercase font-bold tracking-wider border border-green-200 dark:border-green-500/20 shadow-sm">Active</span>
                        <span v-else
                            class="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 dark:bg-gray-500/10 dark:text-gray-400 text-[10px] uppercase font-bold tracking-wider border border-gray-200 dark:border-gray-500/20 shadow-sm">Inactive</span>
                    </div>

                    <div
                        class="pt-4 border-t border-gray-200 dark:border-white/5 flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 font-medium">
                        <span>Last Login: {{ user.lastLogin }}</span>
                        <button @click="openModal('edit-access', user)"
                            class="text-primary hover:text-primary/80 transition-colors hover:underline">Edit
                            Access</button>
                    </div>
                </div>

            </div>
        </div>

        <!-- User Form Modal -->
        <Teleport to="body">
            <div v-if="isModalOpen"
                class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                @click.self="closeModal">
                <div
                    class="bg-white dark:bg-card-dark w-full max-w-2xl rounded-2xl shadow-2xl border border-gray-200 dark:border-white/10 overflow-hidden flex flex-col">
                    <!-- Header -->
                    <div
                        class="px-6 py-4 border-b border-gray-200 dark:border-white/5 flex justify-between items-center bg-gray-50 dark:bg-white/5">
                        <h3 class="text-lg font-bold text-gray-900 dark:text-white">
                            {{ modalMode === 'create' ? 'Create Manager / Dispatcher' : (modalMode === 'edit-profile' ?
                                `Edit Profile: ${formData.role || 'User'}` : `Edit Access: ${formData.role || 'User'}`) }}
                        </h3>
                        <button @click="closeModal"
                            class="text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors">
                            <span class="material-symbols-outlined">close</span>
                        </button>
                    </div>

                    <!-- Body / Form -->
                    <div class="p-6 overflow-y-auto space-y-4 max-h-[70vh]">

                        <!-- === CREATE MODE: Strict Form === -->
                        <template v-if="modalMode === 'create'">
                            <!-- Role & Hub -->
                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <label
                                        class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
                                    <div class="relative">
                                        <select v-model="formData.role"
                                            class="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:border-primary/50 transition-colors appearance-none">
                                            <option value="Warehouse Manager">Warehouse Manager</option>
                                            <option value="Dispatcher">Dispatcher</option>
                                        </select>
                                        <span
                                            class="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">arrow_drop_down</span>
                                    </div>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Hub
                                        Assignment</label>
                                    <div class="relative">
                                        <select v-model="formData.hubId"
                                            class="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:border-primary/50 transition-colors appearance-none">
                                            <option v-for="h in store.hubs" :key="h.id" :value="h.id">{{ h.name }}
                                            </option>
                                        </select>
                                        <span
                                            class="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">arrow_drop_down</span>
                                    </div>
                                </div>
                            </div>

                            <div class="h-px bg-gray-200 dark:bg-white/10 my-4"></div>
                            <h4 class="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-2">
                                Personal Details</h4>

                            <!-- Loop through strict fields to apply Lock/Unlock mechanics -->
                            <div v-for="(field, key) in strictFields" :key="key" class="relative">
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{{
                                    field.label }}</label>
                                <div class="relative flex items-center">
                                    <input v-model="formData[key]" :type="field.type" :placeholder="field.placeholder"
                                        @input="formatField(key)" :disabled="!unlockedFields[key]"
                                        class="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:border-primary/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed pr-10">
                                    <button @click.prevent="unlockedFields[key] = !unlockedFields[key]"
                                        class="absolute right-2 p-1 text-gray-400 hover:text-primary transition-colors flex items-center justify-center">
                                        <span class="material-symbols-outlined text-[18px]">
                                            {{ unlockedFields[key] ? 'check' : 'edit' }}
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </template>

                        <!-- === EDIT PROFILE MODE === -->
                        <template v-else-if="modalMode === 'edit-profile'">
                            <div class="grid grid-cols-2 gap-4">
                                <!-- Name -->
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full
                                        Name</label>
                                    <input v-model="formData.name" type="text"
                                        class="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:border-primary/50 transition-colors">
                                </div>
                                <!-- Email (Readonly) -->
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email
                                        Address</label>
                                    <input v-model="formData.email" type="email" disabled
                                        class="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2 text-gray-900 dark:text-white opacity-60 cursor-not-allowed">
                                    <p class="text-[10px] text-gray-500 mt-1">Email cannot be changed.</p>
                                </div>
                                <!-- DOB -->
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date
                                        of Birth</label>
                                    <input v-model="formData.dob" type="date"
                                        class="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:border-primary/50 transition-colors">
                                </div>
                                <!-- Mobile -->
                                <div>
                                    <label
                                        class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mobile
                                        Number</label>
                                    <input v-model="formData.mobile" @input="formatField('mobile')" type="tel"
                                        placeholder="+91 0000000000"
                                        class="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:border-primary/50 transition-colors">
                                </div>
                                <!-- Bank Config -->
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bank
                                        Account</label>
                                    <input v-model="formData.bankAccount" @input="formatField('bankAccount')"
                                        type="text"
                                        class="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:border-primary/50 transition-colors">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">IFSC
                                        Code</label>
                                    <input v-model="formData.ifscCode" @input="formatField('ifscCode')" type="text"
                                        class="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:border-primary/50 transition-colors">
                                </div>
                            </div>
                        </template>

                        <!-- === EDIT ACCESS MODE === -->
                        <template v-else>
                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full
                                        Name</label>
                                    <input :value="formData.name" type="text" disabled
                                        class="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2 text-gray-900 dark:text-white opacity-60 cursor-not-allowed">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email
                                        Address</label>
                                    <input :value="formData.email" type="email" disabled
                                        class="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2 text-gray-900 dark:text-white opacity-60 cursor-not-allowed">
                                </div>
                            </div>

                            <div class="h-px bg-gray-200 dark:bg-white/10 my-4"></div>

                            <!-- Editable Role & Hub -->
                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role
                                        Update</label>
                                    <div class="relative">
                                        <select v-model="formData.role"
                                            class="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:border-primary/50 transition-colors appearance-none">
                                            <option v-for="r in roles" :key="r" :value="r">{{ r }}</option>
                                        </select>
                                        <span
                                            class="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">arrow_drop_down</span>
                                    </div>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Hub
                                        Relocation</label>
                                    <div class="relative">
                                        <select v-model="formData.hubId"
                                            class="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:border-primary/50 transition-colors appearance-none">
                                            <option v-for="h in store.hubs" :key="h.id" :value="h.id">{{ h.name }}
                                            </option>
                                        </select>
                                        <span
                                            class="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">arrow_drop_down</span>
                                    </div>
                                </div>
                                <div class="col-span-2">
                                    <label
                                        class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                                    <div class="relative">
                                        <select v-model="formData.status"
                                            class="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:border-primary/50 transition-colors appearance-none">
                                            <option v-for="s in statuses" :key="s" :value="s">{{ s }}</option>
                                        </select>
                                        <span
                                            class="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">arrow_drop_down</span>
                                    </div>
                                </div>
                            </div>
                        </template>
                    </div>

                    <!-- Footer -->
                    <div
                        class="px-6 py-4 border-t border-gray-200 dark:border-white/5 flex justify-end gap-3 bg-gray-50 dark:bg-white/5">
                        <button @click="closeModal"
                            class="px-4 py-2 rounded-lg font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 dark:bg-transparent dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/5 transition-colors shadow-sm">
                            Cancel
                        </button>
                        <button @click="submitForm"
                            class="px-4 py-2 rounded-lg font-medium text-white bg-primary hover:bg-primary/90 transition-colors shadow-sm">
                            {{ modalMode === 'create' ? 'Add User' : 'Save Changes' }}
                        </button>
                    </div>
                </div>
            </div>
        </Teleport>

        <!-- Credentials Mini Modal -->
        <Teleport to="body">
            <div v-if="viewingUserCreds"
                class="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                @click.self="closeCreds">
                <div
                    class="bg-white dark:bg-card-dark w-full max-w-sm rounded-2xl shadow-2xl border border-gray-200 dark:border-white/10 overflow-hidden flex flex-col relative items-center p-6">
                    <button @click="closeCreds"
                        class="absolute top-4 right-4 text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors">
                        <span class="material-symbols-outlined">close</span>
                    </button>

                    <img :src="viewingUserCreds.avatar"
                        class="w-16 h-16 rounded-full border-2 border-gray-200 dark:border-white/10 shadow-sm mb-3">
                    <h3 class="text-lg font-bold text-gray-900 dark:text-white">{{ viewingUserCreds.name }}</h3>
                    <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">{{ viewingUserCreds.role }}</p>

                    <div
                        class="w-full bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-xl p-4 relative text-left">
                        <h4 class="text-xs font-bold text-primary uppercase tracking-wider mb-3">System Credentials</h4>
                        <button @click.prevent="isCredentialsVisible = !isCredentialsVisible"
                            class="absolute top-3 right-3 text-primary hover:text-primary/80 transition-colors">
                            <span class="material-symbols-outlined text-[20px]">
                                {{ isCredentialsVisible ? 'visibility_off' : 'visibility' }}
                            </span>
                        </button>

                        <div class="space-y-3">
                            <div>
                                <label
                                    class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Username</label>
                                <div
                                    class="text-sm font-mono text-gray-900 dark:text-white bg-white dark:bg-black/20 px-3 py-1.5 rounded border border-gray-200 dark:border-white/10">
                                    {{ isCredentialsVisible ? viewingUserCreds.username : '********' }}
                                </div>
                            </div>
                            <div>
                                <label
                                    class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Password</label>
                                <div
                                    class="text-sm font-mono text-gray-900 dark:text-white bg-white dark:bg-black/20 px-3 py-1.5 rounded border border-gray-200 dark:border-white/10">
                                    {{ isCredentialsVisible ? viewingUserCreds.password : '********' }}
                                </div>
                            </div>
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

const store = useLogisticStore()
const { filteredUsers } = storeToRefs(store)

const activeTab = ref('All Users')
const tabs = ['All Users', 'Managers', 'Dispatchers', 'Drivers']

const displayedUsers = computed(() => {
    let list = filteredUsers.value

    if (activeTab.value !== 'All Users') {
        list = list.filter(u => {
            if (activeTab.value === 'Managers') return u.role.includes('Manager')
            if (activeTab.value === 'Dispatchers') return u.role.includes('Dispatcher')
            if (activeTab.value === 'Drivers') return u.role.includes('Driver')
            return true
        })
    }

    return list
})

// --- Dropdown Management ---
import { onMounted, onUnmounted } from 'vue'

const activeDropdown = ref(null)

const toggleDropdown = (email) => {
    activeDropdown.value = activeDropdown.value === email ? null : email
}

const closeDropdowns = () => {
    activeDropdown.value = null
}

onMounted(() => {
    document.addEventListener('click', closeDropdowns)
})
onUnmounted(() => {
    document.removeEventListener('click', closeDropdowns)
})

// --- Modal Management ---
const isModalOpen = ref(false)
const modalMode = ref('create')
const isCredentialsVisible = ref(false)

const strictFields = {
    name: { label: 'Full Name', type: 'text', placeholder: 'e.g. John Doe' },
    dob: { label: 'Date of Birth', type: 'date', placeholder: '' },
    mobile: { label: 'Mobile Number', type: 'tel', placeholder: '+1 (555) 000-0000' },
    email: { label: 'Email Address', type: 'email', placeholder: 'john@cargocore.com' },
    aadharCard: { label: 'Aadhar / ID Number', type: 'text', placeholder: 'XXXX-XXXX-XXXX' },
    panCard: { label: 'PAN Number', type: 'text', placeholder: 'ABCDE1234F' },
    bankAccount: { label: 'Bank Account Number', type: 'text', placeholder: '000011112222' },
    ifscCode: { label: 'IFSC / Routing Code', type: 'text', placeholder: 'BANK0001234' }
}

const formData = ref({})
const unlockedFields = ref({})

const initEmptyForm = () => {
    formData.value = {
        role: 'Warehouse Manager',
        status: 'Active',
        hubId: store.hubs.length > 0 ? store.hubs[0].id : null
    }
    unlockedFields.value = {}
    Object.keys(strictFields).forEach(key => {
        formData.value[key] = ''
        unlockedFields.value[key] = false // All locked by default
    })
}

const formatField = (key) => {
    let val = formData.value[key]
    if (!val) return

    if (key === 'aadharCard') {
        // Strip non-digits
        val = val.replace(/\D/g, '').substring(0, 12)
        // Add hyphen every 4 digits
        val = val.replace(/(\d{4})(?=\d)/g, '$1-')
    } else if (key === 'mobile') {
        // Strip non-digits and non-plus
        let digits = val.replace(/[^\d+]/g, '')
        // Ensure it starts with +91 if length > 0 and no + is present
        if (digits.length > 0 && !digits.startsWith('+')) {
            digits = '+91 ' + digits
        }
        // If it starts with +, ensure space after 91
        if (digits.startsWith('+91') && digits.length > 3 && digits[3] !== ' ') {
            digits = '+91 ' + digits.substring(3)
        }
        val = digits.substring(0, 14) // +91 XXXXXXXXXX (14 chars)
    } else if (key === 'panCard') {
        // Uppercase, alphanumeric, max 10
        val = val.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().substring(0, 10)
    } else if (key === 'ifscCode') {
        // Uppercase, alphanumeric, max 11
        val = val.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().substring(0, 11)
    } else if (key === 'bankAccount') {
        // Only allow numbers, typical length ~9-18
        val = val.replace(/\D/g, '').substring(0, 18)
    }

    formData.value[key] = val
}

const roles = ['Warehouse Manager', 'Dispatcher', 'Driver']
const statuses = ['Active', 'Inactive']

// Credential View Modal
const viewingUserCreds = ref(null)

const openCreds = (user) => {
    viewingUserCreds.value = user
    isCredentialsVisible.value = false // reset
}

const closeCreds = () => {
    viewingUserCreds.value = null
}

const openModal = (mode, user = null) => {
    modalMode.value = mode
    isCredentialsVisible.value = false

    if (mode === 'edit' && user) {
        formData.value = { ...user } // copy data
    } else {
        initEmptyForm()
    }
    isModalOpen.value = true
}

const closeModal = () => {
    isModalOpen.value = false
}

const generateCredentials = (role) => {
    const prefix = role === 'Warehouse Manager' ? 'WM' : (role === 'Dispatcher' ? 'DSP' : 'USR')
    // Generate Random number for mock purposes e.g. WM-047
    const suffix = String(Math.floor(Math.random() * 999)).padStart(3, '0')
    const pass = Math.random().toString(36).slice(-8)
    return {
        username: `${prefix}-${suffix}`,
        password: pass
    }
}

const submitForm = () => {
    if (modalMode.value === 'create') {
        // Auto-generate credentials on save
        const creds = generateCredentials(formData.value.role)
        store.addUser({
            ...formData.value,
            username: creds.username,
            password: creds.password
        })
    } else {
        store.updateUser(formData.value.email, { ...formData.value })
    }
    closeModal()
}
</script>
