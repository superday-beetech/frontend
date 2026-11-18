import api from "@/api/client";
import type { ApiResponse } from "@/types/types";

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
