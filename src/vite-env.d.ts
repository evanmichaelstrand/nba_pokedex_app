/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DATA_SOURCE: string
  readonly VITE_CSV_URL: string
  readonly VITE_SEASON?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
