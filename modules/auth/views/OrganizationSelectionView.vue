<script setup lang="ts">
import { useOrganizationSelection } from '../mocks/useOrganizationSelection'

import { Building2, Check, Network, LoaderCircle, AlertCircle } from 'lucide-vue-next'

const props = defineProps<{
  onSelected?: () => void
}>()

const { organizationStore, activeOrganizationId, selectOrganization, initialize } = useOrganizationSelection(() => props.onSelected?.())
</script>

<template>
  <!-- LOADING STATE -->
  <div v-if="organizationStore.loading" class="flex flex-col items-center justify-center py-16">
    <LoaderCircle class="size-8 animate-spin text-primary-600" />
    <p class="mt-3 text-sm text-slate-500 dark:text-slate-400">Memuat daftar Ruang Kerja...</p>
  </div>

  <!-- ERROR STATE -->
  <div
    v-else-if="organizationStore.errorMessage"
    class="flex items-center justify-between gap-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-200"
  >
    <div class="flex items-center gap-2">
      <AlertCircle class="size-5 shrink-0" />
      <span>{{ organizationStore.errorMessage }}</span>
    </div>
    <button
      type="button"
      class="shrink-0 rounded-lg border border-rose-300 px-3 py-1.5 text-xs font-semibold text-rose-700 transition-colors hover:bg-rose-100 dark:border-rose-800 dark:text-rose-300 dark:hover:bg-rose-900/50"
      @click="initialize(true)"
    >
      Coba Lagi
    </button>
  </div>

  <!-- EMPTY STATE -->
  <div
    v-else-if="!organizationStore.hasOrganizations"
    class="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900"
  >
    <Building2 class="mx-auto size-12 text-slate-300 dark:text-slate-600" />
    <h5 class="mt-4 text-lg font-semibold text-slate-800 dark:text-slate-100">Belum Ada Workspace</h5>
    <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">Akun Anda belum memiliki membership Workspace yang aktif.</p>
  </div>

  <!-- ORGANIZATIONS LIST -->
  <div v-else class="grid grid-cols-1 gap-4 md:grid-cols-2">
    <div
      v-for="org in organizationStore.availableOrganizations"
      :key="org.organization_id"
      class="flex h-full flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition-all hover:shadow-md dark:bg-slate-900"
      :class="
        org.organization_id === activeOrganizationId
          ? 'border-emerald-400 ring-1 ring-emerald-400/20 dark:border-emerald-600'
          : 'border-slate-200 dark:border-slate-800'
      "
    >
      <div class="flex-1 p-5">
        <div class="flex items-start gap-4">
          <!-- ICON -->
          <div class="rounded-xl bg-sky-50 p-3 text-sky-600 dark:bg-sky-950/50 dark:text-sky-400">
            <Building2 class="size-7" />
          </div>

          <div class="min-w-0 flex-1">
            <!-- NAME & ACTIVE BADGE -->
            <div class="flex items-start justify-between gap-2">
              <h5 class="truncate text-base font-semibold text-slate-800 dark:text-slate-100">
                {{ org.organization_name }}
              </h5>
              <span
                v-if="org.organization_id === activeOrganizationId"
                class="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"
              >
                <Check class="size-3" />
                Aktif
              </span>
            </div>

            <!-- CODE -->
            <div class="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              {{ org.organization_code }}
            </div>

            <!-- MEMBERSHIP -->
            <div class="mt-3 flex flex-wrap items-center gap-1.5">
              <span
                class="rounded-full bg-primary-50 px-2.5 py-0.5 text-[10px] font-semibold text-primary-700 dark:bg-primary-950/50 dark:text-primary-400"
              >
                {{ org.membership_role }}
              </span>
              <span
                v-if="org.is_default"
                class="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400"
              >
                Default
              </span>
            </div>

            <!-- UNIT -->
            <div v-if="org.unit_name" class="mt-3 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <Network class="size-3.5 shrink-0" />
              <span class="truncate">{{ org.unit_name }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ACTION BUTTON -->
      <div class="border-t border-slate-100 p-3 dark:border-slate-800">
        <button
          type="button"
          class="flex w-full items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50"
          :class="
            org.organization_id === activeOrganizationId
              ? 'border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-400'
              : 'bg-primary-600 text-white hover:bg-primary-700'
          "
          :disabled="organizationStore.switching || org.organization_id === activeOrganizationId"
          @click="selectOrganization(org.organization_id)"
        >
          <Check v-if="org.organization_id === activeOrganizationId" class="size-4" />
          {{ org.organization_id === activeOrganizationId ? 'Workspace Aktif' : 'Gunakan Workspace Ini' }}
        </button>
      </div>
    </div>
  </div>
</template>
