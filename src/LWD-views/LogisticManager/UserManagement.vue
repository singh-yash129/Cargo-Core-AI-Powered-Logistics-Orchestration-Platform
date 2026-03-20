<template>
    <div class="space-y-6">
        <div class="flex justify-between items-center">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white">User & Role Management</h2>
            <button @click="openModal('create')"
                class="bg-slate-900 hover:bg-slate-800 dark:bg-primary dark:hover:bg-primary/90 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors shadow-lg border border-slate-700 dark:border-primary/30">
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
                    <div class="flex items-start justify-between gap-3 mb-4">
                        <div class="flex items-center gap-4 min-w-0 flex-1">
                            <img :src="user.avatar"
                                class="w-14 h-14 rounded-full border-2 border-white dark:border-card-dark shadow-sm shrink-0">
                            <div class="min-w-0 flex-1">
                                <div
                                    class="font-bold text-gray-900 dark:text-white text-lg leading-tight flex items-center gap-1.5 min-w-0">
                                    <span class="truncate">{{ user.name }}</span>
                                    <span v-if="user.mobileVerified && user.emailVerified"
                                        class="text-green-500 material-symbols-outlined text-[18px] shrink-0"
                                        title="Fully Verified">verified</span>
                                </div>
                                <div class="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5 min-w-0">
                                    <span class="material-symbols-outlined text-[14px] shrink-0">mail</span>
                                    <span class="truncate">{{ user.email }}</span>
                                    <span v-if="user.emailVerified"
                                        class="material-symbols-outlined text-[14px] text-green-500 shrink-0"
                                        title="Email Verified">check_circle</span>
                                    <span v-else
                                        class="text-[10px] bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider shrink-0">Unverified</span>
                                </div>
                                <div v-if="user.mobile"
                                    class="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5 min-w-0">
                                    <span class="material-symbols-outlined text-[14px] shrink-0">call</span>
                                    <span class="truncate">{{ user.mobile }}</span>
                                    <span v-if="user.mobileVerified"
                                        class="material-symbols-outlined text-[14px] text-green-500 shrink-0"
                                        title="Mobile Verified">check_circle</span>
                                    <span v-else
                                        class="text-[10px] bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider shrink-0">Unverified</span>
                                </div>
                            </div>
                        </div>
                        <div class="relative shrink-0 flex items-center gap-1 self-start" @click.stop>
                            <button v-if="user.username" @click="openCreds(user)"
                                class="text-gray-400 hover:text-primary transition-colors p-1 rounded-full hover:bg-gray-100 dark:hover:bg-white/10"
                                title="View Credentials">
                                <span class="material-symbols-outlined text-[20px]">visibility</span>
                            </button>
                            <button @click="toggleDropdown(user.email)"
                                class="text-gray-400 hover:text-gray-900 dark:text-gray-500 dark:hover:text-white cursor-pointer transition-colors p-1 rounded-full hover:bg-gray-100 dark:hover:bg-white/10">
                                <span class="material-symbols-outlined">more_vert</span>
                            </button>

                            <div v-if="activeDropdown === user.email"
                                class="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-card-dark border border-gray-200 dark:border-white/10 rounded-xl shadow-lg z-10 py-1 overflow-hidden">
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

                <!-- Add Support Card (Moved to the end) -->
                <div v-if="activeTab === 'Support'" @click="openModal('create-support')"
                    class="bg-gray-50/50 dark:bg-white/5 border-2 border-dashed border-gray-300 dark:border-white/20 rounded-xl p-5 hover:border-primary/50 dark:hover:border-primary/50 hover:bg-primary/5 dark:hover:bg-primary/10 transition-all cursor-pointer flex flex-col items-center justify-center min-h-[160px] text-gray-500 dark:text-gray-400 hover:text-primary group">
                    <div
                        class="w-12 h-12 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                        <span class="material-symbols-outlined text-[24px]">person_add</span>
                    </div>
                    <span class="font-medium">Add Customer Support</span>
                </div>

                <!-- Add Driver Card -->
                <div v-if="activeTab === 'Drivers'" @click="openModal('create-driver')"
                    class="bg-gray-50/50 dark:bg-white/5 border-2 border-dashed border-gray-300 dark:border-white/20 rounded-xl p-5 hover:border-primary/50 dark:hover:border-primary/50 hover:bg-primary/5 dark:hover:bg-primary/10 transition-all cursor-pointer flex flex-col items-center justify-center min-h-[160px] text-gray-500 dark:text-gray-400 hover:text-primary group">
                    <div
                        class="w-12 h-12 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                        <span class="material-symbols-outlined text-[24px]">local_shipping</span>
                    </div>
                    <span class="font-medium">Add Driver</span>
                </div>
            </div>

            <!-- User Form Modal -->
            <Teleport to="body">
                <div v-if="isModalOpen"
                    class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                    @click.self="closeModal">
                    <div
                        class="bg-slate-950/98 w-full max-w-4xl rounded-2xl shadow-2xl border border-white/10 overflow-visible flex flex-col backdrop-blur-xl">
                        <!-- Header -->
                        <div
                            class="px-6 py-4 border-b border-white/10 flex justify-between items-center bg-slate-900/90">
                            <h3 class="text-lg font-bold text-white">
                                {{ modalMode === 'create' ? 'Create Manager / Dispatcher' :
                                    (modalMode === 'create-support' ? 'Create Customer Support' :
                                        (modalMode === 'create-driver' ? 'Create Driver Profile' :
                                            (modalMode === 'edit-profile' ? `Edit Profile: ${formData.role || 'User'}` :
                                                `Edit Access: ${formData.role || 'User'}`))) }}
                            </h3>
                            <button @click="closeModal"
                                class="text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors">
                                <span class="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <!-- Body / Form -->
                        <div class="p-6 overflow-y-auto overflow-x-visible space-y-4 max-h-[78vh] bg-slate-950/95">

                            <!-- === CREATE MODE: Strict Form === -->
                            <template v-if="modalMode === 'create'">
                                <!-- Role & Hub -->
                                <div class="grid grid-cols-1 gap-4 md:grid-cols-2 md:items-start">
                                    <div>
                                        <label
                                            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
                                        <div class="relative">
                                            <select v-model="formData.role"
                                                class="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary/50 transition-colors appearance-none">
                                                <option value="Warehouse Manager"
                                                    class="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                                                    Warehouse Manager</option>
                                                <option value="Dispatcher"
                                                    class="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                                                    Dispatcher</option>
                                            </select>
                                            <span
                                                class="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">arrow_drop_down</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label
                                            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Hub
                                            Assignment</label>
                                        <div class="relative z-30">
                                            <button type="button" @click.stop="toggleHubMenu"
                                                class="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-left text-white focus:outline-none focus:border-primary/50 transition-colors flex items-center justify-between gap-3"
                                                :class="isHubMenuOpen ? 'ring-2 ring-primary/40 border-primary/40' : ''">
                                                <span class="truncate">{{ selectedHubLabel }}</span>
                                                <span
                                                    class="material-symbols-outlined text-gray-400 transition-transform"
                                                    :class="isHubMenuOpen ? 'rotate-180' : ''">arrow_drop_down</span>
                                            </button>

                                            <div v-if="isHubMenuOpen"
                                                class="absolute left-0 right-0 top-full mt-2 rounded-xl border border-white/10 bg-slate-900 shadow-2xl overflow-hidden z-40">
                                                <div class="max-h-56 overflow-y-auto py-2">
                                                    <button v-for="h in store.hubs" :key="h.id" type="button"
                                                        @click.stop="selectHub(h.id)"
                                                        class="w-full px-4 py-3 text-left text-sm transition-colors flex items-center justify-between gap-3 hover:bg-white/5"
                                                        :class="formData.hubId === h.id ? 'bg-primary/10 text-white' : 'text-gray-300'">
                                                        <span class="truncate">{{ h.name }}</span>
                                                        <span v-if="formData.hubId === h.id"
                                                            class="material-symbols-outlined text-primary text-[18px]">check</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div class="bg-slate-900/70 p-4 rounded-xl border border-white/10 space-y-4 shadow-sm">
                                    <h4
                                        class="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                                        <div
                                            class="w-6 h-6 rounded bg-primary/10 text-primary flex items-center justify-center">
                                            <span class="material-symbols-outlined text-[14px]">key</span>
                                        </div>
                                        Login Credentials
                                    </h4>
                                    <div class="grid grid-cols-2 gap-4 mt-3">
                                        <div class="col-span-2 md:col-span-1">
                                            <label
                                                class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 uppercase tracking-wider">Username</label>
                                            <input v-model="formData.username" type="text" placeholder="e.g. hub_north_manager"
                                                class="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2.5 text-[13px] text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium font-mono">
                                        </div>
                                        <div class="col-span-2 md:col-span-1">
                                            <label
                                                class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 uppercase tracking-wider">Password</label>
                                            <input v-model="formData.password" type="text" placeholder="Minimum 8 characters"
                                                class="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2.5 text-[13px] text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium font-mono">
                                        </div>
                                        <p class="col-span-2 text-xs text-gray-400">
                                            The Warehouse Manager or Dispatcher will use this username and password to log in to their dashboard.
                                        </p>
                                    </div>
                                </div>
                            </template>

                            <!-- === CREATE SUPPORT MODE === -->
                            <template v-else-if="modalMode === 'create-support'">
                                <!-- Role & Hub -->
                                <div class="grid grid-cols-2 gap-4">
                                    <div>
                                        <label
                                            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
                                        <input value="Customer Support" type="text" disabled
                                            class="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2 text-white opacity-60 cursor-not-allowed">
                                    </div>
                                    <div>
                                        <label
                                            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Hub
                                            Assignment</label>
                                        <div class="relative">
                                            <select v-model="formData.hubId"
                                                class="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary/50 transition-colors appearance-none">
                                                <option value="all"
                                                    class="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                                                    Global (All Warehouses)</option>
                                                <option v-for="h in store.hubs" :key="h.id" :value="h.id"
                                                    class="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                                                    {{
                                                        h.name }}
                                                </option>
                                            </select>
                                            <span
                                                class="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">arrow_drop_down</span>
                                        </div>
                                    </div>
                                </div>
                            </template>

                            <!-- Common Fields for Creation (shared by Manager/Dispatcher and Support) -->
                            <!-- === UNIFIED FORM TABS OR SECTIONS === -->
                            <template
                                v-if="['create', 'create-support', 'create-driver', 'edit-profile'].includes(modalMode)">

                                <!-- Personal Details Section -->
                                <div
                                    class="bg-slate-900/70 p-4 rounded-xl border border-white/10 space-y-4 shadow-sm relative overflow-hidden group">
                                    <div
                                        class="absolute -left-10 -top-10 w-32 h-32 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors pointer-events-none">
                                    </div>
                                    <h4
                                        class="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2 relative z-10">
                                        <div
                                            class="w-6 h-6 rounded bg-primary/10 text-primary flex items-center justify-center">
                                            <span class="material-symbols-outlined text-[14px]">person</span>
                                        </div>
                                        Personal Details
                                    </h4>
                                    <div class="grid grid-cols-2 gap-4 relative z-10 mt-3">
                                        <div class="col-span-2 md:col-span-1">
                                            <label
                                                class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 uppercase tracking-wider">Full
                                                Name</label>
                                            <input v-model="formData.name" type="text" placeholder="e.g. John Doe"
                                                class="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2.5 text-[13px] text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium">
                                        </div>
                                        <div class="col-span-2 md:col-span-1">
                                            <label
                                                class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 uppercase tracking-wider">Date
                                                of Birth</label>
                                            <input v-model="formData.dob" type="date"
                                                class="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2.5 text-[13px] text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium">
                                        </div>
                                        <div class="col-span-2 md:col-span-1">
                                            <label class="flex justify-between items-center mb-1">
                                                <span
                                                    class="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Email
                                                    Address</span>
                                                <button v-if="formData.email && !formData.emailVerified"
                                                    @click.prevent="openOtpModal('email')"
                                                    class="text-[9px] bg-primary/10 text-primary px-2 py-0.5 rounded shadow-sm hover:bg-primary hover:text-white transition-colors uppercase font-bold tracking-wider">Verify</button>
                                                <span v-if="formData.emailVerified"
                                                    class="text-[9px] bg-green-500/10 text-green-600 dark:text-green-400 px-2 py-0.5 rounded uppercase font-bold tracking-wider flex items-center gap-1"><span
                                                        class="material-symbols-outlined text-[10px]">check_circle</span>
                                                    Verified</span>
                                            </label>
                                            <input v-model="formData.email" type="email"
                                                placeholder="john@cargocore.com"
                                                :disabled="modalMode === 'edit-profile'"
                                                class="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2.5 text-[13px] text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium disabled:opacity-60 disabled:cursor-not-allowed">
                                        </div>
                                        <div class="col-span-2 md:col-span-1">
                                            <label class="flex justify-between items-center mb-1">
                                                <span
                                                    class="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Mobile
                                                    Number</span>
                                                <button v-if="formData.mobile && !formData.mobileVerified"
                                                    @click.prevent="openOtpModal('mobile')"
                                                    class="text-[9px] bg-primary/10 text-primary px-2 py-0.5 rounded shadow-sm hover:bg-primary hover:text-white transition-colors uppercase font-bold tracking-wider">Verify</button>
                                                <span v-if="formData.mobileVerified"
                                                    class="text-[9px] bg-green-500/10 text-green-600 dark:text-green-400 px-2 py-0.5 rounded uppercase font-bold tracking-wider flex items-center gap-1"><span
                                                        class="material-symbols-outlined text-[10px]">check_circle</span>
                                                    Verified</span>
                                            </label>
                                            <input v-model="formData.mobile" @input="formatField('mobile')" type="tel"
                                                placeholder="+91 0000000000"
                                                class="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2.5 text-[13px] text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium tracking-wide">
                                        </div>
                                        <div class="col-span-2 md:col-span-1">
                                            <label
                                                class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 uppercase tracking-wider">Blood
                                                Group</label>
                                            <div class="relative items-center">
                                                <select v-model="formData.bloodGroup"
                                                    class="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2.5 text-[13px] text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium appearance-none">
                                                    <option
                                                        v-for="bg in ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']"
                                                        :key="bg" :value="bg"
                                                        class="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                                                        {{ bg }}</option>
                                                </select>
                                                <span
                                                    class="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-[18px]">expand_more</span>
                                            </div>
                                        </div>
                                        <div class="col-span-2 md:col-span-1">
                                            <label
                                                class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 uppercase tracking-wider">Emergency
                                                Contact</label>
                                            <input v-model="formData.emergencyContact"
                                                @input="formatField('emergencyContact')" type="tel"
                                                placeholder="+91 0000000000"
                                                class="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2.5 text-[13px] text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium tracking-wide">
                                        </div>
                                    </div>
                                </div>

                                <!-- Contact & Address Section -->
                                <div
                                    class="bg-slate-900/70 p-4 rounded-xl border border-white/10 space-y-4 shadow-sm relative overflow-hidden group">
                                    <h4
                                        class="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2 relative z-10">
                                        <div
                                            class="w-6 h-6 rounded bg-primary/10 text-primary flex items-center justify-center">
                                            <span class="material-symbols-outlined text-[14px]">home_pin</span>
                                        </div>
                                        Address Details
                                    </h4>
                                    <div class="grid grid-cols-2 gap-4 relative z-10 mt-3">
                                        <div class="col-span-2">
                                            <label
                                                class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 uppercase tracking-wider">Street
                                                Address</label>
                                            <input v-model="formData.address" type="text"
                                                placeholder="123 Main St, Apt 4"
                                                class="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2.5 text-[13px] text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium">
                                        </div>
                                        <div class="col-span-2 md:col-span-1">
                                            <label
                                                class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 uppercase tracking-wider">City</label>
                                            <input v-model="formData.city" type="text" placeholder="City"
                                                class="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2.5 text-[13px] text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium">
                                        </div>
                                        <div class="col-span-2 md:col-span-1">
                                            <label
                                                class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 uppercase tracking-wider">State
                                                / Province</label>
                                            <input v-model="formData.state" type="text" placeholder="State"
                                                class="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2.5 text-[13px] text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium">
                                        </div>
                                        <div class="col-span-2 md:col-span-1">
                                            <label
                                                class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 uppercase tracking-wider">Pincode
                                                / ZIP</label>
                                            <input v-model="formData.pincode" type="text" placeholder="000000"
                                                class="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2.5 text-[13px] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium tracking-wide font-mono">
                                        </div>
                                    </div>
                                </div>

                                <!-- Identification & Banking Section -->
                                <div
                                    class="bg-slate-900/70 p-4 rounded-xl border border-white/10 space-y-4 shadow-sm relative overflow-hidden group">
                                    <h4
                                        class="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2 relative z-10">
                                        <div
                                            class="w-6 h-6 rounded bg-primary/10 text-primary flex items-center justify-center">
                                            <span class="material-symbols-outlined text-[14px]">account_balance</span>
                                        </div>
                                        Identification
                                    </h4>
                                    <div class="grid grid-cols-2 gap-4 relative z-10 mt-3">
                                        <div class="col-span-2 md:col-span-1">
                                            <label
                                                class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 uppercase tracking-wider">Aadhar
                                                / ID Number</label>
                                            <input v-model="formData.aadharCard" @input="formatField('aadharCard')"
                                                type="text" placeholder="XXXX-XXXX-XXXX"
                                                class="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2.5 text-[13px] text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium uppercase font-mono tracking-wider">
                                        </div>
                                        <div class="col-span-2 md:col-span-1">
                                            <label
                                                class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 uppercase tracking-wider">PAN
                                                Number</label>
                                            <input v-model="formData.panCard" @input="formatField('panCard')"
                                                type="text" placeholder="ABCDE1234F"
                                                class="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2.5 text-[13px] text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium uppercase font-mono tracking-wider">
                                        </div>
                                        <div class="col-span-2 md:col-span-1">
                                            <label
                                                class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 uppercase tracking-wider">Bank
                                                Account</label>
                                            <input v-model="formData.bankAccount" @input="formatField('bankAccount')"
                                                type="text" placeholder="000011112222"
                                                class="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2.5 text-[13px] text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium font-mono tracking-wider">
                                        </div>
                                        <div class="col-span-2 md:col-span-1">
                                            <label
                                                class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 uppercase tracking-wider">IFSC
                                                Code</label>
                                            <input v-model="formData.ifscCode" @input="formatField('ifscCode')"
                                                type="text" placeholder="BANK0001234"
                                                class="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2.5 text-[13px] text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium uppercase font-mono tracking-wider">
                                        </div>
                                    </div>
                                </div>
                            </template>

                            <!-- === EDIT ACCESS MODE === -->
                            <template v-else>
                                <div class="grid grid-cols-2 gap-4">
                                    <div>
                                        <label
                                            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full
                                            Name</label>
                                        <input :value="formData.name" type="text" disabled
                                            class="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2 text-white opacity-60 cursor-not-allowed">
                                    </div>
                                    <div>
                                        <label
                                            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email
                                            Address</label>
                                        <input :value="formData.email" type="email" disabled
                                            class="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2 text-white opacity-60 cursor-not-allowed">
                                    </div>
                                </div>

                                <div class="h-px bg-gray-200 dark:bg-white/10 my-4"></div>

                                <!-- Editable Role & Hub -->
                                <div class="grid grid-cols-2 gap-4">
                                    <div>
                                        <label
                                            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role
                                            Update</label>
                                        <div class="relative">
                                            <select v-model="formData.role"
                                                class="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary/50 transition-colors appearance-none">
                                                <option v-for="r in roles" :key="r" :value="r"
                                                    class="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                                                    {{ r
                                                    }}</option>
                                            </select>
                                            <span
                                                class="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">arrow_drop_down</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label
                                            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Hub
                                            Relocation</label>
                                        <div class="relative">
                                            <select v-model="formData.hubId"
                                                class="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary/50 transition-colors appearance-none">
                                                <option value="all"
                                                    class="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                                                    Global (All Warehouses)</option>
                                                <option v-for="h in store.hubs" :key="h.id" :value="h.id"
                                                    class="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                                                    {{
                                                        h.name }}
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
                                                class="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary/50 transition-colors appearance-none">
                                                <option v-for="s in statuses" :key="s" :value="s"
                                                    class="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                                                    {{ s
                                                    }}</option>
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
                            class="px-6 py-4 border-t border-white/10 flex justify-end gap-3 bg-slate-900/90">
                            <button @click="closeModal"
                                class="px-4 py-2 rounded-lg font-medium text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 dark:bg-white/10 dark:border-white/10 dark:text-gray-200 dark:hover:bg-white/15 transition-colors shadow-sm">
                                Cancel
                            </button>
                            <button @click="submitForm"
                                class="px-4 py-2 rounded-lg font-medium text-white bg-primary hover:bg-primary/90 transition-colors shadow-sm">
                                {{ modalMode === 'create' || modalMode === 'create-support' || modalMode ===
                                    'create-driver' ? 'Add User' :
                                    'Save Changes' }}
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
                        class="bg-slate-950/98 w-full max-w-sm rounded-2xl shadow-2xl border border-white/10 overflow-hidden flex flex-col relative items-center p-6 backdrop-blur-xl">
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
                            <h4 class="text-xs font-bold text-primary uppercase tracking-wider mb-3">System Credentials
                            </h4>
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
                                        class="text-sm font-mono text-white bg-slate-800 px-3 py-1.5 rounded border border-white/10">
                                        {{ isCredentialsVisible ? viewingUserCreds.username : '********' }}
                                    </div>
                                </div>
                                <div>
                                    <label
                                        class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Password</label>
                                    <div
                                        class="text-sm font-mono text-white bg-slate-800 px-3 py-1.5 rounded border border-white/10">
                                        {{ isCredentialsVisible ? (viewingUserCreds.password || 'Only available on the device that created this account') : '********' }}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Teleport>


            <!-- OTP Verification Modal -->
            <Teleport to="body">
                <div v-if="isOtpModalOpen"
                    class="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    @click.self="isOtpModalOpen = false">
                    <div
                        class="bg-slate-950/98 w-full max-w-sm rounded-2xl shadow-2xl border border-white/10 overflow-hidden text-center p-6 relative backdrop-blur-xl">
                        <button @click="isOtpModalOpen = false"
                            class="absolute top-4 right-4 text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors">
                            <span class="material-symbols-outlined">close</span>
                        </button>

                        <div
                            class="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
                            <span class="material-symbols-outlined text-[32px]">dialpad</span>
                        </div>

                        <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">Verify {{ otpField === 'email'
                            ?
                            'Email Address' : 'Mobile Number' }}</h3>
                        <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">
                            Enter the 4-digit verification code sent to <br />
                            <span class="font-bold text-gray-900 dark:text-white">
                                {{ otpField === 'email' ? formData.email : formData.mobile }}</span>
                        </p>

                        <input v-model="otpValue" type="text" maxlength="4" placeholder="••••" @keyup.enter="verifyOtp"
                            class="w-32 bg-slate-800 text-center text-3xl tracking-widest border border-white/10 rounded-lg px-4 py-3 mx-auto text-white focus:outline-none focus:border-primary/50 transition-colors mb-2 font-mono">

                        <p v-if="otpError" class="text-xs text-red-500 font-medium mb-4">{{ otpError }}</p>
                        <p v-else class="text-xs text-gray-500 mb-4 tracking-wider">Hint: User 1234 to simulate success
                        </p>
                        <button @click="verifyOtp"
                            class="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-lg transition-colors">
                            Verify Code
                        </button>
                    </div>
                </div>
            </Teleport>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useLogisticStore } from '@/stores/logisticStore'
import { storeToRefs } from 'pinia'
import { useToast } from '@/composables/useToast'

const store = useLogisticStore()
const { filteredUsers } = storeToRefs(store)
const toast = useToast()

const activeTab = ref('All Users')
const tabs = ['All Users', 'Managers', 'Dispatchers', 'Drivers', 'Support']

const displayedUsers = computed(() => {
    let list = filteredUsers.value

    if (activeTab.value !== 'All Users') {
        list = list.filter(u => {
            if (activeTab.value === 'Managers') return u.role.includes('Manager')
            if (activeTab.value === 'Dispatchers') return u.role.includes('Dispatcher')
            if (activeTab.value === 'Drivers') return u.role.includes('Driver')
            if (activeTab.value === 'Support') return u.role.includes('Support')
            return true
        })
    }

    return list
})

// --- Dropdown Management ---
import { onMounted, onUnmounted } from 'vue'

const activeDropdown = ref(null)
const isHubMenuOpen = ref(false)

const toggleDropdown = (email) => {
    activeDropdown.value = activeDropdown.value === email ? null : email
}

const closeDropdowns = () => {
    activeDropdown.value = null
    isHubMenuOpen.value = false
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
    ifscCode: { label: 'IFSC / Routing Code', type: 'text', placeholder: 'BANK0001234' },
    address: { label: 'Address', type: 'text', placeholder: '123 Main St' },
    city: { label: 'City', type: 'text', placeholder: 'e.g. Austin' },
    state: { label: 'State', type: 'text', placeholder: 'e.g. TX' },
    pincode: { label: 'Pincode / ZIP', type: 'text', placeholder: '00000' },
    emergencyContact: { label: 'Emergency Contact', type: 'tel', placeholder: '+1 000-0000' },
    bloodGroup: { label: 'Blood Group', type: 'text', placeholder: 'O+' },
    dateOfJoining: { label: 'Date of Joining', type: 'date', placeholder: '' }
}

// OTP State
const isOtpModalOpen = ref(false)
const otpField = ref('') // 'mobile' or 'email'
const otpValue = ref('')
const otpError = ref('')

const openOtpModal = (field) => {
    otpField.value = field
    otpValue.value = ''
    otpError.value = ''
    isOtpModalOpen.value = true
}

const verifyOtp = () => {
    if (otpValue.value === '1234') {
        if (otpField.value === 'mobile') formData.value.mobileVerified = true
        if (otpField.value === 'email') formData.value.emailVerified = true
        isOtpModalOpen.value = false
    } else {
        otpError.value = 'Invalid OTP. Use 1234.'
    }
}

const formData = ref({})
const unlockedFields = ref({})

const initEmptyForm = (mode) => {
    if (mode === 'create') {
        formData.value = {
            role: 'Warehouse Manager',
            status: 'Active',
            hubId: store.hubs.length > 0 ? store.hubs[0].id : null,
            username: '',
            password: '',
            mobileVerified: false,
            emailVerified: false
        }
    } else if (mode === 'create-support') {
        formData.value = {
            role: 'Customer Support',
            status: 'Active',
            hubId: 'all', // Customer Support can be global
            username: '',
            password: '',
            mobileVerified: false,
            emailVerified: false
        }
    } else if (mode === 'create-driver') {
        formData.value = {
            role: 'Driver',
            status: 'Active',
            hubId: store.hubs.length > 0 ? store.hubs[0].id : null,
            username: '',
            password: '',
            mobileVerified: false,
            emailVerified: false
        }
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
    } else if (key === 'mobile' || key === 'emergencyContact') {
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

const roles = ['Warehouse Manager', 'Dispatcher', 'Driver', 'Customer Support']
const statuses = ['Active', 'Inactive']
const selectedHubLabel = computed(() => {
    const selectedHub = store.hubs.find((hub) => hub.id === formData.value.hubId)
    return selectedHub?.name || 'Select a hub'
})

const toggleHubMenu = () => {
    isHubMenuOpen.value = !isHubMenuOpen.value
}

const selectHub = (hubId) => {
    formData.value.hubId = hubId
    isHubMenuOpen.value = false
}

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
    isHubMenuOpen.value = false

    if (mode === 'edit-profile' || mode === 'edit-access') {
        formData.value = {
            ...user,
            mobileVerified: user.mobileVerified ?? true, // mock existing users as verified
            emailVerified: user.emailVerified ?? true
        } // copy data

    } else {
        initEmptyForm(mode) // Pass mode to initEmptyForm
    }
    isModalOpen.value = true
}

const closeModal = () => {
    isModalOpen.value = false
    isHubMenuOpen.value = false
}

const submitForm = async () => {
    try {
        if (modalMode.value === 'create') {
            if (!formData.value.username?.trim()) {
                toast.error('Username is required for Manager and Dispatcher accounts.')
                return
            }
            if (!formData.value.password || formData.value.password.length < 8) {
                toast.error('Password must be at least 8 characters long.')
                return
            }
        }

        if (modalMode.value === 'create' || modalMode.value === 'create-support' || modalMode.value === 'create-driver') {
            await store.addUser({
                ...formData.value,
                lastLogin: 'Never',
            })
            toast.success(`${formData.value.role} account created successfully.`)
        } else {
            await store.updateUser(formData.value.email, { ...formData.value })
            toast.success('User details updated successfully.')
        }
        closeModal()
    } catch (error) {
        toast.error(error.message || 'Unable to save the user right now.')
    }
}
</script>
