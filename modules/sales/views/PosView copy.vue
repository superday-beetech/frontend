<script setup lang="ts">
import '../styles/pos.css'
import PosIcon from '../components/pos/PosIcon.vue'

import { ref, computed } from 'vue'

import CustomerAutocomplete from '../components/pos/posCustomerAutocomplete.vue'

import PosAdditionalCharges from '../components/pos/PosAdditionalCharges.vue'
import PosCart from '../components/pos/PosCart.vue'
import PosDiscountInput from '../components/pos/PosDiscountInput.vue'
import PosDock from '../components/pos/PosDock.vue'
import PosHeader from '../components/pos/PosHeader.vue'
import PosHeldTransactions from '../components/pos/PosHeldTransactions.vue'
import PosMenuBar from '../components/pos/PosMenuBar.vue'
import PosPanel from '../components/pos/PosPanel.vue'
import PosPayment from '../components/pos/PosPayment.vue'
import PosProductSearch from '../components/pos/PosProductSearch.vue'
import PosShortcutHelp from '../components/pos/PosShortcutHelp.vue'
import PosSummary from '../components/pos/PosSummary.vue'
import PosTaxInput from '../components/pos/PosTaxInput.vue'
import PosTotalPanel from '../components/pos/PosTotalPanel.vue'
import PosTransactionNotes from '../components/pos/PosTransactionNotes.vue'
import PosCreditBuyer from '../components/pos/PosCreditBuyer.vue'

import { usePos } from '../composables/usePos'
import { usePosAdditionalCharges } from '../composables/usePosAdditionalCharges'
import { usePosCartHandlers } from '../composables/usePosCartHandlers'
import { usePosDelight } from '../composables/usePosDelight'
import { usePosDisplay } from '../composables/usePosDisplay'
import { usePosDock, type DockEdge } from '../composables/usePosDock'
import { usePosFeedback } from '../composables/usePosFeedback'
import { usePosHost } from '../composables/usePosHost'
import { usePosKeyboard } from '../composables/usePosKeyboard'
import { usePosLifecycle } from '../composables/usePosLifecycle'
import { usePosMenuActions } from '../composables/usePosMenuActions'
import { usePosMenus } from '../composables/usePosMenus'
import { usePosNavigation } from '../composables/usePosNavigation'
import { usePosPaymentHandlers } from '../composables/usePosPaymentHandlers'
import { usePosPaymentInfo } from '../composables/usePosPaymentInfo'
import { usePosProductSearch } from '../composables/usePosProductSearch'
import { searchPosProducts } from '../services/posProductSearch'
import { usePosSections } from '../composables/usePosSections'
import { usePosSession } from '../composables/usePosSession'
import { usePosSettingsDialogs } from '../composables/usePosSettingsDialogs'
import { usePosSound } from '../composables/usePosSound'
import { usePosTransactionActions } from '../composables/usePosTransactionActions'
import { usePosTransactionAdjustments } from '../composables/usePosTransactionAdjustments'
import { usePosShortcutHelp } from '../composables/usePosShortcutHelp'
import { usePosTransactionState } from '../composables/usePosTransactionState'
import BaseCard from '@/shared/components/ui/primitives/BaseCard.vue'
import BaseTabs, { type TabItem } from '@/shared/components/ui/data/BaseTabs.vue'
defineOptions({ name: 'PosView' })

/* INFRASTRUKTUR UI */

const host = usePosHost()
const { message, errorMessage, clearMessages, showError, showSuccess } = usePosFeedback()
const { soundEnabled, play: playPosSound, toggle: togglePosSound } = usePosSound()
const { dock, toggleDock, moveDock, toggleDockVisibility } = usePosDock()
const { isFullscreen, compactHeader, syncFullscreen, toggleFullscreen, toggleCompact } = usePosDisplay({
  notifyWarning: (text) => host.notify('warning', text),
})
const paymentInfo = usePosPaymentInfo()

const { shortcutHelp, toggleShortcutHelp, setShortcutHelp } = usePosShortcutHelp()

/* SEKSI HALAMAN & FOKUS */

const {
  setBarcodeSection,
  setCustomerSection,
  setCartSection,
  setDiscountSection,
  setChargesSection,
  setPaymentSection,
  setPaymentInput,
  //   adjustTab,
  //   adjustTabItems,
  //   onTabKeydown,
  focusBarcode,
  focusCustomer,
  focusCart,
  focusPayment,
  focusPaymentAmount,
  openAdjustTab,
} = usePosSections()

/* STATE & LOGIKA TRANSAKSI */

const {
  cart,
  keyword,
  searchResults,
  selectedCustomerId,
  paymentMethod,
  paymentAmount,
  notes,

  transactionDiscountMode,
  transactionDiscountValue,
  taxMode,
  taxValue,
  additionalCharges,
  settlementMode,
  dueDate,
  paymentReferenceNumber,

  subtotal,
  itemDiscount,
  transactionDiscount,
  dpp,
  taxAmount,
  additionalChargesTotal,
  grandTotal,
  payableTotal,

  appliedAmount,
  changeAmount,
  remainingAmount,

  loadingSearch,
  processing,
  currentSale,

  isDraft,
  isPosted,
  transactionLocked,
  canPostSale,

  searchProduct,
  clearSearch,
  addProduct,
  updateQuantity,
  updateUnitPrice,
  updateItemDiscount,
  updateItemNotes,
  removeProduct,
  clearCart,
  setCustomer,
  setPaymentAmount,
  setPaymentMethod,
  setTransactionDiscount,
  setTax,
  addAdditionalCharge,
  updateAdditionalCharge,
  removeAdditionalCharge,
  setSettlementMode,
  setDueDate,
  setPaymentReferenceNumber,
  payExact,
  resetPaymentAmount,
  createDraft,
  postCurrentSale,
  checkoutCurrentSale,
  cancelCurrentSale,
  newTransaction,

  heldTransactions,
  loadingHeldTransactions,
  loadHeldTransactions,
  holdCurrentSale,
  resumeHeldTransaction,
  paymentConfirmed,
  isPaymentValid,
  dueDateError,
  setPaymentConfirmed,

  buyerName,
  buyerPhone,
  collateralNote,
  needsBuyerInfo,
} = usePos({ searchProducts: searchPosProducts })

const { hasUnsavedCart, hasUnsupportedDraftValues, saleStatus, settlementLabel } = usePosTransactionState({
  cart,
  isDraft,
  isPosted,
  additionalChargesTotal,
  settlementMode,
})

const canCheckout = computed(() => cart.value.length > 0 && isPaymentValid.value && !processing.value)

/* Sentuhan visual (jam, sapaan, kedip keranjang). Harus setelah usePos karena membaca subtotal. */
const { clockTime, greeting, cartFlash } = usePosDelight(subtotal)

/* SESI, NAVIGASI, DIALOG */

const { cashierName, cashierTitle, workspaceLabel, rememberOrganization, syncOrganization, signOut } = usePosSession({
  notifyWarning: (text) => host.notify('warning', text),
})

const { goToDashboard, openPage, openUrl, handleLogout } = usePosNavigation({
  hasUnsavedCart: () => hasUnsavedCart.value,
  signOut,
  notifyError: (text) => host.notify('error', text),
})

const { openPrinterSettings, openPosSettings, openPaymentSettings } = usePosSettingsDialogs(host)

/* HANDLER */

const { handleAddProduct, handleSearch, handleBarcodeEnter } = usePosProductSearch({
  keyword,

  getCart: () => cart.value,
  getSearchResults: () => searchResults.value,
  isTransactionLocked: () => transactionLocked.value,

  searchProduct,
  clearSearch,
  addProduct,

  clearMessages,
  showError,
  setErrorMessage: (text) => {
    errorMessage.value = text
  },

  playSound: playPosSound,
  focusBarcode,
})

const {
  handleQuantityChange,
  handlePriceChange,
  handleDiscountModeChange,
  handleDiscountChange,
  handleItemNoteChange,
  handleRemoveProduct,
  handleClearCart,
} = usePosCartHandlers({
  getCart: () => cart.value,

  updateQuantity,
  updateUnitPrice,
  updateItemDiscount,
  updateItemNotes,
  removeProduct,
  clearCart,

  showError,
})

const { handleTransactionDiscountMode, handleTransactionDiscountValue, handleTaxMode, handleTaxValue } = usePosTransactionAdjustments({
  getTransactionDiscountMode: () => transactionDiscountMode.value,
  getTransactionDiscountValue: () => transactionDiscountValue.value,
  getTaxMode: () => taxMode.value,
  getTaxValue: () => taxValue.value,

  setTransactionDiscount,
  setTax,
})

const { addCharge, updateCharge, removeCharge } = usePosAdditionalCharges({
  addAdditionalCharge,
  updateAdditionalCharge,
  removeAdditionalCharge,
  showError,
})

const {
  handleSettlementMode,
  handlePaymentAmount,
  handlePaymentMethod,
  handleDueDate,
  handleReferenceNumber,
  handleExactPayment,
  handleResetPayment,
  handlePaymentConfirmation,
} = usePosPaymentHandlers({
  getSettlementMode: () => settlementMode.value,

  setSettlementMode,
  setPaymentAmount,
  setPaymentMethod,
  setDueDate,
  setPaymentReferenceNumber,
  payExact,
  resetPaymentAmount,
  setPaymentConfirmed,
})

const { handleProcessSale, handleHoldSale, handleResumeSale, handleNewTransaction, handleRefreshHeld, handlePostSale, handleCancelDraft } =
  usePosTransactionActions({
    hasUnsupportedDraftValues: () => hasUnsupportedDraftValues.value,
    isDraft: () => isDraft.value,
    canPostSale: () => canPostSale.value,
    isPaymentValid: () => isPaymentValid.value,
    isPosted: () => isPosted.value,

    createDraft,
    checkoutCurrentSale,
    cancelCurrentSale,
    postCurrentSale,
    holdCurrentSale,
    resumeHeldTransaction,
    loadHeldTransactions,
    newTransaction,

    clearMessages,
    setErrorMessage: (text) => {
      errorMessage.value = text
    },
    showSuccess,
    showError,

    playTransactionSound: () => {
      void playPosSound('transaction')
    },

    focusBarcode,
  })

function handleCustomerChange(customerId: number | null): void {
  try {
    setCustomer(customerId)
  } catch (error) {
    showError(error)
  }
}

/* KEYBOARD, MENU, DOCK */

const { handleKeyboard, handleDenominationShortcut } = usePosKeyboard({
  hostIsOpen: () => host.isOpen(),

  isProcessing: () => processing.value,
  isPosted: () => isPosted.value,
  getSettlementMode: () => settlementMode.value,
  getPaymentMethod: () => paymentMethod.value,

  setShortcutHelp,

  focusBarcode,
  focusCustomer,
  focusCart,
  focusPayment,
  focusPaymentAmount,
  openAdjustTab,

  handleResetPayment,
  handleExactPayment,
  handlePaymentAmount,

  handleHoldSale,
  handleNewTransaction,
  handleProcessSale,
})

const { runAction } = usePosMenuActions({
  handleNewTransaction,
  handleHoldSale,
  handleProcessSale,
  handleRefreshHeld,

  focusBarcode,
  focusCustomer,
  focusCart,
  openAdjustTab,
  focusPaymentAmount,

  handleExactPayment,
  handleResetPayment,

  toggleSound: togglePosSound,
  toggleDock,
  toggleDockVisibility,
  moveDock,

  toggleShortcutHelp,
  showAbout: () => showSuccess('ACN Pharmacy · Point of Sale'),

  openPrinterSettings,
  openPosSettings,
  openPaymentSettings,

  toggleFullscreen,
  toggleCompact,
  handleLogout,

  openPage,
  openUrl,
})

const { menus, dockItems } = usePosMenus({
  dock,
  isSoundEnabled: () => soundEnabled.value,
  isFullscreen: () => isFullscreen.value,
  isCompact: () => compactHeader.value,
  cashierName: () => cashierName.value,

  settlementMode: () => settlementMode.value,
  isDraft: () => isDraft.value,
  isPosted: () => isPosted.value,
  isProcessing: () => processing.value,
})

function onDockMove(payload: { edge: DockEdge; offset: number }): void {
  moveDock(payload.edge, payload.offset)
}

// Setelah satu aksi dipilih, toolbar terlipat lagi agar tidak menghalangi.
function onDockAction(id: string): void {
  runAction(id)
  dock.open = false
}

const showTransactionNotes = ref(false)
const showAdditionalCharges = ref(false)

/* SIKLUS HIDUP */
const activeTab = ref('transaction')

const myTabs: TabItem[] = [
  { key: 'transaction', label: 'Transaksi', badge: 'F4' },
  { key: 'held', label: 'Ditahan', badge: 'F5' },
  { key: 'transday', label: 'Transaksi Harian' },
  { key: 'hello', label: 'Hello', badge: 3 }, // Badge angka
]
usePosLifecycle({
  handleKeyboard,
  handleDenominationShortcut,

  loadHeldTransactions,
  showError,
  focusBarcode,

  rememberOrganization,
  syncOrganization,
  syncFullscreen,

  hasUnsavedCart: () => hasUnsavedCart.value,
})
</script>

<template>
  <div class="pos-page">
    <!-- BASE TABS DI SINI -->
    <BaseTabs v-model="activeTab" :tabs="myTabs" class="flex-1 min-h-0">
      <template #icon="{ tab }">
        <PosIcon v-if="tab.key === 'transaction'" name="percent" :size="14" />
        <PosIcon v-else-if="tab.key === 'held'" name="plus-circle" :size="14" />
        <PosIcon v-else-if="tab.key === 'transday'" name="file-text" :size="14" />
      </template>

      <!-- KONTEN TAB -->
      <div v-show="activeTab === 'transaction'" class="h-full space-y-2">
        <PosMenuBar
          :menus="menus"
          :clock="clockTime"
          :greeting="greeting"
          :cashier="cashierName"
          :workspace="workspaceLabel"
          :user-title="cashierTitle"
          :fullscreen="isFullscreen"
          :compact="compactHeader"
          @action="runAction"
        />

        <PosHeader
          v-if="!compactHeader"
          :sale-number="currentSale?.sale_number"
          :status="saleStatus"
          :processing="processing"
          :loading-held="loadingHeldTransactions"
          :can-hold="!isPosted"
          :can-new="isPosted"
          :sound-enabled="soundEnabled"
          :clock-time="clockTime"
          :greeting="greeting"
          :cashier-name="cashierName"
          @back="goToDashboard"
          @new-transaction="handleNewTransaction"
          @hold-transaction="handleHoldSale"
          @refresh="handleRefreshHeld"
          @toggle-sound="togglePosSound"
          @toggle-shortcuts="shortcutHelp = !shortcutHelp"
        />

        <PosShortcutHelp :visible="shortcutHelp" @close="shortcutHelp = false" />
        <div v-if="message || errorMessage" class="pos-toasts">
          <div v-if="message" class="pos-alert pos-alert-success" role="status">
            <PosIcon name="circle-check" />
            <span class="min-w-0 flex-1">{{ message }}</span>
            <button type="button" class="pos-icon-button" aria-label="Tutup pesan" @click="message = ''"><PosIcon name="x" /></button>
          </div>
          <div v-if="errorMessage" class="pos-alert pos-alert-danger" role="alert">
            <PosIcon name="circle-alert" />
            <span class="min-w-0 flex-1">{{ errorMessage }}</span>
            <button type="button" class="pos-icon-button" aria-label="Tutup pesan" @click="errorMessage = ''"><PosIcon name="x" /></button>
          </div>
        </div>

        <main class="pos-main">
          <section class="pos-left">
            <div v-if="isPosted" class="pos-card pos-posted">
              <PosIcon name="circle-check" class="text-emerald-600" :size="22" />
              <div>
                <strong>Transaksi berhasil diselesaikan</strong>
                <small>{{ currentSale?.sale_number }}</small>
              </div>
              <button type="button" class="pos-button pos-button-primary pos-button-sm" @click="handleNewTransaction">
                <PosIcon name="plus" :size="15" />
                Transaksi baru
              </button>
            </div>

            <div class="shrink-0 flex flex-col gap-2">
              <PosProductSearch
                :ref="setBarcodeSection"
                v-model:keyword="keyword"
                :results="searchResults"
                :loading="loadingSearch"
                :disabled="transactionLocked || processing"
                @search="handleSearch"
                @enter="handleBarcodeEnter"
                @select="handleAddProduct"
              />
            </div>

            <PosCart
              :ref="setCartSection"
              class="pos-cart"
              :class="{ 'is-flash': cartFlash }"
              :items="cart"
              :subtotal="subtotal"
              :disabled="transactionLocked || processing"
              shortcut="F3"
              @quantity-change="handleQuantityChange"
              @price-change="handlePriceChange"
              @discount-mode-change="handleDiscountModeChange"
              @discount-change="handleDiscountChange"
              @note-change="handleItemNoteChange"
              @remove="handleRemoveProduct"
              @clear="handleClearCart"
            />

            <div :ref="setCustomerSection" class="pos-customer mt-2">
              <!-- <label class="pos-field-label">
              <PosIcon name="user" />
              Pelanggan
              <kbd>F2</kbd>
            </label> -->
              <CustomerAutocomplete
                :model-value="selectedCustomerId"
                :disabled="transactionLocked || processing"
                @update:model-value="handleCustomerChange"
              />
            </div>
            <div v-if="heldTransactions.length > 0" class="pos-card shrink-0 p-2 max-h-40 overflow-y-auto">
              <!-- <div class="pos-card shrink-0 p-2 max-h-40 overflow-y-auto"> -->
              <PosHeldTransactions
                :transactions="heldTransactions"
                :loading="loadingHeldTransactions"
                :disabled="processing"
                @refresh="handleRefreshHeld"
                @resume="handleResumeSale"
              />
            </div>
          </section>

          <!-- KOLOM TENGAH (Tanpa Tab, Tanpa Scroll) -->
          <section class="pos-middle flex flex-col min-h-0 gap-2">
            <!-- KOTAK ATAS: DISKON & BIAYA (Berdampingan) -->
            <div class="shrink-0">
              <div class="grid grid-cols-2 gap-4">
                <!-- Kolom Kiri: Diskon -->
                <div :ref="setDiscountSection" class="pos-card p-3">
                  <PosDiscountInput
                    :mode="transactionDiscountMode"
                    :value="transactionDiscountValue"
                    :base-amount="Math.max(0, subtotal - itemDiscount)"
                    :disabled="transactionLocked || processing"
                    @update:mode="handleTransactionDiscountMode"
                    @update:value="handleTransactionDiscountValue"
                  />
                </div>
                <div class="pos-card p-1.5 pt-2.5 items-center justify-between gap-3 shadow-sm">
                  <label class="text-xs font-semibold text-slate-700 flex items-center pl-2 mb-1.5">
                    <PosIcon name="percent" :size="15" />
                    Pajak
                  </label>
                  <PosTaxInput
                    :mode="taxMode"
                    :value="taxValue"
                    :base-amount="dpp"
                    :disabled="transactionLocked || processing"
                    :show-preview="false"
                    @update:mode="handleTaxMode"
                    @update:value="handleTaxValue"
                  />
                </div>
              </div>
            </div>

            <!-- Catatan Transaksi -->
            <div class="pos-card p-3 shadow-sm shrink-0">
              <button
                type="button"
                class="flex w-full items-center justify-between"
                :aria-expanded="showTransactionNotes"
                @click="showTransactionNotes = !showTransactionNotes"
              >
                <span class="pos-field-label flex items-center gap-1">
                  <PosIcon name="file-text" :size="14" />
                  Catatan Transaksi
                </span>

                <PosIcon :name="showTransactionNotes ? 'chevron-up' : 'chevron-down'" :size="16" />
              </button>

              <div v-if="showTransactionNotes" class="mt-3">
                <PosTransactionNotes v-model="notes" :disabled="transactionLocked || processing" class="min-h-10" />
              </div>
            </div>

            <!-- Biaya Tambahan -->
            <div :ref="setChargesSection" class="pos-card p-3 shadow-sm shrink-0">
              <button
                type="button"
                class="flex w-full items-center justify-between"
                :aria-expanded="showAdditionalCharges"
                @click="showAdditionalCharges = !showAdditionalCharges"
              >
                <span class="pos-field-label flex items-center gap-1">
                  <PosIcon name="plus-circle" :size="14" />
                  Biaya Tambahan
                </span>

                <PosIcon :name="showAdditionalCharges ? 'chevron-up' : 'chevron-down'" :size="16" />
              </button>

              <div v-if="showAdditionalCharges" class="mt-3">
                <PosAdditionalCharges
                  :charges="additionalCharges"
                  :disabled="transactionLocked || processing"
                  @add="addCharge"
                  @update="updateCharge"
                  @remove="removeCharge"
                />
              </div>
            </div>

            <!-- KOTAK BAWAH: PAJAK & RINGKASAN -->
            <div class="flex flex-col gap-2 shrink-0 mt-auto">
              <!-- Panel Ringkasan -->
              <PosPanel title="Ringkasan" icon="receipt" tone="success">
                <div class="px-3 py-2">
                  <PosSummary
                    :subtotal="subtotal"
                    :item-discount="itemDiscount"
                    :transaction-discount="transactionDiscount"
                    :dpp="dpp"
                    :tax="taxAmount"
                    :additional-charges="additionalChargesTotal"
                    :total="grandTotal"
                    :show-total="false"
                  />
                </div>
              </PosPanel>
            </div>
          </section>

          <section class="pos-right flex flex-col min-h-0 gap-2">
            <PosTotalPanel
              :total="payableTotal"
              :paid="appliedAmount"
              :change="changeAmount"
              :remaining="remainingAmount"
              :settlement-label="settlementLabel"
            />

            <!-- <PosPanel :ref="setPaymentSection" title="Pembayaran" icon="wallet" tone="primary" shortcut="F6" class="h-full flex flex-col"> -->
            <BaseCard :ref="setPaymentSection" class="p-0">
              <div :ref="setPaymentInput" class="flex-1 overflow-y-auto">
                <PosPayment
                  :mode="settlementMode"
                  :payment-method="paymentMethod"
                  :payment-amount="paymentAmount"
                  :total="payableTotal"
                  :due-date="dueDate"
                  :due-date-error="dueDateError"
                  :reference-number="paymentReferenceNumber"
                  :payment-confirmed="paymentConfirmed"
                  :disabled="processing || isPosted"
                  :bank-name="paymentInfo.bankName"
                  :account-number="paymentInfo.accountNumber"
                  :account-holder="paymentInfo.accountHolder"
                  :qris-image-url="paymentInfo.qrisImageUrl"
                  @update:mode="handleSettlementMode"
                  @update:payment-method="handlePaymentMethod"
                  @update:payment-amount="handlePaymentAmount"
                  @update:due-date="handleDueDate"
                  @update:reference-number="handleReferenceNumber"
                  @update:payment-confirmed="handlePaymentConfirmation"
                  @exact="handleExactPayment"
                  @reset="handleResetPayment"
                />
                <PosCreditBuyer
                  v-if="needsBuyerInfo"
                  v-model:buyerName="buyerName"
                  v-model:buyerPhone="buyerPhone"
                  v-model:collateralNote="collateralNote"
                  :disabled="processing || isPosted"
                />
              </div>
            </BaseCard>
            <!-- </PosPanel> -->

            <section class="pos-final shrink-0 p-3">
              <div class="pos-final-actions mt-2">
                <button
                  v-if="!isDraft && !isPosted"
                  type="button"
                  class="pos-button pos-button-success pos-button-lg w-full"
                  :disabled="!canCheckout"
                  @click="handleProcessSale"
                >
                  <span v-if="processing" class="pos-spinner" aria-hidden="true"></span>
                  <PosIcon v-else name="check" />
                  Bayar &amp; selesaikan
                  <kbd>F12</kbd>
                </button>
                <template v-else-if="isDraft">
                  <button
                    type="button"
                    class="pos-button pos-button-success pos-button-lg"
                    :disabled="!canPostSale || !isPaymentValid || processing"
                    @click="handlePostSale"
                  >
                    <span v-if="processing" class="pos-spinner" aria-hidden="true"></span>
                    <PosIcon v-else name="check" />
                    Posting penjualan
                    <kbd>F12</kbd>
                  </button>
                  <button type="button" class="pos-button pos-button-outline-danger" :disabled="processing" @click="handleCancelDraft">
                    <PosIcon name="x" :size="15" />
                    Batalkan draft
                  </button>
                </template>
                <button
                  v-else
                  type="button"
                  class="pos-button pos-button-primary pos-button-lg"
                  :disabled="processing"
                  @click="handleNewTransaction"
                >
                  <PosIcon name="plus" />
                  Transaksi baru
                  <kbd>F11</kbd>
                </button>
                <small v-if="isDraft">
                  <PosIcon name="info" :size="14" />
                  Transaksi tertahan dilanjutkan. Selesaikan pembayaran atau batalkan draft.
                </small>
              </div>
            </section>
          </section>
        </main>
      </div>

      <div v-show="activeTab === 'held'" class="h-full">
        <div class="pos-card p-3 h-full flex flex-col">Transac</div>
      </div>

      <div v-show="activeTab === 'transday'" class="h-full flex flex-col">
        <div class="pos-card p-3 h-full flex flex-col">a</div>
      </div>

      <div v-show="activeTab === 'hello'" class="h-full flex flex-col">
        <div class="pos-card p-3 h-full flex flex-col">Hello</div>
      </div>
    </BaseTabs>

    <PosDock
      v-if="dock.visible"
      :open="dock.open"
      :edge="dock.edge"
      :offset="dock.offset"
      :items="dockItems"
      @action="onDockAction"
      @toggle="toggleDock"
      @move="onDockMove"
    />
  </div>
</template>
