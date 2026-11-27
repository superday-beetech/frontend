import { apiGet, apiPost, apiPut, apiDelete } from '@/core/api/request'

import type { OrganizationUnit, OrganizationUnitPayload, OrganizationUnitListResult } from '../types/organization.types'

const BASE_URL = '/core/organization-units'

export const organizationUnitsApi = {
  index(organizationId: number, includeInactive = false): Promise<OrganizationUnitListResult> {
    return apiGet<OrganizationUnit[]>(BASE_URL, {
      params: {
        organization_id: organizationId,
        include_inactive: includeInactive ? 1 : 0,
      },
    })
  },

  show(organizationId: number, unitId: number): Promise<OrganizationUnit> {
    return apiGet<OrganizationUnit>(`${BASE_URL}/show-units`, {
      params: {
        organization_id: organizationId,
        unit_id: unitId,
      },
    })
  },

  create(organizationId: number, payload: OrganizationUnitPayload): Promise<OrganizationUnit> {
    return apiPost<OrganizationUnit>(`${BASE_URL}/create-units/${organizationId}`, payload)
  },

  update(organizationId: number, unitId: number, payload: OrganizationUnitPayload): Promise<OrganizationUnit> {
    return apiPut<OrganizationUnit>(`${BASE_URL}/update-units/${organizationId}/${unitId}`, payload)
  },

  deactivate(organizationId: number, unitId: number): Promise<{ id: number; organization_id: number; status: string }> {
    return apiDelete(`${BASE_URL}/delete-units/${organizationId}/${unitId}`)
  },
}
