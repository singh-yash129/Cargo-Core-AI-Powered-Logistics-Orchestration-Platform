<template>
    <div class="min-h-screen pb-safe overflow-y-auto no-scrollbar"
        :class="isDark ? 'bg-background-dark text-white' : 'bg-background-light text-gray-900'">
        <div class="px-5 pt-5 pb-10 flex flex-col gap-5">
            <div class="flex items-center gap-3">
                <button @click="$router.back()" class="w-10 h-10 rounded-full flex items-center justify-center border"
                    :class="isDark ? 'bg-surface-dark border-white/5 text-gray-400' : 'bg-white border-gray-200 shadow-sm'">
                    <span class="material-icons text-xl">arrow_back</span>
                </button>
                <div>
                    <h1 class="text-2xl font-black tracking-tight">Load Verification</h1>
                    <p class="text-xs" :class="isDark ? 'text-gray-400' : 'text-gray-500'">Scan every package before
                        departure</p>
                </div>
            </div>

            <div class="rounded-2xl p-5 border space-y-3"
                :class="isDark ? 'bg-surface-dark/40 border-white/8' : 'bg-white border-gray-100 shadow-sm'">
                <div class="flex justify-between items-center">
                    <h3 class="text-xs font-bold uppercase tracking-widest"
                        :class="isDark ? 'text-gray-400' : 'text-gray-500'">Package Manifest</h3>
                    <span class="font-bold text-primary">{{ scanned }} / {{ packages.length }}</span>
                </div>
                <div class="space-y-2">
                    <div v-for="pkg in packages" :key="pkg.barcode" @click="scanPkg(pkg)"
                        class="flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all active:scale-[0.98]"
                        :class="pkg.scanned
                            ? isDark ? 'bg-primary/8 border-primary/20' : 'bg-primary/8 border-primary/30'
                            : isDark ? 'bg-black/20 border-white/5 hover:border-primary/20' : 'bg-gray-50 border-gray-100 hover:border-primary/20'">
                        <span class="material-icons"
                            :class="pkg.scanned ? 'text-primary' : isDark ? 'text-gray-500' : 'text-gray-400'">inventory_2</span>
                        <div class="flex-1">
                            <p class="text-sm font-semibold">{{ pkg.description }}</p>
                            <p class="text-xs font-mono" :class="isDark ? 'text-gray-500' : 'text-gray-400'">{{
                                pkg.barcode }} · {{ pkg.weight }}</p>
                        </div>
                        <span class="material-icons"
                            :class="pkg.scanned ? 'text-primary' : isDark ? 'text-gray-700' : 'text-gray-300'">{{
                                pkg.scanned ? 'check_circle' : 'qr_code_scanner' }}</span>
                    </div>
                </div>
            </div>

            <button @click="proceed" :disabled="scanned < packages.length"
                class="w-full rounded-2xl h-14 flex items-center justify-center gap-2 font-bold transition-all active:scale-[0.98]"
                :class="scanned === packages.length ? 'bg-primary text-background-dark shadow-glow' : isDark ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-gray-100 text-gray-400 cursor-not-allowed'">
                <span class="material-icons">{{ scanned === packages.length ? 'check' : 'lock' }}</span>
                {{ scanned === packages.length ? 'All Verified · Proceed' : `${packages.length - scanned} packages
                remaining` }}
            </button>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUiStore } from '../stores/uiStore.js'

const router = useRouter()
const uiStore = useUiStore()
const isDark = computed(() => uiStore.theme !== 'light')

const packages = ref([
    { barcode: 'CC-001-2049', description: 'Electronics', weight: '2.3kg', scanned: false },
    { barcode: 'CC-002-2049', description: 'Documents', weight: '1.1kg', scanned: false },
    { barcode: 'CC-003-2049', description: 'Clothing Bundle', weight: '3.8kg', scanned: false },
    { barcode: 'CC-005-2049', description: 'Coffee Beans (Bulk)', weight: '12.0kg', scanned: false },
])

const scanned = computed(() => packages.value.filter(p => p.scanned).length)

function scanPkg(pkg) {
    pkg.scanned = true
    uiStore.showToast(`${pkg.barcode} scanned ✓`, 'success', 1200)
}

function proceed() {
    router.push('/crew')
}
</script>
