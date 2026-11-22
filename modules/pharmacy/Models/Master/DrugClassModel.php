<?php

declare(strict_types=1);

namespace Modules\Pharmacy\Models\Master;

use Modules\Pharmacy\Models\PharmacyModel;

class DrugClassModel extends PharmacyModel
{
    protected $table = 'product_drug_classes';

    protected $allowedFields = [
        'code',
        'label',
        'sort_order',
        'is_active',
    ];

    protected $useTimestamps = true;
    protected $createdField  = 'created_at';
    protected $updatedField  = 'updated_at';

    /**
     * Opsi aktif untuk dropdown (value = code, label = label).
     */
    public function getOptions(): array
    {
        return $this->select('code AS value, label')
            ->where('is_active', 1)
            ->orderBy('sort_order', 'ASC')
            ->findAll();
    }
}
