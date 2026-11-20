import { reactive, computed } from 'vue'
import { getFieldErrors } from '@/core/api/errors'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ValidationRule = (value: any) => true | string

export interface ValidationRules {
  [key: string]: ValidationRule[]
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useFormValidation<T extends Record<string, any> = Record<string, any>>(initialValues: T = {} as T, rules: ValidationRules = {}) {
  const form = reactive<T>({ ...initialValues })
  const errors = reactive<Record<string, string>>({})
  const touched = reactive<Record<string, boolean>>({})

  // Validasi satu field tertentu
  function validateField(field: keyof T) {
    const fieldKey = String(field)
    touched[fieldKey] = true
    errors[fieldKey] = ''

    for (const rule of rules[fieldKey] ?? []) {
      const result = rule((form as T)[field])
      if (result !== true) {
        errors[fieldKey] = result
        break
      }
    }
  }

  // Validasi seluruh field form
  function validateForm(): boolean {
    for (const field in rules) validateField(field as keyof T)
    return Object.values(errors).every((err) => !err)
  }

  function clearErrors() {
    for (const field in errors) errors[field] = ''
  }

  // Reset form dan error
  function resetForm() {
    Object.assign(form, initialValues)
    clearErrors()
    for (const field in touched) touched[field] = false
  }

  /**
   * Petakan error 422 dari backend ke field.
   * @returns true jika ada error per-field yang berhasil dipetakan (berarti bukan error umum).
   */
  function setErrorsFromResponse(error: unknown): boolean {
    const fieldErrors = getFieldErrors(error)
    const fields = Object.keys(fieldErrors)
    if (!fields.length) return false
    clearErrors()
    for (const field of fields) {
      errors[field] = fieldErrors[field] as string
      touched[field] = true
    }
    return true
  }

  const isFormValid = computed(() => Object.values(errors).every((err) => !err))

  return {
    form,
    errors,
    touched,
    validateField,
    validateForm,
    clearErrors,
    resetForm,
    setErrorsFromResponse,
    isFormValid,
  }
}

// ==========================================
// KUMPULAN ATURAN VALIDASI SIAP PAKAI (RULES)
// ==========================================
export const commonRules = {
  required: (message = 'Field ini wajib diisi'): ValidationRule => {
    return (value) => {
      if (value === null || value === undefined || String(value).trim() === '') {
        return message
      }
      return true
    }
  },

  minLength: (min: number, message = `Minimal ${min} karakter`): ValidationRule => {
    return (value) => {
      if (value && String(value).length < min) {
        return message
      }
      return true
    }
  },

  email: (message = 'Format email tidak valid'): ValidationRule => {
    return (value) => {
      const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (value && !regex.test(String(value))) {
        return message
      }
      return true
    }
  },

  numeric: (message = 'Hanya boleh berisi angka'): ValidationRule => {
    return (value) => {
      // trim: string spasi (" ") sebelumnya lolos karena Number(" ") === 0
      if (value !== null && value !== undefined && String(value).trim() !== '' && Number.isNaN(Number(value))) {
        return message
      }
      return true
    }
  },

  skuFormat: (message = 'Format SKU harus berawalan PRD- (Cth: PRD-001)'): ValidationRule => {
    return (value) => {
      const regex = /^PRD-\d{3,}$/
      if (value && !regex.test(String(value))) {
        return message
      }
      return true
    }
  },
}
