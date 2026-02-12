<template>
    <div class="space-y-6">
        <div class="flex justify-between items-center">
            <h2 class="text-2xl font-bold text-white">Labor Management</h2>
            <button
                class="bg-primary hover:bg-primary-dark text-background-dark font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors">
                <span class="material-symbols-outlined">group_add</span>
                Manage Shifts
            </button>
        </div>

        <!-- Overview Stats -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="glass-panel p-6 rounded-xl">
                <div class="text-gray-400 text-sm font-medium">Active Staff</div>
                <div class="text-4xl font-bold text-white mt-2">42</div>
                <div class="text-green-400 text-xs mt-1">Full Attendance</div>
            </div>
            <div class="glass-panel p-6 rounded-xl">
                <div class="text-gray-400 text-sm font-medium">Avg. Productivity</div>
                <div class="text-4xl font-bold text-primary mt-2">115%</div>
                <div class="text-gray-500 text-xs mt-1">Above target</div>
            </div>
            <div class="glass-panel p-6 rounded-xl">
                <div class="text-gray-400 text-sm font-medium">Overtime Hours</div>
                <div class="text-4xl font-bold text-yellow-400 mt-2">12h</div>
                <div class="text-gray-500 text-xs mt-1">This week</div>
            </div>
        </div>

        <!-- Staff List -->
        <div class="glass-panel rounded-xl overflow-hidden">
            <div class="p-6 border-b border-white/5 flex gap-4">
                <input type="text" placeholder="Search staff..."
                    class="flex-1 bg-black/20 border border-white/10 rounded-lg py-2 px-4 text-white focus:outline-none focus:border-primary/50">
                <select class="bg-black/20 border border-white/10 rounded-lg px-4 text-white">
                    <option>All Departments</option>
                    <option>Picking</option>
                    <option>Packing</option>
                    <option>Receiving</option>
                </select>
            </div>

            <table class="w-full text-left text-sm">
                <thead class="bg-white/5 text-gray-400 uppercase">
                    <tr>
                        <th class="p-4">Name</th>
                        <th class="p-4">Role</th>
                        <th class="p-4">Current Task</th>
                        <th class="p-4">Performance</th>
                        <th class="p-4">Status</th>
                        <th class="p-4">Action</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-white/5">
                    <tr v-for="staff in staffList" :key="staff.id" class="hover:bg-white/5 transition-colors">
                        <td class="p-4 flex items-center gap-3">
                            <img :src="staff.avatar" class="w-8 h-8 rounded-full bg-gray-700">
                            <span class="font-bold text-white">{{ staff.name }}</span>
                        </td>
                        <td class="p-4 text-gray-300">{{ staff.role }}</td>
                        <td class="p-4 text-gray-400">{{ staff.task }}</td>
                        <td class="p-4">
                            <div class="flex items-center gap-2">
                                <div class="w-16 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                                    <div class="bg-green-500 h-full" :style="`width: ${staff.perf}%`"></div>
                                </div>
                                <span class="text-xs">{{ staff.perf }}%</span>
                            </div>
                        </td>
                        <td class="p-4">
                            <span class="px-2 py-1 rounded text-[10px] font-bold" :class="staff.statusClass">
                                {{ staff.status }}
                            </span>
                        </td>
                        <td class="p-4 text-gray-500 hover:text-white cursor-pointer"><span
                                class="material-symbols-outlined">more_horiz</span></td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'

const staffList = ref([
    { id: 1, name: 'John Doe', role: 'Picker', task: 'Wave #102', perf: 110, status: 'Active', statusClass: 'bg-green-500/10 text-green-500', avatar: 'https://i.pravatar.cc/150?u=30' },
    { id: 2, name: 'Jane Smith', role: 'Packer', task: 'Station 2', perf: 98, status: 'Active', statusClass: 'bg-green-500/10 text-green-500', avatar: 'https://i.pravatar.cc/150?u=31' },
    { id: 3, name: 'Bob Johnson', role: 'Forklift Op', task: 'Restocking Aisle 4', perf: 85, status: 'Break', statusClass: 'bg-yellow-500/10 text-yellow-500', avatar: 'https://i.pravatar.cc/150?u=32' },
])
</script>
