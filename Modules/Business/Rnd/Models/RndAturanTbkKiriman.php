<?php

namespace Modules\Business\Rnd\Models;

use App\Models\BaseModel;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class RndAturanTbkKiriman extends BaseModel
{
    protected $table = 'rnd_aturan_tbk_kiriman';

    protected $fillable = [
        'aturan_id',
        'no_surat_kiriman',
        'nomor_kendaraan',
        'nama_sopir',
        'dari',
    ];

    public function aturan(): BelongsTo
    {
        return $this->belongsTo(
            RndAturanTbk::class,
            'aturan_id'
        );
    }

    public function details(): HasMany
    {
        return $this->hasMany(
            RndAturanTbkKirimanDetail::class,
            'kiriman_id'
        );
    }
}