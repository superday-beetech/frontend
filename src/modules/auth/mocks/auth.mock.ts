// Data simulasi — hanya di-load saat DEV + VITE_USE_MOCK=true (lihat api/auth.api.ts).
// Tidak ikut ter-bundle ke build produksi.
import { STORAGE_KEYS } from '@/core/storage'
import type { LoginPayload, SessionContext } from '../types'
import { pharmacyMenus } from './pharmacy-menus.mock'

export class MockApiError extends Error {
  response: { status: number; data: { message: string; errors?: Record<string, string> } }

  constructor(status: number, message: string, errors?: Record<string, string>) {
    super(message)
    this.name = 'MockApiError'
    this.response = { status, data: { message, errors } }
  }
}

// Emulasi session cookie: bertahan selama tab terbuka (sessionStorage), hilang saat ditutup.
const MOCK_SESSION_KEY = STORAGE_KEYS.mockSession

export async function mockLogin(payload: LoginPayload): Promise<void> {
  await new Promise((r) => setTimeout(r, 400))
  const errors: Record<string, string> = {}
  if (!payload.identity) errors.identity = 'Email atau username wajib diisi.'
  if (!payload.password) errors.password = 'Password wajib diisi.'
  if (Object.keys(errors).length) throw new MockApiError(422, 'Validasi gagal', errors)
  sessionStorage.setItem(MOCK_SESSION_KEY, '1')
}

export async function mockLogout(): Promise<void> {
  sessionStorage.removeItem(MOCK_SESSION_KEY)
}

export async function mockSession(): Promise<SessionContext> {
  await new Promise((r) => setTimeout(r, 200))
  if (!sessionStorage.getItem(MOCK_SESSION_KEY)) throw new MockApiError(401, 'Belum login')
  return MOCK_SESSION
}

const MOCK_SESSION: SessionContext = {
  id: 1,
  username: 'administrator',
  email: 'admin@cakra.test',
  avatar: null,
  thumb: null,
  created_at: null,
  updated_at: null,
  permissions: [
    'dashboard.view',
    'master.product.view',
    'master.product.create',
    'master.product.edit',
    'master.product.delete',
    'sales.view',
    'sales.create',
  ],
  is_superadmin: true,
  groups: ['superadmin'],
  menus: pharmacyMenus,
  /*  menus: [
    { id: 1, parent_id: null, title: 'Dashboard', path: '/', name: 'Dashboard', component_key: null, icon: 'LayoutDashboard' },
    {
      id: 100,
      parent_id: null,
      title: 'Keuangan & Kasir',
      path: '/finance',
      name: 'FinanceMain',
      component_key: null,
      icon: 'Wallet',
      children: [
        {
          id: 101,
          parent_id: 100,
          title: 'Arus Kas Harian',
          path: '/finance/cashflow',
          name: 'FinanceCashflow',
          component_key: null,
          icon: 'ArrowLeftRight',
          children: [
            {
              id: 102,
              parent_id: 101,
              title: 'Laporan Masuk & Keluar',
              path: '/finance/cashflow/report',
              name: 'FinanceCashflowReport',
              component_key: 'finance/CashflowReportView',
            },
          ],
        },
      ],
    },
    {
      id: 2,
      parent_id: null,
      title: 'Operasional',
      path: '/operations',
      name: 'Operations',
      component_key: null,
      icon: 'Layers',
      children: [
        {
          id: 3,
          parent_id: 2,
          title: 'Penjualan & Kasir',
          path: '/operations/sales',
          name: 'OperationsSales',
          component_key: null,
          icon: 'ShoppingCart',
          children: [
            {
              id: 4,
              parent_id: 3,
              title: 'POS Kasir Utama',
              path: '/pharmacy/pos',
              name: 'PharmacyPos',
              component_key: 'pharmacy/PosCashierView',
              permissions: ['sales.create'],
            },
            {
              id: 5,
              parent_id: 3,
              title: 'Riwayat Faktur',
              path: '/pharmacy/sales-history',
              name: 'PharmacySalesHistory',
              component_key: 'pharmacy/SalesHistoryView',
              permissions: ['sales.view'],
            },
          ],
        },
        {
          id: 6,
          parent_id: 2,
          title: 'Inventori & Gudang',
          path: '/operations/inventory',
          name: 'OperationsInventory',
          component_key: null,
          icon: 'Package',
          children: [
            {
              id: 7,
              parent_id: 6,
              title: 'Master Produk',
              path: '/master/products',
              name: 'MasterProducts',
              component_key: 'master/ProductListView',
              permissions: ['master.product.view'],
            },
            {
              id: 8,
              parent_id: 6,
              title: 'Stok Opname & Batch',
              path: '/inventory/batches',
              name: 'InventoryBatches',
              component_key: 'inventory/BatchListView',
            },
          ],
        },
      ],
    },
    {
      id: 9,
      parent_id: null,
      title: 'Pengaturan Sistem',
      path: '/system',
      name: 'System',
      component_key: null,
      icon: 'Settings',
      children: [
        {
          id: 10,
          parent_id: 9,
          title: 'Manajemen Akses',
          path: '/system/access',
          name: 'SystemAccess',
          component_key: null,
          children: [
            {
              id: 11,
              parent_id: 10,
              title: 'Pengguna (Users)',
              path: '/system/users',
              name: 'SystemUsers',
              component_key: 'system/UserListView',
            },
            {
              id: 12,
              parent_id: 10,
              title: 'Role & Permission',
              path: '/system/roles',
              name: 'SystemRoles',
              component_key: 'system/RoleListView',
            },
            {
              id: 13,
              parent_id: 10,
              title: 'Menu Builder',
              path: '/system/menus',
              name: 'SystemMenus',
              component_key: 'system/MenuBuilderView',
            },
          ],
        },
      ],
    },
    {
      id: 200,
      parent_id: null,
      title: 'UI Kit & Dokumentasi',
      path: '/ui-docs',
      name: 'UiDocs',
      component_key: null,
      icon: 'BookOpen',
      children: [
        {
          id: 201,
          parent_id: 200,
          title: 'Panduan & Contoh UI',
          path: '/ui-docs/showcase',
          name: 'UiDocsShowcase',
          component_key: 'system/UiShowcaseView',
        },
      ],
    },
  ], */
}
