<?php

declare(strict_types=1);

namespace Modules\Pharmacy\Repositories;

use Config\Database;

class ProductUnitRepository
{
    private $db;

    public function __construct()
    {
        $this->db = Database::connect('pharmacy');
    }

    public function findByProductAndUnit(int $productId, int $unitId): ?array
    {
        return $this->db->table('product_units')
            ->where('product_id', $productId)
            ->where('unit_id', $unitId)
            ->get()
            ->getRowArray();
    }

    public function findActiveByProductAndUnit(int $productId, int $unitId): ?array
    {
        return $this->db->table('product_units')
            ->where('product_id', $productId)
            ->where('unit_id', $unitId)
            ->where('is_active', 1)
            ->get()
            ->getRowArray();
    }

    public function resetBaseFlag(int $productId): void
    {
        $this->db->table('product_units')
            ->where('product_id', $productId)
            ->where('is_base', 1)
            ->update([
                'is_base' => 0,
                'updated_at' => date('Y-m-d H:i:s'),
            ]);
    }

    public function upsert(int $productId, int $unitId, array $payload): void
    {
        $existing = $this->findByProductAndUnit($productId, $unitId);
        $now = date('Y-m-d H:i:s');

        $payload['created_at'] = $payload['created_at'] ?? $now;

        if ($existing) {
            unset($payload['created_at']);

            $this->db->table('product_units')
                ->where('id', $existing['id'])
                ->update($payload);

            return;
        }

        $payload['created_at'] = $now;

        $this->db->table('product_units')->insert($payload);
    }

    /**
     * Nonaktifkan satuan yang tidak ada dalam daftar terbaru.
     * Pemanggil wajib memvalidasi penggunaan transaksi sebelum menjalankan.
     */

    public function deactivateExcept(int $productId, array $keepUnitIds = []): bool
    {
        $builder = $this->db->table('product_units')
            ->where('product_id', $productId)
            ->where('is_base', 0)
            ->where('is_active', 1);

        if ($keepUnitIds !== []) {
            $builder->whereNotIn('unit_id', $keepUnitIds);
        }

        return $builder->update([
            'is_active'  => 0,
            'updated_at' => date('Y-m-d H:i:s'),
        ]);
    }


    public function getByProductId(int $productId): array
    {
        return $this->db->table('product_units pu')
            ->select('pu.*, u.name AS unit_name, u.abbreviation AS unit_abbreviation')
            ->join('units u', 'u.id = pu.unit_id', 'left')
            ->where('pu.product_id', $productId)
            ->orderBy('pu.sort_order', 'ASC')
            ->get()
            ->getResultArray();
    }

    public function getPurchaseUnits(int $productId): array
    {
        return $this->db->table('product_units pu')
            ->select('pu.*, u.name AS unit_name, u.abbreviation AS unit_abbreviation')
            ->join('units u', 'u.id = pu.unit_id', 'left')
            ->where('pu.product_id', $productId)
            ->where('pu.is_purchase_unit', 1)
            ->where('pu.is_active', 1)
            ->orderBy('pu.sort_order', 'ASC')
            ->get()
            ->getResultArray();
    }
}
