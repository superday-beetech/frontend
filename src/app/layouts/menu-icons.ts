import type { Component } from 'vue'
import {
  ArrowLeftRight,
  BarChart3,
  BookOpen,
  Boxes,
  Building2,
  Circle,
  ClipboardList,
  FileBarChart2,
  Layers,
  LayoutDashboard,
  Package,
  Pill,
  Receipt,
  Settings,
  ShoppingCart,
  Truck,
  Users,
  Wallet,
} from 'lucide-vue-next'

/**
 * Daftar ikon menu yang BOLEH dipakai backend (field `icon` di /auth/me).
 * Sengaja eksplisit: `import * as Lucide` memasukkan ±1.500 ikon ke bundle (±600 kB).
 * Butuh ikon baru? Impor di atas lalu daftarkan di sini.
 */
const MENU_ICONS: Record<string, Component> = {
  ArrowLeftRight,
  BarChart3,
  BookOpen,
  Boxes,
  Building2,
  ClipboardList,
  FileBarChart2,
  Layers,
  LayoutDashboard,
  Package,
  Pill,
  Receipt,
  Settings,
  ShoppingCart,
  Truck,
  Users,
  Wallet,
}

export function resolveMenuIcon(name?: string): Component {
  return (name && MENU_ICONS[name]) || Circle
}
