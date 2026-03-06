<template>
    <div class="min-h-screen pb-safe-nav overflow-y-auto no-scrollbar"
        :class="isDark ? 'bg-background-dark text-white' : 'bg-background-light text-gray-900'">
        <div class="px-5 pt-5 pb-8 flex flex-col gap-5">

            <!-- Header -->
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-xs font-bold uppercase tracking-wider text-primary mb-0.5">Driver Wallet</p>
                    <h1 class="text-3xl font-black tracking-tight">Earnings</h1>
                </div>
                <div class="flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold text-primary"
                    :class="isDark ? 'bg-primary/10 border-primary/20' : 'bg-primary/10 border-primary/30'">
                    <span class="relative w-1.5 h-1.5 rounded-full bg-primary animate-pulse flex-shrink-0"></span>
                    Synced
                </div>
            </div>

            <!-- Balance Hero Card -->
            <div class="rounded-3xl p-6 relative overflow-hidden aspect-video flex flex-col justify-between"
                style="background: linear-gradient(135deg, #1CE783 0%, #0ea855 40%, #0d7a40 100%);">
                <div class="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
                <div class="absolute -bottom-8 -left-8 w-36 h-36 bg-white/5 rounded-full blur-2xl"></div>

                <div class="flex justify-between items-start z-10">
                    <div>
                        <p class="text-xs font-bold text-background-dark/60 uppercase tracking-widest">Today's Earnings
                        </p>
                        <div class="text-5xl font-black text-background-dark mt-1">₹{{
                            earnings.today.total.toLocaleString() }}</div>
                    </div>
                    <div class="p-2 bg-background-dark/15 rounded-2xl">
                        <span class="material-icons text-background-dark text-2xl">account_balance_wallet</span>
                    </div>
                </div>

                <div class="z-10 flex justify-between items-end">
                    <div>
                        <p class="text-xs font-bold text-background-dark/60 uppercase mb-0.5">Driver ID</p>
                        <p class="text-sm font-bold text-background-dark/90">DRV-2049 · Arjun Sharma</p>
                    </div>
                    <div class="text-right">
                        <p class="text-xs font-bold text-background-dark/60 uppercase mb-0.5">Badge</p>
                        <p class="text-sm font-bold text-background-dark/90 flex items-center gap-1">
                            <span class="material-icons text-background-dark/80 text-sm">military_tech</span>
                            Pro Driver
                        </p>
                    </div>
                </div>
            </div>

            <!-- Period Tabs -->
            <div class="flex gap-2 rounded-xl border p-1"
                :class="isDark ? 'bg-surface-dark/30 border-white/5' : 'bg-white border-gray-100 shadow-sm'">
                <button v-for="p in periods" :key="p.id" @click="period = p.id"
                    class="flex-1 py-2 rounded-lg text-sm font-bold transition-all"
                    :class="period === p.id ? 'bg-primary text-background-dark' : isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-800'">
                    {{ p.label }}
                </button>
            </div>

            <!-- Earnings Breakdown -->
            <div class="rounded-2xl border p-5 space-y-4"
                :class="isDark ? 'bg-surface-dark/30 border-white/5' : 'bg-white border-gray-100 shadow-sm'">
                <div v-for="row in earningsRows" :key="row.label" class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-xl flex items-center justify-center" :class="row.bg">
                            <span class="material-icons text-sm" :class="row.color">{{ row.icon }}</span>
                        </div>
                        <span class="text-sm font-medium">{{ row.label }}</span>
                    </div>
                    <span class="font-bold text-sm">₹{{ row.value.toLocaleString() }}</span>
                </div>
                <div class="border-t pt-4" :class="isDark ? 'border-gray-700' : 'border-gray-100'">
                    <div class="flex justify-between items-center">
                        <span class="font-bold">Total</span>
                        <span class="text-xl font-black text-primary">₹{{ currentEarnings.total.toLocaleString()
                            }}</span>
                    </div>
                </div>
            </div>

            <!-- Performance Scorecard -->
            <div class="rounded-2xl border p-5"
                :class="isDark ? 'bg-surface-dark/30 border-white/5' : 'bg-white border-gray-100 shadow-sm'">
                <h3 class="text-xs font-bold uppercase tracking-widest mb-4"
                    :class="isDark ? 'text-gray-400' : 'text-gray-500'">Performance Scorecard</h3>
                <div class="grid grid-cols-3 gap-4">
                    <div v-for="metric in scorecard" :key="metric.label" class="text-center">
                        <div class="text-2xl font-black" :class="metric.color">{{ metric.value }}</div>
                        <div class="text-[10px] uppercase font-medium mt-0.5"
                            :class="isDark ? 'text-gray-400' : 'text-gray-500'">{{ metric.label }}</div>
                    </div>
                </div>
            </div>

            <!-- Request Cashout -->
            <button
                class="w-full rounded-2xl h-14 flex items-center justify-center gap-2 font-bold text-background-dark shadow-glow transition-all active:scale-[0.98]"
                style="background: linear-gradient(135deg, #1CE783, #15b86a);">
                <span class="material-icons">account_balance</span>
                Request Cashout
            </button>

            <div class="py-2 text-center">
                <p class="text-xs" :class="isDark ? 'text-gray-500' : 'text-gray-400'">
                    Bank settlement every Friday by 18:00 IST
                </p>
            </div>
        </div>
        <BottomNav />
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useUiStore } from '../stores/uiStore.js'
import BottomNav from '../components/BottomNav.vue'
import { dummyEarnings } from '../utils/dummyData.js'

const uiStore = useUiStore()
const isDark = computed(() => uiStore.theme !== 'light')

const period = ref('today')
const periods = [
    { id: 'today', label: 'Today' },
    { id: 'week', label: 'Week' },
    { id: 'month', label: 'Month' },
]

const earnings = ref(dummyEarnings)
const currentEarnings = computed(() => earnings.value[period.value])

const earningsRows = computed(() => [
    { label: 'Base Pay', icon: 'work', value: currentEarnings.value.base, bg: 'bg-primary/15', color: 'text-primary' },
    { label: 'Delivery Bonus', icon: 'local_shipping', value: currentEarnings.value.deliveries, bg: 'bg-accent-blue/15', color: 'text-accent-blue' },
    { label: 'Move Premium', icon: 'inventory_2', value: currentEarnings.value.move, bg: 'bg-accent-purple/15', color: 'text-accent-purple' },
    { label: 'Tips', icon: 'thumb_up', value: currentEarnings.value.tips, bg: 'bg-accent-gold/15', color: 'text-accent-gold' },
])

const scorecard = [
    { label: 'Rating', value: '4.9★', color: 'text-accent-gold' },
    { label: 'On-Time', value: '96%', color: 'text-primary' },
    { label: 'Safety', value: '98%', color: 'text-accent-blue' },
]
</script>
