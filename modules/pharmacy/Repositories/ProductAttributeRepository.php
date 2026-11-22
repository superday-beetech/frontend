<?php

declare(strict_types=1);

namespace Modules\Pharmacy\Repositories;

use Config\Database;

class ProductAttributeRepository
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

        $this->db->table('product_attributes')->insert($payload);

        return (int) $this->db->insertID();
    }

    public function existsForProduct(int $id, int $productId): bool
    {
        return $this->db->table('product_attributes')
            ->where('id', $id)
            ->where('product_id', $productId)
            ->countAllResults() > 0;
    }

    public function updateForProduct(
        int $id,
        int $productId,
        array $payload
    ): bool {
        $payload['updated_at'] = date('Y-m-d H:i:s');

        return $this->db->table('product_attributes')
            ->where('id', $id)
            ->where('product_id', $productId)
            ->update($payload);
    }

    public function deactivateExcept(int $productId, array $keepIds = []): bool
    {
        $builder = $this->db->table('product_attributes')
            ->where('product_id', $productId)
            ->where('is_active', 1);

        if ($keepIds !== []) {
            $builder->whereNotIn('id', $keepIds);
        }

        return $builder->update([
            'is_active'  => 0,
            'updated_at' => date('Y-m-d H:i:s'),
        ]);
    }

    public function getByProductId(int $productId): array
    {
        return $this->db->table('product_attributes')
            ->where('product_id', $productId)
            ->where('is_active', 1)
            ->orderBy('sort_order', 'ASC')
            ->get()
            ->getResultArray();
    }
}
