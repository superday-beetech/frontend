<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Package, Image as ImageIcon, Info, Boxes } from 'lucide-vue-next'

import productService, { type Product, type ProductAttributes } from '../services/productService'

const props = defineProps<{
  product: Product
}>()

const emit = defineEmits<{
  select: [value: Product]
  close: []
}>()

const activeTab = ref<'product' | 'attributes'>('product')
const attrs = ref<ProductAttributes>({})
const attrsLoading = ref(false)

function formatCurrency(value: number | string): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 2,
  }).format(Number(value || 0))
}

const units = computed(() => (props.product.units ?? [])
  .filter((unit) => Number(unit.is_active) === 1)
  .map((unit) => {
    const price = (props.product.prices ?? [])
      .filter((item) => Number(item.unit_id) === Number(unit.unit_id)
        && item.customer_type == null
        && Number(item.min_qty) === 1
        && Number(item.is_active ?? 1) === 1)
      .sort((a, b) => String(b.valid_from ?? '').localeCompare(String(a.valid_from ?? '')))[0]

    return {
      ...unit,
      title: unit.unit_name ?? '-',
      value_num: Number(unit.conversion_factor),
      value_num_2: price?.price ?? null,
      value_json: unit.barcode ? { barcode: unit.barcode } : null,
      is_primary: Number(unit.is_base),
    }
  }))
const images = computed(() => attrs.value.image ?? [])
const infos = computed(() => attrs.value.info ?? [])
const hasAnyAttribute = computed(() => units.value.length > 0 || images.value.length > 0 || infos.value.length > 0)

const infoGroups = computed(() => {
  const groups: Record<string, Array<{ id: number; title: string | null; content: string; severity: string | null }>> = {}
  for (const item of infos.value) {
    const key = item.attr_group || 'lainnya'
    if (!groups[key]) groups[key] = []
    groups[key].push({
      id: item.id,
      title: item.title,
      content: item.content,
      severity: item.severity,
    })
  }
  return groups
})

function infoGroupLabel(group: string): string {
  const map: Record<string, string> = {
    indication: 'Indikasi',
    dosage_rule: 'Aturan Pakai',
    side_effect: 'Efek Samping',
    contraindication: 'Kontraindikasi',
    warning: 'Peringatan',
    storage: 'Penyimpanan',
  }
  return map[group] ?? group
}

function severityClass(sev: string | null): string {
  if (!sev) return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
  const s = sev.toLowerCase()
  if (['severe', 'major', 'absolute', 'class_i'].includes(s)) {
    return 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
  }
  if (['moderate', 'class_ii'].includes(s)) {
    return 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
  }
  return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
}

async function loadAttributes(): Promise<void> {
  attrsLoading.value = true
  try {
    const res = await productService.getAttributes(props.product.id)
    if (res.error || !res.data) {
      attrs.value = {}
      return
    }
    attrs.value = res.data
  } catch {
    attrs.value = {}
  } finally {
    attrsLoading.value = false
  }
}

watch(
  () => props.product,
  async (product) => {
    activeTab.value = 'product'
    if (product?.id) await loadAttributes()
  },
  { immediate: true },
)

const labelClass = 'mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400'
const valueClass = 'text-sm text-slate-800 dark:text-slate-100'
</script>

<template>
  <div v-if="product" class="w-full">
    <!-- Tabs -->
    <div class="flex border-b border-slate-200 dark:border-slate-800 mb-5">
      <button
        type="button"
        class="flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px"
        :class="
          activeTab === 'product'
            ? 'border-primary-600 text-primary-600 dark:text-primary-400'
            : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
        "
        @click="activeTab = 'product'"
      >
        <Package class="w-4 h-4" />
        Produk
      </button>
      <button
        type="button"
        class="flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px"
        :class="
          activeTab === 'attributes'
            ? 'border-primary-600 text-primary-600 dark:text-primary-400'
            : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
        "
        @click="activeTab = 'attributes'"
      >
        <Boxes class="w-4 h-4" />
        Satuan & Info
      </button>
    </div>

    <!-- ══════════ Tab: Produk ══════════ -->
    <div v-show="activeTab === 'product'">
      <div class="mb-4">
        <div :class="labelClass">Nama Produk</div>
        <div class="text-lg font-semibold text-slate-900 dark:text-white">{{ product.name }}</div>
        <div v-if="product.description" class="mt-1 text-sm text-slate-500">
          {{ product.description }}
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <div :class="labelClass">SKU</div>
          <code class="rounded bg-slate-100 px-2 py-1 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            {{ product.sku || '-' }}
          </code>
        </div>

        <div>
          <div :class="labelClass">Barcode</div>
          <code v-if="product.barcode" class="rounded bg-slate-100 px-2 py-1 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            {{ product.barcode }}
          </code>
          <span v-else class="text-sm text-slate-500">-</span>
        </div>

        <div>
          <div :class="labelClass">Kategori</div>
          <div :class="valueClass">{{ product.category_name || '-' }}</div>
        </div>

        <div>
          <div :class="labelClass">Satuan Dasar</div>
          <div :class="valueClass">
            {{ product.unit_name || '-' }}
            <span v-if="product.unit_abbreviation" class="text-slate-500">({{ product.unit_abbreviation }})</span>
          </div>
        </div>

        <div>
          <div :class="labelClass">Harga Beli</div>
          <div class="text-sm font-semibold text-slate-900 dark:text-white">
            {{ formatCurrency(product.purchase_price) }}
          </div>
        </div>

        <div>
          <div :class="labelClass">Harga Jual</div>
          <div class="text-sm font-semibold text-primary-600">
            {{ formatCurrency(product.selling_price) }}
          </div>
        </div>

        <div>
          <div :class="labelClass">Status</div>
          <span
            class="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium"
            :class="
              Number(product.is_active) === 1
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
            "
          >
            {{ Number(product.is_active) === 1 ? 'Aktif' : 'Tidak Aktif' }}
          </span>
        </div>

        <div>
          <div :class="labelClass">Dibuat</div>
          <div class="text-sm text-slate-500">{{ product.created_at || '-' }}</div>
        </div>

        <div>
          <div :class="labelClass">Diperbarui</div>
          <div class="text-sm text-slate-500">{{ product.updated_at || '-' }}</div>
        </div>
      </div>
    </div>

    <!-- ══════════ Tab: Satuan & Info (dari product_attributes) ══════════ -->
    <div v-show="activeTab === 'attributes'">
      <div v-if="attrsLoading" class="flex items-center justify-center gap-2 py-8 text-sm text-slate-500">
        <span class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-primary-600 border-r-transparent"></span>
        Memuat atribut...
      </div>

      <div
        v-else-if="!hasAnyAttribute"
        class="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-900/20 dark:text-amber-400"
      >
        Belum ada satuan, foto, atau info tambahan untuk produk ini.
      </div>

      <div v-else class="space-y-6">
        <!-- ══ Satuan ══ -->
        <section v-if="units.length">
          <h3 class="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
            <Boxes class="w-4 h-4 text-primary-600" />
            Satuan
          </h3>

          <div class="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
            <table class="w-full text-left text-sm">
              <thead class="bg-slate-50 text-xs font-semibold uppercase text-slate-600 dark:bg-slate-800/50 dark:text-slate-400">
                <tr>
                  <th class="px-3 py-2">Satuan</th>
                  <th class="px-3 py-2 text-right">Konversi</th>
                  <th class="px-3 py-2 text-right">Harga</th>
                  <th class="px-3 py-2">Barcode</th>
                  <th class="px-3 py-2 text-center">Utama</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                <tr v-for="u in units" :key="u.id" class="text-slate-700 dark:text-slate-300">
                  <td class="px-3 py-2 font-medium capitalize">{{ u.title }}</td>
                  <td class="px-3 py-2 text-right">{{ Number(u.value_num) }}</td>
                  <td class="px-3 py-2 text-right">
                    <template v-if="u.value_num_2 != null">{{ formatCurrency(u.value_num_2) }}</template>
                    <span v-else class="text-slate-400">-</span>
                  </td>
                  <td class="px-3 py-2">
                    <code v-if="u.value_json?.barcode" class="rounded bg-slate-100 px-1.5 py-0.5 text-xs dark:bg-slate-800">
                      {{ u.value_json.barcode }}
                    </code>
                    <span v-else class="text-slate-400">-</span>
                  </td>
                  <td class="px-3 py-2 text-center">
                    <span
                      v-if="Number(u.is_primary) === 1"
                      class="inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                    >
                      Ya
                    </span>
                    <span v-else class="text-slate-400">-</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- ══ Foto ══ -->
        <section v-if="images.length">
          <h3 class="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
            <ImageIcon class="w-4 h-4 text-primary-600" />
            Foto Produk
          </h3>

          <div class="flex flex-wrap gap-3">
            <div v-for="img in images" :key="img.id" class="relative">
              <img
                :src="img.value_json?.url"
                alt="Foto produk"
                class="h-28 w-28 rounded-lg border border-slate-200 object-cover dark:border-slate-700"
              />
              <span
                v-if="Number(img.is_primary) === 1"
                class="absolute left-1 top-1 rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-medium text-white"
              >
                Utama
              </span>
            </div>
          </div>
        </section>

        <!-- ══ Info ══ -->
        <section v-if="infos.length">
          <h3 class="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
            <Info class="w-4 h-4 text-primary-600" />
            Informasi Tambahan
          </h3>

          <div class="space-y-4">
            <div v-for="(items, group) in infoGroups" :key="group" class="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
              <div class="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {{ infoGroupLabel(String(group)) }}
              </div>

              <ul class="space-y-2">
                <li v-for="item in items" :key="item.id" class="text-sm text-slate-700 dark:text-slate-300">
                  <div class="flex flex-wrap items-start gap-2">
                    <span v-if="item.title" class="font-medium">{{ item.title }}:</span>
                    <span class="flex-1">{{ item.content }}</span>
                    <span
                      v-if="item.severity"
                      class="inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium"
                      :class="severityClass(item.severity)"
                    >
                      {{ item.severity }}
                    </span>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>

    <!-- Footer -->
    <div
      class="mt-6 flex flex-col-reverse items-center justify-between gap-3 border-t border-slate-100 pt-4 dark:border-slate-800 sm:flex-row"
    >
      <div class="text-xs text-slate-500">
        ID Produk:
        <strong>{{ product.id }}</strong>
      </div>

      <div class="flex w-full gap-2 sm:w-auto">
        <button
          type="button"
          class="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 sm:flex-none"
          @click="emit('close')"
        >
          Tutup
        </button>
        <button
          type="button"
          class="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-700 sm:flex-none"
          @click="emit('select', product)"
        >
          Ubah Produk
        </button>
      </div>
    </div>
  </div>
</template>
