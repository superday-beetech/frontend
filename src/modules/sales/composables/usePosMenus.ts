import { computed } from "vue"
import type { SettlementMode } from "../types/sales"
import type { DockState } from "./usePosDock"

interface MenuEntry { id?: string; label?: string; checked?: boolean; disabled?: boolean; separator?: boolean }
interface MenuGroup { id: string; label: string; items: MenuEntry[] }
interface DockItem { id: string; icon: string; label: string; shortcut?: string; disabled?: boolean }
interface UsePosMenusOptions {
  dock: DockState; isSoundEnabled: () => boolean; isFullscreen: () => boolean
  isCompact: () => boolean; cashierName: () => string; settlementMode: () => SettlementMode
  isDraft: () => boolean; isPosted: () => boolean; isProcessing: () => boolean
}

/** Menu bar dan dock POS. Eksekusi aksi ditangani usePosMenuActions. */
export function usePosMenus(options: UsePosMenusOptions) {
  // Auth store hanya mengelola session dan permission; bukan sumber menu navigasi.
  const pageMenuItems = computed<MenuEntry[]>(() => [])
  const menus = computed<MenuGroup[]>(() => [
    { id: "sales", label: "Penjualan", items: [
      { id: "sound", label: "Suara", checked: options.isSoundEnabled() }, { separator: true },
      { id: "dock-visible", label: "Toolbar melayang", checked: options.dock.visible },
      { id: "dock-edge-right", label: "Posisi toolbar: kanan", checked: options.dock.edge === "right" },
      { id: "dock-edge-left", label: "Posisi toolbar: kiri", checked: options.dock.edge === "left" },
      { id: "dock-edge-top", label: "Posisi toolbar: atas", checked: options.dock.edge === "top" },
      { id: "dock-edge-bottom", label: "Posisi toolbar: bawah", checked: options.dock.edge === "bottom" },
    ] },
    { id: "pages", label: "Halaman", items: pageMenuItems.value.length ? pageMenuItems.value : [{ label: "Tidak ada halaman", disabled: true }] },
    { id: "settings", label: "Pengaturan", items: [
      { id: "settings-printer", label: "Printer & struk" }, { id: "settings-pos", label: "Pengaturan POS" },
      { id: "settings-payment", label: "Integrasi pembayaran" },
    ] },
    { id: "view", label: "Tampilan", items: [
      { id: "fullscreen", label: "Layar penuh", checked: options.isFullscreen() },
      { id: "compact", label: "Mode ringkas", checked: options.isCompact() },
    ] },
    { id: "account", label: "Akun", items: [
      { label: `Kasir: ${options.cashierName() || "-"}`, disabled: true }, { separator: true },
      { id: "logout", label: "Keluar (logout)" },
    ] },
    { id: "help", label: "Bantuan", items: [
      { id: "shortcuts", label: "Daftar shortcut keyboard" }, { separator: true }, { id: "about", label: "Tentang" },
    ] },
  ])
  const dockItems = computed<DockItem[]>(() => [
    { id: "search", icon: "barcode", label: "Cari produk", shortcut: "F1" },
    { id: "customer", icon: "user", label: "Pelanggan", shortcut: "F2" },
    { id: "discount", icon: "badge-percent", label: "Diskon", shortcut: "F4" },
    { id: "exact", icon: "check", label: "Uang pas", shortcut: "F9", disabled: options.settlementMode() !== "paid" },
    { id: "hold", icon: "pause", label: "Tahan", shortcut: "F10", disabled: !options.isDraft() },
    { id: "new", icon: "plus", label: "Transaksi baru", shortcut: "F11" },
    { id: "process", icon: "save", label: options.isDraft() ? "Proses transaksi" : "Buat draft", shortcut: "F12", disabled: options.isPosted() || options.isProcessing() },
    { id: "shortcuts", icon: "keyboard", label: "Bantuan shortcut" },
  ])
  return { menus, dockItems }
}
