<template>
    <div
        class="bg-background-dark text-white min-h-screen flex flex-col font-display antialiased selection-custom pb-safe">
        <!-- Header -->
        <header class="px-6 pt-6 pb-2 flex justify-between items-start z-10">
            <div class="flex flex-col">
                <div class="flex items-center gap-2 mb-1">
                    <span :class="[
                        'text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider',
                        isExchange ? 'bg-accent-purple/10 text-accent-purple border-accent-purple/20' : 'bg-accent-blue/10 text-accent-blue border-accent-blue/20'
                    ]">
                        {{ isExchange ? 'Exchange' : 'Pickup' }}
                    </span>
                    <span class="text-xs text-gray-400">#{{ stopId }}</span>
                </div>
                <h1 class="text-2xl font-bold tracking-tight text-white">{{ stopData?.customerName || 'Customer' }}</h1>
                <p class="text-gray-400 text-sm mt-1">{{ stopData?.address }}</p>
            </div>
            <div class="w-10 h-10 rounded-full bg-surface-dark flex items-center justify-center border border-white/5">
                <span class="material-icons text-white">{{ isExchange ? 'sync_alt' : 'inventory_2' }}</span>
            </div>
        </header>

        <!-- Main Content -->
        <main class="flex-1 px-6 flex flex-col pt-4 overflow-y-auto pb-32">

            <!-- Exchange: Deliver First Section -->
            <div v-if="isExchange" class="mb-6">
                <div class="flex items-center justify-between mb-3">
                    <h3 class="text-xs font-bold text-gray-400 uppercase tracking-widest">1. Deliver Replacement</h3>
                    <span class="text-xs text-primary font-medium" v-if="deliveryCompleted">Completed</span>
                </div>
                <div class="bg-surface-dark/50 border border-white/5 rounded-xl p-4 flex items-center gap-4">
                    <div class="w-10 h-10 rounded-lg bg-surface-dark flex items-center justify-center">
                        <span class="material-icons text-gray-400">local_shipping</span>
                    </div>
                    <div class="flex-1">
                        <p class="text-sm font-medium text-white">{{ stopData.packages[0].id }}</p>
                        <p class="text-xs text-gray-500">Replacement Item</p>
                    </div>
                    <button @click="completeDeliveryPart" :class="[
                        'px-3 py-1.5 rounded-lg text-xs font-bold transition-colors',
                        deliveryCompleted ? 'bg-primary/20 text-primary cursor-default' : 'bg-primary text-black hover:bg-primary-dark'
                    ]" :disabled="deliveryCompleted">
                        {{ deliveryCompleted ? 'Done' : 'Handover' }}
                    </button>
                </div>
            </div>

            <!-- Pickup Section -->
            <div class="mb-4">
                <h3 class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">{{ isExchange ? '2. Collect Return' : 'Review Items to Pickup' }}</h3>

                <div class="space-y-4">
                    <div v-for="item in stopData.pickupItems" :key="item.id"
                        class="bg-card-dark border border-white/10 rounded-xl p-4 transition-all"
                        :class="isItemScanned(item.id) ? 'border-primary/50 bg-primary/5' : ''">
                        <div class="flex justify-between items-start mb-3">
                            <div>
                                <span class="text-xs font-mono text-gray-500 bg-white/5 px-1.5 py-0.5 rounded">{{
                                    item.id }}</span>
                                <p class="text-base font-semibold text-white mt-1">{{ item.description }}</p>
                            </div>
                            <button @click="scanItem(item.id)"
                                class="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                                :class="isItemScanned(item.id) ? 'bg-primary text-black' : 'bg-surface-dark text-gray-400 hover:bg-white/10'">
                                <span class="material-icons text-sm">{{ isItemScanned(item.id) ? 'check' :
                                    'qr_code_scanner' }}</span>
                            </button>
                        </div>

                        <!-- Condition Tagging -->
                        <div v-if="isItemScanned(item.id)" class="pt-3 border-t border-white/5 animate-fade-in-down">
                            <p class="text-[10px] text-gray-400 uppercase tracking-wider mb-2">Item Condition</p>
                            <div class="flex gap-2 flex-wrap">
                                <button v-for="tag in ['Sealed', 'Opened', 'Damaged', 'Wrong Item']" :key="tag"
                                    @click="setItemCondition(item.id, tag)" :class="[
                                        'px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors',
                                        itemConditions[item.id] === tag
                                            ? tag === 'Damaged' ? 'bg-red-500/20 border-red-500 text-red-500' : 'bg-primary/20 border-primary text-primary'
                                            : 'border-white/10 text-gray-400 hover:border-white/30'
                                    ]">
                                    {{ tag }}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </main>

        <!-- Bottom Actions -->
        <div
            class="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background-dark via-background-dark/95 to-transparent z-20">

            <!-- Camera FAB if needed -->
            <div class="absolute -top-16 right-6">
                <button
                    class="w-12 h-12 rounded-full bg-surface-dark border border-white/10 flex items-center justify-center shadow-lg active:scale-95 transition-transform">
                    <span class="material-icons text-white">add_a_photo</span>
                </button>
            </div>

            <div v-if="allScanned">
                <p class="text-center text-xs text-gray-400 mb-3">All items verified. Condition tags applied.</p>
                <SwipeButton text="CONFIRM PICKUP" @confirm="completePickup" />
            </div>
            <div v-else
                class="w-full bg-gray-800 text-gray-500 py-4 rounded-xl font-bold text-center cursor-not-allowed">
                Scan All Items to Proceed
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { dummyStops } from '../utils/dummyData'
import SwipeButton from '../driver-components/SwipeButton.vue'
import { useRouteStore } from '../stores/routeStore'

const route = useRoute()
const router = useRouter()
const routeStore = useRouteStore()

const stopId = route.params.stopId
const stopData = ref(null)
const scannedItems = ref(new Set())
const itemConditions = ref({})
const deliveryCompleted = ref(false)

const isExchange = computed(() => stopData.value?.type === 'exchange')

// Load stop data
onMounted(() => {
    // In a real app, fetch from store by ID
    // For demo, we might need to find it in dummyData manually if store not fully hydrated
    const stop = dummyStops.find(s => s.id == stopId) ||
    {
        type: 'pickup',
        pickupItems: [{ id: 'TEST-1', description: 'Demo Item' }],
        packages: [{ id: 'PKG-1' }]
    }
    stopData.value = stop
})

const isItemScanned = (id) => scannedItems.value.has(id)

const scanItem = (id) => {
    scannedItems.value.add(id)
}

const setItemCondition = (id, condition) => {
    itemConditions.value[id] = condition
}

const completeDeliveryPart = () => {
    deliveryCompleted.value = true
}

const allScanned = computed(() => {
    if (!stopData.value) return false
    const allItems = stopData.value.pickupItems.every(i => scannedItems.value.has(i.id))
    const deliverDone = isExchange.value ? deliveryCompleted.value : true
    // Also check if conditions are set for all scanned items
    const allConditions = stopData.value.pickupItems.every(i => itemConditions.value[i.id])
    return allItems && deliverDone && allConditions
})

const completePickup = () => {
    // Logic to save pickup status
    routeStore.completeDelivery(stopId) // Reusing delivery complete for now
    router.push(`/proof-of-delivery/${stopId}`)
}
</script>

<style scoped>
.pb-safe {
    padding-bottom: env(safe-area-inset-bottom);
}

@keyframes fade-in-down {
    from {
        opacity: 0;
        transform: translateY(-5px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.animate-fade-in-down {
    animation: fade-in-down 0.3s ease-out;
}
</style>
