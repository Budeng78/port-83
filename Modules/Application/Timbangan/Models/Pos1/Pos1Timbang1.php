<?php

namespace Modules\Application\Timbangan\Models\Pos1;

use App\Models\BaseModel;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Pos1Timbang1 extends BaseModel
{
    protected $table = 'timbangan_pos1_timbang1';

    protected $fillable = [
        'id',
        'target_id',
        'target_aturan_detail_id',
        'nomor_bal',
        'berat_kotor',
        'status_rajang',
    ];

    protected $casts = [
        'nomor_bal'   => 'integer',
        'berat_kotor' => 'decimal:3',
    ];

    /**
     * Hasil timbang berada dalam satu Target.
     */
    public function target(): BelongsTo
    {
        return $this->belongsTo(
            Target::class,
            'target_id'
        );
    }

    /**
     * Hasil timbang berada dalam satu Detail Aturan.
     */
    public function targetAturanDetail(): BelongsTo
    {
        return $this->belongsTo(
            TargetAturanDetail::class,
            'target_aturan_detail_id'
        );
    }
}
