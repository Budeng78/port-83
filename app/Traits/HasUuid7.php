<?php

namespace App\Traits;

use Illuminate\Support\Str;

trait HasUuid7
{
    /**
     * Inisialisasi properti model untuk UUID.
     */
    public function initializeHasUuid7()
    {
        $this->incrementing = false;
        $this->keyType = 'string';
    }

    /**
     * Booting event untuk otomatis menghasilkan UUIDv7 saat data dibuat.
     */
    protected static function bootHasUuid7()
    {
        static::creating(function ($model) {
            if (empty($model->{$model->getKeyName()})) {
                $model->{$model->getKeyName()} = (string) Str::orderedUuid();
            }
        });
    }
}