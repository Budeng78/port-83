<?php

namespace Modules\Application\Timbangan\Models\Pos1;

use App\Models\BaseModel;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Pos1Timbang1Cache extends BaseModel
{
    protected $table = 'timbangan_pos1_timbang1_cache';

    protected $fillable = [
        'id',
        'target_id',
        'target_aturan_detail_id',
        'nomor_bal',
        'berat_kotor',
    ];

    protected $casts = [
        'nomor_bal'   => 'integer',
        'berat_kotor' => 'decimal:3',
    ];

    /**
     * Cache berada dalam satu Target.
     */
    public function target(): BelongsTo
    {
        return $this->belongsTo(
            Target::class,
            'target_id'
        );
    }

    /**
     * Cache berada dalam satu Detail Aturan.
     */
    public function targetAturanDetail(): BelongsTo
    {
        return $this->belongsTo(
            TargetAturanDetail::class,
            'target_aturan_detail_id'
        );
    }
}
