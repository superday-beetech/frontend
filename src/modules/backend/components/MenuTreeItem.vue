<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch, nextTick } from 'vue'
import Sortable from 'sortablejs'
import type { NavigationMenu } from '../types/navigation'
import { GripVertical, Plus, Pencil, Trash2, Circle } from 'lucide-vue-next'

defineOptions({ name: 'MenuTreeItem' })

interface Props {
  items: NavigationMenu[]
  depth?: number
}

const props = withDefaults(defineProps<Props>(), { depth: 0 })

const emit = defineEmits<{
  (e: 'add', menu: NavigationMenu): void
  (e: 'edit', menu: NavigationMenu): void
  (e: 'delete', menu: NavigationMenu): void
  (e: 'treeChange'): void
}>()

const listElement = ref<HTMLElement | null>(null)
let sortableInstance: Sortable | null = null

function initSortable() {
  if (!listElement.value || sortableInstance) return

  sortableInstance = Sortable.create(listElement.value, {
    group: { name: 'navigation-menu-tree', pull: true, put: true },
    animation: 200,
    easing: 'cubic-bezier(0.2, 1, 0.1, 1)',
    handle: '.menu-drag-handle',
    draggable: '.menu-item',
    filter: '.menu-empty-hint',
    preventOnFilter: false,
    fallbackOnBody: true,
    fallbackTolerance: 4,
    swapThreshold: 0.65,
    ghostClass: 'menu-sortable-ghost',
    chosenClass: 'menu-sortable-chosen',
    dragClass: 'menu-sortable-drag',
    // ✨ FIX 7006: Tambahkan tipe eksplisit pada parameter 'evt'
    onMove(evt: Sortable.MoveEvent) {
      const draggedId = (evt.dragged as HTMLElement).dataset.menuId
      return !(evt.to as HTMLElement).closest(`[data-menu-id="${draggedId}"]`)
    },
    onEnd() {
      emit('treeChange')
    },
  })
}

onMounted(() => initSortable())

watch(
  () => props.items.length,
  async () => {
    await nextTick()
    if (!sortableInstance) initSortable()
  }
)

onBeforeUnmount(() => {
  sortableInstance?.destroy()
  sortableInstance = null
})
</script>

<template>
  <ul ref="listElement" class="menu-tree-list" :class="{ 'menu-tree-root': depth === 0 }" :data-depth="depth">
    <li v-for="menu in items" :key="menu.id" class="menu-item" :data-menu-id="menu.id">
      <div
        class="group flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-2 py-1.5 shadow-sm transition-all hover:border-primary-300 hover:bg-slate-50 hover:shadow dark:border-slate-700 dark:bg-slate-900 dark:hover:border-primary-700 dark:hover:bg-slate-800/50"
      >
        <!-- Kiri: Drag, Ikon, Info -->
        <div class="flex min-w-0 flex-1 items-center gap-2">
          <!-- Drag Handle -->
          <button
            type="button"
            class="menu-drag-handle flex h-6 w-6 shrink-0 cursor-grab items-center justify-center rounded text-slate-400 transition-colors hover:bg-slate-100 hover:text-primary-600 active:cursor-grabbing dark:hover:bg-slate-800"
            title="Geser posisi menu"
          >
            <GripVertical class="h-3.5 w-3.5" />
          </button>

          <!-- Ikon Menu -->
          <div class="flex h-6 w-6 shrink-0 items-center justify-center rounded text-xs text-slate-600 dark:text-slate-300">
            <i v-if="menu.icon" :class="menu.icon"></i>
            <Circle v-else class="h-3 w-3" />
          </div>

          <!-- Info -->
          <div class="flex min-w-0 items-center gap-2">
            <span class="truncate text-xs font-semibold text-slate-900 dark:text-white">{{ menu.title }}</span>

            <span
              v-if="menu.is_active !== '1'"
              class="shrink-0 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400"
            >
              Nonaktif
            </span>
            <span
              v-if="menu.is_divider === '1'"
              class="shrink-0 rounded bg-sky-50 px-1.5 py-0.5 text-[10px] font-medium text-sky-700 dark:bg-sky-900/30 dark:text-sky-300"
            >
              Divider
            </span>

            <!-- ✨ FIX: max-w-[280px] → max-w-70 -->
            <span class="hidden max-w-70 truncate text-[11px] text-slate-400 sm:inline" :title="menu.url || 'Tidak ada URL'">
              {{ menu.url || 'Tanpa URL' }}
            </span>
          </div>
        </div>

        <!-- Kanan: Aksi -->
        <div class="flex shrink-0 items-center gap-1">
          <span
            class="hidden rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 sm:inline dark:bg-slate-800 dark:text-slate-400"
          >
            {{ menu.children?.length ?? 0 }} submenu
          </span>
          <div class="flex items-center gap-1">
            <button
              type="button"
              class="flex h-6 w-6 items-center justify-center rounded border border-transparent text-slate-500 transition-colors hover:border-primary-300 hover:bg-primary-50 hover:text-primary-600 dark:hover:border-primary-700 dark:hover:bg-primary-900/20"
              title="Tambah Submenu"
              @click="emit('add', menu)"
            >
              <Plus class="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              class="flex h-6 w-6 items-center justify-center rounded border border-transparent text-slate-500 transition-colors hover:border-amber-300 hover:bg-amber-50 hover:text-amber-600 dark:hover:border-amber-700 dark:hover:bg-amber-900/20"
              title="Edit Menu"
              @click="emit('edit', menu)"
            >
              <Pencil class="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              class="flex h-6 w-6 items-center justify-center rounded border border-transparent text-slate-500 transition-colors hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600 dark:hover:border-rose-700 dark:hover:bg-rose-900/20"
              title="Hapus Menu"
              @click="emit('delete', menu)"
            >
              <Trash2 class="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      <!-- Recursive Sub-tree -->
      <MenuTreeItem
        :items="menu.children ?? []"
        :depth="depth + 1"
        @add="(item) => emit('add', item)"
        @edit="(item) => emit('edit', item)"
        @delete="(item) => emit('delete', item)"
        @tree-change="emit('treeChange')"
      />
    </li>
  </ul>
</template>

<style scoped>
.menu-tree-list {
  list-style: none;
  margin: 0;
  padding: 0;
  min-height: 6px;
}
.menu-tree-root {
  min-height: 26px;
}
.menu-item {
  position: relative;
}

/* Garis hierarki sub-tree */
.menu-item > .menu-tree-list {
  margin-left: 20px;
  padding-left: 16px;
  border-left: 1px dashed #cbd5e1;
}
.dark .menu-item > .menu-tree-list {
  border-left-color: #334155;
}
.menu-item > .menu-tree-list > .menu-item:first-child {
  margin-top: 4px;
}
.menu-item > .menu-tree-list > .menu-item::before {
  content: '';
  position: absolute;
  left: -14px;
  top: 18px;
  width: 14px;
  border-top: 1px dashed #cbd5e1;
}
.dark .menu-item > .menu-tree-list > .menu-item::before {
  border-top-color: #334155;
}

/* State Drag & Drop */
.menu-sortable-ghost :deep(.group) {
  opacity: 0.35;
  border: 1px dashed var(--bs-primary, #0969da);
  background: var(--bs-primary-bg-subtle, #eff6ff);
}
.menu-sortable-chosen :deep(.group) {
  border-color: var(--bs-primary, #0969da);
  box-shadow: 0 0 0 3px rgba(9, 105, 218, 0.12);
}
.menu-sortable-drag :deep(.group) {
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  transform: scale(1.01);
}
</style>
