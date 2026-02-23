<template>
    <div class="relative" ref="popoverRef">
        <!-- Trigger Button -->
        <button @click="togglePopover"
            class="relative w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-white/5 transition-colors text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            :class="{ 'bg-gray-200 dark:bg-white/10 text-gray-900 dark:text-white': isOpen }">
            <span class="material-symbols-outlined text-[20px]">task_alt</span>
            <!-- Active Tasks Badge -->
            <span v-if="activeTasksCount > 0"
                class="absolute top-0 right-0 w-4 h-4 bg-primary text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-surface-light dark:border-background-dark">
                {{ activeTasksCount }}
            </span>
        </button>

        <!-- Popover -->
        <div v-show="isOpen"
            class="absolute right-0 mt-2 w-96 bg-white dark:bg-card-darker rounded-2xl shadow-xl border border-gray-200 dark:border-white/10 overflow-hidden z-50 transform origin-top-right transition-all duration-200"
            :class="isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'">

            <!-- Header -->
            <div
                class="p-4 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-gray-50/50 dark:bg-black/20">
                <h3 class="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <span class="material-symbols-outlined text-primary">checklist</span>
                    My Tasks
                </h3>
                <button @click="isAddingTask = !isAddingTask"
                    class="text-xs font-semibold px-2 py-1 rounded-md transition-colors"
                    :class="isAddingTask ? 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400' : 'bg-primary/10 text-primary hover:bg-primary/20'">
                    {{ isAddingTask ? 'Cancel' : '+ Add Task' }}
                </button>
            </div>

            <!-- Add Task Form -->
            <div v-if="isAddingTask"
                class="p-4 bg-gray-50 dark:bg-white/5 border-b border-gray-100 dark:border-white/5 space-y-3">
                <input v-model="newTask.text" type="text" placeholder="What needs to be done?"
                    class="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 transition-colors">

                <div class="flex gap-2">
                    <select v-model="newTask.status"
                        class="flex-1 bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg px-2 py-1.5 text-xs text-gray-700 dark:text-gray-300 focus:outline-none focus:border-primary/50 transition-colors cursor-pointer">
                        <option value="Backlog">Backlog</option>
                        <option value="To Do">To Do</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Priority">Priority</option>
                    </select>

                    <input v-model="newTask.timeString" type="time"
                        class="w-28 bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg px-2 py-1.5 text-xs text-gray-700 dark:text-gray-300 focus:outline-none focus:border-primary/50 transition-colors cursor-pointer">
                </div>

                <div class="flex justify-between items-center">
                    <select v-model="newTask.repeat"
                        class="w-32 bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg px-2 py-1.5 text-xs text-gray-700 dark:text-gray-300 focus:outline-none focus:border-primary/50 transition-colors cursor-pointer">
                        <option value="none">No Repeat</option>
                        <option value="5m">Every 5 min</option>
                        <option value="15m">Every 15 min</option>
                        <option value="30m">Every 30 min</option>
                        <option value="60m">Every 1 hour</option>
                        <option value="120m">Every 2 hours</option>
                    </select>

                    <button @click="addTask" :disabled="!newTask.text"
                        class="bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold py-1.5 px-4 rounded-lg transition-colors shadow-sm">
                        Save
                    </button>
                </div>
            </div>

            <!-- Task List -->
            <div class="max-h-[360px] overflow-y-auto no-scrollbar">
                <div v-if="tasks.length === 0" class="p-8 text-center text-gray-500 dark:text-gray-400">
                    <span class="material-symbols-outlined text-4xl mb-2 opacity-50">done_all</span>
                    <p class="text-sm">You have no tasks.</p>
                </div>

                <div v-else class="divide-y divide-gray-100 dark:divide-white/5">
                    <div v-for="task in sortedTasks" :key="task.id"
                        class="p-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group"
                        :class="{ 'opacity-60': task.status === 'Done' }">

                        <div class="flex items-start gap-3">
                            <!-- Status Toggle/Checkbox -->
                            <button @click="toggleTaskStatus(task)"
                                class="mt-0.5 w-5 h-5 rounded-full border flex flex-shrink-0 items-center justify-center transition-colors"
                                :class="task.status === 'Done' ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 dark:border-gray-600 hover:border-primary dark:hover:border-primary text-transparent'">
                                <span class="material-symbols-outlined text-[14px]">check</span>
                            </button>

                            <div class="flex-1 min-w-0">
                                <input v-model="task.text" @click.stop
                                    class="w-full bg-transparent border-none focus:ring-0 p-0 m-0 text-sm font-medium truncate transition-all duration-300 focus:outline-none"
                                    :class="task.status === 'Done' ? 'text-gray-400 dark:text-gray-500 line-through' : 'text-gray-900 dark:text-white'" />

                                <div class="flex flex-wrap items-center gap-2 mt-1.5">
                                    <select v-model="task.status" @change="onStatusChange(task)" @click.stop
                                        class="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border-none focus:ring-0 cursor-pointer appearance-none bg-transparent -ml-2"
                                        :class="getStatusColor(task.status)">
                                        <option value="Backlog" class="bg-white dark:bg-gray-800 text-gray-500">Backlog
                                        </option>
                                        <option value="To Do"
                                            class="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300">To Do
                                        </option>
                                        <option value="In Progress" class="bg-white dark:bg-gray-800 text-blue-500">In
                                            Progress</option>
                                        <option value="Priority" class="bg-white dark:bg-gray-800 text-red-500">Priority
                                        </option>
                                        <option value="Done" class="bg-white dark:bg-gray-800 text-green-500">Done
                                        </option>
                                    </select>

                                    <div class="flex items-center gap-1 rounded-md px-1"
                                        :class="isTaskOverdue(task) && task.status !== 'Done' ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'">
                                        <span class="material-symbols-outlined text-[12px]"
                                            :class="isTaskOverdue(task) && task.status !== 'Done' ? 'animate-pulse' : ''">schedule</span>
                                        <input type="time" v-model="task.timeString" @change="onTimeChange(task)"
                                            @click.stop
                                            class="bg-transparent border-none text-[10px] font-medium p-0 m-0 focus:ring-0 cursor-pointer h-4 leading-none"
                                            :class="isTaskOverdue(task) && task.status !== 'Done' ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'" />

                                        <select v-if="task.timeString" v-model="task.repeat"
                                            @change="onStatusChange(task)" @click.stop
                                            class="bg-transparent border-none text-[10px] font-medium p-0 m-0 focus:ring-0 cursor-pointer h-4 leading-none ml-1 appearance-none"
                                            :class="isTaskOverdue(task) && task.status !== 'Done' ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'"
                                            title="Repeat Interval">
                                            <option value="none">No Repeat</option>
                                            <option value="5m">5m</option>
                                            <option value="15m">15m</option>
                                            <option value="30m">30m</option>
                                            <option value="60m">1h</option>
                                            <option value="120m">2h</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <button @click.stop="deleteTask(task.id)"
                                class="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all p-1">
                                <span class="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Footer -->
            <div class="p-3 bg-gray-50 dark:bg-white/5 border-t border-gray-100 dark:border-white/5 text-center">
                <button v-if="tasks.filter(t => t.status === 'Done').length > 0" @click="clearDoneTasks"
                    class="text-xs text-gray-500 hover:text-gray-900 dark:hover:text-white font-medium transition-colors">
                    Clear completed tasks
                </button>
                <span v-else class="text-xs text-gray-400 italic">Manage your day efficiently</span>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const isOpen = ref(false)
const isAddingTask = ref(false)
const popoverRef = ref(null)

// Initialize dummy tasks
const tasks = ref([
    {
        id: 1,
        text: 'Review daily hub performance',
        status: 'Priority',
        targetTime: null,
        timeString: '',
        repeat: 'none',
        createdAt: Date.now()
    },
    {
        id: 2,
        text: 'Approve Fleet Maintenance',
        status: 'Done',
        targetTime: null,
        timeString: '',
        repeat: 'none',
        createdAt: Date.now() - 3600000
    }
])

const newTask = ref({
    text: '',
    status: 'To Do',
    timeString: '', // format: "HH:MM"
    repeat: 'none'
})

// --- Computed ---
const activeTasksCount = computed(() => tasks.value.filter(t => t.status !== 'Done').length)

const sortedTasks = computed(() => {
    return [...tasks.value].sort((a, b) => {
        // 'Done' tasks go to bottom
        if (a.status === 'Done' && b.status !== 'Done') return 1;
        if (b.status === 'Done' && a.status !== 'Done') return -1;

        // Priority sort for uncompleted tasks
        const statusMap = { 'Priority': 1, 'In Progress': 2, 'To Do': 3, 'Backlog': 4, 'Done': 5 }
        if (statusMap[a.status] !== statusMap[b.status]) {
            return statusMap[a.status] - statusMap[b.status]
        }

        // Time sort
        if (a.targetTime && b.targetTime) return a.targetTime - b.targetTime;
        if (a.targetTime) return -1;
        if (b.targetTime) return 1;

        return b.createdAt - a.createdAt;
    })
})

// --- Methods ---
const togglePopover = () => {
    isOpen.value = !isOpen.value
    if (!isOpen.value) {
        isAddingTask.value = false
    }
}

const addTask = () => {
    if (!newTask.value.text) return

    let targetTimeMs = null
    if (newTask.value.timeString) {
        const [hours, minutes] = newTask.value.timeString.split(':')
        const t = new Date()
        t.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0)

        // If time is in the past, assume it means tomorrow
        if (t.getTime() < Date.now()) {
            t.setDate(t.getDate() + 1)
        }
        targetTimeMs = t.getTime()
    }

    tasks.value.push({
        id: Date.now(),
        text: newTask.value.text,
        status: newTask.value.status,
        targetTime: targetTimeMs,
        timeString: newTask.value.timeString,
        repeat: newTask.value.repeat,
        createdAt: Date.now(),
        lastAlertTime: null // Used for repeat tracking
    })

    // Reset form
    newTask.value.text = ''
    newTask.value.timeString = ''
    newTask.value.status = 'To Do'
    newTask.value.repeat = 'none'
    isAddingTask.value = false
}

const toggleTaskStatus = (task) => {
    if (task.status === 'Done') {
        task.status = 'To Do'
    } else {
        task.status = 'Done'
        task.lastAlertTime = null // Stop alerts
    }
}

const onStatusChange = (task) => {
    if (task.status === 'Done') {
        task.lastAlertTime = null // Stop alerts
    } else {
        // If status changes to something else, and it's overdue, it will re-trigger on the next interval tick
        task.lastAlertTime = null
    }
}

const onTimeChange = (task) => {
    if (task.timeString) {
        const [hours, minutes] = task.timeString.split(':')
        const t = new Date()
        t.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0)

        // If time is in the past, assume it means tomorrow
        if (t.getTime() < Date.now()) {
            t.setDate(t.getDate() + 1)
        }
        task.targetTime = t.getTime()
    } else {
        task.targetTime = null
    }
    task.lastAlertTime = null // Reset alerts
}

const deleteTask = (id) => {
    tasks.value = tasks.value.filter(t => t.id !== id)
}

const clearDoneTasks = () => {
    tasks.value = tasks.value.filter(t => t.status !== 'Done')
}

// --- Display Helpers ---
const formatTime = (ms) => {
    if (!ms) return ''
    return new Date(ms).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const isTaskOverdue = (task) => {
    if (!task.targetTime) return false
    return Date.now() >= task.targetTime
}

const getStatusColor = (status) => {
    switch (status) {
        case 'Priority': return 'bg-red-500/10 text-red-500 border border-red-500/20'
        case 'In Progress': return 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
        case 'To Do': return 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
        case 'Backlog': return 'bg-gray-100 dark:bg-white/5 text-gray-500 border border-gray-200 dark:border-white/10'
        case 'Done': return 'bg-green-500/10 text-green-500 border border-green-500/20'
        default: return 'bg-gray-100 text-gray-600'
    }
}

// --- Alert System ---
let checkInterval = null
const dummyBeep = new Audio('data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU') // Silent dummy to satisfy object init, replace with real beep later if needed

const playAlert = () => {
    if (navigator.vibrate) {
        navigator.vibrate([200, 100, 200]) // Vibrate pattern: vibrate, pause, vibrate
    }
    // Attempt play (browser auto-play policies might block this if no user interaction occurred)
    try {
        dummyBeep.play().catch(e => console.warn('Audio play blocked/failed:', e))
    } catch (e) { }
}

const checkReminders = () => {
    const now = Date.now()

    tasks.value.forEach(task => {
        if (task.status === 'Done' || !task.targetTime) return

        if (now >= task.targetTime) {
            // First time alert
            if (!task.lastAlertTime) {
                playAlert()
                task.lastAlertTime = now
            }
            // Repeat logic if interval exists
            else if (task.repeat !== 'none') {
                const timeSinceLastAlert = now - task.lastAlertTime

                let repeatMs = 0
                if (task.repeat === '5m') repeatMs = 5 * 60000
                if (task.repeat === '15m') repeatMs = 15 * 60000
                if (task.repeat === '30m') repeatMs = 30 * 60000
                if (task.repeat === '60m') repeatMs = 60 * 60000
                if (task.repeat === '120m') repeatMs = 120 * 60000

                // If time since last alert is greater than repeat interval, alert again
                if (repeatMs > 0 && timeSinceLastAlert >= repeatMs) {
                    playAlert()
                    task.lastAlertTime = now
                }
            }
        }
    })
}

// Click outside handler
const handleClickOutside = (event) => {
    if (popoverRef.value && !popoverRef.value.contains(event.target)) {
        isOpen.value = false
    }
}

onMounted(() => {
    document.addEventListener('click', handleClickOutside)
    checkInterval = setInterval(checkReminders, 5000) // Check every 5 seconds
})

onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
    if (checkInterval) {
        clearInterval(checkInterval)
    }
})
</script>
