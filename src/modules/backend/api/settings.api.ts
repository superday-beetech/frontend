import { http } from '@/core/api/client'
import type { ApiResponse } from '@/core/api/types'
import type { SettingsIndexResponse, SettingsSavePayload } from '../types/settings'

const API = '/backend/setting-api'

export const settingsApi = {
  async getGroups(): Promise<SettingsIndexResponse> {
    const { data } = await http.get<ApiResponse<SettingsIndexResponse>>(API)

    if (!data.data || !Array.isArray(data.data.groups)) {
      throw new Error('Format respons pengaturan tidak valid.')
    }

    return data.data
  },

  async save(payload: SettingsSavePayload): Promise<void> {
    await http.put<ApiResponse<unknown>>(API + '/bulk-save', payload)
  },

  async addClass(payload: {
    class: string
    property: string
    type: string
    value: unknown
    context: string | null
  }): Promise<void> {
    await http.post<ApiResponse<unknown>>(API + '/add-class', payload)
  },
}
