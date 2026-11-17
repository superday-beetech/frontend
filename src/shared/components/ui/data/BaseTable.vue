<script setup lang="ts" generic="T extends Record<string, any>">
export interface TableColumn {
  key: string
  label: string
  width?: string
  align?: 'left' | 'center' | 'right'
  sortable?: boolean // Pastikan baris ini ada
}

defineProps<{
  columns: TableColumn[]
  rows: T[]
  loading?: boolean
  emptyText?: string
}>()
</script>

<template>
  <div class="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs">
    <table class="w-full border-collapse text-left text-sm">
      <thead class="border-b border-slate-200 bg-slate-50/80 text-xs font-semibold uppercase tracking-wider text-slate-600">
        <tr>
          <th
            v-for="col in columns"
            :key="col.key"
            :style="{ width: col.width }"
            class="px-4 py-3"
            :class="{
              'text-center': col.align === 'center',
              'text-right': col.align === 'right',
            }"
          >
            {{ col.label }}
          </th>
        </tr>
      </thead>
      <tbody class="divide-y divide-slate-100">
        <tr v-if="loading">
          <td :colspan="columns.length" class="px-4 py-8 text-center text-slate-400">Memuat data...</td>
        </tr>
        <tr v-else-if="!rows.length">
          <td :colspan="columns.length" class="px-4 py-8 text-center text-slate-400">
            {{ emptyText || 'Tidak ada data ditemukan.' }}
          </td>
        </tr>
        <tr v-else v-for="(row, index) in rows" :key="row.id ?? index" class="hover:bg-slate-50/80 transition-colors">
          <td
            v-for="col in columns"
            :key="col.key"
            class="px-4 py-2.5 text-slate-700"
            :class="{
              'text-center': col.align === 'center',
              'text-right': col.align === 'right',
            }"
          >
            <slot :name="`cell-${col.key}`" :row="row" :value="row[col.key]">
              {{ row[col.key] }}
            </slot>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
