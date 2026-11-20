import type { SettingField, SettingInputType, SettingType } from '../types/settings'

type ClassSettingFields = Record<string, SettingField>

export const SETTING_FIELDS: Record<string, ClassSettingFields> = {
  // Pindahkan seluruh konfigurasi Adm, App, dan Theme
  // dari file setting-fields.ts yang sekarang ke sini.
}

export function getSettingField(className: string, property: string, dataType: SettingType): SettingField {
  const normalizedClass = className.split('\\').filter(Boolean).pop() ?? className

  const customField = SETTING_FIELDS[className]?.[property] ?? SETTING_FIELDS[normalizedClass]?.[property]

  if (customField) {
    return customField
  }

  const defaultInputs: Record<SettingType, SettingInputType> = {
    string: 'text',
    integer: 'number',
    float: 'number',
    boolean: 'switch',
    json: 'json',
  }

  return {
    input: defaultInputs[dataType],
    label: property,
  }
}
