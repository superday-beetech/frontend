<?php

declare(strict_types=1);

namespace Modules\Pharmacy\Repositories;

use Config\Database;

class ProductPriceRepository
{
    private $db;

    public function __construct()
    {
        $this->db = Database::connect('pharmacy');
    }

    public function insert(array $payload): int
    {
        $now = date('Y-m-d H:i:s');

        $payload['created_at'] = $payload['created_at'] ?? $now;
        $payload['updated_at'] = $now;

        $this->db->table('product_prices')->insert($payload);

        return (int) $this->db->insertID();
    }

    public function getByProductId(int $productId): array
    {
        return $this->db->table('product_prices')
            ->where('product_id', $productId)
            ->orderBy('min_qty', 'ASC')
            ->orderBy('valid_from', 'DESC')
            ->get()
            ->getResultArray();
    }

    public function getActiveByProductId(int $productId): array
    {
        return $this->db->table('product_prices')
            ->where('product_id', $productId)
            ->where('is_active', 1)
            ->orderBy('min_qty', 'ASC')
            ->orderBy('valid_from', 'DESC')
            ->get()
            ->getResultArray();
    }

    public function findActiveByKey(
        int $productId,
        int $unitId,
        ?string $customerType,
        float $minQty
    ): ?array {
        $builder = $this->db->table('product_prices')
            ->where('product_id', $productId)
            ->where('unit_id', $unitId)
            ->where('min_qty', $minQty)
            ->where('is_active', 1);

        if ($customerType === null || $customerType === '') {
            $builder->where('customer_type', null);
        } else {
            $builder->where('customer_type', $customerType);
        }

        $row = $builder->orderBy('valid_from', 'DESC')
            ->get()
            ->getRowArray();

        return $row ?: null;
    }

    public function closeById(int $id, string $validTo): bool
    {
        return $this->db->table('product_prices')
            ->where('id', $id)
            ->where('is_active', 1)
            ->update([
                'is_active'  => 0,
                'valid_to'   => $validTo,
                'updated_at' => date('Y-m-d H:i:s'),
            ]);
    }

    /**
     * Tetap disediakan untuk kompatibilitas pemanggil lama.
     */
    public function deactivateByKey(
        int $productId,
        int $unitId,
        ?string $customerType,
        float $minQty
    ): bool {
        $row = $this->findActiveByKey(
            $productId,
            $unitId,
            $customerType,
            $minQty
        );

        if (!$row) {
            return true;
        }

        return $this->closeById(
            (int) $row['id'],
            date('Y-m-d H:i:s')
        );
    }
}
