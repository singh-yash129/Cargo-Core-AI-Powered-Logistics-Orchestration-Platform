/**
 * Camera Utilities
 * Shared logic for camera capture, OCR, and image handling
 */

/**
 * Normalize camera capture results to handle API inconsistencies
 * Some versions return {value: base64}, others return base64 directly
 */
export function normalizeCameraResult(result) {
  return result?.value || result
}

/**
 * Extract text from OCR results
 */
export function extractOcrText(ocrResult) {
  return ocrResult?.textElements?.map(el => el.text).join(' ') || ''
}

/**
 * Extract numbers from text (for odometer readings, etc.)
 */
export function extractNumbersFromText(text) {
  if (!text) return ''
  return text.replace(/[^0-9]/g, '')
}

/**
 * Validate base64 image data
 */
export function isValidBase64(data) {
  return typeof data === 'string' && data.length > 0
}
