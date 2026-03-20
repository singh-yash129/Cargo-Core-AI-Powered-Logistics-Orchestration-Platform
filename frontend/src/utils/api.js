const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('auth_token')
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  
  const config = {
    ...options,
    headers,
  }
  
  const response = await fetch(`${endpoint}`, config)
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Request failed' }))
    throw new Error(error.detail || `HTTP ${response.status}`)
  }
  
  return response.json()
}

export const logisticsApi = {
  async getBootstrap() {
    return apiRequest('/api/v1/logistics/bootstrap')
  },
  
  async queryAI(query) {
    return apiRequest('/api/v1/logistics/ai/query', {
      method: 'POST',
      body: JSON.stringify({ query }),
    })
  },
  
  async createVehicle(data) {
    return apiRequest('/api/v1/logistics/vehicles', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },
  
  async updateVehicle(vehicleId, data) {
    return apiRequest(`/api/v1/logistics/vehicles/${vehicleId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },
  
  async createTransaction(data) {
    return apiRequest('/api/v1/logistics/transactions', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },
  
  async updateReturnCase(caseId, data) {
    return apiRequest(`/api/v1/logistics/returns/${caseId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },
  
  async createZone(data) {
    return apiRequest('/api/v1/logistics/zones', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },
  
  async updateZone(zoneId, data) {
    return apiRequest(`/api/v1/logistics/zones/${zoneId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },
  
  async deleteZone(zoneId) {
    return apiRequest(`/api/v1/logistics/zones/${zoneId}`, {
      method: 'DELETE',
    })
  },
  
  async addChatMessage(threadId, data) {
    return apiRequest(`/api/v1/logistics/chats/${threadId}/messages`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },
  
  async updateTask(taskId, data) {
    return apiRequest(`/api/v1/logistics/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },
  
  async updateNotification(notificationId, data) {
    return apiRequest(`/api/v1/logistics/notifications/${notificationId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },
  
  async markAllNotificationsRead() {
    return apiRequest('/api/v1/logistics/notifications/mark-all-read', {
      method: 'POST',
    })
  },
  
  async clearNotifications() {
    return apiRequest('/api/v1/logistics/notifications', {
      method: 'DELETE',
    })
  },
  
  async createAlert(data) {
    return apiRequest('/api/v1/logistics/alerts', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },
  
  async resolveAlert(alertId) {
    return apiRequest(`/api/v1/logistics/alerts/${alertId}/resolve`, {
      method: 'POST',
    })
  },
}
