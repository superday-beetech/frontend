<script setup lang="ts">
import { reactive } from "vue"
import { useToast } from "@/shared/composables/useToast"

const emit = defineEmits<{ close: [] }>()
const toast = useToast()
const KEY = "pos.printer"

function load(): Record<string, unknown> {
  try { return JSON.parse(localStorage.getItem(KEY) ?? "{}") }
  catch { return {} }
}
const form = reactive({ paperWidth: "80", autoPrint: true, copies: 1, ...load() })
function save(): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(form))
    toast.success("Pengaturan printer disimpan.")
    emit("close")
  } catch {
    toast.error("Gagal menyimpan pengaturan printer.")
  }
}
</script>

<template>
  <form class="flex flex-col gap-4" @submit.prevent="save">
    <div class="space-y-1.5">
      <label class="pos-label" for="pos-paper">Lebar kertas</label>
      <select id="pos-paper" v-model="form.paperWidth" class="pos-select">
        <option value="58">58 mm</option><option value="80">80 mm</option>
      </select>
    </div>
    <label class="flex items-center gap-3 rounded-xl border border-slate-200 p-3 text-sm text-slate-700 dark:border-slate-700 dark:text-slate-200">
      <input id="pos-autoprint" v-model="form.autoPrint" type="checkbox" class="pos-checkbox" />
      <span>Cetak struk otomatis setelah transaksi selesai</span>
    </label>
    <div class="space-y-1.5">
      <label class="pos-label" for="pos-copies">Jumlah salinan</label>
      <input id="pos-copies" v-model.number="form.copies" type="number" min="1" max="5" class="pos-input" />
    </div>
    <button type="submit" class="pos-button pos-button-primary w-full">Simpan</button>
  </form>
</template>
