<template>
    <div class="max-w-4xl mx-auto space-y-8">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                <h2 class="text-2xl font-bold text-gray-900 dark:text-white">AI Configuration</h2>
                <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Configure AI behavior, thresholds, and system
                    instructions</p>
            </div>
            <button @click="saveSettings"
                class="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-colors flex items-center gap-2 shadow-sm">
                <span class="material-symbols-outlined text-sm">save</span> Save Changes
            </button>
        </div>

        <!-- Save Success Toast -->
        <div v-if="savedToast"
            class="fixed bottom-6 right-6 bg-green-600 text-white px-6 py-3 rounded-xl shadow-xl flex items-center gap-2 z-50 animate-slide-up">
            <span class="material-symbols-outlined">check_circle</span> Settings saved successfully!
        </div>

        <!-- Bot Behavior -->
        <div class="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 p-6 rounded-xl shadow-sm">
            <h3 class="font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-white/10 pb-3 mb-6">
                Bot Behavior</h3>
            <div class="space-y-6">
                <div v-for="setting in botSettings" :key="setting.key" class="flex items-center justify-between">
                    <div>
                        <div class="font-bold text-gray-900 dark:text-white">{{ setting.label }}</div>
                        <div class="text-sm text-gray-500 dark:text-gray-400">{{ setting.desc }}</div>
                    </div>
                    <button @click="setting.enabled = !setting.enabled"
                        class="w-11 h-6 rounded-full relative transition-colors shrink-0"
                        :class="setting.enabled ? 'bg-purple-600' : 'bg-gray-200 dark:bg-gray-700'">
                        <div class="absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform"
                            :class="setting.enabled ? 'right-1' : 'left-1'"></div>
                    </button>
                </div>
                <div class="flex items-center justify-between">
                    <div>
                        <div class="font-bold text-gray-900 dark:text-white">Tone of Voice</div>
                        <div class="text-sm text-gray-500 dark:text-gray-400">Select the personality of the AI
                            assistant.</div>
                    </div>
                    <select v-model="tone"
                        class="bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-purple-500 transition-colors">
                        <option>Professional & Formal</option>
                        <option>Friendly & Empathetic</option>
                        <option>Direct & Concise</option>
                    </select>
                </div>
            </div>
        </div>

        <!-- Automation Thresholds -->
        <div class="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 p-6 rounded-xl shadow-sm">
            <h3 class="font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-white/10 pb-3 mb-6">
                Automation Thresholds</h3>
            <div class="space-y-6">
                <div>
                    <div class="flex justify-between mb-2">
                        <label class="text-sm font-medium text-gray-900 dark:text-white">Sentiment Escalation
                            Trigger</label>
                        <span class="text-sm text-red-600 dark:text-red-400 font-bold">Negative (>{{ sentimentThreshold
                            }}%)</span>
                    </div>
                    <input type="range" v-model="sentimentThreshold"
                        class="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-red-500"
                        min="0" max="100">
                    <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">Escalate to human if sentiment score
                        drops below this value.</div>
                </div>
                <div>
                    <div class="flex justify-between mb-2">
                        <label class="text-sm font-medium text-gray-900 dark:text-white">Auto-Refund Limit ($)</label>
                        <span class="text-sm text-green-600 dark:text-green-400 font-bold">${{ refundLimit }}.00</span>
                    </div>
                    <input type="range" v-model="refundLimit"
                        class="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-500"
                        min="0" max="200">
                    <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">Maximum amount for auto-approved
                        refunds.</div>
                </div>
            </div>
        </div>

        <!-- System Prompt -->
        <div class="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 p-6 rounded-xl shadow-sm">
            <h3 class="font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-white/10 pb-3 mb-4">
                Custom System Prompt</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">Override the base instructions for the AI model.
            </p>
            <textarea v-model="systemPrompt" rows="5"
                class="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl p-4 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-purple-500 font-mono resize-none transition-colors"
                placeholder="You are a helpful logistics assistant..."></textarea>
            <div class="flex justify-end mt-4">
                <button @click="saveSettings"
                    class="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-colors">
                    Save Changes
                </button>
            </div>
        </div>

        <!-- Notifications Settings -->
        <div class="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 p-6 rounded-xl shadow-sm">
            <h3 class="font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-white/10 pb-3 mb-6">
                Notifications</h3>
            <div class="space-y-4">
                <div v-for="notif in notifSettings" :key="notif.key" class="flex items-center justify-between">
                    <div>
                        <div class="font-medium text-gray-900 dark:text-white">{{ notif.label }}</div>
                        <div class="text-sm text-gray-500 dark:text-gray-400">{{ notif.desc }}</div>
                    </div>
                    <button @click="notif.enabled = !notif.enabled"
                        class="w-11 h-6 rounded-full relative transition-colors shrink-0"
                        :class="notif.enabled ? 'bg-purple-600' : 'bg-gray-200 dark:bg-gray-700'">
                        <div class="absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform"
                            :class="notif.enabled ? 'right-1' : 'left-1'"></div>
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'

const savedToast = ref(false)
const tone = ref('Friendly & Empathetic')
const sentimentThreshold = ref(80)
const refundLimit = ref(50)
const systemPrompt = ref('You are a helpful, empathetic logistics support assistant for Cargo-Core. Always be professional and resolve issues efficiently.')

const botSettings = ref([
    { key: 'autoReply', label: 'Auto-Reply', desc: 'Allow AI to send responses without human approval.', enabled: true },
    { key: 'legalDetect', label: 'Legal Threat Detection', desc: 'Automatically flag messages containing legal keywords.', enabled: true },
    { key: 'sentimentAnalysis', label: 'Sentiment Analysis', desc: 'Analyze user mood in real-time during conversations.', enabled: true },
    { key: 'botHandover', label: 'Bot → Human Handover', desc: 'Auto-transfer to human agent when bot confidence is low.', enabled: false },
])

const notifSettings = ref([
    { key: 'newEscalation', label: 'New Escalations', desc: 'Get notified when a new escalation is created.', enabled: true },
    { key: 'refundApproval', label: 'Refund Approvals', desc: 'Notify when a refund needs manual review.', enabled: true },
    { key: 'systemAlerts', label: 'System Alerts', desc: 'Receive AI performance and latency alerts.', enabled: false },
])

function saveSettings() {
    savedToast.value = true
    setTimeout(() => savedToast.value = false, 3000)
}
</script>
