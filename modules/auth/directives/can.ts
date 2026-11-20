import type { Directive } from 'vue'
import { useAuthStore } from '../stores/auth.store'

// Memakai display:none (bukan removeChild) agar tidak merusak patching virtual DOM Vue,
// dan ikut bereaksi saat permission berubah (mounted + updated).
const ORIGINAL_DISPLAY = '__canOriginalDisplay'
type CanElement = HTMLElement & { [ORIGINAL_DISPLAY]?: string }

function apply(el: CanElement, value: string | string[] | undefined) {
  const allowed = !value || useAuthStore().hasPermission(value)
  if (el[ORIGINAL_DISPLAY] === undefined) el[ORIGINAL_DISPLAY] = el.style.display
  el.style.display = allowed ? el[ORIGINAL_DISPLAY]! : 'none'
  if (allowed) el.removeAttribute('aria-hidden')
  else el.setAttribute('aria-hidden', 'true')
}

/**
 * v-can="'master.product.create'" atau v-can="['a', 'b']" (salah satu cukup).
 * CATATAN: ini hanya kontrol tampilan. Otorisasi sebenarnya WAJIB divalidasi di backend.
 */
export const vCan: Directive<HTMLElement, string | string[]> = {
  mounted: (el, binding) => apply(el, binding.value),
  updated: (el, binding) => apply(el, binding.value),
}
