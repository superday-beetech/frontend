<?php

declare(strict_types=1);

namespace Modules\Pharmacy\Services;

use Modules\Pharmacy\Exceptions\DomainException;

class ProductImageService
{
    private const MAX_SIZE = 2 * 1024 * 1024; // 2MB
    private const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp'];
    private const TEMP_PATH = 'uploads/products/temp';

    public function upload($file): array
    {
        if (!$file || !$file->isValid() || $file->hasMoved()) {
            throw DomainException::badRequest('File gambar tidak valid.');
        }

        if ($file->getSize() > self::MAX_SIZE) {
            throw DomainException::validation('Ukuran gambar maksimal 2MB.');
        }

        if (!in_array($file->getMimeType(), self::ALLOWED_MIME, true)) {
            throw DomainException::validation(
                'Format gambar harus JPG, PNG, atau WEBP.'
            );
        }

        $path = WRITEPATH . self::TEMP_PATH;

        if (!is_dir($path)) {
            mkdir($path, 0775, true);
        }

        $filename = $file->getRandomName();
        $file->move($path, $filename);

        return [
            'filename' => $filename,
            'url' => '/' . self::TEMP_PATH . '/' . $filename,
        ];
    }

    public function delete(string $filename): void
    {
        $filename = basename($filename);

        if ($filename === '') {
            throw DomainException::badRequest('Nama file tidak valid.');
        }

        $path = WRITEPATH . self::TEMP_PATH . '/' . $filename;

        if (is_file($path)) {
            unlink($path);
        }
    }
}
