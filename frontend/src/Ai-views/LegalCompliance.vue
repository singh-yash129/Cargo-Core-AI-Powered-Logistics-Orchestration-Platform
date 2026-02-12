<template>
    <div class="max-w-4xl mx-auto space-y-6">
        <h2 class="text-2xl font-bold text-white">Legal & Compliance</h2>

        <!-- Tabs -->
        <div class="flex gap-4 border-b border-white/10 pb-4">
            <button v-for="tab in tabs" :key="tab" @click="activeTab = tab"
                class="px-4 py-2 rounded-lg text-sm font-bold transition-colors"
                :class="activeTab === tab ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'">
                {{ tab }}
            </button>
        </div>

        <!-- Content Area -->
        <div class="glass-panel p-8 rounded-xl min-h-[500px]">
            <!-- Platform Rules -->
            <div v-if="activeTab === 'Platform Rules'" class="space-y-6 animate-fade-in">
                <h3 class="text-xl font-bold text-white mb-4">Platform Rules & Guidelines</h3>
                <div class="space-y-4 text-gray-300">
                    <p><strong>1. Driver Conduct:</strong> All drivers must maintain a professional demeanor. Harassment
                        or rude behavior towards customers will result in immediate suspension.</p>
                    <p><strong>2. Vehicle Safety:</strong> Vehicles must undergo weekly inspections. Failure to report
                        damages can lead to liability claims being denied.</p>
                    <p><strong>3. Cancellation Policy:</strong> Drivers cannot cancel a job within 1 hour of pickup
                        without valid proof of emergency.</p>
                    <p><strong>4. Payment Processing:</strong> All payments must go through the platform. Accepting cash
                        tips is allowed, but soliciting extra fees is prohibited.</p>
                    <p><strong>5. Substance Policy:</strong> Zero tolerance for drug or alcohol use while on duty.</p>
                </div>
            </div>

            <!-- Terms of Service -->
            <div v-if="activeTab === 'Terms of Service'" class="space-y-6 animate-fade-in">
                <h3 class="text-xl font-bold text-white mb-4">Terms of Service</h3>
                <div class="space-y-4 text-gray-300 h-96 overflow-y-auto pr-4 custom-scrollbar">
                    <p class="text-xs text-gray-500 uppercase font-bold">Last Updated: Oct 2024</p>
                    <p><strong>1. Acceptance of Terms:</strong> By accessing or using the QuadCore Logistics platform,
                        you agree to be bound by these Terms.</p>
                    <p><strong>2. User Accounts:</strong> You are responsible for maintaining the confidentiality of
                        your account password.</p>
                    <p><strong>3. Service Modifications:</strong> We reserve the right to modify or discontinue the
                        service at any time.</p>
                    <p><strong>4. Logistics Liability:</strong> QuadCore is not liable for damages caused by third-party
                        carriers beyond the insured value.</p>
                    <p><strong>5. Dispute Resolution:</strong> Any disputes shall be resolved through binding
                        arbitration.</p>
                    <p><strong>6. Data Usage:</strong> We collect location data to enable tracking features even when
                        the app is closed.</p>
                    <p>...</p>
                </div>
            </div>

            <!-- Privacy Policy -->
            <div v-if="activeTab === 'Privacy Policy'" class="space-y-6 animate-fade-in">
                <h3 class="text-xl font-bold text-white mb-4">Privacy & Data Policy</h3>
                <div class="space-y-4 text-gray-300">
                    <p><strong>1. Data Collection:</strong> We collect name, phone, email, and location data.</p>
                    <p><strong>2. Third-Party Sharing:</strong> We share data with insurance partners for claims
                        processing.</p>
                    <p><strong>3. User Rights:</strong> You have the right to request deletion of your data.</p>
                    <p><strong>4. Cookie Policy:</strong> We use cookies to enhance user experience.</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'

const tabs = ['Platform Rules', 'Terms of Service', 'Privacy Policy']
const activeTab = ref('Platform Rules')
</script>

<style scoped>
.animate-fade-in {
    animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(5px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>
