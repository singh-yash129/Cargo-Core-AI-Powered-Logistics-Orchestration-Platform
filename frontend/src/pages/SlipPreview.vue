<!-- Renders a CargoCore HTML slip stored in localStorage by useSlipPrinter.
     Opened in a new tab via /slip-preview?k=<key>.
     Survives browser refresh because the route is a real URL and
     localStorage persists across refreshes within the same origin. -->
<template>
  <iframe ref="frame" style="position:fixed;inset:0;width:100%;height:100%;border:none;" />
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const frame = ref(null)
const route = useRoute()

const TOOLBAR_HTML = `
<style>
  #__slip_toolbar { position:fixed;top:0;left:0;right:0;z-index:99999;display:flex;align-items:center;gap:10px;padding:10px 20px;background:rgba(255,255,255,0.97);backdrop-filter:blur(10px);border-bottom:1px solid #e5e7eb;box-shadow:0 2px 12px rgba(0,0,0,0.10);font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; }
  #__slip_toolbar_spacer { height:58px; }
  #__slip_toolbar .label { flex:1;display:flex;align-items:center;gap:8px;font-size:13px;font-weight:700;color:#111827;letter-spacing:-.01em; }
  #__slip_toolbar .label svg { opacity:.5; }
  #__slip_toolbar button { display:flex;align-items:center;gap:6px;padding:8px 18px;border:none;border-radius:8px;font-size:13px;font-weight:700;cursor:pointer;transition:all .15s;letter-spacing:-.01em; }
  #__slip_toolbar .btn-print { background:#f3f4f6;color:#374151; }
  #__slip_toolbar .btn-print:hover { background:#e5e7eb; }
  #__slip_toolbar .btn-download { background:#16a34a;color:#fff; }
  #__slip_toolbar .btn-download:hover { background:#15803d; }
  @media print { #__slip_toolbar, #__slip_toolbar_spacer { display:none!important; } }
</style>
<div id="__slip_toolbar">
  <div class="label">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="#6b7280"><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-1 7V3.5L18.5 9H13z"/></svg>
    Order Document
  </div>
  <button class="btn-print" onclick="window.print()">
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z"/></svg>
    Print
  </button>
  <button class="btn-download" onclick="window.print()">
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
    Download PDF
  </button>
</div>
<div id="__slip_toolbar_spacer"></div>
`

function injectToolbar(html) {
  if (html.includes('id="__slip_toolbar"')) return html
  const bodyIdx = html.indexOf('<body')
  if (bodyIdx === -1) return TOOLBAR_HTML + html
  const bodyEnd = html.indexOf('>', bodyIdx) + 1
  return html.slice(0, bodyEnd) + TOOLBAR_HTML + html.slice(bodyEnd)
}

onMounted(() => {
  const key = route.query.k
  const autoPrint = route.query.print === '1'
  const rawHtml = key ? localStorage.getItem(key) : null

  if (rawHtml && frame.value) {
    frame.value.srcdoc = injectToolbar(rawHtml)
    if (autoPrint) {
      frame.value.addEventListener('load', () => {
        frame.value.contentWindow?.print()
      }, { once: true })
    }
  } else {
    document.body.innerHTML = '<div style="font-family:sans-serif;padding:40px;color:#555"><h2>Slip not found</h2><p>This slip may have expired. Please reopen it from the app.</p></div>'
  }
})
</script>
