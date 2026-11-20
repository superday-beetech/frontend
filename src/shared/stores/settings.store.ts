import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { settingsService, type AppSettingGroup } from '../services/settings.service'

export const useSettingsStore = defineStore('app-settings', () => {
  const values = ref<Record<string, unknown>>({})

  const initialized = ref(false)
  const loading = ref(false)

  let request: Promise<void> | null = null

  function setGroups(groups: AppSettingGroup[]): void {
    const result: Record<string, unknown> = {}

    for (const group of groups) {
      for (const item of group.items) {
        result[`${group.class}.${item.property}`] = item.value
      }
    }

    values.value = result
    initialized.value = true
  }

  async function initialize(force = false): Promise<void> {
    if (request) return request
    if (initialized.value && !force) return

    loading.value = true

    request = (async () => {
      try {
        const groups = await settingsService.getAll()
        setGroups(groups)
      } finally {
        loading.value = false
        request = null
      }
    })()

    return request
  }

  function get<T>(key: string, fallback: T): T {
    const value = values.value[key]

    return (value === undefined || value === null ? fallback : value) as T
  }

  //   const siteName = computed(() => get('Adm.siteName', 'ACN'))

  const siteDescription = computed(() => get('Adm.siteDescription', ''))

  const siteVersion = computed(() => get('Adm.siteVersion', ''))

  const layout = computed(() => get('Theme.layout', 'vertical'))

  const sidebar = computed(() => get('Theme.sidebar', ''))

  const color = computed(() => get('Theme.color', ''))

  return {
    values,
    initialized,
    loading,

    // siteName,
    siteDescription,
    siteVersion,

    layout,
    sidebar,
    color,

    get,
    setGroups,
    initialize,
  }
})
