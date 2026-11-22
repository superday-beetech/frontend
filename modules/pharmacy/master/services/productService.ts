import { http as api } from '@/core/api/client'
import type { ApiResponse } from '@/core/api/types'

/**
 * Master product record returned by the Pharmacy Product Catalog API.
 * The catalog response already includes active units and prices.
 */
export interface Product {
  id: number
  sku: string
  barcode: string | null
  name: string
  category_id: number
  category_name?: string | null
  unit_id: number
  unit_name?: string | null
  unit_abbreviation?: string | null
  purchase_price: number | string
  selling_price: number | string
  description: string | null
  is_active: number
  created_at?: string | null
  updated_at?: string | null
  units: ProductUnit[]
  prices: ProductPrice[]
}

export interface ProductUnit {
  id?: number
  product_id?: number
  unit_id: number
  unit_name?: string | null
  unit_abbreviation?: string | null
  conversion_factor: number
  barcode?: string | null
  is_base: 0 | 1
  is_purchase_unit: 0 | 1
  is_sale_unit: 0 | 1
  is_active: 0 | 1
  sort_order?: number
}

export interface ProductPrice {
  id?: number
  product_id?: number
  unit_id: number
  customer_type: string | null
  min_qty: number
  price: number
  valid_from?: string
  valid_to?: string | null
  is_active?: 0 | 1
}

export interface ProductAttribute {
  id?: number
  product_id?: number
  attr_type: string
  attr_group?: string | null
  title?: string | null
  content?: string | null
  severity?: string | null
  value_num?: number | null
  value_num_2?: number | null
  value_json?: Record<string, unknown> | null
  ref_id?: number | null
  ref_type?: string | null
  is_primary?: 0 | 1
  is_active?: 0 | 1
  sort_order?: number
}

export interface ProductPayload {
  sku: string
  barcode: string | null
  name: string
  category_id: number
  unit_id: number
  purchase_price: number
  selling_price: number
  description: string | null
  is_active: 0 | 1
  /** Additional units only; the base unit is created from unit_id. */
  units?: ProductUnitPayload[]
  /** Versioned selling prices, optionally differentiated by unit/customer/quantity. */
  prices?: ProductPricePayload[]
  /** Flexible product attributes. Unit and price are managed by their own collections. */
  attributes?: ProductAttributePayload[]
}

export type ProductUnitPayload = Omit<ProductUnit, 'id' | 'product_id' | 'unit_name' | 'unit_abbreviation'> & {
  unit_id: number
}

export type ProductPricePayload = Omit<ProductPrice, 'id' | 'product_id' | 'valid_from' | 'valid_to' | 'is_active'> & {
  is_active?: 0 | 1
}

export type ProductAttributePayload = Omit<ProductAttribute, 'id' | 'product_id'> & {
  id?: number
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

export interface ProductListParams {
  page?: number
  per_page?: number
  search?: string
  is_active?: 0 | 1
  category_id?: number
}

export interface ProductPriceList {
  product_id: number
  items: ProductPrice[]
}

export interface UploadImageResult {
  url: string
  filename: string
}

const BASE_URL = '/pharmacy/product-api'

const productService = {
  getAll(params?: ProductListParams) {
    return api.get<ApiResponse<ProductListData>>(BASE_URL, { params })
  },

  getById(id: number) {
    return api.get<ApiResponse<Product>>(`${BASE_URL}/show/${id}`)
  },

  create(payload: ProductPayload) {
    return api.post<ApiResponse<Product>>(`${BASE_URL}/create`, payload)
  },

  update(id: number, payload: Partial<ProductPayload>) {
    return api.put<ApiResponse<Product>>(`${BASE_URL}/update/${id}`, payload)
  },

  delete(id: number) {
    return api.delete<ApiResponse<{ id: number }>>(`${BASE_URL}/delete/${id}`)
  },

  getAttributes(productId: number) {
    return api.get<ApiResponse<ProductAttribute[]>>(`${BASE_URL}/attributes/${productId}`)
  },

  getPrices(productId: number) {
    return api.get<ApiResponse<ProductPriceList>>(`${BASE_URL}/prices/${productId}`)
  },

  uploadImage(file: File) {
    const formData = new FormData()
    formData.append('image', file)

    return api.post<ApiResponse<UploadImageResult>>(`${BASE_URL}/upload-image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  deleteImage(filename: string) {
    return api.post<ApiResponse<null>>(`${BASE_URL}/delete-image`, { filename })
  },
}

export default productService
