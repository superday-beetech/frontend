<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTemplateStore } from '../../stores/useTemplateStore'
import { Search, Check } from 'lucide-vue-next'

const store = useTemplateStore()
const searchQuery = ref('')

const groupedBlocks = computed(() => {
  const filtered = store.availableBlocks.filter((b) => b.label.toLowerCase().includes(searchQuery.value.toLowerCase()))
  return filtered.reduce(
    (acc, block) => {
      if (!acc[block.category]) acc[block.category] = []
      acc[block.category].push(block)
      return acc
    },
    {} as Record<string, typeof store.availableBlocks>
  )
})

function onDragStart(event: DragEvent, type: string, label: string) {
  event.dataTransfer?.setData('blockType', type)
  event.dataTransfer?.setData('blockLabel', label)
  if (event.dataTransfer) event.dataTransfer.effectAllowed = 'copy'
}
</script>

<template>
  <div class="flex h-full w-64 flex-col border-r border-slate-200 bg-white">
    <div class="flex items-center gap-2 border-b border-slate-100 p-4">
      <div class="h-4 w-4 rounded-sm bg-blue-600"></div>
      <h2 class="text-xs font-bold uppercase tracking-wider text-blue-800">Available Blocks</h2>
    </div>
    <div class="p-3">
      <div class="relative">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search blocks..."
          class="w-full rounded-md border border-slate-300 py-1.5 pl-3 pr-8 text-sm outline-none focus:border-blue-500"
        />
        <Search class="absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      </div>
    </div>
    <div class="custom-scrollbar flex-1 overflow-y-auto p-3">
      <div v-for="(blocks, category) in groupedBlocks" :key="category" class="mb-5">
        <h3 class="mb-2 text-[11px] font-bold uppercase tracking-wide text-slate-500">{{ category }}</h3>
        <div class="flex flex-col gap-1.5">
          <div
            v-for="block in blocks"
            :key="block.type"
            draggable="true"
            @dragstart="onDragStart($event, block.type, block.label)"
            class="group flex cursor-grab items-center justify-between rounded-md border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm text-slate-700 transition-colors hover:border-emerald-400 hover:bg-emerald-50"
          >
            <span>{{ block.label }}</span>
            <Check class="h-4 w-4 text-emerald-500 opacity-0 transition-opacity group-hover:opacity-100" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
