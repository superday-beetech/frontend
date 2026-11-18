export type SettingType = 'string' | 'integer' | 'float' | 'boolean' | 'json'

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

export interface SettingRow {
  property: string
  type: SettingType
  value: string
  isNew: boolean
}

export interface NewClassForm {
  class: string
  property: string
  type: SettingType
  value: string
  context: string
}

export interface SettingFieldOption {
  label: string
  value: string | number
  icon?: string
  color?: string
}

export type SettingInputType =
  | 'text'
  | 'textarea'
  | 'select'
  | 'color'
  | 'number'
  | 'switch'
  | 'checkbox'
  | 'checkbox-group'
  | 'radio'
  | 'file'
  | 'json'

export interface SettingField {
  input: SettingInputType
  label?: string
  placeholder?: string
  options?: SettingFieldOption[]
  rows?: number
  accept?: string
  multiple?: boolean
}

export interface SettingsIndexResponse {
  groups: SettingGroup[]
  label?: string
}

export interface SettingsSavePayload {
  group: string
  context: string | null
  rows: Array<{
    property: string
    type: SettingType
    value: unknown
  }>
  forget: string[]
}
