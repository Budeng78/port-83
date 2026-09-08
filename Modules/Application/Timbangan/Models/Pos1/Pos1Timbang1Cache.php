<?php

namespace Modules\Application\Timbangan\Models\Pos1;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Pos1Timbang1Cache extends Model
{
    use HasUuids;

    protected $table = 'timbangan_pos1_timbang1_cache';

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'id',
        'kode_batch',
        'nomor_bal',
        'berat_kotor',
    ];

    protected $casts = [
        'nomor_bal'   => 'integer',
        'berat_kotor' => 'decimal:2',
    ];

    /**
     * Override UUID generator bawaan Laravel
     * agar menggunakan UUIDv7.
     */
    public function newUniqueId(): string
    {
        return (string) Str::uuid7();
    }
}