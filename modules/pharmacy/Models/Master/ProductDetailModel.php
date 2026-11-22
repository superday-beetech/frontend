<?php

declare(strict_types=1);

namespace Modules\Pharmacy\Models\Master;

use Modules\Pharmacy\Models\PharmacyModel;

class ProductDetailModel extends PharmacyModel
{
    protected $table = 'product_details';

    protected $allowedFields = [
        'product_id',
        'generic_name',
        'active_ingredient',
        'dosage_form',
        'strength',
        'drug_class',
        'bpom_number',
        'requires_prescription',
        'unit_conversion',
        'min_stock',
        'max_stock',
        'rack_location',
        'manufacturer',
    ];

    protected $useTimestamps = true;
    protected $createdField  = 'created_at';
    protected $updatedField  = 'updated_at';

    protected $validationRules = [
        'product_id'            => 'required|integer|greater_than[0]',
        'drug_class'            => 'permit_empty|in_list[bebas,bebas_terbatas,keras,narkotika,psikotropika,alkes,umum]',
        'dosage_form'           => 'permit_empty|max_length[50]',
        'strength'              => 'permit_empty|max_length[50]',
        'bpom_number'           => 'permit_empty|max_length[100]',
        'requires_prescription' => 'permit_empty|in_list[0,1]',
        'min_stock'             => 'permit_empty|integer|greater_than_equal_to[0]',
        'max_stock'             => 'permit_empty|integer|greater_than_equal_to[0]',
        'rack_location'         => 'permit_empty|max_length[50]',
        'manufacturer'          => 'permit_empty|max_length[150]',
    ];

    protected $validationMessages = [
        'product_id' => [
            'required'    => 'ID produk wajib diisi.',
            'integer'     => 'ID produk tidak valid.',
            'greater_than' => 'ID produk tidak valid.',
        ],
        'drug_class' => [
            'in_list' => 'Golongan obat tidak valid.',
        ],
    ];

    /**
     * Cari detail berdasarkan product_id (relasi 1:1).
     */
    public function findByProductId(int $productId)
    {
        return $this->where('product_id', $productId)->first();
    }
}
