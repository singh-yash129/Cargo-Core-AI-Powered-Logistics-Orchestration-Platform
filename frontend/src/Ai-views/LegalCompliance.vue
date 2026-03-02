<template>
    <div class="max-w-4xl mx-auto space-y-6">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Legal & Compliance</h2>
                <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Platform rules, terms, and data policies</p>
            </div>
            <button
                class="text-xs px-3 py-1.5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors flex items-center gap-1">
                <span class="material-symbols-outlined text-sm">download</span> Export PDF
            </button>
        </div>

        <!-- Tabs -->
        <div class="flex gap-2 border-b border-gray-200 dark:border-white/10 pb-4">
            <button v-for="tab in tabs" :key="tab" @click="activeTab = tab"
                class="px-4 py-2 rounded-lg text-sm font-bold transition-colors"
                :class="activeTab === tab ? 'bg-purple-600 text-white' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5'">
                {{ tab }}
            </button>
        </div>

        <!-- Content Area -->
        <div
            class="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 p-8 rounded-xl min-h-[500px] shadow-sm">
            <!-- Platform Rules -->
            <div v-if="activeTab === 'Platform Rules'" class="space-y-6 animate-fade-in">
                <h3 class="text-xl font-bold text-gray-900 dark:text-white">Platform Rules & Guidelines</h3>
                <div class="space-y-4">
                    <div v-for="rule in platformRules" :key="rule.id"
                        class="p-4 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/5 cursor-pointer hover:border-purple-300 dark:hover:border-purple-500/30 transition-colors"
                        @click="rule.expanded = !rule.expanded">
                        <div class="flex items-center justify-between">
                            <h4 class="font-bold text-gray-900 dark:text-white">{{ rule.title }}</h4>
                            <span class="material-symbols-outlined text-gray-400 transition-transform"
                                :class="rule.expanded ? 'rotate-180' : ''">expand_more</span>
                        </div>
                        <div v-if="rule.expanded" class="mt-3 text-sm text-gray-600 dark:text-gray-300">
                            {{ rule.content }}
                        </div>
                    </div>
                </div>
            </div>

            <!-- Terms of Service -->
            <div v-if="activeTab === 'Terms of Service'" class="space-y-6 animate-fade-in">
                <div class="flex justify-between items-center">
                    <h3 class="text-xl font-bold text-gray-900 dark:text-white">Terms of Service</h3>
                    <span class="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold">Last Updated: Oct
                        2024</span>
                </div>
                <div class="space-y-4 text-gray-600 dark:text-gray-300 h-96 overflow-y-auto pr-4 custom-scrollbar">
                    <p><strong class="text-gray-900 dark:text-white">1. Acceptance of Terms:</strong> By accessing or
                        using the Cargo-Core Logistics platform, you agree to be bound by these Terms.</p>
                    <p><strong class="text-gray-900 dark:text-white">2. User Accounts:</strong> You are responsible for
                        maintaining the confidentiality of your account password.</p>
                    <p><strong class="text-gray-900 dark:text-white">3. Service Modifications:</strong> We reserve the
                        right to modify or discontinue the service at any time.</p>
                    <p><strong class="text-gray-900 dark:text-white">4. Logistics Liability:</strong> Cargo-Core is not
                        liable for damages caused by third-party carriers beyond the insured value.</p>
                    <p><strong class="text-gray-900 dark:text-white">5. Dispute Resolution:</strong> Any disputes shall
                        be resolved through binding arbitration.</p>
                    <p><strong class="text-gray-900 dark:text-white">6. Data Usage:</strong> We collect location data to
                        enable tracking features. This data is processed per our Privacy Policy.</p>
                </div>
            </div>

            <!-- Privacy Policy -->
            <div v-if="activeTab === 'Privacy Policy'" class="space-y-6 animate-fade-in">
                <h3 class="text-xl font-bold text-gray-900 dark:text-white">Privacy & Data Policy</h3>
                <div class="space-y-4 text-gray-600 dark:text-gray-300">
                    <p><strong class="text-gray-900 dark:text-white">1. Data Collection:</strong> We collect name,
                        phone, email, and location data for service delivery.</p>
                    <p><strong class="text-gray-900 dark:text-white">2. Third-Party Sharing:</strong> We share data with
                        insurance partners for claims processing only.</p>
                    <p><strong class="text-gray-900 dark:text-white">3. User Rights:</strong> You have the right to
                        request deletion of your data at any time.</p>
                    <p><strong class="text-gray-900 dark:text-white">4. Cookie Policy:</strong> We use essential cookies
                        only. Marketing cookies require consent.</p>
                    <p><strong class="text-gray-900 dark:text-white">5. GDPR Compliance:</strong> All EU data processing
                        follows GDPR guidelines.</p>
                </div>
                <div
                    class="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-500/20 rounded-xl">
                    <div class="font-bold text-blue-700 dark:text-blue-300 mb-1">Data Deletion Request</div>
                    <p class="text-sm text-blue-600 dark:text-blue-400 mb-3">Submit a request to delete all your
                        personal data from our systems.</p>
                    <button @click="showDataRequest = true"
                        class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-sm transition-colors">
                        Submit Request
                    </button>
                </div>
            </div>
        </div>

        <!-- Data Request Modal -->
        <Teleport to="body">
            <div v-if="showDataRequest"
                class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                @click.self="showDataRequest = false">
                <div
                    class="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md shadow-2xl border border-gray-100 dark:border-white/10 overflow-hidden">
                    <div class="p-6 border-b border-gray-100 dark:border-white/5">
                        <h3 class="text-xl font-bold text-gray-900 dark:text-white">Data Deletion Request</h3>
                    </div>
                    <div class="p-6 space-y-4">
                        <div>
                            <label class="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase">User
                                ID / Email</label>
                            <input v-model="dataRequestEmail" type="email"
                                class="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white outline-none focus:border-blue-500 transition-colors"
                                placeholder="user@email.com" />
                        </div>
                        <div>
                            <label
                                class="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase">Reason</label>
                            <textarea v-model="dataRequestReason" rows="3"
                                class="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white outline-none focus:border-blue-500 transition-colors resize-none"
                                placeholder="Reason for deletion request..."></textarea>
                        </div>
                    </div>
                    <div class="p-6 border-t border-gray-100 dark:border-white/5 flex gap-3">
                        <button @click="showDataRequest = false"
                            class="flex-1 py-2.5 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-white font-bold rounded-xl transition-colors">
                            Cancel
                        </button>
                        <button @click="submitDataRequest" :disabled="!dataRequestEmail"
                            class="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl transition-colors">
                            Submit
                        </button>
                    </div>
                </div>
            </div>
        </Teleport>
    </div>
</template>

<script setup>
import { ref } from 'vue'

const tabs = ['Platform Rules', 'Terms of Service', 'Privacy Policy']
const activeTab = ref('Platform Rules')
const showDataRequest = ref(false)
const dataRequestEmail = ref('')
const dataRequestReason = ref('')

const platformRules = ref([
    { id: 1, title: '1. Driver Conduct', content: 'All drivers must maintain a professional demeanor. Harassment or rude behavior towards customers will result in immediate suspension.', expanded: false },
    { id: 2, title: '2. Vehicle Safety', content: 'Vehicles must undergo weekly inspections. Failure to report damages can lead to liability claims being denied.', expanded: false },
    { id: 3, title: '3. Cancellation Policy', content: 'Drivers cannot cancel a job within 1 hour of pickup without valid proof of emergency.', expanded: false },
    { id: 4, title: '4. Payment Processing', content: 'All payments must go through the platform. Accepting cash tips is allowed, but soliciting extra fees is prohibited.', expanded: false },
    { id: 5, title: '5. Substance Policy', content: 'Zero tolerance for drug or alcohol use while on duty. Violations lead to immediate termination.', expanded: false },
])

function submitDataRequest() {
    dataRequestEmail.value = ''
    dataRequestReason.value = ''
    showDataRequest.value = false
}
</script>

<style scoped>
.animate-fade-in {
    animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(5px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>
