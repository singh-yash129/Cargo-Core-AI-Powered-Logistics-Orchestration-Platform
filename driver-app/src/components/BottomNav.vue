<template>
    <nav class="w-full">
        <div class="mx-3 mb-3 p-2 flex items-center justify-around rounded-full border shadow-2xl"
            :class="isDark ? 'bg-background-dark/95 backdrop-blur-xl border-white/10' : 'bg-white/95 backdrop-blur-xl border-gray-200'">

            <button v-for="item in navItems" :key="item.name" @click="navigate(item.route)"
                class="relative flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ease-in-out group"
                :class="isActive(item.route) ? 'bg-primary/15' : 'hover:bg-white/5'">

                <!-- Icon -->
                <div class="relative flex items-center justify-center">
                    <span class="material-icons text-[22px] transition-colors duration-300"
                        :class="isActive(item.route) ? 'text-primary' : isDark ? 'text-gray-400 group-hover:text-gray-300' : 'text-gray-400 group-hover:text-gray-600'">
                        {{ item.icon }}
                    </span>
                    <!-- Badge -->
                    <span v-if="item.badge" class="absolute w-2.5 h-2.5 rounded-full bg-red-500 ring-2" style="right: -0.35rem; top: -0.2rem;"
                        :class="isDark ? 'ring-background-dark' : 'ring-white'">
                    </span>
                </div>

            </button>
        </div>
    </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUiStore } from '../stores/uiStore.js'
import { useNotificationStore } from '../stores/notificationStore.js'
import { useJobStore } from '../stores/jobStore.js'
import { useRouteStore } from '../stores/routeStore.js'
import { openExternalNavigation } from '../utils/navigation.js'

const router = useRouter()
const route = useRoute()
const uiStore = useUiStore()
const notificationStore = useNotificationStore()
const jobStore = useJobStore()
const routeStore = useRouteStore()
const isDark = computed(() => uiStore.theme === 'dark')

const navItems = computed(() => {
    const base = [
        { name: 'home', label: 'Home', icon: 'home', route: '/dashboard', badge: null },
    ]

    // Tab 2: job-type-specific
    if (jobStore.jobType === 'HOUSE_SHIFT') {
        base.push({ name: 'crew', label: 'Crew', icon: 'groups', route: '/crew', badge: null })
    } else if (jobStore.jobType) {
        // Delivery or Pickup
        base.push({ name: 'manifest', label: 'Manifest', icon: 'list_alt', route: '/manifest', badge: null })
    }
    // If no job type → skip tab 2 (4 tabs only)

    base.push(
        { name: 'navigation', label: 'Navigate', icon: 'near_me', route: '/navigation', badge: null },
        { name: 'wallet', label: 'Wallet', icon: 'account_balance_wallet', route: '/wallet', badge: null },
        { name: 'notifications', label: 'Alerts', icon: 'notifications', route: '/notifications', badge: notificationStore.unreadCount > 0 ? notificationStore.unreadCount : null },
    )

    return base
})

function isActive(r) {
    if (r === '/dashboard') return route.path === '/dashboard' || route.path === '/'
    return route.path.startsWith(r)
}

function navigate(r) {
    if (r === '/navigation') {
        const currentStop = routeStore.currentStop
            || jobStore.currentStop
            || jobStore.jobData?.stops?.[0]
            || routeStore.stops?.[0]

        if (!currentStop) {
            uiStore.showToast('No stop available for navigation', 'error', 2200)
            return
        }

        if (!routeStore.stops.length && jobStore.jobData?.stops?.length) {
            routeStore.loadManifest({
                routeId: routeStore.manifest?.routeId || jobStore.jobData?.manifestId || null,
                endTime: routeStore.manifest?.endTime || '--:--',
                stops: jobStore.jobData.stops,
            })
        }

        if (!routeStore.isRouteActive) {
            routeStore.startRoute()
        }

        jobStore.setCurrentStopById(currentStop.id)
        routeStore.setCurrentStopById(currentStop.id)
        jobStore.ensureTransitState({
            startedAt: new Date().toISOString(),
            stopId: currentStop.id,
        })

        try {
            openExternalNavigation(currentStop)
            uiStore.showToast('Opening navigation in Maps', 'success', 1600)
        } catch (error) {
            uiStore.showToast(error.message || 'Unable to open maps', 'error', 2400)
            router.push(r)
        }
        return
    }

    router.push(r)
}
</script>
