import type { DynamicMenu } from '../types'

/** Permission khusus: pemilik '*' dianggap punya semua akses (mis. Super Admin dari backend). */
export const WILDCARD_PERMISSION = '*'

/** Fungsi murni: apakah `granted` memenuhi `required` (string tunggal atau salah satu dari daftar)? */
export function can(granted: readonly string[], required: string | readonly string[]): boolean {
  if (granted.includes(WILDCARD_PERMISSION)) return true
  return typeof required === 'string' ? granted.includes(required) : required.some((p) => granted.includes(p))
}

/** Menu yang boleh dilihat: item tanpa izin disembunyikan, cabang kosong ikut dibuang. */
export function filterMenus(items: DynamicMenu[], allowed: (permissions: string[]) => boolean): DynamicMenu[] {
  return items.flatMap((item) => {
    if (item.permissions?.length && !allowed(item.permissions)) return []
    if (!item.children?.length) return [item]
    const children = filterMenus(item.children, allowed)
    // Cabang yang semua anaknya tersembunyi dan bukan halaman sendiri → ikut disembunyikan.
    if (!children.length && !item.component_key) return []
    return [{ ...item, children }]
  })
}
