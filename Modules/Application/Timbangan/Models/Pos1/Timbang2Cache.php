<?php

namespace Modules\Application\Timbangan\Models\Pos1;

use App\Models\BaseModel;

class Timbang2Cache extends BaseModel
{
    protected $table = 'timbangan_pos1_timbang2_cache';

    protected $fillable = [
        'target_id',
        'target_aturan_detail_id',
        'nomor_karung',
        'berat_kotor',
    ];

    protected $casts = [
        'nomor_karung' => 'integer',
        'berat_kotor' => 'decimal:2',
    ];
}