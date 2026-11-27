import { apiGet, apiPost, apiPut, apiDelete } from '@/core/api/request'

import type {
  Organization,
  OrganizationCreatePayload,
  OrganizationUpdatePayload,
  OrganizationQuery,
  OrganizationListResult,
} from '../types/organization.types'

const BASE_URL = '/core/organizations'

export const organizationsApi = {
  index(params: OrganizationQuery = {}): Promise<OrganizationListResult> {
    return apiGet<OrganizationListResult>(BASE_URL, { params })
  },

  show(id: number): Promise<Organization> {
    return apiGet<Organization>(`${BASE_URL}/${id}`)
  },

  create(payload: OrganizationCreatePayload): Promise<Organization> {
    return apiPost<Organization>(BASE_URL, payload)
  },

  update(id: number, payload: OrganizationUpdatePayload): Promise<Organization> {
    return apiPut<Organization>(`${BASE_URL}/${id}`, payload)
  },

  archive(id: number): Promise<{ id: number }> {
    return apiDelete<{ id: number }>(`${BASE_URL}/${id}`)
  },
}
