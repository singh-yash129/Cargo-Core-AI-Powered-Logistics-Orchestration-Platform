<template>
    <div class="space-y-6">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white">My Orders</h2>
            <div class="flex items-center gap-3 w-full sm:w-auto">
                <div class="relative flex-1 sm:flex-none">
                    <span
                        class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">search</span>
                    <input v-model="search" type="text" placeholder="Search orders..."
                        class="w-full sm:w-64 pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500/50 outline-none text-sm" />
                </div>
                <select v-model="statusFilter"
                    class="px-3 py-2 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-green-500/50 outline-none">
                    <option value="all" class="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">All</option>
                    <option value="pending" class="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">Pending</option>
                    <option value="dispatched" class="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">Dispatched</option>
                    <option value="in-transit" class="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">In Transit</option>
                    <option value="delivered" class="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">Delivered</option>
                    <option value="cancelled" class="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">Cancelled</option>
                </select>
            </div>
        </div>

        <div class="space-y-4">
            <div v-for="order in filteredOrders" :key="order.id"
                class="glass-panel rounded-xl overflow-hidden transition-all duration-300"
                :class="expandedOrder === order.id ? 'ring-1 ring-green-500/30' : ''">

                <!-- Header -->
                <div class="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                    @click="expandedOrder = expandedOrder === order.id ? null : order.id">
                    <div class="flex items-center gap-4 w-full sm:w-auto">
                        <div class="w-10 h-10 rounded-lg flex items-center justify-center"
                            :class="statusBg(order.status)">
                            <span class="material-symbols-outlined text-xl">{{ statusIcon(order.status) }}</span>
                        </div>
                        <div class="flex-1 min-w-0">
                            <div class="flex items-center gap-2 flex-wrap">
                                <span class="font-mono font-bold text-green-600 dark:text-green-400 text-sm">{{ order.id
                                    }}</span>
                                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase"
                                    :class="statusBadge(order.status)">{{ order.status.replace('-', ' ') }}</span>
                                <span v-if="order.moveType === 'small-package'"
                                    class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400">Package</span>
                            </div>
                            <div class="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">{{ order.cargoType }}
                                · {{ order.vehicleType?.toUpperCase() || '' }} · {{ order.date }}</div>
                        </div>
                    </div>
                    <div class="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                        <span class="text-lg font-bold text-gray-900 dark:text-white font-mono">₹{{
                            order.cost.total.toLocaleString() }}</span>
                        <span class="material-symbols-outlined text-gray-400 transition-transform duration-300"
                            :class="expandedOrder === order.id ? 'rotate-180' : ''">expand_more</span>
                    </div>
                </div>

                <!-- Expanded -->
                <transition enter-active-class="transition-all duration-300 ease-out"
                    enter-from-class="max-h-0 opacity-0" enter-to-class="max-h-[2000px] opacity-100"
                    leave-active-class="transition-all duration-200 ease-in"
                    leave-from-class="max-h-[2000px] opacity-100" leave-to-class="max-h-0 opacity-0">
                    <div v-if="expandedOrder === order.id" class="overflow-hidden">
                        <div class="border-t border-gray-200 dark:border-white/5 p-4 sm:p-5 space-y-5">

                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div class="flex items-start gap-3"><span
                                            class="material-symbols-outlined text-green-500 mt-0.5">trip_origin</span>
                                        <div>
                                            <div class="text-xs text-gray-500">Pickup</div>
                                            <div class="text-sm font-medium text-gray-900 dark:text-white">{{
                                                order.pickup }}</div>
                                        </div>
                                    </div>
                                    <div class="flex items-start gap-3"><span
                                            class="material-symbols-outlined text-red-500 mt-0.5">location_on</span>
                                        <div>
                                            <div class="text-xs text-gray-500">Destination</div>
                                            <div class="text-sm font-medium text-gray-900 dark:text-white">{{
                                                order.destination }}</div>
                                        </div>
                                    </div>
                                </div>
                                <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    <div class="p-3 bg-gray-50 dark:bg-white/5 rounded-lg text-center">
                                        <div class="text-xs text-gray-500">Vehicle</div>
                                        <div class="font-bold text-sm text-gray-900 dark:text-white uppercase">{{ order.vehicleType || 'N/A' }}</div>
                                    </div>
                                    <div class="p-3 bg-gray-50 dark:bg-white/5 rounded-lg text-center">
                                        <div class="text-xs text-gray-500">Helpers</div>
                                        <div class="font-bold text-sm text-gray-900 dark:text-white">{{ order.laborCount }}</div>
                                    </div>
                                    <div class="p-3 bg-gray-50 dark:bg-white/5 rounded-lg text-center">
                                        <div class="text-xs text-gray-500">Payment</div>
                                        <div class="font-bold text-sm text-gray-900 dark:text-white">{{ order.paymentMode }}</div>
                                    </div>
                                    <div class="p-3 bg-gray-50 dark:bg-white/5 rounded-lg text-center">
                                        <div class="text-xs text-gray-500">Amount</div>
                                        <div class="font-bold text-sm text-gray-900 dark:text-white">₹{{ order.cost.total.toLocaleString() }}</div>
                                    </div>
                                </div>
                                <div v-if="order.cancellation"
                                    class="p-3 bg-red-50 dark:bg-red-500/5 border border-red-200 dark:border-red-500/20 rounded-lg text-sm">
                                    <div class="text-red-600 dark:text-red-400 font-bold">{{ order.cancellation.reason }}</div>
                                </div>

                            <!-- Actions -->
                            <div class="flex flex-wrap gap-2 pt-2 border-t border-gray-200 dark:border-white/5">
                                <router-link v-if="order.status === 'in-transit' || order.status === 'dispatched'"
                                    :to="'/individual/tracking?orderId=' + order.id"
                                    class="px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1.5">
                                    <span class="material-symbols-outlined text-sm">gps_fixed</span> Track
                                </router-link>
                                <button @click="openSlipWithData('bookingConfirmation', order, authStore.currentUser)"
                                    class="px-4 py-2 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-sm font-bold rounded-lg hover:bg-indigo-500/20 transition-colors flex items-center gap-1.5">
                                    <span class="material-symbols-outlined text-sm">receipt_long</span> Booking Slip
                                </button>
                                <button v-if="order.status === 'delivered'" @click="openSlipWithData('proofOfDelivery', order, authStore.currentUser)"
                                    class="px-4 py-2 bg-green-500/10 text-green-600 dark:text-green-400 text-sm font-bold rounded-lg hover:bg-green-500/20 transition-colors flex items-center gap-1.5">
                                    <span class="material-symbols-outlined text-sm">verified</span> PoD
                                </button>
                                <button v-if="order.status === 'delivered'" @click="openSlipWithData('finalTaxInvoice', order, authStore.currentUser)"
                                    class="px-4 py-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-sm font-bold rounded-lg hover:bg-blue-500/20 transition-colors flex items-center gap-1.5">
                                    <span class="material-symbols-outlined text-sm">request_quote</span> Invoice
                                </button>
                                <button v-if="order.status === 'pending'" @click="showRescheduleModal(order)"
                                    class="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1.5">
                                    <span class="material-symbols-outlined text-sm">schedule</span> Reschedule
                                </button>
                                <button v-if="order.status === 'pending' || order.status === 'dispatched' || order.status === 'in-transit'"
                                    @click="showCancelModal(order)"
                                    class="px-4 py-2 bg-red-600 text-white text-sm font-bold rounded-lg hover:bg-red-700 transition-colors flex items-center gap-1.5">
                                    <span class="material-symbols-outlined text-sm">cancel</span> Cancel Order
                                </button>
                                <router-link v-if="order.status === 'delivered'" to="/individual/damage-report"
                                    class="px-4 py-2 bg-red-500/10 text-red-600 dark:text-red-400 text-sm font-bold rounded-lg hover:bg-red-500/20 transition-colors flex items-center gap-1.5">
                                    <span class="material-symbols-outlined text-sm">report</span> Report Damage
                                </router-link>
                            </div>
                        </div>
                    </div>
                </transition>
            </div>
        </div>

        <div v-if="filteredOrders.length === 0" class="text-center py-16 text-gray-500 dark:text-gray-400">
            <span class="material-symbols-outlined text-5xl mb-2 block">receipt_long</span>
            <p class="font-medium">No orders found.</p>
        </div>

        <!-- Cancel Confirmation Modal -->
        <Teleport to="body">
            <BaseModal :isOpen="cancelModal.show" @close="cancelModal.show = false">
                <template #title>Cancel Order</template>
                <div class="space-y-4">
                    <div class="text-center py-3">
                        <div
                            class="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center text-red-500 mx-auto mb-3">
                            <span class="material-symbols-outlined text-3xl">warning</span>
                        </div>
                        <p class="text-gray-700 dark:text-gray-300 text-sm">Are you sure you want to cancel <span
                                class="font-bold text-gray-900 dark:text-white">{{ cancelModal.order?.id }}</span>?</p>
                    </div>
                    <div v-if="cancelModal.order" class="p-4 rounded-lg text-sm space-y-2"
                        :class="cancelModal.order.status === 'pending' ? 'bg-green-50 dark:bg-green-500/5 border border-green-200 dark:border-green-500/20' : 'bg-red-50 dark:bg-red-500/5 border border-red-200 dark:border-red-500/20'">
                        <div v-if="cancelModal.order.status === 'pending'"
                            class="text-green-700 dark:text-green-400 font-bold">
                            ✅ No cancellation fee — order hasn't been dispatched yet.</div>
                        <div v-else>
                            <div class="text-red-600 dark:text-red-400 font-bold">⚠️ Cancellation fee applies</div>
                            <div class="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                Status: <span class="font-bold">{{ cancelModal.order.status }}</span> · Progress: {{
                                    cancelModal.order.progress }}%
                            </div>
                            <div class="text-lg font-bold text-red-600 dark:text-red-400 mt-2">Fee: ₹{{
                                estimatedCancelFee.toLocaleString() }}</div>
                        </div>
                    </div>
                </div>
                <template #footer>
                    <div class="flex gap-3 w-full">
                        <button @click="doCancel"
                            class="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-bold">Confirm
                            Cancel</button>
                        <button @click="cancelModal.show = false"
                            class="flex-1 py-2 bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-white rounded-lg text-sm">Keep
                            Order</button>
                    </div>
                </template>
            </BaseModal>
        </Teleport>

        <!-- Reschedule Modal -->
        <Teleport to="body">
            <BaseModal :isOpen="rescheduleModal.show" @close="rescheduleModal.show = false">
                <template #title>Reschedule Move</template>
                <div class="space-y-4">
                    <div><label class="block text-sm text-gray-600 dark:text-gray-400 mb-1.5 font-medium">New
                            Date</label>
                        <input v-model="rescheduleModal.date" type="date"
                            class="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500/50 outline-none" />
                    </div>
                    <div><label class="block text-sm text-gray-600 dark:text-gray-400 mb-1.5 font-medium">New
                            Time</label>
                        <select v-model="rescheduleModal.time"
                            class="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500/50 outline-none">
                            <option class="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">06:00 AM - 09:00 AM</option>
                            <option class="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">09:00 AM - 12:00 PM</option>
                            <option class="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">12:00 PM - 03:00 PM</option>
                            <option class="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">03:00 PM - 06:00 PM</option>
                        </select>
                    </div>
                </div>
                <template #footer>
                    <div class="flex gap-3 w-full">
                        <button @click="doReschedule"
                            class="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-bold">Reschedule</button>
                        <button @click="rescheduleModal.show = false"
                            class="flex-1 py-2 bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-white rounded-lg text-sm">Cancel</button>
                    </div>
                </template>
            </BaseModal>
        </Teleport>

        <!-- Toast -->
        <Teleport to="body">
            <transition enter-active-class="transition duration-300 ease-out" enter-from-class="translate-y-4 opacity-0"
                enter-to-class="translate-y-0 opacity-100" leave-active-class="transition duration-200 ease-in"
                leave-from-class="translate-y-0 opacity-100" leave-to-class="translate-y-4 opacity-0">
                <div v-if="toast.show"
                    class="fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-5 py-3 rounded-xl shadow-xl max-w-sm"
                    :class="toast.type === 'error' ? 'bg-red-600 text-white border border-red-500' : 'bg-green-600 text-white border border-green-500'">
                    <span class="material-symbols-outlined">{{ toast.type === 'error' ? 'error' : 'check_circle'
                        }}</span>
                    <span class="text-sm font-medium">{{ toast.message }}</span>
                </div>
            </transition>
        </Teleport>
    </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted, watch } from 'vue'
import { useIndividualStore } from '@/stores/individualStore'
import { useAuthStore } from '@/stores/authStore'
import { useSlipPrinter } from '@/composables/useSlipPrinter'
import BaseModal from '@/components/BaseModal.vue'

const store = useIndividualStore()
const authStore = useAuthStore()
const { openSlipWithData } = useSlipPrinter()
const search = ref('')
const statusFilter = ref('all')
const expandedOrder = ref(null)

const filteredOrders = computed(() => {
    return store.orders.filter(o => {
        const s = !search.value || o.id.toLowerCase().includes(search.value.toLowerCase()) || o.cargoType.toLowerCase().includes(search.value.toLowerCase())
        const f = statusFilter.value === 'all' || o.status === statusFilter.value
        return s && f
    })
})

onMounted(() => {
    store.fetchOrders()
})

watch(statusFilter, () => {
    store.fetchOrders(statusFilter.value)
})

function statusIcon(st) { return { 'delivered': 'check_circle', 'in-transit': 'local_shipping', 'dispatched': 'person_pin_circle', 'pending': 'schedule', 'cancelled': 'cancel' }[st] || 'package_2' }
function statusBg(st) { return { 'delivered': 'bg-green-500/20 text-green-500', 'in-transit': 'bg-blue-500/20 text-blue-500', 'dispatched': 'bg-purple-500/20 text-purple-500', 'pending': 'bg-amber-500/20 text-amber-500', 'cancelled': 'bg-red-500/20 text-red-500' }[st] || '' }
function statusBadge(st) { return { 'delivered': 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400', 'in-transit': 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400', 'dispatched': 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400', 'pending': 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400', 'cancelled': 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400' }[st] || '' }

// Cancel
const cancelModal = reactive({ show: false, order: null })
const estimatedCancelFee = computed(() => {
    if (!cancelModal.order) return 0
    if (cancelModal.order.status === 'pending') return 0
    if (cancelModal.order.progress < 30) return Math.round(cancelModal.order.cost.total * 0.10)
    return Math.round(cancelModal.order.cost.total * 0.25)
})
function showCancelModal(order) { cancelModal.order = order; cancelModal.show = true }
async function doCancel() {
    const result = await store.cancelOrderRemote(cancelModal.order.id)
    cancelModal.show = false
    if (!result.success) {
        showToast(result.message || 'Failed to cancel order.', 'error')
        return
    }
    const fee = result.order?.cancellation?.fee || 0
    showToast(fee > 0 ? `Cancelled. Fee: ₹${fee.toLocaleString()}` : 'Cancelled — no fee.', fee > 0 ? 'error' : 'success')
}

// Reschedule
const rescheduleModal = reactive({ show: false, order: null, date: '', time: '09:00 AM - 12:00 PM' })
function showRescheduleModal(order) { Object.assign(rescheduleModal, { show: true, order, date: '', time: '09:00 AM - 12:00 PM' }) }
function doReschedule() { store.rescheduleOrder(rescheduleModal.order.id, rescheduleModal.date, rescheduleModal.time); rescheduleModal.show = false; showToast('Rescheduled!') }

const toast = reactive({ show: false, message: '', type: 'success' })
function showToast(msg, type = 'success') { toast.show = true; toast.message = msg; toast.type = type; setTimeout(() => { toast.show = false }, 3000) }
</script>
