<template>
  <footer class="border-t border-slate-200 bg-white px-5 py-3 text-xs text-slate-500">
    <div class="flex flex-col sm:flex-row items-center justify-between gap-2">
      <div>
        &copy; {{ new Date().getFullYear() }}
        <span class="font-semibold text-slate-700">PT Adi Cakra Nata</span>
        . All rights reserved.
      </div>
      <div class="flex items-center gap-4 text-[11px] text-slate-400">
        <span>Cakra Enterprise v1.0</span>
        <span>•</span>
        <span>Vue 3 + Tailwind Architecture</span>
      </div>
    </div>
  </footer>
</template>
