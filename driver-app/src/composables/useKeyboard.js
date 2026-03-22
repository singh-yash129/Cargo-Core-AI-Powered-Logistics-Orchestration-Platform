import { ref, onMounted, onUnmounted } from 'vue'

/**
 * useKeyboard — tracks Android soft keyboard visibility and height.
 *
 * resize: "none" in capacitor.config.json means the WebView does NOT resize
 * when the keyboard appears. Instead we track it here and:
 *   1. Hide BottomNav (via isKeyboardVisible in MainLayout)
 *   2. Optionally scroll the focused input into view via scrollInputIntoView()
 */
export function useKeyboard() {
  const isKeyboardVisible = ref(false)
  const keyboardHeight = ref(0)
  let showListener, hideListener

  onMounted(async () => {
    try {
      const { Keyboard } = await import('@capacitor/keyboard')
      showListener = await Keyboard.addListener('keyboardWillShow', (info) => {
        isKeyboardVisible.value = true
        keyboardHeight.value = info.keyboardHeight ?? 0
      })
      hideListener = await Keyboard.addListener('keyboardWillHide', () => {
        isKeyboardVisible.value = false
        keyboardHeight.value = 0
      })
    } catch {
      // Browser / Keyboard plugin unavailable — silently skip
    }
  })

  onUnmounted(() => {
    showListener?.remove()
    hideListener?.remove()
  })

  /**
   * Call this on @focus of any <input> or <textarea> to scroll the element
   * into the visible area above the keyboard.
   *
   * Usage: <input @focus="scrollInputIntoView($event.target)" />
   */
  function scrollInputIntoView(el) {
    if (!el) return
    // Small delay lets the keyboard animation start before we try to scroll
    setTimeout(() => {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 150)
  }

  return { isKeyboardVisible, keyboardHeight, scrollInputIntoView }
}
