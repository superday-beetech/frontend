<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { masterMenus } from "../types/masterMenu";

const STORAGE_KEY = "pharmacy.master.activeKey";

// Default ke menu pertama
const activeKey = ref<string>(masterMenus[0].key);

const activeMenu = computed(() => masterMenus.find((m) => m.key === activeKey.value) ?? masterMenus[0]);

// Restore menu aktif dari sessionStorage saat mount
onMounted(() => {
  const saved = sessionStorage.getItem(STORAGE_KEY);
  if (saved && masterMenus.some((m) => m.key === saved)) {
    activeKey.value = saved;
  }
});

function select(key: string) {
  if (key === activeKey.value) return;
  activeKey.value = key;
  sessionStorage.setItem(STORAGE_KEY, key); // simpan pilihan
}
</script>

<template>
  <div class="row g-4">
    <!-- Sidebar menu -->
    <div class="col-lg-3 col-xl-2">
      <div class="card master-sidebar-card">
        <div class="card-body p-2">
          <div class="text-uppercase text-muted small fw-semibold px-3 pt-2 pb-1">Master Data</div>

          <ul class="nav nav-pills flex-column gap-1">
            <li v-for="m in masterMenus" :key="m.key" class="nav-item">
              <button type="button" class="nav-link text-start w-100 d-flex align-items-center gap-2" :class="{ active: m.key === activeKey }" :title="m.desc" @click="select(m.key)">
                <i :class="['ti', m.icon]"></i>
                <span>{{ m.label }}</span>
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Konten dinamis -->
    <div class="col-lg-9 col-xl-10">
      <component :is="activeMenu.component" :key="activeMenu.key" />
    </div>
  </div>
</template>

<style scoped>
.master-sidebar-card {
  position: sticky;
  top: 1rem;
}

.master-sidebar-card .nav-link {
  border-radius: 0.5rem;
  padding: 0.5rem 0.75rem;
}

.master-sidebar-card .nav-link i {
  font-size: 1.1rem;
  width: 1.25rem;
  text-align: center;
}
</style>
