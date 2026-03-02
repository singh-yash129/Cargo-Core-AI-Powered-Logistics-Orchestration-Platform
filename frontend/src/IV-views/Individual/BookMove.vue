<template>
    <div class="space-y-6">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Book a Move</h2>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Main Form -->
            <div class="lg:col-span-2 space-y-6">
                <!-- Section 1: Cargo Type -->
                <div class="glass-panel p-4 sm:p-6 rounded-xl">
                    <h3 class="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <span
                            class="w-6 h-6 rounded-full bg-green-500 text-white text-xs flex items-center justify-center font-bold">1</span>
                        Select Cargo Type
                    </h3>
                    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                        <button v-for="type in cargoTypes" :key="type.name"
                            class="p-3 sm:p-4 rounded-xl border transition-all flex flex-col items-center gap-2 group"
                            :class="form.cargoType === type.name
                                ? 'bg-green-500/10 border-green-500 dark:bg-green-500/10 dark:border-green-500'
                                : 'bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 hover:border-green-500/50'"
                            @click="form.cargoType = type.name">
                            <span class="material-symbols-outlined text-2xl sm:text-3xl"
                                :class="form.cargoType === type.name ? 'text-green-500' : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-700 dark:group-hover:text-white'">
                                {{ type.icon }}
                            </span>
                            <span class="text-xs font-medium"
                                :class="form.cargoType === type.name ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'">
                                {{ type.name }}
                            </span>
                        </button>
                    </div>
                </div>

                <!-- Section 2: Route Details -->
                <div class="glass-panel p-4 sm:p-6 rounded-xl">
                    <h3 class="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <span
                            class="w-6 h-6 rounded-full bg-green-500 text-white text-xs flex items-center justify-center font-bold">2</span>
                        Route Details
                    </h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm text-gray-600 dark:text-gray-400 mb-1.5 font-medium">Pickup
                                Address</label>
                            <div class="relative">
                                <span
                                    class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-green-500 text-lg">trip_origin</span>
                                <input v-model="form.pickup" type="text" placeholder="Enter pickup location"
                                    class="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500/50 focus:border-green-500 outline-none transition-all" />
                            </div>
                        </div>
                        <div>
                            <label class="block text-sm text-gray-600 dark:text-gray-400 mb-1.5 font-medium">Destination
                                Address</label>
                            <div class="relative">
                                <span
                                    class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-red-500 text-lg">location_on</span>
                                <input v-model="form.destination" type="text" placeholder="Enter destination"
                                    class="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500/50 focus:border-green-500 outline-none transition-all" />
                            </div>
                        </div>
                        <div>
                            <label class="block text-sm text-gray-600 dark:text-gray-400 mb-1.5 font-medium">Move
                                Date</label>
                            <input v-model="form.date" type="date"
                                class="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500/50 focus:border-green-500 outline-none transition-all" />
                        </div>
                        <div>
                            <label class="block text-sm text-gray-600 dark:text-gray-400 mb-1.5 font-medium">Time
                                Window</label>
                            <select v-model="form.timeWindow"
                                class="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500/50 focus:border-green-500 outline-none transition-all">
                                <option value="06:00 AM - 09:00 AM">06:00 AM - 09:00 AM</option>
                                <option value="09:00 AM - 12:00 PM">09:00 AM - 12:00 PM</option>
                                <option value="12:00 PM - 03:00 PM">12:00 PM - 03:00 PM</option>
                                <option value="03:00 PM - 06:00 PM">03:00 PM - 06:00 PM</option>
                            </select>
                        </div>
                    </div>
                </div>

                <!-- Section 3: Service Customization -->
                <div class="glass-panel p-4 sm:p-6 rounded-xl">
                    <h3 class="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <span
                            class="w-6 h-6 rounded-full bg-green-500 text-white text-xs flex items-center justify-center font-bold">3</span>
                        Customize Service
                    </h3>

                    <!-- Packing Toggle -->
                    <div class="mb-6">
                        <label class="block text-sm text-gray-600 dark:text-gray-400 mb-2 font-medium">Packing
                            Service</label>
                        <div class="flex flex-col sm:flex-row gap-3">
                            <label
                                class="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 flex-1 transition-all"
                                :class="!form.packingRequired ? 'border-green-500 bg-green-500/5' : 'border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5'">
                                <input type="radio" :value="false" v-model="form.packingRequired"
                                    class="accent-green-500" />
                                <div>
                                    <span class="text-sm text-gray-900 dark:text-white font-medium">I will pack
                                        myself</span>
                                    <p class="text-xs text-gray-500">No packing charges</p>
                                </div>
                            </label>
                            <label
                                class="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 flex-1 transition-all"
                                :class="form.packingRequired ? 'border-green-500 bg-green-500/5' : 'border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5'">
                                <input type="radio" :value="true" v-model="form.packingRequired"
                                    class="accent-green-500" />
                                <div>
                                    <span class="text-sm text-gray-900 dark:text-white font-medium">We pack for
                                        you</span>
                                    <p class="text-xs text-gray-500">Professional packing team</p>
                                </div>
                            </label>
                        </div>
                    </div>

                    <!-- Labor & Materials -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <!-- Labor Counter -->
                        <div>
                            <label class="block text-sm text-gray-600 dark:text-gray-400 mb-2 font-medium">Additional
                                Labor (Helpers)</label>
                            <div class="flex items-center gap-4">
                                <button @click="form.laborCount > 0 ? form.laborCount-- : null"
                                    class="w-10 h-10 rounded-lg bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-700 dark:text-white flex items-center justify-center text-xl font-bold transition-colors">−</button>
                                <span class="text-2xl font-bold text-gray-900 dark:text-white w-8 text-center">{{
                                    form.laborCount }}</span>
                                <button @click="form.laborCount++"
                                    class="w-10 h-10 rounded-lg bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-700 dark:text-white flex items-center justify-center text-xl font-bold transition-colors">+</button>
                            </div>
                            <p class="text-xs text-gray-500 mt-2">₹800/helper per move</p>
                        </div>

                        <!-- Packing Materials -->
                        <div v-if="form.packingRequired">
                            <label class="block text-sm text-gray-600 dark:text-gray-400 mb-2 font-medium">Packing
                                Materials</label>
                            <div class="space-y-2 max-h-44 overflow-y-auto no-scrollbar">
                                <div v-for="mat in store.materialsCatalog" :key="mat.key"
                                    class="flex justify-between items-center text-sm p-2 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                                    <div class="flex items-center gap-2">
                                        <span class="material-symbols-outlined text-sm text-gray-400">{{ mat.icon
                                            }}</span>
                                        <span class="text-gray-700 dark:text-gray-300 text-xs sm:text-sm">{{ mat.name
                                            }}</span>
                                    </div>
                                    <div class="flex items-center gap-2">
                                        <span class="text-xs text-gray-400">₹{{ mat.price }}/{{ mat.unit }}</span>
                                        <input type="number" :value="form.materials[mat.key] || 0"
                                            @input="form.materials[mat.key] = parseInt($event.target.value) || 0"
                                            min="0"
                                            class="w-14 bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded px-2 py-1 text-right text-gray-900 dark:text-white text-sm" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Section 4: Special Instructions -->
                <div class="glass-panel p-4 sm:p-6 rounded-xl">
                    <h3 class="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <span
                            class="w-6 h-6 rounded-full bg-green-500 text-white text-xs flex items-center justify-center font-bold">4</span>
                        Special Instructions
                    </h3>
                    <textarea v-model="form.instructions" rows="3"
                        placeholder="e.g., Handle fragile items carefully, use service elevator..."
                        class="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500/50 focus:border-green-500 outline-none transition-all resize-none"></textarea>
                </div>

                <!-- Section 5: Payment Mode -->
                <div class="glass-panel p-4 sm:p-6 rounded-xl">
                    <h3 class="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <span
                            class="w-6 h-6 rounded-full bg-green-500 text-white text-xs flex items-center justify-center font-bold">5</span>
                        Payment Mode
                    </h3>
                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <label v-for="mode in paymentModes" :key="mode.value"
                            class="p-3 rounded-xl border cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 transition-all flex items-center gap-3"
                            :class="form.paymentMode === mode.value ? 'border-green-500 bg-green-500/5' : 'border-gray-200 dark:border-white/10'">
                            <input type="radio" :value="mode.value" v-model="form.paymentMode"
                                class="accent-green-500" />
                            <div>
                                <span class="text-sm text-gray-900 dark:text-white font-medium">{{ mode.label }}</span>
                                <p class="text-xs text-gray-500">{{ mode.desc }}</p>
                            </div>
                        </label>
                    </div>
                </div>
            </div>

            <!-- Price Preview Sidebar -->
            <div>
                <div class="glass-panel p-4 sm:p-6 rounded-xl flex flex-col sticky top-[5.5rem] z-10">
                    <h3 class="font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                        <span class="material-symbols-outlined text-green-500">receipt_long</span>
                        Estimated Cost
                    </h3>

                    <div class="space-y-3 mb-6">
                        <div class="flex justify-between text-sm">
                            <span class="text-gray-500 dark:text-gray-400">Base Fare (~15km)</span>
                            <span class="text-gray-900 dark:text-white font-mono">₹{{ quote.base.toLocaleString()
                                }}</span>
                        </div>
                        <div class="flex justify-between text-sm">
                            <span class="text-gray-500 dark:text-gray-400">Labor ({{ form.laborCount }} × ₹800)</span>
                            <span class="text-gray-900 dark:text-white font-mono">₹{{ quote.labor.toLocaleString()
                                }}</span>
                        </div>
                        <div v-if="form.packingRequired" class="flex justify-between text-sm">
                            <span class="text-gray-500 dark:text-gray-400">Packing Service</span>
                            <span class="text-gray-900 dark:text-white font-mono">₹{{ quote.packing.toLocaleString()
                                }}</span>
                        </div>
                        <div v-if="materialsCostTotal > 0" class="flex justify-between text-sm">
                            <span class="text-gray-500 dark:text-gray-400">Materials</span>
                            <span class="text-gray-900 dark:text-white font-mono">₹{{
                                materialsCostTotal.toLocaleString() }}</span>
                        </div>
                    </div>

                    <div class="border-t border-gray-200 dark:border-white/10 pt-4 mb-6">
                        <div class="flex justify-between items-end">
                            <span class="text-lg font-bold text-gray-900 dark:text-white">Total</span>
                            <span class="text-3xl font-bold text-green-600 dark:text-primary">₹{{
                                totalCost.toLocaleString() }}</span>
                        </div>
                        <div class="text-xs text-gray-500 text-right mt-1">*Final price may vary by ±10%</div>
                    </div>

                    <button @click="confirmBooking"
                        class="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-colors text-lg mb-3 shadow-sm">
                        Confirm Booking
                    </button>
                    <button @click="saveQuote"
                        class="w-full py-3 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-white font-bold rounded-xl transition-colors">
                        Save as Quote
                    </button>
                </div>
            </div>
        </div>

        <!-- Toast -->
        <Teleport to="body">
            <transition enter-active-class="transition duration-300 ease-out" enter-from-class="translate-y-4 opacity-0"
                enter-to-class="translate-y-0 opacity-100" leave-active-class="transition duration-200 ease-in"
                leave-from-class="translate-y-0 opacity-100" leave-to-class="translate-y-4 opacity-0">
                <div v-if="toast.show"
                    class="fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-5 py-3 rounded-xl shadow-xl border max-w-sm"
                    :class="toast.type === 'success' ? 'bg-green-600 text-white border-green-500' : 'bg-red-600 text-white border-red-500'">
                    <span class="material-symbols-outlined">{{ toast.type === 'success' ? 'check_circle' : 'error'
                        }}</span>
                    <span class="text-sm font-medium">{{ toast.message }}</span>
                </div>
            </transition>
        </Teleport>

        <!-- Confirmation Modal -->
        <Teleport to="body">
            <BaseModal :isOpen="showConfirmModal" @close="showConfirmModal = false">
                <template #title>Booking Confirmed! 🎉</template>
                <div class="space-y-4">
                    <div class="text-center py-4">
                        <div
                            class="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center text-green-500 mx-auto mb-3">
                            <span class="material-symbols-outlined text-3xl">task_alt</span>
                        </div>
                        <p class="text-gray-700 dark:text-gray-300">Your move has been booked successfully!</p>
                        <div class="text-2xl font-mono font-bold text-green-600 dark:text-green-400 mt-2">{{
                            confirmedOrderId }}</div>
                    </div>
                    <div class="grid grid-cols-2 gap-3 text-sm">
                        <div class="p-3 bg-gray-50 dark:bg-white/5 rounded-lg">
                            <div class="text-xs text-gray-500 mb-1">Cargo</div>
                            <div class="font-medium text-gray-900 dark:text-white">{{ form.cargoType }}</div>
                        </div>
                        <div class="p-3 bg-gray-50 dark:bg-white/5 rounded-lg">
                            <div class="text-xs text-gray-500 mb-1">Total</div>
                            <div class="font-bold text-green-600 dark:text-green-400">₹{{ totalCost.toLocaleString() }}
                            </div>
                        </div>
                        <div class="p-3 bg-gray-50 dark:bg-white/5 rounded-lg">
                            <div class="text-xs text-gray-500 mb-1">Date</div>
                            <div class="font-medium text-gray-900 dark:text-white">{{ form.date }}</div>
                        </div>
                        <div class="p-3 bg-gray-50 dark:bg-white/5 rounded-lg">
                            <div class="text-xs text-gray-500 mb-1">Helpers</div>
                            <div class="font-medium text-gray-900 dark:text-white">{{ form.laborCount }}</div>
                        </div>
                    </div>
                </div>
                <template #footer>
                    <div class="flex gap-3 w-full">
                        <router-link to="/individual/orders"
                            class="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-bold text-center">View
                            Orders</router-link>
                        <button @click="showConfirmModal = false"
                            class="flex-1 py-2 bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-white/20 transition-colors text-sm font-medium">Close</button>
                    </div>
                </template>
            </BaseModal>
        </Teleport>
    </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { useIndividualStore } from '@/stores/individualStore'
import BaseModal from '@/components/BaseModal.vue'

const store = useIndividualStore()

const form = reactive({
    cargoType: 'Household Goods',
    pickup: '',
    destination: '',
    date: '',
    timeWindow: '09:00 AM - 12:00 PM',
    laborCount: 2,
    packingRequired: true,
    materials: { boxes: 10, bubbleWrap: 2, plasticCrates: 0, blankets: 4, wardrobeBoxes: 0, tape: 3 },
    instructions: '',
    paymentMode: 'Full Payment',
})

const cargoTypes = [
    { name: 'Household Goods', icon: 'chair' },
    { name: 'Furniture', icon: 'table_restaurant' },
    { name: 'Luggage / Boxes', icon: 'package_2' },
    { name: 'Fragile Items', icon: 'priority_high' },
    { name: 'Mixed Items', icon: 'category' },
]

const paymentModes = [
    { value: 'Full Payment', label: 'Full Payment', desc: 'Pay the full amount now' },
    { value: 'Partial', label: 'Partial Payment', desc: '50% now, rest on delivery' },
    { value: 'COD', label: 'Cash on Delivery', desc: 'Pay when delivered' },
]

const materialsCostTotal = computed(() => {
    let total = 0
    for (const mat of store.materialsCatalog) {
        total += (form.materials[mat.key] || 0) * mat.price
    }
    return total
})

const quote = computed(() => store.calculateQuote(15, form.laborCount, form.packingRequired, materialsCostTotal.value))
const totalCost = computed(() => quote.value.total)

// Toast notification
const toast = reactive({ show: false, message: '', type: 'success' })
function showToast(message, type = 'success') {
    toast.show = true
    toast.message = message
    toast.type = type
    setTimeout(() => { toast.show = false }, 3000)
}

// Confirmation modal
const showConfirmModal = ref(false)
const confirmedOrderId = ref('')

function confirmBooking() {
    if (!form.pickup || !form.destination || !form.date) {
        showToast('Please fill in all route details.', 'error')
        return
    }
    const order = store.createOrder({
        cargoType: form.cargoType,
        pickup: form.pickup,
        destination: form.destination,
        date: form.date,
        timeWindow: form.timeWindow,
        laborCount: form.laborCount,
        packingRequired: form.packingRequired,
        materials: { ...form.materials },
        cost: { ...quote.value },
        paymentMode: form.paymentMode,
    })
    confirmedOrderId.value = order.id
    showConfirmModal.value = true
}

function saveQuote() {
    store.addQuote({
        cargoType: form.cargoType,
        from: form.pickup || 'Not specified',
        to: form.destination || 'Not specified',
        laborCount: form.laborCount,
        packing: form.packingRequired,
        total: totalCost.value,
    })
    showToast('Quote saved successfully!')
}
</script>
