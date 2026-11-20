import 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    permissions?: string[]
    guestOnly?: boolean
  }
}
