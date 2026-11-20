<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { User, KeyRound, Settings, LogOut, ChevronDown } from 'lucide-vue-next'
import { useAuthStore } from '@/modules/auth'
import { useConfirm } from '@/shared/composables/useConfirm'

const auth = useAuthStore()
const router = useRouter()
const { confirm } = useConfirm()

const isOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)

async function handleLogout() {
  isOpen.value = false

  const ok = await confirm({
    title: 'Keluar dari Aplikasi?',
    message: 'Sesi Anda saat ini akan diakhiri.',
    confirmText: 'Ya, Keluar',
    variant: 'primary',
  })

  if (ok) {
    await auth.logout()
    router.push({ name: 'Login' })
  }
}

function handleClickOutside(e: MouseEvent) {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target as Node)) {
    isOpen.value = false
  }
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onUnmounted(() => document.removeEventListener('click', handleClickOutside))
</script>

<template>
  <div ref="dropdownRef" class="relative">
    <button
      type="button"
      @click="isOpen = !isOpen"
      class="flex items-center gap-2.5 rounded-xl border border-transparent px-2 py-1.5 hover:border-slate-200 hover:bg-slate-50 transition-all cursor-pointer"
    >
      <div class="flex h-8 w-8 items-center justify-center rounded-full bg-primary-600 text-xs font-bold text-white">
        {{ auth.user?.username?.charAt(0).toUpperCase() || 'A' }}
      </div>

      <div class="hidden md:block text-left leading-tight">
        <div class="text-xs font-semibold text-slate-800">
          {{ auth.user?.username || 'Administrator' }}
        </div>
        <div class="text-[11px] text-slate-400">
          {{ auth.isSuperadmin ? 'Super Admin' : 'Pengguna' }}
        </div>
      </div>

      <ChevronDown class="hidden md:block w-3.5 h-3.5 text-slate-400" />
    </button>

    <div v-if="isOpen" class="absolute right-0 mt-2 w-60 rounded-2xl border border-slate-200 bg-white shadow-xl z-40 overflow-hidden">
      <div class="border-b border-slate-100 bg-slate-50/60 px-4 py-3">
        <div class="text-xs font-bold text-slate-800">
          {{ auth.user?.username || 'Administrator' }}
        </div>
        <div class="text-[11px] text-slate-500 truncate">
          {{ auth.user?.email }}
        </div>
      </div>

      <div class="p-1.5 space-y-0.5 text-xs">
        <button
          type="button"
          @click="isOpen = false"
          class="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-100 cursor-pointer"
        >
          <User class="w-4 h-4 text-slate-400" />
          <span>Profil Saya</span>
        </button>

        <button
          type="button"
          @click="isOpen = false"
          class="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-100 cursor-pointer"
        >
          <KeyRound class="w-4 h-4 text-slate-400" />
          <span>Ganti Password</span>
        </button>

        <button
          type="button"
          @click="isOpen = false"
          class="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-100 cursor-pointer"
        >
          <Settings class="w-4 h-4 text-slate-400" />
          <span>Preferensi Akun</span>
        </button>
      </div>

      <div class="border-t border-slate-100 p-1.5">
        <button
          type="button"
          @click="handleLogout"
          class="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 cursor-pointer"
        >
          <LogOut class="w-4 h-4" />
          <span>Keluar Aplikasi</span>
        </button>
      </div>
    </div>
  </div>
</template>
