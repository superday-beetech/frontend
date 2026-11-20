<script setup lang="ts">
import { computed } from 'vue'
import { useTemplateStore } from '../../stores/useTemplateStore'

const store = useTemplateStore()
const printWidthPx = computed(() => store.paperSettings.width * 3.7795275591)
</script>

<template>
  <div id="print-area" class="bg-white text-black" :style="{ width: `${printWidthPx}px`, padding: `${store.paperSettings.padding}px` }">
    <div v-for="row in store.rows" :key="row.id" class="mb-1 flex gap-2">
      <div v-for="col in row.columns" :key="col.id" class="flex flex-1 flex-col gap-1">
        <div v-for="block in col.blocks" :key="block.id">
          <div v-if="block.type === 'logo'" class="flex justify-center">
            <img v-if="block.props.url" :src="block.props.url" class="max-h-16 object-contain" />
          </div>
          <div
            v-else-if="block.type === 'divider'"
            class="my-1 w-full"
            :style="{ borderTop: `1px ${block.props.style || 'solid'} black` }"
          ></div>
          <div v-else-if="block.type === 'spacer'" :style="{ height: `${block.props.height || 20}px` }"></div>
          <div v-else-if="block.type === 'barcode' || block.type === 'qr_code'" class="flex justify-center py-1">
            <span class="text-[10px] text-slate-400">[Barcode/QR Area]</span>
          </div>
          <div
            v-else
            class="text-[12px] leading-tight"
            :style="{ textAlign: block.props.align || 'left', fontWeight: block.props.bold ? 'bold' : 'normal' }"
          >
            <template v-if="block.type === 'company'">{{ block.props.text || 'My Store, LLC' }}</template>
            <template v-else-if="block.type === 'sale_info'">
              Sales Receipt
              <br />
              11/18/2026 03:24 AM
              <br />
              Sale ID: POS-14
            </template>
            <template v-else-if="block.type === 'items_table'">
              <div class="mt-1 flex justify-between border-b border-t border-black py-1 font-bold">
                <span>Item</span>
                <span>Price</span>
                <span>Qty</span>
                <span>Total</span>
              </div>
              <div class="flex justify-between py-0.5">
                <span>Product A</span>
                <span>$10.00</span>
                <span>1</span>
                <span>$10.00</span>
              </div>
              <div class="border-b border-black"></div>
            </template>
            <template v-else-if="block.type === 'totals'">
              <div class="flex justify-between">
                <span>Subtotal</span>
                <span>$20.00</span>
              </div>
              <div class="flex justify-between border-t border-black pt-1 font-bold">
                <span>TOTAL</span>
                <span>$22.00</span>
              </div>
            </template>
            <span v-else>{{ block.props.text || block.label }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
