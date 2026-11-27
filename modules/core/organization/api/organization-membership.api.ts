import { apiGet, apiPost, apiPut, apiDelete } from '@/core/api/request'

import type {
  OrganizationMembership,
  OrganizationMembershipPayload,
  OrganizationMembershipQuery,
  OrganizationMembershipListResult,
  OrganizationUserQuery,
  OrganizationUserListResult,
} from '../types/organization.types'

const BASE_URL = '/core/organization-memberships'

export const organizationMembershipsApi = {
  index(params: OrganizationMembershipQuery): Promise<OrganizationMembershipListResult> {
    return apiGet<OrganizationMembershipListResult>(BASE_URL, { params })
  },

  show(organizationId: number, membershipId: number): Promise<OrganizationMembership> {
    return apiGet<OrganizationMembership>(`${BASE_URL}/${membershipId}`, {
      params: {
        organization_id: organizationId,
      },
    })
  },

  create(payload: OrganizationMembershipPayload): Promise<OrganizationMembership> {
    return apiPost<OrganizationMembership>(BASE_URL, payload)
  },

  update(membershipId: number, payload: OrganizationMembershipPayload): Promise<OrganizationMembership> {
    return apiPut<OrganizationMembership>(`${BASE_URL}/${membershipId}`, payload)
  },

  deactivate(organizationId: number, membershipId: number): Promise<{ id: number }> {
    return apiDelete<{ id: number }>(`${BASE_URL}/${membershipId}`, {
      params: {
        organization_id: organizationId,
      },
    })
  },

  indexUsers(params: OrganizationUserQuery = {}): Promise<OrganizationUserListResult> {
    return apiGet<OrganizationUserListResult>(`${BASE_URL}/index-users`, { params })
  },
}
