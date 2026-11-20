<script setup lang="ts">
import { useModal } from '@/shared/composables/useModal'
import BaseModal from './BaseModal.vue'

const { state, close, handleSelect } = useModal()
</script>

<template>
  <BaseModal :open="state.open" :title="state.title" :max-width="state.maxWidth" @close="close()">
    <!-- :centered="state.centered"
    :scrollable="state.scrollable" -->
    <component :is="state.component" v-if="state.component" v-bind="state.props" @select="handleSelect" @close="close()" />
  </BaseModal>
</template>
