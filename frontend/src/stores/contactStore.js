import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

const STORAGE_KEY = 'cc_contact_submissions'

function loadFromStorage() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY)
        return raw ? JSON.parse(raw) : null
    } catch {
        return null
    }
}

const seedData = [
    {
        id: 'CF-001',
        name: 'Ahmed Al-Rashidi',
        email: 'ahmed.rashidi@example.com',
        phone: '+971 50 123 4567',
        subject: 'Shipment Delayed',
        category: 'delivery',
        message: 'My shipment with order #ORD-8821 was supposed to arrive 3 days ago but there is no update in the tracking system. Please advise.',
        priority: 'high',
        status: 'new',
        assignedTo: null,
        notes: '',
        submittedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
        updatedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    },
    {
        id: 'CF-002',
        name: 'Sara Johnson',
        email: 'sara.j@example.com',
        phone: '+1 555 987 6543',
        subject: 'Refund Request',
        category: 'billing',
        message: 'I was double-charged for my last order ORD-7710. Please process a refund for the duplicate transaction.',
        priority: 'medium',
        status: 'in_progress',
        assignedTo: 'CS Agent Priya',
        notes: 'Checking billing record with finance team.',
        submittedAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
        updatedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    },
    {
        id: 'CF-003',
        name: 'Raj Patel',
        email: 'raj.patel@vendorco.com',
        phone: '+91 98765 43210',
        subject: 'API Integration Issue',
        category: 'technical',
        message: 'The bulk upload API returns a 422 error when submitting more than 50 orders in one batch. This is blocking operations.',
        priority: 'urgent',
        status: 'new',
        assignedTo: null,
        notes: '',
        submittedAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
        updatedAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    },
    {
        id: 'CF-004',
        name: 'Linda Chen',
        email: 'linda.chen@enterprise.com',
        phone: '+65 9123 4567',
        subject: 'Partnership Inquiry',
        category: 'general',
        message: 'We are a logistics firm based in Singapore and would like to explore a partnership with Cargo-Core. Who should we contact?',
        priority: 'low',
        status: 'resolved',
        assignedTo: 'CS Agent Omar',
        notes: 'Forwarded to Business Development team. Closed.',
        submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    },
]

// Generate a sequential ID based on current max
function nextId(submissions) {
    const nums = submissions
        .map(s => parseInt(s.id.replace('CF-', ''), 10))
        .filter(n => !isNaN(n))
    const max = nums.length ? Math.max(...nums) : 0
    return `CF-${String(max + 1).padStart(3, '0')}`
}

export const useContactStore = defineStore('contact', () => {
    // Load from localStorage or fall back to seed data
    const submissions = ref(loadFromStorage() ?? seedData)

    // Persist every change to localStorage
    watch(submissions, (val) => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(val))
        } catch { /* quota exceeded – swallow */ }
    }, { deep: true })

    // ── Computed stats ───────────────────────────────────────────────
    const stats = computed(() => ({
        total: submissions.value.length,
        new: submissions.value.filter(s => s.status === 'new').length,
        inProgress: submissions.value.filter(s => s.status === 'in_progress').length,
        resolved: submissions.value.filter(s => s.status === 'resolved').length,
        urgent: submissions.value.filter(s => s.priority === 'urgent').length,
    }))

    // ── Public: submit a new contact form ───────────────────────────
    /**
     * @param {{ name, email, phone, category, subject, priority, message }} form
     * @returns {string} generated ticket ID
     */
    const submit = (form) => {
        const id = nextId(submissions.value)
        submissions.value.unshift({
            id,
            name: form.name ?? '',
            email: form.email ?? '',
            phone: form.phone ?? '',
            subject: form.subject ?? '',
            category: form.category ?? 'general',
            message: form.message ?? '',
            priority: form.priority ?? 'medium',
            status: 'new',
            assignedTo: null,
            notes: '',
            submittedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        })
        return id
    }

    // ── CS: update status / assignee / notes / priority ─────────────
    /**
     * @param {string} id  ticket ID
     * @param {object} payload  partial fields to merge
     */
    const update = (id, payload) => {
        const idx = submissions.value.findIndex(s => s.id === id)
        if (idx !== -1) {
            submissions.value[idx] = {
                ...submissions.value[idx],
                ...payload,
                updatedAt: new Date().toISOString(),
            }
        }
    }

    // ── CS: delete a submission ──────────────────────────────────────
    const remove = (id) => {
        submissions.value = submissions.value.filter(s => s.id !== id)
    }

    // ── CS: clear all resolved tickets ──────────────────────────────
    const clearResolved = () => {
        submissions.value = submissions.value.filter(s => s.status !== 'resolved')
    }

    return { submissions, stats, submit, update, remove, clearResolved }
})
