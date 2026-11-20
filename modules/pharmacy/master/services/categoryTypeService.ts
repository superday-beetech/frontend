import { http as api } from "@/core/api/client";
import type { ApiResponse } from "@/core/api/types";

export interface CategoryTypeOption {
  value: string;
  label: string;
}

const BASE_URL = "/pharmacy/category-type-api";

const categoryTypeService = {
  async getByModule(module: string) {
    const response = await api.get<ApiResponse<CategoryTypeOption[]>>(BASE_URL, { params: { module } });
    return response.data;
  },
};

export default categoryTypeService;
