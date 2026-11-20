<script setup lang="ts">
import { computed } from "vue"
import PosIcon from "./PosIcon.vue"

const props = withDefaults(defineProps<{
  saleNumber?: string | null
  status?: string
  processing?: boolean
  loadingHeld?: boolean
  canHold?: boolean
  canNew?: boolean
  clockTime?: string
  greeting?: string
  soundEnabled?: boolean
  cashierName?: string
}>(), { canHold: true, canNew: true, soundEnabled: true })

const emit = defineEmits<{
  newTransaction: []
  holdTransaction: []
  refresh: []
  back: []
  toggleSound: []
  toggleShortcuts: []
}>()

const statusClass = computed(() => ({
  "is-done": props.status === "Selesai",
  "is-draft": props.status === "Draft",
  "is-new": props.status !== "Selesai" && props.status !== "Draft",
}))
</script>

<template>
  <header class="pos-header">
    <div class="pos-header-brand">
      <button type="button" class="pos-icon-button" title="Kembali ke dashboard" aria-label="Kembali ke dashboard" @click="emit('back')">
        <PosIcon name="arrow-left" />
      </button>
      <span class="pos-logo" aria-hidden="true"><PosIcon name="receipt" :size="21" /></span>
      <div class="pos-header-title">
        <h1>Point of Sale</h1>
        <small>ACN Pharmacy</small>
      </div>
    </div>

    <div class="pos-header-meta">
      <div class="pos-header-trx">
        <small>Transaksi</small>
        <strong>{{ saleNumber || "Transaksi baru" }}</strong>
        <span v-if="status" class="pos-chip" :class="statusClass">{{ status }}</span>
      </div>
      <div v-if="cashierName" class="pos-header-cashier">
        <PosIcon name="user-round" />
        <small>Kasir</small>
        <strong>{{ cashierName }}</strong>
      </div>
    </div>

    <div class="pos-header-actions">
      <div v-if="clockTime" class="pos-clock">
        <strong>{{ clockTime }}</strong>
        <small v-if="greeting">{{ greeting }}</small>
      </div>
      <span class="pos-header-divider" aria-hidden="true"></span>
      <button type="button" class="pos-icon-button" title="Bantuan shortcut" aria-label="Bantuan shortcut" @click="emit('toggleShortcuts')">
        <PosIcon name="keyboard" />
      </button>
      <button type="button" class="pos-icon-button" title="Muat ulang transaksi tertahan" aria-label="Muat ulang transaksi tertahan" :disabled="loadingHeld" @click="emit('refresh')">
        <PosIcon name="refresh-cw" :class="{ 'animate-spin': loadingHeld }" />
      </button>
      <button type="button" class="pos-icon-button" :title="soundEnabled ? 'Matikan suara' : 'Aktifkan suara'" :aria-label="soundEnabled ? 'Matikan suara' : 'Aktifkan suara'" :aria-pressed="soundEnabled" @click="emit('toggleSound')">
        <PosIcon :name="soundEnabled ? 'volume-2' : 'volume-x'" />
      </button>
      <button type="button" class="pos-button pos-button-soft-secondary" :disabled="processing || !canHold" @click="emit('holdTransaction')">
        <PosIcon name="pause" :size="16" /> <span class="pos-button-label">Tahan</span><kbd>F10</kbd>
      </button>
      <button type="button" class="pos-button pos-button-primary" :disabled="processing || !canNew" @click="emit('newTransaction')">
        <PosIcon name="plus" :size="16" /> <span class="pos-button-label">Transaksi baru</span><kbd>F11</kbd>
      </button>
    </div>
  </header>
</template>
