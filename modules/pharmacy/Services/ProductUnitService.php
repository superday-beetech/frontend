<?php

declare(strict_types=1);

namespace Modules\Pharmacy\Services;

use Config\Database;
use RuntimeException;

class ProductUnitService
{
    protected $db;

    public function __construct()
    {
        $this->db = Database::connect('pharmacy');
    }

    /**
     * Mengambil seluruh satuan aktif milik produk.
     */
    public function getProductUnits(int $productId): array
    {
        return $this->db->table('product_units pu')
            ->select([
                'pu.id',
                'pu.product_id',
                'pu.unit_id',
                'pu.conversion_factor',
                'pu.barcode',
                'pu.is_base',
                'pu.is_purchase_unit',
                'pu.is_sale_unit',
                'pu.is_active',
                'pu.sort_order',
                'u.name AS unit_name',
                'u.abbreviation',
            ])
            ->join('units u', 'u.id = pu.unit_id')
            ->where('pu.product_id', $productId)
            ->where('pu.is_active', 1)
            ->orderBy('pu.is_base', 'DESC')
            ->orderBy('pu.sort_order', 'ASC')
            ->get()
            ->getResultArray();
    }

    /**
     * Mengambil satuan dasar produk.
     */
    public function getBaseUnit(int $productId): array
    {
        $unit = $this->db->table('product_units pu')
            ->select([
                'pu.*',
                'u.name AS unit_name',
                'u.abbreviation',
            ])
            ->join('units u', 'u.id = pu.unit_id')
            ->where('pu.product_id', $productId)
            ->where('pu.is_base', 1)
            ->where('pu.is_active', 1)
            ->get()
            ->getRowArray();

        if (!$unit) {
            throw new RuntimeException(
                "Produk ID {$productId} belum memiliki satuan dasar aktif."
            );
        }

        return $unit;
    }

    /**
     * Validasi dan mengambil satuan produk berdasarkan tujuan.
     *
     * $purpose:
     * - purchase
     * - sale
     * - null
     */
    public function resolveUnit(
        int $productId,
        int $unitId,
        ?string $purpose = null
    ): array {
        if ($productId <= 0 || $unitId <= 0) {
            throw new RuntimeException('Produk atau satuan tidak valid.');
        }

        $builder = $this->db->table('product_units pu')
            ->select([
                'pu.*',
                'u.name AS unit_name',
                'u.abbreviation',
            ])
            ->join('units u', 'u.id = pu.unit_id')
            ->where('pu.product_id', $productId)
            ->where('pu.unit_id', $unitId)
            ->where('pu.is_active', 1);

        if ($purpose === 'purchase') {
            $builder->where('pu.is_purchase_unit', 1);
        } elseif ($purpose === 'sale') {
            $builder->where('pu.is_sale_unit', 1);
        } elseif ($purpose !== null) {
            throw new RuntimeException(
                'Tujuan penggunaan satuan tidak valid.'
            );
        }

        $unit = $builder->get()->getRowArray();

        if (!$unit) {
            throw new RuntimeException(
                "Satuan ID {$unitId} tidak tersedia untuk produk ID {$productId}."
            );
        }

        if ((float) $unit['conversion_factor'] <= 0) {
            throw new RuntimeException(
                'Faktor konversi satuan tidak valid.'
            );
        }

        return $unit;
    }

    /**
     * Kuantitas transaksi ke satuan dasar.
     */
    public function toBaseQuantity(
        float $quantity,
        float $conversionFactor
    ): float {
        if ($quantity <= 0 || $conversionFactor <= 0) {
            throw new RuntimeException(
                'Kuantitas atau faktor konversi tidak valid.'
            );
        }

        return round($quantity * $conversionFactor, 3);
    }

    /**
     * Kuantitas satuan dasar ke satuan transaksi.
     */
    public function fromBaseQuantity(
        float $baseQuantity,
        float $conversionFactor
    ): float {
        if ($baseQuantity < 0 || $conversionFactor <= 0) {
            throw new RuntimeException(
                'Kuantitas atau faktor konversi tidak valid.'
            );
        }

        return round($baseQuantity / $conversionFactor, 6);
    }

    /**
     * Harga satuan transaksi ke harga satuan dasar.
     */
    public function toBasePrice(
        float $unitPrice,
        float $conversionFactor
    ): float {
        if ($unitPrice < 0 || $conversionFactor <= 0) {
            throw new RuntimeException(
                'Harga atau faktor konversi tidak valid.'
            );
        }

        return round($unitPrice / $conversionFactor, 6);
    }

    /**
     * Harga satuan dasar ke harga satuan transaksi.
     */
    public function fromBasePrice(
        float $basePrice,
        float $conversionFactor
    ): float {
        if ($basePrice < 0 || $conversionFactor <= 0) {
            throw new RuntimeException(
                'Harga atau faktor konversi tidak valid.'
            );
        }

        return round($basePrice * $conversionFactor, 6);
    }
}
