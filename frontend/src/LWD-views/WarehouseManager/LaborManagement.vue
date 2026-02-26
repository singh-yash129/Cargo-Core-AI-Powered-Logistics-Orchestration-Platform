<template>
    <div class="space-y-6">
        <div class="flex justify-between items-center">
            <h2 class="text-2xl font-bold text-white">Labor Management</h2>
            <div class="flex gap-2">
                <button @click="showAssignModal = true"
                    class="bg-white/5 hover:bg-white/10 text-white border border-white/10 py-2 px-4 rounded-lg transition-colors flex items-center gap-2">
                    <span class="material-symbols-outlined">link</span> Assign to Order
                </button>
                <button
                    class="bg-primary hover:bg-primary-dark text-background-dark font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors">
                    <span class="material-symbols-outlined">group_add</span>
                    Manage Shifts
                </button>
            </div>
        </div>

        <!-- Live Status Board -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="glass-panel p-4 rounded-xl border-l-4 border-green-500 cursor-pointer hover:bg-white/5 transition-colors"
                @click="statusFilter = statusFilter === 'In Warehouse' ? '' : 'In Warehouse'">
                <div class="text-xs text-gray-400 uppercase font-semibold tracking-wide">In Warehouse</div>
                <div class="text-3xl font-bold text-green-400 mt-1">{{ statusCounts.inWarehouse }}</div>
                <div class="flex items-center gap-1 mt-1">
                    <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    <span class="text-xs text-green-400/70">Active on floor</span>
                </div>
            </div>
            <div class="glass-panel p-4 rounded-xl border-l-4 border-blue-500 cursor-pointer hover:bg-white/5 transition-colors"
                @click="statusFilter = statusFilter === 'Assigned to Order' ? '' : 'Assigned to Order'">
                <div class="text-xs text-gray-400 uppercase font-semibold tracking-wide">Assigned to Order</div>
                <div class="text-3xl font-bold text-blue-400 mt-1">{{ statusCounts.assigned }}</div>
                <div class="text-xs text-blue-400/70 mt-1">Working on orders</div>
            </div>
            <div class="glass-panel p-4 rounded-xl border-l-4 border-purple-500 cursor-pointer hover:bg-white/5 transition-colors"
                @click="statusFilter = statusFilter === 'On Field' ? '' : 'On Field'">
                <div class="text-xs text-gray-400 uppercase font-semibold tracking-wide">On Field with Driver</div>
                <div class="text-3xl font-bold text-purple-400 mt-1">{{ statusCounts.onField }}</div>
                <div class="text-xs text-purple-400/70 mt-1">Out for delivery/move</div>
            </div>
            <div class="glass-panel p-4 rounded-xl border-l-4 border-gray-500 cursor-pointer hover:bg-white/5 transition-colors"
                @click="statusFilter = statusFilter === 'Off Duty' ? '' : 'Off Duty'">
                <div class="text-xs text-gray-400 uppercase font-semibold tracking-wide">Off Duty</div>
                <div class="text-3xl font-bold text-gray-400 mt-1">{{ statusCounts.offDuty }}</div>
                <div class="text-xs text-gray-500 mt-1">Shift ended / Break</div>
            </div>
        </div>

        <!-- Performance Summary -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="glass-panel p-6 rounded-xl">
                <div class="text-gray-400 text-sm font-medium">Active Staff</div>
                <div class="text-4xl font-bold text-white mt-2">{{ staffList.length }}</div>
                <div class="text-green-400 text-xs mt-1">Full Roster</div>
            </div>
            <div class="glass-panel p-6 rounded-xl">
                <div class="text-gray-400 text-sm font-medium">Avg. Productivity</div>
                <div class="text-4xl font-bold text-primary mt-2">115%</div>
                <div class="text-gray-500 text-xs mt-1">Above target</div>
            </div>
            <div class="glass-panel p-6 rounded-xl">
                <div class="text-gray-400 text-sm font-medium">Total Hours Logged</div>
                <div class="text-4xl font-bold text-yellow-400 mt-2">{{ totalHours }}h</div>
                <div class="text-gray-500 text-xs mt-1">Today</div>
            </div>
        </div>

        <!-- Staff List -->
        <div class="glass-panel rounded-xl overflow-hidden">
            <div class="p-4 border-b border-white/5 flex gap-4 items-center bg-black/20">
                <input type="text" v-model="searchQuery" placeholder="Search staff..."
                    class="flex-1 bg-black/20 border border-white/10 rounded-lg py-2 px-4 text-white focus:outline-none focus:border-primary/50">
                <select v-model="deptFilter" class="bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white">
                    <option value="">All Departments</option>
                    <option value="Picking">Picking</option>
                    <option value="Packing">Packing</option>
                    <option value="Receiving">Receiving</option>
                    <option value="Loading">Loading</option>
                </select>
                <div v-if="statusFilter"
                    class="flex items-center gap-2 bg-primary/20 text-primary px-3 py-1.5 rounded-lg text-xs font-bold">
                    {{ statusFilter }}
                    <button @click="statusFilter = ''" class="hover:text-white"><span
                            class="material-symbols-outlined text-[14px]">close</span></button>
                </div>
            </div>

            <div class="overflow-auto max-h-[500px]">
                <table class="w-full text-left text-sm">
                    <thead class="bg-white/5 text-gray-400 uppercase sticky top-0">
                        <tr>
                            <th class="p-4">Name</th>
                            <th class="p-4">Role</th>
                            <th class="p-4">Current Task</th>
                            <th class="p-4">Order ID</th>
                            <th class="p-4">Time Log</th>
                            <th class="p-4">Performance</th>
                            <th class="p-4">Status</th>
                            <th class="p-4">Action</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-white/5">
                        <tr v-for="staff in filteredStaff" :key="staff.id" class="hover:bg-white/5 transition-colors">
                            <td class="p-4 flex items-center gap-3">
                                <img :src="staff.avatar" class="w-8 h-8 rounded-full bg-gray-700">
                                <span class="font-bold text-white">{{ staff.name }}</span>
                            </td>
                            <td class="p-4 text-gray-300">{{ staff.role }}</td>
                            <td class="p-4 text-gray-400">{{ staff.task }}</td>
                            <td class="p-4">
                                <span v-if="staff.orderId" class="font-mono text-primary text-xs">{{ staff.orderId
                                    }}</span>
                                <span v-else class="text-gray-600">—</span>
                            </td>
                            <td class="p-4">
                                <div class="text-xs space-y-0.5">
                                    <div class="text-gray-400">In: <span class="text-white font-mono">{{ staff.startTime
                                            }}</span></div>
                                    <div v-if="staff.fieldTime" class="text-purple-400">Field: <span
                                            class="font-mono">{{ staff.fieldTime }}</span></div>
                                    <div v-if="staff.returnTime" class="text-green-400">Return: <span
                                            class="font-mono">{{ staff.returnTime }}</span></div>
                                </div>
                            </td>
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
                            <td class="p-4">
                                <div class="flex gap-1">
                                    <button v-if="staff.status === 'In Warehouse'" @click="openAssign(staff)"
                                        class="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-2 py-1 rounded text-xs font-bold transition-colors"
                                        title="Assign to Order">
                                        <span class="material-symbols-outlined text-[14px]">link</span>
                                    </button>
                                    <button class="text-gray-500 hover:text-white" title="More">
                                        <span class="material-symbols-outlined text-[16px]">more_horiz</span>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Assign to Order Modal -->
        <div v-if="showAssignModal"
            class="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            @click.self="showAssignModal = false">
            <div class="glass-panel rounded-2xl w-full max-w-md border border-white/10">
                <div class="p-6 border-b border-white/5 flex justify-between items-center">
                    <h3 class="font-bold text-white text-lg">Assign Labor to Order</h3>
                    <button @click="showAssignModal = false" class="text-gray-500 hover:text-white"><span
                            class="material-symbols-outlined">close</span></button>
                </div>
                <div class="p-6 space-y-4">
                    <div v-if="assignTarget">
                        <div class="text-xs text-gray-400 mb-1">Selected Worker</div>
                        <div class="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/5">
                            <img :src="assignTarget.avatar" class="w-8 h-8 rounded-full">
                            <div>
                                <div class="text-sm font-bold text-white">{{ assignTarget.name }}</div>
                                <div class="text-xs text-gray-500">{{ assignTarget.role }}</div>
                            </div>
                        </div>
                    </div>
                    <div>
                        <label class="text-xs text-gray-400 mb-1 block">Order ID</label>
                        <input type="text" v-model="assignOrderId" placeholder="ORD-XXXXX"
                            class="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-primary/50 font-mono" />
                    </div>
                    <div>
                        <label class="text-xs text-gray-400 mb-1 block">Assignment Type</label>
                        <select
                            class="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-primary/50">
                            <option>Picking</option>
                            <option>Packing</option>
                            <option>Loading</option>
                            <option>Field Duty (With Driver)</option>
                        </select>
                    </div>
                    <div
                        class="flex items-center gap-2 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20 text-xs text-blue-400">
                        <span class="material-symbols-outlined text-[16px]">info</span>
                        Seat compatibility will be verified by Dispatcher before dispatch.
                    </div>
                    <button @click="assignWorker"
                        class="w-full bg-primary hover:bg-primary-dark text-background-dark font-bold py-3 rounded-lg transition-colors">
                        Assign to Order
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const searchQuery = ref('')
const deptFilter = ref('')
const statusFilter = ref('')
const showAssignModal = ref(false)
const assignTarget = ref(null)
const assignOrderId = ref('')

const staffList = ref([
    { id: 1, name: 'John Doe', role: 'Picker', task: 'Wave #102', orderId: 'ORD-20258', perf: 110, status: 'Assigned to Order', statusClass: 'bg-blue-500/10 text-blue-500', avatar: 'https://i.pravatar.cc/150?u=30', startTime: '07:00', fieldTime: null, returnTime: null, dept: 'Picking' },
    { id: 2, name: 'Jane Smith', role: 'Packer', task: 'Station 2', orderId: null, perf: 98, status: 'In Warehouse', statusClass: 'bg-green-500/10 text-green-500', avatar: 'https://i.pravatar.cc/150?u=31', startTime: '07:30', fieldTime: null, returnTime: null, dept: 'Packing' },
    { id: 3, name: 'Bob Johnson', role: 'Forklift Op', task: 'Restocking Aisle 4', orderId: null, perf: 85, status: 'In Warehouse', statusClass: 'bg-green-500/10 text-green-500', avatar: 'https://i.pravatar.cc/150?u=32', startTime: '06:45', fieldTime: null, returnTime: null, dept: 'Receiving' },
    { id: 4, name: 'Amit Singh', role: 'Laborer', task: 'House Shift ORD-20251', orderId: 'ORD-20251', perf: 92, status: 'On Field', statusClass: 'bg-purple-500/10 text-purple-400', avatar: 'https://i.pravatar.cc/150?u=33', startTime: '06:00', fieldTime: '08:30', returnTime: null, dept: 'Loading' },
    { id: 5, name: 'Ravi Kumar', role: 'Laborer', task: 'House Shift ORD-20251', orderId: 'ORD-20251', perf: 88, status: 'On Field', statusClass: 'bg-purple-500/10 text-purple-400', avatar: 'https://i.pravatar.cc/150?u=34', startTime: '06:00', fieldTime: '08:30', returnTime: null, dept: 'Loading' },
    { id: 6, name: 'Sarah Lee', role: 'Packer', task: '--', orderId: null, perf: 95, status: 'Off Duty', statusClass: 'bg-gray-500/10 text-gray-500', avatar: 'https://i.pravatar.cc/150?u=35', startTime: '--', fieldTime: null, returnTime: null, dept: 'Packing' },
    { id: 7, name: 'Mike Torres', role: 'Picker', task: 'Zone B Restock', orderId: null, perf: 103, status: 'In Warehouse', statusClass: 'bg-green-500/10 text-green-500', avatar: 'https://i.pravatar.cc/150?u=36', startTime: '07:15', fieldTime: null, returnTime: null, dept: 'Picking' },
    { id: 8, name: 'Priya Patel', role: 'Receiver', task: 'ASN-0092', orderId: null, perf: 97, status: 'In Warehouse', statusClass: 'bg-green-500/10 text-green-500', avatar: 'https://i.pravatar.cc/150?u=37', startTime: '07:00', fieldTime: null, returnTime: null, dept: 'Receiving' },
    { id: 9, name: 'Vikram Reddy', role: 'Laborer', task: 'Returned from field', orderId: 'ORD-20249', perf: 90, status: 'In Warehouse', statusClass: 'bg-green-500/10 text-green-500', avatar: 'https://i.pravatar.cc/150?u=38', startTime: '06:00', fieldTime: '08:00', returnTime: '11:30', dept: 'Loading' },
])

const statusCounts = computed(() => ({
    inWarehouse: staffList.value.filter(s => s.status === 'In Warehouse').length,
    assigned: staffList.value.filter(s => s.status === 'Assigned to Order').length,
    onField: staffList.value.filter(s => s.status === 'On Field').length,
    offDuty: staffList.value.filter(s => s.status === 'Off Duty').length,
}))

const totalHours = computed(() => {
    return staffList.value.filter(s => s.status !== 'Off Duty').length * 6
})

const filteredStaff = computed(() => {
    return staffList.value.filter(s => {
        const matchesSearch = !searchQuery.value || s.name.toLowerCase().includes(searchQuery.value.toLowerCase())
        const matchesDept = !deptFilter.value || s.dept === deptFilter.value
        const matchesStatus = !statusFilter.value || s.status === statusFilter.value
        return matchesSearch && matchesDept && matchesStatus
    })
})

function openAssign(staff) {
    assignTarget.value = staff
    assignOrderId.value = ''
    showAssignModal.value = true
}

function assignWorker() {
    if (assignTarget.value && assignOrderId.value) {
        assignTarget.value.orderId = assignOrderId.value
        assignTarget.value.status = 'Assigned to Order'
        assignTarget.value.statusClass = 'bg-blue-500/10 text-blue-500'
        assignTarget.value.task = `Assigned: ${assignOrderId.value}`
    }
    showAssignModal.value = false
}
</script>
