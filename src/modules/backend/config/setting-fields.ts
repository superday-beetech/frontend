import type { SettingField } from '../types/settings'

type ClassSettingFields = Record<string, SettingField>

export const SETTING_FIELDS: Record<string, ClassSettingFields> = {
  Adm: {
    siteName: {
      input: 'text',
      label: 'Nama Aplikasi',
      placeholder: 'Masukkan nama aplikasi',
    },
    siteDescription: {
      input: 'textarea',
      label: 'Deskripsi Aplikasi',
      rows: 3,
    },
    siteVersion: {
      input: 'text',
      label: 'Versi Aplikasi',
    },
  },
  App: {
    httpVerb: {
      input: 'checkbox-group',
      label: 'HTTP Methods',
      options: [
        { label: 'GET', value: 'GET' },
        { label: 'POST', value: 'POST' },
        { label: 'PUT', value: 'PUT' },
        { label: 'PATCH', value: 'PATCH' },
        { label: 'DELETE', value: 'DELETE' },
        { label: 'OPTIONS', value: 'OPTIONS' },
      ],
    },
    logo: {
      input: 'file',
      label: 'Logo Aplikasi',
      accept: 'image/png,image/jpeg,image/svg+xml',
    },
    favicon: {
      input: 'file',
      label: 'Favicon',
      accept: 'image/png,image/x-icon',
    },
  },
  Theme: {
    sidebar: {
      input: 'select',
      label: 'Tipe Sidebar',
      options: [
        { label: 'Full', value: 'full' },
        { label: 'Mini', value: 'mini-sidebar' },
      ],
    },
    layout: {
      input: 'radio',
      label: 'Layout',
      options: [
        { label: 'Vertical', value: 'vertical', icon: 'layout-dashboard' },
        { label: 'Horizontal', value: 'horizontal', icon: 'panel-top' },
      ],
    },
    color: {
      input: 'radio',
      label: 'Color',
      options: [
        { label: 'Blue Theme', value: 'Blue_Theme', color: '#5D87FF' },
        { label: 'Aqua Theme', value: 'Aqua_Theme', color: '#49BEFF' },
        { label: 'Purple Theme', value: 'Purple_Theme', color: '#763EBD' },
        { label: 'Green Theme', value: 'Green_Theme', color: '#13DEB9' },
        { label: 'Cyan Theme', value: 'Cyan_Theme', color: '#539BFF' },
        { label: 'Orange Theme', value: 'Orange_Theme', color: '#FA896B' },
      ],
    },
    logo: {
      input: 'select',
      label: 'Mode Tema',
      options: [
        { label: 'Light', value: 'light' },
        { label: 'Dark', value: 'dark' },
      ],
    },
    primaryColor: {
      input: 'color',
      label: 'Warna Utama',
    },
    darkMode: {
      input: 'switch',
      label: 'Dark Mode',
    },
    sidebarMini: {
      input: 'checkbox',
      label: 'Sidebar Mini',
    },
  },
}

const DEFAULT_INPUTS = {
  string: 'text',
  integer: 'number',
  float: 'number',
  boolean: 'switch',
  json: 'json',
} as const

export function getSettingField(className: string, property: string, type: keyof typeof DEFAULT_INPUTS): SettingField {
  const normalizedClass = className.split('\\').filter(Boolean).pop() ?? className
  const customField = SETTING_FIELDS[className]?.[property] ?? SETTING_FIELDS[normalizedClass]?.[property]

  return customField ?? {
    input: DEFAULT_INPUTS[type],
    label: property,
  }
}
