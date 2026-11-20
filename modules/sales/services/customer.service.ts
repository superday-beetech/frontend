import { apiGet, apiPost, apiPut, apiDelete } from '@/core/api/request'
import type { Customer, CustomerPayload, CustomerListData, CustomerSearchParams } from '../types/customer'

const BASE_URL = '/pharmacy/customer-api-pos'

export const customerService = {
  getAll(params: CustomerSearchParams = {}): Promise<CustomerListData> {
    return apiGet<CustomerListData>(BASE_URL, { params })
  },
  getById(id: number): Promise<Customer> {
    return apiGet<Customer>(`${BASE_URL}/show/${id}`)
  },
  create(payload: CustomerPayload): Promise<Customer> {
    return apiPost<Customer>(`${BASE_URL}/create`, payload)
  },
  update(id: number, payload: CustomerPayload): Promise<Customer> {
    return apiPut<Customer>(`${BASE_URL}/update/${id}`, payload)
  },
  delete(id: number): Promise<null> {
    return apiDelete<null>(`${BASE_URL}/delete/${id}`)
  },
}

export default customerService
