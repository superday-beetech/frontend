import { apiGet, apiPost, apiPut, apiDelete } from '@/core/api/request'

export interface OrganizationUser {
  id: number
  username: string
}

export interface MembershipUnit {
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
  units: MembershipUnit[]
  unit_ids: number[]
  unit_id: number | null
  unit_name: string | null
  created_at?: string | null
  updated_at?: string | null
}

export interface MembershipPayload {
  organization_id: number
  user_id?: number
  membership_role?: string
  status?: 'active' | 'inactive'
  is_default?: boolean | number
  unit_ids?: number[]
  default_unit_id?: number | null
}

export interface MembershipPagination {
  current_page: number
  last_page: number
  per_page: number
  total: number
}

export interface MembershipListResult {
  items: OrganizationMembership[]
  pagination: MembershipPagination
}

export interface UserListResult {
  items: OrganizationUser[]
  pagination: MembershipPagination
}

export interface MembershipQuery {
  organization_id: number
  page?: number
  per_page?: number
  q?: string
  status?: string
}

const BASE_URL = '/core/organization-memberships'

export const organizationMembershipsApi = {
  index(params: MembershipQuery) {
    return apiGet<MembershipListResult>(BASE_URL, { params })
  },

  show(organizationId: number, membershipId: number) {
    return apiGet<OrganizationMembership>(`${BASE_URL}/${membershipId}`, {
      params: { organization_id: organizationId },
    })
  },

  create(payload: MembershipPayload) {
    return apiPost<OrganizationMembership>(BASE_URL, payload)
  },

  update(membershipId: number, payload: MembershipPayload) {
    return apiPut<OrganizationMembership>(`${BASE_URL}/${membershipId}`, payload)
  },

  deactivate(organizationId: number, membershipId: number) {
    return apiDelete<{ id: number }>(`${BASE_URL}/${membershipId}`, {
      params: { organization_id: organizationId },
    })
  },

  indexUsers(params: { page?: number; per_page?: number; q?: string } = {}) {
    return apiGet<UserListResult>(`${BASE_URL}/index-users`, { params })
  },
}
