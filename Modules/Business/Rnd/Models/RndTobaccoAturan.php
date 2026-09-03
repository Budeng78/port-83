<?php

namespace Modules\Business\Rnd\Models;

use App\Models\BaseModel;
use Illuminate\Database\Eloquent\Relations\HasMany;

class RndTobaccoAturan extends BaseModel
{
    protected $table = 'rnd_tobacco_aturan';

    protected $fillable = [
        'kode_aturan',
        'tanggal_aturan',
    ];

    protected $casts = [
        'tanggal_aturan' => 'date',
    ];

    public function details(): HasMany
    {
        return $this->hasMany(
            RndTobaccoAturanDetail::class,
            'aturan_id'
        );
    }
}