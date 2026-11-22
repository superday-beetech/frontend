<?php

declare(strict_types=1);

namespace Modules\Pharmacy\Services;

use Modules\Pharmacy\Exceptions\DomainException;
use Modules\Pharmacy\Repositories\ProductPriceRepository;
use Modules\Pharmacy\Repositories\ProductUnitRepository;

class ProductPriceService
{
    public function __construct(
        private ProductPriceRepository $prices = new ProductPriceRepository(),
        private ProductUnitRepository $units = new ProductUnitRepository()
    ) {
    }

    /**
     * Sinkronisasi seluruh harga aktif produk.
     *
     * Array kosong berarti menutup seluruh harga aktif.
     */
    public function saveMany(int $productId, array $prices): void
    {
        $keepIds = [];

        foreach ($prices as $item) {
            if (!is_array($item)) {
                throw DomainException::validation(
                    'Format harga produk tidak valid.'
                );
            }

            $unitId = (int) ($item['unit_id'] ?? 0);
            $price = (float) ($item['price'] ?? -1);
            $minQty = (float) ($item['min_qty'] ?? 0);

            if ($unitId <= 0 || $price < 0 || $minQty <= 0) {
                throw DomainException::validation(
                    'Satuan, harga, dan minimum jumlah harus valid.'
                );
            }

            if (!$this->units->findActiveByProductAndUnit($productId, $unitId)) {
                throw DomainException::validation(
                    "Satuan ID {$unitId} tidak aktif pada produk ini."
                );
            }

            $customerType = $item['customer_type'] ?? null;
            $customerType = $customerType !== null && $customerType !== ''
                ? trim((string) $customerType)
                : null;

            $validFrom = $this->normalizeDate(
                $item['valid_from'] ?? date('Y-m-d H:i:s')
            );

            $current = $this->prices->findActiveByKey(
                $productId,
                $unitId,
                $customerType,
                $minQty
            );

            // Harga sama: pertahankan record aktif.
            if ($current && (float) $current['price'] === $price) {
                $keepIds[] = (int) $current['id'];
                continue;
            }

            if ($current) {
                $oldValidFrom = $this->normalizeDate($current['valid_from']);

                if ($validFrom <= $oldValidFrom) {
                    throw DomainException::validation(
                        'Tanggal mulai harga baru harus lebih besar '
                        . 'dari tanggal mulai harga sebelumnya.'
                    );
                }

                // Tutup versi lama tepat ketika versi baru mulai berlaku.
                $this->prices->closeById(
                    (int) $current['id'],
                    $validFrom
                );
            }

            $newId = $this->prices->insert([
                'product_id'    => $productId,
                'unit_id'       => $unitId,
                'customer_type' => $customerType,
                'min_qty'       => $minQty,
                'price'         => $price,
                'valid_from'    => $validFrom,
                'valid_to'      => null,
                'is_active'     => 1,
            ]);

            if ($newId <= 0) {
                throw new \RuntimeException(
                    'Gagal menyimpan versi harga produk.'
                );
            }

            $keepIds[] = $newId;
        }

        // Tutup harga aktif yang tidak lagi ada dalam payload.
        foreach ($this->prices->getActiveByProductId($productId) as $row) {
            $id = (int) $row['id'];

            if (in_array($id, $keepIds, true)) {
                continue;
            }

            $oldValidFrom = $this->normalizeDate($row['valid_from']);
            $now = date('Y-m-d H:i:s');

            // Untuk harga terjadwal, jangan membuat valid_to
            // lebih awal daripada valid_from.
            $validTo = $now > $oldValidFrom ? $now : $oldValidFrom;

            $this->prices->closeById($id, $validTo);
        }
    }

    /**
     * Menutup harga aktif untuk satuan yang dinonaktifkan.
     * Riwayat harga tetap dipertahankan.
     */
    public function closeForUnits(int $productId, array $unitIds): void
    {
        $unitIds = array_values(array_unique(array_filter(
            array_map('intval', $unitIds),
            static fn (int $id): bool => $id > 0
        )));

        if ($unitIds === []) {
            return;
        }

        $now = date('Y-m-d H:i:s');

        foreach ($this->prices->getActiveByProductId($productId) as $row) {
            if (!in_array((int) $row['unit_id'], $unitIds, true)) {
                continue;
            }

            $validFrom = $this->normalizeDate($row['valid_from']);
            $validTo = $now > $validFrom ? $now : $validFrom;

            $this->prices->closeById((int) $row['id'], $validTo);
        }
    }

    private function normalizeDate(string $value): string
    {
        try {
            $date = new \DateTimeImmutable($value);
        } catch (\Throwable $e) {
            throw DomainException::validation(
                'Format tanggal berlaku harga tidak valid.'
            );
        }

        return $date->format('Y-m-d H:i:s');
    }
}
