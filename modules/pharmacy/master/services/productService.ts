import { http as api } from '@/core/api/client'
import type { ApiResponse } from '@/core/api/types'

export interface Product {
  id: number
  sku: string
  barcode: string | null
  name: string
  category_id: number
  unit_id: number
  category_name?: string | null
  unit_name?: string | null
  unit_abbreviation?: string | null
  purchase_price: number | string
  selling_price: number | string
  description: string | null
  is_active: number
  created_at?: string | null
  updated_at?: string | null
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

export interface ProductListParams {
  page?: number
  per_page?: number
  search?: string
  date_from?: string
  date_to?: string
  is_active?: number
  category_id?: number
}

export interface ProductOptions {
  drug_classes: Array<{ value: string; label: string }>
  dosage_forms: Array<{ value: string; label: string }>
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
  unit_conversion: Record<string, number> | string | null
  min_stock: number
  max_stock: number | null
  rack_location: string | null
  manufacturer: string | null
  created_at?: string | null
  updated_at?: string | null
}

export interface ProductDetailPayload {
  product_id?: number
  generic_name?: string | null
  active_ingredient?: string | null
  dosage_form?: string | null
  strength?: string | null
  drug_class?: string | null
  bpom_number?: string | null
  requires_prescription?: number
  unit_conversion?: Record<string, number> | null
  min_stock?: number
  max_stock?: number | null
  rack_location?: string | null
  manufacturer?: string | null
}

export interface ProductUnitAttribute {
  id?: number
  unit: string
  qty: number
  barcode?: string | null
  price?: number | null
}

export interface ProductImageAttribute {
  id?: number
  url: string
  is_primary?: number
}

export interface ProductInfoAttribute {
  id?: number
  group: string
  title?: string | null
  content: string
  severity?: string | null
}

export interface ProductWithDetailPayload extends ProductPayload {
  detail?: ProductDetailPayload | null
  units?: ProductUnitAttribute[]
  images?: ProductImageAttribute[]
  infos?: ProductInfoAttribute[]
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
export interface UploadImageResult {
  url: string
  filename: string
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
  getById(id: number) {
    return api.get<ApiResponse<Product>>(`${BASE_URL}/show/${id}`)
  },

  create(payload: ProductPayload) {
    return api.post<ApiResponse<Product>>(`${BASE_URL}/create`, payload)
  },

  update(id: number, payload: ProductPayload) {
    return api.put<ApiResponse<Product>>(`${BASE_URL}/update/${id}`, payload)
  },

  delete(id: number) {
    return api.delete<ApiResponse<{ id: number }>>(`${BASE_URL}/delete/${id}`)
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

  async deleteDetail(productId: number) {
    const response = await api.delete<ApiResponse<{ product_id: number }>>(`${DETAIL_BASE_URL}/delete/${productId}`)
    return response.data
  },
  createWithDetail(payload: ProductWithDetailPayload) {
    return api.post<ApiResponse<Product>>(`${BASE_URL}/create-with-detail`, payload)
  },

  updateWithDetail(id: number, payload: ProductWithDetailPayload) {
    return api.put<ApiResponse<Product>>(`${BASE_URL}/update-with-detail/${id}`, payload)
  },

  async getAttributes(productId: number) {
    const response = await api.get<ApiResponse<ProductAttributes>>(`${BASE_URL}/attributes/${productId}`)
    return response.data
  },
  uploadImage(file: File) {
    const formData = new FormData()
    formData.append('image', file)

    return api.post<ApiResponse<UploadImageResult>>(`${BASE_URL}/upload-image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  deleteImage(filename: string) {
    return api.post(`${BASE_URL}/delete-image`, { filename })
  },
}

export default productService
