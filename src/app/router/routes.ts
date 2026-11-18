import type { RouteRecordRaw } from 'vue-router'
import { loadNotFound, resolveView } from './views'

/**
 * Route statis (tidak bergantung izin). Route halaman bisnis bersifat dinamis:
 * dibangun dari menu backend oleh `dynamic-routes.ts` dan dipasang sebagai anak `MainLayout`.
 */
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
    path: '/',
    name: ROOT_LAYOUT_ROUTE,
    component: () => import('@/app/layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: resolveView('pharmacy/master/DashboardView'),
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
]
