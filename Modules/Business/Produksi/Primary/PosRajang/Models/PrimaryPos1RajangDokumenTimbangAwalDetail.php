<?php

namespace Modules\Business\Produksi\Primary\PosRajang\Models;

use App\Models\BaseModel;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PrimaryPos1RajangDokumenTimbangAwalDetail extends BaseModel
{
    protected $table = 'primary_pos1_rajang_dokumen_timbang_awal_detail';

    protected $fillable = [
        'dokumen_timbang_awal_id',
        'nomor_tally',
        'berat_bruto',
        'tara',
        'berat_netto',
        'waktu_timbang',
    ];

    protected $casts = [
        'nomor_tally' => 'integer',
        'berat_bruto' => 'decimal:2',
        'tara' => 'decimal:2',
        'berat_netto' => 'decimal:2',
        'waktu_timbang' => 'datetime',
    ];

    /**
     * Header dokumen timbang.
     */
    public function dokumenTimbangAwal(): BelongsTo
    {
        return $this->belongsTo(
            PrimaryPos1RajangDokumenTimbangAwal::class,
            'dokumen_timbang_awal_id'
        );
    }
}