export interface AuthUser {
  id: number
  username: string
  email: string
  avatar: string | null
  thumb: string | null
  created_at: string | null
  updated_at: string | null
}

/** Item menu dinamis dari backend. `component_key` = `modul/NamaView` → file `modules/<modul>/views/NamaView.vue`. */
export interface DynamicMenu {
  id: number
  parent_id: number | null
  title: string
  path: string
  name: string
  component_key: string | null
  icon?: string
  permissions?: string[]
  children?: DynamicMenu[]
}

export interface LoginPayload {
  identity: string
  password: string
}

/** Kontrak `GET /auth/me` (lihat AUTH.md). */
/* export interface SessionContext {
  user: AuthUser
  permissions: string[]
  menus: DynamicMenu[]
} */

export interface SessionContext extends AuthUser {
  permissions: string[]
  is_superadmin: boolean
  groups: string[]
  menus: DynamicMenu[]
}

export interface AvailableOrganization {
  membership_id: number
  organization_id: number
  user_id: number
  unit_id: number | null
  membership_role: string
  is_default: boolean
  organization_code: string
  organization_name: string
  organization_type: string
  timezone: string
  currency: string
  unit_name: string | null
}

export interface OrganizationContext {
  organization: {
    id: number
    code: string
    name: string
    organization_type: string
    timezone: string
    currency: string
  }
  unit: {
    id: number
    code: string
    name: string
    unit_type: string
  } | null
  membership: {
    id: number
    user_id: number
    role: string
    status: string
    is_default: boolean
  }
}
