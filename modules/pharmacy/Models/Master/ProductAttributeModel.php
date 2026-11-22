<?php

declare(strict_types=1);

namespace Modules\Pharmacy\Models\Master;

use Modules\Pharmacy\Models\PharmacyModel;

class ProductAttributeModel extends PharmacyModel
{
    protected $table            = 'product_attributes';
    protected $primaryKey       = 'id';
    protected $useAutoIncrement = true;
    protected $returnType       = 'array';

    protected $allowedFields = [
        'product_id',
        'attr_type',
        'attr_group',
        'title',
        'content',
        'severity',
        'value_num',
        'value_num_2',
        'value_json',
        'ref_id',
        'ref_type',
        'is_primary',
        'is_active',
        'sort_order',
        'created_by',
        'created_at',
        'updated_at',
    ];

    protected $useTimestamps = true;
    protected $dateFormat    = 'datetime';
    protected $createdField  = 'created_at';
    protected $updatedField  = 'updated_at';

    /**
     * Ambil semua atribut untuk satu produk, dikelompokkan per attr_type.
     */
    public function getGroupedByProduct(int $productId): array
    {
        $rows = $this->where('product_id', $productId)
            ->where('is_active', 1)
            ->orderBy('attr_type', 'ASC')
            ->orderBy('sort_order', 'ASC')
            ->findAll();

        $grouped = [];
        foreach ($rows as $row) {
            $grouped[$row['attr_type']][] = $row;
        }

        return $grouped;
    }

    /**
     * Hapus semua atribut dengan tipe tertentu untuk satu produk.
     * Dipakai saat sync (replace all) — mis. saat update unit.
     */
    public function deleteByType(int $productId, string $attrType): void
    {
        $this->where('product_id', $productId)
            ->where('attr_type', $attrType)
            ->delete();
    }
}
