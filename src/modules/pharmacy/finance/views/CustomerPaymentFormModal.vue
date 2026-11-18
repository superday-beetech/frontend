<script setup lang="ts">
import { computed, reactive } from "vue";
import type { CustomerPaymentPayload } from "../types/finance";

export interface CustomerOption {
  id: number;
  name: string;
}

const props = defineProps<{
  customers: CustomerOption[];
  paymentNumber: string;
}>();

const emit = defineEmits<{
  select: [value: CustomerPaymentPayload];
  close: [];
}>();

const form = reactive({
  customer_id: "",
  distribution_order_id: "",
  payment_date: new Date().toLocaleDateString("id-ID"),
  amount: "",
  payment_method: "transfer",
  custom_payment_method: "",
  reference_number: "",
  notes: "",
});

const paymentMethods = [
  { label: "Tunai", value: "cash" },
  { label: "Transfer", value: "transfer" },
  { label: "Debit", value: "debit" },
  { label: "Kredit", value: "credit" },
  { label: "Lainnya", value: "other" },
];

const selectedPaymentMethod = computed(() => (form.payment_method === "other" ? form.custom_payment_method.trim() : form.payment_method));

const isValid = computed(() => {
  return Number(form.customer_id) > 0 && form.payment_date !== "" && Number(form.amount) > 0 && selectedPaymentMethod.value !== "";
});

function submit(): void {
  if (!isValid.value) return;

  emit("select", {
    payment_number: props.paymentNumber,
    customer_id: Number(form.customer_id),
    distribution_order_id: form.distribution_order_id ? Number(form.distribution_order_id) : null,
    payment_date: form.payment_date,
    amount: Number(form.amount),
    payment_method: selectedPaymentMethod.value,
    reference_number: form.reference_number.trim() || null,
    notes: form.notes.trim() || null,
  });
}
</script>

<template>
  <form @submit.prevent="submit">
    <div class="grid grid-cols-12 g-3">
      <div class="col-span-12">
        <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Nomor Pembayaran</label>
        <input type="text" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" :value="paymentNumber" readonly />
      </div>

      <div class="col-span-12">
        <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"> Pelanggan <span class="text-rose-600">*</span> </label>
        <select v-model="form.customer_id" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" required>
          <option value="">Pilih pelanggan</option>
          <option v-for="customer in customers" :key="customer.id" :value="String(customer.id)">
            {{ customer.name }}
          </option>
        </select>
        <small v-if="customers.length === 0" class="text-slate-500"> Data pelanggan belum tersedia. </small>
      </div>

      <div class="col-span-12">
        <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Distribution Order ID</label>
        <input v-model="form.distribution_order_id" type="number" min="1" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" placeholder="Opsional" />
        <small class="text-slate-500"> Kosongkan jika pembayaran tidak dikaitkan dengan pesanan tertentu. </small>
      </div>

      <div class="col-span-12 md:col-span-6">
        <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"> Tanggal Pembayaran <span class="text-rose-600">*</span> </label>
        <input v-model="form.payment_date" type="date" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" required />
      </div>

      <div class="col-span-12 md:col-span-6">
        <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"> Jumlah Pembayaran <span class="text-rose-600">*</span> </label>
        <input v-model="form.amount" type="number" min="1" step="0.01" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" placeholder="Masukkan jumlah" required />
      </div>

      <div class="col-span-12">
        <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"> Metode Pembayaran <span class="text-rose-600">*</span> </label>
        <select v-model="form.payment_method" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" required>
          <option v-for="method in paymentMethods" :key="method.value" :value="method.value">
            {{ method.label }}
          </option>
        </select>
      </div>

      <div v-if="form.payment_method === 'other'" class="col-span-12">
        <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"> Nama Metode Pembayaran <span class="text-rose-600">*</span> </label>
        <input v-model="form.custom_payment_method" type="text" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" placeholder="Masukkan metode pembayaran" required />
      </div>

      <div class="col-span-12">
        <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Nomor Referensi</label>
        <input v-model="form.reference_number" type="text" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" placeholder="Nomor transfer atau referensi" />
      </div>

      <div class="col-span-12">
        <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Catatan</label>
        <textarea v-model="form.notes" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" rows="3" placeholder="Catatan pembayaran"></textarea>
      </div>
    </div>

    <div class="flex justify-end gap-2 mt-4">
      <button type="button" class="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-50 bg-slate-100 text-slate-700 hover:bg-slate-200" @click="emit('close')">Batal</button>

      <button type="submit" class="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-50 bg-primary-600 text-white hover:bg-primary-700" :disabled="!isValid">Simpan Pembayaran</button>
    </div>
  </form>
</template>
