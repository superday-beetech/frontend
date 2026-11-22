<?php

declare(strict_types=1);

namespace Modules\Pharmacy\Exceptions;

use RuntimeException;
use Throwable;

class DomainException extends RuntimeException
{
    private int $statusCode;
    private array $errors;

    public function __construct(
        string $message,
        int $statusCode = 422,
        array $errors = [],
        ?Throwable $previous = null
    ) {
        parent::__construct($message, 0, $previous);
        $this->statusCode = $statusCode;
        $this->errors = $errors;
    }

    public function getStatusCode(): int
    {
        return $this->statusCode;
    }

    public function getErrors(): array
    {
        return $this->errors;
    }

    public static function notFound(string $message): self
    {
        return new self($message, 404);
    }

    public static function conflict(string $message): self
    {
        return new self($message, 409);
    }

    public static function validation(string $message, array $errors = []): self
    {
        return new self($message, 422, $errors);
    }

    public static function badRequest(string $message): self
    {
        return new self($message, 400);
    }
}
