<?php

declare(strict_types=1);

namespace Modules\Pharmacy\Controllers\API\V1;

use App\Core\ApiController;
use Modules\Pharmacy\Models\Master\DosageFormModel;
use CodeIgniter\Database\Exceptions\DatabaseException;
use Throwable;

class DosageFormApiController extends ApiController
{
    protected $modelName = DosageFormModel::class;
    protected $format = 'json';

    private DosageFormModel $dosageModel;

    public function initController($request, $response, $logger)
    {
        parent::initController($request, $response, $logger);

        $this->dosageModel = new DosageFormModel();
    }

    public function index()
    {
        try {
            $page = max(1, (int) $this->request->getGet('page'));
            $perPage = (int) ($this->request->getGet('per_page') ?? 10);
            $perPage = max(1, min($perPage, 100));

            $search = trim((string) $this->request->getGet('search'));
            $status = $this->request->getGet('is_active');

            $builder = $this->dosageModel->builder();

            if ($search !== '') {
                $builder->groupStart()
                    ->like('name', $search)
                    ->groupEnd();
            }

            if ($status !== null && in_array((string) $status, ['0', '1'], true)) {
                $builder->where('is_active', (int) $status);
            }

            $total = $builder->countAllResults(false);

            $totalPages = (int) ceil($total / $perPage);
            $offset = ($page - 1) * $perPage;

            $items = $builder
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
            ], 'Data Bentuk Sediaan berhasil diambil.');
        } catch (Throwable $e) {
            return $this->handleException($e, 'index');
        }
    }

    public function show($id = null)
    {
        $categoryId = $this->validId($id);

        if (!$categoryId) {
            return $this->errorResponse('ID Bentuk Sediaan tidak valid.', 400);
        }

        try {
            $category = $this->dosageModel->find($categoryId);

            if (!$category) {
                return $this->errorResponse('Bentuk Sediaan tidak ditemukan.', 404);
            }

            return $this->successResponse($category, 'Detail Bentuk Sediaan berhasil diambil.');
        } catch (Throwable $e) {
            return $this->handleException($e, 'show');
        }
    }

    public function edit($id = null)
    {
        $categoryId = $this->validId($id);

        if (!$categoryId) {
            return $this->errorResponse('ID Bentuk Sediaan tidak valid.', 400);
        }

        try {
            $category = $this->dosageModel->find($categoryId);

            if (!$category) {
                return $this->errorResponse('Bentuk Sediaan tidak ditemukan.', 404);
            }

            return $this->successResponse($category, 'Detail Bentuk Sediaan berhasil diambil.');
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

        $name = trim((string) ($data['name'] ?? ''));

        if (mb_strlen($name) < 2 || mb_strlen($name) > 100) {
            return $this->errorResponse(
                'Nama Bentuk Sediaan wajib diisi antara 2 sampai 100 karakter.',
                422
            );
        }

        $isActive = $data['is_active'] ?? 1;

        if (!in_array((string) $isActive, ['0', '1'], true)) {
            return $this->errorResponse('Status aktif harus bernilai 0 atau 1.', 422);
        }

        try {
            $id = $this->dosageModel->insert([
                'name'        => $name,
                'is_active'   => (int) $isActive,
            ]);

            if (!$id) {
                return $this->errorResponse(
                    'Gagal menyimpan Bentuk Sediaan.',
                    422,
                    $this->dosageModel->errors()
                );
            }

            return $this->successResponse(
                $this->dosageModel->find($id),
                'Bentuk Sediaan berhasil ditambahkan.',
                201
            );
        } catch (Throwable $e) {
            return $this->handleException($e, 'create');
        }
    }

    public function update($id = null)
    {
        $dosageFormId = $this->validId($id);

        if (!$dosageFormId) {
            return $this->errorResponse('ID Bentuk Sediaan tidak valid.', 400);
        }

        $data = $this->getRequestData();

        if ($data === null || $data === []) {
            return $this->errorResponse('Data perubahan Bentuk Sediaan wajib diisi.', 400);
        }

        try {
            $category = $this->dosageModel->find($dosageFormId);

            if (!$category) {
                return $this->errorResponse('Bentuk Sediaan tidak ditemukan.', 404);
            }

            $updateData = [];

            if (array_key_exists('name', $data)) {
                $name = trim((string) $data['name']);

                if (mb_strlen($name) < 2 || mb_strlen($name) > 100) {
                    return $this->errorResponse(
                        'Nama Bentuk Sediaan wajib diisi antara 2 sampai 100 karakter.',
                        422
                    );
                }
                $updateData['name'] = $name;
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
            $updateData['id'] = $dosageFormId;

            if (!$this->dosageModel->update($dosageFormId, $updateData)) {
                return $this->errorResponse(
                    'Gagal memperbarui Bentuk Sediaan.',
                    422,
                    $this->dosageModel->errors()
                );
            }

            return $this->successResponse(
                $this->dosageModel->find($dosageFormId),
                'Bentuk Sediaan berhasil diperbarui.'
            );
        } catch (Throwable $e) {
            return $this->handleException($e, 'update');
        }
    }

    public function delete($id = null)
    {
        $categoryId = $this->validId($id);

        if (!$categoryId) {
            return $this->errorResponse('ID Bentuk Sediaan tidak valid.', 400);
        }

        try {
            $category = $this->dosageModel->find($categoryId);

            if (!$category) {
                return $this->errorResponse('Bentuk Sediaan tidak ditemukan.', 404);
            }

            $db = $this->dosageModel->db;

            if (
                $db->table('products')
                ->where('category_id', $categoryId)
                ->countAllResults() > 0
            ) {
                return $this->errorResponse(
                    'Bentuk Sediaan tidak dapat dihapus karena masih digunakan produk.',
                    409
                );
            }

            if (!$this->dosageModel->delete($categoryId)) {
                return $this->errorResponse('Gagal menghapus Bentuk Sediaan.', 500);
            }

            return $this->successResponse(
                ['id' => $categoryId],
                'Bentuk Sediaan berhasil dihapus.'
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
            return $this->errorResponse('Operasi database Bentuk Sediaan gagal.', 409);
        }

        return $this->errorResponse(
            'Terjadi kesalahan pada pengelolaan Bentuk Sediaan.',
            500
        );
    }
}
