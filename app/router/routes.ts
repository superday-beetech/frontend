/**
 * Route statis (tidak bergantung izin). Route halaman bisnis bersifat dinamis:
 * dibangun dari menu backend oleh `dynamic-routes.ts` dan dipasang sebagai anak `MainLayout`.
 */
/* import type { RouteRecordRaw } from 'vue-router'
import { loadNotFound, resolveView } from './views'
export const ROOT_LAYOUT_ROUTE = 'MainLayout'

export const staticRoutes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: resolveView('auth/LoginView'),
    meta: { guestOnly: true, title: 'Masuk' },
  },
  {
    path: '/organization/select',
    name: 'OrganizationSelection',
    component: resolveView('auth/OrganizationSelectionView'),
    meta: {
      requiresAuth: true,
      title: 'Pilih Organisasi',
    },
  },
  {
    path: '/system/ui-showcase',
    name: 'OrganizationSelection',
    component: resolveView('system/UiShowcaseView'),
    meta: {
      //   requiresAuth: true,
      title: 'Pilih Organisasi',
    },
  },
  {
    path: '/',
    name: ROOT_LAYOUT_ROUTE,
    component: () => import('@/app/layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: resolveView('dashboard/DashboardView'),
        meta: { title: 'Dashboard' },
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: loadNotFound,
    meta: { title: 'Halaman Tidak Ditemukan' },
  },
] */

import type { RouteRecordRaw } from 'vue-router'
import { loadNotFound, resolveView, loadPos } from './views'

export const ROOT_LAYOUT_ROUTE = 'MainLayout'

export const staticRoutes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: resolveView('auth/LoginView'),
    meta: { guestOnly: true, title: 'Masuk' },
  },

  {
    path: '/',
    name: ROOT_LAYOUT_ROUTE,
    component: () => import('@/app/layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: resolveView('dashboard/DashboardView'),
        meta: { title: 'Dashboard' },
      },
      {
        path: '/templates/',
        name: 'Templates',
        component: resolveView('templates/TemplatesView'),
        meta: { title: 'Templates' },
      },
      // ▼ TAMBAHKAN DI SINI AGAR MASUK KE DALAM LAYOUT (SIDEBAR) ▼
      {
        path: '/system/ui-showcase', // path tanpa '/' karena sudah di dalam MainLayout
        name: 'UiShowcase', // NAMA HARUS UNIK
        component: resolveView('system/UiShowcaseView'), // Sesuaikan dengan key di views.ts
        meta: {
          title: 'UI Showcase',
          // requiresAuth: true,
        },
      },
      {
        path: '/pharmacy/returns/pos-create',
        name: 'PharmacyPosSalesReturnCreate',
        component: resolveView('pharmacy/returns/views/PosSalesReturnCreateView'),
        meta: { title: 'Retur Penjualan POS' },
      },
      {
        path: '/organization/select',
        name: 'OrganizationSelection',
        component: resolveView('auth/OrganizationSelectionView'),
        meta: {
          requiresAuth: true,
          title: 'Pilih Organisasi',
        },
      },
    ],
  },
  {
    path: '/sales/pos',
    component: () => import('@/app/layouts/PosLayout.vue'),
    meta: {
      requiresAuth: true,
      layout: 'pos',
    },
    children: [
      {
        path: '',
        name: 'SalesPos',
        component: loadPos,
        meta: {
          title: 'Point of Sale',
        },
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: loadNotFound,
    meta: { title: 'Halaman Tidak Ditemukan' },
  },
]
