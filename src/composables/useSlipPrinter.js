/**
 * useSlipPrinter — opens CargoCore HTML slips with real data injected.
 * Fetches HTML at runtime from /html-slips/ (served by Vite plugin).
 */

const SLIP_FILES = {
  bookingConfirmation:    'BookingConfirmation.html',
  finalTaxInvoice:        'FinalTaxInvoice.html',
  instantQuotation:       'InstantQuotation.html',
  proofOfDelivery:        'ProofOfDelivery.html',
  tripManifest:           'TripManifest.html',
  digitalPickList:        'DigitalPickList.html',
  laborAssignment:        'LaborAssignment.html',
  salarySlip:             'SalarySlip.html',
  vehicleSafetyChecklist: 'VehicleSafetyChecklist.html',
  assetCheckout:          'AssetCheckout.html',
  aiVolumeEstimate:       'AIVolumeEstimate.html',
}

export const SLIP_LABELS = {
  bookingConfirmation:    'Booking Confirmation',
  finalTaxInvoice:        'Tax Invoice',
  instantQuotation:       'Instant Quotation',
  proofOfDelivery:        'Proof of Delivery',
  tripManifest:           'Trip Manifest',
  digitalPickList:        'Digital Pick List',
  laborAssignment:        'Labour Assignment',
  salarySlip:             'Salary Slip',
  vehicleSafetyChecklist: 'Safety Checklist',
  assetCheckout:          'Asset Checkout',
  aiVolumeEstimate:       'AI Volume Estimate',
}

export const SLIP_ICONS = {
  bookingConfirmation:    'receipt_long',
  finalTaxInvoice:        'request_quote',
  instantQuotation:       'calculate',
  proofOfDelivery:        'verified',
  tripManifest:           'assignment',
  digitalPickList:        'checklist',
  laborAssignment:        'engineering',
  salarySlip:             'payments',
  vehicleSafetyChecklist: 'health_and_safety',
  assetCheckout:          'inventory_2',
  aiVolumeEstimate:       'model_training',
}

// ─── helpers ──────────────────────────────────────────────────────────────────

function inr(n) {
  return `₹${Number(n || 0).toLocaleString('en-IN')}`
}

function fmtShort(value) {
  if (!value) return 'TBD'
  const d = new Date(value)
  if (isNaN(d.getTime())) return String(value)
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

function applyReplacements(html, map) {
  for (const [from, to] of Object.entries(map)) {
    if (from) html = html.split(from).join(to ?? '—')
  }
  return html
}

function fixAssetPaths(html) {
  // relative paths from html-slips/ → absolute URLs (needed for Blob URL context)
  return html
    .replace(/\.\.\/src\/assets\//g, '/src/assets/')
    .replace(/(src|href)="assets\//g, '$1="/html-slips/assets/')
}

function openBlobHtml(html) {
  const blob = new Blob([html], { type: 'text/html; charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const win = window.open(url, '_blank', 'noopener')
  if (win) {
    win.addEventListener('load', () => URL.revokeObjectURL(url), { once: true })
  } else {
    URL.revokeObjectURL(url)
  }
}

async function fetchSlipHtml(key) {
  const file = SLIP_FILES[key]
  if (!file) return null
  try {
    const res = await fetch(`/html-slips/${file}`)
    if (!res.ok) return null
    return await res.text()
  } catch {
    return null
  }
}

// ─── per-slip replacement maps ────────────────────────────────────────────────

function bookingConfirmationReplacements(order, user) {
  const total      = Number(order?.amount || order?.cost?.total || 0)
  const paid       = Number(order?.paidAmount || 0)
  const balance    = Math.max(0, total - paid)
  const advancePct = total > 0 ? Math.round((paid / total) * 100) : 0
  const origin     = order?.origin || order?.pickup || '—'
  const dest       = order?.destination || '—'

  return {
    'CC-12345':                     order?.id || '—',
    'December 16, 2024':            order?.createdAt || order?.date || fmtShort(new Date()),
    'December 20, 2024':            order?.eta || 'TBD',
    '09:00 AM - 12:00 PM':          order?.serviceTimeBlock || 'Flexible',
    'Sarah Khan':                   user?.name || '—',
    '+91 98765 43210':              user?.phone || '—',
    'sarah.khan@email.com':         user?.email || '—',
    '+91 87654 32109':              '—',
    '123 Oak Street, Whitefield':   origin,
    'Bangalore, Karnataka - 560066':'',
    '456 Maple Avenue, Indiranagar':dest,
    'Bangalore, Karnataka - 560038':'',
    'Floor: Ground | Lift: Available':'',
    'Floor: 2nd | Lift: Available': '',
    '₹4,500':                       inr(total),
    '₹1,350':                       inr(paid),
    'Advance Paid (30%)':           `Advance Paid${advancePct > 0 ? ` (${advancePct}%)` : ''}`,
    'UPI / Online Transfer':        order?.paymentMode || order?.paymentMode || 'Invoice',
    'TXN20241216789456':            order?.id || '—',
    '₹3,150':                       inr(balance),
    '4 skilled workers':            order?.laborCount > 0 ? `${order.laborCount} workers` : 'On-demand',
    '14 ft covered truck':          order?.vehicle || order?.vehicleType || 'Assigned vehicle',
  }
}

function finalTaxInvoiceReplacements(order, user) {
  const total    = Number(order?.amount || order?.cost?.total || 0)
  const paid     = Number(order?.paidAmount || 0)
  const base     = Number(order?.cost?.base   || (total * 0.40))
  const labor    = Number(order?.cost?.labor  || (total * 0.35))
  const mats     = Number(order?.cost?.materials || (total * 0.15))
  const packing  = Number(order?.cost?.packing   || (total * 0.10))
  const balance  = Math.max(0, total - paid)
  const origin   = order?.origin || order?.pickup || '—'
  const dest     = order?.destination || '—'
  const vehicle  = order?.vehicle || order?.vehicleType || 'Vehicle'
  const dateStr  = order?.createdAt || order?.date || fmtShort(new Date())

  // payment status badge + banner text
  const isPaid    = paid >= total && total > 0
  const isPartial = paid > 0 && !isPaid
  const statusBadge  = isPaid ? 'PAID' : isPartial ? 'PARTIAL' : 'UNPAID'
  const statusBanner = isPaid ? '✓ PAID IN FULL' : isPartial ? '⏳ PARTIALLY PAID' : '⚠ PAYMENT PENDING'
  // Change banner color class based on status
  const bannerClass  = isPaid
    ? 'inline-block bg-green-600 text-white px-8 py-3 rounded-lg'
    : isPartial
    ? 'inline-block bg-amber-500 text-white px-8 py-3 rounded-lg'
    : 'inline-block bg-red-600 text-white px-8 py-3 rounded-lg'

  return {
    // Invoice meta
    'INV-2024-12-0567':           `INV-${order?.id || '—'}`,
    'December 20, 2024':          dateStr,
    'CC-12345':                   order?.id || '—',
    // Payment status banner
    'inline-block bg-green-600 text-white px-8 py-3 rounded-lg': bannerClass,
    '✓ PAID IN FULL':             statusBanner,
    // Status cell (small text in invoice details table)
    '>PAID<':                     `>${statusBadge}<`,
    // Customer
    'Sarah Khan':                 user?.name  || '—',
    '+91 98765 43210':            user?.phone || '—',
    'sarah.khan@email.com':       user?.email || '—',
    '456 Maple Avenue, Indiranagar': dest,
    'Bangalore, Karnataka - 560038': '',
    // Route
    '123 Oak Street, Whitefield': origin,
    'Bangalore, Karnataka - 560066': '',
    '14 ft covered truck, 18.5 km distance':
      `${vehicle} · ${origin.split(',')[0]} → ${dest.split(',')[0]}`,
    'From: 123 Oak Street, Whitefield to 456 Maple Avenue, Indiranagar': '',
    // Labor
    '4 skilled workers for loading &amp; unloading':
      order?.laborCount > 0 ? `${order.laborCount} workers` : 'On-demand labour',
    // Service line amounts (table cells: >value<)
    '>1,800.00<':  `>${base.toFixed(2)}<`,
    '>1,600.00<':  `>${labor.toFixed(2)}<`,
    '>700.00<':    `>${mats.toFixed(2)}<`,
    '>400.00<':    `>${packing.toFixed(2)}<`,
    // Subtotal + GST table amounts
    '>4,500.00<':  `>${total.toFixed(2)}<`,
    // Amount summary (with ₹ prefix)
    '₹4,500.00':   `₹${total.toFixed(2)}`,
    // Payment rows
    '>1,350.00<':  `>${paid.toFixed(2)}<`,
    '>3,150.00<':  `>${balance.toFixed(2)}<`,
    'Advance Payment (30%)':
      `${isPaid ? 'Full Payment' : isPartial ? 'Partial Payment' : 'Payment'} (${total > 0 ? Math.round((paid / total) * 100) : 0}%)`,
    'Balance Payment (70%)': balance > 0 ? 'Balance Due' : 'Balance Cleared',
    // Declared value / insurance coverage
    'Coverage up to ₹50,000': order?.declaredValue > 0 ? `Coverage up to ${inr(order.declaredValue)}` : 'Coverage up to ₹50,000',
    // Amount in words (approximate)
    'Four Thousand Five Hundred Rupees Only':
      `${inr(total)} — ${isPaid ? 'Paid in Full' : isPartial ? `Paid: ${inr(paid)} · Pending: ${inr(balance)}` : 'Payment Pending'}`,
    // Date fields in payment table
    'Dec 16, 2024': dateStr,
    'Dec 20, 2024': order?.eta || dateStr,
  }
}

function proofOfDeliveryReplacements(order, user) {
  return {
    'CC-12345':                      order?.id || '—',
    'December 20, 2024':             order?.eta || fmtShort(new Date()),
    'December 16, 2024':             order?.createdAt || order?.date || fmtShort(new Date()),
    'Sarah Khan':                    user?.name || '—',
    '+91 98765 43210':               user?.phone || '—',
    'sarah.khan@email.com':          user?.email || '—',
    '123 Oak Street, Whitefield':    order?.origin || order?.pickup || '—',
    'Bangalore, Karnataka - 560066': '',
    '456 Maple Avenue, Indiranagar': order?.destination || '—',
    'Bangalore, Karnataka - 560038': '',
  }
}

function instantQuotationReplacements(order, user) {
  const total = Number(order?.amount || order?.cost?.total || 0)
  return {
    'CC-12345':                      order?.id || 'QUOTE',
    'December 16, 2024':             order?.createdAt || order?.date || fmtShort(new Date()),
    'December 20, 2024':             order?.eta || 'TBD',
    'Sarah Khan':                    user?.name || '—',
    '+91 98765 43210':               user?.phone || '—',
    'sarah.khan@email.com':          user?.email || '—',
    '123 Oak Street, Whitefield':    order?.origin || order?.pickup || '—',
    'Bangalore, Karnataka - 560066': '',
    '456 Maple Avenue, Indiranagar': order?.destination || '—',
    'Bangalore, Karnataka - 560038': '',
    '₹4,500.00':  `₹${total.toFixed(2)}`,
    '₹4,500':     inr(total),
    '₹1,350':     inr(total),
    '₹3,150':     '₹0',
  }
}

function vehicleSafetyChecklistReplacements(driver, vehicle) {
  const now = new Date()
  const dateStr = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }).toUpperCase()
  const vehicleReg = vehicle?.code || vehicle?.licensePlate || vehicle?.vehicle_number || driver?.vehicle || '—'
  const vehicleType = vehicle?.type || vehicle?.model || vehicle?.vehicleType || 'Truck'
  const driverName = driver?.name || '—'
  const driverId = driver?.id ? String(driver.id) : '—'
  const driverPhone = driver?.phone || '—'
  const location = driver?.location || driver?.current_location || '—'
  const tripId = driverId.slice(0, 6).toUpperCase()
  return {
    'TRP-7891':            `TRP-${tripId}`,
    'KA-51-MN-2347':       vehicleReg,
    'Dec 17, 2024':        dateStr,
    '06:30 AM':            timeStr,
    '24 ft Closed Body Truck': vehicleType,
    'Rajesh Kumar':        driverName,
    'KA-2019-0056789':     driverPhone || driverId,
    'Bangalore → Chennai': location,
    '347 km':              driver?.stops > 0 ? `${driver.stops * 15} km` : '—',
  }
}

function assetCheckoutReplacements(driver, vehicle) {
  const now = new Date()
  const dateStr = now.toLocaleDateString('en-IN', { day: 'long', month: 'long', year: 'numeric' })
  const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }).toUpperCase()
  const vehicleReg = vehicle?.code || vehicle?.licensePlate || vehicle?.vehicle_number || driver?.vehicle || '—'
  const vehicleType = vehicle?.type || vehicle?.model || vehicle?.vehicleType || 'Truck'
  const driverName = driver?.name || '—'
  const driverId = driver?.id ? String(driver.id) : '—'
  const shortDriverId = driverId.slice(0, 8).toUpperCase()
  const driverPhone = driver?.phone || '—'
  const licenseNo = driver?.license_number || driver?.licenseNumber || driverId.slice(0, 16)
  return {
    'CC-12345':                   shortDriverId,
    'December 20, 2024 - 08:30 AM': `${dateStr} - ${timeStr}`,
    'Prakash Reddy':              driverName,
    'DRV-8765':                   `DRV-${shortDriverId}`,
    'KA07-20210012345':           licenseNo,
    '+91 98765 55555':            driverPhone,
    'KA 01 MN 5678':              vehicleReg,
    '14 ft Covered Truck':        vehicleType,
  }
}

function tripManifestReplacements(manifest) {
  const now = new Date()
  const dateStr = now.toLocaleDateString('en-IN', { day: 'long', month: 'long', year: 'numeric' })
  const manifestId = manifest?.id || '—'
  const driverName = manifest?.driver || '—'
  const vehicleCode = manifest?.vehicle || '—'
  const driverPhone = manifest?.driver_phone || manifest?.driverPhone || '—'
  const shortId = manifestId.length > 8 ? manifestId.slice(-6) : manifestId
  return {
    'TRP-CC-12345':        `TRP-${manifestId}`,
    'CC-12345':            manifestId,
    'December 20, 2024':   dateStr,
    'Prakash Reddy':       driverName,
    'DRV-8765':            `DRV-${shortId}`,
    'KA07-20210012345':    driverPhone || manifestId,
    '+91 98765 55555':     driverPhone,
    'KA07 20210012345':    vehicleCode,
  }
}

function getReplacements(key, order, user) {
  switch (key) {
    case 'bookingConfirmation':    return bookingConfirmationReplacements(order, user)
    case 'finalTaxInvoice':        return finalTaxInvoiceReplacements(order, user)
    case 'proofOfDelivery':        return proofOfDeliveryReplacements(order, user)
    case 'instantQuotation':       return instantQuotationReplacements(order, user)
    case 'vehicleSafetyChecklist': return vehicleSafetyChecklistReplacements(order, user)
    case 'assetCheckout':          return assetCheckoutReplacements(order, user)
    case 'tripManifest':           return tripManifestReplacements(order)
    default:                       return {}
  }
}

// ─── public composable ────────────────────────────────────────────────────────

export function useSlipPrinter() {
  /** Open slip with no data substitution (static preview) */
  async function openSlip(key) {
    const html = await fetchSlipHtml(key)
    if (!html) return
    openBlobHtml(fixAssetPaths(html))
  }

  /**
   * Open slip with real data injected.
   * @param {string} key   - slip key e.g. 'bookingConfirmation'
   * @param {object} order - shipment/order object from vendor store
   * @param {object} user  - current user { name, email, phone }
   */
  async function openSlipWithData(key, order, user = {}) {
    const html = await fetchSlipHtml(key)
    if (!html) return
    const replacements = getReplacements(key, order, user)
    openBlobHtml(applyReplacements(fixAssetPaths(html), replacements))
  }

  return { openSlip, openSlipWithData, SLIP_LABELS, SLIP_ICONS }
}
