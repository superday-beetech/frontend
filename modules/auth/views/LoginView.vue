<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth.store'
import { env } from '@/core/config/env'
import { isSafeRedirect } from '@/core/utils/redirect'
import { getApiErrorMessage } from '@/core/api/errors'
import { useFormValidation, commonRules } from '@/shared/composables/useFormValidation'
import BaseInput from '@/shared/components/ui/form/BaseInput.vue'
import BaseButton from '@/shared/components/ui/primitives/BaseButton.vue'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

// Kredensial demo hanya terisi di mode development + mock; tidak pernah di production.
const useDemoCredentials = env.useMock

const { form, errors, validateForm, setErrorsFromResponse } = useFormValidation(
  {
    identity: useDemoCredentials ? 'admin@cakra.test' : '',
    password: useDemoCredentials ? 'password' : '',
  },
  {
    identity: [commonRules.required('Email atau username wajib diisi.')],
    password: [commonRules.required('Password wajib diisi.')],
  }
)

const loading = ref(false)
const generalError = ref('')

async function handleSubmit() {
  if (loading.value || !validateForm()) return
  loading.value = true
  generalError.value = ''
  try {
    await auth.login({ identity: form.identity.trim(), password: form.password })
    const redirect = route.query.redirect
    await router.push(isSafeRedirect(redirect) ? redirect : '/')
  } catch (err: unknown) {
    if (!setErrorsFromResponse(err)) {
      generalError.value = getApiErrorMessage(err, 'Gagal masuk ke sistem.')
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-slate-100 p-4">
    <div class="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div class="mb-6 text-center">
        <div class="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary-600 text-white font-bold">CE</div>
        <h2 class="text-base font-bold text-slate-800">Masuk ke Cakra Enterprise</h2>
        <p class="text-xs text-slate-500 mt-1">Gunakan akun terdaftar Anda untuk melanjutkan</p>
      </div>

      <div v-if="generalError" role="alert" class="mb-4 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-600 border border-rose-200">
        {{ generalError }}
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-4" novalidate>
        <BaseInput
          v-model="form.identity"
          label="Email atau Username"
          type="text"
          placeholder="Masukkan email atau username"
          :error="errors.identity"
          required
        />
        <BaseInput v-model="form.password" label="Password" type="password" placeholder="••••••••" :error="errors.password" required />
        <BaseButton type="submit" class="w-full" :loading="loading">Masuk</BaseButton>
      </form>
    </div>
  </div>
</template>
