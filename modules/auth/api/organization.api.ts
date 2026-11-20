import { apiGet, apiPost } from '@/core/api/request'
import type { AvailableOrganization, OrganizationContext } from '../types'

const BASE_URL = '/organization/organization-context'

export const organizationApi = {
  getAvailable(): Promise<AvailableOrganization[]> {
    return apiGet(`${BASE_URL}/index-available`)
  },

  getCurrentContext(): Promise<OrganizationContext | null> {
    return apiGet(`${BASE_URL}/index-context`)
  },

  switchOrganization(organizationId: number): Promise<OrganizationContext> {
    return apiPost(`${BASE_URL}/switch-organization`, {
      organization_id: organizationId,
    })
  },

  clearContext(): Promise<void> {
    return apiPost(`${BASE_URL}/clear-context`)
  },
}
