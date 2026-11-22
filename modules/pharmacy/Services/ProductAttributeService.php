<?php

declare(strict_types=1);

namespace Modules\Pharmacy\Services;

use Modules\Pharmacy\Models\Master\ProductAttributeModel;

class ProductAttributeService
{
    private ProductAttributeModel $model;

    public function __construct()
    {
        $this->model = new ProductAttributeModel();
    }

    /**
     * Sync atribut tipe 'unit' dari array input.
     * Format input: [['unit' => 'tablet', 'qty' => 1, 'barcode' => null, 'price' => 500], ...]
     */
    public function syncUnits(int $productId, array $units, int $userId): void
    {
        $this->model->deleteByType($productId, 'unit');

        $sort = 1;
        foreach ($units as $u) {
            $name = trim((string) ($u['unit'] ?? ''));
            $qty  = (float) ($u['qty'] ?? 0);

            if ($name === '' || $qty <= 0) {
                continue;
            }

            $this->model->insert([
                'product_id'  => $productId,
                'attr_type'   => 'unit',
                'title'       => $name,
                'value_num'   => $qty,
                'value_num_2' => isset($u['price']) ? (float) $u['price'] : null,
                'value_json'  => isset($u['barcode']) && $u['barcode'] !== ''
                    ? json_encode(['barcode' => $u['barcode']])
                    : null,
                'ref_type'    => 'units',
                'is_primary'  => $sort === 1 ? 1 : 0,
                'is_active'   => 1,
                'sort_order'  => $sort,
                'created_by'  => $userId,
            ]);

            $sort++;
        }
    }

    /**
     * Sync atribut tipe 'image'.
     * Format input: [['url' => '/uploads/x.jpg', 'is_primary' => 1], ...]
  /*
    public function syncImages(int $productId, array $images, int $userId): void
    {
        $this->model->deleteByType($productId, 'image');

        $sort = 1;
        foreach ($images as $img) {
            $url = trim((string) ($img['url'] ?? ''));
            if ($url === '') {
                continue;
            }

            $this->model->insert([
                'product_id' => $productId,
                'attr_type'  => 'image',
                'value_json' => json_encode(['url' => $url]),
                'is_primary' => !empty($img['is_primary']) ? 1 : 0,
                'is_active'  => 1,
                'sort_order' => $sort,
                'created_by' => $userId,
            ]);

            $sort++;
        }
    } */

    /**
     * Sync atribut tipe 'info'.
     * Format input: [['group' => 'indication', 'content' => '...'], ...]
     */
    public function syncInfos(int $productId, array $infos, int $userId): void
    {
        $this->model->deleteByType($productId, 'info');

        $sort = 1;
        foreach ($infos as $info) {
            $group   = trim((string) ($info['group'] ?? ''));
            $content = trim((string) ($info['content'] ?? ''));

            if ($group === '' || $content === '') {
                continue;
            }

            $this->model->insert([
                'product_id' => $productId,
                'attr_type'  => 'info',
                'attr_group' => $group,      // misal: 'dosage_rule', 'indication'
                'title'      => $info['title'] ?? null, // misal: 'Dewasa'
                'content'    => $content,    // misal: '1 tablet 3x sehari'
                'severity'   => $info['severity'] ?? null,
                'is_active'  => 1,
                'sort_order' => $sort++,
                'created_by' => $userId,
            ]);
        }
    }

    /**
     * Ambil semua atribut produk, dikelompokkan.
     */
    public function getGrouped(int $productId): array
    {
        return $this->model->getGroupedByProduct($productId);
    }

    private function moveFromTempToProducts(string $url): string
    {
        $filename = basename($url);
        $tempPath = WRITEPATH . 'uploads/temp/' . $filename;
        $destPath = WRITEPATH . 'uploads/products/' . $filename;

        // Jika file ada di temp, pindahkan ke products
        if (is_file($tempPath)) {
            // Pastikan folder products ada
            if (!is_dir(WRITEPATH . 'uploads/products')) {
                mkdir(WRITEPATH . 'uploads/products', 0775, true);
            }

            rename($tempPath, $destPath);
            return '/uploads/products/' . $filename; // Kembalikan URL baru
        }

        // Jika file tidak ada di temp, berarti itu gambar lama (edit), biarkan URL aslinya
        return $url;
    }

    public function syncImages(int $productId, array $images, int $userId): void
    {
        $this->model->deleteByType($productId, 'image');

        $sort = 1;
        foreach ($images as $img) {
            $url = trim((string) ($img['url'] ?? ''));
            if ($url === '') {
                continue;
            }

            // 👇 PINDAHKAN DARI TEMP KE PRODUCTS
            $finalUrl = $this->moveFromTempToProducts($url);

            $this->model->insert([
                'product_id' => $productId,
                'attr_type'  => 'image',
                'value_json' => json_encode(['url' => $finalUrl]),
                'is_primary' => !empty($img['is_primary']) ? 1 : 0,
                'is_active'  => 1,
                'sort_order' => $sort++,
                'created_by' => $userId,
            ]);
        }
    }
}
