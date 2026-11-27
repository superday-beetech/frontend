import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import { organizationsApi } from '../api/organization.api'

import type { Organization, OrganizationCreatePayload, OrganizationUpdatePayload, OrganizationQuery } from '../types/organization.types'

const DEFAULT_PER_PAGE = 10

export const useOrganizationManagementStore = defineStore('organization-management', () => {
  const items = ref<Organization[]>([])
  const current = ref<Organization | null>(null)

  const loading = ref(false)
  const saving = ref(false)
  const errorMessage = ref<string | null>(null)

  const pagination = ref({
    current_page: 1,
    per_page: DEFAULT_PER_PAGE,
    total: 0,
    last_page: 1,
  })

  const hasData = computed(() => items.value.length > 0)

  function getErrorMessage(error: unknown): string {
    const err = error as {
      response?: {
        data?: {
          message?: string | string[]
          errors?: Record<string, string | string[]>
        }
      }
      message?: string
    }

    const message = err.response?.data?.message

    if (Array.isArray(message)) {
      return message.join(', ')
    }

    if (message) {
      return message
    }

    const errors = err.response?.data?.errors

    if (errors) {
      return Object.values(errors).flat().join(', ')
    }

    return err.message || 'Terjadi kesalahan.'
  }

  async function fetchList(params: OrganizationQuery = {}) {
    loading.value = true
    errorMessage.value = null

    try {
      const result = await organizationsApi.index(params)

      items.value = result.items ?? []

      pagination.value = {
        current_page: result.pagination?.current_page ?? 1,
        per_page: result.pagination?.per_page ?? DEFAULT_PER_PAGE,
        total: result.pagination?.total ?? items.value.length,
        last_page: result.pagination?.last_page ?? 1,
      }

      return result
    } catch (error) {
      errorMessage.value = getErrorMessage(error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function fetchDetail(id: number) {
    loading.value = true
    errorMessage.value = null

    try {
      current.value = await organizationsApi.show(id)
      return current.value
    } catch (error) {
      errorMessage.value = getErrorMessage(error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function create(payload: OrganizationCreatePayload) {
    saving.value = true
    errorMessage.value = null

    try {
      const result = await organizationsApi.create(payload)
      current.value = result
      return result
    } catch (error) {
      errorMessage.value = getErrorMessage(error)
      throw error
    } finally {
      saving.value = false
    }
  }

  async function update(id: number, payload: OrganizationUpdatePayload) {
    saving.value = true
    errorMessage.value = null

    try {
      const result = await organizationsApi.update(id, payload)

      current.value = result

      const index = items.value.findIndex((item) => item.id === id)

      if (index !== -1) {
        items.value[index] = {
          ...items.value[index],
          ...result,
        }
      }

      return result
    } catch (error) {
      errorMessage.value = getErrorMessage(error)
      throw error
    } finally {
      saving.value = false
    }
  }

  async function archive(id: number) {
    saving.value = true
    errorMessage.value = null

    try {
      await organizationsApi.archive(id)

      items.value = items.value.filter((item) => item.id !== id)

      pagination.value.total = Math.max(0, pagination.value.total - 1)

      if (current.value?.id === id) {
        current.value = null
      }

      return true
    } catch (error) {
      errorMessage.value = getErrorMessage(error)
      throw error
    } finally {
      saving.value = false
    }
  }

  function reset() {
    items.value = []
    current.value = null
    errorMessage.value = null
    loading.value = false
    saving.value = false

    pagination.value = {
      current_page: 1,
      per_page: DEFAULT_PER_PAGE,
      total: 0,
      last_page: 1,
    }
  }

  return {
    items,
    current,
    loading,
    saving,
    errorMessage,
    pagination,
    hasData,

    fetchList,
    fetchDetail,
    create,
    update,
    archive,
    reset,
  }
})
