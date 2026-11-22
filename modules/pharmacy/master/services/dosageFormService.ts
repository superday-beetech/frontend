import { http as api } from '@/core/api/client'
import type { ApiResponse } from '@/core/api/types'

export interface DosageForm {
  id: number
  name: string
  sort_order: number
  is_active: number
  created_at?: string | null
  updated_at?: string | null
}

export interface DosageFormPayload {
  name: string
  is_active: number
}

export interface DosageFormPagination {
  current_page: number
  per_page: number
  total: number
  total_pages: number
}

export interface DosageFormListData {
  items: DosageForm[]
  pagination: DosageFormPagination
}
export interface DosageFormParams {
  page?: number
  per_page?: number
  search?: string
  is_active?: 0 | 1
}
const BASE_URL = '/pharmacy/dosage-form-api'

const dosageFormService = {
  getAll(params?: DosageFormParams) {
    return api.get<ApiResponse<DosageFormListData>>(BASE_URL, { params })
  },

  getById(id: number) {
    return api.get<ApiResponse<DosageForm>>(`${BASE_URL}/show/${id}`)
  },

  create(payload: DosageFormPayload) {
    return api.post<ApiResponse<DosageForm>>(`${BASE_URL}/create`, payload)
  },

  update(id: number, payload: Partial<DosageFormPayload>) {
    return api.put<ApiResponse<DosageForm>>(`${BASE_URL}/update/${id}`, payload)
  },

  delete(id: number) {
    return api.delete<ApiResponse<{ id: number }>>(`${BASE_URL}/delete/${id}`)
  },
}

export default dosageFormService
