<template>
    <div class="screen-layout"
        :class="isDark ? 'bg-background-dark text-white' : 'bg-background-light text-gray-900'">

        <!-- Ambient glows -->
        <div class="absolute top-[-80px] left-[-60px] w-64 h-64 rounded-full pointer-events-none opacity-40 blur-3xl"
            style="background: radial-gradient(circle, rgba(28,231,131,0.08) 0%, transparent 70%);"></div>
        <div class="absolute bottom-[-60px] right-[-80px] w-96 h-96 rounded-full pointer-events-none opacity-40 blur-3xl"
            style="background: radial-gradient(circle, rgba(68,168,233,0.08) 0%, transparent 70%);"></div>

        <!-- ── Header ───────────────────────────────────────────────────── -->
        <!--
            pt-safe pushes content below the transparent Android status bar.
            Public pages are NOT wrapped by MainLayout's .status-bar-spacer,
            so they must apply pt-safe themselves.
        -->
        <header class="pt-safe shrink-0 pb-3 px-5 relative z-10 flex items-center">
            <div class="pt-3 flex items-center w-full">
                <button @click="router.back()"
                    class="w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-95"
                    :class="isDark ? 'bg-white/5 hover:bg-white/10 text-white' : 'bg-white shadow-sm border border-gray-100 text-gray-800'">
                    <span class="material-icons text-xl">arrow_back</span>
                </button>
                <div class="flex-1 text-center pr-10">
                    <h1 class="text-xl font-bold tracking-wide">Login Help</h1>
                    <p class="text-[10px] tracking-widest uppercase opacity-50 mt-0.5">Support & FAQ</p>
                </div>
            </div>
        </header>

        <!-- ── Scrollable Body ───────────────────────────────────────────── -->
        <main class="screen-body px-5 pt-2 pb-4 z-10">

            <!-- Section header -->
            <div class="mb-6 flex flex-col items-center text-center">
                <div class="w-16 h-16 rounded-3xl flex items-center justify-center mb-4 border"
                    :class="isDark ? 'bg-primary/10 border-primary/20' : 'bg-primary/10 border-primary/30'">
                    <span
                        class="material-icons text-3xl text-primary drop-shadow-[0_0_8px_rgba(28,231,131,0.6)]">support_agent</span>
                </div>
                <h2 class="text-2xl font-black mb-1.5 tracking-tight">Need Assistance?</h2>
                <p class="text-sm px-4" :class="isDark ? 'text-white/60' : 'text-gray-500'">
                    Find answers to common login issues or contact our dedicated dispatch team.
                </p>
            </div>

            <!-- FAQ Cards -->
            <div class="space-y-4">

                <!-- How do I log in? -->
                <div class="rounded-2xl p-4 border"
                    :class="isDark ? 'glass-panel border-white/10' : 'bg-white shadow-sm border-gray-100'">
                    <div class="flex items-start gap-3">
                        <div class="mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                            :class="isDark ? 'bg-white/5 text-primary' : 'bg-primary/5 text-primary'">
                            <span class="material-icons text-sm">login</span>
                        </div>
                        <div>
                            <h3 class="font-bold text-sm mb-1">How do I log in?</h3>
                            <p class="text-[13px] leading-relaxed" :class="isDark ? 'text-white/70' : 'text-gray-600'">
                                Enter your assigned <strong>Driver ID</strong> and your <strong>Password</strong> on
                                the login screen, then tap "Sign In".
                            </p>
                        </div>
                    </div>
                </div>

                <!-- What is my Driver ID? -->
                <div class="rounded-2xl p-4 border"
                    :class="isDark ? 'glass-panel border-white/10' : 'bg-white shadow-sm border-gray-100'">
                    <div class="flex items-start gap-3">
                        <div class="mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                            :class="isDark ? 'bg-white/5 text-primary' : 'bg-primary/5 text-primary'">
                            <span class="material-icons text-sm">badge</span>
                        </div>
                        <div>
                            <h3 class="font-bold text-sm mb-1">What is my Driver ID?</h3>
                            <p class="text-[13px] leading-relaxed" :class="isDark ? 'text-white/70' : 'text-gray-600'">
                                It's the unique identifier provided by your fleet manager (e.g.
                                <strong>DRV-1234</strong>). Check your welcome email or SMS.
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Default password -->
                <div class="rounded-2xl p-4 border"
                    :class="isDark ? 'glass-panel border-white/10' : 'bg-white shadow-sm border-gray-100'">
                    <div class="flex items-start gap-3">
                        <div class="mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                            :class="isDark ? 'bg-white/5 text-primary' : 'bg-primary/5 text-primary'">
                            <span class="material-icons text-sm">password</span>
                        </div>
                        <div>
                            <h3 class="font-bold text-sm mb-1">What is my default password?</h3>
                            <p class="text-[13px] leading-relaxed" :class="isDark ? 'text-white/70' : 'text-gray-600'">
                                Your default password combines your <strong>Driver ID</strong> with your
                                <strong>4-digit birth year</strong>.
                            </p>
                            <span
                                class="mt-2 inline-block px-3 py-1.5 rounded-lg text-xs font-mono border"
                                :class="isDark ? 'bg-white/5 border-white/10 text-primary/90' : 'bg-gray-50 border-gray-200 text-gray-700'">
                                DRV-2049 + 1990 → <b>DRV-20491990</b>
                            </span>
                        </div>
                    </div>
                </div>

                <!-- Account locked -->
                <div class="rounded-2xl p-4 border"
                    :class="isDark ? 'glass-panel border-white/10' : 'bg-white shadow-sm border-gray-100'">
                    <div class="flex items-start gap-3">
                        <div class="mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-red-500/10 text-red-500">
                            <span class="material-icons text-sm">lock_reset</span>
                        </div>
                        <div>
                            <h3 class="font-bold text-sm mb-1">Account locked or forgot password?</h3>
                            <p class="text-[13px] leading-relaxed" :class="isDark ? 'text-white/70' : 'text-gray-600'">
                                For security, drivers cannot self-reset passwords. Contact dispatch directly by
                                phone to verify your identity and restore access.
                            </p>
                        </div>
                    </div>
                </div>

                <div class="rounded-2xl p-4 border"
                    :class="isDark ? 'glass-panel border-white/10' : 'bg-white shadow-sm border-gray-100'">
                    <div class="flex items-start gap-3">
                        <div class="mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                            :class="isDark ? 'bg-white/5 text-primary' : 'bg-primary/5 text-primary'">
                            <span class="material-icons text-sm">usb</span>
                        </div>
                        <div>
                            <h3 class="font-bold text-sm mb-1">Seeing "Failed to fetch" on Android?</h3>
                            <p class="text-[13px] leading-relaxed" :class="isDark ? 'text-white/70' : 'text-gray-600'">
                                USB debugging does not automatically forward backend traffic. On a real phone, run
                                <strong>adb reverse tcp:8000 tcp:8000</strong>, or set the Android API URL to
                                <strong>http://&lt;your-computer-ip&gt;:8000</strong> and start the backend with
                                <strong>--host 0.0.0.0</strong>.
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </main>

        <!-- ── Footer CTA — in flex flow, always above gesture nav bar ───── -->
        <footer class="screen-footer shrink-0 px-5 pt-4 pb-safe z-10"
            :class="isDark ? 'border-t border-white/5' : 'border-t border-gray-100'">
            <div class="pb-3">
                <a href="tel:1-800-555-0199"
                    class="relative w-full h-[56px] flex items-center justify-center gap-2 rounded-2xl transition-transform active:scale-[0.97] bg-primary text-background-dark shadow-[0_4px_14px_rgba(28,231,131,0.4)]">
                    <span class="material-icons text-xl">call</span>
                    <span class="text-base font-bold tracking-wide">Call Dispatch Support</span>
                </a>
            </div>
        </footer>

    </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUiStore } from '../stores/uiStore.js'

const router = useRouter()
const uiStore = useUiStore()

const isDark = computed(() => uiStore.theme !== 'light')
</script>

