export type SaleStatus = 'draft' | 'held' | 'posted' | 'cancelled'
export type PaymentStatus = 'unpaid' | 'partial' | 'paid'
export type PaymentMethod = 'cash' | 'transfer' | 'qris' | 'debit' | 'credit' | 'other'
export type DiscountMode = 'amount' | 'percent'
export type TaxMode = 'amount' | 'percent'
export type SettlementMode = 'paid' | 'partial' | 'receivable'
export type AdditionalChargeType = 'donation' | 'shipping' | 'packaging' | 'service' | 'other'

export type NumericValue = number | string

export interface SaleItemInput {
  product_id: number
  quantity: number
  unit_price: number
  discount_amount?: number
  notes?: string | null
}

export interface PosAdditionalCharge {
  id: string
  type: AdditionalChargeType
  label: string
  description: string
  amount: number
}

export interface CreateSalePayload {
  customer_id?: number | null
  sale_date?: string
  discount_amount?: number
  tax_amount?: number
  notes?: string | null
  items: SaleItemInput[]
}

export interface PostSalePayload {
  settlement_mode: SettlementMode

  amount: number
  applied_amount: number
  amount_received: number
  change_amount: number

  payment_method: PaymentMethod | null

  reference_number: string | null
  due_date: string | null

  payment_confirmed: boolean
  collateral_note?: string | null
  buyer_name?: string | null
  buyer_phone?: string | null
}

export interface SaleItem {
  id: number
  sale_id: number
  product_id: number
  batch_id: number | null
  product_name?: string
  sku?: string
  barcode?: string | null
  batch_number?: string | null
  expired_at?: string | null
  notes?: string | null

  quantity: NumericValue
  unit_price: NumericValue
  unit_cost: NumericValue
  discount_amount: NumericValue
  subtotal: NumericValue
}

export interface Sale {
  id: number
  sale_number: string
  customer_id: number | null
  customer_name?: string | null

  sale_date: string
  status: SaleStatus

  subtotal: NumericValue
  discount_amount: NumericValue
  tax_amount: NumericValue
  total_amount: NumericValue
  paid_amount: NumericValue

  settlement_mode: SettlementMode
  amount_received: NumericValue
  change_amount: NumericValue
  due_date?: string | null
  collateral_note?: string | null

  payment_status: PaymentStatus
  payment_method?: PaymentMethod | null
  reference_number?: string | null
  notes?: string | null

  items?: SaleItem[]
  created_at?: string
  updated_at?: string
}

export interface SalesPagination {
  current_page: number
  per_page: number
  total: number
  last_page: number
}

export interface SalesListResponse {
  data: Sale[]
  pagination: SalesPagination
}

export interface PosCartItem {
  product_id: number
  sku: string
  barcode: string | null
  product_name: string
  unit_name?: string
  quantity: number
  unit_price: number
  unit_conversion?: Record<string, number> | string | null

  // Nominal diskon hasil perhitungan.
  discount_amount: number

  // Input diskon item.
  discount_mode?: DiscountMode
  discount_value?: number

  notes?: string | null
  available_stock?: NumericValue
  batch_id?: number | null
  batch_number?: string | null
  expired_at?: string | null
}

export interface ProductSearchResult {
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
  selling_price: NumericValue
  stock_available: NumericValue

  generic_name: string | null
  active_ingredient: string | null
  strength: string | null
  dosage_form: string | null
  drug_class: string | null
  bpom_number: string | null

  unit_conversion?: string | Record<string, number> | null
}

export type PosProductSearchResult = Pick<
  ProductSearchResult,
  | 'id'
  | 'sku'
  | 'barcode'
  | 'name'
  | 'unit_name'
  | 'unit_abbreviation'
  | 'category_name'
  | 'selling_price'
  | 'is_active'
  | 'unit_conversion'
> & {
  stock_available?: NumericValue
}
