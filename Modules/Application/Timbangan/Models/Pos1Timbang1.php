<?php

namespace Modules\Application\Timbangan\Models;

use App\Models\BaseModel;

class Pos1Timbang1 extends BaseModel
{
    protected $table = 'timbangan_pos1_timbang1';

    protected $fillable = [
        'target_id',
        'nomor_bal',
        'berat_kotor',
    ];

    protected $casts = [
        'nomor_bal'   => 'integer',
        'berat_kotor' => 'decimal:3',
    ];

    public function target()
    {
        return $this->belongsTo(Pos1Target::class, 'target_id');
    }
}

