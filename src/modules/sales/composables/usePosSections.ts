import { shallowRef } from "vue";

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

  function setBarcodeSection(target: PosFocusTarget): void { barcodeSection.value = target; }
  function setCustomerSection(target: PosFocusTarget): void { customerSection.value = target; }
  function setCartSection(target: PosFocusTarget): void { cartSection.value = target; }
  function setDiscountSection(target: PosFocusTarget): void { discountSection.value = target; }
  function setChargesSection(target: PosFocusTarget): void { chargesSection.value = target; }
  function setPaymentSection(target: PosFocusTarget): void { paymentSection.value = target; }
  function setPaymentInput(target: HTMLElement | null): void { paymentInput.value = target; }

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
