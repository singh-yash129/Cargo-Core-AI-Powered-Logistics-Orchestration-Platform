<template>
    <div class="space-y-6">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                <h2 class="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <span class="material-symbols-outlined text-purple-500 text-3xl">menu_book</span>
                    Knowledge Base & SOPs
                </h2>
                <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Official policies, standard operating
                    procedures, and AI training data</p>
            </div>
            <div class="flex gap-2 w-full sm:w-auto">
                <button @click="showAddArticleModal = true"
                    class="w-full sm:w-auto px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg flex justify-center items-center gap-2 transition-colors shadow-sm">
                    <span class="material-symbols-outlined text-sm">edit_document</span> New Article
                </button>
            </div>
        </div>

        <!-- Hero Search Section -->
        <div
            class="bg-gradient-to-br from-purple-900 via-indigo-900 to-black rounded-2xl p-8 relative overflow-hidden shadow-lg border border-purple-500/20">
            <!-- Decorative Background elements -->
            <div
                class="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none">
            </div>
            <div
                class="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl pointer-events-none">
            </div>

            <div class="relative z-10 max-w-2xl mx-auto text-center">
                <h3 class="text-2xl font-bold text-white mb-4">How can we help the AI today?</h3>
                <div class="relative">
                    <input v-model="searchQuery" type="text"
                        placeholder="Search for standard operating procedures, policies, or scripts..."
                        class="w-full bg-white/10 dark:bg-black/40 backdrop-blur-md border border-white/20 rounded-xl pl-12 pr-4 py-4 text-white placeholder-white/60 focus:outline-none focus:border-purple-400 focus:bg-white/20 shadow-inner transition-all text-lg">
                    <span class="material-symbols-outlined absolute left-4 top-4 text-white/60 text-2xl">search</span>
                </div>
                <div class="flex gap-2 justify-center mt-4 text-xs font-bold">
                    <span class="text-white/60">Popular:</span>
                    <button @click="searchQuery = 'Refund'"
                        class="text-purple-300 hover:text-white transition-colors">Refund Policy</button>
                    <button @click="searchQuery = 'Damage'"
                        class="text-purple-300 hover:text-white transition-colors">Damage Claims</button>
                    <button @click="searchQuery = 'Legal'"
                        class="text-purple-300 hover:text-white transition-colors">Legal Escalation</button>
                </div>
            </div>
        </div>

        <!-- Filter Tabs -->
        <div
            class="p-1 bg-gray-100 dark:bg-white/5 rounded-xl inline-flex overflow-x-auto no-scrollbar max-w-full shadow-sm">
            <button v-for="cat in categories" :key="cat" @click="activeCategory = cat"
                class="px-5 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2"
                :class="activeCategory === cat
                    ? 'bg-white text-purple-700 shadow-sm dark:bg-gray-800 dark:text-purple-400'
                    : 'text-gray-600 hover:text-gray-900 border-transparent dark:text-gray-400 dark:hover:text-gray-200'">
                {{ cat }}
            </button>
        </div>

        <!-- Dynamic Content Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <template v-for="cat in visibleCategories" :key="cat.title">

                <!-- Category Card Header -->
                <div class="col-span-1 md:col-span-2 lg:col-span-3 mt-4 mb-2 flex items-center gap-3"
                    v-if="cat.articles.length > 0">
                    <div class="w-10 h-10 rounded-lg flex items-center justify-center shadow-sm" :class="cat.iconBg">
                        <span class="material-symbols-outlined text-[20px]" :class="cat.iconColor">{{ cat.icon }}</span>
                    </div>
                    <div>
                        <h3 class="text-lg font-bold text-gray-900 dark:text-white">{{ cat.title }}</h3>
                        <p class="text-xs text-gray-500 dark:text-gray-400">{{ cat.desc }}</p>
                    </div>
                </div>

                <!-- Article Cards -->
                <div v-for="article in cat.articles" :key="article.title" @click="openArticleModal(article, cat)"
                    class="bg-white dark:bg-black/20 border border-gray-100 dark:border-white/5 p-5 rounded-xl hover:border-purple-300 dark:hover:border-purple-500/50 hover:shadow-md dark:hover:bg-white/5 shadow-sm transition-all cursor-pointer flex flex-col group relative overflow-hidden">

                    <div class="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl opacity-0 group-hover:opacity-10 transition-opacity rounded-bl-full pointer-events-none"
                        :class="cat.iconBg"></div>

                    <div class="flex-1">
                        <div class="flex justify-between items-start mb-2">
                            <div class="flex items-center gap-2">
                                <span
                                    class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-400">
                                    <span class="material-symbols-outlined text-[12px] align-sub">{{ article.typeIcon
                                        }}</span> {{ article.type }}
                                </span>
                                <span v-if="article.featured"
                                    class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400">
                                    Featured
                                </span>
                            </div>
                            <button
                                class="text-gray-400 hover:text-gray-900 dark:hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                <span class="material-symbols-outlined text-[18px]">bookmark_border</span>
                            </button>
                        </div>
                        <h4
                            class="font-bold text-gray-900 dark:text-white text-lg mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                            {{ article.title }}</h4>
                        <p class="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">{{
                            article.excerpt }}</p>
                    </div>

                    <div
                        class="mt-4 pt-4 border-t border-gray-100 dark:border-white/5 flex justify-between items-center">
                        <div class="flex items-center gap-2">
                            <div
                                class="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 font-bold text-[10px] flex justify-center items-center text-gray-700 dark:text-gray-300 shadow-inner">
                                {{ article.authorInitials }}
                            </div>
                            <span class="text-xs text-gray-500 dark:text-gray-400">{{ article.lastUpdated }}</span>
                        </div>
                        <div
                            class="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 font-bold bg-green-50 dark:bg-green-500/10 px-2 py-1 rounded">
                            <span class="material-symbols-outlined text-[14px]">thumb_up</span> {{ article.likes }}
                        </div>
                    </div>
                </div>
            </template>

            <div v-if="visibleCategories.length === 0"
                class="col-span-1 md:col-span-2 lg:col-span-3 text-center py-16 text-gray-500 dark:text-gray-400">
                <span class="material-symbols-outlined text-6xl mb-4 text-gray-300 dark:text-gray-600">search_off</span>
                <p class="text-lg font-bold text-gray-900 dark:text-white mb-2">No articles found</p>
                <p>We couldn't find anything matching "{{ searchQuery }}". Try adjusting your search or category filter.
                </p>
                <button @click="searchQuery = ''"
                    class="mt-4 text-purple-600 dark:text-purple-400 font-bold hover:underline">Clear
                    Search</button>
            </div>
        </div>

        <!-- Rich Article Viewer Modal -->
        <Teleport to="body">
            <div v-if="showArticleModal"
                class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-6"
                @click.self="showArticleModal = false">
                <div
                    class="bg-white dark:bg-gray-900 flex flex-col rounded-2xl w-full max-w-5xl h-[90vh] shadow-2xl border border-gray-100 dark:border-white/10 overflow-hidden">

                    <!-- App Bar -->
                    <div
                        class="px-6 py-4 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-gray-50 dark:bg-white/5 shrink-0">
                        <div class="flex gap-2">
                            <span
                                class="px-2 py-1 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-bold rounded flex items-center gap-1">
                                <span class="material-symbols-outlined text-[14px]">{{ selectedArticleCat?.icon
                                    }}</span>
                                {{ selectedArticleCat?.title }}
                            </span>
                            <span
                                class="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs font-bold rounded border border-purple-200 dark:border-purple-800/50">
                                Internal SOP
                            </span>
                        </div>
                        <div class="flex gap-2 text-gray-500 dark:text-gray-400">
                            <button @click="printArticle"
                                class="p-2 hover:bg-gray-200 dark:hover:bg-white/10 rounded-full transition tooltip-trigger relative text-gray-400 hover:text-gray-900 dark:hover:text-white">
                                <span class="material-symbols-outlined">print</span>
                                <span class="tooltip">Print</span>
                            </button>
                            <button @click="editArticle"
                                class="p-2 hover:bg-gray-200 dark:hover:bg-white/10 rounded-full transition tooltip-trigger relative text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
                                <span class="material-symbols-outlined">edit</span>
                                <span class="tooltip">Edit</span>
                            </button>
                            <button @click="unpublishArticle"
                                class="p-2 hover:bg-gray-200 dark:hover:bg-white/10 rounded-full transition tooltip-trigger relative text-gray-400 hover:text-orange-600 dark:hover:text-orange-400">
                                <span class="material-symbols-outlined">unpublished</span>
                                <span class="tooltip">Unpublish</span>
                            </button>
                            <button @click="deleteArticle"
                                class="p-2 hover:bg-red-100 hover:text-red-500 dark:hover:bg-red-500/20 dark:hover:text-red-400 rounded-full transition tooltip-trigger relative text-gray-400">
                                <span class="material-symbols-outlined">delete</span>
                                <span class="tooltip">Delete</span>
                            </button>
                            <div class="w-px h-6 bg-gray-300 dark:bg-gray-700 my-auto mx-1"></div>
                            <button @click="showArticleModal = false"
                                class="p-2 hover:bg-red-100 hover:text-red-500 dark:hover:bg-red-500/20 dark:hover:text-red-400 rounded-full transition">
                                <span class="material-symbols-outlined">close</span>
                            </button>
                        </div>
                    </div>

                    <!-- Split Content Area -->
                    <div class="flex-1 flex overflow-hidden">

                        <!-- TOC Sidebar -->
                        <div
                            class="hidden md:block w-64 border-r border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-black/20 p-6 overflow-y-auto">
                            <h4
                                class="text-xs uppercase font-bold text-gray-500 dark:text-gray-400 mb-4 tracking-wider">
                                On this
                                page</h4>
                            <ul class="space-y-3 text-sm font-medium">
                                <li><a href="#" @click.prevent="scrollToSection('overview')"
                                        class="text-purple-600 dark:text-purple-400 flex items-center gap-2">
                                        <div class="w-1.5 h-1.5 rounded-full bg-purple-500"></div> Overview
                                    </a></li>
                                <li><a href="#" @click.prevent="scrollToSection('criteria')"
                                        class="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition ml-3">Criteria
                                        & Rules</a></li>
                                <li><a href="#" @click.prevent="scrollToSection('actions')"
                                        class="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition ml-3">Action
                                        Steps</a></li>
                                <li><a href="#" @click.prevent="scrollToSection('exceptions')"
                                        class="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition ml-3">Exception
                                        Handling</a></li>
                                <li><a href="#" @click.prevent="scrollToSection('ai-notes')"
                                        class="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition flex items-center gap-2">
                                        <div class="w-1.5 h-1.5 rounded-full border border-gray-400"></div> AI
                                        Integration Notes
                                    </a></li>
                            </ul>
                        </div>

                        <!-- Main Document -->
                        <div id="article-main-content"
                            class="flex-1 overflow-y-auto scroll-smooth p-6 md:p-10 custom-scrollbar bg-white dark:bg-transparent">
                            <div class="max-w-3xl mx-auto pb-10">
                                <h1 id="overview"
                                    class="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white leading-tight mb-4">
                                    {{ selectedArticle?.title }}
                                </h1>

                                <div
                                    class="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-white/5 pb-6 mb-8">
                                    <div class="flex items-center gap-2">
                                        <div
                                            class="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-bold flex justify-center items-center font-mono shadow-inner border border-indigo-200 dark:border-indigo-800">
                                            {{ selectedArticle?.authorInitials }}
                                        </div>
                                        <div>
                                            <span class="block text-gray-900 dark:text-gray-200 font-bold">Written by
                                                Policy
                                                Team</span>
                                            <span class="block text-xs">Last updated: {{ selectedArticle?.lastUpdated
                                                }}</span>
                                        </div>
                                    </div>
                                    <div class="w-px h-8 bg-gray-200 dark:bg-gray-800"></div>
                                    <div
                                        class="flex items-center gap-1 text-green-600 dark:text-green-400 font-bold bg-green-50 dark:bg-green-500/10 px-2 py-1.5 rounded-lg border border-green-200 dark:border-green-800/50">
                                        <span class="material-symbols-outlined text-[16px]">verified</span> Approved for
                                        AI use
                                    </div>
                                </div>

                                <div class="prose prose-sm md:prose-base dark:prose-invert prose-purple max-w-none prose-headings:font-bold prose-headings:text-gray-900 dark:prose-headings:text-white prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-li:text-gray-700 dark:prose-li:text-gray-300 prose-strong:text-gray-900 dark:prose-strong:text-white"
                                    v-html="renderedContent">
                                </div>

                                <div class="mt-12 pt-8 border-t border-gray-100 dark:border-white/5 text-center">
                                    <h4 class="text-sm font-bold text-gray-900 dark:text-white mb-4">Was this
                                        article
                                        helpful?</h4>
                                    <div class="flex justify-center gap-3">
                                        <button
                                            class="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-green-100 dark:hover:bg-green-900/30 hover:text-green-600 dark:hover:text-green-400 text-gray-600 dark:text-gray-300 font-bold text-sm rounded-lg transition-colors border border-gray-200 dark:border-gray-700 flex items-center gap-2">
                                            <span class="material-symbols-outlined text-[18px]">thumb_up</span> Yes,
                                            helpful
                                        </button>
                                        <button
                                            class="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 text-gray-600 dark:text-gray-300 font-bold text-sm rounded-lg transition-colors border border-gray-200 dark:border-gray-700 flex items-center gap-2">
                                            <span class="material-symbols-outlined text-[18px]">thumb_down</span>
                                            Needs
                                            improvement
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Teleport>

        <!-- Add Article Modal (WYSIWYG Mockup) -->
        <Teleport to="body">
            <div v-if="showAddArticleModal"
                class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                @click.self="showAddArticleModal = false">
                <div
                    class="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-4xl shadow-2xl border border-gray-100 dark:border-white/10 overflow-hidden flex flex-col h-[85vh]">
                    <div
                        class="px-6 py-4 border-b border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/5 flex justify-between items-center shrink-0">
                        <div class="flex items-center gap-3">
                            <div
                                class="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 p-2 rounded-lg inline-flex">
                                <span class="material-symbols-outlined">edit_document</span>
                            </div>
                            <div>
                                <h3 class="text-xl font-bold text-gray-900 dark:text-white leading-tight">Create
                                    Knowledge
                                    Article</h3>
                                <p class="text-xs text-gray-500">Draft new policy SOPs</p>
                            </div>
                        </div>
                        <div class="flex items-center gap-2">
                            <span class="text-xs text-gray-500 dark:text-gray-400 font-medium">Auto-saving... <span
                                    class="material-symbols-outlined text-[14px] text-green-500 align-sub">cloud_done</span></span>
                        </div>
                    </div>

                    <div class="p-6 flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-5">
                        <div class="grid grid-cols-2 gap-4 shrink-0">
                            <div class="col-span-2">
                                <label
                                    class="block text-[10px] font-bold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Article
                                    Title</label>
                                <input v-model="newArticle.title" type="text"
                                    class="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-lg font-bold text-gray-900 dark:text-white outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-shadow shadow-sm"
                                    placeholder="e.g. Expedited Shipping Refund Protocol" />
                            </div>

                            <div>
                                <label
                                    class="block text-[10px] font-bold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Category</label>
                                <select v-model="newArticle.category"
                                    class="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:border-purple-500 transition-colors shadow-sm font-medium">
                                    <option v-for="cat in categories.filter(c => c !== 'All')" :key="cat">{{ cat }}
                                    </option>
                                </select>
                            </div>

                            <div>
                                <label
                                    class="block text-[10px] font-bold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Document
                                    Type</label>
                                <select v-model="newArticle.type"
                                    class="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:border-purple-500 transition-colors shadow-sm font-medium">
                                    <option>Standard Operating Procedure</option>
                                    <option>Customer Support Script</option>
                                    <option>Legal Policy</option>
                                    <option>Policy</option>
                                    <option>Script</option>
                                    <option>Legal Docs</option>
                                    <option>SOP</option>
                                </select>
                            </div>

                            <div class="col-span-2">
                                <label
                                    class="block text-[10px] font-bold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Short
                                    Excerpt / Summary</label>
                                <textarea rows="2" v-model="newArticle.excerpt"
                                    class="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:border-purple-500 transition-colors shadow-sm resize-none"
                                    placeholder="Provide a brief 1-2 sentence summary of this article..."></textarea>
                            </div>
                        </div>

                        <!-- WYSIWYG Editor Mockup -->
                        <div
                            class="flex-1 border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden flex flex-col shadow-sm bg-white dark:bg-black/20">
                            <div
                                class="bg-gray-50 dark:bg-white/5 border-b border-gray-200 dark:border-white/10 p-2 flex gap-1 items-center shrink-0 flex-wrap">
                                <select
                                    class="bg-transparent border-none text-sm font-bold text-gray-700 dark:text-gray-300 focus:ring-0 cursor-pointer p-1">
                                    <option>Normal text</option>
                                    <option>Heading 1</option>
                                    <option>Heading 2</option>
                                    <option>Heading 3</option>
                                </select>
                                <div class="w-px h-5 bg-gray-300 dark:bg-gray-700 mx-1"></div>
                                <button
                                    class="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 transition"
                                    title="Bold"><span
                                        class="material-symbols-outlined text-[18px]">format_bold</span></button>
                                <button
                                    class="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 transition"
                                    title="Italic"><span
                                        class="material-symbols-outlined text-[18px]">format_italic</span></button>
                                <button
                                    class="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 transition"
                                    title="Underline"><span
                                        class="material-symbols-outlined text-[18px]">format_underlined</span></button>
                                <div class="w-px h-5 bg-gray-300 dark:bg-gray-700 mx-1"></div>
                                <button
                                    class="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 transition"
                                    title="Bullet List"><span
                                        class="material-symbols-outlined text-[18px]">format_list_bulleted</span></button>
                                <button
                                    class="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 transition"
                                    title="Numbered List"><span
                                        class="material-symbols-outlined text-[18px]">format_list_numbered</span></button>
                                <div class="w-px h-5 bg-gray-300 dark:bg-gray-700 mx-1"></div>
                                <button
                                    class="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 transition"
                                    title="Insert Link"><span
                                        class="material-symbols-outlined text-[18px]">link</span></button>
                                <button
                                    class="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 transition"
                                    title="Insert Image"><span
                                        class="material-symbols-outlined text-[18px]">image</span></button>
                            </div>
                            <textarea v-model="newArticle.content"
                                class="flex-1 w-full bg-transparent border-none p-4 text-sm text-gray-900 dark:text-gray-100 outline-none resize-none font-mono"
                                placeholder="Write article content here using markdown format or the rich text tools above..."></textarea>
                        </div>
                    </div>

                    <div
                        class="px-6 py-4 border-t border-gray-100 dark:border-white/5 flex gap-3 shrink-0 bg-gray-50 dark:bg-white/5">
                        <button @click="showAddArticleModal = false"
                            class="py-2.5 px-6 bg-white dark:bg-black/20 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-700 dark:text-white font-bold rounded-xl transition-colors border border-gray-200 dark:border-white/10 shadow-sm ml-auto">
                            Discard Draft
                        </button>
                        <button @click="saveDraftTrigger" :disabled="!newArticle.title"
                            class="py-2.5 px-6 bg-white dark:bg-black/20 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-700 dark:text-white font-bold rounded-xl transition-colors border border-gray-200 dark:border-white/10 shadow-sm flex items-center gap-2">
                            <span class="material-symbols-outlined text-[18px]">save</span> Save Draft
                        </button>
                        <button @click="addArticle" :disabled="!newArticle.title"
                            class="py-2.5 px-6 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold rounded-xl transition-colors shadow-sm flex items-center gap-2">
                            <span class="material-symbols-outlined text-[18px]">publish</span> Publish Article
                        </button>
                    </div>
                </div>
            </div>
        </Teleport>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { marked } from 'marked'

const searchQuery = ref('')
const activeCategory = ref('All')

const showArticleModal = ref(false)
const showAddArticleModal = ref(false)

const selectedArticle = ref(null)
const selectedArticleCat = ref(null)

const newArticle = ref({
    title: '',
    category: 'Customer Support Scripts',
    type: 'SOP',
    excerpt: '',
    content: ''
})

const defaultMarkdownContent = `
## 1. Criteria & Rules
Before applying any action defined in this SOP, you must verify the following criteria via the integrated CRM toolset:
* **Account Standing:** Must not be flagged for fraudulent activity.
* **Time window:** The request must fall within the 30-day standard policy window.

## 2. Action Steps
1. Acknowledge the customer's frustration using empathy markers.
2. Confirm order details and shipping address explicitly.
3. Process action in billing portal.
4. Send automated email.

## 3. AI Integration Notes
The sentiment detection model is highly sensitive to the phrase "regulatory body". When this is parsed, bypass standard queueing and route immediately.
`

const categories = ['All', 'Standard Procedures', 'Customer Support Scripts', 'Legal & Compliance', 'AI Prompts']

const allCategories = ref([
    {
        title: 'Customer Support Scripts', icon: 'support_agent',
        iconBg: 'bg-blue-100 dark:bg-blue-500/20', iconColor: 'text-blue-600 dark:text-blue-400',
        desc: 'Approved templates and dialogue logic for support agents and AI bot responses.',
        articles: [
            { title: 'Refund Eligibility Policy', type: 'Policy', typeIcon: 'policy', excerpt: 'Comprehensive ruleset defining when a customer is entitled to a full, partial, or no refund based on timing and item condition.', content: defaultMarkdownContent, authorInitials: 'JD', lastUpdated: '2 days ago', likes: 145, featured: true },
            { title: 'Late Delivery Apology Script', type: 'Script', typeIcon: 'forum', excerpt: 'Text and voice scripts to use when acknowledging a missed SLA or late carrier delivery.', content: defaultMarkdownContent, authorInitials: 'AM', lastUpdated: '1 week ago', likes: 89, featured: false },
            { title: 'Handling Escalations via Phone', type: 'SOP', typeIcon: 'headset_mic', excerpt: 'Step-by-step logic for de-escalating angry callers before passing to a Tier 2 supervisor.', content: defaultMarkdownContent, authorInitials: 'TB', lastUpdated: '3 weeks ago', likes: 42, featured: false }
        ]
    },
    {
        title: 'Standard Procedures', icon: 'local_shipping',
        iconBg: 'bg-purple-100 dark:bg-purple-500/20', iconColor: 'text-purple-600 dark:text-purple-400',
        desc: 'Internal guidelines for operations, logistics execution, and safety protocols.',
        articles: [
            { title: 'Contactless Delivery Rules', type: 'SOP', typeIcon: 'rule', excerpt: 'Instructions for drivers executing visual verification and signatureless dropoffs.', content: defaultMarkdownContent, authorInitials: 'LR', lastUpdated: '1 month ago', likes: 210, featured: true },
            { title: 'RMA Warehouse Processing', type: 'SOP', typeIcon: 'warehouse', excerpt: 'How to receive, log, and inspect a returned item at the central depot.', content: defaultMarkdownContent, authorInitials: 'DK', lastUpdated: '5 days ago', likes: 67, featured: false }
        ]
    },
    {
        title: 'Legal & Compliance', icon: 'gavel',
        iconBg: 'bg-green-100 dark:bg-green-500/20', iconColor: 'text-green-600 dark:text-green-400',
        desc: 'Binding terms of service, privacy protocols, and regulatory requirements.',
        articles: [
            { title: 'Data Privacy (GDPR Compliance)', type: 'Policy', typeIcon: 'gavel', excerpt: 'Mandatory rules on how customer PII string data is handled, stored, and purged upon request (Right to be Forgotten).', content: defaultMarkdownContent, authorInitials: 'LF', lastUpdated: '5 months ago', likes: 91, featured: true },
            { title: 'Liability Waiver 2024 Updates', type: 'Legal Docs', typeIcon: 'description', excerpt: 'Updated vendor liability clauses covering third-party shipping incidents.', content: defaultMarkdownContent, authorInitials: 'LF', lastUpdated: 'Jan 15, 2024', likes: 23, featured: false }
        ]
    },
])

const visibleCategories = computed(() => {
    let cats = allCategories.value

    // Filter by Tab
    if (activeCategory.value !== 'All') {
        cats = cats.filter(c => c.title === activeCategory.value)
    }

    // Filter by Text Search
    if (searchQuery.value) {
        const q = searchQuery.value.toLowerCase()
        cats = cats.map(cat => ({
            ...cat,
            articles: cat.articles.filter(a =>
                a.title.toLowerCase().includes(q) ||
                a.excerpt.toLowerCase().includes(q)
            )
        })).filter(cat => cat.articles.length > 0)
    }
    return cats
})

const renderedContent = computed(() => {
    if (!selectedArticle.value || !selectedArticle.value.content) return '';
    return marked(selectedArticle.value.content);
});

function openArticleModal(article, cat) {
    selectedArticle.value = article
    selectedArticleCat.value = cat
    showArticleModal.value = true
}

function addArticle() {
    if (!newArticle.value.title) return
    const cat = allCategories.value.find(c => c.title === newArticle.value.category)
    if (cat) {
        cat.articles.unshift({
            title: newArticle.value.title,
            type: newArticle.value.type,
            typeIcon: 'edit_document',
            excerpt: newArticle.value.excerpt || 'Newly drafted article. Pending review.',
            content: newArticle.value.content || defaultMarkdownContent,
            authorInitials: 'AI',
            lastUpdated: 'Just now',
            likes: 0,
            featured: false
        })
    }

    newArticle.value = { title: '', category: 'Customer Support Scripts', type: 'SOP', excerpt: '', content: '' }
    showAddArticleModal.value = false
}

function saveDraftTrigger() {
    alert("Draft saved to your workspace.");
    newArticle.value = { title: '', category: 'Customer Support Scripts', type: 'SOP', excerpt: '', content: '' }
    showAddArticleModal.value = false;
}

function printArticle() {
    window.print();
}

function editArticle() {
    newArticle.value = {
        title: selectedArticle.value.title,
        category: selectedArticleCat.value.title,
        type: selectedArticle.value.type || 'SOP',
        excerpt: selectedArticle.value.excerpt,
        content: selectedArticle.value.content
    }
    showArticleModal.value = false;
    showAddArticleModal.value = true;
}

function unpublishArticle() {
    if (selectedArticle.value) {
        selectedArticle.value.type = 'Draft';
        selectedArticle.value.typeIcon = 'edit_document';
        alert(`"${selectedArticle.value.title}" has been moved to Drafts.`);
        showArticleModal.value = false;
    }
}

function deleteArticle() {
    if (confirm(`Are you sure you want to permanently delete "${selectedArticle.value.title}"?`)) {
        if (selectedArticleCat.value) {
            const index = selectedArticleCat.value.articles.findIndex(a => a.title === selectedArticle.value.title);
            if (index > -1) {
                selectedArticleCat.value.articles.splice(index, 1);
            }
        }
        showArticleModal.value = false;
    }
}

function scrollToSection(id) {
    const el = document.getElementById(id);
    const container = document.getElementById('article-main-content');
    if (el && container) {
        // Subtract a little offset for breathing room at the top
        container.scrollTo({
            top: el.offsetTop - 40,
            behavior: 'smooth'
        });
    }
}
</script>

<style scoped>
/* Tooltip styling */
.tooltip-trigger .tooltip {
    @apply absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-gray-900 text-white text-[10px] rounded opacity-0 whitespace-nowrap pointer-events-none transition-opacity;
    z-index: 1000;
}

.tooltip-trigger:hover .tooltip {
    @apply opacity-100;
}
</style>