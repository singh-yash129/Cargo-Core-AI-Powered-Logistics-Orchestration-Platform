<template>
    <div class="space-y-6">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">My Profile</h2>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Profile Card -->
            <div class="glass-panel p-4 sm:p-6 rounded-xl text-center">
                <div
                    class="w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-3xl font-bold text-white mx-auto mb-4 ring-4 ring-green-500/20">
                    {{ store.userInitials }}
                </div>
                <h3 class="text-xl font-bold text-gray-900 dark:text-white">{{ store.user.name }}</h3>
                <p class="text-gray-500 dark:text-gray-400 text-sm">Individual User</p>
                <div
                    class="mt-2 text-xs bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400 px-3 py-1 rounded-full inline-block font-bold">
                    Active Account</div>

                <div class="mt-6 grid grid-cols-2 gap-3">
                    <div class="p-3 bg-gray-50 dark:bg-white/5 rounded-lg">
                        <div class="text-xl font-bold text-green-600 dark:text-green-400">{{ store.orders.length }}
                        </div>
                        <div class="text-xs text-gray-500">Total Moves</div>
                    </div>
                    <div class="p-3 bg-gray-50 dark:bg-white/5 rounded-lg">
                        <div class="text-xl font-bold text-blue-600 dark:text-blue-400">₹{{
                            store.totalSpent.toLocaleString() }}</div>
                        <div class="text-xs text-gray-500">Total Spent</div>
                    </div>
                </div>
            </div>

            <!-- Edit Profile Form -->
            <div class="lg:col-span-2 space-y-6">
                <div class="glass-panel p-4 sm:p-6 rounded-xl">
                    <h3 class="font-bold text-gray-900 dark:text-white mb-4">Personal Information</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm text-gray-600 dark:text-gray-400 mb-1.5 font-medium">Full
                                Name</label>
                            <input v-model="form.name" type="text"
                                class="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500/50 focus:border-green-500 outline-none transition-all" />
                        </div>
                        <div>
                            <label class="block text-sm text-gray-600 dark:text-gray-400 mb-1.5 font-medium">Email
                                Address</label>
                            <input v-model="form.email" type="email"
                                class="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500/50 focus:border-green-500 outline-none transition-all" />
                        </div>
                        <div>
                            <label class="block text-sm text-gray-600 dark:text-gray-400 mb-1.5 font-medium">Phone
                                Number</label>
                            <input v-model="form.phone" type="tel"
                                class="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500/50 focus:border-green-500 outline-none transition-all" />
                        </div>
                        <div>
                            <label class="block text-sm text-gray-600 dark:text-gray-400 mb-1.5 font-medium">Primary
                                Address</label>
                            <input v-model="form.address" type="text"
                                class="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500/50 focus:border-green-500 outline-none transition-all" />
                        </div>
                    </div>
                    <button @click="saveProfile"
                        class="mt-4 px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-colors text-sm">
                        Save Changes
                    </button>
                </div>

                <!-- Address Book -->
                <div class="glass-panel p-4 sm:p-6 rounded-xl">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="font-bold text-gray-900 dark:text-white">Saved Addresses</h3>
                        <button @click="addAddress"
                            class="text-green-600 dark:text-green-400 text-sm font-bold hover:underline flex items-center gap-1">
                            <span class="material-symbols-outlined text-sm">add</span> Add New
                        </button>
                    </div>
                    <div class="space-y-3">
                        <div v-for="addr in addresses" :key="addr.id"
                            class="flex items-start gap-3 p-3 bg-gray-50 dark:bg-white/5 rounded-lg border border-gray-200 dark:border-white/5">
                            <span class="material-symbols-outlined text-green-500 mt-0.5">{{ addr.icon }}</span>
                            <div class="flex-1 min-w-0">
                                <div class="font-medium text-sm text-gray-900 dark:text-white">{{ addr.label }}</div>
                                <div class="text-xs text-gray-500 dark:text-gray-400 truncate">{{ addr.address }}</div>
                            </div>
                            <button class="text-gray-400 hover:text-red-500 transition-colors">
                                <span class="material-symbols-outlined text-sm">delete</span>
                            </button>
                        </div>
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
                    class="fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-5 py-3 rounded-xl shadow-xl bg-green-600 text-white border border-green-500 max-w-sm">
                    <span class="material-symbols-outlined">check_circle</span>
                    <span class="text-sm font-medium">{{ toast.message }}</span>
                </div>
            </transition>
        </Teleport>
    </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useIndividualStore } from '@/stores/individualStore'

const store = useIndividualStore()

const form = reactive({
    name: store.user.name,
    email: store.user.email,
    phone: store.user.phone,
    address: store.user.address,
})

const addresses = ref([
    { id: 1, label: 'Home', icon: 'home', address: '42, Green Park, New Delhi - 110016' },
    { id: 2, label: 'Office', icon: 'business', address: '15, Sector 62, Noida - 201301' },
    { id: 3, label: 'Parent\'s House', icon: 'family_restroom', address: '8, DLF Phase 3, Gurgaon - 122002' },
])

function saveProfile() {
    store.updateProfile({ name: form.name, email: form.email, phone: form.phone, address: form.address })
    showToast('Profile updated!')
}

function addAddress() {
    addresses.value.push({ id: Date.now(), label: 'New Address', icon: 'location_on', address: 'Enter address...' })
    showToast('Address added!')
}

const toast = reactive({ show: false, message: '' })
function showToast(msg) { toast.show = true; toast.message = msg; setTimeout(() => { toast.show = false }, 3000) }
</script>
