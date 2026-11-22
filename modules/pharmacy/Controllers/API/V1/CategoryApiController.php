<?php

declare(strict_types=1);

namespace Modules\Pharmacy\Controllers\API\V1;

use App\Core\ApiController;
use Modules\Pharmacy\Models\Master\CategoryModel;
use CodeIgniter\Database\Exceptions\DatabaseException;
use Throwable;

class CategoryApiController extends ApiController
{
    protected $modelName = CategoryModel::class;
    protected $format = 'json';

    private CategoryModel $categoryModel;

    public function initController($request, $response, $logger)
    {
        parent::initController($request, $response, $logger);

        $this->categoryModel = new CategoryModel();
    }

    public function index()
    {
        try {
            $page = max(1, (int) $this->request->getGet('page'));
            $perPage = (int) ($this->request->getGet('per_page') ?? 10);
            $perPage = max(1, min($perPage, 100));

            $search = trim((string) $this->request->getGet('search'));
            $status = $this->request->getGet('is_active');
            $module = trim((string) ($this->request->getGet('module') ?? ''));
            $type   = trim((string) ($this->request->getGet('type') ?? ''));

            $builder = $this->categoryModel->builder();

            if ($search !== '') {
                $builder->groupStart()
                    ->like('name', $search)
                    ->orLike('description', $search)
                    ->groupEnd();
            }

            if ($status !== null && in_array((string) $status, ['0', '1'], true)) {
                $builder->where('is_active', (int) $status);
            }

            // ✅ Filter module & type
            if ($module !== '') {
                $builder->where('module', $module);
            }

            if ($type !== '') {
                $builder->where('type', $type);
            }

            $total = $builder->countAllResults(false);

            $totalPages = (int) ceil($total / $perPage);
            $offset = ($page - 1) * $perPage;

            $items = $builder
                ->orderBy('module', 'ASC')
                ->orderBy('type', 'ASC')
                ->orderBy('name', 'ASC')
                ->limit($perPage, $offset)
                ->get()
                ->getResultArray();

            return $this->successResponse([
                'items' => $items,
                'pagination' => [
                    'current_page' => $page,
                    'per_page' => $perPage,
                    'total' => $total,
                    'total_pages' => $totalPages,
                ],
            ], 'Data kategori berhasil diambil.');
        } catch (Throwable $e) {
            return $this->handleException($e, 'index');
        }
    }

    public function show($id = null)
    {
        $categoryId = $this->validId($id);

        if (!$categoryId) {
            return $this->errorResponse('ID kategori tidak valid.', 400);
        }

        try {
            $category = $this->categoryModel->find($categoryId);

            if (!$category) {
                return $this->errorResponse('Kategori tidak ditemukan.', 404);
            }

            return $this->successResponse($category, 'Detail kategori berhasil diambil.');
        } catch (Throwable $e) {
            return $this->handleException($e, 'show');
        }
    }

    public function edit($id = null)
    {
        $categoryId = $this->validId($id);

        if (!$categoryId) {
            return $this->errorResponse('ID kategori tidak valid.', 400);
        }

        try {
            $category = $this->categoryModel->find($categoryId);

            if (!$category) {
                return $this->errorResponse('Kategori tidak ditemukan.', 404);
            }

            return $this->successResponse($category, 'Detail kategori berhasil diambil.');
        } catch (Throwable $e) {
            return $this->handleException($e, 'show');
        }
    }

    public function create()
    {
        $data = $this->getRequestData();

        if ($data === null) {
            return $this->errorResponse('Format JSON tidak valid.', 400);
        }

        // ✅ Validasi module
        $module = trim((string) ($data['module'] ?? ''));
        $allowedModules = ['pharmacy', 'minimarket', 'general'];

        if (!in_array($module, $allowedModules, true)) {
            return $this->errorResponse(
                'Module kategori wajib diisi (pharmacy/minimarket/general).',
                422
            );
        }

        // ✅ Validasi type
        $type = trim((string) ($data['type'] ?? ''));

        if ($type === '' || mb_strlen($type) > 30) {
            return $this->errorResponse(
                'Tipe kategori wajib diisi maksimal 30 karakter.',
                422
            );
        }

        $name = trim((string) ($data['name'] ?? ''));

        if (mb_strlen($name) < 2 || mb_strlen($name) > 100) {
            return $this->errorResponse(
                'Nama kategori wajib diisi antara 2 sampai 100 karakter.',
                422
            );
        }

        $description = $data['description'] ?? null;

        if ($description !== null && !is_string($description)) {
            return $this->errorResponse('Deskripsi kategori harus berupa teks.', 422);
        }

        $isActive = $data['is_active'] ?? 1;

        if (!in_array((string) $isActive, ['0', '1'], true)) {
            return $this->errorResponse('Status aktif harus bernilai 0 atau 1.', 422);
        }

        try {
            // ✅ Cek duplikat per module
            if ($this->categoryModel
                ->where('module', $module)
                ->where('name', $name)
                ->first()
            ) {
                return $this->errorResponse(
                    'Nama kategori sudah digunakan pada module ini.',
                    409
                );
            }

            $id = $this->categoryModel->insert([
                'module'      => $module,
                'type'        => $type,
                'name'        => $name,
                'description' => $description,
                'is_active'   => (int) $isActive,
            ]);

            if (!$id) {
                return $this->errorResponse(
                    'Gagal menyimpan kategori.',
                    422,
                    $this->categoryModel->errors()
                );
            }

            return $this->successResponse(
                $this->categoryModel->find($id),
                'Kategori berhasil ditambahkan.',
                201
            );
        } catch (Throwable $e) {
            return $this->handleException($e, 'create');
        }
    }

    public function update($id = null)
    {
        $categoryId = $this->validId($id);

        if (!$categoryId) {
            return $this->errorResponse('ID kategori tidak valid.', 400);
        }

        $data = $this->getRequestData();

        if ($data === null || $data === []) {
            return $this->errorResponse('Data perubahan kategori wajib diisi.', 400);
        }

        try {
            $category = $this->categoryModel->find($categoryId);

            if (!$category) {
                return $this->errorResponse('Kategori tidak ditemukan.', 404);
            }

            $updateData = [];

            // ✅ module
            if (array_key_exists('module', $data)) {
                $module = trim((string) $data['module']);
                $allowedModules = ['pharmacy', 'minimarket', 'general'];

                if (!in_array($module, $allowedModules, true)) {
                    return $this->errorResponse(
                        'Module kategori tidak valid.',
                        422
                    );
                }

                $updateData['module'] = $module;
            }

            // ✅ type
            if (array_key_exists('type', $data)) {
                $type = trim((string) $data['type']);

                if ($type === '' || mb_strlen($type) > 30) {
                    return $this->errorResponse(
                        'Tipe kategori wajib diisi maksimal 30 karakter.',
                        422
                    );
                }

                $updateData['type'] = $type;
            }

            if (array_key_exists('name', $data)) {
                $name = trim((string) $data['name']);

                if (mb_strlen($name) < 2 || mb_strlen($name) > 100) {
                    return $this->errorResponse(
                        'Nama kategori wajib diisi antara 2 sampai 100 karakter.',
                        422
                    );
                }

                // ✅ Cek duplikat per module (module baru atau module lama)
                $checkModule = $updateData['module'] ?? $category['module'];

                $duplicate = $this->categoryModel
                    ->where('module', $checkModule)
                    ->where('name', $name)
                    ->where('id !=', $categoryId)
                    ->first();

                if ($duplicate) {
                    return $this->errorResponse(
                        'Nama kategori sudah digunakan pada module ini.',
                        409
                    );
                }

                $updateData['name'] = $name;
            }

            if (array_key_exists('description', $data)) {
                if ($data['description'] !== null && !is_string($data['description'])) {
                    return $this->errorResponse('Deskripsi kategori harus berupa teks.', 422);
                }

                $updateData['description'] = $data['description'];
            }

            if (array_key_exists('is_active', $data)) {
                if (!in_array((string) $data['is_active'], ['0', '1'], true)) {
                    return $this->errorResponse('Status aktif harus bernilai 0 atau 1.', 422);
                }

                $updateData['is_active'] = (int) $data['is_active'];
            }

            if ($updateData === []) {
                return $this->errorResponse('Tidak ada data yang dapat diperbarui.', 400);
            }

            // ✅ Agar is_unique[...,{id}] di model terisi (kalau ada)
            $updateData['id'] = $categoryId;

            if (!$this->categoryModel->update($categoryId, $updateData)) {
                return $this->errorResponse(
                    'Gagal memperbarui kategori.',
                    422,
                    $this->categoryModel->errors()
                );
            }

            return $this->successResponse(
                $this->categoryModel->find($categoryId),
                'Kategori berhasil diperbarui.'
            );
        } catch (Throwable $e) {
            return $this->handleException($e, 'update');
        }
    }

    public function delete($id = null)
    {
        $categoryId = $this->validId($id);

        if (!$categoryId) {
            return $this->errorResponse('ID kategori tidak valid.', 400);
        }

        try {
            $category = $this->categoryModel->find($categoryId);

            if (!$category) {
                return $this->errorResponse('Kategori tidak ditemukan.', 404);
            }

            $db = $this->categoryModel->db;

            if (
                $db->table('products')
                ->where('category_id', $categoryId)
                ->countAllResults() > 0
            ) {
                return $this->errorResponse(
                    'Kategori tidak dapat dihapus karena masih digunakan produk.',
                    409
                );
            }

            if (!$this->categoryModel->delete($categoryId)) {
                return $this->errorResponse('Gagal menghapus kategori.', 500);
            }

            return $this->successResponse(
                ['id' => $categoryId],
                'Kategori berhasil dihapus.'
            );
        } catch (Throwable $e) {
            return $this->handleException($e, 'delete');
        }
    }

    private function getRequestData(): ?array
    {
        try {
            $data = $this->request->getJSON(true);
            return is_array($data) ? $data : null;
        } catch (Throwable) {
            return null;
        }
    }

    private function validId($id): ?int
    {
        if (!is_scalar($id) || !ctype_digit((string) $id)) {
            return null;
        }

        $id = (int) $id;

        return $id > 0 ? $id : null;
    }

    private function handleException(Throwable $e, string $method)
    {
        log_message(
            'error',
            '[CategoryApiController::' . $method . '] ' . $e->getMessage()
        );

        if ($e instanceof DatabaseException) {
            return $this->errorResponse('Operasi database kategori gagal.', 409);
        }

        return $this->errorResponse(
            'Terjadi kesalahan pada pengelolaan kategori.',
            500
        );
    }
}
