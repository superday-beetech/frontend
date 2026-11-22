<?php

declare(strict_types=1);

namespace Modules\Pharmacy\Models\Master;

use Modules\Pharmacy\Models\PharmacyModel;

class ProductModel extends PharmacyModel
{
    protected $table            = 'products';
    protected $primaryKey       = 'id';
    protected $useAutoIncrement = true;
    protected $returnType       = 'array';

    protected $allowedFields = [
        'sku',
        'barcode',
        'name',
        'category_id',
        'unit_id',
        'purchase_price',
        'selling_price',
        'description',
        'is_active',
        'created_by',
        'updated_by',
    ];

    protected $useTimestamps = true;
    protected $dateFormat    = 'datetime';
    protected $createdField  = 'created_at';
    protected $updatedField  = 'updated_at';

    protected $useSoftDeletes = true;
    protected $deletedField   = 'deleted_at';

    /**
     * Ambil produk beserta nama kategori dan satuan dasar.
     *
     * Tidak mengambil product_details.
     */
    public function withCatalog()
    {
        return $this->builder()
            ->select('
                products.*,
                categories.name AS category_name,
                units.name AS unit_name,
                units.abbreviation AS unit_abbreviation
            ')
            ->join(
                'categories',
                'categories.id = products.category_id',
                'left'
            )
            ->join(
                'units',
                'units.id = products.unit_id',
                'left'
            );
    }

    /**
     * Ambil satu produk beserta informasi katalog.
     */
    public function findWithCatalog(int $id): ?array
    {
        return $this->withCatalog()
            ->where('products.id', $id)
            ->where('products.deleted_at', null)
            ->get()
            ->getRowArray();
    }
}
