import api from '@/core/api/client'

export interface AppSettingItem {
  property: string
  type: 'string' | 'integer' | 'float' | 'boolean' | 'json'
  value: unknown
}

export interface AppSettingGroup {
  class: string
  items: AppSettingItem[]
}

interface SettingsResponse {
  status: number
  error: boolean
  message: string
  data: {
    groups: AppSettingGroup[]
  }
}

export const settingsService = {
  async getAll(): Promise<AppSettingGroup[]> {
    const response = await api.get<SettingsResponse>('/backend/setting-api')

    return response.data.data.groups ?? []
  },
}
