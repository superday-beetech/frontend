<?php

declare(strict_types=1);

namespace Modules\Pharmacy\Models\Master;

use Modules\Pharmacy\Models\PharmacyModel;

class CategoryModel extends PharmacyModel
{
    protected $table = 'categories';

    protected $allowedFields = [
        'module',       // ← baru
        'type',         // ← baru
        'name',
        'description',
        'is_active',
    ];

    protected $useTimestamps = true;
    protected $createdField  = 'created_at';
    protected $updatedField  = 'updated_at';

    protected $validationRules = [
        'id'          => 'permit_empty|is_natural_no_zero',
        'module'      => 'required|in_list[pharmacy,minimarket,general]',
        'type'        => 'required|max_length[30]',
        'name'        => 'required|max_length[100]|is_unique[categories.name,id,{id}]',
        'description' => 'permit_empty',
        'is_active'   => 'permit_empty|in_list[0,1]',
    ];

    protected $validationMessages = [
        'module' => [
            'required' => 'Module kategori wajib diisi.',
            'in_list'  => 'Module kategori tidak valid.',
        ],
        'type' => [
            'required'   => 'Tipe kategori wajib diisi.',
            'max_length' => 'Tipe kategori maksimal 30 karakter.',
        ],
        'name' => [
            'required'  => 'Nama kategori wajib diisi.',
            'max_length' => 'Nama kategori maksimal 100 karakter.',
            'is_unique' => 'Nama kategori sudah digunakan.',
        ],
    ];
}
