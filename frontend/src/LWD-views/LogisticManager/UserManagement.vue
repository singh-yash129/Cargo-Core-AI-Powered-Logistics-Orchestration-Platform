<template>
    <div class="space-y-6">
        <div class="flex justify-between items-center">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white">User & Role Management</h2>
            <button
                class="bg-primary hover:bg-primary/90 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors shadow-sm">
                <span class="material-symbols-outlined">person_add</span>
                Invite User
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
                <div v-for="user in users" :key="user.email"
                    class="bg-gray-50 dark:bg-white/5 rounded-xl p-5 border border-gray-200 dark:border-white/5 hover:border-primary/50 dark:hover:border-primary/30 transition-all group relative shadow-sm">
                    <div
                        class="absolute top-4 right-4 text-gray-400 hover:text-gray-900 dark:text-gray-500 dark:hover:text-white cursor-pointer transition-colors">
                        <span class="material-symbols-outlined">more_vert</span></div>

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
                        <button class="text-primary hover:text-primary/80 transition-colors hover:underline">Edit
                            Access</button>
                    </div>
                </div>

                <!-- Add New Placeholder -->
                <div
                    class="bg-gray-50 dark:bg-white/5 rounded-xl p-5 border-2 border-gray-200 dark:border-white/5 border-dashed flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 hover:bg-gray-100 hover:text-gray-900 hover:border-gray-300 dark:hover:bg-white/10 dark:hover:text-white dark:hover:border-white/20 transition-all cursor-pointer min-h-[200px] shadow-sm">
                    <span
                        class="material-symbols-outlined text-4xl mb-2 transition-transform group-hover:scale-110">add_circle</span>
                    <span class="text-sm font-medium">Add New User</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'

const activeTab = ref('All Users')
const tabs = ['All Users', 'Managers', 'Dispatchers', 'Drivers', 'Admins']

const users = ref([
    { name: 'Sarah Connor', email: 'sarah.c@cargocore.com', role: 'Logistic Manager', status: 'Active', lastLogin: '2 mins ago', avatar: 'https://i.pravatar.cc/150?u=5' },
    { name: 'John Wick', email: 'john.w@cargocore.com', role: 'Dispatcher', status: 'Active', lastLogin: '1 hour ago', avatar: 'https://i.pravatar.cc/150?u=8' },
    { name: 'Ellen Ripley', email: 'ellen.r@cargocore.com', role: 'Warehouse Manager', status: 'Inactive', lastLogin: '2 days ago', avatar: 'https://i.pravatar.cc/150?u=9' },
    { name: 'Marty McFly', email: 'marty.m@cargocore.com', role: 'Driver', status: 'Active', lastLogin: 'Just now', avatar: 'https://i.pravatar.cc/150?u=12' },
])
</script>
