<template>
    <div class="archived-shell">
        <div class="ambient-grid" aria-hidden="true"></div>
        <div class="ambient-orb ambient-orb--left" aria-hidden="true"></div>
        <div class="ambient-orb ambient-orb--right" aria-hidden="true"></div>

        <div v-if="isChecking" class="status-overlay">
            <div class="status-spinner"></div>
            <p>Checking live hub access...</p>
        </div>

        <div v-else class="archived-layout">
            <section class="hero-copy">
                <div class="topline">
                    <span class="status-pill">Hub Archived</span>
                    <span class="role-pill">{{ roleLabel }}</span>
                </div>

                <h1>{{ hubName }} is paused for live operations.</h1>
                <p class="lead">
                    {{ roleLabel }} access is temporarily locked because this hub has been archived by Logistics
                    Manager. The dashboard, live workflows, and new assignments stay offline until the hub is restored.
                </p>

                <div class="hub-meta">
                    <div class="meta-card">
                        <span class="meta-label">Hub</span>
                        <strong>{{ hubName }}</strong>
                    </div>
                    <div class="meta-card">
                        <span class="meta-label">Current State</span>
                        <strong>{{ hubStatus }}</strong>
                    </div>
                    <div class="meta-card">
                        <span class="meta-label">Access Scope</span>
                        <strong>{{ roleLabel }}</strong>
                    </div>
                </div>

                <div class="action-row">
                    <button class="primary-btn" @click="refreshAccess">Check Again</button>
                    <button class="secondary-btn" @click="returnToLogin">Back to Login</button>
                </div>

                <p class="support-note">
                    Access will return automatically after Logistics Manager restores this hub and reopens operations.
                </p>
            </section>

            <section class="animation-stage" aria-hidden="true">
                <div class="signal-stack">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>

                <div class="shutdown-ring shutdown-ring--outer"></div>
                <div class="shutdown-ring shutdown-ring--inner"></div>

                <div class="warehouse-core">
                    <div class="core-roof"></div>
                    <div class="core-body">
                        <div class="scanner-beam"></div>
                        <div class="bay bay--left"></div>
                        <div class="bay bay--center"></div>
                        <div class="bay bay--right"></div>
                    </div>
                </div>

                <div class="route-network">
                    <span class="route-line route-line--one"></span>
                    <span class="route-line route-line--two"></span>
                    <span class="route-line route-line--three"></span>
                    <span class="route-node route-node--one"></span>
                    <span class="route-node route-node--two"></span>
                    <span class="route-node route-node--three"></span>
                </div>

                <div class="crate-lane">
                    <div class="crate crate--one"></div>
                    <div class="crate crate--two"></div>
                    <div class="crate crate--three"></div>
                    <div class="crate crate--four"></div>
                    <div class="crate crate--five"></div>
                </div>

                <div class="status-marquee">
                    <span>Signals suspended</span>
                    <span>Routing frozen</span>
                    <span>Hub in archive state</span>
                </div>
            </section>
        </div>
    </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const isChecking = ref(true)

const isDispatcherRoute = computed(() => route.path.startsWith('/dispatcher'))
const roleLabel = computed(() => (isDispatcherRoute.value ? 'Dispatcher' : 'Warehouse Manager'))
const archivedRoute = computed(() => (isDispatcherRoute.value ? '/dispatcher/archived-access' : '/warehouse/archived-access'))
const dashboardRoute = computed(() => (isDispatcherRoute.value ? '/dispatcher/dashboard' : '/warehouse/dashboard'))
const hubName = computed(() =>
    authStore.assignedHubAccess?.warehouseName
    || authStore.currentUser?.warehouse_name
    || 'Assigned Hub'
)
const hubStatus = computed(() => authStore.currentUser?.warehouse_status || 'Archived')

async function verifyArchivedAccess(force = true) {
    if (!authStore.isAuthenticated) {
        router.replace('/login')
        return
    }

    isChecking.value = true
    const access = await authStore.ensureHubOperationalAccess(force)

    if (!access?.isArchived) {
        router.replace(dashboardRoute.value)
        return
    }

    if (route.path !== archivedRoute.value) {
        router.replace(archivedRoute.value)
        return
    }

    isChecking.value = false
}

function refreshAccess() {
    verifyArchivedAccess(true)
}

function returnToLogin() {
    const loginPath = authStore.logout()
    router.replace(loginPath)
}

onMounted(() => {
    verifyArchivedAccess(true)
})
</script>

<style scoped>
.archived-shell {
    min-height: 100vh;
    position: relative;
    overflow: hidden;
    background:
        radial-gradient(circle at 18% 18%, rgba(245, 158, 11, 0.12), transparent 30%),
        radial-gradient(circle at 82% 22%, rgba(16, 185, 129, 0.12), transparent 34%),
        linear-gradient(145deg, #020617 0%, #07111f 36%, #0f172a 100%);
    color: #e2e8f0;
    font-family: 'Inter', sans-serif;
}

.ambient-grid {
    position: absolute;
    inset: 0;
    background-image:
        linear-gradient(rgba(148, 163, 184, 0.08) 1px, transparent 1px),
        linear-gradient(90deg, rgba(148, 163, 184, 0.08) 1px, transparent 1px);
    background-size: 48px 48px;
    mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 0.75), transparent 92%);
}

.ambient-orb {
    position: absolute;
    border-radius: 999px;
    filter: blur(80px);
    opacity: 0.7;
}

.ambient-orb--left {
    width: 18rem;
    height: 18rem;
    top: 14%;
    left: -4rem;
    background: rgba(248, 113, 113, 0.14);
}

.ambient-orb--right {
    width: 22rem;
    height: 22rem;
    right: -6rem;
    bottom: 8%;
    background: rgba(14, 165, 233, 0.12);
}

.status-overlay {
    position: relative;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    z-index: 1;
    color: rgba(226, 232, 240, 0.82);
}

.status-spinner {
    width: 3rem;
    height: 3rem;
    border-radius: 999px;
    border: 3px solid rgba(148, 163, 184, 0.15);
    border-top-color: #f59e0b;
    animation: spin 0.9s linear infinite;
}

.archived-layout {
    position: relative;
    z-index: 1;
    min-height: 100vh;
    width: min(1240px, calc(100% - 2rem));
    margin: 0 auto;
    display: grid;
    grid-template-columns: minmax(0, 1.05fr) minmax(360px, 0.95fr);
    gap: 2rem;
    align-items: center;
    padding: 3rem 0;
}

.hero-copy {
    padding: 2rem 0;
}

.topline {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    margin-bottom: 1.5rem;
}

.status-pill,
.role-pill {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.45rem 0.9rem;
    border-radius: 999px;
    font-size: 0.75rem;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    border: 1px solid rgba(255, 255, 255, 0.12);
    backdrop-filter: blur(16px);
}

.status-pill {
    background: rgba(248, 113, 113, 0.12);
    color: #fca5a5;
}

.role-pill {
    background: rgba(15, 23, 42, 0.65);
    color: #cbd5e1;
}

h1 {
    margin: 0;
    max-width: 12ch;
    font-size: clamp(2.8rem, 5vw, 5rem);
    line-height: 0.98;
    letter-spacing: -0.05em;
    color: #f8fafc;
}

.lead {
    max-width: 42rem;
    margin-top: 1.5rem;
    font-size: 1.05rem;
    line-height: 1.9;
    color: rgba(226, 232, 240, 0.78);
}

.hub-meta {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 1rem;
    margin-top: 2rem;
}

.meta-card {
    padding: 1rem 1.1rem;
    border-radius: 1.25rem;
    border: 1px solid rgba(148, 163, 184, 0.14);
    background: linear-gradient(180deg, rgba(15, 23, 42, 0.72), rgba(15, 23, 42, 0.36));
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.meta-label {
    display: block;
    font-size: 0.72rem;
    text-transform: uppercase;
    letter-spacing: 0.14em;
    color: rgba(148, 163, 184, 0.85);
    margin-bottom: 0.65rem;
}

.meta-card strong {
    display: block;
    font-size: 1rem;
    color: #f8fafc;
}

.action-row {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    margin-top: 2rem;
}

.primary-btn,
.secondary-btn {
    min-width: 11rem;
    border-radius: 1rem;
    padding: 0.95rem 1.4rem;
    font-size: 0.92rem;
    font-weight: 700;
    border: 1px solid transparent;
    cursor: pointer;
    transition: transform 0.22s ease, box-shadow 0.22s ease, background 0.22s ease, border-color 0.22s ease;
}

.primary-btn {
    color: #0f172a;
    background: linear-gradient(135deg, #f59e0b, #f97316);
    box-shadow: 0 16px 40px rgba(249, 115, 22, 0.24);
}

.secondary-btn {
    color: #e2e8f0;
    background: rgba(15, 23, 42, 0.64);
    border-color: rgba(148, 163, 184, 0.18);
}

.primary-btn:hover,
.secondary-btn:hover {
    transform: translateY(-2px);
}

.secondary-btn:hover {
    border-color: rgba(245, 158, 11, 0.35);
    box-shadow: 0 16px 32px rgba(2, 6, 23, 0.28);
}

.support-note {
    margin-top: 1rem;
    font-size: 0.9rem;
    color: rgba(148, 163, 184, 0.92);
}

.animation-stage {
    position: relative;
    min-height: 42rem;
    display: flex;
    align-items: center;
    justify-content: center;
}

.signal-stack {
    position: absolute;
    top: 1.5rem;
    right: 3rem;
    display: flex;
    gap: 0.6rem;
}

.signal-stack span {
    width: 0.65rem;
    border-radius: 999px;
    background: linear-gradient(180deg, rgba(248, 113, 113, 0.92), rgba(127, 29, 29, 0.3));
    box-shadow: 0 0 22px rgba(248, 113, 113, 0.28);
    animation: dimPulse 2.8s ease-in-out infinite;
}

.signal-stack span:nth-child(1) {
    height: 2.4rem;
}

.signal-stack span:nth-child(2) {
    height: 3.5rem;
    animation-delay: 0.25s;
}

.signal-stack span:nth-child(3) {
    height: 4.7rem;
    animation-delay: 0.5s;
}

.shutdown-ring {
    position: absolute;
    border-radius: 999px;
    border: 1px solid rgba(248, 113, 113, 0.18);
}

.shutdown-ring--outer {
    width: 30rem;
    height: 30rem;
    animation: slowRotate 18s linear infinite;
}

.shutdown-ring--inner {
    width: 22rem;
    height: 22rem;
    border-color: rgba(14, 165, 233, 0.16);
    animation: slowRotateReverse 12s linear infinite;
}

.warehouse-core {
    position: relative;
    width: 21rem;
    height: 18rem;
}

.core-roof {
    width: 15rem;
    height: 3.6rem;
    margin: 0 auto;
    background: linear-gradient(180deg, rgba(148, 163, 184, 0.16), rgba(51, 65, 85, 0.72));
    clip-path: polygon(10% 100%, 50% 0%, 90% 100%);
    filter: drop-shadow(0 18px 40px rgba(15, 23, 42, 0.32));
}

.core-body {
    position: relative;
    width: 100%;
    height: 14.5rem;
    margin-top: -0.35rem;
    border-radius: 2rem;
    border: 1px solid rgba(148, 163, 184, 0.16);
    background:
        linear-gradient(180deg, rgba(15, 23, 42, 0.96), rgba(15, 23, 42, 0.64)),
        radial-gradient(circle at top, rgba(14, 165, 233, 0.1), transparent 48%);
    box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, 0.05),
        0 30px 80px rgba(2, 6, 23, 0.5);
}

.scanner-beam {
    position: absolute;
    top: 1.4rem;
    left: 50%;
    width: 11rem;
    height: 0.6rem;
    transform: translateX(-50%);
    border-radius: 999px;
    background: linear-gradient(90deg, transparent, rgba(14, 165, 233, 0.8), transparent);
    opacity: 0.65;
    animation: scanShutdown 4.4s ease-in-out infinite;
}

.bay {
    position: absolute;
    bottom: 1.6rem;
    width: 4.1rem;
    height: 6rem;
    border-radius: 1.1rem 1.1rem 0.8rem 0.8rem;
    border: 1px solid rgba(148, 163, 184, 0.12);
    background: linear-gradient(180deg, rgba(30, 41, 59, 0.84), rgba(15, 23, 42, 0.42));
    overflow: hidden;
}

.bay::after {
    content: '';
    position: absolute;
    inset: 0.7rem;
    border-radius: 0.75rem;
    background: linear-gradient(180deg, rgba(248, 113, 113, 0.12), rgba(2, 6, 23, 0.08));
    animation: shutterFade 3.2s ease-in-out infinite;
}

.bay--left {
    left: 1.7rem;
}

.bay--center {
    left: 50%;
    transform: translateX(-50%);
}

.bay--right {
    right: 1.7rem;
}

.route-network {
    position: absolute;
    inset: 0;
}

.route-line {
    position: absolute;
    height: 2px;
    background: linear-gradient(90deg, transparent, rgba(34, 197, 94, 0.6), rgba(248, 113, 113, 0.1));
    opacity: 0.4;
    animation: routeFade 4s ease-in-out infinite;
}

.route-line--one {
    width: 12rem;
    top: 10rem;
    left: 2rem;
    transform: rotate(-18deg);
}

.route-line--two {
    width: 10rem;
    right: 1.5rem;
    top: 15rem;
    transform: rotate(22deg);
    animation-delay: 0.35s;
}

.route-line--three {
    width: 13rem;
    bottom: 9rem;
    left: 4rem;
    transform: rotate(12deg);
    animation-delay: 0.7s;
}

.route-node {
    position: absolute;
    width: 0.9rem;
    height: 0.9rem;
    border-radius: 999px;
    background: rgba(248, 113, 113, 0.8);
    box-shadow: 0 0 16px rgba(248, 113, 113, 0.3);
    animation: nodeBlink 2.6s ease-in-out infinite;
}

.route-node--one {
    top: 8rem;
    left: 2.8rem;
}

.route-node--two {
    right: 3rem;
    top: 14rem;
    animation-delay: 0.35s;
}

.route-node--three {
    left: 5rem;
    bottom: 8rem;
    animation-delay: 0.7s;
}

.crate-lane {
    position: absolute;
    bottom: 5rem;
    left: 50%;
    width: 22rem;
    display: flex;
    justify-content: space-between;
    transform: translateX(-50%);
}

.crate {
    width: 2.8rem;
    height: 2.8rem;
    border-radius: 0.8rem;
    border: 1px solid rgba(251, 191, 36, 0.18);
    background:
        linear-gradient(135deg, rgba(251, 191, 36, 0.2), rgba(124, 58, 237, 0.02)),
        rgba(15, 23, 42, 0.8);
    box-shadow: 0 14px 28px rgba(2, 6, 23, 0.32);
    animation: crateDormant 4.2s ease-in-out infinite;
}

.crate--two {
    animation-delay: 0.2s;
}

.crate--three {
    animation-delay: 0.4s;
}

.crate--four {
    animation-delay: 0.6s;
}

.crate--five {
    animation-delay: 0.8s;
}

.status-marquee {
    position: absolute;
    bottom: 1.6rem;
    left: 50%;
    transform: translateX(-50%);
    width: min(26rem, calc(100% - 3rem));
    display: flex;
    justify-content: space-between;
    gap: 0.75rem;
    color: rgba(148, 163, 184, 0.82);
    font-size: 0.73rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

@keyframes dimPulse {
    0%,
    100% {
        opacity: 0.22;
        transform: scaleY(0.92);
    }

    50% {
        opacity: 0.85;
        transform: scaleY(1);
    }
}

@keyframes slowRotate {
    to {
        transform: rotate(360deg);
    }
}

@keyframes slowRotateReverse {
    to {
        transform: rotate(-360deg);
    }
}

@keyframes scanShutdown {
    0%,
    100% {
        opacity: 0.12;
        transform: translateX(-50%) scaleX(0.7);
    }

    45% {
        opacity: 0.72;
        transform: translateX(-50%) scaleX(1);
    }

    60% {
        opacity: 0.25;
        transform: translateX(-50%) scaleX(0.82);
    }
}

@keyframes shutterFade {
    0%,
    100% {
        opacity: 0.18;
    }

    35% {
        opacity: 0.58;
    }

    70% {
        opacity: 0.08;
    }
}

@keyframes routeFade {
    0%,
    100% {
        opacity: 0.08;
        transform: scaleX(0.92);
    }

    45% {
        opacity: 0.56;
        transform: scaleX(1);
    }

    70% {
        opacity: 0.14;
    }
}

@keyframes nodeBlink {
    0%,
    100% {
        opacity: 0.18;
        box-shadow: 0 0 10px rgba(248, 113, 113, 0.12);
    }

    50% {
        opacity: 1;
        box-shadow: 0 0 18px rgba(248, 113, 113, 0.4);
    }
}

@keyframes crateDormant {
    0%,
    100% {
        transform: translateY(0);
        opacity: 0.38;
    }

    40% {
        transform: translateY(-5px);
        opacity: 0.72;
    }

    70% {
        transform: translateY(0);
        opacity: 0.26;
    }
}

@media (max-width: 1100px) {
    .archived-layout {
        grid-template-columns: 1fr;
        padding: 2.5rem 0;
    }

    .hero-copy {
        order: 2;
    }

    .animation-stage {
        min-height: 32rem;
        order: 1;
    }

    h1 {
        max-width: 100%;
    }
}

@media (max-width: 720px) {
    .archived-layout {
        width: min(100%, calc(100% - 1.25rem));
        gap: 1rem;
    }

    .hero-copy {
        padding: 0.5rem 0 2rem;
    }

    .hub-meta {
        grid-template-columns: 1fr;
    }

    .action-row {
        flex-direction: column;
    }

    .primary-btn,
    .secondary-btn {
        width: 100%;
    }

    .animation-stage {
        min-height: 26rem;
    }

    .shutdown-ring--outer {
        width: 20rem;
        height: 20rem;
    }

    .shutdown-ring--inner {
        width: 15rem;
        height: 15rem;
    }

    .warehouse-core {
        width: 15rem;
        height: 13rem;
    }

    .core-roof {
        width: 10.5rem;
        height: 2.6rem;
    }

    .core-body {
        height: 10.5rem;
    }

    .bay {
        width: 2.9rem;
        height: 4.8rem;
    }

    .crate-lane {
        width: 16rem;
        bottom: 3.8rem;
    }

    .crate {
        width: 2.1rem;
        height: 2.1rem;
    }

    .status-marquee {
        flex-direction: column;
        align-items: center;
        gap: 0.25rem;
        text-align: center;
    }
}
</style>
