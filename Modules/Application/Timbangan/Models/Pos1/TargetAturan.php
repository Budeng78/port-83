<?php

namespace Modules\Application\Timbangan\Models\Pos1;

use App\Models\BaseModel;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TargetAturan extends BaseModel
{
    protected $table = 'timbangan_pos1_target_aturan';

    protected $fillable = [
        'target_id',
        'nomor_aturan',
    ];


    /**
     * Aturan berada dalam satu target
     */
    public function target(): BelongsTo
    {
        return $this->belongsTo(
            Target::class,
            'target_id'
        );
    }


    /**
     * Aturan memiliki banyak detail
     */
    public function detail(): HasMany
    {
        return $this->hasMany(
            TargetAturanDetail::class,
            'target_aturan_id'
        );
    }
}