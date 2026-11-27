<script setup lang="ts">
import { reactive } from 'vue'
import { Save } from 'lucide-vue-next'

import BaseButton from '@/shared/components/ui/primitives/BaseButton.vue'
import BaseInput from '@/shared/components/ui/form/BaseInput.vue'
import BaseSelect from '@/shared/components/ui/form/BaseSelect.vue'

import type { OrganizationCreatePayload, OrganizationUpdatePayload } from '../types/organization.types'

type OrganizationFormMode = 'create' | 'edit'

interface OrganizationFormValue {
  code: string
  slug: string
  name: string
  legal_name: string
  organization_type: string
  timezone: string
  currency: string
}

const props = withDefaults(
  defineProps<{
    mode: OrganizationFormMode
    initialValue?: Partial<OrganizationFormValue>
  }>(),
  {
    mode: 'create',
    initialValue: () => ({}),
  }
)

const emit = defineEmits<{
  select: [value: OrganizationCreatePayload | OrganizationUpdatePayload]
  close: []
}>()

const form = reactive<OrganizationFormValue>({
  code: props.initialValue.code ?? '',
  slug: props.initialValue.slug ?? '',
  name: props.initialValue.name ?? '',
  legal_name: props.initialValue.legal_name ?? '',
  organization_type: props.initialValue.organization_type ?? 'business',
  timezone: props.initialValue.timezone ?? 'Asia/Jakarta',
  currency: props.initialValue.currency ?? 'IDR',
})

const isEditing = props.mode === 'edit'

const organizationTypeOptions = [
  { label: 'Business', value: 'business' },
  { label: 'Cooperative', value: 'cooperative' },
  { label: 'Non Profit', value: 'non_profit' },
  { label: 'Government', value: 'government' },
  { label: 'Other', value: 'other' },
]

function makeSlug(): void {
  if (isEditing || form.slug.trim() !== '') return

  form.slug = form.name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function submitForm(): void {
  const name = form.name.trim()
  const currency = form.currency.trim().toUpperCase()
  const timezone = form.timezone.trim()
  const legalName = form.legal_name.trim()

  if (!name || !currency || !timezone) return

  if (isEditing) {
    const payload: OrganizationUpdatePayload = {
      name,
      legal_name: legalName || null,
      organization_type: form.organization_type,
      timezone,
      currency,
    }

    emit('select', payload)
    return
  }

  const code = form.code.trim().toUpperCase()
  const slug = form.slug.trim().toLowerCase()

  if (!code || !slug) return

  const payload: OrganizationCreatePayload = {
    code,
    slug,
    name,
    legal_name: legalName || null,
    organization_type: form.organization_type,
    timezone,
    currency,
  }

  emit('select', payload)
}
</script>

<template>
  <form class="space-y-4" @submit.prevent="submitForm">
    <div v-if="!isEditing" class="grid gap-4 sm:grid-cols-2">
      <BaseInput v-model="form.code" label="Kode Organisasi" placeholder="ACN" maxlength="50" required class="uppercase" />

      <BaseInput v-model="form.slug" label="Slug" placeholder="adi-cakra-nata" maxlength="100" required />
    </div>

    <BaseInput v-model="form.name" label="Nama Organisasi" placeholder="Nama organisasi" maxlength="150" required @blur="makeSlug" />

    <BaseInput v-model="form.legal_name" label="Nama Legal" placeholder="Nama badan hukum (opsional)" maxlength="200" />

    <div class="grid gap-4 sm:grid-cols-2">
      <BaseSelect
        v-model="form.organization_type"
        label="Tipe Organisasi"
        :options="organizationTypeOptions"
        placeholder="Pilih tipe organisasi"
        required
      />

      <BaseInput v-model="form.timezone" label="Zona Waktu" placeholder="Asia/Jakarta" maxlength="64" required />
    </div>

    <BaseInput v-model="form.currency" label="Mata Uang" placeholder="IDR" maxlength="3" minlength="3" pattern="[A-Za-z]{3}" required />

    <div class="flex justify-end gap-2 border-t border-slate-200 pt-4 dark:border-slate-800">
      <BaseButton type="button" variant="secondary" @click="emit('close')">Batal</BaseButton>

      <BaseButton type="submit">
        <Save class="h-4 w-4" />
        {{ isEditing ? 'Simpan Perubahan' : 'Buat Organisasi' }}
      </BaseButton>
    </div>
  </form>
</template>
