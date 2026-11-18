import api from "@/api/client";
import type { ApiResponse } from "@/types/types";

export interface Category {
  id: number;
  module: string; // ← baru
  type: string; // ← baru
  name: string;
  description: string | null;
  is_active: number;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface CategoryPayload {
  module: string; // ← baru
  type: string; // ← baru
  name: string;
  description: string | null;
  is_active: number;
}

export interface CategoryPagination {
  current_page: number;
  per_page: number;
  total: number;
  total_pages: number;
}

export interface CategoryListData {
  items: Category[];
  pagination: CategoryPagination;
}

export const CATEGORY_TYPES: Record<string, string[]> = {
  pharmacy: ["obat", "alkes", "herbal", "vitamin", "kosmetik", "umum"],
  minimarket: ["makanan", "minuman", "sembako", "kebersihan", "rumah_tangga", "rokok", "umum"],
  general: ["umum", "lainnya"],
};

const BASE_URL = "/pharmacy/category-api";

const categoryService = {
  async getAll(
    params: {
      page?: number;
      per_page?: number;
      search?: string;
      module?: string; // ← baru
      type?: string; // ← baru
      is_active?: string;
    } = {},
  ) {
    const response = await api.get<ApiResponse<CategoryListData>>(BASE_URL, {
      params,
    });

    return response.data;
  },

  async getById(id: number) {
    const response = await api.get<ApiResponse<Category>>(`${BASE_URL}/show/${id}`);

    return response.data;
  },

  async create(payload: CategoryPayload) {
    const response = await api.post<ApiResponse<Category>>(`${BASE_URL}/create`, payload);

    return response.data;
  },

  async update(id: number, payload: Partial<CategoryPayload>) {
    const response = await api.put<ApiResponse<Category>>(`${BASE_URL}/update/${id}`, payload);

    return response.data;
  },

  async delete(id: number) {
    const response = await api.delete<ApiResponse<{ id: number }>>(`${BASE_URL}/delete/${id}`);

    return response.data;
  },
};

export default categoryService;
