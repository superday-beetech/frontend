<script setup lang="ts">
import { computed, reactive, watch } from "vue";
import customer.api, { type Customer, type CustomerPayload } from "../api/customer.api";
import { useToast } from "@/shared/composables/useToast";

const toast = useToast();

const props = defineProps<{
  customer?: Customer | null;
}>();

const emit = defineEmits<{
  select: [value: Customer];
  close: [];
}>();

const isEdit = computed(() => Boolean(props.customer?.id));
const loading = reactive({ value: false });

const form = reactive<CustomerPayload>({
  code: "",
  name: "",
  customer_type: null,
  phone: null,
  email: null,
  address: null,
  is_active: 1,
});

function fillForm(customer?: Customer | null) {
  form.code = customer?.code ?? "";
  form.name = customer?.name ?? "";
  form.customer_type = customer?.customer_type ?? null;
  form.phone = customer?.phone ?? null;
  form.email = customer?.email ?? null;
  form.address = customer?.address ?? null;
  form.is_active = Number(customer?.is_active ?? 1);
}

watch(
  () => props.customer,
  (customer) => fillForm(customer),
  { immediate: true },
);

async function submitForm() {
  if (loading.value) return;

  if (!(form.code ?? "").trim() || !form.name.trim()) {
    toast.warning("Kode dan nama customer wajib diisi.");
    return;
  }

  loading.value = true;

  try {
    const payload: CustomerPayload = {
      code: (form.code ?? "").trim().toUpperCase(),
      name: form.name.trim(),
      customer_type: form.customer_type?.trim() || null,
      phone: form.phone?.trim() || null,
      email: form.email?.trim() || null,
      address: form.address?.trim() || null,
      is_active: Number(form.is_active),
    };

    const response = isEdit.value ? await customer.api.update(props.customer!.id, payload) : await customer.api.create(payload);

    const result = response.data;

    if (result.error || !result.data) {
      throw new Error(Array.isArray(result.message) ? result.message.join(", ") : result.message || "Gagal menyimpan customer.");
    }

    toast.success(isEdit.value ? "Customer berhasil diperbarui." : "Customer berhasil ditambahkan.");

    emit("select", result.data);
    emit("close");
  } catch (error: any) {
    const message = error?.response?.data?.message || error?.message || "Terjadi kesalahan saat menyimpan customer.";

    toast.error(Array.isArray(message) ? message.join(", ") : message);
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <form @submit.prevent="submitForm">
    <div class="modal-body">
      <div class="grid grid-cols-12">
        <div class="col-span-12 md:col-span-4 mb-3">
          <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"> Kode Customer <span class="text-rose-600">*</span> </label>
          <input v-model="form.code" type="text" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" maxlength="50" placeholder="Contoh: CUS-001" required />
        </div>

        <div class="col-span-12 md:col-span-8 mb-3">
          <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"> Nama Customer <span class="text-rose-600">*</span> </label>
          <input v-model="form.name" type="text" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" maxlength="150" placeholder="Nama customer" required />
        </div>

        <div class="col-span-12 md:col-span-6 mb-3">
          <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Jenis Customer</label>
          <input v-model="form.customer_type" type="text" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" maxlength="30" placeholder="Contoh: retail, grosir, instansi" />
        </div>

        <div class="col-span-12 md:col-span-6 mb-3">
          <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Nomor Telepon</label>
          <input v-model="form.phone" type="text" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" maxlength="30" placeholder="Nomor telepon" />
        </div>

        <div class="col-span-12 mb-3">
          <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
          <input v-model="form.email" type="email" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" maxlength="150" placeholder="Alamat email" />
        </div>

        <div class="col-span-12 mb-3">
          <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Alamat</label>
          <textarea v-model="form.address" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" rows="3" placeholder="Alamat customer" />
        </div>

        <div class="col-span-12 md:col-span-6 mb-3">
          <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Status</label>
          <select v-model.number="form.is_active" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
            <option :value="1">Aktif</option>
            <option :value="0">Nonaktif</option>
          </select>
        </div>
      </div>
    </div>

    <div class="modal-footer">
      <button type="button" class="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-50 bg-slate-100 text-slate-700 hover:bg-slate-200" :disabled="loading.value" @click="emit('close')">Batal</button>

      <button type="submit" class="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-50 bg-primary-600 text-white hover:bg-primary-700" :disabled="loading.value">
        <span v-if="loading.value" class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent spinner-border-sm me-1" />
        {{ loading.value ? "Menyimpan..." : "Simpan" }}
      </button>
    </div>
  </form>
</template>
