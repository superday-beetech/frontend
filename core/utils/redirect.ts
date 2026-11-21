/** Hanya izinkan redirect ke path internal (cegah open redirect lewat ?redirect=//evil.com). */
export function isSafeRedirect(target: unknown): target is string {
  return typeof target === 'string' && target.startsWith('/') && !target.startsWith('//') && !target.startsWith('/\\')
}
