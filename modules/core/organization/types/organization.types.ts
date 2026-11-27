import type { Paginated } from '@/core/api/types'

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
  status: string
  timezone: string
  currency: string
  membership_role?: string
  is_default?: boolean | number
}

export interface OrganizationPayload {
  name: string
  legal_name?: string | null
  organization_type?: string
  timezone?: string
  currency?: string
}

/** Payload khusus pembuatan organisasi. */
export interface OrganizationCreatePayload extends OrganizationPayload {
  code: string
  slug: string
}

/** Payload khusus perubahan organisasi. */
export type OrganizationUpdatePayload = Partial<OrganizationPayload>

export type OrganizationListResult = Paginated<Organization>

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
  status: string
  description?: string | null
}

export interface OrganizationUnitPayload {
  parent_id?: number | null
  code: string
  name: string
  unit_type: string
  description?: string | null
}

export type OrganizationUnitListResult = Paginated<OrganizationUnit>

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
  email?: string
  membership_role: string
  status: string
  is_default: number | boolean
  unit_id: number | null
  unit_name: string | null
  units: OrganizationMembershipUnit[]
  unit_ids: number[]
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

export type OrganizationMembershipListResult = Paginated<OrganizationMembership>

/* =========================================================
 * ORGANIZATION USERS
 * ======================================================= */

export interface OrganizationUser {
  id: number
  username: string
  email?: string
  name?: string
}

/* =========================================================
 * QUERY PARAMETERS
 * ======================================================= */

export interface OrganizationQuery {
  page?: number
  per_page?: number
  q?: string
}

export interface OrganizationUnitQuery {
  organization_id: number
  include_inactive?: boolean
  page?: number
  per_page?: number
  q?: string
}

export interface OrganizationMembershipQuery {
  organization_id: number
  page?: number
  per_page?: number
  q?: string
}
