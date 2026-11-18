<script setup lang="ts">
import { ref, watch } from "vue";
import { useToast } from "@/shared/composables/useToast";

import unit.api, { type Unit, type UnitPayload } from "../api/unit.api";

const toast = useToast();

const props = defineProps<{
  unit?: Unit | null;
}>();

const emit = defineEmits<{
  select: [value: Unit];
  close: [];
}>();

const saving = ref(false);

const form = ref<UnitPayload>({
  name: "",
  abbreviation: "",
});

watch(
  () => props.unit,
  (unit) => {
    form.value = {
      name: unit?.name ?? "",
      abbreviation: unit?.abbreviation ?? "",
    };
  },
  { immediate: true },
);

function validateForm(): boolean {
  if (form.value.name.trim().length < 2) {
    toast.warning("Nama satuan minimal 2 karakter.");
    return false;
  }

  if (form.value.name.trim().length > 60) {
    toast.warning("Nama satuan maksimal 60 karakter.");
    return false;
  }

  if (!form.value.abbreviation.trim()) {
    toast.warning("Singkatan satuan wajib diisi.");
    return false;
  }

  if (form.value.abbreviation.trim().length > 20) {
    toast.warning("Singkatan maksimal 20 karakter.");
    return false;
  }

  return true;
}

function getErrorMessage(error: any): string {
  const message = error?.response?.data?.message;

  if (Array.isArray(message)) {
    return message.join(", ");
  }

  if (typeof message === "string") {
    return message;
  }

  return error?.message || "Terjadi kesalahan saat menyimpan satuan.";
}

async function save(): Promise<void> {
  if (!validateForm()) return;

  saving.value = true;

  const payload: UnitPayload = {
    name: form.value.name.trim(),
    abbreviation: form.value.abbreviation.trim(),
  };

  try {
    const response = props.unit ? await unit.api.update(props.unit.id, payload) : await unit.api.create(payload);

    const result = response.data;

    if (result.error || !result.data) {
      throw new Error(typeof result.message === "string" ? result.message : "Gagal menyimpan satuan.");
    }

    toast.success(props.unit ? "Satuan berhasil diperbarui." : "Satuan berhasil ditambahkan.");

    emit("select", result.data);
    emit("close");
  } catch (error: any) {
    toast.error(getErrorMessage(error));
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <form @submit.prevent="save">
    <div class="mb-3">
      <label for="unit-name" class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"> Nama Satuan <span class="text-rose-600">*</span> </label>

      <input id="unit-name" v-model="form.name" type="text" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" maxlength="60" placeholder="Contoh: Botol" :disabled="saving" required />
    </div>

    <div class="mb-3">
      <label for="unit-abbreviation" class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"> Singkatan <span class="text-rose-600">*</span> </label>

      <input id="unit-abbreviation" v-model="form.abbreviation" type="text" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" maxlength="20" placeholder="Contoh: btl" :disabled="saving" required />
    </div>

    <div class="flex justify-end gap-2">
      <button type="button" class="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-50 bg-slate-100 text-slate-700 hover:bg-slate-200" :disabled="saving" @click="emit('close')">Batal</button>

      <button type="submit" class="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-50 bg-primary-600 text-white hover:bg-primary-700" :disabled="saving">
        <span v-if="saving" class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent spinner-border-sm me-1"></span>

        {{ saving ? "Menyimpan..." : "Simpan" }}
      </button>
    </div>
  </form>
</template>
