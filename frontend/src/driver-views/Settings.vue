<template>
    <div class="bg-background-dark text-white min-h-screen flex flex-col">
        <!-- Header -->
        <div class="p-6 pb-4">
            <div class="flex items-center justify-between mb-6">
                <button @click="$router.back()" class="text-gray-400 hover:text-white">
                    <span class="material-icons">arrow_back</span>
                </button>
                <h1 class="text-2xl font-bold">Settings</h1>
                <div class="w-10"></div>
            </div>
        </div>

        <!-- Profile Section -->
        <div class="px-6 mb-8">
            <div class="glass-panel rounded-2xl p-6">
                <div class="flex items-center gap-4 mb-4">
                    <div class="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                        <span class="material-icons text-primary text-3xl">person</span>
                    </div>
                    <div class="flex-1">
                        <h2 class="text-xl font-bold text-white">{{ driverName }}</h2>
                        <p class="text-gray-400 text-sm">ID: {{ driverId }}</p>
                    </div>
                </div>

                <div class="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
                    <div>
                        <p class="text-gray-400 text-xs mb-1">Rating</p>
                        <p class="text-primary font-bold flex items-center gap-1">
                            <span class="material-icons text-sm">star</span>
                            {{ rating }}
                        </p>
                    </div>
                    <div>
                        <p class="text-gray-400 text-xs mb-1">Deliveries</p>
                        <p class="text-white font-bold">{{ totalDeliveries }}</p>
                    </div>
                    <div>
                        <p class="text-gray-400 text-xs mb-1">On-Time</p>
                        <p class="text-primary font-bold">{{ onTimePercent }}%</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Settings List -->
        <div class="flex-1 px-6 pb-6">
            <!-- Account Section -->
            <div class="mb-6">
                <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Account</h3>
                <div class="glass-panel rounded-xl overflow-hidden divide-y divide-white/5">
                    <button v-for="item in accountItems" :key="item.label" @click="item.action"
                        class="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors text-left">
                        <div class="flex items-center gap-3">
                            <span class="material-icons text-gray-400">{{ item.icon }}</span>
                            <span class="text-white font-medium">{{ item.label }}</span>
                        </div>
                        <span class="material-icons text-gray-600">chevron_right</span>
                    </button>
                </div>
            </div>

            <!-- Preferences Section -->
            <div class="mb-6">
                <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Preferences</h3>
                <div class="glass-panel rounded-xl overflow-hidden divide-y divide-white/5">
                    <!-- Language -->
                    <div class="flex items-center justify-between p-4">
                        <div class="flex items-center gap-3">
                            <span class="material-icons text-gray-400">language</span>
                            <span class="text-white font-medium">Language</span>
                        </div>
                        <select v-model="language"
                            class="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white text-sm outline-none focus:border-primary">
                            <option value="en">English</option>
                            <option value="es">Español</option>
                            <option value="fr">Français</option>
                        </select>
                    </div>

                    <!-- Notifications -->
                    <div class="flex items-center justify-between p-4">
                        <div class="flex items-center gap-3">
                            <span class="material-icons text-gray-400">notifications</span>
                            <span class="text-white font-medium">Notifications</span>
                        </div>
                        <button @click="notifications = !notifications"
                            :class="['w-12 h-6 rounded-full transition-colors', notifications ? 'bg-primary' : 'bg-gray-600']">
                            <div
                                :class="['w-5 h-5 bg-white rounded-full shadow transition-transform', notifications ? 'translate-x-6' : 'translate-x-0.5']">
                            </div>
                        </button>
                    </div>

                    <!-- Dark Mode (Always On) -->
                    <div class="flex items-center justify-between p-4 opacity-50">
                        <div class="flex items-center gap-3">
                            <span class="material-icons text-gray-400">dark_mode</span>
                            <span class="text-white font-medium">Dark Mode</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <span class="text-xs text-gray-500">Default</span>
                            <div class="w-12 h-6 rounded-full bg-primary">
                                <div class="w-5 h-5 bg-white rounded-full shadow translate-x-6"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Support Section -->
            <div class="mb-6">
                <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Support</h3>
                <div class="glass-panel rounded-xl overflow-hidden divide-y divide-white/5">
                    <button v-for="item in supportItems" :key="item.label" @click="item.action"
                        class="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors text-left">
                        <div class="flex items-center gap-3">
                            <span class="material-icons text-gray-400">{{ item.icon }}</span>
                            <span class="text-white font-medium">{{ item.label }}</span>
                        </div>
                        <span class="material-icons text-gray-600">chevron_right</span>
                    </button>
                </div>
            </div>

            <!-- Security -->
            <div class="mb-8">
                <h3 class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 ml-2">Security & Data</h3>

                <div class="space-y-3">
                    <div class="bg-surface-dark border border-white/5 p-4 rounded-xl flex items-center justify-between">
                        <div class="flex items-center gap-3">
                            <span class="material-icons text-gray-400">fingerprint</span>
                            <div>
                                <p class="font-medium">Biometric Login</p>
                                <p class="text-xs text-gray-500">Enable FaceID / TouchID</p>
                            </div>
                        </div>
                        <div @click="toggleSetting('biometric')"
                            class="w-12 h-6 rounded-full relative transition-colors cursor-pointer"
                            :class="settings.biometric ? 'bg-primary' : 'bg-gray-700'">
                            <div class="absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-md"
                                :class="settings.biometric ? 'left-7' : 'left-1'"></div>
                        </div>
                    </div>

                    <button
                        class="w-full bg-surface-dark border border-white/5 p-4 rounded-xl flex items-center justify-between active:scale-[0.98] transition-all">
                        <div class="flex items-center gap-3">
                            <span class="material-icons text-gray-400">download</span>
                            <div class="text-left">
                                <p class="font-medium">Export Shift Data</p>
                                <p class="text-xs text-gray-500">Download logs as CSV</p>
                            </div>
                        </div>
                        <span class="material-icons text-gray-500">chevron_right</span>
                    </button>
                </div>
            </div>

            <!-- App Info -->
            <div class="text-center mb-6">
                <p class="text-gray-500 text-sm">Cargo-Core Driver App</p>
                <p class="text-gray-600 text-xs">Version 1.0.0</p>
            </div>

            <!-- Logout -->
            <button @click="logout"
                class="w-full bg-red-500/10 border border-red-500/30 text-red-500 hover:bg-red-500/20 py-4 rounded-xl font-bold transition-colors flex items-center justify-center gap-2">
                <span class="material-icons">logout</span>
                <span>Logout</span>
            </button>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useDriverStore } from '../stores/driverStore'

const router = useRouter()
const driverStore = useDriverStore()

const driverName = ref(driverStore.driver?.name || 'John Doe')
const driverId = ref(driverStore.driver?.driverId || 'DRV-2891')
const rating = ref('4.9')
const totalDeliveries = ref('1,247')
const onTimePercent = ref('96')

const language = ref('en')
const settings = ref({
    notifications: true,
    offlineMode: false,
    biometric: true
})
const accountItems = [
    { icon: 'person', label: 'Personal Information', action: () => console.log('Personal info') },
    { icon: 'lock', label: 'Privacy & Security', action: () => console.log('Privacy') },
    { icon: 'description', label: 'Documents', action: () => console.log('Documents') }
]

const supportItems = [
    { icon: 'help', label: 'Help Center', action: () => router.push('/crisis') },
    { icon: 'feedback', label: 'Send Feedback', action: () => router.push('/damage-report') }, // Reusing damage report for feedback
    { icon: 'info', label: 'About', action: () => console.log('About') }
]

const logout = () => {
    if (confirm('Are you sure you want to logout?')) {
        driverStore.logout()
        router.push('/login')
    }
}
</script>
