<script setup lang="ts">
import { computed, ref, watch } from "vue"
import { formatNumber } from "../../utils/format"

const props = withDefaults(defineProps<{
  modelValue: number
  id?: string
  disabled?: boolean
  decimal?: boolean
  max?: number
  placeholder?: string
}>(), { disabled: false, decimal: false, placeholder: "0" })
const emit = defineEmits<{ "update:modelValue": [value: number] }>()

function format(value: number): string {
  if (!(value > 0)) return ""
  if (props.decimal) return String(value).replace(".", ",")
  return formatNumber(value)
}
const display = ref(format(props.modelValue))
watch(() => [props.modelValue, props.decimal] as const, ([value]) => {
  const parsed = Number(display.value.replace(/\./g, "").replace(",", ".")) || 0
  if (Math.abs(parsed - value) > 0.000001) display.value = format(value)
})
const inputMode = computed(() => props.decimal ? "decimal" : "numeric")

function onInput(event: Event): void {
  const input = event.target as HTMLInputElement
  if (props.decimal) {
    let text = input.value.replace(/[^0-9.,]/g, "").replace(/\./g, ",")
    const [whole = "", ...fraction] = text.split(",")
    text = whole.replace(/^0+(?=\d)/, "") + (text.includes(",") ? "," + fraction.join("").slice(0, 2) : "")
    let value = Number(text.replace(",", ".")) || 0
    if (props.max !== undefined && value > props.max) {
      value = props.max
      text = String(props.max).replace(".", ",")
    }
    display.value = text
    input.value = text
    emit("update:modelValue", value)
    return
  }

  const digits = input.value.replace(/\D/g, "").slice(0, 12)
  const value = Math.min(props.max ?? Number.MAX_SAFE_INTEGER, digits ? Number(digits) : 0)
  display.value = format(value)
  input.value = display.value
  emit("update:modelValue", value)
}

function onBlur(): void {
  display.value = format(props.modelValue)
}
</script>

<template>
  <input :id="id" type="text" :inputmode="inputMode" autocomplete="off" class="pos-input text-right tabular-nums" :placeholder="placeholder" :value="display" :disabled="disabled" @input="onInput" @blur="onBlur" @focus="($event.target as HTMLInputElement).select()" />
</template>
