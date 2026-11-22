<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import customerService, { type Customer, type CustomerPayload } from '../services/customerService'
import { useToast } from '@/shared/composables/useToast'

// ── IMPORT KOMPONEN UI KUSTOM KAMU ──
import BaseInput from '@/shared/components/ui/form/BaseInput.vue'
import BaseTextarea from '@/shared/components/ui/form/BaseTextarea.vue'
import BaseSelect from '@/shared/components/ui/form/BaseSelect.vue'
import BaseButton from '@/shared/components/ui/primitives/BaseButton.vue'

const toast = useToast()

const props = defineProps<{
  customer?: Customer | null
}>()

const emit = defineEmits<{
  select: [value: Customer]
  close: []
}>()

const isEdit = computed(() => Boolean(props.customer?.id))
const loading = reactive({ value: false })

const form = reactive<CustomerPayload>({
  code: '',
  name: '',
  customer_type: null,
  phone: null,
  email: null,
  address: null,
  is_active: 1,
})

// State untuk error validasi (jika kamu ingin menampilkan error per field)
const formErrors = reactive<Record<string, string>>({})

// Opsi untuk BaseSelect status
const statusOptions = [
  { label: 'Aktif', value: 1 },
  { label: 'Nonaktif', value: 0 },
]

function fillForm(customer?: Customer | null) {
  form.code = customer?.code ?? ''
  form.name = customer?.name ?? ''
  form.customer_type = customer?.customer_type ?? null
  form.phone = customer?.phone ?? null
  form.email = customer?.email ?? null
  form.address = customer?.address ?? null
  form.is_active = Number(customer?.is_active ?? 1)

  // Reset error
  Object.keys(formErrors).forEach((key) => delete formErrors[key])
}

watch(
  () => props.customer,
  (customer) => fillForm(customer),
  { immediate: true }
)

async function submitForm() {
  if (loading.value) return

  // Validasi sederhana
  Object.keys(formErrors).forEach((key) => delete formErrors[key])

  if (!(form.code ?? '').trim()) {
    formErrors.code = 'Kode customer wajib diisi.'
  }
  if (!form.name.trim()) {
    formErrors.name = 'Nama customer wajib diisi.'
  }

  if (Object.keys(formErrors).length > 0) {
    toast.warning('Mohon periksa kembali form input.')
    return
  }

  loading.value = true

  try {
    const payload: CustomerPayload = {
      code: (form.code ?? '').trim().toUpperCase(),
      name: form.name.trim(),
      customer_type: form.customer_type?.trim() || null,
      phone: form.phone?.trim() || null,
      email: form.email?.trim() || null,
      address: form.address?.trim() || null,
      is_active: Number(form.is_active),
    }

    const response = isEdit.value ? await customerService.update(props.customer!.id, payload) : await customerService.create(payload)

    const result = response.data

    if (result.error || !result.data) {
      throw new Error(Array.isArray(result.message) ? result.message.join(', ') : result.message || 'Gagal menyimpan customer.')
    }

    toast.success(isEdit.value ? 'Customer berhasil diperbarui.' : 'Customer berhasil ditambahkan.')

    emit('select', result.data)
    emit('close')
  } catch (error: any) {
    const message = error?.response?.data?.message || error?.message || 'Terjadi kesalahan saat menyimpan customer.'
    toast.error(Array.isArray(message) ? message.join(', ') : message)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <!--
    Tambahkan id agar tombol submit di luar form bisa memicunya.
    Gunakan class space-y-4 untuk jarak antar field otomatis.
  -->
  <form id="customerForm" @submit.prevent="submitForm" class="space-y-4">
    <div class="grid grid-cols-1 md:grid-cols-12 gap-4">
      <!-- Kode Customer -->
      <div class="md:col-span-4">
        <BaseInput
          v-model="form.code"
          label="Kode Customer"
          placeholder="Contoh: CUS-001"
          maxlength="50"
          required
          :disabled="loading.value"
          :error="formErrors.code"
        />
      </div>

      <!-- Nama Customer -->
      <div class="md:col-span-8">
        <BaseInput
          v-model="form.name"
          label="Nama Customer"
          placeholder="Nama customer"
          maxlength="150"
          required
          :disabled="loading.value"
          :error="formErrors.name"
        />
      </div>

      <!-- Jenis Customer -->
      <div class="md:col-span-6">
        <BaseInput
          v-model="form.customer_type"
          label="Jenis Customer"
          placeholder="Contoh: retail, grosir, instansi"
          maxlength="30"
          :disabled="loading.value"
        />
      </div>

      <!-- Nomor Telepon -->
      <div class="md:col-span-6">
        <BaseInput v-model="form.phone" label="Nomor Telepon" placeholder="Nomor telepon" maxlength="30" :disabled="loading.value" />
      </div>

      <!-- Email -->
      <div class="md:col-span-12">
        <BaseInput v-model="form.email" type="email" label="Email" placeholder="Alamat email" maxlength="150" :disabled="loading.value" />
      </div>

      <!-- Alamat -->
      <div class="md:col-span-12">
        <BaseTextarea v-model="form.address" label="Alamat" placeholder="Alamat customer" :rows="3" :disabled="loading.value" />
      </div>

      <!-- Status -->
      <div class="md:col-span-6">
        <BaseSelect v-model.number="form.is_active" :options="statusOptions" label="Status" :disabled="loading.value" />
      </div>
    </div>
  </form>

  <!-- Footer Actions -->
  <div class="flex justify-end gap-2 mt-6">
    <BaseButton variant="secondary" :disabled="loading.value" @click="emit('close')">Batal</BaseButton>

    <BaseButton type="submit" form="customerForm" variant="primary" :loading="loading.value">
      {{ loading.value ? 'Menyimpan...' : 'Simpan' }}
    </BaseButton>
  </div>
</template>
