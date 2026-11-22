<?php

declare(strict_types=1);

namespace Modules\Pharmacy\Models\Master;

use Modules\Pharmacy\Models\PharmacyModel;

class DosageFormModel extends PharmacyModel
{
    protected $table = 'product_dosage_forms';

    protected $allowedFields = [
        'name',
        'sort_order',
        'is_active',
    ];

    protected $useTimestamps = true;
    protected $createdField  = 'created_at';
    protected $updatedField  = 'updated_at';

    /**
     * Opsi aktif untuk dropdown (value = name, label = name).
     */
    public function getOptions(): array
    {
        return $this->select('name AS value, name AS label')
            ->where('is_active', 1)
            ->orderBy('sort_order', 'ASC')
            ->findAll();
    }
}
