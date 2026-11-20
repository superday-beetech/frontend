<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ChevronDown } from 'lucide-vue-next'
import type { DynamicMenu } from '@/modules/auth'
import { useLayout } from '@/app/layouts/useLayout'
// import { resolveMenuIcon } from '@/app/layouts/menu-icons'
import { getLucideIcon } from '@/shared/composables/useLucideIcon'

const props = withDefaults(
  defineProps<{
    item: DynamicMenu
    depth?: number
    mini?: boolean
  }>(),
  {
    depth: 0,
    mini: false,
  }
)

const route = useRoute()
const { closeMobileSidebar } = useLayout()

const hasChildren = computed(() => !!props.item.children?.length)

function checkDescendantActive(menu: DynamicMenu, currentPath: string): boolean {
  if (menu.path === '/' && currentPath === '/') return true
  if (menu.path !== '/' && menu.path && currentPath === menu.path) return true
  if (menu.children?.length) {
    return menu.children.some((child) => checkDescendantActive(child, currentPath))
  }
  return false
}

const isExactActive = computed(() => {
  if (props.item.path === '/') return route.path === '/'
  return route.path === props.item.path
})

const isBranchActive = computed(() => checkDescendantActive(props.item, route.path))
const isExpanded = ref(hasChildren.value && isBranchActive.value)

watch(
  () => route.path,
  () => {
    if (hasChildren.value) {
      isExpanded.value = isBranchActive.value
    }
  }
)

const iconComponent = computed(() => getLucideIcon(props.item.icon))

// KUNCI: Padding konsisten agar teks child dan parent lurus sejajar
const paddingLeftStyle = computed(() => {
  if (props.depth === 0) return '12px'
  if (props.depth === 1) return '38px' // Level 2 sejajar dengan awal teks Parent Level 1
  return '58px' // Level 3 sejajar dengan Level 2
})
</script>

<template>
  <div class="relative group/mini">
    <!-- MODE 1: SIDEBAR MINI -->
    <template v-if="mini && depth === 0">
      <RouterLink
        v-if="!hasChildren"
        :to="item.path"
        class="flex h-10 w-10 mx-auto items-center justify-center rounded-xl transition-colors"
        :class="isExactActive ? 'bg-primary-600 text-white shadow-xs' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'"
      >
        <component :is="iconComponent" class="w-4.5 h-4.5" />
      </RouterLink>

      <div
        v-else
        class="flex h-10 w-10 mx-auto items-center justify-center rounded-xl transition-colors cursor-pointer"
        :class="isBranchActive ? 'bg-primary-50 text-primary-600' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'"
      >
        <component :is="iconComponent" class="w-4.5 h-4.5" />
      </div>

      <div
        v-if="!hasChildren"
        class="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 hidden group-hover/mini:block z-50 whitespace-nowrap rounded-lg bg-slate-800 px-2.5 py-1.5 text-sm font-medium text-white shadow-lg"
      >
        {{ item.title }}
      </div>

      <div v-else class="absolute left-full top-0 pl-2 hidden group-hover/mini:block z-50">
        <div class="w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
          <div class="px-2.5 py-1.5 text-sm font-bold text-slate-800 border-b border-slate-100 mb-1">
            {{ item.title }}
          </div>
          <SidebarTreeItem v-for="child in item.children" :key="child.id" :item="child" :depth="1" :mini="false" />
        </div>
      </div>
    </template>

    <!-- MODE 2: SIDEBAR FULL -->
    <template v-else>
      <button
        v-if="hasChildren"
        type="button"
        @click="isExpanded = !isExpanded"
        class="flex w-full items-center justify-between rounded-lg py-2 pr-3 text-left text-sm transition-colors cursor-pointer"
        :class="[
          depth === 0 && isBranchActive
            ? 'bg-primary-50/70 text-primary-700 font-semibold'
            : isBranchActive
              ? 'text-slate-900 font-semibold hover:bg-slate-100'
              : 'text-slate-600 font-medium hover:bg-slate-100 hover:text-slate-900',
        ]"
        :style="{ paddingLeft: paddingLeftStyle }"
      >
        <span class="flex items-center gap-2.5 truncate">
          <component
            v-if="depth === 0 || item.icon"
            :is="iconComponent"
            class="shrink-0"
            :class="[depth === 0 ? 'w-4 h-4' : 'w-3.5 h-3.5', isBranchActive ? 'text-primary-600' : 'text-slate-400']"
          />
          <span v-else class="h-1.5 w-1.5 rounded-full shrink-0" :class="isBranchActive ? 'bg-primary-600' : 'bg-slate-300'" />
          <span class="truncate">{{ item.title }}</span>
        </span>

        <ChevronDown
          class="w-3.5 h-3.5 text-slate-400 transition-transform duration-200 shrink-0"
          :class="{ 'rotate-180 text-primary-600': isExpanded }"
        />
      </button>

      <RouterLink
        v-else
        :to="item.path"
        @click="closeMobileSidebar"
        class="flex items-center gap-2.5 rounded-lg py-2 pr-3 text-sm transition-colors"
        :class="[
          isExactActive
            ? 'bg-primary-50 text-primary-700 font-semibold'
            : 'text-slate-600 font-medium hover:bg-slate-100 hover:text-slate-900',
        ]"
        :style="{ paddingLeft: paddingLeftStyle }"
      >
        <component
          v-if="depth === 0 || item.icon"
          :is="iconComponent"
          class="shrink-0"
          :class="[depth === 0 ? 'w-4 h-4' : 'w-3.5 h-3.5', isExactActive ? 'text-primary-600' : 'text-slate-400']"
        />
        <span
          v-else
          class="h-1.5 w-1.5 rounded-full shrink-0 transition-transform"
          :class="isExactActive ? 'bg-primary-600 scale-125' : 'bg-slate-300'"
        />
        <span class="truncate">{{ item.title }}</span>
      </RouterLink>

      <div v-if="hasChildren && isExpanded" class="mt-0.5 space-y-0.5 relative">
        <span
          class="pointer-events-none absolute top-1 bottom-1 w-px bg-slate-200/80"
          :style="{ left: depth === 0 ? '19px' : depth === 1 ? '38px' : '54px' }"
        />
        <SidebarTreeItem v-for="child in item.children" :key="child.id" :item="child" :depth="depth + 1" :mini="false" />
      </div>
    </template>
  </div>
</template>
