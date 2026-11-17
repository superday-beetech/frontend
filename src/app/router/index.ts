import { createRouter, createWebHistory } from 'vue-router'
import { staticRoutes } from './routes'
import { installRouterGuards } from './guards'

export const router = createRouter({
  history: createWebHistory(),
  routes: staticRoutes,
})

installRouterGuards(router)
