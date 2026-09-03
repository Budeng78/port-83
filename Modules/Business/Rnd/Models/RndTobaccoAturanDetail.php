<?php

namespace Modules\Business\Rnd\Models;

use App\Models\BaseModel;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RndTobaccoAturanDetail extends BaseModel
{
    protected $table = 'rnd_tobacco_aturan_detail';

    protected $fillable = [
        'aturan_id',
        'type',
        'no',
        'gdg',
        'jenis_tembakau',
        'tahun',
        's_k',
        'grade',
        'rencana',
    ];

    protected $casts = [
        'tahun' => 'integer',
        'rencana' => 'decimal:2',
    ];

    public function aturan(): BelongsTo
    {
        return $this->belongsTo(
            RndTobaccoAturan::class,
            'aturan_id'
        );
    }

    public function details(): HasMany
    {
        return $this->hasMany(
            RndTobaccoAturanDetail::class,
            'aturan_id'
        );
    }
}