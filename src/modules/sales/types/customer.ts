export interface Customer {
  id: number
  code: string
  member_number: string | null
  barcode: string | null
  name: string
  customer_type: string | null
  phone: string | null
  email: string | null
  address: string | null
  is_active: number
  created_by?: number | null
  updated_by?: number | null
  created_at?: string | null
  updated_at?: string | null
}

export interface CustomerPayload {
  code?: string
  member_number?: string | null
  barcode?: string | null
  name: string
  customer_type?: string | null
  phone?: string | null
  email?: string | null
  address?: string | null
  is_active?: number
}

export interface CustomerPagination {
  current_page: number
  per_page: number
  total: number
  total_pages: number
}

export interface CustomerListData {
  items: Customer[]
  pagination: CustomerPagination
}

export interface CustomerSearchParams {
  page?: number
  per_page?: number
  search?: string
  customer_type?: string
  is_active?: number
}
