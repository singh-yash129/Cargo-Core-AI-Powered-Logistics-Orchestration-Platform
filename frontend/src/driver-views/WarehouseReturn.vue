<template>
    <div
        class="bg-background-dark text-white min-h-screen flex flex-col font-display antialiased selection-custom pb-safe">
        <!-- Header -->
        <header class="px-6 pt-6 pb-2 z-10">
            <h1 class="text-2xl font-bold tracking-tight text-white mb-1">Warehouse Return</h1>
            <p class="text-gray-400 text-sm">Scan collected items for intake</p>
        </header>

        <!-- Main Content -->
        <main class="flex-1 px-6 flex flex-col pt-4 overflow-y-auto pb-32">

            <!-- Summary Card -->
            <div class="bg-surface-dark border border-white/5 rounded-xl p-4 mb-6 flex justify-between items-center">
                <div>
                    <p class="text-xs text-gray-500 uppercase tracking-wider mb-1">Total Collected</p>
                    <p class="text-2xl font-bold text-white">{{ collectedItems.length }} <span
                            class="text-sm font-normal text-gray-400">Items</span></p>
                </div>
                <div class="h-10 w-px bg-white/10"></div>
                <div>
                    <p class="text-xs text-gray-500 uppercase tracking-wider mb-1">To Scan</p>
                    <p class="text-2xl font-bold text-primary">{{ pendingCount }} <span
                            class="text-sm font-normal text-gray-400">Left</span></p>
                </div>
            </div>

            <!-- Item List -->
            <div class="space-y-4">
                <div v-for="item in collectedItems" :key="item.id"
                    class="bg-card-dark border rounded-xl p-4 transition-all relative overflow-hidden"
                    :class="item.scanned ? 'border-primary/50 bg-primary/5' : 'border-white/10 opacity-80'">
                    <div class="flex justify-between items-start z-10 relative">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-lg flex items-center justify-center"
                                :class="item.scanned ? 'bg-primary/20 text-primary' : 'bg-surface-dark text-gray-500'">
                                <span class="material-icons">{{ item.scanned ? 'check_circle' : 'inventory_2' }}</span>
                            </div>
                            <div>
                                <span class="text-xs font-mono text-gray-500 bg-white/5 px-1.5 py-0.5 rounded">{{
                                    item.id }}</span>
                                <p class="text-base font-semibold text-white mt-0.5">{{ item.description }}</p>
                                <div class="flex items-center gap-2 mt-1">
                                    <span
                                        class="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-white/5 text-gray-400 border border-white/5">{{
                                        item.condition }}</span>
                                    <span class="text-[10px] text-gray-500">From: {{ item.source }}</span>
                                </div>
                            </div>
                        </div>

                        <button @click="scanItem(item.id)"
                            class="w-10 h-10 rounded-full flex items-center justify-center transition-colors"
                            :class="item.scanned ? 'text-primary' : 'bg-surface-dark text-white hover:bg-white/10'"
                            :disabled="item.scanned">
                            <span class="material-icons">{{ item.scanned ? 'done' : 'qr_code_scanner' }}</span>
                        </button>
                    </div>

                    <!-- Scanned Pattern Overlay -->
                    <div v-if="item.scanned" class="absolute inset-0 bg-primary/5 pointer-events-none"></div>
                </div>
            </div>

            <!-- Discrepancy Alert -->
            <div v-if="hasDiscrepancy"
                class="mt-6 bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3 animate-pulse">
                <span class="material-icons text-red-500">warning</span>
                <div>
                    <p class="text-red-500 font-bold text-sm">Discrepancy Detected</p>
                    <p class="text-gray-400 text-xs mt-1">1 item marked as collected is missing from scan.</p>
                </div>
            </div>

        </main>

        <!-- Bottom Actions -->
        <div
            class="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background-dark via-background-dark/95 to-transparent z-20">
            <div class="flex gap-4 mb-4">
                <button
                    class="flex-1 bg-surface-dark border border-white/10 text-white py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2">
                    <span class="material-icons text-gray-400">print</span>
                    Print Manifest
                </button>
                <button
                    class="flex-1 bg-surface-dark border border-white/10 text-white py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2">
                    <span class="material-icons text-gray-400">edit</span>
                    Warehouse Sign
                </button>
            </div>

            <button @click="completeReturn"
                class="w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all flex items-center justify-center gap-2"
                :class="pendingCount === 0 ? 'bg-primary text-black hover:bg-primary-dark cursor-pointer' : 'bg-gray-800 text-gray-500 cursor-not-allowed'"
                :disabled="pendingCount > 0">
                <span class="material-icons">task_alt</span>
                Complete Handoff
            </button>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// Mock data - in real app, fetch from store (items collected today)
const collectedItems = ref([
    { id: 'RET-001', description: 'Defective Monitor', condition: 'Damaged', source: 'Return Center Inc', scanned: false },
    { id: 'RET-002', description: 'Unopened Keyboard', condition: 'Sealed', source: 'Return Center Inc', scanned: false },
    { id: 'RET-999', description: 'Wrong Size Shirt', condition: 'Opened', source: 'Sarah Connor', scanned: false }
])

const pendingCount = computed(() => collectedItems.value.filter(i => !i.scanned).length)
const hasDiscrepancy = ref(false) // Demo state

const scanItem = (id) => {
    const item = collectedItems.value.find(i => i.id === id)
    if (item) item.scanned = true
}

const completeReturn = () => {
    if (pendingCount.value === 0) {
        router.push('/shift-summary')
    }
}
</script>

<style scoped>
.pb-safe {
    padding-bottom: env(safe-area-inset-bottom);
}
</style>
