<?php

namespace Modules\Application\Timbangan\Models\Pos1;

use App\Models\BaseModel;

class Pos1Timbang1 extends BaseModel
{
    protected $table = 'timbangan_pos1_timbang1';

    protected $fillable = [
        'id', // PERBAIKAN: Masukkan id ke fillable
        'target_id',
        'nomor_bal',
        'berat_kotor',
    ];

    protected $casts = [
        'nomor_bal'   => 'integer',
        'berat_kotor' => 'decimal:2',
    ];

    public function target()
    {
        return $this->belongsTo(Target::class, 'target_id');
    }
}