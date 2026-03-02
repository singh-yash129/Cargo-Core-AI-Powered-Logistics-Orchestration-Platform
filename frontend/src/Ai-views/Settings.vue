<template>
    <div class="max-w-6xl mx-auto space-y-8">
        <!-- Header -->
        <div
            class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 dark:border-white/10 pb-6">
            <div>
                <h2 class="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                    <span class="material-symbols-outlined text-purple-600 dark:text-purple-400 text-4xl">tune</span>
                    System Configuration
                </h2>
                <p class="text-gray-500 dark:text-gray-400 mt-2">Manage AI behaviors, operational thresholds, and core
                    instruction sets.</p>
            </div>
            <div class="flex gap-3 w-full sm:w-auto">
                <button @click="resetSettings"
                    class="w-full sm:w-auto px-5 py-2.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 font-bold rounded-xl transition-colors shadow-sm">
                    Reset Defaults
                </button>
                <button @click="saveSettings"
                    class="w-full sm:w-auto px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-purple-500/30 flex items-center justify-center gap-2">
                    <span class="material-symbols-outlined text-[20px]">save</span> Save Changes
                </button>
            </div>
        </div>

        <!-- Main Layout (Sidebar + Content) -->
        <div class="flex flex-col lg:flex-row gap-8">

            <!-- Sidebar Navigation -->
            <div class="w-full lg:w-64 shrink-0">
                <nav class="sticky top-6 flex flex-col gap-1">
                    <button v-for="tab in configTabs" :key="tab.id" @click="activeTab = tab.id"
                        class="px-4 py-3 text-left rounded-xl text-sm font-bold transition-all flex items-center gap-3"
                        :class="activeTab === tab.id
                            ? 'bg-purple-600 text-white shadow-md'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'">
                        <span class="material-symbols-outlined text-[20px]"
                            :class="activeTab === tab.id ? 'text-white' : 'text-gray-400'">{{ tab.icon }}</span>
                        {{ tab.label }}
                    </button>
                </nav>
            </div>

            <!-- Configuration Panels -->
            <div
                class="flex-1 bg-white dark:bg-black/20 border border-gray-100 dark:border-white/5 rounded-2xl shadow-sm overflow-hidden p-6 md:p-8 min-h-[600px]">

                <!-- 1. General AI Behavior -->
                <div v-show="activeTab === 'behavior'" class="space-y-8 animate-fade-in">
                    <div>
                        <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-1">Global AI Behavior</h3>
                        <p class="text-sm text-gray-500 dark:text-gray-400">Control how the autonomous agents interact
                            and make decisions.</p>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div
                            class="bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 p-5 rounded-xl">
                            <label
                                class="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">Default
                                Personality Tone</label>
                            <select v-model="settings.tone"
                                class="w-full bg-white dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-lg px-4 py-3 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-shadow shadow-sm font-medium">
                                <option>Friendly & Empathetic</option>
                                <option>Professional & Formal</option>
                                <option>Direct & Concise</option>
                                <option>Playful & Casual</option>
                            </select>
                            <p class="text-[11px] text-gray-500 mt-2">Determines the conversational style used in
                                auto-replies.</p>
                        </div>

                        <div
                            class="bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 p-5 rounded-xl">
                            <label
                                class="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">Language
                                Support</label>
                            <select v-model="settings.languageModal"
                                class="w-full bg-white dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-lg px-4 py-3 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-shadow shadow-sm font-medium">
                                <option>Auto-Detect (Multilingual)</option>
                                <option>English Only (Strict)</option>
                                <option>English + Spanish</option>
                            </select>
                            <p class="text-[11px] text-gray-500 mt-2">Lock the model to specific languages to reduce
                                hallucination risk.</p>
                        </div>
                    </div>

                    <div class="space-y-4">
                        <div v-for="toggle in behaviorToggles" :key="toggle.key"
                            class="flex items-center justify-between p-4 bg-white dark:bg-transparent border border-gray-100 dark:border-white/5 rounded-xl hover:border-purple-200 dark:hover:border-purple-500/30 transition-colors">
                            <div class="flex items-center gap-4">
                                <div class="w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-inner"
                                    :class="toggle.bgColor">
                                    <span class="material-symbols-outlined text-[20px]" :class="toggle.iconColor">{{
                                        toggle.icon }}</span>
                                </div>
                                <div>
                                    <div class="font-bold text-gray-900 dark:text-white text-sm">{{ toggle.label }}
                                    </div>
                                    <div class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{{ toggle.desc }}</div>
                                </div>
                            </div>
                            <!-- Switch -->
                            <button @click="toggle.enabled = !toggle.enabled"
                                class="w-12 h-6 rounded-full relative transition-colors duration-300 shrink-0 focus:outline-none"
                                :class="toggle.enabled ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-600'">
                                <div class="absolute top-1 w-4 h-4 bg-white rounded-full shadow-md transition-transform duration-300"
                                    :class="toggle.enabled ? 'translate-x-7' : 'translate-x-1'"></div>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- 2. Thresholds & Limits -->
                <div v-show="activeTab === 'thresholds'" class="space-y-8 animate-fade-in">
                    <div>
                        <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-1">Operational Thresholds</h3>
                        <p class="text-sm text-gray-500 dark:text-gray-400">Set boundaries for autonomous actions to
                            balance speed and risk.</p>
                    </div>

                    <div class="space-y-8">

                        <!-- Slider 1 -->
                        <div
                            class="bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 p-6 rounded-xl">
                            <div class="flex justify-between items-end mb-4">
                                <div>
                                    <h4 class="font-bold text-gray-900 dark:text-white">Sentiment Escalation Trigger
                                    </h4>
                                    <p class="text-xs text-gray-500 mt-1">Escalate to a human agent when customer anger
                                        exceeds this level.</p>
                                </div>
                                <div class="text-right">
                                    <span class="text-2xl font-bold font-mono"
                                        :class="settings.sentimentThreshold > 70 ? 'text-red-500' : 'text-orange-500'">{{
                                            settings.sentimentThreshold }}%</span>
                                    <span class="block text-[10px] uppercase font-bold text-gray-400">Risk Score</span>
                                </div>
                            </div>
                            <input type="range" v-model="settings.sentimentThreshold"
                                class="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-red-500 hover:accent-red-600 transition-all"
                                min="0" max="100">
                            <div class="flex justify-between text-[10px] font-bold text-gray-400 uppercase mt-2">
                                <span>Conservative (0%)</span>
                                <span>Aggressive (100%)</span>
                            </div>
                        </div>

                        <!-- Slider 2 -->
                        <div
                            class="bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 p-6 rounded-xl">
                            <div class="flex justify-between items-end mb-4">
                                <div>
                                    <h4 class="font-bold text-gray-900 dark:text-white">Auto-Refund Financial Limit</h4>
                                    <p class="text-xs text-gray-500 mt-1">Maximum dollar amount the AI can refund
                                        without human supervisor approval.</p>
                                </div>
                                <div class="text-right">
                                    <span class="text-2xl font-bold font-mono text-green-600 dark:text-green-400">${{
                                        settings.refundLimit }}</span>
                                    <span class="block text-[10px] uppercase font-bold text-gray-400">Per
                                        Transaction</span>
                                </div>
                            </div>
                            <input type="range" v-model="settings.refundLimit"
                                class="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-500 hover:accent-green-600 transition-all"
                                min="0" max="500" step="10">
                            <div class="flex justify-between text-[10px] font-bold text-gray-400 uppercase mt-2">
                                <span>$0 (Manual Only)</span>
                                <span>$500 Limit</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 3. Core Prompts -->
                <div v-show="activeTab === 'prompts'" class="space-y-6 animate-fade-in flex flex-col h-full">
                    <div>
                        <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-1">Core System Prompt</h3>
                        <p class="text-sm text-gray-500 dark:text-gray-400">The foundational instructions injected into
                            the AI prior to every interaction.</p>
                    </div>

                    <div class="flex-1 flex flex-col mt-4">
                        <div
                            class="bg-gray-800 rounded-t-xl px-4 py-2 border border-gray-700 flex justify-between items-center shrink-0">
                            <div class="flex items-center gap-2">
                                <span class="w-3 h-3 rounded-full bg-red-500"></span>
                                <span class="w-3 h-3 rounded-full bg-yellow-500"></span>
                                <span class="w-3 h-3 rounded-full bg-green-500"></span>
                                <span class="ml-2 text-xs text-gray-400 font-mono">system_prompt.txt</span>
                            </div>
                            <button class="text-gray-400 hover:text-white transition-colors" title="Copy to clipboard">
                                <span class="material-symbols-outlined text-[16px]">content_copy</span>
                            </button>
                        </div>
                        <textarea v-model="settings.systemPrompt"
                            class="flex-1 w-full bg-gray-900 border-x border-b border-gray-700 rounded-b-xl p-6 text-sm text-green-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono resize-none transition-shadow shadow-inner leading-relaxed min-h-[300px]"
                            placeholder="Enter core system instructions here..."></textarea>
                    </div>

                    <div class="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 rounded-r-lg">
                        <h4 class="text-blue-800 dark:text-blue-300 font-bold text-sm mb-1 flex items-center gap-2">
                            <span class="material-symbols-outlined text-[18px]">info</span> Context Window Injection
                        </h4>
                        <p class="text-xs text-blue-900/80 dark:text-blue-200/80">This prompt is injected at the system
                            level. The agent also dynamically loads specific SOPs from the Knowledge Base based on
                            intent routing. Do not duplicate SOP details here.</p>
                    </div>
                </div>

                <!-- 4. Integrations -->
                <div v-show="activeTab === 'integrations'" class="space-y-6 animate-fade-in">
                    <div>
                        <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-1">External Integrations</h3>
                        <p class="text-sm text-gray-500 dark:text-gray-400">Manage LLM providers and data syncing.</p>
                    </div>

                    <div class="space-y-4">
                        <div
                            class="border border-gray-200 dark:border-white/10 rounded-xl p-5 flex items-center justify-between">
                            <div class="flex items-center gap-4">
                                <div
                                    class="w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center border border-gray-700 shrink-0">
                                    <!-- Simple openAI logo mock -->
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                                        xmlns="http://www.w3.org/2000/svg">
                                        <path
                                            d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z"
                                            fill="white" />
                                        <path
                                            d="M12 6C8.69 6 6 8.69 6 12C6 15.31 8.69 18 12 18C15.31 18 18 15.31 18 12C18 8.69 15.31 6 12 6ZM12 16C9.79 16 8 14.21 8 12C8 9.79 9.79 8 12 8C14.21 8 16 9.79 16 12C16 14.21 14.21 16 12 16Z"
                                            fill="white" />
                                    </svg>
                                </div>
                                <div>
                                    <h4 class="font-bold text-gray-900 dark:text-white">OpenAI GPT-4 Turbo</h4>
                                    <p class="text-xs text-gray-500 dark:text-gray-400">Primary reasoning engine</p>
                                </div>
                            </div>
                            <button @click="openIntegrationModal('OpenAI', 'sk-proj-...')" v-if="integrations.openai"
                                class="px-4 py-1.5 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-700 dark:text-white text-xs font-bold rounded transition-colors border border-gray-200 dark:border-white/10">Configure</button>
                            <button @click="openIntegrationModal('OpenAI', 'sk-proj-...')" v-else
                                class="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded transition-colors shadow-sm">Connect</button>
                        </div>

                        <div class="border border-gray-200 dark:border-white/10 rounded-xl p-5 flex items-center justify-between"
                            :class="!integrations.anthropic ? 'opacity-60 grayscale' : ''">
                            <div class="flex items-center gap-4">
                                <div class="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
                                    <!-- Anthropic logo mock -->
                                    <span class="text-white font-bold font-serif text-xl">A</span>
                                </div>
                                <div>
                                    <h4 class="font-bold text-gray-900 dark:text-white">Anthropic Claude 3 Opus</h4>
                                    <p class="text-xs text-gray-500 dark:text-gray-400">Not connected</p>
                                </div>
                            </div>
                            <button @click="openIntegrationModal('Anthropic', 'sk-ant-...')"
                                v-if="integrations.anthropic"
                                class="px-4 py-1.5 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-700 dark:text-white text-xs font-bold rounded transition-colors border border-gray-200 dark:border-white/10">Configure</button>
                            <button @click="openIntegrationModal('Anthropic', 'sk-ant-...')" v-else
                                class="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded transition-colors shadow-sm">Connect</button>
                        </div>
                    </div>
                </div>

            </div>
        </div>

        <!-- Global Save Toast -->
        <Teleport to="body">
            <div class="fixed bottom-6 inset-x-0 flex justify-center z-50 pointer-events-none">
                <div class="transform transition-all duration-300 pointer-events-auto"
                    :class="savedToast ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-8 opacity-0 scale-95'">
                    <div
                        class="bg-gray-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 border border-gray-700">
                        <div class="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center shrink-0">
                            <span class="material-symbols-outlined text-white text-[16px]">check</span>
                        </div>
                        <span class="font-bold">Settings saved successfully</span>
                    </div>
                </div>
            </div>
        </Teleport>

        <!-- API Key Modal -->
        <Teleport to="body">
            <div v-if="showApiModal"
                class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                @click.self="showApiModal = false">
                <div
                    class="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md shadow-2xl border border-gray-100 dark:border-white/10 overflow-hidden">
                    <div
                        class="px-6 py-5 border-b border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/5 flex items-center gap-3">
                        <span class="material-symbols-outlined text-purple-600 dark:text-purple-400">api</span>
                        <div>
                            <h3 class="font-bold text-gray-900 dark:text-white leading-tight">Connect {{ activeProvider
                                }}</h3>
                            <p class="text-xs text-gray-500">Provide an API key with adequate permissions.</p>
                        </div>
                    </div>

                    <div class="p-6 space-y-4">
                        <div>
                            <label
                                class="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">Secret
                                API Key</label>
                            <input v-model="tempApiKey" type="password"
                                class="w-full bg-white dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-shadow shadow-sm font-mono"
                                :placeholder="apiPlaceholder">
                        </div>

                        <div class="bg-blue-50 dark:bg-blue-900/10 border-l-4 border-blue-500 p-3 rounded-r-lg">
                            <p class="text-[11px] text-blue-800 dark:text-blue-300">
                                <span class="font-bold">Security Notice:</span> Keys are stored locally in the secure
                                credential store and are never exposed to the frontend browser context.
                            </p>
                        </div>

                        <div v-if="isTestingKey"
                            class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 font-medium">
                            <span class="material-symbols-outlined animate-spin text-[16px]">progress_activity</span>
                            Validating key...
                        </div>
                        <div v-else-if="apiError"
                            class="text-xs font-bold text-red-500 bg-red-50 dark:bg-red-900/10 p-2 rounded">
                            {{ apiError }}
                        </div>
                    </div>

                    <div class="p-6 border-t border-gray-100 dark:border-white/5 flex gap-3 bg-gray-50 dark:bg-white/5">
                        <button @click="showApiModal = false; apiError = ''"
                            class="flex-1 py-2.5 bg-white dark:bg-black/20 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-700 dark:text-white font-bold rounded-xl transition-colors border border-gray-200 dark:border-white/10 shadow-sm">
                            Cancel
                        </button>
                        <button @click="verifyAndConnect" :disabled="!tempApiKey || isTestingKey"
                            class="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold rounded-xl transition-colors shadow-sm flex justify-center items-center gap-2">
                            <span class="material-symbols-outlined text-[18px]">vpn_key</span> Save Key
                        </button>
                    </div>
                </div>
            </div>
        </Teleport>
    </div>
</template>

<script setup>
import { ref, reactive } from 'vue'

const savedToast = ref(false)
const activeTab = ref('integrations') // default to integrations for demo

const showApiModal = ref(false)
const activeProvider = ref('')
const tempApiKey = ref('')
const apiPlaceholder = ref('')
const isTestingKey = ref(false)
const apiError = ref('')

const integrations = reactive({
    openai: true, // Started as connected
    anthropic: false
})

const configTabs = [
    { id: 'behavior', label: 'Global Behavior', icon: 'smart_toy' },
    { id: 'thresholds', label: 'Risk Thresholds', icon: 'tune' },
    { id: 'prompts', label: 'System Prompts', icon: 'code_blocks' },
    { id: 'integrations', label: 'Integrations', icon: 'hub' },
]

const settings = reactive({
    tone: 'Friendly & Empathetic',
    languageModal: 'Auto-Detect (Multilingual)',
    sentimentThreshold: 80,
    refundLimit: 50,
    systemPrompt: `You are the primary autonomous support agent for Cargo-Core Logistics.
Your operational priorities are:
1. De-escalate angry customers with empathy.
2. Adhere strictly to internal SOPs located in the Knowledge Base.
3. Automatically process refunds up to your permitted dollar limit if criteria are met.
4. Transfer to a human supervisor if legal threats are detected or sentiment risk drops too low.

Always communicate cleanly, concisely, and formatting order numbers securely.`
})

const behaviorToggles = reactive([
    { key: 'autoReply', label: 'Autonomous Replies', desc: 'Allow AI to send responses directly to customers without human approval.', enabled: true, bgColor: 'bg-blue-100 dark:bg-blue-900/30', iconColor: 'text-blue-600 dark:text-blue-400', icon: 'send' },
    { key: 'legalDetect', label: 'Legal Threat Detection', desc: 'Automatically flag and halt autonomous response when legal keywords are detected.', enabled: true, bgColor: 'bg-red-100 dark:bg-red-900/30', iconColor: 'text-red-600 dark:text-red-400', icon: 'gavel' },
    { key: 'sentimentAnalysis', label: 'Real-time Sentiment Analysis', desc: 'Constantly evaluate user mood to trigger priority escalations.', enabled: true, bgColor: 'bg-orange-100 dark:bg-orange-900/30', iconColor: 'text-orange-600 dark:text-orange-400', icon: 'mood_bad' },
    { key: 'botHandover', label: 'Proactive Human Handover', desc: 'Transfer chat/ticket to a human before policy limits are hit if confidence drops.', enabled: false, bgColor: 'bg-green-100 dark:bg-green-900/30', iconColor: 'text-green-600 dark:text-green-400', icon: 'support_agent' },
])

function saveSettings() {
    savedToast.value = true
    setTimeout(() => {
        savedToast.value = false
    }, 3000)
}

function resetSettings() {
    if (confirm('Are you sure you want to reset all AI configurations to their factory defaults?')) {
        settings.sentimentThreshold = 80;
        settings.refundLimit = 50;
        settings.tone = 'Friendly & Empathetic';
        behaviorToggles.forEach(t => t.enabled = true);
        saveSettings();
    }
}

function openIntegrationModal(provider, placeholder) {
    activeProvider.value = provider
    apiPlaceholder.value = placeholder
    tempApiKey.value = ''
    apiError.value = ''
    showApiModal.value = true
}

function verifyAndConnect() {
    isTestingKey.value = true;
    apiError.value = '';

    // Simulate API verification delay
    setTimeout(() => {
        isTestingKey.value = false;

        // Simple mock validation (must not be too short)
        if (tempApiKey.value.length < 15) {
            apiError.value = 'Invalid API Key format provided for ' + activeProvider.value;
            return;
        }

        // Success
        if (activeProvider.value === 'OpenAI') {
            integrations.openai = true;
        } else if (activeProvider.value === 'Anthropic') {
            integrations.anthropic = true;
        }

        showApiModal.value = false;
        saveSettings();
    }, 1200)
}
</script>

<style scoped>
.animate-fade-in {
    animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>
