<script setup lang="ts">
import { ref, watch } from 'vue'
import { useToast } from '@/shared/composables/useToast'

import unitService, { type Unit, type UnitPayload } from '../services/unitService'

// ── KOMPONEN UI KUSTOM KAMU ──
import BaseInput from '@/shared/components/ui/form/BaseInput.vue'
import BaseButton from '@/shared/components/ui/primitives/BaseButton.vue'

const toast = useToast()

const props = defineProps<{
  unit?: Unit | null
}>()

const emit = defineEmits<{
  select: [value: Unit]
  close: []
}>()

const saving = ref(false)

const form = ref<UnitPayload>({
  name: '',
  abbreviation: '',
})

// State untuk menampung error validasi form
const formErrors = ref<Record<string, string>>({})

watch(
  () => props.unit,
  (unit) => {
    form.value = {
      name: unit?.name ?? '',
      abbreviation: unit?.abbreviation ?? '',
    }
  },
  { immediate: true }
)

function validateForm(): boolean {
  formErrors.value = {}

  if (form.value.name.trim().length < 2) {
    formErrors.value.name = 'Nama satuan minimal 2 karakter.'
  } else if (form.value.name.trim().length > 60) {
    formErrors.value.name = 'Nama satuan maksimal 60 karakter.'
  }

  if (!form.value.abbreviation.trim()) {
    formErrors.value.abbreviation = 'Singkatan satuan wajib diisi.'
  } else if (form.value.abbreviation.trim().length > 20) {
    formErrors.value.abbreviation = 'Singkatan maksimal 20 karakter.'
  }

  return Object.keys(formErrors.value).length === 0
}

function getErrorMessage(error: any): string {
  const message = error?.response?.data?.message

  if (Array.isArray(message)) {
    return message.join(', ')
  }

  if (typeof message === 'string') {
    return message
  }

  return error?.message || 'Terjadi kesalahan saat menyimpan satuan.'
}

async function save(): Promise<void> {
  if (!validateForm()) {
    // Opsional: Jika kamu punya toast warning, bisa dipanggil di sini
    // toast.warning('Mohon periksa kembali form input.')
    return
  }

  saving.value = true

  const payload: UnitPayload = {
    name: form.value.name.trim(),
    abbreviation: form.value.abbreviation.trim(),
  }

  try {
    const response = props.unit ? await unitService.update(props.unit.id, payload) : await unitService.create(payload)

    const result = response.data

    if (result.error || !result.data) {
      throw new Error(typeof result.message === 'string' ? result.message : 'Gagal menyimpan satuan.')
    }

    toast.success(props.unit ? 'Satuan berhasil diperbarui.' : 'Satuan berhasil ditambahkan.')

    emit('select', result.data)
    emit('close')
  } catch (error: any) {
    toast.error(getErrorMessage(error))
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <!-- Tambahkan id agar tombol submit di footer bisa memicu form ini -->
  <form id="unitForm" @submit.prevent="save" class="space-y-4">
    <!-- Nama Satuan -->
    <BaseInput
      id="unit-name"
      v-model="form.name"
      label="Nama Satuan"
      placeholder="Contoh: Botol"
      maxlength="60"
      required
      :disabled="saving"
      :error="formErrors.name"
    />

    <!-- Singkatan -->
    <BaseInput
      id="unit-abbreviation"
      v-model="form.abbreviation"
      label="Singkatan"
      placeholder="Contoh: btl"
      maxlength="20"
      required
      :disabled="saving"
      :error="formErrors.abbreviation"
    />
  </form>

  <!-- Footer Actions -->
  <div class="flex justify-end gap-2 pt-5">
    <BaseButton variant="secondary" :disabled="saving" @click="emit('close')">Batal</BaseButton>

    <!--
      Tombol ini berada di luar tag <form>,
      tapi menggunakan atribut form="unitForm" agar bisa memicu submit.
    -->
    <BaseButton type="submit" form="unitForm" variant="primary" :loading="saving">
      {{ saving ? 'Menyimpan...' : 'Simpan' }}
    </BaseButton>
  </div>
</template>
