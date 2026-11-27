export interface PaginationMeta {
  current_page: number
  last_page: number
  per_page: number
  total: number
}

export interface PaginatedResult<T> {
  items: T[]
  pagination: PaginationMeta
}

/* =========================================================
 * ORGANIZATION
 * ======================================================= */

export interface Organization {
  id: number
  code: string
  slug: string
  name: string
  legal_name: string | null
  organization_type: string
  status: 'active' | 'inactive'
  timezone: string
  currency: string
  membership_role?: string
  is_default?: boolean | number
}

export interface OrganizationCreatePayload {
  code: string
  slug: string
  name: string
  legal_name?: string | null
  organization_type?: string
  timezone?: string
  currency?: string
}

export interface OrganizationUpdatePayload {
  name?: string
  legal_name?: string | null
  organization_type?: string
  timezone?: string
  currency?: string
}

export interface OrganizationQuery {
  page?: number
  per_page?: number
  q?: string
}

export type OrganizationListResult = PaginatedResult<Organization>

/* =========================================================
 * ORGANIZATION UNIT
 * ======================================================= */

export interface OrganizationUnit {
  id: number
  organization_id: number
  parent_id: number | null
  code: string
  name: string
  unit_type: string
  status: 'active' | 'inactive'
  metadata?: Record<string, unknown> | null
  created_at?: string | null
  updated_at?: string | null
}

export interface OrganizationUnitPayload {
  parent_id?: number | null
  code?: string
  name?: string
  unit_type?: string
  status?: 'active' | 'inactive'
  metadata?: Record<string, unknown> | null
}

export interface OrganizationUnitQuery {
  organization_id: number
  include_inactive?: boolean
}

export type OrganizationUnitListResult = OrganizationUnit[]

/* =========================================================
 * ORGANIZATION MEMBERSHIP
 * ======================================================= */

export interface OrganizationMembershipUnit {
  id: number
  code: string
  name: string
  unit_type: string
  is_default: number | boolean
}

export interface OrganizationMembership {
  id: number
  organization_id: number
  user_id: number
  username?: string
  membership_role: string
  status: 'active' | 'inactive'
  is_default: number | boolean
  units: OrganizationMembershipUnit[]
  unit_ids: number[]
  unit_id: number | null
  unit_name: string | null
  created_at?: string | null
  updated_at?: string | null
}

export interface OrganizationMembershipPayload {
  organization_id: number
  user_id?: number
  membership_role?: string
  status?: 'active' | 'inactive'
  is_default?: boolean | number
  unit_ids?: number[]
  default_unit_id?: number | null
}

export interface OrganizationMembershipQuery {
  organization_id: number
  page?: number
  per_page?: number
  q?: string
  status?: string
}

export type OrganizationMembershipListResult = PaginatedResult<OrganizationMembership>

/* =========================================================
 * ORGANIZATION USERS
 * ======================================================= */

export interface OrganizationUser {
  id: number
  username: string
}

export interface OrganizationUserQuery {
  page?: number
  per_page?: number
  q?: string
}

export type OrganizationUserListResult = PaginatedResult<OrganizationUser>
