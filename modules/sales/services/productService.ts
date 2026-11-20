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
  unit_abbreviation: string | null
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

export interface PosProduct {
  id: number
  sku: string
  barcode: string | null
  name: string

  category_id: number
  category_name: string

  unit_id: number
  unit_name: string
  unit_abbreviation: string

  is_active: boolean
  selling_price: number | string
  stock_available: number | string

  generic_name: string | null
  active_ingredient: string | null
  strength: string | null
  dosage_form: string | null
  drug_class: string | null
  bpom_number: string | null
  unit_conversion: string | null
}

export interface PosProductData {
  items: PosProduct[]
  pagination: ProductPagination
  sale_date: string
}

const BASE_URL = '/pharmacy/product-api-pos'

const productService = {
  /* getAll(params: ProductSearchParams = {}): Promise<ProductListData> {
    return apiGet<ProductListData>(BASE_URL, { params })
  }, */
  getAll(params: ProductSearchParams = {}): Promise<PosProductData> {
    return apiGet<PosProductData>(BASE_URL, { params })
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
