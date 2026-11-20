export type SettingType = 'string' | 'integer' | 'float' | 'boolean' | 'json'

export type SettingInputType =
  'text' | 'textarea' | 'select' | 'color' | 'number' | 'switch' | 'checkbox' | 'checkbox-group' | 'radio' | 'file' | 'json'

export interface SettingFieldOption {
  label: string
  value: string | number
  icon?: string
  color?: string
}

export interface SettingRow {
  property: string
  type: SettingType
  value: string
  isNew: boolean
}

export interface SettingField {
  input: SettingInputType
  label?: string
  placeholder?: string
  options?: SettingFieldOption[]
  rows?: number
  accept?: string
  multiple?: boolean
}

export interface SettingItem {
  property: string
  type: SettingType
  value: unknown
}

export interface SettingGroup {
  id: string
  name: string
  class: string
  context: string | null
  items: SettingItem[]
}

export interface NewClassForm {
  class: string
  property: string
  type: SettingType
  value: string
  context: string
}

export interface SettingsIndexResponse {
  groups: SettingGroup[]
}

export interface SettingsBulkSavePayload {
  group: string
  context: string | null
  rows: Array<{
    property: string
    type: SettingType
    value: unknown
  }>
  forget: string[]
}

export interface SettingsAddClassPayload {
  class: string
  property: string
  type: SettingType
  value: unknown
  context: string | null
}

export interface SettingsDeletePayload {
  group: string
  property: string
  context: string | null
}

export interface SettingsApiResponse<T> {
  status: number
  error: boolean
  message: string
  data: T
}
