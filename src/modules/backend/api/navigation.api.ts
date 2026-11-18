import { http } from '@/core/api/client'
import { apiGet, apiPost } from '@/core/api/request'

import type {
  NavigationGroups,
  MenuFormPayload,
  MenuHierarchy,
  MenuPosition,
  MenuSection,
  RouteRegistryPreview,
  RouteRegistrySaveItem,
} from '../types/navigation'

interface NavigationIndexResponse {
  data: NavigationGroups
}

export interface NavigationMutationResponse {
  status: string
  message: string
  position?: MenuPosition
  section?: MenuSection
  csrf_token?: string
}

export interface RouteRegistrySaveResponse {
  status: string
  message: string
  data: {
    inserted?: unknown[]
    skipped?: unknown[]
    [key: string]: unknown
  }
}

function createMenuFormData(payload: MenuFormPayload): FormData {
  const formData = new FormData()

  formData.append('id', payload.id ?? '')
  formData.append('title', payload.title)
  formData.append('url', payload.url)
  formData.append('icon', payload.icon)
  formData.append('parent_id', payload.parent_id)
  formData.append('position', payload.position)
  formData.append('section', payload.section)
  formData.append('is_active', payload.is_active ? '1' : '')

  payload.groups.forEach((group) => {
    formData.append('groups[]', group)
  })

  return formData
}

function assertSuccess(response: NavigationMutationResponse): void {
  if (response.status !== 'success') {
    throw new Error(response.message || 'Permintaan gagal diproses.')
  }
}

export const navigationApi = {
  /**
   * GET /backend/navigation-api
   *
   * Backend:
   * successResponse([
   *   'data' => $data
   * ])
   *
   * apiGet membuka envelope standar satu lapisan,
   * sehingga hasilnya masih { data: NavigationGroups }.
   */
  async getNavigation(position: MenuPosition, section: MenuSection): Promise<NavigationGroups> {
    const response = await apiGet<NavigationIndexResponse>('/backend/navigation-api', {
      params: {
        position,
        section,
      },
    })

    if (!response?.data) {
      throw new Error('Format respons navigasi tidak valid.')
    }

    return response.data
  },

  /**
   * POST /backend/navigation-api/create
   *
   * Backend mengembalikan JSON mentah, bukan ApiResponse.
   */
  async saveMenu(payload: MenuFormPayload): Promise<NavigationMutationResponse> {
    const { data } = await http.post<NavigationMutationResponse>('/backend/navigation-api/create', createMenuFormData(payload), {
      headers: {
        'Content-Type': undefined,
      },
    })

    assertSuccess(data)

    return data
  },

  /**
   * DELETE /backend/navigation-api/destroy/{id}
   */
  async deleteMenu(id: string): Promise<NavigationMutationResponse> {
    const { data } = await http.delete<NavigationMutationResponse>(`/backend/navigation-api/destroy/${encodeURIComponent(id)}`)

    assertSuccess(data)

    return data
  },

  /**
   * POST /backend/navigation-api/update-order
   *
   * Backend menerima array hierarki langsung.
   */
  async updateOrder(tree: MenuHierarchy[]): Promise<NavigationMutationResponse> {
    const { data } = await http.post<NavigationMutationResponse>('/backend/navigation-api/update-order', tree)

    assertSuccess(data)

    return data
  },

  /**
   * POST /backend/navigation-api/sync-menu-preview
   *
   * Endpoint mengembalikan { status, data: preview }.
   */
  async previewRegistry(): Promise<RouteRegistryPreview> {
    return apiPost<RouteRegistryPreview>('/backend/navigation-api/sync-menu-preview', {})
  },

  /**
   * POST /backend/navigation-api/sync-menu-save
   *
   * Endpoint mengembalikan respons mentah:
   * { status, message, data }
   */
  async saveRegistry(section: MenuSection, items: RouteRegistrySaveItem[]): Promise<RouteRegistrySaveResponse> {
    const { data } = await http.post<RouteRegistrySaveResponse>('/backend/navigation-api/sync-menu-save', {
      section,
      items,
    })

    if (data.status !== 'success') {
      throw new Error(data.message || 'Gagal menyinkronkan menu.')
    }

    return data
  },
}
