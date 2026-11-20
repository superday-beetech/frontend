<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { useAdminNavigation } from '../stores/navigation'
import type { NavigationMenu, MenuFormPayload, MenuPosition, MenuSection } from '../types/navigation'

// ── KOMPONEN & COMPOSABLES KUSTOM ──
import BaseInput from '@/shared/components/ui/form/BaseInput.vue'
import BaseSelect from '@/shared/components/ui/form/BaseSelect.vue'
import BaseButton from '@/shared/components/ui/primitives/BaseButton.vue'
import { useModal } from '@/shared/composables/useModal'
import { useToast } from '@/shared/composables/useToast'
import { AlertCircle } from 'lucide-vue-next'

const props = defineProps<{
  menu: NavigationMenu | null
  roles: string[]
  parent_id?: string | number | null
  parentOptions: NavigationMenu[]
  position: MenuPosition
  section: MenuSection
  onSaved?: () => void | Promise<void>
}>()

const store = useAdminNavigation()
const modalStore = useModal()
const toast = useToast()

const submitting = ref(false)
const validationError = ref('')

const form = reactive({
  id: '',
  title: '',
  url: '',
  icon: '',
  parent_id: props.menu ? props.menu.parent_id : (props.parent_id ?? ''),
  position: 'sidebar' as MenuPosition,
  section: 'backend' as MenuSection,
  is_active: true,
  groups: [] as string[],
})

const isEdit = computed(() => Boolean(form.id))

// ── Opsi ──
const positionOptions = [
  { label: 'Sidebar', value: 'sidebar' },
  { label: 'Topbar', value: 'topbar' },
  { label: 'Quick Links', value: 'quick_links' },
  { label: 'Apps', value: 'apps' },
  { label: 'Down', value: 'down' },
]

const sectionOptions = [
  { label: 'Backend', value: 'backend' },
  { label: 'Frontend', value: 'frontend' },
]

// ── Hierarki Parent Options ──
const availableParents = computed(() => {
  const items = props.parentOptions.filter((item) => item.id !== form.id)
  const childrenMap = new Map<string, NavigationMenu[]>()
  items.forEach((item) => {
    const parentId = item.parent_id && item.parent_id !== '0' ? item.parent_id : 'root'
    const list = childrenMap.get(parentId) || []
    list.push(item)
    childrenMap.set(parentId, list)
  })
  childrenMap.forEach((list) => list.sort((a, b) => Number(a.sequence ?? 0) - Number(b.sequence ?? 0)))

  const hierarchicalList: { item: NavigationMenu; level: number }[] = []
  function flattenTree(parentId: string, level: number) {
    const children = childrenMap.get(parentId) || []
    children.forEach((child) => {
      hierarchicalList.push({ item: child, level })
      flattenTree(child.id, level + 1)
    })
  }
  flattenTree('root', 0)
  items.forEach((item) => {
    if (!hierarchicalList.some((h) => h.item.id === item.id)) hierarchicalList.push({ item, level: 0 })
  })
  return hierarchicalList
})

const parentSelectOptions = computed(() => [
  { label: 'Menu Utama', value: '' },
  ...availableParents.value.map(({ item, level }) => ({
    label: `${level > 0 ? '— '.repeat(level) : ''}${item.title}`,
    value: item.id,
  })),
])

// ── Form Logic ──
function resetForm() {
  form.id = ''
  form.title = ''
  form.url = ''
  form.icon = ''
  form.parent_id = props.parent_id ?? ''
  form.position = props.position
  form.section = props.section
  form.is_active = true
  form.groups = []
  validationError.value = ''
}

function populateForm(menu: NavigationMenu | null) {
  resetForm()
  if (!menu) {
    form.parent_id = props.parent_id ?? ''
    return
  }
  form.id = menu.id
  form.title = menu.title
  form.url = menu.url
  form.icon = menu.icon
  form.parent_id = menu.parent_id === '0' ? '' : menu.parent_id
  form.position = menu.position
  form.section = menu.section
  form.is_active = menu.is_active === '1'
  form.groups = [...(menu.selected_groups ?? [])]
}

watch(
  () => props.parent_id,
  (newVal) => {
    if (!props.menu) form.parent_id = newVal ?? ''
  }
)
watch(
  () => props.menu,
  (menu) => populateForm(menu),
  { immediate: true }
)

function validate(): boolean {
  validationError.value = ''
  if (!form.title.trim()) {
    validationError.value = 'Judul menu wajib diisi.'
    return false
  }
  if (form.id && form.parent_id === form.id) {
    validationError.value = 'Menu tidak dapat menjadi parent untuk dirinya sendiri.'
    return false
  }
  return true
}

async function submit() {
  if (!validate() || submitting.value) return
  submitting.value = true

  try {
    const payload: MenuFormPayload = {
      id: form.id || undefined,
      title: form.title.trim(),
      url: form.url.trim(),
      icon: form.icon.trim(),
      parent_id: form.parent_id ? String(form.parent_id) : '0',
      position: form.position,
      section: form.section,
      is_active: form.is_active,
      groups: [...form.groups],
    }
    await store.saveMenu(payload)
    toast.success(isEdit.value ? 'Menu berhasil diperbarui.' : 'Menu berhasil ditambahkan.')
    await props.onSaved?.()
    modalStore.close()
  } catch (error) {
    toast.error(error instanceof Error ? error.message : 'Gagal menyimpan menu.')
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <form class="space-y-4" @submit.prevent="submit">
    <!-- Judul -->
    <BaseInput v-model="form.title" label="Judul Menu" placeholder="Contoh: Dashboard" required />

    <!-- URL -->
    <BaseInput v-model="form.url" label="URL" placeholder="/backend/dashboard" />

    <!-- Icon -->
    <BaseInput v-model="form.icon" label="Icon" placeholder="ti ti-home">
      <template #hint>
        <p class="mt-1 text-xs text-slate-400">Gunakan class ikon yang tersedia pada theme.</p>
      </template>
    </BaseInput>

    <!-- Parent -->
    <BaseSelect v-model="form.parent_id" :options="parentSelectOptions" label="Parent Menu" placeholder="Pilih Parent" />

    <!-- Posisi & Section -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <BaseSelect v-model="form.position" :options="positionOptions" label="Posisi" />
      <BaseSelect v-model="form.section" :options="sectionOptions" label="Section" />
    </div>

    <!-- Hak Akses Group -->

    <div>
      <div class="mb-2.5 flex items-center justify-between">
        <label class="text-xs font-semibold tracking-wide text-slate-700 dark:text-slate-300">Hak Akses Group</label>
        <span
          v-if="form.groups.length"
          class="rounded-full bg-primary-50 px-2 py-0.5 text-[10px] font-semibold text-primary-700 dark:bg-primary-500/10 dark:text-primary-400"
        >
          {{ form.groups.length }} dipilih
        </span>
      </div>

      <div
        v-if="roles.length === 0"
        class="rounded-xl border border-dashed border-slate-300 bg-slate-50/70 px-4 py-5 text-center dark:border-slate-700 dark:bg-slate-800/40"
      >
        <p class="text-xs text-slate-400">Belum ada group tersedia.</p>
      </div>

      <div v-else class="grid grid-cols-2 gap-2.5">
        <label
          v-for="role in roles"
          :key="role"
          class="group relative flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-all duration-200"
          :class="
            form.groups.includes(role)
              ? 'border-primary-500 bg-primary-50/70 shadow-sm shadow-primary-500/5 dark:border-primary-500/70 dark:bg-primary-500/10'
              : 'border-slate-200 bg-white hover:border-primary-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50 dark:hover:border-primary-500/50 dark:hover:bg-slate-800'
          "
        >
          <input v-model="form.groups" type="checkbox" :value="role" class="peer sr-only" />

          <span
            class="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-all duration-200 peer-focus-visible:ring-2 peer-focus-visible:ring-primary-500/30 peer-focus-visible:ring-offset-2"
            :class="
              form.groups.includes(role)
                ? 'border-primary-600 bg-primary-600 text-white'
                : 'border-slate-300 bg-white text-transparent group-hover:border-primary-400 dark:border-slate-600 dark:bg-slate-900'
            "
          >
            <svg
              viewBox="0 0 20 20"
              fill="none"
              class="h-3.5 w-3.5 transition-transform duration-200"
              :class="form.groups.includes(role) ? 'scale-100' : 'scale-50'"
            >
              <path d="M4.5 10.5L8 14L15.5 6.5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </span>

          <span
            class="min-w-0 truncate text-xs font-semibold transition-colors"
            :class="form.groups.includes(role) ? 'text-primary-700 dark:text-primary-300' : 'text-slate-600 dark:text-slate-300'"
          >
            {{ role }}
          </span>

          <span v-if="form.groups.includes(role)" class="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-primary-500" />
        </label>
      </div>
    </div>

    <!-- Toggle Aktif -->
    <div class="flex items-center gap-3 rounded-xl border border-slate-200 p-3 dark:border-slate-700">
      <button
        type="button"
        role="switch"
        :aria-checked="form.is_active"
        class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        :class="form.is_active ? 'bg-primary-600' : 'bg-slate-300 dark:bg-slate-600'"
        @click="form.is_active = !form.is_active"
      >
        <span
          class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
          :class="form.is_active ? 'translate-x-5' : 'translate-x-0'"
        ></span>
      </button>
      <span class="text-sm font-medium text-slate-700 dark:text-slate-300">Menu Aktif</span>
    </div>

    <!-- Error Validasi -->
    <div
      v-if="validationError"
      class="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 dark:border-rose-900/50 dark:bg-rose-900/20"
    >
      <AlertCircle class="h-4 w-4 text-rose-500 mt-0.5 shrink-0" />
      <p class="text-xs font-medium text-rose-700 dark:text-rose-300">{{ validationError }}</p>
    </div>

    <!-- Footer -->
    <div class="flex justify-end gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
      <BaseButton variant="secondary" type="button" :disabled="submitting" @click="modalStore.close()">Batal</BaseButton>
      <BaseButton variant="primary" type="submit" :loading="submitting">
        {{ submitting ? 'Menyimpan...' : 'Simpan Menu' }}
      </BaseButton>
    </div>
  </form>
</template>
