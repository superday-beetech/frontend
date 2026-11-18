import { apiGet, apiPost } from '@/core/api/request'
import type { CreateSalePayload, PostSalePayload, Sale, SalesListResponse } from '../types/sales'

const BASE_URL = '/pharmacy/sales-api'

export interface SalesFilters {
  page?: number
  per_page?: number
  search?: string
  status?: string
}

function generateIdempotencyKey(): string {
  return typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2)
}

export const salesService = {
  getSales(filters: SalesFilters = {}): Promise<SalesListResponse> {
    return apiGet<SalesListResponse>(BASE_URL, { params: filters })
  },

  getSale(id: number): Promise<Sale> {
    return apiGet<Sale>(`${BASE_URL}/show/${id}`)
  },

  createSale(payload: CreateSalePayload): Promise<Sale> {
    return apiPost<Sale>(`${BASE_URL}/create`, payload)
  },

  checkout(payload: CreateSalePayload, payment: PostSalePayload, idempotencyKey?: string): Promise<Sale> {
    const key = idempotencyKey ?? generateIdempotencyKey()
    return apiPost<Sale>(
      `${BASE_URL}/checkout`,
      { ...payload, payment },
      { headers: { 'Idempotency-Key': key } },
    )
  },

  postSale(id: number, payload: PostSalePayload): Promise<Sale> {
    return apiPost<Sale>(
      `${BASE_URL}/post/${id}`,
      payload,
      { headers: { 'Idempotency-Key': generateIdempotencyKey() } },
    )
  },

  holdSale(id: number): Promise<Sale> {
    return apiPost<Sale>(`${BASE_URL}/hold/${id}`)
  },

  resumeSale(id: number): Promise<Sale> {
    return apiPost<Sale>(`${BASE_URL}/resume/${id}`)
  },

  cancelSale(id: number, options?: { restoreHeld?: boolean }): Promise<Sale> {
    return apiPost<Sale>(`${BASE_URL}/${id}/cancel`, {}, { params: { restore_held: options?.restoreHeld ? 1 : 0 } })
  },
}
