/**
 * aiApi.js
 * Typed wrapper around the backend /api/v1/ai/* endpoints.
 * Uses the project's existing authenticated fetch helper so token
 * refresh and error handling work exactly like the rest of the app.
 */
import { authenticatedJsonRequest } from '@/config/api'

const BASE = 'api/v1/ai'

/**
 * Send a chat message.
 * @param {string} message
 * @param {string|null} sessionId - pass null to start a new conversation
 * @returns {Promise<{ session_id: string, message: string, intent: string, sql_generated: string|null }>}
 */
export async function sendChat(message, sessionId = null) {
  return authenticatedJsonRequest(`${BASE}/chat`, {
    method: 'POST',
    body: JSON.stringify({ message, session_id: sessionId }),
  })
}

/**
 * List all chat sessions for the current user.
 * @returns {Promise<{ sessions: Array }>}
 */
export async function fetchSessions() {
  return authenticatedJsonRequest(`${BASE}/sessions`, { method: 'GET' })
}

/**
 * Load the full message history for a session.
 * @param {string} sessionId
 * @returns {Promise<{ session_id: string, messages: Array }>}
 */
export async function fetchConversation(sessionId) {
  return authenticatedJsonRequest(`${BASE}/conversations/${sessionId}`, { method: 'GET' })
}

/**
 * Escalate a conversation to a human agent.
 * @param {string} conversationId
 * @param {string} reason
 */
export async function escalateConversation(conversationId, reason) {
  return authenticatedJsonRequest(`${BASE}/escalate/${conversationId}`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  })
}

/**
 * Analyse a room image for a moving estimate (no auth required by the route).
 * @param {File} file
 */
export async function analyseRoomImage(file) {
  const formData = new FormData()
  formData.append('file', file)
  return authenticatedJsonRequest(`${BASE}/estimate-image`, {
    method: 'POST',
    body: formData,
  })
}
