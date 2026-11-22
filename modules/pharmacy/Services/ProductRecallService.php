<?php

declare(strict_types=1);

namespace Modules\Pharmacy\Services;

use Config\Database;
use RuntimeException;
use Throwable;

class ProductRecallService
{
    protected $db;

    public function __construct()
    {
        $this->db = Database::connect('pharmacy');
    }

    /**
     * =========================================================
     * RECALL LIST
     * =========================================================
     */
    public function getProductRecalls(
        array $filters = [],
        int $page = 1,
        int $perPage = 10
    ): array {
        $page = max(1, $page);
        $perPage = min(100, max(1, $perPage));

        // Count tanpa JOIN agar tidak terjadi duplikasi hitungan.
        $countBuilder = $this->db->table('product_recalls pr');

        $this->applyRecallFilters($countBuilder, $filters);

        $total = (int) $countBuilder->countAllResults();

        $builder = $this->db->table('product_recalls pr')
            ->select('pr.*')
            ->select(
                '(SELECT COUNT(*)
                  FROM product_recall_products prp
                  WHERE prp.recall_id = pr.id) AS total_products',
                false
            )
            ->select(
                '(SELECT COUNT(*)
                  FROM product_recall_batches prb
                  WHERE prb.recall_id = pr.id) AS total_batches',
                false
            );

        $this->applyRecallFilters($builder, $filters);

        $items = $builder
            ->orderBy('pr.recalled_at', 'DESC')
            ->orderBy('pr.id', 'DESC')
            ->limit($perPage, ($page - 1) * $perPage)
            ->get()
            ->getResultArray();

        return [
            'items' => $items,
            'pagination' => [
                'page' => $page,
                'per_page' => $perPage,
                'total' => $total,
                'total_pages' => (int) ceil($total / $perPage),
            ],
        ];
    }

    /**
     * =========================================================
     * RECALL DETAIL
     * =========================================================
     */
    public function getProductRecallDetail(int $recallId): array
    {
        if ($recallId < 1) {
            throw new RuntimeException('Recall ID tidak valid.');
        }

        $recall = $this->db->table('product_recalls')
            ->where('id', $recallId)
            ->get()
            ->getRowArray();

        if (!$recall) {
            throw new RuntimeException('Data recall tidak ditemukan.');
        }

        $recall['products'] = $this->db
            ->table('product_recall_products prp')
            ->select([
                'prp.*',
                'p.sku',
                'p.name AS product_name',
            ])
            ->join('products p', 'p.id = prp.product_id')
            ->where('prp.recall_id', $recallId)
            ->orderBy('p.name', 'ASC')
            ->get()
            ->getResultArray();

        $recall['batches'] = $this->db
            ->table('product_recall_batches prb')
            ->select([
                'prb.*',
                'pb.product_id',
                'pb.batch_number',
                'pb.expired_at',
                'pb.received_quantity',
                'pb.quantity_remaining',
                'pb.unit_cost',
                'pb.status AS batch_status',
                'pb.status_before_recall',
                'p.name AS product_name',
                'p.sku',
            ])
            ->join('product_batches pb', 'pb.id = prb.batch_id')
            ->join('products p', 'p.id = pb.product_id')
            ->where('prb.recall_id', $recallId)
            ->orderBy('pb.product_id', 'ASC')
            ->orderBy('pb.expired_at', 'ASC')
            ->orderBy('pb.id', 'ASC')
            ->get()
            ->getResultArray();

        return $recall;
    }

    /**
     * =========================================================
     * CREATE RECALL
     * =========================================================
     *
     * Payload:
     * recall_number
     * reason
     * severity
     * source
     * notes
     * product_ids[]
     * batch_ids[]
     *
     * Pemilihan produk mencakup seluruh batch produk tersebut.
     * Pemilihan batch hanya mencakup batch yang dipilih.
     */
    public function createProductRecall(
        array $data,
        int $userId
    ): int {
        if ($userId < 1) {
            throw new RuntimeException('User ID tidak valid.');
        }

        $recallNumber = trim((string) ($data['recall_number'] ?? ''));
        $reason = trim((string) ($data['reason'] ?? ''));

        $severity = trim((string) ($data['severity'] ?? 'medium'));
        $source = trim((string) ($data['source'] ?? ''));
        $notes = trim((string) ($data['notes'] ?? ''));

        if ($recallNumber === '' || $reason === '') {
            throw new RuntimeException(
                'Nomor recall dan alasan recall wajib diisi.'
            );
        }

        if (mb_strlen($recallNumber) > 100) {
            throw new RuntimeException(
                'Nomor recall maksimal 100 karakter.'
            );
        }

        if (mb_strlen($severity) > 30) {
            throw new RuntimeException(
                'Severity maksimal 30 karakter.'
            );
        }

        if (mb_strlen($source) > 150) {
            throw new RuntimeException(
                'Sumber recall maksimal 150 karakter.'
            );
        }

        $productIds = $this->normalizeIds(
            $data['product_ids'] ?? [],
            'product_ids'
        );

        $batchIds = $this->normalizeIds(
            $data['batch_ids'] ?? [],
            'batch_ids'
        );

        if (!$productIds && !$batchIds) {
            throw new RuntimeException(
                'Pilih minimal satu produk atau batch.'
            );
        }

        $this->db->transBegin();

        try {
            // Validasi nomor recall.
            $exists = $this->db->table('product_recalls')
                ->where('recall_number', $recallNumber)
                ->countAllResults();

            if ($exists > 0) {
                throw new RuntimeException(
                    'Nomor recall sudah digunakan.'
                );
            }

            /*
             * Lock seluruh batch yang terdampak.
             *
             * Ini juga menyelaraskan proses create recall
             * dengan proses apply recall pada batch yang sama.
             */
            $where = [];
            $binds = [];

            if ($batchIds) {
                $where[] = 'id IN (' .
                    implode(',', array_fill(0, count($batchIds), '?')) .
                    ')';

                $binds = array_merge($binds, $batchIds);
            }

            if ($productIds) {
                $where[] = 'product_id IN (' .
                    implode(',', array_fill(0, count($productIds), '?')) .
                    ')';

                $binds = array_merge($binds, $productIds);
            }

            $batchRows = $this->db->query(
                'SELECT id, product_id, status
                 FROM product_batches
                 WHERE ' . implode(' OR ', $where) . '
                 ORDER BY id ASC
                 FOR UPDATE',
                $binds
            )->getResultArray();

            $foundBatchIds = [];
            $selectedProducts = $productIds;

            foreach ($batchRows as $batch) {
                $batchId = (int) $batch['id'];
                $productId = (int) $batch['product_id'];

                $foundBatchIds[] = $batchId;
                $selectedProducts[] = $productId;
            }

            // Semua batch yang diminta harus ditemukan.
            $foundExplicitBatchIds = array_intersect(
                $batchIds,
                $foundBatchIds
            );

            if (count($foundExplicitBatchIds) !== count($batchIds)) {
                throw new RuntimeException(
                    'Salah satu batch tidak ditemukan.'
                );
            }

            $selectedProducts = array_values(
                array_unique($selectedProducts)
            );

            $affectedBatchIds = array_values(
                array_unique($foundBatchIds)
            );

            // Validasi semua produk yang terdampak.
            $foundProductIds = [];

            if ($selectedProducts) {
                $products = $this->db->table('products')
                    ->select('id')
                    ->whereIn('id', $selectedProducts)
                    ->get()
                    ->getResultArray();

                $foundProductIds = array_map(
                    'intval',
                    array_column($products, 'id')
                );

                if (count($foundProductIds) !== count($selectedProducts)) {
                    throw new RuntimeException(
                        'Salah satu produk tidak ditemukan.'
                    );
                }
            }

            /*
             * Batch tidak boleh masuk ke recall lain
             * yang statusnya masih aktif.
             */
            if ($affectedBatchIds) {
                $placeholders = implode(
                    ',',
                    array_fill(0, count($affectedBatchIds), '?')
                );

                $activeRecall = $this->db->query(
                    "SELECT
                        prb.batch_id,
                        pr.recall_number
                     FROM product_recall_batches prb
                     INNER JOIN product_recalls pr
                        ON pr.id = prb.recall_id
                     WHERE prb.batch_id IN ($placeholders)
                       AND pr.status <> 'closed'
                     LIMIT 1
                     FOR UPDATE",
                    $affectedBatchIds
                )->getRowArray();

                if ($activeRecall) {
                    throw new RuntimeException(
                        'Batch ID ' . $activeRecall['batch_id'] .
                        ' sudah terdaftar pada recall aktif ' .
                        $activeRecall['recall_number'] . '.'
                    );
                }
            }

            $now = date('Y-m-d H:i:s');

            // Simpan header recall.
            $this->db->table('product_recalls')->insert([
                'recall_number' => $recallNumber,
                'severity' => $severity !== '' ? $severity : 'medium',
                'reason' => $reason,
                'source' => $source !== '' ? $source : null,
                'status' => 'open',
                'notes' => $notes !== '' ? $notes : null,
                'created_by' => $userId,
                'updated_by' => $userId,
                'created_at' => $now,
                'updated_at' => $now,
            ]);

            $recallId = (int) $this->db->insertID();

            if ($recallId < 1) {
                throw new RuntimeException(
                    'Gagal membuat data recall.'
                );
            }

            // Simpan produk terdampak.
            foreach ($selectedProducts as $productId) {
                $this->db->table('product_recall_products')->insert([
                    'recall_id' => $recallId,
                    'product_id' => $productId,
                    'created_at' => $now,
                ]);
            }

            // Simpan batch terdampak.
            foreach ($affectedBatchIds as $batchId) {
                $this->db->table('product_recall_batches')->insert([
                    'recall_id' => $recallId,
                    'batch_id' => $batchId,
                    'quantity_at_recall' => 0,
                    'action_taken' => 'pending',
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
            }

            $this->commitTransaction(
                'Transaksi pembuatan recall gagal.'
            );

            return $recallId;

        } catch (Throwable $e) {
            $this->db->transRollback();
            throw $e;
        }
    }

    /**
     * =========================================================
     * APPLY RECALL
     * =========================================================
     *
     * Mengarantina seluruh batch terdampak.
     * Tidak mengurangi stok fisik maupun stok sistem.
     */
    public function applyProductRecall(
        int $recallId,
        int $userId
    ): bool {
        if ($recallId < 1 || $userId < 1) {
            throw new RuntimeException(
                'Recall ID atau User ID tidak valid.'
            );
        }

        $this->db->transBegin();

        try {
            // Lock header.
            $recall = $this->db->query(
                'SELECT id, recall_number, status
                 FROM product_recalls
                 WHERE id = ?
                 LIMIT 1
                 FOR UPDATE',
                [$recallId]
            )->getRowArray();

            if (!$recall) {
                throw new RuntimeException(
                    'Product recall tidak ditemukan.'
                );
            }

            if ($recall['status'] === 'closed') {
                throw new RuntimeException(
                    'Recall yang sudah ditutup tidak dapat diterapkan.'
                );
            }

            // Lock seluruh batch terkait.
            $recallBatches = $this->db->query(
                "SELECT
                    prb.id AS recall_batch_id,
                    prb.batch_id,
                    prb.quantity_at_recall,
                    prb.action_taken,
                    pb.status AS batch_status,
                    pb.quantity_remaining
                 FROM product_recall_batches prb
                 INNER JOIN product_batches pb
                    ON pb.id = prb.batch_id
                 WHERE prb.recall_id = ?
                 ORDER BY prb.batch_id ASC
                 FOR UPDATE",
                [$recallId]
            )->getResultArray();

            $batchIds = array_values(array_unique(array_map(
                'intval',
                array_column($recallBatches, 'batch_id')
            )));

            /*
             * Pastikan batch tidak sedang terkait
             * dengan recall aktif lainnya.
             */
            if ($batchIds) {
                $placeholders = implode(
                    ',',
                    array_fill(0, count($batchIds), '?')
                );

                $binds = array_merge([$recallId], $batchIds);

                $otherRecall = $this->db->query(
                    "SELECT
                        prb.batch_id,
                        pr.recall_number
                     FROM product_recall_batches prb
                     INNER JOIN product_recalls pr
                        ON pr.id = prb.recall_id
                     WHERE pr.id <> ?
                       AND pr.status <> 'closed'
                       AND prb.batch_id IN ($placeholders)
                     LIMIT 1
                     FOR UPDATE",
                    $binds
                )->getRowArray();

                if ($otherRecall) {
                    throw new RuntimeException(
                        'Batch ID ' . $otherRecall['batch_id'] .
                        ' sudah berada dalam recall aktif ' .
                        $otherRecall['recall_number'] . '.'
                    );
                }
            }

            $now = date('Y-m-d H:i:s');

            foreach ($recallBatches as $item) {
                $batchId = (int) $item['batch_id'];

                // Sudah diterapkan: jangan ubah snapshot.
                if ($item['action_taken'] === 'quarantined') {
                    if ($item['batch_status'] !== 'recalled') {
                        throw new RuntimeException(
                            'Status batch ID ' . $batchId .
                            ' tidak sesuai dengan catatan recall.'
                        );
                    }

                    continue;
                }

                // Batch yang sudah dikarantina pihak lain tidak diambil alih.
                if ($item['batch_status'] === 'recalled') {
                    throw new RuntimeException(
                        'Batch ID ' . $batchId .
                        ' sudah berada dalam status recall.'
                    );
                }

                $updated = $this->db->table('product_batches')
                    ->where('id', $batchId)
                    ->where('status', $item['batch_status'])
                    ->update([
                        'status_before_recall' => $item['batch_status'],
                        'status' => 'recalled',
                        'updated_at' => $now,
                    ]);

                if (!$updated || $this->db->affectedRows() !== 1) {
                    throw new RuntimeException(
                        'Gagal mengarantina batch ID ' . $batchId . '.'
                    );
                }

                $updatedRecallBatch = $this->db
                    ->table('product_recall_batches')
                    ->where('id', (int) $item['recall_batch_id'])
                    ->where('recall_id', $recallId)
                    ->where('action_taken', 'pending')
                    ->update([
                        'quantity_at_recall' =>
                            (float) $item['quantity_remaining'],
                        'action_taken' => 'quarantined',
                        'updated_at' => $now,
                    ]);

                if (!$updatedRecallBatch ||
                    $this->db->affectedRows() !== 1
                ) {
                    throw new RuntimeException(
                        'Gagal memperbarui catatan batch recall.'
                    );
                }
            }

            $this->db->table('product_recalls')
                ->where('id', $recallId)
                ->update([
                    'updated_by' => $userId,
                    'updated_at' => $now,
                ]);

            $this->commitTransaction(
                'Transaksi penerapan recall gagal.'
            );

            return true;

        } catch (Throwable $e) {
            $this->db->transRollback();
            throw $e;
        }
    }

    /**
     * =========================================================
     * CLOSE RECALL
     * =========================================================
     *
     * Penutupan administratif.
     * Tidak mengaktifkan kembali batch yang dikarantina.
     */
    public function closeProductRecall(
        int $recallId,
        int $userId
    ): bool {
        if ($recallId < 1 || $userId < 1) {
            throw new RuntimeException(
                'Recall ID atau User ID tidak valid.'
            );
        }

        $this->db->transBegin();

        try {
            $recall = $this->db->query(
                'SELECT id, status
                 FROM product_recalls
                 WHERE id = ?
                 LIMIT 1
                 FOR UPDATE',
                [$recallId]
            )->getRowArray();

            if (!$recall) {
                throw new RuntimeException(
                    'Data recall tidak ditemukan.'
                );
            }

            // Idempotent: recall yang sudah ditutup tetap dianggap selesai.
            if ($recall['status'] === 'closed') {
                $this->commitTransaction(
                    'Transaksi penutupan recall gagal.'
                );

                return true;
            }

            // Recall hanya boleh ditutup jika seluruh batch sudah diproses.
            $pending = $this->db->table('product_recall_batches')
                ->where('recall_id', $recallId)
                ->groupStart()
                    ->where('action_taken IS NULL', null, false)
                    ->orWhere('action_taken !=', 'quarantined')
                ->groupEnd()
                ->countAllResults();

            if ($pending > 0) {
                throw new RuntimeException(
                    'Recall belum dapat ditutup. Masih ada batch ' .
                    'yang belum diterapkan atau dikarantina.'
                );
            }

            $now = date('Y-m-d H:i:s');

            $this->db->table('product_recalls')
                ->where('id', $recallId)
                ->where('status', 'open')
                ->update([
                    'status' => 'closed',
                    'closed_at' => $now,
                    'updated_by' => $userId,
                    'updated_at' => $now,
                ]);

            if ($this->db->transStatus() === false) {
                throw new RuntimeException(
                    'Gagal menutup recall.'
                );
            }

            $this->commitTransaction(
                'Transaksi penutupan recall gagal.'
            );

            return true;

        } catch (Throwable $e) {
            $this->db->transRollback();
            throw $e;
        }
    }

    /**
     * =========================================================
     * PRIVATE HELPERS
     * =========================================================
     */

    /**
     * Filter daftar recall.
     */
    private function applyRecallFilters(
        $builder,
        array $filters
    ): void {
        $search = trim((string) ($filters['search'] ?? ''));
        $status = trim((string) ($filters['status'] ?? ''));
        $severity = trim((string) ($filters['severity'] ?? ''));

        if ($search !== '') {
            $builder->groupStart()
                ->like('pr.recall_number', $search)
                ->orLike('pr.reason', $search)
                ->orLike('pr.source', $search)
                ->groupEnd();
        }

        if ($status !== '') {
            $builder->where('pr.status', $status);
        }

        if ($severity !== '') {
            $builder->where('pr.severity', $severity);
        }
    }

    /**
     * Normalisasi array ID.
     */
    private function normalizeIds(
        mixed $values,
        string $field
    ): array {
        if (!is_array($values)) {
            throw new RuntimeException(
                "Format {$field} harus berupa array."
            );
        }

        $ids = [];

        foreach ($values as $value) {
            if (!is_scalar($value)) {
                throw new RuntimeException(
                    "ID pada {$field} tidak valid."
                );
            }

            $id = filter_var($value, FILTER_VALIDATE_INT);

            if ($id === false || $id < 1) {
                throw new RuntimeException(
                    "ID pada {$field} harus berupa bilangan positif."
                );
            }

            $ids[] = (int) $id;
        }

        return array_values(array_unique($ids));
    }

    /**
     * Validasi status transaksi dan commit.
     */
    private function commitTransaction(string $message): void
    {
        if ($this->db->transStatus() === false) {
            throw new RuntimeException($message);
        }

        if (!$this->db->transCommit()) {
            throw new RuntimeException($message);
        }
    }
}
