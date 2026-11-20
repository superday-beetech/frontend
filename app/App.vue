<script setup lang="ts">
import { onMounted } from 'vue'
import BaseToastContainer from '@/shared/components/ui/feedback/BaseToastContainer.vue'
import BaseConfirmDialog from '@/shared/components/ui/feedback/BaseConfirmDialog.vue'
import ModalHost from '@/shared/components/ui/overlay/BaseModalHost.vue'
import { useAppSettings } from '@/shared/composables/useAppSettings'

const settings = useAppSettings()

onMounted(() => {
  settings.initialize().catch((error) => {
    console.error('[App Settings] Initialization failed:', error)
  })
})
</script>

<template>
  <RouterView />
  <BaseToastContainer />
  <BaseConfirmDialog />
  <ModalHost />
</template>
