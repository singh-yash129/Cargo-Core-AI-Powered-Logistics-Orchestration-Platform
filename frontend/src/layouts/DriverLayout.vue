<template>
  <div
    class="dark driver-layout min-h-screen h-full overflow-x-hidden bg-background-dark text-white font-display antialiased">
    <SyncStatus />
    <RouteUpdateNotification ref="routeNotification" />
    <RatingNotification ref="ratingNotification" />
    <slot />
  </div>
</template>

<script setup>
import SyncStatus from '../driver-components/SyncStatus.vue'
import RouteUpdateNotification from '../driver-components/RouteUpdateNotification.vue'
import RatingNotification from '../driver-components/RatingNotification.vue'
</script>
