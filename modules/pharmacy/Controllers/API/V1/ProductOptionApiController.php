<?php

declare(strict_types=1);

namespace Modules\Pharmacy\Controllers\API\V1;

use App\Core\ApiController;
use Modules\Pharmacy\Models\Master\DrugClassModel;
use Modules\Pharmacy\Models\Master\DosageFormModel;
use Throwable;

class ProductOptionApiController extends ApiController
{
    private DrugClassModel $drugClassModel;
    private DosageFormModel $dosageFormModel;

    public function initController($request, $response, $logger)
    {
        parent::initController($request, $response, $logger);

        $this->drugClassModel   = new DrugClassModel();
        $this->dosageFormModel  = new DosageFormModel();
    }

    /**
     * GET /pharmacy/product-option-api
     *
     * Mengembalikan opsi statis untuk form produk:
     * - drug_classes : golongan obat
     * - dosage_forms : bentuk sediaan
     */
    public function index()
    {
        try {
            $drugClasses = $this->drugClassModel->getOptions();
            $dosageForms = $this->dosageFormModel->getOptions();

            return $this->successResponse([
                'drug_classes' => $drugClasses,
                'dosage_forms' => $dosageForms,
            ], 'Opsi produk berhasil diambil.');
        } catch (Throwable $e) {
            log_message(
                'error',
                '[ProductOptionApiController::index] ' . $e->getMessage()
            );

            return $this->errorResponse(
                'Gagal mengambil opsi produk.',
                500
            );
        }
    }
}
