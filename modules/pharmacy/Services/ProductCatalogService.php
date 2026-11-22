<?php

declare(strict_types=1);

namespace Modules\Pharmacy\Services;

use Config\Database;
use Modules\Pharmacy\Exceptions\DomainException;
use Modules\Pharmacy\Models\Master\CategoryModel;
use Modules\Pharmacy\Models\Master\UnitModel;
use Modules\Pharmacy\Repositories\ProductRepository;
use Modules\Pharmacy\Repositories\ProductUnitRepository;
use Modules\Pharmacy\Repositories\ProductAttributeRepository;
use Modules\Pharmacy\Repositories\ProductPriceRepository;

class ProductCatalogService
{
    private $db;

    public function __construct(
        private ProductRepository $products = new ProductRepository(),
        private ProductUnitRepository $units = new ProductUnitRepository(),
        private ProductAttributeRepository $attributes = new ProductAttributeRepository(),
        private ProductPriceService $prices = new ProductPriceService(),
        private CategoryModel $categories = new CategoryModel(),
        private UnitModel $unitModel = new UnitModel(),
    ) {
        $this->db = Database::connect('pharmacy');
    }

    // ─────────────────────────────────────────────
    // Read
    // ─────────────────────────────────────────────

    public function list(array $filters, int $page, int $perPage): array
    {
        $result = $this->products->paginate($filters, $page, $perPage);
        $result['items'] = $this->attachRelations($result['items']);

        return $result;
    }

    public function detail(int $id): array
    {
        $product = $this->products->findById($id);

        if (!$product) {
            throw DomainException::notFound('Produk tidak ditemukan.');
        }

        return $this->attachRelations([$product])[0];
    }

    public function purchaseUnits(int $id): array
    {
        $product = $this->products->findRawById($id);

        if (!$product) {
            throw DomainException::notFound('Produk tidak ditemukan.');
        }

        return [
            'product_id' => $id,
            'product_name' => $product['name'],
            'items' => $this->units->getPurchaseUnits($id),
        ];
    }

    public function prices(int $id): array
    {
        if (!$this->products->findRawById($id)) {
            throw DomainException::notFound('Produk tidak ditemukan.');
        }

        return [
            'product_id' => $id,
            'items' => $this->getPriceRepository()->getByProductId($id),
        ];
    }

    public function attributes(int $id): array
    {
        if (!$this->products->findRawById($id)) {
            throw DomainException::notFound('Produk tidak ditemukan.');
        }

        return $this->attributes->getByProductId($id);
    }

    // ─────────────────────────────────────────────
    // Create
    // ─────────────────────────────────────────────


    /* public function create(array $data, int $userId): array
    {
        $this->assertUniqueSku(trim((string) ($data['sku'] ?? '')));
        $this->assertUniqueBarcode(
            !empty($data['barcode']) ? trim((string) $data['barcode']) : null
        );
        $this->assertCategoryExists((int) $data['category_id']);
        $this->assertUnitExists((int) $data['unit_id']);

        $this->db->transBegin();

        try {
            $productId = $this->insertProduct($data, $userId);

            $this->createBaseUnit($productId, $data);

            if (array_key_exists('prices', $data)) {
                $this->saveExtraPrices($productId, $data['prices']);
            } else {
                $this->createInitialPrice($productId, $data);
            }

            $this->saveExtraUnits($productId, $data['units'] ?? []);
            $this->saveAttributes($productId, $data['attributes'] ?? [], $userId);

            if ($this->db->transStatus() === false) {
                throw new \RuntimeException('Transaksi pembuatan produk gagal.');
            }

            $this->db->transCommit();
        } catch (\Throwable $e) {
            $this->db->transRollback();

            if ($e instanceof DomainException) {
                throw $e;
            }

            throw new \RuntimeException(
                'Gagal membuat produk: ' . $e->getMessage(),
                0,
                $e
            );
        }

        return $this->detail($productId);
    } */

    public function create(array $data, int $userId): array
    {
        $autoSku = !empty($data['sku_auto_generated']);

        $dosageForm = $this->getDosageForm($data['attributes'] ?? []);

        $prefix = $this->buildSkuPrefix(
            (int) $data['category_id'],
            $dosageForm
        );
        $lockName = $autoSku
            ? $this->acquireSkuLock($prefix)
            : null;

        try {
            $this->assertUniqueBarcode(
                !empty($data['barcode'])
                    ? trim((string) $data['barcode'])
                    : null
            );

            $this->assertCategoryExists((int) $data['category_id']);
            $this->assertUnitExists((int) $data['unit_id']);

            $this->db->transBegin();

            try {
                if ($autoSku) {
                    $data['sku'] = $this->nextSku($prefix);
                }

                $sku = trim((string) ($data['sku'] ?? ''));

                if (
                    !preg_match('/^[A-Z]{3}-[A-Z]{3}-[0-9]{3,}$/', $sku)
                    || strpos($sku, $prefix . '-') !== 0
                ) {
                    throw DomainException::validation(
                        'SKU tidak sesuai dengan modul dan kategori produk.'
                    );
                }

                $this->assertUniqueSku($sku);
                $data['sku'] = $sku;

                $productId = $this->insertProduct($data, $userId);

                $this->createBaseUnit($productId, $data);

                if (array_key_exists('prices', $data)) {
                    $this->saveExtraPrices($productId, $data['prices']);
                } else {
                    $this->createInitialPrice($productId, $data);
                }

                $this->saveExtraUnits($productId, $data['units'] ?? []);
                $this->saveAttributes($productId, $data['attributes'] ?? [], $userId);

                if ($this->db->transStatus() === false) {
                    throw new \RuntimeException(
                        'Transaksi pembuatan produk gagal.'
                    );
                }

                $this->db->transCommit();

            } catch (\Throwable $e) {
                $this->db->transRollback();
                throw $e;
            }

            return $this->detail($productId);

        } finally {
            if ($lockName !== null) {
                $this->db->query(
                    'SELECT RELEASE_LOCK(?)',
                    [$lockName]
                );
            }
        }
    }

    private function getDosageForm(array $attributes): string
    {
        foreach ($attributes as $attribute) {
            if (
                ($attribute['attr_type'] ?? '') === 'pharmacy'
                && is_array($attribute['value_json'] ?? null)
            ) {
                return trim(
                    (string) ($attribute['value_json']['dosage_form'] ?? '')
                );
            }
        }

        return '';
    }

    // ─────────────────────────────────────────────
    // Update
    // ─────────────────────────────────────────────


    public function update(int $id, array $data, int $userId): array
    {
        $current = $this->products->findRawById($id);

        if (!$current) {
            throw DomainException::notFound('Produk tidak ditemukan.');
        }

        if (isset($data['sku'])) {
            $this->assertUniqueSku(trim((string) $data['sku']), $id);
        }

        if (array_key_exists('barcode', $data)) {
            $barcode = trim((string) $data['barcode']);
            $data['barcode'] = $barcode !== '' ? $barcode : null;

            $this->assertUniqueBarcode($data['barcode'], $id);
        }

        if (isset($data['category_id'])) {
            $this->assertCategoryExists((int) $data['category_id']);
        }

        if (isset($data['unit_id'])) {
            $newUnitId = (int) $data['unit_id'];

            $this->assertUnitExists($newUnitId);

            if ($newUnitId !== (int) $current['unit_id']) {
                throw DomainException::validation(
                    'Perubahan satuan dasar harus dilakukan melalui proses konversi satuan.'
                );
            }
        }

        foreach (['units', 'prices', 'attributes'] as $field) {
            if (array_key_exists($field, $data) && !is_array($data[$field])) {
                throw DomainException::validation(
                    "Format data {$field} harus berupa array."
                );
            }
        }

        $this->db->transBegin();

        try {
            $update = $this->extractUpdatableFields($data);

            if ($update) {
                $update['updated_by'] = $userId;

                $this->products->update($id, $update);
            }

            // Relasi yang tidak dikirim tidak disentuh.
            if (array_key_exists('units', $data)) {
                $this->saveExtraUnits($id, $data['units']);
            }

            if (array_key_exists('prices', $data)) {
                $this->saveExtraPrices($id, $data['prices']);
            }

            if (array_key_exists('attributes', $data)) {
                $this->saveAttributes($id, $data['attributes'], $userId);
            }

            if ($this->db->transStatus() === false) {
                throw new \RuntimeException('Transaksi perubahan produk gagal.');
            }

            $this->db->transCommit();
        } catch (\Throwable $e) {
            $this->db->transRollback();

            if ($e instanceof DomainException) {
                throw $e;
            }

            throw new \RuntimeException(
                'Gagal memperbarui produk: ' . $e->getMessage(),
                0,
                $e
            );
        }

        return $this->detail($id);
    }


    // ─────────────────────────────────────────────
    // Delete
    // ─────────────────────────────────────────────

    public function delete(int $id): void
    {
        if (!$this->products->findRawById($id)) {
            throw DomainException::notFound('Produk tidak ditemukan.');
        }

        if (!$this->products->softDelete($id)) {
            throw new \RuntimeException('Gagal menghapus produk.');
        }
    }

    /**
 * Membentuk prefix SKU adaptif berdasarkan modul kategori.
 *
 * Pharmacy    : kategori + bentuk sediaan.
 * Modul lain  : modul + tipe kategori.
 */
    private function buildSkuPrefix(
        int $categoryId,
        string $dosageForm = ''
    ): string {
        $category = $this->db->table('categories')
            ->select('module, type')
            ->where('id', $categoryId)
            ->where('is_active', 1)
            ->get()
            ->getRowArray();

        if (!$category) {
            throw DomainException::validation(
                'Kategori produk tidak ditemukan atau tidak aktif.'
            );
        }

        $module = strtolower(trim((string) $category['module']));
        $type = strtolower(trim((string) $category['type']));

        if ($module === '' || $type === '') {
            throw DomainException::validation(
                'Modul dan tipe kategori wajib diisi.'
            );
        }

        // Aturan khusus Pharmacy.
        if ($module === 'pharmacy') {
            return $this->buildPharmacySkuPrefix($type, $dosageForm);
        }

        // Aturan universal modul lainnya.
        $moduleCodes = [
            'inventory' => 'INV',
            'procurement' => 'PRO',
            'distribution' => 'DST',
            'pos' => 'POS',
        ];

        $moduleCode = $moduleCodes[$module]
            ?? $this->makeSkuCode($module);

        $categoryCodes = [
            'obat' => 'OBT',
            'alkes' => 'ALK',
            'alat_kesehatan' => 'ALK',
            'bahan_baku' => 'BAH',
            'barang_jadi' => 'JAD',
            'barang_dagang' => 'DAG',
        ];

        $categoryCode = $categoryCodes[$type]
            ?? $this->makeSkuCode($type);

        return $moduleCode . '-' . $categoryCode;
    }

    /**
     * Aturan SKU khusus Pharmacy.
     */
    private function buildPharmacySkuPrefix(
        string $categoryType,
        string $dosageForm
    ): string {
        $categoryTypes = [
            'obat' => 'OBT',
            'alkes' => 'ALK',
            'alat_kesehatan' => 'ALK',
        ];

        $categoryCode = $categoryTypes[$categoryType] ?? null;

        if (!$categoryCode) {
            throw DomainException::validation(
                'Tipe kategori Pharmacy belum memiliki kode SKU.'
            );
        }

        $dosageForms = [
            'tablet' => 'TAB',
            'kaplet' => 'KPL',
            'kapsul' => 'KPS',
            'sirup' => 'SYR',
            'syrup' => 'SYR',
            'krim' => 'CRM',
            'cream' => 'CRM',
            'salep' => 'OIN',
            'ointment' => 'OIN',
            'gel' => 'GEL',
            'drop' => 'DRP',
            'drops' => 'DRP',
            'tetes' => 'DRP',
            'injeksi' => 'INJ',
            'suspensi' => 'SUS',
            'serbuk' => 'PWD',
            'powder' => 'PWD',
            'larutan' => 'SOL',
            'solution' => 'SOL',
            'botol' => 'BOT',
            'inhaler' => 'INH',
            'lotion' => 'LOT',
        ];

        $form = strtolower(trim($dosageForm));
        $formCode = $dosageForms[$form] ?? null;

        if (!$formCode) {
            throw DomainException::validation(
                'Bentuk sediaan belum memiliki kode SKU.'
            );
        }

        return $categoryCode . '-' . $formCode;
    }

    /**
     * Membentuk kode tiga karakter.
     */
    private function makeSkuCode(string $value): string
    {
        $value = strtoupper(trim($value));
        $value = preg_replace('/[^A-Z0-9]/', '', $value) ?? '';

        if ($value === '') {
            throw DomainException::validation(
                'Kode SKU tidak dapat dibentuk dari data kategori.'
            );
        }

        return substr(str_pad($value, 3, 'X'), 0, 3);
    }

    /**
     * Kunci generator berdasarkan prefix SKU.
     */
    private function acquireSkuLock(string $prefix): string
    {
        $lockName = 'acn_sku_' . substr(hash('sha256', $prefix), 0, 48);

        $result = $this->db->query(
            'SELECT GET_LOCK(?, 10) AS acquired',
            [$lockName]
        )->getRowArray();

        if ((int) ($result['acquired'] ?? 0) !== 1) {
            throw DomainException::conflict(
                'Generator SKU sedang digunakan. Silakan coba kembali.'
            );
        }

        return $lockName;
    }

    /**
     * Mengambil nomor berikutnya.
     * Termasuk SKU produk yang sudah soft delete agar tidak digunakan ulang.
     */
    private function nextSku(string $prefix): string
    {
        $pattern = '^' . preg_quote($prefix, '/') . '-[0-9]{3,}$';

        $row = $this->db->query(
            'SELECT MAX(CAST(SUBSTRING(sku, ?) AS UNSIGNED)) AS last_number
         FROM products
         WHERE sku REGEXP ?',
            [strlen($prefix) + 2, $pattern]
        )->getRowArray();

        $next = (int) ($row['last_number'] ?? 0) + 1;

        return $prefix . '-' . str_pad(
            (string) $next,
            3,
            '0',
            STR_PAD_LEFT
        );
    }

    /**
 * Preview SKU untuk frontend.
 */
    public function previewSku(
        int $categoryId,
        string $dosageForm = ''
    ): string {
        $prefix = $this->buildSkuPrefix(
            $categoryId,
            $dosageForm
        );

        $lockName = $this->acquireSkuLock($prefix);

        try {
            return $this->nextSku($prefix);
        } finally {
            $this->db->query(
                'SELECT RELEASE_LOCK(?)',
                [$lockName]
            );
        }
    }

    // ─────────────────────────────────────────────
    // Guards
    // ─────────────────────────────────────────────

    private function assertUniqueSku(string $sku, ?int $excludeId = null): void
    {
        if ($this->products->findBySku(trim($sku), $excludeId)) {
            throw DomainException::conflict('SKU produk sudah digunakan.');
        }
    }

    private function assertUniqueBarcode(?string $barcode, ?int $excludeId = null): void
    {
        if ($barcode === null || $barcode === '') {
            return;
        }

        if ($this->products->findByBarcode($barcode, $excludeId)) {
            throw DomainException::conflict('Barcode produk sudah digunakan.');
        }
    }

    private function assertCategoryExists(int $categoryId): void
    {
        if (!$this->categories->find($categoryId)) {
            throw DomainException::validation('Kategori produk tidak ditemukan.');
        }
    }

    private function assertUnitExists(int $unitId): void
    {
        if (!$this->unitModel->find($unitId)) {
            throw DomainException::validation('Satuan dasar tidak ditemukan.');
        }
    }

    // ─────────────────────────────────────────────
    // Sub-tasks
    // ─────────────────────────────────────────────

    private function insertProduct(array $data, int $userId): int
    {
        $id = $this->products->insert([
            'sku' => trim((string) $data['sku']),
            'barcode' => !empty($data['barcode']) ? trim((string) $data['barcode']) : null,
            'name' => trim((string) $data['name']),
            'category_id' => (int) $data['category_id'],
            'unit_id' => (int) $data['unit_id'],
            'purchase_price' => (float) ($data['purchase_price'] ?? 0),
            'selling_price' => (float) ($data['selling_price'] ?? 0),
            'description' => $data['description'] ?? null,
            'is_active' => (int) ($data['is_active'] ?? 1),
            'created_by' => $userId,
            'updated_by' => $userId,
        ]);

        if ($id <= 0) {
            throw new \RuntimeException('Gagal menyimpan produk.');
        }

        return $id;
    }

    private function createBaseUnit(int $productId, array $data): void
    {
        $barcode = !empty($data['barcode']) ? trim((string) $data['barcode']) : null;

        $this->units->upsert($productId, (int) $data['unit_id'], [
            'product_id' => $productId,
            'unit_id' => (int) $data['unit_id'],
            'conversion_factor' => 1,
            'barcode' => $barcode,
            'is_base' => 1,
            'is_purchase_unit' => 1,
            'is_sale_unit' => 1,
            'is_active' => 1,
            'sort_order' => 0,
            'updated_at' => date('Y-m-d H:i:s'),
        ]);
    }

    private function createInitialPrice(int $productId, array $data): void
    {
        $price = (float) ($data['selling_price'] ?? 0);

        if ($price <= 0) {
            return;
        }

        $this->prices->saveMany($productId, [[
            'unit_id' => (int) $data['unit_id'],
            'customer_type' => null,
            'min_qty' => 1,
            'price' => $price,
            'is_active' => 1,
        ]]);
    }



    private function saveExtraUnits(int $productId, array $units): void
    {
        $product = $this->products->findRawById($productId);

        if (!$product) {
            throw DomainException::notFound('Produk tidak ditemukan.');
        }

        $baseUnitId = (int) $product['unit_id'];
        $keepUnitIds = [];

        foreach ($units as $item) {
            if (!is_array($item)) {
                throw DomainException::validation(
                    'Format satuan produk tidak valid.'
                );
            }

            $this->validateUnitPayload($item);

            $unitId = (int) $item['unit_id'];
            $isBase = (int) ($item['is_base'] ?? 0);

            if (in_array($unitId, $keepUnitIds, true)) {
                throw DomainException::validation(
                    "Satuan ID {$unitId} dikirim lebih dari satu kali."
                );
            }

            if ($isBase === 1 && $unitId !== $baseUnitId) {
                throw DomainException::validation(
                    'Satuan dasar harus sama dengan products.unit_id.'
                );
            }

            if ($isBase === 0 && $unitId === $baseUnitId) {
                throw DomainException::validation(
                    'Satuan dasar tidak boleh menjadi satuan tambahan.'
                );
            }

            if ($isBase === 1) {
                $this->units->resetBaseFlag($productId);
            }

            $this->units->upsert(
                $productId,
                $unitId,
                $this->buildUnitPayload($productId, $item)
            );

            $keepUnitIds[] = $unitId;
        }

        // Tutup harga aktif milik satuan tambahan yang akan dinonaktifkan.
        $activeUnits = $this->units->getByProductId($productId);
        $deactivatedUnitIds = [];

        foreach ($activeUnits as $activeUnit) {
            $unitId = (int) $activeUnit['unit_id'];

            if (
                (int) $activeUnit['is_active'] === 1
                && (int) $activeUnit['is_base'] === 0
                && !in_array($unitId, $keepUnitIds, true)
            ) {
                $deactivatedUnitIds[] = $unitId;
            }
        }

        if ($deactivatedUnitIds !== []) {
            $this->prices->closeForUnits($productId, $deactivatedUnitIds);
        }

        // Satuan dasar tidak ikut dinonaktifkan.
        // Satuan tambahan yang tidak dikirim menjadi nonaktif.
        $this->units->deactivateExcept($productId, $keepUnitIds);
    }



    private function saveExtraPrices(int $productId, array $prices): void
    {
        $this->prices->saveMany($productId, $prices);
    }


    private function saveAttributes(
        int $productId,
        array $attributes,
        int $userId
    ): void {
        $keepIds = [];

        foreach ($attributes as $item) {
            if (!is_array($item)) {
                throw DomainException::validation(
                    'Format atribut produk tidak valid.'
                );
            }

            $attrType = trim((string) ($item['attr_type'] ?? ''));

            if ($attrType === '' || in_array($attrType, ['unit', 'price'], true)) {
                throw DomainException::validation(
                    'Jenis atribut produk tidak valid.'
                );
            }

            $payload = [
                'attr_type'   => $attrType,
                'attr_group'  => $item['attr_group'] ?? null,
                'title'       => $item['title'] ?? null,
                'content'     => $item['content'] ?? null,
                'severity'    => $item['severity'] ?? null,
                'value_num'   => $item['value_num'] ?? null,
                'value_num_2' => $item['value_num_2'] ?? null,
                'value_json'  => isset($item['value_json'])
                    ? json_encode($item['value_json'], JSON_THROW_ON_ERROR)
                    : null,
                'ref_id'      => $item['ref_id'] ?? null,
                'ref_type'    => $item['ref_type'] ?? null,
                'is_primary'  => (int) ($item['is_primary'] ?? 0),
                'is_active'   => (int) ($item['is_active'] ?? 1),
                'sort_order'  => (int) ($item['sort_order'] ?? 0),
            ];

            if (array_key_exists('id', $item)) {
                $attributeId = (int) $item['id'];

                if ($attributeId <= 0) {
                    throw DomainException::validation(
                        'ID atribut produk tidak valid.'
                    );
                }

                if (!$this->attributes->existsForProduct($attributeId, $productId)) {
                    throw DomainException::validation(
                        'Atribut tidak ditemukan pada produk ini.'
                    );
                }

                $this->attributes->updateForProduct(
                    $attributeId,
                    $productId,
                    $payload
                );

                $keepIds[] = $attributeId;
            } else {
                $payload['product_id'] = $productId;
                $payload['created_by'] = $userId;

                $attributeId = $this->attributes->insert($payload);

                if ($attributeId <= 0) {
                    throw new \RuntimeException(
                        'Gagal menyimpan atribut produk.'
                    );
                }

                $keepIds[] = $attributeId;
            }
        }

        $this->attributes->deactivateExcept($productId, $keepIds);
    }


    private function attachRelations(array $products): array
    {
        if (!$products) {
            return [];
        }

        $ids = array_map(
            static fn (array $p): int => (int) $p['id'],
            $products
        );

        $units = $this->groupByProduct($this->products->getUnitsByProductIds($ids));
        $prices = $this->groupByProduct($this->products->getActivePricesByProductIds($ids));

        foreach ($products as &$product) {
            $id = (int) $product['id'];
            $product['units'] = $units[$id] ?? [];
            $product['prices'] = $prices[$id] ?? [];
        }

        unset($product);

        return $products;
    }

    private function groupByProduct(array $rows): array
    {
        $map = [];

        foreach ($rows as $row) {
            $map[(int) $row['product_id']][] = $row;
        }

        return $map;
    }

    private function extractUpdatableFields(array $data): array
    {
        $allowed = [
            'sku', 'barcode', 'name', 'category_id', 'unit_id',
            'purchase_price', 'selling_price', 'description', 'is_active',
        ];

        return array_intersect_key($data, array_flip($allowed));
    }


    private function validateUnitPayload(array $item): void
    {
        $unitId = (int) ($item['unit_id'] ?? 0);
        $factor = (float) ($item['conversion_factor'] ?? 0);

        if ($unitId <= 0 || !is_finite($factor) || $factor <= 0) {
            throw DomainException::validation(
                'Satuan dan faktor konversi wajib valid.'
            );
        }

        if (!$this->unitModel->find($unitId)) {
            throw DomainException::validation(
                "Satuan ID {$unitId} tidak ditemukan."
            );
        }

        foreach (['is_base', 'is_purchase_unit', 'is_sale_unit', 'is_active'] as $flag) {
            if (isset($item[$flag]) && !in_array((int) $item[$flag], [0, 1], true)) {
                throw DomainException::validation(
                    "Nilai {$flag} harus 0 atau 1."
                );
            }
        }

        if ((int) ($item['is_base'] ?? 0) === 1 && abs($factor - 1) > 0.000001) {
            throw DomainException::validation(
                'Faktor konversi satuan dasar harus 1.'
            );
        }
    }


    private function buildUnitPayload(int $productId, array $item): array
    {
        return [
            'product_id' => $productId,
            'unit_id' => (int) $item['unit_id'],
            'conversion_factor' => (float) $item['conversion_factor'],
            'barcode' => !empty($item['barcode']) ? trim((string) $item['barcode']) : null,
            'is_base' => (int) ($item['is_base'] ?? 0),
            'is_purchase_unit' => (int) ($item['is_purchase_unit'] ?? 0),
            'is_sale_unit' => (int) ($item['is_sale_unit'] ?? 1),
            'is_active' => (int) ($item['is_active'] ?? 1),
            'sort_order' => (int) ($item['sort_order'] ?? 0),
            'updated_at' => date('Y-m-d H:i:s'),
        ];
    }

    private function getPriceRepository(): ProductPriceRepository
    {
        return new ProductPriceRepository();
    }
}
