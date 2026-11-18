import { apiGet, apiPost, apiPut, apiDelete } from '@/core/api/request'

export interface Product {
  id: number
  sku: string | null
  barcode: string | null
  name: string
  category_id: number
  unit_id: number
  category_name?: string | null
  unit_name?: string | null
  purchase_price: number | string
  selling_price: number | string
  stock_available?: number | string
  description: string | null
  is_active: number
  created_at?: string | null
  updated_at?: string | null
}

export interface ProductPayload {
  sku: string | null
  barcode: string | null
  name: string
  category_id: number
  unit_id: number
  purchase_price: number
  selling_price: number
  description: string | null
  is_active: number
}

export interface ProductPagination {
  current_page: number
  per_page: number
  total: number
  total_pages: number
}

export interface ProductListData {
  items: Product[]
  pagination: ProductPagination
}

export interface ProductSearchParams {
  page?: number
  per_page?: number
  search?: string
  date_from?: string
  date_to?: string
  is_active?: number
}

const BASE_URL = '/pharmacy/product-api-pos'

const productService = {
  getAll(params: ProductSearchParams = {}): Promise<ProductListData> {
    return apiGet<ProductListData>(BASE_URL, { params })
  },
  getById(id: number): Promise<Product> {
    return apiGet<Product>(`${BASE_URL}/show/${id}`)
  },
  create(payload: ProductPayload): Promise<Product> {
    return apiPost<Product>(`${BASE_URL}/create`, payload)
  },
  update(id: number, payload: ProductPayload): Promise<Product> {
    return apiPut<Product>(`${BASE_URL}/update/${id}`, payload)
  },
  delete(id: number): Promise<{ id: number }> {
    return apiDelete<{ id: number }>(`${BASE_URL}/delete/${id}`)
  },
}

export default productService
