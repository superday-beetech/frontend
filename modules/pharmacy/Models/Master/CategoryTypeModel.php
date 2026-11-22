<?php

declare(strict_types=1);

namespace Modules\Pharmacy\Models\Master;

use Modules\Pharmacy\Models\PharmacyModel;

class CategoryTypeModel extends PharmacyModel
{
    protected $table = 'category_types';

    protected $allowedFields = [
        'module',
        'code',
        'label',
        'sort_order',
        'is_active',
    ];

    protected $useTimestamps = true;
    protected $createdField  = 'created_at';
    protected $updatedField  = 'updated_at';

    protected $validationRules = [
        'id'         => 'permit_empty|is_natural_no_zero',
        'module'     => 'required|in_list[pharmacy,minimarket,general]',
        'code'       => 'required|max_length[30]',
        'label'      => 'required|max_length[50]',
        'sort_order' => 'permit_empty|integer|greater_than_equal_to[0]',
        'is_active'  => 'permit_empty|in_list[0,1]',
    ];

    /**
     * Opsi tipe per module (untuk dropdown/datalist).
     */
    public function getOptionsByModule(string $module): array
    {
        return $this->select('code AS value, label')
            ->where('module', $module)
            ->where('is_active', 1)
            ->orderBy('sort_order', 'ASC')
            ->findAll();
    }
}
