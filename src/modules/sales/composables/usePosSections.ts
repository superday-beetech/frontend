import { shallowRef, type ComponentPublicInstance } from "vue";

import { usePosAdjustTabs, type AdjustTab } from "./usePosAdjustTabs";
import { usePosFocus, type PosFocusTarget } from "./usePosFocus";

/**
 * Semua referensi seksi di halaman POS (barcode, pelanggan, keranjang, dst.)
 * beserta aksi fokusnya. Nama ref dipasang sebagai binding `:ref` agar terhubung ke shallowRef composable.
 */
export function usePosSections() {
  const barcodeSection = shallowRef<PosFocusTarget>(null);
  const customerSection = shallowRef<PosFocusTarget>(null);
  const cartSection = shallowRef<PosFocusTarget>(null);
  const discountSection = shallowRef<PosFocusTarget>(null);
  const chargesSection = shallowRef<PosFocusTarget>(null);
  const paymentSection = shallowRef<PosFocusTarget>(null);
  const paymentInput = shallowRef<HTMLElement | null>(null);

  type TemplateRefTarget = Element | ComponentPublicInstance | null;

  function setBarcodeSection(target: TemplateRefTarget): void { barcodeSection.value = target as PosFocusTarget; }
  function setCustomerSection(target: TemplateRefTarget): void { customerSection.value = target as PosFocusTarget; }
  function setCartSection(target: TemplateRefTarget): void { cartSection.value = target as PosFocusTarget; }
  function setDiscountSection(target: TemplateRefTarget): void { discountSection.value = target as PosFocusTarget; }
  function setChargesSection(target: TemplateRefTarget): void { chargesSection.value = target as PosFocusTarget; }
  function setPaymentSection(target: TemplateRefTarget): void { paymentSection.value = target as PosFocusTarget; }
  function setPaymentInput(target: TemplateRefTarget): void {
    paymentInput.value = target instanceof HTMLElement ? target : null;
  }

  const { elementOf, focusSection, focusPaymentAmount: focusAmountIn } = usePosFocus();
  const { adjustTab, adjustTabItems, onTabKeydown, openAdjustTab: openTab } = usePosAdjustTabs({ focusSection });

  function focusBarcode(): void {
    const input = elementOf(barcodeSection.value)?.querySelector<HTMLInputElement>("input");

    input?.focus();
    input?.select();
  }

  const focusCustomer = (): void => focusSection(customerSection.value);
  const focusCart = (): void => focusSection(cartSection.value);
  const focusPayment = (): void => focusSection(paymentSection.value);
  const focusPaymentAmount = (): void => focusAmountIn(paymentInput.value);

  // Hanya tab dengan input yang perlu difokuskan; "notes" dan "held" cukup berpindah tab.
  const adjustSections: Partial<Record<AdjustTab, () => PosFocusTarget>> = {
    discount: () => discountSection.value,
    charges: () => chargesSection.value,
  };

  function openAdjustTab(tab: AdjustTab): Promise<void> {
    return openTab(tab, adjustSections[tab]?.() ?? null);
  }

  return {
    setBarcodeSection,
    setCustomerSection,
    setCartSection,
    setDiscountSection,
    setChargesSection,
    setPaymentSection,
    setPaymentInput,

    adjustTab,
    adjustTabItems,
    onTabKeydown,

    focusBarcode,
    focusCustomer,
    focusCart,
    focusPayment,
    focusPaymentAmount,
    openAdjustTab,
  };
}
