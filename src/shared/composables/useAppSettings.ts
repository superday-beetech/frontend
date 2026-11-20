// import { watchEffect } from 'vue'
import { useSettingsStore } from '../stores/settings.store'

export function useAppSettings() {
  const settings = useSettingsStore()

  //   watchEffect(() => {
  // const root = document.documentElement
  /*
    root.dataset.layout = String(settings.layout)

    if (settings.sidebar) {
      root.dataset.sidebar = String(settings.sidebar)
    }

    if (settings.color) {
      root.dataset.colorTheme = String(settings.color)
    }

    document.title = settings.siteName */
  //   })

  return settings
}
