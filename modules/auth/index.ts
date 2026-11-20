/**
 * API publik modul `auth`. Lapisan lain (app, shared, modul lain) hanya boleh mengimpor dari sini,
 * bukan dari file internal modul (ditegakkan oleh `npm run check:arch`).
 */
export { useAuthStore } from './stores/auth.store'
export { vCan } from './directives/can'
export { can, filterMenus } from './utils/permissions'
export type { AuthUser, DynamicMenu, LoginPayload, SessionContext } from './types'
