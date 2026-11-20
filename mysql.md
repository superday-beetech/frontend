CREATE TABLE `cash_transactions` (
  `id` bigint UNSIGNED NOT NULL,
  `transaction_number` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL,
  `transaction_date` datetime NOT NULL,
  `transaction_type` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `reference_type` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL,
  `reference_id` bigint UNSIGNED NOT NULL,
  `description` varchar(180) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `amount` decimal(18,2) NOT NULL DEFAULT '0.00',
  `payment_method` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_by` bigint UNSIGNED DEFAULT NULL,
  `created_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `cash_transactions` (`id`, `transaction_number`, `transaction_date`, `transaction_type`, `reference_type`, `reference_id`, `description`, `amount`, `payment_method`, `created_by`, `created_at`) VALUES
(1, 'CT20261111180850949130', '2026-11-11 18:08:50', 'in', 'sale', 8, 'Pembayaran POS POS-20261111-180848-347488', 2500.00, 'cash', 1, '2026-11-11 18:08:50');

CREATE TABLE `categories` (
  `id` bigint UNSIGNED NOT NULL,
  `module` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'general',
  `type` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'umum',
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `categories` (`id`, `module`, `type`, `name`, `description`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'pharmacy', 'obat', 'Analgesik', NULL, 1, '2026-11-06 02:26:11', '2026-11-14 23:55:32'),
(2, 'pharmacy', 'obat', 'Antibiotik', NULL, 1, '2026-11-06 17:27:48', '2026-11-14 20:09:28'),
(4, 'pharmacy', 'obat', 'Vitamin', NULL, 1, '2026-11-14 20:09:39', '2026-11-14 20:09:39'),
(5, 'pharmacy', 'obat', 'Antihistamin', NULL, 1, '2026-11-14 23:39:15', '2026-11-14 23:39:15'),
(6, 'pharmacy', 'obat', 'Antihistaminaa', NULL, 1, '2026-11-14 23:39:15', '2026-11-14 23:39:15');

CREATE TABLE `category_types` (
  `id` tinyint UNSIGNED NOT NULL,
  `module` varchar(30) NOT NULL,
  `code` varchar(30) NOT NULL,
  `label` varchar(50) NOT NULL,
  `sort_order` smallint UNSIGNED DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
INSERT INTO `category_types` (`id`, `module`, `code`, `label`, `sort_order`, `is_active`) VALUES
(1, 'pharmacy', 'obat', 'Obat', 1, 1),
(2, 'pharmacy', 'alkes', 'Alat Kesehatan', 2, 1),
(3, 'pharmacy', 'herbal', 'Herbal', 3, 1),
(4, 'pharmacy', 'vitamin', 'Vitamin & Suplemen', 4, 1),
(5, 'pharmacy', 'kosmetik', 'Kosmetik', 5, 1),
(6, 'pharmacy', 'umum', 'Umum', 6, 1),
(7, 'minimarket', 'makanan', 'Makanan', 1, 1),
(8, 'minimarket', 'minuman', 'Minuman', 2, 1),
(9, 'minimarket', 'sembako', 'Sembako', 3, 1),
(10, 'minimarket', 'kebersihan', 'Kebersihan', 4, 1),
(11, 'minimarket', 'rumah_tangga', 'Rumah Tangga', 5, 1),
(12, 'minimarket', 'rokok', 'Rokok', 6, 1),
(13, 'minimarket', 'umum', 'Umum', 7, 1);

-- --------------------------------------------------------

--
-- Table structure for table `customers`
--

CREATE TABLE `customers` (
  `id` bigint UNSIGNED NOT NULL,
  `code` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `member_number` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `barcode` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `customer_type` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'retail',
  `phone` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` text COLLATE utf8mb4_unicode_ci,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_by` bigint UNSIGNED DEFAULT NULL,
  `updated_by` bigint UNSIGNED DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `customers`
--

INSERT INTO `customers` (`id`, `code`, `member_number`, `barcode`, `name`, `customer_type`, `phone`, `email`, `address`, `is_active`, `created_by`, `updated_by`, `created_at`, `updated_at`) VALUES
(1, 'CUS-001', NULL, NULL, 'abce', 'grosir', '082214', 'abc@gmail.com', 'ksasa', 1, 1, 1, '2026-11-06 18:56:25', '2026-11-06 18:56:33');

-- --------------------------------------------------------

--
-- Table structure for table `customer_payments`
--

CREATE TABLE `customer_payments` (
  `id` bigint UNSIGNED NOT NULL,
  `payment_number` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL,
  `customer_id` bigint UNSIGNED NOT NULL,
  `sale_id` bigint UNSIGNED DEFAULT NULL,
  `distribution_order_id` bigint UNSIGNED DEFAULT NULL,
  `payment_date` date NOT NULL,
  `amount` decimal(18,2) NOT NULL DEFAULT '0.00',
  `payment_method` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `reference_number` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_by` bigint UNSIGNED DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `customer_payments`
--

INSERT INTO `customer_payments` (`id`, `payment_number`, `customer_id`, `sale_id`, `distribution_order_id`, `payment_date`, `amount`, `payment_method`, `reference_number`, `notes`, `created_by`, `created_at`, `updated_at`) VALUES
(1, 'CP20261111180850322846', 1, 8, NULL, '2026-11-11', 2500.00, 'cash', NULL, 'Pembayaran POS POS-20261111-180848-347488', 1, '2026-11-11 18:08:50', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `deliveries`
--

CREATE TABLE `deliveries` (
  `id` bigint UNSIGNED NOT NULL,
  `delivery_number` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL,
  `distribution_order_id` bigint UNSIGNED NOT NULL,
  `delivery_date` date NOT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draft',
  `recipient_name` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `recipient_phone` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `shipping_address` text COLLATE utf8mb4_unicode_ci,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_by` bigint UNSIGNED DEFAULT NULL,
  `updated_by` bigint UNSIGNED DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `deliveries`
--

INSERT INTO `deliveries` (`id`, `delivery_number`, `distribution_order_id`, `delivery_date`, `status`, `recipient_name`, `recipient_phone`, `shipping_address`, `notes`, `created_by`, `updated_by`, `created_at`, `updated_at`) VALUES
(2, 'DLV-2026-000002', 2, '2026-11-07', 'posted', 'penerima di sekolah', '088888', 'Banuraja', 'contoh keseribu kalinya', 1, 1, '2026-11-07 00:32:54', '2026-11-07 00:38:29');

-- --------------------------------------------------------

--
-- Table structure for table `delivery_items`
--

CREATE TABLE `delivery_items` (
  `id` bigint UNSIGNED NOT NULL,
  `delivery_id` bigint UNSIGNED NOT NULL,
  `distribution_item_id` bigint UNSIGNED NOT NULL,
  `batch_id` bigint UNSIGNED NOT NULL,
  `quantity_dispatched` decimal(18,3) NOT NULL DEFAULT '0.000',
  `unit_price` decimal(18,2) NOT NULL DEFAULT '0.00',
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `delivery_items`
--

INSERT INTO `delivery_items` (`id`, `delivery_id`, `distribution_item_id`, `batch_id`, `quantity_dispatched`, `unit_price`, `created_at`, `updated_at`) VALUES
(1, 2, 2, 1, 1.000, 2250.00, '2026-11-07 00:38:29', '2026-11-07 00:38:29');

-- --------------------------------------------------------

--
-- Table structure for table `distribution_items`
--

CREATE TABLE `distribution_items` (
  `id` bigint UNSIGNED NOT NULL,
  `distribution_order_id` bigint UNSIGNED NOT NULL,
  `product_id` bigint UNSIGNED NOT NULL,
  `quantity` decimal(18,3) NOT NULL DEFAULT '0.000',
  `unit_price` decimal(18,2) NOT NULL DEFAULT '0.00',
  `discount_amount` decimal(18,2) NOT NULL DEFAULT '0.00',
  `subtotal` decimal(18,2) NOT NULL DEFAULT '0.00',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `distribution_items`
--

INSERT INTO `distribution_items` (`id`, `distribution_order_id`, `product_id`, `quantity`, `unit_price`, `discount_amount`, `subtotal`, `notes`, `created_at`, `updated_at`) VALUES
(2, 2, 3, 1.000, 2250.00, 0.00, 2250.00, 'percobaan produk 67676 dengan nama amnsansm', '2026-11-07 00:23:56', '2026-11-07 00:23:56');

-- --------------------------------------------------------

--
-- Table structure for table `distribution_orders`
--

CREATE TABLE `distribution_orders` (
  `id` bigint UNSIGNED NOT NULL,
  `order_number` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL,
  `customer_id` bigint UNSIGNED NOT NULL,
  `order_date` date NOT NULL,
  `requested_delivery_date` date DEFAULT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draft',
  `subtotal` decimal(18,2) NOT NULL DEFAULT '0.00',
  `discount_amount` decimal(18,2) NOT NULL DEFAULT '0.00',
  `tax_amount` decimal(18,2) NOT NULL DEFAULT '0.00',
  `total_amount` decimal(18,2) NOT NULL DEFAULT '0.00',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_by` bigint UNSIGNED DEFAULT NULL,
  `updated_by` bigint UNSIGNED DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `distribution_orders`
--

INSERT INTO `distribution_orders` (`id`, `order_number`, `customer_id`, `order_date`, `requested_delivery_date`, `status`, `subtotal`, `discount_amount`, `tax_amount`, `total_amount`, `notes`, `created_by`, `updated_by`, `created_at`, `updated_at`) VALUES
(2, 'DO-20261107-002308-6842', 1, '2026-11-07', '2026-11-07', 'completed', 2250.00, 0.00, 0.00, 2250.00, 'percobaan lagi setelah 100x dicoba', 1, 1, '2026-11-07 00:23:56', '2026-11-07 00:38:29');

-- --------------------------------------------------------

--
-- Table structure for table `expenses`
--

CREATE TABLE `expenses` (
  `id` bigint UNSIGNED NOT NULL,
  `expense_number` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expense_date` date NOT NULL,
  `category` varchar(80) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(180) COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(18,2) NOT NULL DEFAULT '0.00',
  `payment_method` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `reference_number` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_by` bigint UNSIGNED DEFAULT NULL,
  `updated_by` bigint UNSIGNED DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `goods_receipts`
--

CREATE TABLE `goods_receipts` (
  `id` bigint UNSIGNED NOT NULL,
  `receipt_number` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL,
  `purchase_order_id` bigint UNSIGNED NOT NULL,
  `received_date` date NOT NULL,
  `supplier_delivery_number` varchar(80) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draft',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_by` bigint UNSIGNED DEFAULT NULL,
  `updated_by` bigint UNSIGNED DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `goods_receipts`
--

INSERT INTO `goods_receipts` (`id`, `receipt_number`, `purchase_order_id`, `received_date`, `supplier_delivery_number`, `status`, `notes`, `created_by`, `updated_by`, `created_at`, `updated_at`) VALUES
(1, 'GR-2026-001', 2, '2026-11-06', 'SJ-2026-001', 'posted', NULL, 1, 1, '2026-11-06 20:02:55', '2026-11-06 20:24:37'),
(3, 'GR-2026-002', 3, '2026-11-09', 'sp-002', 'posted', '95 heula', 1, 1, '2026-11-09 22:10:12', '2026-11-09 22:10:36'),
(5, 'GR-2026-004', 3, '2026-11-19', '-', 'draft', NULL, 1, 1, '2026-11-19 10:38:51', '2026-11-19 10:38:51'),
(6, 'GR-2026-005', 4, '2026-11-19', NULL, 'draft', NULL, 1, 1, '2026-11-19 10:39:26', '2026-11-19 10:39:26');

-- --------------------------------------------------------

--
-- Table structure for table `goods_receipt_items`
--

CREATE TABLE `goods_receipt_items` (
  `id` bigint UNSIGNED NOT NULL,
  `goods_receipt_id` bigint UNSIGNED NOT NULL,
  `purchase_order_item_id` bigint UNSIGNED DEFAULT NULL,
  `product_id` bigint UNSIGNED NOT NULL,
  `quantity_received` decimal(18,3) NOT NULL DEFAULT '0.000',
  `unit_cost` decimal(18,2) NOT NULL DEFAULT '0.00',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `goods_receipt_items`
--

INSERT INTO `goods_receipt_items` (`id`, `goods_receipt_id`, `purchase_order_item_id`, `product_id`, `quantity_received`, `unit_cost`, `notes`, `created_at`, `updated_at`) VALUES
(1, 1, 4, 3, 1.000, 2500.00, NULL, '2026-11-06 20:02:55', '2026-11-06 20:02:55'),
(2, 3, 5, 1, 95.000, 2000.00, NULL, '2026-11-09 22:10:12', '2026-11-09 22:10:12'),
(3, 5, 5, 1, 96.000, 2000.00, NULL, '2026-11-19 10:38:51', '2026-11-19 10:38:51'),
(4, 6, 6, 1, 1.000, 2000.00, NULL, '2026-11-19 10:39:26', '2026-11-19 10:39:26'),
(5, 6, 7, 6, 1.000, 10000.00, NULL, '2026-11-19 10:39:26', '2026-11-19 10:39:26');

-- --------------------------------------------------------

--
-- Table structure for table `print_templates`
--

CREATE TABLE `print_templates` (
  `id` int UNSIGNED NOT NULL,
  `name` varchar(100) NOT NULL,
  `type` varchar(50) NOT NULL,
  `paper_type` varchar(20) NOT NULL,
  `paper_config` json NOT NULL,
  `design_json` json NOT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `print_templates`
--

INSERT INTO `print_templates` (`id`, `name`, `type`, `paper_type`, `paper_config`, `design_json`, `created_by`, `created_at`, `updated_at`) VALUES
(1, 'test', 'kwitansi', '80mm', '{\"type\": \"80mm\", \"unit\": \"mm\", \"width\": 80, \"height\": 0, \"orientation\": \"portrait\"}', '{\"elements\": []}', 1, '2026-11-11 21:40:13', '2026-11-11 21:40:13'),
(2, 'Kwitansi', 'kwitansi', '80mm', '{\"type\": \"80mm\", \"unit\": \"mm\", \"width\": 80, \"height\": 0, \"orientation\": \"portrait\"}', '{\"elements\": [{\"x\": 60, \"y\": 30, \"id\": \"6f92f9ee-94be-4b5b-a69a-c94643210fbb\", \"type\": \"text\", \"props\": {\"align\": \"left\", \"color\": \"#000\", \"label\": \"Teks\", \"binding\": \"\", \"fontSize\": 12}, \"width\": 120, \"height\": 24}]}', 1, '2026-11-11 22:18:55', '2026-11-11 22:18:55'),
(3, 'Kwitansi A5', 'kwitansi', 'a5', '{\"type\": \"a5\", \"unit\": \"mm\", \"width\": 148, \"height\": 210, \"orientation\": \"portrait\"}', '{\"elements\": [{\"x\": 10, \"y\": 8, \"id\": \"aa503c54-50c2-458b-acad-843f7e130599\", \"type\": \"text\", \"props\": {\"align\": \"center\", \"color\": \"#000\", \"label\": \"APOTEK SEHAT\", \"fontSize\": 18}, \"width\": 128, \"height\": 8}, {\"x\": 10, \"y\": 15, \"id\": \"26eb1833-a71b-4ab9-adc0-4f6128ad1c14\", \"type\": \"text\", \"props\": {\"align\": \"center\", \"color\": \"#666\", \"label\": \"Jl. Kesehatan No. 123, Jakarta — Telp. 021-1234567\", \"fontSize\": 9}, \"width\": 128, \"height\": 5}, {\"x\": 10, \"y\": 22, \"id\": \"a854e422-fedc-47b2-970c-c4664c17910a\", \"type\": \"line\", \"props\": {\"color\": \"#333\"}, \"width\": 128, \"height\": 0.3}, {\"x\": 10, \"y\": 25, \"id\": \"3d76dea9-5a66-4e06-92c7-3ea3e1f97203\", \"type\": \"text\", \"props\": {\"align\": \"left\", \"color\": \"#000\", \"label\": \"No. Kwitansi\", \"fontSize\": 10}, \"width\": 60, \"height\": 5}, {\"x\": 70, \"y\": 25, \"id\": \"f50344f5-5d27-47bc-8cd0-26cbd40cc62b\", \"type\": \"text\", \"props\": {\"align\": \"left\", \"color\": \"#000\", \"label\": \"\", \"binding\": \"invoice.number\", \"fontSize\": 10}, \"width\": 68, \"height\": 5}, {\"x\": 10, \"y\": 30, \"id\": \"149f90d7-2655-4b09-97de-ae16985e8be6\", \"type\": \"text\", \"props\": {\"align\": \"left\", \"color\": \"#000\", \"label\": \"Tanggal\", \"fontSize\": 10}, \"width\": 60, \"height\": 5}, {\"x\": 70, \"y\": 30, \"id\": \"2da5f06c-6afd-42c0-a8b1-f68c1d4c151d\", \"type\": \"text\", \"props\": {\"align\": \"left\", \"color\": \"#000\", \"label\": \"\", \"binding\": \"invoice.date\", \"fontSize\": 10}, \"width\": 68, \"height\": 5}, {\"x\": 10, \"y\": 36, \"id\": \"6a3f8c1d-3991-4723-9c01-e63b4cb7f730\", \"type\": \"text\", \"props\": {\"align\": \"left\", \"color\": \"#000\", \"label\": \"Nama Pasien\", \"fontSize\": 10}, \"width\": 60, \"height\": 5}, {\"x\": 70, \"y\": 36, \"id\": \"f9eab4bf-55e1-4e78-876e-6e778b5dffea\", \"type\": \"text\", \"props\": {\"align\": \"left\", \"color\": \"#000\", \"label\": \"\", \"binding\": \"patient.name\", \"fontSize\": 10}, \"width\": 68, \"height\": 5}, {\"x\": 10, \"y\": 41, \"id\": \"cd96eaeb-0711-4eab-9eab-bbe99057f377\", \"type\": \"text\", \"props\": {\"align\": \"left\", \"color\": \"#000\", \"label\": \"Alamat\", \"fontSize\": 10}, \"width\": 60, \"height\": 5}, {\"x\": 70, \"y\": 41, \"id\": \"4d8d8a1d-df3a-4acb-9c23-935c70c53529\", \"type\": \"text\", \"props\": {\"align\": \"left\", \"color\": \"#000\", \"label\": \"\", \"binding\": \"patient.address\", \"fontSize\": 10}, \"width\": 68, \"height\": 8}, {\"x\": 10, \"y\": 52, \"id\": \"7fa0a050-98a7-4c95-9a92-60f79c9e04ce\", \"type\": \"table\", \"props\": {\"rows\": [{\"no\": \"1\", \"qty\": \"10\", \"name\": \"Paracetamol 500mg\", \"price\": \"Rp 500\", \"subtotal\": \"Rp 5.000\"}, {\"no\": \"2\", \"qty\": \"5\", \"name\": \"Amoxicillin 250mg\", \"price\": \"Rp 1.200\", \"subtotal\": \"Rp 6.000\"}], \"align\": \"left\", \"color\": \"#000\", \"binding\": \"items\", \"columns\": [{\"key\": \"no\", \"align\": \"center\", \"label\": \"No\", \"width\": 12}, {\"key\": \"name\", \"align\": \"left\", \"label\": \"Nama Barang\", \"width\": 70}, {\"key\": \"qty\", \"align\": \"center\", \"label\": \"Qty\", \"width\": 18}, {\"key\": \"price\", \"align\": \"right\", \"label\": \"Harga\", \"width\": 30}, {\"key\": \"subtotal\", \"align\": \"right\", \"label\": \"Subtotal\", \"width\": 30}], \"fontSize\": 10}, \"width\": 128, \"height\": 60}, {\"x\": 10, \"y\": 120, \"id\": \"826b69b4-9c93-432a-adeb-68ad9ed810d5\", \"type\": \"line\", \"props\": {\"color\": \"#333\"}, \"width\": 128, \"height\": 0.3}, {\"x\": 10, \"y\": 124, \"id\": \"ddbc9166-eaa7-4b70-b43c-a4b3d8439fd2\", \"type\": \"text\", \"props\": {\"align\": \"left\", \"color\": \"#000\", \"label\": \"Total\", \"fontSize\": 12}, \"width\": 60, \"height\": 5}, {\"x\": 70, \"y\": 124, \"id\": \"8b9538f3-c1ae-46dd-9eea-08b82deae12f\", \"type\": \"text\", \"props\": {\"align\": \"right\", \"color\": \"#000\", \"label\": \"\", \"binding\": \"invoice.total\", \"fontSize\": 12}, \"width\": 68, \"height\": 5}, {\"x\": 10, \"y\": 133, \"id\": \"1ce771c9-6703-475e-96f5-23b1a1c9eb88\", \"type\": \"text\", \"props\": {\"align\": \"left\", \"color\": \"#000\", \"label\": \"Metode Bayar\", \"fontSize\": 10}, \"width\": 60, \"height\": 5}, {\"x\": 70, \"y\": 133, \"id\": \"49609b34-9c13-4287-ba22-62a9a10ebd54\", \"type\": \"text\", \"props\": {\"align\": \"left\", \"color\": \"#000\", \"label\": \"\", \"binding\": \"invoice.payment_method\", \"fontSize\": 10}, \"width\": 68, \"height\": 5}, {\"x\": 10, \"y\": 150, \"id\": \"1fffcebc-6f8d-43cb-b589-b0ff45d839fe\", \"type\": \"text\", \"props\": {\"align\": \"center\", \"color\": \"#666\", \"label\": \"Terima kasih atas kunjungan Anda\", \"fontSize\": 10}, \"width\": 128, \"height\": 5}, {\"x\": 118, \"y\": 160, \"id\": \"6b6ba8a4-24cb-42c1-98dd-adec44934644\", \"type\": \"qr\", \"props\": {\"label\": \"\", \"binding\": \"invoice.number\"}, \"width\": 22, \"height\": 22}, {\"x\": 10, \"y\": 190, \"id\": \"9f24bc93-f993-476c-8328-e6178c1989cf\", \"type\": \"text\", \"props\": {\"align\": \"left\", \"color\": \"#000\", \"label\": \"Petugas\", \"fontSize\": 9}, \"width\": 60, \"height\": 5}, {\"x\": 10, \"y\": 195, \"id\": \"abf85b22-6731-48cc-884a-048fb0f09191\", \"type\": \"text\", \"props\": {\"align\": \"left\", \"color\": \"#000\", \"label\": \"\", \"binding\": \"cashier.name\", \"fontSize\": 9}, \"width\": 60, \"height\": 5}]}', 1, '2026-11-12 06:00:03', '2026-11-12 06:00:03');
INSERT INTO `print_templates` (`id`, `name`, `type`, `paper_type`, `paper_config`, `design_json`, `created_by`, `created_at`, `updated_at`) VALUES
(4, 'Struk 80mm', 'struk', '80mm', '{\"type\": \"80mm\", \"unit\": \"mm\", \"width\": 80, \"height\": 150, \"orientation\": \"portrait\"}', '{\"logo\": {\"x\": 5, \"y\": 5, \"url\": \"data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAYGBgYHBgcICAcKCwoLCg8ODAwODxYQERAREBYiFRkVFRkVIh4kHhweJB42KiYmKjY+NDI0PkxERExfWl98fKcBBgYGBgcGBwgIBwoLCgsKDw4MDA4PFhAREBEQFiIVGRUVGRUiHiQeHB4kHjYqJiYqNj40MjQ+TERETF9aX3x8p//CABEIBBAB6AMBIgACEQEDEQH/xAAyAAADAQEBAQAAAAAAAAAAAAAAAQIDBAUGAQEBAQEBAQEAAAAAAAAAAAAAAQIDBAUG/9oADAMBAAIQAxAAAAL3QaIYIGIYAAgBABx9nIZQ9I5Me+TjfSlwewmVaBnYsbyoOHSujm6OmLafbDqKKchbllOXDQhoVAEMSGmhIA4e7zTyyS1q4O4sZ+iTKABNMBqgZEgACDLWDzI35pW+bOO6/OqvQrz7O98Wlm053x6K5ebt08/T1wlem85GlnOuwOOuxnFPozHCdrPPO9VxHcjinvk5V1xHNHZmZeP7vhL5wO1pkemd5c9wAAyWMAAAEmgTQReZyRUS55bZxiaswnqo5V2o83XonzdgdDvJ9cbaYnTHRXKjurz2ekec69KvME9KvLD1V5Yeo/JD1X5CPXPHD2M/KJfV8Do8ugaDTPQ+kPIE+gApAABQDhAACBNBNI4M9spYz0gQwGBbmzI0XHdWtNQ0it5YOhjJLcZmzMDejlXYjkXUVyPrRx5+hMcb6g5I7Jl8/wAn2fEqgLDow7q6zck9FBSaAAAAAATQJoQBx4788sReYVLKasGqE2od53m3U1qNoqgBtBTllOQolFJJKJY5EUIJTUvB5PoeeMc6P0vN9c6BCekAEsAAAQNME0CaBAc3N080Z56QqaZVTQ2mMVQrTlqouxuXVOWMAGgpyxiEQACATkpIGhS+Py75U87RPueP7QAWemCAENNAAMAE0CaEAc/L2chjNTKnND0zopqhuaRiqVuaoqKGwGCG5obljQIAAgEAJDCKzl8SQpqRej1fN9K5Yg9RNUJkCaAENoGmhACBGXJ2cZjNKWWg0SZVS0pzQVLWqiguKGJlIBiYAwBIxMAATQgQYb8svi1NWpNV6Pdy9UygK9MCgQAIaCGAAIE0CCs+Pt4oyiplTEUJlOWW5pKc0DTV1LGxgADllCBoEGgGgaaEnI+Ht85fOAVqkevqhliK9RBQACaAAYiGgBCAELi7uExiolaAYA6TKc0lNUKpa05ooTGADTExDEINAwQxAkIfk+n5EvO06VxueqIsAD1AKQAACacCZSYCTQJonk6uWMI0ylGkUSyqiiqix1NBUsbminNDARNMaATTAEMAEIJpEeL7PiSy5NDr5e6O1oQAr1FSpAAAIAYgaAEAgQcXbyxzZ7zLgElkhblmlRRVRQ2mOoopppSAGgaAGgABoATQIDLwva8WVk3pHqeX68agIAV6oFIENAAIYmAIaASaFz9GEcUbc0vRPNpF57WYPWKdZuNXndW5YVNFVnZQhGDBNAACAYgctACXk8b1fJKoA9rx/YGJ2IA9VNU00JiAAAAEwAEmhY7ZRyZ3lKZas5q0zl234KT0FxbG03rXPXSGD3kyoRTQUS0pJghDBDEAAOSZfN87t57ZdZpv6nD6JLTRFFnppq0TQAAIGIBoGmgTULPSDhx2xlCaKkYlRETvRzXqE64Sejv5DPavxdK9iPO0OswosWiZLVmL2o5l1BzG8rhPRMfNZaYNa557Wel6Xld7OxhhZ2Hnh7gK1oBAAAAIGmAAgUE0jz8dsZU5Y3LGCh3loU4opxVUFma6Gcp1s432I5DqRzHQjBbs510Ec09cnNl28x5DVW5WrTs32tMTZmRqHpINAAQEIEMAHNAmgTQJo4MOjmlmpoGmK52jHgvy2vW6vnPZOyouSrzLNq59K2rO0skGJFJMYkUklcVCLi7POXgaA1noPRctKaKkA9QTpAACGmgAhNMAAQAgOLl7OSWKmhgE8+XJNdHJfpHm9HdinY4dla89J0VjRsZs0SZUUElshaozlaKZoQ8v0vKXGWxdXH3Hc00Q1QIPVEDEU0AAQJoGmCaBAABy8fbwyy0FcnR58ucaZzS6uNp7F+XvZ2rn1s0rAjq059Des7qiaRiYo0Q3KLlIhxZHj+t47UsEXo+Z65s0kYnSAPUPPuXtOTSzcmgRJQmDljTQhoBI5+Lt45YAOfi6eSaqLUueuUnTrjZQSdfN593Hp78GS+5p5XdHU8tLLcVYwQRQJOTPSNDl8j1fIasAXteT6yUmrGAIQVtxehneMPI6L5pOyORy9mnmSevfkQe4eO7PWXlWnoxz6WHJ0edGhcVz+d6/mTUjrOso6nUU4R3noedrp06xhyerymXo+Zoe/r4foZ13Vjpc0BYgBJyTc0cHnd3nNW5Zt6fn+ilJqwNMhEhzejFY3PP04kxos7xLjO0BKwAVIjHfKza+Pu1ieHv4F7ejyerfLp4vRzPKLiaVCluB2Y0+ew6eOrO+uaknJRW1c+p6vpfN+xm9wFiAsIqIoi18rm6Odc7irO3u5OuKlqwTkQBlUHL0bLJ2a1jinRpwiegs3c6TpJBcnPn0VNZGutnFz9Ynlq4Xp7/D2Tq59JWZ6ONNTKCuao1KtsvXHsl4Y7MLnHu5CvT28r283raLGgQi810Tk8bDXJWh2ep0RoiBAmiRhzms8vRmaRLBczUqrsrp4e7fDnUvHd50ZrcpDfnLOlZ6ev4PJy+1wcvoefG2efT186o5jfMhSXM9eHqN8fITcdm/LrLWXZyldWPrJO+d2aEtLhtZiwIuTw8dedbrPps9e1pJmtSsneBqcIdFclc+vXEXc0s2PN2CpHJOymitjOsDUmsmiSql+386TUmHL35cvdw1tjj3qbJeebnUq0sdsNY03yqRxvDSdvr+N02ejHLVnUY0akuKrOa3wnGXyefTPQ9PztpPoM/E0l9Dn5YNVzaFGAe4tVncsdznnuTXOak1lOkyyMSnAaXlOs3Od789tHf5DlkKaS557znpy1vHP2cM9mOfXMarn6OTTpw3yhzdlpAS3YmMjTNmmmNljiKgitM+jjs3lwV083VE4lUDaZnYb83VSfL1yzI2rno2MHLpMpbGEsk0zqjIpdPEwO3zQEAKUQlQlnoVLlwnVef6nNn6C7eTzX35TthO6nTDaoarOslA3JNUZVpIo0kossWPocjA9ddceW+u9eeeiHvy6CNc+Yjfx/ooblGkilIOakLlimwl1IVGvX5yWpvjkVIQJCqnh9MyZnuhVGU5aY1hpxv0fP8AQvibn21zTO3fnzmsdBleuDbu883s7MF387XBj2Yc/bvrnWPVvnR18I2+vzxqkGiyiSJ25t/J+gykyzbvLFemsLKjSrMKsJBoXrW4rmdZ0nOqUWlwjpnMwlPntD7Tm39DDGuXHt5+XXDk96+/m+Zfp+brh15Q8+uJ3xVXFk2wVONc99POWuffHHc13nFbfXpz79/l24rflpouWCACLObLyfoN5mI6b5bNML1OOe3KWNMtTbo1NzFbLecFrFmbCgYJtxnzdyjz/b4e/Nzy7suWuPn7I59bvTT0cMPnPp/mERjM3vMC63Hec1dORmY1HPpcVDcLVTqA515e3byd+vh9Corp5qQrACXxzQ8n6CaIjecbRd/n6nWc/qF70akU1Qmic7VmD1jpmShJtVCKuWeq1E6ZzLu4djzcGXmenkfMHtk143X6RNTSe4wRz+Z73Bi+dWsZs4652PfHUpxevJnjtinf2+J7XXy2g35gA4p0PJ9/KtYMTRrm79ZDsCxDLEnIpEqYWVNOznek7wmOjsjXFSqIiULs+et52jJJfNcrm6M7yWiMrpW5aDVRrOL47qcXKdEhDhdNM9eniyw3wivV83u1jqaO3gYg5Wp8f36hsE/SsvupazI0IAU1AlSVMVjaqwm1Zno+gEOFheEUZ6Vz3T3mWwkqZpJqWVc2AFK5U0RaxfJqVi3h0ebXRkoXo1zvp8/PDbGdN98dE9Bo7/NYBzyzxffTN629cOnNDLJVqInTNSWSoZYlSpMAJ3NGCKTKIxQt0lqIRZTiqabliqM6hGJsc/STG0mcaYy80qc3Pi9HkTmz7uSzsVTvwxlpnOuzKX0gO/zABMqDxffz97zvX3lpreEElpAs9YiRNRNAgE0616HSZTthGeFcyrVaqRpNmdtioABSmW2RmuiTPUohULPL1ckeZKxikkdfNnVx0xUa8uYrbd8vRN+oB6PlMRCrOfH971O/n6OvOk3ZnTCc9ECSHFIlaMxW8rhvn0x0k1cxydHBNRM6y25LGgqaLEMhDJW07BMEmlSqDLl6MJfKw6MoQOszZJAK4z3x1ZVxqvpAu/yWAmbuvL932bi94pqrAbqC0ZxtJzmsCKCrx0KSmHc0Tw+iHm325mC1zUBRQmA0NxQwYhoSpExUS4465r5Ea5S6J6JlVMy0FZmaBnoO8+0R3+SwDXo5fQ832+oZrN3lqjYUDBKwyjeLMHTWHrEZvRmb0RLBBOaSalEAkIIqAqaFTCRzKCCctM5cs7i3zCDNdQk3WVlKbEJ1Ti7y6BHb5VCLK9XyvY8329WnrJpnqU5djEFCYwZDpkxrIlSEraZuys50kznVGS0Sw6SZrRLmUhAhy0QhZ0ovOMsduS3iE82LQlkFMoJ0tRNM1x2A7fLYCaer5vf5/t9F4aamrikskssQUJyuoobmkBFKaQVLGI1HLkAQk5EiQSiWpmZaUKWpRKqigz0hMeXq5LeBjyaAizSpaC7RFqa1wto7fNoQnX28Pd5/tXUurcuy3FJbhlksqs6KcljJY0IbkKSVNIBJK5CJmpWRolNRKqVScwmATU2ZcXZwy8qQaRWRqlJs+ajqMrHc3rz0J9fnMBOnv4u3z/aqpdW5djqaG0JTh1TllCAcsYhGIGhAAqQgAEmiZqVSpEKpiVUSgATWdmPL18cvI9EEvMM6qWXNAKh9PP0b8tNPr89iE7O3i7vP9ptOxuaKadNy0bQUJ0wQxAxIoljRIwQIYhoJaEmiVUrIETNSqAkUVBnw93AsSqlBqwh6Ga1kimxaze/I2n08LATo9DzfT8/2hVVFJ2NoG00YmNy6aEUgAEKkDQhoAABACASciTQk1LMXAIIWd5kcHdwKst8h0hGINJihVnRd5a9PG2nvxsBNvS870PP9vRy7mmim0xuWjaBidAgbQCclAAnI0IYIYgE0IEEtClqWZpEpzKs7gy5OjkDXO0WXSGJeYk8ynmy98dungGnvzsBK9byfU8/2tRVcsRVOWNyynLRidCAYgctFNAIAQAmhiAAEgEnIkEszUikJYkk5sLhEtAqhWTlplKxAlTHrlr1+a2nriAB6fnd3n+11OXc2gpgAwGJo3LBAMQNJFiKYgaQMQAAJoEAk0KWlmazhDmXPO8jHLbMGrRVnpUZb3HPppBgtcjTSa7fKAdyDEfVzb+b7XbWWmpVRSOpdjAGJgAIcjEDExoKBAJoYmAgYgAQIRKcqpFmkVBlFQuArZJoQJ0E2lc6Sc+Pblc27O3zIbGUWTtVw/P8AT6d+Xp1LFSNp2NoGADQCEUJ0JghoTAJqRiBiBoQ0IJBZVRCTUqy0yWI0yTBuUcrUVRZOktGjJdYLuS1O/Lo81rhsZCVqT5/q7a43p0uWlNBTl2MTAECclVFU0A0AAAmgTBAAACEJNEzUSicyxm5lWWuOpOdkjeGhdTokRvzlXAVNMA0qCgQg2jJY313jrqa68+lmxNQ2nYxAxATUjqWUIpoQxMEA0ACYgAQhJomKjNcVgoCmly9PJrDqlJFVBTWlPKyJqKLFoROkgAWSU89Fz3W3PvtdTVzd50aNMAEAAlzLbRYxAwKBA0AACaRSEOXIS5lWdxKY6RLLRUYaQyEItoSdEVd5sc3I6NTIThK4GIroztc9Rvy76bXFaaVNJQgokKJaE0pW5djEDE6BoAQ0IYgaEICFNSs41nNaZ3EqQrOZiZpMSNMtRK5EFFOSrcsQnBSAApyPnuN83XTed7zpUUU5Y0AgAFBqQGjzqyiHFkugQNAJohoVCIV4NS4aMzqorOwz1wTLSLZSEs6TqgJDB0LSjFa5FghuXFkBolWN5VWJ2Xjt0zpU0DQMAAVGemcVU0AVUlSCpIhgkStPMNJESm1FU5Zy1NOKVk5aYINUzSnUeQgBi2SKuaKyuKzLCdIIZQEUsbedSbdHJ17l3ndlJgAAmURaiKVA5dVIwcsEwlOAM9QGhJqVIkzJc0wm5jOlJnpLNIpIhseegC1kNcLqs7oM8tZc3cohi6xazYmrMerCzqqXqaCdDTAGKbki4sSqbBoG5Y0IIuVz0TBORAlnO4iKVSkVBkJsOWxOdVqLoyq0kkOi8LlrR8tdPOaRGs2lEBrnazokRLaOy+bp0dJ2FSxgIKpIuLVKpsTCk0DTUICkIBNKpcyyqmWWKFjvxpbtswUzO5a7zGiIYTLVTFUt4GZfVyXHTgqLKAZOa51xVUMns5VZ6DzvUoTQGAARcsaapDQhoQFIaEMWVSjMuVmbjNSqYyw0LmNk0cVJcaUuWmdDvn6UyemVOpY40gStma3hdDlDqeV4s0pV1Qmeesh18Zqeg+XezVwyiaJVoQwQKmhAJiTQAKTSEiYU0pVhrzAFsl5C652DDMouzC6zN8ldmdOCrEXjpAXG5zm4c9NY3GtIpEppnaFnrNmL0g26eCLPUfndFdRNA0DE6JpEFIlWiShYVqIGhS8TPCrjSY0E9IIfRAlTTLfKV2z1hMdBlxVVlagvPSSMunCXQsCoM6emTLV4ppnbMrSIq1ZJpmLPfEz6cRe/bynZ6r87os6VJTEDABNCQpSDmqsBJdQ82krGmh0IcNpSiydHJNZCvfCk3zWxy0roFcIgUZWdVK0Qypmd3IojUm4LAuElpK6JDLUXM0pMN81XXfBVnc+LTU6Vzo1yzwNs4amrMIopWJk0MBobgRtodKRipamKC8UaLXFKcgzmLehVGNOpEeiZkqlavPRJpgs6LMdMKXSpaIuSoEDgrWYtCNQ551s5zcMrYSO1imiouyd8NyZu7IhgxA51B5VoY59OZz9RZzrozMY3UuB0BGWs509IEemcmmaYrQap5WOnmRz9vCvW87RlwJFlZiQdKkEipyXlOa9F8u5lOqK1w3M3UjSoi5oTqUqKoV5SupAbPMR56wSrgWudVsZEv//EAAL/2gAMAwEAAgADAAAAIaMugiqvhY+wj8zInwKJFClgOjtmubtj0AjlMuhqYF7KkYJavXXfc6vFEEkWXBjPGsggnlhYrv0x/wA9vMMKw/sNrbtpW8M0r4DL64IDJBRYBUoJDgPP+4wSMnZmvAM6b5ZZ5b67bRgjH6LbBzjCTPtEFgcXwyppIJbZYg9JwDw3CmzzCzyvsnd2olPrya5bZJZKrHIihhWpizCTCBEF+tsqO7UyTpYaZKIaU4BwHvQihBxzhVkccfqKQcCgyx5q5Zj16xAiMlARgAzRsesFfkorYAzBTBZ466U4xTg0HRxwCCQ+8cW08LsTCjSgLihRDkbQiAhQhxgH0GtfF1H9S+IDBijgxxixEbhBxRyAxFUV2vNkFlsCf7zCxCRiQjylz55wZwxig3FeN8EWyXZbDxwCSBDgDykTkwurDAizhFF8c1k6TNI4NTTAgiRQKBBhTdEH3Kxwi3+Nkh0rhsH+RziATjC4BQTwflogDSyQAwg4ZOtf1s5wCr7IpIZQyjy+Awc/zk38sNi3yvu7jDjwQAJ6phjAADxwqjmF1k9Ndh11c/vAz6xypYDR2iyTrKfIBrIBu99PMfC/fpzAI256gxSk3jgmHaDxOH9I8dPevSKVBjzp51tF6T/0+xhpSU1MpGKHOu+uwJoDAyvsebcdcVvGVqHbm0wtxGFLn+jDEpS77ESb8oZGwQx2Fzt/hAp+1mZe6bLnGw7I2WLm8DE4jJ3YapvS6S5r597o6Jn/AFx9mm7Kqx3oHOneEnlIwSPRWlXBWM7+qrP0tQgar/Z88bFn2ANpDm5m6IbdWiTVB9XVhiwQ1VU5FuBmfhztSFK6BXpdzYSHCEJdVN5ic+TuBK0HN3T2UUzGg5qsSSsOh71+Z8ratGsI72EmrS6XFqxf/AcOVgzg6WfT7yut+Krs0RZlyhwe4jcDRmv3F+8+LHvjiaNJyrAAgyybJm6EVwc+P7yzzRxI1q/HIlOjoB1B5LBGzGg2ZrfwXSGOkcJqOulUuQl4YT3RpmqTO0xnQxBc/vxXs0hnUedw8MArPt8cFwdZ/LMB9LFAQ9XuI1RvYeigMSlIUmuulylYfvzqKlv1Ov8AWBfWhSaKs6Bi0OB9jWcJU+9EqQjhg3SvANBDCFAPqFWBtg88g4e22n6oTVafMeC9plvfNqRKxUiXfy4xq1XDA7kuHTzfReidXecPDm4nqfI5GdAfJzAO7MCt9wxTEnVUqO4favFLBKINY2xV4L//AER4/Y4sZxvNooFnW/Dmxoym/SXT1P1EVnHFkGNoHrMSjyj38/oKotSC+YoWMmGL+duk1OH9APcjDTzyzZjZ/wDwrAjrBaEB1lZ1ORY0ELfIUQkok8waentCVbbYoxjObcVDMHE4PHYskkUEcmOSHVe5C8I6++zm388kbcA4j4YAkgYI+CiKlaRAUn+xLhytpMYVUcgbr7DP0oYsy2e1Y909wy8BuMr48L8qlRLPn/LYEZ5sMgF8uZEN73WK4NpNexZZnXi7ddtlVVxURQk64nyaKvqzmGyvLHyDb2noccwURd0M9gWvoeKvPz70g9wX165DH1rAc4YQ48NhLh6FDXdjL+D7N+crFw9pWln0ccolcVeEftyozBk0Y7r97nWJIIJaPPZ0kdFdrSQKqqD3yzhBDjNN+TpIeapWJLIsZjNwyzFzvWTzREZ9b/8ApuYZslHa0JNw2rlsE8QrvXT626oHQz+gYTUBkKW+GDCLVYWpfFX/AI9PvcmXqc5y1Ncz4oChf8s/ZWajfdb8NIz+kbD6MMiV0iCIOc4WC2OE2AIBGDeOaPv1gQNILVyRIx//APvFHutlwikmeS3T+iXJ8V98MlwbKGeHbTTFOLXeQNhc9Aw+iGRFFBhxgEG6J/nx+rIW21Qi5J6cQcbSXHABpe+M8XXqxmtA8nU28VqUyI44YLLjKPaQTyoZCWWVjJxw7IGZK3gDQoscnjLWmmj/APHC1aoxhqpdTyIUesixMNJmbHAklTRcjjHYVw5ctk85m2WManAADGSO1ylvw9/fv//EAAL/2gAMAwEAAgADAAAAEM8T8537Tm0CK9xzQsilCA8lPpwXcx98+7f4M7TVpRwYCR1TKDipFp+RMl2xGRcZ+Waw9/8A6Tv6+XeOjSR9C0RrOvQrAPHNH3jvef8An2zeQ6Civ61GGyj6k+2zmnRADpx7jjLJGFv6SI1hAKCGWWHx/hDfg8wX5VPrfRff5D+ccICWKe+ypl/1b6vLaypzJzPvFRFHn++bjGgwWqef3Rn5eZyZ+QbDHDTZrZoX2HRmCu6eKev7xdFnKhqy8s0bnBxMwUrksZDokQ+6CN/lTZQ2jn+QoAMLjeXGOLd0Xbu40WKWR7lrbWzHM+IwMqcg40gWfwCiKmOuD7D59/z/AFQc48NJEBDGLJKoJXPCOtNN+zyxdR9yZ2fnzqFDDCFHFLPcx+V3vtik8zaxY07HX5ePoNNNOAOELmiLoJxFJpNr27YQ8S1LqJwdDIDBBNNC9in4l67+1XeO8DGxG6h5AfEINKNJDJbwWvhqs5djeOOBuN+wKPrQMyMAtTa98V0tvHQMCtGs/wDwh17M184G3wjCRRHEkNfZ6FDl3SUdfdXwUHuBpQ7TE3Rjfl9sweK5WXsVoKbplOm+lEiG2eQzZGV2u88QD8OTttc6eRBs2VG/lxa4m7I01PLv0HWhOn39R7hDaPh/GNdG7rm2Y8a2ImL2nZwSlgT4xxajYACCU9Js0hPQCCASnPnNvTDpqZmMHsSNi71vahh1CsDwC8KxVIK0JqJUhhtzJqROy942E1gJKLFtrBd5e0Qv+z/tu8oX969UqeEMw/vE0Nsm/wCRz/f9kCbcnK9OTnayuxesumToqOgc1leWJ1iggTMoJtku5hUar5f8vAVnzYIe++ydzCA+c9nPO1iggrq1eQyQFKByuroDUnXQpH7Dsvii7uyADVTI2JZilFyaFZtqNOczmRifBrIxMXCqusXEX5NfJyuSZDfeNWvI7u5133DOtag/86/IrBhfNJh4HPQArkvOsc3AezY0TUMxkTPj7ijMJ9dFCxjWovGWZzyiGkThYir5usvAr9O+jDwHV83dOWF0uRTsw5huBlGbW1AfmzpQXcYrvzXB5ht2VU2he+3xy7anXCasPMSHSkp2xgB+KPysSz/DHAUBn5+DC/CxsQHAoI1c4z0rN8BbWW7FPYA8Ye/D/LCJ3vfwipmScXHFtqNmjBHoj5aVrXR3KAqg4OKSGXyUiGOG8h6IvMcdCCjRNTFO/nJ71lZr/o0+kUIitjqMooz6Nk4JhzsxhS7xmnyOyC2fmoLmct1LTcGMUsxQveBpGEgHZZiund3yvjUex8nxssFpfwZEhz9bCptuFGa+Om4Tx2hkqQbuFYvW6NHlxDKZuFeJheunfLPJPcfr1Ph3/jgD8FT8GGhmpO5Zi3GVthB3k7K5cKun/wD6seTcvWGcHiAcVXRq31Tw3SrhD9/Ug1Q3KwQfR1NNEdkvvXWa/wA3+mpgHvc5phdE8BTKjU+P8QLNfpH2Rx/8cqA6C7pM+ZPHBP3n7LcDK84xjBxRy7+IzOACRiGD26w3b+M/ya3qf61FtuFigt+GsU+hrUvmX7EgziNN/FXhNQ3d3F+/vqHt6CgNdDY69KrCsZc6CFF6M4G3kGzfRocezsrd2H20Zf3+uDkW4PLn+zVVQETtA1ARJzuc6wh+7yiimaOFerzn/t8ydTiuQHC3zftkFVlM0G08ZlaSdaqgXMQQWp1IXCPuWtvukEP2Jvh5tLwbw5oLphNLaEitAyH/ADzogCjC3IX37GCv/FNJZg+1uDVSxrJLzJOoOb/L45O9szXGuhMmY9NC+BTc3+b6e4NOP+mS+UW1j+jLEn8REf2svhl1swHivYNcwLFoeyTuqGvfhuv8VvuKDSqYwIUkkIINpJtO1gG95opRjP8AGbZewAS5YO7zWFFwCZCOB6Yn+33Nhc8DgDSnHNhXS1qy7SjAmdc/3qx95sSsYO8UNdqOonZ5+jhDfcekZqJKjhd0oSAVoT7NlBRrLyweWLnpgFu/iQMbTLXGRxD9oAr+ZAHgWfMBUawcv//EADURAAICAQIFAwEGBQQDAAAAAAABAhEDECEEEiAwMRNBUWEiMkBCcYEFFCMzUhVicpEkQ7H/2gAIAQIBAT8A63pylMp6Z1Dn+14rYmpczbP4bzL1FvW3cXldtjs52hZBTRzIyyj606aqyaTe25wcKw7xptlI5UciPTPT+p6f1PT+p6L+T0X8jxP5Hil8oUGn51rsMZSORHIOLOIU4Zm27dmLLO6TMPFZNvUi6fiVFs5mc7OdnMznZzs9SR6sh5WPKyM7ejPU0XW+nNwc3kb8psjwvD8iVbpVZjjGMVFLZFFFFaUVo0UNGNedKOVdl9MxPci+pdFDRDx3H0USi2KNEV25EfHR797lV9yQvHcfQu8xdx/gn260ej1vurz2F0vR99kfPdl+BZHyPuPS9bL7bID7j0aN0czOZMpPwU+0yHg86LssfRRRTE5HMyy9EbdDs35SLdHMhSieovjsPpbOZFiKRRXVTKIoZyiRWr1svV60bMafsKTExPVa7aofZQ9X51b9iJyuyitP2KKRSKXy+hDFpQn2X50k60uhTLQ5pMtdj3EMWvOhTh/ki+t6T8lntpY8dq2OE/ZpnqNOpKiMr6vfVa4p88bJSSfhMeaEd6P5iLWzP5uKR/N4xcTjFxGL/I54vxJDkuZLSeiloxO4oVE4KSPtY/PgjK+leR6LWEORNKRJNk8eRoeLIvys5Z+8XqmSp4rqjC7sjL2ZLdDWiEr0WkkqGlBqvDYuhD0QtFnmiPEO1aQ+IjdUyOWDLGov2Rt8IePH/iOMZQ5fYxcNOpSirSW+n2o+N18EXz+1HIcolQ1tZe5GRNKUWhquWKdi6I9C09CY8U0/uscZfDILf4I7xRKck3uTyybQs81GiHEyVWcJFQwQVeVbOKwqE3KCfK/p4E7RdEZopNEMuNZbyeF7Ep87uqXsiWzEVGWzlQlBeK0bWjID8C0s54oWVNlnMro20nw8JLyx8KvaQ+EyezRHhcznFcvloSpJElaM3CK+aGz+CSlF1JUKhPYbTn+5uJqt/JYpQTutzng/c5ofKG4fKOaPyhyj8i8EnSOd/BzTZUvc5Uci0lC97OWS9y5p+WerkPWl8HqJJNnCrnzQ0Y0TxRl5Rk4P3g6JRyQ+8hzfr1/uI5XKcoU9tVpVjgKDOUj4GSQtkRUpPZWyPA8RJXypfqOtKGjlRyr4OVDSP4fH7c38LoZKcF5nFfuNxl4kn+5liv8AVFBrZzQ+Fj7NofDzXwz05r8rGmvZkboujnOZCZzUQjLI3y7i4TI/LohwUfdtmHFHFfKhZX8EZNxss5iyy9eBSjilJ+7Hmxr3I5sb2sz544o2/wBkZeJy5XvKl8Ias9NMnePjsS5t+aIs2RfmYs818MX8Qj74v+mY+N4f3UkR4jhZf+xfvsLHhl4cX+lH8tj/AMV/0LBia+6jikoZYpLZok7R/DFay/scq6Ir7KJ3ZbQpM5hMRjwe8v8AotRqKiyhxM8Jzp3dLwMirdI4vP6fib2u0jNJ/wA3htvdx9/qQnmW/Pa+GYs8MuObVpxbTTHFHKxpitEM+eH3ckl+5DjeJ953+qM3EyyNXFbfBGcXKpNpHBRwxjL08im35E+hsejVjiKM26SMUVD6sU0JoSGhxMmCGT6P5FgljbbaaM3BzUvUTTir2J8LxM+JxSWGdJreiGCbjuqHijjhUTlKFinLwiWDIt6sWjg23Q4M4dNWYOL3UMn7SF0NFaRi5Miq1izHJNDQ0ZJcqum/0HuKKikr2EtjcWLmTTJcNJfmRDBvuxKKGZor7yEyLLVmFbNkjg8rlFxb3j/86opsSrWxEXRGVoaJyTdIYt2RSopDGRgzkHGiaEt9cC/pkjhZOOSH+51rY2Qi5OkKFKitUIQpNEsjrXHESS0ZsiMkWTVokPyyrQoO92QXLjRIjtkwL6p9EU26RCCgqKHEaKEtW9LEyMqFKxE5pDnYmc7+TnZN7DEyO5L7qRLyJ/8AkQXw49HDQ2ctLRYxdL2LI6J0OTJMWjejZRRjilJE3uLeSI754v8A3oelGNVCK0orRxRQ0xXYibplOxatjFq9UyxMUqdmP+5D/kh6KNtCF0V0IcEzk0lKvZidopnKVo0MR76WJlmF/wBWH6ovTGvtrSJZfQ30vVa1oxeOrB/ex/8AJa4vL0WtnMcxaNhIURxOU5RIcShEqHp+Xps4b+9D9dcYtL6EitIsTL0tFoc4jyfQeSRKcn7kXpL7vTRwq/rw1x+OmhLoRZZfRRQxCJeOiy0cL/ejrDwLRd9jFo9H0cF/df8Ax1h40WifeY9WJaUUUcGvtTf01h4KFou++itFrwi2m9cfgX4Fj6a6OFVY3+uuLwxfgWMfS3rw6rFHXH7i7K7MuhaNaMgqhFfRa49E/wAAx6IoS0YiMblFfLLr22+UJxfgyNqVIh50Qu+9Yj6YummR4iHvGvqiGSEvzJkp473cURFomLvS0bI+BrSuiyyxSI+ENaLWxPtS19i+zRjdxWj6V2WyRYtV2LMLW6612WTELVdnC6l0LRiRWtdFDaRN2xdxidMi7SfSyOq0Ylo2SK3Eh9K6mtMUvspaLVkX0si9hjGhLfR9SH00QdMTFqxCK1aEqRQx6X0rsoi7XUutkmWLobI9lGN70V0rqslIfWtX0XpQiOReJFL26Fonq2NjelaX+AjJoUxTi/foXSxRtkvNfgFoloxOS8MWT5FJPqUHInUFS8j/AAFaLRi1UpIjlXuhcj/MemvkrGvLJ5klUUNt9u+yh91VW5UTY2NjY2NilXRZfZvSy9LL6r7H/8QAPBEAAgIBAgMGAwUFBwUAAAAAAAECEQMEEBIhMQUTIDBBUQYyYSJAQlJxFCORkrFicnOBgqHBFSQzU9H/2gAIAQMBAT8A8aGyy0Xticq+yJpKkaynwP18lbpby+Z+QhJM7tDxnAymY4y4I8n0OaNRO8nJ3SLZbOJnEcZx/Q4/od4vY71ex3i9hZIkZJ7Ib5+Um0cbOM4kYXCeOqpGSEGZNNDrCSv1VlIpHCcJwo4EcB3aO7QsaFjFDh37vzsedKKQ8+S+vL2JNttvayyy9rLEyxMl0ESdI4n5yGuQ/KsTJCJ9PKXhTLH5aGIyenlLxX5iGJE/m8pfcoj2l8z8pC+4x6jez8pC+4xEXyflr7kugiXy+Wt2vPXysRPp5a2p715v4RE/Ty1smcmjhOGSLZflIfRC5Mm7kPyl4LOItMpFFbvwopWTSvkSTsqRwP381KxxZW97X4kSYjiL862iMa5sfCuo4oaRXkR6kj0fmreEPVk3Ssc4tMsva2WWX9D/ACOVbRGP5fNXTbHG+ezV8iWJroOLXVCg30KHvfgiUT+VeDgkOE/yvyFtiX2UUdHtS9RSoUsb6oeJVcZWhxrflvH5dp+ng1GJY50YoSlFq2kLTZJOrFo5J1I/YJN8qQ9BlHosqHpc6/BZwSXWLFBuDa9HtifJoTGt5KpPaMmjhU+hKNeFfKIydd1Rmzd605RqjFkUE0+jIajCqI58L/GhTg+kkci0SXMxJrUKN2auNOJPH6ohKpCezG+FM6ji1spOy3NO+qH4PRCJdWPeWjwyvlRPQRSbU2LQzq00yWjyr2KYpTXq0KU/dnf5q+YjlnDJx9WavtXTQnhx5sijLJKoJ++zjGT58n7jXAubO8OIbbE+dFciUSNppnu2h+B+gh+Ba3D9SOpwSXzpEcmN9Jx/iZZVHkrMi4cs/wBTHp8UoQuCukRwYo3yuyelxyknVfRE9FB20dv6qep7W1MuJ1CbhD6KPI+H+2HqdPDDqpw76KpPiT4ySp2U31HjYpNMyYZ/s67tLil6nB3aq7fqyLbOpJyi+URub6t7JPZE/QW9WLHP2JaaUY2UcEquj7S2x63NGlyI65/iiLXYvVSRn7Q0+LT5srn8kJS/grMknOcpPq22yDaaaOyfifLjUcOrvJD0n+JGnz6fU41PBljOP0PtJjjzEv3UX/ZKTkvqOL6JcjhonGb/AEODIvRnDP2YlP2Zwy9mKMrXIl1ErFi+pwRQnCjjZ3+T32hl4VVCnCXocOOS+VCwYhaWHuPTztpUz4jyvB2TqveSUP5nsiLNLrM+nkpYskoS90zQ/Fk1UdVj4l+ePJml7R0GrSeHNFv8r5P+DIpfsyf9gkkn0OpVMYupdCmWXZLqLkiLHzZmnjwwcpzUYrq26M/xV2ThyOCySnXrBWit0zvJ+53k/wAwssvc7yXufGmetLpsV855HL+VbojF+vIx6XUyScNPmkvdQbIwyYU5Tx5ISppXFrqqNFq8sfg5Z4T+3DDKpdflkYPijWLllxwyL+VmH4k0M644zxv9LRDtbs7JVaqH+fL+pjz6afy58b/SSJSjfJoUXKjuju2NUcNms1mm0cYvPPhu65XdGb4q0OP/AMWOc/8AZGr+LtdO1hhDGv4s13aOp1vD32SUqXuOCvkzJFRm0cLZwlFFb/Fby6jtLFgxQlNwxLlFW7kzF8O9rZFfccP96SRqewO1NNjeSeC4rq4tSo7M7Nza7OseNfWUn0ijs/sbs/QxXBiUp+uSXNkZJMeR/Rk4Qy9l6iPAuFwmmjJ2boWn+4iv0tE9Dhk1BWufKiXwhNq8et5+0oGr+Fu1rvHPDPl6fYM3Y3beHro8v6x+1/Qnl7Rwcp99j+j4kf8AUtc2ktRk+iU2ZdX2liklLUZWq63I+Gaz6XLlnNyyRyVzf0IrnZ8ayaei/wBf/A5Mk98jvJJ36mOSSLTHFHCUNEsnscCdy5W+vuxCZptNptM8jxY4w45XKvfaTpWzCnLqkYKeizcl+L+hl0unyJrh4X7onosuDXYccqak1KLXqiORoWWJxx9xuD+ZJoy9l9k55Xk0OGX14UjUfDfZPXHjniv8k2js7seOjeSUNRkmprnGbs1MNTjxt4cUckvyuXCfEmo7Rz58a1ellgUE1FdYtv1skiW1CW6bQpnFEnJyHFjsss4hZZQ+q9h5o5Ekk0yGaNcL68uZh1GnhpcsXljbulf0JZop8nZL95nwSfVSdb8SRxxLY5P1ZDPGMUmh54M+IJxnLDFr0ZreypSUsuBX6yh/8JxRXgezpIbL2ZM4xTIridWkJ0W5egxUd5wtNejI6mMvws72+iHYlZH2Gho4XR21L/uIR9oml52dv6KGDULJBVHKua9pFFbok0hyb5jYtmSJxpiIrltzSJNlsiiKONIWWPuRlez6bI7Ynxa/J9KRpOh2xg7/AAaqX/qxKS/iPeiclFWxzt2XeyGxsY0cK2ijI6JNsSIoRKIkQEW2hSp2SyQ4bUWayfea3NL3mzS8kzJHi0Pa0/eDj/LEe8mkrZkm5sssTExsvZjEjh5Eo2OLW0ItijW3ChIW+SXDFv2RCV5Jy97/ANzByhZw12JqpfnhkkPfUT5qO1MoXhbFzIob2YoiQ2WJ7RLLNfNrS5q68NGnimnaJ/YwTf0NTDg7Iyw9tO/6D3yO5ye172WKSJVQzGmzoh7oQ90xDQyUVJU1aP2TAnajRqdPahBLlKcUztFVoNV/hS/pvJ0mMfkMjNxOOy7ErKLLL2TI7vZxKO1OXZ2r/wAKRW2T5XsyivE/JTER2a8Pa7rszWf4TK5bZei2e9FDRWzY2JnEcQ3YpF7ISELr4u23XZWr/uDGTJRGvIaGiijhYoS9hYpCxfUWKJGEF6E0tl4viB12Tqf9P9Rrmxol12aGitntWzKKEihbp7S2Q9qOEpnxJKuy8i95RRJc3tIez89MQxbrwfFTrQY175kPoPkS6/clsxCG7RZZxnEfFU/3Olj75Gx9Bk+pf3FC2QxMfg+J5Xk00faMmS2n909BD2vwfEc716j+XEhjRP0+7S3ih7ds5OPtHUv2kl/BDGSH9xQt3umM5UavJ3mozT/Nkkx2tn0GMfnoQh9BvdDNVl7vTZp87WOTVfoLTvJSU0p8/sS+y/8AczYc+P54tI7K0mHJglPJJpuXLZjH56EiKMj8WbEsmOcJXUk06NR2LrUn3eeOVflmjVYNVgTjPSzg36xbow4tXKFwwZpL35/8Fktn58doqkZOomUPwNFLbhV9R7vzoiW0934E97TY+o/PRBCRJk2Ktn4FvVDHvW78lGOPK9mSYh+CvDLp4khryEiMCKpDJPahlbrw1Y/DElu0UUUJCEXyGyXhfiTFRJcx+BD8KGtkIb5DJPn5FbosY/Ah+FMbvZCGMYtqQ9q5COm6K2fmIREZNjFsh7JqqENWVuhkvMQhDZJ8x+B7MRYmUcL2bGxxfoX5SFtJ7cPkvaxvwNFHDL28S2TEN0dRoTH40LwLdvaI+F9TgvoNNeLiSLt7Xs34Xve72tvlQ0PZD2bHT9BobkvQ437Cc2KL9d68iiiitnshj2SGWPZ7PxPryHZzOZzOZbLZbLLE/A9mRHtfhSK2prdrwUV4KP/EADcQAAICAAUCBAUDBAICAgMAAAABAhEDEBIhMUFRBBMgYSIwMkBxFEKBIzNQUpGxQ6EFYnLB0f/aAAgBAQABPwL58vqY4pmhkovt8hmm6otvnKP2r9Hi38Oby8H+5/YY0admtCarPTHsKETQjyzyzQOJqpFZIXH3HjXtm8vC/R/P2GN9DJaZG64PNPNRrRqNRZeTGrQluaUmQw4SZ5UaFhI8l90eS/Y8hnkyPKkeXI0SNEhJ9jTLsU+3q3KZTGbmmXY8d6cCD8tfYT+lkoXY4zJWMs1M8xnms848485NmpNMs1WYexqNSylfTJfIaTNitio+xpj2HCHY0ocEOEOx5cew4x7Hj/qSzR1MPDqKX2E/pY8pIlCJ5SHg+55UjRPsaJdjSyyLNZrkLFPMZ5rFjM89ix2fqReIP1J+pP1B555yPNR50TzEeZHozzInmLueau5ria49xzj3HiK+TXHueOknjbejBS8yK9zzcNfYPiQ9sn69h4UBRNCPK9zyZdBRktjS+xpZTN/XZbLZqZqZrkama2a33NbNbNbHiMbub9GF9aNT+w7ksmPJ5LN5KKZpIqvRpRpR5UTyIHkRP06PIR+nP04/D+7PIXc/T+5+n9z9N7n6ceA+4sCNcn6ePc8iJLAMXDSXU6v0eGhqkxYMfsZZMfrooXyL9Nl59S8r9FjZ4l/D6fBraT9xfYz5Y8n8pfNsv5NZeMfwiHn4Vf00L7HE5Yx/d38hnjZCHwdCzCVYcfx9li8jyeaF6V9yzxn1CGUdRfZYvJLJ+hL0Ir7lniXeJl0yw98SP5+zxSWT9C++lwYz/qCdEpaqOTw/978C+yxehIfo6CzX3c/pJ/W8+Dwa+KT+zxeCQ/QhffYz+Bj5ee54JfC37/Z4nBL0IX3/AIn6Muhvl4X+0vs8T6SWb+QvVXX7PxT+HLtlsYSrDj+Ps5/Syfy0PNfa+Newjrklb/kX2b4ZMfylyPn7jxn1IVZ4KvFh+ftZD+Uh/b2eLfxi75+FX9b+PtHwSH6ryWb+3Zju8QXI8vBreT9vtJfSxks7+Q/t5bJmJ9bZE3y8Ivhl+ftXy0NNZX/gMX6CW8jjJuzw39pfa431CkOC6Di7zQvkL7THfwMt3Ras5GYSrDivb7XG5JCxO5aNCY4Mv0J5LPj7Txb/AKbORQ7s24Qlul3F9rikkSizgWIa0yos8tdBwkunyK+z8b9BZbWWFvjQ/P22L0GMcUOJwKbI4wsRHwyPKXQ8plNdC/tWeOfCF9Ru2M8Nvi32QvtcXgl6JQs05qTRHGZHGQpJmwsKB5PZjwZGhlP7Bni3c0K9h2WeCjqkycdLyor0dfnYv0kh+istCNDKeSk0LFZHxFEfEoWNEU4iplRfRHl4fYeCulnkf/Y8g8iXseSzyWeSzyZHlM8pnlM8pjw2SwHV2eK2xhSJT2Pc8Dh3Fv3PJ62zy0ikWl9lifSyQ/k6UeWaGaWblmqQsWQseSF4kXiR+IRHHVcnnxPNh3HiRFNdzWu5qXc1xHiR7nmw4s1x7ksSNM8VK8eWxXFFts27HgsbSp/kXimYnibruPGkeZL7Kf0sY/kL06UeWmeUeWzQzSzSyvRbLZqZqfc1S7mqRqka5dyWLLuOVybJmH1LMKNREmaDyzy19kxj+RfoWS9GxpiaYmhGhGhHlo8tHlI8pHlo8qJ5cTRHsY6Si9hDSpkeBb0RWdfaS5Y/Ty6Hh8b0a3xIxvGJSrD4MPxkJLfk1FieSZfz7y8S9jc0/CJUjCV4sPyL0P7PE+pj9K+tEjHk5JqP8knl4SerC36CjHuzy10keViLsz4lzFikahP5aknxmzxb2FwS5FS5MBQ8zZ/cY31P1fuRj49/DF7dSU9tqJYb5PK2PC/BiV3zuhYs11NafMUf0n+yhQwq+uSNHaaNGJ/9f+TTif6mnE/1Zb/1f/BfsyyzUOaSZHEXuMeXimbFp5eF5k/uMfn1Y+K+Il7ETBrSxqLF4aCkmm+cryT9dvuapdzXLuebPuebPua59zF1PS3xe5J7F9MmeIasiill4RfC37/cY/px8V/RH+RqjuWYGLWzF+crLLEL5K1dc7NlwkfuykYz+MRWWAv6SEXz9tj8eiUqi2VuM3yw7ZrknsRxJixb6ZWKYpCkJ/M/flicMn9WTGYSrDivb7jH/wD0PPxL+BL3L6DWcXsdRDTizzKjKpe45R2Zrae0X+Tze5HEi+omWJ+u1kxfVlj8D3YryrcXqj4jxH7lE/Vy64R+swk97QvE4D/8iFKL4fzWrMSLSVsefiv2jYspCZHfJSvkx1+9dieJOTe5gwc3yycZwSqT/kj4hp/EkyGL/qYc9SExZX648vLxD+E6n4yw1/Vh+fXiVNLfcp7bGNhxdUYeDhWfpsF7nlqPEpf8nxr/AMh507a2dEceT/YeauzFiwfUUl3zeevc8S6w79x7q8/Eq4fgZAY47Cg+wlVDdnUxLWGx8mFPRK+hjY+tVHJTo8P4hdUKSfAvkMjl4p7CLXQrY8P/AHV6FyMexa49y2luNx7bG0nsavceI+4sWV8knepnmNKjzJnnSo12/YjjOK6n6jF7oXjsTrFC/wDkofugxeLwX1Z5uBL9yPE74GJuYOL0Gu2Uo6otGnuVlSQqTGMi9ybuDI4abtiXShQjXBi+G6xEIhjOPPBDH+HuKVi9TI8ZeKZWxF0dTw31t+3owlchjFL4up50STUouhNI1D+TJCjtuQq3E4J7p/gvSzDxSryx4/FffOiPuPvk9VkpOiOJJEcZPkdil0MVJXuJoshiyizw/iI8Cdr1SFxl4piGqWXhf3etVuUuw30oeDBI8mh4b6GiZUux8Xb0cZS4OEYf90dIsxOSMjCxxNSMTC1RaJepmK/izi3HrsSSrbKmsoRc9kiUcTDavY8LO4L1SE3cl/wM8T9WX7jc8L/b/n1Mi5LZMjJ9dzUbM18XY8SPKPMV8oSWVblQ7Dwo9hYcSStdDyF/sSwZLrYsKGHH3oxOliruYqKLaTfuYWOQxkzxKqW3U0pjw2leaMTErZcllidMg9ySr8DjX4N28vBSgpO3v0PG4uG4qN2zwe0L7+qXTJ8HiH8ZZp3E9zAX9OObfpvKPJJ0ambmuUWarrc1URlFqxyTOo2uTUKURPVMlCLXBhYUd9upjYca+EcTqPqRxWvcnPXH8EIxl9bodv8App7dZE6jOkxMc3whPTdc98oOv27E4pS+F2nwQTTuuDzN1sTdt0hxooow8GWIzCwqrfj1SvUsnwY31iuzqPnYgqivWl62YVaIlRycpVQ6KESZHElHYWKhSVbZYkBk+5uLDqNt7mLPt2NUj3ZqvYT2FuYOApbs8S4wXlxX5EYE/iruSo70XuKDxHUTC8HT+JCwoizSNN8kVyfv/jKXBi/WxsjKjD+Kf8i9Ok0Gj3NMuxKMv9R7DXsUUzWlB2jwuzmWjq/XQsqw65MbCr8EouyWzZuxR2sxIU6ZRIQkX5cUq4jbJu28sGtW5H6/5Kgm+3uYsUpHhdsZCl1dilE1R7otdy13LXc1Q7jl2RWTrqT+uRITPD/UvyQNJpKRqiiXiIrqS8S3wSmr5E1lp7Cy07Hl9zaPQkyblHeuRT9vWs2NGJEinEWrgxHK9xMmt7yRiTct2cmlfyVoZGW6JYl7dKJ/tvseAjrxZPsjRFdTSmeUmzykeUeUzyn2PKmeXI8qRjwmoH+2UeTwaXmW+xrgiXiILqS8XHoPxM2PEk/3Dm2N0WJ9xTvYT3HiSTPMVbmq3YsX2Nt8sRRnLdkdLdWJKQoLsaInl+5oa6+txJQHscsmqb2HdFNCJkZOJFse5pIbK/4JvVIwcXyo1R+q9heMifrYH63D7n6uHcXi4dz9Zh9z9ZDufrY9z9cu5i+MTi1Z0sYuhr0/uo1X1bNXsSe45JGv2PM2s56iw9jyyMabZW9sq0Vl1yt2P6r6nBGWkc99hMlxl09bQ4Dwx7p6kaSrYkSWxTFwWfF3ISpST4NhlM+NdWKUu5bbyib9zd85z45NL2JVwYUX/wCiXIhLYlsMgquxxVIrk/ktLk63eS+HY2rc0opDXqoumb6uSPyaGjyyWG1uLgktjC0k18U675UyhXQrNx9xU0I1H7UJmzJZcl9V2GQTL5I11ynqI8ZKMnwrIeFlzI+JMTtPYSrqeckyOJaVlI0lM6jpfUNJ8GkorcZpVjj8Qvmfslt1RJGmx4UhxkUXWwpFsXuYei9+DErhGxFlJs0+xoN9Q2joL6kbtHlkYm2p/k2LKk+hHBl1IYGHW4tstW5sM2Zp9zePuapnmM17pmq3uao9jUjpYpiaZ8I2l8izf8Fx/wBi4+5ce43qf1E+hHKhwvoPBieT2PKdjw3fBol2KdPYfBFEEbCz4FbmNbENT2ojhUeRfUjgpHloUSs7stJlm5pHsWWUjbLqdTSdkN1Qp+xqv1/9HxP6UaUuf/ZFKmS5KHhs9iUnGLaP1WJ7C8V3ghY+H1gebh92i4P96NP4Hx/br8Gko0Gg0mg0mkcDFVIwtpFJmHttQyiivV8OpahRs42KfcbzRJlllvKvQotmg0IayZH4t+hrROaIyJq9yMviMXF0x9zBjianKXUxv7byQh8GikcHm4lfULxGIvc/Uf8A1POh/qLEw3+5lr/ZFPsiMbdUSwttsOX/AGOLXJiLYgvjEiFqXJJ7fJw4JttjjfBtqaz2rkooaY016WyOG3yKMV6HlKNnBsOu2Tb7GHg4k+I7dyPhK5Zi4KjCyGEsT4WT/wDjY/tmT8HjQ6WhHWP5HRNejodRsUpdDz8RdT9ZMXj5+5PxMcRb/wDRBXLYoQ96+ThS+LruPZmL9f8AAypUWzUyMkajUNblPtko2yOGo88jYidojO/S4Wbp75I8PgX8T4LobMb+2zA+rPxWAt5RQvrRJ9RN7mjbkYvwIo0lUMZFOrI8MjOUeDzZdxYskRxk/qQqf0v5F+xqJTTdMlFNGFpGokkmhxfJU+UKbsWK3sLGIXPgUayo3Q7Yo16aJQTJYckbGDXkw/BLYRiv+mzB+rPTs7MSOjFkuxrNaNaOo3v7Cn0NffK/c07cktV0dCDtZrKDceCHiFLaSOC/THF9xYtTroSf7kLFTfY26HHUSV3eckn0PKMDwzk7ltEVRVJZUacn8l4UJGCqw4r2KTJYMehPw05LZkPB4yfQWA+rNCRIx7eNiX3HlvlhYGJP2Xcj4XDXNsfh4MeDKPG4pbnmM13s0TrZLqaGkW06Zv3F7kpLS8mYPiK+GXGS9FSrkWoto1I1fCScy33MGTkrcjEnoZhSUm1Rh4Vc+uS+TgwXU2FJ/wCpzlt3LQ2SPHYKeHrXOdGD4VveeyOOM6ZjeHU9+poe5ub9hvsbkWRn3JKlzmzwuNfwP+BbeneIzTlbrkfuYcnEcnKSPDeG0fFL6sqKKzeTj6KzjDUykkUM82PcTPhLQ7HEl9LPKwZ8wR+mwP8AQWHCPEVlsasnOtt8vEYf7kaShooUULSOttsmMw3UkxO0n6aNL7FXwhodl0uCEblweH8KofFL6v8ArKvWsnH0pWRjpWbKjZsbGw2S3J7qkKKWTKEjT6Jq4tDKJ8iW4xHVZMZh/UYL2a9H8ZfT0yo6FNnhvDeWtUvq/wCvmtejDhWbYxl+5fuao9zX7D39Dzo016JrTOX5N0TYrjuSd5Q5ykMwuTB/uei+wnQ3ayalwUeF8Np+OS39b+RRRhw6+iUsmaHezNJXy7T5GhonXnMemyOjqSac2UMw+uTGYXUwP7i9FS7Z9svCeG/8kv4+avQo2yqzbJCsrb5NeuXBP+9I2cx7cDu2KTJGF9Ix5Q2gYD/qR9D/ADmkeG8N5ktT+n/v7KKrNsbG3eV536KKytGxRQ8pDjcnZoiuDEjJRZ0HlHgfI8p7QR4e/NXqs8PgPEn7dRJRVL1P5eHCkPKTJMxJUiHG+dZLKis5WRrU1IxIKO8dmLNokSnUma/iJz6CVv8AknhS/g0/FnIRON0YKrFj6Eh2uhTk+DAwlhwS9b+VhwvcooZJkmL4nbEnkzcoor0Sm7UY8knOCt7lynuoqvcw2nfw16HwPqY85LFaPNX+piT1sW2+oeIq5FvPJjIcoxH7mA/jj6Oepujwi1T/AAL0aiy8nH5MI0hjJEmSbbpEY/LjhvzJSJ4etUStbRRCGlFDykdzxP8AekPN0YXXJkjD5JO2YD+OPoQ9zwcfgb7sWdGkorfNor0XlhK5CykTZOVIh8qvkzO54hf1ZFDSKTRQri+DWfyNmHwxxXQwP7q9GxZgKsOP49W/o1Z0aEx4PueTLuYUdBqRZMxcRaqF8TK+yZLLHf8AUkVW+S3vYajpqtxQ2HBm/VDj1I/Rlg/3I+mKuSXuL5FDiUbFlsi9vRRuNMxcKd8EY16dvSvksfAjH/uy/JGq9xRRpXTYjZq9hq9z9tUcGxSMONTid81qcXseGi3jL2yXyKNJpooorfb5GlDw0PDfccMS+hUuxTKKZXov1MZLg6GJqU5/nJRxOUKOpbo0yW7Q1fY07D1CvLT7mH9cTvmqVnhY/HN/Jor1vf7Db5DGTOhP65P3Kj/Im4posUl/Jfce1HJpNOSXxxO4sup4b6b980L10UNCRQ9iiiiivkUUUIa+VM6EluX0aN11FfXLZrKy2WK7I3rR3z4MD+3H0L5NFZVbKKKzorKh7ZV6KK+SxmI6w3+BnR75L2YklfcSz3H0yh9Z39ENkvQvtKKKK+Y/RI8S/wCmRZq2FRTFyXlHdjRpKIL4jvmvqRFi/wAFZZqL9Mupj/QLYqNsqkXtWSobMLk37nFGrcj9XogvjiIQmX8qy/n2WOQ38ufUxvo/k5solYi6Ki2qaHBEKyaER+r0YS+NMWayv7G87LL+wmeI4X5N+wudy6/Avq2OuSxK26FLlZPKHIuM8Ctf+MkeJ6EnRBjRumPVHoOd5ahTLi8odTtn4f63+P8AFsZit2iSOiroR35N7Y5LsOiO7HDccVEvYjsyHD9GB9b/AMWyRivehpCSG0bs0lZXIpplLoUQ+l+jw/1P8f4p5SMV/Gy8tJpKR/Ho3rg46kfo9Hh38b/H+K6ZMn9b7El1iQlZY7yq0JFWcD34OUL6V6PC1rf4yYoi/wAN0GS6k11sd82dRS7DyTLv09I+jwr+MX+LnwXY7aPLKrY3iOsrZdn4NTy7ejw6SxBf4l5YrNTNzoSSZHZn5KX8lPLUNiOvowmvNX+KkIxeuXY5ESXsM/kUrG96Kyh9R39GFtiRF/h3lLLGeW9EddiXvk8vhvqLkkIw3cvTH6l+SHH+HeTe5Zj9BVQ+BbIjQ+R2PkqxXlsYXX09jDe3+GecssRXJDruci2KWTVnYcRja7m7I/Q/SomH/hpDHwSylyNG4i6FKymKuqK9zSvwSSHsxfTH06pGG/pF/hmMYiXLFnp9yl2yRWUoyG3Yun49MfwRdoi7X+GZLgYizasvwJu7NW2SW5ItGllXiLYpGkooiviRu1uRVEH/AIG8n6JDHtHLaixcnJRQmamzYt9CezTEy/Q+asg92IT/AME82PKRxlubZJsvoKHuUO7NaI/k6ktPQo1e42y+RNcVlB/4WWcyQ20xRHEVcMcaHk8nBM0tPLSIe55caElyx1d5R/wt75dCXI+DlGtrYjbKpl2VsU7GvfJJ9zglMjutytzY4Za3Q9IhCf8Ag5vbJjJP4hFe5KO5tkspLcT6MpibKizTktj+BN9ao0z5JKjD+nNMv755ydvJjHzkkbMdEfyRo6j3NJr24I2aulFZUi92dKIT+ExNL/JAWSyT+9eTexWTJmn4hl0X7DSfUewtkJWRe3JqoaTFFot9UbV7jaYxO8vKjRSQvq5zWS+9ecxcZYrLtmm3uxp9yCT65PcsRHkkhIj7lj5HpvbgVPplWTT7kY0xZL79jeUs8S9SF+BEttqFVcHJQ81T6m8Rbkthe417lGlPhDe3BeU8ToQeyyX3zJyFkx8DNmR2bEOhlvKRpFsaTUzS+T8vLcZ8SN5H5Y3Zt2IiF8qy/smyc8o5PKYkbH8Er7C5Ip7iVj09zjqO8vce25dsfJ1y42y5T2N4lp9CHPzHznZZYmWX8pyHuUVm8pvY3NkYicqo+KJRXVGxQlRuythRlyiSER35HIvsVvuzdFbHJR1QhfKkL5Nlmo1Go1FllFZPPqMveiXOWvajocrcs4GxWJWaX1IyGNXwO981vyVTL3OWYiXTKD2yXyZC+W0L5DEPJjksqR+4lGOnZisTW+SI2rZbs3W4+m25cupuxoS3G2KzU4po0+xui+uUBC+TJC+yfqfBp7m1ip5N5UUOLsTqItnY5WP/ANjeu0JVIvSd6y6ZSvuXLuVMp9RNKhfKYvlsg+fW/QyTy6nGWkXQbLFd1eTp7HBFvuXT2Eth6rrqKUFXNkmpK0UqFFjHubjZsYfHymR+WyKzfyd7yVm9kXlaXQa2sUvYiyL9hcmqnRoZL4WRns+5Otn1JMhOjZmlx3ux7IhuPklCK3KizDbU6yXyGL5lep+mXAlWW/OVU7IT1/tyrfgrccdh81lPmzDlbGlQ01ZA0WaFGS22JKK4N0txkLQ+RydESXci7XyWL7NiGIxHuki32NEuxwIj9Re7IYjWzGWbjSNtRjVyjD02SmqNWwiGkvlGqSewrb+JDshk3sQJcmE9vkv7RiGPZClbbE4r+TdPnJNUUVZQtzYbpmq9jTLqeXfUeGq9zjk3ZpkQnpG9TIvTZGMpblsdEuEUmJjFcWRd/eSzxXtXcS9jTctxyjp0o42KsUedy6G017kd2rGvi2IwUnuOGlltl1Z9Q0aVq2JRpbMitXKNO9onyYco6e2f7XlGO5L4SW5h4lScewpfdvJkt5Ia3NL4NG5O9yN2R2dnw80OtXwjTiR5EYivc45FxyR25JfgoXGUUuhiKxIrsShVHItjTKyUbY0xujDxRSL9T+1xJUhVKPuK+BWKOo23s06eop+x8KG9rEpM+lkZJciknwSrobFKmexGVHRli2eWn2NQpk2hM0NK86Vkoq9hTcSOImJl/cNjl1NNU0Pc3NTizVqNhqPGWlbiJwHFdWQgx8lFMT23NsnXQ/bZBJxs2ujgrazdiiJ7CkS/BfQofI0Kc48EcfuiM0+H9viSFFi4OuUt17iwproVIe/5E72EyKOHySWvgU2rQsWVZODa2YtuokSfTKbfApyWwotq7OTS+wpJQpLcTGV1y6jy2yad7G6PPlGupHxMOuwpJ8P7OcjmQ3Q5sW6Iq0JuMiciMeo04sbU6NG1pnmM1qUdkQ2Z8N2kaIkexx1NNnUvZiJYTZppixN6oQ5t5fDwv+SUaZdCY7LR0LEzcbscetFIi5LqR8VNc7kfEQfOxa+fOeSSKQ6KIibbE3YpInK9iqNnuaYyFcD3KV9jE9i0RqRpJRV5U1RqGl1Hh7bFbZp0Ym6ixyo1ol8RoVNnsQgcs6JFD3yeG9jRIo1V9LI+Jkvq3I48JdSy/kuSJyvYYhIee3c67H1qz+BHKE6KNNjhpew4yI9hRuQ63QnvyVsdTsXvuahWuDqJM2cT9o/pZpFFEW0jWUNsjwS9hy2z3IujEg3uONclR22GulEZYkeosd9ULEi+GaiyyzUhzHiDZKaRTe5TSsuRb7ejkVofcv2NPUdFI3RakKr5GuxGEeo+XSPcUyS6+iOmqEa9yviJJRiKQ+ODDlGnsrHPlIvfOmad6Eug4+4hiWwpt7GnUbdDnk0mk8vqKU11Fjd0LEizUahyQ8aIpSkKG5Ww9hF9xRyS9y7Ogh2jDk7o2scexFrqVXUfc1OiMu43pNRHkTT2GMdqLG8unuIctqIkuhLnLZmliZuRXUlKhYm1D4tCbP5NOnJJsYmWWjY1LsSS27FFPqUTgtqF6EWXlFW93XueVGV+XiJ0m6p9DyoVFyxFHUrS3b/9DwVCXxTVValvTQ4asPVHEi0mr2a5J4aw9G6epcr/AIPLVJzxIxtbLduv4Hh1JJ4kUmrjLemSwPgliLFg6/Jpwa+LGSf4YvDtOtX7Nd78Eo3CTWIpaeVujAwHizrXFfkhF4u62XVvhChPon3/AI7kcG+MaCpb7S//AILDcrnrSjqq99/wOoy+vV/DX/ZyNSRVko9ixzutjk6InwjplZqb2NJXOVKiXJGRTH7FvrEsX5L7izoUY9SSoplIdUUVkpbo/g/CEuT2KTMKWjETlG0nuiWNGcWpTxvxar/0SlhS0alO1FR+HrQseCl9DpQ0x7r3MWanG9eK/wD8pWh4kJeVqT+GLX/JrwpKGtS1RjpuPVEpxm4KmoxVLuPEi5RuPwLiKFiqGHFLWubcK3MPEWqb/qbxrU38SHj/ANOUHLEnf+74MLEUJwnzTITlHDjhOEGl7GJiKWn4eIadvya4w4njV2TR59qUXrgnNyWh1z0MTEU1hx+J6b3k99xaRy3IxNVoZBFpEq1Emmi04+hpWWcbnSycbewhOkJ6RNlWaN/YruJRaHGixGobVClIT2HXI5aSOJfQ0rlsm43sKTFsRKrkTaNmM3I5fwaLKZTFxTGcitPcf/ob7G97nBZuQGKNPkpNj5G+NhV3JbdcrHlvQ7Gth7Gqkb6vYT4Y2fDpEdT+NiUHESmbMtXQ8km98pXwcPcjucxNPsUJkCe50FlRSJbLYpsunsSdq0amWy7Stll+5B9GNco5NJQm0dTUj//EACkQAAMAAgIBBAICAwEBAQAAAAABESExEEFRIGFxgTCRobFAwdHw4fH/2gAIAQEAAT8h9U/Dl8vEeJi+Q3OFwlxWWsiyBFBV4GzTpC4Qi8LsXHQhtcPRBP1mRcTMUTseBP8AAGT9j1NzhGNJj8A8IfmPmWixom8PuNqNnRFQLmlKJ80TKUpeKXhnfOuOi6M+Fnz9J8T8KZPBBlF2ils9wsJSH3wQTEjz2YQnAmB4jMj02x9bzzg8LX7HHCN+HgXhYraZ7bGe36Gnue8JvDI/HMo0F4j2GI1mM+DMFoZ3RkmOIKelYvV16coFNZG7oYTiX2IUSQSEKsayntQavKbpbSC02xJ5ECdGZQIZG+ElRtQwhsWVk3IqTwsExfBjeAvGEMyKLwU2Esg8oamA2pwxPJtILmaQ/Q9i/IEyIfQ10bTwB+QaPMTg0dMTNscqV0LqGdsXkEa/Zk2dpibl4vQjBrJ9jYt9HviS6GLZMYhgtQ/EMIVgowOSbCRF446g01qaJCJmn6GL1P0ZfcPQ3nixFYmLieBA4jDBqxS3rAuNMvG9szaZPDiiMmTJXMPynvnuHvnu8L3T3xiqnktW+zHHg3D3B+h/iZ0FJyIbPJcbiEDxkbJYIPcXER7B7JR6RToxwX/tnzDT3HjtiE12ex4mIuw1MBr5fGbx7wPeYmqNjaw13dmP2PeCo+AI8Qn4Vr19x8ik46ELhoJ6MIQvRRBMTEx9F8G2UqEFGH88Nmz4puKv9kiFgawfNBpw/SuV61nycGbcLshBIVQxF4JCFzTIhFKU2GG+KVDZclOjajNUXYmjCaHXgh794L8T/Dhi3wjAuMQ0hMTExcr0riiZRmSqLkpS54uC8xOBrArokfYUfD/KzaYjNuEN6EEsPguFRcL0ITEY9KLw2UvJwvZpwVafIsX4Xy/V/TwZtyhS4RkQeQuVymXlCfE9VH6GwIydEqwacckLT9opPU/yJlfHB8lxpwqsiyLQhKehPhcUohcMvD5zfS8YQ3GdmiBpmC/QWp7G/wDXqd838pPhaNBxCeGuCFv0IXF9VwXjI+WMvLxh60caGmJ6Ffbz9iHwk68/n0ckoxHgYMonwvQhb/Ghv0v0SJr8x1s9kPM+TcH+FC5fo/v4d8PfIxC4TM5gxCYt8Llep+hcMfDGjmfBUwuxVlbFnv0qY/8ACO/HYgsGmUWiiYjce+ELiL5E9b4vofoZIqRq5Ouwk1svgTftF+R+saC1x0LhdcQQjZGwvwOzJni8T0Pl8R4ex0Yntx+zBcL/AAf43pEQQjoT4bgLhcL1X8F5Y2PUDKi4ERXtf6z6X+C+t6Zub8pPjrlZ4TJt6qd8z8bGMYSEV/oXFnYvPRRH4Z/6/F55Rr1PGfO+E98oJjZGWP0l6kXHrvDHyxI9ZPSEx9j0fVy/fpfpn4v4nIzoYvC4T9BcLlehfifMMDKzp4Gcr8mWXwpO8/4lyCxnooXXXD4IoiiZ0IvCELhM36L+B8saMZnyKJo+yj4JrN1+l/4H9BkaY5nAQbAipIoZ0W8iyIohcULrhCH+WnkgWwEytew4mPA57dJ/gv0IP5oenBfQ87sSWMkd4KJifoC4biiLzTv8N4ueY5CPQWq6eRtNMGPzSXCmxp3eP8LdfAhizE2w5bEwo8EOYOWUMxl8GSiYhcSrIoSE8b/wnELN+hIKPLGvnexf2H6FopnEHwuZ+XXhYYHo22InkHIYspMe138dEVhpj3mEKIpRP1X8TRFV75Wy10VeDsxo2Gh2MSn5F6tfzweyjYg2uE/B2wlsd4SOsxjHsO/9gj0n8D8bICsMlKU2MvofCo8DEn7EFWp+xErpljZHrGERFbgSZXgr/Cf28GLwngYSTH4B0xxZ4JE1JjgNSMzvca1yYTbPoT/H4ZhlP/5EzbjU8jhsfCZZP5MrwYtf0e2/44/bIsSPi4VsSdhN3s8qv+Bd+XR5T/5Eson5xO4/GmL8SFxeMJlExQZNJgyDJJOhN5FLbE8UUbHIQeSKTsVWWKga0zwZ7I9seViVi2Fo2Q4vAbQUuw2WTK/kULosYCFutf0JYQyy6ZHxs7H/AIP8HmXCIMTExi5E+Fno9k63D2mPgvZK8GSsr8nvHvD8rPfD84mtlHtjQEE2GMMtsyQryO10R8f/AKNaTG70fMXm/H368k/g7+oxZK+0IUpRijlEyk8D2OJ+oI1eA9sj0Pwj8MwWEyfSBZ9xbXttLAhJI1wqG0v8NfSXodR5FHBdAnHkg33N/wChWTS9CVrDErPcE+BBMomJlKUbJXninXDNc7GTKbKZkwNmy43/AMBrPC5FobNub6X1w/w4/LwQuOhwaJNKj8MPbyUw9ojopa3abG9oF1/2L/QWNah9CHpiQSKFLxeLw+FLfkNjZoVw8CJhm9zSGcc4vAsC2Uf+LGafC5vdBG8lo9oWaRN+RO0fQ6y8L/JhcJ4hoHGnn/Q4T9DNMx/A2mf84FSVvcKvy6a4Lw4Xli1v9Ava/wBHxZC3f0bwx7DKTmWm1vgyG8GSCYq+B7E+ohZ4rvHf+H/SMezxzuXyzo9iu1IJQvJ0iyYyup8F4XgUFxBFa7PfHvTzckvflDOs2ddvC+S8ttcajDbvXg9zJCz9iXyfJAtHReGsf4fV+w+OytFVfl/o0F9jwvKitbMi690Mksq15LwgXB8xMTnN9EJu2+uuKaNdF0L4Q/5rjUc2VG9jAbJfazQwSefRSlLxfV1y/RqHwj2sQ9n2M79F8BrwI7OvJAyvsRZ/Ylpt2uPEt6DEylL6Lwx6P9eGjhk8zZ+o2Ez4iCeFxTr1pepaN8P0bcD4+QBOnQ5dnRhp5NJiqxMmJD7Kd0YLWe0RUJKgfbX8ELSGsSixMUExP0UTpLnjQyd+wxoXDoRXY10Kou2JhC2dkNjWRS/6okNWj7THE/UNH9uDQL++GZFyvQ+JNwyEZaEy+b+OSkGprIyye8Yt5K15O0P7F86Kg3wMqhi4H3H2soQ8TvTENVs+H4H1/jmJkc9jfDMgZkGbOhcmM9gulyncc60ywzZ07EODGzLOa0xvxj4FiJz3F7X3GNdDNsQaZw8pjVtAiqxGdIylMuzMG4hrKpJ8VNZzFfkMQJRjLFjNkSvDgzCiuoqL3/QqTE6G+yFxHO2yqrOex0u6Hk8D/s/04bAn6H6F5fuPgxa9CY8mxJ2yJc+k2LfHZEpuZIryOkrLtNa0kQo2SHK79w3Ixi0qxpm8tje9hTodwhPUeKKlvY7M4NB4+FIVfyYlPH3EKbM+iDC+MiywvlFCav8AoiBXi49mdgXvgpj2hsnEyjDTPcTSo+B5HdMngnm+xymHYMGSiUsKGJaEr+sRReR1YMEnbGJ0mGhSYdG9WrFL4smz0aFFn2C0xCGKZelTYzUJLVAvfnwaYLYivY9F0jIfD4RrjqFFuUsH1hMSrB0QTo+REVeGTqRrYtey/k2l4IysDKiKPIqIxRFVmjCp/RqMY7SPAqJp+x9F3KIoTBRdg1lsgPi+hsGKjZmgmElKfMNiyhcN7oR1xYNjGfBLZlQlU3LOfJ4GSZVmPoZJ2Gnrmdho3TgZx47HSnd/0TGLGIf8ItJsVE0+vkrGCxywr7MeTNLGLZCseBZEk8t56N41dEl9uy1bY2WnhjeSNlEU5ZHUOi9DGLYsYGolgTxw3lx4ElPthFtwTB0My0TNDXYu3VfonSxjZjiTq0yU5P8AIhf5DHWzwU3A1EsZIbUTqoyO6CCymLjP0NUz7Ose4cHsMWnhgunFM7PIao2tPKHv58cTm9MkOBp/J4AFC+Nl0S+3y8Ha9CR6IDFuW9jHDGq2G2CMw/MlfQkyVuOhXnBNP07fLjcZGeC8/uMd6P0H9ixxgkOuOytPDMGYgie0HYEai1IUGmKGjFJWbbFMecUG3GehNV9CTbMpGPawhgT+BYvkf7GMGUNrQ8Q0VUXnROv/AEjAXIjNvgoStNJs/wBFK5Ibl37Gl0+SKWX6fBBC5RtsgtgE7pbdwmDhPz0xKFFTeTxwwEBJRXfRKqbCC4z1xs0GZxuN5Blcdidw0MsBJ+y5nEIQ4ZBt8XyJhj19lHpDaWF0PIk932VWb+yPJaH+2oQtkPqWUarsNn/7me9oXEC0ohimGDonPTZiSzwP2S6GpkhBbrEROXYYQrPCRjXYSJqhayznIuOUEZhv+BFJQVLlDElMQ2sZMvbhufsMswpLBoeTQ8ojVeiFCRbE8dFHIwJ9J7MRw2tjB8Gd0Ir7BvKWByeBN5CpcThwawe5cUN0T9iXbTT8vBEqx4HSDWOhNXsisHtw/shGrNn8FVGYaLU/Qz/ZVeWLZr41NJ+4kRP5IWcPwQwXsV7GL/Rv+hNDGmL/AOkLxv2LxT2/7FN39cmGTXlijhWw0XZn4qPWYtURT+wlWihmIyP5sLr/ADwJSGux6EirYReMkXnBDZrKWBL5Mmr9ND/LImphje4nnl8N3k2JR60KaU2KtmKGt0RpRT19oxEWOMIM6PSI2YlpzIcmaob7yMru03o+4lGsNU+xbO59c2DwYsH1PiFtkfiQo5lMgxPE8mXV2NNvfF0ZsJbaOsbMxPfgsRJfL/4NHXa9sH6CIW2csrcLf0KrTwrRTjvwY2sGBBqE17CHht+jP5GE/wDosLOv0YVr40IlpiNcRipW/qjTrYSWVtPr7FyxoU3ex2xaUHcjt2Nyic6Hkuhy0VOOGjGFR/MMrwJeyNFu/QZ1WD4Ntui9wgyxedCb1PZHij2h7QfhD0pRvt0ah2x7ki4CphsPFFrfzmLDX/3yajbnG30FFlllbZ+iJZohsaS3dULY2uxwVivYZAIsOyFhgdp2Ud4YItZ/ZkkZZRaZ9DzxOJD6GVNMnfPI9YaLaRFL4M0UKYMjvDTIXtSftFZ0a9aPdKqkzsLoP0RJOJX4Knt8CzqD7hOsfop5GFiFMJjsacWbQlnxsb3PuEN0I3rLYlmTI4paomy9oj4DyWHZTCaKnEUrjBWCo1JwwYIdl4iPIebsbfGExJj1tDQxhGhhWRMDJEh1La2QVoFFsWwuGRgpsbXawI1FwmdfPJgmPCFvR9iVr9i8g66YmvJaSr3g+wsCxNN3ZF8z3Amq8dGQVqnvjdAZyxeBfAh5R9xzZFBMZNy+h2wxM+zw5HcJk28CZYlmRzgW59CJrIs60U0gsX4bwyJIbX/oSaMcp1nRfaZm8iwdBkVyObcwzB7CVV0Ij6fItsiOzQQdOxkTRN4G0pLAxMZo8YHc9zIS/ZM1Relh0Wp5Gqs+hqkdHAY2Fr29xV04/YUti9EQ8dmbwwrZqQyCWncDth6H5FUSEM2B70tCmnfPESHlDVd0XraaWWe9oe+Z/wC1FbDlxw66J7BdkPkiLuNew42FnNoYbr7itsNKqY0XEN2L4I5aQ/Fn7fI5jBt2WCiEp3MHYjYxvTexO1f6cAvAIEEUbpGZJs2wKhVgSiENWxZexjvCJhMGw2jyRzo8jMFxv3PKGC9LLbmCwUF5Es2lY0jsWF5QQIrkOwyJL7DewObfplP/ALjoM+hV5fYqaL7MuWH0T4NZ0TdL0ZVbEi/K4TrAhj+hcCCXprLwQjVv5GqdEGYOz2HwwhvCNiMEnh4Jc0Wpt32EhI0SL7Z8hEag1+OyWrR4RkNOjFt7IlRZmUIq2kT61An8PpDQ9jISsHNgwn7QTNwdICfr7heQ+GN1Hy1/s8uebH8GoT5LFDDFgWgTQQuEL0dS/R2KSGlqjmBtUcffYo1mTsEs2hZjDRkTXni5vBl8EatfswNe4xBoekWrkSidHmhGSY10ZSVYyJ7DyFrhX2M1Nsd9bO2fZmfkIQlV7CjSbRhcPYaEhBLAdoR2ZeEl6Htv9yEafSiqP8GO3kwZlT3yL8CU6n0FA7aeOxtsu0VI44GlBo5OhVeyqYwNKEdyhkEZjIMEq9xgYKUaIKRzZmLBlwI85wLxfYvI0wXQ/ryZ/UaeIPYR7fuM17JR4Xod2ID25GYl08/AqexN1HTmC+hjxCVnuUaK9x1sw32klS0XOcety20pkqRBpl4toxbIXF9jCk8kWBDMJseACMJstw12JXCHR0TQKkQXnmCCfJd7QmLNXiWzGTTMQNiJlMvMHJc0R2LoRSp0qWzgnT5E0kMVF2ZcxDosqNnaQlfZZXgofLGJHgNJJ/DIzaMhrJ+emZ0yhBehCyE1fEg21P2Gq5C8mGyqDB6C9jnWC8tu2ZvD6NOj9sRRZJGyRhowLREIIhOOoz5R7LQLcRI9BlSBDf8AfjiPih/ckXwxW5fDOdD/APlE2mfoXYq+xdWa/wAjE74GuwMmQFeX6NYCutJgmJpBmD2haNmW09j8GsrQ3oyoPaTg91M98wZImSZ74Q/4B8C9M8bBNUx4McRE4ZUnoRBDQxphaMMUUbTw6aE0gig/OeND+dkZYvPwRUmS+hylex2zEJMInCZXDFVP7jTt3lEXVFo3oT0f7M22mT9hSia3vwLwo1g6Hxfm5DVC8pMzP3Rhaqe4keGNuQyFxrRCsvSXyQ7268eirhmRBROIIQg6XXYvFECTKMjW3jhvY9kZtIhlm4/Bvf0Bf+jNHPobpU2R4ZUylLt44k/JhjZK3Bm0TTVKT28iGdibQ6vY653JNp+k1pNPORu+jseB1MIsw47wJoPMajLLwkYmy5Jy3z4E4mhIhBjRCkJDJBxOpoXEykfAf+aYhiXCM0MuRrDTxwj44MngWuNCUUX2XFoJpk9GvFcC/gi5Sewm3hGctDLfh0w+SaLoXv2KgZC+lnY98rnnMFe36JqzQScB+8PYGezGSk5QbNbYgnP3EJ5JhsW9CosrEmJmM04qXje6PPNdsGA04ai4EsG2f2YYEz7CvAyetPQiDLFnWh44bJCNR+EeBNxnEIMnpiiEcpnYPH7isy15JVZe8G5V4Rpowe8Gre49cdxMMN/MdvmMobyzPTG015C1kvE/H/fDXD5ZknEIxM+jFEJ8C8sevVYXpfDEITlM7hMjXa/ojfWBIdVHQdi/Y7bEimvF7MhlPsO3yljp+T5FEfpFQ8OhpeiEND4nE4XFFW4iaG37cYiw4qX2KmuRsohS8ZCRDpDcQq0QMoMbDFMIUONqEMdXxoanyNC5MVNXHswfljx3B2+c8NHgk65dYWERLQ+YTg/wtMlXY3QmMxPsxjfnFaTsPrIzYgiS4r0ViIxor1eyE3LidlRUZghwlno6uhKymRuhX+olYhpXuLCHvglZi/C4h2/QoqpBYvNuYFN+37/gXPqYnxZWkOPRGxmyYRR7cWQrhXorbpmvpF/JVvpiWhdPIV4GTj4pDcb/AAEikU/opK1JLSmIW3uaG9Kx2Mlj4OJSdfFdFvnO3zAYVX0l+zTmnsRXjjvjyuXzhiRBQlYmBuP9giCSWkJE4sYn6GQSfkaSQpDOZphZ/npC/M26378E4bB2UX6P6MO1lDc0J+w30N2Gx+C7F1+5i/c7fLq2jLfJP/yFyg6Eg+FrkZj5fCf7CRcaEqZARd7Ypw3x2L0L1oNDYEH06q/og2P9n1o8oK9KQ/aONa8G4VaMSfKdsvEENk//AOUQuIZGIMpkb7Mnw4FtD2ohN/J1UgYpdkbT0hcKRjYhIhOIJeh4LxqPgWn8krrswLBow09pGKcp0xOze8vdjPKTHGAmlR/IRCZPc7fCPoT55EYpC4hOIRDMCEXyIMGGXFKNiypeo4ilN+yGCpCDEhhFLwnqa9HcaFCyMbEOUxqVRhsrlkShO4VT5DNYXxBaxFWWPudi4Ed0Zox+soJcEIhCEIOx5mbktUKNwTbdEy8Qbto6Z0Aj4DzD2mJ/B7BYysTI9L4PxIsyXkPdg4kio2on0x4B8UfDT/2LXSojM4K7EncOC3wZCl51wWuMU2/o/gH74TyIXL9A0PBSUjII24RkTLwzPowVDG0UYNkK7y+TTiy+Q2YmtNwpURps2100yXhNiJ2SbpHnv2YyvYKeDMcdONZiZ+XCeknoYfFbxXBdtmJDJ55z3yxj4DCcCEuWUYx7Nvoeoz5j3/6jejCLQqXuaC/jydpMS6HXAmdyI2kaFyfc/wBy8NthJ8N/YuFyXqnBCEfD6M0JcjSGcVhLx0ODzzpehjGPhv8ARee4S92CXuS012+UzUMDI85K9MmMLJXaUMvDyJfPua/hn+3CGrhLIkXhQQ1RekuL6FxB+iEGhhhhiDROXzeGNwxmz+BieexF4x0Raw2Jm+hUU7/kfJaRh0dWHQG6aPtBssaJLnpi/twhcfuuBhCE/SiIXqfC5fD5Y1yxjY2QNRluJu8PkVvFUjBoyXvonK1kcQ7HszIhgZZkp6GNjPbP6xafzwhfu3g3CgmUvKKJ8LgvDfqb5o2NjDVcDSsbfE4Z3w+NBcYbC76R8+x7OB6ZpMFhkbRJYS1yJkWfUWvvhFPacFwxRBMpS8Jl57LxS8XhSj5DGMnD9L5fCVNDSbgru7ewl2ZMmXfAyrQaTaEHZsmLegQ2DwJn8Gjno+GLlcIXFE+ExPilL6aXl+lrhvicv0sfJp9xmpduqvqjkqseTroeTcDNkUtPCgmUSuXBKLDpt8Ba+AuEe4IohcIXqvNKX8D9LHxCEGP0PQ2DoYkPzR1Q2NiY4TseQhheSF2z7CaV8mBnHkYNWkYDA9ex9fAuP4ItCEIon6VwvxXh+t+hjH6Hrj/odFiDqdt6FdvIwvcZUJckdM068D9oHjtvzUKOExGaM3QJcoQvXSjfopeKNiY/U+Hw+GP0aMZt9EPiMx/AmvsZZpZZejHsElEb60Z6Js+hHoP7BiEYC0LirhIXC9M4fNKX8r4fD4b5ew9G/wBDutvgRWT4NB+CtE+hUwMHQ9nmxCJqsjuJmMiivY/nj50QQlJu0T0r00vqpeXy3C8sfD4Yx8MYY/oEpvZRogKBzbWwmnf2VdEehQ+y/d6Psx0vkxkXoV0vbkvXf8J+l+lj4Y3xsGz/AHgubfkt9/ReLHuNwSnuyDwZEhkpSO5DTh7Ho7T2EXjvKcePzb6aLh/hfofDGMb0NmnEExZGkeapbGFjYh3X5FcGvsibwGhf+IeifbGkuxQPf6EblfY9vj0Ps7EJ/wCEuH+V8MY+Nsbg62FCNVS7Se4i737CE/IiaGn8h3UoUITbZTTHY9/LlGQ9/RpS8UT/ABZvL/K+GMZoIcXQr+RJDhj5C8H/AMRiQV9ETcbc7gpwhCJ2J7dmCLTF/vlPIz9hINgL0rhFL6qUv53wxj4a4GZi8DGf3LeA2CmSuz3HaxL7HSEM9GCNM7kxH6Ynl+TRsWJhaXoSjZXfAQvUuLy2XmiiL+djHw+BeRmFZaQnSRHTMmHQ9tS0q8YbI9NVD6g075GeqohLwIyhwqWKLPSMg+RC/G/Q2LQvQ2X8b4Zljgwfo8j5rvh0NPkzeSLA9qf0X/sN7lfJRhazYqwPoXB78rhsx0YGGKJ8L8q5b4avZPRfU+GNnfDQfgzfycLNp0XWMEN9hK7IgiwjB56GsPP0JeRlEdPj0kc8DMSexI4XCF6367y/wvlsYx8rQ0ps2TuGpDMYSC3vsTsSY15NFYbSwNqkLLDNyFwG6KRXwEu6DkjZJwXC4XrfohPS/wATY+DCHsfPmfBjplwdjwjG+aE2mUJ3iFLXRbb0ajhtnAk5yRg99/Yb4EvYmmQdQidcUKaENHSy4X4WUX4J6KUvLGiD9B4Nlj2yZklJrQ0n2P2C0mMDTuDQZX2MFYvIyWYdSmcwJ2PIpUsEUQ0T3yjUQ+Ovhcr1PhP/AAWMYx8vlIezqlOQZroyJbGNVOH1m79psITGB6WWNJmia7hrkOhMG8TAvEZonGRFVykyPZDEv9CNhf57GPhvA6DQ+F5DDkyNl8bHhHQx5PA8GjMCXsQxkN6XNGKSG65D9h4SskKJrQxVUq2PUMRYn+Fl/FfxMZ3xCDvjoWHgZi9sUQ28DOyCfRAIb6DM5MCPgkbbg4So19D1GllGbBZEboxfeKcj1BCfGq9N4voX52Xh8Lk64GmyNR2WtTwMWWYK3skkr9je0aMiegsZ/Z5CyLYp0smKwqb9yWlHfbwXqGVW/A2UKhNNm0USIsUFrD4ThSgvXc+i+q+i+h8NjHZIaVizwZpCaKzTYml1qmU6jWBcS8hkL+RGGxQ2GyI7UYHko2iQQ68j7VpRGvseMGfsTu/s+Z5EUQgv4O/yvll5fLbNDEMaljyLM0zIw+4h5CBt/QVTLnBSiGynSNoT9/gTE3ZRcfIS0h30J0BA1t0PzCMOwjarHFFGRnRf74LjBcXh8vhfkfL9D4ZIIyOjoZlGDkCqtMwQmh8jgi0QsmhTGMitO1kfyExnNKyUwJihuGgpVY0K69mIg8KtHvRrS6dFGewuKFyilLw/yNl5fpISxv0ehGKK90V5M8EbuTziZWOiEX7HkyuC4JVkG20vowy6OssG0lgIo/JMKhm1GY6nguJ9C6WgzlnidTkohPl80ZQonfQvS/UxCGPQ6JgXFZG2Q/eBvuYUbheS2Ijye4NNkjAWr4I42FNKTGoU2PFDPtFDFBFiqSZFK6bIsRrA4wmIj/Z40Z/FiEIXrY4Q6LkLaI4X1sq4WfA1Xo6Qyvk6MeBTPkwExQvQry/JSjN7MvI1tGdKJYUjPo/Ygh9H/wCQs+jcxCdm9Y+Eeh5O10KWQ4j+Cl8IeGIbgvwM6c2JDQuKVlF8cuRuNuCD4rhZ+A+GNPYE/wCRvRnJFU47FKB9KZGsZlX5LIZ6FNtJtPx0YoswJYaE4l5J4ISfQboX8lFJBj38iKIL8xQ+WiEIWQmOEhoguGPwbAlENk+A6WtN5R2foTkefJmNI+ngQyVYk2iNdi4BYR9wTUMsIYaLGhuLTV8Deh+D4CMjIHQ2WW0HTWButejDHVnIvwYi+U+GLl8MTWeEPlh6HKI2xseNnY0WYGsifQ6Iawi+IdezLTVWDFYKsH5PJgvlFa+RlvoNVGJkbkyJMondorab9D6K8P441ZUmpoNr1Ro0KgcQvwa+lfUx4ijE4eCjZcjD2Lh+iUQpPgSdYEk0Rcw0pnD0dV1oz34M9PsRPDdhoUNKu35MD3FMWjGYt5MnJ0KcEQgD5E6eyuHXFKR4WDuZBuB6omIXr1/AQyjFqJN+kxuDeR7Fx2Nsz98GI2lkhvwOGYjNeehN5TEnVkV/qEQeRCJmsiJtHkaMCFnCmEqGNWe5bLUYkqzjjHB8w3B3SnyeVCJIvki9yi9rhhcrhcLjm/wtUUPhj4fFi3w8seOURaYtOEZDWPJpOhtJ5CWfYSVcjBYhSpPZhBvBYk+z94bKj2U4RSzSPcN46BJe/wDAnD9CmlJooo99xsn7CVlKd09EhiEXhejTk0P1P0sfDfGguR4jQfYyhGTE4NY/sSdjYKrfY8XTvRYR7DOs0kMu8ElkE1SvEFd9EMRtiUbo9RuL2HjQoJKNFD2KaNndD3xkyb0LwELlektiGP8AIxsfPBGWTYYrWVkBfsNkVt6pYq7ElbHRNeBw0rsik+hYwWrxB6GaaEkReQVifIWcX7I3CFkiGNYZhDmwV9zJmPsKKrgSO7JszagyItBcz0M7F+ZjEuUHswChhdtlV0MWX3Fg2WJsWy+x+h0anEfIQ76BiKqogtGdtRvRlIl0YzomaMTsMc8gpgxlqXROTR2S8h6OxxM/gehbSi1UzAn2eZI/kU+U+IThifon4WiDROEydGBlm8GktC7mBRk4QhZVLUtLZsVjNEpeolgcFF2UymBmJ3Atk3TJpP6kYBsLRFtuLJgzbz4HlNpSDNYV8ilyNLAxG7gugiRpKihPAYGNEF7LYeHxpGL0oT8T5fDGM2xnyAkCCK6IDO2SYKKaqkIuTW6w9Do7CF35Oz2FjbfRm+EtZRDMitKvBspUy5QoTVuDo4sGxR5FpB6Gmd7ZGOj+KZTsKvK8HfR8KF5fMJy2X8DaG7onEh1jyLIMM/ZB6ZGgaUEiZ34F5JiNyI3/AKIQ9ltJNDmlEsfyYKYsG70YajW3pjVHtPsRglaGpTT0NvxjyJAa3bTPNTHgTUI3dIfkEgYl7idnotU3xLSTB4eBOgg2S+zFtxqf7E+BlK/RfQ0NEHTJeHTLIMYzpQ7+yWyfR7kNR6yeHRkngaDakqg7w4EyPZiTbyNOrRKjnTXPYvDaDjVmDrANQQ0k5nsZK6JWJS8GEMXNjIp8tjVXWD5YA1/RCteRLgJNrZFlRnfYcY3GtGRqsBpOmn5Es6fuTMP/AOQrqGvb1v0QhOWMbI4R0cDoF1f7EZtmBbGpJr+CjyuSBkFmiao/NPAkNVdlBZPAjc5fYbvR5Hub3/BPajT2DRzUUSZF0JsW432YNXeUWpCGkMX0NLCX2Je5GEz9kYQYLse9kaUMeREsUwblkcNhut66HtUP2GeKQ2z7CcqmUpfwPhjZ0IbzxaYoq4SNJSF8+RicWheXrwL4d2R0JHWahwd/SGthZQkH5FrLJTNhZhukJC9zu/QkTLjSwRoTzUXXvoyGpsf+oaLY0iTZRUNmNrQiEK+RMYQ2BBKy38DSdmEiGRMuh8M5HU5Chi3uh9WVupjaIvcaqH4fNRMvobKKD1aNoaLJWxydEyJ0qaSmRPp8iyv0MdB9l3h7CqPA1Zp/Q52jJWjislihxDPYV3QhB94HUn8BuGlXkdyXQkhoNINRsbGS2jW79zEqZuzNCmNCTsqZrVg6TUMWUCZuIWxjUE19iWyvgY7sMFMF9imAS7gfRpP2Mb9y9GjJIwWOGM+QEonezXMDU/J5yp3hHVVG70NqG8YGbUjaP0LONBtiC8hpMe8GRVnyJsGO5zZjNhcXxsy0mf0QKqRPBnBG7dFH7UkQun1+y4PAh2S1veMnJExMhhxjkJJO7Jp9im14di62jlhmaqGN3Rd4Dl4HGEIkuiGkq8jbULWL5QCS0nyMrbYlqsuYiNxiRtXkpNuQ6QybQbBtRpdFVmH17iRsjaSJGbzkzfF2bRguNrApYaiVTGW6DVx+iOKjI47mP3UZoZvDYs/mVWvc0SXYjD64FhOoek7HkOzcLVnYuxN7F4BrMzwhVb0Ub8OyRxjvauRrItiEvY1mDN5G48CHpFrDvwQ6FnliRtYHFd+Bg6iB4YMgizoohgVIwPZliCbLcaFjOmNNPB177jQsubyHGW2icPskD7wFCfvr6Coh69TYVTtDzf7VJh+UJZ2UmPLDR2x1BNnSERK6TiWt9KpCk9hU/pDmqR6v8MtMN9TkxJudozCW0kqrf0jKCUrpHuNptyJ6dP6Cs98GhL5eBaV0Za14JUeZLSzkIVuOOyOghK1jZjTSIJN2PCe+yyejF8CjQkacpCcbUJVbbM5j2aAki/AtYehOkIWKpO6DvjA7ysRS+3uM48EyqmJMeGDGdC0idQkN+BPVexIIeGsCw2JITmQsWoJdUL5CeGyx5Jan1D93mIxIU2/iodsCGUTTZUQ6e8l2UopM2pII+hGkWKctNj7vQFEZVTFflxbk62/k8QOxpf8AX5KlabNI6eK2qLqJ7wbPtMosSpYGoe17ksbMHujue3kb6E1NVaf6FIlGdxDYo5oK3k8oxYO/N4fA+c2KcQy4wNpLkLrZG0Fj7ZMYWOiXkW0KUYD8F9jDg+9GK2LbMCL2W1xlkbZsmRXRwQUh2TjHhoVzDK0f8AyHs8z5EZr+Ain2dtExT2jO4jIj+R49joxkEywzktbGIdbeSzocfgQlRHoUJB0oJkxymPSbHiQftsJ1A+gXcaVkijrcyMm2rop8A8ekXfsZF2cFeSi0aSCRwXQ6WjJgV3zBGmyGYyzfkMBTd9hJMnkb9PAk1LehOuPIUGtGY+hJGCcFoxye7E0YMWGVpssIEbuYIDhTNlpyTs8zH3dGWw02BNsedvJk0ND1cjNCSoVD9icj6E9otmmoaW8M6AKxCWq8hO7vDFJQ2KplaYzExsYYK0juxdh//8QAKBABAAMAAgICAgMBAQEBAQEAAQARITFBEFFhcYGRobHBINHw4TDx/9oACAEBAAE/EK8ZUP8AgQIkSZKjEibXvNBKYsOkVUvxssI4zmyyFJRUJgcQgxCcMUA0mI98e/mFyNqN+INDYnEXaHIMTFDhLjbDx1NR0qWwgGA8axGltSw9PgSUeGRlIM427xFVnmYQmiRWz4IOsoHwRYEXxsbuP/DzEPCdPmDQS+WdhKvc54GMHv5ypSAR+ZwxRstDeJm7lPTB3ZwTBluoL0q7K02A1RtepZCKfnNiAroFynPgYUiagYFkJfERxMYm2Ila42bOJR0eDTiC+NMPEZREUXiC1PuChMpuXDXIyqjyzqdkFkDCc78bzEjOo+UqFtEhSBZ0xCCV0LcGhN7XKHc8c0QU7iO3FWE4mgrcaoZC09VFN9QqtrofUvgrY3cpv5qlPC38JGj/AApFOQQd/g0iBbAdcxv+xH029UxBeIPSVOGfau0MB3qgifP63qKpUVypUqLV9ykrGmH11LDBmALFnRf6jxP6mF2I+maBKvdMQSAmG02X2lrQcVmkDuAAdX+9jK2dQj4nA8MOIxLse5VA9R8mw+v7j1MZg5XO+kE7lDF8YLCY7DHcz7USGHBfUx9ry9msWOM21RXqpyPpkBhUrUhl4Ey+bhn3BiFrsZRFDNPPMoo2XCFXEIF3mPABcoeaaajPgMCRJFZ2BogtAfTnmfN3wSneVaIQQA0+o3DOL8yIu23i9meAhf5lYH7LMElHVWwLLXuBMmCiFE9qqEQtJ4HMIDBccf8AhibEj42UT+JyX3HSIaKiBmHEWYi8E4I+VTNi1+oe3l8QWOn6gWLsoiziiu4CnHtlcxZbIPWziB8+51nDvIep7UIICspZcP43L0Kyt0yDy5FvOw4V/dxLm4xHN8xboeYCitMKRuK05VUzah24u52UBlQpWRLXbJdNgoqlxqsTHZ0tORx+FewiDiJ9LCGEbgh8PlmiNeHmH8CKgvKhuJo8dEcJyDKqbKL4ixTAqAefzBKjL5+yLVfVMKmNI3QDRsRE0NQM2K9GzScRxUQdRBpqWjWCnmmANvag62InM+RnzsxblfeOm49zj1OKjohxWjZynJtjtiPeypgWu/xGqrlhv5S3sCvgVWYRnqW2Ds9x0l+WMXZSVj7uCrcpngBZiI29x91FHKK4gVV7hpqruolczlzQWvUKxots7QLZfyEOWAhK7Exq95F90IDQf3LPL+0C7V8bCAl96SX45pZtC6xGl0QwLMI8vghdzhLuqCtGEWPnFYgLaFqXLC4uLTBfMqUFemxAe1SoekKDIKqaD+YhLt9so7GDcqOqSqIVsOpXgY+EjU7YdHzMS3gMGFejCNUZYnKBYbEpZTCWG6ZrUUZHmQgXctgp2EWfLNaiTEEQahsIoYe0AT3VR9HPM3lmQLSAdKfE4tuLQXhAIDxNAqN9aGx9pnMTepreNxDZ9yn4j+CEBKliVOouxrwvJ7qcI+GckYwhfPwcUCuS5aFoIlrLjs2HvmJCU57izmaR1Ez/ANnzeS0OFxaRPuCl88iy68a34VcpKIOHMp3KDhc2bBFJdjjuNSvGVTNwoCO55S/nwt3EubbByNG+GPBFgwRIyoziGi+fJmOB49viIibgA8xtRIMCVyVIRLZzX3OKgzgk0aITPfE1Iq9S7fDSKuLeZUEseE2W8TDQ53TLGyZXqKveI62Bh8UwAvdYRTdeiaCn4gFcLjUW3fsuGMlryHBASmpeQwjwRX/hjnhg0YIHXRNs7oFNw8SyISxKg6MdqpbZZZECkwwcuPXHxFL+ZSYl3suoPxH18xB2ODSWEe5dRKw6nIucN9xZp+SIEO26jhitDNjcBqe4IFYRC3xNorhtQU/YAggdVCeo5L1gJRHllx4nSV1c6PBj4Yssfinbw1SHDB0IBsqWVFW3A2DaIAWJcHU1nqCzkuKiDB9ShqY8UDLe4fqXHTv4jzdRYuytJbf5mLlnSf2S8uDk2SsLFDTdp62UobLonJZTCLMF/TcNPvwmRYhzFuKoJiR8nEfDGPNStY1z3GIpSzIPJD8kHiaguWLRzbw2HeWWQYbLCVcWwhoyEdxlPCpIw8S1y9I8xYJXM2yN2wWWD4lql1AlJAYw5e32wOFPacHz+FhlaxeIy7piMWq1ycw0uVXEIPBGMYzjwbF8Pgo1jal2QQCibsSpSXICmc0jQaipQpbhrEyWlfUG6lLq9g+prcOSDVS4VhtMpJySyqgm3NWWghZ9bHmdS4+hnVuwHD42VT1WR+DfmIt0P2XB4VcAjYeD1F5l6eGOwly78MfD4/ks4wcxWiW4jqiIp9GAWGslxcPZFDll0wVYs4gw9X4uUNKccS8fCG/UXlhc1EhxxFlwAtmINxvYETvx6nqPDLrfUZ3tSqT2a+iVbbbXMOj08+4t43+k8rljKjySsYzrxaCljGC6jHwLEdiOqBvMdU9SyhEkRiRCXM5DJgxa9lS1xZGqPwTdTSvuMVxpr7JT6gNy+r54ncsR0jx473FtJoi8DGcp6g4UUPJ3Liw3mDAUjYl025rfY/uUKJynUuruX4y4y4O1G6g2xjGJHwNfZMihwse0wE9bDiouORtcrSFEYCRfMrWMHCBnOGMHNMFDLJXE0uGXRBFg7LOWd3FRFKiCot1O/HQuMot8MqZkTEmEaHpsowZVhcaq5MNvEF+68LtK8c3M8ZGZUOYcQNvw6jGMtyC4ZUfeLssdRNEvV8Axsisdl+CT7pSFjsGLZlQ4IcwLrwZZgoa5uWmF3EQCcB8LzBnX6lwYuI8RyO5Wj7tnLDQYwTpyXUCm4B94nFCq8coHZFrx1FDx14HZcePDGMubD5TTBUGcNVEyzBRjAhBuCtIMuEvT4ihU5eSZzB0hL25eS1z81GWZL4l3GvFl2LL5gtJ0R5CqrXhYgQF2zlnNcvRLW6ghhLhFcGIs4j5vsIGDdxIx86D4YYKKdsWIMl7UM5ckG4VrsajJwawAvzOZgZDi4PENqCXKUZdso4epW8dStYWv6iS4vrvyMvy+C7hC2Vks5wXAhDuvtMrs1kxSeRLud/dQcxzI+EGFXF8MFGzCqnBOTEVZLvwxjPh4mrY7Vgl1ABVzLL5h9RuJRiTbLNHyRQRW/iGlQMhzxEwYYQY8nhPgI8y2HMsw8rI4eIt/UVjFW/NhEz0hTdUo59fENN+OCXep+wv/ACEW3w8zjkulyCkefCGmE6hz47Yxlxl2J0fEAX6nKCRYB6nLIXKstAvZsQZikCIPqUAbg7E3Cm5txLcPnx1MTqdP3A2Gs9w5bltTiOHEtVXHYnMXYajzi4Gq1hNDLuoupQQilWH6INQZyxY+5zbDf+NGDseGoI+Fj5KQ8JTE7yqGHVrX37jw/cEQN9wRRrkjKX1wTkx7VylkBSXGaqCQGDFErvjezul2lwvCXXhdy0l0S23xZYLLizzwuXXOGWPeWmRZyLgh4IpoNYN1qZul6uatiq8MbqGyoMiQyovjJcOfHE9+F58M6g300hcGx+y38Sy1+OI7AWUHuKw80xS+SXv0iI43ORFA2kqokbVx8IVcDA2oyvXMM5IV4rjY74252xbnUZxAXUUqNW1kUuU6jxlxjsYckPqIjx4RAaUKpTuC1lN+6lVL6mEuiPHkcjTkyMIf8mMZb+JApfEhUDauZdIRPJLoA/pgdFlnOMEUj3OGyV1AlxWTUWwg4GiY7h/SHECjuboijiF36InGSmLku7ltmwZ1KRWUaQjAIQmoPFtcwIwCFLv6jBeWFmxVH+o1BhPhAbMAXo4lxjLl1M5lsuEv/ljGcqAd5iBqz3MIsGpWXMAhz8y+AmqLLlNd8OSH6D3qBbBgtyXk+0WEZVgFdRDejIwBshSwbqXfbOWHPEL9eGN1xKilS5QXNizLYGSoYvbREIA7ie6ls4/BSB3cVUVOqfHUYC1XJ3yj4kFLuBnbL5H1GmLFg7EXt+FKipLZeQcg+Hwxg0+4qllx3PH1vi+Iia8xCiefRahw5ZcrJahyvlzsvrD9RujX3Vn8Rr1LgmaLl6JTI0Lgsv5me2CdExFjbdRlzEI5dN+bElgXcqYtbQJpIMXFsAaAvrCodS6DolO6O39H9y/KWsUKgW+WJEi5O/HUudf8cn/hjBr4E2hRgNXDhqkiLNBhy45HOU4bxBS21EhsuNMbMpLnCWH01B5f0Li5+aoJRNGoNplMPxmfH4sMWJKHfhcJcUGXsqoFMrlpLXHpCyit6E3ruCHL8sFdcObZXUra+iU7U2guoV6r8zByU2ekKlwjCeo1Ll+GXGMFr4E4MC7hZYssigg+hLGeEAhs7hkaSGFM5ZcITMARNXAKNyrWtWvuCJFOFBqLKAqscEPoYbqzJcC+7SQ973aZZSHCKuE4H3YS5q+PthqC6gUC1NOkSvf6uBLpqfcJ1dCjinUH0SdVUzdI3d2XURQQ5HCS8YGsJ+fQd4+4i3OWnFPVRK43wgrtEjGqATZC8OOZcq+4Kzcq9WzhFeGVXhJey24RYr8B8sYtsN/j/ucGGYjfNQ4VLaudD7qKYVUwVp2JqP4bgSLahmC7HXUOuKF6sLFq+5hVL9xBRp/mOkdZnECK7qAuOWCNg0zLdne1kXw5fcDOYriK3TCQWyvUAGGWuajiMDO4Z+ax6WKlRev7jKBC94hli7tbVS9CNG+iEYqv9BLMClvSaHBQdTt5zXgupbGM5lxnMYcvi88MWdwWXznFnCK5lEqczTkpZR4aYDlQ4PcSkllXKBuLHYaimc8BP1EHIDgPVwhqbXZ3UUEbeWV7aaOp8+DcqnogoqVhuO9ZxcvqZGpxlr/7HqaaAo07IEB317irKwcbGIJ7ftLOKjognDrBvNIKrhmzYx4h/wAXkGL8LkXyKftEOCcYMqwIHzCzuNNlEAKvogCYQKuNq2EdIfc0854zHj5aGssNMMMxbgnBjfF4veE+CC9E9cQ1H8pQ1M2EhNT7INBtZRC+WrAq9/tLWnXH4ly00Ac2wmBMhXqcyWxZfUY3UGN3GEuPh7hz4fDL81B6WJhzcNJtTgZVTWt+IiDQANXCqgsW+MdhvK5d2/4lyuo1ZeLirOvCaXoTiG9komHMeHwhSicp7VGKC6uIs1nEKPoiAyBXaLrHC1c24qM4lyXtM2iv+SUe1y2ZQC1yQTF4FhYNZbEEYZ+YraeqlzqdIx48punvfFKgl+HiX/ww0PlOLLL46ssaQDT3AQEHFh/ccaXI87tr4lQpuxCslAb/ADDYWxpDUwQH4P8AJVoTVFZxx2WWn5qftjVX74l7S/TDNLEBsS78A+4ueFwEEi6uDXLNMgRdVdRXnIu3EFrgehTfuVi8KHpgMKX6hZupOTkYmwWdpXUXaaUrhGBVwSkTfAxPUY8QicxjMlUnjph5uMFSNiwtIJQeC1B1lngR2h2HxNvtvtpLLKDQilN8MrFZK+GkKrW2YmOTSU+ZXQULd5oMQAl7Tj6uKGJ7BtCC2TAsYDRwoRiN0i1cd7U9x0/D/TFVtiAJCvc2UONXERsT7SohycYx2DnXKPDsW6uI4KaIfSJ7lpL2XRZ22koUUXywoAVPMQYb+YaYMA/KzK7g9Eb1cRbZdK5fEuMNvyR88sI+Vs8MFJ9llKfBgah39RMl5dWh/wBEG9KIL6qMUb6CwPJNV+AIYi3Zqn9wHhK5EbXUIoFRr3AyNQ7DNlFOMgagzkQHg/zKePysVARBumZUcfgij9cwlj3fRDfNBbiuh+Lg839xbhhd6CxYqcwfUtYA27uPuG3wgRS7089mY6KaQdv0BKk1pDgiGitnfHEZsTf+rj5MhxHwsoDwwV80rFZlzkQI7yTgS8H/AElkJqhtrA4rSv8AMTiIFGEB1Rz/ANiWxA/X8+pg55jLyXAzYj3FT4Yi2CJYwdlCdeEQa1jpfCGCEAdzCNXI6J8xEvzIEQL3/RH3MLevAgvBR7I202WWTCwo6lzDX+RizsGJxS/xCrubGwRnoS0YIUgHz1FnUIcl7MSxIsYr99MyM24ll1/BBFam3Uv1/CLWgCMFZ9Rq2zfyqFIVd+zHMdNZQ2nRI6srlm/Z7moJcwtHN4gppsuPRAXWYnE+ScuIW8CvCcxpsVduJlnlG6Vv/tlBd3D+Mi1WQCyGXxFY1VCBgv3LK6N+6gVV1G34gpxC6zSXM4hUx8lni98l0GmUXBdwaK8KDNF/+b5LnzX+IIJs04gStsgXZiYqxwhhq26yqlYjnI6Kuzmc/wB/w8xp4VYRKaQZR206fZKc+HIH51Mqgur6YwXPTmODYSUrueiJNqb3GIOaqCsottYBFyJtUugcDwddypkU1rFTg+O2uo0m22C4dnQGe3COCGVkxDcLK9QMEq5SlKQsNb9awHDwDY2djlbn8QwofC/1B7G9gYTEq/M4b55ReIRmuJtx6Br2TRK2KrnSVB6YwwiOX7Pakt2KQplbm2PNcxAhp6SUWG3dioCi2O9RK9bGlcyxWNsk5LaxOxlGQvRkMJSy1fVRf+paEnYJQYK4/ZAdq9rNYv8AcQcKx9Ih3dxUeIQziX8xY6vA7HNn5JXahErFGmnqboF8bA2Q19wXQ7PrNlT4CKLFbjFr1dywl2xXQ1iNHuCqlefGorC+PamAJgK82wzbcGnUPp3ayWQvGqqm/ggtMWV1/lhr8QpLquOWrD9SpTVWif3KdO+EZRvZWsgRlIV1s0OW4CsLMHlY3tK/nIAt8udpNlNm/wBsqxipcWmwRncOBLgJuDAzehouHj6RC3dL29ZKyb3fuBcyUHMAE3sFS5lKeXBKvLXC/wCoJEtfBSFWtOVj+JyLl3i8l5VzlFlxNNQ4O1F7giOriSwxv4iEsByv5l9XPVcXcIJYU/VVEo2BZHRCqAQL8MoAxbTHzAe4VM83NuIsHijiUCNUbVTLOS6NasPcXsGE4ahlRdFfSS0X2HtJtb/E7AxTsQF3Yt0QoXsaAEXi0cgRkJrZ7fxZcXVj4lRYF9FkAPkmf2qHqpXr/lwphuLbD+YqY6i3FDCq3uMOb3LlPlMX/TG9JKT5IgoFDLFsU8QKF2DxeS5nGCVr79wpK15YmOOGGNTSs7iGHQRirXGSwaJVM1hTb/8AMNeJoRMZR6LO4Nj5nJGuaqcB/J1ByYy6bmEGcMWKRrJiiUCcVeiFSV9wFgFWB1fggP7r4z8wdriWicUPy+IK+fBIIj64s4uItXvJRVomxUsCK1E3XxNi4TtE+H7lAuehi0ACWF3vzG+AaYr4agyiWS1YplQGuYrpEWqlrK0Ti3ABdA+mbhlAitWvuNHZr5IwbExjaXtXLqCHjxofCXQ/lHBFplotvqXVPr7idLW2nzFEHDXM5xW5nZH8VFxVUTD0O1oyqODv03GHe+EbIJOhl8vttlDooDzdVK1NbqxZkNCHxM1RNfBC4hrSCVs4eMl5KpNN9E5mOsXzLSMusr7ZobgfcaK+uOIefkP1MdbOLrH5gwhdMZCWqIJ15+fmX4gVpYhtKcmEtMq0w067oXE8cbRdqVlp9+shDs91K3olNah+SZyoEqyiJpxHuFbtl4xCW2IIe+ZT7pDy6nMjxDiDoOGfSiCwqyzlT+H3CuEaLf6fTLNYzmi8+9IRwVx6nPw6uR3Dd3hS+0x0ALUdhbeT2INP3KJSFKA0ALHqFBUm839kN2Dh3fv5iL1soy9gAodMThwRGzHOwEewDFf0Wb5YmQM8JjVRy4Rz4GnSJ1MJgbvfEEVCDHGr/uxXwOSO6i+wn+QrVPLLoKOa+iWswqOVQWDsy/5A0SHorVF4fBUzamr2S+ZbzB9nHEBrBt0z7qYhHL4TYWFW3FSyKrCm9qGkFqyXI24LXEtH2rIg4Uak0EQstagNkl0kD0cTdtJeIBa+EuqKhUu2IIVd0bKYh3BiGFqQtVqpjA1s5QqKatTf+lmErY0jiQT5L4reScyPFoQRo5IEANVEtNKPEapzFVT5TfSj5mTItSLt/UEuCD07PZ2QNaoGkqVNgsScv+JjAtuH6wiF3DXbE1bsbhP7vRAnsh5JHdQjIuJU5BviEZQzdMoaAjH2gxXicwsABwYSkFOx9xszBVRQvdv2uAhVvIJR9mK+FFKgm1lQ01L0Y8OQxupY3sSFAc6XZUEV9+5iGXWeodc2ob/iCDpF1AaCVNZL2PTN4A5Wyl680hehd95Nw6pQ8E0go/ipcwAtep0BoXzS9dQ+0cj7hVNbxDyTJXWBqHxkmW/zdwxsss9nvI3cbQr9rZBn/mcj0CNmgpVu32SplzVHgJbe7FoJgX09/Z9wB1cvr8Hf+en1DlECONPTHxD2q5MP5gZEBZos+buCwVfWx+afPx8MbKhnMERHY9JNPKSrh0O4aLranORpVDnbayKEsEwyrVTSfxGITfm4zaHVPqNdoc9X9QgP0sxHgP0VKiXG0TIurnK4KvWIXrBdTCtsetqxUqpRb5Syo6jOcFv6Gqi5XDGlE4VC1BZ7FeonhT12m5qz5ZYATXYFqnfRKACnvn8stJINjtQbyLXtlglFMMbqk49oCtKDGOfQGBWBdwtUPkUPv5SWltAKHpwwuuh2+/uO32Ow16HJov2zB17PZFVs5UIAMtgwO1SbfROBYgpf7g/kjwbFA1pUBWISO01yXBMEWjBWUu6IFCQ9ykolEpiEIvLaBaBX1MTCj+LlXPKPq2dQuqq4T1GWzqK2VriK1lxpZKNyqOPEvMlmC8DOZy/U5yncr7HsnJNYbtA9uvTYfRJcVvEfEatK5ucjlUD5nEUGmYXGvlM4iGGr4DqzbOJcbFCm3LoITNHojFC6lnLZtImJXR5T0zaSHejKWCKRBu3p7nVPkEd6V6hUZLYAuyhUd4vZ6Xcs3EW9wEPksR3FFiUBxCrFPWNJWD0Nxp0iM6rBkD8TVde8iRS6j3aMjQOcx+QTh3PeQhofgRxX6wxKgtemBHDfwgEtX31+C4LiHCQ9arysWGiFdHRL0hRFjoFYS7jXB8fLGOCyy+TaItwvyVBJY7Kpc9XHyCPUqJR05J8XVwg/RoP7h+nOGKhTF+RV97FG1AkSu8XmIwsUuUQ5l5x9RZfTdAAEVeBXAU7LG4TXSWhouiobREfkqbV+AQQaJY3wvwVJbIs9RiuhujklAwPULppX5zdBouuCM4tLt9dy4FjiChg+69RthzzFuwGvr/8AVZcgshoGj2V+K5m9CByIZirLaL8XHdLSLg6sZRdqZPV7MUapq6TR/Cw+1eEAXcNzZ0EJmoBLWdJtioBBcrKiCnT8ypLKXkHg3oNjbupaYVpcZqeWWFg0jtwKAA/pbXi0GUeNUl5ivNbjg9K/52YfdyBX/VIgZVCg0JZAo1fMXqi617hYwhCHZYE55OyjgFu1DVxWyviNymYrblcC6qekUbLY4ummUcNqjtKPS70JqBohRwTgRDmuQn+qHHtQDtmyqK8sTv4lmWKJUtzkejZDkvwypeSsCvaLWn6joaJK66wItZrKOnuM5FMzYwDz1FAoVxP0iAcZoebt+YxYrUlxILiBozBz+2LFSh3UUM4oG2oLVjpWM2fj0SACfBfvh1t+ZriDNPiRjOP3AAC/LL2wg+i5uIqKc5Bs+9nE23aYi9OwNPzUGgqzAB/AXLqlrhl/6lYOqZ8xijmpWFC8qzmymHAS4em6oLck0DI0ssAv4lCoKQ4uaQU+NidOI+2IWUkKo3w2QsFfjYG04lTk9RFIeKgPFp+oFkseW2+5WclWo5YsiFHcdgl7rtQ9tvX7hLlw0qIBURbAqFaIImU3TK0poLSvv9kvvq9uIRKqDtRr4l4NLgsM3SFaCdiPxO5nWbXAwL5JZxKoGBWkb0sb05sQwEMs6Gtq4q1F7YY8WLMRKxQuWkWU5pwuHvK4suOBWr4Qo1R90RKrF0EYOOjjxLYAC3gjmjkB4LlMXNDuV+m7CQcjbeoTO1eV0+pqbCS4UjH1HRvRiFKDoeo6GQykb6al2qLe3cW6r0JZGUA15PcHgfqCLLN2FIuoT7pmriYUucuJibBoKhlAUSjtgwu6+oCwT+YJA2HfPi8j4ZUuYMtltOual/sKjrirE5PuXYvD/c6TvY0WNRn5MlRy7ODgcqAs0wxTsz8y1UVRsYFbREGNOblAg/GHt4FGTgGh1Nqnmhm0Vac9xobsFrqx+CUdtrfaNi0V7YFG5uCunXo2NEXoqVMNlE/yO1A83c5DAYcJKdmzRKqcLso7jGAX87GFDVzEgLWn5JTStMqR6qKMJ+NZ1h27wSptn3wJZ1scLajzCPi4oUW45PuJN/1eRKkXTFWv2Ews4jYsPumoEmRjwWuAu0AdCUsiSncAe1CywA77sg1HWeHxfh8NR+DPwxHqBNEZZwUoFL1FvYUwzfE+puirli8urPtK2KQCsu5h34OAv0zm3RTFa/kTglrBzVsLLhfdW0G5G3xqwrv7ii8FNbTEqlTgw/mMqLPfqZtUrIaVC/tAIIAPWsGuKsRAIXgeO51wQwtuVXD+YHiCiQ31lVOWXBZWp6Sw93OI1pU0B8Sqwl+V/iDXSoIu58QPtQ98Ed9T21AULR2ReYSLsgYR09ApUrTlPXdQyLFVD0eHYB6oJ6oJVylkvV2/TBVi5YwxDsKa53cBA9l3GNuys6jvffhfLNYFofURKWd8bELv66v9R9/6wIIUb0YqbrA1HBPtxPVfxKcK/k/8uIeE/Nf3UFF+wL/kjHDFPs+ZVLF6C6R91Qq1sKqO+Wb/APrnEcC0nqrmAbvlLNfbh/8AsDtAbpJzVfQ9AgfDhzEvFA4rAiVgYRHcFOIFp3izbuHL7lhbtbMytvFSi5X5hdpCBkKGoL3BHCEu5VIQ82M0gpfKQAaUyOA3VEqCO+iXaqKqJctOfiNFIV0EAXZDt0cyqkK/Nw1Fi+IlxAqjnZqIcW4hVUkR46iuu+4KCXF8qiZJocvubhfhGv0RDmdOv1BnSz+ETjx4itc5E6uagLOSVusF/mbD8hGwNe99MD/rNiBR+wA/xCRVHxSb1Dhm33bMfH2P+XAPr9x9hPSYex8OoWfRz3L9xaivHECuINmwgXIqteo00bDcIEBKtL+4UZV9qhQEAhECHgSWoaFGr2HYR4RRAJChrfEQgd3rLV4vQ8s0WEFOSpahaDzLT8FzNqLYJo44IIIYqolnZGCyUXd9yhlsKDSgytPhh1rXtyHU/iIdqBwuJFhFoFqcNH3JO2NEsXuOKn67uNoDa1qUVxNvqGiWP8QwVxC2Ds41f3LV/wDmzuDYcmVFjiwStbRCUijMQh8zAtv1DLcexlMCf3OZ/wAAIjgH0f8AsH2N4QH7RLgEKYtfcX9v0VLQTsScabRCoM8leewjlXt2GhQhEg8WuWjBgw6hqAj3FwBQdl9/3EJdS+MeZXuosJrp6gbmniaWktCZcUNrrub5GDEt6l5YsL4C3ApsSADffzO233plp5hEVZlkzpIfSlavKRbHCW65E25YGr7Kmmym8x9EnRh4CdPNepfbXoNr1AEQhHyoepzmzSj+AMsXW51lEM7d4fmahOeYLzT3GqxKCWMGhjFRez0meo6NKNSKhlyAS2P3qfpuPjp7D/YBiy6V+0Dpscs7W0zO0coxRB8FVcHIsuXK4uQ6Fe4gVZtsScP7PUNcXERVQ2xgho8yzWwqVRSrsQFkGSuKKe4da3KLCte5x6IR3fRCT4L0eAPKvpBihIRSX7YzqZeLJT/UQUsXrCNKLcc/o3Ay/em7Hb8TM6BU2K3nUr9n+0qfWwFhQ9kQBEaTAaxjDksUVYYbSrhYR/5LAlmXBUCNvRkRjVuoEzha2VzqyOb+3cYXc2XLQKIHDSGAn8D8ThFct7IlTfh2cUM0RD9cckKUNvniD0+CMZcCwPsCU2a9RJ1ShjFUBfdHqJ7KhVmWfMGAl8wHFBnuYmqchLlhO6eIDa1z1CENg5ITCBqG8lcqcSnadvbCvC2OpRGiFNRMAkqybIEzTenslqB95Ce4huiivopgc6dGfMSsL8b+5RErnSpUQujZ9nEvmDHykK0Rb0tRGU3ykpWm0UzIQbu8xgAnAXpKKlcFkoYLVFcXAsIA9RCWBamGLQKtLuOpUvXZ8SgBDsQHnbV+YbjGVssUv3FW+Npe+E6YPXPsIlL9H19QmkbHwfI1rWaXHCitHqPYkCrbIEODDYu6mtl0dji92Aua4BN3Yr1L8JaL9Bh6grGLgfajIg4agPBSZ5HPEqB4WILlhGFiyJL9aL4GJc6X2CDpdzzxDNf4mk3SPYxitD0v/IOq/wAQgzfcdsaFS356ch1YRpOk5ZXxcK1d8U7+oiS+zg/B3CfsppKMHvKt/dx0A8gf0lMETp9S6gwsZR0F49/cdbsWzjj3MSjrVtIlCFNhHlTrJQ4sCQi9AUw0Ikgh3m0kIdtch/cwIvi46LT8WyysApvmUGGFGdNgKgq39EpRlWNaVA0Qds2WWaUSFqoTyZyhsNRBcS0MgKzCEOkIQhhLjAlRCCFgg16Y8WWnIQaiD1H3ULVY/jplsBp9lShEzQQ9hdPCPerXBFjQRXv5RgCwKVoj9R0Wf+JCoQCgMAhYJRUFBUctZLCidnH2jQKVROY5CH3cR5AJf3BSAyts/c2jxSLdktN47DuYSsClDuAVylwh2LFSwlvA17DqXD+yOJcthhgkDRQnsismSd9XHfKngJe6VjuBqu9lqlkOIBYLgtWWw4r1Lv4RGpD9DH1coypwxsjkVX4BxRYRZKm5RCjKuw7wOqGAAEY2RaYm0VqzzAQixiIXTjlUTalsI8AJmll7Qt/EvND8sVdudguCmpy1C/ohrGKEV+OAe2UJHrwGf4sc0KdrmWNbS9zvBfHGRoDBwPNQUF/aVbfiwJBHvEjBFzE9oKQxual2eOGUbToQixvzCu18q4lxZJwh1FWzjpgQQhoHcoEoIqbDVu+QPRK8qWHIHo+YhKTMQigeG+RZsQr2gGWXRFHxEbg0tZ+eh9soxAWb1KV7K3zUIRyVgccsN0xwIYgb9Sns2omBbcFa4KMXdZM2y/zlUxqB24S2F8Jcr1xLBSbCbsOU81socsoc4FfB7J2lse0ssTVQncMbIjsrhxdgNdq47qBmtMdRNlEttxSmzTkrAG4DthASFh0P/Yxd+MiFrMxWByIDABg2JZLG5iEJl/8AkReokoI9JK1uddyobJrG6NuT8y2ET14XXxKhNMRDJRqzZQJGs37gLgDkexgUmj9BcGvZGxqjjuEOhdnCzcoMlqal3RU4zEcouvRKheOQdEHxW2wDtgWRN2lLCIS0wGjj0yyY1s9vyxatd3BtgbyIUlETw14dx1KlEGmO4lJZFJj+HD2xUznqF9wwhCMYhpN/7ZjTWFcuZ5lDEHUQeL2Z2SjxUpQj7irSN17lDNoK1dPWDBBVwR/FkNMucKDdQFHEoKgrLXNLS7YvwnZNRVA2q2/4n9kPHMAfURLK/mWGFUKjGWWpaYz+fX+8QKDwUQEZUeRtCApY2gNjE5QIeEIcdsDa4EC4bHUU3GtxmheQiuUWo8ixLiAR8HY9aeAiIhYxYhnzdSlx9JCHCfwRVxQyqgBrHfxA0sUrjtvStl+X8T7XEFPbMjNzRU5jfa/ow8XUKmxORVMoaB82cyyY/OwBuxtxCDxcXY/yZUE+ZcS4yuLFWJCqyoykHkRcjBPt3EbLx1GEKMncJTOm2lMa0gFu4VgMJfAShk6oi/mRHaE+GKTGKNVAVZBo9kGgnB9VLxSpB1eXQUe3UBkLp30ks5z3FUPmGn6JqT5nM2HaQgLhu/1DwcyrUbOHQlUAKdScCm+D6Plh3QADoJrxXgxjxIkqV4WBGdSWxKzvkJpSNXGQrlV/pEEHLMUW4glycwtoQE1qS1mKyCgKDgJTBGADZmASriWtL3BRPNuQ+2EL0qfxIcziO1sRG2JKFnERb9MT0hUFTFuGD2PjTKneu7VSEgeTTsK/EZBTDd/iYuVPyxqN/wDpOR3/AO1Cdy6I98bA2b9NwioDAMtyoFJfPuXLKjLIB4qHI1RCV44jUt4bEmVaZ9wRcXUVSm1ZmjN9hcOrmiUfSBk9EueyJVsLQCYTmMKorUFnuqJK7Vqo+J3ZFcx7o4jMI4gckbIqNmDCIauCLpmG/kQx6PUasRR7fuMqCgflUuxctUJwjVqkeBEkeMb5uZpRApjcUFWd2cfjnfgeAXASCMdUq0OrYQ4jEaiA1lHFZlbSBXJVJZpzKSmD4xAbuLUVIqgcsKi4JWFYbKVKblyhLSfb1ArVHibRAnElhBlr4dGQVROUO9lcx6ICqBuum4wvaYijisu09pRDFIHEIcW/zf3Lzf8A9EDQs4EbSYFDreSi81KSWnwL2EJDqC3sUu+IiVxqmWKrlLc/BAEVPghyoQc8JMt1d+BU4ECyOJbpgjIIJcdacmCXbASUcRHqL7uceCxlweNwIBy+46U2r1yK0A0drBSFQGIzXQszgS6hbNlzbApg+KlFRjfzDi/bLfxUNegQoubaq3atlgmgivWMOiD/AP2G1gXCC713NoDvbIi1cqKY1WSVn4z/ADhAkCFEmJPf9F+9ReFEZutQomZjKyLIC1Fy+VCV7kbFoYAuki9T7LiKD+hik0raZwcjCjmZuwyFQ4PmM2FM+5X1ArqKrC9IXWtsyoh+PAwQbFJWxgleEIobeE2mn4ufwkMKN434m7E0c8KXVS7rQXuXBQ6QaB+EYOwyu8bwPZUQolrFdl/+wkISIQH2HUqU9oUIWT8M+M8FWjZf1KE0kV8tSgAo8QyHgqc490JunxFClkQ5TADCKWUhl7MfBggnPrcaNH5j7dlsRU50CUVHDxWnKALnoSynCM2pOx8vgLlhKqLHQx1Dk+5xRZeFh0Evioygs2nmW6QbTdxzvbdVlfEoqdMXBS+oWFiYvEoLEuKwk4insIMYh0x1eGb8AoDlA4OY/O49sJwRRQS1wDDMZfAOq3KixebiasnCnmBTVukLQyqy3Cjo8RFxvMsWdAkBdX5IAoVdp25rShUByAW7ME7QLUqXOCFm3Mtgsu/PMEVTOOh9kNB9rOL5+atjsn5IFbC57YOygsfG3+ElykFUN1U5hQCGDIalOwYBvAA0H5umXlCp1m9gfEAVqta91B38I7/JgxucFGlA5tABflcDPAdwwIBOCECyISDOJ1VD3OYoeKgutQLmDqagwlVWS0IWWisUS3OSo1EIx85GM39yzJVJQqhQiqKKlSq4YouSPmZB8v8AUMESR0y4JcAfdzeqYpFR7IpSWeruEqsutKH8wvBpWfH0wYANF1IrA0MeYzkZ9sILcShoFwKVXb/UePsf1MCXG7zjLqus/rIcE5RIxYQncTcKIBKlxHYqwxxFsYBeAYAQFp4kSxcsEYjL4WXXEXapiRoRMKWK7iosjl7BUa0haL5gBGJE8SvDFRHNwrJ6TEF00LRWwmwVxeBCnFZllkdyfV9x4ARe7A2xY+yTRXa5HEgyrctC1c67Uoy06eOfccGFtw1w7Yx3/wCOoUAh1PjIZPtX+zwfHjDyJcLlRlN3UCBi4p6n52IlPBfCj1EzVkC7CItJL2i4ACaPDHlOgzDINATjFXKZUYwwljFfitZz/wD3mAm8Qp2VAv2XGUUA4eyWVY7+YqqHYGEGyfbVbNGpWqDmHCWDg9Sq+92x0AnESLlwqhhDG8XlCyohq4KISZwg/wBghh8CPweFKFJwIQisTLgIPioIwNr7biqDK8B9R8VLitIyzwMA8kRKI1BGL4LEQLizvN+Ks53/AGiAosqS+HtgSh1lxCBWAexZcg2q9QIpsvYl3RllVOACwzRK99QeCq3EMQAvEKg4TDh8pYoDUSwp9LMCW1FAQIMGXcvwLrlLgwIRwYgQlbHmKEGLwo81USUuiBEIkEwwIcQgu56o8diLL44s7Z/XEYKsKjI0Xx3co0uU4NMu2g7EhUqmvpJoc/LLdqhtIKEKL2RS1ggCKlO9gVW+EgFp7Rfsx08E12aIt4TiRSYeZPAMuKjyiANJKdEWy5Z4AIMuX4LZYRNwCDCqKSziJlw74iLGMqDIMjHjK5mFl1aKYQqBtgOqRNCx3yKagqNgcHVQeVZ7+YAOW39RxBPgIRqnycQ4LICtQLG3JpFq5cW3D38qWhcWSzm239Tp4meDNRPCHzDNICXsuX4Lj4BjDDKr8D8YqOXYb8EgqO5EIhGpSVsHfBnzBX9xWOiwnwQaHY3i4XGWqyFcRsYQllXh3IQPqwZbhZSb12PJAE0uox25Q2FqiMfHC/YyzxdYJ7p0g5c5JxlxeAwgGXEtuCrL8efg7DiXLjDFxYoxYx8DngSIIx1gpuLdwItVHCcJmj7+4WFZ1UChcA1CFIujyjBTai16uL6+64ht3ZVzb3crbiG7YvuLuKrmpX3Hy1BIEdQU8CplAgH4Do/JOcFfivF4oeBpgwYAZcXwFCVly4x8Pgvh8DzYXGB4NSo6kcVP6l1TCCXhim3edi0Xoed6g8bgtnMJAweHcPhh4Rdd3kvGF/gsEmoABdscvFnIM5xYjARvm6Zol1XUfk1RIfEQ1cYqNKT/AGTigI2LyCDFgxS/AYvi4Pi5cWM3FFl+GMXyYykGzVxlQnNFYzkEOG1W0dmo1NVA1wSqHDiHRKSUtpzDF20MlKRfmpZXbxYBvQ1NgLAVqgv0Rxdh2k0/uPfojYWlv5P+pUQ4gFRRLBBgkG2UQqLDUICoOQSL4MCx8oUXyxYI+DdxzbhfBPBH4vF/87nIKzAUav7YLLxNS1pjUUsCCqiiUFbismscZRdHrk9RDp3uUkd70BXuDRA7Je72/wCpUuLPAEnc/kighOq4KsYPJQZcHweCyDLjFoWgx0iV4X/hjGPMMYvCjzNPF0R3LMqBKxMtEYK9wxqLVUpoNB0RBbR5Y2uR9Ym9tarJTNHy+YFrSpcCD10SpWWaqqGGh9y+PlhVEIuXq+v348K2BsXAvwHhIPNwYwxflgI3bDwLvi/kQrAoMXwoo7BK8OEFQYsnP8yxSPEek0dTypVoCvqYXcbZsR8C5gNh59J1Ev2ZO3amVC+jbhBaFWUianC/XLBWUKYggryC16lwvzKtIQajQc38K8SDBh4If8HwLL814uXLlzuXKJTGoMaiiwRIxjFs5+WdT2+2KqeVCOcbB7bBrUFHKIpOz6XEwOuVjErjcNx9kYe7o9Mpnwx76HLlQEzoIHfY4leSI7NjDkCn5Y56TnKAhSwNQjZwRQhBgwYQnUIeDiMXsHwstNeMeFgy4sHwxZLi2R8F/wCDUj3KiYMu/wAssnq2CQtu3maWp7SUtahVqxQYffoi0CrkNy28PFMH08MOdTdZzvJ9wGssAZ766idOpS2OO1RkF/ACBuwxg7LF01y848wYHggwh1Dzfi5cuLHyUuM6ly/Fxi+HI3OMfBRRjHJnSfGIG80dxXYp0g3Z0eOkLVi5zCuuAbIgLVwPApwyyvQU9y6WhxHYLnULBEKgqFscR345wNTx3isGBBhBZhF+RcHzcvZcuXOM6tgy4vCwjNly4r5YxxanDw5RVGS/c4JiBG90ZtVoTIqC6eoR0mF3DWjqcaVTN+fUb1sj8Kxyl/xHPLcFZYPB7n4ibgJgPBLIvtMPIOJWorzstksgXAnEIvC8CBlxYMXw4QCsuXFlx8LFiy4r4Yvg+HDwclwEzVS3Zg/mVksiqWliRp0qZ0IeZcaBcBMCApXST4hdfDEY6UcRdxddkGEnOkUoB+JfkHyhyBlnCR6/3BR/EPAbOsgr6Nl1LjyLyHhailwgZfgOUuWRBNDfLcAkuLsGKS7ixYwZcWXFi+RRlEd13xHhKDsY8XoloHZYSLi/VEwwe0dqjFSvL9y6IkJC7qcv0SoBdsKj1HgZaXQo2OLs6JnB4fqfcGpl142DkMEWmUk9kcUHwSiVA8jLihLlygjjFS7Y8y6fAH3LlxfFx8MYxRfCzD2zAEGkuD4XLp/WWmzh9xDiXpwfURXBR1HUlL0SEohK/JN4MSx3HxrRYOYcCoNnwlsPa6aSVa2DUKYuw6UyoBzf9bK8aeIgEpHx4rqO6DCYw8C4oPgZzKlPhYMuXFGADPOkJ7w+oAohLi1APEuMMjF8G7mPF7RxVd6uW2/EVv5hgY32XaWI9IyoGlzuy04OKq2M4oNajjk3iKRps97CmBVYLGWdNlowv6E4PA+qYKw5P5gQLIRHA5WibCKd1y+iKOsU+FRUMNJiDcUXkgy/Aiebly4wsGcJcHwu8eGXLiixYBHc0xUhHHTPiZjCjlAd5gg4/UCpN9sFI9HT4l3FS0veuYtI0ypTuVimX+JS1LF9sDvS6yzLQ2hlbuVdkVdeq2BeVP5ilWMNCSwuBuNQJdrqMRLd43Vy5Xcc6iYeF+SLLigwJRHyPgi8DBly4suXGUTKa8ygnsxRuKxPmenoiLXv/M+wVV1DasLjO8VKE7RlcxVhtDKSjOZevgruBau9EWOa7GrI3qDsJGMbKblL6dBzqdoQ/BIpjKWZ+oKH+WXRGzEMuq33EIQjYMpCDBlwfFy4oQv+OoyoEYT/AJLRWCxMRjjyXk5ZQZkTf0R4jGKL/OXD2YwJ+0sNlTWVnJGBW7JXYs7fMQRQeCaYbTLmfXNF3YahGmr12RFtV7iFLH9VCsFUAwF+nZqKHzKS0B+YGqc7W3DqUt/ClwYpcHxcvwHwXL8vlYypUqVKJUqD/gc4l1Krw3n/AHK1GOLbuPhi+INRoV7slXg5DphL0vlxgv8AgCBXgeviIhWDzUPISv4mTZPMeANbsbuj0kCarGpYhVPITvvXQwFvQdlMQBYVGodu7SMDL4FVGHktNh5AVuPIeBg74GXLlxfAwfFy4sv/APhcuLFjHFHpGUJ9S7ZzL6jqEgl6Vtvpue4aayARlR9Qz3kxLt8/M16q5lRV9rnEydMNdwcZUVUxD24JFFL0S6cgXkQNIuyoKAw0sFMPj5ikCiVlUAmjByL0hijYkuY4jxLIMOYMGXLly4oqDBzxfhfN+AxZcWLk2osYtTlGVFuLyCluYBQjKo7mBLo7IHNc3B6wMAKeOu5sGdXE1tbxGvBvZth4qKdqQFhS5dWovcQbB8xt6XlTPh3HkYt60OI1Oezu56PmrpuVBRykPbsPTmKS7uuHy+rGAuFAwg+CFhCxjdRS4MuLLl2R8XLl/wDCjSL4LI6kWME4IabZd+Ajf1jUY7DcKWMYvOPUUIr4Hqow5sfoSkboKytfqKRzqiXUOSs07RBVAuFksZTi/MWdPS6I5tPVzlLC42+1JYthuimFgBTsB9D0xzDYotMMwKYq1pCNdaY9QmvbjFCFUGaQxFnmoy4uQwPNw1LfF1LIsYuXLhCy48REU8AAy1m4rlhRQd44qA6gB6FsLjRQmpOUXZRDzUGgl/EZAt2rmR2lAORs+EKVQXSS2lfVwK8Jhgj2DBcR2+YzJA19kGTXS6imkpjwyozU2mrYRWrjkbuI1Ufdx9uzE8X6jDJTfCo8GGJZCmMpSFkHxfh8cCEvJ8Qly5d54v8A5Fy/C1RY8eLKqYcypOqwNjz4EFbSWeHLvgZe2D9IPSB8RAWcdoDt03kZk49kppWSkWu4cXRe4VAQcjyJZpKucwAtqgCUyqjvzTaGTsS3O2Tr5NSwNH1LqmHkbyOIHsisVtSmrT1d0+I4ZRfE5LolSGkUGMwRjzzZLlr4r/oTPC4uS3xRcdQ97DQTeNSvP5gDoHt4uJGzWZsRbHxEWAC15hNIMSCjHuNAWEVeKJVKAYC6b7xuGjAPDxC5KeRvDB09eQDSLUbA4pvBDHLMcGz1dTB4cXdRbiGuyNVL5l+4ql6dPzcpxQKxE98LloqYr8LiRpHUDKvg7BqWR2Hi68MWXLmkaS78uo+HFQrg5bLnFlqnLEUwq7lxjw8WolWl47Vhlg4EQ0VFdqYklC7ixKqB7JYNt+GI4XT8MRQBeOUCL5rI5NoamhLRBV9aQDno4dVKUaLkA0EsCBZZKg9oyJFyuhDQOOM5jdLV92+pUh1FxEZDEWeC4eNoy5cg8MJjqyHFxnIRRYv/AAYRY+FAVWAVDbsQN+D2aL6JSV6IjKaD7IzmWwfgkiv1gJzLg49S0yBiuXED2gNwsGeOTF2iu7gqJdZTzDyOwoQaOzYQW6Y/0w7rbk6g+y9y7FlOEyKVN2BSU6hopDrKzaFG8MPdLrCDfuMhN4FB9ePONiqHi4oxleFALnGLpEOZuNTZahuEqe4iWSyXF2DfhESIZdRZuNziajLqXG3UrGWA7gQXFtRIra7HRON+mMztpVxGNWGq6ZWsjglr3DsnPHdLnQLHHqONmi6gsbODsQqqdJypVyWIlzB+I3weDUNHVRV/LAJt6MUbBKacK1USmwHU7pXm5XbLRvRPuNrEueH+JgSt+Y5Bgvm/EWqWh4JKIAcjFE+aVRnc5gVK8QUrRks+MhNeF4zWt1HGd8Q1xdNIBviBpU3XEbFNrbYirYLU7szw4SiGFVRBCx5gli7OI2V+HcMhQnblB7nTMIIsPOFygtWHItxCqInA06HTL3fJnMR91CF7D20l1cUqmRuNyoNcmEqtbLpzsTVsv51kZYxSsIEPAx8JZBhFgy535HII+EhEYTDmU/KA3LJUTXgNR3s3xmxuVKvE3fA2GLWyl11A23QhY8jj4MvENAuliwytNLErX1N1tjk6cL1Hyb8TjocoBtUB6uDots8QoqbKrm/qGgCkmaQHnjk7lKFcxcRXm+iMKUhyeyLsslhTPcwAjRB4plw2HU4ls65XKEmnFcfmLt3ctc7pNEcWSvBsrwkCWxVk7l+Bb8mMSWjRKUxSI2y3jVQ5lLGuptrmPmNhcILZaWi6PzGtFmUQqqBqUZZ7lipU+YqcoKMt+DNIJLU/uNa3KS5B5jIEY9YxV22WCULiEW1nPxEp6HRfzBehzkDsB0kuU4URYa8uoXrYsJ7fxNA2uumVfN6mO0oNJgqMPoblwPxMMcIwJXkm3DZE2WwYSwdhHwcirE+9CLjBKSiN4zY4cvZxfkz3NgZO9ax3Pt5rI0std+I1Qd6lbepKOxV4OZqBpChAP/uNqvm1ZBrsIjOE2PFShUdi5JWoChftiJl47qJXDs4GLVbhHgoTd9kIt549MuALMEQlOQmqAlty+GkCwGkNIiFbXmMGnMVfZkBjijCVcqBKnL4MTwVcvwovB5LkhckgQam5sGQAxlKxLUgihcRbPeyyAiUPFS7TLUhxEKcGwXERpsbEiPo4eifmBXgKGew28OSZ5avcClqHLOZbBpp6uVikVDKe3mIoKB+YgYE7hFCREFWj7VNyqLOslYbroMdpM3VWEJqkwGQNESz9xcwrwrqWXcW6PMUDVUvTFEDkUwUNGEDsnuiv/gkEqJapyi7KR83CMYs2Fy6+fJlS4othuDnDCLH1rLT7wl4llG1qx3eSo+gcTa2t6eo2DFV11GAK9hWR7AB6yqgcH0krUAeY2VpH0XDox/b4l6YAr8xUcFCzipbIAMuWphcNu4ZyxxiIXLgghuklHcvUVZtlq1pSXyg0cXUN0LhGNooahNRxxi6IlYnMkDAgJgT+EuCWIeRh4NxylZ4A+GVCPHhfhhx4DJeeJ1mFLLQfk6grX5jgnIn3AYAvmthYyczTKxhqXe75I4C1FUslSaVIDLghjyh+cZakZhpXAt1ashlpvmsbnLQs5cPiPLvawYGhxcoYNrvqPZ7bzLPJq4cpNvBKEFKqUCWeKuZiDnhCKr9w2jqiL9xpToeYDWgbh2fiK4HW9OEXhRUpIowd8Bpg8QglRP8AhY8xm+GcZhFKyGiHRgfy0RCpQCrGU8pg9VlE4IzVIHv4li5pzKOamF5JnDgsuRwPxLLIARjoTfJ6jN1sKLpQ1guOXmcpvZZzC1dVweEMsVlRKXSmoKh1viGsnGnqFVajuXt5cGkDV8Zqm1AeSWFUSMHMOCiWygqdAsZn8R1jasWnILRjgw8ESEJwieFIkqVKiQiRIkrZWeNkOQImzoTRXRzKJ9HED2FX4nEmZXc69vdnojmp3Y8qWwBAn6qo5zKBos3q2CGkXX/6S53Yt+IQEoxchCAHmDfvPUZ6NGWNsYEG1mYjF6SjT1AXRX3cCJgi7Pcu4J2osqaLa5/EKWBKnYaay0sZig9Lmk1j3DgVClbEztculHuYI9zKawrmoJbd9jpBfMJIMGaf8HU5eC4krwSJKlR8p/wLBHmXanQIALCCFGt4qA2vQl7k5KSjTxrG1Bg2T8ST3fUqPAAXF0z/AChSiRQTpwh1xKS714gvJBrjkrbI+CRoqsO4haiBUCP08L3EV2DCRPQYLbujKKTerEYKqnER7FLXVQ8Qsf1GtAUDTOf2jQlaKVn1G/vuDZVVvVzNJrGGykXTUIVILHrcgEX/AEmGwDGKCeBiZFXJeDFPLGPhGCB5ME4xBcR248WQC1gSyRaEaR4uWkF5q4BiS73ZM1WpBSv1KMFllTLLXmXarRHNXHiaGAepcTL05sK7y4fTNpWNjmXCZ2QJsd3bMLdrcLAi1WORGRQDsRNFesGmWW7So66tmzsIhZeRpBgCjpVwYkY9eTu5hp+IxRqsto9xwRNNaSA3TnErnHlTxBgSugYJANu1QgH0GDLIQtvMHwzJkSxlGWyrwuPPMuZGMYKOKE945ACsYwuqVD7q56SERpyPVxET24iQlijBz+VxCkEF1MaF6TINouoDFYCtg4BDWcMQxJ2tRNkl8TSBrPzGIrbjDkbBcK4VpaDyRRYVx3HGkZVBpuEYr9syo0C/iB23hKkfZb3AlimKljWbFkq2GKEWmcxmtRgweqPE0iYrC4VIkPcUrZ0Jmq0xG1pKywXXJKxkamJfvoGa4YdxFYNxyHkgw/DaCGktLm+RG5nPWUCosilmkAbKvUZzgrj9VGwDFcT0i0BmrKwibwKrcWbb8nUB6WD2HqDq2oD5lhwOIHNKFKR9tPLUgKLlQQA2BFB2r+IBAC6h/K2kSzLVbKRCbF1sV0DnqofEuHtYsA6DZ8QZYNtjqK6H7lfUKm4ablE1WyvXkURn2HURWlX+Y5RDKwg1DHjsEDqOHUrENgJVhBpZQXZ01CCF9cfcKiLrnfsiqNb27AhQ4UJ4eIQ8XOEfL5yThifAiCF9loDrv5j0U33ANjELyYFTWKU5Cvnid82r4YmjS8rCWvKpRg31LQRDG/8AZoSShAynUepUNZZe2Z8vLb+SBgKttUNWOaOGEDNqj2iN4urljQfEuInvJdDhy32iaYswhC68w8EShc5EpKTz2wzwQbqGJz0IdZdhb0xdk2rTtxMH24RSjGl8n4lFBx6ikTRKCtQG4aWwFVNAnXca/EGrO6nJfklRTSw9Q5J9FHbme1Sq2z6ZTCOvr+4SAjwmkIDKMYu+GEYzt4UMIAq7LtXsce0uLxBSAbMNjkdEIheOYuiNka7ioLXKhdaTFS9wtNjHa21JTHFpCmmXmousf1NaNSr2XEH/AJ7fDL19FM4hHmso7qiFo2VwkD8SQQ13msq03Sn1G2hrXZcQAtVpzBM7WrysXQSy0Au2CdyiHhxBsQ6ek2JaZnWj2ZOvuBSiELviVbTiRLM5T3DNou154iXB3L6l1ur3IVZT9iBj5TWKHmWMDBht4p7iU1xwyp09MZSlp8DAvi78FJcai+JzDVWD4ESzHYOycjeeokqlQqLjMFKywEAxJUBhrE3vSbaGhQmOLIACsOr18Ra0U1yCCFGplYgspnA2+mmAZqd30EQS0EKNW1tckOtuTfIOqF1EiDmxL1KOTFpv8fLHhbSIcmnE6wOKgQofmX6nUQ0159xihAZYL5aIVimezAElQ+Vdw2urFLiiOdbYhv5le5Zg31CmqW6Hc0ah3Gtu1qAXUXT9wKixeZR3Oku0gZrL1ipZKylrHXQOYzoV0Oo3CU8ssSoW5y2V1ohzh18UoKV9dw+cNwk++UuYGNuorawGufSb4rY5UA0FPJs7Tq/cvRAv0R1aYb3cEq9v6md5BvzECqp9JOASXvSC38IyQPqXgFd1LjW9yyo03vzBzW5VFiQ+TIFWnxUMAvAj5mvy9fUEsexyuo0xzC09TceWoh/aIjFlXLl1UwgvRzb6jKr0Q6WYiJUsgkuqoRWNtOeYClGk4SzxxbUCW9NdeCpfPWKH1Cp1cq0W5uOW5dw3wawHSQ76i84twhFWNAnMTREplLLqkgrJXTEfIGkuboDHxWq05z3DZOMirV9T2QxdEatuAl2vi9jmOfJsED98i/EF7h2JGksfBLdJt63iWc+kFf3BEXRSWj3BAeTnsfcYqM1udWVkO4LMdwloU++Mh2A1sRZlVc7K7C8LEvGFdMHoS2wo9lcOP4q+5wYf51Fr1brHEWix5eIrRshgTFjThFUUBAVq4S+EvQfMwnSqo/egHe5dDbFsp+yM7QZKXJPT6gbOKOfc2u1S/iouAjAWob9Pb6uVrQtfNVamyDVXKG+DYmsQERZzFnQnIciQi9BxDCgNe9lgVGCbENlb7A81AsDVRGiRzfMs2qneEp1+0bip6YThfiHknpFpywu47kTRg55+5lYGsFs6kzBFZY366l4i6iQopZUrdtTOClIhZ9RhmzihOljsMEbSxIL5y2W+niVC3FGvc06M+gmJQ9QQfkwoaKGtcW8qw4rexfMdqodIvXFckN7il0JcSlWXEzyd3BVqImiQJYuRXlOWABo0Xf3sRp2m9pV/FcVCHhoPIpUOsAgZa1ehIOmu5S+1/QawnKI31KdEao7vvj6IW1AfP2tw22oZdM/vEJzHIzvI8GxzABJ/B2QrQxgcQWh3GptXYSorqhVhwAy5X9kVLyuPvDMQS1CDpQeXmIAVG+o/WKT/ANjao8UstrKI7PREwL9TNZDTMDZS5UrWJCBgcljWnEMGiPuVLkBaXUCiGXYMfSVW0OooZbs4IF7772Z80a2JkW3BVRPoOVKAdGMtQiz31DL8bc50BnHMV0hfZZKlB7S9QysE2yKLRxQNDvCqcGziE8LZ9kKl/wB3NyrHFDIfsuAvt7WTt6iUWR2inAVFu3NaQqKNVcqTDDqD0FLiSqsK3vYWoXoNSbv1tG+Zh/e+H5FwS3oA0ltf0VBIAFyA9zSsl1aKnOIzM+tV9qS2CebC3hab7aQW5ZgxBhc9AQwhY9hHA3pwKh72OxFmhNq7ckbpjyS111H56CK037MvG9WQBWqrAAqC8DkqJrEROVXKtYg1ksBeKO43RKUE6/CNeuw4opyPEGjiyUBXTmWhe8H9M0rtcXLogXbXqJuuVccrAyhBitBeqZK5gGs2CAKRtqbFZfV7DgikqnqL1bbljCQGwvzO+hLwLHB0Q6DnuGZKPA5K4UAXvZF0FbjwrXaKrJa4lMsW4S0RXDXzAlEpguB7uowBfMIH/cgHTa31kXEVcbN318xul7lArL17lXgLe7uK4xH4gL6lOOmAOGoRLouM7GIEGW6bxHRdVYS7A2eo6gAdyCAbBPYrmD7a4IdBWEHFaqWG8QCArCU+UY6iNZcqgEjqZHUpVDnGKo/EbaWkaqXDN4M6RBKx0QTXeHJhXcC3QvFEDKBaEstm6CU47/KjfA+fdShoRCQtqsiC1RzUNha7O5QqDE0aA91Dl2riOqac9QOXy1ZFYflNj9m7FIANalzFbyDVHuq4AAJGN2xVgWKI4mJYHudFA8xQDNIrDZ/aKYWwtQ9gsIqG267Kz6skp7qe3SwyDdjuF6tO/dRuweL9QzjsRNYutyDoc98x9pVX/wCkT1RWIbfNy+4FCJTTjxeEtVsPEsQvqklrnPUvtzXUn//Z\", \"width\": 20, \"height\": 12}, \"elements\": [{\"x\": 5, \"y\": 13, \"id\": \"9f7d45a1-789f-41dd-8130-49706ed333fb\", \"type\": \"text\", \"props\": {\"align\": \"center\", \"color\": \"#000\", \"label\": \"APOTEK SEHAT\", \"fontSize\": 12}, \"width\": 70, \"height\": 5}, {\"x\": 5, \"y\": 21, \"id\": \"61557168-c4b5-4f39-bf4f-b70651fc626f\", \"type\": \"text\", \"props\": {\"align\": \"center\", \"color\": \"#666\", \"label\": \"Jl. Kesehatan No. 123\", \"fontSize\": 8}, \"width\": 70, \"height\": 4}, {\"x\": 5, \"y\": 25, \"id\": \"4c37265e-afef-41a7-9b3a-1d8d09c65d3c\", \"type\": \"text\", \"props\": {\"align\": \"center\", \"color\": \"#666\", \"label\": \"Telp. 021-1234567\", \"fontSize\": 8}, \"width\": 70, \"height\": 4}, {\"x\": 5, \"y\": 30, \"id\": \"c1891f53-253b-48b1-9445-3261e8c315fd\", \"type\": \"line\", \"props\": {\"color\": \"#333\"}, \"width\": 70, \"height\": 0.3}, {\"x\": 5, \"y\": 32, \"id\": \"6b23148c-5415-4dc4-a070-32f1749bb30a\", \"type\": \"text\", \"props\": {\"align\": \"left\", \"color\": \"#000\", \"label\": \"\", \"binding\": \"invoice.number\", \"fontSize\": 8}, \"width\": 35, \"height\": 4}, {\"x\": 40, \"y\": 32, \"id\": \"c33a2e04-844f-46fc-8a05-5b69c2f83129\", \"type\": \"text\", \"props\": {\"align\": \"right\", \"color\": \"#000\", \"label\": \"\", \"binding\": \"invoice.date\", \"fontSize\": 8}, \"width\": 35, \"height\": 4}, {\"x\": 5, \"y\": 37, \"id\": \"d403fbaa-6bf9-4d4b-bd79-6089017f02b5\", \"type\": \"line\", \"props\": {\"color\": \"#333\"}, \"width\": 70, \"height\": 0.3}, {\"x\": 5, \"y\": 39, \"id\": \"27863340-7b7d-43b7-9c99-3a778f07f34e\", \"type\": \"text\", \"props\": {\"align\": \"left\", \"color\": \"#000\", \"label\": \"\", \"binding\": \"patient.name\", \"fontSize\": 8}, \"width\": 70, \"height\": 4}, {\"x\": 5, \"y\": 44, \"id\": \"ddb89953-d307-41fa-98b3-d39180cb4b24\", \"type\": \"line\", \"props\": {\"color\": \"#333\"}, \"width\": 70, \"height\": 0.3}, {\"x\": 5, \"y\": 46, \"id\": \"e7f87a39-76b5-4412-8d26-5c63b7b073e1\", \"type\": \"table\", \"props\": {\"rows\": [{\"no\": \"1\", \"qty\": \"10\", \"name\": \"Paracetamol 500mg\", \"price\": \"Rp 500\", \"subtotal\": \"Rp 5.000\"}, {\"no\": \"2\", \"qty\": \"5\", \"name\": \"Amoxicillin 250mg\", \"price\": \"Rp 1.200\", \"subtotal\": \"Rp 6.000\"}], \"align\": \"left\", \"color\": \"#000\", \"binding\": \"items\", \"columns\": [{\"key\": \"no\", \"align\": \"center\", \"label\": \"No\", \"width\": 12}, {\"key\": \"name\", \"align\": \"left\", \"label\": \"Nama Barang\", \"width\": 70}, {\"key\": \"qty\", \"align\": \"center\", \"label\": \"Qty\", \"width\": 18}, {\"key\": \"price\", \"align\": \"right\", \"label\": \"Harga\", \"width\": 30}, {\"key\": \"subtotal\", \"align\": \"right\", \"label\": \"Subtotal\", \"width\": 30}], \"fontSize\": 10}, \"width\": 70, \"height\": 55}, {\"x\": 5, \"y\": 103, \"id\": \"6976ac2e-91bb-427f-81e9-93da3b7796a3\", \"type\": \"line\", \"props\": {\"color\": \"#333\"}, \"width\": 70, \"height\": 0.3}, {\"x\": 5, \"y\": 105, \"id\": \"b2362914-15de-4140-bded-cf98197c8663\", \"type\": \"text\", \"props\": {\"align\": \"left\", \"color\": \"#000\", \"label\": \"TOTAL\", \"fontSize\": 9}, \"width\": 35, \"height\": 4}, {\"x\": 40, \"y\": 105, \"id\": \"3357ae51-2643-4dca-bb74-c33b10628c32\", \"type\": \"text\", \"props\": {\"align\": \"right\", \"color\": \"#000\", \"label\": \"\", \"binding\": \"invoice.total\", \"fontSize\": 9}, \"width\": 35, \"height\": 4}, {\"x\": 5, \"y\": 110, \"id\": \"868db1f5-6ebe-470f-9528-c7abd792f73c\", \"type\": \"text\", \"props\": {\"align\": \"left\", \"color\": \"#000\", \"label\": \"BAYAR\", \"fontSize\": 9}, \"width\": 35, \"height\": 4}, {\"x\": 40, \"y\": 110, \"id\": \"1c1c8e99-73e8-4300-983d-9f7795ba19e6\", \"type\": \"text\", \"props\": {\"align\": \"right\", \"color\": \"#000\", \"label\": \"\", \"binding\": \"invoice.paid\", \"fontSize\": 9}, \"width\": 35, \"height\": 4}, {\"x\": 5, \"y\": 115, \"id\": \"bb114e2c-afd2-40d3-894e-6d25f7f610fd\", \"type\": \"text\", \"props\": {\"align\": \"left\", \"color\": \"#000\", \"label\": \"KEMBALI\", \"fontSize\": 9}, \"width\": 35, \"height\": 4}, {\"x\": 40, \"y\": 115, \"id\": \"2f24cf20-8df4-41f2-bbf0-c74f7b68e4ac\", \"type\": \"text\", \"props\": {\"align\": \"right\", \"color\": \"#000\", \"label\": \"\", \"binding\": \"invoice.change\", \"fontSize\": 9}, \"width\": 35, \"height\": 4}, {\"x\": 5, \"y\": 121, \"id\": \"77a5deed-7d43-427f-935d-c0e386608241\", \"type\": \"line\", \"props\": {\"color\": \"#333\"}, \"width\": 70, \"height\": 0.3}, {\"x\": 5, \"y\": 123, \"id\": \"02d357b4-5fca-4a0f-aeaf-d481ccf1bd19\", \"type\": \"text\", \"props\": {\"align\": \"center\", \"color\": \"#000\", \"label\": \"Terima kasih\", \"fontSize\": 9}, \"width\": 70, \"height\": 4}, {\"x\": 30, \"y\": 128, \"id\": \"c788a71a-1c3e-4354-a9dd-25946d4904a1\", \"type\": \"qr\", \"props\": {\"label\": \"\", \"binding\": \"invoice.number\"}, \"width\": 20, \"height\": 20}]}', 1, '2026-11-12 06:30:16', '2026-11-12 06:30:16');

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` bigint UNSIGNED NOT NULL,
  `sku` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `barcode` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `name` varchar(180) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category_id` bigint UNSIGNED NOT NULL,
  `unit_id` bigint UNSIGNED NOT NULL,
  `purchase_price` decimal(18,2) NOT NULL DEFAULT '0.00',
  `selling_price` decimal(18,2) NOT NULL DEFAULT '0.00',
  `description` text COLLATE utf8mb4_unicode_ci,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_by` bigint UNSIGNED DEFAULT NULL,
  `updated_by` bigint UNSIGNED DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `sku`, `barcode`, `name`, `category_id`, `unit_id`, `purchase_price`, `selling_price`, `description`, `is_active`, `created_by`, `updated_by`, `created_at`, `updated_at`) VALUES
(1, '1234', '122222', 'amsasn', 1, 2, 2000.00, 2500.00, 'anmsnas', 1, 1, 1, '2026-11-06 18:19:28', '2026-11-15 00:20:56'),
(3, '676766', '9090', 'Kombantrin', 1, 2, 2.00, 3.00, 'kklsd12345', 1, 1, 1, '2026-11-06 18:28:12', '2026-11-14 23:21:19'),
(4, '1221', '1221', 'Vitacimin', 2, 2, 4999.90, 7500.00, 'lalalalala', 1, 1, 1, '2026-11-14 23:15:50', '2026-11-14 23:21:46'),
(5, '122122', '122123', 'Vitacimin 2', 2, 2, 4999.90, 7500.00, 'lalalalala', 1, 1, 1, '2026-11-14 23:15:50', '2026-11-14 23:21:46'),
(6, '22222', '22222', 'Rokok', 5, 2, 10000.00, 12500.00, 'nmxz', 1, 1, 1, '2026-11-19 06:32:58', '2026-11-19 06:32:58');

-- --------------------------------------------------------

--
-- Table structure for table `product_batches`
--

CREATE TABLE `product_batches` (
  `id` bigint UNSIGNED NOT NULL,
  `product_id` bigint UNSIGNED NOT NULL,
  `goods_receipt_item_id` bigint UNSIGNED NOT NULL,
  `batch_number` varchar(80) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expired_at` date DEFAULT NULL,
  `received_quantity` decimal(18,3) NOT NULL DEFAULT '0.000',
  `quantity_remaining` decimal(18,3) NOT NULL DEFAULT '0.000',
  `unit_cost` decimal(18,2) NOT NULL DEFAULT '0.00',
  `status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'available',
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `product_batches`
--

INSERT INTO `product_batches` (`id`, `product_id`, `goods_receipt_item_id`, `batch_number`, `expired_at`, `received_quantity`, `quantity_remaining`, `unit_cost`, `status`, `created_at`, `updated_at`) VALUES
(1, 3, 1, 'BATCH-001', '2026-11-30', 1.000, 1.000, 2500.00, 'available', '2026-11-06 20:24:37', '2026-11-07 00:38:29'),
(2, 1, 2, 'BATCH-002', '2026-12-12', 95.000, 94.000, 2000.00, 'available', '2026-11-09 22:10:36', '2026-11-11 18:08:50');

-- --------------------------------------------------------

--
-- Table structure for table `product_details`
--

CREATE TABLE `product_details` (
  `id` bigint UNSIGNED NOT NULL,
  `product_id` bigint UNSIGNED NOT NULL,
  `generic_name` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `active_ingredient` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `dosage_form` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `strength` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `drug_class` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bpom_number` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `requires_prescription` tinyint(1) NOT NULL DEFAULT '0',
  `unit_conversion` json DEFAULT NULL,
  `min_stock` int NOT NULL DEFAULT '0',
  `max_stock` int DEFAULT NULL,
  `rack_location` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `manufacturer` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `product_details`
--

INSERT INTO `product_details` (`id`, `product_id`, `generic_name`, `active_ingredient`, `dosage_form`, `strength`, `drug_class`, `bpom_number`, `requires_prescription`, `unit_conversion`, `min_stock`, `max_stock`, `rack_location`, `manufacturer`, `created_at`, `updated_at`) VALUES
(1, 1, 'Paracetamol', 'Zat ada', 'Tablet', '500 mg', 'bebas', 'DBL1234567890A1', 0, '{\"box\": 100, \"strip\": 10}', 20, 1000, 'A1', 'Kimia Farma', '2026-11-14 22:52:35', '2026-11-15 00:20:56'),
(2, 3, 'Pacet', 'Zat', 'Suspensi', '1000', 'bebas_terbatas', '123BPOM', 0, '{\"box\": 100}', 1, NULL, 'A2', 'Bandung', '2026-11-14 23:10:28', '2026-11-14 23:21:20'),
(3, 4, 'Pacet', NULL, 'Sirup', NULL, 'bebas', NULL, 1, NULL, 0, NULL, NULL, NULL, '2026-11-14 23:15:51', '2026-11-14 23:21:47'),
(4, 6, 'Paracetamol', 'Zat', 'Tablet', '500', 'bebas', NULL, 0, NULL, 1, 1000, NULL, NULL, '2026-11-19 06:32:58', '2026-11-19 06:32:58');

-- --------------------------------------------------------

--
-- Table structure for table `product_dosage_forms`
--

CREATE TABLE `product_dosage_forms` (
  `id` tinyint UNSIGNED NOT NULL,
  `name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `sort_order` smallint UNSIGNED NOT NULL DEFAULT '0',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `product_dosage_forms`
--

INSERT INTO `product_dosage_forms` (`id`, `name`, `sort_order`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'Tablet', 1, 1, '2026-11-14 22:34:59', '2026-11-14 22:34:59'),
(2, 'Kapsul', 2, 1, '2026-11-14 22:34:59', '2026-11-14 22:34:59'),
(3, 'Sirup', 3, 1, '2026-11-14 22:34:59', '2026-11-14 22:34:59'),
(4, 'Suspensi', 4, 1, '2026-11-14 22:34:59', '2026-11-14 22:34:59'),
(5, 'Salep', 5, 1, '2026-11-14 22:34:59', '2026-11-14 22:34:59'),
(6, 'Krim', 6, 1, '2026-11-14 22:34:59', '2026-11-14 22:34:59'),
(7, 'Tetes', 7, 1, '2026-11-14 22:34:59', '2026-11-14 22:34:59'),
(8, 'Injeksi', 8, 1, '2026-11-14 22:34:59', '2026-11-14 22:34:59'),
(9, 'Suppositoria', 9, 1, '2026-11-14 22:34:59', '2026-11-14 22:34:59'),
(10, 'Serbuk', 10, 1, '2026-11-14 22:34:59', '2026-11-14 22:34:59'),
(11, 'Gel', 11, 1, '2026-11-14 22:34:59', '2026-11-14 22:34:59'),
(12, 'Lainnya', 12, 1, '2026-11-14 22:34:59', '2026-11-14 22:34:59');

-- --------------------------------------------------------

--
-- Table structure for table `product_drug_classes`
--

CREATE TABLE `product_drug_classes` (
  `id` tinyint UNSIGNED NOT NULL,
  `code` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `label` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `sort_order` smallint UNSIGNED NOT NULL DEFAULT '0',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `product_drug_classes`
--

INSERT INTO `product_drug_classes` (`id`, `code`, `label`, `sort_order`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'bebas', 'Obat Bebas', 1, 1, '2026-11-14 22:34:28', '2026-11-14 22:34:28'),
(2, 'bebas_terbatas', 'Obat Bebas Terbatas', 2, 1, '2026-11-14 22:34:28', '2026-11-14 22:34:28'),
(3, 'keras', 'Obat Keras', 3, 1, '2026-11-14 22:34:28', '2026-11-14 22:34:28'),
(4, 'narkotika', 'Narkotika', 4, 1, '2026-11-14 22:34:28', '2026-11-14 22:34:28'),
(5, 'psikotropika', 'Psikotropika', 5, 1, '2026-11-14 22:34:28', '2026-11-14 22:34:28'),
(6, 'alkes', 'Alat Kesehatan', 6, 1, '2026-11-14 22:34:28', '2026-11-14 22:34:28'),
(7, 'umum', 'Umum', 7, 1, '2026-11-14 22:34:28', '2026-11-14 22:34:28');

-- --------------------------------------------------------

--
-- Table structure for table `purchase_orders`
--

CREATE TABLE `purchase_orders` (
  `id` bigint UNSIGNED NOT NULL,
  `order_number` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL,
  `supplier_id` bigint UNSIGNED NOT NULL,
  `purchase_mode` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'delivery',
  `order_date` date NOT NULL,
  `expected_date` date DEFAULT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draft',
  `subtotal` decimal(18,2) NOT NULL DEFAULT '0.00',
  `discount_amount` decimal(18,2) NOT NULL DEFAULT '0.00',
  `tax_amount` decimal(18,2) NOT NULL DEFAULT '0.00',
  `total_amount` decimal(18,2) NOT NULL DEFAULT '0.00',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_by` bigint UNSIGNED DEFAULT NULL,
  `updated_by` bigint UNSIGNED DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `purchase_orders`
--

INSERT INTO `purchase_orders` (`id`, `order_number`, `supplier_id`, `purchase_mode`, `order_date`, `expected_date`, `status`, `subtotal`, `discount_amount`, `tax_amount`, `total_amount`, `notes`, `created_by`, `updated_by`, `created_at`, `updated_at`) VALUES
(2, 'PO-2026-001', 1, 'delivery', '2026-11-06', '2026-12-06', 'received', 2217.00, 0.00, 0.00, 2217.00, NULL, 1, 1, '2026-11-06 19:38:26', '2026-11-06 20:24:37'),
(3, 'PO-20261109-316814', 1, 'delivery', '2026-11-09', '2026-11-09', 'partial', 192000.00, 0.00, 0.00, 192000.00, 'hjhhj', 1, 1, '2026-11-09 22:09:35', '2026-11-09 22:10:36'),
(4, 'PO-20261119-079025', 1, 'delivery', '2026-11-19', NULL, 'draft', 11990.00, 1.00, 1.00, 11990.00, 'sds', 1, 1, '2026-11-19 08:24:37', '2026-11-19 08:24:37');

-- --------------------------------------------------------

--
-- Table structure for table `purchase_order_items`
--

CREATE TABLE `purchase_order_items` (
  `id` bigint UNSIGNED NOT NULL,
  `purchase_order_id` bigint UNSIGNED NOT NULL,
  `product_id` bigint UNSIGNED NOT NULL,
  `quantity` decimal(18,3) NOT NULL DEFAULT '0.000',
  `unit_cost` decimal(18,2) NOT NULL DEFAULT '0.00',
  `discount_amount` decimal(18,2) NOT NULL DEFAULT '0.00',
  `subtotal` decimal(18,2) NOT NULL DEFAULT '0.00',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `purchase_order_items`
--

INSERT INTO `purchase_order_items` (`id`, `purchase_order_id`, `product_id`, `quantity`, `unit_cost`, `discount_amount`, `subtotal`, `notes`, `created_at`, `updated_at`) VALUES
(4, 2, 3, 1.000, 2500.00, 283.00, 2217.00, NULL, '2026-11-06 19:38:26', '2026-11-06 19:38:26'),
(5, 3, 1, 96.000, 2000.00, 0.00, 192000.00, NULL, '2026-11-09 22:09:35', '2026-11-09 22:09:35'),
(6, 4, 1, 1.000, 2000.00, 0.00, 2000.00, NULL, '2026-11-19 08:24:37', '2026-11-19 08:24:37'),
(7, 4, 6, 1.000, 10000.00, 10.00, 9990.00, NULL, '2026-11-19 08:24:37', '2026-11-19 08:24:37');

-- --------------------------------------------------------

--
-- Table structure for table `purchase_returns`
--

CREATE TABLE `purchase_returns` (
  `id` bigint UNSIGNED NOT NULL,
  `return_number` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL,
  `supplier_id` bigint UNSIGNED NOT NULL,
  `goods_receipt_id` bigint UNSIGNED NOT NULL,
  `return_date` date NOT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draft',
  `reason` text COLLATE utf8mb4_unicode_ci,
  `total_amount` decimal(18,2) NOT NULL DEFAULT '0.00',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_by` bigint UNSIGNED DEFAULT NULL,
  `updated_by` bigint UNSIGNED DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `purchase_return_items`
--

CREATE TABLE `purchase_return_items` (
  `id` bigint UNSIGNED NOT NULL,
  `purchase_return_id` bigint UNSIGNED NOT NULL,
  `goods_receipt_item_id` bigint UNSIGNED NOT NULL,
  `batch_id` bigint UNSIGNED NOT NULL,
  `quantity` decimal(18,3) NOT NULL DEFAULT '0.000',
  `unit_cost` decimal(18,2) NOT NULL DEFAULT '0.00',
  `subtotal` decimal(18,2) NOT NULL DEFAULT '0.00',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sales`
--

CREATE TABLE `sales` (
  `id` bigint UNSIGNED NOT NULL,
  `sale_number` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL,
  `customer_id` bigint UNSIGNED DEFAULT NULL,
  `sale_date` datetime NOT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draft',
  `subtotal` decimal(18,2) NOT NULL DEFAULT '0.00',
  `discount_amount` decimal(18,2) NOT NULL DEFAULT '0.00',
  `tax_amount` decimal(18,2) NOT NULL DEFAULT '0.00',
  `total_amount` decimal(18,2) NOT NULL DEFAULT '0.00',
  `paid_amount` decimal(18,2) NOT NULL DEFAULT '0.00',
  `amount_received` decimal(18,2) NOT NULL DEFAULT '0.00',
  `change_amount` decimal(18,2) NOT NULL DEFAULT '0.00',
  `payment_status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'unpaid',
  `settlement_mode` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'paid',
  `payment_method` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reference_number` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `due_date` date DEFAULT NULL,
  `collateral_note` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_by` bigint UNSIGNED DEFAULT NULL,
  `updated_by` bigint UNSIGNED DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sales`
--

INSERT INTO `sales` (`id`, `sale_number`, `customer_id`, `sale_date`, `status`, `subtotal`, `discount_amount`, `tax_amount`, `total_amount`, `paid_amount`, `amount_received`, `change_amount`, `payment_status`, `settlement_mode`, `payment_method`, `reference_number`, `due_date`, `collateral_note`, `notes`, `created_by`, `updated_by`, `created_at`, `updated_at`) VALUES
(8, 'POS-20261111-180848-347488', 1, '2026-11-11 18:08:48', 'posted', 2500.00, 0.00, 0.00, 2500.00, 2500.00, 100000.00, 97500.00, 'paid', 'paid', 'cash', NULL, NULL, NULL, NULL, 1, 1, '2026-11-11 18:08:48', '2026-11-11 18:08:50');

-- --------------------------------------------------------

--
-- Table structure for table `sales_audit_logs`
--

CREATE TABLE `sales_audit_logs` (
  `id` bigint UNSIGNED NOT NULL,
  `sale_id` bigint UNSIGNED NOT NULL,
  `action` varchar(50) NOT NULL,
  `old_status` varchar(20) DEFAULT NULL,
  `new_status` varchar(20) DEFAULT NULL,
  `user_id` bigint UNSIGNED DEFAULT NULL,
  `payload` json DEFAULT NULL,
  `created_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sales_returns`
--

CREATE TABLE `sales_returns` (
  `id` bigint UNSIGNED NOT NULL,
  `return_number` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL,
  `customer_id` bigint UNSIGNED NOT NULL,
  `sale_id` bigint UNSIGNED DEFAULT NULL,
  `delivery_id` bigint UNSIGNED DEFAULT NULL,
  `return_date` date NOT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draft',
  `reason` text COLLATE utf8mb4_unicode_ci,
  `total_amount` decimal(18,2) NOT NULL DEFAULT '0.00',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_by` bigint UNSIGNED DEFAULT NULL,
  `updated_by` bigint UNSIGNED DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sales_return_items`
--

CREATE TABLE `sales_return_items` (
  `id` bigint UNSIGNED NOT NULL,
  `sales_return_id` bigint UNSIGNED NOT NULL,
  `sale_item_id` bigint UNSIGNED DEFAULT NULL,
  `delivery_item_id` bigint UNSIGNED DEFAULT NULL,
  `batch_id` bigint UNSIGNED NOT NULL,
  `quantity` decimal(18,3) NOT NULL DEFAULT '0.000',
  `unit_price` decimal(18,2) NOT NULL DEFAULT '0.00',
  `subtotal` decimal(18,2) NOT NULL DEFAULT '0.00',
  `restockable` tinyint(1) NOT NULL DEFAULT '0',
  `condition_notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sale_items`
--

CREATE TABLE `sale_items` (
  `id` bigint UNSIGNED NOT NULL,
  `sale_id` bigint UNSIGNED NOT NULL,
  `product_id` bigint UNSIGNED NOT NULL,
  `batch_id` bigint UNSIGNED DEFAULT NULL,
  `quantity` decimal(18,3) NOT NULL DEFAULT '0.000',
  `unit_price` decimal(18,2) NOT NULL DEFAULT '0.00',
  `discount_amount` decimal(18,2) NOT NULL DEFAULT '0.00',
  `subtotal` decimal(18,2) NOT NULL DEFAULT '0.00',
  `unit_cost` decimal(18,2) NOT NULL DEFAULT '0.00',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sale_items`
--

INSERT INTO `sale_items` (`id`, `sale_id`, `product_id`, `batch_id`, `quantity`, `unit_price`, `discount_amount`, `subtotal`, `unit_cost`, `notes`, `created_at`, `updated_at`) VALUES
(8, 8, 1, 2, 1.000, 2500.00, 0.00, 2500.00, 2000.00, NULL, '2026-11-11 18:08:48', '2026-11-11 18:08:50');

-- --------------------------------------------------------

--
-- Table structure for table `sale_sync_requests`
--

CREATE TABLE `sale_sync_requests` (
  `id` bigint UNSIGNED NOT NULL,
  `user_id` int UNSIGNED NOT NULL,
  `idempotency_key` varchar(128) COLLATE utf8mb4_general_ci NOT NULL,
  `payload_hash` char(64) COLLATE utf8mb4_general_ci NOT NULL,
  `sale_id` bigint UNSIGNED DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `stock_movements`
--

CREATE TABLE `stock_movements` (
  `id` bigint UNSIGNED NOT NULL,
  `product_id` bigint UNSIGNED NOT NULL,
  `batch_id` bigint UNSIGNED NOT NULL,
  `movement_date` datetime NOT NULL,
  `movement_type` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `reference_type` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL,
  `reference_id` bigint UNSIGNED NOT NULL,
  `quantity_in` decimal(18,3) NOT NULL DEFAULT '0.000',
  `quantity_out` decimal(18,3) NOT NULL DEFAULT '0.000',
  `unit_cost` decimal(18,2) NOT NULL DEFAULT '0.00',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_by` bigint UNSIGNED DEFAULT NULL,
  `created_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `stock_movements`
--

INSERT INTO `stock_movements` (`id`, `product_id`, `batch_id`, `movement_date`, `movement_type`, `reference_type`, `reference_id`, `quantity_in`, `quantity_out`, `unit_cost`, `notes`, `created_by`, `created_at`) VALUES
(1, 3, 1, '2026-11-06 00:00:00', 'in', 'goods_receipt', 1, 1.000, 0.000, 2500.00, 'Goods Receipt GR-2026-001', 1, NULL),
(2, 3, 1, '2026-11-07 00:00:00', 'out', 'delivery', 2, 0.000, 1.000, 2500.00, 'Delivery DLV-2026-000002', 1, '2026-11-07 00:38:29'),
(3, 3, 1, '2026-11-06 00:00:00', 'in', 'sales_return', 1, 1.000, 0.000, 2500.00, 'Sales Return SR-20261106-3898', 1, '2026-11-07 01:12:42'),
(4, 1, 2, '2026-11-09 00:00:00', 'in', 'goods_receipt', 3, 95.000, 0.000, 2000.00, 'Goods Receipt GR-2026-002', 1, NULL),
(5, 1, 2, '2026-11-11 18:08:48', 'out', 'sale', 8, 0.000, 1.000, 2000.00, 'Penjualan POS POS-20261111-180848-347488', 1, '2026-11-11 18:08:50');

-- --------------------------------------------------------

--
-- Table structure for table `stock_opnames`
--

CREATE TABLE `stock_opnames` (
  `id` bigint UNSIGNED NOT NULL,
  `opname_number` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL,
  `opname_date` date NOT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draft',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_by` bigint UNSIGNED DEFAULT NULL,
  `updated_by` bigint UNSIGNED DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `stock_opnames`
--

INSERT INTO `stock_opnames` (`id`, `opname_number`, `opname_date`, `status`, `notes`, `created_by`, `updated_by`, `created_at`, `updated_at`) VALUES
(3, 'SO-2026-001', '2026-11-06', 'posted', '-', 1, 1, '2026-11-06 22:01:34', '2026-11-06 22:05:45');

-- --------------------------------------------------------

--
-- Table structure for table `stock_opname_items`
--

CREATE TABLE `stock_opname_items` (
  `id` bigint UNSIGNED NOT NULL,
  `stock_opname_id` bigint UNSIGNED NOT NULL,
  `product_id` bigint UNSIGNED NOT NULL,
  `batch_id` bigint UNSIGNED NOT NULL,
  `system_quantity` decimal(18,3) NOT NULL DEFAULT '0.000',
  `counted_quantity` decimal(18,3) DEFAULT NULL,
  `difference_quantity` decimal(18,3) DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `stock_opname_items`
--

INSERT INTO `stock_opname_items` (`id`, `stock_opname_id`, `product_id`, `batch_id`, `system_quantity`, `counted_quantity`, `difference_quantity`, `notes`, `created_at`, `updated_at`) VALUES
(1, 3, 3, 1, 1.000, 1.000, 0.000, '', '2026-11-06 22:01:34', '2026-11-06 22:05:44');

-- --------------------------------------------------------

--
-- Table structure for table `suppliers`
--

CREATE TABLE `suppliers` (
  `id` bigint UNSIGNED NOT NULL,
  `code` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` text COLLATE utf8mb4_unicode_ci,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_by` bigint UNSIGNED DEFAULT NULL,
  `updated_by` bigint UNSIGNED DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `suppliers`
--

INSERT INTO `suppliers` (`id`, `code`, `name`, `phone`, `email`, `address`, `is_active`, `created_by`, `updated_by`, `created_at`, `updated_at`) VALUES
(1, 'SUP-001', 'abcd', '0988', 'abcd@gmail.com', 'ksalks', 1, 1, NULL, '2026-11-06 18:52:05', '2026-11-06 18:52:05');

-- --------------------------------------------------------

--
-- Table structure for table `supplier_payments`
--

CREATE TABLE `supplier_payments` (
  `id` bigint UNSIGNED NOT NULL,
  `payment_number` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL,
  `supplier_id` bigint UNSIGNED NOT NULL,
  `purchase_order_id` bigint UNSIGNED DEFAULT NULL,
  `payment_date` date NOT NULL,
  `amount` decimal(18,2) NOT NULL DEFAULT '0.00',
  `payment_method` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `reference_number` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_by` bigint UNSIGNED DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `units`
--

CREATE TABLE `units` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(60) COLLATE utf8mb4_unicode_ci NOT NULL,
  `abbreviation` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `units`
--

INSERT INTO `units` (`id`, `name`, `abbreviation`, `created_at`, `updated_at`) VALUES
(1, 'Kilo Gram', 'kg', '2026-11-06 17:44:21', '2026-11-06 17:44:21'),
(2, 'Botol', 'btl', '2026-11-06 17:44:35', '2026-11-06 17:59:48');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `cash_transactions`
--
ALTER TABLE `cash_transactions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `transaction_number` (`transaction_number`),
  ADD KEY `transaction_date` (`transaction_date`),
  ADD KEY `transaction_type` (`transaction_type`),
  ADD KEY `reference_type_reference_id` (`reference_type`,`reference_id`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD KEY `idx_categories_module` (`module`),
  ADD KEY `idx_categories_type` (`type`);

--
-- Indexes for table `category_types`
--
ALTER TABLE `category_types`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_module_code` (`module`,`code`);

--
-- Indexes for table `customers`
--
ALTER TABLE `customers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`),
  ADD UNIQUE KEY `uq_customers_member_number` (`member_number`),
  ADD UNIQUE KEY `uq_customers_barcode` (`barcode`),
  ADD KEY `name` (`name`),
  ADD KEY `customer_type` (`customer_type`),
  ADD KEY `idx_customers_code` (`code`);

--
-- Indexes for table `customer_payments`
--
ALTER TABLE `customer_payments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `payment_number` (`payment_number`),
  ADD KEY `customer_id` (`customer_id`),
  ADD KEY `distribution_order_id` (`distribution_order_id`),
  ADD KEY `payment_date` (`payment_date`);

--
-- Indexes for table `deliveries`
--
ALTER TABLE `deliveries`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `delivery_number` (`delivery_number`),
  ADD KEY `distribution_order_id` (`distribution_order_id`),
  ADD KEY `delivery_date` (`delivery_date`),
  ADD KEY `status` (`status`);

--
-- Indexes for table `delivery_items`
--
ALTER TABLE `delivery_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `delivery_id` (`delivery_id`),
  ADD KEY `distribution_item_id` (`distribution_item_id`),
  ADD KEY `batch_id` (`batch_id`);

--
-- Indexes for table `distribution_items`
--
ALTER TABLE `distribution_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `distribution_order_id` (`distribution_order_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `distribution_orders`
--
ALTER TABLE `distribution_orders`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `order_number` (`order_number`),
  ADD KEY `customer_id` (`customer_id`),
  ADD KEY `order_date` (`order_date`),
  ADD KEY `status` (`status`);

--
-- Indexes for table `expenses`
--
ALTER TABLE `expenses`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `expense_number` (`expense_number`),
  ADD KEY `expense_date` (`expense_date`),
  ADD KEY `category` (`category`);

--
-- Indexes for table `goods_receipts`
--
ALTER TABLE `goods_receipts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `receipt_number` (`receipt_number`),
  ADD KEY `purchase_order_id` (`purchase_order_id`),
  ADD KEY `received_date` (`received_date`),
  ADD KEY `status` (`status`);

--
-- Indexes for table `goods_receipt_items`
--
ALTER TABLE `goods_receipt_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `goods_receipt_id` (`goods_receipt_id`),
  ADD KEY `purchase_order_item_id` (`purchase_order_item_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `print_templates`
--
ALTER TABLE `print_templates`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `sku` (`sku`),
  ADD KEY `barcode` (`barcode`),
  ADD KEY `category_id` (`category_id`),
  ADD KEY `unit_id` (`unit_id`);

--
-- Indexes for table `product_batches`
--
ALTER TABLE `product_batches`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_id` (`product_id`),
  ADD KEY `goods_receipt_item_id` (`goods_receipt_item_id`),
  ADD KEY `batch_number` (`batch_number`),
  ADD KEY `expired_at` (`expired_at`),
  ADD KEY `product_id_expired_at` (`product_id`,`expired_at`),
  ADD KEY `idx_product_batches_product_status` (`product_id`,`status`,`quantity_remaining`);

--
-- Indexes for table `product_details`
--
ALTER TABLE `product_details`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `product_id` (`product_id`),
  ADD KEY `drug_class` (`drug_class`);

--
-- Indexes for table `product_dosage_forms`
--
ALTER TABLE `product_dosage_forms`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD KEY `is_active` (`is_active`);

--
-- Indexes for table `product_drug_classes`
--
ALTER TABLE `product_drug_classes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`),
  ADD KEY `is_active` (`is_active`);

--
-- Indexes for table `purchase_orders`
--
ALTER TABLE `purchase_orders`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `order_number` (`order_number`),
  ADD KEY `supplier_id` (`supplier_id`),
  ADD KEY `order_date` (`order_date`),
  ADD KEY `status` (`status`);

--
-- Indexes for table `purchase_order_items`
--
ALTER TABLE `purchase_order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `purchase_order_id` (`purchase_order_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `purchase_returns`
--
ALTER TABLE `purchase_returns`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `return_number` (`return_number`),
  ADD KEY `supplier_id` (`supplier_id`),
  ADD KEY `goods_receipt_id` (`goods_receipt_id`),
  ADD KEY `return_date` (`return_date`),
  ADD KEY `status` (`status`);

--
-- Indexes for table `purchase_return_items`
--
ALTER TABLE `purchase_return_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `purchase_return_id` (`purchase_return_id`),
  ADD KEY `goods_receipt_item_id` (`goods_receipt_item_id`),
  ADD KEY `batch_id` (`batch_id`);

--
-- Indexes for table `sales`
--
ALTER TABLE `sales`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_sale_number` (`sale_number`),
  ADD KEY `customer_id` (`customer_id`),
  ADD KEY `sale_date` (`sale_date`),
  ADD KEY `status` (`status`),
  ADD KEY `payment_status` (`payment_status`),
  ADD KEY `idx_sales_status_id` (`status`,`id`);

--
-- Indexes for table `sales_audit_logs`
--
ALTER TABLE `sales_audit_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sale_id` (`sale_id`),
  ADD KEY `created_at` (`created_at`);

--
-- Indexes for table `sales_returns`
--
ALTER TABLE `sales_returns`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `return_number` (`return_number`),
  ADD KEY `customer_id` (`customer_id`),
  ADD KEY `delivery_id` (`delivery_id`),
  ADD KEY `return_date` (`return_date`),
  ADD KEY `status` (`status`);

--
-- Indexes for table `sales_return_items`
--
ALTER TABLE `sales_return_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sales_return_id` (`sales_return_id`),
  ADD KEY `delivery_item_id` (`delivery_item_id`),
  ADD KEY `batch_id` (`batch_id`);

--
-- Indexes for table `sale_items`
--
ALTER TABLE `sale_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sale_id` (`sale_id`),
  ADD KEY `product_id` (`product_id`),
  ADD KEY `batch_id` (`batch_id`),
  ADD KEY `idx_sale_items_sale_id` (`sale_id`);

--
-- Indexes for table `sale_sync_requests`
--
ALTER TABLE `sale_sync_requests`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_sale_sync_user_key` (`user_id`,`idempotency_key`),
  ADD KEY `sale_sync_requests_sale_id_index` (`sale_id`);

--
-- Indexes for table `stock_movements`
--
ALTER TABLE `stock_movements`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_id` (`product_id`),
  ADD KEY `batch_id` (`batch_id`),
  ADD KEY `movement_date` (`movement_date`),
  ADD KEY `reference_type_reference_id` (`reference_type`,`reference_id`),
  ADD KEY `product_id_movement_date` (`product_id`,`movement_date`);

--
-- Indexes for table `stock_opnames`
--
ALTER TABLE `stock_opnames`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `opname_number` (`opname_number`),
  ADD KEY `opname_date` (`opname_date`),
  ADD KEY `status` (`status`);

--
-- Indexes for table `stock_opname_items`
--
ALTER TABLE `stock_opname_items`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `stock_opname_id_batch_id` (`stock_opname_id`,`batch_id`),
  ADD KEY `stock_opname_id` (`stock_opname_id`),
  ADD KEY `product_id` (`product_id`),
  ADD KEY `batch_id` (`batch_id`);

--
-- Indexes for table `suppliers`
--
ALTER TABLE `suppliers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`),
  ADD KEY `name` (`name`);

--
-- Indexes for table `supplier_payments`
--
ALTER TABLE `supplier_payments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `payment_number` (`payment_number`),
  ADD KEY `supplier_id` (`supplier_id`),
  ADD KEY `purchase_order_id` (`purchase_order_id`),
  ADD KEY `payment_date` (`payment_date`);

--
-- Indexes for table `units`
--
ALTER TABLE `units`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD UNIQUE KEY `abbreviation` (`abbreviation`);

--
-- AUTO_INCREMENT for dumped tables
--


--
-- Constraints for table `customer_payments`
--
ALTER TABLE `customer_payments`
  ADD CONSTRAINT `customer_payments_customer_id_foreign` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `customer_payments_distribution_order_id_foreign` FOREIGN KEY (`distribution_order_id`) REFERENCES `distribution_orders` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `deliveries`
--
ALTER TABLE `deliveries`
  ADD CONSTRAINT `deliveries_distribution_order_id_foreign` FOREIGN KEY (`distribution_order_id`) REFERENCES `distribution_orders` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `delivery_items`
--
ALTER TABLE `delivery_items`
  ADD CONSTRAINT `delivery_items_batch_id_foreign` FOREIGN KEY (`batch_id`) REFERENCES `product_batches` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `delivery_items_delivery_id_foreign` FOREIGN KEY (`delivery_id`) REFERENCES `deliveries` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `delivery_items_distribution_item_id_foreign` FOREIGN KEY (`distribution_item_id`) REFERENCES `distribution_items` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `distribution_items`
--
ALTER TABLE `distribution_items`
  ADD CONSTRAINT `distribution_items_distribution_order_id_foreign` FOREIGN KEY (`distribution_order_id`) REFERENCES `distribution_orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `distribution_items_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `distribution_orders`
--
ALTER TABLE `distribution_orders`
  ADD CONSTRAINT `distribution_orders_customer_id_foreign` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `goods_receipts`
--
ALTER TABLE `goods_receipts`
  ADD CONSTRAINT `goods_receipts_purchase_order_id_foreign` FOREIGN KEY (`purchase_order_id`) REFERENCES `purchase_orders` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `goods_receipt_items`
--
ALTER TABLE `goods_receipt_items`
  ADD CONSTRAINT `goods_receipt_items_goods_receipt_id_foreign` FOREIGN KEY (`goods_receipt_id`) REFERENCES `goods_receipts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `goods_receipt_items_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `goods_receipt_items_purchase_order_item_id_foreign` FOREIGN KEY (`purchase_order_item_id`) REFERENCES `purchase_order_items` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `products_category_id_foreign` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `products_unit_id_foreign` FOREIGN KEY (`unit_id`) REFERENCES `units` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `product_batches`
--
ALTER TABLE `product_batches`
  ADD CONSTRAINT `product_batches_goods_receipt_item_id_foreign` FOREIGN KEY (`goods_receipt_item_id`) REFERENCES `goods_receipt_items` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `product_batches_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `product_details`
--
ALTER TABLE `product_details`
  ADD CONSTRAINT `product_details_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `purchase_orders`
--
ALTER TABLE `purchase_orders`
  ADD CONSTRAINT `purchase_orders_supplier_id_foreign` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `purchase_order_items`
--
ALTER TABLE `purchase_order_items`
  ADD CONSTRAINT `purchase_order_items_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `purchase_order_items_purchase_order_id_foreign` FOREIGN KEY (`purchase_order_id`) REFERENCES `purchase_orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `purchase_returns`
--
ALTER TABLE `purchase_returns`
  ADD CONSTRAINT `purchase_returns_goods_receipt_id_foreign` FOREIGN KEY (`goods_receipt_id`) REFERENCES `goods_receipts` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `purchase_returns_supplier_id_foreign` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `purchase_return_items`
--
ALTER TABLE `purchase_return_items`
  ADD CONSTRAINT `purchase_return_items_batch_id_foreign` FOREIGN KEY (`batch_id`) REFERENCES `product_batches` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `purchase_return_items_goods_receipt_item_id_foreign` FOREIGN KEY (`goods_receipt_item_id`) REFERENCES `goods_receipt_items` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `purchase_return_items_purchase_return_id_foreign` FOREIGN KEY (`purchase_return_id`) REFERENCES `purchase_returns` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `sales`
--
ALTER TABLE `sales`
  ADD CONSTRAINT `sales_customer_id_foreign` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `sales_returns`
--
ALTER TABLE `sales_returns`
  ADD CONSTRAINT `sales_returns_customer_id_foreign` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `sales_returns_delivery_id_foreign` FOREIGN KEY (`delivery_id`) REFERENCES `deliveries` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `sales_return_items`
--
ALTER TABLE `sales_return_items`
  ADD CONSTRAINT `sales_return_items_batch_id_foreign` FOREIGN KEY (`batch_id`) REFERENCES `product_batches` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `sales_return_items_delivery_item_id_foreign` FOREIGN KEY (`delivery_item_id`) REFERENCES `delivery_items` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `sales_return_items_sales_return_id_foreign` FOREIGN KEY (`sales_return_id`) REFERENCES `sales_returns` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `sale_items`
--
ALTER TABLE `sale_items`
  ADD CONSTRAINT `sale_items_batch_id_foreign` FOREIGN KEY (`batch_id`) REFERENCES `product_batches` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `sale_items_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `sale_items_sale_id_foreign` FOREIGN KEY (`sale_id`) REFERENCES `sales` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `sale_sync_requests`
--
ALTER TABLE `sale_sync_requests`
  ADD CONSTRAINT `sale_sync_requests_sale_id_foreign` FOREIGN KEY (`sale_id`) REFERENCES `sales` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

--
-- Constraints for table `stock_movements`
--
ALTER TABLE `stock_movements`
  ADD CONSTRAINT `stock_movements_batch_id_foreign` FOREIGN KEY (`batch_id`) REFERENCES `product_batches` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `stock_movements_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `stock_opname_items`
--
ALTER TABLE `stock_opname_items`
  ADD CONSTRAINT `stock_opname_items_batch_id_foreign` FOREIGN KEY (`batch_id`) REFERENCES `product_batches` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `stock_opname_items_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `stock_opname_items_stock_opname_id_foreign` FOREIGN KEY (`stock_opname_id`) REFERENCES `stock_opnames` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `supplier_payments`
--
ALTER TABLE `supplier_payments`
  ADD CONSTRAINT `supplier_payments_purchase_order_id_foreign` FOREIGN KEY (`purchase_order_id`) REFERENCES `purchase_orders` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `supplier_payments_supplier_id_foreign` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
