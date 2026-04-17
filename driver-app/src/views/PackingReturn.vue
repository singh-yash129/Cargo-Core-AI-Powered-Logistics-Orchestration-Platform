<template>
    <div class="screen-layout" :class="isDark ? 'bg-background-dark text-white' : 'bg-background-light text-gray-900'">

        <!-- Header -->
        <header class="flex-shrink-0 px-5 pt-5 pb-4 border-b"
            :class="isDark ? 'border-white/5' : 'border-gray-100'">
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <span class="material-icons text-primary text-xl">inventory_2</span>
                </div>
                <div>
                    <p class="text-xs uppercase tracking-wider font-bold text-primary">House Shift · Almost Done</p>
                    <h1 class="text-xl font-black">Packing Asset Return</h1>
                </div>
            </div>
        </header>

        <!-- Body -->
        <div class="screen-body flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">

            <!-- Loading -->
            <div v-if="loading" class="flex-1 flex flex-col items-center justify-center gap-4 py-16">
                <span class="material-icons text-4xl text-primary animate-spin">hourglass_empty</span>
                <p class="text-sm" :class="isDark ? 'text-gray-400' : 'text-gray-500'">Loading packing items…</p>
            </div>

            <template v-else>

            <!-- Info Banner -->
            <div class="rounded-2xl p-4 flex items-start gap-3"
                :class="isDark ? 'bg-primary/10 border border-primary/20' : 'bg-green-50 border border-green-200'">
                <span class="material-icons text-primary text-lg mt-0.5">info</span>
                <div>
                    <p class="text-sm font-bold" :class="isDark ? 'text-primary' : 'text-green-800'">Count what you have</p>
                    <p class="text-xs mt-0.5" :class="isDark ? 'text-primary/70' : 'text-green-700'">
                        Enter how many of each packing item you currently have in the vehicle. This helps the warehouse verify everything came back.
                    </p>
                </div>
            </div>

            <!-- Job Reference -->
            <div class="rounded-2xl border p-4 flex items-center justify-between"
                :class="isDark ? 'bg-surface-dark/40 border-white/8' : 'bg-white border-gray-100 shadow-sm'">
                <div>
                    <p class="text-xs uppercase tracking-wider font-semibold"
                        :class="isDark ? 'text-gray-400' : 'text-gray-500'">Order</p>
                    <p class="font-mono font-bold text-sm mt-0.5">{{ jobStore.jobData?.trackingCode || jobStore.jobData?.id || '—' }}</p>
                </div>
                <div class="text-right">
                    <p class="text-xs uppercase tracking-wider font-semibold"
                        :class="isDark ? 'text-gray-400' : 'text-gray-500'">Driver</p>
                    <p class="font-bold text-sm mt-0.5">{{ driverName }}</p>
                </div>
            </div>

            <!-- Packing Items List -->
            <div class="rounded-2xl border overflow-hidden"
                :class="isDark ? 'bg-surface-dark/40 border-white/8' : 'bg-white border-gray-100 shadow-sm'">

                <div class="px-4 py-3 border-b"
                    :class="isDark ? 'border-white/5' : 'border-gray-100'">
                    <p class="text-xs uppercase tracking-wider font-bold"
                        :class="isDark ? 'text-gray-400' : 'text-gray-500'">Items in Vehicle Right Now</p>
                </div>

                <div class="divide-y" :class="isDark ? 'divide-white/5' : 'divide-gray-100'">
                    <div v-for="item in packingItems" :key="item.name"
                        class="flex items-center justify-between px-4 py-4">

                        <!-- Item label -->
                        <div class="flex items-center gap-3 flex-1 min-w-0">
                            <div class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                                :class="isDark ? 'bg-white/5' : 'bg-gray-100'">
                                <span class="material-icons text-lg"
                                    :class="item.count > 0 ? 'text-primary' : (isDark ? 'text-gray-500' : 'text-gray-400')">
                                    {{ item.icon }}
                                </span>
                            </div>
                            <span class="text-sm font-semibold truncate">{{ item.name }}</span>
                        </div>

                        <!-- Counter -->
                        <div class="flex items-center gap-3 shrink-0 ml-3">
                            <button @click="decrement(item)"
                                class="w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-90"
                                :class="item.count > 0
                                    ? (isDark ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-red-50 text-red-500 border border-red-200')
                                    : (isDark ? 'bg-white/5 text-gray-600 border border-white/5' : 'bg-gray-100 text-gray-300 border border-gray-200')">
                                <span class="material-icons text-lg">remove</span>
                            </button>

                            <span class="w-10 text-center text-xl font-black tabular-nums"
                                :class="item.count > 0 ? 'text-primary' : (isDark ? 'text-gray-500' : 'text-gray-400')">
                                {{ item.count }}
                            </span>

                            <button @click="increment(item)"
                                class="w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-90"
                                :class="isDark
                                    ? 'bg-primary/20 text-primary border border-primary/30'
                                    : 'bg-green-50 text-green-600 border border-green-200'">
                                <span class="material-icons text-lg">add</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Notes -->
            <div>
                <p class="text-xs font-bold uppercase tracking-wider mb-2"
                    :class="isDark ? 'text-gray-400' : 'text-gray-500'">Notes (optional)</p>
                <textarea v-model="notes" rows="2"
                    placeholder="e.g. 1 dolly left at customer's site, collecting tomorrow..."
                    class="w-full rounded-xl px-4 py-3 text-sm border outline-none focus:ring-2 resize-none"
                    :class="isDark
                        ? 'bg-black/20 border-white/10 text-white placeholder-gray-600 focus:ring-primary/40'
                        : 'bg-gray-50 border-gray-200 focus:ring-green-400/40'" />
            </div>

            <!-- Summary -->
            <div v-if="totalItems > 0"
                class="rounded-2xl p-4 flex items-center justify-between"
                :class="isDark ? 'bg-primary/10 border border-primary/20' : 'bg-green-50 border border-green-200'">
                <p class="text-sm font-bold" :class="isDark ? 'text-primary' : 'text-green-800'">
                    Total items logged
                </p>
                <span class="text-2xl font-black text-primary">{{ totalItems }}</span>
            </div>

            </template><!-- end v-else loading -->
        </div>

        <!-- Footer -->
        <div class="screen-footer border-t px-5 pt-4 pb-4"
            :class="isDark ? 'border-white/5 bg-background-dark' : 'border-gray-100 bg-background-light'">

            <button v-if="!loading && totalItems === 0 && !notes.trim()" @click="skipWithConfirm"
                class="w-full mb-2 rounded-xl h-10 flex items-center justify-center gap-2 text-sm font-semibold transition-all"
                :class="isDark ? 'text-gray-500 border border-white/10' : 'text-gray-400 border border-gray-200'">
                <span class="material-icons text-base">skip_next</span>
                Skip (nothing to log)
            </button>

            <button @click="submit" :disabled="submitting || loading"
                class="w-full rounded-2xl h-14 flex items-center justify-center gap-3 relative overflow-hidden active:scale-[0.98] transition-all"
                :class="!submitting ? 'shadow-glow cursor-pointer' : 'opacity-50 cursor-not-allowed'">
                <div class="absolute inset-0"
                    :class="!submitting ? 'bg-gradient-to-r from-primary to-green-400' : (isDark ? 'bg-gray-700' : 'bg-gray-200')">
                </div>
                <span v-if="submitting" class="relative material-icons text-2xl text-black animate-spin">hourglass_empty</span>
                <span v-else class="relative material-icons text-2xl text-black">check_circle</span>
                <span class="relative text-lg font-black uppercase tracking-wide text-black">
                    {{ submitting ? 'Saving...' : 'Submit & Complete Job' }}
                </span>
            </button>
        </div>

    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useJobStore } from '../stores/jobStore.js'
import { useUiStore } from '../stores/uiStore.js'
import { useFlowRouter } from '../composables/useFlowRouter.js'
import * as api from '../services/api.js'

const jobStore  = useJobStore()
const uiStore   = useUiStore()
const { advanceAndNavigate } = useFlowRouter()
const isDark    = computed(() => uiStore.theme !== 'light')
const submitting = ref(false)
const loading    = ref(true)
const notes      = ref('')

const PACKING_RETURN_KEY = 'driver_packing_return_v1_'

// ── SKU → display metadata ─────────────────────────────────────────────────
const PKG_DISPLAY_MAP = {
    'PKG-CARTON':        { name: 'Cardboard Boxes',      icon: 'inventory_2'  },
    'PKG-BUBBLE-WRAP':   { name: 'Bubble Wrap (rolls)',  icon: 'layers'       },
    'PKG-PLASTIC-CRATE': { name: 'Plastic Crates',       icon: 'cases'        },
    'PKG-BLANKET':       { name: 'Moving Blankets',      icon: 'king_bed'     },
    'PKG-WARDROBE-BOX':  { name: 'Wardrobe Boxes',       icon: 'checkroom'    },
    'PKG-TAPE':          { name: 'Tape Rolls',            icon: 'straighten'  },
}

const PACKING_KEYWORDS = ['pack', 'wrap', 'box', 'carton', 'tape', 'blanket',
    'crate', 'film', 'pallet', 'protector', 'bag', 'bubble', 'foam', 'wardrobe']

function isPackingItem(sku, name) {
    if (sku && sku.startsWith('PKG-')) return true
    if (!name) return false
    const lower = name.toLowerCase()
    return PACKING_KEYWORDS.some(kw => lower.includes(kw))
}

function resolveDisplay(sku, nameFromApi) {
    if (sku && PKG_DISPLAY_MAP[sku]) return PKG_DISPLAY_MAP[sku]
    return { name: nameFromApi || sku || 'Item', icon: 'inventory_2' }
}

// ── Packing items (populated from order, NOT hardcoded) ───────────────────
const packingItems = ref([])

const totalItems = computed(() => packingItems.value.reduce((s, i) => s + i.count, 0))

const driverName = computed(() => {
    const d = jobStore.jobData
    return d?.driverName || d?.driver || 'Driver'
})

const orderId = computed(() => jobStore.jobData?.id || jobStore.jobData?.jobId || null)

// ── Increment / Decrement ─────────────────────────────────────────────────
function increment(item) { item.count++ }
function decrement(item) { if (item.count > 0) item.count-- }

// ── Submit ────────────────────────────────────────────────────────────────
async function submit() {
    if (submitting.value) return
    submitting.value = true

    const payload = {
        items: packingItems.value.map(i => ({ name: i.name, sku: i.sku || null, count: i.count })),
        notes: notes.value.trim(),
        submitted_at: new Date().toISOString(),
        order_id: orderId.value,
    }

    // 1. Save locally on the device (always succeeds)
    if (orderId.value) {
        try {
            localStorage.setItem(PACKING_RETURN_KEY + orderId.value, JSON.stringify(payload))
        } catch {}
    }

    // 2. Submit to backend (best-effort — don't block completion on failure)
    if (orderId.value) {
        try {
            await api.submitPackingReturn(orderId.value, payload)
        } catch (err) {
            console.warn('[PackingReturn] Backend submit failed — data saved locally:', err?.message)
        }
    }

    submitting.value = false
    uiStore.showToast('Assets logged! Job complete.', 'success', 3000)

    setTimeout(() => {
        advanceAndNavigate('COMPLETED', { packingReturnSubmitted: true })
    }, 400)
}

async function skipWithConfirm() {
    const payload = {
        items: [],
        notes: 'Skipped by driver',
        submitted_at: new Date().toISOString(),
        order_id: orderId.value,
        skipped: true,
    }
    if (orderId.value) {
        try { localStorage.setItem(PACKING_RETURN_KEY + orderId.value, JSON.stringify(payload)) } catch {}
        try { await api.submitPackingReturn(orderId.value, payload) } catch {}
    }
    advanceAndNavigate('COMPLETED', { packingReturnSkipped: true })
}

// ── Load packing items from order, restore any saved draft ────────────────
onMounted(async () => {
    if (!orderId.value) {
        loading.value = false
        return
    }

    // Fetch order items from backend
    const orderItems = await api.getOrderItems(orderId.value)
    const filtered = (orderItems || []).filter(i => isPackingItem(i.sku, i.name))

    if (filtered.length === 0) {
        // Customer did not select any packing materials — skip this screen silently
        loading.value = false
        await skipWithConfirm()
        return
    }

    // Build the items list from order data — prefer real inventory name, fall back to display map then SKU
    packingItems.value = filtered.map(i => {
        const display = resolveDisplay(i.sku, i.name || i.sku)
        return { name: display.name, icon: display.icon, sku: i.sku, count: 0 }
    })

    // Restore any saved draft counts
    try {
        const saved = localStorage.getItem(PACKING_RETURN_KEY + orderId.value)
        if (saved) {
            const parsed = JSON.parse(saved)
            if (parsed.items?.length) {
                parsed.items.forEach(savedItem => {
                    const item = packingItems.value.find(
                        i => i.sku === savedItem.sku || i.name === savedItem.name
                    )
                    if (item) item.count = savedItem.count || 0
                })
            }
            notes.value = parsed.notes || ''
        }
    } catch {}

    loading.value = false
})
</script>
