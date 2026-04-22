<template>
    <div class="screen-layout" :class="isDark ? 'bg-background-dark text-white' : 'bg-background-light text-gray-900'">

        <!-- ── HEADER ───────────────────────────────── -->
        <header class="flex-shrink-0 px-5 pt-5 pb-4 border-b" :class="isDark ? 'border-white/5' : 'border-gray-100'">
            <div class="flex items-center gap-3 mb-3">
                <button @click="$router.back()"
                    class="w-10 h-10 rounded-full flex items-center justify-center border flex-shrink-0"
                    :class="isDark ? 'bg-surface-dark border-white/5 text-gray-400' : 'bg-white border-gray-200 shadow-sm'">
                    <span class="material-icons text-xl">arrow_back</span>
                </button>
                <div>
                    <p class="text-xs text-primary font-bold uppercase tracking-wider mb-0.5">Driver Wallet</p>
                    <h1 class="text-xl font-black leading-tight">Earnings</h1>
                </div>
            </div>

            <!-- Hero Balance Card -->
            <div class="rounded-3xl p-5 relative overflow-hidden"
                :style="isDark
                    ? 'background: linear-gradient(135deg, #0d2117 0%, #1a3929 50%, #0a1a0f 100%); border: 1px solid rgba(28,231,131,0.3);'
                    : 'background: linear-gradient(135deg, #e8faf0 0%, #d4f5e3 50%, #e0f8ea 100%); border: 1px solid rgba(28,231,131,0.3);'">
                <div class="absolute -top-8 -right-8 w-32 h-32 bg-primary/20 rounded-full blur-3xl pointer-events-none">
                </div>
                <p class="text-xs font-bold uppercase tracking-widest text-primary/70 mb-1">{{ periods[activePeriod] }}
                    Total</p>
                <div class="text-5xl font-black mb-3"
                    style="background: linear-gradient(135deg,#1CE783,#44a8e9); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">
                    ₹{{ currentEarnings.total.toLocaleString('en-IN') }}
                </div>
                <div class="flex gap-3">
                    <div v-for="period in ['Today', 'Week', 'Month']" :key="period" class="flex-1 text-center">
                        <p class="text-[10px] uppercase font-bold text-primary/50">{{ period }}</p>
                        <p class="text-sm font-bold" :class="isDark ? 'text-white' : 'text-gray-800'">₹{{
                            allEarnings[period.toLowerCase()]?.total?.toLocaleString('en-IN') }}</p>
                    </div>
                </div>
            </div>

            <!-- Period Tabs -->
            <div class="flex gap-2 mt-3">
                <button v-for="(label, i) in periods" :key="i" @click="activePeriod = i"
                    class="flex-1 py-2 rounded-xl text-sm font-bold uppercase tracking-wide border transition-all"
                    :class="activePeriod === i
                        ? 'bg-primary text-background-dark border-primary'
                        : isDark ? 'bg-surface-dark/30 border-white/5 text-gray-400' : 'bg-white border-gray-200 text-gray-500'">
                    {{ label }}
                </button>
            </div>
        </header>

        <!-- ── SCROLLABLE BODY ───────────────────────── -->
        <div class="screen-body px-5 py-4 flex flex-col gap-4">

            <!-- Earnings Breakdown -->
            <div class="rounded-2xl border overflow-hidden"
                :class="isDark ? 'border-white/5' : 'border-gray-100 shadow-sm'">
                <div class="px-4 py-3 border-b"
                    :class="isDark ? 'bg-surface-dark/50 border-white/5' : 'bg-gray-50 border-gray-100'">
                    <p class="text-xs font-bold uppercase tracking-widest"
                        :class="isDark ? 'text-gray-400' : 'text-gray-500'">Breakdown</p>
                </div>
                <div class="divide-y" :class="isDark ? 'divide-gray-800' : 'divide-gray-100'">
                    <div v-for="row in earningRows" :key="row.label"
                        class="flex justify-between items-center px-4 py-4">
                        <div class="flex items-center gap-3">
                            <div class="w-8 h-8 rounded-xl flex items-center justify-center" :class="row.bg">
                                <span class="material-icons text-sm" :class="row.color">{{ row.icon }}</span>
                            </div>
                            <span class="text-sm font-semibold">{{ row.label }}</span>
                        </div>
                        <span class="text-lg font-black">₹{{ currentEarnings[row.key]?.toLocaleString('en-IN') }}</span>
                    </div>
                </div>
            </div>

            <!-- Scorecard -->
            <div class="rounded-2xl p-4 border"
                :class="isDark ? 'bg-surface-dark/30 border-white/5' : 'bg-white border-gray-100 shadow-sm'">
                <h3 class="text-xs font-bold uppercase tracking-widest mb-3"
                    :class="isDark ? 'text-gray-400' : 'text-gray-500'">Performance</h3>
                <div class="grid grid-cols-3 gap-3 text-center">
                    <div v-for="score in scorecard" :key="score.label" class="rounded-xl p-3 border"
                        :class="isDark ? 'bg-black/20 border-white/5' : 'bg-gray-50 border-gray-100'">
                        <p class="text-xl font-black" :class="score.color">{{ score.value }}</p>
                        <p class="text-[9px] uppercase mt-0.5" :class="isDark ? 'text-gray-500' : 'text-gray-400'">{{
                            score.label }}</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- ── STICKY FOOTER ────────────────────────── -->
        <div class="screen-footer border-t"
            :class="isDark ? 'border-white/5 bg-background-dark' : 'border-gray-100 bg-background-light'">
            <div class="px-5 pt-4 pb-2">
                <button @click="handleCashout"
                    class="w-full h-12 rounded-2xl bg-primary/10 border border-primary/20 text-primary font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.97]">
                    <span class="material-icons">account_balance_wallet</span>
                    Cashout to Bank · ₹{{ currentEarnings.total.toLocaleString('en-IN') }}
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useUiStore } from '../stores/uiStore.js'
import { useDriverStore } from '../stores/driverStore.js'
import * as api from '../services/api.js'

const uiStore = useUiStore()
const driverStore = useDriverStore()
const isDark = computed(() => uiStore.theme !== 'light')

const cashoutRequested = ref(false)

async function handleCashout() {
    if (cashoutRequested.value) return
    const total = currentEarnings.value.total
    if (!total) {
        uiStore.showToast('No earnings to cashout', 'warning', 2000)
        return
    }
    cashoutRequested.value = true
    try {
        await api.requestCashout(total)
        uiStore.showToast(`Cashout of ₹${total.toLocaleString('en-IN')} requested ✓`, 'success', 3000)
    } catch (err) {
        uiStore.showToast(err.message || 'Cashout failed', 'error', 2500)
        cashoutRequested.value = false
    }
}

const periods = ['Today', 'Week', 'Month']
const activePeriod = ref(0)

// Get earnings from driver dashboard or use defaults
const dashboardEarnings = computed(() => driverStore.dashboard?.earnings || {})

// Build earnings data from dashboard or fallback to zeros
const allEarnings = computed(() => {
    const earnings = dashboardEarnings.value

    return {
        today: {
            base: earnings.today_base || 0,
            deliveries: earnings.today_deliveries || 0,
            move: earnings.today_move || 0,
            tips: earnings.today_tips || 0,
            total: (earnings.today_base || 0) + (earnings.today_deliveries || 0) + (earnings.today_move || 0) + (earnings.today_tips || 0)
        },
        week: {
            base: earnings.week_base || 0,
            deliveries: earnings.week_deliveries || 0,
            move: earnings.week_move || 0,
            tips: earnings.week_tips || 0,
            total: (earnings.week_base || 0) + (earnings.week_deliveries || 0) + (earnings.week_move || 0) + (earnings.week_tips || 0)
        },
        month: {
            base: earnings.month_base || 0,
            deliveries: earnings.month_deliveries || 0,
            move: earnings.month_move || 0,
            tips: earnings.month_tips || 0,
            total: (earnings.month_base || 0) + (earnings.month_deliveries || 0) + (earnings.month_move || 0) + (earnings.month_tips || 0)
        }
    }
})

const currentEarnings = computed(() => allEarnings.value[periods[activePeriod.value].toLowerCase()])

const earningRows = [
    { label: 'Base Pay', key: 'base', icon: 'payments', bg: 'bg-primary/15', color: 'text-primary' },
    { label: 'Delivery Bonus', key: 'deliveries', icon: 'place', bg: 'bg-accent-blue/15', color: 'text-accent-blue' },
    { label: 'Move Premium', key: 'move', icon: 'home', bg: 'bg-accent-purple/15', color: 'text-accent-purple' },
    { label: 'Tips', key: 'tips', icon: 'favorite', bg: 'bg-accent-gold/15', color: 'text-accent-gold' },
]

// Get performance data from driver profile
const driverProfile = computed(() => driverStore.driver || {})
const scorecard = computed(() => [
    { label: 'Rating', value: `${driverProfile.value.rating || 0}★`, color: 'text-accent-gold' },
    { label: 'On-Time', value: `${driverProfile.value.onTimePercent || 0}%`, color: 'text-primary' },
    { label: 'Safety', value: `${dashboardEarnings.value.safety_score ?? driverProfile.value.safetyScore ?? 0}`, color: 'text-accent-blue' },
])
</script>
