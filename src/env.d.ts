/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_NAME: string
  readonly VITE_API_BASE_URL: string
  readonly VITE_USE_MOCK: string
  readonly VITE_DEV_API_TARGET: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
declare module 'sortablejs' {
  import Sortable from 'sortablejs/index'
  export default Sortable
  export * from 'sortablejs/index'
}
