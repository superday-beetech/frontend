<script setup lang="ts">
import { reactive } from 'vue'
import InlineCurrency from './InlineCurrency.vue'
import InlineQty from './InlineQty.vue'

const items = reactive([{ id: 1, nama: 'Amoxicillin 500mg (Tablet)', harga: 2000, qty: 1, disc: 0 }])
</script>

<template>
  <tr v-for="(item, i) in items" :key="item.id" class="border-t border-slate-100">
    <td class="p-2 text-slate-400 text-sm">{{ i + 1 }}</td>
    <td class="p-2 text-sm font-medium">{{ item.nama }}</td>
    <td class="p-2">
      <InlineCurrency v-model="item.harga" prefix="Rp" />
    </td>
    <td class="p-2">
      <InlineQty v-model="item.qty" :min="1" :max="999" />
    </td>
    <td class="p-2">
      <InlineCurrency v-model="item.disc" prefix="%" />
    </td>
    <td class="p-2 text-right text-sm font-bold tabular-nums">
      Rp {{ new Intl.NumberFormat('id-ID').format(item.harga * item.qty - item.disc) }}
    </td>
  </tr>
</template>
