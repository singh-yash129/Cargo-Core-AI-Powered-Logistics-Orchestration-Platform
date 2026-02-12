<template>
    <div class="bg-background-dark text-white min-h-screen flex flex-col p-6 font-display antialiased">
        <header class="mb-8">
            <h1 class="text-2xl font-bold tracking-tight text-white mb-2">Safety Compliance</h1>
            <p class="text-gray-400 text-sm">Please acknowledge the following before starting your shift.</p>
        </header>

        <main class="flex-1 space-y-4">

            <div v-for="(item, index) in safetyChecks" :key="index" @click="toggleCheck(index)"
                class="bg-surface-dark border border-white/5 p-4 rounded-xl flex items-start gap-4 transition-all cursor-pointer"
                :class="item.checked ? 'border-primary/50 bg-primary/5' : ''">
                <div class="w-6 h-6 rounded border-2 flex items-center justify-center shrink-0 mt-1 transition-colors"
                    :class="item.checked ? 'bg-primary border-primary' : 'border-gray-500'">
                    <span v-if="item.checked" class="material-icons text-black text-sm font-bold">check</span>
                </div>
                <div>
                    <h3 class="text-sm font-bold text-white mb-1">{{ item.title }}</h3>
                    <p class="text-xs text-gray-400">{{ item.description }}</p>
                </div>
            </div>

        </main>

        <div class="mt-6">
            <button @click="confirmCompliance"
                class="w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all flex items-center justify-center gap-2"
                :class="allChecked ? 'bg-primary text-black hover:bg-primary-dark' : 'bg-gray-800 text-gray-500 cursor-not-allowed'"
                :disabled="!allChecked">
                <span class="material-icons">verified_user</span>
                Accept & Start Shift
            </button>
            <p class="text-center text-[10px] text-gray-500 mt-4">
                By tapping "Accept", you digitally sign this compliance record.
                <br>Logged at {{ currentTime }} • GPS Verified
            </p>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const currentTime = new Date().toLocaleTimeString()

const safetyChecks = ref([
    { title: "Fit to Drive", description: "I am well-rested and not under the influence of any substances.", checked: false },
    { title: "Valid License", description: "My driver's license is valid and in my possession.", checked: false },
    { title: "Vehicle Safe", description: "I have visually inspected the vehicle and believe it is safe to operate.", checked: false },
    { title: "No Distractions", description: "I agree to use the 'Do Not Disturb' driving mode while in motion.", checked: false }
])

const toggleCheck = (index) => {
    safetyChecks.value[index].checked = !safetyChecks.value[index].checked
}

const allChecked = computed(() => safetyChecks.value.every(c => c.checked))

const confirmCompliance = () => {
    // In real app, save compliance record
    router.push('/vehicle-inspection')
}
</script>
