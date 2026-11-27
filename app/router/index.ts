import { createRouter, createWebHistory } from 'vue-router'
import { staticRoutes } from './routes'
import { installRouterGuards } from './guards'

const isDev = import.meta.env.DEV

export const router = createRouter({
  history: createWebHistory(isDev ? '/' : '/acn/'),
  routes: staticRoutes,
})

installRouterGuards(router)
