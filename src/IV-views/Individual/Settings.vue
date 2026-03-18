<template>
    <div class="space-y-6">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Settings</h2>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Notification Preferences -->
            <div class="glass-panel p-4 sm:p-6 rounded-xl">
                <h3 class="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <span class="material-symbols-outlined text-green-500">notifications</span>
                    Notification Preferences
                </h3>
                <div class="space-y-4">
                    <div v-for="pref in notificationPrefs" :key="pref.key" class="flex items-center justify-between">
                        <div>
                            <div class="text-sm font-medium text-gray-900 dark:text-white">{{ pref.label }}</div>
                            <div class="text-xs text-gray-500 dark:text-gray-400">{{ pref.desc }}</div>
                        </div>
                        <button @click="pref.enabled = !pref.enabled"
                            class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
                            :class="pref.enabled ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'">
                            <span
                                class="inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                                :class="pref.enabled ? 'translate-x-5' : 'translate-x-0'"></span>
                        </button>
                    </div>
                </div>
            </div>

            <!-- Language Selection -->
            <div class="glass-panel p-4 sm:p-6 rounded-xl">
                <h3 class="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <span class="material-symbols-outlined text-blue-500">translate</span>
                    Language & Region
                </h3>
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm text-gray-600 dark:text-gray-400 mb-1.5 font-medium">Preferred
                            Language</label>
                        <select v-model="selectedLanguage"
                            class="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500/50 outline-none">
                            <option v-for="lang in languages" :key="lang.code" :value="lang.code" class="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">{{ lang.flag }} {{
                                lang.name }}</option>
                        </select>
                    </div>
                    <div>
                        <label
                            class="block text-sm text-gray-600 dark:text-gray-400 mb-1.5 font-medium">Currency</label>
                        <select v-model="selectedCurrency"
                            class="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500/50 outline-none">
                            <option value="INR" class="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">₹ Indian Rupee (INR)</option>
                            <option value="USD" class="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">$ US Dollar (USD)</option>
                            <option value="EUR" class="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">€ Euro (EUR)</option>
                        </select>
                    </div>
                </div>
            </div>

            <!-- Payment Defaults -->
            <div class="glass-panel p-4 sm:p-6 rounded-xl">
                <h3 class="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <span class="material-symbols-outlined text-amber-500">credit_card</span>
                    Payment Defaults
                </h3>
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm text-gray-600 dark:text-gray-400 mb-1.5 font-medium">Default Payment
                            Method</label>
                        <select v-model="defaultPayment"
                            class="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500/50 outline-none">
                            <option value="Full Payment" class="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">Full Payment</option>
                            <option value="Partial" class="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">Partial Payment (50% advance)</option>
                            <option value="COD" class="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">Cash on Delivery</option>
                        </select>
                    </div>
                    <div
                        class="p-3 bg-gray-50 dark:bg-white/5 rounded-lg border border-gray-200 dark:border-white/5 flex items-center gap-3">
                        <span class="material-symbols-outlined text-green-500">security</span>
                        <div>
                            <div class="text-sm font-medium text-gray-900 dark:text-white">Secure Payments</div>
                            <div class="text-xs text-gray-500 dark:text-gray-400">All transactions are encrypted and
                                secure.</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Privacy & Data -->
            <div class="glass-panel p-4 sm:p-6 rounded-xl">
                <h3 class="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <span class="material-symbols-outlined text-purple-500">shield</span>
                    Privacy & Data
                </h3>
                <div class="space-y-4">
                    <div v-for="pref in privacyPrefs" :key="pref.key" class="flex items-center justify-between">
                        <div>
                            <div class="text-sm font-medium text-gray-900 dark:text-white">{{ pref.label }}</div>
                            <div class="text-xs text-gray-500 dark:text-gray-400">{{ pref.desc }}</div>
                        </div>
                        <button @click="pref.enabled = !pref.enabled"
                            class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out"
                            :class="pref.enabled ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'">
                            <span
                                class="inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                                :class="pref.enabled ? 'translate-x-5' : 'translate-x-0'"></span>
                        </button>
                    </div>
                    <button
                        class="w-full py-2 bg-red-500/10 text-red-600 dark:text-red-400 rounded-lg text-sm font-bold hover:bg-red-500/20 transition-colors">
                        Delete Account
                    </button>
                </div>
            </div>
        </div>

        <!-- Save Button -->
        <div class="flex justify-end">
            <button @click="saveSettings"
                class="px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-colors text-sm shadow-sm">
                Save Settings
            </button>
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
import { ref, reactive, onMounted } from 'vue'
import { useIndividualStore } from '@/stores/individualStore'

const store = useIndividualStore()

const selectedLanguage = ref('en')
const selectedCurrency = ref('INR')
const defaultPayment = ref('Full Payment')

const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'hi', name: 'हिंदी (Hindi)', flag: '🇮🇳' },
    { code: 'ta', name: 'தமிழ் (Tamil)', flag: '🇮🇳' },
    { code: 'te', name: 'తెలుగు (Telugu)', flag: '🇮🇳' },
    { code: 'bn', name: 'বাংলা (Bengali)', flag: '🇮🇳' },
    { code: 'mr', name: 'मराठी (Marathi)', flag: '🇮🇳' },
]

const notificationPrefs = reactive([
    { key: 'push', label: 'Push Notifications', desc: 'Get alerts on your device', enabled: true },
    { key: 'sms', label: 'SMS Alerts', desc: 'Receive text message updates', enabled: true },
    { key: 'email', label: 'Email Updates', desc: 'Order confirmations and receipts', enabled: true },
    { key: 'geofence', label: 'Geofence Alerts', desc: 'When driver is near your location', enabled: true },
    { key: 'promo', label: 'Promotional Offers', desc: 'Discounts and special deals', enabled: false },
])

const privacyPrefs = reactive([
    { key: 'location', label: 'Location Sharing', desc: 'Share location for accurate pickup', enabled: true },
    { key: 'analytics', label: 'Usage Analytics', desc: 'Help us improve with anonymized data', enabled: true },
    { key: 'marketing', label: 'Marketing Emails', desc: 'Receive marketing communications', enabled: false },
])

const toast = reactive({ show: false, message: '' })
function showToast(msg) { toast.show = true; toast.message = msg; setTimeout(() => { toast.show = false }, 3000) }

async function saveSettings() {
    const result = await store.saveSettingsRemote({
        language: selectedLanguage.value,
        currency: selectedCurrency.value,
        default_payment: defaultPayment.value,
        notification_prefs: Object.fromEntries(notificationPrefs.map((pref) => [pref.key, pref.enabled])),
        privacy_prefs: Object.fromEntries(privacyPrefs.map((pref) => [pref.key, pref.enabled])),
    })
    showToast(result.success ? 'Settings saved successfully!' : (result.message || 'Failed to save settings.'))
}

onMounted(async () => {
    const result = await store.fetchSettings()
    if (!result.success || !result.data) return

    selectedLanguage.value = result.data.language || 'en'
    selectedCurrency.value = result.data.currency || 'INR'
    defaultPayment.value = result.data.default_payment || 'Full Payment'

    for (const pref of notificationPrefs) {
        if (pref.key in (result.data.notification_prefs || {})) {
            pref.enabled = !!result.data.notification_prefs[pref.key]
        }
    }
    for (const pref of privacyPrefs) {
        if (pref.key in (result.data.privacy_prefs || {})) {
            pref.enabled = !!result.data.privacy_prefs[pref.key]
        }
    }
})
</script>
