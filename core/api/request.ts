import type { AxiosRequestConfig } from 'axios'
import { http } from './client'
import type { ApiResponse, Paginated } from './types'

/**
 * Pembungkus tipis agar setiap file `modules/<x>/api/*.api.ts` tidak mengulang `.data.data`.
 * Mendukung pembatalan lewat `config.signal` (AbortController).
 */
export async function apiGet<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const { data } = await http.get<ApiResponse<T>>(url, config)
  return data.data
}

export async function apiPost<T = null>(url: string, body?: unknown, config?: AxiosRequestConfig): Promise<T> {
  const { data } = await http.post<ApiResponse<T>>(url, body, config)
  return data.data
}

export async function apiPut<T = null>(url: string, body?: unknown, config?: AxiosRequestConfig): Promise<T> {
  const { data } = await http.put<ApiResponse<T>>(url, body, config)
  return data.data
}

export async function apiDelete<T = null>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const { data } = await http.delete<ApiResponse<T>>(url, config)
  return data.data
}

/** Endpoint daftar: mengembalikan item + meta halaman. */
export async function apiList<T>(url: string, params?: object, config?: AxiosRequestConfig): Promise<Paginated<T>> {
  const { data } = await http.get<ApiResponse<T[]>>(url, { ...config, params })
  const items = data.data
  return {
    items,
    meta: data.meta ?? { current_page: 1, last_page: 1, per_page: items.length, total: items.length },
  }
}
