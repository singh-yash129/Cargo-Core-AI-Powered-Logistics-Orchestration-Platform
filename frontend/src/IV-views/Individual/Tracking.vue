<template>
    <div class="space-y-6">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span class="material-symbols-outlined text-green-500">gps_fixed</span>
            Real-Time Tracking
        </h2>

        <div v-if="activeMove" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Map Area -->
            <div class="lg:col-span-2 glass-panel rounded-xl overflow-hidden">
                <div
                    class="h-72 sm:h-96 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-900 relative">
                    <!-- Map Placeholder -->
                    <div class="absolute inset-0 flex items-center justify-center">
                        <div class="text-center">
                            <span class="material-symbols-outlined text-6xl text-gray-400 dark:text-gray-600">map</span>
                            <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">Live GPS Map</p>
                        </div>
                    </div>

                    <!-- ETA Badge -->
                    <div
                        class="absolute top-3 left-3 bg-white/90 dark:bg-black/80 backdrop-blur-sm px-4 py-2 rounded-lg shadow-sm">
                        <div class="text-[10px] text-gray-500 uppercase font-bold">ETA</div>
                        <div class="text-lg font-bold text-green-600 dark:text-green-400">{{ activeMove.eta ||
                            'Calculating...' }}</div>
                    </div>

                    <!-- Progress Badge -->
                    <div
                        class="absolute top-3 right-3 bg-white/90 dark:bg-black/80 backdrop-blur-sm px-4 py-2 rounded-lg shadow-sm">
                        <div class="text-[10px] text-gray-500 uppercase font-bold">Progress</div>
                        <div class="text-lg font-bold text-blue-600 dark:text-blue-400">{{ activeMove.progress }}%</div>
                    </div>

                    <!-- Geofence Alert -->
                    <div v-if="geofenceAlert"
                        class="absolute bottom-3 left-3 right-3 bg-green-600 text-white px-4 py-3 rounded-lg flex items-center gap-3 animate-pulse shadow-lg">
                        <span class="material-symbols-outlined">location_on</span>
                        <div>
                            <div class="text-sm font-bold">Crew Arriving!</div>
                            <div class="text-xs">Your driver is within 50 meters of the pickup location.</div>
                        </div>
                    </div>
                </div>

                <!-- Progress Bar -->
                <div class="p-4 border-t border-gray-200 dark:border-white/5">
                    <div class="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
                        <span>Pickup</span>
                        <span>In Transit</span>
                        <span>Delivered</span>
                    </div>
                    <div class="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                        <div class="bg-green-500 h-full rounded-full transition-all duration-500"
                            :style="{ width: activeMove.progress + '%' }"></div>
                    </div>
                </div>
            </div>

            <!-- Details Panel -->
            <div class="space-y-4">
                <!-- Driver Card -->
                <div class="glass-panel p-4 sm:p-5 rounded-xl" v-if="activeMove.driver">
                    <h3 class="font-bold text-gray-900 dark:text-white mb-3 text-sm">Driver & Crew</h3>
                    <div class="flex items-center gap-3 mb-3">
                        <div
                            class="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white font-bold text-sm">
                            {{activeMove.driver.name.split(' ').map(n => n[0]).join('')}}
                        </div>
                        <div>
                            <div class="font-bold text-gray-900 dark:text-white">{{ activeMove.driver.name }}</div>
                            <div class="text-xs text-gray-500 dark:text-gray-400">{{ activeMove.driver.rating }} ★ ·
                                Team Lead</div>
                        </div>
                    </div>
                    <div class="flex gap-2">
                        <button
                            class="flex-1 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-1">
                            <span class="material-symbols-outlined text-sm">call</span> Call
                        </button>
                        <button
                            class="flex-1 py-2 bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-white text-sm font-bold rounded-lg hover:bg-gray-200 dark:hover:bg-white/20 transition-colors flex items-center justify-center gap-1">
                            <span class="material-symbols-outlined text-sm">chat</span> Chat
                        </button>
                    </div>
                    <div
                        class="mt-3 p-2 bg-gray-50 dark:bg-white/5 rounded-lg text-xs text-gray-500 dark:text-gray-400">
                        <span class="font-medium">Helpers:</span> {{ activeMove.laborCount }} assigned
                    </div>
                </div>

                <!-- Order Info -->
                <div class="glass-panel p-4 sm:p-5 rounded-xl">
                    <h3 class="font-bold text-gray-900 dark:text-white mb-3 text-sm">Order Details</h3>
                    <div class="space-y-2 text-sm">
                        <div class="flex justify-between"><span class="text-gray-500 dark:text-gray-400">Order
                                ID</span><span class="font-mono font-bold text-green-600 dark:text-green-400">{{
                                activeMove.id }}</span></div>
                        <div class="flex justify-between"><span
                                class="text-gray-500 dark:text-gray-400">Cargo</span><span
                                class="text-gray-900 dark:text-white font-medium">{{ activeMove.cargoType }}</span>
                        </div>
                        <div class="flex justify-between"><span
                                class="text-gray-500 dark:text-gray-400">Date</span><span
                                class="text-gray-900 dark:text-white font-medium">{{ activeMove.date }}</span></div>
                        <div class="flex justify-between"><span
                                class="text-gray-500 dark:text-gray-400">Time</span><span
                                class="text-gray-900 dark:text-white font-medium">{{ activeMove.timeWindow }}</span>
                        </div>
                    </div>
                </div>

                <!-- Service Checklist -->
                <div class="glass-panel p-4 sm:p-5 rounded-xl">
                    <h3 class="font-bold text-gray-900 dark:text-white mb-3 text-sm flex items-center gap-2">
                        <span class="material-symbols-outlined text-purple-500 text-lg">checklist</span>
                        Service Checklist
                    </h3>
                    <div class="space-y-2">
                        <div v-for="task in serviceChecklist" :key="task.text" class="flex items-center gap-3 text-sm">
                            <span class="material-symbols-outlined text-lg"
                                :class="task.done ? 'text-green-500' : 'text-gray-300 dark:text-gray-600'">
                                {{ task.done ? 'check_circle' : 'radio_button_unchecked' }}
                            </span>
                            <span :class="task.done ? 'text-gray-400 line-through' : 'text-gray-900 dark:text-white'">{{
                                task.text }}</span>
                        </div>
                    </div>
                </div>

                <button @click="toggleGeofence"
                    class="w-full py-2.5 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-white text-sm font-bold rounded-lg transition-colors flex items-center justify-center gap-2 border border-gray-200 dark:border-white/5">
                    <span class="material-symbols-outlined text-sm">{{ geofenceAlert ? 'notifications_active' :
                        'notifications' }}</span>
                    {{ geofenceAlert ? 'Geofence Alert Active' : 'Simulate Arrival Alert' }}
                </button>
            </div>
        </div>

        <div v-else class="glass-panel p-12 rounded-xl text-center text-gray-500 dark:text-gray-400">
            <span class="material-symbols-outlined text-5xl block mb-3">location_off</span>
            <p class="font-medium text-lg">No active move to track.</p>
            <router-link to="/individual/book-move"
                class="text-green-600 dark:text-green-400 text-sm font-bold hover:underline mt-2 inline-block">Book a
                Move →</router-link>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useIndividualStore } from '@/stores/individualStore'

const store = useIndividualStore()
const activeMove = computed(() => store.activeOrders[0])
const geofenceAlert = ref(false)

function toggleGeofence() { geofenceAlert.value = !geofenceAlert.value }

const serviceChecklist = ref([
    { text: 'Arrive at pickup location', done: true },
    { text: 'Check-in laborers', done: true },
    { text: 'Pack kitchen utensils', done: false },
    { text: 'Move sofa to 2nd floor', done: false },
    { text: 'Handle fragile items carefully', done: false },
    { text: 'Complete PoD and signatures', done: false },
])
</script>
