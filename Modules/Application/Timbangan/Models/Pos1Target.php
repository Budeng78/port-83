<?php

namespace Modules\Application\Timbangan\Models;

use App\Models\BaseModel;

class Pos1Target extends BaseModel
{
    protected $table = 'timbangan_pos1_target';

    protected $fillable = [
        'tanggal',
        'nomor_aturan',
        'jenis_tbk',
        's_k',
        'jumlah_bal',
    ];

    protected $casts = [
        'tanggal'    => 'date',
        'jumlah_bal' => 'integer',
    ];

    public function cache()
    {
        return $this->hasMany(
            Pos1Timbang1Cache::class,
            'target_id'
        );
    }

    public function timbang1()
    {
        return $this->hasMany(
            Pos1Timbang1::class,
            'target_id'
        );
    }
}
