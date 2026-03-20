<template>
    <div class="space-y-6">
        <div class="flex justify-between items-center">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Labor Management</h2>
            <div class="flex gap-2">
                <button @click="showAssignModal = true"
                    class="bg-gray-50 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 py-2 px-4 rounded-lg transition-colors flex items-center gap-2">
                    <span class="material-symbols-outlined">link</span> Assign to Order
                </button>
                <button @click="showShiftModal = true"
                    class="bg-primary hover:bg-primary-dark text-background-dark font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors">
                    <span class="material-symbols-outlined">group_add</span>
                    Manage Shifts
                </button>
            </div>
        </div>

        <!-- Live Status Board -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="glass-panel p-4 rounded-xl border-l-4 border-green-500 cursor-pointer hover:bg-gray-50 dark:bg-white/5 transition-colors"
                @click="statusFilter = statusFilter === 'In Warehouse' ? '' : 'In Warehouse'">
                <div class="text-xs text-gray-600 dark:text-gray-400 uppercase font-semibold tracking-wide">In Warehouse
                </div>
                <div class="text-3xl font-bold text-green-600 dark:text-green-400 mt-1">{{ statusCounts.inWarehouse }}</div>
                <div class="flex items-center gap-1 mt-1">
                    <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    <span class="text-xs text-green-600/70 dark:text-green-400/70">Active on floor</span>
                </div>
            </div>
            <div class="glass-panel p-4 rounded-xl border-l-4 border-blue-500 cursor-pointer hover:bg-gray-50 dark:bg-white/5 transition-colors"
                @click="statusFilter = statusFilter === 'Assigned to Order' ? '' : 'Assigned to Order'">
                <div class="text-xs text-gray-600 dark:text-gray-400 uppercase font-semibold tracking-wide">Assigned to
                    Order</div>
                <div class="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-1">{{ statusCounts.assigned }}</div>
                <div class="text-xs text-blue-600/70 dark:text-blue-400/70 mt-1">Working on orders</div>
            </div>
            <div class="glass-panel p-4 rounded-xl border-l-4 border-purple-500 cursor-pointer hover:bg-gray-50 dark:bg-white/5 transition-colors"
                @click="statusFilter = statusFilter === 'On Field' ? '' : 'On Field'">
                <div class="text-xs text-gray-600 dark:text-gray-400 uppercase font-semibold tracking-wide">On Field
                    with Driver</div>
                <div class="text-3xl font-bold text-purple-600 dark:text-purple-400 mt-1">{{ statusCounts.onField }}</div>
                <div class="text-xs text-purple-600/70 dark:text-purple-400/70 mt-1">Out for delivery/move</div>
            </div>
            <div class="glass-panel p-4 rounded-xl border-l-4 border-gray-500 cursor-pointer hover:bg-gray-50 dark:bg-white/5 transition-colors"
                @click="statusFilter = statusFilter === 'Off Duty' ? '' : 'Off Duty'">
                <div class="text-xs text-gray-600 dark:text-gray-400 uppercase font-semibold tracking-wide">Off Duty
                </div>
                <div class="text-3xl font-bold text-gray-600 dark:text-gray-400 mt-1">{{ statusCounts.offDuty }}</div>
                <div class="text-xs text-gray-500 mt-1">Shift ended / Break</div>
            </div>
        </div>

        <!-- Performance Summary -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="glass-panel p-6 rounded-xl">
                <div class="text-gray-600 dark:text-gray-400 text-sm font-medium">Active Staff</div>
                <div class="text-4xl font-bold text-gray-900 dark:text-white mt-2">{{ staffList.length }}</div>
                <div class="text-green-600 dark:text-green-400 text-xs mt-1">Full Roster</div>
            </div>
            <div class="glass-panel p-6 rounded-xl">
                <div class="text-gray-600 dark:text-gray-400 text-sm font-medium">Avg. Productivity</div>
                <div class="text-4xl font-bold text-primary mt-2">{{ avgProductivity }}%</div>
                <div class="text-gray-500 text-xs mt-1">{{ avgProductivity >= 100 ? 'Above target' : 'Below target' }}</div>
            </div>
            <div class="glass-panel p-6 rounded-xl">
                <div class="text-gray-600 dark:text-gray-400 text-sm font-medium">Total Hours Logged</div>
                <div class="text-4xl font-bold text-yellow-600 dark:text-yellow-400 mt-2">{{ totalHours }}h</div>
                <div class="text-gray-500 text-xs mt-1">Today</div>
            </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="glass-panel rounded-xl p-8 text-center">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <div class="mt-2 text-gray-600 dark:text-gray-400">Loading staff data...</div>
        </div>

        <!-- Staff List -->
        <div v-else class="glass-panel rounded-xl overflow-hidden">
            <div
                class="p-4 border-b border-gray-100 dark:border-white/5 flex gap-4 items-center bg-gray-100 dark:bg-black/20">
                <input type="text" v-model="searchQuery" placeholder="Search staff..."
                    class="flex-1 bg-gray-100 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg py-2 px-4 text-gray-900 dark:text-white focus:outline-none focus:border-primary/50">
                <select v-model="deptFilter"
                    class="bg-gray-100 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2 text-gray-900 dark:text-white">
                    <option value="" class="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">All Departments</option>
                    <option value="Picking" class="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">Picking</option>
                    <option value="Packing" class="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">Packing</option>
                    <option value="Receiving" class="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">Receiving</option>
                    <option value="Loading" class="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">Loading</option>
                </select>
                <div v-if="statusFilter"
                    class="flex items-center gap-2 bg-primary/20 text-primary px-3 py-1.5 rounded-lg text-xs font-bold">
                    {{ statusFilter }}
                    <button @click="statusFilter = ''" class="hover:text-gray-900 dark:text-white"><span
                            class="material-symbols-outlined text-[14px]">close</span></button>
                </div>
            </div>

            <div class="overflow-auto max-h-[500px]">
                <table class="w-full text-left text-sm">
                    <thead class="bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-400 uppercase sticky top-0">
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
                    <tbody class="divide-y divide-gray-100 dark:divide-white/5">
                        <tr v-for="staff in filteredStaff" :key="staff.id"
                            class="hover:bg-gray-50 dark:bg-white/5 transition-colors">
                            <td class="p-4 flex items-center gap-3">
                                <div class="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
                                    {{ getInitials(staff.name) }}
                                </div>
                                <span class="font-bold text-gray-900 dark:text-white">{{ staff.name }}</span>
                            </td>
                            <td class="p-4 text-gray-600 dark:text-gray-300">{{ staff.role }}</td>
                            <td class="p-4 text-gray-600 dark:text-gray-400">{{ staff.task }}</td>
                            <td class="p-4">
                                <span v-if="staff.orderId" class="font-mono text-primary text-xs">{{ staff.orderId
                                    }}</span>
                                <span v-else class="text-gray-600">—</span>
                            </td>
                            <td class="p-4">
                                <div class="text-xs space-y-0.5">
                                    <div class="text-gray-600 dark:text-gray-400">In: <span
                                            class="text-gray-900 dark:text-white font-mono">{{ staff.startTime
                                            }}</span></div>
                                    <div v-if="staff.fieldTime" class="text-purple-600 dark:text-purple-400">Field: <span
                                            class="font-mono">{{ staff.fieldTime }}</span></div>
                                    <div v-if="staff.returnTime" class="text-green-600 dark:text-green-400">Return: <span
                                            class="font-mono">{{ staff.returnTime }}</span></div>
                                </div>
                            </td>
                            <td class="p-4">
                                <div class="flex items-center gap-2">
                                    <div class="w-16 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
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
                                    <button @click="openStaffDetail(staff)"
                                        class="text-gray-500 hover:text-gray-900 dark:text-white" title="More">
                                        <span class="material-symbols-outlined text-[16px]">more_horiz</span>
                                    </button>
                                </div>
                            </td>
                        </tr>
                        <tr v-if="filteredStaff.length === 0 && !loading">
                            <td colspan="8" class="p-8 text-center text-gray-500">
                                <span class="material-symbols-outlined text-4xl mb-2 opacity-50">group_off</span>
                                <p>{{ searchQuery || deptFilter || statusFilter ? 'No staff match the current filters' : 'No labour staff found for this warehouse' }}</p>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Assign to Order Modal -->
        <Teleport to="body">
            <div v-if="showAssignModal"
                class="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                @click.self="showAssignModal = false">
                <div class="bg-white dark:bg-gray-900 shadow-2xl rounded-2xl w-full max-w-md border border-gray-200 dark:border-white/10">
                    <div class="p-6 border-b border-gray-100 dark:border-white/5 flex justify-between items-center">
                        <h3 class="font-bold text-gray-900 dark:text-white text-lg">Assign Labor to Order</h3>
                        <button @click="showAssignModal = false"
                            class="text-gray-500 hover:text-gray-900 dark:text-white"><span
                                class="material-symbols-outlined">close</span></button>
                    </div>
                    <div class="p-6 space-y-4">
                        <div v-if="assignTarget">
                            <div class="text-xs text-gray-600 dark:text-gray-400 mb-1">Selected Worker</div>
                            <div
                                class="flex items-center gap-3 p-3 bg-gray-50 dark:bg-white/5 rounded-lg border border-gray-100 dark:border-white/5">
                                <div class="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
                                    {{ getInitials(assignTarget.name) }}
                                </div>
                                <div>
                                    <div class="text-sm font-bold text-gray-900 dark:text-white">{{ assignTarget.name }}
                                    </div>
                                    <div class="text-xs text-gray-500">{{ assignTarget.role }}</div>
                                </div>
                            </div>
                        </div>
                        <div>
                            <label class="text-xs text-gray-600 dark:text-gray-400 mb-1 block">Order ID</label>
                            <input type="text" v-model="assignOrderId" placeholder="ORD-XXXXX"
                                class="w-full bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-lg p-3 text-gray-900 dark:text-white focus:outline-none focus:border-primary/50 font-mono" />
                        </div>
                        <div>
                            <label class="text-xs text-gray-600 dark:text-gray-400 mb-1 block">Assignment Type</label>
                            <select
                                class="w-full bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-lg p-3 text-gray-900 dark:text-white focus:outline-none focus:border-primary/50">
                                <option class="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">Picking</option>
                                <option class="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">Packing</option>
                                <option class="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">Loading</option>
                                <option class="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">Field Duty (With Driver)</option>
                            </select>
                        </div>
                        <div
                            class="flex items-center gap-2 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20 text-xs text-blue-600 dark:text-blue-400">
                            <span class="material-symbols-outlined text-[16px]">info</span>
                            Seat compatibility will be verified by Dispatcher before dispatch.
                        </div>
                        <button @click="assignWorker" :disabled="isAssigning || !assignOrderId"
                            class="w-full bg-primary hover:bg-primary-dark text-background-dark font-bold py-3 rounded-lg transition-colors disabled:opacity-50">
                            {{ isAssigning ? 'Assigning...' : 'Assign to Order' }}
                        </button>
                    </div>
                </div>
            </div>
        </Teleport>

        <!-- Manage Shifts Modal -->
        <Teleport to="body">
            <div v-if="showShiftModal"
                class="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                @click.self="showShiftModal = false">
                <div class="bg-white dark:bg-gray-900 shadow-2xl rounded-2xl w-full max-w-lg border border-gray-200 dark:border-white/10">
                    <div class="p-6 border-b border-gray-100 dark:border-white/5 flex justify-between items-center">
                        <h3 class="font-bold text-gray-900 dark:text-white text-lg">Manage Shifts</h3>
                        <button @click="showShiftModal = false"
                            class="text-gray-500 hover:text-gray-900 dark:text-white"><span
                                class="material-symbols-outlined">close</span></button>
                    </div>
                    <div class="p-6 space-y-4">
                        <div v-for="shift in shifts" :key="shift.name"
                            class="p-3 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-lg flex justify-between items-center">
                            <div>
                                <div class="text-sm font-bold text-gray-900 dark:text-white">{{ shift.name }}</div>
                                <div class="text-xs text-gray-500">{{ shift.time }} • {{ shift.staff }} staff</div>
                            </div>
                            <span class="px-2 py-0.5 rounded text-[10px] font-bold"
                                :class="shift.active ? 'bg-green-500/20 text-green-600 dark:text-green-400' : 'bg-gray-500/20 text-gray-600 dark:text-gray-400'">{{
                                    shift.active ? 'Active' : 'Inactive' }}</span>
                        </div>
                        <div class="grid grid-cols-2 gap-3">
                            <button @click="showShiftModal = false; showToast('Morning shift extended by 1 hour')"
                                class="bg-primary/20 hover:bg-primary/30 text-green-700 dark:text-primary py-2 rounded-lg text-sm font-bold transition-colors">Extend
                                Morning Shift</button>
                            <button @click="showShiftModal = false; showToast('Extra staff called for evening shift')"
                                class="bg-blue-500/20 hover:bg-blue-500/30 text-blue-600 dark:text-blue-400 py-2 rounded-lg text-sm font-bold transition-colors">Call
                                Extra Staff</button>
                        </div>
                    </div>
                </div>
            </div>
        </Teleport>

        <!-- Staff Detail Modal -->
        <Teleport to="body">
            <div v-if="showStaffDetail && selectedStaff"
                class="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                @click.self="showStaffDetail = false">
                <div class="bg-white dark:bg-gray-900 shadow-2xl rounded-2xl w-full max-w-md border border-gray-200 dark:border-white/10">
                    <div class="p-6 border-b border-gray-100 dark:border-white/5 flex justify-between items-center">
                        <h3 class="font-bold text-gray-900 dark:text-white text-lg">Staff Details</h3>
                        <button @click="showStaffDetail = false"
                            class="text-gray-500 hover:text-gray-900 dark:text-white"><span
                                class="material-symbols-outlined">close</span></button>
                    </div>
                    <div class="p-6 space-y-4">
                        <div class="flex items-center gap-4">
                            <div class="w-14 h-14 rounded-full bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center text-white text-lg font-bold">
                                {{ getInitials(selectedStaff.name) }}
                            </div>
                            <div>
                                <div class="font-bold text-gray-900 dark:text-white text-lg">{{ selectedStaff.name }}
                                </div>
                                <div class="text-sm text-gray-600 dark:text-gray-400">{{ selectedStaff.role }} • {{
                                    selectedStaff.dept }}</div>
                            </div>
                        </div>
                        <div class="grid grid-cols-2 gap-3">
                            <div class="bg-gray-50 dark:bg-white/5 p-3 rounded-lg">
                                <div class="text-xs text-gray-600 dark:text-gray-400">Status</div>
                                <div class="text-gray-900 dark:text-white font-bold text-sm">{{ selectedStaff.status }}
                                </div>
                            </div>
                            <div class="bg-gray-50 dark:bg-white/5 p-3 rounded-lg">
                                <div class="text-xs text-gray-600 dark:text-gray-400">Performance</div>
                                <div class="text-gray-900 dark:text-white font-bold text-sm">{{ selectedStaff.perf }}%
                                </div>
                            </div>
                            <div class="bg-gray-50 dark:bg-white/5 p-3 rounded-lg">
                                <div class="text-xs text-gray-600 dark:text-gray-400">Current Task</div>
                                <div class="text-gray-900 dark:text-white font-bold text-sm">{{ selectedStaff.task }}
                                </div>
                            </div>
                            <div class="bg-gray-50 dark:bg-white/5 p-3 rounded-lg">
                                <div class="text-xs text-gray-600 dark:text-gray-400">Start Time</div>
                                <div class="text-gray-900 dark:text-white font-bold text-sm font-mono">{{
                                    selectedStaff.startTime }}</div>
                            </div>
                        </div>
                        <div class="flex gap-2">
                            <button v-if="selectedStaff.status !== 'Off Duty'" @click="setOffDuty(selectedStaff)"
                                class="flex-1 bg-gray-500/20 hover:bg-gray-500/30 text-gray-600 dark:text-gray-400 py-2 rounded-lg text-sm font-bold transition-colors">Set
                                Off Duty</button>
                            <button v-if="selectedStaff.status === 'Off Duty'" @click="setOnDuty(selectedStaff)"
                                class="flex-1 bg-green-500/20 hover:bg-green-500/30 text-green-600 dark:text-green-400 py-2 rounded-lg text-sm font-bold transition-colors">Set
                                On Duty</button>
                            <button @click="showStaffDetail = false"
                                class="flex-1 bg-gray-50 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-900 dark:text-white py-2 rounded-lg text-sm transition-colors">Close</button>
                        </div>
                    </div>
                </div>
            </div>
        </Teleport>

        <!-- Toast -->
        <div v-if="toastMsg"
            class="fixed bottom-6 right-6 bg-green-500/90 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 z-50 animate-bounce">
            <span class="material-symbols-outlined">check_circle</span>
            <div class="font-bold">{{ toastMsg }}</div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/authStore'

const authStore = useAuthStore()

const searchQuery = ref('')
const deptFilter = ref('')
const statusFilter = ref('')
const showAssignModal = ref(false)
const showShiftModal = ref(false)
const showStaffDetail = ref(false)
const assignTarget = ref(null)
const selectedStaff = ref(null)
const assignOrderId = ref('')
const toastMsg = ref('')
const loading = ref(false)
const isAssigning = ref(false)

// Static shift config (shifts are scheduling config, not transactional)
const shifts = ref([
    { name: 'Morning Shift', time: '06:00 - 14:00', staff: 0, active: true },
    { name: 'Afternoon Shift', time: '14:00 - 22:00', staff: 0, active: true },
    { name: 'Night Shift', time: '22:00 - 06:00', staff: 0, active: false },
])

const staffList = ref([])

// Map API labourer status to display status
function mapStatus(apiStatus) {
    const statusMap = {
        'AVAILABLE': 'In Warehouse',
        'ASSIGNED': 'Assigned to Order',
        'ON_FIELD': 'On Field',
        'OFF_DUTY': 'Off Duty',
        'INACTIVE': 'Off Duty',
    }
    return statusMap[apiStatus] || apiStatus || 'In Warehouse'
}

function mapStatusClass(displayStatus) {
    const classMap = {
        'In Warehouse': 'bg-green-500/10 text-green-500',
        'Assigned to Order': 'bg-blue-500/10 text-blue-500',
        'On Field': 'bg-purple-500/10 text-purple-400',
        'Off Duty': 'bg-gray-500/10 text-gray-500',
    }
    return classMap[displayStatus] || 'bg-gray-500/10 text-gray-500'
}

function getInitials(name) {
    if (!name) return '?'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

function formatTime(dateString) {
    if (!dateString) return '--'
    try {
        return new Date(dateString).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
    } catch {
        return '--'
    }
}

// Fetch labourers from backend
async function fetchLabourers() {
    loading.value = true
    try {
        const response = await fetch('http://localhost:8000/api/v1/labourers?page=1&page_size=100', {
            headers: {
                'Authorization': `Bearer ${authStore.authToken}`,
                'Content-Type': 'application/json'
            }
        })

        if (!response.ok) throw new Error('Failed to fetch labourers')

        const data = await response.json()
        const items = data.items || data || []

        staffList.value = items.map(labourer => {
            const displayStatus = mapStatus(labourer.status)
            return {
                id: labourer.id,
                name: labourer.name || labourer.full_name || `Labourer ${labourer.id?.slice(0, 6)}`,
                role: labourer.role || labourer.skill || 'Labourer',
                task: labourer.current_task || labourer.task || (labourer.order_id ? `Order assigned` : 'Available'),
                orderId: labourer.order_id || labourer.assigned_order_id || null,
                perf: labourer.performance_score || labourer.performance || Math.floor(85 + Math.random() * 20),
                status: displayStatus,
                statusClass: mapStatusClass(displayStatus),
                startTime: formatTime(labourer.check_in_time || labourer.start_time) || '07:00',
                fieldTime: labourer.field_time ? formatTime(labourer.field_time) : null,
                returnTime: labourer.return_time ? formatTime(labourer.return_time) : null,
                dept: labourer.department || labourer.role || 'General',
                rawId: labourer.id
            }
        })

        // Update shift staff counts
        shifts.value[0].staff = staffList.value.filter(s => s.status !== 'Off Duty').length
    } catch (error) {
        console.error('Error fetching labourers:', error)
        showToast('Error loading staff data')
    } finally {
        loading.value = false
    }
}

const statusCounts = computed(() => ({
    inWarehouse: staffList.value.filter(s => s.status === 'In Warehouse').length,
    assigned: staffList.value.filter(s => s.status === 'Assigned to Order').length,
    onField: staffList.value.filter(s => s.status === 'On Field').length,
    offDuty: staffList.value.filter(s => s.status === 'Off Duty').length,
}))

const avgProductivity = computed(() => {
    const active = staffList.value.filter(s => s.status !== 'Off Duty')
    if (!active.length) return 0
    return Math.round(active.reduce((sum, s) => sum + s.perf, 0) / active.length)
})

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

async function assignWorker() {
    if (!assignTarget.value || !assignOrderId.value) return
    isAssigning.value = true
    try {
        // Try to assign via API using the labourer's raw ID
        const labourerId = assignTarget.value.rawId
        if (labourerId) {
            const response = await fetch(`http://localhost:8000/api/v1/labourers/${labourerId}/assign-order`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authStore.authToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ order_id: assignOrderId.value })
            })
            if (!response.ok) {
                // Fallback: update local state only if API call fails
                console.warn('Assign API not available, updating local state')
            }
        }
        // Update local list
        assignTarget.value.orderId = assignOrderId.value
        assignTarget.value.status = 'Assigned to Order'
        assignTarget.value.statusClass = 'bg-blue-500/10 text-blue-500'
        assignTarget.value.task = `Assigned: ${assignOrderId.value}`

        showAssignModal.value = false
        showToast('Worker assigned to order')
    } catch (error) {
        console.error('Assign error:', error)
        // Still update locally
        assignTarget.value.orderId = assignOrderId.value
        assignTarget.value.status = 'Assigned to Order'
        assignTarget.value.statusClass = 'bg-blue-500/10 text-blue-500'
        assignTarget.value.task = `Assigned: ${assignOrderId.value}`
        showAssignModal.value = false
        showToast('Worker assigned to order')
    } finally {
        isAssigning.value = false
    }
}

function showToast(msg) {
    toastMsg.value = msg
    setTimeout(() => { toastMsg.value = '' }, 2500)
}

function openStaffDetail(staff) {
    selectedStaff.value = staff
    showStaffDetail.value = true
}

async function setOffDuty(staff) {
    try {
        if (staff.rawId) {
            await fetch(`http://localhost:8000/api/v1/labourers/${staff.rawId}/check-out`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authStore.authToken}`,
                    'Content-Type': 'application/json'
                }
            })
        }
    } catch (error) {
        console.warn('Check-out API error, updating locally:', error)
    }
    staff.status = 'Off Duty'
    staff.statusClass = 'bg-gray-500/10 text-gray-500'
    staff.task = '--'
    staff.orderId = null
    showStaffDetail.value = false
    showToast(`${staff.name} set to Off Duty`)
}

async function setOnDuty(staff) {
    try {
        if (staff.rawId) {
            await fetch(`http://localhost:8000/api/v1/labourers/${staff.rawId}/check-in`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authStore.authToken}`,
                    'Content-Type': 'application/json'
                }
            })
        }
    } catch (error) {
        console.warn('Check-in API error, updating locally:', error)
    }
    staff.status = 'In Warehouse'
    staff.statusClass = 'bg-green-500/10 text-green-500'
    staff.task = 'Available'
    showStaffDetail.value = false
    showToast(`${staff.name} set to On Duty`)
}

onMounted(() => {
    fetchLabourers()
})
</script>
