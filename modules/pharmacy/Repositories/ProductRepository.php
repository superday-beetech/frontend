<?php

declare(strict_types=1);

namespace Modules\Pharmacy\Repositories;

use Config\Database;
use Modules\Pharmacy\Models\Master\ProductModel;

class ProductRepository
{
    private $db;
    private ProductModel $model;

    public function __construct()
    {
        $this->db = Database::connect('pharmacy');
        $this->model = new ProductModel();
    }

    /**
     * Paginate katalog dengan filter.
     *
     * @return array{items: array, total: int}
     */
    public function paginate(array $filters, int $page, int $perPage): array
    {
        $builder = $this->baseQuery();
        $this->applyFilters($builder, $filters);

        $total = (clone $builder)->countAllResults();

        $items = $builder
            ->orderBy('p.name', 'ASC')
            ->limit($perPage, ($page - 1) * $perPage)
            ->get()
            ->getResultArray();

        return [
            'items' => $items,
            'total' => $total,
        ];
    }

    public function findById(int $id): ?array
    {
        return $this->baseQuery()
            ->where('p.id', $id)
            ->where('p.deleted_at', null)
            ->get()
            ->getRowArray();
    }

    public function findRawById(int $id): ?array
    {
        return $this->model->find($id) ?: null;
    }

    public function findBySku(string $sku, ?int $excludeId = null): ?array
    {
        $builder = $this->db->table('products')->where('sku', $sku);

        if ($excludeId !== null) {
            $builder->where('id !=', $excludeId);
        }

        return $builder->get()->getRowArray();
    }

    public function findByBarcode(string $barcode, ?int $excludeId = null): ?array
    {
        $builder = $this->db->table('products')->where('barcode', $barcode);

        if ($excludeId !== null) {
            $builder->where('id !=', $excludeId);
        }

        return $builder->get()->getRowArray();
    }

    public function insert(array $data): int
    {
        $this->db->table('products')->insert($data);

        return (int) $this->db->insertID();
    }

    public function update(int $id, array $data): bool
    {
        $data['updated_at'] = date('Y-m-d H:i:s');

        return (bool) $this->db->table('products')
            ->where('id', $id)
            ->update($data);
    }

    public function softDelete(int $id): bool
    {
        return (bool) $this->db->table('products')
            ->where('id', $id)
            ->update(['deleted_at' => date('Y-m-d H:i:s')]);
    }

    public function getUnitsByProductIds(array $ids): array
    {
        if (!$ids) {
            return [];
        }

        return $this->db->table('product_units pu')
            ->select('pu.*, u.name AS unit_name, u.abbreviation AS unit_abbreviation')
            ->join('units u', 'u.id = pu.unit_id', 'left')
            ->whereIn('pu.product_id', $ids)
            ->orderBy('pu.sort_order', 'ASC')
            ->get()
            ->getResultArray();
    }

    public function getActivePricesByProductIds(array $ids): array
    {
        if (!$ids) {
            return [];
        }

        return $this->db->table('product_prices pp')
            ->select('pp.*')
            ->whereIn('pp.product_id', $ids)
            ->where('pp.is_active', 1)
            ->orderBy('pp.min_qty', 'ASC')
            ->get()
            ->getResultArray();
    }

    private function baseQuery()
    {
        return $this->db->table('products p')
            ->select('
                p.*,
                c.name AS category_name,
                u.name AS unit_name,
                u.abbreviation AS unit_abbreviation
            ')
            ->join('categories c', 'c.id = p.category_id', 'left')
            ->join('units u', 'u.id = p.unit_id', 'left')
            ->where('p.deleted_at', null);
    }

    private function applyFilters($builder, array $filters): void
    {
        if (!empty($filters['search'])) {
            $search = (string) $filters['search'];
            $builder->groupStart()
                ->like('p.name', $search)
                ->orLike('p.sku', $search)
                ->orLike('p.barcode', $search)
                ->groupEnd();
        }

        if (!empty($filters['category_id'])) {
            $builder->where('p.category_id', (int) $filters['category_id']);
        }

        if (isset($filters['is_active']) && $filters['is_active'] !== '') {
            $builder->where('p.is_active', (int) $filters['is_active']);
        }
    }
}
