<?php

declare(strict_types=1);

namespace Modules\Pharmacy\Models\Master;

use Modules\Pharmacy\Models\PharmacyModel;

class ProductUnitModel extends PharmacyModel
{
    protected $table            = 'product_units';
    protected $primaryKey       = 'id';
    protected $useAutoIncrement = true;
    protected $returnType       = 'array';

    protected $allowedFields = [
        'product_id',
        'unit_id',
        'conversion_factor',
        'barcode',
        'is_base',
        'is_purchase_unit',
        'is_sale_unit',
        'is_active',
        'sort_order',
    ];

    protected $useTimestamps = true;
    protected $dateFormat    = 'datetime';
    protected $createdField  = 'created_at';
    protected $updatedField  = 'updated_at';

    /**
     * Ambil seluruh satuan aktif milik produk.
     */
    public function findByProduct(int $productId): array
    {
        return $this->db->table('product_units pu')
            ->select('
                pu.*,
                u.name AS unit_name,
                u.abbreviation AS unit_abbreviation
            ')
            ->join('units u', 'u.id = pu.unit_id', 'inner')
            ->where('pu.product_id', $productId)
            ->where('pu.is_active', 1)
            ->orderBy('pu.is_base', 'DESC')
            ->orderBy('pu.sort_order', 'ASC')
            ->get()
            ->getResultArray();
    }

    /**
     * Ambil satuan produk berdasarkan ID satuan.
     */
    public function findProductUnit(
        int $productId,
        int $unitId
    ): ?array {
        $row = $this->where('product_id', $productId)
            ->where('unit_id', $unitId)
            ->first();

        return $row ?: null;
    }

    /**
     * Ambil satuan dasar produk.
     */
    public function findBaseUnit(int $productId): ?array
    {
        $row = $this->where('product_id', $productId)
            ->where('is_base', 1)
            ->first();

        return $row ?: null;
    }

    /**
     * Hapus satuan alternatif.
     * Satuan dasar tidak boleh dihapus melalui metode ini.
     */
    public function deleteAlternatives(int $productId): bool
    {
        return $this->where('product_id', $productId)
            ->where('is_base', 0)
            ->delete();
    }
}
