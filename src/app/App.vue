<script setup lang="ts">
import BaseToastContainer from '@/shared/components/ui/feedback/BaseToastContainer.vue'
import BaseConfirmDialog from '@/shared/components/ui/feedback/BaseConfirmDialog.vue'
</script>

<template>
  <RouterView />
  <BaseToastContainer />
  <BaseConfirmDialog />
</template>
