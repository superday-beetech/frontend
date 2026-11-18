<script setup lang="ts">
import BaseToastContainer from '@/shared/components/ui/feedback/BaseToastContainer.vue'
import BaseConfirmDialog from '@/shared/components/ui/feedback/BaseConfirmDialog.vue'
import BaseModalHost from '@/shared/components/ui/overlay/BaseModalHost.vue'
</script>

<template>
  <RouterView />
  <BaseToastContainer />
  <BaseConfirmDialog />
  <BaseModalHost />
</template>
