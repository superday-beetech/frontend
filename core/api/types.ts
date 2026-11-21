/** Amplop respons standar backend (CI4). */
export interface ApiResponse<T> {
  status: number
  error: boolean
  message: string
  data: T
  meta?: PaginationMeta
  csrf_token?: string
}

export interface PageMeta {
  current_page: number
  last_page: number
  per_page: number
  total: number
}

/** Hasil endpoint daftar: data + info halaman. */
export interface PaginationMeta {
  current_page: number
  last_page: number
  per_page: number
  total: number
}

export interface Paginated<T> {
  items: T[]
  meta: PaginationMeta
}

/** Parameter umum untuk endpoint daftar. */
export interface ListQuery {
  page?: number
  per_page?: number
  search?: string
  sort?: string
  order?: 'asc' | 'desc'
}
