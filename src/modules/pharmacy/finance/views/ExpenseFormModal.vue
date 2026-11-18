<script setup lang="ts">
import { computed, reactive } from "vue";
import type { ExpensePayload } from "../types/finance";

const props = defineProps<{
  expenseNumber: string;
}>();

const emit = defineEmits<{
  select: [value: ExpensePayload];
  close: [];
}>();

const categories = [
  { label: "Transportasi", value: "transportation" },
  { label: "Listrik dan Air", value: "utilities" },
  { label: "Sewa", value: "rent" },
  { label: "Gaji dan Upah", value: "salary" },
  { label: "Perlengkapan", value: "supplies" },
  { label: "Administrasi", value: "administration" },
  { label: "Operasional", value: "operational" },
  { label: "Lainnya", value: "other" },
];

const form = reactive({
  expense_date: new Date().toLocaleDateString("en-CA"),
  category: "operational",
  custom_category: "",
  description: "",
  amount: "",
  payment_method: "cash",
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

const selectedCategory = computed(() => (form.category === "other" ? form.custom_category.trim() : form.category));

const selectedPaymentMethod = computed(() => (form.payment_method === "other" ? form.custom_payment_method.trim() : form.payment_method));

const isValid = computed(() => form.expense_date !== "" && selectedCategory.value !== "" && form.description.trim() !== "" && Number(form.amount) > 0 && selectedPaymentMethod.value !== "");

function submit(): void {
  if (!isValid.value) return;

  emit("select", {
    expense_number: props.expenseNumber,
    expense_date: form.expense_date,
    category: selectedCategory.value,
    description: form.description.trim(),
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
        <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Nomor Pengeluaran</label>
        <input type="text" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" :value="expenseNumber" readonly />
      </div>

      <div class="col-span-12 md:col-span-6">
        <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"> Tanggal Pengeluaran <span class="text-rose-600">*</span> </label>
        <input v-model="form.expense_date" type="date" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" required />
      </div>

      <div class="col-span-12 md:col-span-6">
        <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"> Kategori <span class="text-rose-600">*</span> </label>
        <select v-model="form.category" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" required>
          <option v-for="category in categories" :key="category.value" :value="category.value">
            {{ category.label }}
          </option>
        </select>
      </div>

      <div v-if="form.category === 'other'" class="col-span-12">
        <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"> Nama Kategori <span class="text-rose-600">*</span> </label>
        <input v-model="form.custom_category" type="text" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" placeholder="Masukkan kategori pengeluaran" required />
      </div>

      <div class="col-span-12">
        <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"> Deskripsi <span class="text-rose-600">*</span> </label>
        <input v-model="form.description" type="text" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" placeholder="Contoh: Pembelian perlengkapan kantor" required />
      </div>

      <div class="col-span-12 md:col-span-6">
        <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"> Jumlah Pengeluaran <span class="text-rose-600">*</span> </label>
        <input v-model="form.amount" type="number" min="1" step="0.01" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" placeholder="Masukkan jumlah" required />
      </div>

      <div class="col-span-12 md:col-span-6">
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
        <input v-model="form.reference_number" type="text" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" placeholder="Nomor bukti transaksi atau referensi" />
      </div>

      <div class="col-span-12">
        <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Catatan</label>
        <textarea v-model="form.notes" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" rows="3" placeholder="Catatan tambahan"></textarea>
      </div>
    </div>

    <div class="flex justify-end gap-2 mt-4">
      <button type="button" class="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-50 bg-slate-100 text-slate-700 hover:bg-slate-200" @click="emit('close')">Batal</button>

      <button type="submit" class="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-50 bg-primary-600 text-white hover:bg-primary-700" :disabled="!isValid">Simpan Pengeluaran</button>
    </div>
  </form>
</template>
