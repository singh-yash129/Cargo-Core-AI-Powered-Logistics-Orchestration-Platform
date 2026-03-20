<template>
    <Teleport to="body">
        <div v-if="isOpen" class="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            @click.self="emit('close')">
            <div class="w-full max-w-lg rounded-2xl border border-white/10 bg-slate-950/95 shadow-2xl overflow-hidden">
                <div class="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-slate-900/90">
                    <div>
                        <h3 class="text-lg font-bold text-white">Smart Scanner</h3>
                        <p class="text-xs text-gray-400">Scan a barcode or capture a quick proof image.</p>
                    </div>
                    <button @click="emit('close')" class="text-gray-400 hover:text-white transition-colors">
                        <span class="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div class="p-5 space-y-5">
                    <div class="grid grid-cols-2 gap-2 rounded-xl bg-slate-900/80 p-1 border border-white/10">
                        <button @click="activeTab = 'scan'" class="rounded-lg px-4 py-2 text-sm font-semibold transition-colors"
                            :class="activeTab === 'scan' ? 'bg-primary text-white' : 'text-gray-300 hover:bg-white/5'">
                            Scan
                        </button>
                        <button @click="activeTab = 'camera'" class="rounded-lg px-4 py-2 text-sm font-semibold transition-colors"
                            :class="activeTab === 'camera' ? 'bg-primary text-white' : 'text-gray-300 hover:bg-white/5'">
                            Camera
                        </button>
                    </div>

                    <template v-if="activeTab === 'scan'">
                        <div class="rounded-2xl border border-dashed border-primary/40 bg-primary/5 p-6 text-center">
                            <span class="material-symbols-outlined text-primary text-[40px]">qr_code_scanner</span>
                            <p class="mt-3 text-sm text-gray-300">Paste or type the barcode to simulate a scan.</p>
                        </div>
                        <input v-model="scanValue" type="text" placeholder="e.g. ASN-0092"
                            class="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-primary/50">
                        <button @click="submitScan" class="w-full rounded-xl bg-primary py-3 font-semibold text-white hover:bg-primary/90 transition-colors">
                            Submit Scan
                        </button>
                    </template>

                    <template v-else>
                        <div class="rounded-2xl border border-dashed border-emerald-400/30 bg-emerald-400/5 p-6 text-center">
                            <span class="material-symbols-outlined text-emerald-400 text-[40px]">photo_camera</span>
                            <p class="mt-3 text-sm text-gray-300">Capture a placeholder image for the workflow.</p>
                        </div>
                        <button @click="submitCamera" class="w-full rounded-xl bg-emerald-500 py-3 font-semibold text-white hover:bg-emerald-400 transition-colors">
                            Capture Image
                        </button>
                    </template>
                </div>
            </div>
        </div>
    </Teleport>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
    isOpen: {
        type: Boolean,
        default: false,
    },
    defaultTab: {
        type: String,
        default: 'scan',
    },
})

const emit = defineEmits(['close', 'scan', 'camera'])

const activeTab = ref(props.defaultTab)
const scanValue = ref('')

watch(
    () => props.isOpen,
    (open) => {
        if (!open) return
        activeTab.value = props.defaultTab || 'scan'
        scanValue.value = ''
    },
)

watch(
    () => props.defaultTab,
    (value) => {
        activeTab.value = value || 'scan'
    },
)

const submitScan = () => {
    emit('scan', scanValue.value.trim() || `SCAN-${Date.now()}`)
    emit('close')
}

const submitCamera = () => {
    emit('camera', {
        id: `camera-${Date.now()}`,
        name: 'Captured Image',
        preview: 'https://placehold.co/800x500/png?text=Warehouse+Capture',
    })
    emit('close')
}
</script>
