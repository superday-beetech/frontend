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

export interface ProductDetail {
  id: number
  product_id: number
  generic_name: string | null
  active_ingredient: string | null
  dosage_form: string | null
  strength: string | null
  drug_class: string | null
  bpom_number: string | null
  requires_prescription: number
  min_stock: number
  max_stock: number | null
  rack_location: string | null
  manufacturer: string | null
}

export type ProductDetailPayload = Partial<Omit<ProductDetail, 'id' | 'product_id'>> & {
  product_id?: number
}

export interface ProductOptions {
  drug_classes: Array<{ value: string; label: string }>
  dosage_forms: Array<{ value: string; label: string }>
}

export interface ProductAttributes {
  unit?: Array<{
    id: number
    title: string
    value_num: number
    value_num_2: number | null
    value_json: { barcode?: string } | null
    is_primary: number
  }>
  image?: Array<{ id: number; value_json: { url: string }; is_primary: number }>
  info?: Array<{ id: number; attr_group: string; title: string | null; content: string; severity: string | null }>
}

export type ProductWithDetailPayload = ProductPayload & {
  detail?: ProductDetailPayload | null
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

function parseJsonValue(value: unknown): Record<string, unknown> | null {
  if (value == null) return null
  if (typeof value === 'object') return value as Record<string, unknown>
  if (typeof value !== 'string') return null

  try {
    return JSON.parse(value) as Record<string, unknown>
  } catch {
    return null
  }
}

const BASE_URL = '/pharmacy/product-api'
const DETAIL_BASE_URL = '/pharmacy/product-detail-api'

const productService = {
  getAll(params?: ProductListParams) {
    return api.get<ApiResponse<ProductListData>>(BASE_URL, { params })
  },

  async getOptions() {
    const response = await api.get<ApiResponse<ProductOptions>>('/pharmacy/product-option-api')
    return response.data
  },

  async getDetail(productId: number) {
    const response = await api.get<ApiResponse<ProductDetail>>(`${DETAIL_BASE_URL}/show/${productId}`)
    return response.data
  },

  async createDetail(payload: ProductDetailPayload) {
    const response = await api.post<ApiResponse<ProductDetail>>(`${DETAIL_BASE_URL}/create`, payload)
    return response.data
  },

  async updateDetail(productId: number, payload: ProductDetailPayload) {
    const response = await api.put<ApiResponse<ProductDetail>>(`${DETAIL_BASE_URL}/update/${productId}`, payload)
    return response.data
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

  async getAttributes(productId: number) {
    const response = await api.get<ApiResponse<ProductAttribute[]>>(`${BASE_URL}/attributes/${productId}`)
    const envelope = response.data
    const rows = envelope.data ?? []
    const grouped: ProductAttributes = { unit: [], image: [], info: [] }

    for (const row of rows) {
      if (row.attr_type === 'unit') {
        grouped.unit?.push({
          id: row.id ?? 0,
          title: row.title ?? '',
          value_num: Number(row.value_num ?? 0),
          value_num_2: row.value_num_2 == null ? null : Number(row.value_num_2),
          value_json: parseJsonValue(row.value_json) as { barcode?: string } | null,
          is_primary: Number(row.is_primary ?? 0),
        })
      } else if (row.attr_type === 'image') {
        grouped.image?.push({
          id: row.id ?? 0,
          value_json: (parseJsonValue(row.value_json) ?? {}) as { url: string },
          is_primary: Number(row.is_primary ?? 0),
        })
      } else if (row.attr_type === 'info') {
        grouped.info?.push({
          id: row.id ?? 0,
          attr_group: row.attr_group ?? '',
          title: row.title ?? null,
          content: row.content ?? '',
          severity: row.severity ?? null,
        })
      }
    }

    return { ...envelope, data: grouped }
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
