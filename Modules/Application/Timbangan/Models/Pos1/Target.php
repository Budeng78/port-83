<?php

namespace Modules\Application\Timbangan\Models\Pos1;

use App\Models\BaseModel;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Target extends BaseModel
{
    protected $table = 'timbangan_pos1_target';

    protected $fillable = [
        'kode_batch',
        'tanggal',
        'status',
    ];

    protected $casts = [
        'tanggal' => 'date',
    ];


    /**
     * Target memiliki banyak aturan
     */
    public function aturan(): HasMany
    {
        return $this->hasMany(
            TargetAturan::class,
            'target_id'
        );
    }
}