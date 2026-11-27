import { apiGet, apiPost, apiPut, apiDelete } from '@/core/api/request'

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

const BASE_URL = '/core/organization-units'

export const organizationUnitsApi = {
  index(organizationId: number, includeInactive = false) {
    return apiGet<OrganizationUnit[]>(BASE_URL, {
      params: {
        organization_id: organizationId,
        include_inactive: includeInactive ? 1 : 0,
      },
    })
  },

  show(organizationId: number, unitId: number) {
    return apiGet<OrganizationUnit>(`${BASE_URL}/show-units`, {
      params: {
        organization_id: organizationId,
        unit_id: unitId,
      },
    })
  },

  create(organizationId: number, payload: OrganizationUnitPayload) {
    return apiPost<OrganizationUnit>(`${BASE_URL}/create-units/${organizationId}`, payload)
  },

  update(organizationId: number, unitId: number, payload: OrganizationUnitPayload) {
    return apiPut<OrganizationUnit>(`${BASE_URL}/update-units/${organizationId}/${unitId}`, payload)
  },

  deactivate(organizationId: number, unitId: number) {
    return apiDelete<{ id: number; organization_id: number; status: string }>(`${BASE_URL}/delete-units/${organizationId}/${unitId}`)
  },
}
