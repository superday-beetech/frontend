import { ref } from "vue";
import categoryTypeService, { type CategoryTypeOption } from "../api/category-type.api";

// Cache per module
const cache: Record<string, CategoryTypeOption[]> = {};
const loading = ref(false);

export function useCategoryTypes() {
  async function load(module: string, force = false): Promise<CategoryTypeOption[]> {
    if (!force && cache[module]) return cache[module];

    loading.value = true;
    try {
      const res = await categoryTypeService.getByModule(module);
      if (res.error || !res.data) {
        return [];
      }
      cache[module] = res.data;
      return res.data;
    } catch {
      return [];
    } finally {
      loading.value = false;
    }
  }

  return { load, loading };
}
