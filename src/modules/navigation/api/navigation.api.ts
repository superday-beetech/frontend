import { apiGet } from '@/core/api/request'
import { env } from '@/core/config/env'
import type { NavigationResponse } from '../types'

const loadMock = import.meta.env.DEV ? () => import('../mocks/navigation.mock') : undefined

export const navigationApi = {
  async getNavigation(): Promise<NavigationResponse> {
    if (env.useMock && loadMock) {
      const { mockNavigation } = await loadMock()
      return mockNavigation()
    }

    return apiGet<NavigationResponse>('/navigation/sidebar')
  },
}
