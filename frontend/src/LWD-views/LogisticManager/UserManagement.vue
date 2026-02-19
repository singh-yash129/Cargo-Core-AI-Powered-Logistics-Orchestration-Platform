<template>
    <div class="space-y-6">
        <div class="flex justify-between items-center">
            <h2 class="text-2xl font-bold text-white">User & Role Management</h2>
            <button
                class="bg-primary hover:bg-primary-dark text-background-dark font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors">
                <span class="material-symbols-outlined">person_add</span>
                Invite User
            </button>
        </div>

        <!-- Role Filter Tabs -->
        <div class="flex gap-4 border-b border-white/10 pb-1">
            <button v-for="tab in tabs" :key="tab" class="px-4 py-2 text-sm font-medium transition-colors relative"
                :class="activeTab === tab ? 'text-primary' : 'text-gray-400 hover:text-white'" @click="activeTab = tab">
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
                    class="bg-white/5 rounded-xl p-5 border border-white/5 hover:border-primary/30 transition-all group relative">
                    <div class="absolute top-4 right-4 text-gray-500 hover:text-white cursor-pointer"><span
                            class="material-symbols-outlined">more_vert</span></div>

                    <div class="flex items-center gap-4 mb-4">
                        <img :src="user.avatar" class="w-14 h-14 rounded-full border-2 border-card-dark">
                        <div>
                            <div class="font-bold text-white text-lg">{{ user.name }}</div>
                            <div class="text-xs text-gray-400">{{ user.email }}</div>
                        </div>
                    </div>

                    <div class="flex gap-2 mb-4">
                        <span
                            class="px-2 py-1 rounded bg-blue-500/10 text-blue-400 text-xs font-bold border border-blue-500/20">{{
                                user.role }}</span>
                        <span v-if="user.status === 'Active'"
                            class="px-2 py-1 rounded bg-green-500/10 text-green-400 text-xs font-bold border border-green-500/20">Active</span>
                        <span v-else
                            class="px-2 py-1 rounded bg-gray-500/10 text-gray-400 text-xs font-bold border border-gray-500/20">Inactive</span>
                    </div>

                    <div class="pt-4 border-t border-white/5 flex justify-between items-center text-xs text-gray-500">
                        <span>Last Login: {{ user.lastLogin }}</span>
                        <button class="text-primary hover:underline">Edit Access</button>
                    </div>
                </div>

                <!-- Add New Placeholder -->
                <div
                    class="bg-white/5 rounded-xl p-5 border border-white/5 border-dashed flex flex-col items-center justify-center text-gray-500 hover:bg-white/10 hover:text-white hover:border-white/20 transition-all cursor-pointer min-h-[200px]">
                    <span class="material-symbols-outlined text-4xl mb-2">add_circle</span>
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
