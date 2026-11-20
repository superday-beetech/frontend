// src/modules/pharmacy/types/masterMenu.ts
import type { Component } from "vue";

// ⚠️ Sesuaikan path import dengan nama file view Anda.
// Kalau file view belum ada, komentari dulu barisnya.
import ProductView from "../views/ProductView.vue";
import CategoryView from "../views/CategoryView.vue";
import UnitView from "../views/UnitView.vue";
import SupplierView from "../views/SupplierView.vue";
// import ManufacturerView from "../views/ManufacturerView.vue";
// import RackView from "../views/RackView.vue";
import CustomerView from "../views/CustomerView.vue";
// import DoctorView from "../views/DoctorView.vue";
// import PaymentView from "../views/PaymentView.vue";

export interface MasterMenu {
  key: string;
  label: string;
  icon: string;
  desc: string;
  component: Component;
}

export const masterMenus: MasterMenu[] = [
  { key: "product", label: "Product", icon: "ti-pill", desc: "Data obat dan barang yang dijual", component: ProductView },
  { key: "category", label: "Category", icon: "ti-category", desc: "Golongan obat dan barang", component: CategoryView },
  { key: "unit", label: "Unit", icon: "ti-ruler", desc: "Satuan obat dan barang", component: UnitView },
  { key: "supplier", label: "Supplier", icon: "ti-truck", desc: "Data pemasok barang", component: SupplierView },
  //   { key: "manufacturer", label: "Manufacturer", icon: "ti-building-factory", desc: "Data pabrik obat", component: ManufacturerView },
  //   { key: "rack", label: "Rack", icon: "ti-layout-grid", desc: "Lokasi penyimpanan barang", component: RackView },
  { key: "customer", label: "Customer", icon: "ti-user", desc: "Data pelanggan", component: CustomerView },
  //   { key: "doctor", label: "Doctor", icon: "ti-stethoscope", desc: "Data dokter", component: DoctorView },
  //   { key: "payment", label: "Payment Method", icon: "ti-credit-card", desc: "Metode pembayaran", component: PaymentView },
];

/** Fallback default kalau URL tidak punya :key */
export const DEFAULT_MASTER_KEY = "product";
