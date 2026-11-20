/* import * as LucideIcons from 'lucide-vue-next'

export function useLucideIcon() {
  function getIcon(name?: string) {
    if (!name) return LucideIcons.Circle

    return name in LucideIcons ? LucideIcons[name as keyof typeof LucideIcons] : LucideIcons.Circle
  }

  return { getIcon }
}
 */
import type { Component } from 'vue'
import { iconMap, type IconName } from '@/shared/types/icons'
import { Circle } from 'lucide-vue-next'

/**
 * Fungsi untuk meresolve nama ikon dari database (string)
 * menjadi komponen Lucide yang siap dirender.
 */
export function getLucideIcon(name?: string): Component {
  if (!name) return Circle
  return iconMap[name as IconName] ?? Circle
}
