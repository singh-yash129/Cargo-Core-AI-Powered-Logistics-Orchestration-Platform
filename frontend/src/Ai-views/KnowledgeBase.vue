<template>
    <div class="space-y-6">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Knowledge Base & SOPs</h2>
                <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Policies, procedures, and AI training documents
                </p>
            </div>
            <button @click="showAddArticleModal = true"
                class="px-4 py-2 border border-gray-200 dark:border-white/20 hover:bg-gray-50 dark:hover:bg-white/5 text-gray-700 dark:text-white font-bold rounded-lg flex items-center gap-2 transition-colors">
                <span class="material-symbols-outlined">edit_document</span> Add Article
            </button>
        </div>

        <!-- Search -->
        <div class="relative max-w-2xl mx-auto">
            <input v-model="searchQuery" type="text" placeholder="Search for answers, policies, or SOPs..."
                class="w-full bg-white dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl pl-12 pr-4 py-4 text-gray-900 dark:text-white focus:outline-none focus:border-purple-500 shadow-sm transition-colors">
            <span class="material-symbols-outlined absolute left-4 top-4 text-gray-400 text-xl">search</span>
        </div>

        <!-- Category Tabs -->
        <div class="flex gap-2 overflow-x-auto no-scrollbar">
            <button v-for="cat in categories" :key="cat" @click="activeCategory = cat"
                class="px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-colors"
                :class="activeCategory === cat
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10'">
                {{ cat }}
            </button>
        </div>

        <!-- Categories Grid -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div v-for="cat in visibleCategories" :key="cat.title"
                class="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 p-6 rounded-xl hover:border-purple-300 dark:hover:border-purple-500/50 shadow-sm transition-all cursor-pointer group">
                <div class="w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
                    :class="cat.iconBg">
                    <span class="material-symbols-outlined" :class="cat.iconColor">{{ cat.icon }}</span>
                </div>
                <h3 class="font-bold text-gray-900 dark:text-white mb-2">{{ cat.title }}</h3>
                <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">{{ cat.desc }}</p>
                <div class="space-y-2">
                    <div v-for="article in cat.articles" :key="article" @click.stop="openArticleModal(article)"
                        class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer">
                        <span class="material-symbols-outlined text-xs">article</span>
                        {{ article }}
                    </div>
                </div>
            </div>
        </div>

        <!-- Article View Modal -->
        <Teleport to="body">
            <div v-if="showArticleModal"
                class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                @click.self="showArticleModal = false">
                <div
                    class="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-lg shadow-2xl border border-gray-100 dark:border-white/10 overflow-hidden">
                    <div class="p-6 border-b border-gray-100 dark:border-white/5 flex justify-between">
                        <h3 class="text-xl font-bold text-gray-900 dark:text-white">{{ selectedArticle }}</h3>
                        <button @click="showArticleModal = false"
                            class="text-gray-400 hover:text-gray-600 dark:hover:text-white">
                            <span class="material-symbols-outlined">close</span>
                        </button>
                    </div>
                    <div class="p-6">
                        <div class="prose prose-sm text-gray-600 dark:text-gray-300 space-y-3">
                            <p>This document outlines the standard operating procedure for <strong
                                    class="text-gray-900 dark:text-white">{{ selectedArticle }}</strong>.</p>
                            <p>All agents and AI systems must follow these guidelines when handling related customer
                                inquiries. Deviations require supervisor approval.</p>
                            <ul class="list-disc pl-5 space-y-1">
                                <li>Acknowledge the customer's concern within 2 minutes</li>
                                <li>Verify order details before taking action</li>
                                <li>Follow the approved response template</li>
                                <li>Escalate if customer sentiment score drops below 70%</li>
                            </ul>
                        </div>
                    </div>
                    <div class="p-6 border-t border-gray-100 dark:border-white/5 flex gap-3">
                        <button @click="showArticleModal = false"
                            class="flex-1 py-2.5 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-white font-bold rounded-xl transition-colors">
                            Close
                        </button>
                        <button
                            class="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-colors">
                            Edit Article
                        </button>
                    </div>
                </div>
            </div>
        </Teleport>

        <!-- Add Article Modal -->
        <Teleport to="body">
            <div v-if="showAddArticleModal"
                class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                @click.self="showAddArticleModal = false">
                <div
                    class="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md shadow-2xl border border-gray-100 dark:border-white/10 overflow-hidden">
                    <div class="p-6 border-b border-gray-100 dark:border-white/5">
                        <h3 class="text-xl font-bold text-gray-900 dark:text-white">Add New Article</h3>
                    </div>
                    <div class="p-6 space-y-4">
                        <div>
                            <label
                                class="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase">Article
                                Title</label>
                            <input v-model="newArticle.title" type="text"
                                class="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white outline-none focus:border-purple-500 transition-colors"
                                placeholder="e.g. Priority Complaint Handling" />
                        </div>
                        <div>
                            <label
                                class="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase">Category</label>
                            <select v-model="newArticle.category"
                                class="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white outline-none focus:border-purple-500 transition-colors">
                                <option v-for="cat in categories.filter(c => c !== 'All')" :key="cat">{{ cat }}</option>
                            </select>
                        </div>
                    </div>
                    <div class="p-6 border-t border-gray-100 dark:border-white/5 flex gap-3">
                        <button @click="showAddArticleModal = false"
                            class="flex-1 py-2.5 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-white font-bold rounded-xl transition-colors">
                            Cancel
                        </button>
                        <button @click="addArticle" :disabled="!newArticle.title"
                            class="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold rounded-xl transition-colors">
                            Add Article
                        </button>
                    </div>
                </div>
            </div>
        </Teleport>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const searchQuery = ref('')
const activeCategory = ref('All')
const showArticleModal = ref(false)
const showAddArticleModal = ref(false)
const selectedArticle = ref('')
const newArticle = ref({ title: '', category: 'Driver SOPs' })

const categories = ['All', 'Driver SOPs', 'Customer Support', 'Legal & Compliance']

const allCategories = ref([
    {
        title: 'Driver Standard Procedures', icon: 'local_shipping',
        iconBg: 'bg-purple-100 dark:bg-purple-500/20', iconColor: 'text-purple-600 dark:text-purple-400',
        desc: 'Guidelines for delivery execution, safety protocols, and customer interaction.',
        articles: ['Contactless Delivery Protocol', 'Proof of Delivery Requirements', 'Vehicle Breakdown SOP']
    },
    {
        title: 'Customer Support Scripts', icon: 'support_agent',
        iconBg: 'bg-blue-100 dark:bg-blue-500/20', iconColor: 'text-blue-600 dark:text-blue-400',
        desc: 'Response templates and policy details for support agents and AI bot.',
        articles: ['Late Delivery Apology', 'Refund Eligibility Policy', 'Damage Claim Process']
    },
    {
        title: 'Legal & Compliance', icon: 'gavel',
        iconBg: 'bg-green-100 dark:bg-green-500/20', iconColor: 'text-green-600 dark:text-green-400',
        desc: 'Terms of service, privacy policy, and liability waivers.',
        articles: ['Liability Waiver 2024', 'Data Privacy (GDPR)', 'Dispute Resolution Policy']
    },
])

const visibleCategories = computed(() => {
    let cats = allCategories.value
    if (searchQuery.value) {
        const q = searchQuery.value.toLowerCase()
        cats = cats.map(cat => ({
            ...cat,
            articles: cat.articles.filter(a => a.toLowerCase().includes(q))
        })).filter(cat => cat.articles.length > 0 || cat.title.toLowerCase().includes(q))
    }
    return cats
})

function openArticleModal(article) {
    selectedArticle.value = article
    showArticleModal.value = true
}

function addArticle() {
    if (!newArticle.value.title) return
    const cat = allCategories.value.find(c => c.title.includes(newArticle.value.category))
    if (cat) cat.articles.push(newArticle.value.title)
    newArticle.value = { title: '', category: 'Driver SOPs' }
    showAddArticleModal.value = false
}
</script>
