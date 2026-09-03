<?php

namespace Modules\Business\Rnd\Models;

use App\Models\BaseModel;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RndAturanTbkKirimanDetail extends BaseModel
{
    protected $table = 'rnd_aturan_tbk_kiriman_detail';

    protected $fillable = [
        'kiriman_id',
        'aturan_detail_id',
        'type',
        'jumlah_pack',
        'tara',
    ];

    protected $casts = [
        'jumlah_pack' => 'integer',
        'tara'        => 'decimal:3',
    ];

    public function kiriman(): BelongsTo
    {
        return $this->belongsTo(
            RndAturanTbkKiriman::class,
            'kiriman_id'
        );
    }

    public function aturanDetail(): BelongsTo
    {
        return $this->belongsTo(
            RndAturanTbkDetail::class,
            'aturan_detail_id'
        );
    }
}