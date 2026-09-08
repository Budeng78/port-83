<?php

namespace Modules\Application\Timbangan\Models\Pos1;

use App\Models\BaseModel;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TargetAturanDetail extends BaseModel
{
    protected $table = 'timbangan_pos1_target_aturan_detail';

    protected $fillable = [
        'target_aturan_id',
        'type',
        'jenis_tbk',
        'tahun',
        'grade',
        's_k',
        'jumlah_bal',
        'berat_bruto',
        'tara',
    ];

    protected $casts = [
        'tara' => 'decimal:2',
        'berat_bruto' => 'decimal:2',
    ];


    /**
     * Detail berada dalam satu aturan
     */
    public function targetAturan(): BelongsTo
    {
        return $this->belongsTo(
            TargetAturan::class,
            'target_aturan_id'
        );
    }
}